import type { Block, ChapterContent, ChapterSection, ExempleStep, IllustrationSpec, InteractiveWidgetTag } from '../../content/types'
import { textesBloc, titreCourt } from '../parcoursChapitre'

/**
 * Mode « Projeter en classe » : diapos 16:9 construites AUTOMATIQUEMENT à partir des données du
 * chapitre (`ChapterContent`), sans aucun contenu réécrit — voir `.claude/rules/chapter-components.md`,
 * section « Mode projection ». Ce module est PUR (aucun React) : il sert au lanceur (nombre de diapos
 * par étape), à la page de projection et à l'export PowerPoint.
 *
 * Ordre des diapos d'une étape : titre de l'étape → « L'essentiel » (+ première figure) → dans l'ordre
 * écrit : figures, exemples résolus, démonstrations, ateliers → cartes « Teste-toi ».
 */

export type Inclusion = 'essentiel' | 'figures' | 'exemples' | 'teste' | 'ateliers' | 'demonstrations'

export const INCLUSIONS: { id: Inclusion; label: string }[] = [
  { id: 'essentiel', label: 'L’essentiel' },
  { id: 'figures', label: 'Figures' },
  { id: 'exemples', label: 'Exemples résolus (une étape par clic)' },
  { id: 'teste', label: 'Cartes « Teste-toi » avec minuteur' },
  { id: 'ateliers', label: 'Ateliers (manipulés en direct)' },
  { id: 'demonstrations', label: 'Démonstrations' },
]

export const INCLUSIONS_DEFAUT: Inclusion[] = ['essentiel', 'figures', 'exemples', 'teste', 'ateliers']

export type Ecran = 'un' | 'deux'

export interface ChoixProjection {
  etapes: string[]
  inclure: Inclusion[]
  ecran: Ecran
}

export type FigureBloc = Extract<Block, { kind: 'illustration' | 'illustrationGroup' }>

export interface Ligne {
  tag: string
  text: string
  resultat?: boolean
  vide?: boolean
}

interface Base {
  /** Clé stable (React, synchronisation). */
  cle: string
  section: ChapterSection
  /** Nombre d'étapes de révélation (0 : la diapo est complète d'emblée). */
  pas: number
  /** Notes du professeur (RichText) : corrigé, réponse, légende. */
  notes: string[]
}

export type Diapo =
  | (Base & { type: 'titre'; intertitres: string[] })
  | (Base & { type: 'essentiel'; phrases: string[]; figure?: FigureBloc })
  | (Base & { type: 'figure'; titre: string; figure: FigureBloc })
  | (Base & {
      type: 'exemple'
      enonce?: string
      badge?: string
      lignes: Ligne[]
      illustration?: IllustrationSpec
      /** Rang (0…) de la première ligne de cette diapo dans l'exemple entier (exemple découpé). */
      debut: number
      total: number
    })
  | (Base & { type: 'libre'; label: string; demo: boolean; blocs: Block[]; debut: number; total: number })
  | (Base & { type: 'teste'; question: string; reponse: string; numero: number; nombre: number })
  | (Base & { type: 'atelier'; tag: InteractiveWidgetTag; label: string; caption?: string })

export type TypeDiapo = Diapo['type']

/** Une démonstration = un `exempleLibre` dont le label commence par « Démonstration ». */
export function estDemonstration(b: Block): boolean {
  return b.kind === 'exempleLibre' && /^d[ée]monstration/i.test((b.label ?? '').trim())
}

function legende(f: FigureBloc): string | undefined {
  if (f.kind === 'illustration') return 'caption' in f.illustration ? (f.illustration.caption as string) : undefined
  const l = f.items.map((it) => ('caption' in it ? (it.caption as string) : '')).filter(Boolean)
  return l.length ? l.join(' · ') : undefined
}

function textesNotes(blocs: Block[]): string[] {
  return blocs.flatMap(textesBloc).filter((t): t is string => !!t && t.trim() !== '')
}

