import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Skeleton } from '../../components/ui';
import { getForumPosts } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ThumbsUp, ThumbsDown, MessageSquare, ShieldCheck, CheckCircle2, Send, Check } from 'lucide-react';

export default function ForumPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [newPostInput, setNewPostInput] = useState('');

  const filters = ['All', 'Dogs', 'Cats', 'Birds', 'Rabbit', 'Fish'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getForumPosts();
        const postsList = response.data?.posts
          || response.data?.items
          || (Array.isArray(response.data) ? response.data : response || []);
        setPosts(postsList);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  const handleCreatePost = () => {
    if (newPostInput.trim()) {
      // In a real app we'd call the API here or pass this initial text to the /forum/new page
      navigate('/forum/new');
    }
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
              {filters.map((filter) => (
                <div 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${
                    activeFilter === filter 
                      ? 'bg-[#0046CE] text-white border-[#0046CE]' 
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-neutral-50'
                  }`}
                >
                  {filter}
                </div>
              ))}
            </div>

            {/* Post input row */}
            <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm">
              <img src="/profile.png" alt="You" className="w-8 h-8 rounded-full object-cover bg-[#F1F5F9] flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Ask the community or a vet a question..." 
                className="flex-1 bg-transparent text-sm outline-none text-[#1E293B] placeholder:text-[#64748B]"
                value={newPostInput}
                onChange={(e) => setNewPostInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
              />
              <button 
                onClick={handleCreatePost}
                className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg px-4 py-1.5 text-sm flex items-center gap-1 transition flex-shrink-0 font-medium"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </div>

            {/* Forum posts */}
            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
              ) : posts.length > 0 ? (
                posts.map((post) => {
                  const isVetAnswered = post.answersCount > 0 || (post.isVetAnswered !== false); // Mock logic for UI
                  
                  return (
                    <div 
                      key={post._id} 
                      className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/forum/${post._id}`)}
                    >
                      {/* Top row */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-xs font-medium text-[#64748B]">
                          {(post.author?.name || 'M')[0]}
                        </div>
                        <span className="font-medium text-sm text-[#1E293B]">{post.author?.name || 'Member'}</span>
                        <span className="text-xs text-[#64748B]">• {formatDate(post.createdAt)}</span>
                        
                        <span className="ml-auto bg-[#EFF6FF] text-[#0046CE] text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase">
                          {post.species || 'General'}
                        </span>
                      </div>
                      
                      {/* Conditional Vet Answered badge */}
                      {isVetAnswered && (
                        <div className="mt-3 bg-[#F0FDF4] text-[#166534] text-xs px-2 py-0.5 rounded-full w-fit flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3" /> Vet Answered
                        </div>
                      )}
                      
                      <h3 className="font-semibold text-[#1E293B] mt-2 text-base">{post.title}</h3>
                      <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{post.content}</p>
                      
                      {/* Bottom row */}
                      <div className="flex items-center gap-4 mt-4 text-xs text-[#64748B]">
                        <div className="flex items-center gap-1 hover:text-[#0046CE] transition">
                          <ThumbsUp className="w-4 h-4" /> {post.likesCount || Math.floor(Math.random() * 20)}
                        </div>
                        <div className="flex items-center gap-1 hover:text-red-500 transition">
                          <ThumbsDown className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1 hover:text-[#0046CE] transition">
                          <MessageSquare className="w-4 h-4" /> {post.answersCount || post.answerCount || 0} Answers
                        </div>
                        
                        {isVetAnswered && (
                          <div className="ml-auto bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] text-[10px] px-2 py-0.5 rounded-full">
                            Verified Response
                          </div>
                        )}
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
    </div>
  );
}