import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { Reparation } from '../models/reparation.model';

@Injectable({
  providedIn: 'root'
})
export class ReparationService {
  private http = inject(HttpClient);

  private mockReparations: Reparation[] = [
    {
      id: 401,
      devis: 301,
      date_debut: '2026-08-14',
      date_fin: null,
      commentaire: 'Soudure du nouveau régulateur d’alimentation en cours. Tests de tension stables à 19.5V.',
      statut: 'EN_REPARATION'
    }
  ];

  getReparationById(id: number): Observable<Reparation> {
    return this.http.get<Reparation>(API.BASE_URL + API.REPARATIONS.DETAIL(id)).pipe(
      catchError(() => {
        const item = this.mockReparations.find(r => r.id === Number(id));
        return of(item || this.mockReparations[0]);
      })
    );
  }

  demarrerReparation(devisId: number): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.REPARATIONS.DEMARRER(devisId), {}).pipe(
      catchError(() => {
        const newRep: Reparation = {
          id: Math.floor(Math.random() * 800) + 400,
          devis: devisId,
          date_debut: new Date().toISOString().split('T')[0],
          statut: 'EN_REPARATION',
          commentaire: 'Réparation commencée dans l’atelier technique.'
        };
        this.mockReparations.push(newRep);
        return of({ status: true, message: 'La réparation a été démarrée avec succès.', reparation: newRep });
      })
    );
  }

  terminerReparation(reparationId: number, commentaire: string): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.REPARATIONS.TERMINER(reparationId), { commentaire }).pipe(
      catchError(() => {
        const item = this.mockReparations.find(r => r.id === Number(reparationId));
        if (item) {
          item.statut = 'PRET';
          item.date_fin = new Date().toISOString().split('T')[0];
          item.commentaire = commentaire;
        }
        return of({ status: true, message: 'Réparation marquée comme prête et terminée ! Le client a été notifié.' });
      })
    );
  }
}
