// app/api/verify/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(req) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();
  return NextResponse.json({ message: 'Email verified' });
}