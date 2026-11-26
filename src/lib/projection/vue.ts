/**
 * Vue (zoom, déplacement) d'une page « repère » de l'écran blanc (mode projection), PUR (aucun React, aucun DOM).
 *
 * Trois repères de coordonnées :
 * - ÉCRAN : px logiques de la diapo (1 280 × 720), ce que montre la scène ;
 * - PAGE : px logiques de la page « à sa vue de départ » (origine du repère au centre, 1 carreau = 40 px =
 *   `page.ex` unités en abscisse, `page.ey` en ordonnée). Les annotations (traits, arcs, résultats épinglés) y
 *   sont STOCKÉES : elles restent attachées au graphique quand on zoome ou qu'on déplace la vue ;
 * - REPÈRE : unités mathématiques (courbes, points remarquables, graduations).
 *
 * La vue (`page.vue`) donne, pour l'écran, les unités par 40 px de chaque axe et le point du repère au centre de
 * l'écran ; absente = vue de départ (`{ ex: page.ex, ey: page.ey, cx: 0, cy: 0 }`). Hors repère (uni, quadrillé,
 * diapo), page = écran (transformation identité).
 */
import type { PageBlanche, VueRepere } from './annotations'

export type { VueRepere }

const L = 1280
const H = 720
const C = 40

/** Bornes du zoom : unités par 40 px de l'écran (graduations lisibles, calculs sûrs). */
export const ECHELLE_MIN = 0.002
export const ECHELLE_MAX = 5000

/** Transformation page → écran : `écran = page × z + t` (par axe). `s` : facteur des épaisseurs des annotations — racine
 * carrée du zoom (moyenne géométrique des deux axes) : un trait suit le zoom sans devenir énorme (×2 → ×1,41) ni
 * disparaître ; le même facteur pour la gomme (ce qu'elle effaçait reste effacé, au bord près). */
export interface Transfo {
  zx: number
  zy: number
  tx: number
  ty: number
  s: number
}

export const IDENTITE: Transfo = { zx: 1, zy: 1, tx: 0, ty: 0, s: 1 }

/** Vue d'une page « repère » (la vue de départ si aucune n'a été posée). */
export function vueDe(page: Pick<PageBlanche, 'ex' | 'ey' | 'vue'>): VueRepere {
  return page.vue ?? { ex: page.ex, ey: page.ey, cx: 0, cy: 0 }
}

/** Repère des courbes (unités par carreau de 40 px À L'ÉCRAN, point au centre de l'écran) : celui de la vue. */
export function repereVue(page: Pick<PageBlanche, 'ex' | 'ey' | 'vue'>): VueRepere {
  return vueDe(page)
}

/** Transformation page → écran d'une page (identité hors repère). */
export function transfoPage(page: Pick<PageBlanche, 'fond' | 'ex' | 'ey' | 'vue'> | null | undefined): Transfo {
  if (!page || page.fond !== 'repere' || !page.vue) return IDENTITE
  const v = page.vue
  const zx = page.ex / v.ex
  const zy = page.ey / v.ey
  // x_repère = (Px − 640) / 40 × ex ; Sx = 640 + (x_repère − cx) / ex_vue × 40.
  const tx = L / 2 - (L / 2) * zx - (v.cx * C) / v.ex
  const ty = H / 2 - (H / 2) * zy + (v.cy * C) / v.ey
  return { zx, zy, tx, ty, s: Math.pow(zx * zy, 0.25) }
}

export const estIdentite = (t: Transfo) => t.zx === 1 && t.zy === 1 && t.tx === 0 && t.ty === 0

export function versEcran(t: Transfo, [x, y]: [number, number]): [number, number] {
  return [x * t.zx + t.tx, y * t.zy + t.ty]
}

/** Écran → page, arrondi au millième (précis même très zoomé, sans grossir les données). */
export function versPage(t: Transfo, [x, y]: [number, number]): [number, number] {
  if (estIdentite(t)) return [x, y]
  const r = (v: number) => Math.round(v * 1000) / 1000
  return [r((x - t.tx) / t.zx), r((y - t.ty) / t.zy)]
}

// ---------- repère : unités ↔ écran ----------

export const ecranVersRepere = (v: VueRepere, [sx, sy]: [number, number]): [number, number] => [v.cx + ((sx - L / 2) / C) * v.ex, v.cy - ((sy - H / 2) / C) * v.ey]
export const repereVersEcran = (v: VueRepere, [x, y]: [number, number]): [number, number] => [L / 2 + ((x - v.cx) / v.ex) * C, H / 2 - ((y - v.cy) / v.ey) * C]

const borne = (v: number) => Math.min(ECHELLE_MAX, Math.max(ECHELLE_MIN, v))

/** Zoom de facteur `f` (> 1 : on agrandit) autour du point d'écran `ancre`, qui reste sous le doigt / la souris.
 * Le même facteur sur les deux axes (leur rapport ne change pas), borné pour que les deux restent dans les limites. */
