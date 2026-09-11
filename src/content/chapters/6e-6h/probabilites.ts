import type { ChapterContent } from '../../types'

export const probabilites: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 6,
  title: 'Les probabilités',
  slug: 'probabilites',
  lede:
    "Mesurer la chance qu'un événement se produise. Combiner plusieurs événements (union, " +
    'intersection, complémentaire). Tenir compte d\'une info déjà connue (conditionnement). ' +
    'Remonter d\'un effet à sa cause la plus probable (théorème de Bayes). Quatre outils, un ' +
    'seul chapitre.',

  sections: [
    {
      id: 'probabilitesensembles',
      number: 1,
      title: 'Probabilités et ensembles',
      kicker: '0 ≤ P(A) ≤ 1 — équiprobabilité : favorables / possibles',
      blocks: [
        { kind: 'video', title: 'Les probabilités' },
        {
          kind: 'intuition',
          label: 'Pour visualiser une expérience aléatoire',
          text:
            'Imagine un sac opaque rempli de billes de couleurs différentes. Tu ne sais jamais ' +
            'à l\'avance quelle bille tu vas tirer — mais tu sais très bien quelles couleurs ' +
            'sont dans le sac. C\'est exactement ça, une expérience aléatoire : tu connais ' +
            'toutes les issues possibles, sans savoir laquelle va sortir.',
        },
        {
          kind: 'definition',
          label: 'Définition — expérience aléatoire',
          items: [
            'Une expérience aléatoire, tu peux la répéter autant de fois que tu veux, dans les ' +
              'mêmes conditions. Tu connais à l\'avance TOUS les résultats possibles — mais ' +
              'jamais lequel va sortir, à cause du hasard. L\'ensemble de tous les résultats ' +
              'possibles s\'appelle l\'univers, noté $\\Omega$. Le résultat que tu observes ' +
              'réellement est une issue.',
          ],
        },
        {
          kind: 'definition',
          label: 'Événement, et cas particuliers',
          items: [
            'Un événement, c\'est n\'importe quel sous-ensemble de $\\Omega$ — souvent décrit ' +
              'par une phrase, réalisée dès que le résultat obtenu lui est favorable. Un ' +
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
            '$P(A)$ mesure la chance que $A$ se réalise : $0 \\leq P(A) \\leq 1$, ' +
              '$P(\\Omega)=1$ (certitude), $P(\\emptyset)=0$ (impossibilité), ' +
              '$P(\\bar{A})=1-P(A)$ (contraire). En situation d\'ÉQUIPROBABILITÉ (tous les ' +
              'résultats également probables), c\'est simple : $P(A)$ = (nombre de cas ' +
              'favorables) / (nombre de cas possibles).',
          ],
        },
        {
          kind: 'piege',
          label: "Piège classique — vérifier l'équiprobabilité avant de compter",
          text:
            'Au lancer de 2 dés, $\\Omega=\\{2,3,\\ldots,12\\}$ (les 11 sommes possibles) — mais ' +
            'ces 11 résultats NE SONT PAS équiprobables ! Un total de 2 ne s\'obtient que par ' +
            '(1;1), une seule façon. Un total de 9 s\'obtient par (3;6), (4;5), (5;4), (6;3) — ' +
            '4 façons. $P$(total=9) est donc PLUS GRANDE que $P$(total=2), jamais 1/11 dans les ' +
            'deux cas. La formule « favorables/possibles » n\'est valable QUE si les résultats ' +
            'sont équiprobables — toujours à vérifier avant de compter.',
        },
        { kind: 'subheading', text: 'Probabilité expérimentale (fréquentielle) et probabilité a priori' },
        {
          kind: 'definition',
          label: 'Deux façons d\'obtenir une probabilité',
          items: [
            'La probabilité a priori (ou intuitive) se calcule SANS rien expérimenter, juste ' +
              'par un raisonnement d\'équiprobabilité (comme ci-dessus). La probabilité ' +
              'expérimentale (ou fréquentielle) fonctionne à l\'inverse : tu répètes ' +
              'l\'expérience un très grand nombre de fois, et la FRÉQUENCE relative de ' +
              'l\'événement se stabilise autour d\'une valeur limite — c\'est cette valeur que ' +
              'tu retiens comme probabilité.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'frequencyStabilization',
            frequencies: [
              0.7, 0.55, 0.5, 0.575, 0.56, 0.567, 0.557, 0.55, 0.522, 0.49, 0.5, 0.508, 0.508,
              0.493, 0.487, 0.469, 0.476, 0.472, 0.474, 0.485, 0.5, 0.5, 0.487, 0.496, 0.5, 0.504,
            ],
            step: 10,
            target: { value: 0.5, label: '0,5' },
            yMin: 0.3,
            yMax: 0.75,
            xTicks: [50, 100, 150, 200, 250],
            xAxisLabel: 'nombre de répétitions',
            yAxisLabel: 'fréquence',
            caption:
              '26 élèves répètent chacun 10 fois « lancer une pièce » : la fréquence cumulée de ' +
              '« pile » oscille de moins en moins et se stabilise près de 0,5.',
          },
        },
        {
          kind: 'astuce',
          label: 'Les deux méthodes doivent converger',
          text:
            'Pour une pièce ou un dé bien équilibrés, la probabilité a priori (1/2, 1/6, …) et ' +
            'la probabilité expérimentale (mesurée en répétant l\'expérience) convergent vers ' +
            'la même valeur. C\'est même comme ça qu\'on détecte un dé ou une pièce truqués : ' +
            'la fréquence observée ne se stabilise PAS autour de la valeur a priori attendue.',
        },
        { kind: 'subheading', text: 'Représenter A∪B et A∩B' },
        {
          kind: 'illustrationGroup',
          items: [
            { kind: 'vennDiagram', labelA: 'A', labelB: 'B', mode: 'highlightUnion', caption: '« A ou B » = $A \\cup B$ : réalisé dès que l\'UN AU MOINS des deux se réalise.' },
            { kind: 'vennDiagram', labelA: 'A', labelB: 'B', mode: 'highlightIntersection', caption: '« A et B » = $A \\cap B$ : réalisé seulement si les DEUX se réalisent en même temps.' },
          ],
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
            'Tu additionnes les deux probabilités, puis tu RETIRES l\'intersection — sinon elle ' +
            'est comptée deux fois (une fois dans $P(A)$, une fois dans $P(B)$). Cas ' +
            'particulier : si $A$ et $B$ sont INCOMPATIBLES ($P(A \\cap B)=0$), la formule se ' +
            'simplifie en loi de la somme : $P(A \\cup B)=P(A)+P(B)$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi retirer l\'intersection',
          blocks: [
            {
              kind: 'para',
              text:
                'Tout élément de $A$ est soit dans $B$, soit pas : $A = (A \\cap \\bar{B}) \\cup ' +
                '(A \\cap B)$, une union disjointe. Les probabilités s\'additionnent pour une ' +
                'union disjointe, donc $P(A) = P(A \\cap \\bar{B}) + P(A \\cap B)$.',
            },
            {
              kind: 'para',
              text:
                'Par symétrie, $P(B) = P(\\bar{A} \\cap B) + P(A \\cap B)$. Et ' +
                '$A \\cup B = (A \\cap \\bar{B}) \\cup (\\bar{A} \\cap B) \\cup (A \\cap B)$ — ' +
                'trois morceaux disjoints — donc $P(A \\cup B) = P(A \\cap \\bar{B})+P(\\bar{A} \\cap B)+P(A \\cap B)$.',
            },
            {
              kind: 'para',
              text:
                'En ajoutant les deux égalités précédentes : $P(A)+P(B) = [P(A \\cap \\bar{B})+P(A ' +
                '\\cap B)] + [P(\\bar{A} \\cap B)+P(A \\cap B)]$. Le terme $P(A \\cap B)$ ' +
                'apparaît deux fois — il faut donc le retrancher une fois pour retomber ' +
                'exactement sur $P(A \\cup B)$.',
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
            'Additionner $P(A)+P(B)$ SANS retirer $P(A \\cap B)$ donne 33/40 ici — FAUX ! Les 6 ' +
            'personnes de l\'intersection sont comptées deux fois. La bonne valeur reste 27/40.',
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
              'valeurs d\'un coup : 4 viennent directement de l\'énoncé (6, 15, 18, 40) et ' +
              'restent en noir, les 5 autres se déduisent par soustraction et sont mises en évidence.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', 'B', 'B̄', 'Total'],
          rows: [
            ['A', '6', { text: '12', tone: 'good' }, '18'],
            ['Ā', { text: '9', tone: 'good' }, { text: '13', tone: 'good' }, { text: '22', tone: 'good' }],
            ['Total', '15', { text: '25', tone: 'good' }, '40'],
          ],
        },
        {
          kind: 'piege',
          text:
            'La case « ni $A$ ni $B$ » vaut $1-P(A \\cup B)$, JAMAIS $1-P(A)-P(B)$ — cette ' +
            'dernière formule oublie que $A$ et $B$ se chevauchent ! Ici : 1−27/40=13/40, pas ' +
            '1−18/40−15/40=7/40.',
        },
        {
          kind: 'intuition',
          label: 'Conditionner, c\'est zoomer',
          text:
            '$P(A|B)$, c\'est zoomer sur le seul monde où $B$ est déjà vrai : tu oublies ' +
            'temporairement tout le reste de $\\Omega$, et tu recalcules une proportion À ' +
            'L\'INTÉRIEUR de $B$ uniquement. C\'est exactement ce qui change entre $P(A)$ et ' +
            '$P(A|B)$ — le dénominateur passe du total $N$ au seul total de $B$.',
        },
        {
          kind: 'methode',
          label: 'Probabilité conditionnelle',
          items: [
            'La probabilité de $A$ SACHANT $B$ (tu sais déjà que $B$ est réalisé) se note ' +
              '$P(A|B)$ : $P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}$.',
            'Avec l\'exemple : $P(A|B)$ = 6/15 = 0,4, alors que $P(B|A)$ = 6/18 = 1/3. Le ' +
              'numérateur est le même — mais pas le dénominateur !',
          ],
        },
        {
          kind: 'piege',
          text:
            '$P(A|B) \\neq P(B|A)$ en général ! Confondre les deux sens de conditionnement, ' +
            'c\'est L\'erreur la plus fréquente de tout ce chapitre — elle revient dans chaque section.',
        },
        { kind: 'subheading', text: 'Indépendance' },
        {
          kind: 'intuition',
          label: 'Pourquoi on multiplie',
          text:
            'Choisir une tenue, c\'est 4 hauts × 3 bas = 12 tenues possibles, parce que chaque ' +
            'haut se combine avec chaque bas, sans restriction. Le même principe vaut pour deux ' +
            'événements indépendants : chaque issue de $A$ rencontre chaque issue de $B$, sans ' +
            'qu\'aucune ne soit favorisée ou exclue — d\'où la multiplication des probabilités, ' +
            '$P(A \\cap B) = P(A) \\times P(B)$.',
        },
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
          result: { tag: 'résultat', text: '$A$ et $B$ SONT indépendants — un résultat que seul le calcul confirme, jamais l\'intuition.' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — incompatibilité ≠ indépendance',
          text:
            'Deux événements INCOMPATIBLES ($A \\cap B=\\emptyset$, ils ne peuvent jamais se ' +
            'produire ensemble) et de probabilités non nulles ne sont JAMAIS indépendants ! ' +
            '$P(A \\cap B)$=0 alors que $P(A) \\times P(B)>0$ : l\'égalité échoue toujours. Les ' +
            'événements $A \\cap \\bar{B}$ et $\\bar{A} \\cap B$, par exemple, sont TOUJOURS ' +
            'incompatibles (un élément ne peut pas à la fois appartenir à $A$ et ne pas y ' +
            'appartenir) — donc jamais indépendants non plus. Incompatibilité et indépendance ' +
            'sont deux notions bien distinctes, jamais équivalentes.',
        },
        {
          kind: 'astuce',
          label: 'L\'indépendance se vérifie, elle ne se devine jamais',
          text:
            'Pour savoir si deux événements sont indépendants, compare toujours NUMÉRIQUEMENT ' +
            '$P(A \\cap B)$ et $P(A) \\times P(B)$ — jamais à une simple impression. L\'exemple ' +
            'des cartes ci-dessus est justement un cas où l\'intuition ne suffit pas.',
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
              'probabilité de passer d\'un nœud à l\'autre. Deux règles suffisent pour le lire : ' +
              'la probabilité d\'un CHEMIN, c\'est le produit des probabilités des branches ' +
              'traversées ; la probabilité d\'un ÉVÉNEMENT, c\'est la somme des probabilités ' +
              'des chemins qui y mènent (loi des probabilités totales).',
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
            'branches, jamais en les additionnant ! C\'est l\'inverse pour la probabilité d\'un ' +
            'ÉVÉNEMENT (plusieurs chemins) : elle s\'obtient en ADDITIONNANT.',
        },
        { kind: 'subheading', text: 'Avec ou sans remise : tout change' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Avec remise : l\'urne retrouve toujours sa composition initiale — les tirages sont INDÉPENDANTS.',
            'Sans remise : la composition change après chaque tirage — les tirages ne sont JAMAIS indépendants.',
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
          result: { tag: '', text: '' },
        },
        {
          kind: 'piege',
          text:
            'Utiliser la même probabilité 5/8 au second tirage SANS remise, comme si de rien ' +
            'n\'était, c\'est l\'erreur la plus fréquente de cette section ! La bonne valeur, ' +
            '4/7, se lit directement sur la 2e branche de l\'arbre.',
        },
        {
          kind: 'methode',
          label: '« Exactement une rouge » — combiner deux chemins',
          items: [
            'Deux chemins de l\'arbre mènent à « exactement une rouge » : $RB$ et $BR$. Sans ' +
              'remise : $P$(exactement 1 rouge) = $P(RB)+P(BR) = \\frac{5}{8} \\times \\frac{3}{7} + ' +
              '\\frac{3}{8} \\times \\frac{5}{7} = \\frac{15}{56}+\\frac{15}{56} = \\frac{15}{28}$.',
            'Et par le complément : $P$(au moins 1 rouge) = $1-P(BB) = 1-6/56 = 25/28$.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Vérifier que les chemins couvrent tout',
          text:
            'La somme des probabilités de TOUS les chemins d\'un arbre vaut toujours 1 (ici, ' +
            'sans remise : 20/56+15/56+15/56+6/56=1). Un excellent moyen de repérer une erreur ' +
            'de calcul avant de répondre !',
        },
        { kind: 'subheading', text: 'Une autre façon de dénombrer : le diagramme cartésien' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand une expérience combine 2 tirages INDÉPENDANTS à résultats numériques (2 dés, ' +
              'par exemple), tu peux représenter les $n \\times m$ issues comme des points ' +
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
          kind: 'intuition',
          label: "D'où vient le n! ?",
          text:
            'Range 4 objets dans 4 cases : 4 choix possibles pour la 1re case, puis seulement 3 ' +
            'pour la 2e (un objet est déjà casé), puis 2, puis 1 seul. Au total : ' +
            '$4 \\times 3 \\times 2 \\times 1=24$ façons — c\'est exactement $4!$. Le nombre de ' +
            'choix se réduit d\'une unité à chaque case remplie, jamais l\'inverse.',
        },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Le nombre de façons de ranger $n$ objets distincts (une PERMUTATION) vaut ' +
              '$n! = n \\times (n-1) \\times \\ldots \\times 1$. Un dérangement, c\'est une ' +
              'permutation où AUCUN objet ne reste à sa place initiale ; leur nombre se note ' +
              '$D(n)$ — et $D(n) \\neq n!$ (par exemple $D(4)$=9, très différent de 4!=24).',
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
            {
              tag: 'exactement 2 correctes',
              text:
                'on énumère les paires de lettres correctement placées — {1;2}, {1;3}, {1;4}, ' +
                '{2;3}, {2;4}, {3;4} : 6 paires. Les 2 lettres restantes doivent alors former ' +
                'un dérangement complet entre elles ($D(2)$=1 façon) : $P=(6 \\times 1)/24=1/4$',
            },
          ],
          result: { tag: '', text: '' },
        },
        {
          kind: 'piege',
          text:
            '« Exactement 3 lettres sur 4 à la bonne place », c\'est structurellement ' +
            'IMPOSSIBLE (probabilité nulle) ! Si 3 lettres sont bien placées, la 4e l\'est ' +
            'forcément aussi — il ne reste qu\'une seule enveloppe pour une seule lettre.',
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
            'Une partition de l\'univers, c\'est une famille d\'événements deux à deux ' +
              'INCOMPATIBLES dont l\'union recouvre l\'univers ENTIER — les deux conditions ' +
              'comptent, aucune n\'est optionnelle. Si $B_1,\\ldots,B_n$ forment une partition, ' +
              'la loi des probabilités totales donne, pour tout événement $A$ : ' +
              '$P(A) = \\displaystyle\\sum_{i=1}^{n} P(A|B_i) \\times P(B_i)$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'universePartition',
            parts: ['B₁', 'B₂', 'B₃', 'B₄'],
            universeLabel: 'Ω',
            eventLabel: 'A',
            formulaLabel: 'P(A) = P(A∩B₁) + P(A∩B₂) + P(A∩B₃) + P(A∩B₄)',
            caption:
              'Une partition $B_1,\\ldots,B_4$ de $\\Omega$ : l\'événement $A$ (ombré) traverse ' +
              'les 4 morceaux sans les déborder — sa probabilité totale est la somme de ses 4 tranches.',
          },
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
              'conditionnement : tu connais $P(B|A)$, tu en déduis $P(A|B)$ — utile dès que ' +
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
                'P(A)$, tu retombes exactement sur la formule de Bayes.',
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
            '$P(malade|T^+) \\approx 0,33$ est TRÈS différent de $P(T^+|malade) = 0,9$ ! ' +
            'Confondre ces deux probabilités conditionnelles, c\'est LE piège central du ' +
            'théorème de Bayes. Un test « fiable à 90 % » ($P(T^+|malade)$=0,9) ne signifie PAS ' +
            'qu\'un résultat positif donne 90 % de chances d\'être malade : tout dépend aussi ' +
            'de la rareté de la maladie ($P(malade)$=0,1, ici assez rare) et du taux de faux positifs.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'naturalFrequencies',
            headline: 'P(malade|T⁺) = 90/270 = 1/3',
            columns: [
              {
                title: 'malades',
                titleTone: 'accent',
                labelSide: 'right',
                segments: [
                  { label: 'T⁻ : 10', count: 10, tone: 'accentFaint' },
                  { label: 'T⁺ : 90', count: 90, tone: 'accent' },
                ],
                footLabel: '100 malades',
              },
              {
                title: 'non malades',
                titleTone: 'good',
                labelSide: 'right',
                segments: [
                  { label: 'T⁻ : 720', count: 720, tone: 'goodFaint' },
                  { label: 'T⁺ : 180', count: 180, tone: 'good' },
                ],
                footLabel: '900 non malades',
              },
              {
                title: '',
                titleTone: 'accent',
                labelSide: 'left',
                segments: [
                  { label: '180', count: 180, tone: 'good' },
                  { label: '90', count: 90, tone: 'accent' },
                ],
                footLabel: '270 positifs',
              },
            ],
            caption:
              'Sur 1000 personnes : 100 malades dont 90 $T^+$, et 900 non malades dont 180 $T^+$ ' +
              '— au total 270 $T^+$, dont seulement 90 sont réellement malades : 90/270=1/3, à ne ' +
              'pas confondre avec 90/100=0,9.',
          },
        },
        {
          kind: 'piege',
          text:
            'Une partition exige que les événements recouvrent TOUT l\'univers, pas seulement ' +
            'qu\'ils aient une probabilité non nulle. Oublier un morceau de la partition dans ' +
            'la loi des probabilités totales donne un résultat trop petit — sans aucun signal ' +
            'd\'erreur visible !',
        },
        {
          kind: 'methode',
          label: 'Lire P(A|B) directement dans un tableau à double entrée',
          items: [
            'Dans un tableau à double entrée (section 1), $P(A|B)$ se lit directement en ' +
              'restreignant ton attention à la SEULE ligne (ou colonne) de $B$ : c\'est ' +
              'l\'effectif de la case $A \\cap B$ divisé par le TOTAL de cette ligne — sans ' +
              'même repasser par la formule $P(A \\cap B)/P(B)$, puisque diviser numérateur et ' +
              'dénominateur par le même effectif total ne change rien au résultat.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — école de musique',
          formula:
            'Une école propose piano et guitare ; elle compte 60 inscrits dont 38 filles, et ' +
            'chaque élève ne suit qu\'un seul instrument. Le professeur de guitare a 28 élèves, ' +
            'dont 15 garçons — le tableau à double entrée se remplit avec ces 4 valeurs ' +
            'd\'énoncé (60, 38, 28, 15), laissées en noir ; les 5 autres cases, mises en ' +
            'évidence, se déduisent par soustraction.',
          steps: [],
          result: { tag: '', text: '' },
        },
        {
          kind: 'featureTable',
          headers: ['', 'Piano', 'Guitare', 'Total'],
          rows: [
            ['Garçons', { text: '7', tone: 'good' }, '15', { text: '22', tone: 'good' }],
            ['Filles', { text: '25', tone: 'good' }, { text: '13', tone: 'good' }, '38'],
            ['Total', { text: '32', tone: 'good' }, '28', '60'],
          ],
        },
        {
          kind: 'para',
          text:
            'Soit $A$ « l\'élève étudie la guitare » et $B$ « l\'élève est un garçon ». Sachant ' +
            'qu\'un élève étudie la guitare (tu restes dans la SEULE colonne « Guitare », de ' +
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
                'Tu pars de $P(A|B) = P(A)$ (la définition du cours), soit, par définition de ' +
                'la probabilité conditionnelle, $\\dfrac{P(A \\cap B)}{P(B)} = P(A)$. En ' +
                'multipliant les deux membres par $P(B)$ : $P(A \\cap B) = P(A) \\times P(B)$.',
            },
            {
              kind: 'para',
              text:
                'Le même calcul, mené cette fois en isolant $P(B|A)$ au lieu de $P(A|B)$, ' +
                'montre que $P(A \\cap B)=P(A) \\times P(B)$ entraîne aussi $P(B|A)=P(B)$. Les ' +
                'trois égalités — $P(A|B)=P(A)$, $P(A \\cap B)=P(A) \\times P(B)$, ' +
                '$P(B|A)=P(B)$ — sont donc rigoureusement équivalentes : n\'importe laquelle ' +
                'peut servir à définir ou à vérifier l\'indépendance. En pratique, c\'est la 2e ' +
                'forme qui sert de DÉFINITION officielle, car elle reste valable même quand ' +
                '$P(A)$ ou $P(B)$ vaut 0 (les deux autres formes exigeraient alors une ' +
                'division par 0, impossible).',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Deux probabilités conditionnées par le MÊME événement se complètent',
          text:
            '$P(malade|T^+) + P(\\text{non malade}|T^+) = 1$ TOUJOURS (le même événement ' +
            'conditionne $T^+$ des deux côtés). En revanche, $P(malade|T^+) + ' +
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
      kicker: 'compter les chemins à k succès dans l’arbre, × pᵏ(1−p)ⁿ⁻ᵏ',
      blocks: [
        {
          kind: 'definition',
          label: 'Épreuves répétées et indépendantes : toujours un arbre',
          items: [
            'Répéter $n$ fois la MÊME épreuve à deux issues (succès de probabilité $p$, échec ' +
              '$1-p$), en remettant à chaque fois les conditions à l\'identique, c\'est ' +
              'exactement l\'arbre de la section 2 — sauf que les DEUX probabilités $p$ et ' +
              '$1-p$ sont les MÊMES à chaque étage (indépendance : le résultat d\'un tir ' +
              'n\'affecte jamais le suivant).',
            'Sur un chemin donné, tu multiplies les probabilités étage par étage, comme ' +
              'toujours. Mais puisque $p$ et $1-p$ sont identiques à chaque étage, DEUX chemins ' +
              'comptant le MÊME NOMBRE de succès — peu importe à quels étages ils se ' +
              'produisent — ont exactement la même probabilité. Pour trouver $P$(exactement ' +
              '$k$ succès), il suffit donc de COMPTER combien de chemins de l\'arbre ' +
              'contiennent $k$ succès, puis de multiplier ce nombre par la probabilité commune ' +
              'à chacun d\'eux.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — arbre complet à 3 tirs, p=0,3',
          blocks: [
            {
              kind: 'para',
              text:
                'Avec seulement 3 tirs, l\'arbre complet tient sur 8 chemins — tu peux tous les ' +
                'lister, et les regrouper par nombre de succès (S) :',
            },
            {
              kind: 'featureTable',
              headers: [
                'Nombre de succès',
                'Chemins',
                'Nombre de chemins',
                'Probabilité de CHAQUE chemin',
                'P(X=k)',
              ],
              rows: [
                ['3', 'SSS', '1', '$0,3^3=0,027$', '$0,027$'],
                ['2', 'SSÉ, SÉS, ÉSS', '3', '$0,3^2 \\times 0,7=0,063$', '$3 \\times 0,063=0,189$'],
                ['1', 'SÉÉ, ÉSÉ, ÉÉS', '3', '$0,3 \\times 0,7^2=0,147$', '$3 \\times 0,147=0,441$'],
                ['0', 'ÉÉÉ', '1', '$0,7^3=0,343$', '$0,343$'],
              ],
            },
            {
              kind: 'para',
              text:
                'Vérification : 0,027+0,189+0,441+0,343 = 1 EXACTEMENT — les 8 chemins couvrent ' +
                'tous les cas possibles, sans jamais se chevaucher.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: '0', value: 0.16807, valueLabel: '0,168' },
              { label: '1', value: 0.36015, valueLabel: '0,360' },
              { label: '2', value: 0.3087, valueLabel: '0,309' },
              { label: '3', value: 0.1323, valueLabel: '0,132' },
              { label: '4', value: 0.02835, valueLabel: '0,028' },
              { label: '5', value: 0.00243, valueLabel: '0,002' },
            ],
            maxValue: 0.4,
            xAxisLabel: 'k (nombre de succès)',
            yAxisLabel: 'P(X=k)',
            caption:
              'Distribution de $P(X=k)$ pour $n$=5 tirs, $p$=0,3 : les 6 barres (k=0 à 5) ' +
              'totalisent une probabilité de 1.',
          },
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — tireur, n=5, p=0,3',
          formula: '',
          steps: [
            {
              tag: 'seule la POSITION des 2 succès compte',
              text:
                'Avec 5 tirs, lister les 32 chemins complets serait trop lourd. Mais pour ' +
                '$P(X=2)$, seule la POSITION des 2 succès parmi les 5 tirs compte : chaque ' +
                'position donne un chemin de probabilité $0,3^2 \\times 0,7^3$, quelle que soit ' +
                'la position exacte. Il suffit d\'énumérer ces positions :',
            },
            {
              tag: 'énumération des positions',
              text: '{1;2}, {1;3}, {1;4}, {1;5}, {2;3}, {2;4}, {2;5}, {3;4}, {3;5}, {4;5} — soit 10 positions distinctes.',
            },
          ],
          result: {
            tag: 'résultat',
            text: '$P(X=2) = 10 \\times 0,3^2 \\times 0,7^3 = 10 \\times 0,09 \\times 0,343 = 0,3087$',
          },
        },
        {
          kind: 'piege',
          text:
            'Oublier de COMPTER le nombre de positions (ici 10), et ne garder qu\'UNE seule ' +
            'd\'entre elles, donne $0,3^2 \\times 0,7^3=0,03087$ — un résultat 10 fois trop ' +
            'petit ! Le nombre de chemins n\'est JAMAIS optionnel dès que $0<k<n$.',
        },
        {
          kind: 'methode',
          label: '« Au moins un » : toujours par le complément',
          items: [
            '$P$(au moins un succès) se calcule par le complément de « aucun succès », JAMAIS ' +
              'en additionnant des probabilités individuelles — ça dépasserait facilement 1 ! ' +
              '$P(\\text{au moins 1}) = 1 - P(X=0) = 1-(1-p)^n$.',
            'Avec l\'exemple : $1-0,7^5 = 1-0,16807 = 0,83193$.',
          ],
        },
        {
          kind: 'piege',
          text:
            '$P(\\text{au moins 1}) = 5 \\times p = 1,5$ est IMPOSSIBLE — une probabilité ne ' +
            'dépasse jamais 1 ! Cette méthode « additionner les $p$ » est toujours fausse. La ' +
            'seule méthode fiable, c\'est le complément, quelle que soit la valeur de $p$ (il ' +
            'fonctionne pour tout $p$ entre 0 et 1, pas seulement $p$=0,5).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complementBar',
            headline: 'n=5, p=0,3 : P(au moins 1 succès) = 1 − P(X=0)',
            parts: [
              { fraction: 0.16807, label: 'P(X=0)=0,168', tone: 'faint' },
              { fraction: 0.83193, label: 'P(au moins 1)=0,832', tone: 'accent' },
            ],
            footer: '0,168 + 0,832 = 1',
            warning: '✗ 5×0,3 = 1,5 (impossible, >1)',
            caption:
              '0,168+0,832=1 EXACTEMENT : $P(X=0)$ et $P$(au moins 1) se partagent toute la ' +
              'barre — additionner 5×0,3=1,5 dépasserait la barre elle-même.',
          },
        },
        {
          kind: 'exemple',
          badge: 'exemple résolu — action boursière, n=3, p=0,6',
          formula:
            'Même principe que l\'arbre à 3 tirs ci-dessus, avec $p=0,6$ (H « hausse ») : ' +
            '1 chemin HHH, 3 chemins à 2 hausses (HHB, HBH, BHH), 3 chemins à 1 hausse ' +
            '(HBB, BHB, BBH), 1 chemin BBB.',
          steps: [
            { tag: 'P(X=0)', text: '$0,4^3=0,064$' },
            { tag: 'P(X=1)', text: '$3 \\times 0,6 \\times 0,4^2=0,288$' },
            { tag: 'P(X=2)', text: '$3 \\times 0,6^2 \\times 0,4=0,432$' },
            { tag: 'P(X=3)', text: '$0,6^3=0,216$' },
          ],
          result: {
            tag: 'somme',
            text:
              'Leur somme, 0,064+0,288+0,432+0,216, vaut exactement 1 — ces 4 valeurs couvrent ' +
              'tous les cas possibles, sans jamais se chevaucher.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Probabilités — problèmes',
          generatorId: '6gen33',
          description: [
            'Épreuves répétées et indépendantes, comptage des chemins à k succès dans ' +
              'l\'arbre, « au moins un » par le complément.',
          ],
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
        ['Probabilité', '$0 \\leq P(A) \\leq 1$ ; équiprobabilité : favorables/possibles'],
        ['Union', '$P(A \\cup B)=P(A)+P(B)-P(A \\cap B)$'],
        ['Complémentaire', '$P(\\bar{A} \\cap \\bar{B})=1-P(A \\cup B)$, jamais $1-P(A)-P(B)$'],
        ['Conditionnement', '$P(A|B)=P(A \\cap B)/P(B) \\neq P(B|A)$'],
        ['Indépendance', '$P(A \\cap B)=P(A) \\times P(B)$ — toujours vérifiée, jamais devinée'],
        ['Incompatibilité', '$P(A \\cap B)=0 \\Rightarrow$ jamais indépendant'],
        ['Arbre pondéré', 'chemin → produit ; événement (plusieurs chemins) → somme'],
        ['Avec/sans remise', 'avec remise → indépendant ; sans remise → jamais'],
        ['Dérangement', '$D(n) \\neq n!$ ; $D(4)$=9'],
        ['Probabilités totales', '$P(A)=\\sum P(A|B_i) \\times P(B_i)$ sur une partition'],
        ['Théorème de Bayes', '$P(A|B)=P(B|A) \\times P(A)/P(B)$'],
        [
          'Épreuves répétées',
          'compter les chemins à $k$ succès dans l’arbre, $\\times p^k(1-p)^{n-k}$',
        ],
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
