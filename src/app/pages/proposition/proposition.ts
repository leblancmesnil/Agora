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

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

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

          // Try a lightweight existence check (may fail if the remote server blocks CORS).
          // If the check succeeds and returns OK, automatically show the Pol.is iframe.
          this.checkPolisExists(url).then(exists => {
            if (exists) this.showPolis.set(true);
          });
        }
      },
      error: () => {
        this.proposition.set(null);
        this.bodyHtml.set(null);
      }
    });
  }

  protected forceShowPolis() {
    this.showPolis.set(true);
  }

  private async checkPolisExists(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-cache' });
      return res.ok;
    } catch (e) {
      // Could be a CORS restriction or network issue — default to hiding the iframe.
      return false;
    }
  }
}
