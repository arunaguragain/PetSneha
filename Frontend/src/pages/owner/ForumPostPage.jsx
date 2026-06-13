import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Textarea } from '../../components/ui';
import { addForumAnswer, getForumPost, upvotePost, reportPost } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItem, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ForumPostPage() {
  const { postId } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getForumPost(postId);
        setPost(unwrapItem(response, 'post'));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast, postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addForumAnswer(postId, { content: answer });
      addToast('Answer posted', 'success');
      setAnswer('');
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  if (loading) {
    return <Card className="p-8">Loading...</Card>;
  }

  return (
    <div className="container-app max-w-4xl px-10 py-8">
      <Link to="/forum" className="font-semibold text-neutral-600 hover:text-primary-600">← Back to forum</Link>
      <Card className="mt-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-neutral-900">{post?.title}</h1>
            <p className="mt-2 text-body-md text-neutral-500">{formatDate(post?.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={async () => { await upvotePost(postId); addToast('Upvoted', 'success'); }}>Upvote</Button>
            <Button variant="ghost" size="sm" onClick={async () => { await reportPost(postId); addToast('Reported', 'success'); }}>Report</Button>
          </div>
        </div>
        <p className="mt-4 text-body-md text-neutral-600">{post?.content}</p>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="font-display text-2xl text-neutral-900">Answers</h2>
        <div className="mt-4 space-y-4">
          {unwrapItems(post?.answers).length ? unwrapItems(post.answers).map((item) => (
            <div key={item._id || item.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-3"><Avatar name={item.author?.name || 'Member'} size="sm" /><p className="font-semibold text-neutral-900">{item.author?.name || 'Member'}</p></div>
              <p className="mt-2 text-body-md text-neutral-600">{item.content}</p>
            </div>
          )) : <p className="text-body-md text-neutral-500">No answers yet.</p>}
        </div>
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write your answer..." rows={4} />
          <div className="flex justify-end"><Button type="submit">Post answer</Button></div>
        </form>
      </Card>
    </div>
  );
}