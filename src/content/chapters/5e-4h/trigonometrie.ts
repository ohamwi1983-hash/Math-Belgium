import type { ChapterContent } from '../../types'

const PI = Math.PI

// Fonction tan sur plusieurs périodes : segments entre asymptotes consécutives, avec une petite
// marge (0,05) pour ne jamais échantillonner exactement sur une asymptote.
const TAN_ASYMPTOTES = [-7 * (PI / 2), -5 * (PI / 2), -3 * (PI / 2), -PI / 2, PI / 2, 3 * (PI / 2), 5 * (PI / 2), 7 * (PI / 2)]
const TAN_BOUNDS = [-4 * PI, ...TAN_ASYMPTOTES, 4 * PI]
const TAN_CURVES = TAN_BOUNDS.slice(0, -1).map((lo, i) => ({
  fn: Math.tan,
  tone: 'accent' as const,
  xMin: lo + 0.05,
  xMax: TAN_BOUNDS[i + 1] - 0.05,
}))
const TAN_TICKS = [-3 * PI, -2 * PI, -PI, PI, 2 * PI, 3 * PI]
const TAN_TICK_LABELS = { [-3 * PI]: '-3π', [-2 * PI]: '-2π', [-PI]: '-π', [PI]: 'π', [2 * PI]: '2π', [3 * PI]: '3π' }

