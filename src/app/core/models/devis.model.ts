import { Diagnostic } from './diagnostic.model';

export type StatutDevis = 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';

export interface Devis {
  id: number;
  diagnostic: Diagnostic | number;
  pourcentage_reussite: number;
  date_devis: string;
  statut_devis: StatutDevis;
  delai_estime: number;
  montant_diagnostic: number;
  montant_reparation: number;
  montant_total: number;
}

export interface CreateDevisRequest {
  montant_diagnostic: number;
  montant_reparation: number;
  montant_total: number;
  delai_estime: number;
  pourcentage_reussite?: number;
}
