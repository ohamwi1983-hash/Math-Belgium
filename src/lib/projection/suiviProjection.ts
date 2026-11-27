/**
 * Repères LOCAUX de la matière vue proposée en fin de projection (rien n'est envoyé : tout reste dans ce
 * navigateur, try/catch partout ; voir `matiereProjetee.ts` pour la logique).
 * - Suivi d'UNE séance de projection (`sessionStorage`, par onglet : survit au rechargement de la page,
 *   oublié en quittant la projection) : diapos atteintes, générateurs ouverts, début.
 * - Propositions gardées pour plus tard (« Plus tard », onglet fermé sans répondre) : `localStorage`
 *   `espace:matiere-a-noter`, lues par « Aujourd'hui » et le tableau de bord.
 * - Deux écrans : la fenêtre des diapos signale les générateurs qu'on y ouvre à la vue du professeur
 *   (canal `BroadcastChannel` propre au chapitre).
 */
import { avecProposition, lirePropositions, type PropositionMatiere } from './matiereProjetee'

export interface SuiviProjection {
  id: string
  debut: number
  vues: string[]
  generateurs: string[]
  /** Matière déjà enregistrée dans Mes classes pendant cette séance de projection (plus rien à proposer). */
  enregistre: boolean
}

const cleSuivi = (niveau: string, slug: string) => `projection-suivi:${niveau}/${slug}`
export const CLE_PROPOSITIONS = 'espace:matiere-a-noter'
/** Événement de fenêtre émis quand la liste gardée change (cartes « Matière vue à noter »). */
export const EVENEMENT_PROPOSITIONS = 'matiere-a-noter'

function nouvelId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  }
}

/** Suivi en cours de cet onglet pour ce chapitre, ou un nouveau (commencé maintenant). */
export function lireSuivi(niveau: string, slug: string): SuiviProjection {
  try {
    const brut = JSON.parse(sessionStorage.getItem(cleSuivi(niveau, slug)) ?? 'null') as Partial<SuiviProjection> | null
    if (brut && typeof brut.id === 'string' && typeof brut.debut === 'number' && Array.isArray(brut.vues) && Array.isArray(brut.generateurs))
      return { id: brut.id, debut: brut.debut, vues: brut.vues.filter((v) => typeof v === 'string'), generateurs: brut.generateurs.filter((v) => typeof v === 'string'), enregistre: brut.enregistre === true }
  } catch {
    /* stockage indisponible : suivi en mémoire seulement */
  }
  return { id: nouvelId(), debut: Date.now(), vues: [], generateurs: [], enregistre: false }
}

export function ecrireSuivi(niveau: string, slug: string, s: SuiviProjection): void {
  try {
    sessionStorage.setItem(cleSuivi(niveau, slug), JSON.stringify(s))
  } catch {
    /* rien */
  }
}

export function oublierSuivi(niveau: string, slug: string): void {
  try {
    sessionStorage.removeItem(cleSuivi(niveau, slug))
  } catch {
    /* rien */
  }
}

export const canalSuivi = (niveau: string, slug: string) => `math-belgium-projection-suivi:${niveau}/${slug}`

/* ------------------------------------------------------------------------------- propositions gardées */

export function lirePropositionsGardees(maintenant = Date.now()): PropositionMatiere[] {
  try {
    return lirePropositions(JSON.parse(localStorage.getItem(CLE_PROPOSITIONS) ?? 'null'), maintenant)
  } catch {
    return []
  }
}

function ecrire(liste: PropositionMatiere[]): void {
  try {
    if (liste.length === 0) localStorage.removeItem(CLE_PROPOSITIONS)
    else localStorage.setItem(CLE_PROPOSITIONS, JSON.stringify(liste))
  } catch {
    /* rien */
  }
  try {
    window.dispatchEvent(new Event(EVENEMENT_PROPOSITIONS))
  } catch {
    /* rien */
  }
}

/** Garde (ou remplace, même id) une proposition pour plus tard. */
export function garderProposition(p: PropositionMatiere): void {
  ecrire(avecProposition(lirePropositionsGardees(), p))
}

export function retirerProposition(id: string): void {
  const liste = lirePropositionsGardees()
  if (liste.some((p) => p.id === id)) ecrire(liste.filter((p) => p.id !== id))
}
