import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getArticles, getForumPosts } from '../../api/content.api';
import { getErrorMessage, formatDate, unwrapItems } from '../../utils/api';
import { translateDynamic } from '../../utils/mappings';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, MessageSquare, Check, ArrowRight, Search } from 'lucide-react';
import OwnerChecklistPanel from '../../components/onboarding/OwnerChecklistPanel';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [articleQuery, setArticleQuery] = useState('');
  const [forumPosts, setForumPosts] = useState([]);
  const [seasonalArticle, setSeasonalArticle] = useState(null);
  const [forumLoading, setForumLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getArticles();
        const articlesList = unwrapItems(response);
        setArticles(articlesList);

        const month = new Date().getMonth();
        const currentSeason = month >= 2 && month <= 4 ? 'summer' : month >= 5 && month <= 8 ? 'monsoon' : 'winter';
        const seasonalMatch = articlesList.find((article) => String(article?.season || '').toLowerCase() === currentSeason);
        setSeasonalArticle(seasonalMatch || null);
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  const filteredArticles = articles.filter((article) => {
    const searchText = articleQuery.trim().toLowerCase();
    if (!searchText) {
      return true;
    }

    return [article.title, article.summary, article.excerpt, article.content, article.category, article.season]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(searchText));
  });

  const visibleArticles = showAllArticles ? filteredArticles : filteredArticles.slice(0, 3);

  useEffect(() => {
    const loadForumPosts = async () => {
      try {
        setForumLoading(true);
        const response = await getForumPosts({ limit: 2 });
        setForumPosts(unwrapItems(response).slice(0, 2));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setForumLoading(false);
      }
    };

    loadForumPosts();
  }, [addToast]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        
        {/* Hero banner */}
        <div className="bg-[#0046ce] rounded-xl flex flex-col md:flex-row items-stretch justify-between shadow-sm overflow-hidden relative min-h-[220px]">
          <div className="p-8 relative z-10 md:w-3/5 lg:w-1/2">
            <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Literata, serif' }}>
              {t('articles.heroTitle', 'Expertise meets Empathy')}
            </h1>
            <p className="text-sm text-white opacity-90 mt-2 max-w-lg">
              {t('articles.heroDesc', 'Your comprehensive guide to pet health, seasonal care, and community-driven support in Nepal.')}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={() => navigate('/onboarding')} className="bg-white hover:bg-neutral-50 text-[#0046CE] rounded px-4 py-2 text-sm font-medium transition">
                {t('articles.browseChecklist', 'Browse Checklist')}
              </button>
              <button 
                onClick={() => navigate('/forum', { state: { showCreateModal: true } })}
                className="border border-white hover:bg-white/10 text-white rounded px-4 py-2 text-sm font-medium transition"
              >
                {t('articles.askAVet', 'Ask a Vet')}
              </button>
            </div>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
            <img src="/expert.png" alt="Vet Expert" className="w-full h-full object-cover object-left" />
          </div>
        </div>

        {/* Three column layout */}
        <div className="flex flex-col md:flex-row gap-6 mt-8 items-stretch">
          
          {/* Left (col-span-1) - Checklist */}
          <div className="w-full md:flex-1 flex flex-col">
            <OwnerChecklistPanel variant="compact" />
          </div>

          {/* Centre (col-span-1) - Seasonal */}
          <div className="w-full md:flex-1 flex flex-col">
            {seasonalArticle ? (
              <div
                className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex-1 flex flex-col relative"
                onClick={() => navigate(`/articles/${seasonalArticle._id}`)}
              >
                <div className="w-full h-36 bg-[#F1F5F9] relative">
                  {seasonalArticle.imageUrl ? (
                    <img src={seasonalArticle.imageUrl} alt={seasonalArticle.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-4xl">📰</div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-amber-600 uppercase tracking-wider flex items-center gap-1 font-bold shadow-sm">
                    <AlertTriangle className="w-3 h-3" /> {t('articles.seasonalAlert', 'SEASONAL ALERT')}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-[#1E293B] line-clamp-1">{translateDynamic(seasonalArticle.title, i18n.language)}</h3>
                  <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{translateDynamic(seasonalArticle.summary || seasonalArticle.excerpt || seasonalArticle.content, i18n.language)}</p>
                  <div className="text-sm text-[#0046CE] mt-auto pt-4 font-medium">{t('articles.readArticle', 'Read Article')}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-5 text-sm text-[#64748B]">
                <div className="text-xs text-amber-600 uppercase tracking-wide flex items-center gap-1 mb-2 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t('articles.seasonalAlert', 'SEASONAL ALERT')}
                </div>
                {t('articles.noSeasonal', 'No seasonal article available for this time of year yet.')}
              </div>
            )}
          </div>

          {/* Right (col-span-1) - Forum */}
          <div className="w-full md:flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-[#1E293B] cursor-pointer hover:text-[#0046CE]" onClick={() => navigate('/forum')}>{t('forum.communityTitle', 'Community Forum')}</h2>
              <button 
                onClick={() => navigate('/forum', { state: { showCreateModal: true } })}
                className="bg-[#0046CE] hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm transition"
              >
                {t('forum.askQuestion', 'Ask a Question')}
              </button>
            </div>
            
            <div className="space-y-3">
              {forumLoading ? (
                <div className="space-y-3">
                  <div className="h-20 rounded-xl bg-[#F8FAFC] animate-pulse border border-[#E2E8F0]" />
                  <div className="h-20 rounded-xl bg-[#F8FAFC] animate-pulse border border-[#E2E8F0]" />
                </div>
              ) : forumPosts.length > 0 ? forumPosts.map(post => {
                  const answersCount = Array.isArray(post.answers) ? post.answers.length : 0;
                  const hasVetAnswer = Array.isArray(post.answers) && post.answers.some((answer) => answer.isVet === true);
                  const authorName = post.isAnonymous ? 'Anonymous' : post.author?.name || 'Member';
                  
                  return (
                    <div key={post._id} onClick={() => navigate(`/forum/${post._id}`)} className="group rounded-xl p-3 -mx-3 cursor-pointer hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                        <span className="font-medium text-[#1E293B]">{authorName}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      {hasVetAnswer && (
                        <div className="bg-[#F0FDF4] text-[#166534] text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full w-fit font-medium mb-2 uppercase tracking-wide">
                          <Check className="w-3 h-3" /> {t('forum.vetVerified', 'VET VERIFIED')}
                        </div>
                      )}
                      <h3 className="text-sm font-medium text-[#1E293B] line-clamp-2">{translateDynamic(post.title, i18n.language)}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B]">
                        <MessageSquare className="w-3 h-3" /> {answersCount} {t('forum.answers', 'answers')}
                      </div>
                    </div>
                  );
              }) : (
                <div className="rounded-xl p-3 text-xs text-[#64748B] bg-slate-50">
                  {t('forum.noRecent', 'No recent forum posts.')}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/forum')}
              className="w-full mt-auto pt-4 text-center text-sm font-medium text-[#0046CE] hover:underline"
            >
              {t('articles.browseDiscussions', 'Browse all discussions →')}
            </button>
          </div>
          
        </div>

        {/* Latest Insights Header */}
        <div className="flex flex-col gap-4 mt-10 mb-4 border-t border-[#E2E8F0] pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{t('articles.latestInsights', 'Latest Health Insights')}</h2>
            <p className="text-sm text-[#64748B] mt-1">
              {t('articles.browseDesc', 'Browse featured reads or search by topic, category, or season.')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end w-full lg:w-auto">
            <label className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={articleQuery}
                onChange={(event) => {
                  setArticleQuery(event.target.value);
                  setShowAllArticles(false);
                }}
                placeholder={t('articles.searchPlaceholder', 'Search articles')}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-9 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#0046CE] focus:ring-2 focus:ring-[#0046CE]/10"
              />
            </label>

            {articles.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllArticles((current) => !current)}
                className="text-sm font-medium text-[#0046CE] cursor-pointer hover:underline sm:whitespace-nowrap"
              >
                {showAllArticles ? t('articles.showFewer', 'Show fewer articles') : t('articles.seeAll', 'See all articles')}
              </button>
            )}
          </div>
        </div>

        {/* Article list */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-[#F8FAFC] rounded-xl animate-pulse border border-[#E2E8F0]" />)
          ) : visibleArticles.length > 0 ? (
            visibleArticles.map((article) => {
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
                  {article.imageUrl ? (
                    <div className="w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-24 h-40 sm:h-24 rounded-lg bg-[#F1F5F9] flex-shrink-0 flex items-center justify-center text-3xl">
                      📰
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                    <div>
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {translateDynamic(article.category, i18n.language) || t('articles.medical', 'MEDICAL')}
                      </span>
                      <h3 className="text-base font-semibold text-[#1E293B] mt-1.5 line-clamp-1">{translateDynamic(article.title, i18n.language)}</h3>
                      <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{translateDynamic(article.summary || article.excerpt || article.content, i18n.language)}</p>
                    </div>
                    
                    <div className="text-sm text-[#0046CE] mt-3 font-medium flex items-center gap-1 group">
                      {t('articles.viewDetails', 'View Details')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#64748B]">
              {articleQuery.trim()
                ? t('articles.noMatch', 'No articles match "{{query}}". Try a different keyword or clear the search.', { query: articleQuery.trim() })
                : t('articles.noneFound', 'No articles found. Check back later for new insights!')}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}