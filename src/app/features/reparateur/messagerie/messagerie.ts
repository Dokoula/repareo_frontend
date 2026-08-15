import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagerieService } from '../../../core/services/messagerie.service';
import { AuthService } from '../../../core/services/auth';
import { Message } from '../../../core/models/message.model';

@Component({
  selector: 'app-reparateur-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.html'
})
export class ReparateurMessagerie implements OnInit {
  messagerieService = inject(MessagerieService);
  authService = inject(AuthService);

  messages = signal<Message[]>([]);
  nouveauMessage = signal<string>('');

  ngOnInit(): void {
    this.messagerieService.getConversation(601).subscribe(c => {
      this.messages.set(c.messages || []);
    });
  }

  envoyer(): void {
    const text = this.nouveauMessage().trim();
    if (!text) return;

    this.messagerieService.envoyerMessage(601, text).subscribe(res => {
      this.messages.update(prev => [...prev, res.data]);
      this.nouveauMessage.set('');
    });
  }
}
