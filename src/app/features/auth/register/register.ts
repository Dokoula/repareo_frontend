import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { RoleUtilisateur } from '../../../core/models/user.model';
import { API } from '../../../core/constants/api.constants';
import Swal from 'sweetalert2';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

type Step = 2 | 3;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private http   = inject(HttpClient);

  chosenRole    = signal<'CLIENT' | 'REPARATEUR'>('CLIENT');
  currentStep   = signal<Step>(2);
  showPassword  = signal<boolean>(false);
  isLoading     = signal<boolean>(false);

  createdToken = signal<string | null>(null);
  carteIdentiteFile   = signal<File | null>(null);
  diplomeCertifFile   = signal<File | null>(null);
  cvFile              = signal<File | null>(null);
  autreDocFile        = signal<File | null>(null);

  accountForm = this.fb.group({
    username:         ['', [Validators.required, Validators.minLength(3)]],
    email:            ['', [Validators.required, Validators.email]],
    telephone:        ['', [Validators.required]],
    ville:            ['Dakar', [Validators.required]],
    specialite:       ['Maintenance & Réparation Matérielle'],
    experience:       [0, [Validators.min(0)]],
    password:         ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  villesSenegal = [
    'Dakar', 'Dakar (Plateau)', 'Dakar (Médina)', 'Dakar (Fann–Point E)',
    'Dakar (Ouakam)', 'Dakar (Yoff)', 'Dakar (Almadies)', 'Dakar (Grand Dakar)',
    'Pikine', 'Guédiawaye', 'Rufisque', 'Thiès', 'Mbour', 'Saint-Louis',
    'Kaolack', 'Ziguinchor', 'Tambacounda', 'Diourbel', 'Touba', 'Louga',
    'Fatick', 'Kolda', 'Matam', 'Sédhiou', 'Kédougou', 'Kaffrine',
    'Joal-Fadiouth', 'Tivaouane', 'Mbacké', 'Linguère'
  ];

  specialitesList = [
    'Maintenance Matérielle & Remplacement Composants',
    'Récupération de Données & Sauvegarde',
    'Dépannage Logiciel & Systèmes d\'exploitation',
    'Réseau & Sécurité Informatique',
    'Micro-soudure & Réparation Cartes Mères',
    'Installation & Configuration Systèmes',
    'Maintenance Préventive & Nettoyage Thermique',
    'Polyvalent (Mac, PC, Portables)'
  ];

  setRole(role: 'CLIENT' | 'REPARATEUR'): void { this.chosenRole.set(role); }
  togglePasswordVisibility(): void { this.showPassword.update(v => !v); }

  onFileSelected(event: Event, type: 'cni' | 'diplome' | 'cv' | 'autre'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (type === 'cni')     this.carteIdentiteFile.set(file);
    if (type === 'diplome') this.diplomeCertifFile.set(file);
    if (type === 'cv')      this.cvFile.set(file);
    if (type === 'autre')   this.autreDocFile.set(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  submitAccount(): void {
    if (this.accountForm.invalid) { this.accountForm.markAllAsTouched(); return; }

    this.isLoading.set(true);
    const v = this.accountForm.value;

    const payload: any = {
      username:         v.username,
      email:            v.email,
      telephone:        v.telephone,
      ville:            v.ville,
      role:             this.chosenRole() as RoleUtilisateur,
      password:         v.password,
      confirm_password: v.confirm_password,
      specialite:       this.chosenRole() === 'REPARATEUR' ? v.specialite : '',
      experience:       this.chosenRole() === 'REPARATEUR' ? Number(v.experience) : 0
    };

    this.auth.register(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.createdToken.set(res.access ?? null);

        if (this.chosenRole() === 'REPARATEUR') {
          this.currentStep.set(3);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Compte créé',
            text: 'Votre compte client est prêt.',
            confirmButtonColor: '#2563EB',
            confirmButtonText: 'Accéder à mon espace'
          }).then(() => {
            this.auth.redirectByRole('CLIENT');
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        let msg = 'Une erreur est survenue lors de la création de votre compte.';
        if (err?.status === 0) {
          msg = 'Le serveur est indisponible. Lancez le backend Django puis réessayez.';
        } else if (err?.error) {
          const firstKey = Object.keys(err.error)[0];
          if (firstKey && Array.isArray(err.error[firstKey])) {
            msg = `${firstKey} : ${err.error[firstKey][0]}`;
          } else if (err.error.message) msg = err.error.message;
          else if (err.error.detail) msg = err.error.detail;
        }
        Swal.fire({ icon: 'error', title: 'Erreur d\'inscription', text: msg, confirmButtonColor: '#2563EB' });
      }
    });
  }
  submitDossier(): void {
    if (!this.carteIdentiteFile()) {
      Swal.fire({
        icon: 'warning',
        title: 'Document requis',
        text: 'Veuillez obligatoirement déposer votre carte d\'identité nationale.',
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    this.isLoading.set(true);

    const formData = new FormData();
    formData.append('carte_identite', this.carteIdentiteFile()!);
    if (this.diplomeCertifFile()) formData.append('diplome_certification', this.diplomeCertifFile()!);
    if (this.cvFile()) formData.append('cv', this.cvFile()!);
    if (this.autreDocFile()) formData.append('autre_document', this.autreDocFile()!);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.createdToken()}`
    });

    this.http.post(
      API.BASE_URL + API.REPARATEURS.SOUMETTRE_DOSSIER,
      formData,
      { headers }
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.afficherMessageAdmission();
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.status === 0
          ? 'Le serveur est indisponible. Réessayez lorsque le backend est accessible.'
          : 'Le dossier n’a pas pu être envoyé. Vérifiez les documents puis réessayez.';
        Swal.fire({ icon: 'error', title: 'Envoi impossible', text: message, confirmButtonColor: '#2563EB' });
      }
    });
  }

  private afficherMessageAdmission(): void {
    Swal.fire({
      icon: 'success',
      title: 'Dossier soumis',
      text: 'Votre dossier sera vérifié par un administrateur. Vous recevrez une notification après sa validation.',
      confirmButtonColor: '#2563EB',
      confirmButtonText: 'Retourner à la connexion',
      allowOutsideClick: false
    }).then(() => {
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }

  passerDossier(): void {
    Swal.fire({
      title: 'Compléter plus tard ?',
      text: 'Votre compte ne sera pas activé tant que les documents requis ne seront pas validés.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Compléter plus tard',
      cancelButtonText: 'Ajouter les documents'
    }).then(res => {
      if (res.isConfirmed) {
        this.afficherMessageAdmission();
      }
    });
  }
}
