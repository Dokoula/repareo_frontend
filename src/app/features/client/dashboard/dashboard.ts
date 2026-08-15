import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { DemandeService } from '../../../core/services/demande.service';
import { Demande } from '../../../core/models/demande.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class ClientDashboard implements OnInit {
  authService = inject(AuthService);
  demandeService = inject(DemandeService);

  demandes = signal<Demande[]>([]);
  activeDemande = signal<Demande | null>(null);

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => {
      this.demandes.set(list);
      const active = list.find(d => d.statut !== 'TERMINEE' && d.statut !== 'ANNULEE');
      this.activeDemande.set(active || list[0] || null);
    });
  }

  getStepNumber(statut: string): number {
    switch (statut) {
      case 'EN_ATTENTE':
        return 1;
      case 'ASSIGNEE':
      case 'DIAGNOSTIC':
        return 2;
      case 'DEVIS_ENVOYE':
      case 'DEVIS_ACCEPTE':
        return 3;
      case 'EN_REPARATION':
        return 4;
      case 'PRET':
        return 5;
      case 'TERMINEE':
        return 6;
      default:
        return 1;
    }
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'TERMINEE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EN_REPARATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEVIS_ENVOYE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DIAGNOSTIC':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ASSIGNEE':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
