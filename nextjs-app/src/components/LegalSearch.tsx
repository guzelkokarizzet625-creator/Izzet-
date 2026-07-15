'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  Loader2, 
  BookOpen, 
  History, 
  ArrowRight,
  HelpCircle,
  Copy,
  CheckCircle
} from 'lucide-react';

export default function LegalSearch() {
  const { 
    searchResult, 
    searchLoading, 
    runAiLegalSearch, 
    sessions 
  } = useApp();

  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const searchSessions = sessions.filter(s => s.type === 'SEARCH');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await runAiLegalSearch(query);
  };

  const handleSelectSession = (title: string) => {
    setQuery(title);
    runAiLegalSearch(title);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(searchResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recommendedQueries = [
    "WhatsApp mesajları iş davalarında kesin delil başlangıcı sayılır mı?",
    "Kiracının tahliye taahhütnamesinde tarih boş bırakılırsa geçerliliği ne olur?",
    "Aşırı cezai şart maddesinin hâkim tarafından indirilmesi (tenkisi) koşulları nelerdir?",
    "Yöneticinin hakaret etmesi durumunda işçinin haklı nedenle feshi ve tazminat hakları"
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <Search className="w-5 h-5 text-goldDark" />
          Yapay Zekâ Destekli Hukuki Arama Terminali
        </h1>
        <p className="text-xs text-softGrey">
          Güncel Türk mevzuatı, kanun maddeleri ve Yargıtay emsal kararlarını saniyeler içinde tarayın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Search Panel */}
        <div className="lg:col-span-8 space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Hukuki sorunuzu yazın (Örn: Kira alacağı zaman aşımı süresi nedir?)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-midnight border border-slateGrey/60 px-4 py-3 rounded-xl text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-bold text-xs px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shrink-0 flex items-center gap-2 disabled:opacity-50"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Ara
                </>
              )}
            </button>
          </form>

          {searchLoading ? (
            <div className="p-12 text-center space-y-3 bg-midnight rounded-xl border border-slateGrey/40">
              <Loader2 className="w-8 h-8 animate-spin text-goldDark mx-auto" />
              <h4 className="text-xs font-bold text-goldLight">Hukuk Veritabanı Taranıyor</h4>
              <p className="text-[10px] text-softGrey max-w-xs mx-auto">
                Mevzuat maddeleri, yerleşik Yargıtay içtihatları ve doktrin makaleleri analiz edilerek hukuki raporunuz tanzim ediliyor...
              </p>
            </div>
          ) : searchResult ? (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4">
              <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-goldDark" />
                  Hukuki Arama Çıktısı
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-amberAccent hover:underline flex items-center gap-1.5 bg-charcoal px-2.5 py-1 rounded border border-slateGrey/60 font-semibold"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-successGreen" />
                      Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sonuçları Kopyala
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap prose prose-invert">
                {searchResult}
              </div>
            </div>
          ) : (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-3">
              <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-goldDark" />
                Örnek Arama Başlıkları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {recommendedQueries.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSession(q)}
                    className="p-3 bg-charcoal hover:bg-charcoal/80 rounded-lg border border-slateGrey/30 cursor-pointer text-[11px] text-softGrey hover:text-goldLight transition-colors flex justify-between items-start gap-2"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 text-goldDark shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Panel */}
        <div className="lg:col-span-4 bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
          <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
            <History className="w-4 h-4 text-amberAccent" />
            Arama Geçmişi
          </h2>

          {searchSessions.length === 0 ? (
            <p className="text-[11px] text-softGrey italic">Henüz bir arama yapılmadı.</p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {searchSessions.map(sess => (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess.title)}
                  className="p-2.5 bg-charcoal hover:bg-charcoal/80 border border-slateGrey/40 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="block text-[11px] text-ivory line-clamp-1 hover:text-goldLight">{sess.title}</span>
                  <span className="text-[9px] text-softGrey block mt-1">{sess.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
