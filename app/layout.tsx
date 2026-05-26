import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SWRegistration } from '@/components/SWRegistration';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#1DA652',
};

export const metadata: Metadata = {
  title: 'ForKisan AI',
  description: 'A voice-first crop help assistant for Indian farmers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ForKisan AI',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col">
        {children}
        <SWRegistration />
      </body>
    </html>
  );
}
