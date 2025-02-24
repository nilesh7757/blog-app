// app/api/register/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../../lib/email';

export async function POST(req) {
  await connectToDatabase();
  const { email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = new User({
    email,
    password: hashedPassword,
    verificationToken,
    emailVerified: false,
  });

  await user.save();
  await sendVerificationEmail(email, verificationToken);
  return NextResponse.json({ message: 'User created, please verify your email' }, { status: 201 });
}