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
      points: {
        value: number
        closed: boolean
        label: string
        tone: 'good' | 'bad'
        /** Annotation secondaire sous le libellé principal (ex. "CE : toujours exclu"). */
        sublabel?: string
      }[]
      /** Small unlabeled/faint reference ticks, e.g. the origin. */
      extraTicks?: { value: number; label: string }[]
      /** Signe affiché au-dessus d'une zone (ex. le signe d'un trinôme sur toute la droite, pas
       * seulement la solution surlignée) — position au point donné, pas déduite des segments. */
      signLabels?: { value: number; sign: '+' | '−' }[]
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
  | {
      kind: 'curvePlot'
      /**
       * Une ou plusieurs courbes tracées sur les mêmes axes (ex. comparer plusieurs valeurs de a,
       * ou une courbe "avant" fanée + une courbe "après" en accent lors d'une translation).
       * `xMin`/`xMax` par courbe : sous-intervalle d'échantillonnage propre à cette courbe (ex.
       * portion restreinte en accent sur fond de courbe complète en fané) ; par défaut, l'intervalle
       * du graphe entier.
       */
      curves: { fn: (x: number) => number; tone: 'accent' | 'faint' | 'good' | 'bad'; xMin?: number; xMax?: number }[]
      xMin: number
      xMax: number
      xTicks: number[]
      /** Étiquette personnalisée pour une valeur de xTicks (ex. "π/2" plutôt que "1.5707...").
       * Sans entrée pour une valeur donnée, le nombre brut est affiché. */
      xTickLabels?: Record<number, string>
      /** Ligne verticale pointillée (ex. axe de symétrie). */
      axisOfSymmetry?: { x: number; label: string }
      /** Asymptotes horizontales (ex. y = ±π/2 pour arctan). */
      horizontalAsymptotes?: { y: number }[]
      /** Asymptotes verticales (ex. x = ±π/2 pour tan avant restriction). */
      verticalAsymptotes?: { x: number }[]
      /** Fenêtre y fixe : désactive l'échelle automatique (nécessaire près d'une asymptote, où
       * les valeurs échantillonnées explosent et casseraient l'échelle auto). Le SVG racine
       * découpe nativement tout ce qui dépasse — pas de clip-path à ajouter. */
      fixedYRange?: { min: number; max: number }
      /** Points marqués (ex. sommet). */
      points?: { x: number; y: number; label: string; tone: 'accent' | 'good' | 'bad' }[]
      /** Racines marquées sur l'axe des x (0, 1 ou 2 éléments). */
      roots?: { x: number; label?: string }[]
      /** Bande horizontale ombrée représentant l'image (l'ensemble des y atteints). */
      imageBand?: { from: number; direction: 'up' | 'down'; tone: 'good' | 'bad' }
      /** Ligne horizontale de test (ex. test de la droite horizontale pour l'injectivité), avec
       * les points d'intersection marqués. */
      testLine?: { y: number; points: { x: number }[] }
      xAxisLabel: string
      yAxisLabel: string
      /** Masque l'axe vertical — pour les mini-diagrammes compacts, où l'original ne trace qu'une
       * ligne horizontale (ex. les diagrammes "0/1/2 racines", trop petits pour un axe complet). */
      showYAxis?: boolean
      /** Cadre plus carré (≈1,2:1 au lieu de 2,2:1) pour les graphes individuels compacts (ex.
       * arcsin/arccos seuls) — le cadre large par défaut, étiré, les rend disproportionnellement
       * bas/tassés une fois contraints à une largeur d'écran mobile. */
      compact?: boolean
      caption: string
    }
  | {
      kind: 'fencedEnclosure'
      /** Enclos rectangulaire adossé à un mur : deux côtés égaux (x), un côté opposé (label libre). */
      wallLabel: string
      sideLabel: string
      baseLabel: string
      caption: string
    }
  | {
      /** Diagramme d'application entre deux ensembles A et B (points + flèches), pour illustrer
       * injectivité/surjectivité/bijectivité. Positions verticales en fraction relative (0–1) de
       * la hauteur du diagramme, pour reproduire fidèlement un espacement irrégulier si besoin. */
      kind: 'setMapping'
      setALabel: string
      setBLabel: string
      pointsA: number[]
      pointsB: number[]
      arrows: { from: number; to: number }[]
      caption: string
    }
  | {
      /** Cercle trigonométrique avec rayon, arc et projection, pour illustrer arcsin/arccos/arctan.
       * `mode` distingue la projection (horizontale sur l'axe y pour sin, verticale sur l'axe x
       * pour cos, sur la tangente géométrique verticale pour tan) — géométrie réellement
       * différente selon le cas, pas juste une couleur qui change. */
      kind: 'unitCircleArc'
      mode: 'sin' | 'cos' | 'tan'
      /** Angle représenté, en radians. */
      angle: number
      caption: string
    }

