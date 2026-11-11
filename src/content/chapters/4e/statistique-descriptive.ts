import type { ChapterContent } from '../../types'

export const statistiqueDescriptive: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 4,
  title: 'Statistique descriptive à une variable',
  slug: 'statistique-descriptive',
  lede:
    "Une série de mesures en vrac, ça ne dit rien à personne. Dans ce chapitre, tu vas construire " +
    "toute une boîte à outils pour la rendre lisible : tableau de fréquences, histogramme, " +
    "moyenne, médiane et quartiles, boîte à moustaches, variance et écart-type. À la fin, tu " +
    "sauras aussi comparer deux séries entre elles.",

  intro: {
    title: 'Avant de commencer : le vocabulaire de base',
    blocks: [
      { kind: 'video', title: 'Avant de commencer : le vocabulaire de base', youtubeId: '-zwX56lSXnA' },
      {
        kind: 'para',
        text:
          'La **statistique descriptive**, c\'est l\'étude d\'une **population** — l\'ensemble des ' +
          'individus observés. On l\'étudie à travers un **caractère** : la grandeur qu\'on ' +
          'mesure sur chaque individu. Dans ce chapitre, ce caractère est toujours ' +
          '**quantitatif** (un nombre). Et on n\'étudie jamais deux caractères en même temps — ' +
          'toujours un seul.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — population ou échantillon ?',
        items: [
          'Tu as rarement les données de toute la population. Le plus souvent, tu travailles ' +
            'sur un **échantillon** — un sous-ensemble de la population, sur lequel tu observes ' +
            'le caractère. Bonne nouvelle : toutes les formules de ce chapitre (moyenne, ' +
            'médiane, variance…) marchent pareil, que la série vienne de la population entière ' +
            'ou d\'un échantillon.',
        ],
      },
      {
        kind: 'rappel',
        label: 'Rappel — discret ou continu ?',
        items: [
          'Un caractère **discret** ne prend que des valeurs isolées, qu\'on peut compter une ' +
            'par une (un nombre de frères et sœurs, une pointure). Un caractère **continu** peut ' +
            'prendre n\'importe quelle valeur dans un intervalle (une taille, un temps). Pour un ' +
            'caractère continu, on ne peut le décrire qu\'après l\'avoir **regroupé en classes** ' +
            '— tu verras ça à la section 2.',
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
          'Avec ce vocabulaire, chaque section construit un outil pour répondre à une question ' +
          'précise. Où se trouve le « centre » de la série ? (moyenne, médiane) À quel point les ' +
          'valeurs sont-elles dispersées autour de ce centre ? (étendue, variance, écart-type) ' +
          'Et comment comparer deux séries entre elles ?',
      },
    ],
  },

  sections: [
    {
      id: 'frequences',
      number: 1,
      title: 'Organiser des données brutes : le tableau de fréquences',
      kicker: 'liste brute → valeur, effectif, fréquence, cumulés',
      blocks: [
        { kind: 'video', title: 'Organiser des données brutes : le tableau de fréquences', youtubeId: 'LnLwqGZ1POU' },
        {
          kind: 'para',
          text:
            'Une série statistique brute, c\'est une liste de valeurs **dans l\'ordre où elles ' +
            'ont été relevées**. Jamais triée, jamais organisée. La première étape, c\'est ' +
            'toujours de la transformer en **tableau de fréquences** : une ligne par valeur ' +
            'distincte, avec son effectif, sa fréquence, et les versions **cumulées** de ces ' +
            'deux colonnes.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Repère les valeurs **distinctes** de la série. Range-les par ordre croissant.',
            'Compte, pour chacune, son **effectif** nᵢ : le nombre de fois qu\'elle apparaît.',
            'Calcule sa **fréquence** fᵢ = nᵢ/n (souvent en %).',
            'Cumule colonne par colonne. L\'**effectif cumulé** à la ligne i, c\'est la somme ' +
              'des effectifs de cette ligne et de toutes celles d\'avant. La **fréquence ' +
              'cumulée** se déduit directement de l\'effectif cumulé — ne la recalcule jamais ' +
              'séparément.',
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
            'Pour représenter une série **discrète**, on trace un **diagramme en bâtons** : un ' +
            'bâton vertical au-dessus de chaque valeur xᵢ, de hauteur nᵢ. Les bâtons restent ' +
            '**séparés**, parce que le caractère ne prend que des valeurs isolées (on ne lit jamais ' +
            '5,5 livres). C\'est la grande différence avec l\'**histogramme** de la section 2 : ses ' +
            'barres sont **accolées**, parce qu\'elles couvrent des classes, des intervalles qui se ' +
            'suivent sans trou.',
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
              'Diagramme en bâtons de la série des livres : un bâton par valeur (3, 5, 7, 12), de ' +
              'hauteur 6, 7, 4, 3 — les bâtons ne se touchent pas.',
          },
        },
        {
          kind: 'astuce',
          label: 'Vérifier son tableau en un coup d\'œil',
          text:
            'La dernière ligne de la colonne effectif cumulé doit toujours valoir n, l\'effectif ' +
            'total. Et la dernière ligne de la fréquence cumulée doit toujours valoir 100 %. ' +
            'Sinon, tu as oublié une valeur — ou compté une valeur en trop !',
        },
        {
          kind: 'historique',
          titre: 'Compter les morts pour inventer la statistique',
          text:
            "En 1662, le marchand londonien **John Graunt** publie ses « Observations " +
            'naturelles et politiques... faites sur les registres de mortalité » — le tout ' +
            "premier ouvrage à transformer des données brutes en véritable connaissance. " +
            "Chaque semaine depuis 1592, les paroisses de Londres enregistraient les décès et " +
            'leurs causes, sans que personne ne les exploite vraiment. Graunt a l\'idée de les ' +
            'rassembler dans des tableaux organisés — exactement la démarche de cette section ' +
            '— et y découvre des régularités insoupçonnées : la proportion de garçons et de ' +
            "filles à la naissance reste étonnamment stable d'une année à l'autre, et il en " +
            "tire la toute première « table de mortalité » de l'histoire, un outil encore " +
            "utilisé aujourd'hui par les compagnies d'assurance. Aucun portrait authentifié de " +
            "Graunt n'a survécu — l'image parfois présentée comme la sienne est aujourd'hui " +
            'considérée comme un faux tardif.',
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
      ],
    },
    {
      id: 'histogramme',
      number: 2,
      title: 'Regrouper en classes : l\'histogramme',
      kicker: 'caractère continu → classes d\'amplitude constante → histogramme',
      blocks: [
        { kind: 'video', title: 'Regrouper en classes : l\'histogramme', youtubeId: 'oftzQYXj6tA' },
        {
          kind: 'para',
          text:
            'Un caractère **continu** (ou discret avec trop de valeurs distinctes) : on regroupe ' +
            'ses données en **classes**, des intervalles consécutifs. L\'**amplitude** d\'une ' +
            'classe, c\'est sa longueur : borne supérieure − borne inférieure. Pour construire un ' +
            '**histogramme**, on choisit ici des classes de **même amplitude** : des barres ' +
            'accolées, dont la **hauteur** vaut l\'effectif (ou la fréquence) de chaque classe.',
        },
        {
          kind: 'piege',
          label: 'Quelle borne appartient à quelle classe ?',
          text:
            'Règle utilisée dans tout ce chapitre : une classe [borne inf ; borne sup[ contient ' +
            'sa borne inférieure, mais **pas** sa borne supérieure ! Une donnée **exactement** ' +
            'sur une frontière appartient toujours à la classe **suivante**. Seule exception : ' +
            'la **toute dernière classe** du tableau inclut aussi sa borne supérieure, pour ne ' +
            'perdre aucune donnée.',
        },
        {
          kind: 'methode',
          label: 'Choisir ses classes',
          items: [
            'Calcule l\'**étendue** de la série : max − min.',
            'Choisis le **nombre de classes** : en pratique entre 5 et 8. Moins quand il y a peu ' +
              'de données.',
            'Divise l\'étendue par ce nombre, puis arrondis **vers le haut** à une valeur « ronde » : ' +
              'c\'est l\'**amplitude**.',
            'Fais commencer la première classe à une valeur ronde, inférieure ou égale au minimum.',
          ],
        },
        {
          kind: 'para',
          text:
            'Sur l\'exemple ci-dessous : min = 0,5 et max = 8, donc étendue = 7,5. Avec seulement ' +
            '20 données, 4 classes suffisent : 7,5/4 = 1,875, arrondi à **2**. On démarre à 0 : ' +
            '[0 ; 2[, [2 ; 4[, [4 ; 6[, [6 ; 8].',
        },
        {
          kind: 'exemple',
          badge: '4 classes, amplitude 2',
          formula:
            'Temps d\'écran quotidien (en h) de 20 élèves : 1 ; 2 ; 3,5 ; 0,5 ; 6 ; 4 ; 1,5 ; ' +
            '2,5 ; 5 ; 8 ; 0,5 ; 3 ; 1,8 ; 2,2 ; 4,5 ; 7 ; 1,2 ; 3,8 ; 5,5 ; 2,7 — classes ' +
            'imposées d\'amplitude 2 :',
          steps: [
            {
              tag: 'données sur une frontière',
              text:
                '2 va dans [2 ; 4[, 4 dans [4 ; 6[ et 6 dans [6 ; 8] — jamais dans la classe qui se ' +
                'termine par cette valeur.',
            },
            {
              tag: '8, la toute dernière borne',
              text: '8 est la borne supérieure de la dernière classe : exception, [6 ; 8] l\'inclut.',
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
            caption: '4 classes d\'amplitude 2 — la hauteur des barres, c\'est l\'effectif de chaque classe',
          },
        },
        {
          kind: 'astuce',
          text:
            'Dans l\'entraînement de cette section, l\'effectif total vaut toujours n = 10, 20 ou ' +
            '25 : chaque fréquence y tombe sur un **pourcentage entier**, un bon moyen de te ' +
            'relire. Ce n\'est pas une règle générale ! Avec n = 16 (possible dans le tableau de ' +
            'fréquences de la section 1), une seule donnée vaut 1/16 = 6,25 % : une fréquence à ' +
            'virgule y est parfaitement exacte.',
        },
        {
          kind: 'rappel',
          label: 'Classes de même amplitude… seulement pour l\'histogramme',
          items: [
            'Pour **construire un histogramme**, les classes sont ici toujours de même ' +
              'amplitude : la hauteur de chaque barre se lit alors directement comme ' +
              'l\'effectif de la classe.',
            'Dans les autres exercices du chapitre (moyenne pondérée, médiane, synthèse), les ' +
              'classes peuvent avoir des amplitudes **différentes**. Ça ne change rien aux ' +
              'calculs : la moyenne utilise le **centre** de chaque classe, la médiane ' +
              's\'obtient par **interpolation** dans la classe du seuil, et le mode reste la ' +
              'classe de **plus grand effectif**.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Un diagramme qui a sauvé des vies',
          text:
            "En 1858, l'infirmière britannique **Florence Nightingale** publie un rapport sur " +
            "les pertes de l'armée britannique pendant la guerre de Crimée, accompagné d'un " +
            "graphique de son invention : le « diagramme en rose » (coxcomb), une forme " +
            "d'histogramme circulaire où chaque secteur, groupé par mois, montre les décès " +
            "dus aux blessures de combat, aux maladies évitables et à d'autres causes. Le " +
            "résultat est saisissant : la quasi-totalité des morts viennent de maladies " +
            "évitables (typhus, choléra, mauvaise hygiène) et non des combats eux-mêmes. " +
            "Nightingale sait que des tableaux de chiffres n'auraient jamais convaincu le " +
            "Parlement britannique aussi vite — son graphique, lui, le fait : les hôpitaux " +
            "militaires sont réformés dans la foulée. C'est l'un des tout premiers exemples " +
            "où un graphique statistique change concrètement une décision politique.",
          image: {
            src: '/images/historique/nightingale.jpg',
            alt: 'Portrait de Florence Nightingale',
            caption: 'Florence Nightingale (1820–1910), photographie par Henry Hering, vers 1860.',
          },
        },
        {
          kind: 'atelier',
          tag: 'frontiere-classe-widget',
          label: 'Manipule toi-même — sur quelle classe tombe x ?',
          caption:
            'Fais glisser x le long des 4 classes de l\'exemple : dès qu\'il tombe pile sur une ' +
            'frontière, le point devient rouge et le texte précise explicitement la classe ' +
            'SUIVANTE — sauf tout à la fin, où la dernière classe fait exception.',
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
      blocks: [
        { kind: 'video', title: 'La moyenne pondérée', youtubeId: 'LxeW4gzXW-w' },
        {
          kind: 'para',
          text:
            'La **moyenne pondérée** tient compte du poids de chaque valeur. Chaque valeur n\'a ' +
            'pas le même « poids » : une valeur qui revient 7 fois compte 7 fois plus qu\'une ' +
            'valeur isolée.',
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
            '$(2+6+9+12)/4 = 7{,}25$. Cette erreur ignore complètement les effectifs. Elle ' +
            'donne un résultat faux dès que les effectifs ne sont pas tous égaux.',
        },
        {
          kind: 'methode',
          label: 'Données regroupées en classes',
          items: [
            'On ne connaît plus chaque valeur : on utilise le **centre** de chaque classe, la ' +
              'moyenne de ses deux bornes. Pour la classe $[a\\,;\\,b[$, c\'est $\\dfrac{a+b}{2}$. Il ' +
              'représente toute la classe dans le calcul.',
            'C\'est une **approximation** : on fait comme si toutes les valeurs de la classe ' +
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
            { kind: 'para', text: 'Moyenne : $\\bar{x} = 140/20 = 7$ — une valeur approchée.' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Avec les fréquences',
          text:
            'Si le tableau donne les **fréquences** fᵢ (en nombre décimal) au lieu des effectifs, la ' +
            'formule devient $\\bar{x} = \\Sigma(x_i \\cdot f_i)$. Plus besoin de diviser : la somme ' +
            'des fréquences vaut déjà 1. Sur l\'exemple discret : $2 \\cdot 0{,}25 + 6 \\cdot 0{,}4 + ' +
            '9 \\cdot 0{,}2 + 12 \\cdot 0{,}15 = 6{,}5$ — la même moyenne.',
        },
        {
          kind: 'historique',
          titre: 'L\'astronome belge qui a inventé « l\'homme moyen »',
          text:
            "Dans les années 1830, l'astronome et statisticien belge **Adolphe Quetelet** a " +
            "une idée audacieuse : appliquer la moyenne pondérée — jusque-là réservée aux " +
            "mesures physiques en astronomie — aux mesures humaines. En compilant des " +
            "milliers de mesures de taille, de poids et même de comportements, il construit " +
            'le concept de « l\'homme moyen », un individu théorique qui ' +
            "résumerait toute une population par ses valeurs moyennes. L'idée fait scandale " +
            "autant qu'elle fascine : peut-on vraiment réduire une société entière à quelques " +
            'nombres ? Quetelet invente au passage l\'**indice de masse corporelle** (encore ' +
            'appelé « indice de Quetelet »), le poids divisé par le carré de la taille, ' +
            "toujours utilisé en médecine aujourd'hui. Fondateur de l'Observatoire royal de " +
            "Belgique, il reste l'un des scientifiques belges les plus influents du 19e " +
            "siècle.",
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
      ],
    },
    {
      id: 'position',
      number: 4,
      title: 'Médiane, quartiles et mode',
      kicker: 'les paramètres de position — le rang, pas la valeur',
      blocks: [
        { kind: 'video', title: 'Médiane, quartiles et mode (1/2) : la règle du seuil', youtubeId: 'OTT30Ux-Z8k' },
        { kind: 'video', title: 'Médiane, quartiles et mode (2/2) : classes, mode, quelle valeur centrale ?', youtubeId: 'SOaot7PbsMo' },
        {
          kind: 'intuition',
          label: 'Pourquoi une médiane, en plus de la moyenne ?',
          text:
            'Imagine une rue de dix maisons. Neuf valent environ 200 000 € chacune, la dixième ' +
            'est un immense château à 10 000 000 €. La **moyenne** des dix prix explose à cause ' +
            'du château — elle donne un prix qu\'aucune maison de la rue n\'atteint vraiment. La ' +
            '**médiane**, elle, ne regarde que le rang : elle reste sur le prix d\'une maison ' +
            '« normale », sans se soucier de savoir à quel point le château est cher.',
        },
        {
          kind: 'para',
          text:
            'Ces paramètres localisent une série par le **rang** des individus — pas par un ' +
            'calcul sur les valeurs elles-mêmes. La **médiane** partage la série en deux ' +
            'moitiés égales. Les **quartiles** Q1 et Q3 la partagent en quatre. Le **mode**, ' +
            'lui, est simplement la valeur (ou la classe) de plus grand effectif.',
        },
        {
          kind: 'methode',
          label: 'La règle du seuil',
          items: [
            'Sur le tableau des effectifs cumulés, chaque paramètre correspond à un **seuil** : ' +
              'n/2 pour la médiane, n/4 pour Q1, 3n/4 pour Q3. Le paramètre cherché, c\'est la ' +
              '**première valeur** dont l\'effectif cumulé dépasse **strictement** ce seuil.',
          ],
        },
        {
          kind: 'piege',
          label: '« Strictement supérieur », jamais « supérieur ou égal »',
          text:
            'C\'est l\'erreur la plus fréquente ! Si l\'effectif cumulé est **exactement** égal ' +
            'au seuil, ce n\'est **pas encore** la bonne valeur. Il faut prendre la ' +
            '**suivante**. Preuve sur l\'exemple ci-dessous, avec Q1 : le seuil vaut n/4 = 5, ' +
            'et l\'effectif cumulé de x=2 vaut **exactement** 5 — égal au seuil, donc pas encore. ' +
            'Le premier cumulé strictement supérieur à 5 est 13, à x=6 : Q1 = 6. Jamais x=2, ' +
            'même si tu es tenté de t\'arrêter dès que le cumulé « atteint » le seuil.',
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
            { kind: 'para', text: 'Médiane — seuil n/2 = 10 : premier cumulé > 10 est 13 (à x=6) → médiane = 6.' },
            { kind: 'para', text: 'Q1 — seuil n/4 = 5 : premier cumulé > 5 est 13 (à x=6) → Q1 = 6. 5 n\'est pas strictement supérieur à 5, donc on passe à la ligne suivante.' },
            { kind: 'para', text: 'Q3 — seuil 3n/4 = 15 : premier cumulé > 15 est 17 (à x=9) → Q3 = 9.' },
            { kind: 'para', text: 'Résultat : min=2, Q1=6, médiane=6, Q3=9, max=12, mode=6 (effectif 8, le plus grand).' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'seuil-cumule-widget',
          label: 'Manipule toi-même — le piège du seuil en direct',
          caption:
            'Choisis médiane/Q1/Q3 et règle les effectifs : la ligne du tableau qui atteint ' +
            'exactement le seuil se surligne en rouge avec la mention « pas encore ! », celle qui ' +
            'le dépasse la PREMIÈRE en vert. Avec les réglages par défaut et Q1 sélectionné, tu es ' +
            'exactement dans le cas-piège du texte (cumulé=5=seuil pile).',
        },
        { kind: 'subheading', text: 'Données en classes : le polygone des effectifs cumulés' },
        {
          kind: 'para',
          text:
            'Avec des classes, on ne connaît plus chaque valeur. On trace alors le **polygone des ' +
            'effectifs cumulés**. Chaque point a pour abscisse la **borne supérieure** d\'une ' +
            'classe, et pour ordonnée l\'effectif cumulé de cette classe : à la fin de la classe ' +
            '[4 ; 8[, on a déjà compté 13 données. On part de 0, sur la borne inférieure de la ' +
            'toute première classe. Puis on relie les points par des segments.',
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
                'Seuil de la médiane : $n/2 = 10$. On part de 10 sur l\'axe des effectifs, on va ' +
                'jusqu\'au polygone, puis on descend sur l\'axe des valeurs.',
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
                  'Polygone des effectifs cumulés : le seuil 10 coupe le segment de (4 ; 5) à (8 ; 13), ' +
                  'donc dans la classe [4 ; 8[. On lit médiane ≈ 6,5. Le triangle vert montre la ' +
                  'proportionnalité utilisée par le calcul juste en dessous.',
              },
            },
            {
              kind: 'para',
              text:
                'Le seuil 10 tombe sur le segment qui relie $(4\\,;\\,5)$ et $(8\\,;\\,13)$ : la médiane ' +
                'est dans la classe [4 ; 8[. On lit environ **6,5**.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Données regroupées en classes : interpolation',
          items: [
            'La lecture sur le polygone se calcule exactement. Sur le segment de la classe, ' +
              'l\'effectif cumulé monte de $n_{classe}$ pendant que la valeur avance d\'une ' +
              'amplitude : c\'est une situation de **proportionnalité** (le triangle vert). Pour ' +
              'monter de $\\text{seuil} - CF_{avant}$, il faut donc avancer de ' +
              '$\\dfrac{\\text{seuil} - CF_{avant}}{n_{classe}} \\cdot \\text{amplitude}$.',
            'D\'abord, repère la **classe** où le seuil tombe, comme ci-dessus. Ensuite, ' +
              'trouve la valeur exacte par interpolation linéaire le long de cette classe : ' +
              '$\\text{valeur} = L + \\dfrac{\\text{seuil} - CF_{avant}}{n_{classe}} \\cdot \\text{amplitude}$. ' +
              'L est la borne inférieure de la classe, et $CF_{avant}$ l\'effectif cumulé ' +
              '**juste avant** cette classe.',
            'Sur les mêmes effectifs regroupés en classes [0;4[/[4;8[/[8;12[/[12;16[ : le ' +
              'seuil médiane = 10 tombe dans [4;8[ (cumulés 5→13). Donc médiane = ' +
              '4 + ((10−5)/8)×4 = 6,5.',
          ],
        },
        { kind: 'subheading', text: 'Le mode, sans aucun calcul' },
        {
          kind: 'para',
          text:
            'Le **mode**, c\'est simplement la valeur (ou la classe) de plus grand effectif. Tu ' +
            'le lis directement sur un tableau déjà ordonné, sans aucun seuil ni cumul.',
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
          result: { tag: 'classe modale', text: '[4 ; 8[ — pour des données en classes, le mode est une classe, pas un nombre' },
        },
        {
          kind: 'exemple',
          badge: 'deux modes',
          formula: '2 — 3 — 3 — 3 — 5 — 6 — 7 — 7 — 7 — 9',
          steps: [{ tag: 'compter', text: '3 et 7 apparaissent chacun 3 fois — aucune autre valeur n\'apparaît autant' }],
          result: { tag: 'série bimodale', text: 'deux modes : 3 et 7 — une série peut avoir plusieurs modes' },
        },
        {
          kind: 'methode',
          label: 'Quelle valeur centrale choisir ?',
          items: [
            'Les trois paramètres se valent mathématiquement. Mais pas dans toutes les situations !',
            '**Moyenne** — elle utilise toutes les données. Mais elle est très sensible aux ' +
              'valeurs extrêmes : un seul salaire énorme fait grimper toute une moyenne.',
            '**Médiane** — elle est insensible aux valeurs extrêmes. Mais elle ne regarde ' +
              'qu\'une seule position, et ignore la forme du reste de la série.',
            '**Mode** — c\'est toujours une vraie valeur de la série, facile à lire. Mais il ' +
              'est peu représentatif si les effectifs sont trop dispersés, ou s\'il y a ' +
              'plusieurs modes.',
          ],
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
                '8 matchs d\'un basketteur, dont un exceptionnel à 50 points. La moyenne ' +
                '(22,75) est tirée vers le haut par ce seul match ; la médiane (20 — règle du ' +
                'seuil : n/2 = 4, et la 5e valeur dans l\'ordre croissant est 20) reste proche du ' +
                'niveau typique des 7 autres matchs.',
            },
          ],
          text:
            "En sport, le choix entre moyenne, médiane et mode change complètement l'histoire " +
            "qu'on raconte. La moyenne de points par match d'un basketteur peut être tirée " +
            "vers le haut par une seule performance exceptionnelle à 50 points — la médiane, " +
            "elle, reste insensible à ce match exceptionnel et reflète mieux son niveau « " +
            "typique ». Un entraîneur qui compare deux joueurs de même moyenne regarde " +
            "ensuite leur dispersion : celui dont les scores varient peu (constant match " +
            "après match) est souvent préféré à celui qui alterne les matchs exceptionnels et " +
            "les matchs catastrophiques, même à moyenne égale. Le mode, lui, sert à repérer " +
            "le score le plus fréquent d'un joueur — utile pour prédire ce qu'il est le plus " +
            "probable de réaliser lors du prochain match, plutôt que ce qu'il réalise « en " +
            "moyenne ».",
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
      ],
    },
    {
      id: 'boite',
      number: 5,
      title: 'La boîte à moustaches',
      kicker: 'min, Q1, médiane, Q3, max — un résumé visuel en 5 nombres',
      blocks: [
        { kind: 'video', title: 'La boîte à moustaches', youtubeId: 'CMzCmWA9YTg' },
        {
          kind: 'intuition',
          label: 'Pour visualiser les quartiles',
          text:
            'Imagine toute la classe alignée du plus petit au plus grand, puis découpée en ' +
            'quatre groupes de même taille. Q1 est la frontière après le premier quart de la ' +
            'file, Q3 la frontière après les trois quarts. La **boîte** de la boîte à ' +
            'moustaches, c\'est exactement ce groupe du milieu : la moitié des individus qui ne ' +
            'sont ni parmi les plus petits, ni parmi les plus grands.',
        },
        {
          kind: 'para',
          text:
            'La **boîte à moustaches** (ou **box-plot**) résume une série en cinq nombres ' +
            'seulement : minimum, Q1, médiane, Q3, maximum. La **boîte** couvre l\'intervalle ' +
            '[Q1 ; Q3] — elle contient donc la moitié « centrale » de la série. Les ' +
            '**moustaches**, elles, s\'étendent jusqu\'au minimum et au maximum.',
        },
        {
          kind: 'para',
          text:
            'Reprends la série des sections 3 et 4 (valeurs 2, 6, 9, 12 ; effectifs 5, 8, 4, 3). Tu y ' +
            'as déjà trouvé les cinq nombres : min = 2, Q1 = 6, médiane = 6, Q3 = 9, max = 12. Il ' +
            'ne reste qu\'à les placer sur un axe.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'boxPlot',
            series: [{ min: 2, q1: 6, median: 6, q3: 9, max: 12 }],
            xAxisLabel: 'x',
            caption:
              'La série des sections 3 et 4 : min=2, Q1=6, médiane=6, Q3=9, max=12 — boîte = ' +
              '[Q1;Q3], moustaches jusqu\'aux extrêmes. Ici, la médiane est collée au bord gauche de la boîte.',
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
            'La boîte et les moustaches découpent la série en **quatre parties** : moustache ' +
            'gauche, moitié gauche de la boîte, moitié droite, moustache droite. Chacune contient ' +
            'environ **25 %** des valeurs — même si leurs longueurs sont très différentes ! Une ' +
            'partie courte veut dire que ses valeurs sont **serrées**, une partie longue qu\'elles ' +
            'sont **étalées**.',
        },
        {
          kind: 'astuce',
          label: 'Lire l\'asymétrie',
          text:
            'Si la médiane est au milieu de la boîte et que les moustaches ont la même longueur, la ' +
            'série est à peu près **symétrique**. Ici, la médiane est collée au bord gauche (Q1 = ' +
            'médiane = 6) : beaucoup de valeurs sont regroupées à 6, et la partie droite est plus ' +
            'étalée. La série est **asymétrique**, étirée vers les grandes valeurs.',
        },
        {
          kind: 'methode',
          label: 'Comparer deux boîtes à moustaches',
          items: [
            'Deux questions reviennent tout le temps. Quelle série a la **médiane** la plus ' +
              'grande ? C\'est le trait vertical dans la boîte le plus à droite. Et quelle ' +
              'série est la **plus dispersée** ? C\'est la boîte la plus large, mesurée par ' +
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
              'Série A : min 2 / Q1 5 / méd. 8 / Q3 12 / max 15 (IQR = 7) — Série B : min 1 / Q1 4 / ' +
              'méd. 6 / Q3 9 / max 11 (IQR = 5) — A a la médiane la plus grande ET la boîte la plus large',
          },
        },
        {
          kind: 'astuce',
          label: 'La largeur de la boîte, un indice de confiance',
          text:
            'Plus la boîte est **étroite**, plus les valeurs centrales sont resserrées autour ' +
            'de la médiane. Elle résume alors bien toute la série. Une boîte **large** signale ' +
            'l\'inverse : la médiane reste un centre valide, mais elle devient moins ' +
            'représentative, parce que les valeurs sont beaucoup plus dispersées autour ' +
            'd\'elle. Sur l\'exemple ci-dessus, la médiane de B (la boîte la plus étroite) est ' +
            'donc la plus représentative des deux.',
        },
        {
          kind: 'historique',
          titre: 'Le statisticien qui dessinait des boîtes',
          text:
            'La boîte à moustaches a été inventée par le statisticien américain **John Tukey**, ' +
            'vers 1970. Il l\'a rendue célèbre en 1977 dans son livre « Exploratory Data Analysis » ' +
            '(l\'analyse exploratoire des données). Son idée : avant de se lancer dans de longs ' +
            'calculs, il faut **regarder** les données, avec des dessins simples qu\'on trace à la ' +
            'main en quelques minutes. On doit aussi à Tukey le mot « bit », l\'unité ' +
            'd\'information de l\'informatique.',
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
      blocks: [
        { kind: 'video', title: 'Étendue, variance et écart-type', youtubeId: 'C7z8U5OC_QI' },
        {
          kind: 'intuition',
          label: 'Pourquoi un nombre pour la dispersion ?',
          text:
            'Deux classes peuvent avoir exactement la même moyenne, 12/20, sans se ressembler ' +
            'en rien : dans l\'une, presque tout le monde est entre 10 et 14 ; dans l\'autre, la ' +
            'moitié a 20/20 et l\'autre moitié a 4/20. La moyenne seule ne fait **aucune** ' +
            'différence entre ces deux classes. Il faut un autre nombre, qui mesure à quel point ' +
            'les valeurs s\'écartent du centre — c\'est tout l\'objet de cette section.',
        },
        {
          kind: 'para',
          text:
            'La **moyenne** résume le centre d\'une série. Mais deux séries de même moyenne ' +
            'peuvent être très différentes : l\'une resserrée autour de x̄, l\'autre très ' +
            'étalée. Ces trois paramètres mesurent justement cet étalement.',
        },
        { kind: 'subheading', text: 'L\'étendue' },
        {
          kind: 'para',
          text:
            'Le plus simple des trois : $\\text{étendue} = \\max - \\min$. Rapide à calculer. Mais ' +
            'il ne tient compte que des deux valeurs extrêmes — insensible à tout ce qui se ' +
            'passe entre les deux.',
        },
        { kind: 'subheading', text: 'La variance et l\'écart-type' },
        {
          kind: 'definition',
          label: 'Formules',
          items: [
            'Variance — c\'est la moyenne des carrés des écarts à x̄ : $V = \\dfrac{\\Sigma(x_i-\\bar{x})^2 ' +
              '\\cdot n_i}{n} = \\dfrac{(x_1-\\bar{x})^2 n_1 + (x_2-\\bar{x})^2 n_2 + \\ldots}{n_1+n_2+\\ldots}$.',
            'Écart-type — c\'est sa racine carrée. Il est dans la même unité que les données — ' +
              'contrairement à la variance, qui est en unité au carré : ' +
              '$\\text{écart-type} = \\sqrt{V}$.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Ce que représente concrètement l\'écart-type',
          text:
            'Tu as déjà mesuré une distance entre deux nombres sur une droite graduée, $|a-b|$. ' +
            'L\'écart-type, c\'est un peu la même idée, résumée pour toute la série en un seul ' +
            'nombre : à peu près la distance **typique** entre une valeur de la série et la ' +
            'moyenne. Un écart-type petit veut dire que les valeurs sont proches de x̄ ; un ' +
            'écart-type grand veut dire qu\'elles s\'en éloignent beaucoup, en moyenne.',
        },
        {
          kind: 'rappel',
          label: 'Convention de calcul sur cette plateforme',
          items: [
            'Sur cette plateforme, la variance se calcule **toujours** en divisant par ' +
              'l\'effectif total n — jamais par n−1. L\'écart-type se calcule ensuite comme la ' +
              'racine carrée de la variance **déjà arrondie à 2 décimales** — jamais depuis le ' +
              'rapport non arrondi. Respecte bien cet ordre : c\'est nécessaire pour retomber ' +
              'exactement sur la valeur vérifiée par le générateur !',
          ],
        },
        {
          kind: 'attention',
          label: 'Avec la calculatrice',
          text:
            'En mode statistique, ta calculatrice affiche souvent **deux** écarts-types : σx (ou σn) ' +
            'et sx (ou σn−1). Sur cette plateforme, prends toujours **σx** : il divise par n, comme ' +
            'la formule de cette section. sx divise par n − 1 et donne une valeur un peu plus ' +
            'grande — il sert à d\'autres usages, plus tard. Attention aussi : la calculatrice ' +
            'calcule σx à partir de la variance non arrondie. Pour retomber sur la valeur du ' +
            'générateur, arrondis d\'abord la variance à 2 décimales, puis prends sa racine.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — la série des sections 3 et 4',
          blocks: [
            { kind: 'para', text: 'Moyenne trouvée à la section 3 : $\\bar{x} = 6{,}5$.' },
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
            { kind: 'para', text: 'Écart-type : $\\sqrt{10} \\approx 3{,}16$ (ici un vrai arrondi — on écrit « ≈ », pas « = »).' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'dispersion-comparee-widget',
          label: 'Manipule toi-même — même moyenne, dispersion différente',
          caption:
            'Fais glisser d : la moyenne x̄=12 reste TOUJOURS fixe (repère violet immobile), ' +
            'seul l\'écartement des deux valeurs change — variance et écart-type recalculés en ' +
            'direct. À d=8, tu retrouves exactement l\'exemple du texte (moitié à 4, moitié à 20).',
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
                'Deux lots de 5 pièces, EXACTEMENT la même moyenne (x̄ = 50 mm, la cible) : le ' +
                'lot A (vert) est bien centré ET resserré — machine réglée ; le lot B (rouge) a ' +
                'la même moyenne mais une dispersion bien plus large — signal d\'alerte, même ' +
                'si la cible est atteinte en moyenne.',
            },
          ],
          image: {
            src: '/images/application/quality-control-steel.jpg',
            alt: 'Ouvrier effectuant un contrôle qualité dans une aciérie',
            caption: 'Contrôle qualité dans une usine sidérurgique, Tarente, 1963. Touring Club Italiano, CC BY-SA 4.0, via Wikimedia Commons.',
          },
          text:
            "Dans une usine, une machine qui fabrique des pièces vise toujours une valeur " +
            "cible (un diamètre, une masse, une épaisseur) — mais aucune pièce n'est jamais " +
            "parfaitement identique à une autre. Le contrôle qualité mesure régulièrement un " +
            "échantillon de pièces et calcule leur **moyenne** (reste-t-on bien sur la cible ?) " +
            "et leur **écart-type** (les pièces sont-elles toutes proches les unes des autres, " +
            "ou très dispersées ?). Un écart-type qui grimpe, même si la moyenne reste bonne, " +
            "est un signal d'alerte : la machine se dérègle, et de plus en plus de pièces " +
            "risquent de sortir des tolérances acceptables. C'est exactement l'idée de " +
            "l'atelier ci-dessus : deux séries de même moyenne peuvent raconter une histoire " +
            "complètement différente selon leur dispersion.",
          domaines: ['Industrie', 'Contrôle qualité'],
        },
        {
          kind: 'entrainement',
          title: 'Paramètres de dispersion',
          generatorId: 'gen34',
          description: [
            'Calcule la variance puis l\'écart-type d\'une série discrète. x̄ est donné dans ' +
              'l\'énoncé.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 34. Paramètres de dispersion »',
        },
      ],
    },
    {
      id: 'tchebychev',
      number: 7,
      title: 'L\'inégalité de Bienaymé-Tchebychev',
      kicker: 'au moins (1 − 1/k²) × 100 % des valeurs dans [x̄ − kσ ; x̄ + kσ]',
      blocks: [
        { kind: 'video', title: 'L\'inégalité de Bienaymé-Tchebychev', youtubeId: '7aV5FgCHztI' },
        {
          kind: 'para',
          text:
            'Cette inégalité garantit, **pour n\'importe quelle série** — peu importe sa forme ' +
            '—, qu\'une proportion minimale des valeurs se trouve à moins de k écarts-types de ' +
            'la moyenne. Ça marche dès que k > 1 :',
        },
        {
          kind: 'definition',
          items: ['au moins une proportion $1 - \\dfrac{1}{k^2}$ des valeurs — soit $\\left(1 - \\dfrac{1}{k^2}\\right) \\times 100\\,\\%$ — se trouve dans $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$'],
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
            caption: 'zone centrale [x̄−kσ ; x̄+kσ] — pour k=2, elle contient au moins 1−1/4 = 75 % des valeurs',
          },
        },
        {
          kind: 'exemple',
          badge: 'k = 2',
          steps: [{ tag: 'formule', text: '$1 - 1/k^2 = 1 - 1/2^2 = 1 - 1/4 = 3/4$' }],
          result: { tag: 'résultat', text: 'au moins 75 % des valeurs se trouvent dans $[\\bar{x}-2\\sigma\\,;\\,\\bar{x}+2\\sigma]$' },
        },
        {
          kind: 'astuce',
          label: 'Dans l\'autre sens',
          text:
            'Si l\'énoncé donne directement le pourcentage minimal garanti, plutôt que k, tu ' +
            'peux retrouver k par la formule réciproque $k = \\sqrt{100/(100-\\text{pourcentage})}$. ' +
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
                '$[12-2 \\cdot 2\\,;\\,12+2 \\cdot 2]$ : on est à 2 écarts-types de la moyenne, donc ' +
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
                '$\\sigma=2$ ✓. Entre 8 et 16, on trouve $11+16+11 = 38$ élèves, soit 95 % — bien plus ' +
                'que les 30 garantis.',
            },
            {
              kind: 'para',
              text:
                'Bienaymé-Tchebychev ne connaît pas la forme de la série : sa garantie doit marcher ' +
                'pour **toutes** les séries. C\'est pour ça qu\'elle est souvent pessimiste.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Retrouver la moyenne',
          text:
            'L\'intervalle $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$ est **symétrique** autour de ' +
            '$\\bar{x}$ : si l\'énoncé te le donne sous la forme $[a\\,;\\,b]$, la moyenne est son ' +
            'centre, $\\bar{x} = \\dfrac{a+b}{2}$ — inutile de calculer k.',
        },
        {
          kind: 'piege',
          label: 'Arrondir sans perdre la garantie',
          text:
            'Bienaymé-Tchebychev donne une **garantie** (« au moins… ») : quand tu arrondis, fais-' +
            'le toujours dans le sens qui la conserve. Un pourcentage minimal ou un nombre minimal ' +
            'd\'individus s\'arrondit **vers le bas**. Les bornes d\'un intervalle s\'arrondissent ' +
            '**vers l\'extérieur** : la borne inférieure vers le bas, la borne supérieure vers le ' +
            'haut. Et k s\'arrondit lui aussi dans le sens qui garde la garantie vraie : vers le ' +
            'bas si tu en déduis un pourcentage, vers le haut si tu en déduis un intervalle.',
        },
        {
          kind: 'historique',
          titre: 'Deux mathématiciens, une même inégalité',
          text:
            'Cette inégalité porte deux noms parce qu\'elle a été trouvée **deux fois**, de façon ' +
            'indépendante. Le Français **Irénée-Jules Bienaymé** la publie en 1853. Le Russe ' +
            '**Pafnouti Tchebychev** la redécouvre et la démontre à sa manière en 1867. ' +
            'Tchebychev a ensuite reconnu que Bienaymé l\'avait trouvée avant lui. Son point fort ' +
            'n\'a pas changé depuis : elle marche pour n\'importe quelle série, sans rien savoir de ' +
            'sa forme.',
        },
        {
          kind: 'entrainement',
          title: 'Inégalité de Bienaymé-Tchebychev',
          generatorId: 'gen37',
          description: [
            'Applique l\'inégalité sous 8 variantes. À partir de k, retrouve l\'intervalle, le ' +
              'pourcentage minimal ou le nombre minimal d\'individus concernés — et ' +
              'réciproquement.',
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
      blocks: [
        { kind: 'video', title: 'Comparer deux séries statistiques', youtubeId: 'ojdBYg8_mbY' },
        {
          kind: 'para',
          text:
            'Comparer deux séries, c\'est réutiliser tous les outils précédents sur les deux à ' +
            'la fois. Quelle série a la **médiane** la plus grande ? C\'est une question de ' +
            'centrage. Laquelle a l\'**écart-type** le plus petit, donc la plus homogène ? ' +
            'C\'est une question de dispersion. Les données peuvent être données sous forme de ' +
            'tableaux bruts, de récapitulatifs déjà calculés, ou de **courbes cumulées** à ' +
            'lire directement sur un graphique.',
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
              'Notes sur 20 de deux groupes de 20 élèves (effectifs pour les notes 6, 8, 10, 12, 14, 16 : ' +
              'A = 1, 3, 6, 5, 3, 2 ; B = 3, 6, 4, 2, 4, 1). À la note 10, on lit 10 élèves pour A, ' +
              'mais 13 pour B : le groupe B compte plus d\'élèves à 10 ou moins.',
          },
        },
        {
          kind: 'para',
          text:
            'Les mêmes séries, résumées par leurs boîtes à moustaches (règle du seuil). Groupe A : ' +
            'min 6, Q1 = 10, médiane 12, Q3 = 14, max 16. Groupe B : min 6, Q1 = 8, médiane 10, ' +
            'Q3 = 14, max 16. Le groupe A a la médiane la plus grande **et** la boîte la plus ' +
            'étroite : il réussit mieux, et de façon plus homogène.',
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
              'Groupe A : médiane 12, écart interquartile 4 — groupe B : médiane 10, écart ' +
              'interquartile 6. Même minimum et même maximum, mais pas du tout la même répartition.',
          },
        },
        {
          kind: 'methode',
          label: 'Les 4 types de questions',
          items: [
            '**Centrage** — comparer les deux médianes.',
            '**Dispersion** — comparer les deux écarts-types. La plus petite valeur = la ' +
              'série la plus homogène.',
            '**Seuil** — lire un effectif (ou une fréquence) cumulé à une valeur donnée. Tu ' +
              'projettes sur la courbe, puis sur l\'axe des effectifs.',
            '**Interprétation** — traduire ces lectures en une phrase de conclusion correcte.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Lire un intervalle, pas seulement un seuil',
          text:
            'Pour répondre à « quel pourcentage se situe entre a et b ? », ne lis jamais ' +
            'l\'intervalle directement sur la courbe ! Lis séparément le cumulé en b et le ' +
            'cumulé en a. Puis **soustrais** les deux : cumulé(b) − cumulé(a).',
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
                'Le groupe Traitement (vert) guérit en général plus vite ET de façon plus ' +
                'homogène (points resserrés entre 5 et 12 jours ; deux patients guéris en 6 jours, ' +
                'leurs points sont empilés) que le groupe Placebo (rouge, ' +
                'étalé de 8 à 18 jours) — mais les deux séries se chevauchent encore entre 8 et ' +
                '12 jours : la différence est nette, sans être totale.',
            },
          ],
          image: {
            src: '/images/application/clinical-trial.jpg',
            alt: 'Essai clinique en laboratoire médical',
            caption: 'Analyse de données dans le cadre d\'un essai clinique.',
          },
          text:
            "Pour tester un nouveau médicament, les chercheurs forment deux groupes de " +
            "patients comparables : l'un reçoit le médicament, l'autre un placebo (sans " +
            "principe actif). Ils mesurent ensuite un indicateur (temps de guérison, baisse " +
            "de tension, etc.) sur chaque groupe et comparent les deux séries EXACTEMENT comme " +
            "dans cette section : quelle série a la médiane la plus favorable (centrage) ? " +
            "Laquelle est la plus homogène, c'est-à-dire a le médicament un effet constant ou " +
            "très variable d'un patient à l'autre (dispersion) ? Quelle proportion de patients " +
            "dépasse un seuil donné (lecture de seuil) ? Une différence de médianes, à elle " +
            "seule, ne suffit jamais à conclure qu'un médicament fonctionne — il faut aussi " +
            "regarder si les deux séries se chevauchent beaucoup ou peu, exactement la question " +
            "de dispersion que pose cette section.",
          domaines: ['Médecine', 'Recherche clinique'],
        },
        {
          kind: 'entrainement',
          title: 'Comparaison de deux séries statistiques',
          generatorId: 'gen38',
          description: [
            'Compare deux séries sous 3 présentations (tableaux bruts, récapitulatif, courbes ' +
              'cumulées). Sur le centrage, la dispersion, la lecture d\'un seuil et ' +
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
      blocks: [
        { kind: 'video', title: 'Révision : la synthèse du chapitre', youtubeId: 'AN_L26bmYLg' },
        {
          kind: 'para',
          text:
            'Deux façons de réviser ce chapitre. Un **exercice de synthèse**, qui enchaîne sur ' +
            'un seul jeu de données cohérent : la moyenne pondérée, les paramètres de ' +
            'position, la boîte à moustaches, la dispersion et Bienaymé-Tchebychev. Ou un ' +
            '**quiz vrai/faux**, qui couvre transversalement les 9 générateurs de ce chapitre.',
        },
        {
          kind: 'entrainement',
          title: 'Synthèse — Statistique descriptive complète',
          generatorId: 'gen35',
          description: [
            'Un seul contexte narratif, enchaîné du début à la fin : moyenne, médiane/Q1/Q3, ' +
              'boîte à moustaches, variance/écart-type, puis Bienaymé-Tchebychev (k=2).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 35. Synthèse — Statistique descriptive complète »',
        },
        {
          kind: 'astuce',
          text:
            'Le thème « Médiane et quartiles » du quiz revient explicitement sur le piège du ' +
            'seuil strict (cumulé exactement égal au seuil), vu à la section 4. Utile pour ' +
            'vérifier que le réflexe est bien acquis !',
        },
        {
          kind: 'entrainement',
          title: 'Statistique descriptive à une variable — quiz vrai/faux',
          generatorId: 'gen59',
          description: [
            '350 affirmations pré-écrites, réparties en 10 thèmes qui reprennent tout ce ' +
              'chapitre. Un seul essai par question. La justification est toujours révélée.',
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
      '**Vocabulaire** — population, individu, caractère (discret ou continu), effectif nᵢ, ' +
        'effectif total n, fréquence fᵢ = nᵢ/n.',
      '**Regroupement** — tableau de fréquences pour une liste discrète. Convention [inf;sup[ ' +
        'pour un caractère continu (sauf la dernière classe, fermée des deux côtés). Classes de ' +
        'même amplitude pour construire un histogramme ; ailleurs, les amplitudes peuvent ' +
        'différer.',
      '**Moyenne** — $\\bar{x} = \\Sigma(x_i \\cdot n_i)/\\Sigma n_i$, jamais la moyenne des ' +
        'valeurs distinctes seules.',
      '**Position** — médiane/Q1/Q3 = première valeur dont l\'effectif cumulé dépasse ' +
        '**strictement** le seuil (n/2, n/4, 3n/4). Interpolation linéaire pour des classes.',
      '**Boîte à moustaches** — 5 nombres : min, Q1, médiane, Q3, max. Écart interquartile = ' +
        'Q3 − Q1, la largeur de la boîte. Chaque partie contient environ 25 % des valeurs ; une ' +
        'médiane décentrée signale une série asymétrique.',
      '**Dispersion** — étendue = max−min. Variance = $\\Sigma(x_i-\\bar{x})^2 \\cdot n_i/n$, ' +
        'division par n. Écart-type = √variance, calculé depuis la variance déjà arrondie.',
      '**Bienaymé-Tchebychev** — au moins (1−1/k²)×100% des valeurs dans ' +
        '$[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$, pour k>1 (k=2 → au moins 75%).',
      '**Comparer deux séries** — centrage (les médianes), dispersion (écart-type ou écart ' +
        'interquartile), lecture d\'un seuil sur les courbes cumulées, puis une phrase de conclusion.',
    ],
    checklist: {
      items: [
        'Ma colonne d\'effectifs cumulés se termine-t-elle bien par n ? Et ma fréquence ' +
          'cumulée par 100 % ?',
        'Ai-je bien pris la première valeur dont le cumulé dépasse strictement le seuil, ' +
          'jamais celle qui l\'atteint tout juste ?',
        'Ai-je divisé la somme des carrés d\'écarts par n, pas par n−1 ?',
        'Ai-je calculé l\'écart-type à partir de la variance déjà arrondie ?',
        'Sur ma calculatrice, ai-je lu σx (division par n), et pas sx ?',
      ],
    },
    forward:
      'Moyenne, médiane et écart-type reviennent tels quels dans le chapitre sur les ' +
      'statistiques à deux variables et la corrélation (chapitre 6 de 5e). Ce sont les briques de base : tout le ' +
      'reste s\'appuie dessus.',
  },
}
