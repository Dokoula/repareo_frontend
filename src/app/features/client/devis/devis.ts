import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DevisService } from '../../../core/services/devis.service';
import { Devis } from '../../../core/models/devis.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-devis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './devis.html'
})
export class ClientDevis implements OnInit {
  devisService = inject(DevisService);
  router = inject(Router);

  devisList = signal<Devis[]>([]);

  ngOnInit(): void {
    this.devisService.getDevisList().subscribe(list => {
      this.devisList.set(list);
    });
  }

  accepter(devis: Devis): void {
    Swal.fire({
      title: 'Accepter ce devis ?',
      text: `Montant total : ${devis.montant_total.toLocaleString()} FCFA. Vous confirmez le lancement de la réparation ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, accepter le devis',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.devisService.accepterDevis(devis.id).subscribe({
          next: () => {
            devis.statut_devis = 'ACCEPTE';
            Swal.fire({
              icon: 'success',
              title: 'Devis accepté !',
              text: 'Le réparateur a été notifié et démarre l’intervention.',
              confirmButtonColor: '#4F46E5'
            });
          }
        });
      }
    });
  }

  refuser(devis: Devis): void {
    Swal.fire({
      title: 'Refuser ce devis ?',
      text: 'Le technicien sera informé de votre refus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, refuser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.devisService.refuserDevis(devis.id).subscribe({
          next: () => {
            devis.statut_devis = 'REFUSE';
            Swal.fire({
              icon: 'info',
              title: 'Devis refusé',
              text: 'Le dossier a été mis à jour.',
              confirmButtonColor: '#4F46E5'
            });
          }
        });
      }
    });
  }
}
