import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { API } from '../constants/api.constants';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  unreadCount = signal<number>(2);

  private mockNotifications: Notification[] = [
    {
      id: 701,
      utilisateur: 3,
      titre: 'Devis disponible',
      contenu: 'Le réparateur Koffi Tech a transmis un devis pour votre Dell XPS 15. Consultez-le pour validation.',
      lu: false,
      date_notification: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 702,
      utilisateur: 3,
      titre: 'Diagnostic validé',
      contenu: 'Votre demande #101 a fait l’objet d’un examen technique complet.',
      lu: false,
      date_notification: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: 703,
      utilisateur: 3,
      titre: 'Bienvenue sur Repareo',
      contenu: 'Votre compte est prêt ! Déposez une demande pour trouver les meilleurs réparateurs informatiques.',
      lu: true,
      date_notification: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(API.BASE_URL + API.NOTIFICATIONS.BASE).pipe(
      tap((list) => {
        if (list) {
          const unread = list.filter(n => !n.lu).length;
          this.unreadCount.set(unread);
        }
      }),
      catchError(() => {
        const unread = this.mockNotifications.filter(n => !n.lu).length;
        this.unreadCount.set(unread);
        return of(this.mockNotifications);
      })
    );
  }

  marquerCommeLue(id: number): Observable<any> {
    return this.http.patch<any>(API.BASE_URL + API.NOTIFICATIONS.MARQUER_LUE(id), {}).pipe(
      catchError(() => {
        const item = this.mockNotifications.find(n => n.id === Number(id));
        if (item) item.lu = true;
        const unread = this.mockNotifications.filter(n => !n.lu).length;
        this.unreadCount.set(unread);
        return of({ message: 'Notification marquée comme lue.' });
      })
    );
  }
}
