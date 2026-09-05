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
      /** Crochet horizontal fin au-dessus de l'axe, entre deux valeurs, avec une étiquette
       * centrée (ex. "au moins 75% des valeurs") — distinct des segments/points, qui portent le
       * sens accepté/exclu, pas une simple portée annotée. */
      rangeAnnotations?: { from: number; to: number; label: string }[]
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
      /** Zone remplie entre deux fonctions (ou entre une fonction et l'axe y=0 par défaut), sur un
       * sous-intervalle [from;to] — pour une aire sous courbe, une aire entre deux courbes, ou un
       * rectangle de Riemann. Distinct de `curves` : ceci dessine un polygone REMPLI, jamais un
       * simple trait. */
      shadedRegions?: { from: number; to: number; upper: (x: number) => number; lower?: (x: number) => number; tone?: 'accent' | 'good' | 'bad' }[]
      /** Étiquette de texte libre à des coordonnées données, sans le cercle qui accompagne toujours
       * un `points` — pour nommer une courbe ("y=x²"), annoter une aire ("aire=2"), ou toute
       * légende qui ne pointe pas un endroit précis et unique du graphe. */
      textLabels?: { x: number; y: number; text: string; tone?: 'accent' | 'good' | 'bad' | 'faint' | 'ink'; anchor?: 'start' | 'middle' | 'end' }[]
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
      points: { angle: number; label: string; tone: 'accent' | 'good' | 'bad'; dashed?: boolean }[]
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
      /** Étiquettes I/II/III/IV dans chacun des 4 quadrants. */
      showQuadrants?: boolean
      /** Arc d'angle entre deux directions (en radians, 0=axe x positif, sens direct=trigonométrique),
       * de rayon libre en pixels — pour le grand balayage d'un angle θ (avec flèche de sens) ou un
       * petit arc d'angle de référence, dans une teinte distincte. */
      angleArcs?: { from: number; to: number; tone: 'accent' | 'good' | 'bad'; radiusPx: number; label?: string; arrow?: boolean }[]
      /** Étiquette de texte libre en coordonnées normalisées du cercle (−1 à 1, échelle cos/sin) —
       * pour nommer O, un pied de projection P, ou tout point qui n'est pas un `points` du cercle. */
      freeLabels?: { x: number; y: number; text: string; tone?: 'accent' | 'good' | 'bad' | 'ink' }[]
      /** Petit carré d'angle droit, coordonnées normalisées du cercle, aux côtés alignés sur les axes
       * (ex. au pied d'une projection, pour l'identité cos²+sin²=1). */
      rightAngleMarkers?: { x: number; y: number }[]
      /** Construction de tan θ comme longueur : droite verticale tangente au cercle en (1;0), le
       * rayon OM prolongé la coupe en P(1;tan θ) — variante géométrique distincte des projections
       * cos/sin habituelles, qui sont de simples coordonnées. */
      tangentConstruction?: { angle: number; label?: string }
      caption: string
    }
  | {
      /** Triangle rectangle isolé, angles et côtés étiquetés — pour les constructions à angles
       * remarquables (45-45-90, 30-60-90). Sommet de l'angle droit toujours en bas à droite. */
      kind: 'rightTriangle'
      /** Longueurs des 2 côtés de l'angle droit (horizontal, vertical) — l'hypoténuse s'en déduit. */
      legs: { horizontal: number; vertical: number }
      sideLabels: { horizontal: string; vertical: string; hypotenuse: string }
      angleLabels: { atLeft: string; atRight: string }
      caption: string
    }
  | {
      /** Triangle ABC quelconque — sommets/côtés/angles étiquetés selon la convention constante
       * (côté minuscule opposé au sommet majuscule de même lettre). Base [AB] toujours horizontale. */
      kind: 'triangleGeneric'
      /** Sommets en coordonnées libres (pixels SVG) — A et B sur la base, C au sommet. */
      A: { x: number; y: number }
      B: { x: number; y: number }
      C: { x: number; y: number }
      /** Angle(s) à marquer par un arc, aux sommets voulus. */
      angleArcsAt?: ('A' | 'B' | 'C')[]
      /** Hauteur issue de C, abaissée sur [AB] au point H — avec son marqueur d'angle droit. */
      heightFromC?: { hLabel?: string; footLabel?: string }
      /** Construction en repère : A à l'origine, B sur l'axe horizontal, projections de C avec
       * leurs longueurs étiquetées (ex. "b cos A", "b sin A") — pour la démonstration d'Al-Kashi. */
      coordinateConstruction?: { horizontalLabel: string; verticalLabel: string }
      sideLabels?: { a?: string; b?: string; c?: string }
      caption: string
    }
  | {
      /** Triangulation — deux points au sol A et B alignés avec le pied F d'une tour verticale de
       * sommet S, deux visées d'élévation depuis A et B. Forme géométrique distincte d'un triangle
       * fermé à 3 sommets, jamais réutilisable via `triangleGeneric`. */
      kind: 'triangulation'
      labels: { A: string; B: string; F: string; S: string; distanceLabel: string; heightLabel: string; angleAtA: string; angleAtB: string }
      caption: string
    }
  | {
      /** Plan d'Argand — axes Re/Im, points d'affixe (x;y), vecteurs (segments, pleins ou
       * pointillés, depuis l'origine ou entre deux points quelconques), arcs d'angle à centre
       * libre, marques de longueur égale, cercle et polygone optionnels. Composant généraliste
       * couvrant la quasi-totalité des diagrammes du chapitre sur les nombres complexes. */
      kind: 'complexPlane'
      xMin: number
      xMax: number
      yMin: number
      yMax: number
      circle?: { cx: number; cy: number; r: number; tone?: 'faint' | 'accent' }
      polygon?: { points: { x: number; y: number }[]; tone?: 'accent' | 'faint' }
      vectors?: { from: { x: number; y: number }; to: { x: number; y: number }; tone: 'accent' | 'good' | 'bad' | 'faint'; dashed?: boolean; tick?: boolean }[]
      points?: { x: number; y: number; label?: string; tone: 'accent' | 'good' | 'bad' | 'ink'; labelPos?: 'above' | 'below' | 'left' | 'right'; node?: boolean }[]
      /** Arc d'angle en degrés (convention standard, sens direct), à un centre libre — pas
       * nécessairement l'origine, contrairement à `circleAngles`. */
      angleArcs?: { cx: number; cy: number; fromDeg: number; toDeg: number; radiusPx: number; label?: string; tone?: 'accent' | 'good' | 'bad' }[]
      caption: string
    }
  | {
      /** Emboîtement ℕ⊂ℤ⊂ℚ⊂ℝ⊂ℂ — ellipses concentriques étiquetées, avec des points-exemples
       * libres à l'intérieur. Forme trop spécifique pour un usage au-delà de cette seule figure. */
      kind: 'numberSetsNesting'
      rings: { rx: number; ry: number; label: string }[]
      examplePoints: { dx: number; dy: number; label: string; anchor?: 'start' | 'end' }[]
      caption: string
    }
  | {
      /** Plan cartésien x/y — points, vecteurs (pleins ou pointillés, avec éventuelle marque de
       * longueur égale), arcs d'angle et petits marqueurs d'angle droit à orientation libre.
       * Composant généraliste pour le chapitre sur le calcul vectoriel, dans le même esprit que
       * `complexPlane` (axes x/y plutôt que Re/Im ; pas de cercle ni de polygone, non nécessaires
       * ici). */
      kind: 'vectorPlane'
      xMin: number
      xMax: number
      yMin: number
      yMax: number
      /** Masque les axes x/y — pour un schéma abstrait sans repère (ex. droite + vecteur
       * directeur sans coordonnées données). Par défaut true — comportement historique du
       * chapitre calcul vectoriel, où le plan a toujours des axes. */
      showAxes?: boolean
      /** Quadrillage entier (traits fins) sur tout le cadre [xMin,xMax]×[yMin,yMax] — pour un
       * graphe où l'élève doit pouvoir lire des coordonnées entières directement sur les cases,
       * plutôt que sur les seuls axes. Par défaut false (comportement historique). */
      grid?: boolean
      /** Cercle simple (pas de secteur ni d'angle marqué — voir `circleDiagram` pour ça), pour
       * les diagrammes mêlant droites et cercles (intersection droite/cercle, équation d'un
       * cercle depuis un graphe). Un seul cercle : les diagrammes de ce chapitre n'en ont jamais
       * besoin de deux à la fois. */
      circle?: { cx: number; cy: number; r: number; tone?: 'accent' | 'faint' }
      /** Courbe(s) réelles tracées par échantillonnage, y = fn(x) — même mécanique que
       * `curvePlot.curves`, pour une parabole d'axe vertical sur ce plan. */
      curves?: { fn: (x: number) => number; tone: 'accent' | 'good' | 'bad' | 'attn' | 'tip' | 'ink' | 'faint'; xMin?: number; xMax?: number }[]
      /** Symétrique de `curves` pour une courbe qui n'est pas le graphe d'une fonction de x — ex.
       * une parabole d'axe HORIZONTAL, x = fn(y). Jamais les deux en même temps sur une courbe
       * donnée : orientation réellement différente, pas juste un axe qui change de nom. */
      curvesOfY?: { fn: (y: number) => number; tone: 'accent' | 'good' | 'bad' | 'attn' | 'tip' | 'ink' | 'faint'; yMin?: number; yMax?: number }[]
      vectors?: {
        from: { x: number; y: number }
        to: { x: number; y: number }
        tone: 'accent' | 'good' | 'bad' | 'attn' | 'tip' | 'ink' | 'faint'
        dashed?: boolean
        tick?: boolean
        /** Segment plein SANS pointe de flèche — pour une droite entière tracée jusqu'aux bords
         * du cadre (ce n'est plus "un vecteur" au sens géométrique, juste un trait). Par défaut
         * true (comportement historique : tout vecteur non pointillé porte une flèche). */
        arrow?: boolean
      }[]
      points?: {
        x: number
        y: number
        label?: string
        /** Étiquette d'un NOM DE VECTEUR (u, AB, u+v, 2·AB…) — chaque run avec `vector: true`
         * reçoit la notation flèche (surlignage + petite tête ▸), comme `.vecnot` en prose mais
         * en SVG ; les runs sans `vector` (opérateurs, scalaires, indices) restent en texte
         * normal. Remplace `label` quand présent. */
        vectorLabel?: { text: string; vector?: boolean }[]
        tone: 'accent' | 'good' | 'bad' | 'attn' | 'tip' | 'ink'
        labelPos?: 'above' | 'below' | 'left' | 'right'
        node?: boolean
      }[]
      angleArcs?: { cx: number; cy: number; fromDeg: number; toDeg: number; radiusPx: number; label?: string; tone?: 'accent' | 'good' | 'bad' | 'attn' | 'tip' }[]
      /** Petit repère d'angle droit à un sommet, orienté librement selon les deux côtés qui le
       * forment (contrairement au marqueur axé-axes de `circleAngles`) — `arm1`/`arm2` sont deux
       * points quelconques (pas nécessairement unitaires) situés sur chacun des deux côtés. */
      rightAngleMarkers?: { vertex: { x: number; y: number }; arm1: { x: number; y: number }; arm2: { x: number; y: number }; size?: number }[]
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
      /** Met en évidence un point par des projections en pointillés vers les deux axes, avec les
       * valeurs lues affichées à leur pied (ex. lire un seuil sur une courbe cumulative). */
      highlightPoint?: { index: number; xLabel?: string; yLabel?: string }
      /** Graduations affichées sur l'axe y (ex. les paliers 5/10/15/20 d'un effectif cumulé) —
       * absent par défaut, contrairement à l'axe des n qui affiche toujours ses valeurs. */
      yTicks?: number[]
      xAxisLabel: string
      yAxisLabel: string
      caption: string
    }
  | {
      /** Histogramme — barres accolées pour des classes consécutives, hauteur = effectif (ou
       * fréquence). Distinct de `sequencePlot`/`curvePlot` : pas de points isolés ni de courbe,
       * des rectangles pleins dont la largeur porte l'amplitude de la classe. */
      kind: 'histogram'
      bars: { from: number; width: number; height: number }[]
      xAxisLabel: string
      yAxisLabel: string
      caption: string
    }
  | {
      /** Boîte à moustaches — une ou plusieurs séries empilées verticalement, chacune résumée en
       * 5 nombres (min, Q1, médiane, Q3, max). Une seule série affiche les 5 valeurs sous l'axe ;
       * plusieurs séries affichent une étiquette courte par ligne (ex. "A", "B") et un IQR
       * optionnel au-dessus de chaque boîte, pour la comparaison. */
      kind: 'boxPlot'
      series: { label?: string; min: number; q1: number; median: number; q3: number; max: number; tone?: 'accent' | 'good'; iqrLabel?: string }[]
      xAxisLabel: string
      caption: string
    }
  | {
      /** Diagramme de Venn à 2 ensembles (toujours la même disposition géométrique : deux
       * cercles superposés). `mode` choisit ce qui est mis en évidence ; `counts` — uniquement en
       * mode 'counts' — affiche un effectif dans chacune des 4 régions plutôt que rien. */
      kind: 'vennDiagram'
      labelA: string
      labelB: string
      mode: 'plain' | 'highlightUnion' | 'highlightIntersection' | 'counts'
      counts?: { aOnly: string; bOnly: string; both: string; neither: string }
      /** Cadre à moitié moins large que la largeur de colonne par défaut — pour un diagramme
       * volontairement schématique (ex. "A∪B"/"A∩B" juste après leur définition), où la disposition
       * fixe à 2 cercles n'a besoin d'aucun détail supplémentaire à grande taille. */
      compact?: boolean
      caption: string
    }
  | {
      /** Arbre pondéré à 2 niveaux (toujours 2 niveaux : ce chapitre n'en a jamais besoin de
       * plus). `secondLevel` référence son parent par l'index dans `firstLevel` ; `pathProb`,
       * quand fourni, affiche la probabilité du chemin complet au bout de la branche — jamais
       * calculée automatiquement, toujours fournie explicitement pour rester fidèle à l'énoncé. */
      kind: 'weightedTree'
      firstLevel: { label: string; prob: string }[]
      secondLevel: { fromFirst: number; label: string; prob: string; pathProb?: string; highlight?: boolean }[]
      caption: string
    }
  | {
      /** Grille des issues d'une expérience à 2 tirages numériques indépendants (ex. 2 dés) — un
       * point par issue, certains mis en évidence. Distinct de `vectorPlane` : toujours un
       * quadrillage entier 1..n, jamais d'axes négatifs ni de vecteurs. */
      kind: 'outcomeGrid'
      xMax: number
      yMax: number
      xAxisLabel: string
      yAxisLabel: string
      highlighted: { x: number; y: number }[]
      caption: string
    }
  | {
      /**
       * Polygone convexe régulier à `sides` sommets, avec TOUTES ses diagonales tracées (trait
       * fin) en plus de ses côtés (trait plein). Distinct de `circleDiagram.inscribedPolygon`,
       * qui ne dessine que les côtés du polygone inscrit : ici les diagonales SONT le sujet du
       * diagramme (formule D(n)=n(n−3)/2), jamais un simple décor.
       */
      kind: 'polygonDiagonals'
      sides: number
      /** Étiquettes des sommets, dans le sens de parcours à partir du sommet du haut. Par défaut
       * 1, 2, …, n. */
      vertexLabels?: string[]
      /** Légende centrée sous la figure (ex. "D(9) = 27 diagonales"). */
      summaryLabel?: string
      caption: string
    }
  | {
      /**
       * Permutation circulaire de `n` objets distincts disposés en cercle. `mode` distingue deux
       * géométries réellement différentes, pas une simple couleur : 'rotation' dessine l'arc de
       * rotation (cas de la table, où seules les rotations sont équivalentes) ; 'reflection'
       * dessine l'axe de symétrie (cas du collier, où les réflexions le sont aussi).
       */
      kind: 'circularPermutation'
      n: number
      mode: 'rotation' | 'reflection'
      /** Étiquette de la symétrie représentée ; par défaut "rotation ≡" / "réflexion". */
      symmetryLabel?: string
      caption: string
    }
  | {
      /**
       * Répartition multinomiale : un pool de jetons en haut, réparti dans des boîtes NOMMÉES de
       * tailles fixées (largeur de boîte proportionnelle à sa taille). Sert aussi bien aux
       * "personnes en groupes" qu'aux "objets en boîtes numérotées" — la même formule
       * n!/(n₁!…n_k!) dans les deux lectures.
       */
      kind: 'groupPartition'
      /** Légende du pool, au-dessus de la rangée de jetons (ex. "10 personnes"). */
      poolLabel: string
      groups: { size: number; tone: 'accent' | 'good' | 'faint' }[]
      /** Légende centrée sous les boîtes (ex. "10!/(5!×3!×2!) = 2520 répartitions"). */
      formulaLabel: string
      caption: string
    }
  | {
      /**
       * Rangée de tuiles-lettres colorées par identité de lettre, avec sa légende des effectifs —
       * pour une permutation avec répétitions (anagrammes). Les lettres identiques partagent
       * exactement la même tuile, ce qui rend visible la division par les factorielles des
       * effectifs répétés.
       */
      kind: 'letterTiles'
      letters: string[]
      /** Une entrée par lettre DISTINCTE : son effectif et sa teinte de tuile. 'outline' = tuile
       * évidée (contour seul), pour distinguer une 4e lettre sans introduire de couleur de plus. */
      legend: { letter: string; count: number; tone: 'accent' | 'good' | 'ink' | 'outline' }[]
      caption: string
    }
  | {
      /**
       * Triangle de Pascal, lignes n=0 à n=rowCount−1 — les coefficients sont CALCULÉS par le
       * composant, jamais saisis à la main (aucun risque de faute de frappe dans le triangle).
       * `pascalRelation` met en évidence un coefficient et ses deux parents, reliés par les deux
       * traits de la relation C(n,k)=C(n−1,k−1)+C(n−1,k).
       */
      kind: 'pascalTriangle'
      rowCount: number
      pascalRelation?: { row: number; index: number }
      caption: string
    }
  | {
      /**
       * Diagramme en barres à catégories NOMMÉES (étiquettes textuelles, pas des classes
       * numériques) — distinct de `histogram`, dont les barres sont positionnées par `from`/
       * `width` sur un axe numérique et qui ne sait ni mettre une barre en évidence, ni afficher
       * la valeur au bout de chaque barre. Couvre en un seul kind les comparaisons à 2 catégories,
       * les distributions discrètes indexées par k, et les comparaisons à échelle logarithmique
       * (`scale: 'log'`, où les valeurs s'étalent sur plusieurs ordres de grandeur).
       */
      kind: 'categoricalBarChart'
      orientation?: 'vertical' | 'horizontal'
      scale?: 'linear' | 'log'
      bars: { label: string; value: number; valueLabel?: string; tone?: 'accent' | 'good' | 'faint' }[]
      /** Plafond d'échelle explicite — sinon la plus grande valeur. Permet de garder une marge
       * au-dessus de la plus haute barre (et de comparer deux graphes à la même échelle). */
      maxValue?: number
      /** Échelle log seulement : exposant de la borne basse (une barre de valeur 10^logMin a une
       * longueur nulle). Par défaut 2. */
      logMin?: number
      xAxisLabel?: string
      yAxisLabel?: string
      /** Mention centrée sous le graphe (ex. "échelle logarithmique"). */
      footnote?: string
      /** Colore la valeur affichée au bout de chaque barre dans la teinte de la barre, au lieu du
       * gris neutre par défaut — réservé aux graphes où la comparaison des 2 valeurs EST le
       * sujet (ex. Chevalier de Méré), pas aux distributions où la couleur marque déjà une région. */
      colorValueLabels?: boolean
      caption: string
    }
  | {
      /**
       * Plusieurs séquences d'issues tracées côte à côte, une par ligne, chacune avec la
       * probabilité de chaque étape et la probabilité du chemin complet — plus une accolade
       * regroupant les lignes équiprobables. Distinct de `weightedTree` : les séquences sont
       * déjà DÉPLIÉES (une ligne = un chemin complet), ce qu'un arbre à 2 niveaux ne peut pas
       * représenter pour 3 tirages.
       */
      kind: 'sequenceOutcomes'
      rows: {
        label: string
        steps: { label: string; prob: string; tone: 'accent' | 'good' }[]
        resultLabel: string
      }[]
      /** Texte de l'accolade regroupant les lignes, une entrée par ligne de texte. */
      bracketLabel: string[]
      /** Conclusion centrée sous le diagramme. */
      footer: string
      caption: string
    }
  | {
      /**
       * Stabilisation d'une fréquence relative quand on répète l'expérience : une ligne brisée de
       * relevés successifs qui oscille de moins en moins autour d'une valeur limite (tracée en
       * pointillés). Distinct de `sequencePlot`, qui étiquette CHAQUE point et affiche son rang
       * sous l'axe — illisible dès qu'il y a plusieurs dizaines de relevés, alors que c'est
       * justement le grand nombre de répétitions qui EST le sujet ici. Distinct aussi de
       * `curvePlot`, qui échantillonne une fonction : ces valeurs sont des relevés expérimentaux,
       * pas les images d'une formule.
       */
      kind: 'frequencyStabilization'
      /** Fréquences relevées, dans l'ordre ; le relevé d'indice i correspond à (i+1)×`step` répétitions. */
      frequencies: number[]
      /** Nombre de répétitions séparant deux relevés consécutifs. */
      step: number
      /** Valeur limite attendue (la probabilité a priori), en pointillés + étiquetée à droite. */
      target: { value: number; label: string }
      /** Fenêtre verticale fixe — les fréquences d'un petit échantillon sortiraient sinon du cadre
       * utile et écraseraient la zone de stabilisation. */
      yMin: number
      yMax: number
      /** Graduations affichées sous l'axe horizontal (nombres de répétitions). */
      xTicks?: number[]
      xAxisLabel: string
      yAxisLabel: string
      caption: string
    }
  | {
      /**
       * Partition de l'univers en n morceaux (bandes verticales d'un rectangle Ω) TRAVERSÉE par un
       * événement transversal (ellipse ombrée) — la figure de la loi des probabilités totales.
       * Distinct de `vennDiagram` (géométrie figée à 2 cercles qui se chevauchent, sans univers
       * découpé) et de `groupPartition` (jetons répartis dans des boîtes, sans événement
       * transversal).
       */
      kind: 'universePartition'
      /** Étiquettes des morceaux, de gauche à droite (largeurs égales). */
      parts: string[]
      universeLabel: string
      /** Nom de l'événement transversal, écrit au-dessus de l'ellipse. */
      eventLabel: string
      /** Légende centrée sous le cadre (ex. la décomposition de P(A) en somme de ses tranches). */
      formulaLabel: string
      caption: string
    }
  | {
      /**
       * Diagramme en fréquences naturelles : plusieurs colonnes de MÊME hauteur, chacune découpée
       * de haut en bas en segments proportionnels À L'INTÉRIEUR de la colonne (chaque colonne est
       * donc son propre 100 %), avec l'effectif de chaque segment en regard. Sert à opposer
       * visuellement deux conditionnements inverses (P(B|A) contre P(A|B)). Distinct de
       * `categoricalBarChart`, dont chaque barre porte UNE valeur sur une échelle commune, jamais
       * un empilement de sous-effectifs.
       */
      kind: 'naturalFrequencies'
      /** Titre centré au-dessus du diagramme (ex. le rapport que la figure fait voir). */
      headline: string
      columns: {
        /** Titre au-dessus de la colonne — chaîne vide pour une colonne de recombinaison. */
        title: string
        titleTone: 'accent' | 'good'
        /** Segments de haut en bas ; leurs hauteurs sont proportionnelles à `count` dans la colonne. */
        segments: { label: string; count: number; tone: 'accent' | 'accentFaint' | 'good' | 'goodFaint' }[]
        /** Côté où sont écrites les étiquettes des segments. */
        labelSide: 'left' | 'right'
        /** Légende sous la colonne (ex. "100 malades"). */
        footLabel: string
      }[]
      caption: string
    }
  | {
      /**
       * Une barre unique de longueur 1 partagée en deux parts complémentaires (ex. P(X=0) et
       * P(au moins 1)) — la figure du raisonnement par complément. Distinct de
       * `categoricalBarChart`, qui dessinerait DEUX barres séparées comparées à une échelle : ici
       * c'est le partage d'une seule et même barre qui porte le sens (leur somme vaut 1).
       */
      kind: 'complementBar'
      /** Titre centré au-dessus de la barre. */
      headline: string
      /** Exactement deux parts ; `fraction` est la part de la barre totale (leur somme vaut 1). */
      parts: { fraction: number; label: string; tone: 'accent' | 'faint' }[]
      /** Ligne de synthèse sous la barre (ex. "0,168 + 0,832 = 1"). */
      footer: string
      /** Contre-exemple barré, en teinte d'alerte (ex. "✗ 5×0,3 = 1,5 (impossible, >1)"). */
      warning?: string
      caption: string
    }
  | {
      /**
       * Solide de révolution vu « en coupe 3D » — complète le diagramme 2D de la région tournée
       * (`curvePlot`), qui ne montre jamais le solide réellement engendré par la rotation. 'cone'
       * dessine un solide plein (méthode des disques, rayon nul à x=a) ; 'washer' dessine une paroi
       * creuse dont l'épaisseur s'amincit jusqu'à devenir nulle au bord large (méthode des
       * rondelles). `outerRadius` = rayon au bord large, toujours atteint en x=b dans ce chapitre.
       */
      kind: 'solidRevolution'
      variant: 'cone' | 'washer'
      outerRadius: number
      startLabel: string
      endLabel: string
      midLabel: string
      caption: string
    }
  | {
      /**
       * Solide en perspective cavalière (cube/parallélépipède), sommets nommés A..H selon la
       * convention constante du chapitre géométrie dans l'espace (ABCD = base, EFGH = face du
       * dessus, E au-dessus de A, F au-dessus de B, etc.). Le sommet arrière-bas-gauche (D) est
       * TOUJOURS celui dont les 3 arêtes (D-A, D-C, D-H) se tracent en pointillé — convention de
       * perspective cavalière vérifiée empiriquement, fixée une fois pour toutes par ce composant,
       * jamais recalculée ni configurable. Couvre le cube nu (mini-comparaisons côte à côte), le
       * cube annoté des 3 axes (introduction à la perspective cavalière), un plan mis en évidence
       * sur une face, une ou deux arêtes/diagonales mises en évidence, et un polygone de section
       * libre par-dessus les faces.
       */
      kind: 'solidCavaliere'
      /** 'large' = cube principal (figure pleine largeur) ; 'small' = mini-cube (grille de cas
       * comparés côte à côte) — même topologie, coordonnées propres à chaque échelle. */
      size: 'large' | 'small'
      /** Cube annoté des 3 axes x (horizontal), z (vertical), y (diagonal à 45°, pointillé,
       * réduit de moitié) — uniquement significatif en size 'large', seule figure du chapitre qui
       * en a besoin. */
      showAxes?: boolean
      /** Sommets à étiqueter (A..H) ; un sommet absent de la liste reste sans étiquette (cas des
       * mini-cubes de comparaison, jamais nommés dans la source). `tone` colore le TEXTE de
       * l'étiquette (`plan` = violet, pour un sommet de la face mise en évidence) ; `dotTone`
       * colore le POINT lui-même (`accent`, pour un sommet qui est aussi un point remarquable —
       * ex. un point de percée tombant exactement sur un sommet déjà nommé). Les deux sont
       * indépendants : un sommet du plan violet garde un point ink normal sauf mention contraire. */
      vertexLabels?: { vertex: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'; tone?: 'ink' | 'plan'; dotTone?: 'ink' | 'accent' }[]
      /** Face du solide mise en évidence (violet), désignée par 4 de ses sommets dans l'ordre du
       * contour — dessinée par-dessus l'arête nue correspondante. */
      highlightedPlane?: { vertices: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H')[] }
      /** Arête(s)/diagonale(s) mises en évidence, désignées par leurs 2 sommets — pas
       * nécessairement une arête réelle du solide (ex. la grande diagonale A-G). */
      highlightedLines?: { from: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'; to: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'; tone: 'accent' | 'good' }[]
      /** Points libres, à des coordonnées propres au repère SVG du solide choisi (pas
       * nécessairement un sommet nommé) — ex. un point de section au milieu d'une arête verticale. */
      freePoints?: { x: number; y: number; label?: string; tone?: 'accent' | 'ink' }[]
      /** Polygone fermé et rempli (accent, semi-transparent) tracé par-dessus les faces du solide
       * — le polygone de section. */
      sectionPolygon?: { points: { x: number; y: number }[] }
      caption: string
    }
  | {
      /**
       * Schéma géométrique abstrait dans l'espace, PAS bâti sur un solide nommé (voir
       * `solidCavaliere` pour ça) : un ou deux plans esquissés (remplissage violet plein, ou
       * simple contour pointillé pour un plan auxiliaire, ou teinte neutre de sol), des
       * lignes/contours et des points libres tracés dessus, avec leurs étiquettes. Composant
       * générique qui couvre à la fois les figures « déterminer un plan », « deux/trois plans »,
       * « point de percée », les mini-diagrammes de direction de l'ombre au soleil et sa scène
       * principale, et la perspective centrale (rails + point de fuite).
       */
      kind: 'planeSketch'
      width: number
      height: number
      /** 'plan' = remplissage violet plein (le plan principal, cible) ; 'planDashed' = contour
       * seul, pointillé (un plan auxiliaire ou un second plan de comparaison) ; 'ground' = teinte
       * neutre de sol (surface2), pour la scène de l'ombre au soleil. */
      planes?: { points: { x: number; y: number }[]; style: 'plan' | 'planDashed' | 'ground' }[]
      /** Lignes, segments, flèches ou contours de polygone tracés par-dessus les plans. */
      lines?: {
        points: { x: number; y: number }[]
        tone: 'ink' | 'faint' | 'accent' | 'good' | 'bad' | 'attn'
        closed?: boolean
        dashed?: boolean
        arrow?: boolean
      }[]
      points?: { x: number; y: number; label?: string; tone?: 'ink' | 'accent' | 'good'; labelDx?: number; labelDy?: number }[]
      /** Étiquettes de texte libres, sans point associé (ex. π, α, d, b, "point de percée", "45°",
       * ou un ✓/✗ de validation à côté d'une flèche de direction). */
      freeLabels?: { x: number; y: number; text: string; tone?: 'ink' | 'accent' | 'good' | 'bad' | 'plan' }[]
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
      /**
       * Cadre de résultat final. Laisser `tag` ET `text` vides (`{ tag: '', text: '' }`) quand
       * l'exemple n'a pas de résultat unique à encadrer (raisonnement qui se suffit de ses
       * étapes, ou dont la conclusion est un tableau/diagramme placé juste après) : le cadre
       * n'est alors pas rendu du tout.
       *
       * `isEmpty` NE veut PAS dire « pas de résultat » : c'est la teinte d'alerte d'un résultat
       * qui vaut l'ENSEMBLE VIDE (ex. `dom(f∘g) = ∅`) — un résultat bien réel, qui doit
       * s'afficher.
       */
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
