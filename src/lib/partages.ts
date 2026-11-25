/**
 * Coffre : partager un enregistrement avec un collègue par un lien (`supabase/migrations/0009_partages_plans.sql`,
 * décision du professeur du 25/11/2026 — `.claude/rules/comptes.md`, « Partage entre collègues »).
 *
 * - Le lien `/partage/<jeton>` ne s'ouvre que pour un professeur connecté ; le jeton (64 caractères
 *   hexadécimaux) est tiré PAR LA BASE, le site ne le choisit jamais.
 * - Le partage est une COPIE FIGÉE du `PlanDocument` (réglages + graines), sans le cartouche école /
 *   professeur (retiré ici ET par la base) ; « Ajouter à mon coffre » en fait une nouvelle copie dans les
 *   plans du collègue — aucune modification ne remonte, dans aucun sens.
 * - Expiration 30 jours (imposée par la base) ; « Arrêter le partage » le désactive tout de suite.
 *
 * Sans 0009 appliquée : `listerPartages` → `{ actif: false }`, `lirePartage` → `{ statut: 'absent' }` ;
 * le coffre marche comme avant et « Partager » dit d'appliquer la migration.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { chapitresTexte, libelleNiveau, resumerPlan } from './coffreResume'
import { ErreurCompte } from './compteDonnees'
import type { TypePlan } from './compteValidation'
import type { PlanDocument } from './evaluationLocal'

/** Durée de validité d'un lien (rappel : la base l'impose, `partages_plans_avant_insertion`). */
export const JOURS_VALIDITE_PARTAGE = 30

export interface PartagePlan {
  id: string
  plan_id: string | null
  jeton: string
  titre: string
  type: TypePlan
  cree_le: string
  expire_le: string
  revoque: boolean
  nombre_ajouts: number
}

/** Petit résumé montré au collègue avant l'ajout (colonne `resume`, ≤ 4 Ko). */
export interface ResumePartage {
  niveau: string
  chapitres: string
  questions: number
  exercices: number
  points: number | null
  series: number
}

export type EtatPartage = 'actif' | 'expire' | 'arrete'

export type LecturePartage =
  | {
      statut: 'ok'
      titre: string
      type: TypePlan
      resume: Partial<ResumePartage>
      contenu: PlanDocument
      partagePar: string
      creeLe: string
      expireLe: string
      dejaAjoute: boolean
      estProprietaire: boolean
    }
  | { statut: 'expire'; expireLe: string | null }
  | { statut: 'revoque' }
  | { statut: 'inconnu' }
  /** 0009 pas encore appliquée sur le serveur. */
  | { statut: 'absent' }

export type ModeAjout = 'memes' | 'nouveaux'

const COLONNES = 'id, plan_id, jeton, titre, type, cree_le, expire_le, revoque, nombre_ajouts'

/** Format exact d'un jeton (le reste n'est jamais envoyé au serveur). */
export function jetonValide(jeton: string | undefined | null): jeton is string {
  return typeof jeton === 'string' && /^[0-9a-f]{64}$/.test(jeton)
}

/** 0009 pas appliquée : table ou fonction inconnue (PostgREST PGRST205 / PGRST202, Postgres 42P01 /
 * 42883, ou message « schema cache » qui nomme un objet du partage). */
export function partagesAbsents(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  const code = String(e.code ?? '')
  const message = String(e.message ?? '')
  if (code === 'PGRST205' || code === 'PGRST202' || code === '42P01' || code === '42883') return true
  return /schema cache|does not exist|could not find/i.test(message) && /partage/i.test(message)
}

/** Levée quand la table ou la fonction du partage n'existe pas (0009 pas appliquée). */
export class PartagesAbsents extends Error {
  constructor() {
    super('Migration 0009 pas encore appliquée.')
    this.name = 'PartagesAbsents'
  }
}

function erreurPartage(brute: unknown): Error {
  if (partagesAbsents(brute)) return new PartagesAbsents()
  const e = (brute ?? {}) as { code?: string; message?: string }
  // Limite de 100 partages actifs (déclencheur, 23514) : message de la base, déjà en français.
  if (e.code === '23514' && /Trop de partages/.test(String(e.message ?? ''))) return new ErreurCompte({ name: 'ErreurCompte', message: String(e.message) })
  return new ErreurCompte(brute)
}

/** Copie du plan à partager : sans cartouche (école, adresse, nom du professeur). */
export function planSansCartouche(plan: PlanDocument): PlanDocument {
  const { cartouche: _retire, ...entete } = plan.entete
  void _retire
  return { ...plan, entete }
}

export function resumePartage(plan: PlanDocument, type: TypePlan): ResumePartage {
  const r = resumerPlan(plan, type)
  return {
    niveau: libelleNiveau(plan.levelSlug),
    chapitres: chapitresTexte(r.chapitres).slice(0, 300),
    questions: r.questions.length,
    exercices: r.exercices,
    points: r.sansPoints ? null : (r.totalFixe ?? r.points),
    series: r.series.length,
  }
}

