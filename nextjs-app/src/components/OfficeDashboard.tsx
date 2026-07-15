'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

interface OfficeDashboardProps {
  onGoToSettings: () => void;
  onSwitchTab: (tab: string) => void;
}

export default function OfficeDashboard({ onGoToSettings, onSwitchTab }: OfficeDashboardProps) {
  const { 
    userProfile, 
    caseFiles, 
    selectedCaseFileId, 
    selectCaseFile, 
    addCaseFile, 
    calendarEvents, 
    addCalendarEvent 
  } = useApp();

  const [showAddCase, setShowAddCase] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseClient, setCaseClient] = useState('');
  const [caseCategory, setCaseCategory] = useState('İş Hukuku');
  const [caseDesc, setCaseDesc] = useState('');

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLoc, setEventLoc] = useState('');

  const activeCase = caseFiles.find(c => c.id === selectedCaseFileId);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim() || !caseClient.trim()) return;
    addCaseFile(caseTitle, caseClient, caseCategory, caseDesc);
    setCaseTitle('');
    setCaseClient('');
    setCaseDesc('');
    setShowAddCase(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime) return;
    addCalendarEvent(eventTitle, eventDate, eventTime, eventDesc, eventLoc);
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventDesc('');
    setEventLoc('');
    setShowAddEvent(false);
  };

  return (
    <div className="space-y-6">
      {/* Premium Hero Banner */}
      <div className={`p-6 rounded-2xl border ${
        userProfile.isPremium 
          ? 'bg-gradient-to-r from-charcoal via-midnight to-charcoal border-successGreen/20 glow-box-green' 
          : 'bg-gradient-to-r from-charcoal via-midnight to-charcoal border-warningOrange/20 glow-box-orange'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
              Hoş Geldiniz, {userProfile.name} 
              {userProfile.isAdmin && <span className="bg-goldDark/10 text-goldDark text-[10px] px-2 py-0.5 rounded font-black tracking-wider border border-goldDark/30">ADMIN</span>}
            </h1>
            <p className="text-xs text-softGrey">
              {userProfile.isPremium 
                ? 'Premium Hukuk Lisansı süresiz olarak aktiftir. Tüm yapay zekâ analizleri limitsizdir.' 
                : 'Standart Üye. Yapay zekâ simülasyonları ve OCR kontrollerini genişletmek için Premium pakete geçin.'}
            </p>
          </div>
          <button 
            onClick={() => onSwitchTab('payment')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 ${
              userProfile.isPremium 
                ? 'bg-slateGrey text-ivory hover:bg-slateGrey/80' 
                : 'bg-gradient-to-r from-goldDark to-amberAccent text-midnight hover:shadow-lg hover:scale-105'
            }`}
          >
            {userProfile.isPremium ? 'Ödeme Geçmişi & IBAN' : 'Premium\'a Yükselt'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top statistics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal p-5 rounded-2xl border border-slateGrey/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-softGrey uppercase tracking-wider block">Aktif Davalar</span>
            <span className="text-2xl font-extrabold text-goldLight">{caseFiles.length}</span>
          </div>
          <div className="bg-midnight p-3 rounded-xl text-goldDark">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-2xl border border-slateGrey/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-softGrey uppercase tracking-wider block">Planlı Duruşmalar</span>
            <span className="text-2xl font-extrabold text-goldLight">{calendarEvents.length}</span>
          </div>
          <div className="bg-midnight p-3 rounded-xl text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-2xl border border-slateGrey/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-softGrey uppercase tracking-wider block">Destek Talepleri</span>
            <span className="text-2xl font-extrabold text-goldLight">2</span>
          </div>
          <div className="bg-midnight p-3 rounded-xl text-cyan-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Case Selector and History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-charcoal p-6 rounded-2xl border border-slateGrey/60 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-goldLight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-goldDark" />
                Dava Dosyalarınız
              </h2>
              <p className="text-xs text-softGrey">Üzerinde çalışmak istediğiniz dava dosyasını seçin</p>
            </div>
            <button 
              onClick={() => setShowAddCase(!showAddCase)}
              className="bg-goldDark/10 hover:bg-goldDark/20 text-goldLight font-bold text-xs px-3 py-1.5 rounded-xl border border-goldDark/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-goldDark" />
              Yeni Ekle
            </button>
          </div>

          {showAddCase && (
            <form onSubmit={handleCreateCase} className="bg-midnight p-4 rounded-xl border border-slateGrey/60 space-y-3">
              <h3 className="text-xs font-bold text-goldLight">Yeni Dava Dosyası Kaydı</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Dava Dosya Adı" 
                  required
                  value={caseTitle}
                  onChange={e => setCaseTitle(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                />
                <input 
                  type="text" 
                  placeholder="Müvekkil Adı" 
                  required
                  value={caseClient}
                  onChange={e => setCaseClient(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={caseCategory}
                  onChange={e => setCaseCategory(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory focus:outline-none focus:border-goldDark"
                >
                  <option value="İş Hukuku">İş Hukuku (Kıdem, İhbar vb.)</option>
                  <option value="Borçlar & Kira">Borçlar & Kira Uyuşmazlığı</option>
                  <option value="Ticaret Hukuku">Ticaret & Sözleşme İhlali</option>
                  <option value="Ceza Hukuku">Ceza Hukuku Soruşturma</option>
                </select>
                <button 
                  type="submit"
                  className="bg-goldDark text-midnight hover:shadow font-bold text-xs py-2 rounded-lg transition-all"
                >
                  Dosya Oluştur ve Seç
                </button>
              </div>
              <textarea 
                placeholder="Dosyanın Genel Özeti ve İddialar..."
                rows={3}
                value={caseDesc}
                onChange={e => setCaseDesc(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey p-3 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
              />
            </form>
          )}

          {/* List of Cases */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {caseFiles.map(c => {
              const isSelected = c.id === selectedCaseFileId;
              return (
                <div 
                  key={c.id}
                  onClick={() => selectCaseFile(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-midnight border-goldDark/50 shadow-md' 
                      : 'bg-charcoal border-slateGrey/40 hover:border-slateGrey/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ivory">{c.title}</span>
                        <span className="bg-slateGrey px-2 py-0.5 text-[9px] text-goldLight rounded font-semibold">{c.category}</span>
                      </div>
                      <p className="text-[11px] text-softGrey line-clamp-1">{c.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-softGrey block">{c.date}</span>
                      <span className="text-[10px] text-emerald-400 font-bold block">{c.clientName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeCase && (
            <div className="bg-midnight p-4 rounded-xl border border-goldDark/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider block">🎯 Seçili Çalışma Dosyası</span>
                <button 
                  onClick={() => onSwitchTab('dava')}
                  className="text-[10px] text-amberAccent hover:underline flex items-center gap-1 font-bold"
                >
                  Simülasyona Git
                  <ArrowRight className="w-3" />
                </button>
              </div>
              <p className="text-xs font-bold text-ivory">{activeCase.title}</p>
              <p className="text-[11px] text-softGrey leading-relaxed">{activeCase.description}</p>
            </div>
          )}
        </div>

        {/* Upcoming Hearings / Tasks */}
        <div className="lg:col-span-5 bg-charcoal p-6 rounded-2xl border border-slateGrey/60 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-goldLight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Duruşma ve İş Takvimi
              </h2>
            </div>
            <button 
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="bg-goldDark/10 hover:bg-goldDark/20 text-goldLight font-bold text-xs px-2.5 py-1 rounded-lg border border-goldDark/30 transition-all"
            >
              Yeni Ekle
            </button>
          </div>

          {showAddEvent && (
            <form onSubmit={handleCreateEvent} className="bg-midnight p-4 rounded-xl border border-slateGrey/60 space-y-3">
              <h3 className="text-xs font-bold text-goldLight">Yeni Duruşma/Görev Girişi</h3>
              <input 
                type="text" 
                placeholder="Duruşma / Görev Başlığı" 
                required
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey px-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none focus:border-goldDark"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  required
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-2 py-1.5 rounded-lg text-xs text-ivory focus:outline-none"
                />
                <input 
                  type="time" 
                  required
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  className="bg-charcoal border border-slateGrey px-2 py-1.5 rounded-lg text-xs text-ivory focus:outline-none"
                />
              </div>
              <input 
                type="text" 
                placeholder="Adliye / Salon veya Ofis Adresi" 
                value={eventLoc}
                onChange={e => setEventLoc(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey px-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Notlar ve Yapılacak Hazırlıklar..." 
                value={eventDesc}
                onChange={e => setEventDesc(e.target.value)}
                className="w-full bg-charcoal border border-slateGrey px-3 py-1.5 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
              />
              <button 
                type="submit"
                className="w-full bg-goldDark text-midnight font-bold text-xs py-2 rounded-lg transition-all"
              >
                Ajandaya Kaydet
              </button>
            </form>
          )}

          {/* List of Events */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {calendarEvents.map(ev => (
              <div key={ev.id} className="bg-midnight p-3.5 rounded-xl border border-slateGrey/40 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-ivory">{ev.title}</span>
                    <p className="text-[10px] text-softGrey leading-relaxed">{ev.description}</p>
                  </div>
                  <div className="bg-charcoal border border-slateGrey px-2 py-1 rounded text-center shrink-0">
                    <span className="block text-[8px] font-black text-amberAccent uppercase tracking-wide">
                      {new Date(ev.date).toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                    <span className="block text-xs font-black text-goldLight">{new Date(ev.date).getDate()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slateGrey/30 pt-2 text-[10px] text-softGrey">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span className="truncate max-w-[150px]">{ev.location || 'Ofis Toplantı Odası'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{ev.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
