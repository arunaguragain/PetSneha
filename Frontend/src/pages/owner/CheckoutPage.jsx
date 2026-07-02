import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { placeOrder } from '../../api/shop.api';
import { formatCurrency, getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Minus, Plus, Trash2, Banknote } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', area: '', paymentMethod: 'cod', notes: '' });
  const [step, setStep] = useState(2); // Default to delivery step based on UI design
  
  // Mock cart data
  const cartItems = [
    { id: 1, name: 'Premium Royal Canin Diet', category: 'Dogs • Verified Seller', price: 3200, qty: 1 }
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await placeOrder({ items: cartItems, ...form });
      addToast('Order placed!', 'success');
      navigate('/dashboard');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = 150;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 mt-6 mb-8">
          {/* Step 1 */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              1
            </div>
            <span className={`font-medium ${step >= 1 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>Cart</span>
          </div>
          
          <div className="flex-1 h-px bg-[#E2E8F0]"></div>
          
          {/* Step 2 */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              2
            </div>
            <span className={`font-medium ${step >= 2 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>Delivery</span>
          </div>
          
          <div className="flex-1 h-px bg-[#E2E8F0]"></div>
          
          {/* Step 3 */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${step >= 3 ? 'bg-[#0046CE] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
              3
            </div>
            <span className={`font-medium ${step >= 3 ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>Confirm</span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* Left — Cart */}
          <div>
            <h2 className="text-base font-semibold text-[#1E293B]">Your cart ({cartItems.length} items)</h2>
            
            {/* Cart items list */}
            <div className="space-y-3 mt-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3">
                  <img src="/happy-puppy.png" alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-[#F1F5F9]" />
                  
                  <div>
                    <div className="font-medium text-sm text-[#1E293B] truncate max-w-[150px]">{item.name}</div>
                    <div className="text-xs text-[#64748B]">{item.category}</div>
                    <div className="text-sm font-semibold text-[#0046CE] mt-0.5">NPR {item.price}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <button type="button" className="w-6 h-6 border border-[#E2E8F0] rounded flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium text-[#1E293B] w-4 text-center">{item.qty}</span>
                    <button type="button" className="w-6 h-6 border border-[#E2E8F0] rounded flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button type="button" className="text-red-400 hover:text-red-600 transition ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Subtotals section */}
            <div className="mt-4 border-t border-[#E2E8F0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Subtotal</span>
                <span className="text-[#1E293B]">NPR {subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Delivery (Kathmandu valley)</span>
                <span className="text-[#1E293B]">NPR {deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base mt-2">
                <span className="font-semibold text-[#1E293B]">Total</span>
                <span className="font-semibold text-[#1E293B]">NPR {total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#1E293B]">Payment Method:</h3>
              <div className="mt-2">
                <div className="bg-[#EFF6FF] border border-[#0046CE] text-[#0046CE] px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 font-medium cursor-pointer">
                  <Banknote className="w-4 h-4" /> Cash on Delivery
                </div>
              </div>
            </div>
          </div>

          {/* Right — Delivery Details */}
          <div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-[#1E293B]">Delivery Details</h2>
                <span className="text-xs text-[#0046CE] cursor-pointer hover:underline">edit</span>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                
                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">Full name*</label>
                  <input 
                    type="text" 
                    required 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">Phone number*</label>
                  <input 
                    type="tel" 
                    required 
                    value={form.phone} 
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">Email</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">Delivery address*</label>
                  <input 
                    type="text" 
                    required 
                    value={form.address} 
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-[#64748B] uppercase tracking-wide mb-1">Delivery area</label>
                  <input 
                    type="text" 
                    value={form.area} 
                    onChange={(e) => setForm({...form, area: e.target.value})}
                    placeholder="e.g. Lazimpat"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0046CE]" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-semibold mt-6 transition disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate('/shop')}
                  className="w-full border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-lg py-3 text-sm mt-2 transition"
                >
                  Cancel
                </button>
                
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}