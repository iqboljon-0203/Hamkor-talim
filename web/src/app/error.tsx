'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Xatolik yuz berdi</h2>
      {error?.message ? (
        <code className="text-[11px] text-slate-500 max-w-sm break-words mb-4">
          {error.name}: {error.message.slice(0, 200)}
        </code>
      ) : null}
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors"
      >
        Qayta urinish
      </button>
    </div>
  );
}
