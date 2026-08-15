import { User } from './user.model';

export interface Notification {
  id: number;
  utilisateur: User | number;
  titre: string;
  contenu: string;
  lu: boolean;
  date_notification: string;
}
