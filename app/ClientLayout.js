'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </SessionProvider>
  );
}

// Separate component to use the session
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

function ClientLayoutContent({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header>
        <nav>
          <Link href="/">Home</Link> |{' '}
          <Link href="/create">Create Blog</Link> |{' '}
          {session ? (
            <>
              <span>Welcome, {session.user.email}</span> |{' '}
              <button onClick={() => signOut({ callbackUrl: '/login' })}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link> |{' '}
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>© 2025 Blog App</p>
      </footer>
    </>
  );
}