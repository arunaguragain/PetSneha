import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Badge, Card, VerifiedBadge } from '../../components/ui';
import { getArticle } from '../../api/content.api';
import { formatDate, getErrorMessage, unwrapItem } from '../../utils/api';
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
    <div className="container-app max-w-4xl px-10 py-8">
      <Link to="/articles" className="font-semibold text-neutral-600 hover:text-primary-600">← Back to articles</Link>
      <Card className="mt-4 p-8">
        <div className="flex items-center gap-3">
          <Avatar name={article.author?.name || article.authorName || 'Vet'} size="lg" />
          <div>
            <div className="flex items-center gap-2"><p className="font-semibold text-neutral-900">{article.author?.name || article.authorName || 'Vet author'}</p><VerifiedBadge /></div>
            <p className="text-body-md text-neutral-500">{formatDate(article.publishedAt || article.createdAt)}</p>
          </div>
        </div>
        <Badge className="mt-4" variant="primary">{article.category || 'General'}</Badge>
        <h1 className="mt-4 font-display text-4xl text-neutral-900">{article.title}</h1>
        <article className="prose prose-neutral mt-6 max-w-none">
          <p className="text-body-md text-neutral-600">{article.content}</p>
        </article>
      </Card>
    </div>
  );
}