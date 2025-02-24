// app/page.js
import connectToDatabase from '../lib/mongodb';
import Blog from '../models/Blog';
import Link from 'next/link';

export default async function Home() {
  await connectToDatabase();
  const blogs = await Blog.find({}).populate('author', 'email').lean();

  return (
    <div>
      <h1>Blogs</h1>
      <ul>
        {blogs.map((blog) => (
          <li key={blog._id}>
            <Link href={`/blogs/${blog._id}`}>{blog.title}</Link> - by{' '}
            {blog.author.email}
          </li>
        ))}
      </ul>
    </div>
  );
}