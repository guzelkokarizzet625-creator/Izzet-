'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

// Import Modular Screen Components
import OfficeDashboard from '@/components/OfficeDashboard';
import CaseWorkspace from '@/components/CaseWorkspace';
import LegalSearch from '@/components/LegalSearch';
import PetitionStudio from '@/components/PetitionStudio';
import Academy from '@/components/Academy';
import VoiceLawyer from '@/components/VoiceLawyer';
import CameraOCR from '@/components/CameraOCR';
import Settings from '@/components/Settings';
import AdminPanel from '@/components/AdminPanel';
import CustomerPayment from '@/components/CustomerPayment';
import StandaloneSimulator from '@/components/StandaloneSimulator';
import AuthPortal from '@/components/AuthPortal';
import PublicWebsite from '@/components/PublicWebsite';

// Lucide Icons
import { 
  Briefcase, 
  Search, 
  PenTool, 
  GraduationCap, 
  Mic, 
  Camera, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  CreditCard, 
  Sparkles,
  Bot,
  Menu,
  X,
  Volume2,
  Loader2,
  LogOut,
  Lock,
  CheckCircle,
  Mail,
  AlertCircle
} from 'lucide-react';

type TabId = 
  | 'ofis' 
  | 'dava' 
  | 'search' 
  | 'petition' 
  | 'academy' 
  | 'voice' 
  | 'camera' 
  | 'settings' 
  | 'admin' 
  | 'payment' 
  | 'simulator';

