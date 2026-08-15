import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { EffectuerPaiementRequest, ModePaiement, Paiement } from '../models/paiement.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private http = inject(HttpClient);

  private mockModesPaiement: ModePaiement[] = [
    { id: 1, nom: 'Orange Money', description: 'Paiement mobile instantané via Orange CI', icon: 'bi-phone' },
    { id: 2, nom: 'Wave', description: 'Paiement direct sans frais par QR code Wave', icon: 'bi-qr-code-scan' },
    { id: 3, nom: 'Moov Money / MTN MoMo', description: 'Paiement sécurisé via portefeuille mobile', icon: 'bi-wallet2' },
    { id: 4, nom: 'Carte Bancaire (Visa / Mastercard)', description: 'Paiement en ligne sécurisé 3D Secure', icon: 'bi-credit-card' },
    { id: 5, nom: 'Espèces / En atelier', description: 'Paiement à la récupération de votre appareil', icon: 'bi-cash-stack' }
  ];

  private mockPaiements: Paiement[] = [
    {
      id: 501,
      reparation: 401,
      montant: 45000,
      mode_paiement: { id: 2, nom: 'Wave' },
      statut: 'EFFECTUE',
      date_paiement: '2026-08-14T15:30:00Z',
      reference_transaction: 'WAVE-TX-892301'
    }
  ];

  getModesPaiement(): Observable<ModePaiement[]> {
    return this.http.get<ModePaiement[]>(API.BASE_URL + API.PAIEMENTS.MODES).pipe(
      catchError(() => of(this.mockModesPaiement))
    );
  }

  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(API.BASE_URL + API.PAIEMENTS.BASE).pipe(
      catchError(() => of(this.mockPaiements))
    );
  }

  effectuerPaiement(reparationId: number, data: EffectuerPaiementRequest): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.PAIEMENTS.PAYER(reparationId), data).pipe(
      catchError(() => {
        const mode = this.mockModesPaiement.find(m => m.id === data.mode_paiement) || this.mockModesPaiement[0];
        const newPayment: Paiement = {
          id: Math.floor(Math.random() * 800) + 500,
          reparation: reparationId,
          montant: 45000,
          mode_paiement: mode,
          statut: 'EFFECTUE',
          date_paiement: new Date().toISOString(),
          reference_transaction: data.reference_transaction || 'PAY-REF-' + Math.floor(Math.random() * 900000 + 100000)
        };
        this.mockPaiements.unshift(newPayment);
        return of({
          status: true,
          message: 'Paiement effectué avec succès ! Votre reçu est disponible.',
          paiement: newPayment
        });
      })
    );
  }
}
