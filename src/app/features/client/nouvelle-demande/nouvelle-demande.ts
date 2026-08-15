import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { IAAnalysisResult, IAReparateurSuggestion } from '../../../core/models/demande.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nouvelle-demande',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './nouvelle-demande.html'
})
export class NouvelleDemande {
  private fb = inject(FormBuilder);
  private demandeService = inject(DemandeService);
  private router = inject(Router);

  isAnalyzing = signal<boolean>(false);
  analysisResult = signal<IAAnalysisResult | null>(null);
  createdDemandeId = signal<number | null>(null);
  selectedReparateur = signal<IAReparateurSuggestion | null>(null);

  marquesList = [
    'Apple (MacBook, iMac)',
    'Dell (XPS, Latitude, Inspiron)',
    'HP (Pavilion, Spectre, EliteBook)',
    'Lenovo (ThinkPad, IdeaPad)',
    'Asus (ZenBook, ROG, VivoBook)',
    'Acer (Aspire, Swift, Predator)',
    'MSI',
    'Microsoft Surface',
    'Autre marque'
  ];

  problemesFrequents = [
    { label: 'Ne s’allume plus / Surtension', desc: 'L’ordinateur ne démarre pas, aucun voyant ou ventilateur qui tourne quelques secondes.' },
    { label: 'Écran noir ou fissuré', desc: 'L’affichage ne fonctionne plus, lignes de pixels ou dalle LCD brisée.' },
    { label: 'Disque dur / Données perdues', desc: 'Système inaccessible, bruits anormaux ou besoin de récupérer des fichiers critiques.' },
    { label: 'Lenteurs extrêmes & Virus', desc: 'Windows bloque au démarrage, publicités intempestives, ventilateur bruyant.' },
    { label: 'Problème Wi-Fi & Réseau', desc: 'Connexion internet impossible, carte réseau non détectée.' }
  ];

  demandeForm = this.fb.group({
    marque_ordinateur: ['Dell (XPS, Latitude, Inspiron)', [Validators.required]],
    modele_ordinateur: ['', [Validators.required]],
    description_probleme: ['', [Validators.required, Validators.minLength(15)]],
    date_recuperation: ['']
  });

  applyQuickIssue(issue: { label: string; desc: string }): void {
    this.demandeForm.patchValue({
      description_probleme: `${issue.label} : ${issue.desc}`
    });
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      return;
    }

    this.isAnalyzing.set(true);
    this.analysisResult.set(null);

    const val = this.demandeForm.value;
    const payload = {
      marque_ordinateur: val.marque_ordinateur!,
      modele_ordinateur: val.modele_ordinateur!,
      description_probleme: val.description_probleme!,
      date_recuperation: val.date_recuperation || null
    };

    this.demandeService.creerDemande(payload).subscribe({
      next: (res) => {
        this.isAnalyzing.set(false);
        this.analysisResult.set(res);
        this.createdDemandeId.set(103);
        Swal.fire({
          icon: 'success',
          title: 'Diagnostic IA effectué !',
          text: `Panne identifiée : ${res.categorie || 'Analyse terminée'}. Choisissez un réparateur pour confirmer.`,
          confirmButtonColor: '#4F46E5'
        });
      },
      error: () => {
        this.isAnalyzing.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l’analyse.',
          confirmButtonColor: '#4F46E5'
        });
      }
    });
  }

  assigner(reparateur: IAReparateurSuggestion): void {
    this.selectedReparateur.set(reparateur);
    const demandeId = this.createdDemandeId() || 103;

    Swal.fire({
      title: 'Confirmer l’assignation ?',
      text: `Souhaitez-vous confier votre demande à ${reparateur.nom} (${reparateur.ville}) ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, assigner ce réparateur',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.demandeService.assignerReparateur(demandeId, reparateur.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Réparateur assigné !',
              text: 'Le technicien a été notifié et va établir votre diagnostic.',
              confirmButtonColor: '#4F46E5'
            }).then(() => {
              this.router.navigate(['/client/demandes']);
            });
          }
        });
      }
    });
  }
}
