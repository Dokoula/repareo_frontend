import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { CreateDiagnosticRequest, Diagnostic } from '../models/diagnostic.model';

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  private http = inject(HttpClient);

  getDiagnostics(): Observable<Diagnostic[]> {
    return this.http.get<Diagnostic[]>(API.BASE_URL + API.DIAGNOSTICS.BASE);
  }

  getDiagnosticById(id: number): Observable<Diagnostic> {
    return this.http.get<Diagnostic>(API.BASE_URL + API.DIAGNOSTICS.DETAIL(id));
  }

  creerDiagnostic(demandeId: number, data: CreateDiagnosticRequest): Observable<{ status: boolean; message: string; diagnostic: number }> {
    return this.http.post<{ status: boolean; message: string; diagnostic: number }>(API.BASE_URL + API.DIAGNOSTICS.CREER(demandeId), data);
  }
}
