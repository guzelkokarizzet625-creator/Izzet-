'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileText, 
  Loader2, 
  History, 
  Copy, 
  CheckCircle,
  HelpCircle,
  PenTool,
  Scale,
  AlertTriangle,
  Landmark,
  ShieldCheck,
  ListFilter,
  CheckCircle2,
  Bookmark,
  Gavel
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { id: 1, name: "Kira Bedelinin Tespiti Dilekçesi (TBK m. 344)", fields: ["Aylık Mevcut Kira Bedeli", "Kira Başlangıç Tarihi", "Talep Edilen Kira Bedeli", "Noter İhtarnamesi Tebliğ Tarihi"] },
  { id: 2, name: "İhtiyaç Nedeniyle Tahliye Dilekçesi (TBK m. 350)", fields: ["İhtiyaç Sahibinin Yakınlık Derecesi", "İhtiyacın Somut Gerekçesi", "Kira Dönemi Bitiş Tarihi", "İhtarname Çekilme Tarihi"] },
  { id: 3, name: "Yeni Malik Sıfatıyla Tahliye Dilekçesi (TBK m. 351)", fields: ["Tapu Edinim Tarihi", "Yeni Malikin İhtiyaç Nedeni", "Kiracıya İhtar Çekilen Noter Adı", "İhtarname Tebliğ Tarihi"] },
  { id: 4, name: "İki Haklı İhtar Nedeniyle Tahliye Dilekçesi (TBK m. 352)", fields: ["1. İhtarname Tebliğ Tarihi", "1. İhtara Konu Kira Ayı/Bedeli", "2. İhtarname Tebliğ Tarihi", "2. İhtara Konu Kira Ayı/Bedeli"] },
  { id: 5, name: "Kira Sözleşmesinin Feshi ve Tahliye Dilekçesi", fields: ["Sözleşme Başlangıç Tarihi", "Fesih Nedeni", "Noter İhtar Tarihi", "Ödenmeyen Kira Ayları"] },
  { id: 6, name: "İşçi Kıdem ve İhbar Tazminatı Dilekçesi", fields: ["İşe Giriş Tarihi", "İşten Çıkış Tarihi", "Aylık Net Maaş", "Fesih Şekli ve Sebebi", "Arabuluculuk Son Tutanağı Alındı mı?"] },
  { id: 7, name: "Fazla Çalışma ve Hafta Tatili Ücreti Talebi Dilekçesi", fields: ["Haftalık Çalışma Saatleri", "Fazla Çalışma Süresi (Ay/Yıl)", "Mesai Ücretlerinin Banka ile Ödenme Durumu", "Şahitlerin Tanıklık Edeceği Konu"] },
  { id: 8, name: "İşe İade Davası Dilekçesi (İş Kanunu m. 20)", fields: ["İş Sözleşmesi Fesih Tebliğ Tarihi", "Arabuluculuk Başvuru Tarihi", "Arabuluculuk Son Tutanak Tarihi", "İşyerinde Çalışan İşçi Sayısı"] },
  { id: 9, name: "Mobbing (Psikolojik Taciz) Nedeniyle Tazminat Dilekçesi", fields: ["Taciz Uygulayanın Görevi", "Mobbing Somut Olayları", "Varsa Sağlık Raporları veya Şikayet Kayıtları", "Talep Edilen Manevi Tazminat Tutarı"] },
  { id: 10, name: "İş Kazası Nedeniyle Maddi/Manevi Tazminat Dilekçesi", fields: ["Kaza Tarihi ve Saati", "Meydana Gelen Yaralanma / Maluliyet", "Kaza Hakkında SGK Raporu Durumu", "Talep Edilen Maddi/Manevi Tazminat Tutarı"] },
  { id: 11, name: "Evlilik Birliğinin Temelinden Sarsılması Nedeniyle Çekişmeli Boşanma Dilekçesi", fields: ["Evlilik Tarihi", "Varsa Çocuklerin Yaşları", "Boşanmaya Sebep Olan Olaylar / Kusurlar", "Maddi/Manevi Tazminat ve Nafaka Talepleri"] },
  { id: 12, name: "Anlaşmalı Boşanma Protokolü ve Dava Dilekçesi", fields: ["Eşlerin Velayet Konusundaki Anlaşması", "Nafaka ve Tazminat Bedelleri", "Ev Eşyaları ve Taşınmazların Paylaşımı"] },
  { id: 13, name: "Velayetin Değiştirilmesi ve Nafaka Artırım Dilekçesi", fields: ["Mevcut Velayet Sahibi", "Velayetin Değiştirilmesi Gerekçesi", "Çocuğun Eğitim ve Bakım Masrafları", "Talep Edilen Yeni Nafaka Tutarı"] },
  { id: 14, name: "Mal Rejiminin Tasfiyesi ve Katılma Alacağı Dilekçesi", fields: ["Mal Rejimi Başlangıcı", "Evlilik Sürecinde Alınan Mülklerin Bilgisi", "Katkı Oranı / Alacak Talebi Tutarı"] },
  { id: 15, name: "Soybağının Reddi ve Babalık Davası Dilekçesi", fields: ["Çocuğun Doğum Tarihi", "Soybağının Reddi Gerekçesi", "Varsa DNA Analizi veya Diğer Deliller"] },
  { id: 16, name: "Tüketici Hakem Heyeti Ayıplı Mal Bedel İadesi Başvurusu", fields: ["Malın Satın Alındığı Yer / Tarih", "Ödenen Bedel", "Malda Ortaya Çıkan Ayıp / Arıza", "Ayıbın İhbar Edildiği Tarih"] },
  { id: 17, name: "Tüketici Mahkemesi Ayıplı Hizmet Davası Dilekçesi", fields: ["Hizmet Veren Şirket Unvanı", "Hizmetin Konusu", "Hizmet Bedeli", "Ayıplı Hizmet Nedeniyle Oluşan Zararlar"] },
  { id: 18, name: "Kredi Kartı Kart Aidatı İadesi Talebi Dilekçesi", fields: ["Banka Adı", "Kredi Kartı Son 4 Hanesi", "Kesilen Kart Aidat Tutarı ve Tarihi"] },
  { id: 19, name: "Trafik Kazası Nedeniyle Maddi/Manevi Tazminat Dilekçesi", fields: ["Kaza Tarihi", "Karşı Taraf Plaka / Sigorta Bilgisi", "Kusur Oranları (Kaza Tespit Tutanağı)", "Yaralanma / Hasar Tutarı"] },
  { id: 20, name: "Kamulaştırmasız El Atma Nedeniyle Tazminat Dilekçesi", fields: ["Taşınmazın İl / İlçe / Ada / Parsel Bilgisi", "İdari El Atmanın Başlangıcı ve Şekli", "Emlak Vergisi Beyan Değeri"] },
  { id: 21, name: "Tapu İptali ve Tescil Davası Dilekçesi (Muris Muvazaası)", fields: ["Miras Bırakanın Vefat Tarihi", "Muvazaalı Devredilen Taşınmaz Bilgisi", "Miras Payı Oranları", "Devralan Karşı Tarafın Yakınlığı"] },
  { id: 22, name: "Elatmanın Önlenmesi ve Ecrimisil Dilekçesi", fields: ["Mülke Haksız Müdahale Eden Kişi", "Haksız Müdahalenin Şekli", "Talep Edilen Geriye Dönük Ecrimisil (Kira) Bedeli"] },
  { id: 23, name: "İtirazın İptali Davası Dilekçesi (İcra m. 67)", fields: ["İcra Dairesi ve Dosya No", "Takibe İtiraz Tarihi", "Alacağın Kaynağı (Fatura, Sözleşme vb.)", "Talep Edilen %20 İcra İnkar Tazminatı"] },
  { id: 24, name: "Menfi Tespit Davası Dilekçesi (İİK m. 72)", fields: ["Borçlu Olunmadığı İddia Edilen Tutar", "Takibe Konu Senet / Çek Bilgileri", "İmza veya Borç İtiraz Gerekçesi"] },
  { id: 25, name: "İmzaya ve Borca İtiraz Dilekçesi (İcra Hukuk Mahkemesi)", fields: ["İcra Dosya Numarası", "Senetteki İmzanın Sahteliği Gerekçesi", "İmzanın Ait Olmadığını Kanıtlayacak Belgeler"] },
  { id: 26, name: "Tasarrufun İptali Davası Dilekçesi (İİK m. 277)", fields: ["İcra Takibi Dosya No", "Borçlunun Mal Kaçırma Amacıyla Devrettiği Varlık", "Devralan Üçüncü Şahsın Durumu"] },
  { id: 27, name: "Tam Yargı (İdari Tazminat) Davası Dilekçesi", fields: ["İdari Eylem / Zarar Veren Olay", "Zararın Oluştuğu Tarih", "İdareye Yapılan Ön Başvuru Tarihi", "Zarar Miktarı"] },
  { id: 28, name: "İdari İşlemin İptali Davası Dilekçesi (İYUK m. 2)", fields: ["İptali İstenen İdari Karar / İşlem Tarihi", "Kararı Alan İdari Merci unvanı", "İşlemin Hukuka Aykırılık Gerekçeleri"] },
  { id: 29, name: "Vergi Cezası ve Tarhiyat İptali Dilekçesi", fields: ["Vergi İhbarname / Ceza Tarihi", "Vergi Türü ve Dönemi", "Cezanın Hukuka Aykırılık Nedenleri"] },
  { id: 30, name: "Ceza Soruşturması Şikayet Dilekçesi", fields: ["Müşteki Adı/TC Numarası", "Şüpheli Adı (Bilinmiyorsa Şüpheli)", "Suçun İşlendiği Tarih ve Yer", "Suçun Tanımı / Açıklaması"] },
  { id: 31, name: "Anayasa Mahkemesi (AYM) Bireysel Başvuru Dilekçesi", fields: ["İhlal Edilen Anayasal Hak", "Nihai Kararı Veren Mahkeme ve Esas No", "Nihai Karar Tebliğ Tarihi"] }
];

