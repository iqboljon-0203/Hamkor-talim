'use client';

import { useEffect } from 'react';

const RELOAD_FLAG = 'hamkor-chunk-reload';

function isChunkError(error: Error) {
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    `${error?.name} ${error?.message}`
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // Yangi deploy'dan keyin eski chunk topilmasa — bir marta avtomatik yangilaymiz
    if (isChunkError(error)) {
      try {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1');
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error]);

  const hardReload = async () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // e'tiborsiz
    }
    window.location.reload();
  };

  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          background: '#020617',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Xatolik yuz berdi</h2>
        <p style={{ color: '#94a3b8', margin: 0, maxWidth: 360 }}>
          Ilova yangilangan bo'lishi mumkin. Sahifani yangilab ko'ring.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={hardReload}
            style={{ padding: '10px 20px', borderRadius: 12, border: 0, background: '#f59e0b', color: '#020617', fontWeight: 700 }}
          >
            Yangilash
          </button>
          <button
            onClick={() => reset()}
            style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #334155', background: 'transparent', color: '#f8fafc', fontWeight: 600 }}
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
