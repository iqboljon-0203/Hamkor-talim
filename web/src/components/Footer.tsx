'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

export default function Footer() {
  const pathname = usePathname();
  const { openInstallModal } = usePWA();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-base text-white tracking-wider">
                HAMKOR TA'LIM
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Zamonaviy ta'lim vazifalarini boshqarish, guruhlar tizimi va o'quvchilar bilimini baholashning raqamli platformasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Bosh sahifa
            </Link>
            <Link href="/login" className="hover:text-amber-400 transition-colors">
              Kirish
            </Link>
            <Link href="/signup" className="hover:text-amber-400 transition-colors">
              Ro'yxatdan o'tish
            </Link>
            <button
              onClick={openInstallModal}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Ilovani o'rnatish (PWA)
            </button>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            Hamkor Ta'lim Enterprise © 2026. Barcha huquqlar himoyalangan.
          </div>
          <div>
            O'zbekiston Respublikasi zamonaviy raqamli ta'lim tizimi
          </div>
        </div>
      </div>
    </footer>
  );
}
