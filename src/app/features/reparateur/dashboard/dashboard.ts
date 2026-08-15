import { Component, inject, OnInit, signal } from '@angular/core';
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

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => {
      this.demandes.set(list);
    });
  }

  accepter(demande: Demande): void {
    this.reparateurService.accepterDemande(demande.id).subscribe({
      next: () => {
        demande.statut = 'DIAGNOSTIC';
        Swal.fire({
          icon: 'success',
          title: 'Demande acceptée !',
          text: `Vous avez pris en charge la demande #${demande.id}. Vous pouvez rédiger le diagnostic technique.`,
          confirmButtonColor: '#0D9488'
        });
      }
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
          }
        });
      }
    });
  }
}
