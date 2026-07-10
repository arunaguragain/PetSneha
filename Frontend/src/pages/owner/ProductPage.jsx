import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card } from '../../components/ui';
import { getProduct } from '../../api/shop.api';
import { formatCurrency, getErrorMessage, unwrapItem } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUrl';
import { ArrowLeft } from 'lucide-react';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getProduct(productId);
        setProduct(unwrapItem(response, 'product'));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast, productId]);

  if (loading) {
    return <Card className="p-8">{t('common.loading')}</Card>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end mb-4">
          <button onClick={() => navigate('/shop')} className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition">
            <ArrowLeft className="w-4 h-4" /> {t('buttons.backToShop', 'Back to Shop')}
          </button>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row gap-10">
          
          {/* Image Column */}
          <div className="w-full md:w-1/2 flex-shrink-0">
             <div className="w-full aspect-square bg-[#F1F5F9] rounded-2xl flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                {product?.images && product.images.length > 0 ? (
                  <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-8xl">🛍️</span>
                )}
             </div>
          </div>

          {/* Details Column */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
             <div className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">{product?.category || 'Pet Supplies'}</div>
             <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 leading-tight" style={{ fontFamily: 'Literata, serif' }}>{product?.name}</h1>
             
             <div className="text-2xl font-bold text-[#0046CE] mb-6">{formatCurrency(product?.price)}</div>
             
             <div className="h-px w-full bg-[#E2E8F0] mb-6"></div>
             
             <p className="text-base text-[#475569] leading-relaxed mb-8">{product?.description}</p>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                <button 
                  onClick={() => {
                    addItem(product, 1);
                    addToast(`${product.name} ${t('shop.savedToCart')}`, 'success');
                    navigate('/checkout');
                  }}
                  className="w-full sm:w-1/2 bg-[#0046CE] hover:bg-[#003DA8] text-white font-semibold py-3.5 px-6 rounded-xl transition shadow-sm hover:shadow text-center"
                >
                  {t('buttons.buynow', 'Buy Now')}
                </button>
                <button 
                  onClick={() => {
                    addItem(product, 1);
                    addToast(`${product.name} ${t('shop.savedToCart')}`, 'success');
                  }}
                  className="w-full sm:w-1/2 bg-white hover:bg-[#F8FAFC] text-[#0046CE] border-2 border-[#0046CE] font-semibold py-3.5 px-6 rounded-xl transition text-center"
                >
                  {t('buttons.addToCart', 'Add to Cart')}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}