'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldAlert, 
  Settings2, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  User, 
  MessageSquare,
  AlertCircle,
  Clock,
  Info,
  BarChart3,
  Users,
  Ticket,
  Megaphone,
  BookOpen,
  Terminal,
  Activity,
  Plus,
  Trash2,
  Lock,
  Database,
  RefreshCw,
  Flame,
  UserCheck
} from 'lucide-react';

type AdminTab = 'stats' | 'users' | 'receipts' | 'coupons' | 'content' | 'security' | 'settings';

export default function AdminPanel() {
  const { 
    userProfile, 
    updateSystemConfig, 
    paymentReceipts, 
    approvePaymentReceipt, 
    rejectPaymentReceipt,
    supportTickets,
    
    // Premium V3.0
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    
    // Enterprise Extensions
    adminUsers,
    coupons,
    campaigns,
    lawsAndPrecedents,
    securityLogs,
    
    // Config States
    geminiModel,
    geminiTemperature,
    geminiMaxTokens,
    firebaseConnected,
    databaseBackupDate,
    
    // Actions
    updateGeminiConfig,
    testFirebaseConnection,
    triggerDatabaseBackup,
    clearSystemCache,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    addCampaign,
    toggleCampaign,
    deleteCampaign,
    addLawItem,
    deleteLawItem,
    addSecurityLog,
    clearSecurityLogs,
    sendGlobalNotification,
    updateUserRoleAndPlan,
    toggleTwoFactorAuth
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('stats');

  // Premium V3.0 Input notes per request
  const [requestAdminNotes, setRequestAdminNotes] = useState<Record<string, string>>({});

  // Input states for Settings
  const [ibanInput, setIbanInput] = useState(userProfile.systemIban);
  const [monthlyPriceInput, setMonthlyPriceInput] = useState(userProfile.premiumPriceMonthly);
  const [annualPriceInput, setAnnualPriceInput] = useState(userProfile.premiumPriceAnnual);
  const [corporatePriceInput, setCorporatePriceInput] = useState(userProfile.premiumPriceCorporate || "₺1,250.00");
  const [configSuccess, setConfigSuccess] = useState(false);

  // Input states for Coupons
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(20);
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');

  // Input states for Campaigns
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampCode, setNewCampCode] = useState('');
  const [newCampColor, setNewCampColor] = useState('from-goldDark to-amberAccent');

  // Input states for Law Database
  const [newLawTitle, setNewLawTitle] = useState('');
  const [newLawCategory, setNewLawCategory] = useState<'IS' | 'BORCLAR' | 'EMSAL' | 'ANAYASA'>('IS');
  const [newLawContent, setNewLawContent] = useState('');

  // Input states for AI settings
  const [selectedAiModel, setSelectedAiModel] = useState(geminiModel);
  const [aiTemp, setAiTemp] = useState(geminiTemperature);
  const [aiMaxTokens, setAiMaxTokens] = useState(geminiMaxTokens);

  // Input state for Global announcement
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Firebase testing
  const [isFirebaseTesting, setIsFirebaseTesting] = useState(false);
  const [isCacheClearing, setIsCacheClearing] = useState(false);

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(ibanInput, monthlyPriceInput, annualPriceInput, corporatePriceInput);
    addSecurityLog('SENSITIVE_ACCESS', `Sistem lisans fiyatlandırmaları ve banka IBAN adresi değiştirildi.`, 'WARNING');
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  const handleSaveAiConfig = () => {
    updateGeminiConfig(selectedAiModel, aiTemp, aiMaxTokens);
    addSecurityLog('SENSITIVE_ACCESS', `Yapay zeka parametreleri güncellendi (Sıcaklık: ${aiTemp}, Sınır: ${aiMaxTokens} token)`, 'INFO');
  };

  const handleTestFirebase = async () => {
    setIsFirebaseTesting(true);
    await testFirebaseConnection();
    setIsFirebaseTesting(false);
  };

  const handleClearCache = () => {
    setIsCacheClearing(true);
    setTimeout(() => {
      clearSystemCache();
      setIsCacheClearing(false);
    }, 600);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon(newCouponCode.trim().toUpperCase(), newCouponDiscount, newCouponExpiry);
    setNewCouponCode('');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;
    addCampaign(newCampTitle.trim(), newCampDesc, newCampCode, newCampColor);
    setNewCampTitle('');
    setNewCampDesc('');
    setNewCampCode('');
  };

  const handleCreateLawItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLawTitle.trim() || !newLawContent.trim()) return;
    addLawItem(newLawTitle.trim(), newLawCategory, newLawContent.trim());
    setNewLawTitle('');
    setNewLawContent('');
  };

  const handleSendGlobalAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastText.trim()) return;
    sendGlobalNotification(broadcastTitle.trim(), broadcastText.trim());
    setBroadcastTitle('');
    setBroadcastText('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  const pendingReceipts = paymentReceipts.filter(r => r.status === 'PENDING');
  const processedReceipts = paymentReceipts.filter(r => r.status !== 'PENDING');

  const pendingRequests = paymentRequests ? paymentRequests.filter(r => r.status === 'pending') : [];
  const processedRequests = paymentRequests ? paymentRequests.filter(r => r.status !== 'pending') : [];

  // Compute stats metrics dynamically
  const totalUsersCount = adminUsers.length;
  const activePremiumCount = adminUsers.filter(u => u.plan !== 'STANDARD' && u.active).length;
  const pendingReceiptsCount = pendingRequests.length;

  if (!userProfile.isAdmin) {
    return (
      <div className="p-8 text-center bg-charcoal border border-errorRed/30 rounded-2xl max-w-md mx-auto my-12 space-y-4">
        <Lock className="w-12 h-12 text-errorRed mx-auto" />
        <h2 className="text-lg font-bold text-errorRed">Yetkisiz Erişim Teşebbüsü</h2>
        <p className="text-xs text-softGrey leading-relaxed">
          Bu alan siber güvenlik kalkanı (Shield Shield) ve role tabanlı erişim kontrolü (RBAC) ile korunmaktadır. Yetkiniz bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-goldDark/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-goldLight flex items-center gap-2 font-display">
              <ShieldAlert className="w-5 h-5 text-goldDark animate-pulse" />
              Yönetici Arka Ofisi & Kurumsal CMS Paneli
            </h1>
            <p className="text-xs text-softGrey max-w-xl leading-relaxed">
              Sistem lisans fiyatlandırmalarını düzenleyin, yapay zekâ model parametrelerini optimize edin, kupon ve duyuruları yönetin ve siber güvenlik günlüklerini inceleyin.
            </p>
          </div>
          <div className="bg-midnight px-4 py-2.5 rounded-xl border border-slateGrey/40 text-xs shrink-0 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-softGrey block leading-none">Yönetici Oturumu</span>
              <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">{userProfile.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Sub-Navigation Tab Panel */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 p-1 bg-charcoal border border-slateGrey/60 rounded-2xl shadow-inner select-none">
        {(['stats', 'users', 'receipts', 'coupons', 'content', 'security', 'settings'] as AdminTab[]).map((tab) => {
          let label = "Panel";
          let icon = <BarChart3 className="w-3.5 h-3.5" />;
          if (tab === 'stats') { label = "İstatistik"; icon = <BarChart3 className="w-3.5 h-3.5" />; }
          if (tab === 'users') { label = "Üyeler"; icon = <Users className="w-3.5 h-3.5" />; }
          if (tab === 'receipts') { label = `Dekontlar (${pendingReceiptsCount})`; icon = <CreditCard className="w-3.5 h-3.5" />; }
          if (tab === 'coupons') { label = "Kuponlar"; icon = <Ticket className="w-3.5 h-3.5" />; }
          if (tab === 'content') { label = "Mevzuat"; icon = <BookOpen className="w-3.5 h-3.5" />; }
          if (tab === 'security') { label = "Güvenlik"; icon = <Terminal className="w-3.5 h-3.5" />; }
          if (tab === 'settings') { label = "Ayarlar"; icon = <Settings2 className="w-3.5 h-3.5" />; }

          return (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-bold transition-all ${
                activeAdminTab === tab
                  ? 'bg-midnight border border-goldDark/35 text-goldLight shadow-inner'
                  : 'text-softGrey hover:text-ivory hover:bg-midnight/35'
              }`}
            >
              {icon}
              <span className="text-[9px] sm:text-[10px] uppercase truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* --- PANEL CONTENT PANES --- */}
      <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 min-h-[400px]">

        {/* 1. TELEMETRY & STATS PANEL */}
        {activeAdminTab === 'stats' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xs font-bold text-goldLight flex items-center gap-2 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-goldDark" />
              Platform Canlı İstatistikleri & Gelir Telemetrisi
            </h2>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-1">
                <span className="text-[9px] text-softGrey uppercase font-bold block">Toplam Lisanslı Üye</span>
                <span className="text-xl font-black text-ivory block">{totalUsersCount} Avukat</span>
                <span className="text-[9px] text-emerald-400 block">✦ Aktif Üyelikler</span>
              </div>
              <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-1">
                <span className="text-[9px] text-softGrey uppercase font-bold block">Aktif Premium Lisansı</span>
                <span className="text-xl font-black text-goldLight block">{activePremiumCount} Avukat</span>
                <span className="text-[9px] text-softGrey block">Aylık, Yıllık veya Kurumsal</span>
              </div>
              <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-1">
                <span className="text-[9px] text-softGrey uppercase font-bold block">Brüt Platform Geliri</span>
                <span className="text-xl font-black text-emerald-400 block">₺4,350.00</span>
                <span className="text-[9px] text-softGrey block">Ciro (Banka Havale/EFT)</span>
              </div>
              <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-1">
                <span className="text-[9px] text-softGrey uppercase font-bold block">Gemini Token Tüketimi</span>
                <span className="text-xl font-black text-cyan-400 block">256.4K / Gün</span>
                <span className="text-[9px] text-softGrey block">API Çağrı Analiz Sınırı</span>
              </div>
            </div>

            {/* Simulated telemetric performance chart using SVG bar charts */}
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-goldLight">Haftalık Yapay Zekâ Analiz Çağrıları</h3>
                  <p className="text-[10px] text-softGrey">Dava simülasyonu, Dilekçe ve OCR arama adetleri</p>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">Aktif Performans: Kararlı</span>
              </div>

              {/* Chart Grid */}
              <div className="pt-2">
                <div className="flex items-end justify-between h-32 gap-3.5 px-4 border-b border-slateGrey/30">
                  {[
                    { day: 'Pzt', val: 42 },
                    { day: 'Sal', val: 68 },
                    { day: 'Çar', val: 85 },
                    { day: 'Per', val: 110 },
                    { day: 'Cum', val: 95 },
                    { day: 'Cmt', val: 54 },
                    { day: 'Paz', val: 30 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="w-full bg-slateGrey/40 rounded-t-md relative overflow-hidden transition-all duration-300 group-hover:bg-goldDark/30" style={{ height: `${item.val}%` }}>
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-goldDark to-amberAccent" style={{ height: '100%' }}></div>
                      </div>
                      <span className="text-[9px] text-softGrey font-semibold">{item.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[9px] text-softGrey/80 mt-2 px-2">
                  <span>En Düşük: 30 API çağrısı</span>
                  <span>Tepe Noktası: 110 API çağrısı</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER & ATTORNEY MANAGEMENT PANEL */}
        {activeAdminTab === 'users' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-bold text-goldLight uppercase tracking-wider">Avukat, Stajyer ve Yönetici Üyelik Listesi</h2>
                <p className="text-[10px] text-softGrey">Kullanıcı yetkilerini düzenleyin ve aktif/pasif lisansları yönetin</p>
              </div>
              <span className="text-[10px] bg-goldDark/10 text-goldLight px-2.5 py-1 rounded border border-goldDark/20 font-bold">{adminUsers.length} Kayıtlı Kullanıcı</span>
            </div>

            <div className="space-y-3">
              {adminUsers.map((user) => (
                <div key={user.id} className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ivory">{user.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        user.active ? 'bg-successGreen/10 text-successGreen border border-successGreen/20' : 'bg-slateGrey/30 text-softGrey border border-slateGrey'
                      }`}>
                        {user.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <span className="text-[10px] text-softGrey block">E-Posta: {user.email} | Kayıt: {user.regDate}</span>
                  </div>

                  {/* Actions area inside row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Role dropdown Selector */}
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-softGrey block font-bold uppercase">YETKİ ROLÜ</span>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRoleAndPlan(user.id, e.target.value as any, user.plan, user.active)}
                        className="bg-charcoal border border-slateGrey text-[10px] text-ivory font-bold rounded p-1 focus:outline-none"
                      >
                        <option value="ADMIN">Yönetici (Admin)</option>
                        <option value="ATTORNEY">Avukat</option>
                        <option value="MEMBER">Üye (Stajyer/Müvekkil)</option>
                      </select>
                    </div>

                    {/* License Plan Selector */}
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-softGrey block font-bold uppercase">ABONELİK PAKETİ</span>
                      <select
                        value={user.plan}
                        onChange={(e) => updateUserRoleAndPlan(user.id, user.role, e.target.value as any, user.active)}
                        className="bg-charcoal border border-slateGrey text-[10px] text-ivory font-bold rounded p-1 focus:outline-none"
                      >
                        <option value="STANDARD">Standart Lisans</option>
                        <option value="MONTHLY">Aylık Premium</option>
                        <option value="ANNUAL">Yıllık Premium</option>
                        <option value="CORPORATE">Kurumsal Hukuk Ofisi</option>
                      </select>
                    </div>

                    {/* Toggle Active status */}
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-softGrey block font-bold uppercase">DURUM</span>
                      <button
                        onClick={() => updateUserRoleAndPlan(user.id, user.role, user.plan, !user.active)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                          user.active 
                            ? 'bg-errorRed/10 text-errorRed border-errorRed/20 hover:bg-errorRed/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {user.active ? 'Pasife Al' : 'Aktife Al'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. PAYMENT RECEIPTS & APPROVALS PANEL */}
        {activeAdminTab === 'receipts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-bold text-goldLight uppercase tracking-wider">Hale Hazırda Bekleyen Dekont Talepleri ({pendingRequests.length})</h2>
                <p className="text-[10px] text-softGrey">Banka havalesi ile premium üyelik başvurusunda bulunmuş avukatların havale belgeleri ve denetim detayları</p>
              </div>
              <span className="bg-goldDark/10 text-goldLight border border-goldDark/20 text-[8px] font-black px-2 py-0.5 rounded uppercase">Premium V3.0 Engine</span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-midnight p-8 rounded-xl border border-slateGrey/40 text-center text-xs text-softGrey italic space-y-2">
                <Clock className="w-8 h-8 text-softGrey/55 mx-auto" />
                <p>Onaylanacak bekleyen havale veya üyelik talebi bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(req => {
                  const displayPkg = req.packageId === 'starter' ? 'Aylık Standart' : req.packageId === 'popular' ? 'Yıllık Profesyonel' : 'Kurumsal Enterprise';
                  const pkgBadgeColor = req.packageId === 'starter' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : req.packageId === 'popular' ? 'bg-goldDark/15 text-goldLight border border-goldDark/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                  
                  return (
                    <div key={req.id} className="bg-midnight p-5 rounded-xl border border-slateGrey/50 space-y-4 hover:border-slateGrey transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ivory text-sm flex items-center gap-1.5">
                              <User className="w-4 h-4 text-goldDark" />
                              {req.fullName}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${pkgBadgeColor}`}>
                              {displayPkg}
                            </span>
                          </div>
                          <div className="text-[10px] text-softGrey mt-1.5 space-y-0.5">
                            <p>E-Posta: <strong className="text-ivory">{req.email}</strong> | Tel: <strong className="text-ivory">{req.phone}</strong></p>
                            <p>Gönderen IBAN: <strong className="text-ivory font-mono">{req.iban}</strong></p>
                            <p className="flex items-center gap-2">Sistem IP Adresi: <span className="font-mono bg-charcoal/50 px-1 py-0.2 rounded text-[9px]">{req.ipAddress}</span></p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-emerald-400">₺{req.amount.toFixed(2)}</span>
                          <span className="text-[9px] text-softGrey block mt-0.5">{req.createdAt}</span>
                          <span className="text-[8px] font-mono text-softGrey/70 block mt-0.5">Talep ID: {req.id}</span>
                        </div>
                      </div>

                      {/* Receipt Doc Details & Admin Comments */}
                      <div className="bg-charcoal/60 p-3 rounded-lg border border-slateGrey/40 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[10px]">
                          <span className="text-softGrey">Ekteki Dekont Kanıtı: <strong className="text-goldLight font-mono">{req.receiptUrl}</strong></span>
                          <button
                            onClick={() => window.open('#', '_blank')}
                            className="text-goldDark hover:text-goldLight font-black uppercase tracking-wider text-[9px] block w-fit shrink-0"
                          >
                            Dekontu Yeni Sekmede Göster ↗
                          </button>
                        </div>

                        {/* Admin Notes Box */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-softGrey font-bold uppercase tracking-wider block">Yönetici Değerlendirme Notu (Opsiyonel)</span>
                          <input
                            type="text"
                            placeholder="Dekont geçerli, tutar eşleşti... / Havale açıklamasında e-posta eksik..."
                            value={requestAdminNotes[req.id] || ''}
                            onChange={e => setRequestAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="w-full bg-midnight border border-slateGrey/50 px-3 py-2 rounded-lg text-[11px] text-ivory placeholder-softGrey/40 focus:outline-none focus:border-goldDark"
                          />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-1">
                          <button
                            onClick={() => {
                              if (window.confirm(`${req.fullName} isimli kullanıcının ödemesini REDDETMEK istediğinize emin misiniz?`)) {
                                rejectPaymentRequest(req.id, requestAdminNotes[req.id]);
                              }
                            }}
                            className="bg-errorRed/10 hover:bg-errorRed/20 text-errorRed font-bold px-3 py-2 rounded-lg border border-errorRed/25 flex items-center gap-1.5 transition-colors text-[10px] uppercase tracking-wider"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reddet
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`${req.fullName} isimli kullanıcının ödemesini onaylayıp Premium haklarını tanımlamak istiyor musunuz?`)) {
                                approvePaymentRequest(req.id, requestAdminNotes[req.id]);
                              }
                            }}
                            className="bg-successGreen/10 hover:bg-successGreen/20 text-successGreen font-bold px-3.5 py-2 rounded-lg border border-successGreen/25 flex items-center gap-1.5 transition-colors text-[10px] uppercase tracking-wider"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Onayla & Aktif Et
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past History */}
            <div className="border-t border-slateGrey/30 pt-6 space-y-3.5">
              <h3 className="text-xs font-bold text-goldLight uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-goldDark" />
                Arşivlenmiş İşlem Geçmişi ({processedRequests.length})
              </h3>
              
              {processedRequests.length === 0 ? (
                <div className="bg-midnight/30 p-4 rounded-lg border border-slateGrey/20 text-center text-[10px] text-softGrey italic">
                  Henüz onaylanmış veya reddedilmiş işlem bulunmuyor.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {processedRequests.map(req => {
                    const isApproved = req.status === 'approved';
                    const displayPkg = req.packageId === 'starter' ? 'Aylık Standart' : req.packageId === 'popular' ? 'Yıllık Profesyonel' : 'Kurumsal Enterprise';
                    
                    return (
                      <div key={req.id} className="bg-midnight/50 p-4 rounded-xl border border-slateGrey/30 space-y-2 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-softGrey">{req.fullName} ({req.email})</span>
                              <span className="text-[8px] bg-charcoal text-softGrey px-1.5 py-0.2 rounded border border-slateGrey/40 font-mono">{displayPkg}</span>
                            </div>
                            <span className="text-[9px] text-softGrey/80 block mt-1">
                              Tutar: <strong className="text-goldLight">₺{req.amount.toFixed(2)}</strong> | 
                              Tarih: {req.createdAt} {req.processedAt && `| İşlem: ${req.processedAt}`}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase shrink-0 ${
                            isApproved 
                              ? 'bg-successGreen/15 text-successGreen border-successGreen/20' 
                              : 'bg-errorRed/15 text-errorRed border-errorRed/20'
                          }`}>
                            {isApproved ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                          </span>
                        </div>
                        {req.adminNotes && (
                          <div className="bg-charcoal/30 px-3 py-2 rounded text-[10px] text-softGrey italic border-l border-slateGrey">
                            <span className="font-bold text-[9px] uppercase tracking-wide text-goldDark not-italic block mb-0.5">Yönetici Notu:</span>
                            {req.adminNotes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. COUPONS & CAMPAIGNS PANEL */}
        {activeAdminTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Left: Coupons generator */}
            <div className="space-y-5">
              <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide border-b border-slateGrey/30 pb-2">
                <Ticket className="w-4 h-4 text-goldDark" />
                İndirim Kuponu Oluşturma
              </h2>

              <form onSubmit={handleCreateCoupon} className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-softGrey uppercase">Kupon Kodu (Örn: AVUKAT50)</label>
                  <input
                    type="text"
                    required
                    placeholder="ALHUKUK20"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory uppercase focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">İndirim Oranı (%)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      value={newCouponDiscount}
                      onChange={e => setNewCouponDiscount(parseInt(e.target.value))}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">Son Kullanma Tarihi</label>
                    <input
                      type="date"
                      required
                      value={newCouponExpiry}
                      onChange={e => setNewCouponExpiry(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-goldDark hover:bg-goldLight text-midnight font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Kupon Oluştur
                </button>
              </form>

              {/* Active Coupons List */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-goldLight uppercase">Tanımlı İndirim Kodları ({coupons.length})</h3>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {coupons.map(c => (
                    <div key={c.id} className="bg-midnight p-3 rounded-xl border border-slateGrey/30 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-black text-goldLight">{c.code}</span>
                        <span className="text-[10px] text-softGrey block">İndirim: <strong className="text-ivory">%{c.discountPercent}</strong> | Kullanım: <strong className="text-ivory">{c.usedCount}</strong></span>
                        <span className="text-[8px] text-softGrey block">Son Gün: {c.expiryDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCoupon(c.id)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            c.active ? 'bg-successGreen/10 text-successGreen border-successGreen/25' : 'bg-slateGrey text-softGrey border-slateGrey/30'
                          }`}
                        >
                          {c.active ? 'Aktif' : 'Pasif'}
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Bu indirim kuponunu kalıcı olarak silmek istediğinize emin misiniz?")) deleteCoupon(c.id); }}
                          className="text-errorRed hover:text-red-400 p-1 bg-charcoal border border-slateGrey rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Campaigns banner list */}
            <div className="space-y-5">
              <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide border-b border-slateGrey/30 pb-2">
                <Megaphone className="w-4 h-4 text-goldDark" />
                Duyuru & Kampanya Panosu
              </h2>

              <form onSubmit={handleCreateCampaign} className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-softGrey uppercase">Kampanya Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="Genç Girişimci Avukat Kampanyası"
                    value={newCampTitle}
                    onChange={e => setNewCampTitle(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-softGrey uppercase">Açıklama / Alt Başlık</label>
                  <input
                    type="text"
                    required
                    placeholder="Baro kaydı olan avukatlarımıza özel..."
                    value={newCampDesc}
                    onChange={e => setNewCampDesc(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">İndirim Kodu</label>
                    <input
                      type="text"
                      placeholder="AVUKAT30"
                      value={newCampCode}
                      onChange={e => setNewCampCode(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory uppercase focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">Afiş Teması</label>
                    <select
                      value={newCampColor}
                      onChange={e => setNewCampColor(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none font-bold"
                    >
                      <option value="from-goldDark to-amberAccent">Altın / Premium</option>
                      <option value="from-emerald-600 to-teal-500">Yeşil / Kampanya</option>
                      <option value="from-blue-600 to-cyan-500">Mavi / Teknoloji</option>
                      <option value="from-red-600 to-orange-500">Kızıl / Fırsat</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-goldDark hover:bg-goldLight text-midnight font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Kampanya Yayınla
                </button>
              </form>

              {/* Active Campaigns List */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-goldLight uppercase">Yayınlanan Kampanyalar ({campaigns.length})</h3>
                <div className="space-y-2">
                  {campaigns.map(camp => (
                    <div key={camp.id} className="bg-midnight p-3 rounded-xl border border-slateGrey/30 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-ivory block">{camp.title}</span>
                        <span className="text-[10px] text-softGrey block mt-0.5">{camp.description}</span>
                        <span className="text-[8px] text-goldDark block font-mono mt-1 uppercase">Kod: {camp.discountCode || 'Yok'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCampaign(camp.id)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            camp.active ? 'bg-successGreen/10 text-successGreen border-successGreen/25' : 'bg-slateGrey text-softGrey border-slateGrey/30'
                          }`}
                        >
                          {camp.active ? 'Yayında' : 'Pasif'}
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Bu kampanya duyurusunu kalıcı olarak silmek istediğinize emin misiniz?")) deleteCampaign(camp.id); }}
                          className="text-errorRed hover:text-red-400 p-1 bg-charcoal border border-slateGrey rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. CONTENT MANAGEMENT (LAWS & PRECEDENTS) */}
        {activeAdminTab === 'content' && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-goldDark" />
              Mevzuat ve Yargıtay Emsal Karar Veritabanı Yönetimi
            </h2>

            {/* Input Form */}
            <form onSubmit={handleCreateLawItem} className="bg-midnight p-5 rounded-xl border border-slateGrey/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-softGrey uppercase">Yasa Adı / Mahkeme Emsal Bilgisi</label>
                  <input
                    type="text"
                    required
                    placeholder="6098 Sayılı TBK m. 344 (Kira Bedelinin Belirlenmesi)"
                    value={newLawTitle}
                    onChange={e => setNewLawTitle(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-softGrey uppercase">Kategori</label>
                  <select
                    value={newLawCategory}
                    onChange={e => setNewLawCategory(e.target.value as any)}
                    className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory font-bold focus:outline-none"
                  >
                    <option value="IS">İş Kanunu (4857)</option>
                    <option value="BORCLAR">Borçlar Kanunu (6098)</option>
                    <option value="ANAYASA">Anayasa (1982)</option>
                    <option value="EMSAL">Yargıtay Emsal Karar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-softGrey uppercase">Kanun Maddesi İçeriği / Emsal Karar Özeti</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Madde metnini veya mahkeme gerekçesini buraya yazın..."
                  value={newLawContent}
                  onChange={e => setNewLawContent(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-goldDark hover:bg-goldLight text-midnight font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Maddeleri Veritabanına Ekle
              </button>
            </form>

            {/* List and Delete Section */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-goldLight uppercase">Sistem Veritabanındaki Mevcut Kayıtlar ({lawsAndPrecedents.length})</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {lawsAndPrecedents.map(law => (
                  <div key={law.id} className="bg-midnight p-4 rounded-xl border border-slateGrey/30 space-y-2 relative">
                    <button
                      onClick={() => { if (window.confirm("Bu mevzuat/emsal karar maddesini kalıcı olarak silmek istediğinize emin misiniz?")) deleteLawItem(law.id); }}
                      className="absolute right-4 top-4 text-errorRed hover:text-red-400 p-1 bg-charcoal border border-slateGrey rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="bg-charcoal text-goldDark border border-goldDark/25 font-bold text-[9px] px-2 py-0.5 rounded">
                        {law.category === 'IS' ? 'İŞ HUKUKU' : law.category === 'BORCLAR' ? 'BORÇLAR & KİRA' : law.category === 'ANAYASA' ? 'ANAYASA' : 'EMSAL KARAR'}
                      </span>
                      <span className="text-[10px] text-softGrey">{law.dateAdded}</span>
                    </div>
                    <h4 className="text-xs font-bold text-ivory">{law.title}</h4>
                    <p className="text-[11px] text-softGrey leading-relaxed italic pr-8">&quot;{law.content}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. SECURITY LOGS & AUDITS */}
        {activeAdminTab === 'security' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-errorRed" />
                  Sistem Siber Güvenlik Günlükleri (Cyber Audit Logs)
                </h2>
                <p className="text-[10px] text-softGrey">JWT Doğrulamaları, rate-limit, XSS süzgeçleri ve SQL enjeksiyon koruması anlık izleme ekranı</p>
              </div>
              <button
                onClick={clearSecurityLogs}
                className="text-[10px] text-errorRed border border-errorRed/20 hover:bg-errorRed/10 font-bold bg-charcoal px-3 py-1.5 rounded transition-all"
              >
                Log Kayıtlarını Temizle
              </button>
            </div>

            {/* Live stream display */}
            <div className="bg-midnight/90 border border-slateGrey p-4 rounded-2xl h-[300px] overflow-y-auto font-mono text-[10px] text-softGrey space-y-2.5 scrollbar-thin">
              {securityLogs.length === 0 ? (
                <div className="text-center text-slateGrey italic pt-12">Log kaydı bulunmamaktadır.</div>
              ) : (
                securityLogs.map(log => {
                  let badgeColor = "bg-slateGrey/20 text-softGrey";
                  if (log.severity === 'WARNING') badgeColor = "bg-warningOrange/15 text-warningOrange border border-warningOrange/25";
                  if (log.severity === 'CRITICAL') badgeColor = "bg-errorRed/15 text-errorRed border border-errorRed/25 animate-pulse";
                  
                  return (
                    <div key={log.id} className="border-b border-slateGrey/20 pb-2 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-goldDark">[{log.timestamp}]</span>
                          <span className="text-cyan-400">IP: {log.ipAddress}</span>
                          <span className="bg-charcoal px-1.5 py-0.2 rounded border border-slateGrey text-ivory text-[9px] font-bold">{log.eventType}</span>
                        </div>
                        <p className="text-ivory leading-relaxed">{log.message}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${badgeColor}`}>
                        {log.severity}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Simulated test attacks triggers */}
            <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-3">
              <span className="text-[10px] font-bold text-softGrey uppercase block">GÜVENLİK SİMÜLASYON TESTLERİ</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addSecurityLog('SQL_INJECTION_SHIELD', "Hukuk veritabanı araması formunda UNION SELECT tablosu enjekte edilmeye çalışıldı, XSS/SQL süzgeci tarafından sterilize edildi.", 'CRITICAL')}
                  className="bg-charcoal hover:bg-slateGrey/20 text-errorRed border border-errorRed/20 text-[10px] font-bold px-3 py-1.5 rounded transition-all"
                >
                  Simüle Et: SQLi Saldırısı Engelleme
                </button>
                <button
                  onClick={() => addSecurityLog('XSS_PREVENT', "Kayıt form girişinde <script>alert('XSS')</script> tespit edildi, etiketler arındırıldı.", 'WARNING')}
                  className="bg-charcoal hover:bg-slateGrey/20 text-warningOrange border border-warningOrange/20 text-[10px] font-bold px-3 py-1.5 rounded transition-all"
                >
                  Simüle Et: XSS Koruması
                </button>
                <button
                  onClick={() => addSecurityLog('RATE_LIMIT', "Dava simülatörü API uç noktası istek sınırı (60/dakika) aşıldı, IP adresi 1 dakika askıya alındı.", 'CRITICAL')}
                  className="bg-charcoal hover:bg-slateGrey/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-1.5 rounded transition-all"
                >
                  Simüle Et: API Rate-Limit Aşımı
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. SYSTEM STRUCTURES & CONFIG */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Split view: Pricing & AI configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Standard CMS parameters */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-goldLight flex items-center gap-2 uppercase tracking-wide">
                  <Settings2 className="w-4 h-4 text-goldDark" />
                  Sistem Fiyatları ve Ödeme Parametreleri
                </h3>

                <form onSubmit={handleUpdateConfig} className="bg-midnight p-5 rounded-xl border border-slateGrey/50 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">Ödeme Alınacak Sistem IBAN Adresi</label>
                    <input
                      type="text"
                      required
                      value={ibanInput}
                      onChange={e => setIbanInput(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-softGrey uppercase">Aylık Üyelik</label>
                      <input
                        type="text"
                        required
                        value={monthlyPriceInput}
                        onChange={e => setMonthlyPriceInput(e.target.value)}
                        className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-softGrey uppercase">Yıllık Üyelik</label>
                      <input
                        type="text"
                        required
                        value={annualPriceInput}
                        onChange={e => setAnnualPriceInput(e.target.value)}
                        className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-softGrey uppercase">Ofis / Kurumsal</label>
                      <input
                        type="text"
                        required
                        value={corporatePriceInput}
                        onChange={e => setCorporatePriceInput(e.target.value)}
                        className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-goldDark hover:bg-goldLight text-midnight font-bold text-xs py-2 rounded-lg transition-all"
                  >
                    Fiyat Yapılandırmasını Kaydet
                  </button>

                  {configSuccess && (
                    <div className="bg-successGreen/15 text-successGreen border border-successGreen/25 text-xs text-center font-bold p-2 rounded-lg animate-fade-in">
                      Ödeme Yapılandırması Güncellendi!
                    </div>
                  )}
                </form>

                {/* Cyber System Health Triggers */}
                <div className="bg-midnight p-5 rounded-xl border border-slateGrey/50 space-y-3.5">
                  <h4 className="text-[10px] font-black text-goldLight uppercase">SİSTEM BULUT ALTYAPISI</h4>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs bg-charcoal p-2.5 rounded border border-slateGrey/40">
                      <div>
                        <span className="font-bold text-ivory block">Firebase Entegrasyonu</span>
                        <span className="text-[9px] text-softGrey mt-0.5">Bulut OAuth, Kullanıcı Veri Senkronizasyonu</span>
                      </div>
                      <button
                        onClick={handleTestFirebase}
                        disabled={isFirebaseTesting}
                        className="bg-midnight hover:bg-charcoal text-[10px] text-amberAccent border border-slateGrey hover:border-goldDark font-bold px-3 py-1.5 rounded transition-all disabled:opacity-40"
                      >
                        {isFirebaseTesting ? "Doğrulanıyor..." : "Bağlantıyı Test Et"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-charcoal p-2.5 rounded border border-slateGrey/40">
                      <div>
                        <span className="font-bold text-ivory block">Veritabanı Tam Yedekleme (Backup)</span>
                        <span className="text-[9px] text-softGrey mt-0.5">Son Yedekleme: <strong className="text-cyan-400">{databaseBackupDate}</strong></span>
                      </div>
                      <button
                        onClick={triggerDatabaseBackup}
                        className="bg-midnight hover:bg-charcoal text-[10px] text-cyan-400 border border-slateGrey hover:border-cyan-400 font-bold px-3 py-1.5 rounded transition-all"
                      >
                        Şimdi Yedekle
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-charcoal p-2.5 rounded border border-slateGrey/40">
                      <div>
                        <span className="font-bold text-ivory block">Sistem Önbelleklerini Boşalt (Cache Clean)</span>
                        <span className="text-[9px] text-softGrey mt-0.5">Dava analizi ve SEO sayfaları arabellekleri</span>
                      </div>
                      <button
                        onClick={handleClearCache}
                        disabled={isCacheClearing}
                        className="bg-midnight hover:bg-charcoal text-[10px] text-red-400 border border-slateGrey hover:border-red-400 font-bold px-3 py-1.5 rounded transition-all disabled:opacity-40"
                      >
                        {isCacheClearing ? "Temizleniyor..." : "Cache Temizle"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI configuration (Gemini parameters) */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-goldLight flex items-center gap-2 uppercase tracking-wide">
                  <Flame className="w-4 h-4 text-goldDark animate-pulse" />
                  Gemini AI Yapay Zekâ Model Parametreleri
                </h3>

                <div className="bg-midnight p-5 rounded-xl border border-slateGrey/50 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">Aktif Yapay Zeka Model Seçimi</label>
                    <select
                      value={selectedAiModel}
                      onChange={e => setSelectedAiModel(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory font-bold focus:outline-none"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Düşük Gecikme - Varsayılan)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Gelişmiş Mantık Yürütme ve Akıl)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Arşiv Model)</option>
                    </select>
                    <span className="text-[9px] text-softGrey block mt-0.5">Dava simülasyonları, dilekçeler ve OCR metin tahlillerinde bu model kullanılır.</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-softGrey">
                      <span>Model Sıcaklığı (Creativity)</span>
                      <span className="text-goldLight">{aiTemp}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={aiTemp}
                      onChange={e => setAiTemp(parseFloat(e.target.value))}
                      className="w-full accent-goldDark bg-charcoal h-1 rounded-lg"
                    />
                    <div className="flex justify-between text-[8px] text-softGrey">
                      <span>0.1 - Net & Somut Tutarlı</span>
                      <span>1.0 - Aşırı Yaratıcı / Serbest</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-softGrey">
                      <span>Yanıt Kelime Limiti (Max Tokens)</span>
                      <span className="text-goldLight">{aiMaxTokens} token</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="8000"
                      step="250"
                      value={aiMaxTokens}
                      onChange={e => setAiMaxTokens(parseInt(e.target.value))}
                      className="w-full accent-goldDark bg-charcoal h-1 rounded-lg"
                    />
                    <div className="flex justify-between text-[8px] text-softGrey">
                      <span>1,000 token</span>
                      <span>8,000 token</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveAiConfig}
                    className="w-full bg-goldDark hover:bg-goldLight text-midnight font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Settings2 className="w-4 h-4" />
                    Model Parametrelerini Kaydet
                  </button>
                </div>

                {/* Global Notification broadcast */}
                <form onSubmit={handleSendGlobalAnnouncement} className="bg-midnight p-5 rounded-xl border border-slateGrey/50 space-y-4">
                  <h4 className="text-[10px] font-black text-goldLight uppercase">SİSTEM GENEL DUYURUSU (GLOBAL NOTIFICATION)</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">Duyuru Başlığı</label>
                    <input
                      type="text"
                      required
                      placeholder="UYAP Sistemi Planlı Bakım Çalışması"
                      value={broadcastTitle}
                      onChange={e => setBroadcastTitle(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-softGrey uppercase">Mesaj Metni / İçeriği</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Bakanlık tarafından yapılacak bakım nedeniyle bu gece 02:00-04:00 saatleri arasında UYAP entegrasyonu geçici süre devre dışı kalacaktır."
                      value={broadcastText}
                      onChange={e => setBroadcastText(e.target.value)}
                      className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-warningOrange text-midnight font-bold text-xs py-2 rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-4 h-4" />
                    Anlık Genel Bildirimi Yayınla
                  </button>

                  {broadcastSuccess && (
                    <div className="bg-successGreen/15 text-successGreen border border-successGreen/25 text-xs text-center font-bold p-2 rounded animate-fade-in">
                      Sistem Genel Bildirimi ve Güvenlik Logu Yayınlandı!
                    </div>
                  )}
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
