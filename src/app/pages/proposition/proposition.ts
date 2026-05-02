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
          this.polisUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        }
      },
      error: () => {
        this.proposition.set(null);
        this.bodyHtml.set(null);
      }
    });
  }
}
