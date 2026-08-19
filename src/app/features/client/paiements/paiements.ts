import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaiementService } from '../../../core/services/paiement.service';
import { ModePaiement, Paiement } from '../../../core/models/paiement.model';
import Swal from 'sweetalert2';
import { ReparationService } from '../../../core/services/reparation.service';
import { Reparation } from '../../../core/models/reparation.model';

@Component({
  selector: 'app-client-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './paiements.html'
})
export class ClientPaiements implements OnInit {
  private fb = inject(FormBuilder);
  private paiementService = inject(PaiementService);
  private reparationService = inject(ReparationService);

  modesPaiement = signal<ModePaiement[]>([]);
  paiements = signal<Paiement[]>([]);
  selectedMode = signal<number>(0);
  selectedReparation = signal<Reparation | null>(null);
  isProcessing = signal<boolean>(false);
  showSuccessReceipt = signal<Paiement | null>(null);

  payForm = this.fb.group({
    phoneOrCard: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.paiementService.getModesPaiement().subscribe((modes) => {
      this.modesPaiement.set(modes);
      this.selectedMode.set(modes[0]?.id ?? 0);
    });
    this.paiementService.getPaiements().subscribe((paiements) => {
      this.paiements.set(paiements);
      const paidIds = new Set(paiements.map((item) => typeof item.reparation === 'number' ? item.reparation : item.reparation.id));
      this.reparationService.getReparations().subscribe((reparations) => {
        this.selectedReparation.set(reparations.find((item) => item.statut === 'PRET' && !paidIds.has(item.id)) ?? null);
      });
    });
  }

  selectMode(id: number): void {
    this.selectedMode.set(id);
  }

  payer(): void {
    const reparation = this.selectedReparation();
    if (!reparation || !this.selectedMode() || this.payForm.invalid) {
      this.payForm.markAllAsTouched();
      return;
    }
    this.isProcessing.set(true);
    this.paiementService.effectuerPaiement(reparation.id, {
        mode_paiement: this.selectedMode(),
        identifiant_payeur: this.payForm.value.phoneOrCard ?? ''
      }).subscribe({
        next: (res) => {
          this.paiementService.getPaiementById(res.paiement).subscribe((paiement) => {
            this.isProcessing.set(false);
            this.showSuccessReceipt.set(paiement);
            this.paiements.update((items) => [paiement, ...items]);
            Swal.fire({
              icon: 'success',
              title: 'Paiement réussi',
              text: 'Votre transaction a été enregistrée.',
              confirmButtonColor: '#10B981'
            });
          });
        },
        error: (error) => {
          this.isProcessing.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Paiement impossible',
            text: error?.error?.message || error?.error?.detail || 'Le paiement n’a pas pu être traité. Vérifiez les informations puis réessayez.',
            confirmButtonColor: '#4F46E5'
          });
        }
      });
  }

  closeReceipt(): void {
    this.showSuccessReceipt.set(null);
  }

  montantAPayer(): number {
    const devis = this.selectedReparation()?.devis;
    return typeof devis === 'object' ? devis.montant_total : 0;
  }
}
