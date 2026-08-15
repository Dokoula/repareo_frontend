import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AvisService } from '../../../core/services/avis.service';
import { Avis } from '../../../core/models/avis.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './avis.html'
})
export class ClientAvis implements OnInit {
  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);

  avisList = signal<Avis[]>([]);
  selectedStars = signal<number>(5);
  isSubmitting = signal<boolean>(false);

  avisForm = this.fb.group({
    commentaire: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.avisService.getAvis().subscribe(list => this.avisList.set(list));
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

    this.avisService.creerAvis(401, {
      note: this.selectedStars(),
      commentaire
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.avisList.update(prev => [res.avis, ...prev]);
        this.avisForm.reset();
        Swal.fire({
          icon: 'success',
          title: 'Merci pour votre retour !',
          text: 'Votre évaluation aide la communauté Repareo et valorise le travail du technicien.',
          confirmButtonColor: '#4F46E5'
        });
      }
    });
  }
}
