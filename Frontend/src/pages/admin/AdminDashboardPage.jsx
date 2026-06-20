import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select, Skeleton, Badge } from '../../components/ui';
import { approveVet, deactivateUser, getAdminDashboard, getAllOrders, getAllUsers, getAllAdminVets, getPendingArticles, getPendingProducts, getPendingVets, getReportedPosts, pinPost, publishArticle, reactivateUser, rejectArticle, rejectVet, removePost, approveProduct, rejectProduct } from '../../api/admin.api';
import { getErrorMessage, formatCurrency, formatDate, unwrapItems, unwrapItem } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboardPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [vets, setVets] = useState([]);
  const [articles, setArticles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, usersResponse, vetsResponse, articlesResponse, postsResponse, productsResponse, ordersResponse] = await Promise.all([
        getAdminDashboard(),
        getAllUsers(),
        getAllAdminVets(),
        getPendingArticles(),
        getReportedPosts(),
        getPendingProducts(),
        getAllOrders(),
      ]);
      setDashboard(unwrapItem(dashboardResponse, 'dashboard'));
      setUsers(unwrapItems(usersResponse));
      setVets(unwrapItems(vetsResponse));
      setArticles(unwrapItems(articlesResponse));
      setPosts(unwrapItems(postsResponse));
      setProducts(unwrapItems(productsResponse));
      setOrders(unwrapItems(ordersResponse));
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => [
    ['Users', users.length || dashboard?.users || 0],
    ['Pending vets', vets.length || dashboard?.pendingVets || 0],
    ['Pending articles', articles.length || dashboard?.pendingArticles || 0],
    ['Reported posts', posts.length || dashboard?.reportedPosts || 0],
  ], [articles.length, dashboard, posts.length, users.length, vets.length]);

  const handleReason = (label) => window.prompt(`${label} reason`) || '';

  return (
    <div className="container-app px-10 py-8">
      <h1 className="font-display text-4xl text-neutral-900">Admin panel</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {counts.map(([label, value]) => <Card key={label} className="p-4"><p className="text-caption text-neutral-500">{label}</p><p className="mt-1 font-display text-3xl text-neutral-900">{value}</p></Card>)}
      </div>

      {loading ? <Skeleton className="mt-6 h-96 w-full" /> : (
        <div className="mt-6 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4"><h2 className="font-display text-2xl text-neutral-900">Users</h2><Badge variant="neutral">{users.length}</Badge></div>
            <div className="mt-4 space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user._id || user.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3">
                  <div><p className="font-semibold text-neutral-900">{user.name}</p><p className="text-body-md text-neutral-500">{user.email} · {user.role}</p></div>
                  <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={async () => { try { await deactivateUser(user._id || user.id); addToast('User deactivated', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Deactivate</Button><Button size="sm" onClick={async () => { try { await reactivateUser(user._id || user.id); addToast('User reactivated', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Reactivate</Button></div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5"><h2 className="font-display text-2xl text-neutral-900">Pending vets</h2><div className="mt-4 space-y-3">{vets.map((vet) => <div key={vet._id || vet.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"><div><p className="font-semibold text-neutral-900">{vet.name}</p><p className="text-body-md text-neutral-500">{vet.clinicName || vet.location || 'Clinic'}</p></div><div className="flex gap-2"><Button size="sm" onClick={async () => { try { await approveVet(vet._id || vet.id); addToast('Vet approved', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Approve</Button><Button size="sm" variant="danger" onClick={async () => { try { await rejectVet(vet._id || vet.id, handleReason('Vet rejection')); addToast('Vet rejected', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Reject</Button></div></div>)}</div></Card>

          <Card className="p-5"><h2 className="font-display text-2xl text-neutral-900">Pending articles</h2><div className="mt-4 space-y-3">{articles.map((article) => <div key={article._id || article.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"><div><p className="font-semibold text-neutral-900">{article.title}</p><p className="text-body-md text-neutral-500">{article.author?.name || article.authorName || 'Author'}</p></div><div className="flex gap-2"><Button size="sm" onClick={async () => { try { await publishArticle(article._id || article.id); addToast('Article published', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Publish</Button><Button size="sm" variant="danger" onClick={async () => { try { await rejectArticle(article._id || article.id, handleReason('Article rejection')); addToast('Article rejected', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Reject</Button></div></div>)}</div></Card>

          <Card className="p-5"><h2 className="font-display text-2xl text-neutral-900">Reported forum posts</h2><div className="mt-4 space-y-3">{posts.map((post) => <div key={post._id || post.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"><div><p className="font-semibold text-neutral-900">{post.title}</p><p className="text-body-md text-neutral-500">{post.author?.name || 'Member'}</p></div><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={async () => { try { await pinPost(post._id || post.id); addToast('Post pinned', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Pin</Button><Button size="sm" variant="danger" onClick={async () => { try { await removePost(post._id || post.id); addToast('Post removed', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Remove</Button></div></div>)}</div></Card>

          <Card className="p-5"><h2 className="font-display text-2xl text-neutral-900">Pending products</h2><div className="mt-4 space-y-3">{products.map((product) => <div key={product._id || product.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"><div><p className="font-semibold text-neutral-900">{product.name}</p><p className="text-body-md text-neutral-500">{formatCurrency(product.price)}</p></div><div className="flex gap-2"><Button size="sm" onClick={async () => { try { await approveProduct(product._id || product.id); addToast('Product approved', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Approve</Button><Button size="sm" variant="danger" onClick={async () => { try { await rejectProduct(product._id || product.id); addToast('Product rejected', 'success'); await load(); } catch (e) { addToast(getErrorMessage(e), 'danger'); } }}>Reject</Button></div></div>)}</div></Card>

          <Card className="p-5"><h2 className="font-display text-2xl text-neutral-900">Orders</h2><div className="mt-4 space-y-3">{orders.map((order) => <div key={order._id || order.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"><div><p className="font-semibold text-neutral-900">Order #{order.orderNumber || order._id || order.id}</p><p className="text-body-md text-neutral-500">{formatDate(order.createdAt)}</p></div><Badge variant="neutral">{order.status || 'pending'}</Badge></div>)}</div></Card>
        </div>
      )}
    </div>
  );
}