/** Diapos d'UNE étape, avant découpage (pagination) des exemples trop longs. */
export function diaposEtape(section: ChapterSection, inclure: Inclusion[]): Diapo[] {
  const avec = (i: Inclusion) => inclure.includes(i)
  const res: Diapo[] = []
  const id = section.id
  const intertitres = section.blocks.filter((b): b is Extract<Block, { kind: 'subheading' }> => b.kind === 'subheading').map((b) => b.text)
  res.push({
    type: 'titre',
    cle: `${id}:titre`,
    section,
    pas: 0,
    intertitres,
    notes: [`Étape ${section.number} : ${section.title}`, ...(section.kicker ? [section.kicker] : []), ...(section.essentiel ?? [])],
  })

  const figures = section.blocks.filter((b): b is FigureBloc => b.kind === 'illustration' || b.kind === 'illustrationGroup')
  let figureEssentiel: FigureBloc | undefined
  if (avec('essentiel') && section.essentiel && section.essentiel.length > 0) {
    // Figure à côté des phrases, sauf si elles sont longues : elle aurait fait descendre le texte sous
    // 28 px ; elle passe alors sur sa propre diapo (« Figure »), juste après.
    const longueurEssentiel = section.essentiel.reduce((n, t) => n + t.replace(/\$[^$]+\$/g, 'xxxxxx').length, 0)
    figureEssentiel = avec('figures') && longueurEssentiel <= 300 ? figures[0] : undefined
    res.push({
      type: 'essentiel',
      cle: `${id}:essentiel`,
      section,
      pas: 0,
      phrases: section.essentiel,
      figure: figureEssentiel,
      notes: [...section.essentiel, ...(figureEssentiel && legende(figureEssentiel) ? [`Figure : ${legende(figureEssentiel)}`] : [])],
    })
  }

  let intertitre = titreCourt(section)
  section.blocks.forEach((b, i) => {
    const cle = `${id}:${i}`
    switch (b.kind) {
      case 'subheading':
        intertitre = b.text
        break
      case 'illustration':
      case 'illustrationGroup':
        if (avec('figures') && b !== figureEssentiel) {
          const l = legende(b)
          res.push({ type: 'figure', cle, section, pas: 0, titre: intertitre, figure: b, notes: l ? [l] : [] })
        }
        break
      case 'exemple': {
        if (!avec('exemples')) break
        const lignes: Ligne[] = b.steps.map((s: ExempleStep) => ({ tag: s.tag, text: s.text }))
        if (b.result.tag.trim() !== '' || b.result.text.trim() !== '') lignes.push({ tag: b.result.tag, text: b.result.text, resultat: true, vide: b.result.isEmpty })
        res.push({
          type: 'exemple',
          cle,
          section,
          pas: lignes.length,
          enonce: b.formula,
          badge: b.badge,
          lignes,
          illustration: b.illustration,
          debut: 0,
          total: lignes.length,
          notes: [...(b.formula ? [b.formula] : []), ...lignes.map((l) => (l.tag ? `${l.tag} : ${l.text}` : l.text))],
        })
        break
      }
      case 'exempleLibre': {
        const demo = estDemonstration(b)
        if (demo ? !avec('demonstrations') : !avec('exemples')) break
        const blocs = b.blocks.filter((x) => x.kind !== 'video' && x.kind !== 'entrainement' && x.kind !== 'atelier')
        if (blocs.length === 0) break
        res.push({
          type: 'libre',
          cle,
          section,
          pas: blocs.length - 1,
          label: b.label ?? (demo ? 'Démonstration' : 'Exemple résolu'),
          demo,
          blocs,
          debut: 0,
          total: blocs.length,
          notes: textesNotes(blocs),
        })
        break
      }
      case 'atelier':
        if (avec('ateliers')) res.push({ type: 'atelier', cle, section, pas: 0, tag: b.tag, label: b.label, caption: b.caption, notes: b.caption ? [b.caption] : [] })
        break
      default:
        break
    }
  })

  if (avec('teste') && section.cartes) {
    const n = section.cartes.length
    section.cartes.forEach((c, i) => {
      res.push({ type: 'teste', cle: `${id}:carte${i}`, section, pas: 1, question: c.question, reponse: c.reponse, numero: i + 1, nombre: n, notes: [`Réponse : ${c.reponse}`] })
    })
  }
  return res
}

/** Toutes les diapos des étapes choisies, dans l'ordre du chapitre. */
export function construireDiapos(chapter: ChapterContent, choix: Pick<ChoixProjection, 'etapes' | 'inclure'>): Diapo[] {
  return chapter.sections.filter((s) => choix.etapes.includes(s.id)).flatMap((s) => diaposEtape(s, choix.inclure))
}

/** Exemple ou démonstration découpé : la page `debut…debut+n` d'une diapo paginable. */
export function pageDeDiapo(d: Diapo, debut: number, fin: number, rang: number): Diapo {
  if (d.type === 'exemple') {
    const lignes = d.lignes.slice(debut, fin)
    return { ...d, cle: `${d.cle}~${rang}`, lignes, debut, pas: lignes.length }
  }
  if (d.type === 'libre') {
    const blocs = d.blocs.slice(debut, fin)
    return { ...d, cle: `${d.cle}~${rang}`, blocs, debut, pas: blocs.length - 1 }
  }
  return d
}

export const estPaginable = (d: Diapo) => d.type === 'exemple' || d.type === 'libre'

// ---------- mémorisation du choix (navigateur) et URL de la projection ----------

const cleChoix = (c: ChapterContent) => `projection:${c.levelSlug}/${c.slug}`

export function lireChoix(chapter: ChapterContent, defaut: ChoixProjection): ChoixProjection {
  try {
    const brut = JSON.parse(localStorage.getItem(cleChoix(chapter)) ?? 'null') as Partial<ChoixProjection> | null
    if (!brut) return defaut
    const ids = new Set(chapter.sections.map((s) => s.id))
    const etapes = Array.isArray(brut.etapes) ? brut.etapes.filter((e) => ids.has(e)) : defaut.etapes
    const inclure = Array.isArray(brut.inclure) ? brut.inclure.filter((i): i is Inclusion => INCLUSIONS.some((x) => x.id === i)) : defaut.inclure
    return { etapes: etapes.length ? etapes : defaut.etapes, inclure, ecran: brut.ecran === 'deux' ? 'deux' : 'un' }
  } catch {
    return defaut
  }
}

