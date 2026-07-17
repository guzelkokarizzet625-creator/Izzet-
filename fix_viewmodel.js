const fs = require('fs');
const file = 'app/src/main/java/com/example/ui/viewmodel/LegalViewModel.kt';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Check if there are no cases, and if so populate premium default cases, events, documents, and chat[\s\S]*?\}\s*fun createCaseFile/g;

const replacement = `// Check if there are no cases
            // We intentionally do not populate mock case data anymore for a clean production state.
        }
    }

    fun createCaseFile`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Not found");
}
