import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { Disponibilite, DossierReparateur, Reparateur } from '../models/reparateur.model';

@Injectable({ providedIn: 'root' })
export class ReparateurService {
  private http = inject(HttpClient);

  getReparateurs(): Observable<Reparateur[]> {
    return this.http.get<Reparateur[]>(API.BASE_URL + API.REPARATEURS.BASE);
  }

  getReparateurById(id: number): Observable<Reparateur> {
    return this.http.get<Reparateur>(`${API.BASE_URL}${API.REPARATEURS.BASE}${id}/`);
  }

  getMonProfil(): Observable<Reparateur> {
    return this.http.get<Reparateur>(API.BASE_URL + API.REPARATEURS.PROFIL);
  }

  getMonDossier(): Observable<DossierReparateur> {
    return this.http.get<DossierReparateur>(API.BASE_URL + API.REPARATEURS.MON_DOSSIER);
  }

  updateMonProfil(data: Partial<Reparateur>): Observable<Reparateur> {
    return this.http.put<Reparateur>(API.BASE_URL + API.REPARATEURS.PROFIL, data);
  }

  soumettreDossier(data: FormData): Observable<{ message: string; dossier_id: number }> {
    return this.http.post<{ message: string; dossier_id: number }>(API.BASE_URL + API.REPARATEURS.SOUMETTRE_DOSSIER, data);
  }

  modifierDisponibilite(disponibilite: Disponibilite): Observable<{ message: string; disponibilite: Disponibilite }> {
    return this.http.patch<{ message: string; disponibilite: Disponibilite }>(API.BASE_URL + API.REPARATEURS.DISPONIBILITE, { disponibilite });
  }

  accepterDemande(demandeId: number): Observable<{ message: string; demande: number; conversation: number }> {
    return this.http.post<{ message: string; demande: number; conversation: number }>(API.BASE_URL + API.REPARATEURS.ACCEPTER_DEMANDE(demandeId), {});
  }

  refuserDemande(demandeId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API.BASE_URL + API.REPARATEURS.REFUSER_DEMANDE(demandeId), {});
  }
}
