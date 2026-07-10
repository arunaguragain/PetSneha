import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Textarea } from '../../components/ui';
import { addForumAnswer, getForumPost, upvotePost, reportPost } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItem, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ForumPostPage() {
  const { postId } = useParams();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { role } = useAuth();
  
  const backLink = role === 'vet' ? '/vet/forum' : '/forum';
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
      addToast(t('forum.answerPosted', 'Answer posted'), 'success');
      setAnswer('');
      const response = await getForumPost(postId);
      setPost(unwrapItem(response, 'post'));
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    }
  };

  if (loading) {
    return <Card className="p-8">{t('common.loading', 'Loading...')}</Card>;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="flex items-center justify-end mb-4">
          <Link 
            to={backLink} 
            className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
          >
            <ArrowLeft className="w-4 h-4" /> {t('forum.backToForum', 'Back to forum')}
          </Link>
        </div>
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-neutral-900">{post?.title}</h1>
            <p className="mt-2 text-body-md text-neutral-500">{formatDate(post?.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={async () => { await upvotePost(postId); addToast(t('forum.upvoted', 'Upvoted'), 'success'); }}>{t('forum.upvote', 'Upvote')}</Button>
            <Button variant="ghost" size="sm" onClick={async () => { await reportPost(postId); addToast(t('forum.reported', 'Reported'), 'success'); }}>{t('forum.report', 'Report')}</Button>
          </div>
        </div>
        <p className="mt-4 text-body-md text-neutral-600">{post?.content}</p>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="font-display text-2xl text-neutral-900">{t('forum.answers', 'Answers')}</h2>
        <div className="mt-4 space-y-4">
          {unwrapItems(post?.answers).length ? unwrapItems(post.answers).map((item) => (
            <div key={item._id || item.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={item.author?.name || t('forum.member', 'Member')} size="sm" />
                  <div>
                    <p className="font-semibold text-neutral-900">{item.author?.name || t('forum.member', 'Member')}</p>
                    {item.isVet ? <p className="text-xs text-success-700">{t('forum.verifiedVet', 'Verified Vet')}</p> : null}
                  </div>
                </div>
                {item.isVet ? <Badge variant="success" className="text-[10px] uppercase">{t('forum.verifiedVet', 'Verified Vet')}</Badge> : null}
              </div>
              <p className="mt-2 text-body-md text-neutral-600">{item.content}</p>
            </div>
          )) : <p className="text-body-md text-neutral-500">{t('forum.noAnswersYet', 'No answers yet.')}</p>}
        </div>
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={t('forum.writeAnswer', 'Write your answer...')} rows={4} />
          <div className="flex justify-end"><Button type="submit">{t('forum.postAnswer', 'Post answer')}</Button></div>
        </form>
      </Card>
      </div>
    </div>
  );
}