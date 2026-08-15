import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DiagnosticService } from '../../../core/services/diagnostic.service';
import { DevisService } from '../../../core/services/devis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparateur-atelier',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './atelier.html'
})
export class ReparateurAtelier implements OnInit {
  private fb = inject(FormBuilder);
  private diagnosticService = inject(DiagnosticService);
  private devisService = inject(DevisService);

  activeTab = signal<'DIAGNOSTIC' | 'DEVIS'>('DIAGNOSTIC');
  isSubmitting = signal<boolean>(false);

  diagnosticForm = this.fb.group({
    demandeId: [101, [Validators.required]],
    panne_reelle: ['Court-circuit sur l’étage d’alimentation primaire (condensateur CMS HS). Carte mère intacte.', [Validators.required]],
    reparable: [true, [Validators.required]],
    commentaire: ['Remplacement des composants passifs et test de charge sous oscilloscope recommandé.']
  });

  devisForm = this.fb.group({
    diagnosticId: [201, [Validators.required]],
    montant_diagnostic: [10000, [Validators.required, Validators.min(0)]],
    montant_reparation: [35000, [Validators.required, Validators.min(0)]],
    delai_estime: [2, [Validators.required, Validators.min(1)]],
    pourcentage_reussite: [95, [Validators.required, Validators.min(1), Validators.max(100)]]
  });

  ngOnInit(): void {}

  setTab(tab: 'DIAGNOSTIC' | 'DEVIS'): void {
    this.activeTab.set(tab);
  }

  getMontantTotal(): number {
    const diag = Number(this.devisForm.value.montant_diagnostic) || 0;
    const rep = Number(this.devisForm.value.montant_reparation) || 0;
    return diag + rep;
  }

  soumettreDiagnostic(): void {
    if (this.diagnosticForm.invalid) {
      this.diagnosticForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const form = this.diagnosticForm.value;

    this.diagnosticService.creerDiagnostic(Number(form.demandeId), {
      panne_reelle: form.panne_reelle!,
      reparable: !!form.reparable,
      commentaire: form.commentaire || ''
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Diagnostic enregistré !',
          text: 'Le diagnostic est posé. Vous pouvez maintenant générer le devis chiffré.',
          confirmButtonColor: '#0D9488'
        }).then(() => {
          this.activeTab.set('DEVIS');
        });
      }
    });
  }

  soumettreDevis(): void {
    if (this.devisForm.invalid) {
      this.devisForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const form = this.devisForm.value;
    const total = this.getMontantTotal();

    this.devisService.creerDevis(Number(form.diagnosticId), {
      montant_diagnostic: Number(form.montant_diagnostic),
      montant_reparation: Number(form.montant_reparation),
      montant_total: total,
      delai_estime: Number(form.delai_estime),
      pourcentage_reussite: Number(form.pourcentage_reussite)
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Devis transmis au client !',
          text: `Le devis de ${total.toLocaleString()} FCFA a été notifié au client pour validation.`,
          confirmButtonColor: '#0D9488'
        });
      }
    });
  }
}
