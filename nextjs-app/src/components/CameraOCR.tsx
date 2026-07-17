'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Camera, 
  FileText, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

export default function CameraOCR() {
  const { 
    documents, 
    addDocumentToCase, 
    analyzeDocRisk, 
    docAnalysisLoading, 
    selectedCaseFileId 
  } = useApp();

  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const activeDocs = documents.filter(d => d.caseId === selectedCaseFileId);
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docContent.trim() || !selectedCaseFileId) return;
    addDocumentToCase(selectedCaseFileId, docName, docContent, "4.2 MB");
    setDocName('');
    setDocContent('');
  };

  const handleAnalyze = async (id: number) => {
    setSelectedDocId(id);
    await analyzeDocRisk(id);
  };

  const mockPreloadedFiles = [
    { name: "Ortaklik_Sozlesmesi_Maddeleri.txt", content: "ORTAKLIK SÖZLEŞMESİ: Şirket ortakları kardan eşit pay alacaktır. Ortaklardan biri ayrılırsa, sonraki 10 yıl boyunca aynı sektörde bağımsız iş kuramaz, kurarsa 500.000 USD cezai şart öder." },
    { name: "Yeni_Ofis_Kira_Kontrati.txt", content: "KİRA SÖZLEŞMESİ: Kira artış oranı her yıl %85 olarak uygulanacaktır. Kiracı kira gününü 1 gün bile aksatırsa, tüm yılın kirası muaccel (hemen ödenebilir) hale gelecektir." }
  ];

  return (
    <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-goldLight flex items-center gap-2">
          <Camera className="w-5 h-5 text-goldDark" />
          Yapay Zekâ Belge Tarama, OCR ve Risk Denetimi
        </h1>
        <p className="text-xs text-softGrey">
          Sözleşmeleri, ihtarnameleri ve evrakları akıllı taramayla okutun, içlerindeki yüksek riskli maddeleri anında denetleyin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Register / List Documents */}
        <div className="lg:col-span-5 space-y-4">
          {/* New Document form */}
          <form onSubmit={handleCreateDocument} className="bg-midnight p-4 rounded-xl border border-slateGrey/60 space-y-3">
            <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase">
              <FileText className="w-4 h-4 text-goldDark" />
              Sözleşme / Evrak Okut
            </h3>
            <input
              type="text"
              required
              placeholder="Dosya Adı (Örn: Hizmet_Sozlesmesi.pdf)..."
              value={docName}
              onChange={e => setDocName(e.target.value)}
              className="w-full bg-charcoal border border-slateGrey px-3 py-2 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none"
            />
            <textarea
              required
              rows={4}
              placeholder="Evrak metnini yapıştırın veya aşağıdaki hazır şablonlara tıklayın..."
              value={docContent}
              onChange={e => setDocContent(e.target.value)}
              className="w-full bg-charcoal border border-slateGrey p-3 rounded-lg text-xs text-ivory placeholder-softGrey focus:outline-none leading-relaxed"
            />
            <div className="flex justify-between items-center gap-2">
              {/* Preset buttons */}
              <div className="flex gap-1.5">
                {mockPreloadedFiles.map((pf, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDocName(pf.name);
                      setDocContent(pf.content);
                    }}
                    className="text-[9px] bg-charcoal hover:bg-charcoal/80 border border-slateGrey text-softGrey hover:text-goldLight px-2 py-1 rounded"
                  >
                    Şablon {i+1}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!selectedCaseFileId}
                className="bg-goldDark text-midnight hover:shadow font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Sisteme Al
              </button>
            </div>
          </form>

          {/* List of active docs */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-goldLight uppercase tracking-wider">Mevcut Evrak Listesi</h3>
            {activeDocs.length === 0 ? (
              <p className="text-[11px] text-softGrey italic">Seçili dava dosyasında henüz taranmış evrak bulunmuyor.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {activeDocs.map(doc => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleAnalyze(doc.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-midnight border-goldDark/50 shadow-md' 
                          : 'bg-charcoal border-slateGrey/40 hover:border-slateGrey/80'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-ivory block line-clamp-1">{doc.name}</span>
                          <span className="text-[10px] text-softGrey block">Boyut: {doc.fileSize} | {doc.date}</span>
                        </div>
                        {doc.status === 'RISK_ANALYZED' ? (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            doc.riskLevel === 'HIGH' 
                              ? 'bg-errorRed/10 text-errorRed border border-errorRed/20' 
                              : doc.riskLevel === 'MEDIUM' 
                                ? 'bg-warningOrange/10 text-warningOrange border border-warningOrange/20' 
                                : 'bg-successGreen/10 text-successGreen border border-successGreen/20'
                          }`}>
                            Puan: {doc.riskScore}
                          </span>
                        ) : (
                          <span className="bg-charcoal text-[9px] text-softGrey px-2 py-0.5 rounded border border-slateGrey/40 uppercase font-semibold">TARANDI</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Risk Report output */}
        <div className="lg:col-span-7">
          {docAnalysisLoading ? (
            <div className="p-16 text-center space-y-4 bg-midnight rounded-xl border border-slateGrey/40 min-h-[350px] flex flex-col justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-goldDark mx-auto" />
              <h4 className="text-xs font-bold text-goldLight">Sözleşme Maddeleri Analiz Ediliyor</h4>
              <p className="text-[10px] text-softGrey max-w-xs mx-auto">
                Cezai şart maddeleri, gizlilik taahhütleri, tek taraflı fesih yetkileri ve TBK normları süzgeçten geçiriliyor...
              </p>
            </div>
          ) : selectedDoc ? (
            <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 space-y-5 min-h-[350px]">
              <div className="flex justify-between items-center border-b border-slateGrey/30 pb-3">
                <span className="text-[10px] font-bold text-goldDark uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-goldDark" />
                  Sözleşme Denetim Raporu
                </span>
                <span className="text-[9px] text-softGrey italic font-semibold">{selectedDoc.name}</span>
              </div>

              {selectedDoc.status === 'RISK_ANALYZED' ? (
                <div className="space-y-4">
                  {/* Risk Level Badge */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-charcoal p-4 rounded-xl border border-slateGrey/50">
                    <div className="relative flex items-center justify-center shrink-0 w-20 h-20 bg-midnight rounded-full border-4 border-slateGrey/30">
                       <span className="text-xs font-black text-center px-1">
                          {selectedDoc.riskLevel === 'HIGH' ? <span className="text-errorRed">YÜKSEK RİSK</span> : selectedDoc.riskLevel === 'MEDIUM' ? <span className="text-warningOrange">ORTA RİSK</span> : <span className="text-successGreen">DÜŞÜK RİSK</span>}
                       </span>
                    </div>

                    <div className="space-y-1 text-center sm:text-left">
                      <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full inline-block ${
                        selectedDoc.riskLevel === 'HIGH' 
                          ? 'bg-errorRed/10 text-errorRed border border-errorRed/25' 
                          : selectedDoc.riskLevel === 'MEDIUM' 
                            ? 'bg-warningOrange/10 text-warningOrange border border-warningOrange/25' 
                            : 'bg-successGreen/10 text-successGreen border border-successGreen/25'
                      }`}>
                        Risk Seviyesi: {selectedDoc.riskLevel === 'HIGH' ? 'Yüksek Risk' : selectedDoc.riskLevel === 'MEDIUM' ? 'Orta Derece Risk' : 'Güvenli (Temiz)'}
                      </span>
                      <p className="text-[11px] text-softGrey">
                        Türk Borçlar Kanunu hükümlerine göre belirlenen bu analiz, sözleşmedeki haksız şart dengelerini ve yasal eksiklikleri ifade eder.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-goldLight uppercase tracking-wider block">⚠️ Tespit Edilen Risklerin Açıklaması:</span>
                    <p className="text-xs text-softGrey leading-relaxed bg-charcoal p-4 rounded-lg border border-slateGrey/35 whitespace-pre-wrap">
                      {selectedDoc.riskDescription}
                    </p>
                  </div>

                  <div className="bg-charcoal p-3.5 rounded-lg border border-slateGrey/40 space-y-1">
                    <span className="text-[10px] font-bold text-goldLight uppercase tracking-wider block">📄 Evrak Metin Deşifresi (OCR):</span>
                    <p className="text-[10px] text-softGrey line-clamp-3 italic leading-normal">&quot;{selectedDoc.contentText}&quot;</p>
                  </div>
                  
                  {/* Proactive Next Steps */}
                  <div className="pt-4 border-t border-slateGrey/30 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-goldLight flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amberAccent" />
                      Önerilen Sonraki Adımlar
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          window.location.hash = "petition";
                          alert("Dilekçe Stüdyosuna yönlendiriliyorsunuz. İlgili belgeye itiraz dilekçesi hazırlanacak.");
                        }}
                        className="bg-charcoal border border-slateGrey/40 hover:border-goldDark/50 p-3 rounded-xl text-left transition-all group outline-none"
                      >
                        <span className="block text-xs font-bold text-ivory group-hover:text-goldLight">İtiraz Dilekçesi Hazırlansın mı?</span>
                        <span className="block text-[10px] text-softGrey mt-1">Bu sözleşme/evraktaki riskli maddelere karşı itiraz veya ihtarname oluşturun.</span>
                      </button>
                      <button 
                        onClick={() => {
                          window.location.hash = "dava";
                          alert("Dava Simülatörüne yönlendiriliyor. Bu belge ana delil olarak eklendi.");
                        }}
                        className="bg-charcoal border border-slateGrey/40 hover:border-goldDark/50 p-3 rounded-xl text-left transition-all group outline-none"
                      >
                        <span className="block text-xs font-bold text-ivory group-hover:text-goldLight">Dava Dosyasına Eklesin mi?</span>
                        <span className="block text-[10px] text-softGrey mt-1">Bu belgeyi ana delil olarak belirleyip risk simülasyonunu güncelleyin.</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="bg-charcoal p-3 rounded-full text-softGrey w-fit mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-goldLight">Yapay Zekâ Analiz Raporu Bekleniyor</h4>
                  <p className="text-[11px] text-softGrey max-w-xs mx-auto">
                    Bu evrak henüz denetlenmedi. Lütfen sol listeden üzerine tıklayıp analiz sürecini başlatın.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-midnight p-8 rounded-xl border border-slateGrey/40 text-center space-y-4 min-h-[350px] flex flex-col justify-center items-center">
              <div className="bg-charcoal p-3.5 rounded-full text-softGrey">
                <Camera className="w-10 h-10" />
              </div>
              <h3 className="text-xs font-bold text-goldLight">OCR Yapılacak Evrakı Seçin</h3>
              <p className="text-[10px] text-softGrey max-w-xs">
                Sol taraftan bir evrak seçerek yapay zeka denetimini başlatabilir veya yeni bir dosya yükleyerek metinleri sisteme tanıtabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
