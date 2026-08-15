import { User } from './user.model';

export interface Client {
  id: number;
  user: User;
  adresse: string;
}
