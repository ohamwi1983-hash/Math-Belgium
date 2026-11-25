/**
 * Lecture à voix haute (côté élève, sans compte — planche 08, démo validée `lecture-guidee.html`,
 * onglet 8) : le MOTEUR. Synthèse vocale du navigateur (`speechSynthesis`), en français, rien à
 * installer, **rien n'est envoyé nulle part** ; seuls le choix de la voix et « dire chaque case » sont
 * gardés sur l'appareil (`localStorage`, clé `lecture:voix`) — la vitesse est un réglage du panneau
 * (`reglagesLecture.ts`, clé `vitesse`).
 *
 * Contrat des points d'accroche (inchangé depuis le lot A2) : tout bouton « Écouter » peut appeler
 * `dire(texte)`, qui émet `lecture:dire` (`detail.texte`) ; un code qui ne veut pas importer ce module
 * peut émettre l'événement lui-même. `seTaire()` émet `lecture:taire`. Le lecteur ci-dessous écoute ces
 * événements (sauf s'ils ont été annulés par `preventDefault()`).
 *
 * Lecteur complet : `lire(phrases, options)` — une FILE de phrases, une `SpeechSynthesisUtterance` par
 * phrase (Chrome coupe les textes longs ; la phrase est aussi l'unité de « précédente / suivante » et du
 * surlignage). Chaque phrase peut porter sa place dans la page (`range`, `bloc`) et celle des formules
 * qu'elle contient (`zones` : début / fin dans le texte dit) : le lecteur de la page
 * (`components/lecture/LecteurVoix.tsx`) surligne la phrase et entoure la formule quand le navigateur
 * envoie les événements `boundary` (bonus, jamais une promesse : absents sur une partie des Android).
 * `pause()` arrête la voix et garde la place ; `reprendre()` relit la phrase en cours depuis son début
 * (`speechSynthesis.pause()` est trop irrégulier : Android l'ignore, Chrome reste parfois bloqué).
 * Aucune lecture ne démarre sans un geste de l'élève : seuls les boutons « Écouter » appellent `lire`.
 *
 * Événements émis sur `window` : `lecture:phrase` (`{ index, total, texte, source }`) à chaque phrase,
 * `lecture:fin` (`{ source, raison: 'fin' | 'arret' | 'erreur' }`).
 */

import { useSyncExternalStore } from 'react'
import { abonnerReglages, reglagesCourants } from './reglagesLecture'
import { decouperTexte } from './decoupagePhrases'

export interface DetailDire {
  texte: string
}

/** Une formule dans le texte dit d'une phrase : `a` ≤ position < `b`. */
export interface ZoneFormule {
  el: Element
  a: number
  b: number
}

export interface PhraseVoix {
  /** Français prêt à dire (formules déjà en mots, jamais de LaTeX). */
  texte: string
  /** Place de la phrase dans la page (surlignage, « touche une phrase pour lire à partir d'elle »). */
  range?: Range
  /** Bloc qui contient la phrase (surlignage de secours quand le navigateur n'a pas `CSS.highlights`). */
  bloc?: Element | null
  zones?: ZoneFormule[]
}

export interface EtatLecture {
  id: number
  /** Qui a lancé la lecture (un bouton « Écouter » reconnaît la sienne). */
  source: string
  /** « Étape 3 », « Énoncé », « Aide », « Formule »… (barre de lecture). */
  titre: string
  phrases: PhraseVoix[]
  index: number
  enPause: boolean
  /** Zone où toucher une phrase relance la lecture à partir d'elle (lecture d'une page seulement). */
  zone: Element | null
  /** Formule en cours d'être dite (événements `boundary`), entourée. */
  formule: Element | null
  /** Message clair quand la voix ne peut pas lire (pas de voix française, lecture bloquée…). */
  erreur: string | null
  /** Pas de barre de lecture (une case du tableau de signes : sa phrase est déjà affichée au-dessus). */
  sansBarre: boolean
}

export interface OptionsLecture {
  source?: string
  titre?: string
  depuis?: number
  zone?: Element | null
  sansBarre?: boolean
}

