'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Type Definitions ---
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isPremium: boolean;
  systemIban: string;
  premiumPriceMonthly: string;
  premiumPriceAnnual: string;
}

export interface CaseFile {
  id: number;
  title: string;
  clientName: string;
  category: string;
  date: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING';
}

export interface LegalDocument {
  id: number;
  caseId: number;
  name: string;
  fileSize: string;
  date: string;
  riskScore: number; // 0 to 100
  riskLevel: 'CLEAN' | 'MEDIUM' | 'HIGH';
  riskDescription: string;
  contentText: string;
  status: 'OCR_PENDING' | 'OCR_COMPLETED' | 'RISK_ANALYZED';
}

export interface ChatMessage {
  id: number;
  caseId: number;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
}

export interface PaymentReceipt {
  id: number;
  senderName: string;
  email: string;
  iban: string;
  amount: string;
  date: string;
  receiptFileName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface QuerySession {
  id: number;
  title: string;
  type: 'SEARCH' | 'PETITION' | 'CHAT_ASSISTANT';
  date: string;
}

export interface SupportTicket {
  id: number;
  title: string;
  client: string;
  category: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  date: string;
  text: string;
}

// State Interface
interface AppState {
  userProfile: UserProfile;
  caseFiles: CaseFile[];
  selectedCaseFileId: number | null;
  documents: LegalDocument[];
  chatMessages: ChatMessage[];
  calendarEvents: CalendarEvent[];
  paymentReceipts: PaymentReceipt[];
  sessions: QuerySession[];
  supportTickets: SupportTicket[];
  
