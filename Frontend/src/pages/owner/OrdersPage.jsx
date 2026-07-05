import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Card, Modal, Skeleton } from '../../components/ui';
import { cancelOrder, getOrders } from '../../api/shop.api';
import { formatCurrency, formatDate, getErrorMessage, getStatusTone, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Package, ShoppingBag } from 'lucide-react';

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
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      <div className="max-w-[1440px] mx-auto px-8 py-10">
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
              const statusTone = getStatusTone(status);

              return (
                <Card
                  key={order._id}
                  className="overflow-hidden border border-[#E2E8F0] bg-white shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col gap-4 p-5 hover:bg-[#FAFBFD] sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 text-left">
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
                    </div>

                    <div className="flex items-center gap-3 self-start">
                      {canCancel ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCancel(order._id);
                          }}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Cancel order
                        </button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        size="lg"
        title={selectedOrder ? `Order ${selectedOrder.orderNumber || selectedOrder._id}` : 'Order details'}
      >
        {selectedOrder ? (
          <div className="px-6 pb-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFD] p-4 space-y-2 text-sm text-[#475569]">
                <p><span className="font-semibold text-[#1E293B]">Status:</span> {selectedOrder.status || 'placed'}</p>
                <p><span className="font-semibold text-[#1E293B]">Payment:</span> {String(selectedOrder.paymentMethod || 'cod').toUpperCase()}</p>
                <p><span className="font-semibold text-[#1E293B]">Created:</span> {formatDate(selectedOrder.createdAt)}</p>
                <p><span className="font-semibold text-[#1E293B]">Updated:</span> {formatDate(selectedOrder.updatedAt)}</p>
                <p><span className="font-semibold text-[#1E293B]">Total:</span> {formatCurrency(selectedOrder.total ?? selectedOrder.totalAmount ?? 0)}</p>
              </div>
              {selectedOrder.deliveryAddress ? (
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFD] p-4 text-sm text-[#475569] space-y-1">
                  <p className="font-semibold text-[#1E293B]">Delivery address</p>
                  <p>{selectedOrder.deliveryAddress.fullName}</p>
                  <p>{selectedOrder.deliveryAddress.phone}</p>
                  <p>{selectedOrder.deliveryAddress.email}</p>
                  <p>{selectedOrder.deliveryAddress.address}</p>
                  <p>{selectedOrder.deliveryAddress.area}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => {
                  const product = item.productId || {};
                  const imageSrc = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
                  const seller = product.sellerId || {};

                  return (
                    <div key={`${selectedOrder._id}-${index}`} className="flex gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F1F5F9]">
                        {imageSrc ? (
                          <img src={imageSrc} alt={product.name || item.name || 'Product'} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">📰</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#1E293B]">{product.name || item.name || `Product #${index + 1}`}</p>
                            <p className="text-sm text-[#64748B]">Qty {item.quantity}</p>
                            {seller.name ? <p className="text-xs text-[#64748B] mt-1">Seller: {seller.name}{seller.phone ? ` · ${seller.phone}` : ''}</p> : null}
                          </div>
                          <p className="text-sm font-semibold text-[#0046CE]">{formatCurrency(item.price)}</p>
                        </div>
                        <p className="mt-2 text-sm text-[#64748B]">Line total {formatCurrency((item.price || 0) * (item.quantity || 0))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}