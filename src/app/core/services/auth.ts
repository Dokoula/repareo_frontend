import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, map, catchError } from 'rxjs';

import { API } from '../constants/api.constants';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { RoleUtilisateur, User } from '../models/user.model';

const TOKEN_KEY = 'repareo_access_token';
const REFRESH_KEY = 'repareo_refresh_token';
const USER_KEY = 'repareo_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  constructor() {}

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  hasRole(role: RoleUtilisateur | RoleUtilisateur[]): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Normalize role string (e.g. ADMIN vs ADMINISTRATEUR)
    const userRole = user.role === 'ADMIN' ? 'ADMINISTRATEUR' : user.role;

    if (Array.isArray(role)) {
      return role.some(r => {
        const checkRole = r === 'ADMIN' ? 'ADMINISTRATEUR' : r;
        return checkRole === userRole;
      });
    }
    const targetRole = role === 'ADMIN' ? 'ADMINISTRATEUR' : role;
    return targetRole === userRole;
  }

  /**
   * Authentification via la vraie base de données Django.
   * En cas d'erreur réseau ou mauvais identifiants, l'erreur est propagée au composant.
   */
  login(data: LoginRequest, selectedRoleHint?: RoleUtilisateur): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API.BASE_URL + API.AUTH.LOGIN, data).pipe(
      tap((res) => {
        if (res && res.access && res.user) {
          this.setSession(res.access, res.refresh, res.user);
        }
      })
      // No fallback mock: real errors are propagated to login component
    );
  }

  /**
   * Inscription via la vraie base de données Django.
   * Le backend crée le compte Client ou Réparateur et renvoie les tokens JWT.
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.AUTH.REGISTER, data).pipe(
      tap((res) => {
        if (res && res.access && res.user) {
          this.setSession(res.access, res.refresh, res.user);
        }
      })
      // No fallback mock: real errors are propagated to register component
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(API.BASE_URL + API.AUTH.PROFILE).pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  private setSession(token: string, refresh: string, user: User): void {
    this.token.set(token);
    this.currentUser.set(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_KEY, refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.router.navigate(['/login']);
  }

  redirectByRole(role?: RoleUtilisateur): void {
    const r = role || this.currentUser()?.role;
    if (r === 'ADMINISTRATEUR' || r === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (r === 'REPARATEUR') {
      this.router.navigate(['/reparateur']);
    } else {
      this.router.navigate(['/client']);
    }
  }
}