'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resendConfirmation, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState('');

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email va parolni kiriting');
      return;
    }

    setLoading(true);
    setError('');
    setUnconfirmed(false);
    setResendInfo('');

    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        if (
          signInError.code === 'email_not_confirmed' ||
          signInError.message?.toLowerCase().includes('email not confirmed')
        ) {
          setUnconfirmed(true);
          setError(
            "Email manzilingiz hali tasdiqlanmagan. Pochtangizdagi tasdiqlash havolasini bosing."
          );
        } else if (signInError.message?.includes('Invalid login credentials')) {
          setError("Noto'g'ri email yoki parol kiritildi");
        } else {
          setError(signInError.message || 'Tizimga kirishda xatolik');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendInfo('');
    const { error: resendError } = await resendConfirmation(email.trim());
    setResending(false);
    if (!resendError) {
      setResendInfo('Tasdiqlash xati qayta yuborildi. Pochtangizni (va Spam papkasini) tekshiring.');
    } else if (resendError.status === 429 || resendError.message?.toLowerCase().includes('rate')) {
      setResendInfo("Juda ko'p urinish. Bir daqiqadan keyin qayta urinib ko'ring.");
    } else {
      setResendInfo(resendError.message || "Xatni yuborib bo'lmadi");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900/50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 text-slate-900">
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
          Xush kelibsiz! 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
          Hisobingizga kiring va ta'limni davom ettiring
        </p>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {unconfirmed && (
          <div className="-mt-2 mb-5">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {resending && <Loader2 className="w-4 h-4 animate-spin" />}
              Tasdiqlash xatini qayta yuborish
            </button>
            {resendInfo && <p className="text-xs text-slate-600 mt-2 text-center">{resendInfo}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Parol
              </label>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolingiz"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <span>Kirish</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-600">
          <span>Hisobingiz yo'qmi? </span>
          <Link
            href="/signup"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Ro'yxatdan o'ting
          </Link>
        </div>
      </div>
    </div>
  );
}