export function enregistrerChoix(chapter: ChapterContent, choix: ChoixProjection): void {
  try {
    localStorage.setItem(cleChoix(chapter), JSON.stringify(choix))
  } catch {
    // Stockage refusé (navigation privée…) : le choix vaut pour cette visite.
  }
}

export type Role = 'seul' | 'diapos' | 'prof'

export function urlProjection(chapter: ChapterContent, choix: ChoixProjection, role: Role, extra?: Record<string, string>): string {
  const p = new URLSearchParams()
  p.set('etapes', choix.etapes.join(','))
  p.set('inclure', choix.inclure.join(',') || 'aucun')
  if (role !== 'seul') p.set('role', role)
  for (const [k, v] of Object.entries(extra ?? {})) p.set(k, v)
  return `/${chapter.levelSlug}/${chapter.slug}/projeter?${p.toString()}`
}

export function choixDepuisUrl(chapter: ChapterContent, params: URLSearchParams): { choix: Pick<ChoixProjection, 'etapes' | 'inclure'>; role: Role } {
  const ids = chapter.sections.map((s) => s.id)
  const etapesBrut = params.get('etapes')
  const etapes = etapesBrut ? etapesBrut.split(',').filter((e) => ids.includes(e)) : ids
  const inclureBrut = params.get('inclure')
  const inclure = inclureBrut
    ? inclureBrut.split(',').filter((i): i is Inclusion => INCLUSIONS.some((x) => x.id === i))
    : INCLUSIONS_DEFAUT
  const r = params.get('role')
  return { choix: { etapes: etapes.length ? etapes : ids, inclure }, role: r === 'diapos' || r === 'prof' ? r : 'seul' }
}

// ---------- texte brut (notes du PowerPoint) ----------

const SYMBOLES: Record<string, string> = {
  infty: '∞', cdot: '·', times: '×', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈', pm: '±', mp: '∓',
  to: '→', rightarrow: '→', Rightarrow: '⇒', Leftrightarrow: '⇔', iff: '⇔', in: '∈', notin: '∉', subset: '⊂', cup: '∪', cap: '∩',
  emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', theta: 'θ',
  lambda: 'λ', mu: 'μ', pi: 'π', sigma: 'σ', Sigma: 'Σ', varphi: 'φ', phi: 'φ', omega: 'ω', Omega: 'Ω', circ: '∘', degree: '°',
  mathbb: '', mathrm: '', text: '', textbf: '', boldsymbol: '', operatorname: '', left: '', right: '', displaystyle: '', limits: '',
  quad: ' ', qquad: ' ', ldots: '…', dots: '…', cdots: '⋯', lim: 'lim', ln: 'ln', log: 'log', sin: 'sin', cos: 'cos', tan: 'tan',
  vec: '', overrightarrow: '', overline: '', widehat: '', hat: '', bar: '', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ',
}

/** Approximation lisible d'une formule LaTeX (notes du PowerPoint, jamais affichée sur une diapo). */
const INDICES: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', n: 'ₙ', k: 'ₖ', '+': '₊', '-': '₋' }
const EXPOSANTS: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', n: 'ⁿ', x: 'ˣ', '+': '⁺', '-': '⁻' }
const transcrire = (s: string, table: Record<string, string>, marque: string) =>
  [...s].every((c) => c in table) ? [...s].map((c) => table[c]).join('') : `${marque}(${s})`

export function latexEnTexte(tex: string): string {
  let t = tex.replace(/\{,\}/g, ',').replace(/\\(left|right)\b/g, '')
  t = t
    .replace(/_\{([^{}]*)\}/g, (_, s: string) => transcrire(s, INDICES, '_'))
    .replace(/_([0-9nk])/g, (_, s: string) => INDICES[s])
    .replace(/\^\{([^{}]*)\}/g, (_, s: string) => transcrire(s, EXPOSANTS, '^'))
    .replace(/\^([0-9nx])/g, (_, s: string) => EXPOSANTS[s])
  for (let i = 0; i < 4; i++) {
    t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)').replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
  }
  t = t
    .replace(/\\mathbb\{([NZQRC])\}/g, (_, l: string) => SYMBOLES[l] ?? l)
    .replace(/\\([a-zA-Z]+)/g, (m, nom: string) => (nom in SYMBOLES ? SYMBOLES[nom] : m.slice(1)))
    .replace(/\\[,;:! ]/g, ' ')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/(?<!\\)[{}]/g, '')
    .replace(/\s+/g, ' ')
  return t.trim()
}

export function texteBrut(rich: string): string {
  return rich
    .replace(/\$([^$]+)\$/g, (_, tex: string) => latexEnTexte(tex))
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