/** Vitesses proposées (barre de lecture et panneau). */
export const VITESSES = [
  { v: '0.75', nom: '0,75 ×' },
  { v: '1', nom: '1 ×' },
  { v: '1.25', nom: '1,25 ×' },
] as const

const MESSAGE_SANS_VOIX = 'Aucune voix française sur cet appareil : la lecture à voix haute n’est pas possible ici. La lecture en mots des formules reste visible (touche une formule, avec « Agrandir les formules au toucher »).'

// ---------------------------------------------------------------------------------------------
// Disponibilité
// ---------------------------------------------------------------------------------------------

/** Synthèse vocale disponible dans ce navigateur (sinon, ne pas montrer les boutons « Écouter »). */
export function voixDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

/** Page pré-rendue (Playwright, `scripts/prerender.mjs`) : aucun bouton « Écouter » ni lecteur. */
export function estPrerendu(): boolean {
  return typeof window !== 'undefined' && !!(window as { __prerendu?: boolean }).__prerendu
}

// ---------------------------------------------------------------------------------------------
// Préférences gardées sur l'appareil (voix choisie, « dire chaque case »)
// ---------------------------------------------------------------------------------------------

const CLE_VOIX = 'lecture:voix'
interface PrefsVoix {
  /** Nom (`SpeechSynthesisVoice.name`) de la voix choisie ; vide = automatique (fr-BE d'abord). */
  voix: string
  /** Tableau de signes : chaque case lue à voix haute. */
  cases: boolean
}

function lirePrefs(): PrefsVoix {
  const p: PrefsVoix = { voix: '', cases: false }
  try {
    const brut: unknown = JSON.parse(localStorage.getItem(CLE_VOIX) || 'null')
    if (brut && typeof brut === 'object') {
      const o = brut as Record<string, unknown>
      if (typeof o.voix === 'string') p.voix = o.voix.slice(0, 200)
      if (o.cases === true) p.cases = true
    }
  } catch {
    // stockage indisponible : réglage par défaut pour cette visite
  }
  return p
}

let prefs: PrefsVoix | null = null
function prefsCourantes(): PrefsVoix {
  if (!prefs) prefs = typeof window === 'undefined' ? { voix: '', cases: false } : lirePrefs()
  return prefs
}
function ecrirePrefs(p: PrefsVoix) {
  prefs = p
  try {
    if (!p.voix && !p.cases) localStorage.removeItem(CLE_VOIX)
    else localStorage.setItem(CLE_VOIX, JSON.stringify(p))
  } catch {
    // rien : vaut pour cette visite
  }
  majInstantVoix()
}

/** Choisit la voix (nom exact), ou `''` pour le choix automatique. */
export function choisirVoix(nom: string) {
  ecrirePrefs({ ...prefsCourantes(), voix: nom })
}

/** Tableau de signes : « Dire chaque case » (gardé sur l'appareil). */
export function changerDireCases(oui: boolean) {
  ecrirePrefs({ ...prefsCourantes(), cases: oui })
}
export function direCasesActif(): boolean {
  return prefsCourantes().cases
}

/** « Revenir au réglage du site » : voix automatique, cases non dites. */
export function oublierPreferencesVoix() {
  ecrirePrefs({ voix: '', cases: false })
}

// ---------------------------------------------------------------------------------------------
// Voix françaises
// ---------------------------------------------------------------------------------------------

function rangVoix(v: SpeechSynthesisVoice): number {
  const l = v.lang.replace('_', '-').toLowerCase()
  return (l === 'fr-be' ? 0 : l === 'fr-fr' ? 1 : 2) + (v.localService ? 0 : 0.5)
}

/** Voix françaises de l'appareil, fr-BE d'abord, puis fr-FR, puis les autres `fr-*` (locales avant). */
export function voixFrancaises(): SpeechSynthesisVoice[] {
  if (!voixDisponible()) return []
  try {
    return window.speechSynthesis
      .getVoices()
      .filter((v) => /^fr\b|^fr[-_]/i.test(v.lang))
      .sort((a, b) => rangVoix(a) - rangVoix(b))
  } catch {
    return []
  }
}

