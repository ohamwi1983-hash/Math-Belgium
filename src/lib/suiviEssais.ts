import type { EtatPuceProgression } from '../entrainement/components/ProgressionPuces'

/**
 * « Mon suivi » (planche 13) : résultats des générateurs, gardés dans CE navigateur seulement
 * (`localStorage`, clé versionnée `suivi:essais:v1`). Rien n'est jamais envoyé : aucune requête,
 * aucun compte, aucun nom. Chaque accès est protégé (navigation privée, stockage bloqué ou plein) :
 * sans stockage, rien n'est retenu et les pages restent utilisables.
 *
 * Un essai = un exercice TERMINÉ d'un générateur (tous ses écrans clos), avec le résultat de chaque
 * écran, comme les puces de progression : « o » juste du premier coup, « a » juste avec l'aide,
 * « r » réponse révélée (écran raté). Les écrans « sans objet » ne sont pas gardés.
 *
 * Point de passage commun : le magasin du cadre de la page de générateur (`cadreGenerateur.ts`), où
 * `ProgressionPuces` publie ses segments — `observerProgression` y repère le moment où tous les écrans
 * sont clos (voir `EntrainementPage`). Les générateurs sans puces (quiz vrai/faux, gen40) appellent
 * `useNoterEssai()` (`suiviContexte.ts`) eux-mêmes.
 *
 * Taille bornée : 30 derniers essais par générateur, 1 500 au total (≈ 60 Ko) ; au-delà, les plus
 * anciens partent. Stockage plein : on purge la moitié la plus ancienne et on réessaie une fois.
 */

export type ResultatEcran = 'o' | 'a' | 'r'
export type VerdictEssai = 'reussi' | 'aide' | 'rate'

export interface Essai {
  /** `Date.now()` de la fin de l'exercice. */
  t: number
  /** Résultat par écran, dans l'ordre (« o », « a », « r »). */
  e: string
  /** Variante (thème) quand le générateur la connaît. */
  v?: string
}

export const CLE_ESSAIS = 'suivi:essais:v1'
export const ESSAIS_PAR_GENERATEUR = 30
export const ESSAIS_MAX = 1500

type Stock = Record<string, Essai[]>

const RE_ECRANS = /^[oar]{1,40}$/

function valide(x: unknown): x is Essai {
  if (!x || typeof x !== 'object') return false
  const e = x as Partial<Essai>
  return typeof e.t === 'number' && Number.isFinite(e.t) && typeof e.e === 'string' && RE_ECRANS.test(e.e) && (e.v === undefined || typeof e.v === 'string')
}

/** Tous les essais gardés, par générateur, du plus ancien au plus récent (entrées malformées ignorées). */
export function lireEssais(): Stock {
  let brut: string | null = null
  try {
    brut = window.localStorage.getItem(CLE_ESSAIS)
  } catch {
    return {}
  }
  if (!brut) return {}
  let v: unknown
  try {
    v = JSON.parse(brut)
  } catch {
    return {}
  }
  const res: Stock = {}
  const g = v && typeof v === 'object' ? (v as { g?: unknown }).g : null
  if (!g || typeof g !== 'object' || Array.isArray(g)) return {}
  for (const [id, liste] of Object.entries(g as Record<string, unknown>)) {
    if (!Array.isArray(liste)) continue
    const ok = liste.filter(valide).sort((a, b) => a.t - b.t)
    if (ok.length) res[id] = ok
  }
  return res
}

function ecrire(stock: Stock): boolean {
  try {
    window.localStorage.setItem(CLE_ESSAIS, JSON.stringify({ v: 1, g: stock }))
    return true
  } catch {
    return false
  }
}

/** Garde au plus `max` essais au total, en retirant les plus anciens (tous générateurs confondus). */
function plafonner(stock: Stock, max: number): Stock {
  const tous = Object.entries(stock).flatMap(([id, l]) => l.map((e) => ({ id, e })))
  if (tous.length <= max) return stock
  tous.sort((a, b) => b.e.t - a.e.t)
  const res: Stock = {}
  for (const { id, e } of tous.slice(0, max)) (res[id] ??= []).push(e)
  for (const l of Object.values(res)) l.sort((a, b) => a.t - b.t)
  return res
}

const ECRAN: Partial<Record<EtatPuceProgression, ResultatEcran>> = { correcte: 'o', aide: 'a', revele: 'r' }

/** Résultats d'écran à partir des puces de progression (« sans objet » ignoré ; courant / à venir aussi). */
export function ecransDepuisPuces(segments: readonly EtatPuceProgression[]): string {
  return segments.map((s) => ECRAN[s] ?? '').join('')
}

