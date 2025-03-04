import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../../lib/mongodb';
import Blog from '../../../../../models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, context) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate blog ID
    const id = context.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      console.error('Invalid user ID:', session.user.id);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Parse request body
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Find the blog post
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Create the comment with explicit ObjectId for author
    const newComment = {
      content: content.trim(),
      author: new mongoose.Types.ObjectId(session.user.id),
      createdAt: new Date(),
    };

    // Add comment to blog and save
    blog.comments.push(newComment);
    const savedBlog = await blog.save();

    // Get the newly added comment
    const savedComment = savedBlog.comments[savedBlog.comments.length - 1];

    // Return the comment with author info
    return NextResponse.json({
      _id: savedComment._id.toString(),
      content: savedComment.content,
      author: {
        _id: session.user.id,
        email: session.user.email,
        username: session.user.username || session.user.email,
      },
      createdAt: savedComment.createdAt,
    });
  } catch (error) {
    // Log the detailed error for debugging
    console.error('Comment addition error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const id = context.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const blog = await Blog.findById(id)
      .populate({
        path: 'comments.author',
        select: 'username email',
        options: { strictPopulate: false },
      })
      .select('comments')
      .lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (!blog.comments || blog.comments.length === 0) {
      return NextResponse.json([]);
    }

    // Format comments, handling cases where author might not populate
    const formattedComments = blog.comments.map((comment) => ({
      _id: comment._id,
      content: comment.content,
      author: comment.author
        ? {
            _id: comment.author._id,
            email: comment.author.email,
            username: comment.author.username,
          }
        : null,
      createdAt: comment.createdAt,
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to get comments', details: error.message },
      { status: 500 }
    );
  }
}