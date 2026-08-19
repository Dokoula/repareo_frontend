import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagerieService } from '../../../core/services/messagerie.service';
import { AuthService } from '../../../core/services/auth';
import { Conversation } from '../../../core/models/conversation.model';
import { Message } from '../../../core/models/message.model';

@Component({
  selector: 'app-client-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.html'
})
export class ClientMessagerie implements OnInit {
  messagerieService = inject(MessagerieService);
  authService = inject(AuthService);

  conversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  nouveauMessage = signal<string>('');

  ngOnInit(): void {
    this.messagerieService.getConversations().subscribe((conversations) => {
      const first = conversations[0];
      if (!first) return;
      this.messagerieService.getConversation(first.id).subscribe((conversation) => {
        this.conversation.set(conversation);
        this.messages.set(conversation.messages || []);
      });
    });
  }

  envoyer(): void {
    const text = this.nouveauMessage().trim();
    if (!text) return;

    const conversationId = this.conversation()?.id;
    if (!conversationId) return;
    this.messagerieService.envoyerMessage(conversationId, text).subscribe(res => {
      this.messages.update(prev => [...prev, res.data]);
      this.nouveauMessage.set('');
    });
  }
}
