'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-midnight text-ivory flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-6xl">⚖️</span>
      <h1 className="text-3xl font-black text-goldLight font-display tracking-wide">404 - Sayfa Bulunamadı</h1>
      <p className="text-xs text-softGrey max-w-sm leading-relaxed">
        Aradığınız hukuki işlem, dosya veya sayfa mevcut değil ya da silinmiş olabilir. Lütfen ana panele dönün.
      </p>
      <a 
        href="/" 
        className="px-5 py-2.5 bg-gradient-to-r from-goldDark to-amberAccent text-midnight text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:scale-105"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  );
}