export function zoomer(v: VueRepere, f: number, ancre: [number, number] = [L / 2, H / 2]): VueRepere {
  const fMax = Math.min(v.ex / ECHELLE_MIN, v.ey / ECHELLE_MIN)
  const fMin = Math.max(v.ex / ECHELLE_MAX, v.ey / ECHELLE_MAX)
  const k = Math.min(fMax, Math.max(fMin, f))
  const [mx, my] = ecranVersRepere(v, ancre)
  const ex = v.ex / k
  const ey = v.ey / k
  return { ex, ey, cx: mx - ((ancre[0] - L / 2) / C) * ex, cy: my + ((ancre[1] - H / 2) / C) * ey }
}

/** Déplacement de la vue : le graphique suit le doigt (dx, dy en px d'écran). */
export function deplacer(v: VueRepere, dx: number, dy: number): VueRepere {
  return { ...v, cx: v.cx - (dx / C) * v.ex, cy: v.cy + (dy / C) * v.ey }
}

/** Échelle d'un axe fixée (réglage « 1 carreau = » du traceur), centre de l'écran gardé. */
export function avecEchelle(v: VueRepere, axe: 'ex' | 'ey', valeur: number): VueRepere {
  return { ...v, [axe]: borne(valeur) }
}

// ---------- graduations ----------

/** Nombre de décimales d'un pas « joli » (1, 2 ou 5 × 10ᵏ). */
export function decimalesPas(pas: number): number {
  return Math.max(0, -Math.floor(Math.log10(pas) + 1e-9))
}

/** Nombre d'une graduation : « 0,5 », « −10 », « 0,02 » (virgule, vrai signe moins, rien d'inutile). */
export function texteGraduationPas(v: number, pas: number): string {
  const d = decimalesPas(pas)
  const r = Number((Math.abs(v) < pas / 1e6 ? 0 : v).toFixed(d))
  return String(r === 0 ? 0 : r).replace('.', ',').replace('-', '−')
}

/** Largeur (px logiques) d'une étiquette de graduation en police mono 14 px. */
const largeurTexte = (t: string) => t.length * 8.5

/**
 * Pas des graduations d'un axe : le plus petit pas « joli » (0,1 / 0,2 / 0,5 / 1 / 2 / 5 / 10…) dont deux
 * graduations voisines sont à au moins 40 px l'une de l'autre ET dont les étiquettes (abscisses) ne se touchent
 * pas. `unitesPar40` : unités pour 40 px d'écran ; `bornes` : valeurs extrêmes visibles (largeur des étiquettes).
 */
export function pasGraduation(unitesPar40: number, bornes: [number, number], horizontal: boolean): number {
  const pxParUnite = C / unitesPar40
  const k0 = Math.floor(Math.log10(unitesPar40)) - 1
  for (let k = k0; k < k0 + 6; k++) {
    for (const m of [1, 2, 5]) {
      const pas = m * Math.pow(10, k)
      const ecart = pas * pxParUnite
      if (ecart < C - 1e-6) continue
      if (!horizontal) return pas
      const plusLarge = Math.max(largeurTexte(texteGraduationPas(Math.floor(bornes[0] / pas) * pas, pas)), largeurTexte(texteGraduationPas(Math.ceil(bornes[1] / pas) * pas, pas)))
      if (ecart >= plusLarge + 4) return pas
    }
  }
  return Math.pow(10, k0 + 6)
}

/** Graduations visibles d'une vue : pas et positions d'écran de chaque axe, position des axes. */
export interface Graduations {
  pasX: number
  pasY: number
  /** Valeurs et abscisses d'écran des graduations verticales (abscisses). */
  xs: { v: number; s: number }[]
  ys: { v: number; s: number }[]
  /** Abscisse d'écran de l'axe des ordonnées, ordonnée d'écran de l'axe des abscisses (peuvent être hors écran). */
  axeX: number
  axeY: number
}

export function graduations(v: VueRepere): Graduations {
  const [x0, y1] = ecranVersRepere(v, [0, 0])
  const [x1, y0] = ecranVersRepere(v, [L, H])
  const pasX = pasGraduation(v.ex, [x0, x1], true)
  const pasY = pasGraduation(v.ey, [y0, y1], false)
  const xs: { v: number; s: number }[] = []
  for (let n = Math.ceil(x0 / pasX); n * pasX <= x1 && xs.length < 400; n++) xs.push({ v: n * pasX, s: repereVersEcran(v, [n * pasX, 0])[0] })
  const ys: { v: number; s: number }[] = []
  for (let n = Math.ceil(y0 / pasY); n * pasY <= y1 && ys.length < 400; n++) ys.push({ v: n * pasY, s: repereVersEcran(v, [0, n * pasY])[1] })
  const [axeX, axeY] = repereVersEcran(v, [0, 0])
  return { pasX, pasY, xs, ys, axeX, axeY }
}

/** La vue est-elle la vue de départ (rien à recentrer) ? */
export function estVueDepart(page: Pick<PageBlanche, 'ex' | 'ey' | 'vue'>): boolean {
  const v = page.vue
  return !v || (v.cx === 0 && v.cy === 0 && v.ex === page.ex && v.ey === page.ey)
}