/** Voix utilisée : celle choisie si elle existe encore sur l'appareil, sinon la première française. */
export function voixUtilisee(): SpeechSynthesisVoice | undefined {
  const liste = voixFrancaises()
  const nom = prefsCourantes().voix
  return (nom ? liste.find((v) => v.name === nom) : undefined) ?? liste[0]
}

/** Des voix sont connues, mais aucune n'est française (une liste encore vide ne permet pas de conclure :
 * Chrome la remplit plus tard, iOS parfois jamais avant la première lecture). */
function aucuneVoixFrancaise(): boolean {
  try {
    return window.speechSynthesis.getVoices().length > 0 && voixFrancaises().length === 0
  } catch {
    return false
  }
}

export interface InstantVoix {
  liste: { nom: string; lang: string }[]
  choisie: string
  cases: boolean
}
let instantVoix: InstantVoix = { liste: [], choisie: '', cases: false }
function majInstantVoix() {
  const p = prefsCourantes()
  instantVoix = { liste: voixFrancaises().map((v) => ({ nom: v.name, lang: v.lang })), choisie: p.voix, cases: p.cases }
  emettre()
}

// ---------------------------------------------------------------------------------------------
// Magasin de la lecture
// ---------------------------------------------------------------------------------------------

let etat: EtatLecture | null = null
let compteur = 0
/** Change à chaque phrase lancée / lecture arrêtée : un `onend` d'une ancienne phrase est ignoré. */
let jeton = 0
/** Gardée en mémoire : sur iOS, une phrase libérée par le ramasse-miettes n'envoie jamais `onend`. */
let enCours: SpeechSynthesisUtterance | null = null
/** Phrase en cours (lecture seule : sert à garder la référence vivante). */
export function phraseEnCours(): SpeechSynthesisUtterance | null {
  return enCours
}
const abonnes = new Set<() => void>()

function emettre() {
  abonnes.forEach((f) => f())
}

function changer(partiel: Partial<EtatLecture>) {
  if (!etat) return
  etat = { ...etat, ...partiel }
  emettre()
}

export function etatLecture(): EtatLecture | null {
  return etat
}

