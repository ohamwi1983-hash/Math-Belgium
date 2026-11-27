/**
 * Comptes professeurs — logique PURE (aucune dépendance à React ni à supabase-js), testable seule :
 * validation des saisies, messages d'erreur en français, type d'un plan, cartouche des copies.
 *
 * Règle CLAUDE.md : un champ de saisie ne bloque JAMAIS la frappe. Ces fonctions jugent la saisie
 * à l'ENVOI du formulaire (message clair sous le champ), sans jamais la modifier pendant la frappe.
 */
import type { CartoucheEcole } from '../entrainement/export/cartouche'
import type { PlanDocument } from './evaluationLocal'

export const MOT_DE_PASSE_MIN = 8
export const MOT_DE_PASSE_MAX = 72
export const NOM_AFFICHE_MAX = 120
export const ECOLE_NOM_MAX = 160
export const ECOLE_ADRESSE_MAX = 240
export const TITRE_PLAN_MAX = 200

export type TypePlan = 'exercice' | 'evaluation' | 'examen' | 'remediation'

export const LIBELLE_TYPE_PLAN: Record<TypePlan, string> = {
  exercice: "Feuilles d'exercices",
  evaluation: 'Évaluations',
  examen: 'Examens',
  remediation: 'Remédiations',
}

export interface Profil {
  id: string
  nom_affiche: string
  est_admin: boolean
  actif: boolean
}

export interface Ecole {
  id: string
  nom: string
  adresse: string
  par_defaut: boolean
}

/** Code d'invitation tel que saisi → forme canonique (majuscules, sans espaces ni tirets). Même
 * règle que `public.normaliser_code` côté base. */