/** Garde un exercice terminé. Sans écran gardé (que des « sans objet ») : rien. */
export function noterEssai(generateur: string, ecrans: string, variante?: string, quand: number = Date.now()): void {
  if (!generateur || !RE_ECRANS.test(ecrans)) return
  const stock = lireEssais()
  const liste = [...(stock[generateur] ?? []), { t: quand, e: ecrans, ...(variante ? { v: variante.slice(0, 60) } : {}) }]
  stock[generateur] = liste.slice(-ESSAIS_PAR_GENERATEUR)
  let aEcrire = plafonner(stock, ESSAIS_MAX)
  if (ecrire(aEcrire)) return signaler()
  // Stockage plein : la moitié la plus ancienne part, puis un seul nouvel essai.
  const n = Object.values(aEcrire).reduce((s, l) => s + l.length, 0)
  aEcrire = plafonner(aEcrire, Math.max(1, Math.floor(n / 2)))
  if (ecrire(aEcrire)) signaler()
}

export function effacerEssais(): void {
  try {
    window.localStorage.removeItem(CLE_ESSAIS)
  } catch {
    // Stockage indisponible : rien n'était gardé.
  }
  signaler()
}

/** Événement local (même onglet) : une page ouverte peut se relire. Rien ne sort du navigateur. */
export const EVENEMENT_SUIVI = 'suivi:modifie'
function signaler() {
  try {
    window.dispatchEvent(new Event(EVENEMENT_SUIVI))
  } catch {
    // Pas de fenêtre (pré-rendu, tests) : rien à prévenir.
  }
}

export function verdict(ecrans: string): VerdictEssai {
  return ecrans.includes('r') ? 'rate' : ecrans.includes('a') ? 'aide' : 'reussi'
}

export interface ObservateurProgression {
  /** Segments publiés par `ProgressionPuces` (magasin du cadre), à chaque changement. */
  segments: (segments: readonly EtatPuceProgression[] | null) => void
  /** L'élève a touché un bouton « Aide » de l'écran en cours. */
  aide: () => void
  /** `ValidationEcran` vient d'apparaître : l'écran en cours est clos (révélé ou juste). */
  verdict: (revele: boolean) => void
}

const estClos = (s: EtatPuceProgression) => s === 'correcte' || s === 'aide' || s === 'revele' || s === 'sans-objet'

/**
 * Repère la fin d'un exercice et note UN essai :
 * - tous les segments publiés sont clos (générateurs qui closent le dernier écran avant « Nouvel
 *   exercice ») ;
 * - ou bien `ValidationEcran` apparaît alors que le SEUL segment non clos est l'écran en cours et qu'il
 *   est le dernier : la plupart des générateurs gardent ce dernier écran « en cours » jusqu'au clic sur
 *   « Nouvel exercice », qui repart aussitôt sur un nouvel exercice. Son résultat vient alors du verdict
 *   (révélé ou juste) et d'un clic sur « Aide » pendant cet écran.
 * Le suivant est noté dès qu'un nouvel exercice a recommencé (un écran de nouveau en cours ou à venir
 * après une note). Un retrait des puces (démontage) ne remet rien à zéro : jamais deux notes pour un
 * même exercice.
 */
export function observerProgression(noter: (ecrans: string) => void): ObservateurProgression {
  let dejaNote = false
  let courant: readonly EtatPuceProgression[] | null = null
  let indexCourant = -1
  let aideCourante = false
  return {
    segments(segments) {
      if (!segments || segments.length === 0) return
      const i = segments.indexOf('courante')
      if (i !== indexCourant || !courant || segments.length !== courant.length) aideCourante = false
      indexCourant = i
      courant = segments
      if (!segments.every(estClos)) {
        // Encore un écran à faire : un nouvel exercice a commencé si rien n'est clos avant l'écran en cours
        // ou si l'écran en cours a avancé — dans tous les cas, l'exercice précédent est derrière nous.
        if (dejaNote && !(segments.filter((s) => !estClos(s)).length === 1 && i === segments.length - 1)) dejaNote = false
        return
      }
      if (dejaNote) return
      dejaNote = true
      const ecrans = ecransDepuisPuces(segments)
      if (ecrans) noter(ecrans)
    },
    aide() {
      aideCourante = true
    },
    verdict(revele) {
      const dernier = revele ? 'r' : aideCourante ? 'a' : 'o'
      // Générateur sans puces publiées (un seul écran) : chaque écran clos est un exercice.
      if (!courant) {
        noter(dernier)
        aideCourante = false
        return
      }
      const i = courant.indexOf('courante')
      if (i !== courant.length - 1 || !courant.slice(0, i).every(estClos)) return
      // Un seul écran : les puces d'un nouvel exercice sont identiques ([courante]), rien ne les « remet » ;
      // chaque verdict compte.
      if (dejaNote && courant.length > 1) return
      dejaNote = true
      noter(ecransDepuisPuces(courant.slice(0, i)) + dernier)
      if (courant.length === 1) aideCourante = false
    },
  }
}
