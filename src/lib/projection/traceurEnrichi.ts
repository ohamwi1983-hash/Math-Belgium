/**
 * Traceur enrichi de l'écran blanc « repère » (mode projection, planche P3 du 28/11/2026), PUR (aucun React) :
 * - PARAMÈTRES : toute lettre autre que x (a, k, m…) devient un curseur (valeur de départ 1), animable d'un bout à
 *   l'autre et retour (≈ 6 s) ; l'animation est une donnée (`debut`) : chaque fenêtre calcule la même valeur au même
 *   instant (deux écrans en même temps), rien n'est diffusé image par image ; « laisser une trace » = la famille ;
 * - TANGENTE en un point (dérivée numérique, équation exacte quand elle est simple, sinon « ≈ » à 0,01 près) ;
 * - AIRE entre deux bornes (Simpson ; valeur exacte reconnue — fraction, multiple de π, racine — et valeur approchée ;
 *   une partie sous l'axe compte négativement, le panneau le dit) ;
 * - POINTS, VECTEURS, SEGMENTS, DROITES placés par leurs coordonnées (saisie libre jamais bloquée).
 * Tout est un ÉLÉMENT de la page (des nombres, jamais des pixels) : zoom net, annuler, deux écrans, export, conservation.
 */
import { analyser, decouper, enLatex, evaluer, ErreurCalcul, formaterDecimal, formeExacte, nettoyer } from './calculatrice'
import type { ModeAngle, Noeud } from './calculatrice'
import { latexCoordonnees, sansPrefixe, traceMemorise, versPxX, versPxY, xMax, xMin } from './traceur'
import type { Fonction, Repere } from './traceur'
import type { Courbe, ElementAnnotation, PageBlanche } from './annotations'
import { repereVue } from './vue'

export interface Parametre {
  v: number
  min: number
  max: number
  pas: number
}

/** Point placé par ses coordonnées (déplaçable au doigt, accroché aux nœuds de la grille). */
export interface PointRepere {
  genre: 'point'
  id: string
  nom: string
  x: number
  y: number
  couleur: string
}

/** Vecteur, segment ou droite entre deux points NOMMÉS (ils suivent les points déplacés). */
export interface Liaison {
  genre: 'liaison'
  id: string
  sorte: 'vecteur' | 'segment' | 'droite'
  a: string
  b: string
  couleur: string
}

/** Tangente à une courbe de la page en l'abscisse x. */
export interface Tangente {
  genre: 'tangente'
  id: string
  courbe: string
  x: number
  triangle: boolean
  couleur: string
}

/** Aire sous une courbe entre a et b. */
export interface Aire {
  genre: 'aire'
  id: string
  courbe: string
  a: number
  b: number
  integrale: boolean
}

export const COULEUR_TANGENTE = '#b23a3a'
export const COULEUR_AIRE = '#e0913f'
export const COULEURS_POINTS = ['#1d52a8', '#2f7a4f', '#7a3c11', '#182430']
export const COULEURS_LIAISONS: Record<Liaison['sorte'], string> = { vecteur: '#b23a3a', segment: '#33434f', droite: '#2f7a4f' }

// ---------- paramètres ----------

export const PARAMETRE_DEFAUT: Parametre = { v: 1, min: -5, max: 5, pas: 0.5 }
/** Durée d'un aller-retour de l'animation (ms). */
export const PERIODE_ANIMATION = 6000

/** Lettres-paramètres d'une saisie, dans l'ordre d'apparition (« a(x − 2)² + k » → a, k). */
export function parametresDe(saisie: string): string[] {
  try {
    const noms: string[] = []
    for (const j of decouper(sansPrefixe(saisie), { variable: true, parametres: true })) if (j.t === 'param' && !noms.includes(j.v)) noms.push(j.v)
    return noms
  } catch {
    return []
  }
}

