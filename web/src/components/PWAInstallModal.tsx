'use client';

import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle,
  Download,
  QrCode,
  Laptop,
  ExternalLink,
  Copy,
  Check,
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
    isInstalled,
    isAndroid,
    isInAppBrowser,
    isIOSNonSafari,
  } = usePWA();

  if (!isInstallModalOpen) return null;

  const siteHost = siteUrl.replace(/^https?:\/\//, '');

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
        {isInstalled ? (
          <div className="space-y-4 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
            <p className="text-sm text-slate-700 font-semibold">
              Ilova bu qurilmada allaqachon o&apos;rnatilgan. Uni bosh ekrandagi «Hamkor» belgisi orqali oching.
            </p>
          </div>
        ) : isInAppBrowser ? (
          /* Telegram / Instagram / Gmail ichidagi brauzer — o'rnatish imkoni yo'q */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-medium">
              Sayt hozir boshqa ilova (Telegram, Instagram, Gmail va h.k.) ichida ochilgan. Bunday oynada ilovani o&apos;rnatib bo&apos;lmaydi — saytni <b>{isIOS ? 'Safari' : 'Chrome'}</b> brauzerida oching.
            </div>
            {isAndroid ? (
              <a
                href={`intent://${siteHost}/#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(siteUrl)};end`}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Chrome&apos;da ochish</span>
              </a>
            ) : (
              <StepList
                steps={[
                  <>Yuqori yoki pastki burchakdagi <b>⋯</b> / <b>Ulashish</b> tugmasini bosing</>,
                  <><b>«Safari&apos;da ochish»</b> (Open in Safari) ni tanlang</>,
                  <>Safari&apos;da yana <b>«Ilovani o&apos;rnatish»</b> tugmasini bosing</>,
                ]}
              />
            )}
            <CopyLinkButton url={siteUrl} />
          </div>
        ) : isIOSNonSafari ? (
          /* iPhone'da Chrome/Firefox — bosh ekranga faqat Safari qo'shadi */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-medium">
              iPhone&apos;da ilovani faqat <b>Safari</b> brauzeri orqali o&apos;rnatish mumkin. Havolani nusxalab, Safari&apos;da oching.
            </div>
            <CopyLinkButton url={siteUrl} />
          </div>
        ) : isIOS ? (
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
        ) : isMobile ? (
          /* Android (yoki boshqa telefon), brauzer o'rnatish oynasini bermadi — menyu orqali */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/60 text-xs text-blue-900 leading-relaxed font-medium">
              Ilovani brauzer menyusi orqali 2 qadamda o&apos;rnating:
            </div>
            <StepList
              steps={[
                <>Yuqori o&apos;ng burchakdagi <b>⋮</b> (Chrome) yoki pastdagi <b>≡</b> (Samsung Internet) menyusini bosing</>,
                <><b>«Ilovani o&apos;rnatish»</b> yoki <b>«Bosh ekranga qo&apos;shish»</b> ni tanlang va tasdiqlang</>,
              ]}
            />
            <p className="text-[11px] text-slate-500 text-center">
              Menyuda bu band bo&apos;lmasa, saytni <b>Google Chrome</b> brauzerida oching.
            </p>
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

function StepList({ steps }: { steps: React.ReactNode[] }) {
  return (
    <div className="space-y-3 text-sm text-slate-700">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {i + 1}
          </div>
          <div className="flex-1 leading-snug">{step}</div>
        </div>
      ))}
    </div>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="w-full py-3 rounded-2xl border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
      <span>{copied ? 'Havola nusxalandi' : `Havolani nusxalash (${url.replace(/^https?:\/\//, '')})`}</span>
    </button>
  );
}
