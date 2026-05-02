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

function parseTagsFromString(s){
  // s is the inner content between [ and ]
  const tags = [];
  const re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|([^,]+)/g;
  let m;
  while((m = re.exec(s)) !== null){
    let token = m[1] || m[2] || m[3];
    if(!token) continue;
    token = token.replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\\\\/g,'\\');
    token = token.replace(/^\s+|\s+$/g,'');
    token = token.replace(/^['"]+|['"]+$/g,'');
    if(token) tags.push(token);
  }
  return tags.map(t => t.trim());
}

function stringifyTags(tags){
  return '[' + tags.map(t => '"' + t.replace(/"/g,'\"') + '"').join(', ') + ']';
}

let changed = 0;
let files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
for(const file of files){
  const fp = path.join(DIR, file);
  let content = fs.readFileSync(fp, 'utf8');
  const fm = extractFrontMatter(content);
  if(!fm) continue;
  const lines = parseFrontLines(fm.front);
  let newLines = [...lines];
  let tagsFound = false;
  for(let i=0;i<lines.length;i++){
    const line = lines[i];
    const trimmed = line.trim();
    if(trimmed.startsWith('tags:')){
      // Extract inside brackets
      const brMatch = line.match(/\[(.*)\]\s*$/);
      const inner = brMatch ? brMatch[1] : '';
      const tags = parseTagsFromString(inner);
      // ensure 'programme' tag exists
      if(!tags.map(t=>t.toLowerCase()).includes('programme')) tags.push('programme');
      // dedupe while preserving order
      const seen = new Set();
      const deduped = [];
      for(const t of tags){
        const key = t.trim();
        if(!seen.has(key.toLowerCase())){ seen.add(key.toLowerCase()); deduped.push(key); }
      }
      newLines[i] = 'tags: ' + stringifyTags(deduped);
      tagsFound = true;
    }
    if(trimmed.startsWith('auteur:')){
      newLines[i] = 'auteur: "Équipe municipale"';
    }
  }
  if(!tagsFound){
    // insert tags line after the icone line if possible (best-effort)
    let insertAt = 0;
    for(let i=0;i<newLines.length;i++){ if(newLines[i].trim().startsWith('icone:')){ insertAt = i+1; break; } }
    newLines.splice(insertAt,0,'tags: ["programme"]');
  }
  const newFront = newLines.join('\n');
  const newContent = '---\n' + newFront + '\n---\n' + fm.body;
  if(newContent !== fm.raw){
    fs.writeFileSync(fp, newContent, 'utf8');
    changed++;
    console.log('Fixed', file);
  }
}
console.log('Sanitization complete. Files changed:', changed);

// exit non-zero if nothing changed? just exit 0
process.exit(0);
