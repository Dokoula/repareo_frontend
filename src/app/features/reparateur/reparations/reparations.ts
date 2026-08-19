import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReparationService } from '../../../core/services/reparation.service';
import { Reparation } from '../../../core/models/reparation.model';
import { DevisService } from '../../../core/services/devis.service';
import Swal from 'sweetalert2';
import { Devis } from '../../../core/models/devis.model';
import { forkJoin, Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-reparateur-reparations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparations.html'
})
export class ReparateurReparations implements OnInit, OnDestroy {
  reparationService = inject(ReparationService);
  devisService = inject(DevisService);

  reparations = signal<Reparation[]>([]);
  devisADemarrer = signal<Devis[]>([]);
  devisEnAttenteClient = signal<Devis[]>([]);
  commentaireFin = signal<string>('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.chargerDonnees();
    timer(15000, 15000).pipe(takeUntil(this.destroy$)).subscribe(() => this.chargerDonnees(false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  demarrer(devis: Devis): void {
    this.reparationService.demarrerReparation(devis.id).subscribe({
      next: () => {
        this.chargerDonnees();
        Swal.fire({
          icon: 'success',
          title: 'Réparation démarrée',
          text: 'Le client peut maintenant suivre son avancement.',
          confirmButtonColor: '#2563EB'
        });
      },
      error: error => Swal.fire({
        icon: 'error',
        title: 'Démarrage impossible',
        text: error.error?.message || 'Une erreur est survenue.',
        confirmButtonColor: '#2563EB'
      })
    });
  }

  terminer(r: Reparation): void {
    Swal.fire({
      title: 'Clôturer la réparation ?',
      text: 'L’appareil sera marqué comme PRÊT pour récupération et le client recevra un SMS/Email de notification.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0D9488',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, marquer comme prêt',
      cancelButtonText: 'Annuler'
    }).then((res) => {
      if (res.isConfirmed) {
        this.reparationService.terminerReparation(r.id, this.commentaireFin()).subscribe({
          next: () => {
            r.statut = 'PRET';
            this.reparations.set([...this.reparations()]);
            Swal.fire({
              icon: 'success',
              title: 'Réparation terminée !',
              text: 'L’intervention est clôturée avec succès.',
              confirmButtonColor: '#0D9488'
            });
          },
          error: error => Swal.fire({
            icon: 'error',
            title: 'Clôture impossible',
            text: error.error?.message || 'Une erreur est survenue.',
            confirmButtonColor: '#2563EB'
          })
        });
      }
    });
  }

  devisId(reparation: Reparation): number {
    return typeof reparation.devis === 'number' ? reparation.devis : reparation.devis.id;
  }

  montant(reparation: Reparation): number {
    return typeof reparation.devis === 'number' ? 0 : reparation.devis.montant_total;
  }

  libelleDevis(devis: Devis): string {
    if (typeof devis.diagnostic === 'number' || typeof devis.diagnostic.demande === 'number') return `Devis #${devis.id}`;
    const demande = devis.diagnostic.demande;
    return `${demande.marque_ordinateur} ${demande.modele_ordinateur} — ${demande.client.user.username}`;
  }

  libelleReparation(reparation: Reparation): string {
    return typeof reparation.devis === 'number' ? `Intervention #${reparation.id}` : this.libelleDevis(reparation.devis);
  }

  private chargerDonnees(afficherErreur = true): void {
    forkJoin({
      reparations: this.reparationService.getReparations(),
      devis: this.devisService.getDevisList()
    }).subscribe({
      next: ({ reparations, devis }) => {
        this.reparations.set(reparations);
        const devisDejaDemarres = new Set(reparations.map(item => this.devisId(item)));
        this.devisADemarrer.set(devis.filter(item => item.statut_devis === 'ACCEPTE' && !devisDejaDemarres.has(item.id)));
        this.devisEnAttenteClient.set(devis.filter(item => item.statut_devis === 'EN_ATTENTE' && !devisDejaDemarres.has(item.id)));
      },
      error: error => {
        if (afficherErreur) {
          Swal.fire({
            icon: 'error',
            title: 'Réparations indisponibles',
            text: error.error?.message || 'Impossible de charger les réparations.',
            confirmButtonColor: '#2563EB'
          });
        }
      }
    });
  }
}
