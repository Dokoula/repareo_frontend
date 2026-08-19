import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { Avis } from '../../../core/models/avis.model';
import { AvisService } from '../../../core/services/avis.service';

@Component({
  selector: 'app-admin-avis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avis.html'
})
export class AdminAvis implements OnInit {
  private service = inject(AvisService);
  avis = signal<Avis[]>([]);
  moyenne = computed(() => this.avis().length ? this.avis().reduce((total, item) => total + item.note, 0) / this.avis().length : 0);

  ngOnInit(): void {
    this.service.getAvis().subscribe(items => this.avis.set(items));
  }
}
