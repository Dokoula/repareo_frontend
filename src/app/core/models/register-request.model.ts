import { RoleUtilisateur } from './user.model';

export interface RegisterRequest {
  username: string;
  email: string;
  telephone: string;
  ville: string;
  role: RoleUtilisateur;
  password: string;
  confirm_password: string;
  specialite?: string;
  experience?: number;
}