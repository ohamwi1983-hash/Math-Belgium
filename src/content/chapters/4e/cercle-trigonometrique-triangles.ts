import type { ChapterContent } from '../../types'

const D2R = Math.PI / 180

export const cercleTrigonometriqueTriangles: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 5,
  title: 'Cercle trigonométrique & triangles quelconques',
  slug: 'cercle-trigonometrique-triangles',
  lede:
    "Dans ce chapitre, tu vas d'abord apprendre à parler de n'importe quel angle. Même " +
    "au-delà de 90° ! Pour ça, tu vas utiliser le **cercle trigonométrique** : le cercle qui " +
    "sert à définir sinus et cosinus pour tout angle. Ensuite, tu vas résoudre des triangles " +
    "quelconques — des triangles qui ne sont ni rectangles ni isocèles. Les triangles " +
    "rectangles ne suffisent pas pour ça.",

  intro: {
    title: 'Avant de commencer : pourquoi un cercle ?',
    blocks: [
      { kind: 'video', title: 'Avant de commencer : pourquoi un cercle ?', youtubeId: 'BEENBO9yI2s' },
      {
        kind: 'para',
        text:
          'Dans un triangle rectangle, sinus et cosinus n\'existent que pour des angles ' +
          '**entre 0° et 90°**. Ça pose problème : $\\sin(150°)$ ou $\\cos(215°)$ n\'ont alors ' +
          'aucun sens ! Le **cercle trigonométrique** résout ce problème. Il redéfinit sinus et ' +
          'cosinus comme de simples **coordonnées**. Grâce à lui, sinus et cosinus ont un sens ' +
          'pour **n\'importe quel angle**.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — le cercle trigonométrique',
        items: [
          'C\'est le cercle de **rayon 1**, centré à l\'origine d\'un repère. Un angle θ se ' +
            'place en partant de l\'axe horizontal positif. On tourne dans le **sens direct** ' +
            '(le sens inverse des aiguilles d\'une montre). On arrive alors sur un point du ' +
            'cercle, noté M(θ). Par définition, M(θ) a pour coordonnées (cos θ ; sin θ).',
          'Dans ce chapitre, on travaille toujours en **degrés** (les radians arrivent en 5e). ' +
            'On réduit toujours un angle à l\'intervalle [0° ; 360°[.',
          'Un angle **négatif** se place en tournant dans l\'autre sens, celui des aiguilles d\'une ' +
            'montre : −120° arrive au même point que 240°. Un angle **plus grand que 360°** fait ' +
            'plus d\'un tour : 430° arrive au même point que 70°.',
          'Un angle avec ce sens de rotation s\'appelle un **angle orienté**. C\'est différent ' +
            'd\'un angle géométrique ordinaire : celui-là n\'est qu\'une mesure, sans direction. ' +
            'Sur tous les schémas de ce chapitre, la **flèche** sur l\'arc d\'un angle montre ce ' +
            'sens direct.',
        ],
      },
      {
        kind: 'rappel',
        label: 'Rappel — que devient M(θ) tout près des axes ?',
        items: [
          'Dans le quadrant I, regarde ce qui se passe près des axes. Quand θ se rapproche de ' +
            '0°, le point M(θ) se rapproche de l\'axe horizontal : son cosinus se rapproche de ' +
            '1, son sinus se rapproche de 0. Quand θ se rapproche de 90°, c\'est l\'inverse : ' +
            'M(θ) se rapproche de l\'axe vertical, son cosinus se rapproche de 0, son sinus se ' +
            'rapproche de 1. Retiens ça : ça t\'aide à retrouver de tête le sens d\'une valeur ' +
            'remarquable, sans recalculer (section 3).',
        ],
      },
    ],
  },

  sections: [
    {
      id: 'cercle',
      number: 1,
      title: 'Le cercle trigonométrique : placer et lire un angle',
      kicker: "trouve le quadrant, le signe, et l'angle du premier quadrant",
      blocks: [
        { kind: 'video', title: 'Placer et lire un angle : quadrants, signes, angle du premier quadrant, tangente', youtubeId: '15kSJpPlfhs' },
        {
          kind: 'para',
          text:
            'Le cercle est découpé en **4 quadrants** par les deux axes. Le quadrant où tombe θ ' +
            'donne à lui seul le **signe** de son sinus, de son cosinus et de sa tangente. Ça, ' +
            'tu le sais avant même de calculer quoi que ce soit !',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            showQuadrants: true,
            points: [{ angle: 150 * D2R, label: 'M(θ)', tone: 'accent' }],
            projectToXAxis: true,
            projectToYAxis: true,
            angleArcs: [
              { from: 0, to: 150 * D2R, tone: 'accent', radiusPx: 42, arrow: true, label: 'θ' },
              { from: 150 * D2R, to: 180 * D2R, tone: 'good', radiusPx: 26, label: 'réf=30°' },
            ],
            freeLabels: [
              { x: Math.cos(150 * D2R), y: -0.1, text: 'cos θ' },
              { x: -0.14, y: Math.sin(150 * D2R), text: 'sin θ' },
            ],
            caption:
              'θ = 150° est dans le quadrant II. Son angle du premier quadrant (l’angle de ' +
              'référence) vaut 180° − 150° = 30°.',
          },
        },
        {
          kind: 'historique',
          titre: 'L\'invention du sinus — un demi-accord, pas un angle',
          text:
            'Les astronomes grecs calculaient déjà avec des **cordes** (la longueur d\'un ' +
            'segment reliant deux points d\'un cercle) plutôt qu\'avec des sinus. C\'est ' +
            'l\'astronome et mathématicien indien **Âryabhata**, vers 500, qui introduit dans ' +
            'son traité Âryabhatiya la notion de jyā (littéralement « corde d\'arc », à ' +
            'l\'origine du mot « sinus » après plusieurs traductions successives, en arabe ' +
            'puis en latin) — essentiellement la **moitié** d\'une corde, c\'est-à-dire ' +
            'exactement le sin θ que tu lis aujourd\'hui comme une coordonnée sur le cercle ' +
            'trigonométrique. Il calcule aussi des tables de sinus avec une précision ' +
            'remarquable pour l\'époque, sans aucun instrument de calcul.',
          image: {
            src: '/images/historique/aryabhata.jpg',
            alt: 'Statue d\'Âryabhata',
            caption:
              'Statue d\'Âryabhata, Institut inter-universitaire d\'astronomie et ' +
              'd\'astrophysique (IUCAA), Pune, Inde. Domaine public.',
          },
        },
        {
          kind: 'definition',
          label: 'La tangente d\'un angle',
          items: [
            'Pour tout angle θ tel que $\\cos\\theta \\neq 0$ (donc sauf 90° et 270°), on définit ' +
              '$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$. Son signe est celui d\'un quotient : ' +
              '**+** si sin θ et cos θ ont le même signe, **−** sinon.',
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Le signe de sin θ, cos θ et tan θ selon le quadrant',
          headers: ['Quadrant', 'sin θ', 'cos θ', 'tan θ'],
          rows: [
            ['I — ]0° ; 90°[', '+', '+', '+'],
            ['II — ]90° ; 180°[', '+', '−', '−'],
            ['III — ]180° ; 270°[', '−', '−', '+'],
            ['IV — ]270° ; 360°[', '−', '+', '−'],
          ],
        },
        {
          kind: 'piege',
          label: 'Les angles « sur les axes »',
          text:
            '0°, 90°, 180° et 270° n\'appartiennent à **aucun** quadrant ! Ils sont sur la ' +
            'frontière entre deux quadrants. Demander leur signe n\'a donc pas de sens : il ' +
            'faut donner leur valeur exacte directement (sin 90° = 1, cos 180° = −1, …).',
        },
        {
          kind: 'methode',
          label: 'Trouver l\'angle du premier quadrant',
          items: [
            'C\'est l\'angle aigu que fait OM(θ) avec l\'axe horizontal. La formule dépend ' +
              'seulement du quadrant :',
            'Quadrant I — θ lui-même.',
            'Quadrant II — 180° − θ',
            'Quadrant III — θ − 180°',
            'Quadrant IV — 360° − θ',
          ],
        },
        {
          kind: 'exemple',
          badge: 'réduire puis situer',
          formula: 'Angle donné : 430°.',
          steps: [
            { tag: 'réduire dans [0°;360°[', text: '430° − 360° = 70°' },
            { tag: 'quadrant', text: '70° ∈ ]0° ; 90°[ → quadrant I' },
          ],
          result: { tag: 'résultat', text: 'angle réduit = 70°, quadrant I, angle du premier quadrant = 70° (déjà dans le premier quadrant), sin/cos/tan tous positifs' },
        },
        {
          kind: 'exemple',
          badge: 'angle négatif',
          formula: 'Angle donné : −120°.',
          steps: [
            { tag: 'réduire dans [0°;360°[', text: '−120° + 360° = 240°' },
            { tag: 'quadrant', text: '240° ∈ ]180° ; 270°[ → quadrant III' },
            { tag: 'angle du premier quadrant', text: '240° − 180° = 60°' },
          ],
          result: { tag: 'résultat', text: 'angle réduit = 240°, quadrant III, angle du premier quadrant = 60°, sin et cos négatifs, tan positive' },
        },
        {
          kind: 'exemple',
          badge: 'plus d\'un tour',
          formula: 'Angle donné : 1000°.',
          steps: [
            { tag: 'retirer des tours complets', text: '1000° − 2 × 360° = 1000° − 720° = 280°' },
            { tag: 'quadrant', text: '280° ∈ ]270° ; 360°[ → quadrant IV' },
            { tag: 'angle du premier quadrant', text: '360° − 280° = 80°' },
          ],
          result: { tag: 'résultat', text: 'angle réduit = 280°, quadrant IV, angle du premier quadrant = 80°, cos positif, sin et tan négatifs' },
        },
        {
          kind: 'atelier',
          tag: 'cercle-explorateur-widget',
          label: 'Manipule toi-même : explore le cercle',
          caption:
            'Choisis n\'importe quel angle, même négatif ou au-delà de 360° : la spirale ' +
            'compte les tours, et le panneau donne l\'angle réduit, le quadrant, l\'angle du ' +
            'premier quadrant et les signes de sin, cos et tan. Coche la tangente pour lire ' +
            'tan θ comme une longueur. En mode Défi, trouve le quadrant et les trois signes ' +
            'du premier coup.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — représenter tan θ sur le cercle' },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ça',
          text:
            'Tu as déjà rencontré tan θ dans un triangle rectangle, comme opposé/adjacent — ' +
            'sans aucun lien avec un cercle. Ici, c\'est exactement la même valeur, mais lue ' +
            'autrement : plus une coordonnée, mais une **longueur**, ailleurs sur la figure. Le ' +
            'mot « tangente » vient d\'ailleurs de cette construction : la droite qui touche ' +
            '(« tangente ») le cercle en un seul point.',
        },
        {
          kind: 'para',
          text:
            'sin θ et cos θ se lisent directement comme des **coordonnées** de M(θ). tan θ, ' +
            'c\'est différent : il se lit comme une **longueur**, ailleurs sur la figure. Trace ' +
            'la droite verticale **tangente** au cercle, au point (1 ; 0). Prolonge le rayon ' +
            'OM(θ) : il coupe cette tangente en un point P(1 ; tan θ). La distance entre P et ' +
            'l\'axe horizontal vaut exactement tan θ.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [{ angle: 45 * D2R, label: 'M', tone: 'accent' }],
            angleArcs: [{ from: 0, to: 45 * D2R, tone: 'accent', radiusPx: 22, arrow: true, label: 'α' }],
            tangentConstruction: { angle: 45 * D2R, label: 'tan α' },
            freeLabels: [
              { x: 1, y: -0.09, text: '1' },
              { x: -0.1, y: -0.1, text: 'O' },
              { x: Math.cos(45 * D2R), y: -0.1, text: 'A' },
              { x: 0.9, y: 1.02, text: 'P' },
            ],
            caption:
              'α = 45° : OA = cos 45° et AM = sin 45° sont les coordonnées de M. AP = tan 45° ' +
              '= 1 se lit comme une longueur, sur la tangente verticale au cercle.',
          },
        },
        {
          kind: 'astuce',
          text:
            'Cette construction montre, sans aucun calcul, deux faits que tu connais déjà. ' +
            'D\'abord, tan θ grandit sans limite quand θ se rapproche de 90° : le point P ' +
            's\'échappe vers le haut de la figure. Ensuite, tan θ n\'est **pas définie** en ' +
            '90° ! Le rayon OM devient parallèle à la tangente : il ne la coupe plus jamais.',
        },
        {
          kind: 'entrainement',
          title: 'Placement et lecture sur le cercle trigonométrique',
          generatorId: 'gen14',
          description: [
            'Réduis un angle dans [0°;360°[. Situe-le dans son quadrant. Trouve son angle du ' +
              'premier quadrant, puis les signes de sin, cos et tan.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 14. Placement et lecture sur le cercle trigonométrique »',
        },
      ],
    },
    {
      id: 'identite',
      number: 2,
      title: 'L\'identité fondamentale : retrouver sin ou cos',
      kicker: 'cos²θ + sin²θ = 1, un Pythagore caché',
      blocks: [
        { kind: 'video', title: 'Identité fondamentale cos²θ + sin²θ = 1 — retrouver sin ou cos', youtubeId: 'OvQSK4L46dE' },
        {
          kind: 'para',
          text:
            'Le point M(θ) = (cos θ ; sin θ) est, par définition, sur le cercle de rayon 1. ' +
            'Regarde le triangle rectangle formé par O, M et le pied de sa projection sur ' +
            'l\'axe horizontal. Il donne directement Pythagore.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [{ angle: 55 * D2R, label: 'M', tone: 'accent' }],
            projectToXAxis: true,
            rightAngleMarkers: [{ x: Math.cos(55 * D2R), y: 0 }],
            angleArcs: [{ from: 0, to: 55 * D2R, tone: 'accent', radiusPx: 30, arrow: true, label: 'θ' }],
            freeLabels: [
              { x: -0.08, y: -0.1, text: 'O' },
              { x: Math.cos(55 * D2R) + 0.1, y: -0.1, text: 'P' },
              { x: Math.cos(55 * D2R) / 2, y: -0.11, text: 'cos θ' },
              { x: Math.cos(55 * D2R) + 0.14, y: Math.sin(55 * D2R) / 2, text: 'sin θ' },
            ],
            caption:
              'OP² + PM² = OM² devient cos²θ + sin²θ = 1². C\'est vrai pour tout angle θ, dans ' +
              'n\'importe quel quadrant.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Formule',
          blocks: [
            { kind: 'para', text: '$\\cos^2\\theta + \\sin^2\\theta = 1$' },
            {
              kind: 'para',
              text:
                'Tu connais l\'un des deux (sin θ ou cos θ) ? Tu peux retrouver l\'autre. Il ' +
                'reste juste un signe à trancher, grâce au quadrant.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Que veut dire cos²θ ?',
          text:
            '$\\cos^2\\theta$ est une écriture abrégée de $(\\cos\\theta)^2$ : on calcule d\'abord ' +
            'cos θ, puis on élève au carré. Ce n\'est **pas** $\\cos(\\theta^2)$, le cosinus de ' +
            'l\'angle élevé au carré.',
        },
        {
          kind: 'methode',
          items: [
            'Isole le terme cherché : $\\cos^2\\theta = 1-\\sin^2\\theta$ (ou l\'inverse).',
            'Prends la racine carrée : $\\cos\\theta = \\pm\\sqrt{1-\\sin^2\\theta}$. Attention : **deux** valeurs sont possibles à ce stade !',
            'Tranche le signe grâce au quadrant (ou à l\'intervalle) donné dans l\'énoncé pour θ.',
            'Si besoin, déduis-en $\\tan\\theta = \\sin\\theta/\\cos\\theta$.',
          ],
        },
        {
          kind: 'piege',
          label: 'Oublier le ±',
          text:
            'Une racine carrée donne toujours deux signes possibles. Si tu réponds directement ' +
            '$\\cos\\theta = \\sqrt{1-\\sin^2\\theta}$ (sans le ±, sans vérifier le quadrant), ' +
            'tu supposes en fait — sans le dire — que θ est dans un quadrant où cos θ est ' +
            'positif. C\'est faux une fois sur deux !',
        },
        {
          kind: 'exemple',
          badge: 'sin θ = 3/5, θ ∈ ]90° ; 180°[',
          steps: [
            { tag: 'quadrant de θ', text: ']90°;180°[ → quadrant II → cos négatif' },
            { tag: 'isoler cos²θ', text: 'cos²θ = 1 − (3/5)² = 1 − 9/25 = 16/25' },
            { tag: 'racine, signe imposé par le quadrant', text: 'cos θ = −√(16/25) = −4/5' },
            { tag: 'tan θ', text: 'tan θ = sin θ / cos θ = (3/5) / (−4/5) = −3/4' },
          ],
          result: { tag: 'résultat', text: 'cos θ = −4/5, tan θ = −3/4' },
        },
        {
          kind: 'atelier',
          tag: 'identite-signe-widget',
          label: 'Manipule toi-même : le piège du ±',
          caption:
            'Choisis la valeur connue (sin θ ou cos θ), puis le quadrant : l\'identité cos²θ ' +
            '+ sin²θ = 1 donne toujours deux candidats ±, et seul le quadrant permet de ' +
            'garder le bon. Le triangle rectangle OPM, d\'hypoténuse 1, montre d\'où vient la ' +
            'formule. Les boutons donnent des valeurs exactes, et le réglage de départ ' +
            'reproduit le premier exemple (sin θ = 3/5, quadrant II).',
        },
        {
          kind: 'exemple',
          badge: 'cos θ = −1/3, θ ∈ ]180° ; 270°[',
          steps: [
            { tag: 'quadrant de θ', text: ']180°;270°[ → quadrant III → sin négatif' },
            { tag: 'isoler sin²θ', text: '$\\sin^2\\theta = 1 - \\left(-\\dfrac{1}{3}\\right)^2 = 1 - \\dfrac{1}{9} = \\dfrac{8}{9}$' },
            { tag: 'racine, signe imposé par le quadrant', text: '$\\sin\\theta = -\\sqrt{\\dfrac{8}{9}} = -\\dfrac{2\\sqrt{2}}{3}$' },
            { tag: 'tan θ', text: '$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} = \\dfrac{-2\\sqrt{2}/3}{-1/3} = 2\\sqrt{2}$' },
          ],
          result: { tag: 'résultat', text: '$\\sin\\theta = -\\dfrac{2\\sqrt{2}}{3}$ et $\\tan\\theta = 2\\sqrt{2}$' },
        },
        { kind: 'subheading', text: 'Pour aller plus loin — partir de tan θ' },
        {
          kind: 'para',
          text:
            'Divise l\'identité fondamentale par $\\cos^2\\theta$ (non nul) : ' +
            '$1 + \\tan^2\\theta = \\dfrac{1}{\\cos^2\\theta}$. Connaissant tan θ, tu obtiens donc ' +
            '$\\cos^2\\theta$, puis cos θ (signe tranché par le quadrant), puis sin θ = tan θ · cos θ.',
        },
        {
          kind: 'exemple',
          badge: 'à partir de tan θ = 2, θ ∈ ]180° ; 270°[',
          steps: [
            { tag: 'cos²θ', text: '$\\dfrac{1}{\\cos^2\\theta} = 1 + 2^2 = 5$, donc $\\cos^2\\theta = \\dfrac{1}{5}$' },
            { tag: 'quadrant III → cos négatif', text: '$\\cos\\theta = -\\dfrac{1}{\\sqrt{5}} = -\\dfrac{\\sqrt{5}}{5}$' },
            { tag: 'sin θ = tan θ · cos θ', text: '$\\sin\\theta = 2 \\cdot \\left(-\\dfrac{\\sqrt{5}}{5}\\right) = -\\dfrac{2\\sqrt{5}}{5}$' },
          ],
          result: { tag: 'résultat', text: '$\\cos\\theta = -\\dfrac{\\sqrt{5}}{5}$ et $\\sin\\theta = -\\dfrac{2\\sqrt{5}}{5}$ (les deux négatifs, cohérent avec le quadrant III)' },
        },
        {
          kind: 'entrainement',
          title: 'L\'un sans l\'autre',
          generatorId: 'gen16',
          description: [
            'Tu connais sin θ ou cos θ ? Retrouve l\'autre, à partir d\'un intervalle donné ' +
              'pour θ. Puis calcule tan θ.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 16. L\'un sans l\'autre »',
        },
      ],
    },
    {
      id: 'remarquables',
      number: 3,
      title: 'Les valeurs remarquables',
      kicker: 'les 5 valeurs à connaître par cœur, puis comment les étendre par symétrie',
      blocks: [
        { kind: 'video', title: 'Valeurs remarquables de sin, cos, tan — 0°, 30°, 45°, 60°, 90° et leur extension', youtubeId: 'dQbD98E-ooQ' },
        {
          kind: 'para',
          text:
            'Cinq angles entre 0° et 90° ont des valeurs de sinus, cosinus et tangente ' +
            '**exactes** — pas d\'arrondi ! Ils reviennent tout le temps. Apprends-les par cœur.',
        },
        { kind: 'subheading', text: 'Démonstration — d\'où viennent ces valeurs ?' },
        {
          kind: 'para',
          text:
            'Ces 5 valeurs ne s\'apprennent pas « par magie ». Tu peux les retrouver en ' +
            'quelques lignes, à partir de deux triangles classiques. Les deux se résolvent par ' +
            'Pythagore.',
        },
        {
          kind: 'para',
          text:
            '**45°, à partir d\'un triangle rectangle isocèle.** Les deux côtés de l\'angle ' +
            'droit valent 1. Par Pythagore, l\'hypoténuse vaut $\\sqrt{1^2+1^2}=\\sqrt{2}$. Le ' +
            'triangle est isocèle, et la somme des angles fait 180° : les deux autres angles ' +
            'valent donc forcément 45° chacun.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'rightTriangle',
            legs: { horizontal: 1, vertical: 1 },
            sideLabels: { horizontal: '1', vertical: '1', hypotenuse: '√2' },
            angleLabels: { atLeft: '45°', atRight: '45°' },
            caption:
              'triangle rectangle isocèle, côtés 1 et 1, hypoténuse √2 : sin 45° = cos 45° = ' +
              '1/√2 = √2/2',
          },
        },
        {
          kind: 'exemple',
          badge: 'triangle rectangle isocèle — 45°',
          steps: [
            { tag: 'sin 45°', text: 'opposé/hypoténuse = 1/√2 = √2/2' },
            { tag: 'cos 45°', text: 'adjacent/hypoténuse = 1/√2 = √2/2 (les deux côtés sont égaux)' },
          ],
          result: { tag: 'tan 45°', text: 'sin 45°/cos 45° = 1' },
        },
        {
          kind: 'para',
          text:
            '**30° et 60°, à partir d\'un triangle équilatéral coupé en deux.** Un triangle ' +
            'équilatéral de côté 2 a 3 angles de 60°. Trace sa hauteur depuis un sommet : elle ' +
            'coupe le côté opposé en son milieu, et partage le triangle en 2 triangles ' +
            'rectangles identiques. Par Pythagore, cette hauteur vaut $\\sqrt{2^2-1^2}=\\sqrt{3}$.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'rightTriangle',
            legs: { horizontal: 1, vertical: Math.sqrt(3) },
            sideLabels: { horizontal: '1', vertical: '√3', hypotenuse: '2' },
            angleLabels: { atLeft: '60°', atRight: '30°' },
            caption:
              'moitié d\'un triangle équilatéral de côté 2 : demi-base 1, hauteur √3, ' +
              'hypoténuse 2 (le côté d\'origine)',
          },
        },
        {
          kind: 'exemple',
          badge: 'demi-triangle équilatéral — 30° et 60°',
          steps: [{ tag: 'à l\'angle de 60°', text: 'sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3' }],
          result: { tag: 'à l\'angle de 30°', text: 'sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3 = √3/3' },
        },
        {
          kind: 'para',
          text:
            'Restent 0° et 90°. Pas besoin de triangle ici : M(θ) est alors exactement sur un ' +
            'axe (rappel, section 1). Donc cos 0° = 1 et sin 0° = 0 ; cos 90° = 0 et sin 90° = 1.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [0, 30, 45, 60, 90].map((d) => ({ angle: d * D2R, label: `${d}°`, tone: 'accent' as const })),
            angleArcs: [{ from: 0, to: 90 * D2R, tone: 'accent', radiusPx: 100 }],
            caption: 'les 5 angles remarquables entre 0° et 90°, tous sur le cercle de rayon 1',
          },
        },
        {
          kind: 'featureTable',
          caption: 'Les valeurs exactes à connaître',
          headers: ['θ', '0°', '30°', '45°', '60°', '90°'],
          rows: [
            ['sin θ', '0', '1/2', '√2/2', '√3/2', '1'],
            ['cos θ', '1', '√3/2', '√2/2', '1/2', '0'],
            ['tan θ', '0', '√3/3', '1', '√3', 'indéfinie'],
          ],
        },
        {
          kind: 'astuce',
          label: 'Retenir les 5 sinus dans l\'ordre',
          text:
            'Les 5 valeurs de sin θ (de 0° à 90°) suivent un motif régulier : ' +
            '$\\sqrt{0}/2, \\sqrt{1}/2, \\sqrt{2}/2, \\sqrt{3}/2, \\sqrt{4}/2$. Ça se simplifie ' +
            'en $0, 1/2, \\sqrt{2}/2, \\sqrt{3}/2, 1$. Le nombre sous la racine augmente juste ' +
            'de 1 à chaque angle. Et les cosinus ? Ce sont exactement les mêmes 5 valeurs, mais ' +
            'lues dans l\'ordre inverse (cos 0° = sin 90°, cos 30° = sin 60°, …). Un seul motif ' +
            'à retenir pour les deux lignes du tableau !',
        },
        {
          kind: 'methode',
          label: 'Étendre aux 3 autres quadrants',
          items: [
            'Une valeur remarquable hors du premier quadrant se retrouve en 2 étapes. D\'abord, ' +
              'cherche son **angle du premier quadrant** (section 1) et lis sa valeur dans le ' +
              'tableau ci-dessus. Ensuite, applique-lui le **signe** du quadrant de départ ' +
              '(tableau de signes, section 1).',
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les angles sur les axes — valeurs lues directement sur le cercle',
          headers: ['θ', '0°', '90°', '180°', '270°'],
          rows: [
            ['sin θ', '0', '1', '0', '−1'],
            ['cos θ', '1', '0', '−1', '0'],
            ['tan θ', '0', 'indéfinie', '0', 'indéfinie'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'quadrant III',
          steps: [
            { tag: 'quadrant de 210°', text: '210° ∈ ]180° ; 270°[ → quadrant III' },
            { tag: 'angle du premier quadrant', text: '210° − 180° = 30°' },
            { tag: 'valeur en 30°', text: 'cos 30° = √3/2' },
            { tag: 'signe en quadrant III', text: 'cos négatif en quadrant III' },
          ],
          result: { tag: 'résultat', text: 'cos 210° = −√3/2' },
        },
        {
          kind: 'exemple',
          badge: 'quadrants II et IV',
          formula: 'Calcule la valeur exacte de tan 150° et de sin 315°.',
          steps: [
            { tag: 'tan 150°', text: 'quadrant II, angle du premier quadrant 180° − 150° = 30°, tan 30° = √3/3, tan négative en quadrant II' },
            { tag: 'sin 315°', text: 'quadrant IV, angle du premier quadrant 360° − 315° = 45°, sin 45° = √2/2, sin négatif en quadrant IV' },
          ],
          result: { tag: 'résultat', text: 'tan 150° = −√3/3 — sin 315° = −√2/2' },
        },
        {
          kind: 'atelier',
          tag: 'valeurs-remarquables-widget',
          label: 'Manipule toi-même : la famille d\'un angle',
          caption:
            'Choisis un angle de référence : ses quatre « cousins » (30°, 150°, 210°, ' +
            '330°…) ont des sinus, cosinus et tangentes de même valeur absolue — seul le ' +
            'signe change, selon le quadrant. En mode Défi, retrouve la valeur exacte d\'un ' +
            'des 16 angles remarquables, en un seul essai.',
        },
        {
          kind: 'entrainement',
          title: 'Valeurs remarquables',
          generatorId: 'gen15',
          description: [
            'Donne sin, cos ou tan d\'un angle remarquable (0°, 30°, 45°, 60°, 90° et leurs ' +
              'symétriques), dans n\'importe quel quadrant.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 15. Valeurs remarquables »',
        },
      ],
    },
    {
      id: 'associes',
      number: 4,
      title: 'Les angles associés',
      kicker: '4 symétries autour de θ, pour ne jamais recalculer une valeur',
      blocks: [
        { kind: 'video', title: 'Angles associés — 90°−θ, 180°−θ, 180°+θ, −θ', youtubeId: '0UBfwtqxi6k' },
        {
          kind: 'para',
          text:
            'Certains angles se déduisent d\'un angle θ déjà connu, par une simple **symétrie** ' +
            'sur le cercle. Pas besoin de tout recalculer ! Il suffit de connaître la règle de ' +
            'transformation de chaque symétrie.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: 35 * D2R, label: 'θ', tone: 'accent' },
              { angle: 55 * D2R, label: '90°−θ', tone: 'good', dashed: true },
              { angle: 145 * D2R, label: '180°−θ', tone: 'bad', dashed: true },
              { angle: 215 * D2R, label: '180°+θ', tone: 'bad', dashed: true },
              { angle: -35 * D2R, label: '−θ', tone: 'good', dashed: true },
            ],
            angleArcs: [{ from: 0, to: 35 * D2R, tone: 'accent', radiusPx: 30, arrow: true }],
            caption: 'les 4 angles associés à θ, chacun obtenu par une symétrie précise du point M(θ) sur le cercle',
          },
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text:
            'Chaque angle associé est un reflet de M(θ) dans un miroir placé à un endroit ' +
            'précis du cercle. 180°−θ : miroir vertical (l\'axe des sinus). −θ : miroir ' +
            'horizontal (l\'axe des cosinus). 180°+θ : reflet à travers le centre O, de l\'autre ' +
            'côté du cercle. 90°−θ : miroir selon la diagonale qui échange les deux axes — ' +
            'c\'est justement pour ça que sinus et cosinus s\'échangent dans cette seule famille.',
        },
        {
          kind: 'featureTable',
          caption: 'Les 4 règles de transformation',
          headers: ['Famille', 'sin', 'cos', 'tan'],
          rows: [
            ['Complémentaire — 90°−θ', 'sin(90°−θ) = cos θ', 'cos(90°−θ) = sin θ', 'tan(90°−θ) = 1/tan θ'],
            ['Supplémentaire — 180°−θ', 'sin(180°−θ) = sin θ', 'cos(180°−θ) = −cos θ', 'tan(180°−θ) = −tan θ'],
            ['Anti-supplémentaire — 180°+θ', 'sin(180°+θ) = −sin θ', 'cos(180°+θ) = −cos θ', 'tan(180°+θ) = tan θ'],
            ['Opposé — −θ', 'sin(−θ) = −sin θ', 'cos(−θ) = cos θ', 'tan(−θ) = −tan θ'],
          ],
        },
        {
          kind: 'rappel',
          label: '360° − θ, c\'est −θ',
          items: [
            '360° − θ et −θ arrivent exactement au même point du cercle (ils diffèrent d\'un tour ' +
              'complet). Ils suivent donc les règles de la famille « opposé » : ' +
              '$\\sin(360°-\\theta) = -\\sin\\theta$, $\\cos(360°-\\theta) = \\cos\\theta$. C\'est ' +
              'cette écriture qu\'on rencontre dans les équations de la section suivante.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà (3e)',
          text:
            'Dans un triangle rectangle, les deux angles aigus sont **complémentaires** : ils font ' +
            '90° à eux deux. Et le côté opposé à l\'un est le côté adjacent à l\'autre ! Le sinus de ' +
            'l\'un est donc le cosinus de l\'autre : sin(90° − θ) = cos θ. La famille complémentaire ' +
            'prolonge à tout angle ce que tu connaissais déjà pour les angles aigus.',
        },
        {
          kind: 'atelier',
          tag: 'angles-associes-widget',
          label: 'Manipule toi-même : les quatre miroirs',
          caption:
            'Fais varier θ et choisis une famille : M′ est le reflet de M(θ) dans un miroir ' +
            '— l\'axe vertical pour 180° − θ, l\'axe horizontal pour −θ, le centre O pour ' +
            '180° + θ, la diagonale y = x pour 90° − θ. Les coordonnées et les trois règles ' +
            'se mettent à jour en direct ; vérifie aussi que 360° − θ tombe sur le même ' +
            'point que −θ.',
        },
        {
          kind: 'astuce',
          label: 'Reconnaître la bonne famille',
          text:
            'Trois questions suffisent. Le signe devant θ est **+** ou **−** ? Tu pars de ' +
            '**90°** ou de **180°** ? Et si c\'est 180°, est-ce **180°−θ** ou **180°+θ** ? Ces ' +
            'trois réponses te donnent la famille, sans ambiguïté.',
        },
        {
          kind: 'exemple',
          badge: 'à partir de sin 35° ≈ 0,574, cos 35° ≈ 0,819',
          steps: [
            { tag: 'sin 145°', text: '145° = 180° − 35° → famille supplémentaire → sin 145° = sin 35° ≈ 0,574' },
            { tag: 'cos 215°', text: '215° = 180° + 35° → famille anti-supplémentaire → cos 215° = −cos 35° ≈ −0,819' },
          ],
          result: { tag: 'résultat', text: 'sin 145° ≈ 0,574 — cos 215° ≈ −0,819' },
        },
        {
          kind: 'exemple',
          badge: 'enchaîner deux familles — à partir de sin 67° ≈ 0,921, cos 67° ≈ 0,391',
          steps: [
            { tag: '1re famille', text: '157° = 180° − 23° → famille supplémentaire → sin 157° = sin 23°' },
            { tag: '2e famille', text: '23° = 90° − 67° → famille complémentaire, sin et cos s\'échangent → sin 23° = cos 67° ≈ 0,391' },
          ],
          result: { tag: 'résultat', text: 'sin 157° = sin 23° = cos 67° ≈ 0,391' },
        },
        {
          kind: 'exemple',
          badge: 'retrouver la règle de 90° + θ',
          formula: 'Exprime sin(90° + θ) et cos(90° + θ) en fonction de sin θ et cos θ, puis applique à θ = 35°.',
          steps: [
            { tag: 'réécrire', text: '90° + θ = 180° − (90° − θ)' },
            { tag: 'famille supplémentaire', text: 'sin(90° + θ) = sin(90° − θ) et cos(90° + θ) = −cos(90° − θ)' },
            { tag: 'famille complémentaire', text: 'sin(90° − θ) = cos θ et cos(90° − θ) = sin θ' },
          ],
          result: { tag: 'résultat', text: 'sin(90° + θ) = cos θ et cos(90° + θ) = −sin θ — par exemple sin 125° = cos 35° ≈ 0,819 et cos 125° = −sin 35° ≈ −0,574' },
        },
        {
          kind: 'entrainement',
          title: 'Angles associés',
          generatorId: 'gen17',
          description: [
            'Tu connais sin, cos ou tan d\'un angle de base ? Trouve la valeur pour un angle ' +
              'associé : complémentaire, supplémentaire, anti-supplémentaire ou opposé.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 17. Angles associés »',
        },
        {
          kind: 'exemple',
          badge: 'valeur exacte d\'une expression, sans calculatrice',
          formula: 'Calcule la valeur exacte de $\\sin 150° + \\cos 240° \\cdot \\tan 315°$.',
          steps: [
            { tag: 'sin 150°', text: 'quadrant II, sin positif ; 150° est le supplémentaire de 30° → sin 150° = sin 30° = 1/2' },
            { tag: 'cos 240°', text: 'quadrant III, cos négatif ; 240° est l\'anti-supplémentaire de 60° → cos 240° = −cos 60° = −1/2' },
            { tag: 'tan 315°', text: 'quadrant IV, tan négative ; 315° donne le même point que −45° → tan 315° = −tan 45° = −1' },
            { tag: 'calcul', text: 'le produit d\'abord : 1/2 + (−1/2) · (−1) = 1/2 + 1/2' },
          ],
          result: { tag: 'résultat', text: 'sin 150° + cos 240° · tan 315° = 1' },
        },
        {
          kind: 'entrainement',
          title: 'Valeur exacte sans calculatrice',
          generatorId: 'gen76',
          description: [
            'Calcule la valeur exacte d\'une expression comme sin 150° + cos 240° · tan 315° : ' +
              'pour chaque terme, ramène l\'angle dans [0° ; 360°[, trouve le quadrant, le signe, ' +
              'l\'angle associé et la valeur remarquable, puis calcule l\'expression.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 76. Valeur exacte sans calculatrice »',
        },
      ],
    },
    {
      id: 'equations',
      number: 5,
      title: 'Résoudre une équation trigonométrique',
      kicker: 'sin α = k / cos α = k / tan α = k, sur [0° ; 360°[',
      blocks: [
        { kind: 'video', title: 'Équations trigonométriques sin α = k, cos α = k, tan α = k sur [0° ; 360°[', youtubeId: 'B5XVyZQS2i8' },
        {
          kind: 'para',
          text:
            'Une équation du type sin α = k a, en général, **deux** solutions distinctes sur ' +
            '[0° ; 360°[. La seconde solution est toujours liée à la première par une symétrie ' +
            'de la section précédente.',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi (souvent) deux solutions ?',
          text:
            'Une droite horizontale coupe presque toujours un cercle en **deux** points ' +
            'distincts, comme sur la figure ci-dessous. Ces deux points sont les deux solutions ' +
            'de sin α = k. Un seul cas y échappe : quand la droite touche le cercle tout en haut ' +
            'ou tout en bas, comme une tangente — un seul point de contact, donc une seule ' +
            'solution (le cas limite un peu plus bas). Pour cos α = k, c\'est une droite ' +
            '**verticale** (x = k) qui coupe le cercle : même raisonnement, les deux points sont ' +
            'alors symétriques par rapport à l\'axe horizontal.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: 30 * D2R, label: 'α₁ = 30°', tone: 'accent' },
              { angle: 150 * D2R, label: 'α₂ = 150°', tone: 'accent' },
            ],
            horizontalLine: { y: 0.5, label: 'sin α = k' },
            angleArcs: [
              { from: 0, to: 30 * D2R, tone: 'good', radiusPx: 24 },
              { from: 150 * D2R, to: 180 * D2R, tone: 'good', radiusPx: 24 },
              { from: 0, to: 30 * D2R, tone: 'accent', radiusPx: 44, arrow: true },
              { from: 0, to: 150 * D2R, tone: 'accent', radiusPx: 58, arrow: true },
            ],
            caption: 'sin α = 0,5 sur [0°;360°[ : la droite horizontale coupe le cercle en 2 points, α₁ = 30° et α₂ = 180°−30° = 150°',
          },
        },
        {
          kind: 'methode',
          items: [
            'Trouve l\'angle de référence α₀ tel que sin, cos ou tan de α₀ vaille |k| (table ' +
              'des valeurs remarquables, section 3).',
            'Déduis-en les 2 solutions, par la symétrie adaptée. Pour sin α = k : α₀ et ' +
              '180° − α₀ si k > 0 (ou 180° + α₀ et 360° − α₀ si k < 0). Pour cos α = k : α₀ et ' +
              '360° − α₀ si k > 0 (ou 180° − α₀ et 180° + α₀ si k < 0).',
            'Pour tan α = k : α₀ et 180° + α₀ si k > 0 (quadrants I et III), ou 180° − α₀ et ' +
              '360° − α₀ si k < 0 (quadrants II et IV). Les 2 solutions sont toujours espacées ' +
              'de 180° : la tangente a une période de 180°.',
          ],
        },
        {
          kind: 'attention',
          label: 'Cas limites — une seule solution, ou aucune',
          text:
            'Quand k vaut exactement 1 ou −1 pour sin ou cos, les 2 solutions se confondent en ' +
            '**une seule** ! sin α = 1 → une seule solution (90°) ; cos α = −1 → une seule ' +
            'solution (180°). La tangente, elle, garde toujours **exactement 2** solutions sur ' +
            '[0°;360°[, quelle que soit la valeur de k : l\'intervalle couvre exactement 2 fois ' +
            'sa période de 180°. Pour k = 0, les 2 solutions tombent sur un axe : sin α = 0 → ' +
            '0° et 180° ; cos α = 0 → 90° et 270° ; tan α = 0 → 0° et 180°. Et si |k| > 1 pour ' +
            'sin ou cos, il n\'y a **aucune** solution : sin α et cos α restent toujours entre ' +
            '−1 et 1 (la droite ne coupe plus le cercle).',
        },
        {
          kind: 'exemple',
          badge: 'cos α = −1/2',
          steps: [
            { tag: 'angle de référence', text: 'cos α₀ = 1/2 → α₀ = 60°' },
            { tag: 'k négatif → famille 180°∓α₀', text: 'solutions : 180° − 60° = 120° et 180° + 60° = 240°' },
          ],
          result: { tag: 'résultat', text: 'α = 120° ou α = 240°' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [
              { angle: 120 * D2R, label: 'α₁ = 120°', tone: 'accent' },
              { angle: 240 * D2R, label: 'α₂ = 240°', tone: 'accent' },
            ],
            verticalLine: { x: -0.5, label: 'k' },
            angleArcs: [
              { from: 120 * D2R, to: 180 * D2R, tone: 'good', radiusPx: 24 },
              { from: 180 * D2R, to: 240 * D2R, tone: 'good', radiusPx: 24 },
            ],
            caption: 'cos α = −0,5 sur [0°;360°[ : la droite verticale x = −0,5 coupe le cercle en 2 points, symétriques par rapport à l\'axe horizontal — α₁ = 180° − 60° = 120° et α₂ = 180° + 60° = 240°',
          },
        },
        {
          kind: 'atelier',
          tag: 'equation-trig-cas-limite-widget',
          label: 'Manipule toi-même : quand 2 solutions deviennent 1',
          caption:
            'Choisis sin, cos ou tan, puis une valeur de k (les boutons donnent les valeurs ' +
            'remarquables) : l\'atelier trouve l\'angle de référence α₀, puis la symétrie qui ' +
            'donne les deux solutions. Fais glisser k vers ±1 : pour sin et cos, les deux ' +
            'solutions fusionnent, puis disparaissent au-delà. Pour tan, il y en a toujours ' +
            'exactement deux. Le réglage de départ (cos α = −1/2) reproduit l\'exemple ' +
            'ci-dessus.',
        },
        {
          kind: 'exemple',
          badge: 'sin α = −√2/2',
          steps: [
            { tag: 'angle de référence', text: 'sin α₀ = √2/2 → α₀ = 45°' },
            { tag: 'k négatif → quadrants III et IV', text: 'solutions : 180° + 45° = 225° et 360° − 45° = 315°' },
          ],
          result: { tag: 'résultat', text: 'α = 225° ou α = 315°' },
        },
        {
          kind: 'exemple',
          badge: 'tan α = −√3',
          steps: [
            { tag: 'angle de référence', text: 'tan α₀ = √3 → α₀ = 60°' },
            { tag: 'k négatif → quadrants II et IV', text: 'solutions : 180° − 60° = 120° et 360° − 60° = 300° (espacées de 180°)' },
          ],
          result: { tag: 'résultat', text: 'α = 120° ou α = 300°' },
        },
        {
          kind: 'exemple',
          badge: 'sin α = sin 40°',
          steps: [
            { tag: 'une solution évidente', text: 'α = 40°' },
            { tag: 'la seconde, par la famille supplémentaire', text: 'sin(180° − 40°) = sin 40°, donc α = 140° convient aussi' },
          ],
          result: { tag: 'résultat', text: 'α = 40° ou α = 140°' },
        },
        {
          kind: 'rappel',
          label: 'La calculatrice : touches sin⁻¹, cos⁻¹ et tan⁻¹',
          items: [
            'Vérifie d\'abord que ta calculatrice est en mode **degrés** (DEG, souvent un petit D à ' +
              'l\'écran). En mode radians, tous les angles obtenus sont faux.',
            'Les touches sin⁻¹, cos⁻¹ et tan⁻¹ (parfois notées arcsin, arccos, arctan) ne donnent ' +
              'qu\'**un seul** angle : entre −90° et 90° pour sin⁻¹ et tan⁻¹, entre 0° et 180° pour ' +
              'cos⁻¹. La seconde solution, c\'est à toi de la trouver par symétrie, comme dans la ' +
              'méthode ci-dessus. Un angle négatif renvoyé par sin⁻¹ ou tan⁻¹ se ramène dans ' +
              '[0° ; 360°[ en ajoutant 360°.',
            'C\'est aussi ce qui explique un piège de la section suivante : dans un triangle, un ' +
              'angle est compris entre 0° et 180°. cos⁻¹ couvre tout cet intervalle (une seule ' +
              'réponse possible) ; sin⁻¹, lui, ne renvoie que l\'angle aigu et « oublie » l\'angle ' +
              'obtus de même sinus.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cos α = 0,3, à la calculatrice',
          steps: [
            { tag: 'touche cos⁻¹', text: 'cos⁻¹(0,3) ≈ 72,5° : c\'est α₀ (k > 0)' },
            { tag: 'k positif → quadrants I et IV', text: 'seconde solution : 360° − 72,5° = 287,5°' },
          ],
          result: { tag: 'résultat', text: 'α ≈ 72,5° ou α ≈ 287,5°' },
        },
        {
          kind: 'entrainement',
          title: 'Quel angle ?',
          generatorId: 'gen18',
          description: [
            'Résous sin α = k, cos α = k ou tan α = k (k une valeur remarquable) sur ' +
              '[0°;360°[. Si tu bloques, une aide combine quadrants, candidats et projections.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 18. Quel angle ? »',
        },
      ],
    },
    {
      id: 'triangle',
      number: 6,
      title: 'Le triangle quelconque : lois des sinus et des cosinus',
      kicker: 'a/sinA = b/sinB = c/sinC — et a² = b² + c² − 2bc·cosA',
      blocks: [
        { kind: 'video', title: 'Triangle quelconque — lois des sinus et des cosinus (1/2) : énoncés, cas ambigu, démonstration des sinus', youtubeId: 'G66-HKd81Zs' },
        { kind: 'video', title: 'Triangle quelconque — lois des sinus et des cosinus (2/2) : démonstrations, piège d\'Al-Kashi, exemple SAS', youtubeId: '8pkdfnzQPD4' },
        {
          kind: 'para',
          text:
            'Sans angle droit, Pythagore ne marche plus. La trigonométrie « côté opposé / ' +
            'hypoténuse » non plus. Deux nouvelles lois prennent le relais — chacune adaptée à ' +
            'un type de données différent.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'triangleGeneric',
            A: { x: 80, y: 220 },
            B: { x: 380, y: 220 },
            C: { x: 260, y: 50 },
            angleArcsAt: ['A', 'B', 'C'],
            sideLabels: { a: 'a', b: 'b', c: 'c' },
            caption: 'convention constante : le côté minuscule (a, b, c) est toujours le côté opposé au sommet de même lettre majuscule (A, B, C)',
          },
        },
        {
          kind: 'historique',
          titre: 'Le mathématicien qui a libéré la trigonométrie de l\'astronomie',
          text:
            'Jusqu\'au 13e siècle, la trigonométrie n\'existe que comme un outil au service ' +
            'de l\'astronomie — personne ne l\'étudie pour elle-même. C\'est le savant perse ' +
            '**Nasir al-Din al-Tusi**, directeur du grand observatoire de Maragha (actuel ' +
            'Iran), qui change cela : dans son Traité du quadrilatère, il traite la ' +
            'trigonométrie comme une branche des mathématiques à part entière, et y établit ' +
            'la loi des sinus pour un triangle quelconque, exactement sous la forme que tu ' +
            'utilises dans cette section.',
          image: {
            src: '/images/historique/al-tusi.jpg',
            alt: 'Portrait de Nasir al-Din al-Tusi',
            caption: 'Nasir al-Din al-Tusi (1201–1274), timbre iranien. Domaine public (PD-Iran).',
          },
        },
        { kind: 'subheading', text: 'La loi des sinus' },
        {
          kind: 'para',
          text: '$\\dfrac{a}{\\sin \\hat{A}} = \\dfrac{b}{\\sin \\hat{B}} = \\dfrac{c}{\\sin \\hat{C}}$',
        },
        {
          kind: 'para',
          text:
            'Elle est utile dès que tu connais **2 angles et 1 côté** (AAS). Ou **2 côtés et un ' +
            'angle non compris** entre eux (SSA — le « cas ambigu », qui peut donner 0, 1 ou 2 ' +
            'triangles).',
        },
        {
          kind: 'para',
          text:
            'Certains énoncés l\'écrivent sous la forme **réciproque** : ' +
            '$\\sin \\hat{A}/a = \\sin \\hat{B}/b = \\sin \\hat{C}/c$. C\'est strictement ' +
            'équivalent — les deux écritures répondent exactement aux mêmes questions.',
        },
        { kind: 'subheading', text: 'Démonstration — la loi des sinus' },
        {
          kind: 'para',
          text:
            'Abaisse la hauteur issue de C, de longueur h. Elle coupe [AB] en un point H. Ça ' +
            'crée deux triangles rectangles, qui partagent cette hauteur.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'triangleGeneric',
            A: { x: 80, y: 220 },
            B: { x: 380, y: 220 },
            C: { x: 260, y: 50 },
            heightFromC: { hLabel: 'h', footLabel: 'H' },
            angleArcsAt: ['A', 'B'],
            sideLabels: { a: 'a', b: 'b', c: 'c' },
            caption: 'la hauteur h, commune aux deux triangles rectangles ACH et BCH, relie sin Â et sin B̂',
          },
        },
        {
          kind: 'exemple',
          badge: 'démonstration — la loi des sinus',
          steps: [
            { tag: 'dans ACH, rectangle en H', text: 'sin Â = CH/AC = h/b, donc h = b sin Â' },
            { tag: 'dans BCH, rectangle en H', text: 'sin B̂ = CH/BC = h/a, donc h = a sin B̂' },
            { tag: 'en égalant les deux expressions de h', text: 'a sin B̂ = b sin Â' },
          ],
          result: {
            tag: 'résultat',
            text:
              'a/sin Â = b/sin B̂. Fais le même raisonnement en abaissant la hauteur depuis un ' +
              'autre sommet : tu obtiens aussi l\'égalité avec c/sin Ĉ.',
          },
        },
        {
          kind: 'rappel',
          label: 'Et si le triangle est obtus ?',
          items: [
            'Le pied H peut alors tomber à l\'extérieur du segment [AB]. Le raisonnement reste ' +
              'le même. Seule différence : un des angles utilisés dans le triangle rectangle ' +
              'est le **supplément** de l\'angle du triangle ABC. Comme sin(180°−x) = sin x ' +
              '(angles associés, section 4), la conclusion finale ne change pas.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'AAS — Â = 40°, B̂ = 75°, c = 10',
          steps: [
            { tag: 'troisième angle', text: 'Ĉ = 180° − 40° − 75° = 65°' },
            { tag: 'côté a — loi des sinus', text: '$a = \\dfrac{c \\cdot \\sin \\hat{A}}{\\sin \\hat{C}} = \\dfrac{10 \\cdot \\sin 40°}{\\sin 65°} \\approx 7{,}09$' },
            { tag: 'côté b — loi des sinus', text: '$b = \\dfrac{c \\cdot \\sin \\hat{B}}{\\sin \\hat{C}} = \\dfrac{10 \\cdot \\sin 75°}{\\sin 65°} \\approx 10{,}66$' },
          ],
          result: { tag: 'résultat', text: 'Ĉ = 65° — a ≈ 7,09 — b ≈ 10,66' },
        },
        { kind: 'subheading', text: 'Le cas ambigu (SSA)' },
        {
          kind: 'para',
          text:
            'Avec 2 côtés et un angle **non compris**, la loi des sinus donne le sinus d\'un ' +
            'deuxième angle. Mais un sinus ne suffit pas à fixer un angle entre 0° et 180° : ' +
            'B̂ et 180° − B̂ ont le même sinus (angles supplémentaires, section 4). Il faut donc ' +
            'tester les deux candidats.',
        },
        {
          kind: 'atelier',
          tag: 'triangle-cas-ambigu-widget',
          label: 'Manipule toi-même : le cas ambigu (SSA)',
          caption:
            'A est fixé ; le côté b et l\'angle Â placent C. Fais glisser a, le côté opposé ' +
            'à Â : selon sa longueur, le cercle de rayon a coupe la base en 0, 1 ou 2 ' +
            'points. Sous la figure, le calcul par la loi des sinus donne les deux ' +
            'candidats B̂ et 180° − B̂, puis le test Â + B̂ < 180° qui garde 0, 1 ou 2 ' +
            'triangles. Le réglage de départ est celui de l\'exemple ci-dessous.',
        },
        {
          kind: 'methode',
          label: 'Résoudre le cas ambigu',
          items: [
            'Calcule $\\sin \\hat{B} = \\dfrac{b \\cdot \\sin \\hat{A}}{a}$. Si ce nombre dépasse 1 : **aucun** ' +
              'triangle. S\'il vaut exactement 1 : **un** triangle, rectangle en B.',
            'Sinon, deux candidats : B̂₁ = sin⁻¹(…), aigu, et B̂₂ = 180° − B̂₁, obtus.',
            'Garde chaque candidat qui laisse de la place au troisième angle : il faut Â + B̂ < 180°. ' +
              'Quand Â est aigu, B̂₁ convient toujours ; B̂₂ convient seulement si Â + B̂₂ < 180°.',
            'Pour chaque triangle retenu : Ĉ = 180° − Â − B̂, puis c par la loi des sinus.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'SSA — Â = 30°, b = 8, a = 5 : deux triangles',
          steps: [
            { tag: 'sinus de B̂', text: '$\\sin \\hat{B} = \\dfrac{8 \\cdot \\sin 30°}{5} = \\dfrac{4}{5} = 0{,}8$ (inférieur à 1)' },
            { tag: 'deux candidats', text: 'B̂₁ = sin⁻¹(0,8) ≈ 53,1° et B̂₂ = 180° − 53,1° = 126,9°' },
            { tag: 'test du second', text: 'Â + B̂₂ = 30° + 126,9° = 156,9° < 180° : il convient aussi' },
            { tag: 'triangle 1', text: 'Ĉ₁ ≈ 180° − 30° − 53,1° = 96,9°, $c_1 = \\dfrac{5 \\cdot \\sin 96{,}9°}{\\sin 30°} \\approx 9{,}93$' },
            { tag: 'triangle 2', text: 'Ĉ₂ ≈ 180° − 30° − 126,9° = 23,1°, $c_2 = \\dfrac{5 \\cdot \\sin 23{,}1°}{\\sin 30°} \\approx 3{,}93$' },
          ],
          result: { tag: 'résultat', text: 'deux triangles : B̂ ≈ 53,1°, Ĉ ≈ 96,9°, c ≈ 9,93 — ou B̂ ≈ 126,9°, Ĉ ≈ 23,1°, c ≈ 3,93' },
        },
        {
          kind: 'application',
          titre: 'Trouver sa position en mer avec un sextant',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 4,
              yMin: -0.5,
              yMax: 3,
              showAxes: false,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 3.5, y: 0 }, tone: 'faint', arrow: true },
                { from: { x: 0, y: 0 }, to: { x: 2.8, y: 2 }, tone: 'accent', arrow: true },
              ],
              points: [
                { x: 3.5, y: 0, label: 'horizon', tone: 'ink', labelPos: 'below', node: false },
                { x: 2.8, y: 2, label: 'astre visé', tone: 'accent', labelPos: 'above' },
              ],
              angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 35.5, radiusPx: 40, label: 'h', tone: 'accent' }],
              caption:
                "Ce que le sextant mesure concrètement : l'angle h entre l'horizon et un astre " +
                "visé (ici h ≈ 35°). Cette seule mesure, combinée à l'heure exacte, suffit à " +
                'reconstruire un triangle sphérique Pôle–Navire–Astre, que la version ' +
                '« sphérique » de la loi des sinus résout pour donner la latitude.',
            },
          ],
          text:
            'Avant le GPS, les marins déterminaient leur position en mer grâce à la ' +
            'trigonométrie. Un sextant mesure précisément l\'angle entre l\'horizon et un ' +
            'astre (le Soleil, une étoile) — exactement comme tu mesures un angle sur le ' +
            'cercle trigonométrique. En combinant cet angle avec l\'heure exacte et des ' +
            'tables astronomiques, le navigateur reconstruit un triangle reliant sa ' +
            'position, le pôle et l\'astre visé — un triangle tracé sur la sphère céleste — ' +
            'puis le résout avec une cousine « sphérique » de la loi des sinus pour en ' +
            'déduire sa latitude et sa longitude. Cette méthode, utilisée ' +
            'pendant des siècles, a permis de traverser les océans bien avant les satellites.',
          domaines: ['Navigation', 'Astronomie'],
          image: {
            src: '/images/application/sextant.jpg',
            alt: 'Sextant marin Plath',
            caption: 'Sextant Plath, utilisé pour mesurer l\'angle entre l\'horizon et un astre. NOAA, domaine public.',
          },
        },
        { kind: 'subheading', text: 'La loi des cosinus (Al-Kashi)' },
        {
          kind: 'historique',
          titre: 'Pourquoi la loi des cosinus porte le nom d\'Al-Kashi',
          text:
            'Ghiyath al-Din Jamshid Al-Kashi, astronome et mathématicien du 15e siècle à ' +
            'l\'observatoire de Samarcande (actuel Ouzbékistan), est le premier à énoncer et ' +
            'démontrer clairement cette relation entre les trois côtés d\'un triangle et le ' +
            'cosinus d\'un angle — d\'où son nom, encore utilisé aujourd\'hui dans les pays ' +
            'francophones. Al-Kashi est aussi réputé pour avoir calculé π avec 16 décimales ' +
            'exactes, un record resté inégalé pendant plus de 150 ans, en travaillant ' +
            'uniquement avec des polygones à des millions de côtés.',
          image: {
            src: '/images/historique/al-kashi.jpg',
            alt: 'Page manuscrite du Miftah al-Hisab d\'Al-Kashi',
            caption: 'Page du Miftah al-Hisab (« Clé de l\'arithmétique ») d\'Al-Kashi, copie manuscrite de 1656. Domaine public.',
          },
        },
        { kind: 'para', text: '$a^2 = b^2 + c^2 - 2bc\\cos \\hat{A}$' },
        {
          kind: 'para',
          text:
            'Elle est utile dès que tu connais **2 côtés et l\'angle compris** entre eux (SAS). ' +
            'Ou les **3 côtés** (SSS, en isolant le cosinus). Pythagore n\'en est qu\'un cas ' +
            'particulier : si Â = 90°, alors cos Â = 0, et la formule redevient $a^2=b^2+c^2$.',
        },
        { kind: 'subheading', text: 'Démonstration — la loi des cosinus' },
        {
          kind: 'para',
          text:
            'Place A à l\'origine d\'un repère, et B sur l\'axe horizontal, à distance c. C a ' +
            'alors pour coordonnées (b cos Â ; b sin Â). C\'est exactement M(θ) sur le cercle ' +
            'trigonométrique (section 1), mais ici de rayon b plutôt que 1.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'triangleGeneric',
            A: { x: 60, y: 230 },
            B: { x: 340, y: 230 },
            C: { x: 175.7, y: 92.1 },
            coordinateConstruction: { horizontalLabel: 'b cos Â', verticalLabel: 'b sin Â' },
            angleArcsAt: ['A'],
            sideLabels: { a: 'a', c: 'c' },
            caption:
              'C = (b cos Â ; b sin Â). Les côtés a et c se lisent alors directement par ' +
              'Pythagore, et par l\'aire d\'un triangle base×hauteur/2.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Loi des cosinus',
          blocks: [
            {
              kind: 'para',
              text: 'Applique Pythagore, avec l\'hypoténuse BC = a : $a^2 = (c-b\\cos \\hat{A})^2 + (b\\sin \\hat{A})^2$',
            },
            { kind: 'para', text: 'Développe : $a^2 = c^2 - 2bc\\cos \\hat{A} + b^2\\cos^2 \\hat{A} + b^2\\sin^2 \\hat{A}$' },
            {
              kind: 'para',
              text: 'Utilise l\'identité fondamentale (section 2) : $b^2\\cos^2 \\hat{A} + b^2\\sin^2 \\hat{A} = b^2(\\cos^2 \\hat{A}+\\sin^2 \\hat{A}) = b^2$',
            },
            { kind: 'para', text: 'Résultat : $a^2 = b^2+c^2-2bc\\cos \\hat{A}$' },
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi le cercle était indispensable',
          text:
            'Dans cette démonstration, rien n\'oblige Â à être aigu. Si Â est obtus, C passe à ' +
            'gauche de A, et b cos Â devient négatif — exactement comme cos θ dans le quadrant II ' +
            'du cercle trigonométrique. C\'est la définition de cos par le cercle (section 1) qui ' +
            'rend la formule valable pour **tous** les triangles. Le terme $-2bc\\cos\\hat{A}$ ' +
            'corrige Pythagore : il est négatif si Â est aigu ($a^2 < b^2+c^2$), nul si Â est droit, ' +
            'positif si Â est obtus ($a^2 > b^2+c^2$) — comme pour la charpente plus bas, où ' +
            'cos 100° < 0.',
        },
        {
          kind: 'atelier',
          tag: 'triangle-deformable-widget',
          label: 'Manipule toi-même : un triangle qui se déforme',
          caption:
            'Fais glisser les sommets du triangle. Les trois rapports a / sin Â, b / sin B̂ ' +
            'et c / sin Ĉ restent toujours égaux, et égaux au diamètre du cercle ' +
            'circonscrit. Al-Kashi apparaît comme un Pythagore corrigé : le terme −2bc·cos ' +
            'Â est négatif si Â est aigu, nul si Â est droit, positif si Â est obtus. Le ' +
            'réglage de départ est le triangle de l\'exemple SSS (a = 7, b = 5, c = 8).',
        },
        {
          kind: 'piege',
          label: 'Après Al-Kashi, ne pas retomber dans l\'ambiguïté',
          text:
            'Une fois un côté trouvé par Al-Kashi (cas SAS), tu es peut-être tenté de basculer ' +
            'sur la loi des sinus pour calculer un angle restant. Ne le fais pas ! arcsin ' +
            'renvoie **deux** angles possibles (un aigu, un obtus), et rien ne dit lequel est ' +
            'le bon — la calculatrice, elle, ne te montre que l\'aigu. Le plus sûr : réutilise ' +
            '**Al-Kashi** une seconde fois, résolu en cosinus. cos⁻¹ couvre tout ]0° ; 180°[ : ' +
            'aucune ambiguïté possible.',
        },
        {
          kind: 'exemple',
          badge: 'SAS — b = 8, c = 6, Â = 60°',
          steps: [
            { tag: 'côté a — Al-Kashi', text: 'a² = 8² + 6² − 2×8×6×cos 60° = 64 + 36 − 48 = 52 → a = √52 ≈ 7,21' },
            { tag: 'angle B̂ — Al-Kashi, pas la loi des sinus', text: 'cos B̂ = (a² + c² − b²)/(2ac) = (52 + 36 − 64)/(2×7,21×6) ≈ 0,277 → B̂ ≈ 73,9°' },
            { tag: 'angle Ĉ', text: 'Ĉ = 180° − 60° − 73,9° ≈ 46,1°' },
            { tag: 'aire', text: 'Aire = ½×8×6×sin 60° ≈ 20,78' },
          ],
          result: { tag: 'résultat', text: 'a ≈ 7,21 — B̂ ≈ 73,9° — Ĉ ≈ 46,1° — Aire ≈ 20,78' },
        },
        {
          kind: 'astuce',
          label: 'Deux contrôles rapides',
          text: 'Avant de conclure, vérifie la cohérence de tes résultats :',
          items: [
            'Le plus grand côté est toujours opposé au plus grand angle (et le plus petit côté au ' +
              'plus petit angle). Un résultat qui contredit ça cache une erreur.',
            'L\'angle opposé au **plus petit** côté est forcément aigu : pour lui seul, la loi des ' +
              'sinus ne présente aucune ambiguïté.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'SSS — a = 7, b = 5, c = 8',
          steps: [
            { tag: 'angle Â — Al-Kashi résolue en cosinus', text: '$\\cos \\hat{A} = \\dfrac{b^2+c^2-a^2}{2bc} = \\dfrac{25+64-49}{80} = \\dfrac{40}{80} = \\dfrac{1}{2}$, donc Â = 60°' },
            { tag: 'angle B̂ — Al-Kashi', text: '$\\cos \\hat{B} = \\dfrac{a^2+c^2-b^2}{2ac} = \\dfrac{49+64-25}{112} = \\dfrac{88}{112} \\approx 0{,}786$, donc B̂ ≈ 38,2°' },
            { tag: 'angle Ĉ', text: 'Ĉ ≈ 180° − 60° − 38,2° = 81,8°' },
            { tag: 'contrôle', text: 'le plus grand côté, c = 8, est bien opposé au plus grand angle, Ĉ' },
          ],
          result: { tag: 'résultat', text: 'Â = 60° — B̂ ≈ 38,2° — Ĉ ≈ 81,8°' },
        },
        {
          kind: 'application',
          titre: 'Calculer les longueurs d\'une charpente de toit',
          illustrations: [
            {
              kind: 'triangleGeneric',
              A: { x: 60, y: 220 },
              B: { x: 335.76, y: 220 },
              C: { x: 197.88, y: 104.3 },
              angleArcsAt: ['C'],
              sideLabels: { a: 'a = 3 m', b: 'b = 3 m', c: 'c ≈ 4,6 m' },
              caption:
                'Les deux arbalétriers (a et b), déjà coupés à 3 m chacun, forment un angle ' +
                'de 100° au faîtage (C) — fixé par la pente voulue. La loi des cosinus donne ' +
                "directement la largeur de l'entrait c = AB à construire en bas : " +
                'c² = 3²+3²−2×3×3×cos100° ≈ 21,1, donc c ≈ 4,6 m.',
            },
          ],
          text:
            'Une charpente de toit est un assemblage de triangles — les charpentiers ' +
            'choisissent cette forme précisément parce qu\'un triangle est rigide ' +
            '(contrairement à un rectangle, qui peut se déformer). Pour fabriquer chaque ' +
            'pièce de bois à la bonne longueur AVANT de monter la charpente, il faut ' +
            'résoudre ces triangles : connaissant la longueur des deux arbalétriers et ' +
            'l\'angle qu\'ils forment au faîtage (fixé par la pente voulue), la loi des cosinus ' +
            'donne directement la longueur de l\'entrait, sans avoir à mesurer sur place.',
          domaines: ['Architecture', 'Construction'],
          image: {
            src: '/images/application/charpente.jpg',
            alt: 'Charpente de toit en bois',
            caption: 'Charpente de la cathédrale de Greifswald (Allemagne). Photo : WildO, CC BY-SA 4.0, via Wikimedia Commons.',
          },
        },
        { kind: 'subheading', text: 'L\'aire' },
        {
          kind: 'para',
          text: 'Aire = $\\dfrac{1}{2}ab\\sin \\hat{C} = \\dfrac{1}{2}bc\\sin \\hat{A} = \\dfrac{1}{2}ac\\sin \\hat{B}$',
        },
        {
          kind: 'para',
          text:
            'Deux côtés et l\'angle compris entre eux suffisent. Pas besoin de construire une ' +
            'hauteur ! Et les trois écritures donnent bien sûr la même aire.',
        },
        { kind: 'subheading', text: 'Démonstration — l\'aire' },
        {
          kind: 'para',
          text:
            'Reprends la figure de la démonstration d\'Al-Kashi, avec A à l\'origine et ' +
            'C = (b cos Â ; b sin Â).',
        },
        {
          kind: 'exempleLibre',
          label: 'Aire',
          blocks: [
            {
              kind: 'para',
              text:
                'La hauteur au-dessus de [AB], c\'est l\'ordonnée de C : elle vaut b sin Â. ' +
                'C\'est exactement la hauteur du triangle issue de C.',
            },
            { kind: 'para', text: 'Aire = base × hauteur / 2, donc Aire = (c × b sin Â)/2 = ½bc sin Â' },
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi ça marche sans tracer la hauteur ?',
          text:
            'Dans un triangle rectangle, tu sais déjà que sin θ = opposé/hypoténuse, donc ' +
            'opposé = hypoténuse × sin θ. C\'est exactement ce qui se passe ici : b sin Â, ' +
            'c\'est la hauteur du triangle ABC issue de C — sinus la calcule directement, sans ' +
            'avoir besoin de la tracer ni de mesurer quoi que ce soit en plus.',
        },
        {
          kind: 'rappel',
          label: 'Pour aller plus loin — la formule de Héron',
          items: [
            'Avec les 3 côtés seulement : $\\text{Aire} = \\sqrt{p(p-a)(p-b)(p-c)}$, où ' +
              '$p = \\dfrac{a+b+c}{2}$ est le demi-périmètre.',
            'Exemple : a = 7, b = 5, c = 8 donne p = 10 et ' +
              '$\\text{Aire} = \\sqrt{10 \\cdot 3 \\cdot 5 \\cdot 2} = \\sqrt{300} = 10\\sqrt{3} \\approx 17{,}32$ — ' +
              'la même valeur que $\\dfrac{1}{2} \\cdot 5 \\cdot 8 \\cdot \\sin 60°$.',
          ],
        },
        {
          kind: 'attention',
          label: 'Retrouver un angle à partir de l\'aire : deux réponses',
          text:
            'Si on connaît deux côtés et l\'aire, la formule donne le sinus de l\'angle compris : ' +
            '$\\sin \\hat{C} = \\dfrac{2 \\cdot \\text{Aire}}{ab}$. Or un angle et son supplémentaire ont le ' +
            'même sinus : $\\hat{C}$ et $180° - \\hat{C}$ conviennent tous les deux (deux triangles différents), ' +
            'sauf si $\\sin \\hat{C} = 1$, où seul l\'angle droit convient. La touche sin⁻¹ de la calculatrice ' +
            'ne donne que l\'angle aigu.',
        },
        {
          kind: 'para',
          text:
            '**Aire d\'un quadrilatère.** Une diagonale le découpe en deux triangles : son aire est la somme ' +
            'de leurs aires. S\'il manque un côté à l\'un des triangles (souvent la diagonale elle-même), on ' +
            'le calcule d\'abord dans l\'autre triangle, avec Al-Kashi.',
        },
        { kind: 'subheading', text: 'Choisir la bonne loi' },
        {
          kind: 'featureTable',
          caption: 'Quelle formule utiliser ?',
          headers: ['Données connues', 'Méthode'],
          rows: [
            ['2 angles + 1 côté (AAS)', 'somme des angles = 180°, puis loi des sinus'],
            ['2 côtés + angle compris (SAS)', 'Al-Kashi pour le 3e côté, puis Al-Kashi à nouveau pour un angle'],
            ['3 côtés (SSS)', 'Al-Kashi, résolue en cosinus, pour chaque angle voulu'],
            ['2 côtés + angle non compris (SSA)', 'loi des sinus — cas ambigu, vérifier le nombre de solutions'],
          ],
        },
        {
          kind: 'atelier',
          tag: 'quelle-loi-widget',
          label: 'Manipule toi-même : quelle loi ?',
          caption:
            'Un triangle, trois données : quelle méthode choisis-tu ? Somme des angles et ' +
            'loi des sinus, Al-Kashi pour un côté, Al-Kashi résolue en cosinus, ou loi des ' +
            'sinus avec le cas ambigu. Un seul essai, puis la résolution complète s\'affiche ' +
            'pas à pas.',
        },
        {
          kind: 'application',
          titre: 'Reconstruire un objet en 3D à partir de simples photos',
          illustrations: [
            {
              kind: 'triangulation',
              labels: {
                A: 'appareil 1',
                B: 'appareil 2',
                F: 'F',
                S: 'point 3D',
                distanceLabel: 'd (connue)',
                heightLabel: 'position cherchée',
                angleAtA: 'θ₁',
                angleAtB: 'θ₂',
              },
              caption:
                'La distance d entre les deux appareils photo est connue, et chaque photo ' +
                'donne un angle de visée (θ₁, θ₂) vers le même point. Le triangle ' +
                "appareil1–appareil2–point est donc entièrement déterminé (AAS) : la loi des " +
                'sinus calcule sa position exacte — répétée pour des millions de points.',
            },
          ],
          text:
            'La photogrammétrie reconstruit un modèle 3D d\'un objet ou d\'un bâtiment à ' +
            'partir de plusieurs photos prises sous des angles différents — la même ' +
            'technique qui numérise aujourd\'hui des sites archéologiques ou des décors de ' +
            'jeux vidéo. Le principe : chaque point visible sur au moins deux photos ' +
            'appartient à un triangle dont on connaît la position des deux appareils photo ' +
            '(les sommets) et les angles de visée. En résolvant ce triangle avec les lois ' +
            'vues dans cette section, le logiciel calcule la position exacte du point en 3D ' +
            '— répété des millions de fois, cela reconstruit la forme entière de l\'objet.',
          domaines: ['Informatique', 'Imagerie 3D'],
        },
        {
          kind: 'entrainement',
          title: 'Triangle quelconque',
          generatorId: 'gen19',
          description: [
            'Retrouve un côté ou un angle manquant — loi des sinus ou Al-Kashi, selon les ' +
              'données. Puis calcule l\'aire avec ½·a·b·sin(C).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 19. Triangle quelconque »',
        },
        {
          kind: 'methode',
          label: 'Résoudre complètement un triangle',
          items: [
            'Repère la configuration des trois données : 2 angles et 1 côté, 2 côtés et l\'angle ' +
              'compris, 3 côtés, ou 2 côtés et un angle non compris.',
            '**2 angles et 1 côté** : le troisième angle par la somme des angles, puis chaque côté ' +
              'par la loi des sinus, avec le côté donné et l\'angle qui lui fait face.',
            '**2 côtés et l\'angle compris** : le troisième côté par Al-Kashi, puis le **plus grand** ' +
              'des deux angles restants par Al-Kashi (il fait face au plus grand côté), puis le dernier ' +
              'par la somme des angles.',
            '**3 côtés** : commence par le **plus grand angle** (face au plus grand côté), par ' +
              'Al-Kashi résolue en cosinus ; puis un deuxième angle ; le dernier par la somme.',
            '**2 côtés et un angle non compris**, quand l\'angle donné fait face au **plus grand** des ' +
              'deux côtés : un seul triangle. Loi des sinus pour l\'angle qui fait face à l\'autre côté ' +
              '(il est aigu), puis la somme des angles, puis le dernier côté.',
            'Pourquoi le plus grand angle d\'abord, par Al-Kashi ? C\'est le seul angle qui peut être ' +
              'obtus, et $\\sin^{-1}$ ne renvoie jamais un angle obtus : la calculatrice donnerait ' +
              '$180^\\circ - x$ au lieu de $x$. Le cosinus, lui, distingue aigu et obtus.',
            'Contrôle : recalcule autrement l\'angle obtenu par la somme (par Al-Kashi) ; tu dois ' +
              'retrouver la même valeur. Calculatrice en degrés, sans arrondir les valeurs intermédiaires.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Résoudre complètement un triangle',
          generatorId: 'gen73',
          description: [
            'Trois données, trois inconnues : reconnais la configuration, choisis la première loi, ' +
              'calcule les éléments manquants dans l\'ordre, puis contrôle. Gare à l\'angle obtus : ' +
              'arcsin ne renvoie que l\'angle aigu.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 73. Résoudre complètement un triangle »',
        },
        {
          kind: 'entrainement',
          title: 'Cas ambigu : 0, 1 ou 2 triangles ?',
          generatorId: 'gen74',
          description: [
            'Deux côtés et un angle non compris : calcule sin B̂, garde ou écarte les candidats ' +
              'B̂ et 180° − B̂, décide combien de triangles existent, puis calcule le côté c de ' +
              'chacun. L\'arc de compas de la correction montre pourquoi.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 74. Cas ambigu : 0, 1 ou 2 triangles ? »',
        },
        {
          kind: 'entrainement',
          title: 'Aire d\'un triangle quelconque',
          generatorId: 'gen75',
          description: [
            'Calcule une aire avec ½·a·b·sin(C), retrouve un côté ou l\'angle compris à partir de ' +
              'l\'aire (attention aux deux amplitudes possibles), découpe un quadrilatère par une ' +
              'diagonale, ou applique la formule de Héron.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 75. Aire d\'un triangle quelconque »',
        },
        {
          kind: 'entrainement',
          title: 'Le détective d\'erreurs',
          generatorId: 'gen81',
          description: [
            'Un élève a résolu un triangle, mais une ligne de sa copie est fausse : angle obtus ' +
              'oublié, calculatrice en radians, arrondi trop tôt, côté mal associé, Al-Kashi mal ' +
              'recopié ou second triangle oublié. Trouve la ligne, nomme l\'erreur et corrige.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 81. Le détective d\'erreurs »',
        },
      ],
    },
    {
      id: 'triangulation',
      number: 7,
      title: 'Triangles liés : la triangulation',
      kicker: 'résous un triangle « pont » pour transférer un élément vers le triangle « cible »',
      blocks: [
        { kind: 'video', title: 'Triangulation — mesurer une hauteur inaccessible avec deux triangles liés', youtubeId: 'fGwjUxVHL5s' },
        {
          kind: 'para',
          text:
            'Sur le terrain, tu ne peux pas toujours mesurer directement le côté qui ' +
            't\'intéresse — une hauteur, une distance entre deux points inaccessibles… La ' +
            '**triangulation** contourne ce problème, avec **deux triangles**. D\'abord, un ' +
            'triangle **pont**, entièrement résoluble avec les données de l\'énoncé. Tu en ' +
            'tires un côté ou un angle (parfois plusieurs valeurs). Ces valeurs deviennent des ' +
            'données du triangle **cible** : celui qui contient la grandeur demandée, résolu à ' +
            'la fin (loi des sinus, Al-Kashi, ou simple trigonométrie s\'il est rectangle).',
        },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ce principe',
          text:
            'C\'est le même principe que ton GPS, ou que les géomètres sur le terrain : ' +
            'impossible de mesurer directement une distance ou une hauteur inaccessible, mais ' +
            'en combinant les angles vus depuis deux points connus, la trigonométrie la ' +
            'retrouve quand même — sans bouger de mesure directe.',
        },
        {
          kind: 'methode',
          label: 'Les 3 façons de relier les deux triangles',
          items: [
            '**Côté partagé** — les deux triangles ont un vrai côté en commun (une diagonale, ' +
              'par exemple). Calcule sa longueur dans le triangle pont. Utilise-la ensuite ' +
              'comme côté connu du triangle cible, dont les 2 autres angles sont déjà donnés ' +
              'par l\'énoncé.',
            '**Angle partagé** — depuis un même point O, on vise un repère M de hauteur connue, ' +
              'puis le sommet T. Le triangle pont OFM, rectangle, donne OM. La différence des deux ' +
              'visées donne l\'angle en O du triangle cible OMT ; une seconde hypothèse propre au ' +
              'contexte (la verticalité du support) ferme le triangle.',
            '**Sommet partagé** — les deux triangles ont un sommet commun O, et le même angle ' +
              'en O (deux trajectoires qui partent du même point, par exemple). Dans le triangle ' +
              'pont OAB, calcule l\'angle en O et les deux côtés qui en partent, OA et OB. ' +
              'Retranche à chacun la distance déjà parcourue : tu obtiens les deux côtés OC et ' +
              'OD du triangle cible OCD. Avec l\'angle en O, compris entre eux, Al-Kashi donne ' +
              'le troisième côté.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6,
            xMax: 16.4,
            yMin: -3,
            yMax: 18,
            showAxes: false,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 12, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 12, y: 0 }, to: { x: 9.395, y: 14.772 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 9.395, y: 14.772 }, tone: 'accent', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: -3.408, y: 15.323 }, tone: 'good', arrow: false },
              { from: { x: -3.408, y: 15.323 }, to: { x: 9.395, y: 14.772 }, tone: 'good', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 12, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 9.395, y: 14.772, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: -3.408, y: 15.323, label: 'D', tone: 'good', labelPos: 'left' },
              { x: 6, y: 0, label: '12 m', tone: 'ink', labelPos: 'below', node: false },
              { x: 10.7, y: 7.4, label: '15 m', tone: 'ink', labelPos: 'right', node: false },
            ],
            angleArcs: [
              { cx: 12, cy: 0, fromDeg: 100, toDeg: 180, radiusPx: 20, label: '80°', tone: 'accent' },
              { cx: 0, cy: 0, fromDeg: 57.54, toDeg: 102.54, radiusPx: 26, label: '45°', tone: 'good' },
              { cx: 9.395, cy: 14.772, fromDeg: 177.54, toDeg: 237.54, radiusPx: 22, label: '60°', tone: 'good' },
            ],
            caption:
              'côté partagé : la diagonale [AC] (en orange) appartient aux deux triangles. Le ' +
              'triangle pont ABC (gris) donne AC par Al-Kashi ; le triangle cible ACD (vert) ' +
              'donne ensuite CD par la loi des sinus.',
          },
        },
        {
          kind: 'exemple',
          badge: 'terrain ABCD, côté partagé',
          formula:
            'Un terrain a la forme du quadrilatère ABCD. La diagonale [AC] le partage en deux ' +
            'triangles. On mesure AB = 12 m, BC = 15 m et $\\widehat{ABC} = 80°$, ainsi que ' +
            '$\\widehat{CAD} = 45°$ et $\\widehat{ACD} = 60°$. Calcule la longueur du côté [CD].',
          steps: [
            { tag: 'triangle pont ABC — Al-Kashi', text: '$AC^2 = 12^2 + 15^2 - 2 \\times 12 \\times 15 \\times \\cos 80° \\approx 306{,}49$, donc $AC \\approx 17{,}51$ m' },
            { tag: 'triangle cible ACD — troisième angle', text: '$\\hat{D} = 180° - 45° - 60° = 75°$' },
            { tag: 'CD — loi des sinus', text: '$CD = \\dfrac{AC \\cdot \\sin 45°}{\\sin 75°} \\approx \\dfrac{17{,}51 \\times 0{,}707}{0{,}966} \\approx 12{,}82$ m' },
          ],
          result: { tag: 'résultat', text: 'CD ≈ 12,82 m' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 21.5,
            yMin: -2,
            yMax: 21,
            showAxes: false,
            vectors: [
              { from: { x: -1, y: 0 }, to: { x: 20, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 16.485, y: 0 }, to: { x: 16.485, y: 19.646 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 16.485, y: 6 }, tone: 'accent', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 16.485, y: 19.646 }, tone: 'good', arrow: false },
              { from: { x: 16.485, y: 6 }, to: { x: 16.485, y: 19.646 }, tone: 'good', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 16.485, y: 0, label: 'F', tone: 'ink', labelPos: 'below' },
              { x: 16.485, y: 6, label: 'M', tone: 'accent', labelPos: 'right' },
              { x: 16.485, y: 19.646, label: 'T', tone: 'good', labelPos: 'right' },
              { x: 16.485, y: 3, label: '6 m', tone: 'ink', labelPos: 'right', node: false },
            ],
            angleArcs: [
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 20, radiusPx: 40, label: '20°', tone: 'accent' },
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 50, radiusPx: 72, label: '50°', tone: 'good' },
            ],
            rightAngleMarkers: [{ vertex: { x: 16.485, y: 0 }, arm1: { x: 15, y: 0 }, arm2: { x: 16.485, y: 1.5 } }],
            caption:
              'angle partagé : depuis O, on vise le repère M (20°) puis le sommet T (50°). Le ' +
              'triangle pont OFM, rectangle en F, donne OM ; le triangle cible OMT (vert) a un ' +
              'angle de 50° − 20° = 30° en O.',
          },
        },
        {
          kind: 'exemple',
          badge: 'mât, angle partagé depuis un seul point',
          formula:
            'Depuis un point O, on vise un repère M situé à 6 m de hauteur sur un mât vertical ' +
            '(angle d\'élévation 20°), puis le sommet T du mât (angle d\'élévation 50°). Calcule ' +
            'la hauteur totale du mât.',
          steps: [
            { tag: 'triangle pont OFM, rectangle en F', text: '$OM = \\dfrac{6}{\\sin 20°} \\approx 17{,}54$ m' },
            { tag: 'triangle cible OMT — angles', text: 'en O : 50° − 20° = 30° ; en M : 90° + 20° = 110° (F, M, T alignés sur la verticale) ; en T : 180° − 30° − 110° = 40°' },
            { tag: 'MT — loi des sinus', text: '$MT = \\dfrac{OM \\cdot \\sin 30°}{\\sin 40°} \\approx \\dfrac{17{,}54 \\times 0{,}5}{0{,}643} \\approx 13{,}65$ m' },
            { tag: 'hauteur totale', text: '6 + 13,65 = 19,65 m' },
          ],
          result: { tag: 'résultat', text: 'hauteur du mât ≈ 19,65 m' },
        },
        {
          kind: 'exemple',
          badge: 'hauteur inaccessible, deux visées depuis deux points',
          formula:
            'Depuis A, l\'angle d\'élévation vers le sommet S vaut α = 28°. On s\'approche de ' +
            'd = 40 m (point B, aligné avec A et le pied F) : l\'angle d\'élévation vaut alors β = 52°.',
          steps: [
            { tag: 'triangle pont ABS (quelconque) — angle en S', text: 'angle S = β − α = 52° − 28° = 24°' },
            { tag: 'angle en B (dans le triangle ABS)', text: '180° − β = 180° − 52° = 128° (angle en A = α = 28°, somme = 180° ✓)' },
            { tag: 'côté BS — loi des sinus', text: 'BS/sin Â = AB/sin Ŝ → BS = 40×sin 28°/sin 24° ≈ 46,2 m' },
            { tag: 'triangle cible BFS, rectangle en F', text: 'h = BS×sin β ≈ 46,2×sin 52° ≈ 36,4 m' },
          ],
          result: { tag: 'résultat', text: 'hauteur de la tour ≈ 36,4 m' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'triangulation',
            labels: { A: 'A', B: 'B', F: 'F', S: 'S', distanceLabel: 'd = 40 m', heightLabel: 'h', angleAtA: 'α', angleAtB: 'β' },
            caption:
              'deux visées depuis deux points : la différence β − α donne l\'angle en S du ' +
              'triangle pont ABS, résolu par la loi des sinus. Le triangle cible BFS, ' +
              'rectangle, donne ensuite h.',
          },
        },
        {
          kind: 'atelier',
          tag: 'triangulation-widget',
          label: 'Manipule toi-même : la triangulation',
          caption:
            'Mesure une hauteur inaccessible avec deux triangles liés. Le triangle pont, en ' +
            'violet, se résout d\'abord avec les données ; il transmet un côté au triangle ' +
            'cible, en orange, qui contient la grandeur cherchée. Compare les deux ' +
            'configurations : un seul point d\'observation et un repère de hauteur connue, ' +
            'ou deux visées depuis deux points. Les réglages de départ reproduisent les ' +
            'exemples ci-dessus.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4,
            xMax: 42,
            yMin: -5,
            yMax: 36,
            showAxes: false,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 36.86, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 11.15, y: 30.64 }, tone: 'faint', arrow: false },
              { from: { x: 36.86, y: 0 }, to: { x: 11.15, y: 30.64 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 26.86, y: 0 }, tone: 'good', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 8.42, y: 23.13 }, tone: 'good', arrow: false },
              { from: { x: 26.86, y: 0 }, to: { x: 8.42, y: 23.13 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 36.86, y: 0, label: 'A', tone: 'ink', labelPos: 'right' },
              { x: 11.15, y: 30.64, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 26.86, y: 0, label: 'C', tone: 'good', labelPos: 'below' },
              { x: 8.42, y: 23.13, label: 'D', tone: 'good', labelPos: 'left' },
              { x: 31.86, y: 0, label: '10 km', tone: 'ink', labelPos: 'above', node: false },
              { x: 9.79, y: 26.89, label: '8 km', tone: 'ink', labelPos: 'left', node: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 70, radiusPx: 22, label: '70°', tone: 'accent' }],
            caption:
              'sommet partagé : le triangle pont OAB et le triangle cible OCD ont le même ' +
              'sommet O et le même angle en O. C et D sont les positions des navires, ' +
              'à 10 km de A et à 8 km de B.',
          },
        },
        {
          kind: 'exemple',
          badge: 'deux navires, sommet partagé',
          formula:
            'Deux navires quittent le même port O vers les destinations A et B, distantes de ' +
            '40 km. On connaît les angles $\\widehat{OAB} = 50°$ et $\\widehat{OBA} = 60°$. ' +
            'Il reste au premier navire 10 km à parcourir, au second 8 km. Quelle distance ' +
            'les sépare ?',
          steps: [
            { tag: 'triangle pont OAB — angle en O', text: '$\\hat{O} = 180° - 50° - 60° = 70°$' },
            { tag: 'OA — loi des sinus', text: '$OA = \\dfrac{40 \\times \\sin 60°}{\\sin 70°} \\approx 36{,}86$ km' },
            { tag: 'OB — loi des sinus', text: '$OB = \\dfrac{40 \\times \\sin 50°}{\\sin 70°} \\approx 32{,}61$ km' },
            {
              tag: 'soustraction — côtés du triangle cible',
              text: '$OC = 36{,}86 - 10 = 26{,}86$ km et $OD = 32{,}61 - 8 = 24{,}61$ km',
            },
            {
              tag: 'triangle cible OCD — Al-Kashi',
              text: '$CD^2 = 26{,}86^2 + 24{,}61^2 - 2 \\times 26{,}86 \\times 24{,}61 \\times \\cos 70° \\approx 874{,}9$',
            },
            { tag: 'racine carrée', text: '$CD \\approx \\sqrt{874{,}9} \\approx 29{,}58$ km' },
          ],
          result: { tag: 'résultat', text: 'distance entre les deux navires ≈ 29,58 km' },
        },
        {
          kind: 'astuce',
          label: 'Repérer le triangle cible',
          text:
            'La grandeur finale demandée par l\'énoncé — une hauteur, une distance, une aire — ' +
            'appartient presque toujours au triangle **cible**. C\'est celui qui n\'est pas ' +
            'directement mesurable. Pars de cette grandeur, et remonte jusqu\'au triangle ' +
            'pont : ça t\'aide à choisir dans quel ordre résoudre les deux triangles.',
        },
        {
          kind: 'entrainement',
          title: 'Triangles liés',
          generatorId: 'gen58',
          description: [
            'Résous un triangle pont (rectangle ou quelconque). Transfère un côté ou un angle ' +
              'vers un triangle cible, dans 11 contextes différents (terrains, hauteurs ' +
              'inaccessibles, câble, falaise, navires, randonneurs, avions...). Puis interprète le résultat.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 58. Triangles liés »',
        },
        {
          kind: 'subheading',
          text: 'Composer deux forces ou deux vitesses',
        },
        {
          kind: 'para',
          text:
            'Les mêmes outils servent en physique. Deux forces (ou deux vitesses : la vitesse ' +
            'propre d\'un bateau et le courant, celle d\'un avion et le vent) qui partent d\'un même ' +
            'point O s\'additionnent par la **règle du parallélogramme**, que le chapitre 6 reprend ' +
            'en détail : la résultante $\\vec{F_R} = \\vec{F_1} + \\vec{F_2}$ est la diagonale [OC] ' +
            'du parallélogramme construit sur $\\vec{F_1}$ et $\\vec{F_2}$. En reportant ' +
            '$\\vec{F_2}$ à l\'extrémité de $\\vec{F_1}$, on obtient le triangle OAC, de côtés ' +
            '$F_1$, $F_2$ et $F_R$ : c\'est lui qu\'on résout, avec Al-Kashi ou la loi des sinus.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.8,
            xMax: 7.2,
            yMin: -0.8,
            yMax: 3.6,
            showAxes: false,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 5, y: 0 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 1.5, y: 2.6 }, tone: 'good' },
              { from: { x: 5, y: 0 }, to: { x: 6.5, y: 2.6 }, tone: 'faint', dashed: true },
              { from: { x: 1.5, y: 2.6 }, to: { x: 6.5, y: 2.6 }, tone: 'faint', dashed: true },
              { from: { x: 0, y: 0 }, to: { x: 6.5, y: 2.6 }, tone: 'tip' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 1.5, y: 2.6, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 6.5, y: 2.6, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 2.5, y: -0.4, vectorLabel: [{ text: 'F', vector: true }, { text: '₁' }], tone: 'accent', node: false },
              { x: 0.35, y: 1.5, vectorLabel: [{ text: 'F', vector: true }, { text: '₂' }], tone: 'good', node: false, labelPos: 'left' },
              { x: 3.9, y: 1.95, vectorLabel: [{ text: 'F', vector: true }, { text: 'R' }], tone: 'tip', node: false },
            ],
            angleArcs: [
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 60, radiusPx: 26, label: 'θ', tone: 'accent' },
              { cx: 5, cy: 0, fromDeg: 60, toDeg: 180, radiusPx: 22, label: '180° − θ', tone: 'attn' },
            ],
            caption:
              'le triangle OAC : $OA = F_1$, $AC = F_2$ (report de $\\vec{F_2}$) et $OC = F_R$. ' +
              'Son angle en A vaut $180° - \\theta$, pas $\\theta$',
          },
        },
        {
          kind: 'piege',
          label: 'Piège — l\'angle à mettre dans Al-Kashi',
          text:
            'L\'angle θ donné entre les deux vecteurs, mesuré en O, n\'est **pas** un angle du ' +
            'triangle OAC. Deux angles consécutifs d\'un parallélogramme sont supplémentaires : ' +
            'l\'angle en A vaut $180° - \\theta$, et ' +
            '$F_R^2 = F_1^2 + F_2^2 - 2 F_1 F_2 \\cos(180° - \\theta)$. Mettre θ directement dans ' +
            'la formule donne la longueur de l\'**autre** diagonale [AB], pas la résultante.',
        },
        {
          kind: 'astuce',
          label: 'Quand c\'est la direction de la résultante qui est imposée',
          text:
            'Un pilote qui veut suivre une route précise malgré le vent connaît la direction de ' +
            '$\\vec{v_R}$, mais pas son cap. Dans le triangle formé par le vent, le report de la ' +
            'vitesse propre et la route, l\'angle en O (entre le vent et la route) est connu ' +
            'directement : on commence par la **loi des sinus** pour trouver l\'angle entre le cap ' +
            'et la route. Pour une direction de la résultante, demande l\'angle avec le **plus ' +
            'grand** des deux vecteurs : il est opposé au plus petit côté, donc toujours aigu, et ' +
            'l\'arc sinus donne directement la bonne valeur.',
        },
        {
          kind: 'entrainement',
          title: 'Composer deux forces ou deux vitesses',
          generatorId: 'gen80',
          description: [
            'Bateau et courant, avion et vent, deux remorqueurs, deux personnes qui tirent une ' +
              'caisse : repère le triangle à résoudre dans le parallélogramme, trouve son angle ' +
              'intérieur (180° − θ), puis l\'intensité et la direction de la résultante. Variante : ' +
              'le cap à prendre pour suivre une route malgré le vent ou le courant.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 80. Composer deux forces ou deux vitesses »',
        },
      ],
    },
    {
      id: 'revision',
      number: 8,
      title: 'Révision — quiz vrai/faux',
      kicker: '245 affirmations en 7 thèmes, tout le chapitre',
      blocks: [
        { kind: 'video', title: 'Cercle trigonométrique et triangles quelconques — synthèse et points à vérifier', youtubeId: 'YjmwkQmAxsc' },
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre tout ce chapitre. 7 thèmes, un par générateur. ' +
            'Choisis-le librement.',
        },
        {
          kind: 'entrainement',
          title: 'Cercle trigonométrique & triangles quelconques — quiz vrai/faux',
          generatorId: 'gen63',
          description: [
            '245 affirmations pré-écrites, réparties en 7 thèmes (35 par thème), qui reprennent ' +
              'tout ce chapitre. Un seul essai par question. La justification est toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 63. Cercle trigonométrique & triangles quelconques — quiz vrai/faux »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Cercle trigonométrique',
        formulas: [
          { text: '$M(\\theta)=(\\cos\\theta\\,;\\,\\sin\\theta)$', condition: 'cercle de rayon 1' },
          {
            text:
              'quadrant I : $\\theta$ — quadrant II : $180°-\\theta$ — quadrant III : ' +
              '$\\theta-180°$ — quadrant IV : $360°-\\theta$',
            condition: 'angle du premier quadrant',
          },
          {
            text: 'I : $(+,+,+)$ — II : $(+,-,-)$ — III : $(-,-,+)$ — IV : $(-,+,-)$',
            condition: 'signes de $(\\sin\\theta,\\cos\\theta,\\tan\\theta)$ par quadrant',
          },
        ],
      },
      {
        title: 'Identité fondamentale & tangente',
        formulas: [
          { text: '$\\cos^2\\theta + \\sin^2\\theta = 1$' },
          { text: '$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$' },
        ],
      },
      {
        title: 'Valeurs remarquables',
        formulas: [
          {
            text:
              '$\\sin 0°=0,\\ \\sin 30°=\\tfrac12,\\ \\sin 45°=\\tfrac{\\sqrt2}{2},\\ ' +
              '\\sin 60°=\\tfrac{\\sqrt3}{2},\\ \\sin 90°=1$',
          },
          { text: '$\\cos\\theta$ : mêmes 5 valeurs, dans l\'ordre inverse' },
          {
            text: '$\\tan 30°=\\tfrac{\\sqrt3}{3},\\ \\tan 45°=1,\\ \\tan 60°=\\sqrt3$',
            condition: '$\\tan 90°$ indéfinie',
          },
        ],
      },
      {
        title: 'Angles associés',
        formulas: [
          {
            text: '$\\sin(90°-\\theta)=\\cos\\theta,\\ \\cos(90°-\\theta)=\\sin\\theta$',
            condition: 'complémentaire',
          },
          {
            text: '$\\sin(180°-\\theta)=\\sin\\theta,\\ \\cos(180°-\\theta)=-\\cos\\theta$',
            condition: 'supplémentaire',
          },
          {
            text: '$\\sin(180°+\\theta)=-\\sin\\theta,\\ \\cos(180°+\\theta)=-\\cos\\theta$',
            condition: 'anti-supplémentaire',
          },
          {
            text: '$\\sin(-\\theta)=-\\sin\\theta,\\ \\cos(-\\theta)=\\cos\\theta$',
            condition: 'opposé',
          },
        ],
      },
      {
        title: 'Équations trigonométriques',
        formulas: [
          {
            text: '$\\sin\\alpha=k$',
            condition:
              '$\\alpha_0$ : angle aigu tel que $\\sin\\alpha_0 = |k|$ — solutions $\\alpha_0$ et ' +
              '$180°-\\alpha_0$ si $k>0$, $180°+\\alpha_0$ et $360°-\\alpha_0$ si $k<0$',
          },
          {
            text: '$\\cos\\alpha=k$',
            condition:
              '$\\alpha_0$ : angle aigu tel que $\\cos\\alpha_0 = |k|$ — solutions $\\alpha_0$ et ' +
              '$360°-\\alpha_0$ si $k>0$, $180°-\\alpha_0$ et $180°+\\alpha_0$ si $k<0$',
          },
          {
            text: '$\\tan\\alpha=k$',
            condition:
              '$\\alpha_0$ : angle aigu tel que $\\tan\\alpha_0 = |k|$ — solutions $\\alpha_0$ et ' +
              '$180°+\\alpha_0$ si $k>0$, $180°-\\alpha_0$ et $360°-\\alpha_0$ si $k<0$ (toujours 2, ' +
              'espacées de 180°)',
          },
        ],
      },
      {
        title: 'Triangle quelconque',
        formulas: [
          {
            text: '$\\dfrac{a}{\\sin\\hat A}=\\dfrac{b}{\\sin\\hat B}=\\dfrac{c}{\\sin\\hat C}$',
            condition: 'loi des sinus — AAS ou SSA',
          },
          {
            text: '$a^2=b^2+c^2-2bc\\cos\\hat A$',
            condition: 'loi des cosinus (Al-Kashi) — SAS ou SSS',
          },
          {
            text: '$\\cos\\hat A=\\dfrac{b^2+c^2-a^2}{2bc}$',
            condition: 'Al-Kashi résolue en cosinus — pour un angle',
          },
          { text: '$\\text{Aire}=\\dfrac12\\,bc\\sin\\hat A$' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Cercle trigonométrique** — M(θ) = (cos θ ; sin θ), rayon 1. Le quadrant donne le ' +
        'signe de sin, cos et tan. L\'angle du premier quadrant vaut θ, 180°−θ, θ−180° ou ' +
        '360°−θ, selon le quadrant.',
      '**Identité fondamentale** — cos²θ + sin²θ = 1. Toujours avec un ± à trancher grâce au quadrant.',
      '**Valeurs remarquables** — 0°, 30°, 45°, 60°, 90°, à connaître exactement. Tu les ' +
        'étends à tout angle via l\'angle du premier quadrant, puis le signe du quadrant.',
      '**Angles associés** — 4 familles (90°−θ, 180°−θ, 180°+θ, −θ). Chacune a sa propre ' +
        'règle de signe sur sin, cos et tan.',
      '**Équations trigonométriques** — en général 2 solutions sur [0°;360°[. Seulement 1 ' +
        'pour sin/cos aux valeurs extrêmes. Toujours 2 pour tan.',
      '**Triangle quelconque** — loi des sinus (a/sinA=b/sinB=c/sinC) pour AAS/SSA (cas ' +
        'ambigu : tester B̂ et 180° − B̂). Loi des cosinus (a²=b²+c²−2bc·cosA) pour SAS/SSS. ' +
        'Aire = ½ab·sinC.',
      '**Triangulation** — résous d\'abord le triangle pont. Transfère un côté ou un angle ' +
        'vers le triangle cible, celui qui contient la grandeur demandée. Résous-le par la loi ' +
        'des sinus, par Al-Kashi, ou par la trigonométrie du triangle rectangle.',
    ],
    checklist: {
      items: [
        'Ai-je bien réduit tout angle donné dans [0°;360°[ avant de chercher son quadrant ?',
        'Ai-je gardé le ± en isolant cos θ ou sin θ ? Ai-je tranché le signe grâce au quadrant — jamais par réflexe ?',
        'Après une loi des cosinus, ai-je réutilisé Al-Kashi (pas la loi des sinus) pour l\'angle restant ?',
        'Ma tangente a-t-elle bien exactement 2 solutions sur [0°;360°[, quelle que soit la valeur de k ?',
        'Ma calculatrice est-elle en mode degrés ? Ai-je cherché moi-même la seconde solution que sin⁻¹ ou cos⁻¹ ne donne pas ?',
        'Dans le cas SSA, ai-je testé le second candidat 180° − B̂ (il faut Â + B̂ < 180°) ?',
      ],
    },
    forward:
      'En 5e, le chapitre Trigonométrie reprend ce cercle en radians, en fait des fonctions ' +
      '(sinusoïdes) et résout les équations sur ℝ tout entier, plus seulement sur [0° ; 360°[. ' +
      'La loi des sinus, Al-Kashi et le réflexe « quadrant → signe » restent, eux, des outils ' +
      'de base en géométrie comme en physique (forces, vecteurs, ondes).',
  },
}
