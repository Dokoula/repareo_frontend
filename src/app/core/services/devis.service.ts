import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { CreateDevisRequest, Devis } from '../models/devis.model';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private http = inject(HttpClient);

  private mockDevis: Devis[] = [
    {
      id: 301,
      diagnostic: 201,
      pourcentage_reussite: 95,
      date_devis: '2026-08-14',
      statut_devis: 'ACCEPTE',
      delai_estime: 2,
      montant_diagnostic: 10000,
      montant_reparation: 35000,
      montant_total: 45000
    },
    {
      id: 302,
      diagnostic: 202,
      pourcentage_reussite: 90,
      date_devis: '2026-08-12',
      statut_devis: 'EN_ATTENTE',
      delai_estime: 4,
      montant_diagnostic: 15000,
      montant_reparation: 45000,
      montant_total: 60000
    }
  ];

  getDevisList(): Observable<Devis[]> {
    return this.http.get<Devis[]>(API.BASE_URL + API.DEVIS.BASE).pipe(
      catchError(() => of(this.mockDevis))
    );
  }

  getDevisById(id: number): Observable<Devis> {
    return this.http.get<Devis>(API.BASE_URL + API.DEVIS.DETAIL(id)).pipe(
      catchError(() => {
        const item = this.mockDevis.find(d => d.id === Number(id));
        return of(item || this.mockDevis[0]);
      })
    );
  }

  creerDevis(diagnosticId: number, data: CreateDevisRequest): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.DEVIS.CREER(diagnosticId), data).pipe(
      catchError(() => {
        const newDevis: Devis = {
          id: Math.floor(Math.random() * 800) + 300,
          diagnostic: diagnosticId,
          pourcentage_reussite: data.pourcentage_reussite || 90,
          date_devis: new Date().toISOString().split('T')[0],
          statut_devis: 'EN_ATTENTE',
          delai_estime: data.delai_estime,
          montant_diagnostic: data.montant_diagnostic,
          montant_reparation: data.montant_reparation,
          montant_total: data.montant_total
        };
        this.mockDevis.unshift(newDevis);
        return of({ status: true, message: 'Devis généré et transmis au client.', devis: newDevis });
      })
    );
  }

  accepterDevis(devisId: number): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.DEVIS.ACCEPTER(devisId), {}).pipe(
      catchError(() => {
        const item = this.mockDevis.find(d => d.id === Number(devisId));
        if (item) item.statut_devis = 'ACCEPTE';
        return of({ status: true, message: 'Devis accepté avec succès ! La réparation peut démarrer.' });
      })
    );
  }

  refuserDevis(devisId: number): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.DEVIS.REFUSER(devisId), {}).pipe(
      catchError(() => {
        const item = this.mockDevis.find(d => d.id === Number(devisId));
        if (item) item.statut_devis = 'REFUSE';
        return of({ status: true, message: 'Devis refusé.' });
      })
    );
  }
}
