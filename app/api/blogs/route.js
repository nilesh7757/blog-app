// app/api/blogs/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Blog from '../../../models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
// import aws from 'aws-sdk';

// const s3 = new aws.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

export async function GET() {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({})
      .populate('author', 'email username')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the blog data
    const transformedBlogs = blogs.map(blog => ({
      _id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      author: blog.author ? {
        _id: blog.author._id.toString(),
        email: blog.author.email,
        username: blog.author.username || blog.author.email
      } : null,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      likesCount: blog.likes?.length || 0,
      commentsCount: blog.comments?.length || 0
    }));

    return NextResponse.json(transformedBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { title, content } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const blog = new Blog({
      title,
      content,
      author: session.user.id,
    });

    await blog.save();

    // Populate author information before sending response
    await blog.populate('author', 'email username');

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, content } = await req.json();
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (blog.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    blog.title = title;
    blog.content = content;
    await blog.save();
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (blog.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await blog.deleteOne();
    return NextResponse.json({ message: 'Blog deleted' });
  } catch (error) {
    console.error('Blog deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}