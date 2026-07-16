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
  Loader2,
  Calendar,
  X,
  FileText,
  DollarSign,
  AlertTriangle,
  Gift,
  ArrowRight
} from 'lucide-react';

interface LocalInvoice {
  id: string;
  planName: string;
  date: string;
  amount: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER';
  status: 'PAID' | 'PENDING' | 'REJECTED';
}

export default function CustomerPayment() {
  const { 
    userProfile, 
    submitPaymentReceipt, 
    paymentReceipts,
    togglePremiumRole,
    showToast,
    submitPaymentRequest,
    paymentRequests,
    subscriptionPackages,
    userSubscriptionDetails
  } = useApp();

  // Tab State: subscription, plans (checkout), bank, invoices
  const [activeSubTab, setActiveSubTab] = useState<'subscription' | 'plans' | 'bank' | 'invoices'>(
    userProfile.isPremium ? 'subscription' : 'plans'
  );

  // General billing & promo states
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Credit Card Form States
  const [cardName, setCardName] = useState(userProfile.name);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'corporate'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Bank Form States
  const [senderName, setSenderName] = useState(userProfile.name);
  const [senderEmail, setSenderEmail] = useState(userProfile.email);
  const [senderIban, setSenderIban] = useState('');
  const [bankAmount, setBankAmount] = useState('₺199.00');
  const [receiptFile, setReceiptFile] = useState('Dekont_Ek_Dosya_1.pdf');
  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  // Local state for invoice history (mock persistence + default historical ones)
  const [localInvoices, setLocalInvoices] = useState<LocalInvoice[]>([
    { id: 'INV-2026-104', planName: 'Yıllık Profesyonel Üyelik', date: '01.03.2026', amount: '₺450.00', paymentMethod: 'CREDIT_CARD', status: 'PAID' },
    { id: 'INV-2026-089', planName: 'Aylık Standart Paket', date: '12.02.2026', amount: '₺199.00', paymentMethod: 'BANK_TRANSFER', status: 'PAID' }
  ]);

  // Invoice Modal State
  const [viewingInvoice, setViewingInvoice] = useState<LocalInvoice | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const getPriceOfPlan = (plan: 'monthly' | 'annual' | 'corporate'): number => {
    switch (plan) {
      case 'monthly': return 199;
      case 'annual': return 450;
      case 'corporate': return 1250;
    }
  };

  const getPlanTitle = (plan: 'monthly' | 'annual' | 'corporate'): string => {
    switch (plan) {
      case 'monthly': return 'Aylık Standart Paket';
      case 'annual': return 'Yıllık Profesyonel Üyelik';
      case 'corporate': return 'Kurumsal Enterprise Lisans';
    }
  };

  const calculateFinalPrice = (): string => {
    const rawPrice = getPriceOfPlan(selectedPlan);
    const discounted = rawPrice * (1 - promoDiscount / 100);
    return `₺${discounted.toFixed(2)}`;
  };

  // Auto format credit card number with spaces (1234 5678 1234 5678)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Auto format expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      setCardExpiry(val.substring(0, 2) + '/' + val.substring(2));
    } else {
      setCardExpiry(val);
    }
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const uppercaseCode = promoCode.trim().toUpperCase();
    if (uppercaseCode === 'ALHUKUK50') {
      setPromoDiscount(50);
      setPromoApplied(true);
    } else if (uppercaseCode === 'AVUKAT30') {
      setPromoDiscount(30);
      setPromoApplied(true);
    } else if (uppercaseCode === 'KAMPANYA2026') {
      setPromoDiscount(100);
      setPromoApplied(true);
    } else {
      setPromoError('Geçersiz veya süresi dolmuş kupon kodu.');
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  };

  const handleCreditCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
      setCheckoutError('Lütfen tüm kart bilgilerini eksiksiz ve doğru formatta doldurun.');
      return;
    }

    setCheckoutError('');
    setCheckoutLoading(true);

    setTimeout(() => {
      // Direct Upgrade simulation on client side & Firestore (if mounted) via the context's togglePremiumRole method!
      if (!userProfile.isPremium) {
        togglePremiumRole(); // Upgrades user to Premium!
      }

      const invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newInvoice: LocalInvoice = {
        id: invoiceId,
        planName: getPlanTitle(selectedPlan),
        date: new Date().toLocaleDateString('tr-TR'),
        amount: calculateFinalPrice(),
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID'
      };

      setLocalInvoices(prev => [newInvoice, ...prev]);
      setCheckoutSuccess(true);
      setCheckoutLoading(false);

      // Reset form fields
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setPromoCode('');
      setPromoApplied(false);
      setPromoDiscount(0);

      setTimeout(() => {
        setCheckoutSuccess(false);
        setActiveSubTab('subscription');
      }, 2500);
    }, 2000);
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(userProfile.systemIban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderIban.trim()) return;

    setBankLoading(true);
    setTimeout(() => {
      const isStarter = bankAmount.includes('199');
      const isPopular = bankAmount.includes('450');
      const amountVal = isStarter ? 199 : isPopular ? 450 : 1250;
      const packageId: SubscriptionPackageId = isStarter ? 'starter' : isPopular ? 'popular' : 'advantage';

      submitPaymentRequest(senderName, "0532 123 4567", senderEmail, senderIban, packageId, amountVal, receiptFile);
      
      const invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newInvoice: LocalInvoice = {
        id: invoiceId,
        planName: getPlanTitle(isStarter ? 'monthly' : isPopular ? 'annual' : 'corporate'),
        date: new Date().toLocaleDateString('tr-TR'),
        amount: bankAmount,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PENDING'
      };
      
      setLocalInvoices(prev => [newInvoice, ...prev]);
      setBankSubmitted(true);
      setBankLoading(false);
      setSenderIban('');
      setTimeout(() => setBankSubmitted(false), 4000);
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Aboneliğinizi iptal etmek istediğinize emin misiniz? Premium erişimlerinizi ve limitsiz soru hakkınızı hemen kaybedeceksiniz.")) {
      togglePremiumRole(); // Downgrades back to standard/free!
      setActiveSubTab('plans');
    }
  };

  const handleDownloadInvoiceSimulate = () => {
    setDownloadingInvoice(true);
    setTimeout(() => {
      setDownloadingInvoice(false);
      showToast("Faturanız PDF formatında başarıyla indirildi!", "success");
    }, 1200);
  };

  const userHistory = paymentRequests 
    ? paymentRequests.filter(r => r.email === userProfile.email)
    : paymentReceipts.filter(r => r.email === userProfile.email);

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto font-sans text-ivory relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-goldDark/5 via-midnight to-midnight -z-10 rounded-2xl" />

      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-slateGrey/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-goldDark" />
            Finansal İşlemler & Lisanslama Suite
          </h1>
          <p className="text-xs text-softGrey">
            Üyelik paketlerinizi yönetin, kredi kartı veya havale ile faturalandırın ve dekontlarınızı takip edin.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-midnight/60 p-1.5 rounded-xl border border-slateGrey/40 shrink-0">
          <button
            onClick={() => setActiveSubTab(userProfile.isPremium ? 'subscription' : 'plans')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSubTab === 'subscription' || (activeSubTab === 'plans' && !userProfile.isPremium)
                ? 'bg-goldDark text-midnight shadow-md shadow-goldDark/5'
                : 'text-softGrey hover:text-ivory'
            }`}
          >
            {userProfile.isPremium ? 'Abonelik' : 'Planlar'}
          </button>
          <button
            onClick={() => setActiveSubTab('bank')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSubTab === 'bank'
                ? 'bg-goldDark text-midnight shadow-md shadow-goldDark/5'
                : 'text-softGrey hover:text-ivory'
            }`}
          >
            Banka Havalesi
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSubTab === 'invoices'
                ? 'bg-goldDark text-midnight shadow-md shadow-goldDark/5'
                : 'text-softGrey hover:text-ivory'
            }`}
          >
            Fatura Geçmişi
          </button>
        </div>
      </div>

      {/* Sub Tabs Container */}
      {activeSubTab === 'subscription' && userProfile.isPremium && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          <div className="md:col-span-7 bg-midnight/60 border border-goldDark/20 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-goldDark/10 text-goldLight border border-goldDark/20 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md block w-fit">
                  AKTİF LİSANS
                </span>
                <h3 className="text-base font-black text-goldLight mt-2">AL HUKUK AI PREMIUM LİSANSI</h3>
                <p className="text-[11px] text-softGrey mt-1">Limitsiz yapay zekâ, akıllı dava simülasyonları ve dilekçe stüdyosu tam erişiminiz açık.</p>
              </div>
              <Sparkles className="w-8 h-8 text-amberAccent animate-pulse shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slateGrey/30 pt-4 text-[11px]">
              <div>
                <span className="text-softGrey block">Fatura Periyodu:</span>
                <span className="font-bold text-ivory flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-goldLight" />
                  Yıllık Yenilenen
                </span>
              </div>
              <div>
                <span className="text-softGrey block">Yenilenme Tarihi:</span>
                <span className="font-bold text-goldLight block mt-0.5">15.07.2027</span>
              </div>
              <div>
                <span className="text-softGrey block">Ödeme Yöntemi:</span>
                <span className="font-bold text-ivory block mt-0.5">Kredi Kartı (•••• 4921)</span>
              </div>
              <div>
                <span className="text-softGrey block">Yıllık Tutar:</span>
                <span className="font-bold text-ivory block mt-0.5">₺450.00</span>
              </div>
            </div>

            <div className="bg-charcoal/40 p-4 border border-slateGrey/30 rounded-xl space-y-2">
              <span className="text-[10px] font-black text-goldDark uppercase tracking-wider block">YASAL KORUMA SEALS</span>
              <p className="text-[10px] text-softGrey leading-relaxed">Aboneliğiniz 256-bit SSL ve BDDK onaylı ödeme altyapısıyla şifrelenmiştir. Ödeme dekontlarınız ve faturalarınız dijital olarak mühürlenir.</p>
            </div>
          </div>

          <div className="md:col-span-5 bg-midnight/35 border border-slateGrey/40 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amberAccent" />
                Abonelik İşlemleri
              </h4>
              <p className="text-[11px] text-softGrey leading-relaxed">
                Dilediğiniz zaman aboneliğinizi iptal edebilirsiniz. İptal durumunda mevcut faturalama döneminin sonuna kadar Premium haklarınızı koruyacak, ardından ücretsiz plana geçirileceksiniz.
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest outline-none"
              style={{ minHeight: '44px' }}
            >
              Aboneliği İptal Et (Downgrade)
            </button>
          </div>
        </div>
      )}

      {(activeSubTab === 'plans' || (activeSubTab === 'subscription' && !userProfile.isPremium)) && (
        <div className="space-y-6 animate-fadeIn">
          {/* Plan Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Monthly */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`bg-midnight/70 p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                selectedPlan === 'monthly' ? 'border-goldDark ring-1 ring-goldDark/30' : 'border-slateGrey/40 hover:border-slateGrey/80'
              }`}
            >
              <div>
                <span className="text-[9px] text-softGrey font-black uppercase tracking-wider block">Aylık Standart</span>
                <h4 className="text-xl font-black text-goldLight mt-1">{userProfile.premiumPriceMonthly} <span className="text-xs font-normal text-softGrey">/ Ay</span></h4>
                <p className="text-[10px] text-softGrey leading-relaxed mt-2">Küçük ölçekli hukuk ofisleri için ideal, her ay esnek ve taahhütsüz yenilenen plan.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-goldLight font-bold">
                <div className={`w-4 h-4 rounded-full border border-goldDark/50 flex items-center justify-center shrink-0 ${selectedPlan === 'monthly' ? 'bg-goldDark text-midnight' : ''}`}>
                  {selectedPlan === 'monthly' && <Check className="w-3 h-3" />}
                </div>
                <span>Bu Paketi Seç</span>
              </div>
            </div>

            {/* Annual */}
            <div 
              onClick={() => setSelectedPlan('annual')}
              className={`bg-midnight/70 p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                selectedPlan === 'annual' ? 'border-goldDark ring-2 ring-goldDark/30' : 'border-slateGrey/40 hover:border-slateGrey/80'
              }`}
            >
              <span className="absolute right-0 top-0 bg-gradient-to-r from-goldDark to-amberAccent text-midnight text-[8px] font-black tracking-widest px-3 py-1 uppercase rounded-bl-lg">
                %50 İNDİRİMLİ
              </span>
              <div>
                <span className="text-[9px] text-softGrey font-black uppercase tracking-wider block">Yıllık Profesyonel</span>
                <h4 className="text-xl font-black text-goldLight mt-1">{userProfile.premiumPriceAnnual} <span className="text-xs font-normal text-softGrey">/ Tek Sefer</span></h4>
                <p className="text-[10px] text-softGrey leading-relaxed mt-2">Yıllık tek çekim ödemeyle yüksek tasarruf sağlayın, kesintisiz tüm yapay zekâyı kullanın.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-goldLight font-bold">
                <div className={`w-4 h-4 rounded-full border border-goldDark/50 flex items-center justify-center shrink-0 ${selectedPlan === 'annual' ? 'bg-goldDark text-midnight' : ''}`}>
                  {selectedPlan === 'annual' && <Check className="w-3 h-3" />}
                </div>
                <span>Bu Paketi Seç</span>
              </div>
            </div>

            {/* Corporate */}
            <div 
              onClick={() => setSelectedPlan('corporate')}
              className={`bg-midnight/70 p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                selectedPlan === 'corporate' ? 'border-goldDark ring-1 ring-goldDark/30' : 'border-slateGrey/40 hover:border-slateGrey/80'
              }`}
            >
              <div>
                <span className="text-[9px] text-softGrey font-black uppercase tracking-wider block">Kurumsal Lisans</span>
                <h4 className="text-xl font-black text-goldLight mt-1">{userProfile.premiumPriceCorporate} <span className="text-xs font-normal text-softGrey">/ Yıllık</span></h4>
                <p className="text-[10px] text-softGrey leading-relaxed mt-2">Geniş kadrolu ortaklıklar ve barolar için ideal, çoklu eşzamanlı erişim sağlayan paket.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-goldLight font-bold">
                <div className={`w-4 h-4 rounded-full border border-goldDark/50 flex items-center justify-center shrink-0 ${selectedPlan === 'corporate' ? 'bg-goldDark text-midnight' : ''}`}>
                  {selectedPlan === 'corporate' && <Check className="w-3 h-3" />}
                </div>
                <span>Bu Paketi Seç</span>
              </div>
            </div>
          </div>

          {/* Checkout Checkout Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Credit Card Form */}
            <div className="lg:col-span-7 bg-midnight p-6 rounded-2xl border border-slateGrey/40 space-y-5">
              <div className="flex items-center justify-between border-b border-slateGrey/30 pb-3">
                <h3 className="text-xs font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-goldDark" />
                  Kredi Kartı ile Güvenli Ödeme
                </h3>
                <span className="text-[8px] text-softGrey uppercase">PCI-DSS Uyumlu Altyapı</span>
              </div>

              <form onSubmit={handleCreditCardPay} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-softGrey uppercase tracking-wider">Kart Sahibi Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs text-ivory placeholder-softGrey/50 focus:outline-none focus:border-goldDark"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-softGrey uppercase tracking-wider">Kredi Kartı Numarası</label>
                  <input
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-charcoal border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs font-mono text-ivory placeholder-softGrey/50 focus:outline-none focus:border-goldDark"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-softGrey uppercase tracking-wider">Son Kullanma Tarihi</label>
                    <input
                      type="text"
                      required
                      placeholder="AA/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-charcoal border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs text-center font-mono text-ivory placeholder-softGrey/50 focus:outline-none focus:border-goldDark"
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-softGrey uppercase tracking-wider">Güvenlik Kodu (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-charcoal border border-slateGrey/50 px-3.5 py-2.5 rounded-xl text-xs text-center font-mono text-ivory placeholder-softGrey/50 focus:outline-none focus:border-goldDark"
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {checkoutSuccess ? (
                  <div className="p-4 bg-successGreen/15 border border-successGreen/40 text-successGreen text-xs font-bold rounded-xl text-center space-y-1 animate-fadeIn">
                    <span className="block font-black uppercase text-[10px] tracking-wider">🎉 ÖDEME BAŞARILI!</span>
                    <span>Lisansınız anında aktif edilmiştir. Premium özelliklere tam erişiminiz açıldı.</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 text-midnight font-extrabold text-xs rounded-xl shadow-lg shadow-goldDark/10 transition-all uppercase tracking-wider flex justify-center items-center gap-2"
                    style={{ minHeight: '48px' }}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Güvenli Ödeme İşleniyor...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4.5 h-4.5" />
                        Güvenli Ödemeyi Tamamla ({calculateFinalPrice()})
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>

            {/* Checkout Pricing Sidebar & Promo Coupons */}
            <div className="lg:col-span-5 bg-midnight p-6 rounded-2xl border border-slateGrey/40 space-y-5">
              <h4 className="text-xs font-black text-goldLight uppercase tracking-wider">Sipariş Özeti</h4>

              <div className="space-y-2 border-b border-slateGrey/30 pb-4 text-xs text-softGrey">
                <div className="flex justify-between">
                  <span>Seçili Plan:</span>
                  <strong className="text-ivory">{getPlanTitle(selectedPlan)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%20):</span>
                  <span className="text-ivory">Dahildir</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-successGreen font-bold">
                    <span>Kupon İndirimi (%{promoDiscount}):</span>
                    <span>-₺{(getPriceOfPlan(selectedPlan) * (promoDiscount / 100)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slateGrey/30">
                  <span className="font-bold text-goldLight">Toplam Tutar:</span>
                  <strong className="text-goldLight text-base">{calculateFinalPrice()}</strong>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-softGrey uppercase tracking-wider block">Kupon / İndirim Kodu</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Örn: ALHUKUK50"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-xl text-xs text-center font-mono uppercase text-ivory placeholder-softGrey/50 focus:outline-none"
                    style={{ minHeight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-slateGrey/40 hover:bg-slateGrey/60 text-ivory text-xs font-bold px-4 rounded-xl transition-all border border-slateGrey/30 shrink-0"
                    style={{ minHeight: '40px' }}
                  >
                    Uygula
                  </button>
                </div>
                {promoApplied && (
                  <span className="text-[10px] text-successGreen font-bold block mt-1">🎉 %{promoDiscount} İndirim kodu başarıyla uygulandı!</span>
                )}
                {promoError && (
                  <span className="text-[10px] text-red-400 font-bold block mt-1">⚠️ {promoError}</span>
                )}
              </div>

              <div className="bg-charcoal/30 p-4 border border-slateGrey/30 rounded-xl space-y-2 text-[10px] text-softGrey leading-relaxed">
                <span className="font-bold text-goldLight block">ℹ️ Deneme Kuponları:</span>
                <span>Uygulayıp test etmek için aşağıdaki kodları girebilirsiniz:</span>
                <ul className="list-disc pl-4 space-y-1 mt-1 font-mono text-[9px]">
                  <li><strong className="text-goldLight">ALHUKUK50</strong> - %50 İndirim sağlar</li>
                  <li><strong className="text-goldLight">AVUKAT30</strong> - %30 İndirim sağlar</li>
                  <li><strong className="text-goldLight">KAMPANYA2026</strong> - %100 Ücretsiz deneme</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'bank' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Column: IBAN Display */}
          <div className="lg:col-span-6 bg-midnight p-6 rounded-2xl border border-slateGrey/40 space-y-5">
            <h3 className="text-xs font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-goldDark" />
              Banka Havale / EFT Ödeme Adımları
            </h3>

            <div className="space-y-4 text-xs text-softGrey leading-relaxed">
              <p>Ödemenizi internet bankacılığı aracılığıyla aşağıdaki resmi IBAN adresine gönderin. Alıcı adı olarak <strong>"AL Hukuk Teknolojileri A.Ş."</strong> yazılmalıdır.</p>
              
              <div className="bg-charcoal p-4 rounded-xl border border-slateGrey/40 space-y-2">
                <span className="text-[10px] text-softGrey uppercase block">Resmi IBAN Adresi:</span>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs font-mono font-bold text-goldLight tracking-wider break-all">{userProfile.systemIban}</span>
                  <button
                    onClick={handleCopyIban}
                    className="text-softGrey hover:text-goldLight p-2 rounded-lg bg-slateGrey/30 hover:bg-slateGrey/50 transition-all shrink-0"
                    title="IBAN Kopyala"
                    style={{ minHeight: '40px', minWidth: '40px' }}
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-successGreen" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-charcoal/30 p-4 border border-slateGrey/30 rounded-xl space-y-2 text-[10px]">
                <strong className="text-goldLight uppercase block">⚠️ ÖNEMLİ AÇIKLAMA NOTU:</strong>
                <p>Transfer yaparken açıklama kısmına mutlaka sisteme kayıtlı e-posta adresinizi (<strong className="text-ivory">{userProfile.email}</strong>) yazın. Bu, ödemenizin faturanızla eşleştirilmesini hızlandıracaktır.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Receipt Upload Form */}
          <div className="lg:col-span-6 bg-midnight p-6 rounded-2xl border border-slateGrey/40 space-y-4">
            <h3 className="text-xs font-black text-goldLight uppercase tracking-wider">Ödeme Bildirim Formu</h3>
            <p className="text-[11px] text-softGrey">EFT/Havale işlemini tamamladıktan sonra dekontu yükleyerek bize bildirin. En kısa sürede admin onayına sunulacaktır.</p>

            <form onSubmit={handleSubmitReceipt} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-softGrey uppercase block">Gönderen Adı</span>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-xl text-xs text-ivory focus:outline-none"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-softGrey uppercase block">İletişim E-postası</span>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-xl text-xs text-ivory focus:outline-none"
                    style={{ minHeight: '40px' }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-softGrey uppercase block">Paranın Gönderildiği IBAN</span>
                <input
                  type="text"
                  required
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  value={senderIban}
                  onChange={e => setSenderIban(e.target.value)}
                  className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2.5 rounded-xl text-xs font-mono text-ivory placeholder-softGrey/40 focus:outline-none"
                  style={{ minHeight: '40px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-softGrey uppercase block">Paket Seçimi / Tutar</span>
                  <select
                    value={bankAmount}
                    onChange={e => setBankAmount(e.target.value)}
                    className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-xl text-xs text-ivory focus:outline-none h-10"
                  >
                    <option value="₺199.00">Aylık Standart - ₺199.00</option>
                    <option value="₺450.00">Yıllık Profesyonel - ₺450.00</option>
                    <option value="₺1,250.00">Kurumsal Lisans - ₺1,250.00</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-softGrey uppercase block">Dekont Belgesi</span>
                  <div className="bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-xl text-[10px] text-softGrey flex items-center justify-between h-10">
                    <span className="truncate max-w-[100px]">{receiptFile}</span>
                    <Upload className="w-4 h-4 text-goldDark" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={bankLoading}
                className="w-full py-3 bg-goldDark hover:bg-goldLight text-midnight font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex justify-center items-center gap-2 mt-2"
                style={{ minHeight: '44px' }}
              >
                {bankLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Ödeme Kaydı Yapılıyor...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    Ödeme Bildirimini Kaydet
                  </>
                )}
              </button>
            </form>

            {bankSubmitted && (
              <div className="p-3 bg-successGreen/15 border border-successGreen/30 text-successGreen text-[10px] font-bold rounded-lg text-center animate-fadeIn">
                Dekont kaydınız başarıyla alındı! Yönetici onayı akabinde Premium hesabınız aktif edilecektir.
              </div>
            )}

            {/* Display user's bank history if they have submitted receipts */}
            {userHistory.length > 0 && (
              <div className="border-t border-slateGrey/30 pt-4 space-y-2">
                <span className="text-[10px] font-black text-softGrey uppercase tracking-wider block">Gönderilen Ödeme Bildirimleriniz</span>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {userHistory.map(uh => {
                    const label = uh.receiptFileName || (uh as any).receiptUrl || 'Dekont Belgesi';
                    const displayAmt = typeof uh.amount === 'number' ? `₺${uh.amount.toFixed(2)}` : uh.amount;
                    const statusLower = uh.status.toLowerCase();
                    const isPending = statusLower === 'pending';
                    const isApproved = statusLower === 'approved';
                    const isRejected = statusLower === 'rejected';

                    return (
                      <div key={uh.id} className="bg-charcoal p-2.5 rounded-lg flex justify-between items-center text-[10px] border border-slateGrey/20 hover:border-slateGrey/40 transition-all">
                        <span className="truncate max-w-[180px] text-ivory font-mono">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-goldLight font-bold">{displayAmt}</span>
                          <span className={`font-black uppercase text-[8px] px-1.5 py-0.5 rounded ${
                            isPending 
                              ? 'bg-warningOrange/10 text-warningOrange border border-warningOrange/20' 
                              : isApproved 
                                ? 'bg-successGreen/10 text-successGreen border border-successGreen/20' 
                                : 'bg-errorRed/10 text-errorRed border border-errorRed/20'
                          }`}>
                            {isPending ? 'Bekliyor' : isApproved ? 'Onaylandı' : 'Reddedildi'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'invoices' && (
        <div className="bg-midnight/40 border border-slateGrey/40 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
            <h3 className="text-xs font-black text-goldLight uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-goldDark" />
              Sistem Fatura & Makbuz Geçmişi
            </h3>
            <span className="text-[9px] text-softGrey">Mühürlü E-Fatura Kopyaları</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slateGrey/30 text-softGrey uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Fatura No</th>
                  <th className="py-2.5">Paket Açıklaması</th>
                  <th className="py-2.5">Tarih</th>
                  <th className="py-2.5">Tutar</th>
                  <th className="py-2.5">Yöntem</th>
                  <th className="py-2.5">Durum</th>
                  <th className="py-2.5 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateGrey/20">
                {localInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-charcoal/20 transition-all">
                    <td className="py-3 font-mono font-bold text-goldLight">{inv.id}</td>
                    <td className="py-3 text-ivory font-bold">{inv.planName}</td>
                    <td className="py-3 text-softGrey">{inv.date}</td>
                    <td className="py-3 text-ivory font-bold">{inv.amount}</td>
                    <td className="py-3 text-softGrey text-[10px]">
                      {inv.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Banka Havalesi'}
                    </td>
                    <td className="py-3">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        inv.status === 'PAID' 
                          ? 'bg-successGreen/15 text-successGreen border border-successGreen/30' 
                          : inv.status === 'PENDING' 
                            ? 'bg-warningOrange/15 text-warningOrange border border-warningOrange/30' 
                            : 'bg-errorRed/15 text-errorRed border border-errorRed/30'
                      }`}>
                        {inv.status === 'PAID' ? 'Ödendi' : inv.status === 'PENDING' ? 'Beklemede' : 'İade/Ret'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="text-[10px] font-bold text-goldLight hover:text-amberAccent underline bg-transparent border-none shrink-0"
                      >
                        Faturayı Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER INVOICE MODAL RECEIPT */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/85 p-4 animate-fadeIn">
          <div className="bg-charcoal border border-slateGrey rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setViewingInvoice(null)}
              className="absolute right-4 top-4 p-1.5 text-softGrey hover:text-ivory bg-midnight/50 hover:bg-slateGrey/30 rounded-full transition-all outline-none"
              style={{ minHeight: '36px', minWidth: '36px' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Looking Receipt Design */}
            <div className="space-y-4 border border-slateGrey/40 p-6 rounded-2xl bg-midnight/60 text-xs">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slateGrey/30 pb-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-black text-goldLight tracking-widest uppercase">AL HUKUK TEKNOLOJİLERİ A.Ş.</h2>
                  <p className="text-[10px] text-softGrey leading-tight">Yazıcı Sok. No:12 Kat:4 Şişli/İstanbul<br />Mersis No: 0102-3921-1200-0014<br />Şişli V.D. 492 102 3912</p>
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <span className="text-[9px] bg-goldDark/20 text-goldLight border border-goldDark/30 px-2 py-0.5 rounded font-black tracking-wider uppercase block w-fit ml-auto">E-MAKBUZ</span>
                  <span className="block font-mono font-bold text-goldLight mt-1">{viewingInvoice.id}</span>
                  <span className="block text-[10px] text-softGrey">{viewingInvoice.date}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-1 text-softGrey border-b border-slateGrey/30 pb-4">
                <span className="text-[10px] uppercase font-black tracking-wider block text-goldDark">MÜŞTERİ / AVUKAT BİLGİLERİ</span>
                <strong className="text-ivory text-xs block">{userProfile.name}</strong>
                <span className="block">{userProfile.email}</span>
                <span className="block">İstanbul Barosu Kayıtlı Üye</span>
              </div>

              {/* Invoice Lines Table */}
              <div className="space-y-2 border-b border-slateGrey/30 pb-4">
                <div className="flex justify-between font-black text-softGrey uppercase text-[9px] tracking-wider">
                  <span>Hizmet / Açıklama</span>
                  <span>Tutar</span>
                </div>
                <div className="flex justify-between text-ivory font-bold py-1">
                  <span>{viewingInvoice.planName} (1 Adet)</span>
                  <span>{viewingInvoice.amount}</span>
                </div>
                <div className="flex justify-between text-softGrey text-[10px] pt-1">
                  <span>KDV Matrahı (%20)</span>
                  <span>₺{(parseFloat(viewingInvoice.amount.replace(/[^\d.]/g, '')) * 0.83).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-softGrey text-[10px]">
                  <span>Hesaplanan KDV (%20)</span>
                  <span>₺{(parseFloat(viewingInvoice.amount.replace(/[^\d.]/g, '')) * 0.17).toFixed(2)}</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center text-sm font-black text-goldLight">
                <span>ÖDENEN GENEL TOPLAM:</span>
                <span>{viewingInvoice.amount}</span>
              </div>

              {/* Mühür seal */}
              <div className="pt-2 text-center">
                <span className="inline-block border border-goldDark/30 rounded px-3 py-1 bg-goldDark/5 font-mono text-[8px] text-goldLight tracking-widest uppercase">
                  ✓ Dijital İmzalı & Elektronik Olarak Mühürlenmiştir
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setViewingInvoice(null)}
                className="flex-1 py-3 bg-slateGrey/30 hover:bg-slateGrey/50 border border-slateGrey/40 text-ivory font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                style={{ minHeight: '44px' }}
              >
                Kapat
              </button>
              <button
                onClick={handleDownloadInvoiceSimulate}
                disabled={downloadingInvoice}
                className="flex-1 py-3 bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 text-midnight font-extrabold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider flex justify-center items-center gap-1.5"
                style={{ minHeight: '44px' }}
              >
                {downloadingInvoice ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İndiriliyor...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    PDF Faturayı İndir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
