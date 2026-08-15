import { Client } from './client.model';
import { Demande } from './demande.model';
import { Reparateur } from './reparateur.model';
import { Message } from './message.model';

export interface Conversation {
  id: number;
  client: Client;
  reparateur: Reparateur;
  demande: Demande;
  date_creation: string;
  messages?: Message[];
}
