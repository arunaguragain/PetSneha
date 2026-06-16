import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Textarea, Skeleton } from '../../components/ui';
import { getMyVetArticles, submitVetArticle } from '../../api/vetDashboard.api';
import { getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function VetArticlesPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const response = await getMyVetArticles();
      setArticles(unwrapItems(response));
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await submitVetArticle(form);
      addToast('Article submitted', 'success');
      setForm({ title: '', content: '' });
      await load();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app px-10 py-8">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h1 className="font-display text-4xl text-neutral-900">My articles</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Textarea label="Content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} rows={10} />
            <Button type="submit" loading={submitting}>Publish draft</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-2xl text-neutral-900">Published articles</h2>
          <div className="mt-4 space-y-3">
            {loading ? <Skeleton className="h-40 w-full" /> : articles.map((article) => (
              <div key={article._id || article.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="font-semibold text-neutral-900">{article.title}</p>
                <p className="mt-2 text-body-md text-neutral-500">{article.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}