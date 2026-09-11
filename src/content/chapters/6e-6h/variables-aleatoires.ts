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
    "Combien un jeu rapporte-t-il en moyenne ? À partir de combien d'essais un événement rare devient-il presque certain ? Dans ce chapitre, tu vas apprendre à **construire** une variable aléatoire et son espérance, à utiliser la **loi binomiale**, puis à passer au continu avec la **densité de probabilité**, la **loi uniforme continue** et la **loi normale** — lue sur une table Φ. Tu termines avec un exercice qui mélange tout ça (binomiale, normale, théorème de Bayes), puis la **loi de Poisson** pour les événements rares.",
  sections: [
    {
      id: 'variablesdiscretes',
      number: 1,
      title: 'Variables aléatoires discrètes et espérance',
      blocks: [
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
            "Une **variable aléatoire discrète** $X$ associe un nombre à chaque issue d'une expérience, parmi un ensemble fini $\\{x_1,\\ldots,x_n\\}$. Sa **loi de probabilité**, c'est simplement $P(X=x_i)$ pour chaque valeur possible. Une seule règle à respecter : $\\sum P(X=x_i) = 1$ — jamais plus, jamais moins !",
          ],
        },
        { kind: 'subheading', text: 'Fonction de répartition F(x)=P(X≤x)' },
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
          text: 'La hauteur de chaque saut de $F$ en $x=x_i$ vaut exactement $P(X=x_i)$. Exemple : le saut en $x=4$ fait $0,70-0,40=0,30$ — c\'est $P(X=4)$. Lire un escalier, c\'est donc lire toute la loi de probabilité d\'un coup !',
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
            '$V(X) = \\displaystyle\\sum_{i=1}^{n} P(X=x_i)\\times[x_i-E(X)]^2 = E(X^2)-[E(X)]^2$',
            "L'**écart-type** $\\sigma(X) = \\sqrt{V(X)}$ se mesure dans la **même unité** que $X$ — contrairement à $V(X)$, qui porte cette unité au carré, donc pas directement comparable à $X$.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Deux jeux, même espérance, pas le même risque',
          text:
            "Deux jeux peuvent avoir exactement la même espérance — disons 0€, un jeu équitable — sans être aussi imprévisibles l'un que l'autre. Le premier fait gagner ou perdre 1€ à chaque fois : peu de surprise. Le second fait gagner ou perdre 100€, à pile ou face : bien plus risqué, même si le gain moyen est identique. C'est exactement ce que mesure $\\sigma(X)$ : plus il est grand, plus les résultats individuels s'éloignent de la moyenne — plus le jeu est imprévisible.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — construire la loi, calculer E(X), V(X) et σ(X)',
          blocks: [
            {
              kind: 'para',
              text: "$X\\in\\{2,3,4,5,6\\}$, avec $P=(0,15\\,;\\,0,25\\,;\\,0,30\\,;\\,0,20\\,;\\,0,10)$. D'abord, un réflexe : $0,15+0,25+0,30+0,20+0,10=1,00$ — la loi est bien valide.",
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
              text: "Fais bien la différence : additionner simplement les 5 valeurs et diviser par 5 donnerait $(2+3+4+5+6)/5=4$ — une moyenne qui ignore les probabilités, donc fausse dès que la loi n'est pas uniforme ! La vraie espérance, $3,85$, penche vers 3 et 4, qui portent le plus de poids ($0,25$ et $0,30$).",
            },
            {
              kind: 'para',
              text: "L'écart de chaque valeur à $E(X)=3,85$, mis au carré et pondéré par sa probabilité :",
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
          text: "Calculer une moyenne simple des 5 écarts au carré, $(3,4225+0,7225+0,0225+1,3225+4,6225)/5\\approx2,0225$, oublie que les probabilités ne sont pas égales — exactement le même piège que pour l'espérance ! La variance pondère chaque écart au carré par $P(X=x_i)$ : ça donne $1,4275$, jamais une moyenne arithmétique simple.",
        },
        { kind: 'subheading', text: 'Le piège des événements « au moins » / « au plus »' },
        {
          kind: 'para',
          text: "Deux événements sont **contraires** si (1) leur intersection est vide et (2) leur union couvre toutes les valeurs possibles — les deux conditions à la fois. Pour la loi ci-dessus : « $X\\leq3$ » (valeurs 2, 3 ; $P=0,40$) et « $X\\geq4$ » (valeurs 4, 5, 6 ; $P=0,60$) sont bien contraires — aucune valeur commune, et ensemble elles couvrent $\\{2,\\ldots,6\\}$.",
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
          text: "« $X\\geq4$ » ($P=0,60$) et « $X\\leq4$ » ($P=0,70$) ne sont **pas** contraires : ils partagent la valeur $X=4$, jamais retirée d'aucun des deux ! Leur somme ($1,30$) n'est même pas égale à 1 — la bonne question n'est jamais « la somme fait-elle 1 ? », mais toujours « l'intersection est-elle vide, et l'union complète ? ».",
        },
        {
          kind: 'astuce',
          label: 'Une somme à 1 ne suffit jamais à elle seule',
          text: "Deux événements contraires vérifient toujours $P(A)+P(B)=1$, mais l'inverse est faux : il faut aussi qu'ils ne se chevauchent pas. Le réflexe le plus rapide : repérer le mot-frontière commun (« au moins $k$ » et « au plus $k$ » partagent toujours $X=k$). Le vrai contraire de « au moins $k$ », c'est « au plus $k-1$ » — jamais « au plus $k$ » !",
        },
        { kind: 'subheading', text: 'Jeux et gains — jeu favorable, défavorable ou équitable' },
        {
          kind: 'exempleLibre',
          label: 'Vérifier un jeu — gain net −2€ (0,4) / +3€ (0,35) / +5€ (0,25)',
          blocks: [
            { kind: 'para', text: '$E = -2\\times0,4 + 3\\times0,35 + 5\\times0,25 = -0,8+1,05+1,25 = 1,5€$' },
            {
              kind: 'para',
              text: "Espérance strictement positive : le jeu est **favorable** au joueur — sur un grand nombre de parties, il gagne en moyenne 1,5€ à chaque fois.",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Imposer une mise — trouver m pour rendre le jeu équitable',
          blocks: [
            {
              kind: 'para',
              text: "Gain brut 10€ (0,2) / 4€ (0,3) / −6€ (0,5) : $E(\\text{gain brut})=10\\times0,2+4\\times0,3+(-6)\\times0,5=2+1,2-3=0,2€$. Le gain net vaut désormais $\\text{gain brut}-m$. Comme $\\sum p_i=1$, l'espérance du gain net est simplement $E(\\text{gain brut})-m$ — linéaire en $m$. Pour un jeu équitable ($E=0$) :",
            },
            { kind: 'para', text: '$m = E(\\text{gain brut}) = 0,2€$' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Retrancher une constante ne demande jamais de refaire toute la somme',
          text: "Puisque $E(\\text{gain brut}-m)=E(\\text{gain brut})-m$ (linéarité), calcule $E(\\text{gain brut})$ **une seule fois**, puis résous l'équation du premier degré $E(\\text{gain brut})-m=0$ — inutile de refaire la somme de 3 termes à chaque valeur de $m$ essayée !",
        },
        { kind: 'subheading', text: 'Cas particulier — tirage sans remise (loi hypergéométrique)' },
        {
          kind: 'para',
          text: "Quand $X$ compte le nombre de succès parmi $n$ tirages **sans remise** dans une population de $N$ éléments dont $K$ sont des succès, rien de neuf côté méthode : la loi et l'espérance se calculent comme pour toute variable discrète. Seul $P(k)$ change — il vient de la formule hypergéométrique plutôt que d'être donné directement.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — N=10, K=4, n=3',
          blocks: [
            { kind: 'para', text: '$P(k) = \\dfrac{C(4,k)\\times C(6,3-k)}{C(10,3)}$' },
            {
              kind: 'para',
              text: 'Support complet $k\\in\\{0,1,2,3\\}$ : $P(0)=1/6$, $P(1)=1/2$, $P(2)=3/10$, $P(3)=1/30$ (la somme fait bien 1). Espérance :',
            },
            { kind: 'para', text: '$E(X) = 0\\times\\frac{1}{6}+1\\times\\frac{1}{2}+2\\times\\frac{3}{10}+3\\times\\frac{1}{30} = 0+0,5+0,6+0,1 = 1,2$' },
            {
              kind: 'para',
              text: "Ce résultat coïncide avec le raccourci $E(X)=nK/N=3\\times4/10=1,2$ — un raccourci propre à la loi hypergéométrique, jamais valable pour n'importe quelle loi discrète !",
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "Prendre la valeur centrale du support $\\{0,1,2,3\\}$, soit $1,5$, à la place de l'espérance est une erreur fréquente. L'espérance n'est **jamais** la simple valeur médiane d'un support — elle doit toujours être pondérée par les vraies probabilités de chaque valeur (ici asymétriques : $P(1)=0,5$ pèse bien plus que $P(3)=1/30$).",
        },
        { kind: 'subheading', text: 'Cas particulier — loi uniforme discrète' },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Une variable aléatoire discrète suit une **loi uniforme** quand ses $n$ valeurs possibles ont toutes la même probabilité $1/n$. Dans ce cas particulier seulement :',
            '$E(X) = \\dfrac{n+1}{2} \\qquad V(X) = \\dfrac{n^2-1}{12}$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — dé équilibré à 6 faces',
          blocks: [
            {
              kind: 'para',
              text: "Chaque face a la même probabilité $1/6$ : $E(X)=(6+1)/2=3,5$ — une valeur qu'aucune face ne porte, exactement comme dans l'exemple précédent où $E(X)=3,85$ ne tombait sur aucune valeur de $X$. $V(X)=(6^2-1)/12=35/12\\approx2,917$.",
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Ces 2 formules ne valent que pour une loi uniforme',
          text: "Les raccourcis $E(X)=(n+1)/2$ et $V(X)=(n^2-1)/12$ supposent des probabilités toutes égales à $1/n$. Pour une loi non uniforme (comme l'exemple hypergéométrique ci-dessus, où $P(1)=1/2$ diffère nettement des 3 autres probabilités), reviens toujours à la formule générale pondérée — jamais ce raccourci !",
        },
        {
          kind: 'entrainement',
          title: 'Variables aléatoires discrètes et espérance',
          generatorId: '6gen49',
          description: ["Construis une loi de probabilité, puis calcule l'espérance, la variance et l'écart-type."],
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
            "$p$ (succès) porte l'exposant $k$ ; $(1-p)$ (échec) porte l'exposant $n-k$ — jamais l'inverse ! Le coefficient $C(n,k)$ compte les différentes positions possibles des $k$ succès parmi les $n$ épreuves — jamais optionnel dès que $0<k<n$.",
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
              text: "Détail du calcul pour $k=2$ : $P(X=2)=C(5,2)\\times0,4^2\\times0,6^3=10\\times0,16\\times0,216=0,3456$. Oublie $C(5,2)=10$ et tu obtiens $0,4^2\\times0,6^3=0,03456$ — dix fois trop petit !",
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
            "« Au moins $k$ » ou « au plus $k$ » avec beaucoup de termes → passe par le complément : $P(X\\geq1)=1-P(X=0)=1-0,07776=0,92224$ — bien plus rapide qu'une somme de 5 termes !",
          ],
        },
        {
          kind: 'attention',
          label: 'Le mauvais partenaire de complément',
          text: "Le complément de « au moins 1 succès », c'est « aucun succès » ($X=0$), **jamais** « tous des succès » ($X=5$) ! $1-P(X=5)=1-0,01024=0,98976$ serait une réponse fausse, même si elle a l'air plausible. Identifie toujours le seuil exact avant de choisir le complément : le contraire de « au moins $k$ » est « au plus $k-1$ », le contraire de « au plus $k$ » est « au moins $k+1$ ».",
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
          label: "Isoler n dans « au moins 1 succès »",
          items: [
            'Pour trouver le plus petit $n$ tel que $P(\\text{au moins 1 succès})>\\text{seuil}$ :',
            '$1-(1-p)^n>\\text{seuil} \\iff (1-p)^n<1-\\text{seuil} \\iff n > \\dfrac{\\ln(1-\\text{seuil})}{\\ln(1-p)}$',
          ],
        },
        {
          kind: 'attention',
          label: "Le sens de l'inégalité s'inverse",
          text: "$\\ln(1-p)$ est **toujours négatif** (car $0<1-p<1$) : diviser les deux membres d'une inégalité par un nombre négatif inverse son sens. C'est pour ça que l'inégalité finale utilise $>$ alors que la ligne d'avant utilisait $<$ — oublier cette inversion est LE piège de ce type d'exercice !",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — p=0,1, seuil=0,9',
          blocks: [
            { kind: 'para', text: '$n > \\dfrac{\\ln(0,1)}{\\ln(0,9)} \\approx 21,85 \\implies n=22$' },
            {
              kind: 'para',
              text: "Vérifions : $n=21$ ne suffit pas — $(0,9)^{21}\\approx0,109>0,1$, donc $P(\\text{au moins 1})\\approx0,891<0,9$. $n=22$ suffit — $(0,9)^{22}\\approx0,0985<0,1$, donc $P(\\text{au moins 1})\\approx0,9015>0,9$.",
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
          text: 'Le calcul par logarithme donne une valeur décimale (ici $21,85$). Le bon réflexe : recalcule $P$ pour $n=22$ (doit dépasser le seuil) et pour $n=21$ (doit encore être en dessous), pour confirmer que 22 est vraiment le plus petit entier qui convient.',
        },
        {
          kind: 'entrainement',
          title: 'Loi binomiale',
          generatorId: '6gen50',
          description: ['Reconnais un schéma de Bernoulli, calcule une probabilité binomiale, et résous un « trouver n ».'],
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
        {
          kind: 'para',
          text: "Jusqu'ici, une variable aléatoire ne prenait qu'un nombre fini de valeurs. Mais si la valeur observée peut être **n'importe quel réel d'un intervalle** — la graduation exacte où s'arrête une aiguille, la masse exacte d'un sachet de sucre — la probabilité qu'elle tombe pile sur une valeur précise est nulle ! Sinon, la somme des probabilités serait infinie, jamais égale à 1. On ne peut donc plus définir une loi valeur par valeur comme pour une variable discrète : on n'attribue une probabilité qu'à des événements définis par un **intervalle**.",
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
            "La **densité de probabilité** d'une variable aléatoire $X$ (dont les valeurs possibles forment un intervalle $[u;v]$ de $\\mathbb{R}$) est une fonction $f$ définie, continue et positive sur $[u;v]$, telle que :",
            "$\\displaystyle\\int_u^v f(t)\\,dt = 1$ ;",
            "et, pour tout intervalle $[a;b]$ contenu dans $[u;v]$ : $\\displaystyle P(a\\leq X\\leq b) = \\int_a^b f(t)\\,dt$.",
          ],
        },
        {
          kind: 'para',
          text: "La probabilité que $X$ tombe dans un intervalle $[a;b]$, c'est donc l'**aire sous la courbe** de $f$, entre les droites $x=a$ et $x=b$ — jamais la simple valeur $f(t)$ lue en un point !",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t: number) => Math.pow(t - 3, 2) / 36 + 1 / 12, tone: 'accent', xMin: 0, xMax: 6 }],
            shadedRegions: [{ from: 2, to: 4, upper: (t: number) => Math.pow(t - 3, 2) / 36 + 1 / 12, tone: 'accent' }],
            textLabels: [
              { x: 1.1, y: 0.31, text: 'y=f(t)', tone: 'ink', anchor: 'middle' },
              { x: 3, y: 0.04, text: 'P(a≤X≤b)', tone: 'accent', anchor: 'middle' },
            ],
            xMin: 0,
            xMax: 6,
            xTicks: [0, 2, 4, 6],
            xTickLabels: { 0: 'u', 2: 'a', 4: 'b', 6: 'v' },
            fixedYRange: { min: 0, max: 0.4 },
            xAxisLabel: 't',
            yAxisLabel: 'f(t)',
            caption:
              "Densité de probabilité f sur [u;v] : l'aire totale sous la courbe vaut toujours 1, et l'aire de la zone teintée, entre a et b, vaut exactement P(a≤X≤b).",
          },
        },
        {
          kind: 'definition',
          label: "Fonction de répartition d'une variable aléatoire continue",
          items: [
            "La **fonction de répartition** d'une variable continue $X$ est encore $F(x)=P(X\\leq x)$ — exactement la même définition que dans le cas discret. Mais son graphique change de nature : une courbe continue et croissante, plus du tout un escalier !",
          ],
        },
        { kind: 'subheading', text: 'Propriétés de la fonction de répartition et de la densité' },
        {
          kind: 'list',
          items: [
            "La fonction de répartition est dérivable sur $I$ et sa dérivée y est la densité de probabilité : $F'=f$.",
            'La fonction de répartition est croissante sur $I$.',
            'Quels que soient les réels $a$ et $b$ de $I$ (avec $a<b$) : $P(X=a)=0$ ;',
            '$P(X<a)=P(X\\leq a)=F(a)$ ;',
            '$P(X>a)=P(X\\geq a)=1-F(a)$ ;',
            '$P(a<X<b)=P(a\\leq X<b)=P(a<X\\leq b)=P(a\\leq X\\leq b)=F(b)-F(a)$.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Strict ou large : aucune différence en continu',
          text: "Puisque $P(X=a)=0$ pour toute valeur isolée, ajouter ou retirer une borne ne change **jamais** la probabilité d'un intervalle : $P(a<X<b)$ et $P(a\\leq X\\leq b)$ valent toujours pareil, $F(b)-F(a)$. C'est l'inverse exact du cas discret, où la valeur frontière $X=k$ pèse un vrai $P(X=k)$ et fait se recouvrir « au moins $k$ » et « au plus $k$ » (section 1).",
        },
        {
          kind: 'definition',
          label: "Espérance, variance et écart-type d'une variable aléatoire continue",
          items: [
            "L'**espérance mathématique** d'une variable aléatoire continue $X$ (valeurs possibles dans $[u;v]$ de $\\mathbb{R}$) se définit par :",
            '$\\displaystyle E(X) = \\int_u^v t\\cdot f(t)\\,dt$',
            "Sa **variance** est $\\displaystyle V(X) = \\int_u^v [t-E(X)]^2\\cdot f(t)\\,dt$, et son **écart-type** en est la racine carrée : $\\sigma(X)=\\sqrt{V(X)}$.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Le même écart-type qu’en statistique descriptive',
          text:
            "Tu as déjà rencontré la moyenne et l'écart-type d'une série de données, en statistique descriptive. L'idée ne change pas ici : $E(X)$ reste une moyenne, $\\sigma(X)$ reste une mesure de dispersion autour de cette moyenne. Seul l'outil de calcul change — une somme devient une intégrale, parce que $X$ prend maintenant une infinité de valeurs possibles, pas un nombre fini.",
        },
      ],
    },
    {
      id: 'discreteoucontinue',
      number: 4,
      title: 'Variable aléatoire discrète ? Variable aléatoire continue ?',
      blocks: [
        {
          kind: 'para',
          text: 'Les deux familles partagent exactement les mêmes notions — loi, fonction de répartition, espérance, variance, écart-type — mais chacune les porte avec un outil différent : une somme pondérée en discret, une intégrale en continu.',
        },
        {
          kind: 'featureTable',
          headers: ['', 'Variable aléatoire discrète', 'Variable aléatoire continue'],
          rows: [
            ['Nombre de valeurs', 'Fini ou dénombrable', 'Infini'],
            [
              'Probabilité',
              'La **loi de probabilité** donne la probabilité pour chaque valeur de $X$.',
              "La **fonction de densité** permet de calculer la probabilité qu'une valeur appartienne à un intervalle.",
            ],
            ['Fonction de répartition', 'Somme de probabilités', 'Intégrale de la fonction densité'],
            ['Espérance mathématique', '$\\displaystyle E(X)=\\sum_{i=1}^{n} p_i\\,x_i$', '$\\displaystyle E(X)=\\int_u^v t\\,f(t)\\,dt$'],
            [
              'Variance',
              '$\\displaystyle V(X)=\\sum_{i=1}^{n} p_i\\,x_i^2-[E(X)]^2$',
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
            "Pour $X$ uniformément réparti sur $[a;b]$, la densité est constante, égale à $1/(b-a)$. La probabilité d'un intervalle ne dépend alors que de sa **longueur** — jamais de sa position :",
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
          text: '$P(10\\leq X\\leq25)=15/60=0,25$ et $P(35\\leq X\\leq50)=15/60=0,25$ sont identiques ! Deux intervalles de même longueur ont toujours la même probabilité, peu importe où ils se trouvent dans $[a;b]$.',
        },
      ],
    },
    {
      id: 'loinormale',
      number: 6,
      title: 'Loi normale',
      blocks: [
        {
          kind: 'intuition',
          label: 'Pourquoi la courbe a cette forme de cloche',
          text:
            "Pense aux tailles des élèves d'une grande école : peu sont très petits, peu sont très grands, la majorité se regroupe autour d'une taille moyenne. C'est exactement le profil d'une loi normale — une bosse centrée sur $\\mu$, qui s'aplatit progressivement des deux côtés. Plus $\\sigma$ est petit, plus les valeurs sont serrées autour de la moyenne ; plus $\\sigma$ est grand, plus la cloche s'étale.",
        },
        {
          kind: 'definition',
          label: 'Une loi continue, lue via la fonction de répartition Φ',
          items: [
            "Une variable $X$ suivant une **loi normale** $N(\\mu,\\sigma)$ est une variable aléatoire continue, dont la densité dessine la courbe « en cloche » de Gauss. $P(X=x)$ vaut donc toujours 0 pour un réel $x$ précis — seule une probabilité sur un intervalle a un sens. On la lit ici via la **fonction de répartition** $\\Phi$ de la loi normale centrée réduite $N(0,1)$ : $\\Phi(z)=P(Z\\leq z)$.",
          ],
        },
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
              text: '$50-2\\times10=30$ et $50+2\\times10=70$ : environ $95,4\\%$ des valeurs tombent dans $[30;70]$. Donc $1-0,954=0,046$ (4,6%) tombent en dehors, tous côtés confondus.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Diviser par 2 pour un seul côté',
          text: "La probabilité d'être seulement au-dessus de 70 (un seul côté) n'est **jamais** le complément total ($4,6\\%$) ! La loi normale étant symétrique, ce complément se partage également entre les deux queues : $0,046/2=0,023$ (2,3%) pour un seul côté. Oublier cette division par 2 est l'erreur la plus fréquente de cette règle.",
        },
        {
          kind: 'definition',
          label: 'Standardisation',
          items: [
            "Pour utiliser la table de $\\Phi$ (construite uniquement pour $N(0,1)$), toute variable $X\\sim N(\\mu,\\sigma)$ doit d'abord être ramenée à une variable centrée réduite :",
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
              text: 'Standardisation : $z=(65-50)/10=1,5$. Lecture dans la table : $\\Phi(1,5)\\approx0,9332$, donc $P(X\\leq65)\\approx0,9332$.',
            },
            { kind: 'para', text: '« Au moins » est le complément de « au plus » : $P(X\\geq65)=1-\\Phi(1,5)\\approx1-0,9332=0,0668$.' },
            {
              kind: 'para',
              text: 'Par symétrie $\\Phi(-z)=1-\\Phi(z)$ : $P(X\\leq35)=\\Phi(-1,5)=1-\\Phi(1,5)\\approx0,0668$ — exactement la même valeur que $P(X\\geq65)$, logique puisque 35 et 65 sont symétriques autour de $\\mu=50$.',
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
          text: "$\\Phi(-1,5)$ n'est **pas** égal à $\\Phi(1,5)$ — $\\Phi$ n'est pas une fonction paire ! La vraie relation, c'est $\\Phi(-z)=1-\\Phi(z)$ (symétrie par rapport à 0,5, pas par rapport à l'axe des ordonnées) : $\\Phi(-1,5)\\approx0,0668$, très différent de $\\Phi(1,5)\\approx0,9332$.",
        },
        {
          kind: 'para',
          text: "Pour un intervalle de la loi centrée réduite, on soustrait toujours deux valeurs de $\\Phi$ — jamais on ne les additionne (le résultat pourrait même dépasser 1, signal d'alerte immédiat !) :",
        },
        { kind: 'para', text: '$P(1\\leq Z\\leq2) = \\Phi(2)-\\Phi(1) \\approx 0,9772-0,8413 = 0,1359$' },
        { kind: 'subheading', text: 'Sens inverse — retrouver z (ou x) depuis une probabilité' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Retrouve $z$ tel que $\\Phi(z)=p$ (table inversée, $\\Phi^{-1}$), puis, pour une loi générale $N(\\mu,\\sigma)$, dé-standardise :',
            '$x = \\mu+z\\times\\sigma$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — z tel que Φ(z)=0,95',
          blocks: [
            {
              kind: 'para',
              text: "$z\\approx1,645$ (le quantile à 95%, une valeur très utilisée). Attention : $1-0,95=0,05$ est une **probabilité**, pas une valeur de $z$ — il faut absolument passer par $\\Phi^{-1}$ pour convertir une probabilité en valeur de $z$ !",
            },
          ],
        },
        { kind: 'subheading', text: "S'assurer qu'une distribution statistique suit une loi normale" },
        {
          kind: 'methode',
          label: 'Les 2 vérifications à mener sur la série statistique',
          items: [
            'La moyenne, le mode et la médiane de la série statistique ont des valeurs approximativement égales.',
            'Les données se répartissent selon la règle empirique : environ $68,3\\%$ dans $[\\mu-\\sigma;\\mu+\\sigma]$, environ $95,4\\%$ dans $[\\mu-2\\sigma;\\mu+2\\sigma]$, environ $99,7\\%$ dans $[\\mu-3\\sigma;\\mu+3\\sigma]$.',
          ],
        },
        {
          kind: 'attention',
          label: 'Un critère pratique, jamais une démonstration',
          text: "En pratique, ces vérifications suffisent pour conclure que la loi est normale. Mais elles ne constituent pas, théoriquement, une condition suffisante : les satisfaire ne prouve jamais que la distribution est exactement normale.",
        },
        {
          kind: 'entrainement',
          title: 'Loi normale',
          generatorId: '6gen51',
          description: ['Standardise, lis la table de Φ, et applique la règle empirique.'],
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
        {
          kind: 'para',
          text: 'Cet exercice de clôture combine ce que les sections précédentes ont établi — « trouver n » en binomiale, sens inverse de la loi normale — avec le **théorème de Bayes** à 3 catégories, une approximation de la binomiale par la loi normale, une loi uniforme continue, et une loi discrète appliquée à une population entière.',
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
              text: 'Pour trouver le $n$ minimal tel que $P(\\text{au moins 1 succès})>0,8$ avec ce $p$ composé : $n>\\ln(0,2)/\\ln(0,85)\\approx9,90$, donc $n=10$ — exactement la même résolution par logarithme que la section précédente, juste appliquée à un $p$ obtenu par multiplication plutôt que donné directement.',
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
          text: "$p_1+p_2=0,8$ pour ce même « ET » est faux ! Un « ET » entre événements indépendants se traduit toujours par une **multiplication**, jamais une addition. Une somme dépasserait même chacune des 2 probabilités séparées — ce qui n'a aucun sens pour un « ET » (plus restrictif qu'un « OU »).",
        },
        { kind: 'subheading', text: 'Théorème de Bayes à 3 catégories' },
        {
          kind: 'definition',
          label: 'Probabilités totales et formule de Bayes',
          items: [
            'Une population se partitionne en 3 catégories, de proportions $q_1$, $q_2$, $q_3$ (somme=1). Un critère survient avec probabilité $r_i$ dans chaque catégorie. Probabilité totale du critère (formule des probabilités totales, 3 termes) :',
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
          text: "Répondre $q_3=0,25$ à la question « probabilité d'appartenir à la catégorie 3 sachant le sinistre » ignore complètement l'information du critère observé — tu confonds une probabilité **a priori** ($q_3$, avant observation) avec une probabilité **a posteriori** ($P(\\text{cat.3}\\mid\\text{sinistre})\\approx0,4545$, après observation).",
        },
        {
          kind: 'astuce',
          label: 'Toujours pondérer par le poids de chaque catégorie',
          text: "Faire la moyenne simple des 3 conditionnelles, $(0,1+0,2+0,4)/3\\approx0,233$, ignore que les catégories n'ont pas le même poids ($q_1,q_2,q_3$ différents) — exactement le même piège que pour l'espérance à la section 1 ! La vraie formule des probabilités totales pondère chaque $r_i$ par son $q_i$ : ça donne 0,22, pas 0,233.",
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
              text: 'Pour estimer $P(X\\leq55)$ : standardisation $z=(55-50)/5=1$, puis lecture de table $\\Phi(1)\\approx0,8413$ — exactement la même méthode que pour n\'importe quelle loi normale, une fois $\\mu$ et $\\sigma$ déterminés.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Confondre les 2 approximations de la binomiale',
          text: "L'approximation par une loi de Poisson (vue plus loin, $n\\geq30$, $p\\leq0,1$) et l'approximation par une loi normale ($n>30$, $0,3<p<0,7$) ont des domaines de validité qui **ne se chevauchent jamais** : la première sert pour un $p$ proche de 0 (événement rare), la seconde pour un $p$ proche de 0,5. Un $p$ intermédiaire (par exemple $p=0,2$) ne rentre dans aucune des deux — la binomiale exacte reste alors la seule option correcte.",
        },
        { kind: 'subheading', text: "Reconstruire une loi et appliquer l'espérance à une population" },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — offre à 3 formules',
          blocks: [
            {
              kind: 'para',
              text: '$20\\%$ des clients choisissent la formule Basique (15€), $30\\%$ la Standard (35€). Le 3ᵉ pourcentage se déduit par différence, jamais donné directement : $100-20-30=50\\%$ pour la Premium (60€).',
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
              text: "Appliqué à une population de 500 clients, la recette totale attendue se calcule en **multipliant** l'espérance par l'effectif — jamais en les additionnant !",
            },
            { kind: 'para', text: '$E(X)\\times500 = 43,5\\times500 = 21\\,750€$' },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique',
          text: "$43,5+500=543,5€$ n'a aucun sens dimensionnel — c'est un prix moyen additionné à un nombre de clients ! Multiplie toujours l'espérance par l'effectif pour obtenir un total attendu sur une population, jamais une addition.",
        },
        {
          kind: 'entrainement',
          title: 'Extensions binomiale, normale et Bayes',
          generatorId: '6gen52',
          description: ["Entraîne-toi sur les épreuves composées, le théorème de Bayes, l'approximation normale et la loi uniforme continue."],
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
        {
          kind: 'definition',
          label: 'Loi de Poisson, paramètre λ',
          items: [
            "La **loi de Poisson** de paramètre $\\lambda$ (le nombre moyen d'événements sur une unité donnée) modélise le comptage d'événements **rares et indépendants** — pannes, arrivées, défauts — sur un intervalle de temps ou un effectif :",
            '$P(X=k) = e^{-\\lambda}\\times\\dfrac{\\lambda^k}{k!} \\quad \\text{pour tout entier } k\\geq0$',
          ],
        },
        {
          kind: 'methode',
          label: 'Calcul itératif, jamais λᵏ et k! séparément',
          items: [
            'Pour un $\\lambda$ élevé, calculer $\\lambda^k$ et $k!$ séparément peut faire déborder chacun vers l\'infini (en machine), bien avant que leur rapport — toujours compris entre 0 et 1 — ne pose le moindre problème.',
            'La méthode stable part de $\\text{terme}_0=e^{-\\lambda}$, puis construit chaque terme suivant à partir du précédent : $\\text{terme}_i = \\text{terme}_{i-1} \\times \\dfrac{\\lambda}{i}$.',
          ],
        },
        {
          kind: 'para',
          text: "Construction itérative de $P(X=k)$ pour $\\lambda=4$ : $\\text{terme}_0=e^{-4}$, puis chaque terme suivant s'obtient en multipliant le précédent par $\\lambda/i$ :",
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
            'Les 3 conditions doivent **toutes** être vérifiées — un $n\\times p$ faible avec un $n$ trop petit ne suffit jamais !',
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
          text: "Contrairement à la loi binomiale (support fini, borné par $n$), la loi de Poisson a un support **infini** — il n'existe aucune borne « $n$ » à côté de laquelle un complément court serait naturel. « Au plus $k$ » se calcule donc toujours par une somme directe de 0 à $k$, jamais par complément !",
        },
        { kind: 'subheading', text: "Piège d'échelle — ajuster λ avant de calculer" },
        {
          kind: 'attention',
          label: "λ n'est jamais le taux de base recopié tel quel",
          text: '$\\lambda$ doit toujours être ajusté à l\'échelle exacte de la question posée : multiplicatif pour un contexte temporel (taux par minute × nombre de minutes), proportionnel pour un contexte effectif (taux « pour N » × effectif cible/N). Recopier le taux de base sans ajustement, c\'est LE piège le plus fréquent de cette famille !',
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
          text: "Pour une loi de Poisson, l'espérance et la variance sont toutes les deux égales à $\\lambda$ — une propriété assez rare : dans la plupart des lois, espérance et variance sont différentes !",
        },
        {
          kind: 'entrainement',
          title: 'Loi de Poisson',
          generatorId: '6gen53',
          description: ["Entraîne-toi sur la loi de Poisson, l'approximation binomiale→Poisson, et l'ajustement d'échelle de λ."],
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
        ['Fonction de répartition', '$F(x)=P(X\\leq x)$ — graphique en escaliers'],
        ['Espérance discrète', '$E(X)=\\sum x_iP(X=x_i)$ — moyenne pondérée, jamais une moyenne simple'],
        ['Variance et écart-type', '$V(X)=E(X^2)-[E(X)]^2$ ; $\\sigma(X)=\\sqrt{V(X)}$'],
        ['Événements contraires', 'intersection vide et union complète — jamais juste « somme=1 »'],
        ["Loi hypergéométrique", "$E(X)=nK/N$ — cas particulier d'une loi discrète"],
        ['Loi uniforme discrète', '$E(X)=(n+1)/2$, $V(X)=(n^2-1)/12$ — cas particulier'],
        ['Loi binomiale', '$P(X=k)=C(n,k)p^k(1-p)^{n-k}$ ; $E(X)=np$, $V(X)=np(1-p)$'],
        ['Trouver n (binomiale)', '$n>\\ln(1-\\text{seuil})/\\ln(1-p)$ — inversion du sens car $\\ln(1-p)<0$'],
        ['Densité de probabilité', "$\\int_u^v f(t)\\,dt=1$ et $P(a\\leq X\\leq b)=\\int_a^b f(t)\\,dt$ — une aire sous la courbe, jamais une valeur $f(t)$"],
        ['Variable aléatoire continue', '$P(X=a)=0$ ; $P(a<X<b)=P(a\\leq X\\leq b)=F(b)-F(a)$ — strict ou large, même probabilité'],
        ['Discrète ou continue', '$\\sum p_ix_i$ devient $\\int t\\,f(t)\\,dt$ — mêmes notions, deux outils ; $\\sigma(X)=\\sqrt{V(X)}$ dans les 2 cas'],
        ['Loi uniforme continue', '$P(c\\leq X\\leq d)=(d-c)/(b-a)$ ; $E(X)=(a+b)/2$, $V(X)=(b-a)^2/12$'],
        ['Loi normale', 'loi continue ; $Z=(X-\\mu)/\\sigma$ ; $\\Phi(z)=P(Z\\leq z)$'],
        ['Règle empirique', '68,3% / 95,4% / 99,7% pour k=1, 2, 3 écarts-types'],
        ['Vérifier la normalité', 'moyenne ≈ mode ≈ médiane, et répartition 68,3 / 95,4 / 99,7% — critère pratique, jamais une preuve'],
        ['Bayes à 3 catégories', '$P(\\text{cat.}j\\mid\\text{critère})=q_jr_j/P_{totale}$'],
        ['Approximation binomiale→normale', '$n>30$, $0,3<p<0,7 \\implies \\mu=np$, $\\sigma=\\sqrt{np(1-p)}$'],
        ['Loi de Poisson', '$P(X=k)=e^{-\\lambda}\\lambda^k/k!$ ; $E(X)=V(X)=\\lambda$'],
        ['Approximation binomiale→Poisson', '$n\\geq30$, $p\\leq0,1$, $np\\leq15 \\implies \\lambda=np$'],
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
