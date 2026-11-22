/**
 * Comptes professeurs — accès aux données Supabase (tables `profils`, `ecoles`, `plans`,
 * fonctions RPC de `supabase/migrations/0001_comptes.sql`). Chaque fonction reçoit le client
 * (vrai client, ou faux client injecté par les tests) et lève une `ErreurCompte` au message
 * déjà traduit (`compteValidation.ts::messageErreur`).
 *
 * Sous-ensemble de l'API utilisé (le faux client des tests n'imite que celui-ci) :
 * `from(t).select().eq().order().maybeSingle()/single()`, `insert(…).select().single()`,
 * `update(…).eq()`, `delete().eq()`, `rpc(nom, args)`, `auth.signUp / signInWithPassword /
 * signOut / resetPasswordForEmail / updateUser / getSession / onAuthStateChange`.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlanDocument } from './evaluationLocal'
import { messageErreur, normaliserCodeInvitation, plansLocauxAImporter, typeDuPlan, type Ecole, type PlanLocal, type Profil, type TypePlan } from './compteValidation'
import { estRepartitionDefaut, repartitionValide, type RepartitionPourcents } from './repartitionProcessus'

export class ErreurCompte extends Error {
  constructor(brute: unknown) {
    super(messageErreur(brute))
    this.name = 'ErreurCompte'
  }
}

function verifier<T>(res: { data?: T; error: unknown }): T {
  if (res.error) throw new ErreurCompte(res.error)
  return res.data as T
}

export interface PlanCoffre {
  id: string
  type: TypePlan
  titre: string
  contenu: PlanDocument
  cree_le: string
  modifie_le: string
}

export interface Invitation {
  id: string
  code: string
  cree_le: string
  expire_le: string | null
  note: string | null
  revoque: boolean
  utilise_le: string | null
  utilise_par: string | null
  utilise_par_email: string | null
  utilise_par_nom: string | null
}

export interface Professeur {
  id: string
  email: string
  nom_affiche: string
  est_admin: boolean
  actif: boolean
  inscrit_le: string
  derniere_connexion: string | null
  nombre_plans: number
  nombre_ecoles: number
}

/* -------------------------------------------------------------------------- authentification */

export async function verifierCodeInvitation(c: SupabaseClient, code: string): Promise<string> {
  return String(verifier(await c.rpc('verifier_code_invitation', { p_code: normaliserCodeInvitation(code) })))
}

/** Inscription : le code et le nom vont dans les métadonnées, lus par le déclencheur SQL. Renvoie
 * `true` si une session est ouverte tout de suite (confirmation d'e-mail désactivée), `false` si
 * l'e-mail de confirmation a été envoyé. */
export async function inscrire(c: SupabaseClient, saisie: { code: string; nom: string; email: string; motDePasse: string; redirection: string }): Promise<boolean> {
  const res = await c.auth.signUp({
    email: saisie.email.trim(),
    password: saisie.motDePasse,
    options: { emailRedirectTo: saisie.redirection, data: { code_invitation: normaliserCodeInvitation(saisie.code), nom_affiche: saisie.nom.trim() } },
  })
  const data = verifier(res)
  return Boolean(data.session)
}

export async function connecter(c: SupabaseClient, email: string, motDePasse: string): Promise<void> {
  verifier<unknown>(await c.auth.signInWithPassword({ email: email.trim(), password: motDePasse }))
}

export async function envoyerLienReinitialisation(c: SupabaseClient, email: string, redirection: string): Promise<void> {
  verifier(await c.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirection }))
}

export async function changerMotDePasse(c: SupabaseClient, motDePasse: string): Promise<void> {
  verifier<unknown>(await c.auth.updateUser({ password: motDePasse }))
}

export async function deconnecter(c: SupabaseClient): Promise<void> {
  verifier(await c.auth.signOut())
}

export async function supprimerMonCompte(c: SupabaseClient): Promise<void> {
  verifier(await c.rpc('supprimer_mon_compte'))
  await c.auth.signOut().catch(() => undefined)
}

