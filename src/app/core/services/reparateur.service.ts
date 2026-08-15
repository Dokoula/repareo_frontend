import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { Disponibilite, Reparateur } from '../models/reparateur.model';

@Injectable({
  providedIn: 'root'
})
export class ReparateurService {
  private http = inject(HttpClient);

  private mockReparateurs: Reparateur[] = [
    {
      id: 1,
      user: { id: 2, username: 'koffi_tech', email: 'koffi@repareo.ci', telephone: '+225 07 45 67 89 01', ville: 'Abidjan (Cocody)', role: 'REPARATEUR', first_name: 'Koffi', last_name: 'Kouassi' },
      specialite: 'Maintenance Matérielle & Remplacement Composants',
      experience: 6,
      note_moyenne: 4.8,
      statut_validation: true,
      disponibilite: 'DISPONIBLE',
      categories: [
        { id: 1, nom: 'Réparation matérielle' },
        { id: 2, nom: 'Installation système' },
        { id: 3, nom: 'Maintenance' }
      ]
    },
    {
      id: 2,
      user: { id: 4, username: 'ibrahim_micro', email: 'ibrahim@repareo.ci', telephone: '+225 05 99 88 77 66', ville: 'Abidjan (Plateau)', role: 'REPARATEUR', first_name: 'Ibrahim', last_name: 'Diallo' },
      specialite: 'Récupération de Données & Sécurité',
      experience: 8,
      note_moyenne: 4.9,
      statut_validation: true,
      disponibilite: 'DISPONIBLE',
      categories: [
        { id: 4, nom: 'Récupération de données' },
        { id: 5, nom: 'Sécurité informatique' }
      ]
    },
    {
      id: 3,
      user: { id: 6, username: 'awa_cybercare', email: 'awa@repareo.ci', telephone: '+225 01 55 44 33 22', ville: 'Abidjan (Yopougon)', role: 'REPARATEUR', first_name: 'Awa', last_name: 'Traoré' },
      specialite: 'Réseau & Réparation logicielle',
      experience: 4,
      note_moyenne: 4.7,
      statut_validation: false,
      disponibilite: 'DISPONIBLE',
      categories: [
        { id: 6, nom: 'Réseau' },
        { id: 7, nom: 'Réparation logicielle' }
      ]
    }
  ];

  getReparateurs(): Observable<Reparateur[]> {
    return this.http.get<Reparateur[]>(API.BASE_URL + API.REPARATEURS.BASE).pipe(
      catchError(() => of(this.mockReparateurs))
    );
  }

  getReparateurById(id: number): Observable<Reparateur> {
    return this.http.get<Reparateur>(API.BASE_URL + `${API.REPARATEURS.BASE}${id}/`).pipe(
      catchError(() => {
        const item = this.mockReparateurs.find(r => r.id === Number(id));
        return of(item || this.mockReparateurs[0]);
      })
    );
  }

  getMonProfil(): Observable<Reparateur> {
    return this.http.get<Reparateur>(API.BASE_URL + API.REPARATEURS.PROFIL).pipe(
      catchError(() => of(this.mockReparateurs[0]))
    );
  }

  updateMonProfil(data: Partial<Reparateur>): Observable<Reparateur> {
    return this.http.put<Reparateur>(API.BASE_URL + API.REPARATEURS.PROFIL, data).pipe(
      catchError(() => {
        Object.assign(this.mockReparateurs[0], data);
        return of(this.mockReparateurs[0]);
      })
    );
  }

  modifierDisponibilite(disponibilite: Disponibilite): Observable<any> {
    return this.http.patch<any>(API.BASE_URL + API.REPARATEURS.DISPONIBILITE, { disponibilite }).pipe(
      catchError(() => {
        this.mockReparateurs[0].disponibilite = disponibilite;
        return of({ message: 'Disponibilité mise à jour.', disponibilite });
      })
    );
  }

  accepterDemande(demandeId: number): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.REPARATEURS.ACCEPTER_DEMANDE(demandeId), {}).pipe(
      catchError(() => of({ status: true, message: 'Demande acceptée avec succès.' }))
    );
  }

  refuserDemande(demandeId: number): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.REPARATEURS.REFUSER_DEMANDE(demandeId), {}).pipe(
      catchError(() => of({ status: true, message: 'Demande refusée.' }))
    );
  }
}
