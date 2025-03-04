'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, PenSquare, LogIn, UserPlus, LogOut, User } from 'lucide-react';

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </SessionProvider>
  );
}

function ClientLayoutContent({ children }) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      display: "block"
    },
    closed: {
      opacity: 0,
      transitionEnd: {
        display: "none"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text hover:opacity-80 transition-opacity"
              >
                BlogApp
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Home size={18} />
                Home
              </Link>
              {session ? (
                <>
                  <Link
                    href="/create"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <PenSquare size={18} />
                    Create Blog
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <User size={18} />
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={18} />
                      <span className="text-sm">{session.user.username}</span>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="text-gray-700 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <UserPlus size={18} />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white/80 backdrop-blur-md shadow-sm"
        >
          <Menu size={24} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={overlayVariants.open}
                exit={overlayVariants.closed}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={sidebarVariants.open}
                exit={sidebarVariants.closed}
                className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <Link 
                      href="/" 
                      className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      BlogApp
                    </Link>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home size={20} />
                      Home
                    </Link>
                    {session ? (
                      <>
                        <Link
                          href="/create"
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <PenSquare size={20} />
                          Create Blog
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User size={20} />
                          Dashboard
                        </Link>
                        <div className="border-t border-gray-200 my-4" />
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-3 text-gray-700 mb-4">
                            <User size={20} />
                            <span className="text-sm">{session.user.username}</span>
                          </div>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              signOut({ callbackUrl: '/login' });
                            }}
                            className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <LogOut size={20} />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LogIn size={20} />
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserPlus size={20} />
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <main className="pt-20 md:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} BlogApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}