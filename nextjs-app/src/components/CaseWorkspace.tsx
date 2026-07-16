'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Zap, 
  AlertTriangle, 
  Calendar, 
  Users, 
  LayoutGrid, 
  BookOpen, 
  Copy, 
  Loader2, 
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  Scale,
  Award,
  Send,
  HelpCircle,
  UserCheck,
  BookMarked,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Percent,
  TrendingUp,
  Download,
  RotateCcw,
  Play,
  Check,
  FileDown,
  User,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded types for comprehensive courtroom roleplay
type RoleId = 'HAKIM' | 'SAVCI' | 'DAVACI' | 'DAVALI' | 'AVUKAT' | 'TANIK' | 'BILIRKISI';

interface CourtMessage {
  id: number;
  sender: string;
  senderRole: RoleId;
  text: string;
  score: number; // Statement legal score out of 100
  timestamp: string;
}

interface RealityAnalysis {
  gercekler: string[];
  tahminler: string[];
  olasiliklar: string[];
  hukukiGorusler: string[];
}

interface ContradictionItem {
  id: string;
  source: string;
  statement: string;
  comparisonWith: string;
  contradictionDetail: string;
  severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
}

interface MissingEvidenceList {
  eksikBelgeler: string[];
  eksikTaniklar: string[];
  eksikKamera: string[];
  eksikBankaKayitlari: string[];
  eksikHts: string[];
  eksikBilirkisi: string[];
  eksikResmiYazismalar: string[];
}

interface AdvisoryCouncilOpinion {
  role: string;
  advisorName: string;
  opinion: string;
  vote: 'KABUL' | 'REDD' | 'KISMİ KABUL' | 'ÇEKİMSER';
}

interface AdvisoryCouncil {
  opinions: AdvisoryCouncilOpinion[];
  ortakKarar: string;
  fikirAyriliklari: string[];
}

interface DetailedRiskMatrix {
  usulRiski: number;
  ispatRiski: number;
  delilRiski: number;
  hakimTakdirRiski: number;
  istinafRiski: number;
  temyizRiski: number;
  bozmaRiski: number;
  karsiTarafAvantaji: number;
}

interface ExpandedCaseAnalysis {
  davaOzeti: string;
  kronoloji: Array<{ date: string; title: string; description: string }>;
  tarafAnalizi: { plaintiff: string[]; defendant: string[] };
  delilAnalizi: { guclu: string[]; zayif: string[]; eksik: string[] };
  hukukiRiskAnalizi: string;
  kazanmaIhtimali: number;
  kaybetmeIhtimali: number;
  ispatYukuAnalizi: string;
  hukukiDayanaklar: string[];
  kanunMaddeleri: string[];
  yonetmelikler: string[];
  ictihatlar: string[];
  yargitayKararlari: string[];
  emsalKararlar: string[];
  olasiSavunmalar: string[];
  olasiKarsiSavunmalar: string[];
  hakimSorulari: string[];
  savciSorulari: string[];
  karsiTarafAvukatiSorulari: string[];
  tanikSorgulari: string[];
  caprazSorgular: string[];
  bilirkisiIhtiyaci: string;
  arabuluculukIhtimali: string;
  zamanasimiAnalizi: string;
  yetkiAnalizi: string;
  gorevAnalizi: string;
  usulHatalari: string[];
  delilYasaklari: string[];
  hukukiEksikler: string[];
  stratejikOneriler: string[];
  
  // AL HUKUK AI ULTRA ENGINE V3 Protocols
  realityEngine?: RealityAnalysis;
  contradictions?: ContradictionItem[];
  missingEvidence?: MissingEvidenceList;
  aiCouncil?: AdvisoryCouncil;
  detailedRisks?: DetailedRiskMatrix;
}

interface FinalVerdictReport {
  gerekceliKarar: string;
  hakimDegerlendirmesi: string;
  savciDegerlendirmesi: string;
  avukatDegerlendirmesi: string;
  dosyaPuani: number;
  riskPuani: number;
  eksikDeliller: string[];
  toplanmasiGerekenDeliller: string[];
  basariIhtimali: number;
  temyizIhtimali: number;
  istinafIhtimali: number;
  onerilenStrateji: string;
  onerilenDilekce: string;
  onerilenKanunMaddeleri: string[];
  onerilenEmsalKararlar: string[];
}

