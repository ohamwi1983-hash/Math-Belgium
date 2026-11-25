/**
 * Page de classe à code — accès Supabase (`supabase/migrations/0010_page_classe.sql`, client injecté).
 *
 * Professeur (carnet) : `chargerPagesClasse` (ses pages, `{ actif: false }` sans 0010), `nouveauCode`
 * (« Créer le code » / « Nouveau code » : la BASE tire le code, l'ancien cesse aussitôt), `couperCode`,
 * `enregistrerReglagesPage` (interrupteurs) et `publierContenu` (copie construite par
 * `pageClasseContenu.ts`). Le site n'écrit jamais le code ni les dates (droits de colonne de 0010).
 *
 * Élève (`/classe`, sans compte) : `lirePageClasse(code)` → fonction `lire_page_classe` (SECURITY
 * DEFINER, seule porte ouverte à `anon`) : seules les rubriques publiées, limite d'essais.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { lireReponsePageClasse, REGLAGES_PAGE_DEFAUT, type ContenuPageClasse, type ReglagesPageClasse, type ReponsePageClasse } from './pageClasse'

export interface PageClasseProf extends ReglagesPageClasse {
  classe_id: string
  /** `null` : code coupé (ou jamais créé). */
  code: string | null
  code_cree_le: string | null
  contenu: Partial<ContenuPageClasse>
  publie_le: string | null
}

const COLONNES = 'classe_id, code, code_cree_le, publier_interros, publier_devoirs, publier_matiere, publier_heure, publier_nom, contenu, publie_le'

/** 0010 pas appliquée : table ou fonction inconnue de PostgREST / Postgres. */
export function pageClasseAbsente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return ['PGRST205', 'PGRST202', '42P01', '42883'].includes(String(e.code ?? '')) || /pages_classe|lire_page_classe|nouveau_code_classe|couper_code_classe/i.test(String(e.message ?? '')) && /schema cache|could not find|does not exist/i.test(String(e.message ?? ''))
}

export class ErreurPageClasse extends Error {
  readonly absente: boolean
  constructor(brute: unknown) {
    const b = (brute ?? {}) as { code?: string; message?: string }
    const absente = pageClasseAbsente(brute)
    let message: string
    if (absente) message = 'Page de classe pas encore activée : collez le fichier supabase/migrations/0010_page_classe.sql dans l’éditeur SQL de Supabase (SQL Editor → New query → coller → Run).'
    else if (b.code === '23514' && /pages_classe_contenu/i.test(String(b.message ?? ''))) message = 'Le serveur a refusé ce qui devait être publié (trop long ?) : réessayez, ou retirez une rubrique.'
    else if (b.code === 'P0002') message = 'Classe introuvable (supprimée ?) : rechargez la page.'
    else if (b.code === '42501') message = 'Action refusée par le serveur : reconnectez-vous.'
    else if (/fetch|network|failed to fetch|load failed/i.test(String(b.message ?? ''))) message = 'Serveur injoignable : vérifiez la connexion, puis réessayez.'
    else message = String(b.message ?? 'Erreur inattendue du serveur.')
    super(message)
    // Même nom que les erreurs déjà traduites : `messageErreur` (carnet) les affiche telles quelles.
    this.name = 'ErreurCompte'
    this.absente = absente
  }
}

function lireLigne(l: Record<string, unknown>): PageClasseProf {
  const bool = (k: keyof ReglagesPageClasse) => (typeof l[k] === 'boolean' ? (l[k] as boolean) : REGLAGES_PAGE_DEFAUT[k])
  return {
    classe_id: String(l.classe_id),
    code: typeof l.code === 'string' ? l.code : null,
    code_cree_le: typeof l.code_cree_le === 'string' ? l.code_cree_le : null,
    publier_interros: bool('publier_interros'),
    publier_devoirs: bool('publier_devoirs'),
    publier_matiere: bool('publier_matiere'),
    publier_heure: bool('publier_heure'),
    publier_nom: bool('publier_nom'),
    contenu: l.contenu && typeof l.contenu === 'object' ? (l.contenu as Partial<ContenuPageClasse>) : {},
    publie_le: typeof l.publie_le === 'string' ? l.publie_le : null,
  }
}

export type PagesClasse = { actif: true; pages: PageClasseProf[] } | { actif: false; pages: [] }

export async function chargerPagesClasse(c: SupabaseClient): Promise<PagesClasse> {
  const { data, error } = await c.from('pages_classe').select(COLONNES)
  if (error) {
    if (pageClasseAbsente(error)) return { actif: false, pages: [] }
    throw new ErreurPageClasse(error)
  }
  return { actif: true, pages: ((data ?? []) as Record<string, unknown>[]).map(lireLigne) }
}

/** Nouveau code pour la classe (crée la page si besoin). Renvoie le code tiré par la base. */
export async function nouveauCode(c: SupabaseClient, classeId: string): Promise<string> {
  const { data, error } = await c.rpc('nouveau_code_classe', { p_classe: classeId })
  if (error) throw new ErreurPageClasse(error)
  return String(data)
}

export async function couperCode(c: SupabaseClient, classeId: string): Promise<void> {
  const { error } = await c.rpc('couper_code_classe', { p_classe: classeId })
  if (error) throw new ErreurPageClasse(error)
}

export async function enregistrerReglagesPage(c: SupabaseClient, classeId: string, r: ReglagesPageClasse): Promise<void> {
  const { error } = await c
    .from('pages_classe')
    .update({ publier_interros: r.publier_interros, publier_devoirs: r.publier_devoirs, publier_matiere: r.publier_matiere, publier_heure: r.publier_heure, publier_nom: r.publier_nom })
    .eq('classe_id', classeId)
  if (error) throw new ErreurPageClasse(error)
}

export async function publierContenu(c: SupabaseClient, classeId: string, contenu: ContenuPageClasse): Promise<string | null> {
  const { data, error } = await c.from('pages_classe').update({ contenu }).eq('classe_id', classeId).select('publie_le').maybeSingle()
  if (error) throw new ErreurPageClasse(error)
  const d = data as { publie_le?: unknown } | null
  return d && typeof d.publie_le === 'string' ? d.publie_le : new Date().toISOString()
}

/* ------------------------------------------------------------------------------------- élève */

export type LecturePageClasse = ReponsePageClasse | { statut: 'absente' } | { statut: 'injoignable' }

/** Lecture par code (élève, sans compte). Une panne réseau ou un serveur en veille → `injoignable`
 * (la page montre alors la dernière version gardée sur l'appareil). */
export async function lirePageClasse(c: SupabaseClient, code: string): Promise<LecturePageClasse> {
  try {
    const { data, error } = await c.rpc('lire_page_classe', { p_code: code })
    if (error) return pageClasseAbsente(error) ? { statut: 'absente' } : { statut: 'injoignable' }
    return lireReponsePageClasse(data) ?? { statut: 'injoignable' }
  } catch {
    return { statut: 'injoignable' }
  }
}
