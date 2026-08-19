import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { Reparation } from '../models/reparation.model';

@Injectable({ providedIn: 'root' })
export class ReparationService {
  private http = inject(HttpClient);

  getReparations(): Observable<Reparation[]> {
    return this.http.get<Reparation[]>(API.BASE_URL + API.REPARATIONS.BASE);
  }

  getReparationById(id: number): Observable<Reparation> {
    return this.http.get<Reparation>(API.BASE_URL + API.REPARATIONS.DETAIL(id));
  }

  demarrerReparation(devisId: number): Observable<{ status: boolean; message: string; reparation: number }> {
    return this.http.post<{ status: boolean; message: string; reparation: number }>(API.BASE_URL + API.REPARATIONS.DEMARRER(devisId), {});
  }

  terminerReparation(reparationId: number, commentaire: string): Observable<{ status: boolean; message: string }> {
    return this.http.post<{ status: boolean; message: string }>(API.BASE_URL + API.REPARATIONS.TERMINER(reparationId), { commentaire });
  }
}
