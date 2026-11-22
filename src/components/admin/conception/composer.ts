import {
  calculatriceIndispensable,
  catalogueVariantesExercice,
  sommeParVariante,
  varianteExigeCalculatrice,
  type IdGenerateurPilote,
  type LigneSelection,
  type Processus,
} from '../../../lib/evaluationPayload'
import { REPARTITION_PROCESSUS } from '../../../lib/repartitionProcessus'

/**
 * « Façons de composer » de la page de conception (proposition B, décision de l'utilisateur du
 * 21/11/2026) : elles REMPLISSENT la sélection du panneau — rien n'est tiré ni généré ici, le
 * professeur ajuste ensuite exercice par exercice. Module pur (aucun état React).
 *
 * Règles de tirage respectées :
 * - variantes = celles que le panneau propose (`catalogueVariantesExercice`) : en évaluation, un
 *   groupe « à verdict » reste UNE rangée (jamais le verdict choisi par la recette) ;
 * - calculatrice interdite (évaluation) : variantes qui l'exigent et générateurs
 *   `calculatriceIndispensable` exclus ;
 * - aucune case « cas particulier » cochée, aucun paramètre décoché : exercices complets ;
 * - démonstrations jamais choisies d'office (longues, au professeur de décider).
 */

export type FaconComposer = 'equilibree' | 'notions' | 'evaluation'

export interface ContexteComposition {
  /** Lignes VIERGES des chapitres (mêmes identités et même ordre que le panneau). */
  lignes: LigneSelection[]
  mode: 'exercice' | 'evaluation'
  calculatriceInterdite: boolean
  /** Nombre de questions disponibles d'une ligne « formule » / « comprehension » / « vraiFaux ». */
  disponibles: (ligne: LigneSelection) => number
  /** Durée estimée d'UN exercice de la variante (minutes), `undefined` si inconnue. */
  dureeVariante: (ligne: LigneSelection, varianteId: string) => number | undefined
  /** Durée visée (minutes) pour « Préparer l'évaluation ». */
  dureeCible: number
  /** Répartition de « Préparer l'évaluation » (fractions par processus, somme 1) : celle réglée par le
   * professeur (`repartitionProcessus.ts::fractionsRepartition`), sinon `REPARTITION_PROCESSUS`. */
  repartition?: Readonly<Record<Processus, number>>
  /** « Sur quelques notions » : clés `chapitre::section` cochées. */
  sections?: Set<string>
  aleatoire?: () => number
}

export interface ResultatComposition {
  lignes: LigneSelection[]
  /** Nombre de questions/exercices ajoutés (affirmations vrai/faux comptées une par une). */
  questions: number
  notions: number
}

/** Unité qu'une recette peut ajouter à la sélection. */
interface Unite {
  index: number
  processus: Processus
  cleSection: string
  chapitreSlug: string
  /** Variante (exercice) ; absent pour les questions du processus 1 (vrai/faux, formule…). */
  variante?: string
  type: LigneSelection['type']
}

export const cleSectionComposer = (chapitreSlug: string, sectionId: string) => `${chapitreSlug}::${sectionId}`

