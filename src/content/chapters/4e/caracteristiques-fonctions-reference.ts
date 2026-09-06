import type { ChapterContent } from '../../types'

export const caracteristiquesFonctionsReference: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 3,
  title: 'Caractéristiques d\'une fonction et fonctions de référence',
  slug: 'caracteristiques-fonctions-reference',
  lede:
    'Six courbes reviennent sans cesse : la parabole, la cubique, les deux racines, l\'hyperbole ' +
    'et le « V » de la valeur absolue. Ce chapitre les fixe une bonne fois — leur allure, leurs ' +
    'transformations, comment les lire sur un graphique et les manipuler algébriquement — pour ' +
    'pouvoir ensuite reconnaître n\'importe laquelle d\'entre elles derrière une écriture inhabituelle.',

  intro: {
    title: 'Avant de commencer : les 6 fonctions de référence',
    blocks: [
      {
        kind: 'para',
        text:
          'Une **fonction de référence** est une forme de base, la plus simple de sa famille — ' +
          'toutes les fonctions qu\'on rencontrera dans ce chapitre s\'obtiennent en ' +
          '*transformant* l\'une de ces six-là.',
      },
      {
        kind: 'rappel',
        label: 'Rappel — qu\'est-ce qu\'une fonction ?',
        items: [
          'Une **fonction d\'une variable réelle** est une relation qui à tout réel fait ' +
            'correspondre **au plus un** réel — jamais deux ou plus. C\'est cette condition, et ' +
            'elle seule, qui distingue une fonction d\'une relation quelconque.',
          'La relation « $y = x^2$ » est une fonction : un réel n\'a jamais plus d\'un carré. ' +
            'La relation « $y^2 = x$ » n\'en est **pas** une : pour $x = 4$, aussi bien $y = 2$ ' +
            'que $y = -2$ conviennent — deux réels pour un seul x. Sur un graphique, ce test se ' +
            'voit d\'un coup d\'œil : une droite verticale ne doit jamais couper la courbe ' +
            'd\'une fonction en plus d\'un point.',
        ],
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
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          compact: true,
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
          compact: true,
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
          compact: true,
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
          compact: true,
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
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          compact: true,
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
          compact: true,
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
        kind: 'astuce',
        label: 'Astuce — deux paires de fonctions réciproques',
        text:
          '$x^2$ et $\\sqrt{x}$ sont réciproques l\'une de l\'autre sur ℝ⁺ ; $x^3$ et $\\sqrt[3]{x}$ ' +
          'le sont sur ℝ tout entier. Dans un repère orthonormé, les courbes de deux fonctions ' +
          'réciproques sont toujours symétriques par rapport à la droite d\'équation $y = x$ — un ' +
          'bon moyen de vérifier une courbe de racine carrée ou de racine cubique tracée à la main.',
      },
      {
        kind: 'rappel',
        label: 'Point d\'inflexion — cube et racine cubique',
        items: [
          'Le point où une courbe change de concavité (elle passe de « tournée vers le haut » à ' +
            '« tournée vers le bas », ou l\'inverse) s\'appelle un **point d\'inflexion**. Pour ' +
            '$x^3$ et $\\sqrt[3]{x}$, ce point est toujours l\'origine — tangente verticale pour ' +
            '$\\sqrt[3]{x}$, horizontale pour $x^3$.',
        ],
      },
      {
        kind: 'piege',
        label: 'Piège classique — l\'inverse n\'est pas décroissante « sur ℝ \\ {0} »',
        text:
          '$f(x) = 1/x$ est bien décroissante **sur chaque branche prise séparément** ' +
          '(]−∞ ; 0[ et ]0 ; +∞[), mais **pas** globalement : prends $f(-1) = -1$ et $f(1) = 1$ ' +
          '— bien que $-1 < 1$, on a $f(-1) < f(1)$, ce qui respecterait une croissance, pas une ' +
          'décroissance. La monotonie d\'une fonction ne se prolonge jamais automatiquement à ' +
          'travers une valeur interdite du domaine.',
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
        {
          kind: 'para',
          text:
            'Une courbe composite — assemblée de plusieurs morceaux de familles différentes — se ' +
            'lit toujours dans le même ordre, sans jamais avoir besoin de sa formule algébrique :',
        },
        {
          kind: 'methode',
          label: 'Méthode — l\'ordre de lecture',
          items: [
            '**Domaine** — repérer d\'abord toute valeur exclue (point creux, coupure ' +
              'verticale) avant de décrire le reste.',
            '**Zéros** — les abscisses où la courbe traverse l\'axe des x.',
            '**Variations** — croissante, décroissante ou constante, intervalle par intervalle.',
            '**Ordonnée à l\'origine** — la valeur en x = 0, si elle existe.',
            '**Valeur en un point précis** — lire f(v) pour un v donné.',
            '**Asymptotes** — les droites (verticale et/ou horizontale) que la courbe approche ' +
              'sans jamais les toucher.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Définitions précises — le vocabulaire de chaque question',
          items: [
            '**Zéro** — un réel dont l\'image vaut 0 ; abscisse d\'un point d\'intersection avec l\'axe Ox.',
            '**Ordonnée à l\'origine** — la valeur f(0), si elle existe ; ordonnée du point ' +
              'd\'intersection avec l\'axe Oy.',
            '**Fonction paire** — pour tout réel a du domaine, −a aussi, et f(−a) = f(a) ; le ' +
              'graphique admet Oy comme axe de symétrie.',
            '**Fonction impaire** — pour tout réel a du domaine, −a aussi, et f(−a) = −f(a) ; ' +
              'le graphique admet l\'origine (0 ; 0) comme centre de symétrie.',
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
            'Le maximum ou le minimum d\'une fonction n\'est jamais une propriété absolue : il ' +
            'se définit toujours **par rapport à un intervalle précis**. Une même courbe peut ' +
            'avoir un maximum de 3 sur [−9 ; 2] et, restreinte à [−8 ; 0], un maximum tout ' +
            'différent — parce que le point le plus haut de la première fenêtre peut tomber ' +
            'hors de la seconde.',
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
            xTicks: [-1],
            verticalAsymptotes: [{ x: 2, label: 'x = 2 (AV)' }],
            horizontalAsymptotes: [{ y: 1, label: 'y = 1 (AH)' }],
            points: [
              { x: -1, y: 0, label: 'zéro', tone: 'good', labelPos: 'below' },
              { x: 0, y: 1, label: '', tone: 'bad', style: 'open' },
            ],
            fixedYRange: { min: -3, max: 4 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'domaine : ℝ \\ {0 ; 2} — un point creux exclu en x=0 (rond) et une asymptote ' +
              'verticale en x=2 ; courbe reconstruite à titre illustratif, forme non tirée d\'une ' +
              'fonction de référence unique',
          },
        },
        {
          kind: 'attention',
          label: 'Trois façons différentes d\'être « exclu » en un point',
          text: 'Un même symbole (un cercle) sur un graphique peut signifier trois choses très différentes :',
          items: [
            '**Trou** — cercle vide des deux côtés : la valeur est réellement exclue du domaine.',
            '**Point plein** — cercle plein : la courbe est bien définie et continue en ce ' +
              'point, rien à signaler.',
            '**Point redéfini** — cercles vides de part et d\'autre **plus** un point plein ' +
              'isolé ailleurs sur la même verticale : le point appartient bien au domaine, mais ' +
              'sa valeur ne suit pas la continuité apparente de la courbe.',
          ],
        },
        {
          kind: 'para',
          text:
            'Pour l\'ordonnée à l\'origine comme pour la valeur en un point précis, deux ' +
            'réponses sont possibles : soit la valeur demandée **existe** (elle se lit ' +
            'directement sur la courbe), soit elle **n\'existe pas** — parce que le point tombe ' +
            'justement sur une valeur exclue du domaine.',
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
      ],
    },
    {
      id: 'algebrique',
      number: 2,
      title: 'Étudier algébriquement une fonction de référence',
      kicker: 'f(x) = [famille](ax + b) + k — CE, domaine, isolement, zéros',
      blocks: [
        {
          kind: 'para',
          text:
            'Sans aucun graphique cette fois : à partir de l\'écriture algébrique ' +
            '$f(x) = [famille](ax+b) + k$, il faut poser la condition d\'existence, en déduire ' +
            'le domaine, isoler la famille pour trouver les zéros.',
        },
        {
          kind: 'attention',
          label: 'Le sens de l\'inégalité peut s\'inverser',
          text:
            'Pour la racine carrée, isoler $x$ dans $ax+b \\ge 0$ demande de diviser par $a$ — ' +
            'et diviser par un nombre **négatif** inverse le sens de l\'inégalité. D\'où les ' +
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
          caption: 'Nombre de zéros de [famille](ax+b) = K, selon le signe de K',
          headers: ['Famille', 'K < 0', 'K > 0'],
          rows: [
            ['Carrée / Valeur absolue', '0 zéro', '2 zéros'],
            ['Racine carrée', '0 zéro', '1 zéro'],
            ['Cube / Racine cubique / Inverse', 'toujours exactement 1 zéro', 'toujours exactement 1 zéro'],
          ],
        },
        {
          kind: 'astuce',
          label: 'Astuce — carrée et valeur absolue se séparent en deux équations',
          text:
            'Isoler la carrée ou la valeur absolue mène à une expression du type $P(x)^2 = K$ ' +
            'ou $|P(x)| = K$ (K > 0) : dans les deux cas, il faut séparer en **deux** équations ' +
            'linéaires distinctes — $P(x) = \\sqrt{K}$ et $P(x) = -\\sqrt{K}$ pour le carré, ' +
            '$P(x) = K$ et $P(x) = -K$ pour la valeur absolue — jamais une seule.',
        },
        { kind: 'video', title: 'Caractéristiques algébriques d\'une fonction de référence', youtubeId: 'l4-QfH7ZPXU' },
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
      ],
    },
    {
      id: 'transformer',
      number: 3,
      title: 'Transformer une fonction de référence',
      kicker: 'une seule formule pour les 8 transformations, généralisée aux 6 familles',
      blocks: [
        {
          kind: 'para',
          text:
            'Comme au chapitre 1 pour la parabole, on peut translater, étirer, comprimer et ' +
            'réfléchir n\'importe laquelle des 6 fonctions de référence — avec, cette fois, deux ' +
            'transformations supplémentaires (horizontales) qui n\'avaient pas besoin d\'être ' +
            'distinguées pour une parabole seule.',
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
          kind: 'astuce',
          label: 'Astuce — le point caractéristique ne bouge qu\'avec TH',
          text:
            'Le point caractéristique de la courbe (le sommet pour carrée/valeur absolue, le ' +
            'point d\'inflexion pour cube/racine cubique, l\'intersection des asymptotes pour ' +
            'l\'inverse, l\'origine du domaine pour la racine carrée) se situe **toujours ' +
            'exactement en x = TH** — quels que soient CH, EH et SOY. Seule la translation ' +
            'horizontale déplace ce point ; les étirements et symétries le laissent immobile et ' +
            'transforment la courbe autour de lui.',
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
            '$f(x) = (x+3)^3$ se lit $g(x-TH)$ avec $x-TH = x+3$, donc $TH = -3$ — une ' +
            'translation de 3 vers la **gauche**, pas vers la droite. Le signe à l\'intérieur de ' +
            'la parenthèse est toujours opposé au sens du déplacement, quelle que soit la famille.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — SOX et SOY se confondent parfois',
          text:
            'Pour une fonction **paire** (carrée, valeur absolue), $g(-u) = g(u)$ : SOY seul ne ' +
            'change strictement **rien** à la courbe. Pour une fonction **impaire** (cube, ' +
            'racine cubique, inverse), $g(-u) = -g(u)$ : activer SOY seul produit alors ' +
            'exactement **la même courbe** qu\'activer SOX seul — les deux symétries deviennent ' +
            'interchangeables. Seule la racine carrée (domaine à sens unique) donne à SOY un ' +
            'rôle réellement indépendant : il détermine de quel côté du point caractéristique le ' +
            'domaine s\'étend.',
        },
        { kind: 'video', title: 'Transformations des fonctions de référence', youtubeId: 'ARPAa4MkGgA' },
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
            'la forme unifiée : chaque famille a sa propre « forme de départ » habituelle, à ' +
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
        { kind: 'video', title: 'Forme canonique et transformations — fonctions de référence', youtubeId: 'fQNVVzDKEoU' },
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
            '140 affirmations réparties en 7 thèmes qui reprennent tout ce chapitre — ' +
            'vocabulaire et lecture graphique, les 6 fonctions de référence (domaine et allure), ' +
            'fonction carrée et fonction cube, fonction racine carrée et fonction racine ' +
            'cubique, fonction inverse (asymptotes et comportement), fonction valeur absolue, ' +
            'transformations et forme canonique. Un seul essai par question, la justification ' +
            'est toujours révélée.',
        },
        {
          kind: 'astuce',
          text:
            'Le thème « inverse » revient explicitement sur le piège de monotonie signalé au ' +
            'début de ce chapitre — décroissante sur chaque branche séparément, jamais globalement.',
        },
        {
          kind: 'entrainement',
          title: 'Caractéristiques d\'une fonction & fonctions de référence — quiz vrai/faux',
          generatorId: 'gen62',
          description: [
            'Choisis un thème et teste-toi : 140 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 62. Caractéristiques d\'une fonction & fonctions de référence — quiz vrai/faux »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**6 familles** — carrée (x²), cube (x³), racine carrée (√x, domaine [0;+∞[), racine ' +
        'cubique (∛x), inverse (1/x, domaine privé de 0), valeur absolue (|x|).',
      '**Lecture graphique** — toujours dans l\'ordre domaine → zéros → variations → ordonnée ' +
        'à l\'origine → valeur en un point → asymptotes ; distinguer trou, point plein et point redéfini.',
      '**Étude algébrique** — CE selon la famille (aucune, ≠0 pour l\'inverse, ≥0 ou ≤0 selon ' +
        'le signe de a pour la racine carrée), puis isoler pour trouver les zéros — carrée et ' +
        'valeur absolue se séparent toujours en deux équations.',
      '**Formule unifiée** — $f(x) = SOX \\cdot (EV/CV) \\cdot g(SOY \\cdot (CH/EH) \\cdot ' +
        '(x-TH)) + TV$ ; TH toujours soustrait, TV toujours ajouté ; le point caractéristique ' +
        'reste toujours en x=TH.',
      '**Parité et redondance** — SOY invisible pour une famille paire ; SOX et SOY ' +
        'interchangeables pour une famille impaire ; seule la racine carrée donne à SOY un rôle ' +
        'vraiment indépendant.',
    ],
    checklist: {
      items: [
        'Ai-je bien identifié la famille avant de chercher la forme canonique ?',
        'Ai-je vérifié le signe de a avant de conclure sur le sens de l\'inégalité de la CE (racine carrée) ?',
        'Ai-je séparé en deux équations pour la carrée/valeur absolue, plutôt qu\'une seule ?',
        'Ai-je lu le domaine en premier, avant les variations, sur une courbe composite ?',
      ],
    },
    forward:
      'Ces 6 familles reviennent telles quelles dans les chapitres sur les limites et les ' +
      'asymptotes : savoir reconnaître leur forme canonique d\'un coup d\'œil y fait gagner ' +
      'l\'essentiel du temps de calcul.',
  },
}
