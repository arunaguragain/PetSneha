import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Badge, Card, VerifiedBadge } from '../../components/ui';
import { getArticle } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItem } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft } from 'lucide-react';

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getArticle(articleId);
        setArticle(unwrapItem(response, 'article'));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast, articleId]);

  if (loading) {
    return <Card className="p-8">Loading...</Card>;
  }

  if (!article) {
    return <Card className="p-8">Article not found.</Card>;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-10">
      <div className="flex items-center justify-end mb-4">
        <Link 
          to="/articles" 
          className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </Link>
      </div>
      <Card className="p-8">
        <div className="flex items-center gap-3">
          <Avatar name={article.author?.name || article.authorName || 'Vet'} size="lg" />
          <div>
            <div className="flex items-center gap-2"><p className="font-semibold text-neutral-900">{article.author?.name || article.authorName || 'Vet author'}</p><VerifiedBadge /></div>
            <p className="text-body-md text-neutral-500">{formatDate(article.publishedAt || article.createdAt)}</p>
          </div>
        </div>
        <Badge className="mt-4" variant="primary">{article.category || 'General'}</Badge>
        
        {article.imageUrl && (
          <img 
            src={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5050'}${article.imageUrl}`} 
            alt={article.title} 
            className="w-full max-h-96 object-cover rounded-xl mt-6 shadow-sm"
          />
        )}
        
        <h1 className="mt-4 font-display text-4xl text-neutral-900">{article.title}</h1>
        <article className="prose prose-neutral mt-6 max-w-none">
          <p className="text-body-md text-neutral-600">{article.content}</p>
        </article>
      </Card>
    </div>
  );
}