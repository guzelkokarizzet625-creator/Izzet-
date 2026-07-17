const fs = require('fs');
const file = 'nextjs-app/src/app/api/gemini/route.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /case "PETITION_DRAFT":[\s\S]*?\(İmza\)`/g;
const replacement = `case "PETITION_DRAFT":
      return \`NÖBETÇİ MAHKEME HAKİMLİĞİ'NE

DAVACI: [Müvekkil Adı/Unvanı]
DAVALI: [Karşı Taraf Adı/Unvanı]

KONU: Yukarıda belirttiğiniz parametreler ve olay örgüsü doğrultusunda dava açılması talebidir.

AÇIKLAMALAR:
Form üzerinden ilettiğiniz bilgiler:
\${prompt.split('--- INTERAKTİF PARAMETRELER ---')[1]?.split('---')[0]?.trim() || 'Sistem tarafından işleniyor...'}

Belirttiğiniz deliller:
\${prompt.split('--- DELİL VE BELGE LİSTESİ ---')[1]?.split('---')[0]?.trim() || 'Sistem tarafından işleniyor...'}

Ek Açıklamalarınız:
\${prompt.split('--- EK AÇIKLAMALAR VE OLAYLAR ---')[1]?.split('---')[0]?.trim() || 'Sistem tarafından işleniyor...'}

HUKUKI NEDENLER: HMK, TBK ve ilgili tüm yasal mevzuat.
DELİLLER: Yukarıda belirttiğiniz tüm delil ve belgeler, Yargıtay emsal kararları, tanık beyanları ve bilirkişi incelemesi.

NETİCE-İ TALEP: İzah edilen nedenler ve yasal mevzuat uyarınca; haklı davamızın kabulüne, yargılama giderleri ile vekâlet ücretinin davalı tarafa yükletilmesine karar verilmesini vekâleten arz ve talep ederiz.

Davacı Vekili
Avukat
(İmza)\``;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log("Fixed block");
