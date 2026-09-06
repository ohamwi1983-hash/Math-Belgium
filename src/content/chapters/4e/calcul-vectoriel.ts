import type { ChapterContent } from '../../types'

export const calculVectoriel: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 6,
  title: 'Calcul vectoriel',
  slug: 'calcul-vectoriel',
  lede:
    "Un vecteur n'est pas un segment : c'est une direction, un sens et une longueur, totalement " +
    "indépendants du point où on choisit de le représenter. Ce chapitre part de cette définition " +
    "pour construire, outil après outil, tout ce qu'il faut pour manipuler des vecteurs — les " +
    "relier à des points, les combiner, tester leurs relations entre eux, mesurer leur longueur, et " +
    "les utiliser pour modéliser des situations concrètes.",

  intro: {
    title: "Avant de commencer : qu'est-ce qu'un vecteur ?",
    blocks: [
      {
        kind: 'para',
        text:
          'Un vecteur $\\vec{AB}$ porte trois informations, et seulement trois : une ' +
          '**direction** (la droite (AB)), un **sens** (de A vers B) et une **longueur** (la ' +
          "distance AB). Deux vecteurs qui partagent ces trois informations sont **égaux** — " +
          "même s'ils ne sont pas dessinés au même endroit du plan.",
      },
      {
        kind: 'rappel',
        label: "Rappel — composantes d'un vecteur",
        items: [
          'Dans un repère, $\\vec{AB}$ a pour composantes ' +
            '$\\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$ — c\'est ce couple de ' +
            "nombres, et lui seul, qui résume entièrement la direction, le sens et la longueur du " +
            'vecteur. Deux vecteurs sont égaux si et seulement si ils ont les mêmes composantes.',
        ],
      },
    ],
  },

  sections: [
    {
      id: 'definition',
      number: 1,
      title: "Qu'est-ce qu'un vecteur ?",
      kicker: 'direction, sens, longueur — notation AB ou u (vecteurs)',
      blocks: [
        {
          kind: 'para',
          text:
            'Un vecteur se note de deux façons : $\\vec{AB}$ quand on le rattache à deux points ' +
            '(A son **origine**, B son **extrémité**), ou $\\vec{u}$, $\\vec{v}$… quand seules sa ' +
            'direction, son sens et sa longueur comptent, sans point particulier associé. Les ' +
            "deux notations désignent le même type d'objet et se combinent librement dans un même " +
            'calcul.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 4,
            vectors: [{ from: { x: 1, y: 1 }, to: { x: 5, y: 3 }, tone: 'accent' }],
            points: [
              { x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 3, label: 'B', tone: 'ink', labelPos: 'right' },
            ],
            caption: '$\\vec{AB}$ : origine A, extrémité B, direction (AB), sens de A vers B',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — la norme, une longueur',
          items: [
            "La **norme** d'un vecteur, notée $\\|\\vec{u}\\|$ ou AB pour $\\vec{AB}$, est sa " +
              "longueur : un nombre toujours positif ou nul, qui se mesure à la règle sur une " +
              "figure avant même de disposer d'un repère.",
          ],
        },
        {
          kind: 'piege',
          label: 'Un vecteur, pas un segment',
          text:
            'Deux représentants $\\vec{AB}$ et $\\vec{CD}$ d\'un même vecteur $\\vec{u}$ ne sont ' +
            "pas superposés sur la figure — ils sont **égaux** dès qu'ils partagent direction, " +
            "sens et longueur, indépendamment de l'endroit où on choisit de les dessiner.",
        },
      ],
    },

    {
      id: 'oppose',
      number: 2,
      title: 'Vecteurs opposés',
      kicker: 'même direction, même longueur, sens contraires',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux vecteurs de **même direction**, **même longueur** mais de **sens contraires** ' +
            'sont des vecteurs **opposés**. L\'opposé de $\\vec{u}$ se note $-\\vec{u}$ ; ' +
            "l'opposé de $\\vec{AB}$ se note $-\\vec{AB}$ ou, de façon équivalente, $\\vec{BA}$.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 4,
            vectors: [
              { from: { x: 0.5, y: 3 }, to: { x: 4.5, y: 3 }, tone: 'accent' },
              { from: { x: 4.5, y: 1 }, to: { x: 0.5, y: 1 }, tone: 'bad' },
            ],
            points: [
              { x: 2.5, y: 3.3, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
              { x: 2.5, y: 0.7, vectorLabel: [{ text: '−' }, { text: 'u', vector: true }], tone: 'bad', node: false },
            ],
            caption: 'même longueur, même direction, sens opposé',
          },
        },
      ],
    },

    {
      id: 'multiplicationGeometrique',
      number: 3,
      title: 'Multiplier un vecteur par un réel : colinéarité et alignement',
      kicker: 'k > 1 allonge, 0 < k < 1 raccourcit, k < 0 inverse le sens — colinéaires : même direction',
      blocks: [
        {
          kind: 'para',
          text:
            'Multiplier un vecteur par un nombre k ne change jamais sa **direction** : seuls sa ' +
            'longueur et, si k est négatif, son sens sont modifiés.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 5,
            yMin: -2,
            yMax: 3,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2, y: 1 }, tone: 'ink' },
              { from: { x: 0, y: 0 }, to: { x: 4, y: 2 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 1, y: 0.5 }, tone: 'tip' },
              { from: { x: 0, y: 0 }, to: { x: -2, y: -1 }, tone: 'bad' },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 2.2, y: 1.1, vectorLabel: [{ text: 'AB', vector: true }], tone: 'ink', node: false },
              { x: 4.2, y: 2.1, vectorLabel: [{ text: '2·' }, { text: 'AB', vector: true }], tone: 'good', node: false },
              { x: 1.1, y: 0.65, vectorLabel: [{ text: '0,5·' }, { text: 'AB', vector: true }], tone: 'tip', node: false, labelPos: 'above' },
              { x: -2.2, y: -1.1, vectorLabel: [{ text: '−' }, { text: 'AB', vector: true }], tone: 'bad', node: false },
            ],
            caption: 'même direction pour les 4 vecteurs — seules la longueur et, pour $-\\vec{AB}$, le sens changent',
          },
        },
        {
          kind: 'featureTable',
          headers: ['Valeur de k', 'Effet sur AB'],
          rows: [
            ['k > 1', 'même sens, plus long'],
            ['0 < k < 1', 'même sens, plus court'],
            ['k = 0', 'vecteur nul (pas de direction)'],
            ['−1 < k < 0', 'sens opposé, plus court'],
            ['k = −1', 'sens opposé, même longueur (vecteur opposé)'],
            ['k < −1', 'sens opposé, plus long'],
          ],
        },
        {
          kind: 'astuce',
          text:
            'Pour construire $k \\cdot \\vec{AB}$ à la règle : reporter la longueur de [AB] |k| ' +
            'fois le long de la droite (AB), dans le même sens que AB si k > 0, dans le sens ' +
            'opposé si k < 0.',
        },
        { kind: 'subheading', text: 'Vecteurs colinéaires et points alignés' },
        {
          kind: 'para',
          text:
            'Deux vecteurs sont **colinéaires** quand ils partagent la même direction — portés ' +
            'par des droites parallèles, ou la même droite. Trois points sont **alignés** ' +
            'exactement quand deux vecteurs formés à partir de ces points sont colinéaires.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 4,
            vectors: [{ from: { x: 0, y: 0.3 }, to: { x: 6.3, y: 3.5 }, tone: 'accent' }],
            points: [
              { x: 0, y: 0.3, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 2, y: 1.3, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 6, y: 3.3, label: 'C', tone: 'ink', labelPos: 'above' },
            ],
            caption: 'A, B et C alignés — $\\vec{AB}$ et $\\vec{AC}$ sont colinéaires',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Alignement de 3 points — A, B, C alignés ⟺ $\\vec{AB}$ et $\\vec{AC}$ colinéaires, ' +
              "c'est-à-dire $\\vec{AC} = k \\cdot \\vec{AB}$ pour un certain nombre k.",
          ],
        },
        {
          kind: 'entrainement',
          title: 'Construction graphique de vecteurs',
          generatorId: 'gen23',
          description: ['Trace coefficient·AB par glisser-déposer sur une grille magnétique.'],
          chantier: '4e',
          whereLabel: '4e → « 23. Construction graphique de vecteurs »',
        },
      ],
    },

    {
      id: 'additionGeometrique',
      number: 4,
      title: 'Additionner deux vecteurs',
      kicker: 'méthode du triangle (Chasles) ou du parallélogramme',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux vecteurs s\'additionnent de deux façons équivalentes, selon la façon dont ils ' +
            'sont placés l\'un par rapport à l\'autre.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'good' },
              { from: { x: 3, y: 1 }, to: { x: 4.5, y: 4 }, tone: 'attn' },
              { from: { x: 0, y: 0 }, to: { x: 4.5, y: 4 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 1.5, y: 0.9, vectorLabel: [{ text: 'u', vector: true }], tone: 'good', node: false },
              { x: 4, y: 2.6, vectorLabel: [{ text: 'v', vector: true }], tone: 'attn', node: false },
              { x: 2.5, y: 2.4, vectorLabel: [{ text: 'u', vector: true }, { text: ' + ' }, { text: 'v', vector: true }], tone: 'accent', node: false },
            ],
            caption:
              'méthode du triangle : en plaçant $\\vec{v}$ à la suite de $\\vec{u}$, le vecteur ' +
              "somme relie directement le point de départ au point d'arrivée",
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Méthode du triangle — vecteurs consécutifs (l\'origine de $\\vec{v}$ est ' +
              "l'extrémité de $\\vec{u}$) : c'est la relation de Chasles (section 6).",
            'Méthode du parallélogramme — vecteurs de même origine (utilisée en physique, ' +
              "section 17) : la somme est la diagonale du parallélogramme construit sur $\\vec{u}$ et $\\vec{v}$.",
          ],
        },
      ],
    },

    {
      id: 'soustractionGeometrique',
      number: 5,
      title: 'Soustraire un vecteur',
      kicker: 'retrancher un vecteur, c\'est ajouter son opposé',
      blocks: [
        {
          kind: 'para',
          text:
            "Retrancher un vecteur, c'est ajouter son opposé : $\\vec{u} - \\vec{v} = \\vec{u} + " +
            '(-\\vec{v})$. Quand $\\vec{u}$ et $\\vec{v}$ partent d\'une même origine, leur ' +
            'différence $\\vec{w} = \\vec{u} - \\vec{v}$ relie l\'extrémité de $\\vec{v}$ à ' +
            "l'extrémité de $\\vec{u}$ — dans ce sens précis, puisque $\\vec{w} + \\vec{v} = \\vec{u}$.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2.5, y: 4 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 1.3 }, tone: 'attn' },
              { from: { x: 6, y: 1.3 }, to: { x: 2.5, y: 4 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 1.2, y: 2.2, vectorLabel: [{ text: 'u', vector: true }], tone: 'good', node: false, labelPos: 'left' },
              { x: 3.5, y: 1.1, vectorLabel: [{ text: 'v', vector: true }], tone: 'attn', node: false, labelPos: 'below' },
              { x: 4.6, y: 2.9, vectorLabel: [{ text: 'u', vector: true }, { text: ' − ' }, { text: 'v', vector: true }], tone: 'accent', node: false, labelPos: 'right' },
            ],
            caption: '$\\vec{w} = \\vec{u} - \\vec{v}$ part de l\'extrémité de $\\vec{v}$ et arrive à l\'extrémité de $\\vec{u}$',
          },
        },
      ],
    },

    {
      id: 'chasles',
      number: 6,
      title: 'Réduire une somme de vecteurs : la relation de Chasles',
      kicker: 'AB + BC = AC',
      blocks: [
        {
          kind: 'para',
          text:
            "Dès qu'une chaîne de vecteurs se relaie point par point — le point d'arrivée de " +
            "l'un est le point de départ du suivant — elle se réduit à un seul vecteur, celui " +
            'qui va directement du tout premier point au tout dernier.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 4.5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 3.5 }, tone: 'good' },
              { from: { x: 3, y: 3.5 }, to: { x: 6.5, y: 1.2 }, tone: 'attn' },
              { from: { x: 0, y: 0 }, to: { x: 6.5, y: 1.2 }, tone: 'accent', dashed: true },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 3.5, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 6.5, y: 1.2, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 1.3, y: 2, vectorLabel: [{ text: 'AB', vector: true }], tone: 'good', node: false },
              { x: 5, y: 2.7, vectorLabel: [{ text: 'BC', vector: true }], tone: 'attn', node: false },
              { x: 3.3, y: 0.5, vectorLabel: [{ text: 'AB', vector: true }, { text: ' + ' }, { text: 'BC', vector: true }, { text: ' = ' }, { text: 'AC', vector: true }], tone: 'accent', node: false },
            ],
            caption: 'le point B, commun aux deux vecteurs, disparaît dans la somme',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            '$A_1A_2 + A_2A_3 + \\ldots + A_{n-1}A_n = A_1A_n$.',
            'Une chaîne **fermée** (qui revient à son point de départ) se réduit toujours au vecteur nul.',
            'Un vecteur écrit « à l\'envers » ($\\vec{CB}$ au lieu de $\\vec{BC}$) doit d\'abord être ' +
              'remplacé par son opposé ($-\\vec{BC}$) avant de télescoper.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'réduire une chaîne de 3 vecteurs',
          formula: 'Réduire $\\vec{AB} + \\vec{BC} + \\vec{CD}$.',
          steps: [
            { tag: '1er télescopage', text: '$\\vec{AB} + \\vec{BC} = \\vec{AC}$' },
            { tag: '2e télescopage', text: '$\\vec{AC} + \\vec{CD} = \\vec{AD}$' },
          ],
          result: { tag: 'résultat', text: '$\\vec{AB} + \\vec{BC} + \\vec{CD} = \\vec{AD}$' },
        },
        {
          kind: 'entrainement',
          title: 'Réduction d\'une somme de vecteurs (Chasles)',
          generatorId: 'gen27',
          description: ['Réduis une chaîne télescopique de vecteurs sur 4 figures fixes (hexagone, étoile, trapèze, triangle et médianes).'],
          chantier: '4e',
          whereLabel: '4e → « 27. Réduction d\'une somme de vecteurs (Chasles) »',
        },
      ],
    },

    {
      id: 'decompositionGeometrique',
      number: 7,
      title: 'Décomposer un vecteur selon deux directions',
      kicker: 'méthode du parallélogramme, en sens inverse',
      blocks: [
        {
          kind: 'para',
          text:
            'Réciproquement, tout vecteur peut se décomposer en une somme de deux vecteurs de ' +
            'directions imposées (deux droites non parallèles) : c\'est encore la méthode du ' +
            'parallélogramme, utilisée en sens inverse.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 1, y: 0.5 }, to: { x: 6, y: 4.5 }, tone: 'accent' },
              { from: { x: 1, y: 0.5 }, to: { x: 3, y: 2 }, tone: 'good' },
              { from: { x: 1, y: 0.5 }, to: { x: 4, y: 1.3 }, tone: 'attn' },
              { from: { x: 3, y: 2 }, to: { x: 6, y: 4.5 }, tone: 'faint', dashed: true },
              { from: { x: 4, y: 1.3 }, to: { x: 6, y: 4.5 }, tone: 'faint', dashed: true },
            ],
            points: [
              { x: 2.5, y: 1.3, vectorLabel: [{ text: 'v', vector: true }], tone: 'good', node: false },
              { x: 3, y: 0.7, vectorLabel: [{ text: 'w', vector: true }], tone: 'attn', node: false },
              { x: 4.2, y: 3, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
            ],
            caption: '$\\vec{u} = \\vec{v} + \\vec{w}$, avec $\\vec{v}$ et $\\vec{w}$ portés par deux directions distinctes',
          },
        },
      ],
    },

    {
      id: 'composantes',
      number: 8,
      title: 'Caractériser un vecteur dans un repère : les composantes',
      kicker: 'AB(x_B−x_A ; y_B−y_A)',
      blocks: [
        {
          kind: 'para',
          text:
            "Une fois un repère choisi, un vecteur n'a plus besoin d'être dessiné pour être " +
            'décrit : deux nombres — ses **composantes** — résument à eux seuls sa direction, ' +
            'son sens et sa longueur.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — composantes de AB',
          items: [
            'Pour $A(x_A ; y_A)$ et $B(x_B ; y_B)$ : $\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ ' +
              'y_B-y_A \\end{pmatrix}$. Deux vecteurs sont égaux si et seulement si ils ont les ' +
              'mêmes composantes.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'composantes de AB',
          formula: 'A(2 ; −1), B(5 ; 3).',
          steps: [{ tag: 'composantes', text: '$\\begin{pmatrix} 5-2 \\\\ 3-(-1) \\end{pmatrix}$' }],
          result: { tag: 'résultat', text: '$\\vec{AB}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$' },
        },
      ],
    },

    {
      id: 'additionReperes',
      number: 9,
      title: 'Additionner deux vecteurs dans un repère',
      kicker: 'u + v = (x_u+x_v ; y_u+y_v)',
      blocks: [
        {
          kind: 'para',
          text:
            'En repère, additionner deux vecteurs — ou un vecteur nommé et un vecteur ' +
            'point-à-point — revient à additionner leurs composantes une à une.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'En repère — $\\vec{u} + \\vec{v} = \\begin{pmatrix} x_u+x_v \\\\ y_u+y_v \\end{pmatrix}$.',
            'Vecteurs mixtes — un vecteur nommé ($\\vec{u}$) et un vecteur point-à-point ' +
              '($\\vec{AB}$) se combinent librement, une fois leurs composantes calculées séparément.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'somme de deux vecteurs',
          formula: '$\\vec{u} = \\begin{pmatrix} 2 \\\\ 3 \\end{pmatrix}$, $\\vec{v} = \\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$.',
          steps: [{ tag: 'composante par composante', text: '$\\begin{pmatrix} 2+(-1) \\\\ 3+4 \\end{pmatrix}$' }],
          result: { tag: 'résultat', text: '$\\vec{u} + \\vec{v} = \\begin{pmatrix} 1 \\\\ 7 \\end{pmatrix}$' },
        },
      ],
    },

    {
      id: 'multiplicationReperes',
      number: 10,
      title: 'Multiplier un vecteur par un réel dans un repère',
      kicker: 'k·u = (k·x_u ; k·y_u)',
      blocks: [
        {
          kind: 'para',
          text:
            'Multiplier un vecteur par un réel en repère revient à multiplier chacune de ses ' +
            'composantes par ce nombre — y compris pour retrouver l\'opposé, cas particulier ' +
            'k = −1.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Multiplication par un scalaire — $k \\cdot \\vec{u} = \\begin{pmatrix} k \\cdot x_u \\\\ k \\cdot y_u \\end{pmatrix}$.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — composantes opposées',
          items: [
            'Si $\\vec{u}$ a pour composantes $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$, alors ' +
              '$-\\vec{u}$ a pour composantes $\\begin{pmatrix} -x \\\\ -y \\end{pmatrix}$ — ' +
              'chaque composante change de signe, rien d\'autre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'vecteur nommé + vecteur point-à-point',
          formula: '$\\vec{u} = \\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix}$, A(3 ; 5), B(6 ; 2). Calculer $3\\vec{u} - \\vec{AB}$.',
          steps: [
            { tag: 'composantes de AB', text: '$\\vec{AB} = \\begin{pmatrix} 6-3 \\\\ 2-5 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ -3 \\end{pmatrix}$' },
            { tag: '3u', text: '$3 \\cdot \\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix} = \\begin{pmatrix} 6 \\\\ -3 \\end{pmatrix}$' },
          ],
          result: { tag: 'résultat', text: '$3\\vec{u} - \\vec{AB} = \\begin{pmatrix} 6-3 \\\\ -3-(-3) \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$' },
        },
        {
          kind: 'entrainement',
          title: 'Composantes de combinaisons linéaires',
          generatorId: 'gen22',
          description: ['Réduis une expression vectorielle (vecteurs nommés et points en sens opposé) puis calcule ses composantes.'],
          chantier: '4e',
          whereLabel: '4e → « 22. Calcul de composantes de combinaisons linéaires »',
        },
      ],
    },

    {
      id: 'norme',
      number: 11,
      title: "Norme d'un vecteur et distance entre deux points",
      kicker: '‖u‖ = √(x_u² + y_u²)',
      blocks: [
        {
          kind: 'para',
          text:
            'La **norme** d\'un vecteur est sa longueur — toujours positive ou nulle. La distance ' +
            'entre deux points n\'est rien d\'autre que la norme du vecteur qui les relie.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 5,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 4 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'faint', dashed: true },
              { from: { x: 3, y: 0 }, to: { x: 3, y: 4 }, tone: 'faint', dashed: true },
            ],
            points: [
              { x: 1.5, y: -0.3, label: '3', tone: 'ink', node: false },
              { x: 3.35, y: 2, label: '4', tone: 'ink', node: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 3, y: 0 }, arm1: { x: 0, y: 0 }, arm2: { x: 3, y: 4 } }],
            caption: '$\\vec{u} = (3 ; 4)$ : $\\|\\vec{u}\\| = \\sqrt{3^2+4^2} = \\sqrt{25} = 5$',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Norme — $\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}$.',
            'Distance entre deux points — $AB = \\|\\vec{AB}\\| = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}$.',
            'Classer un triangle — isocèle : (au moins) deux côtés de même longueur ; scalène : les trois longueurs sont différentes.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le théorème de Pythagore, encore lui',
          blocks: [
            {
              kind: 'para',
              text:
                'Pour $A(x_A ; y_A)$ et $B(x_B ; y_B)$, le point C de coordonnées $(x_B ; y_A)$ ' +
                'forme avec A et B un triangle rectangle en C — le côté [AC] est horizontal, de ' +
                'longueur $|x_B-x_A|$, le côté [CB] est vertical, de longueur $|y_B-y_A|$. Le ' +
                'théorème de Pythagore donne alors : $\\|\\vec{AB}\\|^2 = AC^2 + CB^2 = (x_B-x_A)^2 + (y_B-y_A)^2$',
            },
            {
              kind: 'para',
              text:
                'd\'où $\\|\\vec{AB}\\| = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}$ — exactement la ' +
                'formule de la norme, puisque $\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$ ' +
                'sont les composantes $\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ de $\\vec{AB}$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'distance entre deux points',
          formula: 'A(1 ; 1), B(4 ; 5).',
          steps: [{ tag: 'composantes de AB', text: '$\\begin{pmatrix} 4-1 \\\\ 5-1 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$' }],
          result: { tag: 'distance AB', text: '$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$' },
        },
        {
          kind: 'entrainement',
          title: 'Norme d\'un vecteur et distance entre 2 points',
          generatorId: 'gen26',
          description: ['Calcule une norme ou une distance sous 5 variantes (vecteur donné, distance entre points, triangle isocèle/scalène, paramètre x, Pythagore en méthode alternative).'],
          chantier: '4e',
          whereLabel: '4e → « 26. Norme d\'un vecteur et distance entre 2 points »',
        },
      ],
    },

    {
      id: 'relation',
      number: 12,
      title: 'Vecteurs, translation et milieu',
      kicker: 'B = A + u — milieu M = ((x_A+x_B)/2 ; (y_A+y_B)/2)',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux relations reviennent sans cesse entre un vecteur et des points : la ' +
            '**translation** (retrouver un point à partir d\'un autre et d\'un vecteur) et le ' +
            '**milieu** d\'un segment. Une troisième, plus générale, les contient toutes les deux.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 4,
            vectors: [{ from: { x: 1, y: 1 }, to: { x: 5, y: 3 }, tone: 'accent', tick: true }],
            points: [
              { x: 1, y: 1, label: 'A(1 ; 1)', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 3, label: 'B(5 ; 3)', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 2, label: 'M(3 ; 2)', tone: 'good', labelPos: 'above' },
            ],
            caption: 'la marque sur $\\vec{AB}$ signale que M en est le milieu',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Translation — B est le translaté de A par $\\vec{u}$ : B = A + $\\vec{u}$, donc ' +
              '$x_B=x_A+x_u$ et $y_B=y_A+y_u$.',
            'Milieu — M milieu de [AB] : $x_M=(x_A+x_B)/2$ et $y_M=(y_A+y_B)/2$ ; de façon ' +
              'équivalente, $\\vec{AM} = \\vec{MB} = \\frac{1}{2}\\vec{AB}$.',
            'Relation générale — $\\vec{AM} = k \\cdot \\vec{AB}$ place toujours M sur la droite ' +
              '(AB) ; k=1/2 redonne le milieu, k=1 redonne B, k=0 redonne A.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'translation puis milieu',
          formula: 'A(1 ; 1), $\\vec{u} = \\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$.',
          steps: [
            { tag: 'translaté B de A par u', text: '$x_B=1+4=5$, $y_B=1+2=3$ → B(5 ; 3)' },
            { tag: 'milieu M de [AB]', text: '$x_M=(1+5)/2=3$, $y_M=(1+3)/2=2$ → M(3 ; 2)' },
          ],
          result: { tag: 'résultat', text: 'B(5 ; 3), M(3 ; 2)' },
        },
        {
          kind: 'piege',
          label: 'Milieu ≠ différence de coordonnées',
          text:
            'Les coordonnées du milieu sont la **moyenne** des coordonnées de A et B — pas leur ' +
            'différence. La différence $\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$ ' +
            'donne les composantes de $\\vec{AB}$, un objet complètement différent du milieu.',
        },
        {
          kind: 'entrainement',
          title: 'Relation vectorielle (guidée)',
          generatorId: 'gen20',
          description: ["Traduis d'abord la relation en symboles, avant de calculer les coordonnées du point cherché."],
          chantier: '4e',
          whereLabel: "4e → « 20. Point à partir d'une relation vectorielle (guidée) »",
        },
        {
          kind: 'entrainement',
          title: 'Relation vectorielle',
          generatorId: 'gen21',
          description: ['Même famille de relations (translation, milieu, relation générale), directement sur un seul écran.'],
          chantier: '4e',
          whereLabel: "4e → « 21. Point à partir d'une relation vectorielle »",
        },
      ],
    },

    {
      id: 'colinearite',
      number: 13,
      title: 'Colinéarité de vecteurs et alignement de points',
      kicker: 'x_u·y_v − y_u·x_v = 0',
      blocks: [
        {
          kind: 'para',
          text:
            'Une fois les vecteurs décrits par leurs composantes, la colinéarité définie plus ' +
            'haut (section 3) se teste par un calcul, sans même faire de dessin.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Colinéarité de deux vecteurs — $\\vec{u}\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ ' +
              'et $\\vec{v}\\begin{pmatrix} x_v \\\\ y_v \\end{pmatrix}$ sont colinéaires ⟺ ' +
              '$x_u \\cdot y_v - y_u \\cdot x_v = 0$ (déterminant nul).',
            'Alignement de 3 points — A, B, C alignés ⟺ $\\vec{AB}$ et $\\vec{AC}$ colinéaires.',
          ],
        },
        {
          kind: 'exemple',
          badge: "tester l'alignement",
          formula: 'A(0 ; 0), B(2 ; 1), C(6 ; 3) — alignés ?',
          steps: [
            { tag: 'AB', text: '$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$' },
            { tag: 'AC', text: '$\\begin{pmatrix} 6 \\\\ 3 \\end{pmatrix}$' },
            { tag: 'déterminant', text: '$2 \\times 3 - 1 \\times 6 = 6 - 6 = 0$' },
          ],
          result: { tag: 'résultat', text: 'déterminant nul → A, B, C sont alignés ($\\vec{AC} = 3\\vec{AB}$)' },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — d'où vient ce déterminant ?",
          blocks: [
            {
              kind: 'para',
              text:
                'Par définition, $\\vec{u}\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ et ' +
                '$\\vec{v}\\begin{pmatrix} x_v \\\\ y_v \\end{pmatrix}$ sont colinéaires s\'il ' +
                'existe un nombre k tel que $\\vec{v} = k \\cdot \\vec{u}$. Composante par ' +
                'composante, cela donne $x_v = k \\cdot x_u$ et $y_v = k \\cdot y_u$, donc — ' +
                'tant que $x_u$ et $y_u$ sont non nuls — $k = x_v/x_u$ et $k = y_v/y_u$.',
            },
            {
              kind: 'para',
              text:
                'Ces deux expressions de k étant égales, $x_v/x_u = y_v/y_u$, soit, en ' +
                'multipliant les deux membres par $x_u \\cdot y_u$ : $x_u \\cdot y_v = y_u \\cdot ' +
                'x_v$, c\'est-à-dire $x_u \\cdot y_v - y_u \\cdot x_v = 0$.',
            },
            {
              kind: 'para',
              text:
                'Cette forme a l\'avantage de rester valable même quand $x_u$ ou $y_u$ vaut 0 — ' +
                "c'est elle qu'on utilise en pratique, jamais l'égalité de deux quotients (qui " +
                "exigerait de vérifier au préalable qu'aucun dénominateur n'est nul).",
            },
          ],
        },
        {
          kind: 'piege',
          label: "Ne pas confondre avec l'orthogonalité",
          text:
            '$x_u \\cdot y_v - y_u \\cdot x_v = 0$ teste la **colinéarité**. ' +
            '$x_u \\cdot x_v + y_u \\cdot y_v = 0$ teste l\'**orthogonalité** (section 14) — deux ' +
            'formules qui se ressemblent, pour deux relations opposées.',
        },
        {
          kind: 'entrainement',
          title: 'Colinéarité et alignement de points',
          generatorId: 'gen24',
          description: ['Teste la colinéarité de 2 vecteurs ou l\'alignement de 3 points, y compris avec des composantes dépendant d\'un paramètre x.'],
          chantier: '4e',
          whereLabel: '4e → « 24. Colinéarité et alignement de points »',
        },
      ],
    },

    {
      id: 'orthogonalite',
      number: 14,
      title: 'Orthogonalité et Pythagore généralisé',
      kicker: 'x_u·x_v + y_u·y_v = 0',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux vecteurs sont **orthogonaux** quand ils forment un angle droit. Ce test sert ' +
            "aussi bien à comparer deux vecteurs directement qu'à prouver qu'un triangle est " +
            'rectangle en l\'un de ses sommets.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 0, y: 4 }, tone: 'good' },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 4, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'above' },
              { x: 2, y: 0.15, vectorLabel: [{ text: 'AB', vector: true }], tone: 'accent', node: false },
              { x: 0.35, y: 2, vectorLabel: [{ text: 'AC', vector: true }], tone: 'good', node: false, labelPos: 'right' },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 4, y: 0 }, arm2: { x: 0, y: 4 } }],
            caption: '$\\vec{AB} \\cdot \\vec{AC} = 0$ ⟺ le triangle ABC est rectangle en A',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Orthogonalité de deux vecteurs — $\\vec{u} \\perp \\vec{v}$ ⟺ $x_u \\cdot x_v + y_u \\cdot y_v = 0$ (produit scalaire nul).',
            'Triangle rectangle en A — ⟺ $\\vec{AB} \\cdot \\vec{AC} = 0$ ; méthode alternative ' +
              'équivalente : $BC^2 = AB^2 + AC^2$ (Pythagore).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'tester un angle droit',
          formula:
            'A(0 ; 0), $\\vec{AB} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$, $\\vec{AC} = ' +
            '\\begin{pmatrix} -4 \\\\ 3 \\end{pmatrix}$ — le triangle ABC est-il rectangle en A ?',
          steps: [{ tag: 'produit scalaire', text: '$\\vec{AB} \\cdot \\vec{AC} = 3 \\times (-4) + 4 \\times 3 = -12 + 12 = 0$' }],
          result: { tag: 'résultat', text: 'produit scalaire nul → le triangle est rectangle en A' },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — d'où vient cette formule ?",
          blocks: [
            {
              kind: 'para',
              text:
                'Faire pivoter un vecteur $\\vec{OA}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ ' +
                'd\'un quart de tour donne un vecteur $\\vec{OA\'}\\begin{pmatrix} -y \\\\ x ' +
                '\\end{pmatrix}$, perpendiculaire à $\\vec{OA}$ par construction. Tout vecteur ' +
                '$\\vec{v}$ colinéaire à $\\vec{OA\'}$ — donc lui aussi perpendiculaire à ' +
                '$\\vec{OA}$ — s\'écrit $\\vec{v} = k \\cdot \\begin{pmatrix} -y \\\\ x ' +
                '\\end{pmatrix} = \\begin{pmatrix} -ky \\\\ kx \\end{pmatrix}$ pour un certain k.',
            },
            {
              kind: 'para',
              text:
                'En notant $\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix}$ les composantes de ' +
                '$\\vec{v}$, cela donne $x\'=-ky$ et $y\'=kx$, d\'où $x \\cdot x\' + y \\cdot y\' ' +
                '= x(-ky) + y(kx) = -kxy + kxy = 0$ : le produit scalaire de deux vecteurs ' +
                'perpendiculaires est toujours nul.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 3,
            yMin: -0.5,
            yMax: 4,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2.6, y: 1 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: -1, y: 2.6 }, tone: 'good' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 2.8, y: 1.1, vectorLabel: [{ text: 'OA', vector: true }], tone: 'accent', node: false },
              { x: -1.1, y: 2.8, vectorLabel: [{ text: 'OA', vector: true }, { text: '′' }], tone: 'good', node: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 2.6, y: 1 }, arm2: { x: -1, y: 2.6 } }],
            caption: "$\\vec{OA}'$ est l'image de $\\vec{OA}$ par une rotation de 90° — toujours perpendiculaire à $\\vec{OA}$",
          },
        },
        {
          kind: 'entrainement',
          title: 'Orthogonalité et Pythagore généralisé',
          generatorId: 'gen25',
          description: ["Teste l'orthogonalité de 2 vecteurs ou si un triangle est rectangle, y compris avec des composantes dépendant d'un paramètre x."],
          chantier: '4e',
          whereLabel: '4e → « 25. Orthogonalité et Pythagore généralisé »',
        },
      ],
    },

    {
      id: 'directeur',
      number: 15,
      title: "Vecteurs directeurs d'une droite",
      kicker: 'tout vecteur défini par deux points distincts de la droite',
      blocks: [
        {
          kind: 'para',
          text:
            'Un **vecteur directeur** d\'une droite d est un vecteur défini par deux points ' +
            'distincts de d — n\'importe lesquels. Comme deux points quelconques d\'une même ' +
            'droite donnent toujours des vecteurs colinéaires (section 13), une droite a une ' +
            'infinité de vecteurs directeurs, mais tous colinéaires entre eux.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 4.5,
            vectors: [
              { from: { x: 0.5, y: 0.4 }, to: { x: 6.5, y: 3.8 }, tone: 'faint' },
              { from: { x: 1, y: 0.7 }, to: { x: 3, y: 1.8 }, tone: 'accent' },
              { from: { x: 3, y: 1.8 }, to: { x: 5, y: 2.9 }, tone: 'good' },
              { from: { x: 1.5, y: 0.3 }, to: { x: 4.5, y: 2 }, tone: 'attn', dashed: true },
            ],
            points: [
              { x: 1, y: 0.7, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 1.8, label: 'B', tone: 'ink', labelPos: 'below' },
              { x: 5, y: 2.9, label: 'C', tone: 'ink', labelPos: 'above' },
              { x: 6.7, y: 4, label: 'd', tone: 'ink', node: false },
              { x: 1.5, y: 0.3, label: 'E', tone: 'ink', labelPos: 'below' },
              { x: 4.5, y: 2, label: 'F', tone: 'ink', labelPos: 'right' },
            ],
            caption: '$\\vec{AB}$, $\\vec{BC}$ et $\\vec{EF}$ sont trois vecteurs directeurs différents de la même droite d (avec $\\vec{EF} \\parallel d$)',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'AB, BC, CB… sont tous des vecteurs directeurs de d dès que A, B, C ∈ d.',
            'Si une droite EF est parallèle à d, alors $\\vec{EF}$ est aussi un vecteur directeur de d.',
            'Droite parallèle à l\'axe des x (horizontale) — vecteur directeur $\\begin{pmatrix} k \\\\ 0 \\end{pmatrix}$, k ≠ 0.',
            'Droite parallèle à l\'axe des y (verticale) — vecteur directeur $\\begin{pmatrix} 0 \\\\ k \\end{pmatrix}$, k ≠ 0.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — vers le chapitre suivant',
          items: [
            'Le vecteur directeur est l\'outil qui permet de décrire une droite par une équation ' +
              'paramétrique ou cartésienne — la notion revient au centre du chapitre consacré aux droites.',
          ],
        },
      ],
    },

    {
      id: 'comparaison',
      number: 16,
      title: 'Comparer des vecteurs : longueur, direction, sens',
      kicker: '3 propriétés indépendantes — chacune peut coïncider ou non',
      blocks: [
        {
          kind: 'para',
          text:
            "Deux vecteurs peuvent partager n'importe quel sous-ensemble de ces trois " +
            'propriétés : leur **longueur**, leur **direction** et leur **sens**. Seule ' +
            "l'égalité ($\\vec{u} = \\vec{v}$) exige les trois à la fois.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 3.5 }, to: { x: 2, y: 4 }, tone: 'accent' },
              { from: { x: 0, y: 1 }, to: { x: 2, y: 1.5 }, tone: 'accent' },
              { from: { x: 3.5, y: 3.7 }, to: { x: 6.5, y: 4.4 }, tone: 'good' },
              { from: { x: 6.5, y: 0.3 }, to: { x: 4.5, y: 0.8 }, tone: 'bad' },
            ],
            points: [
              { x: 1, y: 4.3, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
              { x: 1, y: 1.8, vectorLabel: [{ text: '= ' }, { text: 'u', vector: true }, { text: ' (ailleurs)' }], tone: 'accent', node: false },
              { x: 5, y: 4.7, vectorLabel: [{ text: '2·' }, { text: 'u', vector: true }], tone: 'good', node: false },
              { x: 5.5, y: 0.1, vectorLabel: [{ text: '−' }, { text: 'u', vector: true }], tone: 'bad', node: false },
            ],
            caption: 'même vecteur $\\vec{u}$ représenté à 2 endroits (identique), $2\\vec{u}$ (même sens, plus long), $-\\vec{u}$ (sens opposé)',
          },
        },
        {
          kind: 'featureTable',
          headers: ['Relation', 'Longueur', 'Direction', 'Sens'],
          rows: [
            ['Vecteurs égaux', 'identique', 'identique', 'identique'],
            ['Vecteurs opposés (−u)', 'identique', 'identique', 'opposé'],
            ['Colinéaires, même sens (k>0)', 'quelconque', 'identique', 'identique'],
            ['Colinéaires, sens opposé (k<0)', 'quelconque', 'identique', 'opposé'],
          ],
        },
        {
          kind: 'piege',
          text:
            'Même longueur ne signifie **jamais** colinéaire : deux vecteurs peuvent avoir ' +
            'exactement la même norme tout en pointant dans des directions complètement différentes.',
        },
        {
          kind: 'entrainement',
          title: 'Comparaison visuelle de vecteurs sur figure',
          generatorId: 'gen28',
          description: ['Sélectionne, parmi des vecteurs dérivés d\'un ou deux vecteurs de base, ceux qui partagent une propriété (longueur, direction ou sens) avec une référence.'],
          chantier: '4e',
          whereLabel: '4e → « 28. Comparaison visuelle de vecteurs sur figure »',
        },
      ],
    },

    {
      id: 'applications',
      number: 17,
      title: 'Applications physiques : la résultante',
      kicker: 'R² = F₁² + F₂² + 2·F₁·F₂·cos θ (loi des cosinus, chapitre 5)',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux forces ou deux vitesses s\'additionnent comme des vecteurs. Leur **résultante** ' +
            'se calcule avec la loi des cosinus, vue au chapitre précédent — le triangle formé ' +
            'par les deux vecteurs et leur somme n\'est presque jamais rectangle.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 2, y: 3.3 }, tone: 'attn' },
              { from: { x: 4, y: 0 }, to: { x: 6, y: 3.3 }, tone: 'faint', dashed: true },
              { from: { x: 2, y: 3.3 }, to: { x: 6, y: 3.3 }, tone: 'faint', dashed: true },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 3.3 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 2, y: -0.35, vectorLabel: [{ text: 'v', vector: true }, { text: '₁' }], tone: 'good', node: false },
              { x: 0.6, y: 1.8, vectorLabel: [{ text: 'v', vector: true }, { text: '₂' }], tone: 'attn', node: false, labelPos: 'left' },
              { x: 3.6, y: 1.9, vectorLabel: [{ text: 'v', vector: true }, { text: 'R' }], tone: 'accent', node: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 59, radiusPx: 26, label: 'θ', tone: 'accent' }],
            caption: 'règle du parallélogramme : la résultante $\\vec{v_R}$ est la diagonale issue de O',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Repérer l\'angle θ entre les deux vecteurs, mesuré depuis leur origine commune.',
            'Calculer la norme de la résultante : $R^2 = F_1^2 + F_2^2 + 2 \\cdot F_1 \\cdot F_2 \\cdot \\cos\\theta$.',
            'Si besoin, calculer la **déviation** (l\'écart angulaire entre la résultante et l\'un ' +
              'des deux vecteurs) par la loi des sinus, puis la traduire en direction cardinale ' +
              'selon le contexte de la figure.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux forces',
          formula: 'F₁ = 50 N, F₂ = 30 N, angle entre les deux forces θ = 60°.',
          steps: [
            { tag: 'norme de la résultante', text: '$R^2 = 50^2 + 30^2 + 2 \\times 50 \\times 30 \\times \\cos 60° = 2500 + 900 + 1500 = 4900$' },
            { tag: 'racine', text: '$R = \\sqrt{4900} = 70$ N' },
            { tag: 'déviation (loi des sinus)', text: '$\\sin(\\text{déviation})/F_2 = \\sin\\theta/R \\Rightarrow \\sin(\\text{déviation}) = 30 \\times \\sin 60°/70 \\approx 0{,}371$' },
          ],
          result: { tag: 'résultat', text: 'R = 70 N, déviation ≈ 21,8° par rapport à F₁' },
        },
        {
          kind: 'rappel',
          label: 'Rappel — notation contexte-aware',
          items: [
            'La notation suit toujours le contexte : des forces se notent $\\vec{F_1}$, ' +
              '$\\vec{F_2}$, $\\vec{F_R}$ ; des vitesses (par exemple avion et vent) se notent ' +
              '$\\vec{v_1}$, $\\vec{v_2}$, $\\vec{v_R}$.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Applications physiques (résultante de vecteurs)',
          generatorId: 'gen29',
          description: ['Calcule la norme, la déviation et la direction cardinale de la résultante de deux vecteurs (avion/vent, forces), via la loi des cosinus.'],
          chantier: '4e',
          whereLabel: '4e → « 29. Applications physiques (résultante de vecteurs) »',
        },
      ],
    },

    {
      id: 'revision',
      number: 18,
      title: 'Révision — quiz vrai/faux',
      kicker: '180 affirmations en 9 thèmes',
      blocks: [
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre transversalement les dix générateurs de ce chapitre — ' +
            'un thème par générateur, sauf pour les deux premiers (relation vectorielle), qui ' +
            'partagent une seule banque puisqu\'ils testent exactement le même contenu mathématique.',
        },
      ],
    },
  ],

  recap: {
    items: [
      'Vecteur — direction, sens, longueur ; composantes $\\vec{AB} = \\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$, indépendantes du point d\'application.',
      'Combiner — addition (triangle ou parallélogramme) et multiplication par un scalaire, ' +
        'composante par composante ; k>0 conserve le sens, k<0 l\'inverse ; opposé ' +
        '$-\\vec{u} = (-1) \\cdot \\vec{u}$ ; soustraire, c\'est ajouter l\'opposé.',
      'Chasles — une chaîne de vecteurs se réduit du premier point au dernier ; une chaîne fermée se réduit au vecteur nul.',
      'Norme — $\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}$, toujours ≥ 0 ; distance entre deux points = norme du vecteur qui les relie.',
      'Points — translation B = A + u ; milieu = moyenne des coordonnées ; relation générale ' +
        '$\\vec{AM} = k \\cdot \\vec{AB}$, toujours sur la droite (AB).',
      'Colinéarité — $x_uy_v-y_ux_v=0$ ; orthogonalité — $x_ux_v+y_uy_v=0$ — deux tests à ne jamais confondre.',
      'Vecteur directeur — tout vecteur défini par 2 points d\'une droite ; tous colinéaires entre eux, pour une même droite.',
      'Résultante — somme vectorielle de deux forces ou vitesses, norme obtenue par la loi des cosinus.',
    ],
    checklist: {
      label: 'Avant de rendre ta copie',
      items: [
        'Ai-je bien vérifié que les vecteurs se relaient point par point avant d\'appliquer Chasles ?',
        'Ma norme est-elle bien positive ou nulle, jamais négative ?',
        'Ai-je bien calculé le milieu comme une moyenne, jamais comme une différence de coordonnées ?',
        'Ai-je utilisé la bonne formule — déterminant pour la colinéarité, produit scalaire pour l\'orthogonalité ?',
      ],
    },
    forward:
      "Composantes, norme et produit scalaire reviendront tels quels dès qu'un vecteur apparaît " +
      "en trois dimensions, dans la géométrie de l'espace — avec une troisième composante en plus.",
    entrainement: {
      kind: 'entrainement',
      title: 'Calcul vectoriel — quiz vrai/faux',
      generatorId: 'gen64',
      description: ['180 affirmations pré-écrites réparties en 9 thèmes (20 par thème) qui reprennent tout ce chapitre. Un seul essai par question, la justification est toujours révélée.'],
      chantier: '4e',
      whereLabel: '4e → « 64. Calcul vectoriel — quiz vrai/faux »',
    },
  },
}
