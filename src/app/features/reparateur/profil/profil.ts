import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ReparateurService } from '../../../core/services/reparateur.service';
import Swal from 'sweetalert2';
import { catchError, forkJoin, of } from 'rxjs';
import { DossierReparateur, Reparateur } from '../../../core/models/reparateur.model';

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
  isUploading = signal<boolean>(false);
  selectedFiles: Record<string, File> = {};
  profil = signal<Reparateur | null>(null);
  dossier = signal<DossierReparateur | null>(null);
  piecesManquantes = computed(() => {
    const dossier = this.dossier();
    const pieces: string[] = [];
    if (!dossier?.carte_identite) pieces.push('Carte d’identité');
    if (!dossier?.diplome_certification) pieces.push('Diplôme ou certification');
    if (!dossier?.cv) pieces.push('Curriculum vitæ');
    return pieces;
  });
  dossierIncomplet = computed(() => !!this.profil()?.statut_validation && this.piecesManquantes().length > 0);

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
    forkJoin({
      profil: this.reparateurService.getMonProfil(),
      dossier: this.reparateurService.getMonDossier().pipe(catchError(() => of(null)))
    }).subscribe(({ profil, dossier }) => {
      this.profil.set(profil);
      this.dossier.set(dossier);
      const user = profil.user || this.authService.currentUser();
      this.profilForm.patchValue({
        username: user?.username || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        ville: user?.ville || 'Dakar',
        specialite: profil.specialite,
        experience: profil.experience
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
    this.reparateurService.updateMonProfil({
      email: valeur.email,
      telephone: valeur.telephone,
      ville: valeur.ville,
      specialite: valeur.specialite || '',
      experience: Number(valeur.experience || 0)
    } as Partial<Reparateur>).subscribe({
      next: profil => {
        this.isSaving.set(false);
        this.profil.set(profil);
        this.authService.getProfile().subscribe();
        Swal.fire({
        icon: 'success',
        title: 'Profil professionnel mis à jour',
        text: 'Vos compétences et coordonnées ont été enregistrées.',
        confirmButtonColor: '#0D9488'
        });
      },
      error: error => {
        this.isSaving.set(false);
        Swal.fire({ icon: 'error', title: 'Enregistrement impossible', text: error?.error?.message || 'Vérifiez les informations.', confirmButtonColor: '#DC2626' });
      }
    });
  }

  choisirFichier(champ: string, event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (fichier) this.selectedFiles[champ] = fichier;
  }

  envoyerDocuments(): void {
    const entries = Object.entries(this.selectedFiles);
    if (!entries.length) {
      Swal.fire({ icon: 'info', title: 'Aucun document', text: 'Sélectionnez au moins un fichier.' });
      return;
    }
    const data = new FormData();
    entries.forEach(([champ, fichier]) => data.append(champ, fichier));
    this.isUploading.set(true);
    this.reparateurService.soumettreDossier(data).subscribe({
      next: response => {
        this.isUploading.set(false);
        this.selectedFiles = {};
        this.reparateurService.getMonDossier().subscribe(dossier => this.dossier.set(dossier));
        Swal.fire({ icon: 'success', title: 'Documents enregistrés', text: response.message, confirmButtonColor: '#0D9488' });
      },
      error: error => {
        this.isUploading.set(false);
        Swal.fire({ icon: 'error', title: 'Envoi impossible', text: error?.error?.message || 'Vérifiez le format et la taille des fichiers.', confirmButtonColor: '#DC2626' });
      }
    });
  }
}
