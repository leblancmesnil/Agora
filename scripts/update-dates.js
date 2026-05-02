const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'content', 'propositions');

function normalizeNewlines(s){ return s.replace(/\r\n/g,'\n'); }

function extractFrontMatter(content){
  const normalized = normalizeNewlines(content);
  const m = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!m) return null;
  return { front: m[1], body: m[2], raw: normalized };
}

function parseFrontLines(front){
  return front.split('\n');
}

function updateDateLine(lines, newDate){
  let found = false;
  for(let i=0;i<lines.length;i++){
    const trimmed = lines[i].trim();
    if(/^date:\s*/.test(trimmed)){
      lines[i] = 'date: "' + newDate + '"';
      found = true;
      break;
    }
  }
  return found;
}

const NEW_DATE = '2026-03-22';
let changed = 0;
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
for(const file of files){
  const fp = path.join(DIR, file);
  const content = fs.readFileSync(fp, 'utf8');
  const fm = extractFrontMatter(content);
  if(!fm) continue;
  const lines = parseFrontLines(fm.front);
  const had = updateDateLine(lines, NEW_DATE);
  if(!had){
    // insert after auteur if present, else after tags, else at top
    let insertAt = 0;
    for(let i=0;i<lines.length;i++){
      const t = lines[i].trim();
      if(t.startsWith('auteur:')){ insertAt = i+1; break; }
      if(t.startsWith('tags:')){ insertAt = i+1; }
    }
    lines.splice(insertAt, 0, 'date: "' + NEW_DATE + '"');
  }
  const newFront = lines.join('\n');
  const newContent = '---\n' + newFront + '\n---\n' + fm.body;
  if(newContent !== fm.raw){
    fs.writeFileSync(fp, newContent, 'utf8');
    changed++;
    console.log('Updated', file);
  }
}
console.log('Date update complete. Files changed:', changed);
process.exit(0);