/* -------------------------------------------------------------------------- profil et écoles */

export async function lireProfil(c: SupabaseClient, id: string): Promise<Profil | null> {
  return verifier(await c.from('profils').select('id, nom_affiche, est_admin, actif').eq('id', id).maybeSingle()) as Profil | null
}

export async function majNomAffiche(c: SupabaseClient, id: string, nom: string): Promise<void> {
  verifier(await c.from('profils').update({ nom_affiche: nom.trim() }).eq('id', id))
}

/* -------------------------------------------------------------------------- répartition (0005) */

/** Colonne `profils.repartition` inconnue : `0005_repartition.sql` pas encore collé (Postgres 42703
 * en lecture, PostgREST PGRST204 en écriture, ou message « schema cache » / « does not exist »). */
export function colonneRepartitionAbsente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return /repartition/i.test(String(e.message ?? '')) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(String(e.message ?? '')))
}

/** `actif: false` = 0005 pas appliquée (le réglage ne vaut alors que pour la session) ;
 * `repartition: null` = défaut (colonne NULL, ou valeur illisible — impossible avec la contrainte). */
export type LectureRepartition = { actif: true; repartition: RepartitionPourcents | null } | { actif: false }

/** Répartition « Préparer l'évaluation » du professeur. Lue À PART du profil (`lireProfil` ne
 * change pas) : sans 0005, seul ce réglage est concerné, rien d'autre ne casse. */
export async function lireRepartition(c: SupabaseClient, id: string): Promise<LectureRepartition> {
  const res = await c.from('profils').select('repartition').eq('id', id).maybeSingle()
  if (res.error) {
    if (colonneRepartitionAbsente(res.error)) return { actif: false }
    throw new ErreurCompte(res.error)
  }
  const brute = (res.data as { repartition?: unknown } | null)?.repartition ?? null
  return { actif: true, repartition: repartitionValide(brute) ? brute : null }
}

/** Mémorise la répartition (le défaut est stocké NULL). Renvoie `false` si 0005 n'est pas appliquée
 * (rien n'est écrit) ; toute autre erreur lève une `ErreurCompte`. */
export async function enregistrerRepartition(c: SupabaseClient, id: string, r: RepartitionPourcents): Promise<boolean> {
  if (!repartitionValide(r)) throw new ErreurCompte({ name: 'ErreurCompte', message: 'Répartition refusée : trois nombres entiers de 0 à 100 dont la somme fait 100 %.' })
  const valeur = estRepartitionDefaut(r) ? null : { connaitre: r.connaitre, appliquer: r.appliquer, transferer: r.transferer }
  const res = await c.from('profils').update({ repartition: valeur }).eq('id', id)
  if (res.error) {
    if (colonneRepartitionAbsente(res.error)) return false
    throw new ErreurCompte(res.error)
  }
  return true
}

export async function lireEcoles(c: SupabaseClient): Promise<Ecole[]> {
  return (verifier(await c.from('ecoles').select('id, nom, adresse, par_defaut').order('cree_le', { ascending: true })) ?? []) as Ecole[]
}

/** Ajoute une école ; la première devient l'école par défaut. */
export async function ajouterEcole(c: SupabaseClient, saisie: { nom: string; adresse: string }, existantes: Ecole[]): Promise<void> {
  const cree = verifier(await c.from('ecoles').insert({ nom: saisie.nom.trim(), adresse: saisie.adresse.trim() }).select('id').single()) as { id: string }
  if (!existantes.some((e) => e.par_defaut)) await definirEcoleParDefaut(c, cree.id)
}

export async function modifierEcole(c: SupabaseClient, id: string, saisie: { nom: string; adresse: string }): Promise<void> {
  verifier(await c.from('ecoles').update({ nom: saisie.nom.trim(), adresse: saisie.adresse.trim() }).eq('id', id))
}

