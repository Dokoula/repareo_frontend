import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminDashboardStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class AdminDashboard implements OnInit {
  adminService = inject(AdminService);

  stats = signal<AdminDashboardStats | null>(null);

  categoryDistribution = [
    { label: 'Réparation matérielle', count: 142, percentage: 44, color: 'bg-indigo-500' },
    { label: 'Récupération de données', count: 78, percentage: 24, color: 'bg-cyan-500' },
    { label: 'Installation système & Logiciel', count: 52, percentage: 16, color: 'bg-teal-500' },
    { label: 'Réseau & Sécurité', count: 32, percentage: 10, color: 'bg-purple-500' },
    { label: 'Maintenance & Nettoyage', count: 16, percentage: 6, color: 'bg-amber-500' }
  ];

  recentLogs = [
    { text: 'Nouveau compte réparateur "Awa CyberCare" en attente de validation.', time: 'Il y a 10 min', type: 'warning' },
    { text: 'Paiement de 45 000 FCFA validé pour l’intervention #401 (Wave).', time: 'Il y a 45 min', type: 'success' },
    { text: 'Diagnostic IA effectué pour la demande #103 (Dell XPS).', time: 'Il y a 2 heures', type: 'info' },
    { text: 'Devis #302 accepté par le client Marie Aka.', time: 'Il y a 4 heures', type: 'success' }
  ];

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe(data => this.stats.set(data));
  }
}
