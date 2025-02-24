// app/blogs/[id]/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import connectToDatabase from '../../../lib/mongodb';
import Blog from '../../../models/Blog';

export default function BlogPage({ params }) {
  const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!blog) {
    // Fetch blog data client-side (since this is a Client Component)
    fetchBlog(params.id).then((data) => {
      setBlog(data);
      setTitle(data.title);
      setContent(data.content);
    });
    return <p>Loading blog...</p>;
  }

  const isAuthor = session && session.user.id === blog.author._id;

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/blogs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blog._id, title, content }),
    });
    if (res.ok) {
      router.push('/');
    } else {
      alert('Failed to update blog');
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/blogs?id=${blog._id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      router.push('/');
    } else {
      alert('Failed to delete blog');
    }
  };

  return (
    <div>
      <h1>{blog.title}</h1>
      <p>{blog.content}</p>
      <p>By: {blog.author.email}</p>
      {blog.images.length > 0 && (
        <div>
          <h2>Images</h2>
          {blog.images.map((image, index) => (
            <img key={index} src={image.url} alt={`Image ${index + 1}`} width="200" />
          ))}
        </div>
      )}
      {blog.documents.length > 0 && (
        <div>
          <h2>Documents</h2>
          {blog.documents.map((doc, index) => (
            <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer">
              Document {index + 1}
            </a>
          ))}
        </div>
      )}
      {isAuthor && (
        <>
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <button type="submit">Update</button>
          </form>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
}

async function fetchBlog(id) {
  await connectToDatabase();
  const blog = await Blog.findById(id).populate('author', 'email').lean();
  return JSON.parse(JSON.stringify(blog));
}