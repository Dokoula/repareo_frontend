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

  categoryDistribution: Array<{ label: string; count: number; percentage: number; color: string }> = [];

  recentLogs: Array<{ text: string; time: string; type: string }> = [];

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe(data => this.stats.set(data));
  }
}
