import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Badge, Card, VerifiedBadge } from '../../components/ui';
import { getArticle } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItem } from '../../utils/api';
import { getImageUrl } from '../../utils/imageUrl';
import { useToast } from '../../context/ToastContext';

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
      <Card className="p-8">
        <div className="flex items-center gap-4">
          <Avatar src={getImageUrl(article.author?.profilePhoto || article.author?.imageUrl)} alt={article.author?.name || article.authorName || 'Vet'} name={article.author?.name || article.authorName || 'Vet'} size="md" />
          <div>
            <div className="flex items-center gap-2"><p className="font-semibold text-neutral-900 text-lg">{article.author?.name || article.authorName || 'Vet author'}</p><VerifiedBadge /></div>
            <p className="text-body-md text-neutral-500">{formatDate(article.publishedAt || article.createdAt)}</p>
          </div>
        </div>
        <Badge className="mt-4" variant="primary">{article.category || 'General'}</Badge>
        
        <h1 className="mt-8 font-display text-4xl text-neutral-900 leading-tight">{article.title}</h1>
        
        <article className="prose prose-neutral mt-8 max-w-none flow-root">
          {article.imageUrl && (
            <img
              src={getImageUrl(article.imageUrl)}
              alt={article.title}
              className="w-full md:w-1/4 md:float-left md:mr-8 md:mb-6 mb-6 md:mt-1 object-cover aspect-[4/3] rounded-2xl shadow-sm"
            />
          )}
          <div className="text-body-md text-neutral-700 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </article>
      </Card>
    </div>
  );
}