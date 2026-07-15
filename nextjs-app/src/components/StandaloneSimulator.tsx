'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  HelpCircle,
  Clock,
  Plus
} from 'lucide-react';

export default function StandaloneSimulator() {
  const { 
    chatMessages, 
    addChatMessage, 
    selectedCaseFileId, 
    caseFiles 
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCase = caseFiles.find(c => c.id === selectedCaseFileId);
  const activeMessages = chatMessages.filter(m => m.caseId === (selectedCaseFileId || 1));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setInputText('');
    
    const caseId = selectedCaseFileId || 1;
    addChatMessage(caseId, 'USER', userMsg);
    setLoading(true);

    try {
      // Build prompt with context if case is selected
      let prompt = userMsg;
      if (activeCase) {
        prompt = `Aktif Dava Dosyası Bağlamı:
Başlık: ${activeCase.title}
Kategori: ${activeCase.category}
Açıklama: ${activeCase.description}

Avukatın sorusu: "${userMsg}"
Lütfen bu dava bağlamında detaylı bir yasal yanıt verin.`;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType: 'CHAT_ASSISTANT' })
      });

      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      
      addChatMessage(caseId, 'AI', data.text || "Şu anda size cevap veremiyorum, lütfen tekrar deneyin.");
    } catch (e) {
      addChatMessage(caseId, 'AI', "Bağlantı hatası oluştu. Yapay zekâ sunucusuna ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "İşverene gönderilecek arabuluculuk başvuru taslağı nasıl hazırlanır?",
    "Tahliye davasında tanık anlatımları ne derecede önemlidir?",
    "İmzalanan sözleşmede gizlilik maddesinin cezası makul müdür?"
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-5 space-y-4 max-w-5xl mx-auto flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3 shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-sm font-bold text-goldLight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-goldDark animate-pulse" />
            Yapay Zekâ Hukuk Müşaviri Chat
          </h1>
          {activeCase ? (
            <p className="text-[10px] text-softGrey">
              Bağlam: <strong className="text-goldDark">{activeCase.title}</strong> dosyası üzerinden sohbet ediyorsunuz
            </p>
          ) : (
            <p className="text-[10px] text-softGrey">Genel hukuk asistanı modundasınız</p>
          )}
        </div>
        <span className="bg-goldDark/10 text-goldLight border border-goldDark/30 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
          AI ONLINE
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {activeMessages.map(msg => {
          const isAi = msg.sender === 'AI';
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isAi 
                  ? 'bg-goldDark/10 text-goldDark border border-goldDark/35' 
                  : 'bg-slateGrey text-ivory border border-slateGrey'
              }`}>
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                isAi 
                  ? 'bg-midnight border-slateGrey/40 text-softGrey leading-relaxed whitespace-pre-wrap' 
                  : 'bg-goldDark text-midnight border-goldDark font-medium'
              }`}>
                <p>{msg.text}</p>
                <span className={`text-[8px] block text-right ${isAi ? 'text-softGrey' : 'text-midnight/60'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-goldDark/10 text-goldDark border border-goldDark/35 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-midnight border border-slateGrey/40 p-3 rounded-xl flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-goldDark" />
              <span className="text-[11px] text-softGrey">Hukuk Müşaviri yazıyor...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer input */}
      <div className="border-t border-slateGrey/30 pt-3 shrink-0 space-y-2">
        {activeMessages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(q)}
                className="bg-midnight hover:bg-midnight/70 border border-slateGrey/40 px-2.5 py-1 rounded text-[10px] text-softGrey hover:text-goldLight transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Sorunuzu veya talebinizi buraya yazın..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 bg-midnight border border-slateGrey px-4 py-2.5 rounded-xl text-xs text-ivory focus:outline-none focus:border-goldDark placeholder-softGrey"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-goldDark hover:bg-goldLight disabled:opacity-40 text-midnight p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
