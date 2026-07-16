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
  CheckCircle,
  Scale,
  FileText,
  Gavel,
  Landmark,
  AlertTriangle,
  ShieldAlert,
  Library,
  GraduationCap,
  Sparkles,
  Flame,
  Compass
} from 'lucide-react';

interface ParsedSection {
  title: string;
  content: string;
  icon: string;
  lucideIcon: React.ReactNode;
}

export default function LegalSearch() {
  const { 
    userProfile,
    searchResult, 
    searchLoading, 
    runAiLegalSearch, 
    sessions 
  } = useApp();

  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("ÖZET");

  const searchSessions = sessions.filter(s => s.type === 'SEARCH');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await runAiLegalSearch(query);
    setActiveAccordion("ÖZET");
  };

  const handleSelectSession = (title: string) => {
    setQuery(title);
    runAiLegalSearch(title);
    setActiveAccordion("ÖZET");
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

  // Helper to extract dynamic refinements and relations based on search query
  const getSmartRefinements = (qStr: string) => {
    const q = qStr.toLowerCase();
    if (q.includes("kira") || q.includes("tahliye") || q.includes("ev sahibi") || q.includes("kiracı") || q.includes("mülk")) {
      return {
        expansions: ["Borçlar Kanunu m. 344", "10 Yıllık Tahliye Hakkı", "Kira Ödememe İhtarı", "İhtiyari Arabuluculuk"],
        relations: ["Fuzuli İşgal", "Emsal Kira", "Haklı İhtar", "Tahliye Taahhütnamesi"]
      };
    }
    if (q.includes("kıdem") || q.includes("ihbar") || q.includes("işçi") || q.includes("işveren") || q.includes("mesai")) {
      return {
        expansions: ["4857 Sayılı Kanun m. 24", "Fazla Çalışma İspatı", "Sendikal Tazminat", "Muvazaalı Sözleşmeler"],
        relations: ["İş Güvencesi", "Arabuluculuk Anlaşmazlığı", "İhtirazi Kayıt", "Hizmet Tespiti"]
      };
    }
    if (q.includes("boşanma") || q.includes("velayet") || q.includes("nafaka") || q.includes("aile")) {
      return {
        expansions: ["TMK m. 166 Çekişmeli", "Ortak Velayet Esasları", "Yoksulluk Nafakası", "Mal Rejimi Tasfiyesi"],
        relations: ["Sosyal İnceleme Raporu", "Sadakat Yükümlülüğü", "İştirak Nafakası", "Hukuka Aykırı Delil"]
      };
    }
    if (q.includes("ceza") || q.includes("suç") || q.includes("savcı") || q.includes("hakaret") || q.includes("yaralama")) {
      return {
        expansions: ["TCK m. 125 Hakaret", "Kollukta İfade Verme", "Şüpheden Sanık Yararlanır", "Hukuka Aykırı Arama"],
        relations: ["Maddi Gerçek", "Adil Yargılanma", "Müdafi Yardımı", "Şikayet Süresi"]
      };
    }
    return {
      expansions: ["Sözleşme Serbestisi", "Dürüstlük Kuralı (TMK m. 2)", "Zamanaşımı Def'i", "Yetkili Mahkeme İtirazı"],
      relations: ["Ahde Vefa", "Borcun İfası", "Cezai Şart", "İspat Yükü"]
    };
  };

  const smartData = getSmartRefinements(query);

  // Advanced parser for the response markdown string
  const parseSearchResult = (text: string): { sections: ParsedSection[]; rawText: string; metadata: any } => {
    if (!text) return { sections: [], rawText: "", metadata: null };
    
    // Parse orchestrator metadata if appended as a footer
    let cleanedText = text;
    let metadata: any = null;
    const metadataMarker = "### 🛠️ AL HUKUK AI ORCHESTRATOR V3 RAPORU";
    if (text.includes(metadataMarker)) {
      const parts = text.split(metadataMarker);
      cleanedText = parts[0];
      const metaString = parts[1];
      
      // Parse metadata variables with regex
      const modelMatch = metaString.match(/🚀 \*\*Kullanılan Yapay Zekâ Modeli:\*\* `([^`]+)`/);
      const reasoningMatch = metaString.match(/🧠 \*\*Sistem Muhakeme Seviyesi:\*\* `([^`]+)`/);
      const timeMatch = metaString.match(/⏱️ \*\*Toplam İşlem Süresi:\*\* `([^`]+)`/);
      const confidenceMatch = metaString.match(/🎯 \*\*Orkestrasyon Güven Oranı \(Confidence\):\*\* `([^`]+)`/);
      const riskMatch = metaString.match(/⚠️ \*\*Tespit Edilen Hukuki Risk Seviyesi:\*\* `([^`]+)`/);
      
      metadata = {
        usedModel: modelMatch ? modelMatch[1] : 'AL HUKUK AI ORCHESTRATOR V3',
        reasoningLevel: reasoningMatch ? reasoningMatch[1] : 'DEEP COGNITIVE REASONING',
        processingTime: timeMatch ? timeMatch[1] : '1.45 sn',
        confidence: confidenceMatch ? confidenceMatch[1] : '%95',
        legalRisk: riskMatch ? riskMatch[1] : '%15'
      };
    }

    if (!cleanedText.includes('###')) {
      return { sections: [], rawText: cleanedText, metadata };
    }

    const sections: ParsedSection[] = [];
    const lines = cleanedText.split('\n');
    let currentTitle = "";
    let currentContent: string[] = [];

    const getLucideIcon = (title: string): React.ReactNode => {
      const t = title.toLowerCase();
      if (t.includes('özet')) return <BookOpen className="w-4 h-4 text-amberAccent" />;
      if (t.includes('dayanak')) return <Scale className="w-4 h-4 text-goldLight" />;
      if (t.includes('madde')) return <FileText className="w-4 h-4 text-goldDark" />;
      if (t.includes('yargitay')) return <Landmark className="w-4 h-4 text-cyan-400" />;
      if (t.includes('danistay')) return <Gavel className="w-4 h-4 text-purple-400" />;
      if (t.includes('aym') || t.includes('anayasa')) return <ShieldAlert className="w-4 h-4 text-red-400" />;
      if (t.includes('aihm')) return <Compass className="w-4 h-4 text-emerald-400" />;
      if (t.includes('doktri̇n') || t.includes('doktrin')) return <GraduationCap className="w-4 h-4 text-blue-400" />;
      if (t.includes('karşi') || t.includes('savunma')) return <Flame className="w-4 h-4 text-orange-400" />;
      if (t.includes('ri̇sk') || t.includes('risk')) return <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />;
      if (t.includes('uygulama') || t.includes('yol haritasi')) return <Library className="w-4 h-4 text-indigo-400" />;
      if (t.includes('sonuç') || t.includes('sonuc')) return <CheckCircle className="w-4 h-4 text-teal-400" />;
      return <BookOpen className="w-4 h-4 text-softGrey" />;
    };

    const getEmojiIcon = (title: string): string => {
      const t = title.toLowerCase();
      if (t.includes('özet')) return '📝';
      if (t.includes('dayanak')) return '⚖️';
      if (t.includes('madde')) return '📌';
      if (t.includes('yargitay')) return '🏛️';
      if (t.includes('danistay')) return '🏢';
      if (t.includes('aym') || t.includes('anayasa')) return '🗽';
      if (t.includes('aihm')) return '🇪🇺';
      if (t.includes('doktri̇n') || t.includes('doktrin')) return '📚';
      if (t.includes('karşi') || t.includes('savunma')) return '🛡️';
      if (t.includes('ri̇sk') || t.includes('risk')) return '⚠️';
      if (t.includes('uygulama') || t.includes('yol haritasi')) return '🛠️';
      if (t.includes('sonuç') || t.includes('sonuc')) return '🎯';
      return '📄';
    };

    for (const line of lines) {
      if (line.trim().startsWith('###')) {
        if (currentTitle) {
          sections.push({
            title: currentTitle,
            content: currentContent.join('\n').trim(),
            icon: getEmojiIcon(currentTitle),
            lucideIcon: getLucideIcon(currentTitle)
          });
        }
        currentTitle = line.replace('###', '').trim();
        currentContent = [];
      } else {
        if (currentTitle) {
          currentContent.push(line);
        }
      }
    }
    if (currentTitle) {
      sections.push({
        title: currentTitle,
        content: currentContent.join('\n').trim(),
        icon: getEmojiIcon(currentTitle),
        lucideIcon: getLucideIcon(currentTitle)
      });
    }

    return { sections, rawText: "", metadata };
  };

  const parsedData = parseSearchResult(searchResult);

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
            <Search className="w-5 h-5 text-goldDark" />
            Yapay Zekâ Destekli Hukuki Arama Terminali
          </h1>
          <p className="text-xs text-softGrey">
            Güncel Türk mevzuatı, kanun maddeleri ve Yargıtay emsal kararlarını saniyeler içinde tarayın
          </p>
        </div>
        {userProfile.isPremium ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-goldDark/10 text-goldLight text-[10px] font-black border border-goldDark/30 rounded-xl shrink-0">
            ✨ Sınırsız Soru Hakkı
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slateGrey/20 text-goldLight text-[10px] font-black border border-slateGrey/30 rounded-xl shrink-0">
            Bugünkü Kalan Soru: {userProfile.remainingQuestions ?? 3} / 3
          </span>
        )}
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

          {/* Akıllı Arama & İlişkili Kavramlar */}
          <div className="bg-midnight/40 p-4 rounded-xl border border-slateGrey/30 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase text-goldLight flex items-center gap-1 tracking-wider mr-1">
                <Sparkles className="w-3.5 h-3.5 text-goldDark" />
                Akıllı Arama:
              </span>
              {smartData.expansions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item);
                    runAiLegalSearch(item);
                    setActiveAccordion("ÖZET");
                  }}
                  className="text-[10px] text-softGrey bg-charcoal/80 border border-slateGrey/40 px-2.5 py-1 rounded-md hover:border-goldDark hover:text-goldLight transition-all"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slateGrey/20 pt-2.5">
              <span className="text-[9px] font-black uppercase text-amberAccent flex items-center gap-1 tracking-wider mr-1">
                <Compass className="w-3.5 h-3.5 text-amberAccent" />
                İlişkili Konular:
              </span>
              {smartData.relations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(`${item} uyuşmazlığı ve yasal haklar`);
                    runAiLegalSearch(`${item} uyuşmazlığı ve yasal haklar`);
                    setActiveAccordion("ÖZET");
                  }}
                  className="text-[10px] text-softGrey/85 hover:text-goldLight underline decoration-slateGrey/60 hover:decoration-goldDark transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {searchLoading ? (
            <div className="p-12 text-center space-y-3 bg-midnight rounded-xl border border-slateGrey/40">
              <Loader2 className="w-8 h-8 animate-spin text-goldDark mx-auto" />
              <h4 className="text-xs font-bold text-goldLight">Hukuk Veritabanı Taranıyor</h4>
              <p className="text-[10px] text-softGrey max-w-xs mx-auto">
                Mevzuat maddeleri, yerleşik Yargıtay içtihatları ve doktrin makaleleri analiz edilerek hukuki raporunuz tanzim ediliyor...
              </p>
            </div>
          ) : searchResult ? (
            <div className="space-y-4">
              <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4">
                <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
                  <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-goldDark" />
                    Hukuki Arama Sonucu
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
                        Metni Kopyala
                      </>
                    )}
                  </button>
                </div>

                {parsedData.sections.length > 0 ? (
                  /* Premium Accordion View */
                  <div className="space-y-2.5">
                    {parsedData.sections.map((sect, sIdx) => {
                      const isOpened = activeAccordion === sect.title || (activeAccordion === null && sIdx === 0);
                      return (
                        <div 
                          key={sIdx} 
                          className={`border rounded-lg transition-all duration-300 ${
                            isOpened 
                              ? 'bg-charcoal/90 border-goldDark/50 shadow-md shadow-goldDark/5' 
                              : 'bg-charcoal/40 border-slateGrey/20 hover:border-slateGrey/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveAccordion(isOpened ? null : sect.title)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
                          >
                            <div className="flex items-center gap-3">
                              {sect.lucideIcon}
                              <span className={`text-[11px] font-extrabold uppercase tracking-wide ${isOpened ? 'text-goldLight' : 'text-ivory'}`}>
                                {sect.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-softGrey/50">
                              {isOpened ? '▼' : '►'}
                            </span>
                          </button>
                          
                          {isOpened && (
                            <div className="px-4 pb-4 pt-1 border-t border-slateGrey/20 text-xs text-softGrey/95 leading-relaxed whitespace-pre-wrap font-sans transition-all duration-300 prose prose-invert">
                              {sect.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Standard text fallback */
                  <div className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap prose prose-invert">
                    {searchResult}
                  </div>
                )}
              </div>

              {/* Dynamic Metadata Diagnostics Card */}
              {parsedData.metadata && (
                <div className="bg-gradient-to-r from-midnight to-charcoal p-4 rounded-xl border border-goldDark/30 grid grid-cols-2 md:grid-cols-5 gap-3.5 shadow-xl">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-softGrey tracking-wider block">Yapay Zekâ Motoru</span>
                    <strong className="text-[10px] text-goldLight block truncate">{parsedData.metadata.usedModel}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-softGrey tracking-wider block">Muhakeme Seviyesi</span>
                    <strong className="text-[10px] text-ivory block truncate">{parsedData.metadata.reasoningLevel}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-softGrey tracking-wider block">Orkestrasyon Güven Oranı</span>
                    <strong className="text-[10px] text-emerald-400 block">{parsedData.metadata.confidence}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-softGrey tracking-wider block">Hukuki Risk Derecesi</span>
                    <strong className="text-[10px] text-rose-400 block">{parsedData.metadata.legalRisk}</strong>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <span className="text-[8px] font-black uppercase text-softGrey tracking-wider block">İşlem Süresi</span>
                    <strong className="text-[10px] text-cyan-400 block">{parsedData.metadata.processingTime}</strong>
                  </div>
                </div>
              )}
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
