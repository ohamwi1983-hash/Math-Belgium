import type { ChapterContent } from '../../types'

const poisson = (lambda: number, k: number) => {
  let p = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) p *= lambda / i
  return p
}

export const variablesAleatoires: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 8,
  title: 'Variables aléatoires et lois de probabilités',
  slug: 'variables-aleatoires',
  lede:
    "Combien un jeu rapporte-t-il en moyenne ? À partir de combien d'épreuves un événement rare devient-il presque certain ? Quelle proportion d'une population se situe dans un intervalle donné ? Ce chapitre construit les outils pour répondre : variable aléatoire discrète et espérance, loi binomiale, loi normale — première loi continue de la plateforme, lue via une table de la fonction de répartition Φ — un générateur de clôture qui combine binomiale, normale et théorème de Bayes, puis la loi de Poisson pour les événements rares.",
  sections: [
    {
      id: 'variablesdiscretes',
      number: 1,
      title: 'Variables aléatoires discrètes et espérance',
      blocks: [
        {
          kind: 'definition',
          label: 'Variable aléatoire discrète et loi de probabilité',
          items: [
            "Une **variable aléatoire discrète** $X$ associe à chaque issue d'une expérience une valeur numérique parmi un ensemble fini $\\{x_1,\\ldots,x_n\\}$. Sa **loi de probabilité** donne $P(X=x_i)$ pour chaque valeur, avec la contrainte $\\sum P(X=x_i) = 1$ — jamais plus, jamais moins.",
          ],
        },
        {
          kind: 'definition',
          label: 'Espérance E(X)',
          items: [
            "L'**espérance** $E(X)$ est la valeur moyenne de $X$, pondérée par les probabilités — jamais une simple moyenne arithmétique des valeurs possibles :",
            '$E(X) = \\displaystyle\\sum_{i=1}^{n} x_i\\times P(X=x_i)$',
          ],
        },
        {
          kind: 'definition',
          label: 'Variance V(X) et écart-type σ(X)',
          items: [
            'La **variance** $V(X)$ mesure la dispersion de $X$ autour de son espérance — la moyenne, pondérée par les probabilités, des écarts à $E(X)$ mis au carré :',
            '$V(X) = \\displaystyle\\sum_{i=1}^{n} P(X=x_i)\\times[x_i-E(X)]^2 = E(X^2)-[E(X)]^2$',
            "L'**écart-type** $\\sigma(X) = \\sqrt{V(X)}$ se mesure dans la même unité que $X$ — contrairement à $V(X)$, qui porte cette unité au carré.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — construire la loi, calculer E(X), V(X) et σ(X)',
          blocks: [
            {
              kind: 'para',
              text: "$X\\in\\{2,3,4,5,6\\}$, avec $P=(0,15\\,;\\,0,25\\,;\\,0,30\\,;\\,0,20\\,;\\,0,10)$. Vérification préalable : $0,15+0,25+0,30+0,20+0,10=1,00$ — c'est bien une loi de probabilité valide.",
            },
            {
              kind: 'featureTable',
              headers: ['x', 'P(X=x)', 'x×P(X=x)'],
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
                yAxisLabel: 'P(X=x)',
                footnote: "E(X) = 3,85 — ne tombe SUR AUCUNE des 5 valeurs possibles",
                caption:
                  "La loi de probabilité de X, en barres — E(X)=3,85 ne tombe sur aucune des 5 valeurs possibles, ce qui est normal : l'espérance est une moyenne pondérée, pas nécessairement une valeur observable.",
              },
            },
            {
              kind: 'para',
              text: "Pour cette même loi, additionner simplement les 5 valeurs puis diviser par 5 donnerait $(2+3+4+5+6)/5=4$ — une moyenne qui ignore les probabilités, donc fausse dès que la loi n'est pas uniforme. L'espérance correcte, $3,85$, penche vers les valeurs 3 et 4 qui portent le plus de poids ($0,25$ et $0,30$).",
            },
            {
              kind: 'para',
              text: 'Écart de chaque valeur à $E(X)=3,85$, mis au carré et pondéré par sa probabilité :',
            },
            {
              kind: 'para',
              text: '$V(X) = 0,15\\times(2-3,85)^2+0,25\\times(3-3,85)^2+0,30\\times(4-3,85)^2+0,20\\times(5-3,85)^2+0,10\\times(6-3,85)^2 = 1,4275$',
            },
            { kind: 'para', text: '$\\sigma(X) = \\sqrt{1,4275} \\approx 1,195$' },
          ],
        },
        {
          kind: 'attention',
          label: 'Oublier de pondérer par la probabilité',
          text: "Calculer une moyenne simple des 5 écarts au carré, $(3,4225+0,7225+0,0225+1,3225+4,6225)/5\\approx2,0225$, ignore que les probabilités ne sont pas égales — exactement le même piège que pour l'espérance. La variance pondère chaque écart au carré par $P(X=x_i)$, donnant $1,4275$, jamais une moyenne arithmétique simple.",
        },
        { kind: 'subheading', text: 'Le piège des événements « au moins » / « au plus »' },
        {
          kind: 'para',
          text: "Deux événements sont **contraires** si et seulement si (1) leur intersection est vide et (2) leur union couvre toutes les valeurs possibles. Pour la loi ci-dessus : « $X\\leq3$ » (valeurs 2, 3 ; $P=0,40$) et « $X\\geq4$ » (valeurs 4, 5, 6 ; $P=0,60$) sont bien contraires — aucune valeur commune, et ensemble elles couvrent $\\{2,\\ldots,6\\}$.",
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
                  { from: 'min', to: 3, tone: 'accent', label: 'X≤3' },
                  { from: 4, to: 'max', tone: 'good', label: 'X≥4' },
                ],
              },
              {
                ranges: [
                  { from: 'min', to: 4, tone: 'accent', label: 'X≤4' },
                  { from: 4, to: 'max', tone: 'good', label: 'X≥4' },
                ],
                overlapAt: 4,
              },
            ],
            caption:
              "Ligne du haut : « X≤3 » et « X≥4 » ne se touchent pas — vraie partition, contraires. Ligne du bas : « X≤4 » et « X≥4 » se recouvrent en X=4 — ce ne sont PAS des contraires, malgré l'intuition verbale.",
          },
        },
        {
          kind: 'attention',
          label: 'La valeur frontière est comptée deux fois',
          text: "« $X\\geq4$ » ($P=0,60$) et « $X\\leq4$ » ($P=0,70$) ne sont pas contraires : ils partagent la valeur $X=4$, jamais retirée d'aucun des deux événements. Leur somme ($1,30$) n'est d'ailleurs même pas égale à 1 — mais le vrai test n'est jamais « la somme fait-elle 1 ? », c'est toujours « l'intersection est-elle vide et l'union complète ? ».",
        },
        {
          kind: 'astuce',
          label: 'Une somme à 1 ne suffit jamais à elle seule',
          text: "Deux événements contraires vérifient toujours $P(A)+P(B)=1$, mais la réciproque est fausse : il faut en plus l'absence de chevauchement. Repérer le mot-frontière commun (« au moins $k$ » et « au plus $k$ » partagent toujours $X=k$) est le réflexe le plus rapide — le vrai couple de contraires de « au moins $k$ » est « au plus $k-1$ », jamais « au plus $k$ ».",
        },
        { kind: 'subheading', text: 'Fonction de répartition F(x)=P(X≤x)' },
        {
          kind: 'definition',
          label: 'Fonction de répartition',
          items: [
            "La **fonction de répartition** $F$ d'une variable aléatoire discrète associe à tout réel $x$ la probabilité cumulée $F(x)=P(X\\leq x)$ — la somme des probabilités de toutes les valeurs inférieures ou égales à $x$. Son graphique est toujours un graphique en escaliers, jamais une courbe continue.",
          ],
        },
        {
          kind: 'featureTable',
          headers: ['x', '2', '3', '4', '5', '6'],
          rows: [
            ['P(X=x)', '0,15', '0,25', '0,30', '0,20', '0,10'],
            ['F(x)=P(X≤x)', '0,15', '0,40', '0,70', '0,90', '**1,00**'],
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
            caption:
              "Graphique en escaliers de F : chaque palier est constant entre deux valeurs de X, et F ne saute qu'aux valeurs prises par X, jamais entre.",
          },
        },
        {
          kind: 'astuce',
          label: 'Chaque marche mesure exactement P(X=x)',
          text: 'La hauteur du saut de $F$ en $x=x_i$ est toujours $P(X=x_i)$ — par exemple le saut en $x=4$ vaut $0,70-0,40=0,30$, exactement $P(X=4)$. Lire un graphique en escaliers revient donc à lire directement toute la loi de probabilité.',
        },
        { kind: 'subheading', text: 'Jeux et gains — jeu favorable, défavorable ou équitable' },
        {
          kind: 'exempleLibre',
          label: 'Vérifier un jeu — gain net −2€ (0,4) / +3€ (0,35) / +5€ (0,25)',
          blocks: [
            { kind: 'para', text: '$E = -2\\times0,4 + 3\\times0,35 + 5\\times0,25 = -0,8+1,05+1,25 = 1,5€$' },
            {
              kind: 'para',
              text: "Espérance strictement positive : le jeu est **favorable** au joueur (sur un grand nombre de parties, il gagne en moyenne 1,5€ par partie).",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Imposer une mise — trouver m pour rendre le jeu équitable',
          blocks: [
            {
              kind: 'para',
              text: 'Gain brut 10€ (0,2) / 4€ (0,3) / −6€ (0,5) : $E(\\text{gain brut})=10\\times0,2+4\\times0,3+(-6)\\times0,5=2+1,2-3=0,2€$. Le gain net vaut désormais $\\text{gain brut}-m$ ; comme $\\sum p_i=1$, l\'espérance du gain net est $E(\\text{gain brut})-m$, linéaire en $m$ — pour un jeu équitable ($E=0$) :',
            },
            { kind: 'para', text: '$m = E(\\text{gain brut}) = 0,2€$' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Retrancher une constante ne demande jamais de refaire toute la somme',
          text: "Puisque $E(\\text{gain brut}-m)=E(\\text{gain brut})-m$ (linéarité), il suffit de calculer $E(\\text{gain brut})$ une seule fois puis de résoudre l'équation du premier degré $E(\\text{gain brut})-m=0$ — jamais recalculer une somme de 3 termes pour chaque valeur de $m$ essayée.",
        },
        { kind: 'subheading', text: 'Cas particulier — tirage sans remise (loi hypergéométrique)' },
        {
          kind: 'para',
          text: "Quand $X$ compte le nombre de succès parmi $n$ tirages sans remise dans une population de $N$ éléments dont $K$ sont des succès, la loi de $X$ et son espérance se calculent exactement comme pour toute variable discrète — $P(k)$ vient simplement de la formule hypergéométrique plutôt que d'être donnée directement.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — N=10, K=4, n=3',
          blocks: [
            { kind: 'para', text: '$P(k) = \\dfrac{C(4,k)\\times C(6,3-k)}{C(10,3)}$' },
            {
              kind: 'para',
              text: 'Support complet $k\\in\\{0,1,2,3\\}$ : $P(0)=1/6$, $P(1)=1/2$, $P(2)=3/10$, $P(3)=1/30$ (somme exacte = 1). Espérance :',
            },
            { kind: 'para', text: '$E(X) = 0\\times\\frac{1}{6}+1\\times\\frac{1}{2}+2\\times\\frac{3}{10}+3\\times\\frac{1}{30} = 0+0,5+0,6+0,1 = 1,2$' },
            {
              kind: 'para',
              text: "Ce résultat coïncide avec le raccourci $E(X)=nK/N=3\\times4/10=1,2$ — propre à la loi hypergéométrique, jamais un résultat général pour n'importe quelle loi discrète.",
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "Prendre la valeur centrale du support $\\{0,1,2,3\\}$, soit $1,5$, à la place de l'espérance est une erreur fréquente — l'espérance n'est jamais la simple valeur médiane d'un support, elle doit toujours être pondérée par les vraies probabilités de chaque valeur (ici asymétriques : $P(1)=0,5$ pèse bien plus que $P(3)=1/30$).",
        },
        { kind: 'subheading', text: 'Cas particulier — loi uniforme discrète' },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Une variable aléatoire discrète suit une **loi uniforme** lorsque ses $n$ valeurs possibles ont toutes la même probabilité $1/n$. Dans ce cas particulier :',
            '$E(X) = \\dfrac{n+1}{2} \\qquad V(X) = \\dfrac{n^2-1}{12}$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — dé équilibré à 6 faces',
          blocks: [
            {
              kind: 'para',
              text: "Chaque face a la même probabilité $1/6$ : $E(X)=(6+1)/2=3,5$ — une valeur qu'aucune face ne porte, comme dans l'exemple précédent où $E(X)=3,85$ ne coïncidait avec aucune valeur de $X$. $V(X)=(6^2-1)/12=35/12\\approx2,917$.",
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Ces 2 formules ne valent que pour une loi uniforme',
          text: "Les raccourcis $E(X)=(n+1)/2$ et $V(X)=(n^2-1)/12$ supposent des probabilités toutes égales à $1/n$ — pour une loi non uniforme (comme l'exemple hypergéométrique ci-dessus, où $P(1)=1/2$ diffère nettement des 3 autres probabilités), il faut toujours repasser par la formule générale pondérée, jamais ce raccourci.",
        },
        {
          kind: 'entrainement',
          title: 'Variables aléatoires discrètes et espérance',
          generatorId: '6gen49',
          description: ["S'entraîner à construire une loi de probabilité, calculer l'espérance, la variance et l'écart-type."],
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
        {
          kind: 'definition',
          label: 'Schéma de Bernoulli répété, 4 conditions',
          items: [
            "Une variable $X$ suit une **loi binomiale** $B(n,p)$ si l'expérience vérifie exactement ces 4 conditions : (1) un nombre d'épreuves $n$ fixé à l'avance ; (2) des épreuves indépendantes entre elles ; (3) exactement 2 issues à chaque épreuve (succès/échec) ; (4) une probabilité de succès $p$ constante d'une épreuve à l'autre. $X$ compte alors le nombre de succès sur les $n$ épreuves.",
          ],
        },
        {
          kind: 'definition',
          label: 'Formule, espérance, variance et écart-type',
          items: [
            '$P(X=k) = C(n,k)\\times p^k\\times(1-p)^{n-k} \\qquad E(X) = n\\times p$',
            '$V(X) = n\\times p\\times(1-p) \\qquad \\sigma(X) = \\sqrt{n\\times p\\times(1-p)}$',
            "$p$ (succès) porte l'exposant $k$ ; $(1-p)$ (échec) porte l'exposant $n-k$ — jamais l'inverse. Le coefficient $C(n,k)$ compte les différentes positions possibles des $k$ succès parmi les $n$ épreuves — jamais optionnel dès que $0<k<n$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n=5, p=0,4 (loi complète)',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['k', 'C(5,k)', 'P(X=k)', 'P(X≤k)'],
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
                yAxisLabel: 'P(X=k)',
                footnote: 'E(X) = n×p = 2',
                caption:
                  "Distribution B(5;0,4) : maximum en k=2 (0,3456), asymétrique vers la gauche car p<0,5 — E(X)=n×p=2 tombe exactement sur une valeur entière.",
              },
            },
            {
              kind: 'para',
              text: 'Détail du calcul pour $k=2$ : $P(X=2)=C(5,2)\\times0,4^2\\times0,6^3=10\\times0,16\\times0,216=0,3456$. Oublier $C(5,2)=10$ donnerait $0,4^2\\times0,6^3=0,03456$, une valeur 10 fois trop petite.',
            },
            { kind: 'para', text: '$V(X) = 5\\times0,4\\times0,6 = 1,2 \\qquad \\sigma(X) = \\sqrt{1,2} \\approx 1,095$' },
          ],
        },
        {
          kind: 'methode',
          label: '3 stratégies, choisir la plus courte',
          items: [
            '« Exactement $k$ », « aucun » ou « tous » → un seul terme.',
            '« Au moins $k$ » ou « au plus $k$ » avec peu de termes → somme directe.',
            '« Au moins $k$ » ou « au plus $k$ » avec beaucoup de termes → complément : $P(X\\geq1)=1-P(X=0)=1-0,07776=0,92224$, bien plus rapide qu\'une somme de 5 termes.',
          ],
        },
        {
          kind: 'attention',
          label: 'Le mauvais partenaire de complément',
          text: "Le complément de « au moins 1 succès » est « aucun succès » ($X=0$), jamais « tous des succès » ($X=5$) — $1-P(X=5)=1-0,01024=0,98976$ serait une réponse fausse, même si elle semble plausible. Toujours identifier le seuil exact avant de choisir le complément : le contraire de « au moins $k$ » est « au plus $k-1$ », le contraire de « au plus $k$ » est « au moins $k+1$ ».",
        },
        { kind: 'subheading', text: 'Trouver n — résolution par logarithme' },
        {
          kind: 'methode',
          label: "Isoler n dans « au moins 1 succès »",
          items: [
            'Pour trouver le plus petit $n$ tel que $P(\\text{au moins 1 succès})>\\text{seuil}$ :',
            '$1-(1-p)^n>\\text{seuil} \\iff (1-p)^n<1-\\text{seuil} \\iff n > \\dfrac{\\ln(1-\\text{seuil})}{\\ln(1-p)}$',
          ],
        },
        {
          kind: 'attention',
          label: "Le sens de l'inégalité s'inverse",
          text: "$\\ln(1-p)$ est toujours négatif (car $0<1-p<1$) : diviser les deux membres de l'inégalité par un nombre négatif inverse son sens. C'est pourquoi l'inégalité finale utilise $>$ alors que la ligne précédente utilisait $<$ — oublier cette inversion est le piège central de ce type d'exercice.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — p=0,1, seuil=0,9',
          blocks: [
            { kind: 'para', text: '$n > \\dfrac{\\ln(0,1)}{\\ln(0,9)} \\approx 21,85 \\implies n=22$' },
            {
              kind: 'para',
              text: "Vérification : $n=21$ est insuffisant — $(0,9)^{21}\\approx0,109>0,1$, donc $P(\\text{au moins 1})\\approx0,891<0,9$. $n=22$ suffit — $(0,9)^{22}\\approx0,0985<0,1$, donc $P(\\text{au moins 1})\\approx0,9015>0,9$.",
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (n: number) => 1 - Math.pow(0.9, n), tone: 'accent' }],
                points: [
                  { x: 18, y: 1 - Math.pow(0.9, 18), label: '', tone: 'bad' },
                  { x: 19, y: 1 - Math.pow(0.9, 19), label: '', tone: 'bad' },
                  { x: 20, y: 1 - Math.pow(0.9, 20), label: '', tone: 'bad' },
                  { x: 21, y: 1 - Math.pow(0.9, 21), label: 'n=21', tone: 'bad' },
                  { x: 22, y: 1 - Math.pow(0.9, 22), label: 'n=22', tone: 'good' },
                  { x: 23, y: 1 - Math.pow(0.9, 23), label: '', tone: 'good' },
                  { x: 24, y: 1 - Math.pow(0.9, 24), label: '', tone: 'good' },
                ],
                horizontalAsymptotes: [{ y: 0.9, label: 'seuil 0,9' }],
                xMin: 17.5,
                xMax: 24.5,
                xTicks: [18, 19, 20, 21, 22, 23, 24],
                fixedYRange: { min: 0.84, max: 0.93 },
                xAxisLabel: 'n',
                yAxisLabel: 'P(≥1 succès)',
                caption:
                  'P(au moins 1 succès) en fonction de n, p=0,1 : la courbe franchit le seuil 0,9 entre n=21 (encore en dessous) et n=22 (déjà au-dessus).',
              },
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier n−1 juste en dessous',
          text: 'Le calcul par logarithme donne une valeur décimale (ici $21,85$) — le réflexe de vérification consiste à recalculer $P$ pour $n=22$ (doit dépasser le seuil) et pour $n=21$ (doit encore être en dessous), pour confirmer que 22 est bien le plus petit entier qui convient.',
        },
        {
          kind: 'entrainement',
          title: 'Loi binomiale',
          generatorId: '6gen50',
          description: ['S\'entraîner à reconnaître un schéma de Bernoulli, calculer une probabilité binomiale et résoudre « trouver n ».'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 50. Loi binomiale »',
        },
      ],
    },
    {
      id: 'loinormale',
      number: 3,
      title: 'Loi normale',
      blocks: [
        {
          kind: 'definition',
          label: 'Première loi continue du chapitre',
          items: [
            "Contrairement aux lois discrètes vues jusqu'ici, une variable $X$ suivant une **loi normale** $N(\\mu,\\sigma)$ peut prendre n'importe quelle valeur réelle — $P(X=x)$ vaut toujours 0 pour un réel $x$ précis ; seule une probabilité sur un intervalle a un sens, lue via la **fonction de répartition** $\\Phi$ de la loi normale centrée réduite $N(0,1)$ : $\\Phi(z)=P(Z\\leq z)$.",
          ],
        },
        {
          kind: 'definition',
          label: 'Standardisation',
          items: [
            "Pour utiliser la table de $\\Phi$ (construite pour $N(0,1)$ uniquement), toute variable $X\\sim N(\\mu,\\sigma)$ doit d'abord être ramenée à une variable centrée réduite :",
            '$Z = \\dfrac{X-\\mu}{\\sigma}$',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI), tone: 'accent' }],
            shadedRegions: [{ from: -3.5, to: 1.5, upper: (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI), tone: 'accent' }],
            verticalAsymptotes: [{ x: 1.5, label: 'z=1,5' }],
            xMin: -3.5,
            xMax: 3.5,
            xTicks: [-3, -2, -1, 0, 1, 2, 3],
            textLabels: [{ x: -1.3, y: 0.28, text: 'Φ(1,5)≈0,9332', tone: 'accent' }],
            xAxisLabel: 'z',
            yAxisLabel: 'φ(z)',
            caption: 'Courbe de N(0,1) : l\'aire teintée à gauche de z=1,5 vaut Φ(1,5)≈0,9332 — Φ(z) donne toujours l\'aire à gauche de z, jamais à droite.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — X~N(50,10)',
          blocks: [
            {
              kind: 'para',
              text: 'Standardisation : $z=(65-50)/10=1,5$. Lecture de table : $\\Phi(1,5)\\approx0,9332$, donc $P(X\\leq65)\\approx0,9332$.',
            },
            { kind: 'para', text: '« Au moins » est le complément de « au plus » : $P(X\\geq65)=1-\\Phi(1,5)\\approx1-0,9332=0,0668$.' },
            {
              kind: 'para',
              text: 'Par symétrie $\\Phi(-z)=1-\\Phi(z)$ : $P(X\\leq35)=\\Phi(-1,5)=1-\\Phi(1,5)\\approx0,0668$ — la même valeur que $P(X\\geq65)$, cohérent car 35 et 65 sont symétriques autour de $\\mu=50$.',
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
          text: '$\\Phi(-1,5)$ n\'est pas égal à $\\Phi(1,5)$ — $\\Phi$ n\'est pas une fonction paire. La vraie relation est $\\Phi(-z)=1-\\Phi(z)$ (symétrie par rapport à 0,5, pas par rapport à l\'axe des ordonnées) : $\\Phi(-1,5)\\approx0,0668$, très différent de $\\Phi(1,5)\\approx0,9332$.',
        },
        {
          kind: 'para',
          text: "Pour un intervalle de la loi centrée réduite, on soustrait toujours deux valeurs de $\\Phi$ — jamais on ne les additionne (ce qui pourrait même dépasser 1, signal d'alerte immédiat) :",
        },
        { kind: 'para', text: '$P(1\\leq Z\\leq2) = \\Phi(2)-\\Phi(1) \\approx 0,9772-0,8413 = 0,1359$' },
        { kind: 'subheading', text: 'La règle empirique 68-95-99,7' },
        {
          kind: 'featureTable',
          headers: ['k', 'Intervalle', "% dans l'intervalle", '% hors (2 côtés)', '% hors (1 côté)'],
          rows: [
            ['1', '[μ−σ;μ+σ]', '68,3%', '31,7%', '15,85%'],
            ['2', '[μ−2σ;μ+2σ]', '95,4%', '4,6%', '2,3%'],
            ['3', '[μ−3σ;μ+3σ]', '99,7%', '0,3%', '0,15%'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              {
                fn: (x: number) => Math.exp(-Math.pow((x - 50) / 10, 2) / 2) / (10 * Math.sqrt(2 * Math.PI)),
                tone: 'accent',
              },
            ],
            shadedRegions: [
              {
                from: 30,
                to: 70,
                upper: (x: number) => Math.exp(-Math.pow((x - 50) / 10, 2) / 2) / (10 * Math.sqrt(2 * Math.PI)),
                tone: 'good',
              },
            ],
            xMin: 15,
            xMax: 85,
            xTicks: [30, 50, 70],
            xTickLabels: { 30: 'μ−2σ=30', 50: 'μ=50', 70: 'μ+2σ=70' },
            textLabels: [{ x: 50, y: 0.038, text: '95,4%', tone: 'good' }],
            xAxisLabel: 'x',
            yAxisLabel: 'densité',
            caption:
              'N(50,10) : environ 95,4% des valeurs se situent dans [μ−2σ;μ+2σ]=[30;70] (zone teintée) — le reste, 4,6%, se répartit à égalité entre les 2 queues.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — X~N(50,10), hors de [30;70]',
          blocks: [
            {
              kind: 'para',
              text: '$50-2\\times10=30$ et $50+2\\times10=70$ : environ $95,4\\%$ des valeurs tombent dans $[30;70]$, donc $1-0,954=0,046$ (4,6%) tombent en dehors, tous côtés confondus.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Diviser par 2 pour un seul côté',
          text: "La probabilité d'être seulement au-dessus de 70 (un seul côté) n'est jamais le complément total ($4,6\\%$) — la loi normale étant symétrique, ce complément se partage également entre les deux queues : $0,046/2=0,023$ (2,3%) pour un seul côté. Oublier cette division par 2 est l'erreur la plus fréquente de cette règle.",
        },
        { kind: 'subheading', text: 'Sens inverse — retrouver z (ou x) depuis une probabilité' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Retrouver $z$ tel que $\\Phi(z)=p$ (table inversée, $\\Phi^{-1}$) puis, pour une loi générale $N(\\mu,\\sigma)$, dé-standardiser :',
            '$x = \\mu+z\\times\\sigma$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — z tel que Φ(z)=0,95',
          blocks: [
            {
              kind: 'para',
              text: "$z\\approx1,645$ (valeur usuelle du quantile à 95%, largement utilisée). Attention : $1-0,95=0,05$ est une probabilité, pas une valeur de $z$ — il faut impérativement passer par $\\Phi^{-1}$ pour convertir une probabilité en valeur de $z$.",
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Loi normale',
          generatorId: '6gen51',
          description: ["S'entraîner à standardiser, lire la table de Φ et appliquer la règle empirique."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 51. Loi normale »',
        },
      ],
    },
    {
      id: 'extensionsbayes',
      number: 4,
      title: 'Extensions : binomiale, normale et Bayes',
      blocks: [
        {
          kind: 'para',
          text: 'Ce générateur de clôture combine ce que les sections précédentes ont établi — résolution « trouver n » de la loi binomiale, sens inverse de la loi normale — avec le **théorème de Bayes** à 3 catégories, une approximation de la binomiale par la loi normale, une loi uniforme continue, et une loi discrète reconstruite appliquée à une population entière.',
        },
        { kind: 'subheading', text: 'Épreuves composées — indépendance « ET »' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 2 épreuves indépendantes, p₁=0,5 et p₂=0,3',
          blocks: [
            { kind: 'para', text: 'Réussir les deux épreuves indépendantes (« ET » logique) :' },
            { kind: 'para', text: '$p = p_1\\times p_2 = 0,5\\times0,3 = 0,15$' },
            {
              kind: 'para',
              text: 'Pour trouver $n$ minimal tel que $P(\\text{au moins 1 succès})>0,8$ avec ce $p$ composé : $n>\\ln(0,2)/\\ln(0,85)\\approx9,90$, donc $n=10$ — exactement la même résolution par logarithme que la section précédente, appliquée à un $p$ obtenu par multiplication plutôt que donné directement.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'productAreaSquare',
                p1: 0.5,
                p1Label: 'p1=0,5',
                p2: 0.3,
                p2Label: 'p2=0,3',
                productLabel: 'p=0,15',
                axisLabel1: 'épreuve 1 (probabilité p1)',
                axisLabel2: 'épreuve 2',
                caption: "Carré d'aire 1 : le rectangle teinté, de largeur p1=0,5 et de hauteur p2=0,3, a pour aire le produit p1×p2=0,15.",
              },
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: '$p_1+p_2=0,8$ pour ce même « ET » est faux — un « ET » entre événements indépendants se traduit toujours par une multiplication, jamais une addition. Une somme dépasserait même chacune des 2 probabilités séparées, ce qui n\'a aucun sens pour un « ET » (plus restrictif qu\'un « OU »).',
        },
        { kind: 'subheading', text: 'Théorème de Bayes à 3 catégories' },
        {
          kind: 'definition',
          label: 'Probabilités totales et formule de Bayes',
          items: [
            'Une population se partitionne en 3 catégories de proportions $q_1$, $q_2$, $q_3$ (somme=1). Un critère survient avec probabilité $r_i$ dans chaque catégorie. Probabilité totale du critère (formule des probabilités totales, 3 termes) :',
            '$P_{totale} = q_1r_1+q_2r_2+q_3r_3$',
            'Probabilité inverse — appartenir à la catégorie $j$ sachant que le critère est survenu (théorème de Bayes) :',
            '$P(\\text{cat.}j \\mid \\text{critère}) = \\dfrac{q_jr_j}{P_{totale}}$',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'weightedTree',
            firstLevel: [
              { label: 'cat.1', prob: 'q=0,30' },
              { label: 'cat.2', prob: 'q=0,45' },
              { label: 'cat.3', prob: 'q=0,25' },
            ],
            secondLevel: [
              { fromFirst: 0, label: 'sinistre', prob: 'r=0,10', pathProb: '0,030' },
              { fromFirst: 1, label: 'sinistre', prob: 'r=0,20', pathProb: '0,090' },
              { fromFirst: 2, label: 'sinistre', prob: 'r=0,40', pathProb: '0,100', highlight: true },
            ],
            caption:
              'Arbre à 3 catégories (assurance) : chaque branche q_i se prolonge par r_i (sinistre) — le produit q_i×r_i est la probabilité conjointe, leur somme donne P_totale=0,22.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — assurance, 3 profils de risque',
          blocks: [
            {
              kind: 'featureTable',
              headers: ['Catégorie', 'q_i', 'r_i (P(sinistre|catégorie))', 'q_i×r_i'],
              rows: [
                ['1 — faible risque', '0,30', '0,10', '0,030'],
                ['2 — risque moyen', '0,45', '0,20', '0,090'],
                ['3 — haut risque', '0,25', '0,40', '0,100'],
                ['**Total**', '**1,00**', '', '**0,220**'],
              ],
            },
            { kind: 'para', text: '$P(\\text{cat.3} \\mid \\text{sinistre}) = \\dfrac{0,100}{0,220} \\approx 0,4545$' },
          ],
        },
        {
          kind: 'attention',
          label: 'Confondre a priori et a posteriori',
          text: "Répondre $q_3=0,25$ à la question « probabilité d'appartenir à la catégorie 3 sachant le sinistre » ignore complètement l'information du critère observé — c'est confondre une probabilité a priori ($q_3$, avant observation) avec une probabilité a posteriori ($P(\\text{cat.3}\\mid\\text{sinistre})\\approx0,4545$, après observation).",
        },
        {
          kind: 'astuce',
          label: 'Toujours pondérer par le poids de chaque catégorie',
          text: "Faire la moyenne simple des 3 conditionnelles, $(0,1+0,2+0,4)/3\\approx0,233$, ignore que les catégories n'ont pas le même poids ($q_1,q_2,q_3$ différents) — même piège que pour l'espérance à la section 1 : la vraie formule des probabilités totales pondère chaque $r_i$ par son $q_i$, donnant 0,22, pas 0,233.",
        },
        { kind: 'subheading', text: "Approximation d'une loi binomiale par une loi normale" },
        {
          kind: 'methode',
          label: '2 conditions à vérifier simultanément',
          items: [
            'Quand $n$ est grand et $p$ proche de $0,5$, la loi binomiale $B(n,p)$ s\'approxime par une loi normale de paramètres $\\mu=n\\times p$ et $\\sigma=\\sqrt{n\\times p\\times(1-p)}$.',
            'Conditions : $n>30$ ; $0,3<p<0,7$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n=100, p=0,5',
          blocks: [
            {
              kind: 'para',
              text: '$n=100>30$ ✓ ; $p=0,5$, bien dans $]0,3;0,7[$ ✓ — les 2 conditions sont réunies, donc $\\mu=100\\times0,5=50$ et $\\sigma=\\sqrt{100\\times0,5\\times0,5}=5$.',
            },
            {
              kind: 'para',
              text: 'Pour estimer $P(X\\leq55)$ : standardisation $z=(55-50)/5=1$, puis lecture de table $\\Phi(1)\\approx0,8413$ — exactement la même méthode que pour toute loi normale, une fois $\\mu$ et $\\sigma$ déterminés.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Confondre les 2 approximations de la binomiale',
          text: "L'approximation par une loi de Poisson (vue plus loin, $n\\geq30$, $p\\leq0,1$) et l'approximation par une loi normale ($n>30$, $0,3<p<0,7$) ont des domaines de validité qui ne se chevauchent jamais : la première sert pour un $p$ proche de 0 (événement rare), la seconde pour un $p$ proche de 0,5. Un $p$ intermédiaire (par exemple $p=0,2$) ne remplit aucune des deux — la binomiale exacte reste alors la seule option correcte.",
        },
        { kind: 'subheading', text: 'Loi uniforme continue' },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            "Pour $X$ uniformément réparti sur $[a;b]$, la densité est constante, égale à $1/(b-a)$ — et la probabilité d'un intervalle ne dépend que de sa longueur, jamais de sa position :",
            '$P(c\\leq X\\leq d) = \\dfrac{d-c}{b-a}$',
            '$E(X) = \\dfrac{a+b}{2} \\qquad V(X) = \\dfrac{(b-a)^2}{12}$',
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
              'X uniforme sur [0;60] : les 2 zones teintées ([10;25] et [35;50]) ont la même longueur (15) et donc la même probabilité (0,25), bien qu\'elles occupent des positions différentes.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — E(X), V(X) et σ(X) pour X uniforme sur [0;60]',
          blocks: [
            { kind: 'para', text: '$E(X) = (0+60)/2 = 30 \\qquad V(X) = 60^2/12 = 300 \\qquad \\sigma(X) = \\sqrt{300} \\approx 17,32$' },
            {
              kind: 'para',
              text: '$E(X)=30$ tombe exactement au milieu de $[0;60]$ — normal pour une loi uniforme, toujours symétrique autour du centre de l\'intervalle.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Seule la longueur compte, jamais la position',
          text: '$P(10\\leq X\\leq25)=15/60=0,25$ et $P(35\\leq X\\leq50)=15/60=0,25$ sont identiques — 2 intervalles de même longueur ont toujours la même probabilité, quelle que soit leur position dans $[a;b]$.',
        },
        { kind: 'subheading', text: "Reconstruire une loi et appliquer l'espérance à une population" },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — offre à 3 formules',
          blocks: [
            {
              kind: 'para',
              text: '$20\\%$ des clients choisissent la formule Basique (15€), $30\\%$ la Standard (35€) ; le 3ᵉ pourcentage se déduit par différence, jamais donné directement : $100-20-30=50\\%$ pour la Premium (60€).',
            },
            {
              kind: 'featureTable',
              headers: ['Formule', 'Prix', '% clients', 'Prix×%'],
              rows: [
                ['Basique', '15€', '20%', '3,00€'],
                ['Standard', '35€', '30%', '10,50€'],
                ['Premium', '60€', '50%', '30,00€'],
                ['**Total**', '', '100%', '**43,50€**'],
              ],
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'categoricalBarChart',
                bars: [
                  { label: '15€ Basique', value: 0.2, valueLabel: '0,20' },
                  { label: '35€ Standard', value: 0.3, valueLabel: '0,30' },
                  { label: '60€ Premium', value: 0.5, valueLabel: '0,50' },
                ],
                maxValue: 0.58,
                xAxisLabel: 'formule',
                yAxisLabel: '% clients',
                footnote: 'E(X) = 43,50€',
                caption:
                  'Les 3 formules en barres selon leur % de clients — E(X)=43,50€ tombe entre Standard et Premium, plus proche de Premium qui pèse le plus (50%).',
              },
            },
            {
              kind: 'para',
              text: "Appliqué à une population de 500 clients, la recette totale attendue se calcule en multipliant l'espérance par l'effectif — jamais en les additionnant :",
            },
            { kind: 'para', text: '$E(X)\\times500 = 43,5\\times500 = 21\\,750€$' },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "$43,5+500=543,5€$ n'a aucun sens dimensionnel (un prix moyen additionné à un nombre de clients) — il faut toujours multiplier l'espérance par l'effectif pour obtenir un total attendu sur une population, jamais les additionner.",
        },
        {
          kind: 'entrainement',
          title: 'Extensions binomiale, normale et Bayes',
          generatorId: '6gen52',
          description: ["S'entraîner sur les épreuves composées, le théorème de Bayes, l'approximation normale et la loi uniforme continue."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 52. Extensions binomiale, normale et Bayes »',
        },
      ],
    },
    {
      id: 'loipoisson',
      number: 5,
      title: 'Loi de Poisson',
      blocks: [
        {
          kind: 'definition',
          label: 'Loi de Poisson, paramètre λ',
          items: [
            "La **loi de Poisson** de paramètre $\\lambda$ (le nombre moyen d'événements sur une unité donnée) modélise le comptage d'événements rares et indépendants — pannes, arrivées, défauts — sur un intervalle de temps ou un effectif :",
            '$P(X=k) = e^{-\\lambda}\\times\\dfrac{\\lambda^k}{k!} \\quad \\text{pour tout entier } k\\geq0$',
          ],
        },
        {
          kind: 'methode',
          label: 'Calcul itératif, jamais λᵏ et k! séparément',
          items: [
            'Pour un $\\lambda$ élevé, calculer $\\lambda^k$ et $k!$ séparément peut faire déborder chacun vers l\'infini (en machine) bien avant que leur rapport — toujours compris entre 0 et 1 — ne pose problème.',
            'La méthode stable part de $\\text{terme}_0=e^{-\\lambda}$ et construit chaque terme suivant à partir du précédent : $\\text{terme}_i = \\text{terme}_{i-1} \\times \\dfrac{\\lambda}{i}$.',
          ],
        },
        {
          kind: 'para',
          text: 'Construction itérative de $P(X=k)$ pour $\\lambda=4$, $\\text{terme}_0=e^{-4}$ puis chaque terme obtenu en multipliant le précédent par $\\lambda/i$ :',
        },
        {
          kind: 'operationChain',
          nodes: ['$0,0183$', '$0,0733$', '$0,1465$', '$0,1954$', '$0,1954$'],
          operations: ['×λ/1', '×λ/2', '×λ/3', '×λ/4'],
        },
        { kind: 'subheading', text: "Approximation d'une loi binomiale par une loi de Poisson" },
        {
          kind: 'methode',
          label: '3 conditions à vérifier simultanément',
          items: [
            'Quand $n$ est grand et $p$ petit, la loi binomiale $B(n,p)$ s\'approxime par une loi de Poisson de paramètre $\\lambda=n\\times p$, à condition que :',
            '$n\\geq30$ ; $p\\leq0,1$ ; $n\\times p\\leq15$.',
            'Les 3 conditions doivent toutes être vérifiées — un $n\\times p$ faible avec un $n$ trop petit ne suffit jamais.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n=50, p=0,08',
          blocks: [
            {
              kind: 'para',
              text: '$n=50\\geq30$ ✓ ; $p=0,08\\leq0,1$ ✓ ; $n\\times p=4\\leq15$ ✓ — les 3 conditions sont réunies, donc $\\lambda=n\\times p=4$.',
            },
          ],
        },
        {
          kind: 'featureTable',
          headers: ['k', 'Facteur λ/i', 'P(X=k)', 'P(X≤k)'],
          rows: [
            ['0', '—', '0,018316', '0,018316'],
            ['1', '4/1', '0,073263', '0,091579'],
            ['2', '4/2', '0,146525', '0,238104'],
            ['3', '4/3', '0,195367', '0,433471'],
            ['4', '4/4', '0,195367', '0,628838'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: '0', value: poisson(4, 0), valueLabel: poisson(4, 0).toFixed(3).replace('.', ','), tone: 'good' },
              { label: '1', value: poisson(4, 1), valueLabel: poisson(4, 1).toFixed(3).replace('.', ','), tone: 'good' },
              { label: '2', value: poisson(4, 2), valueLabel: poisson(4, 2).toFixed(3).replace('.', ',') },
              { label: '3', value: poisson(4, 3), valueLabel: poisson(4, 3).toFixed(3).replace('.', ',') },
              { label: '4', value: poisson(4, 4), valueLabel: poisson(4, 4).toFixed(3).replace('.', ',') },
              { label: '5', value: poisson(4, 5), valueLabel: poisson(4, 5).toFixed(3).replace('.', ',') },
              { label: '6', value: poisson(4, 6), valueLabel: poisson(4, 6).toFixed(3).replace('.', ',') },
              { label: '7', value: poisson(4, 7), valueLabel: poisson(4, 7).toFixed(3).replace('.', ',') },
              { label: '8', value: poisson(4, 8), valueLabel: poisson(4, 8).toFixed(3).replace('.', ',') },
              { label: '9', value: poisson(4, 9), valueLabel: poisson(4, 9).toFixed(3).replace('.', ',') },
            ],
            maxValue: 0.22,
            xAxisLabel: "k (nombre d'événements)",
            yAxisLabel: 'P(X=k)',
            footnote: 'P(X≤1) ≈ 0,0916',
            caption:
              'Distribution de Poisson λ=4 : les 2 barres colorées (k=0,1) forment P(X≤1)≈0,0916 — le reste, P(X≥2)≈0,9084, s\'obtient par complément.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — complément',
          blocks: [
            {
              kind: 'para',
              text: '$P(X\\leq1)=P(X=0)+P(X=1)=0,018316+0,073263=0,091579$. « Au moins 2 » est le complément exact de « au plus 1 » :',
            },
            { kind: 'para', text: '$P(X\\geq2) = 1-P(X\\leq1) \\approx 1-0,091579 = 0,908421$' },
          ],
        },
        {
          kind: 'attention',
          label: '« au plus k » n\'est jamais un complément ici',
          text: "Contrairement à la loi binomiale (support fini, borné par $n$), la loi de Poisson a un support infini — il n'existe aucune borne « $n$ » à côté de laquelle un complément court serait naturel. « Au plus $k$ » se calcule donc toujours par une somme directe de 0 à $k$, jamais par complément.",
        },
        { kind: 'subheading', text: "Piège d'échelle — ajuster λ avant de calculer" },
        {
          kind: 'attention',
          label: "λ n'est jamais le taux de base recopié tel quel",
          text: '$\\lambda$ doit toujours être ajusté à l\'échelle exacte de la question posée : multiplicatif pour un contexte temporel (taux par minute × nombre de minutes), proportionnel pour un contexte effectif (taux « pour N » × effectif cible/N). Recopier le taux de base sans ajustement est le piège le plus fréquent de cette famille.',
        },
        {
          kind: 'exempleLibre',
          label: 'Les 2 types d\'ajustement',
          blocks: [
            {
              kind: 'para',
              text: '**Temporel :** un péage voit passer en moyenne 5 voitures/minute — sur 15 minutes, $\\lambda=5\\times15=75$ (multiplicatif direct).',
            },
            {
              kind: 'para',
              text: '**Effectif :** une usine compte en moyenne 3 pièces défectueuses pour 1000 produites — sur un lot cible de 500 pièces, $\\lambda=3\\times(500/1000)=1,5$ (proportionnel au rapport des effectifs).',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'E(X)=V(X)=λ — une propriété caractéristique',
          text: "Pour une loi de Poisson, l'espérance et la variance sont toutes les deux égales à $\\lambda$ — contrairement à la plupart des lois, où espérance et variance diffèrent systématiquement.",
        },
        {
          kind: 'entrainement',
          title: 'Loi de Poisson',
          generatorId: '6gen53',
          description: ["S'entraîner sur la loi de Poisson, l'approximation binomiale→Poisson et l'ajustement d'échelle de λ."],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 53. Loi de Poisson »',
        },
      ],
    },
  ],
  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Espérance discrète', '$E(X)=\\sum x_iP(X=x_i)$ — moyenne pondérée, jamais une moyenne simple'],
        ['Variance et écart-type', '$V(X)=E(X^2)-[E(X)]^2$ ; $\\sigma(X)=\\sqrt{V(X)}$'],
        ['Fonction de répartition', '$F(x)=P(X\\leq x)$ — graphique en escaliers'],
        ['Événements contraires', 'intersection vide et union complète — jamais juste « somme=1 »'],
        ['Loi uniforme discrète', '$E(X)=(n+1)/2$, $V(X)=(n^2-1)/12$ — cas particulier'],
        ["Loi hypergéométrique", "$E(X)=nK/N$ — cas particulier d'une loi discrète"],
        ['Loi binomiale', '$P(X=k)=C(n,k)p^k(1-p)^{n-k}$ ; $E(X)=np$, $V(X)=np(1-p)$'],
        ['Trouver n (binomiale)', '$n>\\ln(1-\\text{seuil})/\\ln(1-p)$ — inversion du sens car $\\ln(1-p)<0$'],
        ['Loi normale', 'seule loi continue ; $Z=(X-\\mu)/\\sigma$ ; $\\Phi(z)=P(Z\\leq z)$'],
        ['Règle empirique', '68,3% / 95,4% / 99,7% pour k=1, 2, 3 écarts-types'],
        ['Approximation binomiale→normale', '$n>30$, $0,3<p<0,7 \\implies \\mu=np$, $\\sigma=\\sqrt{np(1-p)}$'],
        ['Bayes à 3 catégories', '$P(\\text{cat.}j\\mid\\text{critère})=q_jr_j/P_{totale}$'],
        ['Loi uniforme continue', '$P(c\\leq X\\leq d)=(d-c)/(b-a)$ ; $E(X)=(a+b)/2$, $V(X)=(b-a)^2/12$'],
        ['Loi de Poisson', '$P(X=k)=e^{-\\lambda}\\lambda^k/k!$ ; $E(X)=V(X)=\\lambda$'],
        ['Approximation binomiale→Poisson', '$n\\geq30$, $p\\leq0,1$, $np\\leq15 \\implies \\lambda=np$'],
      ],
    },
    entrainement: {
      kind: 'entrainement',
      title: 'Variables aléatoires et lois de probabilités — quiz vrai/faux',
      generatorId: '6gen71',
      description: ['Quiz de révision transversal à tout le chapitre.'],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 71. Quiz vrai/faux — Variables aléatoires »',
    },
  },
}
