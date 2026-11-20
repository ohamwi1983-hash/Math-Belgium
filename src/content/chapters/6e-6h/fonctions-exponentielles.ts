import type { ChapterContent } from '../../types'

export const fonctionsExponentielles: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 2,
  title: 'Fonctions exponentielles',
  slug: 'fonctions-exponentielles',
  lede:
    "Une population qui double, une épidémie qui explose, un capital qui grossit tout seul : tu " +
    "vas retrouver la même fonction partout, $a^x$. Elle a une propriété unique — sa vitesse de " +
    "croissance est toujours proportionnelle à sa propre valeur — et c'est exactement ce qui " +
    "rend $e^x$ à part : parmi toutes les exponentielles $a^x$, c'est la seule qui est sa " +
    'propre dérivée.',

  sections: [
    {
      id: 'limites',
      number: 1,
      title: 'Calcul de limites',
      kicker: "la position de la base par rapport à 1, puis la dominance sur tout polynôme",
      blocks: [
        { kind: 'video', title: 'Calcul de limites', youtubeId: '6s2MCrsEoTw' },
        {
          kind: 'intuition',
          label: 'Une bactérie qui se divise',
          text:
            'Imagine une seule bactérie dans une boîte, qui se divise en deux toutes les ' +
            'heures : 1, puis 2, puis 4, puis 8… Après une journée, elles se comptent déjà par ' +
            'millions ! Un capital placé à intérêts composés, une rumeur qui se propage, une ' +
            'épidémie qui démarre : ces phénomènes suivent tous le même principe — à chaque pas ' +
            "de temps, ce n'est pas une quantité fixe qui s'ajoute, mais un facteur constant qui " +
            "multiplie ce qu'il y avait déjà. C'est exactement l'idée derrière toute fonction " +
            'exponentielle.',
        },
        {
          kind: 'para',
          text:
            "Une quantité peut évoluer de deux façons, à intervalles de temps égaux. Façon " +
            "**linéaire** : elle augmente toujours de la même valeur. Façon **exponentielle** : " +
            'elle est multipliée à chaque fois par le même facteur.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — comparer les deux modèles',
          blocks: [
            {
              kind: 'para',
              text:
                'Un robinet remplit une citerne à débit constant $d$. La quantité suit ' +
                "$f(t) = d \\cdot t + q_0$ — une fonction du premier degré, donc une croissance " +
                '**linéaire**.',
            },
            {
              kind: 'para',
              text:
                "Une surface d'algues double chaque semaine. En notant $S_0$ la surface " +
                'initiale, elle vaut $S_0 \\cdot 2^t$ après $t$ semaines entières. Ici, ce ' +
                "n'est pas une quantité fixe qui s'ajoute à chaque semaine, mais un " +
                "**facteur** constant (×2) qui s'applique. C'est ça, une croissance " +
                '**exponentielle**.',
            },
            {
              kind: 'para',
              text:
                "Mais rien n'oblige à s'arrêter aux semaines entières ! Le facteur " +
                'multiplicatif quotidien $k$ doit lui aussi être constant, et sept jours de ' +
                'suite doivent redonner le facteur hebdomadaire : $k^7 = 2$, donc ' +
                '$k = \\sqrt[7]{2} = 2^{1/7}$. Après 3 jours, la surface est multipliée par ' +
                '$\\left(2^{1/7}\\right)^3 = 2^{3/7}$ ; après 7 jours, par ' +
                "$\\left(2^{1/7}\\right)^7 = 2$ — on retombe bien sur le facteur d'une semaine.",
            },
            {
              kind: 'para',
              text:
                'En généralisant : pour une durée de $\\dfrac{n}{p}$ semaines, la surface est ' +
                "multipliée par $2^{n/p}$. Et **avant** l'instant initial, il faut au contraire " +
                '**diviser** par $2^{n/p}$, donc multiplier par $2^{-n/p}$. Pour tout $t$ ' +
                '**rationnel** — positif ou négatif — tu obtiens donc toujours la même ' +
                'écriture : $f(t) = S_0 \\cdot 2^t$.',
            },
            {
              kind: 'para',
              text:
                'Toutes ces définitions de puissance que tu as vues les années précédentes ' +
                '(exposant entier, fractionnaire, positif, négatif) racontent en fait la même ' +
                'histoire. Il reste un dernier pas à franchir : donner un sens à $2^t$ quand ' +
                '$t$ est **irrationnel** — exactement ce que fait la définition qui suit.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (t) => 1.2 * t + 3, tone: 'faint' },
              { fn: (t) => Math.pow(2, t), tone: 'accent' },
            ],
            xMin: -0.6,
            xMax: 3.5,
            xTicks: [1, 2, 3],
            fixedYRange: { min: -1, max: 10 },
            textLabels: [
              { x: 3.45, y: 2.4, text: 'S₀·2ᵗ : ×2 par semaine', tone: 'accent', anchor: 'end' },
              { x: 0.2, y: 6.1, text: '1,2t+3 : +1,2 par semaine', tone: 'faint', anchor: 'start' },
            ],
            points: [
              { x: 0, y: 1, label: 'S₀', tone: 'accent' },
              { x: 1, y: 2, label: '2S₀', tone: 'accent' },
              { x: 2, y: 4, label: '4S₀', tone: 'accent' },
              { x: 3, y: 8, label: '8S₀', tone: 'accent' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'S',
            caption:
              'Les deux modèles sur les mêmes axes. En fané, le modèle linéaire : à chaque pas ' +
              'de temps on **ajoute** toujours la même quantité (+1,2), et le graphique est une ' +
              'droite. En accent, le modèle exponentiel : à chaque pas on **multiplie** par le même ' +
              'facteur (×2), et les valeurs S₀, 2S₀, 4S₀, 8S₀ se succèdent. Le modèle linéaire ' +
              "part pourtant plus haut — l'exponentiel ne le rattrape que vers t ≈ 2,6, puis ne " +
              'se laisse plus jamais rejoindre.',
          },
        },
        {
          kind: 'historique',
          titre: 'Quand la croissance exponentielle a changé la vision du monde',
          text:
            "En 1798, l'économiste anglais **Thomas Malthus** publie un essai qui va marquer " +
            'durablement la pensée économique et scientifique : il affirme que la population ' +
            "humaine croît de façon **exponentielle** (elle double régulièrement), alors que " +
            'les ressources alimentaires ne peuvent croître que de façon **linéaire** (un ' +
            "champ supplémentaire cultivé ajoute toujours la même quantité de nourriture, il " +
            'ne la multiplie pas). Sa conclusion, pessimiste, est que la population finira ' +
            'toujours par dépasser ce que la terre peut nourrir — exactement le phénomène que ' +
            'tu viens d\'observer sur le graphique ci-dessus, où le modèle exponentiel finit ' +
            'toujours par dépasser le modèle linéaire, même s\'il part plus bas. Son essai ' +
            "influencera profondément Charles Darwin dans sa théorie de l'évolution par " +
            'sélection naturelle.',
          image: {
            src: '/images/historique/malthus.jpg',
            alt: 'Portrait de Thomas Robert Malthus',
            caption: 'Thomas Robert Malthus (1766–1834), portrait du 19e siècle.',
          },
        },
        {
          kind: 'definition',
          label: 'Définition — fonction exponentielle de base a',
          items: [
            "Pour $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$, il existe une unique fonction " +
              "$f : \\mathbb{R} \\to \\mathbb{R}$, continue, telle que $f(x) = a^x$ pour tout $x$ " +
              "rationnel (théorème admis). Cette fonction, notée $\\exp_a$, **prolonge " +
              "naturellement** la puissance $a^x$ à tout exposant réel, irrationnel compris : " +
              "on pose $a^x = \\exp_a(x)$, par définition.",
            "Pour $a = 1$, la fonction est constante — toujours égale à 1. Ce n'est donc pas " +
              "vraiment une exponentielle, d'où la condition $a \\neq 1$.",
          ],
        },
        {
          kind: 'application',
          titre: 'Pourquoi chaque note de musique est une puissance de 2',
          image: {
            src: '/images/application/piano-keys.jpg',
            alt: 'Clavier de piano vu de dessus',
            caption:
              'Les touches du piano sont accordées sur la gamme tempérée, répartie selon des ' +
              "puissances de 2. Photo : Scott Detwiler, CC BY-SA 3.0, via Wikimedia Commons.",
          },
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (n) => 440 * Math.pow(2, n / 12), tone: 'accent' }],
              xMin: 0,
              xMax: 12,
              xTicks: [0, 6, 12],
              fixedYRange: { min: 0, max: 920 },
              points: [
                { x: 0, y: 440, label: '440 Hz (la)', tone: 'accent', labelPos: 'above' },
                { x: 12, y: 880, label: '880 Hz (la, octave+)', tone: 'accent', labelPos: 'left' },
              ],
              xAxisLabel: 'n (demi-tons)',
              yAxisLabel: 'fréquence (Hz)',
              caption:
                '$f(n) = 440 \\cdot 2^{n/12}$ : 12 demi-tons égaux multiplient bien la fréquence ' +
                'par 2 au total (doublement = une octave).',
            },
            {
              kind: 'curvePlot',
              curves: [
                { fn: (n) => 440 * Math.pow(2, n / 12), tone: 'accent' },
                { fn: (n) => 440 + ((880 - 440) * n) / 12, tone: 'faint' },
              ],
              xMin: 0,
              xMax: 12,
              xTicks: [0, 6, 12],
              fixedYRange: { min: 0, max: 920 },
              textLabels: [
                { x: 3.2, y: 560, text: 'linéaire (faux)', tone: 'faint', anchor: 'start' },
                { x: 1, y: 820, text: 'vraie gamme', tone: 'accent', anchor: 'start' },
              ],
              xAxisLabel: 'n (demi-tons)',
              yAxisLabel: 'fréquence (Hz)',
              caption:
                'Si les fréquences augmentaient par **pas égaux** (droite grise), les demi-tons ' +
                'ne sonneraient pas également espacés à l\'oreille. C\'est le **rapport** constant ' +
                'entre deux notes voisines ($\\times 2^{1/12}$), pas leur différence, qui donne une ' +
                'gamme régulière — d\'où la vraie courbe exponentielle, en orange.',
            },
          ],
          text:
            'Le piano moderne (et presque tous les instruments occidentaux) utilise la ' +
            '**gamme tempérée** : l\'octave est divisée en 12 demi-tons **égaux**, où chaque ' +
            'demi-ton multiplie la fréquence par le même facteur. Comme 12 demi-tons doivent ' +
            'exactement doubler la fréquence (une octave plus haut), ce facteur vaut ' +
            '$2^{1/12} = \\sqrt[12]{2} \\approx 1{,}0595$ — un nombre irrationnel, mais un ' +
            'exposant **rationnel** : c\'est une racine douzième de 2, déjà définie avant le ' +
            'prolongement aux exposants réels. Un nombre comme $2^{\\sqrt{2}}$, lui, n\'a de ' +
            'sens que grâce à la définition ci-dessus. La fréquence de la note $n$ ' +
            "demi-tons au-dessus d'une fréquence de référence $f_0$ (souvent le la à 440 Hz) " +
            'vaut donc $f(n) = f_0 \\cdot 2^{n/12}$ : une vraie fonction exponentielle, dont ' +
            "l'exposant $n$ parcourt les touches du clavier.",
          domaines: ['Musique', 'Acoustique'],
        },
        {
          kind: 'methode',
          label: 'Propriétés des puissances à exposants réels',
          items: [
            "Pour $a, b \\in \\mathbb{R}_0^+$ et $r, s \\in \\mathbb{R}$ : ce sont exactement " +
              "les mêmes règles qu'avec des exposants entiers ou rationnels, rien de nouveau à " +
              'apprendre :',
            "**(1)** $a^r \\cdot a^s = a^{r+s} \\qquad$ **(2)** $\\dfrac{a^r}{a^s} = a^{r-s}$",
            "**(3)** $(a \\cdot b)^r = a^r \\cdot b^r \\qquad$ **(4)** $(a^r)^s = a^{r \\cdot s}$",
            "Ces quatre règles ne sont que l'**extension**, aux exposants réels, de règles que " +
              "tu connais déjà pour les exposants rationnels. Admises sans démonstration ici " +
              "(une preuve complète relève de l'analyse réelle). Tu les retrouveras citées par " +
              'leur numéro, (1) à (4), dans toutes les démonstrations du chapitre.',
            "Attention à la condition sur les bases ! Si $a$ ou $b$ n'est pas strictement " +
              'positif, ces égalités restent parfois vraies pour certaines valeurs de $r$ et ' +
              "$s$, mais plus pour toutes. Et la règle (2) ne marche **jamais** si $a = 0$ : " +
              'diviser par $0^s = 0$ n\'a aucun sens.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi a⁰ vaut-il 1 ?',
          text:
            "Tu connais déjà cette règle, mais d'où vient-elle vraiment ? Prends n'importe " +
            'quel nombre $a \\neq 0$ et regarde $\\dfrac{a^n}{a^n}$ : ce rapport vaut ' +
            "évidemment 1, quel que soit $n$. Or la règle (2) donne aussi " +
            '$\\dfrac{a^n}{a^n} = a^{n-n} = a^0$. Les deux écritures désignent le même ' +
            "nombre : $a^0$ vaut donc 1, exactement pour la raison qu'une quantité divisée " +
            "par elle-même vaut toujours 1 — ce n'est pas une convention tombée du ciel, " +
            'juste une conséquence directe des règles de puissances.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — une exponentielle est toujours strictement positive',
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $a \\in \\mathbb{R}_0^+$ et $x \\in \\mathbb{R}$. On montre que $a^x > 0$, " +
                'en deux temps : $a^x$ n\'est jamais négatif, puis $a^x$ n\'est jamais nul.',
            },
            {
              kind: 'para',
              text:
                "**1) Jamais négatif.** On écrit $x = \\dfrac{x}{2} + \\dfrac{x}{2}$ et on " +
                'applique la règle **(1)** :',
            },
            { kind: 'para', text: '$a^x = a^{\\frac{x}{2}} \\cdot a^{\\frac{x}{2}} = \\left(a^{\\frac{x}{2}}\\right)^2 \\ge 0$' },
            {
              kind: 'para',
              text: 'car un carré n\'est jamais négatif.',
            },
            {
              kind: 'para',
              text:
                "**2) Jamais nul.** Toujours par la règle **(1)**, puis $a^0 = 1$ :",
            },
            { kind: 'para', text: '$a^x \\cdot a^{-x} = a^{x + (-x)} = a^0 = 1$' },
            {
              kind: 'para',
              text:
                'Si $a^x$ valait 0, le membre de gauche vaudrait 0, et non 1. Donc ' +
                '$a^x \\neq 0$.',
            },
            {
              kind: 'para',
              text:
                "Un nombre positif ou nul qui n'est pas nul est strictement positif : " +
                '$a^x > 0$ pour tout réel $x$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "Deux conséquences servent dans tout le chapitre : la courbe de $a^x$ reste " +
                "entièrement au-dessus de l'axe des abscisses, et une équation comme $a^x = 0$ " +
                "ou $a^x = -3$ n'a aucune solution. La seconde égalité donne aussi " +
                '$a^{-x} = \\dfrac{1}{a^x}$.',
            },
          ],
        },
        {
          kind: 'para',
          text:
            "En l'infini, le comportement d'une fonction exponentielle $a^x$ ($a>0$, " +
            "$a \\neq 1$) ne dépend que d'une seule chose : où se trouve $a$ par rapport à 1.",
        },
        {
          kind: 'intuition',
          label: 'Pourquoi la courbe ne touche jamais l’axe des x',
          text:
            "Pense à une substance radioactive dont la moitié disparaît à chaque durée fixe : " +
            'après une demi-vie il en reste la moitié, après deux il en reste un quart, après ' +
            'trois un huitième… La quantité restante est toujours divisée par deux, donc elle ' +
            'ne peut jamais tomber à zéro — elle s\'en approche indéfiniment, sans jamais ' +
            "l'atteindre. C'est exactement ce que fait une exponentielle $a^x$ avec $0<a<1$ " +
            'quand $x$ grandit : elle se rapproche de 0 sans jamais le toucher. La droite ' +
            '$y=0$ est une **asymptote horizontale**.',
        },
        {
          kind: 'featureTable',
          headers: ['Base', 'limite en −∞', 'limite en +∞'],
          rows: [
            ['a > 1', '0', '+∞'],
            ['0 < a < 1', '+∞', '0'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.pow(2, x), tone: 'accent' }],
            xMin: -3,
            xMax: 3,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -0.5, max: 9 },
            horizontalAsymptotes: [{ y: 0, label: 'asymptote y=0' }],
            points: [
              { x: 0, y: 1, label: '(0;1)', tone: 'accent' },
              { x: 1, y: 2, label: '(1;2)', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'a > 1 (ici a=2) : croissante, tend vers 0 en −∞ et vers +∞ en +∞',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.pow(0.5, x), tone: 'accent' }],
            xMin: -3,
            xMax: 3,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -0.5, max: 9 },
            horizontalAsymptotes: [{ y: 0, label: 'asymptote y=0' }],
            points: [
              { x: 0, y: 1, label: '(0;1)', tone: 'accent' },
              { x: 1, y: 0.5, label: '(1;0,5)', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: '0 < a < 1 (ici a=0,5) : décroissante, comportement inversé',
          },
        },
        {
          kind: 'atelier',
          tag: 'exponentielle-widget',
          label: 'Manipule toi-même — fais varier la base a',
          caption:
            'Le graphe se met à jour en direct. Repère le point fixe (0;1), toujours présent, ' +
            'et le point (1;a) qui bouge avec le curseur — ses pointillés donnent directement ' +
            'sa valeur sur les deux axes. Observe le basculement croissante/décroissante ' +
            'autour de a=1.',
        },
        {
          kind: 'astuce',
          label: '💡 Le cas de e',
          text:
            "$e \\approx 2{,}718 > 1$. La fonction $e^x$ suit donc toujours le premier cas de " +
            'la table ci-dessus : croissante, tend vers 0 en −∞, vers +∞ en +∞.',
        },
        { kind: 'subheading', text: 'La règle de dominance' },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà, et ce qui change',
          text:
            'Une fonction du premier degré grandit toujours **du même pas** : chaque unité de ' +
            'x ajoute la même valeur constante. Une fonction exponentielle, elle, grandit ' +
            "d'un pas qui **grossit lui-même** à chaque fois, puisqu'il est multiplié par un " +
            'facteur constant plutôt qu\'additionné. Au début, un polynôme comme $x^{1000}$ ' +
            "peut sembler beaucoup plus grand — mais l'écart entre deux valeurs d'une " +
            "exponentielle continue de s'amplifier indéfiniment, alors que celui d'un " +
            "polynôme ralentit relativement. Tôt ou tard, l'exponentielle rattrape et dépasse " +
            'n\'importe quel polynôme, aussi impressionnant soit-il au départ.',
        },
        {
          kind: 'historique',
          titre: "La légende qui a fait comprendre la puissance de l'exponentielle",
          text:
            'Une vieille légende, probablement apocryphe, raconte qu\'un roi indien voulut ' +
            "récompenser l'inventeur du jeu d'échecs et lui demanda ce qu'il souhaitait. Le " +
            'sage demanda une récompense modeste en apparence : un grain de riz sur la ' +
            'première case de l\'échiquier, deux sur la deuxième, quatre sur la troisième, et ' +
            'ainsi de suite en doublant à chaque case — 64 cases en tout. Le roi, amusé par ' +
            'une demande qui lui semblait dérisoire, accepta aussitôt... avant de découvrir ' +
            'que la dernière case à elle seule exigerait $2^{63}$ grains de riz, soit bien ' +
            'plus de riz que l\'humanité n\'en a jamais produit. Cette histoire illustre ' +
            'exactement ce que tu es en train d\'apprendre : une croissance exponentielle ' +
            'part lentement, presque invisible, puis explose bien au-delà de toute intuition.',
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            "Pour toute base $a > 1$, l'exponentielle $a^x$ finit **toujours** par l'emporter " +
              "sur n'importe quelle puissance de $x$ — même avec un degré ou un coefficient " +
              'énorme :',
            "$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{x^n}{a^x} = 0 \\quad$ pour tout entier $n$",
            "Côté $-\\infty$, la même dominance donne, en posant $x = -u$ (donc $u \\to +\\infty$) : " +
              "$x^n \\cdot a^x = \\dfrac{(-u)^n}{a^u}$, d'où " +
              "$\\displaystyle\\lim_{x \\to -\\infty} x^n \\cdot a^x = 0$.",
            'Cette règle est **démontrée** à la fin de la section 2, une fois la dérivée de ' +
              '$a^x$ connue.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            // eˣ = x³ : croisements calculés par dichotomie, x ≈ 1,857 (y ≈ 6,41) et x ≈ 4,536 (y ≈ 93,3).
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x, tone: 'faint' },
              { fn: Math.exp, tone: 'accent' },
            ],
            xMin: -0.4,
            xMax: 5.3,
            xTicks: [1.857, 3, 4.536],
            xTickLabels: { 1.857: '1,86', 4.536: '4,54' },
            yTicks: [50, 100, 150],
            fixedYRange: { min: -10, max: 175 },
            textLabels: [
              { x: 3.05, y: 45, text: 'x³', tone: 'faint', anchor: 'start' },
              { x: 2.75, y: 10, text: 'eˣ', tone: 'accent', anchor: 'start' },
              { x: 4.85, y: 150, text: 'eˣ repasse devant', tone: 'accent', anchor: 'end' },
            ],
            points: [
              { x: 1.857, y: Math.exp(1.857), label: '', tone: 'good' },
              { x: 4.536, y: Math.exp(4.536), label: '', tone: 'good' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'En accent, $e^x$ ; en fané, $x^3$. Entre $x \\approx 1{,}86$ et ' +
              '$x \\approx 4{,}54$, le polynôme est devant (par exemple $3^3 = 27 > e^3 \\approx 20$), ' +
              'mais à partir de $x \\approx 4{,}54$ l\'exponentielle le dépasse pour de bon : ' +
              '$e^5 \\approx 148 > 5^3 = 125$.',
          },
        },
        {
          kind: 'piege',
          text:
            "$\\displaystyle\\lim_{x \\to +\\infty} (2^x - x^{1000}) = +\\infty$, **pas** $-\\infty$ ! Même " +
            "avec un exposant polynomial énorme, l'exponentielle finit toujours par gagner — " +
            'le signe du terme polynomial ne change jamais la conclusion.',
        },
        {
          kind: 'exemple',
          badge: 'forme ∞ · 0',
          formula: '$\\displaystyle\\lim_{x \\to +\\infty} x^2 \\cdot e^{-x}$',
          steps: [
            {
              tag: 'réécrire en quotient pour faire apparaître la dominance',
              text: '$x^2 \\cdot e^{-x} = \\dfrac{x^2}{e^x}$',
            },
            {
              tag: 'les deux limites, forme indéterminée ∞/∞',
              text: '$\\displaystyle\\lim_{x \\to +\\infty} x^2 = +\\infty \\quad$ et $\\quad \\displaystyle\\lim_{x \\to +\\infty} e^x = +\\infty$',
            },
          ],
          result: { tag: 'eˣ domine : résultat', text: '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{x^2}{e^x} = 0$' },
        },
        { kind: 'subheading', text: 'La limite fondamentale en 0' },
        {
          kind: 'definition',
          label: 'À retenir',
          items: [
            '$\\displaystyle\\lim_{x \\to 0} \\dfrac{e^x - 1}{x} = 1$',
            "Cette limite, c'est en fait le nombre dérivé de $e^x$ en 0 : elle est démontrée " +
              'à la section 2, avec sa version pour une base $a$ quelconque, ' +
              '$\\displaystyle\\lim_{x \\to 0} \\dfrac{a^x - 1}{x} = \\ln(a)$.',
          ],
        },
        {
          kind: 'para',
          text:
            "D'autres formes indéterminées $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$ ne se " +
            'ramènent ni à la dominance ni à cette limite de référence. La section 2 donne pour ' +
            'elles un outil général, qui utilise les dérivées : la **règle de L\'Hôpital**.',
        },
        {
          kind: 'entrainement',
          title: 'Calcul de limites',
          generatorId: '6gen6',
          description: [
            'Calcule des limites de fonctions exponentielles : joue avec la position de la ' +
              'base par rapport à 1, puis avec la règle de dominance sur tout polynôme. ' +
              "Certaines limites demandent la règle de L'Hôpital, vue à la section 2.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 6. Calcul de limites »',
        },
      ],
    },
    {
      id: 'derivee',
      number: 2,
      title: 'Domaine et dérivée',
      kicker: "(aˣ)' = ln(a)·aˣ — et le cas particulier de e",
      blocks: [
        { kind: 'video', title: 'Domaine et dérivée', youtubeId: 'M2Bk_FhjiQ4' },
        {
          kind: 'para',
          text:
            "$a^x$ est définie sur $\\mathbb{R}$ tout entier, quelle que soit la base $a>0$ " +
            "($a \\neq 1$). Seule une composition avec une autre fonction (racine, fraction…) " +
            'peut restreindre ce domaine.',
        },
        {
          kind: 'definition',
          label: 'Formule générale',
          items: [
            "$(a^x)' = \\ln(a) \\cdot a^x$",
            "Cas particulier essentiel : $\\ln(e) = 1$, donc $(e^x)' = e^x$ — $e^x$ est sa " +
              'propre dérivée, et $e$ est la seule base $a$ dans ce cas. (Les fonctions ' +
              "$k \\cdot e^x$ sont elles aussi égales à leur dérivée, mais ce ne sont pas des " +
              'exponentielles $a^x$ si $k \\neq 1$.)',
            'Ces deux formules ne sont pas à apprendre par cœur sans comprendre : elles sont ' +
              '**démontrées** en fin de section, à partir de la seule définition du nombre ' +
              'dérivé.',
          ],
        },
        {
          kind: 'piege',
          text:
            "$(2^x)'$ **n'est pas** $2^x$ ! Il manque le facteur $\\ln(2)$ : " +
            "$(2^x)' = \\ln(2) \\cdot 2^x$. Seule la base $e$ se dérive « sans rien changer ».",
        },
        { kind: 'subheading', text: 'Exemples résolus' },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: "$f(x) = 5^x \\implies f'(x) = \\ln(5) \\cdot 5^x$." },
            {
              kind: 'para',
              text:
                "$g(x) = e^{3x-1} \\implies$ règle de la chaîne, $u=3x-1$, $u'=3$ : " +
                "$g'(x) = 3e^{3x-1}$.",
            },
            {
              kind: 'para',
              text:
                "$k(x) = 3^{x^4-x}$ : base $\\ne e$ **et** exposant composé, donc les deux " +
                'facteurs apparaissent. Avec $u(x) = x^4-x$ :',
            },
            {
              kind: 'para',
              text:
                "$k'(x) = u'(x) \\cdot 3^{u(x)} \\cdot \\ln(3) = \\left(4x^3-1\\right) \\cdot " +
                '3^{x^4-x} \\cdot \\ln(3)$',
            },
            {
              kind: 'para',
              text:
                "$m(x) = e^{\\sin(x)}$ : base $e$, donc pas de facteur $\\ln$ — mais la chaîne " +
                "reste quand même ! $m'(x) = \\left(\\sin x\\right)' \\cdot e^{\\sin x} = " +
                '\\cos(x) \\cdot e^{\\sin x}$.',
            },
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les quatre formules de dérivation, en notations fonctionnelles et en pratique',
          headers: ['Notation fonctionnelle', 'En pratique', 'Exemple'],
          rows: [
            ["$\\exp_a' = \\ln(a) \\cdot \\exp_a$", "$(a^x)' = a^x \\cdot \\ln(a)$", "$(3^x)' = 3^x \\cdot \\ln(3)$"],
            ["$(\\exp_a \\circ f)' = \\ln(a) \\cdot f' \\cdot (\\exp_a \\circ f)$", "$\\left(a^{f(x)}\\right)' = f'(x) \\cdot a^{f(x)} \\cdot \\ln(a)$", "$\\left(3^{x^4-x}\\right)' = (4x^3-1) \\cdot 3^{x^4-x} \\cdot \\ln(3)$"],
            ["$\\exp' = \\exp$", "$(e^x)' = e^x$", "$(e^x)' = e^x$"],
            ["$(\\exp \\circ f)' = f' \\cdot (\\exp \\circ f)$", "$\\left(e^{f(x)}\\right)' = f'(x) \\cdot e^{f(x)}$", "$\\left(e^{\\sin x}\\right)' = \\cos(x) \\cdot e^{\\sin x}$"],
          ],
        },
        { kind: 'subheading', text: "Composer une exponentielle peut restreindre le domaine" },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$h(x) = e^{\\sqrt{x-2}}$' },
            {
              kind: 'para',
              text:
                "$e^{\\ldots}$ est définie partout, mais la racine carrée, elle, exige " +
                '$x-2 \\ge 0$. Domaine de $h$ : $[2\\,;\\,+\\infty[$.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Astuce méthodologique',
          items: [
            "Pour dériver $a^{g(x)}$, c'est toujours le même motif, quelle que soit la " +
              "base $a$ : tu multiplies par $g'(x)$ et par $\\ln(a)$.",
          ],
        },
        { kind: 'subheading', text: "Pour aller plus loin — d'où vient le facteur ln(a) ?" },
        {
          kind: 'exempleLibre',
          label: "Démonstration — la dérivée de aˣ est un multiple de aˣ",
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $a \\in \\mathbb{R}_0^+$ et soit $f : \\mathbb{R} \\to \\mathbb{R} : " +
                "x \\mapsto a^x$. On ne suppose rien de connu sur la dérivée de $f$ : on repart " +
                "de zéro, de la **définition** du nombre dérivé comme limite du taux " +
                "d'accroissement.",
            },
            {
              kind: 'para',
              text:
                "**Étape 1.** On écrit le taux d'accroissement de $f$ entre $x$ et $x+h$, tout " +
                'droit à partir de la définition :',
            },
            {
              kind: 'para',
              text: "$\\dfrac{f(x+h) - f(x)}{h} = \\dfrac{a^{x+h} - a^x}{h}$",
            },
            {
              kind: 'para',
              text:
                "**Étape 2.** Le numérateur se factorise. Par la règle **(1)**, " +
                "$a^{x+h} = a^x \\cdot a^h$ : les deux termes ont donc $a^x$ en facteur commun.",
            },
            {
              kind: 'para',
              text:
                "$= \\dfrac{a^x \\cdot a^h - a^x}{h} = \\dfrac{a^x \\left(a^h - 1\\right)}{h}$",
            },
            {
              kind: 'para',
              text:
                "**Étape 3.** On réécrit le $1$ comme $a^0$ — même valeur (voir l'encadré " +
                "ci-dessus), mais cette écriture fait apparaître un taux d'accroissement de " +
                '$f$ **entre 0 et** $0+h$ :',
            },
            {
              kind: 'para',
              text:
                "$= a^x \\cdot \\dfrac{a^h - a^0}{h} = a^x \\cdot \\dfrac{f(0+h) - f(0)}{h}$",
            },
            {
              kind: 'para',
              text:
                "**Étape 4.** On passe à la limite quand $h \\to 0$. Le facteur $a^x$ ne dépend " +
                "**pas** de $h$ : c'est une constante pour cette limite, il sort donc devant.",
            },
            {
              kind: 'para',
              text:
                "$f'(x) = \\displaystyle\\lim_{h \\to 0} \\dfrac{f(x+h)-f(x)}{h} = a^x \\cdot " +
                "\\displaystyle\\lim_{h \\to 0} \\dfrac{f(0+h) - f(0)}{h}$",
            },
            {
              kind: 'para',
              text:
                "**Étape 5.** La limite qui reste, c'est mot pour mot la définition du nombre " +
                "dérivé de $f$ **en 0**. Elle vaut donc $f'(0)$ — à condition qu'elle existe, " +
                "c'est-à-dire que $f$ soit dérivable en 0. C'est exactement ce qu'affirme le " +
                'théorème admis ci-dessous.',
            },
            { kind: 'para', text: "$f'(x) = f'(0) \\cdot a^x \\qquad \\blacksquare$" },
            {
              kind: 'para',
              text:
                "Conclusion remarquable : **la dérivée d'une exponentielle est un multiple " +
                "d'elle-même** ! Le coefficient de proportionnalité — le même pour tout $x$ — " +
                "n'est autre que la pente de la courbe au point $(0\\,;1)$. Il ne dépend que de " +
                'la base $a$. Reste à lui donner un nom : ce sera $\\ln(a)$.',
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Théorème admis — dérivabilité en 0',
          items: [
            "Pour tout $a \\in \\mathbb{R}_0^+$, la fonction $f : \\mathbb{R} \\to \\mathbb{R} : " +
              "x \\mapsto a^x$ est dérivable en 0. Ce théorème est admis sans démonstration — " +
              "c'est lui qui rend légitime l'étape 5 ci-dessus.",
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — logarithme népérien',
          items: [
            "On appelle **logarithme népérien** de $a$, noté $\\ln(a)$, le nombre dérivé en 0 " +
              "de la fonction $x \\mapsto a^x$. Autrement dit, $\\ln(a)$ n'est **rien d'autre " +
              "qu'un nom** donné au nombre $f'(0)$ trouvé ci-dessus.",
            "En reportant cette définition dans le résultat de la démonstration, " +
              "$f'(x) = f'(0) \\cdot a^x$, tu retrouves immédiatement la formule annoncée en " +
              'tête de section :',
            "$\\forall x \\in \\mathbb{R} : (a^x)' = \\ln(a) \\cdot a^x$",
            "Le facteur $\\ln(a)$ n'a donc rien d'une coïncidence, ni d'une constante tombée " +
              'du ciel : il **est**, par définition, la pente de la courbe en $(0\\,;1)$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => Math.pow(2, x), tone: 'good' },
              { fn: Math.exp, tone: 'accent', xMax: 1.42 },
              { fn: (x) => 1 + Math.LN2 * x, tone: 'faint' },
              { fn: (x) => 1 + x, tone: 'faint' },
            ],
            xMin: -1.5,
            xMax: 1.6,
            xTicks: [-1, 1],
            fixedYRange: { min: -0.6, max: 4.2 },
            textLabels: [
              { x: -1.45, y: 4.0, text: 'y=eˣ', tone: 'accent', anchor: 'start' },
              { x: -1.45, y: 3.45, text: 'y=2ˣ', tone: 'good', anchor: 'start' },
              { x: -1.45, y: 2.9, text: 'tangente à eˣ : pente 1', tone: 'faint', anchor: 'start' },
              { x: -1.45, y: 2.35, text: 'tangente à 2ˣ : pente ln(2)≈0,69', tone: 'faint', anchor: 'start' },
            ],
            points: [{ x: 0, y: 1, label: '(0;1)', tone: 'accent', labelPos: 'right' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "Toutes les exponentielles passent par (0;1), mais elles n'y arrivent pas avec la " +
              'même pente. Les deux droites grises sont les tangentes en ce point : la plus ' +
              "pentue est celle de eˣ, de pente exactement 1 ; l'autre est celle de 2ˣ, de " +
              "pente ln(2) ≈ 0,69. C'est cette pente — et rien d'autre — que l'on appelle " +
              'ln(a) ; la base e est celle, et la seule, pour laquelle elle vaut 1.',
          },
        },
        {
          kind: 'atelier',
          tag: 'tangente-exponentielle-widget',
          label: 'Manipule toi-même — trouve la base dont la tangente a une pente de 1',
          caption:
            'Fais varier a et observe comment la tangente en (0;1) pivote. Coche « Tangente en ' +
            'x=0 » pour la voir, et « f\'(x) » pour voir la fonction dérivée tout entière. ' +
            'Peux-tu régler a pour que f\'(0) affiche exactement 1 ? La valeur que tu trouves, ' +
            "c'est e — le bloc ci-dessous explique pourquoi.",
        },
        {
          kind: 'exempleLibre',
          label: "Conséquence — pourquoi exp est sa propre dérivée",
          blocks: [
            {
              kind: 'para',
              text:
                "Le **nombre d'Euler** $e$ est défini par $e = \\displaystyle\\lim_{x \\to " +
                "+\\infty} \\left(1+\\dfrac{1}{x}\\right)^x \\approx 2{,}71828\\ldots$ " +
                "(l'existence de cette limite est admise). La fonction exponentielle de base " +
                "$e$ porte un nom à part, **fonction exponentielle népérienne**, et se note " +
                '$\\exp$ plutôt que $\\exp_e$.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (x) => Math.pow(1 + 1 / x, x), tone: 'accent', xMin: 0.05 }],
                xMin: 0,
                xMax: 25,
                xTicks: [5, 10, 15, 20],
                fixedYRange: { min: 0, max: 3.2 },
                horizontalAsymptotes: [{ y: Math.E, label: 'asymptote y=e≈2,718' }],
                points: [
                  { x: 1, y: 2, label: '(1;2)', tone: 'accent' },
                  { x: 10, y: Math.pow(1.1, 10), label: '(10;2,594)', tone: 'accent' },
                ],
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'La fonction $(1+1/x)^x$ pour $x>0$ : croissante, elle se rapproche de plus ' +
                  'en plus de $e$ sans jamais l\'atteindre — exactement la limite qui définit ' +
                  'le nombre d\'Euler.',
              },
            },
            {
              kind: 'para',
              text:
                "On **admet** que cette base $e$, définie par une limite, est aussi la base " +
                'dont la tangente en $(0\\,;1)$ a une pente égale à 1 — exactement ce que ' +
                "l'atelier ci-dessus laisse deviner. Autrement dit, on admet $\\ln(e) = 1$ : ce " +
                "n'est pas une conséquence évidente de la définition de $e$.",
            },
            {
              kind: 'para',
              text:
                "Une fois ce résultat admis, il ne reste qu'une substitution à faire. La " +
                "formule $(a^x)' = \\ln(a) \\cdot a^x$, appliquée au cas particulier $a = e$, " +
                'donne pour tout $x$ réel :',
            },
            {
              kind: 'para',
              text: "$\\exp'(x) = \\ln(e) \\cdot \\exp(x) = 1 \\cdot \\exp(x) = \\exp(x)$",
            },
            {
              kind: 'para',
              text:
                "Soit, en notation usuelle, $(e^x)' = e^x$. $\\qquad \\blacksquare$ Ce qui rend " +
                "$e$ spéciale, c'est uniquement que **son** facteur $\\ln$ vaut 1 : toutes les " +
                'autres bases traînent un facteur multiplicatif à chaque dérivation.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: "💡 Retenir les décimales de e",
          text:
            "Moyen mnémotechnique : « Je renonce à calculer la suivante » — le nombre de " +
            'lettres de chaque mot donne 2, 7, 1, 8, 2, 8. Et ce n\'est qu\'une valeur ' +
            "approchée de $e$ (à moins de $2 \\cdot 10^{-6}$ près), pas la valeur exacte !",
        },
        {
          kind: 'historique',
          titre: "Le nombre e, découvert en voulant s'enrichir",
          text:
            "C'est le mathématicien suisse **Jacob Bernoulli** qui, en 1683, tombe sur ce " +
            "nombre pour la première fois — sans le chercher. Il étudie les intérêts " +
            'composés : si une banque capitalise les intérêts non pas une fois par an, mais ' +
            'de plus en plus souvent (par mois, par jour, par seconde...), que devient le ' +
            'capital final ? Bernoulli calcule que ce capital ne grandit pas indéfiniment : ' +
            'il se rapproche d\'une limite précise, exactement ' +
            '$\\left(1+\\dfrac{1}{x}\\right)^x$ quand $x$ tend vers l\'infini — la limite que ' +
            'tu viens de voir ci-dessus. Bernoulli avait donc déjà repéré ce nombre près ' +
            "d'un demi-siècle avant que **Leonhard Euler** ne lui donne son nom symbolique, " +
            'la lettre $e$, en 1731, et n\'en démontre les propriétés fondamentales.',
          image: {
            src: '/images/historique/bernoulli-jacob.jpg',
            alt: 'Portrait de Jacob Bernoulli',
            caption: 'Jacob Bernoulli (1655–1705), portrait d\'époque.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la limite de (1 + k/x)ˣ',
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $k > 0$. On montre que $\\displaystyle\\lim_{x \\to +\\infty} " +
                '\\left(1+\\dfrac{k}{x}\\right)^x = e^k$, à partir de la définition de $e$.',
            },
            {
              kind: 'para',
              text:
                "**Étape 1.** On pose $u = \\dfrac{x}{k}$, donc $x = k \\cdot u$ et " +
                "$\\dfrac{k}{x} = \\dfrac{1}{u}$. Comme $k > 0$, $u \\to +\\infty$ quand " +
                '$x \\to +\\infty$.',
            },
            {
              kind: 'para',
              text:
                "**Étape 2.** On réécrit la puissance avec la règle **(4)**, " +
                '$a^{r \\cdot s} = (a^r)^s$ :',
            },
            {
              kind: 'para',
              text:
                "$\\left(1+\\dfrac{k}{x}\\right)^x = \\left(1+\\dfrac{1}{u}\\right)^{u \\cdot k} = " +
                '\\left[\\left(1+\\dfrac{1}{u}\\right)^{u}\\right]^k$',
            },
            {
              kind: 'para',
              text:
                "**Étape 3.** Quand $u \\to +\\infty$, le crochet tend vers $e$ (définition de " +
                '$e$), et la fonction $t \\mapsto t^k$ est continue en $e$. Donc :',
            },
            {
              kind: 'para',
              text:
                "$\\displaystyle\\lim_{x \\to +\\infty} \\left(1+\\dfrac{k}{x}\\right)^x = e^k " +
                '\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Le résultat reste vrai pour $k < 0$ (admis ici). Avec un exposant $m \\cdot x$, ' +
                "la règle **(4)** donne encore $\\left(1+\\dfrac{k}{x}\\right)^{mx} = " +
                "\\left[\\left(1+\\dfrac{k}{x}\\right)^x\\right]^m$, qui tend vers " +
                '$\\left(e^k\\right)^m = e^{km}$. Pour Bernoulli, un taux annuel $r$ capitalisé ' +
                '$n$ fois par an multiplie le capital par $\\left(1+\\dfrac{r}{n}\\right)^n$, ' +
                'qui se rapproche de $e^r$ quand $n$ devient très grand.',
            },
          ],
        },
        { kind: 'subheading', text: 'Le signe de ln(a) et la monotonie de aˣ' },
        {
          kind: 'para',
          text:
            "Puisque $a^x > 0$ pour tout $x$ (section 1), le signe de " +
            "$(a^x)' = \\ln(a) \\cdot a^x$ est exactement celui de $\\ln(a)$. La section 1 n'a " +
            "fait qu'**observer** sur des graphes que $a^x$ croît si $a > 1$ et décroît si " +
            '$0 < a < 1$ ; il reste à le démontrer, en trouvant le signe de $\\ln(a)$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le signe de ln(a)',
          blocks: [
            {
              kind: 'para',
              text:
                "On montre : $\\ln(a) > 0$ si $a > 1$, et $\\ln(a) < 0$ si $0 < a < 1$. " +
                '(Pour $a = 1$, $1^x = 1$ est constante, de dérivée nulle : $\\ln(1) = 0$.)',
            },
            {
              kind: 'para',
              text:
                "**1) Si** $a > 1$ **et** $h > 0$**, alors** $a^h > 1$. Pour $h = \\dfrac{p}{q}$ " +
                "rationnel ($p, q$ entiers strictement positifs), $a^p > 1$ comme produit de " +
                "$p$ facteurs plus grands que 1, et $a^{p/q} = \\sqrt[q]{a^p}$ est la racine " +
                "$q$-ième d'un nombre plus grand que 1, donc aussi plus grande que 1. Pour $h$ " +
                "réel quelconque, on choisit un rationnel $r$ tel que $0 < r < h$ : par la règle " +
                "**(1)**, $a^h = a^{h-r} \\cdot a^r$. La continuité de $\\exp_a$ donne " +
                "$a^{h-r} \\ge 1$ (limite de puissances rationnelles plus grandes que 1), et " +
                '$a^r > 1$ : le produit est donc strictement plus grand que 1.',
            },
            {
              kind: 'para',
              text:
                "**2) Donc** $\\ln(a) \\ge 0$ **si** $a > 1$. Par définition, $\\ln(a)$ est la " +
                "limite du taux d'accroissement $\\dfrac{a^h - 1}{h}$ quand $h \\to 0$. Pour " +
                "$h > 0$, ce quotient est strictement positif par le point 1. Une limite de " +
                "nombres positifs ne peut pas être négative : $\\ln(a) \\ge 0$.",
            },
            {
              kind: 'para',
              text:
                "**3) Et même** $\\ln(a) > 0$. Par l'absurde : si $\\ln(a) = 0$, alors " +
                "$(a^x)' = 0 \\cdot a^x = 0$ pour tout $x$, donc $a^x$ serait constante sur " +
                "$\\mathbb{R}$, égale à $a^0 = 1$. Mais $a^1 = a \\neq 1$ : contradiction.",
            },
            {
              kind: 'para',
              text:
                "**4) Si** $0 < a < 1$, on pose $b = \\dfrac{1}{a} > 1$, de sorte que " +
                "$a^x = b^{-x}$ (règle **(4)**, car $a = b^{-1}$). La règle de la chaîne donne " +
                "$(a^x)' = (b^{-x})' = -\\ln(b) \\cdot b^{-x} = -\\ln(b) \\cdot a^x$. En " +
                "comparant avec $(a^x)' = \\ln(a) \\cdot a^x$ en $x = 0$ : " +
                "$\\ln(a) = -\\ln(b) < 0$ par le point 3. $\\qquad \\blacksquare$",
            },
          ],
        },
        {
          kind: 'para',
          text:
            "Conséquence : la dérivée de $a^x$ a un signe constant sur l'intervalle " +
            "$\\mathbb{R}$ — strictement positive si $a > 1$, strictement négative si " +
            "$0 < a < 1$. La fonction $\\exp_a$ est donc **strictement croissante** si " +
            '$a > 1$ et **strictement décroissante** si $0 < a < 1$ : la monotonie observée à ' +
            "la section 1 est maintenant démontrée. C'est elle qui sert dans les sections 4 et 5.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => Math.pow(2, x), tone: 'accent' },
              { fn: (x) => Math.LN2 * Math.pow(2, x), tone: 'good' },
            ],
            xMin: -2.2,
            xMax: 2.2,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -0.6, max: 5 },
            textLabels: [
              { x: -2.15, y: 4.6, text: 'y=2ˣ', tone: 'accent', anchor: 'start' },
              { x: -2.15, y: 3.95, text: 'y=ln(2)·2ˣ', tone: 'good', anchor: 'start' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Base a=2 > 1 : ln(2) ≈ 0,69 est positif mais inférieur à 1, donc la dérivée ' +
              '(en vert) reste positive — la fonction croît — tout en passant sous la courbe.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => Math.pow(0.5, x), tone: 'accent' },
              { fn: (x) => Math.log(0.5) * Math.pow(0.5, x), tone: 'good' },
            ],
            xMin: -2.2,
            xMax: 2.2,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -3.5, max: 5 },
            textLabels: [
              { x: 2.15, y: 4.6, text: 'y=0,5ˣ', tone: 'accent', anchor: 'end' },
              { x: 2.15, y: 3.9, text: 'y=ln(0,5)·0,5ˣ', tone: 'good', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Base a=0,5 < 1 : ln(0,5) ≈ −0,69 est négatif, donc la dérivée (en vert) est ' +
              "entièrement sous l'axe — la fonction décroît partout.",
          },
        },
        { kind: 'subheading', text: 'Retour aux limites : ce que la dérivée permet de démontrer' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la limite fondamentale en 0',
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $a \\in \\mathbb{R}_0^+$. On montre que " +
                "$\\displaystyle\\lim_{x \\to 0} \\dfrac{a^x - 1}{x} = \\ln(a)$, puis on en " +
                "déduit $\\displaystyle\\lim_{x \\to 0} \\dfrac{e^x - 1}{x} = 1$.",
            },
            {
              kind: 'para',
              text:
                "**Étape 1.** Avec $f(x) = a^x$ et $a^0 = 1$, le quotient est un taux " +
                "d'accroissement de $f$ entre 0 et $x$ :",
            },
            { kind: 'para', text: '$\\dfrac{a^x - 1}{x} = \\dfrac{a^x - a^0}{x - 0} = \\dfrac{f(x) - f(0)}{x - 0}$' },
            {
              kind: 'para',
              text:
                "**Étape 2.** $f$ est dérivable en 0 (théorème admis plus haut) : ce taux tend " +
                "vers le nombre dérivé $f'(0)$, qui est par définition $\\ln(a)$.",
            },
            {
              kind: 'para',
              text:
                "**Étape 3.** Pour $a = e$, $\\ln(e) = 1$ : " +
                "$\\displaystyle\\lim_{x \\to 0} \\dfrac{e^x - 1}{x} = 1. \\qquad \\blacksquare$",
            },
            {
              kind: 'para',
              text:
                "Avec $u = kx$ ($k \\neq 0$), on obtient aussi " +
                "$\\dfrac{e^{kx} - 1}{x} = k \\cdot \\dfrac{e^{u} - 1}{u}$, qui tend vers $k$ : " +
                "par exemple $\\displaystyle\\lim_{x \\to 0} \\dfrac{e^{3x} - 1}{2x} = " +
                '\\dfrac{3}{2}$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — l'exponentielle domine toute puissance de x",
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $a > 1$ et $n$ un entier naturel. On montre que " +
                "$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{x^n}{a^x} = 0$ (règle de " +
                'dominance de la section 1). On note $c = \\ln(a)$, strictement positif par la ' +
                'démonstration du signe de $\\ln(a)$.',
            },
            {
              kind: 'para',
              text:
                "**Étape 1 — une minoration de** $a^x$. Sur $[0\\,;+\\infty[$, on étudie " +
                "$g(x) = a^x - \\dfrac{c^2 x^2}{2}$. On dérive deux fois :",
            },
            { kind: 'para', text: "$g'(x) = c \\cdot a^x - c^2 x \\qquad g''(x) = c^2 \\cdot a^x - c^2 = c^2\\left(a^x - 1\\right)$" },
            {
              kind: 'para',
              text:
                "Pour $x > 0$, $a^x > 1$, donc $g''(x) > 0$ : $g'$ est strictement croissante " +
                "sur $[0\\,;+\\infty[$. Comme $g'(0) = c > 0$, $g'$ reste strictement positive : " +
                "$g$ est strictement croissante. Comme $g(0) = 1 > 0$, $g$ reste strictement " +
                'positive. Donc, pour tout $x > 0$ :',
            },
            { kind: 'para', text: '$a^x > \\dfrac{c^2 x^2}{2}$' },
            {
              kind: 'para',
              text: "**Étape 2 — le cas** $n = 1$. Pour $x > 0$, la minoration de l'étape 1 donne :",
            },
            { kind: 'para', text: '$0 < \\dfrac{x}{a^x} < \\dfrac{x}{\\frac{c^2 x^2}{2}} = \\dfrac{2}{c^2 x}$' },
            {
              kind: 'para',
              text:
                "Le membre de droite tend vers 0 quand $x \\to +\\infty$ : par le théorème des " +
                "gendarmes, $\\dfrac{x}{a^x} \\to 0$.",
            },
            {
              kind: 'para',
              text:
                "**Étape 3 — un entier** $n \\ge 1$ **quelconque.** Par la règle **(4)**, " +
                "$a^x = \\left(a^{x/n}\\right)^n$, donc, en posant $u = \\dfrac{x}{n}$ :",
            },
            {
              kind: 'para',
              text:
                "$\\dfrac{x^n}{a^x} = \\left(\\dfrac{x}{a^{x/n}}\\right)^n = " +
                '\\left(n \\cdot \\dfrac{u}{a^{u}}\\right)^n$',
            },
            {
              kind: 'para',
              text:
                "Quand $x \\to +\\infty$, $u \\to +\\infty$ et $\\dfrac{u}{a^u} \\to 0$ par " +
                "l'étape 2 ; la parenthèse tend vers 0, sa puissance $n$-ième aussi. " +
                '(Pour $n = 0$, $\\dfrac{1}{a^x} \\to 0$ directement.) $\\qquad \\blacksquare$',
            },
          ],
        },
        { kind: 'subheading', text: "Lever une forme indéterminée avec les dérivées : la règle de L'Hôpital" },
        {
          kind: 'intuition',
          label: 'Pourquoi le quotient des dérivées ?',
          text:
            "Si $f(a) = g(a) = 0$, près de $a$ chaque courbe se confond presque avec sa " +
            "tangente : $f(x) \\approx f'(a)(x-a)$ et $g(x) \\approx g'(a)(x-a)$. Le facteur " +
            "$(x-a)$, qui tend vers 0 en haut comme en bas, se simplifie, et il reste " +
            "$\\dfrac{f(x)}{g(x)} \\approx \\dfrac{f'(a)}{g'(a)}$. La règle de L'Hôpital rend " +
            'cette idée rigoureuse, avec des conditions précises.',
        },
        {
          kind: 'definition',
          label: "Théorème admis — règle de L'Hôpital",
          items: [
            "Soient $f$ et $g$ deux fonctions **dérivables au voisinage de** $a$ (sur un " +
              "intervalle ouvert contenant $a$, sauf peut-être en $a$ lui-même), avec " +
              "$g'(x) \\neq 0$ pour tout $x \\neq a$ de ce voisinage. Si les deux conditions " +
              'suivantes sont remplies :',
            "**(1)** $\\dfrac{f(x)}{g(x)}$ est une **forme indéterminée** en $a$ : soit " +
              "$f(x) \\to 0$ et $g(x) \\to 0$ (forme $\\dfrac{0}{0}$), soit $f(x)$ et $g(x)$ " +
              "tendent vers l'infini (forme $\\dfrac{\\infty}{\\infty}$) ;",
            "**(2)** la limite du quotient des dérivées **existe** : " +
              "$\\displaystyle\\lim_{x \\to a} \\dfrac{f'(x)}{g'(x)} = L$, avec $L$ réel, " +
              '$+\\infty$ ou $-\\infty$ ;',
            "alors $\\displaystyle\\lim_{x \\to a} \\dfrac{f(x)}{g(x)} = L$.",
            "Le théorème reste vrai pour une limite à gauche ou à droite, et pour " +
              "$a = +\\infty$ ou $a = -\\infty$. Il est admis : sa démonstration dépasse le cadre " +
              'de ce cours.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'forme 0/0 — règle de L’Hôpital',
          formula: '$\\displaystyle\\lim_{x \\to 0} \\dfrac{\\sin(4x)}{e^{2x} - 1}$',
          steps: [
            {
              tag: 'reconnaître la forme',
              text: '$\\sin(4 \\cdot 0) = 0$ et $e^{0} - 1 = 0$ : forme indéterminée $\\dfrac{0}{0}$',
            },
            {
              tag: 'vérifier les conditions',
              text:
                "$f(x) = \\sin(4x)$ et $g(x) = e^{2x} - 1$ sont dérivables sur $\\mathbb{R}$, et " +
                "$g'(x) = 2e^{2x} \\neq 0$",
            },
            {
              tag: 'limite du quotient des dérivées',
              text:
                "$\\dfrac{f'(x)}{g'(x)} = \\dfrac{4\\cos(4x)}{2e^{2x}} \\to \\dfrac{4 \\cdot 1}{2 \\cdot 1} = 2$",
            },
          ],
          result: { tag: "la règle de L'Hôpital conclut", text: '$\\displaystyle\\lim_{x \\to 0} \\dfrac{\\sin(4x)}{e^{2x} - 1} = 2$' },
        },
        {
          kind: 'exemple',
          badge: 'deux applications successives',
          formula: '$\\displaystyle\\lim_{x \\to 0} \\dfrac{e^{x} - 1 - x}{x^2}$',
          steps: [
            {
              tag: 'reconnaître la forme',
              text: '$e^0 - 1 - 0 = 0$ et $0^2 = 0$ : forme $\\dfrac{0}{0}$',
            },
            {
              tag: 'premier quotient des dérivées',
              text: "$\\dfrac{e^x - 1}{2x}$ : encore une forme $\\dfrac{0}{0}$, la règle ne conclut pas encore",
            },
            {
              tag: 'on applique la règle à ce quotient',
              text: "$\\dfrac{(e^x - 1)'}{(2x)'} = \\dfrac{e^x}{2} \\to \\dfrac{1}{2}$, et $(2x)' = 2 \\neq 0$",
            },
            {
              tag: 'on remonte',
              text:
                "$\\dfrac{e^x - 1}{2x} \\to \\dfrac{1}{2}$ (la limite fondamentale le donne aussi), " +
                'donc la condition (2) est remplie pour le quotient de départ',
            },
          ],
          result: { tag: 'résultat', text: '$\\displaystyle\\lim_{x \\to 0} \\dfrac{e^{x} - 1 - x}{x^2} = \\dfrac{1}{2}$' },
        },
        {
          kind: 'piege',
          label: "Piège — la règle hors d'une forme indéterminée",
          text:
            "Avant de dériver, **vérifie toujours la forme**. Pour " +
            "$\\displaystyle\\lim_{x \\to 0} \\dfrac{e^x + 1}{x + 1}$, le remplacement direct " +
            "donne $\\dfrac{2}{1} = 2$ : ce n'est pas une forme indéterminée. Dériver quand " +
            "même donnerait $\\dfrac{e^x}{1} \\to 1$, un résultat **faux**.",
        },
        {
          kind: 'attention',
          text:
            "La condition (2) compte aussi : si le quotient des dérivées n'a pas de limite, la " +
            "règle ne dit rien. Par exemple $\\dfrac{x + \\sin x}{x} = 1 + \\dfrac{\\sin x}{x}$ " +
            "tend vers 1 en $+\\infty$, alors que $\\dfrac{1 + \\cos x}{1}$ n'a pas de limite.",
        },
        {
          kind: 'methode',
          label: "Quelle méthode pour une limite ? L'Hôpital ou croissances comparées",
          items: [
            "**Remplace d'abord** : si le résultat n'est pas une forme indéterminée, c'est " +
              'fini — aucune règle à appliquer.',
            "**Exponentielle contre polynôme** (formes $\\dfrac{\\infty}{\\infty}$ ou " +
              "$0 \\cdot \\infty$, en $\\pm\\infty$) : les **croissances comparées** de la " +
              "section 1 donnent la limite tout de suite. L'Hôpital y arrive aussi, mais en " +
              "dérivant $n$ fois $\\dfrac{x^n}{e^x}$ : c'est plus long, et inutile.",
            "**Forme** $\\dfrac{e^{u} - 1}{u}$ **avec** $u \\to 0$ : la **limite fondamentale** " +
              'suffit.',
            "**Sinon**, pour une forme $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$ : la " +
              "**règle de L'Hôpital**, en vérifiant ses conditions (dérivabilité, " +
              "$g' \\neq 0$, limite du quotient des dérivées). Une forme $0 \\cdot \\infty$ se " +
              "réécrit d'abord en quotient.",
          ],
        },
        {
          kind: 'entrainement',
          title: 'Domaine et dérivée',
          generatorId: '6gen7',
          description: [
            "Détermine le domaine d'une fonction exponentielle composée, puis calcule sa " +
              'dérivée avec la règle de la chaîne et le facteur ln(a).',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 7. Domaine et dérivée »',
        },
      ],
    },
    {
      id: 'graphique',
      number: 3,
      title: 'Graphique de la dérivée',
      kicker: 'lire f′ pour connaître f ; fonction paire, dérivée impaire',
      blocks: [
        { kind: 'video', title: 'Graphique de la dérivée', youtubeId: 'NKY7Nsu1THM' },
        {
          kind: 'para',
          text:
            "Le lien entre une fonction et sa dérivée se lit directement sur un graphique. Le " +
            "signe de $f'$ donne le sens de variation de $f$ ; un changement de signe de $f'$ " +
            'repère un extremum de $f$.',
        },
        { kind: 'subheading', text: 'Lire le graphique de f′ pour connaître f' },
        {
          kind: 'featureTable',
          caption: "Méthode : ce que dit le graphique de f′, et ce qu'on en déduit pour f (sur un intervalle)",
          headers: ['Sur le graphique de f′', 'Pour la fonction f'],
          rows: [
            ["courbe **au-dessus** de l'axe des abscisses : $f' > 0$", '$f$ strictement croissante'],
            ["courbe **en dessous** de l'axe : $f' < 0$", '$f$ strictement décroissante'],
            ["$f'$ s'annule en passant de $+$ à $-$", 'maximum de $f$ en ce point'],
            ["$f'$ s'annule en passant de $-$ à $+$", 'minimum de $f$ en ce point'],
            ["$f'$ s'annule **sans** changer de signe", "tangente horizontale, mais **pas** d'extremum"],
            ["$f'$ croissante (courbe de $f'$ qui monte)", "$f$ convexe ($f'' > 0$)"],
            ["$f'$ décroissante", "$f$ concave ($f'' < 0$)"],
            ["extremum de $f'$", "point d'inflexion de $f$"],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            // f(x) = (x − 1)eˣ, f′(x) = x·eˣ, f″(x) = (x + 1)eˣ : f′ s'annule en 0 (de − à +),
            // minimum de f en (0 ; −1) ; f′ minimale en −1 (−1/e ≈ −0,37), inflexion de f en (−1 ; −2/e ≈ −0,74).
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x - 1) * Math.exp(x), tone: 'accent' },
              { fn: (x) => x * Math.exp(x), tone: 'good' },
            ],
            xMin: -4.5,
            xMax: 1.6,
            xTicks: [-4, 1],
            yTicks: [1, 2],
            fixedYRange: { min: -1.4, max: 3 },
            axisOfSymmetry: { x: -1, label: 'x=−1' },
            textLabels: [
              { x: -0.15, y: 1.5, text: 'f′(x)=x·eˣ', tone: 'good', anchor: 'end' },
              { x: -4.4, y: 0.55, text: 'f(x)=(x−1)·eˣ', tone: 'accent', anchor: 'start' },
            ],
            points: [
              { x: 0, y: -1, label: 'min de f', tone: 'accent', labelPos: 'right' },
              { x: 0, y: 0, label: '', tone: 'good' },
              { x: -1, y: -1 / Math.E, label: 'min de f′', tone: 'good', labelPos: 'right' },
              { x: -1, y: -2 / Math.E, label: 'inflexion', tone: 'accent', labelPos: 'left' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "En vert, le graphique de $f'(x) = x \\cdot e^x$ ; en orange, celui de " +
              "$f(x) = (x-1) \\cdot e^x$. À gauche de 0, $f'$ est sous l'axe : $f$ décroît ; à " +
              "droite, $f'$ est au-dessus : $f$ croît. $f'$ s'annule en 0 en passant de $-$ à " +
              "$+$ : minimum de $f$ en $(0\\,;-1)$. Le minimum de $f'$, en $x = -1$, donne le " +
              "point d'inflexion de $f$ : à sa droite $f'$ monte et $f$ est convexe.",
          },
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — les variations de f lues sur le graphique de f′",
          blocks: [
            {
              kind: 'para',
              text:
                "On ne connaît que le graphique vert, celui de $f'(x) = x \\cdot e^x$. Que peut-on " +
                'dire de $f$, sans la moindre formule pour $f$ ?',
            },
            {
              kind: 'para',
              text:
                "**Signe de** $f'$ : la courbe verte est sous l'axe pour $x < 0$ et au-dessus " +
                "pour $x > 0$. Donc $f$ est **décroissante** sur $]-\\infty\\,;0]$ et " +
                '**croissante** sur $[0\\,;+\\infty[$.',
            },
            {
              kind: 'para',
              text:
                "**Zéro de** $f'$ : en $x = 0$, $f'$ s'annule en passant de $-$ à $+$ : " +
                '$f$ admet un **minimum** en $x = 0$.',
            },
            {
              kind: 'para',
              text:
                "**Variations de** $f'$ : $f'$ décroît jusqu'à $x = -1$, puis croît. Donc $f$ " +
                "est concave sur $]-\\infty\\,;-1]$, convexe sur $[-1\\,;+\\infty[$, avec un " +
                "**point d'inflexion** en $x = -1$.",
            },
            {
              kind: 'para',
              text:
                "Ce que le graphique de $f'$ ne dit **pas** : la valeur du minimum. Toute " +
                "fonction $f + c$ a la même dérivée ; il faut un point de $f$ (ici " +
                '$f(0) = -1$) pour placer la courbe en hauteur.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            "Le graphique de $f'$ renseigne sur la **croissance** de $f$, jamais sur son " +
            "**signe** : $f(x) = e^x - 2$ a une dérivée partout positive, et pourtant " +
            '$f(0) = -1 < 0$.',
        },
        { kind: 'subheading', text: 'Parité et dérivée' },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            "La dérivée d'une fonction **paire** est **impaire** ; la dérivée d'une fonction " +
              '**impaire** est **paire**.',
            "Le sens inverse ne marche pas toujours : $f'(x) = 1$ est paire, mais " +
              "$f(x) = x + 1$, qui a cette dérivée, n'est pas impaire.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — parité et dérivée',
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $f$ dérivable sur $\\mathbb{R}$. On montre : si $f$ est paire, $f'$ est " +
                'impaire ; si $f$ est impaire, $f\'$ est paire.',
            },
            {
              kind: 'para',
              text:
                "**1)** $f$ **paire.** Pour tout $x$, $f(-x) = f(x)$. Les deux membres sont des " +
                "fonctions de $x$ égales : leurs dérivées sont égales. À gauche, la règle de la " +
                "chaîne (avec $u(x) = -x$, $u'(x) = -1$) donne :",
            },
            { kind: 'para', text: "$\\left(f(-x)\\right)' = -f'(-x) \\qquad$ donc $\\qquad -f'(-x) = f'(x)$" },
            {
              kind: 'para',
              text: "Soit $f'(-x) = -f'(x)$ pour tout $x$ : $f'$ est **impaire**.",
            },
            {
              kind: 'para',
              text:
                "**2)** $f$ **impaire.** Pour tout $x$, $f(-x) = -f(x)$. En dérivant les deux " +
                'membres de la même façon :',
            },
            { kind: 'para', text: "$-f'(-x) = -f'(x) \\qquad$ donc $\\qquad f'(-x) = f'(x)$" },
            {
              kind: 'para',
              text: "$f'$ est **paire**. $\\qquad \\blacksquare$",
            },
          ],
        },
        { kind: 'subheading', text: 'Exemple résolu — parité et dérivée' },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                "$f(x) = \\dfrac{e^x+e^{-x}}{2}$ (paire) $\\implies$ $f'(x) = \\dfrac{e^x-e^{-x}}{2}$ (impaire)",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (Math.exp(x) + Math.exp(-x)) / 2, tone: 'accent' },
              { fn: (x) => (Math.exp(x) - Math.exp(-x)) / 2, tone: 'faint' },
            ],
            xMin: -2.2,
            xMax: 2.2,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -4, max: 4.5 },
            points: [{ x: 0, y: 1, label: '(0;1)', tone: 'accent' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: "en accent, f (symétrique par rapport à l'axe y) ; en fané, f′ (symétrique par rapport à l'origine)",
          },
        },
        {
          kind: 'atelier',
          tag: 'parite-derivee-widget',
          label: 'Manipule toi-même — f(x) et f(−x), leurs deux tangentes',
          caption:
            'Fais glisser x : son symétrique −x suit automatiquement. Compare les deux pentes ' +
            "affichées — elles sont toujours opposées, exactement ce que dit « la dérivée d'une " +
            'fonction paire est impaire ».',
        },
        {
          kind: 'piege',
          text:
            "Oublier le signe négatif en dérivant $e^{-kx}$ transforme par erreur une fonction " +
            'impaire en fonction paire ! Applique toujours la règle de la chaîne jusqu\'au ' +
            'bout — signe compris.',
        },
        {
          kind: 'entrainement',
          title: 'Graphique de la dérivée',
          generatorId: '6gen8',
          description: [
            "Associe une fonction exponentielle à sa dérivée à partir de leur graphique, en " +
              'te servant de la parité, du signe et des extremums.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 8. Graphique de la dérivée »',
        },
      ],
    },
    {
      id: 'equations',
      number: 4,
      title: 'Résoudre une équation exponentielle',
      kicker: 'même base d\'abord, substitution ensuite',
      blocks: [
        { kind: 'video', title: 'Résoudre une équation exponentielle', youtubeId: 'n7QfEIp463w' },
        {
          kind: 'methode',
          label: 'Méthode 1 — même base',
          items: [
            "Une exponentielle de base fixée est injective : $a^u = a^v$ équivaut à " +
              "$u = v$. Pas besoin de logarithme !",
          ],
        },
        {
          kind: 'definition',
          label: "Principe d'équivalence — égalité de deux images par une exponentielle",
          items: [
            "$\\forall a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}, \\forall x,y \\in \\mathbb{R} : " +
              '\\quad a^x = a^y \\iff x = y$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — principe d'équivalence",
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$ et $x,y \\in \\mathbb{R}$. " +
                "C'est une **équivalence** : il faut démontrer les deux implications " +
                'séparément.',
            },
            {
              kind: 'para',
              text:
                "**1) Sens** $\\implies$ — de $a^x = a^y$ vers $x = y$. C'est le sens utile en " +
                'pratique : celui qui te permet de « supprimer les deux bases » dans une ' +
                'équation.',
            },
            {
              kind: 'para',
              text:
                "La section 2 a démontré que $\\exp_a$ est **strictement monotone** : strictement " +
                "croissante si $a > 1$, strictement décroissante si $0 < a < 1$. L'exclusion de " +
                '$a = 1$ garantit que ce sont bien les deux seuls cas possibles.',
            },
            {
              kind: 'para',
              text:
                "Or une fonction strictement monotone ne prend **jamais deux fois la même " +
                "valeur**. Prenons deux réels **distincts** $x$ et $y$ ; quitte à échanger " +
                'leurs noms, on peut supposer $x < y$. Alors :',
            },
            {
              kind: 'list',
              items: [
                "si $a > 1$, la stricte croissance donne $a^x < a^y$ ;",
                'si $0 < a < 1$, la stricte décroissance donne $a^x > a^y$.',
              ],
            },
            {
              kind: 'para',
              text:
                "Dans les deux cas, $a^x \\neq a^y$. Deux réels distincts ne peuvent donc " +
                "jamais avoir la même image par $\\exp_a$ : c'est exactement ça, être " +
                '**injective**.',
            },
            {
              kind: 'para',
              text:
                "On vient de démontrer la **contraposée** de ce qui est demandé : " +
                "$x \\neq y \\implies a^x \\neq a^y$. Une implication et sa contraposée sont " +
                'équivalentes, donc on a bien $a^x = a^y \\implies x = y$.',
            },
            {
              kind: 'para',
              text:
                "**2) Sens** $\\impliedby$ — de $x = y$ vers $a^x = a^y$. Évident : $\\exp_a$ " +
                "est une **fonction**, elle associe une seule image à chaque antécédent. Deux " +
                'écritures du même nombre ont donc forcément la même image. ' +
                '$\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "La condition $a \\neq 1$ est **indispensable**, et uniquement pour le sens " +
                "$\\implies$. Avec $a = 1$, en effet, $1^x = 1^y = 1$ pour tous $x$ et $y$ : " +
                "l'égalité des images est toujours vraie, et n'apprend donc absolument rien " +
                'sur les exposants.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.pow(2, x), tone: 'accent' }],
            xMin: -1,
            xMax: 4.2,
            xTicks: [1, 2, 3, 4],
            fixedYRange: { min: -1, max: 11 },
            axisOfSymmetry: { x: 3, label: 'x=3' },
            testLine: { y: 8, points: [{ x: 3 }] },
            textLabels: [
              { x: -0.9, y: 8.5, text: 'y=8', tone: 'faint', anchor: 'start' },
              { x: 2.3, y: 9.6, text: 'y=2ˣ', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "Lecture graphique de l'injectivité. Résoudre 2ˣ = 8, c'est chercher les " +
              'abscisses où la courbe rencontre la droite horizontale y = 8. Comme 2ˣ est ' +
              "strictement croissante, elle ne peut couper cette droite qu'une seule fois : il " +
              "y a donc au plus une solution — et comme 8 = 2³, c'est x = 3. Toute horizontale " +
              'y = k avec k > 0 donnerait de même exactement un point.',
          },
        },
        {
          kind: 'exemple',
          formula: '$3^{2x-1} = 3^5$',
          steps: [],
          result: { tag: 'résultat', text: '$2x-1 = 5 \\implies x = 3$' },
        },
        {
          kind: 'exemple',
          badge: 'exposant du second degré',
          formula: '$5^{4t^2} = 5^{3t+1}$',
          steps: [
            { tag: 'même base', text: '$4t^2 = 3t+1 \\implies 4t^2-3t-1=0$' },
            { tag: 'discriminant', text: '$\\Delta = 9+16=25$' },
          ],
          result: { tag: 'résultat', text: '$t = \\dfrac{3+5}{8} = 1$ ou $t = \\dfrac{3-5}{8} = -\\dfrac{1}{4}$' },
        },
        {
          kind: 'methode',
          label: 'Méthode 2 — substitution',
          items: [
            "Quand l'équation fait apparaître $a^x$ et son carré, pose $t = a^x$ : elle " +
              'se ramène à une équation du second degré en $t$.',
          ],
        },
        {
          kind: 'exemple',
          formula: '$4^x - 3 \\cdot 2^x + 2 = 0$',
          steps: [
            { tag: 'reconnaître le carré', text: '$4^x = \\left(2^2\\right)^x = \\left(2^x\\right)^2$ (règle (4))' },
            { tag: 'substitution t = 2ˣ (donc t > 0)', text: '$t^2-3t+2=0 \\implies (t-1)(t-2)=0 \\implies t=1$ ou $t=2$' },
            { tag: 'les deux racines sont strictement positives, donc valides', text: '$2^x = 1 = 2^0$ ou $2^x = 2 = 2^1$' },
          ],
          result: { tag: 'même base : on identifie les exposants', text: '$x=0$ ou $x=1$' },
        },
        {
          kind: 'piege',
          text:
            'Une racine $t$ négative ou nulle doit toujours être **rejetée** ! $a^x$ est ' +
            'strictement positif, donc $t \\le 0$ ne correspond à aucun $x$ réel.',
        },
        {
          kind: 'astuce',
          label: "💡 Reconnaître l'impossible",
          text: "$5 \\cdot 2^x + 3 = 0$ n'a aucune solution : une somme de quantités strictement positives ne peut jamais valoir 0 !",
        },
        {
          kind: 'entrainement',
          title: 'Équations exponentielles',
          generatorId: '6gen9',
          description: [
            'Résous une équation exponentielle par identification de bases ou par ' +
              'substitution — et rejette les racines invalides quand il y en a.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 9. Équations exponentielles »',
        },
      ],
    },
    {
      id: 'inequations',
      number: 5,
      title: 'Résoudre une inéquation exponentielle',
      kicker: 'le sens du comparateur dépend de la base',
      blocks: [
        { kind: 'video', title: 'Résoudre une inéquation exponentielle', youtubeId: 'KEfl8oqQJMg' },
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            "Si $a > 1$, l'inégalité sur les exposants garde le même sens. Si " +
            '$0 < a < 1$, il faut **inverser** le comparateur ! Exactement comme pour ' +
            'toute fonction strictement décroissante.',
        },
        {
          kind: 'featureTable',
          headers: ['Base a', 'aᵘ ≥ aᵛ équivaut à'],
          rows: [
            ['a > 1', 'u ≥ v'],
            ['0 < a < 1', 'u ≤ v (inversé)'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'base 2 > 1',
          formula: '$2^{x-1} \\ge 8 = 2^3$',
          steps: [],
          result: { tag: 'résultat', text: '$x-1 \\ge 3 \\implies x \\ge 4$' },
        },
        {
          kind: 'exemple',
          badge: 'base 1/2, entre 0 et 1',
          formula: '$(1/2)^x < (1/2)^{-3} = 8$',
          steps: [],
          result: { tag: 'base 1/2 < 1 : on inverse le comparateur', text: '$x > -3$' },
        },
        {
          kind: 'definition',
          label: "Principes d'équivalence — inégalité de deux images par une exponentielle",
          items: [
            "Les huit cas se rangent en deux colonnes, selon la position de $a$ par rapport à " +
              '1. Pour tous $x, y \\in \\mathbb{R}$ :',
            "**Si** $0 < a < 1$ **(le sens s'inverse) :** **(a)** $a^x < a^y \\iff x > y$ ; " +
              '**(b)** $a^x \\le a^y \\iff x \\ge y$ ; **(c)** $a^x > a^y \\iff x < y$ ; ' +
              '**(d)** $a^x \\ge a^y \\iff x \\le y$.',
            "**Si** $a > 1$ **(le sens est conservé) :** **(e)** $a^x < a^y \\iff x < y$ ; " +
              '**(f)** $a^x \\le a^y \\iff x \\le y$ ; **(g)** $a^x > a^y \\iff x > y$ ; ' +
              '**(h)** $a^x \\ge a^y \\iff x \\ge y$.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', '0 < a < 1', 'a > 1'],
          rows: [
            ['aˣ < aʸ', 'x > y  (a)', 'x < y  (e)'],
            ['aˣ ≤ aʸ', 'x ≥ y  (b)', 'x ≤ y  (f)'],
            ['aˣ > aʸ', 'x < y  (c)', 'x > y  (g)'],
            ['aˣ ≥ aʸ', 'x ≤ y  (d)', 'x ≥ y  (h)'],
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — cas 0 < a < 1 (le sens s'inverse)",
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $0 < a < 1$ et $x, y \\in \\mathbb{R}$. Il suffit de démontrer " +
                "**entièrement** le cas **(a)**, $a^x < a^y \\iff x > y$ : les trois autres " +
                "cas s'en déduisent ensuite sans nouveau raisonnement. Les deux sens de " +
                "l'équivalence se traitent séparément, et avec des méthodes différentes.",
            },
            {
              kind: 'para',
              text:
                "**(a), sens** $\\impliedby$ — de $x > y$ vers $a^x < a^y$. Immédiat : puisque " +
                "$0 < a < 1$, la fonction $\\exp_a$ est strictement **décroissante** " +
                '(section 2). Appliquée aux deux membres de $x > y$, elle en **inverse** le ' +
                "sens, ce qui donne directement $a^x < a^y$.",
            },
            {
              kind: 'para',
              text:
                "**(a), sens** $\\implies$ — de $a^x < a^y$ vers $x > y$. Ce sens-ci ne se " +
                "traite pas en appliquant une fonction aux deux membres : on raisonne **par " +
                "l'absurde**.",
            },
            {
              kind: 'para',
              text:
                "Supposons donc $a^x < a^y$ (hypothèse), et supposons **en outre**, en vue " +
                "d'une contradiction, que $x \\le y$.",
            },
            {
              kind: 'para',
              text:
                "Puisque $0 < a < 1$, la fonction $\\exp_a$ est strictement décroissante. " +
                "Appliquée à $x \\le y$, elle inverse le sens de cette inégalité large et " +
                'donnerait :',
            },
            { kind: 'para', text: '$a^x \\ge a^y$' },
            {
              kind: 'para',
              text:
                "Ce qui **contredit** l'hypothèse $a^x < a^y$ : un même nombre ne peut pas être " +
                "à la fois strictement inférieur et supérieur ou égal à un autre. L'hypothèse " +
                "supplémentaire $x \\le y$ est donc impossible. Comme $x$ et $y$ sont deux " +
                'réels, la seule possibilité restante est $x > y$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "**(b) découle de (a) et du principe d'équivalence de la section 4.** " +
                "L'inégalité large $a^x \\le a^y$ signifie « $a^x < a^y$ **ou** " +
                "$a^x = a^y$ ». Le premier cas équivaut à $x > y$ par (a) ; le second équivaut " +
                "à $x = y$ par le principe d'équivalence de la section 4. La réunion des deux " +
                'conclusions est exactement « $x > y$ ou $x = y$ », soit $x \\ge y$.',
            },
            {
              kind: 'para',
              text:
                "**(c) est équivalent à (a)**, lu en échangeant les noms des deux variables. " +
                "Écrire $a^x > a^y$, c'est écrire $a^y < a^x$ : (a) appliqué au couple " +
                '$(y\\,;x)$ donne $y > x$, c\'est-à-dire $x < y$.',
            },
            {
              kind: 'para',
              text:
                "**(d) est équivalent à (b)**, par le même échange de $x$ et $y$ : " +
                "$a^x \\ge a^y$ s'écrit $a^y \\le a^x$, et (b) appliqué au couple $(y\\,;x)$ " +
                'donne $y \\ge x$, soit $x \\le y$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — cas a > 1 (le sens est conservé)',
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $a > 1$ et $x, y \\in \\mathbb{R}$. La structure est **rigoureusement " +
                "la même** que dans la colonne précédente : seul le sens de variation de " +
                "$\\exp_a$ change, et avec lui le sens de toutes les inégalités obtenues. On " +
                'démontre ici le cas **(e)**, $a^x < a^y \\iff x < y$.',
            },
            {
              kind: 'para',
              text:
                "**(e), sens** $\\impliedby$ — de $x < y$ vers $a^x < a^y$. Immédiat : puisque " +
                "$a > 1$, la fonction $\\exp_a$ est strictement **croissante** (section 2). " +
                'Appliquée aux deux membres de $x < y$, elle en **conserve** le sens.',
            },
            {
              kind: 'para',
              text:
                "**(e), sens** $\\implies$ — de $a^x < a^y$ vers $x < y$, de nouveau **par " +
                "l'absurde**. Supposons $a^x < a^y$ (hypothèse), et supposons en outre " +
                '$x \\ge y$.',
            },
            {
              kind: 'para',
              text:
                "Puisque $a > 1$, la fonction $\\exp_a$ est strictement croissante : appliquée " +
                'à $x \\ge y$, elle conserve le sens et donnerait :',
            },
            { kind: 'para', text: '$a^x \\ge a^y$' },
            {
              kind: 'para',
              text:
                "Ce qui contredit l'hypothèse $a^x < a^y$. L'hypothèse supplémentaire " +
                '$x \\ge y$ est donc impossible, et il reste $x < y$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "**(f) découle de (e) et du principe d'équivalence de la section 4** — " +
                "$a^x \\le a^y$ se décompose en « $<$ ou $=$ », traités respectivement par (e) " +
                "et par la section 4, ce qui donne « $x < y$ ou $x = y$ », soit $x \\le y$. " +
                "**(g) est équivalent à (e)** et **(h) est équivalent à (f)**, par le même " +
                'échange des rôles de $x$ et $y$ que dans la colonne de gauche.',
            },
            {
              kind: 'para',
              text:
                "Le cas $a = e$ relève toujours de cette colonne, puisque " +
                "$e \\approx 2{,}718 > 1$ : une inéquation en $e^{\\ldots}$ garde donc " +
                'toujours son comparateur.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => Math.pow(2, x), tone: 'accent' },
              { fn: (x) => Math.pow(0.5, x), tone: 'bad' },
            ],
            xMin: -3.4,
            xMax: 3.4,
            xTicks: [-2, 2],
            fixedYRange: { min: -1, max: 9 },
            testLine: { y: 4, points: [{ x: 2 }, { x: -2 }] },
            textLabels: [
              { x: -3.3, y: 5.4, text: '0,5ˣ', tone: 'bad', anchor: 'start' },
              { x: -3.3, y: 4.4, text: 'y=4', tone: 'faint', anchor: 'start' },
              { x: 3.3, y: 5.4, text: '2ˣ', tone: 'accent', anchor: 'end' },
              { x: 2.05, y: 3.3, text: 'x=2', tone: 'accent', anchor: 'start' },
              { x: -2.05, y: 3.3, text: 'x=−2', tone: 'bad', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Une même comparaison à la constante 4, dans deux bases. $2^x$ (base 2 > 1) est ' +
              'croissante : elle dépasse 4 à **droite** de son point de rencontre, donc ' +
              '$2^x \\ge 4 \\iff x \\ge 2$. $0{,}5^x$ (base 0,5 < 1) est décroissante : elle dépasse 4 à ' +
              '**gauche** du sien, donc $0{,}5^x \\ge 4 \\iff x \\le -2$. Le comparateur écrit est le même — ' +
              "l'ensemble-solution part du côté opposé.",
          },
        },
        {
          kind: 'atelier',
          tag: 'inequation-exponentielle-widget',
          label: 'Manipule toi-même — le piège central, en direct',
          caption:
            'Fais glisser a de part et d\'autre de 1 : regarde S basculer de « x ≥ … » à ' +
            '« x ≤ … » sans que tu n\'aies rien changé au symbole ◇ ni à k — c\'est exactement ' +
            'le principe (a)-(h) ci-dessus, ici entièrement visuel.',
        },
        {
          kind: 'exemple',
          badge: 'base entre 0 et 1, exposant du second degré',
          formula: '$0{,}315^{x^2} < 0{,}315^{2x+3}$',
          steps: [
            {
              tag: 'identifier la base',
              text: '$a = 0{,}315$, donc $0 < a < 1$ : on est dans le cas (a) du principe ci-dessus',
            },
            { tag: 'appliquer (a) : le sens s\'inverse', text: '$x^2 > 2x+3$' },
            { tag: 'tout ramener dans un membre', text: '$x^2-2x-3 > 0$' },
            {
              tag: 'résoudre le second degré',
              text: '$\\Delta = 4+12 = 16$, donc $x = \\dfrac{2 \\pm 4}{2}$ : racines $3$ et $-1$',
            },
            {
              tag: 'signe du trinôme',
              text:
                'coefficient de $x^2$ positif : le trinôme est $> 0$ à **l\'extérieur** des racines',
            },
          ],
          result: { tag: 'résultat', text: '$S = ]-\\infty\\,;\\,-1[ \\cup ]3\\,;\\,+\\infty[$' },
        },
        {
          kind: 'exemple',
          badge: 'base e > 1 : le sens est conservé',
          formula: '$e^{4t-2} < e^{6t-5}$',
          steps: [
            {
              tag: 'identifier la base',
              text: '$a = e \\approx 2{,}718 > 1$ : cas (e) du principe, le comparateur est conservé',
            },
            { tag: 'appliquer (e)', text: '$4t-2 < 6t-5$' },
            { tag: 'regrouper', text: '$-2+5 < 6t-4t \\implies 3 < 2t$' },
          ],
          result: { tag: 'résultat', text: '$t > \\dfrac{3}{2}$, soit $S = \\left]\\dfrac{3}{2}\\,;\\,+\\infty\\right[$' },
        },
        {
          kind: 'methode',
          label: 'Cas particuliers à reconnaître',
          items: [
            'Une quantité strictement positive ne peut jamais être ≤ un nombre strictement ' +
              'négatif : certaines inéquations n\'ont donc **aucune solution** (∅) — sans le ' +
              'moindre calcul !',
            "À l'inverse, une inégalité toujours vraie par construction (discriminant négatif, " +
              'quantité toujours positive…) peut avoir **ℝ tout entier** comme ensemble-solution.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Inéquations exponentielles',
          generatorId: '6gen10',
          description: [
            'Résous une inéquation exponentielle en tenant compte du sens de la base — pour ' +
              "savoir s'il faut inverser le comparateur, ou pas.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 10. Inéquations exponentielles »',
        },
      ],
    },
    {
      id: 'etude',
      number: 6,
      title: 'Étudier une fonction exponentielle',
      kicker: 'domaine, limites, asymptotes, variation, concavité',
      blocks: [
        { kind: 'video', title: 'Étudier une fonction exponentielle', youtubeId: '8yEwf862Z3Q' },
        {
          kind: 'para',
          text:
            "Étudier complètement une fonction, c'est déterminer, dans l'ordre : domaine, " +
            'limites, asymptotes, sens de variation, et concavité.',
        },
        {
          kind: 'definition',
          label: 'Concavité',
          items: [
            "Le signe de $f''$ donne la concavité : $f'' > 0 \\implies$ convexe ; $f'' < 0 " +
              "\\implies$ concave. Un changement de signe de $f''$ repère un **point " +
              "d'inflexion** — à ne pas confondre avec un extremum, qui vient lui d'un " +
              "changement de signe de $f'$ !",
          ],
        },
        { kind: 'subheading', text: 'Exemple résolu — étude complète' },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$f(x) = x \\cdot e^x$' },
            {
              kind: 'para',
              text: "**1) Domaine :** $\\mathbb{R}$ — un produit de deux fonctions définies partout.",
            },
            {
              kind: 'para',
              text:
                "**2) Limites et asymptotes :** en $-\\infty$, forme $(-\\infty) \\cdot 0$, que la " +
                "dominance en $-\\infty$ (section 1, $x^n \\cdot a^x \\to 0$) tranche : $f(x) \\to 0$, " +
                "asymptote horizontale $y = 0$ en $-\\infty$. En $+\\infty$, $f(x) \\to +\\infty$ ; " +
                "comme $\\dfrac{f(x)}{x} = e^x \\to +\\infty$, il n'y a pas d'asymptote de ce côté.",
            },
            {
              kind: 'para',
              text:
                "**3) Variation :** $f'(x) = e^x(1+x)$ — signe de $(1+x)$, puisque " +
                "$e^x > 0$ toujours. $f' < 0$ avant $x=-1$, $> 0$ après : **minimum** en $x=-1$, " +
                "de valeur $f(-1) = -\\dfrac{1}{e}$.",
            },
            {
              kind: 'para',
              text:
                "**4) Concavité :** $f''(x) = e^x(2+x)$ — change de signe en $x=-2$ : **point " +
                "d'inflexion** en $x=-2$, avant le minimum ; concave avant, convexe après.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x * Math.exp(x), tone: 'accent' }],
            xMin: -4.5,
            xMax: 2,
            xTicks: [-4, -3, -2, -1, 1],
            fixedYRange: { min: -1, max: 3 },
            horizontalAsymptotes: [{ y: 0, label: 'asymptote y=0' }],
            points: [
              { x: -1, y: -1 / Math.E, label: 'min (−1;−0,37)', tone: 'accent', labelPos: 'right' },
              { x: -2, y: -2 / Math.exp(2), label: 'PI (−2;−0,27)', tone: 'bad', labelPos: 'left' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "$f(x) = x \\cdot e^x$ : minimum (en orange) en $x = -1$, point d'inflexion (en rouge) " +
              'en $x = -2$, asymptote $y = 0$ en $-\\infty$.',
          },
        },
        {
          kind: 'piege',
          text:
            "Une fonction peut très bien avoir ses deux limites, en $-\\infty$ et en $+\\infty$, " +
            "égales à $+\\infty$ (par exemple $f(x) = e^x - 2x$). Ne déduis jamais la limite d'un " +
            "côté de celle de l'autre : chaque côté se calcule séparément, souvent pour des " +
            'raisons différentes.',
        },
        { kind: 'subheading', text: "Exemple résolu — une fonction paire, deux points d'inflexion" },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$f(x) = e^{-x^2}$' },
            {
              kind: 'para',
              text:
                "**1) Domaine.** $-x^2$ est défini pour tout réel, et $\\exp$ aussi : " +
                "$\\text{dom } f = \\mathbb{R}$.",
            },
            {
              kind: 'para',
              text:
                "**2) Signe.** Une exponentielle ne s'annule jamais et reste strictement " +
                "positive (section 1) : $f$ est strictement positive sur $\\mathbb{R}$. La " +
                "courbe est donc entièrement au-dessus de l'axe des abscisses.",
            },
            {
              kind: 'para',
              text:
                "**3) Limites et asymptote.** En $\\pm\\infty$, $-x^2 \\to -\\infty$, donc " +
                "$e^{-x^2} \\to 0$ : la droite $y = 0$ est asymptote horizontale **des deux " +
                'côtés**. La courbe ne coupe jamais cette asymptote, puisque $f$ ne ' +
                "s'annule jamais (étape 2).",
            },
            {
              kind: 'para',
              text:
                "**4) Variation — dérivée première.** $f$ est de la forme $e^{u}$ avec $u(x) = -x^2$, donc " +
                "$u'(x) = -2x$. La règle de la chaîne $(e^{u})' = u' \\cdot e^{u}$ donne :",
            },
            { kind: 'para', text: "$f'(x) = -2x \\cdot e^{-x^2}$" },
            {
              kind: 'para',
              text:
                "Comme $e^{-x^2} > 0$, le signe de $f'$ est celui de $-2x$, donc **opposé** à " +
                "celui de $x$ : $f' > 0$ avant 0, $f' < 0$ après. $f$ admet donc un **maximum** " +
                'en $x = 0$, de valeur $f(0) = e^{0} = 1$.',
            },
            {
              kind: 'para',
              text:
                "**5) Concavité — dérivée seconde.** Cette fois $f'$ est un **produit** de deux fonctions : " +
                "$f' = p \\cdot q$ avec $p(x) = -2x$ et $q(x) = e^{-x^2}$. On applique la règle " +
                "du produit $(pq)' = p'q + pq'$, en réutilisant pour $q'$ le calcul de " +
                "l'étape 4 : $p'(x) = -2$ et $q'(x) = -2x \\cdot e^{-x^2}$.",
            },
            {
              kind: 'para',
              text:
                "$f''(x) = \\underbrace{(-2)}_{p'} \\cdot \\underbrace{e^{-x^2}}_{q} + " +
                "\\underbrace{(-2x)}_{p} \\cdot \\underbrace{\\left(-2x\\,e^{-x^2}\\right)}_{q'}$",
            },
            {
              kind: 'para',
              text:
                "$= -2e^{-x^2} + 4x^2 e^{-x^2}$ — on développe le second produit : " +
                "$(-2x) \\cdot (-2x) = 4x^2$",
            },
            {
              kind: 'para',
              text:
                "$= \\left(4x^2-2\\right) e^{-x^2}$ — mise en évidence du facteur commun " +
                '$e^{-x^2}$',
            },
            {
              kind: 'para',
              text:
                "Comme $e^{-x^2} > 0$, le signe de $f''$ est celui de $4x^2-2$, qui s'annule " +
                "pour $4x^2 = 2$, soit $x^2 = \\dfrac{1}{2}$, soit $x = \\pm\\dfrac{\\sqrt{2}}{2} " +
                "\\approx \\pm 0{,}71$. Le trinôme $4x^2-2$ change bien de signe en ces deux " +
                "valeurs : ce sont donc **deux points d'inflexion**, symétriques par rapport à " +
                "l'axe $y$ (comme il se doit, $f$ étant paire).",
            },
          ],
        },
        {
          kind: 'signTable',
          caption: "Tableau de variations de f(x) = e⁻ˣ² — variation et concavité réunies",
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '−√2/2', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '0', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '√2/2', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'zero' },
              ],
            },
            {
              label: "signe de f′(x)",
              cells: [
                { text: '', tone: 'plain' },
                { text: '+', tone: 'pos' },
                { text: '+', tone: 'pos' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '−', tone: 'neg' },
                { text: '−', tone: 'neg' },
                { text: '−', tone: 'neg' },
                { text: '', tone: 'plain' },
              ],
            },
            {
              label: "signe de f″(x)",
              cells: [
                { text: '', tone: 'plain' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '−', tone: 'neg' },
                { text: '−', tone: 'neg' },
                { text: '−', tone: 'neg' },
                { text: '0', tone: 'zero' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
              ],
            },
            {
              label: 'variations de f',
              cells: [
                { text: 'AH y=0', tone: 'plain' },
                { text: '↗ convexe', tone: 'plain' },
                { text: 'PI', tone: 'zero' },
                { text: '↗ concave', tone: 'plain' },
                { text: 'M (0;1)', tone: 'zero' },
                { text: '↘ concave', tone: 'plain' },
                { text: 'PI', tone: 'zero' },
                { text: '↘ convexe', tone: 'plain' },
                { text: 'AH y=0', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.exp(-x * x), tone: 'accent' }],
            xMin: -2.6,
            xMax: 2.6,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -0.15, max: 1.25 },
            points: [
              { x: 0, y: 1, label: 'max (0;1)', tone: 'accent' },
              { x: Math.SQRT2 / 2, y: Math.exp(-0.5), label: 'PI (0,71;0,61)', tone: 'bad', labelPos: 'right' },
              { x: -Math.SQRT2 / 2, y: Math.exp(-0.5), label: 'PI', tone: 'bad', labelPos: 'left' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "$f(x) = e^{-x^2}$ : maximum en 0 (en orange), deux points d'inflexion (en rouge) " +
              'en $x = \\pm\\dfrac{\\sqrt{2}}{2}$ — la fameuse « courbe en cloche ».',
          },
        },
        { kind: 'subheading', text: 'Asymptote oblique' },
        {
          kind: 'definition',
          label: 'Définition — asymptote oblique',
          items: [
            "La droite d'équation $y = mx + p$ ($m \\neq 0$) est **asymptote oblique** à la " +
              "courbe de $f$ en $+\\infty$ si $\\displaystyle\\lim_{x \\to +\\infty} " +
              "\\left[f(x) - (mx + p)\\right] = 0$ : l'écart vertical entre la courbe et la droite " +
              "tend vers 0. Même définition en $-\\infty$.",
            "Avec une exponentielle, le cas typique est $f(x) = mx + p + (\\text{terme qui tend " +
              "vers } 0)$, par exemple $e^{-x}$ en $+\\infty$. Une exponentielle **croissante** " +
              "($a > 1$) en $+\\infty$, au contraire, l'emporte sur tout terme du premier degré : " +
              "pas d'asymptote oblique de ce côté.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — une asymptote oblique',
          blocks: [
            { kind: 'para', text: '$f(x) = 2x - 1 + e^{-x}$' },
            {
              kind: 'para',
              text:
                "**En** $+\\infty$ : $e^{-x} \\to 0$, donc " +
                "$f(x) - (2x - 1) = e^{-x} \\to 0$. La droite $y = 2x - 1$ est asymptote oblique " +
                "en $+\\infty$. Comme $e^{-x} > 0$, la courbe reste **au-dessus** de cette droite.",
            },
            {
              kind: 'para',
              text:
                "**En** $-\\infty$ : $e^{-x} \\to +\\infty$ et l'emporte sur $2x - 1$ " +
                "(dominance) : $f(x) \\to +\\infty$, sans asymptote oblique de ce côté, car " +
                "$f(x) - (2x - 1) = e^{-x}$ ne tend pas vers 0.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            // f(x) = 2x − 1 + e^{−x}, asymptote y = 2x − 1 en +∞ (écart e^{−x} > 0 : courbe au-dessus).
            kind: 'curvePlot',
            curves: [{ fn: (x) => 2 * x - 1 + Math.exp(-x), tone: 'accent' }],
            // fenêtre : la droite vaut −5 en x = −2, elle reste donc dans le cadre (pas de découpe).
            xMin: -2,
            xMax: 3.5,
            xTicks: [-2, -1, 1, 2, 3],
            yTicks: [-4, -2, 2, 4, 6],
            fixedYRange: { min: -5.2, max: 7 },
            obliqueAsymptotes: [{ a: 2, b: -1, label: 'y=2x−1' }],
            textLabels: [{ x: -1.9, y: 6.4, text: 'f(x)=2x−1+e⁻ˣ', tone: 'accent', anchor: 'start' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "$f(x) = 2x - 1 + e^{-x}$ : en $+\\infty$, la courbe se rapproche par au-dessus de " +
              "la droite $y = 2x - 1$ (en pointillés) ; en $-\\infty$, le terme $e^{-x}$ l'emporte " +
              'et la courbe remonte vers $+\\infty$.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Étudier une fonction exponentielle',
          generatorId: '6gen11',
          description: [
            'Mène une étude complète — domaine, limites, asymptotes, variation, concavité — ' +
              'sur une fonction exponentielle composée.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 11. Étudier une fonction exponentielle »',
        },
      ],
    },
    {
      id: 'problemes',
      number: 7,
      title: 'Exponentielles : problèmes',
      kicker: 'croissance, décroissance, saturation — un seul modèle, plusieurs contextes',
      blocks: [
        { kind: 'video', title: 'Exponentielles : problèmes', youtubeId: 'b5wBE_3U9nA' },
        {
          kind: 'para',
          text:
            "Croissance d'une population, désintégration radioactive, propagation d'une " +
            'épidémie, intérêts composés : tous ces phénomènes partagent le **même** modèle ' +
            'mathématique. Seul le contexte change.',
        },
        {
          kind: 'definition',
          label: 'Modèle de croissance/décroissance',
          items: [
            '$Q(t) = Q_0 \\cdot r^t$',
            "$Q_0$ est la quantité initiale (en $t=0$) ; $r>1$ pour une croissance, $0<r<1$ pour " +
              'une décroissance.',
          ],
        },
        {
          kind: 'application',
          titre: 'Pourquoi les ordinateurs doublent de puissance tous les deux ans',
          image: {
            src: '/images/application/microprocessor.jpg',
            alt: "Gros plan sur la puce d'un microprocesseur",
            caption:
              "Le nombre de transistors gravés sur une puce a suivi la loi de Moore pendant " +
              'des décennies. Photo : Krzysztof Gojowy, CC BY 4.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => Math.pow(2, t / 2), tone: 'accent' }],
              xMin: 0,
              xMax: 20,
              xTicks: [0, 10, 20],
              fixedYRange: { min: 0, max: 1100 },
              points: [
                { x: 0, y: 1, label: 'N₀', tone: 'accent', labelPos: 'right' },
                { x: 20, y: 1024, label: '×1024 en 20 ans', tone: 'accent', labelPos: 'left' },
              ],
              xAxisLabel: 't (années)',
              yAxisLabel: 'N(t) / N₀',
              caption:
                "$N(t) = N_0 \\cdot 2^{t/2}$ sur une échelle normale : presque plat pendant 10 ans, " +
                "puis une explosion — l'allure typique d'une exponentielle qu'on ne voit **jamais** " +
                "venir à temps en la regardant seulement au début.",
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => t / 2, tone: 'good' }],
              xMin: 0,
              xMax: 20,
              xTicks: [0, 10, 20],
              fixedYRange: { min: 0, max: 10 },
              xAxisLabel: 't (années)',
              yAxisLabel: 'nombre de doublements',
              caption:
                "La **même** croissance, mais en comptant les doublements plutôt que $N(t)$ " +
                "lui-même : une droite. C'est pour ça que les graphiques de la loi de Moore sont " +
                "presque toujours tracés en échelle logarithmique — une exponentielle y " +
                'devient une droite, beaucoup plus facile à lire.',
            },
          ],
          text:
            "En 1965, l'ingénieur américain **Gordon Moore** (cofondateur d'Intel) observe " +
            "que le nombre de transistors que l'on peut placer sur une puce électronique " +
            '**double** environ tous les deux ans, pour un coût à peu près constant — une ' +
            'prédiction connue depuis sous le nom de **loi de Moore**. C\'est un modèle ' +
            'exponentiel pur, $N(t) = N_0 \\cdot 2^{t/2}$ ($t$ en années), qui s\'est vérifié ' +
            'avec une précision frappante pendant plus de 50 ans : un processeur de ' +
            'smartphone actuel contient des milliards de transistors, là où les premiers ' +
            'microprocesseurs des années 1970 en comptaient à peine quelques milliers. ' +
            "C'est cette même croissance exponentielle qui explique pourquoi l'informatique " +
            'a progressé aussi vite. Mais une exponentielle, elle, ne ralentit jamais : c\'est ' +
            'le phénomène réel qui finit par s\'écarter du modèle exponentiel, car la loi de ' +
            'Moore touche aujourd\'hui à ses limites physiques (des transistors de quelques ' +
            'atomes).',
          domaines: ['Informatique', 'Technologie'],
        },
        { kind: 'subheading', text: 'Reconnaître un accroissement de type exponentiel' },
        {
          kind: 'exempleLibre',
          label: "Démonstration — le rapport ne dépend que de l'écart",
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$ et $r, s \\in \\mathbb{R}$ " +
                'deux instants. Calcule le rapport des images de $r$ et $s$ par $\\exp_a$, en ' +
                'une seule ligne :',
            },
            {
              kind: 'para',
              text:
                "$\\dfrac{\\exp_a(s)}{\\exp_a(r)} = \\dfrac{a^{s}}{a^{r}} = a^{s-r}$",
            },
            {
              kind: 'para',
              text:
                "La première égalité n'est que la définition de $\\exp_a$ ; la seconde est la " +
                "règle des puissances **(2)**, $\\dfrac{a^{r}}{a^{s}} = a^{r-s}$, vue à la " +
                "section 1. Le résultat ne fait plus intervenir $r$ et $s$ que par leur " +
                "**différence** $s-r$ : le rapport est donc constant dès que l'écart entre les " +
                "deux instants l'est.",
            },
            {
              kind: 'para',
              text:
                "**Le résultat survit à un facteur constant.** Soit maintenant " +
                "$f : \\mathbb{R} \\to \\mathbb{R} : x \\mapsto k \\cdot a^{x}$, avec $k \\ne 0$ " +
                "réel. Le même calcul donne, pour tous $r, s$ :",
            },
            {
              kind: 'para',
              text:
                "$\\dfrac{f(s)}{f(r)} = \\dfrac{k \\cdot a^{s}}{k \\cdot a^{r}} = " +
                "\\dfrac{a^{s}}{a^{r}} = a^{s-r}$",
            },
            {
              kind: 'para',
              text:
                "Le facteur $k$ apparaît au numérateur **et** au dénominateur : il se " +
                "**simplifie** ! Le rapport obtenu est exactement le même que pour $\\exp_a$ " +
                "toute seule. Autrement dit, la valeur initiale d'une grandeur ne change rien " +
                'à son taux de croissance — deux populations de tailles très différentes ' +
                'peuvent très bien croître au même rythme. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "**La réciproque est vraie**, et on l'admet ici : une fonction **continue** et " +
                "**jamais nulle** sur $\\mathbb{R}$, dont le rapport $f(s)/f(r)$ ne dépend que de la différence " +
                "$s-r$ est forcément une fonction exponentielle, ou un multiple de fonction " +
                'exponentielle (ou une fonction constante, si ce rapport vaut toujours 1). ' +
                "C'est elle qui te permet, dans un problème, de **conclure** à un modèle " +
                "exponentiel à partir d'un simple tableau de mesures.",
            },
          ],
        },
        {
          kind: 'astuce',
          label: '💡 En pratique, dans un tableau de données',
          text:
            "Face à un tableau de valeurs expérimentales, choisis des observations prises à " +
            "**intervalles de temps égaux** (la variable augmente à pas constant), puis " +
            "calcule le rapport de deux valeurs **consécutives**. Si ce rapport reste à peu " +
            'près constant, la situation se modélise par $f(t) = b \\cdot a^{t}$, où $a$ est ' +
            'une valeur approchée de ce rapport et $b$ la valeur initiale (celle lue en ' +
            "$t=0$). Attention : c'est bien le **rapport** qu'il faut calculer, jamais la " +
            'différence ! Une différence constante, elle, signale plutôt un modèle linéaire.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => 100 * Math.pow(1.5, t), tone: 'accent', xMin: 0, xMax: 3.5 }],
            xMin: -0.4,
            xMax: 3.6,
            xTicks: [1, 2, 3],
            fixedYRange: { min: -40, max: 420 },
            textLabels: [
              { x: 0.15, y: 330, text: 'Q(t)=100·1,5ᵗ', tone: 'accent', anchor: 'start' },
              { x: 0.5, y: 190, text: '×1,5', tone: 'good', anchor: 'middle' },
              { x: 1.5, y: 260, text: '×1,5', tone: 'good', anchor: 'middle' },
              { x: 2.5, y: 370, text: '×1,5', tone: 'good', anchor: 'middle' },
              { x: 0.05, y: 55, text: '100', tone: 'accent', anchor: 'start' },
              { x: 1.05, y: 105, text: '150', tone: 'accent', anchor: 'start' },
              { x: 2.05, y: 168, text: '225', tone: 'accent', anchor: 'start' },
              { x: 3.05, y: 258, text: '337,5', tone: 'accent', anchor: 'start' },
            ],
            points: [
              { x: 0, y: 100, label: '', tone: 'accent' },
              { x: 1, y: 150, label: '', tone: 'accent' },
              { x: 2, y: 225, label: '', tone: 'accent' },
              { x: 3, y: 337.5, label: '', tone: 'accent' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'Q',
            caption:
              'Quatre mesures prises à intervalles de temps égaux : 100, 150, 225 et 337,5. ' +
              'Les **différences** (+50, +75, +112,5) ne sont pas constantes, mais les **rapports** le ' +
              'sont : $\\dfrac{150}{100} = \\dfrac{225}{150} = \\dfrac{337{,}5}{225} = 1{,}5$. Le modèle est donc exponentiel, de ' +
              "facteur $a = 1{,}5$ et de valeur initiale $b = 100$ — d'où $Q(t) = 100 \\cdot 1{,}5^t$, la courbe " +
              'qui passe exactement par les quatre points.',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text: 'Une population de 1000 individus croît de 5 % par an : $Q(t) = 1000 \\cdot 1{,}05^t$.',
            },
            { kind: 'para', text: 'Après 10 ans : $Q(10) = 1000 \\cdot 1{,}05^{10} \\approx 1629$ individus.' },
          ],
        },
        {
          kind: 'astuce',
          label: '💡 Doublements : remonter le temps',
          text:
            "Quand une quantité double à chaque période, reculer de $k$ périodes revient à la " +
            "**diviser** par $2^k$. Un nénuphar qui double chaque jour et couvre tout l'étang le " +
            "jour 30 en couvrait la moitié le jour 29, le quart le jour 28, et seulement " +
            "$\\dfrac{1}{2^{k}}$ de l'étang le jour $30 - k$. De même pour une demi-vie : $k$ " +
            "demi-vies divisent la quantité par $2^k$.",
        },
        { kind: 'subheading', text: 'Modèle de saturation' },
        {
          kind: 'intuition',
          label: 'Une rumeur qui plafonne',
          text:
            'Une rumeur se propage vite au début, puis ralentit à mesure que presque tout le ' +
            "monde est déjà au courant — elle s'approche de 100 % de la population sans " +
            "jamais l'atteindre parfaitement. Une épidémie qui sature, un objet qui refroidit " +
            "vers la température ambiante : même logique. C'est ce que capture " +
            '$p(t) = 1 - e^{-0{,}1t}$ : le terme $e^{-0{,}1t}$ décroît vers 0 comme dans ' +
            "l'exemple de la radioactivité vu plus haut, donc $p(t)$ grimpe vers 1 sans " +
            'jamais y arriver tout à fait.',
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$p(t) = 1 - e^{-0{,}1t}$' },
            {
              kind: 'para',
              text:
                'Quand $t$ augmente, $e^{-0,1t}$ tend vers 0, donc $p(t)$ tend vers 1 (100 %) ' +
                "sans jamais l'atteindre ! Après 10 unités de temps : $p(10) = 1-e^{-1} " +
                '\\approx 0{,}632$, soit environ 63 %.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => 1 - Math.exp(-0.1 * t), tone: 'accent', xMin: 0, xMax: 30 }],
            xMin: -1,
            xMax: 30,
            xTicks: [10, 20, 30],
            fixedYRange: { min: -0.08, max: 1.2 },
            horizontalAsymptotes: [{ y: 1, label: 'asymptote y=1' }],
            points: [
              { x: 0, y: 0, label: '(0;0)', tone: 'accent' },
              { x: 10, y: 1 - Math.exp(-1), label: '(10;0,63)', tone: 'accent' },
              { x: 20, y: 1 - Math.exp(-2), label: '(20;0,86)', tone: 'accent' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'y',
            caption:
              "Modèle de saturation $p(t) = 1 - e^{-0{,}1t}$ de l'exemple : $p(10) \\approx 0{,}63$, " +
              "$p(20) \\approx 0{,}86$, et la courbe s'approche de l'asymptote $y = 1$ sans jamais " +
              "l'atteindre.",
          },
        },
        {
          kind: 'atelier',
          tag: 'croissance-saturation-widget',
          label: 'Manipule toi-même — un seul modèle, deux visages',
          caption:
            'Bascule entre croissance libre et saturation, règle les paramètres et déplace le ' +
            'curseur t pour lire la valeur à un instant précis — les réglages par défaut ' +
            'reprennent les deux exemples déjà résolus ci-dessus.',
        },
        {
          kind: 'astuce',
          label: '💡 Trouver un instant précis',
          text:
            "Pour répondre à « à partir de quel instant $t$ la quantité dépasse-t-elle un " +
            'seuil donné ? », isole le terme exponentiel, puis utilise le logarithme népérien ' +
            'à la calculatrice — la seule situation du chapitre où ln intervient vraiment en ' +
            'pratique.',
        },
        { kind: 'subheading', text: 'Plafond ou plancher : le modèle T(t) = L + C·qᵗ' },
        {
          kind: 'definition',
          label: 'Modèle avec valeur limite',
          items: [
            "$T(t) = L + C \\cdot q^t$ avec $0 < q < 1$ et $C \\neq 0$ : le terme $C \\cdot q^t$ " +
              "tend vers 0, donc $T(t) \\to L$ et la droite $y = L$ est asymptote horizontale. " +
              "Si $C > 0$, la grandeur descend vers $L$ (un objet qui refroidit vers la " +
              "température de la pièce) ; si $C < 0$, elle monte vers $L$ (un plafond).",
            "Cas particulier $L = Q_0$ et $C = -Q_0$ : $Q(t) = Q_0\\left(1 - q^t\\right)$ part de " +
              "0 et monte vers $Q_0$. C'est le modèle de saturation ci-dessus, puisque " +
              "$e^{-kt} = \\left(e^{-k}\\right)^t$ (règle (4)) : $q = e^{-k}$.",
            "**Trois mesures à intervalles égaux** $d$ (instants $t_0$, $t_0 + d$, " +
              "$t_0 + 2d$) suffisent pour retrouver le modèle. $L$ disparaît des écarts : " +
              "$T(t_0 + d) - T(t_0) = C q^{t_0}\\left(q^d - 1\\right)$ et " +
              "$T(t_0 + 2d) - T(t_0 + d) = C q^{t_0 + d}\\left(q^d - 1\\right)$, donc le " +
              "rapport des deux écarts vaut $q^d$. On en tire $q$, puis $C$, puis $L$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — un café qui refroidit',
          blocks: [
            {
              kind: 'para',
              text:
                "Un café est servi à 84 °C. Il mesure 36 °C après une demi-heure et 24 °C après " +
                "une heure. On prend $t$ en quarts d'heure et le modèle " +
                "$T(t) = L + C \\cdot q^t$ : $T(0) = 84$, $T(2) = 36$, $T(4) = 24$.",
            },
            {
              kind: 'para',
              text:
                "**Rapport des écarts** (sur $d = 2$ quarts d'heure) : " +
                "$\\dfrac{T(4) - T(2)}{T(2) - T(0)} = \\dfrac{24 - 36}{36 - 84} = " +
                "\\dfrac{-12}{-48} = \\dfrac{1}{4}$, donc $q^2 = \\dfrac{1}{4}$ et $q = \\dfrac{1}{2}$.",
            },
            {
              kind: 'para',
              text:
                "**Coefficient** $C$ : $T(2) - T(0) = C\\left(q^2 - 1\\right)$, soit " +
                "$-48 = C \\cdot \\left(-\\dfrac{3}{4}\\right)$, d'où $C = 64$.",
            },
            {
              kind: 'para',
              text:
                "**Valeur limite** $L$ : $L = T(0) - C = 84 - 64 = 20$. La pièce est à 20 °C, " +
                "et $T(t) = 20 + 64 \\cdot \\left(\\dfrac{1}{2}\\right)^t$.",
            },
            {
              kind: 'para',
              text:
                "**Prévision** : après une heure et demie ($t = 6$), " +
                "$T(6) = 20 + \\dfrac{64}{64} = 21$ °C. Le café ne descendra jamais sous 20 °C.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            // T(t) = 20 + 64·(1/2)^t : T(0) = 84, T(2) = 36, T(4) = 24, T(6) = 21 ; asymptote y = 20.
            kind: 'curvePlot',
            curves: [{ fn: (t) => 20 + 64 * Math.pow(0.5, t), tone: 'accent', xMin: 0, xMax: 7 }],
            xMin: -0.4,
            xMax: 7.2,
            xTicks: [1, 2, 3, 4, 5, 6, 7],
            yTicks: [40, 60, 80],
            fixedYRange: { min: -5, max: 95 },
            horizontalAsymptotes: [{ y: 20, label: 'y=20' }],
            points: [
              { x: 0, y: 84, label: '(0;84)', tone: 'accent', labelPos: 'right' },
              { x: 2, y: 36, label: '(2;36)', tone: 'accent', labelPos: 'above' },
              { x: 4, y: 24, label: '(4;24)', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 't (quarts d’heure)',
            yAxisLabel: 'T (°C)',
            caption:
              "Les trois mesures et le modèle $T(t) = 20 + 64 \\cdot 0{,}5^t$ : " +
              "les écarts à 20 °C (64, puis 16, puis 4) sont divisés par 4 tous les deux quarts " +
              "d'heure, et la courbe s'approche de l'asymptote $y = 20$.",
          },
        },
        { kind: 'subheading', text: 'Le maximum d’un modèle tⁿ·e⁻ᵃᵗ' },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — le pic de concentration d'un médicament",
          blocks: [
            {
              kind: 'para',
              text:
                "Après une prise, la concentration d'un médicament dans le sang vaut " +
                "$C(t) = 5t \\cdot e^{-0{,}5t}$ (en mg/L, $t$ en heures, $t \\ge 0$). Quand est-elle " +
                'maximale ?',
            },
            {
              kind: 'para',
              text:
                "**Dérivée** (règle du produit, puis mise en évidence de $5e^{-0{,}5t}$) : " +
                "$C'(t) = 5e^{-0{,}5t} + 5t \\cdot \\left(-0{,}5\\right) e^{-0{,}5t} = " +
                "5e^{-0{,}5t}\\left(1 - 0{,}5t\\right)$.",
            },
            {
              kind: 'para',
              text:
                "**Signe** : $5e^{-0{,}5t} > 0$, donc $C'$ a le signe de $1 - 0{,}5t$ : positive " +
                "avant $t = 2$, négative après. La concentration est **maximale** en $t = 2$ h, " +
                "et vaut $C(2) = 10e^{-1} \\approx 3{,}68$ mg/L (calculatrice).",
            },
            {
              kind: 'para',
              text:
                "**En général**, pour $f(t) = t^n \\cdot e^{-at}$ ($a > 0$, $n \\ge 1$) : " +
                "$f'(t) = t^{n-1} e^{-at}\\left(n - at\\right)$, qui change de signe en " +
                "$t = \\dfrac{n}{a}$ : c'est là que se trouve le maximum. Ici $n = 1$ et " +
                "$a = 0{,}5$ redonnent $t = 2$.",
            },
          ],
        },
        {
          kind: 'application',
          titre: "L'interrupteur « doux » qui fait fonctionner l'intelligence artificielle",
          image: {
            src: '/images/application/neural-network.png',
            alt: 'Schéma d\'un réseau de neurones artificiels à 3 couches',
            caption:
              'Chaque neurone applique une fonction sigmoïde à la somme pondérée de ses ' +
              'entrées. Diagramme : Cburnett, CC BY-SA 3.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => 1 / (1 + Math.exp(-x)), tone: 'accent' },
                { fn: (x) => (x < 0 ? 0 : 1), tone: 'bad' },
              ],
              xMin: -6,
              xMax: 6,
              xTicks: [-6, 0, 6],
              horizontalAsymptotes: [{ y: 0 }, { y: 1 }],
              points: [{ x: 0, y: 0.5, label: '', tone: 'accent' }],
              textLabels: [
                { x: -5.5, y: 0.85, text: 'sigmoïde (douce)', tone: 'accent', anchor: 'start' },
                { x: 1.5, y: 0.15, text: 'tout-ou-rien (brutal)', tone: 'bad', anchor: 'start' },
              ],
              xAxisLabel: 'x (entrée pondérée)',
              yAxisLabel: 'σ(x)',
              caption:
                "$\\sigma(x) = \\dfrac{1}{1+e^{-x}}$ (orange) bascule progressivement de 0 à 1 autour de $x = 0$, au " +
                'lieu du saut brutal "tout ou rien" (rouge) — c\'est ce qui permet au réseau ' +
                "d'ajuster ses réponses petit à petit plutôt que par à-coups.",
            },
          ],
          text:
            'Les réseaux de neurones artificiels, au cœur de l\'intelligence artificielle ' +
            'moderne, ont besoin d\'une fonction qui transforme n\'importe quel nombre réel ' +
            'en une valeur comprise entre 0 et 1 — un peu comme le modèle de saturation que ' +
            'tu viens de voir. Cette fonction, appelée **sigmoïde**, s\'écrit ' +
            '$\\sigma(x) = \\dfrac{1}{1+e^{-x}}$ : exactement le même ingrédient, $e^{-x}$, ' +
            'que dans ton modèle de saturation $p(t)=1-e^{-0{,}1t}$. Quand $x$ est très ' +
            'négatif, $\\sigma(x)$ vaut presque 0 ; quand $x$ est très positif, elle vaut ' +
            'presque 1 ; autour de 0, elle bascule progressivement de l\'un à l\'autre. ' +
            'Chaque « neurone » d\'un réseau utilise cette bascule pour décider, de façon ' +
            'graduelle plutôt que brutale, à quel point il doit « s\'activer » — une des ' +
            'briques mathématiques de base derrière des outils comme la reconnaissance ' +
            'd\'image ou les assistants conversationnels.',
          domaines: ['Intelligence artificielle', 'Informatique'],
        },
        {
          kind: 'entrainement',
          title: "Problèmes d'exponentielles",
          generatorId: '6gen12',
          description: [
            "Modélise une situation de croissance, décroissance ou saturation exponentielle à " +
              "partir d'une histoire, puis réponds à une question sur un instant précis.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 12. Problèmes d\'exponentielles »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Puissances à exposants réels',
        formulas: [
          { text: '$a^r \\cdot a^s = a^{r+s} \\qquad \\dfrac{a^r}{a^s} = a^{r-s}$', condition: '$a > 0$, $r, s$ réels' },
          { text: '$(a \\cdot b)^r = a^r \\cdot b^r \\qquad (a^r)^s = a^{r \\cdot s}$', condition: '$a, b > 0$' },
          { text: '$a^x > 0 \\qquad a^{-x} = \\dfrac{1}{a^x}$', condition: 'pour tout réel $x$' },
        ],
      },
      {
        title: 'Limites',
        formulas: [
          {
            text: '$\\displaystyle\\lim_{x \\to -\\infty} a^x = 0 \\qquad \\displaystyle\\lim_{x \\to +\\infty} a^x = +\\infty$',
            condition: 'si $a>1$',
          },
          {
            text: '$\\displaystyle\\lim_{x \\to -\\infty} a^x = +\\infty \\qquad \\displaystyle\\lim_{x \\to +\\infty} a^x = 0$',
            condition: 'si $0<a<1$',
          },
          {
            text: '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{x^n}{a^x} = 0$',
            condition: "pour $a>1$ et tout entier $n$ — l'exponentielle domine",
          },
          {
            text: '$\\displaystyle\\lim_{x \\to -\\infty} x^n \\cdot a^x = 0$',
            condition: 'pour $a>1$ et tout entier $n$ — dominance en $-\\infty$',
          },
          { text: '$\\displaystyle\\lim_{x \\to 0} \\dfrac{e^x - 1}{x} = 1$', condition: 'limite fondamentale' },
          { text: '$\\displaystyle\\lim_{x \\to 0} \\dfrac{a^x - 1}{x} = \\ln(a)$', condition: 'nombre dérivé de $a^x$ en 0' },
          { text: '$e = \\displaystyle\\lim_{x \\to +\\infty} \\left(1+\\dfrac{1}{x}\\right)^x \\approx 2{,}718$', condition: 'définition de $e$' },
          { text: '$\\displaystyle\\lim_{x \\to +\\infty} \\left(1+\\dfrac{k}{x}\\right)^{mx} = e^{km}$', condition: '$k, m$ réels' },
        ],
      },
      {
        title: 'Dérivée',
        formulas: [
          { text: "$(a^x)' = \\ln(a) \\cdot a^x$" },
          { text: "$(e^x)' = e^x$", condition: "$e$ est la seule base $a$ pour laquelle $a^x$ est égale à sa dérivée" },
          { text: "$(a^{g(x)})' = g'(x) \\cdot a^{g(x)} \\cdot \\ln(a)$", condition: 'règle de la chaîne' },
          { text: "$(e^{u(x)})' = u'(x) \\cdot e^{u(x)}$", condition: 'règle de la chaîne, base $e$' },
          {
            text: '$\\ln(a) > 0$ si $a > 1 \\qquad \\ln(1) = 0 \\qquad \\ln(a) < 0$ si $0 < a < 1$',
            condition: "signe de la dérivée de $a^x$ : croissante si $a > 1$, décroissante si $0 < a < 1$",
          },
        ],
      },
      {
        title: "Règle de L'Hôpital",
        formulas: [
          {
            text: "$\\displaystyle\\lim_{x \\to a} \\dfrac{f(x)}{g(x)} = \\displaystyle\\lim_{x \\to a} \\dfrac{f'(x)}{g'(x)}$",
            condition:
              "si la forme est $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$, si $f$ et $g$ sont dérivables au voisinage de $a$ " +
              "avec $g' \\neq 0$, et si la limite de droite existe ; aussi en $\\pm\\infty$",
          },
        ],
      },
      {
        title: 'Graphique de la dérivée',
        formulas: [
          { text: "$f' > 0$ : $f$ strictement croissante ; $f' < 0$ : $f$ strictement décroissante", condition: 'sur un intervalle' },
          { text: "$f'$ s'annule en changeant de signe : extremum de $f$", condition: "de $+$ à $-$ : maximum ; de $-$ à $+$ : minimum" },
          { text: "$f$ paire $\\Rightarrow f'$ impaire ; $f$ impaire $\\Rightarrow f'$ paire" },
        ],
      },
      {
        title: 'Équation exponentielle',
        formulas: [
          { text: '$a^x = a^y \\iff x = y$', condition: '$a>0$, $a \\neq 1$' },
          { text: 'substitution $t = a^x$', condition: 'toujours $t>0$ — rejette toute racine $t \\le 0$' },
        ],
      },
      {
        title: 'Inéquation exponentielle',
        formulas: [
          { text: '$a^x \\le a^y \\iff x \\le y$', condition: 'si $a>1$ — sens conservé' },
          { text: '$a^x \\le a^y \\iff x \\ge y$', condition: 'si $0<a<1$ — sens inversé' },
        ],
      },
      {
        title: 'Étude de fonction',
        formulas: [
          { text: "$f'' > 0$ : $f$ convexe ; $f'' < 0$ : $f$ concave", condition: "changement de signe de $f''$ : point d'inflexion" },
          {
            text: '$y = mx + p$ asymptote oblique en $+\\infty$ si $\\displaystyle\\lim_{x \\to +\\infty} \\left[f(x) - (mx + p)\\right] = 0$',
            condition: 'même définition en $-\\infty$',
          },
        ],
      },
      {
        title: 'Modèles exponentiels',
        formulas: [
          { text: '$Q(t) = Q_0 \\cdot r^t$', condition: '$r>1$ croissance, $0<r<1$ décroissance ; $p$ % par période : $r = 1 \\pm \\dfrac{p}{100}$' },
          { text: '$\\dfrac{f(s)}{f(r)} = a^{s-r}$', condition: 'pour $f(x) = k \\cdot a^x$ : rapport constant à écart constant' },
          { text: '$k$ périodes plus tôt : quantité divisée par $2^k$', condition: 'quantité qui double à chaque période' },
          { text: '$p(t) = 1 - e^{-kt}$', condition: 'modèle de saturation, tend vers 1' },
          { text: '$T(t) = L + C \\cdot q^t$', condition: '$0<q<1$ : tend vers $L$ ; cas $Q_0\\left(1 - q^t\\right)$, qui tend vers $Q_0$' },
          {
            text: '$\\dfrac{T(t_0 + 2d) - T(t_0 + d)}{T(t_0 + d) - T(t_0)} = q^d$',
            condition: 'trois mesures à intervalles égaux $d$',
          },
          { text: "maximum de $t^n \\cdot e^{-at}$ en $t = \\dfrac{n}{a}$", condition: '$a > 0$, $t \\ge 0$' },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Base', 'limite en −∞', 'limite en +∞', 'Dérivée'],
      rows: [
        ['a > 1', '0', '+∞', 'ln(a)·aˣ'],
        ['0 < a < 1', '+∞', '0', 'ln(a)·aˣ'],
        ['a = e', '0', '+∞', 'eˣ (dérivée = fonction)'],
      ],
    },
    forward:
      "À retenir : l'exponentielle domine toujours tout polynôme en +∞. Côté " +
      'équations/inéquations, tu raisonnes par identification de bases ou par substitution — ' +
      "jamais par logarithme, pas encore à ce stade. Le seul usage de ln dans ce chapitre est " +
      "la touche de la calculatrice, pour trouver un instant précis dans un problème (section 7).",
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai/faux : réviser tout le chapitre',
      generatorId: '6gen65',
      description: [
        'Choisis un thème et teste-toi sur tout le chapitre : affirmations pré-écrites, une ' +
          'seule tentative par question, justification toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 65. Quiz vrai/faux — Fonctions exponentielles »',
    },
  },
}