function melanger<T>(t: T[], alea: () => number): T[] {
  const r = [...t]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Variantes qu'une recette peut choisir pour une ligne d'exercice. */
export function variantesComposables(ligne: LigneSelection, mode: 'exercice' | 'evaluation', calculatriceInterdite: boolean): string[] {
  const id = ligne.cle as IdGenerateurPilote
  const interdite = mode === 'evaluation' && calculatriceInterdite
  if (interdite && calculatriceIndispensable(id, [])) return []
  return catalogueVariantesExercice(id, mode, [])
    .filter((v) => !(interdite && varianteExigeCalculatrice(id, v.id)))
    .map((v) => v.id)
}

function unites(ctx: ContexteComposition): Unite[] {
  const res: Unite[] = []
  ctx.lignes.forEach((l, index) => {
    const base = { index, processus: l.processus, cleSection: cleSectionComposer(l.chapitreSlug, l.sectionId), chapitreSlug: l.chapitreSlug, type: l.type }
    if (l.type === 'exercice') {
      for (const v of variantesComposables(l, ctx.mode, ctx.calculatriceInterdite)) res.push({ ...base, variante: v })
    } else if (l.type === 'vraiFaux' || l.type === 'formule' || l.type === 'comprehension') {
      if (ctx.disponibles(l) > 0) res.push(base)
    }
  })
  return res
}

/** Applique les choix : `n` exercices d'une variante, ou `n` questions d'une ligne. */
class Selection {
  readonly lignes: LigneSelection[]
  questions = 0
  readonly sections = new Set<string>()
  private readonly ctx: ContexteComposition
  constructor(ctx: ContexteComposition) {
    this.ctx = ctx
    this.lignes = ctx.lignes.map((l) => ({ ...l, ...(l.parVariante ? { parVariante: { ...l.parVariante } } : {}) }))
  }
  ajouter(u: Unite, n = 1): boolean {
    const l = this.lignes[u.index]
    if (u.variante) {
      const parVariante = { ...l.parVariante, [u.variante]: (l.parVariante?.[u.variante] ?? 0) + n }
      this.lignes[u.index] = { ...l, parVariante, nombre: sommeParVariante(parVariante) }
    } else {
      const max = this.ctx.disponibles(l)
      const prochain = Math.min(max, l.nombre + n)
      if (prochain === l.nombre) return false
      this.lignes[u.index] = { ...l, nombre: prochain }
      n = prochain - l.nombre
    }
    this.questions += n
    this.sections.add(u.cleSection)
    return true
  }
  nombreDe(u: Unite): number {
    const l = this.lignes[u.index]
    return u.variante ? (l.parVariante?.[u.variante] ?? 0) : l.nombre
  }
}

/** Ordre des sections pour répartir : chapitres en alternance, sections mélangées dans chacun. */
function sectionsReparties(liste: Unite[], alea: () => number): string[] {
  const parChapitre = new Map<string, string[]>()
  for (const u of liste) {
    const s = parChapitre.get(u.chapitreSlug) ?? []
    if (!s.includes(u.cleSection)) s.push(u.cleSection)
    parChapitre.set(u.chapitreSlug, s)
  }
  const files = [...parChapitre.values()].map((s) => melanger(s, alea))
  const ordre: string[] = []
  while (files.some((f) => f.length > 0)) for (const f of files) if (f.length > 0) ordre.push(f.shift()!)
  return ordre
}

/** Choisit `nombre` exercices parmi `candidats`, une notion après l'autre (toutes les notions avant
 * d'en reprendre une), en évitant de répéter une variante tant que c'est possible. */
function repartir(sel: Selection, candidats: Unite[], nombre: number, alea: () => number) {
  if (candidats.length === 0 || nombre <= 0) return
  const ordre = sectionsReparties(candidats, alea)
  let ajoutes = 0
  for (let tour = 0; ajoutes < nombre && tour < 6; tour++) {
    for (const s of ordre) {
      if (ajoutes >= nombre) break
      const ici = melanger(candidats.filter((u) => u.cleSection === s), alea)
      // Plutôt un générateur / une variante pas encore pris ; sinon on en ajoute un de plus.
      const u = ici.find((x) => sel.nombreDe(x) === 0) ?? ici[0]
      if (u && sel.ajouter(u)) ajoutes++
    }
  }
}

/** Une question du processus 1 : vrai/faux (3 affirmations) d'abord, sinon formule, sinon exercice. */
function ajouterConnaitre(sel: Selection, tout: Unite[], alea: () => number, affirmations = 3): boolean {
  const p1 = tout.filter((u) => u.processus === 1)
  const vf = melanger(p1.filter((u) => u.type === 'vraiFaux'), alea)[0]
  if (vf) return sel.ajouter(vf, affirmations)
  const formule = melanger(p1.filter((u) => u.type === 'formule'), alea)[0]
  if (formule) return sel.ajouter(formule, 1)
  const ex = melanger(p1.filter((u) => u.type === 'exercice'), alea)[0]
  if (ex) return sel.ajouter(ex, 1)
  const comp = melanger(p1.filter((u) => u.type === 'comprehension'), alea)[0]
  return comp ? sel.ajouter(comp, 1) : false
}

/** Feuille équilibrée : ≈ 6 exercices sur tout le chapitre — 1 Connaître, 4 Appliquer, 1 Transférer
 * (la part d'un processus absent passe à Appliquer). */
function equilibree(ctx: ContexteComposition, alea: () => number): Selection {
  const sel = new Selection(ctx)
  const tout = unites(ctx)
  const p2 = tout.filter((u) => u.processus === 2 && u.type === 'exercice')
  const p3 = tout.filter((u) => u.processus === 3 && u.type === 'exercice')
  let appliquer = 4
  if (!ajouterConnaitre(sel, tout, alea)) appliquer++
  if (p3.length > 0) repartir(sel, p3, 1, alea)
  else appliquer++
  repartir(sel, p2.length > 0 ? p2 : p3, appliquer, alea)
  return sel
}

/** Sur quelques notions : pour chaque notion cochée, deux exercices (Appliquer / Transférer) et une
 * question Connaître quand la notion en a. */
function notions(ctx: ContexteComposition, alea: () => number): Selection {
  const sel = new Selection(ctx)
  const choisies = ctx.sections ?? new Set<string>()
  const tout = unites(ctx).filter((u) => choisies.has(u.cleSection))
  for (const s of choisies) {
    const ici = tout.filter((u) => u.cleSection === s)
    const exercices = ici.filter((u) => u.type === 'exercice' && u.processus !== 1)
    if (exercices.length > 0) repartir(sel, exercices, 2, alea)
    if (!ajouterConnaitre(sel, ici, alea, 2) && exercices.length === 0) {
      // Notion sans exercice d'application ni question Connaître : un exercice du processus 1.
      repartir(sel, ici.filter((u) => u.type === 'exercice'), 2, alea)
    }
  }
  return sel
}

/** Préparer l'évaluation : durée visée répartie entre les processus selon la répartition réglée
 * (`ctx.repartition`, sinon `REPARTITION_PROCESSUS` ; les points automatiques suivent la durée, donc
 * les points aussi). Un processus à 0 % n'est JAMAIS choisi. La part d'un processus sans aucune
 * question possible est cédée (`cederParts`). */
function evaluation(ctx: ContexteComposition, alea: () => number): Selection {
  const sel = new Selection(ctx)
  const tout = unites(ctx)
  const candidats = (p: Processus) => tout.filter((u) => u.processus === p)
  const parts = cederParts({ ...(ctx.repartition ?? REPARTITION_PROCESSUS) }, ([1, 2, 3] as const).filter((p) => candidats(p).length > 0))
  const dureeUnite = (u: Unite): number => {
    const l = ctx.lignes[u.index]
    if (u.variante) return ctx.dureeVariante(l, u.variante) ?? 6
    if (u.type === 'vraiFaux') return 2
    if (u.type === 'formule') return 2.5
    return 5
  }
  for (const p of [1, 2, 3] as const) {
    const budget = ctx.dureeCible * parts[p]
    const liste = candidats(p)
    if (budget <= 0 || liste.length === 0) continue
    const ordre = sectionsReparties(liste, alea)
    let duree = 0
    for (let tour = 0; tour < 8 && duree < budget; tour++) {
      let progres = false
      for (const s of ordre) {
        const ici = melanger(liste.filter((u) => u.cleSection === s), alea)
        const u = ici.find((x) => sel.nombreDe(x) === 0) ?? ici[0]
        if (!u) continue
        const d = dureeUnite(u)
        // On s'arrête quand l'ajout dépasserait le budget de plus de la moitié de sa durée.
        if (duree > 0 && duree + d > budget + d / 2) continue
        // Vrai/faux : deux affirmations d'un coup (une seule question imprimée).
        const n = u.type === 'vraiFaux' ? 2 : 1
        if (sel.ajouter(u, n)) {
          duree += d * n
          progres = true
        }
        if (duree >= budget) break
      }
      if (!progres) break
    }
  }
  return sel
}

/**
 * Part d'un processus sans question possible : Connaître ou Transférer → Appliquer (règle d'avant,
 * inchangée pour 25 / 50 / 25) si Appliquer a des questions et une part > 0 ; sinon les processus
 * présents ayant une part > 0, au prorata ; s'il n'y en a aucun, Appliquer s'il est présent, sinon
 * les présents à parts égales. Appliquer absent : sa part va aux présents de la même façon. Un
 * processus présent réglé à 0 % ne reçoit donc rien tant qu'un autre présent a une part.
 */
export function cederParts(parts: Record<Processus, number>, presents: readonly Processus[]): Record<Processus, number> {
  for (const p of [1, 3, 2] as const) {
    if (presents.includes(p) || parts[p] <= 0) continue
    const voulus = presents.filter((q) => parts[q] > 0)
    const receveurs: Processus[] = p !== 2 && voulus.includes(2) ? [2] : voulus.length > 0 ? voulus : presents.includes(2) ? [2] : [...presents]
    const somme = receveurs.reduce((t, q) => t + parts[q], 0)
    for (const q of receveurs) parts[q] += somme > 0 ? (parts[p] * parts[q]) / somme : parts[p] / receveurs.length
    parts[p] = 0
  }
  return parts
}

export function composer(facon: FaconComposer, ctx: ContexteComposition): ResultatComposition {
  const alea = ctx.aleatoire ?? Math.random
  const sel = facon === 'equilibree' ? equilibree(ctx, alea) : facon === 'notions' ? notions(ctx, alea) : evaluation(ctx, alea)
  return { lignes: sel.lignes, questions: sel.questions, notions: sel.sections.size }
}

/** Processus présents dans une section (lignes utilisables seulement) — pastilles 1 / 2 / 3. */
export function processusDeLignes(lignes: LigneSelection[], utilisable: (l: LigneSelection) => boolean): Processus[] {
  return ([1, 2, 3] as const).filter((p) => lignes.some((l) => l.processus === p && utilisable(l)))
}
