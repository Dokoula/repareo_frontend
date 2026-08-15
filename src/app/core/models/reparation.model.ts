import { Devis } from './devis.model';

export type StatutReparation = 'EN_REPARATION' | 'PRET';

export interface Reparation {
  id: number;
  devis: Devis | number;
  date_debut: string;
  date_fin?: string | null;
  commentaire?: string;
  statut: StatutReparation;
}
