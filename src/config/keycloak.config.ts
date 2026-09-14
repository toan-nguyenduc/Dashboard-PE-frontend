import Keycloak from 'keycloak-js';

/**
 * Keycloak client configuration sourced from environment variables.
 * Uses Authorization Code Flow with PKCE for SPA security.
 */
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'pe-realm';
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'dashboard-pe-frontend';

export const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});
