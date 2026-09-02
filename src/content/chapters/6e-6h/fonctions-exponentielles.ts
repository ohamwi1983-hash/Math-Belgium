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
          ],
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
            "$a^r \\cdot a^s = a^{r+s} \\qquad \\dfrac{a^r}{a^s} = a^{r-s} \\qquad (ab)^r = a^r b^r \\qquad (a^r)^s = a^{rs}$",
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
          label: 'Démonstration',
          blocks: [
            { kind: 'para', text: "Pour $f(x) = a^x$, le taux d'accroissement se factorise :" },
            {
              kind: 'para',
              text:
                "$\\dfrac{f(x+h) - f(x)}{h} = \\dfrac{a^{x+h} - a^x}{h} = a^x \\cdot \\dfrac{a^h - a^0}{h}$",
            },
            {
              kind: 'para',
              text:
                "$a^x$ ne dépend pas de $h$ : il sort de la limite quand $h \\to 0$ :",
            },
            {
              kind: 'para',
              text:
                "$\\displaystyle\\lim_{h \\to 0} \\dfrac{f(x+h)-f(x)}{h} = a^x \\cdot \\displaystyle\\lim_{h \\to 0} \\dfrac{a^h - a^0}{h} = a^x \\cdot f'(0)$",
            },
            {
              kind: 'para',
              text:
                "Donc $f'(x) = f'(0) \\cdot a^x$ — **la dérivée est un multiple de la fonction " +
                "elle-même**, à condition qu'elle soit dérivable en 0 (théorème admis).",
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — logarithme népérien',
          items: [
            "On appelle **logarithme népérien** de $a$, noté $\\ln(a)$, le nombre dérivé en 0 " +
              "de $a^x$ — exactement le facteur qui apparaît ci-dessus. Ainsi $(a^x)' = \\ln(a) " +
              "\\cdot a^x$ n'est pas une coïncidence : c'est la **définition même** de ln.",
          ],
        },
        {
          kind: 'astuce',
          label: "💡 Le nombre d'Euler",
          text:
            "Le nombre $e$ se définit par $e = \\displaystyle\\lim_{x \\to +\\infty} (1+1/x)^x \\approx " +
            "2{,}71828\\ldots$ — et c'est justement l'unique base pour laquelle $\\ln(e)=1$, ce " +
            "qui explique pourquoi $(e^x)' = e^x$ sans aucun facteur. Moyen mnémotechnique pour " +
            'les décimales : « Je renonce à calculer la suivante » — le nombre de lettres de ' +
            'chaque mot donne 2, 7, 1, 8, 2, 8.',
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
          label: "Principe d'équivalence",
          items: [
            "$\\forall a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}, \\forall x,y \\in \\mathbb{R} : " +
              '\\quad a^x = a^y \\iff x = y$',
            "Ce principe découle de la stricte monotonie de $\\exp_a$ (croissante ou " +
              "décroissante, jamais horizontale) : une fonction strictement monotone ne prend " +
              'jamais deux fois la même valeur.',
          ],
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
          label: 'Table complète des 4 comparateurs',
          items: ["Les quatre cas possibles, base supérieure ou inférieure à 1 :"],
        },
        {
          kind: 'featureTable',
          headers: ['', '0 < a < 1', 'a > 1'],
          rows: [
            ['aˣ < aʸ', 'x > y', 'x < y'],
            ['aˣ ≤ aʸ', 'x ≥ y', 'x ≤ y'],
            ['aˣ > aʸ', 'x < y', 'x > y'],
            ['aˣ ≥ aʸ', 'x ≤ y', 'x ≥ y'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'base entre 0 et 1, exposant du second degré',
          formula: '$0{,}315^{x^2} < 0{,}315^{2x+3}$',
          steps: [
            { tag: 'base < 1 : on inverse', text: '$x^2 > 2x+3 \\implies x^2-2x-3>0$' },
            { tag: 'racines', text: '$3$ et $-1$' },
          ],
          result: { tag: 'résultat', text: '$S = ]-\\infty\\,;\\,-1[ \\cup ]3\\,;\\,+\\infty[$' },
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
                "**Domaine :** ℝ. **Signe :** toujours strictement positive. **Dérivée :** " +
                "$f'(x) = -2x \\cdot e^{-x^2}$ — signe opposé à celui de $x$ : **maximum** en " +
                "$x=0$ ($f(0)=1$).",
            },
            {
              kind: 'para',
              text:
                "**Dérivée seconde :** $f''(x) = (4x^2-2) \\cdot e^{-x^2}$ — s'annule en " +
                "$x = \\pm\\sqrt{2}/2$ : **deux points d'inflexion**, symétriques par rapport à " +
                "l'axe $y$ (la fonction est paire).",
            },
            {
              kind: 'para',
              text:
                "**Limites :** $\\pm\\infty$ des deux côtés donnent $f(x) \\to 0$ (forme " +
                "$\\infty \\cdot 0$, l'exponentielle l'emporte) : asymptote horizontale $y=0$ " +
                'des deux côtés.',
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
        {
          kind: 'astuce',
          label: '💡 Reconnaître un modèle exponentiel dans un tableau de données',
          text:
            "Le rapport entre deux valeurs d'une fonction exponentielle ne dépend que de " +
            "l'écart entre les instants, jamais des instants eux-mêmes : $Q(s)/Q(r) = " +
            "a^{s-r}$. En pratique, si le rapport entre deux mesures consécutives (prises à " +
            "intervalles de temps égaux) reste à peu près constant, la situation peut être " +
            "modélisée par une exponentielle — ce rapport constant est alors une valeur " +
            'approchée du taux $a$.',
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
