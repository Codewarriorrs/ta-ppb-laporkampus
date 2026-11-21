import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import { PwaProvider } from '@/components/pwa/PwaProvider';

export const metadata: Metadata = {
  title: 'LaporKampus - Pelaporan Fasilitas Kampus',
  description: 'Aplikasi Progressive Web App untuk pelaporan fasilitas dan sarana prasarana kampus',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LaporKampus',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-slate-100 flex justify-center antialiased">
        <PwaProvider>
          {/* Mobile-first centered frame container (maksimal 480px di desktop) */}
          <div className="w-full max-w-[480px] min-h-screen bg-gray-50 flex flex-col shadow-2xl relative border-x border-gray-200/60 pb-20">
            <main className="flex-1 flex flex-col">{children}</main>
            <BottomNav />
          </div>
        </PwaProvider>
      </body>
    </html>
  );
}
