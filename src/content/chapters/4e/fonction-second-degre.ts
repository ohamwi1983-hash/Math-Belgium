import type { ChapterContent } from '../../types'

export const fonctionSecondDegre: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 1,
  title: 'La fonction du second degré',
  slug: 'fonction-second-degre',
  lede:
    'Une fonction $f(x) = ax^2 + bx + c$ dessine toujours la même famille de courbes : une ' +
    "parabole. Ce chapitre parcourt les trois choses qu'on en fait — la **lire**, la " +
    "**transformer**, puis s'en **servir** — avec, à la fin de chaque partie, l'exercice " +
    "interactif pour s'entraîner tout de suite.",

  intro: {
    title: "Avant de commencer : qu'est-ce qu'une fonction du second degré ?",
    blocks: [
      {
        kind: 'para',
        text:
          "Avant d'attaquer le second degré, un rappel s'impose : la fonction définie par " +
          '$f(x) = mx + p$ est une fonction du **premier degré**, et son graphique est toujours ' +
          'une **droite**.',
      },
      {
        kind: 'rappel',
        label: 'Paramètres m et p',
        items: [
          "$m$ est le **taux d'accroissement** de f, la **pente** de la droite : " +
            '$m = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$.',
          "$p$ est l'**ordonnée à l'origine** : la valeur de f quand $x = 0$, donc $f(0) = p$.",
        ],
      },
      {
        kind: 'para',
        text:
          "Le **zéro** de f — là où la droite coupe l'axe des x — se retrouve en résolvant " +
          '$mx + p = 0$, soit $x = -p/m$.',
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
          'Le graphique de la fonction de référence $f(x) = x^2$ est une **parabole P** ' +
          'tournée vers le haut, dont le sommet est l’origine du repère.',
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
          points: [{ x: 0, y: 0, label: '(0 ; 0)', tone: 'good' }],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'f(x) = x² : sommet (0 ; 0), concavité tournée vers le haut',
        },
      },
      {
        kind: 'featureTable',
        caption: 'Caractéristiques de f(x) = x²',
        headers: ['Caractéristique', 'Valeur'],
        rows: [
          ['Domaine de f', 'ℝ'],
          ['Sommet de P', '(0 ; 0)'],
          ['Concavité de P', 'vers le haut'],
          ['Racine de f', 'x = 0'],
          ['Axe de symétrie de P', 'x = 0'],
        ],
      },
      {
        kind: 'para',
        text:
          'Une fonction du second degré (ou fonction quadratique) est une fonction qui peut ' +
          "s'écrire sous la **forme développée** :",
      },
      {
        kind: 'rappel',
        label: 'Forme générale',
        items: ['$f(x) = ax^2 + bx + c$, avec $a, b, c$ réels et $a \\neq 0$.'],
      },
      {
        kind: 'para',
        text:
          'Le coefficient $a$ ne peut jamais être nul : sans lui, il ne resterait que $bx + c$, ' +
          'une fonction du premier degré. Le graphique d’une fonction du second degré est ' +
          'toujours une **parabole** — jamais un segment, jamais une courbe irrégulière. Son ' +
          'domaine de définition est toujours l’ensemble des réels : $\\operatorname{dom} f = ' +
          '\\mathbb{R}$, sans aucune exception, quels que soient $a$, $b$ et $c$.',
      },
      {
        kind: 'exemple',
        badge: 'reconnaître a, b, c',
        formula: '$f(x) = -2x^2 + 5x - 3$',
        steps: [
          { tag: 'a — coefficient du terme en x²', text: '$a = -2$' },
          { tag: 'b — coefficient du terme en x', text: '$b = 5$' },
        ],
        result: { tag: 'c — terme constant', text: '$c = -3$' },
      },
      {
        kind: 'attention',
        label: 'Attention — développer avant de conclure',
        text:
          'Une expression peut **ressembler** à une fonction du second degré sans en être une, ' +
          'si ses termes en $x^2$ s’annulent une fois développés. Par exemple $f(x) = (x+2)^2 - ' +
          'x^2$ développe en $f(x) = 4x + 4$ : le $x^2$ a disparu, c’est une fonction du premier ' +
          'degré. Toujours développer avant de conclure.',
      },
    ],
  },

  sections: [
    {
      id: 'etudier',
      number: 1,
      title: 'Étudier une parabole',
      kicker: "lire les propriétés d'une parabole sur son équation",
      blocks: [
        { kind: 'subheading', text: "Le rôle du coefficient a — l'allure de la parabole" },
        {
          kind: 'para',
          text:
            'Le signe et la valeur de $a$ déterminent entièrement la forme générale de la ' +
            'parabole, avant même de connaître $b$ et $c$ :',
        },
        {
          kind: 'list',
          items: [
            '**Signe de a** — si $a > 0$, la parabole est ouverte vers le haut (elle possède un ' +
              '**minimum**) ; si $a < 0$, elle est ouverte vers le bas (elle possède un **maximum**).',
            '**Valeur absolue de a** — plus $|a|$ est grand, plus la parabole est **resserrée** ; ' +
              'plus $|a|$ est proche de 0, plus elle est **aplatie**.',
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
              'trois valeurs de a, trois allures : positive et grande (étroite), positive et ' +
              'petite (large), négative (renversée)',
          },
        },
        {
          kind: 'piege',
          text:
            '$b$ et $c$ n’ont **aucune influence** sur le fait que la parabole soit ouverte vers ' +
            'le haut ou vers le bas : seul le signe de $a$ compte. Un grand $c$ ne fait que ' +
            'décaler la courbe, jamais la retourner.',
        },
        { kind: 'subheading', text: 'Reconnaître une fonction à partir d’un tableau de valeurs' },
        {
          kind: 'para',
          text:
            'Lorsqu’on ne connaît une grandeur que par un tableau de valeurs (accroissements de x ' +
            'toujours identiques), on peut reconnaître le type de fonction sans en connaître ' +
            'l’équation, en observant les **accroissements** successifs de f(x) :',
        },
        {
          kind: 'list',
          items: [
            'si les **accroissements** de f(x) sont constants → f est du **premier degré** ;',
            'si les **accroissements des accroissements** de f(x) sont constants → f est du ' +
              '**second degré**.',
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
            { kind: 'para', text: 'Accroissements de f(x) : 1, 3, 5, 7 — pas constants.' },
            {
              kind: 'rappel',
              label: 'Accroissements des accroissements',
              items: ['2, 2, 2 — constants → f est du second degré.'],
            },
          ],
        },
        { kind: 'subheading', text: 'Sommet et axe de symétrie' },
        {
          kind: 'para',
          text:
            'Toute parabole est **symétrique** par rapport à une droite verticale qui passe par ' +
            'son point le plus bas (si $a > 0$) ou le plus haut (si $a < 0$) : le **sommet** ' +
            '$S(x_S\\,;\\,y_S)$. Cette droite est l’**axe de symétrie**, d’équation $x = x_S$.',
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
              'le sommet S(2 ; −1) est le minimum de la parabole ; l’axe x = 2 partage la courbe ' +
              'en deux moitiés identiques',
          },
        },
        {
          kind: 'astuce',
          label: 'Astuce — retrouver l’axe sans a, b, c',
          text:
            'La symétrie se retourne aussi contre le problème : dès qu’on connaît deux points de ' +
            'même hauteur $f(x_1) = f(x_2)$, l’axe de symétrie passe forcément par leur **milieu** ' +
            '$\\dfrac{x_1+x_2}{2}$. Par exemple, si $f(0) = 5$ et $f(6) = 5$, l’axe est $x = ' +
            '\\dfrac{0+6}{2} = 3$ — sans avoir besoin de connaître $a$, $b$ ni $c$.',
        },
        { kind: 'subheading', text: 'D’où vient la formule $x_S = -b/(2a)$ ?' },
        {
          kind: 'para',
          text:
            'Cette même astuce du milieu permet de retrouver l’abscisse du sommet $x_S$ ' +
            '**directement** à partir de $a$, $b$ et $c$, sans passer par la forme canonique. ' +
            'Partons d’une parabole générale $f(x) = ax^2+bx+c$, et comparons-la à ' +
            '$g(x) = ax^2+bx$ — la même parabole, mais avec $c$ remplacé par $0$. Pour tout $x$, ' +
            '$f(x) = g(x) + c$ : les deux courbes ont exactement la même forme, seulement ' +
            'décalées verticalement de $c$.',
        },
        {
          kind: 'para',
          text:
            'Un décalage vertical ne change jamais l’abscisse du sommet — seule son ordonnée ' +
            'bouge. Donc $x_S(f) = x_S(g)$ : trouver $x_S$ de **n’importe quelle** parabole ' +
            'revient à trouver $x_S$ de $g(x)=ax^2+bx$, où $c=0$.',
        },
        {
          kind: 'para',
          text:
            'Or $g(x)=ax^2+bx=0$ se résout par mise en évidence de $x$ (section précédente) : ' +
            '$x(ax+b)=0 \\iff x_1 = 0$ ou $x_2 = -\\dfrac{b}{a}$ — deux racines, donc deux points ' +
            'de même hauteur (0), exactement la situation de l’astuce ci-dessus. Leur milieu ' +
            'donne $x_S$ :',
        },
        { kind: 'para', text: '$x_S = \\dfrac{0 + (-b/a)}{2} = -\\dfrac{b}{2a}$' },
        {
          kind: 'para',
          text:
            'Cette valeur de $x_S$ vaut pour $f$ tout autant que pour $g$ (le décalage vertical ' +
            'ne l’affecte pas) — mais $y_S$, lui, dépend bien de $c$ : il se calcule en ' +
            'substituant $x_S$ dans le $f$ **original**.',
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
            textLabels: [
              { x: 3.2, y: -3, text: 'g(x) = x² − 4x', tone: 'ink' },
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
            text: '$y_S = f(2) = 8-16+3 = -5 \\to S(2\\,;\\,-5)$ — le même résultat que par la ' +
              'forme canonique, plus loin dans ce chapitre.',
          },
        },
        {
          kind: 'atelier',
          tag: 'parabole-widget',
          label: 'Manipule toi-même — fais varier a, b et c',
          caption:
            'Coche AS, S ou OAO pour faire apparaître l’axe de symétrie, le sommet et l’ordonnée ' +
            'à l’origine directement sur le graphe, en direct.',
        },
        { kind: 'subheading', text: 'Domaine et image' },
        {
          kind: 'para',
          text:
            'Le **domaine** est toujours $\\mathbb{R}$ — l’un des rares faits de ce chapitre qui ' +
            'ne dépend d’aucun coefficient. L’**image**, elle, dépend directement du sommet ' +
            '$S(x_S\\,;\\,y_S)$ et du signe de $a$ :',
        },
        {
          kind: 'list',
          items: [
            'Si $a > 0$ — le sommet est un minimum ; $\\operatorname{im} f = [y_S\\,;\\,{+\\infty}[$.',
            'Si $a < 0$ — le sommet est un maximum ; $\\operatorname{im} f = ]{-\\infty}\\,;\\,y_S]$.',
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
            'Les **zéros** de $f$ sont les valeurs de $x$ pour lesquelles $f(x) = 0$ — les ' +
            'abscisses des points où la courbe coupe l’axe des $x$. Selon la position du sommet ' +
            'par rapport à cet axe, une parabole en possède **0, 1 ou 2**.',
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
          text: 'Quand $f(x)$ se factorise facilement, les zéros se lisent directement dans la forme factorisée :',
        },
        {
          kind: 'exemple',
          badge: 'zéros par factorisation',
          formula: '$f(x) = (x-1)(x-4)$',
          steps: [{ tag: "un produit est nul si l'un de ses facteurs l'est", text: '$x-1=0$ ou $x-4=0$' }],
          result: { tag: 'zéros de f', text: '$x=1$ et $x=4$' },
        },
        {
          kind: 'astuce',
          label: 'Astuce — le lien avec le sommet',
          text:
            'Puisque la parabole est symétrique, deux zéros $x_1$ et $x_2$ sont toujours à égale ' +
            'distance de l’axe : leur milieu donne directement l’abscisse du sommet. Pour ' +
            '$f(x) = (x-1)(x-4)$ : axe de symétrie $\\dfrac{1+4}{2} = 2{,}5$ — sans aucun autre calcul.',
        },
        { kind: 'subheading', text: 'Tableau de signes et tableau de variation' },
        {
          kind: 'para',
          text:
            'Une fois les zéros connus, le **tableau de signes** découle directement du signe de ' +
            '$a$ : entre ses zéros, une parabole a le signe opposé à $a$ ; à l’extérieur, elle a ' +
            'le signe de $a$.',
        },
        {
          kind: 'methode',
          items: [
            "Placer les zéros (s'il y en a) sur une ligne graduée, dans l'ordre croissant.",
            'Déterminer le signe **à l’extérieur** des zéros : c’est celui de a.',
            'Déterminer le signe **entre** les zéros (s’il y en a deux) : c’est l’opposé de celui de a.',
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
          kind: 'signTable',
          caption: 'Variation, sommet en x = 2,5 (minimum)',
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
                { text: 'décroissante ↘', tone: 'plain' },
                { text: 'min', tone: 'zero' },
                { text: 'croissante ↗', tone: 'plain' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        { kind: 'video', title: "Analyse d'une fonction du second degré", youtubeId: '2qRqyuZh4FE' },
        {
          kind: 'entrainement',
          title: "Analyse d'une fonction du second degré",
          generatorId: 'gen7',
          widgetTag: 'gen7-widget',
          description: [
            'Coefficients, allure, axe et sommet, domaine/image, racines, tableau de signes et de ' +
              'variation — les six notions de cette partie, réunies en un seul exercice, ' +
              'activables individuellement par le professeur.',
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
      blocks: [
        {
          kind: 'para',
          text:
            'Toutes les paraboles sont des versions déplacées, étirées ou retournées d’une seule ' +
            'courbe de départ : $y = x^2$, sommet à l’origine $(0\\,;\\,0)$.',
        },
        { kind: 'subheading', text: 'Les translations' },
        {
          kind: 'list',
          items: [
            '**Translation horizontale (TH)** — $y = (x-p)^2$ déplace la courbe de $p$ unités horizontalement.',
            '**Translation verticale (TV)** — $y = x^2 + q$ déplace la courbe de $q$ unités verticalement.',
          ],
        },
        {
          kind: 'attention',
          label: 'Le piège du signe',
          text:
            '$y = (x-3)^2$ déplace la courbe de **3 unités vers la droite**, pas vers la gauche — ' +
            'le signe à l’intérieur de la parenthèse est opposé au sens du déplacement. À ' +
            'l’inverse, $y = (x+3)^2$ déplace vers la **gauche**.',
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
          steps: [],
          result: { tag: 'image de x = 5', text: '$(5-3)^2+2 = 4+2 = 6$' },
        },
        { kind: 'subheading', text: 'Étirement, compression et symétrie' },
        { kind: 'para', text: 'Le coefficient devant le carré change la **forme** de la courbe, pas seulement sa position :' },
        {
          kind: 'list',
          items: [
            '**Étirement vertical (EV)** — si $|a| > 1$, la courbe se resserre autour de son axe.',
            '**Compression verticale (CV)** — si $0 < |a| < 1$, la courbe s’aplatit.',
            '**Symétrie d’axe Ox (SOX)** — si $a$ devient négatif, la courbe se retourne : symétrie ' +
              'orthogonale par rapport à l’axe des $x$.',
          ],
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
              'le sommet passe de (0 ; 0) à (3 ; 2) : la courbe est translatée, sans changement de ' +
              'forme (a reste égal à 1 ici)',
          },
        },
        {
          kind: 'atelier',
          tag: 'transformations-widget',
          label: 'Manipule toi-même — fais varier TH, EV/CV et TV',
          caption:
            'Coche AS, S ou OAO pour faire apparaître l’axe de symétrie, le sommet et l’ordonnée ' +
            'à l’origine directement sur le graphe, en direct.',
        },
        { kind: 'video', title: 'Transformations graphiques d’une parabole', youtubeId: 'TviyRYRHono' },
        {
          kind: 'entrainement',
          title: 'Transformations graphiques',
          generatorId: 'gen8',
          widgetTag: 'gen8-widget',
          description: [
            'Lis p, q, l’étirement/la compression (EV/CV) et la symétrie (SOX) directement sur un ' +
              'graphe Mafs interactif.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 8. Transformations graphiques »',
        },
        { kind: 'subheading', text: 'La forme canonique' },
        {
          kind: 'para',
          text:
            'Réunir les deux translations et l’étirement dans une seule écriture donne la **forme ' +
            'canonique** — la véritable carte d’identité d’une parabole, puisqu’elle affiche ' +
            'directement son sommet :',
        },
        {
          kind: 'rappel',
          label: 'Forme canonique',
          items: ['$f(x) = a(x-x_S)^2+y_S$, de sommet $S(x_S\\,;\\,y_S)$.'],
        },
        { kind: 'para', text: 'Pour passer de la forme développée à la forme canonique, on **complète le carré** :' },
        {
          kind: 'exemple',
          badge: 'a = 1',
          steps: [
            { tag: '1 — forme développée', text: '$f(x) = x^2-6x+5$' },
            { tag: '2 — moitié du coefficient de x, au carré, ajoutée puis retranchée', text: '$f(x)=x^2-6x+9-9+5$' },
            { tag: '3 — carré parfait reconnu', text: '$f(x)=(x-3)^2-4$' },
          ],
          result: { tag: 'sommet', text: '$S(3\\,;\\,-4)$' },
        },
        {
          kind: 'para',
          text:
            'Dès que $a \\neq 1$, il faut d’abord le **mettre en évidence** devant les deux premiers ' +
            'termes avant de compléter le carré :',
        },
        {
          kind: 'exemple',
          badge: 'a ≠ 1',
          steps: [
            { tag: '1 — a mis en évidence sur x² et x', text: '$f(x)=2x^2-8x+3=2(x^2-4x)+3$' },
            { tag: '2 — carré complété à l’intérieur de la parenthèse', text: '$f(x)=2(x^2-4x+4-4)+3=2[(x-2)^2-4]+3$' },
            { tag: '3 — a redistribué sur les deux termes de la parenthèse', text: '$f(x)=2(x-2)^2-8+3=2(x-2)^2-5$' },
          ],
          result: { tag: 'sommet', text: '$S(2\\,;\\,-5)$' },
        },
        {
          kind: 'piege',
          text:
            'À l’étape 3, le $-4$ sorti de la parenthèse doit être **multiplié par a** avant d’être ' +
            'ajouté au $c$ d’origine — l’erreur la plus fréquente est de le ressortir tel quel, en ' +
            'oubliant ce facteur.',
        },
        { kind: 'video', title: 'Forme canonique et transformations', youtubeId: 'BOhdODKAigg' },
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
      ],
    },
    {
      id: 'utiliser',
      number: 3,
      title: 'Utiliser la fonction du second degré',
      kicker: 'modéliser, optimiser, résoudre une équation ou une inéquation en contexte',
      blocks: [
        {
          kind: 'para',
          text:
            'La fonction du second degré n’est pas qu’un objet d’étude abstrait : elle modélise ' +
            'des situations concrètes — une aire à optimiser, un revenu selon un prix, la ' +
            'trajectoire d’un objet — où il faut savoir en tirer un maximum, un minimum, ou ' +
            'résoudre une contrainte.',
        },
        { kind: 'subheading', text: 'Modéliser une situation concrète' },
        {
          kind: 'para',
          text: 'Modéliser, c’est traduire un énoncé en une fonction $f(x)=ax^2+bx+c$, en trois étapes systématiques :',
        },
        {
          kind: 'methode',
          items: [
            'Choisir une variable x pour la quantité qui varie (une longueur, un prix, un temps…).',
            'Exprimer la grandeur à étudier (une aire, un revenu, une hauteur…) en fonction de cette seule variable.',
            'Définir le **domaine de validité** : les valeurs de x qui ont un sens dans la ' +
              'situation réelle — jamais une longueur négative, par exemple.',
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
              'un enclos rectangulaire adossé à un mur : avec une longueur de clôture L fixée, ' +
              'l’aire A(x) = x(L − 2x) est une fonction du second degré de la largeur x',
          },
        },
        {
          kind: 'exemple',
          badge: 'en contexte — aire d’un enclos',
          steps: [
            { tag: '1 — variable', text: 'x = la largeur des deux côtés perpendiculaires au mur (en mètres)' },
            { tag: '2 — fonction, avec L = 40 m de clôture disponible', text: '$A(x) = x(40-2x) = -2x^2+40x$' },
          ],
          result: {
            tag: '3 — domaine de validité',
            text: '$x>0$ (une largeur) et $40-2x>0$ (une longueur) → $x \\in\\ ]0\\,;\\,20[$',
          },
        },
        { kind: 'subheading', text: 'Trouver l’optimum' },
        {
          kind: 'para',
          text:
            'Une fois la fonction posée, l’optimum mathématique est simplement son **sommet** — ' +
            'mais il faut toujours vérifier qu’il tombe **dans** le domaine de validité défini juste avant :',
        },
        {
          kind: 'list',
          items: [
            'Si l’abscisse du sommet appartient au domaine de validité, l’optimum réel est atteint au sommet.',
            'Sinon, la fonction est monotone sur tout le domaine : l’optimum réel se situe à l’une ' +
              'des **bornes** du domaine, jamais au sommet théorique.',
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
          kind: 'astuce',
          label: 'Astuce — quand le sommet tombe hors du domaine',
          text:
            'Avec une contrainte supplémentaire imposant $x \\in [12\\,;\\,20[$ (un massif de fleurs ' +
            'qui empêche x de descendre sous 12), le sommet théorique $x=10$ n’appartient plus au ' +
            'domaine restreint : sur $[12\\,;\\,20[$, la fonction est entièrement **décroissante** ' +
            '(on est déjà passé le sommet). L’aire maximale est alors atteinte à la borne ' +
            '**gauche** : $A(12) = -288+480 = 192$ m² — moins que les 200 m² du cas précédent, ' +
            'jamais plus, puisqu’on s’est éloigné du sommet théorique.',
        },
        { kind: 'video', title: 'Optimisation avec la fonction du second degré' },
        {
          kind: 'entrainement',
          title: 'Problèmes d’optimisation',
          generatorId: 'gen55',
          description: [
            'Modélise une grandeur du second degré à partir d’un contexte narratif (aire, revenu, ' +
              'trajectoire, coût de production…), détermine son domaine de validité, puis décide ' +
              'si l’optimum réel est au sommet ou à une borne.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 55. Problèmes d’optimisation »',
        },
        { kind: 'subheading', text: 'Équations et inéquations en contexte' },
        {
          kind: 'para',
          text:
            'Une situation concrète se traduit souvent par une question du type « à partir de ' +
            'quand… ? » ou « quand la grandeur atteint-elle exactement… ? ». Cela revient à résoudre :',
        },
        {
          kind: 'list',
          items: [
            '$f(x) = k$ — un seuil **atteint exactement** ;',
            '$f(x) > k$ ou $f(x) < k$ — un seuil **dépassé**, dans un sens ou dans l’autre.',
          ],
        },
        {
          kind: 'para',
          text:
            'Chaque solution mathématique doit ensuite être confrontée au domaine de validité ' +
            'établi au départ : une racine correcte **algébriquement** peut très bien être ' +
            '**physiquement impossible** (un temps négatif, une longueur trop grande…) — et doit ' +
            'alors être rejetée.',
        },
        {
          kind: 'para',
          text:
            'Contexte pour les deux exemples suivants : un ballon est lancé depuis une hauteur de ' +
            '25 m, sa hauteur (en mètres) après $t$ secondes vaut $h(t) = -5t^2+20t+25$, avec $t \\ge 0$.',
        },
        {
          kind: 'exemple',
          badge: 'équation — à quel instant touche-t-il le sol ?',
          steps: [{ tag: 'h(t) = 0, factorisée', text: '$-5(t-5)(t+1) = 0 \\to t=5$ ou $t=-1$' }],
          result: {
            tag: 'confrontation au domaine t ≥ 0',
            text: '$t=-1$ est rejeté (un temps négatif n’a pas de sens) : il ne reste que $t=5$ secondes',
          },
        },
        {
          kind: 'exemple',
          badge: 'inéquation — au-dessus du point de départ',
          steps: [
            {
              tag: 'h(t) > 25',
              text:
                '$-5t^2+20t>0 \\iff -5t(t-4)>0 \\iff t(t-4)<0$ (division par −5, l’inégalité change de sens)',
            },
          ],
          result: {
            tag: 'le produit est négatif entre les zéros 0 et 4',
            text: 'le ballon reste au-dessus de 25 m pendant $0<t<4$ secondes, avant de redescendre',
          },
        },
        {
          kind: 'entrainement',
          title: 'Équations/inéquations en contexte',
          generatorId: 'gen57',
          description: [
            'Pose puis résous une équation ou une inéquation issue d’un contexte narratif, valide ' +
              'chaque solution contre le domaine de validité, puis interprète le résultat.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 57. Équations/inéquations du second degré en contexte »',
        },
      ],
    },
    {
      id: 'revision',
      number: 4,
      title: 'Révision — vrai ou faux',
      kicker: '140 affirmations, 7 thèmes, tout le chapitre en révision transversale',
      blocks: [
        {
          kind: 'para',
          text:
            '140 affirmations réparties en 7 thèmes qui reprennent exactement les trois parties ' +
            'de ce chapitre — coefficients et allure, forme canonique et sommet, transformations, ' +
            'racines par factorisation, domaine/image et tableaux, optimisation, équations et ' +
            'inéquations en contexte. Un seul essai par question, la justification est toujours révélée.',
        },
        {
          kind: 'astuce',
          text:
            'Aucune affirmation ne suppose le discriminant Δ, pas encore vu à ce stade du ' +
            'programme : toutes les racines s’obtiennent par factorisation ou par un raisonnement ' +
            'sur la position du sommet.',
        },
        {
          kind: 'entrainement',
          title: 'La fonction du second degré — quiz vrai/faux',
          generatorId: 'gen60',
          description: [
            'Choisis un thème et teste-toi : 140 affirmations pré-écrites, une seule tentative par ' +
              'question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 60. Quiz vrai/faux — La fonction du second degré »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Coefficient a** — son signe donne le sens d’ouverture (minimum ou maximum), sa valeur ' +
        'absolue donne l’allure (resserrée ou aplatie) ; b et c n’y changent rien.',
      '**Sommet et axe** — $S(x_S\\,;\\,y_S)$ est le point extrémal, $x=x_S$ son axe de symétrie ; ' +
        '$x_S = -b/(2a)$, $y_S = f(x_S)$ ; deux points de même hauteur suffisent aussi à le ' +
        'retrouver par leur milieu.',
      '**Domaine et image** — $\\operatorname{dom} f = \\mathbb{R}$ toujours ; $\\operatorname{im} ' +
        'f = [y_S\\,;\\,{+\\infty}[$ si $a>0$, $]{-\\infty}\\,;\\,y_S]$ si $a<0$.',
      '**Zéros et signe** — 0, 1 ou 2 racines réelles ; entre les racines, signe opposé à a ; à ' +
        'l’extérieur, signe de a.',
      '**Forme canonique** — $f(x)=a(x-x_S)^2+y_S$ s’obtient en complétant le carré ; a se met en ' +
        'évidence avant de compléter si $a \\neq 1$.',
      '**En contexte** — modéliser (variable → grandeur → domaine de validité), puis vérifier si ' +
        'le sommet théorique tombe dans ce domaine avant de conclure à un optimum réel.',
    ],
    checklist: {
      items: [
        'Ai-je développé l’expression avant de conclure qu’il s’agit bien d’une fonction du second degré ?',
        'Ai-je vérifié le signe de a avant de parler de minimum ou de maximum ?',
        'En complétant le carré, ai-je bien redistribué a sur le terme sorti de la parenthèse ?',
        'En contexte, ai-je confronté chaque solution algébrique au domaine de validité réel — ' +
          'pas seulement au domaine mathématique ?',
      ],
    },
    forward:
      'La forme canonique et les racines reviennent au premier plan dans le chapitre sur les ' +
      'équations du second degré : le discriminant Δ y généralise la recherche des zéros à toute ' +
      'parabole, même quand la factorisation directe n’est pas évidente.',
  },
}
