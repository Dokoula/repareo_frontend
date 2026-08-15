import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReparationService } from '../../../core/services/reparation.service';
import { Reparation } from '../../../core/models/reparation.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparateur-reparations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparations.html'
})
export class ReparateurReparations implements OnInit {
  reparationService = inject(ReparationService);

  reparations = signal<Reparation[]>([]);
  commentaireFin = signal<string>('Composant d’alimentation remplacé, tests de tension 19.5V et stabilité 24h OK. Nettoyage interne effectué.');

  ngOnInit(): void {
    this.reparationService.getReparationById(401).subscribe(rep => {
      this.reparations.set([rep]);
    });
  }

  demarrer(): void {
    this.reparationService.demarrerReparation(301).subscribe({
      next: (res) => {
        this.reparations.set([res.reparation]);
        Swal.fire({
          icon: 'success',
          title: 'Réparation démarrée !',
          text: 'Le statut est passé à "EN_REPARATION". Le client peut suivre l’avancement.',
          confirmButtonColor: '#0D9488'
        });
      }
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
            Swal.fire({
              icon: 'success',
              title: 'Réparation terminée !',
              text: 'L’intervention est clôturée avec succès.',
              confirmButtonColor: '#0D9488'
            });
          }
        });
      }
    });
  }
}
