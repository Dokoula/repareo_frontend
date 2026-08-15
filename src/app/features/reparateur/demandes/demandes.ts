import { Component, inject, OnInit, signal } from '@angular/core';
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

  ngOnInit(): void {
    this.demandeService.getDemandes().subscribe(list => this.demandes.set(list));
  }

  accepter(d: Demande): void {
    this.reparateurService.accepterDemande(d.id).subscribe(() => {
      d.statut = 'DIAGNOSTIC';
      Swal.fire({
        icon: 'success',
        title: 'Demande acceptée !',
        text: 'La demande a été ajoutée à votre atelier.',
        confirmButtonColor: '#0D9488'
      });
    });
  }

  refuser(d: Demande): void {
    this.reparateurService.refuserDemande(d.id).subscribe(() => {
      this.demandes.update(prev => prev.filter(item => item.id !== d.id));
      Swal.fire({
        icon: 'info',
        title: 'Demande refusée',
        confirmButtonColor: '#0D9488'
      });
    });
  }
}
