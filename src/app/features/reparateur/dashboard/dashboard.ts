import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { DemandeService } from '../../../core/services/demande.service';
import { ReparateurService } from '../../../core/services/reparateur.service';
import { Demande } from '../../../core/models/demande.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparateur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class ReparateurDashboard implements OnInit {
  authService = inject(AuthService);
  demandeService = inject(DemandeService);
  reparateurService = inject(ReparateurService);

  demandes = signal<Demande[]>([]);
  demandesAConfirmerListe = computed(() => this.demandes().filter(demande => demande.statut === 'ASSIGNEE'));
  demandesAConfirmer = computed(() => this.demandesAConfirmerListe().length);
  interventionsEnCours = computed(() => this.demandes().filter(demande => ['ACCEPTEE', 'DIAGNOSTIC', 'DEVIS_ENVOYE', 'DEVIS_ACCEPTE', 'EN_REPARATION', 'PRET'].includes(demande.statut)).length);
  interventionsTerminees = computed(() => this.demandes().filter(demande => demande.statut === 'TERMINEE').length);

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => {
      this.demandes.set(list);
    });
  }

  accepter(demande: Demande): void {
    this.reparateurService.accepterDemande(demande.id).subscribe({
      next: () => {
        demande.statut = 'ACCEPTEE';
        this.demandes.set([...this.demandes()]);
        Swal.fire({
          icon: 'success',
          title: 'Demande acceptée !',
          text: `La demande #${demande.id} a été acceptée. Le client doit maintenant confirmer l’envoi ou le dépôt de son matériel.`,
          confirmButtonColor: '#0D9488'
        });
      },
      error: error => Swal.fire({
        icon: 'error',
        title: 'Acceptation impossible',
        text: error.error?.message || 'Une erreur est survenue.',
        confirmButtonColor: '#0D9488'
      })
    });
  }

  refuser(demande: Demande): void {
    Swal.fire({
      title: 'Refuser cette demande ?',
      text: 'La demande sera réaffectée à un autre réparateur certifié.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, refuser',
      cancelButtonText: 'Annuler'
    }).then((res) => {
      if (res.isConfirmed) {
        this.reparateurService.refuserDemande(demande.id).subscribe({
          next: () => {
            this.demandes.update(prev => prev.filter(d => d.id !== demande.id));
            Swal.fire({
              icon: 'info',
              title: 'Demande refusée',
              text: 'La demande a été retirée de votre atelier.',
              confirmButtonColor: '#0D9488'
            });
          },
          error: error => Swal.fire({
            icon: 'error',
            title: 'Refus impossible',
            text: error.error?.message || 'Une erreur est survenue.',
            confirmButtonColor: '#0D9488'
          })
        });
      }
    });
  }
}
