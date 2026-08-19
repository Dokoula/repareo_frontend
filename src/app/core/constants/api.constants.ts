export const API = {
  BASE_URL: 'http://127.0.0.1:8000/api',

  AUTH: {
    LOGIN: '/users/login/',
    REGISTER: '/users/register/',
    PROFILE: '/users/profile/',
  },

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
    SOUMETTRE_DOSSIER: '/reparateurs/dossier/soumettre/',
    MON_DOSSIER: '/reparateurs/dossier/mon-dossier/',
    ADMIN_DOSSIERS: '/reparateurs/admin/dossiers/',
    ADMIN_VALIDER: (id: number) => `/reparateurs/${id}/valider/`,
  },

  DEMANDES: {
    BASE: '/demandes/',
    DETAIL: (id: number) => `/demandes/${id}/`,
    ASSIGNER: (id: number) => `/demandes/${id}/assigner/`,
    ENVOYER_MATERIEL: (id: number) => `/demandes/${id}/envoyer-materiel/`,
    RECHERCHER_REPARATEURS: (id: number) => `/demandes/${id}/rechercher-reparateurs/`,
  },

  DIAGNOSTICS: {
    BASE: '/diagnostics/',
    DETAIL: (id: number) => `/diagnostics/${id}/`,
    CREER: (demandeId: number) => `/diagnostics/demandes/${demandeId}/creer/`,
  },

  DEVIS: {
    BASE: '/devis/',
    DETAIL: (id: number) => `/devis/${id}/`,
    CREER: (diagnosticId: number) => `/devis/diagnostics/${diagnosticId}/creer/`,
    ACCEPTER: (devisId: number) => `/devis/${devisId}/accepter/`,
    REFUSER: (devisId: number) => `/devis/${devisId}/refuser/`,
  },

  REPARATIONS: {
    BASE: '/reparation/',
    DETAIL: (id: number) => `/reparation/${id}/`,
    DEMARRER: (devisId: number) => `/reparation/devis/${devisId}/demarrer/`,
    TERMINER: (reparationId: number) => `/reparation/${reparationId}/terminer/`,
  },

  PAIEMENTS: {
    BASE: '/paiement/',
    DETAIL: (id: number) => `/paiement/${id}/`,
    MODES: '/paiement/modes/',
    PAYER: (reparationId: number) => `/paiement/reparations/${reparationId}/effectuer/`,
    PORTEFEUILLE: '/paiement/portefeuille/',
    RETRAIT: '/paiement/portefeuille/retrait/',
  },

  AVIS: {
    BASE: '/avis/',
    DETAIL: (id: number) => `/avis/${id}/`,
    CREER: (reparationId: number) => `/avis/reparations/${reparationId}/creer/`,
  },

  CONVERSATIONS: {
    BASE: '/conversations/',
    DETAIL: (id: number) => `/conversations/${id}/`,
    ADMINISTRATION: '/conversations/administration/',
    OUVRIR_ADMINISTRATION: (reparateurId: number) => `/conversations/administration/reparateurs/${reparateurId}/`,
    MESSAGES_ADMINISTRATION: (id: number) => `/conversations/administration/${id}/messages/`,
  },

  MESSAGERIE: {
    MESSAGES: (conversationId: number) => `/messagerie/conversation/${conversationId}/`,
    ENVOYER: (conversationId: number) => `/messagerie/conversation/${conversationId}/envoyer/`,
  },

  NOTIFICATIONS: {
    BASE: '/notifications/',
    MARQUER_LUE: (id: number) => `/notifications/${id}/lu/`,
  },

  DOCUMENTS: {
    DIAGNOSTIC: (diagnosticId: number) => `/documents/diagnostics/${diagnosticId}/`,
    DEVIS: (devisId: number) => `/documents/devis/${devisId}/`,
  }
};
