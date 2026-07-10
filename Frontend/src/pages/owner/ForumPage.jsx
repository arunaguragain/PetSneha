import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Badge, Button, Card, Input, Modal, Select, Skeleton, Textarea } from '../../components/ui';
import { createForumPost, getForumPosts, reportPost } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, ShieldCheck, CheckCircle2, Check, X, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ForumPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [activeGroup, setActiveGroup] = useState('all');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [showRules, setShowRules] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', content: '', group: 'all', isAnonymous: false });

  const groups = [
    { label: t('forum.all', 'All'), value: 'all' },
    { label: t('forum.dogs', 'Dogs'), value: 'dogs' },
    { label: t('forum.cats', 'Cats'), value: 'cats' },
    { label: t('forum.newOwners', 'New Owners'), value: 'newOwners' },
    { label: t('forum.emergency', 'Emergency'), value: 'emergency' },
  ];

  const isVet = role === 'vet';

  useEffect(() => {
    if (location.state?.showCreateModal) {
      setShowCreateModal(true);
    }
  }, [location.state]);

  const loadPosts = async (group = activeGroup) => {
    try {
      setLoading(true);
      const response = await getForumPosts(group === 'all' ? {} : { group });
      const postsList = response.data?.posts
        || response.data?.items
        || (Array.isArray(response.data) ? response.data : response.data || []);
      setPosts(Array.isArray(postsList) ? postsList : []);
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeGroup]);

  useEffect(() => {
    if (!isVet && activeQuickFilter !== 'all') {
      setActiveQuickFilter('all');
    }
  }, [activeQuickFilter, isVet]);

  const visiblePosts = useMemo(() => {
    if (activeQuickFilter === 'unanswered') {
      return posts.filter((post) => !Array.isArray(post.answers) || post.answers.length === 0);
    }

    return posts;
  }, [activeQuickFilter, posts]);

  const handleCreatePost = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    try {
      setCreatingPost(true);
      await createForumPost(createForm);
      addToast('Forum post created', 'success');
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', group: 'all', isAnonymous: false });
      loadPosts();
    } catch (apiError) {
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setCreatingPost(false);
    }
  };

  const ctaLabel = t('forum.createPost', 'Create new post');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        
        {/* Header */}
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{t('forum.communityTitle', 'PetSneha Community')}</h1>
        <p className="text-sm text-[#64748B] mt-1">{t('forum.communitySubtitle', 'Connect with pet parents and veterinary experts across Nepal.')}</p>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          {/* Left (col-span-2) */}
          <div className="md:col-span-2">
            
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {groups.map((group) => (
                <button
                  key={group.value}
                  type="button"
                  onClick={() => setActiveGroup(group.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                    activeGroup === group.value
                      ? 'bg-[#0046CE] text-white border-[#0046CE]'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-neutral-50'
                  }`}
                >
                  {group.label}
                </button>
              ))}
              {isVet ? (
                <button
                  type="button"
                  onClick={() => setActiveQuickFilter((current) => (current === 'unanswered' ? 'all' : 'unanswered'))}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                    activeQuickFilter === 'unanswered'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-neutral-50'
                  }`}
                >
                  {t('forum.unanswered', 'Unanswered')}
                </button>
              ) : null}
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm mb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1E293B]">{t('forum.startDiscussion', 'Start a discussion')}</h2>
                  <p className="text-sm text-[#64748B]">{isVet ? t('forum.vetPrompt', 'Answer questions from the community or create your own discussion.') : t('forum.ownerPrompt', 'Ask the community or create a question for vets to answer.')}</p>
                </div>
                <Button variant="primary" onClick={handleCreatePost}>{ctaLabel}</Button>
              </div>
            </div>

            {/* Forum posts */}
            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
              ) : visiblePosts.length > 0 ? (
                visiblePosts.map((post) => {
                  const answersCount = Array.isArray(post.answers) ? post.answers.length : 0;
                  const hasVetAnswer = Array.isArray(post.answers) && post.answers.some((answer) => answer.isVet === true);
                  const upvotes = Number(post.upvotes || 0);
                  const authorName = post.isAnonymous ? 'Anonymous' : post.author?.name || 'Member';
                  const groupLabel = post.group === 'newOwners' ? 'New Owners' : post.group === 'emergency' ? 'Emergency' : post.group === 'all' ? 'All' : post.group;

                  return (
                    <div 
                      key={post._id} 
                      className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/forum/${post._id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-xs font-medium text-[#64748B]">
                          {authorName[0] || 'M'}
                        </div>
                        <span className="font-medium text-sm text-[#1E293B]">{authorName}</span>
                        <span className="text-xs text-[#64748B]">• {formatDate(post.createdAt)}</span>

                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0046CE]">
                          {post.isPinned ? 'Pinned' : groupLabel}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-[#1E293B] mt-3 text-base">{post.title}</h3>
                      <p className="text-sm text-[#64748B] mt-2 line-clamp-2">{post.content}</p>

                      {hasVetAnswer && (
                        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-1 text-xs font-semibold text-[#166534]">
                          <Check className="w-3 h-3" /> Vet Answered
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> {answersCount} {t('forum.replies', 'Answers')}
                        </div>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> {upvotes} {t('forum.upvotes', 'Upvotes')}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-dashed border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#64748B]">
                  {activeQuickFilter === 'unanswered' ? t('forum.noUnanswered', 'No unanswered posts found.') : t('forum.noPostsFound', 'No posts found. Be the first to start a discussion!')}
                </div>
              )}
            </div>

          </div>

          {/* Right (col-span-1) */}
          <div className="md:col-span-1">
            
            {/* Community Guidelines card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1E293B] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0046CE]" /> {t('forum.communityGuidelines', 'Community Guidelines')}
              </h2>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('forum.rule1', 'Be respectful and supportive to other pet parents.')}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('forum.rule2', 'Do not share unverified medical advice.')}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('forum.rule3', 'In emergencies, always contact a vet directly.')}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowRules(true)}
                className="w-full border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-lg py-2 text-xs font-medium mt-3 transition">
                {t('forum.readFullRules', 'Read Full Rules')}
              </button>
            </div>

            {/* Need help card */}
            <div className="bg-[#EFF6FF] rounded-xl p-4 mt-4 border border-[#BFDBFE]">
              <div className="font-medium text-[#0046CE] text-sm">{t('forum.needHelp', 'Need professional help?')}</div>
              <p className="text-xs text-[#64748B] mt-1">{t('forum.needHelpDesc', 'Browse our extensive library of vet-approved articles or book a consultation.')}</p>
              
              <button 
                onClick={() => navigate('/articles')}
                className="w-full border border-[#0046CE] hover:bg-[#E0E7FF] text-[#0046CE] rounded-lg px-4 py-2 text-xs font-medium mt-3 transition"
              >
                {t('forum.visitLibrary', 'Visit Library')} →
              </button>
            </div>

          </div>
          
        </div>
      </div>


      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg" title={t('forum.createPost', 'Create forum post')}>
        <form className="px-6 pb-6 space-y-5" onSubmit={handleCreateSubmit}>
          <Input
            label={t('forum.postTitle', 'Title')}
            value={createForm.title}
            onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <Textarea
            label={t('forum.postContent', 'Content')}
            value={createForm.content}
            onChange={(event) => setCreateForm((current) => ({ ...current, content: event.target.value }))}
            rows={8}
            required
          />
          <Select
            label="Group"
            value={createForm.group}
            onChange={(event) => setCreateForm((current) => ({ ...current, group: event.target.value }))}
          >
            <option value="all">All</option>
            <option value="dogs">Dogs</option>
            <option value="cats">Cats</option>
            <option value="newOwners">New Owners</option>
            <option value="emergency">Emergency</option>
          </Select>
          <label className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
            <input
              type="checkbox"
              checked={createForm.isAnonymous}
              onChange={(event) => setCreateForm((current) => ({ ...current, isAnonymous: event.target.checked }))}
              className="h-4 w-4 rounded border border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            {t('forum.postAnonymously', 'Post anonymously')}
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>{t('buttons.cancel', 'Cancel')}</Button>
            <Button type="submit" loading={creatingPost}>{t('forum.post', 'Post')}</Button>
          </div>
        </form>
      </Modal>

      {/* Community Rules Modal */}
      <Modal open={showRules} onClose={() => setShowRules(false)} title={t('forum.communityRules', 'Community Guidelines')} className="!overflow-hidden !max-h-none">
        <div className="px-6 pb-6 space-y-3 text-sm text-[#475569]">
          {[
            { title: t('forum.ruleRespect', 'Be respectful'), desc: t('forum.ruleRespectDesc', 'Treat all members with kindness. No harassment, hate speech, or personal attacks.') },
            { title: t('forum.ruleMedical', 'No unverified medical advice'), desc: t('forum.ruleMedicalDesc', 'Do not share unverified medical advice. Always recommend consulting a licensed veterinarian for health concerns.') },
            { title: t('forum.ruleEmergency', 'Emergencies'), desc: t('forum.ruleEmergencyDesc', 'In case of a pet emergency, always contact a vet directly. Do not rely solely on the forum for urgent medical guidance.') },
            { title: t('forum.ruleSpam', 'No spam or self-promotion'), desc: t('forum.ruleSpamDesc', 'Avoid posting repetitive content, unsolicited advertisements, or irrelevant links.') },
            { title: t('forum.rulePrivacy', 'Protect privacy'), desc: t('forum.rulePrivacyDesc', 'Do not share personal information of others without their consent.') },
            { title: t('forum.ruleRelevant', 'Stay on topic'), desc: t('forum.ruleRelevantDesc', 'Keep discussions relevant to pets and animal care. Off-topic posts may be removed.') },
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-6 h-6 rounded-full bg-[#0046CE] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
              <div>
                <p className="font-semibold text-[#0F172A]">{rule.title}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{rule.desc}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-[#94A3B8] pt-2">{t('forum.rulesFooter', 'Violations may result in post removal or account suspension. Thank you for keeping PetSneha safe and welcoming!')}</p>
        </div>
      </Modal>
    </div>
  );
}