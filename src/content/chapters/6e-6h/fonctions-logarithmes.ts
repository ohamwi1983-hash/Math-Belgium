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
              '\\mathbb{R}$ : $\\log_a(x) = y \\iff a^y = x$. Cette équivalence est le ' +
              '**principe d\'équivalence fondamental** : le logarithme de base $a$ d\'un réel ' +
              'strictement positif est l\'exposant de la puissance de $a$ égale à ce réel.',
          ],
        },
        {
          kind: 'definition',
          label: 'Propriétés immédiates',
          items: [
            'Quatre égalités se lisent directement sur le principe d\'équivalence ' +
              'ci-dessus. Pour toute base $a>0$, $a \\neq 1$, tout $x>0$ et tout ' +
              '$r \\in \\mathbb{R}$ :',
            '**(P1)** $\\log_a(1) = 0$ — car $a^0 = 1$.',
            '**(P2)** $\\log_a(a) = 1$ — car $a^1 = a$.',
            '**(P3)** $\\log_a(a^r) = r$ — l\'exposant à donner à $a$ pour obtenir $a^r$ est ' +
              'évidemment $r$ : $\\log_a$ **défait** $\\exp_a$.',
            '**(P4)** $a^{\\log_a(x)} = x$ — en posant $y = \\log_a(x)$, le principe ' +
              'd\'équivalence donne exactement $a^y = x$ : $\\exp_a$ **défait** $\\log_a$.',
            'Ces quatre propriétés sont l\'outil de base de **toutes** les démonstrations de ce ' +
              'chapitre : elles y seront citées par leur numéro, (P1) à (P4).',
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
            textLabels: [
              { x: 0.55, y: 2.95, text: 'y=2^x', tone: 'good', anchor: 'start' },
              { x: 2.55, y: 2.15, text: 'y=x', tone: 'faint', anchor: 'start' },
              { x: 2.35, y: 0.3, text: 'y=log₂x', tone: 'accent', anchor: 'start' },
            ],
            points: [
              { x: 0.8, y: Math.pow(2, 0.8), label: '(r;s)', tone: 'bad' },
              { x: Math.pow(2, 0.8), y: 0.8, label: '(s;r)', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Cas a > 1 (ici a=2) : exp₂ et log₂ sont symétriques par rapport à la droite y=x. ' +
              'Si (r;s) appartient au graphique de exp₂, alors (s;r) appartient à celui de log₂ ' +
              '— c\'est la traduction graphique de « fonctions réciproques ».',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'faint' },
              { fn: (x) => Math.pow(0.5, x), tone: 'good', xMin: -1.7 },
              { fn: (x) => Math.log(x) / Math.log(0.5), tone: 'accent', xMin: 0.04 },
            ],
            xMin: -2.5,
            xMax: 3.2,
            xTicks: [],
            fixedYRange: { min: -2.5, max: 3.2 },
            textLabels: [
              { x: -2.4, y: 2.55, text: 'y=0,5^x', tone: 'good', anchor: 'start' },
              { x: 2.55, y: 2.15, text: 'y=x', tone: 'faint', anchor: 'start' },
              { x: 0.7, y: -1.95, text: 'y=log₀,₅x', tone: 'accent', anchor: 'start' },
            ],
            points: [
              { x: -1.2, y: Math.pow(0.5, -1.2), label: '(r;s)', tone: 'bad' },
              { x: Math.pow(0.5, -1.2), y: -1.2, label: '(s;r)', tone: 'accent', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Cas 0 < a < 1 (ici a=0,5) : même symétrie par rapport à y=x, mais les deux ' +
              'courbes sont maintenant décroissantes. La réciprocité ne dépend pas de la base — ' +
              'seul le sens de variation change.',
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
                'Soient $a>0$, $a \\neq 1$, et $x,y>0$. Toute la démonstration tient en une ' +
                'idée : réécrire $x$ et $y$ comme des **puissances de la base** $a$, pour ' +
                'utiliser les règles de calcul sur les exposants du chapitre 2.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Par **(P4)**, $x = a^{\\log_a(x)}$ et $y = a^{\\log_a(y)}$. En ' +
                'remplaçant $x$ et $y$ par ces écritures dans $\\log_a(xy)$ :',
            },
            {
              kind: 'para',
              text: '$\\log_a(xy) = \\log_a\\!\\left(a^{\\log_a(x)} \\cdot a^{\\log_a(y)}\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 2.** L\'argument est maintenant un produit de deux puissances de même ' +
                'base $a$ : la propriété des puissances $a^p \\cdot a^q = a^{p+q}$ (chapitre 2) ' +
                'permet de n\'en faire qu\'une seule, en **additionnant** les exposants :',
            },
            {
              kind: 'para',
              text: '$= \\log_a\\!\\left(a^{\\log_a(x) + \\log_a(y)}\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 3.** L\'argument est désormais de la forme $a^r$, avec ' +
                '$r = \\log_a(x) + \\log_a(y)$. Par **(P3)**, $\\log_a(a^r) = r$ :',
            },
            { kind: 'para', text: '$= \\log_a(x) + \\log_a(y) \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'C\'est bien la propriété annoncée : le logarithme **transforme un produit en ' +
                'somme**. Toute la démonstration s\'est jouée sur le passage de $\\cdot$ à $+$ à ' +
                'l\'étape 2 — les étapes 1 et 3 ne font qu\'entrer puis sortir de l\'écriture ' +
                '« puissance de $a$ ».',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — logarithme d\'une puissance',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $a>0$, $a \\neq 1$, $x>0$ et $r \\in \\mathbb{R}$. Même schéma en trois ' +
                'étapes que pour le produit, avec cette fois la propriété des puissances ' +
                'relative à une puissance de puissance.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Par **(P4)**, $x = a^{\\log_a(x)}$. On remplace $x$ par cette ' +
                'écriture dans $\\log_a(x^r)$ :',
            },
            {
              kind: 'para',
              text: '$\\log_a(x^r) = \\log_a\\!\\left(\\left(a^{\\log_a(x)}\\right)^r\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 2.** L\'argument est une puissance de puissance : par ' +
                '$(a^p)^r = a^{p \\cdot r}$ (chapitre 2), les deux exposants se **multiplient** :',
            },
            {
              kind: 'para',
              text: '$= \\log_a\\!\\left(a^{r \\cdot \\log_a(x)}\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 3.** L\'argument est de la forme $a^t$ avec $t = r \\cdot \\log_a(x)$. ' +
                'Par **(P3)**, $\\log_a(a^t) = t$ :',
            },
            { kind: 'para', text: '$= r \\cdot \\log_a(x) \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'Le logarithme **transforme une puissance en produit** : l\'exposant $r$ « ' +
                'descend » devant le logarithme. C\'est cette propriété qui permettra, en ' +
                'section 2, de faire sortir l\'inconnue d\'un exposant.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — logarithme d\'un quotient',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $a>0$, $a \\neq 1$, et $x,y>0$. Le schéma est rigoureusement le même que ' +
                'pour le produit ; seule change la propriété des puissances utilisée à ' +
                'l\'étape 2.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Par **(P4)**, $x = a^{\\log_a(x)}$ et $y = a^{\\log_a(y)}$, d\'où :',
            },
            {
              kind: 'para',
              text:
                '$\\log_a\\!\\left(\\dfrac{x}{y}\\right) = ' +
                '\\log_a\\!\\left(\\dfrac{a^{\\log_a(x)}}{a^{\\log_a(y)}}\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 2.** L\'argument est un quotient de deux puissances de même base $a$ : ' +
                'par $a^p / a^q = a^{p-q}$ (chapitre 2), les exposants se **soustraient** :',
            },
            {
              kind: 'para',
              text: '$= \\log_a\\!\\left(a^{\\log_a(x) - \\log_a(y)}\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 3.** Par **(P3)** appliquée à $t = \\log_a(x) - \\log_a(y)$ :',
            },
            { kind: 'para', text: '$= \\log_a(x) - \\log_a(y) \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'On aurait aussi pu déduire ce résultat des deux précédents, sans repartir de ' +
                '**(P4)** : $\\log_a(x/y) = \\log_a(x \\cdot y^{-1}) = \\log_a(x) + ' +
                '\\log_a(y^{-1})$ (logarithme d\'un produit) $= \\log_a(x) + (-1) \\cdot ' +
                '\\log_a(y)$ (logarithme d\'une puissance, avec $r=-1$) $= \\log_a(x) - \\log_a(y)$.',
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
          label: 'Changement de base — pour les exponentielles',
          items: [
            'Pour deux bases $a,b>0$, $a \\neq 1$, $b \\neq 1$, et tout $x$ réel : ' +
              '$a^x = b^{\\,x \\cdot \\log_b(a)}$.',
            'Autrement dit : **toute** exponentielle peut se réécrire dans **n\'importe quelle** ' +
              'autre base, au prix d\'un facteur constant $\\log_b(a)$ dans l\'exposant.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — changement de base pour les exponentielles',
          blocks: [
            {
              kind: 'para',
              text: 'Soient $a,b>0$ avec $a \\neq 1$ et $b \\neq 1$, et soit $x$ un réel.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** On réécrit d\'abord la **base** $a$ comme une puissance de $b$. ' +
                'Comme $a>0$, la propriété **(P4)** appliquée en base $b$ donne ' +
                '$a = b^{\\log_b(a)}$. On élève les deux membres à la puissance $x$ :',
            },
            {
              kind: 'para',
              text: '$a^x = \\left(b^{\\log_b(a)}\\right)^{x}$',
            },
            {
              kind: 'para',
              text:
                '**Étape 2.** Le membre de droite est une puissance de puissance : par ' +
                '$(b^p)^x = b^{p \\cdot x}$ (chapitre 2), les exposants se multiplient :',
            },
            { kind: 'para', text: '$= b^{\\,x \\cdot \\log_b(a)} \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'Lecture graphique : passer de $\\exp_b$ à $\\exp_a$ revient à **diviser toutes ' +
                'les abscisses par** $\\log_b(a)$. En effet $a^x = b^{x \\cdot \\log_b(a)}$ : la ' +
                'valeur que $\\exp_a$ atteint en $x$, $\\exp_b$ ne l\'atteint qu\'en ' +
                '$x \\cdot \\log_b(a)$.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => Math.pow(2, x), tone: 'accent', xMax: 1.85 },
              { fn: (x) => Math.pow(3, x), tone: 'good', xMax: 1.18 },
            ],
            xMin: -2,
            xMax: 2.4,
            xTicks: [],
            fixedYRange: { min: -0.5, max: 3.6 },
            textLabels: [
              { x: -1.95, y: 3.2, text: 'g(x)=3^x', tone: 'good', anchor: 'start' },
              { x: -1.95, y: 2.5, text: 'f(x)=2^x', tone: 'accent', anchor: 'start' },
            ],
            points: [
              { x: 1, y: 3, label: '(1;3)', tone: 'good', labelPos: 'left' },
              { x: Math.log(3) / Math.log(2), y: 3, label: '(log₂3;3)', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Changement de base en action : 3^x = 2^(x·log₂3). La hauteur 3, atteinte par 3^x ' +
              'dès x=1, n\'est atteinte par 2^x qu\'en x=log₂3 ≈ 1,58 — le graphique de 3^x ' +
              's\'obtient donc à partir de celui de 2^x en divisant toutes les abscisses par ' +
              'log₂3 (soit ≈ ×0,63).',
          },
        },
        {
          kind: 'definition',
          label: 'Changement de base — pour les logarithmes',
          items: [
            'Pour deux bases $a,b>0$, $a \\neq 1$, $b \\neq 1$, tout logarithme de base $a$ se ' +
              'ramène toujours à n\'importe quelle autre base $b$ : $\\log_a(x) = ' +
              '\\dfrac{\\log_b(x)}{\\log_b(a)}$ pour tout $x>0$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — changement de base pour les logarithmes',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $a,b>0$ avec $a \\neq 1$ et $b \\neq 1$, et soit $x>0$. On **pose** ' +
                '$y = \\log_a(x)$ : démontrer la formule revient alors à calculer $y$ en ' +
                'fonction de logarithmes de base $b$ uniquement. On écrit successivement les ' +
                'égalités équivalentes suivantes.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** $y = \\log_a(x)$ signifie exactement, par le principe ' +
                'd\'équivalence fondamental :',
            },
            { kind: 'para', text: '$a^{y} = x$' },
            {
              kind: 'para',
              text:
                '**Étape 2.** On applique au membre de gauche le changement de base pour les ' +
                'exponentielles démontré ci-dessus, $a^{y} = b^{\\,y \\cdot \\log_b(a)}$ :',
            },
            { kind: 'para', text: '$b^{\\,y \\cdot \\log_b(a)} = x$' },
            {
              kind: 'para',
              text:
                '**Étape 3.** Cette dernière égalité est de la forme $b^{\\,\\square} = x$. Par ' +
                'le principe d\'équivalence fondamental **appliqué cette fois en base** $b$, ' +
                'l\'exposant $\\square$ est exactement $\\log_b(x)$ :',
            },
            { kind: 'para', text: '$y \\cdot \\log_b(a) = \\log_b(x)$' },
            {
              kind: 'para',
              text:
                '**Étape 4.** Enfin, $\\log_b(a) \\neq 0$ : par **(P1)**, $\\log_b$ ne s\'annule ' +
                'qu\'en 1, et $a \\neq 1$ par hypothèse. On peut donc diviser les deux membres ' +
                'par $\\log_b(a)$ :',
            },
            { kind: 'para', text: '$y = \\dfrac{\\log_b(x)}{\\log_b(a)}$' },
            {
              kind: 'para',
              text:
                'Comme $y = \\log_a(x)$ par construction, on conclut $\\log_a(x) = ' +
                '\\dfrac{\\log_b(x)}{\\log_b(a)}$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Conséquence importante : $\\log_b(a)$ étant une **constante** (elle ne dépend ' +
                'pas de $x$), l\'égalité se lit $\\log_a = \\dfrac{1}{\\log_b(a)} \\cdot ' +
                '\\log_b$ — toutes les fonctions logarithmes, quelle que soit leur base, sont ' +
                'des **multiples** les unes des autres.',
            },
            {
              kind: 'para',
              text:
                'La réciproque est vraie elle aussi : tout multiple non nul $k \\cdot \\log_b$ ' +
                'est encore une fonction logarithme. Il suffit de choisir la base $a$ telle que ' +
                '$k = \\dfrac{1}{\\log_b(a)}$, c\'est-à-dire $\\log_b(a) = \\dfrac{1}{k}$, ' +
                'c\'est-à-dire $a = b^{1/k}$ — un réel bien strictement positif et différent ' +
                'de 1 dès que $k \\neq 0$.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => Math.log(x) / Math.log(2), tone: 'good', xMin: 0.15 },
              { fn: (x) => Math.log(x), tone: 'accent', xMin: 0.09 },
              { fn: (x) => Math.log10(x), tone: 'bad', xMin: 0.004 },
              { fn: (x) => Math.log(x) / Math.log(0.5), tone: 'faint', xMin: 0.15 },
            ],
            xMin: -0.5,
            xMax: 4,
            xTicks: [2, 3],
            fixedYRange: { min: -2.4, max: 2.4 },
            textLabels: [
              { x: 3.2, y: 1.95, text: 'log₂', tone: 'good', anchor: 'start' },
              { x: 3.2, y: 1.3, text: 'ln', tone: 'accent', anchor: 'start' },
              { x: 3.2, y: 0.18, text: 'log₁₀', tone: 'bad', anchor: 'start' },
              { x: 2.35, y: -2.1, text: 'log₀,₅', tone: 'faint', anchor: 'start' },
            ],
            points: [{ x: 1, y: 0, label: '(1;0)', tone: 'accent', labelPos: 'below' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Quatre fonctions logarithmes (bases 2, e, 10 et 0,5) sur les mêmes axes. Elles ' +
              'passent toutes par (1;0) et sont toutes multiples les unes des autres : leurs ' +
              'ordonnées sont, en chaque x, proportionnelles entre elles. Un coefficient négatif ' +
              '(cas de log₀,₅, dont le coefficient vaut 1/ln(0,5) < 0) retourne simplement la ' +
              'courbe autour de l\'axe des abscisses.',
          },
        },
        {
          kind: 'astuce',
          label: 'Le logarithme népérien : le cas particulier a = e',
          text:
            'Le nombre $e$ (introduit au chapitre 2 comme l\'unique base pour laquelle ' +
            '$\\exp_a\' = \\exp_a$) donne un logarithme particulièrement important : $\\log_e$, ' +
            'la fonction réciproque de $\\exp$. Le **logarithme népérien** $\\ln$, lui, a été ' +
            'introduit au chapitre 2 par une tout autre voie — comme le coefficient qui apparaît ' +
            'dans la dérivée $(a^x)\' = a^x \\cdot \\ln(a)$. Ces deux fonctions, définies ' +
            'indépendamment l\'une de l\'autre, sont en fait **la même** : c\'est l\'objet du ' +
            'théorème démontré juste après. On note donc $\\ln$ plutôt que $\\log_e$. Le ' +
            'changement de base ci-dessus, avec $b=e$, donne alors une écriture de **tout** ' +
            'logarithme uniquement à l\'aide de $\\ln$ : $\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}$. ' +
            'C\'est cette écriture qui rend $\\ln$ si pratique en pratique : une calculatrice ' +
            'n\'a souvent qu\'une touche $\\ln$. Pour obtenir $\\log_2(10)$ par exemple, on ' +
            'calcule $\\ln(10)/\\ln(2) \\approx 3{,}32$.',
        },
        {
          kind: 'definition',
          label: 'Identification du logarithme népérien avec le logarithme de base e',
          items: ['Pour tout $a>0$ : $\\ln(a) = \\log_e(a)$.'],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi ln est exactement log_e',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $a>0$, $a \\neq 1$. L\'idée est de **calculer la dérivée de** $\\exp_a$ ' +
                '**de deux façons différentes**, puis d\'identifier les deux résultats.',
            },
            {
              kind: 'para',
              text:
                '**Premier calcul** — via le changement de base. Le théorème démontré plus haut, ' +
                'appliqué avec $b=e$, donne $a^x = e^{\\,x \\cdot \\log_e(a)}$. On dérive cette ' +
                'écriture :',
            },
            {
              kind: 'para',
              text: '$(a^x)\' = \\left(e^{\\,x \\cdot \\log_e(a)}\\right)\'$ — changement de base',
            },
            {
              kind: 'para',
              text:
                '$= e^{\\,x \\cdot \\log_e(a)} \\cdot \\left(x \\cdot \\log_e(a)\\right)\'$ — ' +
                'règle de la chaîne, et $\\exp\' = \\exp$ (chapitre 2)',
            },
            {
              kind: 'para',
              text:
                '$= e^{\\,x \\cdot \\log_e(a)} \\cdot \\log_e(a)$ — dérivée d\'une fonction du ' +
                'premier degré : $\\log_e(a)$ est une **constante**, donc ' +
                '$(x \\cdot \\log_e(a))\' = \\log_e(a)$',
            },
            {
              kind: 'para',
              text:
                '$= a^x \\cdot \\log_e(a)$ — on repasse à la base $a$ par le même changement de ' +
                'base, en sens inverse',
            },
            {
              kind: 'para',
              text:
                '**Deuxième calcul** — la formule déjà connue. Le chapitre 2 avait établi ' +
                'directement, pour toute base $a>0$ : $(a^x)\' = a^x \\cdot \\ln(a)$.',
            },
            {
              kind: 'para',
              text:
                '**Identification.** Les deux calculs portent sur la même fonction dérivée, donc ' +
                'pour tout $x$ réel : $a^x \\cdot \\log_e(a) = a^x \\cdot \\ln(a)$. Comme ' +
                '$a^x > 0$ (jamais nul), on peut diviser les deux membres par $a^x$ :',
            },
            { kind: 'para', text: '$\\log_e(a) = \\ln(a) \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'Le cas $a=1$ se vérifie à part et sans calcul : $\\ln(1)=0$ et $\\log_e(1)=0$ ' +
                'par **(P1)**. L\'égalité vaut donc bien pour tout $a>0$.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'faint' },
              { fn: Math.exp, tone: 'good', xMax: 1.5 },
              { fn: Math.log, tone: 'accent', xMin: 0.09 },
            ],
            xMin: -1.6,
            xMax: 4,
            xTicks: [],
            fixedYRange: { min: -2.5, max: 4 },
            textLabels: [
              { x: 1.35, y: 3.55, text: 'exp', tone: 'good', anchor: 'start' },
              { x: 2.75, y: 3.35, text: 'y=x', tone: 'faint', anchor: 'start' },
              { x: 3.45, y: 0.72, text: 'ln', tone: 'accent', anchor: 'start' },
            ],
            points: [
              { x: 0, y: 1, label: '(0;1)', tone: 'good', labelPos: 'left' },
              { x: 1, y: E, label: '(1;e)', tone: 'good', labelPos: 'above' },
              { x: 1, y: 0, label: '(1;0)', tone: 'accent', labelPos: 'below' },
              { x: E, y: 1, label: '(e;1)', tone: 'accent', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Le cas particulier a=e : exp et ln, symétriques par rapport à y=x. Les points ' +
              'remarquables se répondent deux à deux — (0;1) et (1;e) sur exp deviennent (1;0) ' +
              'et (e;1) sur ln, coordonnées échangées.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — réécrire une exponentielle avec une base choisie',
          blocks: [
            {
              kind: 'para',
              text:
                'Toute fonction $f(x) = r \\cdot a^{sx+t}$ ($a>0$, $a \\neq 1$, et $r,s,t$ ' +
                'réels) peut s\'écrire $f(x) = C \\cdot b^{kx}$ dans n\'importe quelle autre ' +
                'base $b>0$, $b \\neq 1$. Voici la justification, ligne par ligne :',
            },
            { kind: 'para', text: '$f(x) = r \\cdot a^{sx+t}$' },
            {
              kind: 'para',
              text:
                '$= \\left(r \\cdot a^{t}\\right) \\cdot a^{sx}$ — on **sépare l\'exposant** : ' +
                'par $a^{p+q} = a^p \\cdot a^q$ (chapitre 2), $a^{sx+t} = a^{sx} \\cdot a^{t}$, ' +
                'et $a^{t}$ est une constante que l\'on regroupe avec $r$',
            },
            {
              kind: 'para',
              text:
                '$= \\left(r \\cdot a^{t}\\right) \\cdot b^{\\,(s \\cdot \\log_b(a))\\,x}$ — ' +
                'changement de base pour les exponentielles appliqué à $a^{sx} = ' +
                '\\left(a^{s}\\right)^{x}$, ou directement $a^{u} = b^{\\,u \\cdot \\log_b(a)}$ ' +
                'avec $u = sx$',
            },
            {
              kind: 'para',
              text:
                '$= C \\cdot b^{kx}$ — en **posant** $C = r \\cdot a^{t}$ et ' +
                '$k = s \\cdot \\log_b(a)$, deux constantes qui ne dépendent pas de $x$. ' +
                '$\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Application numérique en base $e$, avec $f(x) = 4 \\cdot 3^{5x+2}$ (donc $r=4$, ' +
                '$a=3$, $s=5$, $t=2$) :',
            },
            {
              kind: 'para',
              text:
                '$f(x) = 4 \\cdot 3^{5x+2} = \\left(4 \\cdot 3^{2}\\right) \\cdot 3^{5x} = ' +
                '36 \\cdot 3^{5x}$ — séparation de l\'exposant, avec $4 \\cdot 3^2 = 36$',
            },
            {
              kind: 'para',
              text:
                '$= 36 \\cdot e^{\\,(5\\ln(3))\\,x} \\approx 36 \\cdot e^{5{,}493\\,x}$ — ' +
                'changement de base vers $e$, avec $k = 5\\ln(3) \\approx 5{,}493$',
            },
            {
              kind: 'para',
              text:
                'Le coefficient obtenu est ici un logarithme, ensuite arrondi. En pratique, ' +
                'quand on ajuste un modèle sur des données réelles, rien ne dit que les ' +
                'constantes de $r \\cdot a^{sx+t}$ soient plus « simples » que celles de ' +
                '$C \\cdot e^{kx}$ : les deux modèles sont strictement équivalents.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Pour aller plus loin — repère semi-logarithmique',
          text:
            'Un repère **semi-logarithmique** gradue un axe (souvent $Oy$) selon une **échelle ' +
            'logarithmique** : une même distance sépare toujours deux graduations de même ' +
            '**rapport** (entre 1 et 10, autant qu\'entre 10 et 100, ou 100 et 1 000), et non de ' +
            'même différence. Une telle échelle se construit avec le logarithme de base 10 : la ' +
            'distance entre l\'origine et une valeur $N$ vaut $\\log_{10}(N)$ — l\'origine se ' +
            'situe donc en 1, car $\\log_{10}(1)=0$. Ce type de repère représente un ' +
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
            'l\'équation **initiale** strictement positif — une solution trouvée algébriquement ' +
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
          label: 'Démonstration — égalité de deux logarithmes',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $a>0$, $a \\neq 1$, et $x,y>0$. Il s\'agit d\'une **équivalence** : il ' +
                'faut donc démontrer les deux implications séparément.',
            },
            {
              kind: 'para',
              text:
                '**1) Sens** $\\implies$ — de $\\log_a(x) = \\log_a(y)$ vers $x = y$. C\'est le ' +
                'sens utile en pratique, celui qui autorise à « supprimer les deux logarithmes ».',
            },
            {
              kind: 'para',
              text:
                'On part de l\'hypothèse et on applique $\\exp_a$ aux deux membres. C\'est ' +
                'légitime parce que $\\exp_a$ est une **fonction** : deux nombres égaux ont ' +
                'nécessairement la même image.',
            },
            {
              kind: 'para',
              text: '$\\log_a(x) = \\log_a(y) \\implies a^{\\log_a(x)} = a^{\\log_a(y)}$',
            },
            {
              kind: 'para',
              text:
                'Or **(P4)** donne $a^{\\log_a(x)} = x$ pour le membre de gauche et ' +
                '$a^{\\log_a(y)} = y$ pour celui de droite. En remplaçant :',
            },
            { kind: 'para', text: '$\\implies x = y$' },
            {
              kind: 'para',
              text:
                'Autre façon de dire exactement la même chose : $\\log_a$ est strictement ' +
                'monotone (croissante si $a>1$, décroissante si $0<a<1$), donc **injective** — ' +
                'deux nombres **distincts** ne peuvent pas avoir le même logarithme. Si leurs ' +
                'logarithmes sont égaux, c\'est donc que les nombres l\'étaient déjà.',
            },
            {
              kind: 'para',
              text:
                '**2) Sens** $\\impliedby$ — de $x = y$ vers $\\log_a(x) = \\log_a(y)$. ' +
                'Immédiat : $\\log_a$ est une fonction, elle associe une seule image à chaque ' +
                'antécédent ; deux écritures du même nombre ont donc le même logarithme. ' +
                '$\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Cas particulier $a=e$ : pour tous $x,y>0$, $\\ln(x)=\\ln(y) \\iff x=y$.',
            },
            {
              kind: 'para',
              text:
                'Attention à la portée de l\'énoncé : l\'équivalence suppose **dès le départ** ' +
                '$x>0$ et $y>0$. Appliquée à une équation où $x$ et $y$ sont des expressions en ' +
                'l\'inconnue, elle n\'est donc valable que **sur le domaine** où ces deux ' +
                'expressions sont strictement positives — d\'où l\'obligation de poser les ' +
                'conditions d\'existence avant de « supprimer les logarithmes ».',
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
          label: 'Démonstration — cas 0 < a < 1 (le sens s\'inverse)',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $0<a<1$ et $u,v>0$. On démontre l\'équivalence ' +
                '$\\log_a(u) < \\log_a(v) \\iff u > v$ ; les trois autres comparateurs s\'en ' +
                'déduisent ensuite. Les deux sens se démontrent séparément, et **chacun ' +
                's\'appuie sur une fonction différente** — c\'est le point délicat.',
            },
            {
              kind: 'para',
              text:
                '**1) Sens** $\\implies$, en s\'appuyant sur $\\exp_a$. Puisque $0<a<1$, la ' +
                'fonction $\\exp_a$ est strictement **décroissante** (chapitre 2) : appliquée ' +
                'aux deux membres d\'une inégalité stricte, elle en **inverse** le sens.',
            },
            {
              kind: 'para',
              text: '$\\log_a(u) < \\log_a(v) \\implies a^{\\log_a(u)} > a^{\\log_a(v)}$',
            },
            {
              kind: 'para',
              text:
                'Par **(P4)**, $a^{\\log_a(u)} = u$ et $a^{\\log_a(v)} = v$. En remplaçant les ' +
                'deux membres :',
            },
            { kind: 'para', text: '$\\implies u > v$' },
            {
              kind: 'para',
              text:
                '**2) Sens** $\\impliedby$, en s\'appuyant cette fois sur $\\log_a$ elle-même. ' +
                'Puisque $0<a<1$, la fonction $\\log_a$ est strictement **décroissante** sur ' +
                '$\\mathbb{R}_0^+$ (section 1) : de $u > v$ (avec $u,v>0$) on tire directement ' +
                '$\\log_a(u) < \\log_a(v)$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                '**Les trois autres comparateurs.** $\\log_a(u) \\le \\log_a(v) \\iff u \\ge v$ ' +
                's\'obtient en combinant ce qui précède avec l\'égalité de deux logarithmes ' +
                '($\\log_a(u) = \\log_a(v) \\iff u = v$, section 2) : « $\\le$ » n\'est que ' +
                '« $<$ ou $=$ », et chacun des deux cas a déjà été traité. Les comparateurs ' +
                '$>$ et $\\ge$ ne sont, eux, que les mêmes énoncés lus en échangeant les rôles ' +
                'de $u$ et $v$.',
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
                'Soient $a>1$ et $u,v>0$. On démontre cette fois ' +
                '$\\log_a(u) < \\log_a(v) \\iff u < v$. La structure est **identique** à celle ' +
                'du cas précédent : seul le sens de variation de $\\exp_a$ et de $\\log_a$ ' +
                'change, et avec lui le sens de l\'inégalité obtenue.',
            },
            {
              kind: 'para',
              text:
                '**1) Sens** $\\implies$. Puisque $a>1$, la fonction $\\exp_a$ est strictement ' +
                '**croissante** (chapitre 2) : appliquée aux deux membres, elle **conserve** le ' +
                'sens de l\'inégalité.',
            },
            {
              kind: 'para',
              text: '$\\log_a(u) < \\log_a(v) \\implies a^{\\log_a(u)} < a^{\\log_a(v)}$',
            },
            {
              kind: 'para',
              text: 'Par **(P4)**, $a^{\\log_a(u)} = u$ et $a^{\\log_a(v)} = v$, d\'où :',
            },
            { kind: 'para', text: '$\\implies u < v$' },
            {
              kind: 'para',
              text:
                '**2) Sens** $\\impliedby$. Puisque $a>1$, la fonction $\\log_a$ est strictement ' +
                '**croissante** sur $\\mathbb{R}_0^+$ (section 1) : de $u < v$ (avec $u,v>0$) on ' +
                'tire directement $\\log_a(u) < \\log_a(v)$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Les comparateurs $\\le$, $>$ et $\\ge$ se déduisent de la même façon qu\'au cas ' +
                '$0<a<1$ : par l\'égalité de deux logarithmes pour passer du strict au large, et ' +
                'par échange de $u$ et $v$ pour retourner le comparateur. Le cas $a=e$ n\'est ' +
                'qu\'un cas particulier de celui-ci, puisque $e \\approx 2{,}718 > 1$ : pour ' +
                'tous $u,v>0$, $\\ln(u) < \\ln(v) \\iff u < v$.',
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
          label: 'Démonstration — comparaison avec une constante',
          blocks: [
            {
              kind: 'para',
              text:
                'La troisième ligne de la méthode ci-dessus — $\\log_a(u) < y \\iff u > a^y$ si ' +
                '$0<a<1$ — n\'est pas un résultat nouveau : elle se **déduit** de ce qui ' +
                'précède, sans nouvelle démonstration à partir de zéro. Soient $0<a<1$, $u>0$ et ' +
                '$y$ un réel quelconque.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Le membre de droite $y$ n\'est pas encore un logarithme : on le ' +
                'réécrit comme tel. Par **(P3)**, $\\log_a(a^{y}) = y$. On peut donc remplacer ' +
                '$y$ par $\\log_a(a^{y})$ :',
            },
            { kind: 'para', text: '$\\log_a(u) < y \\iff \\log_a(u) < \\log_a(a^{y})$' },
            {
              kind: 'para',
              text:
                '**Étape 2.** Les deux membres sont maintenant des logarithmes de même base : ' +
                'c\'est exactement la situation traitée par la démonstration précédente, avec ' +
                '$v = a^{y}$ (bien strictement positif, puisqu\'une puissance de $a>0$ l\'est ' +
                'toujours). Le cas $0<a<1$ inverse le sens :',
            },
            { kind: 'para', text: '$\\iff u > a^{y} \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'Le même raisonnement en deux étapes, mené avec $a>1$, donne ' +
                '$\\log_a(u) < y \\iff u < a^{y}$ ; et les comparateurs $\\le$, $>$, $\\ge$ ' +
                's\'obtiennent de façon analogue. Cas particulier $a=e$ : pour tout $u>0$ et ' +
                'tout $y$ réel, $\\ln(u) < y \\iff u < e^{y}$.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.log, tone: 'accent', xMin: 0.075 },
              { fn: (x) => Math.log(x) / Math.log(0.5), tone: 'bad', xMin: 0.075, xMax: 6.1 },
            ],
            xMin: -0.8,
            xMax: 9,
            xTicks: [1, Math.exp(2)],
            xTickLabels: { [Math.exp(2)]: 'e²' },
            fixedYRange: { min: -2.6, max: 3.2 },
            testLine: { y: 2, points: [{ x: 0.25 }, { x: Math.exp(2) }] },
            textLabels: [
              { x: -0.72, y: 2.28, text: 'y=2', tone: 'faint', anchor: 'start' },
              { x: 0.45, y: 2.55, text: 'x=0,25', tone: 'bad', anchor: 'start' },
              { x: 8.75, y: 2.55, text: 'x=e²≈7,39', tone: 'accent', anchor: 'end' },
              { x: 8.1, y: 1.35, text: 'ln', tone: 'accent', anchor: 'start' },
              { x: 3.35, y: -2.15, text: 'log₀,₅', tone: 'bad', anchor: 'start' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Une même comparaison à la constante 2, dans deux bases. ln (base e > 1) est ' +
              'croissante : ln(x) ≤ 2 est vrai à gauche du point de rencontre, soit S = ]0;e²]. ' +
              'log₀,₅ (base < 1) est décroissante : log₀,₅(x) ≤ 2 est vrai à droite du sien, ' +
              'soit S = [0,25;+∞[. Le comparateur écrit est le même — l\'ensemble-solution part ' +
              'du côté opposé.',
          },
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
                'Soit $x>0$. La démonstration n\'utilise **aucun calcul de limite** : elle ' +
                'combine trois résultats déjà acquis, un par ligne.',
            },
            {
              kind: 'para',
              text:
                '**Le point de départ** est le théorème de dérivation d\'une fonction ' +
                'réciproque : si $f$ est dérivable et bijective, sa réciproque $f^{-1}$ vérifie ' +
                '$(f^{-1})\'(x) = \\dfrac{1}{f\'\\!\\left(f^{-1}(x)\\right)}$ — la dérivée de la ' +
                'réciproque est l\'**inverse** de la dérivée de $f$, évaluée non pas en $x$ mais ' +
                'en $f^{-1}(x)$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** On applique ce théorème à $f = \\exp$, dont la réciproque est ' +
                '$f^{-1} = \\ln$ (section 1). En remplaçant $f$ par $\\exp$ et $f^{-1}$ par ' +
                '$\\ln$ :',
            },
            { kind: 'para', text: '$\\ln\'(x) = \\dfrac{1}{\\exp\'(\\ln(x))}$' },
            {
              kind: 'para',
              text:
                '**Étape 2.** Le chapitre 2 a établi que $\\exp$ est **sa propre dérivée** : ' +
                '$\\exp\' = \\exp$. On peut donc remplacer $\\exp\'$ par $\\exp$ au ' +
                'dénominateur, sans rien changer d\'autre :',
            },
            { kind: 'para', text: '$= \\dfrac{1}{\\exp(\\ln(x))}$' },
            {
              kind: 'para',
              text:
                '**Étape 3.** Le dénominateur est maintenant $\\exp(\\ln(x))$, c\'est-à-dire ' +
                '$e^{\\ln(x)}$ : c\'est exactement **(P4)** écrite en base $e$, qui vaut $x$ ' +
                '(c\'est le fait que $\\exp$ et $\\ln$ soient réciproques, une seconde fois) :',
            },
            { kind: 'para', text: '$= \\dfrac{1}{x} \\qquad \\blacksquare$' },
            {
              kind: 'para',
              text:
                'Remarquer que la formule n\'a de sens que pour $x>0$ — ce qui est bien le ' +
                'domaine de $\\ln$ — et que $1/x > 0$ y est **toujours strictement positif** : ' +
                'c\'est la preuve formelle que $\\ln$ est strictement croissante, propriété ' +
                'jusqu\'ici seulement lue sur le graphique.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.log, tone: 'accent', xMin: 0.06 },
              { fn: (x) => 1 / x, tone: 'good', xMin: 0.26 },
            ],
            xMin: -0.7,
            xMax: 7,
            xTicks: [1],
            fixedYRange: { min: -2.8, max: 3.6 },
            textLabels: [
              { x: 5.9, y: 2.35, text: 'ln x', tone: 'accent', anchor: 'start' },
              { x: 5.9, y: 0.55, text: "ln'x=1/x", tone: 'good', anchor: 'start' },
              { x: 1.6, y: 2.9, text: "ln'(x) > 0 partout", tone: 'good', anchor: 'start' },
            ],
            points: [{ x: 1, y: 1, label: '', tone: 'good' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'ln et sa dérivée 1/x. La dérivée reste strictement positive sur tout ]0;+∞[ : ln ' +
              'est donc strictement croissante partout, y compris là où elle est négative. Et ' +
              'cette dérivée est elle-même décroissante (elle tend vers 0) : la croissance de ln ' +
              'ralentit sans jamais s\'arrêter — c\'est ce que signifie « concavité tournée vers ' +
              'le bas ».',
          },
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
          label: 'Démonstration — dérivée d\'une puissance à exposant variable',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $g$ une fonction dérivable et **strictement positive**, et $h$ une ' +
                'fonction dérivable. La stricte positivité de $g$ est indispensable : c\'est ce ' +
                'qui autorise à écrire $\\ln(g(x))$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** On réécrit la puissance en base $e$. Par **(P4)** en base $e$, ' +
                '$g(x) = e^{\\ln(g(x))}$ ; en élevant à la puissance $h(x)$ et en multipliant ' +
                'les exposants :',
            },
            {
              kind: 'para',
              text: '$\\left((g(x))^{h(x)}\\right)\' = \\left(e^{\\,h(x) \\cdot \\ln(g(x))}\\right)\'$',
            },
            {
              kind: 'para',
              text:
                '**Étape 2.** C\'est maintenant une composée $e^{u(x)}$, avec ' +
                '$u(x) = h(x) \\cdot \\ln(g(x))$. La règle de la chaîne, avec $\\exp\'=\\exp$, ' +
                'donne $(e^{u})\' = u\' \\cdot e^{u}$ :',
            },
            {
              kind: 'para',
              text:
                '$= \\left(h(x) \\cdot \\ln(g(x))\\right)\' \\cdot e^{\\,h(x) \\cdot \\ln(g(x))}$',
            },
            {
              kind: 'para',
              text:
                '**Étape 3.** L\'exposant $u$ est un **produit** de deux fonctions : on le ' +
                'dérive par la règle du produit $(pq)\' = p\'q + pq\'$, avec $p = h$ et ' +
                '$q = \\ln \\circ\\, g$ :',
            },
            {
              kind: 'para',
              text:
                '$\\left(h(x) \\cdot \\ln(g(x))\\right)\' = h\'(x) \\cdot \\ln(g(x)) + h(x) ' +
                '\\cdot \\left(\\ln(g(x))\\right)\'$',
            },
            {
              kind: 'para',
              text:
                '**Étape 4.** Le facteur restant se dérive par la règle de la chaîne établie ' +
                'plus haut : $\\left(\\ln(g(x))\\right)\' = \\dfrac{g\'(x)}{g(x)}$. En ' +
                'reportant :',
            },
            {
              kind: 'para',
              text:
                '$= h\'(x) \\cdot \\ln(g(x)) + \\dfrac{h(x) \\cdot g\'(x)}{g(x)}$',
            },
            {
              kind: 'para',
              text:
                '**Étape 5.** Il reste à revenir de $e^{\\,h(x) \\cdot \\ln(g(x))}$ à ' +
                '$(g(x))^{h(x)}$ — c\'est l\'étape 1 relue en sens inverse. En regroupant :',
            },
            {
              kind: 'para',
              text:
                '$\\left((g(x))^{h(x)}\\right)\' = \\left(h\'(x) \\cdot \\ln(g(x)) + ' +
                '\\dfrac{h(x) \\cdot g\'(x)}{g(x)}\\right) \\cdot (g(x))^{h(x)} ' +
                '\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Contrôle de cohérence sur deux cas connus. Si $h$ est **constante** égale à ' +
                '$n$, alors $h\'=0$ et il reste $\\dfrac{n \\cdot g\'}{g} \\cdot g^{n} = n \\cdot ' +
                'g^{n-1} \\cdot g\'$ : la dérivée d\'une puissance usuelle. Si $g$ est ' +
                '**constante** égale à $a>0$, alors $g\'=0$ et il reste ' +
                '$h\' \\cdot \\ln(a) \\cdot a^{h}$ : la dérivée d\'une exponentielle composée du ' +
                'chapitre 2. La formule générale contient bien les deux règles connues comme ' +
                'cas particuliers.',
            },
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
            {
              kind: 'para',
              text:
                'Soient $a>0$, $a \\neq 1$, et $x>0$. Aucun calcul nouveau n\'est nécessaire : ' +
                'il suffit de ramener $\\log_a$ à $\\ln$, dont la dérivée vient d\'être établie.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Le changement de base, appliqué avec $b=e$, exprime $\\log_a$ à ' +
                'partir de $\\ln$ seul :',
            },
            { kind: 'para', text: '$\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}$' },
            {
              kind: 'para',
              text:
                '**Étape 2.** Le point clé : $\\ln(a)$ est une **constante** — elle ne dépend ' +
                'pas de $x$. L\'écriture ci-dessus est donc simplement ' +
                '$\\dfrac{1}{\\ln(a)} \\cdot \\ln(x)$, un multiple de $\\ln$ par un nombre fixe. ' +
                'Or $(k \\cdot f)\' = k \\cdot f\'$ pour toute constante $k$ : la constante sort ' +
                'de la dérivation, et il ne reste qu\'à dériver $\\ln$.',
            },
            { kind: 'para', text: '$\\log_a\'(x) = \\dfrac{1}{\\ln(a)} \\cdot \\ln\'(x) = \\dfrac{\\ln\'(x)}{\\ln(a)}$' },
            {
              kind: 'para',
              text:
                '**Étape 3.** On remplace $\\ln\'(x)$ par sa valeur $\\dfrac{1}{x}$, démontrée ' +
                'plus haut :',
            },
            {
              kind: 'para',
              text:
                '$= \\dfrac{1}{\\ln(a)} \\cdot \\dfrac{1}{x} = \\dfrac{1}{x \\cdot \\ln(a)} ' +
                '\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Cette formule redonne, sans aucun graphique, tous les résultats de monotonie et ' +
                'de concavité de la section 1. Comme $x>0$, le signe de $\\log_a\'(x)$ est ' +
                'exactement celui de $\\ln(a)$ : **positif** si $a>1$ (donc $\\log_a$ ' +
                'croissante), **négatif** si $0<a<1$ (donc décroissante). En dérivant une ' +
                'seconde fois, $\\log_a\'\'(x) = \\dfrac{-1}{x^2 \\cdot \\ln(a)}$, de signe ' +
                '**opposé** : la concavité est tournée vers le bas si $a>1$, vers le haut si ' +
                '$0<a<1$. On retrouve ligne pour ligne le tableau de la section 1.',
            },
            {
              kind: 'para',
              text:
                'Vérification sur le cas $a=e$ : $\\ln(e)=1$ par **(P2)**, donc ' +
                '$\\log_e\'(x) = \\dfrac{1}{x \\cdot 1} = \\dfrac{1}{x}$ — bien la dérivée de ' +
                '$\\ln$. C\'est exactement ce qui rend la base $e$ commode : elle est **la ' +
                'seule** pour laquelle le facteur $1/\\ln(a)$ disparaît.',
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
            curves: [
              { fn: Math.sqrt, tone: 'good', xMin: 0 },
              { fn: Math.cbrt, tone: 'bad', xMin: 0 },
              { fn: Math.log, tone: 'accent', xMin: 0.05 },
            ],
            xMin: -10,
            xMax: 220,
            xTicks: [100, 200],
            fixedYRange: { min: -3.5, max: 16 },
            textLabels: [
              { x: 8, y: 14.6, text: 'y=√x', tone: 'good', anchor: 'start' },
              { x: 8, y: 12.6, text: 'y=∛x', tone: 'bad', anchor: 'start' },
              { x: 8, y: 10.6, text: 'y=ln x', tone: 'accent', anchor: 'start' },
              { x: 55, y: 2, text: 'ln repasse sous ∛x (x≈93)', tone: 'accent', anchor: 'start' },
            ],
            points: [{ x: 93.3, y: Math.log(93.3), label: '', tone: 'accent' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'ln comparée à deux fonctions « racines », elles-mêmes déjà très lentes. La racine ' +
              'carrée reste au-dessus de ln pour tout x>0. La racine cubique, elle, se laisse ' +
              'brièvement dépasser (entre x≈6 et x≈93) — mais finit par repasser devant et ne ' +
              'redescend plus jamais : ln croît plus lentement que √x, que ∛x, et plus ' +
              'généralement que toute puissance x^k avec k>0, aussi petit soit k.',
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
            'Le mot important est **« finit par »** : sur un intervalle borné, l\'ordre observé ' +
              'peut être tout autre. Les deux graphiques ci-dessous montrent exactement ce ' +
              'décalage entre ce qu\'on voit près de l\'origine et ce qui se passe réellement ' +
              'en $+\\infty$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'faint' },
              { fn: (x) => x * x, tone: 'good', xMax: 3.28 },
              { fn: (x) => x * x * x, tone: 'bad', xMin: -1.27, xMax: 2.2 },
              { fn: Math.exp, tone: 'accent', xMax: 2.36 },
            ],
            xMin: -1.6,
            xMax: 3.6,
            xTicks: [1, 2, 3],
            fixedYRange: { min: -2, max: 10.5 },
            textLabels: [
              { x: -1.55, y: 9.6, text: 'y=eˣ', tone: 'accent', anchor: 'start' },
              { x: -1.55, y: 8.4, text: 'y=x³', tone: 'bad', anchor: 'start' },
              { x: -1.55, y: 7.2, text: 'y=x²', tone: 'good', anchor: 'start' },
              { x: -1.55, y: 6, text: 'y=x', tone: 'faint', anchor: 'start' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Vue rapprochée. Sur cette fenêtre, eˣ ne domine pas du tout : x³ la rattrape en ' +
              'x≈1,86 et passe devant, pour ne repasser derrière que bien plus loin. Conclure ' +
              'ici « eˣ croît moins vite que x³ » serait une erreur de lecture — il faut ' +
              'regarder plus loin, ce que fait le graphique suivant.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'faint' },
              { fn: (x) => x * x, tone: 'good' },
              { fn: (x) => x * x * x, tone: 'bad', xMin: -1.2 },
              { fn: Math.exp, tone: 'accent', xMax: 6.15 },
            ],
            xMin: -1.8,
            xMax: 6.2,
            xTicks: [2, 4, 6],
            fixedYRange: { min: -45, max: 440 },
            textLabels: [
              { x: -1.75, y: 415, text: 'y=eˣ', tone: 'accent', anchor: 'start' },
              { x: -1.75, y: 355, text: 'y=x³', tone: 'bad', anchor: 'start' },
              { x: -1.75, y: 295, text: 'y=x²', tone: 'good', anchor: 'start' },
              { x: -1.75, y: 235, text: 'y=x', tone: 'faint', anchor: 'start' },
            ],
            points: [
              { x: 4.5364, y: Math.exp(4.5364), label: 'eˣ dépasse x³', tone: 'accent', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Même famille de courbes, fenêtre élargie (attention : l\'échelle verticale va ' +
              'maintenant jusqu\'à 440). eˣ rattrape puis dépasse définitivement x³ en x≈4,54, ' +
              'et s\'en écarte ensuite de plus en plus vite. Pendant ce temps y=x et y=x², ' +
              'écrasées par le changement d\'échelle, semblent confondues avec l\'axe — c\'est ' +
              'précisément ce que veut dire « dominées ».',
          },
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
