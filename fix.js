const fs = require('fs');
const file = 'nextjs-app/src/app/api/gemini/route.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /case "PETITION_DRAFT":[\s\S]*?Belirttiğiniz deliller:/;
const replacement = `case "PETITION_DRAFT":
      return \`NÖBETÇİ MAHKEME HAKİMLİĞİ'NE

DAVACI: [Müvekkil Adı/Unvanı]
DAVALI: [Karşı Taraf Adı/Unvanı]

KONU: Yukarıda belirttiğiniz parametreler ve olay örgüsü doğrultusunda dava açılması talebidir.

AÇIKLAMALAR:
Form üzerinden ilettiğiniz bilgiler:
\${prompt.split('--- INTERAKTİF PARAMETRELER ---')[1]?.split('---')[0]?.trim() || 'Sistem tarafından işleniyor...'}

Belirttiğiniz deliller:`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log("Fixed part 1");
