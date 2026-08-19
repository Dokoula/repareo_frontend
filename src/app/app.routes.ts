import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ClientLayout } from './layouts/client-layout/client-layout';
import { ReparateurLayout } from './layouts/reparateur-layout/reparateur-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

import { ClientDashboard } from './features/client/dashboard/dashboard';
import { NouvelleDemande } from './features/client/nouvelle-demande/nouvelle-demande';
import { ClientDemandes } from './features/client/demandes/demandes';
import { ClientDevis } from './features/client/devis/devis';
import { ClientPaiements } from './features/client/paiements/paiements';
import { ClientMessagerie } from './features/client/messagerie/messagerie';
import { ClientAvis } from './features/client/avis/avis';
import { ClientProfil } from './features/client/profil/profil';

import { ReparateurDashboard } from './features/reparateur/dashboard/dashboard';
import { ReparateurDemandes } from './features/reparateur/demandes/demandes';
import { ReparateurAtelier } from './features/reparateur/atelier/atelier';
import { ReparateurReparations } from './features/reparateur/reparations/reparations';
import { ReparateurMessagerie } from './features/reparateur/messagerie/messagerie';
import { ReparateurProfil } from './features/reparateur/profil/profil';
import { ReparateurValidation } from './features/reparateur/validation/validation';

import { AdminDashboard } from './features/admin/dashboard/dashboard';
import { AdminReparateurs } from './features/admin/reparateurs/reparateurs';
import { AdminUtilisateurs } from './features/admin/utilisateurs/utilisateurs';
import { AdminDemandes } from './features/admin/demandes/demandes';
import { AdminStatistiques } from './features/admin/statistiques/statistiques';
import { Portefeuille } from './features/shared/portefeuille/portefeuille';
import { MessagerieAdministration } from './features/shared/messagerie-administration/messagerie-administration';
import { AdminAvis } from './features/admin/avis/avis';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      }
    ]
  },

  {
    path: 'client',
    component: ClientLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: ClientDashboard
      },
      {
        path: 'nouvelle-demande',
        component: NouvelleDemande
      },
      {
        path: 'demandes',
        component: ClientDemandes
      },
      {
        path: 'devis',
        component: ClientDevis
      },
      {
        path: 'paiements',
        component: ClientPaiements
      },
      {
        path: 'messages',
        component: ClientMessagerie
      },
      {
        path: 'avis',
        component: ClientAvis
      },
      {
        path: 'profil',
        component: ClientProfil
      }
    ]
  },

  {
    path: 'reparateur',
    component: ReparateurLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['REPARATEUR'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: ReparateurDashboard
      },
      {
        path: 'demandes',
        component: ReparateurDemandes
      },
      {
        path: 'atelier',
        component: ReparateurAtelier
      },
      {
        path: 'reparations',
        component: ReparateurReparations
      },
      {
        path: 'messages',
        component: ReparateurMessagerie
      },
      {
        path: 'profil',
        component: ReparateurProfil
      },
      {
        path: 'portefeuille',
        component: Portefeuille
      },
      {
        path: 'administration',
        component: MessagerieAdministration
      },
      {
        path: 'validation',
        component: ReparateurValidation
      }
    ]
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRATEUR', 'ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboard
      },
      {
        path: 'reparateurs',
        component: AdminReparateurs
      },
      {
        path: 'utilisateurs',
        component: AdminUtilisateurs
      },
      {
        path: 'demandes',
        component: AdminDemandes
      },
      {
        path: 'statistiques',
        component: AdminStatistiques
      },
      {
        path: 'finances',
        component: Portefeuille
      },
      {
        path: 'messages-reparateurs',
        component: MessagerieAdministration
      },
      {
        path: 'avis',
        component: AdminAvis
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