export function abonnerLecture(f: () => void): () => void {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

/** Lecture en cours (ou en pause), re-rendu à chaque phrase. */
export function useLecture(): EtatLecture | null {
  return useSyncExternalStore(abonnerLecture, etatLecture, () => null)
}

/** Voix françaises, voix choisie, « dire chaque case » (re-rendu quand la liste arrive). */
export function useVoix(): InstantVoix {
  return useSyncExternalStore(
    abonnerLecture,
    () => instantVoix,
    () => instantVoix,
  )
}

function annoncer(type: string, detail: object) {
  try {
    window.dispatchEvent(new CustomEvent(type, { detail }))
  } catch {
    // rien
  }
}

function couper() {
  jeton++
  enCours = null
  try {
    if (voixDisponible()) window.speechSynthesis.cancel()
  } catch {
    // rien à arrêter
  }
}

function terminer(raison: 'fin' | 'arret' | 'erreur') {
  const e = etat
  couper()
  if (!e) return
  etat = null
  emettre()
  annoncer('lecture:fin', { source: e.source, raison })
}

function echec(message: string) {
  couper()
  if (!etat) return
  const source = etat.source
  // Le message doit se voir, même pour une lecture sans barre.
  changer({ erreur: message, enPause: true, formule: null, sansBarre: false })
  annoncer('lecture:fin', { source, raison: 'erreur' })
}

/** Formule seule de la phrase (la phrase n'est que cette formule) : entourée même sans `boundary`. */
function formuleSeule(p: PhraseVoix): Element | null {
  const z = p.zones
  if (!z || z.length !== 1) return null
  return z[0].a <= 1 && z[0].b >= p.texte.replace(/[.,;:!?…\s]+$/u, '').length - 1 ? z[0].el : null
}

function parler() {
  const e = etat
  if (!e || !voixDisponible()) return
  const p = e.phrases[e.index]
  if (!p) return terminer('fin')
  // Page changée sous la lecture (bloc retiré du document) : arrêt propre.
  if (p.bloc && !p.bloc.isConnected) return terminer('arret')
  couper()
  const mon = jeton
  const s = window.speechSynthesis
  const u = new SpeechSynthesisUtterance(p.texte)
  const v = voixUtilisee()
  u.lang = v?.lang ?? 'fr-BE'
  if (v) u.voice = v
  u.rate = Number(reglagesCourants().vitesse) || 1
  u.onend = () => {
    if (mon !== jeton || !etat) return
    if (etat.index + 1 >= etat.phrases.length) return terminer('fin')
    changer({ index: etat.index + 1, formule: null })
    lancerPhrase()
  }
  u.onerror = (ev: SpeechSynthesisErrorEvent) => {
    if (mon !== jeton) return
    if (ev.error === 'interrupted' || ev.error === 'canceled') return
    if (ev.error === 'not-allowed') return echec('Le navigateur a bloqué la voix : touche à nouveau « Écouter ».')
    echec('La voix de l’appareil n’a pas pu lire ce texte (sans connexion, certaines voix manquent). La lecture en mots reste visible avec la loupe des formules.')
  }
  u.onboundary = (ev: SpeechSynthesisEvent) => {
    if (mon !== jeton || !etat || (ev.name && ev.name !== 'word')) return
    const z = p.zones?.find((x) => ev.charIndex >= x.a && ev.charIndex < x.b)
    const f = z?.el ?? formuleSeule(p)
    if (f !== etat.formule) changer({ formule: f })
  }
  enCours = u
  // Chrome avale parfois un `speak()` qui suit immédiatement un `cancel()` : léger délai.
  window.setTimeout(() => {
    if (mon !== jeton) return
    try {
      s.speak(u)
    } catch {
      echec('La voix de l’appareil ne répond pas. La lecture en mots reste visible avec la loupe des formules.')
    }
  }, 40)
}

function lancerPhrase() {
  const e = etat
  if (!e) return
  const p = e.phrases[e.index]
  changer({ formule: p ? formuleSeule(p) : null })
  annoncer('lecture:phrase', { index: e.index, total: e.phrases.length, texte: p?.texte ?? '', source: e.source })
  parler()
}

/**
 * Lit une file de phrases (geste de l'élève seulement). Remplace la lecture en cours. `depuis` : indice
 * de la première phrase lue. Sans voix française sur l'appareil : message clair, rien n'est lu.
 */
export function lire(phrases: PhraseVoix[], options: OptionsLecture = {}) {
  if (!voixDisponible()) return
  const liste = phrases.filter((p) => /[\p{L}\p{N}]/u.test(p.texte))
  if (liste.length === 0) return
  couper()
  etat = {
    id: ++compteur,
    source: options.source ?? 'dire',
    titre: options.titre ?? '',
    phrases: liste,
    index: Math.max(0, Math.min(liste.length - 1, options.depuis ?? 0)),
    enPause: false,
    zone: options.zone ?? null,
    formule: null,
    erreur: null,
    sansBarre: !!options.sansBarre,
  }
  emettre()
  if (aucuneVoixFrancaise()) return echec(MESSAGE_SANS_VOIX)
  lancerPhrase()
}

/** Lit un texte brut, découpé en phrases (formules déjà en mots). */
export function lireTexte(texte: string, options: OptionsLecture = {}) {
  lire(
    decouperTexte(texte).map((t) => ({ texte: t })),
    options,
  )
}

export function pause() {
  if (!etat || etat.enPause) return
  couper()
  changer({ enPause: true, formule: null })
}

export function reprendre() {
  if (!etat || etat.erreur) return
  changer({ enPause: false })
  lancerPhrase()
}

export function basculerPause() {
  if (etat?.enPause) reprendre()
  else pause()
}

/** Va à la phrase `i` et la lit (même depuis la pause). */
export function allerAPhrase(i: number) {
  if (!etat || etat.erreur) return
  const j = Math.max(0, Math.min(etat.phrases.length - 1, i))
  changer({ index: j, enPause: false })
  lancerPhrase()
}

export function phraseSuivante() {
  if (etat && etat.index + 1 < etat.phrases.length) allerAPhrase(etat.index + 1)
}

export function phrasePrecedente() {
  if (etat) allerAPhrase(etat.index - 1)
}

/** Arrête la lecture (et ferme la barre). */
export function arreter() {
  terminer('arret')
}

// ---------------------------------------------------------------------------------------------
// Points d'accroche « Écouter » (contrat du lot A2)
// ---------------------------------------------------------------------------------------------

/** Demande la lecture à voix haute de `texte` (événement `lecture:dire`). */
export function dire(texte: string) {
  if (typeof window === 'undefined' || !texte.trim()) return
  window.dispatchEvent(new CustomEvent<DetailDire>('lecture:dire', { detail: { texte }, cancelable: true }))
}

/** Arrête la lecture en cours (événement `lecture:taire`). */
export function seTaire() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('lecture:taire', { cancelable: true }))
}

