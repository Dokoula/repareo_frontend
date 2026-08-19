import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { CreateDemandeRequest, Demande, MiseEnRelationResult } from '../models/demande.model';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private http = inject(HttpClient);

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(API.BASE_URL + API.DEMANDES.BASE);
  }

  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(API.BASE_URL + API.DEMANDES.DETAIL(id));
  }

  creerDemande(data: CreateDemandeRequest): Observable<MiseEnRelationResult> {
    return this.http.post<MiseEnRelationResult>(API.BASE_URL + API.DEMANDES.BASE, data);
  }

  assignerReparateur(demandeId: number, reparateurId: number): Observable<{ message: string; demande: number; reparateur: string }> {
    return this.http.post<{ message: string; demande: number; reparateur: string }>(API.BASE_URL + API.DEMANDES.ASSIGNER(demandeId), { reparateur: reparateurId });
  }

  confirmerEnvoiMateriel(demandeId: number): Observable<{ status: boolean; message: string; demande: number; statut: string; frais_diagnostic: number }> {
    return this.http.post<{ status: boolean; message: string; demande: number; statut: string; frais_diagnostic: number }>(
      API.BASE_URL + API.DEMANDES.ENVOYER_MATERIEL(demandeId),
      {}
    );
  }

  rechercherReparateurs(demandeId: number): Observable<MiseEnRelationResult> {
    return this.http.post<MiseEnRelationResult>(
      API.BASE_URL + API.DEMANDES.RECHERCHER_REPARATEURS(demandeId),
      {}
    );
  }
}
