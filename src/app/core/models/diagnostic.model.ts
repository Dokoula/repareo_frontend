import { Demande } from './demande.model';

export interface Diagnostic {
  id: number;
  demande: Demande | number;
  panne_reelle: string;
  reparable: boolean;
  commentaire?: string;
  date_diagnostic: string;
}

export interface CreateDiagnosticRequest {
  panne_reelle: string;
  reparable: boolean;
  commentaire?: string;
}