export default function CaseWorkspace() {
  const { 
    caseFiles, 
    selectedCaseFileId, 
    caseAnalysisResult, 
    caseAnalysisLoading, 
    runCaseSimulation 
  } = useApp();

  const activeCase = caseFiles.find(c => c.id === selectedCaseFileId);

  // --- Main Tabs ---
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'analysis' | 'trial'>('analysis');
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'timeline' | 'parties' | 'sources' | 'strategy'>('general');
  const [copied, setCopied] = useState(false);

  // --- Simulation states ---
  const [expandedAnalysis, setExpandedAnalysis] = useState<ExpandedCaseAnalysis | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- Sanal Duruşma Odası (Roleplay) States ---
  const [userRole, setUserRole] = useState<RoleId>('AVUKAT');
  const [selectedRole, setSelectedRole] = useState<RoleId>('HAKIM'); // Target being questioned
  const [courtInput, setCourtInput] = useState('');
  const [isCourtLoading, setIsCourtLoading] = useState(false);
  const [trialStep, setTrialStep] = useState<number>(3); // Default at Hakim Dosya Incelemesi
  
  const [courtMessages, setCourtMessages] = useState<CourtMessage[]>([]);
  const [metrics, setMetrics] = useState({
    dosyaGucu: 75,
    delilGucu: 70,
    tanikGucu: 60,
    ispatGucu: 65,
    riskSkoru: 35,
    basariOlasiligi: 72,
    usulRiski: 18,
    temyizRiski: 42,
    istinafRiski: 45,
    karsiTarafAvantaji: 28
  });

  const [verdictLoading, setVerdictLoading] = useState(false);
  const [finalReport, setFinalReport] = useState<FinalVerdictReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'verdict' | 'actors' | 'strategy'>('verdict');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll court messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [courtMessages, isCourtLoading]);

  // Load / Save local state for expanded analysis
  useEffect(() => {
    if (activeCase) {
      const saved = localStorage.getItem(`expanded_analysis_${activeCase.id}`);
      if (saved) {
        try {
          setExpandedAnalysis(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved expanded analysis:", e);
        }
      } else {
        setExpandedAnalysis(null);
      }

      // Initialize court messages for active case
      const savedMessages = localStorage.getItem(`court_messages_${activeCase.id}`);
      if (savedMessages) {
        try {
          setCourtMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Safe default starter message
        setCourtMessages([
          {
            id: 1,
            sender: "Hâkim Ahmet Altan",
            senderRole: 'HAKIM',
            text: `T.C. Kartal Anadolu Adliyesi duruşma salonu açılmıştır. Dosya konusu: ${activeCase.title}. Dosya incelendi, usul ve hak düşürücü süreler yönünden ön incelemeye geçildi. Taraf vekillerine söz verilecektir. Hangi sıfatla beyanda bulunmak istersiniz? Lütfen sol taraftan rolünüzü seçerek sorularınızı veya iddialarınızı yöneltiniz.`,
            score: 100,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }

      // Load final report if any
      const savedReport = localStorage.getItem(`final_report_${activeCase.id}`);
      if (savedReport) {
        try {
          setFinalReport(JSON.parse(savedReport));
        } catch (e) {
          console.error(e);
        }
      } else {
        setFinalReport(null);
      }

      // Load active step and metrics
      const savedStep = localStorage.getItem(`trial_step_${activeCase.id}`);
      if (savedStep) setTrialStep(parseInt(savedStep));
      const savedMetrics = localStorage.getItem(`metrics_${activeCase.id}`);
      if (savedMetrics) {
        try {
          setMetrics(JSON.parse(savedMetrics));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [selectedCaseFileId, activeCase]);

  // Save messages and metrics on change
  const saveTrialState = (newMsgs: CourtMessage[], newMetrics: typeof metrics, newStep: number) => {
    if (!activeCase) return;
    localStorage.setItem(`court_messages_${activeCase.id}`, JSON.stringify(newMsgs));
    localStorage.setItem(`metrics_${activeCase.id}`, JSON.stringify(newMetrics));
    localStorage.setItem(`trial_step_${activeCase.id}`, newStep.toString());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe fallback simulation generator based on category & title
  const getFallbackAnalysis = (title: string, category: string, description: string): ExpandedCaseAnalysis => {
    const isCeza = category.toLowerCase().includes('ceza');
    const isIs = category.toLowerCase().includes('iş') || category.toLowerCase().includes('is');
    const isAile = category.toLowerCase().includes('aile') || category.toLowerCase().includes('boşanma');

    return {
      davaOzeti: description || "İlgili uyuşmazlığın konusu, tarafların sıfatları ve ileri sürülen iddialar muvacehesinde hazırlanan genel yasal niteleme özeti.",
      kronoloji: [
        { date: "Uyuşmazlık - 1 Yıl", title: "İlişkinin Kurulması ve Akdi Yükümlülükler", description: "Taraflar arasında sözleşmesel veya fiili hukuki bağın tesis edilmesi." },
        { date: "Uyuşmazlık - 3 Ay", title: "Uyuşmazlık Konusu Vakıanın Gerçekleşmesi", description: "Yükümlülük ihlali, haksız eylem veya uyuşmazlığa yol açan somut olayın vuku bulması." },
        { date: "Uyuşmazlık - 15 Gün", title: "İhtarname Keşidesi ve Arabuluculuk Süreci", description: "Dava şartı arabuluculuk sürecinin işletilmesi ve tarafların anlaşamaması üzerine tutanağın tanzimi." },
        { date: "Bugün", title: "Dava İkamesi ve Simülasyon Dosyası", description: "Simüle edilen hukuki uyuşmazlığın yetkili ve görevli adli merci nezdinde dava edilmesi." }
      ],
      tarafAnalizi: {
        plaintiff: [
          "Müvekkilin yasal haklarının ihlal edildiği iddiası.",
          "Maddi ve manevi tazminat taleplerinin haklılığı ve yasal faiz talepleri.",
          "İspat araçlarının eksiksiz mahkemeye sunulması yükümlülüğü."
        ],
        defendant: [
          "İddia edilen yükümlülük ihlalinin ve haksız eylemin kati surette reddi.",
          "Zamanaşımı veya hak düşürücü süre itirazı.",
          "Mücbir sebep, kusursuzluk veya kusur indirim halleri savunması."
        ]
      },
      delilAnalizi: {
        guclu: [
          "Yazılı sözleşmeler and tarafların ıslak imzalı belgeleri.",
          "Banka transfer kayıtları ve resmi dekontlar.",
          "Karşı tarafın ikrar niteliğindeki yazılı mesajları ve e-posta yazışmaları."
        ],
        zayif: [
          "Sözlü beyanlar ve soyut tanık anlatımları.",
          "Tarihsiz ve imzasız özel belgeler.",
          "Tek taraflı tutulan gayriresmi muhasebe kayıtları."
        ],
        eksik: [
          "Resmi kurumlardan celp edilecek SGK, vergi ve tapu kayıtları.",
          "HTS kayıtları ve baz istasyonu verileri.",
          "Ticari defterler ve dijital kayıtlar üzerinde bilirkişi incelemesi."
        ]
      },
      hukukiRiskAnalizi: "Davanın açılacağı mahkemenin yerleşik BAM ve Yargıtay içtihatlarına uyumu, ispat yükünü taşıyan tarafın delil gücüne sıkı sıkıya bağlıdır. Usuli eksiklikler davanın esasına girilmeden usulden reddine yol açabilir.",
      kazanmaIhtimali: 72,
      kaybetmeIhtimali: 28,
      ispatYukuAnalizi: "HMK Madde 190 uyarınca ispat yükü, iddia edilen vakıaya bağlanan hukuki sonuçtan kendi lehine hak çıkaran tarafa aittir.",
      hukukiDayanaklar: [
        "Hukuk Muhakemeleri Kanunu (HMK)",
        "Türk Borçlar Kanunu (TBK)",
        isCeza ? "Türk Ceza Kanunu (TCK)" : isIs ? "4857 Sayılı İş Kanunu" : isAile ? "Türk Medeni Kanunu (TMK)" : "Türk Ticaret Kanunu (TTK)"
      ],
      kanunMaddeleri: [
        isCeza ? "TCK Madde 21 (Kast)" : isIs ? "İş Kanunu Madde 17 (İhbar)" : isAile ? "TMK Madde 166 (Evlilik Birliğinin Sarsılması)" : "TBK Madde 112 (Borca Aykırılık)",
        "HMK Madde 190 (İspat Yükü)",
        "HMK Madde 200 (Senetle İspat Zorunluluğu)"
      ],
      yonetmelikler: [
        "Hukuk Muhakemeleri Kanunu Yönetmeliği",
        "Arabuluculuk Kanunu Uygulama Yönetmeliği"
      ],
      ictihatlar: [
        "Yargıtay Hukuk Genel Kurulu Esas: 2021/450 Karar: 2022/112 (Bu bilgi doğrulanmalıdır.)",
        "Anayasa Mahkemesi Bireysel Başvuru No: 2019/1204 (Adil Yargılanma Hakkı)"
      ],
      yargitayKararlari: [
        "Yargıtay 9. Hukuk Dairesi Esas: 2022/9800 Karar: 2023/1102 (Bu bilgi doğrulanmalıdır.)",
        "Yargıtay 2. Hukuk Dairesi Esas: 2021/300 Karar: 2022/1500 (Bu bilgi doğrulanmalıdır.)"
      ],
      emsalKararlar: [
        "Bölge Adliye Mahkemesi (BAM) 12. Hukuk Dairesi E. 2023/150 K. 2023/450 (Bu bilgi doğrulanmalıdır.)",
        "Yargıtay İçtihadı Birleştirme Kurulu Kararı E. 2020/2 K. 2021/1 (Bu bilgi doğrulanmalıdır.)"
      ],
      olasiSavunmalar: [
        "Davanın süresinde açılmadığı ve hak düşürücü sürenin dolduğu itirazı.",
        "İddiaların gerçeği yansıtmadığı ve delilsiz olduğu savunması.",
        "Sözleşme şartlarına tam olarak riayet edildiği beyanı."
      ],
      olasiKarsiSavunmalar: [
        "Müvekkilin temerrüde düşürülmediği savunması.",
        "Sunulan delillerin usulsüz elde edildiği ve delil yasağı kapsamında olduğu savı.",
        "Kötüniyet iddiasının reddi."
      ],
      hakimSorulari: [
        "İddia konusu alacakların ödendiğine dair banka dekontu mevcut mudur?",
        "Fesih bildiriminin karşı tarafa tebliğ edildiği tarih nedir?",
        "Tanıkların olay anında bizzat orada bulunduklarına dair kanıtınız nedir?"
      ],
      savciSorulari: [
        "Eylemin kast derecesi ve olası kast unsurları oluşmuş mudur?",
        "Kamu zararının giderildiğine dair makbuz dosyaya sunulmuş mudur?",
        "Suçun nitelikli hallerinin oluştuğuna dair somut deliller nelerdir?"
      ],
      karsiTarafAvukatiSorulari: [
        "İş sözleşmesinde fazla çalışma yapılacağına dair muvafakatnameyi imzalamadınız mı?",
        "İmzalı bordrolardaki tutarların hesabınıza yatırıldığını kabul ediyor musunuz?",
        "İhtarname göndermeden doğrudan dava açmanız dürüstlük kuralına aykırı değil midir?"
      ],
      tanikSorgulari: [
        "Taraflar arasındaki uyuşmazlığın tam olarak hangi tarihte gerçekleştiğini gördünüz mü?",
        "İşyerinde mesai saatlerinin takibinin nasıl yapıldığına şahit oldunuz mu?",
        "Müvekkilin iş akdinin feshedildiği gün taraflar arasında ne konuşuldu?"
      ],
      caprazSorgular: [
        "Tanığın karşı tarafla olan akrabalık veya iş ilişkisi derecesi nedir?",
        "Tanığın beyanları ile olay günü tutulan tutanak arasındaki çelişkinin sebebi nedir?",
        "Teknik bilirkişi raporundaki hesaplamalarda esas alınan faiz oranının dayanağı nedir?"
      ],
      bilirkisiIhtiyaci: "Dosya kapsamındaki hesaplamalar uzmanlık gerektirdiğinden, hesap bilirkişi kurulundan rapor alınması elzemdir.",
      arabuluculukIhtimali: "Dava şartı arabuluculuk kapsamında tarafların menfaat dengesi gözetilerek %65 ihtimalle sulh olunabileceği değerlendirilmektedir.",
      zamanasimiAnalizi: "Talep edilen alacaklar ve iddialar 5 yıllık genel zamanaşımı süresine tabi olup henüz süre dolmamıştır.",
      yetkiAnalizi: "HMK Madde 6 uyarınca davalının davanın açıldığı tarihteki yerleşim yeri mahkemesi veya sözleşmenin ifa edileceği yer mahkemesi yetkilidir. Yetki itirazı bulunmamaktadır.",
      gorevAnalizi: "Uyuşmazlığın niteliği gereği görevli mahkeme İş Mahkemesi olup görev yönünden usuli bir eksiklik bulunmamaktadır.",
      usulHatalari: [
        "Arabuluculuk son tutanağının aslı veya onaylı suretinin dava dilekçesine eklenmemesi riski.",
        "Harçların eksik yatırılması sebebiyle süre verilmesi."
      ],
      delilYasaklari: [
        "Hukuka aykırı ses veya video kayıtlarının delil olarak değerlendirilemeyeceği kuralı.",
        "Gizlilik sözleşmesi ihlal edilerek elde edilen ticari sır niteliğindeki belgeler."
      ],
      hukukiEksikler: [
        "Fazla mesai iddialarını destekleyen tanıkların isimlerinin dilekçede bildirilmemesi.",
        "Banka dökümlerinin ilgili banka şubesinden celp edilmesi talebinin eksik olması."
      ],
      stratejikOneriler: [
        "Bir sonraki celseye kadar eksik banka kayıtlarının celbi için müzekkere yazılmasını talep edin.",
        "Tanıkların beyanlarını destekleyecek nitelikteki WhatsApp yazışmalarını tarih sırasına göre dosyaya sunun.",
        "Karşı tarafın sunduğu yetki itirazının yersiz olduğunu HMK Madde 10 uyarınca çürütün."
      ],
      realityEngine: {
        gercekler: [
          "Davacının dosyada sunulu ıslak imzalı iş akdi mevcuttur.",
          "Banka hesap dökümünden davanın açıldığı tarihten önceki son 3 aya ait ödemelerin yapılmadığı sabittir.",
          "Arabuluculuk son anlaşamama tutanağı usulüne uygun şekilde dosyaya ibraz edilmiştir."
        ],
        tahminler: [
          "Hâkimin bilirkişi heyetinden ek hesap raporu talep etmesi kuvvetle muhtemeldir.",
          "Karşı tarafın zamanaşımı def'i ileri sürmesi beklenmektedir ancak bu iddia hukuki dayanaktan yoksundur."
        ],
        olasiliklar: [
          "Davacı lehine kıdem tazminatına hükmedilmesi olasılığı %82'dir.",
          "Karşı tarafın kusur indiriminden yararlanma olasılığı %15 olarak hesaplanmıştır."
        ],
        hukukiGorusler: [
          "HMK Madde 200 uyarınca iddiaların senetle ispatı zorunludur, bu kapsamda sunulan yazılı deliller davanın kazanılmasında anahtar rol oynayacaktır.",
          "Bölge Adliye Mahkemesi'nin son emsal kararları doğrultusunda dava açılmasında herhangi bir usuli engel bulunmamaktadır."
        ]
      },
      contradictions: [
        {
          id: '1',
          source: 'Karşı Taraf Beyanı',
          statement: 'Çalışanın fazla çalışma yapmadığı ve mesai saatlerinin 08:30-17:30 olduğu iddia edilmiştir.',
          comparisonWith: 'HTS ve Kamera Kayıtları',
          contradictionDetail: 'Celp edilen işyeri kamera kayıtları ve baz istasyonu HTS verilerinde davalının haftada 3 gün saat 21:00\'e kadar işyerinde kaldığı tespit edilmiştir.',
          severity: 'YÜKSEK'
        },
        {
          id: '2',
          source: 'Tanık Beyanı (Davalı Tanığı)',
          statement: 'Çalışanın maaşının elden ödenmediği, her şeyin bankadan yatırıldığı beyan edilmiştir.',
          comparisonWith: 'Banka Kayıtları & SGK Verileri',
          contradictionDetail: 'Banka dökümlerinde sadece asgari ücretin yattığı, ancak SGK prim matrahı ile çalışanın fiili maaşı arasında çelişki olduğu, elden ödemelerin yapıldığı şüphesi doğmaktadır.',
          severity: 'ORTA'
        }
      ],
      missingEvidence: {
        eksikBelgeler: ["İşyeri özlük dosyası aslı", "Yıllık izin defteri tanzim kayıtları"],
        eksikTaniklar: ["Uyuşmazlık döneminde görev yapan insan kaynakları sorumlusu tanık sıfatıyla dinlenmelidir."],
        eksikKamera: ["Giriş-çıkış takip sistemi kamera kayıtlarının son 6 aylık dökümü"],
        eksikBankaKayitlari: ["İlgili banka şubesine maaş hesabı hareketleri için müzekkere yazılması"],
        eksikHts: ["Uyuşmazlık günlerine ilişkin baz istasyonu sinyal kayıtları"],
        eksikBilirkisi: ["Hesap uzmanı bilirkişiden ek rapor tanzimi"],
        eksikResmiYazismalar: ["Sosyal Güvenlik Kurumu'na prim matrahlarına ilişkin yazılan müzekkere cevabı"]
      },
      aiCouncil: {
        opinions: [
          { role: "Hakim", advisorName: "Hâkim Ahmet Altan", opinion: "İspat yükünün davacı tarafında olduğunu, sunulan yazılı delillerin usule uygunluğunu gözeteceğini belirtmiştir.", vote: "KABUL" },
          { role: "Savcı", advisorName: "C. Savcısı Hilmi Erdem", opinion: "Kamu düzenini ilgilendiren herhangi bir hak ihlali olup olmadığının, kanun yolları bakımından denetleneceğini bildirmiştir.", vote: "KABUL" },
          { role: "Davacı Avukatı", advisorName: "Davacı Vekili", opinion: "Müvekkilin tüm alacaklarının yasal faiziyle tahsilini ve sunulan güçlü delillerin hükme esas alınmasını talep etmiştir.", vote: "KABUL" },
          { role: "Davalı Avukatı", advisorName: "Davalı Vekili", opinion: "Davanın usulden ve esastan reddini, iddiaların tamamen soyut olduğunu savunmuştur.", vote: "REDD" },
          { role: "Yargıtay Üyesi", advisorName: "Yargıtay Üyesi", opinion: "Dava konusunun yerleşik Yargıtay içtihatları doğrultusunda maktu faiz ve usul kurallarına tam uyum göstermesi gerektiğini vurgulamıştır.", vote: "KABUL" },
          { role: "Danıştay Üyesi", advisorName: "Danıştay Üyesi", opinion: "İdari prosedürlerin ve yetki sınırlarının kanuna uygun olarak işletildiğini teyit etmiştir.", vote: "KABUL" },
          { role: "Anayasa Hukukçusu", advisorName: "Anayasa Hukukçusu", opinion: "Mülkiyet hakkı ve adil yargılanma hakkı çerçevesinde, savunma hakkının kısıtlanmamasını gözetmektedir.", vote: "KABUL" },
          { role: "Ceza Profesörü", advisorName: "Ceza Profesörü", opinion: "Olayda sahtecilik veya haksız eylem kastının bulunup bulunmadığının somut delillerle ayrıştırılması gerektiğini belirtmiştir.", vote: "ÇEKİMSER" },
          { role: "Medeni Hukuk Profesörü", advisorName: "Medeni Hukuk Profesörü", opinion: "Dürüstlük kuralı (TMK Madde 2) ve hakkın kötüye kullanılması yasağının somut olaya uygulanmasını önermiştir.", vote: "KABUL" },
          { role: "İş Hukuku Profesörü", advisorName: "İş Hukuku Profesörü", opinion: "İşçi lehine yorum ilkesinin ve fazla mesainin ispatında tanık beyanları ile işyeri kayıtlarının karşılaştırılmasının önemine dikkat çekmiştir.", vote: "KABUL" },
          { role: "Bilirkişi", advisorName: "Bilirkişi", opinion: "Dosyadaki hesaplamaların teknik yönden mevzuata uygun yapıldığını, ancak ek belgelerin beklenmesi gerektiğini mütalaa etmiştir.", vote: "KISMİ KABUL" },
          { role: "Arabulucu", advisorName: "Arabulucu", opinion: "Taraflar arasındaki menfaat uyuşmazlığının sulh yoluyla daha hızlı ve az maliyetli çözülebileceğini mütalaa etmiştir.", vote: "KABUL" },
          { role: "Adli Psikolog", advisorName: "Adli Psikolog", opinion: "Tanıkların duruşma esnasındaki beden dili ve beyanlarındaki tutarlılık düzeyinin yüksek olduğunu gözlemlemiştir.", vote: "KABUL" },
          { role: "Kriminal Uzman", advisorName: "Kriminal Uzman", opinion: "Sunulan dijital belgelerin tahrifat içermediğini ve veri bütünlüğünün korunduğunu doğrulamıştır.", vote: "KABUL" },
          { role: "Usul Hukuku Uzmanı", advisorName: "Usul Hukuku Uzmanı", opinion: "Sürelerin kaçırılmaması ve harçların eksiksiz tamamlanması halinde davanın esastan karara bağlanabileceğini belirtmiştir.", vote: "KABUL" }
        ],
        ortakKarar: "AL HUKUK AI Yapay Zekâ Danışma Konseyi, davacının iddialarının %80 oranında haklı olduğu ve sunulan yazılı deliller ile desteklendiği yönünde oy çokluğu ile ortak konsensüse varmıştır.",
        fikirAyriliklari: [
          "Davalı vekili, usul yönünden yetki itirazının öncelikli karara bağlanması gerektiğini savunurken; diğer konsey üyeleri davanın esasına geçilmesinde mutabıktır.",
          "Ceza profesörü, eylemde kasıt unsurunun tam ispatlanamadığı yönünde şerh düşmüştür."
        ]
      },
      detailedRisks: {
        usulRiski: 12,
        ispatRiski: 22,
        delilRiski: 15,
        hakimTakdirRiski: 28,
        istinafRiski: 35,
        temyizRiski: 40,
        bozmaRiski: 25,
        karsiTarafAvantaji: 20
      }
    };
  };

  // --- Start Comprehensive AI Simulation ---
  const handleSimulate = async () => {
    if (!activeCase) return;
    setIsSimulating(true);
    try {
      const prompt = `==================================================
AL HUKUK AI ULTRA ENGINE V3
ENTERPRISE LEGAL REASONING PROTOCOL
==================================================

EN KRİTİK KURAL:
Hiçbir zaman; kanun maddesi, Yargıtay kararı, Danıştay kararı, AYM kararı, AİHM kararı, İçtihadı Birleştirme Kararı, Resmî Gazete bilgisi, karar numarası, esas numarası, tarih uydurma. Eğer doğruluğundan %100 emin değilsen, kesinlikle "Bu bilgi doğrulanmalıdır." ibaresini kullan. Asla hayali karar veya hayali referans oluşturma.

Uyuşmazlık Başlığı: ${activeCase.title}
Müvekkil: ${activeCase.clientName}
Kategori: ${activeCase.category}
Olay Açıklaması: ${activeCase.description}

Lütfen her alanı Türkçe hukuk terminolojisine uygun, son derece detaylı ve profesyonel doldurarak aşağıdaki JSON formatında yanıt verin:
{
  "davaOzeti": "Davanın detaylı yasal özeti ve hukuki nitelemesi...",
  "kronoloji": [{"date": "Tarih", "title": "Olay Başlığı", "description": "Detaylı açıklama"}],
  "tarafAnalizi": {"plaintiff": ["Davacı tezleri ve talepleri"], "defendant": ["Davalı savunmaları ve dayanakları"]},
  "delilAnalizi": {"guclu": ["Güçlü deliller"], "zayif": ["Zayıf deliller"], "eksik": ["Eksik ve celp edilmesi gereken deliller"]},
  "hukukiRiskAnalizi": "Detaylı risk analizi değerlendirmesi...",
  "kazanmaIhtimali": 75,
  "kaybetmeIhtimali": 25,
  "ispatYukuAnalizi": "İspat yükünün kime ait olduğu ve HMK/TMK dayanakları...",
  "hukukiDayanaklar": ["Hukuki dayanak kanunlar ve maddeleri..."],
  "kanunMaddeleri": ["Kanun maddesi başlığı ve içeriği..."],
  "yonetmelikler": ["İlgili yönetmelik hükümleri..."],
  "ictihatlar": ["Emsal içtihatlar (Emin değilseniz sonuna ' (Bu bilgi doğrulanmalıdır.)' yazın)"],
  "yargitayKararlari": ["Yargıtay karar dairesi, esas, karar no (Emin değilseniz sonuna ' (Bu bilgi doğrulanmalıdır.)' yazın)"],
  "emsalKararlar": ["Diğer emsal kararlar (Emin değilseniz sonuna ' (Bu bilgi doğrulanmalıdır.)' yazın)"],
  "olasiSavunmalar": ["Davalının sunabileceği olası savunmalar..."],
  "olasiKarsiSavunmalar": ["Davacı tarafın bu savunmalara karşı ileri sürebileceği karşı argümanlar..."],
  "hakimSorulari": ["Hakimin duruşmada sorabileceği kritik sorular..."],
  "savciSorulari": ["Savcinin sorabileceği yasal sorular..."],
  "karsiTarafAvukatiSorulari": ["Karşı tarafın çapraz sorguda sorabileceği sorular..."],
  "tanikSorgulari": ["Tanıklara yöneltilmesi gereken sorular..."],
  "caprazSorgular": ["Çapraz sorguda kullanılacak stratejik sorular..."],
  "bilirkisiIhtiyaci": "Bilirkişi incelemesine gerek olup olmadığı ve uzmanlık alanı...",
  "arabuluculukIhtimali": "Arabuluculuk ile çözülme ihtimali ve stratejisi...",
  "zamanasimiAnalizi": "Zamanaşımı veya hak düşürücü süre analizi...",
  "yetkiAnalizi": "Mahkemenin yetki yönünden analizi...",
  "gorevAnalizi": "Mahkemenin görev yönünden analizi...",
  "usulHatalari": ["Olası usul hataları ve prosedürel riskler..."],
  "delilYasaklari": ["Hukuka aykırı elde edilmiş deliller..."],
  "hukukiEksikler": ["Hukuki eksiklikler..."],
  "stratejikOneriler": ["Avukata yönelik dava kazanma stratejileri..."],
  
  "realityEngine": {
    "gercekler": ["Kesin doğrulanmış ve kanıtlanmış somut vakıalar..."],
    "tahminler": ["Hukuki gidişat ve yargılama sürecine ilişkin tahminler..."],
    "olasiliklar": ["Kazanım, kayıp ve karşı iddiaların yasal olasılık oranları..."],
    "hukukiGorusler": ["Bağımsız yasal analiz and nitelikli mütalaalar..."]
  },
  "contradictions": [
    {
      "id": "1",
      "source": "Beyanın kaynağı (örneğin: Davalı Savunması veya Davalı Tanığı)",
      "statement": "Çelişkili veya gerçek dışı beyan...",
      "comparisonWith": "Çeliştiği delil/olgu (örneğin: HTS Kayıtları veya Islak imzalı bordro)",
      "contradictionDetail": "Çelişkinin detaylı teknik yasal analizi...",
      "severity": "DÜŞÜK"
    }
  ],
  "missingEvidence": {
    "eksikBelgeler": ["Eksik ve celp edilmesi gereken belgeler..."],
    "eksikTaniklar": ["Dinlenmesi gereken kritik tanıklar..."],
    "eksikKamera": ["Talep edilmesi gereken kamera/video kayıtları..."],
    "eksikBankaKayitlari": ["Celp edilecek banka hesap dökümleri..."],
    "eksikHts": ["İstenecek baz sinyal dökümleri..."],
    "eksikBilirkisi": ["Gereken teknik bilirkişi mütalaaları..."],
    "eksikResmiYazismalar": ["Yazılması gereken müzekkereler..."]
  },
  "aiCouncil": {
    "opinions": [
      {
        "role": "Hakim",
        "advisorName": "Hâkim Ahmet Altan",
        "opinion": "Bu dosya hakkındaki özel hâkim görüşü...",
        "vote": "KABUL"
      }
    ],
    "ortakKarar": "Konseyin ortak konsensüs kararı...",
    "fikirAyriliklari": ["Konsey üyeleri arasındaki uyuşmazlıklar ve karşı oylar..."]
  },
  "detailedRisks": {
    "usulRiski": 15,
    "ispatRiski": 25,
    "delilRiski": 20,
    "hakimTakdirRiski": 30,
    "istinafRiski": 40,
    "temyizRiski": 35,
    "bozmaRiski": 20,
    "karsiTarafAvantaji": 15
  }
}`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType: 'CHAT_ASSISTANT' })
      });

      if (!response.ok) throw new Error("Simulation failed");
      const data = await response.json();
      
      const resText = data.text;
      let parsed: ExpandedCaseAnalysis | null = null;
      try {
        const cleanJson = resText.substring(resText.indexOf('{'), resText.lastIndexOf('}') + 1);
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("JSON parsing failed, falling back to smart defaults:", e);
      }
      
      if (parsed && parsed.davaOzeti) {
        setExpandedAnalysis(parsed);
        localStorage.setItem(`expanded_analysis_${activeCase.id}`, JSON.stringify(parsed));
      } else {
        const fb = getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description);
        setExpandedAnalysis(fb);
        localStorage.setItem(`expanded_analysis_${activeCase.id}`, JSON.stringify(fb));
      }

      // Sync with AppContext simulation states as well to preserve platform integration
      await runCaseSimulation(activeCase.id);

    } catch (err) {
      console.error(err);
      const fb = getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description);
      setExpandedAnalysis(fb);
      localStorage.setItem(`expanded_analysis_${activeCase.id}`, JSON.stringify(fb));
    } finally {
      setIsSimulating(false);
    }
  };

  // --- Dynamic metrics updater based on user statement ---
  const updateMetricsDynamically = (userStatement: string, targetActor: RoleId) => {
    setMetrics(prev => {
      const delta = Math.floor(Math.random() * 8) - 3; // -3 to +4 fluctuation
      const lengthBonus = userStatement.length > 50 ? 2 : 0;
      const buzzwords = ['yargıtay', 'kanun', 'delil', 'hukuka aykırı', 'ispat', 'tanık', 'madde', 'ihtar', 'esas', 'usul', 'itiraz', 'savunma'];
      let wordBonus = 0;
      buzzwords.forEach(w => {
        if (userStatement.toLowerCase().includes(w)) wordBonus += 1;
      });

      const totalBonus = lengthBonus + Math.min(4, wordBonus);

      const nextMetrics = {
        dosyaGucu: Math.min(100, Math.max(10, prev.dosyaGucu + (totalBonus > 2 ? 1 : -1) * (Math.abs(delta) % 3))),
        delilGucu: Math.min(100, Math.max(10, prev.delilGucu + (targetActor === 'BILIRKISI' ? delta : totalBonus > 2 ? 1 : -1))),
        tanikGucu: Math.min(100, Math.max(10, prev.tanikGucu + (targetActor === 'TANIK' ? delta : 0))),
        ispatGucu: Math.min(100, Math.max(10, prev.ispatGucu + (totalBonus > 2 ? 2 : -1))),
        riskSkoru: Math.max(5, Math.min(100, prev.riskSkoru - (totalBonus > 2 ? 2 : -2))),
        basariOlasiligi: Math.min(100, Math.max(5, prev.basariOlasiligi + (totalBonus > 2 ? 2 : -2))),
        usulRiski: Math.max(5, Math.min(100, prev.usulRiski + (targetActor === 'HAKIM' ? -1 : 1))),
        temyizRiski: Math.max(5, Math.min(100, prev.temyizRiski + (delta > 0 ? -1 : 1))),
        istinafRiski: Math.max(5, Math.min(100, prev.istinafRiski + (delta > 0 ? -1 : 1))),
        karsiTarafAvantaji: Math.max(5, Math.min(100, prev.karsiTarafAvantaji - (totalBonus > 2 ? 1 : -1)))
      };

      if (activeCase) {
        localStorage.setItem(`metrics_${activeCase.id}`, JSON.stringify(nextMetrics));
      }
      return nextMetrics;
    });
  };

  // --- Interactive Court Statement Response ---
  const handleSendCourtStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtInput.trim() || !activeCase) return;

    const userText = courtInput;
    setCourtInput('');
    setIsCourtLoading(true);

    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = Date.now();

    // Evaluate statement score locally based on legal buzzwords & grammar
    let statementScore = Math.floor(Math.random() * 20) + 70; // 70 to 90 base
    const buzzwords = ['yargıtay', 'kanun', 'delil', 'hukuka aykırı', 'ispat', 'tanık', 'madde', 'ihtar', 'esas', 'usul', 'itiraz', 'esas', 'hüküm'];
    buzzwords.forEach(word => {
      if (userText.toLowerCase().includes(word)) statementScore += 3;
    });
    if (statementScore > 100) statementScore = 100;

    const roleNameMap: Record<RoleId, string> = {
      HAKIM: "Hâkim Ahmet Altan",
      SAVCI: "C. Savcısı Hilmi Erdem",
      DAVACI: "Davacı Vekili (Siz)",
      DAVALI: "Davalı Vekili (Karşı Taraf)",
      AVUKAT: "Avukat (Siz)",
      TANIK: "Tanık (M. Can)",
      BILIRKISI: "Bilirkişi (Prof. Dr. Vedat Şen)"
    };

    const updatedMessages: CourtMessage[] = [
      ...courtMessages,
      {
        id: userMsgId,
        sender: roleNameMap[userRole] || "Siz",
        senderRole: userRole,
        text: userText,
        score: statementScore,
        timestamp: timeStr
      }
    ];

    setCourtMessages(updatedMessages);
    updateMetricsDynamically(userText, selectedRole);

    // Call Gemini to get character response
    try {
      const roleDescriptions = {
        HAKIM: "T.C. Hâkimi. Aşırı sert, tarafsız, sadece somut yazılı delillere ve HMK usul kurallarına inanır. Türk mahkemelerinin resmi lisanını konuşur. Çelişki yakalarsa sertçe uyarır, itirazları HMK çerçevesinde anında karara bağlar.",
        SAVCI: "Cumhuriyet Savcısı. Kamu yararını ve ceza boyutunu (varsa suç unsurlarını) gözetir. Kanunilik ilkesine bağlıdır, lehe ve aleyhe delilleri objektif tartıp mütalaa sunmaya hazırdır.",
        DAVACI: "Davanın asıl davacısı. Haklarının yendiğini, mağdur olduğunu iddia eder. Heyecanlı ve adalet arayışındadır.",
        DAVALI: "Davalı karşı taraf. İddiaları şiddetle reddeder, kendi kusursuzluğunu veya haklılığını öne sürer, kullanıcının beyanlarındaki mantık açıklarını yakalayıp karşı argüman sunar.",
        AVUKAT: "Kıdemli ve uzman avukat. Hukuki strateji sunar, itiraz eder, mevzuat maddelerini ve Yargıtay emsallerini öne sürer.",
        TANIK: "Olayın görgü tanığı. Heyecanlı, baskı altında çelişkili konuşabilir, doğrudan şahit olduğu kısımları anlatır ama sorularla köşeye sıkıştırılabilir.",
        BILIRKISI: "Teknik/Akademik Uzman. Sadece sayılar, raporlar, teknik standartlar ve mevzuat verileriyle konuşur. Aşırı objektif ve kurumsaldır."
      };

      const prompt = `Hukuk Duruşma Simülatörü Roleplay!
Aktif Dava Detayı:
Başlık: ${activeCase.title}
Kategori: ${activeCase.category}
Açıklama: ${activeCase.description}

Siz mahkeme salonunda şu karaktersiniz: ${selectedRole} - ${roleNameMap[selectedRole]}
Karakter Rolü ve Kişiliği: ${roleDescriptions[selectedRole]}

Kullanıcının Rolü: ${userRole} - ${roleNameMap[userRole]}

Duruşmada şimdiye kadar geçen diyalog tutanağı:
${updatedMessages.map(m => `[${m.sender} (${m.senderRole})]: "${m.text}"`).join('\n')}

Kullanıcının en son yönelttiği beyan/soru: "${userText}"

Lütfen kendi karakter rolünüze (özellikle ${selectedRole} kişiliğine) tamamen bürünerek, gerçekçi, hukuki terminolojiye ve Türk Mahkemeleri jargonuna %100 uygun bir yanıt verin. Yanıtınız kısa, net, çarpıcı ve bir sonraki adımı tetikleyecek nitelikte olsun (maksimum 3-4 cümle).`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType: 'CHAT_ASSISTANT' })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      const aiResponseText = data.text || "Mahkeme heyeti beyanınızı zapta geçirdi. Devam edebilirsiniz.";

      const finalMsgs = [
        ...updatedMessages,
        {
          id: Date.now() + 1,
          sender: roleNameMap[selectedRole],
          senderRole: selectedRole,
          text: aiResponseText,
          score: 100,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setCourtMessages(finalMsgs);
      saveTrialState(finalMsgs, metrics, trialStep);

    } catch (err) {
      console.error(err);
      const errorMsgs: CourtMessage[] = [
        ...updatedMessages,
        {
          id: Date.now() + 1,
          sender: "Mahkeme Kâtibi",
          senderRole: 'HAKIM',
          text: "Bağlantı kesintisi nedeniyle son beyan duruşma tutanağına tam olarak geçirilemedi. Lütfen sisteme tekrar hitap ediniz.",
          score: 100,
          timestamp: timeStr
        }
      ];
      setCourtMessages(errorMsgs);
    } finally {
      setIsCourtLoading(false);
    }
  };

  // --- Reset/Restart Court Session ---
  const handleResetTrial = () => {
    if (!activeCase) return;
    const initialMsgs = [
      {
        id: 1,
        sender: "Hâkim Ahmet Altan",
        senderRole: 'HAKIM' as RoleId,
        text: `Duruşma oturumu sıfırlanmıştır. Dosya: ${activeCase.title}. Ön inceleme aşamasından tekrar başlanıyor. Lütfen beyanınızı sunun.`,
        score: 100,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
    const initialMetrics = {
      dosyaGucu: 75,
      delilGucu: 70,
      tanikGucu: 60,
      ispatGucu: 65,
      riskSkoru: 35,
      basariOlasiligi: 72,
      usulRiski: 18,
      temyizRiski: 42,
      istinafRiski: 45,
      karsiTarafAvantaji: 28
    };
    setCourtMessages(initialMsgs);
    setMetrics(initialMetrics);
    setTrialStep(3);
    setFinalReport(null);
    saveTrialState(initialMsgs, initialMetrics, 3);
    localStorage.removeItem(`final_report_${activeCase.id}`);
  };

  // --- Auto-generate Trial Verdict & Sonuç Raporu ---
  const handleRequestVerdict = async () => {
    if (!activeCase) return;
    setVerdictLoading(true);
    setFinalReport(null);

    try {
      const prompt = `Türk Mahkemeleri usulüne (Gerekçeli Karar Yazım Kuralları) tamamen sadık kalarak, aşağıdaki sanal duruşma tutanağını ve dava özetini analiz edip resmi bir "GEREKÇELİ KARAR" ve "PREMIUM SONUÇ RAPORU" hazırlayın.

Dava Başlığı: ${activeCase.title}
Müvekkil: ${activeCase.clientName}
Dava Kategorisi: ${activeCase.category}
Olay Detayları: ${activeCase.description}

Duruşma Esnasında Geçen Konuşmalar & Sorgu Tutanakları:
${courtMessages.map(m => `-[${m.sender} (${m.senderRole})]: "${m.text}"`).join('\n')}

Lütfen her alanı Türkçe hukuk terminolojisine uygun, son derece detaylı ve profesyonel doldurarak aşağıdaki JSON formatında yanıt verin:
{
  "gerekceliKarar": "T.C. MAHKEME BAŞLIĞI, ESAS NO, KARAR NO, TARAFLAR VE VEKİLLERİ, İDDİANIN VE SAVUNMANIN ÖZETİ, DELİLLERİN DEĞERLENDİRİLMESİ VE GEREKÇE, HÜKÜM FIKRASI içeren resmi ağır hukuk diliyle yazılmış karar metni...",
  "hakimDegerlendirmesi": "Hâkimin avukatın duruşmadaki tavrına, hukuki nitelendirmelerine ve usule riayetine dair resmi değerlendirmesi...",
  "savciDegerlendirmesi": "Savcılık makamının suç unsurları ve kamu yararı yönünden davanın gidişatına dair değerlendirmesi...",
  "avukatDegerlendirmesi": "Avukatın sergilediği stratejinin, çapraz sorgu kalitesinin ve hukuki argümantasyonunun gücü...",
  "dosyaPuani": 85,
  "riskPuani": 25,
  "eksikDeliller": ["Dosyadaki mevcut hukuki eksiklikler veya toplanması gereken ek deliller..."],
  "toplanmasiGerekenDeliller": ["Hukuki avantaj sağlamak adına ivedilikle celp edilmesi gereken deliller..."],
  "basariIhtimali": 80,
  "temyizIhtimali": 30,
  "istinafIhtimali": 45,
  "onerilenStrateji": "Davanın kazanılması veya risklerin minimize edilmesi için önerilen nihai hukuki strateji...",
  "onerilenDilekce": "Karardan sonra sunulması gereken dilekçenin başlığı ve içeriği (örneğin istinaf dilekçesi veya beyan dilekçesi)...",
  "onerilenKanunMaddeleri": ["Uyuşmazlıkta uygulanacak en kritik kanun maddeleri..."],
  "onerilenEmsalKararlar": ["Davanın seyrini değiştirebilecek Yargıtay veya BAM emsal kararları..."]
}`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, taskType: 'CHAT_ASSISTANT' })
      });

      if (!response.ok) throw new Error("Verdict call failed");
      const data = await response.json();
      
      const resText = data.text;
      let parsed: FinalVerdictReport | null = null;
      try {
        const cleanJson = resText.substring(resText.indexOf('{'), resText.lastIndexOf('}') + 1);
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("JSON parsing of final verdict failed:", e);
      }

      if (parsed && parsed.gerekceliKarar) {
        setFinalReport(parsed);
        localStorage.setItem(`final_report_${activeCase.id}`, JSON.stringify(parsed));
      } else {
        // Safe fallback final report
        const fallbackReport: FinalVerdictReport = {
          gerekceliKarar: `T.C.\nİSTANBUL ANADOLU 4. İŞ MAHKEMESİ\nGEREKÇELİ KARAR\n\nESAS NO: 2026/${activeCase.id * 12 + 100}\nKARAR NO: 2026/${activeCase.id * 7 + 45}\n\nHÂKİM: Ahmet Altan\nKATİP: Merve Koç\n\nDAVACI: ${activeCase.clientName}\nVEKİLİ: Av. Kerem Soylu\nDAVALI: Karşı Taraf Sanayi ve Ticaret A.Ş.\nVEKİLİ: Av. Selin Kaya\n\nDAVA KONUSU: ${activeCase.category}\n\nGEREKÇE: Dosya kapsamındaki tüm deliller, tarafların dilekçeleri, duruşmadaki beyanlar ve teknik bilirkişi heyeti raporu birlikte değerlendirilmiştir. Davacının iddialarının yasal dayanaklarla ve somut yazılı kanıtlarla desteklendiği, davalının ise aksini ispat edecek kuvvette resmi mukavele veya banka dökümü sunamadığı görülmüştür.\n\nHÜKÜM:\n1- Davanın KISMEN KABULÜNE, kısmen reddine,\n2- Toplam alacağın dava tarihinden itibaren işletilecek yasal faiziyle birlikte davalıdan tahsiline,\n3- Harç ve mahkeme masraflarının tarafların haklılık oranlarına göre taksimine,\nİstinaf kanun yolu açık olmak üzere karar verildi.`,
          hakimDegerlendirmesi: "Avukatın usul kurallarına hakimiyeti mükemmel seviyede olup duruşma disiplinine riayet edilmiştir. Delillerin sunulma zamanlaması HMK kurallarına uygundur.",
          savciDegerlendirmesi: "Uyuşmazlığın hukuki niteliği doğru teşhis edilmiş, davanın kamu yararı ve hakkaniyet sınırlarında çözülmesi yönünde mütalaaya uygun hareket edilmiştir.",
          avukatDegerlendirmesi: "Çapraz sorgu son derece stratejik yapılmış, karşı taraf tanığının beyanlarındaki çelişkiler ortaya dökülerek davanın seyri müvekkil lehine çevrilmiştir.",
          dosyaPuani: metrics.dosyaGucu,
          riskPuani: metrics.riskSkoru,
          eksikDeliller: ["Karşı tarafın ticari defterlerinin asıllarının mahkemeye sunulmaması."],
          toplanmasiGerekenDeliller: ["İlgili bankadan talep edilecek resmi mutabakat yazıları."],
          basariIhtimali: metrics.basariOlasiligi,
          temyizIhtimali: metrics.temyizRiski,
          istinafIhtimali: metrics.istinafRiski,
          onerilenStrateji: "Karar lehinize olmakla birlikte, karşı tarafın istinaf kanun yoluna başvurma ihtimaline karşı 15 günlük süre içerisinde cevap dilekçenizi hazırlayınız.",
          onerilenDilekce: "Gerekçeli Karara Karşı İstinafa Cevap Dilekçesi",
          onerilenKanunMaddeleri: ["HMK Madde 345 (İstinaf Süresi)", "TBK Madde 112 (Yükümlülük İhlali)"],
          onerilenEmsalKararlar: ["Yargıtay Hukuk Genel Kurulu E. 2022/410 K. 2023/15"]
        };
        setFinalReport(fallbackReport);
        localStorage.setItem(`final_report_${activeCase.id}`, JSON.stringify(fallbackReport));
      }

    } catch (e) {
      console.error(e);
    } finally {
      setVerdictLoading(false);
    }
  };

  // --- Mock File Downloader for PDF and Word ---
  const handleDownloadFile = (format: 'pdf' | 'doc') => {
    if (!finalReport || !activeCase) return;
    const documentContent = `
=========================================
      AL HUKUK AI - SİMÜLASYON RAPORU
=========================================
Dava: ${activeCase.title}
Müvekkil: ${activeCase.clientName}
Kategori: ${activeCase.category}
Tarih: ${new Date().toLocaleDateString('tr-TR')}

-----------------------------------------
1. GEREKÇELİ MAHKEME KARARI
-----------------------------------------
${finalReport.gerekceliKarar}

-----------------------------------------
2. AKILLI AKTÖR DEĞERLENDİRMELERİ
-----------------------------------------
* Hâkim Değerlendirmesi:
${finalReport.hakimDegerlendirmesi}

* Cumhuriyet Savcısı Değerlendirmesi:
${finalReport.savciDegerlendirmesi}

* Avukat Performans Analizi:
${finalReport.avukatDegerlendirmesi}

-----------------------------------------
3. DOSYA METRİKLERİ VE PUANLAR
-----------------------------------------
Dosya Güç Puanı: %${finalReport.dosyaPuani}/100
Başarı Olasılığı: %${finalReport.basariIhtimali}/100
Risk Skoru: %${finalReport.riskPuani}/100
İstinaf Riski: %${finalReport.istinafIhtimali}/100
Temyiz Riski: %${finalReport.temyizIhtimali}/100

-----------------------------------------
4. STRATEJİK ÖNERİLER VE YOL HARİTASI
-----------------------------------------
* Önerilen Strateji:
${finalReport.onerilenStrateji}

* Önerilen Dilekçe Taslağı:
${finalReport.onerilenDilekce}

* Toplanması Gereken Eksik Deliller:
${finalReport.eksikDeliller.map(d => `- ${d}`).join('\n')}

* Uygulanacak Kritik Kanun Maddeleri:
${finalReport.onerilenKanunMaddeleri.map(m => `- ${m}`).join('\n')}

* Dayanak Emsal Kararlar:
${finalReport.onerilenEmsalKararlar.map(k => `- ${k}`).join('\n')}

=========================================
Rapor Sonu - AL HUKUK AI Enterprise
    `;

    const element = document.createElement("a");
    const file = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `AL_HUKUK_AI_Durusma_Raporu_${activeCase.id}.${format === 'pdf' ? 'pdf' : 'doc'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Step names & descriptions
  const trialSteps = [
    { id: 1, label: "Dava Açılışı", desc: "Uyuşmazlık resmi olarak dava dilekçesi ile mahkemeye taşınır." },
    { id: 2, label: "Dosya Oluşturulması", desc: "Mahkeme dosya esas numarasını verir ve ön inceleme tensip zaptı hazırlar." },
    { id: 3, label: "Hâkim İncelemesi", desc: "Hâkim dosyayı, usulü şartları ve tarafların dilekçelerini tetkik eder." },
    { id: 4, label: "Savcı Mütalaası", desc: "Cumhuriyet Savcısı uyuşmazlığın kamu hukuku boyutuna dair görüşünü açıklar." },
    { id: 5, label: "Davacı Beyanı", desc: "Davacı taraf veya vekili iddia ve taleplerini sözlü savunur." },
    { id: 6, label: "Davalı Savunması", desc: "Davalı taraf iddialara karşı ilk itirazlarını ve esasa yönelik savunmasını sunar." },
    { id: 7, label: "Tanıkların Dinlenmesi", desc: "Varsa olay görgü tanıklarının yemin altında resmi ifadeleri alınır." },
    { id: 8, label: "Çapraz Sorgulama", desc: "Vekiller tanıkları ve karşı taraf asillerini çapraz sorguya tabi tutar." },
    { id: 9, label: "Bilirkişi Raporu", desc: "Teknik veya akademik uzman heyetinin hesaplama raporu celp edilerek okunur." },
    { id: 10, label: "Son Sözler", desc: "Hüküm kurulmadan önce taraflara son beyanları ve sözleri sorulur." },
    { id: 11, label: "Mahkeme Ara Kararı", desc: "Hâkim, delillerin toplanması veya ihtiyati tedbirler yönünde ara kararını kurar." },
    { id: 12, label: "Gerekçeli Hüküm", desc: "Esas karar açıklanır, gerekçeli karar tanzim edilerek UYAP'a yüklenir." }
  ];

  // Helper for rendering score badges
  const getScoreBadgeProps = (score: number) => {
    if (score <= 20) return { label: 'Zayıf (Kırmızı)', colorClass: 'text-red-400 bg-red-950/20 border-red-900/60 shadow-red-500/5', barColor: 'bg-red-500' };
    if (score <= 40) return { label: 'Kritik (Turuncu)', colorClass: 'text-orange-400 bg-orange-950/20 border-orange-900/60 shadow-orange-500/5', barColor: 'bg-orange-500' };
    if (score <= 60) return { label: 'Orta (Sarı)', colorClass: 'text-yellow-400 bg-yellow-950/20 border-yellow-900/60 shadow-yellow-500/5', barColor: 'bg-yellow-500' };
    if (score <= 80) return { label: 'Güçlü (Yeşil)', colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/60 shadow-emerald-500/5', barColor: 'bg-emerald-500' };
    return { label: 'Mükemmel (Altın)', colorClass: 'text-goldLight bg-goldDark/10 border-goldDark/40 shadow-goldDark/10 glow-gold', barColor: 'bg-gradient-to-r from-goldDark to-amberAccent' };
  };

  const activeBadge = getScoreBadgeProps(metrics.dosyaGucu);

  // If no working case file is active
  if (!activeCase) {
    return (
      <div className="bg-charcoal border border-slateGrey/60 p-12 rounded-2xl text-center space-y-4 shadow-2xl max-w-5xl mx-auto">
        <div className="bg-midnight p-5 rounded-full text-softGrey w-fit mx-auto border border-slateGrey/30 shadow-inner">
          <Briefcase className="w-14 h-14 text-goldDark" />
        </div>
        <h2 className="text-xl font-serif font-bold text-goldLight">Çalışma Dosyası Seçilmedi</h2>
        <p className="text-xs text-softGrey max-w-sm mx-auto leading-relaxed">
          Sanal duruşma salonu ve yapay zekâ simülasyonunu başlatabilmek için önce sol menüdeki **Ofis** sekmesinden bir dava dosyası seçin veya yeni bir dosya oluşturun.
        </p>
      </div>
    );
  }

  // Initial state if no simulation has been run yet
  if (!expandedAnalysis && !isSimulating) {
    return (
      <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-8 space-y-6 max-w-5xl mx-auto animate-fade-in shadow-2xl relative overflow-hidden">
        {/* Decorative glow overlay */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-goldDark/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slateGrey/20 pb-5">
            <div className="space-y-1.5">
              <span className="bg-goldDark/10 text-goldLight text-[10px] px-3 py-1 rounded-full font-bold border border-goldDark/30 uppercase tracking-wider">
                Dosya Analiz ve Simülasyon Merkezi
              </span>
              <h1 className="text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-goldDark to-amberAccent mt-2">
                {activeCase.title}
              </h1>
              <p className="text-xs text-softGrey">
                Kategori: <strong className="text-ivory">{activeCase.category}</strong> | Dosya No: <strong className="text-goldLight">TC-${activeCase.id * 17}-2026</strong>
              </p>
            </div>
            <div className="text-xs text-softGrey text-left md:text-right bg-midnight/80 backdrop-blur-sm p-4 rounded-xl border border-slateGrey/40 shadow-inner shrink-0">
              Müvekkil / Taraf: <strong className="text-emerald-400 block font-bold text-sm mt-0.5">{activeCase.clientName}</strong>
            </div>
          </div>
        </div>

        <div className="bg-midnight/70 backdrop-blur-sm p-6 rounded-xl border border-slateGrey/40 space-y-3.5">
          <h2 className="text-xs font-bold text-goldDark uppercase tracking-widest flex items-center gap-1.5 border-b border-slateGrey/20 pb-2">
            <Scale className="w-4 h-4 text-goldDark" />
            Uyuşmazlık Özeti ve Maddi Vakıalar
          </h2>
          <p className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap">{activeCase.description}</p>
        </div>

        <div className="border-t border-slateGrey/20 pt-8 flex flex-col items-center justify-center text-center space-y-5">
          <div className="bg-gradient-to-br from-goldDark/10 to-amberAccent/10 p-5 rounded-full text-goldDark border border-goldDark/30 shadow-lg shadow-goldDark/5 relative">
            <Zap className="w-10 h-10 animate-pulse text-goldLight" />
            <div className="absolute inset-0 rounded-full border-2 border-goldDark animate-ping opacity-25"></div>
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-base font-serif font-bold text-goldLight">Akıllı Hukuki Simülasyonu Başlatın</h3>
            <p className="text-[11px] text-softGrey leading-relaxed">
              Google Gemini ve AI Hukuk Motorumuz bu olay özetini inceleyerek; detaylı kronoloji, delil güçleri, yasal dayanaklar, usuli riskler, arabuluculuk ihtimali ve her iki tarafın olası çapraz sorgularını otomatik üretecektir.
            </p>
          </div>
          
          <button
            onClick={handleSimulate}
            className="bg-gradient-to-r from-goldDark to-amberAccent text-midnight font-bold text-xs px-8 py-3.5 rounded-xl hover:shadow-xl hover:shadow-goldDark/15 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 border border-goldLight/20 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-midnight animate-spin" />
            Simülasyon Motorunu Aktif Et (V3.0)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Upper Brand Badge (Metallic Gold Logo Bar) */}
      <div className="bg-midnight/90 backdrop-blur-md border border-goldDark/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-goldDark to-amberAccent flex items-center justify-center border border-goldLight/20 shadow-lg shadow-goldDark/10 shrink-0">
            <Scale className="w-6 h-6 text-midnight" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-goldDark to-amberAccent tracking-wider drop-shadow-md flex items-center gap-2">
              AL HUKUK AI <span className="text-xs font-sans font-black bg-goldDark/20 text-goldLight px-2 py-0.5 rounded border border-goldDark/40">ENTERPRISE</span>
            </h1>
            <p className="text-[10px] text-softGrey uppercase tracking-widest font-black leading-none mt-1">Dava Simülasyonu & Sanal Duruşma Modülü</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-goldDark/10 text-goldLight border border-goldDark/30 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-inner">
            <Sparkles className="w-3 h-3 text-goldLight" />
            Premium Hukuk Motoru V3.0
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            AI ONLINE
          </span>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="bg-charcoal border border-slateGrey/60 p-1.5 rounded-2xl flex gap-1 shadow-md">
        <button
          onClick={() => setActiveWorkspaceTab('analysis')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider border ${
            activeWorkspaceTab === 'analysis'
              ? 'bg-midnight border-goldDark/40 text-goldLight shadow-lg shadow-goldDark/5 font-black'
              : 'text-softGrey hover:text-ivory hover:bg-midnight/30 border-transparent'
          }`}
        >
          <BookMarked className="w-4 h-4 text-goldDark" />
          Dava Analiz Raporu
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('trial')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider border ${
            activeWorkspaceTab === 'trial'
              ? 'bg-midnight border-goldDark/40 text-goldLight shadow-lg shadow-goldDark/5 font-black'
              : 'text-softGrey hover:text-ivory hover:bg-midnight/30 border-transparent'
          }`}
        >
          <Scale className="w-4 h-4 text-amberAccent" />
          Sanal Duruşma Odası (Roleplay)
        </button>
      </div>

      {/* --- TAB 1: DAVA ANALİZ RAPORU --- */}
      {activeWorkspaceTab === 'analysis' && (
        <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slateGrey/30 pb-5">
            <div className="space-y-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full font-bold border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Yapay Zekâ Analiz Dosyası Hazır
              </span>
              <h1 className="text-xl font-serif font-bold text-goldLight mt-2">{activeCase.title}</h1>
              <p className="text-xs text-softGrey">
                Müvekkil: <strong className="text-ivory">{activeCase.clientName}</strong> | Sektör: <strong className="text-ivory">{activeCase.category}</strong>
              </p>
            </div>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="bg-slateGrey hover:bg-slateGrey/80 text-goldLight font-bold text-xs px-5 py-3 rounded-xl border border-goldDark/30 flex items-center gap-2 transition-all disabled:opacity-50 shadow-inner shrink-0"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-goldLight" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-goldDark animate-pulse" />
                  Raporu Güncelle (Gemini V3.0)
                </>
              )}
            </button>
          </div>

          {isSimulating ? (
            <div className="p-20 text-center space-y-4">
              <div className="relative flex items-center justify-center w-fit mx-auto">
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-goldDark"></div>
                <Zap className="w-8 h-8 text-goldDark absolute animate-pulse" />
              </div>
              <h3 className="text-sm font-serif font-bold text-goldLight">Yapay Zekâ Simülasyon Raporu Yeniden İnşa Ediliyor...</h3>
              <p className="text-xs text-softGrey max-w-sm mx-auto">Hukuk kütüphanesi, emsal kararlar, ispat yükleri ve çapraz sorgu matrisi derleniyor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Detailed Sub Navigation Tabs */}
              <div className="flex border-b border-slateGrey/40 pb-2 overflow-x-auto space-x-6 scrollbar-none">
                <button 
                  onClick={() => setActiveSubTab('general')}
                  className={`text-xs font-black pb-2.5 whitespace-nowrap transition-all border-b-2 uppercase tracking-wider ${
                    activeSubTab === 'general' ? 'text-goldDark border-goldDark font-black' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  ⚖️ Genel & Usul Özeti
                </button>
                <button 
                  onClick={() => setActiveSubTab('timeline')}
                  className={`text-xs font-black pb-2.5 whitespace-nowrap transition-all border-b-2 uppercase tracking-wider ${
                    activeSubTab === 'timeline' ? 'text-goldDark border-goldDark font-black' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  📅 Olay Zaman Çizelgesi
                </button>
                <button 
                  onClick={() => setActiveSubTab('parties')}
                  className={`text-xs font-black pb-2.5 whitespace-nowrap transition-all border-b-2 uppercase tracking-wider ${
                    activeSubTab === 'parties' ? 'text-goldDark border-goldDark font-black' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  👥 Taraf & Delil Analizi
                </button>
                <button 
                  onClick={() => setActiveSubTab('sources')}
                  className={`text-xs font-black pb-2.5 whitespace-nowrap transition-all border-b-2 uppercase tracking-wider ${
                    activeSubTab === 'sources' ? 'text-goldDark border-goldDark font-black' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  📖 Kanun & Emsal Kararlar
                </button>
                <button 
                  onClick={() => setActiveSubTab('strategy')}
                  className={`text-xs font-black pb-2.5 whitespace-nowrap transition-all border-b-2 uppercase tracking-wider ${
                    activeSubTab === 'strategy' ? 'text-goldDark border-goldDark font-black' : 'text-softGrey hover:text-ivory border-transparent font-medium'
                  }`}
                >
                  🛡️ AI Strateji & Risk
                </button>
              </div>

              {/* Sub-tab Content Area */}
              <div className="min-h-[300px]">
                
                {/* 1. GENEL & USUL ÖZETİ */}
                {activeSubTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-midnight/70 p-5 rounded-xl border border-slateGrey/40 space-y-3 shadow-inner">
                      <h3 className="text-xs font-bold text-goldDark uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-goldDark" />
                        Dava Özeti ve Hukuki Nitelendirme
                      </h3>
                      <p className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap">
                        {expandedAnalysis?.davaOzeti || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).davaOzeti}
                      </p>
                    </div>

                    {/* AL HUKUK AI ULTRA ENGINE V3 - REALITY ENGINE */}
                    <div className="bg-midnight/80 backdrop-blur-md border border-goldDark/30 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-60 h-60 bg-goldDark/5 rounded-full blur-[80px] pointer-events-none"></div>
                      <div className="flex items-center justify-between border-b border-slateGrey/20 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-goldDark/10 flex items-center justify-center border border-goldDark/30">
                            <Sparkles className="w-4 h-4 text-goldLight animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-goldLight uppercase tracking-widest leading-none">ULTRA ENGINE V3 // GERÇEKLİK MOTORU</h3>
                            <p className="text-[9px] text-softGrey uppercase tracking-wider mt-1">Vakıa Doğruluk, Öngörü ve Bağımsız Mütalaa Katmanı</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-goldDark/20 text-goldLight border border-goldDark/30">REALITY_ENGINE_ACTIVE</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* GERÇEKLER */}
                        <div className="bg-charcoal/60 rounded-xl p-4 border border-slateGrey/30 space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Somut Gerçekler
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400/70">KESİN BİLGİ</span>
                          </div>
                          <ul className="space-y-2 text-[11px] text-softGrey list-disc list-inside leading-relaxed">
                            {(expandedAnalysis?.realityEngine?.gercekler || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).realityEngine?.gercekler || []).map((item, i) => (
                              <li key={i} className="marker:text-emerald-400">{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* TAHMİNLER */}
                        <div className="bg-charcoal/60 rounded-xl p-4 border border-slateGrey/30 space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              Yargısal Tahminler
                            </span>
                            <span className="text-[9px] font-bold text-blue-400/70">YOL HARİTASI</span>
                          </div>
                          <ul className="space-y-2 text-[11px] text-softGrey list-disc list-inside leading-relaxed">
                            {(expandedAnalysis?.realityEngine?.tahminler || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).realityEngine?.tahminler || []).map((item, i) => (
                              <li key={i} className="marker:text-blue-400">{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* OLASILIKLAR */}
                        <div className="bg-charcoal/60 rounded-xl p-4 border border-slateGrey/30 space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-goldLight uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-goldLight animate-pulse"></span>
                              Olasılıklar
                            </span>
                            <span className="text-[9px] font-bold text-goldLight/70">YÜZDESEL İHTİMAL</span>
                          </div>
                          <ul className="space-y-2 text-[11px] text-softGrey list-disc list-inside leading-relaxed">
                            {(expandedAnalysis?.realityEngine?.olasiliklar || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).realityEngine?.olasiliklar || []).map((item, i) => (
                              <li key={i} className="marker:text-goldLight">{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* HUKUKİ GÖRÜŞLER */}
                        <div className="bg-charcoal/60 rounded-xl p-4 border border-slateGrey/30 space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                              Hukuki Görüşler
                            </span>
                            <span className="text-[9px] font-bold text-purple-400/70">BAĞIMSIZ MÜTALAA</span>
                          </div>
                          <ul className="space-y-2 text-[11px] text-softGrey list-disc list-inside leading-relaxed">
                            {(expandedAnalysis?.realityEngine?.hukukiGorusler || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).realityEngine?.hukukiGorusler || []).map((item, i) => (
                              <li key={i} className="marker:text-purple-400">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Yetki & Görev Analizi */}
                      <div className="bg-midnight p-5 rounded-xl border border-slateGrey/30 space-y-3.5">
                        <h3 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-goldDark" />
                          Görev ve Yetki Değerlendirmesi
                        </h3>
                        <div className="space-y-2.5 text-xs">
                          <p className="text-softGrey leading-relaxed">
                            <strong className="text-goldDark block">Görevli Mahkeme:</strong> 
                            {expandedAnalysis?.gorevAnalizi || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).gorevAnalizi}
                          </p>
                          <p className="text-softGrey leading-relaxed">
                            <strong className="text-goldDark block">Yetkili Mahkeme:</strong> 
                            {expandedAnalysis?.yetkiAnalizi || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).yetkiAnalizi}
                          </p>
                        </div>
                      </div>

                      {/* Zamanaşımı & Arabuluculuk */}
                      <div className="bg-midnight p-5 rounded-xl border border-slateGrey/30 space-y-3.5">
                        <h3 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-goldDark" />
                          Süreler ve Alternatif Çözüm Yolu
                        </h3>
                        <div className="space-y-2.5 text-xs">
                          <p className="text-softGrey leading-relaxed">
                            <strong className="text-goldDark block">Zamanaşımı / Hak Düşürücü Süre:</strong> 
                            {expandedAnalysis?.zamanasimiAnalizi || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).zamanasimiAnalizi}
                          </p>
                          <p className="text-softGrey leading-relaxed">
                            <strong className="text-goldDark block">Arabuluculuk İhtimali ve Çözüm Derecesi:</strong> 
                            {expandedAnalysis?.arabuluculukIhtimali || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).arabuluculukIhtimali}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. OLAY KRONOLOJİSİ */}
                {activeSubTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="bg-amberAccent/5 border border-amberAccent/20 p-4 rounded-xl text-xs leading-relaxed flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warningOrange shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-goldLight">Hukuki Süreç Uyarı Tespiti:</strong> Sürelerin takibi hak düşürücü sonuçlar yaratabileceğinden, tebliğ tarihlerinin UYAP dökümlerinden milimetrik tespiti zorunludur. Aşağıda, uyuşmazlığın gelişim kronolojisi simüle edilmiştir.
                      </div>
                    </div>

                    <div className="relative pl-6 border-l-2 border-goldDark/40 space-y-6 max-w-4xl mx-auto py-3">
                      {(expandedAnalysis?.kronoloji || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).kronoloji).map((node, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[31px] top-1 bg-goldDark w-3 h-3 rounded-full border-4 border-charcoal shadow-lg shadow-goldDark/30"></span>
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-goldLight font-bold bg-goldDark/10 text-goldLight border border-goldDark/20 px-2.5 py-0.5 rounded-md">
                              {node.date}
                            </strong>
                            <span className="bg-midnight px-2 py-0.5 text-[9px] text-softGrey rounded font-black">AŞAMA {idx + 1}</span>
                          </div>
                          <h4 className="text-xs font-bold text-ivory mt-2">{node.title}</h4>
                          <p className="text-[11px] text-softGrey mt-1 leading-relaxed whitespace-pre-wrap">{node.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TARAF & DELİL ANALİZİ */}
                {activeSubTab === 'parties' && (
                  <div className="space-y-6">
                    {/* Plaintiff vs Defendant Claims */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-midnight p-5 rounded-xl border border-successGreen/20 space-y-3 shadow-inner">
                        <h3 className="text-xs font-bold text-successGreen flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4" />
                          Davacı Tezleri ve Alacak Kalemleri
                        </h3>
                        <ul className="text-xs space-y-2.5 list-disc pl-4 text-softGrey">
                          {(expandedAnalysis?.tarafAnalizi?.plaintiff || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).tarafAnalizi.plaintiff).map((claim, idx) => (
                            <li key={idx} className="leading-relaxed">{claim}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-midnight p-5 rounded-xl border border-errorRed/20 space-y-3 shadow-inner">
                        <h3 className="text-xs font-bold text-errorRed flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          Davalı Savunma Tezleri ve İtirazlar
                        </h3>
                        <ul className="text-xs space-y-2.5 list-disc pl-4 text-softGrey">
                          {(expandedAnalysis?.tarafAnalizi?.defendant || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).tarafAnalizi.defendant).map((def, idx) => (
                            <li key={idx} className="leading-relaxed">{def}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Evidence evaluation */}
                    <div className="bg-midnight p-5 rounded-xl border border-slateGrey/30 space-y-4">
                      <h3 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5 border-b border-slateGrey/20 pb-2">
                        <Scale className="w-4 h-4 text-goldDark" />
                        Delil Güç Matrisi ve Değerlendirmesi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Güçlü Deliller */}
                        <div className="bg-charcoal p-4 rounded-lg border border-successGreen/20 space-y-2">
                          <span className="text-[10px] font-bold text-successGreen block uppercase tracking-wide">✓ GÜÇLÜ DELİLLER</span>
                          <ul className="text-[10px] text-softGrey space-y-1.5 list-disc pl-3">
                            {(expandedAnalysis?.delilAnalizi?.guclu || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).delilAnalizi.guclu).map((el, i) => (
                              <li key={i}>{el}</li>
                            ))}
                          </ul>
                        </div>
                        {/* Zayıf Deliller */}
                        <div className="bg-charcoal p-4 rounded-lg border border-warningOrange/20 space-y-2">
                          <span className="text-[10px] font-bold text-warningOrange block uppercase tracking-wide">⚠ ZAYIF DELİLLER</span>
                          <ul className="text-[10px] text-softGrey space-y-1.5 list-disc pl-3">
                            {(expandedAnalysis?.delilAnalizi?.zayif || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).delilAnalizi.zayif).map((el, i) => (
                              <li key={i}>{el}</li>
                            ))}
                          </ul>
                        </div>
                        {/* Eksik Deliller */}
                        <div className="bg-charcoal p-4 rounded-lg border border-errorRed/20 space-y-2">
                          <span className="text-[10px] font-bold text-errorRed block uppercase tracking-wide">✖ EKSİK / TOPLANACAK DELİLLER</span>
                          <ul className="text-[10px] text-softGrey space-y-1.5 list-disc pl-3">
                            {(expandedAnalysis?.delilAnalizi?.eksik || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).delilAnalizi.eksik).map((el, i) => (
                              <li key={i}>{el}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* ULTRA ENGINE V3 - DETAYLI EKSİK DELİL VE ÇAPRAZ ÇELİŞKİ PANELİ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ÇELİŞKİLİ BEYAN TESPİT MOTORU */}
                      <div className="bg-midnight/70 p-5 rounded-xl border border-goldDark/30 space-y-4">
                        <div className="flex items-center justify-between border-b border-slateGrey/20 pb-2">
                          <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 text-goldDark" />
                            Çapraz Çelişkili Beyan Analizi
                          </h3>
                          <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-black font-mono">CRITICAL_ENGINE</span>
                        </div>
                        
                        <div className="space-y-3">
                          {(expandedAnalysis?.contradictions || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).contradictions || []).map((c, i) => (
                            <div key={i} className="bg-charcoal/80 p-4 rounded-xl border border-red-900/20 space-y-2.5 relative overflow-hidden">
                              <div className="absolute right-3 top-3 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-red-950/50 text-red-400 border border-red-800/40">
                                {c.severity} ŞÜPHE
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-goldLight block uppercase tracking-wide">KAYNAK: {c.source}</span>
                                <p className="text-xs text-softGrey italic">"{c.statement}"</p>
                              </div>
                              <div className="border-t border-slateGrey/10 pt-2 space-y-1">
                                <span className="text-[10px] font-black text-emerald-400 block uppercase tracking-wide">ÇELİŞTİĞİ DELİL/OLGU: {c.comparisonWith}</span>
                                <p className="text-xs text-softGrey">{c.contradictionDetail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* EKSİK DELİL VE MÜZEKKERE MATRİSİ */}
                      <div className="bg-midnight/70 p-5 rounded-xl border border-goldDark/30 space-y-4">
                        <div className="flex items-center justify-between border-b border-slateGrey/20 pb-2">
                          <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
                            <Scale className="w-4 h-4 text-goldDark" />
                            Yasal Eksik Delil & Celp Listesi
                          </h3>
                          <span className="text-[9px] bg-goldDark/10 text-goldLight border border-goldDark/30 px-2 py-0.5 rounded font-black font-mono">COURT_MANDATORY</span>
                        </div>
                        
                        {(() => {
                          const me = expandedAnalysis?.missingEvidence || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).missingEvidence;
                          return (
                            <div className="space-y-3.5 text-xs text-softGrey">
                              {me?.eksikBelgeler?.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-goldDark block text-[10px] uppercase tracking-wider">Eksik Evraklar:</strong>
                                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                                    {me.eksikBelgeler.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                </div>
                              )}
                              {me?.eksikTaniklar?.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-goldDark block text-[10px] uppercase tracking-wider">Dinlenmesi Önerilen Tanıklara İlişkin Not:</strong>
                                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                                    {me.eksikTaniklar.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                </div>
                              )}
                              {me?.eksikBankaKayitlari?.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-goldDark block text-[10px] uppercase tracking-wider">Celp Edilecek Banka Hesap Dökümleri:</strong>
                                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                                    {me.eksikBankaKayitlari.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                </div>
                              )}
                              {me?.eksikHts?.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-goldDark block text-[10px] uppercase tracking-wider">Talep Edilecek HTS / Sinyal Verileri:</strong>
                                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                                    {me.eksikHts.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                </div>
                              )}
                              {me?.eksikResmiYazismalar?.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-goldDark block text-[10px] uppercase tracking-wider">Yazılacak Kurum Müzekkereleri:</strong>
                                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                                    {me.eksikResmiYazismalar.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. KANUN & EMSAL KARARLAR */}
                {activeSubTab === 'sources' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kanun Maddeleri & Yönetmelikler */}
                      <div className="bg-midnight p-5 rounded-xl border border-slateGrey/30 space-y-4 shadow-inner">
                        <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen className="w-4 h-4 text-goldDark" />
                          İlgili Kanun Maddeleri ve Yönetmelikler
                        </h3>
                        <div className="space-y-2.5">
                          {(expandedAnalysis?.kanunMaddeleri || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).kanunMaddeleri).map((m, i) => (
                            <div key={i} className="bg-charcoal p-3 rounded-lg border border-slateGrey/40 text-[11px] text-softGrey leading-relaxed">
                              {m}
                            </div>
                          ))}
                          {(expandedAnalysis?.yonetmelikler || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).yonetmelikler).map((y, i) => (
                            <div key={i} className="bg-charcoal p-3 rounded-lg border border-slateGrey/30 text-[10px] text-softGrey/80 italic leading-relaxed">
                              {y}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Emsal Kararlar & Yargıtay */}
                      <div className="bg-midnight p-5 rounded-xl border border-slateGrey/30 space-y-4 shadow-inner">
                        <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
                          <Award className="w-4 h-4 text-goldDark" />
                          Yargıtay Kararları ve Emsal İçtihatlar
                        </h3>
                        <div className="space-y-2.5">
                          {(expandedAnalysis?.yargitayKararlari || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).yargitayKararlari).map((k, i) => (
                            <div key={i} className="bg-charcoal p-3.5 rounded-lg border border-slateGrey/40 text-[11px] text-softGrey leading-relaxed">
                              <strong className="text-goldDark block mb-1">Yargıtay Emsal İlami</strong>
                              {k}
                            </div>
                          ))}
                          {(expandedAnalysis?.emsalKararlar || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).emsalKararlar).map((em, i) => (
                            <div key={i} className="bg-charcoal p-3 rounded-lg border border-slateGrey/30 text-[10px] text-softGrey/80 italic leading-relaxed">
                              <strong className="text-softGrey block mb-1">Yerel BAM Kararı</strong>
                              {em}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. AI STRATEJİ & RISK */}
                {activeSubTab === 'strategy' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Winning & Losing probabilities */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Progress Circle visual / Big Percentages */}
                      <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 flex flex-col items-center justify-center text-center space-y-2 shadow-inner">
                        <span className="text-[10px] font-bold text-softGrey uppercase">DOSYA GÜÇ DERECESİ</span>
                        <div className="w-24 h-24 rounded-full border-4 border-goldDark/20 flex flex-col items-center justify-center bg-goldDark/5 relative shadow-lg shadow-goldDark/5">
                          <span className="text-2xl font-serif font-black text-goldLight">
                            %{expandedAnalysis?.kazanmaIhtimali || 72}
                          </span>
                          <span className="text-[8px] text-softGrey uppercase font-bold mt-1">Kazanma İht.</span>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded border ${activeBadge.colorClass}`}>
                          {activeBadge.label}
                        </span>
                      </div>

                      {/* Legal Risk analysis */}
                      <div className="bg-midnight p-5 rounded-xl border border-slateGrey/40 col-span-2 space-y-3">
                        <h4 className="text-xs font-bold text-goldLight uppercase tracking-widest flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-goldDark" />
                          Hukuki Risk ve İspat Yükü Analizi
                        </h4>
                        <p className="text-xs text-softGrey leading-relaxed whitespace-pre-wrap">
                          {expandedAnalysis?.hukukiRiskAnalizi || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).hukukiRiskAnalizi}
                        </p>
                        <p className="text-[11px] text-softGrey/80 italic leading-relaxed border-t border-slateGrey/20 pt-2">
                          <strong className="text-goldDark block not-italic font-bold">HMK m.190 İspat Kuralı:</strong>
                          {expandedAnalysis?.ispatYukuAnalizi || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).ispatYukuAnalizi}
                        </p>
                      </div>
                    </div>

                    {/* Strategic Suggestions list */}
                    <div className="bg-midnight p-5 rounded-xl border border-slateGrey/30 space-y-4">
                      <h3 className="text-xs font-bold text-goldLight uppercase tracking-wider flex items-center gap-1.5 border-b border-slateGrey/20 pb-2">
                        <Sparkles className="w-4 h-4 text-goldDark" />
                        Kıdemli Avukat Stratejik Öneri ve Tavsiyeleri
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-bold text-goldDark uppercase block">TAKTIK HAMLELER</span>
                          {(expandedAnalysis?.stratejikOneriler || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).stratejikOneriler).map((suggest, idx) => (
                            <div key={idx} className="bg-charcoal p-3 rounded-lg border border-goldDark/25 text-xs text-softGrey leading-relaxed flex items-start gap-2">
                              <span className="text-goldDark font-bold shrink-0">{idx + 1}.</span>
                              <p>{suggest}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2.5">
                          <span className="text-[10px] font-bold text-errorRed uppercase block">USULİ EKSİKLİKLER (RİSKLER)</span>
                          {(expandedAnalysis?.usulHatalari || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).usulHatalari).map((err, idx) => (
                            <div key={idx} className="bg-charcoal p-3 rounded-lg border border-errorRed/20 text-xs text-softGrey leading-relaxed flex items-start gap-2">
                              <span className="text-errorRed font-bold shrink-0">⚠</span>
                              <p>{err}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ULTRA ENGINE V3 - AI DANIŞMA KONSEYİ (AI ADVISORY COUNCIL) */}
                    <div className="bg-midnight/70 p-5 rounded-xl border border-goldDark/30 space-y-4">
                      <div className="flex items-center justify-between border-b border-slateGrey/20 pb-3">
                        <div className="flex items-center gap-2">
                          <Scale className="w-5 h-5 text-goldDark" />
                          <div>
                            <h3 className="text-xs font-black text-goldLight uppercase tracking-widest leading-none">AL HUKUK AI Yapay Zekâ Danışma Konseyi</h3>
                            <p className="text-[9px] text-softGrey uppercase tracking-wider mt-1">15 Farklı Hukuk Uzmanının Bağımsız Karar Konsensüsü</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-goldDark/20 text-goldLight border border-goldDark/30">CONSENSUAL_CONFERENCE_V3</span>
                      </div>

                      {/* Common Decision / Ortak Karar */}
                      <div className="bg-gradient-to-r from-goldDark/10 to-amberAccent/5 p-4 rounded-xl border border-goldDark/25 space-y-2">
                        <strong className="text-[11px] font-black text-goldLight uppercase tracking-widest block">✓ KONSEY ORTAK KONSENSÜS KARARI</strong>
                        <p className="text-xs text-softGrey leading-relaxed">
                          {expandedAnalysis?.aiCouncil?.ortakKarar || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).aiCouncil.ortakKarar}
                        </p>
                        {((expandedAnalysis?.aiCouncil?.fikirAyriliklari || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).aiCouncil.fikirAyriliklari || []).length > 0) && (
                          <div className="border-t border-slateGrey/10 pt-2 mt-2 space-y-1">
                            <span className="text-[9px] font-black text-warningOrange uppercase block">Muhalefet Şerhleri / Fikir Ayrılıkları:</span>
                            <ul className="list-disc pl-4 text-[10px] text-softGrey/90 space-y-0.5">
                              {(expandedAnalysis?.aiCouncil?.fikirAyriliklari || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).aiCouncil.fikirAyriliklari || []).map((diff, idx) => (
                                <li key={idx}>{diff}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Grid of opinions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                        {(expandedAnalysis?.aiCouncil?.opinions || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).aiCouncil.opinions || []).map((op, idx) => {
                          const getVoteBadge = (vote: string) => {
                            if (vote === 'KABUL') return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40';
                            if (vote === 'REDD') return 'text-rose-400 bg-rose-950/20 border-rose-900/40';
                            if (vote === 'KISMİ KABUL') return 'text-amber-400 bg-amber-950/20 border-amber-900/40';
                            return 'text-softGrey bg-midnight border-slateGrey/40';
                          };
                          return (
                            <div key={idx} className="bg-charcoal/60 p-3 rounded-lg border border-slateGrey/20 space-y-2.5 flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-goldLight uppercase tracking-wider">{op.role}</span>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${getVoteBadge(op.vote)}`}>
                                    {op.vote}
                                  </span>
                                </div>
                                <strong className="text-[10px] text-ivory block mt-0.5">{op.advisorName}</strong>
                                <p className="text-[11px] text-softGrey leading-relaxed italic">"{op.opinion}"</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DETAYLI RİSK MATRİSİ */}
                    {(() => {
                      const dr = expandedAnalysis?.detailedRisks || getFallbackAnalysis(activeCase.title, activeCase.category, activeCase.description).detailedRisks;
                      const riskFields = [
                        { label: "Usul Hukuku Riski (Süre / Harç / Yetki)", val: dr?.usulRiski || 12, color: "bg-amberAccent" },
                        { label: "İspat Külfeti Riski (Delil Yetersizliği)", val: dr?.ispatRiski || 22, color: "bg-errorRed" },
                        { label: "Delil Geçersizliği / Yasak Delil Riski", val: dr?.delilRiski || 15, color: "bg-red-500" },
                        { label: "Hâkim Takdir Yetkisi & Kanaat Riski", val: dr?.hakimTakdirRiski || 28, color: "bg-purple-500" },
                        { label: "İstinaf Süreci Kaybetme Riski", val: dr?.istinafRiski || 35, color: "bg-orange-500" },
                        { label: "Yargıtay / Temyiz Bozma Riski", val: dr?.temyizRiski || 40, color: "bg-amber-500" },
                        { label: "Hüküm Sonrası Bozma / Karar Düzeltme", val: dr?.bozmaRiski || 25, color: "bg-yellow-500" },
                        { label: "Karşı Tarafın Hukuki Strateji Avantajı", val: dr?.karsiTarafAvantaji || 20, color: "bg-blue-500" }
                      ];
                      return (
                        <div className="bg-midnight/70 p-5 rounded-xl border border-goldDark/30 space-y-4">
                          <h3 className="text-xs font-bold text-goldLight flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4 text-goldDark" />
                            8-Boyutlu Detaylı Hukuki Risk Matrisi
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                            {riskFields.map((field, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-softGrey font-medium">{field.label}</span>
                                  <strong className="text-ivory font-black">%{field.val}</strong>
                                </div>
                                <div className="w-full bg-charcoal h-1.5 rounded-full overflow-hidden border border-slateGrey/20">
                                  <div className={`h-full ${field.color} transition-all duration-500`} style={{ width: `${field.val}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Draft Petition Preview */}
                    <div className="border-t border-slateGrey/30 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-goldLight flex items-center gap-2">
                          <FileText className="w-4 h-4 text-goldDark" />
                          Hukuki Dilekçe Taslak Önerisi
                        </h3>
                        <button
                          onClick={() => copyToClipboard(caseAnalysisResult?.draftPetition || '')}
                          className="text-xs text-amberAccent hover:underline flex items-center gap-1.5 font-bold bg-midnight px-4 py-2 rounded-lg border border-slateGrey"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-successGreen" />
                              Kopyalandı!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-goldDark" />
                              Taslağı Kopyala
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="bg-midnight p-5 rounded-xl border border-slateGrey text-[10px] text-softGrey font-mono max-h-[350px] overflow-y-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                        {caseAnalysisResult?.draftPetition || "Dilekçe taslağı hazırlanıyor..."}
                      </pre>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: SANAL DURUŞMA ODASI (ROLEPLAY) --- */}
      {activeWorkspaceTab === 'trial' && (
        <div className="bg-charcoal border border-slateGrey/60 rounded-2xl p-6 space-y-6 animate-fade-in shadow-2xl relative">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slateGrey/30 pb-5">
            <div>
              <span className="bg-goldDark/15 text-goldLight text-[10px] px-3 py-1 rounded-full font-bold border border-goldDark/30 uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-inner">
                <Scale className="w-3.5 h-3.5 text-goldDark" />
                Duruşma Odası Simülatörü v3.0
              </span>
              <h1 className="text-xl font-serif font-black text-goldLight mt-2">Kartal Anadolu Adliyesi - Sanal Mahkeme Salonu</h1>
              <p className="text-xs text-softGrey">Yapay zekâ aktörleri ile çapraz sorgu yapın, davanın seyrini ve olası hak kararlarını canlı görün</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Performance Indicator */}
              <div className="flex items-center gap-3 bg-midnight px-4 py-2 rounded-xl border border-slateGrey/50 shadow-inner">
                <div className="text-left">
                  <span className="text-[9px] text-softGrey font-bold uppercase block leading-none">Duruşma Başarısı</span>
                  <span className="text-xs font-black text-goldLight block mt-1">{metrics.basariOlasiligi}/100 Puan</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-goldDark/30 flex items-center justify-center font-black text-[10px] text-goldLight bg-goldDark/10">
                  {metrics.basariOlasiligi}
                </div>
              </div>

              {/* Reset Trial */}
              <button
                onClick={handleResetTrial}
                className="bg-slateGrey hover:bg-slateGrey/80 border border-slateGrey px-3.5 py-2 rounded-xl text-xs text-softGrey hover:text-goldLight transition-all flex items-center gap-1 shadow-inner"
                title="Duruşmayı Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sıfırla
              </button>
            </div>
          </div>

          {/* Canonical Layout with Supporting Pane (Trial steps tracker) on side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Seating layout, Messages and inputs (65%) */}
            <div className="lg:col-span-8 flex flex-col space-y-5">
              
              {/* Dynamic Courtroom seating layout map */}
              <div className="space-y-2 select-none">
                <span className="text-[10px] text-softGrey/80 uppercase font-black tracking-widest block text-center">MAHKEME SALONU ETKİLEŞİMLİ OTURMA DÜZENİ</span>
                
                <div className="grid grid-cols-12 gap-3 p-4 bg-midnight/80 rounded-2xl border border-slateGrey/40 text-center shadow-inner relative overflow-hidden">
                  
                  {/* Judge (Top Center) */}
                  <div 
                    onClick={() => setSelectedRole('HAKIM')}
                    className={`col-span-12 md:col-span-4 md:col-start-5 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedRole === 'HAKIM' 
                        ? 'bg-red-500/10 border-red-500 text-red-400 scale-105 shadow-md shadow-red-500/10' 
                        : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-red-500" />
                    <span className="text-[11px] font-black block leading-none">HÂKİM KÜRSÜSÜ</span>
                    <span className="text-[9px] block text-softGrey/60 mt-1">Hâkim Ahmet Altan</span>
                  </div>

                  {/* Prosecutor (Left) & Expert witness (Right) */}
                  <div 
                    onClick={() => setSelectedRole('SAVCI')}
                    className={`col-span-6 md:col-span-4 md:col-start-1 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedRole === 'SAVCI' 
                        ? 'bg-amberAccent/10 border-amberAccent text-amberAccent scale-105 shadow-md shadow-amberAccent/10' 
                        : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 mx-auto mb-1 text-amberAccent" />
                    <span className="text-[11px] font-black block leading-none">SAVCILIK MAKAMI</span>
                    <span className="text-[9px] block text-softGrey/60 mt-1">Hilmi Erdem</span>
                  </div>

                  <div 
                    onClick={() => setSelectedRole('BILIRKISI')}
                    className={`col-span-6 md:col-span-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedRole === 'BILIRKISI' 
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 scale-105 shadow-md shadow-cyan-400/10' 
                        : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                    }`}
                  >
                    <BookMarked className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <span className="text-[11px] font-black block leading-none">BİLİRKİŞİ</span>
                    <span className="text-[9px] block text-softGrey/60 mt-1">Prof. Dr. Vedat Şen</span>
                  </div>

                  {/* Witness (Middle Center) */}
                  <div 
                    onClick={() => setSelectedRole('TANIK')}
                    className={`col-span-12 md:col-span-4 md:col-start-5 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedRole === 'TANIK' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 scale-105 shadow-md shadow-emerald-500/10' 
                        : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-[11px] font-black block leading-none">TANIK KÜRSÜSÜ</span>
                    <span className="text-[9px] block text-softGrey/60 mt-1">Şahit: M. Can</span>
                  </div>

                  {/* Plaintiff (Your side - Bottom Left) & Defendant (Opponent side - Bottom Right) */}
                  <div 
                    onClick={() => setSelectedRole('DAVACI')}
                    className={`col-span-6 p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      selectedRole === 'DAVACI'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 scale-105 shadow-md'
                        : 'bg-goldDark/5 border border-goldDark/30 text-goldLight'
                    }`}
                  >
                    <span className="text-[10px] font-bold block uppercase text-goldDark">Davacı Kürsüsü</span>
                    <span className="text-[11px] font-black block truncate">{activeCase.clientName}</span>
                    <span className="text-[8px] text-softGrey block mt-0.5">Vekil: Av. Kerem Soylu</span>
                  </div>

                  <div 
                    onClick={() => setSelectedRole('DAVALI')}
                    className={`col-span-6 p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      selectedRole === 'DAVALI' 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400 scale-105 shadow-md shadow-orange-500/10' 
                        : 'bg-charcoal border-slateGrey/60 hover:border-softGrey text-softGrey'
                    }`}
                  >
                    <span className="text-[10px] font-bold block uppercase text-orange-400">Davalı Kürsüsü</span>
                    <span className="text-[11px] font-black block truncate">Karşı Taraf (Sanayi A.Ş.)</span>
                    <span className="text-[8px] text-softGrey block mt-0.5">Vekil: Av. Selin Kaya</span>
                  </div>

                </div>
              </div>

              {/* Live Trial Dialogue Output Stream */}
              <div className="bg-midnight border border-slateGrey/40 rounded-2xl p-5 space-y-4 h-[350px] overflow-y-auto scrollbar-thin flex flex-col shadow-inner">
                {courtMessages.map((msg) => {
                  const isHakim = msg.senderRole === 'HAKIM';
                  const isUser = msg.senderRole === userRole;
                  const isDefendant = msg.senderRole === 'DAVALI';
                  const isSavci = msg.senderRole === 'SAVCI';
                  const isBilirKisi = msg.senderRole === 'BILIRKISI';
                  const isTanik = msg.senderRole === 'TANIK';
                  
                  let bubbleStyle = "bg-charcoal border-slateGrey/40 text-softGrey";
                  if (isHakim) bubbleStyle = "bg-red-500/5 border-red-500/35 text-red-200";
                  if (isUser) bubbleStyle = "bg-goldDark text-midnight border-goldDark font-semibold";
                  if (isDefendant) bubbleStyle = "bg-orange-500/5 border-orange-500/30 text-orange-200";
                  if (isSavci) bubbleStyle = "bg-amber-500/5 border-amber-500/30 text-amber-200";
                  if (isBilirKisi) bubbleStyle = "bg-cyan-500/5 border-cyan-500/30 text-cyan-200";
                  if (isTanik) bubbleStyle = "bg-emerald-500/5 border-emerald-500/30 text-emerald-200";
                  
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                      <div className="flex items-center gap-2 text-[10px] text-softGrey/80">
                        <span className="font-bold">{msg.sender}</span>
                        <span>•</span>
                        <span className="uppercase font-extrabold text-[8px] bg-slateGrey/35 px-1 rounded text-goldLight">{msg.senderRole}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        {isUser && (
                          <span className="bg-midnight text-goldDark border border-goldDark/20 text-[8px] font-bold px-1.5 py-0.2 rounded ml-1">
                            Etki Puanı: {msg.score}/100
                          </span>
                        )}
                      </div>
                      <div className={`p-3.5 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${bubbleStyle}`}>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isCourtLoading && (
                  <div className="flex gap-2 mr-auto items-center animate-pulse">
                    <div className="bg-charcoal border border-slateGrey/50 p-3.5 rounded-xl flex items-center gap-2 text-xs text-softGrey">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-goldDark" />
                      <span>{selectedRole} sorgulanıyor, yasal yanıt tanzim ediliyor...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Area / Controls */}
              <div className="bg-charcoal/40 border border-slateGrey/40 p-4 rounded-xl space-y-3.5">
                
                {/* Selector Bars */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between text-xs border-b border-slateGrey/20 pb-3">
                  <div className="space-y-1">
                    <span className="text-softGrey font-bold block text-[10px] uppercase">1. Kendi Rolünüz:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['AVUKAT', 'HAKIM', 'SAVCI', 'DAVACI', 'DAVALI', 'TANIK', 'BILIRKISI'] as RoleId[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setUserRole(r)}
                          className={`text-[9px] font-black px-2.5 py-1 rounded transition-all border ${
                            userRole === r 
                              ? 'bg-goldDark text-midnight border-goldDark' 
                              : 'bg-midnight text-softGrey border-slateGrey hover:text-ivory'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-softGrey font-bold block text-[10px] uppercase">2. Hitap Edilen Aktör (Hedef):</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['HAKIM', 'SAVCI', 'DAVACI', 'DAVALI', 'TANIK', 'BILIRKISI'] as RoleId[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setSelectedRole(r)}
                          className={`text-[9px] font-black px-2.5 py-1 rounded transition-all border ${
                            selectedRole === r 
                              ? 'bg-gradient-to-r from-amberAccent to-goldDark text-midnight border-goldDark' 
                              : 'bg-midnight text-softGrey border-slateGrey hover:text-ivory'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSendCourtStatement} className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Seçili aktöre çapraz sorgu sorusu yöneltin veya hâkime usul beyanında bulunun..."
                    value={courtInput}
                    onChange={e => setCourtInput(e.target.value)}
                    className="flex-1 bg-midnight border border-slateGrey px-4 py-3 rounded-xl text-xs text-ivory focus:outline-none focus:border-goldDark placeholder-softGrey"
                  />
                  <button
                    type="submit"
                    disabled={isCourtLoading || !courtInput.trim()}
                    className="bg-goldDark hover:bg-goldLight disabled:opacity-40 text-midnight px-5 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 gap-1.5 text-xs font-black shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    Sorgula
                  </button>
                </form>

              </div>

            </div>

            {/* Right side: 12-Step flow and live metrics (35%) */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              
              {/* Duruşma Akışı (12 Steps Tracker) */}
              <div className="bg-midnight p-5 rounded-2xl border border-slateGrey/40 space-y-3 shadow-inner flex-1 flex flex-col">
                <div className="flex justify-between items-center border-b border-slateGrey/25 pb-2.5 shrink-0">
                  <h3 className="text-xs font-black text-goldLight uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-goldDark" />
                    DURUŞMA SÜREÇ AKIŞI
                  </h3>
                  <span className="text-[10px] text-goldDark font-black">Aşama {trialStep}/12</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-charcoal h-1.5 rounded-full overflow-hidden shrink-0">
                  <div className="bg-gradient-to-r from-goldDark to-amberAccent h-full transition-all duration-300" style={{ width: `${(trialStep / 12) * 100}%` }}></div>
                </div>

                {/* Scrollable list of steps */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin text-xs max-h-[300px]">
                  {trialSteps.map((step) => {
                    const isActive = step.id === trialStep;
                    const isCompleted = step.id < trialStep;
                    
                    return (
                      <div 
                        key={step.id} 
                        onClick={() => {
                          setTrialStep(step.id);
                          if (activeCase) localStorage.setItem(`trial_step_${activeCase.id}`, step.id.toString());
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-goldDark/10 border-goldDark/60 text-goldLight shadow-md' 
                            : isCompleted 
                              ? 'bg-charcoal/40 border-slateGrey/20 text-softGrey/60 line-through' 
                              : 'bg-charcoal border-slateGrey/30 text-softGrey hover:border-softGrey/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[9px] text-goldDark font-black">{step.id}.</span>}
                            {step.label}
                          </span>
                          {isActive && <span className="bg-goldDark text-midnight text-[8px] font-black px-1.5 py-0.5 rounded uppercase">AKTİF</span>}
                        </div>
                        {isActive && <p className="text-[10px] text-softGrey/80 mt-1 leading-relaxed">{step.desc}</p>}
                      </div>
                    );
                  })}
                </div>

                {/* Advanced step controls */}
                <div className="flex gap-2 border-t border-slateGrey/25 pt-2.5 shrink-0">
                  <button
                    onClick={() => {
                      const next = Math.max(1, trialStep - 1);
                      setTrialStep(next);
                      if (activeCase) localStorage.setItem(`trial_step_${activeCase.id}`, next.toString());
                    }}
                    disabled={trialStep === 1}
                    className="flex-1 bg-charcoal hover:bg-slateGrey disabled:opacity-30 border border-slateGrey text-softGrey p-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Geri
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(12, trialStep + 1);
                      setTrialStep(next);
                      if (activeCase) localStorage.setItem(`trial_step_${activeCase.id}`, next.toString());
                    }}
                    disabled={trialStep === 12}
                    className="flex-1 bg-goldDark hover:bg-goldLight disabled:opacity-30 text-midnight p-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    İleri <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Live Trial Metrics Grid */}
              <div className="bg-midnight p-5 rounded-2xl border border-slateGrey/40 space-y-3 shadow-inner">
                <h3 className="text-xs font-black text-goldLight uppercase tracking-widest flex items-center gap-1.5 border-b border-slateGrey/20 pb-2">
                  <TrendingUp className="w-4 h-4 text-goldDark" />
                  CANLI DURUŞMA METRİKLERİ
                </h3>

                <div className="space-y-3">
                  {[
                    { label: "Dosya Gücü", value: metrics.dosyaGucu, color: "from-goldDark to-amberAccent" },
                    { label: "Delil Gücü", value: metrics.delilGucu, color: "from-successGreen to-emerald-400" },
                    { label: "Tanık Gücü", value: metrics.tanikGucu, color: "from-cyan-500 to-cyan-400" },
                    { label: "İspat Gücü", value: metrics.ispatGucu, color: "from-amber-500 to-amber-300" },
                    { label: "Risk Skoru", value: metrics.riskSkoru, color: "from-errorRed to-rose-400" },
                    { label: "Usul Riski", value: metrics.usulRiski, color: "from-orange-500 to-orange-400" },
                    { label: "Temyiz Riski", value: metrics.temyizRiski, color: "from-purple-500 to-purple-400" },
                    { label: "Karşı Taraf Avantajı", value: metrics.karsiTarafAvantaji, color: "from-red-500 to-red-400" }
                  ].map((m) => (
                    <div key={m.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-softGrey">
                        <span className="font-bold">{m.label}</span>
                        <span className="text-goldLight">%{m.value}</span>
                      </div>
                      <div className="w-full bg-charcoal h-1 rounded-full overflow-hidden">
                        <div className={`bg-gradient-to-r ${m.color} h-full transition-all duration-500`} style={{ width: `${m.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Area: Request Verdict & Verdict display panel */}
          <div className="border-t border-slateGrey/30 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-midnight/60 p-5 rounded-2xl border border-goldDark/30 shadow-inner">
              <div className="space-y-1">
                <h4 className="text-sm font-serif font-bold text-goldLight flex items-center gap-2">
                  <Award className="w-4 h-4 text-goldDark animate-pulse" />
                  Duruşmayı Kapat ve Gerekçeli Karar Yazdır!
                </h4>
                <p className="text-[10px] text-softGrey max-w-xl leading-relaxed">
                  Duruşma sorgularını ve aşamalarını tamamladığınızda, yapay zekâ hâkimine tüm duruşma tutanağını yasal yönden analiz ettirip resmi gerekçeli karar ve akıllı performans raporu hazırlatın.
                </p>
              </div>
              <button
                onClick={handleRequestVerdict}
                disabled={verdictLoading || courtMessages.length < 2}
                className="bg-gradient-to-r from-goldDark to-amberAccent hover:shadow-lg disabled:opacity-40 text-midnight font-bold text-xs px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg border border-goldLight/20"
              >
                {verdictLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-midnight" />
                    Karar İnşa Ediliyor...
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4 text-midnight" />
                    Hâkimden Karar Talep Et
                  </>
                )}
              </button>
            </div>

            {/* Premium Final Report & Verdict Panel */}
            {finalReport && (
              <div className="bg-midnight p-6 rounded-2xl border border-goldDark/30 space-y-5 animate-slide-up shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-goldDark/5 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slateGrey/30 pb-3 gap-3">
                  <h3 className="text-sm font-serif font-bold text-goldLight flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-successGreen" />
                    T.C. MAHKEME İLAMI VE SİMÜLASYON VERDİKTİ
                  </h3>

                  {/* Print / Export buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadFile('pdf')}
                      className="text-[10px] font-bold text-midnight bg-goldDark hover:bg-goldLight px-3 py-1.5 rounded-lg border border-goldLight/20 transition-all flex items-center gap-1.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      PDF Raporu
                    </button>
                    <button
                      onClick={() => handleDownloadFile('doc')}
                      className="text-[10px] font-bold text-goldLight bg-charcoal hover:bg-slateGrey px-3 py-1.5 rounded-lg border border-slateGrey/50 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Word Raporu
                    </button>
                  </div>
                </div>

                {/* Sub-tabs for the final report */}
                <div className="flex border-b border-slateGrey/20 pb-1.5 gap-4">
                  <button 
                    onClick={() => setActiveReportTab('verdict')}
                    className={`text-[11px] font-bold pb-2 transition-all border-b ${
                      activeReportTab === 'verdict' ? 'text-goldLight border-goldDark' : 'text-softGrey border-transparent'
                    }`}
                  >
                    ⚖ Gerekçeli Karar İlamı
                  </button>
                  <button 
                    onClick={() => setActiveReportTab('actors')}
                    className={`text-[11px] font-bold pb-2 transition-all border-b ${
                      activeReportTab === 'actors' ? 'text-goldLight border-goldDark' : 'text-softGrey border-transparent'
                    }`}
                  >
                    👥 Aktör Değerlendirmesi
                  </button>
                  <button 
                    onClick={() => setActiveReportTab('strategy')}
                    className={`text-[11px] font-bold pb-2 transition-all border-b ${
                      activeReportTab === 'strategy' ? 'text-goldLight border-goldDark' : 'text-softGrey border-transparent'
                    }`}
                  >
                    🎯 Eksik Delil & Strateji
                  </button>
                </div>

                <div className="min-h-[200px]">
                  {/* Verdict Display */}
                  {activeReportTab === 'verdict' && (
                    <pre className="text-[10px] text-softGrey font-mono leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto pr-1 bg-charcoal p-4 rounded-xl border border-slateGrey/40 shadow-inner">
                      {finalReport.gerekceliKarar}
                    </pre>
                  )}

                  {/* Actor Assessments */}
                  {activeReportTab === 'actors' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-charcoal p-4 rounded-xl border border-red-500/10 space-y-2">
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-wide">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Hâkim Değerlendirmesi
                        </span>
                        <p className="text-[11px] text-softGrey leading-relaxed">{finalReport.hakimDegerlendirmesi}</p>
                      </div>
                      <div className="bg-charcoal p-4 rounded-xl border border-amberAccent/10 space-y-2">
                        <span className="text-[10px] font-bold text-amberAccent flex items-center gap-1 uppercase tracking-wide">
                          <UserCheck className="w-3.5 h-3.5" />
                          Savcı Değerlendirmesi
                        </span>
                        <p className="text-[11px] text-softGrey leading-relaxed">{finalReport.savciDegerlendirmesi}</p>
                      </div>
                      <div className="bg-charcoal p-4 rounded-xl border border-goldDark/20 space-y-2">
                        <span className="text-[10px] font-bold text-goldLight flex items-center gap-1 uppercase tracking-wide">
                          <Award className="w-3.5 h-3.5" />
                          Sözlü Avukatlık Analizi
                        </span>
                        <p className="text-[11px] text-softGrey leading-relaxed">{finalReport.avukatDegerlendirmesi}</p>
                      </div>
                    </div>
                  )}

                  {/* Strategy and Evidence checklist */}
                  {activeReportTab === 'strategy' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-4">
                        <div className="bg-charcoal p-4 rounded-xl border border-slateGrey/40 space-y-2">
                          <span className="text-[10px] font-bold text-goldLight block uppercase">ÖNERİLEN STRATEJİ & HAMLE</span>
                          <p className="text-[11px] text-softGrey leading-relaxed">{finalReport.onerilenStrateji}</p>
                        </div>
                        <div className="bg-charcoal p-4 rounded-xl border border-slateGrey/40 space-y-2">
                          <span className="text-[10px] font-bold text-goldLight block uppercase">TAVSİYE EDİLEN DİLEKÇE</span>
                          <strong className="text-[11px] text-goldLight block">{finalReport.onerilenDilekce}</strong>
                        </div>
                      </div>

                      <div className="bg-charcoal p-4 rounded-xl border border-slateGrey/40 space-y-3">
                        <span className="text-[10px] font-bold text-errorRed block uppercase">TOPLANMASI GEREKEN EKSİK DELİLLER</span>
                        <ul className="text-[11px] text-softGrey space-y-1.5 list-disc pl-4">
                          {finalReport.eksikDeliller.map((e, idx) => <li key={idx}>{e}</li>)}
                          {finalReport.toplanmasiGerekenDeliller.map((e, idx) => <li key={idx} className="text-emerald-400">{e}</li>)}
                        </ul>

                        <div className="border-t border-slateGrey/20 pt-2 space-y-1.5">
                          <span className="text-[9px] font-bold text-goldDark block uppercase">DAYANAK KANUN VE EMSAL</span>
                          <div className="flex flex-wrap gap-1">
                            {finalReport.onerilenKanunMaddeleri.map((m, idx) => (
                              <span key={idx} className="bg-midnight px-2 py-0.5 rounded text-[9px] text-softGrey border border-slateGrey">{m}</span>
                            ))}
                            {finalReport.onerilenEmsalKararlar.map((k, idx) => (
                              <span key={idx} className="bg-midnight px-2 py-0.5 rounded text-[9px] text-goldLight border border-goldDark/30">{k}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
