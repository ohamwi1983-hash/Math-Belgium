import type { Invitation, Professeur } from './compteDonnees'
import { formaterCode } from './compteValidation'

/**
 * Logique PURE de la page `/admin` (refonte du 22/11/2026) : états des professeurs et des codes,
 * filtres, recherche, « par quel code », dates lisibles. Aucune donnée en plus de ce que renvoient
 * `admin_lister_professeurs` et `admin_lister_invitations` (jointure côté client, aucun SQL).
 */

const JOUR = 86_400_000

/* ------------------------------------------------------------------------------------- codes */

export type EtatCode = 'attente' | 'utilise' | 'expire' | 'revoque'

/** Même ordre de priorité que l'ancienne page : utilisé > révoqué > expiré > en attente. */
export function etatCode(i: Invitation, maintenant = Date.now()): EtatCode {
  if (i.utilise_le) return 'utilise'
  if (i.revoque) return 'revoque'
  if (i.expire_le && new Date(i.expire_le).getTime() <= maintenant) return 'expire'
  return 'attente'
}

export const FILTRES_CODES: { id: EtatCode | 'tous'; libelle: string; vide: string }[] = [
  { id: 'attente', libelle: 'En attente', vide: 'Aucun code en attente' },
  { id: 'utilise', libelle: 'Utilisés', vide: 'Aucun code utilisé pour l’instant.' },
  { id: 'expire', libelle: 'Expirés', vide: 'Aucun code expiré.' },
  { id: 'revoque', libelle: 'Révoqués', vide: 'Aucun code révoqué.' },
  { id: 'tous', libelle: 'Tous', vide: 'Aucun code' },
]

export function compterCodes(invitations: Invitation[], maintenant = Date.now()): Record<EtatCode | 'tous', number> {
  const n = { attente: 0, utilise: 0, expire: 0, revoque: 0, tous: invitations.length }
  for (const i of invitations) n[etatCode(i, maintenant)]++
  return n
}

/** Code par lequel un professeur s'est inscrit (`invitations.utilise_par` = `professeurs.id`). */
export function codeDuProfesseur(invitations: Invitation[], idProfesseur: string): Invitation | null {
  return invitations.find((i) => i.utilise_par === idProfesseur) ?? null
}

/** « C3WN-…-H3RD » est trop long sous un nom : le début suffit à le retrouver dans l'onglet Codes. */
export function codeAbrege(code: string): string {
  return `${formaterCode(code).slice(0, 4)}-…`
}

/* ------------------------------------------------------------------------------- professeurs */

export type EtatProfesseur = 'toi' | 'desactive' | 'accompagner' | 'actif'
export type FiltreProfesseurs = 'tous' | 'actifs' | 'desactives' | 'accompagner' | 'silencieux'

/** « À accompagner » : compte actif, pas toi, rien enregistré (`nombre_plans === 0`). */
export function aAccompagner(p: Professeur, idMoi: string): boolean {
  return p.actif && p.id !== idMoi && Number(p.nombre_plans) === 0
}

/** Sans connexion depuis 30 jours (ou jamais connecté) : compte actif, pas toi. */
export function silencieux(p: Professeur, idMoi: string, maintenant = Date.now()): boolean {
  if (!p.actif || p.id === idMoi) return false
  return !p.derniere_connexion || maintenant - new Date(p.derniere_connexion).getTime() > 30 * JOUR
}

export function etatProfesseur(p: Professeur, idMoi: string): EtatProfesseur {
  if (p.id === idMoi) return 'toi'
  if (!p.actif) return 'desactive'
  if (aAccompagner(p, idMoi)) return 'accompagner'
  return 'actif'
}

export const FILTRES_PROFESSEURS: { id: FiltreProfesseurs; libelle: string; vide: string }[] = [
  { id: 'tous', libelle: 'Tous', vide: 'Aucun professeur' },
  { id: 'actifs', libelle: 'Actifs', vide: 'Aucun compte actif.' },
  { id: 'desactives', libelle: 'Désactivés', vide: 'Aucun compte désactivé.' },
  { id: 'accompagner', libelle: 'À accompagner', vide: 'Personne à accompagner : chacun a déjà enregistré quelque chose.' },
  { id: 'silencieux', libelle: 'Sans connexion depuis 30 jours', vide: 'Tout le monde s’est connecté ces 30 derniers jours.' },
]

export function correspondFiltre(p: Professeur, filtre: FiltreProfesseurs, idMoi: string, maintenant = Date.now()): boolean {
  switch (filtre) {
    case 'actifs':
      return p.actif
    case 'desactives':
      return !p.actif
    case 'accompagner':
      return aAccompagner(p, idMoi)
    case 'silencieux':
      return silencieux(p, idMoi, maintenant)
    default:
      return true
  }
}

export function compterProfesseurs(professeurs: Professeur[], idMoi: string, maintenant = Date.now()): Record<FiltreProfesseurs, number> {
  const n: Record<FiltreProfesseurs, number> = { tous: 0, actifs: 0, desactives: 0, accompagner: 0, silencieux: 0 }
  for (const p of professeurs) for (const f of FILTRES_PROFESSEURS) if (correspondFiltre(p, f.id, idMoi, maintenant)) n[f.id]++
  return n
}

