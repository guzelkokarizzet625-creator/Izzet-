'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Zap, 
  AlertTriangle, 
  Calendar, 
  Users, 
  LayoutGrid, 
  BookOpen, 
  Copy, 
  Loader2, 
  CheckCircle,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';

export default function CaseWorkspace() {
  const { 
    caseFiles, 
    selectedCaseFileId, 
    caseAnalysisResult, 
    caseAnalysisLoading, 
    runCaseSimulation 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'parties' | 'swot' | 'sources'>('timeline');
  const [copied, setCopied] = useState(false);

  const activeCase = caseFiles.find(c => c.id === selectedCaseFileId);

  const handleSimulate = async () => {
    if (!activeCase) return;
    await runCaseSimulation(activeCase.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeCase) {
    return (
      <div className="bg-charcoal border border-slateGrey/60 p-12 rounded-2xl text-center space-y-4">
        <div className="bg-midnight p-4 rounded-full text-softGrey w-fit mx-auto">
          <Briefcase className="w-12 h-12" />
        </div>
        <h2 className="text-lg font-bold text-goldLight">Çalışma Dosyası Seçilmedi</h2>
        <p className="text-xs text-softGrey max-w-sm mx-auto">
          Lütfen simülasyon ve analiz yapmak için önce Ofis sekmesinden aktif bir dava dosyası seçin veya yeni bir kayıt oluşturun.
        </p>
      </div>
    );
  }

  // If there is no analysis result yet, show the "Start Simulation" view
  if (!caseAnalysisResult && !caseAnalysisLoading) {
    return (
      <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-8 space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-goldDark/10 text-goldDark text-[10px] px-2.5 py-1 rounded-full font-bold border border-goldDark/20 uppercase tracking-wider">Dosya Analiz Merkezi</span>
              <h1 className="text-xl font-bold text-goldLight mt-2">{activeCase.title}</h1>
              <p className="text-xs text-softGrey mt-0.5">Kategori: <strong className="text-ivory">{activeCase.category}</strong> | Kayıt: <strong className="text-ivory">{activeCase.date}</strong></p>
            </div>
            <div className="text-xs text-softGrey text-left md:text-right bg-midnight p-3 rounded-xl border border-slateGrey/40 shrink-0">
              Müvekkil: <strong className="text-emerald-400 block font-bold text-sm">{activeCase.clientName}</strong>
            </div>
          </div>
        </div>

        <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-3">
          <h2 className="text-xs font-bold text-goldDark uppercase tracking-wider">Uyuşmazlık Detayları ve Olay Özeti</h2>
          <p className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap">{activeCase.description}</p>
        </div>

        <div className="border-t border-slateGrey/30 pt-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-midnight p-4 rounded-full text-goldDark">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-goldLight">Akıllı Dava Simülasyonunu Başlatın</h3>
            <p className="text-[11px] text-softGrey max-w-md">
              Google Gemini yapay zekâ motoru bu olay özetini inceleyerek yasal kronoloji oluşturacak, ispat yüklerini atayacak, SWOT analizi yapacak ve dilekçe taslağı hazırlayacaktır.
            </p>
          </div>
          <button
            onClick={handleSimulate}
            className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-bold text-xs px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Akıllı Analiz ve Simülasyonu Başlat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slateGrey/30 pb-4">
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <CheckCircle className="w-3.5 h-3.5" />
            Akıllı Simülasyon Tamamlandı
          </span>
          <h1 className="text-xl font-bold text-goldLight mt-2">{activeCase.title}</h1>
          <p className="text-xs text-softGrey mt-0.5">Dosya Sahibi: <strong className="text-ivory">{activeCase.clientName}</strong> | Kategori: <strong className="text-ivory">{activeCase.category}</strong></p>
        </div>
        <button
          onClick={handleSimulate}
          disabled={caseAnalysisLoading}
          className="bg-slateGrey hover:bg-slateGrey/80 text-goldLight font-bold text-xs px-4 py-2.5 rounded-xl border border-goldDark/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {caseAnalysisLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Yeniden Analiz Ediliyor...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-goldDark" />
              Yeniden Simüle Et
            </>
          )}
        </button>
      </div>

      {/* Loading overlay for active analysis */}
      {caseAnalysisLoading ? (
        <div className="p-16 text-center space-y-4">
          <div className="relative flex items-center justify-center w-fit mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-goldDark"></div>
            <Zap className="w-6 h-6 text-goldDark absolute animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-goldLight">Yapay Zekâ Analiz Ediyor...</h3>
            <p className="text-[11px] text-softGrey max-w-sm mx-auto">
              Olaylar kronolojik sıraya diziliyor, delil tutarlılığı denetleniyor, SWOT ve yasal kaynaklar eşleştiriliyor...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex border-b border-slateGrey/40 pb-2 overflow-x-auto space-x-6">
            <button 
              onClick={() => setActiveSubTab('timeline')}
              className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                activeSubTab === 'timeline' 
                  ? 'text-goldDark border-goldDark font-bold' 
                  : 'text-softGrey hover:text-ivory border-transparent font-medium'
              }`}
            >
              📅 Olay Zaman Çizelgesi
            </button>
            <button 
              onClick={() => setActiveSubTab('parties')}
              className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                activeSubTab === 'parties' 
                  ? 'text-goldDark border-goldDark font-bold' 
                  : 'text-softGrey hover:text-ivory border-transparent font-medium'
              }`}
            >
              👥 Taraf & Delil Analizi
            </button>
            <button 
              onClick={() => setActiveSubTab('swot')}
              className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                activeSubTab === 'swot' 
                  ? 'text-goldDark border-goldDark font-bold' 
                  : 'text-softGrey hover:text-ivory border-transparent font-medium'
              }`}
            >
              ⚡ SWOT & Risk Matrisi
            </button>
            <button 
              onClick={() => setActiveSubTab('sources')}
              className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                activeSubTab === 'sources' 
                  ? 'text-goldDark border-goldDark font-bold' 
                  : 'text-softGrey hover:text-ivory border-transparent font-medium'
              }`}
            >
              ⚖️ Kanun & Dilekçe Taslağı
            </button>
          </div>

          {/* Sub Tab Contents */}
          <div className="min-h-[300px]">
            {/* 1. TIMELINE */}
            {activeSubTab === 'timeline' && (
              <div className="space-y-6">
                <div className="bg-amberAccent/5 border border-amberAccent/20 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-warningOrange shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-goldLight">Sistem Kronoloji Uyarısı:</strong> Dava konusu olaylarda fazla çalışma başlangıç süreleri ve saatleri için kesin banka/işyeri giriş verileri gerekmektedir. Eksik tarih tespiti durumlarında hâkim takdiri indirim uygulayabilir.
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-slateGrey/60 space-y-6">
                  {caseAnalysisResult.timeline?.map((node: any, idx: number) => {
                    // Decide color based on index
                    const colors = [
                      { bg: 'bg-successGreen', text: 'text-successGreen' },
                      { bg: 'bg-warningOrange', text: 'text-warningOrange' },
                      { bg: 'bg-cyan-400', text: 'text-cyan-400' },
                      { bg: 'bg-errorRed', text: 'text-errorRed' }
                    ];
                    const activeColor = colors[idx % colors.length];

                    return (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-[31px] top-1 ${activeColor.bg} w-3 h-3 rounded-full border-4 border-charcoal`}></span>
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-goldLight font-bold font-display">{node.date}</strong>
                          <span className="bg-midnight px-2 py-0.5 text-[10px] text-softGrey rounded">Aşama {idx + 1}</span>
                        </div>
                        <h4 className="text-xs font-bold text-ivory mt-1">{node.title}</h4>
                        <p className="text-[11px] text-softGrey mt-0.5 leading-relaxed">{node.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PARTIES & EVIDENCE */}
            {activeSubTab === 'parties' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-midnight p-4 rounded-xl border border-successGreen/20 space-y-2.5">
                    <h3 className="text-xs font-bold text-successGreen flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4" />
                      Davacı İddiaları (Siz)
                    </h3>
                    <ul className="text-xs space-y-1.5 list-disc pl-4 text-softGrey">
                      {caseAnalysisResult.claims?.plaintiff?.map((claim: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{claim}</li>
                      )) || (
                        <>
                          <li>Sözleşmenin haksız olarak feshedilmesi alacak talepleri.</li>
                          <li>Mesai alacaklarının eksik yatırılması.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="bg-midnight p-4 rounded-xl border border-errorRed/20 space-y-2.5">
                    <h3 className="text-xs font-bold text-errorRed flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      Davalı Savunmaları
                    </h3>
                    <ul className="text-xs space-y-1.5 list-disc pl-4 text-softGrey">
                      {caseAnalysisResult.claims?.defendant?.map((def: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{def}</li>
                      )) || (
                        <>
                          <li>Performans düşüklüğü ve uyarılara uymama iddiası.</li>
                          <li>Fazla mesainin kanıtlanamadığı savunması.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-goldLight flex items-center gap-2">
                    <Users className="w-4 h-4 text-goldDark" />
                    İspat Yükümlülüğü ve Kritik Deliller
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-midnight p-3 rounded-lg border border-slateGrey/40 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-goldLight">1. WhatsApp Konuşma Kayıtları</span>
                        <span className="bg-successGreen/10 text-successGreen text-[9px] font-bold px-1.5 py-0.5 rounded">Güçlü Delil</span>
                      </div>
                      <p className="text-[10px] text-softGrey">
                        Yargıtay içtihatlarına göre delil başlangıcı niteliğindedir. İşveren emirlerini doğrudan ispatlar.
                      </p>
                    </div>

                    <div className="bg-midnight p-3 rounded-lg border border-slateGrey/40 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-goldLight">2. Banka Maaş Dekontları</span>
                        <span className="bg-successGreen/10 text-successGreen text-[9px] font-bold px-1.5 py-0.5 rounded">Kesin Delil</span>
                      </div>
                      <p className="text-[10px] text-softGrey">
                        Maaş ödemelerinde haksız yapılan eksik kesintileri veya mesainin yatırılmadığını resmi olarak ispatlar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SWOT */}
            {activeSubTab === 'swot' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-successGreen/5 border border-successGreen/20 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-successGreen flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4" />
                    Güçlü Yönler (Strengths)
                  </h4>
                  <ul className="text-[11px] text-softGrey space-y-1 list-disc pl-4 leading-relaxed">
                    {caseAnalysisResult.swot?.strengths?.map((str: string, i: number) => <li key={i}>{str}</li>) || <li>Yazılı delil silsilesi mevcuttur.</li>}
                  </ul>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <FileText className="w-4 h-4" />
                    Desteklenmeli (Weaknesses)
                  </h4>
                  <ul className="text-[11px] text-softGrey space-y-1 list-disc pl-4 leading-relaxed">
                    {caseAnalysisResult.swot?.weaknesses?.map((wk: string, i: number) => <li key={i}>{wk}</li>) || <li>SGK dökümleri eklenmelidir.</li>}
                  </ul>
                </div>

                <div className="bg-warningOrange/5 border border-warningOrange/20 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-warningOrange flex items-center gap-1.5 uppercase tracking-wide">
                    <Clock className="w-4 h-4" />
                    Fırsatlar / Belirsizlikler
                  </h4>
                  <ul className="text-[11px] text-softGrey space-y-1 list-disc pl-4 leading-relaxed">
                    {caseAnalysisResult.swot?.opportunities?.map((opp: string, i: number) => <li key={i}>{opp}</li>) || <li>Arabuluculukta uzlaşı çıkabilir.</li>}
                  </ul>
                </div>

                <div className="bg-errorRed/5 border border-errorRed/20 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-errorRed flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Hususları (Threats)
                  </h4>
                  <ul className="text-[11px] text-softGrey space-y-1 list-disc pl-4 leading-relaxed">
                    {caseAnalysisResult.swot?.threats?.map((thr: string, i: number) => <li key={i}>{thr}</li>) || <li>Karşı tarafın devamsızlık iddiaları.</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* 4. SOURCES & DRAFT */}
            {activeSubTab === 'sources' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-goldLight flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-goldDark" />
                    Uyuşmazlıkla İlgili Hukuki Kaynaklar
                  </h3>
                  <div className="space-y-2">
                    {caseAnalysisResult.legalSources?.map((src: any, idx: number) => (
                      <div key={idx} className="bg-midnight p-3 rounded-lg border border-slateGrey/40 text-xs">
                        <strong className="text-goldDark block font-display">{src.source}</strong>
                        <p className="text-[11px] text-softGrey mt-0.5 leading-relaxed">{src.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slateGrey/30 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-goldLight flex items-center gap-2">
                      <FileText className="w-4 h-4 text-goldDark" />
                      Yapay Zekâ Dilekçe Taslağı
                    </h3>
                    <button
                      onClick={() => copyToClipboard(caseAnalysisResult.draftPetition)}
                      className="text-xs text-amberAccent hover:underline flex items-center gap-1 font-bold bg-midnight px-3 py-1.5 rounded-lg border border-slateGrey"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-successGreen" />
                          Kopyalandı!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Taslağı Kopyala
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-midnight p-4 rounded-xl border border-slateGrey text-[10px] text-softGrey font-mono max-h-[350px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {caseAnalysisResult.draftPetition}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
