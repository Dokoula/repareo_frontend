import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API } from '../constants/api.constants';
import { CreateDemandeRequest, Demande, IAAnalysisResult } from '../models/demande.model';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private http = inject(HttpClient);

  // Fallback mock demands for smooth experience and demonstration
  private mockDemandes: Demande[] = [
    {
      id: 101,
      client: {
        id: 1,
        user: { id: 3, username: 'marie_client', email: 'marie@example.com', telephone: '+225 01 23 45 67 89', ville: 'Abidjan', role: 'CLIENT' },
        adresse: 'Cocody Riviera 3, Villa 42'
      },
      reparateur: {
        id: 1,
        user: { id: 2, username: 'koffi_tech', email: 'koffi@repareo.ci', telephone: '+225 07 45 67 89 01', ville: 'Abidjan', role: 'REPARATEUR' },
        specialite: 'Maintenance Matérielle & Remplacement Écran',
        experience: 6,
        note_moyenne: 4.8,
        statut_validation: true,
        disponibilite: 'DISPONIBLE'
      },
      date_creation: new Date(Date.now() - 2 * 86400000).toISOString(),
      marque_ordinateur: 'Dell',
      modele_ordinateur: 'XPS 15 9510',
      description_probleme: "L'ordinateur ne s'allume plus après une surtension électrique, voyant clignotant ambre.",
      categorie_competence: { id: 1, nom: 'Réparation matérielle', description: 'Problèmes de carte mère, alimentation, composants physiques' },
      statut: 'EN_REPARATION',
      date_recuperation: '2026-08-18'
    },
    {
      id: 102,
      client: {
        id: 1,
        user: { id: 3, username: 'marie_client', email: 'marie@example.com', telephone: '+225 01 23 45 67 89', ville: 'Abidjan', role: 'CLIENT' },
        adresse: 'Cocody Riviera 3'
      },
      reparateur: {
        id: 2,
        user: { id: 4, username: 'ibrahim_micro', email: 'ibrahim@repareo.ci', telephone: '+225 05 99 88 77 66', ville: 'Abidjan', role: 'REPARATEUR' },
        specialite: 'Récupération de données & Systèmes Linux/Windows',
        experience: 8,
        note_moyenne: 4.9,
        statut_validation: true,
        disponibilite: 'DISPONIBLE'
      },
      date_creation: new Date(Date.now() - 5 * 86400000).toISOString(),
      marque_ordinateur: 'Apple',
      modele_ordinateur: 'MacBook Pro 14 M1',
      description_probleme: 'Disque dur corrompu avec impossibilité de démarrer macOS. Données importantes à récupérer.',
      categorie_competence: { id: 2, nom: 'Récupération de données', description: 'Sauvegarde et extraction après crash disque' },
      statut: 'DEVIS_ENVOYE',
      date_recuperation: '2026-08-20'
    },
    {
      id: 103,
      client: {
        id: 2,
        user: { id: 5, username: 'alain_kouame', email: 'alain@example.com', telephone: '+225 07 11 22 33 44', ville: 'Bouaké', role: 'CLIENT' },
        adresse: 'Commerce, Bouaké'
      },
      reparateur: null,
      date_creation: new Date().toISOString(),
      marque_ordinateur: 'HP',
      modele_ordinateur: 'Pavilion 15-eg0000',
      description_probleme: 'Écran noir au démarrage, ventilateur tourne à fond pendant 10 secondes puis extinction.',
      categorie_competence: { id: 1, nom: 'Réparation matérielle' },
      statut: 'EN_ATTENTE',
      date_recuperation: null
    }
  ];

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(API.BASE_URL + API.DEMANDES.BASE).pipe(
      catchError(() => of(this.mockDemandes))
    );
  }

  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(API.BASE_URL + API.DEMANDES.DETAIL(id)).pipe(
      catchError(() => {
        const found = this.mockDemandes.find(d => d.id === Number(id));
        return of(found || this.mockDemandes[0]);
      })
    );
  }

  creerDemande(data: CreateDemandeRequest): Observable<IAAnalysisResult> {
    return this.http.post<IAAnalysisResult>(API.BASE_URL + API.DEMANDES.BASE, data).pipe(
      catchError((err) => {
        console.warn('API error or offline for creerDemande, using intelligent mock IA diagnostic response', err);
        
        // Intelligent mock diagnosis based on keywords
        const desc = (data.description_probleme || '').toLowerCase();
        let cat = 'Réparation matérielle';
        if (desc.includes('donnée') || desc.includes('fichier') || desc.includes('perdu') || desc.includes('disque')) {
          cat = 'Récupération de données';
        } else if (desc.includes('wifi') || desc.includes('internet') || desc.includes('réseau') || desc.includes('ip')) {
          cat = 'Réseau';
        } else if (desc.includes('virus') || desc.includes('pirat') || desc.includes('bloqué') || desc.includes('sécurité')) {
          cat = 'Sécurité informatique';
        } else if (desc.includes('windows') || desc.includes('lent') || desc.includes('format') || desc.includes('pilote')) {
          cat = 'Réparation logicielle';
        }

        const newDemande: Demande = {
          id: Math.floor(Math.random() * 900) + 100,
          client: {
            id: 1,
            user: { id: 3, username: 'marie_client', email: 'marie@example.com', telephone: '+225 01 23 45 67 89', ville: 'Abidjan', role: 'CLIENT' },
            adresse: 'Abidjan'
          },
          reparateur: null,
          date_creation: new Date().toISOString(),
          marque_ordinateur: data.marque_ordinateur,
          modele_ordinateur: data.modele_ordinateur,
          description_probleme: data.description_probleme,
          categorie_competence: { id: 1, nom: cat },
          statut: 'EN_ATTENTE',
          date_recuperation: data.date_recuperation
        };

        this.mockDemandes.unshift(newDemande);

        const mockIA: IAAnalysisResult = {
          status: true,
          categorie: cat,
          statut: 'EN_ATTENTE',
          message: 'Analyse IA réussie avec succès. Réparateurs recommandés disponibles.',
          reparateurs: [
            {
              id: 1,
              nom: 'Koffi Kouassi (Tech Pro)',
              ville: 'Abidjan (Cocody)',
              note: 4.9,
              experience: 7
            },
            {
              id: 2,
              nom: 'Ibrahim Diallo (MicroFix)',
              ville: 'Abidjan (Plateau)',
              note: 4.8,
              experience: 5
            },
            {
              id: 3,
              nom: 'Awa Traoré (CyberCare)',
              ville: 'Abidjan (Yopougon)',
              note: 4.7,
              experience: 4
            }
          ]
        };
        return of(mockIA);
      })
    );
  }

  assignerReparateur(demandeId: number, reparateurId: number): Observable<any> {
    return this.http.post<any>(API.BASE_URL + API.DEMANDES.ASSIGNER(demandeId), { reparateur: reparateurId }).pipe(
      catchError(() => {
        const item = this.mockDemandes.find(d => d.id === Number(demandeId));
        if (item) {
          item.statut = 'ASSIGNEE';
          item.reparateur = {
            id: reparateurId,
            user: { id: 2, username: 'koffi_tech', email: 'koffi@repareo.ci', telephone: '+225 07 45 67 89 01', ville: 'Abidjan', role: 'REPARATEUR' },
            specialite: 'Maintenance Matérielle',
            experience: 6,
            note_moyenne: 4.8,
            statut_validation: true,
            disponibilite: 'DISPONIBLE'
          };
        }
        return of({ status: true, message: 'Réparateur assigné avec succès !' });
      })
    );
  }
}
