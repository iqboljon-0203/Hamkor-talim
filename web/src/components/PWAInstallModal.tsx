'use client';

import React from 'react';
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle,
  Download,
  QrCode,
  Laptop,
} from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

export default function PWAInstallModal() {
  const {
    isInstallModalOpen,
    closeInstallModal,
    installApp,
    isIOS,
    isMobile,
    siteUrl,
    deferredPrompt,
  } = usePWA();

  if (!isInstallModalOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    siteUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeInstallModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
              Hamkor Ta'lim Ilovasi
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tezkor, qulay va internet tejovchi PWA ilova
            </p>
          </div>
        </div>

        {/* Content depending on device */}
        {isIOS ? (
          /* iOS Instructions */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-medium">
              iPhone (iOS) Safari brauzerida 3 ta oddiy qadam bilan ekranga o'rnatiladi:
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <span>Brauzer pastidagi</span>
                  <Share className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Ulashish (Share)</span>
                  <span>tugmasini bosing</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <span>Menyudan</span>
                  <PlusSquare className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Bosh ekranga qo'shish</span>
                  <span>ni tanlang</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  Yuqori o'ng burchakdagi <span className="font-semibold text-blue-600">Qo'shish (Add)</span> tugmasini bosing.
                </div>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          /* Native 1-Click Install for Android/Chrome */
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Ilovani Play Market kutmasdan to'g'ridan-to'g'ri telefoningiz yoki kompyuteringizga o'rnating. U atigi ~2 MB joy oladi va to'liq mobil ilovadek ishlaydi.
            </p>

            <div className="space-y-2 py-1">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Internet trafigini sezilarli darajada tejaydi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Offline rejim va tezkor ochilish</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Bosh ekranda chiroyli ikonka bilan joylashadi</span>
              </div>
            </div>

            <button
              onClick={installApp}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Hozir o'rnatish</span>
            </button>
          </div>
        ) : (
          /* Desktop QR Code & Instructions */
          <div className="space-y-4 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Telefoningiz kamerasi orqali QR kodni skanerlang va ilovani darhol ochib o'rnating:
            </p>

            <div className="flex justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100 inline-block mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-44 h-44 rounded-xl shadow-sm"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-100 p-2 rounded-lg">
              {siteUrl}
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-center gap-2 pt-1">
              <Laptop className="w-4 h-4 text-slate-400" />
              <span>Kompyuter brauzerida ham manzil qatoridagi <b>Install</b> belgisini bosishingiz mumkin.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
