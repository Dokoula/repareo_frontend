import { User } from './user.model';

export type Disponibilite = 'DISPONIBLE' | 'OCCUPE' | 'INDISPONIBLE';

export interface CategorieCompetence {
  id: number;
  nom: string;
  description?: string;
}

export interface DossierReparateur {
  id: number;
  reparateur: number;
  carte_identite:      string | null;
  diplome_certification: string | null;
  cv:                  string | null;
  autre_document:      string | null;
  commentaire_admin:   string;
  date_soumission:     string;
  date_traitement:     string | null;
}

export interface Reparateur {
  id: number;
  user: User;
  specialite: string;
  experience: number;
  note_moyenne?: number;
  statut_validation: boolean;
  disponibilite: Disponibilite;
  categories?: CategorieCompetence[];
  dossier?: DossierReparateur | null;
}
