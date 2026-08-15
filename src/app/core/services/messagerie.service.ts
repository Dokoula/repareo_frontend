import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private mockConversations: Conversation[] = [
    {
      id: 601,
      client: {
        id: 1,
        user: { id: 3, username: 'marie_client', email: 'marie@example.com', telephone: '+225 01 23 45 67 89', ville: 'Abidjan', role: 'CLIENT' },
        adresse: 'Cocody'
      },
      reparateur: {
        id: 1,
        user: { id: 2, username: 'koffi_tech', email: 'koffi@repareo.ci', telephone: '+225 07 45 67 89 01', ville: 'Abidjan', role: 'REPARATEUR' },
        specialite: 'Maintenance Matérielle',
        experience: 6,
        note_moyenne: 4.8,
        statut_validation: true,
        disponibilite: 'DISPONIBLE'
      },
      demande: {
        id: 101,
        client: { id: 1, user: { id: 3, username: 'marie_client', email: '', telephone: '', ville: '', role: 'CLIENT' }, adresse: '' },
        marque_ordinateur: 'Dell',
        modele_ordinateur: 'XPS 15',
        description_probleme: 'Court-circuit alimentation',
        date_creation: '2026-08-14',
        statut: 'EN_REPARATION'
      },
      date_creation: '2026-08-14T10:00:00Z',
      messages: [
        {
          id: 1,
          conversation: 601,
          expediteur: { id: 3, username: 'marie_client', email: '', telephone: '', ville: '', role: 'CLIENT' },
          contenu: 'Bonjour M. Koffi, avez-vous pu vérifier la carte mère de mon Dell XPS ?',
          date_envoi: '2026-08-14T10:15:00Z',
          lu: true
        },
        {
          id: 2,
          conversation: 601,
          expediteur: { id: 2, username: 'koffi_tech', email: '', telephone: '', ville: '', role: 'REPARATEUR' },
          contenu: 'Bonjour Mme Marie ! Oui, le diagnostic est posé : un condensateur d’alimentation a sauté suite à la surtension. La carte principale est saine, je remplace le composant aujourd’hui.',
          date_envoi: '2026-08-14T10:25:00Z',
          lu: true
        },
        {
          id: 3,
          conversation: 601,
          expediteur: { id: 3, username: 'marie_client', email: '', telephone: '', ville: '', role: 'CLIENT' },
          contenu: 'Super nouvelle, merci beaucoup pour votre rapidité ! Tenez-moi au courant dès que je peux le récupérer.',
          date_envoi: '2026-08-14T11:00:00Z',
          lu: true
        }
      ]
    }
  ];

  getConversation(id: number): Observable<Conversation> {
    return this.http.get<Conversation>(API.BASE_URL + API.CONVERSATIONS.DETAIL(id)).pipe(
      catchError(() => {
        const c = this.mockConversations.find(conv => conv.id === Number(id));
        return of(c || this.mockConversations[0]);
      })
    );
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(API.BASE_URL + API.MESSAGERIE.MESSAGES(conversationId)).pipe(
      catchError(() => {
        const c = this.mockConversations.find(conv => conv.id === Number(conversationId));
        return of(c?.messages || this.mockConversations[0].messages || []);
      })
    );
  }

  envoyerMessage(conversationId: number, contenu: string): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.MESSAGERIE.MESSAGES(conversationId), { contenu }).pipe(
      catchError(() => {
        const currentUser = this.authService.currentUser() || {
          id: 3,
          username: 'Utilisateur',
          email: '',
          telephone: '',
          ville: '',
          role: 'CLIENT'
        };

        const newMsg: Message = {
          id: Date.now(),
          conversation: conversationId,
          expediteur: currentUser,
          contenu,
          date_envoi: new Date().toISOString(),
          lu: false
        };

        const conv = this.mockConversations.find(c => c.id === Number(conversationId)) || this.mockConversations[0];
        if (!conv.messages) conv.messages = [];
        conv.messages.push(newMsg);

        return of({ status: true, message: 'Message envoyé', data: newMsg });
      })
    );
  }
}