export function valeurAnimee(p: Parametre, debut: number, maintenant: number): number {
  const phase = ((((maintenant - debut) % PERIODE_ANIMATION) + PERIODE_ANIMATION) % PERIODE_ANIMATION) / PERIODE_ANIMATION
  const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2
  return p.min + (p.max - p.min) * tri
}

/** Début d'animation pour que la lettre parte de sa valeur actuelle (en montant) : aucun saut au départ. */
export function debutAnimation(p: Parametre, maintenant: number): number {
  const t = p.max > p.min ? Math.max(0, Math.min(1, (p.v - p.min) / (p.max - p.min))) : 0
  return maintenant - (t / 2) * PERIODE_ANIMATION
}

export const estAnimee = (c: Courbe) => !!c.animation && !!c.params?.[c.animation.nom]

/** Valeurs des paramètres d'une courbe à l'instant `maintenant` (animation comprise) ; undefined sans paramètre. */
export function valeursCourbe(c: Courbe, maintenant = Date.now()): Record<string, number> | undefined {
  if (!c.params || Object.keys(c.params).length === 0) return undefined
  const res: Record<string, number> = {}
  for (const [k, p] of Object.entries(c.params)) res[k] = c.animation?.nom === k ? valeurAnimee(p, c.animation.debut, maintenant) : p.v
  return res
}

/** Valeur posée sur un cran du curseur (min + n × pas). */
export function surCran(v: number, p: Parametre): number {
  const n = Math.round((v - p.min) / p.pas)
  return nettoyer(Math.max(p.min, Math.min(p.max, p.min + n * p.pas)))
}

const decimalesDe = (pas: number) => {
  const t = String(pas)
  return t.includes('e-') ? Number(t.split('e-')[1]) : (t.split('.')[1] ?? '').length
}

/** « 1,5 », « −1 » : décimales du pas, virgule, vrai signe moins. */
export function texteParametre(v: number, pas: number, plus = 0): string {
  const d = Math.min(6, decimalesDe(pas) + plus)
  const r = Number(v.toFixed(d))
  return String(r === 0 ? 0 : r).replace('.', ',').replace('-', '−')
}

/** LaTeX d'un nombre décimal court (« 1{,}5 », « -2 »). */
function nombreCourt(v: number): string {
  return formaterDecimal(nettoyer(v)).latex
}

/** Expression avec les paramètres remplacés par leurs valeurs, écrite proprement : 1(x − 2)² → (x − 2)², + −1 → − 1. */
function substituer(n: Noeud, valeurs: Record<string, number>): Noeud {
  const s = (m: Noeud) => substituer(m, valeurs)
  const nb = (v: number): Noeud => {
    const w = Math.round(v * 1e6) / 1e6
    return w < 0 ? { t: 'neg', a: { t: 'nb', v: -w, src: String(-w) } } : { t: 'nb', v: w, src: String(w) }
  }
  const estNb = (m: Noeud, v?: number) => m.t === 'nb' && (v === undefined || m.v === v)
  const estNeg = (m: Noeud) => m.t === 'neg'
  switch (n.t) {
    case 'param':
      return nb(valeurs[n.nom] ?? 1)
    case 'par':
      return { t: 'par', a: s(n.a) }
    case 'neg':
      return { t: 'neg', a: s(n.a) }
    case 'pow':
      return { t: 'pow', a: s(n.a), b: s(n.b) }
    case 'fn':
      return { t: 'fn', nom: n.nom, a: s(n.a) }
    case 'bin': {
      const a = s(n.a)
      let b = s(n.b)
      if (n.op === 'implicite' || n.op === '*') {
        if (estNb(a, 0) || estNb(b, 0)) return { t: 'nb', v: 0, src: '0' }
        if (estNb(a, 1) && b.t !== 'nb') return b
        if (a.t === 'neg' && estNb(a.a, 1) && b.t !== 'nb') return { t: 'neg', a: b }
        if (a.t === 'neg') return { t: 'neg', a: { ...n, a: a.a, b } as Noeud }
        if (estNeg(b)) b = { t: 'par', a: b }
        if (a.t === 'nb' && b.t === 'nb') return { t: 'bin', op: '*', a, b }
        return { t: 'bin', op: n.op, a, b }
      }
      if (n.op === '+' || n.op === '-') {
        if (estNb(b, 0)) return a
        if (estNb(a, 0)) return n.op === '+' ? b : { t: 'neg', a: b }
        if (b.t === 'neg') return { t: 'bin', op: n.op === '+' ? '-' : '+', a, b: b.a }
        return { t: 'bin', op: n.op, a, b }
      }
      return { t: 'bin', op: n.op, a, b }
    }
    default:
      return n
  }
}

