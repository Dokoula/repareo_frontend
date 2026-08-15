import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html'
})
export class AdminUtilisateurs implements OnInit {
  adminService = inject(AdminService);

  users = signal<User[]>([]);
  searchQuery = signal<string>('');
  selectedRole = signal<string>('ALL');

  ngOnInit(): void {
    this.adminService.getUsers().subscribe(list => this.users.set(list));
  }

  filteredUsers(): User[] {
    const q = this.searchQuery().toLowerCase();
    const role = this.selectedRole();

    return this.users().filter(u => {
      const matchQuery = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.ville.toLowerCase().includes(q);
      const matchRole = role === 'ALL' || u.role === role || (role === 'ADMINISTRATEUR' && u.role === 'ADMIN');
      return matchQuery && matchRole;
    });
  }
}
