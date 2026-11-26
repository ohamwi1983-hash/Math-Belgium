/**
 * Traceur de fonctions de l'écran blanc « repère » (mode projection), PUR (aucun React, aucun DOM).
 *
 * - Lecture : le parseur MAISON de la calculatrice (`calculatrice.ts`, jamais `eval`) étendu à la
 *   variable x et à la valeur absolue (|x| ou abs(x)) ; « f(x) = » ou « y = » en tête est accepté.
 * - Repère : origine au centre de la diapo (640 ; 360), 1 carreau = 40 px logiques = `ex` unités en
 *   abscisse, `ey` en ordonnée (0,5 / 1 / 2 / 5 / 10).
 * - Tracé : un échantillon par pixel logique, affiné là où la courbe monte vite (bissection) ; la
 *   polyligne est COUPÉE aux discontinuités (saut qui ne se résorbe pas en affinant : asymptote de
 *   1/x, de tan x), aux valeurs non définies (NaN, hors domaine : √x pour x < 0, ln x pour x ≤ 0) ; les
 *   bords du domaine sont approchés par bissection (la courbe de √x part bien de l'origine).
 * - Points remarquables : zéros, extremums (sommet), intersections de deux courbes, valeur exacte
 *   reconnue comme la calculatrice (décimal exact, fraction, multiple de π, a√b/q), sinon ≈ à 0,01.
 */
import { analyser, enLatex, ErreurCalcul, formaterDecimal, formeExacte, nettoyer } from './calculatrice'
import type { ModeAngle, Noeud } from './calculatrice'

export const LARGEUR_REPERE = 1280
export const HAUTEUR_REPERE = 720
export const CARREAU_REPERE = 40
const OX = LARGEUR_REPERE / 2
const OY = HAUTEUR_REPERE / 2

/** Échelles proposées : unités par carreau. */
export const ECHELLES = [0.5, 1, 2, 5, 10] as const

export interface Repere {
  /** Unités par carreau (40 px d'écran) en abscisse / en ordonnée. */
  ex: number
  ey: number
  /** Point du repère au centre de l'écran (vue zoomée / déplacée, voir `vue.ts`) ; absent = l'origine. */
  cx?: number
  cy?: number
}

export type Fonction = (x: number) => number

export type LectureFonction = { ok: true; f: Fonction; latex: string; saisie: string } | { ok: false; erreur: string }

const DEG = Math.PI / 180

/** Retire « f(x) = », « y = », « g(x)= » en tête (le professeur l'écrit souvent par habitude). */
export function sansPrefixe(saisie: string): string {
  return saisie.replace(/^\s*(?:y|[a-zA-Z]\s*\(\s*x\s*\))\s*=\s*/, '').replace(/[=\s]+$/, '')
}

/** Évaluation SANS exception : NaN hors du domaine (division par 0, √ d'un négatif, ln d'un négatif…). */
function compiler(n: Noeud, mode: ModeAngle): Fonction {
  const c = (m: Noeud): Fonction => {
    switch (m.t) {
      case 'nb': {
        const v = m.v
        return () => v
      }
      case 'cst': {
        const v = m.nom === 'pi' ? Math.PI : m.nom === 'e' ? Math.E : NaN
        return () => v
      }
      case 'var':
        return (x) => x
      case 'par':
        return c(m.a)
      case 'neg': {
        const a = c(m.a)
        return (x) => -a(x)
      }
      case 'bin': {
        const a = c(m.a)
        const b = c(m.b)
        if (m.op === '+') return (x) => a(x) + b(x)
        if (m.op === '-') return (x) => a(x) - b(x)
        if (m.op === '/')
          return (x) => {
            const d = b(x)
            return d === 0 ? NaN : a(x) / d
          }
        return (x) => a(x) * b(x)
      }
      case 'pow': {
        const a = c(m.a)
        const b = c(m.b)
        return (x) => {
          const u = a(x)
          const v = b(x)
          if (u === 0 && v < 0) return NaN
          if (u < 0 && !Number.isInteger(v)) {
            // Racine impaire d'un négatif : x^(1/3) existe pour x < 0 (comme la calculatrice).
            const inv = 1 / v
            if (Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) return -Math.pow(-u, v)
            return NaN
          }
          return Math.pow(u, v)
        }
      }
      case 'fn': {
        const a = c(m.a)
        const k = mode === 'deg' ? DEG : 1
        switch (m.nom) {
          case 'sin':
            return (x) => Math.sin(a(x) * k)
          case 'cos':
            return (x) => Math.cos(a(x) * k)
          case 'tan':
            return (x) => {
              const t = a(x) * k
              return Math.abs(Math.cos(t)) < 1e-15 ? NaN : Math.tan(t)
            }
          case 'asin':
            return (x) => Math.asin(a(x)) / k
          case 'acos':
            return (x) => Math.acos(a(x)) / k
          case 'atan':
            return (x) => Math.atan(a(x)) / k
          case 'ln':
            return (x) => {
              const v = a(x)
              return v > 0 ? Math.log(v) : NaN
            }
          case 'log':
            return (x) => {
              const v = a(x)
              return v > 0 ? Math.log10(v) : NaN
            }
          case 'racine':
            return (x) => {
              const v = a(x)
              return v >= 0 ? Math.sqrt(v) : NaN
            }
          case 'abs':
            return (x) => Math.abs(a(x))
        }
      }
    }
    return () => NaN
  }
  const f = c(n)
  return (x) => {
    const v = f(x)
    return Number.isFinite(v) ? v : NaN
  }
}

