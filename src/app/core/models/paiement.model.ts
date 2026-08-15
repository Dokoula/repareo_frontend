import { Reparation } from './reparation.model';

export type StatutPaiement = 'EN_ATTENTE' | 'EFFECTUE' | 'ANNULE';

export interface ModePaiement {
  id: number;
  nom: string;
  description?: string;
  icon?: string;
}

export interface Paiement {
  id: number;
  reparation: Reparation | number;
  montant: number;
  mode_paiement: ModePaiement | number;
  statut: StatutPaiement;
  date_paiement: string;
  reference_transaction?: string;
}

export interface EffectuerPaiementRequest {
  mode_paiement: number;
  reference_transaction?: string;
}
