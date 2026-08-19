import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html'
})
export class AdminLayout {
  authService = inject(AuthService);
  router = inject(Router);

  isMobileMenuOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);

  navItems = [
    { label: 'Vue d’ensemble', route: '/admin/dashboard', icon: 'bi-grid-fill' },
    { label: 'Validation Réparateurs', route: '/admin/reparateurs', icon: 'bi-shield-check' },
    { label: 'Gestion Utilisateurs', route: '/admin/utilisateurs', icon: 'bi-people-fill' },
    { label: 'Supervision Demandes', route: '/admin/demandes', icon: 'bi-pc-display-horizontal' },
    { label: 'Statistiques & Rapports', route: '/admin/statistiques', icon: 'bi-bar-chart-fill' },
    { label: 'Finances & Commissions', route: '/admin/finances', icon: 'bi-cash-stack' },
    { label: 'Messagerie Réparateurs', route: '/admin/messages-reparateurs', icon: 'bi-chat-dots-fill' },
    { label: 'Avis Clients', route: '/admin/avis', icon: 'bi-star-fill' },
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  logout(): void {
    Swal.fire({
      title: 'Déconnexion Administration',
      text: 'Voulez-vous quitter le panneau d’administration ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7C3AED',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Quitter',
      cancelButtonText: 'Rester'
    }).then((res) => {
      if (res.isConfirmed) {
        this.authService.logout();
      }
    });
  }
}
