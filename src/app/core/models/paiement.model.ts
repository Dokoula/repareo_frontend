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
  identifiant_payeur?: string;
  commission_plateforme: number;
  montant_reparateur: number;
}

export interface EffectuerPaiementRequest {
  mode_paiement: number;
  identifiant_payeur: string;
}

export interface MouvementFinancier {
  id: number;
  type_mouvement: 'REVENU_REPARATION' | 'COMMISSION' | 'RETRAIT';
  sens: 'CREDIT' | 'DEBIT';
  montant: number;
  libelle: string;
  date_creation: string;
}

export interface Retrait {
  id: number;
  montant: number;
  moyen: 'WAVE' | 'ORANGE_MONEY' | 'BANQUE';
  destination: string;
  statut: 'EFFECTUE' | 'REFUSE';
  reference: string;
  date_creation: string;
}

export interface Portefeuille {
  solde: number;
  commission: number;
  mouvements: MouvementFinancier[];
  retraits: Retrait[];
}
