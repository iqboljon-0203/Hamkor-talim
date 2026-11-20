'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { GraduationCap, Menu, X, Smartphone, ArrowRight } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { openInstallModal } = usePWA();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const isHome = pathname === '/';

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const scrollTo = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);

    if (!isHome) {
      router.push(`/#${sectionId}`);
      return;
    }

    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const feat = (document.getElementById('imkoniyatlar')?.offsetTop || 700) - 150;
      const teach = (document.getElementById('oqituvchilarga')?.offsetTop || 1400) - 150;
      const stud = (document.getElementById('oquvchilarga')?.offsetTop || 1800) - 150;
      const pwa = (document.getElementById('pwa')?.offsetTop || 2200) - 150;

      if (scrollY < feat) {
        setActiveSection('hero');
      } else if (scrollY < teach) {
        setActiveSection('imkoniyatlar');
      } else if (scrollY < stud) {
        setActiveSection('oqituvchilarga');
      } else if (scrollY < pwa) {
        setActiveSection('oquvchilarga');
      } else {
        setActiveSection('pwa');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base sm:text-lg text-white tracking-wider leading-tight">
              HAMKOR TA'LIM
            </div>
            <div className="text-[10px] text-white/60 tracking-wider">
              ZAMONAVIY TA'LIM TIZIMI
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => scrollTo('hero')}
            className={`text-xs font-semibold tracking-wider transition-colors py-1 relative ${
              activeSection === 'hero' && isHome
                ? 'text-amber-400 font-bold'
                : 'text-white/75 hover:text-white'
            }`}
          >
            ASOSIY
            {activeSection === 'hero' && isHome && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => scrollTo('imkoniyatlar')}
            className={`text-xs font-semibold tracking-wider transition-colors py-1 relative ${
              activeSection === 'imkoniyatlar' && isHome
                ? 'text-amber-400 font-bold'
                : 'text-white/75 hover:text-white'
            }`}
          >
            IMKONIYATLAR
            {activeSection === 'imkoniyatlar' && isHome && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => scrollTo('oqituvchilarga')}
            className={`text-xs font-semibold tracking-wider transition-colors py-1 relative ${
              activeSection === 'oqituvchilarga' && isHome
                ? 'text-amber-400 font-bold'
                : 'text-white/75 hover:text-white'
            }`}
          >
            O'QITUVCHILARGA
            {activeSection === 'oqituvchilarga' && isHome && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => scrollTo('oquvchilarga')}
            className={`text-xs font-semibold tracking-wider transition-colors py-1 relative ${
              activeSection === 'oquvchilarga' && isHome
                ? 'text-amber-400 font-bold'
                : 'text-white/75 hover:text-white'
            }`}
          >
            O'QUVCHILARGA
            {activeSection === 'oquvchilarga' && isHome && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              scrollTo('pwa');
              openInstallModal();
            }}
            className={`text-xs font-semibold tracking-wider transition-colors py-1 relative ${
              activeSection === 'pwa' && isHome
                ? 'text-amber-400 font-bold'
                : 'text-white/75 hover:text-white'
            }`}
          >
            ILOVA (PWA)
            {activeSection === 'pwa' && isHome && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={openInstallModal}
            className="lg:hidden p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
            title="Ilovani o'rnatish"
          >
            <Smartphone className="w-5 h-5" />
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <span>KABINET</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs tracking-wider transition-all shadow-md"
            >
              KIRISH
            </Link>
          )}

          {/* Hamburger Menu Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-white/10 px-4 py-4 space-y-1">
          <button
            onClick={() => scrollTo('hero')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
              activeSection === 'hero' ? 'bg-amber-500/15 text-amber-400' : 'text-white/80'
            }`}
          >
            ASOSIY
          </button>

          <button
            onClick={() => scrollTo('imkoniyatlar')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
              activeSection === 'imkoniyatlar' ? 'bg-amber-500/15 text-amber-400' : 'text-white/80'
            }`}
          >
            IMKONIYATLAR
          </button>

          <button
            onClick={() => scrollTo('oqituvchilarga')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
              activeSection === 'oqituvchilarga' ? 'bg-amber-500/15 text-amber-400' : 'text-white/80'
            }`}
          >
            O'QITUVCHILARGA
          </button>

          <button
            onClick={() => scrollTo('oquvchilarga')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
              activeSection === 'oquvchilarga' ? 'bg-amber-500/15 text-amber-400' : 'text-white/80'
            }`}
          >
            O'QUVCHILARGA
          </button>

          <button
            onClick={() => {
              scrollTo('pwa');
              openInstallModal();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
              activeSection === 'pwa' ? 'bg-amber-500/15 text-amber-400' : 'text-white/80'
            }`}
          >
            ILOVA (PWA) O'RNATISH
          </button>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>TIZIMGA KIRISH</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
