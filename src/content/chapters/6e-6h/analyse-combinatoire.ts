import type { ChapterContent } from '../../types'

export const analyseCombinatoire: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 7,
  title: 'Analyse combinatoire',
  slug: 'analyse-combinatoire',
  lede:
    "Combien de mains, de mots, de podiums, de répartitions différentes — sans tout compter à " +
    "la main ? Ce chapitre te donne les outils : arrangements et combinaisons, répartitions " +
    "contraintes, le binôme de Newton, des problèmes combinés. Tu les appliques ensuite à deux " +
    "situations concrètes : le tirage sans remise (loi hypergéométrique) et les épreuves " +
    'répétées indépendantes (loi binomiale).',

  sections: [
    {
      id: 'denombrementfondamental',
      number: 1,
      title: 'Dénombrement fondamental et arrangements',
      kicker: 'Aₙᵖ : choisir ET ordonner ; Cₙᵖ : choisir seulement',
      titreCourt: 'Arrangements et combinaisons',
      partie: 'Compter : les outils',
      essentiel: [
        'Tu choisis $p$ éléments parmi $n$ : si l\'**ordre compte**, c\'est un arrangement $A_n^p = \\dfrac{n!}{(n-p)!}$ ; sinon, une combinaison $C_n^p = \\dfrac{A_n^p}{p!}$.',
        'Avec répétition : $B_n^p = n^p$ si l\'ordre compte, $\\Gamma_n^p = C_{n+p-1}^p$ sinon ; tous les éléments rangés : $P_n = n!$.',
        'Autour d\'une table ronde, $(n-1)!$ dispositions ; sur un collier, $\\dfrac{(n-1)!}{2}$.',
      ],
      cartes: [
        { question: 'Combien de podiums (1er, 2e, 3e) peut-on former avec 8 coureurs ?', reponse: '$A_8^3 = 8 \\times 7 \\times 6 = 336$.' },
        { question: 'Combien de comités de 3 personnes peut-on former parmi 8 ?', reponse: '$C_8^3 = \\dfrac{336}{3!} = 56$.' },
        { question: 'Combien de cornets de 3 boules avec 4 parfums (répétition permise, sans ordre) ?', reponse: '$\\Gamma_4^3 = C_6^3 = 20$.' },
        { question: 'Combien de diagonales a un polygone convexe à 9 côtés ?', reponse: '$D(9) = \\dfrac{9 \\times 6}{2} = 27$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Dénombrement fondamental et arrangements (1/3) — principe multiplicatif, Aₙᵖ et Cₙᵖ', youtubeId: 'NvocfnB8t2c' },
        { kind: 'video', title: 'Dénombrement fondamental et arrangements (2/3) — démonstration, chiffres distincts, répétitions, diagonales', youtubeId: '17zeoRHG2fM' },
        { kind: 'video', title: 'Dénombrement fondamental et arrangements (3/3) — permutations circulaires, symétrie, combinaisons avec répétitions', youtubeId: '4fc2G-gI66A' },
        {
          kind: 'definition',
          label: 'Définition — principe multiplicatif et factorielle',
          items: [
            "Ton expérience se déroule en plusieurs étapes indépendantes, l'une après l'autre ? " +
              "Le nombre total de résultats, c'est le **produit** du nombre de choix à chaque " +
              "étape — jamais une somme. La **factorielle** de $n$, notée $n!$, compte les " +
              'façons de ranger $n$ objets distincts : ' +
              '$n! = n \\times (n-1) \\times \\ldots \\times 1$, avec $0!=1$ par convention.',
          ],
        },
        {
          kind: 'historique',
          titre: "Qui a inventé le point d'exclamation des maths ?",
          text:
            "Le symbole $n!$ ne vient ni de Newton ni de Pascal : il est dû au mathématicien " +
            "strasbourgeois **Christian Kramp**, qui l'introduit en 1808 dans ses « Éléments " +
            "d'arithmétique universelle ». Kramp justifie son choix par la simplicité : un " +
            'ouvrage qui écrit sans cesse des produits $1 \\times 2 \\times \\ldots \\times n$ a ' +
            "besoin d'une notation courte. Le mot « factorielle », lui, vient de **Louis " +
            'Arbogast**, en 1800. La notation ne s\'impose pas partout d\'un coup : en ' +
            'Angleterre, on a gardé une autre écriture (un angle tracé autour de $n$) ' +
            "jusqu'au début du XXᵉ siècle. Ce qui frappe, c'est la croissance de ces nombres : " +
            '$5!=120$, $10!=3\\,628\\,800$, et $20!$ dépasse déjà $2\\times10^{18}$.',
        },
        {
          kind: 'para',
          text:
            'Dans tout ce chapitre, $n$ désigne le nombre d\'éléments **disponibles** et $p$ le ' +
            'nombre d\'éléments **choisis**. La lettre $k$ est réservée à la suite : elle ' +
            'numérote les termes du binôme (§ 3) et compte des succès (§ 5 et § 6).',
        },
        {
          kind: 'definition',
          label: 'Arrangement Aₙᵖ — choisir ET ordonner',
          items: [
            "Tu choisis $p$ éléments parmi $n$, et l'**ordre compte** (un podium, un mot de " +
              "passe, une suite de rôles) ? C'est un arrangement : " +
              '$A_n^p = \\dfrac{n!}{(n-p)!}$ $= n \\times (n-1) \\times \\ldots \\times (n-p+1)$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — Aₙᵖ = n! ÷ (n − p)!',
          blocks: [
            {
              kind: 'para',
              text:
                'Remplis les $p$ places une à une : $n$ choix pour la 1re, $n-1$ pour la 2e (un ' +
                'élément est déjà pris), …, $n-p+1$ pour la $p$-ième, d\'où ' +
                '$A_n^p = n \\times (n-1) \\times \\ldots \\times (n-p+1)$ — **principe multiplicatif**.',
            },
            {
              kind: 'para',
              text:
                'Multiplie et divise ce produit par $(n-p)! = (n-p) \\times \\ldots \\times 1$ : ' +
                '$A_n^p = \\dfrac{n \\times \\ldots \\times (n-p+1) \\times (n-p)!}{(n-p)!}$ ' +
                '— **on ne change pas un nombre en le multipliant et en le divisant par un même nombre non nul**.',
            },
            {
              kind: 'para',
              text:
                'Le numérateur est le produit de tous les entiers de $n$ à 1, c\'est-à-dire $n!$ : ' +
                '$A_n^p = \\dfrac{n!}{(n-p)!}$ — **définition de la factorielle**. Pour $p=n$, on ' +
                'retrouve $\\dfrac{n!}{0!} = n!$ grâce à $0!=1$.',
            },
          ],
        },
        {
          kind: 'intuition',
          label: 'Les poignées de main',
          text:
            'Imagine une pièce où tout le monde se serre la main, une fois chacun. A serre la ' +
            "main de B : c'est **exactement** la même poignée de main que B serre la main de A " +
            "— un seul événement, pas deux ! Compter les poignées de main, c'est donc choisir 2 " +
            "personnes sans se soucier de qui « commence » : l'ordre n'a aucun sens ici. C'est " +
            'précisément ce que mesure une combinaison.',
        },
        {
          kind: 'definition',
          label: 'Combinaison Cₙᵖ — choisir SEULEMENT',
          items: [
            "Tu choisis $p$ éléments parmi $n$, mais cette fois l'**ordre ne compte pas** (un " +
              "comité, une main de cartes) ? C'est une combinaison : " +
              '$C_n^p = \\dfrac{n!}{p!\\,(n-p)!} = \\dfrac{A_n^p}{p!}$.',
            'Pourquoi diviser par $p!$ ? $A_n^p$ compte chaque groupe de $p$ éléments plusieurs ' +
              "fois, une fois par ordre possible. Diviser par $p!$ retire justement ces " +
              "réordonnancements internes, qui ne comptent plus une fois l'ordre ignoré.",
            'Choisir les $p$ éléments que l\'on garde revient à choisir les $n-p$ éléments que ' +
              'l\'on laisse : $C_n^p = C_n^{n-p}$ (**symétrie**).',
          ],
        },
        {
          kind: 'astuce',
          label: 'La symétrie Cₙᵖ = Cₙⁿ⁻ᵖ, un raccourci de calcul',
          text:
            'Calcule toujours le plus petit des deux côtés : $C_{20}^{14}=C_{20}^{6}$, bien plus ' +
            'rapide à développer à la main. Si tes deux calculs ne coïncident pas, tu tiens une ' +
            'erreur de calcul.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — symétrie Cₙᵖ = Cₙⁿ⁻ᵖ',
          blocks: [
            {
              kind: 'para',
              text:
                'Par la formule : $C_n^{n-p} = \\dfrac{n!}{(n-p)!\\,\\big(n-(n-p)\\big)!}$ ' +
                '$= \\dfrac{n!}{(n-p)!\\,p!}$ — **définition de** $C_n^p$ **appliquée à** $n-p$.',
            },
            {
              kind: 'para',
              text:
                'Le dénominateur contient les mêmes factorielles que celui de ' +
                '$C_n^p = \\dfrac{n!}{p!\\,(n-p)!}$, dans l\'autre ordre, donc $C_n^{n-p} = C_n^p$ ' +
                '— **un produit ne dépend pas de l\'ordre de ses facteurs**.',
            },
            {
              kind: 'para',
              text:
                'Par dénombrement : choisir les $p$ éléments que l\'on garde revient exactement à ' +
                'choisir les $n-p$ éléments que l\'on laisse — **à chaque groupe gardé correspond un ' +
                'seul groupe laissé, et inversement** : les deux comptes sont égaux.',
            },
          ],
        },
        { kind: 'subheading', text: "Reconnaître le type de groupement — vue d'ensemble" },
        {
          kind: 'para',
          text:
            'Avant tout calcul, pose-toi 3 questions, toujours dans le même ordre. Elles te ' +
            'donnent le type exact de groupement, et donc la bonne formule.',
        },
        {
          kind: 'methode',
          label: 'Méthode — 3 questions, toujours dans cet ordre',
          items: [
            "**L'ordre compte-t-il ?** Permuter les éléments choisis change-t-il le résultat ?",
            '**La répétition est-elle autorisée ?** Un même élément peut-il être choisi plusieurs fois ?',
            '**Tous les** $n$ **éléments sont-ils utilisés ?** (c\'est-à-dire $p=n$) — cette 3e ' +
              "question ne se pose que si l'ordre compte : sans ordre, seule la répétition " +
              'distingue les 2 cas possibles.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Groupement', 'Ordre', 'Répétition', 'p = n ?', 'Formule'],
          rows: [
            ['Permutation simple', 'compte', 'non', 'oui', '$P_n=n!$'],
            ['Arrangement simple', 'compte', 'non', 'non', '$A_n^p=\\dfrac{n!}{(n-p)!}$'],
            ['Permutation avec répétition', 'compte', 'oui', 'oui', '$\\dfrac{n!}{n_1! \\ldots n_r!}$'],
            ['Arrangement avec répétition', 'compte', 'oui', 'non', '$B_n^p=n^p$'],
            ['Combinaison simple', 'ne compte pas', 'non', '—', '$C_n^p=\\dfrac{n!}{p!(n-p)!}$'],
            ['Combinaison avec répétition', 'ne compte pas', 'oui', '—', '$\\Gamma_n^p=C_{n+p-1}^p$'],
          ],
        },
        {
          kind: 'astuce',
          label: 'La question 1 coupe le tableau en 2 grandes familles',
          text:
            '« Ordre compte » (permutation, arrangement) et « ordre ne compte pas » ' +
            '(combinaison) forment 2 familles bien séparées — ne mélange jamais leur vocabulaire ' +
            'pour un même groupement. Les questions 2 et 3 affinent ensuite chaque famille ' +
            'séparément ; $A_n^p$ et $C_n^p$, déjà vus ci-dessus, sont les 2 cas sans répétition ' +
            '— les 4 autres lignes du tableau, détaillées au fil de ce chapitre, couvrent les ' +
            'cas avec répétition et les 2 cas de permutation.',
        },
        {
          kind: 'atelier',
          tag: 'ordre-repetition-widget',
          label: 'Manipule toi-même : ordre et répétition',
          caption:
            'Choisis n lettres et la longueur p des groupements : tous les groupements ' +
            "s'affichent en tuiles. Quand l'ordre compte, les mots faits des mêmes lettres " +
            "sont rangés dans un même cadre ; coupe l'ordre et chaque cadre fusionne en une " +
            "seule tuile : Aₙᵖ = Cₙᵖ × p!. Active la répétition : les cadres n'ont plus " +
            'tous la même taille, et le tableau des quatre compteurs montre pourquoi Γₙᵖ a ' +
            'sa propre formule.',
        },
        {
          kind: 'piege',
          label: 'Piège classique — distinguer choisir-et-ordonner de choisir-seulement',
          text:
            'Face à un énoncé de dénombrement, pose-toi toujours cette question en premier : ' +
            '« si je permute les éléments choisis, est-ce que ça change le résultat ? » Un ' +
            "podium (1er, 2e, 3e) → $A_n^p$ : changer l'ordre change qui est 1er ! Un comité de " +
            '3 personnes sans rôle distinct → $C_n^p$ : permuter les 3 personnes choisies ne ' +
            'change rien au comité obtenu.',
        },
        {
          kind: 'intuition',
          label: 'Pizza ou tiercé ?',
          text:
            'Tu composes ta pizza en choisissant 3 garnitures parmi 8 : peu importe si tu dis ' +
            '« olives, champignons, jambon » ou « jambon, olives, champignons », c\'est **la ' +
            "même** pizza. L'ordre ne compte pas → une combinaison, $C_8^3$. Un tiercé, au " +
            'contraire, distingue le 1er, le 2e et le 3e cheval : les mêmes 3 chevaux dans un ' +
            "ordre différent donnent un tiercé **différent**. L'ordre compte → un arrangement, " +
            '$A_8^3$. « Choisir 3 parmi 8 » dans les deux cas, mais deux résultats très ' +
            'différents !',
        },
        { kind: 'subheading', text: "L'ordre compte-t-il ? Étagère ou sac de voyage" },
        {
          kind: 'exemple',
          badge: 'aligner ou emporter 3 livres parmi 8',
          formula:
            'Tu possèdes 8 livres. De combien de façons peux-tu en aligner 3 sur une étagère, de ' +
            'gauche à droite ? De combien de façons peux-tu en emporter 3 dans ton sac de voyage ?',
          steps: [
            { tag: 'étagère : l\'ordre compte', text: '$A_8^3 = 8 \\times 7 \\times 6 = 336$' },
            {
              tag: 'sac : l\'ordre ne compte pas',
              text: '$C_8^3 = \\dfrac{A_8^3}{3!} = \\dfrac{336}{6} = 56$',
            },
          ],
          result: {
            tag: 'conclusion',
            text: '336 alignements, mais seulement 56 sacs : chaque sac correspond à $3! = 6$ alignements.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — Aₙᵖ = Cₙᵖ × p!',
          blocks: [
            {
              kind: 'para',
              text:
                'Choisir $p$ éléments sans ordre : $C_n^p$ façons — **définition de la combinaison**.',
            },
            {
              kind: 'para',
              text:
                'Ordonner ensuite ces $p$ éléments choisis : $p!$ façons pour chaque groupe — ' +
                "**permutation d'un groupe déjà fixé**.",
            },
            {
              kind: 'para',
              text:
                "Choisir-puis-ordonner revient exactement à « arranger directement » : chaque " +
                'groupe non ordonné se décline en $p!$ ordres possibles, d\'où ' +
                '$A_n^p=C_n^p \\times p!$ — **une multiplication, jamais une somme**.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            "$A_n^p=C_n^p+p!$ est **faux** — ça confond addition et multiplication ! Avec " +
            "l'exemple ci-dessus, ça donnerait 56+6=62, très loin des 336 réels.",
        },
        { kind: 'subheading', text: 'Nombres à chiffres tous distincts — principe multiplicatif position par position' },
        {
          kind: 'methode',
          items: [
            "Pour compter les nombres à $n$ chiffres **tous différents** (choisis parmi les chiffres de 0 à 9), " +
              'premier chiffre non nul : remplis les positions **une à une**. Chaque position a ' +
              "un chiffre de moins que la précédente, puisqu'un chiffre déjà utilisé n'est plus " +
              'disponible.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'nombres de 4 chiffres tous différents',
          formula:
            'Combien de nombres de 4 chiffres ont leurs 4 chiffres tous différents ? (Un nombre ' +
            'de 4 chiffres ne commence jamais par 0.)',
          steps: [
            { tag: '1er chiffre', text: '9 choix : de 1 à 9, jamais 0' },
            {
              tag: 'positions suivantes',
              text: '0 redevient permis, mais un chiffre déjà écrit ne l\'est plus : 9, puis 8, puis 7 choix',
            },
            { tag: 'principe multiplicatif', text: '$9 \\times 9 \\times 8 \\times 7 = 4\\,536$' },
          ],
          result: { tag: 'conclusion', text: '4 536 nombres.' },
        },
        {
          kind: 'piege',
          text:
            'Pour 3 chiffres tous différents, la même méthode donne $9 \\times 9 \\times 8 = 648$. ' +
            "Exclure 0 de **toutes** les positions (pas seulement la première) donnerait à tort " +
            "$9 \\times 8 \\times 7 = 504$. Seul le **premier** " +
            "chiffre doit être non nul ! 0 reste parfaitement autorisé ensuite, tant qu'il n'est " +
            'pas répété.',
        },
        {
          kind: 'methode',
          label: 'Méthode — séparer les cas quand deux contraintes se gênent',
          items: [
            'Quand une position est contrainte (le dernier chiffre pair, par exemple) et que le ' +
              'premier chiffre ne peut pas être 0, le nombre de choix du premier chiffre dépend de ' +
              'ce qu\'on a mis à la fin : **sépare les cas** (dernier chiffre nul ou non), compte ' +
              'chaque cas, puis **additionne** — les cas ne se recouvrent pas.',
            'Remplis toujours d\'abord la position la plus contrainte.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'nombres pairs de 3 chiffres tous différents',
          formula: 'Combien de nombres pairs de 3 chiffres ont leurs 3 chiffres tous différents ?',
          steps: [
            {
              tag: 'cas 1 : le dernier chiffre est 0',
              text: '1 choix à la fin, puis 9 pour le 1er (de 1 à 9), 8 pour le milieu : $9 \\times 8 = 72$',
            },
            {
              tag: 'cas 2 : le dernier chiffre est 2, 4, 6 ou 8',
              text:
                '4 choix à la fin, 8 pour le 1er (ni 0 ni le dernier), 8 pour le milieu : ' +
                '$4 \\times 8 \\times 8 = 256$',
            },
            { tag: 'cas disjoints : on additionne', text: '$72 + 256 = 328$' },
          ],
          result: { tag: 'conclusion', text: '328 nombres pairs de 3 chiffres tous différents.' },
        },
        { kind: 'subheading', text: "Arrangement avec répétitions — contraste direct avec l'exemple précédent" },
        {
          kind: 'intuition',
          label: 'Le code du cadenas',
          text:
            "Pense au code à 4 chiffres d'un cadenas ou d'une carte bancaire. Rien n'empêche " +
            'deux chiffres identiques : 1-1-1-1 est un code parfaitement valable, tout comme ' +
            '3-7-3-9. Chaque position se règle indépendamment des autres, sur les 10 chiffres ' +
            "disponibles à chaque fois — c'est exactement le principe de l'arrangement avec " +
            'répétition.',
        },
        {
          kind: 'definition',
          label: 'Définition — arrangement avec répétition Bₙᵖ = nᵖ',
          items: [
            "Dès que la répétition est **autorisée** (un même élément peut réapparaître à " +
              'plusieurs positions), chaque position redevient indépendante des précédentes : ' +
              '**toujours** $n$ choix, quelle que soit la position. $B_n^p = n^p$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'nombres de 4 chiffres écrits avec 1, 2, 5, 7, 8 et 9',
          formula:
            'Avec les chiffres 1, 2, 5, 7, 8 et 9, combien de nombres de 4 chiffres peux-tu ' +
            'écrire si chaque chiffre ne peut servir qu\'une fois ? Et si un chiffre peut être répété ?',
          steps: [
            {
              tag: 'sans répétition : arrangement simple',
              text: '$A_6^4 = 6 \\times 5 \\times 4 \\times 3 = 360$',
            },
            {
              tag: 'avec répétition : arrangement avec répétition',
              text: 'chacune des 4 positions garde ses 6 choix : $B_6^4 = 6^4 = 1296$',
            },
          ],
          result: { tag: 'conclusion', text: '360 nombres sans répétition, 1 296 avec répétition.' },
        },
        {
          kind: 'piege',
          text:
            "1296 > 360 n'est jamais un hasard : autoriser la répétition ne peut **qu'augmenter** " +
            '(ou laisser égal) le nombre de possibilités. Chaque position avec répétition ' +
            'dispose d\'au moins autant de choix que la même position sans répétition — ' +
            'strictement plus, dès la 2e position.',
        },
        { kind: 'subheading', text: "Permutation simple — un arrangement qui utilise **tous** les éléments" },
        {
          kind: 'definition',
          label: 'Définition — permutation simple Pₙ = n!',
          items: [
            "Une **permutation simple** de $n$ éléments distincts, c'est le cas particulier de " +
              "l'arrangement où **tous** les éléments sont utilisés ($p=n$). Il ne reste alors " +
              "plus aucun élément à laisser de côté, seul l'**ordre** change d'une permutation à " +
              "l'autre.",
            '$P_n = A_n^n = n!$',
          ],
        },
        {
          kind: 'exemple',
          badge: 'mots de 4 lettres avec A, E, M, R',
          formula:
            'Combien de « mots » (avec ou sans sens) peux-tu écrire en utilisant une fois chacune ' +
            'des 4 lettres A, E, M et R ?',
          steps: [{ tag: 'permutation simple', text: '$P_4 = 4! = 4 \\times 3 \\times 2 \\times 1 = 24$' }],
          result: {
            tag: 'résultat',
            text: "24 « mots » possibles (sans que le résultat ait nécessairement un sens en français).",
          },
        },
        {
          kind: 'astuce',
          label: 'Pₙ = Aₙⁿ : une permutation est un arrangement complet',
          text:
            "Pose $p=n$ dans la formule de l'arrangement, tu retrouves directement $P_n$ : " +
            '$A_n^n = \\dfrac{n!}{(n-n)!} = \\dfrac{n!}{0!} = n!$ (grâce à $0!=1$). Inutile de ' +
            'mémoriser une formule séparée !',
        },
        { kind: 'subheading', text: "Diagonales d'un polygone" },
        {
          kind: 'definition',
          items: [
            'Un polygone convexe à $n$ côtés a $C_n^2=\\dfrac{n(n-1)}{2}$ segments reliant 2 ' +
              'sommets quelconques (côtés **et** diagonales). Retire les $n$ côtés eux-mêmes, il ' +
              'reste $D(n) = \\dfrac{n(n-3)}{2}$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — D(n) = n(n − 3) ÷ 2',
          blocks: [
            {
              kind: 'para',
              text:
                'Un segment qui relie deux sommets est déterminé par la paire de ses extrémités, ' +
                'sans ordre : il y en a $C_n^2 = \\dfrac{n(n-1)}{2}$ — **combinaison de 2 sommets parmi** $n$.',
            },
            {
              kind: 'para',
              text:
                'Parmi ces segments, $n$ sont des côtés ; tous les autres relient deux sommets non ' +
                'consécutifs — **définition d\'une diagonale**.',
            },
            {
              kind: 'para',
              text:
                '$D(n) = \\dfrac{n(n-1)}{2} - n$ $= \\dfrac{n(n-1)-2n}{2} = \\dfrac{n(n-3)}{2}$ — **même ' +
                'dénominateur, puis mise en évidence de** $n$. Autre lecture : de chaque sommet partent ' +
                '$n-3$ diagonales (ni vers lui-même ni vers ses deux voisins), et chaque diagonale est ' +
                'comptée deux fois, une fois par extrémité.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'diagonales d\'un polygone à 9 côtés, puis le sens inverse',
          formula:
            'Combien de diagonales a un polygone convexe à 9 côtés ? Inversement, quel polygone ' +
            'convexe a exactement 27 diagonales ?',
          steps: [
            { tag: 'formule', text: '$D(9) = \\dfrac{9 \\times 6}{2} = 27$' },
            {
              tag: 'sens inverse : l\'équation',
              text: '$\\dfrac{n(n-3)}{2} = 27$, donc $n^2-3n-54=0$ (on multiplie par 2)',
            },
            {
              tag: 'discriminant',
              text:
                '$\\Delta = (-3)^2 - 4 \\times 1 \\times (-54)$ $= 225 = 15^2$, donc ' +
                '$n=\\dfrac{3+15}{2}=9$ ou $n=\\dfrac{3-15}{2}=-6$',
            },
          ],
          result: {
            tag: 'conclusion',
            text: 'Le polygone à 9 côtés a 27 diagonales, et c\'est le seul : la racine $-6$ est rejetée.',
          },
        },
        {
          kind: 'astuce',
          label: 'Ne garder que la racine positive',
          text:
            "L'équation $n^2-3n-54=0$ admet aussi $n=-6$ comme racine algébrique — mais un " +
            'nombre de côtés ne peut jamais être négatif ! Seule la racine **positive** a un ' +
            "sens géométrique ; l'autre se rejette d'office, sans même la calculer en détail.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'polygonDiagonals',
            sides: 9,
            summaryLabel: 'D(9) = 27 diagonales',
            caption:
              'Nonagone (9 côtés) : les 9 côtés en trait plein, les 27 diagonales en trait fin — ' +
              "$D(9)=27$, exactement l'exemple résolu ci-dessus.",
          },
        },
        { kind: 'subheading', text: 'Retrouver n : factorielles et équations combinatoires' },
        {
          kind: 'methode',
          label: 'Méthode — simplifier, puis ne garder que les solutions admissibles',
          items: [
            'Pour simplifier un quotient de factorielles, écris la plus grande comme un produit ' +
              'qui contient la plus petite : $\\dfrac{(n+1)!}{(n-1)!} = \\dfrac{(n+1) \\times n ' +
              '\\times (n-1)!}{(n-1)!}$ $= n(n+1)$.',
            'Dans une équation, remplace $C_n^p$ ou $A_n^p$ par son produit ($A_n^2 = n(n-1)$, ' +
              '$C_n^2 = \\dfrac{n(n-1)}{2}$), résous, puis ne garde que les solutions **entières** ' +
              'avec $n \\geq p$.',
            'Si $C_n^p=C_n^q$ avec $p\\neq q$, la symétrie $C_n^k=C_n^{n-k}$ impose $p+q=n$ : ' +
              'par exemple, $C_n^3=C_n^5$ donne $n=8$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'tournoi de 45 matchs : résoudre Cₙ² = 45',
          formula:
            'Dans un tournoi, chaque équipe rencontre une fois chacune des autres. 45 matchs ont ' +
            'été joués en tout. Combien d\'équipes participent ?',
          steps: [
            {
              tag: 'traduire',
              text: 'un match = une paire d\'équipes, sans ordre : $C_n^2 = 45$, soit $\\dfrac{n(n-1)}{2} = 45$',
            },
            {
              tag: 'équation du 2e degré',
              text:
                '$n^2-n-90=0$ ; $\\Delta = 1+360 = 361 = 19^2$ ; $n=\\dfrac{1+19}{2}=10$ ou ' +
                '$n=\\dfrac{1-19}{2}=-9$',
            },
          ],
          result: { tag: 'conclusion', text: '10 équipes (la racine $-9$ est rejetée). Vérification : $C_{10}^2 = 45$.' },
        },
        { kind: 'subheading', text: 'Permutations circulaires — table et collier' },
        {
          kind: 'definition',
          items: [
            'Pour $n$ objets distincts disposés en **cercle** : si seules les **rotations** ' +
              "sont considérées équivalentes (une table), il y a $(n-1)!$ dispositions " +
              'distinctes — fixer un objet de référence élimine les rotations. Si en plus les ' +
              "**réflexions** sont équivalentes (un collier, un bracelet — le sens de lecture " +
              "n'importe pas), il faut diviser par 2 : table $(n-1)!$ ; collier " +
              '$\\dfrac{(n-1)!}{2}$ (pour $n \\geq 3$ : avec 2 objets, retourner ne change rien).',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'circularPermutation',
              n: 6,
              mode: 'rotation',
              caption: 'Table (rotations seules équivalentes) — 6 personnes en cercle, $(6-1)!=120$ dispositions.',
            },
            {
              kind: 'circularPermutation',
              n: 6,
              mode: 'reflection',
              caption:
                "Collier (rotations ET réflexions équivalentes) — l'axe de symétrie identifie 2 " +
                'dispositions de la table en une seule\u00a0: $\\dfrac{120}{2}=60$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — (n − 1)! dispositions autour d\'une table ronde',
          blocks: [
            {
              kind: 'para',
              text:
                'Aligne d\'abord les $n$ personnes en file : $n!$ dispositions — **permutation simple**.',
            },
            {
              kind: 'para',
              text:
                'Autour de la table, une disposition et ses rotations ne font qu\'une. Une même ' +
                'disposition circulaire donne exactement $n$ files : on peut « couper » le cercle ' +
                'devant chacune des $n$ personnes — **chaque disposition circulaire est comptée** ' +
                '$n$ **fois parmi les files**.',
            },
            {
              kind: 'para',
              text:
                'Donc il y a $\\dfrac{n!}{n} = (n-1)!$ dispositions autour de la table — **on divise ' +
                'par le nombre de fois où chacune est comptée**. Autre lecture : on fixe la place ' +
                'd\'une personne, et on range les $n-1$ autres.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'table ronde et collier à 7 éléments',
          formula:
            'De combien de façons 7 personnes peuvent-elles s\'asseoir autour d\'une table ronde, ' +
            'si seules les places relatives comptent ? De combien de façons peut-on enfiler 7 ' +
            'perles toutes différentes sur un collier fermé ?',
          steps: [
            { tag: 'table : rotations équivalentes', text: '$(7-1)! = 6! = 720$ dispositions' },
            {
              tag: 'collier : on peut aussi le retourner',
              text: 'chaque collier correspond à 2 tables (une par sens de lecture) : $\\dfrac{720}{2} = 360$',
            },
          ],
          result: { tag: 'conclusion', text: '720 dispositions autour de la table, 360 colliers différents.' },
        },
        {
          kind: 'piege',
          text:
            'Oublier la division par 2 pour un collier (répondre 720 au lieu de 360) est ' +
            "l'erreur la plus fréquente de ce sous-type. Un collier **n'est pas** une simple " +
            'table : la réflexion y ajoute une symétrie supplémentaire à prendre en compte !',
        },
        {
          kind: 'atelier',
          tag: 'table-ronde-collier-widget',
          label: 'Manipule toi-même : table ronde et collier',
          caption:
            'Tourne et retourne une disposition de n personnes ou perles, ou touche-en deux ' +
            "pour les échanger : le widget dit si c'est encore la même table (ou le même " +
            'collier) et liste les n files qui se lisent sur une même table. Toutes les ' +
            'dispositions sont énumérées pour n ≤ 5 : on en compte (n − 1)! pour une table et ' +
            '(n − 1)! ÷ 2 pour un collier (n ≥ 3). Essaie aussi n = 2 : retourner ne change rien.',
        },
        { kind: 'subheading', text: 'Combinaison avec répétitions — dernier cas de la classification' },
        {
          kind: 'definition',
          label: 'Définition — combinaison avec répétition Γₙᵖ',
          items: [
            "Choisir $p$ éléments parmi $n$, sans tenir compte de l'ordre et avec répétition " +
              '**autorisée** (un même élément peut être choisi plusieurs fois) : le dernier des ' +
              '6 types de groupement du tableau de classification. Le résultat se ramène à une ' +
              'combinaison simple de $p$ places parmi $n+p-1$ (démonstration ci-dessous) : ' +
              '$\\Gamma_n^p = C_{n+p-1}^p = \\dfrac{(n+p-1)!}{p!\\,(n-1)!}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'groupes de 3 lettres parmi 5, répétition autorisée',
          formula:
            'Combien de groupes de 3 lettres peut-on former avec les 5 lettres A, B, C, D et E, si ' +
            'une lettre peut être répétée et si l\'ordre des lettres ne compte pas ?',
          steps: [
            {
              tag: 'par décomposition (3 distinctes, 2 + 1, 3 identiques)',
              text: '$C_5^3 + 2 \\times C_5^2 + C_5^1$ $= 10+2 \\times 10+5 = 35$',
            },
            { tag: 'par la formule (n = 5, p = 3)', text: '$\\Gamma_5^3 = C_{5+3-1}^3 = C_7^3 = 35$' },
          ],
          result: { tag: 'conclusion', text: '35 groupes de 3 lettres, les deux méthodes concordant.' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — Γₙᵖ = Cₙ₊ₚ₋₁ᵖ, par les étoiles et les barres',
          blocks: [
            {
              kind: 'para',
              text:
                'Un choix de $p$ éléments parmi $n$ types, avec répétition et sans ordre, est ' +
                'décrit entièrement par le nombre d\'exemplaires pris de chaque type — **l\'ordre ' +
                'ne compte pas, seuls les effectifs comptent**.',
            },
            {
              kind: 'para',
              text:
                'Code ce choix par une rangée de $p$ étoiles (les éléments choisis) et de $n-1$ ' +
                'barres (les séparations entre les $n$ types) : les étoiles avant la 1re barre sont ' +
                'du type 1, celles entre la 1re et la 2e barre du type 2, etc. Avec les 5 lettres ' +
                'A, B, C, D, E et $p=3$ : $\\star\\star|\\star|||$ code A, A, B et $||\\star|\\star|\\star$ code C, D, E — ' +
                '**chaque choix donne une seule rangée, et chaque rangée un seul choix**.',
            },
            {
              kind: 'para',
              text:
                'Une rangée compte $p+(n-1)$ places, et elle est entièrement déterminée par les $p$ ' +
                'places des étoiles — **combinaison de** $p$ **places parmi** $n+p-1$.',
            },
            {
              kind: 'para',
              text:
                'Donc $\\Gamma_n^p = C_{n+p-1}^p$. Pour $n=5$ et $p=3$ : $C_7^3=35$, le même ' +
                'nombre que le comptage par décomposition ci-dessus.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège classique — confondre Γₙᵖ et Cₙᵖ',
          text:
            '$C_5^3=10$ seul (sans répétition) est bien plus petit que $\\Gamma_5^3=35$ (avec ' +
            "répétition) ! N'utilise jamais $C_n^p$ quand l'énoncé autorise explicitement la " +
            "répétition d'un même élément dans le groupe choisi.",
        },
        {
          kind: 'exemple',
          badge: 'cornets de 3 boules parmi 4 parfums',
          formula:
            'Un glacier propose 4 parfums. Tu commandes un cornet de 3 boules : un parfum peut être ' +
            'répété, et l\'ordre des boules ne compte pas. Combien de cornets différents peux-tu commander ?',
          steps: [
            { tag: 'identifier n et p', text: '$n=4$ parfums (les types), $p=3$ boules (les éléments choisis)' },
            { tag: 'sans ordre, avec répétition', text: '$\\Gamma_4^3 = C_{4+3-1}^3 = C_6^3 = 20$' },
          ],
          result: { tag: 'conclusion', text: '20 cornets différents.' },
        },
        {
          kind: 'astuce',
          label: 'Au moins un de chaque type',
          text:
            'Si chaque type doit apparaître au moins une fois ($p \\geq n$), donne d\'abord un ' +
            'exemplaire à chaque type : il reste $p-n$ éléments à répartir librement, d\'où ' +
            '$\\Gamma_n^{p-n} = C_{p-1}^{p-n} = C_{p-1}^{n-1}$. Un cornet de 6 boules avec les 4 ' +
            'parfums présents : $C_5^3 = 10$. C\'est aussi le nombre de solutions entières ' +
            'strictement positives de $x_1+x_2+x_3+x_4 = 6$ (et $\\Gamma_4^6$ celui des solutions ' +
            'positives ou nulles).',
        },
        {
          kind: 'atelier',
          tag: 'etoiles-barres-widget',
          label: 'Manipule toi-même : étoiles et barres',
          caption:
            'Glisse les barres (à la souris ou au doigt) entre les boules de glace : chaque ' +
            'barre sépare deux parfums, et la répartition se lit en direct. Les p + n − 1 ' +
            "places sont fixes : choisir les places des p étoiles suffit, d'où Γₙᵖ = " +
            'Cₙ₊ₚ₋₁ᵖ répartitions. Le mode « au moins un de chaque » interdit les barres au ' +
            'bord ou collées.',
        },
        {
          kind: 'application',
          titre: 'Compter le nombre de mots de passe possibles',
          image: {
            src: '/images/application/padlock.png',
            alt: 'Illustration d\'un cadenas, symbole de sécurité informatique',
            caption: 'AJ Ashton, domaine public (CC0), via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'categoricalBarChart',
              scale: 'log',
              logMin: 6,
              bars: [
                { label: '4 car.', value: 26873856, valueLabel: '27 millions', tone: 'faint' },
                { label: '6 car.', value: 139314069504, valueLabel: '139 milliards', tone: 'faint' },
                { label: '8 car.', value: 722204136308736, valueLabel: '722 mille milliards', tone: 'accent' },
              ],
              xAxisLabel: 'longueur du mot de passe (72 caractères possibles)',
              yAxisLabel: 'nombre de mots de passe',
              footnote: 'échelle logarithmique',
              caption: 'Chaque caractère ajouté **multiplie** l\'espace des clés par 72 — à 8 caractères (l\'exemple du texte), déjà plus de 722 mille milliards de combinaisons.',
            },
            {
              kind: 'categoricalBarChart',
              scale: 'log',
              logMin: 4,
              bars: [
                { label: '4 minuscules', value: 456976, valueLabel: '457 mille', tone: 'faint' },
                { label: '8 car. variés', value: 722204136308736, valueLabel: '722 mille milliards', tone: 'accent' },
              ],
              xAxisLabel: 'type de mot de passe',
              yAxisLabel: 'espace des clés',
              footnote: 'échelle logarithmique',
              caption: 'Un mot de passe « faible » (4 lettres minuscules) contre un « fort » (8 caractères variés) : l\'espace des clés est environ 1,6 milliard de fois plus grand ($72^8 \\div 26^4 \\approx 1{,}6 \\times 10^9$), pas juste « un peu plus dur ».',
            },
          ],
          text:
            'Le principe multiplicatif que tu viens de voir est exactement ce qu\'un ' +
            "informaticien utilise pour évaluer la solidité d'un mot de passe. Un mot de " +
            'passe de 8 caractères choisis parmi 26 lettres minuscules, 26 majuscules, 10 ' +
            'chiffres et environ 10 symboles courants (72 caractères possibles à chaque ' +
            'position) compte $72^8$ possibilités — plus de 722 mille milliards. C\'est ce ' +
            "nombre, appelé l'**espace des clés**, qu'un pirate devrait explorer pour deviner " +
            'le mot de passe par force brute : plus il est grand, plus l\'attaque prend de ' +
            'temps. Ajouter un seul caractère au mot de passe ne l\'allonge pas de façon ' +
            'linéaire : il le **multiplie** par 72 — exactement le principe multiplicatif de ' +
            'cette section, appliqué à la cybersécurité.',
          domaines: ['Informatique', 'Cybersécurité'],
        },
        {
          kind: 'entrainement',
          title: 'Dénombrement fondamental et arrangements',
          generatorId: '6gen43',
          description: [
            'Entraîne-toi sur le principe multiplicatif, la factorielle, les arrangements et ' +
              'combinaisons, les permutations circulaires, les diagonales et les combinaisons ' +
              'avec répétitions.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 43. Dénombrement fondamental et arrangements »',
        },
        {
          kind: 'entrainement',
          title: 'Quelle formule ? Reconnaître le groupement',
          generatorId: '6gen100',
          description: [
            "Avant de calculer, reconnais le groupement : l'ordre compte-t-il ? la répétition est-elle permise ? tous les éléments sont-ils utilisés ? Arrangement, combinaison, permutation (simple, avec répétition, circulaire) ou répartition multinomiale, puis le calcul.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 100. Quelle formule ? Reconnaître le groupement »',
        },
        {
          kind: 'entrainement',
          title: 'Factorielles et équations combinatoires',
          generatorId: '6gen101',
          description: [
            'Simplifie un quotient de factorielles, résous Aₙ² = 56, Cₙ² = 45 ou Cₙ² + n = 21 en rejetant la solution négative, et utilise la symétrie pour Cₙ³ = Cₙ⁵.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 101. Factorielles et équations combinatoires »',
        },
        {
          kind: 'entrainement',
          title: 'Étoiles et barres',
          generatorId: '6gen104',
          description: [
            'Boules de glace, bonbons dans des boîtes, votes, solutions entières de x₁ + … + xₙ = p : code la répartition par des étoiles et des barres, puis compte avec Γₙᵖ = Cₙ₊ₚ₋₁ᵖ, y compris avec au moins un objet par case.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 104. Étoiles et barres »',
        },
      ],
    },

    {
      id: 'denombrementcombine',
      number: 2,
      title: 'Dénombrement combiné et sélections contraintes',
      kicker: 'ET indépendant → multiplier ; OU exclusif → additionner',
      titreCourt: 'Dénombrements combinés',
      partie: 'Compter : les outils',
      essentiel: [
        '$n$ personnes en groupes **nommés** de tailles $n_1, \\ldots, n_r$ : $\\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_r!}$ répartitions — la même formule compte les mots aux lettres répétées.',
        'Un « ET » entre choix indépendants **multiplie** ; un « OU » exclusif **additionne**.',
        '« Au moins un » se compte par le complément : total − aucun.',
      ],
      cartes: [
        { question: 'Combien d\'anagrammes a le mot MISSISSIPPI (1 M, 4 I, 4 S, 2 P) ?', reponse: '$\\dfrac{11!}{4! \\times 4! \\times 2!} - 1 = 34\\,650 - 1 = 34\\,649$.' },
        { question: 'De combien de façons peut-on former 3 binômes (sans nom) avec 6 élèves ?', reponse: '$\\dfrac{6!}{2! \\times 2! \\times 2!} \\div 3! = \\dfrac{90}{6} = 15$.' },
        { question: 'Comités de 3 parmi 8 hommes et 6 femmes, avec au moins une femme ?', reponse: '$C_{14}^3 - C_8^3 = 364 - 56 = 308$.' },
        { question: 'Combien de dominos différents avec les valeurs de 0 à 5 ?', reponse: '$C_6^2 + 6 = 15 + 6 = 21$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Dénombrement combiné et sélections contraintes (1/2) — multinomiale, anagrammes, rôles distingués', youtubeId: 'zUXzGhnlZgE' },
        { kind: 'video', title: 'Dénombrement combiné et sélections contraintes (2/2) — ET / OU, dominos, dés, exclusion', youtubeId: 'TB-ZNUQoI6o' },
        {
          kind: 'definition',
          label: 'Définition — répartition multinomiale',
          items: [
            '$n$ personnes (ou objets) réparties en $r$ groupes **nommés**, de tailles fixées ' +
              '$n_1,\\ldots,n_r$ sommant à $n$ : le nombre de répartitions possibles est ' +
              '$\\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_r!}$.',
            'Tu peux aussi voir ce nombre comme un enchaînement de choix successifs, dans le ' +
              'pool **restant** à chaque étape : $C_n^{n_1} \\times C_{n-n_1}^{n_2} \\times ' +
              '\\ldots$ — jamais en répétant $n$ à chaque étape, ce qui recompterait les mêmes ' +
              'personnes.',
          ],
        },
        {
          kind: 'exemple',
          badge: '10 personnes en 3 groupes nommés de 5, 3 et 2',
          formula:
            'Pour une journée sportive, 10 élèves doivent être répartis en trois équipes : 5 au ' +
            'football, 3 au volley et 2 au tennis. Combien de répartitions sont possibles ?',
          steps: [
            {
              tag: 'par la formule',
              text: '$\\dfrac{10!}{5! \\times 3! \\times 2!} = \\dfrac{3\\,628\\,800}{120 \\times 6 \\times 2} = 2520$',
            },
            {
              tag: 'par étapes successives',
              text:
                '$C_{10}^5 \\times C_5^3 \\times C_2^2$ $= 252 \\times 10 \\times 1 = 2520$ — chaque ' +
                "facteur puise dans les personnes **restantes** (10, puis 5, puis 2), jamais dans les " +
                "10 d'origine à chaque fois",
            },
          ],
          result: { tag: 'conclusion', text: '2 520 répartitions.' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la multinomiale comme produit de combinaisons',
          blocks: [
            {
              kind: 'para',
              text:
                'Remplis les groupes l\'un après l\'autre. Le 1er groupe : $n_1$ personnes parmi ' +
                '$n$, soit $C_n^{n_1} = \\dfrac{n!}{n_1!\\,(n-n_1)!}$ — **combinaison, l\'ordre dans un ' +
                'groupe ne compte pas**.',
            },
            {
              kind: 'para',
              text:
                'Le 2e groupe : $n_2$ personnes parmi les $n-n_1$ restantes, soit ' +
                '$C_{n-n_1}^{n_2} = \\dfrac{(n-n_1)!}{n_2!\\,(n-n_1-n_2)!}$, et ainsi de suite jusqu\'au ' +
                'dernier groupe — **principe multiplicatif : les choix s\'enchaînent**.',
            },
            {
              kind: 'para',
              text:
                'Dans le produit $\\dfrac{n!}{n_1!\\,(n-n_1)!} \\times \\dfrac{(n-n_1)!}{n_2!\\,(n-n_1-n_2)!} ' +
                '\\times \\ldots$, chaque factorielle « restante » se simplifie avec le numérateur ' +
                'suivant, et la dernière vaut $0! = 1$ — **simplification en chaîne**.',
            },
            {
              kind: 'para',
              text:
                'Il reste $C_n^{n_1} \\times C_{n-n_1}^{n_2} \\times \\ldots \\times C_{n_r}^{n_r}$ ' +
                '$= \\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_r!}$.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            '$C_{10}^5 \\times C_{10}^3 \\times C_{10}^2$ — en répétant 10 à chaque étape — ' +
            'compterait plusieurs fois les mêmes personnes dans des groupes différents ! Puise ' +
            'toujours dans le nombre **restant** après les choix précédents.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'groupPartition',
            poolLabel: '10 personnes',
            groups: [
              { size: 5, tone: 'accent' },
              { size: 3, tone: 'good' },
              { size: 2, tone: 'faint' },
            ],
            formulaLabel: '10! ÷ (5! × 3! × 2!) = 2 520 répartitions',
            caption:
              'Les 10 personnes réparties en 3 groupes nommés de tailles 5, 3 et 2 : ' +
              '$\\dfrac{10!}{5! \\times 3! \\times 2!} = 2520$ répartitions.',
          },
        },
        { kind: 'subheading', text: 'Groupes non nommés : diviser par le nombre de façons de nommer' },
        {
          kind: 'methode',
          items: [
            'Si les groupes ont la **même taille** et **ne sont pas nommés** (des binômes, des ' +
              'équipes sans couleur ni rôle), la multinomiale compte chaque répartition plusieurs ' +
              'fois : une fois par façon d\'attribuer les noms aux groupes.',
            'Pour $r$ groupes de même taille, il y a $r!$ façons de les nommer : divise la ' +
              'multinomiale par $r!$.',
          ],
        },
        {
          kind: 'exemple',
          badge: '6 personnes en 3 binômes',
          formula:
            'Six élèves doivent travailler par deux. De combien de façons peut-on former les 3 ' +
            'binômes ? (Les binômes n\'ont ni nom ni numéro.)',
          steps: [
            {
              tag: 'binômes numérotés (groupes nommés)',
              text: '$\\dfrac{6!}{2! \\times 2! \\times 2!} = \\dfrac{720}{8} = 90$',
            },
            {
              tag: 'on retire la numérotation',
              text: 'les 3 binômes peuvent être numérotés de $3! = 6$ façons : $\\dfrac{90}{6} = 15$',
            },
          ],
          result: { tag: 'conclusion', text: '15 façons de former les binômes.' },
        },
        {
          kind: 'piege',
          text:
            'Répondre 90 compte 6 fois chaque répartition : « {A, B}, {C, D}, {E, F} » et ' +
            '« {C, D}, {A, B}, {E, F} » sont la même répartition en binômes. Ne divise que si les ' +
            'groupes ont la même taille **et** ne sont pas distingués (5, 3 et 2 personnes ' +
            'forment des groupes reconnaissables à leur taille : pas de division).',
        },
        { kind: 'subheading', text: 'Permutation avec répétitions — la même formule, appliquée à des lettres' },
        {
          kind: 'definition',
          label: 'Définition — permutation avec répétitions',
          items: [
            'Ranger $n$ éléments **dont certains sont identiques** entre eux ($n_1$ exemplaires ' +
              "d'un premier type, $n_2$ d'un second, …, $n_r$ du $r$-ième) revient exactement à une " +
              "répartition multinomiale : chaque type d'élément identique occupe un « groupe nommé » " +
              "de positions, de taille fixée par son nombre d'occurrences — la **même** formule " +
              'que ci-dessus, réinterprétée : $\\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_r!}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'anagrammes du mot MISSISSIPPI',
          formula:
            'Combien de mots différents (avec ou sans sens) peut-on écrire en permutant les 11 ' +
            'lettres du mot MISSISSIPPI (1 M, 4 I, 4 S, 2 P) ? Combien de ces mots sont des ' +
            'anagrammes, c\'est-à-dire différents du mot de départ ?',
          steps: [
            {
              tag: 'permutations distinctes',
              text:
                '$\\dfrac{11!}{1! \\times 4! \\times 4! \\times 2!}$ $= \\dfrac{39\\,916\\,800}{24 \\times 24 \\times 2} = 34\\,650$',
            },
            {
              tag: 'anagrammes',
              text:
                'une **anagramme** est un mot **différent** du mot de départ : on retire ' +
                'MISSISSIPPI lui-même, $34\\,650-1 = 34\\,649$',
            },
          ],
          result: { tag: 'conclusion', text: '34 650 permutations distinctes, dont 34 649 anagrammes.' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'letterTiles',
            letters: ['M', 'I', 'S', 'S', 'I', 'S', 'S', 'I', 'P', 'P', 'I'],
            legend: [
              { letter: 'M', count: 1, tone: 'accent' },
              { letter: 'I', count: 4, tone: 'good' },
              { letter: 'S', count: 4, tone: 'outline' },
              { letter: 'P', count: 2, tone: 'ink' },
            ],
            caption:
              "Les 11 lettres de MISSISSIPPI : les 4 I, les 4 S et les 2 P sont interchangeables " +
              'entre eux, d\'où la division par $4! \\times 4! \\times 2!$ dans ' +
              '$\\dfrac{11!}{4! \\times 4! \\times 2!} = 34\\,650$, soit 34 649 anagrammes une fois le mot de départ retiré.',
          },
        },
        {
          kind: 'piege',
          label: 'Piège classique — oublier de retirer le mot de départ',
          text:
            "34 650 compte le mot MISSISSIPPI d'origine comme l'un des « mots » possibles — " +
            "répondre 34 650 à « combien d'anagrammes ? » compte 1 de trop ! La question « combien " +
            'de **permutations** des lettres ? » (sans exclusion) admet bien 34 650 comme ' +
            'réponse ; seule la question sur les **anagrammes** exige de retrancher 1.',
        },
        {
          kind: 'astuce',
          label: 'Sans lettre répétée, on retrouve n!',
          text:
            'Si les 11 lettres étaient **toutes** distinctes (aucune répétition), la formule ' +
            'redonnerait $\\dfrac{11!}{1! \\times 1! \\times \\ldots \\times 1!}=11!$ — ' +
            'exactement une permutation simple. Diviser par les factorielles des effectifs ' +
            'répétés ($4!$ pour les I, $4!$ pour les S, $2!$ pour les P) retire précisément les ' +
            'réordonnancements internes des lettres identiques, qui ne produisent aucun mot nouveau.',
        },
        {
          kind: 'atelier',
          tag: 'anagrammes-fusion-widget',
          label: 'Manipule toi-même : anagrammes',
          caption:
            'Tape un mot : le widget compte ses lettres et calcule n! ÷ (n₁! × n₂! × …), puis ' +
            'retire le mot de départ pour obtenir les anagrammes (MISSISSIPPI : 34 650 mots, ' +
            'soit 34 649 anagrammes). Pour un mot court, toutes les permutations sont ' +
            'affichées avec des lettres identiques numérotées (P₁, P₂) ; rends-les ' +
            'indiscernables et les permutations qui donnent le même mot fusionnent.',
        },
        { kind: 'subheading', text: 'Lettres groupées : la méthode du bloc' },
        {
          kind: 'methode',
          items: [
            'Des lettres doivent rester **côte à côte** ? Colle-les en un seul **bloc**, compte les ' +
              'rangements des « objets » obtenus (le bloc et les autres lettres), puis multiplie par ' +
              'le nombre d\'ordres possibles **à l\'intérieur** du bloc (1 si l\'ordre du bloc est imposé).',
            'Deux lettres ne doivent **jamais** être côte à côte ? Passe par le complément : ' +
              'total − (rangements où elles forment un bloc).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'anagrammes de CAHIER : voyelles groupées, C et R séparés',
          formula:
            'On permute les 6 lettres, toutes différentes, du mot CAHIER. Combien de mots obtient-on ' +
            'si les 3 voyelles A, I, E restent côte à côte ? Combien si les lettres C et R ne sont ' +
            'jamais côte à côte ?',
          steps: [
            {
              tag: 'voyelles en bloc',
              text:
                'le bloc des voyelles et C, H, R font 4 objets : $4!$ rangements, et $3!$ ordres dans ' +
                'le bloc : $4! \\times 3! = 24 \\times 6 = 144$',
            },
            {
              tag: 'C et R jamais voisins : complément',
              text:
                'total $6! = 720$ ; C et R collés : bloc CR ou RC et 4 autres lettres, ' +
                '$5! \\times 2 = 240$ ; donc $720 - 240 = 480$',
            },
          ],
          result: { tag: 'conclusion', text: '144 mots avec les voyelles groupées, 480 mots où C et R ne se touchent pas.' },
        },
        {
          kind: 'piege',
          text:
            'Oublier l\'ordre **dans** le bloc ($4! = 24$ au lieu de 144) est l\'erreur la plus ' +
            'fréquente : les voyelles collées peuvent s\'écrire AIE, AEI, IAE… — $3! = 6$ ordres.',
        },
        {
          kind: 'application',
          titre: 'Compter les séquences possibles d\'ADN',
          image: {
            src: '/images/application/dna-sequence.png',
            alt: 'Schéma de la structure en double hélice de l\'ADN',
            caption: 'Zephyris, CC BY-SA 3.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'letterTiles',
              letters: ['A', 'T', 'C', 'G', 'A', 'T', 'C', 'A', 'T', 'A'],
              legend: [
                { letter: 'A', count: 4, tone: 'accent' },
                { letter: 'T', count: 3, tone: 'good' },
                { letter: 'C', count: 2, tone: 'ink' },
                { letter: 'G', count: 1, tone: 'outline' },
              ],
              caption: 'Une séquence de 10 bases de composition fixée (4 A, 3 T, 2 C, 1 G) : $\\dfrac{10!}{4! \\times 3! \\times 2! \\times 1!} = 12\\,600$ ordres distincts — le même calcul que pour MISSISSIPPI.',
            },
          ],
          text:
            'L\'ADN s\'écrit avec seulement 4 « lettres » — A, T, C et G, les quatre bases ' +
            'azotées. Deux questions différentes se posent, et elles ne se calculent pas de la ' +
            'même façon. **Combien de séquences de longueur** $L$ **en tout ?** Chaque position ' +
            'reçoit l\'une des 4 bases, répétition autorisée : $4^L$ séquences, un arrangement ' +
            'avec répétition (§ 1) — déjà $4^{10} = 1\\,048\\,576$ pour 10 bases. **Combien de ' +
            'séquences d\'une composition donnée ?** Si l\'on impose 4 A, 3 T, 2 C et 1 G, on ' +
            'ne fait plus que ranger ces 10 lettres : c\'est une permutation avec répétition, ' +
            'comme pour MISSISSIPPI, et il y en a ' +
            '$\\dfrac{10!}{4! \\times 3! \\times 2! \\times 1!} = 12\\,600$. À l\'échelle d\'un ' +
            'vrai gène, long de milliers de bases, $4^L$ dépasse de très loin le nombre ' +
            'd\'atomes de l\'univers observable (environ $10^{80}$, déjà dépassé dès $L=133$).',
          domaines: ['Biologie', 'Génétique'],
        },
        { kind: 'subheading', text: "Rôles distingués — quand tous les éléments choisis n'ont pas le même statut" },
        {
          kind: 'methode',
          items: [
            "Dès qu'un des $k$ éléments choisis a un **rôle particulier** (un président parmi " +
              'des membres, une carte « pivot » dans une main), choisis ce rôle **à part**, ' +
              'puis le reste par une combinaison ordinaire. Une simple $C_n^k$ ignorerait la ' +
              'distinction de rôle.',
          ],
        },
        {
          kind: 'exemple',
          badge: '1 président et 2 vice-présidents parmi 10',
          formula:
            'Un club de 10 membres élit un président et 2 vice-présidents ; les deux vice-présidents ' +
            'ont le même rôle. Combien de bureaux différents sont possibles ?',
          steps: [
            { tag: 'le rôle à part', text: '10 choix pour le président' },
            { tag: 'puis le reste, sans ordre', text: '2 vice-présidents parmi les 9 autres : $C_9^2 = 36$' },
            { tag: 'principe multiplicatif', text: '$10 \\times 36 = 360$' },
          ],
          result: { tag: 'conclusion', text: '360 bureaux possibles.' },
        },
        {
          kind: 'piege',
          text:
            'Écrire $C_{10}^3=120$ (« on choisit 3 personnes parmi 10 ») ignore que le président ' +
            'a un rôle **distinct** des 2 vice-présidents ! La bonne valeur, 360, est 3 fois ' +
            'plus grande — exactement le facteur qui distingue « qui est président » parmi les ' +
            '3 choisis.',
        },
        { kind: 'subheading', text: 'Choix indépendants (ET) vs choix exclusifs (OU)' },
        {
          kind: 'intuition',
          label: 'Menu du jour ou carte des desserts ?',
          text:
            "Au restaurant, un menu impose une entrée **et** un plat : chaque combinaison " +
            'entrée-plat est un choix différent, et le nombre de menus possibles se ' +
            '**multiplie** (3 entrées × 4 plats = 12 menus). À la carte des desserts, tu ' +
            'choisis un seul dessert, parmi ceux du jour **ou** ceux de la carte permanente, ' +
            "jamais les deux à la fois : le nombre de choix, là, s'**additionne**. Multiplier " +
            'pour un « ET » qui combine, additionner pour un « OU » qui exclut — exactement la ' +
            'logique des deux cas qui suivent.',
        },
        {
          kind: 'methode',
          items: [
            "Un « ET » entre 2 choix **indépendants** (2 groupes séparés, chacun contribue) se " +
              'traduit par une **multiplication**.',
            "Un « OU » **exclusif** entre 2 cas qui ne se recouvrent jamais (tous dans le " +
              'groupe A, ou tous dans le groupe B, jamais un mélange) se traduit par une ' +
              '**addition**.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'comité mixte : 2 hommes parmi 8 et 2 femmes parmi 6',
          formula:
            'Un comité compte 2 hommes choisis parmi 8 et 2 femmes choisies parmi 6. Combien de ' +
            'comités différents peut-on former ?',
          steps: [{ tag: 'ET → multiplier', text: '$C_8^2 \\times C_6^2 = 28 \\times 15 = 420$' }],
          result: { tag: 'conclusion', text: '420 comités mixtes.' },
        },
        {
          kind: 'piege',
          text:
            "Additionner $C_8^2+C_6^2=28+15=43$ pour ce même ET est faux ! À **chacun** des 28 " +
            'choix d\'hommes correspondent les 15 choix de femmes : un ET entre choix ' +
            'indépendants **multiplie**. Additionner oublie presque toutes les combinaisons ' +
            '(43 au lieu de $28 \\times 15 = 420$).',
        },
        {
          kind: 'exemple',
          badge: '3 personnes toutes de la même section (10 ou 15 membres)',
          formula:
            'Une association a deux sections : l\'une de 10 membres, l\'autre de 15. On choisit 3 ' +
            'personnes qui doivent **toutes** appartenir à la même section. Combien de choix sont possibles ?',
          steps: [{ tag: 'OU exclusif → additionner', text: '$C_{10}^3+C_{15}^3 = 120+455 = 575$' }],
          result: { tag: 'conclusion', text: '575 choix possibles.' },
        },
        { kind: 'subheading', text: 'Répétition autorisée, ordre libre — séparer les doubles' },
        {
          kind: 'methode',
          items: [
            "Choisir 2 valeurs parmi $n$, répétition autorisée, sans tenir compte de l'ordre " +
              "(comme les 2 faces d'un domino) : sépare les paires de valeurs **différentes** " +
              '($C_n^2$) des paires « doubles » ($n$ possibilités, une par valeur) : ' +
              '$C_n^2+n = C_{n+1}^2$.',
            "C'est exactement une combinaison avec répétition du § 1 : $\\Gamma_n^2 = " +
              'C_{n+2-1}^2 = C_{n+1}^2$ — les deux méthodes donnent le même nombre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'dominos à 6 valeurs',
          formula:
            'Chaque moitié d\'un domino porte une valeur de 0 à 5, et deux dominos sont identiques ' +
            's\'ils portent les mêmes valeurs (un domino se retourne). Combien de dominos différents ' +
            'existe-t-il ?',
          steps: [
            { tag: 'deux valeurs différentes', text: '$C_6^2 = 15$' },
            { tag: 'doubles', text: '6 dominos (0-0, 1-1, …, 5-5)' },
            { tag: 'cas disjoints', text: '$15 + 6 = 21 = C_7^2 = \\Gamma_6^2$' },
          ],
          result: { tag: 'conclusion', text: '21 dominos différents.' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — Cₙ² + n = Cₙ₊₁²',
          blocks: [
            {
              kind: 'para',
              text:
                '$C_n^2 + n = \\dfrac{n(n-1)}{2} + \\dfrac{2n}{2}$ $= \\dfrac{n(n-1)+2n}{2}$ — ' +
                '**définition de** $C_n^2$**, puis même dénominateur**.',
            },
            {
              kind: 'para',
              text:
                '$= \\dfrac{n(n+1)}{2} = \\dfrac{(n+1) \\times n}{2} = C_{n+1}^2$ — **mise en ' +
                'évidence de** $n$**, puis définition de** $C_{n+1}^2$.',
            },
            {
              kind: 'para',
              text:
                'Par dénombrement : ajoute une valeur fictive « double » aux $n$ valeurs. Choisir 2 ' +
                'valeurs parmi ces $n+1$ revient soit à choisir 2 vraies valeurs différentes ($C_n^2$), ' +
                'soit à choisir une vraie valeur et la valeur « double » ($n$ façons, un double) — ' +
                '**deux cas disjoints qui couvrent tout**.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            '$C_6^2=15$ seul oublie les 6 dominos « doubles » (0-0, 1-1, …, 5-5) ! Il faut ' +
            '**toujours** les ajouter séparément pour retrouver le total 21.',
        },
        { kind: 'subheading', text: 'Discernables ou indiscernables' },
        {
          kind: 'exemple',
          badge: 'résultats de 2 dés, discernables ou non',
          formula:
            'On lance deux dés à 6 faces. Combien de résultats différents peut-on noter si les dés ' +
            'sont de couleurs différentes (rouge et bleu) ? Et s\'ils sont identiques, ' +
            'impossibles à distinguer ?',
          steps: [
            {
              tag: 'dés discernables',
              text: 'l\'ordre « rouge puis bleu » compte : $6^2=36$ résultats',
            },
            {
              tag: 'dés indiscernables',
              text:
                '« 3 et 5 » et « 5 et 3 » fusionnent : $C_6^2 + 6 = 15 + 6 = 21 = C_7^2$ résultats',
            },
          ],
          result: { tag: 'conclusion', text: '36 résultats avec des dés discernables, 21 avec des dés indiscernables.' },
        },
        {
          kind: 'astuce',
          label: 'Rendre indiscernable réduit toujours le compte',
          text:
            'Fusionner des cas symétriques ne peut jamais **augmenter** un dénombrement — ' +
            "21 < 36 ici, et c'est toujours le cas. Le rapport n'est cependant pas uniforme : " +
            'les 6 doubles ne correspondent chacun qu\'à **un seul** résultat discernable, les ' +
            '15 paires différentes à **deux** chacune.',
        },
        {
          kind: 'attention',
          label: 'Compter des issues n\'est pas compter des chances égales',
          text:
            'Les 21 résultats de deux dés indiscernables ne sont **pas équiprobables** : un ' +
            'double comme « 3 et 3 » ne sort que d\'une façon sur 36 ($\\frac{1}{36}$), une paire ' +
            'comme « 3 et 5 » de deux façons ($\\frac{2}{36}$). Pour calculer une probabilité, ' +
            'compte toujours des issues **équiprobables** — avec des dés, les résultats ordonnés ' +
            '(dés discernables). C\'est tout le problème des trois dés de Galilée (§ 4).',
        },
        { kind: 'subheading', text: 'Sélection sous contrainte — exclusion et couple indissociable' },
        {
          kind: 'methode',
          items: [
            '2 éléments précis $X$ et $Y$ ne peuvent **jamais** être choisis ensemble ' +
              '(exclusion) : total − (cas où $X$ et $Y$ sont **tous les deux** inclus).',
            '$X$ et $Y$ **doivent** être choisis ensemble ou pas du tout (couple indissociable) : ' +
              "(les deux inclus) + (les deux exclus) — 2 cas disjoints qui s'additionnent.",
          ],
        },
        {
          kind: 'exemple',
          badge: 'comité de 6 parmi 20 : Xavier et Yann, ennemis puis inséparables',
          formula:
            'On forme un comité de 6 personnes parmi 20, dont Xavier et Yann. Combien de comités ' +
            'sont possibles si Xavier et Yann refusent de siéger ensemble ? Et s\'ils refusent de ' +
            'siéger l\'un sans l\'autre ?',
          steps: [
            {
              tag: 'jamais ensemble : total − les deux présents',
              text: '$C_{20}^6-C_{18}^4 = 38\\,760-3060 = 35\\,700$',
            },
            {
              tag: 'inséparables : les deux présents + les deux absents',
              text: '$C_{18}^4+C_{18}^6 = 3060+18\\,564 = 21\\,624$',
            },
          ],
          result: { tag: 'conclusion', text: '35 700 comités sans le duo, 21 624 comités avec le duo complet ou sans lui.' },
        },
        {
          kind: 'piege',
          text:
            "**Additionner** $C_{18}^4$ à $C_{20}^6$ (au lieu de le soustraire) pour l'exclusion " +
            'ne retirerait rien des cas interdits ! La bonne opération retire toujours les cas ' +
            'non voulus du total, elle ne les ajoute jamais. Les 2 résultats, 35 700 et 21 624, ' +
            'restent d\'ailleurs bien **différents** — ce sont deux contraintes opposées, jamais ' +
            'interchangeables.',
        },
        { kind: 'subheading', text: '« Au moins un » : passer par le complément' },
        {
          kind: 'methode',
          items: [
            '« Au moins un » regroupe beaucoup de cas (exactement 1, exactement 2…). Son contraire ' +
              'n\'en a qu\'un : « aucun ». Compte donc **total − aucun**.',
            'Le contraire de « contient le chiffre 7 » est « ne contient aucun 7 » ; celui de « au ' +
              'moins une femme » est « que des hommes ».',
          ],
        },
        {
          kind: 'exemple',
          badge: 'comité de 3 avec au moins une femme',
          formula:
            'Un club compte 8 hommes et 6 femmes. Combien de comités de 3 personnes comprennent au ' +
            'moins une femme ?',
          steps: [
            { tag: 'total', text: '$C_{14}^3 = 364$ comités' },
            { tag: 'contraire : aucune femme', text: '$C_8^3 = 56$ comités d\'hommes seulement' },
            { tag: 'complément', text: '$364 - 56 = 308$' },
          ],
          result: { tag: 'conclusion', text: '308 comités comprennent au moins une femme.' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — « une femme imposée, puis le reste »',
          text:
            'Choisir d\'abord une femme (6 façons), puis 2 personnes parmi les 13 autres ' +
            '($C_{13}^2 = 78$) donne $6 \\times 78 = 468$, plus que les 364 comités possibles ! Un ' +
            'comité avec deux femmes Anne et Béa est compté deux fois : Anne « imposée » puis Béa ' +
            'choisie, et l\'inverse. Le complément évite ces doubles comptages.',
        },
        { kind: 'subheading', text: 'Deux conditions à la fois : l\'inclusion-exclusion' },
        {
          kind: 'methode',
          items: [
            'Pour compter les objets qui ont **à la fois** deux propriétés, compte ceux qui en ' +
              'ratent au moins une, puis retire-les du total. Les objets qui ratent **les deux** ' +
              'sont comptés deux fois : il faut les rajouter une fois.',
            'En formule : $N(A \\text{ et } B) = \\text{total} - N(\\text{pas } A)$ $- N(\\text{pas } B)$ ' +
              '$+ N(\\text{ni } A \\text{ ni } B)$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'codes de 4 chiffres contenant un 0 et un 9',
          formula:
            'Un code de cadenas compte 4 chiffres de 0 à 9, répétitions permises. Combien de codes ' +
            'contiennent au moins un 0 et au moins un 9 ?',
          steps: [
            { tag: 'total', text: '$10^4 = 10\\,000$ codes' },
            {
              tag: 'sans 0, sans 9, ni l\'un ni l\'autre',
              text: 'sans 0 : $9^4 = 6561$ ; sans 9 : $9^4 = 6561$ ; ni 0 ni 9 : $8^4 = 4096$',
            },
            {
              tag: 'inclusion-exclusion',
              text: '$10\\,000 - 6561 - 6561 + 4096 = 974$',
            },
          ],
          result: { tag: 'conclusion', text: '974 codes contiennent au moins un 0 et au moins un 9.' },
        },
        {
          kind: 'piege',
          text:
            'Oublier de rajouter les 4 096 codes sans 0 **ni** 9 donne $10\\,000 - 2 \\times 6561 < 0$ : ' +
            'ils ont été retirés deux fois, une fois avec les codes sans 0 et une fois avec les codes sans 9.',
        },
        {
          kind: 'entrainement',
          title: 'Dénombrement combiné et sélections contraintes',
          generatorId: '6gen44',
          description: [
            'Entraîne-toi sur les répartitions multinomiales, les permutations avec ' +
              'répétition, les rôles distingués, le ET / OU, les combinaisons avec répétition et ' +
              'sur exclusion et couple indissociable.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 44. Dénombrement combiné et sélections contraintes »',
        },
        {
          kind: 'entrainement',
          title: 'Anagrammes et contraintes',
          generatorId: '6gen103',
          description: [
            "Mots réels à lettres répétées : nombre d'anagrammes (sans oublier le mot lui-même), mots qui commencent par une lettre, voyelles groupées en un bloc, deux lettres identiques jamais côte à côte (par le complément).",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 103. Anagrammes et contraintes »',
        },
        {
          kind: 'entrainement',
          title: 'Au moins un : le complément',
          generatorId: '6gen105',
          description: [
            "Choisis d'abord la stratégie la plus directe (le contraire pour « au moins un », deux cas pour « au plus un », un produit pour « exactement »), puis compte avec des combinaisons, sans compter un groupe deux fois.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 105. Au moins un : le complément »',
        },
      ],
    },

    {
      id: 'binomenewton',
      number: 3,
      title: 'Binôme de Newton',
      kicker: "(a + b)ⁿ = ∑ Cₙᵏ · aⁿ⁻ᵏ · bᵏ — l'exposant de a décroît, celui de b croît",
      titreCourt: 'Binôme de Newton',
      partie: 'Le binôme et les problèmes',
      essentiel: [
        '$(a+b)^n = \\displaystyle\\sum_{k=0}^{n} C_n^k \\times a^{n-k} \\times b^k$, de terme général $T_{k+1} = C_n^k \\times a^{n-k} \\times b^k$.',
        'Relation de Pascal $C_n^k = C_{n-1}^{k-1}+C_{n-1}^k$ ; symétrie $C_n^k = C_n^{n-k}$ ; la somme d\'une ligne vaut $2^n$.',
        '$(1+\\varepsilon)^n \\approx 1+n\\varepsilon$ quand $n\\varepsilon$ est petit.',
      ],
      cartes: [
        { question: 'Quel est le terme en $x^2$ de $(2x-1)^5$ ?', reponse: '$C_5^3 \\times (2x)^2 \\times (-1)^3 = -40x^2$.' },
        { question: 'Que vaut $C_4^1 + C_4^2$ ?', reponse: '$C_5^2 = 10$ (relation de Pascal).' },
        { question: 'Combien de parties possède un ensemble à 5 éléments ?', reponse: '$2^5 = 32$.' },
        { question: 'Combien de chemins (droite ou haut) de A(0 ; 0) à B(4 ; 3) ?', reponse: '$C_7^3 = 35$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Binôme de Newton — formule, triangle de Pascal, terme précis, approximation', youtubeId: 'ZcnSsK93GQg' },
        {
          kind: 'definition',
          label: 'Définition — formule du binôme de Newton',
          items: [
            'Le développement de $(a+b)^n$ s\'écrit comme une somme de $n+1$ termes, chacun ' +
              'piloté par un coefficient binomial : $(a+b)^n = \\displaystyle\\sum_{k=0}^{n} ' +
              'C_n^k \\times a^{n-k} \\times b^k$.',
            'Le **terme général** (rang $k+1$) est $T_{k+1}=C_n^k \\times a^{n-k} \\times b^k$ : ' +
              "l'exposant de $a$ **décroît** ($n-k$) tandis que celui de $b$ **croît** ($k$) au " +
              'fil du développement.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Le binôme qui ne porte pas le nom de son premier auteur',
          text:
            'La formule que tu viens de voir — avec un exposant $n$ **entier** — était déjà ' +
            'connue, sous une forme ou une autre, bien avant **Isaac Newton** : elle apparaît ' +
            'dans les travaux de mathématiciens arabes, chinois et européens des siècles ' +
            "précédents. L'apport propre de Newton, découvert vers 1665 mais jamais publié par " +
            'lui-même (il le communique en 1676 dans deux lettres à Leibniz, et John Wallis ' +
            "l'imprime en 1685), est d'une tout autre " +
            'ampleur : il généralise la formule à des exposants **non entiers** — fractionnaires ' +
            'ou même négatifs — en remplaçant la somme finie $C_n^k$ par une série infinie. ' +
            "C'est cette extension audacieuse, bien plus que la formule classique enseignée " +
            'dans ce chapitre, qui porte vraiment la marque de Newton en mathématiques — un ' +
            "exemple de nom attaché par convention à un résultat qu'il n'a pas découvert en " +
            'premier, mais considérablement approfondi.',
          image: {
            src: '/images/historique/newton.jpg',
            alt: 'Portrait d\'Isaac Newton',
            caption: 'Isaac Newton (1642–1727), portrait par Godfrey Kneller, 1689.',
          },
        },
        {
          kind: 'piege',
          text:
            "$(a-b)^n \\neq a^n-b^n$ ! Tu ne peux **jamais** séparer une puissance d'une somme " +
            "(ou d'une différence) en la puissance de chaque terme pris isolément — il faut " +
            'toujours passer par le développement complet du binôme.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — formule du binôme, par dénombrement',
          blocks: [
            {
              kind: 'para',
              text: '$(a+b)^4 = (a+b)(a+b)(a+b)(a+b)$ — **4 facteurs identiques**.',
            },
            {
              kind: 'para',
              text:
                'Développe sans réduire : tu obtiens 16 mots de 4 lettres ($a$ ou $b$), un par ' +
                'façon de choisir un terme dans chaque facteur — **principe multiplicatif, 2 ' +
                'choix × 4 facteurs =** $2^4=16$.',
            },
            {
              kind: 'para',
              text:
                'Regroupe les 16 mots par nombre de $b$ : 1 mot à 0 $b$, 4 mots à 1 $b$, 6 mots ' +
                'à 2 $b$, 4 mots à 3 $b$, 1 mot à 4 $b$ — **énumération directe des 16 mots**.',
            },
            {
              kind: 'para',
              text:
                'Le nombre de mots à exactement $i$ lettres $b$ (et $4-i$ lettres $a$), c\'est ' +
                'le nombre de façons de choisir les $i$ positions occupées par $b$ parmi les 4 ' +
                "positions du mot — exactement $C_4^i$, sans besoin d'énumérer : 1, 4, 6, 4, 1 " +
                'sont exactement $C_4^0$ à $C_4^4$. D\'où $(a+b)^4 = C_4^0a^4b^0 + C_4^1a^3b^1$ ' +
                '$+ C_4^2a^2b^2$ $+ C_4^3a^1b^3 + C_4^4a^0b^4$.',
            },
            {
              kind: 'para',
              text:
                'Généralise à $n$ quelconque : développer $(a+b)^n$ ($n$ facteurs) produit des ' +
                'monômes $a^{n-i}b^i$, chacun obtenu en choisissant, parmi les $n$ facteurs, ' +
                'lesquels fournissent le $b$ — $C_n^i$ façons de faire ce choix pour chaque $i$, ' +
                'exactement le coefficient annoncé par la formule.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'mots-binome-widget',
          label: 'Manipule toi-même : les 2ⁿ mots de (a + b)ⁿ',
          caption:
            'Développe (a + b)ⁿ sans réduire : chaque mot de n lettres a ou b dit dans quel ' +
            'facteur on a pris a ou b. Regroupe les 2ⁿ mots par nombre de b : les colonnes ' +
            'ont pour hauteurs Cₙ⁰, Cₙ¹, …, Cₙⁿ, la ligne n du triangle de Pascal. Touche ' +
            'un mot pour voir le terme du développement auquel il contribue.',
        },
        { kind: 'subheading', text: 'Développer un binôme terme par terme' },
        {
          kind: 'exempleLibre',
          label: 'Développement complet de (2x − 1)⁵ : a = 2x, b = −1, n = 5',
          blocks: [
            {
              kind: 'para',
              text: 'Terme par terme, avec $T_{k+1}=C_5^k \\times (2x)^{5-k} \\times (-1)^k$ :',
            },
            {
              kind: 'featureTable',
              headers: ['k', 'C₅ᵏ', '(2x)⁵⁻ᵏ', '(−1)ᵏ', 'Terme'],
              rows: [
                ['0', '1', '$32x^5$', '1', '$32x^5$'],
                ['1', '5', '$16x^4$', '−1', '$-80x^4$'],
                ['2', '10', '$8x^3$', '1', '$80x^3$'],
                ['3', '10', '$4x^2$', '−1', '$-40x^2$'],
                ['4', '5', '$2x$', '1', '$10x$'],
                ['5', '1', '$1$', '−1', '$-1$'],
              ],
            },
            {
              kind: 'para',
              text:
                '$(2x-1)^5$ $= 32x^5-80x^4+80x^3$ $-40x^2+10x-1$. Vérification en $x=1$ : la somme des ' +
                '6 termes doit redonner $(2-1)^5=1$, et $32-80+80-40+10-1=1$ ✓.',
            },
          ],
        },
        { kind: 'subheading', text: 'Le triangle de Pascal' },
        {
          kind: 'definition',
          label: 'Relation de Pascal, symétrie, somme de ligne',
          items: [
            '$C_n^k = C_{n-1}^{k-1}+C_{n-1}^k$ (pour $1 \\leq k \\leq n-1$) ; $C_n^k=C_n^{n-k}$ ; ' +
              '$\\displaystyle\\sum_{k=0}^{n} C_n^k=2^n$.',
            'Chaque coefficient est la **somme** des deux coefficients juste au-dessus ' +
              '(relation de Pascal) ; chaque ligne est **symétrique** ; la somme d\'une ligne ' +
              'entière double à chaque ligne suivante.',
          ],
        },
        {
          kind: 'para',
          text:
            'Au § 3, $k$ numérote les termes : $C_n^k$ est le nombre de façons de choisir $k$ ' +
            'éléments parmi $n$, et le coefficient du terme de rang $k+1$ du binôme.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — relation de Pascal, par dénombrement',
          blocks: [
            {
              kind: 'para',
              text:
                '$C_n^k$ compte les groupes de $k$ éléments choisis parmi $n$. Fixe un élément ' +
                'précis, disons le dernier — **on sépare les groupes en deux cas**.',
            },
            {
              kind: 'para',
              text:
                'Les groupes qui **contiennent** cet élément : il reste $k-1$ éléments à choisir ' +
                'parmi les $n-1$ autres, soit $C_{n-1}^{k-1}$ groupes. Ceux qui **ne le contiennent ' +
                'pas** : les $k$ éléments sont choisis parmi les $n-1$ autres, soit $C_{n-1}^k$ ' +
                'groupes — **définition de la combinaison, dans chaque cas**.',
            },
            {
              kind: 'para',
              text:
                'Chaque groupe est dans un cas et un seul : $C_n^k = C_{n-1}^{k-1} + C_{n-1}^k$ — ' +
                '**cas disjoints qui couvrent tout : on additionne**. (Il faut $1 \\leq k \\leq n-1$ ' +
                'pour que les deux combinaisons existent.)',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — relation de Pascal, par le calcul',
          blocks: [
            {
              kind: 'para',
              text:
                '$C_{n-1}^{k-1}+C_{n-1}^k = \\dfrac{(n-1)!}{(k-1)!(n-k)!}$ ' +
                '$+ \\dfrac{(n-1)!}{k!(n-1-k)!}$ — **définition de** $C_n^k$**, appliquée à** $n-1$.',
            },
            {
              kind: 'para',
              text:
                '$= \\dfrac{(n-1)! \\times k}{k!(n-k)!} + \\dfrac{(n-1)! \\times (n-k)}{k!(n-k)!}$ ' +
                '— **même dénominateur** $k!(n-k)!$ **aux 2 termes**.',
            },
            {
              kind: 'para',
              text:
                '$= \\dfrac{(n-1) ! \\times (k+n-k)}{k!(n-k)!}$ $= \\dfrac{(n-1)! \\times n}{k!(n-k)!}$ ' +
                '$= \\dfrac{n!}{k!(n-k)!}$ — **factorisation, puis** $(n-1)! \\times n = n!$.',
            },
            {
              kind: 'para',
              text:
                "Le dernier membre est exactement $C_n^k$ — la relation de Pascal n'est donc " +
                'jamais une simple observation numérique sur le triangle, mais une IDENTITÉ ' +
                'algébrique démontrée pour tout $n \\geq 2$ et tout $k$ de 1 à $n-1$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Retour au § 1 — le « + p − 1 » de Γ₅³ retrouvé par la relation de Pascal',
          blocks: [
            {
              kind: 'para',
              text:
                'Au § 1, les groupes de 3 lettres parmi 5 avec répétition se comptaient par ' +
                '$C_5^3 + 2 \\times C_5^2 + C_5^1$. Applique la relation de Pascal deux fois : ' +
                '$C_5^3+C_5^2 = C_6^3$ et $C_5^2+C_5^1 = C_6^2$.',
            },
            {
              kind: 'para',
              text:
                'En regroupant : $C_5^3+2 \\times C_5^2+C_5^1 = C_6^3+C_6^2$, puis, par Pascal une ' +
                '3e fois, $C_6^3+C_6^2=C_7^3 = C_{5+3-1}^3$.',
            },
            {
              kind: 'para',
              text:
                'On retrouve $\\Gamma_5^3 = C_7^3 = 35$ : une vérification sur cet exemple, la ' +
                'démonstration générale étant celle des étoiles et des barres (§ 1).',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'pascalTriangle',
            rowCount: 6,
            pascalRelation: { row: 5, index: 2 },
            caption:
              'Triangle de Pascal, lignes $n=0$ à 5 : $C_5^2=10$ (en couleur) est la somme de ' +
              '$C_4^1=4$ et $C_4^2=6$ juste au-dessus.',
          },
        },
        {
          kind: 'featureTable',
          headers: ['n', 'k=0', 'k=1', 'k=2', 'k=3', 'k=4', 'k=5', 'Somme'],
          rows: [
            ['0', '1', '', '', '', '', '', '1'],
            ['1', '1', '1', '', '', '', '', '2'],
            ['2', '1', '2', '1', '', '', '', '4'],
            ['3', '1', '3', '3', '1', '', '', '8'],
            ['4', '1', '4', '6', '4', '1', '', '16'],
            ['5', '1', '5', '10', '10', '5', '1', '32'],
          ],
        },
        {
          kind: 'historique',
          titre: 'Un triangle vieux de plusieurs siècles avant Pascal',
          text:
            "Malgré son nom, le triangle que tu viens de voir n'a pas été découvert par " +
            '**Blaise Pascal**. Vers l\'an 1000, le Persan **al-Karaji** s\'en sert déjà pour ' +
            'développer les puissances d\'un binôme. En Chine, **Yang Hui** le décrit en 1261 en ' +
            'l\'attribuant à **Jia Xian** (vers 1050), et **Zhu Shijie** le reproduit en 1303. ' +
            'En Europe, il circule bien avant Pascal : chez Apianus (1527), Stifel (1544) et ' +
            '**Tartaglia** (1556) — en Italie, on l\'appelle encore « triangle de Tartaglia ». ' +
            'Ce que Pascal apporte, dans son « Traité du triangle arithmétique » (écrit en ' +
            '1654, publié en 1665), c\'est une étude systématique de ses propriétés, avec des ' +
            'démonstrations proches de la récurrence, et son lien avec les probabilités (le ' +
            '« problème des partis »). Un même objet, redécouvert par des civilisations qui ' +
            'n\'avaient souvent aucun contact entre elles.',
          image: {
            src: '/images/historique/yanghui-triangle.gif',
            alt: 'Le triangle arithmétique écrit en chiffres chinois traditionnels',
            caption:
              'Le triangle tel que le reproduit Zhu Shijie en 1303 (méthode déjà décrite par ' +
              'Yang Hui en 1261) — la même relation d\'addition que le « triangle de Pascal ».',
          },
        },
        {
          kind: 'exemple',
          badge: 'les trois propriétés sur la ligne n = 5',
          formula:
            'Sur la ligne $n=5$ du triangle de Pascal, retrouve $C_5^2$ à partir de la ligne 4, ' +
            'donne l\'autre coefficient de la ligne qui lui est égal, puis vérifie la somme de la ligne.',
          steps: [
            { tag: 'relation de Pascal', text: '$C_5^2=C_4^1+C_4^2=4+6=10$' },
            { tag: 'symétrie', text: '$C_5^2=C_5^{5-2}=C_5^3=10$' },
            { tag: 'somme de ligne', text: '$1+5+10+10+5+1=32=2^5$' },
          ],
          result: { tag: 'conclusion', text: '$C_5^2 = C_5^3 = 10$, et la ligne 5 somme bien à $2^5 = 32$.' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — mauvais partenaire de symétrie',
          text:
            '$C_5^2=C_5^4$ est **faux** ($C_5^4=5$, pas 10) ! Le bon partenaire de symétrie de ' +
            "$C_5^2$ est $C_5^{5-2}=C_5^3$, jamais $C_5^4$ obtenu en changeant l'indice au hasard.",
        },
        {
          kind: 'atelier',
          tag: 'pascal-vivant-widget',
          label: 'Manipule toi-même : le triangle de Pascal vivant',
          caption:
            "Fais grandir le triangle jusqu'à la ligne 15 et touche une case : ses deux " +
            'parents (relation de Pascal), sa case symétrique et la somme de sa ligne, 2ⁿ, ' +
            "s'affichent. Colorie les impairs pour voir apparaître le triangle de " +
            'Sierpiński, ou affiche le développement de (a + b)ⁿ qui utilise la ligne ' +
            'choisie.',
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — la somme d'une ligne vaut 2ⁿ, par le binôme",
          blocks: [
            {
              kind: 'para',
              text:
                '$(a+b)^n = \\displaystyle\\sum_{k=0}^{n} C_n^ka^{n-k}b^k$ — **formule du binôme, cas général**.',
            },
            { kind: 'para', text: 'On pose $a=b=1$ — **substitution particulière**.' },
            {
              kind: 'para',
              text:
                '$(1+1)^n = \\displaystyle\\sum_{k=0}^{n} C_n^k \\times 1 \\times 1$ — **1 élevé ' +
                'à toute puissance vaut 1**.',
            },
            {
              kind: 'para',
              text:
                'Le membre de gauche devient $2^n$, le membre de droite devient exactement la ' +
                "somme des coefficients de la ligne $n$ — d'où $C_n^0+C_n^1+\\ldots+C_n^n=2^n$.",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — un ensemble à n éléments a 2ⁿ parties',
          blocks: [
            {
              kind: 'para',
              text:
                'Une partie (un sous-ensemble) d\'un ensemble $E$ à $n$ éléments est décrite en ' +
                'répondant, pour chaque élément, à la question « est-il dans la partie ? » — **oui ou ' +
                'non, 2 réponses par élément**.',
            },
            {
              kind: 'para',
              text:
                'Les $n$ réponses sont indépendantes : il y a $2 \\times 2 \\times \\ldots \\times 2 = ' +
                '2^n$ parties — **principe multiplicatif** (vide et $E$ compris).',
            },
            {
              kind: 'para',
              text:
                'En les classant par nombre d\'éléments : $C_n^0$ parties à 0 élément, $C_n^1$ à 1 ' +
                'élément, …, $C_n^n$ à $n$ éléments — **chaque partie est comptée une fois**. Donc ' +
                '$C_n^0 + C_n^1 + \\ldots + C_n^n = 2^n$ : une seconde preuve, par dénombrement. Sans la ' +
                'partie vide (au moins un élément), il en reste $2^n - 1$.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: 'n=0', value: 1 },
              { label: 'n=1', value: 2 },
              { label: 'n=2', value: 4 },
              { label: 'n=3', value: 8 },
              { label: 'n=4', value: 16 },
              { label: 'n=5', value: 32 },
            ],
            maxValue: 32,
            xAxisLabel: 'ligne n',
            yAxisLabel: 'somme = 2ⁿ',
            caption:
              'Somme de chaque ligne du triangle de Pascal, $n=0$ à 5 : 1, 2, 4, 8, 16, 32 — elle ' +
              'double à chaque ligne suivante, exactement $2^n$.',
          },
        },
        { kind: 'subheading', text: 'Chemins dans un quadrillage' },
        {
          kind: 'methode',
          items: [
            'Un chemin qui va d\'un coin à l\'autre d\'un quadrillage de $m$ cases sur $n$, en ' +
              'n\'avançant que vers la droite (D) ou vers le haut (H), est un mot de $m+n$ lettres ' +
              'qui contient $m$ fois D et $n$ fois H : il suffit de choisir les places des H, soit ' +
              '$C_{m+n}^n$ chemins.',
            'Passer par un point P : (chemins jusqu\'à P) × (chemins de P à l\'arrivée). Éviter P : ' +
              'total − chemins par P.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.6,
            xMax: 4.6,
            yMin: -0.6,
            yMax: 4.275,
            showAxes: false,
            grid: true,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2, y: 0 }, tone: 'accent', arrow: false },
              { from: { x: 2, y: 0 }, to: { x: 2, y: 1 }, tone: 'accent', arrow: false },
              { from: { x: 2, y: 1 }, to: { x: 3, y: 1 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: 1 }, to: { x: 3, y: 3 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: 3 }, to: { x: 4, y: 3 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 2, y: 1, label: 'P', tone: 'good', labelPos: 'left' },
              { x: 4, y: 3, label: 'B', tone: 'ink', labelPos: 'above' },
            ],
            caption:
              'Quadrillage de 4 cases sur 3 : le chemin dessiné, DDHDHHD, passe par P. Il y a ' +
              '$C_7^3 = 35$ chemins de A à B, dont $C_3^1 \\times C_4^2 = 18$ par P.',
          },
        },
        {
          kind: 'exemple',
          badge: 'chemins de A à B : tous, par P, en évitant P',
          formula:
            'Sur un quadrillage de 4 cases de large et 3 de haut, on va du coin A(0 ; 0) au coin ' +
            'B(4 ; 3) en avançant d\'une case vers la droite ou vers le haut. Combien de chemins ' +
            'existe-t-il ? Combien passent par P(2 ; 1) ? Combien évitent P ?',
          steps: [
            { tag: 'tous les chemins', text: '7 pas dont 3 vers le haut : $C_7^3 = 35$' },
            {
              tag: 'par P : produit',
              text: 'de A à P, 3 pas dont 1 vers le haut ; de P à B, 4 pas dont 2 vers le haut : $C_3^1 \\times C_4^2 = 3 \\times 6 = 18$',
            },
            { tag: 'en évitant P : complément', text: '$35 - 18 = 17$' },
          ],
          result: { tag: 'conclusion', text: '35 chemins, dont 18 par P et 17 qui évitent P.' },
        },
        {
          kind: 'astuce',
          label: 'Le triangle de Pascal est caché dans le quadrillage',
          text:
            'Écris en chaque nœud le nombre de chemins qui y mènent depuis A : chaque nœud reçoit ' +
            'la somme de son voisin de gauche et de son voisin du dessous (on y arrive par l\'un ou ' +
            'par l\'autre). C\'est exactement la relation de Pascal : le nœud $(i\\,;\\,j)$ porte $C_{i+j}^j$.',
        },
        { kind: 'subheading', text: 'Trouver un terme précis sans tout développer' },
        {
          kind: 'methode',
          items: [
            "Tu cherches le coefficient d'un terme précis (un rang $k$ donné, ou une puissance " +
              'de $x$) ? Pas besoin de développer les $n+1$ termes : calcule directement ' +
              '$T_{k+1}=C_n^k \\times a^{n-k} \\times b^k$ pour ce seul $k$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'terme en x² de (2x − 1)⁵',
          formula: 'Sans tout développer, donne le terme en $x^2$ de $(2x-1)^5$.',
          steps: [
            { tag: 'exposant de x', text: 'dans $T_{k+1}$, l\'exposant de $x$ est $5-k$ : $5-k=2$, soit $k=3$' },
            {
              tag: 'terme de rang 4',
              text: '$T_4 = C_5^3 \\times (2x)^2 \\times (-1)^3$ $= 10 \\times 4x^2 \\times (-1) = -40x^2$',
            },
          ],
          result: { tag: 'conclusion', text: 'Le terme en $x^2$ est $-40x^2$ (coefficient $-40$).' },
        },
        {
          kind: 'piege',
          label: "Piège classique — confondre k avec l'exposant de x",
          text:
            "Associer directement $k=2$ à « l'exposant $x^2$ cherché » est l'erreur classique ! " +
            "L'exposant de $x$ est $5-k$, **pas** $k$. Avec $k=2$ tu obtiendrais en réalité le " +
            'terme en $x^3$ (coefficient 80), pas celui en $x^2$.',
        },
        {
          kind: 'exemple',
          badge: 'terme indépendant de x dans (x² − 2/x)⁶',
          formula:
            'Dans le développement de $\\left(x^2-\\dfrac{2}{x}\\right)^6$, existe-t-il un terme ' +
            'indépendant de $x$ (sans $x$) ? Si oui, que vaut-il ?',
          steps: [
            {
              tag: 'terme général',
              text:
                '$T_{k+1} = C_6^k \\,(x^2)^{6-k} \\left(-\\dfrac{2}{x}\\right)^k$, soit ' +
                '$T_{k+1} = C_6^k \\,(-2)^k\\, x^{12-3k}$ (exposant de $x$ : $2(6-k)-k$)',
            },
            { tag: 'exposant de x nul', text: '$12-3k=0$, donc $k=4$ (entier entre 0 et 6 : il existe)' },
            { tag: 'valeur', text: '$T_5 = C_6^4 \\times (-2)^4 = 15 \\times 16 = 240$' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'Le terme indépendant vaut 240. Avec l\'exposant 5, $10-3k=0$ n\'a pas de solution ' +
              'entière : $\\left(x^2-\\frac{2}{x}\\right)^5$ n\'a pas de terme indépendant.',
          },
        },
        {
          kind: 'piege',
          text:
            'N\'oublie ni le signe ni la puissance du coefficient : $\\left(-\\frac{2}{x}\\right)^k$ ' +
            'apporte $(-2)^k$, pas $-2$, et $x^{-k}$ — l\'exposant de $x$ vaut $2(6-k) - k$, pas $6-k$.',
        },
        { kind: 'subheading', text: 'Approximation via le binôme, pour ε petit' },
        {
          kind: 'methode',
          items: [
            'Pour $\\varepsilon$ petit — plus précisément quand $n\\varepsilon$ est petit —, seul ' +
              'le **premier** terme non trivial du développement ($k=1$) pèse vraiment ; les ' +
              'suivants ($\\varepsilon^2$, $\\varepsilon^3$, …) deviennent vite négligeables : ' +
              '$(1+\\varepsilon)^n \\approx 1+n\\varepsilon$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'valeur approchée de 1,01⁴ sans calculatrice',
          formula: 'Donne, sans calculatrice, une valeur approchée de $1{,}01^4$.',
          steps: [
            {
              tag: 'approximation',
              text: 'avec $\\varepsilon=0{,}01$ et $n=4$ : $(1+0{,}01)^4 \\approx 1+4 \\times 0{,}01 = 1{,}04$',
            },
          ],
          result: { tag: 'résultat', text: 'Une approximation très proche de la valeur exacte $1{,}01^4 \\approx 1{,}0406$.' },
        },
        {
          kind: 'astuce',
          label: '« Négligeable » ne veut jamais dire « nul »',
          text:
            "Le terme suivant, $C_4^2 \\times 0{,}01^2 = 0{,}0006$, n'est **pas** rigoureusement nul " +
            "— juste assez petit pour être ignoré dans une approximation. C'est précisément " +
            'pourquoi 1,04 est une **approximation** (proche) et non la valeur **exacte** ' +
            '(1,0406…) de $1{,}01^4$.',
        },
        {
          kind: 'attention',
          label: 'Quand nε n\'est plus petit, l\'approximation échoue',
          text:
            'Avec $\\varepsilon=0{,}01$ mais $n=100$, $n\\varepsilon = 1$ n\'est plus petit : ' +
            '$1+n\\varepsilon = 2$, alors que $1{,}01^{100} \\approx 2{,}705$. Les termes en ' +
            '$\\varepsilon^2$, $\\varepsilon^3$… ne sont plus négligeables ($C_{100}^2 \\times ' +
            '0{,}01^2 \\approx 0{,}495$ à lui seul).',
        },
        {
          kind: 'atelier',
          tag: 'approximation-binome-widget',
          label: 'Manipule toi-même : (1 + ε)ⁿ ≈ 1 + nε',
          caption:
            "Règle n et ε : la valeur exacte de (1 + ε)ⁿ, l'approximation 1 + nε et l'erreur " +
            "s'affichent, avec les premiers termes du développement. Tant que nε est petit, " +
            'la courbe colle à la droite ; essaie 1,01¹⁰⁰ : 1 + nε = 2, alors que la valeur ' +
            'exacte vaut environ 2,705.',
        },
        {
          kind: 'entrainement',
          title: 'Binôme de Newton',
          generatorId: '6gen45',
          description: [
            "Entraîne-toi sur le développement complet, le terme général, le triangle de " +
              "Pascal, un terme précis sans tout développer, et l'approximation pour ε petit.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 45. Binôme de Newton »',
        },
        {
          kind: 'entrainement',
          title: 'Triangle de Pascal et propriétés',
          generatorId: '6gen102',
          description: [
            "Complète une ligne du triangle, applique la symétrie et la relation de Pascal, compte les parties d'un ensemble (2ⁿ, 2ⁿ − 1…) et juge si une égalité entre coefficients est vraie ou fausse.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 102. Triangle de Pascal et propriétés »',
        },
        {
          kind: 'entrainement',
          title: 'Terme indépendant',
          generatorId: '6gen107',
          description: [
            "Écris l'exposant de x dans le terme général, trouve le rang k qui l'annule (ou conclus qu'il n'y en a pas), puis calcule le terme indépendant.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 107. Terme indépendant »',
        },
      ],
    },

    {
      id: 'denombrementproblemes',
      number: 4,
      title: 'Dénombrement combinatoire pur : problèmes',
      kicker: 'identifier chaque étape, puis MULTIPLIER les étapes indépendantes',
      titreCourt: 'Problèmes de dénombrement',
      partie: 'Le binôme et les problèmes',
      essentiel: [
        'Identifie chaque étape, calcule son nombre de choix, puis **multiplie** les étapes indépendantes.',
        'Pour une probabilité, compte des issues **équiprobables** : avec trois dés, 25 triplets ordonnés donnent 9 et 27 donnent 10.',
      ],
      cartes: [
        { question: 'Combien de mains « carré » de 5 cartes dans un jeu de 32 cartes ?', reponse: '$(8 \\times C_4^4) \\times (7 \\times 4) = 224$.' },
        { question: 'Avec trois dés, combien de triplets ordonnés donnent la somme 9 ? Et 10 ?', reponse: '25 et 27, sur $6^3 = 216$.' },
        { question: 'Combien de réglages pour 3 curseurs à 4 positions chacun ?', reponse: '$4^3 = 64$ (base : les positions ; exposant : les curseurs).' },
      ],
      utilise: [
        { cible: '6e-6h/probabilites#probabilitesensembles', poids: 'utile', rappel: '$P(A)$ mesure la chance que $A$ se réalise : $0 \\leq P(A) \\leq 1$ et $P(\\bar{A})=1-P(A)$. En situation d\'**équiprobabilité** : $P(A) = \\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}$ — toujours à vérifier avant de compter.' },
      ],
      blocks: [
        { kind: 'video', title: 'Dénombrement combinatoire pur : problèmes — mains de poker, sommes de trois dés, réemplois', youtubeId: 'OZA48JH9GUM' },
        {
          kind: 'para',
          text:
            'Les problèmes classiques de dénombrement combinent souvent **plusieurs** des ' +
            'outils déjà vus — principe multiplicatif, multinomiale, répétition — en 2 étapes ' +
            'ou plus. La méthode reste la même : identifie chaque étape, calcule son nombre de ' +
            'choix, puis **multiplie** les étapes indépendantes entre elles.',
        },
        { kind: 'subheading', text: 'Mains de poker — jeu à 32 cartes (8 hauteurs × 4 couleurs)' },
        {
          kind: 'methode',
          label: 'Méthode — 2 étapes : la combinaison spéciale, puis le reste de la main',
          items: [
            'Étape 1 : choisis la ou les hauteurs privilégiées **et** leurs couleurs.',
            "Étape 2 : complète la main avec des cartes de hauteurs **encore disponibles** (les " +
              "hauteurs déjà utilisées à l'étape 1 ne le sont plus).",
          ],
        },
        {
          kind: 'exemple',
          badge: 'mains « carré » : 4 cartes de même hauteur et 1 autre',
          formula:
            'On distribue 5 cartes d\'un jeu de 32 cartes (8 hauteurs, du 7 à l\'as, en 4 couleurs). ' +
            'Combien de mains contiennent un carré, c\'est-à-dire les 4 cartes d\'une même hauteur ?',
          steps: [
            { tag: 'étape 1 : la hauteur du carré', text: '8 hauteurs, et les 4 couleurs sont imposées : $8 \\times C_4^4 = 8$' },
            { tag: 'étape 2 : la 5e carte', text: 'une des 7 autres hauteurs, dans une des 4 couleurs : $7 \\times 4 = 28$' },
          ],
          result: { tag: 'conclusion', text: '$8 \\times 28 = 224$ mains « carré ».' },
        },
        {
          kind: 'exempleLibre',
          label: 'Toutes les mains de poker à 32 cartes, classées par répétition des hauteurs',
          blocks: [
            {
              kind: 'para',
              text:
                'Même méthode pour chaque catégorie : d\'abord les hauteurs répétées et leurs ' +
                'couleurs, puis les cartes seules, de hauteurs encore libres.',
            },
            {
              kind: 'featureTable',
              headers: ['Catégorie', 'Calcul', 'Mains'],
              rows: [
                ['carré', '$(8 \\times C_4^4) \\times (7 \\times 4)$', '$224$'],
                ['full', '$(8 \\times C_4^3) \\times (7 \\times C_4^2)$', '$1344$'],
                ['brelan', '$(8 \\times C_4^3) \\times (C_7^2 \\times 4^2)$', '$10\\,752$'],
                ['deux paires', '$(C_8^2 \\times (C_4^2)^2) \\times (6 \\times 4)$', '$24\\,192$'],
                ['une paire', '$(8 \\times C_4^2) \\times (C_7^3 \\times 4^3)$', '$107\\,520$'],
                ['aucune hauteur répétée', '$C_8^5 \\times 4^5$', '$57\\,344$'],
              ],
            },
            {
              kind: 'para',
              text:
                'Chaque main est dans une catégorie et une seule. Vérification : ' +
                '$224 + 1344 + 10\\,752$ $+\\,24\\,192 + 107\\,520$ $+\\,57\\,344 = 201\\,376$, ' +
                'et $C_{32}^5 = 201\\,376$ : le total de toutes les mains.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège classique — oublier des mains ou en compter deux fois',
          text:
            'Une partition se vérifie toujours par la somme : si les catégories ne redonnent pas ' +
            '$C_{32}^5 = 201\\,376$, une main est oubliée ou comptée deux fois (par exemple un full ' +
            'compté aussi comme brelan). Le classement obtenu est un **constat chiffré** : 224 ' +
            'carrés, 1 344 fulls, 10 752 brelans, 24 192 doubles paires, 107 520 paires — et ' +
            '57 344 mains sans répétition, plus nombreuses que les brelans et les doubles paires réunis.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            orientation: 'horizontal',
            scale: 'log',
            logMin: 2,
            bars: [
              { label: 'Carré', value: 224, valueLabel: '224' },
              { label: 'Full', value: 1344, valueLabel: '1 344' },
              { label: 'Brelan', value: 10752, valueLabel: '10 752' },
              { label: 'Deux paires', value: 24192, valueLabel: '24 192' },
              { label: 'Une paire', value: 107520, valueLabel: '107 520', tone: 'good' },
              { label: 'Sans répétition', value: 57344, valueLabel: '57 344' },
              { label: 'Total C₃₂⁵', value: 201376, valueLabel: '201 376', tone: 'faint' },
            ],
            maxValue: 201376,
            footnote: 'échelle logarithmique',
            caption:
              "Les 6 catégories de mains, à l'échelle logarithmique (les valeurs s'étalent sur 3 " +
              'ordres de grandeur) : 224, 1 344, 10 752, 24 192, 107 520 et 57 344, dont la somme ' +
              'est le total de 201 376 mains possibles.',
          },
        },
        {
          kind: 'atelier',
          tag: 'mains-poker-widget',
          label: 'Manipule toi-même : mains de poker',
          caption:
            'Tire une main de 5 cartes dans le jeu de 32 : elle est classée (carré, full, ' +
            'brelan, deux paires, paire, sans paire) avec le calcul en deux étapes de sa ' +
            'catégorie. Simule ensuite 10 000 mains : les fréquences observées rejoignent ' +
            'les probabilités exactes, et les six effectifs remplissent exactement les 201 ' +
            '376 mains possibles.',
        },
        {
          kind: 'application',
          titre: 'Calculer ses (vraies) chances de gagner au loto',
          image: {
            src: '/images/application/lottery-balls.jpg',
            alt: 'Boules numérotées dans un tambour de loterie',
            caption: 'elizaIO, CC BY-SA 2.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'categoricalBarChart',
              scale: 'log',
              logMin: 3,
              bars: [
                { label: 'foudre (une vie)', value: 15300, valueLabel: '1⁄15 300', tone: 'faint' },
                { label: 'loto (1 grille)', value: 8145060, valueLabel: '1⁄8 145 060', tone: 'accent' },
              ],
              xAxisLabel: 'événement',
              yAxisLabel: '« 1 chance sur... »',
              footnote: 'échelle logarithmique',
              caption: 'Gagner au loto avec une seule grille ($C_{45}^6 \\approx$ 8,1 millions) est environ 530 fois moins probable qu\'être frappé par la foudre au cours d\'une vie (environ 1 chance sur 15 300).',
            },
          ],
          text:
            'Comme pour les mains de poker ci-dessus, gagner à un loto où tu coches 6 numéros ' +
            'parmi 45 revient à choisir une **combinaison** précise parmi toutes celles possibles ' +
            "— l'ordre dans lequel les numéros sortent ne compte pas. Le nombre total de " +
            'grilles possibles est $C_{45}^6$, soit plus de 8 millions ; une seule d\'entre ' +
            'elles rapporte le gros lot. Ta probabilité de gagner avec une seule grille est ' +
            'donc $1/C_{45}^6$ — un nombre si petit qu\'il est souvent plus parlant de ' +
            'l\'exprimer en comparaison (par exemple, la probabilité d\'être frappé par la ' +
            'foudre au cours d\'une vie, environ 1 sur 15 300 : le loto est environ 530 fois ' +
            'moins probable). C\'est exactement ce calcul de dénombrement, et pas une ' +
            '« intuition » sur la chance, qui permet aux organismes de loterie de fixer un ' +
            'gain cohérent avec les mises totales.',
          domaines: ['Jeux', 'Statistiques'],
        },
        { kind: 'subheading', text: 'Le problème des trois dés de Galilée (vers 1620)' },
        {
          kind: 'definition',
          label: "L'énigme historique",
          items: [
            'Avec 3 dés à 6 faces, les sommes 9 et 10 admettent chacune exactement 6 ' +
              '**décompositions** non ordonnées (partitions en 3 valeurs de 1 à 6) — les joueurs ' +
              "florentins en concluaient qu'elles devaient être également probables, alors que " +
              "l'expérience montrait le contraire. Galilée résout l'énigme en comptant les " +
              '**triplets ordonnés** plutôt que les ' +
              'partitions : un triplet aux 3 valeurs différentes offre $3!=6$ arrangements ' +
              "ordonnés, un triplet avec une paire de valeurs identiques n'en offre que 3, et " +
              "un triplet aux 3 valeurs identiques n'en offre qu'1 seul.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà',
          text:
            'Ce problème se pose aussi en probabilités ([[6e-6h/probabilites#probabilitesensembles]]) : avec 3 dés ' +
            'équilibrés, les 216 triplets ordonnés sont équiprobables, et $P(\\text{somme}=9) = ' +
            '\\frac{25}{216}$ contre $P(\\text{somme}=10) = \\frac{27}{216}$. Ici, on refait le ' +
            'comptage avec les outils du chapitre : combien d\'ordres pour chaque décomposition ?',
        },
        {
          kind: 'featureTable',
          headers: ['Partition (somme = 9)', 'Arrangements', 'Partition (somme = 10)', 'Arrangements'],
          rows: [
            ['{1;2;6}', '6', '{1;3;6}', '6'],
            ['{1;3;5}', '6', '{1;4;5}', '6'],
            ['{1;4;4}', '3', '{2;2;6}', '3'],
            ['{2;2;5}', '3', '{2;3;5}', '6'],
            ['{2;3;4}', '6', '{2;4;4}', '3'],
            ['{3;3;3}', '1', '{3;3;4}', '3'],
            ['Total', '25', 'Total', '27'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'somme 9 ou somme 10 avec trois dés',
          formula:
            'On lance trois dés. Les sommes 9 et 10 s\'écrivent chacune de 6 façons sans tenir ' +
            'compte de l\'ordre. Laquelle des deux sommes a le plus de chances de sortir ?',
          steps: [
            {
              tag: 'issues équiprobables',
              text: 'les triplets ordonnés (1er, 2e, 3e dé) : $6^3 = 216$, tous de même probabilité',
            },
            {
              tag: 'ordres par décomposition',
              text: '3 valeurs différentes : $3! = 6$ ; une paire : 3 ; trois valeurs égales : 1',
            },
            {
              tag: 'totaux',
              text: 'somme 9 : $6+6+3+3+6+1 = 25$ ; somme 10 : $6+6+3+6+3+3 = 27$',
            },
          ],
          result: {
            tag: 'résultat',
            text:
              '25 triplets ordonnés pour la somme 9, contre 27 pour la somme 10 : obtenir 10 avec ' +
              "3 dés est donc **légèrement** plus probable qu'obtenir 9 — un écart invisible si l'on " +
              'ne compte que les 6 partitions de chaque somme, révélé seulement en comptant les ' +
              'arrangements **ordonnés**.',
          },
        },
        {
          kind: 'piege',
          text:
            "Un triplet aux valeurs toutes identiques comme {3;3;3} n'admet qu'**un seul** " +
            'arrangement ordonné ($3!/3!=1$), jamais 6 comme un triplet aux 3 valeurs distinctes ' +
            "! Permuter des dés qui affichent tous la même valeur ne change rien à l'issue observée.",
        },
        {
          kind: 'astuce',
          label: 'Une symétrie pour vérifier',
          text:
            'Remplacer chaque face $v$ par $7-v$ (la face opposée) transforme un triplet de somme ' +
            '$s$ en un triplet de somme $21-s$, et inversement : les sommes $s$ et $21-s$ ont ' +
            'toujours le même nombre de triplets ordonnés. Ainsi 10 et 11 en ont 27 chacune, 9 et ' +
            '12 en ont 25 chacune.',
        },
        {
          kind: 'historique',
          titre: 'Galilée et les joueurs florentins',
          text:
            'Vers 1620, des joueurs de Florence s\'étonnent : la somme 10 sort plus souvent que la ' +
            'somme 9 avec trois dés, alors que chacune s\'écrit de 6 façons. **Galilée**, ' +
            'mathématicien de la cour de Toscane, répond dans un court texte, « Sur les ' +
            'découvertes faites aux dés ». Il dresse la liste des 216 issues ordonnées et montre ' +
            'que la somme 10 en totalise 27 contre 25 pour la somme 9 : un écart minuscule, que ' +
            'seuls des joueurs très assidus avaient pu remarquer. C\'est l\'un des premiers ' +
            'calculs de probabilités fondés sur un dénombrement d\'issues équiprobables, une ' +
            'trentaine d\'années avant la correspondance de Pascal et de Fermat (1654).',
          image: {
            src: '/images/historique/galilee.jpg',
            alt: 'Portrait de Galilée',
            caption: 'Galilée (1564–1642), portrait par Justus Sustermans, 1636.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: 'Somme = 9', value: 25, valueLabel: '25' },
              { label: 'Somme = 10', value: 27, valueLabel: '27', tone: 'good' },
            ],
            maxValue: 30,
            colorValueLabels: true,
            yAxisLabel: 'triplets ordonnés',
            caption:
              '25 triplets ordonnés donnent la somme 9, contre 27 pour la somme 10 : malgré 6 ' +
              'partitions de chaque côté, la somme 10 reste légèrement plus probable.',
          },
        },
        { kind: 'subheading', text: 'Autres réemplois — multinomiale et répétition' },
        {
          kind: 'exemple',
          badge: '12 objets dans 3 boîtes numérotées de 6, 4 et 2 places',
          formula:
            'On range 12 objets différents dans 3 boîtes numérotées qui contiennent exactement 6, 4 ' +
            'et 2 objets. Combien de rangements sont possibles ?',
          steps: [
            { tag: 'groupes nommés de tailles fixées', text: 'même principe que des personnes réparties en groupes : la multinomiale' },
            { tag: 'calcul', text: '$\\dfrac{12!}{6! \\times 4! \\times 2!}$ $= C_{12}^6 \\times C_6^4 \\times C_2^2$ $= 924 \\times 15 \\times 1 = 13\\,860$' },
          ],
          result: { tag: 'conclusion', text: '13 860 rangements.' },
        },
        {
          kind: 'exemple',
          badge: '3 curseurs réglables sur 4 positions',
          formula:
            'Une table de mixage a 3 curseurs, chacun réglable sur 4 positions. Combien de réglages ' +
            'sont possibles ? Et si les 3 curseurs doivent être sur des positions toutes différentes ?',
          steps: [
            {
              tag: 'répétition autorisée',
              text: 'chaque curseur garde ses 4 positions : $4^3=64$ réglages (base : les positions, exposant : les curseurs)',
            },
            {
              tag: 'positions toutes différentes',
              text: '$A_4^3=4 \\times 3 \\times 2=24$ réglages',
            },
          ],
          result: { tag: 'conclusion', text: '64 réglages en tout, dont 24 avec des positions toutes différentes.' },
        },
        {
          kind: 'piege',
          text:
            "$3^4=81$ — inverser base et exposant — n'a rien à voir avec $4^3=64$ ! C'est " +
            'toujours le nombre de **positions** qui sert de base, et le nombre ' +
            "d'**éléments** qui sert d'exposant, jamais l'inverse.",
        },
        {
          kind: 'entrainement',
          title: 'Dénombrement combinatoire pur — problèmes',
          generatorId: '6gen46',
          description: [
            'Entraîne-toi sur les mains de poker à 32 cartes, le problème des trois dés de ' +
              'Galilée, les répartitions en groupes et les dispositifs à répétition.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 46. Dénombrement combinatoire pur — problèmes »',
        },
        {
          kind: 'entrainement',
          title: 'Chemins dans un quadrillage',
          generatorId: '6gen106',
          description: [
            'Compte les chemins les plus courts sur un quadrillage : de A à B, en passant par un point, ou en évitant un point fermé.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 106. Chemins dans un quadrillage »',
        },
      ],
    },

    {
      id: 'probabilitehypergeometrique',
      number: 5,
      title: 'Probabilité hypergéométrique et séquence exacte (tirage sans remise)',
      kicker: 'succès parmi les succès × échecs parmi les échecs ÷ tous les tirages — SANS remise',
      titreCourt: 'Tirages sans remise',
      partie: 'Des comptages aux probabilités',
      essentiel: [
        '$P(k) = \\dfrac{C_K^k \\times C_{N-K}^{n-k}}{C_N^n}$ pour un tirage **sans remise** ; le dénominateur est toujours $C_N^n$.',
        'Une séquence précise se calcule par un produit de fractions ; la composition regroupe toutes les séquences qui y mènent.',
      ],
      cartes: [
        { question: 'Lot de 20 pièces dont 6 défectueuses ; on en prélève 5 sans remise. $P$(exactement 2 défectueuses) ?', reponse: '$\\dfrac{C_6^2 \\times C_{14}^3}{C_{20}^5} = \\dfrac{5460}{15\\,504} \\approx 0{,}352$.' },
        { question: 'Urne à 5 rouges et 5 bleues, 3 tirages sans remise : $P$(R, R, B dans cet ordre) ? Et $P$(2 R et 1 B) ?', reponse: '$\\dfrac{5}{36}$, puis $3 \\times \\dfrac{5}{36} = \\dfrac{5}{12}$.' },
        { question: 'Probabilité de deviner l\'ordre exact de 4 lettres tirées sans remise parmi 9 ?', reponse: '$\\dfrac{1}{A_9^4} = \\dfrac{1}{3\\,024}$.' },
      ],
      utilise: [
        { cible: '6e-6h/probabilites#probabilitesensembles', poids: 'indispensable', rappel: '$P(A)$ mesure la chance que $A$ se réalise : $0 \\leq P(A) \\leq 1$ et $P(\\bar{A})=1-P(A)$. En situation d\'**équiprobabilité** : $P(A) = \\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}$ — toujours à vérifier avant de compter.' },
      ],
      blocks: [
        { kind: 'video', title: 'Probabilité hypergéométrique (tirage sans remise)', youtubeId: 'Kd667QJndTc' },
        {
          kind: 'definition',
          label: 'Définition — loi hypergéométrique',
          items: [
            "Une population de $N$ éléments, dont $K$ sont des « succès ». Tu en tires $n$ " +
              '**sans remise** (la composition change à chaque tirage). La probabilité ' +
              "d'obtenir exactement $k$ succès est " +
              '$P(k) = \\dfrac{C_K^k \\times C_{N-K}^{n-k}}{C_N^n}$.',
            'Au numérateur : les succès **choisis** parmi les succès ($C_K^k$) × les échecs ' +
              'choisis parmi les échecs ($C_{N-K}^{n-k}$). Au dénominateur : **tous** les ' +
              'tirages de $n$ éléments possibles, $C_N^n$ — jamais $C_N^k$.',
            'Si $k > K$ (plus de succès demandés qu\'il n\'y en a) ou $n-k > N-K$ (plus d\'échecs ' +
              'que d\'échecs disponibles), le numérateur est nul : $C_K^k = 0$ dès que $k > K$, ' +
              'et $P(k) = 0$ — l\'événement est impossible.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la formule de la loi hypergéométrique',
          blocks: [
            {
              kind: 'para',
              text:
                'Tirer $n$ éléments sans remise, sans tenir compte de l\'ordre, c\'est choisir une ' +
                'partie à $n$ éléments parmi $N$ : $C_N^n$ tirages possibles, tous équiprobables — ' +
                '**combinaison ; on peut ignorer l\'ordre, qui n\'intervient ni dans l\'événement ni ' +
                'dans les cas possibles**.',
            },
            {
              kind: 'para',
              text:
                'Un tirage favorable contient $k$ succès choisis parmi les $K$ succès ($C_K^k$ ' +
                'façons) **et** $n-k$ échecs choisis parmi les $N-K$ échecs ($C_{N-K}^{n-k}$ façons), ' +
                'soit $C_K^k \\times C_{N-K}^{n-k}$ tirages favorables — **principe multiplicatif**.',
            },
            {
              kind: 'para',
              text:
                'Les cas étant équiprobables, $P(k) = \\dfrac{\\text{cas favorables}}{\\text{cas possibles}} ' +
                '= \\dfrac{C_K^k \\times C_{N-K}^{n-k}}{C_N^n}$ — **définition de la probabilité ' +
                'd\'un événement** ([[6e-6h/probabilites#probabilitesensembles]]).',
            },
          ],
        },
        { kind: 'subheading', text: 'Calculer une probabilité hypergéométrique' },
        {
          kind: 'exemple',
          badge: 'contrôle de 5 pièces dans un lot de 20 dont 6 défectueuses',
          formula:
            'Un lot de 20 pièces contient 6 pièces défectueuses. Un contrôleur prélève 5 pièces au ' +
            'hasard, sans remise. Quelle est la probabilité qu\'exactement 2 des 5 pièces soient ' +
            'défectueuses ?',
          steps: [
            { tag: 'paramètres', text: '$N=20$ pièces, $K=6$ défectueuses (les « succès »), $n=5$ prélevées, $k=2$' },
            {
              tag: 'formule',
              text: '$P(2) = \\dfrac{C_6^2 \\times C_{14}^3}{C_{20}^5}$ $= \\dfrac{15 \\times 364}{15\\,504} = \\dfrac{5460}{15\\,504}$',
            },
          ],
          result: { tag: 'conclusion', text: '$P(2) = \\dfrac{5460}{15\\,504} \\approx 0{,}352$.' },
        },
        {
          kind: 'featureTable',
          headers: ['k', 'C₆ᵏ', 'C₁₄⁵⁻ᵏ', 'P(k)'],
          rows: [
            ['0', '1', '2002', '0,1291'],
            ['1', '6', '1001', '0,3874'],
            ['2', '15', '364', '0,3522'],
            ['3', '20', '91', '0,1174'],
            ['4', '15', '14', '0,0135'],
            ['5', '6', '1', '0,0004'],
          ],
        },
        {
          kind: 'para',
          text:
            'Les 6 valeurs ($k=0$ à 5) couvrent tous les cas possibles ; la somme **exacte** ' +
            'des 6 fractions vaut $\\dfrac{15\\,504}{15\\,504}=1$. Ici, les arrondis à 4 décimales ' +
            'donnent aussi $0{,}1291+0{,}3874+0{,}3522$ $+\\,0{,}1174+0{,}0135+0{,}0004=1{,}0000$ ; en ' +
            "général, la somme d'arrondis peut s'écarter de 1 d'une unité au dernier chiffre, " +
            "sans que ce soit le signe d'une erreur.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: 'k=0', value: 0.1291, valueLabel: '0,1291' },
              { label: 'k=1', value: 0.3874, valueLabel: '0,3874', tone: 'good' },
              { label: 'k=2', value: 0.3522, valueLabel: '0,3522' },
              { label: 'k=3', value: 0.1174, valueLabel: '0,1174' },
              { label: 'k=4', value: 0.0135, valueLabel: '0,0135' },
              { label: 'k=5', value: 0.0004, valueLabel: '0,0004' },
            ],
            maxValue: 0.4,
            xAxisLabel: 'k (nombre de succès)',
            yAxisLabel: 'P(k)',
            caption:
              'Distribution de $P(k)$ pour $N=20$, $K=6$, $n=5$ : maximum en $k=1$ ($0{,}3874$), ' +
              'juste devant $k=2$ ($0{,}3522$) — les 6 valeurs somment à 1.',
          },
        },
        {
          kind: 'piege',
          text:
            "Remplacer $C_N^n$ par $C_N^k$ au dénominateur est le piège le plus fréquent de " +
            'cette formule ! Le dénominateur compte **toujours** le nombre total de tirages de ' +
            '$n$ éléments, quel que soit $k$.',
        },
        { kind: 'subheading', text: 'Séquence exacte vs composition — deux questions différentes' },
        {
          kind: 'methode',
          items: [
            "La probabilité d'une **séquence** précise (un ordre de tirage donné à l'avance), " +
              "c'est un produit de fractions décroissantes, position par position — jamais la " +
              'formule hypergéométrique directement.',
            'La probabilité de la **composition** correspondante (mêmes effectifs, ordre ' +
              "libre) regroupe tous les arrangements qui y mènent : c'est elle qui utilise la " +
              'formule hypergéométrique.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'sequenceOutcomes',
            rows: [
              {
                label: 'R–R–B',
                steps: [
                  { label: 'R', prob: '5⁄10', tone: 'accent' },
                  { label: 'R', prob: '4⁄9', tone: 'accent' },
                  { label: 'B', prob: '5⁄8', tone: 'good' },
                ],
                resultLabel: '= 5⁄36',
              },
              {
                label: 'R–B–R',
                steps: [
                  { label: 'R', prob: '5⁄10', tone: 'accent' },
                  { label: 'B', prob: '5⁄9', tone: 'good' },
                  { label: 'R', prob: '4⁄8', tone: 'accent' },
                ],
                resultLabel: '= 5⁄36',
              },
              {
                label: 'B–R–R',
                steps: [
                  { label: 'B', prob: '5⁄10', tone: 'good' },
                  { label: 'R', prob: '5⁄9', tone: 'accent' },
                  { label: 'R', prob: '4⁄8', tone: 'accent' },
                ],
                resultLabel: '= 5⁄36',
              },
            ],
            bracketLabel: ['3 séquences', 'équiprobables'],
            footer: 'ordre libre : 3 × 5⁄36 = 5⁄12',
            caption:
              'Urne à 5 rouges / 5 bleues, 3 tirages sans remise : les 3 séquences menant à ' +
              '« 2 rouges, 1 bleue » ont chacune la même probabilité $\\frac{5}{36}$ ; leur somme ' +
              'donne la composition, $\\frac{5}{12}$.',
          },
        },
        {
          kind: 'exemple',
          badge: 'urne à 5 rouges et 5 bleues : séquence RRB ou composition',
          formula:
            'Une urne contient 5 boules rouges et 5 boules bleues. On tire 3 boules, l\'une après ' +
            'l\'autre, sans remise. Quelle est la probabilité d\'obtenir rouge, rouge, bleue dans cet ' +
            'ordre ? Et celle d\'obtenir 2 rouges et 1 bleue, dans n\'importe quel ordre ?',
          steps: [
            {
              tag: 'séquence R, R, B (cet ordre)',
              text: '$\\dfrac{5}{10} \\times \\dfrac{4}{9} \\times \\dfrac{5}{8} = \\dfrac{5}{36} \\approx 0{,}139$',
            },
            {
              tag: 'composition : 3 séquences équiprobables (RRB, RBR, BRR)',
              text: '$3 \\times \\dfrac{5}{36} = \\dfrac{5}{12}$',
            },
            {
              tag: 'vérification par la formule',
              text: '$\\dfrac{C_5^2 \\times C_5^1}{C_{10}^3} = \\dfrac{10 \\times 5}{120} = \\dfrac{50}{120} = \\dfrac{5}{12}$',
            },
          ],
          result: {
            tag: 'conclusion',
            text: '$\\dfrac{5}{36} \\approx 0{,}139$ pour la séquence précise, $\\dfrac{5}{12} \\approx 0{,}417$ pour la composition.',
          },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — composition = nombre d'ordres × probabilité d'une séquence",
          blocks: [
            {
              kind: 'para',
              text:
                "Chaque ordre précis d'une même composition a la **même** probabilité — " +
                "**produit indépendant de l'ordre**.",
            },
            {
              kind: 'para',
              text:
                "Nombre d'ordres distincts pour « 2 R + 1 B » : $C_3^2=3$ — **choix des 2 positions des " +
                'rouges parmi les 3 tirages** (ce qui revient à choisir la position de la bleue : $C_3^1 = 3$).',
            },
            {
              kind: 'para',
              text:
                'La composition additionne 3 probabilités toutes ÉGALES à $\\frac{5}{36}$ : ' +
                "d'où $3 \\times \\frac{5}{36}=\\frac{5}{12}$, exactement la valeur retrouvée par " +
                'la formule hypergéométrique.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            "Confondre la probabilité d'une séquence précise ($\\frac{5}{36}$) avec celle de " +
            'la composition correspondante ($\\frac{5}{12}$), ce sont deux questions ' +
            '**différentes** ! La composition regroupe toujours **plusieurs** séquences ' +
            'équiprobables, sa probabilité est donc toujours **plus grande** (ou égale, si une ' +
            "seule séquence y mène) que celle d'une séquence isolée.",
        },
        { kind: 'subheading', text: 'Séquence exacte, sans remise, éléments distincts' },
        {
          kind: 'definition',
          label: 'Définition — séquence exacte sans remise',
          items: [
            '$n$ éléments **tous distincts** : tu en tires $p$ successivement, **sans ' +
              'remise**, et tu veux obtenir un **ordre précis** donné à l\'avance. À chaque étape, ' +
              'un seul élément parmi ceux qui restent convient : ' +
              '$\\dfrac{1}{n} \\times \\dfrac{1}{n-1} \\times \\ldots \\times \\dfrac{1}{n-p+1} = \\dfrac{1}{A_n^p}$.',
            'Le dénominateur est exactement le nombre d\'arrangements du § 1 : parmi les $A_n^p$ ' +
              'séquences ordonnées possibles, toutes équiprobables, une seule convient.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deviner l\'ordre exact de 4 lettres parmi 9',
          formula:
            'Neuf jetons portent les lettres A, B, C, D, E, F, G, H et I. On en tire 4, l\'un ' +
            'après l\'autre, sans remise. Quelle est la probabilité d\'obtenir exactement B, A, ' +
            'C, H, dans cet ordre ? Et si l\'on doit deviner une 5e lettre en plus ?',
          steps: [
            {
              tag: '4 lettres dans l\'ordre',
              text:
                '$\\dfrac{1}{9} \\times \\dfrac{1}{8} \\times \\dfrac{1}{7} \\times \\dfrac{1}{6} = ' +
                '\\dfrac{1}{3\\,024} = \\dfrac{1}{A_9^4}$',
            },
            {
              tag: 'une 5e lettre',
              text: '$\\dfrac{1}{3\\,024} \\times \\dfrac{1}{5} = \\dfrac{1}{15\\,120}$',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              '$\\dfrac{1}{3\\,024}$ pour 4 lettres, $\\dfrac{1}{15\\,120}$ pour 5 : chaque lettre de ' +
              'plus à deviner fait baisser la probabilité.',
          },
        },
        {
          kind: 'piege',
          text:
            'Utiliser $\\frac{1}{n^p}$ (probabilité constante à chaque tirage, comme avec ' +
            "remise) au lieu du produit décroissant est l'erreur classique ! Sans remise, le " +
            "nombre d'éléments restants **diminue** à chaque tirage (9, 8, 7, 6, …) : la " +
            'probabilité de deviner juste change donc à chaque étape.',
        },
        {
          kind: 'astuce',
          label: 'Avec ou sans remise : deux modèles différents',
          text:
            'Avec remise, chaque tirage est **indépendant** des précédents, à probabilité ' +
            'constante (c\'est le cadre de la loi binomiale, § 6) ; sans remise, chaque tirage ' +
            'modifie les probabilités suivantes. Augmenter $p$ diminue **toujours** la ' +
            "probabilité d'une séquence exacte sans remise : un choix exact de plus à deviner.",
        },
        { kind: 'subheading', text: '2 tirages hypergéométriques indépendants — loto + bonus' },
        {
          kind: 'exemple',
          badge: 'petit loto et numéro bonus',
          formula:
            'Dans un petit loto, l\'organisateur tire 4 numéros gagnants parmi 10. Tu coches 2 ' +
            'numéros : tu gagnes la grille si tes 2 numéros sont parmi les 4 gagnants. ' +
            'Indépendamment, un numéro bonus est tiré parmi 5 ; tu en coches 1. Quelle est la ' +
            'probabilité de gagner la grille **et** le bonus ?',
          steps: [
            {
              tag: 'grille : N = 10, K = 4 gagnants, n = 2 cochés, k = 2',
              text: '$\\dfrac{C_4^2 \\times C_6^0}{C_{10}^2} = \\dfrac{6}{45} = \\dfrac{2}{15}$',
            },
            { tag: 'bonus : 1 bon numéro parmi 5', text: '$\\dfrac{1}{5}$' },
            {
              tag: 'les deux (ET de tirages indépendants)',
              text: '$\\dfrac{2}{15} \\times \\dfrac{1}{5} = \\dfrac{2}{75}$',
            },
          ],
          result: { tag: 'conclusion', text: '$P = \\dfrac{2}{75} \\approx 0{,}027$.' },
        },
        {
          kind: 'piege',
          text:
            '**Additionner** $\\frac{2}{15}+\\frac{1}{5}=\\frac{1}{3}$ pour un ET entre 2 ' +
            'tirages indépendants est faux ! Un ET entre indépendants se **multiplie** ' +
            'toujours. Ajouter une condition supplémentaire (réussir le bonus en plus de la ' +
            'grille) ne peut jamais augmenter la probabilité : $\\frac{2}{75}$ est bien plus ' +
            'petit que $\\frac{2}{15}$ seul.',
        },
        {
          kind: 'astuce',
          label: 'Hypergéométrique (sans remise) contre binomiale (indépendant)',
          text:
            'La loi hypergéométrique modélise un tirage **sans remise** (chaque tirage modifie ' +
            'la composition restante, donc influence le suivant). La loi binomiale, vue dans ' +
            'la section suivante, suppose au contraire des épreuves **indépendantes** à ' +
            'probabilité constante — typiquement avec remise, ou une population si grande que ' +
            "le prélèvement ne la modifie presque pas. Les deux lois ne coïncident " +
            "qu'**approximativement** lorsque $N$ est très grand devant $n$ — jamais exactement " +
            'en général.',
        },
        {
          kind: 'atelier',
          tag: 'hypergeometrique-binomiale-widget',
          label: 'Manipule toi-même : avec ou sans remise ?',
          caption:
            'Règle la population N, le nombre de succès K et le nombre de tirages n : les ' +
            "deux lois s'affichent en barres jumelées, la loi hypergéométrique (sans " +
            'remise) et la loi binomiale de paramètre p = K⁄N (avec remise). Fais grandir N ' +
            "à proportion K⁄N constante : l'écart entre les barres se referme. Touche une " +
            'barre pour voir les deux calculs.',
        },
        {
          kind: 'entrainement',
          title: 'Probabilité hypergéométrique',
          generatorId: '6gen47',
          description: [
            'Entraîne-toi sur les tirages sans remise, la séquence ordonnée contre la ' +
              'composition, et des tirages hypergéométriques indépendants combinés.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 47. Probabilité hypergéométrique »',
        },
      ],
    },

    {
      id: 'binomialesequence',
      number: 6,
      title: 'Probabilité binomiale (épreuves indépendantes)',
      kicker: 'P(X = k) = Cₙᵏ · pᵏ · (1 − p)ⁿ⁻ᵏ',
      titreCourt: 'Loi binomiale',
      partie: 'Des comptages aux probabilités',
      essentiel: [
        '$P(X=k) = C_n^k \\times p^k \\times (1-p)^{n-k}$ pour $n$ épreuves **indépendantes** de même probabilité de succès $p$.',
        '« Exactement $k$ », « aucun » ou « tous » : un seul terme ; « au moins » ou « au plus » : une somme ou le complément, selon le nombre de termes.',
      ],
      cartes: [
        { question: '$n = 6$, $p = 0{,}4$ : que vaut $P(X=2)$ ?', reponse: '$C_6^2 \\times 0{,}4^2 \\times 0{,}6^4 = 0{,}31104$.' },
        { question: 'Comment calcule-t-on $P(X \\geq 1)$ le plus vite ?', reponse: '$1 - P(X=0) = 1 - (1-p)^n$.' },
        { question: 'Combien de chemins de l\'arbre comptent exactement $k$ succès en $n$ épreuves ?', reponse: '$N_k = C_n^k$.' },
      ],
      utilise: [
        { cible: '6e-6h/probabilites#tiragesarbres', poids: 'indispensable', rappel: 'La probabilité d\'un **chemin**, c\'est le produit des probabilités des branches traversées ; la probabilité d\'un **événement**, c\'est la somme des probabilités des chemins qui y mènent. Avec remise, les tirages successifs sont **indépendants** ; sans remise, la composition change après chaque tirage : le résultat du 1er tirage modifie les probabilités du 2e.' },
        { cible: '6e-6h/probabilites#probabilitesproblemes', poids: 'utile', rappel: 'Pour trouver $P(X=k)$, il suffit de **compter** combien de chemins de l\'arbre contiennent $k$ succès, puis de multiplier ce nombre par la probabilité commune à chacun d\'eux : $P(X=k) = N_k \\times p^k(1-p)^{n-k}$. « Au moins un succès » se calcule par le complément de « aucun succès », **jamais** en additionnant des probabilités individuelles : $P(\\text{au moins 1}) = 1 - P(X=0) = 1-(1-p)^n$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Probabilité binomiale et séquence exacte', youtubeId: '1sdKwvmrzlE' },
        {
          kind: 'definition',
          label: 'Définition — loi binomiale',
          items: [
            'Pour $n$ épreuves **indépendantes** identiques (probabilité de succès $p$ ' +
              "**constante** — typiquement avec remise, ou une population très grande), la " +
              "probabilité d'obtenir exactement $k$ succès est " +
              '$P(X=k) = C_n^k \\times p^k \\times (1-p)^{n-k}$.',
            '$p$ (succès) porte l\'exposant $k$ ; $(1-p)$ (échec) porte l\'exposant $n-k$ — ' +
              "jamais l'inverse.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà',
          text:
            'En probabilités ([[6e-6h/probabilites#probabilitesproblemes]]), les épreuves répétées se justifient par l\'arbre : ' +
            '$P(X=k) = N_k \\times p^k(1-p)^{n-k}$, où $N_k$ est le nombre de chemins qui comptent ' +
            'exactement $k$ succès — et tu les comptais un par un. Ce chapitre donne enfin ce ' +
            'nombre directement : $N_k = C_n^k$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — loi binomiale : les Nₖ chemins sont Cₙᵏ',
          blocks: [
            {
              kind: 'para',
              text:
                'Un chemin de l\'arbre est une suite de $n$ résultats, S (succès) ou E (échec). Un ' +
                'chemin à $k$ succès a la probabilité $p^k(1-p)^{n-k}$ — **produit le long d\'un ' +
                'chemin, épreuves indépendantes** ($k$ facteurs $p$, $n-k$ facteurs $1-p$).',
            },
            {
              kind: 'para',
              text:
                'Un tel chemin est entièrement déterminé par les $k$ rangs (parmi les $n$ épreuves) ' +
                'où se trouvent les succès : $N_k = C_n^k$ chemins — **combinaison de** $k$ **rangs ' +
                'parmi** $n$**, l\'ordre de ces rangs ne compte pas**.',
            },
            {
              kind: 'para',
              text:
                'L\'événement « exactement $k$ succès » est réalisé par ces $C_n^k$ chemins, tous de ' +
                'même probabilité : $P(X=k) = C_n^k \\times p^k \\times (1-p)^{n-k}$ — **somme des ' +
                'probabilités des chemins qui réalisent l\'événement**.',
            },
          ],
        },
        { kind: 'subheading', text: 'Calculer une probabilité binomiale' },
        {
          kind: 'exemple',
          badge: 'exactement 2 lancers francs réussis sur 6',
          formula:
            'Une joueuse réussit un lancer franc avec une probabilité de $0{,}4$, ses lancers étant ' +
            'indépendants. Elle tire 6 lancers francs. Quelle est la probabilité qu\'elle en réussisse ' +
            'exactement 2 ?',
          steps: [
            { tag: 'paramètres', text: '$n=6$ épreuves indépendantes, $p=0{,}4$, $k=2$' },
            {
              tag: 'formule',
              text: '$P(X=2) = C_6^2 \\times 0{,}4^2 \\times 0{,}6^4$ $= 15 \\times 0{,}16 \\times 0{,}1296$',
            },
          ],
          result: { tag: 'conclusion', text: '$P(X=2) = 0{,}31104$.' },
        },
        {
          kind: 'piege',
          text:
            'Oublier $C_6^2=15$ donne $0{,}4^2 \\times 0{,}6^4 = 0{,}020736$, un résultat **15 fois** ' +
            "trop petit ! Le coefficient binomial n'est jamais optionnel dès que $0<k<n$ : il " +
            'compte les différentes **positions** possibles des $k$ succès parmi les $n$ épreuves.',
        },
        { kind: 'subheading', text: 'Trois stratégies — terme unique, somme, complément' },
        {
          kind: 'methode',
          label: 'Méthode — choisir la stratégie la plus courte',
          items: [
            '« Exactement $k$ », « aucun » ou « tous » : un **seul** terme, calcul direct.',
            '« Au moins $k$ » ou « au plus $k$ » : **somme** de plusieurs termes si peu ' +
              'nombreux, sinon passe par le **complément** (1 moins la probabilité du cas ' +
              'contraire). Compte toujours les termes des deux côtés avant de choisir.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['k', 'P(X = k)'],
          rows: [
            ['0', '$0{,}046656$'],
            ['1', '$0{,}186624$'],
            ['2', '$0{,}31104$'],
            ['3', '$0{,}27648$'],
            ['4', '$0{,}13824$'],
            ['5', '$0{,}036864$'],
            ['6', '$0{,}004096$'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: '0', value: 0.046656, valueLabel: '0,047' },
              { label: '1', value: 0.186624, valueLabel: '0,187' },
              { label: '2', value: 0.31104, valueLabel: '0,311' },
              { label: '3', value: 0.27648, valueLabel: '0,276' },
              { label: '4', value: 0.13824, valueLabel: '0,138', tone: 'good' },
              { label: '5', value: 0.036864, valueLabel: '0,037', tone: 'good' },
              { label: '6', value: 0.004096, valueLabel: '0,004', tone: 'good' },
            ],
            maxValue: 0.34,
            xAxisLabel: 'k (nombre de succès)',
            yAxisLabel: 'P(X=k)',
            caption:
              'Distribution complète pour $n=6$, $p=0{,}4$ : les 3 barres en couleur ($k=4$, 5, 6) ' +
              'forment la région « au moins 4 ».',
          },
        },
        {
          kind: 'exemple',
          badge: 'au moins 1, au plus 5, au moins 4 lancers réussis sur 6',
          formula:
            'Même joueuse (6 lancers, $p=0{,}4$). Calcule la probabilité qu\'elle réussisse au moins ' +
            '1 lancer, puis au plus 5, puis au moins 4, en choisissant chaque fois la stratégie la plus courte.',
          steps: [
            { tag: 'au moins 1 : complément de « aucun »', text: '$1-P(X=0) = 1-0{,}046656$ $= 0{,}953344$' },
            { tag: 'au plus 5 : complément de « tous »', text: '$1-P(X=6) = 1-0{,}004096$ $= 0{,}995904$' },
            {
              tag: 'au moins 4 : somme de 3 termes (le complément en aurait 4)',
              text: '$P(4)+P(5)+P(6)$ $= 0{,}13824+0{,}036864+0{,}004096$ $= 0{,}1792$',
            },
          ],
          result: { tag: 'conclusion', text: '$0{,}953344$, $0{,}995904$ et $0{,}1792$.' },
        },
        {
          kind: 'piege',
          text:
            'Le complémentaire de « au plus 5 » (sur 6) est « tous réussissent » ($X=6$), ' +
            'jamais « aucun » ($X=0$) — et le complémentaire de « au moins 4 » est « au plus ' +
            '3 » ($X=0$, 1, 2 ou 3, donc 4 termes à retirer), jamais $1-P(X=3)$ qui ne retire ' +
            'qu\'**un seul** terme. Identifie bien le **seuil** exact avant de choisir le ' +
            'complément.',
        },
        {
          kind: 'astuce',
          label: 'La somme de toute la distribution vaut toujours 1',
          text:
            '$P(0)+P(1)+\\ldots+P(6)=1$ quelle que soit la valeur de $p$ — un excellent moyen ' +
            "de vérifier une distribution complète avant de répondre. Ça n'exige pas $p=0{,}5$ : " +
            "l'équiprobabilité entre les issues n'est jamais requise pour que leur somme fasse 1.",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la somme des P(X = k) vaut 1',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\displaystyle\\sum_{k=0}^{n} P(X=k) = \\sum_{k=0}^{n} C_n^k\\, p^k (1-p)^{n-k}$ — ' +
                '**formule de la loi binomiale**.',
            },
            {
              kind: 'para',
              text:
                'C\'est le développement de $(a+b)^n = \\displaystyle\\sum_{k=0}^{n} C_n^k\\, a^{n-k} b^k$ ' +
                'avec $a = 1-p$ et $b = p$ — **formule du binôme de Newton (§ 3)**.',
            },
            {
              kind: 'para',
              text:
                'Donc la somme vaut $\\big((1-p)+p\\big)^n = 1^n = 1$, pour toute valeur de $p$ — ' +
                '**le binôme relie le § 3 au § 6**.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Pour p = 0,5, une distribution symétrique',
          text:
            'Si $p = 0{,}5$, alors $P(X=k) = C_n^k \\times 0{,}5^n$ : les probabilités sont ' +
            'proportionnelles à la ligne $n$ du triangle de Pascal, donc symétriques ' +
            '($P(X=k) = P(X=n-k)$, par la symétrie $C_n^k = C_n^{n-k}$). Pour $p \\neq 0{,}5$, ' +
            'cette symétrie disparaît.',
        },
        {
          kind: 'historique',
          titre: 'Jacques Bernoulli et l\'« art de conjecturer »',
          text:
            'Les épreuves répétées indépendantes, à deux issues et de probabilité constante, ' +
            'portent le nom de **Jacques Bernoulli** (1655–1705) : on parle d\'« épreuves de ' +
            'Bernoulli ». Dans son « Art de conjecturer » (Ars Conjectandi), publié en 1713, huit ' +
            'ans après sa mort, il étudie la combinatoire, le binôme et ces épreuves répétées, et ' +
            'il démontre une première version de la **loi des grands nombres** : quand on répète ' +
            'l\'épreuve un très grand nombre de fois, la fréquence des succès se rapproche de $p$.',
          image: {
            src: '/images/historique/bernoulli-jacob.jpg',
            alt: 'Portrait de Jacques Bernoulli',
            caption: 'Jacques Bernoulli (1655–1705), portrait d\'époque.',
          },
        },
        {
          kind: 'para',
          text:
            'La loi binomiale revient dans [[6e-6h/variables-aleatoires#loibinomiale]] : ' +
            'tu y calculeras aussi le nombre moyen de succès, l\'espérance ' +
            '$E(X) = np$.',
        },
        {
          kind: 'entrainement',
          title: 'Probabilité binomiale et séquence exacte',
          generatorId: '6gen48',
          description: [
            'Entraîne-toi sur la loi binomiale, les trois stratégies (terme unique, somme, ' +
              'complément) et la séquence exacte sans remise vue au § 5.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 48. Probabilité binomiale et séquence exacte »',
        },
        {
          kind: 'entrainement',
          title: 'Avec ou sans remise ? Choisir le modèle',
          generatorId: '6gen108',
          description: [
            'Lis comment se font les tirages pour choisir la loi (binomiale avec remise, hypergéométrique sans remise), puis calcule une probabilité, y compris « au moins un » et « au plus un ».',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 108. Avec ou sans remise ? Choisir le modèle »',
        },
        {
          kind: 'entrainement',
          title: "Détective d'erreurs : analyse combinatoire",
          generatorId: '6gen109',
          description: [
            "Trouve la ligne fausse dans la copie d'un élève (ordre compté à tort, collier, dénominateur, exposants inversés, « − 1 » oublié, lettres répétées), explique l'erreur et corrige le résultat.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 109. Détective d'erreurs : analyse combinatoire »",
        },
        { kind: 'video', title: 'Synthèse du chapitre', youtubeId: 'CZGQSI3TBZ4' },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Factorielle, arrangements, combinaisons',
        formulas: [
          { text: '$n! = n \\times (n-1) \\times \\ldots \\times 1$', condition: '$0!=1$' },
          { text: '$A_n^p = \\dfrac{n!}{(n-p)!}$ $= n \\times (n-1) \\times \\ldots \\times (n-p+1)$', condition: 'choisir $p$ parmi $n$ ET ordonner' },
          { text: '$C_n^p = \\dfrac{n!}{p!\\,(n-p)!} = \\dfrac{A_n^p}{p!}$', condition: 'choisir $p$ parmi $n$ seulement' },
          { text: 'symétrie : $C_n^p = C_n^{n-p}$', condition: 'garder $p$ éléments, c\'est en laisser $n-p$' },
          { text: '$\\dfrac{(n+1)!}{(n-1)!} = n(n+1)$', condition: 'simplifier un quotient de factorielles' },
        ],
      },
      {
        title: 'Permutations',
        formulas: [
          { text: '$P_n = n!$', condition: 'tous les éléments utilisés, ordre compte' },
          {
            text: 'permutations avec répétition : $\\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_r!}$',
            condition: '$n$ éléments dont $n_1, \\ldots, n_r$ identiques, ou $n$ personnes en $r$ groupes nommés',
          },
          { text: 'groupes non nommés de même taille : diviser par $r!$', condition: '$r$ groupes interchangeables' },
          { text: 'anagrammes : permutations distinctes $-1$', condition: 'le mot de départ retiré' },
          { text: 'table : $(n-1)!$', condition: 'rotations équivalentes' },
          { text: 'collier : $\\dfrac{(n-1)!}{2}$', condition: 'rotations ET réflexions équivalentes, $n \\geq 3$' },
        ],
      },
      {
        title: 'Avec répétition autorisée',
        formulas: [
          { text: '$B_n^p = n^p$', condition: 'ordre compte, répétition autorisée' },
          { text: '$\\Gamma_n^p = C_{n+p-1}^p$', condition: 'ordre ne compte pas, répétition autorisée (étoiles et barres)' },
          { text: 'au moins un de chaque type : $C_{p-1}^{n-1}$', condition: '$p \\geq n$' },
          { text: '$C_n^2 + n = C_{n+1}^2 = \\Gamma_n^2$', condition: 'paires de valeurs, doubles compris (dominos)' },
        ],
      },
      {
        title: 'Figures et ensembles',
        formulas: [
          { text: '$D(n) = \\dfrac{n(n-3)}{2}$', condition: "diagonales d'un polygone convexe à $n$ côtés" },
          { text: 'chemins : $C_{m+n}^n$', condition: 'quadrillage de $m$ cases sur $n$, pas vers la droite ou vers le haut' },
          { text: 'parties d\'un ensemble à $n$ éléments : $2^n$', condition: 'au moins un élément : $2^n - 1$' },
        ],
      },
      {
        title: 'Choix combinés et contraintes',
        formulas: [
          { text: 'ET indépendant $\\Rightarrow$ multiplier' },
          { text: 'OU exclusif $\\Rightarrow$ additionner', condition: 'cas disjoints, par exemple séparés selon le dernier chiffre' },
          { text: 'rôle distingué : (choix du rôle) $\\times$ (combinaison pour le reste)' },
          { text: 'exclusion : total $-$ (les deux ensemble)' },
          { text: 'couple indissociable : (les deux ensemble) $+$ (les deux absents)' },
          { text: 'au moins un : total $-$ aucun', condition: 'complément' },
          { text: '$N(A \\text{ et } B) = \\text{total} - N(\\text{pas } A)$ $- N(\\text{pas } B) + N(\\text{ni } A \\text{ ni } B)$', condition: 'inclusion-exclusion' },
          { text: 'bloc : (rangements du bloc et des autres) $\\times$ (ordres dans le bloc)', condition: 'éléments côte à côte' },
        ],
      },
      {
        title: 'Binôme de Newton et triangle de Pascal',
        formulas: [
          { text: '$(a+b)^n = \\displaystyle\\sum_{k=0}^{n} C_n^k \\, a^{n-k} b^k$' },
          { text: '$T_{k+1} = C_n^k \\times a^{n-k} \\times b^k$', condition: 'terme général, rang $k+1$' },
          { text: 'terme indépendant de $x$ : exposant de $x$ dans $T_{k+1}$ égal à 0', condition: '$k$ entier, $0 \\leq k \\leq n$' },
          { text: '$C_n^k = C_{n-1}^{k-1}+C_{n-1}^k$', condition: 'relation de Pascal, $1 \\leq k \\leq n-1$' },
          { text: '$\\displaystyle\\sum_{k=0}^{n} C_n^k = 2^n$' },
          { text: '$(1+\\varepsilon)^n \\approx 1+n\\varepsilon$', condition: '$n\\varepsilon$ petit' },
        ],
      },
      {
        title: 'Lois de probabilité',
        formulas: [
          {
            text: '$P(k) = \\dfrac{C_K^k \\times C_{N-K}^{n-k}}{C_N^n}$',
            condition: 'hypergéométrique — tirage SANS remise',
          },
          {
            text: 'séquence exacte : $\\dfrac{1}{n} \\times \\dfrac{1}{n-1} \\times \\ldots \\times \\dfrac{1}{n-p+1} = \\dfrac{1}{A_n^p}$',
            condition: '$p$ éléments distincts tirés sans remise, dans un ordre imposé',
          },
          {
            text: '$P(X=k) = C_n^k \\times p^k \\times (1-p)^{n-k}$',
            condition: 'binomiale — épreuves indépendantes',
          },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Arrangement', '$A_n^p=\\dfrac{n!}{(n-p)!}$ — choisir ET ordonner'],
        ['Combinaison', '$C_n^p=\\dfrac{A_n^p}{p!}$ — choisir SEULEMENT ; $C_n^p = C_n^{n-p}$'],
        ['Permutation', '$P_n = n!$ — tous les éléments, ordre compte'],
        ['Avec répétition', 'ordre compte : $B_n^p = n^p$ ; sans ordre : $\\Gamma_n^p = C_{n+p-1}^p$ (étoiles et barres)'],
        ['Diagonales, chemins, parties', '$D(n)=\\dfrac{n(n-3)}{2}$ ; chemins $C_{m+n}^n$ ; $2^n$ parties'],
        ['Permutations circulaires', 'table $(n-1)!$ ; collier $\\dfrac{(n-1)!}{2}$'],
        ['Multinomiale, anagrammes', '$\\dfrac{n!}{n_1!\\,n_2!\\cdots n_r!}$ — groupes nommés ou lettres répétées ; anagrammes : $-1$ ; groupes non nommés : $\\div r!$'],
        ['Rôle distingué', 'le rôle à part, puis une combinaison pour le reste'],
        ['ET indépendant / OU exclusif', 'ET → multiplier ; OU exclusif (cas disjoints) → additionner'],
        ['Exclusion / couple indissociable', 'total − (les deux ensemble) ; (les deux ensemble) + (les deux absents)'],
        ['Complément, inclusion-exclusion, bloc', '« au moins un » = total − aucun ; retirer « pas $A$ », « pas $B$ », rajouter « ni l\'un ni l\'autre » ; bloc × ordres internes'],
        ['Issues équiprobables', 'compter des issues de même probabilité (dés discernables) — trois dés de Galilée : 25 contre 27'],
        ['Binôme de Newton', '$(a+b)^n=\\sum C_n^k\\,a^{n-k}b^k$ ; $T_{k+1} = C_n^k\\,a^{n-k}b^k$ ; terme indépendant : exposant de $x$ nul'],
        ['Triangle de Pascal', '$C_n^k=C_{n-1}^{k-1}+C_{n-1}^k$ ; symétrie ; somme de ligne $=2^n$'],
        ['Approximation', '$(1+\\varepsilon)^n \\approx 1+n\\varepsilon$ si $n\\varepsilon$ est petit'],
        ['Loi hypergéométrique', '$P(k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}$ — tirage SANS remise'],
        ['Séquence vs composition', 'séquence = 1 ordre précis, $\\dfrac{1}{A_n^p}$ pour des éléments distincts ; composition = tous les ordres, formule hypergéométrique'],
        ['Loi binomiale', '$P(X=k)=C_n^k\\,p^k(1-p)^{n-k}$ — épreuves indépendantes ; $N_k = C_n^k$ chemins'],
      ],
    },
    entrainement: {
      kind: 'entrainement',
      title: 'Analyse combinatoire — quiz vrai/faux',
      generatorId: '6gen70',
      description: ['Teste-toi sur tout le chapitre : un quiz vrai/faux transversal.'],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 70. Quiz vrai/faux — Analyse combinatoire »',
    },
  },
}