/** Lit « f(x) = … » : fonction numérique + LaTeX de l'expression ; message en clair sinon (rien n'est effacé). */
export function lireFonction(saisie: string, mode: ModeAngle): LectureFonction {
  const s = sansPrefixe(saisie)
  if (!s.trim()) return { ok: false, erreur: 'Écris une expression en x, par exemple x² − 2x.' }
  try {
    const arbre = analyser(s, { variable: true })
    if (/\bans\b/i.test(s)) return { ok: false, erreur: '« Ans » n’a pas de sens dans une fonction' }
    return { ok: true, f: compiler(arbre, mode), latex: enLatex(arbre, mode, { fractions: true }), saisie: s }
  } catch (e) {
    return { ok: false, erreur: e instanceof ErreurCalcul ? e.message : 'Expression illisible' }
  }
}

// ---------- repère : unités ↔ pixels logiques ----------

export const versPxX = (x: number, r: Repere) => OX + ((x - (r.cx ?? 0)) / r.ex) * CARREAU_REPERE
export const versPxY = (y: number, r: Repere) => OY - ((y - (r.cy ?? 0)) / r.ey) * CARREAU_REPERE
export const depuisPxX = (px: number, r: Repere) => (r.cx ?? 0) + ((px - OX) / CARREAU_REPERE) * r.ex
export const xMin = (r: Repere) => depuisPxX(0, r)
export const xMax = (r: Repere) => depuisPxX(LARGEUR_REPERE, r)

/** Nombre d'une graduation : « 0,5 », « −10 » (virgule, vrai signe moins). */
export function texteGraduation(v: number): string {
  const r = Math.round(v * 1000) / 1000
  return String(r).replace('.', ',').replace('-', '−')
}

// ---------- tracé ----------

export type Polyligne = [number, number][]

const BORNE_PX = 4000
const bornePx = (v: number) => Math.max(-BORNE_PX, Math.min(HAUTEUR_REPERE + BORNE_PX, v))

/**
 * Polylignes (px logiques) d'une fonction sur toute la largeur du repère. Un échantillon par pixel ;
 * entre deux échantillons qui s'écartent de plus de 6 px en hauteur, on affine par bissection (14
 * niveaux) : si l'écart demeure à la fin (> 30 px), c'est une discontinuité → la polyligne est coupée.
 * Rien n'est dessiné hors du cadre (le canvas découpe ; les ordonnées sont bornées pour rester sûres).
 */