/** « 1,5(x − 2)² − 1 » : la courbe du moment, paramètres remplacés (virgule décimale, « − » typographique). */
export function latexSubstitue(saisie: string, mode: ModeAngle, valeurs: Record<string, number>): string | null {
  try {
    return enLatex(substituer(analyser(sansPrefixe(saisie), { variable: true, parametres: true }), valeurs), mode, { fractions: true })
  } catch {
    return null
  }
}

// Traces de la famille parcourue pendant une animation (locales à la fenêtre ; gardées dans la courbe à l'arrêt).
const passages = new Map<string, Map<string, Record<string, number>>>()

function cleValeurs(v: Record<string, number>) {
  return Object.entries(v)
    .map(([k, x]) => `${k}=${x}`)
    .join(',')
}

function noterPassage(c: Courbe, valeurs: Record<string, number>) {
  if (!c.animation || !c.params) return
  const p = c.params[c.animation.nom]
  const v = { ...valeurs, [c.animation.nom]: surCran(valeurs[c.animation.nom], p) }
  let m = passages.get(c.id)
  if (!m) passages.set(c.id, (m = new Map()))
  m.set(cleValeurs(v), v)
}

/** Courbes passées pendant l'animation (pour les garder dans la courbe à l'arrêt), puis oubliées ici. */
export function prendrePassages(id: string): Record<string, number>[] {
  const m = passages.get(id)
  passages.delete(id)
  return m ? [...m.values()] : []
}

/** Ajoute des valeurs aux traces d'une courbe (sans doublon, 80 au plus). */
export function avecTraces(c: Courbe, ajout: Record<string, number>[]): Record<string, number>[] {
  const m = new Map((c.traces ?? []).map((v) => [cleValeurs(v), v]))
  for (const v of ajout) m.set(cleValeurs(v), v)
  return [...m.values()].slice(-80)
}

// ---------- reconnaissance d'une valeur exacte (tolérance d'un calcul numérique) ----------

const pgcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : pgcd(b, a % b))

/** Forme exacte d'une valeur calculée numériquement (à `tol` près) : entier, décimal court, fraction, multiple de π, racine. */
export function reconnaitre(v: number, tol = 1e-8): string | null {
  if (!Number.isFinite(v)) return null
  const e = tol * Math.max(1, Math.abs(v))
  const signe = v < 0 ? '-' : ''
  const a = Math.abs(v)
  if (Math.abs(a - Math.round(a)) < e) return Math.round(a) === 0 ? '0' : `${signe}${Math.round(a)}`
  for (const q of [10, 100, 1000]) if (Math.abs(a * q - Math.round(a * q)) < e * q) return `${signe}${nombreCourt(Math.round(a * q) / q)}`
  for (let q = 2; q <= 60; q++) {
    const p = Math.round(a * q)
    if (p > 0 && pgcd(p, q) === 1 && Math.abs(a - p / q) < e) return `${signe}\\frac{${p}}{${q}}`
  }
  for (let q = 1; q <= 12; q++) {
    const p = Math.round((a * q) / Math.PI)
    if (p > 0 && pgcd(p, q) === 1 && Math.abs(a - (p * Math.PI) / q) < e) return `${signe}${q === 1 ? `${p === 1 ? '' : p}\\pi` : `\\frac{${p === 1 ? '' : p}\\pi}{${q}}`}`
  }
  for (let q = 1; q <= 60; q++) {
    const p = Math.round(a * a * q)
    if (p > 0 && Math.abs(a * a - p / q) < 2 * a * e) {
      const f = formeExacte(Math.sqrt(p / q))
      if (f && f.includes('\\sqrt')) return `${signe}${f}`
    }
  }
  return null
}

