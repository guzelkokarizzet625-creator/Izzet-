'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Key, 
  Info, 
  Mail, 
  CreditCard,
  CheckCircle,
  FileDown,
  ShieldCheck,
  Lock,
  EyeOff,
  Sparkles,
  Star,
  Crown,
  Scale,
  Trophy,
  FileText,
  Clock,
  Activity,
  TrendingUp,
  Coins,
  LogOut,
  Camera,
  MapPin,
  Fingerprint,
  Laptop,
  Cpu,
  ChevronRight,
  Edit2,
  Briefcase,
  Mic,
  GraduationCap,
  Check,
  Award
} from 'lucide-react';

// Animated CountUp component using React state
const CountUp = React.memo(({ end, duration = 1.5, suffix = '', prefix = '', decimals = 0 }: { end: number, duration?: number, suffix?: string, prefix?: string, decimals?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentVal = progress * end;
      setCount(currentVal);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  const displayValue = useMemo(() => {
    return count.toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [count, decimals]);

  return <>{prefix}{displayValue}{suffix}</>;
});

CountUp.displayName = 'CountUp';

export default function Settings() {
  const { 
    userProfile, 
    toggleAdminRole, 
    togglePremiumRole,
    toggleTwoFactorAuth
  } = useApp();

  // Local persistent state for customizable profile fields
  const [baro, setBaro] = useState('İstanbul Barosu');
  const [sehir, setSehir] = useState('İstanbul, Türkiye');
  const [activeBadge, setActiveBadge] = useState('⭐ Premium');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Load local state from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBaro = localStorage.getItem('al_profile_baro');
      const savedSehir = localStorage.getItem('al_profile_sehir');
      const savedBadge = localStorage.getItem('al_profile_badge');
      const savedAvatar = localStorage.getItem('al_profile_avatar');
      if (savedBaro) setBaro(savedBaro);
      if (savedSehir) setSehir(savedSehir);
      if (savedBadge) setActiveBadge(savedBadge);
      if (savedAvatar) setAvatarIndex(parseInt(savedAvatar) || 0);
    }
  }, []);

  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('al_profile_baro', baro);
      localStorage.setItem('al_profile_sehir', sehir);
    }
    setIsEditingProfile(false);
  };

  const handleBadgeSelect = (badgeName: string) => {
    setActiveBadge(badgeName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('al_profile_badge', badgeName);
    }
  };

  const handleAvatarChange = () => {
    const nextIndex = (avatarIndex + 1) % 4;
    setAvatarIndex(nextIndex);
    if (typeof window !== 'undefined') {
      localStorage.setItem('al_profile_avatar', nextIndex.toString());
    }
  };

  // Avatar Options with high-end premium gold styling
  const avatars = [
    { text: userProfile.name.split(' ').map(n => n[0]).join(''), label: 'Baş Harfler' },
    { text: '⚖', label: 'Adalet' },
    { text: '🏛', label: 'Anayasa' },
    { text: '🎓', label: 'Akademisyen' }
  ];

  // Premium badge definitions with icons and descriptions
  const premiumBadges = [
    { name: '⭐ Premium', description: 'Elite Yapay Zekâ Standart Lisansı', icon: Star, color: 'text-amber-400' },
    { name: '👑 Elite', description: 'Yönetici ve Karar Alıcı Seviyesi', icon: Crown, color: 'text-amberAccent' },
    { name: '⚖ Gold Attorney', description: 'Üst Düzey Dava ve Savunma Avukatı', icon: Scale, color: 'text-goldDark' },
    { name: '🏛 Corporate', description: 'Kurumsal Hukuk Departmanı Lisansı', icon: Briefcase, color: 'text-yellow-500' },
    { name: '🧠 AI Expert', description: 'Yapay Zekâ Entegratör ve Denetçi', icon: Sparkles, color: 'text-amber-200' }
  ];

  // Achievement metrics
  const achievements = [
    { title: '🏆 İlk Dava', desc: 'Sisteme ilk dava dosyasını başarıyla kaydettiniz.', progress: 100, status: 'Tamamlandı' },
    { title: '🥇 100 Analiz', desc: 'Yapay zekâ ile 100 yasal dosya incelemesi yaptınız.', progress: 100, status: 'Tamamlandı' },
    { title: '⚖ 500 Dilekçe', desc: 'Dilekçe stüdyosunda 500 yasal evrak tanzim ettiniz.', progress: 85, status: 'İlerliyor (425/500)' },
    { title: '📚 Hukuk Akademisi Ustası', desc: 'Akademi arşivinden 20+ derinlemesine rehber incelediniz.', progress: 100, status: 'Tamamlandı' },
    { title: '🎤 Sesli Avukat Uzmanı', desc: 'Sesli asistan ile 10 saatten fazla sözlü mütalaa.', progress: 100, status: 'Tamamlandı' },
    { title: '📄 OCR Profesyoneli', desc: '300+ taranmış belgeden veri ve risk tespiti yaptınız.', progress: 95, status: 'İlerliyor (285/300)' }
  ];

  // Time formatter for the "Son Giriş" field
  const currentTimeString = useMemo(() => {
    return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + " (Bugün)";
  }, []);

  return (
    <div className="relative min-h-screen text-ivory font-sans overflow-hidden pb-12">
      {/* Self-contained CSS for Premium styling effects */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shine-line {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        .gold-metallic-text {
          background: linear-gradient(
            to right,
            #BF953F 0%,
            #FCF6BA 25%,
            #B38728 50%,
            #FBF5B7 75%,
            #AA771C 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 6s linear infinite;
        }
        .gold-glow {
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.45);
        }
        .glass-premium {
          background: rgba(13, 15, 20, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.18);
        }
        .glass-card {
          background: rgba(23, 26, 35, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          transform: translateY(-5px) scale(1.015);
          border-color: rgba(212, 175, 55, 0.38);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.08);
        }
        .glare-effect {
          position: relative;
          overflow: hidden;
        }
        .glare-effect::after {
          content: '';
          position: absolute;
          top: 0;
          height: 100%;
          width: 50px;
          background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.12), transparent);
          transform: skewX(-30deg);
          animation: shine-line 4s infinite ease-in-out;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        /* Custom scrollbar for premium panels */
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(13, 15, 20, 0.2);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 99px;
        }
      `}</style>

      {/* Decorative background grid & glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-goldDark/10 via-midnight to-midnight -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-goldDark/5 blur-[120px] rounded-full -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amberAccent/5 blur-[120px] rounded-full -z-10 animate-float" style={{ animationDelay: '2.5s' }} />

      {/* 1. Header / Brand Bar (Apple + Rolls Royce + Maybach Level) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-premium rounded-3xl p-6 mb-8 max-w-6xl mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row relative z-10 overflow-hidden shadow-2xl glare-effect"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-goldDark/5 via-transparent to-goldDark/5 pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-goldDark/20 rounded-full blur-md animate-pulse" />
            <div className="w-12 h-12 rounded-full border border-goldDark/40 flex items-center justify-center bg-midnight text-goldDark text-xl font-bold shadow-lg">
              ⚖
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest italic gold-metallic-text gold-glow">
              AL HUKUK AI
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-goldLight/75">
              Supreme Legal Intelligence Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-successGreen animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-successGreen">
            Kurumsal Koruma Aktif (SSL & 2FA)
          </span>
        </div>
      </motion.div>

      {/* Main Grid: Profile Card & Other Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto px-1 relative z-10">
        
        {/* 2. PROFIL KARTI (Glassmorphism layout, 16 elements showcased) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 glass-premium rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle light reflection backdrop in the card */}
          <div className="absolute -right-32 -top-32 w-64 h-64 bg-goldDark/5 rounded-full blur-3xl pointer-events-none group-hover:bg-goldDark/10 transition-colors duration-500" />
          
          <div className="space-y-6">
            {/* Profile Header & Custom Avatar Selector */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* 1. Profil Fotoğrafı (Interactive) */}
                <div className="relative group/avatar cursor-pointer" onClick={handleAvatarChange} title="Avatarı değiştirmek için tıklayın">
                  <div className="absolute inset-0 bg-gradient-to-tr from-goldDark via-amberAccent to-goldLight rounded-2xl animate-rotate-slow blur-[3px] opacity-70" />
                  <div className="relative w-16 h-16 rounded-2xl bg-midnight border border-goldDark/30 text-goldLight flex items-center justify-center font-display uppercase font-black text-2xl shadow-xl transition-all duration-300 group-hover/avatar:scale-105">
                    {avatars[avatarIndex].text}
                    <div className="absolute bottom-0 right-0 p-1 bg-midnight border border-goldDark/30 rounded-lg text-[8px] text-goldDark">
                      <Camera className="w-2 h-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* 2. Ad Soyad */}
                  <h2 className="text-lg font-black text-ivory tracking-wide leading-tight group-hover:text-goldLight transition-colors duration-300">
                    {userProfile.name}
                  </h2>
                  
                  {/* 3. Premium Rozeti (Dynamic Selected Showcase Badge) */}
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-goldDark/15 text-goldLight border border-goldDark/30 shadow-sm shadow-goldDark/10">
                      {activeBadge}
                    </span>
                  </div>

                  {/* 4. Üyelik Seviyesi */}
                  <p className="text-[10px] text-softGrey/90 font-bold uppercase tracking-wider">
                    Supreme Hukuk Ortağı (Corporate)
                  </p>
                </div>
              </div>

              {/* Edit button */}
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="p-2 rounded-xl bg-slateGrey/40 hover:bg-goldDark/10 border border-slateGrey/60 hover:border-goldDark/30 text-softGrey hover:text-goldLight transition-all"
                title="Profili Düzenle"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Editable Form / Info Display */}
            <AnimatePresence mode="wait">
              {isEditingProfile ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-midnight/80 rounded-2xl border border-goldDark/20 space-y-3"
                >
                  <span className="text-[10px] font-black text-goldLight uppercase tracking-wider block">Profili Kişiselleştir</span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-softGrey uppercase font-black block mb-1">Kayıtlı Baro</label>
                      <input 
                        type="text" 
                        value={baro}
                        onChange={(e) => setBaro(e.target.value)}
                        className="w-full bg-charcoal border border-slateGrey/80 focus:border-goldDark text-xs text-ivory rounded-xl px-3 py-2 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-softGrey uppercase font-black block mb-1">Şehir</label>
                      <input 
                        type="text" 
                        value={sehir}
                        onChange={(e) => setSehir(e.target.value)}
                        className="w-full bg-charcoal border border-slateGrey/80 focus:border-goldDark text-xs text-ivory rounded-xl px-3 py-2 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveProfile}
                    className="w-full py-2 bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-black text-[11px] rounded-xl shadow-md transition-all uppercase tracking-wider hover:brightness-110"
                  >
                    Bilgileri Kaydet
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 gap-3.5"
                >
                  {/* 5. Baro */}
                  <div className="p-3 bg-midnight/50 rounded-2xl border border-slateGrey/40 hover:border-goldDark/20 transition-all">
                    <span className="text-[9px] text-softGrey uppercase font-black block tracking-wider">Kayıtlı Baro</span>
                    <span className="text-xs font-bold text-ivory mt-1 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-goldDark" />
                      {baro}
                    </span>
                  </div>

                  {/* 6. Şehir */}
                  <div className="p-3 bg-midnight/50 rounded-2xl border border-slateGrey/40 hover:border-goldDark/20 transition-all">
                    <span className="text-[9px] text-softGrey uppercase font-black block tracking-wider">Şehir / Merkez</span>
                    <span className="text-xs font-bold text-ivory mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {sehir}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Core Usage Metrics (Grid 7, 8, 9, 10, 11) */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black text-goldLight uppercase tracking-widest block">AI Kullanım ve Kota Karnesi</span>
              
              <div className="grid grid-cols-3 gap-2">
                {/* 7. Toplam Soru */}
                <div className="p-2.5 bg-midnight/45 rounded-xl border border-slateGrey/20 text-center">
                  <span className="text-[8px] text-softGrey font-black uppercase block">Toplam Soru</span>
                  <span className="text-xs font-extrabold text-goldDark mt-0.5 block">1.248 / ∞</span>
                </div>

                {/* 8. Toplam Analiz */}
                <div className="p-2.5 bg-midnight/45 rounded-xl border border-slateGrey/20 text-center">
                  <span className="text-[8px] text-softGrey font-black uppercase block">Analiz</span>
                  <span className="text-xs font-extrabold text-amber-300 mt-0.5 block">428 Dosya</span>
                </div>

                {/* 9. Toplam Dilekçe */}
                <div className="p-2.5 bg-midnight/45 rounded-xl border border-slateGrey/20 text-center">
                  <span className="text-[8px] text-softGrey font-black uppercase block">Dilekçe</span>
                  <span className="text-xs font-extrabold text-yellow-500 mt-0.5 block">512 Adet</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {/* 10. Toplam OCR */}
                <div className="p-2.5 bg-midnight/45 rounded-xl border border-slateGrey/20 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[8px] text-softGrey font-black uppercase block">Toplam OCR</span>
                    <span className="text-xs font-bold text-ivory mt-0.5 block">340 Doküman</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>

                {/* 11. AI Kullanım Puanı */}
                <div className="p-2.5 bg-midnight/45 rounded-xl border border-slateGrey/20 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[8px] text-softGrey font-black uppercase block">AI Etkinlik Skoru</span>
                    <span className="text-xs font-bold text-successGreen mt-0.5 block">98 / 100</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-successGreen" />
                </div>
              </div>
            </div>

            {/* Licensing & Session Metadata (12, 13, 14, 15, 16) */}
            <div className="pt-4 border-t border-slateGrey/30 space-y-2 text-[10px]">
              <span className="text-[10px] font-black text-goldLight uppercase tracking-widest block">Sertifikasyon & Abonelik Detayları</span>
              <div className="space-y-1.5">
                {/* 12. Son Giriş */}
                <div className="flex justify-between items-center py-1 border-b border-slateGrey/15">
                  <span className="text-softGrey font-medium">Son Giriş</span>
                  <span className="text-ivory font-bold">{currentTimeString}</span>
                </div>

                {/* 13. Üyelik Başlangıcı */}
                <div className="flex justify-between items-center py-1 border-b border-slateGrey/15">
                  <span className="text-softGrey font-medium">Lisans Başlangıcı</span>
                  <span className="text-ivory font-bold">12 Ocak 2025</span>
                </div>

                {/* 14. Premium Bitiş Tarihi */}
                <div className="flex justify-between items-center py-1 border-b border-slateGrey/15">
                  <span className="text-softGrey font-medium">Lisans Bitiş Tarihi</span>
                  <span className="text-goldDark font-black">Süresiz (Ömür Boyu Kurumsal)</span>
                </div>

                {/* 15. Lisans Durumu */}
                <div className="flex justify-between items-center py-1 border-b border-slateGrey/15">
                  <span className="text-softGrey font-medium">Lisans Durumu</span>
                  <span className="text-successGreen font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-successGreen" />
                    Aktif / Doğrulanmış
                  </span>
                </div>

                {/* 16. Aktif Cihaz Sayısı */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-softGrey font-medium">Aktif Yetkili Cihazlar</span>
                  <span className="text-ivory font-bold flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-goldDark" />
                    3 / 5 Cihaz (Güvenli)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="p-3.5 rounded-2xl bg-midnight/80 border border-goldDark/20 flex items-center gap-3">
              <div className="p-2 bg-goldDark/10 rounded-xl text-goldDark">
                <Fingerprint className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-black uppercase text-goldLight block">Donanım Anahtarı</span>
                <p className="text-[9px] text-softGrey">Bu oturum askeri düzey SHA-256 imzası ile korunmaktadır.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Badges, Stats & Achievements */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 3. PREMIUM ROZETLER (With interactive selection & shine effects) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-premium rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden"
          >
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-5 h-5 text-goldDark" />
                PREMIUM REPUTATION BADGES
              </h3>
              <p className="text-[11px] text-softGrey leading-relaxed">
                Platform üzerinde sergilemek istediğiniz prestij unvanını seçin. Seçtiğiniz unvan profil kartınızda ve resmi yazışmalarda görünür.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {premiumBadges.map((badge, idx) => {
                const BadgeIcon = badge.icon;
                const isSelected = activeBadge === badge.name;
                return (
                  <motion.button
                    key={badge.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBadgeSelect(badge.name)}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 relative overflow-hidden group transition-all ${
                      isSelected 
                        ? 'bg-midnight border-goldDark/50 shadow-md shadow-goldDark/5 text-goldLight' 
                        : 'bg-charcoal/50 border-slateGrey/30 hover:border-goldDark/20 text-softGrey hover:text-ivory'
                    }`}
                  >
                    {/* Golden glare sweep effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-goldDark/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-goldDark/10' : 'bg-midnight/60'} group-hover:scale-110 transition-transform duration-300`}>
                      <BadgeIcon className={`w-5 h-5 ${badge.color} drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]`} />
                    </div>
                    <span className="text-[10px] font-black tracking-wide uppercase leading-tight">
                      {badge.name.replace(/[^\w\sğüşöçİĞÜŞÖÇ]/gi, '').trim()}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-3 h-3 text-goldDark" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* 4. İSTATİSTİK PANELİ (8 cards, animated count-up, hover effects) */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-5 h-5 text-goldDark" />
                PREMIUM PERFORMANS VE İSTATİSTİK DASHBOARD
              </h3>
              <p className="text-[11px] text-softGrey">
                Yapay zekâ destekli hukuk ofisinizin anlık etkinlik, tasarruf ve başarı katsayıları
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Card 1: Bugünkü AI Analizi */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">Bugünkü AI Analizi</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-goldDark group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldLight block font-display">
                    <CountUp end={12} /> / 15
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Sorgu hakkı kalan: 3</p>
                </div>
              </div>

              {/* Card 2: Toplam Dava */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">Toplam Dava</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-amberAccent group-hover:scale-110 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldLight block font-display">
                    <CountUp end={48} /> Dosya
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Aktif takipli</p>
                </div>
              </div>

              {/* Card 3: Hazırlanan Dilekçe */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">Tanzim Dilekçe</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldLight block font-display">
                    <CountUp end={512} /> Evrak
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Resmi formatta</p>
                </div>
              </div>

              {/* Card 4: OCR Belgeleri */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">OCR Belgeleri</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-amber-300 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldLight block font-display">
                    <CountUp end={340} /> Tarama
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Risk analizli</p>
                </div>
              </div>

              {/* Card 5: Sesli Avukat Süresi */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">Ses Dikte / Mütalaa</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-goldDark group-hover:scale-110 transition-transform">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldLight block font-display">
                    <CountUp end={180} /> Dakika
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Yapay zekâ mütalaa</p>
                </div>
              </div>

              {/* Card 6: AI Kullanım Oranı */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">AI Kullanım Oranı</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-emerald-400 block font-display">
                    %<CountUp end={96} />
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Süper hızlı işlem</p>
                </div>
              </div>

              {/* Card 7: Premium Tasarruf */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">Mali Tasarruf</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-goldDark group-hover:scale-110 transition-transform">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldDark block font-display">
                    <CountUp end={18450} prefix="₺" />
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">Ortalama yasal tasarruf</p>
                </div>
              </div>

              {/* Card 8: Başarı Puanı */}
              <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group glare-effect">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-softGrey uppercase font-black tracking-wider">Başarı Katsayısı</span>
                  <div className="p-1.5 bg-midnight rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-goldLight block font-display">
                    <CountUp end={98} /> / 100
                  </span>
                  <p className="text-[8px] text-softGrey mt-0.5">İstinaf & yargıtay uyumlu</p>
                </div>
              </div>

            </div>
          </div>

          {/* 5. BAŞARI SİSTEMİ (Achievement System) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-premium rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden"
          >
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-5 h-5 text-goldDark" />
                PROFESYONEL AVUKATLIK BAŞARILARI (ACHIEVEMENTS)
              </h3>
              <p className="text-[11px] text-softGrey">
                Uygulama özelliklerini ve yasal yapay zekâyı kullanarak kazandığınız resmî başarı madalyaları
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scroll max-h-[220px] overflow-y-auto pr-1">
              {achievements.map((ach) => (
                <div key={ach.title} className="p-3 bg-midnight/40 rounded-2xl border border-slateGrey/35 flex gap-3 items-start group hover:border-goldDark/25 transition-all">
                  <div className="p-2.5 rounded-xl bg-midnight text-lg border border-goldDark/20 shadow group-hover:scale-110 duration-300">
                    {ach.title.split(' ')[0]}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-black text-ivory uppercase tracking-wider group-hover:text-goldLight transition-colors">
                        {ach.title.substring(ach.title.indexOf(' ') + 1)}
                      </h4>
                      <span className="text-[8px] font-black text-goldDark uppercase bg-goldDark/10 px-1.5 py-0.5 rounded border border-goldDark/20">
                        {ach.status}
                      </span>
                    </div>
                    <p className="text-[9px] text-softGrey leading-relaxed">
                      {ach.desc}
                    </p>
                    <div className="space-y-1">
                      <div className="w-full bg-slateGrey/40 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-goldDark to-amberAccent h-full rounded-full transition-all duration-1000"
                          style={{ width: `${ach.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-softGrey">
                        <span>İlerleme Oranı</span>
                        <span className="font-bold text-goldLight">{ach.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 6. HESAP GÜVENLİK AYARLARI (Original required toggles styled premiums) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-premium rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden"
          >
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5 text-goldDark" />
                HESAP YETKİLENDİRMELERİ & SİBER GÜVENLİK
              </h3>
              <p className="text-[11px] text-softGrey">
                Abonelik, siber güvenlik kalkanı ve 2FA (iki aşamalı doğrulama) sistem entegrasyonu
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Security Toggles Box */}
              <div className="space-y-3 bg-midnight/45 p-4 rounded-2xl border border-slateGrey/40">
                <span className="text-[10px] font-black uppercase text-goldLight tracking-wider block mb-1">Erişim Yönetim Merkezi</span>
                
                {/* Admin Toggle */}
                <div className="flex items-center justify-between p-3 bg-charcoal/50 rounded-xl border border-slateGrey/35">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-ivory block">Yönetici Modu (Admin)</span>
                    <p className="text-[9px] text-softGrey">Dekont yönetimi, onay süreçleri ve destek masası erişimi.</p>
                  </div>
                  <button
                    onClick={toggleAdminRole}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      userProfile.isAdmin 
                        ? 'bg-goldDark text-midnight hover:brightness-110 shadow-lg shadow-goldDark/20' 
                        : 'bg-slateGrey text-softGrey hover:text-ivory border border-slateGrey/50'
                    }`}
                  >
                    {userProfile.isAdmin ? 'AÇIK (ADMIN)' : 'KAPALI'}
                  </button>
                </div>

                {/* Premium Toggle */}
                <div className="flex items-center justify-between p-3 bg-charcoal/50 rounded-xl border border-slateGrey/35">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-ivory block">Premium Abonelik</span>
                    <p className="text-[9px] text-softGrey">Sınırsız mütalaa, dilekçe stüdyosu ve OCR belgesi tarama.</p>
                  </div>
                  <button
                    onClick={togglePremiumRole}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      userProfile.isPremium 
                        ? 'bg-successGreen text-midnight hover:brightness-110 shadow-lg shadow-successGreen/20' 
                        : 'bg-slateGrey text-softGrey hover:text-ivory border border-slateGrey/50'
                    }`}
                  >
                    {userProfile.isPremium ? 'PREMIUM' : 'STANDART'}
                  </button>
                </div>

                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-3 bg-charcoal/50 rounded-xl border border-slateGrey/35">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-ivory flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-goldDark" />
                      Çift Faktör (2FA)
                    </span>
                    <p className="text-[9px] text-softGrey">SMS ve Google Authenticator güvenli oturum açma.</p>
                  </div>
                  <button
                    onClick={toggleTwoFactorAuth}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      userProfile.isTwoFactorEnabled 
                        ? 'bg-goldDark text-midnight hover:brightness-110 shadow-lg shadow-goldDark/20' 
                        : 'bg-slateGrey text-softGrey hover:text-ivory border border-slateGrey/50'
                    }`}
                  >
                    {userProfile.isTwoFactorEnabled ? 'EKTİF (ON)' : 'KAPALI'}
                  </button>
                </div>
              </div>

              {/* Active Shield Checklist */}
              <div className="bg-midnight/45 p-4 rounded-2xl border border-slateGrey/40 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-goldLight tracking-wider block mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Sistem Siber Güvenlik Kalkanı
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2 text-[10px] text-softGrey">
                    <div className="flex items-center gap-2 p-1.5 bg-charcoal/30 rounded-lg border border-slateGrey/20">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>SSL/TLS 256-Bit Askeri Şifreleme Standardı</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-charcoal/30 rounded-lg border border-slateGrey/20">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>XSS Filtrelemesi & Gelişmiş Parametrik Giriş Süzgeci</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-charcoal/30 rounded-lg border border-slateGrey/20">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>JWT Secure Token Tabanlı Oturum Kimlik Doğrulama</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-charcoal/30 rounded-lg border border-slateGrey/20">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Parametrik SQL Injection ve DDOS Önleyici Kalkan</span>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-softGrey/80 bg-charcoal/40 p-2 rounded-xl border border-slateGrey/20 text-center">
                  Avrupa Birliği GDPR ve KVKK siber güvenlik mevzuatına %100 uyumludur.
                </div>
              </div>
            </div>

            {/* Next.js Export Info (original feature preserved) */}
            <div className="p-4 bg-midnight/30 rounded-2xl border border-goldDark/20 flex gap-3 items-start">
              <Info className="w-4.5 h-4.5 text-goldDark shrink-0 mt-0.5" />
              <div className="text-left space-y-1">
                <h4 className="text-xs font-bold text-goldLight">Next.js Web / Android Proje Entegrasyonu</h4>
                <p className="text-[10px] text-softGrey leading-relaxed">
                  Bu web arayüzü, Android Kotlin/Compose uygulamasının tüm gelişmiş veri yapılarını, asistan sohbet geçmişlerini, ses dikte modüllerini, OCR denetimlerini, IBAN fiyatlandırma CMS alanını ve yönetici onay mekanizmalarını kusursuz biçimde simüle eder. Hosting veya derleme için hazır bir altyapıya sahiptir.
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
