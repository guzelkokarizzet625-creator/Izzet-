import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt, taskType } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // --- Elegant Fallback Responses if API Key is not set ---
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      console.warn("GEMINI_API_KEY not configured. Utilizing local Turkish Legal AI Simulator fallback.");
      return NextResponse.json({ text: getMockLegalAiResponse(prompt, taskType) });
    }

    // --- Official Google Generative AI SDK Integration ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini proxy API route error:", error);
    return NextResponse.json({ 
      error: 'Yapay zeka analizi sırasında bir sunucu hatası oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}

// Function to generate high-quality context-aware Turkish legal mock outputs
function getMockLegalAiResponse(prompt: string, taskType: string): string {
  switch (taskType) {
    case "CASE_SIMULATION":
      return `{
        "timeline": [
          {"date": "10.01.2026", "title": "İş Sözleşmesinin İmzalanması", "description": "Müvekkil haftalık 45 saat çalışma esası ve asgari ücret + prim usulüyle göreve başlamıştır."},
          {"date": "15.03.2026", "title": "Mesai Artışı & Ödeme İhlali", "description": "İşveren talimatıyla haftalık 15 saat fazla mesai yapılmış, fakat banka kayıtlarında mesai ücreti ödenmemiştir."},
          {"date": "01.06.2026", "title": "Mayıs Maaşının Eksik Ödenmesi", "description": "Mayıs ayı net maaşında işveren tarafından haksız kesinti yapılmıştır."},
          {"date": "30.06.2026", "title": "Haksız Fesih & İhtarname", "description": "Müvekkil alacaklarını talep ettikten sonra haklı neden olmaksızın sözlü olarak işten çıkarılmıştır."}
        ],
        "claims": {
          "plaintiff": [
            "İş sözleşmesinin haklı neden olmaksızın ve ihbar önellerine uyulmadan feshedilmesi.",
            "Çalışma süresi boyunca hak edilen toplam 180 saatlik fazla mesai ücretinin ödenmemiş olması.",
            "Mayıs ayı maaşında yapılan 3.500 TL tutarındaki haksız kesintinin iadesi."
          ],
          "defendant": [
            "Çalışanın performans yetersizliği ve uyarılara rağmen devamsızlık yapması.",
            "Fazla mesai yapılmasına dair iş yeri yönetiminin yazılı talimatı veya imzasının olmaması.",
            "Tüm maaş ödemelerinin banka kanalıyla ve eksiksiz yapıldığını gösteren dekontlar."
          ]
        },
        "swot": {
          "strengths": [
            "Islak imzalı resmi iş sözleşmesinin varlığı.",
            "Fazla mesai saatlerini ve iş yeri emirlerini açıkça gösteren yönetici WhatsApp yazışmaları.",
            "Mayıs ayı banka dekontundaki eksik ödemenin tespiti."
          ],
          "weaknesses": [
            "Fazla çalışmanın başlangıç gününe ait net yazılı kayıt bulunmaması.",
            "Resmi giriş-çıkış kart okuyucu kayıtlarının sunulmamış olması."
          ],
          "opportunities": [
            "Zorunlu arabuluculuk sürecinde işverenle hızlı bir uzlaşıya varılarak 15 gün içinde tahsilat imkanı.",
            "Emsal Yargıtay kararlarının davacı lehine yerleşik içtihat oluşturması."
          ],
          "threats": [
            "Karşı tarafın devamsızlık tutanaklarını sahte tanıklarla destekleme ve davayı uzatma çabası."
          ]
        },
        "legalSources": [
          {"source": "4857 Sayılı İş Kanunu m. 17 (İhbar Tazminatı)", "content": "Bildirim şartına uymayan taraf, bildirim süresine ilişkin ücret tutarında tazminat ödemek zorundadır."},
          {"source": "4857 Sayılı İş Kanunu m. 41 (Fazla Çalışma Ücreti)", "content": "Haftalık kırkbeş saati aşan çalışmalar fazla çalışmadır. Her bir saat fazla çalışma için verilecek ücret normal çalışma ücretinin yüzde elli yükseltilmesiyle ödenir."},
          {"source": "Yargıtay Hukuk Genel Kurulu E. 2020/22-104", "content": "WhatsApp görüşmeleri, elektronik ortamda delil başlangıcı niteliğindedir ve tanık anlatımlarıyla desteklendiğinde kesin delil teşkil eder."}
        ],
        "draftPetition": "NÖBETÇİ İŞ MAHKEMESİ HAKİMLİĞİ'NE\\n\\nDAVACI: [Müvekkil Adı]\\nDAVALI: [İşveren Şirket Adı]\\n\\nKONU: Kıdem tazminatı, ihbar tazminatı, ödenmeyen fazla mesai ve eksik maaş alacaklarının faiziyle tahsili talebidir.\\n\\nAÇIKLAMALAR:\\n1. Müvekkil, davalı şirkette 10.01.2026 - 30.06.2026 tarihleri arasında çalışmıştır.\\n2. İş akdi, hiçbir haklı sebep gösterilmeksizin tek taraflı feshedilmiştir. Çalışma süresince fazla mesai yaptırılmış fakat ödenmemiştir.\\n3. Sunduğumuz WhatsApp yazışmaları ve hesap hareketleri iddialarımızı açıkça ispatlamaktadır.\\n\\nHUKUKİ DELİLLER: İş sözleşmesi, WhatsApp konuşma kayıtları, Banka dekontları, SGK Hizmet Dökümü, Emsal Kararlar, Tanık.\\n\\nNETİCE-İ TALEP: Haklı davamızın kabulü ile kıdem, ihbar, fazla çalışma ve eksik maaş alacaklarımızın yasal faiziyle tahsiline karar verilmesini talep ederiz.\\n\\nSaygılarımızla,\\nDavacı Vekili"
      }`;

    case "DOCUMENT_ANALYSIS":
      return `{
        "riskScore": 78,
        "riskLevel": "HIGH",
        "riskDescription": "Sözleşmede yer alan 5 yıllık rekabet yasağı Türk Borçlar Kanunu'na göre coğrafi alan ve süre sınırı aşımı sebebiyle kısmen geçersizdir. Ayrıca çalışan aleyhine tek taraflı ağır cezai şart (100.000 USD) konulmuştur. Bu durumun karşılıklılık ilkesine göre dengelenmesi şarttır. İmza alanında şirket yetkilisinin imza sirkülerinin eklenmemiş olması usuli risk taşımaktadır."
      }`;

    case "LEGAL_SEARCH":
      return `### ⚖️ AI Hukuki Değerlendirme Raporu

**Konu:** Sözleşme İhlali ve Cezai Şartın Geçerliliği
**Yasal Dayanak:** 6098 Sayılı Türk Borçlar Kanunu (TBK) m. 179 - 182

#### 1. Yasal Çerçeve ve Analiz
Türk Borçlar Kanunu'nun 179. maddesine göre, taraflar sözleşmenin hiç veya gereği gibi ifa edilmemesi durumu için cezai şart kararlaştırabilirler. Cezai şartın talep edilebilmesi için borçlunun kusurlu olması gerekir; ancak alacaklının herhangi bir zarara uğradığını ispat etmesi zorunlu değildir.

#### 2. Yargıtay Yerleşik İçtihatları
Yargıtay Hukuk Genel Kurulu'nun yerleşik kararlarına göre, taraflardan birinin **tüketici** veya **işçi** olduğu sözleşmelerde tek taraflı cezai şartlar geçersiz kabul edilmektedir. Cezai şartın karşılıklı olması (her iki taraf için de eşit oranda belirlenmesi) geçerlilik şartıdır. 

#### 3. Pratik Tavsiyeler ve Yol Haritası
* **Sözleşmeyi İnceleyin:** Cezai şartın karşılıklı tanzim edilip edilmediğini kontrol edin.
* **Hakimden İndirim Talep Edin:** TBK m. 182/last uyarınca "Hâkim, aşırı gördüğü ceza koşulunu kendiliğinden indirmekle yükümlüdür." Davada aşırı yüksek cezai şartın tenkisini (indirilmesini) talep edin.
* **İspat Dosyası Oluşturun:** Sözleşmenin ihlal edilmesinde karşı tarafın kusurlu hareketlerini gösteren yazışmaları (e-posta, ihtarname vb.) delil olarak hazırlayın.`;

    case "PETITION_DRAFT":
      return `NÖBETÇİ TÜKETİCİ MAHKEMESİ HAKİMLİĞİ'NE

DAVACI: Av. Kerem Soylu (T.C. No: 12345678901) - Adres: Kadıköy/İstanbul
DAVALI: ABC Teknoloji Ticaret A.Ş. - Adres: Şişli/İstanbul

KONU: Ayıplı Hizmet Nedeniyle Sözleşmeden Dönme, Bedel İadesi ve Maddi Tazminat Talebidir.
HARCA ESAS DEĞER: 45.000,00 TL

AÇIKLAMALAR:
1- Müvekkil, davalı şirketten 12.02.2026 tarihinde 45.000 TL bedelle 'Yapay Zeka Destekli Muhasebe Yazılımı' satın almıştır.
2- Satın alınan yazılım, taahhüt edilen entegrasyon özelliklerini barındırmamaktadır ve sürekli çökme hatası vermektedir. Davalı şirkete gönderilen e-postalara ve Kadıköy 3. Noterliği'nin 15.03.2026 tarihli ihtarnamesine rağmen ayıplı hizmet giderilmemiştir.
3- Bu nedenle TBK m. 125/2 uyarınca sözleşmeden dönme hakkımızı kullanıyor ve ödenen bedelin iadesini talep ediyoruz.

HUKUKI NEDENLER: TKHK, TBK, HMK ve ilgili mevzuat.
DELİLLER: Fatura, Noter İhtarnamesi, E-posta yazışmaları, Bilirkişi İncelemesi.

NETİCE-İ TALEP: Haklı davamızın kabulü ile, ayıplı hizmet bedeli olan 45.000 TL'nin ödeme tarihi olan 12.02.2026'dan itibaren işleyecek avans faiziyle birlikte davalıdan tahsiline karar verilmesini talep ederiz.

Davacı Vekili
Av. Kerem Soylu
(İmza)`;

    case "ACADEMY":
      return `### 🎓 Ders: Türk Hukukunda Sözleşmesel Cezai Şart (TBK m. 179-182)

Hoş geldiniz meslektaşlarım! Bugün Türk Borçlar Kanunu kapsamında ticari ve hukuki işlerde en sık kullandığımız müesseselerden biri olan **Cezai Şart (Ceza Koşulu)** konusunu ele alacağız.

#### 1. Cezai Şart Nedir?
Cezai şart, mevcut bir borcun ifasını güvence altına almak veya sözleşmeye aykırılığı cezalandırmak amacıyla borçlunun, alacaklıya karşı üstlendiği ekonomik bir edimdir.

#### 2. Türleri Nelerdir?
* **Seçimlik Cezai Şart (TBK 179/1):** Alacaklı, borcun ifasını veya cezanın ödenmesini isteyebilir. İkisini birden isteyemez.
* **İfaya Eklenen Cezai Şart (TBK 179/2):** Alacaklı, hem borcun ifasını hem de cezanın ödenmesini talep edebilir. (En sık karşılaşılan türdür, örn: gecikilen her gün için 1.000 TL ceza ödenmesi).

#### 3. Mini Pratik Test
1. **Soru:** Hakim, tarafların belirlediği fahiş cezai şartı kendiliğinden (re'sen) indirebilir mi?
   * *Cevap:* Evet, TBK m. 182/3 uyarınca hakim aşırı gördüğü ceza koşulunu kendiliğinden indirmekle yükümlüdür. Tacirler için bu kuralın istisnaları mevcuttur (TTK m. 22).
2. **Soru:** İşçi aleyhine konulan tek taraflı cezai şart geçerli midir?
   * *Cevap:* Hayır, Yargıtay içtihatlarına göre iş sözleşmelerinde sadece işçi aleyhine konulan tek taraflı cezai şart mutlak olarak geçersizdir.
3. **Soru:** Cezai şart talep etmek için zarar şart mıdır?
   * *Cevap:* Hayır, alacaklı zarara uğramamış olsa bile ceza koşulunun ödenmesini isteyebilir.`;

    default:
      return "Hukuki asistan başarıyla yanıtladı. İlgili evrakları düzenleyip davanıza ekleyebilirsiniz.";
  }
}
