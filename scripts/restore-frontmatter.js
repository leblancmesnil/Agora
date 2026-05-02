/**
 * One-time script: restores frontmatter to markdown files using the existing
 * generated propositions.json as the metadata source.
 *
 * Run: node scripts/restore-frontmatter.js
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'propositions');
const JSON_FILE = path.join(__dirname, '..', 'src', 'assets', 'data', 'propositions.json');

const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

let restored = 0;
let skipped = 0;

for (const prop of data.propositions) {
  const filePath = path.join(CONTENT_DIR, `${prop.slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${prop.slug}.md`);
    skipped++;
    continue;
  }

  const body = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n').trim();

  // Check if file already has frontmatter
  if (body.startsWith('---\n')) {
    skipped++;
    continue;
  }

  const tags = Array.isArray(prop.tags) ? `[${prop.tags.join(', ')}]` : '[]';

  const frontmatter = [
    '---',
    `id: ${prop.id}`,
    `titre: ${prop.titre}`,
    `categorie: ${prop.categorie}`,
    `categorie_id: ${prop.categorie_id}`,
    `icone: ${prop.icone}`,
    `tags: ${tags}`,
    `auteur: ${prop.auteur}`,
    `date: ${prop.date}`,
    `polisId: ${prop.polisId || ''}`,
    `statut: ${prop.statut}`,
    '---',
  ].join('\n');

  const output = frontmatter + '\n' + body + '\n';
  fs.writeFileSync(filePath, output, 'utf-8');
  restored++;
}

console.log(`✅ Restored frontmatter in ${restored} files (${skipped} skipped)`);
