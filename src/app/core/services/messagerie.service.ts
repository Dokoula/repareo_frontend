import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { API } from '../constants/api.constants';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { ConversationAdministration, MessageAdministration } from '../models/conversation-administration.model';

@Injectable({ providedIn: 'root' })
export class MessagerieService {
  private http = inject(HttpClient);

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(API.BASE_URL + API.CONVERSATIONS.BASE);
  }

  getConversation(id: number): Observable<Conversation> {
    return this.http.get<Conversation>(API.BASE_URL + API.CONVERSATIONS.DETAIL(id)).pipe(
      switchMap((conversation) => this.getMessages(id).pipe(
        map((messages) => ({ ...conversation, messages }))
      ))
    );
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(API.BASE_URL + API.MESSAGERIE.MESSAGES(conversationId));
  }

  envoyerMessage(conversationId: number, contenu: string): Observable<{ status: boolean; message: string; data: Message }> {
    return this.http.post<{ status: boolean; message: string; data: Message }>(API.BASE_URL + API.MESSAGERIE.ENVOYER(conversationId), { contenu });
  }

  getConversationsAdministration(): Observable<ConversationAdministration[]> {
    return this.http.get<ConversationAdministration[]>(API.BASE_URL + API.CONVERSATIONS.ADMINISTRATION);
  }

  ouvrirConversationAdministration(reparateurId: number): Observable<ConversationAdministration> {
    return this.http.post<ConversationAdministration>(API.BASE_URL + API.CONVERSATIONS.OUVRIR_ADMINISTRATION(reparateurId), {});
  }

  getMessagesAdministration(conversationId: number): Observable<MessageAdministration[]> {
    return this.http.get<MessageAdministration[]>(API.BASE_URL + API.CONVERSATIONS.MESSAGES_ADMINISTRATION(conversationId));
  }

  envoyerMessageAdministration(conversationId: number, contenu: string): Observable<MessageAdministration> {
    return this.http.post<MessageAdministration>(API.BASE_URL + API.CONVERSATIONS.MESSAGES_ADMINISTRATION(conversationId), { contenu });
  }
}
