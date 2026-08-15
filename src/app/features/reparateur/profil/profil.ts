import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ReparateurService } from '../../../core/services/reparateur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparateur-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profil.html'
})
export class ReparateurProfil implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  reparateurService = inject(ReparateurService);

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
    specialite: ['Maintenance Matérielle & Remplacement Composants', [Validators.required]],
    experience: [0, [Validators.required, Validators.min(0)]]
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
        title: 'Profil professionnel mis à jour',
        text: 'Vos compétences et coordonnées ont été enregistrées.',
        confirmButtonColor: '#0D9488'
      });
    }, 600);
  }
}
