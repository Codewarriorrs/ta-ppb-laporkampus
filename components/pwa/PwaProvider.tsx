'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<boolean>;
}

const PwaContext = createContext<PwaContextType>({
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: false,
  installApp: async () => false,
});

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Daftarkan Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker LaporKampus aktif:', registration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ Pendaftaran Service Worker:', error);
        });
    }

    // 2. Cek apakah aplikasi sudah terinstall dalam mode standalone
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // 3. Tangani event beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log('📱 Event beforeinstallprompt tertangkap, siap untuk install PWA');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('🎉 PWA LaporKampus berhasil diinstal!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User menerima instalasi PWA');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('User menolak instalasi PWA');
        return false;
      }
    } catch (err) {
      console.error('Error saat prompt install PWA:', err);
      return false;
    }
  };

  return (
    <PwaContext.Provider
      value={{
        deferredPrompt,
        isInstallable,
        isInstalled,
        installApp,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
