import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboardStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.html'
})
export class AdminStatistiques implements OnInit {
  adminService = inject(AdminService);
  stats = signal<AdminDashboardStats | null>(null);

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe(d => this.stats.set(d));
  }
}
