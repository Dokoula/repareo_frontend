import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../../../core/services/auth';
import { PaiementService } from '../../../core/services/paiement.service';
import { Portefeuille as PortefeuilleModel } from '../../../core/models/paiement.model';

@Component({
  selector: 'app-portefeuille',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './portefeuille.html'
})
export class Portefeuille implements OnInit {
  private fb = inject(FormBuilder);
  private paiementService = inject(PaiementService);
  private authService = inject(AuthService);

  portefeuille = signal<PortefeuilleModel | null>(null);
  chargement = signal(true);
  retraitEnCours = signal(false);

  retraitForm = this.fb.group({
    montant: [null as number | null, [Validators.required, Validators.min(500)]],
    moyen: ['WAVE', Validators.required],
    destination: ['', Validators.required]
  });

  get estAdmin(): boolean {
    const user = this.authService.currentUser();
    return !!user && (user.role === 'ADMINISTRATEUR' || user.role === 'ADMIN');
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.paiementService.getPortefeuille().subscribe({
      next: data => {
        this.portefeuille.set(data);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false)
    });
  }

  retirer(): void {
    if (this.retraitForm.invalid) {
      this.retraitForm.markAllAsTouched();
      return;
    }
    const value = this.retraitForm.getRawValue();
    this.retraitEnCours.set(true);
    this.paiementService.effectuerRetrait({
      montant: Number(value.montant),
      moyen: value.moyen || 'WAVE',
      destination: value.destination || ''
    }).subscribe({
      next: response => {
        this.retraitEnCours.set(false);
        this.retraitForm.reset({ montant: null, moyen: 'WAVE', destination: '' });
        Swal.fire({ icon: 'success', title: 'Retrait effectué', text: `${response.retrait.montant.toLocaleString()} FCFA retirés.`, confirmButtonColor: '#0F766E' });
        this.charger();
      },
      error: error => {
        this.retraitEnCours.set(false);
        Swal.fire({ icon: 'error', title: 'Retrait impossible', text: error?.error?.message || 'Vérifiez le montant demandé.', confirmButtonColor: '#DC2626' });
      }
    });
  }
}
