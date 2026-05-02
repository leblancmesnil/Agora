import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError } from 'rxjs';
import { Proposition, PropositionsData } from '../models/proposition.model';

@Injectable({ providedIn: 'root' })
export class PropositionsService {
  private readonly http = inject(HttpClient);
  private data$?: Observable<PropositionsData>;

  /** Lightweight index — no body, used for listing/searching */
  getData(): Observable<PropositionsData> {
    if (!this.data$) {
      this.data$ = this.http
        .get<PropositionsData>('assets/data/propositions.json')
        .pipe(shareReplay(1));
    }
    return this.data$;
  }

  /** Get a single proposition (body included).
   * Try to fetch the markdown file `assets/propositions/<slug>.md` at runtime first.
   * If that fails (not found or network issue), fall back to the generated `propositions.json`.
   */
  getPropositionMarkdown(slug: string): Observable<Proposition> {
    const mdPath = `assets/propositions/${slug}.md`;
    return (this.http.get(mdPath, { responseType: 'text' }) as Observable<string>).pipe(
      map(raw => this.parseMarkdown(raw, slug)),
      catchError(() =>
        this.getData().pipe(
          map(data => {
            const found = data.propositions.find(p => p.slug === slug);
            if (!found) throw new Error('Not found');
            return found as Proposition;
          })
        )
      ),
      shareReplay(1)
    );
  }

  private parseMarkdown(raw: string, slug: string): Proposition {
    const normalized = raw.replace(/\r\n/g, '\n');
    const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { id: 0, titre: slug, categorie: '', categorie_id: 0, icone: '', tags: [], auteur: '', date: '', polisId: '', statut: '', slug, body: raw };

    const meta: Record<string, any> = {};
    for (const line of match[1].split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      let value: any = line.slice(colonIdx + 1).trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
      } else {
        value = value.replace(/^["']|["']$/g, '');
      }
      meta[key] = value;
    }

    return {
      id: meta['id'] ?? 0,
      titre: meta['titre'] ?? '',
      categorie: meta['categorie'] ?? '',
      categorie_id: meta['categorie_id'] ?? 0,
      icone: meta['icone'] ?? '',
      tags: Array.isArray(meta['tags']) ? meta['tags'] : [],
      auteur: meta['auteur'] ?? '',
      date: meta['date'] ?? '',
      polisId: meta['polisId'] ?? '',
      statut: meta['statut'] ?? '',
      slug,
      body: match[2].trim(),
    };
  }
}