const approx = (v: number) => {
  const w = Math.round(v * 100) / 100
  return formaterDecimal(w === 0 ? 0 : w).latex
}

// ---------- tangente ----------

export type ResultatTangente =
  | { ok: true; x0: number; y0: number; m: number; latexEquation: string; latexPente: string; latexPoint: string; textePente: string }
  | { ok: false; erreur: string }

const texteCourt = (v: number) => {
  const w = Math.round(v * 100) / 100
  return String(w === 0 ? 0 : w).replace('.', ',').replace('-', '−')
}

export function calculerTangente(f: Fonction, x0: number): ResultatTangente {
  const y0 = f(x0)
  const xt = texteCourt(x0)
  if (Number.isNaN(y0)) return { ok: false, erreur: `La fonction n’est pas définie en x = ${xt} : pas de tangente.` }
  const h = 1e-4 * Math.max(1, Math.abs(x0))
  const d1 = (f(x0 + h) - f(x0 - h)) / (2 * h)
  const d2 = (f(x0 + 2 * h) - f(x0 - 2 * h)) / (4 * h)
  const m = (4 * d1 - d2) / 3
  const mg = (y0 - f(x0 - h)) / h
  const md = (f(x0 + h) - y0) / h
  if (!Number.isFinite(m) || Number.isNaN(mg) || Number.isNaN(md)) return { ok: false, erreur: `La fonction n’est pas définie autour de x = ${xt} : pas de tangente.` }
  if (Math.abs(m) > 1e6) return { ok: false, erreur: `En x = ${xt}, la tangente est verticale : sa pente n’est pas un nombre.` }
  if (Math.abs(mg - md) > 1e-2 * (1 + Math.abs(m)) + 50 * h) return { ok: false, erreur: `En x = ${xt}, la courbe fait un angle : pas de tangente (pente à gauche ≠ pente à droite).` }
  const p = y0 - m * x0
  const mL = reconnaitre(m, 1e-6)
  const pL = reconnaitre(p, 1e-6)
  const absP = reconnaitre(Math.abs(p), 1e-6)
  let latexEquation: string
  if (mL !== null && pL !== null && absP !== null) {
    const mm = Number(nettoyer(Math.round(m * 1e6) / 1e6))
    const terme = mm === 1 ? 'x' : mm === -1 ? '-x' : `${mL}x`
    const pp = Math.abs(p) < 1e-6 ? 0 : p
    latexEquation = Math.abs(mm) < 1e-9 ? `y = ${pL}` : `y = ${terme}${pp === 0 ? '' : `${pp > 0 ? ' + ' : ' - '}${absP}`}`
  } else {
    const mm = Math.round(m * 100) / 100
    const pp = Math.round(p * 100) / 100
    const terme = mm === 1 ? 'x' : mm === -1 ? '-x' : `${approx(m)}x`
    latexEquation = mm === 0 ? `y \\approx ${approx(p)}` : `y \\approx ${terme}${pp === 0 ? '' : `${pp > 0 ? ' + ' : ' - '}${approx(Math.abs(p))}`}`
  }
  return {
    ok: true,
    x0,
    y0,
    m,
    latexEquation,
    latexPente: mL !== null ? mL : `\\approx ${approx(m)}`,
    latexPoint: latexCoordonnees(x0, y0),
    textePente: mL !== null && /^-?\d+(\{,\}\d+)?$/.test(mL) ? mL.replace('{,}', ',').replace('-', '−') : texteCourt(m),
  }
}