export interface ExempleStep {
  tag: string
  text: string
}

export interface FeatureTableData {
  headers: string[]
  rows: string[][]
}

export type Block =
  | { kind: 'para'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'rappel'; label?: string; items: string[] }
  | { kind: 'methode'; label?: string; items: string[] }
  | { kind: 'attention'; label?: string; text: string }
  | { kind: 'astuce'; label?: string; text: string; items?: string[] }
  | { kind: 'piege'; label?: string; text: string }
  | {
      /** Callout "Définitions" — plusieurs paragraphes de définition formelle, pas une liste à
       * puces (contrairement à `rappel`). Découvert nécessaire pour du contenu de 6e riche en
       * définitions formelles (injectif/surjectif/bijectif) — absent des chapitres 4e/5e. */
      kind: 'definition'
      label?: string
      items: string[]
    }
  | {
      kind: 'exemple'
      badge?: string
      formula?: string
      steps: ExempleStep[]
      result: { tag: string; text: string; isEmpty?: boolean }
      illustration?: IllustrationSpec
    }
  | {
      /** "Exemple résolu" en forme libre : paragraphes de prose enchaînés (peut inclure une
       * chaîne d'opérations, une illustration...), pas la structure rigide badge/étapes/résultat
       * de `exemple`. Utiliser quand le raisonnement ne se découpe pas proprement en étapes
       * taguées + un résultat final unique. */
      kind: 'exempleLibre'
      label?: string
      blocks: Block[]
    }
  | { kind: 'wrongRight'; wrongTag: string; wrong: string; rightTag: string; right: string }
  | { kind: 'illustration'; illustration: IllustrationSpec }
  | {
      /** Plusieurs illustrations compactes côte à côte (ex. comparer 0/1/2 racines). */
      kind: 'illustrationGroup'
      items: IllustrationSpec[]
    }
  | {
      kind: 'entrainement'
      title: string
      generatorId: string
      description: string[]
      chantier: string
      whereLabel: string
    }
  | { kind: 'video'; title: string }
  | {
      /**
       * Tableau de signes / de variation. Chaque ligne a le même nombre de cellules, alignées
       * colonne par colonne (bornes/zéros en `tone: 'zero'`, contenu d'intervalle en 'pos'/'neg'
       * ou texte libre en 'plain'). Découvert nécessaire en migrant ce chapitre — absent du
       * schéma initial, qui n'avait pas encore rencontré de tableau de signes.
       */
      kind: 'signTable'
      caption: string
      rows: { label: string; cells: { text: string; tone: 'zero' | 'pos' | 'neg' | 'plain' | 'indef' }[] }[]
    }
  | ({
      /** Tableau à en-tête (colonnes fixes, lignes de données) — forme différente de `signTable`
       * (qui aligne des bornes/intervalles). Ex. "Fonction | Domaine | Image | Dérivée". */
      kind: 'featureTable'
      caption?: string
    } & FeatureTableData)
  | {
      /** Chaîne de valeurs reliées par des opérations nommées sur les flèches (ex. décomposer
       * puis "défaire" une fonction opération par opération). HTML/flexbox, pas SVG : les nœuds
       * contiennent du texte riche (KaTeX), pas seulement des formes géométriques. */
      kind: 'operationChain'
      nodes: string[]
      /** Longueur = nodes.length − 1. */
      operations: string[]
      direction?: 'forward' | 'backward'
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
    /** Optionnel : certaines synthèses sont purement tabulaires (voir `table`), sans liste à puces. */
    items?: string[]
    /** Tableau de synthèse, quand le format tabulaire est plus clair qu'une liste (ex. un
     * récapitulatif domaine/image/dérivée par fonction). */
    table?: FeatureTableData
    checklist?: { label?: string; items: string[] }
    forward?: string
    /** Carte "S'entraîner"/"Se tester" en toute fin de synthèse (ex. quiz vrai/faux transversal
     * à tout le chapitre) — distincte des cartes de fin de section, positionnée après `forward`. */
    entrainement?: Extract<Block, { kind: 'entrainement' }>
  }
}
