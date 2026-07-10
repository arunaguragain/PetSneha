import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Select, Textarea } from '../../components/ui';
import { createForumPost } from '../../api/content.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ForumCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', group: 'all', isAnonymous: false });

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
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="flex items-center justify-end mb-4">
          <Link to="/forum" className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition">
            <ArrowLeft className="w-4 h-4" /> Back to forum
          </Link>
        </div>
        <div className="max-w-4xl">
          <Modal open onClose={() => navigate('/forum')} size="lg" title="Create forum post">
            <form className="px-6 pb-6 space-y-5" onSubmit={handleSubmit}>
              <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
              <Textarea label="Content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} rows={8} required />
              <Select
                label="Group"
                value={form.group}
                onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))}
              >
                <option value="all">All</option>
                <option value="dogs">Dogs</option>
                <option value="cats">Cats</option>
                <option value="newOwners">New Owners</option>
                <option value="emergency">Emergency</option>
              </Select>
              <label className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
                <input
                  id="anonymous"
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(event) => setForm((current) => ({ ...current, isAnonymous: event.target.checked }))}
                  className="h-4 w-4 rounded border border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Post anonymously
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => navigate('/forum')}>Cancel</Button>
                <Button type="submit" loading={loading}>Post</Button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
}