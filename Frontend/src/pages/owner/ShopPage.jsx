import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, Input, Skeleton } from '../../components/ui';
import { getProducts } from '../../api/shop.api';
import { formatCurrency, getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ArrowRight, ChevronDown } from 'lucide-react';

export default function ShopPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { addItem, itemCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getProducts({ search });
        const productsList = response.data?.products
          || response.data?.items
          || (Array.isArray(response.data) ? response.data : response || []);
        setProducts(productsList);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast, search]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Hero banner */}
        <div className="bg-[#EFF6FF] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
          <div>
            <span className="inline-block bg-[#0046CE] text-white text-xs px-2 py-0.5 rounded-full font-medium tracking-wide uppercase">BUDDY'S CHOICE</span>
            <h1 className="text-xl font-semibold text-[#1E293B] mt-2" style={{ fontFamily: 'Literata, serif' }}>
              Perfectly curated for your Golden Retriever
            </h1>
            <p className="text-sm text-[#64748B] mt-1">Based on Buddy's age, breed, and weight...</p>
            <button className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm mt-3 transition">
              Explore Buddy's Picks
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm text-center w-44 flex-shrink-0">
            <h3 className="text-sm font-semibold text-[#1E293B]">Exclusive Deals</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Save up to 30%...</p>
            <div className="text-4xl font-bold text-[#0046CE] mt-1">30%</div>
            <button className="w-8 h-8 rounded-full bg-[#0046CE] hover:bg-blue-700 text-white flex items-center justify-center mx-auto mt-2 transition">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select className="appearance-none bg-white border border-[#E2E8F0] rounded-lg pl-4 pr-10 py-2 text-sm text-[#1E293B] outline-none focus:border-[#0046CE]">
                <option value="">{t('shop.allCategories')}</option>
                <option value="food">Food & Treats</option>
                <option value="toys">Toys</option>
                <option value="health">Health & Wellness</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-[#E2E8F0] rounded-lg pl-4 pr-10 py-2 text-sm text-[#1E293B] outline-none focus:border-[#0046CE]">
                <option value="popular">{t('shop.popular')}</option>
                <option value="price_asc">{t('shop.priceAscending')}</option>
                <option value="price_desc">{t('shop.priceDescending')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <input 
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('shop.searchSupplies')}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#0046CE]"
            />
          </div>
        </div>

        {/* Browse All Supplies Header */}
        <div className="flex justify-between items-end mt-6 border-t border-[#E2E8F0] pt-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>
              {t('shop.browseAllSupplies')}
            </h2>
            <p className="text-sm text-[#64748B] mt-0.5">Premium quality products sourced for Nepalese pet owners.</p>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="hidden sm:flex items-center gap-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-lg px-4 py-2 text-sm transition relative"
          >
            <ShoppingCart className="w-4 h-4" /> {t('buttons.goToCheckout')}
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#0046CE] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-64 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <div 
                key={product._id} 
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition relative flex flex-col group cursor-pointer"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                {/* Image */}
                <div className="w-full h-40 bg-[#F1F5F9] relative flex items-center justify-center">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🛍️</div>
                  
                  {/* Optional badge mock - applying to every 3rd item just for design demo */}
                  {index % 3 === 0 && (
                    <div className="absolute top-2 left-2 bg-[#0046CE] text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-medium tracking-wide">
                      BUDDY'S CHOICE
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-3 flex flex-col flex-1">
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">
                    {product.category || 'Pet Supplies'}
                  </div>
                  <h3 className="text-sm font-semibold text-[#1E293B] mt-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2 min-h-[32px]">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="text-sm font-bold text-[#0046CE]">{formatCurrency(product.price)}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product, 1);
                        addToast(`${product.name} ${t('shop.savedToCart')}`, 'success');
                      }}
                      className="w-7 h-7 bg-[#EFF6FF] hover:bg-blue-100 rounded-full flex items-center justify-center text-[#0046CE] transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4 border border-dashed border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#64748B]">
              {t('shop.noProductsFound')}
            </div>
          )}
        </div>
        
        {/* Mobile checkout button */}
        <button 
          onClick={() => navigate('/checkout')}
          className="sm:hidden w-full mt-6 flex items-center justify-center gap-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-lg px-4 py-3 text-sm transition relative"
        >
          <ShoppingCart className="w-4 h-4" /> {t('buttons.goToCheckout')}
          {itemCount > 0 && (
            <span className="absolute right-4 bg-[#0046CE] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}