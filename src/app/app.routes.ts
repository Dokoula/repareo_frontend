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
import { ReparateurAvis } from './features/reparateur/avis/avis';
import { ReparateurProfil } from './features/reparateur/profil/profil';

import { AdminDashboard } from './features/admin/dashboard/dashboard';
import { AdminReparateurs } from './features/admin/reparateurs/reparateurs';
import { AdminUtilisateurs } from './features/admin/utilisateurs/utilisateurs';
import { AdminDemandes } from './features/admin/demandes/demandes';
import { AdminStatistiques } from './features/admin/statistiques/statistiques';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Auth Routes
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

  // Client Dedicated Interface
  {
    path: 'client',
    component: ClientLayout,
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

  // Réparateur Dedicated Interface
  {
    path: 'reparateur',
    component: ReparateurLayout,
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
        path: 'avis',
        component: ReparateurAvis
      },
      {
        path: 'profil',
        component: ReparateurProfil
      }
    ]
  },

  // Admin Dedicated Interface
  {
    path: 'admin',
    component: AdminLayout,
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
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: 'login'
  }
];