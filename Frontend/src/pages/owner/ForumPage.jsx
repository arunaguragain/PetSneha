import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Skeleton } from '../../components/ui';
import { getForumPosts, reportPost } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, ShieldCheck, CheckCircle2, Check, X, BookOpen } from 'lucide-react';

export default function ForumPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [activeGroup, setActiveGroup] = useState('all');
  const [showRules, setShowRules] = useState(false);

  const groups = [
    { label: 'All', value: 'all' },
    { label: 'Dogs', value: 'dogs' },
    { label: 'Cats', value: 'cats' },
    { label: 'New Owners', value: 'newOwners' },
    { label: 'Emergency', value: 'emergency' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getForumPosts(activeGroup === 'all' ? {} : { group: activeGroup });
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

    load();
  }, [addToast, activeGroup]);

  const handleCreatePost = () => {
    navigate('/forum/new');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header */}
        <h1 className="text-2xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>PetSneha Community</h1>
        <p className="text-sm text-[#64748B] mt-1">Connect with pet parents and veterinary experts across Nepal.</p>

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
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm mb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1E293B]">Start a discussion</h2>
                  <p className="text-sm text-[#64748B]">Ask the community or create a question for vets to answer.</p>
                </div>
                <Button variant="primary" onClick={handleCreatePost}>Create new post</Button>
              </div>
            </div>

            {/* Forum posts */}
            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
              ) : posts.length > 0 ? (
                posts.map((post) => {
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
                          <MessageSquare className="w-4 h-4" /> {answersCount} Answer{answersCount !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> {upvotes} Upvotes
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-dashed border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#64748B]">
                  No posts found. Be the first to start a discussion!
                </div>
              )}
            </div>

          </div>

          {/* Right (col-span-1) */}
          <div className="md:col-span-1">
            
            {/* Community Guidelines card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1E293B] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0046CE]" /> Community Guidelines
              </h2>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Be respectful and supportive to other pet parents.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Do not share unverified medical advice.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>In emergencies, always contact a vet directly.</span>
                </div>
              </div>
              
              <button className="w-full border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-lg py-2 text-xs font-medium mt-3 transition">
                Read Full Rules
              </button>
            </div>

            {/* Top Experts card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm mt-4">
              <h2 className="text-sm font-semibold text-[#1E293B]">Top Experts</h2>
              
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/profile.png" alt="Vet" className="w-8 h-8 rounded-full object-cover bg-[#F1F5F9]" />
                  <div>
                    <div className="font-medium text-sm text-[#1E293B]">Dr. Anita Rai</div>
                    <div className="text-xs text-[#64748B]">142 Answers • Verified Vet</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-xs font-medium text-[#64748B]">SJ</div>
                  <div>
                    <div className="font-medium text-sm text-[#1E293B]">Dr. Sanjay Joshi</div>
                    <div className="text-xs text-[#64748B]">89 Answers • Verified Vet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need help card */}
            <div className="bg-[#EFF6FF] rounded-xl p-4 mt-4 border border-[#BFDBFE]">
              <div className="font-medium text-[#0046CE] text-sm">Need professional help?</div>
              <p className="text-xs text-[#64748B] mt-1">Browse our extensive library of vet-approved articles or book a consultation.</p>
              
              <button 
                onClick={() => navigate('/articles')}
                className="w-full border border-[#0046CE] hover:bg-[#E0E7FF] text-[#0046CE] rounded-lg px-4 py-2 text-xs font-medium mt-3 transition"
              >
                Visit Library →
              </button>
            </div>

          </div>
          
        </div>
      </div>
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Community Guidelines</h2>
                <p className="text-sm text-slate-500 mt-1">A friendly, helpful forum keeps the community safe and useful.</p>
              </div>
              <button type="button" onClick={() => setShowRules(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">Close</button>
            </div>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">1. Be respectful.</p>
                <p>Share your questions and advice kindly. Do not harass other members.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">2. Keep medical advice general.</p>
                <p>Use the forum for guidance, but always consult a vet for diagnoses or emergencies.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">3. Post in the right group.</p>
                <p>Choose the correct category so vets and owners can find your question fast.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">4. Respect privacy.</p>
                <p>Do not share private details or personal health information on the forum.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setShowRules(false)} className="rounded-full bg-[#0046CE] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}