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
      kicker: '3 raccourcis visibles, un cas caché, le discriminant seulement en dernier recours',
      blocks: [
        { kind: 'video', title: 'Résoudre une équation du second degré (1/3) : les raccourcis avant le discriminant', youtubeId: '6WDdAWpUZW8' },
        { kind: 'video', title: 'Résoudre une équation du second degré (2/3) : le discriminant', youtubeId: 'Vv3ZyYvgF5A' },
        { kind: 'video', title: 'Résoudre une équation du second degré (3/3) : cas caché, Viète, factorisation', youtubeId: 'PvUzvCBSqks' },
        {
          kind: 'para',
          text:
            'Il y a une méthode qui marche à chaque fois : le discriminant. Mais elle demande ' +
            'beaucoup de calculs. Avant de l\'utiliser, regarde toujours si tu es dans un des 3 ' +
            'cas plus rapides du tableau ci-dessous — un 4e, caché dans la forme de l\'énoncé, ' +
            'vient juste après le discriminant.',
        },
        {
          kind: 'intuition',
          label: 'Le bon réflexe',
          text:
            'Face à une porte fermée, tu n\'attaques pas le mur au marteau tout de suite : tu ' +
            'essaies d\'abord la poignée. Le **discriminant**, c\'est le mur — il marche à ' +
            'chaque fois, mais il demande le plus de calculs. Les 4 cas du tableau ci-dessous, ' +
            'ce sont les poignées : plus rapides, à essayer en premier.',
        },
        {
          kind: 'featureTable',
          caption: 'Reconnaître la technique avant de calculer quoi que ce soit',
          headers: ['Ce que tu vois dans l\'équation', 'Ce que tu fais'],
          rows: [
            ['c = 0 — pas de terme constant', 'tu mets x en évidence'],
            ['b = 0, et a et c de signes opposés', 'différence de deux carrés'],
            ['b = 0, et a et c de même signe', 'aucune solution : x² = −c/a est négatif'],
            ['b ≠ 0, c = b²/(4a) → Δ = 0', 'c\'est un carré parfait'],
            ['aucune des conditions ci-dessus', 'cas général — le discriminant'],
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
          formula:
            '$2x^2-12x+18=0$ — ici $b^2=144$ et $4ac=4 \\cdot 2 \\cdot 18=144$. Donc Δ = 0, ' +
            'sans même le calculer !',
          steps: [{ tag: 'carré parfait', text: '$2(x^2-6x+9) = 2(x-3)^2 = 0$' }],
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
          kind: 'para',
          text:
            'Si aucun des 3 cas ci-dessus ne marche, pas de souci : utilise la formule du ' +
            'discriminant. Elle marche **toujours**. Voici comment on la retrouve, étape par étape.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — étape par étape',
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
          kind: 'atelier',
          tag: 'discriminant-racines-widget',
          label: 'Manipule toi-même — a, b, c et le discriminant',
          caption:
            'Fais varier a, b et c : Δ se recalcule en direct, et la parabole change de couleur ' +
            'selon son signe. Observe combien de fois elle coupe l\'axe des x selon que Δ est ' +
            'positif, nul ou négatif.',
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
          titre: 'Le savant de Bagdad qui complétait de vrais carrés',
          text:
            'Vers 820, à Bagdad, **Muhammad ibn Mūsā al-Khwārizmī** écrit un traité dont le titre ' +
            'contient le mot al-jabr — qui a donné notre mot « algèbre ». Il y résout des problèmes ' +
            'comme « un carré et dix racines égalent trente-neuf » ($x^2 + 10x = 39$) sans aucune ' +
            'lettre, en complétant un **vrai carré dessiné** : il accole au carré de côté x deux ' +
            'rectangles, ajoute le petit carré manquant (25), obtient un grand carré d\'aire 64, donc ' +
            'de côté 8, et conclut x = 3. C\'est exactement la démonstration du discriminant, faite ' +
            'avec des figures. Son nom, latinisé, a donné le mot « algorithme ».',
        },
        { kind: 'subheading', text: 'Le cas caché — mettre une expression entière en évidence' },
        {
          kind: 'para',
          text:
            'Il y a une 5e situation. Tu ne la vois pas en regardant a, b et c une fois ' +
            'l\'équation développée. Tu la vois dans la **forme de l\'énoncé**, avant de développer.',
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
                'Donc $x_1 \\cdot x_2 = \\dfrac{4ac}{4a^2} = \\dfrac{c}{a}$. $\\qquad \\blacksquare$',
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
            'systématiquement des LETTRES pour représenter à la fois les quantités connues et ' +
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
            'Calcule la somme et le produit des racines (relations de Viète), factorise une ' +
              'équation à partir de ses racines, puis construis une équation à partir de ses ' +
              'solutions.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 67. Relations entre racines et coefficients »',
        },
      ],
    },
    {
      id: 'signe-trinome',
      number: 2,
      title: "Étudier le signe d'un trinôme",
      kicker: 'un tableau de signes en 3 étapes, toujours dans le même ordre',
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
        { kind: 'subheading', text: 'La notation à crochets inversés' },
        {
          kind: 'para',
          text:
            'Une solution s\'écrit toujours avec des intervalles. Jamais avec des parenthèses ' +
            '( ) comme en français. Un crochet ouvert **vers l\'intérieur** de l\'intervalle : ' +
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
            'Règle a, b et c, choisis le symbole ◇, et regarde le tableau de signes se ' +
            'construire tout seul sous la parabole colorée — puis l\'ensemble-solution S calculé ' +
            'avec la bonne notation à crochets.',
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
                'x = 5 et x = 15. La zone verte, au-dessus de 75 m², EST l\'ensemble-solution de ' +
                'l\'inéquation $-x^2+20x-75 \\geq 0$.',
            },
          ],
          text:
            'Un agriculteur dispose de 40 mètres de clôture pour un enclos rectangulaire et ' +
            'veut que sa surface atteigne AU MOINS 75 m². Si x est la longueur d\'un côté, ' +
            'l\'autre côté vaut $20-x$ (le périmètre total divisé par 2, moins x), donc l\'aire ' +
            'vaut $A(x)=x(20-x)$ — une fonction du second degré. La question « pour quelles ' +
            'valeurs de x l\'aire est-elle d\'au moins 75 m² ? » est exactement une INÉQUATION ' +
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
      ],
    },
    {
      id: 'signe-produit',
      number: 3,
      title: 'Signe d\'un produit de plusieurs facteurs',
      kicker: 'le même principe, appliqué à 2 ou 3 facteurs à la fois',
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
            'Règle la racine de chaque facteur (active le 3e si besoin) : la grille se construit ' +
            'ligne par ligne, la courbe du produit se colore en direct, et S se calcule pour le ' +
            'symbole choisi — reprend par défaut l\'exemple (x−1)·x·(x−3) résolu ci-dessus.',
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
                'Deux contraintes à la fois — N ≥ 500 (facteur N−500) ET N ≤ 3000 (facteur ' +
                '3000−N) — combinées en un seul produit $(N-500)(3000-N)$. La zone verte, où ' +
                'ce produit est positif, EST la plage de vitesse où les deux conditions sont ' +
                'respectées simultanément : exactement ce que lit la grille de signes.',
            },
          ],
          text:
            'Un ingénieur qui conçoit un système (électrique, mécanique, chimique...) doit ' +
            'souvent garantir que PLUSIEURS grandeurs restent dans une plage sûre EN MÊME ' +
            'TEMPS — une pression, une température, une tension. Si chaque contrainte s\'écrit ' +
            'comme un facteur du premier ou du second degré, la condition « le système reste ' +
            'sûr » devient un produit de plusieurs facteurs qui doit garder un signe donné — ' +
            'exactement la situation de cette section. La grille de signes que tu viens de ' +
            'construire, qui compte le nombre de facteurs négatifs colonne par colonne, est ' +
            'précisément la méthode qu\'un ingénieur utilise pour repérer en un coup d\'œil les ' +
            'plages de fonctionnement sûres, sans devoir vérifier chaque contrainte séparément ' +
            'à chaque valeur testée.',
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
      blocks: [
        { kind: 'video', title: 'L\'inconnue au dénominateur', youtubeId: '-9pfuHh_OLI' },
        {
          kind: 'para',
          text:
            'Résoudre une équation avec x au dénominateur suit toujours le même chemin : pose ' +
            'la condition d\'existence. Mets les deux membres au même dénominateur, ou ' +
            'multiplie en croix. Résous l\'équation obtenue. Puis vérifie **chaque** solution ' +
            'avec la CE de départ.',
        },
        {
          kind: 'methode',
          items: [
            'Pose la CE : chaque dénominateur ≠ 0.',
            'Multiplie en croix (ou réduis au même dénominateur). N\'oublie jamais la CE.',
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
            'Résous une équation rationnelle (5 constructions possibles), en isolant, ' +
              'simplifiant si besoin, puis en écartant toute racine étrangère.',
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
      blocks: [
        { kind: 'video', title: 'Inéquations rationnelles', youtubeId: 'nMZsTQUZQKE' },
        {
          kind: 'para',
          text:
            'Une inéquation rationnelle se traite comme un produit de facteurs (section 3), ' +
            'avec une différence : le dénominateur peut annuler le quotient **sans que le ' +
            'quotient vaille 0**. Dans ce cas, il devient **non défini**. Cette valeur a sa ' +
            'propre marque dans le tableau. Elle est prioritaire sur tout le reste.',
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
              'numérateur cubique) — le moteur le plus étoffé du chantier 4e.',
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
            text: 'le ballon reste au-dessus de 25 m pendant **0 < t < 4 secondes**, avant de redescendre',
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
                'l\'intervalle $0<t<4$ trouvé dans l\'inéquation ci-dessus.',
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
      ],
    },
    {
      id: 'revision',
      number: 8,
      title: 'Révision — vrai ou faux',
      kicker: '224 affirmations, 7 thèmes, discriminant et relations de Viète inclus',
      blocks: [
        { kind: 'video', title: 'Révision : présentation du quiz et synthèse du chapitre', youtubeId: 'Z7YvxgvtaIM' },
        {
          kind: 'para',
          text:
            '224 affirmations. 7 thèmes. Ils reprennent tout le chapitre : le vocabulaire, la ' +
            'résolution sans discriminant, le discriminant Δ, sa démonstration, la somme et le ' +
            'produit des racines, la méthode générale de factorisation, les inéquations et le ' +
            'tableau de signes. Un seul essai par question. La justification est toujours donnée.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — nouveau depuis le chapitre 1',
          text:
            'Ce quiz utilise beaucoup le discriminant $\\Delta = b^2-4ac$, sa formule ' +
            '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$, et les relations de Viète ' +
            '($S = -b/a$, $P = c/a$). Le quiz du chapitre 1 ne les utilisait pas : c\'est la ' +
            'première fois que tu les vois.',
        },
        {
          kind: 'entrainement',
          title: 'Équations et inéquations du second degré — quiz vrai/faux',
          generatorId: 'gen61',
          description: [
            'Choisis un thème et teste-toi : 224 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 61. Équations et inéquations du second degré — quiz vrai/faux »',
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
          { text: '$\\Delta < 0$ → aucune racine réelle' },
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
          {
            text: '$a+b+c=0 \\Rightarrow x_1 = 1,\\ x_2 = \\dfrac{c}{a} \\qquad a-b+c=0 \\Rightarrow x_1 = -1,\\ x_2 = -\\dfrac{c}{a}$',
            condition: 'racine évidente',
          },
        ],
      },
      {
        title: 'Forme factorisée',
        formulas: [
          { text: '$ax^2+bx+c = a(x-x_1)(x-x_2)$' },
          { text: '$x_1+x_2=-b/a \\quad x_1 \\cdot x_2 = c/a$' },
        ],
      },
      {
        title: 'Signe du trinôme',
        formulas: [
          { text: '$\\Delta<0$ → signe de $a$, partout' },
          { text: '$\\Delta=0$ → signe de $a$, nul en $x=r$' },
          { text: '$\\Delta>0$ → signe de $a$ hors $[x_1;x_2]$, opposé entre' },
        ],
      },
      {
        title: 'Équation rationnelle',
        formulas: [
          { text: 'CE : dénominateur $\\neq 0$' },
          { text: 'facteur $\\times$ facteur $=0$ → l\'un des deux $=0$' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Résoudre** — regarde d\'abord si c=0, ou b=0, ou Δ=0 (carré parfait), si a+b+c=0 (racine évidente), ou si une ' +
        'expression identique apparaît des deux côtés. Le discriminant, c\'est pour le cas ' +
        'général — jamais par défaut !',
      '**Discriminant** — $\\Delta = b^2-4ac$, $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$. ' +
        'Viète : $S = x_1+x_2 = -b/a$, $P = x_1 \\cdot x_2 = c/a$.',
      '**Écrire une équation à partir des racines** — $a(x-x_1)(x-x_2)=0$ ($a \\neq 0$). Ou, à ' +
        'un facteur a près : $x^2 - Sx + P = 0$.',
      '**Signe d\'un trinôme** — racines → signe de a → intervalle. Toujours avec des crochets ' +
        'inversés, jamais des parenthèses.',
      '**Produit de facteurs** — une ligne par facteur. Nombre impair de facteurs négatifs → ' +
        'produit négatif. Un facteur irréductible (Δ<0) garde toujours le même signe — pas de ' +
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
        'Ai-je bien mis −b, et pas b, dans la formule du discriminant ?',
        'Ai-je posé la CE sur chaque dénominateur, avant de simplifier ou de multiplier en croix ?',
        'Ai-je vérifié chaque solution trouvée avec la CE ?',
        'Dans une inéquation rationnelle, ai-je tout passé à gauche au lieu de multiplier en croix ?',
        'Pour Δ < 0 ou Δ = 0, ai-je écrit S = ℝ, ∅, ℝ \\ {r} ou {r}, selon le symbole ?',
        'En contexte, ai-je rejeté les solutions hors du domaine de validité (temps négatif, longueur trop grande…) ?',
      ],
    },
    forward:
      'Au chapitre 3 (fonctions de référence), tu résoudras des équations comme ' +
      '$\\sqrt{x+2} = x$ : en élevant au carré, une équation du second degré apparaît, avec ses ' +
      'solutions étrangères — la même vigilance que pour l\'inconnue au dénominateur.',
  },
}
