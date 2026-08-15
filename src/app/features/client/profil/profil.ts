import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profil.html'
})
export class ClientProfil implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

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
    const user = this.authService.currentUser();
    if (user) {
      this.profilForm.patchValue({
        username: user.username,
        email: user.email,
        telephone: user.telephone,
        ville: user.ville
      });
    }
  }

  save(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      Swal.fire({
        icon: 'success',
        title: 'Profil mis à jour',
        text: 'Vos informations personnelles ont été enregistrées avec succès.',
        confirmButtonColor: '#4F46E5'
      });
    }, 600);
  }
}