  // UI states for AI responses
  caseAnalysisResult: any | null;
  caseAnalysisLoading: boolean;
  docAnalysisResult: any | null;
  docAnalysisLoading: boolean;
  searchResult: string;
  searchLoading: boolean;
  petitionResult: string;
  petitionLoading: boolean;
  academyResult: string;
  academyLoading: boolean;
  voiceActive: boolean;
  voiceText: string;
  voiceResponse: string;
}

interface AppContextType extends AppState {
  toggleAdminRole: () => void;
  togglePremiumRole: () => void;
  updateSystemConfig: (iban: string, monthly: string, annual: string) => void;
  addCaseFile: (title: string, clientName: string, category: string, description: string) => void;
  selectCaseFile: (id: number | null) => void;
  addDocumentToCase: (caseId: number, name: string, contentText: string, fileSize: string) => void;
  analyzeDocRisk: (docId: number) => Promise<void>;
  addChatMessage: (caseId: number, sender: 'USER' | 'AI', text: string) => void;
  runCaseSimulation: (caseId: number) => Promise<void>;
  addCalendarEvent: (title: string, date: string, time: string, description: string, location: string) => void;
  submitPaymentReceipt: (senderName: string, email: string, iban: string, amount: string, fileName: string) => void;
  approvePaymentReceipt: (id: number) => void;
  rejectPaymentReceipt: (id: number) => void;
  runAiLegalSearch: (query: string) => Promise<void>;
  draftAiPetition: (title: string, details: string) => Promise<void>;
  runAcademyTeacher: (lessonTitle: string) => Promise<void>;
  submitTicket: (title: string, category: string, text: string) => void;
  setVoiceActive: (active: boolean) => void;
  simulateVoiceInput: (input: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Default Prepopulated Mock Data (Matches Android's State) ---
const defaultUser: UserProfile = {
  id: 1,
  name: "Av. Kerem Soylu",
  email: "guzelkokarizzet625@gmail.com",
  isAdmin: true,
  isPremium: true,
  systemIban: "TR96 0006 2000 0001 2345 6789 01",
  premiumPriceMonthly: "₺199.00",
  premiumPriceAnnual: "₺450.00"
};

const defaultCases: CaseFile[] = [
  { id: 1, title: "Soylu İş Alacağı Davası", clientName: "Hakan Soylu", category: "İş Hukuku", date: "10.07.2026", description: "Haksız fesih, fazla mesai alacakları ve kıdem tazminatı talepli iş davası dosyası.", status: "ACTIVE" },
  { id: 2, title: "Kadıköy Kira Tahliye İhtarı", clientName: "Ahmet Yılmaz", category: "Borçlar & Kira", date: "11.07.2026", description: "Kira ödemelerinin gecikmesi ve tahliye taahhütnamesine dayalı icra takibi dosyası.", status: "ACTIVE" }
];

const defaultDocs: LegalDocument[] = [
  {
    id: 1,
    caseId: 1,
    name: "Is_Sozlesmesi_Taslagi.pdf",
    fileSize: "12.4 MB",
    date: "13.07.2026",
    riskScore: 78,
    riskLevel: "HIGH",
    riskDescription: "İşbu sözleşmede imza eksiktir. Rekabet yasağı maddesi (5 yıl boyunca rakiplerde çalışamama) aşırı ağır ve geçersiz kabul edilebilir. Fazla mesai muvafakatnamesi bulunmamaktadır.",
    contentText: "İŞ SÖZLEŞMESİDİR: İşbu sözleşme işveren ile çalışan arasında tanzim edilmiştir. Çalışan, rekabet yasağı gereği 5 yıl boyunca başka bir şirkette görev yapamayacaktır. İmza: [Eksik]",
    status: "RISK_ANALYZED"
  },
  {
    id: 2,
    caseId: 2,
    name: "Kira_Tahliye_Ihtari.pdf",
    fileSize: "2.1 MB",
    date: "12.07.2026",
    riskScore: 5,
    riskLevel: "CLEAN",
    riskDescription: "KVKK uyumlu. Tahliye ihtarnamesi yasal sürelere ve mevzuata tam olarak uygundur. Borçlu kiracının birikmiş 3 aylık kira bedelini ödemesi için tanınan 30 günlük süre açıkça yazılmıştır.",
    contentText: "İHTARNAMEDİR: Borçlu kiracının birikmiş 3 aylık kira bedelini 30 gün içinde ödemesi, aksi takdirde tahliye davası açılacağı ihtar olunur.",
    status: "RISK_ANALYZED"
  }
];

const defaultChatMessages: ChatMessage[] = [
  { id: 1, caseId: 1, sender: "AI", text: "Soylu İş Alacağı davasına hoş geldiniz. Dosyayı inceledim. WhatsApp yazışmaları ve banka ekstreleri güçlü delillerimiz arasında. Hangi konuda analiz yapmak istersiniz?", timestamp: "13.07.2026 14:00" }
];

const defaultEvents: CalendarEvent[] = [
  { id: 1, title: "Soylu İş Davası - Ön İnceleme Duruşması", date: "2026-08-20", time: "10:30", description: "Anadolu 4. İş Mahkemesi duruşması. Delillerin sunulması ve tanık listesinin bildirilmesi gerekir.", location: "Kartal Anadolu Adliyesi B-Blok Kat:3" },
  { id: 2, title: "Kira İhtarı - Tahliye Arabuluculuk Toplantısı", date: "2026-07-28", time: "14:15", description: "Arabulucu Ofisi toplantısı. Ödeme protokolü taslağı yanımızda olmalı.", location: "Kadıköy Arabuluculuk Merkezi Salon 4" }
];

const defaultReceipts: PaymentReceipt[] = [
  { id: 101, senderName: "Av. Meltem Aras", email: "meltem@aras.av.tr", iban: "TR12 3456 ... 89", amount: "₺199.00", date: "13.07.2026", receiptFileName: "MeltemAras_Aylik_Standart.pdf", status: "PENDING" },
  { id: 102, senderName: "Av. Selim Yazıcı", email: "selim@yazici-hukuk.av.tr", iban: "TR96 0006 ... 01", amount: "₺450.00", date: "12.07.2026", receiptFileName: "SelimYazici_Yillik_Abonelik.pdf", status: "PENDING" }
];

const defaultTickets: SupportTicket[] = [
  { id: 1, title: "Adliye Entegrasyon Hatası", client: "Av. Meltem Aras", category: "Entegrasyon", status: "OPEN", date: "13.07.2026", text: "Uyap entegrasyonu esnasında 'Zaman Aşımı' hatası alıyorum. Tekrar dener misiniz?" },
  { id: 2, title: "OCR Karakter Tanıma Sorunu", client: "Av. Caner Yıldız", category: "OCR Tarama", status: "RESOLVED", date: "11.07.2026", text: "Eski Türkçe dilekçelerin OCR taramasında bazı Türkçe karakterler bozuk çıkıyor. Güncelleme yapıldı mı?" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);

  // Core Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUser);
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>(defaultCases);
  const [selectedCaseFileId, setSelectedCaseFileId] = useState<number | null>(1);
  const [documents, setDocuments] = useState<LegalDocument[]>(defaultDocs);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultChatMessages);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(defaultEvents);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>(defaultReceipts);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(defaultTickets);
  const [sessions, setSessions] = useState<QuerySession[]>([]);

  // AI states
  const [caseAnalysisResult, setCaseAnalysisResult] = useState<any | null>(null);
  const [caseAnalysisLoading, setCaseAnalysisLoading] = useState(false);
  const [docAnalysisResult, setDocAnalysisResult] = useState<any | null>(null);
  const [docAnalysisLoading, setDocAnalysisLoading] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [petitionResult, setPetitionResult] = useState("");
  const [petitionLoading, setPetitionLoading] = useState(false);
  const [academyResult, setAcademyResult] = useState("");
  const [academyLoading, setAcademyLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");

  // Hydration safe load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('al_user');
      const storedCases = localStorage.getItem('al_cases');
      const storedDocs = localStorage.getItem('al_docs');
      const storedChats = localStorage.getItem('al_chats');
      const storedEvents = localStorage.getItem('al_events');
      const storedReceipts = localStorage.getItem('al_receipts');
      const storedTickets = localStorage.getItem('al_tickets');

      if (storedUser) setUserProfile(JSON.parse(storedUser));
      if (storedCases) setCaseFiles(JSON.parse(storedCases));
      if (storedDocs) setDocuments(JSON.parse(storedDocs));
      if (storedChats) setChatMessages(JSON.parse(storedChats));
      if (storedEvents) setCalendarEvents(JSON.parse(storedEvents));
      if (storedReceipts) setPaymentReceipts(JSON.parse(storedReceipts));
      if (storedTickets) setSupportTickets(JSON.parse(storedTickets));
      
      setHydrated(true);
    }
  }, []);

