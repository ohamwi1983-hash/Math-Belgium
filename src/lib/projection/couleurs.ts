/**
 * Nuancier du stylo et du surligneur (mode projection), PUR sauf la mémoire des dernières couleurs
 * (`localStorage`, try/catch : sans elle, le nuancier marche quand même).
 *
 * - Stylo : teintes foncées à moyennes, TOUJOURS lisibles sur la diapo claire (#fbfaf7) : contraste ≥ 3 (trait épais,
 *   comme un gros caractère) — une couleur trop claire est assombrie jusqu'à l'atteindre.
 * - Surligneur : teintes pastel (posées en `multiply` : le texte noir reste noir dessous).
 */

const FOND_DIAPO = '#fbfaf7'
/** Contraste minimal d'un trait de stylo sur la diapo claire. */
export const CONTRASTE_STYLO = 3

const hex2 = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')

/** HSL (teinte en degrés, saturation et clarté en %) → « #rrggbb ». */
export function hslVersHex(h: number, s: number, l: number): string {
  const t = (((h % 360) + 360) % 360) / 360
  const S = s / 100
  const Lc = l / 100
  const q = Lc < 0.5 ? Lc * (1 + S) : Lc + S - Lc * S
  const p = 2 * Lc - q
  const canal = (d: number) => {
    let x = t + d
    if (x < 0) x += 1
    if (x > 1) x -= 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  return `#${hex2(canal(1 / 3) * 255)}${hex2(canal(0) * 255)}${hex2(canal(-1 / 3) * 255)}`
}

/** « #rrggbb » → [r, g, b] (0–255) ; null si illisible. */
export function hexVersRgb(c: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(c.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Luminance relative (WCAG). */
function luminance(c: string): number {
  const rgb = hexVersRgb(c)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((v) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Rapport de contraste WCAG entre deux couleurs. */
export function contraste(a: string, b: string = FOND_DIAPO): number {
  const [la, lb] = [luminance(a), luminance(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Couleur de stylo : teinte + clarté choisies, assombrie si besoin jusqu'à rester lisible sur la diapo claire. */
export function couleurStylo(teinte: number, clarte: number, saturation = 70): string {
  let l = Math.max(5, Math.min(60, clarte))
  let c = hslVersHex(teinte, saturation, l)
  while (contraste(c) < CONTRASTE_STYLO && l > 5) {
    l -= 1
    c = hslVersHex(teinte, saturation, l)
  }
  return c
}

/** Couleur de surligneur : pastel lumineux de la teinte choisie. */
export const couleurFluo = (teinte: number) => hslVersHex(teinte, 100, 76)

/** Grille du stylo : 22 teintes (11 teintes × 2 clartés) + 2 gris, toutes lisibles sur la diapo claire. */
export const NUANCIER_STYLO: string[] = (() => {
  const teintes = [0, 18, 32, 48, 85, 135, 170, 195, 215, 250, 290]
  const res: string[] = []
  for (const l of [44, 30]) for (const h of teintes) res.push(couleurStylo(h, l, h === 48 ? 85 : 72))
  res.push('#4b5866', '#182430')
  return res
})()

/** Grille du surligneur : 12 pastels (teintes tous les 30°). */
export const NUANCIER_FLUO: string[] = Array.from({ length: 12 }, (_, i) => couleurFluo(i * 30))

/** Teinte (degrés) d'une couleur « #rrggbb », pour placer le curseur sur la couleur choisie. */
export function teinteDe(c: string): { h: number; l: number } {
  const rgb = hexVersRgb(c)
  if (!rgb) return { h: 0, l: 40 }
  const [r, g, b] = rgb.map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = ((max + min) / 2) * 100
  if (max === min) return { h: 0, l }
  const d = max - min
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return { h: Math.round(h), l: Math.round(l) }
}

// ---------- dernières couleurs choisies (navigateur) ----------

const CLE = 'projection:couleurs-recentes'
export const MAX_RECENTES = 3

export interface CouleursRecentes {
  stylo: string[]
  fluo: string[]
}

export function lireRecentes(): CouleursRecentes {
  try {
    const d = JSON.parse(localStorage.getItem(CLE) ?? 'null') as Partial<CouleursRecentes> | null
    const ok = (l: unknown) => (Array.isArray(l) ? l.filter((c): c is string => typeof c === 'string' && !!hexVersRgb(c)).slice(0, MAX_RECENTES) : [])
    return { stylo: ok(d?.stylo), fluo: ok(d?.fluo) }
  } catch {
    return { stylo: [], fluo: [] }
  }
}

/** Ajoute une couleur en tête des dernières choisies (sans doublon, ni couleur rapide), mémorisée si possible. */
export function ajouterRecente(r: CouleursRecentes, genre: 'stylo' | 'fluo', couleur: string, rapides: string[]): CouleursRecentes {
  const c = couleur.toLowerCase()
  if (rapides.some((x) => x.toLowerCase() === c)) return r
  const liste = [c, ...r[genre].filter((x) => x.toLowerCase() !== c)].slice(0, MAX_RECENTES)
  const n = { ...r, [genre]: liste }
  try {
    localStorage.setItem(CLE, JSON.stringify(n))
  } catch {
    // Stockage refusé : les couleurs valent pour cette visite.
  }
  return n
}
