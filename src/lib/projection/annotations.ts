/**
 * Annotations du mode projection : types, clés STABLES des pages, et conservation dans le navigateur
 * du professeur (IndexedDB, repli `localStorage` ; rien n'est envoyé au serveur).
 *
 * Clés de page (indépendantes de l'ordre des diapos, donc des étapes et inclusions choisies) :
 * - diapo : `d:<cle de la diapo>` — la clé d'une diapo (`diapos.ts`) est `<id de l'étape>:titre`,
 *   `:essentiel`, `:<rang du bloc dans l'étape>`, `:carte<n>`, suivie de `~<n° de page>` pour un
 *   exemple découpé : elle ne dépend que du contenu du chapitre ;
 * - page de l'écran blanc : `b:<id de la page>` ; les pages sont rattachées à la clé de la diapo d'où
 *   on les a ouvertes (`EtatBlanc.blanches`).
 * Une sélection différente au lancement ne perd rien : les annotations d'une diapo absente restent
 * gardées et réapparaissent quand elle revient.
 */
import type { ModeAngle } from './calculatrice'
import { validerExercices } from './exerciceTableau'
import type { PageExercice } from './exerciceTableau'

/** Trait d'annotation (stylo, surligneur ou gomme), en coordonnées de la diapo (1 280 × 720). */
export interface Trait {
  genre?: 'trait'
  id: string
  couleur: string
  gomme: boolean
  /** Surligneur : trait large et transparent (calque « multiply » sous le stylo). */
  fluo?: boolean
  /** Épaisseur en px logiques (défaut : 5 au stylo, 22 au surligneur, 44 à la gomme). */
  epaisseur?: number
  points: [number, number][]
  /** Droite tracée à l'équerre : prolongée jusqu'aux bords de l'écran à l'affichage (page « repère » zoomée). */
  droite?: boolean
}

/** Arc tracé au compas : centre, rayon, angles de départ et d'arrivée (radians, non ramenés à 2π). */
export interface Arc {
  genre: 'arc'
  id: string
  couleur: string
  epaisseur: number
  cx: number
  cy: number
  r: number
  /** Rayon vertical (en px de la page) si différent de `r` : arc tracé sur un repère aux axes d'échelles différentes
   * (cercle à l'écran, ellipse dans la page). */
  ry?: number
  a0: number
  a1: number
}

/** Résultat de la calculatrice épinglé sur la diapo (étiquette KaTeX déplaçable). */
export interface Epingle {
  genre: 'epingle'
  id: string
  x: number
  y: number
  latex: string
}

/** Courbe du traceur (page « repère ») : on garde l'EXPRESSION, jamais les pixels (l'échelle peut changer). */
export interface Courbe {
  genre: 'courbe'
  id: string
  /** f, g, h… */
  nom: string
  /** Saisie lue par le parseur (sans « f(x) = »). */
  saisie: string
  couleur: string
  epaisseur: number
}

export type ElementAnnotation = Trait | Arc | Epingle | Courbe

export type FondBlanc = 'uni' | 'quadrille' | 'repere'

/** Vue d'une page « repère » (zoom, déplacement ; voir `vue.ts`) : unités pour 40 px d'écran par axe, point du
 * repère au centre de l'écran. */
export interface VueRepere {
  ex: number
  ey: number
  cx: number
  cy: number
}

/** Page de l'écran blanc : son fond, l'échelle du repère, le mode des angles et les points à marquer. */
export interface PageBlanche {
  id: string
  fond: FondBlanc
  /** Unités par carreau (repère). */
  ex: number
  ey: number
  angle: ModeAngle
  marques: { zeros: boolean; extremums: boolean; intersections: boolean }
  /** Vue du repère (zoom, déplacement), gardée par page ; absente = vue de départ. Les annotations sont stockées en
   * coordonnées de la page à sa vue de départ (`ex`, `ey`, origine au centre) et suivent le graphique. */
  vue?: VueRepere
}

export const cleDiapo = (cle: string) => `d:${cle}`
export const clePageBlanche = (id: string) => `b:${id}`

export function nouvellePageBlanche(modele?: Partial<PageBlanche>): PageBlanche {
  return {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    fond: modele?.fond ?? 'uni',
    ex: modele?.ex ?? 1,
    ey: modele?.ey ?? 1,
    angle: modele?.angle ?? 'rad',
    marques: { zeros: false, extremums: false, intersections: false, ...modele?.marques },
  }
}

