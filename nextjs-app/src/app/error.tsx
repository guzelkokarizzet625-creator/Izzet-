'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-midnight text-ivory flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-6xl">⚠️</span>
      <h1 className="text-3xl font-black text-red-400 font-display tracking-wide">Sistem Hatası</h1>
      <p className="text-xs text-softGrey max-w-sm leading-relaxed">
        Beklenmeyen bir sistemsel kesinti meydana geldi. Güvenli kalkanımız (Active Shield) devreye girdi.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-red-500/15 text-red-400 border border-red-500/25 text-xs font-bold rounded-xl transition-all hover:bg-red-500/25"
        >
          Yeniden Dene
        </button>
        <a 
          href="/" 
          className="px-5 py-2.5 bg-charcoal border border-slateGrey/60 text-ivory text-xs font-bold rounded-xl transition-all hover:bg-slateGrey/20"
        >
          Ana Sayfa
        </a>
      </div>
    </div>
  );
}
