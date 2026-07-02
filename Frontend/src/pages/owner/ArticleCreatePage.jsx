import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { submitArticle } from '../../api/content.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await submitArticle(form);
      addToast('Article submitted', 'success');
      navigate('/articles');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app max-w-3xl px-10 py-8">
      <Link to="/articles" className="font-semibold text-neutral-600 hover:text-primary-600">← Back to articles</Link>
      <Card className="mt-4 p-6">
        <h1 className="font-display text-4xl text-neutral-900">Submit article</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <Textarea label="Content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} rows={10} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/articles')}>Cancel</Button>
            <Button type="submit" loading={loading}>Submit article</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}