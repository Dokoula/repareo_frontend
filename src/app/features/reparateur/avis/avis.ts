import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  noteMoyenne = computed(() => {
    const avis = this.avisList();
    if (avis.length === 0) return 0;
    return avis.reduce((total, item) => total + item.note, 0) / avis.length;
  });
  satisfaction = computed(() => Math.round(this.noteMoyenne() * 20));

  ngOnInit(): void {
    this.avisService.getAvis().subscribe(list => this.avisList.set(list));
  }
}
