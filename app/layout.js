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
  title: 'Blog App',
  description: 'A simple blog application with Next.js and MongoDB',
};