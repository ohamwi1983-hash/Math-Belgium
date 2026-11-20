import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase UNIQUE du site (comptes professeurs) — voir `.claude/rules/comptes.md`.
 *
 * - Configuration : `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, lues par Vite au build
 *   (`.env.production` versionné pour la production, `.env.local` non suivi pour le développement).
 *   La clé est la clé PUBLIQUE (« anon » / « publishable », `sb_publishable_…` accepté par
 *   supabase-js 2.118) : prévue pour être dans le code du navigateur, la sécurité vient du RLS.
 *   JAMAIS de clé `service_role` / `sb_secret_…` côté client.
 * - Sans configuration : `supabaseConfigure()` est faux, `chargerSupabase()` rend `null` ; les
 *   pages publiques sont inchangées et les pages réservées affichent « Connexion indisponible
 *   (configuration manquante) ».
 * - Chargement À LA DEMANDE (`import()` dynamique) : supabase-js n'entre pas dans le paquet
 *   principal, et une page de cours ne le télécharge que si un jeton de session est déjà stocké
 *   (professeur connecté) ou si une page réservée le demande.
 * - Tests (développement SEULEMENT, `import.meta.env.DEV`) : un faux client peut être injecté
 *   dans `window.__MB_FAUX_SUPABASE__` avant le démarrage de l'application (Playwright
 *   `addInitScript`). Ignoré dans un build de production.
 */

declare global {
  interface Window {
    __MB_FAUX_SUPABASE__?: unknown
  }
}

const URL_SUPABASE = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const CLE_PUBLIQUE = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''

/** Clé de stockage de la session (localStorage) — fixée pour pouvoir tester sa présence sans
 * charger supabase-js (`jetonStockePresent`). */
export const CLE_STOCKAGE_SESSION = 'math-belgium-auth'

function fauxClient(): SupabaseClient | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  return (window.__MB_FAUX_SUPABASE__ as SupabaseClient | undefined) ?? null
}

function configurationValide(): boolean {
  return /^https:\/\/[^/\s]+$/.test(URL_SUPABASE.replace(/\/+$/, '')) && CLE_PUBLIQUE.length > 20
}

/** Vrai si les comptes sont disponibles (variables présentes, ou faux client de test). */
export function supabaseConfigure(): boolean {
  return fauxClient() !== null || configurationValide()
}

let promesseClient: Promise<SupabaseClient | null> | null = null

/** Le client (chargé une seule fois), ou `null` sans configuration. */
export function chargerSupabase(): Promise<SupabaseClient | null> {
  const faux = fauxClient()
  if (faux) return Promise.resolve(faux)
  if (!configurationValide()) return Promise.resolve(null)
  promesseClient ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(URL_SUPABASE.replace(/\/+$/, ''), CLE_PUBLIQUE, {
      auth: {
        storageKey: CLE_STOCKAGE_SESSION,
        persistSession: true,
        autoRefreshToken: true,
        // Liens reçus par e-mail (confirmation d'inscription, mot de passe oublié) : jetons dans
        // l'URL (#access_token=…), lus au chargement. Flux « implicit » (défaut) plutôt que PKCE :
        // le lien fonctionne même ouvert sur un autre appareil que celui de la demande.
        detectSessionInUrl: true,
      },
    }),
  )
  return promesseClient
}

/** Vrai si une session est stockée dans ce navigateur (sans charger supabase-js). */
export function jetonStockePresent(): boolean {
  try {
    return localStorage.getItem(CLE_STOCKAGE_SESSION) !== null
  } catch {
    return false
  }
}

/** Vrai si l'URL porte des jetons d'un lien reçu par e-mail (à lire tout de suite). */
export function jetonsDansUrl(): boolean {
  if (typeof window === 'undefined') return false
  return /(?:^|[#&?])(access_token|error_description)=/.test(window.location.hash + window.location.search)
}
