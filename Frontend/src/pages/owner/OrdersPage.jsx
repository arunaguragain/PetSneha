import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Card, Skeleton } from '../../components/ui';
import { cancelOrder, getOrders } from '../../api/shop.api';
import { formatCurrency, formatDate, getErrorMessage, getStatusTone, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ChevronDown, ChevronUp, Package, ShoppingBag } from 'lucide-react';

const cancellableStatuses = new Set(['placed', 'processing', 'shipped']);

const statusClasses = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
};

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        setOrders(unwrapItems(response));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [addToast]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  const handleCancel = async (orderId) => {
    try {
      const response = await cancelOrder(orderId);
      const cancelledOrder = response?.data?.order || response?.data?.data?.order || response?.data?.item || response?.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? { ...order, status: cancelledOrder?.status || 'cancelled' } : order))
      );
      addToast('Order cancelled and stock restored.', 'success');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>
              My Orders
            </h1>
            <p className="text-sm text-[#64748B] mt-1">Review your previous purchases, track status, and cancel eligible orders.</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue shopping
          </button>
        </div>

        {loading ? (
          <OrdersSkeleton />
        ) : totalOrders === 0 ? (
          <Card className="border border-dashed border-[#BFDBFE] bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#0046CE]">
              <Package className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1E293B]">No orders yet</h2>
            <p className="mt-2 text-sm text-[#64748B]">Your recent purchases will appear here once you place an order.</p>
            <Link
              to="/shop"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0046CE] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse the shop
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = String(order.status || '').toLowerCase();
              const canCancel = cancellableStatuses.has(status);
              const isExpanded = expandedOrderId === order._id;
              const statusTone = getStatusTone(status);

              return (
                <Card key={order._id} className="overflow-hidden border border-[#E2E8F0] bg-white shadow-sm">
                  <div className="flex flex-col gap-4 p-5 hover:bg-[#FAFBFD] sm:flex-row sm:items-start sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-[#1E293B]">Order {order.orderNumber || order._id}</h2>
                          <Badge className={`border ${statusClasses[statusTone] || statusClasses.neutral} capitalize`}>
                            {status || 'placed'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#64748B]">
                          <span>{formatDate(order.createdAt)}</span>
                          <span>{order.items?.length ?? 0} item(s)</span>
                          <span>{formatCurrency(order.total ?? order.totalAmount ?? 0)}</span>
                        </div>
                        <p className="text-sm text-[#64748B]">
                          Delivery fee {formatCurrency(order.deliveryFee ?? 0)} • Payment {String(order.paymentMethod || 'cod').toUpperCase()}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 self-start">
                      {canCancel ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(order._id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Cancel order
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="rounded-full p-2 text-[#64748B] hover:bg-[#EEF2F7]"
                        aria-label={isExpanded ? 'Collapse order details' : 'Expand order details'}
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="border-t border-[#E2E8F0] bg-[#FAFBFD] p-5">
                      <div className="grid gap-3 md:grid-cols-2">
                        {order.items?.map((item, index) => (
                          <div key={`${order._id}-${index}`} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-[#1E293B]">{item.name || 'Product'}</p>
                                <p className="mt-1 text-sm text-[#64748B]">Qty {item.quantity}</p>
                              </div>
                              <div className="text-right text-sm font-semibold text-[#0046CE]">{formatCurrency(item.price)}</div>
                            </div>
                            <div className="mt-3 text-sm text-[#64748B]">Line total {formatCurrency((item.price || 0) * (item.quantity || 0))}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}