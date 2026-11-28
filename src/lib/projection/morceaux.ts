/**
 * « Copier sur une page blanche » (mode projection, planche P4 du 28/11/2026), PUR.
 *
 * Un morceau collé ne garde JAMAIS une image : il garde sa SOURCE (clé de la diapo, étape de révélation, cadre ou
 * lasso en px de la diapo). Il est redessiné à partir de la diapo à la taille voulue (texte et formules KaTeX nets à
 * tout agrandissement), comme une courbe du traceur est redessinée depuis son expression. Rien ne change sur la diapo.
 */

/** Morceau d'une diapo collé sur une page blanche (élément d'annotation). */
export interface Morceau {
  genre: 'morceau'
  id: string
  /** Clé de la diapo d'origine (`diapos.ts`) et étape de révélation au moment de la copie. */
  source: string
  pas: number
  /** Cadre copié, en px logiques de la diapo (1 280 × 720). */
  cadre: { x: number; y: number; w: number; h: number }
  /** Lasso : contour à main levée, relatif au coin du cadre (px de la diapo) ; absent = rectangle. */
  lasso?: [number, number][]
  /** Coin haut gauche sur la page (px de la page) et agrandissement. */
  x: number
  y: number
  k: number
}

/** Ce qui est gardé en mémoire par « Copier » (on le colle plus tard sur une page déjà ouverte). */
export type Copie = Pick<Morceau, 'source' | 'pas' | 'cadre' | 'lasso'>

/** Place d'un morceau collé : aussi grand que possible (×3 au plus), en haut à gauche de la page, sous la petite barre. */
export function placerMorceau(c: Copie, id: string): Morceau {
  const { w, h } = c.cadre
  const k = Math.max(1, Math.min(3, 1040 / Math.max(1, w), 300 / Math.max(1, h)))
  const kk = Math.round(k * 100) / 100
  return { genre: 'morceau', id, ...c, x: Math.round(Math.max(40, Math.min(120, (1280 - w * kk) / 2))), y: 100, k: kk }
}

/** Cadre englobant d'un lasso (px de la diapo), borné à la diapo. */
export function cadreDuLasso(points: [number, number][]): { x: number; y: number; w: number; h: number } {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const x = Math.max(0, Math.min(...xs))
  const y = Math.max(0, Math.min(...ys))
  return { x, y, w: Math.min(1280, Math.max(...xs)) - x, h: Math.min(720, Math.max(...ys)) - y }
}

/** Lasso simplifié (un point tous les 6 px au moins) : assez fin pour le contour, léger à garder et à diffuser. */
export function simplifierLasso(points: [number, number][]): [number, number][] {
  const res: [number, number][] = []
  for (const p of points) {
    const d = res[res.length - 1]
    if (!d || Math.hypot(p[0] - d[0], p[1] - d[1]) >= 6) res.push([Math.round(p[0]), Math.round(p[1])])
  }
  return res
}

// ---------- presse-papier (navigateur du professeur, try/catch ; rien sur le serveur) ----------

const CLE = 'projection:presse-papier'
type Abonne = () => void
const abonnes = new Set<Abonne>()
let courante: Copie | null | undefined

export function lireCopie(): Copie | null {
  if (courante !== undefined) return courante
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? 'null') as Copie | null
    courante = brut && typeof brut.source === 'string' && brut.cadre && brut.cadre.w > 0 && brut.cadre.h > 0 ? brut : null
  } catch {
    courante = null
  }
  return courante
}

export function garderCopie(c: Copie) {
  courante = c
  try {
    localStorage.setItem(CLE, JSON.stringify(c))
  } catch {
    // Stockage refusé : la copie vaut pour cette visite.
  }
  for (const f of abonnes) f()
}

export function abonnerCopie(f: Abonne): () => void {
  abonnes.add(f)
  return () => {
    abonnes.delete(f)
  }
}
