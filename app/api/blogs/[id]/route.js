import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Blog from '../../../../models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const id = await context.params.id;
    const session = await getServerSession(authOptions);

    const blog = await Blog.findById(id)
      .populate('author', 'email username')
      .populate({
        path: 'likes',
        select: 'email username',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'comments.author',
        select: 'email username',
        options: { strictPopulate: false }
      })
      .lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Transform the blog data to include proper counts and structures
    const transformedBlog = {
      ...blog,
      _id: blog._id.toString(),
      author: {
        _id: blog.author._id.toString(),
        email: blog.author.email,
        username: blog.author.username
      },
      likes: (blog.likes || []).map(like => ({
        _id: like._id.toString(),
        email: like.email,
        username: like.username
      })),
      comments: (blog.comments || []).map(comment => ({
        _id: comment._id.toString(),
        content: comment.content,
        author: comment.author ? {
          _id: comment.author._id.toString(),
          email: comment.author.email,
          username: comment.author.username
        } : null,
        createdAt: comment.createdAt
      })),
      likesCount: blog.likes?.length || 0,
      commentsCount: blog.comments?.length || 0,
      userLiked: session ? blog.likes?.some(like => like._id.toString() === session.user.id) : false
    };

    return NextResponse.json(transformedBlog);
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { error: 'Failed to get blog' },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await req.json();
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
    console.error('Update blog error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
} 