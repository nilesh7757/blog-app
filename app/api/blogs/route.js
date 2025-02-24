// app/api/blogs/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Blog from '../../../models/Blog';
import { getServerSession } from 'next-auth/next';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function GET() {
  await connectToDatabase();
  const blogs = await Blog.find({}).populate('author', 'email').lean();
  return NextResponse.json(blogs);
}

export async function POST(req) {
  await connectToDatabase();
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const title = formData.get('title');
  const content = formData.get('content');
  const files = formData.getAll('files');

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${Date.now()}-${file.name}`,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        ACL: 'public-read',
      };
      const data = await s3.upload(params).promise();
      return { url: data.Location, key: data.Key, ContentType: file.type };
    })
  );

  const blog = new Blog({
    title,
    content,
    author: session.user.id,
    images: uploadedFiles.filter((file) => file.ContentType.startsWith('image')),
    documents: uploadedFiles.filter((file) => !file.ContentType.startsWith('image')),
  });

  await blog.save();
  return NextResponse.json(blog, { status: 201 });
}

export async function PUT(req) {
  await connectToDatabase();
  const session = await getServerSession();

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
}

export async function DELETE(req) {
  await connectToDatabase();
  const session = await getServerSession();

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

  await blog.remove();
  return NextResponse.json({ message: 'Blog deleted' });
}