/** Minuscules, sans accents ni espaces superflus : « Hélène » se trouve en tapant « helene ». */
export function normaliserRecherche(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('fr').replace(/\s+/g, ' ').trim()
}

/** Recherche sur le nom et l'e-mail ; chaque mot tapé doit se retrouver quelque part. */
export function correspondRecherche(p: Professeur, recherche: string): boolean {
  const mots = normaliserRecherche(recherche).split(' ').filter(Boolean)
  if (mots.length === 0) return true
  const botte = normaliserRecherche(`${p.nom_affiche} ${p.email}`)
  return mots.every((m) => botte.includes(m))
}

/** « M. Hamwi » → « H » (civilité retirée). */
export function initiale(nom: string): string {
  const sans = nom.trim().replace(/^(m\.|mme\.?|mlle\.?|mr\.?|dr\.?|madame|monsieur|mademoiselle)\s+/i, '')
  return (sans[0] ?? '?').toLocaleUpperCase('fr')
}

/** Accord d'après la civilité du nom affiché (« Mme … » → « e ») ; inconnue → « ·e ». */
export function accord(nom: string): { e: string; pronom: string } {
  const t = nom.trim()
  if (/^(mme\.?|mlle\.?|madame|mademoiselle)\s/i.test(t)) return { e: 'e', pronom: 'Elle' }
  if (/^(m\.|mr\.?|monsieur)\s/i.test(t)) return { e: '', pronom: 'Il' }
  return { e: '·e', pronom: 'Il ou elle' }
}

export function pluriel(n: number, singulier: string, plurielTexte = `${singulier}s`): string {
  return `${n} ${n > 1 ? plurielTexte : singulier}`
}

/** Phrase de la fiche d'un professeur « à accompagner » (selon `nombre_ecoles` / `nombre_plans`). */
export function phraseAccompagner(p: Professeur): string {
  const { e } = accord(p.nom_affiche)
  const ecoles = Number(p.nombre_ecoles)
  const suite = ecoles === 0 ? 'pas encore d’école ni d’enregistrement' : `${pluriel(ecoles, 'école renseignée', 'écoles renseignées')}, pas encore d’enregistrement`
  return `Inscrit${e} le ${dateLongue(p.inscrit_le)}, ${suite}.`
}

/* ------------------------------------------------------------------------------------- dates */

function debutDuJour(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Écart en jours de calendrier (heure locale) entre `iso` et maintenant : 0 aujourd'hui, 1 hier. */
export function joursEcoules(iso: string, maintenant = Date.now()): number {
  return Math.round((debutDuJour(new Date(maintenant)) - debutDuJour(new Date(iso))) / JOUR)
}

export function dateCourte(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

export function dateLongue(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function heure(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`
}

/** « aujourd'hui », « hier », « il y a 3 jours », puis « 19 nov. » (« 19 nov. 2025 » une autre année). */
export function connexionRelative(iso: string | null, maintenant = Date.now()): string {
  if (!iso) return 'jamais'
  const j = joursEcoules(iso, maintenant)
  if (j <= 0) return 'aujourd’hui'
  if (j === 1) return 'hier'
  if (j < 7) return `il y a ${j} jours`
  const d = new Date(iso)
  const memeAnnee = d.getFullYear() === new Date(maintenant).getFullYear()
  return d.toLocaleDateString('fr-BE', memeAnnee ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Version détaillée de la fiche : « hier, 21 h 14 », « le 14 octobre 2026, 10 h 05 ». */
export function connexionDetaillee(iso: string | null, maintenant = Date.now()): string {
  if (!iso) return 'jamais connecté'
  const j = joursEcoules(iso, maintenant)
  if (j <= 0) return `aujourd’hui, ${heure(iso)}`
  if (j === 1) return `hier, ${heure(iso)}`
  if (j < 7) return `il y a ${j} jours (${dateLongue(iso)}, ${heure(iso)})`
  return `le ${dateLongue(iso)}, ${heure(iso)}`
}

/** Date locale `AAAA-MM-JJ` dans `n` jours (champ date, raccourcis 7 j / 30 j). */
export function dansJours(n: number, maintenant = Date.now()): string {
  const d = new Date(maintenant)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Libellé de l'état d'un code avec sa date (onglet Codes). */
export function libelleEtatCode(i: Invitation, maintenant = Date.now()): { etat: EtatCode; libelle: string; detail: string } {
  const etat = etatCode(i, maintenant)
  switch (etat) {
    case 'utilise':
      return { etat, libelle: 'utilisé', detail: `le ${dateCourte(i.utilise_le)}` }
    case 'revoque':
      return { etat, libelle: 'révoqué', detail: '' }
    case 'expire':
      return { etat, libelle: 'expiré', detail: `le ${dateCourte(i.expire_le)}` }
    default: {
      if (!i.expire_le) return { etat, libelle: 'en attente', detail: 'sans expiration' }
      const reste = Math.max(0, Math.ceil((new Date(i.expire_le).getTime() - maintenant) / JOUR))
      return { etat, libelle: 'en attente', detail: `jusqu’au ${dateCourte(i.expire_le)} · ${reste <= 1 ? 'dernier jour' : `encore ${reste} jours`}` }
    }
  }
}
