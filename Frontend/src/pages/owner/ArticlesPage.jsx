import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Skeleton, VerifiedBadge } from '../../components/ui';
import { getArticles } from '../../api/content.api';
import { getErrorMessage, formatDate, unwrapItems } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getArticles();
        const articlesList = response.data?.articles
          || response.data?.items
          || (Array.isArray(response.data) ? response.data : response || []);
        setArticles(articlesList);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-[#0046CE] to-[#1D4ED8] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Literata, serif' }}>
              Expertise meets Empathy
            </h1>
            <p className="text-sm text-white opacity-80 mt-2 max-w-lg">
              Trusted pet care knowledge from verified professionals. Explore our extensive library of vet-approved articles.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="bg-white hover:bg-neutral-50 text-[#0046CE] rounded-lg px-4 py-2 text-sm font-medium transition">
                Browse Checklist
              </button>
              <button 
                onClick={() => navigate('/community')}
                className="border border-white hover:bg-white/10 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
              >
                Ask a Vet
              </button>
            </div>
          </div>
          
          <img src="/profile.png" alt="Vet Expert" className="w-48 h-32 rounded-xl object-cover bg-[#F1F5F9] shadow-md hidden md:block" />
        </div>

        {/* Three column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* Left (col-span-1) - Checklist */}
          <div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide">ESSENTIALS</div>
            <h2 className="text-base font-semibold text-[#1E293B] mt-1" style={{ fontFamily: 'Literata, serif' }}>New Owner Checklist</h2>
            <p className="text-sm text-[#64748B] mt-1">Make sure you have the basics covered for your new furry friend.</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-[#1E293B]">Set up a safe sleeping area</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-[#1E293B]">Buy age-appropriate food</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="w-4 h-4 text-[#E2E8F0]" />
                <span className="text-[#64748B]">Schedule first vet visit</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="w-4 h-4 text-[#E2E8F0]" />
                <span className="text-[#64748B]">Purchase basic grooming tools</span>
              </div>
            </div>
            
            <button className="text-sm text-[#0046CE] mt-4 flex items-center gap-1 hover:underline font-medium">
              View Full Checklist <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Centre (col-span-1) - Seasonal */}
          <div>
            <div className="text-xs text-amber-600 uppercase tracking-wide flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> SEASONAL ALERT
            </div>
            
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="w-full h-32 bg-[#F1F5F9] relative">
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-4xl">☀️</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#1E293B] line-clamp-1">Summer Heat Safety Tips</h3>
                <p className="text-sm text-[#64748B] mt-1 line-clamp-2">Learn how to protect your pet's paws from hot pavement and prevent heatstroke.</p>
                <div className="text-sm text-[#0046CE] mt-3 font-medium">Read Article</div>
              </div>
            </div>
          </div>

          {/* Right (col-span-1) - Forum */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-[#1E293B]">Community Forum</h2>
              <button 
                onClick={() => navigate('/community')}
                className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm transition"
              >
                Ask a Question
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#F8FAFC] rounded-xl p-3 cursor-pointer hover:bg-[#F1F5F9] transition">
                <div className="bg-[#F0FDF4] text-[#166534] text-[10px] px-2 py-0.5 rounded-full w-fit font-medium mb-2 uppercase tracking-wide">
                  VET VERIFIED
                </div>
                <h3 className="text-sm font-medium text-[#1E293B] line-clamp-2">What is the best way to transition my puppy to adult food?</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-blue-200 border border-white"></div>
                    <div className="w-5 h-5 rounded-full bg-green-200 border border-white"></div>
                  </div>
                  <span className="text-xs text-[#64748B]">4 answers</span>
                </div>
              </div>
              
              <div className="bg-[#F8FAFC] rounded-xl p-3 cursor-pointer hover:bg-[#F1F5F9] transition">
                <h3 className="text-sm font-medium text-[#1E293B] line-clamp-2">My cat keeps scratching the sofa, any recommendations for scratching posts?</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-amber-200 border border-white"></div>
                  </div>
                  <span className="text-xs text-[#64748B]">12 answers</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Latest Insights Header */}
        <div className="flex justify-between items-end mt-10 mb-4 border-t border-[#E2E8F0] pt-8">
          <h2 className="text-xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>Latest Health Insights</h2>
          <span className="text-sm text-[#0046CE] cursor-pointer hover:underline">See all articles</span>
        </div>

        {/* Article list */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
          ) : articles.length > 0 ? (
            articles.map((article) => {
              const categoryLower = (article.category || '').toLowerCase();
              let badgeClass = "bg-blue-50 text-blue-700";
              if (categoryLower.includes('nutrition') || categoryLower.includes('food')) {
                badgeClass = "bg-green-50 text-green-700";
              } else if (categoryLower.includes('behavior') || categoryLower.includes('training')) {
                badgeClass = "bg-amber-50 text-amber-700";
              }

              return (
                <div 
                  key={article._id} 
                  className="flex flex-col sm:flex-row items-start gap-4 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/articles/${article._id}`)}
                >
                  <div className="w-full sm:w-24 h-40 sm:h-24 rounded-lg bg-[#F1F5F9] flex-shrink-0 flex items-center justify-center text-3xl">
                    📰
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                    <div>
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {article.category || 'MEDICAL'}
                      </span>
                      <h3 className="text-base font-semibold text-[#1E293B] mt-1.5 line-clamp-1">{article.title}</h3>
                      <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{article.summary || article.excerpt || article.content}</p>
                    </div>
                    
                    <div className="text-sm text-[#0046CE] mt-3 font-medium flex items-center gap-1 group">
                      View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#64748B]">
              No articles found. Check back later for new insights!
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}