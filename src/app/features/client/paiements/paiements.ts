import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaiementService } from '../../../core/services/paiement.service';
import { ModePaiement, Paiement } from '../../../core/models/paiement.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './paiements.html'
})
export class ClientPaiements implements OnInit {
  private fb = inject(FormBuilder);
  private paiementService = inject(PaiementService);

  modesPaiement = signal<ModePaiement[]>([]);
  paiements = signal<Paiement[]>([]);
  selectedMode = signal<number>(2);
  isProcessing = signal<boolean>(false);
  showSuccessReceipt = signal<Paiement | null>(null);

  payForm = this.fb.group({
    phoneOrCard: ['+225 07 12 34 56 78', [Validators.required]]
  });

  ngOnInit(): void {
    this.paiementService.getModesPaiement().subscribe(modes => this.modesPaiement.set(modes));
    this.paiementService.getPaiements().subscribe(list => this.paiements.set(list));
  }

  selectMode(id: number): void {
    this.selectedMode.set(id);
  }

  payer(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.paiementService.effectuerPaiement(401, {
        mode_paiement: this.selectedMode(),
        reference_transaction: 'TX-' + Math.floor(Math.random() * 900000 + 100000)
      }).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.showSuccessReceipt.set(res.paiement);
          this.paiements.update(prev => [res.paiement, ...prev]);
          Swal.fire({
            icon: 'success',
            title: 'Paiement Réussi !',
            text: 'Votre transaction a été validée. Votre reçu est disponible.',
            confirmButtonColor: '#10B981'
          });
        }
      });
    }, 1200);
  }

  closeReceipt(): void {
    this.showSuccessReceipt.set(null);
  }
}
