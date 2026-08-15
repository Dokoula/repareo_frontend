import { User } from './user.model';

export interface Message {
  id: number;
  conversation: number;
  expediteur: User;
  contenu: string;
  date_envoi: string;
  lu: boolean;
}
