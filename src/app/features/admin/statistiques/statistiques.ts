import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboardStats } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.html'
})
export class AdminStatistiques implements OnInit {
  adminService = inject(AdminService);
  stats = signal<AdminDashboardStats | null>(null);

  monthlyData = [
    { month: 'Janvier', repairs: 28, revenue: '1 250 000 FCFA', height: '40%' },
    { month: 'Février', repairs: 34, revenue: '1 520 000 FCFA', height: '50%' },
    { month: 'Mars', repairs: 42, revenue: '1 980 000 FCFA', height: '65%' },
    { month: 'Avril', repairs: 48, revenue: '2 150 000 FCFA', height: '75%' },
    { month: 'Mai', repairs: 56, revenue: '2 600 000 FCFA', height: '85%' },
    { month: 'Juin', repairs: 62, revenue: '2 950 000 FCFA', height: '100%' }
  ];

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe(d => this.stats.set(d));
  }

  exporterRapport(): void {
    Swal.fire({
      icon: 'success',
      title: 'Rapport généré !',
      text: 'Le rapport d\'activité Repareo a été exporté avec succès.',
      confirmButtonColor: '#7C3AED'
    });
  }
}
