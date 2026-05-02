#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mesuresPath = path.join(root, 'src', 'assets', 'data', 'mesures.json');
const propositionsDir = path.join(root, 'content', 'propositions');

if (!fs.existsSync(mesuresPath)) {
  console.error('ERROR: mesures.json not found at', mesuresPath);
  process.exit(2);
}
if (!fs.existsSync(propositionsDir)) {
  console.error('ERROR: propositions directory not found at', propositionsDir);
  process.exit(2);
}

const mesuresRaw = fs.readFileSync(mesuresPath, 'utf8');
let mesuresJSON;
try { mesuresJSON = JSON.parse(mesuresRaw); } catch (err) {
  console.error('ERROR: Failed to parse mesures.json:', err.message);
  process.exit(2);
}

// Build programme map (id -> title)
const programmeMap = {};
if (Array.isArray(mesuresJSON.chapitres)) {
  mesuresJSON.chapitres.forEach(ch => {
    if (Array.isArray(ch.mesures)) {
      ch.mesures.forEach(m => {
        if (m && typeof m.id !== 'undefined') programmeMap[Number(m.id)] = String(m.titre || '').trim();
      });
    }
  });
} else if (Array.isArray(mesuresJSON.mesures)) {
  mesuresJSON.mesures.forEach(m => { programmeMap[Number(m.id)] = String(m.titre || '').trim(); });
} else {
  console.error('ERROR: mesures.json structure unexpected (no chapitres or mesures array)');
  process.exit(2);
}

const programmeIds = new Set(Object.keys(programmeMap).map(k => Number(k)));

const files = fs.readdirSync(propositionsDir).filter(f => f.endsWith('.md'));

const extras = [];
const mismatches = [];

files.forEach(file => {
  const fp = path.join(propositionsDir, file);
  const txt = fs.readFileSync(fp, 'utf8');
  const fm = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return;
  const meta = fm[1];
  const idMatch = meta.match(/^id:\s*(\d+)/m);
  const titreMatch = meta.match(/^titre:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/m);
  if (!idMatch) return;
  const id = Number(idMatch[1]);
  let titre = null;
  if (titreMatch) titre = (titreMatch[1]||titreMatch[2]||titreMatch[3]||'').trim();
  if (!programmeIds.has(id)) {
    extras.push({ id, titre, file });
  } else {
    const progTitle = (programmeMap[id]||'').trim();
    // Normalize some punctuation/spaces for looser comparison
    const norm = s => (s||'').replace(/[“”«»"'\u2019\u2018]/g, '"').replace(/\s+/g,' ').trim();
    if (titre && norm(titre) !== norm(progTitle)) {
      mismatches.push({ id, file, propositionTitle: titre, programmeTitle: progTitle });
    }
  }
});

console.log('--- RESULT: propositions vs programme ---');
console.log('Total proposition files:', files.length);
console.log('Total programme measures:', programmeIds.size);
console.log('');

if (extras.length === 0) console.log('No propositions found that are NOT in the programme.');
else {
  console.log('Propositions NOT in programme:');
  extras.forEach(e => console.log(`${e.id} — ${e.titre || '(no title)'} — ${e.file}`));
}

console.log('');
if (mismatches.length === 0) console.log('No title mismatches between proposition files and programme measures.');
else {
  console.log('Title mismatches found:');
  mismatches.forEach(m => console.log(`${m.id} — file:${m.file} — proposition:"${m.propositionTitle}" — programme:"${m.programmeTitle}"`));
}

// Exit code 0
process.exit(0);
