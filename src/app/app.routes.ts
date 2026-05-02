import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'agora', pathMatch: 'full' },
  {
    path: 'agora',
    loadComponent: () => import('./pages/agora/agora').then(m => m.AgoraPage)
  },
  {
    path: 'proposition/:slug',
    loadComponent: () => import('./pages/proposition/proposition').then(m => m.PropositionPage)
  },
  {
    path: 'soumettre',
    loadComponent: () => import('./pages/soumettre/soumettre').then(m => m.SoumettrePage)
  },
];