export default function HomeClient() {
  const { userProfile, isAuthenticated, isEmailVerified, authLoading, signOutUser, sendVerificationEmail, reloadUser, toggleAdminRole, togglePremiumRole } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('ofis');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [verifError, setVerifError] = useState<string | null>(null);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-midnight text-goldLight space-y-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-goldDark" />
        <span className="text-xs font-black uppercase tracking-widest animate-pulse">AL Hukuk AI Yükleniyor...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PublicWebsite onLoginSuccess={() => {}} />;
  }

  // Email Verification Required Screen
  if (isAuthenticated && !isEmailVerified) {
    const handleResend = async () => {
      if (cooldown > 0 || verificationLoading) return;
      setVerificationLoading(true);
      setVerifError(null);
      const success = await sendVerificationEmail();
      setVerificationLoading(false);
      if (success) {
        setVerificationSent(true);
        setCooldown(60);
      } else {
        setVerifError("Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.");
      }
    };

    const handleRefresh = async () => {
      if (refreshLoading) return;
      setRefreshLoading(true);
      setVerifError(null);
      await reloadUser();
      setRefreshLoading(false);
    };

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-midnight text-ivory px-4 py-12 relative overflow-hidden font-sans">
        {/* Decorative background grid & glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-goldDark/10 via-midnight/80 to-midnight -z-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-goldDark/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amberAccent/5 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-md bg-charcoal border border-slateGrey/60 rounded-3xl p-8 shadow-2xl relative text-center space-y-6">
          <div className="inline-flex bg-gradient-to-br from-goldDark to-amberAccent p-3.5 rounded-2xl text-midnight shadow-lg shadow-goldDark/20 mx-auto">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-goldLight tracking-wider uppercase font-display">
              E-POSTA ADRESİNİZİ DOĞRULAYIN
            </h1>
            <p className="text-xs text-softGrey leading-relaxed">
              Hesabınız başarıyla oluşturuldu. Güvenliğiniz ve AL Hukuk AI servislerine tam erişim sağlamanız için <span className="text-goldLight font-bold underline">{userProfile.email}</span> adresine gönderdiğimiz doğrulama bağlantısına tıklamanız gerekmektedir.
            </p>
          </div>

          {/* Action Message Center */}
          {verifError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-300 font-medium leading-relaxed">{verifError}</p>
            </div>
          )}

          {verificationSent && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-left animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-300 font-medium leading-relaxed">Doğrulama bağlantısı e-posta adresinize tekrar gönderildi.</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="w-full bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 text-midnight font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-goldDark/10 outline-none"
              style={{ minHeight: '48px' }}
            >
              {refreshLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Doğrulamayı Kontrol Et</span>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={cooldown > 0 || verificationLoading}
              className="w-full border border-slateGrey hover:border-goldDark text-softGrey hover:text-goldLight font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 outline-none disabled:opacity-50"
              style={{ minHeight: '48px' }}
            >
              {verificationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : cooldown > 0 ? (
                <span>Tekrar Gönder ({cooldown} sn)</span>
              ) : (
                <span>Doğrulama Bağlantısını Yeniden Gönder</span>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-slateGrey/40 flex justify-center">
            <button
              onClick={signOutUser}
              className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              style={{ minHeight: '40px' }}
            >
              <LogOut className="w-4 h-4" />
              <span>Farklı Bir Hesapla Giriş Yap / Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'ofis', label: 'Ofis Paneli', icon: Briefcase, color: 'text-goldDark' },
    { id: 'simulator', label: '👨⚖️ Yapay Müşavir', icon: Bot, color: 'text-purple-400' },
    { id: 'academy', label: '🎓 Hukuk Akademisi', icon: GraduationCap, color: 'text-emerald-400' },
    { id: 'dava', label: 'Dava Simülatörü', icon: Sparkles, color: 'text-amberAccent' },
    { id: 'search', label: 'Yapay Zekâ Arama', icon: Search, color: 'text-blue-400' },
    { id: 'petition', label: 'Dilekçe Stüdyosu', icon: PenTool, color: 'text-pink-400' },
    { id: 'voice', label: 'Sesli Avukat', icon: Mic, color: 'text-orange-400' },
    { id: 'camera', label: 'Belge & OCR', icon: Camera, color: 'text-cyan-400' },
    { id: 'payment', label: 'Ödeme & Lisans', icon: CreditCard, color: 'text-yellow-400' },
    { id: 'settings', label: 'Profil & Ayarlar', icon: SettingsIcon, color: 'text-softGrey' },
  ];

  const adminMenu = { id: 'admin', label: 'Admin CMS', icon: ShieldAlert, color: 'text-red-400' };

  const renderActiveScreen = () => {
    const premiumTabs = ['dava', 'petition', 'voice', 'camera', 'simulator'];
    if (!userProfile.isPremium && premiumTabs.includes(activeTab)) {
      const featureDetails: Record<string, { title: string; desc: string; icon: any }> = {
        dava: { title: "Dava Simülatörü", desc: "Hukuki uyuşmazlıkları yapay zekâ ile modelleyin. Kronoloji oluşturma, SWOT analizi, iddia ve savunmaları listeleme ve dilekçe tanzimi gibi kapsamlı özellikleri kullanın.", icon: Sparkles },
        petition: { title: "Dilekçe Stüdyosu", desc: "Türk mahkemelerine uygun yasal formatta dilekçeleri anında ve otomatik olarak kaleme alın.", icon: PenTool },
        voice: { title: "Sesli Avukat (Voice AI)", desc: "Asistanınızla sesli konuşun, doğal dilde sorular yöneltip anında mütalaalar dinleyin.", icon: Mic },
        camera: { title: "Belge & OCR Analizi", desc: "Sözleşmeleri veya evrakları yükleyin. Metinleri tarasın (OCR), gizli riskleri saptayıp risk puanı çıkartsın.", icon: Camera },
        simulator: { title: "Akıllı Müşavir Sohbeti", desc: "Mali ve hukuki konularda yapay zekâ müşavirimizle derinlemesine sohbetler edin.", icon: Bot }
      };

      const currentFeature = featureDetails[activeTab] || { title: "Premium Özellik", desc: "Bu özellik yalnızca Premium üyelerimize özeldir.", icon: Lock };
      const FeatureIcon = currentFeature.icon;

      return (
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex items-center justify-center bg-midnight/90 text-ivory relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-goldDark/5 via-midnight to-midnight -z-10" />
          <div className="max-w-md w-full bg-charcoal border border-slateGrey/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
            
            <div className="inline-flex bg-goldDark/10 p-4 rounded-2xl text-goldLight shadow-lg shadow-goldDark/5 mx-auto border border-goldDark/25 relative">
              <FeatureIcon className="w-8 h-8" />
              <Lock className="w-4 h-4 text-amberAccent absolute -right-1 -top-1 bg-midnight rounded-full p-0.5 border border-goldDark" />
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-black text-goldLight uppercase tracking-wider">
                {currentFeature.title}
              </h1>
              <p className="text-[11px] text-softGrey leading-relaxed">
                {currentFeature.desc}
              </p>
            </div>

            <div className="bg-midnight/80 p-4 rounded-2xl border border-slateGrey/30 text-left space-y-3">
              <span className="text-[10px] font-black uppercase text-goldDark tracking-wider block">PREMIUM AVANTAJLARI</span>
              <ul className="space-y-2 text-[10px] text-softGrey">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-goldLight shrink-0" />
                  <span>Sınırsız yapay zekâ sorguları (kota engeli olmadan)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-goldLight shrink-0" />
                  <span>Dava Simülatörü ve Dilekçe Stüdyosu tam erişim</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-goldLight shrink-0" />
                  <span>OCR ile PDF/Görsel belge tarama ve risk analizi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-goldLight shrink-0" />
                  <span>Hazırlanan dilekçe ve analizleri PDF/Word indirme</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('payment')}
              className="w-full py-3.5 bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 text-midnight font-extrabold text-xs rounded-xl shadow-lg shadow-goldDark/10 transition-all uppercase tracking-wider outline-none"
              style={{ minHeight: '48px' }}
            >
              Hemen Premium&apos;a Yüksel
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'ofis':
        return <OfficeDashboard onGoToSettings={() => setActiveTab('settings')} onSwitchTab={(tab) => setActiveTab(tab as TabId)} />;
      case 'dava':
        return <CaseWorkspace onSwitchTab={(tab) => setActiveTab(tab as TabId)} />;
      case 'search':
        return <LegalSearch />;
      case 'petition':
        return <PetitionStudio />;
      case 'academy':
        return <Academy />;
      case 'voice':
        return <VoiceLawyer />;
      case 'camera':
        return <CameraOCR />;
      case 'payment':
        return <CustomerPayment />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return userProfile.isAdmin ? (
          <AdminPanel />
        ) : (
          <div className="flex-1 p-6 sm:p-8 flex items-center justify-center bg-midnight text-red-400 font-bold">
            Yetkisiz Erişim. Bu panel yalnızca yöneticilere özeldir.
          </div>
        );
      case 'simulator':
        return <StandaloneSimulator />;
      default:
        return <OfficeDashboard onGoToSettings={() => setActiveTab('settings')} onSwitchTab={(tab) => setActiveTab(tab as TabId)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-midnight font-sans">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-charcoal border-r border-slateGrey/60 shrink-0 select-none">
        {/* Branding Logo */}
        <div className="p-6 border-b border-slateGrey/40 flex items-center gap-3">
          <div className="bg-gradient-to-br from-goldDark to-amberAccent p-2 rounded-xl text-midnight shadow-md shadow-goldDark/10">
            <Bot className="w-5 h-5 font-black" />
          </div>
          <div>
            <h1 className="text-sm font-black text-goldLight tracking-wider font-display uppercase glow-gold">AL HUKUK AI</h1>
            <span className="text-[9px] text-softGrey tracking-widest uppercase block mt-0.5">Akıllı Asistan</span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          <span className="text-[10px] text-softGrey/60 uppercase font-black tracking-wider px-3 mb-2 block">Menü Sekmeleri</span>
          
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabId)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 outline-none ${
                  isActive 
                    ? 'bg-midnight text-goldLight border border-goldDark/20 shadow-sm' 
                    : 'text-softGrey hover:bg-slateGrey/30 hover:text-ivory'
                }`}
                style={{ minHeight: '48px' }} // Standard 48dp Touch Target
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Admin panel only visible if isAdmin is true */}
          {userProfile.isAdmin && (
            <div className="pt-4 border-t border-slateGrey/40 mt-4">
              <span className="text-[10px] text-red-400/80 uppercase font-black tracking-wider px-3 mb-2 block">Yönetim Paneli</span>
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 outline-none ${
                  activeTab === 'admin' 
                    ? 'bg-midnight text-red-400 border border-red-500/25 shadow-sm' 
                    : 'text-softGrey hover:bg-slateGrey/30 hover:text-ivory'
                }`}
                style={{ minHeight: '48px' }}
              >
                <adminMenu.icon className={`w-4 h-4 shrink-0 ${adminMenu.color}`} />
                <span>{adminMenu.label}</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer profile area */}
        <div className="p-4 border-t border-slateGrey/40 bg-midnight/35 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-goldDark/20 text-goldLight border border-goldDark/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="truncate">
              <span className="block text-[11px] font-bold text-ivory truncate">{userProfile.name}</span>
              <span className="block text-[9px] text-softGrey truncate">{userProfile.email}</span>
              {userProfile.isPremium ? (
                <span className="inline-block bg-goldDark/15 text-goldLight text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded border border-goldDark/20 mt-1">
                  ✨ PREMIUM
                </span>
              ) : (
                <span className="inline-block bg-slateGrey/20 text-goldLight text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded border border-slateGrey/30 mt-1">
                  Kalan Soru: {userProfile.remainingQuestions ?? 3} / 3
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={signOutUser}
            className="p-1.5 rounded-lg text-softGrey hover:text-red-400 hover:bg-red-500/10 transition-all outline-none"
            title="Oturumu Kapat"
            style={{ minHeight: '40px', minWidth: '40px' }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-charcoal border-b border-slateGrey/60 px-6 flex items-center justify-between shrink-0 select-none">
          {/* Mobile Menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-softGrey hover:text-ivory outline-none"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-black text-goldLight tracking-widest font-display uppercase">AL HUKUK AI</span>
          </div>

          {/* Desktop/Tablet active title display */}
          <div className="hidden sm:block">
            <span className="text-[10px] text-softGrey uppercase font-bold tracking-wider block">Aktif Çalışma Alanı</span>
            <h2 className="text-xs font-bold text-goldLight">
              {menuItems.find(m => m.id === activeTab)?.label || 'Yönetici CMS Paneli'}
            </h2>
          </div>

          {/* Role simulation dropdown (Very useful for user evaluation!) */}
          <div className="flex items-center gap-3 text-xs">
            {/* Quick toggles */}
            <div className="hidden md:flex items-center gap-2 bg-midnight/80 px-3 py-1.5 rounded-xl border border-slateGrey/50">
              <span className="text-[9px] font-bold text-softGrey uppercase">Hızlı Toggle:</span>
              <button 
                onClick={toggleAdminRole} 
                className={`text-[9px] px-2 py-0.5 rounded font-black border transition-all ${
                  userProfile.isAdmin 
                    ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                    : 'bg-slateGrey text-softGrey border-slateGrey'
                }`}
              >
                ADMIN: {userProfile.isAdmin ? 'AÇIK' : 'KAPALI'}
              </button>
              <button 
                onClick={togglePremiumRole} 
                className={`text-[9px] px-2 py-0.5 rounded font-black border transition-all ${
                  userProfile.isPremium 
                    ? 'bg-successGreen/15 text-successGreen border-successGreen/30' 
                    : 'bg-slateGrey text-softGrey border-slateGrey'
                }`}
              >
                PREMIUM: {userProfile.isPremium ? 'AÇIK' : 'KAPALI'}
              </button>
            </div>

            {/* Account state display */}
            <div className="bg-midnight px-3.5 py-1.5 rounded-xl border border-goldDark/25 text-[10px] font-extrabold text-goldDark flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-goldDark rounded-full animate-ping"></span>
              {userProfile.isPremium ? 'PREMIUM LİSANS' : 'STANDART ÜYE'}
            </div>
          </div>
        </header>

        {/* Tab workspace area */}
        <main className="flex-1 overflow-y-auto p-6 bg-midnight">
          {renderActiveScreen()}
        </main>

        {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
        <footer className="lg:hidden h-16 bg-charcoal border-t border-slateGrey/60 flex justify-around items-center shrink-0">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabId)}
                className={`flex flex-col items-center justify-center p-1 rounded-xl outline-none transition-colors ${
                  isActive ? 'text-goldLight' : 'text-softGrey'
                }`}
                style={{ width: '48px', height: '48px' }} // Standard 48x48 touch targets
              >
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-softGrey'}`} />
                <span className="text-[8px] font-black tracking-tight mt-1">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </footer>
      </div>

      {/* 4. MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>

          {/* Drawer Sheet */}
          <div className="relative flex flex-col w-64 max-w-xs bg-charcoal h-full border-r border-slateGrey/60 animate-slide-in-left p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
              <span className="text-sm font-black text-goldLight tracking-widest">MENÜ LİSTESİ</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-softGrey hover:text-ivory"
                style={{ minHeight: '48px', minWidth: '48px' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabId);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-midnight text-goldLight border border-goldDark/20' 
                        : 'text-softGrey hover:bg-slateGrey/30 hover:text-ivory'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {userProfile.isAdmin && (
                <div className="pt-3 border-t border-slateGrey/40 mt-3">
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'admin' 
                        ? 'bg-midnight text-red-400 border border-red-500/25' 
                        : 'text-softGrey hover:bg-slateGrey/30'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    <adminMenu.icon className={`w-4 h-4 shrink-0 ${adminMenu.color}`} />
                    <span>{adminMenu.label}</span>
                  </button>
                </div>
              )}
            </nav>

            <div className="p-3 border-t border-slateGrey/40 text-center space-y-2">
              <button
                onClick={() => {
                  signOutUser();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                style={{ minHeight: '40px' }}
              >
                <LogOut className="w-4 h-4" />
                <span>Oturumu Kapat</span>
              </button>
              <p className="text-[10px] font-bold text-softGrey">&copy; 2026 AL Hukuk AI</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
