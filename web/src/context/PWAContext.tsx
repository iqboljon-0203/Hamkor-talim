'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  deferredPrompt: any;
  isInstalled: boolean;
  isInstallModalOpen: boolean;
  isIOS: boolean;
  isMobile: boolean;
  /** Android qurilma */
  isAndroid: boolean;
  /** Telegram/Instagram/Gmail kabi ilova ichidagi brauzer — o'rnatishni qo'llamaydi */
  isInAppBrowser: boolean;
  /** iOS'da Safari emas (Chrome/Firefox) — Bosh ekranga faqat Safari qo'shadi */
  isIOSNonSafari: boolean;
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
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isIOSNonSafari, setIsIOSNonSafari] = useState(false);
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
    setIsAndroid(/Android/i.test(ua));
    // Android WebView ('; wv)') va mashhur ilovalarning ichki brauzerlari
    setIsInAppBrowser(
      /; wv\)|FBAN|FBAV|Instagram|Telegram|Line\/|MicroMessenger|GSA\/|Snapchat|TikTok/i.test(ua)
    );
    setIsIOSNonSafari(isAppleDevice && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua));

    // <head> dagi skript ushlab qolgan o'rnatish hodisasi
    const w = window as any;
    if (w.__pwaPrompt) setDeferredPrompt(w.__pwaPrompt);
    if (w.__pwaInstalled) setIsInstalled(true);
    const handleEarlyPrompt = () => setDeferredPrompt(w.__pwaPrompt);
    window.addEventListener('pwa-prompt-ready', handleEarlyPrompt);

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
      window.removeEventListener('pwa-prompt-ready', handleEarlyPrompt);
    };
  }, []);

  const showModal = () => setIsInstallModalOpen(true);
  const closeInstallModal = () => setIsInstallModalOpen(false);

  /** Brauzerning o'rnatish oynasi mavjud bo'lsa — darhol uni ochadi, aks holda ko'rsatma oynasini */
  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      showModal();
      return false;
    }

    const prompt = deferredPrompt;
    // prompt() faqat bir marta chaqirilishi mumkin
    setDeferredPrompt(null);
    (window as any).__pwaPrompt = null;
    try {
      await prompt.prompt();
      const choiceResult = await prompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        closeInstallModal();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[PWA] O\'rnatishda xatolik:', err);
      showModal();
      return false;
    }
  };

  // Saytdagi barcha "O'rnatish" tugmalari: imkon bo'lsa bitta bosishda o'rnatish
  const openInstallModal = () => {
    void installApp();
  };

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        isInstallModalOpen,
        isIOS,
        isMobile,
        isAndroid,
        isInAppBrowser,
        isIOSNonSafari,
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
