export type RoleUtilisateur = 'CLIENT' | 'REPARATEUR' | 'ADMINISTRATEUR' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  telephone: string;
  ville: string;
  role: RoleUtilisateur;
  date_inscription?: string;
  first_name?: string;
  last_name?: string;
}