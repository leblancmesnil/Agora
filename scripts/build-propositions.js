/**
 * Build script: reads all markdown propositions (with frontmatter) and generates
 * a JSON index that Angular can consume at runtime for listing/search.
 *
 * The markdown files are the SINGLE SOURCE OF TRUTH — they are never modified.
 * The JSON is a generated cache. It is only regenerated when:
 *   - The output file does not exist, OR
 *   - The output file is older than 1 day, OR
 *   - The --force flag is passed.
 *
 * Run: node scripts/build-propositions.js [--force]
 * Output: src/assets/data/propositions.json
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'propositions');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'assets', 'data', 'propositions.json');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const forceRebuild = process.argv.includes('--force');
const checkPolisFlag = process.argv.includes('--check-polis') || process.env.CHECK_POLIS === '1';

// Check if regeneration is needed
if (!forceRebuild && fs.existsSync(OUTPUT_FILE)) {
  const stat = fs.statSync(OUTPUT_FILE);
  const age = Date.now() - stat.mtimeMs;
  if (age < ONE_DAY_MS) {
    console.log(`⏭️  Skipping build — propositions.json is less than 1 day old (${Math.round(age / 60000)} min). Use --force to rebuild.`);
    process.exit(0);
  }
}

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatterStr = match[1];
  const body = match[2].trim();
  const meta = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    // Parse numbers
    else if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }
    // Strip quotes
    else {
      value = value.replace(/^["']|["']$/g, '');
    }

    meta[key] = value;
  }

  return { ...meta, body };
}

async function buildIndex() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort();
  const propositions = [];
  const categories = new Map();
  const allTags = new Set();

  for (const file of files) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const parsed = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    if (!parsed) {
      console.warn(`⚠️  Skipping ${file}: no valid frontmatter`);
      continue;
    }

    const rawPolis = (parsed.polisId ?? '').toString().trim();
    const cleanPolisId = /^93150-/.test(rawPolis) ? '' : rawPolis;

    const proposition = {
      id: parsed.id,
      titre: parsed.titre,
      categorie: parsed.categorie,
      categorie_id: parsed.categorie_id,
      icone: parsed.icone,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      auteur: parsed.auteur || 'Anonyme',
      date: parsed.date || new Date().toISOString().split('T')[0],
      polisId: cleanPolisId,
      statut: parsed.statut || 'publiée',
      slug,
    };

    propositions.push(proposition);

    if (parsed.categorie && parsed.categorie_id) {
      categories.set(parsed.categorie_id, {
        id: parsed.categorie_id,
        titre: parsed.categorie,
        icone: parsed.icone,
      });
    }

    if (Array.isArray(parsed.tags)) parsed.tags.forEach(t => allTags.add(t));
  }

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      count: propositions.length,
    },
    categories: Array.from(categories.values()).sort((a, b) => a.id - b.id),
    tags: Array.from(allTags).sort(),
    propositions,
  };

  // Optionally check Pol.is existence for each proposition. This is performed
  // server-side at build time to avoid CORS issues in the browser. Use
  // `--check-polis` or set `CHECK_POLIS=1` in the environment to enable.
  if (checkPolisFlag) {
    console.log('🔎 Checking Pol.is existence for propositions (this may take a while)...');
    const concurrency = 10;
    const queue = propositions.filter(p => p.polisId);

    const workers = new Array(concurrency).fill(null).map(async () => {
      while (queue.length) {
        const prop = queue.shift();
        if (!prop) break;
        try {
          const res = await fetch(`https://pol.is/${prop.polisId}`, { method: 'GET' });
          if (res.status === 404) prop.polisExists = false;
          else if (res.ok) prop.polisExists = true;
          else prop.polisExists = null;
        } catch (e) {
          try {
            const polisId = prop.polisId;
            const embedUrl = `https://pol.is/api/v3/participation?conversation_id=${polisId}`;
            const r2 = await fetch(embedUrl, { method: 'GET' });
            if (r2.status === 404) prop.polisExists = false;
            else if (r2.ok) prop.polisExists = true;
            else prop.polisExists = null;
          } catch (e2) {
            prop.polisExists = null;
          }
        }
      }
    });

    await Promise.all(workers);
    output.meta.polisCheckedAt = new Date().toISOString();
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Built ${propositions.length} propositions → ${OUTPUT_FILE}`);
  console.log(`   ${categories.size} categories, ${allTags.size} tags`);
}

buildIndex().catch(err => {
  console.error(err);
  process.exit(1);
});
