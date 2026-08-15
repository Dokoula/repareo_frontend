export const API = {
  BASE_URL: 'http://127.0.0.1:8000/api',

  AUTH: {
    LOGIN: '/users/login/',
    REGISTER: '/users/register/',
    PROFILE: '/users/profile/',
  },

  // Admin — gestion platformé (tous les utilisateurs, stats)
  ADMIN: {
    USERS: '/users/',
    STATS: '/users/stats/',
  },

  CLIENTS: {
    BASE: '/clients/',
    PROFIL: '/clients/profil/',
  },

  REPARATEURS: {
    BASE: '/reparateurs/',
    PROFIL: '/reparateurs/profil/',
    DISPONIBILITE: '/reparateurs/disponibilite/',
    ACCEPTER_DEMANDE: (id: number) => `/reparateurs/demandes/${id}/accepter/`,
    REFUSER_DEMANDE: (id: number) => `/reparateurs/demandes/${id}/refuser/`,
    // Dossier de candidature (documents inscription)
    SOUMETTRE_DOSSIER: '/reparateurs/dossier/soumettre/',
    MON_DOSSIER: '/reparateurs/dossier/mon-dossier/',
    // Admin
    ADMIN_DOSSIERS: '/reparateurs/admin/dossiers/',
    ADMIN_VALIDER: (id: number) => `/reparateurs/${id}/valider/`,
  },

  DEMANDES: {
    BASE: '/demandes/',
    DETAIL: (id: number) => `/demandes/${id}/`,
    ASSIGNER: (id: number) => `/demandes/${id}/assigner/`,
  },

  DIAGNOSTICS: {
    BASE: '/diagnostics/',
    DETAIL: (id: number) => `/diagnostics/${id}/`,
    CREER: (demandeId: number) => `/diagnostics/demandes/${demandeId}/`,
  },

  DEVIS: {
    BASE: '/devis/',
    DETAIL: (id: number) => `/devis/${id}/`,
    CREER: (diagnosticId: number) => `/devis/diagnostics/${diagnosticId}/`,
    ACCEPTER: (devisId: number) => `/devis/${devisId}/accepter/`,
    REFUSER: (devisId: number) => `/devis/${devisId}/refuser/`,
  },

  REPARATIONS: {
    DETAIL: (id: number) => `/reparation/${id}/`,
    DEMARRER: (devisId: number) => `/reparation/devis/${devisId}/demarrer/`,
    TERMINER: (reparationId: number) => `/reparation/${reparationId}/terminer/`,
  },

  PAIEMENTS: {
    BASE: '/paiement/',
    DETAIL: (id: number) => `/paiement/${id}/`,
    MODES: '/paiement/modes/',
    PAYER: (reparationId: number) => `/paiement/reparations/${reparationId}/payer/`,
  },

  AVIS: {
    BASE: '/avis/',
    DETAIL: (id: number) => `/avis/${id}/`,
    CREER: (reparationId: number) => `/avis/reparations/${reparationId}/`,
  },

  CONVERSATIONS: {
    DETAIL: (id: number) => `/conversations/${id}/`,
  },

  MESSAGERIE: {
    MESSAGES: (conversationId: number) => `/messagerie/conversations/${conversationId}/messages/`,
  },

  NOTIFICATIONS: {
    BASE: '/notifications/',
    MARQUER_LUE: (id: number) => `/notifications/${id}/lire/`,
  },

  DOCUMENTS: {
    DIAGNOSTIC: (diagnosticId: number) => `/documents/diagnostics/${diagnosticId}/ajouter-fichier/`,
    DEVIS: (devisId: number) => `/documents/devis/${devisId}/ajouter-fichier/`,
  }
};