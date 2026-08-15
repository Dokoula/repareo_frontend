import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RoleUtilisateur } from '../../../core/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedRole = signal<RoleUtilisateur>('CLIENT');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false]
  });

  rolesList = [
    {
      id: 'CLIENT' as RoleUtilisateur,
      label: 'Espace Client',
      sublabel: 'Particulier & Entreprise',
      icon: 'bi-person-badge',
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'REPARATEUR' as RoleUtilisateur,
      label: 'Espace Réparateur',
      sublabel: 'Technicien Certifié',
      icon: 'bi-tools',
      color: 'from-cyan-600 to-teal-600',
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'ADMINISTRATEUR' as RoleUtilisateur,
      label: 'Espace Admin',
      sublabel: 'Gestion Plateforme',
      icon: 'bi-shield-lock',
      color: 'from-purple-600 to-indigo-700',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ];

  selectRole(role: RoleUtilisateur): void {
    this.selectedRole.set(role);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { username, password } = this.loginForm.value;

    this.authService.login(
      { username: username!, password: password! },
      this.selectedRole()
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          text: `Ravi de vous revoir sur Repareo !`,
          timer: 1400,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        this.authService.redirectByRole(res.user?.role || this.selectedRole());
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.detail || err?.error?.message || err?.error?.non_field_errors?.[0]
          || 'Nom d\'utilisateur ou mot de passe incorrect.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur d\'authentification',
          text: msg,
          confirmButtonColor: '#4F46E5'
        });
      }
    });
  }

  getRoleLabel(role: RoleUtilisateur): string {
    switch (role) {
      case 'ADMINISTRATEUR':
      case 'ADMIN':
        return 'Espace Administrateur';
      case 'REPARATEUR':
        return 'Espace Réparateur';
      default:
        return 'Espace Client';
    }
  }
}
