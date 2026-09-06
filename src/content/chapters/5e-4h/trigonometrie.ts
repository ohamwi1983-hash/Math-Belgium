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

  sections: [
    {
      id: 'arcs-secteurs',
      number: 1,
      title: 'Arcs et secteurs',
      kicker: "radian, longueur d'arc s = rθ, aire de secteur A = ½r²θ",
      blocks: [
        { kind: 'subheading', text: 'Comment encadrer le nombre π ?' },
        {
          kind: 'para',
          text:
            'Le nombre π est défini comme le rapport constant entre la circonférence d\'un cercle ' +
            "et son diamètre. Mais comment en obtenir une valeur approchée sans instrument de " +
            'mesure ? Dès l\'Antiquité, **Archimède** (3e siècle av. J.-C.) a eu l\'idée d\'encadrer ' +
            'le cercle entre deux polygones réguliers à $n$ côtés : un **inscrit** (à l\'intérieur ' +
            'du cercle, sommets sur le cercle) et un **circonscrit** (à l\'extérieur, côtés ' +
            'tangents au cercle). Le périmètre du cercle est nécessairement compris entre les deux.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.6, xMax: 3.3, yMin: -2.6, yMax: 2.9,
            showAxes: false,
            circle: { cx: 0, cy: 0, r: 2, tone: 'faint' },
            vectors: [
              // Hexagone inscrit (sommets sur le cercle, rayon r=2, tous les 60°) — arête AB en vert.
              { from: { x: 1.732, y: 1 }, to: { x: 0, y: 2 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 2 }, to: { x: -1.732, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: -1.732, y: 1 }, to: { x: -1.732, y: -1 }, tone: 'ink', arrow: false },
              { from: { x: -1.732, y: -1 }, to: { x: 0, y: -2 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: -2 }, to: { x: 1.732, y: -1 }, tone: 'ink', arrow: false },
              { from: { x: 1.732, y: -1 }, to: { x: 1.732, y: 1 }, tone: 'good', arrow: false },
              // Hexagone circonscrit (côtés tangents au cercle, mêmes directions, rayon R=r/cosα) —
              // arête DE en accent, tangente en F.
              { from: { x: 2, y: 1.1547 }, to: { x: 0, y: 2.3094 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 2.3094 }, to: { x: -2, y: 1.1547 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -2, y: 1.1547 }, to: { x: -2, y: -1.1547 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -2, y: -1.1547 }, to: { x: 0, y: -2.3094 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: -2.3094 }, to: { x: 2, y: -1.1547 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 2, y: -1.1547 }, to: { x: 2, y: 1.1547 }, tone: 'accent', arrow: false },
              // Construction : rayons vers B et A, rayon horizontal vers le point de tangence F.
              { from: { x: 0, y: 0 }, to: { x: 1.732, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 1.732, y: -1 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 2, y: 0 }, tone: 'ink', arrow: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: -30, toDeg: 0, radiusPx: 22, tone: 'accent', label: 'α' }],
            rightAngleMarkers: [
              { vertex: { x: 1.732, y: 0 }, arm1: { x: 0, y: 0 }, arm2: { x: 1.732, y: 1 } },
              { vertex: { x: 2, y: 0 }, arm1: { x: 0, y: 0 }, arm2: { x: 2, y: 1.1547 } },
            ],
            points: [
              { x: 0, y: 0, label: 'C', tone: 'ink', labelPos: 'below' },
              { x: 1.732, y: 1, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 1.732, y: -1, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 1.732, y: 0, label: 'H', tone: 'ink', labelPos: 'above' },
              { x: 2, y: 0, label: 'F', tone: 'ink', labelPos: 'above' },
              { x: 2, y: 1.1547, label: 'D', tone: 'accent', labelPos: 'above' },
              { x: 2, y: -1.1547, label: 'E', tone: 'accent', labelPos: 'below' },
              { x: 0.85, y: 0.6, label: 'r', tone: 'ink', node: false, labelPos: 'above' },
              { x: 3.2, y: 0.85, label: 'AB=2r sinα', tone: 'good', node: false, labelPos: 'left' },
              { x: 3.2, y: 1.85, label: 'DE=2r tanα', tone: 'accent', node: false, labelPos: 'left' },
            ],
            caption:
              'hexagone inscrit (côté AB, en vert) et hexagone circonscrit (côté DE, tangent en F, ' +
              'en accent) — le périmètre du cercle est encadré entre les deux',
          },
        },
        {
          kind: 'para',
          text:
            'Pour un polygone régulier à $n$ côtés construit autour d\'un cercle de rayon $r$, ' +
            'chacun des $n$ triangles au centre a un angle au sommet $\\alpha = 180°/n$ (la moitié ' +
            'de l\'angle total du triangle isocèle CAB). Le côté du polygone **inscrit** vaut ' +
            '$|AB| = 2r\\sin\\alpha$ et le côté du polygone **circonscrit** (tangent au cercle en ' +
            'F) vaut $|DE| = 2r\\tan\\alpha$. En multipliant par $n$ et en comparant au périmètre ' +
            'du cercle $2\\pi r$ :',
        },
        {
          kind: 'rappel',
          label: "Rappel — encadrement de π par les polygones d'Archimède",
          items: [
            '$n \\cdot 2r\\sin\\alpha \\leq 2\\pi r \\leq n \\cdot 2r\\tan\\alpha$, soit, après ' +
              'simplification par $2r$ : $n\\sin\\alpha \\leq \\pi \\leq n\\tan\\alpha$ avec ' +
              '$\\alpha = 180°/n$.',
          ],
        },
        {
          kind: 'para',
          text:
            'Plus $n$ est grand, plus les deux polygones se rapprochent du cercle et plus ' +
            "l'encadrement se resserre :",
        },
        {
          kind: 'featureTable',
          headers: ['n côtés', 'α = 180°/n', 'minorant n·sin α', 'majorant n·tan α'],
          rows: [
            ['6', '30°', '3,000', '3,464'],
            ['12', '15°', '3,106', '3,215'],
            ['96', '1,875°', '3,141', '3,143'],
          ],
        },
        {
          kind: 'para',
          text:
            "En partant d'un hexagone ($n=6$) et en doublant six fois le nombre de côtés jusqu'à " +
            'un polygone à 96 côtés, Archimède est parvenu à l\'encadrement historique ' +
            '$3 + \\frac{10}{71} < \\pi < 3 + \\frac{1}{7}$, soit environ $3{,}1408 < \\pi < ' +
            '3{,}1429$ — un résultat obtenu sans aucune calculatrice, uniquement par géométrie.',
        },
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
            'convertir en radians. Un θ laissé en degrés dans ces formules donne un résultat sans ' +
            'aucun sens.',
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
          kind: 'rappel',
          label: 'Rappel — cercle trigonométrique',
          items: [
            'Le **cercle trigonométrique** est le cercle de rayon 1, centré à l\'origine d\'un ' +
              'repère orthonormé. On l\'oriente dans le **sens positif** (le sens anti-horloger). ' +
              'Mesurer un angle en radians revient à **enrouler** la droite réelle autour de ce ' +
              'cercle : à chaque réel $x$ correspond un unique point $M$ du cercle, son **point ' +
              'image**, obtenu en parcourant une longueur d\'arc $x$ depuis le point $(1;0)$ (dans ' +
              'le sens positif si $x > 0$, dans le sens négatif sinon). Comme le cercle a pour ' +
              'périmètre $2\\pi$, deux réels qui diffèrent d\'un multiple de $2\\pi$ ont le même ' +
              'point image.',
            'Sur ce cercle, l\'abscisse du point image de x est $\\cos x$ et son ordonnée est ' +
              '$\\sin x$ — c\'est la définition même des lignes trigonométriques pour un réel ' +
              'quelconque, plus seulement pour un angle aigu d\'un triangle rectangle.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            pointLabelStyle: 'mono',
            projectToXAxis: true,
            projectToYAxis: true,
            freeLabels: [
              { x: 0.34, y: 1.46, text: 'sin', tone: 'ink' },
              { x: 1.28, y: 0.16, text: 'cos', tone: 'ink' },
            ],
            points: [
              { angle: 0, label: '0°', sublabel: '0', tone: 'ink' },
              { angle: PI / 6, label: '30°', sublabel: 'π/6', tone: 'sky' },
              { angle: PI / 4, label: '45°', sublabel: 'π/4', tone: 'plan' },
              { angle: PI / 3, label: '60°', sublabel: 'π/3', tone: 'rose' },
              { angle: PI / 2, label: '90°', sublabel: 'π/2', tone: 'good' },
              { angle: 2 * (PI / 3), label: '120°', sublabel: '2π/3', tone: 'rose' },
              { angle: 3 * (PI / 4), label: '135°', sublabel: '3π/4', tone: 'plan' },
              { angle: 5 * (PI / 6), label: '150°', sublabel: '5π/6', tone: 'sky' },
              { angle: PI, label: '180°', sublabel: 'π', tone: 'bad' },
              { angle: 7 * (PI / 6), label: '210°', sublabel: '7π/6', tone: 'sky' },
              { angle: 5 * (PI / 4), label: '225°', sublabel: '5π/4', tone: 'plan' },
              { angle: 4 * (PI / 3), label: '240°', sublabel: '4π/3', tone: 'rose' },
              { angle: 3 * (PI / 2), label: '270°', sublabel: '3π/2', tone: 'accent' },
              { angle: 5 * (PI / 3), label: '300°', sublabel: '5π/3', tone: 'rose' },
              { angle: 7 * (PI / 4), label: '315°', sublabel: '7π/4', tone: 'plan' },
              { angle: 11 * (PI / 6), label: '330°', sublabel: '11π/6', tone: 'sky' },
            ],
            caption:
              'les angles particuliers des quatre quadrants, placés sur le cercle trigonométrique ' +
              '(même couleur que leur angle de référence 30°/45°/60°) — la projection verticale ' +
              '(pointillé) donne cos, la projection horizontale donne sin ; valeurs exactes dans ' +
              'le tableau ci-dessous',
          },
        },
        {
          kind: 'featureTable',
          headers: ['angle', '0°', '30°', '45°', '60°', '90°', '180°', '270°', '360°'],
          rows: [
            ['en radians', '0', 'π/6', 'π/4', 'π/3', 'π/2', 'π', '3π/2', '2π'],
            ['cos', '1', '√3/2', '√2/2', '1/2', '0', '−1', '0', '1'],
            ['sin', '0', '1/2', '√2/2', '√3/2', '1', '0', '−1', '0'],
            ['tan', '0', '√3/3', '1', '√3', 'non définie', '0', 'non définie', '0'],
          ],
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
            '$2\\pi/n$. Compte toujours, sur la figure, le nombre exact de côtés couverts par le ' +
            'secteur en question avant de calculer son angle — ne suppose jamais qu\'il s\'agit ' +
            'automatiquement de l\'angle élémentaire du polygone.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — vérifier par l\'aire totale',
          text:
            'Une bonne façon de contrôler ce type de résultat : l\'aire du cercle moins l\'aire du ' +
            'polygone régulier doit valoir exactement $n$ fois l\'aire d\'un seul segment. Ici, ' +
            '$6 \\times 1{,}45 \\approx 8{,}70$ cm², à comparer à $\\pi r^2 - \\text{aire hexagone} ' +
            '= 16\\pi - 24\\sqrt{3} \\approx 50{,}27 - 41{,}57 \\approx 8{,}70$ cm² — ça correspond.',
        },
        {
          kind: 'entrainement',
          title: 'Polygones, arcs et secteurs',
          generatorId: '5gen7',
          description: [
            'Lis un diagramme combinant un polygone régulier inscrit dans un cercle et un ou ' +
              'plusieurs secteurs/arcs, puis calcule l\'aire d\'une figure composée en décomposant ' +
              'en triangles et secteurs élémentaires.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 7. Polygones, arcs et secteurs »',
        },
      ],
    },
    {
      id: 'geometrie-cercle',
      number: 3,
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
            { tag: 'aire du triangle OAB — deux côtés r, angle inclus θ : A = ½r²sin(θ)', text: '$A_{triangle} = 50\\sin(120°) = 25\\sqrt{3} \\approx 43{,}30$ cm²' },
            { tag: 'corde AB — loi des cosinus, AB² = r²+r²−2r²cos(θ)', text: '$AB^2 = 200 \\times (1 - \\cos(120°)) = 200 \\times 1{,}5 = 300$' },
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
            'surface se calcule directement par $\\frac{1}{2}r^2\\sin(\\theta)$ (aire d\'un ' +
            'triangle via deux côtés et l\'angle inclus), sans jamais avoir besoin de connaître la ' +
            'hauteur ni la base.',
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
      id: 'parametres',
      number: 4,
      title: "Paramètres d'une fonction sinusoïdale",
      kicker: 'f(x) = A sin(ωx+φ) + b — le sens de chaque lettre',
      blocks: [
        { kind: 'subheading', text: 'Les trois fonctions de référence : sinus, cosinus, tangente' },
        {
          kind: 'para',
          text:
            'Avant de généraliser à la forme paramétrée, rappelons les propriétés des trois ' +
            'fonctions trigonométriques de base — celles dont le point image sur le cercle ' +
            'trigonométrique donne directement les valeurs.',
        },
        {
          kind: 'featureTable',
          caption: 'Caractéristiques des fonctions de référence (x en radians)',
          headers: ['fonction', 'domaine', 'image (ensemble des valeurs)', 'période', 'parité'],
          rows: [
            ['sin x', 'ℝ', '[−1 ; 1]', '2π', 'impaire'],
            ['cos x', 'ℝ', '[−1 ; 1]', '2π', 'paire'],
            ['tan x', 'ℝ \\ {π/2 + kπ, k∈ℤ}', 'ℝ', 'π', 'impaire'],
          ],
        },
        {
          kind: 'para',
          text:
            '**Paire** : $\\cos(-x) = \\cos x$ (symétrie par rapport à l\'axe des ordonnées). ' +
            '**Impaire** : $\\sin(-x) = -\\sin x$ et $\\tan(-x) = -\\tan x$ (symétrie par rapport à ' +
            "l'origine).",
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
            caption: 'y = sin x — impaire, symétrique par rapport à l\'origine ; image [−1;1], période 2π',
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
            caption: 'y = cos x — paire, symétrique par rapport à l\'axe des ordonnées ; image [−1;1], période 2π',
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
            caption: 'y = tan x — impaire ; asymptotes verticales en x=π/2+kπ (là où cos x = 0), période π',
          },
        },
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
            '$T = 2\\pi/\\omega$ — ce n\'est ni l\'inverse direct de ω, ni égal à ω. Une confusion ' +
            'fréquente : croire que « ω = 3 » signifie « la courbe se répète tous les 3 » — en ' +
            'réalité, elle se répète tous les $2\\pi/3$.',
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
            'divisé par 2), b se lit par une **addition** (max + min, divisé par 2). Si tu obtiens ' +
            'la même formule pour les deux, relis l\'énoncé — c\'est le signe d\'une erreur.',
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
      number: 5,
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
            'Mesure la distance horizontale entre deux maximums consécutifs (ou deux motifs ' +
              'identiques) : c\'est T. Puis $\\omega = 2\\pi/T$.',
            'Repère la position $x_0$ où la courbe traverse la ligne moyenne **en montant** — ' +
              'c\'est là que $\\sin(\\omega x+\\varphi)$ vaut 0 en croissant. Alors $\\varphi = -\\omega \\cdot x_0$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'lecture complète sur un graphique',
          steps: [
            { tag: 'maximum lu : (1,5 ; 5) — minimum lu : (3,5 ; −1)', text: '$A = 3,\\ b = 2$' },
            { tag: 'deux maximums consécutifs : x=1,5 puis x=5,5', text: '$T = 4 \\implies \\omega = \\pi/2$' },
            { tag: 'traversée montante de la ligne moyenne (y=2) en x₀ = 0,5', text: '$\\varphi = -\\omega \\cdot x_0 = -\\pi/4$' },
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
            caption: 'max en x=1,5, min en x=3,5, traversée montante de la ligne moyenne en x₀=0,5, période T=4 (entre les deux max)',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — le sens de variation dépend du signe de A',
          text:
            'La convention « φ se lit à la traversée **montante** de la ligne moyenne » suppose ' +
            '$A > 0$. Si la courbe part au contraire d\'un minimum juste après avoir traversé la ' +
            'ligne moyenne en **descendant**, c\'est le signe de repérer plutôt un $A$ négatif (ou ' +
            'de choisir la traversée descendante comme point de référence). Vérifie toujours le ' +
            'sens de variation juste après le point que tu choisis, avant de lire φ — sinon la ' +
            'phase trouvée est fausse d\'un demi-tour.',
        },
        {
          kind: 'astuce',
          text:
            'Mesurer la période entre deux **maximums** consécutifs est en général plus fiable que ' +
            'de la mesurer entre deux traversées de la ligne moyenne : un maximum est un point ' +
            'isolé et net sur le graphique, alors qu\'une traversée de ligne moyenne est plus ' +
            'facile à mal pointer au pixel près.',
        },
        {
          kind: 'entrainement',
          title: 'Paramètres — lecture graphique',
          generatorId: '5gen9',
          description: [
            'Retrouve l\'amplitude, la période, la pulsation, la phase et le décalage vertical ' +
              'd\'une fonction sinusoïdale directement à partir de son graphique, sans formule de départ.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 9. Paramètres — lecture graphique »',
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
            'ensemble, période effective $\\pi$). Les deux formules sont différentes, et répondre ' +
            'à « donne tous les extremums » avec la formule d\'un seul type d\'extremum est une ' +
            'erreur très fréquente.',
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
            caption: 'maximums et minimums alternent tous les π/3 — c\'est la période effective des extremums réunis',
          },
        },
        {
          kind: 'astuce',
          text:
            'Relis toujours la question : « donne les maximums » (une seule famille, période 2π/a) ' +
            'n\'appelle pas la même formule que « donne tous les extremums » (les deux familles ' +
            'réunies, période π/a). En cas de doute, calcule les deux familles séparément — c\'est ' +
            'plus long, mais toujours juste — et ne les réunis qu\'à la toute fin, si la question ' +
            'le demande explicitement.',
        },
        {
          kind: 'entrainement',
          title: "Extremums d'une fonction sinusoïdale",
          generatorId: '5gen11',
          description: [
            'Détermine les maximums, les minimums, ou tous les extremums réunis d\'une fonction ' +
              'sinusoïdale — l\'exercice précise à chaque fois lequel des trois est demandé.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 11. Extremums d\'une fonction sinusoïdale »',
        },
      ],
    },
    {
      id: 'modeliser',
      number: 7,
      title: 'Modéliser une fonction sinusoïdale en contexte',
      kicker: 'construire A, b, T (donc ω), puis φ à partir d\'une condition initiale',
      blocks: [
        {
          kind: 'para',
          text:
            'Face à une situation concrète et périodique (grande roue, marée, température ' +
            'saisonnière…), construire le modèle sinusoïdal se fait toujours dans le **même ' +
            'ordre** : amplitude et décalage vertical d\'abord (à partir des valeurs extrêmes), ' +
            'période ensuite (donc pulsation), et enfin la phase — la seule qui nécessite une ' +
            '**condition initiale** précise donnée par l\'énoncé.',
        },
        {
          kind: 'methode',
          label: 'Méthode — construire le modèle pas à pas',
          items: [
            'A = (valeur max − valeur min) / 2.',
            'b = (valeur max + valeur min) / 2.',
            'T = durée d\'un cycle complet (donnée par l\'énoncé) ⟹ ω = 2π/T.',
            'φ : injecter la condition initiale (une valeur connue à un instant connu) dans ' +
              '$A\\sin(\\omega t+\\varphi)+b$, puis résoudre en φ — en choisissant la solution la ' +
              'plus simple parmi l\'infinité de solutions possibles.',
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
                '32$ m — exactement le point le plus haut, atteint après un demi-tour (4 minutes), ' +
                'ce qui est cohérent.',
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
            'exactement la même fonction, puisque le sinus est périodique de période 2π.',
        },
        {
          kind: 'astuce',
          text:
            'Une fois le modèle construit, vérifie-le toujours sur **une deuxième donnée** de ' +
            'l\'énoncé (ici, le point haut à t=4, un demi-tour plus tard) — comme dans l\'exemple ' +
            'ci-dessus. Une erreur de signe sur φ se détecte immédiatement si la vérification ' +
            'donne un minimum au lieu d\'un maximum, ou inversement.',
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
    {
      id: 'equations',
      number: 8,
      title: 'Équations trigonométriques trig(ax+b) = k',
      kicker: 'isoler l\'argument, résoudre au cercle trigonométrique, puis diviser par a',
      blocks: [
        { kind: 'subheading', text: 'Résoudre sin x = t, cos x = t, tan x = t' },
        {
          kind: 'para',
          text:
            'Pour que $\\sin x = t$ ou $\\cos x = t$ ait une solution, il faut $-1 \\le t \\le 1$ ' +
            '— aucune condition pour $\\tan x = t$. Dans les trois cas, on détermine d\'abord un ' +
            'angle $\\alpha$ (à la calculatrice ou par une valeur remarquable), puis on utilise la ' +
            '**symétrie du cercle trigonométrique** pour écrire toutes les solutions.',
        },
        {
          kind: 'rappel',
          label: 'sin x = t',
          items: [
            '$x = \\alpha + 2k\\pi$ ou $x = (\\pi - \\alpha) + 2k\\pi$, $k \\in \\mathbb{Z}$ (en ' +
              'degrés : $x = \\alpha + k \\cdot 360°$ ou $x = (180° - \\alpha) + k \\cdot 360°$).',
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
            '$x = \\alpha + 2k\\pi$ ou $x = -\\alpha + 2k\\pi$, $k \\in \\mathbb{Z}$ (en degrés : ' +
              '$x = \\alpha + k \\cdot 360°$ ou $x = -\\alpha + k \\cdot 360°$).',
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
          items: ['$x = \\alpha + k\\pi$, $k \\in \\mathbb{Z}$ (en degrés : $x = \\alpha + k \\cdot 180°$) — **une seule** famille.'],
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
            caption: 'tan x = t : deux points diamétralement opposés — une seule famille de solutions (période π)',
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
            'Poser $u = ax + b$, et réécrire l\'équation en u : $trig(u) = k$.',
            'Résoudre $trig(u) = k$ au cercle trigonométrique — pour cos et sin, deux familles de ' +
              'solutions en général (une seule pour tan) ; aucune solution si $|k| > 1$ pour sin/cos.',
            'Remplacer u par ax+b, isoler x en divisant **tout** — constante ET terme périodique — ' +
              'par a.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux familles de solutions',
          formula: 'Résous $2\\cos(3x - \\dfrac{\\pi}{4}) = 1$ dans ℝ.',
          steps: [
            { tag: 'isoler cos(u), avec u = 3x − π/4', text: '$\\cos(u) = \\dfrac{1}{2}$' },
            { tag: 'cercle trigonométrique — cos(u)=1/2 : deux familles', text: '$u = \\pi/3 + 2k\\pi$ ou $u = -\\pi/3 + 2k\\pi$' },
            { tag: 'remplacer u par 3x−π/4, isoler x — diviser TOUT par 3', text: '$3x-\\pi/4 = \\pi/3+2k\\pi \\implies x = 7\\pi/36 + (2\\pi/3)k$' },
          ],
          result: { tag: 'résultat — deux familles de solutions', text: '$x = 7\\pi/36 + (2\\pi/3)k$ ou $x = -\\pi/36 + (2\\pi/3)k$, $k\\in\\mathbb{Z}$' },
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: PI / 3, label: 'u=π/3', tone: 'accent' },
              { angle: -PI / 3, label: 'u=−π/3', tone: 'accent' },
            ],
            connectPoints: true,
            verticalLine: { x: 0.5, label: 'cos(u)=1/2' },
            caption: 'les deux points du cercle où l\'abscisse (cosinus) vaut 1/2 — symétriques par rapport à l\'axe horizontal',
          },
        },
        {
          kind: 'piege',
          text:
            'Diviser **seulement** le terme constant par a, en oubliant de diviser aussi le ' +
            '« +2kπ » : ça donne une famille de solutions avec la mauvaise période (2π au lieu de ' +
            '2π/a). Toute l\'équation en u — terme constant ET terme périodique — passe par la ' +
            'même division.',
        },
        {
          kind: 'attention',
          label: 'Attention — |k| > 1 : aucune solution',
          text:
            '$\\cos(u) = 1{,}5$ n\'a **aucune** solution, car cosinus (comme sinus) ne prend ' +
            'jamais de valeur en dehors de [−1 ; 1]. Ce n\'est pas une erreur de calcul à corriger ' +
            '— c\'est une réponse valable : l\'ensemble des solutions est vide.',
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
  ],

  recap: {
    items: [
      '**Radian** — $\\text{angle}_{rad} = \\text{angle}_{deg} \\times \\pi/180$ ; les formules ' +
        '$s=r\\theta$ et $A=\\frac{1}{2}r^2\\theta$ n\'utilisent que des radians.',
      '**Figures composées** — décomposer en triangles et secteurs élémentaires, additionner ou ' +
        'soustraire selon la figure ; l\'angle d\'un polygone régulier vaut 2π/n par côté, mais un ' +
        'secteur peut en couvrir plusieurs.',
      '**Géométrie du cercle** — aire d\'un segment = aire du secteur − aire du triangle ' +
        '($\\frac{1}{2}r^2\\sin\\theta$) ; loi des cosinus pour une corde : $c^2 = 2r^2(1-\\cos\\theta)$.',
      '**Paramètres d\'une sinusoïde** — $A=(max-min)/2$, $b=(max+min)/2$, $T=2\\pi/\\omega$ ' +
        '(jamais l\'inverse), φ décale horizontalement.',
      '**Lecture graphique** — max/min pour A et b, distance entre deux maximums pour T, ' +
        'traversée montante de la ligne moyenne pour φ (en vérifiant le sens de variation).',
      '**Extremums** — sin(u)=1 seul (période 2π, maximums) ≠ sin(u)=±1 réunis (période π, tous ' +
        'les extremums) : ne jamais confondre les deux formules.',
      '**Modéliser en contexte** — A et b à partir des extrêmes, T (donc ω) à partir de la durée ' +
        'd\'un cycle, φ en dernier à partir d\'une condition initiale précise.',
      '**Équations trig(ax+b)=k** — isoler l\'argument, résoudre au cercle trigonométrique, ' +
        'diviser TOUT (constante et période) par a ; $|k|>1$ pour sin/cos ⟹ aucune solution.',
    ],
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je bien converti tout angle en degrés vers les radians avant d\'utiliser s=rθ ou A=½r²θ ?',
        'Pour une sinusoïde : ai-je distingué la pulsation ω de la période T (T=2π/ω, jamais l\'inverse) ?',
        'Pour une équation trig(ax+b)=k : ai-je divisé par a le terme constant ET le terme périodique en 2kπ ?',
        'Pour des extremums : la question porte-t-elle sur les maximums seuls, les minimums seuls, ou tous les extremums réunis — et ai-je pris la bonne période (2π/a ou π/a) ?',
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
