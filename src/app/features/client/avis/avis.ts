import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AvisService } from '../../../core/services/avis.service';
import { Avis } from '../../../core/models/avis.model';
import Swal from 'sweetalert2';
import { PaiementService } from '../../../core/services/paiement.service';

@Component({
  selector: 'app-client-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './avis.html'
})
export class ClientAvis implements OnInit {
  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);
  private paiementService = inject(PaiementService);

  avisList = signal<Avis[]>([]);
  selectedStars = signal<number>(5);
  isSubmitting = signal<boolean>(false);
  reparationId = signal<number | null>(null);

  avisForm = this.fb.group({
    commentaire: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.avisService.getAvis().subscribe(list => this.avisList.set(list));
    this.paiementService.getPaiements().subscribe((paiements) => {
      const paiement = paiements[0];
      if (!paiement) return;
      this.reparationId.set(typeof paiement.reparation === 'number' ? paiement.reparation : paiement.reparation.id);
    });
  }

  setStars(stars: number): void {
    this.selectedStars.set(stars);
  }

  onSubmit(): void {
    if (this.avisForm.invalid) {
      this.avisForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const commentaire = this.avisForm.value.commentaire!;

    const reparationId = this.reparationId();
    if (!reparationId) {
      this.isSubmitting.set(false);
      return;
    }
    this.avisService.creerAvis(reparationId, {
      note: this.selectedStars(),
      commentaire
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.avisService.getAvis().subscribe((avis) => this.avisList.set(avis));
        this.avisForm.reset();
        Swal.fire({
          icon: 'success',
          title: 'Merci pour votre retour !',
          text: 'Votre évaluation aide la communauté Repareo et valorise le travail du technicien.',
          confirmButtonColor: '#4F46E5'
        });
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
