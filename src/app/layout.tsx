import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { CONFIG } from '@/lib/config';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
});

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
    <html lang="en" className={lexend.variable}>
      <body className="min-h-screen bg-[#F6F7F9] text-[#111418] antialiased selection:bg-[#F5A524] selection:text-[#1A1A1A] font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E3E7EE',
              color: '#111418',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              fontFamily: 'var(--font-lexend)',
            },
          }}
        />
      </body>
    </html>
  );
}
