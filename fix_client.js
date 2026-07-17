const fs = require('fs');
const file = 'nextjs-app/src/app/api/gemini/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Ahmet Alkan/g, '[Müvekkil Adı]');

fs.writeFileSync(file, content);
console.log("Success");
