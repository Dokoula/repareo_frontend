import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { Demande } from '../../../core/models/demande.model';

@Component({
  selector: 'app-client-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demandes.html'
})
export class ClientDemandes implements OnInit {
  demandeService = inject(DemandeService);

  demandes = signal<Demande[]>([]);
  selectedFilter = signal<string>('TOUS');
  selectedDemande = signal<Demande | null>(null);

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => {
      this.demandes.set(list);
    });
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  filteredDemandes(): Demande[] {
    const list = this.demandes();
    const filter = this.selectedFilter();
    if (filter === 'TOUS') return list;
    if (filter === 'EN_COURS') return list.filter(d => d.statut === 'EN_REPARATION' || d.statut === 'DIAGNOSTIC' || d.statut === 'ASSIGNEE');
    if (filter === 'DEVIS') return list.filter(d => d.statut === 'DEVIS_ENVOYE');
    if (filter === 'TERMINEES') return list.filter(d => d.statut === 'TERMINEE' || d.statut === 'PRET');
    return list;
  }

  openDetail(demande: Demande): void {
    this.selectedDemande.set(demande);
  }

  closeDetail(): void {
    this.selectedDemande.set(null);
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'TERMINEE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EN_REPARATION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEVIS_ENVOYE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DIAGNOSTIC': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ASSIGNEE': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente d’assignation';
      case 'ASSIGNEE': return 'Assignée au technicien';
      case 'DIAGNOSTIC': return 'Diagnostic technique';
      case 'DEVIS_ENVOYE': return 'Devis prêt (À valider)';
      case 'DEVIS_ACCEPTE': return 'Devis accepté';
      case 'EN_REPARATION': return 'En cours de réparation';
      case 'PRET': return 'Appareil prêt (Récupération)';
      case 'TERMINEE': return 'Réparation clôturée';
      default: return statut;
    }
  }
}