// ---------- aire ----------

export type ResultatAire =
  | { ok: true; valeur: number; latexValeur: string; signe: 'positive' | 'partie' | 'negative' }
  | { ok: false; erreur: string }

/** Intégrale de f entre a et b (Simpson, 4 000 pas) ; valeur exacte reconnue quand elle est simple. */
export function calculerAire(f: Fonction, a: number, b: number): ResultatAire {
  if (a === b) return { ok: true, valeur: 0, latexValeur: '= 0', signe: 'positive' }
  const n = 4000
  const h = (b - a) / n
  let s = 0
  let pos = false
  let neg = false
  for (let i = 0; i <= n; i++) {
    const y = f(a + i * h)
    if (Number.isNaN(y)) return { ok: false, erreur: 'La fonction n’est pas définie partout entre les deux bornes : aire non calculée.' }
    if (y > 1e-12) pos = true
    if (y < -1e-12) neg = true
    s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * y
  }
  const v = (s * h) / 3
  if (!Number.isFinite(v)) return { ok: false, erreur: 'Aire infinie ou trop grande : choisis d’autres bornes.' }
  const sens = b > a ? 1 : -1
  const signe: 'positive' | 'partie' | 'negative' = pos && neg ? 'partie' : (neg ? -1 : 1) * sens < 0 ? 'negative' : 'positive'
  const court = reconnaitre(v, 1e-9)
  const decimalCourt = court !== null && !court.includes('\\')
  const latexValeur = decimalCourt ? `= ${court}` : court !== null ? `= ${court} \\approx ${approx(v)}` : `\\approx ${approx(v)}`
  return { ok: true, valeur: v, latexValeur, signe }
}

// ---------- points, vecteurs, segments, droites ----------

export type LecturePoint =
  | { ok: true; genre: 'point'; nom: string; x: number; y: number; latex: string }
  | { ok: true; genre: 'liaison'; sorte: Liaison['sorte']; a: string; b: string; latex: string }
  | { ok: false; erreur: string }

/** LaTeX d'une coordonnée : décimal court tel quel, sinon forme exacte reconnue, sinon arrondi à 0,01 (« ≈ »). */
export function latexNombre(v: number): string {
  return reconnaitre(v, 1e-9) ?? `\\approx ${approx(v)}`
}

function lireNombre(t: string, quoi: string): number {
  const s = t.trim()
  if (!s) throw new ErreurCalcul(`Il manque ${quoi}.`, 'syntaxe')
  return evaluer(analyser(s), 'rad', 0)
}

/**
 * Lit « D(−1,5 ; 2,5) », « (2 ; 3) » (nom suivant libre), « vecteur AB », « segment BC », « droite AC », « [BC] »,
 * « (AC) ». Saisie libre : « − » ou « - », virgule décimale, point-virgule entre les coordonnées ; parenthèse oubliée
 * fermée d'office. Message clair sinon (rien n'est effacé).
 */
