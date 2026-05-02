export interface Proposition {
  id: number;
  titre: string;
  categorie: string;
  categorie_id: number;
  icone: string;
  tags: string[];
  auteur: string;
  date: string;
  polisId: string;
  statut: string;
  slug: string;
  body?: string; // optional — fetched directly from .md at runtime
}

export interface Categorie {
  id: number;
  titre: string;
  icone: string;
}

export interface PropositionsData {
  meta: {
    generatedAt: string;
    count: number;
  };
  categories: Categorie[];
  tags: string[];
  propositions: Proposition[];
}