/** Texte à dire pour un morceau de page : le texte visible, chaque formule remplacée par sa lecture en
 * mots (`aria-label` des formules, posé par `Math.tsx` / `KatexAccessible.tsx` / `katexAccessible.ts`),
 * sans ce qui est caché aux lecteurs d'écran (`aria-hidden`, `hidden`) ni les boutons. Pour une lecture
 * phrase par phrase avec surlignage, voir `lib/phrasesPage.ts::phrasesDe`. */
export function texteParleDe(racine: Element): string {
  let t = ''
  const marcher = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      t += n.textContent ?? ''
      return
    }
    if (!(n instanceof Element)) return
    if (n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('hidden') || n.matches('button, script, style')) return
    const lu = n.getAttribute('role') === 'img' ? n.getAttribute('aria-label') : null
    if (lu) {
      t += ` ${lu} `
      return
    }
    // Une étiquette de bloc (« isoler r ») se lit comme une phrase à part.
    const bloc = /^(P|DIV|LI|H\d|SPAN)$/.test(n.tagName) && n.classList.contains('pas-tag')
    n.childNodes.forEach(marcher)
    if (bloc || /^(P|DIV|LI|H\d)$/.test(n.tagName)) t += '. '
  }
  marcher(racine)
  return t
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.:;!?])(\s*\.)+/g, '$1')
    .replace(/^[\s.]+|[\s.]+$/g, '')
}

if (typeof window !== 'undefined') {
  window.addEventListener('lecture:dire', (e) => {
    const ev = e as CustomEvent<DetailDire>
    if (ev.defaultPrevented) return
    lireTexte(ev.detail?.texte ?? '', { source: 'dire' })
  })
  window.addEventListener('lecture:taire', (e) => {
    if (e.defaultPrevented) return
    arreter()
  })
  // Quitter la page (onglet fermé, navigation hors du site) : la voix s'arrête.
  window.addEventListener('pagehide', () => arreter())
  // Vitesse changée pendant la lecture : la phrase en cours reprend à la nouvelle vitesse.
  let vitesse = reglagesCourants().vitesse
  abonnerReglages(() => {
    const v = reglagesCourants().vitesse
    if (v === vitesse) return
    vitesse = v
    if (etat && !etat.enPause && !etat.erreur) lancerPhrase()
  })
  window.addEventListener('storage', (e) => {
    if (e.key !== CLE_VOIX && e.key !== null) return
    prefs = lirePrefs()
    majInstantVoix()
  })
  if (voixDisponible()) {
    try {
      window.speechSynthesis.addEventListener?.('voiceschanged', majInstantVoix)
    } catch {
      // ancien navigateur : la liste est relue à l'ouverture du panneau
    }
    majInstantVoix()
  }
}

/** Relit la liste des voix (ouverture du panneau : certains navigateurs ne signalent rien). */
export function rafraichirVoix() {
  majInstantVoix()
}