/** Ce qui est conservé pour un chapitre. */
export interface DonneesAnnotations {
  v: 1
  /** Éléments par clé de page (seulement les pages non vides). */
  pages: [string, ElementAnnotation[]][]
  /** Pages de l'écran blanc, par clé de diapo, dans l'ordre. */
  blanches: Record<string, PageBlanche[]>
  /** Dernière page blanche vue, par clé de diapo. */
  vues: Record<string, string>
  /** Fond proposé pour une nouvelle page. */
  fond: FondBlanc
  /** Pages d'exercice projetées (P1), par clé de diapo, dans l'ordre (facultatif : données d'avant le 28/11/2026). */
  exercices?: Record<string, PageExercice[]>
  maj: number
}

export const donneesVides = (): DonneesAnnotations => ({ v: 1, pages: [], blanches: {}, vues: {}, fond: 'uni', maj: Date.now() })

/** Une page blanche « à garder » (exportée, comptée) : au moins un élément écrit dessus. Une page restée vierge — écran
 * blanc ouvert pour masquer la diapo, ou page vide au fond repris de la précédente — ne compte pas. */
export function pageBlancheUtile(p: PageBlanche, pages: Map<string, ElementAnnotation[]>): boolean {
  return (pages.get(clePageBlanche(p.id))?.length ?? 0) > 0
}

/** Résumé : nombre de diapos annotées et de pages blanches à exporter. */
export function resumeAnnotations(d: Pick<DonneesAnnotations, 'pages' | 'blanches'> & Pick<Partial<DonneesAnnotations>, 'exercices'>): { diapos: number; blanches: number; exercices?: number } {
  const pages = new Map(d.pages)
  let diapos = 0
  for (const [cle, l] of d.pages) if (cle.startsWith('d:') && l.length > 0) diapos++
  let blanches = 0
  for (const liste of Object.values(d.blanches)) for (const p of liste) if (pageBlancheUtile(p, pages)) blanches++
  // Exercices projetés (P1) : comptés seulement si on les passe (ils partent tous dans l'export, même sans trait).
  if (!d.exercices) return { diapos, blanches }
  let exercices = 0
  for (const liste of Object.values(d.exercices)) exercices += liste.length
  return { diapos, blanches, exercices }
}

/** Même résumé, limité aux diapos d'une sélection (clés AVANT découpage : `s:3` couvre aussi `s:3~1`, `s:3~2`). */
export function resumeDansSelection(d: Pick<DonneesAnnotations, 'pages' | 'blanches'>, clesDiapos: string[]): { diapos: number; blanches: number } {
  const cles = new Set(clesDiapos)
  const dedans = (cle: string) => cles.has(cle) || cles.has(cle.split('~')[0])
  const pages: [string, ElementAnnotation[]][] = d.pages.filter(([k]) => !k.startsWith('d:') || dedans(k.slice(2)))
  const blanches = Object.fromEntries(Object.entries(d.blanches).filter(([k]) => dedans(k)))
  return resumeAnnotations({ pages, blanches })
}

export const aDesAnnotations = (d: Pick<DonneesAnnotations, 'pages' | 'blanches'> & Pick<Partial<DonneesAnnotations>, 'exercices'>) => {
  const r = resumeAnnotations(d)
  return r.diapos + r.blanches + (r.exercices ?? 0) > 0
}

// ---------- conservation (IndexedDB, repli localStorage) ----------

const BASE = 'math-belgium-projection'
const MAGASIN = 'annotations'
const cleChapitre = (c: { levelSlug: string; slug: string }) => `${c.levelSlug}/${c.slug}`
const cleLocale = (c: { levelSlug: string; slug: string }) => `projection-annotations:${cleChapitre(c)}`

let base: Promise<IDBDatabase | null> | null = null
function ouvrirBase(): Promise<IDBDatabase | null> {
  base ??= new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const r = indexedDB.open(BASE, 1)
      r.onupgradeneeded = () => {
        if (!r.result.objectStoreNames.contains(MAGASIN)) r.result.createObjectStore(MAGASIN)
      }
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => resolve(null)
      r.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return base
}

