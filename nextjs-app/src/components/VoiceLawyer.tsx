'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Loader2, 
  Sparkles, 
  HelpCircle,
  PlayCircle
} from 'lucide-react';

export default function VoiceLawyer() {
  const { 
    voiceActive, 
    voiceText, 
    voiceResponse, 
    simulateVoiceInput, 
    setVoiceActive 
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [audioInputText, setAudioInputText] = useState('');

  const handleVoiceSubmit = async (text: string) => {
    setLoading(true);
    await simulateVoiceInput(text);
    setLoading(false);
  };

  const simulatedAudios = [
    "İş veren haksız devamsızlık tutanağı düzenledi, ne yapmalıyım?",
    "Arabuluculuk anlaşma belgesi imzalandıktan sonra dava açılabilir mi?",
    "Duruşmaya mazeretsiz katılmazsam dava düşer mi?"
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-4xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <Mic className="w-5 h-5 text-goldDark animate-pulse" />
          Yapay Zekâ Sesli Avukat Asistanı & Dikte Modülü
        </h1>
        <p className="text-xs text-softGrey">
          Hukuki notlarınızı dikte edin veya konuşarak asistanınıza sorularınızı sorun, anında sesli biçimde yanıt alın
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Mic Control Widget */}
        <div className="md:col-span-5 bg-midnight p-6 rounded-2xl border border-slateGrey/60 text-center space-y-5">
          <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider block">Ses Kayıt Terminali</span>
          
          {/* Animated soundwaves when speaking/processing */}
          {loading ? (
            <div className="flex justify-center items-center gap-1 h-12">
              <span className="w-1.5 h-6 bg-goldDark rounded-full animate-bounce"></span>
              <span className="w-1.5 h-10 bg-goldDark rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-4 bg-goldDark rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-8 bg-goldDark rounded-full animate-bounce delay-200"></span>
              <span className="w-1.5 h-5 bg-goldDark rounded-full animate-bounce delay-100"></span>
            </div>
          ) : voiceActive ? (
            <div className="flex justify-center items-center gap-1 h-12">
              <span className="w-1.5 h-8 bg-amberAccent rounded-full animate-pulse"></span>
              <span className="w-1.5 h-12 bg-amberAccent rounded-full animate-pulse"></span>
              <span className="w-1.5 h-5 bg-amberAccent rounded-full animate-pulse"></span>
            </div>
          ) : (
            <div className="h-12 flex justify-center items-center text-xs text-softGrey">
              Mikrofon Hazır. Dikte başlatmak için tıklayın veya hazır sesleri seçin.
            </div>
          )}

          {/* Interactive Mic Button */}
          <button
            onClick={() => handleVoiceSubmit(audioInputText || simulatedAudios[0])}
            disabled={loading}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
              loading 
                ? 'bg-slateGrey text-softGrey' 
                : voiceActive 
                  ? 'bg-amberAccent text-midnight glow-box-orange scale-110' 
                  : 'bg-goldDark hover:bg-goldLight text-midnight glow-box-gold hover:scale-105'
            }`}
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : voiceActive ? (
              <Volume2 className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <input
            type="text"
            placeholder="Kendi dikte sorunuzu buraya da yazabilirsiniz..."
            value={audioInputText}
            onChange={e => setAudioInputText(e.target.value)}
            className="w-full bg-charcoal border border-slateGrey/50 px-3 py-2 rounded-lg text-[11px] text-ivory placeholder-softGrey text-center focus:outline-none"
          />
        </div>

        {/* Audio Output / Log Panel */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4 min-h-[180px]">
            <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase border-b border-slateGrey/30 pb-2">
              <Sparkles className="w-4 h-4 text-goldDark" />
              Ses Deşifre & Asistan Cevabı
            </h3>

            {loading ? (
              <div className="space-y-2 text-xs text-softGrey">
                <p className="italic">Konuşma metne dökülüyor...</p>
                <div className="h-2 bg-charcoal rounded overflow-hidden">
                  <div className="h-full bg-goldDark animate-pulse w-2/3"></div>
                </div>
              </div>
            ) : voiceResponse ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-amberAccent font-bold block uppercase">🎙️ Deşifre Edilen Metin:</span>
                  <p className="text-ivory italic mt-0.5">&quot;{voiceText}&quot;</p>
                </div>
                <div className="bg-charcoal p-3.5 rounded-lg border border-slateGrey/60 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold block uppercase flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    Sesli Asistan Yanıtı (Okunuyor):
                  </span>
                  <p className="text-softGrey leading-relaxed">{voiceResponse}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-softGrey italic">Mikrofon tuşuna tıklayıp konuşmaya başladığınızda ses dökümünüz ve yasal yanıtlar burada anında belirecektir.</p>
            )}
          </div>

          {/* Quick Simulated Audio Tracks */}
          <div className="bg-midnight/50 p-4 rounded-xl border border-slateGrey/40 space-y-2">
            <h4 className="text-[11px] font-bold text-goldLight flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-goldDark" />
              Sık Sorulan Hazır Ses Kayıtları
            </h4>
            <div className="space-y-1.5">
              {simulatedAudios.map((sa, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setAudioInputText(sa);
                    handleVoiceSubmit(sa);
                  }}
                  className="p-2 bg-charcoal hover:bg-charcoal/80 rounded-lg cursor-pointer text-[10px] text-softGrey hover:text-goldLight flex items-center justify-between transition-colors"
                >
                  <span className="line-clamp-1">{sa}</span>
                  <PlayCircle className="w-3.5 h-3.5 text-goldDark shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
