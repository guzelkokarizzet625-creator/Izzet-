'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CreditCard, 
  Copy, 
  CheckCircle, 
  Sparkles, 
  Upload, 
  ShieldCheck, 
  Check, 
  Info,
  Loader2
} from 'lucide-react';

export default function CustomerPayment() {
  const { 
    userProfile, 
    submitPaymentReceipt, 
    paymentReceipts 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState(userProfile.name);
  const [senderEmail, setSenderEmail] = useState(userProfile.email);
  const [senderIban, setSenderIban] = useState('');
  const [amount, setAmount] = useState('₺199.00');
  const [receiptFile, setReceiptFile] = useState('Dekont_Eklentisi_1.pdf');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyIban = () => {
    navigator.clipboard.writeText(userProfile.systemIban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderIban.trim()) return;

    setLoading(true);
    setTimeout(() => {
      submitPaymentReceipt(senderName, senderEmail, senderIban, amount, receiptFile);
      setSubmitted(true);
      setLoading(false);
      setSenderIban('');
      setTimeout(() => setSubmitted(false), 4000);
    }, 1000);
  };

  const userHistory = paymentReceipts.filter(r => r.email === userProfile.email);

  const premiumFeatures = [
    "Sınırsız Akıllı Dava Simülasyonu",
    "Sözleşme Risk Analizleri (Sınır Yok)",
    "Hukuki Yapay Zekâ Detaylı Arama",
    "Sesli Dikte Asistanlığı ve Deşifre",
    "Dilekçe Hazırlama Stüdyosu",
    "7/24 Akademik ve Mevzuat Eğitimi"
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-goldDark" />
          Premium Hukuk Lisansı & Ödeme Sayfası
        </h1>
        <p className="text-xs text-softGrey">
          Tüm yapay zekâ analizleri, dava simülasyonları ve OCR tarama limitlerinizi tamamen kaldırın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Premium features and Pricing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-midnight p-6 rounded-2xl border border-goldDark/20 space-y-4">
            <h2 className="text-base font-bold text-goldLight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-goldDark animate-pulse" />
              Neden AL Hukuk AI Premium?
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {premiumFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-softGrey">
                  <span className="bg-goldDark/10 p-1 rounded text-goldLight shrink-0">
                    <Check className="w-3.5 h-3.5 text-goldDark" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Price Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-softGrey uppercase font-bold tracking-wider">Aylık Paket</span>
                <span className="text-2xl font-black text-goldLight block mt-1">{userProfile.premiumPriceMonthly}</span>
              </div>
              <p className="text-[10px] text-softGrey">Küçük ve orta ölçekli hukuk ofisleri için ideal, her ay yenilenen esnek üyelik planı.</p>
              <button 
                onClick={() => setAmount(userProfile.premiumPriceMonthly)}
                className={`w-full py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  amount === userProfile.premiumPriceMonthly 
                    ? 'bg-goldDark text-midnight border-goldDark' 
                    : 'bg-charcoal text-softGrey border-slateGrey'
                }`}
              >
                Seç
              </button>
            </div>

            <div className="bg-midnight p-5 rounded-xl border border-goldDark/25 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <span className="absolute right-0 top-0 bg-goldDark text-midnight text-[8px] font-black tracking-wider px-3 py-1 uppercase rounded-bl-lg">
                AVANTAJLI
              </span>
              <div>
                <span className="text-[10px] text-softGrey uppercase font-bold tracking-wider">Yıllık Profesyonel</span>
                <span className="text-2xl font-black text-goldLight block mt-1">{userProfile.premiumPriceAnnual}</span>
              </div>
              <p className="text-[10px] text-softGrey">Yıllık tek seferlik ödemeyle %50 tasarruf sağlayın, limitsiz yasal asistanı kesintisiz kullanın.</p>
              <button 
                onClick={() => setAmount(userProfile.premiumPriceAnnual)}
                className={`w-full py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  amount === userProfile.premiumPriceAnnual 
                    ? 'bg-goldDark text-midnight border-goldDark' 
                    : 'bg-charcoal text-softGrey border-slateGrey'
                }`}
              >
                Seç
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: IBAN & Receipt upload form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
            <h2 className="text-xs font-bold text-goldLight uppercase tracking-wider">💳 Banka Havale / EFT Bilgileri</h2>

            <div className="bg-charcoal p-3.5 rounded-lg border border-slateGrey/30 space-y-1">
              <span className="text-[10px] text-softGrey block">Resmi Ödeme Alıcısı IBAN:</span>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-mono font-bold text-goldLight break-all">{userProfile.systemIban}</span>
                <button
                  onClick={handleCopyIban}
                  className="text-softGrey hover:text-goldLight p-1 rounded hover:bg-slateGrey/50 transition-colors shrink-0"
                  title="IBAN Kopyala"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-successGreen" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-slateGrey/30 pt-4">
              <form onSubmit={handleSubmitReceipt} className="space-y-3">
                <span className="text-[10px] font-bold text-goldLight uppercase tracking-wider block">✍️ Ödeme Bildirim Formu</span>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="bg-charcoal border border-slateGrey px-3 py-1.5 rounded text-[11px] text-ivory placeholder-softGrey focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Gönderen IBAN Adresi"
                    value={senderIban}
                    onChange={e => setSenderIban(e.target.value)}
                    className="bg-charcoal border border-slateGrey px-3 py-1.5 rounded text-[11px] text-ivory placeholder-softGrey focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-charcoal border border-slateGrey px-2.5 py-1.5 rounded text-[11px] text-softGrey">
                    Tutar: <strong className="text-goldLight">{amount}</strong>
                  </div>
                  <div className="bg-charcoal border border-slateGrey px-2.5 py-1.5 rounded text-[10px] text-softGrey flex items-center justify-between">
                    <span className="truncate">{receiptFile}</span>
                    <Upload className="w-3.5 h-3.5 text-goldDark" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-goldDark text-midnight font-bold text-xs py-2 rounded-lg hover:bg-goldLight transition-all flex justify-center items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Ödeme Dekontunu Gönder
                    </>
                  )}
                </button>
              </form>

              {submitted && (
                <div className="bg-successGreen/10 text-successGreen border border-successGreen/30 p-2.5 rounded-lg text-[10px] font-bold text-center mt-3 animate-fade-in">
                  Dekont başarıyla gönderildi! Yönetici onayı sonrası Premium lisansınız aktif edilecektir.
                </div>
              )}
            </div>
          </div>

          {/* User's past receipts history */}
          {userHistory.length > 0 && (
            <div className="bg-midnight p-4 rounded-xl border border-slateGrey/40 space-y-2">
              <span className="text-[10px] font-bold text-softGrey uppercase tracking-wider block">📜 Ödeme Talepleriniz</span>
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                {userHistory.map(uh => (
                  <div key={uh.id} className="bg-charcoal p-2 rounded flex justify-between items-center text-[10px]">
                    <span className="truncate max-w-[150px] text-ivory">{uh.receiptFileName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-goldLight">{uh.amount}</span>
                      <span className={`font-bold uppercase ${
                        uh.status === 'PENDING' 
                          ? 'text-warningOrange' 
                          : uh.status === 'APPROVED' 
                            ? 'text-successGreen' 
                            : 'text-errorRed'
                      }`}>
                        {uh.status === 'PENDING' ? 'Bekliyor' : uh.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
