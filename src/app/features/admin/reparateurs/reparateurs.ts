import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../core/services/admin.service';
import { Reparateur } from '../../../core/models/reparateur.model';
import { API } from '../../../core/constants/api.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-reparateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparateurs.html'
})
export class AdminReparateurs implements OnInit {
  adminService      = inject(AdminService);
  private http      = inject(HttpClient);

  reparateurs     = signal<Reparateur[]>([]);
  filtreStatut    = signal<'TOUS' | 'EN_ATTENTE' | 'VALIDES'>('TOUS');
  reparateurSelectionne = signal<Reparateur | null>(null);

  reparateursFiltres = computed(() => {
    const all  = this.reparateurs();
    const filtre = this.filtreStatut();
    if (filtre === 'EN_ATTENTE') return all.filter(r => !r.statut_validation);
    if (filtre === 'VALIDES')    return all.filter(r => r.statut_validation);
    return all;
  });

  enAttente = computed(() => this.reparateurs().filter(r => !r.statut_validation).length);

  ngOnInit(): void {
    this.chargerReparateurs();
  }

  chargerReparateurs(): void {
    this.adminService.getReparateurs().subscribe(list => {
      this.reparateurs.set(list);
    });
  }

  setFiltre(f: 'TOUS' | 'EN_ATTENTE' | 'VALIDES'): void {
    this.filtreStatut.set(f);
  }

  ouvrirDossier(rep: Reparateur): void {
    this.reparateurSelectionne.set(rep);
  }

  fermerDossier(): void {
    this.reparateurSelectionne.set(null);
  }

  toggleValidation(rep: Reparateur): void {
    const nextStatus = !rep.statut_validation;
    const action = nextStatus ? 'Valider et Agréer' : 'Suspendre';

    Swal.fire({
      title: `${action} ce réparateur ?`,
      html: `
        <p style="font-size:14px;color:#475569;">
          <strong>${rep.user?.username ?? 'Réparateur'}</strong><br/>
          ${rep.specialite || 'Spécialité non renseignée'}<br/>
          ${rep.user?.ville || ''}
        </p>
      `,
      icon: nextStatus ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: nextStatus ? '#7C3AED' : '#EF4444',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: `Oui, ${action.toLowerCase()}`,
      cancelButtonText: 'Annuler'
    }).then((res) => {
      if (res.isConfirmed) {
        this.adminService.toggleValidationReparateur(rep.id, nextStatus).subscribe({
          next: () => {
            rep.statut_validation = nextStatus;
            this.reparateurs.set([...this.reparateurs()]);
            this.fermerDossier();
            Swal.fire({
              icon: 'success',
              title: 'Statut mis à jour !',
              text: `Le réparateur ${rep.user?.username} est maintenant ${nextStatus ? '✅ Validé et actif' : '🚫 Suspendu'}.`,
              confirmButtonColor: '#7C3AED',
              toast: true,
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de modifier le statut. Vérifiez la connexion au serveur.',
              confirmButtonColor: '#7C3AED'
            });
          }
        });
      }
    });
  }

  getDocumentUrl(path: string | null): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const origin = API.BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  }

  ouvrirDocument(path: string | null): void {
    if (!path || typeof window === 'undefined') return;
    const previewWindow = window.open('', '_blank');
    this.http.get(this.getDocumentUrl(path), { responseType: 'blob' }).subscribe({
      next: (documentBlob) => {
        const objectUrl = URL.createObjectURL(documentBlob);
        if (previewWindow) {
          previewWindow.location.href = objectUrl;
        } else {
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = 'document';
          link.click();
        }
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      },
      error: () => {
        previewWindow?.close();
        Swal.fire({
          icon: 'error',
          title: 'Document indisponible',
          text: 'Le document n’a pas pu être chargé ou vous n’êtes pas autorisé à le consulter.',
          confirmButtonColor: '#2563EB'
        });
      }
    });
  }
}
