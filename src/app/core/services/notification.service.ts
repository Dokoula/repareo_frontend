import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API } from '../constants/api.constants';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  unreadCount = signal(0);

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(API.BASE_URL + API.NOTIFICATIONS.BASE).pipe(
      tap((notifications) => this.unreadCount.set(notifications.filter((item) => !item.lu).length))
    );
  }

  marquerCommeLue(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(API.BASE_URL + API.NOTIFICATIONS.MARQUER_LUE(id), {}).pipe(
      tap(() => this.unreadCount.update((count) => Math.max(0, count - 1)))
    );
  }
}