export function lirePoint(saisie: string, existants: string[]): LecturePoint {
  const s = saisie.replace(/[−–—]/g, '-').trim()
  if (!s) return { ok: false, erreur: 'Écris un point, par exemple A(1 ; 2), ou « vecteur AB ».' }
  const mot = /^(vecteur|vect|vec|segment|seg|droite)\s+([A-Z]'?)\s*([A-Z]'?)$/i.exec(s)
  const crochet = /^\[\s*([A-Z]'?)\s*([A-Z]'?)\s*\]?$/.exec(s)
  const par = /^\(\s*([A-Z]'?)\s*([A-Z]'?)\s*\)?$/.exec(s)
  const l = mot ? { sorte: (/^v/i.test(mot[1]) ? 'vecteur' : /^s/i.test(mot[1]) ? 'segment' : 'droite') as Liaison['sorte'], a: mot[2].toUpperCase(), b: mot[3].toUpperCase() } : crochet ? { sorte: 'segment' as const, a: crochet[1], b: crochet[2] } : par ? { sorte: 'droite' as const, a: par[1], b: par[2] } : null
  if (l) {
    if (l.a === l.b) return { ok: false, erreur: 'Choisis deux points différents.' }
    for (const n of [l.a, l.b]) if (!existants.includes(n)) return { ok: false, erreur: `Le point ${n} n’est pas encore placé : écris d’abord ${n}( … ; … ).` }
    const latex = l.sorte === 'vecteur' ? `\\overrightarrow{${l.a}${l.b}}` : l.sorte === 'segment' ? `[${l.a}${l.b}]` : `(${l.a}${l.b})`
    return { ok: true, genre: 'liaison', ...l, latex: l.sorte === 'vecteur' ? `\\text{vecteur } ${latex}` : `\\text{${l.sorte} } ${latex}` }
  }
  const p = /^([A-Za-z]'?)?\s*\((.*?)\)?\s*$/.exec(s)
  if (!p) return { ok: false, erreur: 'Écris un point comme A(1 ; 2) : une lettre, puis les coordonnées entre parenthèses.' }
  const nomTape = p[1]
  if (nomTape && nomTape.toLowerCase() === 'x') return { ok: false, erreur: 'Le nom d’un point est une lettre majuscule (A, B, C…).' }
  const dedans = p[2]
  let parts: string[]
  if (dedans.includes(';')) parts = dedans.split(';')
  else if (/,\s+/.test(dedans)) parts = dedans.split(/,\s+/)
  else if (/^\s*-?\d+\s*,\s*-?\d+\s*$/.test(dedans) && /\d,\d/.test(dedans) && !/\d,\d+,/.test(dedans)) return { ok: false, erreur: 'Sépare les deux coordonnées par « ; » (la virgule sert aux nombres décimaux).' }
  else parts = [dedans]
  if (parts.length !== 2) return { ok: false, erreur: parts.length < 2 ? 'Il faut deux coordonnées séparées par « ; ».' : 'Il faut exactement deux coordonnées.' }
  try {
    const x = lireNombre(parts[0], 'l’abscisse')
    const y = lireNombre(parts[1], 'l’ordonnée')
    if (!Number.isFinite(x) || !Number.isFinite(y)) return { ok: false, erreur: 'Coordonnées trop grandes.' }
    const nom = nomTape ? nomTape[0].toUpperCase() + nomTape.slice(1) : (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U'].find((n) => !existants.includes(n)) ?? 'P')
    return { ok: true, genre: 'point', nom, x, y, latex: `${nom}\\left(${latexNombre(x)}\\,;\\,${latexNombre(y)}\\right)` }
  } catch (e) {
    return { ok: false, erreur: e instanceof ErreurCalcul ? e.message : 'Coordonnées illisibles.' }
  }
}

// ---------- dessin (canvas des courbes : sous le surligneur et le stylo) ----------

type Ctx = CanvasRenderingContext2D

const estGenre = <G extends ElementAnnotation['genre']>(g: G) => (e: ElementAnnotation): e is Extract<ElementAnnotation, { genre: G }> => e.genre === g

/** Fonction (paramètres compris, à l'instant donné) d'une courbe de la page. */
export function fonctionCourbe(c: Courbe, page: PageBlanche, maintenant = Date.now()): Fonction | null {
  return traceMemorise(c.saisie, page.angle, repereVue(page), valeursCourbe(c, maintenant)).f
}

/** Avant les courbes : aires (orange translucide, quadrillage visible au travers) et traces de la famille (gris clair). */
export function peindreAvantCourbes(x: Ctx, elements: ElementAnnotation[], courbes: Courbe[], page: PageBlanche, maintenant = Date.now()) {
  const r = repereVue(page)
  for (const c of courbes) {
    if (!c.trace) continue
    const v = valeursCourbe(c, maintenant)
    if (v && estAnimee(c)) noterPassage(c, v)
    const toutes = [...(c.traces ?? []), ...(passages.get(c.id)?.values() ?? [])]
    x.strokeStyle = '#9fb0bd'
    x.globalAlpha = 0.6
    x.lineWidth = 2
    for (const val of toutes) for (const l of traceMemorise(c.saisie, page.angle, r, val).polylignes) tracerPolyligne(x, l)
    x.globalAlpha = 1
  }
  for (const a of elements.filter(estGenre('aire'))) {
    const c = courbes.find((k) => k.id === a.courbe)
    const f = c && fonctionCourbe(c, page, maintenant)
    if (!f) continue
    const [u, w] = a.a <= a.b ? [a.a, a.b] : [a.b, a.a]
    const px0 = versPxX(u, r)
    const px1 = versPxX(w, r)
    const axe = clampY(versPxY(0, r))
    x.beginPath()
    x.moveTo(px0, axe)
    const n = Math.max(2, Math.min(2000, Math.ceil(Math.abs(px1 - px0))))
    for (let i = 0; i <= n; i++) {
      const xx = u + ((w - u) * i) / n
      const y = f(xx)
      x.lineTo(versPxX(xx, r), Number.isNaN(y) ? axe : clampY(versPxY(y, r)))
    }
    x.lineTo(px1, axe)
    x.closePath()
    x.fillStyle = COULEUR_AIRE
    x.globalAlpha = 0.38
    x.fill()
    x.globalAlpha = 1
    x.strokeStyle = '#b65c1f'
    x.lineWidth = 3
    x.setLineDash([7, 6])
    for (const b of [u, w]) {
      const yb = f(b)
      if (Number.isNaN(yb)) continue
      x.beginPath()
      x.moveTo(versPxX(b, r), axe)
      x.lineTo(versPxX(b, r), clampY(versPxY(yb, r)))
      x.stroke()
    }
    x.setLineDash([])
  }
}

const clampY = (y: number) => Math.max(-60, Math.min(780, y))

function tracerPolyligne(x: Ctx, l: [number, number][]) {
  x.beginPath()
  l.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)))
  x.stroke()
}

