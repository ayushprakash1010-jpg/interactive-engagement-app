const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/admin/src/lib/admin-api.ts');
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split(/\r?\n/);

// We want to delete the duplicated block that got inserted.
// The duplicated block starts around 535 with: "  if (params.limit) q.set('limit', params.limit.toString());"
// And ends right before "// ── USER MANAGEMENT MUTATIONS" which is at line 727 (index 726).

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (params.limit) q.set('limit', params.limit.toString());" && startIdx === -1) {
    startIdx = i;
  }
  if (lines[i] === "// ── USER MANAGEMENT MUTATIONS ────────────────────────────────────────────────" && endIdx === -1 && i > startIdx) {
    endIdx = i;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx);
  // Also we need to close the suspendUser function properly before that.
  // The line before startIdx is "  return adminFetch<{ success: boolean }>(`admin/users/${encodeURIComponent(id)}/suspend`, {"
  // We need to add "    method: 'PATCH',\n    body: JSON.stringify({ reason }),\n  });\n}"
  
  lines.splice(startIdx, 0, 
    "    method: 'PATCH',",
    "    body: JSON.stringify({ reason }),",
    "  });",
    "}"
  );

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('Fixed admin-api.ts');
} else {
  console.log('Could not find indices!', startIdx, endIdx);
}