/** Supprime une école ; si c'était l'école par défaut, la plus ancienne restante le devient. */
export async function supprimerEcole(c: SupabaseClient, id: string, existantes: Ecole[]): Promise<void> {
  verifier(await c.from('ecoles').delete().eq('id', id))
  const supprimee = existantes.find((e) => e.id === id)
  const restante = existantes.find((e) => e.id !== id)
  if (supprimee?.par_defaut && restante) await definirEcoleParDefaut(c, restante.id)
}

export async function definirEcoleParDefaut(c: SupabaseClient, id: string): Promise<void> {
  verifier(await c.rpc('definir_ecole_par_defaut', { p_ecole: id }))
}

/* -------------------------------------------------------------------------- coffre (plans) */

export async function listerPlans(c: SupabaseClient): Promise<PlanCoffre[]> {
  return (verifier(await c.from('plans').select('id, type, titre, contenu, cree_le, modifie_le').order('modifie_le', { ascending: false })) ?? []) as PlanCoffre[]
}

export async function enregistrerPlanCoffre(c: SupabaseClient, titre: string, plan: PlanDocument): Promise<PlanCoffre> {
  return verifier(await c.from('plans').insert({ type: typeDuPlan(plan), titre: titre.trim(), contenu: plan }).select('id, type, titre, contenu, cree_le, modifie_le').single()) as PlanCoffre
}

export async function lirePlanCoffre(c: SupabaseClient, id: string): Promise<PlanCoffre | null> {
  return verifier(await c.from('plans').select('id, type, titre, contenu, cree_le, modifie_le').eq('id', id).maybeSingle()) as PlanCoffre | null
}

export async function renommerPlan(c: SupabaseClient, id: string, titre: string): Promise<void> {
  verifier(await c.from('plans').update({ titre: titre.trim() }).eq('id', id))
}

export async function dupliquerPlan(c: SupabaseClient, plan: PlanCoffre): Promise<PlanCoffre> {
  return enregistrerPlanCoffre(c, `${plan.titre} (copie)`.slice(0, 200), plan.contenu)
}

export async function supprimerPlanCoffre(c: SupabaseClient, id: string): Promise<void> {
  verifier(await c.from('plans').delete().eq('id', id))
}

/** Importe en une fois les enregistrements du navigateur (`evaluationLocal.ts::lirePlansEnregistres`)
 * qui ne sont pas déjà dans le coffre. Les enregistrements locaux ne sont PAS effacés. */
export async function importerPlansLocaux(c: SupabaseClient, locaux: PlanLocal[], coffre: PlanCoffre[]): Promise<{ importes: number; dejaPresents: number }> {
  const aImporter = plansLocauxAImporter(locaux, coffre)
  if (aImporter.length > 0) {
    verifier(await c.from('plans').insert(aImporter.map((l) => ({ type: typeDuPlan(l.plan), titre: (l.nom.trim() || l.plan.entete.titre).slice(0, 200), contenu: l.plan }))))
  }
  return { importes: aImporter.length, dejaPresents: locaux.length - aImporter.length }
}

/* -------------------------------------------------------------------------- administration */

export async function genererCodes(c: SupabaseClient, nombre: number, expireLe: string | null, note: string): Promise<Invitation[]> {
  return (verifier(await c.rpc('admin_generer_codes', { p_nombre: nombre, p_expire_le: expireLe, p_note: note.trim() || null })) ?? []) as Invitation[]
}

export async function revoquerCode(c: SupabaseClient, id: string): Promise<void> {
  verifier(await c.rpc('admin_revoquer_code', { p_id: id }))
}

export async function listerInvitations(c: SupabaseClient): Promise<Invitation[]> {
  return (verifier(await c.rpc('admin_lister_invitations')) ?? []) as Invitation[]
}

export async function listerProfesseurs(c: SupabaseClient): Promise<Professeur[]> {
  return (verifier(await c.rpc('admin_lister_professeurs')) ?? []) as Professeur[]
}

export async function definirActif(c: SupabaseClient, id: string, actif: boolean): Promise<void> {
  verifier(await c.rpc('admin_definir_actif', { p_id: id, p_actif: actif }))
}
