'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-black text-amber-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Sahifa topilmadi</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md">
        Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
