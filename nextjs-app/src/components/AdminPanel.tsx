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
  Info
} from 'lucide-react';

export default function AdminPanel() {
  const { 
    userProfile, 
    updateSystemConfig, 
    paymentReceipts, 
    approvePaymentReceipt, 
    rejectPaymentReceipt,
    supportTickets 
  } = useApp();

  const [ibanInput, setIbanInput] = useState(userProfile.systemIban);
  const [monthlyPriceInput, setMonthlyPriceInput] = useState(userProfile.premiumPriceMonthly);
  const [annualPriceInput, setAnnualPriceInput] = useState(userProfile.premiumPriceAnnual);
  const [showToast, setShowToast] = useState(false);

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(ibanInput, monthlyPriceInput, annualPriceInput);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const pendingReceipts = paymentReceipts.filter(r => r.status === 'PENDING');
  const pastReceipts = paymentReceipts.filter(r => r.status !== 'PENDING');

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-goldDark animate-pulse" />
          Yönetici Arka Ofisi & CMS Kontrol Paneli
        </h1>
        <p className="text-xs text-softGrey">
          Sistem fiyatlarını ve IBAN adresini güncelleyin, üye banka dekontlarını denetleyip onaylayın ve destek biletlerini yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CMS Config */}
        <div className="lg:col-span-4 space-y-4">
          <form onSubmit={handleUpdateConfig} className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
            <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide">
              <Settings2 className="w-4 h-4 text-goldDark" />
              Sistem Parametreleri
            </h2>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-softGrey uppercase">Ödeme Alınacak IBAN Adresi</label>
              <input
                type="text"
                required
                value={ibanInput}
                onChange={e => setIbanInput(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey/60 px-3 py-2 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-softGrey uppercase">Aylık Premium Üyelik Bedeli</label>
              <input
                type="text"
                required
                value={monthlyPriceInput}
                onChange={e => setMonthlyPriceInput(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey/60 px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-softGrey uppercase">Yıllık Premium Üyelik Bedeli</label>
              <input
                type="text"
                required
                value={annualPriceInput}
                onChange={e => setAnnualPriceInput(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey/60 px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-goldDark text-midnight font-bold text-xs py-2.5 rounded-lg hover:bg-goldLight transition-all"
            >
              Yapılandırmayı Kaydet
            </button>
          </form>

          {showToast && (
            <div className="bg-successGreen/10 text-successGreen border border-successGreen/30 p-3 rounded-lg text-xs font-semibold text-center animate-fade-in">
              IBAN ve Fiyatlandırma Bilgileri Güncellendi!
            </div>
          )}

          {/* Quick Info */}
          <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-1 text-xs">
            <span className="font-bold text-goldLight block">Not:</span>
            <p className="text-[11px] text-softGrey leading-relaxed">
              Yöneticinin bu panelde yaptığı tüm güncellemeler, standart kullanıcıların ödeme ekranlarında anlık olarak güncellenir.
            </p>
          </div>
        </div>

        {/* Right Column: Receipts Approvals & Support */}
        <div className="lg:col-span-8 space-y-5">
          {/* Receipts queue */}
          <div className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
            <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide">
              <CreditCard className="w-4 h-4 text-amberAccent" />
              Bekleyen Banka Havale Dekontları ({pendingReceipts.length})
            </h2>

            {pendingReceipts.length === 0 ? (
              <p className="text-[11px] text-softGrey italic">Onay bekleyen yeni dekont kaydı bulunmamaktadır.</p>
            ) : (
              <div className="space-y-3">
                {pendingReceipts.map(rec => (
                  <div key={rec.id} className="bg-charcoal p-4 rounded-xl border border-slateGrey/40 space-y-3">
                    <div className="flex justify-between items-start text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-ivory flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-softGrey" />
                          {rec.senderName}
                        </span>
                        <span className="text-[10px] text-softGrey block">Email: {rec.email} | IBAN: {rec.iban}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-goldLight block">{rec.amount}</span>
                        <span className="text-[9px] text-softGrey block">{rec.date}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 bg-midnight/50 p-2.5 rounded-lg text-[10px]">
                      <span className="text-softGrey truncate">Dosya: <strong className="text-goldDark">{rec.receiptFileName}</strong></span>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => rejectPaymentReceipt(rec.id)}
                          className="bg-errorRed/10 hover:bg-errorRed/20 text-errorRed font-bold px-2.5 py-1 rounded border border-errorRed/20 flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Reddet
                        </button>
                        <button
                          onClick={() => approvePaymentReceipt(rec.id)}
                          className="bg-successGreen/10 hover:bg-successGreen/20 text-successGreen font-bold px-2.5 py-1 rounded border border-successGreen/20 flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Onayla
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Tickets queue */}
          <div className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
            <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wide">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Kullanıcı Destek Talepleri Desk
            </h2>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {supportTickets.map(tic => (
                <div key={tic.id} className="bg-charcoal p-3.5 rounded-xl border border-slateGrey/40 space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-ivory">{tic.title}</span>
                      <span className="text-[10px] text-softGrey block">Bilet Konusu: {tic.category} | Gönderen: {tic.client}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      tic.status === 'OPEN' 
                        ? 'bg-warningOrange/10 text-warningOrange border border-warningOrange/20' 
                        : 'bg-slateGrey text-softGrey border border-slateGrey/30'
                    }`}>
                      {tic.status === 'OPEN' ? 'Cevap Bekliyor' : 'Çözüldü'}
                    </span>
                  </div>
                  <p className="text-[11px] text-softGrey leading-relaxed italic bg-midnight/30 p-2 rounded border border-slateGrey/20">
                    &quot;{tic.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
