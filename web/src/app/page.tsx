'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  Award,
  Zap,
  ChevronRight,
  Download,
  Star,
  ShieldCheck,
  ChevronDown,
  GraduationCap,
} from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

export default function HomePage() {
  const { openInstallModal, siteUrl } = usePWA();
  const [activeRoleTab, setActiveRoleTab] = useState<'teacher' | 'student'>('teacher');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentUrl = mounted && siteUrl ? siteUrl : 'https://hamkor-talim.vercel.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    currentUrl
  )}`;

  const faqs = [
    {
      q: "Hamkor Ta'lim mobil ilovasini qanday o'rnatish mumkin?",
      a: "Ilovani to'g'ridan-to'g'ri brauzeringiz orqali Play Market yoki App Store'siz o'rnatishingiz mumkin. Saytdagi 'Ilovani o'rnatish' tugmasini bosing yoki telefoningiz kamerasi bilan ekrandagi QR kodni skanerlang. Android tizimida 1-bosishda, iPhone Safari-da esa 'Ulashish -> Bosh ekranga qo'shish' orqali o'rnatiladi.",
    },
    {
      q: "O'qituvchilar uchun tizimda qanday qulayliklar bor?",
      a: "O'qituvchilar cheksiz sinflar va to'garaklar uchun guruhlar ochishi, fayllar (PDF, Word, rasmlar) bilan topshiriqlar yuklashi, o'quvchilar yuborgan javoblarni tizimda tekshirib 5 ballik shkalada baholashi va shaxsiy tavsiyalar qoldirishi mumkin.",
    },
    {
      q: "Internet tezligi past bo'lsa ham ishlaydimi?",
      a: "Ha! Hamkor Ta'lim zamonaviy PWA (Progressive Web App) texnologiyasi asosida qurilgan. U barcha statik resurslarni xotirada keshlaydi, atigi ~2 MB joy egallaydi va sekin internetda ham tez ochiladi.",
    },
    {
      q: "O'quvchilar o'z natijalarini qanday kuzatib boradi?",
      a: "Har bir o'quvchi o'z kabinetida barcha faol topshiriqlar, yaqinlashib kelayotgan muddatlar, olgan baholari va ustozining izohlarini bir joyda ko'rib, o'zlashtirish tahlilini kuzatib borishi mumkin.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* ===================== HERO SECTION ===================== */}
      <section
        id="hero"
        className="relative min-h-[720px] lg:min-h-[840px] flex items-center justify-center pt-8 pb-16 lg:py-24 overflow-hidden"
      >
        {/* Ambient Glowing Orbs Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-amber-500/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Tag Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider backdrop-blur-md shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '8s' }} />
                <span>YAGONA RAQAMLI TA'LIM PLATFORMASI 2.0</span>
              </div>

              {/* Grand Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[68px] font-black text-white tracking-tight leading-[1.08]">
                O'RGANING.<br />
                O'RGATING.<br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  RIVOJLANING.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                O'qituvchi va o'quvchilar uchun zamonaviy raqamli ta'lim maydoni.
                Topshiriqlarni boshqarish, guruhlar tizimi, shaffof 5 ballik baholash va
                uzluksiz ta'lim jarayonini bir platformada birlashtiring.
              </p>

              {/* Social Proof / Rating Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 py-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-sm">A</div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-slate-950 shadow-sm">M</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-sm">D</div>
                  <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-sm">S</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <div className="flex text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <span className="font-bold text-white">4.9/5</span>
                  <span className="text-slate-400">· 1,500+ faol o'quvchilar</span>
                </div>
              </div>

              {/* Action Buttons with High-Impact Animations */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-extrabold text-sm tracking-wider transition-all shadow-xl shadow-amber-500/25 group"
                >
                  <span>TIZIMGA KIRISH</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm tracking-wide backdrop-blur-md transition-all active:scale-95"
                >
                  RO'YXATDAN O'TISH
                </Link>

                <button
                  onClick={openInstallModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-all shadow-md active:scale-95"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>ILOVANI YUKLASH</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Showcase Card & Animated Badges */}
            <div className="lg:col-span-5 relative">
              {/* Glass Showcase Frame */}
              <div className="relative rounded-3xl p-3 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl backdrop-blur-xl group">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero-bg.jpg"
                    alt="Hamkor Ta'lim Interfeysi"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Inner caption */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-semibold text-white">Jonli ta'lim tizimi</span>
                    </div>
                    <span className="text-amber-400 font-bold">PWA 2.0</span>
                  </div>
                </div>

                {/* Floating Notification Badge 1 (Top Left) */}
                <div className="absolute -top-6 -left-6 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 shadow-xl backdrop-blur-md animate-float-slow">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Vazifa baholandi</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">5 ball · A'lo natija</div>
                  </div>
                </div>

                {/* Floating Notification Badge 2 (Bottom Right) */}
                <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 shadow-xl backdrop-blur-md animate-float-reverse">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">10-A Sinf Guruhi</div>
                    <div className="text-[10px] text-blue-400 font-semibold">28 ta o'quvchi faol</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== METRICS STRIP ===================== */}
      <section className="border-y border-white/10 bg-slate-900/60 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1">1,500+</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Faol O'quvchilar</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-blue-400 mb-1">120+</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tuzilgan Guruhlar</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">15,000+</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Topshirilgan Vazifalar</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-purple-400 mb-1">99.9%</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ishonchli va Tezkor</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BENTO GRID 2.0 ===================== */}
      <section id="imkoniyatlar" className="py-14 sm:py-20 lg:py-24 bg-white text-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              IMKONIYATLAR
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mt-3 mb-4 leading-tight">
              Zamonaviy ta'limni boshqarish uchun barcha vositalar
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Qog'ozbozlik va ortiqcha chalkashliklarsiz — o'qituvchi va o'quvchilar uchun
              yagona, tezkor va shaffof raqamli tizim.
            </p>
          </div>

          {/* Row 1: 3 Bento Cards with Real Generated Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 1: Groups with Collaboration Image */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden">
              <div>
                <div className="w-full h-36 rounded-2xl overflow-hidden mb-6 bg-slate-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/collaboration.jpg"
                    alt="Hamkorlik va guruhlar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Guruhlar boshqaruvi
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Sinflar va to'garaklar bo'yicha alohida guruhlar yarating,
                  o'quvchilarni a'zo qiling va o'quv jarayonini bir joydan nazorat qiling.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 py-2 px-3.5 rounded-xl border border-blue-200/60 w-fit">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Cheksiz guruhlar va o'quvchilar</span>
              </div>
            </div>

            {/* Card 2: Tasks */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden">
              <div>
                <div className="w-full h-36 rounded-2xl overflow-hidden mb-6 bg-slate-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/teacher-showcase.jpg"
                    alt="Topshiriqlar va vazifalar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Topshiriqlar va Vazifalar
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Fayllar (PDF, Word, rasmlar) bilan vazifalar bering. O'quvchilar o'z
                  javoblarini telefon yoki kompyuter orqali bir zumda yuklashadi.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 py-2 px-3.5 rounded-xl border border-amber-200/60 w-fit">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Fayl va rasm yuklash imkoniyati</span>
              </div>
            </div>

            {/* Card 3: Calendar */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden">
              <div>
                <div className="w-full h-36 rounded-2xl overflow-hidden mb-6 bg-slate-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/student-showcase.jpg"
                    alt="Aqlli taqvim va muddatlar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Aqlli taqvim va Muddatlar
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Barcha vazifalar muddati va dars kunlari avtomatik tartibda taqvimda
                  aks etadi. Hech bir topshiriq nazoratdan chetda qolmaydi.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 py-2 px-3.5 rounded-xl border border-emerald-200/60 w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Avtomatik dedlayn eslatmalari</span>
              </div>
            </div>
          </div>

          {/* Row 2: 2 Bento Cards with Images */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 4 (7 cols) */}
            <div className="md:col-span-7 p-7 sm:p-9 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mb-6">
                <div className="sm:col-span-7">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                    Shaffof baholash va Fikr-mulohazalar
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    O'qituvchilar topshirilgan vazifalarni to'g'ridan-to'g'ri tizimda
                    tekshirib, 5 ballik shkalada baholaydi va o'quvchiga shaxsiy tavsiya yozadi.
                  </p>
                </div>
                <div className="sm:col-span-5 h-36 rounded-2xl overflow-hidden relative shadow-md bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero-bg.jpg"
                    alt="Baholash jarayoni"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white">
                    5 ballik tizim
                  </div>
                </div>
              </div>

              {/* Feedback Simulation Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">5</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">"Mustaqil ish a'lo darajada bajarildi"</div>
                    <div className="text-[11px] text-slate-500">Ustoz: Alisher Qodirov</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">Shaffof</span>
              </div>
            </div>

            {/* Card 5 (5 cols) Dark PWA Card */}
            <div className="md:col-span-5 p-7 sm:p-9 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                    PWA Mobil Ilova
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Play Market kutmasdan bir bosishda telefoningizga o'rnatiladi.
                  </p>
                </div>

                <div className="w-24 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg bg-slate-900 hidden sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/pwa-mockup.png"
                    alt="PWA Phone Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              <button
                onClick={openInstallModal}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit pt-2 group-hover:translate-x-1 duration-200"
              >
                <span>Ilovani yuklab olish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTERACTIVE ROLES SECTION WITH REAL IMAGES ===================== */}
      <section id="oqituvchilarga" className="py-14 sm:py-20 lg:py-24 bg-slate-900 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              KIMLAR UCHUN?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 leading-tight">
              O'qituvchi va o'quvchilar uchun maxsus moslashtirilgan
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Quyidagi rolingizni tanlab, platforma sizga taqdim etadigan barcha imkoniyatlar bilan tanishing:
            </p>

            {/* Interactive Toggle Pill */}
            <div className="inline-flex p-1 sm:p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mt-6 sm:mt-8 shadow-lg max-w-full">
              <button
                onClick={() => setActiveRoleTab('teacher')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeRoleTab === 'teacher'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>O'qituvchilarga</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeRoleTab === 'student'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>O'quvchilarga</span>
              </button>
            </div>
          </div>

          {/* Role Experience Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl transition-all">
            {activeRoleTab === 'teacher' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <span className="px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    Ustozlar Kabineti
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Ta'lim jarayonini 10 barobar oson va shaffof boshqaring
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Kundalik qog'oz tekshiruvlar, daftarlar va yo'qolgan topshiriqlarni unuting.
                    Hamkor Ta'lim orqali dars jadvali va uy vazifalarini bir zumda tarqating.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Cheksiz sinf va to'garaklar ochish</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>PDF, Word va rasm fayllarini yuklash</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Topshirilgan ishlarni onlayn baholash</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Guruh statistikasi va faollik tahlili</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                    >
                      <span>O'qituvchi sifatida boshlash</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Real Teacher Image Showcase Box */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 shadow-xl group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/teacher-showcase.jpg"
                    alt="O'qituvchi kabineti jarayoni"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Ustoz va o'quvchi jonli muloqoti</span>
                    <span className="text-blue-400 font-bold">100% Shaffof</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    O'quvchilar Kabineti
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Vazifalarni vaqtida bajaring, yuqori natijalarga erishing
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Barcha guruhlaringiz va uyga vazifalar bitta qulay ekranda.
                    Javoblaringizni telefon kamerasi bilan rasmga olib yoki fayl shaklida yuboring.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Barcha dars vazifalari bitta joyda</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Kamera orqali tezkor rasm yuklash</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ustoz bahosi va izohlarini bir zumda ko'rish</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Shaxsiy rivojlanish va o'zlashtirish tahlili</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
                    >
                      <span>O'quvchi sifatida boshlash</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Real Student Image Showcase Box */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 shadow-xl group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/student-showcase.jpg"
                    alt="O'quvchi mobil ilovadan foydalanmoqda"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Topshiriqni muvaffaqiyatli topshirish</span>
                    <span className="text-emerald-400 font-bold">5 ball ★★★★★</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================== PWA APP PROMOTION & 3D PHONE MOCKUP & QR CODE ===================== */}
      <section id="pwa" className="py-14 sm:py-20 lg:py-24 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-12 lg:p-16 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="max-w-lg relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
                <Smartphone className="w-4 h-4" />
                <span>PWA MOBIL ILOVA TEXNOLOGIYASI</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                Hamkor Ta'lim ilovasini telefoningizga o'rnating
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
                Ilovani Play Market yoki App Store kutmasdan, to'g'ridan-to'g'ri telefoningizga
                o'rnatib oling. U atigi ~2 MB joy egallaydi, xuddi mobil ilovadek tez va qulay ishlaydi.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Android va iPhone (iOS) tizimlarida 100% qo'llab-quvvatlanadi</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Internet trafigini sezilarli tejash va offline kesh</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Telefon bosh ekranida chiroyli ikonka bilan joylashadi</span>
                </div>
              </div>

              <button
                onClick={openInstallModal}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-blue-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Ilovani o'rnatish oynasini ochish</span>
              </button>
            </div>

            {/* Right: 3D Phone Mockup + Live QR Code */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 shrink-0">
              {/* Real 3D Phone Mockup */}
              <div className="w-56 sm:w-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-float-slow bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pwa-mockup.png"
                  alt="Hamkor Ta'lim 3D PWA ilovasi"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center bg-white text-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-40 h-40 rounded-2xl mb-3 shadow-sm"
                />
                <div className="text-xs font-bold text-slate-900 text-center">
                  Kamerangiz bilan skanerlang
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono break-all max-w-[170px] text-center">
                  {currentUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              SAVOLLAR VA JAVOBLAR
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Tez-tez so'raladigan savollar
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-900 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FINAL HIGH-IMPACT CTA ===================== */}
      <section className="py-20 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ta'limni yangi bosqichga olib chiqishga tayyormisiz?
            </h2>
            <p className="text-sm text-slate-300 mb-8 max-w-xl mx-auto">
              Hamkor Ta'lim tizimiga qo'shiling. O'quvchilaringiz bilimini shaffof
              baholang va jarayonni qulay boshqaring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all active:scale-95"
              >
                Hoziroq Ro'yxatdan O'tish
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                Mavjud hisob bilan kirish
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
