import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { getProduct } from '../../api/shop.api';
import { formatCurrency, getErrorMessage, unwrapItem } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ProductPage() {
  const { productId } = useParams();
  const { addToast } = useToast();
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
    return <Card className="p-8">Loading...</Card>;
  }

  return (
    <div className="container-app max-w-4xl px-10 py-8">
      <Link to="/shop" className="font-semibold text-neutral-600 hover:text-primary-600">← Back to marketplace</Link>
      <Card className="mt-4 p-8">
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-neutral-50 p-8 text-center text-6xl">🛍️</div>
          <div>
            <h1 className="font-display text-4xl text-neutral-900">{product?.name}</h1>
            <Badge className="mt-3" variant="primary">{formatCurrency(product?.price)}</Badge>
            <p className="mt-4 text-body-md text-neutral-600">{product?.description}</p>
            <div className="mt-6 flex gap-3">
              <Button as={Link} to="/checkout">Buy now</Button>
              <Button variant="secondary">Add to cart</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}