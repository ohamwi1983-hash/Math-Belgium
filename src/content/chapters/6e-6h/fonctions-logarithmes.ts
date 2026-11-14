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
    "transforme une somme en produit, $\\ln$ transforme un produit en somme. Il te permet de " +
    "« défaire » une exponentielle — et rend enfin accessibles les équations, comparaisons et " +
    "modèles où l'inconnue se cache dans un exposant.",

  sections: [
    {
      id: 'proprietes',
      number: 1,
      title: 'Propriétés du logarithme',
      kicker: 'réciproque de exp_a, propriétés algébriques, changement de base',
      blocks: [
        { kind: 'video', title: 'Définition du logarithme et premières propriétés (1/4)', youtubeId: 'Xg5LQ6_GBRg' },
        { kind: 'video', title: 'Propriétés algébriques : produit, quotient, puissance (2/4)', youtubeId: 'nei3-hTjJl4' },
        { kind: 'video', title: 'Changement de base (3/4)', youtubeId: 'tXCMV-nBNVk' },
        { kind: 'video', title: 'Le logarithme népérien ln = log_e (4/4)', youtubeId: 's1JTV94t6D8' },
        { kind: 'subheading', text: 'Définition : l\'exposant qu\'il faut donner à a' },
        {
          kind: 'intuition',
          label: 'La question que pose un logarithme',
          text:
            "Une exponentielle $a^x$ répond à la question « $a$ multiplié par lui-même $x$ " +
            "fois, ça donne quoi ? ». Le logarithme pose la question **inverse** : « par " +
            "combien de fois faut-il multiplier $a$ par lui-même pour tomber sur ce nombre " +
            "précis ? ». $\\log_a(x)$, c'est exactement cette réponse — l'exposant à donner à " +
            "$a$ pour obtenir $x$.",
        },
        {
          kind: 'para',
          text:
            'Au chapitre 2, tu as vu que $\\exp_a$ ($a>0$, $a \\neq 1$) est strictement ' +
            'croissante si $a>1$, et strictement décroissante si $0<a<1$. Dans les deux cas, ' +
            'elle est strictement monotone, donc **injective** : elle admet une fonction ' +
            'réciproque. On l\'appelle **logarithme de base a**, notée $\\log_a$ — et elle ' +
            'existe pour **toute** base $a>0$, $a \\neq 1$.',
        },
        {
          kind: 'definition',
          label: 'Définition — logarithme de base a',
          items: [
            'Pour $a>0$, $a \\neq 1$, $\\log_a$ est l\'unique fonction définie sur ' +
              '$\\mathbb{R}_0^+ = ]0;+\\infty[$ qui vérifie, pour tout $x>0$ et tout $y \\in ' +
              '\\mathbb{R}$ : $\\log_a(x) = y \\iff a^y = x$. Retiens bien cette équivalence : ' +
              'c\'est le **principe d\'équivalence fondamental**, tout le chapitre s\'appuie ' +
              'dessus. Il dit juste ceci : le logarithme de base $a$ d\'un réel strictement ' +
              'positif, c\'est l\'exposant à donner à $a$ pour retomber sur ce réel.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Vingt ans de calculs pour en épargner aux autres',
          text:
            "En 1614, l'Écossais **John Napier** (ou Neper) publie Mirifici Logarithmorum " +
            'Canonis Descriptio, un ouvrage où il introduit pour la première fois le concept ' +
            "de logarithme. Son objectif est concret : à une époque où astronomes et " +
            'navigateurs passent des heures à multiplier de grands nombres à la main, Napier ' +
            'cherche un moyen de remplacer ces multiplications par de simples additions. Il ' +
            "aurait passé plus de vingt ans à calculer, à la main, les tables de logarithmes " +
            "nécessaires — un travail titanesque, achevé juste avant sa mort en 1617. Le mot " +
            '« logarithme » lui-même vient du grec logos (rapport) et arithmos (nombre).',
          image: {
            src: '/images/historique/napier.jpg',
            alt: 'Portrait de John Napier',
            caption: "John Napier (1550–1617), portrait d'époque, auteur du logarithme.",
          },
        },
        {
          kind: 'definition',
          label: 'Propriétés immédiates',
          items: [
            'Quatre égalités se lisent directement sur le principe d\'équivalence ci-dessus. ' +
              'Valables pour toute base $a>0$, $a \\neq 1$, tout $x>0$ et tout ' +
              '$r \\in \\mathbb{R}$ :',
            '**(P1)** $\\log_a(1) = 0$ — car $a^0 = 1$.',
            '**(P2)** $\\log_a(a) = 1$ — car $a^1 = a$.',
            '**(P3)** $\\log_a(a^r) = r$ — logique : l\'exposant à donner à $a$ pour obtenir ' +
              '$a^r$, c\'est $r$ ! $\\log_a$ **défait** $\\exp_a$.',
            '**(P4)** $a^{\\log_a(x)} = x$ — pose $y = \\log_a(x)$ : le principe ' +
              'd\'équivalence donne directement $a^y = x$. $\\exp_a$ **défait** $\\log_a$.',
            'Retiens bien ces quatre propriétés : tu t\'appuieras dessus dans **toutes** les ' +
              'démonstrations de ce chapitre, citées par leur numéro, (P1) à (P4).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'calculer un logarithme',
          formula:
            'Calcule, sans calculatrice : $\\log_2(32)$, $\\log_3\\left(\\dfrac{1}{81}\\right)$, ' +
            '$\\log_4(8)$, $\\log_{1/2}(8)$ et $\\log_{10}(0{,}001)$.',
          steps: [
            { tag: 'écrire l\'argument comme une puissance de la base', text: '$32 = 2^5$ et $\\dfrac{1}{81} = 3^{-4}$' },
            { tag: 'une base qui n\'est pas « visible »', text: '$8 = 2^3 = \\left(4^{1/2}\\right)^3 = 4^{3/2}$ et $8 = 2^3 = \\left(\\dfrac{1}{2}\\right)^{-3}$' },
            { tag: 'puissance de 10', text: '$0{,}001 = 10^{-3}$' },
          ],
          result: {
            tag: 'résultat — lire l\'exposant (P3)',
            text:
              '$\\log_2(32) = 5$, $\\log_3\\left(\\dfrac{1}{81}\\right) = -4$, $\\log_4(8) = \\dfrac{3}{2}$, ' +
              '$\\log_{1/2}(8) = -3$, $\\log_{10}(0{,}001) = -3$.',
          },
        },
        { kind: 'subheading', text: 'Graphique et réciprocité avec expₐ' },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
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
          kind: 'intuition',
          label: 'Pourquoi le domaine s\'arrête pile en 0',
          text:
            "Ce n'est pas une règle arbitraire à mémoriser : $\\log_a(x)$ demande à quelle " +
            "puissance élever $a$ pour obtenir $x$. Or une puissance d'un nombre $a>0$ ne " +
            "peut **jamais** valoir 0, ni encore moins un nombre négatif — quel que soit " +
            "l'exposant que tu essaies, positif, négatif ou nul, le résultat reste " +
            "strictement positif. Il n'existe donc aucune réponse à donner si $x \\le 0$ : le " +
            "domaine $]0;+\\infty[$ n'est pas un choix, c'est une conséquence directe de la " +
            "question posée.",
        },
        {
          kind: 'definition',
          label: 'Caractéristiques graphiques',
          items: [
            'Pour **toute** base $a>0$, $a \\neq 1$ : $\\text{dom}\\ \\log_a = \\mathbb{R}_0^+$, ' +
              '$\\text{im}\\ \\log_a = \\mathbb{R}$. Un point commun à **toutes** les fonctions ' +
              'logarithmes, quelle que soit leur base : $(1;0)$, puisque $\\log_a(1)=0$. L\'axe ' +
              '$Oy$ est une asymptote verticale ($x=0$) — et il n\'y en a **aucune autre**.',
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
          kind: 'intuition',
          label: 'Le pont avec le chapitre sur les exponentielles',
          text:
            "log et exp ne sont pas juste deux fonctions qui se ressemblent : ce sont des " +
            "**réciproques** l'une de l'autre, exactement comme tu l'as déjà vu pour d'autres " +
            "couples de fonctions. Concrètement, ça veut dire que leurs deux graphiques sont " +
            "**symétriques par rapport à la droite** $y=x$ — ce que montrent les deux figures " +
            "ci-dessous. Défaire une exponentielle, c'est prendre son logarithme ; défaire un " +
            "logarithme, c'est en prendre l'exponentielle. Tu vas t'appuyer sur cet " +
            "aller-retour dans tout le reste du chapitre.",
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
          kind: 'atelier',
          tag: 'log-exp-miroir-widget',
          label: 'Manipule toi-même — le miroir expₐ / logₐ',
          caption:
            'Fais glisser r : le point (r ; aʳ) sur expₐ a toujours son symétrique (aʳ ; r) ' +
            'sur logₐ. Coche « Afficher les tangentes » : elles sont symétriques elles ' +
            'aussi, et leurs pentes sont inverses (m et 1/m). Appuie sur « a = e » : la ' +
            'pente de ln en x vaut exactement 1/x — c\'est (ln x)′ = 1/x, démontré à la ' +
            'section 4.',
        },
        { kind: 'subheading', text: 'Propriétés algébriques' },
        {
          kind: 'intuition',
          label: 'L\'astuce qui a rendu le log indispensable, avant les calculatrices',
          text:
            'Multiplier deux grands nombres à la main, c\'est long et source d\'erreurs. ' +
            'Additionner, beaucoup moins. Or le logarithme **transforme une multiplication en ' +
            'addition** ($\\log_a(xy)=\\log_a(x)+\\log_a(y)$, démontré juste en dessous) : ' +
            'pendant des siècles, avant l\'invention des calculatrices, ingénieurs et savants ' +
            'ont utilisé des tables de logarithmes — et la fameuse **règle à calcul** — pour ' +
            'remplacer des multiplications pénibles par de simples additions, bien plus ' +
            'rapides et bien plus fiables.',
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
            'Racine $n$-ième ($n \\geq 2$ entier) — cas particulier de la puissance avec ' +
              '$r = 1/n$, puisque $\\sqrt[n]{x} = x^{1/n}$ : $\\log_a\\!\\left(\\sqrt[n]{x}\\right) = ' +
              '\\dfrac{\\log_a(x)}{n}$ (par exemple $\\ln(\\sqrt{x}) = \\tfrac{1}{2}\\ln(x)$).',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — logarithme d\'un produit',
          blocks: [
            {
              kind: 'para',
              text:
                'Prends $a>0$, $a \\neq 1$, et $x,y>0$. Toute la démonstration tient en une ' +
                'seule idée : réécris $x$ et $y$ comme des **puissances de la base** $a$, puis ' +
                'réutilise les règles de calcul sur les exposants du chapitre 2.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Par **(P4)**, $x = a^{\\log_a(x)}$ et $y = a^{\\log_a(y)}$. ' +
                'Remplace $x$ et $y$ par ces écritures dans $\\log_a(xy)$ :',
            },
            {
              kind: 'para',
              text: '$\\log_a(xy) = \\log_a\\!\\left(a^{\\log_a(x)} \\cdot a^{\\log_a(y)}\\right)$',
            },
            {
              kind: 'para',
              text:
                '**Étape 2.** L\'argument est maintenant un produit de deux puissances de même ' +
                'base $a$. La propriété des puissances $a^p \\cdot a^q = a^{p+q}$ (chapitre 2) ' +
                'permet de n\'en garder qu\'une seule, en **additionnant** les exposants :',
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
                'somme**. Tout s\'est joué au passage de $\\cdot$ à $+$, à l\'étape 2 — les ' +
                'étapes 1 et 3 ne servent qu\'à entrer puis sortir de l\'écriture « puissance ' +
                'de $a$ ».',
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
                'Prends $a>0$, $a \\neq 1$, $x>0$ et $r \\in \\mathbb{R}$. Même schéma en trois ' +
                'étapes que pour le produit, avec cette fois la propriété des puissances ' +
                'relative à une puissance de puissance.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Par **(P4)**, $x = a^{\\log_a(x)}$. Remplace $x$ par cette ' +
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
                'Le logarithme **transforme une puissance en produit** : l\'exposant $r$ ' +
                '« descend » devant le logarithme. Tu vas t\'appuyer sur cette propriété en ' +
                'section 2, pour faire sortir l\'inconnue d\'un exposant.',
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
                'Prends $a>0$, $a \\neq 1$, et $x,y>0$. Le schéma est rigoureusement le même que ' +
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
                'Tu aurais aussi pu déduire ce résultat des deux précédents, sans repartir de ' +
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
          kind: 'exemple',
          badge: 'développer un logarithme',
          formula: 'Développe $\\ln\\left(\\dfrac{x^3\\sqrt{y}}{z^2}\\right)$, pour $x,y,z>0$.',
          steps: [
            { tag: 'quotient', text: '$\\ln\\left(\\dfrac{x^3\\sqrt{y}}{z^2}\\right) = \\ln\\left(x^3\\sqrt{y}\\right) - \\ln\\left(z^2\\right)$' },
            { tag: 'produit', text: '$= \\ln\\left(x^3\\right) + \\ln\\left(\\sqrt{y}\\right) - \\ln\\left(z^2\\right)$' },
          ],
          result: { tag: 'puissance et racine', text: '$= 3\\ln(x) + \\dfrac{1}{2}\\ln(y) - 2\\ln(z)$' },
        },
        {
          kind: 'exemple',
          badge: 'réduire en un seul logarithme',
          formula: 'Écris $2\\ln(3) - \\ln(6) + \\ln(4)$ sous la forme d\'un seul logarithme.',
          steps: [
            { tag: 'faire rentrer les coefficients (puissance)', text: '$2\\ln(3) = \\ln\\left(3^2\\right) = \\ln(9)$' },
            { tag: 'regrouper (produit et quotient)', text: '$\\ln(9) - \\ln(6) + \\ln(4) = \\ln\\left(\\dfrac{9\\times4}{6}\\right)$' },
          ],
          result: { tag: 'résultat', text: '$2\\ln(3) - \\ln(6) + \\ln(4) = \\ln(6)$' },
        },
        {
          kind: 'attention',
          label: 'Attention — les propriétés supposent des arguments strictement positifs',
          text:
            '$\\ln\\left(x^2\\right) = 2\\ln(x)$ n\'est vrai que si $x > 0$. Or $\\ln\\left(x^2\\right)$ existe pour ' +
            'tout $x \\neq 0$ : la bonne écriture est $\\ln\\left(x^2\\right) = 2\\ln|x|$. De même, ' +
            '$\\ln\\big(x(x-3)\\big)$ existe si $x < 0$ ou $x > 3$, alors que $\\ln(x) + \\ln(x-3)$ n\'existe que ' +
            'si $x > 3$. Regrouper ou séparer des logarithmes peut donc **changer le domaine** — c\'est ' +
            'l\'origine des solutions parasites de la section 2.',
        },
        { kind: 'subheading', text: 'Changement de base' },
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
              text: 'Prends $a,b>0$ avec $a \\neq 1$ et $b \\neq 1$, et $x$ un réel quelconque.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Réécris d\'abord la **base** $a$ comme une puissance de $b$. ' +
                'Comme $a>0$, la propriété **(P4)** appliquée en base $b$ donne ' +
                '$a = b^{\\log_b(a)}$. Élève les deux membres à la puissance $x$ :',
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
              'Changement de base en action : $3^x = 2^{x\\log_2 3}$. La hauteur 3, atteinte par $3^x$ ' +
              'dès x=1, n\'est atteinte par $2^x$ qu\'en $x=\\log_2 3 \\approx 1{,}58$ — le graphique de $3^x$ ' +
              's\'obtient donc à partir de celui de $2^x$ en divisant toutes les abscisses par ' +
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
                'Prends $a,b>0$ avec $a \\neq 1$ et $b \\neq 1$, et $x>0$. **Pose** ' +
                '$y = \\log_a(x)$ : démontrer la formule revient alors à calculer $y$ en ' +
                'fonction de logarithmes de base $b$ uniquement. Voici la chaîne d\'égalités ' +
                'équivalentes, une idée par ligne.',
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
                '**Étape 2.** Applique au membre de gauche le changement de base pour les ' +
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
                'qu\'en 1, et $a \\neq 1$ par hypothèse. Tu peux donc diviser les deux membres ' +
                'par $\\log_b(a)$ :',
            },
            { kind: 'para', text: '$y = \\dfrac{\\log_b(x)}{\\log_b(a)}$' },
            {
              kind: 'para',
              text:
                'Comme $y = \\log_a(x)$ par construction, tu conclus $\\log_a(x) = ' +
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
          kind: 'historique',
          titre: 'Un simple choix de base, devenu la norme mondiale',
          text:
            "En 1615, l'Anglais **Henry Briggs** voyage jusqu'en Écosse pour rencontrer " +
            'Napier en personne. Les deux hommes s\'accordent sur une amélioration ' +
            "décisive : les tables originales de Napier n'utilisaient pas la base 10, ce qui " +
            'compliquait les calculs pratiques. Briggs propose de tout recalculer avec ' +
            '$\\log_{10}$ comme base de référence — le **logarithme décimal** (ou ' +
            '« logarithme vulgaire »), visible dans le graphique ci-dessus. Il publiera ' +
            'lui-même, en 1624, une table de logarithmes décimaux de 30 000 nombres ' +
            "calculés à 14 décimales près, entièrement à la main. C'est cette base 10, " +
            'choisie pour sa commodité pratique plutôt que pour une raison mathématique ' +
            'profonde, qui reste la plus utilisée aujourd\'hui en dehors des sciences (où ' +
            '$e$ domine) et de l\'informatique (où 2 domine).',
          image: {
            src: '/images/historique/briggs.jpg',
            alt: 'Portrait de Henry Briggs',
            caption: "Henry Briggs (1561–1630), portrait d'époque, inventeur du logarithme décimal.",
          },
        },
        { kind: 'subheading', text: 'Le logarithme népérien' },
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
            'théorème démontré juste après. Tu notes donc $\\ln$ plutôt que $\\log_e$. Le ' +
            'changement de base ci-dessus, avec $b=e$, donne alors une écriture de **tout** ' +
            'logarithme uniquement à l\'aide de $\\ln$ : $\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}$. ' +
            'C\'est cette écriture qui rend $\\ln$ si pratique : une calculatrice n\'a souvent ' +
            'qu\'une touche $\\ln$. Pour obtenir $\\log_2(10)$ par exemple, tu calcules ' +
            '$\\ln(10)/\\ln(2) \\approx 3{,}32$.',
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
                'Prends $a>0$, $a \\neq 1$. L\'idée : **calculer la dérivée de** $\\exp_a$ ' +
                '**de deux façons différentes**, puis identifier les deux résultats.',
            },
            {
              kind: 'para',
              text:
                '**Premier calcul** — via le changement de base. Le théorème démontré plus haut, ' +
                'appliqué avec $b=e$, donne $a^x = e^{\\,x \\cdot \\log_e(a)}$. Dérive cette ' +
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
                '$a^x > 0$ (jamais nul), tu peux diviser les deux membres par $a^x$ :',
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
          kind: 'application',
          titre: 'Mesurer l\'information en bits avec le logarithme en base 2',
          image: {
            src: '/images/application/punchcard.png',
            alt: 'Carte perforée, chaque trou codant un bit d\'information',
            caption: 'Une carte perforée : chaque position codait un bit (trou ou pas de trou), l\'unité même que log₂(N) permet de compter. Domaine public.',
          },
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -0.3,
              xMax: 7.5,
              yMin: -0.8,
              yMax: 3.8,
              vectors: [
                { from: { x: 0, y: 3 }, to: { x: 7, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 4, y: 2 }, to: { x: 7, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 6, y: 1 }, to: { x: 7, y: 1 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 7, y: 0, label: 'trouvé !', tone: 'good', labelPos: 'below' },
                { x: 0, y: 3.35, label: '8 possibilités', tone: 'accent', labelPos: 'right', node: false },
                { x: 0, y: 2.35, label: '4 restantes — question 1', tone: 'accent', labelPos: 'right', node: false },
                { x: 0, y: 1.35, label: '2 restantes — question 2', tone: 'accent', labelPos: 'right', node: false },
              ],
              caption:
                'Deviner un chiffre parmi 8 (0 à 7) en demandant à chaque fois « c\'est dans ' +
                'la moitié haute ou basse ? » : 3 questions suffisent toujours — exactement ' +
                'log₂(8) = 3 bits.',
            },
          ],
          text:
            "En informatique, la quantité d'information nécessaire pour distinguer N " +
            'possibilités égales se mesure en bits par $\\log_2(N)$ — le changement de base ' +
            'que tu viens de voir est donc utilisé en permanence : ' +
            '$\\log_2(N) = \\dfrac{\\ln(N)}{\\ln(2)}$. Par exemple, pour coder un chiffre ' +
            'parmi 8 possibilités (0 à 7), il faut $\\log_2(8)=3$ bits — exactement le ' +
            'nombre de questions « oui/non » nécessaires pour deviner le bon chiffre en ' +
            'cherchant par dichotomie (en divisant à chaque fois les possibilités restantes ' +
            'par 2). Cette idée, formalisée par l\'ingénieur **Claude Shannon** en 1948 dans ' +
            'sa théorie de l\'information, est au fondement de toute l\'informatique ' +
            'moderne : compression de fichiers, codes correcteurs d\'erreurs, et taille des ' +
            'mots mémoire des ordinateurs.',
          domaines: ['Informatique', 'Théorie de l\'information'],
        },
        { kind: 'subheading', text: 'Échelles logarithmiques' },
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
          kind: 'atelier',
          tag: 'echelle-semi-log-widget',
          label: 'Manipule toi-même — repère normal ou semi-logarithmique',
          caption:
            'La même croissance exponentielle, dans deux repères. En repère normal, la ' +
            'courbe se creuse et une série en écrase vite une autre. En repère ' +
            'semi-logarithmique, chaque série devient une droite, dont la pente donne ' +
            'directement le taux r. Ajoute une 2ᵉ série pour comparer deux taux.',
        },
        {
          kind: 'historique',
          titre: 'Une règle à calcul... construite entièrement sur cette propriété',
          text:
            "Dès 1622, l'Anglais **William Oughtred** exploite directement la propriété " +
            '$\\log(ab) = \\log(a) + \\log(b)$ pour inventer la règle à calcul : deux ' +
            "réglettes graduées selon une échelle logarithmique, qu'on fait glisser l'une " +
            'contre l\'autre pour transformer physiquement une multiplication en une simple ' +
            "addition de longueurs. L'outil reste indispensable aux ingénieurs, architectes " +
            "et même aux équipes de la mission Apollo pendant plus de trois siècles, jusqu'à " +
            'ce que les calculatrices électroniques de poche, dans les années 1970, le ' +
            'rendent obsolète presque du jour au lendemain.',
          image: {
            src: '/images/historique/oughtred.jpg',
            alt: 'Portrait de William Oughtred',
            caption:
              'William Oughtred (1574–1660), gravure de Wenceslaus Hollar, inventeur de la ' +
              'règle à calcul.',
          },
        },
        {
          kind: 'atelier',
          tag: 'regle-a-calcul-widget',
          label: 'Manipule toi-même — la règle à calcul',
          caption:
            'La règle à calcul transforme une multiplication en addition de longueurs : ' +
            'chaque nombre N est placé à la distance log N. Place l\'index de la réglette ' +
            'mobile sous a, puis lis au-dessus de b : log a + log b = log(ab). Si le ' +
            'produit dépasse 10, on utilise l\'index 10 et on multiplie la lecture par 10.',
        },
        {
          kind: 'entrainement',
          title: 'Propriétés du logarithme',
          generatorId: '6gen13',
          description: [
            'Reconnais à chaque étape la propriété qui s\'applique (produit, quotient, ' +
              'puissance, racine, changement de base), puis applique-la pour décomposer une ' +
              'expression logarithmique, étape par étape.',
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
        { kind: 'video', title: 'Résoudre une équation exponentielle ou logarithmique', youtubeId: 'X26gAVNimiU' },
        {
          kind: 'para',
          text:
            'Deux nouvelles techniques s\'ajoutent à l\'identification de bases vue au ' +
            'chapitre 2 : applique $\\log_a$ aux deux membres d\'une équation exponentielle de ' +
            'base $a$, ou $\\exp_a$ aux deux membres d\'une équation logarithmique de base $a$ ' +
            '— puisque les deux fonctions sont réciproques l\'une de l\'autre, pour **toute** ' +
            'base $a>0$, $a \\neq 1$.',
        },
        {
          kind: 'methode',
          label: 'Méthode 1 — équation exponentielle',
          items: [
            'Pour $a^x = b$ ($a>0$, $a \\neq 1$, $b>0$), applique $\\log_a$ aux deux membres ' +
              '— ce qui donne directement x, par définition même de $\\log_a$ comme réciproque ' +
              'de $\\exp_a$ : $\\log_a(a^x) = \\log_a(b) \\implies x = \\log_a(b)$.',
            'Tu préfères une valeur décimale approchée ? Le changement de base ramène ce ' +
              'résultat à $x = \\ln(b)/\\ln(a)$, directement calculable.',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [{ kind: 'para', text: '$3^x = 20 \\implies x = \\log_3(20) = \\dfrac{\\ln(20)}{\\ln(3)} \\approx 2{,}727$' }],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — deux bases différentes',
          blocks: [
            { kind: 'para', text: '$2^{x+1} = 3^x$' },
            {
              kind: 'para',
              text:
                'Les deux membres sont strictement positifs : applique $\\ln$ aux deux membres, puis ' +
                'la propriété de la puissance : $(x+1)\\ln(2) = x\\ln(3)$.',
            },
            {
              kind: 'para',
              text:
                'Regroupe les termes en x : $x\\ln(3) - x\\ln(2) = \\ln(2)$, soit ' +
                '$x\\big(\\ln(3) - \\ln(2)\\big) = \\ln(2)$, donc ' +
                '$x = \\dfrac{\\ln(2)}{\\ln(3) - \\ln(2)} = \\dfrac{\\ln(2)}{\\ln(3/2)} \\approx 1{,}71$.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode 2 — équation logarithmique',
          items: [
            'Pour $\\log_a(u) = b$ ($a>0$, $a \\neq 1$), applique $\\exp_a$ des deux côtés : ' +
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
            'Après avoir résolu par $\\log_a$ ou $\\exp_a$ (quelle que soit la base $a$), ' +
            'vérifie **toujours** que la solution garde chaque argument de logarithme de ' +
            'l\'équation **initiale** strictement positif ! Une solution trouvée ' +
            'algébriquement peut violer cette condition — il faut alors la rejeter.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — condition d\'existence sur un argument du second degré',
          blocks: [
            { kind: 'para', text: '$\\log_3(2w^2-1) = 4$' },
            {
              kind: 'para',
              text:
                'CE : $2w^2-1>0$, c\'est-à-dire $w < -\\sqrt{2}/2$ ou $w > \\sqrt{2}/2$. Écris ' +
                'ensuite les égalités équivalentes, une par une :',
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
                'Prends $a>0$, $a \\neq 1$, et $x,y>0$. C\'est une **équivalence** : il faut ' +
                'donc démontrer les deux implications séparément.',
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
                'Pars de l\'hypothèse et applique $\\exp_a$ aux deux membres. C\'est légitime ' +
                'parce que $\\exp_a$ est une **fonction** : deux nombres égaux ont nécessairement ' +
                'la même image.',
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
          label: 'Exemple résolu — regrouper deux logarithmes, puis vérifier la CE',
          blocks: [
            { kind: 'para', text: '$\\log_2(x) + \\log_2(x-2) = 3$' },
            { kind: 'para', text: 'CE : $x > 0$ et $x - 2 > 0$, donc $x > 2$.' },
            {
              kind: 'para',
              text:
                'Regroupe (logarithme d\'un produit) : $\\log_2\\big(x(x-2)\\big) = 3 \\iff x(x-2) = 2^3 = 8 ' +
                '\\iff x^2 - 2x - 8 = 0 \\iff (x-4)(x+2) = 0$.',
            },
            {
              kind: 'para',
              text:
                '$x = -2$ vérifie l\'équation **regroupée** (car $(-2)(-4) = 8$), mais pas l\'équation de ' +
                'départ : $\\log_2(-2)$ n\'existe pas. Elle est **rejetée** par la CE. Vérification de ' +
                '$x = 4$ : $\\log_2(4) + \\log_2(2) = 2 + 1 = 3$. $S = \\{4\\}$.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'solution-parasite-log-widget',
          label: 'Manipule toi-même — d\'où vient la solution parasite ?',
          caption:
            'Compare l\'équation de départ et sa forme regroupée : là où les deux existent, ' +
            'leurs courbes coïncident. Mais la forme regroupée existe aussi sur une autre ' +
            'branche, où la droite y = k la coupe une seconde fois : c\'est la solution ' +
            'parasite. Le domaine de l\'équation de départ suffit à l\'écarter. Le second ' +
            'onglet compare 2·ln(x) et ln(x²).',
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
          kind: 'methode',
          label: 'Équation toujours vraie ou jamais vraie',
          items: [
            'Après avoir combiné les logarithmes et égalé les arguments, confronte **toujours** le ' +
              'résultat à la condition d\'existence (CE) de l\'équation **de départ**. Trois issues ' +
              'mènent à un ensemble-solution particulier :',
            '**La solution trouvée viole la CE** : elle est rejetée — si c\'était la seule, ' +
              '$S = \\varnothing$.',
            '**L\'équation simplifiée n\'a aucune solution réelle**, par exemple $x^2 = $ un nombre ' +
              'négatif : $S = \\varnothing$, alors que la CE, elle, n\'est pas vide.',
            '**L\'équation se réduit à une identité** ($0 = 0$, ou ' +
              '$\\log_a(A) + \\log_a(B) = \\log_a(AB)$) : elle est vraie pour **tout** $x$ de la CE, ' +
              'et **seulement** là — $S$ est la CE tout entière, jamais $\\mathbb{R}$.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Résoudre une équation exponentielle ou logarithmique',
          generatorId: '6gen14',
          description: [
            'Résous une équation exponentielle ou logarithmique en appliquant log_a ou exp_a ' +
              'aux deux membres, puis confronte le résultat à la condition d\'existence : ' +
              'solution rejetée, aucune solution, ou identité vraie sur toute la CE.',
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
        { kind: 'video', title: 'Résoudre une inéquation logarithmique', youtubeId: 'te3WQrHiU1c' },
        {
          kind: 'intuition',
          label: 'Le même réflexe qu\'avec les exponentielles',
          text:
            "Tu as déjà rencontré cette bascule au chapitre 2, pour comparer deux " +
            "exponentielles de même base : une fonction croissante conserve le sens d'une " +
            "inégalité, une fonction décroissante l'inverse. $\\log_a$ obéit à la même " +
            "logique — rien de nouveau à apprendre, juste à réappliquer ce réflexe une fois " +
            "de plus, cette fois côté logarithmes.",
        },
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
                'Prends $0<a<1$ et $u,v>0$. Démontrons l\'équivalence ' +
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
                'Prends $a>1$ et $u,v>0$. Démontrons cette fois ' +
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
                'précède, sans nouvelle démonstration à partir de zéro. Prends $0<a<1$, $u>0$ et ' +
                '$y$ un réel quelconque.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Le membre de droite $y$ n\'est pas encore un logarithme : ' +
                'réécris-le comme tel. Par **(P3)**, $\\log_a(a^{y}) = y$. Tu peux donc remplacer ' +
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
          kind: 'atelier',
          tag: 'inequation-logarithmique-widget',
          label: 'Manipule toi-même — domaine d\'abord, solution ensuite',
          caption:
            'Fais glisser a de part et d\'autre de 1 : S bascule sans que le symbole ni k ' +
            'changent. Décale ensuite l\'argument avec c : la zone hachurée est hors ' +
            'domaine, et la solution (en vert) doit toujours être cherchée dans le domaine ' +
            '(en violet). Pour 0 < a < 1, le crochet ouvert en c vient du domaine, pas de ' +
            'l\'inéquation.',
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
          kind: 'rappel',
          label: 'Signe de ln(u) — à connaître par cœur',
          items: [
            '$\\ln(u) > 0 \\iff u > 1$ ; $\\ln(u) = 0 \\iff u = 1$ ; $\\ln(u) < 0 \\iff 0 < u < 1$.',
            'Même chose pour toute base $a > 1$ ; pour $0 < a < 1$, les signes sont échangés. Tu ' +
              't\'en serviras dans chaque étude de signe (sections 4, 8 et 9).',
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            'Ne confonds jamais **domaine de validité** (là où chaque logarithme est défini) ' +
            'et **ensemble-solution** (là où l\'inégalité est vraie) ! Détermine toujours le ' +
            'domaine **en premier**, puis résous l\'inégalité à l\'intérieur de ce domaine.',
        },
        {
          kind: 'astuce',
          label: 'Vérification finale',
          text:
            'Avec un domaine restreint, vérifie toujours que l\'ensemble-solution obtenu par ' +
            'le calcul est bien inclus dans le domaine de départ — ici $S=]2;+\\infty[$ est ' +
            'bien inclus dans $]1;+\\infty[$, ce qui confirme la cohérence du résultat.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — même inéquation, deux bases différentes',
          blocks: [
            {
              kind: 'para',
              text:
                'Résous $\\log_{0,5}(6w-1) \\ge \\log_{0,5}(-4w^2+3)$, puis la même inéquation en base ' +
                '$e$ : $\\ln(6w-1) \\ge \\ln(-4w^2+3)$.',
            },
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
        { kind: 'subheading', text: 'Inéquations exponentielles : attention au signe de ln(a)' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — diviser par un logarithme négatif',
          blocks: [
            { kind: 'para', text: 'À partir de quel entier $n$ a-t-on $0{,}8^n < 0{,}05$ ?' },
            {
              kind: 'para',
              text:
                'Applique $\\ln$ aux deux membres — $\\ln$ est croissante, le sens est conservé : ' +
                '$n\\ln(0{,}8) < \\ln(0{,}05)$.',
            },
            {
              kind: 'para',
              text:
                'Or $\\ln(0{,}8) < 0$ (car $0{,}8 < 1$) : diviser par ce nombre **négatif inverse le sens**. ' +
                '$n > \\dfrac{\\ln(0{,}05)}{\\ln(0{,}8)} \\approx \\dfrac{-2{,}996}{-0{,}223} \\approx 13{,}4$, donc ' +
                '$n \\ge 14$. Contrôle : $0{,}8^{13} \\approx 0{,}055$ et $0{,}8^{14} \\approx 0{,}044$.',
            },
            {
              kind: 'para',
              text:
                'En 5e, sans logarithme, il fallait calculer les termes un à un (balayage numérique) : le ' +
                'logarithme donne le rang **directement**.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Résoudre une inéquation logarithmique',
          generatorId: '6gen15',
          description: [
            'Résous une inéquation logarithmique en tenant compte du sens de la base pour ' +
              'inverser (ou non) le comparateur, en déterminant le domaine avant l\'ensemble-solution ' +
              '— y compris quand ce domaine est vide.',
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
        { kind: 'video', title: 'Domaine, dérivée et dérivation logarithmique', youtubeId: 'Pnu9FWGFghw' },
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
                'Prends $x>0$. Cette démonstration n\'utilise **aucun calcul de limite** : elle ' +
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
                '**Étape 1.** Applique ce théorème à $f = \\exp$, dont la réciproque est ' +
                '$f^{-1} = \\ln$ (section 1). Remplace $f$ par $\\exp$ et $f^{-1}$ par $\\ln$ :',
            },
            { kind: 'para', text: '$\\ln\'(x) = \\dfrac{1}{\\exp\'(\\ln(x))}$' },
            {
              kind: 'para',
              text:
                '**Étape 2.** Le chapitre 2 a établi que $\\exp$ est **sa propre dérivée** : ' +
                '$\\exp\' = \\exp$. Tu peux donc remplacer $\\exp\'$ par $\\exp$ au ' +
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
                'Remarque que la formule n\'a de sens que pour $x>0$ — ce qui est bien le ' +
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
                'Prends $a>0$, $a \\neq 1$, et $x>0$. Aucun calcul nouveau n\'est nécessaire : ' +
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
                '**Étape 3.** Remplace $\\ln\'(x)$ par sa valeur $\\dfrac{1}{x}$, démontrée ' +
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
                '$0<a<1$. Tu retrouves ligne pour ligne le tableau de la section 1.',
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
          text: '$(\\ln(x))\'$ **n\'est pas** x — c\'est $\\dfrac{1}{x}$ ! Confondre la fonction avec sa dérivée est une erreur fréquente sous la pression du temps.',
        },
        {
          kind: 'methode',
          label: 'Logarithme d\'une valeur absolue',
          items: [
            '$(\\ln|x|)\' = \\dfrac{1}{x}$ pour **tout** $x \\neq 0$. Sur $]0;+\\infty[$, c\'est $(\\ln x)\'$. Sur ' +
              '$]-\\infty;0[$, $\\ln|x| = \\ln(-x)$, de dérivée $\\dfrac{-1}{-x} = \\dfrac{1}{x}$ (règle de la chaîne).',
            'Plus généralement, $(\\ln|u(x)|)\' = \\dfrac{u\'(x)}{u(x)}$ là où $u(x) \\neq 0$ — et le domaine ' +
              'de $\\ln|u|$ est l\'ensemble des x tels que $u(x) \\neq 0$.',
            'Pont vers le chapitre 4 : lue à l\'envers, $(\\ln|x|)\' = \\dfrac{1}{x}$ dit qu\'une primitive de ' +
              '$\\dfrac{1}{x}$ est $\\ln|x|$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'ln|x² − 4|',
          formula:
            'Détermine le domaine et la dérivée de $f(x) = \\ln\\left|x^2-4\\right|$, puis son comportement ' +
            'près de $x = -2$ et de $x = 2$.',
          steps: [
            { tag: 'domaine — l\'argument doit être non nul', text: '$x^2 - 4 \\neq 0 \\iff x \\neq \\pm2$ : $\\text{dom} f = \\mathbb{R} \\setminus \\{-2;2\\}$' },
            { tag: 'dérivée — (ln|u|)′ = u′/u', text: '$f\'(x) = \\dfrac{2x}{x^2-4}$' },
            { tag: 'près de ±2', text: '$\\left|x^2-4\\right| \\to 0^+$, donc $f(x) \\to -\\infty$ : asymptotes verticales $x = -2$ et $x = 2$' },
          ],
          result: { tag: 'résultat', text: '$f\'(x) = \\dfrac{2x}{x^2-4}$ sur $\\mathbb{R} \\setminus \\{-2;2\\}$, deux asymptotes verticales' },
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
          kind: 'exemple',
          badge: 'étudier un signe avec ln',
          formula: 'Étudie les variations de $f(x) = x\\ln(x) - x$ sur $]0;+\\infty[$.',
          steps: [
            { tag: 'dérivée — règle du produit', text: '$f\'(x) = \\ln(x) + x\\cdot\\dfrac{1}{x} - 1 = \\ln(x)$' },
            { tag: 'signe de ln (section 3)', text: '$f\'(x) < 0$ sur $]0;1[$ et $f\'(x) > 0$ sur $]1;+\\infty[$' },
          ],
          result: { tag: 'résultat', text: 'f décroît puis croît : **minimum en x = 1**, $f(1) = 0 - 1 = -1$.' },
        },
        {
          kind: 'application',
          titre: 'Lire un taux de croissance directement sur un graphique économique',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 100 * Math.exp(0.05 * t), tone: 'accent' }],
              xMin: 0,
              xMax: 40,
              xTicks: [0, 20, 40],
              fixedYRange: { min: 0, max: 800 },
              points: [
                { x: 0, y: 100, label: 'f(0)=100', tone: 'accent', labelPos: 'right' },
                { x: 40, y: 739, label: 'f(40)≈739', tone: 'accent', labelPos: 'left' },
              ],
              xAxisLabel: 't (années)',
              yAxisLabel: 'f(t)',
              caption:
                'Un chiffre d\'affaires croissant à taux constant de 5 %/an : $f(t) = 100\\,e^{0{,}05t}$. ' +
                'Courbe qui se creuse de plus en plus — difficile à lire une pente précise ' +
                "dessus.",
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => Math.log(100 * Math.exp(0.05 * t)), tone: 'good' }],
              xMin: 0,
              xMax: 40,
              xTicks: [0, 20, 40],
              fixedYRange: { min: 0, max: 7 },
              xAxisLabel: 't (années)',
              yAxisLabel: 'ln(f(t))',
              caption:
                'La MÊME croissance, mais en traçant ln(f(t)) : une droite, dont la pente ' +
                '(0,05) EST directement le taux de croissance relatif — plus besoin de ' +
                "calculer f'(t)/f(t), il suffit de lire la pente sur ce graphique.",
            },
          ],
          text:
            'En économie, le rapport $\\dfrac{f\'(x)}{f(x)}$ que tu viens de calculer — la ' +
            'dérivée logarithmique — a un sens concret très utilisé : c\'est le **taux de ' +
            'croissance relatif** (ou instantané) de la grandeur f, souvent exprimé en ' +
            'pourcentage. Si $f(t)$ représente un chiffre d\'affaires, un PIB ou une ' +
            'population au temps t, alors $f\'(t)/f(t)$ donne directement sa vitesse de ' +
            'croissance RELATIVE à sa taille actuelle — pas sa variation en valeur absolue, ' +
            'mais en proportion. C\'est exactement pour cette raison que les économistes ' +
            'tracent souvent $\\ln(f(t))$ plutôt que $f(t)$ lui-même : sur un tel graphique, ' +
            'une croissance à taux constant (exponentielle) devient une simple droite, dont ' +
            'la pente EST directement ce taux de croissance — le même principe que le repère ' +
            'semi-logarithmique de la section 1.',
          domaines: ['Économie', 'Finance'],
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
                'Prends $g$ une fonction dérivable et **strictement positive**, et $h$ une ' +
                'fonction dérivable. La stricte positivité de $g$ est indispensable : c\'est ce ' +
                'qui autorise à écrire $\\ln(g(x))$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1.** Réécris la puissance en base $e$. Par **(P4)** en base $e$, ' +
                '$g(x) = e^{\\ln(g(x))}$ ; élève à la puissance $h(x)$ et multiplie les ' +
                'exposants :',
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
                '$f(x) = (1+\\sqrt{x})^{2x}$, pour $x>0$. Écris $f(x) = e^{2x \\cdot \\ln(1+\\sqrt{x})}$.',
            },
            {
              kind: 'para',
              text:
                'Dérive d\'abord l\'exposant, par la règle du produit puis de la chaîne : ' +
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
        { kind: 'video', title: 'Calculer des limites', youtubeId: '7sw4Ch5blnY' },
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
              'généralement que toute puissance $x^k$ avec k>0, aussi petit soit k.',
          },
        },
        {
          kind: 'atelier',
          tag: 'croissance-comparee-log-widget',
          label: 'Manipule toi-même — qui finit par gagner ?',
          caption:
            'Élargis la fenêtre jusqu\'à 10⁶ et regarde l\'ordre des courbes changer. ∛x se ' +
            'laisse dépasser par ln x entre 6,4 et 93,4, puis repasse devant pour toujours ' +
            '; avec xᵏ et k = 0,1, il faut attendre environ 3,4 × 10¹⁵. Sur une fenêtre ' +
            'bornée, l\'ordre observé peut tromper : seule la limite en +∞ tranche.',
        },
        {
          kind: 'application',
          titre: 'Pourquoi un algorithme « en log n » est redoutablement rapide',
          image: {
            src: '/images/application/dictionary.jpg',
            alt: 'Dictionnaire ouvert',
            caption: 'Un dictionnaire — chercher un mot en l\'ouvrant d\'abord au milieu, puis en répétant, est exactement la recherche dichotomique du texte. Photo : Dr. Marcus Gossler, CC BY-SA 3.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (n) => Math.log2(Math.max(n, 1)), tone: 'good' },
                { fn: (n) => n, tone: 'bad' },
              ],
              xMin: 0,
              xMax: 100,
              xTicks: [0, 50, 100],
              fixedYRange: { min: 0, max: 60 },
              textLabels: [
                { x: 30, y: 10, text: 'dichotomique : log₂(n)', tone: 'good', anchor: 'start' },
                { x: 5, y: 50, text: 'naïve : n', tone: 'bad', anchor: 'start' },
              ],
              xAxisLabel: 'n (taille des données)',
              yAxisLabel: 'comparaisons',
              caption:
                "Nombre de comparaisons nécessaires selon la taille n : la recherche naïve " +
                '(rouge) explose en ligne droite, la dichotomique (verte) reste quasiment ' +
                "plate — elle sort même du cadre de ce graphique avant n'avoir atteint 60.",
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (k) => Math.log2(Math.pow(10, k)), tone: 'good' }],
              xMin: 0,
              xMax: 9,
              xTicks: [0, 3, 6, 9],
              fixedYRange: { min: 0, max: 32 },
              points: [{ x: 9, y: 29.9, label: '10⁹ données → ≈30 comparaisons', tone: 'good', labelPos: 'left' }],
              xAxisLabel: 'n = 10^k',
              yAxisLabel: 'comparaisons (log₂n)',
              caption:
                'Chaque facteur 10 de plus sur la taille des données (k+1) ne coûte que ' +
                '+log₂(10)≈3,32 comparaisons en plus — une droite très plate, là où la ' +
                'taille des données explose, elle, de façon multiplicative.',
            },
          ],
          text:
            'En informatique, la recherche dichotomique (chercher un mot dans un ' +
            'dictionnaire trié en divisant à chaque étape les possibilités restantes par 2) ' +
            'ne nécessite jamais plus d\'environ $\\log_2(n)$ étapes pour trouver un élément ' +
            'parmi n — exactement la croissance extrêmement lente que tu viens d\'observer ' +
            'sur le graphique ci-dessus. Concrètement, chercher un élément parmi un MILLIARD ' +
            '($10^9$) de données triées ne prend jamais plus de 30 comparaisons environ ' +
            '($\\log_2(10^9)\\approx 29{,}9$), alors qu\'une recherche naïve, élément par ' +
            'élément, pourrait en demander jusqu\'à un milliard. C\'est cette lenteur de ' +
            'croissance du logarithme — vue ici comme un avantage plutôt qu\'un ' +
            'inconvénient — qui rend des algorithmes comme la recherche dichotomique, les ' +
            'arbres binaires ou certaines bases de données capables de traiter des ' +
            'quantités de données gigantesques en un temps quasi instantané.',
          domaines: ['Informatique', 'Algorithmique'],
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
          kind: 'exemple',
          badge: 'forme ∞ − ∞ : regrouper',
          formula: 'Calcule $\\displaystyle\\lim_{x \\to +\\infty} \\left[\\ln\\left(x^2+1\\right) - 2\\ln(x)\\right]$.',
          steps: [
            { tag: 'forme indéterminée ∞ − ∞ : regrouper en un seul ln', text: '$\\ln\\left(x^2+1\\right) - 2\\ln(x) = \\ln\\left(\\dfrac{x^2+1}{x^2}\\right) = \\ln\\left(1 + \\dfrac{1}{x^2}\\right)$' },
            { tag: 'limite de l\'argument', text: '$1 + \\dfrac{1}{x^2} \\to 1$, et $\\ln(1) = 0$' },
          ],
          result: { tag: 'résultat', text: '$\\displaystyle\\lim_{x \\to +\\infty} \\left[\\ln\\left(x^2+1\\right) - 2\\ln(x)\\right] = 0$' },
        },
        {
          kind: 'exemple',
          badge: 'forme ∞ − ∞ : factoriser',
          formula: 'Calcule $\\displaystyle\\lim_{x \\to +\\infty} \\left(x - \\ln(x)\\right)$.',
          steps: [
            { tag: 'mettre le terme dominant en évidence', text: '$x - \\ln(x) = x\\left(1 - \\dfrac{\\ln(x)}{x}\\right)$' },
            { tag: 'croissance comparée (k = 1)', text: '$\\dfrac{\\ln(x)}{x} \\to 0$, donc la parenthèse tend vers 1' },
          ],
          result: { tag: 'résultat', text: '$\\displaystyle\\lim_{x \\to +\\infty} \\left(x - \\ln(x)\\right) = +\\infty$' },
        },
        {
          kind: 'exemple',
          badge: 'une puissance du logarithme',
          formula: 'Calcule $\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{(\\ln x)^2}{x}$.',
          steps: [
            { tag: 'faire apparaître une croissance comparée connue', text: '$\\dfrac{(\\ln x)^2}{x} = \\left(\\dfrac{\\ln(x)}{\\sqrt{x}}\\right)^2$' },
            { tag: 'croissance comparée (k = 1/2)', text: '$\\dfrac{\\ln(x)}{x^{1/2}} \\to 0$' },
          ],
          result: { tag: 'résultat', text: '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{(\\ln x)^2}{x} = 0^2 = 0$' },
        },
        {
          kind: 'piege',
          text:
            '$\\displaystyle\\lim_{x \\to +\\infty} x \\cdot \\ln(x)$ **n\'est pas** une forme ' +
            'indéterminée ! Les deux facteurs tendent vers +∞, leur produit diverge donc ' +
            'directement vers +∞ — inutile (et faux) d\'invoquer la croissance comparée ici.',
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
            'Calcule des limites de fonctions logarithmiques : croissance comparée ' +
              '(exponentielle > puissance > logarithme), limite de référence ln(1+u)/u → 1, et ' +
              'limites déterminées déguisées en formes indéterminées.',
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
        { kind: 'video', title: 'Retrouver des paramètres depuis des conditions graphiques', youtubeId: 'U54C7GsoHs4' },
        {
          kind: 'para',
          text:
            'Comme au chapitre 2, tu peux retrouver des paramètres inconnus d\'une fonction à ' +
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
          kind: 'atelier',
          tag: 'parametres-graphiques-widget',
          label: 'Manipule toi-même — a, b et le piège du point en x = e',
          caption:
            'En mode Libre, fais varier a et b : le point (1 ; a) et la tangente de pente b ' +
            'suivent ; coche « Révéler le point en x = e » pour voir que f(e) = a + b. En ' +
            'mode Défi, recouvre la courbe en pointillés à partir de deux points pris en x ' +
            '= e, e² ou 1/e, avec ln(e) = 1, ln(e²) = 2 et ln(1/e) = −1.',
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
            'Ne confonds pas le point en x=1 (où $\\ln(1)=0$ annule b, donnant directement a) ' +
            'avec un point en x=e (où $\\ln(e)=1$, donc b intervient bel et bien) — c\'est a+b, ' +
            'pas simplement a !',
        },
        {
          kind: 'exemple',
          badge: 'deux points, aucun en x = 1',
          formula:
            'Le graphique de $f(x) = a + b\\ln(x)$ passe par les points $(e;5)$ et $\\left(e^3;11\\right)$. ' +
            'Détermine $a$ et $b$.',
          steps: [
            { tag: 'traduire chaque point — ln(e) = 1, ln(e³) = 3', text: '$a + b = 5$ et $a + 3b = 11$' },
            { tag: 'soustraire les deux équations', text: '$2b = 6 \\implies b = 3$, puis $a = 5 - 3 = 2$' },
          ],
          result: { tag: 'résultat', text: '$f(x) = 2 + 3\\ln(x)$ — contrôle : $f\\left(e^3\\right) = 2 + 9 = 11$' },
        },
        {
          kind: 'exemple',
          badge: 'une asymptote verticale donnée',
          formula:
            'Le graphique de $f(x) = a + b\\ln(x - c)$ admet la droite $x = 2$ comme asymptote verticale et ' +
            'passe par $(3;1)$ et $(e+2;4)$. Détermine $a$, $b$ et $c$.',
          steps: [
            { tag: 'asymptote — l\'argument s\'annule en x = c', text: '$c = 2$' },
            { tag: 'point (3 ; 1) — ln(1) = 0', text: '$f(3) = a + b\\ln(1) = a = 1$' },
            { tag: 'point (e + 2 ; 4) — ln(e) = 1', text: '$f(e+2) = a + b = 4 \\implies b = 3$' },
          ],
          result: { tag: 'résultat', text: '$f(x) = 1 + 3\\ln(x-2)$, définie sur $]2;+\\infty[$' },
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier',
          text:
            'Une fois les paramètres calculés, réinjecte leurs valeurs dans les conditions de ' +
            'départ : ça permet de détecter une éventuelle erreur de calcul avant de conclure.',
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
        {
          kind: 'methode',
          label: 'Lire une courbe f(x) = logₐ(x − c) + d',
          items: [
            '**Asymptote et domaine** : l\'argument $x - c$ s\'annule en $x = c$ — la droite ' +
              '$x = c$ est l\'asymptote verticale, et $\\text{dom}\\,f = \\mathopen{]}c\\,;+\\infty\\mathclose{[}$ ' +
              '(borne exclue).',
            '**Le point où l\'argument vaut 1** : en $x = c + 1$, $\\log_a(1) = 0$, donc ' +
              '$f(c+1) = d$. Ce point $(c+1\\,;\\,d)$ donne d.',
            '**La base** : cherche le point de la courbe une unité plus haut, ou plus bas. Plus ' +
              'haut, $\\log_a(x - c) = 1$, donc $a = x - c$ ; plus bas, $\\log_a(x - c) = -1$, donc ' +
              '$a = \\dfrac{1}{x - c}$. Par exemple, une courbe décroissante qui passe par $(c+1\\,;\\,d)$ ' +
              'et par $(c+3\\,;\\,d-1)$ a pour base $a = \\dfrac{1}{3}$.',
            '**Contrôle** : la courbe monte si $a > 1$ et descend si $0 < a < 1$.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Lire une courbe logarithmique',
          generatorId: '6gen85',
          description: [
            'À partir du graphique de f(x) = logₐ(x − c) + d, retrouve l\'asymptote, le domaine, ' +
              'la base et l\'expression — ou associe quatre courbes à leurs expressions.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 85. Lire une courbe logarithmique »',
        },
      ],
    },
    {
      id: 'hyperboliques',
      number: 7,
      title: 'Sinus et cosinus hyperboliques',
      kicker: 'ch²−sh²=1, dérivées croisées, rien à voir avec les angles',
      blocks: [
        { kind: 'video', title: 'Sinus et cosinus hyperboliques', youtubeId: 'g_DEAA_S8vA' },
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
          kind: 'intuition',
          label: 'Pourquoi « hyperboliques » ?',
          text:
            'Le point $(\\cos t;\\sin t)$ parcourt le cercle d\'équation $x^2 + y^2 = 1$. Le point ' +
            '$(\\text{ch}\\,t;\\text{sh}\\,t)$, lui, parcourt la branche droite de l\'**hyperbole** ' +
            '$x^2 - y^2 = 1$ — d\'où le nom. Mais ici, t n\'est pas un angle : rien ne tourne.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
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
          label: 'Démonstration — ch²(x) − sh²(x) = 1',
          blocks: [
            {
              kind: 'para',
              text:
                'Développe chaque carré, avec $e^x \\cdot e^{-x} = e^0 = 1$ : ' +
                '$\\text{ch}^2(x) = \\dfrac{e^{2x} + 2 + e^{-2x}}{4}$ et $\\text{sh}^2(x) = \\dfrac{e^{2x} - 2 + e^{-2x}}{4}$.',
            },
            {
              kind: 'para',
              text:
                'Soustrais : les termes $e^{2x}$ et $e^{-2x}$ disparaissent, il reste ' +
                '$\\text{ch}^2(x) - \\text{sh}^2(x) = \\dfrac{2 - (-2)}{4} = 1$. $\\qquad \\blacksquare$',
            },
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
              'se reproduit elle-même, à la différence de $e^x$. Preuve immédiate : ' +
              '$\\left(\\dfrac{e^x - e^{-x}}{2}\\right)\' = \\dfrac{e^x + e^{-x}}{2}$, puisque $(e^{-x})\' = -e^{-x}$.',
          ],
        },
        {
          kind: 'piege',
          text:
            'ch(x) ≥ 1 **toujours** (minimum en x=0) — ne la confonds jamais avec cos, qui ' +
            'oscille entre −1 et 1 ! ch ne devient jamais négative.',
        },
        { kind: 'subheading', text: 'Le lien avec le logarithme : la réciproque de sh' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la réciproque de sh est x ↦ ln(x + √(x² + 1))',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\text{sh}\'(x) = \\text{ch}(x) > 0$ : sh est strictement croissante de $\\mathbb{R}$ dans ' +
                '$\\mathbb{R}$, donc réciproque. Pour un réel x donné, cherche y tel que $\\text{sh}(y) = x$, ' +
                'c\'est-à-dire $\\dfrac{e^y - e^{-y}}{2} = x$.',
            },
            {
              kind: 'para',
              text:
                'Multiplie par $2e^y$ : $e^{2y} - 2x\\,e^y - 1 = 0$. Avec $t = e^y > 0$ (la substitution de la ' +
                'section 2) : $t^2 - 2xt - 1 = 0$, donc $t = x + \\sqrt{x^2+1}$ ou $t = x - \\sqrt{x^2+1}$.',
            },
            {
              kind: 'para',
              text:
                'Comme $\\sqrt{x^2+1} > |x|$, la seconde racine est négative : **rejetée**, car $t = e^y > 0$. ' +
                'Il reste $e^y = x + \\sqrt{x^2+1}$, d\'où $y = \\ln\\left(x + \\sqrt{x^2+1}\\right)$. ' +
                '$\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Cette réciproque s\'appelle **argument sinus hyperbolique** (argsh) : les fonctions ' +
                'hyperboliques sont bâties avec $\\exp$, leurs réciproques avec $\\ln$.',
            },
          ],
        },
        {
          kind: 'application',
          titre: 'La forme exacte d\'un câble ou d\'une chaîne suspendus',
          text:
            'Une chaîne, un câble électrique ou un fil tenu par ses deux extrémités prend la forme d\'une ' +
            '**chaînette**, d\'équation $y = a\\,\\text{ch}\\left(\\dfrac{x}{a}\\right)$ dans un repère bien ' +
            'choisi. Galilée pensait que c\'était une parabole ; en 1691, Huygens, Leibniz et Jean ' +
            'Bernoulli trouvent la vraie réponse, indépendamment. Retournée, la chaînette donne l\'arche ' +
            'la plus stable sous son propre poids : c\'est la forme de la Gateway Arch de Saint-Louis ' +
            '(192 m) et de nombreuses voûtes.',
          domaines: ['Physique', 'Architecture'],
        },
        {
          kind: 'atelier',
          tag: 'chainette-widget',
          label: 'Manipule toi-même — chaînette ou parabole ?',
          caption:
            'Une chaîne suspendue prend la forme d\'une chaînette, écrite avec ch. Fais ' +
            'varier la tension : plus la chaîne est détendue, plus elle s\'écarte de la ' +
            'parabole tracée par les mêmes points (jusqu\'à environ 1 m ici). Retourne-la : ' +
            'tu obtiens la forme d\'arche la plus stable, celle de la Gateway Arch de ' +
            'Saint-Louis.',
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
        { kind: 'video', title: 'Graphique de la fonction dérivée', youtubeId: 'zCtu1A2BCy0' },
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
          kind: 'astuce',
          label: 'Une conséquence utile : ln(x) ≤ x − 1',
          text:
            'Le minimum de $f(x) = x - \\ln(x)$ vaut 1, donc $x - \\ln(x) \\ge 1$, soit $\\ln(x) \\le x - 1$ ' +
            'pour tout $x > 0$, avec égalité seulement en $x = 1$. Géométriquement : la courbe de $\\ln$ ' +
            'reste sous sa tangente en $(1;0)$, d\'équation $y = x - 1$. En particulier, $\\ln(x) < x$.',
        },
        {
          kind: 'exemple',
          badge: 'lire f′ pour ln(x) − x/2',
          formula:
            'Pour $f(x) = \\ln(x) - \\dfrac{x}{2}$ ($x > 0$), étudie le signe et les variations de $f\'$, ' +
            'et déduis-en l\'allure du graphique de f.',
          steps: [
            { tag: 'dérivée', text: '$f\'(x) = \\dfrac{1}{x} - \\dfrac{1}{2} = \\dfrac{2-x}{2x}$' },
            { tag: 'signe de f′ → variations de f', text: '$f\' > 0$ sur $]0;2[$, $f\' < 0$ sur $]2;+\\infty[$ : maximum en $x = 2$, $f(2) = \\ln(2) - 1 \\approx -0{,}31$' },
            { tag: 'variations de f′ → concavité de f', text: '$f\'$ est décroissante ($f\'\'(x) = -\\dfrac{1}{x^2} < 0$) : f est concave, sans point d\'inflexion' },
            { tag: 'bords', text: '$f\' \\to +\\infty$ en $0^+$ (asymptote verticale de f) et $f\' \\to -\\dfrac{1}{2}$ en $+\\infty$' },
          ],
          result: {
            tag: 'résultat',
            text:
              'f monte presque verticalement depuis $-\\infty$, atteint son maximum $\\ln(2) - 1$ en $x = 2$, ' +
              'puis redescend avec une pente qui se rapproche de $-\\dfrac{1}{2}$.',
          },
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            '$f\' > 0$ sur un intervalle : f y est croissante ; $f\' < 0$ : f y est décroissante.',
            '$f\'$ s\'annule en changeant de signe : f a un **extremum** (tangente horizontale).',
            '$f\'$ atteint un maximum ou un minimum : f change de concavité — **point d\'inflexion**.',
            'Près d\'une asymptote verticale de f, $|f\'|$ devient très grand : la courbe y devient ' +
              'presque verticale.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'f-et-fprime-widget',
          label: 'Manipule toi-même — dessiner f′ à partir de f',
          caption:
            'Fais glisser le point sur f : la pente de la tangente est reportée sur le ' +
            'graphique du bas, qui dessine f′ au fur et à mesure. Point dans la bande verte ' +
            ': f monte ; dans la bande rouge : f descend. Quand f′ s\'annule, f a un ' +
            'extremum ; quand f′ atteint un extremum, f change de concavité.',
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
            'À partir du graphique d\'une fonction logarithmique, choisis celui de sa dérivée en ' +
              'utilisant le signe et les extremums, puis confirme par le calcul de f\'.',
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
        { kind: 'video', title: 'Étudier une fonction : f(x) = ln(x)/x', youtubeId: 'uZjWAZVXFTA' },
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
            { kind: 'para', text: '**1. Domaine :** $]0;+\\infty[$ (restriction du logarithme ET du dénominateur, qui coïncident ici).' },
            {
              kind: 'para',
              text:
                '**2. Limites et asymptotes :** en x→0⁺, $\\ln(x) \\to -\\infty$ divisé par x→0⁺ donne ' +
                '$f(x) \\to -\\infty$ (asymptote verticale x=0) ; en x→+∞, croissance comparée ' +
                '$\\implies$ $f(x) \\to 0$ (asymptote horizontale y=0). Zéro : $f(x) = 0 \\iff \\ln(x) = 0 \\iff x = 1$.',
            },
            {
              kind: 'para',
              text:
                '**3. Dérivée et variations :** $f\'(x) = \\dfrac{\\frac{1}{x}\\cdot x - \\ln(x)}{x^2} = ' +
                '\\dfrac{1-\\ln(x)}{x^2}$. Son signe est celui de $1 - \\ln(x)$ : positif si $x < e$, nul en ' +
                '$x = e$, négatif si $x > e$ $\\implies$ **maximum en x=e**, $f(e) = 1/e \\approx 0{,}368$.',
            },
            {
              kind: 'signTable',
              caption: 'Signe de f′ et variations de f',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '0', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: 'e', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'Signe de f′(x)',
                  cells: [
                    { text: '‖', tone: 'indef' },
                    { text: '+', tone: 'pos' },
                    { text: '0', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'Variations de f',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '↗', tone: 'plain' },
                    { text: 'max (1/e)', tone: 'zero' },
                    { text: '↘', tone: 'plain' },
                    { text: '0', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                '**4. Concavité :** $f\'\'(x) = \\dfrac{-\\frac{1}{x}\\cdot x^2 - (1-\\ln(x))\\cdot 2x}{x^4} = ' +
                '\\dfrac{2\\ln(x) - 3}{x^3}$. Pour $x > 0$, son signe est celui de $2\\ln(x) - 3$ : négatif si ' +
                '$x < e^{3/2}$ (f concave), positif au-delà (f convexe). **Point d\'inflexion** en ' +
                '$x = e^{3/2} \\approx 4{,}48$, où $f = \\dfrac{3}{2e^{3/2}} \\approx 0{,}335$.',
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
            points: [
              { x: E, y: 1 / E, label: 'max (e;1/e)', tone: 'accent', labelPos: 'above' },
              { x: Math.exp(1.5), y: 1.5 / Math.exp(1.5), label: 'inflexion', tone: 'good', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'f(x) = ln(x)/x : maximum en (e;1/e), point d\'inflexion en $x = e^{3/2} \\approx 4{,}48$, asymptote verticale x=0, asymptote horizontale y=0 en +∞',
          },
        },
        {
          kind: 'piege',
          text:
            'Quand une fonction combine un logarithme **et** une expression rationnelle, ' +
            'vérifie **à la fois** les restrictions imposées par le logarithme **et** celles ' +
            'imposées par un éventuel dénominateur — ici les deux coïncident par chance, mais ' +
            'ce n\'est pas systématique !',
        },
        {
          kind: 'exemple',
          badge: 'étude courte de x·ln(x)',
          formula: 'Étudie la fonction $f(x) = x\\ln(x)$ : domaine, limites, variations, concavité.',
          steps: [
            { tag: 'domaine et limites', text: '$]0;+\\infty[$ ; $\\displaystyle\\lim_{x\\to0^+} x\\ln(x) = 0$ (croissance comparée) et $\\displaystyle\\lim_{x\\to+\\infty} x\\ln(x) = +\\infty$' },
            { tag: 'dérivée et variations', text: '$f\'(x) = \\ln(x) + 1$, nulle en $x = e^{-1}$ : minimum $f\\left(e^{-1}\\right) = -\\dfrac{1}{e} \\approx -0{,}368$' },
            { tag: 'concavité', text: '$f\'\'(x) = \\dfrac{1}{x} > 0$ : f est convexe sur tout son domaine' },
          ],
          result: {
            tag: 'résultat',
            text:
              'La courbe part de l\'origine (sans l\'atteindre : 0 est exclu du domaine), descend jusqu\'à ' +
              '$\\left(e^{-1};-e^{-1}\\right)$, recoupe l\'axe en $x = 1$, puis monte vers $+\\infty$.',
          },
        },
        {
          kind: 'exemple',
          badge: 'étude de ln|x² − 4|',
          formula: 'Étudie les variations de $f(x) = \\ln\\left|x^2 - 4\\right|$ (dérivée calculée à la section 4).',
          steps: [
            { tag: 'domaine, parité, asymptotes', text: '$\\mathbb{R}\\setminus\\{-2;2\\}$ ; f est paire ; asymptotes verticales $x = \\pm2$ ($f \\to -\\infty$), et $f \\to +\\infty$ en $\\pm\\infty$' },
            { tag: 'signe de f′(x) = 2x/(x² − 4)', text: '$f\' < 0$ sur $]-\\infty;-2[$ et $]0;2[$, $f\' > 0$ sur $]-2;0[$ et $]2;+\\infty[$' },
            { tag: 'zéros — |x² − 4| = 1', text: '$x^2 = 5$ ou $x^2 = 3$ : $x = \\pm\\sqrt{5}$ ou $x = \\pm\\sqrt{3}$' },
          ],
          result: {
            tag: 'résultat',
            text:
              'Maximum local en $x = 0$ : $f(0) = \\ln(4) \\approx 1{,}39$. Entre les asymptotes, la courbe ' +
              'forme une « bosse » ; à l\'extérieur, deux branches qui montent vers $+\\infty$.',
          },
        },
        { kind: 'subheading', text: 'Optimiser un modèle en contexte' },
        {
          kind: 'para',
          text:
            'Une étude de fonction sert aussi à **optimiser** : trouver la dose, la production ou la vitesse ' +
            'qui rend une grandeur maximale ou minimale. Même démarche, avec deux soins en plus : le ' +
            'domaine tient compte de la **situation** (une quantité positive, une valeur plafonnée), et la ' +
            'réponse finale se donne **dans les unités de l\'énoncé**.',
        },
        {
          kind: 'exemple',
          badge: 'vitesse qui maximise le débit',
          formula:
            'Sur une route limitée à 90 km/h, le débit (en centaines de véhicules par heure) est ' +
            '$D(v) = 5v - 2v\\ln(v)$, où $v$ est la vitesse en dizaines de km/h. À quelle vitesse le débit est-il maximal ?',
          steps: [
            { tag: 'domaine dans le contexte', text: '$\\ln(v)$ impose $v > 0$ ; la limitation impose $v \\le 9$ : $D$ est définie sur $\\mathopen{]}0;9]$' },
            { tag: 'dérivée (règle du produit)', text: '$D\'(v) = 5 - 2\\left(\\ln(v) + v \\cdot \\dfrac{1}{v}\\right) = 3 - 2\\ln(v)$' },
            { tag: 'valeur qui annule la dérivée', text: '$3 - 2\\ln(v) = 0 \\iff \\ln(v) = \\dfrac{3}{2} \\iff v = e^{3/2} \\approx 4{,}48$' },
            { tag: 'signe : maximum', text: '$\\ln$ est croissante : $D\'(v) > 0$ si $v < e^{3/2}$ et $D\'(v) < 0$ si $v > e^{3/2}$, donc $D$ admet un **maximum** en $v = e^{3/2}$' },
            { tag: 'valeur optimale', text: '$D\\left(e^{3/2}\\right) = 5e^{3/2} - 2 \\cdot \\dfrac{3}{2} \\cdot e^{3/2} = 2e^{3/2} \\approx 8{,}96$' },
          ],
          result: {
            tag: 'interprétation',
            text: 'Le débit est maximal à $10e^{3/2} \\approx 45$ km/h : environ $896$ véhicules par heure.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Étudier une fonction (synthèse)',
          generatorId: '6gen21',
          description: [
            'Mène une étude complète en 6 écrans (domaine, limites, asymptotes, variation, ' +
              'extremum, concavité) sur cinq familles logarithmiques — k(ln x + c)/x, ' +
              '(bx)ᵃˣ + c, ln|trinôme|, ln(trinôme toujours positif), m(ln x + c/x) — puis ' +
              'choisis le bon graphique, en une seule tentative.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 21. Étudier une fonction (synthèse) »',
        },
        {
          kind: 'entrainement',
          title: 'Optimiser un modèle logarithmique',
          generatorId: '6gen91',
          description: [
            'Optimise une grandeur en contexte en 5 écrans — domaine dans la situation, dérivée, ' +
              'valeur exacte qui l\'annule (fraction ou eᵏ), maximum ou minimum par le signe de la ' +
              'dérivée (une seule tentative), puis l\'optimum dans les unités de l\'énoncé — sur cinq ' +
              'modèles : rendement d\'un engrais, bénéfice, bénéfice moyen ln(x)/x, coût moyen x·ln(x), ' +
              'débit d\'une route.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 91. Optimiser un modèle logarithmique »',
        },
      ],
    },
    {
      id: 'problemes',
      number: 10,
      title: 'Logarithmes : problèmes',
      kicker: 'échelles logarithmiques, demi-vie, croissance logistique',
      blocks: [
        { kind: 'video', title: 'Problèmes : pH, demi-vie et croissance logistique', youtubeId: 'HLIc56bYNr0' },
        {
          kind: 'para',
          text:
            'Échelles logarithmiques (pH, magnitude de Richter, décibels), demi-vie ' +
            'radioactive, croissance logistique : autant de situations où retrouver une ' +
            'inconnue « cachée dans un exposant » passe obligatoirement par ln.',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi tant de grandeurs physiques passent par le log',
          text:
            "Un séisme peut libérer une énergie 1 000, 100 000 ou 10 000 000 fois plus grande " +
            "qu'un autre : impossible de mettre des écarts pareils sur une seule échelle " +
            "lisible ! Le logarithme résout exactement ce problème : il **compresse** des " +
            "écarts énormes en petits nombres bien lisibles, en transformant un facteur ×10 " +
            "en un simple +1. C'est pour ça que la magnitude de Richter, les décibels ou le pH " +
            "sont tous construits avec un log₁₀ — une magnitude 6 ne représente pas « un peu " +
            "plus » qu'une magnitude 5 : l'amplitude des ondes est 10 fois plus grande, et l'énergie " +
            "libérée environ 32 fois plus grande, cachées derrière un chiffre qui n'augmente, lui, " +
            "que d'une unité.",
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
          kind: 'exemple',
          badge: 'magnitude et énergie',
          formula:
            'L\'énergie E (en joules) libérée par un séisme de magnitude M vérifie ' +
            '$\\log_{10}(E) = 1{,}5M + 4{,}8$. Combien de fois plus d\'énergie libère un séisme de magnitude 7 ' +
            'qu\'un séisme de magnitude 5 ?',
          steps: [
            { tag: 'écart des logarithmes', text: '$\\log_{10}(E_7) - \\log_{10}(E_5) = 1{,}5\\times(7-5) = 3$' },
            { tag: 'quotient', text: '$\\log_{10}\\left(\\dfrac{E_7}{E_5}\\right) = 3 \\iff \\dfrac{E_7}{E_5} = 10^3$' },
          ],
          result: { tag: 'résultat', text: '1 000 fois plus d\'énergie (et environ 32 fois plus pour un seul degré, car $10^{1{,}5} \\approx 31{,}6$).' },
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
            {
              kind: 'para',
              text:
                'Ordres de grandeur réels : le **carbone 14** a une demi-vie d\'environ ' +
                '**5 730 ans** (datation des restes organiques), l\'**iode 131** d\'environ ' +
                '**8,02 jours** (médecine nucléaire). La demi-vie ne dépend que de $\\lambda$, ' +
                'jamais de la quantité initiale $N_0$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'datation au carbone 14',
          formula:
            'Un os ne contient plus que 30 % du carbone 14 qu\'il contenait à la mort de l\'animal. La ' +
            'demi-vie du carbone 14 vaut 5 730 ans. Quel est l\'âge de l\'os ?',
          steps: [
            { tag: 'constante de désintégration — T = ln(2)/λ', text: '$\\lambda = \\dfrac{\\ln(2)}{5730}$' },
            { tag: 'il reste 30 %', text: '$e^{-\\lambda t} = 0{,}3 \\iff -\\lambda t = \\ln(0{,}3) \\iff t = \\dfrac{\\ln(1/0{,}3)}{\\lambda} = 5730\\times\\dfrac{\\ln(10/3)}{\\ln(2)}$' },
          ],
          result: { tag: 'résultat', text: '$t \\approx 9\\,950$ ans.' },
        },
        {
          kind: 'atelier',
          tag: 'datation-carbone14-widget',
          label: 'Manipule toi-même — dater un reste organique',
          caption:
            'Règle le pourcentage de carbone 14 encore présent : l\'âge se lit sur la courbe ' +
            'et se calcule en appliquant ln. Chaque palier en pointillés est une demi-vie : ' +
            'la quantité est divisée par 2 tous les 5 730 ans, quelle que soit la quantité ' +
            'de départ. Avec 30 %, tu retrouves l\'exemple ci-dessus.',
        },
        {
          kind: 'exemple',
          badge: 'temps de doublement',
          formula:
            'Un capital placé à intérêts composés en continu évolue selon $C(t) = C_0\\,e^{rt}$, avec ' +
            '$r = 0{,}035$ (3,5 % par an). En combien de temps double-t-il ?',
          steps: [
            { tag: 'traduire « double »', text: '$C_0\\,e^{rt} = 2C_0 \\iff e^{rt} = 2$' },
            { tag: 'appliquer ln', text: '$rt = \\ln(2) \\iff t = \\dfrac{\\ln(2)}{r} = \\dfrac{\\ln(2)}{0{,}035}$' },
          ],
          result: { tag: 'résultat', text: '$t \\approx 19{,}8$ ans — indépendant de $C_0$, comme une demi-vie.' },
        },
        {
          kind: 'astuce',
          label: 'La règle de 70',
          text:
            'Comme $\\ln(2) \\approx 0{,}693$, le temps de doublement vaut environ 70 divisé par le taux ' +
            'exprimé en % : $70 \\div 3{,}5 = 20$ ans. Banquiers, démographes et économistes l\'utilisent de tête.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — combiner deux niveaux sonores',
          blocks: [
            {
              kind: 'para',
              text:
                'Le niveau sonore vaut $L = 10 \\cdot \\log_{10}(I/I_0)$ dB, où $I$ est l\'intensité. ' +
                'Deux machines produisent chacune **60 dB**. Quel est le niveau quand elles ' +
                'fonctionnent ensemble ?',
            },
            {
              kind: 'para',
              text:
                'Ce sont les **intensités** qui s\'additionnent, pas les niveaux : $I_{total} = 2I$, ' +
                'donc $L_{total} = 10\\log_{10}(2I/I_0) = 60 + 10\\log_{10}(2) \\approx 63$ dB.',
            },
            { kind: 'para', text: 'Jamais 120 dB : doubler l\'intensité n\'ajoute qu\'environ 3 dB.' },
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
            'donné ? », isole le terme exponentiel puis applique ln — exactement la même ' +
            'démarche qu\'au chapitre 2, désormais menée jusqu\'au bout.',
        },
        {
          kind: 'exemple',
          badge: 'un instant précis dans le modèle logistique',
          formula: 'Pour $y(t) = \\dfrac{10}{1 + 9e^{-t}}$, à quel instant $y$ atteint-il 9 ?',
          steps: [
            { tag: 'isoler le terme exponentiel', text: '$1 + 9e^{-t} = \\dfrac{10}{9} \\iff 9e^{-t} = \\dfrac{1}{9} \\iff e^{-t} = \\dfrac{1}{81}$' },
            { tag: 'appliquer ln', text: '$-t = \\ln\\left(\\dfrac{1}{81}\\right) = -\\ln(81)$' },
          ],
          result: { tag: 'résultat', text: '$t = \\ln(81) \\approx 4{,}39$ — deux fois l\'instant d\'inflexion $\\ln(9)$, car $81 = 9^2$.' },
        },
        {
          kind: 'entrainement',
          title: 'Logarithmes : problèmes',
          generatorId: '6gen22',
          description: [
            'Modélise une situation concrète (échelles logarithmiques comme le pH ou les ' +
              'décibels, y compris la combinaison de deux niveaux sonores ; demi-vies réelles ' +
              'comme le carbone 14 ou l\'iode 131 ; croissance logistique) à partir d\'un ' +
              'contexte narratif, en isolant l\'inconnue via ln.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 22. Logarithmes : problèmes »',
        },
        {
          kind: 'methode',
          label: 'Raisonner sur une échelle logarithmique : écart ↔ rapport',
          items: [
            'Repère ce que donne l\'énoncé : deux valeurs sur l\'échelle (un **écart**) ou un facteur sur la grandeur physique (un **rapport**).',
            'Sur une échelle $L = a\\log(X) + b$ (log en base 10), multiplier $X$ par $k$ **ajoute** $a\\log(k)$ à $L$ : deux sources sonores identiques au lieu d\'une, c\'est environ $+3$ dB ; dix sources, $+10$ dB.',
            'Inversement, un écart $\\Delta L$ sur l\'échelle donne $\\log\\left(\\dfrac{X_2}{X_1}\\right) = \\dfrac{\\Delta L}{a}$, donc $\\dfrac{X_2}{X_1} = 10^{\\Delta L / a}$ : on ne compare jamais deux niveaux par leur quotient.',
            'Réponds dans le contexte : nouveau niveau (avec son unité et l\'arrondi demandé), « combien de fois plus », ou nombre entier — arrondi à l\'entier **supérieur** s\'il faut atteindre au moins un niveau.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Échelle', 'Un écart sur l\'échelle donne le rapport'],
          rows: [
            ['Décibels : $L = 10\\log(I/I_0)$', '$\\dfrac{I_2}{I_1} = 10^{(L_2 - L_1)/10}$'],
            ['Séisme (amplitude) : $M = \\log(A/A_0)$', '$\\dfrac{A_2}{A_1} = 10^{M_2 - M_1}$'],
            ['Séisme (énergie) : $\\log(E) = 1{,}5M + 4{,}8$', '$\\dfrac{E_2}{E_1} = 10^{1{,}5(M_2 - M_1)}$'],
            ['pH : $\\mathrm{pH} = -\\log(c)$', '$\\dfrac{c_A}{c_B} = 10^{\\mathrm{pH}_B - \\mathrm{pH}_A}$'],
            ['Étoiles : $m = -2{,}5\\log(E) + C$', '$\\dfrac{E_A}{E_B} = 10^{0{,}4(m_B - m_A)}$'],
          ],
          caption: 'Un même écart sur l\'échelle correspond toujours au même rapport, quel que soit le niveau de départ. Attention au sens : pour le pH et les magnitudes d\'étoiles, la plus petite valeur correspond à la plus grande grandeur.',
        },
        {
          kind: 'entrainement',
          title: 'Échelles logarithmiques : rapports et sommes',
          generatorId: '6gen90',
          description: [
            'Raisonne sur une échelle logarithmique sans repartir de la formule : n sources sonores ' +
              'identiques, intensité divisée par un facteur, nombre de sources pour atteindre un ' +
              'niveau, rapport d\'intensités, d\'amplitudes ou d\'énergies de séismes, concentrations ' +
              'en ions H₃O⁺ et dilution, éclat et magnitude des étoiles. Traduis l\'écart en rapport ' +
              '(ou l\'inverse), calcule, puis réponds dans le contexte.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 90. Échelles logarithmiques : rapports et sommes »',
        },
        {
          kind: 'entrainement',
          title: 'Le détective d\'erreurs : logarithmes',
          generatorId: '6gen88',
          description: [
            'Une résolution rédigée par un élève contient une ligne fausse : trouve-la, nomme ' +
              'l\'erreur (ln d\'une somme, ln(x²) sans valeur absolue, CE oubliée, sens non ' +
              'inversé pour une base < 1, (ln x)² confondu avec ln(x²), quotient de logarithmes, ' +
              'dérivée de ln(u), changement de base inversé), puis corrige la résolution.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 88. Le détective d\'erreurs : logarithmes »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Définition et propriétés immédiates',
        formulas: [
          { text: '$\\log_a(x) = y \\iff a^y = x$', condition: '$a>0$, $a \\neq 1$, $x>0$' },
          { text: '$\\log_a(1) = 0 \\qquad \\log_a(a) = 1$' },
          { text: '$\\log_a(a^r) = r \\qquad a^{\\log_a(x)} = x$' },
        ],
      },
      {
        title: 'Propriétés algébriques et changement de base',
        formulas: [
          { text: '$\\log_a(xy) = \\log_a(x) + \\log_a(y)$' },
          { text: '$\\log_a(x/y) = \\log_a(x) - \\log_a(y)$' },
          { text: '$\\log_a(x^r) = r \\cdot \\log_a(x)$' },
          { text: '$\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}$', condition: 'changement de base' },
        ],
      },
      {
        title: 'Équations et inéquations logarithmiques',
        formulas: [
          { text: '$\\log_a(x) = \\log_a(y) \\iff x = y$', condition: '$x,y>0$' },
          { text: '$\\log_a(u) \\le \\log_a(v) \\iff u \\le v$', condition: 'si $a>1$ — sens conservé' },
          { text: '$\\log_a(u) \\le \\log_a(v) \\iff u \\ge v$', condition: 'si $0<a<1$ — sens inversé' },
        ],
      },
      {
        title: 'Dérivée et dérivation logarithmique',
        formulas: [
          { text: "$(\\ln(x))' = \\dfrac{1}{x}$" },
          { text: "$(\\log_a(x))' = \\dfrac{1}{x \\cdot \\ln(a)}$" },
          { text: "$(\\ln(u(x)))' = \\dfrac{u'(x)}{u(x)}$" },
          { text: "$(\\ln|u(x)|)' = \\dfrac{u'(x)}{u(x)}$", condition: 'là où $u(x) \\neq 0$ — en particulier $(\\ln|x|)\' = \\dfrac{1}{x}$' },
          {
            text: "$((g(x))^{h(x)})' = \\left(h'(x)\\ln(g(x)) + \\dfrac{h(x)g'(x)}{g(x)}\\right)(g(x))^{h(x)}$",
            condition: 'dérivation logarithmique, exposant variable',
          },
        ],
      },
      {
        title: 'Limites et croissance comparée',
        formulas: [
          {
            text: '$\\lim_{x \\to 0^+} \\log_a(x) = -\\infty \\quad \\lim_{x \\to +\\infty} \\log_a(x) = +\\infty$',
            condition: 'si $a>1$',
          },
          {
            text: '$\\lim_{x \\to 0^+} \\log_a(x) = +\\infty \\quad \\lim_{x \\to +\\infty} \\log_a(x) = -\\infty$',
            condition: 'si $0<a<1$',
          },
          {
            text: '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{\\log_a(x)}{x^k} = 0$',
            condition: 'pour $a>1$ et tout $k>0$',
          },
          { text: '$a^x > x^n > \\log_b(x)$', condition: 'pour $x$ assez grand, $a>1$, $b>1$, $n>0$' },
          { text: '$\\displaystyle\\lim_{x \\to 0^+} x\\ln(x) = 0 \\qquad \\lim_{u \\to 0} \\dfrac{\\ln(1+u)}{u} = 1$' },
          { text: '$\\ln(x) \\le x - 1$', condition: 'pour tout $x>0$ — égalité seulement en $x=1$' },
        ],
      },
      {
        title: 'Hyperboliques et modèles',
        formulas: [
          { text: '$\\text{ch}(x) = \\dfrac{e^x+e^{-x}}{2} \\qquad \\text{sh}(x) = \\dfrac{e^x-e^{-x}}{2}$' },
          { text: '$\\text{ch}^2(x) - \\text{sh}^2(x) = 1$' },
          { text: "$\\text{sh}'(x) = \\text{ch}(x) \\qquad \\text{ch}'(x) = \\text{sh}(x)$" },
          { text: '$T = \\dfrac{\\ln(2)}{\\lambda}$', condition: 'demi-vie, pour $N(t)=N_0 e^{-\\lambda t}$' },
          { text: '$t = \\dfrac{\\ln(2)}{r}$', condition: 'temps de doublement, pour $C(t)=C_0 e^{rt}$' },
          { text: '$\\text{argsh}(x) = \\ln\\left(x + \\sqrt{x^2+1}\\right)$', condition: 'réciproque de sh' },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Propriété', 'Énoncé'],
      rows: [
        ['Domaine', ']0;+∞['],
        ['Valeurs particulières', 'ln(1)=0, ln(e)=1'],
        ['Somme / différence', 'ln(ab)=ln(a)+ln(b)'],
        ['Dérivée', '1/x (et (ln|x|)′ = 1/x pour x ≠ 0)'],
        ['Limite en 0⁺', '−∞'],
        ['Limite en +∞', '+∞ (très lente)'],
      ],
    },
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je déterminé le domaine (CE) AVANT de résoudre, et confronté chaque solution à la CE de l\'équation de départ ?',
        'Après avoir regroupé ou séparé des logarithmes, ai-je vérifié que le domaine n\'a pas changé (ln(x²) = 2 ln|x|, pas 2 ln x) ?',
        'Pour une inéquation, ai-je tenu compte de la base (sens inversé si 0 < a < 1) — et inversé le sens en divisant par ln(a) < 0 ?',
        'Ai-je évité ln(x + y) = ln(x) + ln(y) ? La propriété porte sur un produit, jamais sur une somme.',
        'Pour une étude de fonction : domaine, limites et asymptotes, dérivée et variations, concavité — dans cet ordre ?',
      ],
    },
    forward:
      'ln et exp se défont mutuellement, et ln est dominée par toute puissance de x en +∞. Au ' +
      'chapitre 4, la dérivée $(\\ln|x|)\' = \\dfrac{1}{x}$ se lira à l\'envers : une primitive de ' +
      '$\\dfrac{1}{x}$ est $\\ln|x|$ — le logarithme reviendra dans toutes les intégrales de la forme ' +
      '$\\dfrac{u\'}{u}$.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai/faux : réviser tout le chapitre',
      generatorId: '6gen66',
      description: [
        'Choisis un thème et teste-toi sur tout le chapitre : 350 affirmations pré-écrites en ' +
          '10 thèmes (35 par thème), une seule tentative par question, justification toujours ' +
          'révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 66. Quiz vrai/faux — Fonctions logarithmes »',
    },
  },
}
