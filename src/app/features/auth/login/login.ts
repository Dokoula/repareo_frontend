import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false]
  });

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
      this.loginForm.value.rememberMe ?? false
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
        this.authService.redirectByRole(res.user.role);
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

}
