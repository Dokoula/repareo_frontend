import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { MiseEnRelationResult, ReparateurSuggestion } from '../../../core/models/demande.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth';

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
  private authService = inject(AuthService);

  isSubmitting = signal<boolean>(false);
  matchingResult = signal<MiseEnRelationResult | null>(null);
  createdDemandeId = signal<number | null>(null);
  selectedReparateur = signal<ReparateurSuggestion | null>(null);

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

    this.isSubmitting.set(true);
    this.matchingResult.set(null);

    const nom = this.authService.currentUser()?.username || 'client';
    Swal.fire({
      title: `Bonjour ${nom}`,
      text: "L’agent IA analyse votre panne et recherche les réparateurs disponibles dans votre zone.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    const val = this.demandeForm.value;
    const payload = {
      marque_ordinateur: val.marque_ordinateur!,
      modele_ordinateur: val.modele_ordinateur!,
      description_probleme: val.description_probleme!,
      date_recuperation: val.date_recuperation || null
    };

    this.demandeService.creerDemande(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.matchingResult.set(res);
        this.createdDemandeId.set(res.demande_id);
        Swal.close();
        const nombre = res.reparateurs.length;
        const moteur = res.analyse_par === 'OLLAMA'
          ? 'Analyse réalisée par l’agent IA Ollama.'
          : 'Ollama est indisponible : une analyse locale simplifiée a été utilisée.';
        Swal.fire({
          icon: nombre ? 'success' : 'info',
          title: nombre ? `${nombre} réparateur${nombre > 1 ? 's' : ''} trouvé${nombre > 1 ? 's' : ''}` : 'Aucun réparateur disponible',
          text: `${moteur} Catégorie : ${res.categorie || 'Non précisée'}. ${nombre ? 'Veuillez faire votre choix.' : 'Vous pourrez relancer la recherche plus tard.'}`,
          confirmButtonColor: '#4F46E5'
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Votre demande n’a pas pu être enregistrée.',
          confirmButtonColor: '#4F46E5'
        });
      }
    });
  }

  assigner(reparateur: ReparateurSuggestion): void {
    this.selectedReparateur.set(reparateur);
    const demandeId = this.createdDemandeId();
    if (!demandeId) {
      Swal.fire({ icon: 'error', title: 'Demande introuvable', text: 'Veuillez soumettre la demande à nouveau.' });
      return;
    }

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
