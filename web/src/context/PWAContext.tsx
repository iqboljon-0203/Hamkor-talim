'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  deferredPrompt: any;
  isInstalled: boolean;
  isInstallModalOpen: boolean;
  isIOS: boolean;
  isMobile: boolean;
  siteUrl: string;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  installApp: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [siteUrl, setSiteUrl] = useState('https://hamkor-talim.uz');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setSiteUrl(window.location.origin);

    const ua = navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(mobileCheck);

    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const openInstallModal = () => setIsInstallModalOpen(true);
  const closeInstallModal = () => setIsInstallModalOpen(false);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      openInstallModal();
      return false;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        closeInstallModal();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[PWA] O\'rnatishda xatolik:', err);
      openInstallModal();
      return false;
    }
  };

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        isInstallModalOpen,
        isIOS,
        isMobile,
        siteUrl,
        openInstallModal,
        closeInstallModal,
        installApp,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
