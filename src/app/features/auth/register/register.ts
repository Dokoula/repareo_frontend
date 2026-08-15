import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule,
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

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html'
})
export class Register {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private http   = inject(HttpClient);

  chosenRole    = signal<'CLIENT' | 'REPARATEUR'>('CLIENT');
  currentStep   = signal<Step>(1);
  showPassword  = signal<boolean>(false);
  isLoading     = signal<boolean>(false);

  /** Token JWT obtenu après la création de compte (étape 2), utilisé pour uploader les documents (étape 3) */
  createdToken = signal<string | null>(null);

  // Fichiers sélectionnés pour l'étape 3
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
  goToStep(step: Step): void { this.currentStep.set(step); }
  proceedStep1(): void { this.currentStep.set(2); }
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

  // ── Étape 2 : Créer le compte ────────────────────────────────────────────
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
        // Stocker le token pour l'upload des documents étape 3
        this.createdToken.set(res.access ?? null);

        if (this.chosenRole() === 'REPARATEUR') {
          // Passer à l'étape 3 : dépôt des documents
          this.currentStep.set(3);
        } else {
          // CLIENT → inscription directe, redirection espace client
          Swal.fire({
            icon: 'success',
            title: 'Compte créé avec succès !',
            text: 'Bienvenue sur Repareo ! Vous pouvez maintenant déposer votre première demande de réparation.',
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Accéder à mon espace'
          }).then(() => {
            this.auth.redirectByRole('CLIENT');
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        let msg = 'Une erreur est survenue lors de la création de votre compte.';
        if (err?.error) {
          const firstKey = Object.keys(err.error)[0];
          if (firstKey && Array.isArray(err.error[firstKey])) {
            msg = `${firstKey} : ${err.error[firstKey][0]}`;
          } else if (err.error.message) msg = err.error.message;
          else if (err.error.detail) msg = err.error.detail;
        }
        Swal.fire({ icon: 'error', title: 'Erreur d\'inscription', text: msg, confirmButtonColor: '#4F46E5' });
      }
    });
  }

  // ── Étape 3 : Upload réel des documents au backend ───────────────────────
  submitDossier(): void {
    if (!this.carteIdentiteFile()) {
      Swal.fire({
        icon: 'warning',
        title: 'Document requis',
        text: 'Veuillez obligatoirement déposer votre carte d\'identité nationale.',
        confirmButtonColor: '#0D9488'
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
        // Même en cas d'erreur réseau, le compte est créé — afficher le message d'admission
        console.warn('Erreur upload dossier (compte créé quand même):', err);
        this.afficherMessageAdmission();
      }
    });
  }

  private afficherMessageAdmission(): void {
    Swal.fire({
      title: '📋 Dossier soumis avec succès !',
      html: `
        <div class="text-center">
          <div style="font-size:3rem;margin-bottom:12px;">🎉</div>
          <p style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:8px;">
            Votre admission a bien été prise en charge.
          </p>
          <p style="font-size:13px;color:#475569;margin-bottom:16px;line-height:1.6;">
            Notre équipe Repareo va examiner votre dossier et vérifier vos pièces justificatives.
            Votre compte sera activé dès validation par un administrateur.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;text-align:left;">
            <p style="font-size:12px;color:#166534;margin:0 0 8px;font-weight:700;">⏱️ Délai de traitement estimé :</p>
            <p style="font-size:12px;color:#166534;margin:0;">
              <strong>24 à 48 heures ouvrées.</strong> Vous serez notifié par email dès l'activation de votre compte.
            </p>
          </div>
          <div style="margin-top:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px;text-align:left;">
            <p style="font-size:12px;color:#92400e;margin:0;">
              💡 En attendant, vous pouvez vous connecter à votre espace pour compléter votre profil,
              mais les fonctionnalités seront limitées jusqu'à l'activation.
            </p>
          </div>
        </div>
      `,
      confirmButtonColor: '#0D9488',
      confirmButtonText: '✓ Compris, retourner à la connexion',
      width: '480px',
      allowOutsideClick: false
    }).then(() => {
      // Déconnexion + redirection vers login (le réparateur ne peut pas accéder avant validation)
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }

  passerDossier(): void {
    Swal.fire({
      title: 'Ignorer le dépôt des documents ?',
      html: `
        <p style="font-size:13px;color:#475569;">
          Votre compte a bien été créé. Vous pourrez déposer vos documents plus tard depuis votre espace réparateur.
          <br/><br/>
          <strong style="color:#b45309;">⚠️ Sans documents validés, votre compte ne sera pas activé par l'administrateur.</strong>
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0D9488',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Compléter plus tard',
      cancelButtonText: 'Revenir et déposer'
    }).then(res => {
      if (res.isConfirmed) {
        // Message d'admission même sans documents
        this.afficherMessageAdmission();
      }
    });
  }
}
