'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, MailCheck } from 'lucide-react';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Status = 'loading' | 'success' | 'confirmed-no-session' | 'error';

function readParams() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const get = (k: string) => query.get(k) ?? hash.get(k);
  return {
    code: query.get('code'),
    tokenHash: get('token_hash'),
    type: get('type') as EmailOtpType | null,
    accessToken: hash.get('access_token'),
    errorCode: get('error_code'),
    errorDescription: get('error_description'),
  };
}

function translateError(code: string | null, description: string | null) {
  const text = `${code ?? ''} ${description ?? ''}`.toLowerCase();
  if (text.includes('expired')) {
    return "Tasdiqlash havolasining muddati tugagan yoki u allaqachon ishlatilgan. Yangi havola so'rang.";
  }
  if (text.includes('invalid')) {
    return "Tasdiqlash havolasi noto'g'ri. Xatdagi havolani to'liq ochganingizga ishonch hosil qiling yoki yangi havola so'rang.";
  }
  return description || 'Emailni tasdiqlashda xatolik yuz berdi.';
}

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { resendConfirmation } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState('');

  useEffect(() => {
    let cancelled = false;

    const finish = (next: Status, msg = '') => {
      if (cancelled) return;
      setStatus(next);
      setMessage(msg);
      if (next === 'success') {
        setTimeout(() => router.replace('/dashboard'), 1500);
      }
    };

    const run = async () => {
      const p = readParams();

      if (p.errorCode || p.errorDescription) {
        finish('error', translateError(p.errorCode, p.errorDescription));
        return;
      }

      try {
        // 1) Email shablonida token_hash ishlatilgan bo'lsa
        if (p.tokenHash && p.type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: p.tokenHash, type: p.type });
          if (error) return finish('error', translateError(error.code ?? null, error.message));
          return finish('success');
        }

        // 2) PKCE oqimi (?code=...)
        if (p.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(p.code);
          if (!error) return finish('success');
          // Havola boshqa brauzer yoki qurilmada ochilgan: email tasdiqlangan, lekin sessiya yo'q
          return finish('confirmed-no-session');
        }

        // 3) Implicit oqim (#access_token=...) — supabase-js uni avtomatik o'qiydi
        for (let i = 0; i < 20; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) return finish('success');
          if (!p.accessToken) break;
          await new Promise((r) => setTimeout(r, 250));
        }

        if (p.accessToken) {
          finish('error', "Sessiyani ochib bo'lmadi. Iltimos, tizimga qayta kiring.");
        } else {
          finish('confirmed-no-session');
        }
      } catch (err: any) {
        finish('error', err?.message || 'Kutilmagan xatolik');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResending(true);
    setResendInfo('');
    const { error } = await resendConfirmation(email.trim());
    setResending(false);
    if (!error) {
      setResendInfo('Yangi tasdiqlash xati yuborildi. Pochtangizni (va Spam papkasini) tekshiring.');
    } else if (error.message?.toLowerCase().includes('rate') || error.status === 429) {
      setResendInfo("Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.");
    } else {
      setResendInfo(error.message || 'Xatni yuborib bo\'lmadi');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900/50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 text-slate-900 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin mb-4" />
            <h1 className="text-xl font-black mb-1">Email tasdiqlanmoqda...</h1>
            <p className="text-sm text-slate-500">Bir necha soniya kuting.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-500 mb-4" />
            <h1 className="text-2xl font-black mb-2">Email tasdiqlandi! 🎉</h1>
            <p className="text-sm text-slate-500 mb-6">Kabinetingizga yo&apos;naltirilmoqdasiz...</p>
            <Link
              href="/dashboard"
              className="inline-flex justify-center w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors"
            >
              Kabinetga o&apos;tish
            </Link>
          </>
        )}

        {status === 'confirmed-no-session' && (
          <>
            <MailCheck className="w-14 h-14 mx-auto text-emerald-500 mb-4" />
            <h1 className="text-2xl font-black mb-2">Email tasdiqlandi</h1>
            <p className="text-sm text-slate-500 mb-6">Endi email va parolingiz bilan tizimga kiring.</p>
            <Link
              href="/login"
              className="inline-flex justify-center w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors"
            >
              Kirish
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-14 h-14 mx-auto text-rose-500 mb-4" />
            <h1 className="text-2xl font-black mb-2">Tasdiqlab bo&apos;lmadi</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>

            <form onSubmit={handleResend} className="space-y-3 text-left">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Yangi havola olish
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={resending || !email.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resending && <Loader2 className="w-4 h-4 animate-spin" />}
                Tasdiqlash xatini qayta yuborish
              </button>
              {resendInfo && <p className="text-xs text-slate-600 text-center">{resendInfo}</p>}
            </form>

            <Link href="/login" className="inline-block mt-5 text-xs font-semibold text-blue-600">
              Kirish sahifasiga qaytish
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
