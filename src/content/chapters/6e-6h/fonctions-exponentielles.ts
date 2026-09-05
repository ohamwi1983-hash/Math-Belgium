import type { ChapterContent } from '../../types'

export const fonctionsExponentielles: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 2,
  title: 'Fonctions exponentielles',
  slug: 'fonctions-exponentielles',
  lede:
    "Une fonction exponentielle est la seule dont la vitesse de croissance à chaque instant est " +
    "proportionnelle à sa propre valeur — c'est ce qui explique pourquoi elle décrit population, " +
    "radioactivité, épidémies ou intérêts composés, et pourquoi $e^x$ occupe une place à part : " +
    "elle est sa propre dérivée.",

  sections: [
    {
      id: 'limites',
      number: 1,
      title: 'Calcul de limites',
      kicker: "la position de la base par rapport à 1, puis la dominance sur tout polynôme",
      blocks: [
        {
          kind: 'para',
          text:
            "Il existe deux grandes façons pour une quantité d'évoluer à intervalles de temps " +
            "égaux : de façon **linéaire** (elle augmente d'une valeur constante) ou de façon " +
            "**exponentielle** (elle est multipliée par un facteur constant).",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — comparer les deux modèles',
          blocks: [
            {
              kind: 'para',
              text:
                "Un robinet remplit une citerne à débit constant $d$ : la quantité suit " +
                "$f(t) = d \\cdot t + q_0$, une fonction du premier degré — croissance **linéaire**.",
            },
            {
              kind: 'para',
              text:
                "Une surface d'algues double chaque semaine : en notant $S_0$ la surface " +
                "initiale, la surface après $t$ semaines entières vaut $S_0 \\cdot 2^t$ — chaque " +
                "semaine, ce n'est pas une quantité fixe qui s'ajoute, mais un **facteur** " +
                "constant (ici ×2) qui s'applique. C'est une croissance **exponentielle**.",
            },
            {
              kind: 'para',
              text:
                "Rien n'oblige à s'arrêter aux semaines entières. Le facteur multiplicatif " +
                "quotidien $k$ doit lui aussi être constant, et sept jours doivent redonner le " +
                "facteur hebdomadaire : $k^7 = 2$, donc $k = \\sqrt[7]{2} = 2^{1/7}$. Après " +
                "3 jours, la surface est donc multipliée par $\\left(2^{1/7}\\right)^3 = 2^{3/7}$, " +
                "et après 7 jours par $\\left(2^{1/7}\\right)^7 = 2$ — bien le facteur d'une " +
                "semaine, comme il se doit.",
            },
            {
              kind: 'para',
              text:
                "En généralisant, pour une durée de $\\dfrac{n}{p}$ semaines la surface est " +
                "multipliée par $2^{n/p}$, et pour une durée de $\\dfrac{n}{p}$ semaines " +
                "**avant** l'instant initial il faut au contraire **diviser** par $2^{n/p}$, " +
                "c'est-à-dire multiplier par $2^{-n/p}$. Pour tout $t$ **rationnel**, positif ou " +
                "négatif, on obtient donc la même écriture : $f(t) = S_0 \\cdot 2^t$.",
            },
            {
              kind: 'para',
              text:
                "Toutes les définitions de puissance vues les années précédentes (exposant " +
                "entier, fractionnaire, positif, négatif), si disparates qu'elles paraissent, " +
                "expriment ici une seule et même réalité. Reste à franchir un dernier pas : " +
                "donner un sens à $2^t$ pour $t$ **irrationnel** — c'est exactement l'objet de " +
                "la définition qui suit.",
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
              { x: 3.45, y: 2.4, text: 'S₀·2^t : ×2 par semaine', tone: 'accent', anchor: 'end' },
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
              'de temps on AJOUTE toujours la même quantité (+1,2), et le graphique est une ' +
              'droite. En accent, le modèle exponentiel : à chaque pas on MULTIPLIE par le même ' +
              'facteur (×2), et les valeurs S₀, 2S₀, 4S₀, 8S₀ se succèdent. Le modèle linéaire ' +
              "part pourtant plus haut — l'exponentiel ne le rattrape que vers t ≈ 2,6, puis ne " +
              'se laisse plus jamais rejoindre.',
          },
        },
        {
          kind: 'definition',
          label: 'Définition — fonction exponentielle de base a',
          items: [
            "Pour $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$, il existe une unique fonction " +
              "$f : \\mathbb{R} \\to \\mathbb{R}$, continue, telle que $f(x) = a^x$ pour tout $x$ " +
              "rationnel (théorème admis). Cette fonction, notée $\\exp_a$, **prolonge " +
              "naturellement** la puissance $a^x$ à tout exposant réel — y compris irrationnel : " +
              "on pose alors, par définition, $a^x = \\exp_a(x)$.",
            "Pour $a = 1$, cette fonction est constante (toujours égale à 1) : ce n'est pas une " +
              "exponentielle — d'où la condition $a \\neq 1$.",
          ],
        },
        {
          kind: 'methode',
          label: 'Propriétés des puissances à exposants réels',
          items: [
            "Pour $a, b \\in \\mathbb{R}_0^+$ et $r, s \\in \\mathbb{R}$, exactement les mêmes " +
              'règles qu\'avec des exposants entiers ou rationnels restent valables :',
            "**(1)** $a^r \\cdot a^s = a^{r+s} \\qquad$ **(2)** $\\dfrac{a^r}{a^s} = a^{r-s}$",
            "**(3)** $(a \\cdot b)^r = a^r \\cdot b^r \\qquad$ **(4)** $(a^r)^s = a^{r \\cdot s}$",
            "Ces quatre règles sont l'**extension** aux exposants réels de règles déjà connues " +
              "pour les exposants rationnels ; elles sont admises sans démonstration à ce stade " +
              "(une preuve complète relève de l'analyse réelle). Elles seront citées par leur " +
              'numéro, (1) à (4), dans toutes les démonstrations du chapitre.',
            "Attention à la condition sur les bases : si $a$ ou $b$ n'est pas strictement " +
              "positif, ces égalités peuvent encore être vraies pour certaines valeurs de $r$ " +
              "et $s$, mais plus pour toutes — et la règle (2) n'est **jamais** valable si " +
              '$a = 0$, faute de pouvoir diviser par $0^s = 0$.',
          ],
        },
        {
          kind: 'para',
          text:
            "Le comportement d'une fonction exponentielle $a^x$ ($a>0$, $a \\neq 1$) à l'infini " +
            "ne dépend que d'une seule chose : la position de $a$ par rapport à 1.",
        },
        {
          kind: 'featureTable',
          headers: ['Base', 'lim en −∞', 'lim en +∞'],
          rows: [
            ['a > 1', '0', '+∞'],
            ['0 < a < 1', '+∞', '0'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            compact: true,
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
          kind: 'astuce',
          label: '💡 Le cas de e',
          text:
            "$e \\approx 2{,}718 > 1$ : la fonction $e^x$ suit donc toujours le premier cas de " +
            "la table ci-dessus (croissante, 0 en −∞, +∞ en +∞).",
        },
        { kind: 'subheading', text: 'La règle de dominance' },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            "Pour toute base $a > 1$, l'exponentielle $a^x$ l'emporte toujours sur n'importe " +
              "quelle puissance de $x$, aussi grand soit son degré ou son coefficient :",
            "$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{x^n}{a^x} = 0 \\quad$ pour tout entier $n$",
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => x * x, tone: 'faint' },
              { fn: Math.exp, tone: 'accent' },
            ],
            xMin: -1,
            xMax: 3.2,
            xTicks: [-1, 1, 2, 3],
            fixedYRange: { min: -1, max: 10 },
            points: [{ x: -0.7035, y: Math.exp(-0.7035), label: 'croisement', tone: 'good' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'en accent : eˣ. En fané : x². Malgré une avance initiale du polynôme, ' +
              "l'exponentielle finit toujours par dominer",
          },
        },
        {
          kind: 'piege',
          text:
            "$\\displaystyle\\lim_{x \\to +\\infty} (2^x - x^{1000}) = +\\infty$, **pas** $-\\infty$. Même avec " +
            "un exposant polynomial énorme, l'exponentielle finit par l'emporter — le signe du " +
            "terme polynomial ne change jamais la conclusion.",
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
            "Cette limite n'est autre que le nombre dérivé de $e^x$ en 0 — elle annonce " +
              'directement la section suivante.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Calcul de limites',
          generatorId: '6gen6',
          description: [
            "Calcule des limites de fonctions exponentielles en utilisant la position de la " +
              'base par rapport à 1 et la règle de dominance sur tout polynôme.',
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
        {
          kind: 'para',
          text:
            "$a^x$ est définie sur $\\mathbb{R}$ tout entier, quelle que soit la base $a>0$ " +
            "($a \\neq 1$) — seule une composition avec une autre fonction (racine, fraction…) " +
            "peut restreindre ce domaine.",
        },
        {
          kind: 'definition',
          label: 'Formule générale',
          items: [
            "$(a^x)' = \\ln(a) \\cdot a^x$",
            "Cas particulier essentiel : $\\ln(e) = 1$, donc $(e^x)' = e^x$ — $e^x$ est sa " +
              'propre dérivée.',
            "Ces deux formules ne sont pas à admettre : elles sont **démontrées** en fin de " +
              "section, à partir de la seule définition du nombre dérivé.",
          ],
        },
        {
          kind: 'piege',
          text:
            "$(2^x)'$ **n'est pas** $2^x$ — il manque le facteur $\\ln(2)$ : $(2^x)' = \\ln(2) " +
            "\\cdot 2^x$. Seule la base $e$ se dérive « sans rien changer ».",
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
                "$k(x) = 3^{x^4-x}$ : base $\\ne e$ **et** exposant composé, les deux facteurs " +
                'apparaissent donc. Avec $u(x) = x^4-x$ :',
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
                "$m(x) = e^{\\sin(x)}$ : base $e$, donc pas de facteur $\\ln$, mais la chaîne " +
                "reste : $m'(x) = \\left(\\sin x\\right)' \\cdot e^{\\sin x} = \\cos(x) \\cdot " +
                'e^{\\sin x}$.',
            },
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les quatre formules de dérivation, en notations fonctionnelles et en pratique',
          headers: ['Notation fonctionnelle', 'En pratique', 'Exemple'],
          rows: [
            ["expₐ′ = ln(a)·expₐ", "(aˣ)′ = aˣ·ln(a)", "(3ˣ)′ = 3ˣ·ln(3)"],
            ["(expₐ ∘ f)′ = ln(a)·f′·(expₐ ∘ f)", "(a^f(x))′ = f′(x)·a^f(x)·ln(a)", "(3^(x⁴−x))′ = (4x³−1)·3^(x⁴−x)·ln(3)"],
            ["exp′ = exp", "(eˣ)′ = eˣ", "(eˣ)′ = eˣ"],
            ["(exp ∘ f)′ = f′·(exp ∘ f)", "(e^f(x))′ = f′(x)·e^f(x)", "(e^sin x)′ = cos(x)·e^sin x"],
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
                "$e^{\\ldots}$ est définie partout, mais la racine carrée exige $x-2 \\ge 0$. " +
                'Domaine de $h$ : $[2\\,;\\,+\\infty[$.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Astuce méthodologique',
          items: [
            "Pour dériver $base^{g(x)}$ : toujours le même motif, quelle que soit la base — " +
              "multiplier par $g'(x)$ et par $\\ln(base)$.",
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
                "x \\mapsto a^x$. Rien n'est supposé connu sur la dérivée de $f$ : on repart de " +
                "la **définition** du nombre dérivé, comme limite du taux d'accroissement.",
            },
            {
              kind: 'para',
              text:
                "**Étape 1.** On écrit le taux d'accroissement de $f$ entre $x$ et $x+h$, " +
                'directement à partir de la définition :',
            },
            {
              kind: 'para',
              text: "$\\dfrac{f(x+h) - f(x)}{h} = \\dfrac{a^{x+h} - a^x}{h}$",
            },
            {
              kind: 'para',
              text:
                "**Étape 2.** Le numérateur se factorise. Par la règle **(1)**, " +
                "$a^{x+h} = a^x \\cdot a^h$ : les deux termes du numérateur ont donc $a^x$ en " +
                'facteur commun.',
            },
            {
              kind: 'para',
              text:
                "$= \\dfrac{a^x \\cdot a^h - a^x}{h} = \\dfrac{a^x \\left(a^h - 1\\right)}{h}$",
            },
            {
              kind: 'para',
              text:
                "**Étape 3.** On réécrit le $1$ sous la forme $a^0$ — c'est la même valeur, mais " +
                "cette écriture fait apparaître un taux d'accroissement de $f$ **entre 0 et** " +
                '$0+h$ :',
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
                "**pas** de $h$ : c'est une constante vis-à-vis de cette limite, elle sort donc " +
                'devant.',
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
                "**Étape 5.** La limite qui reste est, mot pour mot, la définition du nombre " +
                "dérivé de $f$ **en 0**. Elle vaut donc $f'(0)$ — à condition qu'elle existe, " +
                "c'est-à-dire que $f$ soit dérivable en 0. C'est précisément ce qu'affirme le " +
                'théorème admis ci-dessous.',
            },
            { kind: 'para', text: "$f'(x) = f'(0) \\cdot a^x \\qquad \\blacksquare$" },
            {
              kind: 'para',
              text:
                "Conclusion remarquable : **la dérivée d'une exponentielle est un multiple " +
                "d'elle-même**, et le coefficient de proportionnalité — le même pour tout $x$ — " +
                "est simplement la pente de la courbe au point $(0\\,;1)$. Il ne dépend que de " +
                'la base $a$. Reste à lui donner un nom : ce sera $\\ln(a)$.',
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Théorème admis — dérivabilité en 0',
          items: [
            "Pour tout $a \\in \\mathbb{R}_0^+$, la fonction $f : \\mathbb{R} \\to \\mathbb{R} : " +
              "x \\mapsto a^x$ est dérivable en 0. Ce théorème est admis sans démonstration ; " +
              "c'est lui qui rend légitime l'étape 5 ci-dessus.",
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — logarithme népérien',
          items: [
            "On appelle **logarithme népérien** de $a$, noté $\\ln(a)$, le nombre dérivé en 0 " +
              "de la fonction $x \\mapsto a^x$. Autrement dit, $\\ln(a)$ n'est **rien d'autre " +
              "qu'un nom donné au nombre** $f'(0)$ apparu ci-dessus.",
            "En reportant cette définition dans le résultat de la démonstration, " +
              "$f'(x) = f'(0) \\cdot a^x$, on obtient immédiatement la formule annoncée en tête " +
              'de section :',
            "$\\forall x \\in \\mathbb{R} : (a^x)' = \\ln(a) \\cdot a^x$",
            "Le facteur $\\ln(a)$ n'est donc pas une coïncidence ni une constante tombée du " +
              'ciel : il **est** la pente de la courbe en $(0\\,;1)$, par définition même.',
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
              { x: -1.45, y: 4.0, text: 'y=e^x', tone: 'accent', anchor: 'start' },
              { x: -1.45, y: 3.45, text: 'y=2^x', tone: 'good', anchor: 'start' },
              { x: -1.45, y: 2.9, text: 'tangente à e^x : pente 1', tone: 'faint', anchor: 'start' },
              { x: -1.45, y: 2.35, text: 'tangente à 2^x : pente ln(2)≈0,69', tone: 'faint', anchor: 'start' },
            ],
            points: [{ x: 0, y: 1, label: '(0;1)', tone: 'accent', labelPos: 'right' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "Toutes les exponentielles passent par (0;1), mais elles n'y arrivent pas avec la " +
              'même pente. Les deux droites grises sont les tangentes en ce point : la plus ' +
              "pentue est celle de e^x, de pente exactement 1 ; l'autre est celle de 2^x, de " +
              "pente ln(2) ≈ 0,69. C'est cette pente — et rien d'autre — que l'on appelle " +
              'ln(a) ; la base e est celle, et la seule, pour laquelle elle vaut 1.',
          },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — pourquoi exp est sa propre dérivée",
          blocks: [
            {
              kind: 'para',
              text:
                "Le **nombre d'Euler** $e$ est défini par $e = \\displaystyle\\lim_{x \\to " +
                "+\\infty} \\left(1+\\dfrac{1}{x}\\right)^x \\approx 2{,}71828\\ldots$ " +
                "(l'existence de cette limite est admise). La fonction exponentielle de base " +
                "$e$ est appelée **fonction exponentielle népérienne** et se note $\\exp$ " +
                'plutôt que $\\exp_e$.',
            },
            {
              kind: 'para',
              text:
                "On admet également le résultat $\\ln(e) = 1$ : par construction, $e$ est " +
                "exactement la base dont la courbe a une pente de 1 en $(0\\,;1)$.",
            },
            {
              kind: 'para',
              text:
                "Il n'y a alors plus rien à démontrer, seulement une substitution à faire. La " +
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
                "Soit, en notation usuelle, $(e^x)' = e^x$. $\\qquad \\blacksquare$ La seule " +
                "chose qui rend $e$ spéciale est donc que **son** facteur $\\ln$ vaut 1 : toutes " +
                "les autres bases traînent un facteur multiplicatif à chaque dérivation.",
            },
          ],
        },
        {
          kind: 'astuce',
          label: "💡 Retenir les décimales de e",
          text:
            "Moyen mnémotechnique : « Je renonce à calculer la suivante » — le nombre de " +
            'lettres de chaque mot donne 2, 7, 1, 8, 2, 8. La phrase rappelle au passage que ' +
            "2,71828 n'est qu'une valeur approchée par défaut de $e$ (à moins de " +
            '$2 \\cdot 10^{-6}$ près).',
        },
        {
          kind: 'para',
          text:
            "Une conséquence directe de la formule : puisque $a^x > 0$ pour tout $x$, le signe " +
            "de $(a^x)' = \\ln(a) \\cdot a^x$ est exactement celui de $\\ln(a)$. Or " +
            "$\\ln(a) < 0$ si $0 < a < 1$, $\\ln(1) = 0$, et $\\ln(a) > 0$ si $a > 1$. Le calcul " +
            'de dérivée **redémontre** donc, sans aucun graphique, la monotonie observée à la ' +
            'section 1 : décroissante en dessous de 1, croissante au-dessus.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => Math.pow(2, x), tone: 'accent' },
              { fn: (x) => Math.LN2 * Math.pow(2, x), tone: 'good' },
            ],
            xMin: -2.2,
            xMax: 2.2,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -0.6, max: 5 },
            textLabels: [
              { x: -2.15, y: 4.6, text: 'y=2^x', tone: 'accent', anchor: 'start' },
              { x: -2.15, y: 3.95, text: 'y=ln(2)·2^x', tone: 'good', anchor: 'start' },
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
            compact: true,
            curves: [
              { fn: (x) => Math.pow(0.5, x), tone: 'accent' },
              { fn: (x) => Math.log(0.5) * Math.pow(0.5, x), tone: 'good' },
            ],
            xMin: -2.2,
            xMax: 2.2,
            xTicks: [-2, -1, 1, 2],
            fixedYRange: { min: -3.5, max: 5 },
            textLabels: [
              { x: 2.15, y: 4.6, text: 'y=0,5^x', tone: 'accent', anchor: 'end' },
              { x: 2.15, y: 3.9, text: 'y=ln(0,5)·0,5^x', tone: 'good', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Base a=0,5 < 1 : ln(0,5) ≈ −0,69 est négatif, donc la dérivée (en vert) est ' +
              "entièrement sous l'axe — la fonction décroît partout.",
          },
        },
        {
          kind: 'entrainement',
          title: 'Domaine et dérivée',
          generatorId: '6gen7',
          description: [
            "Détermine le domaine d'une fonction exponentielle composée, puis calcule sa " +
              'dérivée en appliquant la règle de la chaîne et le facteur ln(base).',
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
      kicker: 'la dérivée d\'une fonction paire est impaire, et réciproquement',
      blocks: [
        {
          kind: 'para',
          text:
            "Le lien entre une fonction et sa dérivée se lit directement sur un graphique : le " +
            "signe de $f'$ donne le sens de variation de $f$, et un changement de signe de $f'$ " +
            'repère un extremum de $f$.',
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: ["La dérivée d'une fonction **paire** est toujours **impaire**, et réciproquement."],
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
            compact: true,
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
          kind: 'piege',
          text:
            "Oublier le signe négatif lors de la dérivation de $e^{-kx}$ transforme par erreur " +
            'une fonction impaire en fonction paire — toujours appliquer la règle de la chaîne, ' +
            'y compris sur le signe.',
        },
        {
          kind: 'entrainement',
          title: 'Graphique de la dérivée',
          generatorId: '6gen8',
          description: [
            "Associe une fonction exponentielle et sa dérivée à partir de leur graphique, en " +
              'utilisant la parité, le signe et les extremums.',
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
        {
          kind: 'methode',
          label: 'Méthode 1 — même base',
          items: [
            "Une exponentielle de base fixée est injective : $base^u = base^v$ équivaut à " +
              '$u = v$. Aucun logarithme n\'est nécessaire.',
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
                "Il s'agit d'une **équivalence** : les deux implications se démontrent " +
                'séparément.',
            },
            {
              kind: 'para',
              text:
                "**1) Sens** $\\implies$ — de $a^x = a^y$ vers $x = y$. C'est le sens utile en " +
                'pratique, celui qui autorise à « supprimer les deux bases » dans une équation.',
            },
            {
              kind: 'para',
              text:
                "La section 1 a établi que $\\exp_a$ est **strictement monotone** : strictement " +
                "croissante si $a > 1$, strictement décroissante si $0 < a < 1$ — et l'exclusion " +
                'de $a = 1$ garantit que ce sont bien les deux seuls cas possibles.',
            },
            {
              kind: 'para',
              text:
                "Or une fonction strictement monotone ne prend **jamais deux fois la même " +
                "valeur**. En effet, prenons deux réels **distincts** $x$ et $y$ ; quitte à " +
                'échanger leurs noms, on peut supposer $x < y$. Alors :',
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
                "Dans les deux cas $a^x \\neq a^y$. Deux réels distincts ne peuvent donc pas " +
                "avoir la même image par $\\exp_a$ : c'est exactement dire que $\\exp_a$ est " +
                '**injective**.',
            },
            {
              kind: 'para',
              text:
                "On vient de démontrer la **contraposée** de ce qui est demandé : " +
                "$x \\neq y \\implies a^x \\neq a^y$. Une implication et sa contraposée étant " +
                'équivalentes, on a bien $a^x = a^y \\implies x = y$.',
            },
            {
              kind: 'para',
              text:
                "**2) Sens** $\\impliedby$ — de $x = y$ vers $a^x = a^y$. Évident : $\\exp_a$ " +
                "est une **fonction**, elle associe une seule image à chaque antécédent ; deux " +
                'écritures du même nombre ont donc la même image. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "La condition $a \\neq 1$ est **indispensable**, et uniquement pour le sens " +
                "$\\implies$. Avec $a = 1$ en effet, $1^x = 1^y = 1$ pour tous $x$ et $y$ : " +
                "l'égalité des images est toujours vraie et n'apprend absolument rien sur les " +
                'exposants.',
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
              { x: 2.3, y: 9.6, text: 'y=2^x', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              "Lecture graphique de l'injectivité. Résoudre 2^x = 8, c'est chercher les " +
              'abscisses où la courbe rencontre la droite horizontale y = 8. Comme 2^x est ' +
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
            "Quand l'équation fait apparaître $base^x$ et son carré, poser $t = base^x$ ramène " +
              "l'équation à un second degré en $t$.",
          ],
        },
        {
          kind: 'exemple',
          formula: '$e^{2x} - 3e^x + 2 = 0$',
          steps: [
            { tag: 'substitution t = eˣ (donc t > 0)', text: '$t^2-3t+2=0 \\implies (t-1)(t-2)=0 \\implies t=1$ ou $t=2$' },
          ],
          result: { tag: 'les deux racines sont strictement positives, donc valides', text: '$x=0$ ou $x=\\ln(2)$' },
        },
        {
          kind: 'piege',
          text:
            'Une racine $t$ négative ou nulle doit toujours être **rejetée** : $base^x$ est ' +
            'strictement positif, donc $t \\le 0$ ne correspond à aucun $x$ réel.',
        },
        {
          kind: 'astuce',
          label: "💡 Reconnaître l'impossible",
          text: "$5 \\cdot 2^x + 3 = 0$ n'a aucune solution : une somme de quantités strictement positives ne peut jamais valoir 0.",
        },
        {
          kind: 'entrainement',
          title: 'Équations exponentielles',
          generatorId: '6gen9',
          description: [
            'Résous une équation exponentielle par identification de bases ou par substitution, ' +
              'en rejetant les racines invalides le cas échéant.',
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
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            "Si $base > 1$, l'inégalité sur les exposants garde le même sens. Si $0 < base < 1$, " +
            'il faut **inverser** le comparateur — exactement comme pour toute fonction ' +
            'strictement décroissante.',
        },
        {
          kind: 'featureTable',
          headers: ['Base', 'baseᵘ ≥ baseᵛ équivaut à'],
          rows: [
            ['a > 1', 'u ≥ v'],
            ['0 < a < 1', 'u ≤ v (inversé)'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'base > 1',
          formula: '$2^{x-1} \\ge 8 = 2^3$',
          steps: [],
          result: { tag: 'résultat', text: '$x-1 \\ge 3 \\implies x \\ge 4$' },
        },
        {
          kind: 'exemple',
          badge: 'base entre 0 et 1',
          formula: '$(1/2)^x < (1/2)^{-3} = 8$',
          steps: [],
          result: { tag: 'base 1/2 < 1 : on inverse le comparateur', text: '$x > -3$' },
        },
        {
          kind: 'definition',
          label: "Principes d'équivalence — inégalité de deux images par une exponentielle",
          items: [
            "Les huit cas se rangent en deux colonnes selon la position de $a$ par rapport à 1. " +
              'Pour tous $x, y \\in \\mathbb{R}$ :',
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
                "s'en déduisent ensuite sans nouveau raisonnement. Les deux sens de " +
                "l'équivalence se traitent séparément, et par des méthodes différentes.",
            },
            {
              kind: 'para',
              text:
                "**(a), sens** $\\impliedby$ — de $x > y$ vers $a^x < a^y$. Immédiat : puisque " +
                "$0 < a < 1$, la fonction $\\exp_a$ est strictement **décroissante** " +
                '(section 1). Appliquée aux deux membres de $x > y$, elle en **inverse** le ' +
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
                'démontre le cas **(e)**, $a^x < a^y \\iff x < y$.',
            },
            {
              kind: 'para',
              text:
                "**(e), sens** $\\impliedby$ — de $x < y$ vers $a^x < a^y$. Immédiat : puisque " +
                "$a > 1$, la fonction $\\exp_a$ est strictement **croissante** (section 1). " +
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
                "$e \\approx 2{,}718 > 1$ : une inéquation en $e^{\\ldots}$ conserve donc " +
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
              { x: -3.3, y: 5.4, text: '0,5^x', tone: 'bad', anchor: 'start' },
              { x: -3.3, y: 4.4, text: 'y=4', tone: 'faint', anchor: 'start' },
              { x: 3.3, y: 5.4, text: '2^x', tone: 'accent', anchor: 'end' },
              { x: 2.05, y: 3.3, text: 'x=2', tone: 'accent', anchor: 'start' },
              { x: -2.05, y: 3.3, text: 'x=−2', tone: 'bad', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Une même comparaison à la constante 4, dans deux bases. 2^x (base 2 > 1) est ' +
              'croissante : elle dépasse 4 à DROITE de son point de rencontre, donc ' +
              '2^x ≥ 4 ⟺ x ≥ 2. 0,5^x (base 0,5 < 1) est décroissante : elle dépasse 4 à ' +
              'GAUCHE du sien, donc 0,5^x ≥ 4 ⟺ x ≤ −2. Le comparateur écrit est le même — ' +
              "l'ensemble-solution part du côté opposé.",
          },
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
              'négatif : certaines inéquations n\'ont donc **aucune solution** (∅), sans aucun calcul.',
            "À l'inverse, une inégalité toujours vraie par construction (discriminant négatif, " +
              'quantité toujours positive…) peut avoir **ℝ tout entier** comme ensemble-solution.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Inéquations exponentielles',
          generatorId: '6gen10',
          description: [
            "Résous une inéquation exponentielle en tenant compte du sens de la base pour " +
              'inverser (ou non) le comparateur.',
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
        {
          kind: 'para',
          text:
            "Étudier complètement une fonction, c'est déterminer dans l'ordre : domaine, " +
            'limites, asymptotes, sens de variation, et concavité.',
        },
        {
          kind: 'definition',
          label: 'Concavité',
          items: [
            "Le signe de $f''$ donne la concavité : $f'' > 0 \\implies$ convexe ; $f'' < 0 " +
              "\\implies$ concave. Un changement de signe de $f''$ repère un **point " +
              "d'inflexion** — à ne pas confondre avec un extremum, qui correspond à un " +
              "changement de signe de $f'$.",
          ],
        },
        { kind: 'subheading', text: 'Exemple résolu — étude complète' },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$f(x) = x \\cdot e^x$' },
            {
              kind: 'para',
              text:
                "**Domaine :** ℝ. **Dérivée :** $f'(x) = e^x(1+x)$ — signe de $(1+x)$, puisque " +
                "$e^x > 0$ toujours. $f' < 0$ avant $x=-1$, $> 0$ après : **minimum** en $x=-1$.",
            },
            {
              kind: 'para',
              text:
                "**Dérivée seconde :** $f''(x) = e^x(2+x)$ — change de signe en $x=-2$ : **point " +
                "d'inflexion** en $x=-2$, avant le minimum.",
            },
            {
              kind: 'para',
              text:
                "**Limites :** en $-\\infty$, forme $\\infty \\cdot 0$ où $e^x$ l'emporte : " +
                "$f(x) \\to 0$ (asymptote horizontale $y=0$) ; en $+\\infty$, $f(x) \\to +\\infty$.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            caption: "f(x)=x·eˣ : minimum (point plein) en x=−1, inflexion (point creux) en x=−2, asymptote y=0 en −∞",
          },
        },
        {
          kind: 'piege',
          text:
            "Une fonction peut très bien avoir ses deux limites (en $-\\infty$ et en $+\\infty$) " +
            'égales à $+\\infty$ — ce n\'est pas parce qu\'une limite « ressemble » à celle de ' +
            "l'autre côté qu'il n'y a rien à conclure : chaque côté se traite indépendamment.",
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
                "**3) Dérivée première.** $f$ est de la forme $e^{u}$ avec $u(x) = -x^2$, donc " +
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
                "**4) Dérivée seconde.** Cette fois $f'$ est un **produit** de deux fonctions : " +
                "$f' = p \\cdot q$ avec $p(x) = -2x$ et $q(x) = e^{-x^2}$. On applique la règle " +
                "du produit $(pq)' = p'q + pq'$, en réutilisant pour $q'$ le calcul de " +
                "l'étape 3 : $p'(x) = -2$ et $q'(x) = -2x \\cdot e^{-x^2}$.",
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
            {
              kind: 'para',
              text:
                "**5) Limites.** En $\\pm\\infty$, $-x^2 \\to -\\infty$, donc " +
                "$e^{-x^2} \\to 0$ : la droite $y = 0$ est asymptote horizontale **des deux " +
                'côtés**. La courbe ne coupe jamais cette asymptote, puisque $f$ ne ' +
                "s'annule jamais.",
            },
          ],
        },
        {
          kind: 'signTable',
          caption: "Tableau de variations de f(x)=e^(−x²) — variation et concavité réunies",
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
            compact: true,
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
              "f(x)=e^(−x²) : maximum en 0 (point plein), deux points d'inflexion (points " +
              'creux) — la fameuse « courbe en cloche »',
          },
        },
        {
          kind: 'entrainement',
          title: 'Étudier une fonction exponentielle',
          generatorId: '6gen11',
          description: [
            'Mène une étude complète (domaine, limites, asymptotes, variation, concavité) sur ' +
              'une fonction exponentielle composée.',
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
        {
          kind: 'para',
          text:
            "Croissance d'une population, désintégration radioactive, propagation d'une " +
            'épidémie, intérêts composés : tous ces phénomènes partagent le même modèle ' +
            'mathématique, seul le contexte change.',
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
        { kind: 'subheading', text: 'Reconnaître un accroissement de type exponentiel' },
        {
          kind: 'exempleLibre',
          label: "Démonstration — le rapport ne dépend que de l'écart",
          blocks: [
            {
              kind: 'para',
              text:
                "Soient $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$ et $r, s \\in \\mathbb{R}$ " +
                "deux instants. On calcule le rapport des images de $r$ et $s$ par $\\exp_a$, " +
                'en une seule ligne :',
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
                "règle des puissances **(2)**, $\\dfrac{a^{r}}{a^{s}} = a^{r-s}$, de la " +
                "section 1. Le résultat ne fait plus intervenir $r$ et $s$ que par leur " +
                "**différence** $s-r$ : le rapport est donc constant dès que l'écart entre les " +
                'deux instants est constant.',
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
                "**simplifie**, et le rapport obtenu est exactement le même que pour " +
                "$\\exp_a$ toute seule. Autrement dit, la valeur initiale d'une grandeur ne " +
                "change rien à son taux de croissance — deux populations de tailles très " +
                'différentes peuvent croître au même rythme. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                "**La réciproque est vraie**, et elle est admise ici : une fonction définie sur " +
                "$\\mathbb{R}$ dont le rapport $f(s)/f(r)$ ne dépend que de la différence " +
                "$s-r$ est nécessairement une fonction exponentielle, ou un multiple de " +
                "fonction exponentielle (ou une fonction constante, si ce rapport vaut " +
                "toujours 1). C'est elle qui autorise, dans les problèmes, à **conclure** à un " +
                "modèle exponentiel à partir d'un simple tableau de mesures.",
            },
          ],
        },
        {
          kind: 'astuce',
          label: '💡 En pratique, dans un tableau de données',
          text:
            "Face à un tableau de valeurs expérimentales, on choisit des observations faites à " +
            "**intervalles de temps égaux** (la variable augmente à pas constant), puis on " +
            "calcule le rapport de deux valeurs **consécutives**. Si ce rapport est à peu près " +
            "constant, la situation se modélise par $f(t) = b \\cdot a^{t}$, où $a$ est une " +
            "valeur approchée de ce rapport et $b$ la valeur initiale (celle lue en $t=0$). " +
            "Attention : c'est bien le **rapport** qu'il faut calculer, jamais la différence — " +
            'une différence constante signalerait au contraire un modèle linéaire.',
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
              { x: 0.15, y: 330, text: 'Q(t)=100·1,5^t', tone: 'accent', anchor: 'start' },
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
              'Les DIFFÉRENCES (+50, +75, +112,5) ne sont pas constantes, mais les RAPPORTS le ' +
              'sont : 150/100 = 225/150 = 337,5/225 = 1,5. Le modèle est donc exponentiel, de ' +
              "taux a = 1,5 et de valeur initiale b = 100 — d'où Q(t) = 100·1,5^t, la courbe " +
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
        { kind: 'subheading', text: 'Modèle de saturation' },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$p(t) = 1 - e^{-0{,}1t}$' },
            {
              kind: 'para',
              text:
                'Quand $t$ augmente, $e^{-0,1t}$ tend vers 0, donc $p(t)$ tend vers 1 (100 %) ' +
                "sans jamais l'atteindre. Après 10 unités de temps : $p(10) = 1-e^{-1} \\approx " +
                '0{,}632$, soit environ 63 %.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: (t) => 1 - Math.exp(-0.15 * t), tone: 'accent', xMin: 0, xMax: 30 }],
            xMin: -1,
            xMax: 30,
            xTicks: [10, 20, 30],
            fixedYRange: { min: -0.08, max: 1.2 },
            horizontalAsymptotes: [{ y: 1, label: 'asymptote y=1' }],
            points: [
              { x: 0, y: 0, label: '(0;0)', tone: 'accent' },
              { x: 10, y: 1 - Math.exp(-1.5), label: '(10;0,78)', tone: 'accent' },
              { x: 20, y: 1 - Math.exp(-3), label: '(20;0,95)', tone: 'accent' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'y',
            caption: "Modèle de saturation : approche de l'asymptote y=1 sans jamais l'atteindre",
          },
        },
        {
          kind: 'astuce',
          label: '💡 Trouver un instant précis',
          text:
            "Pour répondre à « à partir de quel instant $t$ la quantité dépasse-t-elle un " +
            'seuil donné ? », on isole le terme exponentiel puis on utilise le logarithme ' +
            'népérien à la calculatrice — la seule situation du chapitre où ln intervient en pratique.',
        },
        {
          kind: 'entrainement',
          title: "Problèmes d'exponentielles",
          generatorId: '6gen12',
          description: [
            "Modélise une situation de croissance, décroissance ou saturation exponentielle à " +
              "partir d'un contexte narratif, et réponds à une question sur un instant précis.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 12. Problèmes d\'exponentielles »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Base', 'lim en −∞', 'lim en +∞', 'Dérivée'],
      rows: [
        ['a > 1', '0', '+∞', 'ln(a)·aˣ'],
        ['0 < a < 1', '+∞', '0', 'ln(a)·aˣ'],
        ['a = e', '0', '+∞', 'eˣ (dérivée = fonction)'],
      ],
    },
    forward:
      "À retenir : l'exponentielle domine toujours tout polynôme en +∞ ; côté " +
      "équations/inéquations, on raisonne par identification de bases ou par substitution — " +
      'jamais par logarithme à ce stade.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai/faux : réviser tout le chapitre',
      generatorId: '6gen65',
      description: [
        'Choisis un thème et teste-toi sur tout le chapitre — affirmations pré-écrites, une ' +
          'seule tentative par question, justification toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 65. Quiz vrai/faux — Fonctions exponentielles »',
    },
  },
}
