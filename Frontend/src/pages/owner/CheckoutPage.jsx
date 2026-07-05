import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { placeOrder } from '../../api/shop.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { Banknote, Minus, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ConfirmationOverlay, Button } from '../../components/ui';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { items: cartItems, removeItem, updateQty, clearCart, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const submittingRef = useRef(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    paymentMethod: 'cod',
    notes: '',
  });
  const step = 2;

  useEffect(() => {
    if (loading || orderPlaced) {
      return;
    }

    if (cartItems.length === 0) {
      addToast(t('checkout.emptyCartMessage'), 'info');
      navigate('/shop');
    }
  }, [cartItems.length, navigate, addToast, t, loading, orderPlaced]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || orderPlaced || submittingRef.current) {
      return;
    }

    try {
      submittingRef.current = true;
      setLoading(true);
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await placeOrder({ items, ...form });
      setOrderPlaced(true);
      clearCart();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const deliveryFee = 150;
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0 && !orderPlaced) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-[24px] lg:px-[64px] pt-[32px] pb-[48px]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>
            {t('checkout.title')}
          </h1>
          <button
            onClick={() => navigate('/shop')} 
            className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              1
            </div>
            <span className={`font-medium ${step >= 1 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>{t('checkout.cart')}</span>
          </div>

          <div className="flex-1 h-px bg-[#E2E8F0]" />

          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              2
            </div>
            <span className={`font-medium ${step >= 2 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>{t('checkout.delivery')}</span>
          </div>

          <div className="flex-1 h-px bg-[#E2E8F0]" />

          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 3 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              3
            </div>
            <span className={`font-medium ${step >= 3 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>{t('checkout.confirm')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-base font-semibold text-[#1E293B]">
              {t('shop.yourCart')} ({cartItems.length} {t('shop.items')})
            </h2>

            <div className="space-y-3 mt-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3">
                  {item.image ? (
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5050'}${item.image}`}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-[#F1F5F9]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-lg">🛍️</div>
                  )}

                  <div>
                    <div className="font-medium text-sm text-[#1E293B] truncate max-w-[150px]">{item.name}</div>
                    <div className="text-sm font-semibold text-[#0046CE] mt-0.5">NPR {item.price}</div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-6 h-6 border border-[#E2E8F0] rounded flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium text-[#1E293B] w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-6 h-6 border border-[#E2E8F0] rounded flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400 hover:text-red-600 transition ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#E2E8F0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">{t('shop.subtotal')}</span>
                <span className="text-[#1E293B]">NPR {subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">{t('shop.deliveryFee')}</span>
                <span className="text-[#1E293B]">NPR {deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base mt-2">
                <span className="font-semibold text-[#1E293B]">{t('shop.total')}</span>
                <span className="font-semibold text-[#1E293B]">NPR {total}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#1E293B]">{t('shop.paymentMethod')}</h3>
              <div className="mt-2">
                <div className="bg-[#EFF6FF] border border-[#0046CE] text-[#0046CE] px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 font-medium cursor-pointer">
                  <Banknote className="w-4 h-4" /> {t('shop.cashOnDelivery')}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-[#1E293B]">{t('checkout.deliveryDetails')}</h2>
                <span className="text-xs text-[#0046CE] cursor-pointer hover:underline">{t('checkout.edit')}</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <fieldset disabled={loading || orderPlaced} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">{t('forms.fullName')}*</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">{t('forms.phoneNumber')}*</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">{t('forms.email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">{t('forms.deliveryAddress')}*</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">{t('forms.deliveryArea')}</label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="e.g. Lazimpat"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading || orderPlaced}
                    className="w-full bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-semibold mt-6 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? t('checkout.processing') : t('checkout.placeOrder')}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/shop')}
                    disabled={loading || orderPlaced}
                    className="w-full border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-lg py-3 text-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationOverlay
        open={orderPlaced}
        icon={<CheckCircle2 size={32} />}
        title="Order Confirmed!"
        description="Your order has been placed successfully and will be delivered soon."
        actions={(
          <>
            <Button type="button" onClick={() => navigate('/orders')} fullWidth>
              View My Orders
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/shop')} fullWidth>
              Continue Shopping
            </Button>
          </>
        )}
      />
    </div>
  );
}
