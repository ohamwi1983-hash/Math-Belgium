import type { ChapterContent } from '../../types'
import { lexiqueStatistiqueDescriptive } from '../../lexiques/4e/statistique-descriptive'

// Chapitre en FRANÇAIS SIMPLE (pilote du 28/11/2026) : une idée par phrase, 25 mots au plus, mots du
// cours expliqués sur place et dans le lexique (`lexique`). Contrôlé au build par
// `scripts/controle-lisibilite.mjs` — voir `.claude/rules/content-authoring.md`, « Français simple et
// mots du cours ». Structure (ids, blocs, cartes, générateurs) identique à la version d'avant.
export const statistiqueDescriptive: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 4,
  title: 'Statistique descriptive à une variable',
  slug: 'statistique-descriptive',
  lede:
    "Une série de mesures en désordre ne dit rien à personne. Dans ce chapitre, tu construis une boîte à " +
    "outils pour la rendre lisible. Tu verras le tableau de fréquences, l'histogramme, la moyenne, la " +
    "médiane et les quartiles. Tu verras aussi la boîte à moustaches, la variance et l'écart-type. À la " +
    "fin, tu sauras comparer deux séries entre elles.",

  intro: {
    title: 'Avant de commencer : le vocabulaire de base',
    blocks: [
      { kind: 'video', title: 'Avant de commencer : le vocabulaire de base', youtubeId: '-zwX56lSXnA' },
      {
        kind: 'para',
        text:
          'La **statistique descriptive** étudie une **population** : l\'ensemble des individus qu\'on ' +
          'observe. Un individu peut être une personne, un objet, un jour… Sur chaque individu, on ' +
          'observe un **caractère** : la grandeur qu\'on mesure. Dans ce chapitre, ce caractère est ' +
          'toujours **quantitatif** : c\'est un nombre. Et on étudie un seul caractère à la fois, jamais deux.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — population ou échantillon ?',
        items: [
          'Tu as rarement les données de toute la population. Le plus souvent, tu travailles sur un ' +
            '**échantillon** : une partie de la population, sur laquelle tu observes le caractère. Bonne ' +
            'nouvelle : toutes les formules de ce chapitre (moyenne, médiane, variance…) marchent de la ' +
            'même façon. Peu importe que la série vienne de toute la population ou d\'un échantillon.',
        ],
      },
      {
        kind: 'rappel',
        label: 'Rappel — discret ou continu ?',
        items: [
          'Un caractère **discret** prend seulement des valeurs séparées, qu\'on peut compter une par une ' +
            '(un nombre de frères et sœurs, une pointure). Un caractère **continu** peut prendre ' +
            'n\'importe quelle valeur dans un intervalle (une taille, un temps). Pour décrire un caractère ' +
            'continu, on doit d\'abord **regrouper ses valeurs en classes**. Tu verras ça à l\'étape 2.',
        ],
      },
      {
        kind: 'featureTable',
        caption: 'Le vocabulaire qui revient partout',
        headers: ['Terme', 'Notation', 'Sens'],
        rows: [
          ['Valeur', 'xᵢ', 'une valeur distincte prise par le caractère'],
          ['Effectif', 'nᵢ', 'le nombre d\'individus qui portent la valeur xᵢ'],
          ['Effectif total', 'n', 'le nombre total d\'individus, n = Σnᵢ'],
          ['Fréquence', 'fᵢ', 'nᵢ/n, souvent donnée en %'],
        ],
      },
      {
        kind: 'para',
        text:
          'Avec ce vocabulaire, chaque étape construit un outil pour répondre à une question précise. Où ' +
          'se trouve le « centre » de la série ? C\'est la moyenne ou la médiane. Les valeurs sont-elles ' +
          'très étalées autour de ce centre ? C\'est l\'étendue, la variance ou l\'écart-type. Et comment ' +
          'comparer deux séries entre elles ?',
      },
    ],
  },

  sections: [
    {
      id: 'frequences',
      number: 1,
      title: 'Organiser des données brutes : le tableau de fréquences',
      kicker: 'liste brute → valeur, effectif, fréquence, cumulés',
      titreCourt: 'Tableau de fréquences',
      partie: 'Organiser et représenter les données',
      essentiel: [
        'Tableau de fréquences : les valeurs distinctes, rangées par ordre croissant, avec leur effectif $n_i$ et leur fréquence $f_i = \\dfrac{n_i}{n}$. On ajoute les effectifs et les fréquences **cumulés** : la dernière ligne cumulée vaut n et 100 %.',
        'Une série discrète se représente par un diagramme en bâtons, aux bâtons séparés. Dans un diagramme circulaire, l\'angle d\'un secteur vaut $\\alpha_i = f_i \\times 360^{\\circ}$.',
        'Avant de croire un graphique, lis ses axes et ses nombres. Méfie-toi d\'un axe tronqué, qui ne part pas de 0, et de graduations irrégulières. Méfie-toi aussi des pictogrammes agrandis dans les deux sens et des parts qui ne font pas 100 %.',
      ],
      cartes: [
        { question: 'Comment calcule-t-on la fréquence d\'une valeur ?', reponse: '$f_i = \\dfrac{n_i}{n}$ : son effectif divisé par l\'effectif total, souvent en %.' },
        { question: 'Que doit valoir la dernière ligne des effectifs cumulés ?', reponse: 'L\'effectif total n (et 100 % pour la fréquence cumulée).' },
        { question: 'Une fréquence de 30 % : quel angle dans un diagramme circulaire ?', reponse: '$0{,}30 \\times 360^{\\circ} = 108^{\\circ}$.' },
        { question: 'Un pictogramme 2 fois plus haut et 2 fois plus large : quel est le piège ?', reponse: 'Son aire est 4 fois plus grande. L\'œil voit « ×4 » alors que la valeur est seulement doublée.' },
      ],
      blocks: [
        { kind: 'video', title: 'Organiser des données brutes : le tableau de fréquences', youtubeId: 'LnLwqGZ1POU' },
        {
          kind: 'para',
          text:
            'Une série statistique brute, c\'est une liste de valeurs **dans l\'ordre où on les a ' +
            'relevées**. Elle n\'est ni triée, ni organisée. La première étape est toujours de la ' +
            'transformer en **tableau de fréquences**. Ce tableau a une ligne par valeur distincte : ' +
            'chaque valeur différente n\'y apparaît qu\'une fois. Sur sa ligne, on écrit son effectif, sa ' +
            'fréquence, et les versions **cumulées** de ces deux colonnes.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Repère les valeurs **distinctes** de la série : les valeurs différentes. Range-les par ordre croissant.',
            'Pour chaque valeur, compte son **effectif** nᵢ : le nombre de fois qu\'elle apparaît.',
            'Calcule sa **fréquence** fᵢ = nᵢ/n : la part de la série qu\'elle représente, souvent en %. ' +
              'Ici, n est l\'effectif total : le nombre de toutes les données.',
            'Cumule, colonne par colonne. L\'**effectif cumulé** d\'une ligne, c\'est son effectif plus ' +
              'ceux de toutes les lignes d\'avant. La **fréquence cumulée** se calcule directement à partir ' +
              'de l\'effectif cumulé. Ne la recalcule jamais à part.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'liste brute, n = 20',
          formula: 'Série brute (nombre de livres lus en un an par 20 élèves) : 3, 5, 3, 7, 5, 12, 5, 3, 7, 5, 3, 12, 7, 5, 3, 7, 5, 12, 3, 5',
          steps: [
            { tag: '1 — valeurs distinctes, ordre croissant', text: '3, 5, 7, 12' },
            { tag: '2 — compter chaque valeur', text: '3 apparaît 6 fois, 5 apparaît 7 fois, 7 apparaît 4 fois, 12 apparaît 3 fois (total 6+7+4+3 = 20 ✓)' },
          ],
          result: { tag: 'tableau complet', text: 'fréquences 30 %, 35 %, 20 %, 15 % ; effectifs cumulés 6, 13, 17, 20 ; fréquences cumulées 30 %, 65 %, 85 %, 100 % (tableau ci-dessous)' },
        },
        {
          kind: 'featureTable',
          headers: ['xᵢ', 'nᵢ', 'fᵢ (%)', 'nᵢ cumulé', 'fᵢ cumulée (%)'],
          rows: [
            ['3', '6', '30', '6', '30'],
            ['5', '7', '35', '13', '65'],
            ['7', '4', '20', '17', '85'],
            ['12', '3', '15', '20', '100'],
          ],
        },
        {
          kind: 'para',
          text:
            'Pour représenter une série **discrète**, on trace un **diagramme en bâtons**. Au-dessus de ' +
            'chaque valeur xᵢ, on dresse un bâton vertical de hauteur nᵢ. Les bâtons restent ' +
            '**séparés**, parce que le caractère ne prend que des valeurs séparées : on ne lit jamais 5,5 ' +
            'livres. C\'est la grande différence avec l\'**histogramme** de l\'étape 2. Ses barres sont ' +
            '**collées**, parce qu\'elles couvrent des classes : des intervalles qui se suivent sans trou.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [],
            shadedRegions: [
              { from: 2.8, to: 3.2, upper: () => 6, tone: 'accent' },
              { from: 4.8, to: 5.2, upper: () => 7, tone: 'accent' },
              { from: 6.8, to: 7.2, upper: () => 4, tone: 'accent' },
              { from: 11.8, to: 12.2, upper: () => 3, tone: 'accent' },
            ],
            points: [
              { x: 3, y: 6, label: '', tone: 'accent' },
              { x: 5, y: 7, label: '', tone: 'accent' },
              { x: 7, y: 4, label: '', tone: 'accent' },
              { x: 12, y: 3, label: '', tone: 'accent' },
            ],
            xMin: 0,
            xMax: 13.5,
            xTicks: [3, 5, 7, 12],
            yTicks: [3, 4, 6, 7],
            fixedYRange: { min: 0, max: 8.5 },
            xAxisLabel: 'livres lus',
            yAxisLabel: 'effectif',
            caption:
              'Diagramme en bâtons de la série des livres. Il y a un bâton par valeur (3, 5, 7, 12), de ' +
              'hauteur 6, 7, 4 et 3. Les bâtons ne se touchent pas.',
          },
        },
        {
          kind: 'astuce',
          label: 'Vérifier son tableau en un coup d\'œil',
          text:
            'La dernière ligne de la colonne « effectif cumulé » doit toujours valoir n, l\'effectif ' +
            'total. La dernière ligne de la fréquence cumulée doit toujours valoir 100 %. Sinon, tu as ' +
            'oublié une valeur, ou tu as compté une valeur en trop !',
        },
        {
          kind: 'historique',
          titre: 'Compter les morts pour inventer la statistique',
          text:
            "En 1662, un marchand de Londres, **John Graunt**, publie un livre sur les registres des décès. " +
            "Son titre : « Observations naturelles et politiques... faites sur les registres de mortalité ». " +
            "C'est le tout premier ouvrage qui transforme des données brutes en vraies connaissances. " +
            "Depuis 1592, les paroisses de Londres notaient chaque semaine les décès et leurs causes. Mais " +
            "personne n'utilisait vraiment ces listes. Graunt a l'idée de les ranger dans des tableaux " +
            "organisés : c'est exactement la démarche de cette étape. Il y découvre des régularités que " +
            "personne n'imaginait. Par exemple, la part de garçons et de filles à la naissance reste presque " +
            "la même d'une année à l'autre. Il en tire aussi la toute première « table de mortalité » de " +
            "l'histoire. Les compagnies d'assurance utilisent encore cet outil aujourd'hui. Aucun portrait " +
            "sûr de Graunt n'a survécu. L'image qu'on présente parfois comme la sienne est sans doute un " +
            'faux, fait bien plus tard.',
        },
        {
          kind: 'entrainement',
          title: 'Tableau de fréquences',
          generatorId: 'gen30',
          description: [
            'Reconstruis le tableau complet (valeur, effectif, fréquence, cumulés) à partir ' +
              'd\'une série brute mélangée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 30. Tableau de fréquences »',
        },
        { kind: 'subheading', text: 'Le diagramme circulaire' },
        {
          kind: 'para',
          text:
            'Pour montrer comment un tout se **partage**, on utilise un **diagramme circulaire**. Le ' +
            'disque entier représente 100 % des individus. Chaque catégorie reçoit un **secteur** : une ' +
            'part du disque proportionnelle à sa fréquence. Le disque fait 360°, donc l\'angle du secteur ' +
            'vaut $\\alpha_i = f_i \\times 360^{\\circ}$. Écris $f_i$ en nombre décimal : 30 % = 0,30. Dans ' +
            'l\'autre sens, un angle lu donne la fréquence : $f_i = \\dfrac{\\alpha_i}{360^{\\circ}}$.',
        },
        {
          kind: 'featureTable',
          caption: 'Série des livres lus : de la fréquence à l\'angle (la somme des angles vaut bien 360°)',
          headers: ['xᵢ', 'fᵢ (%)', 'calcul', 'angle'],
          rows: [
            ['3', '30', '$0{,}30 \\times 360^{\\circ}$', '108°'],
            ['5', '35', '$0{,}35 \\times 360^{\\circ}$', '126°'],
            ['7', '20', '$0{,}20 \\times 360^{\\circ}$', '72°'],
            ['12', '15', '$0{,}15 \\times 360^{\\circ}$', '54°'],
          ],
        },
        { kind: 'subheading', text: 'Graphiques trompeurs' },
        {
          kind: 'attention',
          label: 'Un graphique peut mentir sans écrire un seul chiffre faux',
          text:
            'Avant de croire ce qu\'un graphique « montre », lis ses axes et ses nombres. Voici quatre ' +
            'pièges fréquents :',
          items: [
            '**Axe vertical tronqué** : l\'axe ne commence pas à 0. Une petite hausse paraît alors énorme.',
            '**Graduations irrégulières** : sur l\'axe, des écarts égaux ne représentent pas des écarts ' +
              'égaux de valeurs.',
            '**Pictogrammes agrandis dans les deux sens** : un dessin devient 2 fois plus haut **et** 2 fois ' +
              'plus large. Son aire est alors 4 fois plus grande. L\'œil voit « ×4 » alors que la valeur est ' +
              'seulement doublée.',
            '**Diagramme circulaire dont les parts ne font pas 100 %** : les parts ne découpent plus un ' +
              'tout. Souvent, c\'est parce que chacun pouvait donner plusieurs réponses.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [],
              shadedRegions: [
                { from: 0.7, to: 1.3, upper: () => 1000, lower: () => 960, tone: 'accent' },
                { from: 1.7, to: 2.3, upper: () => 1080, lower: () => 960, tone: 'accent' },
              ],
              xMin: 0,
              xMax: 3,
              xTicks: [1, 2],
              xTickLabels: { 1: '2023', 2: '2024' },
              yTicks: [960, 1000, 1040, 1080],
              fixedYRange: { min: 960, max: 1110 },
              xAxisLabel: '',
              yAxisLabel: 'ventes',
              compact: true,
              caption: 'Axe tronqué (il part de 960) : la barre de 2024 paraît 3 fois plus haute.',
            },
            {
              kind: 'curvePlot',
              curves: [],
              shadedRegions: [
                { from: 0.7, to: 1.3, upper: () => 1000, tone: 'accent' },
                { from: 1.7, to: 2.3, upper: () => 1080, tone: 'accent' },
              ],
              xMin: 0,
              xMax: 3,
              xTicks: [1, 2],
              xTickLabels: { 1: '2023', 2: '2024' },
              yTicks: [0, 250, 500, 750, 1000],
              fixedYRange: { min: 0, max: 1200 },
              xAxisLabel: '',
              yAxisLabel: 'ventes',
              compact: true,
              caption:
                'Mêmes données, axe partant de 0. De 1000 à 1080, la hausse réelle est de ' +
                '$\\dfrac{1080 - 1000}{1000} \\times 100 = 8$ %.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Diagrammes et graphiques trompeurs',
          generatorId: 'gen111',
          description: [
            'Passe des fréquences aux angles d\'un diagramme circulaire, et dans l\'autre sens. Lis un ' +
              'diagramme en bâtons. Puis démasque un graphique trompeur et corrige sa conclusion chiffrée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 111. Diagrammes et graphiques trompeurs »',
        },
      ],
    },
    {
      id: 'histogramme',
      number: 2,
      title: 'Regrouper en classes : l\'histogramme',
      kicker: 'caractère continu → classes d\'amplitude constante → histogramme',
      titreCourt: 'Classes et histogramme',
      partie: 'Organiser et représenter les données',
      essentiel: [
        'Un caractère continu se regroupe en **classes**. L\'amplitude d\'une classe vaut : borne supérieure − borne inférieure. L\'histogramme a des barres **collées**. Quand les classes ont la même amplitude, la hauteur d\'une barre est l\'effectif de sa classe.',
        'Une classe $[a\\,;\\,b[$ contient a, mais **pas** b. Une donnée sur une frontière va donc dans la classe suivante. Seule exception : la dernière classe, qui contient aussi sa borne supérieure.',
        'Amplitude : divise l\'étendue par le nombre de classes (en pratique, 5 à 8). Puis arrondis vers le haut, à une valeur ronde.',
      ],
      cartes: [
        { question: 'Avec les classes $[2\\,;\\,4[$ et $[4\\,;\\,6[$, où va la donnée 4 ?', reponse: 'Dans $[4\\,;\\,6[$ : une donnée sur une frontière va dans la classe suivante.' },
        { question: 'Quelle classe fait exception à la règle des frontières ?', reponse: 'La toute dernière : elle contient aussi sa borne supérieure.' },
        { question: 'Étendue 7,5 et 4 classes : quelle amplitude choisir ?', reponse: '$\\dfrac{7{,}5}{4} = 1{,}875$, arrondi vers le haut à 2.' },
        { question: 'Bâtons séparés ou barres collées : quand utilise-t-on chacun ?', reponse: 'Des bâtons séparés pour une série discrète. Des barres collées (histogramme) pour des classes qui se suivent.' },
      ],
      blocks: [
        { kind: 'video', title: 'Regrouper en classes : l\'histogramme', youtubeId: 'oftzQYXj6tA' },
        {
          kind: 'para',
          text:
            'Prends un caractère **continu**, ou un caractère discret qui a trop de valeurs différentes. ' +
            'On regroupe alors ses données en **classes** : des intervalles qui se suivent. Une classe va ' +
            'd\'une borne inférieure (son début) à une borne supérieure (sa fin). Son **amplitude**, c\'est ' +
            'sa longueur : borne supérieure − borne inférieure. Pour construire un **histogramme**, on ' +
            'choisit ici des classes de **même amplitude**. On dessine des barres collées les unes aux ' +
            'autres. La **hauteur** de chaque barre vaut l\'effectif (ou la fréquence) de sa classe.',
        },
        {
          kind: 'piege',
          label: 'Quelle borne appartient à quelle classe ?',
          text:
            'Dans tout ce chapitre, une classe [borne inf ; borne sup[ contient sa borne inférieure. Mais ' +
            'elle ne contient **pas** sa borne supérieure ! Une donnée qui tombe **exactement** sur une ' +
            'frontière va donc toujours dans la classe **suivante**. Seule exception : la **toute dernière ' +
            'classe** du tableau contient aussi sa borne supérieure. Ainsi, on ne perd aucune donnée.',
        },
        {
          kind: 'methode',
          label: 'Choisir ses classes',
          items: [
            'Calcule l\'**étendue** de la série : max − min, la plus grande valeur moins la plus petite.',
            'Choisis le **nombre de classes** : en pratique, entre 5 et 8. Prends-en moins quand il y a ' +
              'peu de données.',
            'Divise l\'étendue par ce nombre. Puis arrondis **vers le haut**, à une valeur « ronde » : ' +
              'c\'est l\'**amplitude**.',
            'Fais commencer la première classe à une valeur ronde, plus petite que le minimum ou égale à lui.',
          ],
        },
        {
          kind: 'para',
          text:
            'Sur l\'exemple ci-dessous : min = 0,5 et max = 8, donc étendue = 7,5. Il n\'y a que 20 ' +
            'données : 4 classes suffisent. $\\dfrac{7{,}5}{4} = 1{,}875$, arrondi à **2**. On démarre à 0 : ' +
            '[0 ; 2[, [2 ; 4[, [4 ; 6[, [6 ; 8].',
        },
        {
          kind: 'exemple',
          badge: '4 classes, amplitude 2',
          formula:
            'Temps d\'écran quotidien (en h) de 20 élèves : 1 ; 2 ; 3,5 ; 0,5 ; 6 ; 4 ; 1,5 ; ' +
            '2,5 ; 5 ; 8 ; 0,5 ; 3 ; 1,8 ; 2,2 ; 4,5 ; 7 ; 1,2 ; 3,8 ; 5,5 ; 2,7. Les classes ' +
            'imposées ont une amplitude de 2 :',
          steps: [
            {
              tag: 'données sur une frontière',
              text:
                '2 va dans [2 ; 4[, 4 dans [4 ; 6[ et 6 dans [6 ; 8]. Une donnée ne va jamais dans la ' +
                'classe qui se termine par cette valeur.',
            },
            {
              tag: '8, la toute dernière borne',
              text: '8 est la borne supérieure de la dernière classe : c\'est l\'exception, [6 ; 8] la contient.',
            },
            { tag: 'compter', text: '6 + 7 + 4 + 3 = 20 données ✓' },
          ],
          result: { tag: 'tableau + histogramme', text: 'effectifs 6, 7, 4, 3 et fréquences 30 %, 35 %, 20 %, 15 % pour [0 ; 2[, [2 ; 4[, [4 ; 6[, [6 ; 8] ; histogramme : 4 barres de largeur 2 et de hauteurs 6, 7, 4, 3 (tableau et histogramme ci-dessous)' },
        },
        {
          kind: 'featureTable',
          headers: ['Classe', 'Effectif', 'Fréquence (%)'],
          rows: [
            ['[0 ; 2[', '6', '30'],
            ['[2 ; 4[', '7', '35'],
            ['[4 ; 6[', '4', '20'],
            ['[6 ; 8]', '3', '15'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'histogram',
            bars: [
              { from: 0, width: 2, height: 6 },
              { from: 2, width: 2, height: 7 },
              { from: 4, width: 2, height: 4 },
              { from: 6, width: 2, height: 3 },
            ],
            xAxisLabel: 'classe',
            yAxisLabel: 'effectif',
            caption: '4 classes d\'amplitude 2. La hauteur d\'une barre est l\'effectif de sa classe.',
          },
        },
        {
          kind: 'astuce',
          text:
            'Dans l\'entraînement de cette étape, l\'effectif total vaut toujours $n = 10$, 20 ou 25. ' +
            'Chaque fréquence y tombe donc sur un **pourcentage entier** : c\'est un bon moyen de te ' +
            'relire. Mais ce n\'est pas une règle générale ! Avec $n = 16$ (possible dans le tableau de ' +
            'fréquences de l\'étape 1), une seule donnée vaut $\\dfrac{1}{16} = 6{,}25\\,\\%$. Une fréquence ' +
            'à virgule y est donc parfaitement exacte.',
        },
        {
          kind: 'rappel',
          label: 'Classes de même amplitude… seulement pour l\'histogramme',
          items: [
            'Pour **construire un histogramme**, les classes ont ici toujours la même amplitude. La ' +
              'hauteur de chaque barre se lit alors directement comme l\'effectif de la classe.',
            'Dans les autres exercices du chapitre (moyenne pondérée, médiane, synthèse), les classes ' +
              'peuvent avoir des amplitudes **différentes**. Ça ne change rien aux calculs. La moyenne ' +
              'utilise le **centre** de chaque classe. La médiane s\'obtient par **interpolation** dans ' +
              'la classe du seuil. Et le mode reste la classe de **plus grand effectif**.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Un diagramme qui a sauvé des vies',
          text:
            "En 1858, l'infirmière britannique **Florence Nightingale** publie un rapport sur la guerre de " +
            "Crimée. Il parle des soldats britanniques morts pendant cette guerre. Elle y ajoute un " +
            "graphique de son invention : le « diagramme en rose » (coxcomb). C'est une sorte " +
            "d'histogramme en cercle, avec un secteur par mois. Chaque secteur montre les morts dus aux " +
            "blessures de combat, aux maladies évitables et aux autres causes. Le résultat frappe tout le " +
            "monde. Presque tous les morts viennent de maladies évitables (typhus, choléra, mauvaise " +
            "hygiène), pas des combats. Nightingale sait qu'un tableau de chiffres n'aurait pas convaincu " +
            "le Parlement britannique aussi vite. Son graphique, lui, y arrive : les hôpitaux militaires " +
            "sont réformés juste après. C'est l'un des tout premiers cas où un graphique statistique " +
            "change vraiment une décision politique.",
          image: {
            src: '/images/historique/nightingale.jpg',
            alt: 'Portrait de Florence Nightingale',
            caption: 'Florence Nightingale (1820–1910), photographie par Henry Hering, vers 1860.',
          },
        },
        {
          kind: 'atelier',
          tag: 'choix-classes-widget',
          label: 'Manipule toi-même — combien de classes choisir ?',
          caption:
            'Les 40 mêmes temps de trajet, découpés en 2 à 12 classes de même amplitude ' +
            '(amplitude = étendue / nombre de classes). Avec trop peu de classes, on mélange les ' +
            'élèves qui viennent à pied et ceux qui prennent le bus. Avec trop de classes, ' +
            'l\'histogramme est haché, plein de classes presque vides. Cherche le découpage qui ' +
            'montre le mieux les deux groupes.',
        },
        {
          kind: 'atelier',
          tag: 'frontiere-classe-widget',
          label: 'Manipule toi-même — sur quelle classe tombe x ?',
          caption:
            'Fais glisser x le long des 4 classes de l\'exemple. Quand x tombe pile sur une ' +
            'frontière, le point devient rouge. Le texte te dit alors clairement que x va dans la ' +
            'classe suivante. Seule exception, tout à la fin : la dernière classe.',
        },
        {
          kind: 'entrainement',
          title: 'Regroupement en classes et histogramme',
          generatorId: 'gen31',
          description: [
            'Classe des données brutes dans des classes imposées. Calcule effectifs et ' +
              'fréquences. Puis trace l\'histogramme.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 31. Regroupement en classes et histogramme »',
        },
      ],
    },
    {
      id: 'moyenne',
      number: 3,
      title: 'La moyenne pondérée',
      kicker: 'x̄ = Σ(xᵢ·nᵢ) / Σnᵢ',
      titreCourt: 'Moyenne pondérée',
      partie: 'Moyenne, médiane, quartiles',
      essentiel: [
        'Moyenne pondérée : $\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i}$. On multiplie chaque valeur par son effectif, puis on divise la somme par l\'effectif total. Ne fais jamais la moyenne des valeurs distinctes seules.',
        'En classes, chaque classe $[a\\,;\\,b[$ est représentée par son **centre** $\\dfrac{a+b}{2}$. La moyenne obtenue est alors une valeur approchée.',
        'Une donnée manque ? Écris la formule avec toutes les données, l\'inconnue comprise. Égale-la à la moyenne connue, puis résous l\'équation.',
      ],
      cartes: [
        { question: 'Quel est le centre de la classe $[4\\,;\\,8[$ ?', reponse: '$\\dfrac{4+8}{2} = 6$.' },
        { question: 'Valeurs 2, 6, 9, 12 d\'effectifs 5, 8, 4, 3 : quelle est la moyenne ?', reponse: '$\\bar{x} = \\dfrac{10+48+36+36}{20} = \\dfrac{130}{20} = 6{,}5$.' },
        { question: 'Notes 12, 9 et 14 : quelle quatrième note pour une moyenne de 12 ?', reponse: '$\\dfrac{35 + x}{4} = 12$, donc $x = 13$.' },
        { question: '24 élèves de moyenne 14 et 16 élèves de moyenne 9 : quelle moyenne pour les 40 ?', reponse: '$\\dfrac{24 \\times 14 + 16 \\times 9}{40} = 12$, et non 11,5.' },
      ],
      blocks: [
        { kind: 'video', title: 'La moyenne pondérée', youtubeId: 'LxeW4gzXW-w' },
        {
          kind: 'para',
          text:
            'La **moyenne pondérée** tient compte du poids de chaque valeur. Toutes les valeurs n\'ont pas ' +
            'le même « poids ». Une valeur qui revient 7 fois compte 7 fois plus qu\'une valeur qui ' +
            'n\'apparaît qu\'une fois.',
        },
        {
          kind: 'definition',
          label: 'Formule',
          items: [
            '$\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i} = \\dfrac{x_1 n_1 + x_2 n_2 + x_3 n_3 + \\ldots}{n_1+n_2+n_3+\\ldots}$',
            'On multiplie chaque valeur par son propre effectif. On additionne tous ces ' +
              'produits. Puis on divise par l\'effectif total.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — données discrètes',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['xᵢ', 'nᵢ', 'xᵢ·nᵢ'],
              rows: [
                ['2', '5', '10'],
                ['6', '8', '48'],
                ['9', '4', '36'],
                ['12', '3', '36'],
              ],
            },
            { kind: 'para', text: 'Somme des produits : $10+48+36+36=130$. Effectif total : $n=5+8+4+3=20$.' },
            { kind: 'para', text: 'Moyenne : $\\bar{x} = 130/20 = 6{,}5$.' },
          ],
        },
        {
          kind: 'piege',
          text:
            'Ne fais **jamais** la moyenne des valeurs distinctes seules ! Ici, ça donnerait ' +
            '$(2+6+9+12)/4 = 7{,}25$. Cette erreur oublie complètement les effectifs. Elle ' +
            'donne un résultat faux dès que les effectifs ne sont pas tous égaux.',
        },
        {
          kind: 'methode',
          label: 'Données regroupées en classes',
          items: [
            'On ne connaît plus chaque valeur. On utilise donc le **centre** de chaque classe : la ' +
              'moyenne de ses deux bornes. Pour la classe $[a\\,;\\,b[$, c\'est $\\dfrac{a+b}{2}$. Il ' +
              'représente toute la classe dans le calcul.',
            'On obtient une **valeur approchée** : on fait comme si toutes les valeurs de la classe ' +
              'étaient au centre. La vraie moyenne des données brutes peut être un peu différente.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — données en classes',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['Classe', 'Centre xᵢ', 'nᵢ', 'xᵢ·nᵢ'],
              rows: [
                ['[0 ; 4[', '2', '5', '10'],
                ['[4 ; 8[', '6', '8', '48'],
                ['[8 ; 12[', '10', '4', '40'],
                ['[12 ; 16[', '14', '3', '42'],
              ],
            },
            { kind: 'para', text: 'Somme des produits : $10+48+40+42=140$. Effectif total : $n=20$.' },
            { kind: 'para', text: 'Moyenne : $\\bar{x} = 140/20 = 7$. C\'est une valeur approchée.' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Avec les fréquences',
          text:
            'Le tableau donne parfois les **fréquences** fᵢ (en nombre décimal) au lieu des effectifs. La ' +
            'formule devient alors $\\bar{x} = \\Sigma(x_i \\cdot f_i)$. Plus besoin de diviser : la somme ' +
            'des fréquences vaut déjà 1. Sur l\'exemple discret : ' +
            '$2 \\cdot 0{,}25 + 6 \\cdot 0{,}4 + 9 \\cdot 0{,}2 + 12 \\cdot 0{,}15 = 6{,}5$. C\'est la même moyenne.',
        },
        {
          kind: 'historique',
          titre: 'L\'astronome belge qui a inventé « l\'homme moyen »',
          text:
            "Dans les années 1830, l'astronome et statisticien belge **Adolphe Quetelet** a une idée " +
            "nouvelle. Jusque-là, on utilisait la moyenne pondérée pour des mesures en astronomie. Lui " +
            "l'applique aux mesures humaines. Il rassemble des milliers de mesures : tailles, poids et " +
            "même comportements. Il construit ainsi l'idée de « l'homme moyen ». C'est un individu " +
            "imaginaire qui résumerait toute une population par ses valeurs moyennes. L'idée choque " +
            "autant qu'elle fascine : peut-on vraiment réduire une société entière à quelques nombres ? " +
            "Au passage, Quetelet invente l'**indice de masse corporelle**, aussi appelé « indice de " +
            "Quetelet ». C'est le poids divisé par le carré de la taille. Les médecins l'utilisent " +
            "toujours aujourd'hui. Il a fondé l'Observatoire royal de Belgique. C'est l'un des " +
            "scientifiques belges les plus importants du 19e siècle.",
          image: {
            src: '/images/historique/quetelet.jpg',
            alt: 'Portrait d\'Adolphe Quetelet',
            caption: 'Lambert Adolphe Jacques Quetelet (1796–1874), photographie d\'époque.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Moyenne pondérée',
          generatorId: 'gen32',
          description: [
            'Calcule x̄ à partir d\'un tableau déjà construit, en données discrètes ou en ' +
              'classes (centres).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 32. Moyenne pondérée »',
        },
        { kind: 'subheading', text: 'Retrouver une valeur manquante' },
        {
          kind: 'methode',
          label: 'Quand la moyenne est connue mais qu\'une donnée manque',
          items: [
            'Appelle l\'inconnue par une lettre ($x$ pour une note, $k$ pour un effectif…). Écris la ' +
              'formule de la moyenne **avec toutes les données**, l\'inconnue comprise. L\'inconnue ' +
              'apparaît en haut de la fraction, multipliée par son coefficient ou par sa valeur. Si c\'est ' +
              'un effectif ou un coefficient, elle apparaît aussi en bas de la fraction.',
            'Égale cette expression à la moyenne connue : c\'est une équation du premier degré. Multiplie ' +
              'les deux côtés de l\'égalité par le dénominateur, puis isole l\'inconnue.',
            'Conclus dans le contexte. Une note ne dépasse pas 20 : le résultat peut montrer que c\'est ' +
              'impossible. Un effectif est un nombre entier. Et l\'effectif total change quand on ajoute ' +
              'des données.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — la note à obtenir',
          blocks: [
            {
              kind: 'para',
              text:
                'Léa a obtenu 12, 9 et 14 sur 20 aux trois premiers contrôles. Quelle note doit-elle ' +
                'obtenir au quatrième, qui compte autant que les autres, pour atteindre une moyenne de 12 ?',
            },
            { kind: 'para', text: 'Avec la note $x$ qui manque, il y a 4 notes : $\\dfrac{12 + 9 + 14 + x}{4} = 12$.' },
            { kind: 'para', text: 'On multiplie par 4 : $35 + x = 48$, donc $x = 13$.' },
            {
              kind: 'para',
              text:
                'Conclusion : Léa doit obtenir **au moins** 13/20. Avec exactement 13, sa moyenne vaut 12. ' +
                'Avec plus, elle dépasse 12.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'La moyenne des moyennes',
          text:
            'Pour réunir deux groupes de tailles différentes, on ne fait **jamais** la moyenne des deux ' +
            'moyennes. La 4e A a 24 élèves, avec une moyenne de 14. La 4e B a 16 élèves, avec une moyenne ' +
            'de 9. Ensemble, leur moyenne vaut $\\dfrac{24 \\times 14 + 16 \\times 9}{24 + 16} = \\dfrac{480}{40} = 12$, ' +
            'et non $\\dfrac{14 + 9}{2} = 11{,}5$. Le groupe le plus nombreux pèse davantage.',
        },
        {
          kind: 'entrainement',
          title: 'Retrouver une valeur manquante',
          generatorId: 'gen109',
          description: [
            'Note à obtenir pour atteindre une moyenne (avec ou sans coefficients), effectif effacé ' +
              'd\'un tableau, moyenne de deux groupes réunis. Et aussi : combien de valeurs ajouter pour ' +
              'obtenir une médiane (règle du seuil, étape 4). Pose l\'équation, résous-la, conclus.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 109. Retrouver une valeur manquante »',
        },
      ],
    },
    {
      id: 'position',
      number: 4,
      title: 'Médiane, quartiles et mode',
      kicker: 'les paramètres de position — le rang, pas la valeur',
      titreCourt: 'Médiane, quartiles, mode',
      partie: 'Moyenne, médiane, quartiles',
      essentiel: [
        'Règle du seuil : sur les effectifs cumulés, le seuil vaut $\\dfrac{n}{2}$ pour la médiane, $\\dfrac{n}{4}$ pour Q1 et $\\dfrac{3n}{4}$ pour Q3. Le paramètre est la **première valeur** dont l\'effectif cumulé dépasse **strictement** ce seuil.',
        'En classes, on interpole dans la classe du seuil : $\\text{valeur} = L + \\dfrac{\\text{seuil} - CF_{avant}}{n_{classe}} \\cdot \\text{amplitude}$.',
        'Le **mode** est la valeur (ou la classe) de plus grand effectif. Une valeur extrême ne fait presque pas bouger la médiane. Elle fait beaucoup bouger la moyenne.',
      ],
      cartes: [
        { question: 'n = 20 : quel est le seuil de Q1 ?', reponse: '$\\dfrac{n}{4} = 5$. Q1 est la première valeur dont l\'effectif cumulé dépasse strictement 5.' },
        { question: 'L\'effectif cumulé d\'une valeur vaut exactement le seuil : est-ce le paramètre cherché ?', reponse: 'Non, pas encore : on prend la valeur suivante.' },
        { question: 'Le seuil 10 tombe dans $[4\\,;\\,8[$ (cumulés de 5 à 13) : que vaut la médiane ?', reponse: '$4 + \\dfrac{10-5}{8} \\cdot 4 = 6{,}5$.' },
        { question: 'Une valeur énorme s\'ajoute à la série : quel indicateur bouge à peine ?', reponse: 'La médiane. Une valeur extrême ne la fait presque pas bouger, contrairement à la moyenne.' },
      ],
      blocks: [
        { kind: 'video', title: 'Médiane, quartiles et mode (1/2) : la règle du seuil', youtubeId: 'OTT30Ux-Z8k' },
        { kind: 'video', title: 'Médiane, quartiles et mode (2/2) : classes, mode, quelle valeur centrale ?', youtubeId: 'SOaot7PbsMo' },
        {
          kind: 'intuition',
          label: 'Pourquoi une médiane, en plus de la moyenne ?',
          text:
            'Imagine une rue de dix maisons. Neuf valent environ 200 000 € chacune. La dixième est un ' +
            'immense château à 10 000 000 €. La **moyenne** des dix prix explose à cause du château. Elle ' +
            'donne un prix qu\'aucune maison de la rue n\'atteint vraiment. La **médiane**, elle, ne regarde ' +
            'que le rang : la place dans la liste rangée. Elle reste sur le prix d\'une maison « normale », ' +
            'sans se soucier du prix du château.',
        },
        {
          kind: 'para',
          text:
            'Ces paramètres décrivent une série par le **rang** des individus : leur place quand on range ' +
            'les valeurs dans l\'ordre. Ce n\'est pas un calcul sur les valeurs elles-mêmes. La ' +
            '**médiane** coupe la série en deux moitiés égales. Les **quartiles** Q1 et Q3 la coupent en ' +
            'quatre parts égales. Le **mode**, lui, est simplement la valeur (ou la classe) de plus grand ' +
            'effectif.',
        },
        {
          kind: 'methode',
          label: 'La règle du seuil',
          items: [
            'Sur le tableau des effectifs cumulés, chaque paramètre correspond à un **seuil** : ' +
              '$\\dfrac{n}{2}$ pour la médiane, $\\dfrac{n}{4}$ pour $Q_1$, $\\dfrac{3n}{4}$ pour $Q_3$. Le ' +
              'paramètre cherché, c\'est la **première valeur** dont l\'effectif cumulé dépasse ' +
              '**strictement** ce seuil. Dépasser strictement le seuil veut dire : être plus grand que lui, ' +
              'et pas seulement égal.',
          ],
        },
        {
          kind: 'piege',
          label: '« Strictement supérieur », jamais « supérieur ou égal »',
          text:
            'C\'est l\'erreur la plus fréquente ! Si l\'effectif cumulé est **exactement** égal au seuil, ' +
            'ce n\'est **pas encore** la bonne valeur. Il faut prendre la **suivante**. Vérifie-le sur ' +
            'l\'exemple ci-dessous, avec $Q_1$. Le seuil vaut $\\dfrac{n}{4} = 5$, et l\'effectif cumulé ' +
            'de x=2 vaut **exactement** 5. Il est égal au seuil : ce n\'est donc pas encore Q1. Le premier ' +
            'cumulé strictement supérieur à 5 est 13, à x=6 : Q1 = 6. Ce n\'est jamais x=2, même si tu as ' +
            'envie de t\'arrêter dès que le cumulé « atteint » le seuil.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — données discrètes, n = 20',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['xᵢ', 'nᵢ', 'nᵢ cumulé'],
              rows: [
                ['2', '5', '5'],
                ['6', '8', '13'],
                ['9', '4', '17'],
                ['12', '3', '20'],
              ],
            },
            { kind: 'para', text: 'Médiane — seuil $\\dfrac{n}{2} = 10$ : premier cumulé $> 10$ est 13 (à $x=6$) → médiane $= 6$.' },
            { kind: 'para', text: '$Q_1$ — seuil $\\dfrac{n}{4} = 5$ : premier cumulé $> 5$ est 13 (à $x=6$) → $Q_1 = 6$. 5 n\'est pas strictement supérieur à 5, donc on passe à la ligne suivante.' },
            { kind: 'para', text: '$Q_3$ — seuil $\\dfrac{3n}{4} = 15$ : premier cumulé $> 15$ est 17 (à $x=9$) → $Q_3 = 9$.' },
            { kind: 'para', text: 'Résultat : min=2, Q1=6, médiane=6, Q3=9, max=12, mode=6 (effectif 8, le plus grand).' },
          ],
        },
        { kind: 'subheading', text: 'Données en classes : le polygone des effectifs cumulés' },
        {
          kind: 'para',
          text:
            'Avec des classes, on ne connaît plus chaque valeur. On trace alors le **polygone des ' +
            'effectifs cumulés**. Chaque point a pour abscisse la **borne supérieure** d\'une classe. Il ' +
            'a pour ordonnée l\'effectif cumulé de cette classe. Par exemple, à la fin de la classe ' +
            '[4 ; 8[, on a déjà compté 13 données. On part de 0, sur la borne inférieure de la toute ' +
            'première classe. Puis on relie les points par des segments.',
        },
        {
          kind: 'featureTable',
          headers: ['Classe', 'nᵢ', 'nᵢ cumulé', 'Point du polygone'],
          rows: [
            ['départ', '', '0', '(0 ; 0)'],
            ['[0 ; 4[', '5', '5', '(4 ; 5)'],
            ['[4 ; 8[', '8', '13', '(8 ; 13)'],
            ['[8 ; 12[', '4', '17', '(12 ; 17)'],
            ['[12 ; 16[', '3', '20', '(16 ; 20)'],
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — lire la médiane sur le polygone',
          blocks: [
            {
              kind: 'para',
              text:
                'Seuil de la médiane : $n/2 = 10$. On part de 10 sur l\'axe des effectifs et on va ' +
                'jusqu\'au polygone. Puis on descend sur l\'axe des valeurs.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  {
                    fn: (x) => (x <= 4 ? (5 * x) / 4 : x <= 8 ? 5 + 2 * (x - 4) : x <= 12 ? 13 + x - 8 : 17 + (3 * (x - 12)) / 4),
                    tone: 'accent',
                    xMin: 0,
                    xMax: 16,
                  },
                ],
                shadedRegions: [
                  { from: 4, to: 8, upper: (x) => 5 + 2 * (x - 4), lower: () => 5, tone: 'good' },
                ],
                horizontalAsymptotes: [{ y: 10, label: 'seuil 10' }],
                axisOfSymmetry: { x: 6.5, label: 'médiane ≈ 6,5' },
                points: [
                  { x: 4, y: 5, label: '', tone: 'accent' },
                  { x: 8, y: 13, label: '', tone: 'accent' },
                  { x: 12, y: 17, label: '', tone: 'accent' },
                  { x: 16, y: 20, label: '', tone: 'accent' },
                  { x: 6.5, y: 10, label: '', tone: 'bad' },
                ],
                xMin: 0,
                xMax: 17,
                xTicks: [4, 6.5, 8, 12, 16],
                xTickLabels: { 6.5: '6,5' },
                yTicks: [5, 13, 17, 20],
                fixedYRange: { min: 0, max: 22 },
                xAxisLabel: 'valeur',
                yAxisLabel: 'effectif cumulé',
                caption:
                  'Polygone des effectifs cumulés. Le seuil 10 coupe le segment qui va de (4 ; 5) à ' +
                  '(8 ; 13) : on est donc dans la classe [4 ; 8[. On lit médiane ≈ 6,5. Le triangle vert ' +
                  'montre la proportionnalité utilisée par le calcul juste en dessous.',
              },
            },
            {
              kind: 'para',
              text:
                'Le seuil 10 tombe sur le segment qui relie $(4\\,;\\,5)$ et $(8\\,;\\,13)$. La médiane ' +
                'est donc dans la classe [4 ; 8[. On lit environ **6,5**.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Données regroupées en classes : interpolation',
          items: [
            'La lecture sur le polygone se calcule exactement. Sur le segment de la classe, l\'effectif ' +
              'cumulé monte de $n_{classe}$. Pendant ce temps, la valeur avance d\'une amplitude. C\'est ' +
              'une situation de **proportionnalité** (le triangle vert). Pour monter de ' +
              '$\\text{seuil} - CF_{avant}$, il faut donc avancer de ' +
              '$\\dfrac{\\text{seuil} - CF_{avant}}{n_{classe}} \\cdot \\text{amplitude}$.',
            'D\'abord, repère la **classe** où tombe le seuil, comme ci-dessus. Ensuite, trouve la valeur ' +
              'exacte par interpolation linéaire, le long de cette classe : ' +
              '$\\text{valeur} = L + \\dfrac{\\text{seuil} - CF_{avant}}{n_{classe}} \\cdot \\text{amplitude}$. ' +
              'Ici, L est la borne inférieure de la classe. Et $CF_{avant}$ est l\'effectif cumulé ' +
              '**juste avant** cette classe.',
            'Reprends les mêmes effectifs, regroupés en classes [0;4[/[4;8[/[8;12[/[12;16[. Le seuil de ' +
              'la médiane, 10, tombe dans [4;8[ (cumulés 5→13). Donc médiane = ' +
              '$4 + \\dfrac{10-5}{8}\\times 4 = 6{,}5$.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'seuil-cumule-widget',
          label: 'Manipule toi-même — le seuil, en valeurs isolées puis en classes',
          caption:
            'Deux façons de jouer. En valeurs isolées : règle les effectifs. La ligne du tableau qui ' +
            'atteint exactement le seuil devient rouge (« pas encore ! »). Celle qui le dépasse la ' +
            'première devient verte. Avec Q1 et les réglages de départ, tu es dans le cas-piège du ' +
            'texte. En classes : le polygone des effectifs cumulés apparaît. Suis la ligne du seuil ' +
            'jusqu\'au polygone, puis descends sur l\'axe. Le petit triangle violet est exactement la ' +
            'règle de trois de la formule d\'interpolation (médiane = 6,5 au départ).',
        },
        { kind: 'subheading', text: 'Le mode, sans aucun calcul' },
        {
          kind: 'para',
          text:
            'Le **mode**, c\'est simplement la valeur (ou la classe) de plus grand effectif : celle qui ' +
            'revient le plus souvent. Tu le lis directement sur un tableau déjà rangé, sans seuil ni cumul. ' +
            'Avec des classes, le mode est une classe : la **classe modale**. Une série qui a deux modes ' +
            'est dite **bimodale**.',
        },
        {
          kind: 'exemple',
          badge: 'liste brute ordonnée',
          formula: '1,8 — 1,8 — 2,6 — 2,6 — 2,6 — 2,6 — 2,7 — 2,9 — 3,0 — 3,1 — 3,1 — 3,1 — 3,3 — 3,3 — 3,5 — 3,9 — 4,0 — 4,1 — 4,1 — 4,3',
          steps: [{ tag: 'une fois triée', text: 'la valeur qui revient le plus souvent saute aux yeux : 2,6 apparaît 4 fois, plus qu\'aucune autre' }],
          result: { tag: 'mode', text: '2,6' },
        },
        {
          kind: 'exemple',
          badge: 'classe modale',
          formula: 'Classes [0 ; 4[, [4 ; 8[, [8 ; 12[, [12 ; 16[ — effectifs 5, 8, 4, 3',
          steps: [{ tag: 'plus grand effectif', text: '8, pour la classe [4 ; 8[' }],
          result: { tag: 'classe modale', text: '[4 ; 8[. Pour des données en classes, le mode est une classe, pas un nombre.' },
        },
        {
          kind: 'exemple',
          badge: 'deux modes',
          formula: '2 — 3 — 3 — 3 — 5 — 6 — 7 — 7 — 7 — 9',
          steps: [{ tag: 'compter', text: '3 et 7 apparaissent chacun 3 fois. Aucune autre valeur n\'apparaît autant.' }],
          result: { tag: 'série bimodale', text: 'deux modes : 3 et 7. Une série peut avoir plusieurs modes.' },
        },
        {
          kind: 'methode',
          label: 'Quelle valeur centrale choisir ?',
          items: [
            'Mathématiquement, les trois paramètres se valent. Mais pas dans toutes les situations !',
            '**Moyenne** : elle utilise toutes les données. Mais une valeur extrême la fait beaucoup ' +
              'bouger : un seul salaire énorme fait grimper toute une moyenne.',
            '**Médiane** : une valeur extrême ne la fait presque pas bouger. Mais elle ne regarde ' +
              'qu\'une seule position, et pas la forme du reste de la série.',
            '**Mode** : c\'est toujours une vraie valeur de la série, facile à lire. Mais il résume mal ' +
              'la série si les effectifs sont très étalés, ou s\'il y a plusieurs modes.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'valeur-aberrante-widget',
          label: 'Manipule toi-même — la valeur aberrante',
          caption:
            'Pousse le match exceptionnel vers la droite : la moyenne s\'envole, mais la médiane ne ' +
            'bouge pas. Ici, la médiane est la 5e valeur dans l\'ordre croissant. Le bouton « Match ' +
            'exceptionnel » retrouve exactement l\'application du basketteur, plus bas ' +
            '(moyenne 22,75, médiane 20).',
        },
        {
          kind: 'application',
          titre: 'Choisir la bonne statistique pour juger un athlète',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [],
              points: [
                { x: 1, y: 18, label: '', tone: 'accent' },
                { x: 2, y: 22, label: '', tone: 'accent' },
                { x: 3, y: 15, label: '', tone: 'accent' },
                { x: 4, y: 20, label: '', tone: 'accent' },
                { x: 5, y: 19, label: '', tone: 'accent' },
                { x: 6, y: 17, label: '', tone: 'accent' },
                { x: 7, y: 21, label: '', tone: 'accent' },
                { x: 8, y: 50, label: 'match exceptionnel', tone: 'bad', labelPos: 'left' },
              ],
              horizontalAsymptotes: [{ y: 22.75 }, { y: 20 }],
              textLabels: [
                { x: 8.45, y: 24.6, text: 'moyenne ≈ 22,75', tone: 'ink', anchor: 'end' },
                { x: 8.45, y: 15.6, text: 'médiane = 20', tone: 'ink', anchor: 'end' },
              ],
              xMin: 0.5,
              xMax: 8.5,
              xTicks: [1, 2, 3, 4, 5, 6, 7, 8],
              yTicks: [20, 30, 40, 50],
              xAxisLabel: 'match',
              yAxisLabel: 'points marqués',
              caption:
                '8 matchs d\'un basketteur, dont un exceptionnel à 50 points. Ce seul match tire la ' +
                'moyenne (22,75) vers le haut. La médiane vaut 20 : avec la règle du seuil, ' +
                '$\\dfrac{n}{2} = 4$, et la 5e valeur dans l\'ordre croissant est 20. Elle reste proche ' +
                'du niveau habituel des 7 autres matchs.',
            },
          ],
          text:
            "En sport, choisir entre moyenne, médiane et mode change complètement l'histoire qu'on " +
            "raconte. Prends la moyenne de points par match d'un basketteur. Une seule performance " +
            "exceptionnelle à 50 points peut la tirer vers le haut. La médiane, elle, ne bouge presque " +
            "pas à cause de ce match. Elle montre mieux son niveau « habituel ». Un entraîneur compare " +
            "parfois deux joueurs de même moyenne. Il regarde alors leur dispersion : à quel point leurs " +
            "scores changent d'un match à l'autre. Souvent, il préfère le joueur régulier, dont les " +
            "scores varient peu. L'autre alterne les matchs exceptionnels et les matchs catastrophiques, " +
            "même à moyenne égale. Le mode, lui, montre le score le plus fréquent d'un joueur. Il aide à " +
            "prévoir ce que le joueur va le plus probablement marquer au prochain match. Ce n'est pas la " +
            "même chose que ce qu'il marque « en moyenne ».",
          domaines: ['Sport', 'Analyse de données'],
        },
        {
          kind: 'entrainement',
          title: 'Paramètres de position',
          generatorId: 'gen33',
          description: [
            'Détermine médiane, Q1, Q3, min, max et mode. En données discrètes, ou par lecture ' +
              'graphique interactive sur le polygone des effectifs cumulés (classes, avec ' +
              'interpolation).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 33. Paramètres de position »',
        },
        {
          kind: 'astuce',
          label: 'Moyenne ou médiane\u00a0? Le test du retrait',
          text:
            'Pour décider, retire la valeur la plus éloignée des autres et recalcule les deux ' +
            'indicateurs. Si la moyenne bouge beaucoup alors que la médiane ne bouge presque pas, une ' +
            'valeur extrême tire la moyenne. La **médiane** est alors plus représentative : elle résume ' +
            'mieux la série. Si les deux bougent à peine et restent proches, aucune valeur n\'est à ' +
            'part. Les deux indicateurs **se valent**. La moyenne n\'est donc pas « toujours la ' +
            'meilleure » parce qu\'elle utilise toutes les valeurs. Et la médiane non plus.',
        },
        {
          kind: 'entrainement',
          title: 'Moyenne ou médiane\u00a0? La valeur aberrante',
          generatorId: 'gen110',
          description: [
            'Calcule la moyenne et la médiane d\'une série brute (salaires, trajets, prix, notes…). ' +
              'Recommence sans la valeur la plus éloignée. Puis décide quel indicateur est le plus ' +
              'représentatif : parfois la médiane, parfois les deux se valent.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 110. Moyenne ou médiane ? La valeur aberrante »',
        },
      ],
    },
    {
      id: 'boite',
      number: 5,
      title: 'La boîte à moustaches',
      kicker: 'min, Q1, médiane, Q3, max — un résumé visuel en 5 nombres',
      titreCourt: 'Boîte à moustaches',
      partie: 'Moyenne, médiane, quartiles',
      essentiel: [
        'La boîte à moustaches résume une série en cinq nombres : minimum, Q1, médiane, Q3, maximum. La boîte couvre $[Q_1\\,;\\,Q_3]$ : la moitié centrale de la série.',
        'Ses quatre parties contiennent chacune environ 25 % des valeurs, quelle que soit leur longueur. L\'**écart interquartile** $Q_3 - Q_1$ est la largeur de la boîte.',
        'Pour comparer deux boîtes, regarde d\'abord la médiane : la plus grande est le trait le plus à droite. Ensuite, la série la plus dispersée a la boîte la plus large.',
      ],
      cartes: [
        { question: 'Quels sont les cinq nombres d\'une boîte à moustaches ?', reponse: 'Le minimum, Q1, la médiane, Q3 et le maximum.' },
        { question: 'Q1 = 6 et Q3 = 9 : que vaut l\'écart interquartile ?', reponse: '$Q_3 - Q_1 = 9 - 6 = 3$.' },
        { question: 'Quelle part des valeurs contient une moustache très longue ?', reponse: 'Environ 25 %, comme chaque partie. Une moustache longue veut dire que ses valeurs sont étalées.' },
      ],
      blocks: [
        { kind: 'video', title: 'La boîte à moustaches', youtubeId: 'CMzCmWA9YTg' },
        {
          kind: 'intuition',
          label: 'Pour visualiser les quartiles',
          text:
            'Imagine toute la classe alignée, du plus petit au plus grand. On la coupe en quatre groupes ' +
            'de même taille. Q1 est la frontière après le premier quart de la file. Q3 est la frontière ' +
            'après les trois quarts. La **boîte** de la boîte à moustaches, c\'est exactement le groupe du ' +
            'milieu. C\'est la moitié des élèves qui ne sont ni parmi les plus petits, ni parmi les plus grands.',
        },
        {
          kind: 'para',
          text:
            'La **boîte à moustaches** (en anglais **box-plot**) résume une série en cinq nombres ' +
            'seulement : minimum, Q1, médiane, Q3, maximum. La **boîte** va de Q1 à Q3, sur l\'intervalle ' +
            '[Q1 ; Q3]. Elle contient donc la moitié « centrale » de la série. Les **moustaches**, elles, ' +
            'vont jusqu\'au minimum et jusqu\'au maximum.',
        },
        {
          kind: 'para',
          text:
            'Reprends la série des étapes 3 et 4 : valeurs 2, 6, 9, 12 ; effectifs 5, 8, 4, 3. Tu y as ' +
            'déjà trouvé les cinq nombres : min = 2, Q1 = 6, médiane = 6, Q3 = 9, max = 12. Il ne reste ' +
            'qu\'à les placer sur un axe.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'boxPlot',
            series: [{ min: 2, q1: 6, median: 6, q3: 9, max: 12 }],
            xAxisLabel: 'x',
            caption:
              'La série des étapes 3 et 4 : min=2, Q1=6, médiane=6, Q3=9, max=12. La boîte va de Q1 ' +
              'à Q3, les moustaches vont jusqu\'aux extrêmes. Ici, la médiane est collée au bord gauche de la boîte.',
          },
        },
        {
          kind: 'definition',
          label: 'Écart interquartile',
          items: [
            'L\'**écart interquartile** est la largeur de la boîte : $Q_3 - Q_1$.',
            'Sur l\'exemple : $9 - 6 = 3$. La moitié centrale de la série tient dans un intervalle de ' +
              'longueur 3.',
          ],
        },
        {
          kind: 'para',
          text:
            'La boîte et les moustaches découpent la série en **quatre parties** : moustache gauche, ' +
            'moitié gauche de la boîte, moitié droite, moustache droite. Chacune contient environ ' +
            '**25 %** des valeurs, même si leurs longueurs sont très différentes ! Une partie courte veut ' +
            'dire que ses valeurs sont **serrées**. Une partie longue veut dire qu\'elles sont **étalées**.',
        },
        {
          kind: 'astuce',
          label: 'Lire l\'asymétrie',
          text:
            'Parfois, la médiane est au milieu de la boîte et les deux moustaches ont la même longueur. ' +
            'La série est alors à peu près **symétrique**. Ici, la médiane est collée au bord gauche ' +
            '(Q1 = médiane = 6). Beaucoup de valeurs sont regroupées à 6, et la partie droite est plus ' +
            'étalée. La série est **asymétrique** : elle s\'étire vers les grandes valeurs.',
        },
        {
          kind: 'atelier',
          tag: 'boite-moustaches-vivante-widget',
          label: 'Manipule toi-même — une boîte à moustaches vivante',
          caption:
            'Déplace les points : la boîte se redessine en direct. Pousse la plus grande valeur vers ' +
            'la droite : seule la moustache droite s\'allonge. La boîte et la médiane ne bougent pas. ' +
            'Au départ, tu retrouves la boîte de la série suivie depuis l\'étape 3 : Q1 = médiane = 6.',
        },
        {
          kind: 'methode',
          label: 'Comparer deux boîtes à moustaches',
          items: [
            'Deux questions reviennent tout le temps. Quelle série a la **médiane** la plus grande ? ' +
              'C\'est celle dont le trait vertical, dans la boîte, est le plus à droite. Et quelle série ' +
              'est la **plus dispersée** ? C\'est celle qui a la boîte la plus large, mesurée par ' +
              'l\'**écart interquartile** Q3 − Q1.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'boxPlot',
            series: [
              { label: 'A', min: 2, q1: 5, median: 8, q3: 12, max: 15, tone: 'accent', iqrLabel: 'IQR = 7' },
              { label: 'B', min: 1, q1: 4, median: 6, q3: 9, max: 11, tone: 'good', iqrLabel: 'IQR = 5' },
            ],
            xAxisLabel: 'x',
            ticks: [0, 2, 4, 6, 8, 10, 12, 14, 16],
            caption:
              'IQR : l\'écart interquartile, en anglais. Série A : min 2 / Q1 5 / méd. 8 / Q3 12 / max 15 ' +
              '(IQR = 7). Série B : min 1 / Q1 4 / méd. 6 / Q3 9 / max 11 (IQR = 5). A a la médiane la ' +
              'plus grande **et** la boîte la plus large.',
          },
        },
        {
          kind: 'astuce',
          label: 'La largeur de la boîte, un indice de confiance',
          text:
            'Plus la boîte est **étroite**, plus les valeurs centrales sont serrées autour de la ' +
            'médiane. La médiane résume alors bien toute la série. Une boîte **large** signale ' +
            'l\'inverse. La médiane reste un bon centre, mais elle est moins représentative. Les ' +
            'valeurs sont en effet beaucoup plus étalées autour d\'elle. Sur l\'exemple ci-dessus, la ' +
            'médiane de B (la boîte la plus étroite) est donc la plus représentative des deux.',
        },
        {
          kind: 'historique',
          titre: 'Le statisticien qui dessinait des boîtes',
          text:
            'La boîte à moustaches a été inventée par le statisticien américain **John Tukey**, vers ' +
            '1970. Il l\'a rendue célèbre en 1977 dans son livre « Exploratory Data Analysis » ' +
            '(l\'analyse exploratoire des données). Son idée : avant de faire de longs calculs, il faut ' +
            '**regarder** les données. Pour cela, on trace à la main, en quelques minutes, des dessins ' +
            'simples. On doit aussi à Tukey le mot « bit », l\'unité d\'information de l\'informatique.',
        },
        {
          kind: 'entrainement',
          title: 'Boîte à moustaches',
          generatorId: 'gen36',
          description: [
            'Construis une boîte à moustaches en plaçant les 5 marqueurs sur un axe ' +
              'interactif. Relève ses 5 valeurs. Ou compare deux séries (médiane, écart ' +
              'interquartile).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 36. Boîte à moustaches »',
        },
      ],
    },
    {
      id: 'dispersion',
      number: 6,
      title: 'Étendue, variance et écart-type',
      kicker: 'à quel point les valeurs s\'écartent-elles de la moyenne ?',
      titreCourt: 'Variance et écart-type',
      partie: 'Mesurer la dispersion',
      essentiel: [
        'Étendue : max − min. Variance : $V = \\dfrac{\\Sigma(x_i-\\bar{x})^2 \\cdot n_i}{n}$, la moyenne des carrés des écarts à $\\bar{x}$. Écart-type : $\\sqrt{V}$, dans la même unité que les données.',
        'Sur cette plateforme, on divise toujours par n (σx sur la calculatrice). L\'écart-type se calcule à partir de la variance arrondie à 2 décimales.',
        'Si $y = ax + b$ : $\\bar{y} = a\\,\\bar{x} + b$, $V_y = a^2\\,V_x$ et $\\sigma_y = |a|\\,\\sigma_x$. Le nombre b ajouté ne change aucune dispersion.',
      ],
      cartes: [
        { question: 'Pourquoi interpréter l\'écart-type plutôt que la variance ?', reponse: 'L\'écart-type est dans la même unité que les données. La variance, elle, est en unité au carré.' },
        { question: 'La variance vaut 10,95 : que vaut l\'écart-type ?', reponse: '$\\sqrt{10{,}95} \\approx 3{,}31$.' },
        { question: 'Une prime de 50 € pour chaque employé : que devient l\'écart-type des salaires ?', reponse: 'Il ne change pas : un nombre ajouté à toutes les valeurs ne change jamais la dispersion.' },
        { question: '$y = 1{,}8\\,x + 32$ et $V_x = 16$ : que vaut $V_y$ ?', reponse: '$1{,}8^2 \\times 16 = 51{,}84$ ; le $+32$ n\'intervient pas.' },
      ],
      blocks: [
        { kind: 'video', title: 'Étendue, variance et écart-type', youtubeId: 'C7z8U5OC_QI' },
        {
          kind: 'intuition',
          label: 'Pourquoi un nombre pour la dispersion ?',
          text:
            'Deux groupes d\'élèves peuvent avoir exactement la même moyenne, 12/20, sans se ressembler du ' +
            'tout. Dans l\'un, presque tout le monde a entre 10 et 14. Dans l\'autre, la moitié a 20/20 et ' +
            'l\'autre moitié a 4/20. La moyenne seule ne fait **aucune** différence entre ces deux ' +
            'groupes. Il faut un autre nombre, qui mesure à quel point les valeurs s\'écartent du centre. ' +
            'C\'est tout le sujet de cette étape.',
        },
        {
          kind: 'para',
          text:
            'La **moyenne** résume le centre d\'une série. Mais deux séries de même moyenne peuvent être ' +
            'très différentes. L\'une est serrée autour de x̄, l\'autre très étalée. Ces trois paramètres ' +
            'mesurent justement cet étalement : on l\'appelle la **dispersion**.',
        },
        { kind: 'subheading', text: 'L\'étendue' },
        {
          kind: 'para',
          text:
            'C\'est le plus simple des trois : $\\text{étendue} = \\max - \\min$. Il est rapide à ' +
            'calculer. Mais il ne tient compte que des deux valeurs extrêmes. Il ne voit rien de ce qui ' +
            'se passe entre les deux.',
        },
        { kind: 'subheading', text: 'La variance et l\'écart-type' },
        {
          kind: 'definition',
          label: 'Formules',
          items: [
            'Variance : c\'est la moyenne des carrés des écarts à x̄. L\'écart d\'une valeur, c\'est cette ' +
              'valeur moins la moyenne. On a : $V = \\dfrac{\\Sigma(x_i-\\bar{x})^2 \\cdot n_i}{n} = ' +
              '\\dfrac{(x_1-\\bar{x})^2 n_1 + (x_2-\\bar{x})^2 n_2 + \\ldots}{n_1+n_2+\\ldots}$.',
            'Écart-type : c\'est sa racine carrée, $\\text{écart-type} = \\sqrt{V}$. Il est dans la même ' +
              'unité que les données. La variance, elle, est en unité au carré.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Ce que représente concrètement l\'écart-type',
          text:
            'Tu as déjà mesuré la distance entre deux nombres sur une droite graduée : $|a-b|$. ' +
            'L\'écart-type, c\'est un peu la même idée, résumée en un seul nombre pour toute la série. ' +
            'C\'est à peu près la distance **habituelle** entre une valeur de la série et la moyenne. Un ' +
            'petit écart-type veut dire que les valeurs sont proches de x̄. Un grand écart-type veut dire ' +
            'qu\'elles s\'en éloignent beaucoup, en moyenne.',
        },
        {
          kind: 'rappel',
          label: 'Convention de calcul sur cette plateforme',
          items: [
            'Sur cette plateforme, la variance se calcule **toujours** en divisant par l\'effectif total ' +
              'n, jamais par n−1. On calcule ensuite l\'écart-type : c\'est la racine carrée de la ' +
              'variance **déjà arrondie à 2 décimales**. Ne le calcule jamais avec la variance non ' +
              'arrondie. Respecte bien cet ordre : c\'est nécessaire pour retomber exactement sur la ' +
              'valeur vérifiée par le générateur !',
          ],
        },
        {
          kind: 'attention',
          label: 'Avec la calculatrice',
          text:
            'En mode statistique, ta calculatrice affiche souvent **deux** écarts-types : σx (ou σn) ' +
            'et sx (ou σn−1). Sur cette plateforme, prends toujours **σx** : il divise par n, comme la ' +
            'formule de cette étape. La touche sx, elle, divise par n − 1 et donne une valeur un peu ' +
            'plus grande. Elle sert à d\'autres usages, plus tard. Attention aussi : la calculatrice ' +
            'calcule σx à partir de la variance non arrondie. Pour retomber sur la valeur du ' +
            'générateur, arrondis d\'abord la variance à 2 décimales, puis prends sa racine.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — la série des sections 3 et 4',
          blocks: [
            { kind: 'para', text: 'Moyenne trouvée à l\'étape 3 : $\\bar{x} = 6{,}5$.' },
            {
              kind: 'featureTable',
              headers: ['xᵢ', 'nᵢ', '(xᵢ−x̄)²·nᵢ'],
              rows: [
                ['2', '5', '(2−6,5)²×5 = 101,25'],
                ['6', '8', '(6−6,5)²×8 = 2'],
                ['9', '4', '(9−6,5)²×4 = 25'],
                ['12', '3', '(12−6,5)²×3 = 90,75'],
              ],
            },
            { kind: 'para', text: 'Somme : $101{,}25+2+25+90{,}75=219$, $n=20$. Variance : $V = 219/20 = 10{,}95$.' },
            { kind: 'para', text: 'Écart-type : $\\sqrt{10{,}95} \\approx 3{,}31$.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — x̄ donné, n = 24',
          blocks: [
            { kind: 'para', text: 'x̄ = 10 (donné) :' },
            {
              kind: 'featureTable',
              headers: ['xᵢ', 'nᵢ', '(xᵢ−x̄)²·nᵢ'],
              rows: [
                ['6', '5', '(6−10)²×5 = 80'],
                ['8', '8', '(8−10)²×8 = 32'],
                ['12', '4', '(12−10)²×4 = 16'],
                ['14', '7', '(14−10)²×7 = 112'],
              ],
            },
            { kind: 'para', text: 'Somme : $80+32+16+112=240$, $n=24$. Variance : $240/24=10$ (exacte, pas d\'arrondi ici).' },
            { kind: 'para', text: 'Écart-type : $\\sqrt{10} \\approx 3{,}16$. Ici, c\'est un vrai arrondi : on écrit « ≈ », pas « = ».' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'dispersion-comparee-widget',
          label: 'Manipule toi-même — même moyenne, dispersion différente',
          caption:
            'Déplace les points : x̄, la variance et l\'écart-type se recalculent en direct, avec la ' +
            'bande x̄ ± σ. Compare les deux réglages. Ils ont la même moyenne, 12. Mais l\'écart-type ' +
            'vaut 1,1 pour la série serrée, et 8 pour l\'exemple du texte (moitié à 4, moitié à 20).',
        },
        {
          kind: 'application',
          titre: 'Surveiller une chaîne de production avec l\'écart-type',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [],
              axisOfSymmetry: { x: 50, label: 'cible (x̄ = 50 mm)' },
              points: [
                { x: 48, y: 1, label: 'lot A — écart-type faible', tone: 'good', labelPos: 'above' },
                { x: 49, y: 1, label: '', tone: 'good' },
                { x: 50, y: 1, label: '', tone: 'good' },
                { x: 51, y: 1, label: '', tone: 'good' },
                { x: 52, y: 1, label: '', tone: 'good' },
                { x: 35, y: 2, label: 'lot B — écart-type élevé', tone: 'bad', labelPos: 'below' },
                { x: 42, y: 2, label: '', tone: 'bad' },
                { x: 50, y: 2, label: '', tone: 'bad' },
                { x: 58, y: 2, label: '', tone: 'bad' },
                { x: 65, y: 2, label: '', tone: 'bad' },
              ],
              xMin: 30,
              xMax: 70,
              xTicks: [40, 50, 60],
              fixedYRange: { min: 0, max: 3 },
              showYAxis: false,
              xAxisLabel: 'mesure (mm)',
              yAxisLabel: 'lot',
              caption:
                'Deux lots de 5 pièces, avec **exactement** la même moyenne : x̄ = 50 mm, la cible. Le ' +
                'lot A (vert) est bien centré **et** serré : la machine est bien réglée. Le lot B (rouge) ' +
                'a la même moyenne, mais une dispersion bien plus large. C\'est un signal d\'alerte, même ' +
                'si la cible est atteinte en moyenne.',
            },
          ],
          image: {
            src: '/images/application/quality-control-steel.jpg',
            alt: 'Ouvrier effectuant un contrôle qualité dans une aciérie',
            caption: 'Contrôle qualité dans une usine sidérurgique, Tarente, 1963. Touring Club Italiano, CC BY-SA 4.0, via Wikimedia Commons.',
          },
          text:
            "Dans une usine, une machine fabrique des pièces. Elle vise toujours une valeur cible : un " +
            "diamètre, une masse, une épaisseur. Mais deux pièces ne sont jamais parfaitement identiques. " +
            "Le contrôle qualité mesure régulièrement un échantillon de pièces. Il calcule leur " +
            "**moyenne** : reste-t-on bien sur la cible ? Il calcule aussi leur **écart-type** : les " +
            "pièces sont-elles toutes proches les unes des autres, ou très étalées ? Un écart-type qui " +
            "grimpe est un signal d'alerte, même si la moyenne reste bonne. Cela veut dire que la machine " +
            "se dérègle. De plus en plus de pièces risquent alors de sortir des tolérances, les écarts " +
            "permis. C'est exactement l'idée de l'atelier ci-dessus : deux séries de même moyenne peuvent " +
            "raconter une histoire très différente, selon leur dispersion.",
          domaines: ['Industrie', 'Contrôle qualité'],
        },
        {
          kind: 'rappel',
          label: 'Variance de données groupées en classes',
          items: [
            'Comme pour la moyenne, chaque classe est représentée par son **centre** $x_i$, la moyenne ' +
              'de ses deux bornes. On ne prend jamais une borne.',
            'On calcule d\'abord $\\bar{x}$ avec ces centres, chacun multiplié par son effectif. Puis on ' +
              'calcule la variance avec la même formule : $V = \\dfrac{\\Sigma(x_i-\\bar{x})^2 \\cdot n_i}{n}$, ' +
              'et $\\sigma = \\sqrt{V}$. Comme pour la moyenne, on obtient une **valeur approchée**.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Paramètres de dispersion',
          generatorId: 'gen34',
          description: [
            'Calcule la variance puis l\'écart-type d\'une série. Soit une série discrète dont x̄ est ' +
              'donné. Soit des données groupées en classes : tu calcules alors d\'abord les centres et ' +
              'x̄ toi-même.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 34. Paramètres de dispersion »',
        },
        { kind: 'subheading', text: 'Transformer toutes les données : l\'effet de y = ax + b' },
        {
          kind: 'para',
          text:
            'Parfois, on transforme **toutes** les valeurs d\'une série de la même façon. Par exemple : une ' +
            'prime de 50 € pour chaque employé, une hausse de 3 %, un changement d\'unité… Inutile de tout ' +
            'recalculer. On écrit la transformation sous la forme $y = a\\,x + b$. Ici, $a$ est le nombre ' +
            'qui multiplie chaque valeur, et $b$ le nombre ajouté ensuite. Puis on applique les règles du ' +
            'tableau.',
        },
        {
          kind: 'featureTable',
          headers: ['Indicateur', 'Effet de y = ax + b'],
          rows: [
            ['Moyenne', '$\\bar{y} = a\\,\\bar{x} + b$ : elle suit toute la transformation'],
            ['Médiane', 'même effet : multipliée par $a$, puis $+\\,b$'],
            ['Étendue', 'multipliée par $|a|$ ; $b$ ne change rien'],
            ['Variance', '$V_y = a^2\\,V_x$ ; $b$ ne change rien'],
            ['Écart-type', '$\\sigma_y = |a|\\,\\sigma_x$ ; $b$ ne change rien'],
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi b ne change pas la dispersion ?',
          text:
            'Ajouter $b$ à toutes les valeurs déplace la série d\'un bloc. C\'est comme si on faisait ' +
            'glisser tous les points sur la droite graduée. Le centre bouge, mais les écarts entre les ' +
            'valeurs restent les mêmes. Multiplier par $a$, au contraire, étire (ou resserre) la série. ' +
            'Les écarts sont multipliés par $|a|$. Et la variance est une moyenne de **carrés** d\'écarts : ' +
            'elle est donc multipliée par $a^2$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — conversion en degrés Fahrenheit',
          blocks: [
            {
              kind: 'para',
              text:
                'Des températures ont pour moyenne $\\bar{x} = 15$ °C, médiane 14 °C, étendue 12 °C, ' +
                'variance $V_x = 16$ et écart-type $\\sigma_x = 4$ °C. Pour les convertir en degrés ' +
                'Fahrenheit, on multiplie par 1,8 puis on ajoute 32 : $y = 1{,}8\\,x + 32$.',
            },
            { kind: 'para', text: 'Moyenne : $\\bar{y} = 1{,}8 \\times 15 + 32 = 59$ °F. Médiane : $1{,}8 \\times 14 + 32 = 57{,}2$ °F.' },
            {
              kind: 'para',
              text:
                'Étendue : $1{,}8 \\times 12 = 21{,}6$ °F. Écart-type : $\\sigma_y = 1{,}8 \\times 4 = 7{,}2$ °F. ' +
                'Variance : $V_y = 1{,}8^2 \\times 16 = 3{,}24 \\times 16 = 51{,}84$. Le $+32$ n\'intervient ' +
                'dans aucun de ces trois calculs.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'Un nombre ajouté à toutes les valeurs ne change **jamais** la dispersion. Avec une prime de ' +
            '50 € pour tous, l\'écart-type des salaires reste le même : surtout pas « $\\sigma + 50$ » ! ' +
            'La variance est multipliée par $a^2$, pas par $a$. Et un écart-type n\'est jamais négatif : ' +
            'si $a < 0$, on multiplie par $|a|$.',
        },
        {
          kind: 'entrainement',
          title: 'Effet d\'une transformation des données',
          generatorId: 'gen108',
          description: [
            'Prime pour tous, hausse en %, changement d\'unité, °C → °F. Écris la transformation ' +
              'y = ax + b. Puis déduis les nouveaux indicateurs (moyenne, médiane, étendue, ' +
              'variance, écart-type) sans recalculer la série.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 108. Effet d\'une transformation des données »',
        },
      ],
    },
    {
      id: 'tchebychev',
      number: 7,
      title: 'L\'inégalité de Bienaymé-Tchebychev',
      kicker: 'au moins (1 − 1⁄k²) × 100 % des valeurs dans [x̄ − kσ ; x̄ + kσ]',
      titreCourt: 'Inégalité de Bienaymé-Tchebychev',
      partie: 'Mesurer la dispersion',
      essentiel: [
        'Pour **n\'importe quelle série** et pour tout $k > 1$, au moins $\\left(1 - \\dfrac{1}{k^2}\\right) \\times 100\\,\\%$ des valeurs se trouvent dans $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$.',
        'C\'est une garantie minimale, souvent dépassée. On arrondit dans le sens qui la garde vraie : un pourcentage vers le bas, un nombre d\'individus vers le haut.',
      ],
      cartes: [
        { question: 'k = 2 : quel pourcentage minimal des valeurs dans $[\\bar{x}-2\\sigma\\,;\\,\\bar{x}+2\\sigma]$ ?', reponse: '$1 - \\dfrac{1}{4} = \\dfrac{3}{4}$ : au moins 75 % des valeurs.' },
        { question: '$\\bar{x} = 12$ et $\\sigma = 2$ : quel k correspond à l\'intervalle $[8\\,;\\,16]$ ?', reponse: '$k = 2$, car $8 = 12 - 2 \\cdot 2$ et $16 = 12 + 2 \\cdot 2$.' },
        { question: 'Quel k garantit au moins 95 % des valeurs ?', reponse: '$1 - \\dfrac{1}{k^2} = 0{,}95$, donc $k^2 = 20$ et $k = \\sqrt{20}$.' },
        { question: 'On trouve « au moins 18,75 élèves » : comment arrondir ?', reponse: 'Vers le haut : au moins 19 élèves.' },
      ],
      blocks: [
        { kind: 'video', title: 'L\'inégalité de Bienaymé-Tchebychev', youtubeId: '7aV5FgCHztI' },
        {
          kind: 'para',
          text:
            'Cette inégalité donne une garantie **pour n\'importe quelle série**, quelle que soit sa ' +
            'forme. Une part minimale des valeurs se trouve à moins de k écarts-types de la moyenne. Ça ' +
            'marche dès que k > 1 :',
        },
        {
          kind: 'definition',
          items: ['au moins une part $1 - \\dfrac{1}{k^2}$ des valeurs, soit $\\left(1 - \\dfrac{1}{k^2}\\right) \\times 100\\,\\%$, se trouve dans $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$'],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'domainLine',
            min: -1,
            max: 5,
            segments: [{ from: 0.5, to: 3.5 }],
            points: [
              { value: 0.5, closed: true, label: 'x̄−kσ', tone: 'good' },
              { value: 3.5, closed: true, label: 'x̄+kσ', tone: 'good' },
            ],
            extraTicks: [{ value: 2, label: 'x̄' }],
            rangeAnnotations: [{ from: 0.5, to: 3.5, label: 'au moins 75 % des valeurs (k=2)' }],
            axisLabel: 'x',
            axisLabelAtEnd: true,
            caption: 'zone centrale $[\\bar{x}-k\\sigma\\,;\\bar{x}+k\\sigma]$. Pour $k=2$, elle contient au moins $1-\\dfrac{1}{4} = 75\\,\\%$ des valeurs.',
          },
        },
        {
          kind: 'exemple',
          badge: 'k = 2',
          steps: [{ tag: 'formule', text: '$1 - 1/k^2 = 1 - 1/2^2 = 1 - 1/4 = 3/4$' }],
          result: { tag: 'résultat', text: 'au moins 75 % des valeurs se trouvent dans $[\\bar{x}-2\\sigma\\,;\\,\\bar{x}+2\\sigma]$' },
        },
        {
          kind: 'atelier',
          tag: 'tchebychev-garantie-widget',
          label: 'Manipule toi-même — une garantie minimale',
          caption:
            'Choisis la forme de la série et fais varier k. Le pourcentage réel de valeurs dans ' +
            '$[\\bar{x} - k\\sigma\\,;\\bar{x} + k\\sigma]$ ne descend jamais sous le minimum garanti, ' +
            '$\\left(1 - \\dfrac{1}{k^2}\\right) \\times 100\\,\\%$. C\'est vrai quelle que soit la forme. Et il le dépasse souvent largement.',
        },
        {
          kind: 'astuce',
          label: 'Dans l\'autre sens',
          text:
            'L\'énoncé donne parfois directement le pourcentage minimal garanti, au lieu de k. Tu peux ' +
            'alors retrouver k avec la formule dans l\'autre sens : $k = \\sqrt{100/(100-\\text{pourcentage})}$. ' +
            'Ensuite, tu calcules l\'intervalle $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$ ' +
            'comme d\'habitude.',
        },
        {
          kind: 'exemple',
          badge: 'à partir du pourcentage, k = √20',
          formula: 'On veut au moins 95 % des valeurs dans l\'intervalle. Quel k utiliser ?',
          steps: [
            { tag: 'poser l\'équation', text: '$1 - 1/k^2 = 0{,}95 \\iff 1/k^2 = 0{,}05 \\iff k^2 = 20$' },
            { tag: 'k strictement positif', text: '$k = \\sqrt{20}$' },
          ],
          result: { tag: 'résultat', text: 'c\'est dans l\'intervalle $[\\bar{x}-\\sqrt{20}\\sigma\\,;\\,\\bar{x}+\\sqrt{20}\\sigma]$ qu\'il y a au moins 95 % des valeurs' },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 40 élèves, une garantie souvent dépassée',
          blocks: [
            {
              kind: 'para',
              text:
                'Une classe de 40 élèves a obtenu une moyenne $\\bar{x}=12$, avec un écart-type ' +
                '$\\sigma=2$. Au moins combien d\'élèves ont une note entre 8 et 16 ?',
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — retrouver k.** L\'intervalle [8 ; 16] s\'écrit ' +
                '$[12-2 \\cdot 2\\,;\\,12+2 \\cdot 2]$. On est à 2 écarts-types de la moyenne, donc ' +
                '$k=2$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — appliquer l\'inégalité.** Au moins $1-1/2^2 = 75\\,\\%$ des élèves sont ' +
                'dans l\'intervalle : au moins $0{,}75 \\cdot 40 = 30$ élèves.',
            },
            { kind: 'para', text: '**Étape 3 — comparer avec la réalité.** Voici les vraies notes de la classe :' },
            {
              kind: 'featureTable',
              headers: ['Note', '6', '10', '12', '14', '18'],
              rows: [['Effectif', '1', '11', '16', '11', '1']],
            },
            {
              kind: 'para',
              text:
                'On vérifie : $\\bar{x} = 480/40 = 12$ et $V = (36+44+0+44+36)/40 = 4$, donc ' +
                '$\\sigma=2$ ✓. Entre 8 et 16, on trouve $11+16+11 = 38$ élèves, soit 95 %. C\'est bien ' +
                'plus que les 30 garantis.',
            },
            {
              kind: 'para',
              text:
                'Bienaymé-Tchebychev ne connaît pas la forme de la série. Sa garantie doit donc marcher ' +
                'pour **toutes** les séries. C\'est pour ça qu\'elle est souvent plus faible que la réalité.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Retrouver la moyenne',
          text:
            'L\'intervalle $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$ est **symétrique** autour de ' +
            '$\\bar{x}$ : la moyenne est pile au milieu. Si l\'énoncé te le donne sous la forme ' +
            '$[a\\,;\\,b]$, la moyenne est son centre : $\\bar{x} = \\dfrac{a+b}{2}$. Inutile de calculer k.',
        },
        {
          kind: 'piege',
          label: 'Arrondir sans perdre la garantie',
          text:
            'Bienaymé-Tchebychev donne une **garantie** (« au moins… »). Quand tu arrondis, fais-le ' +
            'toujours dans le sens qui garde cette garantie vraie. Un pourcentage minimal s\'arrondit ' +
            '**vers le bas**. Un nombre minimal d\'individus, lui, s\'arrondit **vers le haut**. C\'est ' +
            'un entier : « au moins 18,75 élèves » veut dire « au moins 19 élèves ». Les bornes d\'un ' +
            'intervalle s\'arrondissent **vers l\'extérieur** : la borne inférieure vers le bas, la ' +
            'borne supérieure vers le haut. Et k s\'arrondit lui aussi dans le sens qui garde la garantie ' +
            'vraie. Vers le bas si tu en déduis un pourcentage, vers le haut si tu en déduis un intervalle.',
        },
        {
          kind: 'historique',
          titre: 'Deux mathématiciens, une même inégalité',
          text:
            'Cette inégalité porte deux noms parce qu\'elle a été trouvée **deux fois**, par deux ' +
            'mathématiciens, chacun de son côté. Le Français **Irénée-Jules Bienaymé** la publie en ' +
            '1853. Le Russe **Pafnouti Tchebychev** la retrouve en 1867, et la démontre à sa façon. Plus ' +
            'tard, Tchebychev a reconnu que Bienaymé l\'avait trouvée avant lui. Son point fort n\'a pas ' +
            'changé depuis : elle marche pour n\'importe quelle série, sans rien savoir de sa forme.',
        },
        {
          kind: 'entrainement',
          title: 'Inégalité de Bienaymé-Tchebychev',
          generatorId: 'gen37',
          description: [
            'Applique l\'inégalité sous 8 variantes. À partir de k, retrouve l\'intervalle, le ' +
              'pourcentage minimal ou le nombre minimal d\'individus concernés. Ou fais le chemin dans ' +
              'l\'autre sens.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 37. Inégalité de Bienaymé-Tchebychev »',
        },
      ],
    },
    {
      id: 'comparaison',
      number: 8,
      title: 'Comparer deux séries statistiques',
      kicker: 'même centre ? même dispersion ? lire un seuil sur une courbe cumulée',
      titreCourt: 'Comparer deux séries',
      partie: 'Comparer, puis réviser',
      essentiel: [
        'Pour comparer deux séries, regarde le **centrage** : les médianes. Regarde la **dispersion** : le plus petit écart-type donne la série la plus homogène. Lis un **seuil** sur la courbe cumulée. Termine par une phrase d\'interprétation.',
        'Le pourcentage de valeurs entre a et b se lit en deux fois : cumulé(b) − cumulé(a).',
      ],
      cartes: [
        { question: 'De deux séries, laquelle est la plus homogène ?', reponse: 'Celle qui a le plus petit écart-type.' },
        { question: 'Comment lire le pourcentage de valeurs entre a et b sur une courbe cumulée ?', reponse: 'On lit le cumulé en b et le cumulé en a, puis on soustrait : cumulé(b) − cumulé(a).' },
        { question: 'Groupe A : médiane 12, écart interquartile 4 ; groupe B : médiane 10, écart interquartile 6. Conclusion ?', reponse: 'A réussit mieux (médiane plus grande) et de façon plus homogène (boîte plus étroite).' },
      ],
      blocks: [
        { kind: 'video', title: 'Comparer deux séries statistiques', youtubeId: 'ojdBYg8_mbY' },
        {
          kind: 'para',
          text:
            'Comparer deux séries, c\'est utiliser tous les outils précédents sur les deux séries à la ' +
            'fois. Quelle série a la **médiane** la plus grande ? C\'est une question de centrage. ' +
            'Laquelle a l\'**écart-type** le plus petit, et donc des valeurs plus proches les unes des ' +
            'autres ? C\'est une question de dispersion. On dit que cette série est la plus homogène. ' +
            'Les données peuvent venir de tableaux bruts, de résumés déjà calculés, ou de **courbes ' +
            'cumulées** à lire sur un graphique.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              {
                fn: (x) => {
                  const pts: [number, number][] = [[4, 0], [6, 1], [8, 4], [10, 10], [12, 15], [14, 18], [16, 20]]
                  for (let i = 1; i < pts.length; i++) {
                    const [x0, y0] = pts[i - 1]
                    const [x1, y1] = pts[i]
                    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
                  }
                  return 20
                },
                tone: 'accent',
                xMin: 4,
                xMax: 16,
              },
              {
                fn: (x) => {
                  const pts: [number, number][] = [[4, 0], [6, 3], [8, 9], [10, 13], [12, 15], [14, 19], [16, 20]]
                  for (let i = 1; i < pts.length; i++) {
                    const [x0, y0] = pts[i - 1]
                    const [x1, y1] = pts[i]
                    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
                  }
                  return 20
                },
                tone: 'good',
                xMin: 4,
                xMax: 16,
              },
            ],
            axisOfSymmetry: { x: 10, label: 'note 10' },
            horizontalAsymptotes: [{ y: 10 }, { y: 13 }],
            points: [
              { x: 10, y: 10, label: '', tone: 'accent' },
              { x: 10, y: 13, label: '', tone: 'good' },
            ],
            textLabels: [
              { x: 9.2, y: 4.2, text: 'groupe A', tone: 'accent', anchor: 'start' },
              { x: 6.6, y: 7.6, text: 'groupe B', tone: 'good', anchor: 'end' },
            ],
            xMin: 0,
            xMax: 17,
            xTicks: [4, 6, 8, 10, 12, 14, 16],
            yTicks: [5, 10, 13, 15, 20],
            fixedYRange: { min: 0, max: 22 },
            xAxisLabel: 'note',
            yAxisLabel: 'effectif cumulé',
            caption:
              'Notes sur 20 de deux groupes de 20 élèves. Effectifs pour les notes 6, 8, 10, 12, 14, 16 : ' +
              'A = 1, 3, 6, 5, 3, 2 ; B = 3, 6, 4, 2, 4, 1. À la note 10, on lit 10 élèves pour A, ' +
              'mais 13 pour B. Le groupe B compte donc plus d\'élèves à 10 ou moins.',
          },
        },
        {
          kind: 'para',
          text:
            'Voici les mêmes séries, résumées par leurs boîtes à moustaches (règle du seuil). Groupe A : ' +
            'min 6, Q1 = 10, médiane 12, Q3 = 14, max 16. Groupe B : min 6, Q1 = 8, médiane 10, ' +
            'Q3 = 14, max 16. Le groupe A a la médiane la plus grande **et** la boîte la plus ' +
            'étroite. Il réussit mieux, et de façon plus homogène.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'boxPlot',
            series: [
              { label: 'A', min: 6, q1: 10, median: 12, q3: 14, max: 16, tone: 'accent', iqrLabel: 'Q3 − Q1 = 4' },
              { label: 'B', min: 6, q1: 8, median: 10, q3: 14, max: 16, tone: 'good', iqrLabel: 'Q3 − Q1 = 6' },
            ],
            xAxisLabel: 'note',
            ticks: [4, 6, 8, 10, 12, 14, 16, 18],
            caption:
              'Groupe A : médiane 12, écart interquartile 4. Groupe B : médiane 10, écart ' +
              'interquartile 6. Même minimum et même maximum, mais pas du tout la même répartition.',
          },
        },
        {
          kind: 'methode',
          label: 'Les 4 types de questions',
          items: [
            '**Centrage** : comparer les deux médianes.',
            '**Dispersion** : comparer les deux écarts-types. Le plus petit donne la série la plus homogène.',
            '**Seuil** : lire un effectif (ou une fréquence) cumulé à une valeur donnée. Tu vas jusqu\'à ' +
              'la courbe, puis tu lis sur l\'axe des effectifs.',
            '**Interprétation** : traduire ces lectures en une phrase de conclusion correcte.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Lire un intervalle, pas seulement un seuil',
          text:
            'Pour répondre à « quel pourcentage se situe entre a et b ? », ne lis jamais ' +
            'l\'intervalle directement sur la courbe ! Lis le cumulé en b, puis le cumulé en a. Ensuite, ' +
            '**soustrais** les deux : cumulé(b) − cumulé(a).',
        },
        {
          kind: 'atelier',
          tag: 'deux-courbes-cumulees-widget',
          label: 'Manipule toi-même — deux séries, deux courbes cumulées',
          caption:
            'Les fréquences cumulées de deux séries, sur le même graphique. Déplace a : sur chaque ' +
            'courbe, tu lis le pourcentage des valeurs plus petites que a ou égales à a. Coche « Lire ' +
            'entre a et b ». Chaque pourcentage s\'obtient par cumulé(b) − cumulé(a), jamais d\'un seul ' +
            'coup. Les deux médianes se lisent au seuil de 50 %.',
        },
        {
          kind: 'application',
          titre: 'Comparer deux groupes de patients dans un essai clinique',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [],
              points: [
                { x: 5, y: 1, label: 'Traitement', tone: 'good', labelPos: 'below' },
                { x: 6, y: 1, label: '', tone: 'good' },
                { x: 6, y: 1.28, label: '', tone: 'good' },
                { x: 8, y: 1, label: '', tone: 'good' },
                { x: 12, y: 1, label: '', tone: 'good' },
                { x: 8, y: 2, label: 'Placebo', tone: 'bad', labelPos: 'below' },
                { x: 10, y: 2, label: '', tone: 'bad' },
                { x: 13, y: 2, label: '', tone: 'bad' },
                { x: 15, y: 2, label: '', tone: 'bad' },
                { x: 18, y: 2, label: '', tone: 'bad' },
              ],
              xMin: 2,
              xMax: 20,
              xTicks: [5, 10, 15, 20],
              fixedYRange: { min: 0, max: 3 },
              showYAxis: false,
              xAxisLabel: 'temps de guérison (jours)',
              yAxisLabel: 'groupe',
              caption:
                'Le groupe Traitement (vert) guérit en général plus vite **et** de façon plus homogène. ' +
                'Ses points sont serrés entre 5 et 12 jours. Deux patients ont guéri en 6 jours : leurs ' +
                'points sont empilés. Le groupe Placebo (rouge) est étalé de 8 à 18 jours. Mais les deux ' +
                'séries se chevauchent encore entre 8 et 12 jours. La différence est nette, sans être totale.',
            },
          ],
          image: {
            src: '/images/application/clinical-trial.jpg',
            alt: 'Essai clinique en laboratoire médical',
            caption: 'Analyse de données dans le cadre d\'un essai clinique.',
          },
          text:
            "Pour tester un nouveau médicament, les chercheurs forment deux groupes de patients " +
            "comparables. L'un reçoit le médicament. L'autre reçoit un placebo : un faux médicament, sans " +
            "principe actif. Ensuite, ils mesurent un indicateur sur chaque groupe : temps de guérison, " +
            "baisse de tension, etc. Ils comparent les deux séries **exactement** comme dans cette étape. " +
            "Quelle série a la médiane la plus favorable ? C'est le centrage. Laquelle est la plus " +
            "homogène ? Autrement dit, le médicament a-t-il le même effet sur tous les patients, ou un " +
            "effet très variable ? C'est la dispersion. Quelle part des patients dépasse un seuil donné ? " +
            "C'est la lecture d'un seuil. Une différence de médianes ne suffit jamais, à elle seule, pour " +
            "conclure qu'un médicament marche. Il faut aussi regarder si les deux séries se chevauchent " +
            "beaucoup ou peu. C'est exactement la question de dispersion de cette étape.",
          domaines: ['Médecine', 'Recherche clinique'],
        },
        {
          kind: 'entrainement',
          title: 'Comparaison de deux séries statistiques',
          generatorId: 'gen38',
          description: [
            'Compare deux séries sous 3 présentations : tableaux bruts, résumé déjà calculé, courbes ' +
              'cumulées. Travaille le centrage, la dispersion, la lecture d\'un seuil et ' +
              'l\'interprétation.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 38. Comparaison de deux séries statistiques »',
        },
      ],
    },
    {
      id: 'revision',
      number: 9,
      title: 'Révision — synthèse et vrai/faux',
      kicker: 'tout le chapitre sur un seul jeu de données, puis 350 affirmations en 10 thèmes',
      titreCourt: 'Révision et synthèse',
      partie: 'Comparer, puis réviser',
      essentiel: [
        'Trois façons de réviser. Un exercice de synthèse sur un seul jeu de données. Un détective d\'erreurs dans la copie d\'un élève. Et le quiz vrai/faux en 10 thèmes.',
      ],
      cartes: [
        { question: 'Une copie cherche la médiane sur la série brute, sans la ranger. Quelle est l\'erreur ?', reponse: 'La médiane se cherche par le rang. Il faut d\'abord ranger les valeurs par ordre croissant.' },
        { question: 'Une copie donne un écart-type de 10,95 pour une variance de 10,95. Quelle est l\'erreur ?', reponse: 'La racine est oubliée : $\\sigma = \\sqrt{10{,}95} \\approx 3{,}31$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Révision : la synthèse du chapitre', youtubeId: 'AN_L26bmYLg' },
        {
          kind: 'para',
          text:
            'Il y a trois façons de réviser ce chapitre. D\'abord, un **exercice de synthèse** sur un ' +
            'seul jeu de données. Il enchaîne la moyenne pondérée, la médiane et les quartiles, la ' +
            'boîte à moustaches, la dispersion et Bienaymé-Tchebychev. Ensuite, un **détective ' +
            'd\'erreurs** : tu cherches l\'erreur dans la copie d\'un élève. Enfin, un **quiz ' +
            'vrai/faux** qui couvre les 9 générateurs de ce chapitre.',
        },
        {
          kind: 'entrainement',
          title: 'Synthèse — Statistique descriptive complète',
          generatorId: 'gen35',
          description: [
            'Une seule histoire, du début à la fin : moyenne, médiane/Q1/Q3, boîte à moustaches, ' +
              'variance/écart-type, puis Bienaymé-Tchebychev (k=2).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 35. Synthèse — Statistique descriptive complète »',
        },
        {
          kind: 'entrainement',
          title: 'Détective d\'erreurs : statistique',
          generatorId: 'gen112',
          description: [
            'La copie d\'un élève contient une seule ligne fausse. Ce peut être une moyenne sans les ' +
              'effectifs, une médiane sur la série non rangée ou un seuil de Q1 atteint mais pas ' +
              'dépassé. Ce peut être aussi un mauvais effectif cumulé, une variance non divisée par n, ' +
              'une racine oubliée ou une moyenne des moyennes. Trouve-la, nomme l\'erreur, puis donne ' +
              'le résultat corrigé.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 112. Détective d\'erreurs : statistique »',
        },
        {
          kind: 'astuce',
          text:
            'Le thème « Médiane et quartiles » du quiz revient sur le piège du seuil. Un cumulé ' +
            'exactement égal au seuil ne le dépasse pas strictement. Tu l\'as vu à l\'étape 4. C\'est ' +
            'utile pour vérifier que tu as le bon réflexe !',
        },
        {
          kind: 'entrainement',
          title: 'Statistique descriptive à une variable — quiz vrai/faux',
          generatorId: 'gen59',
          description: [
            '350 affirmations déjà écrites, réparties en 10 thèmes qui reprennent tout ce ' +
              'chapitre. Un seul essai par question. La justification est toujours montrée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 59. Statistique descriptive à une variable — quiz vrai/faux »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Fréquences & effectifs',
        formulas: [
          { text: '$n_i$ = effectif de $x_i$, $n=\\Sigma n_i$' },
          { text: '$f_i = n_i/n$', condition: 'souvent exprimée en %' },
          { text: 'centre de la classe $[a\\,;\\,b[$ : $\\dfrac{a+b}{2}$' },
          { text: 'amplitude de la classe $[a\\,;\\,b[$ : $b-a$' },
        ],
      },
      {
        title: 'Moyenne pondérée',
        formulas: [
          { text: '$\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i}$' },
          { text: '$x_i$ = centre de la classe', condition: 'données regroupées en classes' },
          { text: '$\\bar{x} = \\Sigma(x_i \\cdot f_i)$', condition: 'avec les fréquences en nombre décimal' },
        ],
      },
      {
        title: 'Boîte à moustaches',
        formulas: [
          { text: '5 nombres : min, $Q_1$, médiane, $Q_3$, max' },
          { text: 'écart interquartile $= Q_3 - Q_1$', condition: 'largeur de la boîte' },
        ],
      },
      {
        title: 'Médiane, quartiles et mode',
        formulas: [
          {
            text: 'seuils : $n/2$ (médiane), $n/4$ ($Q_1$), $3n/4$ ($Q_3$)',
            condition: 'première valeur dont le cumulé dépasse strictement le seuil',
          },
          {
            text:
              '$\\text{valeur} = L + \\dfrac{\\text{seuil}-CF_{avant}}{n_{classe}} \\cdot ' +
              '\\text{amplitude}$',
            condition: 'interpolation linéaire, données en classes',
          },
          { text: 'mode = valeur (ou classe) de plus grand effectif' },
        ],
      },
      {
        title: 'Dispersion : variance et écart-type',
        formulas: [
          { text: '$\\text{étendue} = \\max - \\min$' },
          {
            text: '$V = \\dfrac{\\Sigma(x_i-\\bar{x})^2 \\cdot n_i}{n}$',
            condition: 'division par $n$, jamais $n-1$',
          },
          {
            text: '$\\text{écart-type} = \\sqrt{V}$',
            condition: 'depuis la variance déjà arrondie à 2 décimales',
          },
        ],
      },
      {
        title: 'Inégalité de Bienaymé-Tchebychev',
        formulas: [
          {
            text:
              'au moins $\\left(1-\\dfrac{1}{k^2}\\right)\\times 100\\%$ des valeurs dans ' +
              '$[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$',
            condition: 'valable pour tout $k>1$',
          },
          {
            text: '$k = \\sqrt{\\dfrac{100}{100-\\text{pourcentage}}}$',
            condition: 'sens réciproque — à partir du pourcentage voulu',
          },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Vocabulaire** — population, individu, caractère (discret ou continu), effectif $n_i$, ' +
        'effectif total $n$, fréquence $f_i = \\dfrac{n_i}{n}$.',
      '**Regroupement** — tableau de fréquences pour une liste discrète. Pour un caractère continu, ' +
        'classes $[\\text{inf}\\,;\\text{sup}[$ (sauf la dernière classe, fermée des deux côtés). Classes ' +
        'de même amplitude pour construire un histogramme. Ailleurs, les amplitudes peuvent être différentes.',
      '**Moyenne** — $\\bar{x} = \\dfrac{\\sum x_i \\cdot n_i}{\\sum n_i}$, jamais la moyenne des ' +
        'valeurs distinctes seules.',
      '**Position** — médiane / $Q_1$ / $Q_3$ = première valeur dont l\'effectif cumulé dépasse ' +
        '**strictement** le seuil ($\\dfrac{n}{2}$, $\\dfrac{n}{4}$, $\\dfrac{3n}{4}$). Interpolation ' +
        'linéaire pour des classes.',
      '**Boîte à moustaches** — 5 nombres : min, $Q_1$, médiane, $Q_3$, max. Écart interquartile ' +
        '$= Q_3 - Q_1$, la largeur de la boîte. Chaque partie contient environ 25 % des valeurs. Une ' +
        'médiane décentrée signale une série asymétrique.',
      '**Dispersion** — étendue $= \\max - \\min$. Variance $= \\dfrac{\\sum (x_i-\\bar{x})^2 \\cdot ' +
        'n_i}{n}$, division par $n$. Écart-type $= \\sqrt{\\text{variance}}$, calculé depuis la ' +
        'variance déjà arrondie.',
      '**Bienaymé-Tchebychev** — au moins $\\left(1-\\dfrac{1}{k^2}\\right) \\times 100\\,\\%$ des ' +
        'valeurs dans $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$, pour $k>1$ ($k=2$ → au moins ' +
        '$75\\,\\%$).',
      '**Comparer deux séries** — centrage (les médianes), dispersion (écart-type ou écart ' +
        'interquartile), lecture d\'un seuil sur les courbes cumulées, puis une phrase de conclusion.',
    ],
    checklist: {
      items: [
        'Ma colonne d\'effectifs cumulés se termine-t-elle bien par $n$ ? Et ma fréquence cumulée ' +
          'par 100 % ?',
        'Ai-je bien pris la première valeur dont le cumulé dépasse strictement le seuil ? Jamais ' +
          'celle qui l\'atteint tout juste.',
        'Ai-je divisé la somme des carrés d\'écarts par $n$, pas par $n-1$ ?',
        'Ai-je calculé l\'écart-type à partir de la variance déjà arrondie ?',
        'Sur ma calculatrice, ai-je lu $\\sigma_x$ (division par $n$), et pas $s_x$ ?',
      ],
    },
    forward:
      'Moyenne, médiane et écart-type reviennent tels quels dans le chapitre sur les ' +
      'statistiques à deux variables et la corrélation (en 5e, [[5e-4h/statistique-deux-variables]]). Ce sont les briques de base : tout le ' +
      'reste s\'appuie dessus.',
  },

  lexique: lexiqueStatistiqueDescriptive,
}
