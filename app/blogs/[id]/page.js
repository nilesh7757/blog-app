// app/blogs/[id]/page.js
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Github, Linkedin, PenSquare, Trash2, User, ArrowLeft } from 'lucide-react';

export default function BlogPage({ params }) {
  // Use React.use() to unwrap the params promise
  const { id } = use(params);
  const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  async function fetchBlog() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch blog');
      }

      setBlog(data);
      setTitle(data.title);
      setContent(data.content);
      setLikesCount(data.likesCount || 0);
      setComments(data.comments || []);
      setUserLiked(data.userLiked || false);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blog:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLike = async () => {
    if (!session) {
      setError('Please login to like this blog');
      return;
    }

    try {
      setIsLiking(true);
      setError(null);
      
      const res = await fetch(`/api/blogs/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Please try again later');
        return;
      }

      setLikesCount(data.likesCount);
      setUserLiked(data.userLiked);
      
      setBlog(prevBlog => ({
        ...prevBlog,
        likesCount: data.likesCount,
        userLiked: data.userLiked
      }));

      setError(null);
    } catch (err) {
      setError('Unable to update like status. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!session || !session.user?.id) {
      setError('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Sending comment request:', {
        url: `/api/blogs/${id}/comments`,
        body: { content: newComment.trim() },
        user: session.user,
      });

      const res = await fetch(`/api/blogs/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to post comment';
        throw new Error(errorMessage);
      }

      const newCommentWithAuthor = {
        ...data,
        author: {
          _id: session.user.id,
          email: session.user.email,
          username: session.user.username || session.user.email,
        },
      };

      setComments(prevComments => [...prevComments, newCommentWithAuthor]);
      setBlog(prevBlog => ({
        ...prevBlog,
        comments: [...prevBlog.comments, newCommentWithAuthor],
        commentsCount: (prevBlog.commentsCount || 0) + 1,
      }));

      setNewComment('');
    } catch (err) {
      console.error('Comment submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update blog');
      }

      setIsEditing(false);
      fetchBlog();
    } catch (err) {
      console.error('Error updating blog:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const res = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          throw new Error('Failed to delete blog');
        }

        router.push('/');
      } catch (err) {
        console.error('Error deleting blog:', err);
      }
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Link
          href="/"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">Blog post not found</div>
        <Link
          href="/"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = session && blog.author && session.user.id === blog.author._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft size={20} />
        Back to Posts
      </Link>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 text-2xl font-bold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 h-64 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <User size={20} className="text-gray-500" />
                <span className="text-gray-700">{blog.author.username || blog.author.email}</span>
              </div>
              <div className="text-gray-500">
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  disabled={isLiking || !session}
                  className="flex items-center gap-1 text-red-500 disabled:opacity-50"
                >
                  <Heart 
                    size={20} 
                    className={userLiked ? 'fill-current' : ''} 
                  />
                  <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageCircle size={20} />
                  <span>{comments.length}</span>
                </div>
              </div>

              {isAuthor && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <PenSquare size={20} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {blog.author.username === 'nileshmori' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Author</h2>
              <p className="text-gray-700 mb-6">
                Hi, I'm Nilesh Mori! I'm passionate about technology and love sharing my knowledge through blog posts.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/nileshmori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Github size={20} />
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/nileshmori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Linkedin size={20} />
                  LinkedIn
                </a>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
            
            {session ? (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className={`mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-gray-600">
                  Please{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    log in
                  </Link>{' '}
                  to leave a comment.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <AnimatePresence>
                {Array.isArray(comments) && comments.map((comment) => (
                  <motion.div
                    key={comment?._id || `temp-${Date.now()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-b border-gray-100 pb-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="font-medium text-gray-900">
                        {comment?.author?.username || comment?.author?.email || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {comment?.createdAt && formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment?.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Removed duplicate fetchBlog function since it's already defined inline