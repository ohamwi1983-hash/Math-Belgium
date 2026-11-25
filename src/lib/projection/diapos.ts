import type { Block, ChapterContent, ChapterSection, ExempleStep, IllustrationSpec, InteractiveWidgetTag } from '../../content/types'
import { textesBloc, titreCourt } from '../parcoursChapitre'
import { generatorLink } from '../generatorLink'

/**
 * Mode « Projeter en classe » : diapos 16:9 construites AUTOMATIQUEMENT à partir des données du
 * chapitre (`ChapterContent`), sans aucun contenu réécrit — voir `.claude/rules/chapter-components.md`,
 * section « Mode projection ». Ce module est PUR (aucun React) : il sert au lanceur (nombre de diapos
 * par étape), à la page de projection et à l'export PowerPoint.
 *
 * Ordre des diapos d'une étape : titre de l'étape → « L'essentiel » (+ première figure) → dans l'ordre
 * écrit : figures, exemples résolus, démonstrations, ateliers → vidéos puis cartes « S'entraîner » (même
 * place que dans le cours : la fin de l'étape) → cartes « Teste-toi ».
 */

export type Inclusion = 'essentiel' | 'figures' | 'exemples' | 'teste' | 'ateliers' | 'demonstrations' | 'entrainement' | 'videos'

export const INCLUSIONS: { id: Inclusion; label: string }[] = [
  { id: 'essentiel', label: 'L’essentiel' },
  { id: 'figures', label: 'Figures' },
  { id: 'exemples', label: 'Exemples résolus (une étape par clic)' },
  { id: 'teste', label: 'Cartes « Teste-toi » avec minuteur' },
  { id: 'ateliers', label: 'Ateliers (manipulés en direct)' },
  { id: 'entrainement', label: 'Cartes « S’entraîner » (QR code vers le générateur)' },
  { id: 'videos', label: 'Vidéos' },
  { id: 'demonstrations', label: 'Démonstrations' },
]

export const INCLUSIONS_DEFAUT: Inclusion[] = ['essentiel', 'figures', 'exemples', 'teste', 'ateliers', 'entrainement', 'videos']

/** Inclusions ajoutées après coup (25/11/2026) : cochées une fois pour un choix mémorisé avant elles. */
const INCLUSIONS_NOUVELLES: Inclusion[] = ['entrainement', 'videos']
const VERSION_CHOIX = 2

/** Site public : le QR code d'une carte « S'entraîner » doit marcher sur le téléphone des élèves (jamais
 * `localhost`). Le bouton « Ouvrir le générateur » (écran du professeur) reste sur l'origine courante. */
export const SITE_PUBLIC = 'https://math-belgium.vercel.app'

/** Lien d'un générateur : relatif (générateur rapatrié, `/entrainement/…`) ou absolu (plateforme-maths). */
export function lienGenerateur(chantier: string, generatorId: string): { relatif: string; public: string } {
  const lien = generatorLink(chantier, generatorId)
  return { relatif: lien, public: lien.startsWith('/') ? SITE_PUBLIC + lien : lien }
}

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
  | (Base & { type: 'entrainement'; titre: string; generatorId: string; description: string[]; where: string; lien: string; lienPublic: string })
  | (Base & { type: 'video'; titre: string; youtubeId?: string })

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
  // Vidéos et cartes « S'entraîner » : à la fin de l'étape, comme dans le cours (`ContenuEtape` : vidéos
  // puis cartes « À toi »), dans leur ordre d'écriture.
  const videos: Diapo[] = []
  const entrainements: Diapo[] = []
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
      case 'video':
        if (avec('videos'))
          videos.push({
            type: 'video',
            cle,
            section,
            pas: 0,
            titre: b.title,
            youtubeId: b.youtubeId,
            notes: [b.youtubeId ? `Vidéo : ${b.title} — https://www.youtube.com/watch?v=${b.youtubeId}` : `Vidéo à venir : ${b.title}`],
          })
        break
      case 'entrainement': {
        if (!avec('entrainement')) break
        const l = lienGenerateur(b.chantier, b.generatorId)
        entrainements.push({
          type: 'entrainement',
          cle,
          section,
          pas: 0,
          titre: b.title,
          generatorId: b.generatorId,
          description: b.description,
          where: b.whereLabel,
          lien: l.relatif,
          lienPublic: l.public,
          notes: [`S'entraîner : ${b.title} (${b.generatorId})`, ...b.description, l.public],
        })
        break
      }
      default:
        break
    }
  })
  res.push(...videos, ...entrainements)

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
    let inclure = Array.isArray(brut.inclure) ? brut.inclure.filter((i): i is Inclusion => INCLUSIONS.some((x) => x.id === i)) : defaut.inclure
    // Choix mémorisé avant l'ajout des vidéos / cartes « S'entraîner » : elles sont cochées une fois.
    if ((brut as { v?: number }).v !== VERSION_CHOIX) inclure = [...inclure, ...INCLUSIONS_NOUVELLES.filter((i) => defaut.inclure.includes(i) && !inclure.includes(i))]
    return { etapes: etapes.length ? etapes : defaut.etapes, inclure, ecran: brut.ecran === 'deux' ? 'deux' : 'un' }
  } catch {
    return defaut
  }
}

export function enregistrerChoix(chapter: ChapterContent, choix: ChoixProjection): void {
  try {
    localStorage.setItem(cleChoix(chapter), JSON.stringify({ ...choix, v: VERSION_CHOIX }))
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
