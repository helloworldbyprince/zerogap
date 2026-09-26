import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: `${CONFIG.app.name} · ${CONFIG.app.tagline}`,
  description:
    'AI-powered GST reconciliation copilot for Indian small businesses and CAs. Bills in, GSTR-1 out. Zero gap, zero notice.',
  keywords: [
    'GST reconciliation',
    'GSTR-1',
    'GSTR-2B',
    'GSTR-3B',
    'Rule 88D',
    'DRC-01C',
    'Document AI',
    'Indian GST copilot',
    'MSME finance',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0C10] text-[#ECEDEE] antialiased selection:bg-[#F5A524] selection:text-black">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12161D',
              border: '1px solid #232B36',
              color: '#ECEDEE',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
