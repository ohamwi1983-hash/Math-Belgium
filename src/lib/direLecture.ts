/**
 * Point d'accroche « Écouter » (côté élève, lot G — la lecture à voix haute complète est un lot à part).
 *
 * Un bouton « Écouter » appelle `dire({ texte, source, element })` : l'événement `lecture:dire`
 * (`CustomEvent<DetailDire>`, annulable, qui bouillonne depuis `element`, sinon émis sur `document`) est
 * envoyé AVANT toute parole. Le module de voix (lot suivant) l'écoute sur `document` et appelle
 * `preventDefault()` pour prendre la main (sa voix, son lecteur, son surlignage). Si personne ne l'a pris,
 * repli minimal : `speechSynthesis` du navigateur, voix française (`fr-BE` puis tout `fr-*`), rien
 * d'envoyé, rien d'installé. Sans `speechSynthesis` : `voixDisponible()` vaut `false` et le bouton n'est
 * pas affiché.
 *
 * `texte` est déjà « lisible à l'oreille » : `texteLisible(el)` remplace chaque formule par sa lecture en
 * mots (`aria-label` posé par `KatexAccessible` / `lectureFormules.ts`) et ignore ce qui est masqué aux
 * lecteurs d'écran (`aria-hidden`).
 */

export const EVENEMENT_DIRE = 'lecture:dire'

export interface DetailDire {
  /** Texte à dire, formules déjà en mots. */
  texte: string
  /** D'où vient la demande (ex. `corrige-ligne`). */
  source: string
  /** Élément lu (pour le surligner, s'il le faut). */
  element?: Element
}

export function voixDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

/** Texte « à l'oreille » d'un morceau de page : formules lues en mots, rien de ce qui est caché. */
export function texteLisible(racine: Element): string {
  const morceaux: string[] = []
  const parcourir = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      morceaux.push(n.textContent ?? '')
      return
    }
    if (!(n instanceof Element)) return
    if (n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('hidden')) return
    const etiquette = n.getAttribute('aria-label')
    if (etiquette && n.getAttribute('role') === 'img') {
      morceaux.push(` ${etiquette} `)
      return
    }
    n.childNodes.forEach(parcourir)
  }
  parcourir(racine)
  return morceaux.join('').replace(/\s+/g, ' ').trim()
}

/** Demande de dire un texte : `true` si quelqu'un parle (module de voix ou repli du navigateur). */
export function dire(detail: DetailDire): boolean {
  if (typeof document === 'undefined') return false
  const evenement = new CustomEvent<DetailDire>(EVENEMENT_DIRE, { detail, bubbles: true, cancelable: true })
  const pris = !(detail.element ?? document).dispatchEvent(evenement)
  if (pris) return true
  if (!voixDisponible() || detail.texte.trim() === '') return false
  try {
    const synthese = window.speechSynthesis
    synthese.cancel()
    const enonce = new SpeechSynthesisUtterance(detail.texte)
    const voix = synthese.getVoices()
    enonce.lang = 'fr-BE'
    enonce.voice = voix.find((v) => v.lang === 'fr-BE') ?? voix.find((v) => v.lang.toLowerCase().startsWith('fr')) ?? null
    if (enonce.voice) enonce.lang = enonce.voice.lang
    synthese.speak(enonce)
    return true
  } catch {
    return false
  }
}
