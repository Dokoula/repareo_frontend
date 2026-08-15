import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { API } from '../constants/api.constants';
import { AuthService } from './auth';
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

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http        = inject(HttpClient);
  private authService = inject(AuthService);

  /** Construit les headers JWT pour les requêtes admin */
  private get headers(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Statistiques globales depuis la base de données PostgreSQL.
   * Endpoint : GET /api/users/stats/
   */
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(
      API.BASE_URL + API.ADMIN.STATS,
      { headers: this.headers }
    ).pipe(
      catchError((err) => {
        console.error('AdminService.getDashboardStats — Erreur API :', err);
        // En cas d'erreur réseau, renvoie des zéros (pas de fausses données)
        return of({
          totalUtilisateurs: 0,
          totalClients: 0,
          totalReparateurs: 0,
          reparateursEnAttente: 0,
          totalDemandes: 0,
          demandesEnCours: 0,
          reparationsTerminees: 0,
          chiffreAffairesTotal: 0,
          tauxSatisfaction: 0,
        } as AdminDashboardStats);
      })
    );
  }

  /**
   * Liste de TOUS les utilisateurs depuis PostgreSQL.
   * Endpoint : GET /api/users/
   * Filtre optionnel : role = 'CLIENT' | 'REPARATEUR' | 'ADMINISTRATEUR'
   */
  getUsers(role?: string): Observable<User[]> {
    const url = role
      ? `${API.BASE_URL}${API.ADMIN.USERS}?role=${role}`
      : `${API.BASE_URL}${API.ADMIN.USERS}`;

    return this.http.get<User[]>(url, { headers: this.headers }).pipe(
      catchError((err) => {
        console.error('AdminService.getUsers — Erreur API :', err);
        return of([] as User[]);
      })
    );
  }

  /**
   * Liste tous les réparateurs avec leur dossier de candidature.
   * Endpoint : GET /api/reparateurs/
   */
  getReparateurs(): Observable<Reparateur[]> {
    return this.http.get<Reparateur[]>(
      API.BASE_URL + API.REPARATEURS.BASE,
      { headers: this.headers }
    ).pipe(
      catchError((err) => {
        console.error('AdminService.getReparateurs — Erreur API :', err);
        return of([] as Reparateur[]);
      })
    );
  }

  /**
   * Valide ou suspend un réparateur.
   * Endpoint : PATCH /api/reparateurs/<id>/valider/
   */
  toggleValidationReparateur(reparateurId: number, valider: boolean, commentaire = ''): Observable<any> {
    return this.http.patch(
      API.BASE_URL + API.REPARATEURS.ADMIN_VALIDER(reparateurId),
      { valider, commentaire },
      { headers: this.headers }
    ).pipe(
      catchError((err) => {
        console.error('AdminService.toggleValidation — Erreur API :', err);
        return of({ error: true, message: 'Impossible de modifier le statut.' });
      })
    );
  }
}
