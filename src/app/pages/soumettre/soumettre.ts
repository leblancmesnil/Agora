import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropositionsService } from '../../services/propositions.service';

@Component({
  selector: 'app-soumettre',
  imports: [FormsModule, RouterLink],
  templateUrl: './soumettre.html',
  styleUrl: './soumettre.scss'
})
export class SoumettrePage {
  private readonly service = inject(PropositionsService);

  protected allTags = signal<string[]>([]);
  protected titre = signal('');
  protected description = signal('');
  protected auteur = signal('');
  protected tagsInput = signal('');
  protected submitted = signal(false);
  protected prUrl = signal('');

  // GitHub repo info — update when repo is created
  private readonly GITHUB_OWNER = 'leblancmesnil';
  private readonly GITHUB_REPO = 'agora';

  constructor() {
    this.service.getData().subscribe(data => {
      this.allTags.set(data.tags);
    });
  }

  onSubmit(): void {
    const title = this.titre();
    const desc = this.description();
    const auteur = this.auteur() || 'Anonyme';
    const tags = this.tagsInput()
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (!title || !desc) return;

    // Generate the markdown content for the new proposition
    const date = new Date().toISOString().split('T')[0];
    const slug = this.slugify(title);
    const filename = `content/propositions/new-${slug}.md`;

    const markdown = [
      '---',
      `titre: "${title}"`,
      `categorie: "À catégoriser"`,
      `categorie_id: 0`,
      `icone: "💡"`,
      `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
      `auteur: "${auteur}"`,
      `date: "${date}"`,
      `polisId: ""`,
      `statut: "en attente"`,
      '---',
      '',
      `# ${title}`,
      '',
      `> Proposition soumise par ${auteur} le ${date}.`,
      '',
      '## Description',
      '',
      desc,
      '',
    ].join('\n');

    // Build a GitHub "new file" URL that pre-fills content (creates a PR)
    const encodedContent = encodeURIComponent(markdown);
    const encodedFilename = encodeURIComponent(filename);
    const commitMessage = encodeURIComponent(`Nouvelle proposition: ${title}`);

    this.prUrl.set(
      `https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/new/main?filename=${encodedFilename}&value=${encodedContent}&message=${commitMessage}&description=${encodeURIComponent('Nouvelle proposition soumise via le formulaire Agora.')}`
    );

    this.submitted.set(true);
  }

  private slugify(text: string): string {
    return text
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
