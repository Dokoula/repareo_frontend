import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { User } from '../models/user.model';
import { Reparateur } from '../models/reparateur.model';

export interface AdminDashboardStats {
  totalUtilisateurs: number;
  totalClients: number;
  totalReparateurs: number;
  reparateursEnAttente: number;
  totalDemandes: number;
  demandesEnCours: number;
  reparationsTerminees: number;
  chiffreAffairesTotal: number;
  tauxSatisfaction: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(API.BASE_URL + API.ADMIN.STATS);
  }

  getUsers(role?: string): Observable<User[]> {
    const suffix = role ? `?role=${encodeURIComponent(role)}` : '';
    return this.http.get<User[]>(`${API.BASE_URL}${API.ADMIN.USERS}${suffix}`);
  }

  getReparateurs(): Observable<Reparateur[]> {
    return this.http.get<Reparateur[]>(API.BASE_URL + API.REPARATEURS.ADMIN_DOSSIERS);
  }

  toggleValidationReparateur(reparateurId: number, valider: boolean, commentaire = ''): Observable<{ message: string; statut_validation: boolean }> {
    return this.http.patch<{ message: string; statut_validation: boolean }>(API.BASE_URL + API.REPARATEURS.ADMIN_VALIDER(reparateurId), { valider, commentaire });
  }
}
