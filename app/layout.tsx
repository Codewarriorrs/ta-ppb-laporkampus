import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import DesktopNavbar from '@/components/layout/DesktopNavbar';
import { PwaProvider } from '@/components/pwa/PwaProvider';
import { OfflineSyncBanner } from '@/components/pwa/OfflineSyncBanner';

export const metadata: Metadata = {
  title: 'LaporKampus - Pelaporan Fasilitas Kampus',
  description: 'Sistem pelaporan fasilitas dan sarana prasarana kampus berbasis web modern',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/LaporKampus_Icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
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
  themeColor: '#6d5ae6',
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
      <body className="min-h-screen bg-background text-neutral-800 antialiased flex flex-col font-sans">
        <PwaProvider>
          <OfflineSyncBanner />
          {/* Desktop Top Navbar */}
          <DesktopNavbar />

          {/* Main Layout Container */}
          <div className="w-full md:max-w-6xl md:mx-auto flex-1 flex flex-col max-w-[480px] mx-auto pb-20 md:pb-8 shadow-xs md:shadow-none bg-white md:bg-transparent min-h-screen">
            <main className="flex-1 flex flex-col">{children}</main>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </PwaProvider>
      </body>
    </html>
  );
}
