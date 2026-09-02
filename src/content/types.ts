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
      /** Graduations affichées sur l'axe y, symétrique de xTicks — pour faire apparaître
       * explicitement l'ordonnée d'un point remarquable, pas seulement son abscisse. */
      yTicks?: number[]
      /** Étiquette personnalisée pour une valeur de yTicks, même principe que xTickLabels. */
      yTickLabels?: Record<number, string>
      /** Ligne verticale pointillée (ex. axe de symétrie). */
      axisOfSymmetry?: { x: number; label: string }
      /** Asymptotes horizontales (ex. y = ±π/2 pour arctan). */
      horizontalAsymptotes?: { y: number; label?: string }[]
      /** Asymptote oblique (y=ax+b, a≠0) — droite penchée en pointillés, distincte d'une
       * horizontale (a=0) : jamais interchangeables, une horizontale mal utilisée pour une
       * pente non nulle dessinerait une ligne plate au mauvais endroit. */
      obliqueAsymptotes?: { a: number; b: number; label?: string }[]
      /** Asymptotes verticales (ex. x = ±π/2 pour tan avant restriction). */
      verticalAsymptotes?: { x: number; label?: string }[]
      /** Fenêtre y fixe : désactive l'échelle automatique (nécessaire près d'une asymptote, où
       * les valeurs échantillonnées explosent et casseraient l'échelle auto). Le SVG racine
       * découpe nativement tout ce qui dépasse — pas de clip-path à ajouter. */
      fixedYRange?: { min: number; max: number }
      /** Points marqués (ex. sommet). */
      points?: {
        x: number
        y: number
        label: string
        tone: 'accent' | 'good' | 'bad'
        /** Direction de l'étiquette par rapport au point — par défaut déduite du signe de y. À
         * préciser manuellement dès que deux points sont assez proches pour que leurs étiquettes
         * se chevauchent (ex. un minimum et un point d'inflexion voisins). */
        labelPos?: 'above' | 'below' | 'left' | 'right'
        /** 'open' = rond creux (contour coloré, intérieur couleur du fond) — pour un point exclu
         * du domaine (trou). Par défaut 'filled'. */
        style?: 'filled' | 'open'
      }[]
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
  | {
      /**
       * Cercle + secteur/segment/corde/polygone(s) inscrit ou circonscrit — schéma géométrique
       * générique, pas une courbe. Couvre plusieurs besoins (secteur simple, segment circulaire,
       * polygone régulier inscrit, encadrement d'Archimède avec inscrit+circonscrit, cercle nu
       * avec un point marqué et une ligne de sol) avec un seul kind configurable plutôt qu'un par
       * variante — dans le même esprit que la généralisation de `curvePlot`.
       */
      kind: 'circleDiagram'
      /** Angle de départ du secteur mis en évidence (rad, sens trigonométrique). Absent si aucun secteur. */
      startAngle?: number
      /** Angle du secteur (θ, rad). */
      sectorAngle?: number
      /** Ce qui est mis en évidence : l'arc seul, le segment (corde+arc), ou le secteur plein. */
      highlight?: 'arc' | 'segment' | 'sector'
      /** Dessine la corde reliant les deux extrémités du secteur. */
      showChord?: boolean
      /** Polygone régulier inscrit (sommets sur le cercle), trait fin. */
      inscribedPolygon?: number
      /** Polygone régulier circonscrit (côtés tangents au cercle), trait fin — encadrement d'Archimède. */
      circumscribedPolygon?: number
      /** Ligne de sol tangente en bas du cercle (ex. grande roue). */
      groundLine?: boolean
      /** Point marqué sur le cercle à un angle donné, hors de tout secteur (ex. la nacelle). */
      markedPoint?: { angle: number; label?: string }
      centerLabel?: string
      radiusLabel?: string
      pointALabel?: string
      pointBLabel?: string
      angleLabel?: string
      caption: string
    }
  | {
      /** Cercle gradué avec plusieurs rayons tracés à des angles remarquables, chacun étiqueté —
       * diagramme de référence (ex. les 16 angles remarquables), pas une construction pas à pas. */
      kind: 'trigCircleReference'
      angles: { value: number; label: string }[]
      caption: string
    }
  | {
      /**
       * Place 1 ou 2 points sur le cercle trigonométrique par leur angle, avec accessoires
       * optionnels — pour les diagrammes de symétrie (α et π−α pour sin, α et −α pour cos, α et
       * π+α pour tan) et pour des exemples ponctuels (ex. cos(u)=1/2). Généralise mieux que
       * d'étendre `unitCircleArc`, qui est spécifiquement bâti autour d'une seule projection
       * sin/cos/tan, pas de deux points arbitraires reliés.
       */
      kind: 'circleAngles'
      points: { angle: number; label: string; tone: 'accent' | 'good' | 'bad' }[]
      /** Trace la droite passant par les points (étendue aux bords du cadre, pas juste le segment
       * entre eux) — sert de corde pour sin/cos, et de sécante prolongée jusqu'à la tangente pour tan. */
      connectPoints?: boolean
      /** Projections en pointillés de chaque point vers l'axe horizontal. */
      projectToXAxis?: boolean
      /** Projections en pointillés de chaque point vers l'axe vertical. */
      projectToYAxis?: boolean
      /** Ligne horizontale de référence à hauteur t (ex. y=t pour cos x=t), étiquetée. */
      horizontalLine?: { y: number; label: string }
      /** Ligne verticale de référence à x=t (ex. pour cos x=t, symétrie par rapport à l'axe horizontal). */
      verticalLine?: { x: number; label: string }
      caption: string
    }
  | {
      /** Points discrets d'une suite (n, valeur) — pas une fonction continue, donc distinct de
       * `curvePlot` : chaque terme est un point isolé, avec sa propre étiquette de valeur. */
      kind: 'sequencePlot'
      points: { n: number; value: number; label: string }[]
      /** Connecteur visuel entre points consécutifs — aucun, segments droits, ou courbe lissée. */
      connector?: 'none' | 'straight' | 'smooth'
      /** Repère d'un pas entre deux points consécutifs (indices dans `points`), ex. "+r". */
      stepIndicator?: { fromIndex: number; toIndex: number; label: string }
      /** Ligne horizontale de référence, étiquetée (ex. la limite L d'une suite récurrente affine). */
      referenceLine?: { value: number; label: string }
      /** Étiquette flottante près d'un point donné (ex. "u_n → 0"). */
      trendLabel?: { afterIndex: number; text: string }
      xAxisLabel: string
      yAxisLabel: string
      caption: string
    }

export interface ExempleStep {
  tag: string
  text: string
}

export interface FeatureTableData {
  headers: string[]
  /** Chaque cellule est soit du texte simple, soit un objet avec une teinte optionnelle (ex.
   * marquer une forme indéterminée en rouge, déterminée en vert) — pour les tableaux où certaines
   * cases doivent visuellement ressortir des autres, comme le tableau des opérations sur les limites. */
  rows: (string | { text: string; tone: 'good' | 'bad' })[][]
}

export type Block =
  | { kind: 'para'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'rappel'; label?: string; items: string[] }
  | { kind: 'methode'; label?: string; items: string[] }
  | { kind: 'attention'; label?: string; text: string; items?: string[] }
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
  | {
      kind: 'video'
      title: string
      /** Identifiant YouTube (ex. "2qRqyuZh4FE", tiré de youtube.com/watch?v=...) — si absent,
       * affiche le placeholder "vidéo à venir". Une fois fourni, remplace le placeholder par un
       * lecteur embarqué responsive, exclu de l'export (un iframe ne peut pas être capturé). */
      youtubeId?: string
    }
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
