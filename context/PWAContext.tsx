import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface PWAContextType {
  deferredPrompt: any;
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  installApp: () => Promise<boolean>;
  siteUrl: string;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    setSiteUrl(window.location.origin);

    // Check if running in standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect device type
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(ua);
    setIsIOS(isIosDevice);
    setIsMobile(isMobileDevice);

    // Listen for beforeinstallprompt event (Chromium browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt event ushlandi');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('[PWA] Ilova muvaffaqiyatli o\'rnatildi');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsModalOpen(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const openInstallModal = () => setIsModalOpen(true);
  const closeInstallModal = () => setIsModalOpen(false);

  const installApp = async (): Promise<boolean> => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Foydalanuvchi o\'rnatishni tasdiqladi');
        setDeferredPrompt(null);
        setIsModalOpen(false);
        return true;
      }
    }
    return false;
  };

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        isInstallable: !!deferredPrompt || isIOS,
        isIOS,
        isMobile,
        isModalOpen,
        openInstallModal,
        closeInstallModal,
        installApp,
        siteUrl,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    return {
      deferredPrompt: null,
      isInstalled: false,
      isInstallable: false,
      isIOS: false,
      isMobile: false,
      isModalOpen: false,
      openInstallModal: () => {},
      closeInstallModal: () => {},
      installApp: async () => false,
      siteUrl: '',
    };
  }
  return context;
};