/** Pas « joli » (1, 10, 0,1…) pour le petit triangle de la pente : au moins 40 px à l'écran. */
export function pasTriangle(r: Repere): number {
  let d = 1
  while ((d / r.ex) * 40 < 40 && d < 1e6) d *= 10
  while ((d / r.ex) * 40 > 400 && d > 1e-6) d /= 10
  return d
}

/** Tangente, triangle de la pente, point de contact ; puis segments / droites / vecteurs et points. */
export function peindreApresCourbes(x: Ctx, elements: ElementAnnotation[], courbes: Courbe[], page: PageBlanche, maintenant = Date.now()) {
  const r = repereVue(page)
  for (const t of elements.filter(estGenre('tangente'))) {
    const c = courbes.find((k) => k.id === t.courbe)
    const f = c && fonctionCourbe(c, page, maintenant)
    if (!f) continue
    const res = calculerTangente(f, t.x)
    if (!res.ok) continue
    const a = xMin(r)
    const b = xMax(r)
    x.strokeStyle = t.couleur
    x.lineWidth = 4
    x.lineCap = 'round'
    x.beginPath()
    x.moveTo(versPxX(a, r), Math.max(-4000, Math.min(4720, versPxY(res.y0 + res.m * (a - res.x0), r))))
    x.lineTo(versPxX(b, r), Math.max(-4000, Math.min(4720, versPxY(res.y0 + res.m * (b - res.x0), r))))
    x.stroke()
    if (t.triangle) {
      const d = pasTriangle(r)
      const [p0x, p0y] = [versPxX(res.x0, r), versPxY(res.y0, r)]
      const [p1x] = [versPxX(res.x0 + d, r)]
      const p2y = versPxY(res.y0 + res.m * d, r)
      x.save()
      x.globalAlpha = 0.85
      x.lineWidth = 2.5
      x.setLineDash([6, 5])
      x.beginPath()
      x.moveTo(p0x, p0y)
      x.lineTo(p1x, p0y)
      x.lineTo(p1x, p2y)
      x.stroke()
      x.restore()
    }
    x.beginPath()
    x.arc(versPxX(res.x0, r), versPxY(res.y0, r), 11, 0, 2 * Math.PI)
    x.fillStyle = '#fff'
    x.fill()
    x.lineWidth = 5
    x.stroke()
  }
  const points = new Map(elements.filter(estGenre('point')).map((p) => [p.nom, p]))
  for (const l of elements.filter(estGenre('liaison'))) {
    const A = points.get(l.a)
    const B = points.get(l.b)
    if (!A || !B) continue
    const [ax, ay] = [versPxX(A.x, r), versPxY(A.y, r)]
    const [bx, by] = [versPxX(B.x, r), versPxY(B.y, r)]
    x.strokeStyle = l.couleur
    x.fillStyle = l.couleur
    x.lineCap = 'round'
    if (l.sorte === 'droite') {
      const L = Math.hypot(bx - ax, by - ay) || 1
      const [ux, uy] = [(bx - ax) / L, (by - ay) / L]
      x.lineWidth = 4
      x.beginPath()
      x.moveTo(ax - ux * 5000, ay - uy * 5000)
      x.lineTo(ax + ux * 5000, ay + uy * 5000)
      x.stroke()
    } else if (l.sorte === 'segment') {
      x.lineWidth = 4
      x.beginPath()
      x.moveTo(ax, ay)
      x.lineTo(bx, by)
      x.stroke()
    } else {
      // Vecteur : composantes en pointillé, puis trait et VRAIE pointe de flèche qui s'arrête au bord du point B.
      x.save()
      x.globalAlpha = 0.8
      x.lineWidth = 2
      x.setLineDash([6, 5])
      x.beginPath()
      x.moveTo(ax, ay)
      x.lineTo(bx, ay)
      x.lineTo(bx, by)
      x.stroke()
      x.restore()
      const L = Math.hypot(bx - ax, by - ay)
      if (L < 1) continue
      const [ux, uy] = [(bx - ax) / L, (by - ay) / L]
      const pointe = Math.min(26, L * 0.45)
      const [px, py] = [bx - ux * 10, by - uy * 10]
      const [tx, ty] = [px - ux * pointe, py - uy * pointe]
      const [nx, ny] = [-uy * pointe * 0.5, ux * pointe * 0.5]
      x.lineWidth = 5
      x.beginPath()
      x.moveTo(ax, ay)
      x.lineTo(tx, ty)
      x.stroke()
      x.beginPath()
      x.moveTo(px, py)
      x.lineTo(tx + nx, ty + ny)
      x.lineTo(tx - nx, ty - ny)
      x.closePath()
      x.fill()
    }
  }
  for (const p of points.values()) {
    x.beginPath()
    x.arc(versPxX(p.x, r), versPxY(p.y, r), 8, 0, 2 * Math.PI)
    x.fillStyle = p.couleur
    x.fill()
    x.strokeStyle = '#fff'
    x.lineWidth = 2
    x.stroke()
  }
}

/** La page « repère » a-t-elle des éléments du traceur enrichi (points, liaisons, tangentes, aires) ? */
export const aDesElementsEnrichis = (elements: ElementAnnotation[]) => elements.some((e) => e.genre === 'point' || e.genre === 'liaison' || e.genre === 'tangente' || e.genre === 'aire')
