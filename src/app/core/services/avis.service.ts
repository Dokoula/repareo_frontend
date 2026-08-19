import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { Avis, CreateAvisRequest } from '../models/avis.model';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private http = inject(HttpClient);

  getAvis(): Observable<Avis[]> {
    return this.http.get<Avis[]>(API.BASE_URL + API.AVIS.BASE);
  }

  creerAvis(reparationId: number, data: CreateAvisRequest): Observable<{ status: boolean; message: string; avis: number }> {
    return this.http.post<{ status: boolean; message: string; avis: number }>(API.BASE_URL + API.AVIS.CREER(reparationId), data);
  }
}
