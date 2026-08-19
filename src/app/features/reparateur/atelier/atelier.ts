import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Demande } from '../../../core/models/demande.model';
import { Diagnostic } from '../../../core/models/diagnostic.model';
import { DemandeService } from '../../../core/services/demande.service';
import { DevisService } from '../../../core/services/devis.service';
import { DiagnosticService } from '../../../core/services/diagnostic.service';

@Component({
  selector: 'app-reparateur-atelier',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './atelier.html'
})
export class ReparateurAtelier implements OnInit {
  private fb = inject(FormBuilder);
  private demandeService = inject(DemandeService);
  private diagnosticService = inject(DiagnosticService);
  private devisService = inject(DevisService);

  activeTab = signal<'DIAGNOSTIC' | 'DEVIS'>('DIAGNOSTIC');
  isSubmitting = signal(false);
  isLoading = signal(true);
  demandesADiagnostiquer = signal<Demande[]>([]);
  diagnosticsAChiffrer = signal<Diagnostic[]>([]);
  demandes = signal<Demande[]>([]);

  diagnosticForm = this.fb.group({
    demandeId: this.fb.control<number | null>(null, Validators.required),
    panne_reelle: ['', [Validators.required, Validators.minLength(5)]],
    reparable: [true],
    commentaire: ['']
  });

  devisForm = this.fb.group({
    diagnosticId: this.fb.control<number | null>(null, Validators.required),
    montant_diagnostic: [5000, [Validators.required, Validators.min(5000), Validators.max(5000)]],
    montant_reparation: [0, [Validators.required, Validators.min(0)]],
    delai_estime: [1, [Validators.required, Validators.min(1)]],
    pourcentage_reussite: [90, [Validators.required, Validators.min(1), Validators.max(100)]]
  });

  ngOnInit(): void {
    this.chargerDonnees();
  }

  setTab(tab: 'DIAGNOSTIC' | 'DEVIS'): void {
    this.activeTab.set(tab);
  }

  getMontantTotal(): number {
    return 5000 + (Number(this.devisForm.value.montant_reparation) || 0);
  }

  libelleDiagnostic(diagnostic: Diagnostic): string {
    const demandeId = this.extraireId(diagnostic.demande);
    const demande = this.demandes().find(item => item.id === demandeId);
    if (!demande) return `Diagnostic #${diagnostic.id} — demande #${demandeId}`;
    return `Demande #${demande.id} — ${demande.marque_ordinateur} ${demande.modele_ordinateur} (${demande.client.user.username})`;
  }

  soumettreDiagnostic(): void {
    if (this.diagnosticForm.invalid || this.isSubmitting()) {
      this.diagnosticForm.markAllAsTouched();
      return;
    }

    const form = this.diagnosticForm.getRawValue();
    this.isSubmitting.set(true);
    this.diagnosticService.creerDiagnostic(form.demandeId!, {
      panne_reelle: form.panne_reelle!,
      reparable: !!form.reparable,
      commentaire: form.commentaire || ''
    }).subscribe({
      next: response => {
        this.isSubmitting.set(false);
        this.diagnosticForm.reset({ demandeId: null, panne_reelle: '', reparable: true, commentaire: '' });
        this.chargerDonnees(form.reparable ? response.diagnostic : undefined, form.reparable ? 'DEVIS' : 'DIAGNOSTIC');
        Swal.fire({
          icon: 'success',
          title: 'Diagnostic enregistré',
          text: form.reparable
            ? 'Le diagnostic a été enregistré. Vous pouvez maintenant préparer le devis.'
            : 'Le client a été informé que son appareil est irréparable.',
          confirmButtonColor: '#2563EB'
        });
      },
      error: error => {
        this.isSubmitting.set(false);
        Swal.fire({ icon: 'error', title: 'Diagnostic non enregistré', text: error.error?.message || 'Vérifiez les informations puis réessayez.', confirmButtonColor: '#2563EB' });
      }
    });
  }

  soumettreDevis(): void {
    if (this.devisForm.invalid || this.isSubmitting()) {
      this.devisForm.markAllAsTouched();
      return;
    }

    const form = this.devisForm.getRawValue();
    const total = this.getMontantTotal();
    this.isSubmitting.set(true);
    this.devisService.creerDevis(form.diagnosticId!, {
      montant_diagnostic: 5000,
      montant_reparation: Number(form.montant_reparation),
      montant_total: total,
      delai_estime: Number(form.delai_estime),
      pourcentage_reussite: Number(form.pourcentage_reussite)
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.devisForm.reset({ diagnosticId: null, montant_diagnostic: 5000, montant_reparation: 0, delai_estime: 1, pourcentage_reussite: 90 });
        this.chargerDonnees();
        Swal.fire({ icon: 'success', title: 'Devis transmis au client', text: `Le devis de ${total.toLocaleString('fr-FR')} FCFA a été enregistré et le client a reçu une notification.`, confirmButtonColor: '#2563EB' });
      },
      error: error => {
        this.isSubmitting.set(false);
        Swal.fire({ icon: 'error', title: 'Devis non transmis', text: error.error?.message || 'Vérifiez les montants puis réessayez.', confirmButtonColor: '#2563EB' });
      }
    });
  }

  private chargerDonnees(diagnosticASelectionner?: number, onglet?: 'DIAGNOSTIC' | 'DEVIS'): void {
    this.isLoading.set(true);
    forkJoin({
      demandes: this.demandeService.getDemandes(),
      diagnostics: this.diagnosticService.getDiagnostics(),
      devis: this.devisService.getDevisList()
    }).subscribe({
      next: ({ demandes, diagnostics, devis }) => {
        this.demandes.set(demandes);
        const demandesDiagnostiquees = new Set(diagnostics.map(item => this.extraireId(item.demande)));
        const diagnosticsAvecDevis = new Set(devis.map(item => this.extraireId(item.diagnostic)));
        const demandesDisponibles = demandes.filter(item => item.statut === 'DIAGNOSTIC' && !demandesDiagnostiquees.has(item.id));
        const diagnosticsDisponibles = diagnostics.filter(item => item.reparable && !diagnosticsAvecDevis.has(item.id));

        this.demandesADiagnostiquer.set(demandesDisponibles);
        this.diagnosticsAChiffrer.set(diagnosticsDisponibles);
        this.diagnosticForm.patchValue({ demandeId: demandesDisponibles[0]?.id ?? null });
        const diagnosticSelectionne = diagnosticsDisponibles.find(item => item.id === diagnosticASelectionner)?.id ?? diagnosticsDisponibles[0]?.id ?? null;
        this.devisForm.patchValue({ diagnosticId: diagnosticSelectionne, montant_diagnostic: 5000 });
        if (onglet) this.activeTab.set(onglet);
        this.isLoading.set(false);
      },
      error: error => {
        this.isLoading.set(false);
        Swal.fire({ icon: 'error', title: 'Atelier indisponible', text: error.error?.message || 'Impossible de charger les dossiers. Vérifiez que le serveur est démarré.', confirmButtonColor: '#2563EB' });
      }
    });
  }

  private extraireId(value: number | Demande | Diagnostic): number {
    return typeof value === 'number' ? value : value.id;
  }
}
