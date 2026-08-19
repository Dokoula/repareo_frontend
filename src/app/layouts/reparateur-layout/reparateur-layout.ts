import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ReparateurService } from '../../core/services/reparateur.service';
import { Disponibilite } from '../../core/models/reparateur.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparateur-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reparateur-layout.html'
})
export class ReparateurLayout implements OnInit {
  authService = inject(AuthService);
  reparateurService = inject(ReparateurService);
  router = inject(Router);

  disponibilite = signal<Disponibilite>('DISPONIBLE');
  isMobileMenuOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);
  compteValide = signal<boolean>(true);

  navItems = [
    { label: 'Tableau de bord Atelier', route: '/reparateur/dashboard', icon: 'bi-speedometer2' },
    { label: 'Demandes Reçues', route: '/reparateur/demandes', icon: 'bi-inbox-fill' },
    { label: 'Diagnostics & Devis', route: '/reparateur/atelier', icon: 'bi-wrench-adjustable-circle-fill' },
    { label: 'Suivi des Réparations', route: '/reparateur/reparations', icon: 'bi-gear-wide-connected' },
    { label: 'Messagerie Clients', route: '/reparateur/messages', icon: 'bi-chat-left-text-fill' },
    { label: 'Messages Administration', route: '/reparateur/administration', icon: 'bi-shield-lock-fill' },
    { label: 'Solde & Retraits', route: '/reparateur/portefeuille', icon: 'bi-wallet2' },
    { label: 'Mon Profil & Compétences', route: '/reparateur/profil', icon: 'bi-patch-check-fill' },
  ];

  ngOnInit(): void {
    this.reparateurService.getMonProfil().subscribe((profil) => {
      this.disponibilite.set(profil.disponibilite);
      this.compteValide.set(profil.statut_validation);
      if (!profil.statut_validation) {
        this.navItems = [
          { label: 'Compléter mon dossier', route: '/reparateur/profil', icon: 'bi-file-earmark-arrow-up' },
          { label: 'Messages Administration', route: '/reparateur/administration', icon: 'bi-shield-lock-fill' },
        ];
        const routesAutorisees = ['/reparateur/profil', '/reparateur/administration', '/reparateur/validation'];
        if (!routesAutorisees.some(route => this.router.url.startsWith(route))) {
          this.router.navigate(['/reparateur/validation']);
        }
      }
    });
  }

  setDisponibilite(status: Disponibilite): void {
    this.disponibilite.set(status);
    this.reparateurService.modifierDisponibilite(status).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Statut mis à jour',
          text: `Vous êtes désormais : ${status === 'DISPONIBLE' ? 'Disponible pour de nouvelles demandes' : (status === 'OCCUPE' ? 'Occupé en atelier' : 'Indisponible')}`,
          timer: 1500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false
        });
      }
    });
  }

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
      title: 'Déconnexion Atelier',
      text: 'Voulez-vous fermer votre session réparateur ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0D9488',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler'
    }).then((res) => {
      if (res.isConfirmed) {
        this.authService.logout();
      }
    });
  }
}
