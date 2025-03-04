// app/layout.js
import ClientLayout from './ClientLayout';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'BlogApp by Nilesh Mori',
  description: 'A modern blog application built with Next.js and MongoDB by Nilesh Mori. Share your thoughts and connect with others.',
  authors: [{ name: 'Nilesh Mori' }],
  keywords: ['blog', 'nextjs', 'mongodb', 'react', 'web development'],
  creator: 'Nilesh Mori',
  openGraph: {
    title: 'BlogApp by Nilesh Mori',
    description: 'A modern blog application built with Next.js and MongoDB',
    url: 'https://blog-app.nileshmori.com',
    siteName: 'BlogApp',
    images: [
      {
        url: 'https://blog-app.nileshmori.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};