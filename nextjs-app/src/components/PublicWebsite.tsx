'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Briefcase, 
  Sparkles, 
  Search, 
  PenTool, 
  GraduationCap, 
  Mic, 
  Camera, 
  CreditCard, 
  ChevronDown, 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  ExternalLink, 
  Info,
  X,
  AlertCircle,
  Menu,
  Lock
} from 'lucide-react';
import AuthPortal from './AuthPortal';

interface PublicWebsiteProps {
  onLoginSuccess: () => void;
}

export default function PublicWebsite({ onLoginSuccess }: PublicWebsiteProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'ai_assistant' | 'categories' | 'academy' | 'blog' | 'pricing' | 'faq' | 'about' | 'contact' | 'privacy' | 'terms'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [guestQuestion, setGuestQuestion] = useState('');
  
  // Interactive Guest AI Assistant & Academy States
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [showAssistantLock, setShowAssistantLock] = useState(false);
  const [assistantLogs, setAssistantLogs] = useState<Array<{sender: 'USER' | 'AI', text: string}>>([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  // Toggle FAQ items
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleAskAiGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestQuestion.trim()) return;
    // Guests cannot ask questions, prompt login
    setAuthModal('login');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  // Sample blog articles
  const blogArticles = [
    {
      id: 1,
      title: "Yapay Zekânın Hukuk Mesleğine Etkileri: Avukatlar İşsiz mi Kalacak?",
      category: "Teknoloji & Hukuk",
      date: "10 Temmuz 2026",
      summary: "Gelişen yapay zekâ teknolojileri avukatlık mesleğini yok etmek yerine, onu dönüştürerek avukatları daha verimli kılıyor. İşte geleceğin dijital hukuk ofisi.",
      content: `Yapay zekâ ve makine öğrenimi, son birkaç yılda neredeyse her sektörü olduğu gibi hukuk sektörünü de derinden etkilemeye başladı. Birçok meslektaşımızın aklında aynı soru var: "Yapay zekâ avukatların yerini alacak mı?"

Yargıtay kararlarının saniyeler içinde taranması, dava dilekçelerinin yapay zekâ asistanları tarafından taslak haline getirilmesi ve sözleşmelerdeki hukuki risklerin otomatik analizi artık hayal değil. Ancak bu durum, avukatların işlevsiz kalacağı anlamına gelmiyor. Aksine, rutin ve zaman alan araştırmaları yapay zekâya devreden avukatlar; stratejik karar alma, duruşma savunmaları ve müvekkil ilişkileri gibi insani empati ve derin hukuki muhakeme gerektiren alanlara çok daha fazla zaman ayırabilmektedir.

Gelecekte, yapay zekâyı kullanmayan avukatların, yapay zekâ asistanlarını verimli şekilde kullanan avukatlar karşısında rekabet gücünü kaybedeceği bir hukuk dünyası bizleri bekliyor. Bu nedenle AL Hukuk AI gibi platformlar, geleceğin hukuk ofislerinin temel taşı haline gelmektedir.`
    },
    {
      id: 2,
      title: "Uyap Entegrasyonları ve Dijital Ofis Yönetimi: Geleceğin Ofisleri",
      category: "Ofis Yönetimi",
      date: "05 Temmuz 2026",
      summary: "Bulut tabanlı hukuk otomasyon sistemleri ve akıllı ajandalar sayesinde işlerinizi adliyeye gitmeden, ofisinizden veya evinizden nasıl yönetebileceğinizi keşfedin.",
      content: `Adliyelerde dosya incelemek, tebligatları takip etmek ve duruşma günlerini kaçırmamak için yoğun çaba sarf ettiğimiz günler artık geride kalıyor. UYAP sisteminin dijitalleşmesi ve API entegrasyonları, hukuk ofislerinin yönetim biçimini tamamen değiştirdi.

Dijital bir hukuk ofisi, sadece kağıtsız ofis anlamına gelmez. Aynı zamanda bulut tabanlı erişim, otomatik takvim senkronizasyonu ve ekip arkadaşları arasında gerçek zamanlı dosya paylaşımı demektir. AL Hukuk AI'nin sunduğu Ofis Yönetim Sistemi, davalarınızı, belgelerinizi ve iş takviminizi tek bir panelden yönetmenize olanak tanır.

Yapay zekâ destekli entegrasyonlar sayesinde duruşma günleri akıllı ajandanıza otomatik işlenirken, olası süre aşımı riskleri de yapay zekâ tarafından taranıp tarafınıza kritik uyarılar olarak iletilir.`
    },
    {
      id: 3,
      title: "Dava Simülasyonları ile Mahkeme Risklerini Minimize Etmek",
      category: "Dava Yönetimi",
      date: "28 Haziran 2026",
      summary: "Yapay zekâ tabanlı dava simülatörleri, mahkeme öncesinde iddia ve savunmaların zayıf ve güçlü yanlarını SWOT analiziyle nasıl ortaya çıkartır?",
      content: `Dava açmadan önce veya bir davaya cevap vermeden önce karşılaşılabilecek riskleri tahmin etmek, bir avukatın en kritik görevlerinden biridir. Klasik yöntemlerde avukatlar tecrübelerine ve manuel yaptıkları içtihat taramalarına dayanarak bir tahmin yürütürler.

Yapay zekâ tabanlı Dava Simülatörleri ise bu süreci bilimsel ve analitik bir boyuta taşıyor. On binlerce Yargıtay kararı, kanun maddesi ve doktrinsel görüşü saniyeler içinde analiz eden yapay zekâ; uyuşmazlığın detaylarını girdiğinizde tarafların olası iddia ve savunmalarını, davanın güçlü ve zayıf yönlerini (SWOT) ve ilgili emsal kararları bir rapor halinde sunar.

Böylece müvekkilinize davanın olası gidişatı hakkında somut verilere dayanan analizler sunabilir, mahkemede sürpriz durumlarla karşılaşma riskini en aza indirebilirsiniz.`
    }
  ];

  const legalCategoriesData = [
    {
      name: "Ceza Hukuku",
      desc: "TCK ve CMK kapsamındaki tüm soruşturma, kovuşturma süreçleri, savunma dilekçeleri ve koruma tedbirlerine itiraz analizleri.",
      laws: ["5237 Sayılı Türk Ceza Kanunu", "5271 Sayılı Ceza Muhakemesi Kanunu"],
      features: "Yapay zekâ ceza davalarında suç unsurları analizini ve meşru müdafaa gibi haklılık sebeplerini emsallerle tarar."
    },
    {
      name: "İş Hukuku",
      desc: "Kıdem, ihbar tazminatı, fazla mesai ücret alacakları, işe iade davaları ve arabuluculuk süreçleri hesaplamaları.",
      laws: ["4857 Sayılı İş Kanunu", "6356 Sayılı Sendikalar ve Toplu İş Sözleşmesi Kanunu"],
      features: "Fazla mesai ispatında WhatsApp yazışmalarının ve banka kayıtlarının yasal delil gücünü otomatik değerlendirir."
    },
    {
      name: "Borçlar & Kira Hukuku",
      desc: "Kira tespit ve uyarlama davaları, tahliye taahhütnamelerinin geçerliliği, sözleşme ihlalleri ve cezai şart tenkis analizleri.",
      laws: ["6098 Sayılı Türk Borçlar Kanunu"],
      features: "TBK m. 344 kira artış sınırlarını ve tahliye davalarındaki hak düşürücü süreleri saniyeler içinde kontrol eder."
    },
    {
      name: "Ticaret & Şirketler Hukuku",
      desc: "Genel kurul kararlarının iptali, ortaklıktan çıkarma, ticari alacaklar, konkordato ve şirket birleşmeleri sözleşme risk analizi.",
      laws: ["6102 Sayılı Türk Ticaret Kanunu"],
      features: "Sözleşmelerde gizli kalmış ağır cezai şartları ve tek taraflı münhasırlık maddelerini bularak risk puanı üretir."
    },
    {
      name: "Bilişim & Kişisel Veri Hukuku",
      desc: "KVKK uyumluluğu, açık rıza metinleri, veri ihlali bildirimleri ve internetteki telif / içerik kaldırma (5651) ihtarname taslakları.",
      laws: ["6698 Sayılı Kişisel Verilerin Korunması Kanunu", "5651 Sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Kanunu"],
      features: "Web siteleriniz ve sözleşmeleriniz için KVKK uyumlu açık rıza metinleri ve veri politikaları hazırlar."
    },
    {
      name: "İdare & Vergi Hukuku",
      desc: "İdari işlemlerin iptali davaları, yürütmenin durdurulması talepleri, vergi cezalarına itiraz dilekçeleri ve tam yargı davaları.",
      laws: ["2577 Sayılı İdari Yargılama Usulü Kanunu"],
      features: "İdari işlemlerin yetki, şekil, sebep, konu ve amaç yönlerinden hukuka aykırılıklarını analiz eder."
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-midnight text-ivory relative font-sans overflow-x-hidden selection:bg-goldDark/30 selection:text-goldLight">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-goldDark/5 blur-[150px] rounded-full -z-20 pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-amberAccent/5 blur-[150px] rounded-full -z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] -z-30 pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 w-full bg-midnight/90 backdrop-blur-md border-b border-slateGrey/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedArticleId(null); }}>
          <div className="bg-gradient-to-br from-goldDark to-amberAccent p-2.5 rounded-xl text-midnight shadow-lg shadow-goldDark/10">
            <Bot className="w-5 h-5 font-black" />
          </div>
          <div>
            <h1 className="text-sm font-black text-goldLight tracking-wider font-display uppercase glow-gold">AL HUKUK AI</h1>
            <span className="text-[9px] text-softGrey tracking-widest uppercase block">Akıllı Hukuk Platformu</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {[
            { id: 'home', label: 'Ana Sayfa' },
            { id: 'ai_assistant', label: 'Yapay Zekâ Asistanı' },
            { id: 'categories', label: 'Hukuk Kategorileri' },
            { id: 'academy', label: 'Hukuk Akademisi' },
            { id: 'blog', label: 'Blog' },
            { id: 'pricing', label: 'Fiyatlandırma' },
            { id: 'faq', label: 'S.S.S.' },
            { id: 'about', label: 'Hakkımızda' },
            { id: 'contact', label: 'İletişim' },
            { id: 'privacy', label: 'Gizlilik' },
            { id: 'terms', label: 'Şartlar' }
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id as any);
                setSelectedArticleId(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === link.id
                  ? 'text-goldLight bg-charcoal/80 border border-slateGrey/40'
                  : 'text-softGrey hover:text-ivory hover:bg-charcoal/40'
              }`}
              style={{ minHeight: '40px' }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAuthModal('login')}
            className="hidden sm:inline-flex items-center justify-center border border-slateGrey hover:border-goldDark text-softGrey hover:text-goldLight font-bold text-xs px-4 py-2 rounded-xl transition-all"
            style={{ minHeight: '40px' }}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setAuthModal('register')}
            className="hidden sm:inline-flex items-center justify-center bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 active:scale-[0.97] text-midnight font-extrabold text-xs px-5 py-2 rounded-xl shadow-lg shadow-goldDark/10 transition-all"
            style={{ minHeight: '40px' }}
          >
            Kayıt Ol
          </button>
          
          {/* Mobile hamburger menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="xl:hidden p-2 text-softGrey hover:text-ivory"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Menu className="w-5 h-5 text-goldLight" />
          </button>
        </div>
      </header>

      {/* --- MAIN SECTION AREA --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">

        {/* --- 1. HOME VIEW --- */}
        {activeTab === 'home' && (
          <div className="space-y-16">
            
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-goldDark/15 text-goldLight text-[10px] font-black tracking-widest uppercase rounded-full border border-goldDark/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Yapay Zekâ ile Güçlendirilmiş Dijital Hukuk Ofisi
                </span>
                
                <h1 className="text-4xl sm:text-5xl font-black text-ivory tracking-tight leading-tight font-display">
                  Yapay Zekâ Teknolojisi ile <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-amberAccent to-goldDark glow-gold">
                    Hukukta Yeni Dönem
                  </span>
                </h1>
                
                <p className="text-sm text-softGrey leading-relaxed max-w-xl">
                  Dilekçe yazma, uyuşmazlık dava simülasyonu, akıllı içtihat arama, sesli avukat görüşmesi ve yasal belge risk analizi şimdi tek bir platformda. Avukatlar, hukukçular ve vatandaşlar için en gelişmiş akıllı asistan.
                </p>

                {/* Ask AI Guest form */}
                <form onSubmit={handleAskAiGuest} className="bg-charcoal/80 border border-slateGrey/60 p-2 rounded-2xl flex items-center max-w-lg shadow-2xl backdrop-blur-sm gap-2">
                  <div className="flex items-center gap-2 flex-1 pl-3">
                    <Search className="w-4 h-4 text-softGrey" />
                    <input
                      type="text"
                      placeholder="Bir hukuki soru yazın... (Örn: Kıdem tazminatı şartları nelerdir?)"
                      value={guestQuestion}
                      onChange={e => setGuestQuestion(e.target.value)}
                      className="w-full bg-transparent border-none text-xs text-ivory placeholder-softGrey/50 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-goldDark hover:bg-goldLight text-midnight font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all outline-none"
                    style={{ minHeight: '40px' }}
                  >
                    <span>Yapay Zekâya Sor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <p className="text-[10px] text-softGrey/70 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-goldDark shrink-0" />
                  Ziyaretçiler hukuki aramayı denemek için giriş yapmalıdır. Üyelik tamamen ücretsizdir.
                </p>

                {/* Statistics Banner */}
                <div className="grid grid-cols-3 gap-6 border-t border-slateGrey/40 pt-8 max-w-xl">
                  <div>
                    <span className="block text-xl font-black text-goldLight tracking-tight">50,000+</span>
                    <span className="text-[10px] text-softGrey uppercase font-bold tracking-wider">Hazırlanan Dilekçe</span>
                  </div>
                  <div>
                    <span className="block text-xl font-black text-goldLight tracking-tight">10K+ Saniye</span>
                    <span className="text-[10px] text-softGrey uppercase font-bold tracking-wider">Sesli Görüşme</span>
                  </div>
                  <div>
                    <span className="block text-xl font-black text-goldLight tracking-tight">99.8%</span>
                    <span className="text-[10px] text-softGrey uppercase font-bold tracking-wider">Güvenli Altyapı</span>
                  </div>
                </div>
              </div>

              {/* Graphical Hero Sidebar Container */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-goldDark/5 blur-[80px] rounded-full" />
                <div className="bg-gradient-to-b from-charcoal to-midnight border border-slateGrey/50 rounded-3xl p-6 shadow-2xl relative space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slateGrey/40">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] uppercase font-black text-softGrey tracking-wider">AL Hukuk AI Aktif Otomasyon</span>
                    </div>
                    <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/20 px-2 py-0.5 rounded-md font-bold">V1.4</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-midnight/80 p-3 rounded-xl border border-slateGrey/30 flex gap-3">
                      <div className="bg-goldDark/15 p-2 rounded-lg text-goldLight shrink-0 h-9 w-9 flex items-center justify-center">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-ivory block text-[11px]">Dilekçe Stüdyosu</span>
                        <p className="text-[10px] text-softGrey">HMK ve CMK uyumlu, resmi mahkeme dilekçeleri tanzimi.</p>
                      </div>
                    </div>

                    <div className="bg-midnight/80 p-3 rounded-xl border border-slateGrey/30 flex gap-3">
                      <div className="bg-amberAccent/15 p-2 rounded-lg text-amberAccent shrink-0 h-9 w-9 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-ivory block text-[11px]">Dava Risk Simülatörü</span>
                        <p className="text-[10px] text-softGrey">Uyuşmazlık analizi, SWOT değerlendirmesi ve emsal karar taraması.</p>
                      </div>
                    </div>

                    <div className="bg-midnight/80 p-3 rounded-xl border border-slateGrey/30 flex gap-3">
                      <div className="bg-orange-400/15 p-2 rounded-lg text-orange-400 shrink-0 h-9 w-9 flex items-center justify-center">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-ivory block text-[11px]">Sesli Avukat (Voice AI)</span>
                        <p className="text-[10px] text-softGrey">Asistanınızla sesli konuşun, mevzuat ve pratik çözümler alın.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between items-center text-[10px] text-softGrey">
                    <span>Bugün üretilen belgeler</span>
                    <strong className="text-goldLight">1,482 adet</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Value Highlights */}
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-goldLight tracking-tight uppercase">NEDEN AL HUKUK AI?</h2>
                <p className="text-xs text-softGrey">Hukuk bürolarının dijital çağdaki en güvenilir ve hızlı teknoloji iş ortağı.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-charcoal/60 border border-slateGrey/40 p-6 rounded-2xl space-y-3">
                  <div className="p-3 bg-goldDark/10 text-goldLight w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-ivory uppercase tracking-wider">100% KVKK ve Güvenlik Uyumlu</h3>
                  <p className="text-xs text-softGrey leading-relaxed">
                    Yüklenen dava bilgileri ve taranan evraklar şifreli olarak işlenir. Üçüncü şahıslarla asla paylaşılmaz, veri gizliliğiniz baro standartlarında korunur.
                  </p>
                </div>

                <div className="bg-charcoal/60 border border-slateGrey/40 p-6 rounded-2xl space-y-3">
                  <div className="p-3 bg-amberAccent/10 text-amberAccent w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-ivory uppercase tracking-wider">Zaman Kazanımı (90% Tasarruf)</h3>
                  <p className="text-xs text-softGrey leading-relaxed">
                    Normal şartlarda saatler süren dava araştırmalarını, dilekçe kurgularını ve mevzuat taramalarını yapay zekâ saniyeler içinde tamamlar.
                  </p>
                </div>

                <div className="bg-charcoal/60 border border-slateGrey/40 p-6 rounded-2xl space-y-3">
                  <div className="p-3 bg-orange-400/10 text-orange-400 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-ivory uppercase tracking-wider">Zengin Hukuk Arşivi</h3>
                  <p className="text-xs text-softGrey leading-relaxed">
                    İş, Borçlar, Ceza, İdare, Ticaret ve Bilişim hukuku başta olmak üzere binlerce güncel Yargıtay emsali ve kanun maddesi veri havuzumuzda hazırdır.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- 2. AI LEGAL ASSISTANT VIEW --- */}
        {activeTab === 'ai_assistant' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/25 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                SAAS YAPAY ZEKÂ GÜCÜ
              </span>
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">AI LEGAL ASSISTANT / YAPAY ZEKÂ ASİSTANI</h1>
              <p className="text-xs text-softGrey">Hukuki sorunlarınızı, dava uyuşmazlıklarınızı veya mevzuat sorularınızı yapay zekâ asistanımıza danışın.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Preset prompts */}
              <div className="lg:col-span-4 bg-charcoal/80 border border-slateGrey/60 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-goldLight tracking-widest block">💡 Örnek Hukukî Sorular</span>
                  <p className="text-[10px] text-softGrey">Yapay zekânın gücünü test etmek için aşağıdaki yasal senaryolardan birine tıklayabilirsiniz:</p>
                  
                  <div className="space-y-2.5">
                    {[
                      {
                        title: "Kira İlişkileri & Tahliye",
                        desc: "Kira sözleşmesinde 10 yıllık uzama süresi ve haklı tahliye nedenleri nelerdir?"
                      },
                      {
                        title: "İşçi Alacakları & Kıdem",
                        desc: "Haksız fesih ihbarı alan işçinin kıdem tazminatı ve fazla mesai ispat yükü kime aittir?"
                      },
                      {
                        title: "Sözleşmesel Cezai Şart",
                        desc: "Tek taraflı kararlaştırılan fahiş cezai şartın tenkisi mahkemeden nasıl talep edilir?"
                      }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setGuestQuestion(item.desc);
                          setShowAssistantLock(false);
                          setAssistantLogs([]);
                        }}
                        className="w-full text-left bg-midnight hover:bg-slateGrey/20 border border-slateGrey/30 p-3 rounded-xl transition-all space-y-1 outline-none text-xs group"
                        style={{ minHeight: '48px' }}
                      >
                        <span className="font-bold text-goldLight group-hover:text-amberAccent block text-[10px] uppercase tracking-wide">{item.title}</span>
                        <p className="text-[10px] text-softGrey line-clamp-2 leading-normal">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-midnight p-3.5 rounded-xl border border-goldDark/20 space-y-2">
                  <span className="text-[9px] font-bold text-goldLight uppercase tracking-wider block">🛡️ %100 KVKK VE GÜVENLİK</span>
                  <p className="text-[9.5px] text-softGrey leading-relaxed">
                    Tüm aramalarınız askeri düzeyde TLS/SSL tünelleriyle korunur. Misafir girişleri kesinlikle loglanmaz, verileriniz baro gizlilik standartlarına uygundur.
                  </p>
                </div>
              </div>

              {/* Right Column: AI Interactive Terminal Chat Console */}
              <div className="lg:col-span-8 bg-charcoal border border-slateGrey/60 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl min-h-[420px]">
                {/* Header of terminal */}
                <div className="bg-midnight/70 border-b border-slateGrey/40 p-4 flex justify-between items-center text-xs select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-goldDark rounded-full animate-pulse" />
                    <strong className="text-goldLight uppercase text-[10px] tracking-wider font-black">AL HUKUK AI COGNITIVE SİMÜLATÖR</strong>
                  </div>
                  <span className="text-[9px] text-softGrey">Statü: Ziyaretçi (Güvenli Mod)</span>
                </div>

                {/* Console text area */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[300px] text-xs">
                  {assistantLogs.length === 0 ? (
                    <div className="space-y-3 py-6 text-center max-w-sm mx-auto">
                      <Bot className="w-8 h-8 text-goldDark mx-auto animate-bounce" />
                      <h3 className="font-bold text-ivory text-xs uppercase tracking-wider">Hukukî Asistan Hazır</h3>
                      <p className="text-[11px] text-softGrey leading-relaxed">
                        Sol taraftaki örnek sorulardan birine tıklayabilir veya aşağıdaki kutuya kendi sorunuzu yazarak yapay zekâmızı test edebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assistantLogs.map((log, lIdx) => (
                        <div key={lIdx} className={`flex gap-3.5 ${log.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                          {log.sender === 'AI' && (
                            <div className="w-7 h-7 rounded-lg bg-goldDark/10 border border-goldDark/25 text-goldLight flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-[11px] leading-relaxed ${
                            log.sender === 'USER'
                              ? 'bg-goldDark text-midnight font-bold'
                              : 'bg-midnight/85 text-softGrey border border-slateGrey/30'
                          }`}>
                            {log.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thinking Loader state */}
                  {isAssistantThinking && (
                    <div className="flex gap-3 items-center text-[10px] text-goldLight animate-pulse pl-2 font-mono py-2">
                      <Sparkles className="w-4 h-4 animate-spin text-amberAccent" />
                      <span>Yapay zekâ emsal Yargıtay kararlarını ve kanun maddelerini süzüyor...</span>
                    </div>
                  )}

                  {/* Lock prompt premium overlay inline */}
                  {showAssistantLock && (
                    <div className="bg-midnight/90 border border-goldDark/25 rounded-xl p-5 space-y-4 animate-fadeIn">
                      <div className="flex gap-3 items-start">
                        <div className="p-2 bg-goldDark/10 text-goldLight rounded-lg border border-goldDark/25 shrink-0">
                          <Lock className="w-5 h-5 text-amberAccent" />
                        </div>
                        <div className="space-y-1">
                          <strong className="text-xs text-goldLight font-black uppercase tracking-wider block">🔐 ANALİZ KİLİTLENDİ (ÜYELİK GEREKLİ)</strong>
                          <p className="text-[10px] text-softGrey leading-relaxed">
                            Güvenlik, KVKK ve adli entegrasyon kuralları uyarınca yapay zekâ analiz sonuçları sadece sisteme kayıtlı olan kullanıcılara gösterilir. Saniyeler içinde tamamen ücretsiz kayıt olarak günlük kota hakkınızla analizinizi hemen tamamlayabilirsiniz.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => setAuthModal('register')}
                          className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-black px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                          style={{ minHeight: '38px' }}
                        >
                          Hemen Ücretsiz Üye Ol
                        </button>
                        <button
                          onClick={() => setAuthModal('login')}
                          className="bg-charcoal hover:bg-slateGrey/20 border border-slateGrey/40 text-goldLight font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                          style={{ minHeight: '38px' }}
                        >
                          Giriş Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Console Area */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!guestQuestion.trim() || isAssistantThinking) return;
                    setAssistantLogs([{ sender: 'USER', text: guestQuestion }]);
                    setIsAssistantThinking(true);
                    setShowAssistantLock(false);
                    setTimeout(() => {
                      setIsAssistantThinking(false);
                      setShowAssistantLock(true);
                    }, 1200);
                  }}
                  className="bg-midnight/55 border-t border-slateGrey/40 p-3 flex gap-2"
                >
                  <input
                    type="text"
                    disabled={isAssistantThinking}
                    placeholder="Asistana sormak istediğiniz konuyu yazın..."
                    value={guestQuestion}
                    onChange={(e) => setGuestQuestion(e.target.value)}
                    className="flex-1 bg-charcoal/80 border border-slateGrey/40 px-4 py-2 rounded-xl text-xs text-ivory outline-none focus:border-goldDark/80 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isAssistantThinking || !guestQuestion.trim()}
                    className="bg-goldDark hover:bg-goldLight disabled:opacity-40 disabled:hover:bg-goldDark text-midnight font-bold px-5 py-2 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
                    style={{ minHeight: '40px' }}
                  >
                    <span>Sorgula</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. LEGAL CATEGORIES VIEW --- */}
        {activeTab === 'categories' && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">YASAL KATEGORİ VE BRANŞLAR</h1>
              <p className="text-xs text-softGrey">Yapay zekâ asistanımızın tamamen hakim olduğu, özel uzmanlık modelleri içeren hukuk kategorileri.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {legalCategoriesData.map((cat, idx) => (
                <div key={idx} className="bg-charcoal/80 border border-slateGrey/60 p-6 rounded-2xl space-y-4">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-black text-goldLight uppercase tracking-wider">{cat.name}</h2>
                    <p className="text-xs text-softGrey leading-relaxed">{cat.desc}</p>
                  </div>
                  
                  <div className="border-t border-slateGrey/30 pt-3 space-y-2">
                    <span className="text-[9px] uppercase font-black tracking-wider text-softGrey/80">Kapsamındaki Temel Mevzuatlar:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.laws.map((law, lIdx) => (
                        <span key={lIdx} className="text-[9px] font-bold bg-midnight border border-slateGrey/40 px-2 py-0.5 rounded-md text-ivory">
                          {law}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-midnight/60 p-3 rounded-xl border border-slateGrey/30 text-[10px] text-softGrey flex gap-2">
                    <Sparkles className="w-4 h-4 text-goldDark shrink-0 mt-0.5" />
                    <p className="leading-relaxed"><strong className="text-goldLight">Yapay Zekâ Gücü:</strong> {cat.features}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. LAW ACADEMY VIEW --- */}
        {activeTab === 'academy' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                EĞİTİM VE GELİŞİM PORTALI
              </span>
              <h1 className="text-3xl font-black text-goldLight tracking-tight uppercase">AL HUKUK AKADEMİSİ / LAW ACADEMY</h1>
              <p className="text-xs text-softGrey leading-relaxed">
                Adli yazışma sanatından yapay zekâ entegrasyonlarına kadar, pratik avukatlık becerilerinizi zirveye taşıyacak premium hukuk dershanesi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Pratik Dilekçe Tanzim Sanatı",
                  badge: "Sertifikalı Sınıf",
                  duration: "6 Saat • 8 Modül",
                  rating: "4.9/5 (1,250+ Avukat)",
                  color: "border-emerald-500/30",
                  badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  lessons: [
                    "Hukukî Yazışmalarda Usul ve Maddi Hukuk Dengesi",
                    "Netice-i Talep (Sonuç) Bölümünün Kusursuz İnşası",
                    "Hak Düşürücü ve Zamanaşımı Sürelerinin Pratik Hesabı",
                    "HMK m. 119 Kapsamında Dava Dilekçesinin Zorunlu Unsurları"
                  ]
                },
                {
                  title: "Yapay Zekâ ile Dijital Avukatlık",
                  badge: "İleri Teknoloji",
                  duration: "4 Saat • 5 Modül",
                  rating: "5.0/5 (840+ Katılımcı)",
                  color: "border-goldDark/30",
                  badgeColor: "bg-goldDark/10 text-goldLight border-goldDark/20",
                  lessons: [
                    "Yapay Zekâya Doğru Prompt (Hukuki İpucu) Yazma Kuralları",
                    "Sözleşme Taramalarında Risk ve Hata Tespit Otomasyonu",
                    "KVKK, Veri Güvenliği ve Meslek Sırrı Çerçevesinde Yapay Zekâ",
                    "Dava Dosyalarından Akıllı Kronoloji ve Karar Özeti Üretme"
                  ]
                },
                {
                  title: "Kira ve Kat Mülkiyeti İhtilafları",
                  badge: "Uzmanlık",
                  duration: "5 Saat • 6 Modül",
                  rating: "4.8/5 (920+ Avukat)",
                  color: "border-blue-500/30",
                  badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  lessons: [
                    "10 Yıllık Uzama Süresi Sonu Tahliye Bildirim Usulü",
                    "Fahiş Kira Artışlarına Karşı Hukuki Koruma ve Uyarlama Davaları",
                    "Arabuluculuk Aşaması Stratejileri ve Anlaşma Belgesi Tanzimi",
                    "İhtiyaç Sebebiyle Tahliye Davalarında Kanıt ve İspat Kriterleri"
                  ]
                },
                {
                  title: "Ceza Yargılamasında Savunma Stratejileri",
                  badge: "Profesyonel",
                  duration: "8 Saat • 10 Modül",
                  rating: "4.9/5 (1,500+ Avukat)",
                  color: "border-pink-500/30",
                  badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
                  lessons: [
                    "Sorgu ve İfade Almada Müdafiinin Rolü ve Hakları",
                    "Yakalama, Gözaltı ve Tutuklama Kararlarına İtiraz Metotları",
                    "CMK Koruma Tedbirleri Nedeniyle Devlet Aleyhine Tazminat Davaları",
                    "Arama ve Elkoyma Kararlarının Hukuka Aykırılığı Savunması"
                  ]
                }
              ].map((course, cIdx) => (
                <div key={cIdx} className={`bg-charcoal/80 border ${course.color} rounded-2xl p-6 flex flex-col justify-between hover:border-goldDark/60 transition-all shadow-xl`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md border uppercase ${course.badgeColor}`}>
                        {course.badge}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-softGrey">
                        <span>⏱️ {course.duration}</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </div>

                    <h2 className="text-base font-black text-ivory tracking-wide uppercase">{course.title}</h2>
                    
                    <div className="space-y-2 border-t border-slateGrey/30 pt-3">
                      <span className="text-[9.5px] uppercase font-black tracking-wider text-goldLight block">Müfredat İçeriği:</span>
                      <ul className="space-y-1.5">
                        {course.lessons.map((lesson, lIdx) => (
                          <li key={lIdx} className="text-[11px] text-softGrey flex items-start gap-2">
                            <span className="text-emerald-500 font-bold shrink-0">✓</span>
                            <span className="leading-tight">{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slateGrey/20 flex items-center justify-between">
                    <span className="text-[10px] text-softGrey font-semibold">Tüm ders slaytları ve sınavlar dahildir.</span>
                    <button
                      onClick={() => setAuthModal('register')}
                      className="bg-goldDark hover:bg-goldLight text-midnight font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all outline-none"
                      style={{ minHeight: '38px' }}
                    >
                      <span>Derse Başla</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-charcoal to-midnight border border-slateGrey/50 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto">
              <GraduationCap className="w-10 h-10 text-goldLight mx-auto" />
              <h3 className="text-sm font-black text-ivory uppercase tracking-wider">Hukuk Öğrencileri ve Stajyerler İçin Ücretsiz Sınıflar</h3>
              <p className="text-xs text-softGrey leading-relaxed">
                Baro kaydı olan stajyer avukatlar veya hukuk fakültesi öğrencileri için akademi eğitimlerimiz tamamen ücretsizdir. Hemen üye olun ve profilinizden öğrenci belgenizi ibraz edin.
              </p>
              <button
                onClick={() => setAuthModal('register')}
                className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-goldDark/10 hover:brightness-110 active:scale-[0.98] transition-all"
                style={{ minHeight: '40px' }}
              >
                Akademiye Ücretsiz Kaydol
              </button>
            </div>
          </div>
        )}

        {/* --- 5. PRICING VIEW --- */}
        {activeTab === 'pricing' && (
          <div className="space-y-12">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">ESNEK SAAS ÜYELİK PLANLARI</h1>
              <p className="text-xs text-softGrey">Sınırlarınızı kaldırın, hukuk büronuzu adliye ve büro dışında da cepten yönetin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* FREE PLAN */}
              <div className="bg-charcoal/60 border border-slateGrey/40 p-8 rounded-3xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] bg-slateGrey/20 text-softGrey border border-slateGrey/30 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                      ÜCRETSİZ PLAN
                    </span>
                    <h2 className="text-xl font-bold text-ivory mt-2">Standart Üye</h2>
                    <p className="text-xs text-softGrey mt-1">Platformu denemek ve temel aramalar yapmak için ideal plan.</p>
                  </div>

                  <div className="text-3xl font-black text-goldLight">
                    ₺0 <span className="text-xs text-softGrey font-normal">/ Ömür Boyu</span>
                  </div>

                  <div className="border-t border-slateGrey/30 pt-4">
                    <ul className="space-y-2.5 text-[11px] text-softGrey">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <span>3 Yapay Zekâ Sorusu (Her 24 Saatte Bir)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <span>Maksimum 250 kelimelik temel cevaplar</span>
                      </li>
                      <li className="flex items-center gap-2 text-softGrey/50 line-through">
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Dava Risk Simülatörü</span>
                      </li>
                      <li className="flex items-center gap-2 text-softGrey/50 line-through">
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Dilekçe Taslak Stüdyosu</span>
                      </li>
                      <li className="flex items-center gap-2 text-softGrey/50 line-through">
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Sözleşme & OCR Risk Puanlaması</span>
                      </li>
                      <li className="flex items-center gap-2 text-softGrey/50 line-through">
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Sesli Avukat (Voice AI)</span>
                      </li>
                      <li className="flex items-center gap-2 text-softGrey/50 line-through">
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                        <span>PDF Olarak Dilekçe İhraç Etme</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setAuthModal('register')}
                  className="w-full py-3 border border-slateGrey hover:border-goldDark text-softGrey hover:text-goldLight font-bold rounded-xl text-xs transition-all"
                  style={{ minHeight: '44px' }}
                >
                  Ücretsiz Kayıt Ol
                </button>
              </div>

              {/* PREMIUM PLAN */}
              <div className="bg-charcoal border-2 border-goldDark p-8 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl">
                <span className="absolute right-0 top-0 bg-goldDark text-midnight text-[8px] font-black tracking-widest px-4 py-1.5 uppercase rounded-bl-xl shadow">
                  EN POPÜLER
                </span>

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/25 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                      YAPAY ZEKÂ LİMİTSİZ
                    </span>
                    <h2 className="text-xl font-bold text-goldLight mt-2">Premium Profesyonel</h2>
                    <p className="text-xs text-softGrey mt-1">Sınırsız soru hakkı ve tüm ileri düzey hukuk analiz araçları bir arada.</p>
                  </div>

                  <div>
                    <div className="text-3xl font-black text-goldLight">
                      ₺199.00 <span className="text-xs text-softGrey font-normal">/ Aylık</span>
                    </div>
                    <div className="text-[10px] text-goldDark font-bold mt-1">
                      (Yıllık peşin ödemede sadece ₺450.00 / Yıl - %50 Tasarruf!)
                    </div>
                  </div>

                  <div className="border-t border-slateGrey/30 pt-4">
                    <ul className="space-y-2.5 text-[11px] text-ivory">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <strong>Sınırsız Yapay Zekâ Sorusu & Hızlı Hukukî Arama</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <span>Detaylı, akademik düzeyde ve sınırsız uzunlukta analizler</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <strong>Sınırsız Dava Risk Simülatörü</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <strong>Sınırsız Dilekçe Taslak Stüdyosu</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <strong>Belge & OCR Tarama (Sınırsız PDF Analizi)</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <span>Sesli Avukat (Voice AI) Entegrasyonu</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-goldDark shrink-0" />
                        <span>PDF / Word Olarak Dilekçeleri Dışa Aktarma</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setAuthModal('register')}
                  className="w-full py-3 bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 text-midnight font-black rounded-xl text-xs transition-all shadow-lg shadow-goldDark/10"
                  style={{ minHeight: '44px' }}
                >
                  Premium Üyeliğe Geç
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 6. FAQ VIEW --- */}
        {activeTab === 'faq' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">SIKÇA SORULAN SORULAR</h1>
              <p className="text-xs text-softGrey">AL Hukuk AI hakkında en çok merak edilen konular ve yasal yanıtları.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "AL Hukuk AI verilerimin güvenliğini nasıl sağlıyor?",
                  a: "Yüklediğiniz tüm veriler ve evraklar KVKK (Kişisel Verilerin Korunması Kanunu) ile uyumlu olarak şifreli adli sunucularda saklanır. Yapay zekâ analizleri esnasında girilen bilgiler kesinlikle dışarıya sızdırılmaz veya reklam amaçlı işlenmez. Baro gizlilik standartlarına tamamen riayet edilir."
                },
                {
                  q: "Yapay zekâ kararları ve dilekçeleri resmi olarak geçerli midir?",
                  a: "Platformumuz tarafından hazırlanan dilekçeler ve dava simülasyonları yüksek doğruluklu yasal 'taslaklardır'. Hukuki olarak dilekçeleri adliyeye sunmadan önce mutlaka bir avukat veya hukukçu tarafından usul kurallarına göre incelenmeli ve son onay verilmelidir. Asistanımız karar destek niteliğindedir."
                },
                {
                  q: "Günlük soru kotası bittiğinde ne yapmalıyım?",
                  a: "Ücretsiz standart üyeler günde 3 hukuki soru sorabilir. Kotanız dolduğunda 'Yapay Zekâ Sınırına Ulaşıldı' uyarısı alırsınız. Bu durumda 'Ödeme & Lisans' menüsünden dilediğiniz zaman Premium paket satın alarak anında limitsiz kullanıma geçebilirsiniz."
                },
                {
                  q: "Banka havalesi ile ödeme yaparsam ne zaman onaylanır?",
                  a: "Banka havalesi veya EFT sonrasında 'Ödeme Bildirim Formu' üzerinden dekont dosyanızı yüklediğinizde, talebiniz admin paneline düşer. Genellikle 5 ila 30 dakika içerisinde yöneticilerimiz dekontu onaylar ve Premium üyeliğiniz anında aktif edilir."
                },
                {
                  q: "Dilekçe ve analiz sonuçlarını PDF olarak indirebilir miyim?",
                  a: "Evet. Premium üyelerimiz hazırladıkları tüm dilekçe taslaklarını, dava simülasyon raporlarını ve belge analizlerini tek bir tıklamayla resmi adli formatta PDF olarak bilgisayarlarına veya telefonlarına ihraç edebilirler."
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-charcoal/80 border border-slateGrey/60 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 flex justify-between items-center text-left font-bold text-xs text-ivory hover:bg-charcoal/40 transition-colors"
                    style={{ minHeight: '48px' }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-goldDark transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-5 border-t border-slateGrey/40 text-[11px] text-softGrey leading-relaxed bg-midnight/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 7. ABOUT VIEW --- */}
        {activeTab === 'about' && (
          <div className="space-y-10 max-w-4xl mx-auto">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">AL HUKUK AI HAKKINDA</h1>
              <p className="text-xs text-softGrey">Hukuk dünyasını geleceğin teknolojileriyle tanıştıran vizyonumuz ve hikayemiz.</p>
            </div>

            <div className="bg-charcoal border border-slateGrey/60 p-8 rounded-3xl space-y-6">
              <h2 className="text-base font-black text-goldLight uppercase tracking-wider">Biz Kimiz?</h2>
              <p className="text-xs text-softGrey leading-relaxed">
                AL Hukuk AI, 2026 yılında hukukçuların, stajyer avukatların ve hukuk öğrencilerinin mesleki işlerini kolaylaştırmak, adli araştırmalarını hızlandırmak ve dava hazırlıklarındaki riskleri minimize etmek amacıyla kurulmuş öncü bir yapay zekâ SaaS girişimidir.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slateGrey/40 pt-6">
                <div className="space-y-2">
                  <h3 className="text-xs uppercase font-black text-goldDark">Vizyonumuz</h3>
                  <p className="text-[11px] text-softGrey leading-relaxed">
                    Türkiye&apos;deki tüm adliye, baro ve özel büro süreçlerinin dijital birer yapay zekâ asistanıyla entegre çalıştığı, hukuka erişimin saniyeler düzeyine indiği demokratik ve teknolojik bir adalet ekosistemi oluşturmak.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs uppercase font-black text-goldDark">Misyonumuz</h3>
                  <p className="text-[11px] text-softGrey leading-relaxed">
                    Hukuk profesyonellerini angarya yazışmalardan kurtararak, onlara yaratıcı ve stratejik davalara odaklanmaları için vakit kazandıracak en yüksek isabet oranlı dil ve analiz modellerini sunmak.
                  </p>
                </div>
              </div>

              <div className="border-t border-slateGrey/40 pt-6 text-center text-xs text-softGrey">
                <span>Daha fazla bilgi için hukuk inovasyonu ekibimizle dilediğiniz zaman iletişime geçebilirsiniz.</span>
              </div>
            </div>
          </div>
        )}

        {/* --- 8. CONTACT VIEW --- */}
        {activeTab === 'contact' && (
          <div className="space-y-10">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">BİZİMLE İLETİŞİME GEÇİN</h1>
              <p className="text-xs text-softGrey">Sorularınız, iş birliği teklifleriniz veya teknik destek talepleriniz için bize yazabilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
              {/* Contact Info Sidebar */}
              <div className="lg:col-span-4 bg-charcoal border border-slateGrey/60 p-6 rounded-3xl space-y-6">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider">İletişim Bilgileri</h2>
                
                <div className="space-y-4 text-xs text-softGrey">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-goldDark shrink-0" />
                    <div>
                      <strong className="text-ivory block font-semibold">Ofis Adresi:</strong>
                      <span>Kartal Anadolu Adliye Sarayı Yanı, Hukuk Plaza Kat:12, İstanbul</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-goldDark shrink-0" />
                    <div>
                      <strong className="text-ivory block font-semibold">Telefon:</strong>
                      <span>+90 (216) 444 82 82</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-goldDark shrink-0" />
                    <div>
                      <strong className="text-ivory block font-semibold">E-Posta:</strong>
                      <span>destek@alhukuk.ai</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-goldDark shrink-0" />
                    <div>
                      <strong className="text-ivory block font-semibold">Çalışma Saatleri:</strong>
                      <span>Hafta İçi: 09:00 - 18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-8 bg-charcoal border border-slateGrey/60 p-6 rounded-3xl">
                {contactSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                    <h3 className="text-base font-black text-ivory uppercase">Mesajınız Alındı!</h3>
                    <p className="text-xs text-softGrey max-w-sm">
                      Bize ilettiğiniz bildirim başarıyla kaydedildi. Destek ekibimiz en kısa süre içerisinde tarafınıza geri dönüş sağlayacaktır.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <h2 className="text-xs font-black text-goldLight uppercase tracking-wider">✍️ Hızlı Mesaj Gönderin</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-softGrey uppercase">Adınız Soyadınız</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="Av. Ali Şahin"
                          className="w-full bg-midnight/80 border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs text-ivory outline-none focus:border-goldDark"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-softGrey uppercase">E-Posta Adresiniz</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          placeholder="ali.sahin@baro.org.tr"
                          className="w-full bg-midnight/80 border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs text-ivory outline-none focus:border-goldDark"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-softGrey uppercase">Konu</label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={e => setContactSubject(e.target.value)}
                        placeholder="İş birliği veya Premium Lisans Kurumsal Teklif"
                        className="w-full bg-midnight/80 border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs text-ivory outline-none focus:border-goldDark"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-softGrey uppercase">Mesaj İçeriği</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        placeholder="Sorunuzu veya teklifinizi detaylandırın..."
                        className="w-full bg-midnight/80 border border-slateGrey/50 p-3 rounded-xl text-xs text-ivory outline-none focus:border-goldDark leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-goldDark hover:bg-goldLight text-midnight font-bold px-5 py-3 rounded-xl text-xs transition-all outline-none"
                      style={{ minHeight: '44px' }}
                    >
                      Mesaj Gönder
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 9. BLOG VIEW --- */}
        {activeTab === 'blog' && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-goldLight tracking-tight uppercase">AL HUKUK AI BLOG</h1>
              <p className="text-xs text-softGrey">Hukuk teknolojileri, yapay zekâ entegrasyonları ve yasal gelişmeler üzerine makalelerimiz.</p>
            </div>

            {selectedArticleId ? (
              // Selected blog article read view
              (() => {
                const article = blogArticles.find(a => a.id === selectedArticleId);
                if (!article) return null;
                return (
                  <div className="bg-charcoal border border-slateGrey/60 p-6 sm:p-8 rounded-3xl space-y-6 max-w-3xl mx-auto animate-fadeIn relative">
                    <button
                      onClick={() => setSelectedArticleId(null)}
                      className="absolute right-6 top-6 text-softGrey hover:text-ivory bg-midnight/60 border border-slateGrey/50 p-2 rounded-xl text-xs font-bold transition-all"
                      style={{ minHeight: '40px' }}
                    >
                      Listeye Dön
                    </button>

                    <div className="space-y-2 pt-6">
                      <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/25 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                        {article.category}
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-ivory tracking-tight">{article.title}</h1>
                      <span className="text-[10px] text-softGrey block">{article.date}</span>
                    </div>

                    <div className="text-xs text-softGrey leading-relaxed whitespace-pre-line space-y-4 border-t border-slateGrey/30 pt-6">
                      {article.content}
                    </div>
                  </div>
                );
              })()
            ) : (
              // Blog list view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogArticles.map((article) => (
                  <div key={article.id} className="bg-charcoal/80 border border-slateGrey/60 rounded-2xl overflow-hidden hover:border-goldDark/50 transition-all flex flex-col justify-between h-[340px]">
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-goldLight font-bold uppercase">{article.category}</span>
                        <span className="text-softGrey">{article.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-ivory tracking-wide leading-snug line-clamp-2">{article.title}</h3>
                      <p className="text-[11px] text-softGrey leading-relaxed line-clamp-4">{article.summary}</p>
                    </div>

                    <div className="p-5 border-t border-slateGrey/30">
                      <button
                        onClick={() => setSelectedArticleId(article.id)}
                        className="w-full py-2 bg-midnight hover:bg-slateGrey/20 border border-slateGrey/40 text-goldLight text-xs font-bold rounded-xl transition-all"
                        style={{ minHeight: '40px' }}
                      >
                        Yazının Tamamını Oku
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 10. PRIVACY POLICY VIEW --- */}
        {activeTab === 'privacy' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn text-xs text-softGrey leading-relaxed">
            <div className="space-y-2 text-center">
              <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/20 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                KVKK VE BİLGİ GÜVENLİĞİ
              </span>
              <h1 className="text-3xl font-black text-goldLight tracking-tight uppercase">GİZLİLİK POLİTİKASI / PRIVACY POLICY</h1>
              <p className="text-xs">AL Hukuk AI Akıllı Adli Sistemler Kişisel Verilerin Korunması Aydınlatma Metni</p>
            </div>

            <div className="bg-charcoal border border-slateGrey/60 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">1. Veri Sorumlusu ve Giriş</h2>
                <p>
                  AL Hukuk AI Akıllı Adli Sistemler Ltd. Şti. (&quot;Şirket&quot;) olarak, platformumuzu (&quot;AL Hukuk AI&quot;) ziyaret eden misafirlerimizin, kayıtlı avukatlarımızın, stajyerlerimizin ve diğer kullanıcılarımızın gizlilik haklarına azami saygı gösteriyor; kişisel verilerinin korunmasına ve güvenliğinin sağlanmasına büyük önem veriyoruz. 
                </p>
                <p>
                  İşbu Gizlilik Politikası ve Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve ilgili ikincil mevzuat uyarınca, hangi verilerinizin hangi amaçlarla işlendiği, kimlere aktarılabileceği ve veri sahipliği haklarınızı nasıl kullanabileceğiniz hususunda sizi bilgilendirmek amacıyla hazırlanmıştır.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">2. İşlenen Kişisel Verileriniz</h2>
                <p>
                  Platformu kullanım durumunuza göre işlenen kişisel verileriniz kategoriler halinde şunlardır:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Kimlik ve İletişim Bilgileri:</strong> Üyelik esnasında paylaştığınız adınız, soyadınız, e-posta adresiniz, baro sicil numaranız (varsa) ve şifreniz.</li>
                  <li><strong>Kullanıcı İşlem Verileri:</strong> Yapay zekâ asistanımıza sorduğunuz hukuki sorular, ürettiğiniz dilekçe taslakları, yüklediğiniz ve OCR ile tarattığınız dava dosyaları ile PDF belgeler.</li>
                  <li><strong>Finansal Veriler:</strong> Premium abonelik satın alımları kapsamında yapılan ödemelere dair banka dekontları, fatura bilgileri, ödeme tutarı ve ödeme bildirim kayıtları. (Kredi kartı bilgileriniz doğrudan lisanslı ödeme geçidi tarafından işlenir, sunucularımızda saklanmaz).</li>
                  <li><strong>Teknik ve Cihaz Güvenliği Verileri:</strong> IP adresiniz, tarayıcı türünüz, işletim sisteminiz, adli sisteme giriş/çıkış zamanlarınız ve işlem geçmişiniz (Siber güvenlik logs).</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">3. Veri İşleme Amaçlarımız</h2>
                <p>
                  Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen yasal şartlar dahilinde şu amaçlarla işlenmektedir:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Yapay zekâ karar destek hizmetlerinin (Dilekçe Stüdyosu, Dava Simülatörü vb.) kesintisiz ve hatasız sunulması.</li>
                  <li>Kullanıcı hesaplarının doğrulanması, yetkisiz erişimlerin engellenmesi ve siber güvenliğin en üst düzeyde tesisi.</li>
                  <li>Premium abonelik süreçlerinin yönetimi, havale ödeme dekontlarının admin panelinde doğrulanarak onaylanması.</li>
                  <li>Mevzuattan kaynaklanan hukuki yükümlülüklerimizin (5651 sayılı Kanun uyarınca trafik verilerinin saklanması gibi) yerine getirilmesi.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">4. Veri Gizliliği Güvencesi ve Saklama Süresi</h2>
                <p>
                  AL Hukuk AI sunucularına yüklediğiniz yasal belgeler, dava konuları ve yapay zekâ sorgulamaları askeri düzeyde AES-256 şifreleme algoritması ile veri tabanımızda şifrelenir. 
                </p>
                <p>
                  Yapay zekâ modellerimiz, kullanıcı verilerini kendi genel eğitimi için **asla kullanmaz ve kaydetmez**. Tüm yapay zekâ API sorguları anlık (stateless) olarak işlenir ve analiz bittiğinde veri havuzunuz haricinde üçüncü şahıslara kapatılır. Kişisel verileriniz, üyeliğiniz devam ettiği sürece saklanır; üyeliğinizi iptal etmeniz veya verilerinizin silinmesini talep etmeniz halinde KVKK standartlarına uygun olarak kalıcı olarak imha edilir.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">5. Veri Sahibi Haklarınız (KVKK m. 11)</h2>
                <p>
                  Kanun&apos;un 11. maddesi uyarınca dilediğiniz zaman <strong>destek@alhukuk.ai</strong> e-posta adresi üzerinden bizimle iletişime geçerek; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve uygun kullanılıp kullanılmadığını sorma, verilerin düzeltilmesini veya silinmesini talep etme haklarınızı kullanabilirsiniz. Talepleriniz en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- 11. TERMS OF SERVICE VIEW --- */}
        {activeTab === 'terms' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn text-xs text-softGrey leading-relaxed">
            <div className="space-y-2 text-center">
              <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/20 px-2.5 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                KULLANICI VE HİZMET SÖZLEŞMESİ
              </span>
              <h1 className="text-3xl font-black text-goldLight tracking-tight uppercase">KULLANIM ŞARTLARI / TERMS OF SERVICE</h1>
              <p className="text-xs">AL Hukuk AI Akıllı Adli Sistemler Kullanım Kuralları ve Lisans Sözleşmesi</p>
            </div>

            <div className="bg-charcoal border border-slateGrey/60 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">1. Taraflar ve Onay</h2>
                <p>
                  İşbu Kullanım Şartları ve Hizmet Sözleşmesi (&quot;Sözleşme&quot;), AL Hukuk AI Akıllı Adli Sistemler Ltd. Şti. (&quot;Şirket&quot;) ile AL Hukuk AI platformuna (&quot;Platform&quot;) misafir veya kayıtlı üye olarak erişim sağlayan gerçek veya tüzel kişiler (&quot;Kullanıcı&quot;) arasında akdedilmiştir.
                </p>
                <p>
                  Platformu ziyaret ederek, üye olarak veya herhangi bir yapay zekâ aracını kullanarak, işbu Sözleşme&apos;de yer alan tüm şartları okuduğunuzu, anladığınızı ve aynen kabul ettiğinizi beyan etmiş olursunuz. Şartları kabul etmiyorsanız lütfen Platformu kullanmayınız.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">2. Sorumluluk Reddi Beyanı (Legal Disclaimer - Önemli!)</h2>
                <div className="bg-amber-500/5 border border-goldDark/30 p-4 rounded-2xl text-goldLight font-semibold space-y-2">
                  <p className="uppercase text-[10px] tracking-wider text-amberAccent font-black">📢 ÖNEMLİ HUKUKÎ BİLGİLENDİRME:</p>
                  <p className="leading-relaxed">
                    AL Hukuk AI bünyesindeki yapay zekâ asistanı, dilekçe tanzim şablonları, dava risk analiz simülatörleri ve mevzuat arama motorları sadece **karar destek ve ön araştırma** amaçlı tasarlanmıştır. Platformumuz bir hukuk bürosu olmadığı gibi, sağlanan yanıtlar resmi bir &quot;hukuki mütalaa&quot; veya &quot;avukatlık tavsiyesi&quot; teşkil etmez.
                  </p>
                  <p className="leading-relaxed">
                    Yapay zekâ tarafından tanzim edilen dilekçelerin adli mercilere sunulmadan önce mutlaka profesyonel bir avukat tarafından usul hukuku (HMK, CMK, İYUK) normlarına uygunluğu yönünden denetlenmesi zorunludur. Yapay zekâ çıktılarının kullanımından kaynaklanabilecek hak kayıpları, süre kaçırılması veya adli masraflardan Şirketimiz kesinlikle sorumlu tutulamaz.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">3. Fikri Mülkiyet Hakları</h2>
                <p>
                  Platformun arayüz tasarımı, kaynak kodları, veri tabanı yapıları, yapay zekâ prompt mühendisliği kurguları, logosu ve &quot;AL Hukuk AI&quot; markası Şirket&apos;in münhasır mülkiyetindedir. Kullanıcılara sağlanan üyelik hakkı, sadece kendi işlerinde karar destek almak üzere sınırlı, kişisel ve devredilemez bir kullanım lisansı vermektedir. Platform kodlarının veya veri tabanının kopyalanması, kazınması (scraping) veya üçüncü şahıslara pazarlanması yasaktır.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">4. Üyelik Planları ve Kullanım Kuralları</h2>
                <p>
                  <strong>Standart (Ücretsiz) Plan:</strong> Kullanıcılara 24 saatte bir 3 adet yapay zekâ soru sorma hakkı verir. Bu haklar devredilemez ve bir sonraki güne aktarılamaz.
                </p>
                <p>
                  <strong>Premium Planlar:</strong> Satın alınan paket uyarınca (Aylık, Yıllık veya Kurumsal) sınırsız yapay zekâ asistanı, dilekçe yazımı, risk analizleri ve sesli görüşme özellikleri sunar. Ödemelerin havale yöntemiyle yapılması halinde, admin panelinde onaylanması akabinde premium üyelik hakları başlatılır.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-goldLight uppercase tracking-wider border-b border-slateGrey/30 pb-2">5. Yürürlük ve Değişiklikler</h2>
                <p>
                  Şirket, adli mevzuat değişiklikleri veya teknolojik güncellemeler doğrultusunda işbu Kullanım Şartları&apos;nı dilediği zaman tek taraflı olarak revize etme hakkını saklı tutar. Güncel sözleşme platformda yayınlandığı andan itibaren tüm kullanıcılar için geçerlilik kazanır.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-charcoal border-t border-slateGrey/40 px-6 py-10 text-center space-y-6">
        <div className="flex justify-center gap-6 text-[10px] text-goldLight font-bold uppercase tracking-wider">
          <button onClick={() => { setActiveTab('home'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors">Ana Sayfa</button>
          <span className="text-softGrey/30">•</span>
          <button onClick={() => { setActiveTab('ai_assistant'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors">AI Asistanı</button>
          <span className="text-softGrey/30">•</span>
          <button onClick={() => { setActiveTab('categories'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors">Yasal Branşlar</button>
          <span className="text-softGrey/30">•</span>
          <button onClick={() => { setActiveTab('academy'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors">Akademisi</button>
          <span className="text-softGrey/30">•</span>
          <button onClick={() => { setActiveTab('pricing'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors">Fiyatlandırma</button>
          <span className="text-softGrey/30">•</span>
          <button onClick={() => { setActiveTab('privacy'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors underline decoration-goldDark">Gizlilik Politikası</button>
          <span className="text-softGrey/30">•</span>
          <button onClick={() => { setActiveTab('terms'); setSelectedArticleId(null); }} className="hover:text-amberAccent transition-colors underline decoration-goldDark">Kullanım Şartları</button>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-goldDark" />
            <span className="text-xs font-black text-goldLight tracking-wider uppercase">AL HUKUK AI</span>
          </div>
          <p className="text-[10px] text-softGrey max-w-md mx-auto leading-relaxed">
            AL Hukuk AI Yapay Zekâ ve Hukuk Otomasyon Sistemleri. Yapay zekâ tarafından tanzim edilen tüm dilekçe ve analizler karar destek niteliğindedir.
          </p>
        </div>

        <div className="text-[9px] text-softGrey/50 pt-2 border-t border-slateGrey/20 max-w-xs mx-auto">
          &copy; 2026 AL Hukuk AI Akıllı Adli Sistemler. Tüm hakları saklıdır.
        </div>
      </footer>

      {/* --- RESPONSIVE MOBILE HAMBURGER MENU DRAWER OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-midnight/95 backdrop-blur-lg z-50 flex flex-col justify-between p-6 animate-fadeIn xl:hidden">
          <div className="space-y-6">
            {/* Header of Mobile Menu */}
            <div className="flex justify-between items-center pb-4 border-b border-slateGrey/40">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-goldLight" />
                <span className="text-xs font-black text-goldLight tracking-wider uppercase">AL HUKUK AI MENU</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-softGrey hover:text-ivory bg-charcoal rounded-lg border border-slateGrey/30"
                style={{ minHeight: '38px', minWidth: '38px' }}
              >
                <X className="w-4 h-4 text-goldLight" />
              </button>
            </div>

            {/* Links list */}
            <nav className="flex flex-col gap-2.5">
              {[
                { id: 'home', label: 'Ana Sayfa' },
                { id: 'ai_assistant', label: 'Yapay Zekâ Asistanı' },
                { id: 'categories', label: 'Hukuk Kategorileri' },
                { id: 'academy', label: 'Hukuk Akademisi' },
                { id: 'blog', label: 'Blog Haberleri' },
                { id: 'pricing', label: 'Üyelik ve Fiyatlandırma' },
                { id: 'faq', label: 'Sıkça Sorulan Sorular' },
                { id: 'about', label: 'Hakkımızda' },
                { id: 'contact', label: 'İletişim ve Destek' },
                { id: 'privacy', label: 'Gizlilik Politikası (KVKK)' },
                { id: 'terms', label: 'Kullanım ve Lisans Şartları' }
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id as any);
                    setSelectedArticleId(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTab === link.id
                      ? 'text-goldLight bg-charcoal border border-slateGrey/40'
                      : 'text-softGrey hover:text-ivory hover:bg-charcoal/40'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* CTA Buttons inside the Mobile Menu */}
          <div className="space-y-3 pt-6 border-t border-slateGrey/40">
            <button
              onClick={() => { setAuthModal('login'); setMobileMenuOpen(false); }}
              className="w-full py-3 border border-slateGrey hover:border-goldDark text-softGrey hover:text-goldLight font-bold text-xs rounded-xl transition-all"
              style={{ minHeight: '44px' }}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setAuthModal('register'); setMobileMenuOpen(false); }}
              className="w-full py-3 bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-extrabold text-xs rounded-xl shadow-lg transition-all"
              style={{ minHeight: '44px' }}
            >
              Hemen Ücretsiz Üye Ol
            </button>
          </div>
        </div>
      )}

      {/* --- AUTHENTICATION MODAL OVERLAY --- */}
      {authModal && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-50 flex items-center justify-center px-4 animate-fadeIn">
          <div className="w-full max-w-md relative">
            <AuthPortal 
              initialMode={authModal} 
              onClose={() => setAuthModal(null)} 
              isModal={true} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
