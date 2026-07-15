'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileText, 
  Loader2, 
  History, 
  Copy, 
  CheckCircle,
  HelpCircle,
  Plus,
  PenTool
} from 'lucide-react';

export default function PetitionStudio() {
  const { 
    petitionResult, 
    petitionLoading, 
    draftAiPetition, 
    sessions 
  } = useApp();

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [copied, setCopied] = useState(false);

  const petitionSessions = sessions.filter(s => s.type === 'PETITION');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;
    await draftAiPetition(title, details);
  };

  const handleSelectSession = (sessTitle: string) => {
    setTitle(sessTitle);
    setDetails("Önceki taslak yüklendi. Yeniden üretmek için 'Dilekçe Taslağını Hazırla' butonuna tıklayabilirsiniz.");
    draftAiPetition(sessTitle, "Önceki taslak yeniden yüklendi.");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(petitionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templates = [
    { title: "Kira Bedelinin Tespiti Dilekçesi", desc: "5 yılı aşkın süredir oturan kiracının güncel emsallere göre kira artış davası talebi." },
    { title: "İşçi Kıdem ve İhbar Tazminatı Dilekçesi", desc: "Haksız fesih, kıdem, ihbar ve fazla mesailerin tahsili amaçlı dava dilekçesi." },
    { title: "Tüketici Hakem Heyeti Ayıplı Mal Başvurusu", desc: "Arızalı telefonun bedel iadesi veya değişimi için tüketici başvuru dilekçesi." }
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <PenTool className="w-5 h-5 text-goldDark" />
          Yapay Zekâ Dilekçe Taslak Stüdyosu
        </h1>
        <p className="text-xs text-softGrey">
          Türk Hukuk kurallarına (HMK, CMK, İYUK) uygun, usulü tam ve resmi dilekçe taslaklarını anında oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form and Pleading Result */}
        <div className="lg:col-span-8 space-y-5">
          <form onSubmit={handleSubmit} className="bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
            <h2 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-goldDark" />
              Dilekçe Parametreleri
            </h2>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-softGrey uppercase block">Dilekçe Başlığı / Konusu</label>
              <input
                type="text"
                required
                placeholder="Örn: Kira Tespit ve Uyarlama Davası Dilekçesi..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-softGrey uppercase block">Olaylar ve Hak Talepleri</label>
              <textarea
                required
                rows={5}
                placeholder="Dilekçede bulunmasını istediğiniz somut olayları anlatın (Müvekkilin işe başlama tarihi, feshin ne zaman olduğu, talep edilen tazminatlar vb.)..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey/50 p-3 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={petitionLoading}
              className="w-full bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-bold py-3 px-6 rounded-xl hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {petitionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dilekçe Taslağı Hazırlanıyor...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4" />
                  Dilekçe Taslağını Hazırla
                </>
              )}
            </button>
          </form>

          {petitionLoading ? (
            <div className="p-12 text-center space-y-3 bg-midnight rounded-xl border border-slateGrey/40">
              <Loader2 className="w-8 h-8 animate-spin text-goldDark mx-auto" />
              <h4 className="text-xs font-bold text-goldLight">Dilekçe Kaleme Alınıyor</h4>
              <p className="text-[10px] text-softGrey max-w-xs mx-auto">
                Mahkeme hitabı, usuli formlar, yasal delil ve yasa dayanakları düzenlenip dilekçeniz tanzim ediliyor...
              </p>
            </div>
          ) : petitionResult ? (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4">
              <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-goldDark" />
                  Oluşturulan Mahkeme Dilekçesi
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
              <pre className="bg-charcoal p-4 rounded-lg text-xs text-softGrey font-mono max-h-[400px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
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
                      setTitle(tpl.title);
                      setDetails(tpl.desc);
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

        {/* History Panel */}
        <div className="lg:col-span-4 bg-midnight p-5 rounded-xl border border-slateGrey/60 space-y-4">
          <h2 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
            <History className="w-4 h-4 text-amberAccent" />
            Taslak Arşivi
          </h2>

          {petitionSessions.length === 0 ? (
            <p className="text-[11px] text-softGrey italic">Henüz bir dilekçe yazılmadı.</p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
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
  );
}