  // Save states on change (only after hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_user', JSON.stringify(userProfile));
    }
  }, [userProfile, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_cases', JSON.stringify(caseFiles));
    }
  }, [caseFiles, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_docs', JSON.stringify(documents));
    }
  }, [documents, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_chats', JSON.stringify(chatMessages));
    }
  }, [chatMessages, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_events', JSON.stringify(calendarEvents));
    }
  }, [calendarEvents, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_receipts', JSON.stringify(paymentReceipts));
    }
  }, [paymentReceipts, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_tickets', JSON.stringify(supportTickets));
    }
  }, [supportTickets, hydrated]);

  // --- Handlers ---
  const toggleAdminRole = () => {
    setUserProfile(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  const togglePremiumRole = () => {
    setUserProfile(prev => ({ ...prev, isPremium: !prev.isPremium }));
  };

  const updateSystemConfig = (iban: string, monthly: string, annual: string) => {
    setUserProfile(prev => ({
      ...prev,
      systemIban: iban,
      premiumPriceMonthly: monthly,
      premiumPriceAnnual: annual
    }));
  };

  const addCaseFile = (title: string, clientName: string, category: string, description: string) => {
    const newCase: CaseFile = {
      id: Date.now(),
      title,
      clientName,
      category,
      date: new Date().toLocaleDateString('tr-TR'),
      description,
      status: 'ACTIVE'
    };
    setCaseFiles(prev => [...prev, newCase]);
    setSelectedCaseFileId(newCase.id);
  };

  const selectCaseFile = (id: number | null) => {
    setSelectedCaseFileId(id);
  };

  const addDocumentToCase = (caseId: number, name: string, contentText: string, fileSize: string) => {
    const newDoc: LegalDocument = {
      id: Date.now(),
      caseId,
      name,
      fileSize,
      date: new Date().toLocaleDateString('tr-TR'),
      riskScore: 0,
      riskLevel: 'CLEAN',
      riskDescription: 'Analiz edilmedi. Lütfen yapay zekâ analizini başlatın.',
      contentText,
      status: 'OCR_COMPLETED'
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const addChatMessage = (caseId: number, sender: 'USER' | 'AI', text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      caseId,
      sender,
      text,
      timestamp: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const addCalendarEvent = (title: string, date: string, time: string, description: string, location: string) => {
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title,
      date,
      time,
      description,
      location
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const submitPaymentReceipt = (senderName: string, email: string, iban: string, amount: string, fileName: string) => {
    const newReceipt: PaymentReceipt = {
      id: Date.now(),
      senderName,
      email,
      iban,
      amount,
      date: new Date().toLocaleDateString('tr-TR'),
      receiptFileName: fileName,
      status: 'PENDING'
    };
    setPaymentReceipts(prev => [newReceipt, ...prev]);
  };

  const approvePaymentReceipt = (id: number) => {
    setPaymentReceipts(prev => prev.map(rec => {
      if (rec.id === id) {
        // Find if this is the current user or update user premium status
        if (rec.email === userProfile.email) {
          setUserProfile(p => ({ ...p, isPremium: true }));
        }
        return { ...rec, status: 'APPROVED' as const };
      }
      return rec;
    }));
  };

  const rejectPaymentReceipt = (id: number) => {
    setPaymentReceipts(prev => prev.map(rec => rec.id === id ? { ...rec, status: 'REJECTED' as const } : rec));
  };

  const submitTicket = (title: string, category: string, text: string) => {
    const newTicket: SupportTicket = {
      id: Date.now(),
      title,
      client: userProfile.name,
      category,
      status: 'OPEN',
      date: new Date().toLocaleDateString('tr-TR'),
      text
    };
    setSupportTickets(prev => [...prev, newTicket]);
  };

  // --- Gemini AI Entegrasyonları ---
  const callGeminiApi = async (prompt: string, taskType: string): Promise<string> => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType })
      });
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error("Gemini API call failed:", error);
      throw error;
    }
  };

  const runCaseSimulation = async (caseId: number) => {
    const activeCase = caseFiles.find(c => c.id === caseId);
    if (!activeCase) return;

    setCaseAnalysisLoading(true);
    try {
      const prompt = `Lütfen aşağıdaki uyuşmazlık olayını yasal açıdan analiz edin ve dava simülasyonu raporu hazırlayın.
Uyuşmazlık Konusu: ${activeCase.category}
Uyuşmazlık Detayları: ${activeCase.description}

Analiz sonucunda şunları çıkartın:
1. Olay Kronolojisi (Zaman Çizelgesi)
2. Tarafların İddiaları ve Savunmaları
3. SWOT Analiz Değerlendirmesi (Güçlü Yönler, Desteklenmeli, Belirsizlikler, Riskler)
4. İlgili Yasal Kanun Maddeleri ve Yargıtay Kararları
5. Kısa bir Dilekçe Taslağı

Lütfen JSON formatında döndürün. Format:
{
  "timeline": [{"date": "tarih", "title": "başlık", "description": "açıklama"}],
  "claims": {"plaintiff": ["idda1", "iddia2"], "defendant": ["savunma1", "savunma2"]},
  "swot": {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []},
  "legalSources": [{"source": "kanun adı", "content": "açıklama"}],
  "draftPetition": "Mahkeme dilekçe taslağı..."
}`;

      const resText = await callGeminiApi(prompt, "CASE_SIMULATION");
      
      // Parse JSON from API or extract block
      let parsed = null;
      try {
        const cleanJson = resText.substring(resText.indexOf('{'), resText.lastIndexOf('}') + 1);
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("Could not parse JSON. Creating mock from text response.");
        parsed = {
          timeline: [
            { date: "10.01.2026", title: "İş İlişkisinin Başlaması", description: "Sözleşmenin tanzimi." },
            { date: "30.06.2026", title: "İş Feshi", description: "Haksız fesih ihbarı." }
          ],
          claims: {
            plaintiff: ["Fesih haksızdır.", "Mesailer ödenmemiştir."],
            defendant: ["Devamsızlık yapılmıştır.", "Bütün ödemeler tamdır."]
          },
          swot: {
            strengths: ["Yazılı sözleşme bulunuyor.", "WhatsApp delilleri mevcuttur."],
            weaknesses: ["Eksik gün ve saat bildirimleri."],
            opportunities: ["Uzlaşma (Arabuluculuk) yolu açılması."],
            threats: ["İspat yokluğu nedeniyle mesailerin kısmen reddedilme riski."]
          },
          legalSources: [
            { source: "4857 Sayılı İş Kanunu m. 17", content: "İhbar tazminatı bildirim süresine uyulmaması halinde ödenir." },
            { source: "4857 Sayılı İş Kanunu m. 41", content: "Haftalık 45 saati aşan çalışmalar %50 zamlı ödenir." }
          ],
          draftPetition: resText || "NÖBETÇİ İŞ MAHKEMESİ HAKİMLİĞİ'NE...\n"
        };
      }
      setCaseAnalysisResult(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setCaseAnalysisLoading(false);
    }
  };

  const analyzeDocRisk = async (docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setDocAnalysisLoading(true);
    try {
      const prompt = `Aşağıdaki yasal belgenin OCR metnini analiz ederek risk analizi hazırlayın.
Sözleşme Adı: ${doc.name}
Belge İçeriği: ${doc.contentText}

Şunları çıkartın:
1. Risk Puanı (0 - 100 arası, nerede risk yüksekse yüksek puan verin, örn: ağır rekabet maddesi varsa risk puani 80)
2. Risk Seviyesi (HIGH, MEDIUM, CLEAN)
3. Risklerin Detaylı Açıklaması

Yanıtı JSON formatında verin:
{
  "riskScore": 75,
  "riskLevel": "HIGH",
  "riskDescription": "Açıklama ve önerilen düzeltmeler..."
}`;

      const resText = await callGeminiApi(prompt, "DOCUMENT_ANALYSIS");
      let parsed = null;
      try {
        const cleanJson = resText.substring(resText.indexOf('{'), resText.lastIndexOf('}') + 1);
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        parsed = {
          riskScore: 65,
          riskLevel: "MEDIUM" as const,
          riskDescription: resText || "İmza eksiklikleri ve belirsiz tazminat şartları yüksek risk teşkil etmektedir."
        };
      }

      setDocuments(prev => prev.map(d => d.id === docId ? {
        ...d,
        riskScore: parsed.riskScore,
        riskLevel: parsed.riskLevel,
        riskDescription: parsed.riskDescription,
        status: 'RISK_ANALYZED'
      } : d));
      setDocAnalysisResult(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setDocAnalysisLoading(false);
    }
  };

  const runAiLegalSearch = async (query: string) => {
    setSearchLoading(true);
    setSearchResult("");
    try {
      const prompt = `Bir Türk avukat gibi davranarak aşağıdaki hukuki soruyu en güncel mevzuata, kanunlara ve Yargıtay emsal kararlarına dayanarak detaylıca yanıtlayın:
${query}

Yanıtınız net, akademik ve uygulanabilir tavsiyeler içermelidir.`;
      const res = await callGeminiApi(prompt, "LEGAL_SEARCH");
      setSearchResult(res);
      setSessions(prev => [{ id: Date.now(), title: query, type: 'SEARCH', date: new Date().toLocaleDateString('tr-TR') }, ...prev]);
    } catch (e) {
      setSearchResult("Arama esnasında bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setSearchLoading(false);
    }
  };

  const draftAiPetition = async (title: string, details: string) => {
    setPetitionLoading(true);
    setPetitionResult("");
    try {
      const prompt = `Türk Hukuku usul kurallarına (HMK, CMK, İYUK) tamamen uygun olarak, resmi, profesyonel ve mahkemeye sunulmaya hazır bir dilekçe taslağı hazırlayın.
Dilekçe Konusu: ${title}
Dilekçe Olayları & Talepler: ${details}

Lütfen dilekçede şu bölümleri tam olarak bulundurun:
- Mahkeme Başlığı (Örn: NÖBETÇİ İŞ MAHKEMESİNE)
- Davacı / Davalı Bilgileri (Ad-Soyad, T.C., Adres vb. alanlar taslak olarak)
- Konu
- Açıklamalar (Maddeler halinde yasal temelleriyle)
- Hukuki Sebepler / Deliller
- Netice-i Talep (Net istemler)`;

      const res = await callGeminiApi(prompt, "PETITION_DRAFT");
      setPetitionResult(res);
      setSessions(prev => [{ id: Date.now(), title: title, type: 'PETITION', date: new Date().toLocaleDateString('tr-TR') }, ...prev]);
    } catch (e) {
      setPetitionResult("Dilekçe hazırlanırken bir hata oluştu. Lütfen bilgileri kontrol edip tekrar deneyin.");
    } finally {
      setPetitionLoading(false);
    }
  };

  const runAcademyTeacher = async (lessonTitle: string) => {
    setAcademyLoading(true);
    setAcademyResult("");
    try {
      const prompt = `Bir Hukuk Fakültesi Profesörü gibi davranarak aşağıdaki konuyu stajyer avukatlar ve hukuk öğrencileri için son derece açıklayıcı, örnek olaylı ve anlaşılır bir ders şeklinde anlatın:
Ders Konusu: ${lessonTitle}

Dersin sonunda 3 soruluk pratik bir mini test de ekleyin.`;
      const res = await callGeminiApi(prompt, "ACADEMY");
      setAcademyResult(res);
    } catch (e) {
      setAcademyResult("Eğitim modülü yüklenirken bir hata oluştu.");
    } finally {
      setAcademyLoading(false);
    }
  };

  const simulateVoiceInput = async (input: string) => {
    setVoiceText(input);
    setVoiceActive(true);
    try {
      const prompt = `Aşağıdaki sesli hukuk asistanı diktesini (konuşmadan metne) analiz et. Avukatın söylediği hukuki soruyu kısa, profesyonel ve pratik şekilde sesli yanıt formatında (maksimum 3-4 cümle) cevapla:
"${input}"`;
      const res = await callGeminiApi(prompt, "VOICE_ASSISTANT");
      setVoiceResponse(res);
    } catch (e) {
      setVoiceResponse("Sesli asistan şu anda meşgul, lütfen tekrar konuşun.");
    } finally {
      setVoiceActive(false);
    }
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      caseFiles,
      selectedCaseFileId,
      documents,
      chatMessages,
      calendarEvents,
      paymentReceipts,
      sessions,
      supportTickets,
      
      caseAnalysisResult,
      caseAnalysisLoading,
      docAnalysisResult,
      docAnalysisLoading,
      searchResult,
      searchLoading,
      petitionResult,
      petitionLoading,
      academyResult,
      academyLoading,
      voiceActive,
      voiceText,
      voiceResponse,

      toggleAdminRole,
      togglePremiumRole,
      updateSystemConfig,
      addCaseFile,
      selectCaseFile,
      addDocumentToCase,
      analyzeDocRisk,
      addChatMessage,
      runCaseSimulation,
      addCalendarEvent,
      submitPaymentReceipt,
      approvePaymentReceipt,
      rejectPaymentReceipt,
      runAiLegalSearch,
      draftAiPetition,
      runAcademyTeacher,
      submitTicket,
      setVoiceActive,
      simulateVoiceInput
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
