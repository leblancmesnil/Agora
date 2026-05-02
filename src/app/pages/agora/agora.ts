import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropositionsService } from '../../services/propositions.service';
import { Proposition, Categorie } from '../../models/proposition.model';

@Component({
  selector: 'app-agora',
  imports: [FormsModule, RouterLink],
  templateUrl: './agora.html',
  styleUrl: './agora.scss'
})
export class AgoraPage {
  private readonly service = inject(PropositionsService);

  protected propositions = signal<Proposition[]>([]);
  protected categories = signal<Categorie[]>([]);
  protected allTags = signal<string[]>([]);

  protected searchText = signal('');
  protected selectedCategorie = signal<number | null>(null);
  protected selectedTag = signal<string | null>(null);

  protected filteredPropositions = computed(() => {
    let result = this.propositions();
    const search = this.searchText().toLowerCase();
    const catId = this.selectedCategorie();
    const tag = this.selectedTag();

    if (search) {
      result = result.filter(p =>
        p.titre.toLowerCase().includes(search) ||
        p.tags.some(t => t.toLowerCase().includes(search))
      );
    }
    if (catId) {
      result = result.filter(p => p.categorie_id === catId);
    }
    if (tag) {
      result = result.filter(p => p.tags.includes(tag));
    }
    return result;
  });

  protected groupedByCategorie = computed(() => {
    const props = this.filteredPropositions();
    const groups = new Map<number, { categorie: Categorie; propositions: Proposition[] }>();

    for (const p of props) {
      if (!groups.has(p.categorie_id)) {
        const cat = this.categories().find(c => c.id === p.categorie_id);
        if (cat) {
          groups.set(p.categorie_id, { categorie: cat, propositions: [] });
        }
      }
      groups.get(p.categorie_id)?.propositions.push(p);
    }

    return Array.from(groups.values()).sort((a, b) => a.categorie.id - b.categorie.id);
  });

  constructor() {
    this.service.getData().subscribe(data => {
      this.propositions.set(data.propositions);
      this.categories.set(data.categories);
      this.allTags.set(data.tags);
    });
  }

  onSearch(value: string): void {
    this.searchText.set(value);
  }

  onCategorieChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCategorie.set(val ? Number(val) : null);
  }

  onTagChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedTag.set(val || null);
  }

  selectTag(tag: string): void {
    this.selectedTag.set(this.selectedTag() === tag ? null : tag);
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectedCategorie.set(null);
    this.selectedTag.set(null);
  }
}
