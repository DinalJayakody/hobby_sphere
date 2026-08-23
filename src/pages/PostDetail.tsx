import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PostCard from '../components/home/PostCard';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { FileQuestion } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Post } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, fetchPostById } = useData();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const post: Post | undefined = posts.find((p) => p.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    fetchPostById(id)
      .then((result) => {
        if (!result) setNotFound(true);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-navy-900 dark:to-surface">
      <Navbar />
      <div className="max-w-xl mx-auto px-2 sm:px-0 pt-20 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading && !post && <PostCardSkeleton />}

        {!loading && notFound && !post && (
          <EmptyState
            icon={FileQuestion}
            title="Post not found"
            subtitle="This post may have been deleted or the link is incorrect."
            className="bg-surface rounded-2xl shadow-soft border border-border"
          />
        )}

        {post && <PostCard post={post} autoExpandComments />}
      </div>
    </div>
  );
};

export default PostDetail;
