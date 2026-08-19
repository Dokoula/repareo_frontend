import { Reparateur } from './reparateur.model';
import { User } from './user.model';

export interface MessageAdministration {
  id: number;
  expediteur: User;
  contenu: string;
  lu: boolean;
  date_envoi: string;
}

export interface ConversationAdministration {
  id: number;
  reparateur: Reparateur;
  date_creation: string;
  messages: MessageAdministration[];
}