export function normaliserCodeInvitation(saisie: string): string {
  return saisie.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** « ABCDEFGHJKLM » → « ABCD-EFGH-JKLM » (affichage seulement). */
export function formaterCode(code: string): string {
  return (code.match(/.{1,4}/g) ?? []).join('-')
}

export function erreurCodeInvitation(saisie: string): string | null {
  const code = normaliserCodeInvitation(saisie)
  if (code === '') return "Code d'invitation manquant : il t'a été donné par l'administrateur du site."
  if (code.length < 6 || code.length > 32) return "Code d'invitation inconnu ou déjà utilisé."
  return null
}

export function erreurEmail(saisie: string): string | null {
  const email = saisie.trim()
  if (email === '') return 'Adresse e-mail manquante.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Adresse e-mail invalide (exemple : prenom.nom@ecole.be).'
  return null
}

export function erreurMotDePasse(saisie: string): string | null {
  if (saisie.length === 0) return 'Mot de passe manquant.'
  if (saisie.length < MOT_DE_PASSE_MIN) return `Mot de passe trop court : ${MOT_DE_PASSE_MIN} caractères minimum.`
  if (saisie.length > MOT_DE_PASSE_MAX) return `Mot de passe trop long : ${MOT_DE_PASSE_MAX} caractères maximum.`
  return null
}

export function erreurConfirmation(motDePasse: string, confirmation: string): string | null {
  return motDePasse === confirmation ? null : 'Les deux mots de passe ne sont pas identiques.'
}

export function erreurNomAffiche(saisie: string): string | null {
  const nom = saisie.trim()
  if (nom === '') return 'Nom affiché manquant (exemple : « M. Dupont », imprimé sur les copies).'
  if (nom.length > NOM_AFFICHE_MAX) return `Nom affiché trop long : ${NOM_AFFICHE_MAX} caractères maximum.`
  return null
}

export function erreurEcole(nom: string, adresse: string): string | null {
  if (nom.trim() === '') return "Nom de l'école manquant."
  if (nom.trim().length > ECOLE_NOM_MAX) return `Nom de l'école trop long : ${ECOLE_NOM_MAX} caractères maximum.`
  if (adresse.length > ECOLE_ADRESSE_MAX) return `Adresse trop longue : ${ECOLE_ADRESSE_MAX} caractères maximum.`
  return null
}

export function erreurTitrePlan(saisie: string): string | null {
  const t = saisie.trim()
  if (t === '') return 'Titre manquant.'
  if (t.length > TITRE_PLAN_MAX) return `Titre trop long : ${TITRE_PLAN_MAX} caractères maximum.`
  return null
}

/** Réponse de `verifier_code_invitation` → message (null si valide). */
export function messageStatutCode(statut: string): string | null {
  switch (statut) {
    case 'valide':
      return null
    case 'expire':
      return "Code d'invitation expiré : demande un nouveau code à l'administrateur."
    case 'revoque':
      return "Code d'invitation révoqué : demande un nouveau code à l'administrateur."
    default:
      return "Code d'invitation inconnu ou déjà utilisé."
  }
}

/** Nombre de saisie libre (ex. nombre de codes) : lu sans jamais bloquer la frappe. */
export function lireEntier(saisie: string): number | null {
  const t = saisie.replace(/[−–—]/g, '-').trim()
  return /^-?\d+$/.test(t) ? Number(t) : null
}

/** Date `AAAA-MM-JJ` (champ date) → fin de cette journée en heure locale, ISO ; `null` si vide /
 * illisible. */
export function finDeJournee(dateIso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim())
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

interface ErreurBrute {
  message?: string
  code?: string
  status?: number
  name?: string
}

/**
 * Erreur Supabase (auth, PostgREST, RPC) → message clair en français. Les fonctions SQL du site
 * lèvent déjà des messages en français (P0001, P0002, 22023) : repris tels quels.
 */
export function messageErreur(erreur: unknown): string {
  const e = (erreur ?? {}) as ErreurBrute
  // Déjà traduite (`compteDonnees.ts::ErreurCompte`) : telle quelle.
  if (e.name === 'ErreurCompte' && e.message) return e.message
  const message = String(e.message ?? erreur ?? '')
  const code = String(e.code ?? '')
  const m = message.toLowerCase()

  if (code === 'invalid_credentials' || m.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (code === 'email_not_confirmed' || m.includes('email not confirmed'))
    return "Adresse e-mail pas encore confirmée : clique d'abord sur le lien reçu par e-mail (regarde aussi dans les indésirables)."
  if (code === 'user_already_exists' || code === 'email_exists' || m.includes('already registered')) return 'Un compte existe déjà avec cette adresse e-mail : connecte-toi.'
  if (code === 'unexpected_failure' || m.includes('database error saving new user')) return "Code d'invitation inconnu ou déjà utilisé."
  if (code === 'weak_password' || m.includes('password should be at least') || m.includes('password is too short'))
    return `Mot de passe trop court ou trop simple : ${MOT_DE_PASSE_MIN} caractères minimum.`
  if (code === 'same_password' || m.includes('should be different from the old password')) return "Le nouveau mot de passe doit être différent de l'ancien."
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || e.status === 429 || m.includes('rate limit') || m.includes('for security purposes'))
    return 'Trop de demandes en peu de temps : réessaie dans quelques minutes.'
  if (code === 'email_address_invalid' || (m.includes('email address') && m.includes('invalid'))) return 'Adresse e-mail refusée : vérifie-la.'
  if (code === 'session_not_found' || code === 'refresh_token_not_found' || m.includes('auth session missing') || m.includes('jwt expired'))
    return 'Session expirée : reconnecte-toi.'
  if (code === 'otp_expired' || (m.includes('expired') && m.includes('link'))) return 'Lien expiré ou déjà utilisé : demande un nouveau lien.'
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed') || m.includes('load failed') || e.name === 'AuthRetryableFetchError')
    return 'Serveur injoignable : vérifie ta connexion Internet. (Après une semaine sans visite, le serveur se met en veille : réessaie dans une minute.)'
  if (code === '42501' || m.includes('permission denied') || m.includes('row-level security'))
    return 'Action refusée : compte désactivé ou droits insuffisants.'
  if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883')
    return "Base de données pas encore prête : le script d'installation (supabase/migrations/0001_comptes.sql) n'a pas été exécuté."
  if (code === '23505' && m.includes('ecoles_une_par_defaut')) return 'Une seule école peut être « par défaut ».'
  if (code === '23514' && m.includes('repartition')) return 'Répartition refusée : trois nombres entiers de 0 à 100 dont la somme fait 100 %.'
  if (code === '23514') return 'Valeur refusée (trop longue ou vide).'
  if (code === 'P0001' || code === 'P0002' || code === '22023') return message
  return message ? `Erreur inattendue : ${message}` : 'Erreur inattendue : réessaie.'
}

/** Type d'un plan pour le coffre (colonne `plans.type`). */
export function typeDuPlan(plan: PlanDocument): TypePlan {
  if (plan.remediation) return 'remediation'
  if (plan.entete.mode === 'exercice') return 'exercice'
  if (plan.entete.typeDocument === 'examen') return 'examen'
  return 'evaluation'
}

/** Page du panneau où charger un plan du coffre. */
export function routeDuPlan(type: TypePlan): string {
  return type === 'evaluation' || type === 'examen' ? '/evaluation' : '/exercice'
}

/** École proposée par défaut dans le panneau : celle marquée « par défaut », sinon la première. */
export function ecoleParDefaut(ecoles: Ecole[]): Ecole | null {
  return ecoles.find((e) => e.par_defaut) ?? ecoles[0] ?? null
}

/** Cartouche des copies pour un professeur connecté : son nom et l'école choisie (aucune école :
 * rien à la place de l'école ni de l'adresse — jamais l'école historique d'un autre professeur). */
export function cartoucheDepuisCompte(profil: Pick<Profil, 'nom_affiche'>, ecole: Pick<Ecole, 'nom' | 'adresse'> | null): CartoucheEcole {
  return { ecoleNom: ecole?.nom.trim() ?? '', ecoleAdresse: ecole?.adresse.trim() ?? '', professeur: profil.nom_affiche.trim() }
}

/** Adresse de retour sûre (chemin du site seulement, jamais une URL externe). */
export function retourSur(brut: string | null | undefined, defaut = '/espace'): string {
  if (!brut || !brut.startsWith('/') || brut.startsWith('//') || brut.includes('\\')) return defaut
  return brut
}

export interface PlanLocal {
  id: string
  nom: string
  enregistreLe: string
  plan: PlanDocument
}

export interface PlanCoffreMinimal {
  titre: string
  contenu: PlanDocument
}

/** Enregistrements locaux à importer : ceux qui ne sont pas déjà dans le coffre (même titre et
 * même plan — `creeLe` + série — : réimporter deux fois ne crée pas de doublon). */
export function plansLocauxAImporter(locaux: PlanLocal[], coffre: PlanCoffreMinimal[]): PlanLocal[] {
  const cle = (titre: string, plan: PlanDocument) => `${titre.trim()}|${plan.creeLe}|${JSON.stringify(plan.series).length}`
  const deja = new Set(coffre.map((p) => cle(p.titre, p.contenu)))
  const vus = new Set<string>()
  return locaux.filter((l) => {
    const k = cle(l.nom, l.plan)
    if (deja.has(k) || vus.has(k)) return false
    vus.add(k)
    return true
  })
}
