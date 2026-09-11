import type { ChapterContent } from '../../types'

export const suites: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 3,
  title: 'Suites',
  slug: 'suites',
  lede:
    "Une **suite numérique**, c'est une grandeur qui évolue pas à pas : une population qui " +
    "change chaque année, un capital qui grossit chaque mois, une dose qui se dilue à chaque " +
    'prise. Dans ce chapitre, tu vas voir les deux grandes familles (**arithmétique**, qui ' +
    'ajoute toujours la même chose ; **géométrique**, qui multiplie toujours par la même ' +
    "chose), leur comportement à l'infini, quelques problèmes historiques célèbres, comment " +
    'comparer deux suites concurrentes, et pour finir les suites récurrentes affines.',

  sections: [
    {
      id: 'suites-arithmetiques',
      number: 1,
      title: 'Suites numériques et suites arithmétiques',
      kicker: 'notation u_n, raison r, formule générale, moyenne et somme',
      blocks: [
        { kind: 'subheading', text: "Qu'est-ce qu'une suite numérique ?" },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text:
            'Imagine un immeuble avec des boîtes aux lettres numérotées : 1, 2, 3, 4… Chaque ' +
            'boîte contient un seul nombre, toujours le même. La boîte n° 1 contient $u_1$, la ' +
            'boîte n° 2 contient $u_2$, et ainsi de suite. Une **suite**, c\'est exactement ça : ' +
            'une liste de nombres, un par numéro de boîte — jamais deux nombres dans la même ' +
            'boîte, jamais de boîte vide.',
        },
        {
          kind: 'para',
          text:
            'Une **suite numérique**, c\'est une liste ordonnée de nombres réels. Elle peut être ' +
            'finie ou infinie. Chaque nombre de la liste est un **terme** de la suite. Le premier ' +
            'terme se note $u_1$. Le terme d\'indice $n$ (son **rang**) se note $u_n$ — tu lis ' +
            '« u indice n ». La suite entière se note $(u_n)$.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — deux façons de définir une suite',
          items: [
            '**Explicite** — $u_n$ s\'exprime directement en fonction de n. Ex. ' +
              '$u_n=\\dfrac{n}{n+1}$ donne la suite $(\\frac{1}{2};\\frac{2}{3};\\frac{3}{4};...)$.',
            '**Par récurrence** — un terme s\'exprime en fonction du (ou des) terme(s) ' +
              'précédent(s). Il faut alors connaître un terme de départ, en général $u_1$. Ex. ' +
              '$u_{n+1}=\\dfrac{u_n}{1+u_n}$ avec $u_1=2$ donne la suite $(2;\\frac{2}{3};\\frac{2}{5};...)$.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Ça te rappelle quelque chose ?',
          text:
            'Tu connais déjà les fonctions $f(x)$ depuis le chapitre 1 : tu entres un nombre, il ' +
            'en ressort un autre. Une suite, c\'est une fonction très particulière — elle ' +
            'n\'accepte que des indices entiers ($1, 2, 3, ...$), jamais de virgule. $u_n$, ' +
            'c\'est un peu comme $f(n)$, sauf qu\'on écrit l\'indice n en bas plutôt qu\'entre ' +
            'parenthèses, par habitude.',
        },
        { kind: 'subheading', text: 'Suite arithmétique — raison additive' },
        {
          kind: 'para',
          text:
            'Une suite est **arithmétique** si tu passes d\'un terme au suivant en **ajoutant** ' +
            'toujours le même nombre. Ce nombre s\'appelle la **raison**, notée $r$ (positive ou ' +
            'négative). Si $r > 0$, la suite est croissante. Si $r < 0$, elle est décroissante.',
        },
        {
          kind: 'rappel',
          label: "Formule générale d'une suite arithmétique",
          items: [
            '$u_n = u_1 + (n-1)r$ ($n \\in \\mathbb{N}_0$). Pour vérifier qu\'une suite est ' +
              'arithmétique : calcule $u_n - u_{n-1}$. Si ce résultat est **constant** (toujours ' +
              'le même, quel que soit n), la suite est arithmétique — et ce résultat, c\'est r.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'retrouver la raison',
          formula:
            'Le premier terme d\'une suite arithmétique vaut $u_1 = 7$. Son sixième terme vaut ' +
            '$u_6 = 22$. Calcule la raison $r$.',
          steps: [
            { tag: 'poser la formule générale pour n = 6', text: '$u_6 = u_1 + (6-1)r \\implies 22 = 7 + 5r$' },
            { tag: 'isoler r', text: '$5r = 22 - 7 = 15 \\implies r = 3$' },
          ],
          result: { tag: 'résultat', text: 'r = 3 — la suite est (7 ; 10 ; 13 ; 16 ; 19 ; 22 ; ...)' },
        },
        {
          kind: 'attention',
          label: "Attention — l'exposant est toujours (n−1), jamais n",
          text:
            'Pour passer de $u_1$ à $u_n$, tu ajoutes la raison $r$ exactement $n-1$ fois — ' +
            'jamais n fois ! De $u_1$ à $u_2$, un seul pas. De $u_1$ à $u_6$, cinq pas. Écrire ' +
            '$u_n = u_1 + nr$ (sans le −1) est l\'erreur la plus fréquente sur cette formule.',
        },
        { kind: 'subheading', text: 'Représentation graphique — discrète et linéaire' },
        {
          kind: 'para',
          text:
            'Le graphique d\'une suite arithmétique, ce sont des **points isolés et alignés**. ' +
            'Jamais reliés par un trait continu ! La suite n\'existe que pour des indices ' +
            'entiers. Sa croissance est dite **discrète** (des points isolés) et **linéaire** ' +
            '(des points alignés).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [],
            xMin: 0.5, xMax: 7.5,
            xTicks: [1, 2, 3, 4, 5, 6, 7],
            fixedYRange: { min: 0, max: 12 },
            points: [
              { x: 1, y: 2, label: '', tone: 'accent' },
              { x: 2, y: 3.5, label: '', tone: 'accent' },
              { x: 3, y: 5, label: '', tone: 'accent' },
              { x: 4, y: 6.5, label: '', tone: 'accent' },
              { x: 5, y: 8, label: '', tone: 'accent' },
              { x: 6, y: 9.5, label: '', tone: 'accent' },
              { x: 7, y: 11, label: '(u_n) r>0', tone: 'accent', labelPos: 'above' },
              { x: 1, y: 11, label: '', tone: 'bad' },
              { x: 2, y: 9.5, label: '', tone: 'bad' },
              { x: 3, y: 8, label: '', tone: 'bad' },
              { x: 4, y: 6.5, label: '', tone: 'bad' },
              { x: 5, y: 5, label: '', tone: 'bad' },
              { x: 6, y: 3.5, label: '', tone: 'bad' },
              { x: 7, y: 2, label: '(v_n) r<0', tone: 'bad', labelPos: 'below' },
            ],
            xAxisLabel: 'n',
            yAxisLabel: 'u_n',
            caption:
              'u_n : u1=2, r=1,5, elle croît — v_n : v1=11, r=−1,5, elle décroît — les deux ' +
              'suites se croisent exactement au rang 4',
          },
        },
        { kind: 'subheading', text: 'Moyenne arithmétique et somme des termes' },
        {
          kind: 'rappel',
          label: 'Un terme est la moyenne arithmétique de ses deux voisins',
          items: [
            'Prends un terme d\'une suite arithmétique (jamais le premier ni le dernier). Il ' +
              'vaut toujours la **moyenne arithmétique** de ses deux voisins : ' +
              '$u_n = \\dfrac{u_{n-1}+u_{n+1}}{2}$ (n ≥ 2).',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la « double échelle », pour établir la formule de la somme',
          blocks: [
            {
              kind: 'para',
              text:
                'Note $S_n = u_1+u_2+u_3+\\ldots+u_n$ la somme des n premiers termes. Écris ' +
                'cette somme une seconde fois, **à l\'envers**. Puis additionne les deux lignes, ' +
                'colonne par colonne :',
            },
            {
              kind: 'para',
              text:
                '**1.** $S_n = u_1 + u_2 + u_3 + \\ldots + u_{n-1} + u_n$ et $S_n = u_n + u_{n-1} + u_{n-2} + \\ldots + u_2 + u_1$',
            },
            {
              kind: 'para',
              text:
                '**2.** en additionnant, colonne par colonne : $2S_n = (u_1+u_n) + (u_2+u_{n-1}) + (u_3+u_{n-2}) + \\ldots + (u_n+u_1)$',
            },
            {
              kind: 'para',
              text:
                '**3.** Il reste à prouver que **chaque** parenthèse vaut exactement $u_1+u_n$. ' +
                'Prends la k-ième parenthèse : elle associe $u_k$ (le k-ième terme depuis le ' +
                'début) à $u_{n+1-k}$ (le k-ième terme depuis la fin). Avec $u_k = u_1+(k-1)r$ ' +
                'et $u_{n+1-k} = u_1+(n-k)r$ : $u_k + u_{n+1-k} = 2u_1 + [(k-1)+(n-k)]r = 2u_1 + ' +
                '(n-1)r = u_1 + [u_1+(n-1)r] = u_1+u_n$',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Le résultat $u_1+u_n$ ne dépend pas de k ! Le $+(k-1)r$ de ' +
                '$u_k$ et le $-kr$ caché dans $u_{n+1-k}$ s\'annulent toujours. Les n ' +
                'parenthèses valent donc **toutes** exactement $u_1+u_n$. Donc ' +
                '$2S_n = n(u_1+u_n)$, d\'où $S_n = \\dfrac{n(u_1+u_n)}{2}$.',
            },
          ],
        },
        {
          kind: 'rappel',
          label: "Somme des n premiers termes d'une suite arithmétique",
          items: ['$S_n = \\dfrac{n(u_1+u_n)}{2}$ — n fois la moyenne du premier et du dernier terme.'],
        },
        {
          kind: 'exemple',
          badge: 'somme des 20 premiers termes',
          formula:
            "Calcule la somme des 20 premiers termes d'une suite arithmétique de premier terme " +
            '$u_1 = 4$ et de raison $r = 3$.',
          steps: [{ tag: 'terme u20 — formule générale', text: '$u_{20} = 4 + (20-1)\\times3 = 4 + 57 = 61$' }],
          result: { tag: 'somme S20', text: '$S_{20} = \\dfrac{20\\times(4+61)}{2} = 10\\times65 = 650$' },
        },
        {
          kind: 'astuce',
          text:
            'Le terme $u_n$ dont tu as besoin pour $S_n$ n\'est presque jamais donné directement ' +
            'dans l\'énoncé. Calcule-le toujours d\'abord, avec la formule générale, avant de ' +
            'l\'utiliser.',
        },
        {
          kind: 'entrainement',
          title: 'Suites arithmétiques, formule générale et termes',
          generatorId: '5gen14',
          description: [
            "Retrouve un terme, la raison ou le premier terme d'une suite arithmétique à partir " +
              "de données variées. Calcule une somme de termes. Ou vérifie la cohérence de " +
              "données sur-spécifiées.",
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 14. Suites arithmétiques, formule générale et termes »',
        },
      ],
    },
    {
      id: 'suites-geometriques',
      number: 2,
      title: 'Suites géométriques',
      kicker: 'raison multiplicative q, formule générale, moyenne et somme',
      blocks: [
        {
          kind: 'para',
          text:
            'Une suite est **géométrique** si tu passes d\'un terme au suivant en ' +
            '**multipliant** toujours par le même nombre. Ce nombre s\'appelle la **raison**, ' +
            'notée $q$ — non nulle, et différente de 1.',
        },
        {
          kind: 'featureTable',
          headers: ['', '0 < q < 1', 'q > 1', 'q < 0'],
          rows: [
            ['u₁ > 0', 'suite décroissante', 'suite croissante', 'suite oscillante'],
            ['u₁ < 0', 'suite croissante', 'suite décroissante', 'suite oscillante'],
          ],
        },
        {
          kind: 'rappel',
          label: "Formule générale d'une suite géométrique",
          items: [
            '$u_n = u_1 \\times q^{n-1}$. Pour vérifier qu\'une suite est géométrique : calcule ' +
              'le **rapport** entre deux termes consécutifs, $\\dfrac{u_n}{u_{n-1}}$. Si ce ' +
              'rapport est constant, la suite est géométrique — et ce rapport, c\'est q.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'retrouver la raison',
          formula:
            "Le premier terme d'une suite géométrique vaut $u_1 = \\frac{1}{2}$. Son septième " +
            'terme vaut $u_7 = 32$. Calcule la raison $q$ (positive).',
          steps: [
            { tag: 'poser la formule générale pour n = 7', text: '$u_7 = u_1 \\times q^6 \\implies 32 = \\dfrac{1}{2} \\times q^6$' },
            { tag: 'isoler q⁶ puis extraire la racine 6e', text: '$q^6 = 64 \\implies q = \\sqrt[6]{64} = 2$' },
          ],
          result: { tag: 'résultat', text: 'q = 2 — la suite est (0,5 ; 1 ; 2 ; 4 ; 8 ; 16 ; 32 ; ...)' },
        },
        {
          kind: 'attention',
          label: 'Attention — racine d\'exposant PAIR : jamais une solution unique par réflexe',
          text:
            'Résoudre $q^k = a$, c\'est chercher une racine k-ième. Si $k$ est **pair**, il ' +
            'existe **deux** solutions opposées $\\pm\\sqrt[k]{a}$ dès que $a > 0$ (car ' +
            '$(-q)^k = q^k$ quand k est pair). Et **aucune** solution réelle si $a < 0$ — ' +
            'aucune puissance paire d\'un réel n\'est négative ! Ne garde la solution positive ' +
            'seule que si l\'énoncé te le demande explicitement. Sinon, vérifie toujours la ' +
            'parité de l\'exposant avant de conclure.',
        },
        { kind: 'subheading', text: 'Représentation graphique — croissance exponentielle discrète' },
        {
          kind: 'para',
          text:
            'Quand la raison est positive et supérieure à 1, la croissance d\'une suite ' +
            'géométrique est dite **exponentielle discrète**. Les points restent isolés (la ' +
            'suite est discrète), mais s\'écartent de plus en plus vite de l\'axe horizontal — ' +
            'contrairement aux points alignés d\'une suite arithmétique.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [],
            xMin: 0.5, xMax: 7.5,
            xTicks: [1, 2, 3, 4, 5, 6, 7],
            fixedYRange: { min: 0, max: 3.7 },
            points: [
              { x: 1, y: 1, label: '', tone: 'accent' },
              { x: 2, y: 1.4, label: '', tone: 'accent' },
              { x: 3, y: 1.96, label: '', tone: 'accent' },
              { x: 4, y: 2.744, label: '', tone: 'accent' },
              { x: 5, y: 3.8416, label: '', tone: 'accent' },
              { x: 6, y: 3.7, label: '', tone: 'accent' },
              { x: 7, y: 3.7, label: '(u_n) q=1,4', tone: 'accent', labelPos: 'above' },
              { x: 1, y: 3.5, label: '', tone: 'bad' },
              { x: 2, y: 2.1, label: '', tone: 'bad' },
              { x: 3, y: 1.26, label: '', tone: 'bad' },
              { x: 4, y: 0.756, label: '', tone: 'bad' },
              { x: 5, y: 0.4536, label: '', tone: 'bad' },
              { x: 6, y: 0.27216, label: '', tone: 'bad' },
              { x: 7, y: 0.163296, label: '(v_n) q=0,6', tone: 'bad', labelPos: 'left' },
            ],
            xAxisLabel: 'n',
            yAxisLabel: 'u_n',
            caption:
              'u_n : u1=1, q=1,4, elle croît (tronquée à partir de n=6 pour rester lisible) — ' +
              'v_n : v1=3,5, q=0,6, elle décroît et tend vers 0',
          },
        },
        { kind: 'subheading', text: 'Moyenne géométrique et somme des termes' },
        {
          kind: 'rappel',
          label: 'Un terme est la moyenne géométrique de ses deux voisins',
          items: [
            'Prends un terme d\'une suite géométrique (jamais le premier ni le dernier). Il ' +
              'vaut toujours la **moyenne géométrique** de ses deux voisins : ' +
              '$u_n = \\sqrt{u_{n-1} \\times u_{n+1}}$ (n ≥ 2).',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — établir la formule de la somme',
          blocks: [
            {
              kind: 'para',
              text:
                '**1.** Écris $S_n$ en remplaçant chaque terme par sa formule générale ' +
                '$u_1q^{k-1}$ : $S_n = u_1 + u_1q + u_1q^2 + \\ldots + u_1q^{n-2} + u_1q^{n-1}$',
            },
            {
              kind: 'para',
              text:
                '**2.** Multiplie cette égalité par $q$, terme à terme. Chaque exposant ' +
                'augmente de 1 : $qS_n = u_1q + u_1q^2 + u_1q^3 + \\ldots + u_1q^{n-1} + u_1q^n$',
            },
            {
              kind: 'para',
              text:
                '**3.** Soustrais la ligne 2 de la ligne 1. Chaque terme $u_1q$, $u_1q^2$, …, ' +
                '$u_1q^{n-1}$ apparaît dans les deux lignes : il disparaît de la différence ! ' +
                'Il ne reste que le tout premier terme de la ligne 1, et le tout dernier de la ' +
                'ligne 2 : $S_n - qS_n = u_1 - u_1q^n$',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Factorise chaque membre : $S_n(1-q)$ à gauche, ' +
                '$u_1(1-q^n)$ à droite. Divise ensuite par $1-q$ — possible, car $q \\neq 1$ : ' +
                '$S_n = u_1 \\times \\dfrac{1-q^n}{1-q}$.',
            },
          ],
        },
        {
          kind: 'rappel',
          label: "Somme des n premiers termes d'une suite géométrique (q ≠ 1)",
          items: ['$S_n = u_1 \\times \\dfrac{1-q^n}{1-q}$'],
        },
        {
          kind: 'exemple',
          badge: 'somme des 8 premiers termes',
          formula:
            "Calcule la somme des 8 premiers termes d'une suite géométrique de premier terme " +
            '$u_1 = 3$ et de raison $q = 2$.',
          steps: [{ tag: 'application directe de la formule, n = 8', text: '$S_8 = 3 \\times \\dfrac{1-2^8}{1-2} = 3 \\times \\dfrac{1-256}{-1} = 3 \\times 255$' }],
          result: { tag: 'résultat', text: '$S_8 = 765$' },
        },
        {
          kind: 'astuce',
          label: 'Astuce — et si |q| < 1 ?',
          text:
            'Quand $-1 < q < 1$, la formule de la somme reste valable pour n\'importe quel $n$ ' +
            'fini. Mais elle prend aussi un sens quand $n$ devient très grand : c\'est le point ' +
            'de départ de la **somme infinie**, que tu verras juste après, dans la section sur ' +
            'la convergence.',
        },
        {
          kind: 'entrainement',
          title: 'Suites géométriques, formule générale et termes',
          generatorId: '5gen15',
          description: [
            "Retrouve un terme, la raison ou le premier terme d'une suite géométrique — avec " +
              'le piège de la racine paire (0, 1 ou 2 solutions). Calcule une somme finie ou ' +
              'infinie. Ou entraîne-toi sur la moyenne géométrique.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 15. Suites géométriques, formule générale et termes »',
        },
      ],
    },
    {
      id: 'convergence',
      number: 3,
      title: 'Convergence et divergence des suites',
      kicker: "limite à l'infini, arithmétique, géométrique, et le cas d'une suite quelconque",
      blocks: [
        {
          kind: 'intuition',
          label: 'Pour se représenter la convergence',
          text:
            'Imagine une balle qui rebondit : à chaque rebond, elle remonte un peu moins haut ' +
            'qu\'avant — d\'abord 1 m, puis 50 cm, puis 25 cm… Elle se rapproche de plus en ' +
            'plus du sol, sans qu\'aucun rebond ne l\'y pose exactement. C\'est exactement ' +
            'l\'idée d\'une suite qui **converge** : ses termes se rapprochent indéfiniment ' +
            'd\'une valeur, sans forcément jamais l\'atteindre.',
        },
        {
          kind: 'para',
          text:
            'Quand $n$ tend vers $+\\infty$, les termes d\'une suite peuvent suivre quatre ' +
            'comportements. Devenir de plus en plus grands, sans borne ' +
            '($\\lim_{n\\to+\\infty} u_n = +\\infty$). Devenir de plus en plus petits, sans ' +
            'borne ($\\lim_{n\\to+\\infty} u_n = -\\infty$). Se rapprocher indéfiniment d\'un ' +
            'réel $a$ ($\\lim_{n\\to+\\infty} u_n = a$). Ou ne suivre aucun de ces trois cas — ' +
            'la suite **oscille**, sans jamais se stabiliser.',
        },
        {
          kind: 'rappel',
          label: 'Convergence et divergence',
          items: [
            'Si $\\lim_{n\\to+\\infty} u_n$ est un nombre réel $a$, la suite **converge** vers ' +
              'a. Si cette limite est infinie, ou si elle n\'existe pas, la suite est **divergente**.',
          ],
        },
        { kind: 'subheading', text: 'Limite d\'une suite arithmétique — tout dépend du signe de r' },
        {
          kind: 'featureTable',
          headers: ['raison r', 'comportement', 'limite'],
          rows: [
            ['r = 0', 'suite constante', '$\\lim u_n = u_1$'],
            ['r > 0', 'croissante, sans borne', '$\\lim u_n = +\\infty$'],
            ['r < 0', 'décroissante, sans borne', '$\\lim u_n = -\\infty$'],
          ],
        },
        { kind: 'subheading', text: 'Limite d\'une suite géométrique — tout dépend de q' },
        {
          kind: 'featureTable',
          headers: ['raison q', 'comportement', 'limite'],
          rows: [
            ['q = 1', 'suite constante', '$\\lim u_n = u_1$'],
            ['|q| < 1 (q≠0)', 'décroissante en valeur absolue', '$\\lim u_n = 0$'],
            ['q > 1', 'croissante en valeur absolue', '$\\lim u_n = \\pm\\infty$ (signe de $u_1$)'],
            ['q = −1', 'oscille entre u₁ et −u₁', "n'existe pas (ne diverge pas vers l'infini)"],
            ['q < −1', 'oscille, amplitude croissante', "n'existe pas"],
          ],
        },
        {
          kind: 'attention',
          label: "Attention — q = −1 ne diverge PAS vers l'infini",
          text:
            'Une suite géométrique de raison $q = -1$ (ex. 3 ; −3 ; 3 ; −3 ; ...) reste coincée ' +
            'entre $u_1$ et $-u_1$. Elle ne tend ni vers $+\\infty$ ni vers $-\\infty$. Elle ne ' +
            'se stabilise sur aucune valeur non plus : sa limite n\'existe tout simplement pas ! ' +
            'Ne la classe jamais avec les cas $q > 1$, ni avec les cas convergents.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 6, label: '6' },
              { n: 2, value: 3.9, label: '3,9' },
              { n: 3, value: 2.535, label: '2,54' },
              { n: 4, value: 1.648, label: '1,65' },
              { n: 5, value: 1.071, label: '1,07' },
              { n: 6, value: 0.696, label: '0,70' },
              { n: 7, value: 0.453, label: '0,45' },
              { n: 8, value: 0.294, label: '0,29' },
              { n: 9, value: 0.191, label: '0,19' },
            ],
            connector: 'smooth',
            referenceLine: { value: 0, label: 'L=0' },
            trendLabel: { afterIndex: 6, text: 'w_n → 0' },
            xAxisLabel: 'n',
            yAxisLabel: 'w_n',
            caption: 'w_n = 6×0,65^(n−1) : suite géométrique de raison 0<q<1, elle converge vers 0',
          },
        },
        { kind: 'subheading', text: "Le cas d'une suite quelconque — comparer les degrés" },
        {
          kind: 'para',
          text:
            'Pour une suite définie par un quotient de polynômes en n, $u_n = \\dfrac{P(n)}{Q(n)}$ ' +
            ': divise le numérateur ET le dénominateur par la plus haute puissance de n **du ' +
            'dénominateur**. Puis compare les degrés de P et de Q.',
        },
        {
          kind: 'methode',
          label: 'Méthode — comparaison des degrés',
          items: [
            'degré(P) < degré(Q) → $\\lim_{n\\to+\\infty} u_n = 0$ (le dénominateur « grandit plus vite »).',
            'degré(P) = degré(Q) → la limite est le **rapport des coefficients dominants** (les ' +
              'deux termes de plus haut degré l\'emportent, tout le reste devient négligeable).',
            'degré(P) > degré(Q) → $\\lim_{n\\to+\\infty} u_n = \\pm\\infty$ (le signe dépend ' +
              'des coefficients dominants de P et de Q).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'degrés égaux',
          formula: 'Calcule $\\lim_{n\\to+\\infty} u_n$ pour $u_n = \\dfrac{3n-1}{2n+5}$.',
          steps: [
            { tag: 'diviser numérateur ET dénominateur par n (plus haute puissance au dénominateur)', text: '$u_n = \\dfrac{3-\\frac{1}{n}}{2+\\frac{5}{n}}$' },
            { tag: 'quand n→+∞, 1/n→0 et 5/n→0', text: '$u_n \\to \\dfrac{3-0}{2+0} = \\dfrac{3}{2}$' },
          ],
          result: {
            tag: 'résultat',
            text: '$\\lim_{n\\to+\\infty} u_n = \\dfrac{3}{2} = 1{,}5$ — même degré (1) au numérateur et au dénominateur : la limite est le rapport des coefficients dominants, 3/2.',
          },
        },
        {
          kind: 'astuce',
          text:
            'Diviser par n\'importe quelle puissance de n (la même au numérateur et au ' +
            'dénominateur) ne change jamais la valeur de l\'expression. Mais diviser par la ' +
            '**bonne** puissance (celle du dénominateur) fait apparaître directement des termes ' +
            'en 1/n, qui s\'annulent à la limite — sans calcul supplémentaire.',
        },
        {
          kind: 'entrainement',
          title: 'Convergence et divergence des suites',
          generatorId: '5gen16',
          description: [
            'Classe la limite d\'une suite arithmétique, géométrique (avec les pièges q=−1 et ' +
              'q<−1), ou d\'une suite quelconque u_n=P(n)/Q(n) en comparant les degrés du ' +
              'numérateur et du dénominateur.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 16. Convergence et divergence des suites »',
        },
      ],
    },
    {
      id: 'problemes-classiques',
      number: 4,
      title: 'Problèmes classiques sur les suites',
      kicker: 'des énigmes historiques qui se résolvent avec les mêmes outils',
      blocks: [
        {
          kind: 'para',
          text:
            "Les suites arithmétiques et géométriques ne sont pas qu'un exercice scolaire. " +
            "Plusieurs problèmes célèbres, parfois vieux de plusieurs millénaires, se résolvent " +
            'avec les formules déjà vues dans ce chapitre. Voici le plus connu d\'entre eux, ' +
            'résolu en détail, puis un aperçu des autres classiques.',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi ça explose aussi vite ?',
          text:
            'Une suite arithmétique ajoute toujours la même quantité : elle avance à vitesse ' +
            'constante, comme une voiture à 100 km/h. Une suite géométrique multiplie toujours ' +
            'par la même quantité : elle grandit **sur elle-même**, comme une boule de neige ' +
            'qui dévale une pente — plus elle grossit, plus elle ramasse de neige, plus elle ' +
            'grossit encore. Cet effet boule de neige finit toujours par dépasser n\'importe ' +
            'quelle addition, même énorme.',
        },
        {
          kind: 'exemple',
          badge: "la légende de l'échiquier",
          formula:
            "Une légende raconte qu'un roi veut récompenser l'inventeur du jeu d'échecs. " +
            "L'inventeur demande : un grain de blé sur la première case de l'échiquier, deux " +
            'sur la deuxième, quatre sur la troisième — et ainsi de suite, en doublant à ' +
            "chaque case, jusqu'à la 64ᵉ. Combien de grains de blé cela représente-t-il au total ?",
          steps: [
            { tag: 'reconnaître la suite — géométrique, u1=1, q=2', text: 'Le nombre de grains sur la case n est $u_n = 1\\times2^{n-1}$.' },
            { tag: 'le total est la somme des 64 premiers termes', text: '$S_{64} = u_1 \\times \\dfrac{1-q^{64}}{1-q} = 1 \\times \\dfrac{1-2^{64}}{1-2} = 2^{64}-1$' },
          ],
          result: {
            tag: 'résultat',
            text: '$S_{64} = 2^{64}-1 \\approx 1{,}8446744\\times10^{19}$ grains — plusieurs centaines de fois la production mondiale annuelle actuelle de blé.',
          },
        },
        {
          kind: 'attention',
          label: "Attention — une croissance géométrique dépasse vite l'intuition",
          text:
            "Le piège de ce problème n'est pas le calcul : c'est l'intuition ! Doubler semble " +
            'anodin case après case. Mais après seulement 20 cases, tu dépasses déjà le million ' +
            'de grains. Après 64 cases, la quantité dépasse toute réserve de blé imaginable. Une ' +
            "suite géométrique de raison supérieure à 1 grandit toujours plus vite qu'une suite " +
            'arithmétique — même avec une raison additive énorme. C\'est une différence de ' +
            '**nature**, pas seulement de vitesse.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [],
            xMin: 0.5, xMax: 13.7,
            xTicks: [1, 3, 5, 7, 9, 11],
            fixedYRange: { min: 0, max: 48 },
            points: [
              { x: 1, y: 3, label: '', tone: 'good' },
              { x: 2, y: 7, label: '', tone: 'good' },
              { x: 3, y: 11, label: '', tone: 'good' },
              { x: 4, y: 15, label: '', tone: 'good' },
              { x: 5, y: 19, label: '', tone: 'good' },
              { x: 6, y: 23, label: '', tone: 'good' },
              { x: 7, y: 27, label: '', tone: 'good' },
              { x: 8, y: 31, label: '', tone: 'good' },
              { x: 9, y: 35, label: '', tone: 'good' },
              { x: 10, y: 39, label: '', tone: 'good' },
              { x: 11, y: 43, label: '', tone: 'good' },
              { x: 12, y: 47, label: 'u_n arithmétique (r=4)', tone: 'good', labelPos: 'above' },
              { x: 1, y: 1, label: '', tone: 'accent' },
              { x: 2, y: 1.6, label: '', tone: 'accent' },
              { x: 3, y: 2.56, label: '', tone: 'accent' },
              { x: 4, y: 4.096, label: '', tone: 'accent' },
              { x: 5, y: 6.554, label: '', tone: 'accent' },
              { x: 6, y: 10.486, label: '', tone: 'accent' },
              { x: 7, y: 16.777, label: '', tone: 'accent' },
              { x: 8, y: 26.844, label: '', tone: 'accent' },
              { x: 9, y: 42.95, label: 'v_n géométrique (q=1,6)', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 'n',
            yAxisLabel: '',
            caption:
              'u_n = 3+(n−1)×4 (points, croissance linéaire) contre v_n = 1×1,6^(n−1) (points ' +
              'en couleur, croissance exponentielle) — v_n rattrape puis dépasse u_n dès le ' +
              'rang 9, malgré un départ beaucoup plus lent',
          },
        },
        { kind: 'subheading', text: "D'autres grands classiques" },
        {
          kind: 'para',
          text: "Le générateur d'exercices propose sept mises en situation historiques ou géométriques différentes :",
        },
        {
          kind: 'list',
          items: [
            '**Le papyrus de Rhind** — un partage de pains en parts qui forment une suite ' +
              "arithmétique. L'un des plus anciens problèmes de mathématiques connus (Égypte antique).",
            '**La suite de Fibonacci** — chaque terme est la somme des deux précédents. Le ' +
              "rapport entre deux termes successifs converge vers le nombre d'or.",
            '**Les triangles en zigzag** et **les carrés emboîtés** — des suites géométriques de ' +
              "longueurs ou d'aires. Elles décroissent à chaque étape d'une construction " +
              'géométrique répétée. Leur somme infinie a pourtant une valeur finie.',
            '**Les suites combinées** — une suite arithmétique et une suite géométrique qui ' +
              "partagent certains termes. À démêler avec un système d'équations.",
            '**Position et vitesse** — une distance parcourue par intervalles de temps égaux, ' +
              'modélisée par une suite.',
          ],
        },
        {
          kind: 'astuce',
          text:
            'Face à un problème « habillé » (contexte historique, géométrique ou concret), la ' +
            "première étape est toujours la même : repère ce qui varie d'une étape à l'autre. " +
            'Une addition ? C\'est une suite arithmétique. Une multiplication ? C\'est une ' +
            'suite géométrique. Choisis la formule seulement après.',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes classiques sur les suites',
          generatorId: '5gen17',
          description: [
            'Sept mises en situation historiques ou géométriques classiques (échiquier, papyrus ' +
              'de Rhind, Fibonacci, triangles en zigzag, carrés emboîtés, suites combinées, ' +
              'vitesse). À résoudre pas à pas avec les outils du chapitre.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 17. Problèmes classiques sur les suites »',
        },
      ],
    },
    {
      id: 'comparaison-suites',
      number: 5,
      title: 'Comparaison numérique de deux suites',
      kicker: 'balayage numérique, tableau, rang de bascule',
      blocks: [
        {
          kind: 'para',
          text:
            'Certaines situations comparent deux suites concurrentes — deux populations, deux ' +
            'stocks, deux capitaux. La question posée : à partir de quel rang l\'une ' +
            'dépasse-t-elle l\'autre ? Il n\'existe pas toujours de formule toute faite pour ' +
            'ça. La méthode la plus fiable : un **balayage numérique**. Tu calcules les deux ' +
            'suites terme après terme, jusqu\'à repérer le rang où la condition bascule.',
        },
        {
          kind: 'methode',
          label: 'Méthode — trouver le rang de bascule',
          items: [
            'Écris les deux formules générales (une pour chaque suite).',
            'Calcule les deux suites terme après terme — à la main pour un petit tableau, ou en ' +
              'repérant le motif si le rang cherché est grand.',
            'Repère le **premier** rang n où la condition devient vraie. Vérifie qu\'elle était ' +
              'bien fausse au rang précédent (n−1) — pour être sûr de ne pas avoir manqué le ' +
              'vrai point de bascule.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — deux villes, deux croissances',
          blocks: [
            {
              kind: 'para',
              text:
                'En 2020, la ville A compte 50 000 habitants. Elle croît de 2 000 habitants par ' +
                'an (croissance arithmétique). La même année, la ville B compte 30 000 ' +
                'habitants. Elle croît de 8 % par an (croissance géométrique). À partir de ' +
                'quelle année la population de B dépasse-t-elle celle de A ?',
            },
            {
              kind: 'para',
              text:
                "**Les deux formules** (n=1 correspond à 2020) : $A_n = 50000 + (n-1)\\times2000$ " +
                'et $B_n = 30000\\times1{,}08^{n-1}$.',
            },
            {
              kind: 'featureTable',
              headers: ['n', 'année', 'Aₙ', 'Bₙ', 'B>A ?'],
              rows: [
                ['12', '2031', '72 000', '69 949', 'non'],
                ['**13**', '**2032**', '**74 000**', '**75 545**', '**oui — bascule ici**'],
                ['14', '2033', '76 000', '81 589', 'oui'],
              ],
            },
            {
              kind: 'para',
              text:
                'Conclusion : n = 13 est le premier rang où $B_n > A_n$ (75 545 > 74 000). Au ' +
                'rang 12, ce n\'était pas encore le cas (69 949 < 72 000). La ville B dépasse ' +
                'donc la ville A **à partir de 2032**.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [],
                xMin: 0.5, xMax: 16.5,
                xTicks: [1, 4, 7, 10, 13, 16],
                xTickLabels: { 1: '2020', 4: '2023', 7: '2026', 10: '2029', 13: '2032', 16: '2035' },
                fixedYRange: { min: 25000, max: 100000 },
                points: [
                  { x: 1, y: 50000, label: '', tone: 'good' },
                  { x: 4, y: 56000, label: '', tone: 'good' },
                  { x: 7, y: 62000, label: '', tone: 'good' },
                  { x: 10, y: 68000, label: '', tone: 'good' },
                  { x: 13, y: 74000, label: 'A_n (+2000/an)', tone: 'good', labelPos: 'above' },
                  { x: 16, y: 80000, label: '', tone: 'good' },
                  { x: 1, y: 30000, label: '', tone: 'accent' },
                  { x: 4, y: 37791, label: '', tone: 'accent' },
                  { x: 7, y: 47606, label: '', tone: 'accent' },
                  { x: 10, y: 59973, label: 'B_n (+8%/an)', tone: 'accent', labelPos: 'above' },
                  { x: 13, y: 75545, label: '', tone: 'accent' },
                  { x: 16, y: 95165, label: '', tone: 'accent' },
                ],
                xAxisLabel: 'année',
                yAxisLabel: 'habitants',
                caption:
                  'population de 2020 à 2035 : A croît de façon arithmétique, B de façon ' +
                  'géométrique — et B dépasse A en 2032',
              },
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — deux pièges fréquents',
          text:
            '**Le cran de bascule** : tu donnes un rang n qui vérifie bien la condition, mais ' +
            'sans avoir vérifié que n−1 ne la vérifie pas déjà. Le vrai premier rang pourrait ' +
            'être plus petit ! **La traduction en unité du contexte** : une fois n trouvé, ' +
            'l\'énoncé demande presque toujours une **année**, un **nombre de mois**, ou une ' +
            'autre grandeur concrète — jamais seulement l\'indice n brut, qui n\'a de sens que ' +
            'dans le calcul intermédiaire.',
        },
        {
          kind: 'entrainement',
          title: 'Comparaison numérique de deux suites',
          generatorId: '5gen18',
          description: [
            'Complète un tableau de valeurs pour deux suites concurrentes (villes, stocks, ' +
              "comptes d'épargne). Détermine le rang exact où l'une dépasse l'autre. Puis " +
              "traduis ce rang dans l'unité du contexte.",
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 18. Comparaison numérique de deux suites »',
        },
      ],
    },
    {
      id: 'recurrente-affine',
      number: 6,
      title: 'Suite récurrente affine et régime permanent',
      kicker: 'u_(n+1) = a·u_n + b — ni arithmétique, ni géométrique',
      blocks: [
        {
          kind: 'para',
          text:
            'Une suite peut être définie par une récurrence de la forme $u_{n+1} = a\\times u_n + ' +
            'b$. Avec $a \\neq 1$ (sinon elle serait arithmétique de raison b) et $b \\neq 0$ ' +
            '(sinon elle serait géométrique de raison a). C\'est une **suite récurrente ' +
            'affine** — une famille à part entière. Tu la rencontres dans tout contexte où une ' +
            'grandeur perd ou gagne une fraction d\'elle-même à chaque étape, tout en recevant ' +
            '(ou perdant) en plus une quantité fixe : une dose de médicament partiellement ' +
            'éliminée puis renouvelée, un capital taxé puis abondé, une pollution ' +
            'partiellement filtrée puis réémise.',
        },
        {
          kind: 'intuition',
          label: 'Le même mot, pour une suite différente',
          text:
            'Tu as déjà vu le mot **converger** : se rapprocher indéfiniment d\'une valeur ' +
            '(section 3). Le **régime permanent**, c\'est exactement cette valeur limite — sauf ' +
            'qu\'ici, la suite ne dépend plus de n directement, mais de son propre terme ' +
            'précédent. L\'idée reste la même : à force de répéter la même opération, les ' +
            'termes se rapprochent d\'un point d\'équilibre, comme un thermostat qui stabilise ' +
            'une pièce à température constante.',
        },
        {
          kind: 'rappel',
          label: 'Régime permanent — la valeur vers laquelle la suite se stabilise',
          items: [
            'Si $|a| < 1$, la suite converge vers une valeur limite $L$, appelée **régime ' +
              'permanent**. C\'est le point fixe de la récurrence ($L = a\\times L+b$) : $L = ' +
              '\\dfrac{b}{1-a}$. Si $|a| \\geq 1$, ce régime permanent **n\'existe pas** : la ' +
              'suite diverge.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi L = b/(1−a)',
          blocks: [
            {
              kind: 'para',
              text:
                '**1.** Suppose que la suite converge vers une limite $L$ — c\'est ce que ' +
                'garantit $|a| < 1$ (admis à ce niveau). $(u_{n+1})$ est la même suite que ' +
                '$(u_n)$, juste décalée d\'un rang : elle a donc **la même limite**. ' +
                '$u_n \\to L$ et $u_{n+1} \\to L$ aussi.',
            },
            {
              kind: 'para',
              text:
                '**2.** Passe à la limite dans la relation de récurrence $u_{n+1} = a\\times ' +
                'u_n+b$, valable pour tout n. Chaque membre tend vers sa propre limite. Donc ' +
                '$L = a\\times L + b$ — L est un **point fixe** de la récurrence.',
            },
            {
              kind: 'para',
              text:
                '**3.** Isole $L$ : $L - aL = b$, soit $L(1-a) = b$. Comme $a \\neq 1$ (par ' +
                'définition d\'une suite récurrente affine), tu peux diviser par $1-a$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** $L = \\dfrac{b}{1-a}$. Cette valeur est la **seule candidate ' +
                'possible** pour la limite. C\'est la condition $|a| < 1$ (admise, non ' +
                'démontrée à ce niveau) qui garantit que la suite converge réellement vers elle.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'dilution répétée',
          formula:
            'Un aquarium contient un produit. Sa concentration (en mg/L) suit la récurrence ' +
            '$u_{n+1} = 0{,}7\\times u_n + 3$ : chaque semaine, 30 % du produit est filtré, ' +
            'puis 3 mg/L sont réintroduits par un apport extérieur constant. Avec $u_1 = 1$. ' +
            'Vers quelle concentration la situation se stabilise-t-elle à long terme ?',
          steps: [{ tag: '|a| = 0,7 < 1 — le régime permanent existe', text: '$L = \\dfrac{b}{1-a} = \\dfrac{3}{1-0{,}7} = \\dfrac{3}{0{,}3}$' }],
          result: {
            tag: 'résultat',
            text:
              'L = 10 mg/L. Quelle que soit la concentration de départ, la suite se rapproche ' +
              'indéfiniment de 10 mg/L sans jamais la dépasser. Ici, en partant de 1, elle y ' +
              'monte par en dessous.',
          },
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 1, label: '1' },
              { n: 2, value: 3.7, label: '3,7' },
              { n: 3, value: 5.59, label: '5,59' },
              { n: 4, value: 6.913, label: '6,91' },
              { n: 5, value: 7.839, label: '7,84' },
              { n: 6, value: 8.487, label: '8,49' },
              { n: 7, value: 8.941, label: '8,94' },
              { n: 8, value: 9.259, label: '9,26' },
              { n: 9, value: 9.481, label: '9,48' },
            ],
            connector: 'smooth',
            referenceLine: { value: 10, label: 'L=10' },
            xAxisLabel: 'n',
            yAxisLabel: 'u_n',
            caption: 'u_(n+1) = 0,7×u_n + 3, u1=1 — les termes se rapprochent du régime permanent L=10 sans jamais l\'atteindre',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — toujours vérifier |a| < 1 avant de calculer L',
          text:
            'Calculer $L = \\dfrac{b}{1-a}$ sans vérifier d\'abord que $|a| < 1$ est une erreur ' +
            'fréquente ! Si $|a| \\geq 1$, la formule produit quand même un nombre — mais ce ' +
            'nombre n\'est **pas** une limite. La suite diverge, et son régime permanent ' +
            'n\'existe pas, peu importe la valeur calculée.',
        },
        {
          kind: 'astuce',
          text:
            'Pour calculer les premiers termes après $u_1$, applique la récurrence pas à pas — ' +
            'il n\'existe pas de formule fermée simple en fonction de n pour cette famille de ' +
            'suites. $u_2 = a\\times u_1+b$, puis $u_3 = a\\times u_2+b$, et ainsi de suite.',
        },
        {
          kind: 'entrainement',
          title: 'Suite récurrente affine et régime permanent',
          generatorId: '5gen19',
          description: [
            'Pose la récurrence u_(n+1)=a·u_n+b à partir d\'un contexte de dosage ou de ' +
              'dilution. Détermine si le régime permanent existe et calcule-le. Puis calcule ' +
              'les termes suivants pas à pas.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 19. Suite récurrente affine et régime permanent »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Suite arithmétique** — $u_n = u_1 + (n-1)r$. Croissante si $r>0$, décroissante si ' +
        '$r<0$. Somme $S_n = n(u_1+u_n)/2$.',
      '**Suite géométrique** — $u_n = u_1\\times q^{n-1}$. Somme $S_n = u_1(1-q^n)/(1-q)$. ' +
        'Retrouver q depuis $q^k=a$ ? Vérifie la parité de k (0, 1 ou 2 solutions).',
      '**Convergence** — arithmétique : $\\pm\\infty$ selon le signe de r (jamais ' +
        'convergente, sauf r=0). Géométrique : 0 si $|q|<1$, $\\pm\\infty$ si $q>1$, n\'existe ' +
        'pas si $q\\leq-1$. Suite $P(n)/Q(n)$ : compare les degrés de P et Q.',
      '**Problèmes classiques** — reconnais d\'abord la nature de la suite (raison additive ' +
        'ou multiplicative), avant de choisir la formule.',
      '**Comparaison de deux suites** — balayage numérique jusqu\'au rang de bascule, en ' +
        'vérifiant que la condition est bien fausse au rang précédent. Traduis toujours le ' +
        'rang trouvé dans l\'unité du contexte.',
      '**Suite récurrente affine** — $u_{n+1}=a\\times u_n+b$. Régime permanent $L=b/(1-a)$, ' +
        'seulement si $|a|<1$. Sinon, la suite diverge et L n\'existe pas.',
    ],
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je bien utilisé (n−1), et non n, dans la formule générale — aussi bien pour une suite arithmétique que géométrique ?',
        'Pour une raison géométrique retrouvée par une racine d\'exposant pair : ai-je considéré les deux solutions possibles, ou vérifié qu\'aucune n\'existe ?',
        'Pour une limite géométrique : ai-je bien distingué q=−1 (borné, oscillant, pas de limite) de q<−1 (diverge) ?',
        'Pour un régime permanent : ai-je vérifié |a|<1 avant de calculer L, et pas seulement après ?',
      ],
    },
    forward:
      'Le prochain chapitre relie les suites aux limites de fonctions. La notion de ' +
      'convergence vue ici, pour un indice entier n qui tend vers l\'infini, se généralise à ' +
      'une variable réelle x — qui tend vers l\'infini, ou vers une valeur précise.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen41',
      description: [
        'Affirmations sur les suites arithmétiques et géométriques, la convergence, les ' +
          'problèmes classiques et les suites récurrentes affines. Choisis un thème, réponds ' +
          'vrai ou faux — la justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 41. Les suites — quiz vrai/faux »',
    },
  },
}
