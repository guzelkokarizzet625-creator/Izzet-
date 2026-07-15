import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AL Hukuk AI — Akıllı Dava Simülatörü & Hukuk Asistanı',
  description: 'Türkiye\'nin en gelişmiş yapay zekâ destekli hukuk asistanı, akıllı dava simülatörü, dilekçe stüdyosu ve sözleşme risk analizi platformu.',
  keywords: 'hukuk ai, yapay zeka avukat, dava simülasyonu, dilekçe yazma, sözleşme analizi, ocr, sesli avukat, duruşma takibi',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="bg-midnight text-ivory min-h-screen antialiased selection:bg-goldDark selection:text-midnight">
        {children}
      </body>
    </html>
  );
}
