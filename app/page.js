// app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      const formattedBlogs = data.map(blog => ({
        ...blog,
        _id: blog._id.toString(),
        author: blog.author ? {
          _id: blog.author._id?.toString(),
          email: blog.author.email,
          username: blog.author.username || blog.author.email
        } : null,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      }));

      setBlogs(formattedBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
          Latest Blog Posts
        </h1>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <PenSquare size={20} />
          Write a Post
        </Link>
      </div>

      <div className="grid gap-6">
        {blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No blog posts yet. Be the first to create one!
          </div>
        ) : (
          blogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/blogs/${blog._id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{blog.author?.username || blog.author?.email || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}