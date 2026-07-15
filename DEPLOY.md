# AL Hukuk AI — Firebase Hosting Dağıtım (Deploy) Rehberi 🚀

Bu rehber, Türkiye'nin en profesyonel yapay zekâ destekli hukuk platformu **AL Hukuk AI**'ın statik web arayüzünü (`/website` dizini) Firebase Hosting üzerinde dünya çapında ultra hızlı CDN sunucularından SSL destekli olarak nasıl yayınlayacağınızı adım adım açıklamaktadır.

---

## 📋 Gereksinimler

Dağıtım işlemine başlamadan önce bilgisayarınızda aşağıdaki araçların kurulu olduğundan emin olun:
1. **Node.js** (v16 veya üzeri sürüm önerilir)
2. **NPM** (Node.js ile birlikte otomatik olarak yüklenir)

---

## 🛠️ Adım Adım Dağıtım Süreci

### 1. Adım: Firebase CLI Aracını Kurun
Firebase komut satırı araçlarını bilgisayarınıza küresel olarak yüklemek için terminalinizde aşağıdaki komutu çalıştırın:

```bash
npm install -g firebase-tools
```

### 2. Adım: Google Hesabınızla Giriş Yapın
Google / Firebase hesabınızı CLI aracına bağlamak için terminale şu komutu yazın. Bu komut tarayıcınızı açacak ve sizden izin isteyecektir:

```bash
firebase login
```

### 3. Adım: Projenizi Seçin veya Tanımlayın
Projenizin kök dizininde (`firebase.json` ve `.firebaserc` dosyalarının bulunduğu klasör) terminali açarak Firebase projenizi ilişkilendirin:

```bash
firebase use --add
```

*Alternatif olarak, projenizin kök dizinindeki `.firebaserc` dosyasını açıp `"default": "al-hukuk-ai"` alanına doğrudan kendi Firebase Console üzerindeki gerçek **Proje Kimliğinizi (Project ID)** yazabilirsiniz.*

### 4. Adım: Yayına Alın (Deploy)
Her şey hazır olduğunda, statik web sayfalarınızı ve SEO bileşenlerinizi anında yayına almak için aşağıdaki tek komutu çalıştırmanız yeterlidir:

```bash
firebase deploy --only hosting
```

---

## 🌐 Dağıtım Sonrası Erişim

Dağıtım başarıyla tamamlandığında terminalinizde sitenizin canlı yayındaki güvenli adresleri görüntülenecektir:
- `https://<proje-adi>.web.app`
- `https://<proje-adi>.firebaseapp.com`

---

## ⚙️ Yapılandırma Detayları

Proje kök dizininde yer alan dosyalar şu amaçlarla optimize edilmiştir:
- **`firebase.json`**: Tarayıcı önbellekleme kuralları, temiz URL'ler (`cleanUrls`: `.html` uzantısı olmadan erişim) ve dosya görmezden gelme (ignore) ayarlarını barındırır.
- **`.firebaserc`**: Varsayılan dağıtım projenizin kimliğini tanımlar.
- **`/website`**: Tüm HTML, CSS (Tailwind), sitemap, robots.txt ve görsel varlıklarınızı içeren optimize edilmiş dağıtım klasörüdür.

---
*AL Hukuk AI — Profesyonel ve Güvenilir Hukuki Çözümler.*
