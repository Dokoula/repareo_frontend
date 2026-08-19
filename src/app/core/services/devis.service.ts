import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { CreateDevisRequest, Devis } from '../models/devis.model';

@Injectable({ providedIn: 'root' })
export class DevisService {
  private http = inject(HttpClient);

  getDevisList(): Observable<Devis[]> {
    return this.http.get<Devis[]>(API.BASE_URL + API.DEVIS.BASE);
  }

  getDevisById(id: number): Observable<Devis> {
    return this.http.get<Devis>(API.BASE_URL + API.DEVIS.DETAIL(id));
  }

  creerDevis(diagnosticId: number, data: CreateDevisRequest): Observable<{ status: boolean; message: string; devis: number }> {
    return this.http.post<{ status: boolean; message: string; devis: number }>(API.BASE_URL + API.DEVIS.CREER(diagnosticId), data);
  }

  accepterDevis(devisId: number): Observable<{ status: boolean; message: string }> {
    return this.http.post<{ status: boolean; message: string }>(API.BASE_URL + API.DEVIS.ACCEPTER(devisId), {});
  }

  refuserDevis(devisId: number): Observable<{ status: boolean; message: string }> {
    return this.http.post<{ status: boolean; message: string }>(API.BASE_URL + API.DEVIS.REFUSER(devisId), {});
  }
}
