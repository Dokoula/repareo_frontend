import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { EffectuerPaiementRequest, ModePaiement, Paiement, Portefeuille, Retrait } from '../models/paiement.model';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private http = inject(HttpClient);

  getModesPaiement(): Observable<ModePaiement[]> {
    return this.http.get<ModePaiement[]>(API.BASE_URL + API.PAIEMENTS.MODES);
  }

  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(API.BASE_URL + API.PAIEMENTS.BASE);
  }

  getPaiementById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(API.BASE_URL + API.PAIEMENTS.DETAIL(id));
  }

  effectuerPaiement(reparationId: number, data: EffectuerPaiementRequest): Observable<{ status: boolean; message: string; paiement: number }> {
    return this.http.post<{ status: boolean; message: string; paiement: number }>(API.BASE_URL + API.PAIEMENTS.PAYER(reparationId), data);
  }

  getPortefeuille(): Observable<Portefeuille> {
    return this.http.get<Portefeuille>(API.BASE_URL + API.PAIEMENTS.PORTEFEUILLE);
  }

  effectuerRetrait(data: { montant: number; moyen: string; destination: string }): Observable<{ message: string; retrait: Retrait; solde: number }> {
    return this.http.post<{ message: string; retrait: Retrait; solde: number }>(API.BASE_URL + API.PAIEMENTS.RETRAIT, data);
  }
}
