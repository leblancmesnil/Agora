import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropositionsService } from '../../services/propositions.service';
import { Proposition } from '../../models/proposition.model';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-proposition',
  imports: [RouterLink],
  templateUrl: './proposition.html',
  styleUrl: './proposition.scss'
})
export class PropositionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PropositionsService);
  private readonly sanitizer = inject(DomSanitizer);

  protected proposition = signal<Proposition | null>(null);
  protected polisUrl = signal<SafeResourceUrl | null>(null);
  protected polisHref = signal<string | null>(null);
  protected showPolis = signal<boolean>(false);
  protected bodyHtml = signal<SafeHtml | null>(null);
  protected prev = signal<Proposition | null>(null);
  protected next = signal<Proposition | null>(null);

  constructor() {
    // React to route slug changes so navigation between propositions reloads content
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {
        this.proposition.set(null);
        this.bodyHtml.set(null);
        this.prev.set(null);
        this.next.set(null);
        this.polisHref.set(null);
        this.polisUrl.set(null);
        this.showPolis.set(false);
        return;
      }

      // Reset UI while loading the new proposition
      this.proposition.set(null);
      this.bodyHtml.set(null);
      this.polisHref.set(null);
      this.polisUrl.set(null);
      this.showPolis.set(false);

      // Fetch directly from the .md file — single source of truth
      this.service.getPropositionMarkdown(slug).subscribe({
        next: prop => {
          this.proposition.set(prop);
          const html = marked.parse(prop.body ?? '');
          this.bodyHtml.set(this.sanitizer.bypassSecurityTrustHtml(html as string));
          if (prop.polisId) {
            const url = `https://pol.is/${prop.polisId}`;
            this.polisHref.set(url);
            this.polisUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
            this.showPolis.set(true);
          } else {
            this.showPolis.set(false);
          }

          // Determine previous / next propositions from the lightweight index
          this.service.getData().subscribe(data => {
            const list = data.propositions || [];
            const idx = list.findIndex(p => p.slug === slug);
            if (idx !== -1) {
              this.prev.set(idx > 0 ? list[idx - 1] : null);
              this.next.set(idx < list.length - 1 ? list[idx + 1] : null);
            } else {
              this.prev.set(null);
              this.next.set(null);
            }
          });
        },
        error: () => {
          this.proposition.set(null);
          this.bodyHtml.set(null);
          this.prev.set(null);
          this.next.set(null);
        }
      });
    });
  }

  protected forceShowPolis() {
    this.showPolis.set(true);
  }

  /**
   * Try to detect if the remote Pol.is discussion exists by fetching its
   * embed endpoint (which serves JSONP/JS and may have permissive CORS).
   * Falls back to no-cors opaque response detection.
   * Returns:
   *  - true  => confirmed exists
   *  - false => confirmed missing
   *  - null  => inconclusive
   */
  private async checkPolisExists(url: string): Promise<boolean | null> {
    // First try the human-friendly page (https://pol.is/<id>) with CORS.
    // Some servers allow this and we can directly detect 200 vs 404.
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (res.ok) return true;
      if (res.status === 404) return false;
    } catch (e) {
      // CORS/network error — fall through to try the API endpoint below.
    }

    // If the main page check didn't confirm existence, try the API embed
    // endpoint which in some deployments exposes CORS headers.
    try {
      const polisId = url.split('/').pop();
      const embedUrl = `https://pol.is/api/v3/participation?conversation_id=${polisId}`;
      const res = await fetch(embedUrl, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (res.ok) return true;
      if (res.status === 404) return false;
    } catch (e) {
      // CORS/network error — cannot determine from client side.
    }

    // Last resort: attempt a no-cors fetch to detect network-level failures.
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-cache' });
      return null; // opaque response — inconclusive
    } catch (e) {
      return null;
    }
  }
}
