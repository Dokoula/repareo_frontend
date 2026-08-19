import { Client } from './client.model';
import { Reparateur, CategorieCompetence } from './reparateur.model';

export type StatutDemande =
  | 'EN_ATTENTE'
  | 'ASSIGNEE'
  | 'ACCEPTEE'
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

export interface ReparateurSuggestion {
  id: number;
  nom: string;
  ville: string;
  experience: number;
}

export interface MiseEnRelationResult {
  status: boolean;
  demande_id: number;
  categorie: string | null;
  statut: StatutDemande;
  message?: string;
  reparateurs: ReparateurSuggestion[];
  analyse_par: 'OLLAMA' | 'ANALYSE_LOCALE' | 'RECHERCHE_ENREGISTREE';
}
