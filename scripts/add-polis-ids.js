/**
 * Add Pol.is IDs to all proposition markdown files.
 * Format: 93150-XXX (where XXX is the zero-padded proposition id)
 * 
 * Run: node scripts/add-polis-ids.js
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'propositions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

let updated = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf-8');

  // Extract id from frontmatter
  const idMatch = content.match(/^id:\s*(\d+)/m);
  if (!idMatch) continue;

  const id = idMatch[1].padStart(3, '0');
  const polisId = `93150-${id}`;

  // Replace empty polisId
  if (content.includes('polisId: ""')) {
    content = content.replace('polisId: ""', `polisId: "${polisId}"`);
    fs.writeFileSync(fp, content, 'utf-8');
    updated++;
  }
}

console.log(`✅ Updated ${updated} propositions with Pol.is IDs (format: 93150-XXX)`);
