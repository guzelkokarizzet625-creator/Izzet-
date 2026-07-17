const fs = require('fs');
const file = 'nextjs-app/src/app/api/gemini/route.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /function getMockLegalAiResponse[\s\S]*?\}\s*$/;
const replacement = `function getMockLegalAiResponse(prompt: string, taskType: string): string {
  // Empty production safe fallback response to prevent dummy data leaks
  return "AI Sunucusuna bağlanılamadı. Lütfen tekrar deneyiniz.";
}
`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Not found");
}
