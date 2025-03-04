// app/api/register/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, username } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Create new user with username
    const newUser = await User.create({
      email,
      username,
      name: username,
    });

    console.log('User created:', {
      id: newUser._id.toString(),
      username: newUser.username
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          username: newUser.username,
          name: newUser.name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}