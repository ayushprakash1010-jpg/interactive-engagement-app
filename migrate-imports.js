const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/ayush/Downloads/interactive-engagement-app/apps/web/src';

const replaceImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace session-planner
  content = content.replace(/import \{([^}]+)\} from ['"]@\/lib\/session-planner['"];?/g, "import {$1} from '@/lib/ai';");
  
  // Replace copilot-engine
  content = content.replace(/import \{([^}]+)\} from ['"]@\/lib\/copilot-engine['"];?/g, "import {$1} from '@/lib/ai';");
  
  // Replace review-engine
  content = content.replace(/import \{([^}]+)\} from ['"]@\/lib\/review-engine['"];?/g, "import {$1} from '@/lib/ai';");

  if (content !== original) {
    // If the file now has multiple imports from '@/lib/ai', we can consolidate them.
    // For a simple script, leaving multiple `import { X } from '@/lib/ai'` is valid TypeScript,
    // but standardizing is nicer. We'll leave it as valid TS for now.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceImports(fullPath);
    }
  }
};

walk(srcDir);