export function etatPartage(p: Pick<PartagePlan, 'revoque' | 'expire_le'>, maintenant = Date.now()): EtatPartage {
  if (p.revoque) return 'arrete'
  return new Date(p.expire_le).getTime() <= maintenant ? 'expire' : 'actif'
}

/** Partage le plus récent d'un enregistrement (actif ou non), `null` s'il n'a jamais été partagé. */
export function partageDuPlan(partages: PartagePlan[], planId: string): PartagePlan | null {
  return partages.filter((p) => p.plan_id === planId).sort((a, b) => (a.cree_le < b.cree_le ? 1 : -1))[0] ?? null
}

export function urlPartage(jeton: string, origine = typeof window !== 'undefined' ? window.location.origin : 'https://math-belgium.vercel.app'): string {
  return `${origine}/partage/${jeton}`
}

/** « ajouté par 2 collègues » / « pas encore ajouté par un collègue ». */
export function texteAjouts(n: number): string {
  return n === 0 ? 'pas encore ajouté par un collègue' : `ajouté par ${n} collègue${n > 1 ? 's' : ''}`
}

/* -------------------------------------------------------------------------- accès aux données */

export async function listerPartages(c: SupabaseClient): Promise<{ actif: true; partages: PartagePlan[] } | { actif: false }> {
  const res = await c.from('partages_plans').select(COLONNES).order('cree_le', { ascending: false })
  if (res.error) {
    if (partagesAbsents(res.error)) return { actif: false }
    throw erreurPartage(res.error)
  }
  return { actif: true, partages: (res.data ?? []) as PartagePlan[] }
}

export async function creerPartage(c: SupabaseClient, plan: { id: string; type: TypePlan; titre: string; contenu: PlanDocument }): Promise<PartagePlan> {
  const res = await c
    .from('partages_plans')
    .insert({ plan_id: plan.id, type: plan.type, titre: plan.titre.trim().slice(0, 200), resume: resumePartage(plan.contenu, plan.type), contenu: planSansCartouche(plan.contenu) })
    .select(COLONNES)
    .single()
  if (res.error) throw erreurPartage(res.error)
  return res.data as PartagePlan
}

export async function arreterPartage(c: SupabaseClient, id: string): Promise<void> {
  const res = await c.rpc('arreter_partage', { p_id: id })
  if (res.error) throw erreurPartage(res.error)
}

export async function lirePartage(c: SupabaseClient, jeton: string): Promise<LecturePartage> {
  if (!jetonValide(jeton)) return { statut: 'inconnu' }
  const res = await c.rpc('lire_partage', { p_jeton: jeton })
  if (res.error) {
    if (partagesAbsents(res.error)) return { statut: 'absent' }
    throw erreurPartage(res.error)
  }
  const ligne = (Array.isArray(res.data) ? res.data[0] : res.data) as
    | { statut: string; titre: string; type: TypePlan; resume: Partial<ResumePartage> | null; contenu: PlanDocument; partage_par: string | null; cree_le: string; expire_le: string | null; deja_ajoute: boolean; est_proprietaire: boolean }
    | undefined
  if (!ligne || ligne.statut === 'inconnu') return { statut: 'inconnu' }
  if (ligne.statut === 'revoque') return { statut: 'revoque' }
  if (ligne.statut === 'expire') return { statut: 'expire', expireLe: ligne.expire_le }
  if (ligne.statut !== 'ok' || !ligne.contenu || typeof ligne.contenu !== 'object') return { statut: 'inconnu' }
  return {
    statut: 'ok',
    titre: ligne.titre,
    type: ligne.type,
    resume: ligne.resume ?? {},
    contenu: ligne.contenu,
    // Civilité liée au nom par une espace insécable (« M. Essai » jamais coupé en fin de ligne).
    partagePar: (ligne.partage_par ?? '').trim().replace(/^(M\.|Mme|Mlle|Mr|Dr)\s+/, '$1\u00a0') || 'un collègue',
    creeLe: ligne.cree_le,
    expireLe: ligne.expire_le ?? '',
    dejaAjoute: !!ligne.deja_ajoute,
    estProprietaire: !!ligne.est_proprietaire,
  }
}

/** Ajoute une COPIE au coffre du lecteur ; renvoie l'id du nouvel enregistrement. `nouveaux` : le plan
 * re-tiré (`partageTirage.ts::nouveauTirage`) est envoyé, sans cartouche. */
export async function ajouterPartage(c: SupabaseClient, jeton: string, mode: ModeAjout, planRetire?: PlanDocument): Promise<string> {
  const res = await c.rpc('ajouter_partage', { p_jeton: jeton, p_mode: mode, p_contenu: mode === 'nouveaux' && planRetire ? planSansCartouche(planRetire) : null })
  if (res.error) throw erreurPartage(res.error)
  return String(res.data)
}
