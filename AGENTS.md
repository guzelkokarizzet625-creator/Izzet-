# AL HUKUK AI - Product & UX Guidelines

## Ana Hedef
Platformun her sayfasını şu soruyla değerlendir:
"Bir kullanıcı bunu ilk kez gördüğünde gerçekten işine yarıyor mu?"
Eğer cevap hayırsa yeniden tasarla.

## Geliştirici Odaklı Tüm Bilgileri Kaldır
Son kullanıcıya hiçbir zaman aşağıdaki teknik bilgileri gösterme:
- ORCHESTRATOR
- LOCAL ENGINE
- LOCAL REASONING
- Prompt bilgileri
- Confidence yüzdesi
- Risk yüzdesi
- Token bilgileri
- İşlem süresi
- Debug bilgileri
- Sistem logları
- Teknik hata kodları
- Dahili model isimleri

Bunlar yalnızca geliştirici modunda (Admin/Dev Mode) erişilebilir olsun.

## Kullanıcıya Gösterilecek Yeni Yapı
Her modülde yalnızca gerçekten faydalı bilgiler gösterilsin:
- 🧠 Olay Özeti
- ⚖️ Hukuki Değerlendirme
- 📂 İlgili Hukuk Dalı
- 📄 Gerekli Belgeler
- 📚 İlgili Kanunlar
- ⚠️ Olası Riskler
- 🎯 Önerilen Sonraki Adımlar
- 📑 Oluşturulabilecek Belgeler
- 🎓 İlgili Hukuk Akademisi Dersleri

## Kullanıcıyı Yönlendir
Platform yalnızca cevap vermesin, kullanıcıyı proaktif olarak yönlendirsin.
Örnekler:
- "Dilekçe hazırlamak ister misiniz?"
- "Belge yüklemek ister misiniz?"
- "Dava simülasyonu başlatılsın mı?"
- "İlgili eğitimi açayım mı?"

## Premium Deneyim
Tüm ekranlarda şu unsurları sağla:
- Apple seviyesinde sadelik
- Profesyonel tipografi
- Modern kartlar
- Tutarlı ikonlar
- Akıcı animasyonlar
- Hızlı geçişler
- Mobil öncelikli tasarım

## Güvenilirlik
- Asla bilgi uydurma.
- Eksik bilgi varsa kullanıcıya sor.
- Kullanıcının vermediği isim, tarih, mahkeme, para miktarı veya olay oluşturma.
- Kesin sonuç vaat etme.
- Gerektiğinde farklı ihtimalleri açıkla.

## Otomatik İyileştirme Soruları
Her geliştirme veya modül incelemesinde kendine şu soruları sor:
1. Bu ekran gereksiz kalabalık mı?
2. Daha anlaşılır olabilir mi?
3. Kullanıcı burada ne yapmak istiyor?
4. Gereksiz bilgi var mı?
5. Eksik özellik var mı?
6. Daha profesyonel olabilir mi?
7. Daha güven verici olabilir mi?

## Geliştirme Kuralları
- Mevcut çalışan özellikleri bozma.
- Gereksiz kod silme (çalışan özellikleri bozacak şekilde).
- Performansı düşürme, kod kalitesini artır.
- Üretim ortamına uygun geliştir.
- Tüm değişikliklerden sonra UI'ı veya testleri doğrula.
- Hata oluşursa güvenli şekilde geri al.
