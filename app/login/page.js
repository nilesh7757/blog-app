// app/login/page.js
'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Login() {
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res.error) {
      alert('Login failed: ' + res.error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
      <br />
      <button onClick={() => signIn('github')}>Sign in with GitHub</button>
      <br />
      <form onSubmit={handleCredentialsSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign in with Credentials</button>
      </form>
      <p>
        <Link href="/register">Register</Link> |{' '}
        <Link href="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
  );
}