export function echantillonner(f: Fonction, r: Repere): Polyligne[] {
  const res: Polyligne[] = []
  let courante: Polyligne = []
  const couper = () => {
    if (courante.length > 1) res.push(courante)
    else if (courante.length === 1) res.push([courante[0], [courante[0][0] + 0.01, courante[0][1]]])
    courante = []
  }
  const pousser = (x: number, y: number) => courante.push([versPxX(x, r), bornePx(versPxY(y, r))])
  /** Bord du domaine entre a (défini) et b (non défini) : bissection, renvoie le dernier point défini. */
  const bord = (a: number, b: number): [number, number] => {
    let ya = f(a)
    for (let i = 0; i < 40; i++) {
      const m = (a + b) / 2
      const ym = f(m)
      if (Number.isNaN(ym)) b = m
      else {
        a = m
        ya = ym
      }
    }
    return [a, ya]
  }
  const hors = (py: number) => (py < -40 ? -1 : py > HAUTEUR_REPERE + 40 ? 1 : 0)
  const segment = (x0: number, y0: number, x1: number, y1: number, profondeur: number) => {
    const p0 = versPxY(y0, r)
    const p1 = versPxY(y1, r)
    const ecart = Math.abs(p1 - p0)
    // Deux points hors du cadre du même côté : rien de visible entre eux (au pixel près).
    if (ecart <= 6 || (hors(p0) !== 0 && hors(p0) === hors(p1))) {
      pousser(x1, y1)
      return
    }
    if (profondeur >= 14) {
      if (ecart > 30) {
        couper()
        pousser(x1, y1)
      } else pousser(x1, y1)
      return
    }
    const xm = (x0 + x1) / 2
    const ym = f(xm)
    if (Number.isNaN(ym)) {
      // Trou du domaine au milieu : on s'arrête au bord, on repart après.
      const [xa, ya] = bord(x0, xm)
      pousser(xa, ya)
      couper()
      const [xb, yb] = bord(x1, xm)
      pousser(xb, yb)
      pousser(x1, y1)
      return
    }
    segment(x0, y0, xm, ym, profondeur + 1)
    segment(xm, ym, x1, y1, profondeur + 1)
  }
  const a = xMin(r)
  const b = xMax(r)
  const n = LARGEUR_REPERE
  let xPrec = a
  let yPrec = f(a)
  if (!Number.isNaN(yPrec)) pousser(xPrec, yPrec)
  for (let i = 1; i <= n; i++) {
    const x = a + ((b - a) * i) / n
    const y = f(x)
    if (Number.isNaN(y)) {
      if (!Number.isNaN(yPrec)) {
        const [xb, yb] = bord(xPrec, x)
        pousser(xb, yb)
        couper()
      }
    } else if (Number.isNaN(yPrec)) {
      const [xb, yb] = bord(x, xPrec)
      pousser(xb, yb)
      pousser(x, y)
    } else segment(xPrec, yPrec, x, y, 0)
    xPrec = x
    yPrec = y
  }
  couper()
  return res
}

// ---------- points remarquables ----------

export type GenrePoint = 'zero' | 'extremum' | 'intersection'

export interface PointRemarquable {
  genre: GenrePoint
  x: number
  y: number
  /** Coordonnées en LaTeX : « (√2 ; 0) » exact, sinon « ≈ (1,41 ; 0) ». */
  latex: string
  /** Courbe(s) concernée(s) (id). */
  courbes: string[]
}

/** Coordonnée affichée : décimal exact tel quel, sinon forme exacte reconnue, sinon null (arrondie). */
function exacte(v: number): string | null {
  const w = nettoyer(v)
  const d = formaterDecimal(w)
  // Décimal exact court (au plus 3 décimales : 2,5 ; −1,25) tel quel ; plus long : forme exacte ou arrondi.
  if (!d.tronque && (d.texte.split(',')[1] ?? '').replace(/\s/g, '').length <= 3) return d.latex
  return formeExacte(w)
}

function arrondie(v: number): string {
  const w = Math.round(v * 100) / 100
  return formaterDecimal(w === 0 ? 0 : w).latex
}

/** « (x ; y) » : exact quand les deux coordonnées sont reconnues, sinon « ≈ » et arrondi à 0,01. */
export function latexCoordonnees(x: number, y: number): string {
  const ex = exacte(x)
  const ey = exacte(y)
  if (ex !== null && ey !== null) return `\\left(${ex}\\,;\\,${ey}\\right)`
  return `\\approx\\left(${arrondie(x)}\\,;\\,${arrondie(y)}\\right)`
}

