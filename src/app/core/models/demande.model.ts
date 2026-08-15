import { Client } from './client.model';
import { Reparateur, CategorieCompetence } from './reparateur.model';

export type StatutDemande =
  | 'EN_ATTENTE'
  | 'ASSIGNEE'
  | 'DIAGNOSTIC'
  | 'DEVIS_ENVOYE'
  | 'DEVIS_ACCEPTE'
  | 'DEVIS_REFUSE'
  | 'EN_REPARATION'
  | 'PRET'
  | 'TERMINEE'
  | 'ANNULEE';

export interface Demande {
  id: number;
  client: Client;
  reparateur?: Reparateur | null;
  date_creation: string;
  marque_ordinateur: string;
  modele_ordinateur: string;
  description_probleme: string;
  categorie_competence?: CategorieCompetence | null;
  statut: StatutDemande;
  date_recuperation?: string | null;
}

export interface CreateDemandeRequest {
  marque_ordinateur: string;
  modele_ordinateur: string;
  description_probleme: string;
  date_recuperation?: string | null;
}

export interface IAReparateurSuggestion {
  id: number;
  nom: string;
  ville: string;
  note: number;
  experience: number;
}

export interface IAAnalysisResult {
  status: boolean;
  categorie: string | null;
  statut: StatutDemande;
  message?: string;
  reparateurs: IAReparateurSuggestion[];
}
