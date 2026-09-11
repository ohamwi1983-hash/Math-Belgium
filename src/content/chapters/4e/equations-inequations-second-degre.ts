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
      kicker: '4 raccourcis à connaître, le discriminant seulement en dernier recours',
      blocks: [
        {
          kind: 'para',
          text:
            'Il y a une méthode qui marche à chaque fois : le discriminant. Mais elle demande ' +
            'beaucoup de calculs. Avant de l\'utiliser, regarde toujours si tu es dans un des 4 ' +
            'cas plus rapides ci-dessous.',
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
          kind: 'exemple',
          badge: 'carré parfait — Δ = 0',
          formula:
            '$2x^2-12x+18=0$ — ici $b^2=144$ et $4ac=4 \\cdot 2 \\cdot 18=144$. Donc Δ = 0, ' +
            'sans même le calculer !',
          steps: [{ tag: 'carré parfait', text: '$2(x^2-6x+9) = 2(x-3)^2 = 0$' }],
          result: { tag: 'solution (racine double)', text: '$x = 3$' },
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
          kind: 'methode',
          label: 'Démonstration — étape par étape',
          items: [
            'On met a en évidence. Mais seulement sur les deux premiers termes : ' +
              '$ax^2+bx+c = a[x^2 + \\dfrac{b}{a}x] + c$.',
            'On complète le carré. **Attention** : la moitié de b/a, c\'est b/(2a) — pas b/a ! ' +
              'On obtient : $a(x+\\dfrac{b}{2a})^2 - \\dfrac{\\Delta}{4a}$, avec $\\Delta = b^2-4ac$.',
            'On isole le carré : $a(x+\\dfrac{b}{2a})^2 = \\dfrac{\\Delta}{4a}$.',
            'On prend la racine carrée des deux côtés. C\'est possible seulement si Δ ≥ 0 : ' +
              '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.',
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
            'Pour une équation $ax^2+bx+c=0$ ($\\Delta > 0$), la somme des racines vaut ' +
              '$x_1+x_2 = -\\dfrac{b}{a}$.',
            'Le produit des racines vaut $x_1 \\cdot x_2 = \\dfrac{c}{a}$.',
          ],
        },
        {
          kind: 'methode',
          label: 'Démonstration',
          items: [
            'On part des deux racines de la formule : $x_1 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$ et ' +
              '$x_2 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$.',
            'On les additionne. Les termes en $\\sqrt{\\Delta}$ s\'annulent. Il reste : ' +
              '$x_1+x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}+\\dfrac{-b-\\sqrt{\\Delta}}{2a} = -\\dfrac{b}{a}$.',
            'On les multiplie. On obtient : $x_1 \\cdot x_2 = \\dfrac{(-b+\\sqrt{\\Delta})(-b-\\sqrt{\\Delta})}{4a^2} = ' +
              '\\dfrac{b^2-(b^2-4ac)}{4a^2} = \\dfrac{c}{a}$.',
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
        { kind: 'video', title: 'Résoudre une équation du second degré, méthode par méthode' },
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
      ],
    },
    {
      id: 'signe-trinome',
      number: 2,
      title: "Étudier le signe d'un trinôme",
      kicker: 'un tableau de signes en 3 étapes, toujours dans le même ordre',
      blocks: [
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
          kind: 'astuce',
          text:
            'Le symbole ne te dit pas automatiquement le crochet à utiliser ! Une inégalité ' +
            '**large** (≤/≥) inclut la borne **seulement si** cette borne est une vraie racine. ' +
            'Pose-toi toujours la question — ne réponds pas par automatisme.',
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
      id: 'revision',
      number: 7,
      title: 'Révision — vrai ou faux',
      kicker: '140 affirmations, 7 thèmes, discriminant et relations de Viète inclus',
      blocks: [
        {
          kind: 'para',
          text:
            '140 affirmations. 7 thèmes. Ils reprennent tout le chapitre : le vocabulaire, la ' +
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
            'Choisis un thème et teste-toi : 140 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 61. Équations et inéquations du second degré — quiz vrai/faux »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Résoudre** — regarde d\'abord si c=0, ou b=0, ou Δ=0 (carré parfait), ou si une ' +
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
    ],
    checklist: {
      items: [
        'Ai-je cherché une méthode plus rapide que le discriminant ?',
        'Ai-je bien mis −b, et pas b, dans la formule du discriminant ?',
        'Ai-je posé la CE sur chaque dénominateur, avant de simplifier ou de multiplier en croix ?',
        'Ai-je vérifié chaque solution trouvée avec la CE ?',
      ],
    },
    forward:
      'Le discriminant et les racines reviennent au chapitre 3 (cercle trigonométrique), sous ' +
      'une autre forme. La même règle reste vraie : réfléchis avant de calculer.',
  },
}