/** Une « jolie » valeur (fraction de petit dénominateur, multiple de π/12) très proche de x, ou x. */
function aimanter(x: number, mieux: (c: number) => boolean): number {
  const tol = 1e-5 * Math.max(1, Math.abs(x))
  const candidats: number[] = []
  for (let q = 1; q <= 12; q++) candidats.push(Math.round(x * q) / q)
  for (let q = 1; q <= 12; q++) candidats.push((Math.round((x * q) / Math.PI) * Math.PI) / q)
  let meilleur = x
  let ecart = Infinity
  for (const c of candidats) {
    const e = Math.abs(c - x)
    if (e <= tol && e < ecart && mieux(c)) {
      meilleur = c
      ecart = e
    }
  }
  return meilleur
}

/** Racines de h sur [a ; b] (échantillons fins + bissection), sans les sauts de signe dus à une discontinuité. */
function racines(h: Fonction, a: number, b: number, n = 2560): number[] {
  const res: number[] = []
  let x0 = a
  let y0 = h(a)
  const echelle = Math.max(1, Math.abs(b - a))
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n
    const y1 = h(x1)
    if (!Number.isNaN(y0) && !Number.isNaN(y1)) {
      if (y0 === 0) res.push(x0)
      else if (y0 * y1 < 0) {
        let [u, v, fu] = [x0, x1, y0]
        for (let k = 0; k < 80; k++) {
          const m = (u + v) / 2
          const fm = h(m)
          if (Number.isNaN(fm)) break
          if (fm === 0) {
            u = v = m
            break
          }
          if (fm * fu < 0) v = m
          else {
            u = m
            fu = fm
          }
        }
        const x = (u + v) / 2
        const fx = Math.abs(h(x))
        // Vraie racine (|h| minuscule), pas un saut de signe d'asymptote (|h| énorme près de la coupure).
        if (fx < 1e-7 * Math.max(1, Math.abs(y0), Math.abs(y1)) || fx < 1e-9 * echelle) res.push(aimanter(x, (c) => Math.abs(h(c)) <= fx + 1e-12))
      }
    }
    x0 = x1
    y0 = y1
  }
  return res
}

/** Extremums locaux de f sur [a ; b] (changement de sens de variation, affiné par section dorée). */
function extremums(f: Fonction, a: number, b: number, n = 2560): { x: number; y: number }[] {
  const res: { x: number; y: number }[] = []
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n
    xs.push(x)
    ys.push(f(x))
  }
  for (let i = 1; i < n; i++) {
    const [y0, y1, y2] = [ys[i - 1], ys[i], ys[i + 1]]
    if ([y0, y1, y2].some(Number.isNaN)) continue
    const d0 = y1 - y0
    const d1 = y2 - y1
    if (d0 === 0 || d1 === 0 || Math.sign(d0) === Math.sign(d1)) continue
    const max = d0 > 0
    // Saut énorme (asymptote) : pas un extremum.
    if (Math.abs(d0) + Math.abs(d1) > 1e6) continue
    let [u, v] = [xs[i - 1], xs[i + 1]]
    const g = (Math.sqrt(5) - 1) / 2
    for (let k = 0; k < 120; k++) {
      const c = v - g * (v - u)
      const d = u + g * (v - u)
      const fc = f(c)
      const fd = f(d)
      if (max ? fc > fd : fc < fd) v = d
      else u = c
    }
    let x = (u + v) / 2
    const fx = f(x)
    x = aimanter(x, (c) => (max ? f(c) >= fx - 1e-12 * Math.max(1, Math.abs(fx)) : f(c) <= fx + 1e-12 * Math.max(1, Math.abs(fx))))
    res.push({ x, y: f(x) })
  }
  return res
}

export interface CourbeACalculer {
  id: string
  f: Fonction
}

const dansCadre = (x: number, y: number, r: Repere) => {
  const px = versPxX(x, r)
  const py = versPxY(y, r)
  return px >= 0 && px <= LARGEUR_REPERE && py >= 0 && py <= HAUTEUR_REPERE
}

const MAX_PAR_GENRE = 12

