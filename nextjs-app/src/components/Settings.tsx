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
  FileDown
} from 'lucide-react';

export default function Settings() {
  const { 
    userProfile, 
    toggleAdminRole, 
    togglePremiumRole 
  } = useApp();

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <User className="w-5 h-5 text-goldDark" />
          Kullanıcı Profili ve Sistem Ayarları
        </h1>
        <p className="text-xs text-softGrey">
          Lisans durumunuzu, güvenlik izinlerinizi ve yönetici paneli erişim ayarlarınızı yönetin
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
            <span className={`text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full ${
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
              Sanal Hesap & İzin Yetkilendirmeleri
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
                    ? 'bg-goldDark text-midnight' 
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
                    ? 'bg-successGreen text-midnight' 
                    : 'bg-slateGrey text-softGrey hover:text-ivory'
                }`}
              >
                {userProfile.isPremium ? 'Aktif' : 'Pasif'}
              </button>
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
