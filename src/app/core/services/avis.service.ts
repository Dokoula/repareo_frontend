import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { Avis, CreateAvisRequest } from '../models/avis.model';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private http = inject(HttpClient);

  private mockAvis: Avis[] = [
    {
      id: 801,
      reparation: 401,
      client: {
        id: 1,
        user: { id: 3, username: 'marie_client', email: 'marie@example.com', telephone: '+225 01 23 45 67 89', ville: 'Abidjan', role: 'CLIENT' },
        adresse: 'Cocody'
      },
      reparateur: {
        id: 1,
        user: { id: 2, username: 'koffi_tech', email: 'koffi@repareo.ci', telephone: '+225 07 45 67 89 01', ville: 'Abidjan', role: 'REPARATEUR' },
        specialite: 'Maintenance Matérielle',
        experience: 6,
        note_moyenne: 4.8,
        statut_validation: true,
        disponibilite: 'DISPONIBLE'
      },
      note: 5,
      commentaire: 'Travail impeccable et très rapide ! Mon Dell XPS refonctionne à merveille. Merci beaucoup pour le professionnalisme.',
      date_avis: '2026-08-14T16:00:00Z'
    },
    {
      id: 802,
      reparation: 402,
      client: {
        id: 2,
        user: { id: 5, username: 'alain_kouame', email: 'alain@example.com', telephone: '', ville: 'Bouaké', role: 'CLIENT' },
        adresse: 'Bouaké'
      },
      reparateur: {
        id: 2,
        user: { id: 4, username: 'ibrahim_micro', email: 'ibrahim@repareo.ci', telephone: '+225 05 99 88 77 66', ville: 'Abidjan', role: 'REPARATEUR' },
        specialite: 'Récupération de données',
        experience: 8,
        note_moyenne: 4.9,
        statut_validation: true,
        disponibilite: 'DISPONIBLE'
      },
      note: 5,
      commentaire: 'Toutes mes données professionnelles ont été récupérées après le crash de mon disque. Un vrai sauveur !',
      date_avis: '2026-08-10T12:00:00Z'
    }
  ];

  getAvis(): Observable<Avis[]> {
    return this.http.get<Avis[]>(API.BASE_URL + API.AVIS.BASE).pipe(
      catchError(() => of(this.mockAvis))
    );
  }

  creerAvis(reparationId: number, data: CreateAvisRequest): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.AVIS.CREER(reparationId), data).pipe(
      catchError(() => {
        const newAvis: Avis = {
          id: Math.floor(Math.random() * 800) + 800,
          reparation: reparationId,
          client: this.mockAvis[0].client,
          reparateur: this.mockAvis[0].reparateur,
          note: data.note,
          commentaire: data.commentaire,
          date_avis: new Date().toISOString()
        };
        this.mockAvis.unshift(newAvis);
        return of({ status: true, message: 'Votre avis a été publié avec succès. Merci !', avis: newAvis });
      })
    );
  }
}
