import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandeService } from '../../../core/services/demande.service';
import { Demande } from '../../../core/models/demande.model';

@Component({
  selector: 'app-admin-demandes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demandes.html'
})
export class AdminDemandes implements OnInit {
  demandeService = inject(DemandeService);
  demandes = signal<Demande[]>([]);

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => this.demandes.set(list));
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'TERMINEE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'EN_REPARATION': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'DEVIS_ENVOYE': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DIAGNOSTIC': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ASSIGNEE': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  }
}
