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
const TAN_TICK_LABELS = { [-3 * PI]: '−3π', [-2 * PI]: '−2π', [-PI]: '−π', [PI]: 'π', [2 * PI]: '2π', [3 * PI]: '3π' }

export const trigonometrie: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 2,
  title: 'Trigonométrie',
  slug: 'trigonometrie',
  lede:
    "On change d'unité pour mesurer les angles : le radian remplace le degré. Le cercle " +
    "trigonométrique devient ton outil de référence pour résoudre des équations et des " +
    'problèmes de géométrie. Les fonctions sinus et cosinus prennent ensuite une forme ' +
    'paramétrée — amplitude, période, déphasage, décalage vertical. Tu peux alors modéliser ' +
    "de vrais phénomènes périodiques : la hauteur d'une nacelle de grande roue, une marée, " +
    'une tension électrique.',

  sections: [
    {
      id: 'arcs-secteurs',
      number: 1,
      title: 'Arcs et secteurs',
      kicker: "radian, longueur d'arc s = rθ, aire de secteur A = ½r²θ",
      blocks: [
        { kind: 'video', title: 'Arcs et secteurs (1/3) : encadrer π avec Archimède', youtubeId: 'PDFxI__g9nI' },
        { kind: 'video', title: 'Arcs et secteurs (2/3) : le radian, longueur d\'arc et aire d\'un secteur', youtubeId: 't1kbJB41t6I' },
        { kind: 'subheading', text: 'Comment encadrer le nombre π ?' },
        {
          kind: 'para',
          text:
            "Le nombre π, c'est le rapport constant entre la circonférence d'un cercle et son " +
            'diamètre. Mais comment trouver sa valeur sans instrument de mesure ? Dans ' +
            "l'Antiquité, **Archimède** (3e siècle av. J.-C.) a eu une idée : encadrer le " +
            'cercle entre deux polygones réguliers à $n$ côtés. Un polygone **inscrit** (à ' +
            "l'intérieur du cercle, ses sommets touchent le cercle) et un polygone " +
            "**circonscrit** (à l'extérieur, ses côtés touchent le cercle). Le périmètre du " +
            'cercle est forcément entre les deux.',
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
            'chaque côté est vu du centre C sous un **angle au centre** de $360°/n$ (l\'angle ' +
            'au sommet du triangle isocèle CAB). Sa **moitié**, $\\alpha = 180°/n$, est l\'angle ' +
            'en C du triangle rectangle CHB (H, milieu de [AB]) : c\'est elle qui intervient ' +
            'dans les calculs. Le côté du polygone **inscrit** vaut ' +
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
            "Plus $n$ est grand, plus les deux polygones se rapprochent du cercle. Et plus " +
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
            "Archimède est parti d'un hexagone ($n=6$). Il a doublé le nombre de côtés six " +
            "fois, jusqu'à un polygone à 96 côtés. Il a obtenu l'encadrement historique " +
            '$3 + \\frac{10}{71} < \\pi < 3 + \\frac{1}{7}$, soit environ $3{,}1408 < \\pi < ' +
            "3{,}1429$. Un résultat trouvé sans aucune calculatrice, juste avec de la " +
            'géométrie !',
        },
        {
          kind: 'atelier',
          tag: 'archimede-widget',
          label: 'Manipule toi-même — fais varier le nombre de côtés n',
          caption:
            'Fais varier le nombre de côtés n, ou passe en mode doublement pour refaire la ' +
            'démarche d\'Archimède : 6, 12, 24, 48 puis 96 côtés. Les périmètres inscrit ' +
            'n·sin(π/n) et circonscrit n·tan(π/n) encadrent π de plus en plus près ; à 96 ' +
            'côtés, Archimède obtenait 3 + 10/71 < π < 3 + 1/7.',
        },
        {
          kind: 'entrainement',
          title: 'Encadrer π comme Archimède',
          generatorId: '5gen56',
          description: [
            'Refais la démarche d\'Archimède avec un carré, un hexagone ou un autre polygone régulier : demi-angle au centre α, côtés 2r sin α et 2r tan α des polygones inscrit et circonscrit, encadrement n sin α ≤ π ≤ n tan α, puis doublement du nombre de côtés jusqu\'à la précision demandée (calculatrice en mode degré).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 56. Encadrer π comme Archimède »',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi ne pas garder les degrés ?',
          text:
            "Le degré est un choix arbitraire : 360, c'est à peu près le nombre de jours " +
            "dans une année, rien de plus. Le radian, lui, vient directement du cercle. " +
            "Imagine une ficelle de la longueur du rayon, posée sur le bord du cercle : " +
            "l'angle qu'elle balaie, c'est exactement 1 radian. Pas de nombre choisi au " +
            'hasard — juste le cercle lui-même qui sert de règle.',
        },
        {
          kind: 'para',
          text:
            "Jusqu'ici, tu mesurais un angle en degrés. Le radian, c'est une autre unité, " +
            "mieux adaptée au calcul. Un angle de $1$ radian, c'est l'angle au centre qui " +
            "intercepte, sur un cercle, un arc de longueur égale au rayon. Le cercle complet " +
            '(360°) correspond à $2\\pi$ radians.',
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
          kind: 'exempleLibre',
          label: 'Démonstration — longueur d\'arc et aire d\'un secteur',
          blocks: [
            {
              kind: 'para',
              text:
                'Un secteur d\'angle au centre $\\theta$ (en radians) est une part du disque. Le ' +
                'tour complet mesure $2\\pi$ rad : le secteur représente donc la fraction ' +
                '$\\dfrac{\\theta}{2\\pi}$ du disque, et son arc la même fraction du cercle.',
            },
            {
              kind: 'para',
              text:
                'La longueur de l\'arc est proportionnelle à l\'angle : ' +
                '$s = \\dfrac{\\theta}{2\\pi} \\times 2\\pi r = r\\theta$.',
            },
            {
              kind: 'para',
              text:
                'L\'aire du secteur aussi : ' +
                '$A = \\dfrac{\\theta}{2\\pi} \\times \\pi r^2 = \\dfrac{1}{2}r^2\\theta$.',
            },
            {
              kind: 'para',
              text:
                'Avec un angle en degrés, la fraction serait $\\dfrac{\\theta}{360}$ et on ' +
                'obtiendrait $s = \\dfrac{\\pi r \\theta}{180}$ : une formule moins simple. C\'est ' +
                'pour cela que $s = r\\theta$ et $A = \\frac{1}{2}r^2\\theta$ n\'acceptent que des radians.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — jamais de degrés dans les formules d\'arc et de secteur',
          text:
            'Les formules $s = r\\theta$ (longueur d\'arc) et $A = \\frac{1}{2}r^2\\theta$ (aire de ' +
            'secteur) utilisent **seulement** des angles en **radians** ! Un angle donné en ' +
            'degrés ? Ta toute première étape, avant même de penser au rayon, c\'est de le ' +
            'convertir en radians. Un θ laissé en degrés dans ces formules donne un résultat qui ' +
            'ne veut rien dire.',
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
          kind: 'exemple',
          badge: 'arc et aire donnés — retrouver r et θ',
          formula:
            'Un secteur circulaire a un arc de longueur $s = 10$ cm et une aire $A = 40$ cm². ' +
            'Calcule son rayon, puis son angle au centre en radians et en degrés.',
          steps: [
            {
              tag: 'relier A et s — A = ½r²θ = ½r·(rθ) = ½r·s',
              text: '$A = \\dfrac{1}{2}r \\cdot s \\iff r = \\dfrac{2A}{s} = \\dfrac{2 \\times 40}{10} = 8$ cm',
            },
            { tag: 'angle en radians — θ = s/r', text: '$\\theta = \\dfrac{10}{8} = 1{,}25$ rad' },
            { tag: 'vérification avec A = ½r²θ', text: '$A = \\dfrac{1}{2} \\times 8^2 \\times 1{,}25 = 40$ cm²' },
          ],
          result: {
            tag: 'angle en degrés — × 180/π',
            text: '$\\theta = 1{,}25 \\times \\dfrac{180}{\\pi} \\approx 71{,}62°$',
          },
        },
        {
          kind: 'atelier',
          tag: 'radian-enroule-widget',
          label: 'Manipule toi-même : le radian, un rayon enroulé',
          caption:
            'Fais grandir θ : le rayon r se reporte le long du cercle, un trait coloré par ' +
            'radian. 1 rad, c\'est un arc de la longueur du rayon ; un tour complet en ' +
            'contient 2π ≈ 6,28. L\'arc s = r·θ, l\'aire du secteur A = ½·r²·θ et l\'angle en ' +
            'degrés s\'affichent en direct.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — les angles remarquables par cœur',
          items: [
            '30° = π/6 · 45° = π/4 · 60° = π/3',
            '90° = π/2 · 180° = π · 360° = 2π',
          ],
          text: 'Apprends ces six correspondances degré/radian par cœur : elles reviennent dans presque tous les exercices.',
        },
        {
          kind: 'entrainement',
          title: 'Arcs et secteurs',
          generatorId: '5gen6',
          description: [
            'Un secteur est décrit par cinq grandeurs : rayon, angle en degrés, angle en ' +
              'radians, longueur d\'arc s et aire. Deux sont données : retrouve les trois ' +
              'autres. Ou convertis une mesure d\'angle entre degrés et radians.',
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
        { kind: 'video', title: 'Polygones, arcs et secteurs : figures composées', youtubeId: 'h-q_G5tDJ-0' },
        {
          kind: 'para',
          text:
            'Une figure composée (polygone régulier inscrit dans un cercle, secteur accolé à ' +
            'un triangle…) se traite toujours de la même façon. Tu la découpes en morceaux ' +
            'simples — triangles, secteurs — dont tu connais déjà l\'aire. Puis tu ' +
            '**additionnes** ou tu **soustrais** ces aires élémentaires, selon que les ' +
            'morceaux s\'ajoutent ou se chevauchent.',
        },
        {
          kind: 'rappel',
          label: "Rappel — l'angle au centre d'un polygone régulier",
          items: [
            'Un polygone régulier à $n$ côtés, inscrit dans un cercle, partage celui-ci en ' +
              '$n$ triangles isocèles identiques. Chacun a un angle au centre ' +
              '$\\theta = \\dfrac{2\\pi}{n}$.',
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
            'L\'angle au centre d\'**un côté** du polygone vaut toujours $2\\pi/n$. Mais le ' +
            'secteur dont on te demande l\'aire ne correspond pas forcément à un seul côté ! ' +
            'S\'il s\'étend sur deux côtés consécutifs, son angle vaut $2 \\times 2\\pi/n$ — ' +
            'pas $2\\pi/n$. Compte toujours, sur la figure, le nombre exact de côtés couverts ' +
            'par le secteur, avant de calculer son angle. Ne suppose jamais que c\'est ' +
            'automatiquement l\'angle élémentaire du polygone.',
        },
        {
          kind: 'exemple',
          badge: 'arc et secteur qui couvrent plusieurs côtés',
          formula:
            'Un octogone régulier est inscrit dans un cercle de rayon $r = 6$ cm. Calcule la ' +
            'longueur de l\'arc et l\'aire du secteur qui couvrent trois côtés consécutifs du polygone.',
          steps: [
            {
              tag: 'angle au centre — k côtés sur n : θ = k · 2π/n',
              text: '$\\theta = 3 \\times \\dfrac{2\\pi}{8} = \\dfrac{3\\pi}{4}$',
            },
            {
              tag: "longueur de l'arc — s = rθ",
              text: '$s = 6 \\times \\dfrac{3\\pi}{4} = \\dfrac{9\\pi}{2} \\approx 14{,}14$ cm (c\'est bien $\\dfrac{3}{8}$ de la circonférence $12\\pi$)',
            },
          ],
          result: {
            tag: 'aire du secteur — A = ½r²θ',
            text: '$A = \\dfrac{1}{2} \\times 6^2 \\times \\dfrac{3\\pi}{4} = \\dfrac{27\\pi}{2} \\approx 42{,}41$ cm²',
          },
          // Sommets de l'octogone inscrit en π/8 + k·π/4 (CircleDiagram) : le secteur part du
          // sommet π/8 et couvre 3 côtés, jusqu'au sommet π/8 + 3π/4 = 7π/8.
          illustration: {
            kind: 'circleDiagram',
            inscribedPolygon: 8,
            startAngle: PI / 8,
            sectorAngle: 3 * (PI / 4),
            highlight: 'sector',
            centerLabel: 'O',
            radiusLabel: 'r',
            pointALabel: 'A',
            pointBLabel: 'B',
            angleLabel: 'θ',
            caption:
              'le secteur AOB couvre 3 des 8 côtés de l\'octogone : son angle au centre vaut ' +
              '$\\theta = 3 \\times \\dfrac{2\\pi}{8} = \\dfrac{3\\pi}{4}$, et non $\\dfrac{2\\pi}{8}$',
          },
        },
        {
          kind: 'astuce',
          label: 'Astuce — vérifier par l\'aire totale',
          text:
            'Une bonne façon de vérifier ce genre de résultat : l\'aire du cercle moins ' +
            'l\'aire du polygone régulier doit valoir exactement $n$ fois l\'aire d\'un seul ' +
            'segment. Ici, $6 \\times 1{,}45 \\approx 8{,}70$ cm². Compare avec ' +
            '$\\pi r^2 - \\text{aire hexagone} = 16\\pi - 24\\sqrt{3} \\approx 50{,}27 - ' +
            '41{,}57 \\approx 8{,}70$ cm² — ça correspond !',
        },
        {
          kind: 'atelier',
          tag: 'secteur-segment-widget',
          label: 'Manipule toi-même — secteur, triangle et segment en direct',
          caption:
            'En mode polygone, n fixe l\'angle au centre θ = 2π/n et la vérification par ' +
            'l\'astuce ci-dessus (n × segment = cercle − polygone) s\'affiche ; en mode angle ' +
            'libre, règle θ toi-même. Les aires du secteur, du triangle et du segment se ' +
            'mettent à jour, et la corde est calculée par la loi des cosinus : AB² = r² + ' +
            'r² − 2r²·cos θ.',
        },
        {
          kind: 'application',
          titre: "Pourquoi les abeilles choisissent l'hexagone",
          image: {
            src: '/images/application/honeycomb.jpg',
            alt: 'Gros plan sur des cellules hexagonales de cire dans une ruche',
            caption: 'Photo : Ruth Hartnup, CC BY 2.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'categoricalBarChart',
              bars: [
                { label: 'Triangle', value: 1.73, valueLabel: '1,73 cm²', tone: 'faint' },
                { label: 'Carré', value: 2.25, valueLabel: '2,25 cm²', tone: 'faint' },
                { label: 'Hexagone', value: 2.6, valueLabel: '2,60 cm²', tone: 'accent' },
              ],
              yAxisLabel: 'aire enclose',
              colorValueLabels: true,
              footnote: 'les 3 formes partagent le même périmètre de 6 cm',
              caption:
                'À périmètre de cire égal (6 cm), les 3 seuls polygones réguliers qui pavent le ' +
                "plan sans espace vide n'enferment pas la même aire — l'hexagone gagne : plus de " +
                'surface de stockage pour la même quantité de cire.',
            },
          ],
          text:
            'Les abeilles construisent leurs rayons de cire avec des cellules hexagonales — ' +
            "et ce n'est pas un hasard. Parmi tous les polygones réguliers qui peuvent paver " +
            'un plan sans aucun espace vide (seuls le triangle équilatéral, le carré et ' +
            "l'hexagone le peuvent), l'hexagone est celui qui, à périmètre de cire égal, " +
            'enferme la plus grande surface : il minimise la quantité de matière utilisée ' +
            "pour une capacité de stockage donnée. C'est exactement le calcul d'aire de " +
            "secteurs/triangles que tu viens de faire, appliqué à l'échelle d'une ruche " +
            "entière. Les ingénieurs réutilisent le même principe dans les structures en nid " +
            "d'abeilles (panneaux d'avion, cartons d'emballage) : un maximum de résistance " +
            'pour un minimum de poids.',
          domaines: ['Biologie', 'Ingénierie'],
        },
        {
          kind: 'entrainement',
          title: 'Polygones, arcs et secteurs',
          generatorId: '5gen7',
          description: [
            'Un cercle de rayon r porte n points régulièrement espacés (les sommets d\'un ' +
              'polygone régulier inscrit). Calcule la circonférence et l\'aire du disque, puis ' +
              'la longueur d\'un arc et l\'aire d\'un secteur qui couvrent un ou plusieurs ' +
              'côtés — chacun comme une fraction du cercle complet.',
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
        { kind: 'video', title: 'Problèmes de géométrie du cercle : segments circulaires et loi des cosinus', youtubeId: 'neGbIoX6UqI' },
        {
          kind: 'para',
          text:
            'Certains problèmes de géométrie combinent secteurs et **segments circulaires** ' +
            '— la région entre une corde et l\'arc qu\'elle délimite. Parfois, tu as aussi ' +
            'besoin de la **loi des cosinus**, pour retrouver la longueur d\'une corde ou ' +
            'd\'un rayon à partir d\'un angle au centre.',
        },
        {
          kind: 'rappel',
          label: "Rappel — aire d'un segment circulaire",
          items: [
            'Un segment circulaire d\'angle au centre θ (radians) et de rayon r, tu ' +
              'l\'obtiens en retirant, du secteur, le triangle formé par les deux rayons et ' +
              'la corde : $A_{segment} = \\frac{1}{2}r^2\\theta - \\frac{1}{2}r^2\\sin(\\theta) ' +
              '= \\frac{1}{2}r^2(\\theta - \\sin\\theta)$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'segment circulaire + corde',
          formula:
            'Un cercle de centre O et de rayon $r = 10$ cm. Deux rayons OA et OB forment un ' +
            'angle $\\theta = \\dfrac{2\\pi}{3}$ (120°). Calcule l\'aire du segment ' +
            'circulaire délimité par la corde [AB], puis la longueur de cette corde.',
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
            'Le triangle OAB d\'un secteur est toujours isocèle (deux côtés valent r). Sa ' +
            'surface se calcule directement par $\\frac{1}{2}r^2\\sin(\\theta)$ — l\'aire ' +
            'd\'un triangle à partir de deux côtés et de l\'angle inclus — sans jamais avoir ' +
            'besoin de connaître la hauteur ni la base.',
        },
        { kind: 'subheading', text: 'Trois problèmes types : essuie-glace, corde connue, lentille' },
        {
          kind: 'methode',
          label: 'Méthode — retrouver l\'angle au centre à partir de la corde',
          items: [
            'Dans le triangle isocèle formé par les deux rayons et la corde, la loi des ' +
              'cosinus s\'écrit $c^2 = r^2 + r^2 - 2r^2\\cos\\theta = 2r^2(1-\\cos\\theta)$.',
            'Utilisée « à l\'envers », elle donne l\'angle : $\\cos\\theta = 1 - \\dfrac{c^2}{2r^2}$, ' +
              'donc $\\theta = \\arccos\\left(1 - \\dfrac{c^2}{2r^2}\\right)$ (touche $\\cos^{-1}$ ' +
              'de la calculatrice, en mode radian pour les aires).',
            'Ensuite seulement, calcule les aires : secteur $\\frac{1}{2}r^2\\theta$, triangle ' +
              '$\\frac{1}{2}r^2\\sin\\theta$, segment = secteur − triangle.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la corde et l\'aire du segment',
          blocks: [
            {
              kind: 'para',
              text:
                'Le triangle OAB a deux côtés de longueur $r$ (les rayons OA et OB) et l\'angle ' +
                '$\\theta$ entre eux ($0 < \\theta \\leq \\pi$). La loi des cosinus, vue en 4e, donne ' +
                'la corde $c = |AB|$ : $c^2 = r^2 + r^2 - 2 \\cdot r \\cdot r\\cos\\theta$, donc $c^2 = 2r^2(1 - \\cos\\theta)$.',
            },
            {
              kind: 'para',
              text:
                'La hauteur issue de B, perpendiculaire à la droite OA, mesure $r\\sin\\theta$ ' +
                '(si θ est obtus, elle vaut $r\\sin(\\pi - \\theta)$, et $\\sin(\\pi - \\theta) = \\sin\\theta$). ' +
                'Donc $A_{triangle} = \\dfrac{1}{2} \\cdot r \\cdot r\\sin\\theta = \\dfrac{1}{2}r^2\\sin\\theta$.',
            },
            {
              kind: 'para',
              text:
                'Le segment est ce qui reste du secteur quand on retire le triangle : ' +
                '$A_{segment} = \\dfrac{1}{2}r^2\\theta - \\dfrac{1}{2}r^2\\sin\\theta$, soit $A_{segment} = \\dfrac{1}{2}r^2(\\theta - \\sin\\theta)$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'essuie-glace — différence de deux secteurs',
          formula:
            'Un essuie-glace pivote d\'un angle de $120°$. Son balai racle la vitre entre ' +
            '$10$ cm et $50$ cm du pivot. Calcule l\'aire de la surface balayée.',
          steps: [
            { tag: 'conversion en radians', text: '$\\theta = 120 \\times \\dfrac{\\pi}{180} = \\dfrac{2\\pi}{3}$' },
            { tag: 'grand secteur (r₁ = 50) — A = ½r²θ', text: '$A_1 = \\frac{1}{2} \\times 50^2 \\times \\dfrac{2\\pi}{3} = \\dfrac{2500\\pi}{3}$ cm²' },
            { tag: 'petit secteur (r₂ = 10), même angle', text: '$A_2 = \\frac{1}{2} \\times 10^2 \\times \\dfrac{2\\pi}{3} = \\dfrac{100\\pi}{3}$ cm²' },
          ],
          result: {
            tag: 'surface balayée — grand secteur moins petit secteur',
            text: '$A = \\dfrac{2500\\pi}{3} - \\dfrac{100\\pi}{3} = 800\\pi \\approx 2513{,}27$ cm²',
          },
          // Unité = 10 cm. Bras de 0° à 120° autour du pivot O : arcs y = √(r² − x²) de rayons 1 et 5,
          // extrémités (1 ; 0), (5 ; 0), (cos 120° ; sin 120°) = (−0,5 ; 0,866), 5·(…) = (−2,5 ; 4,330).
          // Domaine isotrope : 8,8 × 8,25 (rapport 320/300). Près de l'axe horizontal, l'arc est
          // tracé en x = √(r² − y²) (`curvesOfY`) : en y = √(r² − x²), la tangente verticale en
          // (r ; 0) donnait un dernier segment rectiligne visible.
          illustration: {
            kind: 'vectorPlane',
            xMin: -3, xMax: 5.8, yMin: -1.6, yMax: 6.65,
            showAxes: false,
            curves: [
              { fn: (x) => Math.sqrt(Math.max(0, 25 - x * x)), tone: 'accent', xMin: -2.5, xMax: 4 },
              { fn: (x) => Math.sqrt(Math.max(0, 1 - x * x)), tone: 'accent', xMin: -0.5, xMax: 0.8 },
            ],
            curvesOfY: [
              { fn: (y) => Math.sqrt(Math.max(0, 25 - y * y)), tone: 'accent', yMin: 0, yMax: 3 },
              { fn: (y) => Math.sqrt(Math.max(0, 1 - y * y)), tone: 'accent', yMin: 0, yMax: 0.6 },
            ],
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, tone: 'faint', dashed: true },
              { from: { x: 0, y: 0 }, to: { x: -0.5, y: 0.866 }, tone: 'faint', dashed: true },
              { from: { x: 1, y: 0 }, to: { x: 5, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: -0.5, y: 0.866 }, to: { x: -2.5, y: 4.33 }, tone: 'ink', arrow: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 120, radiusPx: 13, label: 'θ', tone: 'accent' }],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 1, y: 0, label: '10 cm', tone: 'ink', node: false, labelPos: 'below' },
              { x: 5, y: 0, label: '50 cm', tone: 'ink', node: false, labelPos: 'below' },
              { x: 1.9, y: 2.95, label: 'surface balayée', tone: 'accent', node: false, labelPos: 'above' },
            ],
            caption:
              'le balai racle la vitre entre 10 cm et 50 cm du pivot O (distances lues depuis O), sur un ' +
              'angle $\\theta = 120°$ : ' +
              'la surface balayée (entre les deux arcs) est le grand secteur moins le petit',
          },
        },
        {
          kind: 'exemple',
          badge: 'angle au centre à partir de la corde',
          formula:
            'Dans un cercle de rayon $r = 10$ cm, une corde mesure $c = 12$ cm. Calcule l\'angle ' +
            'au centre qui intercepte cette corde, puis l\'aire du segment circulaire ' +
            'correspondant.',
          steps: [
            { tag: 'loi des cosinus « à l\'envers »', text: '$\\cos\\theta = 1 - \\dfrac{12^2}{2 \\times 10^2} = 1 - 0{,}72 = 0{,}28$' },
            { tag: 'angle au centre', text: '$\\theta = \\arccos(0{,}28) \\approx 73{,}74° \\approx 1{,}2870$ rad' },
            { tag: 'secteur et triangle', text: '$A_{secteur} = \\frac{1}{2} \\times 100 \\times 1{,}2870 \\approx 64{,}35$ cm² ; $A_{triangle} = 50\\sin\\theta = 50 \\times 0{,}96 = 48$ cm²' },
          ],
          result: { tag: 'aire du segment — secteur moins triangle', text: '$A_{segment} \\approx 64{,}35 - 48 = 16{,}35$ cm²' },
          // Corde horizontale de longueur 12 dans le cercle de rayon 10 : A(6 ; 8), B(−6 ; 8)
          // (6² + 8² = 100). Angle au centre de 53,13° à 126,87° (θ ≈ 73,74°). Domaine 24 × 22,5.
          illustration: {
            kind: 'vectorPlane',
            xMin: -12, xMax: 12, yMin: -11.5, yMax: 11,
            showAxes: false,
            circle: { cx: 0, cy: 0, r: 10, tone: 'faint' },
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 6, y: 8 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: -6, y: 8 }, tone: 'ink', arrow: false },
              { from: { x: -6, y: 8 }, to: { x: 6, y: 8 }, tone: 'accent', arrow: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 53.13, toDeg: 126.87, radiusPx: 22, label: 'θ', tone: 'accent' }],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 6, y: 8, label: 'A', tone: 'ink', labelPos: 'right' },
              { x: -6, y: 8, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 0, y: 8, label: 'c = 12', tone: 'accent', node: false, labelPos: 'above' },
              { x: 3, y: 4, label: 'r = 10', tone: 'ink', node: false, labelPos: 'right' },
            ],
            caption:
              'la corde [AB] (12 cm) et les deux rayons forment un triangle isocèle ; l\'angle au centre ' +
              '$\\theta$ se retrouve par la loi des cosinus « à l\'envers », le segment est la région entre ' +
              'la corde et l\'arc AB',
          },
        },
        {
          kind: 'exemple',
          badge: 'lentille — deux segments circulaires',
          formula:
            'Deux cercles, de rayons $r_1 = 10$ cm et $r_2 = 8$ cm, se coupent selon une corde ' +
            'commune de longueur $c = 12$ cm ; leurs centres sont de part et d\'autre de cette ' +
            'corde. Calcule l\'aire de la lentille, la région commune aux deux disques.',
          steps: [
            { tag: 'segment du grand cercle (exemple précédent)', text: '$\\theta_1 \\approx 1{,}2870$ rad, $A_{seg,1} \\approx 16{,}35$ cm²' },
            { tag: 'angle au centre du petit cercle', text: '$\\cos\\theta_2 = 1 - \\dfrac{144}{2 \\times 64} = -0{,}125 \\implies \\theta_2 \\approx 97{,}18° \\approx 1{,}6961$ rad' },
            { tag: 'segment du petit cercle', text: '$A_{seg,2} = \\frac{1}{2} \\times 64 \\times (1{,}6961 - \\sin\\theta_2) \\approx 54{,}28 - 31{,}75 \\approx 22{,}53$ cm²' },
          ],
          result: { tag: 'lentille — somme des deux segments', text: '$A_{lentille} \\approx 16{,}35 + 22{,}53 = 38{,}88$ cm²' },
          // Corde commune verticale x = 0, de (0 ; −6) à (0 ; 6). O₁ à √(10² − 6²) = 8 à gauche,
          // O₂ à √(8² − 6²) = √28 ≈ 5,2915 à droite. Angles : θ₁ de −36,87° à 36,87° ; en O₂,
          // directions vers A et B à 180° ∓ 48,59° (tan = 6/√28). Domaine 33,6 × 31,5.
          illustration: {
            kind: 'vectorPlane',
            xMin: -19, xMax: 14.6, yMin: -15.75, yMax: 15.75,
            showAxes: false,
            circles: [
              { cx: -8, cy: 0, r: 10, tone: 'accent' },
              { cx: 5.2915, cy: 0, r: 8, tone: 'good' },
            ],
            vectors: [
              { from: { x: 0, y: -6 }, to: { x: 0, y: 6 }, tone: 'ink', arrow: false },
              { from: { x: -8, y: 0 }, to: { x: 0, y: 6 }, tone: 'accent', arrow: false },
              { from: { x: -8, y: 0 }, to: { x: 0, y: -6 }, tone: 'accent', arrow: false },
              { from: { x: 5.2915, y: 0 }, to: { x: 0, y: 6 }, tone: 'good', arrow: false },
              { from: { x: 5.2915, y: 0 }, to: { x: 0, y: -6 }, tone: 'good', arrow: false },
            ],
            angleArcs: [
              { cx: -8, cy: 0, fromDeg: -36.87, toDeg: 36.87, radiusPx: 20, label: 'θ₁', tone: 'accent' },
              { cx: 5.2915, cy: 0, fromDeg: 131.41, toDeg: 228.59, radiusPx: 16, label: 'θ₂', tone: 'good' },
            ],
            points: [
              { x: -8, y: 0, label: 'O₁', tone: 'accent', labelPos: 'left' },
              { x: 5.2915, y: 0, label: 'O₂', tone: 'good', labelPos: 'right' },
              { x: 0, y: 6, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: 0, y: -6, label: 'B', tone: 'ink', labelPos: 'below' },
            ],
            caption:
              'la corde commune [AB] (12 cm) coupe chaque disque en deux ; la lentille réunit le segment ' +
              'du grand cercle (centre $O_1$, rayon 10, angle $\\theta_1$) situé à droite de la corde et le ' +
              'segment du petit cercle (centre $O_2$, rayon 8, angle $\\theta_2$) situé à gauche',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — une lentille, ce sont deux segments',
          text:
            'La corde commune découpe chaque disque en deux : la lentille réunit le segment ' +
            'du premier cercle situé du côté du second **et** le segment du second cercle situé ' +
            'du côté du premier. Chaque segment se calcule avec **son propre** rayon et ' +
            '**son propre** angle au centre — la corde, elle, est la même pour les deux.',
        },
        {
          kind: 'atelier',
          tag: 'lentille-essuie-glace-widget',
          label: 'Manipule toi-même : lentille et essuie-glace',
          caption:
            'Lentille : fais varier les rayons et la distance des centres ; la lentille ' +
            'commune est la somme de deux segments circulaires de même corde c, chacun ' +
            'calculé avec θ = arccos(1 − c²/(2r²)) puis ½r²(θ − sin θ). Essuie-glace : la ' +
            'surface balayée est la différence de deux secteurs de même angle, ½θ(R² − r²).',
        },
        {
          kind: 'application',
          titre: "Mesurer une distance qu'on ne peut pas atteindre directement",
          image: {
            src: '/images/application/theodolite-triangulation.jpg',
            alt: 'Un étudiant utilise un théodolite sur le terrain',
            caption: 'Photo : Kskhh, CC BY-SA 4.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'triangleGeneric',
              A: { x: 40, y: 180 },
              B: { x: 300, y: 180 },
              C: { x: 140, y: 40 },
              angleArcsAt: ['A', 'B'],
              sideLabels: { c: '50 m' },
              caption:
                'Depuis A et B — deux points accessibles distants de 50 m — le géomètre vise le ' +
                'point inaccessible C au théodolite et mesure seulement les deux angles en A et ' +
                'B. Le triangle ABC est alors entièrement déterminé : un côté et deux angles ' +
                'suffisent pour calculer les deux autres côtés.',
            },
          ],
          text:
            "Un géomètre qui doit connaître la largeur d'une rivière, ou la hauteur d'un " +
            "bâtiment, ne peut évidemment pas y planter un mètre ruban. Il utilise un " +
            "théodolite — l'instrument sur la photo — pour mesurer **uniquement** des angles, " +
            "depuis deux points accessibles dont il connaît la distance. En reliant ces " +
            "deux points et le point inaccessible, il obtient un triangle quelconque où il " +
            "connaît un côté et deux angles : exactement la configuration que tu as résolue " +
            "en 4e avec la **loi des sinus** (un côté et deux angles connus). La loi des " +
            "cosinus de cette section sert, elle, dans l'autre configuration : deux côtés et " +
            "l'angle compris — comme les deux rayons et l'angle au centre d'un segment " +
            "circulaire. Le géomètre utilise ainsi la technique de " +
            "triangulation, utilisée depuis des siècles pour cartographier des territoires " +
            "entiers sans jamais devoir parcourir chaque distance à pied.",
          domaines: ['Géomètre', 'Construction'],
        },
        {
          kind: 'historique',
          titre: 'L\'astronome qui a remplacé les cordes par le sinus',
          image: {
            src: '/images/historique/albattani.jpg',
            alt: "Page de titre d'une édition latine du traité d'astronomie d'Al-Battani",
            caption:
              "Page de titre de l'édition latine (1645) du traité d'Al-Battani, De scientia " +
              'stellarum. Domaine public.',
          },
          text:
            "L'astronome et mathématicien arabe **Al-Battani** (858-929), originaire de " +
            'Harran (actuelle Turquie), reprend les tables de cordes héritées de Ptolémée et ' +
            'les reformule entièrement avec la fonction **sinus** — la même que tu utilises ' +
            'aujourd\'hui. Son traité, le Kitab az-Zij, calcule avec une précision ' +
            "remarquable la durée de l'année solaire et l'inclinaison de l'axe terrestre, " +
            'des résultats encore cités par les astronomes européens des siècles plus tard. ' +
            'Traduit en latin au 12e siècle sous le nom De scientia stellarum (« De la ' +
            'science des étoiles », page de titre ci-contre), son travail introduit la ' +
            'trigonométrie moderne — celle fondée sur le sinus plutôt que sur la corde — ' +
            "dans les universités d'Europe occidentale.",
        },
        {
          kind: 'entrainement',
          title: 'Problèmes de géométrie du cercle',
          generatorId: '5gen12',
          description: [
            'Trois problèmes : l\'aire balayée par un essuie-glace (différence de deux ' +
              'secteurs) ; un segment circulaire (angle au centre par la loi des cosinus, puis ' +
              'secteur − triangle) ; une lentille, aire commune à deux disques qui partagent une ' +
              'corde. Calcule l\'angle au centre, puis les aires.',
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
        { kind: 'video', title: 'Arcs et secteurs (3/3) : le cercle trigonométrique', youtubeId: '_1kh3SXWfwM' },
        { kind: 'video', title: 'Paramètres d\'une sinusoïde (1/2) : sinus, cosinus, tangente', youtubeId: 'fr8hM_dcfEA' },
        { kind: 'video', title: 'Paramètres d\'une sinusoïde (2/2) : A, ω, φ, b et construction du graphique', youtubeId: 'HUE0XAg5ImY' },
        {
          kind: 'para',
          text:
            'Jusqu\'ici, le cercle servait à mesurer des longueurs et des aires. À partir ' +
            'de maintenant, il devient une **machine à fabriquer des courbes** : fais tourner ' +
            'un point sur le cercle trigonométrique, relève sa hauteur (son sinus) à chaque ' +
            'instant, et reporte-la en fonction de l\'angle parcouru — le point qui tourne ' +
            'trace la sinusoïde. Toute la suite du chapitre (paramètres, extremums, ' +
            'équations, modélisation) repose sur ce lien entre le cercle et la courbe.',
        },
        { kind: 'subheading', text: 'Le cercle trigonométrique, pour n\'importe quel réel' },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ça',
          text:
            'Depuis la 4e, tu sais que cos et sin donnent les coordonnées d\'un point sur le ' +
            'cercle trigonométrique. Ici, on ne change rien à cette idée — on va juste plus ' +
            "loin : au lieu d'un angle entre 0° et 360°, on enroule n'importe quel nombre " +
            'réel autour du cercle, même très grand, même négatif. Le principe reste ' +
            'exactement le même.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — cercle trigonométrique',
          items: [
            'Le **cercle trigonométrique**, c\'est le cercle de rayon 1, centré à l\'origine ' +
              'd\'un repère orthonormé. Il est orienté dans le **sens positif** (le sens ' +
              'anti-horloger). Mesurer un angle en radians, ça revient à **enrouler** la ' +
              'droite réelle autour de ce cercle. À chaque réel $x$ correspond un unique ' +
              'point $M$ du cercle : son **point image**. Tu l\'obtiens en parcourant, depuis ' +
              'le point $(1;0)$, une longueur d\'arc $x$ — dans le sens positif si $x > 0$, ' +
              'dans le sens négatif sinon. Le cercle a pour périmètre $2\\pi$. Donc deux ' +
              'réels qui diffèrent d\'un multiple de $2\\pi$ ont le même point image.',
            'Sur ce cercle, l\'abscisse du point image de x est $\\cos x$, et son ordonnée ' +
              'est $\\sin x$. C\'est la vraie définition de cos et sin, pour n\'importe quel ' +
              'réel — pas seulement pour un angle aigu d\'un triangle rectangle.',
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
              { x: 0.34, y: 1.32, text: 'sin', tone: 'ink' },
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
          title: 'Angles en radians sur le cercle',
          generatorId: '5gen51',
          description: [
            'Un angle en radians (17π/6, −5π/4, 7π/2…) : ramène-le dans [0 ; 2π[, place son point ' +
              'image dans le bon quadrant, puis lis les valeurs exactes de cos et sin sur le cercle ' +
              'quadrillé et calcule tan (ou dis pourquoi elle n\'existe pas).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 51. Angles en radians sur le cercle »',
        },
        {
          kind: 'historique',
          titre: "Le premier catalogue d'étoiles... et les premières tables trigonométriques",
          text:
            'Le mathématicien et astronome grec **Hipparque de Nicée** (2e siècle av. J.-C.) ' +
            'est considéré comme le père de la trigonométrie : pour étudier les positions des ' +
            'étoiles et prévoir les éclipses, il construit la toute première table connue ' +
            "reliant un angle à la longueur d'une corde dans un cercle — l'ancêtre direct de " +
            'ton tableau sin/cos/tan ci-dessus. Son catalogue recensait plus de 850 étoiles, ' +
            'chacune localisée par ses coordonnées célestes, calculées grâce à cette toute ' +
            'nouvelle trigonométrie. Aucun de ses écrits originaux n\'a survécu : tout ce ' +
            "qu'on sait de son travail vient des résumés qu'en a faits Ptolémée, trois " +
            "siècles plus tard, dans son propre traité d'astronomie.",
        },
        { kind: 'subheading', text: 'Les trois fonctions de référence : sinus, cosinus, tangente' },
        {
          kind: 'para',
          text:
            'Avant de passer à la forme paramétrée, revoyons les propriétés des trois ' +
            'fonctions trigonométriques de base. Ce sont elles dont le point image sur le ' +
            'cercle trigonométrique donne directement les valeurs.',
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
            curves: [{ fn: Math.sin, tone: 'accent' }],
            xMin: -5 * (PI / 2),
            xMax: 5 * (PI / 2),
            xTicks: [-2 * PI, -3 * (PI / 2), -PI, -PI / 2, PI / 2, PI, 3 * (PI / 2), 2 * PI],
            xTickLabels: {
              [-2 * PI]: '−2π',
              [-3 * (PI / 2)]: '−3π/2',
              [-PI]: '−π',
              [-PI / 2]: '−π/2',
              [PI / 2]: 'π/2',
              [PI]: 'π',
              [3 * (PI / 2)]: '3π/2',
              [2 * PI]: '2π',
            },
            fixedYRange: { min: -1.5, max: 1.5 },
            horizontalAsymptotes: [
              { y: 1, label: 'y = 1' },
              { y: -1, label: 'y = −1' },
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
            curves: [{ fn: Math.cos, tone: 'accent' }],
            xMin: -5 * (PI / 2),
            xMax: 5 * (PI / 2),
            xTicks: [-2 * PI, -3 * (PI / 2), -PI, -PI / 2, PI / 2, PI, 3 * (PI / 2), 2 * PI],
            xTickLabels: {
              [-2 * PI]: '−2π',
              [-3 * (PI / 2)]: '−3π/2',
              [-PI]: '−π',
              [-PI / 2]: '−π/2',
              [PI / 2]: 'π/2',
              [PI]: 'π',
              [3 * (PI / 2)]: '3π/2',
              [2 * PI]: '2π',
            },
            fixedYRange: { min: -1.5, max: 1.5 },
            horizontalAsymptotes: [
              { y: 1, label: 'y = 1' },
              { y: -1, label: 'y = −1' },
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
          kind: 'atelier',
          tag: 'cercle-trigo-widget',
          label: 'Manipule toi-même — le cercle trigonométrique relié au graphique',
          caption:
            'Fais tourner x : le point parcourt le cercle et la courbe de sin, cos ou tan ' +
            'se trace en même temps. L\'aimant accroche les angles remarquables (π/6, π/4, ' +
            'π/3…) et affiche alors les valeurs exactes, comme √3/2 ou √2/2.',
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text:
            "Pense à une balançoire. **L'amplitude**, c'est à quelle hauteur elle monte de " +
            "chaque côté par rapport au repos. **La période**, c'est le temps qu'il faut " +
            "pour faire un aller-retour complet. **Le déphasage**, c'est juste : à quel " +
            "instant tu as commencé à regarder — si tu arrives en cours de mouvement, la " +
            "balançoire n'est pas forcément au point bas à $t=0$. Une fonction sinusoïdale " +
            "décrit exactement ce genre de va-et-vient régulier — la grande roue, plus loin " +
            'dans ce chapitre, en est un autre exemple.',
        },
        {
          kind: 'para',
          text:
            'Une fonction sinusoïdale s\'écrit sous la forme générale $f(x) = A \\sin(\\omega x ' +
            '+ \\varphi) + b$ — ou avec un cosinus, c\'est la même famille de paramètres. ' +
            'Chaque lettre a un rôle géométrique précis sur le graphique de f.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — le rôle de chaque paramètre',
          items: [
            '**A** — amplitude : demi-écart entre le maximum et le minimum, $A = \\dfrac{max - min}{2}$.',
            '**ω** — pulsation : détermine la vitesse d\'oscillation, liée à la période par $T = \\dfrac{2\\pi}{\\omega}$.',
            '**fréquence** — nombre d\'oscillations complètes par unité de x : $\\text{fréquence} = \\dfrac{1}{T} = \\dfrac{\\omega}{2\\pi}$.',
            '**φ** — déphasage : constante ajoutée dans l\'argument ; combiné à ω, il décale la ' +
              'courbe horizontalement de $\\Phi = -\\dfrac{\\varphi}{\\omega}$ (et non de φ lui-même).',
            '**b** — décalage vertical : valeur moyenne, $b = \\dfrac{max + min}{2}$.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Φ — le décalage horizontal (à ne pas confondre avec φ)',
          items: [
            'Écris $f(x) = A\\sin(\\omega(x - \\Phi)) + b$. La constante $\\Phi = ' +
              '-\\dfrac{\\varphi}{\\omega}$ te dit directement de combien d\'unités **de x** ' +
              'la courbe de référence $\\sin$ a été translatée horizontalement.',
          ],
        },
        {
          kind: 'piege',
          text:
            '**φ et Φ, ce n\'est jamais la même chose !** φ (le déphasage) est la constante ' +
            'ajoutée **dans l\'argument** ($\\omega x + \\varphi$). Φ (le décalage ' +
            'horizontal) est la valeur soustraite **à x** ($\\omega(x-\\Phi)$), reliée à φ ' +
            'par $\\Phi = -\\varphi/\\omega$. Un exercice qui demande « le déphasage » veut ' +
            'φ. Un exercice qui demande « le décalage horizontal » ou « de combien la ' +
            'courbe est translatée » veut Φ.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la période et le décalage horizontal',
          blocks: [
            {
              kind: 'para',
              text:
                'Période. La fonction sinus reprend les mêmes valeurs tous les $2\\pi$, et pas ' +
                'avant. Quand $x$ augmente de $T$, l\'argument $\\omega x + \\varphi$ augmente de ' +
                '$\\omega T$ (avec $\\omega > 0$). Le motif se répète pour la première fois quand ' +
                '$\\omega T = 2\\pi$, donc $T = \\dfrac{2\\pi}{\\omega}$.',
            },
            {
              kind: 'para',
              text:
                'Décalage horizontal. On met $\\omega$ en évidence dans l\'argument : ' +
                '$\\omega x + \\varphi = \\omega\\left(x + \\dfrac{\\varphi}{\\omega}\\right) = ' +
                '\\omega\\left(x - \\left(-\\dfrac{\\varphi}{\\omega}\\right)\\right)$.',
            },
            {
              kind: 'para',
              text:
                'On reconnaît $\\omega(x - \\Phi)$ avec $\\Phi = -\\dfrac{\\varphi}{\\omega}$ : la courbe de ' +
                '$A\\sin(\\omega x) + b$ est translatée de Φ unités de $x$ (vers la droite si $\\Phi > 0$).',
            },
            {
              kind: 'para',
              text:
                'Contrôle : en $x = \\Phi$, l\'argument vaut $\\omega \\Phi + \\varphi = -\\varphi + ' +
                '\\varphi = 0$. Le motif décalé commence bien en Φ, comme celui de sin commence en 0.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — ω n\'est pas T',
          text:
            'La pulsation $\\omega$, c\'est simplement le nombre qui apparaît dans la ' +
            'formule, multiplié par x. La période $T$, elle, ne s\'obtient **qu\'en passant ' +
            'par la formule** $T = 2\\pi/\\omega$ — ce n\'est ni l\'inverse direct de ω, ni ' +
            'égal à ω ! Une confusion fréquente : croire que « ω = 3 » veut dire « la courbe ' +
            'se répète tous les 3 ». En réalité, elle se répète tous les $2\\pi/3$.',
        },
        {
          kind: 'exemple',
          badge: 'identifier les paramètres',
          formula: '$f(x) = 3\\sin(2x - \\dfrac{\\pi}{3}) + 1$',
          steps: [
            { tag: 'amplitude', text: '$A = 3 \\implies max = 1+3 = 4$, $min = 1-3 = -2$' },
            { tag: 'pulsation, période, fréquence', text: '$\\omega = 2 \\implies T = \\dfrac{2\\pi}{2} = \\pi$, $\\text{fréquence} = \\dfrac{1}{\\pi}$' },
            { tag: 'déphasage', text: '$\\varphi = -\\dfrac{\\pi}{3}$' },
            { tag: 'décalage horizontal', text: '$\\Phi = -\\dfrac{\\varphi}{\\omega} = -\\dfrac{-\\pi/3}{2} = \\dfrac{\\pi}{6}$' },
          ],
          result: { tag: 'décalage vertical', text: '$b = 1$ (valeur moyenne, équidistante de 4 et de −2)' },
        },
        {
          kind: 'astuce',
          text:
            'Pour ne jamais confondre A et b : A se lit avec une **soustraction** (max − ' +
            'min, divisé par 2). b se lit avec une **addition** (max + min, divisé par 2). ' +
            'Si tu obtiens la même formule pour les deux, relis l\'énoncé — c\'est le signe ' +
            'd\'une erreur !',
        },
        {
          kind: 'atelier',
          tag: 'sinusoide-widget',
          label: 'Manipule toi-même — fais varier A, T (ou ω), φ et b',
          caption:
            'C\'est le problème direct : tu choisis les paramètres, la courbe suit, avec ses ' +
            'encadrés Maximum/Minimum. Fais bouger un seul curseur à la fois pour voir ' +
            'l\'effet propre à chaque paramètre. La flèche violette montre le décalage ' +
            'horizontal réel Φ = −φ/ω, depuis l\'origine jusqu\'au début du motif décalé : ' +
            'avec ω ≠ 1, φ et Φ ne sont pas égaux.',
        },
        { kind: 'subheading', text: 'Construction pas à pas du graphique' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Trace la droite $y = b$ (la ligne moyenne) et indique l\'amplitude A de part et ' +
              'd\'autre, en pointillés.',
            'Partage une période complète, à partir de $\\Phi$, en 4 intervalles égaux. La ' +
              'courbe passe alors par $b$, le maximum, $b$, le minimum, $b$ — dans cet ordre.',
            'Cet ordre (maximum d\'abord) suppose $A > 0$ et $\\omega > 0$. Si $A < 0$, la ' +
              'courbe est retournée : à partir de $\\Phi$, elle passe par $b$, le **minimum**, ' +
              '$b$, le maximum, $b$.',
            'Reporte cette portion de courbe, de façon répétitive, pour couvrir tout l\'intervalle demandé.',
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
            xTickLabels: { [-PI / 8]: '−π/8', [PI / 8]: 'π/8', [3 * (PI / 8)]: '3π/8', [5 * (PI / 8)]: '5π/8', [7 * (PI / 8)]: '7π/8' },
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
            'Pars d\'une expression donnée. Identifie l\'amplitude, la pulsation ω, le ' +
              'déphasage φ, la période, la fréquence, le décalage horizontal Φ et le décalage ' +
              'vertical.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 8. Paramètres d\'une fonction sinusoïdale »',
        },
        {
          kind: 'entrainement',
          title: 'Construire une sinusoïde point par point',
          generatorId: '5gen52',
          description: [
            'La méthode de construction pas à pas : trouve A, b, T et Φ, place les cinq points ' +
              'd\'une période à partir de Φ sur un quadrillage gradué en fractions de π (minimum ' +
              'd\'abord si A < 0), puis prolonge la courbe par périodicité.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 52. Construire une sinusoïde point par point »',
        },
      ],
    },
    {
      id: 'lecture-graphique',
      number: 5,
      title: "Paramètres d'une fonction sinusoïdale — lecture graphique",
      kicker: 'retrouver A, ω, φ, b sans aucune formule de départ',
      blocks: [
        { kind: 'video', title: 'Lire A, ω, φ et b sur le graphique d\'une sinusoïde', youtubeId: '2Qf_W3tzZMI' },
        {
          kind: 'para',
          text:
            'Tu peux retrouver les mêmes paramètres **à partir du graphique seul**, sans ' +
            'jamais connaître la formule au départ. L\'amplitude et le décalage vertical se ' +
            'lisent directement sur les valeurs maximale et minimale. La période se mesure ' +
            'entre deux répétitions identiques du motif. Le déphasage se déduit de la position ' +
            '$x_0$ du « point de départ » du motif (la traversée montante de la ligne moyenne) : ' +
            '$\\varphi = -\\omega \\cdot x_0$.',
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
            '**Variante par le maximum** (souvent plus fiable, un maximum se pointe mieux ' +
              'qu\'une traversée) : en $x_{max}$, $\\sin(\\omega x_{max}+\\varphi) = 1$, donc ' +
              '$\\omega x_{max} + \\varphi = \\dfrac{\\pi}{2}$ et $\\varphi = \\dfrac{\\pi}{2} - \\omega x_{max}$.',
            'Ramène φ dans $]-\\pi\\,;\\pi]$ en ajoutant ou retranchant $2\\pi$ si besoin, puis ' +
              '**vérifie** : $f(x_{max})$ doit redonner le maximum lu.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'lecture complète sur un graphique',
          steps: [
            { tag: 'maximum lu : (1,5 ; 5) — minimum lu : (3,5 ; −1)', text: '$A = 3,\\ b = 2$' },
            { tag: 'deux maximums consécutifs : x=1,5 puis x=5,5', text: '$T = 4 \\implies \\omega = \\pi/2$' },
            { tag: 'traversée montante de la ligne moyenne (y=2) en x₀ = 0,5', text: '$\\varphi = -\\omega \\cdot x_0 = -\\pi/4$' },
            { tag: 'contrôle par le maximum (x_max = 1,5)', text: '$\\varphi = \\dfrac{\\pi}{2} - \\dfrac{\\pi}{2} \\times 1{,}5 = \\dfrac{\\pi}{2} - \\dfrac{3\\pi}{4} = -\\dfrac{\\pi}{4}$ : même valeur, déjà dans $]-\\pi\\,;\\pi]$' },
            { tag: 'vérification', text: '$f(1{,}5) = 3\\sin\\left(\\dfrac{3\\pi}{4} - \\dfrac{\\pi}{4}\\right) + 2 = 3\\sin\\left(\\dfrac{\\pi}{2}\\right) + 2 = 5$ : c\'est bien le maximum lu' },
          ],
          result: { tag: 'résultat', text: '$f(x) = 3\\sin(\\dfrac{\\pi}{2}x - \\dfrac{\\pi}{4}) + 2$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 3 * Math.sin((PI / 2) * x - PI / 4) + 2, tone: 'accent' }],
            xMin: -1,
            xMax: 7,
            xTicks: [0.5, 1.5, 3.5, 5.5],
            xTickLabels: { [0.5]: '0,5', [1.5]: '1,5', [3.5]: '3,5', [5.5]: '5,5' },
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
          kind: 'atelier',
          tag: 'courbe-mystere-widget',
          label: 'Manipule toi-même : la courbe mystère',
          caption:
            'Une courbe mystère y = A sin(ωx + φ) + b est tracée. Fais glisser le réticule ' +
            'pour lire son maximum, son minimum et x₀ (il s\'aimante sur ces points), puis ' +
            'règle A, T, φ et b jusqu\'à ce que ta courbe se superpose exactement à elle. « ' +
            'Nouvelle courbe » en tire une autre.',
        },
        {
          kind: 'attention',
          label: 'Attention — le sens de variation dépend du signe de A',
          text:
            'La convention « φ se lit à la traversée **montante** de la ligne moyenne » ' +
            'suppose $A > 0$. Si la courbe part plutôt d\'un minimum juste après une ' +
            'traversée **descendante**, c\'est le signe qu\'il faut repérer un $A$ négatif ' +
            '— ou choisir la traversée descendante comme point de référence. Vérifie ' +
            'toujours le sens de variation juste après le point que tu choisis, avant de ' +
            'lire φ ! Sinon, le déphasage trouvé est faux d\'un demi-tour.',
        },
        {
          kind: 'astuce',
          text:
            'Mesurer la période entre deux **maximums** consécutifs est en général plus ' +
            'fiable qu\'entre deux traversées de la ligne moyenne. Un maximum est un point ' +
            'isolé et net sur le graphique. Une traversée de ligne moyenne, elle, est plus ' +
            'facile à mal pointer au pixel près. Pour la même raison, la variante « φ par le ' +
            'maximum » de la méthode est un excellent contrôle de la lecture par la traversée.',
        },
        {
          kind: 'entrainement',
          title: 'Paramètres — lecture graphique',
          generatorId: '5gen9',
          description: [
            'Retrouve l\'amplitude, la période, la pulsation ω, le déphasage φ, le décalage ' +
              'horizontal Φ et le décalage vertical d\'une fonction sinusoïdale directement à ' +
              'partir de son graphique, sans formule de départ.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 9. Paramètres — lecture graphique »',
        },
        {
          kind: 'entrainement',
          title: 'Associer formules et courbes',
          generatorId: '5gen53',
          description: [
            'Quatre expressions A sin(ωx + φ) + b et leurs quatre courbes, dans le désordre : ' +
              'retrouve l\'expression de chaque courbe en lisant la ligne moyenne, l\'amplitude, la ' +
              'période et le décalage. Pièges : φ n\'est pas le décalage, A < 0 retourne la courbe, ' +
              'ω n\'est pas la période.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 53. Associer formules et courbes »',
        },
      ],
    },
    {
      id: 'extremums',
      number: 6,
      title: "Extremums d'une fonction sinusoïdale",
      kicker: 'sin(u)=±1 réunis — attention à la période effective',
      blocks: [
        { kind: 'video', title: 'Extremums d\'une fonction sinusoïdale : sin(u) = ±1 réunis', youtubeId: '7kx_Zy6QCpE' },
        {
          kind: 'para',
          text:
            'Un maximum de $A\\sin(u) + b$ (avec $A > 0$) correspond à $\\sin(u) = 1$ : il ' +
            'vaut $b + A$. Un minimum correspond à $\\sin(u) = -1$ : il vaut $b - A$. Ces deux ' +
            'conditions ont chacune une ' +
            'période de $2\\pi$ en u. Mais si tu cherches **tous les extremums** (maximums ' +
            'et minimums confondus), tu réunis les deux familles — ce qui donne une ' +
            'période effective de seulement $\\pi$.',
        },
        {
          kind: 'attention',
          label: 'Attention — si A est négatif, les rôles s\'inversent',
          text:
            'Avec $A < 0$, multiplier par $A$ retourne la courbe : le **maximum** est atteint ' +
            'quand $\\sin(u) = -1$, et le **minimum** quand $\\sin(u) = 1$. Les valeurs ' +
            'deviennent $b + |A|$ (maximum) et $b - |A|$ (minimum). Par exemple, ' +
            '$g(x) = -2\\sin(x) + 1$ atteint son maximum $3$ en $x = -\\dfrac{\\pi}{2} + 2k\\pi$, ' +
            'là où $\\sin x = -1$. Dans tous les cas : maximum $= b + |A|$, minimum $= b - |A|$.',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi la période est divisée par deux ?',
          text:
            'Regarde une vague : elle monte à son maximum, puis redescend à son minimum, ' +
            'puis remonte — un maximum **et** un minimum se produisent à chaque tour complet. ' +
            'Si tu ne comptes que les maximums, tu attends un tour entier ($2\\pi$) entre ' +
            'deux. Mais si tu acceptes maximum **ou** minimum, tu en croises un deux fois plus ' +
            'souvent : tous les $\\pi$, la moitié du chemin.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les extremums réunis reviennent tous les π',
          blocks: [
            {
              kind: 'para',
              text:
                'Avec $u = \\omega x + \\varphi$ et $A > 0$, les maximums correspondent à ' +
                '$\\sin u = 1 \\iff u = \\dfrac{\\pi}{2} + 2k\\pi$, et les minimums à ' +
                '$\\sin u = -1 \\iff u = -\\dfrac{\\pi}{2} + 2k\\pi$ (si $A < 0$, les rôles s\'échangent ' +
                'mais les deux familles restent les mêmes).',
            },
            {
              kind: 'para',
              text:
                'Or $-\\dfrac{\\pi}{2} + 2k\\pi = \\dfrac{\\pi}{2} + (2k - 1)\\pi$. Les maximums sont donc ' +
                'les valeurs $\\dfrac{\\pi}{2}$ plus un multiple **pair** de π, les minimums ' +
                '$\\dfrac{\\pi}{2}$ plus un multiple **impair** de π.',
            },
            {
              kind: 'para',
              text:
                'Réunies, les deux familles donnent $\\dfrac{\\pi}{2}$ plus **tous** les multiples ' +
                'de π : $u = \\dfrac{\\pi}{2} + k\\pi$, $k \\in \\mathbb{Z}$. C\'est une seule famille, ' +
                'de période π en $u$, au lieu de $2\\pi$ pour chacune.',
            },
            {
              kind: 'para',
              text:
                'Retour à $x$ : on divise tout par ω, $\\omega x + \\varphi = \\dfrac{\\pi}{2} + k\\pi \\iff ' +
                'x = \\dfrac{\\pi}{2\\omega} - \\dfrac{\\varphi}{\\omega} + k \\cdot \\dfrac{\\pi}{\\omega}$. Les extremums réunis ' +
                'reviennent tous les $\\dfrac{\\pi}{\\omega}$, la moitié de la période $T = \\dfrac{2\\pi}{\\omega}$.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — le piège central de cette section',
          text:
            'Ne confonds jamais **« sin(u) = 1 seul »** (une seule famille, période $2\\pi$ ' +
            '— les maximums uniquement) avec **« sin(u) = ±1 réunis »** (maximums et ' +
            'minimums ensemble, période effective $\\pi$) ! Les deux formules sont ' +
            'différentes. Répondre à « donne tous les extremums » avec la formule d\'un ' +
            'seul type d\'extremum est une erreur très fréquente.',
        },
        {
          kind: 'exemple',
          badge: 'maximums, minimums, puis extremums réunis',
          formula: '$f(x) = 2\\sin(3x + \\dfrac{\\pi}{6}) - 1$. Détermine séparément les maximums, les minimums, puis tous les extremums réunis.',
          steps: [
            { tag: 'maximums — sin(u) = 1, u = 3x+π/6', text: '$x = \\pi/9 + (2\\pi/3)k$ (période 2π/3)' },
            { tag: 'minimums — sin(u) = −1', text: '$x = -2\\pi/9 + (2\\pi/3)k$ (période 2π/3)' },
            { tag: 'valeurs des extremums — b ± |A| avec A = 2, b = −1', text: 'maximum $= -1 + 2 = 1$ ; minimum $= -1 - 2 = -3$' },
            {
              tag: 'extremums dans [0 ; 2π[ — k = 0, 1, 2',
              text: 'maximums en $\\dfrac{\\pi}{9},\\ \\dfrac{7\\pi}{9},\\ \\dfrac{13\\pi}{9}$ ; minimums en $\\dfrac{4\\pi}{9},\\ \\dfrac{10\\pi}{9},\\ \\dfrac{16\\pi}{9}$ — 6 extremums en tout',
            },
          ],
          result: { tag: 'extremums réunis — |sin(u)|=1, u = π/2+kπ', text: '$x = \\pi/9 + (\\pi/3)k$, $k\\in\\mathbb{Z}$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 2 * Math.sin(3 * x + PI / 6) - 1, tone: 'accent' }],
            xMin: -1,
            xMax: 3,
            xTicks: [PI / 9, (4 * PI) / 9, (7 * PI) / 9],
            xTickLabels: { [PI / 9]: 'π/9', [(4 * PI) / 9]: '4π/9', [(7 * PI) / 9]: '7π/9' },
            yTicks: [-3, -1, 1],
            yTickLabels: { [-3]: '−3', [-1]: '−1', [1]: '1' },
            fixedYRange: { min: -3.6, max: 1.8 },
            horizontalAsymptotes: [{ y: -1 }],
            points: [
              { x: PI / 9, y: 1, label: 'max', tone: 'accent' },
              { x: (4 * PI) / 9, y: -3, label: 'min', tone: 'bad' },
              { x: (7 * PI) / 9, y: 1, label: 'max', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'maximums et minimums alternent tous les π/3 — c\'est la période effective des extremums réunis',
          },
        },
        {
          kind: 'astuce',
          text:
            'Relis toujours la question ! « Donne les maximums » (une seule famille, ' +
            'période 2π/ω) n\'appelle pas la même formule que « donne tous les extremums » ' +
            '(les deux familles réunies, période π/ω). En cas de doute, calcule les deux ' +
            'familles séparément — c\'est plus long, mais toujours juste. Ne les réunis ' +
            'qu\'à la toute fin, si la question le demande explicitement.',
        },
        {
          kind: 'atelier',
          tag: 'extremums-sinusoide-widget',
          label: 'Manipule toi-même — le lien avec le cercle trigonométrique',
          caption:
            'Les maximums correspondent toujours à sin u = 1 et les minimums à sin u = −1, ' +
            'deux points fixes du cercle à π l\'un de l\'autre ; seule leur traduction en x ' +
            'dépend de ω et φ. Coche « A négatif » : les rôles s\'inversent. La liste donne ' +
            'le nombre et les abscisses des extremums dans [0 ; 2π], et leurs valeurs b ± ' +
            '|A|.',
        },
        {
          kind: 'entrainement',
          title: "Extremums d'une fonction sinusoïdale",
          generatorId: '5gen11',
          description: [
            'Détermine les maximums, les minimums, ou tous les extremums réunis d\'une ' +
              'fonction sinusoïdale. L\'exercice précise à chaque fois lequel des trois est ' +
              'demandé.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 11. Extremums d\'une fonction sinusoïdale »',
        },
      ],
    },
    {
      id: 'equations',
      number: 7,
      title: 'Équations trigonométriques',
      kicker: 'trig(ax+b) = c, produit nul, second degré en sin ou cos, égalité de deux expressions',
      blocks: [
        { kind: 'video', title: 'Équations trigonométriques trig(ax + b) = c', youtubeId: 'mOwnAw5DlCY' },
        {
          kind: 'featureTable',
          caption: 'Quelle méthode ? Reconnais d\'abord la forme de l\'équation',
          headers: ['forme de l\'équation', 'technique', 'exemple de référence'],
          rows: [
            ['$\\sin(ax+b) = c$ ou $\\cos(ax+b) = c$', 'poser $u = ax+b$, deux familles au cercle, diviser tout par $a$', '« deux familles de solutions »'],
            ['$\\tan(ax+b) = c$', 'une seule famille, période $\\pi/a$ ; valeurs interdites', '« tangente — une seule famille »'],
            ['$A \\cdot B = 0$', 'chaque facteur nul, réunion des solutions', '« produit nul »'],
            ['facteur commun ($\\cos^2 x - c\\cos x = 0$)', 'mettre en évidence, jamais diviser', '« à factoriser d\'abord »'],
            ['$\\sin^2$ et $\\cos$ mélangés', '$\\sin^2 + \\cos^2 = 1$, poser $t$, rejeter $|t| > 1$', '« une racine à rejeter »'],
            ['$\\cos(A) = \\sin(B)$, $\\tan(A) = -\\tan(B)$', 'même fonction des deux côtés, égaler les arguments', '« convertir, puis égaler »'],
          ],
        },
        { kind: 'subheading', text: 'Résoudre sin x = c, cos x = c, tan x = c' },
        {
          kind: 'para',
          text:
            'Pour que $\\sin x = c$ ou $\\cos x = c$ ait une solution, il faut ' +
            '$-1 \\le c \\le 1$. Aucune condition pour $\\tan x = c$. Dans les trois cas, ' +
            'tu détermines d\'abord un angle $\\alpha$ — à la calculatrice ou grâce à une ' +
            'valeur remarquable. Ensuite, tu utilises la **symétrie du cercle ' +
            'trigonométrique** pour écrire toutes les solutions. Dans ce chapitre, la lettre ' +
            '$c$ désigne toujours le second membre, et $k$ toujours un **entier** ' +
            '($k \\in \\mathbb{Z}$) — celui des « $+2k\\pi$ ».',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi deux solutions, en général ?',
          text:
            'Le cercle trigonométrique est symétrique. Pour une même hauteur (un même ' +
            'sinus), il y a presque toujours deux points sur le cercle : un à gauche, un à ' +
            'droite — comme un reflet dans un miroir vertical. Pour une même abscisse (un ' +
            'même cosinus), c\'est pareil, mais le miroir est horizontal cette fois. C\'est ' +
            'cette symétrie, pas une règle à apprendre par cœur, qui donne les deux ' +
            'familles de solutions.',
        },
        {
          kind: 'rappel',
          label: 'sin x = c',
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
            // Étiquette de la droite en `freeLabels` près de l'axe vertical : à gauche du cercle,
            // « y = c » chevauchait l'étiquette « π−α ».
            horizontalLine: { y: Math.sin(0.6), label: '' },
            freeLabels: [{ x: -0.09, y: 0.64, text: 'c', tone: 'accent' }],
            caption: 'sin x = c : deux points de même ordonnée, symétriques par rapport à l\'axe vertical',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les solutions de sin x = c par symétrie',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $c \\in [-1\\,;1]$ et $\\alpha$ un réel tel que $\\sin\\alpha = c$. Sur le cercle ' +
                'trigonométrique, le point image M de $\\alpha$ a pour ordonnée $c$.',
            },
            {
              kind: 'para',
              text:
                'La droite horizontale $y = c$ coupe le cercle en M et en M\', le symétrique de M ' +
                'par rapport à l\'axe vertical (en un seul point si $c = \\pm 1$). Aucun autre point ' +
                'du cercle n\'a pour ordonnée $c$.',
            },
            {
              kind: 'para',
              text:
                'Cette symétrie envoie $(1\\,;0)$ sur $(-1\\,;0)$ : l\'arc de M\' à $(-1\\,;0)$ mesure ' +
                '$\\alpha$, comme l\'arc de $(1\\,;0)$ à M. L\'arc de $(1\\,;0)$ à M\' mesure donc ' +
                '$\\pi - \\alpha$ : M\' est le point image de $\\pi - \\alpha$. Son ordonnée est la même que celle de M, donc $\\sin(\\pi - \\alpha) = ' +
                '\\sin\\alpha = c$.',
            },
            {
              kind: 'para',
              text:
                'Deux réels ont le même point image quand ils diffèrent d\'un multiple de $2\\pi$. ' +
                'Les solutions sont donc les réels dont le point image est M ou M\' : ' +
                '$\\sin x = c \\iff x = \\alpha + 2k\\pi$ ou $x = (\\pi - \\alpha) + 2k\\pi$, $k \\in \\mathbb{Z}$.',
            },
          ],
        },
        {
          kind: 'rappel',
          label: 'cos x = c',
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
            verticalLine: { x: Math.cos(0.6), label: 'x = c' },
            caption: 'cos x = c : deux points de même abscisse, symétriques par rapport à l\'axe horizontal',
          },
        },
        {
          kind: 'rappel',
          label: 'tan x = c',
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
            caption: 'tan x = c : deux points diamétralement opposés — une seule famille de solutions (période π)',
          },
        },
        { kind: 'subheading', text: 'Le cas général — trig(ax+b) = c' },
        {
          kind: 'para',
          text:
            'Résoudre $\\sin(ax+b) = c$ (ou avec un cosinus) suit toujours la même ' +
            'démarche, en trois temps. Tu isoles l\'argument $u = ax+b$. Tu résous ' +
            '$trig(u) = c$ à l\'aide du cercle trigonométrique (ci-dessus). Puis tu ' +
            'reviens à x, en divisant **toute l\'équation en u** — y compris le terme de ' +
            'période — par a. Ici, $a$ joue le rôle de $\\omega$ et $b$ celui de $\\varphi$ ' +
            'dans $A\\sin(\\omega x+\\varphi)+b$ : ce $b$-là est un déphasage, pas le ' +
            'décalage vertical.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Pose $u = ax + b$, et réécris l\'équation en u : $trig(u) = c$.',
            'Résous $trig(u) = c$ au cercle trigonométrique — pour cos et sin, deux ' +
              'familles de solutions en général (une seule pour tan). Aucune solution si ' +
              '$|c| > 1$ pour sin/cos.',
            'Remplace u par ax+b, isole x en divisant **tout** — constante et terme ' +
              'périodique — par a.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux familles de solutions',
          formula: 'Résous $2\\cos(3x - \\dfrac{\\pi}{4}) = 1$ dans ℝ, puis donne les solutions de $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'isoler cos(u), avec u = 3x − π/4', text: '$\\cos(u) = \\dfrac{1}{2}$' },
            { tag: 'cercle trigonométrique — cos(u)=1/2 : deux familles', text: '$u = \\pi/3 + 2k\\pi$ ou $u = -\\pi/3 + 2k\\pi$' },
            { tag: 'remplacer u par 3x−π/4, isoler x — diviser tout par 3', text: '$3x-\\pi/4 = \\pi/3+2k\\pi \\implies x = 7\\pi/36 + (2\\pi/3)k$' },
            { tag: 'deux familles de solutions dans ℝ', text: '$x = \\dfrac{7\\pi}{36} + \\dfrac{2k\\pi}{3}$ ou $x = -\\dfrac{\\pi}{36} + \\dfrac{2k\\pi}{3}$, $k\\in\\mathbb{Z}$' },
            {
              tag: 'garder celles de [0 ; 2π[ — la période 2π/3 tient 3 fois dans un tour',
              text: 'première famille ($k = 0, 1, 2$) : $\\dfrac{7\\pi}{36},\\ \\dfrac{31\\pi}{36},\\ \\dfrac{55\\pi}{36}$ ; seconde famille ($k = 1, 2, 3$) : $\\dfrac{23\\pi}{36},\\ \\dfrac{47\\pi}{36},\\ \\dfrac{71\\pi}{36}$',
            },
          ],
          result: {
            tag: 'résultat — 6 solutions dans [0 ; 2π[ (a = 3 : trois tours)',
            text: '$S = \\left\\{\\dfrac{7\\pi}{36}\\,;\\dfrac{23\\pi}{36}\\,;\\dfrac{31\\pi}{36}\\,;\\dfrac{47\\pi}{36}\\,;\\dfrac{55\\pi}{36}\\,;\\dfrac{71\\pi}{36}\\right\\}$',
          },
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: PI / 3, label: 'u=π/3', tone: 'accent' },
              { angle: -PI / 3, label: 'u=−π/3', tone: 'accent' },
            ],
            connectPoints: true,
            // « cos(u)=1/2 » au-dessus du cercle chevauchait « u=π/3 » : la valeur 1/2 est écrite
            // sous l'axe horizontal, au pied de la droite verticale.
            verticalLine: { x: 0.5, label: '' },
            freeLabels: [{ x: 0.66, y: -0.15, text: '1/2', tone: 'accent' }],
            caption: 'les deux points du cercle où l\'abscisse (cosinus) vaut 1/2 — symétriques par rapport à l\'axe horizontal',
          },
        },
        {
          kind: 'illustration',
          // Solutions en x (et non plus en u) : 7π/36 = 35°, 31π/36 = 155°, 55π/36 = 275° (première
          // famille) ; 23π/36 = 115°, 47π/36 = 235°, 71π/36 = 355° (seconde famille).
          illustration: {
            kind: 'circleAngles',
            // Étiquettes en `freeLabels` (centrées, ≈ 50 px de large) : une étiquette de point
            // ancrée à droite de 71π/36 (355°) ou à gauche de 31π/36 (155°) sortait du cadre.
            points: [
              { angle: (7 * PI) / 36, label: '', tone: 'accent' },
              { angle: (31 * PI) / 36, label: '', tone: 'accent' },
              { angle: (55 * PI) / 36, label: '', tone: 'accent' },
              { angle: (23 * PI) / 36, label: '', tone: 'good' },
              { angle: (47 * PI) / 36, label: '', tone: 'good' },
              { angle: (71 * PI) / 36, label: '', tone: 'good' },
            ],
            freeLabels: [
              { x: 1.08, y: 0.8, text: '7π/36', tone: 'accent' },
              { x: -1.2, y: 0.62, text: '31π/36', tone: 'accent' },
              { x: 0.32, y: -1.22, text: '55π/36', tone: 'accent' },
              { x: -0.62, y: 1.12, text: '23π/36', tone: 'good' },
              { x: -0.84, y: -1.08, text: '47π/36', tone: 'good' },
              { x: 1.22, y: -0.31, text: '71π/36', tone: 'good' },
            ],
            caption:
              'les 6 solutions en x dans $[0\\,;2\\pi[$ : en orange la famille ' +
              '$\\dfrac{7\\pi}{36} + \\dfrac{2k\\pi}{3}$, en vert la famille $-\\dfrac{\\pi}{36} + \\dfrac{2k\\pi}{3}$. ' +
              'Dans chaque famille, deux solutions voisines sont à $\\dfrac{2\\pi}{3}$ (un tiers de tour) ' +
              'l\'une de l\'autre : avec $a = 3$, chaque famille donne 3 solutions par tour',
          },
        },
        {
          kind: 'atelier',
          tag: 'equation-trig-widget',
          label: 'Manipule toi-même — résous trig(ax+b) = c en direct',
          caption:
            'Choisis sin, cos ou tan, puis règle a, b (en multiples de π) et le second ' +
            'membre c. Le cercle ne dépend que de c ; les familles de solutions, et leur ' +
            'liste dans [0 ; 2π[, dépendent de a et b. Pour tan, les valeurs interdites ' +
            'sont signalées.',
        },
        {
          kind: 'piege',
          text:
            'Diviser **seulement** le terme constant par a, en oubliant le « +2kπ » : ça ' +
            'donne une famille de solutions avec la mauvaise période (2π au lieu de 2π/a) ' +
            '! Toute l\'équation en u — terme constant **et** terme périodique — passe par la ' +
            'même division.',
        },
        {
          kind: 'attention',
          label: 'Attention — |c| > 1 : aucune solution',
          text:
            '$\\cos(u) = 1{,}5$ n\'a **aucune** solution, car cosinus (comme sinus) ne ' +
            'prend jamais de valeur en dehors de [−1 ; 1]. Ce n\'est pas une erreur à ' +
            'corriger — c\'est une réponse valable : l\'ensemble des solutions est vide.',
        },
        {
          kind: 'exemple',
          badge: 'tangente — une seule famille',
          formula: 'Résous $\\tan\\left(2x - \\dfrac{\\pi}{3}\\right) = 1$ dans $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'u = 2x − π/3 : tan(u) = 1, une seule famille (période π)', text: '$u = \\dfrac{\\pi}{4} + k\\pi$' },
            { tag: 'revenir à x — diviser tout par 2', text: '$2x = \\dfrac{\\pi}{4} + \\dfrac{\\pi}{3} + k\\pi = \\dfrac{7\\pi}{12} + k\\pi \\implies x = \\dfrac{7\\pi}{24} + \\dfrac{k\\pi}{2}$' },
            { tag: 'garder celles de [0 ; 2π[ — k = 0, 1, 2, 3', text: '$\\dfrac{7\\pi}{24},\\ \\dfrac{19\\pi}{24},\\ \\dfrac{31\\pi}{24},\\ \\dfrac{43\\pi}{24}$ (pour $k = 4$ : $\\dfrac{55\\pi}{24} > 2\\pi$)' },
            { tag: 'valeurs interdites', text: 'aucune de ces valeurs ne donne $u = \\dfrac{\\pi}{2} + k\\pi$ (on a toujours $u = \\dfrac{\\pi}{4} + k\\pi$) : toutes sont acceptées' },
          ],
          result: { tag: 'résultat — 4 solutions', text: '$S = \\left\\{\\dfrac{7\\pi}{24}\\,;\\dfrac{19\\pi}{24}\\,;\\dfrac{31\\pi}{24}\\,;\\dfrac{43\\pi}{24}\\right\\}$' },
        },
        { kind: 'subheading', text: 'Équation « produit nul »' },
        {
          kind: 'para',
          text:
            'Un produit est nul dès que **l\'un** de ses facteurs est nul : $A \\cdot B = 0 ' +
            '\\iff A = 0$ ou $B = 0$. Chaque facteur donne une équation $trig(ax+b) = c$ que tu ' +
            'sais déjà résoudre ; l\'ensemble des solutions est la **réunion** des solutions des ' +
            'deux facteurs. Si l\'équation n\'est pas encore factorisée, cherche un facteur ' +
            'commun : avec $T = \\cos(x)$ par exemple, $T^2 - cT = 0$ devient $T(T-c) = 0$.',
        },
        {
          kind: 'exemple',
          badge: 'produit nul — réunion des solutions',
          formula: 'Résous $\\sin(x)\\cdot\\left(2\\cos(x)-1\\right) = 0$ dans $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'premier facteur nul', text: '$\\sin(x) = 0 \\implies x = 0$ ou $x = \\pi$' },
            { tag: 'second facteur nul', text: '$2\\cos(x) - 1 = 0 \\iff \\cos(x) = \\dfrac{1}{2} \\implies x = \\dfrac{\\pi}{3}$ ou $x = \\dfrac{5\\pi}{3}$' },
          ],
          result: { tag: 'réunion des deux facteurs', text: '$S = \\left\\{0\\,;\\dfrac{\\pi}{3}\\,;\\pi\\,;\\dfrac{5\\pi}{3}\\right\\}$' },
        },
        {
          kind: 'exemple',
          badge: 'à factoriser d\'abord',
          formula: 'Résous $\\cos^2(x) - \\dfrac{1}{2}\\cos(x) = 0$ dans $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'mettre cos(x) en évidence', text: '$\\cos(x)\\cdot\\left(\\cos(x) - \\dfrac{1}{2}\\right) = 0$' },
            { tag: 'premier facteur nul', text: '$\\cos(x) = 0 \\implies x = \\dfrac{\\pi}{2}$ ou $x = \\dfrac{3\\pi}{2}$' },
            { tag: 'second facteur nul', text: '$\\cos(x) = \\dfrac{1}{2} \\implies x = \\dfrac{\\pi}{3}$ ou $x = \\dfrac{5\\pi}{3}$' },
          ],
          result: { tag: 'réunion des deux facteurs', text: '$S = \\left\\{\\dfrac{\\pi}{3}\\,;\\dfrac{\\pi}{2}\\,;\\dfrac{3\\pi}{2}\\,;\\dfrac{5\\pi}{3}\\right\\}$' },
        },
        {
          kind: 'piege',
          text:
            'Diviser les deux membres par $\\cos(x)$ pour « simplifier » : on perd toutes les ' +
            'solutions de $\\cos(x) = 0$. Dans un produit nul, on ne divise jamais par un ' +
            'facteur — on le met en évidence.',
        },
        { kind: 'subheading', text: 'Équation du second degré en sin ou en cos' },
        {
          kind: 'para',
          text:
            'Quand une équation mélange $\\sin^2(x)$ et $\\cos(x)$ (ou $\\cos^2(x)$ et $\\sin(x)$), ' +
            'l\'identité $\\sin^2(x) + \\cos^2(x) = 1$ permet de tout écrire avec **une seule** ' +
            'fonction. Un changement de variable ramène alors à une équation du second degré.',
        },
        {
          kind: 'methode',
          label: 'Méthode — substitution t = cos(x) ou t = sin(x)',
          items: [
            'Remplace $\\sin^2(x)$ par $1 - \\cos^2(x)$ (ou $\\cos^2(x)$ par $1 - \\sin^2(x)$) : ' +
              'il ne reste qu\'une fonction trigonométrique.',
            'Pose $t = \\cos(x)$ (ou $t = \\sin(x)$) et résous l\'équation du second degré en $t$ ' +
              '(discriminant).',
            '**Rejette** toute racine $t$ en dehors de $[-1\\,;1]$ : un cosinus ou un sinus ne ' +
              'prend jamais une telle valeur.',
            'Pour chaque racine restante, résous $\\cos(x) = t$ (ou $\\sin(x) = t$) au cercle ' +
              'trigonométrique.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'une racine à rejeter',
          formula: 'Résous $2\\sin^2(x) - \\cos(x) + 1 = 0$ dans $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'remplacer sin²(x) par 1 − cos²(x)', text: '$2\\left(1 - \\cos^2(x)\\right) - \\cos(x) + 1 = 0 \\iff 2\\cos^2(x) + \\cos(x) - 3 = 0$' },
            { tag: 'poser t = cos(x)', text: '$2t^2 + t - 3 = 0$, $\\Delta = 1 + 24 = 25$, $t = \\dfrac{-1 \\pm 5}{4}$ : $t = 1$ ou $t = -\\dfrac{3}{2}$' },
            { tag: 'rejeter t = −3/2 (hors de [−1 ; 1])', text: 'il reste $\\cos(x) = 1$' },
            { tag: 'résoudre cos(x) = 1', text: '$x = 0 + 2k\\pi$, donc $x = 0$ dans $[0\\,;2\\pi[$' },
          ],
          result: { tag: 'résultat', text: '$S = \\{0\\}$' },
        },
        {
          kind: 'atelier',
          tag: 'substitution-cos-widget',
          label: 'Manipule toi-même : t = cos x, garder ou rejeter',
          caption:
            'Règle a, b et c (ou choisis une équation) : la parabole en t montre les ' +
            'racines, la bande verte [−1 ; 1] celles qu\'on garde, les autres sont barrées. ' +
            'Chaque racine gardée est reportée sur le cercle trigonométrique (droite ' +
            'verticale pour cos, horizontale pour sin) : on lit les solutions en x dans [0 ' +
            '; 2π[.',
        },
        {
          kind: 'attention',
          label: 'Attention — une racine rejetée n\'est pas une erreur',
          text:
            'Trouver $t = -\\dfrac{3}{2}$ ou $t = 2$ ne signifie pas que ton calcul est faux : ' +
            'c\'est une racine de l\'équation en $t$ qui ne correspond à aucun angle. Si toutes ' +
            'les racines sont rejetées, l\'équation n\'a aucune solution.',
        },
        {
          kind: 'exemple',
          badge: 'deux racines gardées',
          formula: 'Résous $2\\sin^2(x) - 3\\sin(x) + 1 = 0$ dans $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'poser t = sin(x)', text: '$2t^2 - 3t + 1 = 0$, $\\Delta = 9 - 8 = 1$, $t = \\dfrac{3 \\pm 1}{4}$ : $t = 1$ ou $t = \\dfrac{1}{2}$' },
            { tag: 'les deux racines sont dans [−1 ; 1] : on garde tout', text: '$\\sin(x) = 1$ ou $\\sin(x) = \\dfrac{1}{2}$' },
            { tag: 'résoudre chaque équation au cercle', text: '$\\sin(x) = 1 \\implies x = \\dfrac{\\pi}{2}$ ; $\\sin(x) = \\dfrac{1}{2} \\implies x = \\dfrac{\\pi}{6}$ ou $x = \\dfrac{5\\pi}{6}$' },
          ],
          result: { tag: 'résultat — 3 solutions', text: '$S = \\left\\{\\dfrac{\\pi}{6}\\,;\\dfrac{\\pi}{2}\\,;\\dfrac{5\\pi}{6}\\right\\}$' },
        },
        { kind: 'subheading', text: 'Égalité de deux expressions trigonométriques' },
        {
          kind: 'para',
          text:
            'Pour résoudre $\\cos(A) = \\sin(B)$, on écrit les deux membres avec la **même** ' +
            'fonction grâce aux angles complémentaires, puis on égale les arguments, comme au ' +
            'cercle trigonométrique.',
        },
        {
          kind: 'rappel',
          label: 'Conversions utiles',
          items: [
            '$\\sin(\\theta) = \\cos\\left(\\dfrac{\\pi}{2} - \\theta\\right)$ et ' +
              '$\\cos(\\theta) = \\sin\\left(\\dfrac{\\pi}{2} - \\theta\\right)$ (angles complémentaires).',
            '$-\\tan(\\theta) = \\tan(-\\theta)$ (la tangente est impaire).',
            '$\\cos(A) = \\cos(B) \\iff A = B + 2k\\pi$ ou $A = -B + 2k\\pi$.',
            '$\\sin(A) = \\sin(B) \\iff A = B + 2k\\pi$ ou $A = \\pi - B + 2k\\pi$.',
            '$\\tan(A) = \\tan(B) \\iff A = B + k\\pi$ — une seule famille.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'convertir, puis égaler les arguments',
          formula: 'Résous $\\cos(2x) = \\sin(x)$ dans $[0\\,;2\\pi[$.',
          steps: [
            { tag: 'écrire sin(x) avec un cosinus', text: '$\\sin(x) = \\cos\\left(\\dfrac{\\pi}{2} - x\\right)$, donc $\\cos(2x) = \\cos\\left(\\dfrac{\\pi}{2} - x\\right)$' },
            { tag: 'première famille', text: '$2x = \\dfrac{\\pi}{2} - x + 2k\\pi \\iff 3x = \\dfrac{\\pi}{2} + 2k\\pi \\iff x = \\dfrac{\\pi}{6} + \\dfrac{2k\\pi}{3}$' },
            { tag: 'seconde famille', text: '$2x = -\\left(\\dfrac{\\pi}{2} - x\\right) + 2k\\pi \\iff x = -\\dfrac{\\pi}{2} + 2k\\pi$' },
            { tag: 'garder les valeurs de [0 ; 2π[', text: 'première famille : $\\dfrac{\\pi}{6}$, $\\dfrac{5\\pi}{6}$, $\\dfrac{3\\pi}{2}$ ; seconde famille : $\\dfrac{3\\pi}{2}$' },
          ],
          result: { tag: 'résultat (3π/2 n\'est compté qu\'une fois)', text: '$S = \\left\\{\\dfrac{\\pi}{6}\\,;\\dfrac{5\\pi}{6}\\,;\\dfrac{3\\pi}{2}\\right\\}$' },
        },
        {
          kind: 'piege',
          text:
            'Pour $\\tan(A) = -\\tan(B)$, recopier le signe moins à l\'extérieur et écrire ' +
            '$A = B + k\\pi$ : c\'est faux. On écrit d\'abord $-\\tan(B) = \\tan(-B)$, ce qui ' +
            'donne $A = -B + k\\pi$.',
        },
        {
          kind: 'atelier',
          tag: 'intersections-trig-widget',
          label: 'Manipule toi-même : les solutions sont des intersections',
          caption:
            'Choisis une équation du cours : ses deux membres sont tracés sur [0 ; 2π[ et ' +
            'chaque point d\'intersection est une solution, avec son abscisse exacte. Le ' +
            'dernier réglage, sin(x) = c, montre qu\'on a deux solutions en général, une ' +
            'seule si c = ±1, aucune si |c| > 1.',
        },
        {
          kind: 'attention',
          label: 'Attention — la tangente n\'existe pas partout',
          text:
            '$\\tan(u)$ n\'est pas définie quand $u = \\dfrac{\\pi}{2} + k\\pi$. Dès qu\'une ' +
            'équation contient une tangente (facteur d\'un produit, égalité de deux tangentes), ' +
            'vérifie chaque valeur trouvée : si l\'argument d\'une tangente vaut ' +
            '$\\dfrac{\\pi}{2} + k\\pi$, la valeur est **rejetée**. Par exemple, $x = ' +
            '\\dfrac{3\\pi}{4}$ ne peut pas être solution d\'une équation contenant ' +
            '$\\tan\\left(x - \\dfrac{\\pi}{4}\\right)$, car $\\tan\\left(\\dfrac{\\pi}{2}\\right)$ ' +
            'n\'existe pas.',
        },
        {
          kind: 'entrainement',
          title: 'Équations trigonométriques trig(ax+b)=k',
          generatorId: '5gen10',
          description: [
            'Résous des équations trigonométriques : trig(ax+b) = c, produit nul, second degré ' +
              'en sin ou cos (substitution t), égalité de deux expressions (cos(A) = sin(B), ' +
              'tan(A) = −tan(B)). Donne les familles de solutions puis les solutions dans ' +
              '[0 ; 2π[, y compris les cas sans solution.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 10. Équations trigonométriques trig(ax+b)=k »',
        },
      ],
    },
    {
      id: 'modeliser',
      number: 8,
      title: 'Modéliser une fonction sinusoïdale en contexte',
      kicker: 'construire A, b, T (donc ω), puis φ à partir d\'une condition initiale — puis résoudre f(t) ≥ y₀',
      blocks: [
        { kind: 'video', title: 'Modéliser une situation périodique par une sinusoïde (grande roue)', youtubeId: 'fw20BqIfKCU' },
        {
          kind: 'para',
          text:
            'Face à une situation concrète et périodique (grande roue, marée, température ' +
            'saisonnière…), tu construis le modèle sinusoïdal toujours dans le **même ' +
            'ordre**. D\'abord l\'amplitude et le décalage vertical, à partir des valeurs ' +
            'extrêmes. Ensuite la période (donc la pulsation). Et enfin le déphasage φ — le ' +
            'seul paramètre qui a besoin d\'une **condition initiale** précise, donnée par l\'énoncé.',
        },
        {
          kind: 'methode',
          label: 'Méthode — construire le modèle pas à pas',
          items: [
            'A = (valeur max − valeur min) / 2.',
            'b = (valeur max + valeur min) / 2.',
            'T = durée d\'un cycle complet (donnée par l\'énoncé) ⟹ ω = 2π/T.',
            'φ : injecte la condition initiale (une valeur connue à un instant connu) dans ' +
              '$A\\sin(\\omega t+\\varphi)+b$. Résous en φ, en choisissant la solution la ' +
              'plus simple parmi l\'infinité de solutions possibles.',
            'Si la valeur de départ n\'est **pas** un extremum, $\\sin\\varphi = m$ a **deux** ' +
              'solutions dans $]-\\pi\\,;\\pi]$ : $\\arcsin(m)$ et $\\pi - \\arcsin(m)$. C\'est ' +
              'le **sens de variation** au départ (monte ou descend ?) qui tranche.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — arcsin, l\'angle dont on connaît le sinus',
          items: [
            'Pour $-1 \\le m \\le 1$, $\\arcsin(m)$ est **l\'angle de** $\\left[-\\dfrac{\\pi}{2}\\,;\\dfrac{\\pi}{2}\\right]$ ' +
              '**dont le sinus vaut** $m$ — c\'est la touche $\\sin^{-1}$ de la calculatrice (en ' +
              'mode radian). Par exemple, $\\arcsin\\left(\\dfrac{1}{2}\\right) = \\dfrac{\\pi}{6}$ et ' +
              '$\\arcsin(-1) = -\\dfrac{\\pi}{2}$. L\'autre angle de même sinus est $\\pi - \\arcsin(m)$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — une grande roue',
          blocks: [
            {
              kind: 'para',
              text:
                'Une grande roue a un rayon de 15 m. Le centre de la roue est situé à 17 m ' +
                'du sol. Elle fait un tour complet en 8 minutes. À l\'instant $t=0$ ' +
                '(l\'embarquement), une nacelle se trouve à son point le plus bas.',
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
                // Pas d'étiquette sur la droite y=2 : coïncide avec le point "t=0" juste en
                // dessous, qui affiche déjà cette valeur (hauteur=2) — chevauchement constaté.
                horizontalAsymptotes: [{ y: 2 }, { y: 32, label: 'max = 32' }],
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
                'Vérification : $hauteur(4) = 15\\sin(\\pi - \\pi/2) + 17 = 15\\sin(\\pi/2)+17 ' +
                '= 32$ m. C\'est exactement le point le plus haut, atteint après un ' +
                'demi-tour (4 minutes) — cohérent !',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'maximum atteint à un instant t₀ ≠ 0',
          formula:
            'Dans une ville, la température moyenne mensuelle varie entre $-2$ °C et $14$ °C, avec ' +
            'une période de 12 mois. Le maximum est atteint en juillet, à $t_0 = 7$ ($t$ en mois). ' +
            'Détermine le modèle $f(t) = A\\sin(\\omega t + \\varphi) + b$.',
          steps: [
            { tag: 'A et b, à partir des extrêmes', text: '$A = \\dfrac{14 - (-2)}{2} = 8$ ; $b = \\dfrac{14 + (-2)}{2} = 6$' },
            { tag: 'pulsation, avec T = 12', text: '$\\omega = \\dfrac{2\\pi}{12} = \\dfrac{\\pi}{6}$' },
            {
              tag: 'maximum en t₀ = 7 : l\'argument vaut π/2 (−π/2 pour un minimum)',
              text: '$\\dfrac{\\pi}{6} \\cdot 7 + \\varphi = \\dfrac{\\pi}{2} \\iff \\varphi = \\dfrac{\\pi}{2} - \\dfrac{7\\pi}{6} = -\\dfrac{2\\pi}{3}$, déjà dans $]-\\pi\\,;\\pi]$',
            },
            {
              tag: 'vérification — le minimum six mois plus tôt, en t = 1',
              text: '$f(1) = 8\\sin\\left(\\dfrac{\\pi}{6} - \\dfrac{2\\pi}{3}\\right) + 6 = 8\\sin\\left(-\\dfrac{\\pi}{2}\\right) + 6 = -2$ °C',
            },
          ],
          result: { tag: 'modèle', text: '$f(t) = 8\\sin\\left(\\dfrac{\\pi}{6}t - \\dfrac{2\\pi}{3}\\right) + 6$' },
        },
        {
          kind: 'exemple',
          badge: 'départ hors d\'un extremum — deux candidats pour φ',
          formula:
            'Même grande roue (rayon 15 m, centre à 17 m, un tour en 8 min). Cette fois, à ' +
            '$t = 0$, la nacelle est à $24{,}5$ m du sol et elle **monte**. Détermine le modèle.',
          steps: [
            { tag: 'A, b, ω inchangés', text: '$A = 15$, $b = 17$, $\\omega = \\dfrac{\\pi}{4}$' },
            { tag: 'condition initiale hauteur(0) = 24,5', text: '$15\\sin(\\varphi) + 17 = 24{,}5 \\iff \\sin(\\varphi) = \\dfrac{1}{2}$' },
            { tag: 'deux candidats dans ]−π ; π]', text: '$\\varphi_1 = \\arcsin\\left(\\dfrac{1}{2}\\right) = \\dfrac{\\pi}{6}$ ou $\\varphi_2 = \\pi - \\dfrac{\\pi}{6} = \\dfrac{5\\pi}{6}$' },
            {
              tag: 'le sens de variation tranche',
              text: 'au départ, $u = \\varphi$ ; la nacelle monte si le point du cercle monte, c\'est-à-dire si $\\cos\\varphi > 0$. Or $\\cos\\dfrac{\\pi}{6} > 0$ et $\\cos\\dfrac{5\\pi}{6} < 0$ : on garde $\\varphi = \\dfrac{\\pi}{6}$',
            },
            { tag: 'vérification — le maximum doit arriver bientôt', text: '$hauteur\\left(\\dfrac{4}{3}\\right) = 15\\sin\\left(\\dfrac{\\pi}{3} + \\dfrac{\\pi}{6}\\right) + 17 = 15 + 17 = 32$ m : le point haut, atteint après 1 min 20 s' },
          ],
          result: { tag: 'modèle', text: '$hauteur(t) = 15\\sin\\left(\\dfrac{\\pi}{4}t + \\dfrac{\\pi}{6}\\right) + 17$ (avec $\\varphi = \\dfrac{5\\pi}{6}$, la nacelle descendrait)' },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (t) => 15 * Math.sin((PI / 4) * t + PI / 6) + 17, tone: 'good' },
              { fn: (t) => 15 * Math.sin((PI / 4) * t + (5 * PI) / 6) + 17, tone: 'faint' },
            ],
            xMin: 0,
            xMax: 8,
            xTicks: [2, 4, 6, 8],
            yTicks: [2, 17, 32],
            fixedYRange: { min: 0, max: 40 },
            points: [
              { x: 0, y: 24.5, label: '', tone: 'accent' },
              { x: 4 / 3, y: 32, label: 'max', tone: 'good', labelPos: 'right' },
            ],
            xAxisLabel: 't (min)',
            yAxisLabel: 'hauteur (m)',
            caption:
              'les deux candidats passent par 24,5 m à t = 0 (point orange) : en vert φ = π/6 (la nacelle monte, ' +
              'retenu), en gris φ = 5π/6 (elle descendrait, rejeté)',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — φ n\'est pas unique',
          text:
            'L\'équation $\\sin(\\varphi) = -1$ a une infinité de solutions ($\\varphi = ' +
            '-\\pi/2 + 2k\\pi$). On choisit, par convention, la plus simple — en général ' +
            'celle qui appartient à $]-\\pi\\,;\\,\\pi]$. Mais n\'importe quelle autre ' +
            'valeur de cette famille donnerait exactement la même fonction, puisque le ' +
            'sinus est périodique de période 2π. Attention : ce « $+2k\\pi$ » n\'est pas la ' +
            'seule ambiguïté. Hors d\'un extremum, $\\sin\\varphi = m$ a deux solutions ' +
            '**vraiment différentes** dans $]-\\pi\\,;\\pi]$ (exemple ci-dessus) : elles ' +
            'donnent deux fonctions différentes, et seul le sens de variation permet de choisir.',
        },
        {
          kind: 'astuce',
          text:
            'Une fois ton modèle construit, vérifie-le toujours sur **une deuxième donnée** ' +
            'de l\'énoncé — ici, le point haut à t=4, un demi-tour plus tard, comme dans ' +
            'l\'exemple ci-dessus. Une erreur de signe sur φ se détecte tout de suite si la ' +
            'vérification donne un minimum au lieu d\'un maximum, ou l\'inverse.',
        },
        { kind: 'subheading', text: 'Deux points de la courbe : un système en ω et φ' },
        {
          kind: 'para',
          text:
            'Parfois, l\'énoncé ne donne ni la période ni un extremum, mais **deux points** ' +
            '$(t_1\\,;f_1)$ et $(t_2\\,;f_2)$ de la courbe (A et b étant connus). Chaque point ' +
            'donne une équation en ω et φ : il suffit de résoudre ce système.',
        },
        {
          kind: 'methode',
          label: 'Méthode — modèle à partir de deux points (A et b connus)',
          items: [
            'Pour chaque point, isole le sinus : $\\sin(\\omega t_i + \\varphi) = \\dfrac{f_i - b}{A}$.',
            'Si les deux points sont sur une même montée de la courbe (argument compris entre ' +
              '$-\\dfrac{\\pi}{2}$ et $\\dfrac{\\pi}{2}$), l\'argument est exactement l\'arcsin : ' +
              '$\\omega t_i + \\varphi = \\alpha_i$ avec $\\alpha_i = \\arcsin\\left(\\dfrac{f_i - b}{A}\\right)$. ' +
              'Tu obtiens deux équations du premier degré en ω et φ.',
            'Soustrais-les membre à membre : φ disparaît et $\\omega = \\dfrac{\\alpha_2 - \\alpha_1}{t_2 - t_1}$. ' +
              'Remplace ensuite ω dans l\'une des deux : $\\varphi = \\alpha_1 - \\omega t_1$.',
            'Vérifie le modèle au second point.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux points de la courbe — un système en ω et φ',
          formula:
            'La température (en °C) dans une serre suit un modèle $f(t) = 4\\sin(\\omega t + \\varphi) + 10$, ' +
            'avec $t$ en heures et $\\omega > 0$. À $t = 1$, il fait 10 °C ; à $t = 3$, il fait 12 °C. ' +
            'Ces deux points sont sur une même montée de la courbe : en chacun d\'eux, l\'argument ' +
            '$\\omega t + \\varphi$ est compris entre $-\\dfrac{\\pi}{2}$ et $\\dfrac{\\pi}{2}$. Détermine ω et φ.',
          steps: [
            {
              tag: 'premier point — isoler le sinus, puis arcsin',
              text: '$4\\sin(\\omega + \\varphi) + 10 = 10 \\iff \\sin(\\omega + \\varphi) = 0 \\implies \\omega + \\varphi = \\arcsin(0) = 0$',
            },
            {
              tag: 'second point',
              text: '$4\\sin(3\\omega + \\varphi) + 10 = 12 \\iff \\sin(3\\omega + \\varphi) = \\dfrac{1}{2} \\implies 3\\omega + \\varphi = \\arcsin\\left(\\dfrac{1}{2}\\right) = \\dfrac{\\pi}{6}$',
            },
            {
              tag: 'soustraire les deux équations : φ disparaît',
              text: '$(3\\omega + \\varphi) - (\\omega + \\varphi) = \\dfrac{\\pi}{6} - 0 \\iff 2\\omega = \\dfrac{\\pi}{6} \\iff \\omega = \\dfrac{\\pi}{12}$',
            },
            { tag: 'remplacer ω dans la première équation', text: '$\\dfrac{\\pi}{12} + \\varphi = 0 \\iff \\varphi = -\\dfrac{\\pi}{12}$' },
            {
              tag: 'vérification au second point',
              text: '$f(3) = 4\\sin\\left(\\dfrac{3\\pi}{12} - \\dfrac{\\pi}{12}\\right) + 10 = 4\\sin\\left(\\dfrac{\\pi}{6}\\right) + 10 = 12$ °C',
            },
          ],
          result: {
            tag: 'modèle — période T = 2π/ω = 24 h',
            text: '$f(t) = 4\\sin\\left(\\dfrac{\\pi}{12}t - \\dfrac{\\pi}{12}\\right) + 10$',
          },
          // f(1) = 10 (argument 0), f(3) = 4 sin(π/6) + 10 = 12, maximum 14 en t = 7 (argument π/2),
          // retour à 10 en t = 13, minimum 6 en t = 19.
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => 4 * Math.sin((PI / 12) * t - PI / 12) + 10, tone: 'accent' }],
            xMin: 0,
            xMax: 25,
            xTicks: [1, 3, 7, 13, 19],
            yTicks: [6, 10, 12, 14],
            fixedYRange: { min: 4, max: 16 },
            horizontalAsymptotes: [{ y: 10 }],
            points: [
              { x: 1, y: 10, label: 'P₁', tone: 'good', labelPos: 'below' },
              { x: 3, y: 12, label: 'P₂', tone: 'good', labelPos: 'right' },
              { x: 7, y: 14, label: 'max', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 't (h)',
            yAxisLabel: 'f(t) (°C)',
            caption:
              'les deux points connus $P_1(1\\,;10)$ et $P_2(3\\,;12)$ sont sur la même montée de la courbe : ' +
              'leurs arguments, 0 et $\\dfrac{\\pi}{6}$, sont bien entre $-\\dfrac{\\pi}{2}$ et $\\dfrac{\\pi}{2}$. ' +
              'Le modèle trouvé atteint son maximum en $t = 7$ et a une période de 24 h',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — arcsin ne donne qu\'un seul angle',
          text:
            'L\'arcsin renvoie toujours un angle de $\\left[-\\dfrac{\\pi}{2}\\,;\\dfrac{\\pi}{2}\\right]$. ' +
            'Écrire $\\omega t_i + \\varphi = \\arcsin(\\ldots)$ n\'est donc juste que si l\'argument est ' +
            'dans cet intervalle — d\'où la condition « une même montée ». Sur une descente, ' +
            'l\'argument serait $\\pi - \\alpha_i$, comme pour les deux candidats de φ plus haut.',
        },
        {
          kind: 'entrainement',
          title: 'Choisir φ quand le départ n\'est pas un extremum',
          generatorId: '5gen54',
          description: [
            'Grande roue, roue à aubes, pédalier, marée, ressort ou lac : la grandeur ne part pas d\'un extremum. Calcule A, b et ω, isole sin φ, trouve les deux candidats arcsin m et π − arcsin m, garde celui que le sens de variation impose (monte ou descend ?), puis vérifie le modèle par l\'instant du premier maximum.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 54. Choisir φ quand le départ n\'est pas un extremum »',
        },
        {
          kind: 'application',
          titre: "Modéliser la durée du jour au fil de l'année",
          illustrations: [
            {
              kind: 'curvePlot',
              // Même modèle que l'atelier « durée du jour » juste en dessous (j = numéro du jour
              // dans l'année, origine à l'équinoxe j = 80) : maximum en j = 80 + 365,24/4 ≈ 171,3,
              // minimum en j = 80 + 3 × 365,24/4 ≈ 353,9, équinoxe d'automne en j ≈ 262,6.
              curves: [{ fn: (j) => 12 + 4.5 * Math.sin((2 * Math.PI * (j - 80)) / 365.24), tone: 'accent' }],
              xMin: 0,
              xMax: 365,
              xTicks: [80, 171.31, 262.62, 353.93],
              xTickLabels: { [80]: '80', [171.31]: '171', [262.62]: '263', [353.93]: '354' },
              yTicks: [7.5, 12, 16.5],
              yTickLabels: { [7.5]: '7,5', [12]: '12', [16.5]: '16,5' },
              fixedYRange: { min: 4, max: 18 },
              horizontalAsymptotes: [{ y: 12 }],
              points: [
                { x: 80, y: 12, label: '', tone: 'accent' },
                { x: 171.31, y: 16.5, label: 'max : 16,5 h', tone: 'good', labelPos: 'above' },
                { x: 353.93, y: 7.5, label: 'min : 7,5 h', tone: 'bad', labelPos: 'left' },
              ],
              xAxisLabel: "jour de l'année (j)",
              yAxisLabel: 'durée du jour (h)',
              caption:
                "Un modèle réaliste pour la Belgique — le même que dans l'atelier ci-dessous, avec " +
                "A = 4,5 : $d(j) = 12 + 4{,}5\\sin\\left(\\dfrac{2\\pi(j-80)}{365{,}24}\\right)$, où " +
                "j est le numéro du jour dans l'année (j = 1 le 1er janvier). Amplitude 4,5 h autour " +
                "d'une moyenne de 12 h. Le décalage horizontal Φ = 80 place le jour moyen (12 h, " +
                "en montant) au 80e jour, l'équinoxe de printemps ; le maximum arrive un quart de " +
                "période plus tard (j ≈ 171, solstice d'été), le minimum trois quarts de période " +
                "plus tard (j ≈ 354, solstice d'hiver).",
            },
          ],
          text:
            "La durée du jour (le temps entre le lever et le coucher du soleil) varie de " +
            "façon périodique au fil de l'année — minimale au solstice d'hiver, maximale au " +
            "solstice d'été, avec une période d'environ 365,24 jours (une année). C'est un exemple parfait de fonction sinusoïdale en contexte, " +
            "construite selon la méthode de cette section. Le décalage vertical b vaut à peu " +
            "près 12 heures **à toutes les latitudes** : sur l'année, le jour dure en moyenne " +
            "autant que la nuit. C'est l'**amplitude** qui dépend de la latitude : presque " +
            "nulle à l'équateur (le jour y dure environ 12 h toute l'année), environ 4,5 h en " +
            "Belgique, et de plus en plus grande en s'approchant des pôles. Le déphasage, enfin, " +
            "se cale sur l'équinoxe de printemps (le 21 mars, 80e jour de l'année), où le jour " +
            "dure 12 h et s'allonge. Les " +
            "météorologues et les agriculteurs utilisent ce type de modèle pour prévoir les " +
            "heures d'ensoleillement plusieurs mois à l'avance.",
          domaines: ['Astronomie', 'Climat'],
        },
        {
          kind: 'atelier',
          tag: 'duree-jour-latitude-widget',
          label: 'Manipule toi-même : la durée du jour selon la latitude',
          caption:
            'Fais varier la latitude : la durée du jour au fil de l\'année est calculée avec ' +
            'la formule astronomique cos H₀ = −tan(latitude)·tan(δ), et comparée au même ' +
            'modèle que ci-dessus, 12 + A sin(2π(j − 80)/365,24), où j est le numéro du jour ' +
            'dans l\'année. Partout, b ≈ 12 h ; c\'est l\'amplitude A qui ' +
            'grandit avec la latitude, jusqu\'au jour et à la nuit polaires au-delà de ' +
            '66,5°.',
        },
        { kind: 'subheading', text: 'Résoudre une inéquation f(t) ≥ y₀ ou f(t) ≤ y₀' },
        {
          kind: 'para',
          text:
            'Une fois le modèle construit, une question fréquente est : **pendant combien de ' +
            'temps** la grandeur dépasse-t-elle (ou reste-t-elle sous) un seuil $y_0$ ? On résout ' +
            'alors $A\\sin(\\omega t+\\varphi)+b \\geq y_0$ avec la même démarche que pour une ' +
            'équation (section précédente) : isoler le sinus, lire la réponse sur le cercle — un ' +
            '**arc** cette fois, pas deux points — puis revenir à $t$.',
        },
        {
          kind: 'methode',
          label: 'Méthode — inéquation sinusoïdale',
          items: [
            'Pose $u = \\omega t + \\varphi$ et isole le sinus : $\\sin(u) \\geq m$ (ou ' +
              '$\\leq m$), avec $m = \\dfrac{y_0-b}{A}$ si $A > 0$ (si $A < 0$, le sens de ' +
              'l\'inégalité s\'inverse).',
            'Si $m > 1$ ou $m < -1$, l\'inéquation est toujours vraie ou toujours fausse : ' +
              'conclus directement.',
            'Sinon, lis l\'arc solution sur le cercle : $\\sin(u) \\geq m \\iff u \\in ' +
              '[\\arcsin(m)\\,;\\pi - \\arcsin(m)] + 2k\\pi$ (l\'arc du haut). Pour ' +
              '$\\sin(u) \\leq m$, c\'est l\'arc complémentaire : $u \\in [\\pi - \\arcsin(m)\\,;' +
              '2\\pi + \\arcsin(m)] + 2k\\pi$.',
            'Reviens à $t$ sur chaque borne : $t = \\dfrac{u - \\varphi}{\\omega}$ (avec ' +
              '$\\omega > 0$, l\'ordre des bornes est conservé).',
            'Liste les intervalles qui tombent dans la fenêtre demandée, en ajoutant ou ' +
              'retranchant des périodes $T$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'un arc, puis retour à t',
          formula:
            'Grande roue de l\'exemple résolu (départ au point bas) : pendant les 8 premières minutes, quand la nacelle est-elle à ' +
            'au moins 24,5 m du sol ? On résout $15\\sin\\left(\\dfrac{\\pi}{4}t - ' +
            '\\dfrac{\\pi}{2}\\right) + 17 \\geq 24{,}5$ pour $t \\in [0\\,;8]$.',
          steps: [
            { tag: 'isoler le sinus, avec u = πt/4 − π/2', text: '$\\sin(u) \\geq \\dfrac{24{,}5 - 17}{15} = \\dfrac{1}{2}$' },
            { tag: 'lire l\'arc du haut sur le cercle', text: '$u \\in \\left[\\dfrac{\\pi}{6}\\,;\\dfrac{5\\pi}{6}\\right] + 2k\\pi$' },
            { tag: 'revenir à t : t = (u + π/2) · 4/π', text: '$u = \\dfrac{\\pi}{6} \\implies t = \\dfrac{8}{3}$ ; $u = \\dfrac{5\\pi}{6} \\implies t = \\dfrac{16}{3}$' },
            { tag: 'garder ce qui tombe dans [0 ; 8]', text: 'avec $k = 0$ : $\\left[\\dfrac{8}{3}\\,;\\dfrac{16}{3}\\right]$ ; avec $k = \\pm 1$, on ajoute $\\pm 8$ min : hors de la fenêtre' },
          ],
          result: { tag: 'résultat — de 2 min 40 s à 5 min 20 s', text: '$t \\in \\left[\\dfrac{8}{3}\\,;\\dfrac{16}{3}\\right]$' },
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: PI / 6, label: 'u=π/6', tone: 'accent' },
              { angle: (5 * PI) / 6, label: 'u=5π/6', tone: 'accent' },
            ],
            connectPoints: true,
            // « sin u = 1/2 », à gauche du cercle, sortait du cadre : la valeur 1/2 est écrite
            // près de l'axe vertical, au-dessus de la droite.
            horizontalLine: { y: 0.5, label: '' },
            freeLabels: [{ x: -0.17, y: 0.58, text: '1/2', tone: 'accent' }],
            angleArcs: [{ from: PI / 6, to: (5 * PI) / 6, tone: 'good', radiusPx: 100 }],
            caption: 'sin(u) ≥ 1/2 : tout l\'arc du haut, entre u = π/6 et u = 5π/6 (en vert)',
          },
        },
        {
          kind: 'illustration',
          // h(8/3) = 15 sin(π/6) + 17 = 24,5 et h(16/3) = 15 sin(5π/6) + 17 = 24,5 ; maximum 32 en t = 4.
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => 15 * Math.sin((PI / 4) * t - PI / 2) + 17, tone: 'accent' }],
            shadedRegions: [
              { from: 8 / 3, to: 16 / 3, upper: (t) => 15 * Math.sin((PI / 4) * t - PI / 2) + 17, lower: () => 24.5, tone: 'good' },
            ],
            xMin: 0,
            xMax: 8,
            xTicks: [8 / 3, 4, 16 / 3, 8],
            xTickLabels: { [8 / 3]: '8/3', [4]: '4', [16 / 3]: '16/3', [8]: '8' },
            yTicks: [2, 17, 24.5, 32],
            yTickLabels: { [2]: '2', [17]: '17', [24.5]: '24,5', [32]: '32' },
            fixedYRange: { min: 0, max: 36 },
            horizontalAsymptotes: [{ y: 24.5 }],
            verticalAsymptotes: [{ x: 8 / 3 }, { x: 16 / 3 }],
            points: [
              { x: 8 / 3, y: 24.5, label: '', tone: 'good' },
              { x: 16 / 3, y: 24.5, label: '', tone: 'good' },
            ],
            xAxisLabel: 't (min)',
            yAxisLabel: 'hauteur (m)',
            caption:
              'la même inéquation lue sur la courbe : la hauteur dépasse 24,5 m (droite horizontale) ' +
              'exactement entre $t = \\dfrac{8}{3}$ et $t = \\dfrac{16}{3}$, la partie verte — l\'arc du cercle ' +
              'devient un intervalle de temps',
          },
        },
        {
          kind: 'atelier',
          tag: 'seuil-grande-roue-widget',
          label: 'Manipule toi-même : au-dessus du seuil sur la grande roue',
          caption:
            'Règle le seuil y₀ : l\'arc de la roue où la nacelle est au-dessus (ou ' +
            'au-dessous) du seuil s\'allume, et les intervalles de temps correspondants se ' +
            'colorent sur la courbe h(t) = 15 sin(πt/4 − π/2) + 17, sur deux tours. Le ' +
            'réglage de départ (y₀ = 24,5 m) reproduit l\'exemple : de 2 min 40 s à 5 min 20 ' +
            's, soit un tiers du tour.',
        },
        {
          kind: 'piege',
          text:
            'Pour $\\sin(u) \\leq m$, garder l\'arc $[\\arcsin(m)\\,;\\pi - \\arcsin(m)]$ : c\'est ' +
            'l\'arc où le sinus est le **plus grand**. Dessine toujours le cercle et la droite ' +
            'horizontale $y = m$ avant de choisir l\'arc.',
        },
        {
          kind: 'entrainement',
          title: 'Inéquations trigonométriques',
          generatorId: '5gen55',
          description: [
            'Résous dans [0 ; 2π[ une inéquation sin(ax + b) ou cos(ax + b) comparée à une valeur, parfois avec un coefficient à isoler (attention au sens quand il est négatif) : lis l\'arc solution sur le cercle, reviens à x en divisant aussi la période par a, puis écris les intervalles de la fenêtre avec leurs crochets.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 55. Inéquations trigonométriques »',
        },
        {
          kind: 'atelier',
          tag: 'modele-sinusoidal-widget',
          label: 'Manipule toi-même — construis le modèle pas à pas',
          caption:
            'Règle le rayon, la hauteur du centre, la période, puis la hauteur de départ h₀ ' +
            'et le sens de la nacelle. φ n\'est jamais réglé directement : sin φ = (h₀ − ' +
            'b)/A donne deux candidats, φ₁ = arcsin m et φ₂ = π − arcsin m, et c\'est le ' +
            'sens (montée ou descente) qui tranche. Le réglage de départ reproduit ' +
            'l\'exemple de la grande roue.',
        },
        {
          kind: 'historique',
          titre: "Le mathématicien qui a vu qu'on peut tout décomposer en sinusoïdes",
          image: {
            src: '/images/historique/fourier.jpg',
            alt: 'Portrait de Joseph Fourier',
            caption:
              'Joseph Fourier (1768–1830), gravure d\'après un portrait de Julien-Léopold ' +
              'Boilly, début du 19e siècle. Domaine public.',
          },
          text:
            'Pourquoi une sinusoïde, et pas une autre forme, pour modéliser un phénomène ' +
            'périodique ? Le mathématicien français **Joseph Fourier** répond à cette ' +
            'question en 1822, dans un mémoire sur la propagation de la chaleur : il ' +
            'affirme — et illustre sur de nombreux exemples, sans le démontrer en toute ' +
            'rigueur (la preuve viendra de **Dirichlet**, en 1829) — qu\'en combinant ' +
            'suffisamment de sinusoïdes de fréquences ' +
            "différentes, on peut reconstruire quasiment n'importe quel signal périodique, " +
            'même un signal qui ne ressemble pas du tout à une sinusoïde (un signal carré, ' +
            'un battement cardiaque, un son complexe). Ce résultat, aujourd\'hui appelé ' +
            'analyse de Fourier, explique pourquoi la sinusoïde est **le** bloc de construction ' +
            'fondamental de tous les phénomènes périodiques — la grande roue de cette ' +
            "section n'en est qu'un cas particulier, le plus simple possible : une seule " +
            'sinusoïde, sans combinaison.',
        },
        {
          kind: 'entrainement',
          title: 'Modéliser une fonction sinusoïdale en contexte',
          generatorId: '5gen13',
          description: [
            'Construis pas à pas le modèle complet A sin(ωt + φ) + b : à partir d\'une grande ' +
              'roue, d\'un maximum et d\'un minimum avec un point extremum, de deux points de ' +
              'la courbe ou de paramètres donnés. Utilise-le ensuite pour résoudre une équation ' +
              'f(t) = y₀, trouver des extremums ou résoudre une inéquation f(t) ≥ y₀.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 13. Modéliser une fonction sinusoïdale en contexte »',
        },
        {
          kind: 'entrainement',
          title: 'Détective d\'erreurs : trigonométrie',
          generatorId: '5gen50',
          description: [
            'La copie d\'un élève — aire d\'un secteur, maximum d\'une sinusoïde, équation ' +
              'sin(2x) = c ou cos(2x) = c, produit nul avec une tangente — contient une erreur : ' +
              'trouve la ligne fausse, nomme l\'erreur (π perdu, ½ oublié, degrés au lieu de ' +
              'radians, T = π/ω, φ pris pour Φ, seconde famille oubliée, 2kπ non divisé, valeur ' +
              'interdite de la tangente…), puis donne le bon résultat.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 50. Détective d\'erreurs : trigonométrie »',
        },
        {
          kind: 'entrainement',
          title: 'Modéliser des relevés réels par une sinusoïde',
          generatorId: '5gen57',
          description: [
            'Annuaire des marées d\'un port, durée du jour au fil de l\'année dans une ville ou ' +
              'températures moyennes de chaque mois : lis le maximum, le minimum et la période, ' +
              'construis le modèle A sin(ωt + φ) + b (φ par le maximum), puis prévois une valeur ' +
              'et calcule pendant combien de temps la grandeur dépasse un seuil.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 57. Modéliser des relevés réels par une sinusoïde »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Radians et secteur circulaire',
        formulas: [
          { text: '$\\text{angle}_{rad} = \\text{angle}_{deg} \\times \\dfrac{\\pi}{180}$' },
          { text: '$\\text{angle}_{deg} = \\text{angle}_{rad} \\times \\dfrac{180}{\\pi}$' },
          { text: '$s = r\\theta$', condition: "longueur d'arc — θ toujours en radians" },
          { text: '$A = \\dfrac{1}{2}r^2\\theta$', condition: 'aire du secteur — θ toujours en radians' },
          { text: '$\\theta = \\dfrac{s}{r}$', condition: "angle à partir de l'arc et du rayon" },
          { text: '$r = \\dfrac{2A}{s}$', condition: "rayon à partir de l'aire et de l'arc (car $A = \\frac{1}{2}r \\cdot s$)" },
          { text: '$r = \\sqrt{\\dfrac{2A}{\\theta}}$', condition: "rayon à partir de l'aire et de l'angle" },
        ],
      },
      {
        title: 'Polygone régulier et segment circulaire',
        formulas: [
          { text: '$\\theta = \\dfrac{2\\pi}{n}$', condition: "angle au centre d'un côté, polygone régulier à n côtés" },
          { text: '$s = k \\cdot \\dfrac{2\\pi r}{n}$', condition: 'arc qui couvre k côtés sur n' },
          { text: '$A = k \\cdot \\dfrac{\\pi r^2}{n}$', condition: 'secteur qui couvre k côtés sur n' },
          { text: '$A_{triangle} = \\dfrac{1}{2}r^2\\sin\\theta$', condition: 'triangle isocèle, deux côtés r, angle inclus θ' },
          { text: '$A_{segment} = \\dfrac{1}{2}r^2(\\theta - \\sin\\theta)$', condition: 'secteur moins triangle' },
          { text: '$c^2 = 2r^2(1-\\cos\\theta)$', condition: 'longueur de la corde — loi des cosinus' },
          { text: '$\\cos\\theta = 1 - \\dfrac{c^2}{2r^2}$', condition: 'angle au centre à partir de la corde c' },
          { text: '$A_{balayée} = \\dfrac{1}{2}\\theta(r_1^2 - r_2^2)$', condition: 'essuie-glace — différence de deux secteurs' },
          { text: '$A_{lentille} = A_{seg,1} + A_{seg,2}$', condition: 'chaque segment avec son rayon et son angle' },
        ],
      },
      {
        title: "Paramètres d'une sinusoïde",
        formulas: [
          { text: '$A = \\dfrac{max-min}{2} \\quad b = \\dfrac{max+min}{2}$' },
          { text: '$T = \\dfrac{2\\pi}{\\omega}$', condition: "jamais l'inverse de ω" },
          { text: '$\\text{fréquence} = \\dfrac{1}{T} = \\dfrac{\\omega}{2\\pi}$', condition: "nombre d'oscillations par unité de x" },
          { text: '$\\Phi = -\\dfrac{\\varphi}{\\omega}$', condition: 'décalage horizontal — à ne pas confondre avec le déphasage φ' },
          { text: '$\\varphi = -\\omega \\cdot x_0$', condition: 'lecture de φ à la traversée montante de la ligne moyenne en $x_0$ (A > 0)' },
          { text: '$\\varphi = \\dfrac{\\pi}{2} - \\omega x_{max}$', condition: 'lecture de φ par le maximum (A > 0)' },
          { text: '$\\varphi \\in \\, ]-\\pi\\,;\\pi]$', condition: 'ajoute ou retranche $2\\pi$ pour y ramener φ' },
        ],
      },
      {
        title: "Extremums d'une sinusoïde (u = ωx+φ)",
        formulas: [
          { text: '$max = b + |A|$, $\\ min = b - |A|$', condition: 'si $A < 0$, le maximum correspond à $\\sin(u) = -1$' },
          { text: '$\\sin(u) = 1$', condition: 'maximums seuls (A > 0) — période $2\\pi$ en u' },
          { text: '$\\sin(u) = -1$', condition: 'minimums seuls — période $2\\pi$ en u' },
          { text: '$|\\sin(u)| = 1 \\iff u = \\dfrac{\\pi}{2} + k\\pi$', condition: 'tous les extremums réunis — période $\\pi$ en u' },
          { text: '$\\cos(u) = 1 \\iff u = 2k\\pi$', condition: 'avec un cosinus : maximums seuls (A > 0)' },
          { text: '$\\cos(u) = -1 \\iff u = \\pi + 2k\\pi$', condition: 'avec un cosinus : minimums seuls (A > 0)' },
          { text: '$|\\cos(u)| = 1 \\iff u = k\\pi$', condition: 'avec un cosinus : tous les extremums réunis' },
        ],
      },
      {
        title: 'Équations trigonométriques',
        formulas: [
          { text: '$\\sin x = c \\Rightarrow x=\\alpha+2k\\pi$ ou $x=(\\pi-\\alpha)+2k\\pi$', condition: '$c$ : second membre ; $k \\in \\mathbb{Z}$' },
          { text: '$\\cos x = c \\Rightarrow x=\\alpha+2k\\pi$ ou $x=-\\alpha+2k\\pi$' },
          { text: '$\\tan x = c \\Rightarrow x=\\alpha+k\\pi$', condition: 'une seule famille de solutions' },
          { text: '$|c|>1$ (sin/cos) — aucune solution' },
          { text: '$A\\cdot B = 0 \\iff A = 0$ ou $B = 0$', condition: 'produit nul — réunion des solutions' },
          { text: '$\\sin^2 x + \\cos^2 x = 1$', condition: 'second degré : poser $t=\\cos x$ ou $t=\\sin x$, rejeter $|t|>1$' },
          { text: '$\\sin\\theta = \\cos\\left(\\frac{\\pi}{2}-\\theta\\right)$, $\\;-\\tan\\theta = \\tan(-\\theta)$', condition: 'égalité de deux expressions' },
          { text: '$\\tan u$ existe $\\iff u \\neq \\frac{\\pi}{2}+k\\pi$' },
        ],
      },
      {
        title: 'Inéquations sinusoïdales',
        formulas: [
          { text: '$\\arcsin m$', condition: 'l\'angle de $[-\\pi/2\\,;\\pi/2]$ dont le sinus vaut $m$' },
          { text: '$\\sin u \\geq m \\iff u \\in [\\arcsin m\\,;\\pi-\\arcsin m]+2k\\pi$', condition: 'arc du haut' },
          { text: '$\\sin u \\leq m \\iff u \\in [\\pi-\\arcsin m\\,;2\\pi+\\arcsin m]+2k\\pi$', condition: 'arc complémentaire' },
        ],
      },
      {
        title: 'Modéliser en contexte',
        formulas: [
          { text: '$\\omega = \\dfrac{2\\pi}{T}$', condition: 'T : durée d\'un cycle complet' },
          { text: '$\\omega t_0 + \\varphi = \\dfrac{\\pi}{2}$', condition: 'maximum atteint en $t_0$ ($-\\dfrac{\\pi}{2}$ pour un minimum), A > 0' },
          { text: '$\\sin\\varphi = m$ : $\\varphi = \\arcsin m$ ou $\\varphi = \\pi - \\arcsin m$', condition: 'départ hors d\'un extremum — le sens de variation tranche' },
          { text: '$\\omega t_i + \\varphi = \\alpha_i = \\arcsin\\left(\\dfrac{f_i - b}{A}\\right)$', condition: 'deux points $(t_1\\,;f_1)$, $(t_2\\,;f_2)$ sur une même montée' },
          { text: '$\\omega = \\dfrac{\\alpha_2 - \\alpha_1}{t_2 - t_1}$, $\\ \\varphi = \\alpha_1 - \\omega t_1$', condition: 'système à deux points — soustraire, puis remplacer' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Radian** — $\\text{angle}_{rad} = \\text{angle}_{deg} \\times \\pi/180$. Les ' +
        'formules $s=r\\theta$ et $A=\\frac{1}{2}r^2\\theta$ n\'utilisent que des radians ; ' +
        'à l\'envers, $\\theta = s/r$ et $r = 2A/s$.',
      '**Figures composées** — décompose en triangles et secteurs élémentaires. Additionne ' +
        'ou soustrais selon la figure. L\'angle d\'un polygone régulier vaut $2\\pi/n$ par côté, ' +
        'mais un secteur peut en couvrir plusieurs : $k$ côtés donnent $k \\cdot 2\\pi/n$.',
      '**Géométrie du cercle** — aire d\'un segment = aire du secteur − aire du triangle ' +
        '($\\frac{1}{2}r^2\\sin\\theta$). Loi des cosinus pour une corde : $c^2 = 2r^2(1-\\cos\\theta)$, ' +
        'et « à l\'envers » pour retrouver l\'angle. Essuie-glace : différence de deux secteurs ; ' +
        'lentille : somme de deux segments.',
      '**Paramètres d\'une sinusoïde** — $A=(max-min)/2$, $b=(max+min)/2$, $T=2\\pi/\\omega$ ' +
        '(jamais l\'inverse), fréquence $= 1/T$. Le déphasage φ, combiné à ω, décale la courbe ' +
        'horizontalement de $\\Phi = -\\varphi/\\omega$ — jamais de φ lui-même.',
      '**Lecture graphique** — max/min pour trouver A et b. Distance entre deux maximums ' +
        'pour T. Traversée montante de la ligne moyenne pour φ (en vérifiant le sens de variation), ' +
        'contrôlée par le maximum : $\\varphi = \\pi/2 - \\omega x_{max}$.',
      '**Extremums** — $\\sin(u)=1$ seul (période $2\\pi$, maximums) ≠ $\\sin(u)=\\pm 1$ réunis ' +
        '(période π, tous les extremums). Ne confonds jamais les deux formules. Valeurs : $b \\pm |A|$ ; si ' +
        '$A < 0$, le maximum correspond à $\\sin(u) = -1$.',
      '**Équations** $\\text{trig}(ax+b)=c$ — isole l\'argument, résous au cercle trigonométrique, ' +
        'divise tout (constante et période) par a, puis liste les solutions de la fenêtre ' +
        'demandée. $|c|>1$ pour sin/cos ⟹ aucune solution.',
      '**Autres équations** — produit nul : réunion des solutions de chaque facteur. Second ' +
        'degré en sin/cos : $\\sin^2+\\cos^2=1$, poser $t$, rejeter $|t|>1$. Égalité de deux ' +
        'expressions : convertir ($\\sin\\theta=\\cos(\\pi/2-\\theta)$), puis égaler les ' +
        'arguments. Avec une tangente, rejeter les valeurs où elle n\'existe pas.',
      '**Modéliser en contexte** — A et b à partir des extrêmes. T (donc ω) à partir de la ' +
        'durée d\'un cycle. φ en dernier, à partir d\'une condition initiale précise ; hors ' +
        'd\'un extremum, deux candidats, et le sens de variation tranche. À partir de deux ' +
        'points sur une même montée : $\\omega t_i + \\varphi = \\arcsin\\left(\\frac{f_i - b}{A}\\right)$, ' +
        'un système qu\'on résout en soustrayant les deux équations. Une ' +
        'inéquation $f(t)\\geq y_0$ se lit comme un arc du cercle, puis se ramène à $t$.',
    ],
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je bien converti tout angle en degrés vers les radians avant d\'utiliser $s=r\\theta$ ou $A=\\frac{1}{2}r^2\\theta$ ?',
        'Pour une sinusoïde : ai-je distingué la pulsation ω de la période T ($T=2\\pi/\\omega$, jamais l\'inverse) ? Et le déphasage φ du décalage horizontal Φ ?',
        'Pour une équation $\\text{trig}(ax+b)=c$ : ai-je divisé par a le terme constant et le terme périodique en $2k\\pi$ ?',
        'Pour une équation en $t = \\cos x$ ou $t = \\sin x$, ai-je rejeté les racines hors de [−1 ; 1] ? Avec une tangente, ai-je écarté les valeurs où elle n\'existe pas ?',
        'Pour des extremums : la question porte-t-elle sur les maximums seuls, les minimums seuls, ou tous les extremums réunis — et ai-je pris la bonne période ($2\\pi/\\omega$ ou $\\pi/\\omega$) ?',
      ],
    },
    forward:
      'En 6e, tu retrouveras arcsin, arccos et arctan — déjà utilisés ici comme touches de ' +
      'calculatrice — étudiés comme de vraies fonctions (les fonctions cyclométriques), ainsi ' +
      'que les dérivées de sinus et de cosinus, qui expliquent pourquoi une sinusoïde change ' +
      'de sens exactement à ses extremums.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen40',
      description: [
        '7 thèmes de 35 affirmations chacun (radians, arcs et polygones ; paramètres d\'une ' +
          'sinusoïde ; lecture graphique ; extremums ; équations trigonométriques ; produit nul, ' +
          'substitution et égalité de deux expressions ; géométrie du cercle et modélisation) — ' +
          'choisis un thème, réponds vrai ou faux, la justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 40. Trigonométrie — quiz vrai/faux »',
    },
  },
}
