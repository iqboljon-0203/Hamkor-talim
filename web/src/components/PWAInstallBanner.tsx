'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
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
    <div className="bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-4 py-2 sticky top-0 z-50 transition-all shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          </div>
          <div className="truncate">
            <div className="text-xs sm:text-sm font-extrabold text-white leading-tight flex items-center gap-1.5 truncate">
              <span>Hamkor Ta'lim Ilovasi</span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                PWA 2.0
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 truncate">
              {isMobile
                ? "Telefoningizga 1 bosishda o'rnating"
                : 'Mobil ilova sifatida telefonga yuklab oling'}
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openInstallModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">O'rnatish</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Yopish"
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
