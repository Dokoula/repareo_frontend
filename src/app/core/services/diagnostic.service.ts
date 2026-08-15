import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { CreateDiagnosticRequest, Diagnostic } from '../models/diagnostic.model';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService {
  private http = inject(HttpClient);

  private mockDiagnostics: Diagnostic[] = [
    {
      id: 201,
      demande: 101,
      panne_reelle: 'Court-circuit sur l’étage d’alimentation primaire (condensateur CMS HS). Carte mère intacte.',
      reparable: true,
      commentaire: 'Remplacement des composants passifs et test de charge sous oscilloscope recommandé.',
      date_diagnostic: '2026-08-14'
    },
    {
      id: 202,
      demande: 102,
      panne_reelle: 'Contrôleur SSD en boucle de blocage de firmware (Bad sectors critiques sur table GPT).',
      reparable: true,
      commentaire: 'Extraction bit à bit sur banc d’analyse en salle blanche logicielle.',
      date_diagnostic: '2026-08-11'
    }
  ];

  getDiagnostics(): Observable<Diagnostic[]> {
    return this.http.get<Diagnostic[]>(API.BASE_URL + API.DIAGNOSTICS.BASE).pipe(
      catchError(() => of(this.mockDiagnostics))
    );
  }

  getDiagnosticById(id: number): Observable<Diagnostic> {
    return this.http.get<Diagnostic>(API.BASE_URL + API.DIAGNOSTICS.DETAIL(id)).pipe(
      catchError(() => {
        const d = this.mockDiagnostics.find(item => item.id === Number(id));
        return of(d || this.mockDiagnostics[0]);
      })
    );
  }

  creerDiagnostic(demandeId: number, data: CreateDiagnosticRequest): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.DIAGNOSTICS.CREER(demandeId), data).pipe(
      catchError(() => {
        const newDiag: Diagnostic = {
          id: Math.floor(Math.random() * 800) + 200,
          demande: demandeId,
          panne_reelle: data.panne_reelle,
          reparable: data.reparable,
          commentaire: data.commentaire,
          date_diagnostic: new Date().toISOString().split('T')[0]
        };
        this.mockDiagnostics.unshift(newDiag);
        return of({ status: true, message: 'Diagnostic technique enregistré avec succès.', diagnostic: newDiag });
      })
    );
  }
}
