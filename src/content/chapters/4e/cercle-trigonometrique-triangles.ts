import type { ChapterContent } from '../../types'

const D2R = Math.PI / 180

export const cercleTrigonometriqueTriangles: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 5,
  title: 'Cercle trigonométrique & triangles quelconques',
  slug: 'cercle-trigonometrique-triangles',
  lede:
    "Ce chapitre construit d'abord un langage commun pour parler d'un angle — quel que soit sa " +
    "valeur, même au-delà de 90° — via le cercle trigonométrique, puis l'utilise pour résoudre " +
    "des triangles qui ne sont ni rectangles ni isocèles : le cas général, celui que les " +
    'triangles rectangles ne couvrent pas.',

  intro: {
    title: 'Avant de commencer : pourquoi un cercle ?',
    blocks: [
      {
        kind: 'para',
        text:
          'Dans un triangle rectangle, sinus et cosinus d\'un angle ne se définissent que pour ' +
          'des angles **entre 0° et 90°** — impossible d\'y donner un sens à $\\sin(150°)$ ou ' +
          '$\\cos(215°)$. Le **cercle trigonométrique** lève cette limite : il redéfinit sinus ' +
          'et cosinus comme de simples **coordonnées**, ce qui leur donne un sens pour ' +
          '**n\'importe quel angle**.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — le cercle trigonométrique',
        items: [
          'C\'est le cercle de **rayon 1**, centré à l\'origine d\'un repère. Un angle θ se ' +
            'place en partant de l\'axe horizontal positif et en tournant dans le **sens ' +
            'direct** (le sens inverse des aiguilles d\'une montre) ; il pointe vers un point ' +
            'du cercle, noté M(θ). Par définition : M(θ) a pour coordonnées (cos θ ; sin θ).',
          'Cette plateforme travaille exclusivement en **degrés** — jamais en radians — et ' +
            'réduit systématiquement tout angle à l\'intervalle [0° ; 360°[.',
          'Un tel angle, muni de ce sens de rotation, est appelé **angle orienté** — pour le ' +
            'distinguer d\'un angle géométrique ordinaire, qui n\'est qu\'une mesure, sans ' +
            'direction. Sur tous les schémas de ce chapitre, la **flèche** portée par l\'arc ' +
            'd\'un angle indique ce sens direct de rotation.',
        ],
      },
      {
        kind: 'rappel',
        label: 'Rappel — que devient M(θ) tout près des axes ?',
        items: [
          'Dans le quadrant I, quand θ se rapproche de 0°, le point M(θ) se rapproche de l\'axe ' +
            'horizontal : son cosinus se rapproche de 1, son sinus se rapproche de 0. À ' +
            'l\'inverse, quand θ se rapproche de 90°, M(θ) se rapproche de l\'axe vertical : son ' +
            'cosinus se rapproche de 0, son sinus se rapproche de 1 — une façon utile de ' +
            'retrouver de tête le sens d\'une valeur remarquable sans recalculer (section 2).',
        ],
      },
    ],
  },

  sections: [
    {
      id: 'cercle',
      number: 1,
      title: 'Le cercle trigonométrique : placer et lire un angle',
      kicker: 'quadrant → signes de sin/cos/tan → angle du premier quadrant',
      blocks: [
        {
          kind: 'para',
          text:
            'Le cercle est découpé en **4 quadrants** par les deux axes. Le quadrant dans ' +
            'lequel tombe θ fixe à lui seul le **signe** de son sinus, de son cosinus et de sa ' +
            'tangente — avant même tout calcul.',
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
            caption: 'θ = 150° tombe dans le quadrant II — son angle du premier quadrant (angle de référence) vaut 180°−150° = 30°',
          },
        },
        {
          kind: 'featureTable',
          caption: 'Signe de sin θ, cos θ et tan θ selon le quadrant',
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
            '0°, 90°, 180° et 270° n\'appartiennent à **aucun** quadrant — ils sont sur la ' +
            'frontière entre deux. Poser une question de signe pour l\'un de ces angles n\'a ' +
            'pas de sens : il faut donner sa valeur exacte directement (sin 90° = 1, cos 180° = −1, …).',
        },
        {
          kind: 'methode',
          label: 'Trouver l\'angle du premier quadrant',
          items: [
            'C\'est l\'angle aigu que fait OM(θ) avec l\'axe horizontal — la formule dépend ' +
              'uniquement du quadrant :',
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
        { kind: 'subheading', text: 'Pour aller plus loin — représenter tan θ sur le cercle' },
        {
          kind: 'para',
          text:
            'sin θ et cos θ se lisent directement comme des **coordonnées** de M(θ). tan θ, lui, ' +
            'se lit comme une **longueur** ailleurs sur la figure : sur la droite verticale ' +
            '**tangente** au cercle au point (1 ; 0), le prolongement du rayon OM(θ) coupe ' +
            'cette tangente en un point P(1 ; tan θ) — la distance entre P et l\'axe horizontal ' +
            'vaut exactement tan θ.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [{ angle: 45 * D2R, label: 'M', tone: 'accent' }],
            angleArcs: [{ from: 0, to: 45 * D2R, tone: 'accent', radiusPx: 22, arrow: true, label: 'α' }],
            tangentConstruction: { angle: 45 * D2R, label: 'tan α' },
            freeLabels: [{ x: 1, y: -0.09, text: '1' }],
            caption: 'α = 45° : OA = cos 45° et AM = sin 45° sont les coordonnées de M — AP = tan 45° = 1 se lit comme une longueur, sur la tangente verticale au cercle',
          },
        },
        {
          kind: 'astuce',
          text:
            'Cette construction rend visible, sans aucun calcul, deux faits déjà connus : tan θ ' +
            'grandit sans limite quand θ se rapproche de 90° (le point P s\'échappe vers le ' +
            'haut de la figure), et tan θ n\'est pas définie *en* 90° (le rayon OM devient ' +
            'parallèle à la tangente — il ne la coupe plus jamais).',
        },
        {
          kind: 'entrainement',
          title: 'Placement et lecture sur le cercle trigonométrique',
          generatorId: 'gen14',
          description: [
            'Réduis un angle dans [0°;360°[, situe-le dans son quadrant, trouve son angle du ' +
              'premier quadrant et les signes de sin/cos/tan.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 14. Placement et lecture sur le cercle trigonométrique »',
        },
      ],
    },
    {
      id: 'remarquables',
      number: 2,
      title: 'Les valeurs remarquables',
      kicker: '0°, 30°, 45°, 60°, 90° — à connaître par cœur, puis étendre par symétrie',
      blocks: [
        {
          kind: 'para',
          text:
            'Cinq angles du premier quadrant ont des valeurs de sinus, cosinus et tangente ' +
            '**exactes** (pas d\'arrondi) — elles reviennent sans cesse et méritent d\'être ' +
            'sues par cœur.',
        },
        { kind: 'subheading', text: 'Démonstration — d\'où viennent ces valeurs ?' },
        {
          kind: 'para',
          text:
            'Ces 5 valeurs ne s\'apprennent pas « par magie » : elles se retrouvent en quelques ' +
            'lignes à partir de deux triangles classiques, tous deux résolus par Pythagore.',
        },
        {
          kind: 'para',
          text:
            '**45°, à partir d\'un triangle rectangle isocèle.** Deux côtés de l\'angle droit ' +
            'de longueur 1 : l\'hypoténuse vaut $\\sqrt{1^2+1^2}=\\sqrt{2}$ par Pythagore, et les ' +
            'deux autres angles valent forcément 45° chacun (triangle isocèle, la somme des ' +
            'angles fait 180°).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'rightTriangle',
            legs: { horizontal: 1, vertical: 1 },
            sideLabels: { horizontal: '1', vertical: '1', hypotenuse: '√2' },
            angleLabels: { atLeft: '45°', atRight: '45°' },
            caption: 'triangle rectangle isocèle, côtés 1 et 1, hypoténuse √2 — sin 45° = cos 45° = 1/√2 = √2/2',
          },
        },
        {
          kind: 'exemple',
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
            'équilatéral de côté 2 a 3 angles de 60°. Sa hauteur, tracée depuis un sommet, ' +
            'coupe le côté opposé en son milieu et le partage en 2 triangles rectangles ' +
            'identiques — hauteur = $\\sqrt{2^2-1^2}=\\sqrt{3}$ par Pythagore.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'rightTriangle',
            legs: { horizontal: 1, vertical: Math.sqrt(3) },
            sideLabels: { horizontal: '1', vertical: '√3', hypotenuse: '2' },
            angleLabels: { atLeft: '60°', atRight: '30°' },
            caption: 'moitié d\'un triangle équilatéral de côté 2 : demi-base 1, hauteur √3, hypoténuse 2 (le côté d\'origine)',
          },
        },
        {
          kind: 'exemple',
          steps: [{ tag: 'à l\'angle de 60°', text: 'sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3' }],
          result: { tag: 'à l\'angle de 30°', text: 'sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3 = √3/3' },
        },
        {
          kind: 'para',
          text:
            'Restent 0° et 90°, sans triangle à construire : M(θ) est alors exactement sur un ' +
            'axe (rappel, section 1) — cos 0° = 1 et sin 0° = 0 ; cos 90° = 0 et sin 90° = 1.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'circleAngles',
            points: [0, 30, 45, 60, 90].map((d) => ({ angle: d * D2R, label: `${d}°`, tone: 'accent' as const })),
            angleArcs: [{ from: 0, to: 90 * D2R, tone: 'accent', radiusPx: 100 }],
            caption: 'les 5 angles remarquables du quadrant I, tous sur le cercle de rayon 1',
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
            '$\\sqrt{0}/2, \\sqrt{1}/2, \\sqrt{2}/2, \\sqrt{3}/2, \\sqrt{4}/2$, qui se ' +
            'simplifient en $0, 1/2, \\sqrt{2}/2, \\sqrt{3}/2, 1$ — le nombre sous la racine ' +
            'augmente simplement de 1 à chaque angle. Les cosinus sont exactement les mêmes 5 ' +
            'valeurs, lues dans l\'ordre inverse (cos 0° = sin 90°, cos 30° = sin 60°, …) : un ' +
            'seul motif à mémoriser pour les deux lignes du tableau.',
        },
        {
          kind: 'methode',
          label: 'Étendre aux 3 autres quadrants',
          items: [
            'Une valeur remarquable hors du premier quadrant se retrouve en 2 étapes : ' +
              'chercher son **angle du premier quadrant** (section 1), lire sa valeur dans le ' +
              'tableau ci-dessus, puis lui appliquer le **signe** du quadrant de départ ' +
              '(tableau de signes, section 1).',
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
          kind: 'entrainement',
          title: 'Valeurs remarquables',
          generatorId: 'gen15',
          description: [
            'Donne sin, cos ou tan d\'un angle remarquable (0/30/45/60/90° et ses symétriques) ' +
              'dans n\'importe quel quadrant.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 15. Valeurs remarquables »',
        },
      ],
    },
    {
      id: 'identite',
      number: 3,
      title: 'L\'identité fondamentale : retrouver sin ou cos',
      kicker: 'cos²θ + sin²θ = 1 — un théorème de Pythagore déguisé',
      blocks: [
        {
          kind: 'para',
          text:
            'Le point M(θ) = (cos θ ; sin θ) est, par définition, sur le cercle de rayon 1 : le ' +
            'triangle rectangle formé par O, M et le pied de sa projection sur l\'axe ' +
            'horizontal donne directement Pythagore.',
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
            caption: 'OP² + PM² = OM² devient cos²θ + sin²θ = 1² — vrai pour tout angle θ, dans n\'importe quel quadrant',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Formule',
          blocks: [
            { kind: 'para', text: '$\\cos^2\\theta + \\sin^2\\theta = 1$' },
            { kind: 'para', text: 'Connaître l\'un des deux (sin θ ou cos θ) permet donc de retrouver l\'autre — à un signe près, tranché par le quadrant.' },
          ],
        },
        {
          kind: 'methode',
          items: [
            'Isoler le terme cherché : $\\cos^2\\theta = 1-\\sin^2\\theta$ (ou l\'inverse).',
            'Prendre la racine carrée : $\\cos\\theta = \\pm\\sqrt{1-\\sin^2\\theta}$ — **deux** valeurs possibles à ce stade.',
            'Trancher le signe grâce au quadrant (ou à l\'intervalle) donné dans l\'énoncé pour θ.',
            'Si besoin, en déduire $\\tan\\theta = \\sin\\theta/\\cos\\theta$.',
          ],
        },
        {
          kind: 'piege',
          label: 'Oublier le ±',
          text:
            'Une racine carrée donne toujours deux possibilités de signe. Répondre directement ' +
            '$\\cos\\theta = \\sqrt{1-\\sin^2\\theta}$ (sans le ±, ni la vérification du ' +
            'quadrant) revient à supposer, sans le dire, que θ est dans un quadrant où cos θ ' +
            'est positif — faux une fois sur deux.',
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
          kind: 'entrainement',
          title: 'L\'un sans l\'autre',
          generatorId: 'gen16',
          description: ['Retrouve sin θ ou cos θ à partir de l\'autre et d\'un intervalle sur θ, puis tan θ.'],
          chantier: '4e',
          whereLabel: '4e → « 16. L\'un sans l\'autre »',
        },
      ],
    },
    {
      id: 'associes',
      number: 4,
      title: 'Les angles associés',
      kicker: '4 familles de symétries autour de θ, sans jamais recalculer une valeur',
      blocks: [
        {
          kind: 'para',
          text:
            'Certains angles se déduisent d\'un angle θ déjà connu par une simple **symétrie** ' +
            'sur le cercle — inutile de tout recalculer, il suffit de connaître la règle de ' +
            'transformation qui va avec chaque symétrie.',
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
          kind: 'astuce',
          label: 'Reconnaître la bonne famille',
          text:
            'Trois indices suffisent : est-ce que le signe devant θ est **+** ou **−** ? ' +
            'est-ce qu\'on part de **90°** ou de **180°** ? et si c\'est 180°, est-ce ' +
            '**180°−θ** ou **180°+θ** ? Ces trois réponses désignent la famille sans ambiguïté.',
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
          kind: 'entrainement',
          title: 'Angles associés',
          generatorId: 'gen17',
          description: [
            'À partir de sin, cos ou tan d\'un angle de base, détermine la valeur pour un angle ' +
              'associé (complémentaire, supplémentaire, anti-supplémentaire ou opposé).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 17. Angles associés »',
        },
      ],
    },
    {
      id: 'equations',
      number: 5,
      title: 'Résoudre une équation trigonométrique',
      kicker: 'sin α = k / cos α = k / tan α = k, sur [0° ; 360°[',
      blocks: [
        {
          kind: 'para',
          text:
            'Une équation du type sin α = k a, en général, **deux** solutions distinctes sur ' +
            '[0° ; 360°[ — la seconde étant toujours liée à la première par une symétrie de la ' +
            'section précédente.',
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
            'Trouver l\'angle de référence α₀ tel que sin/cos/tan de α₀ vaille |k| (table des ' +
              'valeurs remarquables, section 2).',
            'En déduire les 2 solutions par la symétrie adaptée : pour sin α = k, α₀ et ' +
              '180° − α₀ si k > 0 (ou 180° + α₀ et 360° − α₀ si k < 0) ; pour cos α = k, α₀ et ' +
              '360° − α₀ si k > 0 (ou 180° − α₀ et 180° + α₀ si k < 0).',
            'Pour tan α = k : les 2 solutions sont toujours α₀ et α₀ + 180°, quel que soit le ' +
              'signe de k — la tangente a une période de 180°.',
          ],
        },
        {
          kind: 'attention',
          label: 'Cas limites — parfois une seule solution',
          text:
            'Quand k vaut exactement 1 ou −1 pour sin ou cos, les 2 solutions se confondent en ' +
            '**une seule** : sin α = 1 → une seule solution (90°) ; cos α = −1 → une seule ' +
            'solution (180°). La tangente, elle, garde toujours **exactement 2** solutions sur ' +
            '[0°;360°[, quelle que soit la valeur de k — l\'intervalle couvre exactement 2 ' +
            'fois sa période de 180°.',
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
          kind: 'entrainement',
          title: 'Quel angle ?',
          generatorId: 'gen18',
          description: [
            'Résous sin α = k, cos α = k ou tan α = k (k valeur remarquable) sur [0°;360°[, ' +
              'avec une aide combinée quadrants + candidats + projections en cas de blocage.',
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
        {
          kind: 'para',
          text:
            'Sans angle droit, Pythagore et la trigonométrie « côté opposé / hypoténuse » ne ' +
            's\'appliquent plus. Deux nouvelles lois prennent le relais — chacune adaptée à un ' +
            'type de données différent.',
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
        { kind: 'subheading', text: 'La loi des sinus' },
        {
          kind: 'para',
          text: '$\\dfrac{a}{\\sin \\hat{A}} = \\dfrac{b}{\\sin \\hat{B}} = \\dfrac{c}{\\sin \\hat{C}}$',
        },
        {
          kind: 'para',
          text:
            'Utile dès que l\'on connaît **2 angles et 1 côté** (AAS), ou **2 côtés et un ' +
            'angle non compris** entre eux (SSA — le « cas ambigu », qui peut donner 0, 1 ou 2 triangles).',
        },
        {
          kind: 'para',
          text:
            'Certains énoncés l\'écrivent sous la forme **réciproque**, strictement ' +
            'équivalente : $\\sin \\hat{A}/a = \\sin \\hat{B}/b = \\sin \\hat{C}/c$ — les deux écritures répondent ' +
            'exactement aux mêmes questions.',
        },
        { kind: 'subheading', text: 'La loi des cosinus (Al-Kashi)' },
        { kind: 'para', text: '$a^2 = b^2 + c^2 - 2bc\\cos \\hat{A}$' },
        {
          kind: 'para',
          text:
            'Utile dès que l\'on connaît **2 côtés et l\'angle compris** entre eux (SAS), ou ' +
            'les **3 côtés** (SSS, en isolant le cosinus). Pythagore n\'en est qu\'un cas ' +
            'particulier : si Â = 90°, cos Â = 0, et la formule redevient $a^2=b^2+c^2$.',
        },
        { kind: 'subheading', text: 'L\'aire' },
        {
          kind: 'para',
          text: 'Aire = $\\dfrac{1}{2}ab\\sin \\hat{C} = \\dfrac{1}{2}bc\\sin \\hat{A} = \\dfrac{1}{2}ac\\sin \\hat{B}$',
        },
        {
          kind: 'para',
          text:
            'Deux côtés et l\'angle compris entre eux suffisent — aucune hauteur à construire ' +
            '— et les trois écritures donnent bien sûr la même aire.',
        },
        { kind: 'subheading', text: 'Démonstration — la loi des sinus' },
        {
          kind: 'para',
          text:
            'On abaisse la hauteur issue de C, de longueur h, qui coupe [AB] en un point H — ' +
            'cela crée deux triangles rectangles qui partagent cette hauteur.',
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
          steps: [
            { tag: 'dans ACH, rectangle en H', text: 'sin Â = CH/AC = h/b, donc h = b sin Â' },
            { tag: 'dans BCH, rectangle en H', text: 'sin B̂ = CH/BC = h/a, donc h = a sin B̂' },
            { tag: 'en égalant les deux expressions de h', text: 'a sin B̂ = b sin Â' },
          ],
          result: { tag: 'résultat', text: 'a/sin Â = b/sin B̂ — et le même raisonnement, hauteur abaissée depuis un autre sommet, donne l\'égalité avec c/sin Ĉ' },
        },
        {
          kind: 'rappel',
          label: 'Et si le triangle est obtus ?',
          items: [
            'Le pied H peut alors tomber à l\'extérieur du segment [AB]. Le raisonnement reste ' +
              'identique : seul change le fait que l\'un des angles utilisés dans le triangle ' +
              'rectangle est le **supplément** de l\'angle du triangle ABC — et comme ' +
              'sin(180°−x) = sin x (angles associés, section 4), la conclusion finale est inchangée.',
          ],
        },
        { kind: 'subheading', text: 'Démonstration — la loi des cosinus et l\'aire' },
        {
          kind: 'para',
          text:
            'On place A à l\'origine d\'un repère, B sur l\'axe horizontal à distance c. Alors ' +
            'C a pour coordonnées (b cos Â ; b sin Â) — exactement M(θ) sur le cercle ' +
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
            caption: 'C = (b cos Â ; b sin Â) — les côtés a et c se lisent alors directement par Pythagore et par l\'aire d\'un triangle base×hauteur/2',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Loi des cosinus',
          blocks: [
            { kind: 'para', text: 'Pythagore, hypoténuse BC = a : $a^2 = (c-b\\cos \\hat{A})^2 + (b\\sin \\hat{A})^2$' },
            { kind: 'para', text: 'Développer : $a^2 = c^2 - 2bc\\cos \\hat{A} + b^2\\cos^2 \\hat{A} + b^2\\sin^2 \\hat{A}$' },
            { kind: 'para', text: 'Identité fondamentale (section 3) : $b^2\\cos^2 \\hat{A} + b^2\\sin^2 \\hat{A} = b^2(\\cos^2 \\hat{A}+\\sin^2 \\hat{A}) = b^2$' },
            { kind: 'para', text: 'Résultat : $a^2 = b^2+c^2-2bc\\cos \\hat{A}$' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Aire',
          blocks: [
            { kind: 'para', text: 'Hauteur au-dessus de [AB] : l\'ordonnée de C vaut b sin Â — c\'est exactement la hauteur du triangle issue de C.' },
            { kind: 'para', text: 'Aire = base×hauteur/2 : Aire = (c × b sin Â)/2 = ½bc sin Â' },
          ],
        },
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
          kind: 'piege',
          label: 'Après Al-Kashi, ne pas retomber dans l\'ambiguïté',
          text:
            'Une fois un côté trouvé par Al-Kashi (cas SAS), il est tentant de basculer sur la ' +
            'loi des sinus pour calculer un angle restant — mais arcsin renvoie **deux** ' +
            'angles possibles (un aigu, un obtus), et rien ne dit lequel est le bon. Le plus ' +
            'sûr : réutiliser **Al-Kashi** une seconde fois (résolu en cosinus, qui ne souffre ' +
            'pas de cette ambiguïté sur ]0°;180°[) pour trouver l\'angle restant.',
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
          kind: 'entrainement',
          title: 'Triangle quelconque',
          generatorId: 'gen19',
          description: [
            'Retrouve un côté ou un angle manquant (loi des sinus ou Al-Kashi selon les ' +
              'données), puis calcule l\'aire via ½·a·b·sin(C).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 19. Triangle quelconque »',
        },
      ],
    },
    {
      id: 'triangulation',
      number: 7,
      title: 'Triangles liés : la triangulation',
      kicker: 'résoudre un triangle « pont » pour en transférer un élément vers un triangle « cible »',
      blocks: [
        {
          kind: 'para',
          text:
            'Sur le terrain, on ne peut pas toujours mesurer directement le côté qui nous ' +
            'intéresse (une hauteur, une distance entre deux points inaccessibles…). La ' +
            '**triangulation** contourne le problème avec **deux triangles** : un triangle ' +
            '**pont**, entièrement résoluble avec les données de l\'énoncé, dont on tire un ' +
            'côté ou un angle qui devient une donnée du triangle **cible** — toujours ' +
            'quelconque, résolu à la fin par la loi des sinus.',
        },
        {
          kind: 'methode',
          label: 'Les 2 façons de relier les deux triangles',
          items: [
            '**Côté partagé** — les deux triangles ont un vrai côté en commun (une diagonale, ' +
              'par exemple) : on calcule sa longueur dans le triangle pont, puis on l\'utilise ' +
              'comme côté connu du triangle cible, dont les 2 autres angles sont déjà donnés ' +
              'par l\'énoncé.',
            '**Angle partagé** — deux visées prises depuis un même point donnent, par leur ' +
              'différence, un angle du triangle cible ; une seconde hypothèse propre au ' +
              'contexte (souvent un angle droit) ferme le triangle.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'triangulation',
            labels: { A: 'A', B: 'B', F: 'F', S: 'S', distanceLabel: 'd = 40 m', heightLabel: 'h', angleAtA: 'α', angleAtB: 'β' },
            caption: 'angle partagé : la différence β−α entre les deux visées donne l\'angle en S du triangle cible ABS, résolu par la loi des sinus, avant de repasser par le triangle rectangle BFS pour obtenir h',
          },
        },
        {
          kind: 'exemple',
          badge: 'hauteur inaccessible, angle partagé',
          formula: 'Depuis A, l\'angle d\'élévation vers le sommet S vaut α = 28°. En s\'approchant de d = 40 m (point B, aligné avec A et le pied F), l\'angle d\'élévation vaut β = 52°.',
          steps: [
            { tag: 'triangle cible ABS — angle en S', text: 'angle S = β − α = 52° − 28° = 24°' },
            { tag: 'angle en B (dans le triangle ABS)', text: '180° − β = 180° − 52° = 128° (angle en A = α = 28°, somme = 180° ✓)' },
            { tag: 'côté BS — loi des sinus', text: 'BS/sin Â = AB/sin Ŝ → BS = 40×sin 28°/sin 24° ≈ 46,2 m' },
            { tag: 'triangle pont rectangle BFS', text: 'h = BS×sin β ≈ 46,2×sin 52° ≈ 36,4 m' },
          ],
          result: { tag: 'résultat', text: 'hauteur de la tour ≈ 36,4 m' },
        },
        {
          kind: 'astuce',
          label: 'Repérer le triangle cible',
          text:
            'La grandeur finale demandée par l\'énoncé (une hauteur, une distance, une aire) ' +
            'appartient presque toujours au triangle **cible** — celui qui n\'est pas ' +
            'directement mesurable. Partir de cette grandeur et remonter jusqu\'au triangle ' +
            'pont aide à choisir dans quel ordre résoudre les deux triangles.',
        },
        {
          kind: 'entrainement',
          title: 'Triangles liés',
          generatorId: 'gen58',
          description: [
            'Résous un triangle pont (rectangle ou quelconque) pour en transférer un côté ou ' +
              'un angle vers un triangle cible, dans 4 contextes narratifs (terrain, hauteur ' +
              'inaccessible, distance entre deux points inaccessibles), puis interprète le résultat.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 58. Triangles liés »',
        },
      ],
    },
    {
      id: 'revision',
      number: 8,
      title: 'Révision — quiz vrai/faux',
      kicker: '140 affirmations en 7 thèmes, tout le chapitre',
      blocks: [
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre transversalement les 7 générateurs de ce chapitre — ' +
            'un thème par générateur, choisi librement.',
        },
        {
          kind: 'entrainement',
          title: 'Cercle trigonométrique & triangles quelconques — quiz vrai/faux',
          generatorId: 'gen63',
          description: [
            '140 affirmations pré-écrites réparties en 7 thèmes (20 par thème) qui reprennent ' +
              'tout ce chapitre. Un seul essai par question, la justification est toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 63. Cercle trigonométrique & triangles quelconques — quiz vrai/faux »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Cercle trigonométrique** — M(θ) = (cos θ ; sin θ), rayon 1 ; quadrant → signe de ' +
        'sin/cos/tan ; angle du premier quadrant = θ, 180°−θ, θ−180° ou 360°−θ selon le quadrant.',
      '**Valeurs remarquables** — 0/30/45/60/90° à connaître exactement, étendues à tout angle ' +
        'via l\'angle du premier quadrant + le signe du quadrant.',
      '**Identité fondamentale** — cos²θ + sin²θ = 1, toujours accompagnée d\'un ± tranché par le quadrant.',
      '**Angles associés** — 4 familles (90°−θ, 180°−θ, 180°+θ, −θ), chacune sa propre règle ' +
        'de signe sur sin/cos/tan.',
      '**Équations trigonométriques** — en général 2 solutions sur [0°;360°[ (1 pour sin/cos ' +
        'aux valeurs extrêmes, toujours 2 pour tan).',
      '**Triangle quelconque** — loi des sinus (a/sinA=b/sinB=c/sinC) pour AAS/SSA, loi des ' +
        'cosinus (a²=b²+c²−2bc·cosA) pour SAS/SSS, aire = ½ab·sinC.',
      '**Triangulation** — triangle pont résolu en premier, un côté ou un angle transféré vers ' +
        'le triangle cible, résolu par la loi des sinus.',
    ],
    checklist: {
      items: [
        'Ai-je bien réduit tout angle donné dans [0°;360°[ avant de chercher son quadrant ?',
        'Ai-je gardé le ± en isolant cos θ ou sin θ, et tranché le signe par le quadrant — jamais par réflexe ?',
        'Après une loi des cosinus, ai-je réutilisé Al-Kashi (pas la loi des sinus) pour l\'angle restant ?',
        'Ma tangente a-t-elle bien exactement 2 solutions sur [0°;360°[, quelle que soit la valeur de k ?',
      ],
    },
    forward:
      'La loi des sinus, la loi des cosinus et le réflexe « quadrant → signe » reviendront ' +
      'tels quels dans tout futur chapitre de géométrie ou de physique — c\'est le socle sur ' +
      'lequel repose toute trigonométrie au-delà du triangle rectangle.',
  },
}