export default function PetitionStudio() {
  const { 
    petitionResult, 
    petitionLoading, 
    draftAiPetition, 
    sessions 
  } = useApp();

  const [selectedTypeIdx, setSelectedTypeIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  
  // Custom interactive parameters values state
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  
  // Custom case description details text
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Checklist for evidences
  const [evidences, setEvidences] = useState([
    { id: 'contract', label: 'Yazılı Sözleşme / Protokol / Resmi Mutabakat', checked: false },
    { id: 'notary', label: 'Noter İhtarı / Resmi Tebligat / Keşide İlamı', checked: false },
    { id: 'bank', label: 'Banka Hesap Ekstreleri / Ödeme Makbuzları', checked: false },
    { id: 'chat', label: 'WhatsApp / SMS / E-posta Delil Başlangıçları', checked: false },
    { id: 'witness', label: 'Tanık Anlatımları / Beyan Listesi', checked: false }
  ]);

  const activeDocType = DOCUMENT_TYPES[selectedTypeIdx];
  const petitionSessions = sessions.filter(s => s.type === 'PETITION');

  // Reset parameters when document type changes
  useEffect(() => {
    const initialParams: Record<string, string> = {};
    activeDocType.fields.forEach(field => {
      initialParams[field] = '';
    });
    setParamValues(initialParams);
  }, [selectedTypeIdx]);

  // Recalculate Kazanma İhtimali (Success Probability) & Risks in real-time
  const getCalculatedMetrics = () => {
    let probability = 55; // Base probability for any legal claim
    
    if (evidences[0].checked) probability += 15; // Contract is a massive boost
    if (evidences[1].checked) probability += 12; // Official Notary notification
    if (evidences[2].checked) probability += 10; // Bank slips
    if (evidences[3].checked) probability += 8;  // Written correspondence
    if (evidences[4].checked) probability += 5;  // Witness list

    // Success cap at 95% representing professional legal uncertainty
    if (probability > 95) probability = 95;

    // Risks evaluation
    const risksList = [];
    if (!evidences[0].checked) {
      risksList.push({ type: 'İspat Riski (Yüksek)', desc: 'Yazılı sözleşme olmaması ispat külfetini (HMK m. 190) ağırlaştıracaktır.' });
    }
    if (!evidences[1].checked) {
      risksList.push({ type: 'Usul Riski (Yüksek)', desc: 'Resmi ihtarname eksikliği temerrüt tarihini veya yasal süre şartlarını bozabilir.' });
    }
    if (!evidences[2].checked) {
      risksList.push({ type: 'Finansal İspat Riski', desc: 'Resmi ödeme hareketlerinin belgelenememesi iddianın zayıflamasına yol açar.' });
    }

    if (risksList.length === 0) {
      risksList.push({ type: 'Düşük Risk', desc: 'Tüm birincil deliller hazır. Karşı tarafın soyut savunmaları dışında usuli risk asgari düzeydedir.' });
    }

    return { probability, risksList };
  };

  const { probability, risksList } = getCalculatedMetrics();

  const handleToggleEvidence = (id: string) => {
    setEvidences(prev => prev.map(ev => ev.id === id ? { ...ev, checked: !ev.checked } : ev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct rich context details for the orchestrator V3
    const parameterSummary = Object.entries(paramValues)
      .map(([key, val]) => `${key}: ${val || 'Belirtilmedi'}`)
      .join('\n');

    const checkedEvidencesSummary = evidences
      .map(ev => `- [${ev.checked ? 'X' : ' '}] ${ev.label}`)
      .join('\n');

    const promptDetails = `
DİLEKÇE TÜRÜ: ${activeDocType.name}
--- INTERAKTİF PARAMETRELER ---
${parameterSummary}

--- DELİL VE BELGE LİSTESİ ---
${checkedEvidencesSummary}

--- EK AÇIKLAMALAR VE OLAYLAR ---
${additionalDetails || 'Müvekkilin beyanları doğrultusunda yasal mevzuat gereğince tanzim talep edilmektedir.'}

--- SİMÜLASYON ÖNGÖRÜLERİ ---
- Tahmini Kazanma İhtimali: %${probability}
- Tespit Edilen Riskler: ${risksList.map(r => r.type).join(', ')}
`;

    await draftAiPetition(activeDocType.name, promptDetails);
  };

  const handleSelectSession = (sessTitle: string) => {
    const idx = DOCUMENT_TYPES.findIndex(d => d.name === sessTitle);
    if (idx !== -1) {
      setSelectedTypeIdx(idx);
    }
    setAdditionalDetails("Arşivden seçilen taslak parametreleri yüklendi.");
    draftAiPetition(sessTitle, "Önceki taslak arşivden yeniden tanzim edilmektedir.");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(petitionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templates = [
    { idx: 0, title: "Kira Bedelinin Tespiti", desc: "Kira artış tespiti için yasal ihtar ve emsal rayiç tanzim dilekçesi." },
    { idx: 5, title: "İşçi Kıdem ve İhbar", desc: "İşçi haksız fesih tazminatları ve fazla mesai alacakları dava dilekçesi." },
    { idx: 10, title: "Çekişmeli Boşanma", desc: "TMK m. 166 evlilik birliğinin temelinden sarsılması çekişmeli boşanma dilekçesi." }
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro Heading */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <PenTool className="w-5 h-5 text-goldDark" />
          Yapay Zekâ Dilekçe ve Dosya Stüdyosu
        </h1>
        <p className="text-xs text-softGrey">
          31 farklı hukuki uyuşmazlığa özel interaktif formlar, delil kontrol listeleri ve anlık başarı analiz paneli
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-5">
          <form onSubmit={handleSubmit} className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-5">
            <h2 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5 border-b border-slateGrey/20 pb-2">
              <ListFilter className="w-4 h-4 text-goldDark" />
              Dava Dosyası Yapılandırma Formu
            </h2>

            {/* 31 Document Types Dropdown */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-goldLight uppercase block">Dilekçe / Dava Tipi Seçin</label>
              <select
                value={selectedTypeIdx}
                onChange={e => setSelectedTypeIdx(Number(e.target.value))}
                className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2.5 rounded-lg text-xs text-ivory focus:outline-none focus:border-goldDark font-semibold"
              >
                {DOCUMENT_TYPES.map((docType, idx) => (
                  <option key={docType.id} value={idx}>
                    {idx + 1}. {docType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Interactive Parameters (Dynamic form) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-charcoal/40 p-4 rounded-xl border border-slateGrey/30">
              <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 mb-1">
                <Bookmark className="w-3.5 h-3.5 text-goldDark" />
                <span className="text-[10px] font-black uppercase text-goldLight tracking-wider">İnteraktif Parametre Soruları</span>
              </div>
              {activeDocType.fields.map(field => (
                <div key={field} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-softGrey block truncate">{field}</label>
                  <input
                    type="text"
                    required
                    placeholder={`${field} bilgisini buraya yazın...`}
                    value={paramValues[field] || ''}
                    onChange={e => setParamValues(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-md text-xs text-ivory placeholder-softGrey/50 focus:outline-none focus:border-goldDark"
                  />
                </div>
              ))}
            </div>

            {/* Interactive Checklist section */}
            <div className="bg-charcoal/40 p-4 rounded-xl border border-slateGrey/30 space-y-3">
              <div className="flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-amberAccent" />
                <span className="text-[10px] font-black uppercase text-goldLight tracking-wider">Mevcut Delil ve Belgeler</span>
              </div>
              <p className="text-[9px] text-softGrey/80 leading-relaxed">
                Uyuşmazlığa dair elinizde olan delilleri işaretleyin. Eksik bırakılan deliller davanın başarı oranını düşürecektir.
              </p>
              <div className="space-y-2 pt-1">
                {evidences.map(ev => (
                  <label key={ev.id} className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ev.checked}
                      onChange={() => handleToggleEvidence(ev.id)}
                      className="mt-0.5 rounded border-slateGrey/60 text-goldDark focus:ring-goldLight bg-charcoal w-3.5 h-3.5"
                    />
                    <span className={`text-[11px] leading-tight ${ev.checked ? 'text-goldLight font-bold' : 'text-softGrey/90'}`}>
                      {ev.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ek Açıklamalar text box */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-softGrey uppercase block">Somut Olayların Gelişimi (Ek Açıklama)</label>
              <textarea
                rows={4}
                placeholder="Varsa fesihten veya olay gününden önce geçen somut olay örüntüsünü, ihtar çekilme sürecini ve özel isteklerinizi buraya ekleyin..."
                value={additionalDetails}
                onChange={e => setAdditionalDetails(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey/50 p-3 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={petitionLoading}
              className="w-full bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-bold py-3.5 px-6 rounded-xl hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {petitionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dava Dosyası ve Dilekçe Tanzim Ediliyor...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4" />
                  Dava Dosyasını ve Dilekçeyi Hazırla
                </>
              )}
            </button>
          </form>

          {petitionLoading ? (
            <div className="p-12 text-center space-y-3 bg-midnight rounded-xl border border-slateGrey/40">
              <Loader2 className="w-8 h-8 animate-spin text-goldDark mx-auto" />
              <h4 className="text-xs font-bold text-goldLight">Dava Dosyası Düzenleniyor</h4>
              <p className="text-[10px] text-softGrey max-w-xs mx-auto">
                Tüm interaktif parametreler, tanzim formları, HMK usul kuralları, emsal delil analizi ve kazanma oranları sentezlenerek dilekçeniz tanzim ediliyor...
              </p>
            </div>
          ) : petitionResult ? (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4">
              <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-goldDark" />
                  Oluşturulan Resmi Mahkeme Dilekçesi
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-amberAccent hover:underline flex items-center gap-1.5 bg-charcoal px-2.5 py-1 rounded border border-slateGrey/60 font-semibold"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-successGreen" />
                      Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Dilekçeyi Kopyala
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-charcoal p-4 rounded-lg text-xs text-softGrey font-mono max-h-[450px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {petitionResult}
              </pre>
            </div>
          ) : (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-3">
              <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-goldDark" />
                Hızlı Şablonlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((tpl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedTypeIdx(tpl.idx);
                    }}
                    className="p-3 bg-charcoal hover:bg-charcoal/80 rounded-lg border border-slateGrey/30 cursor-pointer text-left transition-colors space-y-1"
                  >
                    <span className="font-bold text-[11px] text-goldLight block line-clamp-1">{tpl.title}</span>
                    <span className="text-[10px] text-softGrey block leading-normal line-clamp-2">{tpl.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Analytical Panel & History */}
        <div className="lg:col-span-4 space-y-5">
          {/* Analytical Diagnostics Card */}
          <div className="bg-gradient-to-b from-midnight to-charcoal p-5 rounded-xl border border-goldDark/30 space-y-5 shadow-xl">
            <h2 className="text-xs font-black text-goldLight uppercase tracking-wider flex items-center gap-1.5 border-b border-slateGrey/20 pb-2">
              <Scale className="w-4 h-4 text-goldDark" />
              Gerçek Zamanlı Analitik Panel
            </h2>

            {/* Circular/Gauge representation for Success Rate */}
            <div className="text-center space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-charcoal"
                  />
                  <svg>
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * probability) / 100}
                      className="text-amberAccent transition-all duration-500 ease-out"
                    />
                  </svg>
                </svg>
                <span className="absolute text-lg font-black text-ivory">%{probability}</span>
              </div>
              <div>
                <strong className="text-[11px] text-goldLight block">Tahmini Kazanma İhtimali</strong>
                <p className="text-[9px] text-softGrey/80 mt-0.5">Mevcut delil ve beyan matrisine dayalı anlık olasılık simülasyonu</p>
              </div>
            </div>

            {/* Dynamic Risks List */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black uppercase text-goldLight tracking-wider block">Risk ve İspat Değerlendirmesi</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                {risksList.map((risk, idx) => {
                  const isLow = risk.type.includes('Düşük');
                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-charcoal/50 border border-slateGrey/20 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {isLow ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-successGreen shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                        )}
                        <strong className={`text-[10px] font-bold ${isLow ? 'text-successGreen' : 'text-rose-400'}`}>
                          {risk.type}
                        </strong>
                      </div>
                      <p className="text-[10px] text-softGrey/90 leading-relaxed">{risk.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
            <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
              <History className="w-4 h-4 text-amberAccent" />
              Taslak Arşivi
            </h2>

            {petitionSessions.length === 0 ? (
              <p className="text-[11px] text-softGrey italic">Henüz bir dilekçe yazılmadı.</p>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {petitionSessions.map(sess => (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess.title)}
                    className="p-2.5 bg-charcoal hover:bg-charcoal/80 border border-slateGrey/40 rounded-lg cursor-pointer transition-colors"
                  >
                    <span className="block text-[11px] text-ivory line-clamp-1 hover:text-goldLight">{sess.title}</span>
                    <span className="text-[9px] text-softGrey block mt-1">{sess.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
