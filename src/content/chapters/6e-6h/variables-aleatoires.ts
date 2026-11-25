import type { ChapterContent } from '../../types'

const poisson = (lambda: number, k: number) => {
  let p = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) p *= lambda / i
  return p
}

/** P(X = k) pour X ∼ 𝓑(n ; p) (figures seulement). */
const binomiale = (n: number, p: number, k: number) => {
  let c = 1
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
  return c * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

/** Densité de la loi normale 𝒩(μ ; σ) (figures seulement). */
const densiteNormale = (mu: number, sigma: number) => (x: number) =>
  Math.exp(-Math.pow((x - mu) / sigma, 2) / 2) / (sigma * Math.sqrt(2 * Math.PI))

/** Espérance de vie restante (ordres de grandeur de la table actuarielle 2020 de la Social Security
 * Administration, hommes et femmes confondus) : interpolation linéaire entre 0, 20, 40, 60 et 80 ans. */
const esperanceVieRestante = (age: number) => {
  const pts: [number, number][] = [
    [0, 78],
    [20, 59],
    [40, 40],
    [60, 23],
    [80, 9],
  ]
  for (let i = 0; i < pts.length - 1; i++) {
    const [a1, e1] = pts[i]
    const [a2, e2] = pts[i + 1]
    if (age <= a2) return e1 + ((e2 - e1) * (age - a1)) / (a2 - a1)
  }
  return 9
}

const groupeBinomial = (ks: number[]) => ks.reduce((s, k) => s + binomiale(200, 0.02, k), 0)

export const variablesAleatoires: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 8,
  title: 'Variables aléatoires et lois de probabilités',
  slug: 'variables-aleatoires',
  lede:
    "Combien un jeu rapporte-t-il en moyenne ? À partir de combien d'essais un événement rare devient-il presque certain ? Dans ce chapitre, tu vas apprendre à **construire** une variable aléatoire, son espérance et sa variance, à utiliser la **loi binomiale**, puis à passer au continu avec la **densité de probabilité**, la **loi uniforme continue** et la **loi normale**, lue dans une table de $\\Phi$. Tu termines par des problèmes qui combinent ces lois (épreuves composées, théorème de Bayes, approximation par une loi normale) et par la **loi de Poisson**, qui compte des événements sur un intervalle de temps ou un effectif.",
  sections: [
    {
      id: 'variablesdiscretes',
      number: 1,
      title: 'Variables aléatoires discrètes et espérance',
      blocks: [
        { kind: 'video', title: 'Variable aléatoire, loi de probabilité et espérance', youtubeId: '7i_g1bBza6g' },
        { kind: 'video', title: 'Variance, écart-type et événements contraires', youtubeId: '3qi0zTgRcdA' },
        { kind: 'video', title: 'Jeux et gains, loi hypergéométrique, loi uniforme discrète', youtubeId: 'y2aS-lt6_PE' },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text:
            "Imagine un traducteur automatique : tu lui donnes le résultat d'une expérience — une face de dé, une couleur tirée, une carte piochée — il te répond toujours par un seul nombre : un gain, une distance, un temps. Une **variable aléatoire**, c'est exactement ce traducteur. Elle ne donne jamais deux réponses différentes pour le même résultat.",
        },
        {
          kind: 'definition',
          label: 'Variable aléatoire discrète et loi de probabilité',
          items: [
            "Une **variable aléatoire discrète** $X$ associe un nombre à chaque issue d'une expérience, parmi un ensemble **fini ou dénombrable** de valeurs (on peut les numéroter : $x_1$, $x_2$, $x_3$, …). Sa **loi de probabilité**, c'est simplement $P(X=x_i)$ pour chaque valeur possible. Une seule règle à respecter : $\\sum P(X=x_i) = 1$ — jamais plus, jamais moins !",
          ],
        },
        { kind: 'subheading', text: 'Fonction de répartition F(x) = P(X ≤ x)' },
        {
          kind: 'definition',
          label: 'Fonction de répartition',
          items: [
            "La **fonction de répartition** $F$ associe à tout réel $x$ la probabilité cumulée $F(x)=P(X\\leq x)$ : la somme des probabilités de toutes les valeurs inférieures ou égales à $x$. Pour une variable discrète, son graphique est **toujours** un escalier — jamais une courbe continue !",
          ],
        },
        {
          kind: 'featureTable',
          headers: ['x', '2', '3', '4', '5', '6'],
          rows: [
            ['P(X = x)', '0,15', '0,25', '0,30', '0,20', '0,10'],
            ['F(x) = P(X ≤ x)', '0,15', '0,40', '0,70', '0,90', '**1,00**'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'stepFunction',
            jumps: [2, 3, 4, 5, 6],
            levels: [0, 0.15, 0.4, 0.7, 0.9, 1.0],
            levelLabels: ['0,15', '0,40', '0,70', '0,90', '1,00'],
            xMin: 1.3,
            xMax: 6.7,
            xAxisLabel: 'x',
            yAxisLabel: 'F(x)',
            pointsAuxSauts: true,
            caption:
              "Graphique en escalier de $F$ : chaque palier est constant entre deux valeurs de $X$, et $F$ ne saute qu'aux valeurs prises par $X$. Le point **plein** en haut de chaque saut donne la valeur de $F$ en $x_i$ (on compte $P(X=x_i)$ dans $P(X\\leq x_i)$) ; le point **vide** en bas marque la valeur juste avant le saut.",
          },
        },
        {
          kind: 'astuce',
          label: 'Chaque marche mesure exactement P(X = x)',
          text: "La hauteur de chaque saut de $F$ en $x=x_i$ vaut exactement $P(X=x_i)$. Exemple : le saut en $x=4$ fait $0{,}70-0{,}40=0{,}30$ — c'est $P(X=4)$. Lire un escalier, c'est donc lire toute la loi de probabilité d'un coup !",
        },
        {
          kind: 'definition',
          label: 'Espérance E(X)',
          items: [
            "L'**espérance** $E(X)$, c'est la valeur moyenne de $X$ — mais une moyenne **pondérée** par les probabilités, jamais une simple moyenne arithmétique des valeurs possibles !",
            '$E(X) = \\displaystyle\\sum_{i=1}^{n} x_i\\times P(X=x_i)$',
          ],
        },
        {
          kind: 'historique',
          titre: 'Le premier livre sur... les jeux de hasard',
          text:
            'En 1657, le savant néerlandais **Christiaan Huygens** publie De ratiociniis in ' +
            'ludo aleae (« Du calcul dans les jeux de hasard »), le tout premier traité ' +
            'imprimé consacré entièrement à ce domaine. Il y définit pour la première fois ' +
            'ce qu\'il appelle la « valeur » d\'un pari — exactement ce que tu appelles ' +
            'aujourd\'hui l\'espérance $E(X)$ : une moyenne pondérée par les probabilités de ' +
            'chaque issue, pas une moyenne simple. Huygens avait découvert le travail de ' +
            '**Blaise Pascal** et **Pierre de Fermat**, échangé trois ans plus tôt sur un ' +
            'problème de jeu de dés, et décide d\'en faire un traité complet et accessible ' +
            '— c\'est par ce livre, plus que par leur correspondance privée, que l\'idée ' +
            'd\'espérance mathématique se répand dans toute l\'Europe savante.',
          image: {
            src: '/images/historique/huygens.jpg',
            alt: 'Portrait de Christiaan Huygens',
            caption: 'Christiaan Huygens (1629–1695), portrait attribué à Caspar Netscher.',
          },
        },
        {
          kind: 'intuition',
          label: 'Ce que représente vraiment E(X)',
          text:
            "Imagine que tu joues au même jeu des centaines de fois de suite. Certaines parties, tu perds ; d'autres, tu gagnes gros. $E(X)$, c'est le gain moyen que tu observerais sur un **très grand nombre de parties** — pas le résultat d'une seule partie, qu'aucune loi ne peut prédire. Un jeu où $E(X)>0$ te fait gagner en moyenne sur le long terme ; un jeu **équitable** a $E(X)=0$.",
        },
        {
          kind: 'definition',
          label: 'Variance V(X) et écart-type σ(X)',
          items: [
            'La **variance** $V(X)$ mesure à quel point $X$ s\'écarte de son espérance — la moyenne, pondérée par les probabilités, des écarts à $E(X)$ mis au carré :',
            '$V(X) = \\displaystyle\\sum_{i=1}^{n} P(X=x_i)\\times[x_i-E(X)]^2$',
            'On la calcule souvent plus vite par la **formule de König** : $V(X) = E(X^2)-[E(X)]^2$, où $E(X^2) = \\displaystyle\\sum_{i=1}^{n} x_i^2\\times P(X=x_i)$.',
            "L'**écart-type** $\\sigma(X) = \\sqrt{V(X)}$ se mesure dans la **même unité** que $X$ — contrairement à $V(X)$, qui porte cette unité au carré, donc pas directement comparable à $X$.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Deux jeux, même espérance, pas le même risque',
          text:
            "Deux jeux peuvent avoir exactement la même espérance — disons 0 €, un jeu équitable — sans être aussi imprévisibles l'un que l'autre. Le premier fait gagner ou perdre 1 € à chaque fois : peu de surprise. Le second fait gagner ou perdre 100 €, à pile ou face : bien plus risqué, même si le gain moyen est identique. C'est exactement ce que mesure $\\sigma(X)$ : plus il est grand, plus les résultats individuels s'éloignent de la moyenne — plus le jeu est imprévisible.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — construire la loi, calculer E(X), V(X) et σ(X)',
          blocks: [
            {
              kind: 'para',
              text: "$X$ prend les valeurs $2$, $3$, $4$, $5$, $6$ avec les probabilités $0{,}15$ ; $0{,}25$ ; $0{,}30$ ; $0{,}20$ ; $0{,}10$. D'abord, un réflexe : $0{,}15+0{,}25+0{,}30+0{,}20+0{,}10=1$ — la loi est bien valide.",
            },
            {
              kind: 'featureTable',
              headers: ['x', 'P(X = x)', 'x × P(X = x)'],
              rows: [
                ['2', '0,15', '0,30'],
                ['3', '0,25', '0,75'],
                ['4', '0,30', '1,20'],
                ['5', '0,20', '1,00'],
                ['6', '0,10', '0,60'],
                ['**Somme**', '**1,00**', '**3,85**'],
              ],
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'categoricalBarChart',
                bars: [
                  { label: '2', value: 0.15, valueLabel: '0,15' },
                  { label: '3', value: 0.25, valueLabel: '0,25' },
                  { label: '4', value: 0.3, valueLabel: '0,30' },
                  { label: '5', value: 0.2, valueLabel: '0,20' },
                  { label: '6', value: 0.1, valueLabel: '0,10' },
                ],
                maxValue: 0.34,
                xAxisLabel: 'x (valeur de X)',
                yAxisLabel: 'P(X = x)',
                footnote: 'E(X) = 3,85 : aucune des 5 valeurs',
                caption:
                  "La loi de probabilité de $X$, en barres — $E(X)=3{,}85$ ne tombe sur aucune des 5 valeurs possibles, ce qui est normal : l'espérance est une moyenne pondérée, pas nécessairement une valeur observable.",
              },
            },
            {
              kind: 'para',
              text: "Fais bien la différence : additionner simplement les 5 valeurs et diviser par 5 donnerait $(2+3+4+5+6)\\div5=4$ — une moyenne qui ignore les probabilités, donc fausse dès que la loi n'est pas uniforme ! La vraie espérance, $3{,}85$, penche vers 3 et 4, qui portent le plus de poids ($0{,}25$ et $0{,}30$).",
            },
            {
              kind: 'para',
              text: "L'écart de chaque valeur à $E(X)=3{,}85$, mis au carré et pondéré par sa probabilité :",
            },
            {
              kind: 'para',
              text: '$V(X) = 0{,}15\\times(2-3{,}85)^2$ $+\\,0{,}25\\times(3-3{,}85)^2$ $+\\,0{,}30\\times(4-3{,}85)^2$ $+\\,0{,}20\\times(5-3{,}85)^2$ $+\\,0{,}10\\times(6-3{,}85)^2$ $= 1{,}4275$',
            },
            {
              kind: 'para',
              text: 'Contrôle par la formule de König : $E(X^2)=0{,}15\\times4+0{,}25\\times9$ $+\\,0{,}30\\times16+0{,}20\\times25$ $+\\,0{,}10\\times36=16{,}25$, donc $V(X)=16{,}25-3{,}85^2$ $=16{,}25-14{,}8225$ $=1{,}4275$ — même résultat.',
            },
            { kind: 'para', text: '$\\sigma(X) = \\sqrt{1{,}4275} \\approx 1{,}195$' },
          ],
        },
        {
          kind: 'attention',
          label: 'Oublier de pondérer par la probabilité',
          text: "Calculer une moyenne simple des 5 écarts au carré, $(3{,}4225+0{,}7225+0{,}0225$ $+\\,1{,}3225+4{,}6225)\\div5$ $=2{,}0225$, oublie que les probabilités ne sont pas égales — exactement le même piège que pour l'espérance ! La variance pondère chaque écart au carré par $P(X=x_i)$ : ça donne $1{,}4275$, jamais une moyenne arithmétique simple.",
        },
        { kind: 'subheading', text: 'Le piège des événements « au moins » / « au plus »' },
        {
          kind: 'para',
          text: "Deux événements sont **contraires** si (1) leur intersection est vide et (2) leur union couvre toutes les valeurs possibles — les deux conditions à la fois. Pour la loi ci-dessus : « $X\\leq3$ » (valeurs 2 et 3 ; $P=0{,}40$) et « $X\\geq4$ » (valeurs 4, 5 et 6 ; $P=0{,}60$) sont bien contraires — aucune valeur commune, et ensemble elles couvrent toutes les valeurs de 2 à 6.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'intervalComparison',
            min: 1.5,
            max: 6.5,
            ticks: [2, 3, 4, 5, 6],
            rows: [
              {
                ranges: [
                  { from: 'min', to: 3, tone: 'accent', label: 'X ≤ 3' },
                  { from: 4, to: 'max', tone: 'good', label: 'X ≥ 4' },
                ],
              },
              {
                ranges: [
                  { from: 'min', to: 4, tone: 'accent', label: 'X ≤ 4' },
                  { from: 4, to: 'max', tone: 'good', label: 'X ≥ 4' },
                ],
                overlapAt: 4,
              },
            ],
            caption:
              "Ligne du haut : « $X\\leq3$ » et « $X\\geq4$ » ne se touchent pas — vraie partition, contraires. Ligne du bas : « $X\\leq4$ » et « $X\\geq4$ » se recouvrent en $X=4$ — ce ne sont **pas** des contraires, malgré l'intuition verbale.",
          },
        },
        {
          kind: 'attention',
          label: 'La valeur frontière est comptée deux fois',
          text: "« $X\\geq4$ » ($P=0{,}60$) et « $X\\leq4$ » ($P=0{,}70$) ne sont **pas** contraires : ils partagent la valeur $X=4$, jamais retirée d'aucun des deux ! Leur somme ($1{,}30$) n'est même pas égale à 1 — la bonne question n'est jamais « la somme fait-elle 1 ? », mais toujours « l'intersection est-elle vide, et l'union complète ? ».",
        },
        {
          kind: 'astuce',
          label: 'Une somme à 1 ne suffit jamais à elle seule',
          text: "Deux événements contraires vérifient toujours $P(A)+P(B)=1$, mais l'inverse est faux : il faut aussi qu'ils ne se chevauchent pas. Le réflexe le plus rapide : repérer le mot-frontière commun (« au moins $k$ » et « au plus $k$ » partagent toujours $X=k$). Le vrai contraire de « au moins $k$ », c'est « au plus $k-1$ » — jamais « au plus $k$ » !",
        },
        { kind: 'subheading', text: 'Jeux et gains — jeu favorable, défavorable ou équitable' },
        {
          kind: 'exempleLibre',
          label: 'Vérifier un jeu — gain net −2 € (0,4) / +3 € (0,35) / +5 € (0,25)',
          blocks: [
            { kind: 'para', text: '$E = -2\\times0{,}4 + 3\\times0{,}35 + 5\\times0{,}25$ $= -0{,}8+1{,}05+1{,}25$ $= 1{,}5$ €' },
            {
              kind: 'para',
              text: "Espérance strictement positive : le jeu est **favorable** au joueur — sur un grand nombre de parties, il gagne en moyenne $1{,}50$ € par partie.",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Imposer une mise — trouver m pour rendre le jeu équitable',
          blocks: [
            {
              kind: 'para',
              text: "Gain brut 10 € (0,2) / 4 € (0,3) / −6 € (0,5) : $E(\\text{gain brut})=10\\times0{,}2+4\\times0{,}3$ $+\\,(-6)\\times0{,}5$ $=2+1{,}2-3=0{,}2$ €. Le gain net vaut désormais $\\text{gain brut}-m$. Comme $\\sum p_i=1$, l'espérance du gain net est simplement $E(\\text{gain brut})-m$ — linéaire en $m$. Pour un jeu équitable ($E=0$) :",
            },
            { kind: 'para', text: '$m = E(\\text{gain brut}) = 0{,}20$ €' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Retrancher une constante ne demande jamais de refaire toute la somme',
          text: "Puisque $E(\\text{gain brut}-m)=E(\\text{gain brut})-m$ (linéarité), calcule $E(\\text{gain brut})$ **une seule fois**, puis résous l'équation du premier degré $E(\\text{gain brut})-m=0$ — inutile de refaire la somme de 3 termes à chaque valeur de $m$ essayée !",
        },
        { kind: 'subheading', text: 'Cas particulier — tirage sans remise (loi hypergéométrique)' },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà',
          text:
            "Au chapitre 7 (§ 5), tu as calculé la probabilité d'obtenir exactement $k$ succès en tirant $n$ éléments **sans remise** dans une population de $N$ éléments dont $K$ sont des succès : $P(X=k)=\\dfrac{C_K^k\\times C_{N-K}^{n-k}}{C_N^n}$. Rien de neuf pour cette formule : ce qui est nouveau ici, c'est de voir $X$ comme une variable aléatoire, d'écrire **toute** sa loi et de calculer son **espérance**.",
        },
        {
          kind: 'para',
          text: "Quand $X$ compte le nombre de succès parmi $n$ tirages sans remise, la loi et l'espérance se calculent comme pour toute variable discrète. Seul $P(X=k)$ change — il vient de la formule hypergéométrique plutôt que d'être donné directement.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — N = 10, K = 4, n = 3',
          blocks: [
            { kind: 'para', text: '$P(X=k) = \\dfrac{C_4^k\\times C_6^{3-k}}{C_{10}^3}$' },
            {
              kind: 'para',
              text: 'Valeurs possibles $k\\in\\{0\\,;1\\,;2\\,;3\\}$ : $P(X=0)=\\dfrac{1}{6}$, $P(X=1)=\\dfrac{1}{2}$, $P(X=2)=\\dfrac{3}{10}$, $P(X=3)=\\dfrac{1}{30}$ (la somme fait bien 1). Espérance :',
            },
            { kind: 'para', text: '$E(X) = 0\\times\\dfrac{1}{6}+1\\times\\dfrac{1}{2}$ $+\\,2\\times\\dfrac{3}{10}+3\\times\\dfrac{1}{30}$ $= 0+0{,}5+0{,}6+0{,}1 = 1{,}2$' },
            {
              kind: 'para',
              text: "Ce résultat coïncide avec le raccourci $E(X)=\\dfrac{nK}{N}=\\dfrac{3\\times4}{10}=1{,}2$ — un raccourci propre à la loi hypergéométrique, jamais valable pour n'importe quelle loi discrète !",
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "Prendre la valeur centrale des valeurs possibles $\\{0\\,;1\\,;2\\,;3\\}$, soit $1{,}5$, à la place de l'espérance est une erreur fréquente. L'espérance n'est **jamais** la simple valeur du milieu — elle doit toujours être pondérée par les vraies probabilités de chaque valeur (ici asymétriques : $P(X=1)=0{,}5$ pèse bien plus que $P(X=3)=\\dfrac{1}{30}$).",
        },
        { kind: 'subheading', text: 'Cas particulier — loi uniforme discrète' },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Une variable aléatoire discrète suit une **loi uniforme** quand ses $n$ valeurs possibles ont toutes la même probabilité $\\dfrac{1}{n}$.',
            'Si ces valeurs sont **les entiers de 1 à** $n$ (un dé, un numéro tiré au sort), et dans ce cas seulement : $E(X) = \\dfrac{n+1}{2}$ et $V(X) = \\dfrac{n^2-1}{12}$.',
            'Plus généralement, pour $n$ valeurs régulièrement espacées $x_1 < x_2 < \\ldots < x_n$, d\'écart $h$ entre deux valeurs voisines : $E(X)=\\dfrac{x_1+x_n}{2}$ et $V(X)=\\dfrac{h^2(n^2-1)}{12}$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — dé équilibré à 6 faces',
          blocks: [
            {
              kind: 'para',
              text: "Les valeurs sont 1, 2, …, 6, chacune de probabilité $\\dfrac{1}{6}$ : $E(X)=\\dfrac{6+1}{2}=3{,}5$ — une valeur qu'aucune face ne porte, exactement comme dans l'exemple précédent où $E(X)=3{,}85$ ne tombait sur aucune valeur de $X$. $V(X)=\\dfrac{6^2-1}{12}=\\dfrac{35}{12}\\approx2{,}917$.",
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Ces 2 formules ne valent que pour les valeurs 1, 2, …, n',
          text: "Les raccourcis $E(X)=\\dfrac{n+1}{2}$ et $V(X)=\\dfrac{n^2-1}{12}$ supposent des probabilités toutes égales à $\\dfrac{1}{n}$ **et** des valeurs $1, 2, \\ldots, n$. Sur les valeurs $2$, $4$, $6$ (équiprobables), $E(X)=4$, alors que la formule donnerait $2$. Pour une loi non uniforme (comme l'exemple hypergéométrique ci-dessus, où $P(X=1)=\\dfrac{1}{2}$ diffère nettement des autres probabilités), reviens toujours à la formule générale pondérée !",
        },
        {
          kind: 'application',
          titre: 'Calculer une espérance de vie à partir d\'une table de mortalité',
          image: {
            src: '/images/application/life-expectancy-chart.png',
            alt: 'Graphique de l\'espérance de vie restante en fonction de l\'âge',
            caption:
              'Espérance de vie restante selon l\'âge (table actuarielle 2020, Social ' +
              'Security Administration américaine). Auteur : RCraig09, CC BY-SA 4.0, via ' +
              'Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'categoricalBarChart',
              bars: [
                { label: '10 ans', value: 0.1, valueLabel: '0,10' },
                { label: '20 ans', value: 0.3, valueLabel: '0,30' },
                { label: '30 ans', value: 0.4, valueLabel: '0,40' },
                { label: '40 ans', value: 0.2, valueLabel: '0,20' },
              ],
              maxValue: 0.46,
              xAxisLabel: 'X = années restantes',
              yAxisLabel: 'P(X = x)',
              footnote: 'E(X) = 10×0,1 + 20×0,3 + 30×0,4 + 40×0,2 = 27',
              caption:
                "Loi de probabilité **simplifiée** (4 valeurs seulement) du nombre d'années " +
                "restantes pour une personne d'un âge donné : exactement la même mécanique que " +
                "$E(X)=\\sum x_i\\times P(X=x_i)$ vue plus haut, qu'une vraie table de mortalité " +
                'applique avec une valeur par année.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: esperanceVieRestante, tone: 'accent' }],
              xMin: 0,
              xMax: 80,
              xTicks: [0, 20, 40, 60, 80],
              yTicks: [20, 40, 60, 80],
              fixedYRange: { min: 0, max: 88 },
              points: [
                { x: 20, y: 59, label: '', tone: 'accent' },
                { x: 60, y: 23, label: '', tone: 'good' },
              ],
              textLabels: [
                { x: 23, y: 68, text: 'E(X) ≈ 59', tone: 'accent' },
                { x: 62, y: 33, text: 'E(X) ≈ 23', tone: 'good' },
              ],
              xAxisLabel: 'âge',
              yAxisLabel: 'E(X)',
              caption:
                "Ordres de grandeur lus sur le graphique ci-dessus : à 20 ans, il reste en moyenne " +
                "environ 59 ans à vivre ; à 60 ans, environ 23. Plus l'âge augmente, plus l'espérance " +
                "de vie restante $E(X)$ diminue — c'est cette valeur, recalculée à chaque âge, qui fait " +
                "monter le prix d'une assurance-vie à mesure qu'on vieillit.",
            },
          ],
          text:
            'Les compagnies d\'assurance-vie utilisent une **table de mortalité** : pour ' +
            'chaque âge, elle donne la probabilité de décéder dans l\'année qui suit. À ' +
            'partir de cette table, l\'espérance de vie restante d\'une personne d\'un âge ' +
            'donné se calcule **exactement** comme dans cette section — une variable aléatoire ' +
            '$X$ (le nombre d\'années restantes), ses probabilités associées, et ' +
            '$E(X) = \\sum x_i \\times P(X=x_i)$. C\'est cette espérance, recalculée pour ' +
            'chaque tranche d\'âge, qui permet à un assureur de fixer le prix d\'une ' +
            'assurance-vie : plus l\'espérance de vie restante est élevée, moins le risque ' +
            'de devoir verser un capital rapidement est grand, et moins la prime annuelle ' +
            'est chère.',
          domaines: ['Actuariat', 'Démographie'],
        },
        {
          kind: 'entrainement',
          title: 'Variables aléatoires discrètes et espérance',
          generatorId: '6gen49',
          description: [
            "Construis une loi de probabilité, calcule son espérance, juge un jeu (favorable, équitable ou défavorable) et reconnais des événements contraires.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 49. Variables aléatoires discrètes et espérance »',
        },
      ],
    },
    {
      id: 'loibinomiale',
      number: 2,
      title: 'Loi binomiale',
      blocks: [
        { kind: 'video', title: 'La loi binomiale', youtubeId: 'v5fGVg2Hco4' },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà',
          text:
            "La loi binomiale n'est pas nouvelle : au chapitre 6 (§ 4), tu as justifié les épreuves répétées en comptant les chemins de l'arbre ; au chapitre 7 (§ 6), tu as écrit $P(X=k)=C_n^k\\times p^k\\times(1-p)^{n-k}$ et choisi entre un terme unique, une somme ou le complément pour « exactement », « au moins » et « au plus ». Ce qui est **nouveau** ici : la loi **complète** de $X$, son **espérance**, sa **variance** et son **écart-type**, et la recherche du nombre d'épreuves $n$.",
        },
        {
          kind: 'definition',
          label: 'Schéma de Bernoulli répété, 4 conditions',
          items: [
            "Une variable $X$ suit une **loi binomiale** $\\mathcal{B}(n\\,;p)$ si l'expérience vérifie exactement ces 4 conditions : (1) un nombre d'épreuves $n$ fixé à l'avance ; (2) des épreuves indépendantes entre elles ; (3) exactement 2 issues à chaque épreuve (succès / échec) ; (4) une probabilité de succès $p$ constante d'une épreuve à l'autre. $X$ compte alors le nombre de succès sur les $n$ épreuves.",
          ],
        },
        {
          kind: 'historique',
          titre: 'Un mathématicien, toute une famille de savants',
          text:
            'Le mathématicien suisse **Jacob Bernoulli** (1655–1705) est le premier à ' +
            'étudier systématiquement ce type d\'épreuve répétée — on parle encore ' +
            'aujourd\'hui d\'« épreuve de Bernoulli » et de « schéma de Bernoulli » en son ' +
            'honneur. Son travail majeur, Ars Conjectandi (« L\'art de conjecturer »), ne ' +
            'paraît qu\'en 1713, huit ans après sa mort, publié par son neveu. Il y ' +
            'démontre aussi la **loi des grands nombres** : plus tu répètes une épreuve de ' +
            'Bernoulli, plus la fréquence observée de succès se rapproche de la ' +
            'probabilité théorique $p$ — un résultat qui justifie, encore aujourd\'hui, ' +
            'pourquoi on peut estimer une probabilité inconnue en comptant des fréquences ' +
            'sur un grand nombre d\'essais. Jacob n\'est que le premier d\'une dynastie : ' +
            'les Bernoulli comptent au moins huit mathématiciens notables sur trois ' +
            'générations, dont son frère Johann et son neveu Daniel.',
          image: {
            src: '/images/historique/bernoulli.jpg',
            alt: 'Portrait de Jacob Bernoulli',
            caption: 'Jacob Bernoulli (1655–1705), portrait d\'époque, Universität Basel.',
          },
        },
        {
          kind: 'definition',
          label: 'Formule, espérance, variance et écart-type',
          items: [
            '$P(X=k) = C_n^k\\times p^k\\times(1-p)^{n-k}$ pour $k=0, 1, \\ldots, n$',
            '$E(X) = n\\times p$, $V(X) = n\\times p\\times(1-p)$ et $\\sigma(X) = \\sqrt{n\\times p\\times(1-p)}$',
            "$p$ (succès) porte l'exposant $k$ ; $(1-p)$ (échec) porte l'exposant $n-k$ — jamais l'inverse ! Le coefficient $C_n^k$ compte les différentes positions possibles des $k$ succès parmi les $n$ épreuves — jamais optionnel dès que $0<k<n$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n = 5, p = 0,4 (loi complète)',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['k', 'C₅ᵏ', 'P(X = k)', 'P(X ≤ k)'],
              rows: [
                ['0', '1', '0,07776', '0,07776'],
                ['1', '5', '0,25920', '0,33696'],
                ['2', '10', '0,34560', '0,68256'],
                ['3', '10', '0,23040', '0,91296'],
                ['4', '5', '0,07680', '0,98976'],
                ['5', '1', '0,01024', '**1,00000**'],
              ],
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'categoricalBarChart',
                bars: [
                  { label: '0', value: 0.07776, valueLabel: '0,078' },
                  { label: '1', value: 0.2592, valueLabel: '0,259' },
                  { label: '2', value: 0.3456, valueLabel: '0,346' },
                  { label: '3', value: 0.2304, valueLabel: '0,230' },
                  { label: '4', value: 0.0768, valueLabel: '0,077' },
                  { label: '5', value: 0.01024, valueLabel: '0,010' },
                ],
                maxValue: 0.38,
                xAxisLabel: 'k (nombre de succès)',
                yAxisLabel: 'P(X = k)',
                footnote: 'E(X) = n × p = 2',
                caption:
                  "Distribution de $\\mathcal{B}(5\\,;0{,}4)$ : le sommet est décalé vers la gauche ($k=2$, car $p<0{,}5$) et la queue s'étire vers la droite ; $E(X)=n\\times p=2$ tombe ici exactement sur une valeur entière.",
              },
            },
            {
              kind: 'para',
              text: "Détail du calcul pour $k=2$ : $P(X=2)=C_5^2\\times0{,}4^2\\times0{,}6^3$ $=10\\times0{,}16\\times0{,}216=0{,}3456$. Oublie $C_5^2=10$ et tu obtiens $0{,}4^2\\times0{,}6^3=0{,}03456$ — dix fois trop petit !",
            },
            { kind: 'para', text: '$V(X) = 5\\times0{,}4\\times0{,}6 = 1{,}2$ et $\\sigma(X) = \\sqrt{1{,}2} \\approx 1{,}095$' },
          ],
        },
        {
          kind: 'methode',
          label: '3 stratégies, choisir la plus courte',
          items: [
            '« Exactement $k$ », « aucun » ou « tous » → un seul terme.',
            '« Au moins $k$ » ou « au plus $k$ » avec peu de termes → somme directe.',
            "« Au moins $k$ » ou « au plus $k$ » avec beaucoup de termes → passe par le complément : $P(X\\geq1)=1-P(X=0)$ $=1-0{,}07776=0{,}92224$ — bien plus rapide qu'une somme de 5 termes !",
          ],
        },
        {
          kind: 'attention',
          label: 'Le mauvais partenaire de complément',
          text: "Le complément de « au moins 1 succès », c'est « aucun succès » ($X=0$), **jamais** « tous des succès » ($X=5$) ! $1-P(X=5)=1-0{,}01024=0{,}98976$ serait une réponse fausse, même si elle a l'air plausible. Identifie toujours le seuil exact avant de choisir le complément : le contraire de « au moins $k$ » est « au plus $k-1$ », le contraire de « au plus $k$ » est « au moins $k+1$ ».",
        },
        { kind: 'subheading', text: 'Trouver n — résolution par logarithme' },
        {
          kind: 'intuition',
          label: 'Pourquoi n finit toujours par suffire',
          text:
            "Même un événement très rare finit presque toujours par arriver, si tu répètes l'épreuve assez de fois. Un gain de loterie a une chance infime à chaque tirage — mais joue des milliers de fois, et la probabilité de gagner au moins une fois grimpe vers 1. C'est exactement ce que calcule cette section : à partir de quel nombre d'épreuves $n$ un événement rare devient-il presque certain ?",
        },
        {
          kind: 'methode',
          label: 'Isoler n dans « au moins 1 succès »',
          items: [
            'Pour trouver le plus petit $n$ tel que $P(\\text{au moins 1 succès})>s$ (le seuil $s$ est donné) :',
            '$1-(1-p)^n>s \\iff (1-p)^n<1-s$ $\\iff n\\ln(1-p)<\\ln(1-s)$ $\\iff n > \\dfrac{\\ln(1-s)}{\\ln(1-p)}$',
          ],
        },
        {
          kind: 'attention',
          label: "Le sens de l'inégalité s'inverse",
          text: "$\\ln(1-p)$ est **toujours négatif** (car $0<1-p<1$) : diviser les deux membres d'une inégalité par un nombre négatif inverse son sens. C'est pour ça que l'inégalité finale utilise $>$ alors que la ligne d'avant utilisait $<$ — oublier cette inversion est **le** piège de ce type d'exercice !",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — p = 0,1, seuil 0,9',
          blocks: [
            { kind: 'para', text: '$n > \\dfrac{\\ln(0{,}1)}{\\ln(0{,}9)} \\approx 21{,}85 \\implies n=22$' },
            {
              kind: 'para',
              text: "Vérifions : $n=21$ ne suffit pas — $0{,}9^{21}\\approx0{,}109>0{,}1$, donc $P(\\text{au moins 1})\\approx0{,}891<0{,}9$. $n=22$ suffit — $0{,}9^{22}\\approx0{,}0985<0{,}1$, donc $P(\\text{au moins 1})\\approx0{,}9015>0{,}9$.",
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                // Abscisse décalée (m = n − 17) : l'axe vertical et ses graduations restent dans le cadre.
                curves: [{ fn: (m: number) => 1 - Math.pow(0.9, m + 17), tone: 'accent', xMin: 0.5, xMax: 7.5 }],
                points: [
                  { x: 1, y: 1 - Math.pow(0.9, 18), label: '', tone: 'bad' },
                  { x: 2, y: 1 - Math.pow(0.9, 19), label: '', tone: 'bad' },
                  { x: 3, y: 1 - Math.pow(0.9, 20), label: '', tone: 'bad' },
                  { x: 4, y: 1 - Math.pow(0.9, 21), label: 'n = 21', tone: 'bad', labelPos: 'below' },
                  { x: 5, y: 1 - Math.pow(0.9, 22), label: 'n = 22', tone: 'good', labelPos: 'above' },
                  { x: 6, y: 1 - Math.pow(0.9, 23), label: '', tone: 'good' },
                  { x: 7, y: 1 - Math.pow(0.9, 24), label: '', tone: 'good' },
                ],
                horizontalAsymptotes: [{ y: 0.9 }],
                xMin: 0,
                xMax: 7.6,
                xTicks: [1, 2, 3, 4, 5, 6, 7],
                xTickLabels: { 1: '18', 2: '19', 3: '20', 4: '21', 5: '22', 6: '23', 7: '24' },
                yTicks: [0.86, 0.88, 0.9, 0.92],
                yTickLabels: { 0.86: '0,86', 0.88: '0,88', 0.9: '0,90', 0.92: '0,92' },
                fixedYRange: { min: 0.84, max: 0.935 },
                xAxisLabel: 'n',
                yAxisLabel: 'P(au moins 1)',
                caption:
                  'Probabilité d\'au moins un succès en fonction de $n$, pour $p=0{,}1$ : les points franchissent le seuil $0{,}9$ (pointillés) entre $n=21$ ($0{,}891$, encore en dessous) et $n=22$ ($0{,}9015$, déjà au-dessus).',
              },
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier n − 1 juste en dessous',
          text: "Le calcul par logarithme donne une valeur décimale (ici $21{,}85$). Le bon réflexe : recalcule $P$ pour $n=22$ (doit dépasser le seuil) et pour $n=21$ (doit encore être en dessous), pour confirmer que 22 est vraiment le plus petit entier qui convient. Ce chapitre demande « **dépasse** le seuil » ($>$) ; au chapitre 6, on cherchait « **au moins** $0{,}95$ » ($\\geq$) : les deux donnent le même $n$, sauf si $\\dfrac{\\ln(1-s)}{\\ln(1-p)}$ tombe pile sur un entier.",
        },
        {
          kind: 'application',
          titre: 'Estimer le nombre de pièces défectueuses dans un lot',
          image: {
            src: '/images/application/quality-control.jpg',
            alt: 'Ouvrier inspectant des pièces manufacturées sur une chaîne de production',
            caption:
              'Inspection de pièces sur une chaîne de production. Photo : Tyne & Wear ' +
              'Archives & Museums, via Wikimedia Commons (aucune restriction de droit connue).',
          },
          illustrations: [
            {
              kind: 'categoricalBarChart',
              bars: [
                { label: '0 ou 1', value: groupeBinomial([0, 1]), valueLabel: '0,089', tone: 'good' },
                { label: '2 ou 3', value: groupeBinomial([2, 3]), valueLabel: '0,342', tone: 'good' },
                { label: '4 ou 5', value: groupeBinomial([4, 5]), valueLabel: '0,355', tone: 'good' },
                { label: '6 ou 7', value: groupeBinomial([6, 7]), valueLabel: '0,164', tone: 'faint' },
                { label: '8 et +', value: 1 - groupeBinomial([0, 1, 2, 3, 4, 5, 6, 7]), valueLabel: '0,049', tone: 'faint' },
              ],
              maxValue: 0.4,
              xAxisLabel: 'k = pièces défectueuses',
              yAxisLabel: 'P(X = k)',
              footnote: 'P(X ≤ 5) ≈ 0,787 : barres vertes',
              caption:
                'La loi binomiale $\\mathcal{B}(200\\,;0{,}02)$, regroupée par paires de valeurs de $k$ : ' +
                'les barres vertes ($k\\leq5$, le seuil de tolérance) cumulent $P(X\\leq5)\\approx0{,}787$, ' +
                'soit environ 78,7 % — la décision « accepter ou rejeter le lot » revient à additionner ' +
                'les barres vertes. La loi de Poisson de paramètre $\\lambda=200\\times0{,}02=4$ (§ 8) ' +
                'donne presque la même valeur, $0{,}785$, avec des calculs bien plus courts.',
            },
          ],
          text:
            'Sur une chaîne de fabrication, chaque pièce produite a une probabilité $p$ ' +
            'constante d\'être défectueuse, indépendamment des autres — exactement les 4 ' +
            'conditions du schéma de Bernoulli. Le nombre de pièces défectueuses $X$ dans ' +
            'un lot de $n$ pièces suit donc une **loi binomiale** $\\mathcal{B}(n\\,;p)$. Un service ' +
            'qualité l\'utilise directement : si $p=0{,}02$ (2 % de défauts) et qu\'un lot ' +
            'compte $n=200$ pièces, $P(X\\leq5)$ donne la probabilité que le lot reste sous ' +
            'un seuil de tolérance accepté par le client — un contrôle qui sert à décider ' +
            'd\'accepter ou de rejeter tout le lot, sans avoir à inspecter chaque pièce une ' +
            'par une.',
          domaines: ['Industrie', 'Contrôle qualité'],
        },
        {
          kind: 'entrainement',
          title: 'Loi binomiale',
          generatorId: '6gen50',
          description: [
            'Reconnais un schéma de Bernoulli, établis la loi binomiale complète, son espérance, sa variance et son écart-type, et résous un « trouver n ».',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 50. Loi binomiale »',
        },
      ],
    },
    {
      id: 'variablecontinue',
      number: 3,
      title: 'Variable aléatoire continue et densité de probabilité',
      blocks: [
        { kind: 'video', title: 'Variable aléatoire continue et densité de probabilité', youtubeId: '8GrFoKV_Y_0' },
        {
          kind: 'para',
          text: "Jusqu'ici, une variable aléatoire prenait des valeurs qu'on pouvait numéroter une à une. Mais si la valeur observée peut être **n'importe quel réel d'un intervalle** — la graduation exacte où s'arrête une aiguille, la masse exacte d'un sachet de sucre — la probabilité qu'elle tombe pile sur une valeur précise est nulle ! Sinon, la somme des probabilités serait infinie, jamais égale à 1. On ne peut donc plus définir une loi valeur par valeur comme pour une variable discrète : on n'attribue une probabilité qu'à des événements définis par un **intervalle**.",
        },
        {
          kind: 'definition',
          label: 'Variable aléatoire continue',
          items: [
            "Une **variable aléatoire continue** peut prendre toutes les valeurs réelles d'un intervalle $I$, ou d'une union d'intervalles.",
          ],
        },
        {
          kind: 'definition',
          label: 'Densité de probabilité',
          items: [
            "La **densité de probabilité** d'une variable aléatoire $X$ (dont les valeurs possibles forment un intervalle $[u\\,;v]$ de $\\mathbb{R}$) est une fonction $f$ définie, continue et positive sur $[u\\,;v]$, telle que :",
            '$\\displaystyle\\int_u^v f(t)\\,dt = 1$ ;',
            'et, pour tout intervalle $[a\\,;b]$ contenu dans $[u\\,;v]$ : $\\displaystyle P(a\\leq X\\leq b) = \\int_a^b f(t)\\,dt$.',
          ],
        },
        {
          kind: 'para',
          text: "La probabilité que $X$ tombe dans un intervalle $[a\\,;b]$, c'est donc l'**aire sous la courbe** de $f$, entre les droites $x=a$ et $x=b$ — jamais la simple valeur $f(t)$ lue en un point !",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t: number) => Math.pow(t - 3, 2) / 36 + 1 / 12, tone: 'accent', xMin: 0, xMax: 6 }],
            shadedRegions: [{ from: 2, to: 4, upper: (t: number) => Math.pow(t - 3, 2) / 36 + 1 / 12, tone: 'accent' }],
            textLabels: [
              { x: 1.1, y: 0.31, text: 'y = f(t)', tone: 'ink', anchor: 'middle' },
              { x: 3, y: 0.04, text: 'P(a ≤ X ≤ b)', tone: 'accent', anchor: 'middle' },
            ],
            xMin: 0,
            xMax: 6,
            xTicks: [0, 2, 4, 6],
            xTickLabels: { 0: 'u', 2: 'a', 4: 'b', 6: 'v' },
            fixedYRange: { min: 0, max: 0.4 },
            xAxisLabel: 't',
            yAxisLabel: 'f(t)',
            caption:
              "Densité de probabilité $f$ sur $[u\\,;v]$ : l'aire totale sous la courbe vaut toujours 1, et l'aire de la zone teintée, entre $a$ et $b$, vaut exactement $P(a\\leq X\\leq b)$.",
          },
        },
        {
          kind: 'definition',
          label: "Fonction de répartition d'une variable aléatoire continue",
          items: [
            "La **fonction de répartition** d'une variable continue $X$ est encore $F(x)=P(X\\leq x)$ — exactement la même définition que dans le cas discret. Mais son graphique change de nature : une courbe continue et croissante, plus du tout un escalier ! Pour $x$ dans $[u\\,;v]$ : $F(x)=\\displaystyle\\int_u^x f(t)\\,dt$ ; $F(x)=0$ avant $u$ et $F(x)=1$ après $v$.",
          ],
        },
        { kind: 'subheading', text: 'Propriétés de la fonction de répartition et de la densité' },
        {
          kind: 'list',
          items: [
            "La fonction de répartition est continue, et dérivable sur $]u\\,;v[$, où sa dérivée est la densité de probabilité : $F'=f$.",
            'La fonction de répartition est croissante ; elle part de 0 et monte jusqu\'à 1.',
            'Quels que soient les réels $a$ et $b$ de $[u\\,;v]$ (avec $a<b$) : $P(X=a)=0$ ;',
            '$P(X<a)=P(X\\leq a)=F(a)$ ;',
            '$P(X>a)=P(X\\geq a)=1-F(a)$ ;',
            '$P(a<X<b)=P(a\\leq X<b)$ $=P(a<X\\leq b)=P(a\\leq X\\leq b)$ $=F(b)-F(a)$.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Strict ou large : aucune différence en continu',
          text: "Puisque $P(X=a)=0$ pour toute valeur isolée, ajouter ou retirer une borne ne change **jamais** la probabilité d'un intervalle : $P(a<X<b)$ et $P(a\\leq X\\leq b)$ valent toujours pareil, $F(b)-F(a)$. C'est l'inverse exact du cas discret, où la valeur frontière $X=k$ pèse un vrai $P(X=k)$ et fait se recouvrir « au moins $k$ » et « au plus $k$ » (§ 1).",
        },
        {
          kind: 'definition',
          label: "Espérance, variance et écart-type d'une variable aléatoire continue",
          items: [
            "L'**espérance mathématique** d'une variable aléatoire continue $X$ (valeurs possibles dans $[u\\,;v]$) se définit par :",
            '$\\displaystyle E(X) = \\int_u^v t\\cdot f(t)\\,dt$',
            "Sa **variance** est $\\displaystyle V(X) = \\int_u^v [t-E(X)]^2\\cdot f(t)\\,dt$ $\\displaystyle = \\int_u^v t^2 f(t)\\,dt-[E(X)]^2$, et son **écart-type** en est la racine carrée : $\\sigma(X)=\\sqrt{V(X)}$.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Le même écart-type qu’en statistique descriptive',
          text:
            "Tu as déjà rencontré la moyenne et l'écart-type d'une série de données, en statistique descriptive. L'idée ne change pas ici : $E(X)$ reste une moyenne, $\\sigma(X)$ reste une mesure de dispersion autour de cette moyenne. Seul l'outil de calcul change — une somme devient une intégrale, parce que $X$ prend maintenant toutes les valeurs d'un intervalle, qu'on ne peut plus énumérer.",
        },
      ],
    },
    {
      id: 'discreteoucontinue',
      number: 4,
      title: 'Variable aléatoire discrète ? Variable aléatoire continue ?',
      blocks: [
        { kind: 'video', title: 'Discrète ou continue ? Loi uniforme continue', youtubeId: 'bmZ2Q-zl-F4' },
        {
          kind: 'para',
          text: 'Les deux familles partagent exactement les mêmes notions — loi, fonction de répartition, espérance, variance, écart-type — mais chacune les porte avec un outil différent : une somme pondérée en discret, une intégrale en continu.',
        },
        {
          kind: 'featureTable',
          headers: ['', 'Variable aléatoire discrète', 'Variable aléatoire continue'],
          rows: [
            ['Valeurs possibles', 'Fini ou dénombrable (on peut les numéroter)', 'Tout un intervalle (on ne peut pas les numéroter)'],
            [
              'Probabilité',
              'La **loi de probabilité** donne la probabilité de chaque valeur de $X$.',
              "La **densité** permet de calculer la probabilité qu'une valeur appartienne à un intervalle ; $P(X=a)=0$.",
            ],
            ['Fonction de répartition', 'Somme de probabilités (escalier)', 'Intégrale de la densité (courbe continue)'],
            ['Espérance mathématique', '$\\displaystyle E(X)=\\sum_{i} p_i\\,x_i$', '$\\displaystyle E(X)=\\int_u^v t\\,f(t)\\,dt$'],
            [
              'Variance',
              '$\\displaystyle V(X)=\\sum_{i} p_i\\,x_i^2-[E(X)]^2$',
              '$\\displaystyle V(X)=\\int_u^v t^2 f(t)\\,dt-[E(X)]^2$',
            ],
            ['Écart-type', '$\\sigma(X)=\\sqrt{V(X)}$', '$\\sigma(X)=\\sqrt{V(X)}$'],
          ],
        },
        {
          kind: 'astuce',
          label: "Passer d'une colonne à l'autre : deux substitutions",
          text: "Chaque formule continue se lit comme sa jumelle discrète, en remplaçant $\\sum$ par $\\int$ et la probabilité ponctuelle $p_i=P(X=x_i)$ par $f(t)\\,dt$. L'espérance reste toujours une moyenne pondérée par le poids de probabilité — jamais une moyenne simple des valeurs possibles ! Seul l'écart-type s'écrit à l'identique dans les 2 colonnes : $\\sigma(X)=\\sqrt{V(X)}$, quelle que soit la nature de la variable.",
        },
      ],
    },
    {
      id: 'loiuniformecontinue',
      number: 5,
      title: 'Loi uniforme continue',
      blocks: [
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            "Pour $X$ uniformément réparti sur $[a\\,;b]$, la densité est constante, égale à $\\dfrac{1}{b-a}$. La probabilité d'un intervalle $[c\\,;d]$ contenu dans $[a\\,;b]$ ne dépend alors que de sa **longueur** — jamais de sa position :",
            '$P(c\\leq X\\leq d) = \\dfrac{d-c}{b-a}$',
            '$E(X) = \\dfrac{a+b}{2}$, $V(X) = \\dfrac{(b-a)^2}{12}$ et $\\sigma(X) = \\dfrac{b-a}{\\sqrt{12}}$',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: () => 1 / 60, tone: 'accent', xMin: 0, xMax: 60 }],
            shadedRegions: [
              { from: 10, to: 25, upper: () => 1 / 60, tone: 'accent' },
              { from: 35, to: 50, upper: () => 1 / 60, tone: 'good' },
            ],
            xMin: 0,
            xMax: 60,
            xTicks: [0, 10, 25, 35, 50, 60],
            fixedYRange: { min: 0, max: 0.02 },
            xAxisLabel: 'x',
            yAxisLabel: 'densité',
            caption:
              '$X$ uniforme sur $[0\\,;60]$ : les 2 zones teintées ($[10\\,;25]$ et $[35\\,;50]$) ont la même longueur (15) et donc la même probabilité ($0{,}25$), bien qu\'elles occupent des positions différentes.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — E(X), V(X) et σ(X) pour X uniforme sur [0 ; 60]',
          blocks: [
            { kind: 'para', text: '$E(X) = \\dfrac{0+60}{2} = 30$, $V(X) = \\dfrac{60^2}{12} = 300$ et $\\sigma(X) = \\sqrt{300} \\approx 17{,}32$' },
            {
              kind: 'para',
              text: '$E(X)=30$ tombe exactement au milieu de $[0\\,;60]$ — normal pour une loi uniforme, toujours symétrique autour du centre de l\'intervalle.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Seule la longueur compte, jamais la position',
          text: '$P(10\\leq X\\leq25)=\\dfrac{15}{60}=0{,}25$ et $P(35\\leq X\\leq50)=\\dfrac{15}{60}=0{,}25$ sont identiques ! Deux intervalles de même longueur, contenus dans $[a\\,;b]$, ont toujours la même probabilité, peu importe où ils se trouvent.',
        },
      ],
    },
    {
      id: 'loinormale',
      number: 6,
      title: 'Loi normale',
      blocks: [
        { kind: 'video', title: 'Loi normale (1/2) : la cloche et la règle empirique', youtubeId: 'oRr2_t58-9A' },
        { kind: 'video', title: 'Loi normale (2/2) : standardiser et lire la table de Φ', youtubeId: 'HRKbrDnIOmA' },
        {
          kind: 'intuition',
          label: 'Pourquoi la courbe a cette forme de cloche',
          text:
            "Pense aux tailles des élèves d'une grande école : peu sont très petits, peu sont très grands, la majorité se regroupe autour d'une taille moyenne. C'est exactement le profil d'une loi normale — une bosse centrée sur $\\mu$, qui s'aplatit progressivement des deux côtés. Plus $\\sigma$ est petit, plus les valeurs sont serrées autour de la moyenne ; plus $\\sigma$ est grand, plus la cloche s'étale.",
        },
        {
          kind: 'definition',
          label: 'Une loi continue, lue par la fonction de répartition Φ',
          items: [
            "Une variable $X$ suit la **loi normale** $\\mathcal{N}(\\mu\\,;\\sigma)$ de moyenne $\\mu$ et d'**écart-type** $\\sigma$ (le second paramètre est bien l'écart-type $\\sigma$, pas la variance $\\sigma^2$ que certains manuels et calculatrices notent à sa place). C'est une variable aléatoire continue, dont la densité dessine la courbe « en cloche » de Gauss. $P(X=x)$ vaut donc toujours 0 pour un réel $x$ précis — seule une probabilité sur un intervalle a un sens.",
            "La **loi normale centrée réduite** est $\\mathcal{N}(0\\,;1)$ ; on note $Z$ une variable qui la suit, $\\varphi$ sa densité (la courbe en cloche centrée en 0) et $\\Phi$ sa fonction de répartition : $\\Phi(z)=P(Z\\leq z)$, l'aire sous la cloche à gauche de $z$.",
          ],
        },
        { kind: 'subheading', text: 'La règle empirique : 68,3 % – 95,4 % – 99,7 %' },
        {
          kind: 'featureTable',
          headers: ['k', 'Intervalle', "Dans l'intervalle", 'Hors (2 côtés)', 'Hors (1 côté)'],
          rows: [
            ['1', '[μ−σ ; μ+σ]', '68,27 %', '31,73 %', '15,87 %'],
            ['2', '[μ−2σ ; μ+2σ]', '95,45 %', '4,55 %', '2,28 %'],
            ['3', '[μ−3σ ; μ+3σ]', '99,73 %', '0,27 %', '0,13 %'],
          ],
        },
        {
          kind: 'para',
          text: 'On retient les arrondis $68{,}3\\,\\%$, $95{,}4\\,\\%$ et $99{,}7\\,\\%$. Pour un seul côté, on divise par 2 le pourcentage **hors** de l\'intervalle — à partir des valeurs précises du tableau, pas d\'un arrondi (la moitié de $0{,}3\\,\\%$ ne donne pas $0{,}13\\,\\%$).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            // Abscisse décalée (u = x − 15) : l'axe vertical et son nom restent dans le cadre.
            curves: [{ fn: (u: number) => densiteNormale(50, 10)(u + 15), tone: 'accent' }],
            shadedRegions: [{ from: 15, to: 55, upper: (u: number) => densiteNormale(50, 10)(u + 15), tone: 'good' }],
            xMin: 0,
            xMax: 70,
            xTicks: [15, 35, 55],
            xTickLabels: { 15: 'μ − 2σ = 30', 35: 'μ = 50', 55: 'μ + 2σ = 70' },
            textLabels: [{ x: 35, y: 0.014, text: '95,4 %', tone: 'good', anchor: 'middle' }],
            fixedYRange: { min: 0, max: 0.046 },
            xAxisLabel: 'x',
            yAxisLabel: 'densité',
            caption:
              '$X\\sim\\mathcal{N}(50\\,;10)$ : environ $95{,}4\\,\\%$ des valeurs se situent dans $[\\mu-2\\sigma\\,;\\mu+2\\sigma]=[30\\,;70]$ (zone teintée) — le reste, environ $4{,}6\\,\\%$, se répartit à égalité entre les 2 queues.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — X ∼ 𝒩(50 ; 10), hors de [30 ; 70]',
          blocks: [
            {
              kind: 'para',
              text: '$50-2\\times10=30$ et $50+2\\times10=70$ : environ $95{,}4\\,\\%$ des valeurs tombent dans $[30\\,;70]$. Donc $1-0{,}954=0{,}046$ (environ $4{,}6\\,\\%$) tombent en dehors, tous côtés confondus.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Diviser par 2 pour un seul côté',
          text: "La probabilité d'être seulement au-dessus de 70 (un seul côté) n'est **jamais** le complément total ($4{,}6\\,\\%$) ! La loi normale étant symétrique, ce complément se partage également entre les deux queues : $0{,}046\\div2=0{,}023$ (environ $2{,}3\\,\\%$) pour un seul côté. Oublier cette division par 2 est l'erreur la plus fréquente de cette règle.",
        },
        {
          kind: 'definition',
          label: 'Standardisation',
          items: [
            "Pour utiliser la table de $\\Phi$ (construite uniquement pour $\\mathcal{N}(0\\,;1)$), toute variable $X\\sim\\mathcal{N}(\\mu\\,;\\sigma)$ doit d'abord être ramenée à une variable centrée réduite :",
            '$Z = \\dfrac{X-\\mu}{\\sigma}$ suit la loi $\\mathcal{N}(0\\,;1)$, et $P(X\\leq x)=\\Phi\\!\\left(\\dfrac{x-\\mu}{\\sigma}\\right)$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: densiteNormale(0, 1), tone: 'accent' }],
            shadedRegions: [{ from: -3.5, to: 1.5, upper: densiteNormale(0, 1), tone: 'accent' }],
            verticalAsymptotes: [{ x: 1.5, label: 'z = 1,5' }],
            xMin: -3.5,
            xMax: 3.5,
            xTicks: [-3, -2, -1, 0, 1, 2, 3],
            textLabels: [{ x: -3.4, y: 0.33, text: 'Φ(1,5) ≈ 0,9332', tone: 'accent', anchor: 'start' }],
            xAxisLabel: 'z',
            yAxisLabel: 'φ(z)',
            caption: 'Courbe de $\\mathcal{N}(0\\,;1)$ : l\'aire teintée à gauche de $z=1{,}5$ vaut $\\Phi(1{,}5)\\approx0{,}9332$ — $\\Phi(z)$ donne toujours l\'aire à **gauche** de $z$, jamais à droite.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — X ∼ 𝒩(50 ; 10) : P(X ≤ 65), P(X ≥ 65), P(X ≤ 35)',
          blocks: [
            {
              kind: 'para',
              text: 'Standardisation : $z=\\dfrac{65-50}{10}=1{,}5$. Lecture dans la table : $\\Phi(1{,}5)\\approx0{,}9332$, donc $P(X\\leq65)\\approx0{,}9332$.',
            },
            { kind: 'para', text: '« Au moins » est le complément de « au plus » : $P(X\\geq65)=1-\\Phi(1{,}5)$ $\\approx1-0{,}9332=0{,}0668$.' },
            {
              kind: 'para',
              text: 'Par symétrie $\\Phi(-z)=1-\\Phi(z)$ : $P(X\\leq35)=\\Phi(-1{,}5)$ $=1-\\Phi(1{,}5)\\approx0{,}0668$ — exactement la même valeur que $P(X\\geq65)$, logique puisque 35 et 65 sont symétriques autour de $\\mu=50$.',
            },
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Extrait de la table de Φ pour quelques valeurs de z usuelles',
          headers: ['z', '1,0', '1,5', '2,0', '2,5', '3,0'],
          rows: [['Φ(z)', '0,8413', '0,9332', '0,9772', '0,9938', '0,9987']],
        },
        {
          kind: 'attention',
          label: "Φ n'est jamais paire",
          text: "$\\Phi(-1{,}5)$ n'est **pas** égal à $\\Phi(1{,}5)$ — $\\Phi$ n'est pas une fonction paire ! La vraie relation, c'est $\\Phi(-z)=1-\\Phi(z)$ (symétrie par rapport au point $(0\\,;0{,}5)$, pas par rapport à l'axe des ordonnées) : $\\Phi(-1{,}5)\\approx0{,}0668$, très différent de $\\Phi(1{,}5)\\approx0{,}9332$.",
        },
        {
          kind: 'para',
          text: "Pour un intervalle de la loi centrée réduite, on soustrait toujours deux valeurs de $\\Phi$ — jamais on ne les additionne (le résultat pourrait même dépasser 1, signal d'alerte immédiat !) :",
        },
        { kind: 'para', text: '$P(1\\leq Z\\leq2) = \\Phi(2)-\\Phi(1)$ $\\approx 0{,}9772-0{,}8413$ $= 0{,}1359$' },
        { kind: 'subheading', text: 'Sens inverse — retrouver z (ou x) depuis une probabilité' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Retrouve $z$ tel que $\\Phi(z)=p$ (lecture de la table « à l\'envers », notée $\\Phi^{-1}$), puis, pour une loi générale $\\mathcal{N}(\\mu\\,;\\sigma)$, reviens à $x$ :',
            '$x = \\mu+z\\times\\sigma$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — z tel que Φ(z) = 0,95',
          blocks: [
            {
              kind: 'para',
              text: "$z\\approx1{,}645$ (le quantile à 95 %, une valeur très utilisée). Attention : $1-0{,}95=0{,}05$ est une **probabilité**, pas une valeur de $z$ — il faut absolument lire la table à l'envers pour convertir une probabilité en valeur de $z$ !",
            },
          ],
        },
        { kind: 'subheading', text: "S'assurer qu'une distribution statistique suit une loi normale" },
        {
          kind: 'methode',
          label: 'Les 2 vérifications à mener sur la série statistique',
          items: [
            'La moyenne, le mode et la médiane de la série statistique ont des valeurs approximativement égales.',
            'Les données se répartissent selon la règle empirique : environ $68{,}3\\,\\%$ dans $[\\mu-\\sigma\\,;\\mu+\\sigma]$, environ $95{,}4\\,\\%$ dans $[\\mu-2\\sigma\\,;\\mu+2\\sigma]$, environ $99{,}7\\,\\%$ dans $[\\mu-3\\sigma\\,;\\mu+3\\sigma]$.',
          ],
        },
        {
          kind: 'attention',
          label: 'Un critère pratique, jamais une démonstration',
          text: "Quand ces deux vérifications sont satisfaites, on **accepte** en pratique le modèle normal, sans l'avoir démontré : d'autres distributions peuvent les satisfaire aussi. Elles ne prouvent donc jamais que la distribution est exactement normale ; en revanche, si l'une d'elles échoue nettement, le modèle normal est à rejeter.",
        },
        {
          kind: 'entrainement',
          title: 'Loi normale',
          generatorId: '6gen51',
          description: [
            'Standardise, lis la table de Φ (directement, par symétrie ou à l\'envers) et retrouve une valeur de x à partir d\'une proportion.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 51. Loi normale »',
        },
      ],
    },
    {
      id: 'extensionsbayes',
      number: 7,
      title: 'Extensions : binomiale, normale et Bayes',
      blocks: [
        { kind: 'video', title: 'Extensions : épreuves composées, Bayes, approximation normale', youtubeId: 'EdM_I4B6wnA' },
        {
          kind: 'para',
          text: 'Cette section combine ce que les sections précédentes ont établi : des **épreuves composées** (« trouver $n$ » avec une probabilité obtenue par un produit), le **théorème de Bayes** à 3 catégories, l\'**approximation** d\'une loi binomiale par une loi normale, et l\'espérance appliquée à une population entière.',
        },
        { kind: 'subheading', text: 'Épreuves composées — indépendance « ET »' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 2 épreuves indépendantes, p₁ = 0,5 et p₂ = 0,3',
          blocks: [
            { kind: 'para', text: 'Réussir les deux épreuves indépendantes (« ET » logique) :' },
            { kind: 'para', text: '$p = p_1\\times p_2 = 0{,}5\\times0{,}3 = 0{,}15$' },
            {
              kind: 'para',
              text: 'Pour trouver le $n$ minimal tel que $P(\\text{au moins 1 succès})>0{,}8$ avec ce $p$ composé : $n>\\dfrac{\\ln(0{,}2)}{\\ln(0{,}85)}\\approx9{,}90$, donc $n=10$ — exactement la même résolution par logarithme qu\'au § 2, appliquée à un $p$ obtenu par multiplication plutôt que donné directement.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'productAreaSquare',
                p1: 0.5,
                p1Label: '0,5',
                p2: 0.3,
                p2Label: '0,3',
                productLabel: 'p = 0,15',
                axisLabel1: 'épreuve 1 (probabilité p₁)',
                axisLabel2: 'épreuve 2 (p₂)',
                caption: "Carré d'aire 1 : le rectangle teinté, de largeur $p_1=0{,}5$ et de hauteur $p_2=0{,}3$, a pour aire le produit $p_1\\times p_2=0{,}15$.",
              },
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "$p_1+p_2=0{,}8$ pour ce même « ET » est faux ! Un « ET » entre événements indépendants se traduit toujours par une **multiplication**, jamais une addition. Une somme dépasserait même chacune des 2 probabilités séparées — ce qui n'a aucun sens pour un « ET » (plus restrictif que chacune des deux conditions prise seule).",
        },
        { kind: 'subheading', text: 'Théorème de Bayes à 3 catégories' },
        {
          kind: 'definition',
          label: 'Probabilités totales et formule de Bayes',
          items: [
            'Une population se partage en 3 catégories $C_1$, $C_2$, $C_3$, de probabilités $P(C_1)$, $P(C_2)$, $P(C_3)$ (somme 1). Un critère $S$ survient avec la probabilité $P(S\\mid C_i)$ dans chaque catégorie — la notation $P(A\\mid B)$ du chapitre 6. **Formule des probabilités totales** (3 termes) :',
            '$P(S) = P(C_1)\\,P(S\\mid C_1)$ $+\\,P(C_2)\\,P(S\\mid C_2)$ $+\\,P(C_3)\\,P(S\\mid C_3)$',
            "Probabilité « inverse » — appartenir à la catégorie $C_j$ sachant que le critère est survenu (**théorème de Bayes**) :",
            '$P(C_j\\mid S) = \\dfrac{P(C_j)\\,P(S\\mid C_j)}{P(S)}$',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'weightedTree',
            firstLevel: [
              { label: 'C₁', prob: '0,30' },
              { label: 'C₂', prob: '0,45' },
              { label: 'C₃', prob: '0,25' },
            ],
            secondLevel: [
              { fromFirst: 0, label: 'S', prob: '0,10', pathProb: '0,030' },
              { fromFirst: 0, label: 'non S', prob: '0,90' },
              { fromFirst: 1, label: 'S', prob: '0,20', pathProb: '0,090' },
              { fromFirst: 1, label: 'non S', prob: '0,80' },
              { fromFirst: 2, label: 'S', prob: '0,40', pathProb: '0,100', highlight: true },
              { fromFirst: 2, label: 'non S', prob: '0,60' },
            ],
            caption:
              'Arbre à 3 catégories (assurance, $S$ = sinistre) : chaque branche $P(C_i)$ se prolonge par $P(S\\mid C_i)$ et par $P(\\bar{S}\\mid C_i)=1-P(S\\mid C_i)$. Les produits $P(C_i)\\,P(S\\mid C_i)$ (à droite) ont pour somme $P(S)=0{,}22$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — assurance, 3 profils de risque',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['Catégorie', 'P(Cᵢ)', 'P(S | Cᵢ)', 'P(Cᵢ) × P(S | Cᵢ)'],
              rows: [
                ['C₁ — faible risque', '0,30', '0,10', '0,030'],
                ['C₂ — risque moyen', '0,45', '0,20', '0,090'],
                ['C₃ — haut risque', '0,25', '0,40', '0,100'],
                ['**Total**', '**1,00**', '', '**0,220**'],
              ],
            },
            { kind: 'para', text: '$P(C_3\\mid S) = \\dfrac{P(C_3)\\,P(S\\mid C_3)}{P(S)}$ $= \\dfrac{0{,}100}{0{,}220} \\approx 0{,}4545$' },
          ],
        },
        {
          kind: 'attention',
          label: 'Confondre a priori et a posteriori',
          text: "Répondre $P(C_3)=0{,}25$ à la question « probabilité d'appartenir à la catégorie 3 sachant le sinistre » ignore complètement l'information du critère observé — tu confonds une probabilité **a priori** ($P(C_3)$, avant observation) avec une probabilité **a posteriori** ($P(C_3\\mid S)\\approx0{,}4545$, après observation).",
        },
        {
          kind: 'astuce',
          label: 'Toujours pondérer par le poids de chaque catégorie',
          text: "Faire la moyenne simple des 3 conditionnelles, $(0{,}1+0{,}2+0{,}4)\\div3\\approx0{,}233$, ignore que les catégories n'ont pas le même poids — exactement le même piège que pour l'espérance au § 1 ! La formule des probabilités totales pondère chaque $P(S\\mid C_i)$ par $P(C_i)$ : ça donne $0{,}22$, pas $0{,}233$.",
        },
        { kind: 'subheading', text: "Approximation d'une loi binomiale par une loi normale" },
        {
          kind: 'methode',
          label: 'Les 2 conditions retenues dans ce cours',
          items: [
            "Quand $n$ est grand et $p$ pas trop proche de 0 ou de 1, la loi binomiale $\\mathcal{B}(n\\,;p)$ s'approche par la loi normale de paramètres $\\mu=n\\times p$ et $\\sigma=\\sqrt{n\\times p\\times(1-p)}$ (la même espérance et le même écart-type).",
            'Conditions retenues dans ce cours : $n>30$ et $0{,}3<p<0{,}7$.',
            "Ce sont des **conventions** : d'autres manuels utilisent par exemple $np\\geq5$ et $n(1-p)\\geq5$. Plus $n$ est grand, meilleure est l'approximation, même pour un $p$ assez éloigné de $0{,}5$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n = 100, p = 0,5',
          blocks: [
            {
              kind: 'para',
              text: '$n=100>30$ ✓ ; $p=0{,}5$, bien dans $]0{,}3\\,;0{,}7[$ ✓ — les 2 conditions sont réunies, donc $\\mu=100\\times0{,}5=50$ et $\\sigma=\\sqrt{100\\times0{,}5\\times0{,}5}=5$.',
            },
            {
              kind: 'para',
              text: 'Pour estimer $P(X\\leq55)$, on remplace la barre de $k=55$ par l\'intervalle $[54{,}5\\,;55{,}5]$ (**correction de continuité**, expliquée juste après) : $z=\\dfrac{55{,}5-50}{5}=1{,}1$, puis lecture de table $\\Phi(1{,}1)\\approx0{,}8643$.',
            },
            {
              kind: 'para',
              text: 'Comparaison : la valeur exacte (somme des 56 termes binomiaux) vaut $0{,}8644$ ; sans correction, $z=\\dfrac{55-50}{5}=1$ donnerait $\\Phi(1)\\approx0{,}8413$, soit 2,3 points d\'écart.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Deux approximations de la binomiale, deux régimes',
          text: "L'approximation par une loi de Poisson (§ 8 : $n\\geq30$, $p\\leq0{,}1$, $np\\leq15$) sert pour un $p$ proche de 0 (événement rare) ; l'approximation par une loi normale ($n>30$, $0{,}3<p<0{,}7$) sert pour un $p$ plus central. Avec les conventions de ce cours, un $p$ intermédiaire comme $p=0{,}2$ ne rentre dans aucune des deux : on calcule alors avec la binomiale exacte (calculatrice). En pratique, pour un très grand $n$ (par exemple $n=1000$, $p=0{,}2$), l'approximation normale reste excellente : les conditions du cours sont prudentes, pas des lois de la nature.",
        },
        { kind: 'subheading', text: "Reconstruire une loi et appliquer l'espérance à une population" },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — offre à 3 formules',
          blocks: [
            {
              kind: 'para',
              text: '$20\\,\\%$ des clients choisissent la formule Basique (15 €), $30\\,\\%$ la Standard (35 €). Le 3ᵉ pourcentage se déduit par différence : $100-20-30=50\\,\\%$ pour la Premium (60 €).',
            },
            {
              kind: 'featureTable',
              headers: ['Formule', 'Prix', '% clients', 'Prix × %'],
              rows: [
                ['Basique', '15 €', '20 %', '3,00 €'],
                ['Standard', '35 €', '30 %', '10,50 €'],
                ['Premium', '60 €', '50 %', '30,00 €'],
                ['**Total**', '', '100 %', '**43,50 €**'],
              ],
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'categoricalBarChart',
                bars: [
                  { label: '15 € Basique', value: 0.2, valueLabel: '0,20' },
                  { label: '35 € Standard', value: 0.3, valueLabel: '0,30' },
                  { label: '60 € Premium', value: 0.5, valueLabel: '0,50' },
                ],
                maxValue: 0.58,
                xAxisLabel: 'formule',
                yAxisLabel: 'part des clients',
                footnote: 'E(X) = 43,50 €',
                caption:
                  'Les 3 formules en barres selon leur part de clients — $E(X)=43{,}50$ € tombe entre Standard et Premium, plus proche de Premium, qui pèse le plus ($50\\,\\%$).',
              },
            },
            {
              kind: 'para',
              text: "Appliquée à une population de 500 clients, la recette totale attendue se calcule en **multipliant** l'espérance par l'effectif — jamais en les additionnant !",
            },
            { kind: 'para', text: '$E(X)\\times500 = 43{,}5\\times500 = 21\\,750$ €' },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "$43{,}5+500=543{,}5$ n'a aucun sens — c'est un prix moyen additionné à un nombre de clients ! Multiplie toujours l'espérance par l'effectif pour obtenir un total attendu sur une population, jamais une addition.",
        },
        {
          kind: 'entrainement',
          title: 'Extensions binomiale, normale et Bayes',
          generatorId: '6gen52',
          description: [
            'Combine des épreuves composées (« trouver n »), le théorème de Bayes à 3 catégories et l\'espérance appliquée à une population.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 52. Extensions binomiale, normale et Bayes »',
        },
      ],
    },
    {
      id: 'loipoisson',
      number: 8,
      title: 'Loi de Poisson',
      blocks: [
        { kind: 'video', title: 'La loi de Poisson', youtubeId: 'E6SK3Awv1fQ' },
        {
          kind: 'definition',
          label: 'Loi de Poisson, paramètre λ',
          items: [
            "La **loi de Poisson** de paramètre $\\lambda>0$ modélise le **nombre d'événements** qui surviennent sur un intervalle de temps (ou un effectif, une surface…) quand ces événements arrivent **indépendamment** les uns des autres, à un **taux moyen constant** — pannes, arrivées à un guichet, appels, défauts. $\\lambda$ est le nombre moyen d'événements sur l'intervalle considéré :",
            '$P(X=k) = e^{-\\lambda}\\times\\dfrac{\\lambda^k}{k!}$ pour tout entier $k\\geq0$',
            'Les événements n\'ont pas besoin d\'être rares : 75 voitures en 15 minutes peuvent suivre une loi de Poisson. La rareté n\'intervient que pour **approcher une loi binomiale** par une loi de Poisson (plus bas).',
          ],
        },
        {
          kind: 'historique',
          titre: 'Une loi pensée pour les erreurs judiciaires',
          text:
            'Le mathématicien français **Siméon Denis Poisson** publie cette loi en 1837, ' +
            'dans ses Recherches sur la probabilité des jugements en matière criminelle et ' +
            'en matière civile — un ouvrage consacré... aux erreurs judiciaires et aux ' +
            'verdicts de jurys ! L\'approximation elle-même apparaissait déjà chez **Abraham de ' +
            'Moivre**, en 1711. Le résultat reste longtemps une curiosité théorique, jusqu\'à ' +
            'ce que l\'économiste et statisticien **Ladislaus Bortkiewicz**, professeur à ' +
            'Berlin, l\'applique en 1898 aux registres de l\'armée prussienne : le nombre de ' +
            'soldats tués chaque année par la ruade d\'un cheval, dans 14 corps d\'armée, sur ' +
            '20 ans — une distribution qui suit avec une précision frappante la loi de ' +
            'Poisson. Son livre, Das Gesetz der kleinen Zahlen (« La loi des petits ' +
            'nombres »), donne au phénomène le nom sous lequel on le connaît encore.',
          image: {
            src: '/images/historique/poisson.jpg',
            alt: 'Portrait de Siméon Denis Poisson',
            caption: 'Siméon Denis Poisson (1781–1840), portrait d\'époque.',
          },
        },
        {
          kind: 'methode',
          label: 'Calcul de proche en proche : chaque terme à partir du précédent',
          items: [
            "Pour un $\\lambda$ élevé, $\\lambda^k$ et $k!$ deviennent vite énormes (au point de dépasser les capacités d'une calculatrice), alors que leur rapport, lui, reste raisonnable.",
            'La méthode stable part de $P(X=0)=e^{-\\lambda}$, puis construit chaque terme à partir du précédent : $P(X=k) = P(X=k-1) \\times \\dfrac{\\lambda}{k}$.',
          ],
        },
        {
          kind: 'para',
          text: "Construction de proche en proche de $P(X=k)$ pour $\\lambda=4$ : $P(X=0)=e^{-4}\\approx0{,}0183$, puis chaque terme suivant s'obtient en multipliant le précédent par $\\dfrac{\\lambda}{k}$ :",
        },
        {
          kind: 'operationChain',
          nodes: ['$0{,}0183$', '$0{,}0733$', '$0{,}1465$', '$0{,}1954$', '$0{,}1954$'],
          operations: ['× 4/1', '× 4/2', '× 4/3', '× 4/4'],
        },
        { kind: 'subheading', text: "Approximation d'une loi binomiale par une loi de Poisson" },
        {
          kind: 'methode',
          label: '3 conditions retenues dans ce cours',
          items: [
            "Quand $n$ est grand et $p$ petit, la loi binomiale $\\mathcal{B}(n\\,;p)$ s'approche par la loi de Poisson de paramètre $\\lambda=n\\times p$ (la même espérance), à condition que :",
            '$n\\geq30$ ; $p\\leq0{,}1$ ; $n\\times p\\leq15$.',
            "Les 3 conditions doivent **toutes** être vérifiées — un $n\\times p$ faible avec un $n$ trop petit ne suffit pas ! Comme pour l'approximation normale (où ce cours écrit $n>30$), ce sont des conventions de cours.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n = 50, p = 0,08',
          blocks: [
            {
              kind: 'para',
              text: '$n=50\\geq30$ ✓ ; $p=0{,}08\\leq0{,}1$ ✓ ; $n\\times p=4\\leq15$ ✓ — les 3 conditions sont réunies, donc $\\lambda=n\\times p=4$.',
            },
          ],
        },
        {
          kind: 'featureTable',
          headers: ['k', 'Facteur λ/k', 'P(X = k)', 'P(X ≤ k)'],
          rows: [
            ['0', '—', '0,018316', '0,018316'],
            ['1', '$\\dfrac{4}{1}$', '0,073263', '0,091578'],
            ['2', '$\\dfrac{4}{2}$', '0,146525', '0,238103'],
            ['3', '$\\dfrac{4}{3}$', '0,195367', '0,433470'],
            ['4', '$\\dfrac{4}{4}$', '0,195367', '0,628837'],
          ],
        },
        {
          kind: 'para',
          text: 'Les cumuls sont calculés à partir des valeurs **non arrondies** : additionner les arrondis à 6 décimales décalerait le dernier chiffre.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: Array.from({ length: 10 }, (_, k) => ({
              label: String(k),
              value: poisson(4, k),
              valueLabel: poisson(4, k).toFixed(2).replace('.', ','),
              ...(k <= 1 ? { tone: 'good' as const } : {}),
            })),
            maxValue: 0.22,
            xAxisLabel: "k (nombre d'événements)",
            yAxisLabel: 'P(X = k)',
            footnote: 'P(X ≤ 1) ≈ 0,0916',
            caption:
              'Distribution de Poisson pour $\\lambda=4$ (valeurs arrondies au centième) : les 2 barres vertes ($k=0$ et $k=1$) forment $P(X\\leq1)\\approx0{,}0916$ — le reste, $P(X\\geq2)\\approx0{,}9084$, s\'obtient par complément. Le maximum est atteint deux fois, en $k=3$ et $k=4$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — complément',
          blocks: [
            {
              kind: 'para',
              text: '$P(X\\leq1)=P(X=0)+P(X=1)$ $\\approx0{,}018316+0{,}073263$ $\\approx0{,}091578$. « Au moins 2 » est le complément exact de « au plus 1 » :',
            },
            { kind: 'para', text: '$P(X\\geq2) = 1-P(X\\leq1)$ $\\approx 1-0{,}091578 = 0{,}908422$' },
          ],
        },
        {
          kind: 'attention',
          label: '« Au plus k » se calcule par une somme directe',
          text: "Contrairement à la loi binomiale (valeurs bornées par $n$), la loi de Poisson n'a pas de valeur maximale — il n'existe aucune borne « $n$ » à côté de laquelle un complément court serait naturel. « Au plus $k$ » se calcule donc toujours par une somme directe de 0 à $k$ ; c'est « au moins $k$ » qui passe par le complément : $P(X\\geq k)=1-P(X\\leq k-1)$.",
        },
        { kind: 'subheading', text: "Piège d'échelle — ajuster λ avant de calculer" },
        {
          kind: 'attention',
          label: "λ n'est jamais le taux de base recopié tel quel",
          text: "$\\lambda$ doit toujours être ajusté à l'échelle exacte de la question posée : multiplicatif pour un contexte temporel (taux par minute × nombre de minutes), proportionnel pour un contexte d'effectif (taux « pour $N$ » $\\times\\, \\dfrac{\\text{effectif cible}}{N}$). Recopier le taux de base sans ajustement, c'est **le** piège le plus fréquent de cette famille !",
        },
        {
          kind: 'exempleLibre',
          label: 'Les 2 types d\'ajustement',
          blocks: [
            {
              kind: 'para',
              text: '**Temporel :** un péage voit passer en moyenne 5 voitures par minute — sur 15 minutes, $\\lambda=5\\times15=75$ (multiplicatif direct).',
            },
            {
              kind: 'para',
              text: '**Effectif :** une usine compte en moyenne 3 pièces défectueuses pour 1000 produites — sur un lot cible de 500 pièces, $\\lambda=3\\times\\dfrac{500}{1000}=1{,}5$ (proportionnel au rapport des effectifs).',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'E(X) = V(X) = λ — une propriété caractéristique',
          text: "Pour une loi de Poisson, l'espérance et la variance sont toutes les deux égales à $\\lambda$ (donc $\\sigma(X)=\\sqrt{\\lambda}$) — une propriété assez rare : dans la plupart des lois, espérance et variance sont différentes !",
        },
        {
          kind: 'application',
          titre: 'Surveiller l\'apparition de cas rares en santé publique',
          image: {
            src: '/images/application/epidemiology.jpg',
            alt: 'Microbiologiste du CDC examinant un échantillon de virus de la grippe',
            caption:
              'Un microbiologiste du CDC examine un échantillon viral. Photo : James ' +
              'Gathany, CDC/Public Health Image Library (domaine public).',
          },
          illustrations: [
            {
              kind: 'categoricalBarChart',
              bars: [
                { label: '0 ou 1', value: 0.406, valueLabel: '0,406', tone: 'faint' },
                { label: '2 ou 3', value: 0.4511, valueLabel: '0,451', tone: 'faint' },
                { label: '4 ou 5', value: 0.1263, valueLabel: '0,126', tone: 'faint' },
                { label: '6 et +', value: 0.0166, valueLabel: '0,017', tone: 'accent' },
              ],
              maxValue: 0.52,
              xAxisLabel: 'k = cas observés ce mois',
              yAxisLabel: 'P(X = k)',
              footnote: 'λ = 2 par mois : P(X ≥ 6) ≈ 1,7 %',
              caption:
                "Pour une maladie où $\\lambda=2$ cas par mois en moyenne, la barre orange (6 cas ou " +
                "plus) ne pèse qu'environ $1{,}7\\,\\%$ — observer un tel mois serait " +
                "très inhabituel, exactement le signal qu'un système de surveillance guette.",
            },
          ],
          text:
            'Un service de santé publique qui surveille une maladie rare (un nombre moyen ' +
            'connu de $\\lambda$ cas par mois dans une région) utilise directement la loi ' +
            'de Poisson pour détecter une anomalie : si le nombre de cas observés un mois ' +
            'donné dépasse largement ce que $P(X=k)$ prédit comme probable pour ce ' +
            '$\\lambda$, c\'est un signal d\'alerte — peut-être le début d\'une épidémie, ' +
            'ou un foyer de contamination localisé. Ce principe, comparer un comptage ' +
            'observé à la distribution de Poisson attendue, est exactement celui des ' +
            'systèmes de surveillance épidémiologique automatisés utilisés aujourd\'hui ' +
            'par les autorités sanitaires.',
          domaines: ['Santé publique', 'Épidémiologie'],
        },
        {
          kind: 'entrainement',
          title: 'Loi de Poisson',
          generatorId: '6gen53',
          description: [
            "Vérifie les conditions de l'approximation binomiale → Poisson, ajuste λ à l'échelle de la question et calcule une probabilité de Poisson.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 53. Loi de Poisson »',
        },
      ],
    },
  ],
  formulaire: {
    groups: [
      {
        title: 'Variable discrète — espérance, variance',
        formulas: [
          { text: '$F(x) = P(X \\le x)$' },
          { text: '$E(X) = \\displaystyle\\sum_i x_i \\times P(X=x_i)$' },
          { text: '$V(X) = E(X^2)-[E(X)]^2$', condition: '$E(X^2)=\\sum_i x_i^2 \\times P(X=x_i)$' },
          { text: '$\\sigma(X) = \\sqrt{V(X)}$' },
        ],
      },
      {
        title: 'Cas particuliers discrets',
        formulas: [
          { text: '$E(X) = \\dfrac{nK}{N}$', condition: 'loi hypergéométrique' },
          {
            text: '$E(X) = \\dfrac{n+1}{2} \\quad V(X) = \\dfrac{n^2-1}{12}$',
            condition: 'loi uniforme discrète sur les valeurs $1, 2, \\ldots, n$',
          },
        ],
      },
      {
        title: 'Loi binomiale',
        formulas: [
          { text: '$P(X=k) = C_n^k \\times p^k \\times (1-p)^{n-k}$', condition: '$X\\sim\\mathcal{B}(n\\,;p)$' },
          { text: '$E(X) = np$ ; $V(X) = np(1-p)$ ; $\\sigma(X)=\\sqrt{np(1-p)}$' },
          {
            text: '$n > \\dfrac{\\ln(1-s)}{\\ln(1-p)}$',
            condition: 'plus petit $n$ tel que $P(\\text{au moins 1 succès})>s$',
          },
        ],
      },
      {
        title: 'Variable continue et densité',
        formulas: [
          { text: '$\\displaystyle\\int_u^v f(t)\\,dt = 1$', condition: '$f$ densité, positive sur $[u\\,;v]$' },
          { text: '$P(a \\le X \\le b) = \\displaystyle\\int_a^b f(t)\\,dt$ $= F(b)-F(a)$' },
          { text: '$E(X) = \\displaystyle\\int_u^v t\\,f(t)\\,dt$' },
          { text: '$V(X) = \\displaystyle\\int_u^v t^2 f(t)\\,dt-[E(X)]^2$' },
        ],
      },
      {
        title: 'Loi uniforme continue',
        formulas: [
          { text: '$P(c \\le X \\le d) = \\dfrac{d-c}{b-a}$', condition: '$X$ uniforme sur $[a\\,;b]$, $[c\\,;d]$ contenu dans $[a\\,;b]$' },
          { text: '$E(X) = \\dfrac{a+b}{2} \\quad V(X) = \\dfrac{(b-a)^2}{12}$' },
        ],
      },
      {
        title: 'Loi normale',
        formulas: [
          { text: '$Z = \\dfrac{X-\\mu}{\\sigma}$', condition: '$X\\sim\\mathcal{N}(\\mu\\,;\\sigma)$, $\\sigma$ = écart-type' },
          { text: '$\\Phi(z) = P(Z \\le z)$' },
          { text: '$P(Z \\ge z) = 1-\\Phi(z)$' },
          { text: '$\\Phi(-z) = 1-\\Phi(z)$' },
          { text: '$P(a \\le Z \\le b) = \\Phi(b)-\\Phi(a)$' },
          { text: '$P(0 \\le Z \\le t) = \\Phi(t)-0{,}5$', condition: '$t>0$' },
          { text: '$x = \\mu + z \\times \\sigma$', condition: 'retour de $z$ vers $x$' },
          { text: '$68{,}3\\,\\%$ ; $95{,}4\\,\\%$ ; $99{,}7\\,\\%$', condition: 'dans $[\\mu-k\\sigma\\,;\\mu+k\\sigma]$ pour $k=1$, $2$, $3$' },
        ],
      },
      {
        title: 'Probabilités totales et Bayes',
        formulas: [
          { text: '$P(S) = \\displaystyle\\sum_i P(C_i)\\,P(S\\mid C_i)$', condition: '$C_1$, $C_2$, $C_3$ : partition de la population' },
          { text: '$P(C_j \\mid S) = \\dfrac{P(C_j)\\,P(S\\mid C_j)}{P(S)}$' },
        ],
      },
      {
        title: 'Approximations de la loi binomiale',
        formulas: [
          {
            text: '$\\mu=np \\quad \\sigma=\\sqrt{np(1-p)}$',
            condition: 'loi normale — $n>30$, $0{,}3<p<0{,}7$',
          },
          {
            text: '$P(X\\le k) \\approx \\Phi\\!\\left(\\dfrac{k+0{,}5-\\mu}{\\sigma}\\right)$',
            condition: 'correction de continuité',
          },
          {
            text: '$\\lambda=np$',
            condition: 'loi de Poisson — $n\\ge30$, $p\\le0{,}1$, $np\\le15$',
          },
        ],
      },
      {
        title: 'Loi de Poisson',
        formulas: [
          { text: '$P(X=k) = e^{-\\lambda}\\dfrac{\\lambda^k}{k!}$', condition: 'tout entier $k\\ge0$' },
          { text: '$E(X)=V(X)=\\lambda$' },
          { text: '$P(X=k) = P(X=k-1)\\times\\dfrac{\\lambda}{k}$', condition: 'calcul de proche en proche, $k\\ge1$' },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Fonction de répartition', '$F(x)=P(X\\leq x)$ — graphique en escalier'],
        ['Espérance discrète', '$E(X)=\\sum x_iP(X=x_i)$ — moyenne pondérée, jamais une moyenne simple'],
        ['Variance et écart-type', '$V(X)=E(X^2)-[E(X)]^2$ ; $\\sigma(X)=\\sqrt{V(X)}$'],
        ['Événements contraires', 'intersection vide et union complète — jamais juste « somme $=1$ »'],
        ['Loi hypergéométrique', '$E(X)=\\dfrac{nK}{N}$ — cas particulier d\'une loi discrète'],
        ['Loi uniforme discrète sur $1, \\ldots, n$', '$E(X)=\\dfrac{n+1}{2}$, $V(X)=\\dfrac{n^2-1}{12}$ — pour ces valeurs seulement'],
        ['Loi binomiale $\\mathcal{B}(n\\,;p)$', '$P(X=k)=C_n^k\\,p^k(1-p)^{n-k}$ ; $E(X)=np$, $V(X)=np(1-p)$'],
        ['Trouver $n$ (binomiale)', '$n>\\dfrac{\\ln(1-s)}{\\ln(1-p)}$ — inversion du sens car $\\ln(1-p)<0$'],
        ['Densité de probabilité', "$\\int_u^v f(t)\\,dt=1$ et $P(a\\leq X\\leq b)=\\int_a^b f(t)\\,dt$ — une aire sous la courbe, jamais une valeur $f(t)$"],
        ['Variable aléatoire continue', '$P(X=a)=0$ ; $P(a<X<b)=P(a\\leq X\\leq b)=F(b)-F(a)$ — strict ou large, même probabilité'],
        ['Discrète ou continue', '$\\sum p_ix_i$ devient $\\int t\\,f(t)\\,dt$ — mêmes notions, deux outils ; $\\sigma(X)=\\sqrt{V(X)}$ dans les 2 cas'],
        ['Loi uniforme continue', '$P(c\\leq X\\leq d)=\\dfrac{d-c}{b-a}$ ; $E(X)=\\dfrac{a+b}{2}$, $V(X)=\\dfrac{(b-a)^2}{12}$'],
        ['Loi normale $\\mathcal{N}(\\mu\\,;\\sigma)$', 'loi continue ; $Z=\\dfrac{X-\\mu}{\\sigma}$ ; $\\Phi(z)=P(Z\\leq z)$ ; $\\Phi(-z)=1-\\Phi(z)$'],
        ['Règle empirique', '$68{,}3\\,\\%$ / $95{,}4\\,\\%$ / $99{,}7\\,\\%$ pour $k=1$, $2$, $3$ écarts-types'],
        ['Vérifier la normalité', '$\\text{moyenne} \\approx \\text{mode} \\approx \\text{médiane}$, et répartition $68{,}3$ / $95{,}4$ / $99{,}7\\,\\%$ — critère pratique, jamais une preuve'],
        ['Bayes à 3 catégories', '$P(C_j\\mid S)=\\dfrac{P(C_j)\\,P(S\\mid C_j)}{P(S)}$'],
        ['Approximation binomiale → normale', '$n>30$, $0{,}3<p<0{,}7$ : $\\mu=np$, $\\sigma=\\sqrt{np(1-p)}$, avec correction de continuité $k\\pm0{,}5$'],
        ['Loi de Poisson', '$P(X=k)=\\dfrac{e^{-\\lambda}\\lambda^k}{k!}$ ; $E(X)=V(X)=\\lambda$'],
        ['Approximation binomiale → Poisson', '$n\\geq30$, $p\\leq0{,}1$, $np\\leq15$ : $\\lambda=np$'],
      ],
    },
    entrainement: {
      kind: 'entrainement',
      title: 'Variables aléatoires et lois de probabilités — quiz vrai/faux',
      generatorId: '6gen71',
      description: ['Un quiz de révision qui couvre tout le chapitre.'],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 71. Quiz vrai/faux — Variables aléatoires »',
    },
  },
}
