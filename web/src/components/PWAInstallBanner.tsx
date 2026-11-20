'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Smartphone, Download, X } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

export default function PWAInstallBanner() {
  const pathname = usePathname();
  const { isInstalled, isMobile, openInstallModal } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isInstalled || dismissed || pathname?.startsWith('/dashboard')) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Hamkor Ta'lim Mobil Ilovasi
            </div>
            <div className="text-[11px] text-slate-500 hidden sm:block">
              {isMobile
                ? "Telefoningizga qulay mobil ilova sifatida o'rnating"
                : 'Mobil ilova sifatida telefonga yoki kompyuterga yuklab olish mumkin'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openInstallModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Yuklab olish</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Yopish"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
