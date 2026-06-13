import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { createForumPost } from '../../api/content.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ForumCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await createForumPost(form);
      addToast('Forum post created', 'success');
      navigate('/forum');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app max-w-3xl px-10 py-8">
      <Link to="/forum" className="font-semibold text-neutral-600 hover:text-primary-600">← Back to forum</Link>
      <Card className="mt-4 p-6">
        <h1 className="font-display text-4xl text-neutral-900">Create forum post</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <Textarea label="Content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} rows={8} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/forum')}>Cancel</Button>
            <Button type="submit" loading={loading}>Post</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}