function requete<T>(f: (s: IDBObjectStore) => IDBRequest, mode: IDBTransactionMode): Promise<T | undefined> {
  return ouvrirBase().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        if (!db) return reject(new Error('IndexedDB indisponible'))
        try {
          const t = db.transaction(MAGASIN, mode)
          const r = f(t.objectStore(MAGASIN))
          t.oncomplete = () => resolve(r.result as T)
          t.onerror = () => reject(t.error)
          t.onabort = () => reject(t.error)
        } catch (e) {
          reject(e)
        }
      }),
  )
}

/** Lecture tolérante : une donnée abîmée vaut « rien de gardé », jamais une erreur. */
function valider(brut: unknown): DonneesAnnotations | null {
  if (!brut || typeof brut !== 'object') return null
  const d = brut as Partial<DonneesAnnotations>
  if (d.v !== 1 || !Array.isArray(d.pages)) return null
  const pages = d.pages.filter((x): x is [string, ElementAnnotation[]] => Array.isArray(x) && typeof x[0] === 'string' && Array.isArray(x[1]))
  const blanches: Record<string, PageBlanche[]> = {}
  for (const [cle, l] of Object.entries(d.blanches ?? {})) {
    if (!Array.isArray(l)) continue
    const ok = l.filter((p) => p && typeof p.id === 'string').map((p) => nouvellePageBlancheDepuis(p))
    if (ok.length) blanches[cle] = ok
  }
  const vues: Record<string, string> = {}
  for (const [cle, id] of Object.entries(d.vues ?? {})) if (typeof id === 'string') vues[cle] = id
  const fond = d.fond === 'quadrille' || d.fond === 'repere' ? d.fond : 'uni'
  const exercices = validerExercices(d.exercices)
  return { v: 1, pages, blanches, vues, fond, ...(Object.keys(exercices).length ? { exercices } : {}), maj: typeof d.maj === 'number' ? d.maj : 0 }
}

function nouvellePageBlancheDepuis(p: Partial<PageBlanche>): PageBlanche {
  const ech = (v: unknown) => (typeof v === 'number' && v > 0 && v <= 100 ? v : 1)
  const fini = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  const v = p.vue
  const vue = v && fini(v.ex) && fini(v.ey) && fini(v.cx) && fini(v.cy) && v.ex > 0 && v.ey > 0 ? { ex: v.ex, ey: v.ey, cx: v.cx, cy: v.cy } : undefined
  return {
    ...(vue ? { vue } : {}),
    id: String(p.id),
    fond: p.fond === 'quadrille' || p.fond === 'repere' ? p.fond : 'uni',
    ex: ech(p.ex),
    ey: ech(p.ey),
    angle: p.angle === 'deg' ? 'deg' : 'rad',
    marques: { zeros: !!p.marques?.zeros, extremums: !!p.marques?.extremums, intersections: !!p.marques?.intersections },
  }
}

export async function lireAnnotations(chapitre: { levelSlug: string; slug: string }): Promise<DonneesAnnotations | null> {
  try {
    const d = await requete<unknown>((s) => s.get(cleChapitre(chapitre)), 'readonly')
    if (d !== undefined) return valider(d)
  } catch {
    // IndexedDB indisponible (navigation privée de certains navigateurs) : repli localStorage.
  }
  try {
    return valider(JSON.parse(localStorage.getItem(cleLocale(chapitre)) ?? 'null'))
  } catch {
    return null
  }
}

export async function enregistrerAnnotations(chapitre: { levelSlug: string; slug: string }, d: DonneesAnnotations): Promise<void> {
  const vide = d.pages.length === 0 && Object.keys(d.blanches).length === 0 && Object.keys(d.exercices ?? {}).length === 0
  try {
    if (vide) await requete((s) => s.delete(cleChapitre(chapitre)), 'readwrite')
    else await requete((s) => s.put(d, cleChapitre(chapitre)), 'readwrite')
    try {
      localStorage.removeItem(cleLocale(chapitre))
    } catch {
      // rien
    }
    return
  } catch {
    // repli ci-dessous
  }
  try {
    if (vide) localStorage.removeItem(cleLocale(chapitre))
    else localStorage.setItem(cleLocale(chapitre), JSON.stringify(d))
  } catch {
    // Stockage plein ou refusé : les annotations valent pour cette visite.
  }
}
