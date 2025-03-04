// app/page.js
import connectToDatabase from '../lib/mongodb';
import Blog from '../models/Blog';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function Home() {
  await connectToDatabase();
  
  try {
    const blogs = await Blog.find({})
      .populate('author', 'email username')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const formattedBlogs = blogs.map(blog => ({
      ...blog,
      _id: blog._id.toString(),
      author: blog.author ? {
        _id: blog.author._id.toString(),
        email: blog.author.email,
        username: blog.author.username || blog.author.email
      } : null,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    }));

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
          {formattedBlogs.map((blog) => (
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
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-red-500">Failed to load blogs. Please try again later.</div>
      </div>
    );
  }
}