/** Points remarquables visibles des courbes de la page (doublons proches fusionnés). */
export function pointsRemarquables(courbes: CourbeACalculer[], r: Repere, choix: { zeros: boolean; extremums: boolean; intersections: boolean }): PointRemarquable[] {
  const a = xMin(r)
  const b = xMax(r)
  const res: PointRemarquable[] = []
  const ajouter = (genre: GenrePoint, x: number, y: number, ids: string[]) => {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !dansCadre(x, y, r)) return
    const yy = Math.abs(y) < 1e-12 ? 0 : y
    const xx = Math.abs(x) < 1e-12 ? 0 : x
    // Même point déjà marqué (zéro qui est aussi un sommet, intersection sur l'axe…) : une seule étiquette.
    const deja = res.find((p) => Math.abs(versPxX(p.x, r) - versPxX(xx, r)) < 3 && Math.abs(versPxY(p.y, r) - versPxY(yy, r)) < 3)
    if (deja) {
      for (const id of ids) if (!deja.courbes.includes(id)) deja.courbes.push(id)
      return
    }
    if (res.filter((p) => p.genre === genre).length >= MAX_PAR_GENRE * Math.max(1, courbes.length)) return
    res.push({ genre, x: xx, y: yy, latex: latexCoordonnees(xx, yy), courbes: [...ids] })
  }
  for (const c of courbes) {
    if (choix.extremums) for (const p of extremums(c.f, a, b).slice(0, MAX_PAR_GENRE)) ajouter('extremum', p.x, p.y, [c.id])
    if (choix.zeros) {
      for (const x of racines(c.f, a, b).slice(0, MAX_PAR_GENRE)) ajouter('zero', x, 0, [c.id])
      // Zéro double (la courbe touche l'axe sans le traverser) : un extremum de valeur nulle.
      for (const p of extremums(c.f, a, b)) if (Math.abs(p.y) < 1e-9) ajouter('zero', p.x, 0, [c.id])
    }
  }
  if (choix.intersections) {
    for (let i = 0; i < courbes.length; i++)
      for (let j = i + 1; j < courbes.length; j++) {
        const [f, g] = [courbes[i].f, courbes[j].f]
        const h: Fonction = (x) => f(x) - g(x)
        const xs = racines(h, a, b)
        for (const p of extremums(h, a, b)) if (Math.abs(p.y) < 1e-9) xs.push(p.x)
        for (const x of xs.slice(0, MAX_PAR_GENRE)) ajouter('intersection', x, f(x), [courbes[i].id, courbes[j].id])
      }
  }
  return res
}

/** Où poser l'étiquette « f » d'une courbe : un point visible vers la droite, loin des étiquettes déjà posées. */
export function placeEtiquette(polylignes: Polyligne[], prises: [number, number][]): [number, number] | null {
  const essais = [0.86, 0.74, 0.62, 0.92, 0.5, 0.3, 0.16]
  const visibles = polylignes.flat().filter(([x, y]) => x > 30 && x < LARGEUR_REPERE - 40 && y > 30 && y < HAUTEUR_REPERE - 30)
  if (visibles.length === 0) return null
  let repli: [number, number] | null = null
  for (const t of essais) {
    const cible = LARGEUR_REPERE * t
    let p = visibles[0]
    for (const q of visibles) if (Math.abs(q[0] - cible) < Math.abs(p[0] - cible)) p = q
    repli ??= p
    if (prises.every(([x, y]) => Math.hypot(x - p[0], y - p[1]) > 60)) return p
  }
  return repli
}

/** Noms donnés aux courbes d'une page, dans l'ordre (f, g, h, puis k, m, p…). */
export const NOMS_COURBES = ['f', 'g', 'h', 'k', 'm', 'p', 'q', 'r', 's', 'u', 'v', 'w']

/** Mémoire des tracés (une page redessinée à chaque trait de stylo ne recalcule pas ses courbes). */
const memoire = new Map<string, { f: Fonction | null; polylignes: Polyligne[] }>()

export function traceMemorise(saisie: string, mode: ModeAngle, r: Repere): { f: Fonction | null; polylignes: Polyligne[] } {
  const cle = `${mode}|${r.ex}|${r.ey}|${r.cx ?? 0}|${r.cy ?? 0}|${saisie}`
  let m = memoire.get(cle)
  if (!m) {
    const l = lireFonction(saisie, mode)
    m = l.ok ? { f: l.f, polylignes: echantillonner(l.f, r) } : { f: null, polylignes: [] }
    if (memoire.size > 60) memoire.delete(memoire.keys().next().value as string)
    memoire.set(cle, m)
  }
  return m
}
