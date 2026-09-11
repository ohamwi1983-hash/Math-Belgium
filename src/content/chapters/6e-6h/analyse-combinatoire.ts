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
      kicker: 'A(n,k) = choisir ET ordonner ; C(n,k) = choisir seulement',
      blocks: [
        { kind: 'video', title: 'Analyse combinatoire' },
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
          kind: 'definition',
          label: 'Arrangement A(n,k) — choisir ET ordonner',
          items: [
            "Tu choisis $k$ éléments parmi $n$, et l'**ordre compte** (un podium, un mot de " +
              "passe, une suite de rôles) ? C'est un arrangement : " +
              '$A_n^k = \\dfrac{n!}{(n-k)!} = n \\times (n-1) \\times \\ldots \\times (n-k+1)$.',
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
          label: 'Combinaison C(n,k) — choisir SEULEMENT',
          items: [
            "Tu choisis $k$ éléments parmi $n$, mais cette fois l'**ordre ne compte pas** (un " +
              "comité, une main de cartes) ? C'est une combinaison : " +
              '$C_n^k = \\dfrac{n!}{k!(n-k)!} = \\dfrac{A_n^k}{k!}$.',
            'Pourquoi diviser par $k!$ ? $A_n^k$ compte chaque groupe de $k$ éléments plusieurs ' +
              "fois, une fois par ordre possible. Diviser par $k!$ retire justement ces " +
              "réordonnancements internes, qui ne comptent plus une fois l'ordre ignoré.",
          ],
        },
        { kind: 'subheading', text: "Reconnaître le type de groupement — vue d'ensemble" },
        {
          kind: 'methode',
          label: 'Méthode — 3 questions, toujours dans cet ordre',
          items: [
            'Avant tout calcul, pose-toi 3 questions, toujours dans le même ordre. Elles te ' +
              'donnent le type exact de groupement, et donc la bonne formule.',
            "**L'ordre compte-t-il ?** Permuter les éléments choisis change-t-il le résultat ?",
            '**La répétition est-elle autorisée ?** Un même élément peut-il être choisi plusieurs fois ?',
            '**Tous les** $n$ **éléments sont-ils utilisés ?** (c\'est-à-dire $p=n$) — cette 3e ' +
              "question ne se pose que si l'ordre compte : sans ordre, seule la répétition " +
              'distingue les 2 cas possibles.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Groupement', 'Ordre', 'Répétition', 'p=n ?', 'Formule'],
          rows: [
            ['Permutation simple', 'compte', 'non', 'oui', '$P_p=p!$'],
            ['Arrangement simple', 'compte', 'non', 'non', '$A_n^p=\\dfrac{n!}{(n-p)!}$'],
            ['Permutation avec répétition', 'compte', 'oui', 'oui', '$\\dfrac{n!}{n_1! \\ldots n_k!}$'],
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
            'séparément ; $A_n^k$ et $C_n^k$, déjà vus ci-dessus, sont les 2 cas sans répétition ' +
            '— les 4 autres lignes du tableau, détaillées au fil de ce chapitre, couvrent les ' +
            'cas avec répétition et les 2 cas de permutation.',
        },
        {
          kind: 'piege',
          label: 'Piège classique — distinguer choisir-et-ordonner de choisir-seulement',
          text:
            'Face à un énoncé de dénombrement, pose-toi toujours cette question en premier : ' +
            '« si je permute les éléments choisis, est-ce que ça change le résultat ? » Un ' +
            "podium (1er, 2e, 3e) → $A_n^k$ : changer l'ordre change qui est 1er ! Un comité de " +
            '3 personnes sans rôle distinct → $C_n^k$ : permuter les 3 personnes choisies ne ' +
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
        { kind: 'subheading', text: 'Exemple résolu — choisir 3 livres parmi 8' },
        {
          kind: 'exemple',
          badge: 'étagère (ordre compte) vs sac de voyage (ordre ne compte pas)',
          formula: "Aligner 3 livres précis, dans un **ordre** donné, sur une étagère, parmi 8 disponibles :",
          steps: [
            { tag: 'ordre compte', text: '$A_8^3 = 8 \\times 7 \\times 6 = 336$' },
            {
              tag: 'ordre ignoré',
              text:
                "Emporter les 3 **mêmes** livres en vacances, sans se soucier de l'ordre dans le sac : " +
                '$C_8^3 = \\dfrac{336}{3!} = \\dfrac{336}{6} = 56$',
            },
          ],
          result: { tag: 'résultat', text: '336 alignements ordonnés, mais seulement 56 sacs distincts.' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi A(n,k) = C(n,k) × k!',
          blocks: [
            {
              kind: 'para',
              text:
                'Choisir $k$ éléments sans ordre : $C_n^k$ façons — **définition de la combinaison**.',
            },
            {
              kind: 'para',
              text:
                'Ordonner ensuite ces $k$ éléments choisis : $k!$ façons pour chaque groupe — ' +
                "**permutation d'un groupe déjà fixé**.",
            },
            {
              kind: 'para',
              text:
                "Choisir-puis-ordonner revient exactement à « arranger directement » : chaque " +
                'groupe non ordonné se décline en $k!$ ordres possibles, d\'où ' +
                '$A_n^k=C_n^k \\times k!$ — **une multiplication, jamais une somme**.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            "$A_n^k=C_n^k+k!$ est **faux** — ça confond addition et multiplication ! Avec " +
            "l'exemple ci-dessus, ça donnerait 56+6=62, très loin des 336 réels.",
        },
        { kind: 'subheading', text: 'Nombres à chiffres tous distincts — principe multiplicatif position par position' },
        {
          kind: 'methode',
          items: [
            "Pour compter les nombres à $n$ chiffres **tous différents** (choisis parmi 0-9), " +
              'premier chiffre non nul : remplis les positions **une à une**. Chaque position a ' +
              "un chiffre de moins que la précédente, puisqu'un chiffre déjà utilisé n'est plus " +
              'disponible.',
          ],
        },
        {
          kind: 'exemple',
          badge: '4 chiffres puis 3 chiffres',
          formula:
            '4 chiffres tous distincts, premier non nul : 9 choix pour le 1er (jamais 0), puis 9, ' +
            '8, 7 pour les positions suivantes (0 redevient disponible dès la 2e position).',
          steps: [
            { tag: '4 chiffres', text: '$9 \\times 9 \\times 8 \\times 7 = 4536$' },
            ],
          result: { tag: '3 chiffres (même règle)', text: '$9 \\times 9 \\times 8 = 648$' },
        },
        {
          kind: 'piege',
          text:
            "Exclure 0 de **toutes** les positions (pas seulement la première) donnerait à tort " +
            "$9 \\times 8 \\times 7 = 504$ pour l'exemple à 3 chiffres. Seul le **premier** " +
            "chiffre doit être non nul ! 0 reste parfaitement autorisé ensuite, tant qu'il n'est " +
            'pas répété.',
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
          label: 'Définition — arrangement avec répétitions B(n,p)=nᵖ',
          items: [
            "Dès que la répétition est **autorisée** (un même élément peut réapparaître à " +
              'plusieurs positions), chaque position redevient indépendante des précédentes : ' +
              '**toujours** $n$ choix, quelle que soit la position. $B_n^p = n^p$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'nombres de 4 chiffres à partir de 6 chiffres donnés (1, 2, 5, 7, 8, 9)',
          formula: '',
          steps: [
            {
              tag: 'sans répétition (arrangement simple)',
              text: '$A_6^4 = 6 \\times 5 \\times 4 \\times 3 = 360$',
            },
            ],
          result: {
              tag: 'avec répétition autorisée',
              text:
                'chacune des 4 positions dispose des 6 chiffres, sans jamais en retirer un déjà ' +
                'utilisé : $B_6^4 = 6^4 = 1296$',
            },
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
          label: 'Définition — permutation simple P(p)=p!',
          items: [
            "Une **permutation simple** de $p$ éléments distincts, c'est le cas particulier de " +
              "l'arrangement où **tous** les éléments sont utilisés ($p=n$). Il ne reste alors " +
              "plus aucun élément à laisser de côté, seul l'**ordre** change d'une permutation à " +
              "l'autre.",
            '$P_p = A_p^p = p!$',
          ],
        },
        {
          kind: 'exemple',
          badge: 'mots de 4 lettres avec A, E, M, R',
          formula: '4 lettres TOUTES distinctes, TOUTES utilisées, sans tenir compte du sens du mot obtenu :',
          steps: [{ tag: 'permutation simple', text: '$P_4 = 4! = 4 \\times 3 \\times 2 \\times 1 = 24$' }],
          result: {
            tag: 'résultat',
            text: "24 « mots » possibles (sans que le résultat ait nécessairement un sens en français).",
          },
        },
        {
          kind: 'astuce',
          label: 'P(p)=A(n,k) avec n=k=p',
          text:
            "Pose $n=p$ dans la formule de l'arrangement, tu retrouves directement $P_p$ : " +
            '$A_p^p = \\dfrac{p!}{(p-p)!} = \\dfrac{p!}{0!} = p!$ (grâce à $0!=1$). Inutile de ' +
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
          kind: 'exemple',
          badge: 'direct et inverse',
          formula: 'Pour $n=9$ : $D(9) = \\dfrac{9 \\times 6}{2} = 27$.',
          steps: [
            {
              tag: 'sens inverse',
              text:
                "retrouver $n$ à partir de $D=27$ revient à résoudre $n^2-3n-54=0$ (en " +
                'multipliant $D(n)=\\frac{n(n-3)}{2}=D$ par 2)',
            },
            ],
          result: { tag: 'discriminant', text: '$9+8 \\times 27 = 225 = 15^2$, donc $n=\\dfrac{3+15}{2}=9$' },
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
        { kind: 'subheading', text: 'Permutations circulaires — table et collier' },
        {
          kind: 'definition',
          items: [
            'Pour $n$ objets distincts disposés en **cercle** : si seules les **rotations** ' +
              "sont considérées équivalentes (une table), il y a $(n-1)!$ dispositions " +
              'distinctes — fixer un objet de référence élimine les rotations. Si en plus les ' +
              "**réflexions** sont équivalentes (un collier, un bracelet — le sens de lecture " +
              "n'importe pas), il faut diviser par 2 : table $(n-1)!$ ; collier " +
              '$\\dfrac{(n-1)!}{2}$.',
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
                'dispositions de la table en une seule : $\\dfrac{120}{2}=60$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: '7 personnes',
          formula: '',
          steps: [
            { tag: 'table', text: '$(7-1)! = 6! = 720$ dispositions' },
            { tag: 'collier', text: '$\\dfrac{720}{2} = 360$ dispositions' },
          ],
          result: {
            tag: 'résultat',
            text:
              'Chaque disposition de collier est comptée deux fois côté table (une fois par sens de lecture).',
          },
        },
        {
          kind: 'piege',
          text:
            'Oublier la division par 2 pour un collier (répondre 720 au lieu de 360) est ' +
            "l'erreur la plus fréquente de ce sous-type. Un collier **n'est pas** une simple " +
            'table : la réflexion y ajoute une symétrie supplémentaire à prendre en compte !',
        },
        {
          kind: 'astuce',
          label: 'La symétrie C(n,k)=C(n,n−k), un réflexe de vérification',
          text:
            'Choisir $k$ éléments parmi $n$ revient exactement à **laisser** $n-k$ éléments de ' +
            'côté : $C_n^k=C_n^{n-k}$, toujours. Pratique pour calculer le plus petit des deux ' +
            'côtés (ex. $C_{20}^{14}=C_{20}^6$, bien plus rapide à développer à la main), et ' +
            'pour repérer une erreur de calcul si les deux côtés ne coïncident pas.',
        },
        { kind: 'subheading', text: 'Combinaison avec répétitions — dernier cas de la classification' },
        {
          kind: 'definition',
          label: 'Définition — combinaison avec répétitions Γ(n,p)',
          items: [
            "Choisir $p$ éléments parmi $n$, sans tenir compte de l'ordre et avec répétition " +
              '**autorisée** (un même élément peut être choisi plusieurs fois) : le dernier des ' +
              '6 types de groupement du tableau de classification. Le résultat se ramène à une ' +
              'combinaison simple, mais sur un ensemble **agrandi** de $p-1$ éléments fictifs : ' +
              '$\\Gamma_n^p = C_{n+p-1}^p = \\dfrac{(n+p-1)!}{p!(n-1)!}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'groupes de 3 lettres parmi 5, répétitions autorisées',
          formula:
            'Décomposer selon le nombre de lettres DISTINCTES dans le groupe : 3 distinctes, ou 2 ' +
            'identiques + 1 différente, ou 3 identiques :',
          steps: [
            {
              tag: 'par décomposition',
              text: '$C_5^3 + 2 \\times C_5^2 + C_5^1 = 10+2 \\times 10+5 = 35$',
            },
            { tag: 'par la formule (n=5, p=3)', text: '$\\Gamma_5^3 = C_{5+3-1}^3 = C_7^3 = 35$' },
          ],
          result: { tag: 'résultat', text: '35 groupes de 3 lettres, les deux méthodes concordant.' },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — d'où vient le « +p−1 », par la relation de Pascal",
          blocks: [
            {
              kind: 'para',
              text:
                '$C_5^3+C_5^2 = C_6^3$ et $C_5^2+C_5^1 = C_6^2$ — **relation de Pascal, appliquée 2 fois**.',
            },
            {
              kind: 'para',
              text:
                '$C_5^3+2 \\times C_5^2+C_5^1 = C_6^3+C_6^2$ — **regroupement des 2 relations précédentes**.',
            },
            {
              kind: 'para',
              text:
                "$C_6^3+C_6^2=C_7^3$ (Pascal, une 3e fois) $= C_{5+3-1}^3$ — exactement la " +
                'formule de $\\Gamma_5^3$, retrouvée par regroupements successifs plutôt que par ' +
                'la formule directement.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège classique — confondre Γ(n,p) et C(n,p)',
          text:
            '$C_5^3=10$ seul (sans répétition) est bien plus petit que $\\Gamma_5^3=35$ (avec ' +
            "répétition) ! N'utilise jamais $C_n^p$ quand l'énoncé autorise explicitement la " +
            "répétition d'un même élément dans le groupe choisi.",
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
      ],
    },

    {
      id: 'denombrementcombine',
      number: 2,
      title: 'Dénombrement combiné et sélections contraintes',
      kicker: 'ET indépendant → multiplier ; OU exclusif → additionner',
      blocks: [
        {
          kind: 'definition',
          label: 'Définition — répartition multinomiale',
          items: [
            '$n$ personnes (ou objets) réparties en $k$ groupes **nommés**, de tailles fixées ' +
              '$n_1,\\ldots,n_k$ sommant à $n$ : le nombre de répartitions possibles est ' +
              '$\\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_k!}$.',
            'Tu peux aussi voir ce nombre comme un enchaînement de choix successifs, dans le ' +
              'pool **restant** à chaque étape : $C_n^{n_1} \\times C_{n-n_1}^{n_2} \\times ' +
              '\\ldots$ — jamais en répétant $n$ à chaque étape, ce qui recompterait les mêmes ' +
              'personnes.',
          ],
        },
        {
          kind: 'exemple',
          badge: '10 personnes en 3 groupes (5, 3, 2)',
          formula: '',
          steps: [
            {
              tag: 'par la formule',
              text: '$\\dfrac{10!}{5! \\times 3! \\times 2!} = \\dfrac{3\\,628\\,800}{120 \\times 6 \\times 2} = 2520$',
            },
            {
              tag: 'par étapes successives',
              text:
                '$C_{10}^5 \\times C_5^3 \\times C_2^2 = 252 \\times 10 \\times 1 = 2520$ — chaque ' +
                "facteur puise dans les personnes RESTANTES (10, puis 5, puis 2), jamais dans les " +
                "10 d'origine à chaque fois",
            },
          ],
          result: { tag: 'résultat', text: '2520 répartitions.' },
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
            formulaLabel: '10!/(5!×3!×2!) = 2520 répartitions',
            caption:
              'Les 10 personnes réparties en 3 groupes nommés de tailles 5, 3 et 2 : ' +
              '$\\dfrac{10!}{5! \\times 3! \\times 2!} = 2520$ répartitions.',
          },
        },
        { kind: 'subheading', text: 'Permutation avec répétitions — la même formule, appliquée à des lettres' },
        {
          kind: 'definition',
          label: 'Définition — permutation avec répétitions',
          items: [
            'Ranger $n$ éléments **dont certains sont identiques** entre eux ($n_1$ exemplaires ' +
              "d'un premier type, $n_2$ d'un second, etc.) revient exactement à une répartition " +
              "multinomiale : chaque type d'élément identique occupe un « groupe nommé » de " +
              "positions, de taille fixée par son nombre d'occurrences — la **même** formule " +
              'que ci-dessus, réinterprétée : $\\dfrac{n!}{n_1! \\times n_2! \\times \\ldots \\times n_k!}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'anagrammes du mot MISSISSIPI',
          formula:
            '10 lettres au total : 1 M, 4 I, 4 S, 1 P. Nombre de permutations DISTINCTES de ces ' +
            '10 lettres (en traitant les lettres identiques comme interchangeables entre elles) :',
          steps: [
            {
              tag: 'permutations distinctes',
              text: '$\\dfrac{10!}{4! \\times 4!} = \\dfrac{3\\,628\\,800}{24 \\times 24} = 6300$',
            },
            {
              tag: 'anagrammes',
              text:
                'une ANAGRAMME est un mot DIFFÉRENT du mot de départ — il faut donc retirer ' +
                'MISSISSIPI lui-même de ce compte : $6300-1 = 6299$',
            },
          ],
          result: { tag: 'résultat', text: '6299 anagrammes.' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — oublier de retirer le mot de départ',
          text:
            "6300 compte le mot MISSISSIPI d'origine comme l'un des « mots » possibles — " +
            "répondre 6300 à « combien d'anagrammes ? » compte 1 de trop ! La question « combien " +
            'de **permutations** des lettres ? » (sans exclusion) admet bien 6300 comme ' +
            'réponse ; seule la question sur les **anagrammes** exige de retrancher 1.',
        },
        {
          kind: 'astuce',
          label: 'Sans lettre répétée, on retrouve p!',
          text:
            'Si les 10 lettres étaient **toutes** distinctes (aucune répétition), la formule ' +
            'redonnerait $\\dfrac{10!}{1! \\times 1! \\times \\ldots \\times 1!}=10!$ — ' +
            'exactement une permutation simple. Diviser par les factorielles des effectifs ' +
            'répétés (4! pour les I, 4! pour les S) retire précisément les réordonnancements ' +
            'internes des lettres identiques, qui ne produisent aucun mot nouveau.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'letterTiles',
            letters: ['M', 'I', 'S', 'S', 'I', 'S', 'S', 'I', 'P', 'I'],
            legend: [
              { letter: 'M', count: 1, tone: 'accent' },
              { letter: 'I', count: 4, tone: 'good' },
              { letter: 'S', count: 4, tone: 'outline' },
              { letter: 'P', count: 1, tone: 'ink' },
            ],
            caption:
              "Les 10 lettres de MISSISSIPI : 8 d'entre elles (les 4 I et les 4 S) sont " +
              'interchangeables entre elles, d\'où la division par $4! \\times 4!$ dans ' +
              '$\\dfrac{10!}{4! \\times 4!} = 6300$, soit 6299 anagrammes une fois le mot de départ retiré.',
          },
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
          badge: '1 président + 2 vice-présidents parmi 10',
          formula:
            'Les 2 vice-présidents sont interchangeables ENTRE EUX (pas de rôle distinct l\'un de ' +
            "l'autre), mais le président a un rôle À PART :",
          steps: [{ tag: 'rôle à part, puis le reste', text: '$10 \\times C_9^2 = 10 \\times 36 = 360$' }],
          result: { tag: 'résultat', text: '360 bureaux possibles.' },
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
          badge: 'ET (comité mixte)',
          formula: '2 personnes choisies parmi 8 hommes ET, indépendamment, 2 parmi 6 femmes :',
          steps: [{ tag: 'ET → multiplier', text: '$C_8^2 \\times C_6^2 = 28 \\times 15 = 420$' }],
          result: { tag: 'résultat', text: '420 comités mixtes.' },
        },
        {
          kind: 'piege',
          text:
            "Additionner $C_8^2+C_6^2=28+15=43$ pour ce même ET est faux ! Un ET entre choix " +
            'indépendants **multiplie**, jamais n\'additionne — sans quoi le résultat pourrait ' +
            'même tomber plus petit que chacun des 2 facteurs pris séparément : un bon signal ' +
            "d'alerte à repérer.",
        },
        {
          kind: 'exemple',
          badge: 'OU exclusif (même groupe)',
          formula:
            '3 personnes TOUTES choisies dans le même groupe — soit un groupe de 10, soit un ' +
            'groupe de 15, jamais un mélange des deux :',
          steps: [{ tag: 'OU exclusif → additionner', text: '$C_{10}^3+C_{15}^3 = 120+455 = 575$' }],
          result: { tag: 'résultat', text: '575 choix possibles.' },
        },
        { kind: 'subheading', text: 'Répétition autorisée, ordre libre — la technique de bijection' },
        {
          kind: 'methode',
          items: [
            "Choisir 2 valeurs parmi $n$, répétition autorisée, sans tenir compte de l'ordre " +
              "(comme les 2 faces d'un domino) : sépare les paires de valeurs **différentes** " +
              '($C_n^2$) des paires « doubles » ($n$ possibilités, une par valeur) : ' +
              '$C_n^2+n = C_{n+1}^2$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'dominos à 6 valeurs',
          formula: '',
          steps: [{ tag: 'paires différentes + doubles', text: '$C_6^2+6 = 15+6 = 21 = C_7^2$' }],
          result: { tag: 'résultat', text: '21 dominos distincts.' },
        },
        {
          kind: 'piege',
          text:
            '$C_6^2=15$ seul oublie les 6 dominos « doubles » (0-0, 1-1, …, 5-5) ! Il faut ' +
            '**toujours** les ajouter séparément pour retrouver le total 21.',
        },
        { kind: 'subheading', text: 'Discernable vs indiscernable' },
        {
          kind: 'exemple',
          badge: '2 dés à 6 faces',
          formula: '',
          steps: [
            {
              tag: 'dés DISCERNABLES',
              text: 'de couleurs différentes, l\'ordre « rouge puis bleu » compte : $6^2=36$ résultats',
            },
            ],
          result: {
              tag: 'dés INDISCERNABLES',
              text:
                'impossible de dire lequel est lequel — les paires symétriques comme « 3 puis 5 » ' +
                'et « 5 puis 3 » fusionnent : $C_7^2=21$ résultats',
            },
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
          badge: '20 personnes, 6 choisies, X et Y',
          formula: '',
          steps: [
            { tag: 'X et Y jamais ensemble', text: '$C_{20}^6-C_{18}^4 = 38\\,760-3060 = 35\\,700$' },
            ],
          result: { tag: 'X et Y ensemble ou absents tous les deux', text: '$C_{18}^4+C_{18}^6 = 3060+18\\,564 = 21\\,624$' },
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
        {
          kind: 'entrainement',
          title: 'Dénombrement combiné et sélections contraintes',
          generatorId: '6gen44',
          description: [
            'Entraîne-toi sur les répartitions multinomiales, les permutations avec ' +
              'répétitions, les rôles distingués, le ET/OU, et sur exclusion et couple ' +
              'indissociable.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 44. Dénombrement combiné et sélections contraintes »',
        },
      ],
    },

    {
      id: 'binomenewton',
      number: 3,
      title: 'Binôme de Newton',
      kicker: "(a+b)ⁿ = ∑ C(n,k)×aⁿ⁻ᵏ×bᵏ — l'exposant de a décroît, celui de b croît",
      blocks: [
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
          kind: 'piege',
          text:
            "$(a-b)^n \\neq a^n-b^n$ ! Tu ne peux **jamais** séparer une puissance d'une somme " +
            "(ou d'une différence) en la puissance de chaque terme pris isolément — il faut " +
            'toujours passer par le développement complet du binôme.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — preuve directe par dénombrement (cas n=4)',
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
                'sont exactement $C_4^0$ à $C_4^4$. D\'où $(a+b)^4 = C_4^0a^4b^0 + C_4^1a^3b^1 + ' +
                'C_4^2a^2b^2 + C_4^3a^1b^3 + C_4^4a^0b^4$.',
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
        { kind: 'subheading', text: 'Exemple résolu — développement complet de (2x−1)⁵' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — a=2x, b=−1, n=5',
          blocks: [
            {
              kind: 'para',
              text: 'Terme par terme, avec $T_{k+1}=C_5^k \\times (2x)^{5-k} \\times (-1)^k$ :',
            },
            {
              kind: 'featureTable',
              headers: ['k', 'C(5,k)', '(2x)⁵⁻ᵏ', '(−1)ᵏ', 'Terme'],
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
                '$(2x-1)^5 = 32x^5-80x^4+80x^3-40x^2+10x-1$. Vérification en $x=1$ : la somme des ' +
                '6 termes doit redonner $(2-1)^5=1$, et $32-80+80-40+10-1=1$ ✓.',
            },
          ],
        },
        { kind: 'subheading', text: 'Le triangle de Pascal' },
        {
          kind: 'intuition',
          label: 'Pourquoi une simple addition suffit',
          text:
            'Tu as déjà croisé la relation de Pascal plus tôt dans ce chapitre, dans la ' +
            "démonstration de la formule des combinaisons avec répétitions — elle n'est pas " +
            "neuve. Voici pourquoi elle marche : $C_n^k$, c'est le nombre de façons de choisir " +
            '$k$ éléments parmi $n$. Fixe un élément précis, disons le dernier, et sépare 2 ' +
            "cas : soit tu le prends (il reste $k-1$ à choisir parmi les $n-1$ autres, " +
            "$C_{n-1}^{k-1}$), soit tu ne le prends pas (il reste $k$ à choisir parmi les $n-1$ " +
            'autres, $C_{n-1}^k$). Ces 2 cas couvrent toutes les possibilités, sans jamais se ' +
            "chevaucher : leur somme donne exactement $C_n^k$. Voilà tout le secret de " +
            "l'addition dans le triangle de Pascal.",
        },
        {
          kind: 'definition',
          label: 'Relation de Pascal, symétrie, somme de ligne',
          items: [
            '$C_n^k = C_{n-1}^{k-1}+C_{n-1}^k$ ; $C_n^k=C_n^{n-k}$ ; ' +
              '$\\displaystyle\\sum_{k=0}^{n} C_n^k=2^n$.',
            'Chaque coefficient est la **somme** des deux coefficients juste au-dessus ' +
              '(relation de Pascal) ; chaque ligne est **symétrique** ; la somme d\'une ligne ' +
              'entière double à chaque ligne suivante.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration algébrique de la relation de Pascal',
          blocks: [
            {
              kind: 'para',
              text:
                '$C_{n-1}^{k-1}+C_{n-1}^k = \\dfrac{(n-1)!}{(k-1)!(n-k)!} + ' +
                '\\dfrac{(n-1)!}{k!(n-1-k)!}$ — **définition de** $C_n^k$**, appliquée à** $n-1$.',
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
                '$= \\dfrac{(n-1) ! \\times (k+n-k)}{k!(n-k)!} = \\dfrac{(n-1)! \\times n}{k!(n-k)!} ' +
                '= \\dfrac{n!}{k!(n-k)!}$ — **factorisation, puis** $(n-1)! \\times n = n!$.',
            },
            {
              kind: 'para',
              text:
                "Le dernier membre est exactement $C_n^k$ — la relation de Pascal n'est donc " +
                'jamais une simple observation numérique sur le triangle, mais une IDENTITÉ ' +
                'algébrique démontrée pour tout $n$ et $k$.',
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
          kind: 'exemple',
          badge: 'les trois propriétés sur la ligne n=5',
          formula: '',
          steps: [
            { tag: 'relation de Pascal', text: '$C_5^2=C_4^1+C_4^2=4+6=10$' },
            { tag: 'symétrie', text: '$C_5^2=C_5^3=10$ (car $5-2=3$)' },
            ],
          result: { tag: 'somme de ligne', text: '$1+5+10+10+5+1=32=2^5$' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — mauvais partenaire de symétrie',
          text:
            '$C_5^2=C_5^4$ est **faux** ($C_5^4=5$, pas 10) ! Le bon partenaire de symétrie de ' +
            "$C_5^2$ est $C_5^{5-2}=C_5^3$, jamais $C_5^4$ obtenu en changeant l'indice au hasard.",
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — pourquoi la somme d'une ligne vaut 2ⁿ",
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
            xAxisLabel: 'somme de la ligne n',
            yAxisLabel: '2ⁿ',
            caption:
              'Somme de chaque ligne du triangle de Pascal, $n=0$ à 5 : 1, 2, 4, 8, 16, 32 — elle ' +
              'double à chaque ligne suivante, exactement $2^n$.',
          },
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
          badge: 'le terme en x² de (2x−1)⁵',
          formula: "L'exposant de $x$ est $5-k$ : pour obtenir $x^2$, il faut $5-k=2$, soit $k=3$.",
          steps: [{ tag: 'terme de rang 4', text: '$T_4 = C_5^3 \\times 2^2 \\times (-1)^3 = 10 \\times 4 \\times (-1) = -40$' }],
          result: { tag: 'résultat', text: 'Le terme en $x^2$ est $-40x^2$.' },
        },
        {
          kind: 'piege',
          label: "Piège classique — confondre k avec l'exposant de x",
          text:
            "Associer directement $k=2$ à « l'exposant $x^2$ cherché » est l'erreur classique ! " +
            "L'exposant de $x$ est $5-k$, **pas** $k$. Avec $k=2$ tu obtiendrais en réalité le " +
            'terme en $x^3$ (coefficient 80), pas celui en $x^2$.',
        },
        { kind: 'subheading', text: 'Approximation via le binôme, pour ε petit' },
        {
          kind: 'methode',
          items: [
            'Pour $\\varepsilon$ petit, seul le **premier** terme non trivial du développement ' +
              '($k=1$) pèse vraiment ; les suivants ($\\varepsilon^2$, $\\varepsilon^3$, …) ' +
              'deviennent vite négligeables : $(1+\\varepsilon)^n \\approx 1+n\\varepsilon$.',
          ],
        },
        {
          kind: 'exemple',
          badge: '(1,01)⁴',
          formula: '',
          steps: [
            {
              tag: 'approximation',
              text: 'avec $\\varepsilon=0,01$ et $n=4$ : $(1+0,01)^4 \\approx 1+4 \\times 0,01 = 1,04$',
            },
          ],
          result: { tag: 'résultat', text: 'Une approximation très proche de la valeur exacte $1,01^4 \\approx 1,0406$.' },
        },
        {
          kind: 'astuce',
          label: '« Négligeable » ne veut jamais dire « nul »',
          text:
            "Le terme suivant, $C_4^2 \\times 0,01^2 = 0,0006$, n'est **pas** rigoureusement nul " +
            "— juste assez petit pour être ignoré dans une approximation. C'est précisément " +
            'pourquoi 1,04 est une **approximation** (proche) et non la valeur **exacte** ' +
            '(1,0406…) de $1,01^4$.',
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
      ],
    },

    {
      id: 'denombrementproblemes',
      number: 4,
      title: 'Dénombrement combinatoire pur : problèmes',
      kicker: 'identifier chaque étape, puis MULTIPLIER les étapes indépendantes',
      blocks: [
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
            "Étape 2 : complète la main avec des cartes d'hauteurs **encore disponibles** (les " +
              "hauteurs déjà utilisées à l'étape 1 ne le sont plus).",
          ],
        },
        {
          kind: 'exemple',
          badge: 'mains « carré » (4 cartes de même hauteur + 1 autre)',
          formula: '',
          steps: [
            { tag: '8 hauteurs, 4 couleurs automatiques', text: 'étape 1 : $8 \\times C_4^4 = 8 \\times 1 = 8$' },
            { tag: '7 hauteurs libres × 4 couleurs', text: 'étape 2 : $7 \\times 4 = 28$' },
          ],
          result: { tag: 'total', text: '$8 \\times 28 = 224$ mains « carré ».' },
        },
        {
          kind: 'exemple',
          badge: 'les 3 autres catégories, même méthode',
          formula: '',
          steps: [
            {
              tag: 'brelan (3 même hauteur + 2 hauteurs différentes)',
              text: '$[8 \\times C_4^3=32] \\times [C_7^2 \\times 4 \\times 4=336] = 10\\,752$',
            },
            {
              tag: 'paire (2 même hauteur + 3 hauteurs différentes)',
              text: '$[8 \\times C_4^2=48] \\times [C_7^3 \\times 4^3=2240] = 107\\,520$',
            },
            ],
          result: {
              tag: 'deux paires (2 hauteurs pour les paires + 1 hauteur pour la carte seule)',
              text: '$[C_8^2 \\times (C_4^2)^2=1008] \\times [6 \\times 4=24] = 24\\,192$',
            },
        },
        {
          kind: 'piege',
          label: 'Piège classique — moins de contraintes, plus de possibilités',
          text:
            '224 (carré) < 10 752 (brelan) < 24 192 (deux paires) < 107 520 (paire) : plus une ' +
            'combinaison impose de contraintes précises (4 cartes fixées pour un carré), moins ' +
            'elle laisse de liberté au reste de la main — donc moins de mains au total. Le ' +
            "nombre total de mains possibles, $C_{32}^5=201\\,376$, dépasse largement chacune de " +
            "ces 4 catégories, qui ne couvrent d'ailleurs pas **toutes** les mains (il manque " +
            'par exemple les mains sans aucune hauteur répétée).',
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
              { label: 'Brelan', value: 10752, valueLabel: '10 752' },
              { label: 'Deux paires', value: 24192, valueLabel: '24 192' },
              { label: 'Paire', value: 107520, valueLabel: '107 520', tone: 'good' },
              { label: 'Total C(32,5)', value: 201376, valueLabel: '201 376', tone: 'faint' },
            ],
            maxValue: 201376,
            footnote: 'échelle logarithmique',
            caption:
              "Les 4 catégories de mains, à l'échelle logarithmique (les valeurs s'étalent sur 3 " +
              'ordres de grandeur) : 224, 10 752, 24 192, 107 520, comparées au total de 201 376 ' +
              'mains possibles.',
          },
        },
        { kind: 'subheading', text: 'Le paradoxe du Chevalier de Méré' },
        {
          kind: 'definition',
          label: "L'énigme historique",
          items: [
            'Avec 3 dés à 6 faces, les sommes 9 et 10 admettent chacune exactement 6 ' +
              '**décompositions** non ordonnées (partitions en 3 valeurs de 1 à 6) — le ' +
              "Chevalier de Méré en concluait, à tort, qu'elles étaient également probables. Le " +
              'paradoxe se résout en comptant les **triplets ordonnés** plutôt que les ' +
              'partitions : un triplet aux 3 valeurs différentes offre $3!=6$ arrangements ' +
              "ordonnés, un triplet avec une paire de valeurs identiques n'en offre que 3, et " +
              "un triplet aux 3 valeurs identiques n'en offre qu'1 seul.",
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Partition (somme=9)', 'Arrangements', 'Partition (somme=10)', 'Arrangements'],
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
          badge: 'comparer les deux sommes',
          formula: '',
          steps: [],
          result: {
            tag: 'résultat',
            text:
              '25 triplets ordonnés pour la somme 9, contre 27 pour la somme 10 : obtenir 10 avec ' +
              "3 dés est donc LÉGÈREMENT plus probable qu'obtenir 9 — un écart invisible si l'on " +
              'ne compte que les 6 partitions de chaque somme, révélé seulement en comptant les ' +
              'arrangements ORDONNÉS.',
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
          badge: 'répartition en boîtes numérotées',
          formula:
            '12 objets répartis dans 3 boîtes de tailles fixées 6, 4 et 2 — exactement le même ' +
            'principe multinomial que la répartition de personnes en groupes :',
          steps: [],
          result: { tag: 'multinomiale', text: '$\\dfrac{12!}{6! \\times 4! \\times 2!} = 13\\,860$' },
        },
        {
          kind: 'exemple',
          badge: 'dispositif à répétition',
          formula: '',
          steps: [
            {
              tag: 'répétition autorisée',
              text:
                'un dispositif à 3 éléments indépendants, chacun réglable sur 4 positions : ' +
                '$4^3=64$ configurations',
            },
            ],
          result: {
              tag: 'positions toutes différentes',
              text: 'si les 3 éléments devaient occuper des positions TOUTES DIFFÉRENTES : $A_4^3=4 \\times 3 \\times 2=24$, strictement moins',
            },
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
            'Entraîne-toi sur les mains de poker à 32 cartes, le paradoxe du Chevalier de Méré, ' +
              'les répartitions en boîtes et les dispositifs à répétition.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 46. Dénombrement combinatoire pur — problèmes »',
        },
      ],
    },

    {
      id: 'probabilitehypergeometrique',
      number: 5,
      title: 'Probabilité hypergéométrique (tirage sans remise)',
      kicker: 'P(k) = C(K,k)×C(N−K,n−k) / C(N,n) — tirage SANS remise',
      blocks: [
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
          ],
        },
        { kind: 'subheading', text: 'Exemple résolu — N=20, K=6, n=5' },
        {
          kind: 'exemple',
          badge: 'P(exactement 2 succès)',
          formula: '',
          steps: [],
          result: {
            tag: 'résultat',
            text:
              '$P(2) = \\dfrac{C_6^2 \\times C_{14}^3}{C_{20}^5} = \\dfrac{15 \\times 364}{15\\,504} ' +
              '= \\dfrac{5460}{15\\,504} \\approx 0,352$',
          },
        },
        {
          kind: 'featureTable',
          headers: ['k', 'C(6,k)', 'C(14,5−k)', 'P(k)'],
          rows: [
            ['0', '1', '2002', '0,1292'],
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
            'des 6 fractions vaut $\\dfrac{15\\,504}{15\\,504}=1$. Additionner les arrondis à 4 ' +
            "décimales de chaque ligne peut donner 1,0001 par accumulation d'arrondis — ce " +
            "n'est jamais, en soi, le signe d'une erreur.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: 'k=0', value: 0.1292, valueLabel: '0,1292' },
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
              'Distribution de $P(k)$ pour $N=20$, $K=6$, $n=5$ : maximum en $k=1$ (0,3874), ' +
              'juste devant $k=2$ (0,3522) — les 6 valeurs somment à 1.',
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
                  { label: 'R', prob: '5/10', tone: 'accent' },
                  { label: 'R', prob: '4/9', tone: 'accent' },
                  { label: 'B', prob: '5/8', tone: 'good' },
                ],
                resultLabel: '= 5/36',
              },
              {
                label: 'R–B–R',
                steps: [
                  { label: 'R', prob: '5/10', tone: 'accent' },
                  { label: 'B', prob: '5/9', tone: 'good' },
                  { label: 'R', prob: '4/8', tone: 'accent' },
                ],
                resultLabel: '= 5/36',
              },
              {
                label: 'B–R–R',
                steps: [
                  { label: 'B', prob: '5/10', tone: 'good' },
                  { label: 'R', prob: '5/9', tone: 'accent' },
                  { label: 'R', prob: '4/8', tone: 'accent' },
                ],
                resultLabel: '= 5/36',
              },
            ],
            bracketLabel: ['3 séquences', 'équiprobables'],
            footer: 'composition « 2 rouges, 1 bleue », ordre libre : 3 × 5/36 = 5/12',
            caption:
              'Urne à 5 rouges / 5 bleues, 3 tirages sans remise : les 3 séquences menant à ' +
              '« 2 rouges, 1 bleue » ont chacune la même probabilité $\\frac{5}{36}$ ; leur somme ' +
              'donne la composition, $\\frac{5}{12}$.',
          },
        },
        {
          kind: 'exemple',
          badge: 'urne 5 rouges / 5 bleues, 3 tirages sans remise',
          formula: '',
          steps: [
            {
              tag: 'séquence précise (rouge, rouge, bleue), dans CET ORDRE',
              text: '$\\dfrac{5}{10} \\times \\dfrac{4}{9} \\times \\dfrac{5}{8} = \\dfrac{5}{36} \\approx 0,139$',
            },
            ],
          result: {
              tag: 'composition « 2 rouges et 1 bleue », ORDRE LIBRE — 3 séquences équiprobables (RRB, RBR, BRR)',
              text:
                '$3 \\times \\dfrac{5}{36} = \\dfrac{5}{12} \\approx 0,417 = ' +
                '\\dfrac{C_5^2 \\times C_5^1}{C_{10}^3} = \\dfrac{50}{120}$',
            },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — pourquoi composition = nombre d'arrangements × séquence",
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
                "Nombre d'ordres distincts pour « 2R+1B » : $C_3^2=3$ — **position de la bleue parmi 3**.",
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
        { kind: 'subheading', text: '2 tirages hypergéométriques indépendants — loto + bonus' },
        {
          kind: 'exemple',
          badge: 'loto + bonus',
          formula: 'Grille principale : $N=10$, $K=4$, $n=2$, cocher les 2 bons numéros.',
          steps: [
            {
              tag: 'grille principale',
              text: '$\\dfrac{C_4^2 \\times C_6^0}{C_{10}^2} = \\dfrac{6}{45} = \\dfrac{2}{15}$',
            },
            { tag: 'numéro bonus, INDÉPENDANT (N=5, K=1, n=1)', text: '$\\dfrac{1}{5}$' },
            ],
          result: {
              tag: 'réussir les DEUX (ET indépendant)',
              text: '$\\dfrac{2}{15} \\times \\dfrac{1}{5} = \\dfrac{2}{75} \\approx 0,027$',
            },
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
          kind: 'entrainement',
          title: 'Probabilité hypergéométrique',
          generatorId: '6gen47',
          description: [
            'Entraîne-toi sur les tirages sans remise, la séquence exacte vs la composition, ' +
              'et des tirages hypergéométriques indépendants combinés.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 47. Probabilité hypergéométrique »',
        },
      ],
    },

    {
      id: 'binomialesequence',
      number: 6,
      title: 'Probabilité binomiale et séquence exacte',
      kicker: 'P(X=k) = C(n,k)×pᵏ×(1−p)ⁿ⁻ᵏ',
      blocks: [
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
        { kind: 'subheading', text: 'Exemple résolu — n=6, p=0,4' },
        {
          kind: 'exemple',
          badge: 'P(X=2)',
          formula: '',
          steps: [],
          result: {
            tag: 'résultat',
            text: '$P(X=2) = C_6^2 \\times 0,4^2 \\times 0,6^4 = 15 \\times 0,16 \\times 0,1296 = 0,31104$',
          },
        },
        {
          kind: 'piege',
          text:
            'Oublier $C_6^2=15$ donne $0,4^2 \\times 0,6^4 = 0,020736$, un résultat **15 fois** ' +
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
          headers: ['k', '0', '1', '2', '3', '4', '5', '6'],
          rows: [['P(X=k)', '0,04666', '0,18662', '0,31104', '0,27648', '0,13824', '0,03686', '0,00410']],
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
              'Distribution complète pour $n=6$, $p=0,4$ : les 3 barres en couleur ($k=4,5,6$) ' +
              'forment la région « au moins 4 ».',
          },
        },
        {
          kind: 'exemple',
          badge: 'les 3 stratégies en action',
          formula: '',
          steps: [
            { tag: '« au moins 1 succès » (complément de « aucun »)', text: '$1-P(X=0) = 1-0,046656 = 0,953344$' },
            { tag: '« au plus 5 succès » (complément de « tous »)', text: '$1-P(X=6) = 1-0,004096 = 0,995904$' },
            ],
          result: {
              tag: '« au moins 4 succès » (peu de termes : 3, plus rapide qu\'un complément à 4 termes)',
              text: '$P(4)+P(5)+P(6) = 0,13824+0,036864+0,004096 = 0,1792$',
            },
        },
        {
          kind: 'piege',
          text:
            'Le complémentaire de « au plus 5 » (sur 6) est « tous réussissent » ($X=6$), ' +
            'jamais « aucun » ($X=0$) — et le complémentaire de « au moins 4 » est « au plus ' +
            '3 » ($X=0,1,2$ ou 3, donc 4 termes à retirer), jamais $1-P(X=3)$ qui ne retire ' +
            'qu\'**un seul** terme. Identifie bien le **seuil** exact avant de choisir le ' +
            'complément.',
        },
        {
          kind: 'astuce',
          label: 'La somme de toute la distribution vaut toujours 1',
          text:
            '$P(0)+P(1)+\\ldots+P(6)=1$ quelle que soit la valeur de $p$ — un excellent moyen ' +
            "de vérifier une distribution complète avant de répondre. Ça n'exige pas $p=0,5$ : " +
            "l'équiprobabilité entre les issues n'est jamais requise pour que leur somme fasse 1.",
        },
        { kind: 'subheading', text: 'Séquence exacte, sans remise, éléments distincts' },
        {
          kind: 'definition',
          label: 'Définition — contraste avec la loi binomiale',
          items: [
            '$n$ éléments **tous distincts** : tu en tires $k$ successivement, **sans ' +
              'remise**, dans un **ordre précis** donné à l\'avance. À chaque étape, un seul ' +
              'élément parmi ceux restants correspond à la position exacte demandée : ' +
              '$\\dfrac{1}{n} \\times \\dfrac{1}{n-1} \\times \\ldots \\times \\dfrac{1}{n-k+1}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: '9 lettres distinctes',
          formula: 'Ordre exact pour $k=4$ lettres tirées sans remise :',
          steps: [
            {
              tag: 'k=4',
              text: '$\\dfrac{1}{9} \\times \\dfrac{1}{8} \\times \\dfrac{1}{7} \\times \\dfrac{1}{6} = \\dfrac{1}{3024}$',
            },
            ],
          result: {
              tag: 'k=5 (un tirage de plus à deviner exactement)',
              text: '$\\dfrac{1}{3024} \\times \\dfrac{1}{5} = \\dfrac{1}{15\\,120}$',
            },
        },
        {
          kind: 'piege',
          text:
            'Utiliser $\\frac{1}{n^k}$ (probabilité constante à chaque tirage, comme avec ' +
            "remise) au lieu du produit décroissant est l'erreur classique ! Sans remise, le " +
            "nombre d'éléments restants **diminue** à chaque tirage (9, 8, 7, 6, …) : la " +
            'probabilité de deviner juste change donc à chaque étape.',
        },
        {
          kind: 'astuce',
          label: 'Deux modèles qui ne coïncident jamais en général',
          text:
            'La probabilité binomiale suppose des épreuves **indépendantes** à $p$ constant ' +
            '(avec remise, ou population immense) ; la probabilité de séquence exacte sans ' +
            'remise suppose au contraire que chaque tirage modifie les probabilités suivantes. ' +
            "Augmenter $k$ diminue **toujours** la probabilité d'une séquence exacte sans " +
            'remise (un choix exact de plus à deviner) — rien à voir avec une éventuelle « ' +
            "compensation » entre tirages, qui n'existe pas ici.",
        },
        {
          kind: 'entrainement',
          title: 'Probabilité binomiale et séquence exacte',
          generatorId: '6gen48',
          description: [
            'Entraîne-toi sur la loi binomiale, les trois stratégies (terme unique / somme / ' +
              'complément) et la séquence exacte sans remise.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 48. Probabilité binomiale et séquence exacte »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Arrangement', '$A_n^k=n!/(n-k)!$ — choisir ET ordonner'],
        ['Combinaison', '$C_n^k=A_n^k/k!$ — choisir SEULEMENT'],
        ['Diagonales polygone', '$D(n)=n(n-3)/2$'],
        ['Permutations circulaires', 'table $(n-1)!$ ; collier $(n-1)!/2$'],
        ['Multinomiale', '$n!/(n_1!n_2!\\ldots n_k!)$ — groupes nommés de tailles fixées'],
        ['ET indépendant / OU exclusif', 'ET → multiplier ; OU exclusif (disjoint) → additionner'],
        ['Exclusion / couple indissociable', 'total − (les deux ensemble) ; (les deux ensemble)+(les deux absents)'],
        ['Binôme de Newton', '$(a+b)^n=\\sum C_n^ka^{n-k}b^k$'],
        ['Triangle de Pascal', '$C_n^k=C_{n-1}^{k-1}+C_{n-1}^k$ ; symétrie ; somme de ligne $=2^n$'],
        ['Loi hypergéométrique', '$P(k)=C_K^kC_{N-K}^{n-k}/C_N^n$ — tirage SANS remise'],
        ['Séquence vs composition', 'séquence = 1 ordre précis ; composition = tous les ordres, formule hypergéométrique'],
        ['Loi binomiale', '$P(X=k)=C_n^kp^k(1-p)^{n-k}$ — épreuves indépendantes'],
        ['Séquence exacte sans remise', 'produit de fractions décroissantes $1/n \\times 1/(n-1) \\times \\ldots$'],
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
