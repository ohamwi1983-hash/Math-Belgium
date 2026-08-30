// Data schema for the shared `ChapterPage` template. A chapter is authored as data
// (this schema), never as one-off JSX — see CLAUDE.md.

export type IllustrationSpec =
  | { kind: 'machine' }
  | {
      kind: 'domainLine'
      /** Numeric range mapped onto the visible axis. */
      min: number
      max: number
      /** Accepted ("good") segments, using `min`/`max` as open-ended sentinels. */
      segments: { from: number | 'min'; to: number | 'max' }[]
      points: { value: number; closed: boolean; label: string; tone: 'good' | 'bad' }[]
      /** Small unlabeled/faint reference ticks, e.g. the origin. */
      extraTicks?: { value: number; label: string }[]
      axisLabel: string
      caption: string
    }
  | { kind: 'compositionIntro' }
  | {
      kind: 'chain'
      stages: string[]
      highlightIndex: number
      outputLabel: string
      caption: string
    }
  | { kind: 'compositionSchematic' }
  | {
      kind: 'compositionNumeric'
      fLabel: string
      gLabel: string
      a: number
      fa: number
      gfa: number
      xMax: number
      topYMax: number
      bottomYMax: number
      caption: string
    }
  | {
      kind: 'functionGraph'
      fn: (x: number) => number
      /** Où commence le tracé de la courbe (peut être > xAxisMin pour éviter une asymptote proche de l'axe). */
      xMin: number
      xMax: number
      /** Où l'axe vertical est planté ; par défaut 0 (l'origine réelle), même si la courbe démarre plus loin. */
      xAxisMin?: number
      xTicks: number[]
      markX: number
      markLabel: string
      xAxisLabel: string
      yAxisLabel: string
      caption: string
    }

export interface ExempleStep {
  tag: string
  text: string
}

export type Block =
  | { kind: 'para'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'rappel'; label?: string; items: string[] }
  | { kind: 'methode'; label?: string; items: string[] }
  | { kind: 'attention'; label?: string; text: string }
  | { kind: 'astuce'; label?: string; text: string; items?: string[] }
  | { kind: 'piege'; label?: string; text: string }
  | {
      kind: 'exemple'
      badge?: string
      formula?: string
      steps: ExempleStep[]
      result: { tag: string; text: string; isEmpty?: boolean }
      illustration?: IllustrationSpec
    }
  | { kind: 'wrongRight'; wrongTag: string; wrong: string; rightTag: string; right: string }
  | { kind: 'illustration'; illustration: IllustrationSpec }
  | {
      kind: 'entrainement'
      title: string
      generatorId: string
      description: string[]
      chantier: string
      whereLabel: string
    }

export interface ChapterSection {
  id: string
  number: number
  title: string
  kicker?: string
  blocks: Block[]
}

export interface ChapterContent {
  /** Human-readable level label, e.g. "5e (4h)". */
  level: string
  /** Slug used in the generator-link convention and in routes, e.g. "5e-4h". */
  levelSlug: string
  chapterNumber: number
  title: string
  /** Route slug for this chapter within its level. */
  slug: string
  lede: string
  /** Optional mise en contexte before the numbered sections (e.g. "une fonction, c'est une machine"). */
  intro?: {
    title: string
    blocks: Block[]
  }
  sections: ChapterSection[]
  recap: {
    items: string[]
    checklist?: { label?: string; items: string[] }
    forward?: string
  }
}
