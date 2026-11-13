import type { ChapterContent } from '../../types'

export const caracteristiquesFonctionsReference: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 3,
  title: 'Caractéristiques d\'une fonction et fonctions de référence',
  slug: 'caracteristiques-fonctions-reference',
  lede:
    'Six courbes reviennent tout le temps : la parabole, la cubique, les deux racines, ' +
    'l\'hyperbole et le « V » de la valeur absolue. Dans ce chapitre, tu vas les fixer une bonne ' +
    'fois pour toutes. Tu vas apprendre leur allure, leurs transformations, comment les lire sur ' +
    'un graphique et comment les manipuler par le calcul. Ensuite, tu sauras reconnaître ' +
    'n\'importe laquelle d\'entre elles, même écrite de façon inhabituelle.',

  intro: {
    title: 'Avant de commencer : les 6 fonctions de référence',
    blocks: [
        { kind: 'video', title: 'Avant de commencer (1/2) : les 6 fonctions de référence', youtubeId: 'FvsiKv9MylQ' },
        { kind: 'video', title: 'Avant de commencer (2/2) : les 6 courbes de référence', youtubeId: '716Y13kFk2c' },
      {
        kind: 'para',
        text:
          'Une **fonction de référence**, c\'est une forme de base : la plus simple de sa ' +
          'famille. Toutes les fonctions de ce chapitre viennent d\'une **transformation** de ' +
          'l\'une de ces six-là.',
      },
      {
        kind: 'intuition',
        label: 'Tu connais déjà ça',
        text:
          'Au chapitre 1, tu as déjà appris à connaître $x^2$ à fond : domaine, sommet, ' +
          'transformations. Ici, tu vas faire exactement la même chose, mais avec cinq ' +
          'nouvelles courbes en plus de la parabole. Une fois que tu sais « lire » une famille ' +
          'de référence, tu sais les lire toutes — c\'est la même grille de lecture à chaque fois.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — qu\'est-ce qu\'une fonction ?',
        items: [
          'Une **fonction d\'une variable réelle**, c\'est une relation qui associe à chaque ' +
            'réel **au plus un** réel — jamais deux ou plus. C\'est la seule condition qui ' +
            'distingue une fonction d\'une relation quelconque.',
          'La relation « $y = x^2$ » est une fonction : un réel n\'a jamais plus d\'un carré. ' +
            'La relation « $y^2 = x$ » n\'en est **pas** une. Pour $x = 4$, $y = 2$ convient, ' +
            'mais $y = -2$ aussi : deux réels pour un seul x. Sur un graphique, ce test se voit ' +
            'd\'un coup d\'œil. Une droite verticale ne doit jamais couper la courbe d\'une ' +
            'fonction en plus d\'un point.',
        ],
      },
      {
        kind: 'historique',
        titre: 'Le repère (x;y) n\'a pas toujours existé',
        text:
          'Avant 1637, personne n\'associait une courbe à des coordonnées (x;y) comme tu le ' +
          'fais naturellement ici. C\'est le philosophe et mathématicien français ' +
          '**René Descartes** qui, dans un appendice de son Discours de la méthode intitulé ' +
          'La Géométrie, invente l\'idée de repérer un point par deux nombres mesurés le long ' +
          'de deux axes perpendiculaires. Cette invention — le **repère cartésien**, qui ' +
          'porte encore son nom — fusionne pour la première fois l\'algèbre et la ' +
          'géométrie : une équation comme $y=x^2$ devient une courbe qu\'on peut dessiner, et ' +
          'une courbe devient une équation qu\'on peut calculer. Sans cette idée, impossible ' +
          'de lire les 6 fonctions de référence de ce chapitre sur un graphique.',
        image: {
          src: '/images/historique/descartes.jpg',
          alt: 'Portrait de René Descartes',
          caption: 'René Descartes (1596–1650), portrait attribué à Frans Hals, v. 1649.',
        },
      },
      {
        kind: 'featureTable',
        caption: 'Les 6 familles',
        headers: ['Famille', 'Formule', 'Domaine', 'Allure'],
        rows: [
          ['Carrée', 'x²', 'ℝ', 'parabole, sommet à l\'origine, paire'],
          ['Cube', 'x³', 'ℝ', 'point d\'inflexion à l\'origine, toujours croissante, impaire'],
          ['Racine carrée', '√x', '[0 ; +∞[', 'part de l\'origine, croissante, concave'],
          ['Racine cubique', '∛x', 'ℝ', 'tangente verticale à l\'origine, toujours croissante, impaire'],
          ['Inverse', '1/x', 'ℝ \\ {0}', 'hyperbole à 2 branches, impaire'],
          ['Valeur absolue', '|x|', 'ℝ', '« V », sommet à l\'origine, paire'],
        ],
      },
      {
        kind: 'intuition',
        label: 'Pourquoi « paire » et « impaire » ?',
        text:
          'Une fonction **paire**, c\'est une courbe qui se reflète parfaitement si tu poses un ' +
          'miroir sur l\'axe Oy — la moitié gauche est le reflet exact de la moitié droite. Une ' +
          'fonction **impaire**, c\'est une courbe qui revient identique à elle-même après une ' +
          'rotation d\'un demi-tour (180°) autour de l\'origine. Regarde les 6 courbes ' +
          'ci-dessous avec cette image en tête : tu verras tout de suite lesquelles sont ' +
          '« miroir » et lesquelles sont « demi-tour ».',
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: (x) => x * x, tone: 'accent' }],
          xMin: -2.2,
          xMax: 2.2,
          xTicks: [1, 2],
          yTicks: [1, 4],
          fixedYRange: { min: -0.5, max: 4.5 },
          points: [
            { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'left' },
            { x: 2, y: 4, label: '(2;4)', tone: 'accent', labelPos: 'left' },
            { x: 0, y: 0, label: 'S', tone: 'accent' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'y = x² — sommet S, paire (symétrie d\'axe Oy)',
        },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: (x) => x * x * x, tone: 'accent' }],
          xMin: -2.2,
          xMax: 2.2,
          xTicks: [1, 2],
          yTicks: [1, 8],
          fixedYRange: { min: -9, max: 9 },
          points: [
            { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'above' },
            { x: 2, y: 8, label: '(2;8)', tone: 'accent', labelPos: 'left' },
            { x: 0, y: 0, label: 'infl.', tone: 'accent', labelPos: 'left' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'y = x³ — point d\'inflexion, impaire (symétrie centrale)',
        },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: Math.sqrt, tone: 'accent', xMin: 0, xMax: 4.3 }],
          xMin: -1,
          xMax: 4.3,
          xTicks: [1, 4],
          yTicks: [1, 2],
          fixedYRange: { min: -0.5, max: 2.5 },
          points: [
            { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'left' },
            { x: 4, y: 2, label: '(4;2)', tone: 'accent', labelPos: 'left' },
            { x: 0, y: 0, label: '0', tone: 'accent' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'y = √x — départ en (0;0), domaine [0;+∞[',
        },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: (x) => Math.sign(x) * Math.pow(Math.abs(x), 1 / 3), tone: 'accent' }],
          xMin: -9,
          xMax: 9,
          xTicks: [1, 8],
          yTicks: [1, 2],
          fixedYRange: { min: -2.3, max: 2.3 },
          points: [
            { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'right' },
            { x: 8, y: 2, label: '(8;2)', tone: 'accent', labelPos: 'left' },
            { x: 0, y: 0, label: 'infl.', tone: 'accent' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'y = ∛x — point d\'inflexion, tangente verticale, impaire',
        },
      },
      {
        kind: 'intuition',
        label: 'Pourquoi la courbe ne touche jamais les axes ?',
        text:
          'Prends 1 et divise-le par un nombre de plus en plus grand : $1/10=0,1$, puis ' +
          '$1/100=0,01$, puis $1/1000=0,001$... Le résultat se rapproche de 0 sans **jamais** ' +
          'l\'atteindre. C\'est exactement ce que fait la courbe de $1/x$ très loin de ' +
          'l\'origine : elle s\'approche de l\'axe des x sans jamais le toucher — c\'est ça, une ' +
          '**asymptote**.',
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [
            { fn: (x) => 1 / x, tone: 'accent', xMin: -3, xMax: -0.12 },
            { fn: (x) => 1 / x, tone: 'accent', xMin: 0.12, xMax: 3 },
          ],
          xMin: -3,
          xMax: 3,
          xTicks: [1, 2],
          yTicks: [0.5, 1],
          yTickLabels: { 0.5: '0,5' },
          fixedYRange: { min: -3, max: 3 },
          horizontalAsymptotes: [{ y: 0, label: 'AH' }],
          verticalAsymptotes: [{ x: 0 }],
          points: [
            { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'above' },
            { x: 2, y: 0.5, label: '(2;0,5)', tone: 'accent', labelPos: 'above' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'y = 1/x — asymptotes AV/AH, impaire (symétrie centrale)',
        },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: Math.abs, tone: 'accent' }],
          xMin: -2.5,
          xMax: 2.5,
          xTicks: [-2, 1],
          yTicks: [1, 2],
          fixedYRange: { min: -0.3, max: 2.7 },
          points: [
            { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'right' },
            { x: -2, y: 2, label: '(−2;2)', tone: 'accent', labelPos: 'left' },
            { x: 0, y: 0, label: 'S', tone: 'accent' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: 'y = |x| — sommet S, paire (symétrie d\'axe Oy)',
        },
      },
      {
        kind: 'atelier',
        tag: 'familles-parite-widget',
        label: 'Manipule toi-même — miroir ou demi-tour ?',
        caption:
          'Choisis une famille et observe le symétrique de (t ; f(t)) : miroir vertical ' +
          '(paire) ou symétrie par l\'origine (impaire) ; pour la racine carrée, aucun ' +
          'symétrique, son domaine ne contient pas −t. Passe ensuite en mode « Fonction ' +
          'transformée » : une translation horizontale casse toujours la parité, une ' +
          'translation verticale casse l\'imparité mais pas la parité.',
      },
      {
        kind: 'astuce',
        label: 'Astuce — deux paires de fonctions réciproques',
        text:
          '$x^2$ et $\\sqrt{x}$ sont réciproques l\'une de l\'autre sur ℝ⁺. $x^3$ et ' +
          '$\\sqrt[3]{x}$ le sont sur ℝ tout entier. Dans un repère orthonormé, les courbes de ' +
          'deux fonctions réciproques sont toujours symétriques par rapport à la droite ' +
          'd\'équation $y = x$. C\'est un bon moyen de vérifier une courbe de racine carrée ou ' +
          'de racine cubique tracée à la main.',
      },
      {
        kind: 'intuition',
        label: 'Pour visualiser un point d\'inflexion',
        text:
          'Imagine une route qui vire d\'abord vers la gauche, puis change et vire vers la ' +
          'droite. L\'endroit exact où elle change de sens de virage, c\'est le point ' +
          'd\'inflexion. Sur les courbes de $x^3$ et de $\\sqrt[3]{x}$, ce moment de bascule ' +
          'tombe pile à l\'origine — avant, la courbe est creusée d\'un côté ; après, elle est ' +
          'creusée de l\'autre.',
      },
      {
        kind: 'rappel',
        label: 'Point d\'inflexion — cube et racine cubique',
        items: [
          'Le point où une courbe change de concavité (elle passe de « tournée vers le haut » à ' +
            '« tournée vers le bas », ou l\'inverse) s\'appelle un **point d\'inflexion**. Pour ' +
            '$x^3$ et $\\sqrt[3]{x}$, ce point est toujours l\'origine. La tangente y est ' +
            'verticale pour $\\sqrt[3]{x}$, horizontale pour $x^3$.',
        ],
      },
      {
        kind: 'piege',
        label: 'Piège classique — l\'inverse n\'est pas décroissante « sur ℝ \\ {0} »',
        text:
          '$f(x) = 1/x$ est bien décroissante **sur chaque branche prise séparément** ' +
          '(]−∞ ; 0[ et ]0 ; +∞[). Mais elle ne l\'est **pas** globalement ! Prends ' +
          '$f(-1) = -1$ et $f(1) = 1$. Bien que $-1 < 1$, on a $f(-1) < f(1)$ : ça, c\'est le ' +
          'signe d\'une croissance, pas d\'une décroissance. La monotonie d\'une fonction ne se ' +
          'prolonge jamais automatiquement à travers une valeur interdite du domaine.',
      },
      {
        kind: 'atelier',
        tag: 'inverse-monotonie-widget',
        label: 'Manipule toi-même — teste toi-même la monotonie',
        caption:
          'Fais glisser x₁ et x₂ n\'importe où sur les deux branches. Tant qu\'ils restent du ' +
          'même côté, la décroissance se confirme. Dès qu\'ils passent chacun d\'un côté ' +
          'différent, le verdict bascule en rouge — exactement le contre-exemple f(−1)=−1 et ' +
          'f(1)=1 du texte, mais que tu peux maintenant reproduire (ou déjouer) toi-même.',
      },
    ],
  },

  sections: [
    {
      id: 'lire',
      number: 1,
      title: 'Lire les caractéristiques sur un graphique',
      kicker: 'domaine, zéros, variations, ordonnée à l\'origine, valeur en un point, asymptotes',
      blocks: [
        { kind: 'video', title: 'Lire les caractéristiques sur un graphique', youtubeId: 'Xrng-oSlUAo' },
        {
          kind: 'para',
          text:
            'Une courbe composite — assemblée de plusieurs morceaux de familles différentes — ' +
            'se lit toujours dans le même ordre. Et tu n\'as même pas besoin de sa formule ' +
            'algébrique !',
        },
        {
          kind: 'methode',
          label: 'Méthode — l\'ordre de lecture',
          items: [
            '**Domaine** — repère d\'abord toute valeur exclue (point creux, coupure ' +
              'verticale). Décris le reste seulement après.',
            '**Ensemble image** — les valeurs prises par f : projette la courbe sur l\'axe des ' +
              'y, puis lis la plus petite et la plus grande ordonnée atteintes.',
            '**Zéros** — les abscisses où la courbe traverse l\'axe des x.',
            '**Variations** — croissante, décroissante ou constante, intervalle par intervalle.',
            '**Ordonnée à l\'origine** — la valeur en x = 0, si elle existe.',
            '**Valeur en un point précis** — lis f(v) pour un v donné.',
            '**Asymptotes** — les droites (verticale et/ou horizontale) que la courbe approche ' +
              'sans jamais les toucher.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Pour repérer une croissance ou une décroissance d\'un coup d\'œil',
          text:
            'Parcours la courbe de gauche à droite, comme si tu marchais dessus. Si tu montes, ' +
            'la fonction est **croissante**. Si tu descends, elle est **décroissante**. Si le ' +
            'terrain reste plat, elle est constante. C\'est tout : pas besoin de retenir des ' +
            'inégalités par cœur avant de savoir répondre d\'un coup d\'œil sur un graphique.',
        },
        {
          kind: 'historique',
          titre: 'Représenter une grandeur qui varie, 300 ans avant Descartes',
          text:
            'Au 14e siècle, bien avant l\'invention du repère cartésien, le philosophe et ' +
            'évêque français **Nicole Oresme** a déjà l\'idée de représenter une grandeur qui ' +
            'varie (comme une vitesse) par une figure géométrique — sa théorie dite de la ' +
            '« latitude des formes » utilise des segments verticaux de hauteur variable pour ' +
            'visualiser comment une quantité évolue, l\'ancêtre lointain du graphique d\'une ' +
            'fonction. Oresme n\'a ni axes, ni coordonnées numériques au sens moderne, mais ' +
            'l\'intuition est déjà là : une figure peut représenter un changement, pas ' +
            'seulement une valeur fixe. Il faudra attendre Descartes, presque 300 ans plus ' +
            'tard, pour que cette intuition devienne un véritable outil de calcul.',
          image: {
            src: '/images/historique/oresme.jpg',
            alt: 'Miniature représentant Nicole Oresme, Traité de la sphère',
            caption:
              'Nicole Oresme (v. 1320–1382), miniature du Traité de la sphère, Bibliothèque ' +
              'nationale de France, fonds français 565 (v. 1400–1420).',
          },
        },
        {
          kind: 'rappel',
          label: 'Définitions précises — le vocabulaire de chaque question',
          items: [
            '**Image** de a — le réel f(a) ; ordonnée du point de la courbe d\'abscisse a. Un réel ' +
              'a au plus une image.',
            '**Antécédent** de k — un réel a tel que f(a) = k ; abscisse d\'un point de la courbe ' +
              'situé à la hauteur k. Un réel k peut avoir 0, 1 ou plusieurs antécédents.',
            '**Ensemble image** — im f, l\'ensemble de toutes les images f(x), quand x parcourt le ' +
              'domaine.',
            '**Zéro** — un réel dont l\'image vaut 0 ; abscisse d\'un point d\'intersection avec l\'axe Ox.',
            '**Ordonnée à l\'origine** — la valeur f(0), si elle existe ; ordonnée du point ' +
              'd\'intersection avec l\'axe Oy.',
            '**Fonction paire** — pour tout réel a du domaine, −a aussi, et f(−a) = f(a). Le ' +
              'graphique admet Oy comme axe de symétrie.',
            '**Fonction impaire** — pour tout réel a du domaine, −a aussi, et f(−a) = −f(a). ' +
              'Le graphique admet l\'origine (0 ; 0) comme centre de symétrie.',
            '**Croissante sur un intervalle** — pour tous x₁, x₂ de cet intervalle : ' +
              'x₁ ≤ x₂ ⟹ f(x₁) ≤ f(x₂) (l\'ordre est conservé).',
            '**Décroissante sur un intervalle** — pour tous x₁, x₂ de cet intervalle : ' +
              'x₁ ≤ x₂ ⟹ f(x₁) ≥ f(x₂) (l\'ordre s\'inverse).',
            '**Maximum de f sur [c ; d]** — une valeur f(a) telle que f(a) ≥ f(x) pour tout x de [c ; d].',
            '**Minimum de f sur [c ; d]** — une valeur f(a) telle que f(a) ≤ f(x) pour tout x de [c ; d].',
          ],
        },
        {
          kind: 'astuce',
          label: 'Astuce — un maximum dépend toujours de l\'intervalle choisi',
          text:
            'Le maximum ou le minimum d\'une fonction n\'est jamais une propriété absolue. Il ' +
            'se définit toujours **par rapport à un intervalle précis**. Une même courbe peut ' +
            'avoir un maximum de 3 sur [−9 ; 2]. Restreinte à [−8 ; 0], elle peut avoir un ' +
            'maximum tout différent — parce que le point le plus haut de la première fenêtre ' +
            'peut tomber hors de la seconde.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 1 - x * x, tone: 'accent', xMin: -2, xMax: -0.02 },
              { fn: (x) => 1 / (x - 2) + 1, tone: 'accent', xMin: 0.02, xMax: 1.85 },
              { fn: (x) => 1 / (x - 2) + 1, tone: 'accent', xMin: 2.15, xMax: 5 },
            ],
            xMin: -2,
            xMax: 5,
            // Pas de graduation en x=-1 : coïncide avec le point "zéro" juste en dessous, qui
            // affiche déjà cette valeur — chevauchement constaté à l'écran (étiquette "zéro" sur
            // la graduation "-1").
            xTicks: [],
            verticalAsymptotes: [{ x: 2, label: 'x = 2 (AV)' }],
            horizontalAsymptotes: [{ y: 1, label: 'y = 1 (AH)' }],
            points: [
              { x: -1, y: 0, label: 'zéro', tone: 'good', labelPos: 'below' },
              { x: 0, y: 1, label: '', tone: 'bad', style: 'open' },
              { x: 0, y: 0.5, label: '', tone: 'bad', style: 'open' },
            ],
            fixedYRange: { min: -3, max: 4 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'domaine : ℝ \\ {0 ; 2} — en x=0, la courbe s\'arrête à gauche en (0 ; 1) et repart à ' +
              'droite de (0 ; 0,5) : deux ronds vides, x=0 est exclu ; asymptote verticale en x=2 ; ' +
              'courbe reconstruite à titre illustratif, forme non tirée d\'une fonction de référence unique',
          },
        },
        {
          kind: 'attention',
          label: 'Trois symboles à distinguer en un point',
          text: 'Sur un graphique, un rond peut dire trois choses très différentes :',
          items: [
            '**Rond vide** (trou) — la valeur est exclue du domaine : f(a) n\'existe pas. Si la ' +
              'courbe arrive des deux côtés, il y a un rond vide au bout de chaque morceau.',
            '**Rond plein** — la valeur appartient au domaine : f(a) existe et se lit à cet endroit. ' +
              'Ce n\'est pas une exclusion !',
            '**Point redéfini** — des ronds vides au bout de la courbe, **plus** un rond plein isolé ' +
              'ailleurs sur la même verticale. La valeur appartient au domaine, mais f(a) n\'est pas ' +
              'là où la courbe semble aller : c\'est le rond plein qui donne f(a).',
          ],
        },
        {
          kind: 'para',
          text:
            'Pour l\'ordonnée à l\'origine, comme pour la valeur en un point précis, deux ' +
            'réponses sont possibles. Soit la valeur demandée **existe** — elle se lit ' +
            'directement sur la courbe. Soit elle **n\'existe pas**, parce que le point tombe ' +
            'justement sur une valeur exclue du domaine.',
        },
        { kind: 'subheading', text: 'Résoudre graphiquement une équation ou une inéquation' },
        {
          kind: 'para',
          text:
            'Pour résoudre $f(x) = k$ sur un graphique, trace la droite horizontale $y = k$. Les ' +
            'solutions sont les **antécédents** de k : les abscisses des points où la droite coupe ' +
            'la courbe. Pour $f(x) > k$, cherche les x où la courbe est **au-dessus** de la droite ' +
            '(en dessous pour $f(x) < k$).',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — résoudre graphiquement f(x) = 2 et f(x) > 2',
          blocks: [
            {
              kind: 'para',
              text:
                'La courbe ci-dessous est celle de $f(x) = (x-1)^2 - 2$, définie sur ℝ (le graphique ' +
                'n\'en montre qu\'une partie).',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (x) => (x - 1) * (x - 1) - 2, tone: 'accent' }],
                shadedRegions: [
                  { from: -1.9, to: -1, upper: (x) => (x - 1) * (x - 1) - 2, lower: () => 2, tone: 'good' },
                  { from: 3, to: 3.9, upper: (x) => (x - 1) * (x - 1) - 2, lower: () => 2, tone: 'good' },
                ],
                testLine: { y: 2, points: [{ x: -1 }, { x: 3 }] },
                xMin: -2,
                xMax: 4,
                xTicks: [-1, 1, 3],
                yTicks: [-2, 2, 4],
                fixedYRange: { min: -3, max: 6 },
                points: [
                  { x: -1, y: 2, label: '(−1 ; 2)', tone: 'bad', labelPos: 'left' },
                  { x: 3, y: 2, label: '(3 ; 2)', tone: 'bad', labelPos: 'right' },
                  { x: 1, y: -2, label: 'min (1 ; −2)', tone: 'good', labelPos: 'below' },
                ],
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'La droite $y=2$ coupe la courbe en $x=-1$ et $x=3$ ; en vert, les zones où la ' +
                  'courbe est au-dessus de la droite ($f(x) > 2$).',
              },
            },
            { kind: 'para', text: '**f(x) = 2** — la droite $y = 2$ coupe la courbe en $x = -1$ et $x = 3$. Donc $S = \\{-1\\,;\\,3\\}$ : 2 a deux antécédents.' },
            { kind: 'para', text: '**f(x) > 2** — la courbe est au-dessus de la droite à gauche de $-1$ et à droite de $3$. Donc $S = \\left]-\\infty\\,;\\,-1\\right[ \\cup \\left]3\\,;\\,+\\infty\\right[$, bornes exclues (inégalité stricte).' },
            { kind: 'para', text: '**Ensemble image** — le point le plus bas est $(1\\,;\\,-2)$, et la courbe monte sans fin des deux côtés : $\\operatorname{im} f = [-2\\,;\\,+\\infty[$.' },
          ],
        },
        {
          kind: 'para',
          text:
            'Les variations lues sur la courbe se résument dans un **tableau de variations** : une ' +
            'ligne pour x (les bornes et les abscisses où le sens change), une ligne pour f (une ' +
            'flèche par intervalle, et la valeur aux changements de sens).',
        },
        {
          kind: 'signTable',
          caption: 'Tableau de variations de f(x) = (x − 1)² − 2, lu sur la courbe (minimum −2 en x = 1)',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '1', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'f',
              cells: [
                { text: '', tone: 'plain' },
                { text: '↘', tone: 'plain' },
                { text: '−2', tone: 'zero' },
                { text: '↗', tone: 'plain' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'para',
          text:
            'Même idée pour **comparer deux fonctions** : $f(x) = g(x)$ aux abscisses des points ' +
            'd\'intersection des deux courbes ; $f(x) > g(x)$ là où la courbe de f est au-dessus ' +
            'de celle de g.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — comparer deux fonctions sur un graphique',
          blocks: [
            {
              kind: 'para',
              text: 'Sur le même graphique : $f(x) = (x-1)^2 - 2$ (orange) et $g(x) = x - 1$ (vert).',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => (x - 1) * (x - 1) - 2, tone: 'accent' },
                  { fn: (x) => x - 1, tone: 'good' },
                ],
                shadedRegions: [
                  { from: -1.6, to: 0, upper: (x) => (x - 1) * (x - 1) - 2, lower: (x) => x - 1, tone: 'accent' },
                  { from: 3, to: 3.9, upper: (x) => (x - 1) * (x - 1) - 2, lower: (x) => x - 1, tone: 'accent' },
                ],
                xMin: -2,
                xMax: 4,
                xTicks: [1, 3],
                yTicks: [-2, 2, 4],
                fixedYRange: { min: -3, max: 6 },
                points: [
                  { x: 0, y: -1, label: '', tone: 'bad' },
                  { x: 3, y: 2, label: '', tone: 'bad' },
                ],
                textLabels: [
                  { x: 0.15, y: -2.6, text: '(0 ; −1)', tone: 'bad', anchor: 'start' },
                  { x: 3.1, y: 0.7, text: '(3 ; 2)', tone: 'bad', anchor: 'start' },
                  { x: -1.35, y: 5.4, text: 'f', tone: 'accent', anchor: 'start' },
                  { x: 3.9, y: 2, text: 'g', tone: 'good', anchor: 'end' },
                ],
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'Les deux courbes se coupent en $x=0$ et $x=3$ ; en orange, les zones où la courbe ' +
                  'de f est au-dessus de celle de g ($f(x) > g(x)$).',
              },
            },
            { kind: 'para', text: '**f(x) = g(x)** — les courbes se coupent en $(0\\,;\\,-1)$ et $(3\\,;\\,2)$. Donc $S = \\{0\\,;\\,3\\}$.' },
            { kind: 'para', text: '**f(x) > g(x)** — la courbe de f est au-dessus de celle de g à gauche de 0 et à droite de 3 : $S = \\left]-\\infty\\,;\\,0\\right[ \\cup \\left]3\\,;\\,+\\infty\\right[$.' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'lire-courbe-widget',
          label: 'Manipule toi-même — lire une courbe : image, antécédents, inéquation, extremums',
          caption:
            'Quatre lectures sur la même courbe. Image : fais glisser la droite x = a et ' +
            'lis f(a) — ou « n\'existe pas » sur une valeur exclue. Antécédents : fais ' +
            'glisser la droite y = k et compte les points d\'intersection. Inéquation : ' +
            'choisis le symbole, l\'ensemble des x solutions se colore sur l\'axe, avec les ' +
            'bons crochets. Extremums : règle la fenêtre [c ; d] et regarde le maximum et ' +
            'le minimum changer — ou ne plus exister.',
        },
        {
          kind: 'application',
          titre: 'Lire un graphique de population ou d\'épidémie',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 20 + 150 * t * Math.exp(-0.2 * t), tone: 'accent' }],
              horizontalAsymptotes: [{ y: 20, label: 'capacité de charge' }],
              xMin: 0,
              xMax: 30,
              xTicks: [5, 10, 20],
              yTicks: [20, 100, 200, 300],
              points: [
                { x: 0, y: 20, label: 'début du suivi', tone: 'accent', labelPos: 'right' },
                { x: 5, y: 295.9, label: 'croissance → déclin', tone: 'good', labelPos: 'above' },
              ],
              xAxisLabel: 'temps (semaines)',
              yAxisLabel: 'population',
              caption:
                'Une épidémie ou une population animale suivie à partir de t=0 (début du ' +
                'domaine) : croissance jusqu\'au pic (t=5), puis déclin qui se rapproche peu à ' +
                'peu de la capacité de charge — exactement l\'asymptote horizontale que tu lis ' +
                'sur un graphique abstrait.',
            },
          ],
          text:
            'Un graphique de biologie ou d\'écologie se lit EXACTEMENT de la même façon ' +
            'qu\'ici — un écologue qui étudie l\'évolution d\'une population animale applique ' +
            'la même méthode étape par étape : le domaine, c\'est la période étudiée (on ne ' +
            'connaît pas la population avant le début du suivi) ; les intervalles de ' +
            'croissance et de décroissance montrent les phases d\'expansion et de déclin ' +
            '(une maladie, une famine, une réintroduction d\'espèce) ; une asymptote ' +
            'horizontale représente souvent la **capacité de charge** du milieu — le nombre ' +
            'maximal d\'individus que l\'environnement peut durablement soutenir, que la ' +
            'population s\'approche sans jamais vraiment dépasser. Les mêmes six questions ' +
            'que tu viens d\'apprendre à poser sur un graphique abstrait sont les questions ' +
            'qu\'un biologiste pose sur de vraies données de terrain.',
          domaines: ['Biologie', 'Écologie'],
        },
        {
          kind: 'entrainement',
          title: 'Caractéristiques d\'une fonction (lecture graphique)',
          generatorId: 'gen12',
          description: [
            'Décris une courbe composite (domaine, zéros, croissance/décroissance/constance, ' +
              'ordonnée à l\'origine, valeur en un point, asymptotes) toujours affichée à ' +
              'l\'écran, sans formule algébrique.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 12. Caractéristiques d\'une fonction (lecture graphique) »',
        },
        {
          kind: 'entrainement',
          title: 'Lire un graphique en contexte',
          generatorId: 'gen70',
          description: ['Population, température, niveau d\'un réservoir : des questions en langage courant à traduire en image, antécédent, inéquation, extremum ou tendance, puis à lire sur la courbe.'],
          chantier: '4e',
          whereLabel: '4e → « 70. Lire un graphique en contexte »',
        },
      ],
    },
    {
      id: 'algebrique',
      number: 2,
      title: 'Étudier algébriquement une fonction de référence',
      kicker: 'f(x) = [famille](ax + b) + k — CE, domaine, isolement, zéros, condition de validité',
      blocks: [
        { kind: 'video', title: 'Étudier algébriquement une fonction de référence', youtubeId: '0CERKsS8qiA' },
        {
          kind: 'para',
          text:
            'Cette fois, pas de graphique du tout. Tu pars directement de l\'écriture ' +
            'algébrique $f(x) = [famille](ax+b) + k$. Il faut poser la condition d\'existence, ' +
            'en déduire le domaine, puis isoler la famille pour trouver les zéros.',
        },
        {
          kind: 'attention',
          label: 'Le sens de l\'inégalité peut s\'inverser',
          text:
            'Pour la racine carrée, isoler $x$ dans $ax+b \\ge 0$ demande de diviser par $a$. ' +
            'Or diviser par un nombre **négatif** inverse le sens de l\'inégalité ! D\'où les ' +
            'deux cas : domaine $[p\\,;\\,+\\infty[$ si $a > 0$, mais $]-\\infty\\,;\\,p]$ si $a < 0$.',
        },
        {
          kind: 'exemple',
          badge: 'inverse',
          formula: '$f(x) = \\dfrac{1}{2x+4} - \\dfrac{1}{3}$',
          steps: [
            { tag: 'CE', text: '$2x+4 \\neq 0 \\iff x \\neq -2$' },
            { tag: 'domaine', text: 'ℝ \\ {−2}' },
            { tag: 'isolement — résoudre f(x) = 0', text: '$\\dfrac{1}{2x+4} = \\dfrac{1}{3}$' },
            { tag: 'se débarrasser du dénominateur (produit en croix)', text: '$2x+4 = 3$' },
          ],
          result: { tag: 'zéro', text: '$x = -1/2$' },
        },
        {
          kind: 'exemple',
          badge: 'racine carrée',
          formula: '$f(x) = \\sqrt{2x-4} - \\dfrac{1}{2}$',
          steps: [
            { tag: 'CE', text: '$2x-4 \\ge 0 \\iff x \\ge 2$ (a = 2 > 0, le sens ne change pas)' },
            { tag: 'domaine', text: '$[2\\,;\\,+\\infty[$' },
            { tag: 'isolement — résoudre f(x) = 0', text: '$\\sqrt{2x-4} = \\dfrac{1}{2}$' },
            { tag: 'se débarrasser de la racine carrée (élever au carré)', text: '$2x-4 = 1/4$' },
          ],
          result: { tag: 'zéro', text: '$x = 17/8$' },
        },
        {
          kind: 'featureTable',
          caption: 'Nombre de solutions de [famille](ax+b) = K, selon le signe de K',
          headers: ['Famille', 'K < 0', 'K = 0', 'K > 0'],
          rows: [
            ['Carrée / Valeur absolue', '0', '1', '2'],
            ['Racine carrée', '0', '1', '1'],
            ['Cube / Racine cubique', '1', '1', '1'],
            ['Inverse', '1', '0 (1/u ne vaut jamais 0)', '1'],
          ],
        },
        {
          kind: 'atelier',
          tag: 'combien-zeros-widget',
          label: 'Manipule toi-même — combien de solutions ?',
          caption:
            'Choisis une famille, règle a et b, puis déplace la droite y = K : le nombre de ' +
            'points d\'intersection — donc de solutions de [famille](ax + b) = K — ne dépend ' +
            'que de la famille et du signe de K. La case correspondante du tableau ' +
            'ci-dessus s\'allume.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — carrée et valeur absolue se séparent en deux équations',
          text:
            'Isoler la carrée ou la valeur absolue mène à une expression du type $P(x)^2 = K$ ' +
            'ou $|P(x)| = K$ (K > 0). Dans les deux cas, il faut séparer en **deux** équations ' +
            'linéaires distinctes — jamais une seule ! Pour le carré : $P(x) = \\sqrt{K}$ et ' +
            '$P(x) = -\\sqrt{K}$. Pour la valeur absolue : $P(x) = K$ et $P(x) = -K$.',
        },
        {
          kind: 'exemple',
          badge: 'valeur absolue — deux équations',
          formula: '$f(x) = |2x-3| - 5$',
          steps: [
            { tag: 'CE', text: 'aucune condition d\'existence : la valeur absolue est définie partout' },
            { tag: 'domaine', text: 'ℝ' },
            { tag: 'isolement — résoudre f(x) = 0', text: '$|2x-3| = 5$' },
            { tag: 'séparer en deux équations', text: '$2x-3 = 5$ ou $2x-3 = -5$' },
          ],
          result: { tag: 'zéros', text: '$x = 4$ et $x = -1$' },
        },
        { kind: 'subheading', text: 'Quand le membre de droite contient x' },
        {
          kind: 'para',
          text:
            'Parfois, la fonction s\'écrit $f(x) = [\\text{famille}](ax+b) + (cx+d)$. Après ' +
            'l\'isolement, le membre de droite n\'est plus un nombre : il contient x. Pour la racine ' +
            'carrée et la valeur absolue, une étape s\'ajoute alors : la **condition de validité**.',
        },
        {
          kind: 'exemple',
          badge: 'niveau 2 — racine, membre de droite en x',
          formula: '$f(x) = \\sqrt{x+2} - x$',
          steps: [
            { tag: 'CE', text: '$x+2 \\ge 0 \\iff x \\ge -2$' },
            { tag: 'domaine', text: '$[-2\\,;\\,+\\infty[$' },
            { tag: 'isolement — résoudre f(x) = 0', text: '$\\sqrt{x+2} = x$' },
            { tag: 'condition de validité — une racine carrée est positive ou nulle', text: 'le membre de droite doit l\'être aussi : $x \\ge 0$' },
            { tag: 'élever au carré et regrouper', text: '$x+2 = x^2 \\iff x^2 - x - 2 = 0$' },
            { tag: 'solutions candidates', text: '$(x-2)(x+1) = 0 \\to x = 2$ ou $x = -1$' },
            { tag: 'validation', text: '$x = 2$ vérifie $x \\ge 0$ : gardée. $x = -1$ ne la vérifie pas : rejetée — même si $-1$ est dans le domaine !' },
          ],
          result: { tag: 'zéro', text: '$x = 2$ (contrôle : $f(2) = \\sqrt{4} - 2 = 0$)' },
        },
        {
          kind: 'attention',
          label: 'Élever au carré peut faire apparaître des solutions étrangères',
          text:
            'Élever au carré n\'est pas une équivalence : $(-1)^2 = 1^2$, et pourtant $-1 \\neq 1$. ' +
            'Une candidate qui ne respecte pas la condition de validité vérifie l\'équation élevée au ' +
            'carré, mais **pas** l\'équation de départ : avec $x = -1$, $\\sqrt{-1+2} = 1$, alors que le ' +
            'membre de droite vaut $-1$. Confronte **toujours** chaque candidate à la condition de ' +
            'validité.',
        },
        {
          kind: 'atelier',
          tag: 'solution-etrangere-widget',
          label: 'Manipule toi-même — pourquoi vérifier après avoir élevé au carré ?',
          caption:
            'À gauche, √(x + 2) et x ne se croisent qu\'une fois. À droite, après élévation ' +
            'au carré, x + 2 et x² se croisent deux fois : le point en rouge est une ' +
            'solution étrangère, née du carré. Change de préréglage ou règle p et q : seule ' +
            'la vérification (ou la condition de validité) permet de l\'écarter.',
        },
        {
          kind: 'exemple',
          badge: 'niveau 2 — valeur absolue, membre de droite en x',
          formula: '$f(x) = |x-3| - 2x$',
          steps: [
            { tag: 'CE', text: 'aucune condition d\'existence' },
            { tag: 'domaine', text: 'ℝ' },
            { tag: 'isolement — résoudre f(x) = 0', text: '$|x-3| = 2x$' },
            { tag: 'condition de validité — deux cas selon le signe de x − 3', text: 'si $x \\ge 3$ : $x-3 = 2x$ ; si $x < 3$ : $x-3 = -2x$' },
            { tag: 'résoudre chaque branche', text: '$x-3 = 2x \\to x = -3$ ; $x-3 = -2x \\to 3x = 3 \\to x = 1$' },
            { tag: 'validation — chaque racine avec la condition de SA branche', text: '$x = -3$ ne vérifie pas $x \\ge 3$ : rejetée. $x = 1$ vérifie $x < 3$ : gardée.' },
          ],
          result: { tag: 'zéro', text: '$x = 1$ (contrôle : $f(1) = |{-2}| - 2 = 0$)' },
        },
        {
          kind: 'historique',
          titre: 'Le père de l\'algèbre écrivait sans le signe =',
          text:
            'Étudier une fonction « algébriquement », comme tu le fais dans cette section, ' +
            'suppose une notation symbolique pour manipuler des inconnues — un outil qu\'on a ' +
            'longtemps dû inventer. Le mathématicien grec **Diophante d\'Alexandrie** (3e ' +
            'siècle apr. J.-C.), dans son traité Arithmetica, est l\'un des premiers à ' +
            'utiliser des abréviations pour une inconnue et ses puissances, au lieu d\'écrire ' +
            'chaque équation en toutes lettres comme ses prédécesseurs. Cette notation ' +
            '« syncopée » — à mi-chemin entre le texte et le symbole — lui vaut le titre de ' +
            '« père de l\'algèbre », même si la notation que tu utilises aujourd\'hui (le ' +
            'signe =, les lettres x, y) viendra bien plus tard, à la Renaissance.',
          image: {
            src: '/images/historique/diophantus-arithmetica.jpg',
            alt: 'Page de titre de l\'édition 1670 de l\'Arithmetica de Diophante',
            caption:
              'Page de titre de l\'édition 1670 de l\'Arithmetica de Diophante — l\'exemplaire ' +
              'où Pierre de Fermat écrira sa célèbre note marginale sur son « dernier théorème ».',
          },
        },
        {
          kind: 'entrainement',
          title: 'Caractéristiques algébriques d\'une fonction de référence',
          generatorId: 'gen13',
          description: [
            'Détermine CE, domaine, isole la famille de référence et trouve les zéros de ' +
              'f(x) = [famille](ax+b) + k, pour les 6 familles.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 13. Caractéristiques algébriques d\'une fonction de référence »',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes modélisés par une fonction de référence',
          generatorId: 'gen68',
          description: ['Temps de parcours, côté d\'un carré, écart à une cible, coût moyen : écris la fonction et son domaine imposé par le contexte, résous la question posée, puis interprète la réponse.'],
          chantier: '4e',
          whereLabel: '4e → « 68. Problèmes modélisés par une fonction de référence »',
        },
      ],
    },
    {
      id: 'transformer',
      number: 3,
      title: 'Transformer une fonction de référence',
      kicker: 'une seule formule pour les 8 transformations, généralisée aux 6 familles',
      blocks: [
        { kind: 'video', title: 'Transformer une fonction de référence (1/2) : la formule unifiée et les 8 paramètres', youtubeId: 'jTuYvEEo8I8' },
        { kind: 'video', title: 'Transformer une fonction de référence (2/2) : exemples, pièges et forme canonique', youtubeId: 'OuKRjDttAXs' },
        {
          kind: 'para',
          text:
            'Comme au chapitre 1 pour la parabole, tu peux translater, étirer, comprimer et ' +
            'réfléchir n\'importe laquelle des 6 fonctions de référence. Cette fois, il y a deux ' +
            'transformations en plus (horizontales). Pour une parabole seule, elles n\'avaient ' +
            'pas besoin d\'être distinguées.',
        },
        {
          kind: 'rappel',
          label: 'Formule unifiée',
          items: [
            '$f(x) = SOX \\cdot \\dfrac{EV}{CV} \\cdot g\\left(SOY \\cdot \\dfrac{CH}{EH} \\cdot (x-TH)\\right) + TV$, ' +
              'où $g$ est l\'une des 6 fonctions de référence.',
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les 8 paramètres',
          headers: ['Sigle', 'Nom', 'Effet'],
          rows: [
            ['TH', 'translation horizontale', 'toujours soustrait — x − TH'],
            ['TV', 'translation verticale', 'toujours ajouté — + TV'],
            ['CH / EH', 'compression / étirement horizontal', 'agit à l\'intérieur de g, avant même la symétrie SOY'],
            ['EV / CV', 'étirement / compression vertical', 'agit sur le résultat de g, avant la translation verticale'],
            ['SOX', 'symétrie d\'axe Ox', 'retourne toute la courbe verticalement'],
            ['SOY', 'symétrie d\'axe Oy', 'retourne l\'argument de g avant de l\'évaluer'],
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Une autre notation possible pour ces mêmes transformations',
          headers: ['Si f(x) devient…', '… le graphique subit une'],
          rows: [
            ['f(x + k)', 'translation horizontale (TH = −k)'],
            ['f(x) + k', 'translation verticale (TV = k)'],
            ['f(−x)', 'symétrie d\'axe Oy (SOY)'],
            ['−f(x)', 'symétrie d\'axe Ox (SOX)'],
            ['f(k·x)', 'compression (|k|>1) ou étirement (0<|k|<1) horizontal, facteur 1/k'],
            ['k·f(x)', 'compression (0<|k|<1) ou étirement (|k|>1) vertical, facteur k'],
          ],
        },
        {
          kind: 'attention',
          label: 'Piège — f(2x) comprime la courbe, il ne l\'étire pas',
          text:
            'Multiplier x par 2 **à l\'intérieur**, c\'est parcourir la courbe deux fois plus vite : ' +
            'ce que $g$ faisait en $x = 4$, $g(2x)$ le fait déjà en $x = 2$. La courbe est donc ' +
            '**comprimée** horizontalement, de facteur $\\dfrac{1}{2}$ — l\'inverse de ce qu\'on attend. ' +
            'Exemple : $\\sqrt{x}$ passe par $(4\\,;\\,2)$, et $\\sqrt{2x}$ passe par $(2\\,;\\,2)$ : le ' +
            'point s\'est rapproché de l\'axe Oy. Avec $f(kx)$, le facteur horizontal est toujours ' +
            '$\\dfrac{1}{k}$.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — le point caractéristique ne bouge qu\'avec TH',
          text:
            'Le point caractéristique de la courbe (le sommet pour carrée/valeur absolue, le ' +
            'point d\'inflexion pour cube/racine cubique, l\'intersection des asymptotes pour ' +
            'l\'inverse, l\'origine du domaine pour la racine carrée) se situe **toujours ' +
            'exactement en x = TH** — quels que soient CH, EH et SOY. Seule la translation ' +
            'horizontale déplace ce point. Les étirements et symétries le laissent immobile : ' +
            'ils transforment la courbe autour de lui.',
        },
        {
          kind: 'exemple',
          badge: 'inverse, translations',
          formula: '$f(x) = \\dfrac{1}{x-3} + 2$',
          steps: [{ tag: 'identification', text: 'TH = 3, TV = 2, tous les autres paramètres neutres' }],
          result: { tag: 'asymptotes', text: 'asymptote verticale x = 3 (= TH), asymptote horizontale y = 2 (= TV)' },
        },
        {
          kind: 'attention',
          label: 'Le piège du signe — toujours le même qu\'au chapitre 1',
          text:
            '$f(x) = (x+3)^3$ se lit $g(x-TH)$ avec $x-TH = x+3$, donc $TH = -3$. C\'est une ' +
            'translation de 3 vers la **gauche**, pas vers la droite ! Le signe à l\'intérieur ' +
            'de la parenthèse est toujours opposé au sens du déplacement, quelle que soit la famille.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — SOX et SOY se confondent parfois',
          text:
            'Pour une fonction **paire** (carrée, valeur absolue) : $g(-u) = g(u)$. SOY seul ne ' +
            'change strictement **rien** à la courbe. Pour une fonction **impaire** (cube, ' +
            'racine cubique, inverse) : $g(-u) = -g(u)$. Activer SOY seul donne alors ' +
            'exactement **la même courbe** qu\'activer SOX seul — les deux symétries deviennent ' +
            'interchangeables. Seule la racine carrée (domaine à sens unique) donne à SOY un ' +
            'rôle réellement indépendant : il détermine de quel côté du point caractéristique le ' +
            'domaine s\'étend.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — lire les 8 paramètres, puis construire la courbe',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $f(x) = -2\\sqrt{-2(x-1)} + 3$. On la compare à la formule unifiée, avec ' +
                '$g(x) = \\sqrt{x}$ :',
            },
            {
              kind: 'featureTable',
              headers: ['Paramètre', 'Valeur', 'Où le lire'],
              rows: [
                ['SOY', 'oui', 'le signe − devant 2, à l\'intérieur de la racine'],
                ['CH / EH', 'CH = 2, EH = 1', 'le facteur 2 qui multiplie (x − 1)'],
                ['TH', '1', 'x − 1 : TH est toujours soustrait'],
                ['SOX', 'oui', 'le signe − devant la racine'],
                ['EV / CV', 'EV = 2, CV = 1', 'le facteur 2 devant la racine'],
                ['TV', '3', 'le + 3 final'],
              ],
            },
            {
              kind: 'para',
              text:
                'Le domaine se lit sous la racine : $-2(x-1) \\ge 0 \\iff x \\le 1$. Le point ' +
                'caractéristique (le début de la demi-courbe) est en $x = TH = 1$, à la hauteur ' +
                '$TV = 3$ : $(1\\,;\\,3)$.',
            },
            {
              kind: 'para',
              text:
                'On construit la courbe dans l\'ordre de l\'exercice : d\'abord CH, EH et SOY (à ' +
                'l\'intérieur), puis TH, puis EV, CV et SOX (à l\'extérieur), et enfin TV. Sur chaque ' +
                'graphique, la courbe de l\'étape précédente est en gris (à l\'étape 1, la courbe de ' +
                'départ $\\sqrt{x}$).',
            },
            {
              kind: 'illustrationGroup',
              items: [
                {
                  kind: 'curvePlot',
                  curves: [{ fn: (x) => Math.sqrt(x), tone: 'faint', xMin: 0, xMax: 2 }, { fn: (x) => Math.sqrt(-2 * x), tone: 'accent', xMin: -4, xMax: 0 }],
                  xMin: -4,
                  xMax: 2,
                  xTicks: [-3, -2, -1, 1],
                  yTicks: [-4, -2, 2],
                  fixedYRange: { min: -6, max: 4 },
                  points: [{ x: 0, y: 0, label: '(0 ; 0)', tone: 'good', labelPos: 'right' }],
                  xAxisLabel: 'x',
                  yAxisLabel: 'y',
                  caption: '1 — CH = 2 et SOY : y = √(−2x)',
                },
                {
                  kind: 'curvePlot',
                  curves: [{ fn: (x) => Math.sqrt(-2 * x), tone: 'faint', xMin: -4, xMax: 0 }, { fn: (x) => Math.sqrt(-2 * (x - 1)), tone: 'accent', xMin: -3, xMax: 1 }],
                  xMin: -4,
                  xMax: 2,
                  xTicks: [-3, -2, -1, 1],
                  yTicks: [-4, -2, 2],
                  fixedYRange: { min: -6, max: 4 },
                  points: [{ x: 1, y: 0, label: '(1 ; 0)', tone: 'good', labelPos: 'right' }],
                  xAxisLabel: 'x',
                  yAxisLabel: 'y',
                  caption: '2 — TH = 1 : y = √(−2(x − 1))',
                },
                {
                  kind: 'curvePlot',
                  curves: [{ fn: (x) => Math.sqrt(-2 * (x - 1)), tone: 'faint', xMin: -3, xMax: 1 }, { fn: (x) => -2 * Math.sqrt(-2 * (x - 1)), tone: 'accent', xMin: -3, xMax: 1 }],
                  xMin: -4,
                  xMax: 2,
                  xTicks: [-3, -2, -1, 1],
                  yTicks: [-4, -2, 2],
                  fixedYRange: { min: -6, max: 4 },
                  points: [{ x: 1, y: 0, label: '(1 ; 0)', tone: 'good', labelPos: 'right' }],
                  xAxisLabel: 'x',
                  yAxisLabel: 'y',
                  caption: '3 — EV = 2 et SOX : y = −2√(−2(x − 1))',
                },
                {
                  kind: 'curvePlot',
                  curves: [{ fn: (x) => -2 * Math.sqrt(-2 * (x - 1)), tone: 'faint', xMin: -3, xMax: 1 }, { fn: (x) => -2 * Math.sqrt(-2 * (x - 1)) + 3, tone: 'accent', xMin: -3, xMax: 1 }],
                  xMin: -4,
                  xMax: 2,
                  xTicks: [-3, -2, -1, 1],
                  yTicks: [-4, -2, 2],
                  fixedYRange: { min: -6, max: 4 },
                  points: [{ x: 1, y: 3, label: '(1 ; 3)', tone: 'good', labelPos: 'right' }],
                  xAxisLabel: 'x',
                  yAxisLabel: 'y',
                  caption: '4 — TV = 3 : y = −2√(−2(x − 1)) + 3',
                },
              ],
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'pas-a-pas-transformations-widget',
          label: 'Manipule toi-même — transformer pas à pas',
          caption:
            'Pars de la fonction de référence et applique les paramètres un par un, dans ' +
            'l\'ordre : CH/EH et SOY, puis TH, puis EV/CV et SOX, puis TV. À chaque étape, ' +
            'la courbe précédente reste en pointillés : observe ce que chaque paramètre ' +
            'change, et suis le point caractéristique C et l\'image A du point (1 ; 1). Le ' +
            'premier préréglage est l\'exemple ci-dessus.',
        },
        {
          kind: 'application',
          titre: 'Décaler un signal physique dans le temps ou en intensité',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (t) => Math.exp(-((t - 5) * (t - 5)) / 2), tone: 'accent' },
                { fn: (t) => Math.exp(-((t - 8) * (t - 8)) / 2), tone: 'good' },
              ],
              xMin: 0,
              xMax: 14,
              xTicks: [5, 8],
              yTicks: [1],
              points: [
                { x: 5, y: 1, label: 'signal direct', tone: 'accent', labelPos: 'above' },
                { x: 8, y: 1, label: 'écho, TH = d = 3', tone: 'good', labelPos: 'above' },
              ],
              xAxisLabel: 't',
              yAxisLabel: 'amplitude',
              caption:
                'Un écho (vert) est exactement le signal direct (orange) translaté horizontalement ' +
                'de d = 3 unités de temps — TH = d, la même translation horizontale que tu viens ' +
                'de voir sur une fonction de référence.',
            },
          ],
          text:
            'En physique et en ingénierie du son, un signal (une onde sonore, un signal ' +
            'électrique, les vibrations d\'un tremblement de terre) se modélise souvent par ' +
            'une fonction du temps. Retarder ce signal d\'un délai $d$ — par exemple un écho ' +
            'qui arrive après le son direct — revient exactement à une translation ' +
            'horizontale TH = $d$ sur son graphique. Amplifier son intensité, c\'est un ' +
            'étirement vertical EV ; l\'inverser en phase (un haut-parleur câblé à l\'envers), ' +
            'c\'est une symétrie SOX. Les ingénieurs du son manipulent ces mêmes 8 paramètres ' +
            'en permanence, sous les noms de « délai », « gain » et « inversion de polarité » ' +
            '— la même formule unifiée que celle de cette section, avec un autre vocabulaire.',
          domaines: ['Physique', 'Ingénierie du son'],
        },
        {
          kind: 'atelier',
          tag: 'transformation-8-parametres-widget',
          label: 'Manipule toi-même — les 8 paramètres en direct',
          caption:
            'En mode Libre, choisis une famille, règle TH/TV/CH·EH/EV·CV et coche SOX/SOY : ' +
            'le point caractéristique (violet) reste toujours en x = TH, et le point A suit ' +
            'l\'image de (1 ; 1). En mode Défi, recouvre la courbe en pointillés verts avec ' +
            'les curseurs : plusieurs réglages peuvent donner la même courbe (pense à la ' +
            'parité).',
        },
        {
          kind: 'entrainement',
          title: 'Transformations graphiques — fonctions de référence',
          generatorId: 'gen10',
          description: [
            'Lis les 8 paramètres (TH, TV, CH, EH, EV, CV, SOX, SOY) directement sur un graphe ' +
              'Mafs interactif, pour chacune des 6 familles de référence.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 10. Transformations graphiques — fonctions de référence »',
        },
        { kind: 'subheading', text: 'De la forme de départ à la forme canonique' },
        {
          kind: 'para',
          text:
            'Une fonction de référence transformée n\'est pas toujours donnée directement sous ' +
            'la forme unifiée. Chaque famille a sa propre « forme de départ » habituelle, à ' +
            'ramener à la forme canonique avant de pouvoir lire les 8 paramètres.',
        },
        {
          kind: 'featureTable',
          caption: 'Forme de départ par famille',
          headers: ['Famille', 'Forme de départ'],
          rows: [
            ['Carrée', 'ax² + bx + c'],
            ['Cube', '(a + bx)³'],
            ['Racine carrée', '√(ax + b)'],
            ['Racine cubique', '∛(ax + b)'],
            ['Inverse', '(ax + b)/(cx + d)'],
            ['Valeur absolue', '|ax + b|'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'inverse — division',
          formula: '$f(x) = \\dfrac{2x+7}{x+3}$',
          steps: [
            { tag: '1 — faire apparaître x+3 au numérateur', text: '$2x+7 = 2(x+3)+1$' },
            { tag: '2 — séparer la fraction en deux', text: '$f(x) = \\dfrac{2(x+3)}{x+3} + \\dfrac{1}{x+3} = 2 + \\dfrac{1}{x+3}$' },
          ],
          result: { tag: 'forme canonique', text: '$f(x) = \\dfrac{1}{x-(-3)} + 2$ — TH = −3, TV = 2' },
        },
        {
          kind: 'exemple',
          badge: 'valeur absolue — facteur commun',
          formula: '$f(x) = |2x+6|$',
          steps: [
            { tag: '1 — mettre 2 en évidence à l\'intérieur', text: '$2x+6 = 2(x+3)$' },
            { tag: '2 — sortir le facteur constant de la valeur absolue', text: '$|2(x+3)| = 2 \\cdot |x+3| = 2|x-(-3)|$' },
          ],
          result: { tag: 'forme canonique', text: '$f(x) = 2|x-(-3)|$ — TH = −3, EV = 2, TV = 0' },
        },
        {
          kind: 'exemple',
          badge: 'racine carrée — coefficient sous la racine',
          formula: '$f(x) = \\sqrt{4x-8}$',
          steps: [
            { tag: '1 — mettre 4 en évidence sous la racine', text: '$4x-8 = 4(x-2)$' },
            { tag: '2 — le coefficient reste sous la racine', text: '$f(x) = \\sqrt{4(x-2)}$' },
          ],
          result: { tag: 'forme canonique', text: '$f(x) = \\sqrt{4(x-2)}$ — CH = 4, TH = 2' },
        },
        {
          kind: 'exemple',
          badge: 'cube — coefficient de x mis en évidence',
          formula: '$f(x) = (2x-6)^3$',
          steps: [
            { tag: '1 — mettre 2 en évidence dans le cube', text: '$2x-6 = 2(x-3)$' },
            { tag: '2 — lire les paramètres', text: '$f(x) = \\left(2(x-3)\\right)^3$ : le facteur 2 multiplie $(x-3)$, à l\'intérieur du cube' },
          ],
          result: { tag: 'forme canonique', text: '$f(x) = \\left(2(x-3)\\right)^3$ — CH = 2, TH = 3' },
        },
        {
          kind: 'astuce',
          label: 'Astuce — une même courbe, deux lectures',
          text:
            'Mathématiquement, $\\sqrt{4(x-2)} = \\sqrt{4} \\cdot \\sqrt{x-2} = 2\\sqrt{x-2}$ : la même ' +
            'courbe se lit comme une compression horizontale (CH = 4) **ou** comme un étirement ' +
            'vertical (EV = 2). De même, $\\left(2(x-3)\\right)^3 = 8(x-3)^3$ : CH = 2 ou EV = 8. Les ' +
            'deux lectures sont justes ! Dans les exercices de ce chapitre, on garde la lecture ' +
            '**horizontale** : le coefficient de x, mis en évidence, se lit comme CH (ou EH).',
        },
        {
          kind: 'application',
          titre: 'Modéliser l\'effet d\'une taxe sur une courbe d\'offre',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (q) => 10 + 0.5 * q, tone: 'accent' },
                { fn: (q) => 15 + 0.5 * q, tone: 'bad' },
              ],
              xMin: 0,
              xMax: 20,
              xTicks: [10],
              yTicks: [10, 15, 20],
              points: [
                { x: 10, y: 15, label: 'avant taxe', tone: 'accent', labelPos: 'left' },
                { x: 10, y: 20, label: 'après taxe, TV = t = 5', tone: 'bad', labelPos: 'right' },
              ],
              xAxisLabel: 'quantité Q',
              yAxisLabel: 'prix (€)',
              caption:
                'La courbe d\'offre $P(Q)=10+0{,}5Q$ se translate verticalement de TV = t = 5 € ' +
                'après la taxe : pour produire la MÊME quantité Q=10, le vendeur doit désormais ' +
                'recevoir 5 € de plus (15 € → 20 €).',
            },
          ],
          text:
            'En économie, une courbe d\'offre donne, pour chaque prix, la quantité qu\'un ' +
            'vendeur est prêt à produire. Quand l\'État impose une taxe fixe $t$ par unité ' +
            'vendue, chaque vendeur doit désormais recevoir $t$ de plus pour accepter de ' +
            'produire la même quantité qu\'avant : la courbe d\'offre entière se déplace ' +
            'verticalement de $t$ — exactement une translation verticale TV = $t$, la même ' +
            'transformation que tu viens d\'apprendre à repérer sur une fonction de ' +
            'référence. Une subvention produit l\'effet inverse (TV négatif) : elle fait ' +
            'glisser la courbe vers le bas, rendant la production plus attractive à chaque ' +
            'niveau de prix.',
          domaines: ['Économie'],
        },
        {
          kind: 'entrainement',
          title: 'Forme canonique et transformations — fonctions de référence',
          generatorId: 'gen11',
          description: [
            'Séquence complète et guidée : reconnaissance de la famille, forme canonique, puis ' +
              'les 4 écrans de transformations (CH/EH/SOY, TH, EV/CV/SOX, TV), avec le tracé ' +
              'cumulatif des courbes déjà confirmées.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 11. Forme canonique et transformations — fonctions de référence »',
        },
        { kind: 'subheading', text: 'Domaine et ensemble image d\'une fonction transformée' },
        {
          kind: 'para',
          text:
            'Une transformation déplace chaque point $(x\\,;\\,y)$ du graphique. Le **domaine** rassemble ' +
            'les abscisses des points, l\'**ensemble image** leurs ordonnées. Une transformation horizontale ' +
            'ne change que les abscisses : elle agit sur le domaine, jamais sur l\'ensemble image. Une ' +
            'transformation verticale fait l\'inverse. On peut donc suivre le domaine et l\'ensemble image ' +
            'séparément, même sans connaître l\'expression de la fonction.',
        },
        {
          kind: 'featureTable',
          caption: 'Effet de chaque transformation sur le domaine et sur l\'ensemble image',
          headers: ['Transformation', 'Effet sur un point', 'Agit sur', 'Effet sur les bornes'],
          rows: [
            ['TH de $a$', '$(x\\,;\\,y) \\mapsto (x+a\\,;\\,y)$', 'le domaine', 'on ajoute $a$ aux deux bornes'],
            ['SOY', '$(x\\,;\\,y) \\mapsto (-x\\,;\\,y)$', 'le domaine', 'les bornes changent de signe et s\'échangent ; chaque crochet suit sa borne'],
            ['EH / CH de facteur $k$', '$(x\\,;\\,y) \\mapsto (kx\\,;\\,y)$ ou $\\left(\\dfrac{x}{k}\\,;\\,y\\right)$', 'le domaine', 'on multiplie / divise les deux bornes par $k$'],
            ['TV de $b$', '$(x\\,;\\,y) \\mapsto (x\\,;\\,y+b)$', 'l\'ensemble image', 'on ajoute $b$ aux deux bornes'],
            ['SOX', '$(x\\,;\\,y) \\mapsto (x\\,;\\,-y)$', 'l\'ensemble image', 'les bornes changent de signe et s\'échangent ; chaque crochet suit sa borne'],
            ['EV / CV de facteur $k$', '$(x\\,;\\,y) \\mapsto (x\\,;\\,ky)$ ou $\\left(x\\,;\\,\\dfrac{y}{k}\\right)$', 'l\'ensemble image', 'on multiplie / divise les deux bornes par $k$'],
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — suivre le domaine et l\'ensemble image',
          blocks: [
            {
              kind: 'para',
              text:
                'On sait seulement que $\\text{dom}\\,f = \\mathopen{]}-5\\,;\\,3]$ et $\\text{im}\\,f = [-2\\,;\\,+\\infty\\mathclose{[}$. Le ' +
                'graphique de $f$ subit une symétrie d\'axe Ox (SOX), puis une translation horizontale TH de ' +
                '$-5$. On note $g$ la fonction obtenue.',
            },
            {
              kind: 'para',
              text:
                '**Domaine.** Seule la TH agit sur les abscisses : on retire 5 aux deux bornes, les crochets ' +
                'ne changent pas. $\\text{dom}\\,g = \\mathopen{]}-10\\,;\\,-2]$.',
            },
            {
              kind: 'para',
              text:
                '**Ensemble image.** Seule la SOX agit sur les ordonnées : la borne $-2$ devient $2$ et passe ' +
                'à droite avec son crochet fermé ; $+\\infty$ devient $-\\infty$ et passe à gauche, toujours avec ' +
                'un crochet ouvert. $\\text{im}\\,g = \\mathopen{]}-\\infty\\,;\\,2]$.',
            },
            {
              kind: 'para',
              text:
                '**Quand l\'ordre compte.** Avec la même fonction $f$, appliquons SOY, TH de 2, EV de facteur 3, ' +
                'TV de $-1$, puis SOX. Domaine : $\\mathopen{]}-5\\,;\\,3] \\to [-3\\,;\\,5\\mathclose{[} \\to [-1\\,;\\,7\\mathclose{[}$. Ensemble image : ' +
                '$[-2\\,;\\,+\\infty\\mathclose{[} \\to [-6\\,;\\,+\\infty\\mathclose{[} \\to [-7\\,;\\,+\\infty\\mathclose{[} \\to \\mathopen{]}-\\infty\\,;\\,7]$. Faire la ' +
                'SOX avant la TV de $-1$ donnerait $\\mathopen{]}-\\infty\\,;\\,5]$ : on applique toujours les transformations ' +
                'dans l\'ordre donné.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège — une symétrie échange aussi les crochets',
          text:
            'Changer les signes ne suffit pas : $[-2\\,;\\,+\\infty\\mathclose{[}$ devient $\\mathopen{]}-\\infty\\,;\\,2]$, et non ' +
            '$[2\\,;\\,-\\infty\\mathclose{[}$. Les deux bornes changent de place, et chaque crochet reste attaché à sa ' +
            'borne. Une borne infinie garde toujours un crochet ouvert.',
        },
        {
          kind: 'entrainement',
          title: 'Choisir le bon modèle',
          generatorId: 'gen69',
          description: ['Une courbe en contexte : reconnais la famille, lis les transformations, écris le modèle, sers-t\'en pour répondre et donne le sens d\'un paramètre.'],
          chantier: '4e',
          whereLabel: '4e → « 69. Choisir le bon modèle »',
        },
        {
          kind: 'entrainement',
          title: 'Le portrait-robot d\'une fonction',
          generatorId: 'gen71',
          description: ['Retrouve une fonction à partir de ses caractéristiques, raisonne sur une fonction sans son expression, ou choisis la seule courbe qui respecte toutes les conditions.'],
          chantier: '4e',
          whereLabel: '4e → « 71. Le portrait-robot d\'une fonction »',
        },
        {
          kind: 'entrainement',
          title: 'Domaine et ensemble image après transformations',
          generatorId: 'gen72',
          description: ['On ne connaît que le domaine et l\'ensemble image de f : suis-les à travers 2 à 5 transformations successives (translations, symétries, étirements et compressions).'],
          chantier: '4e',
          whereLabel: '4e → « 72. Domaine et ensemble image après transformations »',
        },
      ],
    },
    {
      id: 'revision',
      number: 4,
      title: 'Révision — vrai ou faux',
      kicker: '243 affirmations, 7 thèmes, tout le chapitre en révision transversale',
      blocks: [
        { kind: 'video', title: 'Révision vrai ou faux et synthèse du chapitre', youtubeId: '2ox8on-dIaY' },
        {
          kind: 'para',
          text:
            '243 affirmations. 7 thèmes. Ils reprennent tout ce chapitre : vocabulaire et ' +
            'lecture graphique, les 6 fonctions de référence (domaine et allure), fonction ' +
            'carrée et fonction cube, fonction racine carrée et fonction racine cubique, ' +
            'fonction inverse (asymptotes et comportement), fonction valeur absolue, ' +
            'transformations et forme canonique. Un seul essai par question. La justification ' +
            'est toujours révélée.',
        },
        {
          kind: 'astuce',
          text:
            'Le thème « inverse » revient explicitement sur le piège de monotonie signalé au ' +
            'début de ce chapitre : décroissante sur chaque branche séparément, jamais globalement.',
        },
        {
          kind: 'entrainement',
          title: 'Caractéristiques d\'une fonction & fonctions de référence — quiz vrai/faux',
          generatorId: 'gen62',
          description: [
            'Choisis un thème et teste-toi : 243 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 62. Caractéristiques d\'une fonction & fonctions de référence — quiz vrai/faux »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Les 6 familles de référence',
        formulas: [
          { text: '$x^2$ (ℝ, paire) — $x^3$ (ℝ, impaire)' },
          { text: '$\\sqrt{x}$ ($[0\\,;\\,{+\\infty}[$) — $\\sqrt[3]{x}$ (ℝ, impaire)' },
          { text: '$1/x$ (ℝ \\ {0}, impaire) — $|x|$ (ℝ, paire)' },
        ],
      },
      {
        title: 'Parité',
        formulas: [
          { text: 'paire : $f(-a)=f(a)$ — symétrie d\'axe Oy' },
          { text: 'impaire : $f(-a)=-f(a)$ — symétrie centrale (origine)' },
        ],
      },
      {
        title: 'Lecture graphique',
        formulas: [
          { text: 'image de $a$ : $f(a)$, ordonnée du point de la courbe d\'abscisse $a$' },
          { text: 'antécédents de $k$ : abscisses des points de la courbe à la hauteur $k$' },
          { text: '$f(x) > k$ : les $x$ où la courbe est au-dessus de la droite $y = k$' },
          { text: 'ensemble image : projection de la courbe sur l\'axe des $y$' },
        ],
      },
      {
        title: 'Condition d\'existence (CE) par famille',
        formulas: [
          { text: 'racine carrée : $ax+b \\ge 0$', condition: 'sens inversé si $a<0$' },
          { text: 'inverse : $ax+b \\neq 0$' },
          { text: 'carrée, cube, racine cubique, valeur absolue : aucune CE' },
        ],
      },
      {
        title: 'Membre de droite en x : condition de validité',
        formulas: [
          { text: '$\\sqrt{A} = B$ : $B \\ge 0$, puis $A = B^2$', condition: 'confronter chaque candidate à $B \\ge 0$' },
          { text: '$|A| = B$ : $A = B$ si $A \\ge 0$, ou $A = -B$ si $A < 0$', condition: 'chaque racine avec la condition de sa branche' },
        ],
      },
      {
        title: 'Nombre de zéros de [famille](ax+b) = K',
        formulas: [
          { text: 'carrée / valeur absolue : $K<0$ → 0 zéro, $K=0$ → 1 zéro, $K>0$ → 2 zéros' },
          { text: 'racine carrée : $K<0$ → 0 zéro, $K \\geq 0$ → 1 zéro' },
          { text: 'cube / racine cubique : toujours exactement 1 zéro' },
          { text: 'inverse : 1 zéro si $K \\neq 0$, aucun si $K = 0$' },
        ],
      },
      {
        title: 'Formule unifiée des transformations',
        formulas: [
          { text: '$f(x) = SOX \\cdot \\dfrac{EV}{CV} \\cdot g\\left(SOY \\cdot \\dfrac{CH}{EH}\\cdot(x-TH)\\right)+TV$' },
          { text: 'TH toujours soustrait, TV toujours ajouté' },
          { text: 'point caractéristique toujours en $x=TH$' },
          { text: '$g(kx)$ : facteur $\\dfrac{1}{k}$ horizontalement', condition: 'comprime si $k>1$' },
        ],
      },
      {
        title: 'Formes de départ à ramener à la forme canonique',
        formulas: [
          { text: 'carrée : $ax^2+bx+c$' },
          { text: 'cube : $(a+bx)^3$' },
          { text: 'racine carrée / cubique : $\\sqrt{ax+b}$ / $\\sqrt[3]{ax+b}$' },
          { text: 'inverse : $\\dfrac{ax+b}{cx+d}$' },
          { text: 'valeur absolue : $|ax+b|$' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**6 familles** — carrée (x²), cube (x³), racine carrée (√x, domaine [0;+∞[), racine ' +
        'cubique (∛x), inverse (1/x, domaine privé de 0), valeur absolue (|x|).',
      '**Lecture graphique** — toujours dans l\'ordre domaine → ensemble image → zéros → ' +
        'variations → ordonnée à l\'origine → valeur en un point → asymptotes. Distingue bien ' +
        'trou, point plein et point redéfini.',
      '**Image et antécédent** — l\'image de a se lit à la verticale de a ; les antécédents ' +
        'de k à la hauteur k. Résoudre $f(x) = k$ ou $f(x) > k$, c\'est comparer la courbe à la ' +
        'droite $y = k$ (ou à une autre courbe).',
      '**Étude algébrique** — CE selon la famille (aucune, ≠0 pour l\'inverse, ≥0 ou ≤0 selon ' +
        'le signe de a pour la racine carrée), puis isole pour trouver les zéros. Carrée et ' +
        'valeur absolue se séparent toujours en deux équations. Si le membre de droite contient ' +
        'x : condition de validité, puis validation de chaque candidate.',
      '**Formule unifiée** — $f(x) = SOX \\cdot (EV/CV) \\cdot g(SOY \\cdot (CH/EH) \\cdot ' +
        '(x-TH)) + TV$. TH est toujours soustrait, TV toujours ajouté. Le point caractéristique ' +
        'reste toujours en x = TH. $g(kx)$ comprime horizontalement si $k > 1$ (facteur 1/k).',
      '**Parité et redondance** — SOY est invisible pour une famille paire. SOX et SOY sont ' +
        'interchangeables pour une famille impaire. Seule la racine carrée donne à SOY un rôle ' +
        'vraiment indépendant.',
    ],
    checklist: {
      items: [
        'Ai-je bien identifié la famille avant de chercher la forme canonique ?',
        'Ai-je vérifié le signe de a avant de conclure sur le sens de l\'inégalité de la CE (racine carrée) ?',
        'Ai-je séparé en deux équations pour la carrée/valeur absolue, plutôt qu\'une seule ?',
        'Si le membre de droite contient x, ai-je confronté chaque candidate à la condition de validité ?',
        'Ai-je lu le domaine en premier, avant les variations, sur une courbe composite ?',
      ],
    },
    forward:
      'Ces 6 familles reviennent telles quelles dans les chapitres sur les limites et les ' +
      'asymptotes. Savoir reconnaître leur forme canonique d\'un coup d\'œil te fait gagner ' +
      'l\'essentiel du temps de calcul.',
  },
}
