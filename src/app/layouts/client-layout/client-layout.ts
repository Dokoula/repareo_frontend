import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';
import Swal from 'sweetalert2';
import { Notification } from '../../core/models/notification.model';
import { interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-layout.html'
})
export class ClientLayout implements OnInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  isMobileMenuOpen = signal<boolean>(false);
  isNotificationMenuOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);
  notifications = signal<Notification[]>([]);
  private destroy$ = new Subject<void>();

  navItems = [
    { label: 'Tableau de bord', route: '/client/dashboard', icon: 'bi-grid-1x2-fill' },
    { label: 'Nouvelle demande', route: '/client/nouvelle-demande', icon: 'bi-plus-circle-fill', highlight: true },
    { label: 'Mes Demandes', route: '/client/demandes', icon: 'bi-laptop' },
    { label: 'Diagnostics & Devis', route: '/client/devis', icon: 'bi-file-earmark-check-fill' },
    { label: 'Paiements & Factures', route: '/client/paiements', icon: 'bi-credit-card-2-front-fill' },
    { label: 'Messagerie', route: '/client/messages', icon: 'bi-chat-dots-fill' },
    { label: 'Avis & Témoignages', route: '/client/avis', icon: 'bi-star-fill' },
    { label: 'Mon Profil', route: '/client/profil', icon: 'bi-person-circle' },
  ];

  ngOnInit(): void {
    interval(15000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getNotifications()),
      takeUntil(this.destroy$)
    ).subscribe((notifications) => this.notifications.set(notifications));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  lireNotification(notification: Notification): void {
    if (notification.lu) return;
    this.notificationService.marquerCommeLue(notification.id).subscribe(() => {
      notification.lu = true;
      this.notifications.set([...this.notifications()]);
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleNotifications(): void {
    this.isNotificationMenuOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
    this.isNotificationMenuOpen.set(false);
  }

  logout(): void {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }
}
