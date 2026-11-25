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
      kicker: 'E(X) = ∑ xᵢ · P(X = xᵢ) — une moyenne pondérée par les probabilités',
      titreCourt: 'Variables discrètes',
      partie: 'Lois discrètes : compter et pondérer',
      essentiel: [
        "L'**espérance** $E(X)=\\sum x_i\\,P(X=x_i)$ est une moyenne **pondérée** par les probabilités ; la **variance** $V(X)=E(X^2)-[E(X)]^2$ mesure la dispersion, et $\\sigma(X)=\\sqrt{V(X)}$.",
        'Deux événements sont contraires si leur intersection est vide **et** leur union complète : le contraire de « au moins $k$ » est « au plus $k-1$ ».',
        'Pour $Y=aX+b$ : $E(Y)=a\\,E(X)+b$ et $V(Y)=a^2\\,V(X)$.',
      ],
      cartes: [
        { question: '$X$ vaut $-2$, $3$, $5$ avec les probabilités $0{,}4$ ; $0{,}35$ ; $0{,}25$. Que vaut $E(X)$ ?', reponse: '$E(X)=-0{,}8+1{,}05+1{,}25=1{,}5$ : le jeu est favorable.' },
        { question: 'Comment calcule-t-on $V(X)$ le plus vite ?', reponse: 'Par la formule de König : $V(X)=E(X^2)-[E(X)]^2$.' },
        { question: '« $X\\geq4$ » et « $X\\leq4$ » sont-ils contraires ?', reponse: 'Non : ils partagent la valeur $X=4$. Le contraire de « $X\\geq4$ » est « $X\\leq3$ ».' },
        { question: '$E(X)=3$ et $\\sigma(X)=2$. Que valent $E(0{,}5X-1)$ et $\\sigma(0{,}5X-1)$ ?', reponse: '$E=0{,}5\\times3-1=0{,}5$ et $\\sigma=0{,}5\\times2=1$.' },
      ],
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
          kind: 'methode',
          label: 'Calculer une probabilité avec F',
          items: [
            '$P(X\\leq a)=F(a)$ et $P(X>a)=1-F(a)$.',
            '$P(a<X\\leq b)=F(b)-F(a)$ : on retire tout ce qui est inférieur ou égal à $a$. Avec la loi ci-dessus, $P(2<X\\leq5)=F(5)-F(2)$ $=0{,}90-0{,}15$ $=0{,}75$ (valeurs 3, 4 et 5).',
            "En discret, **strict ou large compte** : $P(X<4)=F(3)=0{,}40$, alors que $P(X\\leq4)=F(4)=0{,}70$.",
          ],
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
          kind: 'atelier',
          tag: 'balance-esperance-widget',
          label: 'Manipule toi-même : la balance de l’espérance',
          caption:
            'Chaque bloc pèse 0,05 : la loi est posée sur une poutre graduée de −6 à 6, et la somme ' +
            'des probabilités reste toujours égale à 1. Déplace des blocs : le point d’appui se place ' +
            'en E(X), le centre de gravité, et la bande bleue va de E(X) − σ à E(X) + σ. « Deux jeux ' +
            'de même E(X) » compare un jeu à ±1 € et un jeu à ±5 € : même espérance, pas le même ' +
            'risque.',
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
              text: "**Énoncé.** Une variable aléatoire $X$ prend les valeurs $2$, $3$, $4$, $5$, $6$ avec les probabilités $0{,}15$ ; $0{,}25$ ; $0{,}30$ ; $0{,}20$ ; $0{,}10$. Vérifie que cette loi est valide, puis calcule $E(X)$, $V(X)$ et $\\sigma(X)$.",
            },
            {
              kind: 'para',
              text: "D'abord, un réflexe : $0{,}15+0{,}25+0{,}30+0{,}20+0{,}10=1$ — la loi est bien valide.",
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
        {
          kind: 'piege',
          text: "Deux confusions fréquentes : $\\sigma(X)=V(X)^2$ (c'est la **racine** : $\\sigma(X)=\\sqrt{V(X)}$) et $E(X^2)=[E(X)]^2$. Dans l'exemple, $E(X^2)=16{,}25$ alors que $[E(X)]^2=14{,}8225$ : leur différence est justement la variance, qui n'est jamais négative.",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — formule de König : V(X) = E(X²) − [E(X)]²',
          blocks: [
            {
              kind: 'para',
              text: "Note $\\mu=E(X)$ et $p_i=P(X=x_i)$. Par définition, $V(X)=\\sum_i p_i\\,(x_i-\\mu)^2$ — **définition de la variance**.",
            },
            {
              kind: 'para',
              text: '$(x_i-\\mu)^2=x_i^2-2\\mu x_i+\\mu^2$, donc $V(X)=\\sum_i p_i x_i^2-2\\mu\\sum_i p_i x_i+\\mu^2\\sum_i p_i$ — **carré d\'une différence, puis on distribue la somme** ($\\mu$ ne dépend pas de $i$).',
            },
            {
              kind: 'para',
              text: '$\\sum_i p_i x_i^2=E(X^2)$, $\\sum_i p_i x_i=\\mu$ et $\\sum_i p_i=1$ — **définitions de l\'espérance, et somme des probabilités égale à 1**.',
            },
            {
              kind: 'para',
              text: "Donc $V(X)=E(X^2)-2\\mu^2+\\mu^2$ $=E(X^2)-\\mu^2$ $=E(X^2)-[E(X)]^2$.",
            },
          ],
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
          label: 'Exemple résolu — ce jeu est-il favorable ?',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** À un jeu, le gain net du joueur vaut $-2$ € avec la probabilité $0{,}4$, $3$ € avec la probabilité $0{,}35$ et $5$ € avec la probabilité $0{,}25$. Ce jeu est-il favorable, équitable ou défavorable au joueur ?",
            },
            { kind: 'para', text: '$E = -2\\times0{,}4 + 3\\times0{,}35 + 5\\times0{,}25$ $= -0{,}8+1{,}05+1{,}25$ $= 1{,}5$ €' },
            {
              kind: 'para',
              text: "Espérance strictement positive : le jeu est **favorable** au joueur — sur un grand nombre de parties, il gagne en moyenne $1{,}50$ € par partie.",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — trouver la mise m qui rend le jeu équitable',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Un jeu offre un gain brut de $10$ € (probabilité $0{,}2$), de $4$ € (probabilité $0{,}3$) ou de $-6$ € (probabilité $0{,}5$). L'organisateur demande une mise $m$, retirée du gain brut. Quelle mise rend le jeu équitable ?",
            },
            {
              kind: 'para',
              text: "$E(\\text{gain brut})=10\\times0{,}2+4\\times0{,}3$ $+\\,(-6)\\times0{,}5$ $=2+1{,}2-3=0{,}2$ €. Le gain net vaut désormais $\\text{gain brut}-m$. Comme $\\sum p_i=1$, l'espérance du gain net est simplement $E(\\text{gain brut})-m$ — linéaire en $m$. Pour un jeu équitable ($E=0$) :",
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
          label: 'Exemple résolu — loi et espérance d\'un tirage sans remise (10 boules, dont 4 rouges)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Une urne contient 10 boules, dont 4 rouges. On tire 3 boules sans remise, et $X$ compte les boules rouges obtenues ($N=10$, $K=4$, $n=3$). Détermine la loi de $X$, puis $E(X)$.",
            },
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
          label: 'Exemple résolu — espérance et variance du résultat d\'un dé équilibré',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** On lance un dé équilibré à 6 faces ; $X$ est le résultat obtenu. Calcule $E(X)$ et $V(X)$.",
            },
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
          kind: 'exempleLibre',
          label: 'Démonstration — espérance et variance de la loi uniforme sur 1, 2, …, n',
          blocks: [
            {
              kind: 'para',
              text: "On utilise deux sommes : $1+2+\\ldots+n=\\dfrac{n(n+1)}{2}$ (suite arithmétique) et $1^2+2^2+\\ldots+n^2=\\dfrac{n(n+1)(2n+1)}{6}$ (admise ici, elle se démontre par récurrence).",
            },
            {
              kind: 'para',
              text: '$E(X)=\\displaystyle\\sum_{k=1}^{n}k\\times\\dfrac{1}{n}$ $=\\dfrac{1}{n}\\times\\dfrac{n(n+1)}{2}$ $=\\dfrac{n+1}{2}$ — **chaque valeur a la probabilité** $\\frac{1}{n}$.',
            },
            {
              kind: 'para',
              text: '$E(X^2)=\\dfrac{1}{n}\\displaystyle\\sum_{k=1}^{n}k^2=\\dfrac{(n+1)(2n+1)}{6}$ — **même calcul avec les carrés**.',
            },
            {
              kind: 'para',
              text: '$V(X)=E(X^2)-[E(X)]^2$ $=\\dfrac{(n+1)(2n+1)}{6}-\\dfrac{(n+1)^2}{4}$ $=\\dfrac{(n+1)\\,[2(2n+1)-3(n+1)]}{12}$ $=\\dfrac{(n+1)(n-1)}{12}$ $=\\dfrac{n^2-1}{12}$ — **formule de König, puis mise au même dénominateur**.',
            },
          ],
        },
        { kind: 'subheading', text: 'Transformer une variable : Y = aX + b' },
        {
          kind: 'intuition',
          label: 'Changer d\'unité ne change pas la loi',
          text: "Convertir des points en euros, retirer une mise, passer des degrés Celsius aux degrés Fahrenheit : à chaque fois, on applique la même transformation $y=ax+b$ à **toutes** les valeurs de $X$, sans toucher aux probabilités. Inutile de reconstruire la loi de $Y$ : son espérance et sa variance se déduisent directement de celles de $X$.",
        },
        {
          kind: 'definition',
          label: 'Espérance, variance et écart-type de aX + b',
          items: [
            'Pour tous réels $a$ et $b$ : $E(aX+b)=a\\,E(X)+b$.',
            '$V(aX+b)=a^2\\,V(X)$ et $\\sigma(aX+b)=|a|\\,\\sigma(X)$ : ajouter une constante $b$ décale toutes les valeurs sans changer leur dispersion ; multiplier par $a$ multiplie les écarts par $|a|$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — E(aX + b) = aE(X) + b et V(aX + b) = a²V(X)',
          blocks: [
            {
              kind: 'para',
              text: "$Y=aX+b$ prend la valeur $ax_i+b$ avec la probabilité $p_i=P(X=x_i)$ — **la transformation ne change pas les probabilités**.",
            },
            {
              kind: 'para',
              text: '$E(Y)=\\sum_i p_i\\,(ax_i+b)$ $=a\\sum_i p_i x_i+b\\sum_i p_i$ $=a\\,E(X)+b$ — **on distribue la somme, et** $\\sum p_i=1$.',
            },
            {
              kind: 'para',
              text: "Chaque écart à la moyenne devient $(ax_i+b)-(a\\,E(X)+b)=a\\,[x_i-E(X)]$ : la constante $b$ disparaît — **résultat précédent**.",
            },
            {
              kind: 'para',
              text: '$V(Y)=\\sum_i p_i\\,a^2[x_i-E(X)]^2=a^2\\,V(X)$, et $\\sigma(Y)=\\sqrt{a^2V(X)}=|a|\\,\\sigma(X)$ — **définition de la variance, et** $\\sqrt{a^2}=|a|$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'des points aux euros, sans reconstruire la loi',
          formula:
            "À un jeu, le nombre de points $X$ gagnés a pour espérance $E(X)=3$ et pour écart-type $\\sigma(X)=2$. Chaque point rapporte $0{,}50$ €, et la partie coûte $1$ €. Calcule l'espérance, la variance et l'écart-type du gain net $Y$, en euros.",
          steps: [
            { tag: 'modèle', text: '$Y=0{,}5X-1$ ($a=0{,}5$, $b=-1$)' },
            { tag: 'espérance', text: '$E(Y)=0{,}5\\times3-1=0{,}5$ €' },
            { tag: 'variance', text: '$V(Y)=0{,}5^2\\times V(X)$ $=0{,}25\\times2^2$ $=1$' },
            { tag: 'écart-type', text: '$\\sigma(Y)=|0{,}5|\\times2=1$ €' },
          ],
          result: { tag: 'conclusion', text: '$E(Y)=0{,}50$ €, $V(Y)=1$, $\\sigma(Y)=1$ €.' },
        },
        {
          kind: 'piege',
          text: "La constante $b$ **ne s'ajoute pas** à la variance : $V(aX+b)=a^2V(X)$, jamais $aV(X)+b$. Et un écart-type n'est jamais négatif : $\\sigma(-2X)=2\\,\\sigma(X)$, pas $-2\\,\\sigma(X)$.",
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
          description: ["Calcule des probabilités sur une loi donnée, reconnais des événements contraires, construis une loi, calcule l'espérance et juge un jeu."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 49. Variables aléatoires discrètes et espérance »',
        },
        {
          kind: 'entrainement',
          title: 'Variance et écart-type d\'une loi discrète',
          generatorId: '6gen110',
          description: [
            "Calcule l'espérance, E(X²), puis la variance par la formule de König et l'écart-type ; ou compare deux jeux de même espérance : lequel est le plus risqué ?",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 110. Variance et écart-type d\'une loi discrète »',
        },
        {
          kind: 'entrainement',
          title: 'Transformation affine Y = aX + b',
          generatorId: '6gen111',
          description: [
            "Conversion de devise ou de température, mise retranchée, prime qui diminue : écris Y = aX + b, puis calcule E(Y), V(Y) et σ(Y) sans reconstruire la loi.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 111. Transformation affine Y = aX + b »',
        },
      ],
    },
    {
      id: 'loibinomiale',
      number: 2,
      title: 'Loi binomiale',
      kicker: 'P(X = k) = Cₙᵏ · pᵏ · (1 − p)ⁿ⁻ᵏ ; E(X) = np ; V(X) = np(1 − p)',
      titreCourt: 'Loi binomiale',
      partie: 'Lois discrètes : compter et pondérer',
      essentiel: [
        '$X\\sim\\mathcal{B}(n\\,;p)$ compte les succès de $n$ épreuves indépendantes de même probabilité $p$ : $P(X=k)=C_n^k\\,p^k(1-p)^{n-k}$.',
        '$E(X)=np$, $V(X)=np(1-p)$ et $\\sigma(X)=\\sqrt{np(1-p)}$.',
        'Le plus petit $n$ tel que $1-(1-p)^n>s$ vérifie $n>\\dfrac{\\ln(1-s)}{\\ln(1-p)}$ : le sens change car $\\ln(1-p)<0$.',
      ],
      cartes: [
        { question: "Quelles sont les 4 conditions d'une loi binomiale ?", reponse: '$n$ fixé, épreuves indépendantes, 2 issues, $p$ constant.' },
        { question: '$X\\sim\\mathcal{B}(5\\,;0{,}4)$ : que valent $E(X)$ et $V(X)$ ?', reponse: '$E(X)=2$ et $V(X)=5\\times0{,}4\\times0{,}6=1{,}2$.' },
        { question: "$p=0{,}1$ : combien d'épreuves au minimum pour que $P(\\text{au moins 1 succès})>0{,}9$ ?", reponse: '$n>\\dfrac{\\ln(0{,}1)}{\\ln(0{,}9)}\\approx21{,}85$, donc $n=22$.' },
      ],
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
          kind: 'atelier',
          tag: 'stabilisation-frequences-widget',
          label: 'Manipule toi-même : la fréquence se stabilise',
          caption:
            'Chaque lancer est une épreuve de Bernoulli. Lance la pièce ou le dé par paquets de 10, ' +
            '100 ou 1 000 : la fréquence des succès se resserre autour de p (loi des grands nombres ' +
            'de Jacques Bernoulli). C’est pourquoi on attend environ n × p succès en n épreuves : ' +
            'E(X) = np.',
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
          label: 'Exemple résolu — loi complète, espérance et écart-type de 5 tirs (p = 0,4)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Une joueuse réussit un tir avec la probabilité $0{,}4$ ; elle tire 5 fois, ses tirs étant indépendants, et $X$ compte ses tirs réussis. Établis la loi de probabilité complète de $X$, puis calcule $E(X)$, $V(X)$ et $\\sigma(X)$.",
            },
            {
              kind: 'para',
              text: "$X$ suit la loi $\\mathcal{B}(5\\,;0{,}4)$ (5 épreuves indépendantes, 2 issues, $p=0{,}4$ constant). La formule donne chaque $P(X=k)$ ; la dernière colonne cumule :",
            },
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
            { kind: 'para', text: '$E(X)=5\\times0{,}4=2$ ; $V(X) = 5\\times0{,}4\\times0{,}6 = 1{,}2$ et $\\sigma(X) = \\sqrt{1{,}2} \\approx 1{,}095$' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'binomiale-positions-widget',
          label: 'Manipule toi-même : la loi binomiale complète',
          caption:
            'Rappel du chapitre 6 : fais glisser n et p, choisis k, et compare le calcul juste aux ' +
            'deux pièges (oublier les positions, additionner les p). Règle n = 5 et p = 0,4 pour ' +
            'retrouver la loi de l’exemple ci-dessus, avec P(X = 2) = 0,3456.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la somme des probabilités binomiales vaut 1',
          blocks: [
            {
              kind: 'para',
              text: '$\\displaystyle\\sum_{k=0}^{n}P(X=k)=\\sum_{k=0}^{n}C_n^k\\,p^k(1-p)^{n-k}$ — **formule de la loi binomiale**.',
            },
            {
              kind: 'para',
              text: "C'est le développement de $(a+b)^n=\\displaystyle\\sum_{k=0}^{n}C_n^k\\,a^{n-k}b^k$ avec $a=1-p$ et $b=p$ — **binôme de Newton (chapitre 7)**.",
            },
            {
              kind: 'para',
              text: 'La somme vaut donc $\\big((1-p)+p\\big)^n=1^n=1$, pour toute valeur de $p$ : la loi binomiale est bien une loi de probabilité.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — E(X) = 3p et V(X) = 3p(1 − p) pour 3 épreuves',
          blocks: [
            {
              kind: 'para',
              text: "Note $q=1-p$. Pour $X\\sim\\mathcal{B}(3\\,;p)$ : $P(X=0)=q^3$, $P(X=1)=3pq^2$, $P(X=2)=3p^2q$, $P(X=3)=p^3$ — **formule binomiale**, $C_3^1=C_3^2=3$.",
            },
            {
              kind: 'para',
              text: '$E(X)=0\\times q^3+1\\times3pq^2$ $+\\,2\\times3p^2q+3\\times p^3$ $=3p\\,(q^2+2pq+p^2)=3p\\,(q+p)^2=3p$ — **mise en évidence de** $3p$**, puis carré parfait avec** $p+q=1$.',
            },
            {
              kind: 'para',
              text: '$E(X^2)=1\\times3pq^2+4\\times3p^2q+9\\times p^3$ $=3p\\,(q^2+4pq+3p^2)$ $=3p\\,(q+p)(q+3p)$ $=3p\\,(1+2p)$ — **factorisation**, puisque $q+3p=1+2p$.',
            },
            {
              kind: 'para',
              text: '$V(X)=E(X^2)-[E(X)]^2$ $=3p+6p^2-9p^2$ $=3p-3p^2$ $=3p\\,(1-p)$ — **formule de König**.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — E(X) = np pour toute loi binomiale',
          blocks: [
            {
              kind: 'para',
              text: "Pour $1\\leq k\\leq n$ : $k\\,C_n^k=k\\times\\dfrac{n!}{k!\\,(n-k)!}$ $=n\\times\\dfrac{(n-1)!}{(k-1)!\\,(n-k)!}$ $=n\\,C_{n-1}^{k-1}$ — **définition de** $C_n^k$ **(chapitre 7)**.",
            },
            {
              kind: 'para',
              text: '$E(X)=\\displaystyle\\sum_{k=1}^{n}k\\,C_n^k\\,p^k q^{n-k}$ $=np\\sum_{k=1}^{n}C_{n-1}^{k-1}\\,p^{k-1}q^{n-k}$ — **le terme** $k=0$ **est nul ; on sort** $n$ **et un facteur** $p$.',
            },
            {
              kind: 'para',
              text: "Avec $j=k-1$, la somme devient $\\displaystyle\\sum_{j=0}^{n-1}C_{n-1}^{j}\\,p^{j}q^{(n-1)-j}=(p+q)^{n-1}=1$ — **binôme de Newton**. Donc $E(X)=np$. (La formule $V(X)=np(1-p)$ se démontre de la même façon ; on l'admet ici.)",
            },
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
          label: 'Exemple résolu — combien de tickets pour dépasser 90 % de chances de gagner ?',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Un ticket à gratter est gagnant avec la probabilité $p=0{,}1$, indépendamment des autres. Combien de tickets faut-il acheter, au minimum, pour que la probabilité d'avoir au moins un ticket gagnant dépasse $0{,}9$ ?",
            },
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
          kind: 'exempleLibre',
          label: 'Démonstration — le plus petit n tel que 1 − (1 − p)ⁿ > s',
          blocks: [
            {
              kind: 'para',
              text: "Soit $0<p<1$ et $0<s<1$. $1-(1-p)^n>s\\iff(1-p)^n<1-s$ — **on isole la puissance** (les deux membres sont positifs).",
            },
            {
              kind: 'para',
              text: '$\\iff n\\ln(1-p)<\\ln(1-s)$ — **ln est strictement croissante sur** $]0\\,;+\\infty[$**, et** $\\ln(a^n)=n\\ln a$.',
            },
            {
              kind: 'para',
              text: '$\\iff n>\\dfrac{\\ln(1-s)}{\\ln(1-p)}$ — **on divise par** $\\ln(1-p)<0$ **(car** $0<1-p<1$**) : le sens de l\'inégalité change**.',
            },
            {
              kind: 'para',
              text: "Comme $(1-p)^n$ diminue quand $n$ augmente, la condition reste vraie pour tout $n$ plus grand : le plus petit entier qui convient est le plus petit entier **strictement** supérieur à $\\dfrac{\\ln(1-s)}{\\ln(1-p)}$.",
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
          description: ['Reconnais un schéma de Bernoulli (ou la condition qui échoue), construis la loi complète avec son diagramme, calcule E, V et σ, et résous un « trouver n ».'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 50. Loi binomiale »',
        },
      ],
    },
    {
      id: 'variablecontinue',
      number: 3,
      title: 'Variable aléatoire continue et densité de probabilité',
      kicker: 'P(a ≤ X ≤ b) = ∫ f(t) dt — une aire sous la courbe de densité',
      titreCourt: 'Densité de probabilité',
      partie: 'Lois continues : des aires sous une courbe',
      essentiel: [
        "Une densité $f$ est positive, d'aire totale 1, et $P(a\\leq X\\leq b)=\\displaystyle\\int_a^b f(t)\\,dt$ : une **aire**, jamais une valeur $f(t)$.",
        "Pour une variable continue, $P(X=a)=0$ : strict ou large ne change rien, et $P(a<X\\leq b)=F(b)-F(a)$ avec $F'=f$.",
        '$E(X)=\\displaystyle\\int_u^v t\\,f(t)\\,dt$.',
      ],
      cartes: [
        { question: '$f(t)=kt$ est une densité sur $[0\\,;2]$. Que vaut $k$ ?', reponse: '$\\displaystyle\\int_0^2 kt\\,dt=2k=1$, donc $k=\\dfrac{1}{2}$.' },
        { question: 'Que vaut $P(X=3)$ pour une variable continue ?', reponse: '$0$ : seule une probabilité sur un intervalle a un sens.' },
        { question: 'Quel lien entre la fonction de répartition $F$ et la densité $f$ ?', reponse: "$F'=f$, et $P(a<X\\leq b)=F(b)-F(a)$." },
      ],
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
          kind: 'atelier',
          tag: 'densite-repartition-widget',
          label: 'Manipule toi-même : densité et fonction de répartition',
          caption:
            'Choisis une densité sur [0 ; 6] et déplace a et b : l’aire sous f entre a et b est la ' +
            'longueur du segment F(b) − F(a) sur le graphique de F. La tangente à F en b a pour pente ' +
            'f(b), car F′ = f. Fais a = b : l’aire devient nulle, P(X = a) = 0. La parabole est celle ' +
            'de la figure ci-dessus.',
        },
        {
          kind: 'atelier',
          tag: 'fonction-aire-widget',
          label: 'Manipule toi-même : la fonction aire (rappel)',
          caption:
            'Rappel du chapitre « Intégrales et primitives » : l’aire sous f de a à x définit une ' +
            'fonction A dont la dérivée est f. C’est le lien entre la densité et la fonction de ' +
            'répartition : F(x) est l’aire sous la densité à gauche de x, donc F′ = f.',
        },
        {
          kind: 'astuce',
          label: 'Strict ou large : aucune différence en continu',
          text: "Puisque $P(X=a)=0$ pour toute valeur isolée, ajouter ou retirer une borne ne change **jamais** la probabilité d'un intervalle : $P(a<X<b)$ et $P(a\\leq X\\leq b)$ valent toujours pareil, $F(b)-F(a)$. C'est l'inverse exact du cas discret, où la valeur frontière $X=k$ pèse un vrai $P(X=k)$ et fait se recouvrir « au moins $k$ » et « au plus $k$ » (§ 1).",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — P(a < X ≤ b) = F(b) − F(a) et P(X = a) = 0',
          blocks: [
            {
              kind: 'para',
              text: "Soit $u\\leq a<b\\leq v$. L'événement « $X\\leq b$ » est la réunion des événements incompatibles « $X\\leq a$ » et « $a<X\\leq b$ », donc $F(b)=F(a)+P(a<X\\leq b)$ — **probabilité d'une réunion d'événements incompatibles**.",
            },
            {
              kind: 'para',
              text: "D'où $P(a<X\\leq b)=F(b)-F(a)$. Avec la densité : $F(b)-F(a)=\\displaystyle\\int_u^b f(t)\\,dt-\\int_u^a f(t)\\,dt$ $=\\int_a^b f(t)\\,dt$ — **relation de Chasles**.",
            },
            {
              kind: 'para',
              text: "Pour tout $h>0$ : « $X=a$ » est inclus dans « $a-h<X\\leq a$ », donc $0\\leq P(X=a)\\leq F(a)-F(a-h)$ — **une probabilité est croissante pour l'inclusion**.",
            },
            {
              kind: 'para',
              text: "$F$ est continue, donc $F(a)-F(a-h)$ tend vers 0 quand $h$ tend vers 0 : $P(X=a)=0$ — **passage à la limite**.",
            },
          ],
        },
        { kind: 'subheading', text: 'Trouver une densité, puis calculer avec elle' },
        {
          kind: 'methode',
          label: 'Une densité inconnue à une constante près',
          items: [
            "Une densité doit être **positive** sur $[u\\,;v]$ et d'aire totale **1** : si $f(t)=k\\,g(t)$, on calcule $\\displaystyle\\int_u^v k\\,g(t)\\,dt$ par une primitive et on résout « $=1$ » pour trouver $k$.",
            "Ensuite, $P(a\\leq X\\leq b)=\\displaystyle\\int_a^b f(t)\\,dt$ (en coupant aux bornes $u$ et $v$ si l'intervalle déborde), $E(X)=\\displaystyle\\int_u^v t\\,f(t)\\,dt$, et $F(x)=\\displaystyle\\int_u^x f(t)\\,dt$ pour $x$ dans $[u\\,;v]$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — densité f(t) = kt sur [0 ; 2] : trouver k, puis une probabilité et E(X)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Une variable aléatoire $X$ a pour densité $f(t)=kt$ sur $[0\\,;2]$ ($f$ est nulle ailleurs). Détermine $k$, puis calcule $P(0{,}5\\leq X\\leq1)$, $E(X)$, $V(X)$ et la fonction de répartition $F$ sur $[0\\,;2]$.",
            },
            {
              kind: 'para',
              text: "Aire totale : $\\displaystyle\\int_0^2 kt\\,dt=\\left[\\dfrac{kt^2}{2}\\right]_0^2=2k=1$, donc $k=\\dfrac{1}{2}$ et $f(t)=\\dfrac{t}{2}$, bien positive sur $[0\\,;2]$.",
            },
            {
              kind: 'para',
              text: '$P(0{,}5\\leq X\\leq1)=\\displaystyle\\int_{0{,}5}^{1}\\dfrac{t}{2}\\,dt=\\left[\\dfrac{t^2}{4}\\right]_{0{,}5}^{1}$ $=\\dfrac{1}{4}-\\dfrac{1}{16}=\\dfrac{3}{16}=0{,}1875$',
            },
            {
              kind: 'para',
              text: '$E(X)=\\displaystyle\\int_0^2 t\\times\\dfrac{t}{2}\\,dt=\\left[\\dfrac{t^3}{6}\\right]_0^2=\\dfrac{4}{3}$ et $V(X)=\\displaystyle\\int_0^2 \\dfrac{t^3}{2}\\,dt-\\left(\\dfrac{4}{3}\\right)^2$ $=2-\\dfrac{16}{9}=\\dfrac{2}{9}$',
            },
            {
              kind: 'para',
              text: "$F(x)=\\displaystyle\\int_0^x \\dfrac{t}{2}\\,dt=\\dfrac{x^2}{4}$ sur $[0\\,;2]$ : on retrouve $P(0{,}5\\leq X\\leq1)=F(1)-F(0{,}5)$ $=\\dfrac{1}{4}-\\dfrac{1}{16}$, et $F(2)=1$.",
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (t: number) => t / 2, tone: 'accent', xMin: 0, xMax: 2 }],
                shadedRegions: [{ from: 0.5, to: 1, upper: (t: number) => t / 2, tone: 'accent' }],
                xMin: 0,
                xMax: 2.4,
                xTicks: [0.5, 1, 1.5, 2],
                xTickLabels: { 0.5: '0,5', 1: '1', 1.5: '1,5', 2: '2' },
                yTicks: [0.5, 1],
                yTickLabels: { 0.5: '0,5', 1: '1' },
                fixedYRange: { min: 0, max: 1.2 },
                xAxisLabel: 't',
                yAxisLabel: 'f(t)',
                caption: "Densité $f(t)=\\dfrac{t}{2}$ sur $[0\\,;2]$ : le triangle sous la courbe a pour aire $\\dfrac{2\\times1}{2}=1$ ; la zone teintée vaut $P(0{,}5\\leq X\\leq1)=0{,}1875$.",
              },
            },
          ],
        },
        {
          kind: 'piege',
          text: "$f(1)=0{,}5$ n'est **pas** la probabilité que $X$ vaille 1 (elle est nulle) : une densité peut même dépasser 1 sur un petit intervalle. Seule une **aire** sous la courbe est une probabilité.",
        },
        {
          kind: 'methode',
          label: 'Reconnaître la fonction de répartition d\'une variable continue',
          items: [
            "$F$ est continue, **croissante**, vaut 0 avant $u$ et 1 après $v$ (donc $F(u)=0$ et $F(v)=1$).",
            "Si une seule de ces propriétés manque, ce n'est pas une fonction de répartition. Exemple : $G(x)=\\dfrac{x(3-x)}{2}$ sur $[0\\,;2]$ vérifie $G(0)=0$ et $G(2)=1$, mais $G'(x)=\\dfrac{3-2x}{2}<0$ pour $x>1{,}5$ : $G$ décroît, ce n'est pas une fonction de répartition.",
            "Si c'en est une, la densité s'obtient en dérivant : $f=F'$ sur $]u\\,;v[$ (avec $F(x)=\\dfrac{x^2}{4}$ : $f(x)=\\dfrac{x}{2}$).",
          ],
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
          kind: 'atelier',
          tag: 'rectangle-valeur-moyenne-widget',
          label: 'Manipule toi-même : la valeur moyenne d’une fonction (rappel)',
          caption:
            'Rappel du chapitre « Intégrales et primitives » : la valeur moyenne de f sur [a ; b] est ' +
            'la hauteur du rectangle de même aire. Pour une densité, l’aire totale vaut 1 : sa valeur ' +
            'moyenne sur [u ; v] vaut donc 1/(v − u), la hauteur de la densité uniforme (section 5). ' +
            'Attention : E(X) n’est pas cette valeur moyenne, c’est la moyenne des valeurs t ' +
            'pondérées par f(t).',
        },
        {
          kind: 'intuition',
          label: 'Le même écart-type qu’en statistique descriptive',
          text:
            "Tu as déjà rencontré la moyenne et l'écart-type d'une série de données, en statistique descriptive. L'idée ne change pas ici : $E(X)$ reste une moyenne, $\\sigma(X)$ reste une mesure de dispersion autour de cette moyenne. Seul l'outil de calcul change — une somme devient une intégrale, parce que $X$ prend maintenant toutes les valeurs d'un intervalle, qu'on ne peut plus énumérer.",
        },
        {
          kind: 'entrainement',
          title: 'Fonction de répartition',
          generatorId: '6gen112',
          description: [
            "Construis l'escalier d'une loi discrète et calcule des probabilités d'intervalles (attention aux bornes), ou reconnais la fonction de répartition d'une variable continue, puis P(X ≤ a), P(a < X < b) et la densité f = F′.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 112. Fonction de répartition »',
        },
        {
          kind: 'entrainement',
          title: 'Densité de probabilité',
          generatorId: '6gen113',
          description: [
            "Trouve k pour que l'aire sous la densité vaille 1, puis calcule des probabilités comme des aires (densité tracée) ou par une primitive, et l'espérance.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 113. Densité de probabilité »',
        },
      ],
    },
    {
      id: 'discreteoucontinue',
      number: 4,
      title: 'Variable aléatoire discrète ? Variable aléatoire continue ?',
      kicker: 'compter → discrète, somme ; mesurer → continue, intégrale',
      titreCourt: 'Discrète ou continue',
      partie: 'Lois continues : des aires sous une courbe',
      essentiel: [
        'On **compte** : variable discrète, probabilités calculées par des **sommes**. On **mesure** une grandeur sur un intervalle : variable continue, par des **intégrales**.',
        '$\\sum p_i x_i$ devient $\\displaystyle\\int t\\,f(t)\\,dt$ : mêmes notions, deux outils.',
      ],
      cartes: [
        { question: "Le temps d'attente à un guichet est-il discret ou continu ?", reponse: "Continu : c'est une mesure sur un intervalle ; on calcule avec une intégrale." },
        { question: "Le nombre d'appels en une heure (sans maximum) est-il discret ?", reponse: 'Oui : ses valeurs 0, 1, 2, … se numérotent.' },
        { question: 'Quelle formule continue correspond à $E(X)=\\sum p_i x_i$ ?', reponse: '$E(X)=\\displaystyle\\int_u^v t\\,f(t)\\,dt$.' },
      ],
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
        {
          kind: 'methode',
          label: 'Discrète ou continue ? La question à se poser',
          items: [
            "**Compte-t-on** quelque chose (des personnes, des pannes, des succès, des points) ? Les valeurs sont des nombres qu'on peut numéroter : la variable est **discrète**. On calcule avec des **sommes**, et $P(X=a)$ peut être non nulle.",
            "**Mesure-t-on** une grandeur (un temps, une longueur, une masse, un angle) qui peut prendre toutes les valeurs d'un intervalle ? La variable est **continue**. On calcule avec des **intégrales**, et $P(X=a)=0$.",
            "Un comptage **sans maximum** (le nombre d'appels en une heure : 0, 1, 2, …, sans borne) reste discret : ses valeurs se numérotent. Une mesure **arrondie** (une taille notée au centimètre près) donne une variable discrète si l'on travaille sur les valeurs arrondies, alors que la grandeur mesurée elle-même est continue.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — classer six variables aléatoires',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Pour chacune des variables suivantes, dis si elle est discrète ou continue, et précise l'outil de calcul d'une probabilité (somme ou intégrale) : le nombre d'appels reçus par un standard en une heure ; le temps d'attente à un guichet ; le nombre de « pile » en 10 lancers d'une pièce ; la masse d'une pomme prise au hasard ; la note entière (sur 20) d'un élève ; l'angle où s'arrête une roue de loterie.",
            },
            {
              kind: 'featureTable',
              headers: ['Variable', 'Nature, outil', 'Remarque'],
              rows: [
                ['Appels en une heure', 'discrète, somme', 'valeurs 0, 1, 2, … sans maximum (Poisson, § 8)'],
                ["Temps d'attente", 'continue, intégrale', '$P(X=3)=0$'],
                ['« Pile » en 10 lancers', 'discrète, somme', 'valeurs 0 à 10 (binomiale, § 2)'],
                ["Masse d'une pomme", 'continue, intégrale', 'souvent une loi normale (§ 6)'],
                ['Note entière sur 20', 'discrète, somme', '21 valeurs possibles'],
                ["Angle d'arrêt de la roue", 'continue, intégrale', 'uniforme sur $[0\\,;360]$ (§ 5)'],
              ],
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Discrète ou continue ?',
          generatorId: '6gen114',
          description: [
            "Classe la variable d'une situation (on compte ou on mesure exactement ?), donne l'ensemble de ses valeurs, puis l'outil de calcul : somme des P(X = k) ou intégrale d'une densité.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 114. Discrète ou continue ? »',
        },
      ],
    },
    {
      id: 'loiuniformecontinue',
      number: 5,
      title: 'Loi uniforme continue',
      kicker: 'densité 1/(b − a) : seule la longueur de l’intervalle compte',
      titreCourt: 'Loi uniforme continue',
      partie: 'Lois continues : des aires sous une courbe',
      essentiel: [
        'Pour $X$ uniforme sur $[a\\,;b]$, la densité vaut $\\dfrac{1}{b-a}$ et $P(c\\leq X\\leq d)=\\dfrac{d-c}{b-a}$ pour $[c\\,;d]$ contenu dans $[a\\,;b]$.',
        '$E(X)=\\dfrac{a+b}{2}$ et $V(X)=\\dfrac{(b-a)^2}{12}$.',
      ],
      cartes: [
        { question: "Un bus passe toutes les 20 minutes. Probabilité d'attendre au plus 5 minutes ?", reponse: '$\\dfrac{5}{20}=0{,}25$.' },
        { question: '$X$ uniforme sur $[0\\,;60]$ : que valent $E(X)$ et $V(X)$ ?', reponse: '$E(X)=30$ et $V(X)=\\dfrac{60^2}{12}=300$.' },
        { question: '$E(X)=8$ et $V(X)=3$ pour une loi uniforme : que valent $a$ et $b$ ?', reponse: '$a+b=16$ et $b-a=\\sqrt{36}=6$, donc $a=5$ et $b=11$.' },
      ],
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
            {
              kind: 'para',
              text: "**Énoncé.** La trotteuse d'une horloge arrêtée au hasard indique un nombre de secondes $X$, uniforme sur $[0\\,;60]$. Calcule $E(X)$, $V(X)$ et $\\sigma(X)$.",
            },
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
        {
          kind: 'exempleLibre',
          label: 'Démonstration — densité, espérance et variance de la loi uniforme sur [a ; b]',
          blocks: [
            {
              kind: 'para',
              text: "La densité est une constante $c$ sur $[a\\,;b]$ et son aire vaut 1 : $\\displaystyle\\int_a^b c\\,dt=c\\,(b-a)=1$, donc $c=\\dfrac{1}{b-a}$ — **aire totale sous une densité**.",
            },
            {
              kind: 'para',
              text: '$E(X)=\\displaystyle\\int_a^b \\dfrac{t}{b-a}\\,dt$ $=\\dfrac{1}{b-a}\\left[\\dfrac{t^2}{2}\\right]_a^b$ $=\\dfrac{b^2-a^2}{2(b-a)}$ $=\\dfrac{a+b}{2}$ — **primitive de** $t$**, puis** $b^2-a^2=(b-a)(b+a)$.',
            },
            {
              kind: 'para',
              text: '$E(X^2)=\\displaystyle\\int_a^b \\dfrac{t^2}{b-a}\\,dt$ $=\\dfrac{b^3-a^3}{3(b-a)}$ $=\\dfrac{a^2+ab+b^2}{3}$ — **même calcul**, avec $b^3-a^3=(b-a)(a^2+ab+b^2)$.',
            },
            {
              kind: 'para',
              text: '$V(X)=\\dfrac{a^2+ab+b^2}{3}-\\dfrac{(a+b)^2}{4}$ $=\\dfrac{4a^2+4ab+4b^2-3a^2-6ab-3b^2}{12}$ $=\\dfrac{a^2-2ab+b^2}{12}=\\dfrac{(b-a)^2}{12}$ — **formule de König**.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: "temps d'attente d'un bus toutes les 20 minutes",
          formula:
            "Un bus passe toutes les 20 minutes. Tu arrives à l'arrêt au hasard : ton temps d'attente $X$ (en minutes) suit la loi uniforme sur $[0\\,;20]$. Calcule la probabilité d'attendre au plus 5 minutes, puis plus de 12 minutes, ainsi que $E(X)$ et $\\sigma(X)$.",
          steps: [
            { tag: 'au plus 5 min', text: '$P(X\\leq5)=\\dfrac{5-0}{20-0}=0{,}25$' },
            { tag: 'plus de 12 min', text: '$P(X>12)=\\dfrac{20-12}{20}=0{,}4$' },
            { tag: 'espérance', text: '$E(X)=\\dfrac{0+20}{2}=10$ min' },
            { tag: 'écart-type', text: '$V(X)=\\dfrac{20^2}{12}=\\dfrac{100}{3}$, donc $\\sigma(X)=\\sqrt{\\dfrac{100}{3}}\\approx5{,}77$ min' },
          ],
          result: { tag: 'conclusion', text: '$0{,}25$ ; $0{,}4$ ; $E(X)=10$ min ; $\\sigma(X)\\approx5{,}77$ min.' },
        },
        {
          kind: 'exemple',
          badge: 'un intervalle qui déborde de [a ; b]',
          formula:
            "Un train arrive au hasard entre 7 h 10 et 7 h 30 : le nombre de minutes $X$ après 7 h suit la loi uniforme sur $[10\\,;30]$. Calcule $P(X\\leq15)$, puis la probabilité que le train arrive entre 7 h 20 et 7 h 40. Donne aussi $E(X)$.",
          steps: [
            { tag: 'longueur de [a ; b]', text: '$b-a=30-10=20$' },
            { tag: 'P(X ≤ 15)', text: '$P(10\\leq X\\leq15)=\\dfrac{15-10}{20}=0{,}25$ (rien avant 10)' },
            { tag: 'intervalle coupé', text: '$P(20\\leq X\\leq40)=P(20\\leq X\\leq30)$ $=\\dfrac{10}{20}$ $=0{,}5$ — au-delà de 30, la densité est nulle' },
            { tag: 'espérance', text: '$E(X)=\\dfrac{10+30}{2}=20$ (7 h 20)' },
          ],
          result: { tag: 'conclusion', text: '$0{,}25$ ; $0{,}5$ ; $E(X)=20$.' },
        },
        {
          kind: 'methode',
          label: 'Retrouver a et b à partir de E(X) et V(X)',
          items: [
            '$E(X)=\\dfrac{a+b}{2}$ donne $a+b=2E(X)$.',
            '$V(X)=\\dfrac{(b-a)^2}{12}$ donne $b-a=\\sqrt{12\\,V(X)}$ (positif, car $b>a$).',
            "On résout ce système. Exemple : $E(X)=8$ et $V(X)=3$ donnent $a+b=16$ et $b-a=\\sqrt{36}=6$, donc $a=5$ et $b=11$.",
          ],
        },
        {
          kind: 'piege',
          text: "La variance de la loi uniforme est $\\dfrac{(b-a)^2}{12}$, avec le **carré** : $\\dfrac{b-a}{12}$ n'a même pas la bonne unité (des minutes au lieu de minutes au carré). Et pour un intervalle qui déborde de $[a\\,;b]$, on coupe d'abord aux bornes : une probabilité ne dépasse jamais 1.",
        },
        {
          kind: 'entrainement',
          title: 'Loi uniforme continue',
          generatorId: '6gen115',
          description: [
            "Bus, livreur, panne sur un câble : densité, probabilité (même quand l'intervalle déborde), E(X), V(X) et σ(X) ; ou retrouve a et b à partir de E(X) et V(X).",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 115. Loi uniforme continue »',
        },
      ],
    },
    {
      id: 'loinormale',
      number: 6,
      title: 'Loi normale',
      kicker: 'Z = (X − μ) ÷ σ, puis la table : Φ(z) = P(Z ≤ z)',
      titreCourt: 'Loi normale',
      partie: 'Lois continues : des aires sous une courbe',
      essentiel: [
        '$X\\sim\\mathcal{N}(\\mu\\,;\\sigma)$ ($\\sigma$ = écart-type) se ramène à $Z=\\dfrac{X-\\mu}{\\sigma}\\sim\\mathcal{N}(0\\,;1)$, puis on lit $\\Phi(z)=P(Z\\leq z)$ dans la table.',
        "$\\Phi(-z)=1-\\Phi(z)$, $P(Z\\geq z)=1-\\Phi(z)$, $P(a\\leq Z\\leq b)=\\Phi(b)-\\Phi(a)$ ; à l'envers, $x=\\mu+z\\sigma$.",
        'Règle empirique : environ $68{,}3\\,\\%$, $95{,}4\\,\\%$ et $99{,}7\\,\\%$ dans $[\\mu-k\\sigma\\,;\\mu+k\\sigma]$ pour $k=1$, $2$, $3$.',
      ],
      cartes: [
        { question: '$X\\sim\\mathcal{N}(50\\,;10)$ : que vaut $P(X\\leq65)$ ?', reponse: '$z=1{,}5$, donc $\\Phi(1{,}5)\\approx0{,}9332$.' },
        { question: 'Que vaut $\\Phi(-1{,}5)$ ?', reponse: "$1-\\Phi(1{,}5)\\approx0{,}0668$ ($\\Phi$ n'est pas paire)." },
        { question: 'Quel $z$ vérifie $\\Phi(z)=0{,}95$ ?', reponse: 'Entre $1{,}64$ et $1{,}65$ (à égale distance) : $z\\approx1{,}645$.' },
        { question: "Quelle part d'une loi normale dépasse $\\mu+2\\sigma$ ?", reponse: 'Environ $2{,}3\\,\\%$ : la moitié des $4{,}6\\,\\%$ hors de $[\\mu-2\\sigma\\,;\\mu+2\\sigma]$.' },
      ],
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
        {
          kind: 'para',
          text: "Pour information (on ne calcule jamais d'intégrale de cette fonction à la main : c'est le rôle de la table), la densité de $\\mathcal{N}(\\mu\\,;\\sigma)$ est $f(x)=\\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$. Elle est maximale en $x=\\mu$, symétrique par rapport à la droite $x=\\mu$, et plus $\\sigma$ est grand, plus la cloche est basse et étalée (l'aire totale reste 1).",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: densiteNormale(0, 1), tone: 'accent' },
              { fn: densiteNormale(0, 2), tone: 'good' },
            ],
            xMin: -6,
            xMax: 6,
            xTicks: [-4, -2, 0, 2, 4],
            textLabels: [
              { x: 0.9, y: 0.36, text: 'σ = 1', tone: 'accent' },
              { x: 2.6, y: 0.14, text: 'σ = 2', tone: 'good' },
            ],
            fixedYRange: { min: 0, max: 0.45 },
            xAxisLabel: 'x',
            yAxisLabel: 'densité',
            caption:
              "Deux lois normales de même moyenne $\\mu=0$ : $\\mathcal{N}(0\\,;1)$ (orange) et $\\mathcal{N}(0\\,;2)$ (vert). Doubler $\\sigma$ étale la cloche deux fois plus et divise sa hauteur par 2 : l'aire sous chaque courbe vaut toujours 1.",
          },
        },
        {
          kind: 'historique',
          titre: 'Une courbe, trois savants',
          text:
            "La courbe en cloche apparaît d'abord chez **Abraham de Moivre**, en 1733 : il cherche à " +
            "calculer des probabilités binomiales pour un très grand nombre de lancers de pièce, et " +
            "découvre qu'elles suivent de près une courbe en cloche — la première approximation " +
            "normale de la binomiale, celle du § 7. **Carl Friedrich Gauss** la retrouve en 1809 en " +
            "étudiant les erreurs de mesure des astronomes : les erreurs se répartissent " +
            "symétriquement autour de la vraie valeur, les petites étant bien plus fréquentes que les " +
            "grandes — d'où le nom de « courbe de Gauss ». **Pierre-Simon de Laplace** montre ensuite, " +
            "dans sa Théorie analytique des probabilités (1812), qu'une somme de très nombreux " +
            "petits effets indépendants suit presque toujours cette loi : c'est ce qui explique " +
            "qu'on la rencontre partout, des tailles aux masses de sachets.",
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
              text: "**Énoncé.** Les résultats à un test suivent la loi $\\mathcal{N}(50\\,;10)$. À l'aide de la règle empirique, estime la proportion des candidats dont le score est en dehors de l'intervalle $[30\\,;70]$, puis celle des candidats qui dépassent 70.",
            },
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
          kind: 'atelier',
          tag: 'tchebychev-garantie-widget',
          label: 'Manipule toi-même : règle empirique et garantie de Tchebychev',
          caption:
            'Rappel de la 4e : pour n’importe quelle série, au moins (1 − 1/k²) × 100 % des valeurs ' +
            'sont dans [x̄ − kσ ; x̄ + kσ]. Choisis la série en cloche et k = 2 : 95 % des valeurs ' +
            'sont dans la bande, bien plus que les 75 % garantis et proche des 95,4 % de la règle ' +
            'empirique — qui ne vaut que pour une loi normale.',
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
          kind: 'exempleLibre',
          label: 'Démonstration — Z = (X − μ) ÷ σ a une espérance nulle et un écart-type 1',
          blocks: [
            {
              kind: 'para',
              text: "Soit $X$ d'espérance $\\mu$ et d'écart-type $\\sigma>0$. $Z=\\dfrac{X-\\mu}{\\sigma}=aX+b$ avec $a=\\dfrac{1}{\\sigma}$ et $b=-\\dfrac{\\mu}{\\sigma}$ — **une transformation affine de** $X$.",
            },
            {
              kind: 'para',
              text: '$E(Z)=a\\,E(X)+b=\\dfrac{\\mu}{\\sigma}-\\dfrac{\\mu}{\\sigma}=0$ — **espérance de** $aX+b$ **(§ 1)**.',
            },
            {
              kind: 'para',
              text: '$V(Z)=a^2\\,V(X)=\\dfrac{\\sigma^2}{\\sigma^2}=1$, donc $\\sigma(Z)=1$ — **variance de** $aX+b$ **(§ 1)**.',
            },
            {
              kind: 'para',
              text: "On admet qu'une transformation affine d'une variable normale est encore normale : si $X\\sim\\mathcal{N}(\\mu\\,;\\sigma)$, alors $Z\\sim\\mathcal{N}(0\\,;1)$, et une seule table suffit pour toutes les lois normales.",
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'deux-echelles-standardisation-widget',
          label: 'Manipule toi-même : deux échelles, x et z',
          caption:
            'Sous l’axe des x, une seconde graduation : z = (x − μ)/σ. Règle μ et σ : la cloche se ' +
            'déplace, s’élargit ou s’affine (la cloche 𝒩(50 ; 10) reste en pointillé), et la même ' +
            'aire est teintée sous la cloche de X et sous celle de Z. L’exemple du cours donne z = ' +
            '1,5 et Φ(1,5) ≈ 0,9332.',
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
        { kind: 'subheading', text: 'Lire la table de Φ' },
        {
          kind: 'methode',
          label: 'Lire la table de Φ',
          items: [
            "La table donne $\\Phi(z)=P(Z\\leq z)$ pour $z$ **positif**, de $0{,}00$ à $3{,}49$ : la **ligne** donne les unités et le dixième de $z$, la **colonne** son centième. Pour $\\Phi(1{,}23)$ : ligne $1{,}2$, colonne $0{,}03$, on lit $0{,}8907$.",
            "**Convention d'arrondi** : on arrondit d'abord $z$ au centième le plus proche ($z=1{,}234\\to1{,}23$) ; la table donne $\\Phi(z)$ à 4 décimales. Au-delà de $3{,}49$, $\\Phi(z)\\approx1$.",
            "$z$ **négatif** : la table ne le contient pas ; on utilise $\\Phi(-z)=1-\\Phi(z)$. Exemple : $\\Phi(-1{,}23)=1-0{,}8907=0{,}1093$.",
            "**À droite** et **entre deux bornes** : $P(Z\\geq z)=1-\\Phi(z)$ et $P(a\\leq Z\\leq b)=\\Phi(b)-\\Phi(a)$.",
            "**À l'envers** (on connaît $p=\\Phi(z)$, on cherche $z$) : on cherche dans le corps de la table la valeur **la plus proche** de $p$, et on lit $z$ en marge. Si $p$ tombe exactement entre deux cases ($0{,}95$ est à égale distance de $0{,}9495$ et $0{,}9505$), les deux valeurs $1{,}64$ et $1{,}65$ conviennent, et on prend souvent leur milieu, $1{,}645$. Si $p<0{,}5$, on cherche $1-p$, puis on change le signe de $z$.",
          ],
        },
        {
          kind: 'tablePhi',
          caption:
            "Table complète de la loi normale centrée réduite : $\\Phi(z)=P(Z\\leq z)$ pour $z$ de $0{,}00$ à $3{,}49$. Sur téléphone, elle défile de côté ; la colonne des $z$ reste visible.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — X ∼ 𝒩(50 ; 10) : P(X ≤ 65), P(X ≥ 65), P(X ≤ 35)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Les résultats à un test suivent la loi normale $\\mathcal{N}(50\\,;10)$. Calcule la probabilité qu'un candidat obtienne au plus 65 points, au moins 65 points, puis au plus 35 points.",
            },
            {
              kind: 'para',
              text: 'Standardisation : $z=\\dfrac{65-50}{10}=1{,}5$. Lecture dans la table (ligne $1{,}5$, colonne $0{,}00$) : $\\Phi(1{,}5)\\approx0{,}9332$, donc $P(X\\leq65)\\approx0{,}9332$.',
            },
            { kind: 'para', text: '« Au moins » est le complément de « au plus » : $P(X\\geq65)=1-\\Phi(1{,}5)$ $\\approx1-0{,}9332=0{,}0668$.' },
            {
              kind: 'para',
              text: 'Par symétrie $\\Phi(-z)=1-\\Phi(z)$ : $P(X\\leq35)=\\Phi(-1{,}5)$ $=1-\\Phi(1{,}5)\\approx0{,}0668$ — exactement la même valeur que $P(X\\geq65)$, logique puisque 35 et 65 sont symétriques autour de $\\mu=50$.',
            },
          ],
        },
        {
          kind: 'attention',
          label: "Φ n'est jamais paire",
          text: "$\\Phi(-1{,}5)$ n'est **pas** égal à $\\Phi(1{,}5)$ — $\\Phi$ n'est pas une fonction paire ! La vraie relation, c'est $\\Phi(-z)=1-\\Phi(z)$ (symétrie par rapport au point $(0\\,;0{,}5)$, pas par rapport à l'axe des ordonnées) : $\\Phi(-1{,}5)\\approx0{,}0668$, très différent de $\\Phi(1{,}5)\\approx0{,}9332$.",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — Φ(−z) = 1 − Φ(z) et P(−k ≤ Z ≤ k) = 2Φ(k) − 1',
          blocks: [
            {
              kind: 'para',
              text: "La densité $\\varphi$ de $\\mathcal{N}(0\\,;1)$ est symétrique par rapport à l'axe des ordonnées : $\\varphi(-t)=\\varphi(t)$. L'aire à gauche de $-z$ est donc égale à l'aire à droite de $z$ : $P(Z\\leq-z)=P(Z\\geq z)$ — **symétrie de la courbe en cloche**.",
            },
            {
              kind: 'para',
              text: '$P(Z\\geq z)=1-P(Z<z)=1-\\Phi(z)$, donc $\\Phi(-z)=1-\\Phi(z)$ — **événement contraire, et** $P(Z=z)=0$.',
            },
            {
              kind: 'para',
              text: '$P(-k\\leq Z\\leq k)=\\Phi(k)-\\Phi(-k)$ $=\\Phi(k)-[1-\\Phi(k)]$ $=2\\Phi(k)-1$ — **probabilité d\'un intervalle, puis résultat précédent**.',
            },
            {
              kind: 'para',
              text: "Avec la table : $2\\Phi(1)-1=0{,}6826$, $2\\Phi(2)-1=0{,}9544$, $2\\Phi(3)-1=0{,}9974$ — la règle empirique, aux arrondis de la table près.",
            },
          ],
        },
        {
          kind: 'para',
          text: "Pour un intervalle de la loi centrée réduite, on soustrait toujours deux valeurs de $\\Phi$ — jamais on ne les additionne (le résultat pourrait même dépasser 1, signal d'alerte immédiat !) :",
        },
        { kind: 'para', text: '$P(1\\leq Z\\leq2) = \\Phi(2)-\\Phi(1)$ $\\approx 0{,}9772-0{,}8413$ $= 0{,}1359$' },
        {
          kind: 'para',
          text: "Cas particulier à partir de 0 : pour $t>0$, $P(0\\leq Z\\leq t)=\\Phi(t)-\\Phi(0)=\\Phi(t)-0{,}5$, puisque la moitié de l'aire est à gauche de 0.",
        },
        {
          kind: 'exemple',
          badge: "effectif attendu dans une population",
          formula:
            "La taille $X$ (en cm) des 1 200 élèves d'une école suit la loi $\\mathcal{N}(170\\,;8)$. Combien d'élèves mesurent plus de 180 cm, environ ?",
          steps: [
            { tag: 'standardiser', text: '$z=\\dfrac{180-170}{8}=1{,}25$' },
            { tag: 'lire la table', text: '$P(X>180)=1-\\Phi(1{,}25)$ $=1-0{,}8944$ $=0{,}1056$' },
            { tag: 'effectif', text: '$1\\,200\\times0{,}1056=126{,}72$, arrondi à l\'unité : $127$' },
          ],
          result: { tag: 'conclusion', text: 'Environ 127 élèves (effectif attendu = effectif total × probabilité).' },
        },
        {
          kind: 'atelier',
          tag: 'table-phi-widget',
          label: 'Manipule toi-même : la table de Φ',
          caption:
            'Déplace z au centième : l’aire à gauche de z se teinte et sa case s’allume dans la table ' +
            '(ligne 1,2 et colonne 0,04 pour z = 1,24). Essaie aussi P(Z ≥ z), un intervalle P(a ≤ Z ' +
            '≤ b) avec des bornes négatives, et le sens inverse : on donne une probabilité, tu ' +
            'cherches la case la plus proche.',
        },
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
          label: 'Exemple résolu — z tel que Φ(z) = 0,95, puis le seuil des 5 % meilleurs',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Détermine $z$ tel que $\\Phi(z)=0{,}95$. Les résultats d'un test suivent la loi $\\mathcal{N}(50\\,;10)$ : à partir de quel score un candidat fait-il partie des 5 % meilleurs ?",
            },
            {
              kind: 'para',
              text: "Dans le corps de la table, $0{,}95$ se trouve entre $0{,}9495$ ($z=1{,}64$) et $0{,}9505$ ($z=1{,}65$), à égale distance : $z\\approx1{,}645$ (le quantile à 95 %, une valeur très utilisée).",
            },
            {
              kind: 'para',
              text: "Les 5 % meilleurs ont un score $x$ tel que $P(X\\leq x)=0{,}95$ : $x=\\mu+z\\times\\sigma=50+1{,}645\\times10\\approx66{,}5$ points.",
            },
            {
              kind: 'para',
              text: "Attention : $1-0{,}95=0{,}05$ est une **probabilité**, pas une valeur de $z$ — il faut absolument lire la table à l'envers pour convertir une probabilité en valeur de $z$ !",
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'P(0 ≤ Z ≤ t) = 0,4 : trouver t',
          formula: "Détermine le réel $t>0$ tel que $P(0\\leq Z\\leq t)=0{,}4$, pour $Z\\sim\\mathcal{N}(0\\,;1)$.",
          steps: [
            { tag: 'se ramener à Φ', text: '$\\Phi(t)-0{,}5=0{,}4$, donc $\\Phi(t)=0{,}9$' },
            { tag: 'table à l\'envers', text: '$0{,}8997$ ($t=1{,}28$) est plus proche de $0{,}9$ que $0{,}9015$ ($t=1{,}29$)' },
          ],
          result: { tag: 'conclusion', text: '$t\\approx1{,}28$.' },
        },
        { kind: 'subheading', text: 'Retrouver μ ou σ à partir d\'une proportion' },
        {
          kind: 'methode',
          label: 'Une proportion connue donne une équation',
          items: [
            "Traduis la proportion par $\\Phi(z)=p$ (passe au complément si la proportion porte sur « plus de »), lis $z$ dans la table, puis écris $x=\\mu+z\\,\\sigma$ : une équation à une inconnue, $\\mu$ ou $\\sigma$.",
            "Avec **deux** proportions connues, on obtient deux équations $x_1=\\mu+z_1\\sigma$ et $x_2=\\mu+z_2\\sigma$ : un système, qui donne $\\mu$ **et** $\\sigma$.",
            "Une valeur **sous** la moyenne correspond à un $z$ **négatif** : $x=\\mu+z\\sigma$ avec $z<0$, c'est-à-dire $x=\\mu-|z|\\,\\sigma$.",
          ],
        },
        {
          kind: 'exemple',
          badge: 'retrouver la moyenne μ',
          formula:
            "La taille d'adultes suit une loi normale d'écart-type $\\sigma=6$ cm, et 10 % d'entre eux mesurent plus de 185 cm. Détermine la moyenne $\\mu$.",
          steps: [
            { tag: 'traduire', text: '$P(X>185)=0{,}1$, donc $P(X\\leq185)=0{,}9$' },
            { tag: 'lire z', text: '$\\Phi(z)=0{,}9$ donne $z\\approx1{,}28$' },
            { tag: 'équation', text: '$185=\\mu+1{,}28\\times6$, donc $\\mu=185-7{,}68=177{,}32$' },
          ],
          result: { tag: 'conclusion', text: '$\\mu\\approx177{,}3$ cm.' },
        },
        {
          kind: 'exemple',
          badge: "retrouver l'écart-type σ",
          formula:
            "Une machine remplit des paquets de masse moyenne $\\mu=500$ g, selon une loi normale ; 2 % des paquets pèsent moins de 490 g. Détermine l'écart-type $\\sigma$.",
          steps: [
            { tag: 'traduire', text: '$P(X<490)=0{,}02$ : sous la moyenne, donc $z<0$' },
            { tag: 'lire z', text: '$\\Phi(-z)=0{,}98$ : $0{,}9798$ ($2{,}05$) est le plus proche, donc $z\\approx-2{,}05$' },
            { tag: 'équation', text: '$490=500-2{,}05\\,\\sigma$, donc $\\sigma=\\dfrac{10}{2{,}05}\\approx4{,}88$' },
          ],
          result: { tag: 'conclusion', text: '$\\sigma\\approx4{,}88$ g.' },
        },
        {
          kind: 'exemple',
          badge: 'deux proportions : retrouver μ et σ',
          formula:
            "Une variable $X$ suit une loi normale ; $P(X\\leq40)=0{,}1587$ et $P(X\\geq80)=0{,}0228$. Détermine $\\mu$ et $\\sigma$.",
          steps: [
            { tag: 'première proportion', text: '$\\Phi(z_1)=0{,}1587$ : $1-0{,}1587=0{,}8413=\\Phi(1)$, donc $z_1=-1$' },
            { tag: 'seconde proportion', text: '$\\Phi(z_2)=1-0{,}0228=0{,}9772=\\Phi(2)$, donc $z_2=2$' },
            { tag: 'système', text: '$40=\\mu-\\sigma$ et $80=\\mu+2\\sigma$ ; en soustrayant : $3\\sigma=40$' },
          ],
          result: { tag: 'conclusion', text: '$\\sigma=\\dfrac{40}{3}\\approx13{,}33$ et $\\mu=40+\\sigma\\approx53{,}33$.' },
        },
        {
          kind: 'piege',
          text: "Oublier le signe de $z$ sous la moyenne : avec $z=+2{,}05$, on obtiendrait $\\sigma=\\dfrac{490-500}{2{,}05}<0$, impossible pour un écart-type. Un $\\sigma$ négatif est le signal d'un $z$ pris du mauvais côté.",
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
          kind: 'application',
          titre: 'Régler une machine-outil : la tolérance et la règle empirique',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (u: number) => densiteNormale(0, 1)(u - 3.5), tone: 'accent' }],
              shadedRegions: [{ from: 1.5, to: 5.5, upper: (u: number) => densiteNormale(0, 1)(u - 3.5), tone: 'good' }],
              xMin: 0,
              xMax: 7,
              xTicks: [1.5, 3.5, 5.5],
              xTickLabels: { 1.5: '19,9', 3.5: '20', 5.5: '20,1' },
              textLabels: [{ x: 3.5, y: 0.13, text: '95,4 %', tone: 'good', anchor: 'middle' }],
              fixedYRange: { min: 0, max: 0.46 },
              xAxisLabel: 'mm',
              yAxisLabel: 'densité',
              caption:
                "Diamètre $X\\sim\\mathcal{N}(20\\,;0{,}05)$ en mm : la tolérance $[19{,}9\\,;20{,}1]$ vaut $[\\mu-2\\sigma\\,;\\mu+2\\sigma]$ et retient environ $95{,}4\\,\\%$ des pièces (zone verte).",
            },
          ],
          text:
            "Une machine tourne des axes de diamètre visé $20$ mm. Le diamètre réellement obtenu $X$ " +
            "varie d'une pièce à l'autre selon une loi normale, de moyenne $\\mu=20$ mm (la machine " +
            "est bien réglée) et d'écart-type $\\sigma=0{,}05$ mm (sa précision). Le client accepte " +
            "les pièces dont le diamètre est dans $[19{,}9\\,;20{,}1]$, soit $\\mu\\pm2\\sigma$ : la règle " +
            "empirique prévoit environ $95{,}4\\,\\%$ de pièces conformes, donc environ $4{,}6\\,\\%$ de " +
            "rebut. Pour descendre sous $0{,}3\\,\\%$ de rebut, il faudrait que la tolérance couvre " +
            "$\\mu\\pm3\\sigma$, c'est-à-dire une machine deux fois et demie plus précise (avec " +
            "$\\sigma\\approx0{,}033$ mm, $3\\sigma\\approx0{,}1$ mm). C'est tout le principe du contrôle " +
            "statistique de la production : on surveille $\\mu$ et $\\sigma$, pas chaque pièce.",
          domaines: ['Industrie', 'Contrôle qualité'],
        },
        {
          kind: 'entrainement',
          title: 'Loi normale',
          generatorId: '6gen51',
          description: ["Standardise, écris la probabilité avec Φ, lis la table (consultable à l'écran) dans les deux sens, et applique la règle empirique."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 51. Loi normale »',
        },
        {
          kind: 'entrainement',
          title: 'Lire la table de Φ',
          generatorId: '6gen116',
          description: [
            'Lis la vraie table de Φ : lecture directe, complément, symétrie pour un z négatif, aire entre deux bornes, et sens inverse avec la case la plus proche.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 116. Lire la table de Φ »',
        },
        {
          kind: 'entrainement',
          title: 'Courbe de Gauss : aires et règle empirique',
          generatorId: '6gen117',
          description: [
            "Associe une aire colorée sous la cloche à sa probabilité et à son écriture avec Φ, puis applique la règle empirique (68,3 %, 95,4 %, 99,7 %), y compris d'un seul côté.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 117. Courbe de Gauss : aires et règle empirique »',
        },
        {
          kind: 'entrainement',
          title: 'Loi normale : retrouver μ ou σ',
          generatorId: '6gen120',
          description: [
            "À partir d'une ou de deux proportions connues, lis z dans la table à l'envers (attention au signe) et retrouve l'écart-type, la moyenne, ou les deux par un système.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 120. Loi normale : retrouver μ ou σ »',
        },
      ],
    },
    {
      id: 'extensionsbayes',
      number: 7,
      title: 'Extensions : binomiale, normale et Bayes',
      kicker: 'P(Cⱼ | S) = P(Cⱼ) · P(S | Cⱼ) ÷ P(S) ; 𝓑(n ; p) ≈ 𝒩(np ; √(np(1 − p)))',
      titreCourt: 'Bayes et approximation normale',
      partie: 'Combiner, approcher, choisir',
      essentiel: [
        'Probabilités totales : $P(S)=\\sum P(C_i)\\,P(S\\mid C_i)$ ; Bayes : $P(C_j\\mid S)=\\dfrac{P(C_j)\\,P(S\\mid C_j)}{P(S)}$.',
        "Si $n>30$ et $0{,}3<p<0{,}7$, $\\mathcal{B}(n\\,;p)$ s'approche par $\\mathcal{N}(np\\,;\\sqrt{np(1-p)})$, avec la correction de continuité : $P(X\\leq k)\\approx\\Phi\\!\\left(\\dfrac{k+0{,}5-\\mu}{\\sigma}\\right)$.",
      ],
      cartes: [
        { question: 'Pourquoi multiplie-t-on $p_1\\times p_2$ pour deux épreuves indépendantes réussies ?', reponse: 'Un « ET » entre événements indépendants est un produit, jamais une somme.' },
        { question: 'Assurance : $P(S)=0{,}22$ et $P(C_3)\\,P(S\\mid C_3)=0{,}1$. Que vaut $P(C_3\\mid S)$ ?', reponse: '$\\dfrac{0{,}1}{0{,}22}\\approx0{,}4545$.' },
        { question: '$X\\sim\\mathcal{B}(100\\,;0{,}5)$ : quelle borne corrigée pour estimer $P(X\\leq55)$ ?', reponse: "$55{,}5$ : $z=\\dfrac{55{,}5-50}{5}=1{,}1$, d'où $\\Phi(1{,}1)\\approx0{,}8643$." },
      ],
      blocks: [
        { kind: 'video', title: 'Extensions : épreuves composées, Bayes, approximation normale', youtubeId: 'EdM_I4B6wnA' },
        {
          kind: 'para',
          text: 'Cette section combine ce que les sections précédentes ont établi : des **épreuves composées** (« trouver $n$ » avec une probabilité obtenue par un produit), le **théorème de Bayes** à 3 catégories, l\'**approximation** d\'une loi binomiale par une loi normale, et l\'espérance appliquée à une population entière.',
        },
        { kind: 'subheading', text: 'Épreuves composées — indépendance « ET »' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — un badge à deux épreuves indépendantes (p₁ = 0,5 et p₂ = 0,3)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Pour obtenir un badge, il faut réussir deux épreuves indépendantes, de probabilités de réussite $p_1=0{,}5$ et $p_2=0{,}3$. Calcule la probabilité d'obtenir le badge en une tentative, puis le nombre minimal $n$ de tentatives (indépendantes) pour que la probabilité de l'obtenir au moins une fois dépasse $0{,}8$.",
            },
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
          kind: 'atelier',
          tag: 'bayes-test-medical-widget',
          label: 'Manipule toi-même : Bayes à deux catégories (rappel)',
          caption:
            'Rappel du chapitre 6 avant de passer à trois catégories : règle la proportion de malades ' +
            'et les deux taux de tests positifs, puis compare « malade sachant que le test est ' +
            'positif » à « test positif sachant que la personne est malade ». Les fréquences ' +
            'naturelles sur 1 000 personnes suivent la formule des probabilités totales.',
        },
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
          kind: 'historique',
          titre: 'Un théorème publié par un ami',
          text:
            "Le pasteur anglais **Thomas Bayes** (vers 1701–1761) n'a jamais publié son théorème. " +
            "Après sa mort, son ami **Richard Price** retrouve le manuscrit, le complète et le présente " +
            "à la Royal Society de Londres en 1763, sous le titre An Essay towards solving a Problem " +
            "in the Doctrine of Chances. La question de Bayes était de remonter des effets observés " +
            "vers leurs causes probables — exactement ce que fait $P(C_j\\mid S)$. Laplace " +
            "redécouvre la formule de façon indépendante en 1774 et lui donne sa forme générale. Le " +
            "chapitre 6 l'a utilisée avec deux causes (un test médical) ; ici, elle en compte trois.",
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
              kind: 'para',
              text: "**Énoncé.** Une compagnie d'assurance classe ses clients en 3 catégories : $30\\,\\%$ à faible risque (probabilité de sinistre $0{,}10$), $45\\,\\%$ à risque moyen ($0{,}20$) et $25\\,\\%$ à haut risque ($0{,}40$). Calcule la probabilité qu'un client ait un sinistre, puis la probabilité qu'un client sinistré soit à haut risque.",
            },
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
          kind: 'exempleLibre',
          label: 'Démonstration — formule de Bayes à 3 catégories',
          blocks: [
            {
              kind: 'para',
              text: "$C_1$, $C_2$, $C_3$ forment une partition de la population : ils sont incompatibles deux à deux et leur réunion est la population entière, donc $S=(S\\cap C_1)\\cup(S\\cap C_2)\\cup(S\\cap C_3)$, réunion d'événements incompatibles — **partition**.",
            },
            {
              kind: 'para',
              text: '$P(S)=P(S\\cap C_1)+P(S\\cap C_2)$ $+\\,P(S\\cap C_3)$ et $P(S\\cap C_i)=P(C_i)\\,P(S\\mid C_i)$ — **probabilité d\'une réunion d\'événements incompatibles, puis définition d\'une probabilité conditionnelle (chapitre 6)**.',
            },
            {
              kind: 'para',
              text: 'Par définition, $P(C_j\\mid S)=\\dfrac{P(C_j\\cap S)}{P(S)}$ $=\\dfrac{P(C_j)\\,P(S\\mid C_j)}{\\sum_{i=1}^{3}P(C_i)\\,P(S\\mid C_i)}$ — **probabilité conditionnelle, avec le numérateur et le dénominateur ci-dessus**.',
            },
          ],
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
          label: 'Exemple résolu — 100 lancers d\'une pièce : approcher P(X ≤ 55)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** On lance 100 fois une pièce équilibrée ; $X$ compte les « pile », donc $X\\sim\\mathcal{B}(100\\,;0{,}5)$. Vérifie que l'on peut approcher $X$ par une loi normale, détermine ses paramètres, puis estime $P(X\\leq55)$.",
            },
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
          kind: 'atelier',
          tag: 'binomiale-vers-normale-widget',
          label: 'Manipule toi-même : de la binomiale à la normale',
          caption:
            'Règle n, p et k : l’histogramme de 𝓑(n ; p) se superpose à la cloche de 𝒩(np ; √(np(1 − ' +
            'p))). Compare la probabilité exacte aux deux approximations : sans correction (borne k) ' +
            'et avec correction de continuité (borne k ± 0,5, car la barre k va de k − 0,5 à k + ' +
            '0,5). La loupe agrandit autour de k ; les conditions du cours s’allument en vert ou en ' +
            'rouge.',
        },
        {
          kind: 'attention',
          label: 'Deux approximations de la binomiale, deux régimes',
          text: "L'approximation par une loi de Poisson (§ 8 : $n\\geq30$, $p\\leq0{,}1$, $np\\leq15$) sert pour un $p$ proche de 0 (événement rare) ; l'approximation par une loi normale ($n>30$, $0{,}3<p<0{,}7$) sert pour un $p$ plus central. Avec les conventions de ce cours, un $p$ intermédiaire comme $p=0{,}2$ ne rentre dans aucune des deux : on calcule alors avec la binomiale exacte (calculatrice). En pratique, pour un très grand $n$ (par exemple $n=1000$, $p=0{,}2$), l'approximation normale reste excellente : les conditions du cours sont prudentes, pas des lois de la nature.",
        },
        { kind: 'subheading', text: 'La correction de continuité' },
        {
          kind: 'intuition',
          label: 'Pourquoi ± 0,5 ?',
          text: "Dans le diagramme en barres d'une loi binomiale, la barre de $k$ occupe l'intervalle $[k-0{,}5\\,;k+0{,}5]$ : sa largeur vaut 1 et son aire vaut $P(X=k)$. La courbe normale, elle, donne des **aires** sur un axe continu. Pour que les deux parlent de la même chose, on remplace chaque valeur entière $k$ par sa barre entière : « $X\\leq55$ » devient « jusqu'à $55{,}5$ », « $X\\geq60$ » devient « à partir de $59{,}5$ ».",
        },
        {
          kind: 'featureTable',
          caption: 'Correction de continuité : X ∼ 𝓑(n ; p) approchée par 𝒩(μ ; σ), μ = np, σ = √(np(1 − p))',
          headers: ['Événement (binomiale)', 'Intervalle corrigé', 'Approximation'],
          rows: [
            ['$X\\leq k$', '$x\\leq k+0{,}5$', '$\\Phi\\!\\left(\\dfrac{k+0{,}5-\\mu}{\\sigma}\\right)$'],
            ['$X\\geq k$', '$x\\geq k-0{,}5$', '$1-\\Phi\\!\\left(\\dfrac{k-0{,}5-\\mu}{\\sigma}\\right)$'],
            ['$X=k$', '$k-0{,}5\\leq x\\leq k+0{,}5$', '$\\Phi\\!\\left(\\dfrac{k+0{,}5-\\mu}{\\sigma}\\right)-\\Phi\\!\\left(\\dfrac{k-0{,}5-\\mu}{\\sigma}\\right)$'],
            ['$a\\leq X\\leq b$', '$a-0{,}5\\leq x\\leq b+0{,}5$', '$\\Phi\\!\\left(\\dfrac{b+0{,}5-\\mu}{\\sigma}\\right)-\\Phi\\!\\left(\\dfrac{a-0{,}5-\\mu}{\\sigma}\\right)$'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'au moins 60 « pile », puis exactement 50, sur 100 lancers',
          formula:
            "Avec la même pièce ($X\\sim\\mathcal{B}(100\\,;0{,}5)$, $\\mu=50$, $\\sigma=5$), estime $P(X\\geq60)$ et $P(X=50)$ par l'approximation normale avec correction de continuité.",
          steps: [
            { tag: 'au moins 60', text: '$P(X\\geq60)\\approx1-\\Phi\\!\\left(\\dfrac{59{,}5-50}{5}\\right)$ $=1-\\Phi(1{,}9)$ $=1-0{,}9713=0{,}0287$' },
            { tag: 'exactement 50', text: '$P(X=50)\\approx\\Phi(0{,}1)-\\Phi(-0{,}1)$ $=2\\Phi(0{,}1)-1$ $=2\\times0{,}5398-1=0{,}0796$' },
            { tag: 'contrôle', text: 'Valeurs exactes (calculatrice) : $0{,}0284$ et $0{,}0796$' },
          ],
          result: { tag: 'conclusion', text: '$P(X\\geq60)\\approx0{,}0287$ et $P(X=50)\\approx0{,}0796$.' },
        },
        {
          kind: 'piege',
          text: "Sans correction, $P(X=50)$ serait estimée par l'aire sous la courbe **au point** 50, c'est-à-dire 0 — absurde. Et attention au sens : pour « au moins $k$ », on **retire** $0{,}5$ ($k-0{,}5$) ; pour « au plus $k$ », on **ajoute** $0{,}5$ ($k+0{,}5$). Pour « strictement plus de $k$ », c'est « au moins $k+1$ » : on part de $k+0{,}5$.",
        },
        { kind: 'subheading', text: "Reconstruire une loi et appliquer l'espérance à une population" },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — offre à 3 formules : prix moyen et recette sur 500 clients',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Une entreprise propose 3 formules d'abonnement : Basique à 15 € ($20\\,\\%$ des clients), Standard à 35 € ($30\\,\\%$) et Premium à 60 € (les autres clients). Calcule le prix moyen payé par un client, puis la recette attendue pour 500 clients.",
            },
            {
              kind: 'para',
              text: 'Le 3ᵉ pourcentage se déduit par différence : $100-20-30=50\\,\\%$ pour la Premium.',
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
          kind: 'application',
          titre: "La marge d'erreur d'un sondage",
          text:
            "Avant une élection, un institut interroge $n=400$ personnes tirées au hasard. Si, dans " +
            "toute la population, exactement la moitié des électeurs soutient un candidat ($p=0{,}5$), " +
            "le nombre $X$ de soutiens dans l'échantillon suit la loi $\\mathcal{B}(400\\,;0{,}5)$, que " +
            "l'on approche par $\\mathcal{N}(200\\,;10)$ ($\\mu=np=200$, $\\sigma=\\sqrt{400\\times0{,}25}=10$). " +
            "Le sondage pourrait-il annoncer 55 % de soutiens, ou plus, par simple hasard ? " +
            "$P(X\\geq220)\\approx1-\\Phi\\!\\left(\\dfrac{219{,}5-200}{10}\\right)$ $=1-\\Phi(1{,}95)$ $=0{,}0256$ : " +
            "environ une chance sur 40. Par la règle empirique, le pourcentage observé tombe dans " +
            "$[50-5\\,;50+5]$ (soit $\\mu\\pm2\\sigma$, en pour cent de 400) environ 95 fois sur 100 : c'est la " +
            "« marge d'erreur de 5 points » annoncée pour un sondage de 400 personnes. Pour la diviser " +
            "par 2, il faut interroger 4 fois plus de monde, car la marge, en pour cent, varie comme $\\dfrac{1}{\\sqrt{n}}$.",
          domaines: ['Sondages', 'Sciences politiques'],
        },
        {
          kind: 'entrainement',
          title: 'Extensions binomiale, normale et Bayes',
          generatorId: '6gen52',
          description: ["Épreuves composées et « trouver n », théorème de Bayes à trois catégories, loi reconstruite et espérance appliquée."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 52. Extensions binomiale, normale et Bayes »',
        },
        {
          kind: 'entrainement',
          title: 'Approximation normale avec correction de continuité',
          generatorId: '6gen118',
          description: [
            "Vérifie d'abord si les conditions du cours permettent l'approximation ; si oui, calcule μ et σ, corrige les bornes d'une demi-unité, standardise et lis la table ; sinon, calcule avec la loi binomiale.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 118. Approximation normale avec correction de continuité »',
        },
      ],
    },
    {
      id: 'loipoisson',
      number: 8,
      title: 'Loi de Poisson',
      kicker: 'P(X = k) = e⁻λ · λᵏ ÷ k! ; E(X) = V(X) = λ',
      titreCourt: 'Loi de Poisson et choix du modèle',
      partie: 'Combiner, approcher, choisir',
      essentiel: [
        'La loi de Poisson compte des événements indépendants sur un intervalle, à taux moyen $\\lambda$ : $P(X=k)=e^{-\\lambda}\\dfrac{\\lambda^k}{k!}$, et $E(X)=V(X)=\\lambda$.',
        "$\\lambda$ s'ajuste toujours à l'échelle de la question ; si $n\\geq30$, $p\\leq0{,}1$ et $np\\leq15$, $\\mathcal{B}(n\\,;p)$ s'approche par la loi de Poisson de paramètre $\\lambda=np$.",
        'Pour choisir une loi : compter ou mesurer, avec ou sans remise, des épreuves ou un intervalle.',
      ],
      cartes: [
        { question: '5 voitures par minute : quel $\\lambda$ pour 15 minutes ?', reponse: '$\\lambda=5\\times15=75$.' },
        { question: '$\\lambda=4$ : comment obtenir $P(X=1)$ à partir de $P(X=0)$ ?', reponse: '$P(X=1)=P(X=0)\\times\\dfrac{4}{1}$.' },
        { question: '$P(X=0)=0{,}135$ pour une loi de Poisson : que vaut $\\lambda$ ?', reponse: '$\\lambda=-\\ln(0{,}135)\\approx2$.' },
        { question: 'Tirages sans remise dans une petite population : quelle loi ?', reponse: 'La loi hypergéométrique (pas la binomiale).' },
      ],
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
        {
          kind: 'exempleLibre',
          label: 'Démonstration — P(X = k) = P(X = k − 1) × λ/k, et la valeur la plus probable',
          blocks: [
            {
              kind: 'para',
              text: 'Pour $k\\geq1$ : $\\dfrac{P(X=k)}{P(X=k-1)}=\\dfrac{e^{-\\lambda}\\lambda^k/k!}{e^{-\\lambda}\\lambda^{k-1}/(k-1)!}$ $=\\lambda\\times\\dfrac{(k-1)!}{k!}=\\dfrac{\\lambda}{k}$ — **formule de Poisson, puis** $k!=k\\times(k-1)!$.',
            },
            {
              kind: 'para',
              text: "Donc $P(X=k)=P(X=k-1)\\times\\dfrac{\\lambda}{k}$ : c'est la méthode de proche en proche ci-dessus.",
            },
            {
              kind: 'para',
              text: '$P(X=k)\\geq P(X=k-1)\\iff\\dfrac{\\lambda}{k}\\geq1$ $\\iff k\\leq\\lambda$ — **les probabilités sont strictement positives**.',
            },
            {
              kind: 'para',
              text: "Les probabilités augmentent tant que $k\\leq\\lambda$, puis diminuent : la valeur la plus probable est le plus grand entier $k\\leq\\lambda$. Si $\\lambda$ est entier, $P(X=\\lambda)=P(X=\\lambda-1)$ : deux valeurs sont les plus probables (pour $\\lambda=4$ : $k=3$ et $k=4$, les deux barres égales de la figure plus bas).",
            },
          ],
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
          label: 'Exemple résolu — approcher 𝓑(50 ; 0,08) par une loi de Poisson',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Dans une production, $8\\,\\%$ des pièces sont défectueuses. On prélève 50 pièces (assez peu pour considérer les tirages indépendants) ; $X$ compte les pièces défectueuses. Vérifie que l'on peut approcher la loi de $X$ par une loi de Poisson, et donne son paramètre.",
            },
            {
              kind: 'para',
              text: '$n=50\\geq30$ ✓ ; $p=0{,}08\\leq0{,}1$ ✓ ; $n\\times p=4\\leq15$ ✓ — les 3 conditions sont réunies, donc $\\lambda=n\\times p=4$.',
            },
            {
              kind: 'para',
              text: "Contrôle : $P(X\\leq1)$ vaut exactement $0{,}0827$ avec la loi binomiale, et environ $0{,}0916$ avec la loi de Poisson (tableau ci-dessous) — un écart de moins d'un point.",
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
          label: 'Exemple résolu — au plus 1 appel, au moins 2 appels (λ = 4)',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Un standard reçoit en moyenne 4 appels par minute ; le nombre $X$ d'appels en une minute suit la loi de Poisson de paramètre $\\lambda=4$. Calcule $P(X\\leq1)$, puis $P(X\\geq2)$.",
            },
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
          label: 'Exemple résolu — ajuster λ au temps, puis à l\'effectif',
          blocks: [
            {
              kind: 'para',
              text: "**Énoncé.** Un péage voit passer en moyenne 5 voitures par minute : quel est le paramètre $\\lambda$ du nombre de voitures en 15 minutes ? Une usine compte en moyenne 3 pièces défectueuses pour 1 000 produites : quel est le paramètre $\\lambda$ du nombre de pièces défectueuses dans un lot de 500 pièces ?",
            },
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
          kind: 'exempleLibre',
          label: 'Démonstration — (1 − λ/n)ⁿ tend vers exp(−λ) : l\'origine du facteur exponentiel',
          blocks: [
            {
              kind: 'para',
              text: "Pour $X\\sim\\mathcal{B}(n\\,;p)$ avec $np=\\lambda$, $P(X=0)=(1-p)^n=\\left(1-\\dfrac{\\lambda}{n}\\right)^n$. On montre que cette quantité tend vers $e^{-\\lambda}=P(X=0)$ pour la loi de Poisson quand $n\\to+\\infty$.",
            },
            {
              kind: 'para',
              text: "Pour $n>\\lambda$ : $\\ln\\left(1-\\dfrac{\\lambda}{n}\\right)^n=n\\ln\\left(1-\\dfrac{\\lambda}{n}\\right)$. On pose $h=-\\dfrac{\\lambda}{n}$, qui tend vers 0 : $n\\ln(1+h)=-\\lambda\\times\\dfrac{\\ln(1+h)}{h}$ — **car** $n=-\\dfrac{\\lambda}{h}$.",
            },
            {
              kind: 'para',
              text: '$\\dfrac{\\ln(1+h)-\\ln 1}{h}$ tend vers $\\ln^{\\prime}(1)=1$ quand $h\\to0$ — **définition du nombre dérivé de** $\\ln$ **en 1**.',
            },
            {
              kind: 'para',
              text: "Donc $n\\ln\\left(1-\\dfrac{\\lambda}{n}\\right)\\to-\\lambda$, et, la fonction exponentielle étant continue, $\\left(1-\\dfrac{\\lambda}{n}\\right)^n=e^{\\,n\\ln(1-\\lambda/n)}\\to e^{-\\lambda}$.",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — E(X) = λ pour une loi de Poisson',
          blocks: [
            {
              kind: 'para',
              text: "On admet que $\\displaystyle\\sum_{j=0}^{+\\infty}\\dfrac{\\lambda^j}{j!}=e^{\\lambda}$ (c'est ce qui garantit que les probabilités de Poisson ont une somme égale à 1).",
            },
            {
              kind: 'para',
              text: '$E(X)=\\displaystyle\\sum_{k=0}^{+\\infty}k\\,e^{-\\lambda}\\dfrac{\\lambda^k}{k!}=e^{-\\lambda}\\sum_{k=1}^{+\\infty}\\dfrac{\\lambda^k}{(k-1)!}$ — **le terme** $k=0$ **est nul, et** $\\dfrac{k}{k!}=\\dfrac{1}{(k-1)!}$.',
            },
            {
              kind: 'para',
              text: '$=\\lambda\\,e^{-\\lambda}\\displaystyle\\sum_{j=0}^{+\\infty}\\dfrac{\\lambda^j}{j!}=\\lambda\\,e^{-\\lambda}\\,e^{\\lambda}=\\lambda$ — **on sort un facteur** $\\lambda$ **et on pose** $j=k-1$.',
            },
          ],
        },
        { kind: 'subheading', text: 'Retrouver λ, la valeur la plus probable et un seuil d\'alerte' },
        {
          kind: 'methode',
          label: 'Trois questions classiques sur une loi de Poisson',
          items: [
            "**λ inconnu** : une donnée sur $P(X=0)$ donne $e^{-\\lambda}=P(X=0)$, donc $\\lambda=-\\ln P(X=0)$. Une égalité comme $P(X=1)=P(X=2)$ donne $\\lambda e^{-\\lambda}=\\dfrac{\\lambda^2}{2}e^{-\\lambda}$, donc $\\lambda=2$. Et si l'on connaît la variance ou l'écart-type : $\\lambda=V(X)=\\sigma(X)^2$.",
            "**Valeur la plus probable** : le plus grand entier $k\\leq\\lambda$ (deux valeurs, $\\lambda-1$ et $\\lambda$, si $\\lambda$ est entier).",
            "**Seuil d'alerte** : le plus petit $k$ tel que $P(X\\geq k)$ soit inférieure au risque choisi (souvent 5 %) ; on calcule $P(X\\geq k)=1-P(X\\leq k-1)$ en cumulant de proche en proche.",
          ],
        },
        {
          kind: 'exemple',
          badge: "λ inconnu, puis le seuil d'alerte (λ = 2)",
          formula:
            "Dans une région, la probabilité qu'aucun cas d'une maladie rare ne soit signalé un mois donné vaut $0{,}135$. Le nombre $X$ de cas par mois suit une loi de Poisson. Détermine $\\lambda$, la valeur la plus probable de $X$, puis le plus petit nombre de cas $k$ tel que $P(X\\geq k)<0{,}05$ (seuil d'alerte).",
          steps: [
            { tag: 'λ', text: '$e^{-\\lambda}=0{,}135$, donc $\\lambda=-\\ln(0{,}135)\\approx2{,}00$ : $\\lambda=2$' },
            { tag: 'valeur la plus probable', text: '$\\lambda=2$ est entier : $k=1$ et $k=2$ ($P(X=1)=P(X=2)\\approx0{,}2707$)' },
            { tag: 'cumuls', text: '$P(X\\leq4)\\approx0{,}9473$ et $P(X\\leq5)\\approx0{,}9834$' },
            { tag: 'seuil', text: '$P(X\\geq5)\\approx1-0{,}9473$ $=0{,}0527\\geq0{,}05$, mais $P(X\\geq6)\\approx1-0{,}9834$ $=0{,}0166<0{,}05$' },
          ],
          result: { tag: 'conclusion', text: '$\\lambda=2$ ; valeurs les plus probables 1 et 2 ; alerte à partir de 6 cas dans le mois.' },
        },
        {
          kind: 'piege',
          text: "Le paramètre trouvé vaut pour l'intervalle de la donnée : un $\\lambda$ calculé par mois doit encore être ajusté (× 12) pour une question qui porte sur une année. Et l'écart-type d'une loi de Poisson est $\\sqrt{\\lambda}$, pas $\\lambda$.",
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
        { kind: 'subheading', text: 'Choisir le bon modèle' },
        {
          kind: 'para',
          text: "Tu connais maintenant cinq lois. Devant un énoncé, la première question n'est pas « quelle formule ? » mais « **quelle situation ?** » : ce que compte ou mesure la variable, et comment l'expérience se déroule.",
        },
        {
          kind: 'featureTable',
          headers: ['Loi', 'Situation typique', 'Paramètres', 'Indices dans l\'énoncé'],
          rows: [
            ['Binomiale $\\mathcal{B}(n\\,;p)$', '$n$ épreuves identiques et indépendantes ; $X$ compte les succès', '$n$, $p$', '« avec remise », « chaque … indépendamment », $n$ fixé'],
            ['Hypergéométrique', '$n$ tirages **sans remise** dans une population de $N$ éléments dont $K$ succès', '$N$, $K$, $n$', '« sans remise », population petite et connue'],
            ['Poisson', 'nombre d\'événements sur un intervalle (temps, longueur, effectif), à taux moyen constant', '$\\lambda$', '« en moyenne … par minute / par lot », pas de maximum'],
            ['Uniforme continue', 'une valeur **au hasard** dans un intervalle, aucune zone privilégiée', '$a$, $b$', '« au hasard entre … et … »'],
            ['Normale $\\mathcal{N}(\\mu\\,;\\sigma)$', 'une mesure qui se répartit en cloche autour d\'une moyenne', '$\\mu$, $\\sigma$', 'moyenne et écart-type donnés, tailles, masses, erreurs'],
          ],
        },
        {
          kind: 'methode',
          label: 'Trois questions pour choisir',
          items: [
            "La variable **compte**-t-elle (discrète) ou **mesure**-t-elle (continue) ? (§ 4)",
            "Si elle compte des succès sur des épreuves : le nombre d'épreuves est-il fixé, et la probabilité reste-t-elle la même d'une épreuve à l'autre (binomiale) ou change-t-elle parce qu'on tire sans remise (hypergéométrique) ? Si elle compte des événements sur un intervalle, sans nombre d'épreuves : Poisson.",
            "Si elle mesure : toutes les valeurs d'un intervalle également probables (uniforme), ou concentration autour d'une moyenne (normale) ?",
          ],
        },
        {
          kind: 'piege',
          text: "Aucune loi du chapitre ne convient toujours : si la probabilité change d'une épreuve à l'autre sans que ce soit un tirage sans remise (un joueur qui progresse à chaque essai, par exemple), ce n'est ni binomial ni hypergéométrique. On construit alors la loi « à la main », avec un arbre (chapitre 6) et le § 1. Et une approximation (normale ou Poisson) remplace une binomiale **seulement** quand ses conditions sont vérifiées.",
        },
        {
          kind: 'entrainement',
          title: 'Loi de Poisson',
          generatorId: '6gen53',
          description: ["Juge si l'approximation binomiale→Poisson est permise, ajuste λ à l'échelle de la question et calcule des probabilités de Poisson."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 53. Loi de Poisson »',
        },
        {
          kind: 'entrainement',
          title: "Poisson : λ inconnu, valeur la plus probable, seuil d'alerte",
          generatorId: '6gen121',
          description: [
            "Retrouve λ à partir de P(X = 0) ou d'une relation entre deux probabilités, ajuste-le à l'échelle de la question, trouve la valeur la plus probable et un seuil d'alerte.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 121. Poisson : λ inconnu, valeur la plus probable, seuil d'alerte »",
        },
        {
          kind: 'entrainement',
          title: 'Choisir le modèle',
          generatorId: '6gen119',
          description: [
            'Lis la situation et choisis la loi : binomiale, hypergéométrique, Poisson, normale, uniforme continue, ou aucune ; donne ses paramètres et calcule une probabilité.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 119. Choisir le modèle »',
        },
        {
          kind: 'entrainement',
          title: "Détective d'erreurs : variables aléatoires",
          generatorId: '6gen122',
          description: [
            "Trouve la ligne fausse dans la copie d'un élève (moyenne non pondérée, σ = V², Φ(−z) = Φ(z), règle empirique d'un seul côté, λ non ajusté, mauvais contraire, variance uniforme, Cₙᵏ oublié, correction de continuité), explique l'erreur et corrige.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 122. Détective d'erreurs : variables aléatoires »",
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
          { text: '$E(aX+b)=a\\,E(X)+b$ ; $V(aX+b)=a^2\\,V(X)$', condition: '$\\sigma(aX+b)=|a|\\,\\sigma(X)$' },
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
          { text: '$a+b=2E(X)$ ; $b-a=\\sqrt{12\\,V(X)}$', condition: 'retrouver $a$ et $b$' },
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
          { text: '$P(-k \\le Z \\le k) = 2\\Phi(k)-1$' },
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
            text: '$P(X\\ge k) \\approx 1-\\Phi\\!\\left(\\dfrac{k-0{,}5-\\mu}{\\sigma}\\right)$',
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
          { text: '$\\lambda=-\\ln P(X=0)$', condition: '$\\lambda$ inconnu' },
          { text: 'valeur la plus probable : le plus grand entier $k\\le\\lambda$' },
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
        ['Transformer : $Y=aX+b$', '$E(Y)=aE(X)+b$ ; $V(Y)=a^2V(X)$ ; $\\sigma(Y)=|a|\\,\\sigma(X)$'],
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
        ['Table de $\\Phi$', '$z$ arrondi au centième ; à l\'envers : la case la plus proche ; $x=\\mu+z\\sigma$'],
        ['Règle empirique', '$68{,}3\\,\\%$ / $95{,}4\\,\\%$ / $99{,}7\\,\\%$ pour $k=1$, $2$, $3$ écarts-types'],
        ['Vérifier la normalité', '$\\text{moyenne} \\approx \\text{mode} \\approx \\text{médiane}$, et répartition $68{,}3$ / $95{,}4$ / $99{,}7\\,\\%$ — critère pratique, jamais une preuve'],
        ['Bayes à 3 catégories', '$P(C_j\\mid S)=\\dfrac{P(C_j)\\,P(S\\mid C_j)}{P(S)}$'],
        ['Approximation binomiale → normale', '$n>30$, $0{,}3<p<0{,}7$ : $\\mu=np$, $\\sigma=\\sqrt{np(1-p)}$, avec correction de continuité $k\\pm0{,}5$'],
        ['Loi de Poisson', '$P(X=k)=\\dfrac{e^{-\\lambda}\\lambda^k}{k!}$ ; $E(X)=V(X)=\\lambda$'],
        ['Approximation binomiale → Poisson', '$n\\geq30$, $p\\leq0{,}1$, $np\\leq15$ : $\\lambda=np$'],
        ['Choisir le modèle', 'compter ou mesurer ; avec ou sans remise ; épreuves ou intervalle ; uniforme ou en cloche'],
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
