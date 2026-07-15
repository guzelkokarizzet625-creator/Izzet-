'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  BookOpen, 
  Loader2, 
  GraduationCap, 
  CheckSquare, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function Academy() {
  const { 
    academyResult, 
    academyLoading, 
    runAcademyTeacher 
  } = useApp();

  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const lessons = [
    { title: "Ticari Davalarda İspat Kuralları & Kesin Deliller", category: "Ticaret Hukuku", duration: "12 Dakika" },
    { title: "4857 Sayılı İş Hukuku: Fesih Usulleri & Hak İhlali", category: "İş Hukuku", duration: "15 Dakika" },
    { title: "Kira Hukukunda Yeni Arabuluculuk ve Tahliye Koşulları", category: "Borçlar & Kira", duration: "10 Dakika" },
    { title: "Ceza Muhakemesinde Arama, El Koyma ve Dijital Deliller", category: "Ceza Hukuku", duration: "18 Dakika" }
  ];

  const handleStartLesson = async (lessonTitle: string) => {
    setSelectedLesson(lessonTitle);
    await runAcademyTeacher(lessonTitle);
  };

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-goldDark" />
          AL Hukuk AI Akademisi
        </h1>
        <p className="text-xs text-softGrey">
          Yapay zekâ destekli stajyer avukat eğitimi, pratik dava çalışmaları ve güncel mevzuat dersleri
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lesson List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-goldDark" />
            Mevcut Ders Müfredatı
          </h2>
          <div className="space-y-2.5">
            {lessons.map((les, idx) => {
              const isCurrent = selectedLesson === les.title;
              return (
                <div
                  key={idx}
                  onClick={() => handleStartLesson(les.title)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isCurrent 
                      ? 'bg-midnight border-goldDark/60 shadow-md' 
                      : 'bg-charcoal border-slateGrey/40 hover:border-slateGrey/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="bg-slateGrey px-2.5 py-0.5 text-[9px] text-goldLight rounded font-bold uppercase tracking-wide">
                      {les.category}
                    </span>
                    <span className="text-[9px] text-softGrey font-medium">{les.duration}</span>
                  </div>
                  <h3 className="text-xs font-bold text-ivory mt-2 hover:text-goldLight">{les.title}</h3>
                  <div className="flex justify-end mt-2">
                    <span className="text-[10px] text-amberAccent font-bold flex items-center gap-1">
                      Dersi Başlat
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson Reader */}
        <div className="lg:col-span-7">
          {academyLoading ? (
            <div className="p-16 text-center space-y-4 bg-midnight rounded-xl border border-slateGrey/40 min-h-[350px] flex flex-col justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-goldDark mx-auto" />
              <h4 className="text-xs font-bold text-goldLight">Hukuk Profesörü AI Konuşuyor</h4>
              <p className="text-[10px] text-softGrey max-w-xs mx-auto">
                Konu hakkındaki mevzuat hükümleri, emsal olay incelemeleri ve ders sonu mini pratik testi tanzim ediliyor...
              </p>
            </div>
          ) : academyResult ? (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-4 min-h-[350px]">
              <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-goldDark" />
                  Ders Notu ve Mini Pratik Test
                </span>
                <span className="text-[9px] bg-goldDark/15 text-goldLight border border-goldDark/30 px-2 py-0.5 rounded font-bold uppercase">AKTİF DERS</span>
              </div>
              <div className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap prose prose-invert max-h-[450px] overflow-y-auto pr-2">
                {academyResult}
              </div>
            </div>
          ) : (
            <div className="bg-midnight p-8 rounded-xl border border-slateGrey/40 text-center space-y-4 min-h-[350px] flex flex-col justify-center items-center">
              <div className="bg-charcoal p-3.5 rounded-full text-softGrey">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h3 className="text-xs font-bold text-goldLight">Okumak İçin Bir Ders Seçin</h3>
              <p className="text-[10px] text-softGrey max-w-xs">
                Sol menüde bulunan ders başlıklarından birine tıklayarak yapay zekâ eğitmeninin hazırladığı akademik notlara ve testlere anında erişebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
