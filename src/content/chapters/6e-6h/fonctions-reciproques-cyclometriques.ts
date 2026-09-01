import type { ChapterContent } from '../../types'

const PI = Math.PI

export const fonctionsReciproquesCyclometriques: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 1,
  title: 'Fonctions réciproques & cyclométriques',
  slug: 'fonctions-reciproques-cyclometriques',
  lede:
    'Toute fonction bijective peut être « défaite » par une réciproque — et quand on applique ' +
    'cette idée à sin, cos et tan, on obtient trois nouvelles fonctions, les arcfonctions, ' +
    "indispensables pour résoudre des équations trigonométriques et lire des angles à partir " +
    "d'un rapport.",

  sections: [
    {
      id: 'reciproques',
      number: 1,
      title: "Fonction réciproque d'une fonction bijective",
      blocks: [
        { kind: 'video', title: 'Fonctions réciproques & cyclométriques' },
        {
          kind: 'para',
          text:
            'Une fonction $f$ définie sur un ensemble $A$ et à valeurs dans un ensemble $B$ peut ' +
            'avoir trois propriétés indépendantes :',
        },
        {
          kind: 'definition',
          items: [
            '$f$ est **injective** si $f(x_1) = f(x_2)$ entraîne toujours $x_1 = x_2$ — deux ' +
              'entrées différentes ne donnent jamais la même image.',
            '$f$ est **surjective** sur $B$ si Image($f$) = $B$ exactement — pas seulement ' +
              'inclus dans $B$.',
            '$f$ est **bijective** sur $B$ si elle est injective ET surjective sur $B$, les ' +
              'deux à la fois.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'setMapping',
              setALabel: 'A',
              setBLabel: 'B',
              pointsA: [0, 0.5, 1],
              pointsB: [0, 1 / 3, 2 / 3, 1],
              arrows: [
                { from: 0, to: 0 },
                { from: 1, to: 1 },
                { from: 2, to: 3 },
              ],
              caption:
                'Injective (deux flèches distinctes → deux images distinctes) mais non ' +
                "surjective : un élément de B n'est atteint par personne.",
            },
            {
              kind: 'setMapping',
              setALabel: 'A',
              setBLabel: 'B',
              pointsA: [0, 1 / 3, 2 / 3, 1],
              pointsB: [0, 0.5, 1],
              arrows: [
                { from: 0, to: 0 },
                { from: 1, to: 0 },
                { from: 2, to: 1 },
                { from: 3, to: 2 },
              ],
              caption:
                'Surjective (tout élément de B est atteint) mais non injective : deux éléments ' +
                'de A partagent la même image.',
            },
            {
              kind: 'setMapping',
              setALabel: 'A',
              setBLabel: 'B',
              pointsA: [0, 0.5, 1],
              pointsB: [0, 0.5, 1],
              arrows: [
                { from: 0, to: 0 },
                { from: 1, to: 1 },
                { from: 2, to: 2 },
              ],
              caption: 'Bijective : injective ET surjective — chaque élément de B est atteint exactement une fois.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: "💡 Lire l'injectivité sur un graphique",
          text:
            'Une fonction est injective si et seulement si **toute droite horizontale coupe ' +
            'son graphe en au plus un point** — c\'est le test le plus rapide pour trancher sans calcul.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              compact: true,
              curves: [{ fn: (x) => (x * x * x) / 4, tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              testLine: { y: 0.5, points: [{ x: Math.cbrt(2) }] },
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'Une seule intersection → injective.',
            },
            {
              kind: 'curvePlot',
              compact: true,
              curves: [{ fn: (x) => x * x - 1, tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              testLine: { y: 0.5, points: [{ x: -Math.sqrt(1.5) }, { x: Math.sqrt(1.5) }] },
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'Deux intersections → non injective.',
            },
          ],
        },
        {
          kind: 'para',
          text:
            "Seule une fonction bijective (entre un domaine et un ensemble d'arrivée bien " +
            'choisis) possède une **réciproque**, notée $f^{-1}$, qui « défait » $f$ :',
        },
        { kind: 'para', text: '$f^{-1}(f(x)) = x \\quad$ et $\\quad f(f^{-1}(y)) = y$' },
        {
          kind: 'para',
          text:
            'Autrement dit, dès que $f$ est **injective**, sa réciproque existe déjà comme ' +
            "fonction — il suffit de restreindre l'ensemble d'arrivée à Image($f$) pour obtenir " +
            'la bijectivité automatiquement.',
        },
        {
          kind: 'para',
          text:
            "À l'inverse, si $f$ n'est pas injective, sa relation réciproque n'est pas une " +
            'fonction — un même $x$ y aurait plusieurs images :',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => x * x, tone: 'accent', xMin: -Math.sqrt(2), xMax: Math.sqrt(2) },
              { fn: (x) => Math.sqrt(Math.max(0, x)), tone: 'good', xMin: 0, xMax: 2 },
              { fn: (x) => -Math.sqrt(Math.max(0, x)), tone: 'good', xMin: 0, xMax: 2 },
              { fn: (x) => x, tone: 'faint' },
            ],
            xMin: -2,
            xMax: 2,
            xTicks: [],
            points: [
              { x: 1, y: 1, label: '', tone: 'bad' },
              { x: 1, y: -1, label: '', tone: 'bad' },
            ],
            xAxisLabel: '',
            yAxisLabel: '',
            caption:
              'En orange : $y = x^2$ (domaine ℝ, non injective). En vert : sa relation ' +
              'réciproque $y = \\pm\\sqrt{x}$, qui n\'est pas une fonction — en $x = 1$, elle ' +
              'donne deux images (points marqués).',
          },
        },
        {
          kind: 'para',
          text:
            'Le domaine de $f^{-1}$ est l\'image de $f$, et l\'image de $f^{-1}$ est le domaine ' +
            'de $f$ : les deux graphes sont **symétriques** par rapport à la droite $y = x$.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => 2 * x + 1, tone: 'accent', xMin: -2.5, xMax: 1.5 },
              { fn: (x) => (x - 1) / 2, tone: 'good' },
              { fn: (x) => x, tone: 'faint' },
            ],
            xMin: -4,
            xMax: 4,
            xTicks: [],
            xAxisLabel: '',
            yAxisLabel: '',
            caption:
              'En orange : $f(x) = 2x+1$. En vert : sa réciproque $f^{-1}(x) = \\dfrac{x-1}{2}$. ' +
              'Les deux graphes sont symétriques par rapport à la droite $y = x$ (pointillés).',
          },
        },
        {
          kind: 'definition',
          label: 'Propriétés de la réciproque',
          items: [
            'Pour $f$ injective, $f^{-1}$ l\'est aussi, et sa propre réciproque redonne $f$ : $(f^{-1})^{-1} = f$.',
            'Pour deux fonctions injectives $f$, $g$, la relation « être réciproque l\'une de ' +
              "l'autre » est symétrique : $g = f^{-1} \\iff f = g^{-1}$.",
          ],
        },
        { kind: 'subheading', text: "Trouver l'expression analytique de f⁻¹" },
        {
          kind: 'methode',
          label: 'Méthode 1 — décomposition en fonctions élémentaires',
          items: [
            'On décompose $f$ en une chaîne d\'opérations élémentaires (chacune facile à ' +
              '« défaire »), puis on remonte la chaîne en partant de l\'image.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — décomposition de f',
          blocks: [
            { kind: 'para', text: '$f(x) = \\dfrac{5}{x - 1}$' },
            {
              kind: 'operationChain',
              direction: 'forward',
              nodes: ['$x$', '$x - 1$', '$\\dfrac{1}{x-1}$', '$\\dfrac{5}{x-1}$'],
              operations: ['soustraire 1', 'inverser', '× 5'],
            },
            {
              kind: 'para',
              text: "On construit la réciproque en défaisant chaque opération, dans l'ordre inverse, en partant de l'image :",
            },
            {
              kind: 'operationChain',
              direction: 'backward',
              nodes: ['$1 + \\dfrac{5}{x}$', '$\\dfrac{5}{x}$', '$\\dfrac{x}{5}$', '$x$'],
              operations: ['ajouter 1', 'inverser', 'diviser par 5'],
            },
            {
              kind: 'para',
              text:
                "D'où $f^{-1}(x) = 1 + \\dfrac{5}{x}$, exactement le même résultat qu'avec la " +
                'méthode 2 ci-dessous.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode 2 — permutation',
          items: ['Dans $y = f(x)$, permuter $x$ et $y$, puis isoler $y$.'],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$f(x) = \\dfrac{5}{x - 1}$' },
            { kind: 'para', text: 'Permutation : $x = \\dfrac{5}{y - 1}$.' },
            {
              kind: 'para',
              text:
                'Isolement : $x(y-1) = 5 \\implies xy - x = 5 \\implies y = \\dfrac{5 + x}{x} = ' +
                '\\dfrac{5}{x} + 1$.',
            },
            { kind: 'para', text: "D'où $f^{-1}(x) = 1 + \\dfrac{5}{x}$." },
          ],
        },
        {
          kind: 'para',
          text:
            'Cas particulier des fonctions homographiques $f(x) = \\dfrac{ax+b}{cx+d}$ : la même ' +
            'méthode donne $f^{-1}(x) = \\dfrac{-dx+b}{cx-a}$, et $f^{-1} = f$ exactement quand $a = -d$.',
        },
        { kind: 'subheading', text: 'Réparer une fonction non injective en restreignant son domaine' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — retour sur y = x²',
          blocks: [
            {
              kind: 'para',
              text:
                'On a vu plus haut que $f : \\mathbb{R} \\to \\mathbb{R} : x \\mapsto x^2$ n\'est ' +
                "pas injective, donc sa relation réciproque n'est pas une fonction. En " +
                'revanche, sa **restriction** à $\\mathbb{R}^+$ l\'est :',
            },
            { kind: 'para', text: '$f|_{\\mathbb{R}^+} : \\mathbb{R}^+ \\to \\mathbb{R}^+ : x \\mapsto x^2$' },
            {
              kind: 'para',
              text:
                'Sur $\\mathbb{R}^+$, deux réels distincts ont des carrés distincts : ' +
                '$f|_{\\mathbb{R}^+}$ est injective et possède une réciproque, ' +
                '$f|_{\\mathbb{R}^+}^{-1}(x) = \\sqrt{x}$ — **attention**, $f|_{\\mathbb{R}^+}$ ' +
                'et $f$ restent deux fonctions différentes (même formule, mais domaines ' +
                'différents : $\\mathbb{R}^+$ contre $\\mathbb{R}$).',
            },
            {
              kind: 'para',
              text:
                'À l\'inverse, $g(x) = x^3$ (vue plus bas) est déjà injective sur $\\mathbb{R}$ ' +
                "tout entier : aucune restriction n'est nécessaire pour lui trouver une réciproque.",
            },
          ],
        },
        { kind: 'subheading', text: "Dérivée d'une fonction réciproque" },
        {
          kind: 'methode',
          items: [
            "Si $f$ est injective, dérivable en $f^{-1}(x)$, et si $f'(f^{-1}(x)) \\neq 0$, alors :",
            '$(f^{-1})\'(x) = \\dfrac{1}{f\'(f^{-1}(x))}$',
            'Les nombres dérivés de $f$ en $a$ et de $f^{-1}$ en $f(a)$ sont donc inverses ' +
              "l'un de l'autre — ce théorème général explique les formules d'arcsin, arccos et " +
              'arctan de la section 4.',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$f(x) = x^3$ (déjà bijective sur $\\mathbb{R}$, sans restriction), $f\'(x) = ' +
                '3x^2$, $f^{-1}(x) = \\sqrt[3]{x}$.',
            },
            { kind: 'para', text: '$(\\sqrt[3]{x})\' = \\dfrac{1}{3(\\sqrt[3]{x})^2}$' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — vérification croisée',
          blocks: [
            {
              kind: 'para',
              text:
                'Reprenons $f(x) = \\dfrac{5}{x-1}$, $f^{-1}(x) = 1 + \\dfrac{5}{x}$, et calculons ' +
                '$(f^{-1})\'(-5)$ de deux façons.',
            },
            {
              kind: 'para',
              text:
                'Par le théorème : $f^{-1}(-5) = 1 - 1 = 0$, et $f\'(x) = -\\dfrac{5}{(x-1)^2}$ ' +
                'donne $f\'(0) = -5$. D\'où $(f^{-1})\'(-5) = \\dfrac{1}{-5} = -\\dfrac{1}{5}$.',
            },
            {
              kind: 'para',
              text:
                'Par dérivation directe : $(f^{-1})\'(x) = (1 + \\dfrac{5}{x})\' = -\\dfrac{5}{x^2}$, ' +
                'donc $(f^{-1})\'(-5) = -\\dfrac{5}{25} = -\\dfrac{1}{5}$. Les deux méthodes ' +
                'concordent ✓ — la seconde est surtout utile quand $f^{-1}$ ne se dérive pas directement.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Remarque — le théorème donne une condition suffisante, pas nécessaire',
          text:
            "Si les hypothèses du théorème ne sont pas vérifiées en un point, cela ne prouve " +
            '**pas** que $f^{-1}$ n\'y est pas dérivable — juste que ce théorème ne permet pas ' +
            'de conclure. Exemple : pour $f(x) = \\sqrt[5]{x}$, $f\'(0)$ n\'existe pas (tangente ' +
            "verticale), donc le théorème ne s'applique pas en $x = 0$. Pourtant $f^{-1}(x) = " +
            'x^5$ est parfaitement dérivable en 0, avec $(f^{-1})\'(0) = 5 \\cdot 0^4 = 0$.',
        },
        {
          kind: 'entrainement',
          title: 'Fonctions injectives / surjectives / bijectives',
          generatorId: '6gen1',
          description: [
            "Détermine si une fonction est injective, surjective ou bijective, retrouve sa " +
              "réciproque par décomposition ou permutation, et calcule sa dérivée au point voulu.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 1. Fonctions injectives / surjectives / bijectives »',
        },
      ],
    },
    {
      id: 'cyclometriques',
      number: 2,
      title: 'Les fonctions cyclométriques : arcsin, arccos, arctan',
      blocks: [
        {
          kind: 'para',
          text:
            'sin, cos et tan sont périodiques : elles ne sont donc **jamais injectives** sur ' +
            "$\\mathbb{R}$ tout entier, et n'ont pas de réciproque sur $\\mathbb{R}$. Pour en " +
            'construire une, on **restreint le domaine** à un intervalle où la fonction ' +
            'redevient bijective — le plus court possible, et contenant 0.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: Math.sin, tone: 'faint', xMin: -2 * PI, xMax: 2 * PI },
              { fn: Math.sin, tone: 'accent', xMin: -PI / 2, xMax: PI / 2 },
            ],
            xMin: -2 * PI,
            xMax: 2 * PI,
            xTicks: [-PI / 2, PI / 2],
            xTickLabels: { [-PI / 2]: '-π/2', [PI / 2]: 'π/2' },
            fixedYRange: { min: -1.3, max: 1.3 },
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'sin restreint à [−π/2 ; π/2] (en accent) : bijective de cet intervalle vers [−1 ; 1].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: Math.cos, tone: 'faint', xMin: -2 * PI, xMax: 2 * PI },
              { fn: Math.cos, tone: 'accent', xMin: 0, xMax: PI },
            ],
            xMin: -2 * PI,
            xMax: 2 * PI,
            xTicks: [0, PI],
            xTickLabels: { 0: '0', [PI]: 'π' },
            fixedYRange: { min: -1.3, max: 1.3 },
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'cos restreint à [0 ; π] (en accent) : bijective de cet intervalle vers [−1 ; 1].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: Math.tan, tone: 'faint', xMin: -PI + 0.18, xMax: -PI / 2 - 0.06 },
              { fn: Math.tan, tone: 'accent', xMin: -PI / 2 + 0.06, xMax: PI / 2 - 0.06 },
              { fn: Math.tan, tone: 'faint', xMin: PI / 2 + 0.06, xMax: PI - 0.18 },
            ],
            xMin: -3 * PI,
            xMax: 3 * PI,
            xTicks: [-PI / 2, PI / 2],
            xTickLabels: { [-PI / 2]: '-π/2', [PI / 2]: 'π/2' },
            verticalAsymptotes: [{ x: -PI / 2 }, { x: PI / 2 }],
            fixedYRange: { min: -4, max: 4 },
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'tan restreint à ]−π/2 ; π/2[ (en accent) : bijective de cet intervalle vers ℝ tout entier.',
          },
        },
        {
          kind: 'para',
          text:
            'La réciproque de chaque restriction porte un nom (« arc » + le nom de la fonction ' +
            '— littéralement « l\'arc dont le sinus/cosinus/la tangente vaut… ») :',
        },
        {
          kind: 'featureTable',
          headers: ['Fonction', 'Restriction bijective', 'Réciproque', 'Domaine', 'Image'],
          rows: [
            ['sin', '[−π/2 ; π/2]', 'arcsin', '[−1 ; 1]', '[−π/2 ; π/2]'],
            ['cos', '[0 ; π]', 'arccos', '[−1 ; 1]', '[0 ; π]'],
            ['tan', ']−π/2 ; π/2[', 'arctan', 'ℝ', ']−π/2 ; π/2['],
          ],
        },
        { kind: 'subheading', text: "D'où vient le mot « arc » ?" },
        {
          kind: 'para',
          text:
            'Sur le cercle trigonométrique (rayon 1), un angle $y$ se mesure justement par la ' +
            "longueur de l'**arc** de cercle qu'il intercepte à partir de 0. Chaque arcfonction " +
            'répond ainsi littéralement à la question « quel est l\'arc $y$ dont le ' +
            'sinus/cosinus/la tangente vaut $x$ ? » :',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'unitCircleArc',
              mode: 'sin',
              angle: 0.75,
              caption: "y = arcsin(x) : l'arc, mesuré depuis 0, dont l'ordonnée du point d'arrivée vaut x.",
            },
            {
              kind: 'unitCircleArc',
              mode: 'cos',
              angle: 0.75,
              caption: "y = arccos(x) : l'arc, mesuré depuis 0, dont l'abscisse du point d'arrivée vaut x.",
            },
            {
              kind: 'unitCircleArc',
              mode: 'tan',
              angle: Math.atan(0.9),
              caption: "y = arctan(x) : l'arc dont la tangente géométrique (droite verticale) vaut x.",
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Caractérisation',
          items: [
            '$\\forall x \\in [-1;1], \\forall y \\in \\mathbb{R} : \\quad y = \\arcsin(x) \\iff x = \\sin(y)$ et $y \\in [-\\pi/2 ; \\pi/2]$',
            '$y = \\arccos(x) \\iff x = \\cos(y)$ et $y \\in [0 ; \\pi]$',
            '$\\forall x, y \\in \\mathbb{R} : \\quad y = \\arctan(x) \\iff x = \\tan(y)$ et $y \\in ]-\\pi/2 ; \\pi/2[$',
          ],
        },
        {
          kind: 'para',
          text:
            "La borne de l'image d'arctan se lit aussi comme deux limites, correspondant aux " +
            'deux asymptotes horizontales du graphe :',
        },
        {
          kind: 'para',
          text: '$\\displaystyle\\lim_{x \\to -\\infty} \\arctan(x) = -\\pi/2 \\qquad \\lim_{x \\to +\\infty} \\arctan(x) = \\pi/2$',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.asin, tone: 'accent', xMin: -1, xMax: 1 }],
            xMin: -1.3,
            xMax: 1.3,
            xTicks: [-1, 1],
            points: [
              { x: -1, y: -PI / 2, label: '', tone: 'accent' },
              { x: 1, y: PI / 2, label: '', tone: 'accent' },
            ],
            fixedYRange: { min: -1.9, max: 1.9 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y = arcsin(x) — domaine [−1 ; 1], image [−π/2 ; π/2].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.acos, tone: 'accent', xMin: -1, xMax: 1 }],
            xMin: -1.3,
            xMax: 1.3,
            xTicks: [-1, 1],
            points: [
              { x: -1, y: PI, label: '', tone: 'accent' },
              { x: 1, y: 0, label: '', tone: 'accent' },
            ],
            fixedYRange: { min: -0.3, max: 3.5 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y = arccos(x) — domaine [−1 ; 1], image [0 ; π].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.atan, tone: 'accent' }],
            xMin: -10,
            xMax: 10,
            xTicks: [-8, -4, 4, 8],
            horizontalAsymptotes: [
              { y: PI / 2, label: 'AH ≡ y = π/2' },
              { y: -PI / 2, label: 'AH ≡ y = −π/2' },
            ],
            fixedYRange: { min: -2.1, max: 2.1 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y = arctan(x) — domaine ℝ, image ]−π/2 ; π/2[ (asymptotes en pointillés).',
          },
        },
        {
          kind: 'piege',
          text:
            'arcsin($x$) n\'est pas « un » angle dont le sinus vaut $x$ parmi tous les possibles ' +
            '(il y en a une infinité par périodicité), mais **l\'unique** angle de [−π/2 ; π/2] ' +
            "dont le sinus vaut $x$. Même logique pour arccos et arctan, chacune avec sa propre image.",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arcsin est impaire',
          blocks: [
            { kind: 'para', text: 'Soit $f(x) = \\arcsin(x)$. Montrons que $f(-x) = -f(x)$.' },
            {
              kind: 'para',
              text:
                '$f(-x) = \\arcsin(-x) \\underset{\\text{déf}}{\\iff} \\sin(f(-x)) = ' +
                '\\sin(\\arcsin(-x)) \\underset{\\text{calc}}{\\iff} \\sin(f(-x)) = -x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} -\\sin(f(-x)) = x \\underset{\\text{sin impaire}}' +
                '{\\iff} \\sin(-f(-x)) = x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\arcsin(\\sin(-f(-x))) = \\arcsin(x) ' +
                '\\underset{\\text{calc}}{\\iff} -f(-x) = \\arcsin(x) = f(x)$',
            },
            { kind: 'para', text: 'D\'où $f(-x) = -f(x)$ : arcsin est bien impaire.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arccos(x) + arccos(−x) = π',
          blocks: [
            { kind: 'para', text: 'Soit $y = \\arccos(-x)$.' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\cos(y) = \\cos(\\arccos(-x)) ' +
                '\\underset{\\text{calc}}{\\iff} \\cos(y) = -x \\underset{\\text{calc}}{\\iff} -\\cos(y) = x$',
            },
            { kind: 'para', text: '$\\iff \\cos(\\pi - y) = x$' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} \\arccos(\\cos(\\pi-y)) = \\arccos(x) ' +
                '\\underset{\\text{déf}}{\\iff} \\pi - y = \\arccos(x)$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} y = \\pi - \\arccos(x) \\iff \\arccos(-x) = \\pi - \\arccos(x)$',
            },
            { kind: 'para', text: 'D\'où $\\arccos(x) + \\arccos(-x) = \\pi$.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arctan est impaire',
          blocks: [
            { kind: 'para', text: 'Soit $f(x) = \\arctan(x)$. Même structure que pour arcsin :' },
            {
              kind: 'para',
              text:
                '$f(-x) = \\arctan(-x) \\underset{\\text{déf}}{\\iff} \\tan(f(-x)) = ' +
                '\\tan(\\arctan(-x)) \\underset{\\text{calc}}{\\iff} \\tan(f(-x)) = -x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} -\\tan(f(-x)) = x \\underset{\\text{tan impaire}}' +
                '{\\iff} \\tan(-f(-x)) = x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\arctan(\\tan(-f(-x))) = \\arctan(x) ' +
                '\\underset{\\text{calc}}{\\iff} -f(-x) = \\arctan(x) = f(x)$',
            },
            { kind: 'para', text: 'D\'où $f(-x) = -f(x)$ : arctan est bien impaire.' },
          ],
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            'arcsin et arctan sont strictement croissantes ; arccos est strictement décroissante.',
            'arcsin et arctan sont **impaires** : $\\arcsin(-x) = -\\arcsin(x)$ et $\\arctan(-x) = -\\arctan(x)$.',
            'arccos n\'est **pas** impaire, mais vérifie $\\arccos(-x) = \\pi - \\arccos(x)$ — ' +
              'démontré ci-dessus.',
          ],
        },
        {
          kind: 'astuce',
          label: '💡 Valeurs remarquables (sans calculatrice)',
          text:
            '$\\arcsin(0) = 0 \\quad \\arcsin(\\frac{\\sqrt{2}}{2}) = \\pi/4 \\quad ' +
            '\\arcsin(-\\frac{\\sqrt{3}}{2}) = -\\pi/3 \\quad \\arcsin(-1) = -\\pi/2$',
          items: ['$\\arcsin(2)$ n\'existe pas : $2 \\notin [-1;1]$ (hors du domaine).'],
        },
        {
          kind: 'entrainement',
          title: 'arcsin, arccos, arctan',
          generatorId: '6gen2',
          description: [
            'Identifie la restriction bijective correspondant à chaque arcfonction, calcule des ' +
              'valeurs remarquables sans calculatrice, et relie domaine/image à chaque fonction.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 2. arcsin, arccos, arctan »',
        },
      ],
    },
    {
      id: 'equations',
      number: 3,
      title: 'Équations avec fonctions cyclométriques',
      blocks: [
        {
          kind: 'methode',
          label: "Condition d'existence",
          items: [
            'arcsin($u$) et arccos($u$) n\'existent que si $u \\in [-1;1]$.',
            'arctan($u$) existe pour tout $u \\in \\mathbb{R}$ — **aucune CE** à poser.',
          ],
        },
        {
          kind: 'para',
          text:
            'arcsin et arccos sont injectives sur leur domaine : deux images égales entraînent ' +
            'que les arguments eux-mêmes sont égaux.',
        },
        { kind: 'para', text: '$\\arcsin(A) = \\arcsin(B) \\iff A = B \\quad$ (si A, B respectent la CE)' },
        { kind: 'para', text: '$\\arccos(A) = \\arccos(B) \\iff A = B \\quad$ (si A, B respectent la CE)' },
        {
          kind: 'para',
          text: 'Identité utile, qui relie les deux fonctions (angles complémentaires d\'un triangle rectangle) :',
        },
        { kind: 'para', text: '$\\arcsin(u) + \\arccos(u) = \\pi/2 \\quad \\forall u \\in [-1;1]$' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration',
          blocks: [
            { kind: 'para', text: 'Soit $y = \\arccos(x)$.' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\cos(y) = \\cos(\\arccos(x)) ' +
                '\\underset{\\text{calc}}{\\iff} \\cos(y) = x$',
            },
            { kind: 'para', text: '$\\underset{\\text{calc}}{\\iff} \\sin(\\pi/2 - y) = x$' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} \\arcsin(\\sin(\\pi/2-y)) = \\arcsin(x) ' +
                '\\underset{\\text{calc}}{\\iff} \\pi/2 - y = \\arcsin(x)$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} y = \\pi/2 - \\arcsin(x) \\iff \\arccos(x) = \\pi/2 - \\arcsin(x)$',
            },
            { kind: 'para', text: 'D\'où $\\arccos(x) + \\arcsin(x) = \\pi/2$.' },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode en 3 temps',
          items: [
            "1) Poser la CE de chaque arcfonction. 2) Résoudre l'équation « simplifiée » " +
              "obtenue en enlevant les arcfonctions. 3) Vérifier que la solution trouvée " +
              'appartient bien à la CE — sinon, elle est rejetée.',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$\\arcsin(2x-1) = \\arcsin(x)$' },
            { kind: 'para', text: 'CE : $2x - 1 \\in [-1;1]$ et $x \\in [-1;1]$, soit $x \\in [0;1]$.' },
            { kind: 'para', text: 'Injectivité de arcsin : $2x - 1 = x \\implies x = 1$.' },
            { kind: 'para', text: 'Vérification : $1 \\in [0;1]$ ✓ — solution acceptée : $x = 1$.' },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Équations avec fonctions cyclométriques',
          generatorId: '6gen3',
          description: [
            'Résous des équations combinant arcsin, arccos et arctan, en posant systématiquement ' +
              'la condition d\'existence puis en la confrontant à la solution trouvée.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 3. Équations avec fonctions cyclométriques »',
        },
      ],
    },
    {
      id: 'derivees',
      number: 4,
      title: 'Dérivées des fonctions cyclométriques',
      blocks: [
        { kind: 'para', text: 'Pour $u = u(x)$ une fonction dérivable :' },
        {
          kind: 'featureTable',
          headers: ['Fonction', 'Dérivée'],
          rows: [
            ['arcsin($u$)', "$\\dfrac{u'}{\\sqrt{1-u^2}}$"],
            ['arccos($u$)', "$-\\dfrac{u'}{\\sqrt{1-u^2}}$"],
            ['arctan($u$)', "$\\dfrac{u'}{1+u^2}$"],
          ],
        },
        {
          kind: 'piege',
          text:
            'Attention au signe **moins** devant la dérivée de arccos — c\'est la seule des ' +
            "trois qui est négative. Comme pour toute composée, on multiplie par $u'(x)$ " +
            '(règle de la chaîne).',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — d\'où vient la formule de arcsin ?' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration',
          blocks: [
            {
              kind: 'para',
              text:
                'Par définition, $\\sin(\\arcsin(x)) = x$. En dérivant les deux membres par ' +
                'rapport à $x$ (règle de la chaîne à gauche) :',
            },
            { kind: 'para', text: '$\\cos(\\arcsin(x)) \\cdot \\arcsin\'(x) = 1$' },
            {
              kind: 'para',
              text:
                'Or $\\arcsin(x) \\in [-\\pi/2;\\pi/2]$, donc $\\cos(\\arcsin(x)) \\ge 0$, et ' +
                '$\\cos^2 + \\sin^2 = 1$ donne $\\cos(\\arcsin(x)) = \\sqrt{1-x^2}$. D\'où :',
            },
            { kind: 'para', text: '$\\arcsin\'(x) = \\dfrac{1}{\\sqrt{1-x^2}}$' },
            {
              kind: 'para',
              text:
                'On retrouve ainsi, pour arcsin, exactement le théorème général ' +
                '$(f^{-1})\'(x) = 1/f\'(f^{-1}(x))$ vu en section 1 (ici $f = \\sin$, donc $f\' = \\cos$).',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — dérivée de arccos',
          blocks: [
            {
              kind: 'para',
              text:
                'Grâce à l\'identité $\\arccos(x) = \\pi/2 - \\arcsin(x)$ (section précédente), la ' +
                'dérivée de arcsin suffit :',
            },
            {
              kind: 'para',
              text:
                '$(\\arccos(x))\' = (\\pi/2 - \\arcsin(x))\' = -(\\arcsin(x))\' = -\\dfrac{1}{\\sqrt{1-x^2}}$',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Pour aller plus loin — arcsin n\'est pas dérivable en ±1',
          text:
            'La formule $\\dfrac{1}{\\sqrt{1-x^2}}$ n\'est de toute façon pas définie en $x = ' +
            '\\pm 1$, mais on peut le justifier directement : si arcsin était dérivable en 1, le ' +
            'théorème de la section 1 donnerait $\\sin\'(\\arcsin(1)) = \\sin\'(\\pi/2) = ' +
            '\\cos(\\pi/2) \\neq 0$ — or $\\cos(\\pi/2) = 0$. Contradiction : arcsin n\'est donc ' +
            'dérivable ni en 1, ni (de même) en −1, cohérent avec le domaine ouvert ]−1 ; 1[ de sa dérivée.',
        },
        { kind: 'subheading', text: 'Exemple résolu — dérivée composée' },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$(\\arcsin(2x-1))\'$' },
            { kind: 'para', text: 'Règle de la chaîne avec $u = 2x-1$, $u\' = 2$ :' },
            {
              kind: 'para',
              text:
                '$(\\arcsin(2x-1))\' = \\dfrac{2}{\\sqrt{1-(2x-1)^2}} = \\dfrac{2}{\\sqrt{-4x^2+4x}} = \\dfrac{1}{\\sqrt{-x^2+x}}$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — dérivée de arctan',
          blocks: [
            {
              kind: 'para',
              text: 'Soit $f(x) = \\arctan(x)$, donc $x = \\tan(f(x))$. Dérivons les deux membres :',
            },
            { kind: 'para', text: '$x\' = (\\tan(f(x)))\' \\iff 1 = (1+\\tan^2(f(x))) \\cdot f\'(x)$' },
            {
              kind: 'para',
              text:
                '$\\iff f\'(x) = \\dfrac{1}{1+\\tan^2(f(x))} = \\dfrac{1}{1+x^2}$ (car ' +
                '$\\tan(f(x)) = x$ par définition de $f$)',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Dérivées de fonctions cyclométriques',
          generatorId: '6gen4',
          description: [
            'Dérive des expressions composées avec arcsin, arccos et arctan en appliquant la ' +
              'règle de la chaîne, formule et signe compris.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 4. Dérivées de fonctions cyclométriques »',
        },
      ],
    },
    {
      id: 'graphiques',
      number: 5,
      title: 'Reconnaître une fonction cyclométrique à son graphe',
      blocks: [
        {
          kind: 'para',
          text: 'Face à un graphe inconnu, trois questions suffisent presque toujours à identifier la bonne arcfonction :',
        },
        {
          kind: 'methode',
          items: [
            '**Le domaine est-il borné ou non ?** Borné à [−1 ; 1] → arcsin ou arccos ' +
              '(éventuellement composée). Non borné (ℝ) → arctan.',
            '**La courbe est-elle croissante ou décroissante ?** arcsin et arctan sont ' +
              'croissantes ; arccos est décroissante.',
            '**Y a-t-il des asymptotes horizontales ?** Seule arctan en a ($y = \\pm\\pi/2$) — ' +
              "un domaine ℝ sans asymptote n'est pas une arcfonction seule.",
          ],
        },
        { kind: 'para', text: 'Les trois graphes de référence à mémoriser :' },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.asin, tone: 'accent', xMin: -1, xMax: 1 }],
            xMin: -1.3,
            xMax: 1.3,
            xTicks: [-1, 1],
            points: [
              { x: -1, y: -PI / 2, label: '', tone: 'accent' },
              { x: 1, y: PI / 2, label: '', tone: 'accent' },
            ],
            fixedYRange: { min: -1.9, max: 1.9 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y = arcsin(x)',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.acos, tone: 'accent', xMin: -1, xMax: 1 }],
            xMin: -1.3,
            xMax: 1.3,
            xTicks: [-1, 1],
            points: [
              { x: -1, y: PI, label: '', tone: 'accent' },
              { x: 1, y: 0, label: '', tone: 'accent' },
            ],
            fixedYRange: { min: -0.3, max: 3.5 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y = arccos(x)',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: Math.atan, tone: 'accent' }],
            xMin: -10,
            xMax: 10,
            xTicks: [-8, -4, 4, 8],
            horizontalAsymptotes: [
              { y: PI / 2, label: 'AH ≡ y = π/2' },
              { y: -PI / 2, label: 'AH ≡ y = −π/2' },
            ],
            fixedYRange: { min: -2.1, max: 2.1 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y = arctan(x)',
          },
        },
        {
          kind: 'entrainement',
          title: 'Associer graphique et expression',
          generatorId: '6gen5',
          description: [
            "Identifie la bonne arcfonction à partir d'un graphe inconnu, en s'appuyant sur le " +
              'domaine, le sens de variation et la présence éventuelle d\'asymptotes.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 5. Associer graphique et expression »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Fonction', 'Domaine', 'Image', 'Dérivée (en u)'],
      rows: [
        ['arcsin($u$)', '[−1 ; 1]', '[−π/2 ; π/2]', "$\\dfrac{u'}{\\sqrt{1-u^2}}$"],
        ['arccos($u$)', '[−1 ; 1]', '[0 ; π]', "$-\\dfrac{u'}{\\sqrt{1-u^2}}$"],
        ['arctan($u$)', 'ℝ', ']−π/2 ; π/2[', "$\\dfrac{u'}{1+u^2}$"],
      ],
    },
    forward: 'Identité à connaître : $\\arcsin(u) + \\arccos(u) = \\pi/2$ pour tout $u \\in [-1;1]$.',
  },
}
