import type { ChapterContent } from '../../types'

const E = Math.E

export const fonctionsLogarithmes: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 3,
  title: 'Fonctions logarithmes',
  slug: 'fonctions-logarithmes',
  lede:
    "Le logarithme népérien est la fonction **réciproque** de l'exponentielle : là où $e^x$ " +
    "transforme une somme en produit, $\\ln$ transforme un produit en somme. Il permet de " +
    "« défaire » une exponentielle — et rend enfin accessibles les équations, comparaisons et " +
    "modèles où l'inconnue se cache dans un exposant.",

  sections: [
    {
      id: 'proprietes',
      number: 1,
      title: 'Propriétés du logarithme',
      kicker: 'réciproque de exp_a, propriétés algébriques, changement de base',
      blocks: [
        {
          kind: 'para',
          text:
            'Au chapitre 2, $\\exp_a$ ($a>0$, $a \\neq 1$) était strictement croissante si ' +
            '$a>1$ et strictement décroissante si $0<a<1$ — dans les deux cas, strictement ' +
            'monotone, donc **injective** : elle admet une fonction réciproque, appelée ' +
            '**logarithme de base a** et notée $\\log_a$, définie pour **toute** base $a>0$, $a \\neq 1$.',
        },
        {
          kind: 'definition',
          label: 'Définition — logarithme de base a',
          items: [
            'Pour $a>0$, $a \\neq 1$, $\\log_a$ est l\'unique fonction définie sur ' +
              '$\\mathbb{R}_0^+ = ]0;+\\infty[$ telle que, pour tout $x>0$ et tout $y \\in ' +
              '\\mathbb{R}$ : $\\log_a(x) = y \\iff a^y = x$.',
            'Conséquence directe : $\\log_a(a^x) = x$ pour tout $x$ réel, et ' +
              '$a^{\\log_a(x)} = x$ pour tout $x>0$ — $\\log_a$ et $\\exp_a$ s\'annulent mutuellement.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: (x) => Math.log(x) / Math.log(2), tone: 'accent', xMin: 0.03, xMax: 6 }],
            xMin: -0.6,
            xMax: 6,
            xTicks: [1, 2],
            fixedYRange: { min: -3.3, max: 3.3 },
            verticalAsymptotes: [{ x: 0, label: 'asymptote x=0' }],
            points: [
              { x: 1, y: 0, label: '(1;0)', tone: 'accent', labelPos: 'above' },
              { x: 2, y: 1, label: '(2;1)', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'a > 1 (ici a=2) : logₐ croissante',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: (x) => Math.log(x) / Math.log(0.5), tone: 'accent', xMin: 0.03, xMax: 6 }],
            xMin: -0.6,
            xMax: 6,
            xTicks: [0.5, 1],
            fixedYRange: { min: -3.3, max: 3.3 },
            verticalAsymptotes: [{ x: 0, label: 'asymptote x=0' }],
            points: [
              { x: 1, y: 0, label: '(1;0)', tone: 'accent' },
              { x: 0.5, y: 1, label: '(0,5;1)', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: '0 < a < 1 (ici a=0,5) : logₐ décroissante, comportement inversé',
          },
        },
        {
          kind: 'definition',
          label: 'Caractéristiques graphiques',
          items: [
            'Pour **toute** base $a>0$, $a \\neq 1$ : $\\text{dom}\\ \\log_a = \\mathbb{R}_0^+$, ' +
              '$\\text{im}\\ \\log_a = \\mathbb{R}$. Point particulier commun à **toutes** les ' +
              'fonctions logarithmes, quelle que soit leur base : $(1;0)$, puisque $\\log_a(1)=0$. ' +
              'L\'axe $Oy$ est une asymptote verticale ($x=0$) — il n\'y a **aucune autre asymptote**.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', '0 < a < 1', 'a > 1'],
          rows: [
            ['Monotonie', 'strictement décroissante', 'strictement croissante'],
            ['Concavité', 'tournée vers le haut (convexe)', 'tournée vers le bas (concave)'],
            ['lim en x→0⁺', '+∞', '−∞'],
            ['lim en x→+∞', '−∞', '+∞'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'faint' },
              { fn: (x) => Math.pow(2, x), tone: 'good', xMax: 1.7 },
              { fn: (x) => Math.log(x) / Math.log(2), tone: 'accent', xMin: 0.04 },
            ],
            xMin: -2.5,
            xMax: 3.2,
            xTicks: [],
            fixedYRange: { min: -2.5, max: 3.2 },
            points: [
              { x: 0.8, y: Math.pow(2, 0.8), label: '(r;s)', tone: 'bad' },
              { x: Math.pow(2, 0.8), y: 0.8, label: '(s;r)', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'exp₂ et log₂ symétriques par rapport à la droite y=x (ici a=2) : si (r;s) ' +
              'appartient au graphique de exp₂, alors (s;r) appartient à celui de log₂ — vrai ' +
              'pour toute base a>0, a≠1',
          },
        },
        {
          kind: 'methode',
          label: 'Propriétés algébriques',
          items: [
            'Pour toute base $a>0$, $a \\neq 1$, tous $x,y>0$ et tout $r \\in \\mathbb{R}$ :',
            '$\\log_a(xy) = \\log_a(x) + \\log_a(y) \\qquad \\log_a(x/y) = \\log_a(x) - \\log_a(y) ' +
              '\\qquad \\log_a(x^r) = r \\cdot \\log_a(x)$',
            'Avec les cas particuliers $\\log_a(1)=0$ et $\\log_a(a)=1$, valables pour toute ' +
              'base $a>0$, $a \\neq 1$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — logarithme d\'un produit',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\log_a(xy) = \\log_a(a^{\\log_a(x)} \\cdot a^{\\log_a(y)})$ — car $a^{\\log_a(t)}=t$',
            },
            {
              kind: 'para',
              text:
                '$= \\log_a(a^{\\log_a(x) + \\log_a(y)})$ — propriété des puissances, ' +
                '$a^p \\cdot a^q = a^{p+q}$ (chapitre 2)',
            },
            { kind: 'para', text: '$= \\log_a(x) + \\log_a(y)$ — car $\\log_a(a^t)=t$' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — logarithme d\'une puissance',
          blocks: [
            {
              kind: 'para',
              text: '$\\log_a(x^r) = \\log_a((a^{\\log_a(x)})^r)$ — car $a^{\\log_a(x)}=x$',
            },
            {
              kind: 'para',
              text:
                '$= \\log_a(a^{r \\cdot \\log_a(x)})$ — propriété des puissances, ' +
                '$(a^p)^r=a^{rp}$ (chapitre 2)',
            },
            { kind: 'para', text: '$= r \\cdot \\log_a(x)$ — car $\\log_a(a^t)=t$' },
            {
              kind: 'para',
              text:
                'Le logarithme d\'un quotient $\\log_a(x/y) = \\log_a(x) - \\log_a(y)$ se ' +
                'démontre exactement de la même façon, en utilisant $a^p/a^q = a^{p-q}$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\log_2(8) - \\log_2(2) = \\log_2(8/2) = \\log_2(4) = \\log_2(2^2) = ' +
                '2 \\cdot \\log_2(2) = 2$ (car $\\log_2(2)=1$).',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            '$\\log_a(x+y)$ **n\'est pas** $\\log_a(x) + \\log_a(y)$, quelle que soit la base ' +
            '$a$ — la propriété d\'addition concerne un **produit** $xy$, jamais une somme.',
        },
        {
          kind: 'definition',
          label: 'Changement de base',
          items: [
            'Pour deux bases $a,b>0$, $a \\neq 1$, $b \\neq 1$, tout logarithme de base $a$ se ' +
              'ramène toujours à n\'importe quelle autre base $b$ : $\\log_a(x) = ' +
              '\\dfrac{\\log_b(x)}{\\log_b(a)}$ pour tout $x>0$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — changement de base',
          blocks: [
            { kind: 'para', text: 'Soit $y = \\log_a(x)$. On écrit successivement les égalités équivalentes :' },
            { kind: 'para', text: '$a^y = x$ — définition de $\\log_a$, réciproque de $\\exp_a$' },
            {
              kind: 'para',
              text: '$\\log_b(a^y) = \\log_b(x)$ — en appliquant $\\log_b$ aux deux membres (fonction bien définie)',
            },
            { kind: 'para', text: '$y \\cdot \\log_b(a) = \\log_b(x)$ — car $\\log_b(a^y)=y \\cdot \\log_b(a)$' },
            { kind: 'para', text: '$y = \\dfrac{\\log_b(x)}{\\log_b(a)}$ — division par $\\log_b(a) \\neq 0$ (car $a \\neq 1$)' },
            {
              kind: 'para',
              text:
                'Conséquence : toutes les fonctions logarithmes, quelle que soit leur base, ' +
                'sont des **multiples** les unes des autres.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Le logarithme népérien : le cas particulier a = e',
          text:
            'Le nombre $e$ (introduit au chapitre 2 comme l\'unique base pour laquelle ' +
            '$\\exp_a\' = \\exp_a$) donne un logarithme particulièrement important, le ' +
            '**logarithme népérien** $\\log_e$, presque toujours noté $\\ln$ plutôt que ' +
            '$\\log_e$. Le changement de base ci-dessus, avec $b=e$, donne alors une écriture ' +
            'de **tout** logarithme uniquement à l\'aide de $\\ln$ : $\\log_a(x) = ' +
            '\\dfrac{\\ln(x)}{\\ln(a)}$. C\'est cette écriture qui rend $\\ln$ si pratique en ' +
            'pratique : une calculatrice n\'a souvent qu\'une touche $\\ln$. Pour obtenir ' +
            '$\\log_2(10)$ par exemple, on calcule $\\ln(10)/\\ln(2) \\approx 3{,}32$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — réécrire une exponentielle avec une base choisie',
          blocks: [
            {
              kind: 'para',
              text:
                'Toute fonction $f(x) = r \\cdot a^{sx+t}$ ($a>0$, $a \\neq 1$) peut s\'écrire ' +
                '$f(x) = C \\cdot b^{kx}$ dans n\'importe quelle autre base $b>0$, $b \\neq 1$, ' +
                'avec $C=r \\cdot a^t$ et $k=s \\cdot \\log_b(a)$.',
            },
            {
              kind: 'para',
              text:
                'En base $e$ : $f(x) = 4 \\cdot 3^{5x+2} = (4 \\cdot 3^2) \\cdot 3^{5x} = ' +
                '36 \\cdot e^{(5\\ln(3))x} \\approx 36 \\cdot e^{5{,}493x}$.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Pour aller plus loin — repère semi-logarithmique',
          text:
            'Un repère **semi-logarithmique** gradue un axe (souvent $Oy$) selon une **échelle ' +
            'logarithmique** : une même distance sépare toujours deux graduations de même ' +
            '*rapport* (entre 1 et 10, autant qu\'entre 10 et 100, ou 100 et 1 000), et non de ' +
            'même différence. La distance entre l\'origine et une valeur $N$ vaut $\\log(N)$ — ' +
            'l\'origine se situe donc en 1, car $\\log(1)=0$. Ce type de repère représente un ' +
            'phénomène exponentiel par une droite, et permet de comparer des taux de croissance ' +
            'très différents sur un même graphique.',
        },
        {
          kind: 'entrainement',
          title: 'Propriétés du logarithme',
          generatorId: '6gen13',
          description: [
            'Applique les propriétés algébriques du logarithme (produit, quotient, puissance, ' +
              'changement de base) pour simplifier des expressions et résoudre des exemples ' +
              'numériques.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 13. Propriétés du logarithme »',
        },
      ],
    },
    {
      id: 'equations',
      number: 2,
      title: 'Résoudre une équation exponentielle ou logarithmique',
      kicker: 'appliquer log_a ou exp_a aux deux membres',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux nouvelles techniques s\'ajoutent à l\'identification de bases vue au ' +
            'chapitre 2 : appliquer $\\log_a$ aux deux membres d\'une équation exponentielle de ' +
            'base $a$, ou appliquer $\\exp_a$ aux deux membres d\'une équation logarithmique de ' +
            'base $a$ — puisque les deux fonctions sont réciproques l\'une de l\'autre, pour ' +
            '**toute** base $a>0$, $a \\neq 1$.',
        },
        {
          kind: 'methode',
          label: 'Méthode 1 — équation exponentielle',
          items: [
            'Pour $a^x = b$ ($a>0$, $a \\neq 1$, $b>0$), on applique $\\log_a$ aux deux membres ' +
              '— ce qui donne directement x, par définition même de $\\log_a$ comme réciproque ' +
              'de $\\exp_a$ : $\\log_a(a^x) = \\log_a(b) \\implies x = \\log_a(b)$.',
            'Si l\'on préfère une valeur décimale approchée, le changement de base ramène ce ' +
              'résultat à $x = \\ln(b)/\\ln(a)$, directement calculable.',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [{ kind: 'para', text: '$3^x = 20 \\implies x = \\log_3(20) = \\dfrac{\\ln(20)}{\\ln(3)} \\approx 2{,}727$' }],
        },
        {
          kind: 'methode',
          label: 'Méthode 2 — équation logarithmique',
          items: [
            'Pour $\\log_a(u) = b$ ($a>0$, $a \\neq 1$), on applique $\\exp_a$ des deux côtés : ' +
              '$u = a^b$. Comme $a^b$ est toujours strictement positif, la condition de domaine ' +
              '$u>0$ est **automatiquement satisfaite** par cette solution.',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$\\ln(2x-1) = 3$' },
            {
              kind: 'para',
              text:
                'Domaine : $2x-1 > 0$. En appliquant exp (base e) : $2x-1 = e^3 \\implies ' +
                'x = \\dfrac{e^3+1}{2} \\approx 10{,}54$. Vérification : $2x-1 = e^3 > 0$ ✓.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'Après avoir résolu par $\\log_a$ ou $\\exp_a$ (quelle que soit la base $a$), il ' +
            'faut **toujours** vérifier que la solution garde chaque argument de logarithme de ' +
            'l\'équation *initiale* strictement positif — une solution trouvée algébriquement ' +
            'peut violer cette condition et doit alors être rejetée.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — condition d\'existence sur un argument du second degré',
          blocks: [
            { kind: 'para', text: '$\\log_3(2w^2-1) = 4$' },
            {
              kind: 'para',
              text:
                'CE : $2w^2-1>0$, c\'est-à-dire $w < -\\sqrt{2}/2$ ou $w > \\sqrt{2}/2$. On ' +
                'procède en écrivant successivement les égalités équivalentes :',
            },
            { kind: 'para', text: '$2w^2-1 = 3^4 = 81 \\implies w^2 = 41 \\implies w = \\pm\\sqrt{41}$' },
            {
              kind: 'para',
              text:
                'Les deux valeurs $w = \\pm\\sqrt{41} \\approx \\pm6{,}40$ vérifient bien la CE ' +
                '(elles dépassent largement $\\sqrt{2}/2 \\approx 0{,}71$ en valeur absolue). ' +
                '$S = \\{-\\sqrt{41}\\,;\\,\\sqrt{41}\\}$.',
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Égalité de deux logarithmes de même base',
          items: ['Pour tout $a>0$, $a \\neq 1$, et tous $x,y>0$ : $\\log_a(x) = \\log_a(y) \\iff x = y$.'],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\log_a(x) = \\log_a(y) \\implies a^{\\log_a(x)} = a^{\\log_a(y)}$ — $\\exp_a$ ' +
                'est une fonction : deux entrées égales ⟹ mêmes sorties',
            },
            { kind: 'para', text: '$\\implies x = y$ — car $a^{\\log_a(x)}=x$' },
            {
              kind: 'para',
              text:
                'Réciproquement, $x=y \\implies \\log_a(x)=\\log_a(y)$ est immédiat (une ' +
                'fonction associe une seule image à chaque antécédent). Cas particulier $a=e$ : ' +
                '$\\ln(x)=\\ln(y) \\iff x=y$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — égalité de deux logarithmes, avec rejet d\'une racine',
          blocks: [
            { kind: 'para', text: '$\\log_3(6w-1) = \\log_3(-4w^2+3)$' },
            {
              kind: 'para',
              text:
                'CE : il faut à la fois $6w-1>0$ (soit $w>1/6$) et $-4w^2+3>0$ (soit ' +
                '$-\\sqrt{3}/2 < w < \\sqrt{3}/2$), donc $1/6 < w < \\sqrt{3}/2$.',
            },
            {
              kind: 'para',
              text:
                'Par le principe ci-dessus : $6w-1 = -4w^2+3 \\implies 4w^2+6w-4=0$. ' +
                '$\\Delta=36+64=100 \\implies w = \\dfrac{-6+10}{8} = \\dfrac{1}{2}$ ou ' +
                '$w = \\dfrac{-6-10}{8} = -2$.',
            },
            {
              kind: 'para',
              text:
                'Seule $w=1/2$ vérifie la CE ($1/6 < 1/2 < \\sqrt{3}/2 \\approx 0{,}87$) ; ' +
                '$w=-2$ doit être **rejetée**. $S = \\{1/2\\}$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — substitution t = log_a(x)',
          blocks: [
            {
              kind: 'para',
              text:
                'Une équation faisant apparaître $\\log_a(x)$ et son carré, pour n\'importe ' +
                'quelle base $a>0$, $a \\neq 1$, se ramène par la substitution $t=\\log_a(x)$ à ' +
                'une équation du second degré en t. Ici, en base e :',
            },
            { kind: 'para', text: '$(\\ln(x))^2 - \\ln(x) - 2 = 0$' },
            {
              kind: 'para',
              text:
                'Avec $t = \\ln(x)$ : $t^2-t-2=0 \\implies (t-2)(t+1)=0 \\implies t=2$ ou $t=-1$.',
            },
            {
              kind: 'para',
              text:
                '$x = e^2$ ou $x = e^{-1}$. Contrairement à la substitution $t=e^x$ du ' +
                'chapitre 2, ici **aucune racine t n\'est à rejeter** : $\\log_a(x)$ peut ' +
                'prendre n\'importe quelle valeur réelle, et $x=a^t$ reste positif quel que ' +
                'soit t et quelle que soit la base a.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Combiner les deux chapitres',
          text:
            '$e^{2x} - 3e^x + 2 = 0$ (vu au chapitre 2, $t=e^x$) donnait $x=0$ ou $x=\\ln(2)$ ' +
            '— la solution non nulle s\'exprime ici naturellement avec $\\ln$, exactement le ' +
            'genre de sortie que ce chapitre permet enfin d\'écrire simplement.',
        },
        {
          kind: 'entrainement',
          title: 'Résoudre une équation exponentielle ou logarithmique',
          generatorId: '6gen14',
          description: [
            'Résous une équation exponentielle ou logarithmique en appliquant log_a ou exp_a ' +
              'aux deux membres, avec vérification de la condition d\'existence.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 14. Résoudre une équation exponentielle ou logarithmique »',
        },
      ],
    },
    {
      id: 'inequations',
      number: 3,
      title: 'Résoudre une inéquation logarithmique',
      kicker: 'le sens dépend de la base — domaine d\'abord, toujours',
      blocks: [
        {
          kind: 'methode',
          label: 'À retenir — le sens dépend de la base a',
          items: [
            'Pour toute base $a>0$, $a \\neq 1$, $\\log_a$ est strictement **croissante** si ' +
              '$a>1$, et strictement **décroissante** si $0<a<1$ — exactement comme pour ' +
              'l\'exponentielle de base a vue au chapitre 2. Comparer deux logarithmes de même ' +
              'base **conserve** donc le sens de l\'inégalité si $a>1$, et l\'**inverse** si $0<a<1$ :',
            'Si $a>1$ : $\\log_a(u) \\le \\log_a(v) \\iff u \\le v$. Si $0<a<1$ : ' +
              '$\\log_a(u) \\le \\log_a(v) \\iff u \\ge v$.',
            'Le même principe s\'étend à la comparaison avec une constante : $\\log_a(u) \\le y ' +
              '\\iff u \\le a^y$ si $a>1$, et $\\iff u \\ge a^y$ si $0<a<1$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration (cas 0 < a < 1)',
          blocks: [
            {
              kind: 'para',
              text:
                'Si $0<a<1$, la fonction exponentielle de base a est strictement ' +
                '**décroissante** (chapitre 2). On a alors :',
            },
            {
              kind: 'para',
              text:
                '$\\log_a(u) \\le \\log_a(v) \\implies a^{\\log_a(u)} \\ge a^{\\log_a(v)}$ — ' +
                '$\\exp_a$ décroissante inverse le sens',
            },
            { kind: 'para', text: '$\\implies u \\ge v$ — car $a^{\\log_a(x)}=x$' },
            {
              kind: 'para',
              text:
                'Pour $a>1$ (dont le cas particulier $a=e$), $\\exp_a$ est croissante, et la ' +
                'même démonstration conserve le sens de l\'inégalité au lieu de l\'inverser.',
            },
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Comparateur (u,v > 0)', '0 < a < 1', 'a > 1 (dont a=e)'],
          rows: [
            ['logₐ(u) < logₐ(v)', 'u > v', 'u < v'],
            ['logₐ(u) ≤ logₐ(v)', 'u ≥ v', 'u ≤ v'],
            ['logₐ(u) > logₐ(v)', 'u < v', 'u > v'],
            ['logₐ(u) ≥ logₐ(v)', 'u ≤ v', 'u ≥ v'],
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — base e > 1 (sens conservé)',
          blocks: [
            { kind: 'para', text: '$\\ln(x) \\le 2$' },
            {
              kind: 'para',
              text:
                'Domaine : $x>0$. En appliquant exp (base e > 1, ne change pas le sens) : ' +
                '$x \\le e^2$. Ensemble-solution : $S = ]0\\,;\\,e^2]$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — domaine plus restrictif que la solution',
          blocks: [
            { kind: 'para', text: '$\\ln(x-1) > 0$' },
            {
              kind: 'para',
              text:
                'Domaine : $x-1>0 \\implies x>1$. Puis $\\ln(x-1) > 0 \\iff x-1>1 \\implies x>2$. ' +
                'Ensemble-solution : $S = ]2\\,;\\,+\\infty[$ — **strictement inclus** dans le ' +
                'domaine $]1\\,;\\,+\\infty[$.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            'Le **domaine de validité** (là où chaque logarithme est défini) et ' +
            'l\'**ensemble-solution** (là où l\'inégalité est vraie) sont deux choses ' +
            'différentes — toujours déterminer le domaine **en premier**, puis résoudre ' +
            'l\'inégalité à l\'intérieur de ce domaine.',
        },
        {
          kind: 'astuce',
          label: 'Vérification finale',
          text:
            'Comme toujours avec un domaine restreint, il est utile de vérifier que ' +
            'l\'ensemble-solution obtenu par le calcul est bien inclus dans le domaine de ' +
            'départ — ici $S=]2;+\\infty[$ est bien inclus dans $]1;+\\infty[$, ce qui confirme ' +
            'la cohérence du résultat.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — même inéquation, deux bases différentes',
          blocks: [
            {
              kind: 'para',
              text:
                'CE commune : $6w-1>0$ et $-4w^2+3>0$, soit $1/6 < w < \\sqrt{3}/2$.',
            },
            {
              kind: 'para',
              text:
                '**Base 0,5 < 1 (sens inversé)** : $\\log_{0,5}(6w-1) \\ge \\log_{0,5}(-4w^2+3) ' +
                '\\implies 6w-1 \\le -4w^2+3 \\implies 4w^2+6w-4 \\le 0$, résolue par ' +
                '$[-2\\,;\\,1/2]$. Combiné à la CE : $S = ]1/6\\,;\\,1/2]$.',
            },
            {
              kind: 'para',
              text:
                '**Base e > 1 (sens conservé)** : $\\ln(6w-1) \\ge \\ln(-4w^2+3) \\implies ' +
                '6w-1 \\ge -4w^2+3 \\implies 4w^2+6w-4 \\ge 0$, résolue par ' +
                '$]-\\infty;-2] \\cup [1/2;+\\infty[$. Combiné à la CE : ' +
                '$S = [1/2\\,;\\,\\sqrt{3}/2[$.',
            },
            {
              kind: 'para',
              text:
                'La **même** équation du second degré donne deux ensembles-solutions ' +
                '**différents** selon que la base est < 1 ou > 1 — c\'est tout l\'enjeu de ce chapitre.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Résoudre une inéquation logarithmique',
          generatorId: '6gen15',
          description: [
            'Résous une inéquation logarithmique en tenant compte du sens de la base pour ' +
              'inverser (ou non) le comparateur, en déterminant le domaine avant l\'ensemble-solution.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 15. Résoudre une inéquation logarithmique »',
        },
      ],
    },
    {
      id: 'derivee',
      number: 4,
      title: 'Domaine, dérivée et dérivation logarithmique',
      kicker: "(ln x)' = 1/x, dérivation logarithmique, exposant variable",
      blocks: [
        {
          kind: 'definition',
          label: 'Dérivée de ln (cas particulier a = e)',
          items: [
            '$(\\ln(x))\' = \\dfrac{1}{x}$ pour $x \\in ]0;+\\infty[$.',
            'Cette dérivée particulièrement simple — sans aucune constante multiplicative — ' +
              'est **spécifique à la base e** ; pour une base a>0, a≠1 quelconque, la formule ' +
              'générale (démontrée plus bas) fait apparaître le facteur $1/\\ln(a)$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration de ln\'(x) = 1/x',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\ln$ et exp étant réciproques, la dérivée d\'une fonction réciproque ' +
                '$f^{-1}$ vérifie $(f^{-1})\'(x) = 1/f\'(f^{-1}(x))$. Appliqué à $f = \\exp$ :',
            },
            { kind: 'para', text: '$\\ln\'(x) = \\dfrac{1}{\\exp\'(\\ln(x))}$ — dérivée d\'une fonction réciproque' },
            { kind: 'para', text: '$= \\dfrac{1}{\\exp(\\ln(x))}$ — car $\\exp\'=\\exp$ (chapitre 2)' },
            { kind: 'para', text: '$= \\dfrac{1}{x}$ — car $\\exp(\\ln(x))=x$' },
          ],
        },
        {
          kind: 'methode',
          label: 'Règle de la chaîne',
          items: [
            'Pour u dérivable et strictement positive sur un intervalle : ' +
              '$(\\ln(u(x)))\' = \\dfrac{u\'(x)}{u(x)}$.',
            'Le domaine de $x \\mapsto \\ln(u(x))$ est l\'ensemble des x tels que $u(x)>0$ — ' +
              'jamais simplement le domaine de u.',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$f(x) = \\ln(x^2+1)$ — domaine ℝ tout entier (car $x^2+1 \\ge 1 > 0$ ' +
                'toujours) $\\implies f\'(x) = \\dfrac{2x}{x^2+1}$.',
            },
            { kind: 'para', text: '$g(x) = \\ln(x-3)$ — domaine $]3;+\\infty[$ $\\implies g\'(x) = \\dfrac{1}{x-3}$.' },
          ],
        },
        {
          kind: 'piege',
          text: '$(\\ln(x))\'$ **n\'est pas** x — c\'est $\\dfrac{1}{x}$. Confondre la fonction avec sa dérivée est une erreur fréquente sous la pression du temps.',
        },
        {
          kind: 'methode',
          label: 'Dérivation logarithmique',
          items: [
            'Pour dériver un produit ou un quotient compliqué, on peut poser $g = \\ln|f|$ ' +
              '(avec $f \\neq 0$ sur l\'intervalle), dériver g — souvent beaucoup plus simple ' +
              'grâce aux propriétés du logarithme — puis revenir à $f\' = f \\cdot g\'$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — dérivation logarithmique',
          blocks: [
            { kind: 'para', text: '$f(x) = x^2 \\cdot \\sqrt{x+1}$, pour $x>0$ (où $f(x)>0$).' },
            {
              kind: 'para',
              text:
                '$\\ln(f(x)) = 2\\ln(x) + \\dfrac{1}{2} \\cdot \\ln(x+1) \\implies ' +
                '\\dfrac{f\'(x)}{f(x)} = \\dfrac{2}{x} + \\dfrac{1}{2(x+1)}$',
            },
            {
              kind: 'para',
              text:
                'D\'où $f\'(x) = f(x) \\cdot \\left(\\dfrac{2}{x} + \\dfrac{1}{2(x+1)}\\right)$ ' +
                '— bien plus direct que la règle du produit combinée à celle de la racine.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Pour aller plus loin — exposant lui-même variable',
          items: [
            'Toute fonction $f(x) = (g(x))^{h(x)}$ (avec $g(x)>0$) — donc un exposant qui ' +
              'dépend lui aussi de x, ce qu\'aucune règle de dérivation « de base » ne couvre ' +
              '— s\'écrit toujours $f(x) = e^{h(x) \\cdot \\ln(g(x))}$, ce qui la ramène à une ' +
              'composée dérivable par la règle de la chaîne :',
            '$((g(x))^{h(x)})\' = \\left(h\'(x) \\cdot \\ln(g(x)) + \\dfrac{h(x) \\cdot g\'(x)}{g(x)}\\right) \\cdot (g(x))^{h(x)}$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — exposant variable, dérivée logarithmique complète',
          blocks: [
            {
              kind: 'para',
              text:
                '$f(x) = (1+\\sqrt{x})^{2x}$, pour $x>0$. On écrit $f(x) = e^{2x \\cdot \\ln(1+\\sqrt{x})}$.',
            },
            {
              kind: 'para',
              text:
                'On dérive d\'abord l\'exposant, par la règle du produit puis de la chaîne : ' +
                '$(2x \\cdot \\ln(1+\\sqrt{x}))\' = 2\\ln(1+\\sqrt{x}) + 2x \\cdot ' +
                '\\dfrac{1}{2\\sqrt{x}} \\cdot \\dfrac{1}{1+\\sqrt{x}} = 2\\ln(1+\\sqrt{x}) + ' +
                '\\dfrac{\\sqrt{x}}{1+\\sqrt{x}}$.',
            },
            {
              kind: 'para',
              text:
                'D\'où $f\'(x) = \\left(2\\ln(1+\\sqrt{x}) + \\dfrac{\\sqrt{x}}{1+\\sqrt{x}}\\right) ' +
                '\\cdot (1+\\sqrt{x})^{2x}$ — que l\'on peut aussi regrouper au même dénominateur ' +
                'en $[2(1+\\sqrt{x}) \\cdot \\ln(1+\\sqrt{x}) + \\sqrt{x}] \\cdot ' +
                '(1+\\sqrt{x})^{2x-1}$. Ces dérivées, obtenues via $\\ln$, sont appelées ' +
                '**dérivées logarithmiques**.',
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Dérivée du logarithme de base a — pour toute base a > 0, a ≠ 1',
          items: ['$(\\log_a(x))\' = \\dfrac{1}{x \\cdot \\ln(a)}$ pour $x \\in ]0;+\\infty[$.'],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration de logₐ\'(x) = 1/(x·ln(a))',
          blocks: [
            { kind: 'para', text: '$\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}$ — changement de base' },
            {
              kind: 'para',
              text:
                '$\\log_a\'(x) = \\dfrac{\\ln\'(x)}{\\ln(a)} = \\dfrac{1}{x \\cdot \\ln(a)}$ — ' +
                '$\\ln(a)$ est une constante ⟹ dérivée d\'un multiple de ln',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Domaine, dérivée et dérivation logarithmique',
          generatorId: '6gen16',
          description: [
            'Détermine le domaine et calcule la dérivée d\'une fonction logarithmique ' +
              'composée, y compris par dérivation logarithmique pour un exposant variable.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 16. Domaine, dérivée et dérivation logarithmique »',
        },
      ],
    },
    {
      id: 'limites',
      number: 5,
      title: 'Calculer des limites',
      kicker: 'limites fondamentales, croissance comparée, classement complet',
      blocks: [
        {
          kind: 'definition',
          label: 'Limites fondamentales',
          items: [
            'Pour toute base a>0, a≠1, le sens des limites dépend de a — exactement comme le ' +
              'sens de monotonie établi à la section 1 :',
            'Si $a>1$ : $\\displaystyle\\lim_{x \\to 0^+} \\log_a(x) = -\\infty$, ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} \\log_a(x) = +\\infty$.',
            'Si $0<a<1$ : $\\displaystyle\\lim_{x \\to 0^+} \\log_a(x) = +\\infty$, ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} \\log_a(x) = -\\infty$.',
            'Dans les deux cas, la limite en $0^+$ donne au graphique son asymptote verticale ' +
              'en x=0 ; celle en +∞ diverge, mais **extrêmement lentement** si a>1. Cas ' +
              'particulier a=e (>1, donc premier cas) : $\\displaystyle\\lim_{x \\to 0^+} \\ln(x) = -\\infty$, ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} \\ln(x) = +\\infty$.',
          ],
        },
        {
          kind: 'methode',
          label: 'Croissance comparée',
          items: [
            'Pour toute base a>1, $\\log_a(x)$ est dominé par **n\'importe quelle** puissance ' +
              'strictement positive de x, aussi petite soit-elle :',
            '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{\\log_a(x)}{x^k} = 0$ pour tout réel k>0, pour ' +
              'toute base a>1 (dont a=e).',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: Math.sqrt, tone: 'good', xMin: 0 },
              { fn: Math.log, tone: 'accent', xMin: 0.03 },
            ],
            xMin: -0.6,
            xMax: 20,
            xTicks: [4],
            fixedYRange: { min: -3, max: 5 },
            points: [
              { x: 4, y: Math.log(4), label: 'écart minimal (x=4)', tone: 'accent', labelPos: 'right' },
              { x: 4, y: 2, label: '', tone: 'bad' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'En orange : ln(x). En vert : √x. Même la racine carrée, qui croît elle-même très lentement, reste toujours au-dessus de ln.',
          },
        },
        {
          kind: 'methode',
          label: 'Classement complet des croissances',
          items: [
            'Le chapitre 2 avait établi que $e^x$ finit toujours par dominer tout polynôme. Ce ' +
              'chapitre ajoute le troisième étage de la hiérarchie : les fonctions logarithmes ' +
              'sont, à leur tour, dominées par **toute** fonction puissance de degré strictement ' +
              'positif. Plus précisément, pour a>1, n>0, b>1, et x suffisamment grand : ' +
              '$a^x > x^n > \\log_b(x)$.',
            'Les exponentielles (base > 1) dominent toujours les puissances (degré > 0), qui ' +
              'dominent toujours les logarithmes (base > 1) — dans cet ordre, quel que soit à ' +
              'quel point la base ou le degré favorisent, a priori, l\'un des deux camps.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — forme indéterminée 0 × (−∞)',
          blocks: [
            { kind: 'para', text: '$\\displaystyle\\lim_{x \\to 0^+} x \\cdot \\ln(x) = 0$' },
            {
              kind: 'para',
              text:
                'Bien que $\\ln(x) \\to -\\infty$, le facteur $x \\to 0$ « écrase » cette ' +
                'divergence : c\'est un résultat classique de croissance comparée, symétrique ' +
                'de celui à l\'infini.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            '$\\displaystyle\\lim_{x \\to +\\infty} x \\cdot \\ln(x)$ **n\'est pas** une forme indéterminée : ' +
            'les deux facteurs tendent vers +∞, leur produit diverge donc directement vers +∞ ' +
            '— inutile (et faux) d\'invoquer la croissance comparée ici.',
        },
        { kind: 'subheading', text: 'La limite fondamentale en 1' },
        {
          kind: 'definition',
          label: 'À retenir — spécifique à la base e',
          items: [
            'Pour une base a>0, a≠1 quelconque, $\\displaystyle\\lim_{u \\to 0} \\log_a(1+u)/u$ vaut ' +
              '$\\log_a\'(1) = 1/\\ln(a)$ (section 4) — une valeur qui ne vaut exactement 1 que ' +
              'lorsque $\\ln(a)=1$, c\'est-à-dire pour a=e. C\'est précisément ce qui rend la ' +
              'base e si commode :',
            '$\\displaystyle\\lim_{u \\to 0} \\dfrac{\\ln(1+u)}{u} = 1$',
            'C\'est le nombre dérivé de $\\ln$ en 1 — analogue exact de la limite fondamentale ' +
              '$(e^x-1)/x \\to 1$ du chapitre 2 (elle aussi spécifique à la base e).',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [{ kind: 'para', text: '$\\displaystyle\\lim_{x \\to 1} \\dfrac{\\ln(x)}{x-1} = 1$ (poser $u = x-1 \\to 0$)' }],
        },
        {
          kind: 'astuce',
          label: 'Un domaine, pas une frontière',
          text:
            '$\\ln$ n\'étant tout simplement pas définie sur les réels négatifs, une ' +
            'expression comme $\\displaystyle\\lim_{x \\to -\\infty} \\ln(x)$ n\'a **aucun sens** — ni +∞, ' +
            'ni −∞, ni 0 : la question elle-même est mal posée.',
        },
        {
          kind: 'entrainement',
          title: 'Calculer des limites',
          generatorId: '6gen17',
          description: [
            'Calcule des limites de fonctions logarithmiques en utilisant les limites ' +
              'fondamentales, la croissance comparée et le classement complet exponentielle > ' +
              'puissance > logarithme.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 17. Calculer des limites »',
        },
      ],
    },
    {
      id: 'parametres',
      number: 6,
      title: 'Paramètres depuis des conditions graphiques',
      kicker: 'f(x) = a + b·ln(x) — f(1)=a, f\'(1)=b',
      blocks: [
        {
          kind: 'para',
          text:
            'Comme au chapitre 2, on peut retrouver des paramètres inconnus d\'une fonction à ' +
            'partir d\'informations lues sur son graphique — un point, une tangente, une ' +
            'asymptote. Pour une fonction du type $f(x) = a + b \\cdot \\ln(x)$, le fait que ' +
            '$\\ln(1)=0$ rend la lecture particulièrement directe.',
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            'Pour $f(x) = a + b \\cdot \\ln(x)$ : $f(1) = a$ (car $\\ln(1)=0$, le terme en b ' +
              's\'annule) et $f\'(x) = b/x$, donc $f\'(1) = b$ directement.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 1 + 2 * Math.log(x), tone: 'accent', xMin: 0.05 },
              { fn: (x) => 1 + 2 * (x - 1), tone: 'good', xMin: 0.35, xMax: 2.1 },
            ],
            xMin: -0.5,
            xMax: 4,
            xTicks: [1],
            fixedYRange: { min: -3, max: 4 },
            verticalAsymptotes: [{ x: 0, label: 'asymptote x=0' }],
            points: [
              { x: 1, y: 1, label: '(1;1)', tone: 'accent' },
              { x: E, y: 3, label: '(e;3)', tone: 'bad' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'f(x) = 1 + 2·ln(x) : en x=1, f(1)=1=a lit directement a ; la pente de la ' +
              'tangente en x=1 vaut 2=b',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'Un graphique de $f(x) = a + b \\cdot \\ln(x)$ passe par $(1;4)$ et sa ' +
                'tangente en x=1 a pour pente 3.',
            },
            { kind: 'para', text: '$f(1) = a = 4$. $f\'(1) = b = 3$. D\'où $f(x) = 4 + 3\\ln(x)$.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — point en x = e',
          blocks: [
            {
              kind: 'para',
              text:
                'Sachant $a=2$ et que le graphique de $f(x) = a + b \\cdot \\ln(x)$ passe par $(e;5)$ :',
            },
            {
              kind: 'para',
              text: '$f(e) = a + b\\ln(e) = a+b$ (car $\\ln(e)=1$) $= 5 \\implies b = 5-2 = 3$.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'Ne pas confondre le point en x=1 (où $\\ln(1)=0$ annule b, donnant directement a) ' +
            'avec un point en x=e (où $\\ln(e)=1$, donc b intervient bel et bien) — c\'est a+b, ' +
            'pas simplement a.',
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier',
          text:
            'Une fois les paramètres calculés, réinjecter leurs valeurs dans les conditions de ' +
            'départ permet de détecter une éventuelle erreur de calcul avant de conclure.',
        },
        {
          kind: 'entrainement',
          title: 'Paramètres depuis des conditions graphiques',
          generatorId: '6gen18',
          description: [
            'Retrouve les paramètres a et b de f(x) = a + b·ln(x) à partir d\'un point et ' +
              'd\'une pente lus sur un graphique.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 18. Paramètres depuis des conditions graphiques »',
        },
      ],
    },
    {
      id: 'hyperboliques',
      number: 7,
      title: 'Sinus et cosinus hyperboliques',
      kicker: 'ch²−sh²=1, dérivées croisées, rien à voir avec les angles',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux fonctions bâties à partir de $e^x$ et $e^{-x}$, dont le nom rappelle la ' +
            'trigonométrie circulaire — mais sans aucun lien avec des angles.',
        },
        {
          kind: 'definition',
          label: 'Définitions',
          items: ['$\\text{ch}(x) = \\dfrac{e^x+e^{-x}}{2} \\qquad \\text{sh}(x) = \\dfrac{e^x-e^{-x}}{2}$'],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => (Math.exp(x) + Math.exp(-x)) / 2, tone: 'accent' },
              { fn: (x) => (Math.exp(x) - Math.exp(-x)) / 2, tone: 'good' },
            ],
            xMin: -2.2,
            xMax: 2.2,
            xTicks: [],
            fixedYRange: { min: -4, max: 4.5 },
            points: [{ x: 0, y: 1, label: '(0;1)', tone: 'accent' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'En orange, ch (paire, minimum en (0;1)) ; en vert, sh (impaire, passe par l\'origine)',
          },
        },
        {
          kind: 'methode',
          label: 'Propriétés',
          items: [
            'ch est **paire**, sh est **impaire** ; ch(0)=1, sh(0)=0 ; et surtout l\'identité fondamentale :',
            '$\\text{ch}^2(x) - \\text{sh}^2(x) = 1$ pour tout x réel — analogue de ' +
              '$\\cos^2+\\sin^2=1$, mais avec un **signe moins**.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — vérification numérique',
          blocks: [
            {
              kind: 'para',
              text:
                'En x=1 : ch(1) ≈ 1,5431, sh(1) ≈ 1,1752. ch²(1) − sh²(1) ≈ 2,381 − 1,381 = 1 ✓.',
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Dérivées',
          items: [
            '$\\text{sh}\'(x) = \\text{ch}(x) \\qquad \\text{ch}\'(x) = \\text{sh}(x)$',
            'Les deux fonctions **échangent leurs rôles** par dérivation — aucune des deux ne ' +
              'se reproduit elle-même, à la différence de $e^x$.',
          ],
        },
        {
          kind: 'piege',
          text:
            'ch(x) ≥ 1 **toujours** (minimum en x=0) — ne jamais la confondre avec cos, qui ' +
            'oscille entre −1 et 1. ch ne devient jamais négative.',
        },
        {
          kind: 'entrainement',
          title: 'Sinus et cosinus hyperboliques',
          generatorId: '6gen19',
          description: [
            'Manipule les fonctions ch et sh : identité fondamentale, parité, dérivées croisées.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 19. Sinus et cosinus hyperboliques »',
        },
      ],
    },
    {
      id: 'graphique',
      number: 8,
      title: 'Graphique de la fonction dérivée',
      kicker: 'le signe de f\' donne la variation, jamais directement la concavité',
      blocks: [
        {
          kind: 'para',
          text:
            'Même principe qu\'au chapitre 2 : le signe de f\' donne le sens de variation de ' +
            'f, et un changement de signe de f\' repère un extremum.',
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$f(x) = x - \\ln(x)$, pour $x>0$' },
            {
              kind: 'para',
              text:
                '$f\'(x) = 1 - \\dfrac{1}{x}$, qui s\'annule exactement en x=1. f\' < 0 sur ' +
                ']0;1[, f\' > 0 sur ]1;+∞[ $\\implies$ **minimum en x=1**, f(1) = 1 (car $\\ln(1)=0$).',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [{ fn: (x) => x - Math.log(x), tone: 'accent', xMin: 0.04 }],
            xMin: -0.4,
            xMax: 4,
            xTicks: [1],
            fixedYRange: { min: -1, max: 4 },
            verticalAsymptotes: [{ x: 0, label: 'asymptote x=0' }],
            points: [{ x: 1, y: 1, label: 'min (1;1)', tone: 'accent' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'f(x) = x−ln(x) : minimum en (1;1), diverge vers +∞ en x→0⁺ (le terme −ln(x) l\'emporte)',
          },
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            'Une asymptote verticale de f en x→0⁺ s\'accompagne typiquement d\'une dérivée f\' ' +
              'qui diverge elle aussi (en valeur absolue) au voisinage de ce même point.',
          ],
        },
        {
          kind: 'piege',
          text:
            'La **concavité** de f se lit sur le signe de f″, c\'est-à-dire sur le fait que f\' ' +
            'elle-même soit croissante ou décroissante — jamais directement sur le signe de f\'.',
        },
        {
          kind: 'entrainement',
          title: 'Graphique de la fonction dérivée',
          generatorId: '6gen20',
          description: [
            'Associe une fonction logarithmique et sa dérivée à partir de leur graphique, en ' +
              'utilisant le signe et les extremums.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 20. Graphique de la fonction dérivée »',
        },
      ],
    },
    {
      id: 'etude',
      number: 9,
      title: 'Étudier une fonction (synthèse)',
      kicker: 'domaine, limites et asymptotes, dérivée, concavité — dans l\'ordre',
      blocks: [
        {
          kind: 'para',
          text:
            'Une étude complète détermine, dans l\'ordre : domaine, limites et asymptotes, ' +
            'dérivée et sens de variation, concavité.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — étude complète',
          blocks: [
            { kind: 'para', text: '$f(x) = \\dfrac{\\ln(x)}{x}$' },
            { kind: 'para', text: '**Domaine :** $]0;+\\infty[$ (restriction du logarithme ET du dénominateur, qui coïncident ici).' },
            {
              kind: 'para',
              text:
                '**Dérivée :** $f\'(x) = \\dfrac{1-\\ln(x)}{x^2}$, qui s\'annule en x=e (car ' +
                '$\\ln(e)=1$) $\\implies$ **maximum en x=e**, $f(e) = 1/e \\approx 0{,}368$.',
            },
            {
              kind: 'para',
              text:
                '**Limites :** en x→0⁺, $\\ln(x) \\to -\\infty$ divisé par x→0⁺ donne ' +
                '$f(x) \\to -\\infty$ (asymptote verticale x=0) ; en x→+∞, croissance comparée ' +
                '$\\implies$ $f(x) \\to 0$ (asymptote horizontale y=0).',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.log(x) / x, tone: 'accent', xMin: 0.04 }],
            xMin: -0.7,
            xMax: 8,
            xTicks: [],
            fixedYRange: { min: -3, max: 1 },
            verticalAsymptotes: [{ x: 0, label: 'asymptote x=0' }],
            horizontalAsymptotes: [{ y: 0, label: 'asymptote y=0' }],
            points: [{ x: E, y: 1 / E, label: 'max (e;1/e)', tone: 'accent', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'f(x) = ln(x)/x : maximum en (e;1/e), asymptote verticale x=0, asymptote horizontale y=0 en +∞',
          },
        },
        {
          kind: 'piege',
          text:
            'Quand une fonction combine un logarithme **et** une expression rationnelle, il ' +
            'faut vérifier **à la fois** les restrictions imposées par le logarithme **et** ' +
            'celles imposées par un éventuel dénominateur — ici les deux coïncident par ' +
            'chance, mais ce n\'est pas systématique.',
        },
        {
          kind: 'entrainement',
          title: 'Étudier une fonction (synthèse)',
          generatorId: '6gen21',
          description: [
            'Mène une étude complète (domaine, limites, asymptotes, variation, extremum) sur ' +
              'une fonction logarithmique composée.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 21. Étudier une fonction (synthèse) »',
        },
      ],
    },
    {
      id: 'problemes',
      number: 10,
      title: 'Logarithmes : problèmes',
      kicker: 'échelles logarithmiques, demi-vie, croissance logistique',
      blocks: [
        {
          kind: 'para',
          text:
            'Échelles logarithmiques (pH, magnitude de Richter, décibels), demi-vie ' +
            'radioactive, croissance logistique : autant de situations où retrouver une ' +
            'inconnue « cachée dans un exposant » passe obligatoirement par ln.',
        },
        {
          kind: 'definition',
          label: 'Échelle logarithmique',
          items: [
            '$L = a \\cdot \\log_{10}(X) + b$',
            'Multiplier la grandeur physique X par un facteur k modifie L de façon ' +
              '**additive** ($\\Delta L = a \\cdot \\log_{10}(k)$), jamais de façon multiplicative.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — pH',
          blocks: [
            {
              kind: 'para',
              text:
                'Le pH d\'une solution vaut $pH = -\\log_{10}([H^+])$. Si la concentration ' +
                '$[H^+]$ est multipliée par 10 :',
            },
            {
              kind: 'para',
              text: '$pH_{nouveau} = -\\log_{10}(10 \\cdot [H^+]) = -(1+\\log_{10}([H^+])) = pH_{ancien} - 1$',
            },
            { kind: 'para', text: 'Le pH **diminue** de 1 (solution plus acide) — jamais « ×10 ».' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — demi-vie radioactive',
          blocks: [
            {
              kind: 'para',
              text:
                'Un modèle de décroissance $N(t) = N_0 \\cdot e^{-\\lambda t}$. La demi-vie T ' +
                'vérifie $N(T) = N_0/2$ :',
            },
            {
              kind: 'para',
              text:
                '$e^{-\\lambda T} = \\dfrac{1}{2} \\implies -\\lambda T = \\ln(1/2) = -\\ln(2) ' +
                '\\implies T = \\dfrac{\\ln(2)}{\\lambda}$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Modèle de croissance logistique',
          blocks: [
            { kind: 'para', text: '$y(t) = \\dfrac{k}{1+a \\cdot e^{-rt}}$' },
            {
              kind: 'para',
              text:
                'La croissance la plus rapide (point d\'inflexion) se produit exactement en ' +
                'y = k/2, à l\'instant $t = \\ln(a)/r$. Avec k=10, a=9, r=1 : inflexion en ' +
                't = ln(9) ≈ 2,20, y=5 ; asymptote horizontale y=10 en +∞ (capacité limite).',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => 10 / (1 + 9 * Math.exp(-t)), tone: 'accent', xMin: 0 }],
            xMin: -1,
            xMax: 8,
            xTicks: [Math.log(9)],
            xTickLabels: { [Math.log(9)]: '2,20' },
            fixedYRange: { min: -0.6, max: 11 },
            horizontalAsymptotes: [{ y: 10, label: 'asymptote y=10' }],
            points: [
              { x: 0, y: 1, label: '(0;1)', tone: 'accent' },
              { x: Math.log(9), y: 5, label: 'inflexion (2,20;5)', tone: 'bad', labelPos: 'right' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'y',
            caption: 'Courbe logistique : départ lent, accélération autour du point d\'inflexion, puis ralentissement vers l\'asymptote y=10',
          },
        },
        {
          kind: 'astuce',
          label: 'Trouver un instant précis',
          text:
            'Pour répondre à « à partir de quel instant une quantité dépasse-t-elle un seuil ' +
            'donné ? », on isole le terme exponentiel puis on applique ln — exactement la ' +
            'même démarche qu\'au chapitre 2, désormais menée jusqu\'au bout.',
        },
        {
          kind: 'entrainement',
          title: 'Logarithmes : problèmes',
          generatorId: '6gen22',
          description: [
            'Modélise une situation concrète (pH, demi-vie radioactive, croissance ' +
              'logistique) à partir d\'un contexte narratif, en isolant l\'inconnue via ln.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 22. Logarithmes : problèmes »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Propriété', 'Énoncé'],
      rows: [
        ['Domaine', ']0;+∞['],
        ['Valeurs particulières', 'ln(1)=0, ln(e)=1'],
        ['Somme / différence', 'ln(ab)=ln(a)+ln(b)'],
        ['Dérivée', '1/x'],
        ['Limite en 0⁺', '−∞'],
        ['Limite en +∞', '+∞ (très lente)'],
      ],
    },
    forward:
      'À retenir : ln et exp se défont mutuellement — équations et inéquations se résolvent ' +
      'en appliquant l\'une ou l\'autre selon le côté où se trouve l\'inconnue ; ln est ' +
      'toujours dominée par n\'importe quelle puissance de x en +∞, jamais l\'inverse.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai/faux : réviser tout le chapitre',
      generatorId: '6gen66',
      description: [
        'Choisis un thème et teste-toi sur tout le chapitre — affirmations pré-écrites, une ' +
          'seule tentative par question, justification toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 66. Quiz vrai/faux — Fonctions logarithmes »',
    },
  },
}
