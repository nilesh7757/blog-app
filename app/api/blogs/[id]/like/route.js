import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import Blog from '../../../../../models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, context) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    if (!session) {
      return NextResponse.json(
        { message: 'Please login to like this blog' },
        { status: 401 }
      );
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const userIdStr = userId.toString();

    // Find if user has already liked
    const hasLiked = blog.likes.some(like => like.toString() === userIdStr);

    // Toggle like status
    if (hasLiked) {
      blog.likes = blog.likes.filter(like => like.toString() !== userIdStr);
    } else {
      blog.likes.push(userId);
    }

    // Save the updated blog
    await blog.save();

    // Return updated like status
    return NextResponse.json({
      likesCount: blog.likes.length,
      userLiked: !hasLiked,
      message: hasLiked ? 'Like removed' : 'Blog liked'
    });

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { message: 'Unable to update like status' },
      { status: 500 }
    );
  }
} 