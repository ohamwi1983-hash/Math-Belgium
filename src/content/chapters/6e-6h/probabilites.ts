import type { ChapterContent } from '../../types'

export const probabilites: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 6,
  title: 'Les probabilités',
  slug: 'probabilites',
  lede:
    "Mesurer la chance qu'un événement se produise, combiner plusieurs événements (union, " +
    'intersection, complémentaire), tenir compte d\'une information déjà connue ' +
    '(conditionnement) et remonter d\'un effet à sa cause la plus probable (théorème de Bayes) ' +
    '— quatre idées qui, ensemble, forment l\'outillage complet de ce chapitre.',

  sections: [
    {
      id: 'probabilitesensembles',
      number: 1,
      title: 'Probabilités et ensembles',
      kicker: '0 ≤ P(A) ≤ 1 — équiprobabilité : favorables / possibles',
      blocks: [
        {
          kind: 'definition',
          label: 'Définition — expérience aléatoire',
          items: [
            'Une expérience aléatoire est une expérience que l\'on peut répéter à volonté dans ' +
              "des conditions identiques, dont on connaît à l'avance l'ensemble des résultats " +
              'possibles, mais dont on ne peut prédire avec certitude le résultat dû au hasard. ' +
              'L\'ensemble de tous les résultats possibles est l\'univers, noté $\\Omega$ ; le ' +
              'résultat réellement observé est une issue.',
          ],
        },
        {
          kind: 'definition',
          label: 'Événement, et cas particuliers',
          items: [
            'Un événement est tout sous-ensemble de $\\Omega$ — souvent décrit par une ' +
              'proposition, réalisée dès qu\'on obtient un résultat qui lui est favorable. Un ' +
              'événement réduit à UN SEUL résultat est un événement élémentaire. L\'événement ' +
              'impossible ($\\emptyset$) ne se réalise jamais ; l\'événement certain ($\\Omega$) ' +
              'se réalise toujours. Deux événements qui se partagent TOUS les résultats ' +
              'possibles, sans en avoir aucun en commun, sont des événements contraires : le ' +
              'contraire de $A$ se note $\\bar{A}$, avec $A \\cup \\bar{A} = \\Omega$ et ' +
              '$A \\cap \\bar{A} = \\emptyset$.',
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — probabilité',
          items: [
            'La probabilité $P(A)$ d\'un événement $A$ mesure sa chance de se réaliser : ' +
              '$0 \\leq P(A) \\leq 1$, $P(\\Omega)=1$ (certitude), $P(\\emptyset)=0$ ' +
              '(impossibilité), $P(\\bar{A})=1-P(A)$ (contraire). En situation ' +
              'd\'ÉQUIPROBABILITÉ (tous les résultats également probables) : $P(A)$ = (nombre ' +
              'de cas favorables) / (nombre de cas possibles).',
          ],
        },
        {
          kind: 'piege',
          label: "Piège classique — vérifier l'équiprobabilité avant de compter",
          text:
            'Au lancer de 2 dés, $\\Omega=\\{2,3,\\ldots,12\\}$ (les 11 sommes possibles) — mais ' +
            'ces 11 résultats NE SONT PAS équiprobables : un total de 2 n\'est obtenu que par ' +
            '(1;1), soit 1 seule façon, alors qu\'un total de 9 est obtenu par (3;6),(4;5),' +
            '(5;4),(6;3), soit 4 façons. $P$(total=9) est donc PLUS GRANDE que $P$(total=2), ' +
            'jamais 1/11 dans les deux cas — la formule « favorables/possibles » exige TOUJOURS ' +
            'des résultats équiprobables, à vérifier avant tout calcul.',
        },
        { kind: 'subheading', text: 'Probabilité expérimentale (fréquentielle) et probabilité a priori' },
        {
          kind: 'definition',
          label: 'Deux façons d\'obtenir une probabilité',
          items: [
            'La probabilité a priori (ou intuitive) se calcule SANS expérimentation, par un ' +
              'raisonnement d\'équiprobabilité (comme ci-dessus). La probabilité expérimentale ' +
              '(ou fréquentielle) s\'obtient, à l\'inverse, en répétant l\'expérience un très ' +
              'grand nombre de fois : la FRÉQUENCE relative de l\'événement se stabilise alors ' +
              'autour d\'une valeur limite — c\'est cette valeur qui est retenue comme probabilité.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 1, label: '1' },
              { n: 3, value: 0.33, label: '0,33' },
              { n: 5, value: 0.6, label: '0,6' },
              { n: 10, value: 0.5, label: '0,5' },
              { n: 20, value: 0.45, label: '0,45' },
              { n: 30, value: 0.53, label: '0,53' },
              { n: 40, value: 0.48, label: '0,48' },
              { n: 50, value: 0.5, label: '0,5' },
            ],
            connector: 'straight',
            referenceLine: { value: 0.5, label: '0,5' },
            xAxisLabel: 'nombre de lancers',
            yAxisLabel: 'fréquence cumulée de « pile »',
            caption:
              'La fréquence cumulée de « pile » oscille de moins en moins et se stabilise près de 0,5.',
          },
        },
        {
          kind: 'astuce',
          text:
            'Pour une pièce ou un dé bien équilibrés, la probabilité a priori (1/2, 1/6, …) et ' +
            'la probabilité expérimentale (mesurée en répétant l\'expérience) convergent vers ' +
            'la même valeur — c\'est d\'ailleurs ainsi qu\'on détecte un dé ou une pièce ' +
            'truqués : la fréquence observée ne se stabilise PAS autour de la valeur a priori attendue.',
        },
        { kind: 'subheading', text: 'Représenter A∪B et A∩B' },
        {
          kind: 'illustration',
          illustration: { kind: 'vennDiagram', labelA: 'A', labelB: 'B', mode: 'highlightUnion', caption: '« A ou B » = $A \\cup B$ : réalisé dès que l\'UN AU MOINS des deux se réalise.' },
        },
        {
          kind: 'illustration',
          illustration: { kind: 'vennDiagram', labelA: 'A', labelB: 'B', mode: 'highlightIntersection', caption: '« A et B » = $A \\cap B$ : réalisé seulement si les DEUX se réalisent en même temps.' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vennDiagram',
            labelA: 'A',
            labelB: 'B',
            mode: 'counts',
            counts: { aOnly: '12', both: '6', bOnly: '9', neither: '13' },
            caption: 'Groupe de 40 personnes, $n(A)$=18, $n(B)$=15, $n(A \\cap B)$=6 : les 4 régions se partagent les 40 personnes sans chevauchement.',
          },
        },
        {
          kind: 'definition',
          label: 'Union, intersection, inclusion-exclusion',
          items: ['$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$'],
        },
        {
          kind: 'para',
          text:
            'On additionne les deux probabilités puis on RETIRE l\'intersection, comptée deux ' +
            'fois sinon (une fois dans $P(A)$, une fois dans $P(B)$). Cas particulier : si $A$ ' +
            'et $B$ sont INCOMPATIBLES ($P(A \\cap B)=0$), cette formule se réduit à la loi de ' +
            'la somme : $P(A \\cup B)=P(A)+P(B)$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi retirer l\'intersection',
          blocks: [
            {
              kind: 'para',
              text:
                'Tout élément de $A$ est soit dans $B$, soit pas, donc $A = (A \\cap \\bar{B}) ' +
                '\\cup (A \\cap B)$, une union disjointe — d\'où, les probabilités s\'additionnant ' +
                'pour une union disjointe, $P(A) = P(A \\cap \\bar{B}) + P(A \\cap B)$.',
            },
            {
              kind: 'para',
              text:
                'De même, par symétrie, $P(B) = P(\\bar{A} \\cap B) + P(A \\cap B)$. Or ' +
                '$A \\cup B = (A \\cap \\bar{B}) \\cup (\\bar{A} \\cap B) \\cup (A \\cap B)$, trois ' +
                'morceaux disjoints, donc $P(A \\cup B) = P(A \\cap \\bar{B})+P(\\bar{A} \\cap B)+P(A \\cap B)$.',
            },
            {
              kind: 'para',
              text:
                'En ajoutant les deux égalités ci-dessus, $P(A)+P(B) = [P(A \\cap \\bar{B})+P(A ' +
                '\\cap B)] + [P(\\bar{A} \\cap B)+P(A \\cap B)]$, le terme $P(A \\cap B)$ ' +
                'apparaît deux fois : il faut donc le retrancher une fois pour retrouver ' +
                'exactement $P(A \\cup B)$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu',
          formula: 'Dans un groupe de 40 personnes, $n(A)$=18, $n(B)$=15, $n(A \\cap B)$=6 :',
          steps: [],
          result: { tag: 'résultat', text: '$P(A \\cup B) = \\frac{18}{40} + \\frac{15}{40} - \\frac{6}{40} = \\frac{27}{40}$' },
        },
        {
          kind: 'piege',
          text:
            'Additionner $P(A)+P(B)$ SANS retirer $P(A \\cap B)$ donne ici 33/40 — FAUX, car les ' +
            '6 personnes de l\'intersection sont comptées deux fois. La bonne valeur est 27/40.',
        },
        { kind: 'subheading', text: 'Tableau à double entrée et complémentaire' },
        {
          kind: 'methode',
          label: 'Méthode — remplir les 4 cases',
          items: [
            'À partir de $n(A)$, $n(B)$, $n(A \\cap B)$ et du total $N$, les 4 régions se ' +
              'déduisent par soustraction : $n(A \\cap \\bar{B})=n(A)-n(A \\cap B)$, ' +
              '$n(\\bar{A} \\cap B)=n(B)-n(A \\cap B)$, $n(\\bar{A} \\cap \\bar{B})=N-n(A \\cup B)$.',
            'Avec l\'exemple ci-dessus : $n(A \\cap \\bar{B})$=12, $n(\\bar{A} \\cap B)$=9, ' +
              '$n(A \\cap B)$=6, $n(\\bar{A} \\cap \\bar{B})$=40−27=13 — la somme des 4 cases, ' +
              '12+9+6+13=40, retombe bien sur le total. Le tableau à double entrée range ces 9 ' +
              'valeurs d\'un coup : 4 d\'entre elles viennent directement de l\'énoncé (6, 15, ' +
              '18, 40), les 5 autres se déduisent par soustraction.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', 'B', 'B̄', 'Total'],
          rows: [
            ['A', '6', '12', '18'],
            ['Ā', '9', '13', '22'],
            ['Total', '15', '25', '40'],
          ],
        },
        {
          kind: 'piege',
          text:
            'La case « ni $A$ ni $B$ » vaut $1-P(A \\cup B)$, JAMAIS $1-P(A)-P(B)$ (qui oublie ' +
            'que $A$ et $B$ se chevauchent) : ici 1−27/40=13/40, pas 1−18/40−15/40=7/40.',
        },
        {
          kind: 'methode',
          label: 'Probabilité conditionnelle',
          items: [
            'La probabilité de $A$ SACHANT $B$ (l\'information « $B$ est réalisé » est déjà ' +
              'connue) se note $P(A|B)$ : $P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}$.',
            'Avec l\'exemple : $P(A|B)$ = 6/15 = 0,4, alors que $P(B|A)$ = 6/18 = 1/3 — le ' +
              'numérateur est le même, mais pas le dénominateur.',
          ],
        },
        {
          kind: 'piege',
          text:
            '$P(A|B) \\neq P(B|A)$ en général — confondre les deux sens de conditionnement est ' +
            'L\'erreur la plus fréquente de ce chapitre (elle revient dans chaque section).',
        },
        { kind: 'subheading', text: 'Indépendance' },
        {
          kind: 'definition',
          label: 'Définition — événements indépendants',
          items: [
            '$A$ et $B$ sont indépendants si l\'un n\'influence pas l\'autre : ' +
              '$P(A \\cap B) = P(A) \\times P(B) \\iff P(A|B) = P(A)$.',
            'Dans l\'exemple des 40 personnes : $P(A) \\times P(B)$ = 0,45×0,375 = 0,16875, ' +
              'différent de $P(A \\cap B)$=0,15 — $A$ et $B$ ne sont donc PAS indépendants ici.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — jeu de 52 cartes',
          formula:
            '$A$ = « tirer un cœur » ($P(A)$=13/52), $B$ = « tirer une figure » ($P(B)$=12/52). ' +
            'Il y a exactement 3 figures de cœur, donc $P(A \\cap B)$=3/52.',
          steps: [{ tag: 'test d\'indépendance', text: '$P(A) \\times P(B) = \\frac{13}{52} \\times \\frac{12}{52} = \\frac{3}{52} = P(A \\cap B)$' }],
          result: { tag: 'résultat', text: '$A$ et $B$ SONT indépendants — un résultat que seul le calcul, jamais l\'intuition, permet de confirmer.' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — incompatibilité ≠ indépendance',
          text:
            'Deux événements INCOMPATIBLES ($A \\cap B=\\emptyset$, ils ne peuvent jamais se ' +
            'produire ensemble) de probabilités non nulles ne sont JAMAIS indépendants : ' +
            '$P(A \\cap B)$=0 alors que $P(A) \\times P(B)>0$, l\'égalité échoue toujours. Les ' +
            'événements $A \\cap \\bar{B}$ et $\\bar{A} \\cap B$, par exemple, sont TOUJOURS ' +
            'incompatibles (un élément ne peut pas à la fois appartenir à $A$ et ne pas y ' +
            'appartenir) — donc jamais indépendants non plus. Incompatibilité et indépendance ' +
            'sont deux notions distinctes, jamais équivalentes.',
        },
        {
          kind: 'astuce',
          label: 'L\'indépendance se vérifie, elle ne se devine jamais',
          text:
            'Pour savoir si deux événements sont indépendants, il faut toujours comparer ' +
            'NUMÉRIQUEMENT $P(A \\cap B)$ à $P(A) \\times P(B)$ — jamais se fier à une ' +
            'impression intuitive (l\'exemple des cartes ci-dessus est justement un cas où l\'intuition ne suffit pas).',
        },
        {
          kind: 'entrainement',
          title: 'Probabilités et ensembles',
          generatorId: '6gen30',
          description: ['Combine union, intersection, complémentaire et tableau à double entrée sur des situations variées.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 30. Probabilités et ensembles »',
        },
      ],
    },

    {
      id: 'tiragesarbres',
      number: 2,
      title: 'Tirages, arbres et dénombrement',
      kicker: 'chemin → produit ; événement (plusieurs chemins) → somme',
      blocks: [
        {
          kind: 'definition',
          label: 'Définition — arbre pondéré',
          items: [
            'Un arbre pondéré représente une suite d\'épreuves : chaque branche porte la ' +
              'probabilité de passer d\'un nœud à l\'autre. Deux règles gouvernent sa lecture : ' +
              'probabilité d\'un CHEMIN = produit des probabilités des branches traversées ; ' +
              'probabilité d\'un ÉVÉNEMENT = somme des probabilités des chemins qui y mènent ' +
              '(loi des probabilités totales).',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'weightedTree',
            firstLevel: [
              { label: 'R', prob: '5/8' },
              { label: 'B', prob: '3/8' },
            ],
            secondLevel: [
              { fromFirst: 0, label: 'R', prob: '4/7', pathProb: '20/56' },
              { fromFirst: 0, label: 'B', prob: '3/7', pathProb: '15/56' },
              { fromFirst: 1, label: 'R', prob: '5/7', pathProb: '15/56' },
              { fromFirst: 1, label: 'B', prob: '2/7', pathProb: '6/56' },
            ],
            caption:
              'Urne à 5 boules rouges, 3 bleues (8 au total), 2 tirages successifs SANS remise : la composition change après le 1er tirage.',
          },
        },
        {
          kind: 'piege',
          text:
            'La probabilité d\'un CHEMIN s\'obtient en MULTIPLIANT les probabilités des ' +
            'branches, jamais en les additionnant — c\'est l\'inverse pour la probabilité d\'un ' +
            'ÉVÉNEMENT (plusieurs chemins), qui s\'obtient en ADDITIONNANT.',
        },
        { kind: 'subheading', text: 'Avec ou sans remise : tout change' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Avec remise : l\'urne retrouve toujours sa composition initiale, les tirages sont INDÉPENDANTS.',
            'Sans remise : la composition change après chaque tirage, les tirages ne sont JAMAIS indépendants.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — P(2 rouges)',
          formula: '',
          steps: [
            { tag: 'avec remise', text: '$P(RR) = (5/8)^2 = 25/64$ (indépendance)' },
            { tag: 'sans remise', text: '$P(RR) = (5/8) \\times (4/7) = 5/14$ — au 2e tirage il ne reste que 7 boules, dont 4 rouges' },
          ],
          result: { tag: '', text: '', isEmpty: true },
        },
        {
          kind: 'piege',
          text:
            'Utiliser la même probabilité 5/8 au second tirage SANS remise (comme si de rien ' +
            'n\'était) est l\'erreur la plus fréquente de cette section — la bonne valeur, 4/7, ' +
            'se lit directement sur la 2e branche de l\'arbre.',
        },
        {
          kind: 'methode',
          label: '« Exactement une rouge » — combiner deux chemins',
          items: [
            'Deux chemins de l\'arbre mènent à « exactement une rouge » : $RB$ et $BR$. Sans ' +
              'remise : $P$(exactement 1 rouge) = $P(RB)+P(BR) = \\frac{5}{8} \\times \\frac{3}{7} + ' +
              '\\frac{3}{8} \\times \\frac{5}{7} = \\frac{15}{56}+\\frac{15}{56} = \\frac{15}{28}$.',
            'Et par le complément, $P$(au moins 1 rouge) = $1-P(BB) = 1-6/56 = 25/28$.',
          ],
        },
        {
          kind: 'astuce',
          text:
            'La somme des probabilités de TOUS les chemins d\'un arbre vaut toujours 1 (sans ' +
            'remise : 20/56+15/56+15/56+6/56=1) — un excellent moyen de repérer une erreur de ' +
            'calcul avant de répondre.',
        },
        { kind: 'subheading', text: 'Une autre façon de dénombrer : le diagramme cartésien' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand une expérience combine 2 tirages INDÉPENDANTS à résultats numériques (2 dés, ' +
              'par exemple), on peut représenter les $n \\times m$ issues comme des points ' +
              'd\'une grille : le résultat du 1er tirage en abscisse, celui du 2e en ordonnée. ' +
              'Chaque point de la grille est une issue équiprobable — il suffit alors de ' +
              'COMPTER les points qui satisfont la condition cherchée.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'outcomeGrid',
            xMax: 6,
            yMax: 6,
            xAxisLabel: '1er dé',
            yAxisLabel: '2e dé',
            highlighted: [
              { x: 1, y: 4 },
              { x: 2, y: 3 },
              { x: 3, y: 2 },
              { x: 4, y: 1 },
            ],
            caption: 'Les 36 issues du lancer de 2 dés à 6 faces : les 4 points en évidence sont ceux dont la somme vaut 5.',
          },
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu',
          formula: '',
          steps: [],
          result: {
            tag: 'résultat',
            text:
              'Sur les 36 couples équiprobables, exactement 4 donnent une somme de 5 : (1;4), ' +
              '(2;3), (3;2), (4;1). D\'où $P$(somme=5) = 4/36 = 1/9.',
          },
        },
        { kind: 'subheading', text: 'Dénombrement — permutations et dérangements' },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Le nombre de façons de ranger $n$ objets distincts (une PERMUTATION) est ' +
              '$n! = n \\times (n-1) \\times \\ldots \\times 1$. Un dérangement est une ' +
              'permutation où AUCUN objet ne reste à sa place initiale ; leur nombre se note ' +
              '$D(n)$ — $D(n) \\neq n!$ (par exemple $D(4)$=9, très différent de 4!=24).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — 4 lettres, 4 enveloppes',
          formula: '',
          steps: [
            { tag: 'total', text: '4!=24 répartitions possibles au total' },
            { tag: 'tout correct', text: 'une seule est ENTIÈREMENT correcte, donc $P$(tout correct)=1/24' },
            { tag: 'aucune correcte', text: '$P = D(4)/4! = 9/24 = 3/8$' },
            { tag: 'exactement 2 correctes', text: 'on choisit lesquelles ($C(4,2)$=6 façons), puis les 2 restantes forment un dérangement complet ($D(2)$=1 façon) : $P=(6 \\times 1)/24=1/4$' },
          ],
          result: { tag: '', text: '', isEmpty: true },
        },
        {
          kind: 'piege',
          text:
            '« Exactement 3 lettres sur 4 à la bonne place » est structurellement IMPOSSIBLE ' +
            '(probabilité nulle) : si 3 lettres sont bien placées, la 4e l\'est forcément ' +
            'aussi, il ne reste qu\'une seule enveloppe pour une seule lettre.',
        },
        {
          kind: 'entrainement',
          title: 'Tirages, arbres et dénombrement',
          generatorId: '6gen31',
          description: ['Arbres avec ou sans remise, diagrammes cartésiens, permutations et dérangements.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 31. Tirages, arbres et dénombrement »',
        },
      ],
    },

    {
      id: 'independancebayes',
      number: 3,
      title: 'Indépendance, conditionnement et Bayes',
      kicker: 'P(A|B) = P(B|A)×P(A) / P(B)',
      blocks: [
        {
          kind: 'definition',
          label: 'Définition — partition et loi des probabilités totales',
          items: [
            'Une partition de l\'univers est une famille d\'événements deux à deux ' +
              'INCOMPATIBLES dont l\'union recouvre l\'univers ENTIER (les deux conditions sont ' +
              'indispensables). Si $B_1,\\ldots,B_n$ forment une partition, la loi des ' +
              'probabilités totales donne, pour tout événement $A$ : ' +
              '$P(A) = \\displaystyle\\sum_{i=1}^{n} P(A|B_i) \\times P(B_i)$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'weightedTree',
            firstLevel: [
              { label: 'malade', prob: '0,1' },
              { label: 'non malade', prob: '0,9' },
            ],
            secondLevel: [
              { fromFirst: 0, label: 'T⁺', prob: '0,9', pathProb: '0,09', highlight: true },
              { fromFirst: 0, label: 'T⁻', prob: '0,1', pathProb: '0,01' },
              { fromFirst: 1, label: 'T⁺', prob: '0,2', pathProb: '0,18', highlight: true },
              { fromFirst: 1, label: 'T⁻', prob: '0,8', pathProb: '0,72' },
            ],
            caption:
              'Test médical : P(malade)=0,1, P(T⁺|malade)=0,9, P(T⁺|non malade)=0,2 — les 2 branches menant à T⁺ se combinent.',
          },
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — test médical',
          formula:
            'Pour un test avec $P(malade)$=0,1, $P(T^+|malade)$=0,9 et $P(T^+|\\text{non malade})$=0,2, ' +
            'la loi des probabilités totales (partition « malade »/« non malade ») donne :',
          steps: [],
          result: { tag: 'résultat', text: '$P(T^+) = 0,9 \\times 0,1 + 0,2 \\times 0,9 = 0,09+0,18 = 0,27$' },
        },
        {
          kind: 'definition',
          label: 'Théorème de Bayes',
          items: [
            '$P(A|B) = \\dfrac{P(B|A) \\times P(A)}{P(B)}$. Bayes permet de RETOURNER un ' +
              'conditionnement : connaissant $P(B|A)$, on en déduit $P(A|B)$ — utile quand ' +
              'seule la probabilité « dans le mauvais sens » est directement connue.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi la formule fonctionne',
          blocks: [
            {
              kind: 'para',
              text:
                'Par définition de la probabilité conditionnelle appliquée à $A$ sachant $B$ : ' +
                '$P(A \\cap B) = P(A|B) \\times P(B)$. La même définition, appliquée cette fois ' +
                'à $B$ sachant $A$, donne $P(A \\cap B) = P(B|A) \\times P(A)$.',
            },
            {
              kind: 'para',
              text:
                'Les deux membres de droite valent tous deux $P(A \\cap B)$ : ils sont donc ' +
                'égaux entre eux. En isolant $P(A|B)$ dans $P(A|B) \\times P(B) = P(B|A) \\times ' +
                'P(A)$, on obtient exactement la formule de Bayes.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — remonter du test à la maladie',
          formula: 'Sachant le résultat positif, quelle est la probabilité réelle d\'être malade ?',
          steps: [],
          result: { tag: 'résultat', text: '$P(malade|T^+) = \\dfrac{P(T^+|malade) \\times P(malade)}{P(T^+)} = \\dfrac{0,9 \\times 0,1}{0,27} = \\dfrac{1}{3}$' },
        },
        {
          kind: 'piege',
          text:
            '$P(malade|T^+) \\approx 0,33$ est TRÈS différent de $P(T^+|malade) = 0,9$ — ' +
            'confondre ces deux probabilités conditionnelles est LE piège central du théorème ' +
            'de Bayes. Un test « fiable à 90 % » ($P(T^+|malade)$=0,9) ne signifie PAS qu\'un ' +
            'résultat positif garantit 90 % de chances d\'être malade : tout dépend aussi de la ' +
            'rareté de la maladie ($P(malade)$=0,1, ici assez rare) et du taux de faux positifs.',
        },
        {
          kind: 'piege',
          text:
            'Une partition exige que les événements recouvrent TOUT l\'univers, pas seulement ' +
            'qu\'ils aient une probabilité non nulle — oublier un morceau de la partition dans ' +
            'la loi des probabilités totales fait obtenir un résultat trop petit, sans aucun ' +
            'signal d\'erreur visible.',
        },
        {
          kind: 'methode',
          label: 'Lire P(A|B) directement dans un tableau à double entrée',
          items: [
            'Dans un tableau à double entrée (section 1), $P(A|B)$ se lit directement en ' +
              'restreignant l\'attention à la SEULE ligne (ou colonne) de $B$ : c\'est ' +
              'l\'effectif de la case $A \\cap B$ divisé par le TOTAL de cette ligne — sans ' +
              'même repasser par la formule $P(A \\cap B)/P(B)$, puisque diviser numérateur et ' +
              'dénominateur par le même effectif total ne change pas le résultat.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — école de musique',
          formula:
            'Une école propose piano et guitare ; elle compte 60 inscrits dont 38 filles, et ' +
            'chaque élève ne suit qu\'un seul instrument. Le professeur de guitare a 28 élèves, ' +
            'dont 15 garçons — le tableau à double entrée se remplit avec ces 4 valeurs ' +
            'd\'énoncé (60, 38, 28, 15), les 5 autres cases se déduisant par soustraction.',
          steps: [],
          result: { tag: '', text: '', isEmpty: true },
        },
        {
          kind: 'featureTable',
          headers: ['', 'Piano', 'Guitare', 'Total'],
          rows: [
            ['Garçons', '7', '15', '22'],
            ['Filles', '25', '13', '38'],
            ['Total', '32', '28', '60'],
          ],
        },
        {
          kind: 'para',
          text:
            'Soit $A$ « l\'élève étudie la guitare » et $B$ « l\'élève est un garçon ». Sachant ' +
            'qu\'un élève étudie la guitare (on reste dans la SEULE colonne « Guitare », de ' +
            'total 28), la probabilité qu\'il soit un garçon vaut $P(B|A) = \\dfrac{15}{28}$.',
        },
        {
          kind: 'methode',
          label: 'Indépendance, reformulée avec le conditionnement',
          items: [
            '$A$ est indépendant de $B$ si et seulement si $P(A|B) = P(A)$ — une ÉGALITÉ, ' +
              'jamais une inégalité (une inégalité signale au contraire une DÉPENDANCE). Cette ' +
              'caractérisation est équivalente à celle vue en section 1 ($P(A \\cap B)=P(A) ' +
              '\\times P(B)$), et se vérifie de la même façon : toujours par un calcul, jamais par intuition.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les trois écritures de l\'indépendance sont équivalentes',
          blocks: [
            {
              kind: 'para',
              text:
                'On part de $P(A|B) = P(A)$ (définition du cours), soit, par définition de la ' +
                'probabilité conditionnelle, $\\dfrac{P(A \\cap B)}{P(B)} = P(A)$. En ' +
                'multipliant les deux membres par $P(B)$ : $P(A \\cap B) = P(A) \\times P(B)$.',
            },
            {
              kind: 'para',
              text:
                'Le même calcul, mené en isolant cette fois $P(B|A)$ au lieu de $P(A|B)$, ' +
                'montre que $P(A \\cap B)=P(A) \\times P(B)$ entraîne aussi $P(B|A)=P(B)$. Les ' +
                'trois égalités — $P(A|B)=P(A)$, $P(A \\cap B)=P(A) \\times P(B)$, ' +
                '$P(B|A)=P(B)$ — sont donc rigoureusement équivalentes : n\'importe laquelle ' +
                'peut servir à définir ou à vérifier l\'indépendance. En pratique, c\'est la 2e ' +
                'forme qui sert de DÉFINITION officielle, car elle reste valable même quand ' +
                '$P(A)$ ou $P(B)$ vaut 0 (les deux autres formes exigent alors une division par 0, impossible).',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Deux probabilités conditionnées par le MÊME événement se complètent',
          text:
            '$P(malade|T^+) + P(\\text{non malade}|T^+) = 1$ TOUJOURS (même événement ' +
            'conditionnant $T^+$ des deux côtés). En revanche $P(malade|T^+) + ' +
            'P(malade|\\text{non } T^+)$ n\'a AUCUNE raison de valoir 1 — les deux ' +
            'probabilités sont conditionnées par des événements différents.',
        },
        {
          kind: 'entrainement',
          title: 'Indépendance, conditionnement et Bayes',
          generatorId: '6gen32',
          description: ['Théorème de Bayes, loi des probabilités totales, lecture directe dans un tableau à double entrée.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 32. Indépendance, conditionnement et Bayes »',
        },
      ],
    },

    {
      id: 'probabilitesproblemes',
      number: 4,
      title: 'Probabilités : problèmes',
      kicker: 'P(X=k) = C(n,k)×pᵏ×(1−p)ⁿ⁻ᵏ',
      blocks: [
        {
          kind: 'definition',
          label: 'Épreuves répétées et indépendantes',
          items: [
            'Pour $n$ répétitions INDÉPENDANTES d\'une même épreuve à deux issues (succès de ' +
              'probabilité $p$, échec $1-p$), la probabilité d\'obtenir EXACTEMENT $k$ succès ' +
              'est $P(X=k) = C(n,k) \\times p^k \\times (1-p)^{n-k}$. Le coefficient $C(n,k)$ ' +
              'compte le nombre de façons de choisir QUELS $k$ essais réussissent parmi les $n$ ' +
              '— sans lui, on ne compte qu\'un seul agencement particulier au lieu de tous.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'histogram',
            bars: [
              { from: 0, width: 1, height: 0.16807 },
              { from: 1, width: 1, height: 0.36015 },
              { from: 2, width: 1, height: 0.3087 },
              { from: 3, width: 1, height: 0.1323 },
              { from: 4, width: 1, height: 0.02835 },
              { from: 5, width: 1, height: 0.00243 },
            ],
            xAxisLabel: 'k',
            yAxisLabel: 'P(X=k)',
            caption: 'Distribution de P(X=k) pour n=5 tirs, p=0,3 : les 6 barres (k=0 à 5) totalisent une probabilité de 1.',
          },
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — tireur, n=5, p=0,3',
          formula: '',
          steps: [],
          result: { tag: 'résultat', text: '$P(X=2) = C(5,2) \\times 0,3^2 \\times 0,7^3 = 10 \\times 0,09 \\times 0,343 = 0,3087$' },
        },
        {
          kind: 'piege',
          text:
            'Oublier $C(5,2)$=10 donne $0,3^2 \\times 0,7^3=0,03087$ — un résultat 10 fois trop ' +
            'petit. Le coefficient binomial n\'est JAMAIS optionnel dès que $0<k<n$.',
        },
        {
          kind: 'methode',
          label: '« Au moins un » : toujours par le complément',
          items: [
            '$P$(au moins un succès) se calcule par le complément de « aucun succès », JAMAIS ' +
              'en additionnant des probabilités individuelles (qui dépasserait facilement 1) : ' +
              '$P(\\text{au moins 1}) = 1 - P(X=0) = 1-(1-p)^n$.',
            'Avec l\'exemple : $1-0,7^5 = 1-0,16807 = 0,83193$.',
          ],
        },
        {
          kind: 'piege',
          text:
            '$P(\\text{au moins 1}) = 5 \\times p = 1,5$ est IMPOSSIBLE (une probabilité ne ' +
            'dépasse jamais 1) — cette méthode « additionner les p » est toujours fausse ; la ' +
            'seule méthode fiable est le complément, quelle que soit la valeur de $p$ (le ' +
            'complément fonctionne pour tout $p$ entre 0 et 1, pas seulement $p$=0,5).',
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — action boursière, n=3, p=0,6',
          formula: '',
          steps: [
            { tag: 'P(X=0)', text: '$0,4^3=0,064$' },
            { tag: 'P(X=1)', text: '$C(3,1) \\times 0,6 \\times 0,4^2=0,288$' },
            { tag: 'P(X=2)', text: '$C(3,2) \\times 0,6^2 \\times 0,4=0,432$' },
            { tag: 'P(X=3)', text: '$0,6^3=0,216$' },
          ],
          result: { tag: 'résultat', text: 'Somme : 0,064+0,288+0,432+0,216 = 1 (ces 4 valeurs couvrent tous les cas possibles, disjoints deux à deux).' },
        },
        { kind: 'subheading', text: 'Dénombrement ordonné vs non ordonné' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Choisir $k$ éléments parmi $n$ SANS tenir compte de l\'ordre : $C(n,k)$ façons. EN ' +
              'tenant compte de l\'ordre (1er choisi, 2e, …) : $A(n,k) = C(n,k) \\times k!$ ' +
              'façons — chaque groupe non ordonné se décline en $k!$ ordres possibles.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — choisir 3 livres parmi 5',
          formula: '',
          steps: [{ tag: 'non ordonné', text: '$C(5,3) = 5!/(3! \\times 2!) = 10$' }],
          result: { tag: 'ordonné', text: '$A(5,3) = 5 \\times 4 \\times 3 = 60 = C(5,3) \\times 3! = 10 \\times 6$' },
        },
        {
          kind: 'piege',
          text:
            'Multiplier $C(n,k)$ par $k$ (et non par $k!$) pour passer au dénombrement ordonné ' +
            'est une erreur fréquente : ici 10×3=30, très loin des 60 façons réellement ' +
            'ordonnées — c\'est bien $k!$=3!=6 qu\'il faut utiliser, pas $k$=3.',
        },
        {
          kind: 'entrainement',
          title: 'Probabilités — problèmes',
          generatorId: '6gen33',
          description: ['Épreuves répétées (loi binomiale), « au moins un », dénombrement ordonné et non ordonné.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 33. Probabilités — problèmes »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Probabilité', '0≤P(A)≤1 ; équiprobabilité : favorables/possibles'],
        ['Union', 'P(A∪B)=P(A)+P(B)−P(A∩B)'],
        ['Complémentaire', 'P(Ā∩B̄)=1−P(A∪B), jamais 1−P(A)−P(B)'],
        ['Conditionnement', 'P(A|B)=P(A∩B)/P(B) ≠ P(B|A)'],
        ['Indépendance', 'P(A∩B)=P(A)×P(B) — toujours vérifiée, jamais devinée'],
        ['Incompatibilité', 'P(A∩B)=0 ⟹ jamais indépendant'],
        ['Arbre pondéré', 'chemin → produit ; événement → somme'],
        ['Avec/sans remise', 'avec remise → indépendant ; sans remise → jamais'],
        ['Dérangement', 'D(n) ≠ n! ; D(4)=9'],
        ['Probabilités totales', 'P(A)=∑P(A|Bᵢ)×P(Bᵢ) sur une partition'],
        ['Théorème de Bayes', 'P(A|B)=P(B|A)×P(A)/P(B)'],
        ['Épreuves répétées', 'P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ'],
        ['Dénombrement', 'non ordonné C(n,k) ; ordonné A(n,k)=C(n,k)×k!'],
      ],
    },
    entrainement: {
      kind: 'entrainement',
      title: 'Les probabilités — quiz vrai/faux',
      generatorId: '6gen69',
      description: ['Quiz de révision transversal à tout le chapitre.'],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 69. Quiz vrai/faux — Les probabilités »',
    },
  },
}
