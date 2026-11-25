import type { ChapterContent } from '../../types'

export const fonctionSecondDegre: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 1,
  title: 'La fonction du second degré',
  slug: 'fonction-second-degre',
  lede:
    '$f(x) = ax^2 + bx + c$ : le graphique, c\'est toujours une parabole. Dans ce chapitre, tu ' +
    'vas apprendre trois choses : la **lire**, la **transformer**, puis t\'en **servir**. À la ' +
    'fin de chaque partie, tu as un exercice pour t\'entraîner tout de suite.',

  intro: {
    title: "Avant de commencer : qu'est-ce qu'une fonction du second degré ?",
    blocks: [
        { kind: 'video', title: 'Introduction : rappel du premier degré et définition', youtubeId: 'KprphYChaDk' },
      {
        kind: 'para',
        text:
          'Avant d\'attaquer le second degré, un petit rappel. La fonction $f(x) = mx + p$ est ' +
          'une fonction du **premier degré**. Son graphique, c\'est toujours une **droite**.',
      },
      {
        kind: 'rappel',
        label: 'Paramètres m et p',
        items: [
          'm, c\'est le **taux d\'accroissement** de f. C\'est la pente de la droite : ' +
            '$m = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$.',
          'p, c\'est l\'**ordonnée à l\'origine**. C\'est la valeur de f quand $x = 0$. Donc $f(0) = p$.',
        ],
      },
      {
        kind: 'para',
        text:
          'Le **zéro** de f, c\'est là où la droite coupe l\'axe des x. Pour le trouver, résous ' +
          '$mx + p = 0$. Tu obtiens $x = -p/m$.',
      },
      {
        kind: 'exemple',
        badge: 'f(x) = 2x − 3',
        steps: [
          { tag: "m — taux d'accroissement", text: '$m = 2$' },
          { tag: "p — ordonnée à l'origine", text: '$p = -3$, donc $f(0) = -3$' },
        ],
        result: { tag: 'zéro de f', text: '$x = -(-3)/2 = 1{,}5$' },
      },
      {
        kind: 'para',
        text:
          'Le graphique de la fonction de référence $f(x) = x^2$ s\'appelle une **parabole**. On ' +
          'l\'appelle P. Elle est tournée vers le haut. Son sommet, c\'est l\'origine du repère.',
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: (x) => x * x, tone: 'accent', xMin: -2.9, xMax: 2.9 }],
          xMin: -3,
          xMax: 3,
          xTicks: [-3, -2, -1, 1, 2, 3],
          yTicks: [1, 2, 3, 4, 5, 6, 7, 8],
          // 'right' plutôt que le défaut 'above' : le sommet est sur l'axe des y, et "(0 ; 0)"
          // centré au-dessus chevauchait la graduation "1" de l'axe des y — constaté à l'écran.
          points: [{ x: 0, y: 0, label: '(0 ; 0)', tone: 'good', labelPos: 'right' }],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'f(x) = x² : sommet (0 ; 0), tournée vers le haut',
        },
      },
      {
        kind: 'featureTable',
        caption: 'Caractéristiques de f(x) = x²',
        headers: ['Caractéristique', 'Valeur'],
        rows: [
          ['Domaine de f', 'ℝ'],
          ['Sommet de P', '(0 ; 0)'],
          ['Tournée vers', 'le haut'],
          ['Racine de f', 'x = 0'],
          ['Axe de symétrie de P', 'x = 0'],
        ],
      },
      {
        kind: 'para',
        text:
          'Une fonction du second degré (ou fonction quadratique), c\'est une fonction qu\'on ' +
          'peut écrire sous cette forme :',
      },
      {
        kind: 'rappel',
        label: 'Forme générale',
        items: ['$f(x) = ax^2 + bx + c$, avec a, b, c des nombres réels, et $a \\neq 0$.'],
      },
      {
        kind: 'para',
        text:
          'Le coefficient a ne peut **jamais** être nul. Sans lui, il ne reste que $bx + c$ : ' +
          'une fonction du premier degré ! Le graphique d\'une fonction du second degré, c\'est ' +
          '**toujours** une parabole — jamais un segment, jamais une courbe bizarre. Son ' +
          'domaine, c\'est toujours ℝ (tous les réels), sans exception, quels que soient a, b et c.',
      },
      {
        kind: 'exemple',
        badge: 'reconnaître a, b, c',
        formula: '$f(x) = -2x^2 + 5x - 3$',
        steps: [
          { tag: 'a — coefficient de x²', text: '$a = -2$' },
          { tag: 'b — coefficient de x', text: '$b = 5$' },
        ],
        result: { tag: 'c — terme constant', text: '$c = -3$' },
      },
      {
        kind: 'attention',
        label: 'Attention — développer avant de conclure',
        text:
          'Une expression peut **ressembler** à une fonction du second degré, sans en être une ! ' +
          'Ça arrive quand les termes en $x^2$ s\'annulent une fois développés. Exemple : ' +
          '$f(x) = (x+2)^2 - x^2$ se développe en $f(x) = 4x + 4$. Le $x^2$ a disparu : c\'est ' +
          'une fonction du **premier** degré ! Développe toujours avant de conclure.',
      },
    ],
  },

  sections: [
    {
      id: 'etudier',
      number: 1,
      title: 'Étudier une parabole',
      kicker: "lire les propriétés d'une parabole sur son équation",
      titreCourt: 'Étudier une parabole',
      partie: 'La parabole : la lire, la transformer',
      essentiel: [
        'Le signe de a donne l\'allure : si $a > 0$, la parabole est ouverte vers le haut et a un **minimum** ; si $a < 0$, elle est ouverte vers le bas et a un **maximum**. Le terme c est l\'ordonnée à l\'origine : $f(0) = c$.',
        'Le sommet : $x_S = -\\dfrac{b}{2a}$ et $y_S = f(x_S)$ ; l\'axe de symétrie est la droite $x = x_S$. Le domaine est toujours ℝ ; l\'image vaut $[y_S\\,;\\,{+\\infty}[$ si $a > 0$ et $]{-\\infty}\\,;\\,y_S]$ si $a < 0$.',
        'Tableau de signes : à l\'extérieur des zéros, f(x) a le signe de a ; entre les zéros, le signe opposé.',
      ],
      cartes: [
        { question: 'Que t\'apprend le signe de a ?', reponse: 'L\'ouverture : vers le haut si $a > 0$ (un minimum), vers le bas si $a < 0$ (un maximum).' },
        { question: 'Comment calcule-t-on le sommet de $f(x) = ax^2 + bx + c$ ?', reponse: '$x_S = -\\dfrac{b}{2a}$, puis $y_S = f(x_S)$.' },
        { question: 'Quelle est l\'image de $f(x) = 3(x+1)^2 - 3$ ?', reponse: '$[-3\\,;\\,{+\\infty}[$ : $a = 3 > 0$, le sommet $S(-1\\,;\\,-3)$ est un minimum.' },
        { question: 'Quel est le signe de $f(x) = (x-1)(x-4)$ entre 1 et 4 ?', reponse: 'Négatif : entre les zéros, f(x) a le signe opposé à a, et ici $a = 1 > 0$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Étudier une parabole (1/2) : allure, sommet et axe de symétrie', youtubeId: 'B4ht8n3qdV4' },
        { kind: 'video', title: 'Étudier une parabole (2/2) : domaine, image, zéros, signes et variations', youtubeId: 'LLeP6JrBbqA' },
        { kind: 'subheading', text: "Le rôle du coefficient a — l'allure de la parabole" },
        {
          kind: 'intuition',
          label: 'Une image pour ne jamais confondre',
          text:
            "Lance une balle en l'air : elle monte, ralentit, puis redescend — sa trajectoire a " +
            'un point le plus **haut**, jamais de point le plus bas. À l\'inverse, une bille ' +
            "lâchée dans un bol roule vers le fond, puis remonte de l'autre côté : elle a un " +
            'point le plus **bas**, jamais de point le plus haut. Une parabole se comporte ' +
            'exactement pareil : ouverte vers le bas, elle a toujours un maximum ; ouverte vers ' +
            'le haut, toujours un minimum.',
        },
        {
          kind: 'historique',
          titre: "Galilée et la première preuve que les projectiles dessinent une parabole",
          text:
            "Pendant des siècles, on pensait qu'un projectile (une flèche, un boulet de canon) " +
            'montait en ligne droite, puis retombait brusquement — deux mouvements bien ' +
            'distincts. C\'est le physicien italien **Galilée** qui, dans son ouvrage Discours ' +
            "concernant deux sciences nouvelles (1638), démontre pour la première fois que la " +
            'trajectoire réelle est en fait une seule courbe continue : une **parabole**. Son ' +
            "idée clé est de décomposer le mouvement en deux directions indépendantes — un " +
            'déplacement horizontal à vitesse constante, et une chute verticale accélérée par ' +
            'la gravité — et de montrer que leur combinaison dessine exactement la courbe que ' +
            'tu étudies dans ce chapitre. C\'est l\'un des tout premiers exemples de l\'histoire ' +
            'où une expérience physique (lâcher une bille, observer un jet d\'eau) est ' +
            'expliquée par une seule équation mathématique.',
          image: {
            src: '/images/historique/galilee.jpg',
            alt: 'Portrait de Galilée',
            caption: 'Galilée (1564–1642), portrait par Justus Sustermans, 1636.',
          },
        },
        {
          kind: 'atelier',
          tag: 'galilee-trajectoire-widget',
          label: 'Manipule toi-même — l\'expérience de Galilée',
          caption:
            'Lance un objet horizontalement depuis une hauteur h₀ avec une vitesse v, et ' +
            'observe ses positions toutes les 0,2 s. À l\'horizontale, il avance de pas ' +
            'réguliers (x = v·t) ; à la verticale, il tombe de plus en plus vite (y = h₀ − ' +
            '5t²). En combinant les deux mouvements, comme l\'a fait Galilée, on obtient une ' +
            'parabole.',
        },
        {
          kind: 'para',
          text:
            'Le signe et la valeur de a donnent la forme générale de la parabole. Tu le sais ' +
            'avant même de connaître b et c !',
        },
        {
          kind: 'list',
          items: [
            '**Signe de a** — si $a > 0$, la parabole est ouverte vers le haut : elle a un ' +
              '**minimum**. Si $a < 0$, elle est ouverte vers le bas : elle a un **maximum**.',
            '**Valeur de |a|** — plus |a| est grand, plus la parabole est **resserrée**. Plus ' +
              '|a| est proche de 0, plus elle est **aplatie**.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 2 * x * x, tone: 'accent', xMin: -1.9, xMax: 1.9 },
              { fn: (x) => 0.4 * x * x, tone: 'faint', xMin: -3, xMax: 3 },
              { fn: (x) => -1 * x * x + 6, tone: 'bad', xMin: -2.7, xMax: 2.7 },
            ],
            xMin: -3,
            xMax: 3,
            xTicks: [-3, -2, -1, 1, 2],
            yTicks: [-2, -1, 1, 2, 3, 4, 5, 6],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'trois valeurs de a : positive et grande (étroite), positive et petite (large), ' +
              'négative (renversée)',
          },
        },
        {
          kind: 'piege',
          text:
            'b et c n\'ont **aucune influence** sur le sens d\'ouverture ! Seul le signe de a ' +
            'compte. Un grand c décale juste la courbe — il ne la retourne jamais.',
        },
        { kind: 'subheading', text: 'Lire les signes de a, b et c sur un graphique' },
        {
          kind: 'methode',
          label: 'Méthode — trois lectures, dans cet ordre',
          items: [
            '**a** : la parabole est ouverte vers le haut ? $a > 0$. Vers le bas ? $a < 0$.',
            '**c** : c\'est l\'**ordonnée à l\'origine**, puisque $f(0) = c$. Regarde où la courbe coupe ' +
              'l\'axe des y : au-dessus de l\'origine, $c > 0$ ; en dessous, $c < 0$.',
            '**b** : utilise $x_S = -\\dfrac{b}{2a}$. Si l\'axe de symétrie est à **gauche** de l\'axe des ' +
              'y ($x_S < 0$), a et b ont le **même** signe ; à droite, des signes **opposés** ; sur l\'axe ' +
              'des y, $b = 0$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'lire a, b, c sur un graphique',
          formula: 'Une parabole est ouverte vers le bas, coupe l\'axe des y en 3, et son sommet a pour abscisse −1. Donne le signe de a, b et c.',
          steps: [
            { tag: 'ouverture', text: 'ouverte vers le bas : $a < 0$' },
            { tag: 'ordonnée à l\'origine', text: '$f(0) = c = 3$ : $c > 0$' },
            { tag: 'axe à gauche', text: '$x_S = -1 < 0$ : a et b ont le même signe, donc $b < 0$ (en effet $-\\dfrac{b}{2a} = -1 \\iff b = 2a$)' },
          ],
          result: { tag: 'résultat', text: '$a < 0$, $b < 0$, $c > 0$ — par exemple $f(x) = -x^2 - 2x + 3$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => -x * x - 2 * x + 3, tone: 'accent', xMin: -3.6, xMax: 1.6 }],
            xMin: -4,
            xMax: 2.5,
            xTicks: [-3, -2, -1, 1, 2],
            yTicks: [-2, 2, 4],
            fixedYRange: { min: -3, max: 5 },
            axisOfSymmetry: { x: -1, label: 'x = −1' },
            points: [
              { x: 0, y: 3, label: '(0 ; 3)', tone: 'good', labelPos: 'right' },
              { x: -1, y: 4, label: 'S', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'ouverte vers le bas (a < 0), coupe Oy en 3 (c > 0), axe à gauche de Oy (b de même signe que a)',
          },
        },
        {
          kind: 'piege',
          text:
            'Le signe de b ne se lit **jamais seul** : il dépend aussi de a. Un axe à gauche donne ' +
            '$b > 0$ si $a > 0$, mais $b < 0$ si $a < 0$.',
        },
        {
          kind: 'entrainement',
          title: 'Lire une parabole sur un graphique',
          generatorId: 'gen123',
          description: [
            'Une parabole est tracée sur un quadrillage : retrouve les signes de a, b et c avec les ' +
              'trois lectures du cours, puis lis le sommet et l’axe de symétrie, les zéros, ' +
              'l’ordonnée à l’origine et l’image de la fonction.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 123. Lire une parabole sur un graphique »',
        },
        { kind: 'subheading', text: "Reconnaître une fonction à partir d'un tableau de valeurs" },
        {
          kind: 'para',
          text:
            'Parfois, tu ne connais une fonction que par un tableau de valeurs (avec des x ' +
            'régulièrement espacés). Tu peux quand même reconnaître son type, sans connaître son ' +
            'équation. Regarde les **accroissements** de f(x) :',
        },
        {
          kind: 'list',
          items: [
            'accroissements de f(x) constants → f est du **premier degré**',
            'accroissements des accroissements constants → f est du **second degré**',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'reconnaître via un tableau',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['x', '0', '1', '2', '3', '4'],
              rows: [['f(x)', '1', '2', '5', '10', '17']],
            },
            { kind: 'para', text: 'Accroissements de f(x) : 1, 3, 5, 7. Pas constants.' },
            {
              kind: 'rappel',
              label: 'Accroissements des accroissements',
              items: ['2, 2, 2 — constants → f est du second degré.'],
            },
          ],
        },
        {
          kind: 'rappel',
          label: 'Retrouver a, b et c à partir du tableau (x de 1 en 1)',
          items: [
            'Avec un pas de 1, la différence seconde constante vaut **2a** : ici $2 = 2a$, donc $a = 1$. ' +
              '(En effet, $f(x+1) - f(x) = 2ax + a + b$ augmente de $2a$ quand x augmente de 1.)',
            '$c = f(0) = 1$, puis $f(1) = a + b + c = 2$ donne $b = 0$ : $f(x) = x^2 + 1$.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'differences-secondes-widget',
          label: 'Manipule toi-même — premier ou second degré ?',
          caption:
            'Choisis une fonction ou laisse le hasard décider, puis calcule les différences ' +
            'premières et secondes de son tableau de valeurs. Des différences premières ' +
            'constantes signalent une fonction du premier degré ; des différences secondes ' +
            'constantes, une fonction du second degré. Dans ce cas, la différence seconde ' +
            'vaut 2a, ce qui permet de retrouver a, puis b et c.',
        },
        {
          kind: 'entrainement',
          title: 'Premier ou second degré ? Différences secondes',
          generatorId: 'gen124',
          description: [
            'Un tableau de valeurs : calcule les différences premières, puis secondes, décide si la ' +
              'fonction est du premier degré, du second degré ou ni l’un ni l’autre, et retrouve son ' +
              'expression (la différence seconde vaut 2a, c = f(0), f(1) = a + b + c).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 124. Premier ou second degré ? Différences secondes »',
        },
        { kind: 'subheading', text: 'Sommet et axe de symétrie' },
        {
          kind: 'intuition',
          label: 'Tu as déjà vu ça',
          text:
            "Un ballon lancé en l'air, un jet d'eau, une balle de basket qui file vers le " +
            'panier : leur trajectoire dessine cette même forme, avec un point culminant, le ' +
            "plus haut atteint. Ce point, c'est exactement le **sommet** de la parabole — un " +
            'vrai ballon lancé revient d\'ailleurs à la fin de ce chapitre (section 3), puis dans ' +
            '[[4e/equations-inequations-second-degre#contexte]].',
        },
        {
          kind: 'para',
          text:
            'Toute parabole est **symétrique**. Elle a un axe de symétrie : une droite verticale. ' +
            'Cette droite passe par le point le plus bas (si $a > 0$) ou le plus haut (si ' +
            '$a < 0$) : le **sommet** $S(x_S\\,;\\,y_S)$. L\'axe de symétrie a pour équation $x = x_S$.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 0.5 * (x - 2) * (x - 2) - 1, tone: 'accent', xMin: -1.8, xMax: 5.8 }],
            xMin: -2,
            xMax: 6,
            xTicks: [-2, -1, 1, 3, 4, 5],
            yTicks: [-2, -1, 1, 2, 3, 4, 5],
            axisOfSymmetry: { x: 2, label: 'x = 2' },
            points: [{ x: 2, y: -1, label: 'S(2 ; −1)', tone: 'accent' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'le sommet S(2 ; −1) est le minimum de la parabole ; l’axe x = 2 partage la ' +
              'courbe en deux moitiés identiques',
          },
        },
        {
          kind: 'astuce',
          label: "Astuce — retrouver l'axe sans a, b, c",
          text:
            'Tu connais deux points de même hauteur ? $f(x_1) = f(x_2)$ ? Alors l\'axe de ' +
            'symétrie passe par leur **milieu** : $\\dfrac{x_1+x_2}{2}$. Exemple : $f(0) = 5$ et ' +
            '$f(6) = 5$. L\'axe est $x = \\dfrac{0+6}{2} = 3$ — sans avoir besoin de connaître ' +
            'a, b ni c !',
        },
        { kind: 'subheading', text: "D'où vient la formule de l'abscisse du sommet ?" },
        {
          kind: 'para',
          text:
            'Cette même astuce du milieu permet de retrouver $x_S$ directement, à partir de a, b ' +
            'et c, sans dessiner la courbe.',
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — l'abscisse du sommet",
          blocks: [
            {
              kind: 'para',
              text:
                'On veut démontrer que la parabole de $f(x) = ax^2+bx+c$ (avec $a \\neq 0$) a son ' +
                'sommet en $x_S = -\\dfrac{b}{2a}$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — on se débarrasse de c.** Pose $g(x) = ax^2+bx$ : la même expression, ' +
                'avec c remplacé par 0. Pour tout x, $f(x) = g(x) + c$. La courbe de f est donc ' +
                'celle de g décalée verticalement de c. Un décalage vertical ne change **jamais** ' +
                'l\'abscisse du sommet : f et g ont le même $x_S$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — les zéros de g.** On met x en évidence (vu en 3e) : ' +
                '$ax^2+bx = x(ax+b)$, et $x(ax+b) = 0 \\iff x = 0$ ou $x = -\\dfrac{b}{a}$. Ce sont ' +
                'deux points de la courbe de g à la même hauteur : 0.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — le milieu.** Deux points de même hauteur sont symétriques par rapport à ' +
                'l\'axe : l\'axe passe par leur milieu (astuce ci-dessus). Donc ' +
                '$x_S = \\dfrac{0 + \\left(-\\frac{b}{a}\\right)}{2} = -\\dfrac{b}{2a}$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Ce $x_S$ est celui de g, donc aussi celui de f (étape 1). ' +
                'L\'ordonnée $y_S$, elle, dépend de c : on la calcule en remplaçant x par $x_S$ ' +
                'dans f, $y_S = f(x_S)$.',
            },
          ],
        },
        {
          kind: 'rappel',
          label: 'Formules du sommet',
          items: [
            '$x_S = -\\dfrac{b}{2a}$',
            '$AS \\equiv x = x_S$ (axe de symétrie)',
            '$S(x_S\\,;\\,y_S)$, avec $y_S = f(x_S)$',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x - 4 * x, tone: 'faint', xMin: -0.6, xMax: 4.6 },
              { fn: (x) => x * x - 4 * x + 6, tone: 'accent', xMin: -0.6, xMax: 4.6 },
            ],
            xMin: -1,
            xMax: 5,
            xTicks: [-1, 1, 3],
            yTicks: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8],
            axisOfSymmetry: { x: 2, label: 'x = 2' },
            // Racine x=0 volontairement sans label : sa position coïncide avec la graduation
            // y=-1 de l'axe des y juste en dessous (collision constatée à l'écran) — la valeur 0
            // reste de toute façon la plus évidente du graphe (origine des axes).
            roots: [{ x: 0 }, { x: 4, label: '4' }],
            points: [{ x: 2, y: 2, label: 'S(2 ; 2)', tone: 'accent' }],
            // x=2.5 (plutôt que 3.2) et y=-3.4 (plutôt que -3) : le label "g(x) = ..." empiétait
            // sur la racine "4" tracée sous l'axe en x=4 — chevauchement constaté à l'écran.
            textLabels: [
              { x: 2.5, y: -3.4, text: 'g(x) = x² − 4x', tone: 'ink' },
              { x: 2.3, y: 7.2, text: 'f(x) = x² − 4x + 6', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'g(x) = x² − 4x (racines 0 et 4) et f(x) = x² − 4x + 6 (aucune racine réelle) : ' +
              'ajouter c translate la courbe verticalement, sans jamais déplacer $x_S = 2$',
          },
        },
        {
          kind: 'exemple',
          badge: 'application directe',
          formula: '$f(x) = 2x^2-8x+3$',
          steps: [{ tag: 'abscisse du sommet', text: '$x_S = -\\dfrac{-8}{2 \\cdot 2} = 2$' }],
          result: {
            tag: 'ordonnée et sommet',
            text:
              '$y_S = f(2) = 8-16+3 = -5 \\to S(2\\,;\\,-5)$ — le même résultat qu\'avec la ' +
              'forme canonique, plus loin dans ce chapitre.',
          },
        },
        {
          kind: 'atelier',
          tag: 'parabole-widget',
          label: 'Manipule toi-même — fais varier a, b et c',
          caption:
            'Fais varier a, b et c : la parabole, ses zéros et son image se mettent à jour ' +
            'en direct. Coche AS, S ou OAO pour afficher l\'axe de symétrie, le sommet et ' +
            'l\'ordonnée à l\'origine. Passe ensuite en mode Défi des signes : retrouve le ' +
            'signe de a, de b et de c en lisant seulement le graphique — un seul essai, ' +
            'puis la correction explique chaque signe.',
        },
        { kind: 'subheading', text: 'Domaine et image' },
        {
          kind: 'intuition',
          label: 'Pourquoi le domaine est-il toujours ℝ ?',
          text:
            'Une fonction du second degré ne contient ni dénominateur, ni racine carrée : rien ' +
            "qui puisse jamais empêcher un calcul, quelle que soit la valeur de x. La machine " +
            "$ax^2+bx+c$ accepte n'importe quel nombre réel en entrée, sans jamais planter. Tu " +
            "rencontreras plus tard des fonctions où ce n'est plus vrai — un dénominateur qui " +
            'peut valoir 0, par exemple — où le domaine demandera un vrai calcul.',
        },
        {
          kind: 'para',
          text:
            'Le domaine, c\'est toujours ℝ. C\'est l\'un des rares faits de ce chapitre qui ne ' +
            'dépend d\'aucun coefficient ! L\'image, elle, dépend du sommet $S(x_S\\,;\\,y_S)$ et ' +
            'du signe de a :',
        },
        {
          kind: 'list',
          items: [
            '$a > 0$ — le sommet est un minimum ; $\\operatorname{im} f = [y_S\\,;\\,{+\\infty}[$.',
            '$a < 0$ — le sommet est un maximum ; $\\operatorname{im} f = ]{-\\infty}\\,;\\,y_S]$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => -0.6 * (x + 1) * (x + 1) + 4, tone: 'accent', xMin: -4.4, xMax: 2.4 }],
            xMin: -5,
            xMax: 3,
            xTicks: [-5, -4, -3, -2, 1, 2],
            yTicks: [-3, -2, -1, 1, 2, 3],
            points: [{ x: -1, y: 4, label: 'S(−1 ; 4)', tone: 'accent' }],
            imageBand: { from: 4, direction: 'down', tone: 'good' },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'le maximum vaut 4 : la courbe ne dépasse jamais cette valeur, d’où l’image ]−∞ ; 4]',
          },
        },
        {
          kind: 'exemple',
          badge: 'cas a > 0',
          formula: '$f(x) = 3(x+1)^2 - 3$',
          steps: [
            { tag: 'sommet', text: '$S(-1\\,;\\,-3)$' },
            { tag: 'signe de a', text: '$a = 3 > 0$ → minimum' },
          ],
          result: {
            tag: 'image',
            text:
              '$\\operatorname{im} f = [-3\\,;\\,{+\\infty}[$ — la courbe ne descend jamais sous ' +
              '$-3$, mais monte indéfiniment',
          },
        },
        { kind: 'subheading', text: 'Les zéros (racines) de la fonction' },
        {
          kind: 'para',
          text:
            'Les **zéros** de f, ce sont les valeurs de x où $f(x) = 0$. Ce sont les abscisses ' +
            'des points où la courbe coupe l\'axe des x. Une parabole peut en avoir **0, 1 ou 2** ' +
            '— ça dépend de la position du sommet par rapport à cet axe.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 0.5 * (x - 2.5) * (x - 2.5) - 1.125, tone: 'accent' }],
              xMin: -1,
              xMax: 5,
              xTicks: [],
              showYAxis: false,
              roots: [
                { x: 1, label: '1' },
                { x: 4, label: '4' },
              ],
              xAxisLabel: '',
              yAxisLabel: '',
              caption: '2 racines distinctes',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 0.5 * (x - 2) * (x - 2), tone: 'accent' }],
              xMin: -1,
              xMax: 5,
              xTicks: [],
              showYAxis: false,
              roots: [{ x: 2, label: '2' }],
              xAxisLabel: '',
              yAxisLabel: '',
              caption: '1 racine (double)',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 0.5 * (x - 2) * (x - 2) + 1.5, tone: 'bad' }],
              xMin: -1,
              xMax: 5,
              xTicks: [],
              showYAxis: false,
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'aucune racine réelle',
            },
          ],
        },
        {
          kind: 'para',
          text: 'f(x) se factorise facilement ? Alors les zéros se lisent directement dans la forme factorisée :',
        },
        {
          kind: 'exemple',
          badge: 'zéros par factorisation',
          formula: '$f(x) = (x-1)(x-4)$',
          steps: [{ tag: "un produit est nul si un de ses facteurs l'est", text: '$x-1=0$ ou $x-4=0$' }],
          result: { tag: 'zéros de f', text: '$x=1$ et $x=4$' },
        },
        {
          kind: 'astuce',
          label: 'Astuce — le lien avec le sommet',
          text:
            'La parabole est symétrique. Deux zéros $x_1$ et $x_2$ sont donc toujours à la même ' +
            'distance de l\'axe. Leur milieu donne directement l\'abscisse du sommet ! Pour ' +
            '$f(x) = (x-1)(x-4)$ : axe de symétrie $= \\dfrac{1+4}{2} = 2{,}5$ — sans aucun ' +
            'autre calcul.',
        },
        {
          kind: 'historique',
          titre: "Trouver les racines... 3500 ans avant la factorisation",
          text:
            "Factoriser pour trouver les zéros d'une fonction peut sembler une technique " +
            "moderne — elle est pourtant bien plus ancienne que l'algèbre elle-même ! Des " +
            'tablettes d\'argile babyloniennes, datées d\'environ 1800 avant J.-C., montrent ' +
            'déjà des scribes résoudre des problèmes concrets (partager un champ, calculer une ' +
            'aire) qui reviennent, en langage actuel, à des équations du second degré. Ils ne ' +
            'connaissaient ni le signe =, ni les lettres x, a, b, c : chaque problème était ' +
            'résolu par une méthode géométrique, étape par étape, en manipulant des longueurs ' +
            'et des aires réelles plutôt que des symboles abstraits. La photo ci-contre montre ' +
            'une tablette babylonienne du même corpus mathématique — gravée en écriture ' +
            'cunéiforme, avec des nombres écrits en base 60 (celle qui nous a donné les 60 ' +
            'minutes d\'une heure).',
          image: {
            src: '/images/historique/tablette-babylonienne.jpg',
            alt: 'Tablette d\'argile babylonienne couverte d\'écriture cunéiforme',
            caption:
              'Tablette babylonienne YBC 7289 (c. 1800–1600 av. J.-C.), un exemple de corpus ' +
              'mathématique cunéiforme de la même époque. Photo : Bill Casselman, CC BY-SA ' +
              '3.0, via Wikimedia Commons.',
          },
        },
        { kind: 'subheading', text: 'Tableau de signes et tableau de variation' },
        {
          kind: 'para',
          text:
            'Tu connais les zéros ? Le tableau de signes en découle directement, grâce au signe ' +
            'de a. Entre les zéros, la parabole a le signe opposé à a. À l\'extérieur, elle a le ' +
            'signe de a.',
        },
        {
          kind: 'methode',
          items: [
            "Place les zéros (s'il y en a) sur une ligne graduée, dans l'ordre croissant.",
            'Trouve le signe **à l’extérieur** des zéros : c’est celui de a.',
            'Trouve le signe **entre** les zéros (s’il y en a deux) : c’est l’opposé de a.',
          ],
        },
        {
          kind: 'signTable',
          caption: 'Signe de f(x) = (x − 1)(x − 4), a > 0',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '1', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '4', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'f(x)',
              cells: [
                { text: '', tone: 'plain' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '−', tone: 'neg' },
                { text: '0', tone: 'zero' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'para',
          text:
            'Avec un seul zéro (double) ou sans zéro, il n\'y a pas d\'« entre les zéros » : f(x) a ' +
            'le signe de a partout, sauf au zéro double où il vaut 0.',
        },
        {
          kind: 'signTable',
          caption: 'Signe de f(x) = (x − 2)², a > 0, un zéro double',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '2', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'f(x)',
              cells: [
                { text: '', tone: 'plain' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'signTable',
          caption: 'Signe de f(x) = −x² − 1, a < 0, aucun zéro',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'f(x)',
              cells: [
                { text: '', tone: 'plain' },
                { text: '−', tone: 'neg' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'signTable',
          caption: 'Variation de f(x) = (x − 1)(x − 4) : décroissante (↘) puis croissante (↗), minimum en x = 2,5',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '2,5', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'f',
              cells: [
                { text: '', tone: 'plain' },
                { text: '↘', tone: 'plain' },
                { text: 'min', tone: 'zero' },
                { text: '↗', tone: 'plain' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'entrainement',
          title: "Analyse d'une fonction du second degré",
          generatorId: 'gen7',
          description: [
            'Les 6 notions de cette partie, réunies en un seul exercice : coefficients, allure, ' +
              'axe et sommet, domaine/image, racines, tableau de signes et de variation. Ton ' +
              'professeur peut les activer une par une.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 7. Analyse d’une fonction du second degré »',
        },
      ],
    },
    {
      id: 'transformer',
      number: 2,
      title: 'Transformer une parabole',
      kicker: "de y = x² à n'importe quelle parabole, sans tableau de valeurs",
      titreCourt: 'Transformer une parabole',
      partie: 'La parabole : la lire, la transformer',
      essentiel: [
        'Toute parabole vient de $y = x^2$ : $y = (x-p)^2$ la translate de p à l\'horizontale (attention au signe : $(x-3)^2$ va vers la **droite**), $y = x^2 + q$ de q à la verticale ; a l\'étire si $|a| > 1$, la comprime si $0 < |a| < 1$, la retourne si $a < 0$.',
        'La **forme canonique** $f(x) = a(x-x_S)^2+y_S$ affiche le sommet $S(x_S\\,;\\,y_S)$ ; on l\'obtient en complétant le carré, après avoir mis a en évidence si $a \\neq 1$.',
        'Développée : on lit le point $(0\\,;\\,c)$ ; canonique : le sommet ; factorisée $a(x-x_1)(x-x_2)$ : les zéros.',
      ],
      cartes: [
        { question: 'Dans quel sens $y = (x-3)^2$ déplace-t-il la courbe de $y = x^2$ ?', reponse: 'De 3 unités vers la droite : le signe dans la parenthèse est l\'opposé du sens du déplacement.' },
        { question: 'Quel est le sommet de $f(x) = 3(x+2)^2 - 1$ ?', reponse: '$S(-2\\,;\\,-1)$, car $x + 2 = x - (-2)$.' },
        { question: 'Écris $f(x) = x^2 - 6x + 5$ sous forme canonique.', reponse: '$f(x) = (x-3)^2 - 4$, de sommet $S(3\\,;\\,-4)$.' },
        { question: 'Une parabole a pour zéros −1 et 3 : quelle forme poser pour retrouver son équation ?', reponse: 'La forme factorisée $f(x) = a(x+1)(x-3)$ ; un point de la courbe donne a.' },
      ],
      blocks: [
        { kind: 'video', title: 'Transformer une parabole : translations, étirement, forme canonique', youtubeId: 'RyQDXGNNJO8' },
        {
          kind: 'para',
          text:
            'Toutes les paraboles viennent d\'une seule courbe de départ : $y = x^2$, sommet à ' +
            'l\'origine $(0\\,;\\,0)$. Elles sont juste déplacées, étirées ou retournées.',
        },
        { kind: 'subheading', text: 'Les translations' },
        {
          kind: 'list',
          items: [
            '**Translation horizontale (TH)** — $y = (x-p)^2$ déplace la courbe de p unités, à l\'horizontale.',
            '**Translation verticale (TV)** — $y = x^2 + q$ déplace la courbe de q unités, à la verticale.',
          ],
        },
        {
          kind: 'attention',
          label: 'Le piège du signe',
          text:
            '$y = (x-3)^2$ déplace la courbe de **3 unités vers la droite** — pas vers la ' +
            'gauche ! Le signe dans la parenthèse est l\'opposé du sens du déplacement. À ' +
            'l\'inverse, $y = (x+3)^2$ déplace vers la **gauche**.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => x * x, tone: 'faint', xMin: -2, xMax: 2.5 },
                { fn: (x) => (x - 3) * (x - 3), tone: 'accent', xMin: 0.5, xMax: 5 },
              ],
              xMin: -2,
              xMax: 5,
              xTicks: [],
              showYAxis: false,
              points: [{ x: 3, y: 0, label: '3', tone: 'accent', labelPos: 'below' }],
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'TH : y = (x−3)²',
            },
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => x * x, tone: 'faint', xMin: -2.6, xMax: 2.6 },
                { fn: (x) => x * x + 2, tone: 'accent', xMin: -2.2, xMax: 2.2 },
              ],
              xMin: -3,
              xMax: 3,
              xTicks: [],
              showYAxis: false,
              points: [{ x: 0, y: 2, label: '2', tone: 'accent', labelPos: 'right' }],
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'TV : y = x² + 2',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'translations combinées',
          formula: '$y = (x-3)^2+2$ (TH de 3, TV de 2)',
          steps: [
            { tag: 'sommet', text: '$S(3\\,;\\,2)$ : la TH déplace le sommet de 3 vers la droite, la TV de 2 vers le haut' },
            { tag: 'axe de symétrie', text: '$x = 3$' },
          ],
          result: { tag: 'image de x = 5', text: '$(5-3)^2+2 = 4+2 = 6$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x, tone: 'faint', xMin: -2.6, xMax: 2.6 },
              { fn: (x) => (x - 3) * (x - 3) + 2, tone: 'accent', xMin: 0.8, xMax: 5.2 },
            ],
            xMin: -3,
            xMax: 7,
            xTicks: [-3, -2, -1, 1, 2, 4, 5, 6],
            yTicks: [-1, 1, 3, 4, 5, 6],
            points: [
              { x: 0, y: 0, label: 'S(0 ; 0)', tone: 'good' },
              { x: 3, y: 2, label: 'S(3 ; 2)', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'le sommet passe de (0 ; 0) à (3 ; 2) : la courbe est translatée, sans changer de ' +
              'forme (a=1 ici)',
          },
        },
        { kind: 'subheading', text: 'Étirement, compression et symétrie' },
        {
          kind: 'intuition',
          label: "Une image pour retenir l'effet de a",
          text:
            'Imagine une bande élastique tenue par le sommet : plus tu tires fort dessus (|a| ' +
            'grand), plus elle se resserre et devient étroite autour de son axe. Plus tu la ' +
            'relâches (|a| proche de 0), plus elle s\'étale et devient large et aplatie.',
        },
        {
          kind: 'para',
          text: 'Le coefficient devant le carré change la **forme** de la courbe — pas seulement sa position !',
        },
        {
          kind: 'list',
          items: [
            '**Étirement vertical (EV)** — si $|a| > 1$, la courbe se resserre.',
            '**Compression verticale (CV)** — si $0 < |a| < 1$, la courbe s\'aplatit.',
            '**Symétrie d\'axe Ox (SOX)** — si a devient négatif, la courbe se retourne : ' +
              'symétrie par rapport à l\'axe des x.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x, tone: 'faint', xMin: -2.6, xMax: 2.6 },
              { fn: (x) => 2 * x * x, tone: 'accent', xMin: -1.8, xMax: 1.8 },
              { fn: (x) => 0.5 * x * x, tone: 'good', xMin: -3, xMax: 3 },
              { fn: (x) => -x * x, tone: 'bad', xMin: -2.2, xMax: 2.2 },
            ],
            xMin: -3.2,
            xMax: 3.2,
            xTicks: [-2, -1, 1, 2],
            yTicks: [-4, -2, 2, 4, 6],
            fixedYRange: { min: -5, max: 6.5 },
            points: [
              { x: 1.6, y: 5.12, label: 'y = 2x²', tone: 'accent', labelPos: 'left' },
              { x: 3, y: 4.5, label: 'y = 0,5x²', tone: 'good', labelPos: 'below' },
              { x: 2, y: -4, label: 'y = −x²', tone: 'bad', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Même sommet (0 ; 0), même axe : y = 2x² est étirée (EV), y = 0,5x² comprimée (CV), ' +
              'y = −x² retournée (SOX) — y = x², en gris, sert de référence.',
          },
        },
        {
          kind: 'astuce',
          label: 'Astuce — lire a sur le graphique',
          text:
            'Pars du sommet et avance de 1 vers la droite : la courbe monte de a (elle descend si ' +
            '$a < 0$). Pourquoi ? Sur $y = ax^2$, le point d\'abscisse 1 est $(1\\,;\\,a)$, à 1 vers ' +
            'la droite et a vers le haut du sommet $(0\\,;\\,0)$ ; les translations déplacent ce ' +
            'point avec le sommet. Le point « croix » est donc $(x_S+1\\,;\\,y_S+a)$. Un EV et une ' +
            'CV peuvent aussi se combiner : seul leur rapport compte, $|a| = \\dfrac{\\text{EV}}{\\text{CV}}$ ' +
            '(EV = 2 et CV = 4 donnent $|a| = \\dfrac{1}{2}$).',
        },
        {
          kind: 'illustration',
          illustration: {
            // f(x) = 2(x − 1)² − 3 : S(1 ; −3), point croix (2 ; −1) = (x_S + 1 ; y_S + a).
            // Domaine isotrope (8 × 7,5, rapport 320/300 du cadre) : un carreau = 1 dans les deux
            // directions, sinon a paraîtrait plus grand ou plus petit qu'il n'est.
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 5,
            yMin: -4,
            yMax: 3.5,
            grid: true,
            curves: [{ fn: (x) => 2 * (x - 1) * (x - 1) - 3, tone: 'accent', xMin: -0.78, xMax: 2.78 }],
            vectors: [
              { from: { x: 1, y: -3 }, to: { x: 2, y: -3 }, tone: 'attn' },
              { from: { x: 2, y: -3 }, to: { x: 2, y: -1 }, tone: 'good' },
            ],
            points: [
              { x: 1, y: -3, label: 'S(1 ; −3)', tone: 'accent', labelPos: 'left' },
              { x: 2, y: -1, label: '(2 ; −1)', tone: 'good', labelPos: 'right' },
              { x: 1.5, y: -3, label: '1', tone: 'attn', labelPos: 'below', node: false },
              { x: 2, y: -2, label: '2', tone: 'good', labelPos: 'right', node: false },
            ],
            caption:
              'Du sommet S(1 ; −3), 1 vers la droite puis 2 vers le haut : la courbe passe par (2 ; −1), ' +
              'donc a = 2 et f(x) = 2(x − 1)² − 3. Pour y = x², on ne monterait que de 1.',
          },
        },
        {
          kind: 'atelier',
          tag: 'transformations-widget',
          label: 'Manipule toi-même — fais varier TH, EV/CV et TV',
          caption:
            'Règle TH, EV/CV (a négatif retourne la courbe) et TV, et compare la forme ' +
            'canonique, dont le sommet est le point (TH ; TV), avec la forme développée ' +
            'ax² + bx + c. Le mode Pas à ' +
            'pas reconstruit la parabole depuis y = x², une transformation à la fois, en ' +
            'suivant le sommet.',
        },
        {
          kind: 'entrainement',
          title: 'Transformations graphiques',
          generatorId: 'gen8',
          description: [
            'Lis les translations p et q, l’étirement/la compression (EV/CV) et la symétrie (SOX) ' +
              'directement sur un graphique interactif.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 8. Transformations graphiques »',
        },
        { kind: 'subheading', text: 'La forme canonique' },
        {
          kind: 'para',
          text:
            'Réunis les deux translations et l\'étirement dans une seule écriture. Tu obtiens la ' +
            '**forme canonique** — la vraie carte d\'identité d\'une parabole : elle affiche ' +
            'directement son sommet !',
        },
        {
          kind: 'rappel',
          label: 'Forme canonique',
          items: ['$f(x) = a(x-x_S)^2+y_S$, de sommet $S(x_S\\,;\\,y_S)$.'],
        },
        {
          kind: 'application',
          titre: 'Reconnaître une parabole dans un pont suspendu',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => 0.008 * x * x, tone: 'good', xMin: -40, xMax: 40 },
                { fn: (x) => 0.02 * x * x, tone: 'bad', xMin: -40, xMax: 40 },
              ],
              xMin: -45,
              xMax: 64,
              xTicks: [-40, 40],
              yTicks: [10, 20, 30],
              points: [
                { x: 0, y: 0, label: 'S', tone: 'accent', labelPos: 'below' },
                { x: 40, y: 12.8, label: 'câble tendu', tone: 'good', labelPos: 'right' },
                { x: 40, y: 32, label: 'câble relâché', tone: 'bad', labelPos: 'right' },
              ],
              xAxisLabel: 'distance au centre (m)',
              yAxisLabel: 'hauteur (m)',
              caption:
                'Deux câbles entre les mêmes pylônes (à ±40 m du centre), même sommet S au ' +
                'point le plus bas : plus a est grand (rouge), plus le câble est relâché et ' +
                'remonte haut vers les pylônes ; plus a est petit (vert), plus il reste tendu, ' +
                'proche de l\'horizontale.',
            },
          ],
          text:
            'Les câbles (ou chaînes) principaux d\'un pont suspendu, tirés par le poids ' +
            'uniformément réparti du tablier qu\'ils portent, prennent naturellement la forme ' +
            'd\'une parabole. Les ingénieurs utilisent directement la forme canonique pour la ' +
            'modéliser : le sommet $S(x_S\\,;\\,y_S)$ correspond au point le plus bas du câble ' +
            '(souvent au centre du pont), et le coefficient a détermine à quel point le câble ' +
            'est « tendu » ou « relâché » entre les deux pylônes. Cette équation leur permet de ' +
            'calculer la longueur exacte de câble nécessaire à chaque point, et la tension ' +
            'qu\'il doit supporter — sans elle, impossible de dimensionner correctement la ' +
            'structure.',
          domaines: ['Ingénierie', 'Architecture'],
          image: {
            src: '/images/application/pont-suspendu.jpg',
            alt: 'Chaînes du pont suspendu de Clifton dessinant une courbe parabolique',
            caption:
              'Les chaînes du pont suspendu de Clifton (Bristol, Royaume-Uni) dessinent une ' +
              'courbe proche d\'une parabole. Photo : Tom Jolliffe, CC BY-SA 2.0, via ' +
              'Geograph/Wikimedia Commons.',
          },
        },
        { kind: 'para', text: 'Pour passer de la forme développée à la forme canonique, on **complète le carré** :' },
        {
          kind: 'exemple',
          badge: 'a = 1',
          steps: [
            { tag: '1 — forme développée', text: '$f(x) = x^2-6x+5$' },
            { tag: '2 — on ajoute puis on retranche la moitié du coefficient de x, au carré', text: '$f(x)=x^2-6x+9-9+5$' },
            { tag: '3 — on reconnaît un carré parfait', text: '$f(x)=(x-3)^2-4$' },
          ],
          result: { tag: 'sommet', text: '$S(3\\,;\\,-4)$' },
        },
        {
          kind: 'atelier',
          tag: 'completer-le-carre-widget',
          label: 'Manipule toi-même — pourquoi « compléter le carré » ?',
          caption:
            'La méthode porte bien son nom : $x^2 + bx$ se dessine comme un carré et deux rectangles, et ' +
            'il manque un petit carré $\\left(\\dfrac{b}{2}\\right)^2$ pour obtenir un grand carré de côté $x + \\dfrac{b}{2}$. C\'est ' +
            'exactement le « $+\\,9 - 9$ » de l\'exemple ci-dessus ($b = 6$, $\\left(\\dfrac{6}{2}\\right)^2 = 9$).',
        },
        {
          kind: 'para',
          text:
            'a ≠ 1 ? Alors il faut d\'abord le **mettre en évidence**, sur les deux premiers ' +
            'termes. Ensuite seulement, tu complètes le carré :',
        },
        {
          kind: 'exemple',
          badge: 'a ≠ 1',
          steps: [
            { tag: '1 — a mis en évidence sur x² et x', text: '$f(x)=2x^2-8x+3=2(x^2-4x)+3$' },
            { tag: '2 — carré complété dans la parenthèse', text: '$f(x)=2(x^2-4x+4-4)+3=2[(x-2)^2-4]+3$' },
            { tag: '3 — a redistribué sur les deux termes', text: '$f(x)=2(x-2)^2-8+3=2(x-2)^2-5$' },
          ],
          result: { tag: 'sommet', text: '$S(2\\,;\\,-5)$' },
        },
        {
          kind: 'piege',
          text:
            'À l\'étape 3 : le $-4$ sorti de la parenthèse doit être **multiplié par a** ! Avant ' +
            'd\'être ajouté au c d\'origine. L\'erreur la plus fréquente : le ressortir tel quel, ' +
            'sans multiplier par a.',
        },
        {
          kind: 'attention',
          label: 'Attention — lire le sommet sur la forme canonique',
          text:
            'Dans $f(x) = 3(x+2)^2 - 1$, le sommet est $S(-2\\,;\\,-1)$, et non $(2\\,;\\,-1)$ : écris ' +
            '$x + 2 = x - (-2)$. C\'est le même piège du signe que pour la translation horizontale.',
        },
        {
          kind: 'para',
          text:
            'La méthode marche-t-elle pour **toutes** les fonctions du second degré ? Oui : refais ' +
            'les mêmes étapes avec des lettres à la place des nombres.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la forme canonique générale',
          blocks: [
            {
              kind: 'para',
              text:
                'On veut démontrer que toute fonction $f(x) = ax^2+bx+c$ (avec $a \\neq 0$) peut ' +
                's\'écrire $f(x) = a(x-x_S)^2+y_S$, et trouver $x_S$ et $y_S$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — a mis en évidence sur les deux premiers termes** (possible car ' +
                '$a \\neq 0$) : $f(x) = a\\left(x^2+\\dfrac{b}{a}x\\right)+c$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — carré complété dans la parenthèse.** La moitié du coefficient de x vaut ' +
                '$\\dfrac{b}{2a}$. Comme $\\left(x+\\dfrac{b}{2a}\\right)^2 = x^2+\\dfrac{b}{a}x+\\dfrac{b^2}{4a^2}$, ' +
                'on a $x^2+\\dfrac{b}{a}x = \\left(x+\\dfrac{b}{2a}\\right)^2-\\dfrac{b^2}{4a^2}$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — a redistribué** sur les deux termes : ' +
                '$f(x) = a\\left(x+\\dfrac{b}{2a}\\right)^2 - a \\cdot \\dfrac{b^2}{4a^2} + c ' +
                '= a\\left(x+\\dfrac{b}{2a}\\right)^2 + c - \\dfrac{b^2}{4a}$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** On écrit $x + \\dfrac{b}{2a} = x - \\left(-\\dfrac{b}{2a}\\right)$ : ' +
                'c\'est la forme canonique, avec $x_S = -\\dfrac{b}{2a}$ (la formule de la section 1, ' +
                'retrouvée autrement) et $y_S = c - \\dfrac{b^2}{4a}$.',
            },
          ],
        },
        {
          kind: 'para',
          text:
            'La forme canonique explique aussi la règle de l\'image vue en section 1 : tout ' +
            'repose sur un carré, qui n\'est jamais négatif.',
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — l'image, grâce à un carré positif",
          blocks: [
            {
              kind: 'para',
              text:
                'On veut démontrer que si $f(x) = a(x-x_S)^2+y_S$ avec $a > 0$, alors ' +
                '$\\operatorname{im} f = [y_S\\,;\\,{+\\infty}[$ (et ' +
                '$\\operatorname{im} f = ]{-\\infty}\\,;\\,y_S]$ si $a < 0$).',
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — un carré n\'est jamais négatif.** Pour tout x, $(x-x_S)^2 \\geq 0$, et ' +
                'il vaut 0 seulement pour $x = x_S$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — on multiplie par a.** Comme $a > 0$, le sens de l\'inégalité ne change pas : ' +
                '$a(x-x_S)^2 \\geq 0$, puis on ajoute $y_S$ : $f(x) \\geq y_S$ pour tout x. Et ' +
                '$f(x_S) = a \\cdot 0 + y_S = y_S$ : la valeur $y_S$ est atteinte, c\'est le minimum.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — toute valeur au-dessus est atteinte.** Prends un nombre $k \\geq y_S$. ' +
                'Pour $x = x_S + \\sqrt{\\dfrac{k-y_S}{a}}$, on a $(x-x_S)^2 = \\dfrac{k-y_S}{a}$, donc ' +
                '$f(x) = a \\cdot \\dfrac{k-y_S}{a} + y_S = k$. Donc $\\operatorname{im} f = [y_S\\,;\\,{+\\infty}[$.',
            },
            {
              kind: 'para',
              text:
                '**Autre cas.** Si $a < 0$, multiplier par a renverse l\'inégalité : $a(x-x_S)^2 \\leq 0$, donc ' +
                '$f(x) \\leq y_S$ : $y_S$ est le maximum et, de la même façon, ' +
                '$\\operatorname{im} f = ]{-\\infty}\\,;\\,y_S]$.',
            },
          ],
        },
        {
          kind: 'historique',
          titre: "Le mathématicien qui a donné son nom à l'algèbre",
          text:
            'La technique que tu viens d\'utiliser — compléter le carré — porte la marque ' +
            "d'un seul homme : **Muhammad ibn Musa al-Khwarizmi**, qui travaille à Bagdad vers " +
            '820. Son livre, intitulé Al-Jabr (« la réunion », en parlant des termes d\'une ' +
            'équation), est le premier à présenter cette méthode de façon systématique, ' +
            "expliquée en mots plutôt qu'en symboles. Le mot « al-jabr » a donné le mot " +
            'français **algèbre** ; son propre nom, latinisé en « algorismi », a donné le mot ' +
            '**algorithme**. Ironie de l\'histoire : la version que tu utilises — compléter le ' +
            'carré pour révéler directement le sommet — n\'est pas différente, dans son ' +
            'principe géométrique, de celle qu\'il décrivait déjà il y a plus de 1200 ans.',
          image: {
            src: '/images/historique/al-khwarizmi.jpg',
            alt: "Page d'un manuscrit de l'Al-Jabr d'al-Khwarizmi",
            caption:
              "Page d'un manuscrit de l'Al-Jabr d'al-Khwarizmi (copie de 1342), montrant une " +
              'résolution géométrique d\'équations du second degré. Bibliothèque bodléienne, ' +
              'domaine public.',
          },
        },
        { kind: 'subheading', text: 'Trois écritures, trois informations' },
        {
          kind: 'featureTable',
          caption: 'Une même parabole, trois écritures',
          headers: ['Écriture', 'Forme', 'Ce qu\'on y lit'],
          rows: [
            ['développée', '${ax^2+bx+c}$', 'le point $(0\\,;\\,c)$'],
            ['canonique', '${a(x-x_S)^2+y_S}$', 'le sommet $S(x_S\\,;\\,y_S)$, l\'axe $x = x_S$'],
            ['factorisée', '${a(x-x_1)(x-x_2)}$', 'les zéros $x_1$ et $x_2$ (s\'il y en a)'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'de la forme canonique aux deux autres',
          formula: 'Écris $f(x) = 2(x-3)^2 - 8$ sous forme développée, puis sous forme factorisée.',
          steps: [
            { tag: 'développer', text: '$2(x^2 - 6x + 9) - 8 = 2x^2 - 12x + 10$' },
            { tag: 'zéros, depuis la forme canonique', text: '$2(x-3)^2 = 8 \\iff (x-3)^2 = 4 \\iff x - 3 = \\pm 2 \\iff x = 1$ ou $x = 5$' },
          ],
          result: { tag: 'résultat', text: '$f(x) = 2x^2 - 12x + 10 = 2(x-1)(x-5)$' },
        },
        {
          kind: 'atelier',
          tag: 'trois-formes-widget',
          label: 'Manipule toi-même — une parabole, trois écritures',
          caption:
            'Une même parabole, trois écritures. Règle-la par son sommet ou par ses zéros, ' +
            'puis clique sur une forme pour voir ce qu\'elle permet de lire directement : c ' +
            'pour la développée, le sommet pour la canonique, les zéros pour la factorisée.',
        },
        { kind: 'subheading', text: 'Retrouver l\'équation d\'une parabole' },
        {
          kind: 'exemple',
          badge: 'sommet et un point',
          formula: 'Une parabole a pour sommet $S(2\\,;\\,-1)$ et passe par le point $(0\\,;\\,3)$. Détermine son équation.',
          steps: [
            { tag: 'forme canonique avec le sommet', text: '$f(x) = a(x-2)^2 - 1$' },
            { tag: 'le point donne a', text: '$f(0) = 4a - 1 = 3 \\iff a = 1$' },
          ],
          result: { tag: 'résultat', text: '$f(x) = (x-2)^2 - 1 = x^2 - 4x + 3$' },
          illustration: {
            // f(x) = (x − 2)² − 1 : S(2 ; −1), P(0 ; 3), zéros 1 et 3.
            kind: 'curvePlot',
            curves: [{ fn: (x) => (x - 2) * (x - 2) - 1, tone: 'accent', xMin: -0.4, xMax: 4.4 }],
            xMin: -1,
            xMax: 5,
            xTicks: [-1, 1, 2, 3, 4, 5],
            yTicks: [-1, 1, 2, 3, 4],
            fixedYRange: { min: -2, max: 5 },
            points: [
              { x: 2, y: -1, label: 'S(2 ; −1)', tone: 'accent', labelPos: 'below' },
              { x: 0, y: 3, label: 'P(0 ; 3)', tone: 'good', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'le sommet donne la forme a(x − 2)² − 1, le point P donne a = 1',
          },
        },
        {
          kind: 'exemple',
          badge: 'deux zéros et un point',
          formula: 'Une parabole coupe l\'axe des x en −1 et en 3, et passe par le point $(1\\,;\\,-8)$. Détermine son équation.',
          steps: [
            { tag: 'forme factorisée avec les zéros', text: '$f(x) = a(x+1)(x-3)$' },
            { tag: 'le point donne a', text: '$f(1) = a \\cdot 2 \\cdot (-2) = -4a = -8 \\iff a = 2$' },
          ],
          result: { tag: 'résultat', text: '$f(x) = 2(x+1)(x-3) = 2x^2 - 4x - 6$' },
          illustration: {
            // f(x) = 2(x + 1)(x − 3) : zéros −1 et 3, P(1 ; −8) (c'est aussi le sommet : 1 est le
            // milieu de −1 et 3).
            kind: 'curvePlot',
            curves: [{ fn: (x) => 2 * (x + 1) * (x - 3), tone: 'accent', xMin: -1.7, xMax: 3.7 }],
            xMin: -2,
            xMax: 4,
            xTicks: [-2, 1, 2, 4],
            yTicks: [-8, -6, -4, -2, 2, 4, 6],
            fixedYRange: { min: -10, max: 8 },
            roots: [
              { x: -1, label: '−1' },
              { x: 3, label: '3' },
            ],
            points: [{ x: 1, y: -8, label: 'P(1 ; −8)', tone: 'good', labelPos: 'right' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'les zéros −1 et 3 donnent la forme a(x + 1)(x − 3), le point P donne a = 2',
          },
        },
        {
          kind: 'atelier',
          tag: 'parabole-par-points-widget',
          label: 'Manipule toi-même — retrouver l\'équation',
          caption:
            'Un sommet (ou deux zéros) et un point suffisent pour retrouver l\'équation ' +
            'd\'une parabole : suis le calcul de a pas à pas. En mode Défi, lis S et P sur ' +
            'le quadrillage et trouve a du premier coup.',
        },
        {
          kind: 'entrainement',
          title: 'Retrouver l’équation d’une parabole',
          generatorId: 'gen125',
          description: [
            'Un sommet et un point, deux zéros et un point, trois points ou une parabole tracée : ' +
              'choisis la forme de départ (canonique, factorisée ou développée), calcule a (ou a et b ' +
              'par un système), puis écris l’équation sous forme développée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 125. Retrouver l’équation d’une parabole »',
        },
        {
          kind: 'entrainement',
          title: 'Forme canonique et transformations',
          generatorId: 'gen9',
          description: [
            'Séquence complète et guidée : forme canonique, translation horizontale, ' +
              'étirement/compression et symétrie, puis translation verticale — avec le tracé ' +
              'cumulatif des courbes déjà confirmées.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 9. Forme canonique et transformations »',
        },
        {
          kind: 'entrainement',
          title: "Trois écritures d'une parabole",
          generatorId: 'gen126',
          description: [
            'Passe d\'une écriture à l\'autre : développer une forme canonique ou factorisée, ' +
              'chercher les zéros sur la forme canonique (ou constater qu\'il n\'y en a pas), ' +
              'mettre a en évidence et compléter le carré, lire ou calculer le sommet. Toute ' +
              'écriture juste est acceptée, mais la forme demandée est contrôlée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 126. Trois écritures d\'une parabole »',
        },
        {
          kind: 'entrainement',
          title: 'Associer paraboles et équations',
          generatorId: 'gen128',
          description: [
            'Quatre équations, quatre paraboles dans le désordre : retrouve laquelle va avec ' +
              'laquelle en lisant le sommet, le sens, les zéros ou l\'ordonnée à l\'origine. Les ' +
              'pièges : le signe dans la parenthèse, a et −a, a et 1⁄a, les signes des zéros.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 128. Associer paraboles et équations »',
        },
      ],
    },
    {
      id: 'utiliser',
      number: 3,
      title: 'Utiliser la fonction du second degré',
      kicker: 'modéliser une situation concrète, trouver un optimum',
      titreCourt: 'Modéliser et optimiser',
      partie: 'S\'en servir, puis réviser',
      essentiel: [
        'Modéliser, toujours en 3 étapes : choisir la variable x, exprimer la grandeur à étudier avec cette seule variable, définir le **domaine de validité**.',
        'L\'optimum est au sommet si son abscisse appartient au domaine de validité ; sinon, il est à une des **bornes** du domaine.',
      ],
      cartes: [
        { question: 'Quelles sont les 3 étapes pour modéliser une situation ?', reponse: 'Choisir la variable x, exprimer la grandeur avec x, définir le domaine de validité.' },
        { question: 'Le sommet tombe hors du domaine de validité : où est l\'optimum réel ?', reponse: 'À une des bornes du domaine, jamais au sommet théorique.' },
        { question: 'Pour quelle largeur x l\'aire $A(x) = -2x^2 + 40x$ est-elle maximale, sur $]0\\,;\\,20[$ ?', reponse: '$x = -\\dfrac{40}{2 \\cdot (-2)} = 10$, dans le domaine : $A(10) = 200$ m².' },
      ],
      blocks: [
        { kind: 'video', title: 'Utiliser la fonction : modéliser, optimiser, résoudre en contexte', youtubeId: 'qXbyPY-Y1A0' },
        {
          kind: 'para',
          text:
            'La fonction du second degré, ce n\'est pas juste un objet abstrait ! Elle modélise ' +
            'des situations concrètes : une aire à optimiser, un revenu selon un prix, la ' +
            'trajectoire d\'un objet. Il faut savoir en tirer un maximum, un minimum.',
        },
        { kind: 'subheading', text: 'Modéliser une situation concrète' },
        {
          kind: 'para',
          text: 'Modéliser, c\'est traduire un énoncé en une fonction $f(x)=ax^2+bx+c$. Toujours en 3 étapes :',
        },
        {
          kind: 'methode',
          items: [
            'Choisis une variable x. C’est la quantité qui varie (une longueur, un prix, un temps…).',
            'Exprime la grandeur à étudier (une aire, un revenu, une hauteur…) avec cette seule variable.',
            'Définis le **domaine de validité** : les valeurs de x qui ont un sens dans la vraie ' +
              'situation. Jamais une longueur négative, par exemple !',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'fencedEnclosure',
            wallLabel: 'mur existant',
            sideLabel: 'x',
            baseLabel: 'L − 2x',
            caption:
              'un enclos rectangulaire, adossé à un mur : avec une longueur de clôture L fixée, ' +
              'l’aire A(x) = x(L − 2x) est une fonction du second degré de la largeur x',
          },
        },
        {
          kind: 'exemple',
          badge: "en contexte — aire d'un enclos",
          steps: [
            { tag: '1 — variable', text: 'x = la largeur des deux côtés perpendiculaires au mur (en mètres)' },
            { tag: '2 — fonction, avec L = 40 m de clôture disponible', text: '$A(x) = x(40-2x) = -2x^2+40x$' },
          ],
          result: {
            tag: '3 — domaine de validité',
            text: '$x>0$ (une largeur) et $40-2x>0$ (une longueur) → $x \\in\\ ]0\\,;\\,20[$',
          },
        },
        { kind: 'subheading', text: "Trouver l'optimum" },
        {
          kind: 'intuition',
          label: 'Pourquoi il faut vérifier le domaine',
          text:
            "Imagine un sentier de randonnée qui grimpe vers un sommet, mais qui s'arrête avant " +
            "de l'atteindre. Le point culminant du sentier n'est pas le sommet de la montagne : " +
            "c'est l'endroit où le sentier s'arrête, le plus haut point que tu puisses " +
            "réellement atteindre. C'est exactement pareil pour une fonction restreinte à un " +
            'domaine de validité : si le sommet théorique tombe hors de ce domaine, l\'optimum ' +
            "réel est à l'endroit où le domaine s'arrête — à une borne.",
        },
        {
          kind: 'para',
          text:
            'La fonction est posée ? L\'optimum mathématique, c\'est simplement son **sommet**. ' +
            'Mais attention : il faut toujours vérifier qu\'il tombe **dans** le domaine de ' +
            'validité !',
        },
        {
          kind: 'list',
          items: [
            "L'abscisse du sommet appartient au domaine de validité ? Alors l'optimum réel est au sommet.",
            'Sinon, la fonction est monotone sur tout le domaine. L\'optimum réel est à une des ' +
              '**bornes** du domaine — jamais au sommet théorique !',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cas 1 — le sommet tombe dans le domaine',
          formula: '$A(x) = -2x^2+40x$ (l’enclos ci-dessus), domaine $]0\\,;\\,20[$',
          steps: [{ tag: 'sommet', text: '$x=10$, qui appartient bien à $]0\\,;\\,20[$' }],
          result: { tag: 'aire maximale', text: '$A(10) = -200+400 = 200$ m²' },
        },
        {
          kind: 'exemple',
          badge: 'cas 2 — le sommet tombe hors du domaine',
          formula:
            'Même enclos, avec une contrainte en plus : un massif de fleurs impose $x \\ge 12$, donc ' +
            '$x \\in [12\\,;\\,20[$. Quelle est l\'aire maximale ?',
          steps: [
            { tag: 'le sommet x = 10 est hors du domaine', text: 'sur $[12\\,;\\,20[$, la fonction est entièrement décroissante : le sommet est déjà passé' },
            { tag: 'optimum à la borne gauche', text: '$A(12) = -288 + 480 = 192$' },
          ],
          result: { tag: 'aire maximale', text: '192 m², atteinte en $x = 12$ — moins que les 200 m² du sommet, jamais plus.' },
          illustration: {
            // A(x) = −2x² + 40x : sommet (10 ; 200) hors de [12 ; 20[, A(12) = 192, A(20) = 0 (exclu).
            kind: 'curvePlot',
            curves: [
              { fn: (x) => -2 * x * x + 40 * x, tone: 'faint', xMin: 0, xMax: 12 },
              { fn: (x) => -2 * x * x + 40 * x, tone: 'accent', xMin: 12, xMax: 20 },
            ],
            shadedRegions: [{ from: 12, to: 20, upper: (x) => -2 * x * x + 40 * x, tone: 'good' }],
            xMin: 0,
            xMax: 23,
            xTicks: [5, 10, 12, 15, 20],
            yTicks: [50, 100, 150, 200],
            fixedYRange: { min: -15, max: 250 },
            points: [
              { x: 10, y: 200, label: 'sommet (10 ; 200)', tone: 'bad', labelPos: 'above' },
              { x: 12, y: 192, label: '', tone: 'good' },
              { x: 20, y: 0, label: '', tone: 'accent', style: 'open' },
            ],
            textLabels: [{ x: 14, y: 222, text: 'optimum (12 ; 192)', tone: 'good', anchor: 'start' }],
            xAxisLabel: 'x (m)',
            yAxisLabel: 'aire (m²)',
            caption:
              'Domaine de validité [12 ; 20[ (zone verte) : la courbe y descend tout du long. Le ' +
              'sommet x = 10 est hors du domaine, l\'optimum réel est à la borne x = 12 : 192 m².',
          },
        },
        {
          kind: 'exemple',
          badge: 'trajectoire — hauteur maximale',
          formula:
            'Un ballon est lancé depuis 25 m de haut ; sa hauteur (en m) après t secondes vaut ' +
            '$h(t) = -5t^2 + 20t + 25$, pour $t \\in [0\\,;\\,5]$. Quelle hauteur maximale atteint-il, et quand ?',
          steps: [
            { tag: 'abscisse du sommet', text: '$t_S = -\\dfrac{20}{2\\cdot(-5)} = 2$, qui appartient au domaine' },
            { tag: 'ordonnée du sommet', text: '$h(2) = -20 + 40 + 25 = 45$' },
          ],
          result: { tag: 'résultat', text: '45 m, au bout de 2 s. Quand touche-t-il le sol ? Il faut résoudre $h(t) = 0$ : c\'est l\'objet de [[4e/equations-inequations-second-degre#resoudre]].' },
          illustration: {
            // h(t) = −5t² + 20t + 25 sur [0 ; 5] : départ (0 ; 25), sommet (2 ; 45), sol en t = 5.
            kind: 'curvePlot',
            curves: [{ fn: (t) => -5 * t * t + 20 * t + 25, tone: 'accent', xMin: 0, xMax: 5 }],
            xMin: 0,
            xMax: 5.5,
            xTicks: [1, 2, 3, 4, 5],
            yTicks: [10, 20, 25, 30, 40, 45],
            fixedYRange: { min: -4, max: 52 },
            points: [
              { x: 0, y: 25, label: 'départ (0 ; 25)', tone: 'good', labelPos: 'right' },
              { x: 2, y: 45, label: 'S(2 ; 45)', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 't (s)',
            yAxisLabel: 'h (m)',
            caption: 'la hauteur monte jusqu\'au sommet S(2 ; 45), puis redescend jusqu\'au sol en t = 5',
          },
        },
        {
          kind: 'atelier',
          tag: 'optimisation-enclos-widget',
          label: 'Manipule toi-même — chercher l\'optimum',
          caption:
            'Fais varier la largeur, le prix ou le temps et observe la grandeur à optimiser ' +
            'sur la scène et sur la courbe. Le maximum est au sommet… sauf si le sommet ' +
            'sort du domaine : restreins le domaine et vois l\'optimum glisser à la borne.',
        },
        {
          kind: 'application',
          titre: 'Fixer un prix de vente qui maximise un revenu',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (p) => -2 * p * p + 80 * p, tone: 'accent' }],
              xMin: 0,
              xMax: 40,
              xTicks: [10, 20, 30],
              yTicks: [200, 400, 600, 800],
              points: [
                { x: 20, y: 800, label: 'prix optimal', tone: 'good', labelPos: 'above' },
                { x: 10, y: 600, label: '', tone: 'bad' },
                { x: 30, y: 600, label: '', tone: 'bad' },
              ],
              xAxisLabel: 'prix (€)',
              yAxisLabel: 'revenu (€)',
              caption:
                'Exemple avec une demande $q(p)=80-2p$ : le revenu $R(p)=p(80-2p)=-2p^2+80p$ ' +
                'culmine à $p=20\\,€$ (revenu de 800 €). À 10 € comme à 30 € — deux prix très ' +
                'différents de part et d\'autre du sommet — le revenu retombe au même niveau' +
                '(600 €) : s\'éloigner du sommet dans un sens ou dans l\'autre coûte toujours.',
            },
          ],
          text:
            'Une entreprise qui baisse son prix de vente attire plus de clients, mais gagne ' +
            'moins par vente — et inversement si elle l\'augmente. Si le nombre d\'acheteurs ' +
            'varie de façon linéaire avec le prix, le revenu total (prix × quantité vendue) ' +
            'est une fonction du second degré du prix, exactement comme l\'aire de l\'enclos ' +
            'ci-dessus était une fonction de sa largeur. Trouver le prix qui maximise ce ' +
            'revenu revient donc à trouver le sommet de cette parabole — la même démarche que ' +
            'tu viens d\'utiliser, appliquée cette fois à une décision commerciale plutôt ' +
            'qu\'à un aménagement de terrain. Au-delà de ce sommet, chaque euro de prix ' +
            'supplémentaire fait perdre plus de clients qu\'il n\'en rapporte.',
          domaines: ['Économie', 'Gestion'],
        },
        {
          kind: 'entrainement',
          title: "Problèmes d'optimisation",
          generatorId: 'gen55',
          description: [
            'Modélise une grandeur du second degré à partir d’une histoire (aire, revenu, ' +
              'trajectoire, coût de production…). Trouve son domaine de validité. Puis décide : ' +
              'l’optimum réel est-il au sommet ou à une borne ?',
          ],
          chantier: '4e',
          whereLabel: '4e → « 55. Problèmes d’optimisation »',
        },
        {
          kind: 'para',
          text:
            'Une situation concrète peut aussi demander **quand** une grandeur atteint ou dépasse ' +
            'un seuil : on résout alors une équation ou une inéquation du second degré. C\'est ' +
            'l\'objet de [[4e/equations-inequations-second-degre#contexte]], une fois les méthodes ' +
            'de résolution vues.',
        },
      ],
    },
    {
      id: 'revision',
      number: 4,
      title: 'Révision — vrai ou faux',
      kicker: '350 affirmations, 10 thèmes, tout le chapitre en révision transversale',
      titreCourt: 'Révision : vrai ou faux',
      partie: 'S\'en servir, puis réviser',
      essentiel: [
        'Le quiz vrai/faux reprend tout le chapitre en 10 thèmes de 35 affirmations, dans l\'ordre des 3 parties : un seul essai par question, la justification est toujours donnée.',
      ],
      cartes: [
        { question: 'Une copie transforme $2[(x-2)^2 - 4] + 3$ en $2(x-2)^2 - 4 + 3$. Quelle est l\'erreur ?', reponse: 'Le $-4$ doit être multiplié par a : $2(x-2)^2 - 8 + 3 = 2(x-2)^2 - 5$.' },
        { question: 'Sommet $S(2\\,;\\,-5)$, $a > 0$ : une copie donne $\\operatorname{im} f = [2\\,;\\,{+\\infty}[$. Quelle est l\'erreur ?', reponse: 'Elle a pris l\'abscisse du sommet : l\'image est $[-5\\,;\\,{+\\infty}[$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Révision : la synthèse du chapitre en 2 minutes', youtubeId: 'vpgVztac-9g' },
        {
          kind: 'para',
          text:
            '350 affirmations. 10 thèmes de 35, dans l\'ordre des 3 parties de ce chapitre : ' +
            'coefficients et allure, lecture de a, b et c sur un graphique, tableau de valeurs et ' +
            'différences secondes, zéros par factorisation, domaine, image et tableaux (section 1) ; ' +
            'transformations, forme canonique et sommet, compléter le carré, trois écritures et ' +
            'retrouver l\'équation (section 2) ; optimisation (section 3). Les équations et ' +
            'inéquations en contexte sont révisées dans le quiz de [[4e/equations-inequations-second-degre#revision]]. Un seul essai par question. La ' +
            'justification est toujours donnée.',
        },
        {
          kind: 'astuce',
          text:
            'Aucune affirmation ne demande de formule générale pour les zéros : tu ne l\'as pas ' +
            'encore vue à ce stade ! Tous les zéros s\'obtiennent par factorisation, ou en ' +
            'réfléchissant à la position du sommet.',
        },
        {
          kind: 'entrainement',
          title: 'La fonction du second degré — quiz vrai/faux',
          generatorId: 'gen60',
          description: [
            'Choisis un thème et teste-toi : 350 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 60. Quiz vrai/faux — La fonction du second degré »',
        },
        {
          kind: 'entrainement',
          title: "Détective d'erreurs : fonction du second degré",
          generatorId: 'gen127',
          description: [
            'Un élève a cherché un sommet, une forme canonique, une image ou un maximum, et une ' +
              'ligne de sa copie est fausse : trouve-la, nomme l\'erreur (b recopié sans son signe, ' +
              '« − » de la formule oublié, nombre non multiplié par a, (x + 2)² lu S(2 ; …), image ' +
              'avec l\'abscisse du sommet, sommet hors du domaine…), puis donne le résultat correct.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 127. Détective d\'erreurs : fonction du second degré »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Coefficients et allure',
        formulas: [
          { text: '$a>0$ → minimum — $a<0$ → maximum' },
          { text: '$c = f(0)$ : ordonnée à l\'origine, point $(0\\,;\\,c)$' },
          { text: 'axe à gauche de Oy ⟺ a et b de même signe ; axe à droite ⟺ signes opposés ; axe = Oy ⟺ $b = 0$' },
          { text: '$|a|$ grand → parabole resserrée, $|a|$ proche de 0 → aplatie' },
        ],
      },
      {
        title: 'Tableau de valeurs',
        formulas: [
          { text: 'différences premières constantes → premier degré ; différences secondes constantes → second degré' },
          { text: 'différence seconde $= 2a$', condition: 'x de 1 en 1' },
          { text: '$c = f(0)$, puis $f(1) = a + b + c$ donne b' },
        ],
      },
      {
        title: 'Sommet et axe de symétrie',
        formulas: [
          { text: '$x_S = -\\dfrac{b}{2a}$' },
          { text: '$y_S = f(x_S)$' },
          { text: 'axe de symétrie : $x = x_S$' },
          { text: '$x_S = \\dfrac{x_1+x_2}{2}$', condition: 'si $f(x_1) = f(x_2)$, par exemple deux zéros' },
        ],
      },
      {
        title: 'Domaine et image',
        formulas: [
          { text: '$\\operatorname{dom} f = \\mathbb{R}$' },
          { text: '$\\operatorname{im} f = [y_S\\,;\\,{+\\infty}[$', condition: 'si $a>0$' },
          { text: '$\\operatorname{im} f = ]{-\\infty}\\,;\\,y_S]$', condition: 'si $a<0$' },
        ],
      },
      {
        title: 'Zéros et signe',
        formulas: [
          { text: '$f(x) = a(x-x_1)(x-x_2)$ : zéros $x_1$ et $x_2$', condition: 'un produit est nul si un facteur l\'est' },
          { text: 'entre les zéros : signe opposé à $a$' },
          { text: 'à l\'extérieur des zéros : signe de $a$' },
          { text: 'aucun zéro : signe de $a$ partout ; un zéro double : signe de $a$ des deux côtés' },
        ],
      },
      {
        title: 'Transformations',
        formulas: [
          { text: '$y=(x-p)^2+q$ — translation horizontale $p$, verticale $q$' },
          { text: '$(x-p)^2$ : vers la droite si $p>0$, vers la gauche si $p<0$ ; $(x+3)^2 = (x-(-3))^2$' },
          { text: '$|a|>1$ étire (EV), $0<|a|<1$ comprime (CV) ; $a<0$ retourne la courbe (SOX)' },
          { text: '$|a| = \\dfrac{\\text{EV}}{\\text{CV}}$', condition: 'EV et CV combinés' },
          { text: 'du sommet, 1 vers la droite : la courbe passe par $(x_S+1\\,;\\,y_S+a)$', condition: 'lire a sur un graphique' },
        ],
      },
      {
        title: 'Forme canonique',
        formulas: [
          { text: '$f(x)=a(x-x_S)^2+y_S$, sommet $S(x_S\\,;\\,y_S)$' },
          { text: '$x^2+bx = \\left(x+\\dfrac{b}{2}\\right)^2-\\left(\\dfrac{b}{2}\\right)^2$', condition: 'compléter le carré' },
          { text: '$ax^2+bx+c = a\\left(x^2+\\dfrac{b}{a}x\\right)+c$', condition: 'si $a \\neq 1$ : a mis en évidence d\'abord' },
          { text: '$ax^2+bx+c = a\\left(x+\\dfrac{b}{2a}\\right)^2+c-\\dfrac{b^2}{4a}$' },
        ],
      },
      {
        title: 'Trois écritures et équation',
        formulas: [
          { text: '$ax^2+bx+c$ (lit c) — $a(x-x_S)^2+y_S$ (lit S) — $a(x-x_1)(x-x_2)$ (lit les zéros)', condition: 'trois écritures' },
          { text: 'sommet connu : $f(x) = a(x-x_S)^2+y_S$, puis un point donne a' },
          { text: 'zéros connus : $f(x) = a(x-x_1)(x-x_2)$, puis un point donne a' },
        ],
      },
      {
        title: 'Optimiser en contexte',
        formulas: [
          { text: 'domaine de validité : chaque longueur, prix, durée… $> 0$ (ex. $x>0$ et $40-2x>0$)' },
          { text: 'optimum réel $=$ sommet', condition: 'si $x_S$ appartient au domaine de validité' },
          { text: 'sinon, optimum réel à une borne du domaine de validité : comparer les valeurs aux bornes' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Coefficient** $\\boldsymbol{a}$ — son signe donne le sens d\'ouverture (minimum ou maximum). ' +
        'Sa valeur absolue donne l\'allure (resserrée ou aplatie). $b$ et $c$ n\'y changent rien.',
      '**Lire et reconnaître** — sur un graphique : $a$ par l\'ouverture, $c = f(0)$, $b$ par la ' +
        'position de l\'axe et le signe de $a$. Dans un tableau de valeurs ($x$ de 1 en 1) : ' +
        'différences secondes constantes, égales à $2a$.',
      '**Sommet et axe** — $S(x_S\\,;\\,y_S)$ est le point extrémal, $x=x_S$ son axe de ' +
        'symétrie. $x_S = -\\dfrac{b}{2a}$, $y_S = f(x_S)$. Deux points de même hauteur suffisent aussi ' +
        'à le retrouver par leur milieu.',
      '**Domaine et image** — $\\operatorname{dom} f = \\mathbb{R}$, toujours. ' +
        '$\\operatorname{im} f = [y_S\\,;\\,{+\\infty}[$ si $a>0$, $]{-\\infty}\\,;\\,y_S]$ si $a<0$.',
      '**Zéros et signe** — 0, 1 ou 2 racines réelles. Entre les racines : signe opposé à $a$. À ' +
        'l\'extérieur : signe de $a$.',
      '**Transformations** — $y = a(x-p)^2+q$ : translation horizontale $p$ (vers la droite si $p > ' +
        '0$), verticale $q$ ; $|a| > 1$ étire, $0 < |a| < 1$ comprime, $a < 0$ retourne la courbe.',
      '**Forme canonique** — $f(x)=a(x-x_S)^2+y_S$. On l\'obtient en complétant le carré. Si $a \\neq ' +
        '1$, on met $a$ en évidence avant.',
      '**Trois écritures** — développée (lit $c$), canonique (lit le sommet), factorisée (lit les ' +
        'zéros). Pour retrouver une équation : sommet + un point, ou zéros + un point, donnent $a$.',
      '**En contexte** — modélise (variable → grandeur → domaine de validité). Puis vérifie si ' +
        'le sommet théorique tombe dans ce domaine, avant de conclure à un optimum réel.',
    ],
    checklist: {
      items: [
        "Ai-je développé l'expression, avant de dire que c'est bien une fonction du second degré ?",
        'Ai-je vérifié le signe de $a$, avant de parler de minimum ou de maximum ?',
        'Pour lire le signe de $b$ sur un graphique, ai-je tenu compte du signe de $a$ ?',
        'Dans $a(x+2)^2-1$, ai-je bien lu $x_S = -2$, et non $2$ ?',
        'En complétant le carré, ai-je bien redistribué $a$ sur le terme sorti de la parenthèse ?',
        'En contexte, ai-je vérifié que le sommet (ou la borne retenue) est dans le domaine de ' +
          'validité réel — pas seulement dans le domaine mathématique ?',
      ],
    },
    forward:
      'La forme canonique et les racines reviennent dans le chapitre sur les équations du ' +
      'second degré. Une formule générale y donne les zéros, même quand la factorisation ' +
      'directe n\'est pas évidente.',
  },
}
