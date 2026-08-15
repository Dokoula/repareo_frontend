import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService } from '../../../core/services/avis.service';
import { Avis } from '../../../core/models/avis.model';

@Component({
  selector: 'app-reparateur-avis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avis.html'
})
export class ReparateurAvis implements OnInit {
  avisService = inject(AvisService);
  avisList = signal<Avis[]>([]);

  ngOnInit(): void {
    this.avisService.getAvis().subscribe(list => this.avisList.set(list));
  }
}
