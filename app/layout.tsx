import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import DesktopNavbar from '@/components/layout/DesktopNavbar';
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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <PwaProvider>
          {/* Desktop Top Navbar (Muncul hanya di layar desktop/tablet md ke atas) */}
          <DesktopNavbar />

          {/* Main Layout Container:
              - Mobile (< md): Terpusat max-w-[480px] dengan frame border halus & padding-bottom untuk bottom-nav
              - Desktop (>= md): Melebar rapi dengan max-w-6xl terpusat dan tanpa frame sempit
          */}
          <div className="w-full md:max-w-6xl md:mx-auto flex-1 flex flex-col max-w-[480px] mx-auto pb-20 md:pb-8 shadow-xs md:shadow-none bg-white md:bg-transparent min-h-screen">
            <main className="flex-1 flex flex-col">{children}</main>
          </div>

          {/* Mobile Bottom Navigation (Muncul hanya di layar HP < md) */}
          <BottomNav />
        </PwaProvider>
      </body>
    </html>
  );
}
