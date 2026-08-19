import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API } from '../constants/api.constants';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);

  getMonProfil(): Observable<Client> {
    return this.http.get<Client>(API.BASE_URL + API.CLIENTS.PROFIL);
  }

  updateMonProfil(data: { email: string; telephone: string; ville: string; adresse: string }): Observable<Client> {
    return this.http.put<Client>(API.BASE_URL + API.CLIENTS.PROFIL, data);
  }
}