export const trigonometrie: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 2,
  title: 'Trigonométrie',
  slug: 'trigonometrie',
  lede:
    "On change d'unité pour mesurer les angles : le radian remplace le degré, et le cercle " +
    "trigonométrique devient l'outil de référence pour résoudre équations et problèmes de " +
    'géométrie. Les fonctions sinus et cosinus prennent ensuite une forme paramétrée — ' +
    'amplitude, période, déphasage, décalage vertical — qui permet de modéliser de vrais ' +
    "phénomènes périodiques : la hauteur d'une nacelle de grande roue, une marée, une tension " +
    'électrique.',

  intro: {
    title: 'Comment encadrer le nombre π ?',
    blocks: [
      {
        kind: 'para',
        text:
          'Avant même de calculer avec π, on peut l\'**encadrer** — le coincer entre deux valeurs ' +
          'de plus en plus proches, sans aucune formule toute faite. Soit un cercle de centre $C$ ' +
          'et de rayon $1$ : sa circonférence vaut exactement $2\\pi$. Les hexagones réguliers ' +
          '**inscrit** et **circonscrit** à ce cercle ont des périmètres qui encadrent cette ' +
          'circonférence — l\'inscrit est plus court qu\'elle, le circonscrit plus long.',
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'circleDiagram',
          inscribedPolygon: 6,
          circumscribedPolygon: 6,
          centerLabel: 'C',
          caption:
            'hexagone inscrit (sommets sur le cercle) et hexagone circonscrit (côtés tangents au ' +
            'cercle) — leurs périmètres encadrent la circonférence $2\\pi$',
        },
      },
      {
        kind: 'para',
        text:
          'Avec $n=6$ côtés, un demi-angle au centre $\\alpha = 30°$ donne, par trigonométrie dans ' +
          'le triangle rectangle formé par un rayon, une demi-corde et une demi-tangente : ' +
          '$6\\sin(30°) \\le \\pi \\le 6\\tan(30°)$, soit $3 \\le \\pi \\le 3 \\cdot \\dfrac{2\\sqrt{3}}{3} = 2\\sqrt{3}$.',
      },
      {
        kind: 'methode',
        label: "Généralisation — doubler le nombre de côtés",
        items: [
          "À chaque étape, on double le nombre de côtés des polygones ; l'angle α est alors la " +
            'moitié du précédent.',
          'Avec $n$ côtés et $\\alpha = 180°/n$ (le demi-angle au centre) : ' +
            '$n\\sin\\alpha \\le \\pi \\le n\\tan\\alpha$.',
          'Plus $n$ grandit, plus les deux bornes se resserrent autour de π.',
        ],
      },
      {
        kind: 'featureTable',
        caption: 'Encadrement de π selon le nombre de côtés n',
        headers: ['n', 'α', 'n·sin α', 'n·tan α'],
        rows: [
          ['6', '30°', '3', '2√3 ≈ 3,46'],
          ['12', '15°', '≈ 3,11', '≈ 3,22'],
          ['96', '1,875°', '≈ 3,14103', '≈ 3,14271'],
        ],
      },
      {
        kind: 'astuce',
        text:
          'Archimède avait obtenu cet encadrement dès l\'Antiquité, sans aucun moyen de calcul ' +
          'moderne : $3 + \\dfrac{10}{71} < \\pi < 3 + \\dfrac{1}{7}$, soit $3{,}14084\\ldots < \\pi < 3{,}14285\\ldots$',
      },
    ],
  },

  sections: [
    {
      id: 'arcs-secteurs',
      number: 1,
      title: 'Arcs et secteurs',
      kicker: "radian, longueur d'arc s = rθ, aire de secteur A = ½r²θ",
      blocks: [
        {
          kind: 'para',
          text:
            "Jusqu'ici, un angle se mesurait en **degrés**. Le **radian** est une autre unité, " +
            "mieux adaptée au calcul : un angle de $1$ radian est l'angle au centre qui " +
            'intercepte, sur un cercle, un arc de longueur égale au rayon. Le cercle complet ' +
            '(360°) correspond ainsi à $2\\pi$ radians.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — conversion degré ↔ radian',
          items: [
            '$\\text{angle}_{rad} = \\text{angle}_{deg} \\times \\dfrac{\\pi}{180}$ et, dans ' +
              'l\'autre sens, $\\text{angle}_{deg} = \\text{angle}_{rad} \\times \\dfrac{180}{\\pi}$.',
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — jamais de degrés dans les formules d\'arc et de secteur',
          text:
            'Les formules $s = r\\theta$ (longueur d\'arc) et $A = \\frac{1}{2}r^2\\theta$ (aire de ' +
            'secteur) n\'utilisent **que** des angles en **radians**. Si l\'énoncé donne un angle ' +
            'en degrés, la toute première étape — avant même de penser au rayon — est de le ' +
            'convertir en radians.',
        },
        {
          kind: 'rappel',
          label: 'Les mêmes formules, directement en degrés',
          items: [
            'Longueur d\'arc : $l = \\dfrac{\\alpha°}{360°} \\cdot 2\\pi r = \\dfrac{\\alpha°}{180°} \\cdot \\pi r$.',
            'Aire de secteur : $A = \\dfrac{\\alpha°}{360°} \\cdot \\pi r^2$.',
            'Ce sont les **mêmes** formules que $s=r\\theta$ et $A=\\frac{1}{2}r^2\\theta$ — ' +
              'seulement réécrites pour un angle donné directement en degrés, sans conversion préalable.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'conversion + arc + secteur',
          formula: 'Un secteur circulaire a un rayon $r = 6$ cm et un angle au centre de $60°$.',
          steps: [
            { tag: 'conversion en radians', text: '$\\theta = 60 \\times \\dfrac{\\pi}{180} = \\dfrac{\\pi}{3}$ rad' },
            { tag: "longueur de l'arc — s = rθ", text: '$s = 6 \\times \\dfrac{\\pi}{3} = 2\\pi \\approx 6{,}28$ cm' },
          ],
          result: {
            tag: 'aire du secteur — A = ½r²θ',
            text: '$A = \\frac{1}{2} \\times 6^2 \\times \\dfrac{\\pi}{3} = 6\\pi \\approx 18{,}85$ cm²',
          },
          illustration: {
            kind: 'circleDiagram',
            startAngle: PI / 6,
            sectorAngle: PI / 3,
            highlight: 'arc',
            centerLabel: 'O',
            radiusLabel: 'r',
            angleLabel: 'θ',
            caption: "secteur d'angle θ (radians), de rayon r — arc s en couleur",
          },
        },
        {
          kind: 'astuce',
          label: 'Astuce — les angles remarquables par cœur',
          items: [
            '30° = π/6 · 45° = π/4 · 60° = π/3',
            '90° = π/2 · 180° = π · 360° = 2π',
          ],
          text: 'Retiens ces six correspondances degré/radian : elles reviennent dans presque tous les exercices.',
        },
        {
          kind: 'entrainement',
          title: 'Arcs et secteurs',
          generatorId: '5gen6',
          description: [
            'Convertis des angles entre degrés et radians, puis calcule des longueurs d\'arc et ' +
              'des aires de secteurs circulaires à partir d\'un rayon et d\'un angle donnés.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 6. Arcs et secteurs »',
        },
      ],
    },
    {
      id: 'polygones',
      number: 2,
      title: 'Polygones, arcs et secteurs',
      kicker: "figures composées — additionner ou soustraire des aires élémentaires",
      blocks: [
        {
          kind: 'para',
          text:
            'Une figure composée (polygone régulier inscrit dans un cercle, secteur accolé à un ' +
            'triangle…) se traite toujours de la même façon : on la découpe en morceaux simples ' +
            '— triangles, secteurs — dont on connaît déjà l\'aire, puis on **additionne** ou on ' +
            '**soustrait** ces aires élémentaires selon que les morceaux s\'ajoutent ou se chevauchent.',
        },
        {
          kind: 'rappel',
          label: "Rappel — l'angle au centre d'un polygone régulier",
          items: [
            'Un polygone régulier à $n$ côtés inscrit dans un cercle partage celui-ci en $n$ ' +
              'triangles isocèles identiques, chacun d\'angle au centre $\\theta = \\dfrac{2\\pi}{n}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'hexagone inscrit — segment circulaire',
          formula:
            'Un hexagone régulier ABCDEF est inscrit dans un cercle de centre O et de rayon ' +
            '$r = 4$ cm. Calcule l\'aire de la région comprise entre le côté [AB] et l\'arc AB.',
          steps: [
            { tag: 'angle au centre d\'un côté — θ = 2π/n avec n = 6', text: '$\\theta = \\dfrac{2\\pi}{6} = \\dfrac{\\pi}{3}$' },
            {
              tag: 'aire du secteur OAB — A = ½r²θ',
              text: '$A_{secteur} = \\frac{1}{2} \\times 4^2 \\times \\dfrac{\\pi}{3} = \\dfrac{8\\pi}{3} \\approx 8{,}38$ cm²',
            },
            {
              tag: 'aire du triangle OAB — équilatéral, OA = OB = r, angle 60°',
              text: '$A_{triangle} = \\dfrac{\\sqrt{3}}{4} \\times 4^2 = 4\\sqrt{3} \\approx 6{,}93$ cm²',
            },
          ],
          result: {
            tag: 'aire du segment — secteur moins triangle',
            text: '$A_{segment} = \\dfrac{8\\pi}{3} - 4\\sqrt{3} \\approx 1{,}45$ cm²',
          },
          illustration: {
            kind: 'circleDiagram',
            inscribedPolygon: 6,
            startAngle: PI / 6,
            sectorAngle: PI / 3,
            highlight: 'segment',
            centerLabel: 'O',
            pointALabel: 'A',
            pointBLabel: 'B',
            angleLabel: 'θ',
            caption:
              'secteur OAB en couleur, triangle OAB (équilatéral) le long des deux rayons — leur ' +
              'différence est le segment mis en évidence',
          },
        },
        {
          kind: 'attention',
          label: "Attention — bien identifier l'angle du secteur demandé",
          text:
            'L\'angle au centre d\'**un côté** du polygone vaut toujours $2\\pi/n$, mais le ' +
            'secteur dont on te demande l\'aire ne correspond pas forcément à un seul côté : ' +
            's\'il s\'étend sur deux côtés consécutifs, son angle vaut $2 \\times 2\\pi/n$, pas ' +
            '$2\\pi/n$.',
        },
        {
          kind: 'astuce',
          text:
            'Une bonne façon de contrôler ce type de résultat : l\'aire du cercle moins l\'aire du ' +
            'polygone régulier doit valoir exactement $n$ fois l\'aire d\'un seul segment. Ici, ' +
            '$6 \\times 1{,}45 \\approx 8{,}70$ cm², à comparer à $\\pi r^2 - \\text{aire hexagone} ' +
            '\\approx 8{,}70$ cm² — ça correspond.',
        },
        {
          kind: 'entrainement',
          title: 'Polygones, arcs et secteurs',
          generatorId: '5gen7',
          description: [
            'Lis un diagramme combinant un polygone régulier inscrit dans un cercle et un ou ' +
              'plusieurs secteurs/arcs, puis calcule l\'aire d\'une figure composée.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 7. Polygones, arcs et secteurs »',
        },
      ],
    },
    {
      id: 'parametres',
      number: 3,
      title: "Paramètres d'une fonction sinusoïdale",
      kicker: 'les fonctions de référence, puis f(x) = A sin(ωx+φ) + b',
      blocks: [
        { kind: 'subheading', text: 'Les fonctions de référence sin, cos et tan' },
        {
          kind: 'para',
          text:
            'Avant de paramétrer une sinusoïde, il faut connaître ses deux fonctions de départ — ' +
            'et la fonction tangente, qui leur est apparentée mais se comporte très différemment.',
        },
        {
          kind: 'featureTable',
          caption: 'Caractéristiques des fonctions de référence (x en radians)',
          headers: ['Caractéristique', 'sin x', 'cos x', 'tan x'],
          rows: [
            ['Domaine', 'ℝ', 'ℝ', 'ℝ \\ {π/2 + kπ, k∈ℤ}'],
            ['Période', '2π', '2π', 'π'],
            ['Ensemble-image', '[−1 ; 1]', '[−1 ; 1]', 'ℝ'],
            ['Racines', 'x = kπ (k∈ℤ)', 'x = π/2 + kπ (k∈ℤ)', 'x = kπ (k∈ℤ)'],
            ['Asymptotes verticales', '—', '—', 'x = π/2 + kπ (k∈ℤ)'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.sin, tone: 'accent' }],
            xMin: -5 * (PI / 2),
            xMax: 5 * (PI / 2),
            xTicks: [-2 * PI, -3 * (PI / 2), -PI, -PI / 2, PI / 2, PI, 3 * (PI / 2), 2 * PI],
            xTickLabels: {
              [-2 * PI]: '-2π',
              [-3 * (PI / 2)]: '-3π/2',
              [-PI]: '-π',
              [-PI / 2]: '-π/2',
              [PI / 2]: 'π/2',
              [PI]: 'π',
              [3 * (PI / 2)]: '3π/2',
              [2 * PI]: '2π',
            },
            fixedYRange: { min: -1.5, max: 1.5 },
            horizontalAsymptotes: [
              { y: 1, label: 'y = 1' },
              { y: -1, label: 'y = -1' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'x → sin x — périodique de période 2π, amplitude 1, s\'annule en tout multiple de π',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.cos, tone: 'accent' }],
            xMin: -5 * (PI / 2),
            xMax: 5 * (PI / 2),
            xTicks: [-2 * PI, -3 * (PI / 2), -PI, -PI / 2, PI / 2, PI, 3 * (PI / 2), 2 * PI],
            xTickLabels: {
              [-2 * PI]: '-2π',
              [-3 * (PI / 2)]: '-3π/2',
              [-PI]: '-π',
              [-PI / 2]: '-π/2',
              [PI / 2]: 'π/2',
              [PI]: 'π',
              [3 * (PI / 2)]: '3π/2',
              [2 * PI]: '2π',
            },
            fixedYRange: { min: -1.5, max: 1.5 },
            horizontalAsymptotes: [
              { y: 1, label: 'y = 1' },
              { y: -1, label: 'y = -1' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'x → cos x — même période et amplitude que sin, s\'annule en tout multiple impair de π/2',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: TAN_CURVES,
            xMin: -4 * PI,
            xMax: 4 * PI,
            xTicks: TAN_TICKS,
            xTickLabels: TAN_TICK_LABELS,
            verticalAsymptotes: TAN_ASYMPTOTES.map((x) => ({ x })),
            fixedYRange: { min: -10, max: 10 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'x → tan x — périodique de période π (deux fois plus courte que sin/cos), non définie aux asymptotes',
          },
        },
        { kind: 'subheading', text: 'La forme paramétrée f(x) = A sin(ωx+φ) + b' },
        {
          kind: 'para',
          text:
            'Une fonction sinusoïdale s\'écrit sous la forme générale $f(x) = A \\sin(\\omega x + ' +
            '\\varphi) + b$ (ou avec un cosinus — même famille de paramètres). Chaque lettre a un ' +
            'rôle géométrique précis sur le graphique de f.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — le rôle de chaque paramètre',
          items: [
            '**A** — amplitude : demi-écart entre le maximum et le minimum, $A = \\dfrac{max - min}{2}$.',
            '**ω** — pulsation : détermine la vitesse d\'oscillation, liée à la période par $T = \\dfrac{2\\pi}{\\omega}$.',
            '**fréquence** — nombre d\'oscillations complètes par unité de x : $f_{req} = \\dfrac{1}{T} = \\dfrac{\\omega}{2\\pi}$.',
            '**φ** — déphasage : constante additive dans l\'argument, décale la courbe horizontalement.',
            '**b** — décalage vertical : valeur moyenne, $b = \\dfrac{max + min}{2}$.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Φ — le décalage horizontal (à ne pas confondre avec φ)',
          items: [
            'En écrivant $f(x) = A\\sin(\\omega(x - \\Phi)) + b$, la constante $\\Phi = ' +
              '-\\dfrac{\\varphi}{\\omega}$ indique directement de combien d\'unités **de x** la ' +
              'courbe de référence $\\sin$ a été translatée horizontalement.',
          ],
        },
        {
          kind: 'piege',
          text:
            '**φ et Φ ne sont jamais interchangeables.** φ (déphasage) est la constante ajoutée ' +
            '**dans l\'argument** ($\\omega x + \\varphi$) ; Φ (décalage horizontal) est la valeur ' +
            'soustraite **à x** ($\\omega(x-\\Phi)$), liée à φ par $\\Phi = -\\varphi/\\omega$. Un ' +
            'exercice qui demande "le déphasage" veut φ ; un exercice qui demande "le décalage ' +
            'horizontal" ou "de combien la courbe est translatée" veut Φ.',
        },
        {
          kind: 'attention',
          label: 'Attention — ω n\'est pas T',
          text:
            'La pulsation $\\omega$ est le nombre qui apparaît directement dans la formule, ' +
            'multiplié par x. La période $T$ ne s\'obtient **qu\'en passant par la formule** ' +
            '$T = 2\\pi/\\omega$ — ce n\'est ni l\'inverse direct de ω, ni égal à ω.',
        },
        {
          kind: 'exemple',
          badge: 'identifier les paramètres',
          formula: '$f(x) = 3\\sin(2x - \\dfrac{\\pi}{3}) + 1$',
          steps: [
            { tag: 'amplitude', text: '$A = 3 \\implies max = 1+3 = 4$, $min = 1-3 = -2$' },
            { tag: 'pulsation, période, fréquence', text: '$\\omega = 2 \\implies T = \\dfrac{2\\pi}{2} = \\pi \\implies f_{req} = \\dfrac{1}{\\pi}$' },
            { tag: 'déphasage', text: '$\\varphi = -\\dfrac{\\pi}{3}$' },
            { tag: 'décalage horizontal', text: '$\\Phi = -\\dfrac{\\varphi}{\\omega} = -\\dfrac{-\\pi/3}{2} = \\dfrac{\\pi}{6}$' },
          ],
          result: { tag: 'décalage vertical', text: '$b = 1$ (valeur moyenne, équidistante de 4 et de −2)' },
        },
        {
          kind: 'astuce',
          text:
            'Pour ne jamais confondre A et b : A se lit par une **soustraction** (max − min, ' +
            'divisé par 2), b se lit par une **addition** (max + min, divisé par 2).',
        },
        { kind: 'subheading', text: 'Construction pas à pas du graphique' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Tracer la droite $y = b$ (ligne moyenne) et indiquer l\'amplitude A de part et ' +
              'd\'autre, en pointillés.',
            'Partager une période complète, à partir de $\\Phi$, en 4 intervalles égaux : la ' +
              'courbe passe alors par $b$, un extremum, $b$, l\'autre extremum, $b$ — dans cet ordre.',
            'Reporter cette portion de courbe, de façon répétitive, pour couvrir tout l\'intervalle demandé.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'construction complète',
          formula: '$f(x) = 3\\sin(2x + \\dfrac{\\pi}{4}) + 1$',
          steps: [
            { tag: 'A, b, T, Φ', text: '$A=3,\\ b=1,\\ \\omega=2 \\implies T=\\pi,\\ \\varphi=\\pi/4 \\implies \\Phi=-\\pi/8$' },
            {
              tag: 'une période, en 4 parties égales à partir de Φ = −π/8',
              text: '$[-\\pi/8\\,;\\,7\\pi/8]$ divisé en 4 : $-\\pi/8,\\ \\pi/8,\\ 3\\pi/8,\\ 5\\pi/8,\\ 7\\pi/8$',
            },
          ],
          result: {
            tag: 'les 5 points obtenus',
            text: '$(-\\pi/8\\,;\\,1) \\to (\\pi/8\\,;\\,4)_{max} \\to (3\\pi/8\\,;\\,1) \\to (5\\pi/8\\,;\\,-2)_{min} \\to (7\\pi/8\\,;\\,1)$',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 3 * Math.sin(2 * x + PI / 4) + 1, tone: 'accent' }],
            xMin: -PI,
            xMax: PI,
            xTicks: [-PI / 8, PI / 8, 3 * (PI / 8), 5 * (PI / 8), 7 * (PI / 8)],
            xTickLabels: { [-PI / 8]: '-π/8', [PI / 8]: 'π/8', [3 * (PI / 8)]: '3π/8', [5 * (PI / 8)]: '5π/8', [7 * (PI / 8)]: '7π/8' },
            horizontalAsymptotes: [{ y: 1, label: 'y = 1 (ligne moyenne)' }],
            points: [
              { x: -PI / 8, y: 1, label: '', tone: 'good' },
              { x: PI / 8, y: 4, label: 'max', tone: 'accent' },
              { x: 3 * (PI / 8), y: 1, label: '', tone: 'good' },
              { x: 5 * (PI / 8), y: -2, label: 'min', tone: 'bad' },
              { x: 7 * (PI / 8), y: 1, label: '', tone: 'good' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'les 5 points construits en divisant une période en 4 parties égales à partir de Φ',
          },
        },
        {
          kind: 'entrainement',
          title: "Paramètres d'une fonction sinusoïdale",
          generatorId: '5gen8',
          description: [
            'À partir d\'une expression donnée, identifie l\'amplitude, la pulsation, la période, ' +
              'la fréquence, le déphasage φ, le décalage horizontal Φ et le décalage vertical.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 8. Paramètres d\'une fonction sinusoïdale »',
        },
      ],
    },
    {
      id: 'lecture-graphique',
      number: 4,
      title: "Paramètres d'une fonction sinusoïdale — lecture graphique",
      kicker: 'retrouver A, ω, φ, b sans aucune formule de départ',
      blocks: [
        {
          kind: 'para',
          text:
            'Les mêmes paramètres se retrouvent aussi **à partir du graphique seul**, sans ' +
            'jamais connaître la formule au départ : l\'amplitude et le décalage vertical se ' +
            'lisent directement sur les valeurs maximale et minimale, la période se mesure entre ' +
            'deux répétitions identiques du motif, et le déphasage se lit en repérant le ' +
            'décalage horizontal du « point de départ » du motif par rapport à l\'origine.',
        },
        {
          kind: 'methode',
          label: 'Méthode — lire un graphique de sinusoïde',
          items: [
            'Repère le maximum et le minimum visibles : $A = (max-min)/2$, $b = (max+min)/2$.',
            'Mesure la distance horizontale entre deux maximums consécutifs : c\'est T. Puis $\\omega = 2\\pi/T$.',
            'Repère la position $x_0$ où la courbe traverse la ligne moyenne **en montant** — ' +
              'alors $\\varphi = -\\omega \\cdot x_0$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'lecture complète sur un graphique',
          steps: [
            { tag: 'maximum lu : (1,5 ; 5) — minimum lu : (3,5 ; −1)', text: '$A = 3,\\ b = 2$' },
            { tag: 'deux maximums consécutifs : x=1,5 puis x=5,5', text: '$T = 4 \\implies \\omega = \\pi/2$' },
            { tag: 'traversée montante de la ligne moyenne en x₀ = 0,5', text: '$\\varphi = -\\omega \\cdot x_0 = -\\pi/4$' },
          ],
          result: { tag: 'résultat', text: '$f(x) = 3\\sin(\\dfrac{\\pi}{2}x - \\dfrac{\\pi}{4}) + 2$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 3 * Math.sin((PI / 2) * x - PI / 4) + 2, tone: 'accent' }],
            xMin: -1,
            xMax: 7,
            xTicks: [0.5, 1.5, 3.5, 5.5],
            horizontalAsymptotes: [{ y: 2, label: 'b = 2' }],
            points: [
              { x: 1.5, y: 5, label: 'max', tone: 'accent' },
              { x: 3.5, y: -1, label: 'min', tone: 'bad' },
              { x: 0.5, y: 2, label: 'x₀', tone: 'good' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'max en x=1,5, min en x=3,5, traversée montante de la ligne moyenne en x₀=0,5, période T=4',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — le sens de variation dépend du signe de A',
          text:
            'La convention « φ se lit à la traversée **montante** de la ligne moyenne » suppose ' +
            '$A > 0$. Si la courbe part au contraire d\'un minimum juste après avoir traversé la ' +
            'ligne moyenne en **descendant**, c\'est le signe de repérer plutôt un $A$ négatif.',
        },
        {
          kind: 'astuce',
          text:
            'Mesurer la période entre deux **maximums** consécutifs est en général plus fiable que ' +
            'de la mesurer entre deux traversées de la ligne moyenne : un maximum est un point ' +
            'isolé et net sur le graphique.',
        },
        {
          kind: 'entrainement',
          title: 'Paramètres — lecture graphique',
          generatorId: '5gen9',
          description: [
            'Retrouve l\'amplitude, la période, la pulsation, le déphasage et le décalage ' +
              'vertical d\'une fonction sinusoïdale directement à partir de son graphique.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 9. Paramètres — lecture graphique »',
        },
      ],
    },
    {
      id: 'equations',
      number: 5,
      title: 'Équations trigonométriques trig(ax+b) = k',
      kicker: "sin x=t, cos x=t, tan x=t d'abord, puis le cas général",
      blocks: [
        { kind: 'subheading', text: 'Résoudre sin x = t, cos x = t, tan x = t' },
        {
          kind: 'para',
          text:
            'Pour que $\\sin x = t$ ou $\\cos x = t$ ait une solution, il faut $-1 \\le t \\le 1$ ' +
            '— aucune condition pour $\\tan x = t$. Dans les trois cas, on détermine d\'abord un ' +
            'angle $\\alpha$ (à la calculatrice ou par une valeur remarquable), puis on utilise la ' +
            'symétrie du cercle trigonométrique pour écrire **toutes** les solutions.',
        },
        {
          kind: 'rappel',
          label: 'sin x = t',
          items: [
            'Radians : $x = \\alpha + 2k\\pi$ ou $x = (\\pi - \\alpha) + 2k\\pi$, $k \\in \\mathbb{Z}$.',
            'Degrés : $x = \\alpha + k \\cdot 360°$ ou $x = (180° - \\alpha) + k \\cdot 360°$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: 0.6, label: 'α', tone: 'accent' },
              { angle: PI - 0.6, label: 'π−α', tone: 'accent' },
            ],
            connectPoints: true,
            horizontalLine: { y: Math.sin(0.6), label: 'y = t' },
            caption: 'sin x = t : deux points de même ordonnée, symétriques par rapport à l\'axe vertical',
          },
        },
        {
          kind: 'rappel',
          label: 'cos x = t',
          items: [
            'Radians : $x = \\alpha + 2k\\pi$ ou $x = -\\alpha + 2k\\pi$, $k \\in \\mathbb{Z}$.',
            'Degrés : $x = \\alpha + k \\cdot 360°$ ou $x = -\\alpha + k \\cdot 360°$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: 0.6, label: 'α', tone: 'accent' },
              { angle: -0.6, label: '−α', tone: 'accent' },
            ],
            connectPoints: true,
            verticalLine: { x: Math.cos(0.6), label: 'x = t' },
            caption: 'cos x = t : deux points de même abscisse, symétriques par rapport à l\'axe horizontal',
          },
        },
        {
          kind: 'rappel',
          label: 'tan x = t',
          items: ['Radians : $x = \\alpha + k\\pi$. Degrés : $x = \\alpha + k \\cdot 180°$, $k \\in \\mathbb{Z}$ — **une seule** famille.'],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: 0.6, label: 'α', tone: 'accent' },
              { angle: PI + 0.6, label: 'π+α', tone: 'accent' },
            ],
            connectPoints: true,
            caption: 'tan x = t : deux points diamétralement opposés, une seule famille de solutions (période π)',
          },
        },
        { kind: 'subheading', text: 'Le cas général — trig(ax+b) = k' },
        {
          kind: 'para',
          text:
            'Résoudre $\\sin(ax+b) = k$ (ou avec un cosinus) suit toujours la même démarche en ' +
            'trois temps : on isole l\'argument $u = ax+b$, on résout $trig(u) = k$ à l\'aide du ' +
            'cercle trigonométrique (ci-dessus), puis on revient à x en divisant **toute ' +
            'l\'équation en u** — y compris le terme de période — par a.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Poser $u = ax + b$, et réécrire l\'équation en u.',
            'Résoudre $trig(u) = k$ au cercle trigonométrique.',
            'Remplacer u par ax+b, isoler x en divisant **tout** — constante ET terme périodique — par a.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux familles de solutions',
          formula: 'Résous $2\\cos(3x - \\dfrac{\\pi}{4}) = 1$ dans ℝ.',
          steps: [
            { tag: 'isoler cos(u), avec u = 3x − π/4', text: '$\\cos(u) = \\dfrac{1}{2}$' },
            { tag: 'cercle trigonométrique — deux familles', text: '$u = \\pi/3 + 2k\\pi$ ou $u = -\\pi/3 + 2k\\pi$' },
            { tag: 'remplacer u par 3x−π/4, diviser TOUT par 3', text: '$3x-\\pi/4 = \\pi/3+2k\\pi \\implies x = 7\\pi/36 + (2\\pi/3)k$' },
          ],
          result: { tag: 'résultat — deux familles', text: '$x = 7\\pi/36 + (2\\pi/3)k$ ou $x = -\\pi/36 + (2\\pi/3)k$, $k\\in\\mathbb{Z}$' },
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: PI / 3, label: 'u=π/3', tone: 'accent' },
              { angle: -PI / 3, label: 'u=−π/3', tone: 'accent' },
            ],
            connectPoints: true,
            verticalLine: { x: 0.5, label: 'cos(u)=1/2' },
            caption: 'les deux points du cercle où le cosinus vaut 1/2 — symétriques par rapport à l\'axe horizontal',
          },
        },
        {
          kind: 'piege',
          text:
            'Diviser **seulement** le terme constant par a, en oubliant de diviser aussi le ' +
            '« +2kπ » : ça donne une famille de solutions avec la mauvaise période (2π au lieu de ' +
            '2π/a).',
        },
        {
          kind: 'attention',
          label: 'Attention — |k| > 1 : aucune solution',
          text:
            '$\\cos(u) = 1{,}5$ n\'a **aucune** solution : cosinus (comme sinus) ne prend jamais ' +
            'de valeur en dehors de [−1 ; 1]. Ce n\'est pas une erreur à corriger — c\'est une ' +
            'réponse valable : l\'ensemble des solutions est vide.',
        },
        {
          kind: 'entrainement',
          title: 'Équations trigonométriques trig(ax+b)=k',
          generatorId: '5gen10',
          description: [
            'Résous des équations de la forme sin(ax+b)=k, cos(ax+b)=k ou tan(ax+b)=k, en isolant ' +
              'l\'argument puis en revenant à x — y compris les cas sans solution.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 10. Équations trigonométriques trig(ax+b)=k »',
        },
      ],
    },
    {
      id: 'extremums',
      number: 6,
      title: "Extremums d'une fonction sinusoïdale",
      kicker: 'sin(u)=±1 réunis — attention à la période effective',
      blocks: [
        {
          kind: 'para',
          text:
            'Un maximum de $A\\sin(u) + b$ (avec $A > 0$) correspond à $\\sin(u) = 1$, un minimum ' +
            'à $\\sin(u) = -1$. Ces deux conditions ont chacune une période de $2\\pi$ en u — mais ' +
            'si l\'on cherche **tous les extremums** (maximums ET minimums confondus), on réunit ' +
            'les deux familles, ce qui donne une période effective de seulement $\\pi$.',
        },
        {
          kind: 'attention',
          label: 'Attention — le piège central de cette section',
          text:
            'Ne confonds jamais **« sin(u) = 1 seul »** (une seule famille, période $2\\pi$ — les ' +
            'maximums uniquement) avec **« sin(u) = ±1 réunis »** (maximums ET minimums ' +
            'ensemble, période effective $\\pi$).',
        },
        {
          kind: 'exemple',
          badge: 'maximums, minimums, puis extremums réunis',
          formula: '$f(x) = 2\\sin(3x + \\dfrac{\\pi}{6}) - 1$. Détermine séparément les maximums, les minimums, puis tous les extremums réunis.',
          steps: [
            { tag: 'maximums — sin(u) = 1, u = 3x+π/6', text: '$x = \\pi/9 + (2\\pi/3)k$ (période 2π/3)' },
            { tag: 'minimums — sin(u) = −1', text: '$x = -2\\pi/9 + (2\\pi/3)k$ (période 2π/3)' },
          ],
          result: { tag: 'extremums réunis — |sin(u)|=1, u = π/2+kπ', text: '$x = \\pi/9 + (\\pi/3)k$, $k\\in\\mathbb{Z}$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 2 * Math.sin(3 * x + PI / 6) - 1, tone: 'accent' }],
            xMin: -1,
            xMax: 3,
            xTicks: [],
            showYAxis: false,
            points: [
              { x: PI / 9, y: 1, label: 'max', tone: 'accent' },
              { x: -2 * PI / 9 + (2 * PI) / 3, y: -3, label: 'min', tone: 'good' },
              { x: PI / 9 + (2 * PI) / 3, y: 1, label: 'max', tone: 'accent' },
            ],
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'maximums et minimums alternent tous les π/3 — la période effective des extremums réunis',
          },
        },
        {
          kind: 'astuce',
          text:
            'Relis toujours la question : « donne les maximums » (période 2π/a) n\'appelle pas la ' +
            'même formule que « donne tous les extremums » (période π/a). En cas de doute, ' +
            'calcule les deux familles séparément.',
        },
        {
          kind: 'entrainement',
          title: "Extremums d'une fonction sinusoïdale",
          generatorId: '5gen11',
          description: [
            'Détermine les maximums, les minimums, ou tous les extremums réunis d\'une fonction ' +
              'sinusoïdale.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 11. Extremums d\'une fonction sinusoïdale »',
        },
      ],
    },
    {
      id: 'geometrie-cercle',
      number: 7,
      title: 'Problèmes de géométrie du cercle',
      kicker: 'secteurs, segments circulaires, et la loi des cosinus',
      blocks: [
        {
          kind: 'para',
          text:
            'Certains problèmes de géométrie combinent secteurs, **segments circulaires** (la ' +
            'région comprise entre une corde et l\'arc qu\'elle délimite) et, parfois, la **loi ' +
            'des cosinus** pour retrouver la longueur d\'une corde ou d\'un rayon à partir d\'un ' +
            'angle au centre.',
        },
        {
          kind: 'rappel',
          label: "Rappel — aire d'un segment circulaire",
          items: [
            'Un segment circulaire d\'angle au centre θ (radians) et de rayon r s\'obtient en ' +
              'retirant, du secteur, le triangle formé par les deux rayons et la corde : ' +
              '$A_{segment} = \\frac{1}{2}r^2\\theta - \\frac{1}{2}r^2\\sin(\\theta) = \\frac{1}{2}r^2(\\theta - \\sin\\theta)$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'segment circulaire + corde',
          formula:
            'Un cercle de centre O et de rayon $r = 10$ cm ; deux rayons OA et OB forment un ' +
            'angle $\\theta = \\dfrac{2\\pi}{3}$ (120°). Calcule l\'aire du segment circulaire ' +
            'délimité par la corde [AB], puis la longueur de cette corde.',
          steps: [
            { tag: 'aire du secteur OAB — A = ½r²θ', text: '$A_{secteur} = \\frac{1}{2} \\times 100 \\times \\dfrac{2\\pi}{3} \\approx 104{,}72$ cm²' },
            { tag: 'aire du triangle OAB — A = ½r²sin(θ)', text: '$A_{triangle} = 50\\sin(120°) = 25\\sqrt{3} \\approx 43{,}30$ cm²' },
            { tag: 'corde AB — loi des cosinus, AB² = 2r²(1−cos θ)', text: '$AB^2 = 200 \\times 1{,}5 = 300$' },
          ],
          result: {
            tag: 'résultat',
            text: '$A_{segment} \\approx 61{,}42$ cm² et $AB = \\sqrt{300} = 10\\sqrt{3} \\approx 17{,}32$ cm',
          },
          illustration: {
            kind: 'circleDiagram',
            startAngle: 2 * (PI / 3),
            sectorAngle: 2 * (PI / 3),
            highlight: 'segment',
            showChord: true,
            centerLabel: 'O',
            pointALabel: 'A',
            pointBLabel: 'B',
            angleLabel: 'θ',
            caption: 'secteur OAB en contour, segment circulaire (entre la corde AB et l\'arc) en couleur',
          },
        },
        {
          kind: 'astuce',
          text:
            'Le triangle OAB d\'un secteur est toujours isocèle (deux côtés valent r) — sa ' +
            'surface se calcule directement par $\\frac{1}{2}r^2\\sin(\\theta)$, sans jamais ' +
            'avoir besoin de connaître la hauteur ni la base.',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes de géométrie du cercle',
          generatorId: '5gen12',
          description: [
            'Combine secteurs, segments circulaires et loi des cosinus pour retrouver une corde, ' +
              'un rayon ou une aire dans des figures géométriques variées.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 12. Problèmes de géométrie du cercle »',
        },
      ],
    },
    {
      id: 'modeliser',
      number: 8,
      title: 'Modéliser une fonction sinusoïdale en contexte',
      kicker: 'construire A, b, T (donc ω), puis φ à partir d\'une condition initiale',
      blocks: [
        {
          kind: 'para',
          text:
            'Une fonction de la forme $A\\sin(\\omega x + \\varphi) + b$ décrit naturellement un ' +
            'mouvement d\'**oscillation** (pendule), un **mouvement circulaire** (une grande roue ' +
            'dans un parc d\'attraction) ou l\'intensité d\'un **signal électrique sinusoïdal** — ' +
            'trois situations très différentes, mais construites avec exactement la même méthode.',
        },
        {
          kind: 'para',
          text:
            'Face à une situation concrète et périodique, construire le modèle se fait toujours ' +
            'dans le **même ordre** : amplitude et décalage vertical d\'abord (à partir des ' +
            'valeurs extrêmes), période ensuite (donc pulsation), et enfin la phase — la seule ' +
            'qui nécessite une **condition initiale** précise donnée par l\'énoncé.',
        },
        {
          kind: 'methode',
          label: 'Méthode — construire le modèle pas à pas',
          items: [
            'A = (valeur max − valeur min) / 2.',
            'b = (valeur max + valeur min) / 2.',
            'T = durée d\'un cycle complet ⟹ ω = 2π/T.',
            'φ : injecter la condition initiale dans $A\\sin(\\omega t+\\varphi)+b$, puis résoudre ' +
              'en φ — en choisissant la solution la plus simple.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — une grande roue',
          blocks: [
            {
              kind: 'para',
              text:
                'Une grande roue a un rayon de 15 m ; le centre de la roue est situé à 17 m du ' +
                'sol. Elle effectue un tour complet en 8 minutes. À l\'instant $t=0$ ' +
                '(embarquement), une nacelle se trouve à son point le plus bas.',
            },
            {
              kind: 'illustrationGroup',
              items: [
                {
                  kind: 'circleDiagram',
                  groundLine: true,
                  markedPoint: { angle: -PI / 2, label: 't=0' },
                  radiusLabel: 'r=15',
                  caption: 'la nacelle part du point le plus bas (t=0)',
                },
              ],
            },
            {
              kind: 'para',
              text:
                'Amplitude et décalage vertical, à partir des positions extrêmes : hauteur ' +
                'maximale $= 17+15=32$ m, minimale $=17-15=2$ m $\\implies A=15,\\ b=17$.',
            },
            { kind: 'para', text: 'Pulsation, avec $T=8$ min : $\\omega = \\dfrac{2\\pi}{8} = \\dfrac{\\pi}{4}$.' },
            {
              kind: 'para',
              text:
                'Phase, condition initiale hauteur(0)=2 : $15\\sin(\\varphi)+17=2 \\implies ' +
                '\\sin(\\varphi)=-1 \\implies \\varphi = -\\dfrac{\\pi}{2}$ (solution la plus simple).',
            },
            {
              kind: 'para',
              text: 'Modèle complet : $hauteur(t) = 15\\sin(\\dfrac{\\pi}{4}t - \\dfrac{\\pi}{2}) + 17$ (t en minutes).',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (t) => 15 * Math.sin((PI / 4) * t - PI / 2) + 17, tone: 'good' }],
                xMin: 0,
                xMax: 12,
                xTicks: [4, 8, 12],
                horizontalAsymptotes: [{ y: 2, label: 'min = 2' }, { y: 32, label: 'max = 32' }],
                points: [
                  { x: 0, y: 2, label: 't=0', tone: 'accent' },
                  { x: 4, y: 32, label: '', tone: 'accent' },
                ],
                xAxisLabel: 't (min)',
                yAxisLabel: 'hauteur (m)',
                caption:
                  'la nacelle part du point bas (t=0, hauteur=2) et atteint le point haut ' +
                  '(hauteur=32) après un demi-tour, à t=4 min',
              },
            },
            {
              kind: 'para',
              text:
                'Vérification : $hauteur(4) = 15\\sin(\\pi - \\pi/2) + 17 = 15\\sin(\\pi/2)+17 = ' +
                '32$ m — exactement le point le plus haut, cohérent.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — φ n\'est pas unique',
          text:
            'L\'équation $\\sin(\\varphi) = -1$ a une infinité de solutions ($\\varphi = -\\pi/2 + ' +
            '2k\\pi$). On choisit conventionnellement la plus simple — en général celle qui ' +
            'appartient à $]-\\pi\\,;\\,\\pi]$ — mais toute autre valeur de cette famille donnerait ' +
            'exactement la même fonction.',
        },
        {
          kind: 'astuce',
          text:
            'Une fois le modèle construit, vérifie-le toujours sur **une deuxième donnée** de ' +
            'l\'énoncé (ici, le point haut à t=4). Une erreur de signe sur φ se détecte ' +
            'immédiatement si la vérification donne un minimum au lieu d\'un maximum.',
        },
        {
          kind: 'entrainement',
          title: 'Modéliser une fonction sinusoïdale en contexte',
          generatorId: '5gen13',
          description: [
            'Construis pas à pas une fonction sinusoïdale complète à partir d\'une situation ' +
              'concrète (grande roue, marée, température saisonnière…).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 13. Modéliser une fonction sinusoïdale en contexte »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Radian** — $\\text{angle}_{rad} = \\text{angle}_{deg} \\times \\pi/180$ ; les formules ' +
        '$s=r\\theta$ et $A=\\frac{1}{2}r^2\\theta$ n\'utilisent que des radians (les versions en ' +
        'degrés existent aussi, directement).',
      '**Fonctions de référence** — sin et cos : domaine ℝ, période 2π, image [−1;1] ; tan : ' +
        'période π, image ℝ, asymptotes en π/2+kπ.',
      '**Figures composées** — décomposer en triangles et secteurs élémentaires, additionner ou ' +
        'soustraire ; l\'angle d\'un polygone régulier vaut 2π/n par côté.',
      '**Paramètres d\'une sinusoïde** — $A=(max-min)/2$, $b=(max+min)/2$, $T=2\\pi/\\omega$ ; ' +
        'φ (déphasage, additif dans l\'argument) ≠ Φ (décalage horizontal, $\\Phi=-\\varphi/\\omega$).',
      '**Lecture graphique** — max/min pour A et b, distance entre deux maximums pour T, ' +
        'traversée montante de la ligne moyenne pour φ.',
      '**Équations** — d\'abord sin x=t / cos x=t / tan x=t au cercle trigonométrique, puis ' +
        'trig(ax+b)=k en isolant l\'argument et en divisant TOUT (constante et période) par a.',
      '**Extremums** — sin(u)=1 seul (période 2π, maximums) ≠ sin(u)=±1 réunis (période π, tous ' +
        'les extremums).',
      '**Géométrie du cercle** — aire d\'un segment = aire du secteur − aire du triangle ' +
        '($\\frac{1}{2}r^2\\sin\\theta$) ; loi des cosinus pour une corde.',
      '**Modéliser en contexte** — A et b à partir des extrêmes, T (donc ω) à partir de la durée ' +
        'd\'un cycle, φ en dernier à partir d\'une condition initiale précise.',
    ],
    checklist: {
      items: [
        'Ai-je bien converti tout angle en degrés vers les radians avant d\'utiliser s=rθ ou A=½r²θ ?',
        'Pour une sinusoïde : ai-je distingué la pulsation ω de la période T (T=2π/ω) ?',
        'Ai-je bien distingué φ (déphasage, additif) et Φ (décalage horizontal, Φ=−φ/ω) ?',
        'Pour une équation trig(ax+b)=k : ai-je divisé par a le terme constant ET le terme périodique en 2kπ ?',
        'Pour des extremums : la question porte-t-elle sur les maximums seuls, les minimums seuls, ou tous les extremums réunis ?',
      ],
    },
    forward:
      'Certaines de ces notions reviendront plus loin, notamment quand les suites permettront de ' +
      'décrire des phénomènes discrets liés à des cycles périodiques.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen40',
      description: [
        '7 thèmes de 20 affirmations chacun (arcs et secteurs, paramètres et graphes de ' +
          'sinusoïdes, équations trigonométriques, identités et factorisation, extremums, ' +
          'géométrie et modélisation) — choisis un thème, réponds vrai ou faux, la justification ' +
          'est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 40. Trigonométrie — quiz vrai/faux »',
    },
  },
}
