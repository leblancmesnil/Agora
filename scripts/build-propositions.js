/**
 * Build script: reads all markdown propositions and generates a JSON index
 * that Angular can consume at runtime.
 * 
 * Run: node scripts/build-propositions.js
 * Output: src/assets/data/propositions.json
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'propositions');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'assets', 'data', 'propositions.json');

function parseFrontmatter(content) {
  // normalize line endings to handle both LF and CRLF
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

function buildIndex() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort();
  const propositions = [];
  const categories = new Map();
  const allTags = new Set();

  for (const file of files) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const parsed = parseFrontmatter(content);
    if (!parsed) {
      console.warn(`⚠️  Skipping ${file}: invalid frontmatter`);
      continue;
    }

    const proposition = {
      id: parsed.id,
      titre: parsed.titre,
      categorie: parsed.categorie,
      categorie_id: parsed.categorie_id,
      icone: parsed.icone,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      auteur: parsed.auteur || 'Anonyme',
      date: parsed.date || new Date().toISOString().split('T')[0],
      polisId: parsed.polisId || '',
      statut: parsed.statut || 'publiée',
      slug: file.replace('.md', ''),
      // NOTE: do NOT include the body in the JSON anymore — keep bodies in the .md files
    };

    propositions.push(proposition);

    // Overwrite the source markdown to remove frontmatter and keep only the body.
    // This ensures metadata lives only in the generated JSON index.
    try {
      const outPath = path.join(CONTENT_DIR, file);
      fs.writeFileSync(outPath, parsed.body + '\n', 'utf-8');
    } catch (e) {
      console.warn(`⚠️  Failed to rewrite ${file}: ${e.message}`);
    }

    // Collect categories
    if (parsed.categorie && parsed.categorie_id) {
      categories.set(parsed.categorie_id, {
        id: parsed.categorie_id,
        titre: parsed.categorie,
        icone: parsed.icone,
      });
    }

    // Collect tags
    if (Array.isArray(parsed.tags)) {
      parsed.tags.forEach(t => allTags.add(t));
    }
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

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Built ${propositions.length} propositions → ${OUTPUT_FILE}`);
  console.log(`   ${categories.size} categories, ${allTags.size} tags`);
}

buildIndex();
