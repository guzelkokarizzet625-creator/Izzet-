'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
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
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const { 
    userProfile, 
    toggleAdminRole, 
    togglePremiumRole,
    toggleTwoFactorAuth
  } = useApp();

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <User className="w-5 h-5 text-goldDark" />
          Kullanıcı Profili ve Siber Güvenlik Ayarları
        </h1>
        <p className="text-xs text-softGrey">
          Lisans durumunuzu, iki aşamalı doğrulama (2FA) izinlerinizi ve siber güvenlik sertifikasyonlarını yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="sm:col-span-4 bg-midnight p-5 rounded-2xl border border-slateGrey/50 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-goldDark/20 text-goldLight flex items-center justify-center mx-auto border-2 border-goldDark/40 font-bold text-lg font-display uppercase">
            {userProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-xs font-bold text-ivory">{userProfile.name}</h3>
            <span className="text-[10px] text-softGrey flex items-center justify-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {userProfile.email}
            </span>
          </div>

          <div className="pt-3 border-t border-slateGrey/30">
            <span className={`text-[9px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
              userProfile.isPremium 
                ? 'bg-successGreen/10 text-successGreen border border-successGreen/25' 
                : 'bg-warningOrange/10 text-warningOrange border border-warningOrange/25'
            }`}>
              {userProfile.isPremium ? 'Premium Lisans' : 'Standart Lisans'}
            </span>
          </div>
        </div>

        {/* Configurations */}
        <div className="sm:col-span-8 space-y-4">
          <div className="bg-midnight p-5 rounded-2xl border border-slateGrey/50 space-y-4">
            <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide">
              <Shield className="w-4 h-4 text-goldDark" />
              Hesap & Güvenlik Yetkilendirmeleri
            </h3>

            {/* Admin Toggle */}
            <div className="flex items-center justify-between p-3 bg-charcoal rounded-xl border border-slateGrey/35">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ivory block">Sistem Yöneticisi Rolü (Admin)</span>
                <p className="text-[10px] text-softGrey">Dekont onaylama, kullanıcı listesi ve destek masasına erişim açar.</p>
              </div>
              <button
                onClick={toggleAdminRole}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  userProfile.isAdmin 
                    ? 'bg-goldDark text-midnight font-black' 
                    : 'bg-slateGrey text-softGrey hover:text-ivory'
                }`}
              >
                {userProfile.isAdmin ? 'Açık' : 'Kapalı'}
              </button>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center justify-between p-3 bg-charcoal rounded-xl border border-slateGrey/35">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ivory block">Premium Abonelik Statüsü</span>
                <p className="text-[10px] text-softGrey">Limitsiz yapay zekâ analizleri, sesli asistan ve OCR taraması açar.</p>
              </div>
              <button
                onClick={togglePremiumRole}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  userProfile.isPremium 
                    ? 'bg-successGreen text-midnight font-black' 
                    : 'bg-slateGrey text-softGrey hover:text-ivory'
                }`}
              >
                {userProfile.isPremium ? 'Aktif' : 'Pasif'}
              </button>
            </div>

            {/* 2FA Toggle (Two-Factor Auth) */}
            <div className="flex items-center justify-between p-3 bg-charcoal rounded-xl border border-slateGrey/35">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ivory flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-goldDark" />
                  İki Aşamalı Doğrulama (2FA)
                </span>
                <p className="text-[10px] text-softGrey">Her girişte SMS veya Authenticator şifresi talep edilmesini sağlar.</p>
              </div>
              <button
                onClick={toggleTwoFactorAuth}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  userProfile.isTwoFactorEnabled 
                    ? 'bg-goldDark text-midnight font-black shadow' 
                    : 'bg-slateGrey text-softGrey hover:text-ivory'
                }`}
              >
                {userProfile.isTwoFactorEnabled ? 'EKTİF (ON)' : 'KAPALI (OFF)'}
              </button>
            </div>
          </div>

          {/* Cybersecurity Certificate Checklist */}
          <div className="bg-midnight p-5 rounded-2xl border border-slateGrey/50 space-y-3">
            <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sistem Siber Güvenlik Kalkanı (Active Shield)
            </h3>
            
            <div className="grid grid-cols-2 gap-3.5 text-[11px] text-softGrey">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>SSL/TLS 256-bit Şifreleme</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>XSS Filtresi & Giriş Süzgeci</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>JWT Token Doğrulaması</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>SQL Enjeksiyon Kalkanı</span>
              </div>
            </div>
          </div>

          {/* Export Code info card */}
          <div className="bg-midnight/65 p-4 rounded-xl border border-goldDark/20 space-y-2">
            <h4 className="text-xs font-bold text-goldLight flex items-center gap-1.5">
              <Info className="w-4 h-4 text-goldDark" />
              Next.js Proje Dışa Aktarım Bilgisi
            </h4>
            <p className="text-[10px] text-softGrey leading-relaxed">
              Bu Next.js web uygulaması, Android Kotlin/Compose projesinin tüm veri yapılarını, asistan chatlerini, ses dikte modüllerini, OCR denetimlerini, IBAN fiyatlandırma CMS alanını ve admin panellerini birebir kapsayacak şekilde tanzim edilmiştir. 
              Geliştirici veya hosting dağıtımı için ZIP arşivi indirilmeye hazırdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
