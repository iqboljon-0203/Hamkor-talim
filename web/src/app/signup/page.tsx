'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (password !== confirmPassword) {
      setError('Kiritilgan parollar bir-biriga mos kelmadi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        role
      );

      if (signUpError) {
        if (signUpError.message?.includes('already registered')) {
          setError("Bu email manzili allaqachon ro'yxatdan o'tgan");
        } else {
          setError(signUpError.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Kutilmagan xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900/50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 text-slate-900">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </Link>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 leading-tight">
              Hamkor Ta'lim
            </h2>
            <p className="text-[10px] text-slate-500 tracking-wider">
              ZAMONAVIY TA'LIM TIZIMI
            </p>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
          Ro'yxatdan o'tish
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
          O'zingizga mos rolni tanlang va platformaga qo'shiling
        </p>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Rolingizni tanlang
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  role === 'student'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">O'quvchi</div>
                  <div className="text-[11px] text-slate-500">Vazifalarni bajaring</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  role === 'teacher'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">O'qituvchi</div>
                  <div className="text-[11px] text-slate-500">Guruh boshqaring</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              To'liq ismingiz
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ism va familiyangiz"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email manzilingiz
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Parol
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Parolni tasdiqlang
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni qayta kiriting"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yaratilmoqda...</span>
              </>
            ) : (
              <span>Hisob yaratish</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-600">
          <span>Hisobingiz bormi? </span>
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Kirish
          </Link>
        </div>
      </div>
    </div>
  );
}
