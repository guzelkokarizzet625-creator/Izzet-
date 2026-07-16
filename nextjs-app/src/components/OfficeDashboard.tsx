'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Info,
  Trash2,
  Folder,
  DollarSign,
  Award,
  Activity,
  Check,
  FileText,
  Sliders,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Lock,
  Undo2,
  Save,
  Tag
} from 'lucide-react';

interface OfficeDashboardProps {
  onGoToSettings: () => void;
  onSwitchTab: (tab: string) => void;
}

export default function OfficeDashboard({ onGoToSettings, onSwitchTab }: OfficeDashboardProps) {
  const { 
    userProfile, 
    caseFiles, 
    selectedCaseFileId, 
    selectCaseFile, 
    addCaseFile, 
    calendarEvents, 
    addCalendarEvent,
    
    // Custom Dynamic Lists from AppContext
    davaTurleri,
    addDavaTuru,
    removeDavaTuru,
    mahkemeler,
    addMahkeme,
    removeMahkeme,
    sehirler,
    addSehir,
    removeSehir,
    etiketlerState,
    addEtiketState,
    removeEtiketState,
    belgeTurleri,
    addBelgeTuru,
    removeBelgeTuru,
    dosyaDurumlari,
    addDosyaDurumu,
    removeDosyaDurumu
  } = useApp();

  // Primary Add Case Dialog visibility
  const [showAddCase, setShowAddCase] = useState(false);

  // Search & Filtering for Case List
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDavaTuru, setFilterDavaTuru] = useState('');
  const [filterMahkeme, setFilterMahkeme] = useState('');
  const [filterSehir, setFilterSehir] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [filterEtiket, setFilterEtiket] = useState('');
  const [filterHakim, setFilterHakim] = useState('');

  // -----------------------------------------------------------------
  // FORM STATES (Redesigned Enterprise Case Form)
  // -----------------------------------------------------------------
  const [wizardTab, setWizardTab] = useState(0); // 0 to 7
  
  // Section 1: Basic Info & Court/Uyap
  const [caseTitle, setCaseTitle] = useState('');
  const [caseClient, setCaseClient] = useState('');
  const [caseCategory, setCaseCategory] = useState('İş Hukuku');
  const [caseDesc, setCaseDesc] = useState('');
  const [dosyaNo, setDosyaNo] = useState('');
  const [esasNo, setEsasNo] = useState('');
  const [kararNo, setKararNo] = useState('');
  const [uyapNo, setUyapNo] = useState('');
  const [mahkeme, setMahkeme] = useState('Asliye Hukuk Mahkemesi');
  const [mahkemeTuru, setMahkemeTuru] = useState('');
  const [daire, setDaire] = useState('');
  const [hakim, setHakim] = useState('');
  const [savci, setSavci] = useState('');
  const [katip, setKatip] = useState('');
  const [salon, setSalon] = useState('');
  const [sehir, setSehir] = useState('İstanbul');
  const [ilce, setIlce] = useState('');

  // Section 2: Parties (Davacı & Davalı)
  const [davaciAd, setDavaciAd] = useState('');
  const [davaciTc, setDavaciTc] = useState('');
  const [davaciTel, setDavaciTel] = useState('');
  const [davaciAdres, setDavaciAdres] = useState('');
  const [davaciEposta, setDavaciEposta] = useState('');
  const [davaciVekil, setDavaciVekil] = useState('');

  const [davaliAd, setDavaliAd] = useState('');
  const [davaliTc, setDavaliTc] = useState('');
  const [davaliTel, setDavaliTel] = useState('');
  const [davaliAdres, setDavaliAdres] = useState('');
  const [davaliEposta, setDavaliEposta] = useState('');
  const [davaliVekil, setDavaliVekil] = useState('');

  // Section 3: Evidence, Witnesses & Experts
  const [deliller, setDeliller] = useState<any[]>([]);
  const [delilTur, setDelilTur] = useState('PDF');
  const [delilAd, setDelilAd] = useState('');
  const [delilAciklama, setDelilAciklama] = useState('');

  const [taniklar, setTaniklar] = useState<any[]>([]);
  const [tanikIsim, setTanikIsim] = useState('');
  const [tanikTel, setTanikTel] = useState('');
  const [tanikAdres, setTanikAdres] = useState('');
  const [tanikEtki, setTanikEtki] = useState('');
  const [tanikGuven, setTanikGuven] = useState(80);

  const [bilirkisiler, setBilirkisiler] = useState<any[]>([]);
  const [bilirkisiAlan, setBilirkisiAlan] = useState('');
  const [bilirkisiRapor, setBilirkisiRapor] = useState('');
  const [bilirkisiDurumu, setBilirkisiDurumu] = useState('Bekliyor');

  // Section 4: Timeline & Calendar
  const [kronoloji, setKronoloji] = useState<any[]>([]);
  const [kronoTarih, setKronoTarih] = useState('');
  const [kronoSaat, setKronoSaat] = useState('');
  const [kronoYer, setKronoYer] = useState('');
  const [kronoOlay, setKronoOlay] = useState('');
  const [kronoBelge, setKronoBelge] = useState('');

  const [ilkDurusma, setİlkDurusma] = useState('');
  const [sonDurusma, setSonDurusma] = useState('');
  const [araKarar, setAraKarar] = useState('');
  const [sonTarih, setSonTarih] = useState('');
  const [zamanasimi, setZamanasimi] = useState('');
  const [hakDusurucu, setHakDusurucu] = useState('');
  const [hatirlatma, setHatirlatma] = useState('');
  const [googleSync, setGoogleSync] = useState(false);

  // Section 5: Financials & Folder Checklists
  const [harc, setHarc] = useState('0');
  const [vekalet, setVekalet] = useState('0');
  const [kesif, setKesif] = useState('0');
  const [bilirkisiUcreti, setBilirkisiUcreti] = useState('0');
  const [posta, setPosta] = useState('0');
  const [noter, setNoter] = useState('0');
  const [dosyaGideri, setDosyaGideri] = useState('0');
  const [ulasim, setUlasim] = useState('0');
  const [diger, setDiger] = useState('0');
  const [toplamMasraf, setToplamMasraf] = useState(0);

  const [seciliKlasorler, setSeciliKlasorler] = useState<string[]>([
    'Belgeler', 'Fotoğraflar', 'Dilekçeler', 'Notlar'
  ]);

  // Section 6: AI Analysis Studio
  const [aiRunning, setAiRunning] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  // Section 7: Notes, Tags & Case Status
  const [notlar, setNotlar] = useState<any[]>([]);
  const [notMetin, setNotMetin] = useState('');
  const [notTip, setNotTip] = useState<'standart' | 'sesli' | 'yildizli' | 'gizli'>('standart');
  const [seciliEtiketler, setSeciliEtiketler] = useState<string[]>(['Aktif']);
  const [caseStatus, setCaseStatus] = useState('ACTIVE');

  // Auto-Save, Cloud Sync & Versioning Simulation
  const [autoSaveStatus, setAutoSaveStatus] = useState('Bulutla Senkronize');
  const [versionHistory, setVersionHistory] = useState<any[]>([
    { id: 1, timestamp: new Date().toLocaleTimeString('tr-TR'), description: 'Dosya kaydı başlatıldı' }
  ]);

  // Section 8: Admin Panel Fields
  const [adminSection, setAdminSection] = useState<'dava' | 'mahkeme' | 'sehir' | 'etiket' | 'belge' | 'durum'>('dava');
  const [adminInput, setAdminInput] = useState('');

  // Calendar Event form states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLoc, setEventLoc] = useState('');

  // Sync / Calculate total costs automatically
  useEffect(() => {
    const sum = 
      parseFloat(harc || '0') + 
      parseFloat(vekalet || '0') + 
      parseFloat(kesif || '0') + 
      parseFloat(bilirkisiUcreti || '0') + 
      parseFloat(posta || '0') + 
      parseFloat(noter || '0') + 
      parseFloat(dosyaGideri || '0') + 
      parseFloat(ulasim || '0') + 
      parseFloat(diger || '0');
    setToplamMasraf(isNaN(sum) ? 0 : sum);
  }, [harc, vekalet, kesif, bilirkisiUcreti, posta, noter, dosyaGideri, ulasim, diger]);

  // Simulate Auto-Save & Log modifications
  const triggerAutoSave = (desc: string) => {
    setAutoSaveStatus('Değişiklikler kaydediliyor...');
    setTimeout(() => {
      setAutoSaveStatus('Değişiklikler kaydedildi');
      setVersionHistory(prev => [
        { id: prev.length + 1, timestamp: new Date().toLocaleTimeString('tr-TR'), description: desc },
        ...prev
      ]);
    }, 800);
  };

  const activeCase = caseFiles.find(c => c.id === selectedCaseFileId);

  // -----------------------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------------------
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim() || !caseClient.trim()) return;

    const extraFields = {
      dosyaNo,
      esasNo,
      kararNo,
      uyapNo,
      mahkeme,
      mahkemeTuru,
      daire,
      hakim,
      savci,
      katip,
      durusmaSalonu: salon,
      sehir,
      ilce,
      davaci: {
        adSoyad: davaciAd,
        tc: davaciTc,
        telefon: davaciTel,
        adres: davaciAdres,
        eposta: davaciEposta,
        vekili: davaciVekil
      },
      davali: {
        adSoyad: davaliAd,
        tc: davaliTc,
        telefon: davaliTel,
        adres: davaliAdres,
        eposta: davaliEposta,
        vekili: davaliVekil
      },
      deliller,
      taniklar,
      bilirkisiler,
      kronoloji,
      masraflar: {
        harc: parseFloat(harc),
        vekalet: parseFloat(vekalet),
        kesif: parseFloat(kesif),
        bilirkisi: parseFloat(bilirkisiUcreti),
        posta: parseFloat(posta),
        noter: parseFloat(noter),
        dosya: parseFloat(dosyaGideri),
        ulasim: parseFloat(ulasim),
        diger: parseFloat(diger),
        toplam: toplamMasraf
      },
      takvim: {
        ilkDurusma,
        sonDurusma,
        araKarar,
        sonTarih,
        zamanasimi,
        hakDusurucuSure: hakDusurucu,
        hatirlatma,
        googleCalendarSync: googleSync
      },
      aiAnalizi: aiAnalysisResult || {
        dosyaGucu: 70,
        riskSkoru: 30,
        basariOlasiligi: 70,
        eksikDeliller: ['Henüz analiz edilmedi'],
        eksikBelgeler: [],
        eksikTaniklar: [],
        celiskiler: [],
        hakimSorulari: [],
        savciSorulari: [],
        karsiTarafStratejisi: 'Henüz analiz yapılmadı.',
        toplanacakDeliller: [],
        hazirlanacakDilekceler: []
      },
      etiketler: seciliEtiketler,
      dosyaKlasorleri: seciliKlasorler,
      notlar,
      status: caseStatus,
      isCustom: true,
      versionHistory
    };

    addCaseFile(caseTitle, caseClient, caseCategory, caseDesc, extraFields);

    // Reset Form
    setCaseTitle('');
    setCaseClient('');
    setCaseDesc('');
    setDosyaNo('');
    setEsasNo('');
    setKararNo('');
    setUyapNo('');
    setMahkemeTuru('');
    setDaire('');
    setHakim('');
    setSavci('');
    setKatip('');
    setSalon('');
    setIlce('');
    setDavaciAd('');
    setDavaciTc('');
    setDavaciTel('');
    setDavaciAdres('');
    setDavaciEposta('');
    setDavaciVekil('');
    setDavaliAd('');
    setDavaliTc('');
    setDavaliTel('');
    setDavaliAdres('');
    setDavaliEposta('');
    setDavaliVekil('');
    setDeliller([]);
    setTaniklar([]);
    setBilirkisiler([]);
    setKronoloji([]);
    setHarc('0');
    setVekalet('0');
    setKesif('0');
    setBilirkisiUcreti('0');
    setPosta('0');
    setNoter('0');
    setDosyaGideri('0');
    setUlasim('0');
    setDiger('0');
    setİlkDurusma('');
    setSonDurusma('');
    setAraKarar('');
    setSonTarih('');
    setZamanasimi('');
    setHakDusurucu('');
    setHatirlatma('');
    setGoogleSync(false);
    setAiAnalysisResult(null);
    setNotlar([]);
    setSeciliEtiketler(['Aktif']);
    setCaseStatus('ACTIVE');
    
    setShowAddCase(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime) return;
    addCalendarEvent(eventTitle, eventDate, eventTime, eventDesc, eventLoc);
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventDesc('');
    setEventLoc('');
    setShowAddEvent(false);
  };

  // Simulated AI Legal Orchestrator Computation
  const runAiAnalysis = () => {
    if (!caseTitle.trim()) {
      alert("Yapay zeka analizi için lütfen önce 'Dosya Başlığı' girin.");
      return;
    }
    setAiRunning(true);
    setTimeout(() => {
      setAiRunning(false);
      const isCriminal = caseCategory.toLowerCase().includes('ceza');
      const mockResult = {
        dosyaGucu: Math.floor(Math.random() * 25) + 65, // 65-90
        riskSkoru: Math.floor(Math.random() * 20) + 15,  // 15-35
        basariOlasiligi: Math.floor(Math.random() * 20) + 70, // 70-90
        eksikDeliller: isCriminal 
          ? ['Olay yeri kamera kayıt dökümleri', 'Tanık ifadesi çapraz sorgu notları']
          : ['Yazılı iş sözleşmesi ıslak imzalı nüshası', 'SGK Hizmet dökümü ve işe giriş bildirgesi'],
        eksikBelgeler: [
          'Son 3 yıla ait banka hesap ekstreleri',
          'Arabuluculuk son anlaşmazlık tutanağı ıslak imzalı sureti'
        ],
        eksikTaniklar: [
          'Fesih/Olay anında işyerinde hazır bulunan diğer tarafsız personel'
        ],
        celiskiler: isCriminal
          ? ['Müştekinin savcılık ve mahkeme ifadelerindeki saat/mekan çelişkileri']
          : ['Davalı tarafın haklı neden iddia edip arabuluculukta tazminat teklif etmesi'],
        hakimSorulari: [
          'Taraflar arasında sözlü bir ek anlaşma yapıldı mı?',
          'İddia edilen ihlal olayının gerçekleştiği gün mesai takip kartları neden eksik?'
        ],
        savciSorulari: [
          'Olay günü sanığın yanındaki kişilerin açık kimlik tespiti yapıldı mı?'
        ],
        karsiTarafStratejisi: 'Karşı vekil, süreaşımı ve usul itirazlarını öne sürerek esasa girilmesini geciktirmeye çalışacaktır. Ayrıca sunulan dijital delillerin sıhhatine dair bilirkişi incelemesi talep edebilirler.',
        toplanacakDeliller: [
          'HTS kayıtlarının Bilgi Teknolojileri Kurumu\'ndan celbi',
          'İlgili banka şubesine yazılacak müzekkere cevapları'
        ],
        hazirlanacakDilekceler: [
          'Delil listesi sunum dilekçesi',
          'Taleplerimizin daraltılması ve ıslah dilekçesi şablonu'
        ]
      };
      setAiAnalysisResult(mockResult);
      triggerAutoSave('Yapay Zeka Analizi çalıştırıldı ve buluta kaydedildi.');
    }, 1500);
  };

  // Helper Add Functions for sublists
  const addDelil = () => {
    if (!delilAd.trim()) return;
    const newD = {
      id: Date.now(),
      tur: delilTur,
      ad: delilAd,
      aciklama: delilAciklama,
      boyut: '1.2 MB',
      tarih: new Date().toLocaleDateString('tr-TR')
    };
    setDeliller(prev => [...prev, newD]);
    setDelilAd('');
    setDelilAciklama('');
    triggerAutoSave('Yeni delil dosyası eklendi: ' + newD.ad);
  };

  const addTanik = () => {
    if (!tanikIsim.trim()) return;
    const newT = {
      id: Date.now(),
      isim: tanikIsim,
      telefon: tanikTel,
      adres: tanikAdres,
      etki: tanikEtki,
      guvenPuani: tanikGuven
    };
    setTaniklar(prev => [...prev, newT]);
    setTanikIsim('');
    setTanikTel('');
    setTanikAdres('');
    setTanikEtki('');
    triggerAutoSave('Yeni tanık eklendi: ' + newT.isim);
  };

  const addBilirkisi = () => {
    if (!bilirkisiAlan.trim()) return;
    const newB = {
      id: Date.now(),
      alan: bilirkisiAlan,
      rapor: bilirkisiRapor,
      durumu: bilirkisiDurumu
    };
    setBilirkisiler(prev => [...prev, newB]);
    setBilirkisiAlan('');
    setBilirkisiRapor('');
    triggerAutoSave('Yeni bilirkişi kaydı eklendi: ' + newB.alan);
  };

  const addKrono = () => {
    if (!kronoOlay.trim() || !kronoTarih) return;
    const newK = {
      id: Date.now(),
      tarih: kronoTarih,
      saat: kronoSaat,
      yer: kronoYer,
      olay: kronoOlay,
      belge: kronoBelge
    };
    setKronoloji(prev => [...prev, newK]);
    setKronoOlay('');
    setKronoTarih('');
    setKronoSaat('');
    setKronoYer('');
    setKronoBelge('');
    triggerAutoSave('Kronolojiye yeni olay eklendi');
  };

  const addNot = () => {
    if (!notMetin.trim()) return;
    const newN = {
      id: Date.now(),
      metin: notMetin,
      tip: notTip,
      tarih: new Date().toLocaleString('tr-TR')
    };
    setNotlar(prev => [...prev, newN]);
    setNotMetin('');
    triggerAutoSave('Yeni dosya notu eklendi');
  };

  // Filter implementation for UI cases list
  const filteredCases = caseFiles.filter(c => {
    const matchSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.esasNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.uyapNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchDavaTuru = !filterDavaTuru || c.category === filterDavaTuru;
    const matchMahkeme = !filterMahkeme || c.mahkeme === filterMahkeme;
    const matchSehir = !filterSehir || c.sehir === filterSehir;
    const matchDurum = !filterDurum || c.status === filterDurum;
    const matchHakim = !filterHakim || (c.hakim || '').toLowerCase().includes(filterHakim.toLowerCase());
    const matchEtiket = !filterEtiket || (c.etiketler || []).includes(filterEtiket);

    return matchSearch && matchDavaTuru && matchMahkeme && matchSehir && matchDurum && matchHakim && matchEtiket;
  });

  // Admin dynamic updates handler
  const handleAdminAdd = () => {
    if (!adminInput.trim()) return;
    if (adminSection === 'dava') addDavaTuru(adminInput);
    else if (adminSection === 'mahkeme') addMahkeme(adminInput);
    else if (adminSection === 'sehir') addSehir(adminInput);
    else if (adminSection === 'etiket') addEtiketState(adminInput);
    else if (adminSection === 'belge') addBelgeTuru(adminInput);
    else if (adminSection === 'durum') addDosyaDurumu(adminInput);
    setAdminInput('');
  };

  return (
    <div className="space-y-6">
      {/* Premium Hero Banner */}
      <div className={`p-6 rounded-2xl border ${
        userProfile.isPremium 
          ? 'bg-gradient-to-r from-charcoal via-midnight to-charcoal border-successGreen/20 glow-box-green' 
          : 'bg-gradient-to-r from-charcoal via-midnight to-charcoal border-warningOrange/20 glow-box-orange'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
              Hoş Geldiniz, {userProfile.name} 
              {userProfile.isAdmin && <span className="bg-goldDark/10 text-goldDark text-[10px] px-2 py-0.5 rounded font-black tracking-wider border border-goldDark/30">ADMIN</span>}
            </h1>
            <p className="text-xs text-softGrey">
              {userProfile.isPremium 
                ? 'Premium Hukuk Lisansı süresiz olarak aktiftir. Tüm yapay zekâ analizleri limitsizdir.' 
                : 'Standart Üye. Yapay zekâ simülasyonları ve OCR kontrollerini genişletmek için Premium pakete geçin.'}
            </p>
          </div>
          <button 
            onClick={() => onSwitchTab('payment')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 ${
              userProfile.isPremium 
                ? 'bg-slateGrey text-ivory hover:bg-slateGrey/80' 
                : 'bg-gradient-to-r from-goldDark to-amberAccent text-midnight hover:shadow-lg hover:scale-105'
            }`}
          >
            {userProfile.isPremium ? 'Ödeme Geçmişi & IBAN' : 'Premium\'a Yükselt'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top statistics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal p-5 rounded-2xl border border-slateGrey/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-softGrey uppercase tracking-wider block">Aktif Davalar</span>
            <span className="text-2xl font-extrabold text-goldLight">{caseFiles.length}</span>
          </div>
          <div className="bg-midnight p-3 rounded-xl text-goldDark">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-2xl border border-slateGrey/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-softGrey uppercase tracking-wider block">Planlı Duruşmalar</span>
            <span className="text-2xl font-extrabold text-goldLight">{calendarEvents.length}</span>
          </div>
          <div className="bg-midnight p-3 rounded-xl text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-2xl border border-slateGrey/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-softGrey uppercase tracking-wider block">Destek Talepleri</span>
            <span className="text-2xl font-extrabold text-goldLight">2</span>
          </div>
          <div className="bg-midnight p-3 rounded-xl text-cyan-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Case Selector, Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-charcoal p-6 rounded-2xl border border-slateGrey/60 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-goldLight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-goldDark" />
                Dava Dosyalarınız
              </h2>
              <p className="text-xs text-softGrey">İşlem yapmak veya analiz etmek istediğiniz davayı seçin</p>
            </div>
            <button 
              onClick={() => setShowAddCase(true)}
              className="bg-goldDark/10 hover:bg-goldDark/20 text-goldLight font-bold text-xs px-3.5 py-2 rounded-xl border border-goldDark/30 flex items-center gap-1.5 transition-all glow-box-gold"
            >
              <Plus className="w-4 h-4 text-goldDark" />
              Dava Ekle
            </button>
          </div>

          {/* Instant Search & Advanced Filtering Panel */}
          <div className="bg-midnight/50 p-4 rounded-xl border border-slateGrey/40 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-softGrey">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text" 
                  placeholder="Dosya adı, müvekkil, esas veya UYAP no ile ara..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 pl-9 pr-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                />
              </div>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterMahkeme('');
                  setFilterHakim('');
                  setFilterSehir('');
                  setFilterDavaTuru('');
                  setFilterDurum('');
                  setFilterEtiket('');
                }}
                className="bg-charcoal hover:bg-slateGrey/30 px-3 py-1.5 rounded-lg text-[10px] font-bold text-softGrey border border-slateGrey/40 transition-all shrink-0"
              >
                Filtreleri Temizle
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-softGrey block mb-0.5">Dava Türü</label>
                <select
                  value={filterDavaTuru}
                  onChange={e => setFilterDavaTuru(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-2 py-1 rounded text-[10px] text-ivory focus:outline-none"
                >
                  <option value="">Tümü</option>
                  {davaTurleri.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-softGrey block mb-0.5">Mahkeme</label>
                <select
                  value={filterMahkeme}
                  onChange={e => setFilterMahkeme(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-2 py-1 rounded text-[10px] text-ivory focus:outline-none"
                >
                  <option value="">Tümü</option>
                  {mahkemeler.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-softGrey block mb-0.5">Şehir</label>
                <select
                  value={filterSehir}
                  onChange={e => setFilterSehir(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-2 py-1 rounded text-[10px] text-ivory focus:outline-none"
                >
                  <option value="">Tümü</option>
                  {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-softGrey block mb-0.5">Durum</label>
                <select
                  value={filterDurum}
                  onChange={e => setFilterDurum(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-2 py-1 rounded text-[10px] text-ivory focus:outline-none"
                >
                  <option value="">Tümü</option>
                  {dosyaDurumlari.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-softGrey block mb-0.5">Etiket</label>
                <select
                  value={filterEtiket}
                  onChange={e => setFilterEtiket(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-2 py-1 rounded text-[10px] text-ivory focus:outline-none"
                >
                  <option value="">Tümü</option>
                  {etiketlerState.map(et => <option key={et} value={et}>{et}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-softGrey block mb-0.5">Hakim Arama</label>
                <input 
                  type="text" 
                  placeholder="Hakim soyadı..." 
                  value={filterHakim}
                  onChange={e => setFilterHakim(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-2 py-1 rounded text-[10px] text-ivory placeholder-softGrey focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* List of Cases */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center bg-midnight/30 rounded-xl border border-slateGrey/30">
                <p className="text-xs text-softGrey">Filtrelere veya aramanıza uygun dava bulunamadı.</p>
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = c.id === selectedCaseFileId;
                return (
                  <div 
                    key={c.id}
                    onClick={() => selectCaseFile(c.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-midnight border-goldDark/50 shadow-md ring-1 ring-goldDark/20' 
                        : 'bg-charcoal border-slateGrey/40 hover:border-slateGrey/80'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-xs font-bold text-ivory">{c.title}</span>
                          <span className="bg-slateGrey/80 px-2 py-0.5 text-[8px] text-goldLight rounded font-semibold">{c.category}</span>
                          {c.status && (
                            <span className="bg-midnight text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 text-[8px] rounded font-bold uppercase">{c.status}</span>
                          )}
                          {(c.etiketler || []).map((et: string) => (
                            <span key={et} className="bg-goldDark/10 text-goldDark border border-goldDark/20 px-1 py-0.2 text-[7px] rounded font-semibold">{et}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-softGrey line-clamp-1">{c.description}</p>
                        
                        {/* Court / No indicators */}
                        {(c.esasNo || c.mahkeme) && (
                          <div className="flex items-center gap-3 text-[9px] text-softGrey/80">
                            {c.mahkeme && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {c.mahkeme}</span>}
                            {c.esasNo && <span><strong>Esas:</strong> {c.esasNo}</span>}
                            {c.uyapNo && <span><strong>UYAP:</strong> {c.uyapNo}</span>}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-[9px] text-softGrey block">{c.date}</span>
                        <span className="text-[10px] text-emerald-400 font-bold block">{c.clientName}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeCase && (
            <div className="bg-midnight/80 p-4 rounded-xl border border-goldDark/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-goldLight" />
                  Seçili Aktif Çalışma Dosyası
                </span>
                <button 
                  onClick={() => onSwitchTab('dava')}
                  className="text-[10px] text-amberAccent hover:underline flex items-center gap-1 font-bold"
                >
                  Simülasyon & Analiz Paneline Git
                  <ArrowRight className="w-3" />
                </button>
              </div>
              <div>
                <h4 className="text-xs font-bold text-ivory">{activeCase.title}</h4>
                <p className="text-[11px] text-softGrey leading-relaxed mt-1">{activeCase.description}</p>
              </div>

              {/* Show Rich Details if custom details exist */}
              {activeCase.esasNo && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-slateGrey/30 text-[10px] text-softGrey">
                  <div><strong>Esas No:</strong> {activeCase.esasNo}</div>
                  <div><strong>Mahkeme:</strong> {activeCase.mahkeme}</div>
                  {activeCase.hakim && <div><strong>Hakim:</strong> {activeCase.hakim}</div>}
                  {activeCase.status && <div><strong>Durum:</strong> {activeCase.status}</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Hearings / Tasks */}
        <div className="lg:col-span-5 bg-charcoal p-6 rounded-2xl border border-slateGrey/60 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-goldLight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Duruşma ve İş Takvimi
              </h2>
            </div>
            <button 
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="bg-goldDark/10 hover:bg-goldDark/20 text-goldLight font-bold text-xs px-2.5 py-1 rounded-lg border border-goldDark/30 transition-all"
            >
              Yeni Ekle
            </button>
          </div>

          {showAddEvent && (
            <form onSubmit={handleCreateEvent} className="bg-midnight p-4 rounded-xl border border-slateGrey/60 space-y-3">
              <h3 className="text-xs font-bold text-goldLight">Yeni Duruşma/Görev Girişi</h3>
              <input 
                type="text" 
                placeholder="Duruşma / Görev Başlığı" 
                required
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey px-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  required
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-2 py-1.5 rounded-lg text-xs text-ivory focus:outline-none"
                />
                <input 
                  type="time" 
                  required
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-2 py-1.5 rounded-lg text-xs text-ivory focus:outline-none"
                />
              </div>
              <input 
                type="text" 
                placeholder="Adliye / Salon veya Ofis Adresi" 
                value={eventLoc}
                onChange={e => setEventLoc(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey px-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Notlar ve Yapılacak Hazırlıklar..." 
                value={eventDesc}
                onChange={e => setEventDesc(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey px-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
              />
              <button 
                type="submit"
                className="w-full bg-goldDark text-midnight font-bold text-xs py-2 rounded-lg transition-all"
              >
                Ajandaya Kaydet
              </button>
            </form>
          )}

          {/* List of Events */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {calendarEvents.map(ev => (
              <div key={ev.id} className="bg-midnight p-3.5 rounded-xl border border-slateGrey/40 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-ivory">{ev.title}</span>
                    <p className="text-[10px] text-softGrey leading-relaxed">{ev.description}</p>
                  </div>
                  <div className="bg-charcoal border border-slateGrey px-2 py-1 rounded text-center shrink-0">
                    <span className="block text-[8px] font-black text-amberAccent uppercase tracking-wide">
                      {new Date(ev.date).toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                    <span className="block text-xs font-black text-goldLight">{new Date(ev.date).getDate()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slateGrey/30 pt-2 text-[10px] text-softGrey">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span className="truncate max-w-[150px]">{ev.location || 'Ofis Toplantı Odası'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{ev.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          ENTERPRISE GLASSMORPHIC WIZARD MODAL (DAVA EKLE REDESIGN)
         ----------------------------------------------------------------- */}
      {showAddCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0c10]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#11141c]/95 border border-amber-500/30 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden glow-box-gold flex flex-col h-[90vh] md:h-[80vh] max-h-[900px]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slateGrey/40 bg-midnight/80 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-goldDark/20 p-2.5 rounded-xl border border-goldDark/40">
                  <Sparkles className="w-5 h-5 text-goldLight" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-goldLight tracking-tight flex items-center gap-2">
                    YENİ DAVA DOSYASI VE ORKESTRASYON KAYDI
                  </h2>
                  <p className="text-[10px] text-softGrey flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {autoSaveStatus} • Versiyon: v1.0.0
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddCase(false)}
                className="bg-charcoal hover:bg-slateGrey/40 p-2 rounded-xl text-softGrey hover:text-goldLight border border-slateGrey/30 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Inner Workspace Splitter */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-charcoal/30">
              
              {/* Left Sidebar Navigation (Glass frosted Accordion) */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slateGrey/40 bg-midnight/30 overflow-y-auto shrink-0 py-3 px-2 space-y-1">
                {[
                  { icon: <Briefcase className="w-4 h-4" />, label: "1. Dosya & Adliye" },
                  { icon: <User className="w-4 h-4" />, label: "2. Davacı & Davalı" },
                  { icon: <FileText className="w-4 h-4" />, label: "3. Deliller & Kadrolar" },
                  { icon: <Calendar className="w-4 h-4" />, label: "4. Kronoloji & Takvim" },
                  { icon: <DollarSign className="w-4 h-4" />, label: "5. Masraflar & Klasörler" },
                  { icon: <Sparkles className="w-4 h-4" />, label: "6. Yapay Zeka Analizi" },
                  { icon: <Tag className="w-4 h-4" />, label: "7. Notlar & Etiketler" },
                  { icon: <Sliders className="w-4 h-4" />, label: "8. Yönetici Tanımları" }
                ].map((tab, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWizardTab(idx)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                      wizardTab === idx 
                        ? 'bg-gradient-to-r from-goldDark/20 to-amber-500/5 text-goldLight border-l-4 border-goldDark shadow' 
                        : 'text-softGrey hover:bg-slateGrey/20 hover:text-ivory'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}

                {/* Status Indicator inside Left Panel */}
                <div className="pt-4 px-3 mt-4 border-t border-slateGrey/30 hidden md:block">
                  <span className="text-[9px] font-bold text-softGrey block">BÜTÇE TOPLAMI</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5">{toplamMasraf.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Right Active Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                
                {/* 1. Temel & Adliye */}
                {wizardTab === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-goldLight uppercase tracking-widest border-b border-goldDark/20 pb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-goldDark" /> Temel Dava & Adliye Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-softGrey block mb-1">Dava Dosya Adı *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Örn: Ahmet Yılmaz Kıdem Tazminatı" 
                          value={caseTitle}
                          onChange={e => setCaseTitle(e.target.value)}
                          className="w-full bg-midnight/60 border border-slateGrey/60 px-3 py-2 rounded-xl text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-softGrey block mb-1">Müvekkil Ad Soyad *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Örn: Ahmet Yılmaz" 
                          value={caseClient}
                          onChange={e => setCaseClient(e.target.value)}
                          className="w-full bg-midnight/60 border border-slateGrey/60 px-3 py-2 rounded-xl text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-softGrey block mb-1">Dava Türü (Kategori)</label>
                        <select
                          value={caseCategory}
                          onChange={e => setCaseCategory(e.target.value)}
                          className="w-full bg-midnight/60 border border-slateGrey/60 px-3 py-2 rounded-xl text-xs text-ivory focus:outline-none focus:border-goldDark"
                        >
                          {davaTurleri.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-softGrey block mb-1">Dosya Sınıfı / Durumu</label>
                        <select
                          value={caseStatus}
                          onChange={e => setCaseStatus(e.target.value)}
                          className="w-full bg-midnight/60 border border-slateGrey/60 px-3 py-2 rounded-xl text-xs text-ivory focus:outline-none"
                        >
                          {dosyaDurumlari.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-softGrey block mb-1">Dosya Özeti / İddiaların Özü</label>
                      <textarea 
                        rows={3}
                        placeholder="Uyuşmazlık konusu, talepler ve davanın temel dayanağı..."
                        value={caseDesc}
                        onChange={e => setCaseDesc(e.target.value)}
                        className="w-full bg-midnight/60 border border-slateGrey/60 p-3 rounded-xl text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                      />
                    </div>

                    <div className="border-t border-slateGrey/40 pt-4 space-y-4">
                      <h4 className="text-[11px] font-bold text-softGrey uppercase">UYAP & Esas Bilgileri</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Dosya No</label>
                          <input type="text" placeholder="2026/12" value={dosyaNo} onChange={e => {setDosyaNo(e.target.value); triggerAutoSave('Dosya no güncellendi');}} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Esas No</label>
                          <input type="text" placeholder="2026/345 Esas" value={esasNo} onChange={e => {setEsasNo(e.target.value); triggerAutoSave('Esas no güncellendi');}} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none focus:border-goldDark" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Karar No</label>
                          <input type="text" placeholder="2026/89 Karar" value={kararNo} onChange={e => {setKararNo(e.target.value); triggerAutoSave('Karar no güncellendi');}} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">UYAP No (Vatandaş/Kurum)</label>
                          <input type="text" placeholder="123456789" value={uyapNo} onChange={e => {setUyapNo(e.target.value); triggerAutoSave('UYAP No güncellendi');}} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Mahkeme</label>
                          <select value={mahkeme} onChange={e => setMahkeme(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none">
                            {mahkemeler.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Daire / Bölüm</label>
                          <input type="text" placeholder="9. Hukuk Dairesi" value={daire} onChange={e => setDaire(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Duruşma Salonu</label>
                          <input type="text" placeholder="Kat 2, B-4 Salonu" value={salon} onChange={e => setSalon(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Şehir</label>
                          <select value={sehir} onChange={e => setSehir(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none">
                            {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">İlçe</label>
                          <input type="text" placeholder="Çağlayan" value={ilce} onChange={e => setIlce(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Hakim Ad Soyad</label>
                          <input type="text" placeholder="Kemal Öztürk" value={hakim} onChange={e => setHakim(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Savcı Ad Soyad</label>
                          <input type="text" placeholder="Serkan Altuğ" value={savci} onChange={e => setSavci(e.target.value)} className="w-full bg-midnight/40 border border-slateGrey/40 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Davacı & Davalı */}
                {wizardTab === 1 && (
                  <div className="space-y-6">
                    {/* Davacı Section */}
                    <div className="space-y-4 bg-midnight/20 p-5 rounded-2xl border border-goldDark/10">
                      <h3 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-400" /> DAVACI TARAFI (AKTİF / MÜVEKKİL)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Ad Soyad / Unvan *</label>
                          <input type="text" placeholder="Ahmet Yılmaz" value={davaciAd} onChange={e => setDavaciAd(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">T.C. No / Vergi No</label>
                          <input type="text" placeholder="11111111111" value={davaciTc} onChange={e => setDavaciTc(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Telefon Numarası</label>
                          <input type="text" placeholder="0555 123 45 67" value={davaciTel} onChange={e => setDavaciTel(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] text-softGrey block mb-1">Tebligat Adresi</label>
                          <input type="text" placeholder="Huzur Mah. Adalet Sok. No: 5, Şişli/İstanbul" value={davaciAdres} onChange={e => setDavaciAdres(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">E-Posta Adresi</label>
                          <input type="email" placeholder="ahmet@gmail.com" value={davaciEposta} onChange={e => setDavaciEposta(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-softGrey block mb-1">Davacı Vekili (Avukatlar)</label>
                        <input type="text" placeholder="Av. Kerem Soylu (Siz)" value={davaciVekil} onChange={e => setDavaciVekil(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                      </div>
                    </div>

                    {/* Davalı Section */}
                    <div className="space-y-4 bg-midnight/20 p-5 rounded-2xl border border-goldDark/10">
                      <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-400" /> DAVALI TARAFI (KARŞI TARAF)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Ad Soyad / Şirket Unvanı *</label>
                          <input type="text" placeholder="Mega Hukuk Teknoloji A.Ş." value={davaliAd} onChange={e => setDavaliAd(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">T.C. No / Mersis No</label>
                          <input type="text" placeholder="22222222222" value={davaliTc} onChange={e => setDavaliTc(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">İrtibat Telefonu</label>
                          <input type="text" placeholder="0212 999 88 77" value={davaliTel} onChange={e => setDavaliTel(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] text-softGrey block mb-1">Tebligat Adresi</label>
                          <input type="text" placeholder="Levent Plaza Kat: 12, Beşiktaş/İstanbul" value={davaliAdres} onChange={e => setDavaliAdres(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">E-Posta Adresi</label>
                          <input type="email" placeholder="iletisim@megatech.com" value={davaliEposta} onChange={e => setDavaliEposta(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-softGrey block mb-1">Davalı Vekili (Karşı Vekil)</label>
                        <input type="text" placeholder="Av. Selin Gökçe" value={davaliVekil} onChange={e => setDavaliVekil(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded-lg text-xs text-ivory focus:outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Deliller & Kadrolar */}
                {wizardTab === 2 && (
                  <div className="space-y-6">
                    {/* Deliller Subform */}
                    <div className="space-y-3 bg-midnight/20 p-4 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase">DELİL / BELGE LİSTESİ</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select value={delilTur} onChange={e => setDelilTur(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory">
                          {belgeTurleri.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </select>
                        <input type="text" placeholder="Belge / Delil Adı (örn: İhtarname Tebliğ Mazbatası)" value={delilAd} onChange={e => setDelilAd(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                        <button type="button" onClick={addDelil} className="bg-goldDark text-midnight font-bold text-xs p-2 rounded-lg">Delil Ekle</button>
                      </div>
                      <input type="text" placeholder="Delil açıklaması / dosyaya etkisi..." value={delilAciklama} onChange={e => setDelilAciklama(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                      
                      {deliller.length > 0 && (
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pt-2">
                          {deliller.map((d, index) => (
                            <div key={d.id} className="flex justify-between items-center bg-midnight/40 p-2 rounded border border-slateGrey/30 text-[11px]">
                              <span>[{d.tur}] <strong>{d.ad}</strong> {d.aciklama ? ` - ${d.aciklama}` : ''}</span>
                              <button type="button" onClick={() => setDeliller(prev => prev.filter(item => item.id !== d.id))} className="text-rose-500 hover:text-rose-400 font-bold">Sil</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tanıklar Subform */}
                    <div className="space-y-3 bg-midnight/20 p-4 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase">TANIK LİSTESİ & GÜVEN DUYARLILIĞI</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" placeholder="Tanık İsim Soyisim" value={tanikIsim} onChange={e => setTanikIsim(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                        <input type="text" placeholder="Telefon Numarası" value={tanikTel} onChange={e => setTanikTel(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                        <input type="text" placeholder="Olayla İlgisi (örn: Ustabaşı)" value={tanikEtki} onChange={e => setTanikEtki(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[9px] text-softGrey block mb-1">Güven Puanı (Duruşma Başarısı): {tanikGuven}%</label>
                          <input type="range" min="10" max="100" value={tanikGuven} onChange={e => setTanikGuven(parseInt(e.target.value))} className="w-full accent-goldDark" />
                        </div>
                        <button type="button" onClick={addTanik} className="bg-goldDark text-midnight font-bold text-xs px-4 py-2 rounded-lg mt-3 shrink-0">Tanık Ekle</button>
                      </div>

                      {taniklar.length > 0 && (
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pt-2">
                          {taniklar.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-midnight/40 p-2 rounded border border-slateGrey/30 text-[11px]">
                              <span><strong>{t.isim}</strong> ({t.etki}) - Güven: <span className="text-goldDark font-bold">{t.guvenPuani}%</span></span>
                              <button type="button" onClick={() => setTaniklar(prev => prev.filter(item => item.id !== t.id))} className="text-rose-500 hover:text-rose-400 font-bold">Sil</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bilirkişiler Subform */}
                    <div className="space-y-3 bg-midnight/20 p-4 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase">BİLİRKİŞİ & HEYET TAKİBİ</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input type="text" placeholder="Uzmanlık Alanı (örn: Hesap Uzmanı)" value={bilirkisiAlan} onChange={e => setBilirkisiAlan(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory sm:col-span-2" />
                        <select value={bilirkisiDurumu} onChange={e => setBilirkisiDurumu(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory">
                          <option value="Bekliyor">Teveccüh Bekliyor</option>
                          <option value="Atandı">Bilirkişi Atandı</option>
                          <option value="Rapor Verildi">Rapor Teslim Edildi</option>
                          <option value="İtiraz Edildi">Rapora İtiraz Edildi</option>
                        </select>
                        <button type="button" onClick={addBilirkisi} className="bg-goldDark text-midnight font-bold text-xs p-2 rounded-lg">Kaydet</button>
                      </div>

                      {bilirkisiler.length > 0 && (
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pt-2">
                          {bilirkisiler.map(b => (
                            <div key={b.id} className="flex justify-between items-center bg-midnight/40 p-2 rounded border border-slateGrey/30 text-[11px]">
                              <span>{b.alan} - <strong>Durum:</strong> {b.durumu}</span>
                              <button type="button" onClick={() => setBilirkisiler(prev => prev.filter(item => item.id !== b.id))} className="text-rose-500 hover:text-rose-400 font-bold">Sil</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Kronoloji & Takvim */}
                {wizardTab === 3 && (
                  <div className="space-y-6">
                    {/* Kronoloji */}
                    <div className="space-y-3 bg-midnight/20 p-4 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase">DAVA KRONOLOJİSİ & VAKIALAR</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="date" value={kronoTarih} onChange={e => setKronoTarih(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                        <input type="time" value={kronoSaat} onChange={e => setKronoSaat(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                        <input type="text" placeholder="Olayın Gerçekleştiği Yer" value={kronoYer} onChange={e => setKronoYer(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input type="text" placeholder="Vakıa / Gelişme Özeti *" value={kronoOlay} onChange={e => setKronoOlay(e.target.value)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory sm:col-span-3" />
                        <button type="button" onClick={addKrono} className="bg-goldDark text-midnight font-bold text-xs p-2 rounded-lg">Ekle</button>
                      </div>

                      {kronoloji.length > 0 && (
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pt-2">
                          {kronoloji.map(k => (
                            <div key={k.id} className="flex justify-between items-center bg-midnight/40 p-2 rounded border border-slateGrey/30 text-[11px]">
                              <span><strong>{k.tarih} {k.saat}</strong>: {k.olay} {k.yer ? `(${k.yer})` : ''}</span>
                              <button type="button" onClick={() => setKronoloji(prev => prev.filter(item => item.id !== k.id))} className="text-rose-500 hover:text-rose-400 font-bold">Sil</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Takvim ve Kritik Süreler */}
                    <div className="space-y-4 bg-midnight/20 p-5 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase">DAVA KRİTİK SÜRE VE DURUŞMA TAKVİMİ</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">İlk Duruşma Günü</label>
                          <input type="date" value={ilkDurusma} onChange={e => setİlkDurusma(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Karar / Son Duruşma</label>
                          <input type="date" value={sonDurusma} onChange={e => setSonDurusma(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Ara Karar İfa Günü</label>
                          <input type="date" value={araKarar} onChange={e => setAraKarar(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Beyan / Islah Son Günü</label>
                          <input type="date" value={sonTarih} onChange={e => setSonTarih(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Zamanaşımı Günü</label>
                          <input type="date" value={zamanasimi} onChange={e => setZamanasimi(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Hak Düşürücü Süre</label>
                          <input type="date" value={hakDusurucu} onChange={e => setHakDusurucu(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-midnight/50 p-3 rounded-lg border border-slateGrey/30 mt-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-ivory block">Google Calendar Akıllı Entegrasyonu</span>
                          <span className="text-[10px] text-softGrey">Duruşma ve son teslim süreleri otomatik olarak ajandanıza eklenir.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={googleSync} onChange={e => setGoogleSync(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-charcoal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-softGrey after:border-slateGrey after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-goldDark"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Masraflar & Klasörler */}
                {wizardTab === 4 && (
                  <div className="space-y-6">
                    <div className="bg-midnight/20 p-5 rounded-2xl border border-slateGrey/40 space-y-4">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" /> HARÇ VE DAVA GİDER KALEMLERİ
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Başvuru & Karar Harcı (₺)</label>
                          <input type="number" value={harc} onChange={e => setHarc(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Vekalet Harcı / Pulu (₺)</label>
                          <input type="number" value={vekalet} onChange={e => setVekalet(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Keşif Avansı (₺)</label>
                          <input type="number" value={kesif} onChange={e => setKesif(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Bilirkişi Gideri Avansı (₺)</label>
                          <input type="number" value={bilirkisiUcreti} onChange={e => setBilirkisiUcreti(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Tebligat & Posta Gideri (₺)</label>
                          <input type="number" value={posta} onChange={e => setPosta(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Noter Masrafları (₺)</label>
                          <input type="number" value={noter} onChange={e => setNoter(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Dosya & Büro Masrafı (₺)</label>
                          <input type="number" value={dosyaGideri} onChange={e => setDosyaGideri(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Ulaşım & Konaklama (₺)</label>
                          <input type="number" value={ulasim} onChange={e => setUlasim(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-softGrey block mb-1">Diğer Masraflar (₺)</label>
                          <input type="number" value={diger} onChange={e => setDiger(e.target.value)} className="w-full bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory focus:outline-none" />
                        </div>
                      </div>

                      <div className="bg-midnight/80 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center mt-4">
                        <span className="text-xs font-bold text-ivory">GİDERLER TOPLAMI:</span>
                        <span className="text-base font-black text-emerald-400">{toplamMasraf.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    </div>

                    {/* Dosya Klasörleri checklist */}
                    <div className="bg-midnight/20 p-5 rounded-2xl border border-slateGrey/40 space-y-3">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
                        <Folder className="w-4 h-4 text-goldDark" /> OLUŞTURULACAK FİZİKSEL & DİJİTAL KLASÖRLER
                      </h4>
                      <p className="text-[10px] text-softGrey mb-3">Hukuk otomasyon sistemimizde bu dosya için açılacak standart klasör yapıları:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['Belgeler', 'Fotoğraflar', 'Videolar', 'Ses Kayıtları', 'Mahkeme Kararları', 'Yargıtay Kararları', 'Dilekçeler', 'Müvekkil Evrakları', 'Arabuluculuk Dosyası'].map(folder => {
                          const isChecked = seciliKlasorler.includes(folder);
                          return (
                            <label key={folder} className="flex items-center gap-2 bg-midnight/40 p-2.5 rounded-lg border border-slateGrey/30 hover:border-goldDark/30 cursor-pointer transition-all">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {
                                  if (isChecked) setSeciliKlasorler(prev => prev.filter(f => f !== folder));
                                  else setSeciliKlasorler(prev => [...prev, folder]);
                                }}
                                className="accent-goldDark" 
                              />
                              <span className="text-xs text-softGrey font-semibold">{folder}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Yapay Zeka Analizi */}
                {wizardTab === 5 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-midnight to-charcoal p-5 rounded-2xl border border-goldDark/30 space-y-4 glow-box-gold">
                      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-goldLight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-goldLight animate-pulse" />
                            GEMINI LEGAL ORCHESTRATOR YAPAY ZEKA STÜDYOSU
                          </h4>
                          <p className="text-xs text-softGrey">Davanın gücünü, risklerini ve karşı tarafın stratejisini simüle edin.</p>
                        </div>
                        <button
                          type="button"
                          onClick={runAiAnalysis}
                          disabled={aiRunning}
                          className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow shrink-0 disabled:opacity-50"
                        >
                          {aiRunning ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Analiz Yapılıyor...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Gemini Dosya Analizini Başlat
                            </>
                          )}
                        </button>
                      </div>

                      {aiAnalysisResult ? (
                        <div className="space-y-4 pt-4 border-t border-slateGrey/30">
                          
                          {/* Top percentages */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-midnight/70 p-4 rounded-xl border border-emerald-500/20 text-center">
                              <span className="text-[10px] text-softGrey block uppercase">DOSYA İDDİA GÜCÜ</span>
                              <span className="text-2xl font-black text-emerald-400 block mt-1">{aiAnalysisResult.dosyaGucu}%</span>
                              <span className="text-[9px] text-softGrey">Delil yeterliliği ve hukuki dayanak yüksek</span>
                            </div>
                            <div className="bg-midnight/70 p-4 rounded-xl border border-rose-500/20 text-center">
                              <span className="text-[10px] text-softGrey block uppercase">KAYIP / RİSK SKORU</span>
                              <span className="text-2xl font-black text-rose-400 block mt-1">{aiAnalysisResult.riskSkoru}%</span>
                              <span className="text-[9px] text-softGrey">Usulden kaybetme ve tebligat riskleri düşük</span>
                            </div>
                            <div className="bg-midnight/70 p-4 rounded-xl border border-goldDark/20 text-center">
                              <span className="text-[10px] text-softGrey block uppercase">BAŞARI OLASILIĞI</span>
                              <span className="text-2xl font-black text-goldLight block mt-1">{aiAnalysisResult.basariOlasiligi}%</span>
                              <span className="text-[9px] text-softGrey">Emsal kararlara göre kazanma ihtimali</span>
                            </div>
                          </div>

                          {/* Lists returned */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5 bg-midnight/30 p-4 rounded-xl border border-slateGrey/30">
                              <span className="font-bold text-amberAccent block">Eksik Deliller & Belgeler</span>
                              <ul className="list-disc pl-4 space-y-1 text-softGrey">
                                {[...aiAnalysisResult.eksikDeliller, ...aiAnalysisResult.eksikBelgeler].map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5 bg-midnight/30 p-4 rounded-xl border border-slateGrey/30">
                              <span className="font-bold text-amberAccent block">Hakim & Savcının Sorabileceği Sorular</span>
                              <ul className="list-disc pl-4 space-y-1 text-softGrey">
                                {[...aiAnalysisResult.hakimSorulari, ...aiAnalysisResult.savciSorulari].map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-midnight/40 p-4 rounded-xl border border-slateGrey/30 text-xs">
                            <span className="font-bold text-rose-400 block">Karşı Tarafın Muhtemel Stratejisi</span>
                            <p className="text-softGrey leading-relaxed mt-1">{aiAnalysisResult.karsiTarafStratejisi}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1 bg-midnight/30 p-4 rounded-xl border border-slateGrey/30">
                              <span className="font-bold text-emerald-400 block">Toplanması Önerilen Deliller</span>
                              <ul className="list-disc pl-4 space-y-0.5 text-softGrey">
                                {aiAnalysisResult.toplanacakDeliller.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-1 bg-midnight/30 p-4 rounded-xl border border-slateGrey/30">
                              <span className="font-bold text-goldLight block">Hazırlanacak Dilekçeler</span>
                              <ul className="list-disc pl-4 space-y-0.5 text-softGrey">
                                {aiAnalysisResult.hazirlanacakDilekceler.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-midnight/30 rounded-xl border border-slateGrey/20">
                          <Sparkles className="w-8 h-8 text-goldDark/50 mx-auto animate-pulse" />
                          <p className="text-xs text-softGrey mt-3">Yapay zeka analizi henüz tetiklenmedi. Lütfen adliye ve dosya bilgilerini tamamladıktan sonra yukarıdaki düğmeye tıklayarak analizi başlatın.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. Notlar, Etiketler & Durum */}
                {wizardTab === 6 && (
                  <div className="space-y-6">
                    {/* Tags multiselect */}
                    <div className="space-y-3 bg-midnight/20 p-4 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-goldDark" /> DOSYA ETİKETLERİ (MULTIPLE SELECT)
                      </h4>
                      <p className="text-[10px] text-softGrey">Görsel gruplama için istediğiniz etiketleri seçin:</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {etiketlerState.map(tag => {
                          const isSelected = seciliEtiketler.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (isSelected) setSeciliEtiketler(prev => prev.filter(t => t !== tag));
                                else setSeciliEtiketler(prev => [...prev, tag]);
                                triggerAutoSave('Etiketler güncellendi');
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-goldDark text-midnight border-goldDark shadow-md' 
                                  : 'bg-charcoal text-softGrey border-slateGrey/40 hover:border-slateGrey/80'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Not Ekleme */}
                    <div className="space-y-3 bg-midnight/20 p-4 rounded-xl border border-slateGrey/40">
                      <h4 className="text-[11px] font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-400" /> ÖZEL DOSYA NOTLARI
                      </h4>
                      <div className="flex gap-2">
                        <select value={notTip} onChange={e => setNotTip(e.target.value as any)} className="bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory">
                          <option value="standart">Standart Not</option>
                          <option value="sesli">🎙️ Ses Dikte Notu</option>
                          <option value="yildizli">⭐ Önemli / Yıldızlı</option>
                          <option value="gizli">🔒 Gizli / Kilitli Not</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Dosya hakkında gizli veya standart not yazın..." 
                          value={notMetin}
                          onChange={e => setNotMetin(e.target.value)}
                          className="flex-1 bg-midnight/60 border border-slateGrey/50 p-2 rounded text-xs text-ivory placeholder-softGrey focus:outline-none"
                        />
                        <button type="button" onClick={addNot} className="bg-goldDark text-midnight font-bold text-xs px-4 py-2 rounded-lg">Not Ekle</button>
                      </div>

                      {notlar.length > 0 && (
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pt-2">
                          {notlar.map(n => (
                            <div key={n.id} className="flex justify-between items-start bg-midnight/40 p-2.5 rounded border border-slateGrey/30 text-[11px]">
                              <div className="space-y-0.5">
                                <span className="font-bold text-goldLight capitalize block">
                                  {n.tip === 'gizli' ? '🔒 Gizli' : n.tip === 'yildizli' ? '⭐ Yıldızlı' : n.tip === 'sesli' ? '🎙️ Sesli' : '📝 Standart'} - {n.tarih}
                                </span>
                                <p className="text-softGrey">{n.metin}</p>
                              </div>
                              <button type="button" onClick={() => setNotlar(prev => prev.filter(item => item.id !== n.id))} className="text-rose-500 hover:text-rose-400 font-bold shrink-0 ml-2">Sil</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. Yönetici Tanımları */}
                {wizardTab === 7 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-goldLight uppercase tracking-widest border-b border-goldDark/20 pb-2 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-goldDark" /> SİSTEM PARAMETRELERİ YÖNETİCİ PANELİ
                    </h3>
                    <p className="text-[10px] text-softGrey leading-relaxed">
                      Bu panel sayesinde veritabanında kod yazmaya ihtiyaç duymadan, formlarda seçilebilecek şehirleri, mahkemeleri, dava türlerini vb. anında sisteme ekleyebilir veya kaldırabilirsiniz.
                    </p>

                    <div className="flex gap-2 bg-midnight/50 p-2.5 rounded-xl border border-slateGrey/30">
                      {[
                        { id: 'dava', label: "Dava Türleri" },
                        { id: 'mahkeme', label: "Mahkemeler" },
                        { id: 'sehir', label: "Şehirler" },
                        { id: 'etiket', label: "Etiketler" },
                        { id: 'belge', label: "Belge Türleri" },
                        { id: 'durum', label: "Dosya Durumları" }
                      ].map(sec => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setAdminSection(sec.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            adminSection === sec.id 
                              ? 'bg-goldDark text-midnight' 
                              : 'bg-charcoal text-softGrey'
                          }`}
                        >
                          {sec.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`Yeni ${adminSection === 'dava' ? 'dava türü' : adminSection === 'mahkeme' ? 'mahkeme' : adminSection === 'sehir' ? 'şehir' : adminSection === 'etiket' ? 'etiket' : adminSection === 'belge' ? 'belge türü' : 'dosya durumu'} adı girin...`}
                        value={adminInput}
                        onChange={e => setAdminInput(e.target.value)}
                        className="flex-1 bg-midnight/60 border border-slateGrey/50 p-2 rounded-xl text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                      />
                      <button
                        type="button"
                        onClick={handleAdminAdd}
                        className="bg-goldLight hover:bg-goldDark text-midnight font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Sisteme Ekle
                      </button>
                    </div>

                    {/* Displaying current dynamic values for this section */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-softGrey block uppercase">MEVCUT SİSTEM TANIMLARI</span>
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto bg-midnight/20 p-3 rounded-xl border border-slateGrey/40">
                        {adminSection === 'dava' && davaTurleri.map(t => (
                          <span key={t} className="bg-charcoal px-2.5 py-1 text-[10px] rounded-lg border border-slateGrey/30 flex items-center gap-1.5">
                            {t}
                            <button type="button" onClick={() => removeDavaTuru(t)} className="text-rose-500 hover:text-rose-400 font-bold">×</button>
                          </span>
                        ))}
                        {adminSection === 'mahkeme' && mahkemeler.map(m => (
                          <span key={m} className="bg-charcoal px-2.5 py-1 text-[10px] rounded-lg border border-slateGrey/30 flex items-center gap-1.5">
                            {m}
                            <button type="button" onClick={() => removeMahkeme(m)} className="text-rose-500 hover:text-rose-400 font-bold">×</button>
                          </span>
                        ))}
                        {adminSection === 'sehir' && sehirler.map(s => (
                          <span key={s} className="bg-charcoal px-2.5 py-1 text-[10px] rounded-lg border border-slateGrey/30 flex items-center gap-1.5">
                            {s}
                            <button type="button" onClick={() => removeSehir(s)} className="text-rose-500 hover:text-rose-400 font-bold">×</button>
                          </span>
                        ))}
                        {adminSection === 'etiket' && etiketlerState.map(et => (
                          <span key={et} className="bg-charcoal px-2.5 py-1 text-[10px] rounded-lg border border-slateGrey/30 flex items-center gap-1.5">
                            {et}
                            <button type="button" onClick={() => removeEtiketState(et)} className="text-rose-500 hover:text-rose-400 font-bold">×</button>
                          </span>
                        ))}
                        {adminSection === 'belge' && belgeTurleri.map(bt => (
                          <span key={bt} className="bg-charcoal px-2.5 py-1 text-[10px] rounded-lg border border-slateGrey/30 flex items-center gap-1.5">
                            {bt}
                            <button type="button" onClick={() => removeBelgeTuru(bt)} className="text-rose-500 hover:text-rose-400 font-bold">×</button>
                          </span>
                        ))}
                        {adminSection === 'durum' && dosyaDurumlari.map(d => (
                          <span key={d} className="bg-charcoal px-2.5 py-1 text-[10px] rounded-lg border border-slateGrey/30 flex items-center gap-1.5">
                            {d}
                            <button type="button" onClick={() => removeDosyaDurumu(d)} className="text-rose-500 hover:text-rose-400 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls (Undo/Next/Save) */}
            <div className="p-5 border-t border-slateGrey/40 bg-midnight/90 flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={wizardTab === 0}
                  onClick={() => setWizardTab(prev => Math.max(0, prev - 1))}
                  className="bg-charcoal hover:bg-slateGrey/40 px-3.5 py-2 rounded-xl text-xs font-bold text-softGrey border border-slateGrey/40 flex items-center gap-1 transition-all disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Önceki Adım
                </button>
                <button
                  type="button"
                  disabled={wizardTab === 7}
                  onClick={() => setWizardTab(prev => Math.min(7, prev + 1))}
                  className="bg-charcoal hover:bg-slateGrey/40 px-3.5 py-2 rounded-xl text-xs font-bold text-softGrey border border-slateGrey/40 flex items-center gap-1 transition-all disabled:opacity-40"
                >
                  Sonraki Adım <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Girdiğiniz tüm taslak veriler silinecektir. Kapatmak istediğinizden emin misiniz?")) {
                      setShowAddCase(false);
                    }
                  }}
                  className="bg-transparent hover:bg-rose-500/10 border border-slateGrey/40 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 transition-all"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleCreateCase}
                  className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight hover:shadow-xl hover:scale-105 active:scale-95 transition-all px-5 py-2 rounded-xl text-xs font-black tracking-tight"
                >
                  Kaydet ve Çalışma Dosyası Seç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
