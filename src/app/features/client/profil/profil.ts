import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profil.html'
})
export class ClientProfil implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private clientService = inject(ClientService);

  isSaving = signal<boolean>(false);

  villesSenegal = [
    'Dakar', 'Dakar (Plateau)', 'Dakar (Médina)', 'Dakar (Fann–Point E)',
    'Dakar (Ouakam)', 'Dakar (Yoff)', 'Dakar (Almadies)', 'Dakar (Grand Dakar)',
    'Pikine', 'Guédiawaye', 'Rufisque', 'Thiès', 'Mbour', 'Saint-Louis',
    'Kaolack', 'Ziguinchor', 'Tambacounda', 'Diourbel', 'Touba', 'Louga',
    'Fatick', 'Kolda', 'Matam', 'Sédhiou', 'Kédougou', 'Kaffrine',
    'Joal-Fadiouth', 'Tivaouane', 'Mbacké', 'Linguère'
  ];

  profilForm = this.fb.group({
    username: [{ value: '', disabled: true }],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required]],
    ville: ['Dakar', [Validators.required]],
    adresse: ['']
  });

  ngOnInit(): void {
    this.clientService.getMonProfil().subscribe(profil => {
      const user = profil.user;
      this.profilForm.patchValue({
        username: user.username,
        email: user.email,
        telephone: user.telephone,
        ville: user.ville,
        adresse: profil.adresse
      });
    });
  }

  save(): void {
    if (this.profilForm.invalid) {
      this.profilForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const valeur = this.profilForm.getRawValue();
    this.clientService.updateMonProfil({
      email: valeur.email || '', telephone: valeur.telephone || '',
      ville: valeur.ville || '', adresse: valeur.adresse || ''
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.authService.getProfile().subscribe();
        Swal.fire({
        icon: 'success',
        title: 'Profil mis à jour',
        text: 'Vos informations personnelles ont été enregistrées avec succès.',
        confirmButtonColor: '#4F46E5'
        });
      },
      error: error => {
        this.isSaving.set(false);
        Swal.fire({ icon: 'error', title: 'Enregistrement impossible', text: error?.error?.message || 'Vérifiez les informations.', confirmButtonColor: '#DC2626' });
      }
    });
  }
}
