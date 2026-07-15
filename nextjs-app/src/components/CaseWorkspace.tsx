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
  Briefcase,
  Scale,
  Award,
  Send,
  HelpCircle,
  UserCheck,
  BookMarked,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

type RoleId = 'HAKIM' | 'SAVCI' | 'DAVALI' | 'TANIK' | 'BILIRKISI';

interface CourtMessage {
  id: number;
  sender: string;
  role: RoleId;
  text: string;
  score: number; // Statement score out of 100
  timestamp: string;
}

export default function CaseWorkspace() {
  const { 
    caseFiles, 
    selectedCaseFileId, 
    caseAnalysisResult, 
    caseAnalysisLoading, 
    runCaseSimulation 
  } = useApp();

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'analysis' | 'trial'>('analysis');
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'parties' | 'swot' | 'sources'>('timeline');
  const [copied, setCopied] = useState(false);

  // --- Sanal Duruşma Odası States ---
  const [courtMessages, setCourtMessages] = useState<CourtMessage[]>([
    {
      id: 1,
      sender: "Hâkim Ahmet Altan",
      role: 'HAKIM',
      text: "Duruşma açılmıştır. Taraf yoklaması yapıldı, davacı vekili ve davalı vekili hazır. Davacı vekili, iddialarınızı özetleyin ve ilk sorgulama/beyan hakkınızı kullanın.",
      score: 100,
      timestamp: "10:30"
    }
  ]);
  const [selectedRole, setSelectedRole] = useState<RoleId>('DAVALI');
  const [courtInput, setCourtInput] = useState('');
  const [isCourtLoading, setIsCourtLoading] = useState(false);
  const [trialScore, setTrialScore] = useState(75); // Cumulative trial performance
  const [verdictLoading, setVerdictLoading] = useState(false);
  const [reasonedDecision, setReasonedDecision] = useState<string | null>(null);

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

  // --- Çapraz Sorgu & Beyan Gönderme ---
  const handleSendCourtStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtInput.trim() || !activeCase) return;

    const userText = courtInput;
    setCourtInput('');
    setIsCourtLoading(true);

    // 1. Add Attorney's Statement to dialogue
    const userMsgId = Date.now();
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    // Evaluate attorney's statement score locally based on length & legal buzzwords
    let statementScore = Math.floor(Math.random() * 20) + 70; // 70 to 90 base
    const buzzwords = ['yargıtay', 'kanun', 'delil', 'hukuka aykırı', 'ispat', 'tanık', 'madde', 'ihtar', 'esas', 'usul'];
    buzzwords.forEach(word => {
      if (userText.toLowerCase().includes(word)) statementScore += 3;
    });
    if (statementScore > 100) statementScore = 100;

    // Update cumulative trial score
    setTrialScore(prev => Math.min(100, Math.max(30, Math.round((prev * 3 + statementScore) / 4))));

    const updatedMessages = [
      ...courtMessages,
      {
        id: userMsgId,
        sender: "Siz (Davacı Vekili)",
        role: 'DAVALI', // using DAVALI just to align layout cleanly or as custom role
        text: userText,
        score: statementScore,
        timestamp: timeStr
      }
    ];
    setCourtMessages(updatedMessages);

    // 2. Call Gemini to simulate active roleplay response
    try {
      const roleDescriptions = {
        HAKIM: "Davanın tarafsız yargıcı. Usule, HMK kurallarına ve kanuna odaklanır. Avukatın beyanını hukuki açıdan değerlendirir, uyarılar yapabilir veya ara karar verebilir.",
        SAVCI: "İddia makamı (ceza boyutu varsa) veya kamu temsilcisi. Hukukilik denetimi yapar, mütalaa sunar.",
        DAVALI: "Davadaki hasım/karşı taraf. Suçlamaları ısrarla reddeder, mazeretler sunar, kendi lehine olan durumları abartır.",
        TANIK: "Olayı bizzat gördüğünü iddia eden kişi. Sorulardan kaçabilir, heyecanlı olabilir, çelişkili veya net ifadeler verebilir.",
        BILIRKISI: "Konunun teknik uzmanı (hesap uzmanı, mühendis vb.). Sayısal, teknik, objektif ve mevzuat odaklı konuşur."
      };

      const roleNameTurkish = {
        HAKIM: "Hâkim",
        SAVCI: "Cumhuriyet Savcısı",
        DAVALI: "Davalı Asil / Vekili",
        TANIK: "Tanık (Olay Görgü Şahidi)",
        BILIRKISI: "Bilirkişi (Hesap Uzmanı)"
      };

      const prompt = `Hukuk Duruşma Simülatörü Roleplay!
Aktif Dava Detayı:
Kategori: ${activeCase.category}
Açıklama: ${activeCase.description}

Sorgulanan Karakter Rolü: ${selectedRole} - ${roleNameTurkish[selectedRole]}
Karakter Kişiliği/Bağlamı: ${roleDescriptions[selectedRole]}

Duruşmada şimdiye kadar geçen diyaloglar:
${updatedMessages.map(m => `[${m.sender}]: "${m.text}"`).join('\n')}

Avukatın en son hamlesi/beyanı: "${userText}"

Lütfen ${selectedRole} rolüne tamamen bürünerek gerçekçi, hukuki terminolojiye uygun, Türkçe mahkeme jargonunu yansıtan bir yanıt verin. Yanıtınız kısa, çarpıcı ve duruşmanın gidişatını etkileyecek nitelikte olsun (maksimum 3-4 cümle). `;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType: 'CHAT_ASSISTANT' })
      });

      if (!response.ok) throw new Error("API Call failed");
      const data = await response.json();
      
      const aiResponseText = data.text || "Mahkeme salonunda derin bir sessizlik oldu. Lütfen beyanınızı tekrarlayın.";
      
      setCourtMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: `${roleNameTurkish[selectedRole]} Simülasyonu`,
          role: selectedRole,
          text: aiResponseText,
          score: 100,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err) {
      console.error(err);
      setCourtMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "Mahkeme Kâtibi",
          role: 'HAKIM',
          text: "Bağlantı kesintisi nedeniyle beyan tutanağa tam geçirilemedi. Lütfen sorunuzu tekrarlayın.",
          score: 100,
          timestamp: timeStr
        }
      ]);
    } finally {
      setIsCourtLoading(false);
    }
  };

  // --- Gerekçeli Karar Üretimi ---
  const handleRequestVerdict = async () => {
    if (!activeCase) return;
    setVerdictLoading(true);
    setReasonedDecision(null);

    try {
      const prompt = `Türk Mahkemeleri usulüne (Gerekçeli Karar Yazım Kuralları) tamamen sadık kalarak, aşağıdaki sanal duruşma tutanağını ve dava özetini analiz edip resmi bir "GEREKÇELİ KARAR" (Judgment Document) hazırlayın.

Dava Başlığı: ${activeCase.title}
Müvekkil (Davacı): ${activeCase.clientName}
Dava Kategorisi: ${activeCase.category}
Olay Detayları: ${activeCase.description}

Duruşma Esnasında Geçen Konuşmalar & Sorgu Tutanakları:
${courtMessages.map(m => `-[${m.sender} (${m.role})]: "${m.text}"`).join('\n')}

Avukatın Duruşma Performans Puanı: %${trialScore}

Karar şunları içermelidir:
1. T.C. MAHKEME BAŞLIĞI, ESAS NO, KARAR NO (Uydurulmuş resmi formatta)
2. TARAFLAR VE VEKİLLERİ
3. İDDİANIN VE SAVUNMANIN ÖZETİ
4. DELİLLERİN DEĞERLENDİRİLMESİ VE GEREKÇE (Duruşmadaki tanık ve bilirkişi beyanlarına atıfta bulunarak)
5. HÜKÜM FIKRASI (Davanın kısmen veya tamamen KABULÜNE veya REDDİNE, harç ve masraf dağılımına ilişkin kesin hüküm)
6. AVUKATIN DURUŞMA PERFORMANS RAPORU VE TAVSİYELER (En sonda ayrı bir analiz olarak)

Kararı resmi, ağır hukuk diliyle yazın.`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType: 'CASE_SIMULATION' })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setReasonedDecision(data.text || "Karar evrakı tanzim edilemedi.");
    } catch (e) {
      setReasonedDecision("Bakanlık UYAP simülasyon sunucularında bağlantı hatası oluştu. Karar tanzim edilemiyor.");
    } finally {
      setVerdictLoading(false);
    }
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
      <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
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
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Upper Navigation Tabs */}
      <div className="bg-charcoal border border-slateGrey/60 p-1.5 rounded-2xl flex gap-1 shadow-md">
        <button
          onClick={() => setActiveWorkspaceTab('analysis')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all duration-200 uppercase tracking-wider ${
            activeWorkspaceTab === 'analysis'
              ? 'bg-midnight border border-goldDark/30 text-goldLight shadow-inner glow-gold'
              : 'text-softGrey hover:text-ivory hover:bg-midnight/30'
          }`}
        >
          <BookMarked className="w-4 h-4 text-goldDark" />
          Dava Analiz Raporu
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('trial')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all duration-200 uppercase tracking-wider ${
            activeWorkspaceTab === 'trial'
              ? 'bg-midnight border border-goldDark/30 text-goldLight shadow-inner glow-gold'
              : 'text-softGrey hover:text-ivory hover:bg-midnight/30'
          }`}
        >
          <Scale className="w-4 h-4 text-amberAccent" />
          Sanal Duruşma Odası (Roleplay)
        </button>
      </div>

      {/* --- TAB 1: CASE ANALYSIS REPORT --- */}
      {activeWorkspaceTab === 'analysis' && (
        <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slateGrey/30 pb-4">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <CheckCircle className="w-3.5 h-3.5" />
                Yapay Zekâ Analiz Dosyası Hazır
              </span>
              <h1 className="text-xl font-bold text-goldLight mt-2">{activeCase.title}</h1>
              <p className="text-xs text-softGrey mt-0.5">Müvekkil: <strong className="text-ivory">{activeCase.clientName}</strong> | Sektör: <strong className="text-ivory">{activeCase.category}</strong></p>
            </div>
            <button
              onClick={handleSimulate}
              disabled={caseAnalysisLoading}
              className="bg-slateGrey hover:bg-slateGrey/80 text-goldLight font-bold text-xs px-4 py-2.5 rounded-xl border border-goldDark/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {caseAnalysisLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-goldDark" />
                  Raporu Güncelle
                </>
              )}
            </button>
          </div>

          {caseAnalysisLoading ? (
            <div className="p-16 text-center space-y-4">
              <div className="relative flex items-center justify-center w-fit mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-goldDark"></div>
                <Zap className="w-6 h-6 text-goldDark absolute animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-goldLight">Yapay Zekâ Yeniden Analiz Ediyor...</h3>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sub Tab Switcher */}
              <div className="flex border-b border-slateGrey/40 pb-2 overflow-x-auto space-x-6">
                <button 
                  onClick={() => setActiveSubTab('timeline')}
                  className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                    activeSubTab === 'timeline' ? 'text-goldDark border-goldDark font-bold' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  📅 Olay Zaman Çizelgesi
                </button>
                <button 
                  onClick={() => setActiveSubTab('parties')}
                  className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                    activeSubTab === 'parties' ? 'text-goldDark border-goldDark font-bold' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  👥 Taraf & Delil Analizi
                </button>
                <button 
                  onClick={() => setActiveSubTab('swot')}
                  className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                    activeSubTab === 'swot' ? 'text-goldDark border-goldDark font-bold' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  ⚡ SWOT & Risk Matrisi
                </button>
                <button 
                  onClick={() => setActiveSubTab('sources')}
                  className={`text-xs font-bold pb-2 whitespace-nowrap transition-all border-b-2 ${
                    activeSubTab === 'sources' ? 'text-goldDark border-goldDark font-bold' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  ⚖️ Kanun & Dilekçe Taslağı
                </button>
              </div>

              {/* Contents */}
              <div className="min-h-[250px]">
                {activeSubTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="bg-amberAccent/5 border border-amberAccent/20 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-warningOrange shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-goldLight">Sistem Kronoloji Uyarısı:</strong> Mevcut uyuşmazlık verileri çerçevesinde ispat yükünün dağılımı önem arz etmektedir. Belgelerin UYAP sistemine tam ve eksiksiz taranması gerekmektedir.
                      </div>
                    </div>

                    <div className="relative pl-6 border-l-2 border-slateGrey/60 space-y-6">
                      {caseAnalysisResult?.timeline?.map((node: any, idx: number) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[31px] top-1 bg-goldDark w-3 h-3 rounded-full border-4 border-charcoal"></span>
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-goldLight font-bold">{node.date}</strong>
                            <span className="bg-midnight px-2 py-0.5 text-[9px] text-softGrey rounded">Faz {idx + 1}</span>
                          </div>
                          <h4 className="text-xs font-bold text-ivory mt-1">{node.title}</h4>
                          <p className="text-[11px] text-softGrey mt-0.5 leading-relaxed">{node.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSubTab === 'parties' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-midnight p-4 rounded-xl border border-successGreen/20 space-y-2">
                        <h3 className="text-xs font-bold text-successGreen flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4" />
                          Davacı Tezleri (Müvekkiliniz)
                        </h3>
                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-softGrey">
                          {caseAnalysisResult?.claims?.plaintiff?.map((claim: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">{claim}</li>
                          )) || <li>Hizmet tespiti ve eksik ücret ödemeleri.</li>}
                        </ul>
                      </div>

                      <div className="bg-midnight p-4 rounded-xl border border-errorRed/20 space-y-2">
                        <h3 className="text-xs font-bold text-errorRed flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          Davalı Savunma Tezleri
                        </h3>
                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-softGrey">
                          {caseAnalysisResult?.claims?.defendant?.map((def: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">{def}</li>
                          )) || <li>Sözleşmenin usulüne uygun feshedildiği iddiası.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'swot' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-successGreen/5 border border-successGreen/20 p-4 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-successGreen flex items-center gap-1.5 uppercase tracking-wide">
                        💪 Güçlü Yönler (S)
                      </h4>
                      <p className="text-[11px] text-softGrey leading-relaxed">
                        Yazılı yazışmalar, banka dekontları ve delil başlangıcı niteliğindeki WhatsApp dökümleri.
                      </p>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                        ⚠️ Zayıf Yönler (W)
                      </h4>
                      <p className="text-[11px] text-softGrey leading-relaxed">
                        İşyeri kayıtlarının (giriş-çıkış kartları) henüz adli makamlarca celp edilmemiş olması.
                      </p>
                    </div>
                    <div className="bg-warningOrange/5 border border-warningOrange/20 p-4 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-warningOrange flex items-center gap-1.5 uppercase tracking-wide">
                        🚀 Fırsatlar (O)
                      </h4>
                      <p className="text-[11px] text-softGrey leading-relaxed">
                        Arabuluculuk oturumlarında anlaşma zemini yakalanması ve davanın sulh ile sonuçlandırılması olasılığı.
                      </p>
                    </div>
                    <div className="bg-errorRed/5 border border-errorRed/20 p-4 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-errorRed flex items-center gap-1.5 uppercase tracking-wide">
                        🔥 Riskler / Tehditler (T)
                      </h4>
                      <p className="text-[11px] text-softGrey leading-relaxed">
                        Zaman aşımı süreleri ve tanıkların mahkeme huzurunda ifadelerini değiştirme ihtimali.
                      </p>
                    </div>
                  </div>
                )}

                {activeSubTab === 'sources' && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-goldLight flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-goldDark" />
                        İlgili Yasal Kanun Maddeleri ve İçtihatlar
                      </h3>
                      <div className="space-y-2">
                        {caseAnalysisResult?.legalSources?.map((src: any, idx: number) => (
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
                          Hukuki Dilekçe Taslak Önerisi
                        </h3>
                        <button
                          onClick={() => copyToClipboard(caseAnalysisResult?.draftPetition || '')}
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
                        {caseAnalysisResult?.draftPetition}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: INTERACTIVE COURTROOM ROLEPLAY --- */}
      {activeWorkspaceTab === 'trial' && (
        <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 animate-fade-in flex flex-col">
          {/* Header area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slateGrey/30 pb-4">
            <div>
              <span className="bg-goldDark/15 text-goldLight text-[10px] px-2.5 py-1 rounded-full font-bold border border-goldDark/30 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <Scale className="w-3.5 h-3.5 text-goldDark" />
                Duruşma Odası Simülatörü v1.5
              </span>
              <h1 className="text-xl font-bold text-goldLight mt-2">Kartal Anadolu Adliyesi - Ön İnceleme & Esas Duruşması</h1>
              <p className="text-xs text-softGrey mt-0.5">Yapay zekâ aktörleri ile çapraz sorgu yapın ve davanın gidişatını test edin</p>
            </div>

            {/* Performance Score Circular indicator */}
            <div className="flex items-center gap-3 bg-midnight px-4 py-2.5 rounded-2xl border border-slateGrey/50 shrink-0">
              <div className="text-left">
                <span className="text-[9px] text-softGrey font-bold uppercase block">Avukat Performansı</span>
                <span className="text-sm font-black text-goldLight block">{trialScore}/100 Puan</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-goldDark/30 flex items-center justify-center font-black text-[11px] text-goldLight bg-goldDark/10">
                {trialScore}
              </div>
            </div>
          </div>

          {/* Graphical Courtroom seating grid */}
          <div className="space-y-2 select-none">
            <span className="text-[10px] text-softGrey/80 uppercase font-black tracking-wider block text-center">MAHKEME SALONU OTURMA DÜZENİ</span>
            <div className="grid grid-cols-12 gap-3.5 p-4 bg-midnight/60 rounded-2xl border border-slateGrey/40 text-center max-w-3xl mx-auto">
              
              {/* Judge (Top Center) */}
              <div 
                onClick={() => setSelectedRole('HAKIM')}
                className={`col-span-12 md:col-span-4 md:col-start-5 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'HAKIM' 
                    ? 'bg-red-500/10 border-red-500 text-red-400 scale-105 shadow-md shadow-red-500/5' 
                    : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                }`}
              >
                <ShieldAlert className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] font-black block leading-none">HÂKİM KÜRSÜSÜ</span>
                <span className="text-[9px] block text-softGrey/60 mt-1">Söz İste / İtiraz Et</span>
              </div>

              {/* Prosecutor (Left) & Expert witness (Right) */}
              <div 
                onClick={() => setSelectedRole('SAVCI')}
                className={`col-span-6 md:col-span-4 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'SAVCI' 
                    ? 'bg-amberAccent/10 border-amberAccent text-amberAccent scale-105 shadow-md' 
                    : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                }`}
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] font-black block leading-none">CUMHURİYET SAVCISI</span>
                <span className="text-[9px] block text-softGrey/60 mt-1">Mütalaa Talep Et</span>
              </div>

              <div 
                onClick={() => setSelectedRole('BILIRKISI')}
                className={`col-span-6 md:col-span-4 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'BILIRKISI' 
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 scale-105 shadow-md' 
                    : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                }`}
              >
                <BookMarked className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] font-black block leading-none">BİLİRKİŞİ</span>
                <span className="text-[9px] block text-softGrey/60 mt-1">Teknik Rapor Sorgula</span>
              </div>

              {/* Witness (Middle Center) */}
              <div 
                onClick={() => setSelectedRole('TANIK')}
                className={`col-span-12 md:col-span-4 md:col-start-5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'TANIK' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 scale-105 shadow-md' 
                    : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                }`}
              >
                <Users className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] font-black block leading-none">TANIK KÜRSÜSÜ</span>
                <span className="text-[9px] block text-softGrey/60 mt-1">Görgü Şahidini Çapraz Sorgula</span>
              </div>

              {/* Plaintiff (Your side - Bottom Left) & Defendant (Opponent side - Bottom Right) */}
              <div 
                className="col-span-6 p-2.5 bg-goldDark/10 border border-goldDark/40 rounded-xl text-goldLight text-left"
              >
                <span className="text-[10px] font-bold block uppercase text-goldDark">Davacı Kürsüsü</span>
                <span className="text-[11px] font-black block truncate">{activeCase.clientName} (Siz)</span>
                <span className="text-[8px] text-softGrey block mt-0.5">Vekili: Av. Kerem Soylu</span>
              </div>

              <div 
                onClick={() => setSelectedRole('DAVALI')}
                className={`col-span-6 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRole === 'DAVALI' 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400 scale-105 shadow-md' 
                    : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                }`}
              >
                <span className="text-[10px] font-bold block uppercase text-orange-400">Davalı Kürsüsü</span>
                <span className="text-[11px] font-black block truncate">Karşı Taraf (Asil/Vekil)</span>
                <span className="text-[8px] text-softGrey block mt-0.5">Sorgula & İddiaları Çürüt</span>
              </div>

            </div>
          </div>

          {/* Duruşma Tutanak Diyaloğu (Transcript list) */}
          <div className="bg-midnight border border-slateGrey/40 rounded-2xl p-5 space-y-4 h-[350px] overflow-y-auto scrollbar-thin">
            {courtMessages.map((msg, idx) => {
              const isHakim = msg.role === 'HAKIM';
              const isUser = msg.sender.includes('Siz');
              const isDefendant = msg.role === 'DAVALI' && !isUser;
              
              let bubbleStyle = "bg-charcoal border-slateGrey/40 text-softGrey";
              if (isHakim) bubbleStyle = "bg-red-500/5 border-red-500/35 text-red-200";
              if (isUser) bubbleStyle = "bg-goldDark text-midnight border-goldDark font-medium";
              if (isDefendant) bubbleStyle = "bg-orange-500/5 border-orange-500/30 text-orange-200";
              
              return (
                <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                  <div className="flex items-center gap-2 text-[10px] text-softGrey/80">
                    <span className="font-bold">{msg.sender}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {isUser && (
                      <span className="bg-midnight text-goldDark border border-goldDark/20 text-[8px] font-bold px-1.5 py-0.2 rounded ml-1">
                        Sorgu Puanı: {msg.score}/100
                      </span>
                    )}
                  </div>
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${bubbleStyle}`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isCourtLoading && (
              <div className="flex gap-2 mr-auto items-center">
                <div className="bg-charcoal border border-slateGrey p-3 rounded-xl flex items-center gap-2 text-xs text-softGrey">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-goldDark" />
                  <span>Sorgulanıyor, karakter yanıt veriyor...</span>
                </div>
              </div>
            )}
          </div>

          {/* Send Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-midnight p-3 rounded-xl border border-slateGrey/40">
              <span className="text-softGrey">Sorgulanan/Hitap Edilen Aktör:</span>
              <div className="flex gap-1">
                {(['HAKIM', 'SAVCI', 'DAVALI', 'TANIK', 'BILIRKISI'] as RoleId[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`text-[9px] font-extrabold px-2 py-1 rounded transition-all uppercase border ${
                      selectedRole === r 
                        ? 'bg-goldDark text-midnight border-goldDark' 
                        : 'bg-charcoal text-softGrey border-slateGrey hover:text-ivory'
                    }`}
                  >
                    {r === 'DAVALI' ? 'DAVALI' : r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendCourtStatement} className="flex gap-2">
              <input
                type="text"
                placeholder="Aktöre sorunuzu sorun veya Hâkime usul yönünden beyanda bulunun..."
                value={courtInput}
                onChange={e => setCourtInput(e.target.value)}
                className="flex-1 bg-midnight border border-slateGrey px-4 py-3 rounded-xl text-xs text-ivory focus:outline-none focus:border-goldDark placeholder-softGrey"
              />
              <button
                type="submit"
                disabled={isCourtLoading || !courtInput.trim()}
                className="bg-goldDark hover:bg-goldLight disabled:opacity-40 text-midnight px-4 rounded-xl transition-all flex items-center justify-center shrink-0 gap-1.5 text-xs font-black"
              >
                <Send className="w-4 h-4" />
                Sorgula
              </button>
            </form>
          </div>

          {/* Gerekçeli Karar Section */}
          <div className="border-t border-slateGrey/30 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-midnight/40 p-4 rounded-xl border border-goldDark/25">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-goldLight flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-goldDark" />
                  Duruşmayı Kapat ve Gerekçeli Karar Yazdır!
                </h4>
                <p className="text-[10px] text-softGrey max-w-xl">
                  Sorgulamaları bitirdiğinizde veya davanın seyrini tamamladığınızda, yapay zekâ hâkimine tüm duruşma tutanağını değerlendirerek gerekçeli mahkeme kararı tanzim ettirin.
                </p>
              </div>
              <button
                onClick={handleRequestVerdict}
                disabled={verdictLoading || courtMessages.length < 2}
                className="bg-goldDark hover:bg-goldLight disabled:opacity-40 text-midnight font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                {verdictLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Karar Yazılıyor...
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5" />
                    Mahkemeden Karar İste
                  </>
                )}
              </button>
            </div>

            {/* Verdict Display */}
            {reasonedDecision && (
              <div className="bg-midnight p-5 rounded-2xl border border-slateGrey space-y-4 animate-slide-up">
                <div className="flex justify-between items-center border-b border-slateGrey/30 pb-2">
                  <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase">
                    <CheckCircle className="w-4 h-4 text-successGreen" />
                    RESMİ GEREKÇELİ MAHKEME KARARI
                  </h3>
                  <button
                    onClick={() => copyToClipboard(reasonedDecision)}
                    className="text-[10px] text-amberAccent hover:underline flex items-center gap-1 bg-charcoal px-2.5 py-1 rounded border border-slateGrey"
                  >
                    Kopyala
                  </button>
                </div>
                <pre className="text-[10px] text-softGrey font-mono leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1">
                  {reasonedDecision}
                </pre>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
