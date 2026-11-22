import type { ChapterContent } from '../../types'

export const equationsInequationsSecondDegre: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 2,
  title: 'Équations et inéquations du second degré',
  slug: 'equations-inequations-second-degre',
  lede:
    'Au chapitre 1, tu as appris à lire une parabole. Dans ce chapitre-ci, tu vas apprendre à ' +
    'résoudre — vite et sans te tromper. Tu vas reconnaître la bonne technique pour une ' +
    'équation $ax^2+bx+c=0$, en déduire le signe d\'un trinôme ou d\'un produit de facteurs, ' +
    'puis utiliser ces outils avec des fractions et des inéquations.',

  intro: {
    title: 'Avant de commencer : équation, racine, solution',
    blocks: [
        { kind: 'video', title: 'Avant de commencer : équation, racine, solution', youtubeId: 'jxrUxZS1DFQ' },
      {
        kind: 'para',
        text:
          'Résoudre $ax^2+bx+c=0$, c\'est trouver les valeurs de x qui donnent 0 quand on les ' +
          'remplace dans l\'expression. Au chapitre 1, tu trouvais ces valeurs en lisant un ' +
          'graphique — on les appelait les **zéros**. Ici, tu vas les calculer directement, ' +
          'sans dessiner.',
      },
      {
        kind: 'para',
        text:
          'Attention : l\'équation ne se présente pas toujours sous cette forme toute simple. ' +
          'Elle peut être cachée derrière une fraction, un carré déjà développé, ou un membre ' +
          'qui n\'est pas nul. Le vrai objectif de ce chapitre : reconnaître, à chaque fois, la ' +
          'méthode la plus efficace.',
      },
      {
        kind: 'rappel',
        label: 'Vocabulaire',
        items: [
          'Une **racine** annule une expression qu\'on rencontre en cours de calcul (un facteur, ' +
            'un numérateur…). Une **solution** vérifie vraiment l\'équation ou l\'inéquation de ' +
            'l\'énoncé. Le plus souvent, c\'est la même chose — mais pas toujours : une racine ' +
            'peut aussi annuler un dénominateur, et devenir alors une **racine étrangère**, à ' +
            'rejeter. Tu verras ça dans la section « L\'inconnue au dénominateur ».',
        ],
      },
    ],
  },

  sections: [
    {
      id: 'resoudre',
      number: 1,
      title: 'Résoudre une équation du second degré',
      kicker: '3 raccourcis, 1 cas sans solution visible, 1 cas caché, et le discriminant en dernier recours',
      titreCourt: 'Résoudre une équation',
      partie: 'Résoudre, puis étudier un signe',
      essentiel: [
        'Essaie d\'abord les raccourcis : $c = 0$ → mettre x en évidence ; $b = 0$ → différence de deux carrés (aucune solution si a et c sont de même signe) ; un carré parfait → une racine double ; la même expression des deux côtés → la mettre en évidence (le cas caché).',
        'Cas général : $\\Delta = b^2 - 4ac$. Si $\\Delta > 0$, deux solutions $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$ ; si $\\Delta = 0$, une racine double ; si $\\Delta < 0$, aucune solution réelle.',
        'Viète : $x_1 + x_2 = -\\dfrac{b}{a}$ et $x_1 \\cdot x_2 = \\dfrac{c}{a}$. Si $\\Delta \\geq 0$, $ax^2+bx+c = a(x-x_1)(x-x_2)$ ; si $a + b + c = 0$, 1 est une racine évidente.',
      ],
      cartes: [
        { question: 'Quel raccourci pour résoudre $2x^2 - 6x = 0$ ?', reponse: '$c = 0$ : on met x en évidence, $2x(x-3) = 0$, donc $x = 0$ ou $x = 3$.' },
        { question: 'Quelles sont les solutions de $ax^2 + bx + c = 0$ quand $\\Delta > 0$ ?', reponse: '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$, avec $\\Delta = b^2 - 4ac$.' },
        { question: 'Résous $3x^2 - 5x + 2 = 0$ sans calculer le discriminant.', reponse: '$3 - 5 + 2 = 0$, donc $x_1 = 1$ ; le produit donne $x_2 = \\dfrac{c}{a} = \\dfrac{2}{3}$.' },
        { question: 'Écris une équation de solutions 2 et 5 sous la forme $x^2 - Sx + P = 0$.', reponse: '$S = 7$ et $P = 10$ : $x^2 - 7x + 10 = 0$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Résoudre une équation du second degré (1/3) : les raccourcis avant le discriminant', youtubeId: '6WDdAWpUZW8' },
        { kind: 'video', title: 'Résoudre une équation du second degré (2/3) : le discriminant', youtubeId: 'Vv3ZyYvgF5A' },
        { kind: 'video', title: 'Résoudre une équation du second degré (3/3) : cas caché, Viète, factorisation', youtubeId: 'PvUzvCBSqks' },
        {
          kind: 'para',
          text:
            'Il y a une méthode qui marche à chaque fois : le discriminant. Mais elle demande ' +
            'beaucoup de calculs. Avant de l\'utiliser, regarde toujours le tableau ci-dessous : ' +
            '**3 raccourcis**, et **1 cas** où l\'on voit tout de suite qu\'il n\'y a aucune ' +
            'solution. Le **cas général** se traite au discriminant. Reste **1 cas caché**, dans la ' +
            'forme de l\'énoncé : il vient juste après le discriminant.',
        },
        {
          kind: 'intuition',
          label: 'Le bon réflexe',
          text:
            'Face à une porte fermée, tu n\'attaques pas le mur au marteau tout de suite : tu ' +
            'essaies d\'abord la poignée. Le **discriminant**, c\'est le mur — il marche à ' +
            'chaque fois, mais il demande le plus de calculs. Les 3 raccourcis du tableau ' +
            'ci-dessous, ce sont les poignées : plus rapides, à essayer en premier.',
        },
        {
          kind: 'featureTable',
          caption: 'Reconnaître la technique avant de calculer quoi que ce soit',
          headers: ['Ce que tu vois dans l\'équation', 'Ce que tu fais'],
          rows: [
            ['raccourci 1 — c = 0 : pas de terme constant', 'tu mets x en évidence'],
            ['raccourci 2 — b = 0, et a et c de signes opposés', 'différence de deux carrés'],
            ['raccourci 3 — un carré parfait se reconnaît (b² = 4ac), ex. x² − 6x + 9', 'tu l\'écris (x − 3)² = 0 : une racine double'],
            ['sans solution visible — b = 0, et a et c de même signe', 'aucune solution : x² = −c/a est négatif'],
            ['cas général — aucune des conditions ci-dessus', 'le discriminant'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'mise en évidence — c = 0',
          formula: '$2x^2 - 6x = 0$',
          steps: [{ tag: 'x apparaît dans les deux termes', text: '$2x(x-3) = 0$' }],
          result: { tag: 'solutions', text: '$x = 0$ ou $x = 3$' },
        },
        {
          kind: 'piege',
          text:
            'Le facteur x doit être bien visible. $-2x^2+6x=0$ devient $2x(3-x)=0$, ou ' +
            '$-2x(x-3)=0$. Mais jamais $-x(2x-6)=0$ ! Le signe moins doit toujours être dans un ' +
            'des facteurs — pas oublié devant le x.',
        },
        {
          kind: 'exemple',
          badge: 'différence de deux carrés — b = 0',
          formula: '$2x^2 - 18 = 0$',
          steps: [{ tag: 'différence de deux carrés', text: '$2(x^2-9) = 2(x-3)(x+3) = 0$' }],
          result: { tag: 'solutions', text: '$x = -3$ ou $x = 3$' },
        },
        {
          kind: 'attention',
          label: 'Attention — quand −c/a n\'est pas un carré',
          text:
            'La différence de deux carrés marche toujours, même si les nombres ne « tombent pas ' +
            'juste » : isole $x^2$. $2x^2 - 5 = 0 \\iff x^2 = \\dfrac{5}{2} \\iff x = \\pm\\sqrt{\\dfrac{5}{2}} = ' +
            '\\pm\\dfrac{\\sqrt{10}}{2}$. Et si a et c sont de **même signe** ($2x^2 + 5 = 0$), $x^2$ ' +
            'devrait être négatif : aucune solution, sans le moindre calcul.',
        },
        {
          kind: 'exemple',
          badge: 'carré parfait — Δ = 0',
          formula: '$2x^2-12x+18=0$',
          steps: [
            { tag: 'mettre 2 en évidence', text: '$2(x^2-6x+9) = 0$' },
            { tag: 'reconnaître (a − b)² = a² − 2ab + b²', text: '$x^2-6x+9 = x^2 - 2 \\cdot 3 \\cdot x + 3^2 = (x-3)^2$, donc $2(x-3)^2 = 0$' },
          ],
          result: { tag: 'solution (racine double)', text: '$x = 3$' },
        },
        {
          kind: 'historique',
          titre: 'D\'où vient la notation x², a, b, c que tu utilises partout ?',
          text:
            'La notation de ce chapitre — $x^2$, les coefficients a, b, c, le signe = — n\'a ' +
            'pas toujours existé. Pendant des siècles, les mathématiciens écrivaient leurs ' +
            'équations en phrases entières (« le carré de la chose, plus cinq fois la chose, ' +
            'moins six, égale zéro »), ce qui rendait les calculs longs et les erreurs ' +
            'fréquentes. C\'est le Français **René Descartes**, dans son traité La Géométrie, ' +
            'publié en 1637, qui généralise l\'usage de lettres : a, b, c pour des quantités ' +
            'connues, x, y, z pour des inconnues, et l\'exposant $x^2$ pour « x au carré » — ' +
            'une notation si pratique qu\'elle s\'est imposée presque telle quelle jusqu\'à ' +
            'aujourd\'hui. Sans elle, résoudre une équation du second degré demanderait encore ' +
            'des paragraphes entiers de texte.',
          image: {
            src: '/images/historique/descartes.jpg',
            alt: 'Portrait de René Descartes',
            caption: 'René Descartes (1596–1650), portrait d\'après Frans Hals, 1649.',
          },
        },
        { kind: 'subheading', text: 'Le cas général — la formule du discriminant' },
        {
          kind: 'intuition',
          label: 'Tu as déjà vu ça, au chapitre 1',
          text:
            'Au chapitre 1, tu lisais le nombre de zéros d\'une parabole sur son graphique : ' +
            'deux fois où elle coupe l\'axe des x, une seule (elle le touche du bout, au ' +
            'sommet), ou jamais. Le signe de $\\Delta$ te donne exactement cette information, ' +
            'mais par le calcul, sans dessiner : $\\Delta>0$ donne deux solutions, $\\Delta=0$ ' +
            'une seule (racine double), $\\Delta<0$ aucune solution réelle — la parabole ne ' +
            'touche jamais l\'axe.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 2 * x * x - 10 * x + 8, tone: 'accent' }],
              xMin: 0,
              xMax: 5,
              xTicks: [],
              showYAxis: false,
              roots: [
                { x: 1, label: '1' },
                { x: 4, label: '4' },
              ],
              xAxisLabel: '',
              yAxisLabel: '',
              caption: '$\\Delta > 0$ : deux solutions. La parabole de $2x^2-10x+8$ coupe l\'axe en 1 et en 4.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 2 * x * x - 12 * x + 18, tone: 'accent' }],
              xMin: 1,
              xMax: 5,
              xTicks: [],
              showYAxis: false,
              roots: [{ x: 3, label: '3' }],
              xAxisLabel: '',
              yAxisLabel: '',
              caption: '$\\Delta = 0$ : une racine double. La parabole de $2x^2-12x+18$ touche l\'axe en 3, à son sommet.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => x * x - 2 * x + 5, tone: 'bad' }],
              xMin: -1,
              xMax: 3,
              xTicks: [],
              showYAxis: false,
              xAxisLabel: '',
              yAxisLabel: '',
              caption: '$\\Delta < 0$ : aucune solution. La parabole de $x^2-2x+5$ ne touche jamais l\'axe.',
            },
          ],
        },
        {
          kind: 'para',
          text:
            'Si aucun des 3 raccourcis ne marche, et qu\'on ne voit pas tout de suite qu\'il n\'y a ' +
            'aucune solution, pas de souci : utilise la formule du discriminant. Elle marche ' +
            '**toujours**. Voici comment on la retrouve, étape par étape.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — formule du discriminant',
          blocks: [
            {
              kind: 'para',
              text:
                "On part de l'équation générale $ax^2+bx+c=0$ (avec $a \\neq 0$), et on va " +
                'faire apparaître un **carré parfait** pour isoler x — cette technique ' +
                "s'appelle **compléter le carré**.",
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — mettre a en évidence.** Attention, seulement sur les deux premiers ' +
                'termes, jamais sur c : $ax^2+bx+c = a\\left(x^2+\\dfrac{b}{a}x\\right)+c$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — repérer le carré parfait à faire apparaître.** On veut ' +
                'transformer $x^2+\\dfrac{b}{a}x$ en un carré de la forme ' +
                '$(x+k)^2 = x^2+2kx+k^2$. En identifiant $2k=\\dfrac{b}{a}$, on trouve ' +
                '$k=\\dfrac{b}{2a}$ — la **moitié** de $b/a$, pas $b/a$ tout court, piège classique.',
            },
            {
              kind: 'para',
              text:
                'Donc $\\left(x+\\dfrac{b}{2a}\\right)^2 = x^2+\\dfrac{b}{a}x+\\dfrac{b^2}{4a^2}$, ' +
                'ce qui donne $x^2+\\dfrac{b}{a}x = \\left(x+\\dfrac{b}{2a}\\right)^2-\\dfrac{b^2}{4a^2}$ ' +
                "— le carré complet, moins le terme en trop qu'on vient d'ajouter.",
            },
            {
              kind: 'para',
              text:
                "**Étape 3 — réinjecter dans l'expression de départ.** " +
                '$a\\left(x^2+\\dfrac{b}{a}x\\right)+c = ' +
                'a\\left[\\left(x+\\dfrac{b}{2a}\\right)^2-\\dfrac{b^2}{4a^2}\\right]+c = ' +
                'a\\left(x+\\dfrac{b}{2a}\\right)^2-\\dfrac{b^2}{4a}+c$ (en distribuant le a ' +
                'dans les crochets : $a\\cdot\\dfrac{b^2}{4a^2}=\\dfrac{b^2}{4a}$).',
            },
            {
              kind: 'para',
              text:
                '**Étape 4 — regrouper les deux termes constants.** Même dénominateur $4a$ : ' +
                '$-\\dfrac{b^2}{4a}+c = -\\dfrac{b^2}{4a}+\\dfrac{4ac}{4a} = ' +
                '\\dfrac{4ac-b^2}{4a} = -\\dfrac{b^2-4ac}{4a} = -\\dfrac{\\Delta}{4a}$, en posant ' +
                '$\\Delta=b^2-4ac$.',
            },
            {
              kind: 'para',
              text:
                "L'équation $ax^2+bx+c=0$ s'écrit donc " +
                '$a\\left(x+\\dfrac{b}{2a}\\right)^2-\\dfrac{\\Delta}{4a}=0$, soit ' +
                '$a\\left(x+\\dfrac{b}{2a}\\right)^2=\\dfrac{\\Delta}{4a}$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 5 — isoler le carré.** On divise les deux membres par $a$ (possible ' +
                'car $a \\neq 0$) : $\\left(x+\\dfrac{b}{2a}\\right)^2=\\dfrac{\\Delta}{4a^2}$.',
            },
            {
              kind: 'para',
              text:
                "**Étape 6 — prendre la racine carrée.** C'est seulement possible si le membre " +
                'de droite est positif ou nul — donc si $\\Delta \\geq 0$, puisque $4a^2$ est ' +
                'toujours strictement positif. Si $\\Delta < 0$ : l\'équation n\'a **aucune ' +
                'solution réelle**.',
            },
            {
              kind: 'para',
              text:
                'Si $\\Delta \\geq 0$ : $x+\\dfrac{b}{2a}=\\pm\\dfrac{\\sqrt{\\Delta}}{2a}$, donc ' +
                '$x=-\\dfrac{b}{2a}\\pm\\dfrac{\\sqrt{\\Delta}}{2a}=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}$. ' +
                '$\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'cas général',
          formula: '$2x^2 - 10x + 8 = 0$',
          steps: [
            { tag: 'discriminant', text: '$\\Delta = (-10)^2 - 4 \\cdot 2 \\cdot 8 = 100 - 64 = 36$' },
            { tag: 'racine carrée de Δ', text: '$\\sqrt{36} = 6$' },
          ],
          result: { tag: 'solutions', text: '$x = \\dfrac{10+6}{4} = 4$ ou $x = \\dfrac{10-6}{4} = 1$' },
        },
        {
          kind: 'piege',
          label: 'Erreur de signe classique',
          text:
            'Regarde bien : c\'est **−b**, pas b ! Si tu oublies le signe moins, tu écris ' +
            '$x = \\dfrac{b \\pm \\sqrt{\\Delta}}{2a}$. Ici, ça donne $x=-4$ ou $x=-1$ : deux ' +
            'réponses fausses, même si Δ était bien calculé.',
        },
        {
          kind: 'exemple',
          badge: 'coefficients irrationnels',
          formula: 'Résous $x^2 + 2\\sqrt{2}\\,x - 6 = 0$, puis $x^2 + 6\\sqrt{2}\\,x + 18 = 0$.',
          steps: [
            { tag: 'Δ : élever le coefficient au carré', text: '$\\Delta = \\left(2\\sqrt{2}\\right)^2 - 4 \\cdot 1 \\cdot (-6) = 4 \\cdot 2 + 24 = 32$' },
            { tag: 'simplifier √Δ', text: '$\\sqrt{32} = \\sqrt{16 \\cdot 2} = 4\\sqrt{2}$' },
            { tag: 'racines', text: '$x = \\dfrac{-2\\sqrt{2} \\pm 4\\sqrt{2}}{2}$ : $x = \\dfrac{2\\sqrt{2}}{2} = \\sqrt{2}$ ou $x = \\dfrac{-6\\sqrt{2}}{2} = -3\\sqrt{2}$' },
            { tag: 'seconde équation', text: '$\\Delta = \\left(6\\sqrt{2}\\right)^2 - 4 \\cdot 1 \\cdot 18 = 72 - 72 = 0$ : racine double $x = -\\dfrac{6\\sqrt{2}}{2} = -3\\sqrt{2}$' },
          ],
          result: { tag: 'solutions', text: '$x = \\sqrt{2}$ ou $x = -3\\sqrt{2}$ ; puis $x = -3\\sqrt{2}$ (racine double)' },
        },
        {
          kind: 'astuce',
          label: 'Astuce — un coefficient avec une racine carrée',
          text:
            'La méthode ne change pas : seul le calcul de Δ demande un peu de soin. Élève au carré ' +
            'chaque morceau, $\\left(k\\sqrt{n}\\right)^2 = k^2 \\cdot n$, puis simplifie $\\sqrt{\\Delta}$ en ' +
            'sortant le plus grand carré possible : $\\sqrt{32} = \\sqrt{16 \\cdot 2} = 4\\sqrt{2}$. Les ' +
            'racines se simplifient alors comme des fractions ordinaires.',
        },
        {
          kind: 'exemple',
          badge: 'équation sans solution',
          formula: 'Résous $3x^2 + 12 = 0$, puis $x^2 - 2x + 5 = 0$.',
          steps: [
            { tag: 'b = 0, a et c de même signe', text: '$3x^2 = -12 \\iff x^2 = -4$ : un carré n\'est jamais négatif' },
            { tag: 'seconde équation : le discriminant', text: '$\\Delta = (-2)^2 - 4 \\cdot 1 \\cdot 5 = 4 - 20 = -16 < 0$' },
          ],
          result: { tag: 'solutions', text: 'aucune solution réelle, dans les deux cas : $S = \\varnothing$' },
        },
        {
          kind: 'atelier',
          tag: 'discriminant-racines-widget',
          label: 'Manipule toi-même — a, b, c et le discriminant',
          caption:
            'Fais varier a, b et c : Δ se recalcule en direct et la parabole change de ' +
            'couleur selon son signe. Quand il y a des racines, regarde S et P (relations ' +
            'de Viète), la forme factorisée a(x − x₁)(x − x₂), et le sommet, toujours à ' +
            'mi-chemin des deux racines (xₛ = S/2).',
        },
        {
          kind: 'historique',
          titre: 'Un mathématicien indien résolvait déjà ce cas il y a 900 ans',
          text:
            'La formule générale que tu viens de démontrer — avec les deux solutions ' +
            'possibles $\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}$ — apparaît déjà, sous une forme ' +
            'équivalente, dans le traité Bijaganita du mathématicien indien **Bhāskara II**, ' +
            'écrit vers 1150. Il est l\'un des premiers à accepter et manipuler ' +
            'systématiquement les solutions négatives et irrationnelles d\'une équation, là où ' +
            'beaucoup de mathématiciens de son époque — et bien après lui — rejetaient encore ' +
            'les nombres négatifs comme « absurdes » ou refusaient de les compter comme de ' +
            'vraies solutions. Il faudra encore plusieurs siècles avant que l\'Europe n\'accepte ' +
            'pleinement ce genre de solutions.',
        },
        {
          kind: 'historique',
          titre: 'Un carré, dix racines, trente-neuf : la démonstration en dessin',
          text:
            'Tu as rencontré **al-Khwārizmī** au chapitre 1. Voici comment il résolvait, vers 820, ' +
            '« un carré et dix racines égalent trente-neuf » ($x^2 + 10x = 39$), sans aucune lettre : ' +
            'il dessine un carré de côté x, lui accole deux rectangles de largeur 5, puis ajoute le ' +
            'petit carré manquant, d\'aire 25. Le grand carré obtenu a pour aire 39 + 25 = 64, donc ' +
            'pour côté 8, et x = 8 − 5 = 3. Remplace 10 par $\\dfrac{b}{a}$ et 39 par $-\\dfrac{c}{a}$ : ' +
            'c\'est exactement la démonstration du discriminant ci-dessus, faite avec des figures. ' +
            'La solution négative (−13), elle, n\'avait aucun sens pour lui : une longueur ne peut ' +
            'pas être négative.',
        },
        {
          kind: 'atelier',
          tag: 'completer-le-carre-widget',
          label: 'Manipule toi-même — compléter un vrai carré',
          caption:
            'Al-Khwārizmī résolvait x² + bx = c avec un vrai dessin : un carré x², deux ' +
            'rectangles de largeur b/2, et un coin vide. Appuie sur « Compléter le carré » ' +
            ': en ajoutant le petit carré (b/2)² des deux côtés, on obtient un grand carré ' +
            'de côté x + b/2, dont on lit la longueur. C\'est exactement l\'étape « compléter ' +
            'le carré » de la démonstration du discriminant.',
        },
        { kind: 'subheading', text: 'Le cas caché — mettre une expression entière en évidence' },
        {
          kind: 'para',
          text:
            'Reste le cas caché. Tu ne le vois pas en regardant a, b et c une fois ' +
            'l\'équation développée. Tu le vois dans la **forme de l\'énoncé**, avant de développer.',
        },
        {
          kind: 'exemple',
          badge: 'mise en évidence généralisée',
          formula: '$(x+2)^2 = 3(x+2)$',
          steps: [
            {
              tag: 'ne développe jamais — (x+2) est un facteur commun',
              text: '$(x+2)^2-3(x+2)=0 \\iff (x+2)[(x+2)-3]=0=(x+2)(x-1)=0$',
            },
          ],
          result: { tag: 'solutions', text: '$x = -2$ ou $x = 1$' },
        },
        {
          kind: 'astuce',
          text:
            'Tu vois la même expression entre parenthèses des deux côtés du signe = ? Ici, ' +
            'c\'est $(x+2)$. Alors ne développe pas le carré ! Passe tout d\'un côté, et mets ' +
            'cette expression en facteur commun — exactement comme tu l\'as fait avec x, dans ' +
            'le tout premier exemple.',
        },
        { kind: 'subheading', text: 'Somme et produit des racines (relations de Viète)' },
        {
          kind: 'para',
          text:
            'Connaître la somme et le produit des racines, ça sert à vérifier une solution. Ou ' +
            'à retrouver une racine si tu connais déjà l\'autre. Pas besoin de refaire tout le ' +
            'calcul du discriminant !',
        },
        {
          kind: 'rappel',
          label: 'Relations de Viète',
          items: [
            'Pour une équation $ax^2+bx+c=0$ ($\\Delta \\geq 0$ ; si $\\Delta = 0$, la racine double ' +
              'compte deux fois), la somme des racines vaut ' +
              '$x_1+x_2 = -\\dfrac{b}{a}$.',
            'Le produit des racines vaut $x_1 \\cdot x_2 = \\dfrac{c}{a}$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — relations de Viète',
          blocks: [
            {
              kind: 'para',
              text:
                'On part des deux racines données par la formule du discriminant (avec ' +
                '$\\Delta > 0$) : $x_1 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$ et ' +
                '$x_2 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$.',
            },
            {
              kind: 'para',
              text:
                '**Somme.** On additionne les deux fractions, même dénominateur $2a$ : ' +
                '$x_1+x_2 = \\dfrac{(-b+\\sqrt{\\Delta})+(-b-\\sqrt{\\Delta})}{2a}$. Au numérateur, ' +
                'les termes en $\\sqrt{\\Delta}$ s\'annulent ($+\\sqrt{\\Delta}-\\sqrt{\\Delta}=0$), ' +
                'il reste $-b-b=-2b$ : $x_1+x_2 = \\dfrac{-2b}{2a} = -\\dfrac{b}{a}$.',
            },
            {
              kind: 'para',
              text:
                '**Produit.** On multiplie les deux fractions : ' +
                '$x_1 \\cdot x_2 = \\dfrac{(-b+\\sqrt{\\Delta})(-b-\\sqrt{\\Delta})}{(2a)^2}$. Le ' +
                'numérateur est de la forme $(u+v)(u-v)=u^2-v^2$ avec $u=-b$ et ' +
                '$v=\\sqrt{\\Delta}$ : $(-b)^2-(\\sqrt{\\Delta})^2 = b^2-\\Delta$.',
            },
            {
              kind: 'para',
              text:
                'On remplace $\\Delta$ par $b^2-4ac$ : $b^2-\\Delta = b^2-(b^2-4ac) = 4ac$. ' +
                'Donc $x_1 \\cdot x_2 = \\dfrac{4ac}{4a^2} = \\dfrac{c}{a}$.',
            },
            {
              kind: 'para',
              text:
                '**Cas Δ = 0.** Les deux racines sont confondues : $x_1 = x_2 = -\\dfrac{b}{2a}$. ' +
                'Donc $x_1+x_2 = -\\dfrac{2b}{2a} = -\\dfrac{b}{a}$ et ' +
                '$x_1 \\cdot x_2 = \\dfrac{b^2}{4a^2}$. Or $\\Delta = 0$ veut dire $b^2 = 4ac$ : ' +
                '$x_1 \\cdot x_2 = \\dfrac{4ac}{4a^2} = \\dfrac{c}{a}$. Les deux relations valent ' +
                'donc pour $\\Delta \\geq 0$. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'historique',
          titre: 'Pourquoi ces relations portent le nom de Viète',
          text:
            'Les relations entre la somme/produit des racines et les coefficients a, b, c que ' +
            'tu viens de démontrer portent le nom du mathématicien français **François ' +
            'Viète** (1540–1603), qui les établit à la fin du 16e siècle. Mais sa contribution ' +
            'va bien au-delà de ces deux formules : Viète est le premier à utiliser ' +
            'systématiquement des **lettres** pour représenter à la fois les quantités connues et ' +
            'les quantités inconnues d\'un problème — jusque-là, les mathématiciens résolvaient ' +
            'chaque équation au cas par cas, avec des nombres concrets, sans méthode générale ' +
            'écrite une fois pour toutes. En introduisant ce langage symbolique, Viète invente ' +
            'ce qu\'on appelle aujourd\'hui l\'algèbre « littérale » — l\'algèbre que tu ' +
            'pratiques dans tout ce chapitre.',
          image: {
            src: '/images/historique/viete.jpg',
            alt: 'Portrait de François Viète',
            caption: 'François Viète (1540–1603), portrait d\'époque.',
          },
        },
        { kind: 'subheading', text: 'Deux raccourcis tirés de Viète' },
        {
          kind: 'rappel',
          label: 'Racine évidente',
          items: [
            'Si $a + b + c = 0$, alors $x_1 = 1$ est racine (remplace x par 1 : il reste $a + b + c$). ' +
              'Le produit des racines donne l\'autre : $x_2 = \\dfrac{c}{a}$.',
            'Si $a - b + c = 0$, alors $x_1 = -1$ est racine, et $x_2 = -\\dfrac{c}{a}$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — racine évidente',
          blocks: [
            {
              kind: 'para',
              text:
                'On suppose $a+b+c=0$, avec $a \\neq 0$. **Étape 1 — 1 est racine.** On remplace x ' +
                'par 1 : $a \\cdot 1^2 + b \\cdot 1 + c = a+b+c = 0$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — factoriser.** De $a+b+c=0$, on tire $b = -a-c$. Donc ' +
                '$ax^2+bx+c = ax^2-(a+c)x+c = ax^2-ax-cx+c = ax(x-1)-c(x-1) = (x-1)(ax-c)$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — produit nul.** $(x-1)(ax-c) = 0 \\iff x = 1$ ou $ax = c$, soit ' +
                '$x = \\dfrac{c}{a}$ (possible car $a \\neq 0$).',
            },
            {
              kind: 'para',
              text:
                'Même chemin si $a-b+c=0$ : x = −1 donne $a-b+c=0$, et $b = a+c$ donne ' +
                '$ax^2+bx+c = (x+1)(ax+c)$, d\'où $x=-1$ ou $x=-\\dfrac{c}{a}$. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'racine évidente — a + b + c = 0',
          formula: 'Résous $3x^2 - 5x + 2 = 0$ sans calculer le discriminant.',
          steps: [
            { tag: 'tester a + b + c', text: '$3 - 5 + 2 = 0$ : $x_1 = 1$ est racine' },
            { tag: 'l\'autre racine par le produit', text: '$x_1 \\cdot x_2 = \\dfrac{c}{a} = \\dfrac{2}{3}$, donc $x_2 = \\dfrac{2}{3}$' },
          ],
          result: { tag: 'solutions', text: '$x = 1$ ou $x = \\dfrac{2}{3}$' },
        },
        {
          kind: 'astuce',
          label: 'Racine évidente ou discriminant ? Les deux sont justes',
          text:
            'Quand $a+b+c=0$ (ou $a-b+c=0$), tu as le choix : la racine évidente est plus rapide, ' +
            'mais le discriminant marche aussi. Par exemple, l\'équation du cas général ' +
            '$2x^2-10x+8=0$ vérifie $2-10+8=0$ : $x_1 = 1$ et $x_2 = \\dfrac{8}{2} = 4$, sans calculer ' +
            'Δ — exactement les solutions trouvées plus haut avec le discriminant.',
        },
        {
          kind: 'atelier',
          tag: 'methodes-resolution-widget',
          label: 'Manipule toi-même — les 6 situations en un coup d\'œil',
          caption:
            'Règle a, b et c, ou choisis une équation du cours : l\'atelier allume la situation ' +
            'qui s\'applique (c = 0, b = 0 avec a et c de signes opposés, b = 0 avec a et c de ' +
            'même signe, carré parfait, racine évidente, cas général) et affiche la résolution ' +
            'correspondante. Quand plusieurs situations marchent, elles s\'allument toutes. Le ' +
            'cas caché, lui, ne se voit que dans la forme de l\'énoncé.',
        },
        {
          kind: 'rappel',
          label: 'Le signe des racines, sans les calculer',
          items: [
            'Si $P = \\dfrac{c}{a} < 0$, les deux racines existent et sont de **signes opposés** (inutile ' +
              'de vérifier Δ : il est forcément positif).',
            'Si $\\Delta > 0$ et $P > 0$, elles ont le même signe : celui de $S = -\\dfrac{b}{a}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'signe des racines',
          formula: 'Sans les calculer, donne le signe des racines de $x^2 - 3x - 10 = 0$, puis de $2x^2 + 7x + 3 = 0$.',
          steps: [
            { tag: 'première équation', text: '$P = -10 < 0$ : deux racines de signes opposés (ce sont 5 et −2)' },
            { tag: 'seconde équation', text: '$\\Delta = 49 - 24 = 25 > 0$, $P = \\dfrac{3}{2} > 0$ et $S = -\\dfrac{7}{2} < 0$ : deux racines négatives (ce sont $-\\dfrac{1}{2}$ et $-3$)' },
          ],
          result: { tag: 'à retenir', text: 'Le signe de P, puis celui de S, suffisent.' },
        },
        {
          kind: 'atelier',
          tag: 'viete-racines-widget',
          label: 'Manipule toi-même — racines, somme et produit',
          caption:
            'Fais glisser les deux racines : la parabole a(x − x₁)(x − x₂) se redessine, ' +
            'avec S = x₁ + x₂, P = x₁·x₂ et l\'équation x² − Sx + P = 0. Sans calculer les ' +
            'racines, le signe de P et de S dit déjà si elles sont de même signe ou non. ' +
            'Quand a + b + c = 0, x = 1 est une racine évidente, et l\'autre vaut c/a.',
        },
        { kind: 'subheading', text: 'Factoriser un trinôme grâce à ses racines' },
        {
          kind: 'para',
          text:
            'Il y a encore une chose à savoir sur $x_1$ et $x_2$ : ils permettent aussi ' +
            "d'**écrire le trinôme sous forme factorisée**, sans jamais développer. C'est ce " +
            'qui rendra la section suivante — étudier le signe d\'un trinôme — beaucoup plus ' +
            "simple : le signe d'un produit de deux facteurs du premier degré se lit bien plus " +
            'facilement que le signe direct de $ax^2+bx+c$.',
        },
        {
          kind: 'rappel',
          label: 'Forme factorisée du trinôme',
          items: [
            "Si $\\Delta \\geq 0$, avec $x_1$ et $x_2$ les racines de $ax^2+bx+c=0$ (éventuellement " +
              "confondues si $\\Delta=0$), alors pour tout x réel : " +
              '$ax^2+bx+c = a(x-x_1)(x-x_2)$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — forme factorisée',
          blocks: [
            {
              kind: 'para',
              text:
                'On part cette fois de la forme factorisée elle-même, et on va retrouver ' +
                '$ax^2+bx+c$ en la distribuant, puis en utilisant les relations de Viète ' +
                'démontrées juste au-dessus.',
            },
            {
              kind: 'para',
              text:
                "**Étape 1 — distribuer** $(x-x_1)(x-x_2)$. Chaque terme du premier facteur " +
                'multiplie chaque terme du second : ' +
                '$(x-x_1)(x-x_2) = x \\cdot x - x \\cdot x_2 - x_1 \\cdot x + x_1 \\cdot x_2 = ' +
                'x^2 - (x_1+x_2)x + x_1 x_2$, en regroupant les deux termes en x.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — remultiplier par a.** ' +
                '$a(x-x_1)(x-x_2) = a\\left[x^2 - (x_1+x_2)x + x_1 x_2\\right]$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — remplacer par les relations de Viète.** On a démontré ' +
                'juste avant que $x_1+x_2 = -\\dfrac{b}{a}$ et $x_1 \\cdot x_2 = \\dfrac{c}{a}$ : ' +
                '$a\\left[x^2 - \\left(-\\dfrac{b}{a}\\right)x + \\dfrac{c}{a}\\right] = ' +
                'a\\left[x^2 + \\dfrac{b}{a}x + \\dfrac{c}{a}\\right]$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 4 — distribuer le a.** ' +
                '$a \\cdot x^2 + a \\cdot \\dfrac{b}{a}x + a \\cdot \\dfrac{c}{a} = ax^2+bx+c$, ' +
                'puisque $a$ se simplifie avec le $a$ du dénominateur dans les deux derniers termes.',
            },
            {
              kind: 'para',
              text:
                'Donc, pour $\\Delta \\geq 0$ : $a(x-x_1)(x-x_2) = ax^2+bx+c$. $\\qquad \\blacksquare$',
            },
          ],
        },
        { kind: 'subheading', text: 'Écrire une équation à partir de ses solutions' },
        {
          kind: 'rappel',
          label: 'Forme factorisée',
          items: [
            'Si $x_1$ et $x_2$ sont les solutions d\'une équation du second degré, alors cette ' +
              'équation s\'écrit : $a(x-x_1)(x-x_2)=0$, avec $a \\neq 0$.',
          ],
        },
        {
          kind: 'para',
          text:
            'Par exemple : 3 et −7 sont solutions ? Alors l\'équation est $a(x-3)(x+7)=0$, avec ' +
            '$a \\neq 0$.',
        },
        {
          kind: 'rappel',
          label: 'Forme x² − Sx + P = 0',
          items: [
            'S, c\'est la somme des racines. P, c\'est leur produit. On peut aussi écrire ' +
              'l\'équation comme ça, à un facteur a près : $x^2 - Sx + P = 0$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'application directe',
          steps: [
            { tag: 'racines données', text: '$x_1=2$ et $x_2=5$' },
            { tag: 'somme et produit', text: '$S = x_1+x_2 = 7$, $P = x_1 \\cdot x_2 = 10$' },
          ],
          result: { tag: 'équation', text: '$x^2 - 7x + 10 = 0$' },
        },
        { kind: 'subheading', text: 'Une équation avec un paramètre' },
        {
          kind: 'exemple',
          badge: 'paramètre m — racine double',
          formula: 'Pour quelles valeurs du réel m l\'équation $x^2 + mx + 4 = 0$ admet-elle une racine double ? Combien de solutions a-t-elle selon m ?',
          steps: [
            { tag: 'Δ dépend de m', text: '$\\Delta = m^2 - 4\\cdot1\\cdot4 = m^2 - 16$' },
            { tag: 'racine double : Δ = 0', text: '$m^2 = 16 \\iff m = 4$ ou $m = -4$ (racine double $x = -2$, puis $x = 2$)' },
            { tag: 'discussion', text: '$\\Delta > 0 \\iff m < -4$ ou $m > 4$ : deux solutions ; $-4 < m < 4$ : aucune solution' },
          ],
          result: { tag: 'résultat', text: 'racine double pour $m = \\pm 4$ ; deux solutions si $|m| > 4$, aucune si $|m| < 4$.' },
        },
        {
          kind: 'atelier',
          tag: 'parametre-m-widget',
          label: 'Manipule toi-même — faire varier le paramètre',
          caption:
            'Fais varier m : la parabole se déplace et le nombre de solutions change. Le ' +
            'graphique du bas trace Δ en fonction de m ; ses points d\'intersection avec ' +
            'l\'axe donnent les valeurs de m pour lesquelles l\'équation a une racine double. ' +
            'Avec mx² + 2x + 1, regarde ce qui se passe en m = 0.',
        },
        {
          kind: 'exemple',
          badge: 'pour aller plus loin — équation bicarrée',
          formula: 'Résous $x^4 - 5x^2 + 4 = 0$.',
          steps: [
            { tag: 'poser t = x² (avec t ≥ 0)', text: '$t^2 - 5t + 4 = 0$ : $a + b + c = 0$, donc $t = 1$ ou $t = 4$' },
            { tag: 'revenir à x', text: '$x^2 = 1 \\iff x = \\pm 1$ ; $x^2 = 4 \\iff x = \\pm 2$ — une valeur de t négative aurait été rejetée' },
          ],
          result: { tag: 'solutions', text: '$x \\in \\{-2;-1;1;2\\}$' },
        },
        {
          kind: 'atelier',
          tag: 'bicarree-widget',
          label: 'Manipule toi-même — équation bicarrée : poser t = x²',
          caption:
            'Règle b et c dans x⁴ + bx² + c = 0. En haut, la parabole en t et ses racines t₁ et ' +
            't₂. En bas, chaque valeur de t positive donne deux solutions, −√t et √t, sur l\'axe ' +
            'des x (une seule si t = 0) ; une valeur de t négative est barrée, car x² ne peut pas ' +
            'être négatif. Le premier exemple est celui du cours.',
        },
        {
          kind: 'application',
          titre: 'Trouver le seuil de rentabilité d\'une entreprise',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => -x * x + 60 * x - 500, tone: 'accent' }],
              shadedRegions: [{ from: 10, to: 50, upper: (x) => -x * x + 60 * x - 500, lower: () => 0, tone: 'good' }],
              xMin: 0,
              xMax: 60,
              xTicks: [10, 30, 50],
              yTicks: [200, 400],
              points: [
                { x: 10, y: 0, label: 'seuil bas', tone: 'bad', labelPos: 'below' },
                { x: 50, y: 0, label: 'seuil haut', tone: 'bad', labelPos: 'below' },
                { x: 30, y: 400, label: 'bénéfice max', tone: 'good', labelPos: 'above' },
              ],
              xAxisLabel: 'quantité vendue x',
              yAxisLabel: 'bénéfice B(x) (€)',
              caption:
                'Exemple avec $B(x)=-x^2+60x-500$ : les deux racines x=10 et x=50 sont les ' +
                'seuils de rentabilité — l\'entreprise gagne de l\'argent entre les deux (zone ' +
                'verte) et en perd en dehors.',
            },
          ],
          text:
            'En gestion d\'entreprise, le bénéfice réalisé pour $x$ unités vendues s\'exprime ' +
            'souvent par une fonction du second degré $B(x) = ax^2+bx+c$ (le prix de vente ' +
            'baisse quand on produit plus, ce qui donne cette forme). Le **seuil de ' +
            'rentabilité** — la quantité à partir de laquelle l\'entreprise commence à gagner ' +
            'de l\'argent — correspond exactement aux racines de cette équation : $B(x)=0$. ' +
            'Résoudre $ax^2+bx+c=0$, exactement la technique de cette section, donne ' +
            'directement les deux quantités où le bénéfice s\'annule ; entre ces deux valeurs ' +
            '(ou en dehors, selon le signe de a), l\'entreprise est rentable. Un gestionnaire ' +
            'qui ignorerait la formule du discriminant devrait tester les quantités une par ' +
            'une pour trouver ce seuil — avec elle, un seul calcul suffit.',
          domaines: ['Économie', 'Gestion'],
        },
        {
          kind: 'entrainement',
          title: 'Méthode la plus rapide',
          generatorId: 'gen1',
          description: [
            'Reconnais la technique la plus rapide pour résoudre une équation du second degré ' +
              'donnée (mise en évidence, différence de deux carrés, carré parfait, cas général, ' +
              'mise en évidence généralisée), puis résous-la.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 1. Méthode la plus rapide »',
        },
        {
          kind: 'entrainement',
          title: 'Relations entre racines et coefficients',
          generatorId: 'gen67',
          description: [
            'Calcule la somme et le produit des racines (relations de Viète), factorise le ' +
              'membre de gauche à partir de ses racines, puis construis une équation à partir de ' +
              'ses solutions.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 67. Relations entre racines et coefficients »',
        },
        {
          kind: 'entrainement',
          title: 'Équation à paramètre m',
          generatorId: 'gen115',
          description: [
            'Calcule le discriminant Δ(m) d’une équation qui dépend d’un réel m, trouve les valeurs de m qui donnent une racine double, étudie le signe de Δ(m), puis discute le nombre de solutions selon m.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 115. Équation à paramètre m »',
        },
        {
          kind: 'entrainement',
          title: 'Bicarrées et changement de variable',
          generatorId: 'gen116',
          description: [
            'Résous une équation bicarrée (x⁴, x²) ou du type (x² − 1)² − 5(x² − 1) + 4 = 0 : pose une nouvelle inconnue t, résous en t, rejette les valeurs impossibles (un carré n’est jamais négatif), puis reviens à x.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 116. Bicarrées et changement de variable »',
        },
        {
          kind: 'entrainement',
          title: 'Méthode et nombre de solutions',
          generatorId: 'gen113',
          description: [
            'Série rapide : pour chaque équation, reconnais le raccourci (mise en évidence, différence ' +
              'de deux carrés, aucune solution, carré parfait, racine évidente) ou le cas général, ' +
              'donne le nombre de solutions en une ligne, puis les solutions quand elles sont évidentes.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 113. Méthode et nombre de solutions »',
        },
        {
          kind: 'entrainement',
          title: 'Signe des racines sans les calculer',
          generatorId: 'gen114',
          description: [
            'Sans résoudre l\'équation, décide du signe de ses racines : le produit P = c/a, puis Δ si ' +
              'P > 0, puis la somme S = −b/a. Variante : une racine évidente, puis l\'autre par le produit.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 114. Signe des racines sans les calculer »',
        },
      ],
    },
    {
      id: 'signe-trinome',
      number: 2,
      title: "Étudier le signe d'un trinôme",
      kicker: 'un tableau de signes en 3 étapes, toujours dans le même ordre',
      titreCourt: 'Signe d\'un trinôme',
      partie: 'Résoudre, puis étudier un signe',
      essentiel: [
        'Trois étapes, toujours dans le même ordre : calculer les racines, regarder le signe de a (c\'est le signe du trinôme **à l\'extérieur** des racines), trouver l\'intervalle-solution selon le symbole.',
        'Si $\\Delta < 0$, le trinôme a toujours le signe de a ; si $\\Delta = 0$, le signe de a partout, et il est nul en la racine double ; si $\\Delta > 0$, le signe opposé à a entre les racines.',
        'Crochet ouvert vers l\'intérieur : borne exclue ; vers l\'extérieur : borne incluse. $-\\infty$ et $+\\infty$ ne sont jamais inclus.',
      ],
      cartes: [
        { question: 'Quel est le signe de $ax^2 + bx + c$ entre ses deux racines ?', reponse: 'Le signe opposé à celui de a.' },
        { question: 'Résous $x^2 - x - 6 \\geq 0$.', reponse: 'Racines −2 et 3, $a > 0$ : $S = ]-\\infty;-2] \\cup [3;+\\infty[$.' },
        { question: 'Résous $x^2 + x + 1 < 0$.', reponse: '$\\Delta = -3 < 0$ et $a > 0$ : le trinôme est toujours positif, donc $S = \\varnothing$.' },
        { question: 'Dans $]-2;3]$, quelles bornes sont incluses ?', reponse: 'Seulement 3 : −2 est exclu (crochet ouvert vers l\'intérieur).' },
      ],
      blocks: [
        { kind: 'video', title: 'Étudier le signe d\'un trinôme', youtubeId: 'gZ82w5l4vWQ' },
        {
          kind: 'para',
          text:
            'Pour résoudre $ax^2+bx+c \\lozenge 0$ (◇ veut dire $<, >, \\le, \\ge$), fais ' +
            'toujours les 3 mêmes étapes :',
        },
        {
          kind: 'methode',
          items: [
            "Calcule les racines du trinôme, s'il y en a.",
            'Regarde le signe de a. C\'est le signe du trinôme **à l\'extérieur** des racines.',
            'Trouve l\'intervalle-solution, selon le symbole ◇.',
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les trois cas possibles, selon le signe de Δ',
          headers: ['Discriminant', 'Signe du trinôme'],
          rows: [
            ['Δ < 0', 'toujours le signe de a, jamais nul'],
            ['Δ = 0 (racine double r)', 'signe de a partout, nul seulement en x = r'],
            ['Δ > 0 (racines r₁ < r₂)', 'signe de a à l\'extérieur de [r₁;r₂], signe opposé entre les deux'],
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => x * x - x - 6, tone: 'good', xMin: -3.5, xMax: -2 },
                { fn: (x) => x * x - x - 6, tone: 'bad', xMin: -2, xMax: 3 },
                { fn: (x) => x * x - x - 6, tone: 'good', xMin: 3, xMax: 4.5 },
              ],
              xMin: -3.5,
              xMax: 4.5,
              xTicks: [],
              showYAxis: false,
              roots: [
                { x: -2, label: '−2' },
                { x: 3, label: '3' },
              ],
              xAxisLabel: '',
              yAxisLabel: '',
              caption:
                '$\\Delta > 0$ : $x^2-x-6$ est positif (vert) hors de $[-2;3]$, négatif (rouge) entre. ' +
                '$x^2-x-6 \\geq 0$ : $S = ]-\\infty;-2] \\cup [3;+\\infty[$.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => (x - 3) * (x - 3), tone: 'good', xMin: 0.5, xMax: 5.5 }],
              xMin: 0.5,
              xMax: 5.5,
              xTicks: [],
              showYAxis: false,
              roots: [{ x: 3, label: '3' }],
              xAxisLabel: '',
              yAxisLabel: '',
              caption:
                '$\\Delta = 0$ : $x^2-6x+9$ est positif, sauf en 3 où il est nul. ' +
                '$> 0$ : $S = \\mathbb{R} \\setminus \\{3\\}$ ; $\\le 0$ : $S = \\{3\\}$.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => x * x + x + 1, tone: 'good', xMin: -3, xMax: 2 }],
              xMin: -3,
              xMax: 2,
              xTicks: [],
              showYAxis: false,
              xAxisLabel: '',
              yAxisLabel: '',
              caption:
                '$\\Delta < 0$ : $x^2+x+1$ est toujours positif. ' +
                '$> 0$ : $S = \\mathbb{R}$ ; $< 0$ : $S = \\varnothing$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — signe du trinôme',
          blocks: [
            {
              kind: 'para',
              text:
                'On suppose d\'abord $\\Delta > 0$, avec deux racines $x_1 < x_2$. On a démontré à la ' +
                'section 1 que $ax^2+bx+c = a(x-x_1)(x-x_2)$ : le signe du trinôme est celui d\'un ' +
                'produit de trois facteurs, $a$, $x-x_1$ et $x-x_2$.',
            },
            {
              kind: 'signTable',
              caption: 'Signe de (x − x₁)(x − x₂), avec x₁ < x₂',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: 'x₁', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: 'x₂', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − x₁',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − x₂',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'produit',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '0', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                '**À l\'extérieur des racines** ($x < x_1$ ou $x > x_2$), les deux facteurs ont le même ' +
                'signe : leur produit est positif, et le trinôme a le signe de $a$. **Entre les ' +
                'racines**, ils sont de signes opposés : le produit est négatif, et le trinôme a le ' +
                'signe opposé à celui de $a$. Il est nul en $x_1$ et en $x_2$.',
            },
            {
              kind: 'para',
              text:
                '**Si Δ = 0**, avec la racine double $x_1$ : $ax^2+bx+c = a(x-x_1)^2$. Un carré est ' +
                'positif, et nul seulement en $x_1$ : le trinôme a le signe de $a$ partout, et ' +
                's\'annule seulement en $x_1$.',
            },
            {
              kind: 'para',
              text:
                '**Si Δ < 0**, on reprend l\'étape 4 de la démonstration de la formule du discriminant : ' +
                '$ax^2+bx+c = a\\left[\\left(x+\\dfrac{b}{2a}\\right)^2 - \\dfrac{\\Delta}{4a^2}\\right]$. ' +
                'Comme $\\Delta < 0$, le nombre $-\\dfrac{\\Delta}{4a^2}$ est strictement positif : le ' +
                'crochet, somme d\'un carré et d\'un nombre strictement positif, est toujours ' +
                'strictement positif. Le trinôme a donc le signe de $a$ partout, et ne s\'annule ' +
                'jamais. $\\qquad \\blacksquare$',
            },
          ],
        },
        { kind: 'subheading', text: 'La notation à crochets inversés' },
        {
          kind: 'para',
          text:
            'Une solution s\'écrit toujours avec des intervalles. Jamais avec des parenthèses ' +
            '( ), comme dans les pays anglo-saxons. Un crochet ouvert **vers l\'intérieur** de l\'intervalle : ' +
            'la borne est exclue. Un crochet ouvert **vers l\'extérieur** : la borne est ' +
            'incluse. Entre deux bornes, on met un point-virgule — la virgule sert seulement ' +
            'aux nombres décimaux, comme 2,5. $-\\infty$ et $+\\infty$ ont toujours un crochet ' +
            'ouvert vers l\'extérieur : on ne les atteint jamais !',
        },
        {
          kind: 'rappel',
          label: 'Exemples de lecture',
          items: [
            ']−2 ; 3[ — intervalle ouvert, les deux bornes exclues.',
            '[−2 ; 3] — intervalle fermé, les deux bornes incluses.',
            ']−∞ ; −2] ∪ [3 ; +∞[ — un « extérieur » fermé, en deux morceaux réunis par ∪.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Δ > 0, symbole large',
          formula: '$x^2 - x - 6 \\ge 0$',
          steps: [
            { tag: '1 — racines', text: '$\\Delta = 1+24=25$, $x=(1\\pm5)/2 \\to x_1=-2, x_2=3$' },
            { tag: '2 — signe de a', text: '$a = 1 > 0$ : positif à l\'extérieur des racines' },
          ],
          result: { tag: '3 — solution (≥, bornes incluses)', text: ']−∞ ; −2] ∪ [3 ; +∞[' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'domainLine',
            min: -6,
            max: 7,
            segments: [
              { from: 'min', to: -2 },
              { from: 3, to: 'max' },
            ],
            points: [
              { value: -2, closed: true, label: '−2', tone: 'good' },
              { value: 3, closed: true, label: '3', tone: 'good' },
            ],
            signLabels: [
              { value: -4, sign: '+' },
              { value: 0.5, sign: '−' },
              { value: 5, sign: '+' },
            ],
            axisLabel: '',
            caption: 'trait plein + rond plein = valeurs incluses dans la solution ]−∞;−2] ∪ [3;+∞[',
          },
        },
        {
          kind: 'signTable',
          caption: 'Tableau de signes de x² − x − 6 = (x + 2)(x − 3)',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '−2', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '3', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'x² − x − 6',
              cells: [
                { text: '', tone: 'plain' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '−', tone: 'neg' },
                { text: '0', tone: 'zero' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'Δ < 0 : toujours du signe de a',
          formula: 'Résous $x^2 + x + 1 > 0$, puis $x^2 + x + 1 < 0$.',
          steps: [
            { tag: '1 — racines', text: '$\\Delta = 1 - 4 = -3 < 0$ : aucune racine' },
            { tag: '2 — signe de a', text: '$a = 1 > 0$ : le trinôme est **toujours** strictement positif' },
          ],
          result: { tag: '3 — solutions', text: '$x^2 + x + 1 > 0$ : $S = \\mathbb{R}$ ; $x^2 + x + 1 < 0$ : $S = \\varnothing$' },
        },
        {
          kind: 'exemple',
          badge: 'Δ = 0 : nul en un seul point',
          formula: 'Résous $x^2 - 6x + 9 > 0$, puis $x^2 - 6x + 9 \\le 0$.',
          steps: [
            { tag: '1 — racine double', text: '$x^2 - 6x + 9 = (x-3)^2$ : nul en $x = 3$ seulement' },
            { tag: '2 — signe de a', text: 'positif partout ailleurs' },
          ],
          result: { tag: '3 — solutions', text: '$> 0$ : $S = \\mathbb{R} \\setminus \\{3\\}$ ; $\\le 0$ : $S = \\{3\\}$ (un seul nombre, pas un intervalle)' },
        },
        {
          kind: 'exemple',
          badge: 'ramener à 0 d\'abord',
          formula: 'Résous $x^2 < 4x$.',
          steps: [
            { tag: 'tout passer à gauche', text: '$x^2 - 4x < 0 \\iff x(x-4) < 0$' },
            { tag: 'racines 0 et 4, a > 0', text: 'le trinôme est négatif entre ses racines' },
          ],
          result: { tag: 'solution', text: '$S = ]0;4[$ — surtout pas « $x < 4$ » en divisant par x : x peut être négatif ou nul.' },
        },
        {
          kind: 'astuce',
          text:
            'Le symbole ne te dit pas automatiquement le crochet à utiliser ! Une inégalité ' +
            '**large** (≤/≥) inclut la borne **seulement si** cette borne est une vraie racine. ' +
            'Pose-toi toujours la question — ne réponds pas par automatisme.',
        },
        {
          kind: 'atelier',
          tag: 'signe-trinome-widget',
          label: 'Manipule toi-même — le tableau de signes en direct',
          caption:
            'Règle a, b et c, choisis le symbole : le tableau de signes et ' +
            'l\'ensemble-solution se construisent en direct. Les boutons d\'exemple montrent ' +
            'les cas Δ = 0 et Δ < 0, où S peut valoir ℝ, ∅, ℝ \\ {r} ou {r}. En mode Défi, ' +
            'trouve S à partir de la parabole : un seul essai.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — lire f(x) ≥ k sur la parabole',
          blocks: [
            {
              kind: 'para',
              text:
                'Au chapitre 1, tu lisais des valeurs sur une parabole. On peut aussi y lire la ' +
                'solution d\'une inéquation. Soit $f(x) = -x^2+4x+1$ : pour quelles valeurs de x ' +
                'a-t-on $f(x) \\geq 4$ ?',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => -x * x + 4 * x + 1, tone: 'faint', xMin: -1, xMax: 5 },
                  { fn: (x) => -x * x + 4 * x + 1, tone: 'good', xMin: 1, xMax: 3 },
                ],
                shadedRegions: [{ from: 1, to: 3, upper: (x) => -x * x + 4 * x + 1, lower: () => 4, tone: 'good' }],
                horizontalAsymptotes: [{ y: 4, label: 'y = 4' }],
                xMin: -1,
                xMax: 5,
                xTicks: [],
                points: [
                  { x: 1, y: 4, label: '(1 ; 4)', tone: 'good', labelPos: 'left' },
                  { x: 3, y: 4, label: '(3 ; 4)', tone: 'good', labelPos: 'right' },
                ],
                roots: [
                  { x: 1, label: '1' },
                  { x: 3, label: '3' },
                ],
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'La parabole de $f(x)=-x^2+4x+1$ est **au-dessus** de la droite $y=4$ (en vert) ' +
                  'exactement pour x entre 1 et 3, bornes comprises.',
              },
            },
            {
              kind: 'para',
              text:
                '**Lecture.** La parabole et la droite $y=4$ se coupent aux points d\'abscisses 1 et 3. ' +
                'Entre les deux, la parabole est au-dessus de la droite : $f(x) \\geq 4$ pour ' +
                '$x \\in [1;3]$.',
            },
            {
              kind: 'para',
              text:
                '**Vérification par le calcul.** $f(x) \\geq 4 \\iff -x^2+4x-3 \\geq 0$. ' +
                '$\\Delta = 16 - 12 = 4$, racines $\\dfrac{-4 \\pm 2}{-2}$ : 1 et 3. Comme $a = -1 < 0$, ' +
                'le trinôme est positif **entre** ses racines : $S = [1;3]$, la même réponse qu\'avec ' +
                'le graphique.',
            },
            {
              kind: 'para',
              text:
                'Le graphique donne vite une idée de la réponse. Mais une lecture n\'est pas toujours ' +
                'précise (une abscisse non entière, par exemple) : c\'est le calcul qui prouve.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'parabole-droite-widget',
          label: 'Manipule toi-même — parabole et droite',
          caption:
            'Règle la parabole y = ax² + bx + c et la droite y = mx + p, puis choisis le symbole : ' +
            'l\'ensemble où la parabole est au-dessus (ou en dessous) de la droite apparaît en ' +
            'couleur sur l\'axe des x, avec le trinôme f(x) − g(x) dont on étudie le signe pour ' +
            'le trouver par le calcul. Le réglage par défaut est l\'exemple ci-dessus.',
        },
        {
          kind: 'application',
          titre: 'Garantir une aire minimale avec une clôture limitée',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => x * (20 - x), tone: 'accent' }],
              shadedRegions: [{ from: 5, to: 15, upper: (x) => x * (20 - x), lower: () => 75, tone: 'good' }],
              horizontalAsymptotes: [{ y: 75, label: 'A = 75 m²' }],
              xMin: 0,
              xMax: 20,
              xTicks: [5, 15],
              yTicks: [75, 100],
              points: [
                { x: 5, y: 75, label: 'x = 5', tone: 'bad', labelPos: 'below' },
                { x: 15, y: 75, label: 'x = 15', tone: 'bad', labelPos: 'below' },
              ],
              xAxisLabel: 'largeur x (m)',
              yAxisLabel: 'aire A(x) (m²)',
              caption:
                'A(x) = x(20−x) : l\'aire franchit 75 m² (ligne en pointillé) exactement entre ' +
                'x = 5 et x = 15. La zone verte, au-dessus de 75 m², **est** l\'ensemble-solution de ' +
                'l\'inéquation $-x^2+20x-75 \\geq 0$.',
            },
          ],
          text:
            'Un agriculteur dispose de 40 mètres de clôture pour un enclos rectangulaire et ' +
            'veut que sa surface atteigne **au moins** 75 m². Si x est la longueur d\'un côté, ' +
            'l\'autre côté vaut $20-x$ (le périmètre total divisé par 2, moins x), donc l\'aire ' +
            'vaut $A(x)=x(20-x)$ — une fonction du second degré. La question « pour quelles ' +
            'valeurs de x l\'aire est-elle d\'au moins 75 m² ? » est exactement une **inéquation** ' +
            'du second degré : $x(20-x) \\geq 75$, soit $-x^2+20x-75 \\geq 0$. Le tableau de ' +
            'signes que tu viens d\'apprendre à construire donne directement l\'intervalle des ' +
            'largeurs possibles — sans lui, il faudrait tester des dizaines de valeurs de x ' +
            'une par une.',
          domaines: ['Architecture', 'Agriculture'],
        },
        {
          kind: 'entrainement',
          title: 'Tableau de signes',
          generatorId: 'gen2',
          description: [
            'Étudie le signe de ax²+bx+c via un tableau de signes guidé (racines, signe de a, ' +
              'ensemble-solution construit pas à pas, notation à crochets inversés).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 2. Tableau de signes »',
        },
        {
          kind: 'entrainement',
          title: 'Construire une inéquation à partir de sa solution',
          generatorId: 'gen120',
          description: [
            'La démarche à l’envers : on te donne l’ensemble des solutions, écris une inéquation ' +
              '(ou une équation) du second degré qui l’a pour solution, puis la même avec un ' +
              'coefficient de x² imposé, et retrouve une parabole à partir de ses racines et d’un point.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 120. Construire une inéquation à partir de sa solution »',
        },
        {
          kind: 'entrainement',
          title: 'Parabole et droite : intersection et position',
          generatorId: 'gen118',
          description: [
            'Trouve les points communs à une parabole et à une droite en ramenant f(x) = g(x) à 0, puis résous f(x) ≥ g(x) (ou ≤, <, >) grâce au signe de f − g.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 118. Parabole et droite : intersection et position »',
        },
        {
          kind: 'entrainement',
          title: 'Lire une inéquation sur un graphique',
          generatorId: 'gen117',
          description: [
            'Une parabole et une droite (l\'axe des x, y = k ou y = mx + p) sont tracées : lis les ' +
              'abscisses des points communs sur la grille, la position de la parabole, puis écris ' +
              'l\'ensemble-solution de l\'inéquation avec les bons crochets.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 117. Lire une inéquation sur un graphique »',
        },
      ],
    },
    {
      id: 'signe-produit',
      number: 3,
      title: 'Signe d\'un produit de plusieurs facteurs',
      kicker: 'le même principe, appliqué à 2 ou 3 facteurs à la fois',
      titreCourt: 'Signe d\'un produit',
      partie: 'Résoudre, puis étudier un signe',
      essentiel: [
        'Chaque facteur a sa ligne dans le tableau, et le produit se lit colonne par colonne : un nombre **impair** de facteurs négatifs donne un produit négatif, sinon il est positif.',
        'Un facteur quadratique **irréductible** ($\\Delta < 0$) ne s\'annule jamais : sa ligne garde partout le signe de son propre a, sans colonne en plus.',
      ],
      cartes: [
        { question: 'Dans une colonne, trois facteurs sont négatifs : quel est le signe du produit ?', reponse: 'Négatif : le nombre de facteurs négatifs est impair.' },
        { question: 'Quelles colonnes le facteur $x^2 + 2x + 5$ ajoute-t-il au tableau ?', reponse: 'Aucune : $\\Delta = -16 < 0$, il ne s\'annule jamais et reste positif.' },
        { question: 'Résous $(x-1) \\cdot x \\cdot (x-3) > 0$.', reponse: '$S = ]0;1[ \\cup ]3;+\\infty[$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Signe d\'un produit de plusieurs facteurs', youtubeId: '2jApAPJkfRw' },
        {
          kind: 'para',
          text:
            'Le principe reste le même avec plusieurs facteurs. Ils peuvent être linéaires. Ou ' +
            'quadratiques (qu\'on peut factoriser). Ou quadratiques **irréductibles** (Δ < 0 : ' +
            'ce facteur ne s\'annule jamais, il garde toujours le signe de son propre a). ' +
            'Chaque facteur a sa ligne dans le tableau. Le produit se lit en multipliant les ' +
            'signes, colonne par colonne.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 3 facteurs',
          blocks: [
            { kind: 'para', text: '$(x-1) \\cdot x \\cdot (x-3) > 0$' },
            { kind: 'para', text: 'Racines de chaque facteur, triées : 0, 1, 3.' },
            {
              kind: 'signTable',
              caption: 'Signe de (x−1)·x·(x−3)',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '0', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '3', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 1',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 3',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'produit',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '0', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            { kind: 'para', text: 'Solution (> 0) : ]0 ; 1[ ∪ ]3 ; +∞[' },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x - 1) * x * (x - 3), tone: 'bad', xMin: -0.45, xMax: 0 },
              { fn: (x) => (x - 1) * x * (x - 3), tone: 'good', xMin: 0, xMax: 1 },
              { fn: (x) => (x - 1) * x * (x - 3), tone: 'bad', xMin: 1, xMax: 3 },
              { fn: (x) => (x - 1) * x * (x - 3), tone: 'good', xMin: 3, xMax: 3.4 },
            ],
            fixedYRange: { min: -2.6, max: 3.6 },
            xMin: -0.6,
            xMax: 3.6,
            xTicks: [],
            showYAxis: false,
            roots: [
              { x: 0, label: '0' },
              { x: 1, label: '1' },
              { x: 3, label: '3' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: '',
            caption:
              'La courbe de $y=(x-1) \\cdot x \\cdot (x-3)$ est au-dessus de l\'axe (en vert) là où la ' +
              'ligne « produit » de la grille porte +, en dessous (en rouge) là où elle porte −, et ' +
              'coupe l\'axe en 0, 1 et 3. Solution de $(x-1) \\cdot x \\cdot (x-3) > 0$ : ' +
              '$\\left]0;1\\right[ \\cup \\left]3;+\\infty\\right[$.',
          },
        },
        {
          kind: 'intuition',
          label: 'Pour retenir la règle des signes',
          text:
            'Imagine chaque facteur négatif comme un interrupteur qui inverse le signe du ' +
            'produit, de + à − ou de − à +. Zéro ou deux facteurs négatifs (nombre **pair**), tu ' +
            'reviens au signe de départ. Un ou trois (nombre **impair**), tu termines sur le ' +
            'signe inversé. C\'est exactement la règle « compter les négatifs » ci-dessous.',
        },
        {
          kind: 'methode',
          label: 'Méthode — compter les signes négatifs',
          items: [
            'Sur chaque colonne, compte les facteurs négatifs. Un nombre **impair** de facteurs ' +
              'négatifs → le produit est négatif. Sinon → il est positif. Pas besoin de ' +
              'multiplier les signes un par un : compte-les ! Un facteur vaut 0 dans une ' +
              'colonne ? Alors tout le produit vaut 0 — peu importe les autres facteurs.',
          ],
        },
        {
          kind: 'attention',
          label: 'Facteur quadratique irréductible',
          text:
            '$x^2+2x+5$ (Δ = 4 − 20 = −16 < 0) ne s\'annule **jamais**. Sa ligne garde le même ' +
            'signe partout : celui de son propre a. Pas de colonne en plus pour ce facteur ! ' +
            'C\'est différent d\'un facteur qu\'on peut factoriser : lui, il ajoute ses propres ' +
            'racines au tableau.',
        },
        {
          kind: 'exemple',
          badge: 'facteur irréductible et facteur de pente négative',
          formula: 'Résous $(2 - x)\\left(x^2 + 2x + 5\\right) \\ge 0$.',
          steps: [
            { tag: 'facteur irréductible', text: '$x^2 + 2x + 5$ : $\\Delta = -16 < 0$, toujours positif — il ne change rien au signe' },
            { tag: 'facteur de pente négative', text: '$2 - x$ s\'annule en 2 ; il est **positif à gauche** de 2 et négatif à droite (son coefficient de x est −1)' },
          ],
          result: { tag: 'solution', text: '$S = ]-\\infty;2]$' },
        },
        {
          kind: 'atelier',
          tag: 'signe-produit-widget',
          label: 'Manipule toi-même — 2 ou 3 facteurs à la fois',
          caption:
            'En mode Produit, règle les racines de 2 ou 3 facteurs : la grille se construit ' +
            'ligne par ligne, et le réglage par défaut reprend l\'exemple (x − 1)·x·(x − 3). ' +
            'En mode Quotient, passe un facteur au dénominateur : sa valeur devient ‖, ' +
            'jamais une solution, même avec ≤ ou ≥ (section 6).',
        },
        {
          kind: 'application',
          titre: 'Vérifier qu\'un système reste sûr sous plusieurs contraintes à la fois',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (n) => (n - 500) * (3000 - n), tone: 'accent' }],
              shadedRegions: [{ from: 500, to: 3000, upper: (n) => (n - 500) * (3000 - n), lower: () => 0, tone: 'good' }],
              xMin: 0,
              xMax: 3500,
              xTicks: [500, 3000],
              points: [
                { x: 500, y: 0, label: 'mini (lubrification)', tone: 'bad', labelPos: 'below' },
                { x: 3000, y: 0, label: 'maxi (sécurité)', tone: 'bad', labelPos: 'below' },
              ],
              xAxisLabel: 'vitesse de rotation N (tr/min)',
              yAxisLabel: '(N−500)(3000−N)',
              caption:
                'Deux contraintes à la fois : N ≥ 500 (facteur N − 500) et N ≤ 3000 (facteur ' +
                '3000 − N). La zone verte est la plage où les **deux** facteurs sont positifs en ' +
                'même temps. Ici, elle coïncide avec la zone où le produit $(N-500)(3000-N)$ est ' +
                'positif, parce que les deux facteurs ne peuvent jamais être négatifs ensemble.',
            },
          ],
          text:
            'Un ingénieur qui conçoit un système (électrique, mécanique, chimique...) doit ' +
            'souvent garantir que **plusieurs** grandeurs restent dans une plage sûre **en même ' +
            'temps** — une pression, une température, une tension. Si chaque contrainte s\'écrit ' +
            '« tel facteur du premier ou du second degré est positif », la grille de signes de ' +
            'cette section montre, colonne par colonne, où **chaque** facteur a le bon signe : la ' +
            'plage sûre est celle où toutes les lignes portent « + » à la fois. Attention : le ' +
            'signe du seul produit ne suffit pas en général, car deux facteurs négatifs donnent ' +
            'aussi un produit positif. Dans l\'exemple ci-dessous, il suffit, parce que $N-500$ et ' +
            '$3000-N$ ne peuvent pas être négatifs en même temps (il faudrait $N < 500$ et ' +
            '$N > 3000$). L\'ingénieur repère ainsi en un coup d\'œil les plages de fonctionnement ' +
            'sûres, sans vérifier chaque contrainte séparément à chaque valeur testée.',
          domaines: ['Ingénierie', 'Sécurité'],
        },
        {
          kind: 'entrainement',
          title: 'Tableau de signes à plusieurs facteurs',
          generatorId: 'gen5',
          description: [
            'Étudie le signe d\'un produit de 2 à 3 facteurs (linéaire donné, quadratique à ' +
              'factoriser, quadratique irréductible) via une grille de signes interactive.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 5. Tableau de signes à plusieurs facteurs »',
        },
      ],
    },
    {
      id: 'simplifier',
      number: 4,
      title: 'Simplifier une fraction rationnelle',
      kicker: 'tout factoriser d\'abord, éliminer ensuite ce qui est identique',
      titreCourt: 'Simplifier une fraction',
      partie: 'Quand x est au dénominateur',
      essentiel: [
        'On factorise d\'abord tout, le numérateur **et** le dénominateur, puis on enlève un facteur identique des deux côtés — jamais des termes au hasard.',
        'La condition d\'existence se pose sur le dénominateur **avant** de simplifier : un facteur enlevé reste interdit.',
        'Deux facteurs opposés ne se simplifient pas en 1 : $\\dfrac{3-x}{x-3} = -1$.',
      ],
      cartes: [
        { question: 'Quand pose-t-on la CE d\'une fraction rationnelle ?', reponse: 'Sur le dénominateur, avant de simplifier.' },
        { question: 'Simplifie $\\dfrac{x^2-4}{x+2}$.', reponse: '$x - 2$, pour $x \\neq -2$ : la CE reste écrite à côté.' },
        { question: 'Que vaut $\\dfrac{3-x}{x-3}$ ?', reponse: '$-1$, car $3 - x = -(x-3)$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Simplifier une fraction rationnelle', youtubeId: '0Sp2z_qx-S8' },
        {
          kind: 'para',
          text:
            'On ne simplifie **jamais** une fraction en effaçant des termes au hasard. On ' +
            'factorise d\'abord tout : le numérateur **et** le dénominateur. Ensuite, on enlève ' +
            'un facteur identique des deux côtés. La condition d\'existence (CE) — les valeurs ' +
            'de x interdites — se pose sur le dénominateur, **avant** de simplifier. Un facteur ' +
            'qu\'on enlève reste quand même interdit !',
        },
        {
          kind: 'exemple',
          badge: 'racine commune, deux polynômes de degré 2',
          formula: '$\\dfrac{2x^2-6x}{x^2-x-6}$',
          steps: [
            { tag: 'numérateur factorisé', text: '$2x^2-6x = 2x(x-3)$' },
            { tag: 'dénominateur factorisé', text: '$x^2-x-6 = (x-3)(x+2)$' },
            { tag: 'CE — sur le dénominateur non simplifié', text: '$x \\neq 3$ et $x \\neq -2$' },
          ],
          result: {
            tag: 'fraction simplifiée',
            text: '$\\dfrac{2x(x-3)}{(x-3)(x+2)} = \\dfrac{2x}{x+2}$',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (2 * x) / (x + 2), tone: 'accent', xMin: -6, xMax: -2 - 2 / 3 },
              { fn: (x) => (2 * x) / (x + 2), tone: 'accent', xMin: -1.5, xMax: 6 },
            ],
            fixedYRange: { min: -6.5, max: 8.5 },
            verticalAsymptotes: [{ x: -2, label: 'x = −2' }],
            xMin: -6,
            xMax: 6,
            xTicks: [3],
            points: [{ x: 3, y: 1.2, label: 'trou en x = 3', tone: 'bad', style: 'open', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'La courbe de $\\dfrac{2x^2-6x}{x^2-x-6}$ est celle de $\\dfrac{2x}{x+2}$, **sauf** en ' +
              '$x=3$, où il manque un point (rond vide) : la CE $x \\neq 3$ reste vraie après la ' +
              'simplification. En $x=-2$ (pointillés), la fraction n\'existe pas non plus : la ' +
              'courbe s\'envole de part et d\'autre.',
          },
        },
        {
          kind: 'atelier',
          tag: 'simplification-trou-widget',
          label: 'Manipule toi-même — le point creux',
          caption:
            'La fraction de départ et sa forme simplifiée ont exactement la même courbe… ' +
            'sauf en x = r, où la première a un trou : simplifier par (x − r) ne rend pas x ' +
            '= r permis. Coche « Afficher la forme simplifiée seule » : le trou se bouche, ' +
            'et ce n\'est plus la même fonction. Le préréglage est l\'exemple ci-dessus.',
        },
        {
          kind: 'piege',
          label: 'Un carré parfait au dénominateur ne se simplifie jamais complètement',
          text:
            'Le dénominateur est $(x-p)^2$ ? Si tu simplifies **une seule fois** $(x-p)$ avec le ' +
            'numérateur, il en reste encore un au dénominateur. Donc $x=p$ reste toujours ' +
            'interdit. La fraction ne devient jamais un simple polynôme sur ce facteur.',
        },
        {
          kind: 'exemple',
          badge: 'facteurs opposés',
          formula: 'Simplifie $\\dfrac{6-2x}{x^2-9}$.',
          steps: [
            { tag: 'CE', text: '$x \\neq 3$ et $x \\neq -3$' },
            { tag: 'faire apparaître le même facteur', text: '$6 - 2x = -2(x-3)$ et $x^2 - 9 = (x-3)(x+3)$' },
          ],
          result: { tag: 'fraction simplifiée', text: '$\\dfrac{-2(x-3)}{(x-3)(x+3)} = -\\dfrac{2}{x+3}$' },
        },
        {
          kind: 'piege',
          label: 'Deux facteurs opposés ne se simplifient pas en 1',
          text:
            '$\\dfrac{3-x}{x-3} = -1$, et non 1 : $3 - x = -(x - 3)$. Sors le signe moins **avant** de ' +
            'simplifier, sinon le résultat a le mauvais signe partout.',
        },
        {
          kind: 'exemple',
          badge: 'différence de deux carrés au numérateur',
          formula: 'Simplifie $\\dfrac{x^2-4}{x+2}$.',
          steps: [
            { tag: 'CE', text: '$x \\neq -2$' },
            { tag: 'factoriser le numérateur', text: '$x^2 - 4 = (x-2)(x+2)$' },
          ],
          result: { tag: 'fraction simplifiée', text: '$x - 2$, pour $x \\neq -2$ — la CE reste écrite à côté' },
        },
        {
          kind: 'astuce',
          label: 'Astuce — forme de référence',
          text:
            'Une fois la fraction simplifiée, mets-la sous sa forme la plus simple. Divise les ' +
            'coefficients par leur PGCD (jamais $2(x-3)/4$, toujours $\\dfrac{x-3}{2}$). Une ' +
            'racine égale à 0 s\'écrit x tout court, jamais $(x-0)$.',
        },
        {
          kind: 'entrainement',
          title: 'Simplifier des fractions',
          generatorId: 'gen3',
          description: [
            'Simplifie une fraction rationnelle (numérateur et dénominateur de degré 1 ou 2) ' +
              'après factorisation complète des deux, avec ses conditions d\'existence.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 3. Simplifier des fractions »',
        },
      ],
    },
    {
      id: 'inconnue-denominateur',
      number: 5,
      title: 'L\'inconnue au dénominateur',
      kicker: 'résoudre, puis toujours écarter les racines étrangères',
      titreCourt: 'L\'inconnue au dénominateur',
      partie: 'Quand x est au dénominateur',
      essentiel: [
        'Toujours le même chemin : poser la CE (chaque dénominateur ≠ 0), multiplier les deux membres par le dénominateur commun, résoudre, puis vérifier **chaque** solution avec la CE.',
        'Une solution qui viole la CE est une **racine étrangère** : on la rejette.',
      ],
      cartes: [
        { question: 'Qu\'est-ce qu\'une racine étrangère ?', reponse: 'Une solution de l\'équation obtenue qui ne respecte pas la CE de départ : on la rejette.' },
        { question: 'Pourquoi préférer le dénominateur commun au produit en croix ?', reponse: 'Le produit en croix multiplie par un dénominateur de trop et fait monter le degré.' },
        { question: 'Résous $\\dfrac{1}{x-2} + \\dfrac{1}{x+2} = \\dfrac{4}{x^2-4}$.', reponse: 'On trouve $x = 2$, interdit par la CE : $S = \\varnothing$.' },
      ],
      blocks: [
        { kind: 'video', title: 'L\'inconnue au dénominateur', youtubeId: '-9pfuHh_OLI' },
        {
          kind: 'para',
          text:
            'Résoudre une équation avec x au dénominateur suit toujours le même chemin : pose ' +
            'la condition d\'existence. Multiplie les deux membres par le dénominateur commun ' +
            '(ou, à défaut, multiplie en croix). Résous l\'équation obtenue. Puis vérifie ' +
            '**chaque** solution avec la CE de départ.',
        },
        {
          kind: 'methode',
          items: [
            'Pose la CE : chaque dénominateur ≠ 0.',
            'Multiplie les deux membres par le dénominateur commun (le produit en croix marche ' +
              'aussi, mais il fait souvent monter le degré). N\'oublie jamais la CE.',
            'Résous l\'équation polynomiale obtenue.',
            'Rejette toute solution qui ne respecte pas la CE. On l\'appelle une **racine étrangère**.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'racine étrangère systématique',
          formula: '$\\dfrac{5}{x-2} = \\dfrac{3x-3}{x^2-x-2}$',
          steps: [
            {
              tag: 'CE — dénominateur droit factorisé : x² − x − 2 = (x − 2)(x + 1)',
              text: '$x \\neq 2$ et $x \\neq -1$',
            },
            {
              tag: 'mise en croix puis résolution',
              text: '$5(x^2-x-2)=(3x-3)(x-2) \\iff x^2+2x-8=0 \\iff (x-2)(x+4)=0$',
            },
            { tag: 'deux racines candidates', text: '$x = 2$ ou $x = -4$' },
          ],
          result: {
            tag: 'confrontation à la CE',
            text: '$x=2$ viole la CE — **racine étrangère, rejetée**. Seule $x=-4$ est une solution valable.',
          },
        },
        {
          kind: 'intuition',
          label: 'Une image pour comprendre',
          text:
            'Multiplier en croix, c\'est un peu comme résoudre un problème plus large que celui ' +
            'posé au départ — une équation moins stricte, qui accepte plus de valeurs. ' +
            'Certaines de ces valeurs collent à la version élargie, mais pas à l\'équation ' +
            'd\'origine : ce sont des **racines étrangères**, des solutions qui se glissent ' +
            'dans la réponse sans avoir le droit d\'y être.',
        },
        {
          kind: 'piege',
          label: 'Pourquoi une racine étrangère apparaît',
          text:
            'Multiplier en croix, c\'est multiplier les deux membres par les dénominateurs. ' +
            'Mais une de ces expressions peut valoir 0, en $x=2$ ! L\'équation obtenue accepte ' +
            'alors des valeurs que l\'équation de départ refusait déjà.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — dénominateur commun plutôt que produit en croix',
          text:
            'Dans l\'exemple ci-dessus, $x^2 - x - 2 = (x-2)(x+1)$ contient déjà $(x - 2)$. Multiplie les ' +
            'deux membres par ce dénominateur commun $(x-2)(x+1)$ : $5(x+1) = 3x - 3 \\iff 2x = -8 \\iff x = -4$. ' +
            'Une équation du **premier** degré, et plus de racine en trop à rejeter. Le produit en croix ' +
            'multiplie par un dénominateur de trop et fait monter le degré.',
        },
        {
          kind: 'atelier',
          tag: 'racine-etrangere-rationnelle-widget',
          label: 'Manipule toi-même — d\'où vient la racine étrangère ?',
          caption:
            'En haut, les deux membres de l\'équation : leurs points communs sont les vraies ' +
            'solutions. En bas, l\'équation obtenue par produit en croix accepte aussi une ' +
            'valeur qui annule un dénominateur, la racine étrangère. Passe à la méthode du ' +
            'dénominateur commun : dans l\'exemple du cours, l\'équation reste du premier ' +
            'degré et la racine étrangère n\'apparaît même pas.',
        },
        {
          kind: 'exemple',
          badge: 'toutes les solutions sont rejetées',
          formula: 'Résous $\\dfrac{1}{x-2} + \\dfrac{1}{x+2} = \\dfrac{4}{x^2-4}$.',
          steps: [
            { tag: 'CE — x² − 4 = (x − 2)(x + 2)', text: '$x \\neq 2$ et $x \\neq -2$' },
            { tag: 'multiplier par (x − 2)(x + 2)', text: '$(x+2) + (x-2) = 4 \\iff 2x = 4 \\iff x = 2$' },
          ],
          result: { tag: 'confrontation à la CE', text: '$x = 2$ est interdit : il ne reste aucune solution, $S = \\varnothing$.' },
        },
        {
          kind: 'astuce',
          text:
            'Vérifie la CE **après** avoir résolu. Pas seulement au début, pour l\'oublier ' +
            'ensuite ! C\'est l\'étape qu\'on saute le plus souvent. Et c\'est elle qui fait la ' +
            'différence entre une bonne et une mauvaise réponse.',
        },
        {
          kind: 'entrainement',
          title: 'L\'inconnue au dénominateur',
          generatorId: 'gen4',
          description: [
            'Résous une équation rationnelle, en isolant, simplifiant si besoin, puis en ' +
              'écartant toute racine étrangère.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 4. L\'inconnue au dénominateur »',
        },
      ],
    },
    {
      id: 'inequations-rationnelles',
      number: 6,
      title: 'Inéquations rationnelles',
      kicker: 'une grille de quotient, avec une valeur « non définie » à part entière',
      titreCourt: 'Inéquations rationnelles',
      partie: 'Quand x est au dénominateur',
      essentiel: [
        'Méthode : poser la CE, tout passer à gauche, réduire au même dénominateur et factoriser, puis un tableau de signes avec une colonne ∄ pour chaque valeur de CE.',
        'Une valeur qui annule le dénominateur n\'est **jamais** solution, même avec ≤ ou ≥ : son crochet reste ouvert.',
        'Jamais de produit en croix dans une inéquation : le signe du dénominateur dépend de x.',
      ],
      cartes: [
        { question: 'Résous $\\dfrac{x-2}{x+1} \\geq 0$. La valeur −1 est-elle solution ?', reponse: '$S = ]-\\infty;-1[ \\cup [2;+\\infty[$ : −1 est exclu, le quotient n\'y existe pas.' },
        { question: 'Pourquoi ne multiplie-t-on jamais en croix dans une inéquation ?', reponse: 'Le sens ne se conserve que si le dénominateur est positif, et son signe dépend de x.' },
        { question: 'Résous $\\dfrac{x+3}{(x-1)^2} > 0$.', reponse: 'Le quotient a le signe de $x + 3$ : $S = ]-3;1[ \\cup ]1;+\\infty[$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Inéquations rationnelles', youtubeId: 'nMZsTQUZQKE' },
        {
          kind: 'para',
          text:
            'Une inéquation rationnelle se traite comme un produit de facteurs (section 3), ' +
            'avec une différence : le dénominateur peut s\'annuler. Le quotient n\'existe alors ' +
            'pas : il est **non défini**. Cette valeur a sa propre marque dans le tableau. Elle ' +
            'est prioritaire sur tout le reste.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — quotient simple',
          blocks: [
            { kind: 'para', text: '$\\dfrac{x-2}{x+1} \\ge 0$' },
            { kind: 'para', text: 'CE : $x \\neq -1$.' },
            {
              kind: 'signTable',
              caption: 'Signe de (x−2)/(x+1)',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '−1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '2', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 2 (N)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x + 1 (D)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'quotient',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '∄', tone: 'indef' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            { kind: 'para', text: 'Solution (≥ 0, en excluant la colonne ∄) : ]−∞ ; −1[ ∪ [2 ; +∞[' },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'domainLine',
            min: -4,
            max: 5,
            segments: [
              { from: 'min', to: -1 },
              { from: 2, to: 'max' },
            ],
            points: [
              { value: -1, closed: false, label: '−1', tone: 'bad', sublabel: 'CE : toujours exclu' },
              { value: 2, closed: true, label: '2', tone: 'good' },
            ],
            axisLabel: '',
            caption: 'rond vide en −1 (toujours exclu, même pour un symbole large) — rond plein en 2 (inclus, car ≥)',
          },
        },
        {
          kind: 'intuition',
          label: 'Pourquoi c\'est toujours exclu',
          text:
            'Diviser par 0 n\'a tout simplement pas de sens : demande à ta calculatrice, elle ' +
            'refuse aussi. Que le symbole soit strict (<, >) ou large (≤, ≥) ne change rien à ce ' +
            'problème — une valeur qui annule le dénominateur ne rend jamais le quotient ni ' +
            'positif, ni négatif, ni nul. Elle n\'entre même pas en compte.',
        },
        {
          kind: 'attention',
          label: 'Une valeur de CE reste toujours exclue',
          text:
            'Même avec un symbole large (≤/≥), une valeur qui annule le dénominateur ne peut ' +
            '**jamais** être une solution. Le quotient n\'y existe pas : ni positif, ni négatif, ' +
            'ni nul. Son crochet reste toujours ouvert, quel que soit le symbole de l\'énoncé.',
        },
        {
          kind: 'methode',
          label: 'Méthode — inéquation rationnelle',
          items: [
            'Pose la CE : chaque dénominateur ≠ 0.',
            'Passe tout dans le membre de gauche : le second membre doit valoir 0.',
            'Réduis au même dénominateur, factorise numérateur et dénominateur.',
            'Tableau de signes : une ligne par facteur, colonne ∄ pour chaque valeur de CE.',
            'Lis S selon le symbole, en excluant toujours les valeurs de CE.',
          ],
        },
        {
          kind: 'attention',
          label: 'Jamais de produit en croix dans une inéquation',
          text:
            'Multiplier les deux membres par le dénominateur ne conserve le sens que s\'il est ' +
            '**positif**. Son signe dépend de x : là où il est négatif, le sens aurait dû s\'inverser, et ' +
            'le produit en croix fait perdre (ou ajouter) des solutions. Passe toujours par « tout à ' +
            'gauche » et un tableau de signes.',
        },
        {
          kind: 'exemple',
          badge: 'second membre non nul',
          formula: 'Résous $\\dfrac{x}{x-1} \\le 2$.',
          steps: [
            { tag: 'CE, puis tout à gauche', text: '$x \\neq 1$ ; $\\dfrac{x}{x-1} - 2 \\le 0 \\iff \\dfrac{x - 2(x-1)}{x-1} \\le 0 \\iff \\dfrac{2-x}{x-1} \\le 0$' },
            { tag: 'tableau de signes', text: 'quotient négatif pour $x < 1$, positif entre 1 et 2, nul en 2, négatif pour $x > 2$' },
            { tag: 'le piège du produit en croix', text: '$x \\le 2(x-1)$ donnerait seulement $x \\ge 2$ : tous les $x < 1$ seraient perdus' },
          ],
          result: { tag: 'solution', text: '$S = ]-\\infty;1[ \\cup [2;+\\infty[$' },
        },
        {
          kind: 'atelier',
          tag: 'signe-produit-widget',
          label: 'Manipule toi-même — pourquoi pas de produit en croix ?',
          caption:
            'Choisis le mode « Piège : produit en croix » : pour x/(x − 1) ≤ 2, la méthode ' +
            'fausse (multiplier par x − 1) donne [2 ; +∞[, la bonne ]−∞ ; 1[ ∪ [2 ; +∞[. La ' +
            'bande colorée montre où le dénominateur est négatif : là, le sens de ' +
            'l\'inégalité aurait dû s\'inverser.',
        },
        {
          kind: 'exemple',
          badge: 'dénominateur au carré',
          formula: 'Résous $\\dfrac{x+3}{(x-1)^2} > 0$.',
          steps: [
            { tag: 'CE', text: '$x \\neq 1$' },
            { tag: 'le carré est positif', text: '$(x-1)^2 > 0$ pour $x \\neq 1$ : le quotient a le signe de $x + 3$' },
          ],
          result: { tag: 'solution', text: '$S = ]-3;1[ \\cup ]1;+\\infty[$ — la valeur 1 reste exclue' },
        },
        {
          kind: 'para',
          text:
            'Le second membre n\'est pas 0 ? Le principe reste pareil. Isole-le d\'abord ' +
            '($... - k \\lozenge 0$). Réduis au même dénominateur. Tu retrouves un quotient de ' +
            'la même forme — parfois avec un numérateur du second degré à factoriser.',
        },
        {
          kind: 'entrainement',
          title: 'Inéquations rationnelles',
          generatorId: 'gen6',
          description: [
            'Résous une inéquation rationnelle selon 8 niveaux/variantes (second membre nul, ' +
              'constant, linéaire ou fraction ; dénominateur au carré ; facteur commun ou non ; ' +
              'numérateur cubique).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 6. Inéquations rationnelles »',
        },
      ],
    },
    {
      id: 'contexte',
      number: 7,
      title: 'Équations et inéquations en contexte',
      kicker: 'poser, résoudre, confronter chaque solution au domaine de validité',
      titreCourt: 'Équations en contexte',
      partie: 'En contexte, puis réviser',
      essentiel: [
        'Un seuil **atteint exactement** se traduit par $f(x) = k$ ; un seuil **dépassé**, par $f(x) > k$ ou $f(x) < k$.',
        'Chaque solution est confrontée au domaine de validité : une racine correcte en calcul mais impossible dans la réalité (un temps négatif, une longueur trop grande…) est rejetée.',
      ],
      cartes: [
        { question: '$h(t) = -5(t-5)(t+1)$, avec $t \\geq 0$ : quand le ballon touche-t-il le sol ?', reponse: 'En $t = 5$ s ; $t = -1$ est rejeté, un temps négatif n\'existe pas.' },
        { question: 'Comment traduire « l\'aire $A(x) = x(20-x)$ vaut au moins 96 m² » ?', reponse: 'Par l\'inéquation $x(20-x) \\geq 96$ ; ici $x \\in [8;12]$.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Au chapitre 1, tu as modélisé une situation concrète par une fonction du second ' +
            'degré pour en trouver l\'optimum. Avec les méthodes de ce chapitre, tu peux ' +
            'maintenant répondre à une autre question : **quand** la grandeur atteint-elle, ou ' +
            'dépasse-t-elle, une valeur donnée ?',
        },
        {
          kind: 'para',
          text:
            'Une situation concrète pose souvent une question du genre « à partir de quand… ? » ' +
            'ou « quand la grandeur atteint-elle exactement… ? ». Ça revient à résoudre :',
        },
        {
          kind: 'list',
          items: [
            '$f(x) = k$ — un seuil **atteint exactement** ;',
            '$f(x) > k$ ou $f(x) < k$ — un seuil **dépassé**, dans un sens ou dans l’autre.',
          ],
        },
        {
          kind: 'para',
          text:
            'Chaque solution mathématique doit ensuite être confrontée au domaine de validité de ' +
            'départ. Une racine correcte en calcul peut être **impossible** dans la réalité ! ' +
            '(un temps négatif, une longueur trop grande…) Il faut alors la rejeter.',
        },
        {
          kind: 'para',
          text:
            'Contexte pour les deux exemples suivants. Un ballon est lancé depuis 25 m de haut. ' +
            'Sa hauteur (en mètres), après t secondes, vaut $h(t) = -5t^2+20t+25$, avec $t \\ge 0$.',
        },
        {
          kind: 'exemple',
          badge: 'équation — à quel instant touche-t-il le sol ?',
          steps: [{ tag: 'h(t) = 0, factorisée', text: '$-5(t-5)(t+1) = 0 \\to t=5$ ou $t=-1$' }],
          result: {
            tag: 'confrontation au domaine t ≥ 0',
            text: '$t=-1$ est rejeté (un temps négatif n\'existe pas). Il ne reste que **t = 5 secondes**.',
          },
        },
        {
          kind: 'exemple',
          badge: 'inéquation — au-dessus du point de départ',
          steps: [
            {
              tag: 'h(t) > 25',
              text:
                '$-5t^2+20t>0 \\iff -5t(t-4)>0 \\iff t(t-4)<0$ (division par −5, l\'inégalité change de sens)',
            },
          ],
          result: {
            tag: 'le produit est négatif entre les zéros 0 et 4',
            text: 'le ballon reste au-dessus de 25 m pour $t \\in ]0;4[$ (en secondes), avant de redescendre',
          },
        },
        {
          kind: 'exemple',
          badge: 'un enclos de 40 m de clôture',
          formula:
            'Avec 40 m de clôture, on construit un enclos rectangulaire de côté x (en m), d\'aire ' +
            '$A(x) = x(20-x)$, avec $0 < x < 20$. Pour quelles valeurs de x l\'aire vaut-elle au moins 96 m² ?',
          steps: [
            { tag: 'poser l\'inéquation', text: '$x(20-x) \\ge 96 \\iff -x^2 + 20x - 96 \\ge 0 \\iff x^2 - 20x + 96 \\le 0$' },
            { tag: 'racines', text: '$\\Delta = 400 - 384 = 16$, $x = \\dfrac{20 \\pm 4}{2}$ : 8 et 12 ; le trinôme est négatif entre ses racines' },
            { tag: 'confronter au domaine', text: '$[8;12]$ est bien inclus dans $]0;20[$' },
          ],
          result: { tag: 'réponse', text: 'un côté compris entre 8 m et 12 m.' },
        },
        {
          kind: 'atelier',
          tag: 'seuil-ballon-widget',
          label: 'Manipule toi-même — un seuil, un domaine',
          caption:
            'Règle le seuil k et choisis le symbole : la résolution s\'affiche (Δ, racines), ' +
            'et chaque racine est confrontée au domaine du contexte — un temps négatif ou ' +
            'une largeur impossible est rejeté. Le réglage par défaut retrouve l\'exemple du ' +
            'ballon : il reste au-dessus de 25 m pour t ∈ ]0 ; 4[ ; la seconde situation ' +
            'est l\'enclos ci-dessus.',
        },
        {
          kind: 'application',
          titre: "Calculer où retombe un ballon, un boulet ou une fusée de feu d'artifice",
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => -5 * t * t + 20 * t + 25, tone: 'accent', xMin: 0, xMax: 5 }],
              shadedRegions: [{ from: 0, to: 4, upper: (t) => -5 * t * t + 20 * t + 25, lower: () => 25, tone: 'good' }],
              xMin: 0,
              xMax: 6.8,
              xTicks: [1, 2, 3, 4, 5],
              yTicks: [10, 20, 25, 30, 40, 45],
              points: [
                { x: 0, y: 25, label: 'départ', tone: 'accent', labelPos: 'left' },
                { x: 2, y: 45, label: 'sommet (hauteur max)', tone: 'good', labelPos: 'above' },
                { x: 5, y: 0, label: 't = 5 s, sol', tone: 'bad', labelPos: 'right' },
              ],
              xAxisLabel: 't (s)',
              yAxisLabel: 'h (m)',
              caption:
                'La trajectoire $h(t)=-5t^2+20t+25$ du ballon lancé plus haut : le sommet (t=2 ' +
                's) est la hauteur maximale, le zéro en t=5 s est l\'instant où il touche le ' +
                'sol, et la zone verte — entre les deux instants où h(t)=25 — est exactement ' +
                'l\'intervalle $]0;4[$ trouvé dans l\'inéquation ci-dessus.',
            },
          ],
          text:
            'L\'exemple du ballon ci-dessus n\'est pas qu\'un exercice : c\'est exactement ' +
            'ainsi qu\'on calcule, en sport ou en pyrotechnie, où et quand un projectile ' +
            'retombe. Un entraîneur de basket qui étudie la trajectoire idéale d\'un tir, un ' +
            "ingénieur qui règle la hauteur d'explosion d'une fusée de feu d'artifice, ou un " +
            'artilleur qui calcule la portée d\'un tir : tous posent la même équation ' +
            '$h(t) = -\\dfrac{1}{2}gt^2+v_0t+h_0$ (où $g$ est l\'accélération de la pesanteur, ' +
            '$v_0$ la vitesse initiale et $h_0$ la hauteur de départ), puis cherchent ses ' +
            'zéros ou son sommet exactement comme tu viens de le faire pour le ballon.',
          domaines: ['Physique', 'Sport'],
        },
        {
          kind: 'entrainement',
          title: 'Équations/inéquations en contexte',
          generatorId: 'gen57',
          description: [
            'Pose puis résous une équation ou une inéquation, à partir d’une histoire. Vérifie ' +
              'chaque solution avec le domaine de validité. Puis interprète le résultat.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 57. Équations/inéquations du second degré en contexte »',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes avec une fraction',
          generatorId: 'gen119',
          description: [
            'Prix et quantité, aller-retour à deux vitesses, deux robinets : mets le problème en ' +
              'équation (x au dénominateur), pose la CE, résous, rejette la valeur impossible dans ' +
              'le contexte, puis réponds à la question.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 119. Problèmes avec une fraction »',
        },
      ],
    },
    {
      id: 'revision',
      number: 8,
      title: 'Révision — vrai ou faux',
      kicker: '360 affirmations, 11 thèmes, de Viète aux inéquations rationnelles',
      titreCourt: 'Révision : vrai ou faux',
      partie: 'En contexte, puis réviser',
      essentiel: [
        'Le quiz vrai/faux reprend tout le chapitre en 11 thèmes, de la résolution sans discriminant aux équations en contexte : un seul essai par question, la justification est toujours donnée.',
      ],
      cartes: [
        { question: 'Pour $x^2 - 3x - 4 = 0$, une copie écrit $\\Delta = -3^2 + 16$. Quelle est l\'erreur ?', reponse: 'Il faut $(-3)^2 = 9$ : $\\Delta = 9 + 16 = 25$.' },
        { question: 'Une copie résout $x^2 < 4x$ en divisant par x et trouve $x < 4$. Quelle est l\'erreur ?', reponse: 'x peut être négatif ou nul : $x(x-4) < 0$ donne $S = ]0;4[$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Révision : présentation du quiz et synthèse du chapitre', youtubeId: 'Z7YvxgvtaIM' },
        {
          kind: 'para',
          text:
            '360 affirmations. 11 thèmes. Ils reprennent tout le chapitre : le vocabulaire, la ' +
            'résolution sans discriminant, le discriminant Δ, sa démonstration, la somme et le ' +
            'produit des racines, la méthode générale de factorisation, les inéquations et le ' +
            'tableau de signes, les fractions rationnelles, l\'inconnue au dénominateur, les ' +
            'inéquations rationnelles et les équations en contexte. Un seul essai par question. ' +
            'La justification est toujours donnée.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — nouveau depuis le chapitre 1',
          text:
            'Ce quiz utilise beaucoup le discriminant $\\Delta = b^2-4ac$, sa formule ' +
            '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$, et les relations de Viète ' +
            '($S = -b/a$, $P = c/a$). Le quiz du chapitre 1 ne les utilisait pas : c\'est le ' +
            'premier quiz qui les utilise.',
        },
        {
          kind: 'entrainement',
          title: 'Équations et inéquations du second degré — quiz vrai/faux',
          generatorId: 'gen61',
          description: [
            'Choisis un thème et teste-toi : 360 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 61. Équations et inéquations du second degré — quiz vrai/faux »',
        },
        {
          kind: 'entrainement',
          title: 'Détective d\'erreurs : second degré',
          generatorId: 'gen121',
          description: [
            'Un élève a résolu une équation ou une inéquation du chapitre, et une ligne de sa copie ' +
              'est fausse : trouve-la, nomme l\'erreur (−3² dans Δ, b au lieu de −b, division par x, ' +
              'sens non changé, valeur interdite gardée…), puis donne l\'ensemble-solution correct.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 121. Détective d\'erreurs : second degré »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Discriminant & racines',
        formulas: [
          { text: '$\\Delta = b^2-4ac$' },
          {
            text: '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$',
            condition: 'si $\\Delta \\ge 0$ — racine double si $\\Delta=0$',
          },
          { text: 'racine double : $x = -\\dfrac{b}{2a}$', condition: 'si $\\Delta = 0$' },
          { text: '$\\Delta < 0$ → aucune racine réelle' },
          {
            text: '$\\left(k\\sqrt{n}\\right)^2 = k^2 n \\qquad \\sqrt{k^2 n} = k\\sqrt{n}$',
            condition: 'coefficients irrationnels ($k \\ge 0$) : calculer Δ, puis simplifier $\\sqrt{\\Delta}$',
          },
        ],
      },
      {
        title: 'Raccourcis avant Δ',
        formulas: [
          {
            text: '$ax^2+bx=0 \\Rightarrow x(ax+b)=0$',
            condition: '$x=0$ ou $x=-b/a$',
          },
          {
            text: '$ax^2+c=0 \\Rightarrow x = \\pm\\sqrt{-c/a}$',
            condition: 'valable seulement si $a$, $c$ de signes opposés',
          },
          { text: '$b = 0$ et $ac > 0$ → aucune solution', condition: '$x^2 = -\\dfrac{c}{a}$ serait négatif' },
          {
            text: '$ax^2+bx+c = a\\left(x+\\dfrac{b}{2a}\\right)^2$',
            condition: 'carré parfait : seulement si $b^2 = 4ac$',
          },
          {
            text: '$a+b+c=0 \\Rightarrow x_1 = 1,\\ x_2 = \\dfrac{c}{a} \\qquad a-b+c=0 \\Rightarrow x_1 = -1,\\ x_2 = -\\dfrac{c}{a}$',
            condition: 'racine évidente — le discriminant marche aussi',
          },
          { text: 'facteur $\\times$ facteur $=0$ → l\'un des deux $=0$', condition: 'produit nul' },
        ],
      },
      {
        title: 'Forme factorisée',
        formulas: [
          { text: '$ax^2+bx+c = a(x-x_1)(x-x_2)$' },
          { text: '$x_1+x_2=-b/a \\quad x_1 \\cdot x_2 = c/a$' },
          {
            text: '$x^2 - Sx + P = 0$',
            condition: 'équation de solutions $x_1$ et $x_2$, avec $S = x_1+x_2$ et $P = x_1 \\cdot x_2$',
          },
          {
            text: '$P < 0$ → racines de signes opposés ; $\\Delta > 0$ et $P > 0$ → même signe, celui de $S$',
            condition: 'signe des racines',
          },
        ],
      },
      {
        title: 'Signe du trinôme',
        formulas: [
          { text: '$\\Delta<0$ → signe de $a$, partout' },
          { text: '$\\Delta=0$ → signe de $a$, nul en $x=r$' },
          { text: '$\\Delta>0$ → signe de $a$ hors $[x_1;x_2]$, opposé entre' },
          {
            text: '$\\Delta < 0$ : $S = \\mathbb{R}$ ou $\\varnothing$ ; $\\Delta = 0$ : $S = \\mathbb{R}$, $\\mathbb{R} \\setminus \\{r\\}$, $\\{r\\}$ ou $\\varnothing$',
            condition: 'selon le symbole et le signe de $a$',
          },
        ],
      },
      {
        title: 'Fractions et CE',
        formulas: [
          { text: 'CE : dénominateur $\\neq 0$' },
          { text: 'une valeur de CE est toujours exclue de $S$', condition: 'même avec ≤ ou ≥' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Résoudre** — essaie d\'abord les 3 raccourcis ($c = 0$ ; $b = 0$ avec $a$ et $c$ de signes ' +
        'opposés ; carré parfait), repère le cas sans solution visible ($b = 0$, $a$ et $c$ de même ' +
        'signe) et le cas caché (une même expression des deux côtés). Si $a+b+c=0$ ou $a-b+c=0$, la ' +
        'racine évidente est une méthode possible — le discriminant reste juste aussi. Le ' +
        'discriminant, c\'est pour le cas général — jamais par défaut !',
      '**Discriminant** — $\\Delta = b^2-4ac$, $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$. Viète : $S = ' +
        'x_1+x_2 = -\\dfrac{b}{a}$, $P = x_1 \\cdot x_2 = \\dfrac{c}{a}$.',
      '**Écrire une équation à partir des racines** — $a(x-x_1)(x-x_2)=0$ ($a \\neq 0$). Ou, à un ' +
        'facteur $a$ près : $x^2 - Sx + P = 0$.',
      '**Signe d\'un trinôme** — racines → signe de $a$ → intervalle. Toujours avec des crochets ' +
        'inversés, jamais des parenthèses.',
      '**Produit de facteurs** — une ligne par facteur. Nombre impair de facteurs négatifs → ' +
        'produit négatif. Un facteur irréductible ($\\Delta<0$) garde toujours le même signe — pas de ' +
        'racine à ajouter.',
      '**Fractions rationnelles** — simplifie seulement après avoir tout factorisé. La CE se ' +
        'pose sur le dénominateur avant de simplifier, jamais après.',
      '**Équation ou inéquation rationnelle** — vérifie chaque solution avec la CE, après ' +
        'résolution. Une valeur de CE est toujours exclue de la solution, même avec un symbole large.',
      '**En contexte** — traduis la question en $f(x)=k$ (seuil atteint) ou $f(x)>k$, $f(x)<k$ ' +
        '(seuil dépassé). Puis confronte chaque solution au domaine de validité : une racine juste ' +
        'en calcul peut être impossible dans la réalité.',
    ],
    checklist: {
      items: [
        'Ai-je cherché une méthode plus rapide que le discriminant ?',
        'Ai-je bien mis $-b$, et pas $b$, dans la formule du discriminant ?',
        'Ai-je posé la CE sur chaque dénominateur, avant de simplifier ou de multiplier en croix ?',
        'Ai-je vérifié chaque solution trouvée avec la CE ?',
        'Dans une inéquation rationnelle, ai-je tout passé à gauche au lieu de multiplier en croix ?',
        'Pour $\\Delta < 0$ ou $\\Delta = 0$, ai-je écrit $S = \\mathbb{R}$, $\\varnothing$, ' +
          '$\\mathbb{R} \\setminus \\{r\\}$ ou $\\{r\\}$, selon le symbole ?',
        'En contexte, ai-je rejeté les solutions hors du domaine de validité (temps négatif, longueur trop grande…) ?',
      ],
    },
    forward:
      'Au chapitre 3 (fonctions de référence), tu résoudras des équations comme ' +
      '$\\sqrt{x+2} = x$ : en élevant au carré, une équation du second degré apparaît, avec ses ' +
      'solutions étrangères — la même vigilance que pour l\'inconnue au dénominateur.',
  },
}
