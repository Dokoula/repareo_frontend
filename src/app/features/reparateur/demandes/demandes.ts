import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { ReparateurService } from '../../../core/services/reparateur.service';
import { Demande } from '../../../core/models/demande.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparateur-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demandes.html'
})
export class ReparateurDemandes implements OnInit {
  demandeService = inject(DemandeService);
  reparateurService = inject(ReparateurService);

  demandes = signal<Demande[]>([]);
  demandesAConfirmer = computed(() => this.demandes().filter(demande => demande.statut === 'ASSIGNEE'));

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => this.demandes.set(list));
  }

  accepter(d: Demande): void {
    this.reparateurService.accepterDemande(d.id).subscribe({
      next: () => {
        d.statut = 'ACCEPTEE';
        this.demandes.set([...this.demandes()]);
        Swal.fire({
          icon: 'success',
          title: 'Demande acceptée !',
          text: 'Le client a été prévenu. Le diagnostic sera disponible après sa confirmation d’envoi du matériel.',
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

  refuser(d: Demande): void {
    this.reparateurService.refuserDemande(d.id).subscribe({
      next: () => {
        this.demandes.update(prev => prev.filter(item => item.id !== d.id));
        Swal.fire({
          icon: 'info',
          title: 'Demande refusée',
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
}
