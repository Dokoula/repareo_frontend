import { Client } from './client.model';
import { Reparateur } from './reparateur.model';
import { Reparation } from './reparation.model';

export interface Avis {
  id: number;
  reparation: Reparation | number;
  client: Client;
  reparateur: Reparateur;
  note: number;
  commentaire?: string;
  date_avis: string;
}

export interface CreateAvisRequest {
  note: number;
  commentaire?: string;
}
