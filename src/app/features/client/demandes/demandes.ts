import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { Demande, MiseEnRelationResult, ReparateurSuggestion } from '../../../core/models/demande.model';
import Swal from 'sweetalert2';
import { Subject, switchMap, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-client-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demandes.html'
})
export class ClientDemandes implements OnInit, OnDestroy {
  demandeService = inject(DemandeService);

  demandes = signal<Demande[]>([]);
  selectedFilter = signal<string>('TOUS');
  selectedDemande = signal<Demande | null>(null);
  rechercheResult = signal<MiseEnRelationResult | null>(null);
  searchingDemandeId = signal<number | null>(null);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    timer(0, 15000).pipe(
      switchMap(() => this.demandeService.getDemandes()),
      takeUntil(this.destroy$)
    ).subscribe(list => this.demandes.set(list));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  filteredDemandes(): Demande[] {
    const list = this.demandes();
    const filter = this.selectedFilter();
    if (filter === 'TOUS') return list;
    if (filter === 'EN_COURS') return list.filter(d => ['ASSIGNEE', 'ACCEPTEE', 'DIAGNOSTIC', 'DEVIS_ACCEPTE', 'EN_REPARATION'].includes(d.statut));
    if (filter === 'DEVIS') return list.filter(d => d.statut === 'DEVIS_ENVOYE');
    if (filter === 'TERMINEES') return list.filter(d => d.statut === 'TERMINEE' || d.statut === 'PRET');
    return list;
  }

  openDetail(demande: Demande): void {
    this.rechercheResult.set(null);
    this.selectedDemande.set(demande);
  }

  closeDetail(): void {
    this.selectedDemande.set(null);
    this.rechercheResult.set(null);
  }

  relancerRecherche(demande: Demande): void {
    this.selectedDemande.set(demande);
    this.rechercheResult.set(null);
    this.searchingDemandeId.set(demande.id);
    this.demandeService.rechercherReparateurs(demande.id).subscribe({
      next: resultat => {
        this.searchingDemandeId.set(null);
        this.rechercheResult.set(resultat);
      },
      error: error => {
        this.searchingDemandeId.set(null);
        Swal.fire({
          icon: 'error',
          title: 'Recherche impossible',
          text: error.error?.message || 'Impossible de rechercher des réparateurs pour le moment.',
          confirmButtonColor: '#2563EB'
        });
      }
    });
  }

  assignerReparateur(reparateur: ReparateurSuggestion): void {
    const demande = this.selectedDemande();
    if (!demande) return;

    Swal.fire({
      icon: 'question',
      title: 'Choisir ce réparateur ?',
      text: `La demande #${demande.id} sera envoyée à ${reparateur.nom} (${reparateur.ville}).`,
      showCancelButton: true,
      confirmButtonText: 'Oui, envoyer la demande',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563EB'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.demandeService.assignerReparateur(demande.id, reparateur.id).subscribe({
        next: () => {
          this.closeDetail();
          this.chargerDemandes();
          Swal.fire({
            icon: 'success',
            title: 'Demande envoyée',
            text: `${reparateur.nom} a reçu votre demande et doit maintenant l’accepter.`,
            confirmButtonColor: '#2563EB'
          });
        },
        error: error => Swal.fire({
          icon: 'error',
          title: 'Assignation impossible',
          text: error.error?.message || 'Ce réparateur n’est peut-être plus disponible.',
          confirmButtonColor: '#2563EB'
        })
      });
    });
  }

  afficherDevis(statut: string): boolean {
    return ['DEVIS_ENVOYE', 'DEVIS_ACCEPTE', 'DEVIS_REFUSE', 'EN_REPARATION', 'PRET', 'TERMINEE'].includes(statut);
  }

  confirmerEnvoi(demande: Demande): void {
    Swal.fire({
      icon: 'warning',
      title: 'Confirmer l’envoi du matériel ?',
      html: 'En confirmant, vous indiquez avoir envoyé ou déposé votre appareil chez le réparateur.<br><br><strong>Le diagnostic est facturé 5 000 FCFA. Ce montant sera inclus dans le prix total du devis.</strong>',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer l’envoi',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563EB'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.demandeService.confirmerEnvoiMateriel(demande.id).subscribe({
        next: response => {
          demande.statut = 'DIAGNOSTIC';
          this.demandes.set([...this.demandes()]);
          this.selectedDemande.set(this.selectedDemande()?.id === demande.id ? demande : this.selectedDemande());
          Swal.fire({
            icon: 'success',
            title: 'Envoi confirmé',
            text: response.message,
            confirmButtonColor: '#2563EB'
          });
        },
        error: error => Swal.fire({
          icon: 'error',
          title: 'Confirmation impossible',
          text: error.error?.message || 'Une erreur est survenue. Réessayez.',
          confirmButtonColor: '#2563EB'
        })
      });
    });
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'TERMINEE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EN_REPARATION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEVIS_ENVOYE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DIAGNOSTIC': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ASSIGNEE': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'ACCEPTEE': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente d’assignation';
      case 'ASSIGNEE': return 'En attente d’acceptation du réparateur';
      case 'ACCEPTEE': return 'Acceptée — matériel à envoyer';
      case 'DIAGNOSTIC': return 'Diagnostic technique';
      case 'DEVIS_ENVOYE': return 'Devis prêt (À valider)';
      case 'DEVIS_ACCEPTE': return 'Devis accepté';
      case 'EN_REPARATION': return 'En cours de réparation';
      case 'PRET': return 'Appareil prêt (Récupération)';
      case 'TERMINEE': return 'Réparation clôturée';
      default: return statut;
    }
  }

  private chargerDemandes(): void {
    this.demandeService.getDemandes().subscribe(list => this.demandes.set(list));
  }
}
