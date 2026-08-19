import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth';
import { AdminService } from '../../../core/services/admin.service';
import { MessagerieService } from '../../../core/services/messagerie.service';
import { ConversationAdministration, MessageAdministration } from '../../../core/models/conversation-administration.model';
import { Reparateur } from '../../../core/models/reparateur.model';

@Component({
  selector: 'app-messagerie-administration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie-administration.html'
})
export class MessagerieAdministration implements OnInit {
  auth = inject(AuthService);
  private adminService = inject(AdminService);
  private messagerie = inject(MessagerieService);

  conversations = signal<ConversationAdministration[]>([]);
  reparateurs = signal<Reparateur[]>([]);
  conversation = signal<ConversationAdministration | null>(null);
  messages = signal<MessageAdministration[]>([]);
  nouveauMessage = '';

  get estAdmin(): boolean {
    const user = this.auth.currentUser();
    return !!user && (user.role === 'ADMINISTRATEUR' || user.role === 'ADMIN');
  }

  ngOnInit(): void {
    if (this.estAdmin) this.adminService.getReparateurs().subscribe(items => this.reparateurs.set(items));
    this.messagerie.getConversationsAdministration().subscribe(items => {
      this.conversations.set(items);
      if (items[0]) this.selectionner(items[0]);
    });
  }

  ouvrirPour(reparateurId: number): void {
    if (!reparateurId) return;
    this.messagerie.ouvrirConversationAdministration(reparateurId).subscribe(conversation => {
      if (!this.conversations().some(item => item.id === conversation.id)) this.conversations.update(items => [conversation, ...items]);
      this.selectionner(conversation);
    });
  }

  selectionner(conversation: ConversationAdministration): void {
    this.conversation.set(conversation);
    this.messagerie.getMessagesAdministration(conversation.id).subscribe(messages => this.messages.set(messages));
  }

  envoyer(): void {
    const conversation = this.conversation();
    const contenu = this.nouveauMessage.trim();
    if (!conversation || !contenu) return;
    this.messagerie.envoyerMessageAdministration(conversation.id, contenu).subscribe(message => {
      this.messages.update(items => [...items, message]);
      this.nouveauMessage = '';
    });
  }
}
