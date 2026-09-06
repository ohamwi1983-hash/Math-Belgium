import type { ChapterContent } from '../../types'

export const statistiqueDescriptive: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 4,
  title: 'Statistique descriptive à une variable',
  slug: 'statistique-descriptive',
  lede:
    "Une série de mesures brutes, en vrac, ne dit rien à personne. Ce chapitre construit, étape " +
    "par étape, la boîte à outils qui la rend lisible — tableau de fréquences, histogramme, " +
    "moyenne, médiane et quartiles, boîte à moustaches, variance et écart-type — puis l'utilise " +
    "pour comparer deux séries entre elles.",

  intro: {
    title: 'Avant de commencer : le vocabulaire de base',
    blocks: [
      {
        kind: 'para',
        text:
          'La **statistique descriptive** étudie une **population** (l\'ensemble des individus ' +
          'observés) à travers un **caractère** — la grandeur mesurée sur chaque individu. Ce ' +
          'chapitre ne traite que le cas d\'un caractère **quantitatif** (numérique) étudié ' +
          'seul, jamais deux caractères à la fois.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — population ou échantillon ?',
        items: [
          'On dispose rarement des données de toute la population : on se restreint le plus ' +
            'souvent à l\'étude d\'un **échantillon** — un sous-ensemble de la population, sur ' +
            'lequel on observe le caractère. Toutes les formules de ce chapitre (moyenne, ' +
            'médiane, variance…) s\'appliquent de la même façon, que la série provienne de la ' +
            'population entière ou d\'un échantillon.',
        ],
      },
      {
        kind: 'rappel',
        label: 'Rappel — discret ou continu ?',
        items: [
          'Un caractère quantitatif **discret** ne prend que des valeurs isolées, dénombrables ' +
            '(un nombre de frères et sœurs, une pointure) — on peut lister ses valeurs une par ' +
            'une. Un caractère quantitatif **continu** peut prendre n\'importe quelle valeur ' +
            'dans un intervalle (une taille, un temps) — on ne le décrit qu\'après l\'avoir ' +
            '**regroupé en classes** (section 2).',
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
          'À partir de ce vocabulaire commun, chaque section de ce chapitre construit un outil ' +
          'qui répond à une question précise : où se situe le « centre » de la série (moyenne, ' +
          'médiane) ? à quel point les valeurs sont-elles dispersées autour de ce centre ' +
          '(étendue, variance, écart-type) ? comment comparer deux séries entre elles ?',
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
        {
          kind: 'para',
          text:
            'Une série statistique brute est une liste de valeurs **dans l\'ordre où elles ont ' +
            'été relevées** — jamais triée, jamais organisée. La première étape consiste ' +
            'toujours à la transformer en **tableau de fréquences** : une ligne par valeur ' +
            'distincte, avec son effectif, sa fréquence, et les versions **cumulées** de ces ' +
            'deux colonnes.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Repérer les valeurs **distinctes** prises par la série, les ranger par ordre croissant.',
            'Compter, pour chacune, son **effectif** nᵢ (combien de fois elle apparaît).',
            'Calculer sa **fréquence** fᵢ = nᵢ/n (souvent en %).',
            'Cumuler colonne par colonne : l\'**effectif cumulé** à la ligne i est la somme des ' +
              'effectifs de cette ligne et de toutes les précédentes ; la **fréquence cumulée** ' +
              'se déduit directement de l\'effectif cumulé (jamais recalculée séparément).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'liste brute, n = 20',
          formula: 'Série brute (taille, en cm, de 20 athlètes) : 3, 5, 3, 7, 5, 12, 5, 3, 7, 5, 3, 12, 7, 5, 3, 7, 5, 12, 3, 5',
          steps: [
            { tag: '1 — valeurs distinctes, ordre croissant', text: '3, 5, 7, 12' },
            { tag: '2 — compter chaque valeur', text: '3 apparaît 6 fois, 5 apparaît 7 fois, 7 apparaît 4 fois, 12 apparaît 3 fois (total 6+7+4+3 = 20 ✓)' },
          ],
          result: { tag: 'tableau complet', text: 'voir le tableau ci-dessous' },
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
          kind: 'astuce',
          label: 'Vérifier son tableau en un coup d\'œil',
          text:
            'La dernière ligne de la colonne effectif cumulé doit toujours valoir n (l\'effectif ' +
            'total), et la dernière ligne de la fréquence cumulée doit toujours valoir 100 % — ' +
            'sinon une valeur a été oubliée ou comptée en trop.',
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
        {
          kind: 'para',
          text:
            'Pour un caractère **continu** (ou discret avec trop de valeurs distinctes), on ' +
            'regroupe les données en **classes** — des intervalles consécutifs, de même ' +
            '**amplitude** — avant de les représenter par un **histogramme** : des barres ' +
            'accolées dont la **hauteur** vaut l\'effectif (ou la fréquence) de chaque classe.',
        },
        {
          kind: 'piege',
          label: 'Quelle borne appartient à quelle classe ?',
          text:
            'Convention utilisée dans tout ce chapitre : une classe [borne inf ; borne sup[ ' +
            'contient sa borne inférieure mais **pas** sa borne supérieure — une donnée ' +
            '**exactement** sur une frontière appartient toujours à la classe **suivante**. Seule ' +
            'exception : la **toute dernière classe** du tableau inclut aussi sa borne ' +
            'supérieure, pour ne perdre aucune donnée.',
        },
        {
          kind: 'exemple',
          badge: '4 classes, amplitude 2',
          formula: 'n = 20 données, classes imposées d\'amplitude 2 :',
          steps: [],
          result: { tag: 'tableau + histogramme', text: 'voir ci-dessous' },
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
            caption: '4 classes d\'amplitude 2 — hauteur des barres = effectif de chaque classe',
          },
        },
        {
          kind: 'astuce',
          text:
            'Sur cette plateforme, l\'effectif total n est toujours choisi pour que chaque ' +
            'fréquence tombe sur un **pourcentage entier** — un signal utile pour se relire : ' +
            'une fréquence à virgule signale presque toujours une erreur de comptage.',
        },
        {
          kind: 'rappel',
          label: 'Pour aller plus loin — amplitudes inégales',
          items: [
            'Cette plateforme ne propose que des classes de **même amplitude**, où hauteur et ' +
              'effectif se confondent. Mais dès qu\'un manuel présente des classes d\'amplitudes ' +
              '**différentes** (une dernière classe plus large, par exemple), la règle générale ' +
              'change : c\'est l\'**aire** de chaque rectangle qui doit rester proportionnelle à ' +
              'l\'effectif, pas sa hauteur — sinon la classe la plus large paraît visuellement ' +
              'plus peuplée qu\'elle ne l\'est. Un piège classique à connaître, même s\'il ne se ' +
              'présente jamais ici.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Regroupement en classes et histogramme',
          generatorId: 'gen31',
          description: [
            'Classe des données brutes dans des classes imposées, calcule effectifs et ' +
              'fréquences, puis trace l\'histogramme.',
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
        {
          kind: 'para',
          text:
            'La **moyenne pondérée** tient compte du fait que chaque valeur n\'a pas le même « ' +
            'poids » : une valeur qui revient 7 fois compte 7 fois plus qu\'une valeur isolée.',
        },
        {
          kind: 'definition',
          label: 'Formule',
          items: [
            '$\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i} = \\dfrac{x_1 n_1 + x_2 n_2 + x_3 n_3 + \\ldots}{n_1+n_2+n_3+\\ldots}$',
            'On multiplie chaque valeur par son propre effectif, on additionne tous ces ' +
              'produits, puis on divise par l\'effectif total.',
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
          kind: 'methode',
          label: 'Données regroupées en classes',
          items: [
            'Quand les données sont en classes, on utilise le **centre de chaque classe** (la ' +
              'moyenne de ses deux bornes) comme représentant de toute la classe. Sur le même ' +
              'exemple, classes [0;4[/[4;8[/[8;12[/[12;16[ (mêmes effectifs 5/8/4/3), centres ' +
              '2/6/10/14 : produits 10, 48, 40, 42 → somme 140 → $\\bar{x} = 140/20 = 7$.',
          ],
        },
        {
          kind: 'piege',
          text:
            'Ne **jamais** faire la moyenne des valeurs distinctes seules (ici $(2+6+9+12)/4 = ' +
            '7{,}25$) — cela ignore complètement les effectifs et donne un résultat faux dès que ' +
            'les effectifs ne sont pas tous égaux.',
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
        {
          kind: 'para',
          text:
            'Ces paramètres localisent une série par le **rang** des individus, pas par un ' +
            'calcul sur les valeurs elles-mêmes. La **médiane** partage la série en deux ' +
            'moitiés égales ; les **quartiles** Q1 et Q3 la partagent en quatre. Le **mode** ' +
            'est simplement la valeur (ou la classe) de plus grand effectif.',
        },
        {
          kind: 'methode',
          label: 'La règle du seuil',
          items: [
            'Sur le tableau des effectifs cumulés, chaque paramètre correspond à un **seuil** : ' +
              'n/2 pour la médiane, n/4 pour Q1, 3n/4 pour Q3. Le paramètre cherché est alors la ' +
              '**première valeur** dont l\'effectif cumulé dépasse **strictement** ce seuil.',
          ],
        },
        {
          kind: 'piege',
          label: '« Strictement supérieur », jamais « supérieur ou égal »',
          text:
            'C\'est l\'erreur la plus fréquente : si l\'effectif cumulé est **exactement** égal au ' +
            'seuil, ce n\'est **pas encore** la bonne valeur — il faut prendre la **suivante**. ' +
            'Preuve sur l\'exemple ci-dessous : seuil médiane = 10, effectif cumulé de x=2 vaut ' +
            '5 (trop petit), de x=6 vaut 13 (13 > 10, c\'est elle) — jamais x=2 même si un ' +
            'raisonnement pressé pourrait s\'arrêter dès que le cumulé « approche » le seuil.',
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
            { kind: 'para', text: 'Q1 — seuil n/4 = 5 : premier cumulé > 5 est 13 (à x=6) → Q1 = 6 (5 n\'est pas > 5, on passe à la ligne suivante).' },
            { kind: 'para', text: 'Q3 — seuil 3n/4 = 15 : premier cumulé > 15 est 17 (à x=9) → Q3 = 9.' },
            { kind: 'para', text: 'Résultat : min=2, Q1=6, médiane=6, Q3=9, max=12, mode=6 (effectif 8, le plus grand).' },
          ],
        },
        {
          kind: 'methode',
          label: 'Données regroupées en classes : interpolation',
          items: [
            'On repère d\'abord la **classe** où le seuil tombe, comme ci-dessus. La valeur ' +
              'exacte s\'obtient ensuite par interpolation linéaire le long de cette classe : ' +
              '$\\text{valeur} = L + \\dfrac{\\text{seuil} - CF_{avant}}{n_{classe}} \\cdot \\text{amplitude}$, ' +
              'où L est la borne inférieure de la classe et $CF_{avant}$ l\'effectif cumulé ' +
              '**juste avant** cette classe.',
            'Sur les mêmes effectifs regroupés en classes [0;4[/[4;8[/[8;12[/[12;16[ : le seuil ' +
              'médiane=10 tombe dans [4;8[ (cumulés 5→13) → médiane = 4 + ((10−5)/8)×4 = 6,5.',
          ],
        },
        { kind: 'subheading', text: 'Le mode, sans aucun calcul' },
        {
          kind: 'para',
          text:
            'Le **mode** est simplement la valeur (ou la classe) de plus grand effectif — il se ' +
            'lit directement sur un tableau déjà ordonné, sans seuil ni cumul.',
        },
        {
          kind: 'exemple',
          badge: 'liste brute ordonnée',
          formula: '1,8 — 1,8 — 2,6 — 2,6 — 2,6 — 2,6 — 2,7 — 2,9 — 3,0 — 3,1 — 3,1 — 3,1 — 3,3 — 3,3 — 3,5 — 3,9 — 4,0 — 4,1 — 4,1 — 4,3',
          steps: [{ tag: 'une fois triée', text: 'la valeur qui revient le plus souvent apparaît immédiatement : 2,6 (4 fois), plus qu\'aucune autre' }],
          result: { tag: 'mode', text: '2,6' },
        },
        {
          kind: 'methode',
          label: 'Quelle valeur centrale choisir ?',
          items: [
            'Les trois se valent mathématiquement — mais pas dans toutes les situations :',
            '**Moyenne** — utilise toutes les données, mais très sensible aux valeurs extrêmes ' +
              '(un seul salaire énorme fait grimper toute une moyenne).',
            '**Médiane** — insensible aux valeurs extrêmes, mais ne regarde qu\'une seule ' +
              'position, en ignorant la forme du reste de la série.',
            '**Mode** — toujours une vraie valeur de la série, facile à lire, mais peu ' +
              'représentatif si les effectifs sont trop dispersés (ou s\'il y a plusieurs modes).',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Paramètres de position',
          generatorId: 'gen33',
          description: [
            'Détermine médiane, Q1, Q3, min, max et mode — en données discrètes, ou par lecture ' +
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
        {
          kind: 'para',
          text:
            'La **boîte à moustaches** (ou **box-plot**) résume une série en cinq nombres ' +
            'seulement : minimum, Q1, médiane, Q3, maximum. La **boîte** couvre l\'intervalle ' +
            '[Q1 ; Q3] — elle contient donc la moitié « centrale » de la série — et les ' +
            '**moustaches** s\'étendent jusqu\'au minimum et au maximum.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'boxPlot',
            series: [{ min: 2, q1: 5, median: 8, q3: 12, max: 15 }],
            xAxisLabel: 'x',
            caption: 'min=2, Q1=5, médiane=8, Q3=12, max=15 — boîte = [Q1;Q3], moustaches jusqu\'aux extrêmes',
          },
        },
        {
          kind: 'methode',
          label: 'Comparer deux boîtes à moustaches',
          items: [
            'Deux questions reviennent systématiquement : quelle série a la **médiane** la plus ' +
              'grande (trait vertical dans la boîte le plus à droite) ? et quelle série est la ' +
              '**plus dispersée** — la boîte la plus large, mesurée par l\'**écart ' +
              'interquartile** Q3 − Q1 ?',
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
            caption:
              'Série A : min2/Q1 5/méd8/Q3 12/max15 (IQR=7) — Série B : min1/Q1 4/méd6/Q3 9/max11 ' +
              '(IQR=5) — A a la médiane la plus grande ET la boîte la plus large',
          },
        },
        {
          kind: 'astuce',
          label: 'La largeur de la boîte, un indice de confiance',
          text:
            'Plus la boîte est **étroite**, plus les valeurs centrales de la série sont ' +
            'resserrées autour de la médiane — celle-ci résume alors bien toute la série. Une ' +
            'boîte **large** signale l\'inverse : la médiane reste un centre valide, mais elle ' +
            'est moins représentative, les valeurs étant beaucoup plus dispersées autour ' +
            'd\'elle. Sur l\'exemple ci-dessus, la médiane de B (boîte la plus étroite) est la ' +
            'plus représentative des deux.',
        },
        {
          kind: 'entrainement',
          title: 'Boîte à moustaches',
          generatorId: 'gen36',
          description: [
            'Construis une boîte à moustaches en plaçant les 5 marqueurs sur un axe ' +
              'interactif, relève ses 5 valeurs, ou compare deux séries (médiane, écart interquartile).',
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
        {
          kind: 'para',
          text:
            'La **moyenne** résume le centre d\'une série, mais deux séries de même moyenne ' +
            'peuvent être très différentes — l\'une resserrée autour de x̄, l\'autre très ' +
            'étalée. Ces trois paramètres mesurent cet étalement.',
        },
        { kind: 'subheading', text: 'L\'étendue' },
        {
          kind: 'para',
          text:
            'La plus simple : $\\text{étendue} = max - min$. Rapide, mais ne tient compte que ' +
            'des deux valeurs extrêmes — insensible à tout ce qui se passe entre les deux.',
        },
        { kind: 'subheading', text: 'La variance et l\'écart-type' },
        {
          kind: 'definition',
          label: 'Formules',
          items: [
            'Variance — moyenne des carrés des écarts à x̄ : $V = \\dfrac{\\Sigma(x_i-\\bar{x})^2 ' +
              '\\cdot n_i}{n} = \\dfrac{(x_1-\\bar{x})^2 n_1 + (x_2-\\bar{x})^2 n_2 + \\ldots}{n_1+n_2+\\ldots}$.',
            'Écart-type — sa racine carrée, dans la même unité que les données (contrairement à ' +
              'la variance, en unité au carré) : $\\text{écart-type} = \\sqrt{V}$.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Convention de calcul sur cette plateforme',
          items: [
            'La variance se calcule **toujours** en divisant par l\'effectif total n (jamais ' +
              'par n−1). L\'écart-type se calcule ensuite comme la racine carrée de la variance ' +
              '**déjà arrondie à 2 décimales** — jamais depuis le rapport non arrondi. ' +
              'Respecter cet ordre est nécessaire pour retomber exactement sur la valeur ' +
              'vérifiée par le générateur.',
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
          kind: 'entrainement',
          title: 'Paramètres de dispersion',
          generatorId: 'gen34',
          description: [
            'Calcule la variance puis l\'écart-type d\'une série discrète, x̄ étant donné dans l\'énoncé.',
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
        {
          kind: 'para',
          text:
            'Cette inégalité garantit, **pour n\'importe quelle série** (peu importe sa forme), ' +
            'qu\'une proportion minimale des valeurs se trouve à moins de k écarts-types de la ' +
            'moyenne — dès que k > 1 :',
        },
        {
          kind: 'definition',
          items: ['au moins $1 - \\dfrac{1}{k^2}$ (soit 100 % de cette fraction) des valeurs sont dans $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$'],
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
            'Si l\'énoncé donne directement le pourcentage minimal garanti plutôt que k, on ' +
            'retrouve k par la formule réciproque $k = \\sqrt{100/(100-\\text{pourcentage})}$, ' +
            'puis l\'intervalle $[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$ comme d\'habitude.',
        },
        {
          kind: 'exemple',
          badge: 'à partir du pourcentage, k = √20',
          formula: 'On veut au moins 95 % des valeurs dans l\'intervalle — quel k utiliser ?',
          steps: [
            { tag: 'poser l\'équation', text: '$1 - 1/k^2 = 0{,}95 \\iff 1/k^2 = 0{,}05 \\iff k^2 = 20$' },
            { tag: 'k strictement positif', text: '$k = \\sqrt{20}$' },
          ],
          result: { tag: 'résultat', text: 'c\'est dans l\'intervalle $[\\bar{x}-\\sqrt{20}\\sigma\\,;\\,\\bar{x}+\\sqrt{20}\\sigma]$ qu\'il y a au moins 95 % des valeurs' },
        },
        {
          kind: 'entrainement',
          title: 'Inégalité de Bienaymé-Tchebychev',
          generatorId: 'gen37',
          description: [
            'Applique l\'inégalité sous 8 variantes : à partir de k, retrouve l\'intervalle, le ' +
              'pourcentage minimal ou le nombre minimal d\'individus concernés — et réciproquement.',
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
        {
          kind: 'para',
          text:
            'Comparer deux séries, c\'est réutiliser tous les outils précédents sur les deux à ' +
            'la fois : quelle série a la **médiane** la plus grande (centrage) ? laquelle a ' +
            'l\'**écart-type** le plus petit, donc la plus homogène (dispersion) ? Les données ' +
            'peuvent être données sous forme de tableaux bruts, de récapitulatifs déjà ' +
            'calculés, ou de **courbes cumulées** à lire directement sur un graphique.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 0, value: 0, label: '' },
              { n: 3, value: 6, label: '' },
              { n: 5, value: 13, label: '' },
              { n: 7, value: 17, label: '' },
              { n: 12, value: 20, label: '' },
              { n: 15, value: 20, label: '' },
            ],
            connector: 'straight',
            highlightPoint: { index: 3, xLabel: '7', yLabel: '17' },
            yTicks: [5, 10, 15, 20],
            xAxisLabel: 'valeur',
            yAxisLabel: 'effectif cumulé',
            caption: 'lecture d\'un seuil : à x=7, l\'effectif cumulé lu sur la courbe vaut 17 — même principe pour superposer deux courbes et comparer deux séries',
          },
        },
        {
          kind: 'methode',
          label: 'Les 4 types de questions',
          items: [
            '**Centrage** — comparer les deux médianes.',
            '**Dispersion** — comparer les deux écarts-types (la plus petite valeur = série la plus homogène).',
            '**Seuil** — lire un effectif (ou une fréquence) cumulé(e) à une valeur donnée, en ' +
              'projetant sur la courbe puis sur l\'axe des effectifs.',
            '**Interprétation** — traduire ces lectures en une phrase de conclusion correcte.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Lire un intervalle, pas seulement un seuil',
          text:
            'Pour répondre à « quel pourcentage se situe entre a et b ? », on ne lit jamais ' +
            'l\'intervalle directement sur la courbe : on lit séparément le cumulé en b et le ' +
            'cumulé en a, puis on **soustrait** les deux — cumulé(b) − cumulé(a).',
        },
        {
          kind: 'entrainement',
          title: 'Comparaison de deux séries statistiques',
          generatorId: 'gen38',
          description: [
            'Compare deux séries sous 3 présentations (tableaux bruts, récapitulatif, courbes ' +
              'cumulées) sur le centrage, la dispersion, la lecture d\'un seuil et l\'interprétation.',
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
      kicker: 'tout le chapitre sur un seul jeu de données, puis 200 affirmations en 10 thèmes',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux façons de réviser ce chapitre : un **exercice de synthèse** qui enchaîne, sur ' +
            'un seul jeu de données cohérent, la moyenne pondérée, les paramètres de position, ' +
            'la boîte à moustaches, la dispersion et Bienaymé-Tchebychev ; ou un **quiz ' +
            'vrai/faux** qui couvre transversalement les 9 générateurs de ce chapitre.',
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
            'Le thème « paramètres de position » du quiz revient explicitement sur le piège du ' +
            'seuil strict signalé à la section 4 — utile pour vérifier que le réflexe est bien acquis.',
        },
        {
          kind: 'entrainement',
          title: 'Statistique descriptive à une variable — quiz vrai/faux',
          generatorId: 'gen59',
          description: [
            '200 affirmations pré-écrites réparties en 10 thèmes qui reprennent tout ce ' +
              'chapitre. Un seul essai par question, la justification est toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 59. Statistique descriptive à une variable — quiz vrai/faux »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Vocabulaire** — population, individu, caractère (discret ou continu), effectif nᵢ, ' +
        'effectif total n, fréquence fᵢ = nᵢ/n.',
      '**Regroupement** — tableau de fréquences pour une liste discrète, classes d\'amplitude ' +
        'constante et convention [inf;sup[ (sauf la dernière, fermée des deux côtés) pour un ' +
        'caractère continu.',
      '**Moyenne** — $\\bar{x} = \\Sigma(x_i \\cdot n_i)/\\Sigma n_i$, jamais la moyenne des ' +
        'valeurs distinctes seules.',
      '**Position** — médiane/Q1/Q3 = première valeur dont l\'effectif cumulé dépasse ' +
        '**strictement** le seuil n/2, n/4, 3n/4 ; interpolation linéaire pour des classes.',
      '**Dispersion** — étendue = max−min ; variance = $\\Sigma(x_i-\\bar{x})^2 \\cdot n_i/n$ ' +
        '(division par n) ; écart-type = √variance, calculé depuis la variance déjà arrondie.',
      '**Bienaymé-Tchebychev** — au moins (1−1/k²)×100% des valeurs dans ' +
        '$[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]$, pour k>1 (k=2 → au moins 75%).',
    ],
    checklist: {
      items: [
        'Ma colonne d\'effectifs cumulés se termine-t-elle bien par n, et ma fréquence cumulée par 100% ?',
        'Ai-je bien pris la première valeur dont le cumulé dépasse strictement le seuil, jamais celle qui l\'atteint tout juste ?',
        'Ai-je divisé la somme des carrés d\'écarts par n, pas par n−1 ?',
        'Ai-je calculé l\'écart-type à partir de la variance déjà arrondie ?',
      ],
    },
    forward:
      'Moyenne, médiane et écart-type reviendront tels quels dans le chapitre sur les ' +
      'statistiques à deux variables et la corrélation — ce sont les briques de base sur ' +
      'lesquelles tout le reste s\'appuie.',
  },
}
