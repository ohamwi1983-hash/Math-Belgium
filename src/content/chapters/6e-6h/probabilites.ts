import type { ChapterContent } from '../../types'

export const probabilites: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 6,
  title: 'Les probabilités',
  slug: 'probabilites',
  lede:
    "Mesurer la chance qu'un événement se produise. Combiner plusieurs événements (union, " +
    'intersection, complémentaire). Tenir compte d\'une info déjà connue (conditionnement). ' +
    'Remonter d\'un effet à sa cause la plus probable (théorème de Bayes). Quatre outils, un ' +
    'seul chapitre.',

  sections: [
    {
      id: 'probabilitesensembles',
      number: 1,
      title: 'Probabilités et ensembles',
      kicker: '0 ≤ P(A) ≤ 1 — équiprobabilité : favorables / possibles',
      blocks: [
        { kind: 'video', title: 'Probabilités et ensembles (1/3) — expérience aléatoire, événement, fréquence', youtubeId: 'N1kfU7qjA4o' },
        { kind: 'video', title: 'Probabilités et ensembles (2/3) — Venn, union, tableau à double entrée', youtubeId: 'pZ-1sVqPrVM' },
        { kind: 'video', title: 'Probabilités et ensembles (3/3) — probabilité conditionnelle et indépendance', youtubeId: '6xOx49Y-Clk' },
        {
          kind: 'intuition',
          label: 'Pour visualiser une expérience aléatoire',
          text:
            'Imagine un sac opaque rempli de billes de couleurs différentes. Tu ne sais jamais ' +
            'à l\'avance quelle bille tu vas tirer — mais tu sais très bien quelles couleurs ' +
            'sont dans le sac. C\'est exactement ça, une expérience aléatoire : tu connais ' +
            'toutes les issues possibles, sans savoir laquelle va sortir.',
        },
        {
          kind: 'definition',
          label: 'Définition — expérience aléatoire',
          items: [
            'Une expérience aléatoire, tu peux la répéter autant de fois que tu veux, dans les ' +
              'mêmes conditions. Tu connais à l\'avance **tous** les résultats possibles — mais ' +
              'jamais lequel va sortir, à cause du hasard. Chacun de ces résultats possibles est ' +
              'une issue ; l\'ensemble de toutes les issues s\'appelle l\'univers, noté ' +
              '$\\Omega$. L\'issue que tu observes réellement, à la fin de l\'expérience, est ' +
              'le résultat obtenu.',
          ],
        },
        {
          kind: 'definition',
          label: 'Événement, et cas particuliers',
          items: [
            'Un événement, c\'est n\'importe quel sous-ensemble de $\\Omega$ — souvent décrit ' +
              'par une phrase, réalisée dès que le résultat obtenu lui est favorable. Un ' +
              'événement réduit à **un seul** résultat est un événement élémentaire. L\'événement ' +
              'impossible ($\\emptyset$) ne se réalise jamais ; l\'événement certain ($\\Omega$) ' +
              'se réalise toujours. Deux événements qui se partagent **tous** les résultats ' +
              'possibles, sans en avoir aucun en commun, sont des événements contraires : le ' +
              'contraire de $A$ se note $\\bar{A}$, avec $A \\cup \\bar{A} = \\Omega$ et ' +
              '$A \\cap \\bar{A} = \\emptyset$.',
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — probabilité',
          items: [
            '$P(A)$ mesure la chance que $A$ se réalise : $0 \\leq P(A) \\leq 1$, ' +
              '$P(\\Omega)=1$ (certitude), $P(\\emptyset)=0$ (impossibilité), ' +
              '$P(\\bar{A})=1-P(A)$ (contraire). En situation d\'**équiprobabilité** (tous les ' +
              'résultats également probables), c\'est simple : $P(A)$ = (nombre de cas ' +
              'favorables) / (nombre de cas possibles).',
          ],
        },
        {
          kind: 'piege',
          label: "Piège classique — vérifier l'équiprobabilité avant de compter",
          text:
            'Au lancer de 2 dés, $\\Omega=\\{2,3,\\ldots,12\\}$ (les 11 sommes possibles) — mais ' +
            'ces 11 résultats **ne sont pas** équiprobables ! Un total de 2 ne s\'obtient que par ' +
            '(1;1), une seule façon sur 36. Un total de 9 s\'obtient par (3;6), (4;5), (5;4), ' +
            '(6;3) — 4 façons. $P$(total=9) $= \\frac{4}{36}$ est donc **plus grande** que ' +
            '$P$(total=2) $= \\frac{1}{36}$, et aucune des deux ne vaut $\\frac{1}{11}$. La formule ' +
            '« favorables/possibles » n\'est valable **que** si les résultats sont équiprobables — ' +
            'toujours à vérifier avant de compter.',
        },
        {
          kind: 'historique',
          titre: 'Des jeux de dés qui ont fondé toute une science',
          text:
            'Vers 1620, des joueurs florentins interrogent **Galilée** : avec 3 dés, les sommes 9 ' +
            'et 10 s\'écrivent chacune de 6 façons (sans tenir compte de l\'ordre), et pourtant ' +
            'le 10 sort plus souvent. Galilée compte les 216 triplets **ordonnés** (1er, 2e, 3e ' +
            'dé) : 25 donnent 9, 27 donnent 10 — exactement le piège ci-dessus, les décompositions ' +
            'n\'étant pas équiprobables. En 1654, le chevalier de Méré, un joueur passionné, pose à ' +
            '**Blaise Pascal** deux questions : pourquoi parier sur « au moins un 6 en 4 lancers ' +
            'd\'un dé » le fait gagner, alors que « au moins un double six en 24 lancers de deux ' +
            'dés », qu\'il croyait équivalent, le fait perdre (résolu en section 4) ? Et comment ' +
            'partager équitablement la mise d\'une partie interrompue avant la fin (le « problème ' +
            'des partis ») ? Pascal en discute par lettres avec **Pierre de Fermat** : leur ' +
            'correspondance de 1654 est aujourd\'hui considérée comme l\'acte de naissance de la ' +
            'théorie des probabilités comme discipline mathématique rigoureuse. Leur idée ' +
            'centrale : compter soigneusement **toutes** les issues équiprobables, sans en oublier ' +
            'ni en recompter aucune.',
          image: {
            src: '/images/historique/pascal.jpg',
            alt: 'Portrait de Blaise Pascal',
            caption: 'Blaise Pascal (1623–1662), portrait conservé au château de Versailles.',
          },
        },
        {
          kind: 'para',
          text:
            'Le comptage de Galilée, avec les 216 triplets ordonnés de 3 dés équilibrés :',
        },
        {
          kind: 'featureTable',
          headers: ['Somme', 'Décompositions (sans ordre)', 'Triplets ordonnés', 'Probabilité'],
          rows: [
            ['9', '1+2+6, 1+3+5, 1+4+4, 2+2+5, 2+3+4, 3+3+3', '6+6+3+3+6+1 = 25', '$\\frac{25}{216} \\approx 0{,}116$'],
            ['10', '1+3+6, 1+4+5, 2+2+6, 2+3+5, 2+4+4, 3+3+4', '6+6+3+6+3+3 = 27', { text: '$\\frac{27}{216} = 0{,}125$', tone: 'good' }],
          ],
        },
        { kind: 'subheading', text: 'Probabilité expérimentale (fréquentielle) et probabilité théorique (a priori)' },
        {
          kind: 'definition',
          label: 'Deux façons d\'obtenir une probabilité',
          items: [
            'La probabilité théorique (ou a priori) se calcule **sans** rien expérimenter, à ' +
              'partir d\'un modèle — le plus souvent un raisonnement d\'équiprobabilité (comme ' +
              'ci-dessus). La probabilité expérimentale (ou fréquentielle) fonctionne à l\'inverse ' +
              ': tu répètes l\'expérience un très grand nombre de fois, et la **fréquence** ' +
              'relative de l\'événement se stabilise autour d\'une valeur — c\'est cette valeur ' +
              'que tu retiens comme probabilité.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'frequencyStabilization',
            frequencies: [
              0.7, 0.55, 0.5, 0.575, 0.56, 0.567, 0.557, 0.55, 0.522, 0.49, 0.5, 0.508, 0.508,
              0.493, 0.487, 0.469, 0.476, 0.472, 0.474, 0.485, 0.5, 0.5, 0.487, 0.496, 0.5, 0.504,
            ],
            step: 10,
            target: { value: 0.5, label: '0,5' },
            yMin: 0.3,
            yMax: 0.75,
            xTicks: [50, 100, 150, 200, 250],
            xAxisLabel: 'nombre de répétitions',
            yAxisLabel: 'fréquence',
            caption:
              '26 élèves répètent chacun 10 fois « lancer une pièce » : la fréquence cumulée de ' +
              '« pile » oscille de moins en moins et se stabilise près de 0,5.',
          },
        },
        {
          kind: 'astuce',
          label: 'Les deux méthodes doivent converger',
          text:
            'Pour une pièce ou un dé bien équilibrés, la probabilité théorique (1/2, 1/6, …) et ' +
            'la probabilité expérimentale (mesurée en répétant l\'expérience) convergent vers ' +
            'la même valeur. C\'est même comme ça qu\'on détecte un dé ou une pièce truqués : ' +
            'la fréquence observée ne se stabilise **pas** autour de la valeur théorique attendue.',
        },
        {
          kind: 'definition',
          label: 'Loi des grands nombres et fluctuation',
          items: [
            'Plus on répète l\'expérience, plus la fréquence observée a de chances d\'être proche ' +
              'de la probabilité : c\'est la **loi des grands nombres**, démontrée par Jacob ' +
              'Bernoulli (section 4). Mais la fréquence ne tombe jamais pile sur la probabilité : ' +
              'elle **fluctue** d\'une série d\'essais à l\'autre.',
            'Cette fluctuation diminue lentement : l\'écart typique entre la fréquence et la ' +
              'probabilité est proportionnel à $\\frac{1}{\\sqrt{n}}$, où $n$ est le nombre ' +
              'd\'essais. Pour diviser cet écart par 2, il faut 4 fois plus d\'essais ; pour le ' +
              'diviser par 10, 100 fois plus. Un petit écart sur 10 000 lancers est donc bien ' +
              'plus inquiétant que le même écart sur 60 lancers.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'ce dé est-il truqué ?',
          formula:
            'On lance un dé 600 fois et on obtient 130 fois le 6. Règle de décision : l\'écart ' +
            'entre une fréquence $f$ et une probabilité $p$ est jugé significatif quand l\'écart ' +
            'relatif $\\frac{|f-p|}{p}$ dépasse 50 % pour moins de 100 essais, 25 % de 100 à 400 ' +
            'essais, 18 % de 401 à 1 000 essais, et 12 % au-delà.',
          steps: [
            { tag: 'modèle', text: 'Dé équilibré : $p = \\frac{1}{6}$.' },
            { tag: 'fréquence', text: '$f = \\frac{130}{600} = \\frac{13}{60} \\approx 0{,}217$.' },
            {
              tag: 'écart relatif',
              text:
                '$\\frac{|f-p|}{p} = \\frac{\\frac{13}{60}-\\frac{10}{60}}{\\frac{10}{60}} = ' +
                '\\frac{3}{10} = 30\\,\\%$, supérieur au seuil de 18 % pour 600 essais.',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              'L\'écart est significatif : ce dé est très probablement truqué. Avec 13 fois le 6 ' +
              'sur seulement 60 lancers — exactement la même fréquence —, l\'écart relatif vaut ' +
              'encore 30 %, mais il reste sous le seuil de 50 % : on ne peut rien conclure, la ' +
              'fluctuation suffit à l\'expliquer.',
          },
        },
        {
          kind: 'application',
          titre: 'Pourquoi la météo annonce « 70 % de chances de pluie »',
          image: {
            src: '/images/application/meteo-radar.jpg',
            alt: 'Station météorologique avec pluviomètre et radar Doppler',
            caption:
              'Pluviomètre et radar Doppler à un bureau du National Weather Service (États-Unis) — ' +
              'le type de données historiques utilisées pour calculer une probabilité de pluie. ' +
              'Photo : Famartin, CC BY-SA 4.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'frequencyStabilization',
              frequencies: [0.85, 0.65, 0.75, 0.68, 0.73, 0.69, 0.71, 0.7, 0.705, 0.698],
              step: 20,
              target: { value: 0.7, label: '70 %' },
              yMin: 0.5,
              yMax: 0.95,
              xAxisLabel: 'journées historiques comparées',
              yAxisLabel: 'fréquence de pluie',
              caption: 'La fréquence de pluie observée sur des journées historiques comparables, relevée tous les 20 jours, se stabilise près de 70 % — exactement le même principe que la stabilisation étudiée plus haut.',
            },
            {
              kind: 'complementBar',
              headline: '100 journées historiques comparables',
              parts: [
                { fraction: 0.7, label: 'il a plu (70 jours)', tone: 'accent' },
                { fraction: 0.3, label: 'pas de pluie (30 jours)', tone: 'faint' },
              ],
              footer: '0,70 + 0,30 = 1',
              caption: 'Le « 70 % » annoncé est littéralement ce comptage : la fréquence de pluie parmi les journées passées qui ressemblaient à celle de demain.',
            },
          ],
          text:
            'Quand un bulletin météo annonce « 70 % de chances de pluie demain », ce ' +
            'chiffre n\'est presque jamais une probabilité théorique calculée par un ' +
            'raisonnement d\'équiprobabilité — il n\'y a pas de « cas favorables » à ' +
            'compter pour la pluie ! C\'est une probabilité **expérimentale** (fréquentielle), ' +
            'exactement comme celle de cette section : les services météorologiques ' +
            'recherchent, dans leurs immenses bases de données historiques, toutes les ' +
            'journées passées où les conditions atmosphériques (pression, humidité, ' +
            'température, vents) ressemblaient à celles prévues pour demain, puis ' +
            'calculent la **fréquence** à laquelle il a réellement plu ce jour-là. Plus la ' +
            'base de données est grande et les situations comparées précisément, plus ' +
            'cette fréquence s\'approche de la vraie probabilité — exactement le principe ' +
            'de stabilisation de la fréquence que tu viens de voir. Aujourd\'hui, ce chiffre ' +
            'vient aussi souvent d\'une **prévision d\'ensemble** : le modèle météo est lancé ' +
            'une cinquantaine de fois, avec des conditions de départ très légèrement ' +
            'différentes ; si 35 des 50 simulations donnent de la pluie, on annonce ' +
            '35/50 = 70 %. C\'est encore une fréquence, mais calculée sur des simulations.',
          domaines: ['Météorologie', 'Statistique'],
        },
        { kind: 'subheading', text: 'Représenter A∪B et A∩B' },
        {
          kind: 'illustrationGroup',
          items: [
            { kind: 'vennDiagram', labelA: 'A', labelB: 'B', mode: 'highlightUnion', caption: '« A ou B » = $A \\cup B$ : réalisé dès que l\'**un au moins** des deux se réalise.' },
            { kind: 'vennDiagram', labelA: 'A', labelB: 'B', mode: 'highlightIntersection', caption: '« A et B » = $A \\cap B$ : réalisé seulement si les **deux** se réalisent en même temps.' },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vennDiagram',
            labelA: 'A',
            labelB: 'B',
            mode: 'counts',
            counts: { aOnly: '12', both: '6', bOnly: '9', neither: '13' },
            caption: 'Groupe de 40 personnes, $n(A)$=18, $n(B)$=15, $n(A \\cap B)$=6 : les 4 régions se partagent les 40 personnes sans chevauchement.',
          },
        },
        {
          kind: 'definition',
          label: 'Union, intersection, inclusion-exclusion',
          items: ['$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$'],
        },
        {
          kind: 'para',
          text:
            'Tu additionnes les deux probabilités, puis tu **retires** l\'intersection — sinon elle ' +
            'est comptée deux fois (une fois dans $P(A)$, une fois dans $P(B)$). Cas ' +
            'particulier : si $A$ et $B$ sont **incompatibles** ($P(A \\cap B)=0$), la formule se ' +
            'simplifie en loi de la somme : $P(A \\cup B)=P(A)+P(B)$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi retirer l\'intersection',
          blocks: [
            {
              kind: 'para',
              text:
                'Tout élément de $A$ est soit dans $B$, soit pas : $A = (A \\cap \\bar{B}) \\cup ' +
                '(A \\cap B)$, une union disjointe. Les probabilités s\'additionnent pour une ' +
                'union disjointe, donc $P(A) = P(A \\cap \\bar{B}) + P(A \\cap B)$.',
            },
            {
              kind: 'para',
              text:
                'Par symétrie, $P(B) = P(\\bar{A} \\cap B) + P(A \\cap B)$. Et ' +
                '$A \\cup B = (A \\cap \\bar{B}) \\cup (\\bar{A} \\cap B) \\cup (A \\cap B)$ — ' +
                'trois morceaux disjoints — donc $P(A \\cup B) = P(A \\cap \\bar{B})+P(\\bar{A} \\cap B)+P(A \\cap B)$.',
            },
            {
              kind: 'para',
              text:
                'En ajoutant les deux égalités précédentes : $P(A)+P(B) = [P(A \\cap \\bar{B})+P(A ' +
                '\\cap B)] + [P(\\bar{A} \\cap B)+P(A \\cap B)]$. Le terme $P(A \\cap B)$ ' +
                'apparaît deux fois — il faut donc le retrancher une fois pour retomber ' +
                'exactement sur $P(A \\cup B)$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'inclusion-exclusion sur 40 personnes',
          formula: 'Dans un groupe de 40 personnes, $n(A)$=18, $n(B)$=15, $n(A \\cap B)$=6 :',
          steps: [],
          result: { tag: 'résultat', text: '$P(A \\cup B) = \\frac{18}{40} + \\frac{15}{40} - \\frac{6}{40} = \\frac{27}{40}$' },
        },
        {
          kind: 'piege',
          text:
            'Additionner $P(A)+P(B)$ **sans** retirer $P(A \\cap B)$ donne 33/40 ici — **faux** ! Les 6 ' +
            'personnes de l\'intersection sont comptées deux fois. La bonne valeur reste 27/40.',
        },
        { kind: 'subheading', text: 'Tableau à double entrée et complémentaire' },
        {
          kind: 'methode',
          label: 'Méthode — remplir les 4 cases',
          items: [
            'À partir de $n(A)$, $n(B)$, $n(A \\cap B)$ et du total $N$, les 4 régions se ' +
              'déduisent par soustraction : $n(A \\cap \\bar{B})=n(A)-n(A \\cap B)$, ' +
              '$n(\\bar{A} \\cap B)=n(B)-n(A \\cap B)$, $n(\\bar{A} \\cap \\bar{B})=N-n(A \\cup B)$.',
            'Avec l\'exemple ci-dessus : $n(A \\cap \\bar{B})$=12, $n(\\bar{A} \\cap B)$=9, ' +
              '$n(A \\cap B)$=6, $n(\\bar{A} \\cap \\bar{B})$=40−27=13 — la somme des 4 cases, ' +
              '12+9+6+13=40, retombe bien sur le total. Le tableau à double entrée range ces 9 ' +
              'valeurs d\'un coup : 4 viennent directement de l\'énoncé (6, 15, 18, 40) et ' +
              'restent en noir, les 5 autres se déduisent par soustraction et sont mises en évidence.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', 'B', 'B̄', 'Total'],
          rows: [
            ['A', '6', { text: '12', tone: 'good' }, '18'],
            ['Ā', { text: '9', tone: 'good' }, { text: '13', tone: 'good' }, { text: '22', tone: 'good' }],
            ['Total', '15', { text: '25', tone: 'good' }, '40'],
          ],
        },
        {
          kind: 'piege',
          text:
            'La case « ni $A$ ni $B$ » vaut $1-P(A \\cup B)$, **jamais** $1-P(A)-P(B)$ — cette ' +
            'dernière formule oublie que $A$ et $B$ se chevauchent ! Ici : 1−27/40=13/40, pas ' +
            '1−18/40−15/40=7/40.',
        },
        {
          kind: 'atelier',
          tag: 'venn-double-entree-widget',
          label: 'Manipule toi-même : les deux pièges du tableau',
          caption:
            'Fais glisser n(A), n(B) et n(A∩B) (sur N=40 personnes, comme l\'exemple) : le ' +
            'tableau à double entrée se remplit en direct, avec le calcul correct ET le calcul ' +
            'fauté affichés côte à côte pour les deux pièges ci-dessus.',
        },
        {
          kind: 'intuition',
          label: 'Conditionner, c\'est zoomer',
          text:
            '$P(A|B)$, c\'est zoomer sur le seul monde où $B$ est déjà vrai : tu oublies ' +
            'temporairement tout le reste de $\\Omega$, et tu recalcules une proportion ' +
            '**à l\'intérieur** de $B$ uniquement. C\'est exactement ce qui change entre $P(A)$ et ' +
            '$P(A|B)$ — le dénominateur passe du total $N$ au seul total de $B$.',
        },
        {
          kind: 'methode',
          label: 'Probabilité conditionnelle',
          items: [
            'La probabilité de $A$ **sachant** $B$ (tu sais déjà que $B$ est réalisé) se note ' +
              '$P(A|B)$ : $P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}$.',
            'Avec l\'exemple : $P(A|B)$ = 6/15 = 0,4, alors que $P(B|A)$ = 6/18 = 1/3. Le ' +
              'numérateur est le même — mais pas le dénominateur !',
          ],
        },
        {
          kind: 'piege',
          text:
            '$P(A|B) \\neq P(B|A)$ en général ! Confondre les deux sens de conditionnement, ' +
            'c\'est **l\'erreur** la plus fréquente de tout ce chapitre — elle revient dans chaque section.',
        },
        { kind: 'subheading', text: 'Indépendance' },
        {
          kind: 'intuition',
          label: 'B ne change pas la proportion de A',
          text:
            'Dans un jeu de 52 cartes, les cœurs représentent $\\frac{13}{52} = \\frac{1}{4}$ du ' +
            'jeu. Zoome maintenant sur les seules figures (12 cartes) : 3 sont des cœurs, soit ' +
            'encore $\\frac{3}{12} = \\frac{1}{4}$. Savoir que la carte est une figure ne change ' +
            '**pas** la proportion de cœurs : c\'est exactement ça, l\'indépendance. Conditionner ' +
            'par $B$ (zoomer sur $B$) laisse la probabilité de $A$ inchangée, $P(A|B) = P(A)$ ; ' +
            'en multipliant par $P(B)$, on obtient la forme pratique $P(A \\cap B) = P(A) \\times P(B)$.',
        },
        {
          kind: 'definition',
          label: 'Définition — événements indépendants',
          items: [
            '$A$ et $B$ sont indépendants si $P(A \\cap B) = P(A) \\times P(B)$. Lorsque ' +
              '$P(B) > 0$, c\'est équivalent à $P(A|B) = P(A)$ : savoir que $B$ est réalisé ne ' +
              'change pas la probabilité de $A$.',
            'Dans l\'exemple des 40 personnes : $P(A) \\times P(B)$ = 0,45×0,375 = 0,16875, ' +
              'différent de $P(A \\cap B)$=0,15 — $A$ et $B$ ne sont donc **pas** indépendants ici.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les trois écritures de l\'indépendance sont équivalentes',
          blocks: [
            {
              kind: 'para',
              text:
                'Supposons $P(B) > 0$ et $P(A|B) = P(A)$. Par définition de la probabilité ' +
                'conditionnelle, $\\dfrac{P(A \\cap B)}{P(B)} = P(A)$ ; en multipliant les deux ' +
                'membres par $P(B)$ : $P(A \\cap B) = P(A) \\times P(B)$. Réciproquement, si ' +
                '$P(A \\cap B) = P(A) \\times P(B)$, diviser par $P(B) > 0$ redonne $P(A|B) = P(A)$.',
            },
            {
              kind: 'para',
              text:
                'Le même calcul, mené cette fois avec $P(A) > 0$ en isolant $P(B|A)$, montre que ' +
                '$P(A \\cap B)=P(A) \\times P(B)$ équivaut aussi à $P(B|A)=P(B)$. Les trois ' +
                'égalités — $P(A|B)=P(A)$, $P(A \\cap B)=P(A) \\times P(B)$, $P(B|A)=P(B)$ — sont ' +
                'donc équivalentes dès que $P(A)$ et $P(B)$ ne sont pas nulles : n\'importe laquelle ' +
                'peut servir à vérifier l\'indépendance. C\'est la 2e forme qui sert de ' +
                '**définition**, car elle garde un sens même quand $P(A)$ ou $P(B)$ vaut 0 (les deux ' +
                'autres exigeraient alors une division par 0, impossible).',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'jeu de 52 cartes : cœur et figure',
          formula:
            '$A$ = « tirer un cœur » ($P(A)$=13/52), $B$ = « tirer une figure » ($P(B)$=12/52). ' +
            'Il y a exactement 3 figures de cœur, donc $P(A \\cap B)$=3/52.',
          steps: [{ tag: 'test d\'indépendance', text: '$P(A) \\times P(B) = \\frac{13}{52} \\times \\frac{12}{52} = \\frac{3}{52} = P(A \\cap B)$' }],
          result: { tag: 'résultat', text: '$A$ et $B$ **sont** indépendants — un résultat que seul le calcul confirme, jamais l\'intuition.' },
        },
        {
          kind: 'piege',
          label: 'Piège classique — incompatibilité ≠ indépendance',
          text:
            'Deux événements **incompatibles** ($A \\cap B=\\emptyset$, ils ne peuvent jamais se ' +
            'produire ensemble) et de probabilités non nulles ne sont **jamais** indépendants ! ' +
            '$P(A \\cap B)$=0 alors que $P(A) \\times P(B)>0$ : l\'égalité échoue toujours. Les ' +
            'événements $A \\cap \\bar{B}$ et $\\bar{A} \\cap B$, par exemple, sont **toujours** ' +
            'incompatibles (un élément ne peut pas à la fois appartenir à $A$ et ne pas y ' +
            'appartenir) — donc jamais indépendants non plus, dès qu\'ils sont tous deux de ' +
            'probabilités non nulles. Incompatibilité et indépendance sont deux notions bien ' +
            'distinctes, jamais équivalentes.',
        },
        {
          kind: 'para',
          text: 'Pour ne plus confondre les deux notions :',
        },
        {
          kind: 'featureTable',
          headers: ['', 'Incompatibles', 'Indépendants'],
          rows: [
            ['Définition', '$A$ et $B$ ne peuvent pas se produire ensemble', 'savoir que $B$ est réalisé ne change pas la probabilité de $A$'],
            ['Test', '$A \\cap B = \\emptyset$, donc $P(A \\cap B) = 0$', '$P(A \\cap B) = P(A) \\times P(B)$'],
            ['Image (Venn)', 'deux disques séparés', 'deux disques qui se chevauchent, dans la proportion exacte $P(A) \\times P(B)$'],
            ['Exemple', 'deux dés : « somme = 3 » et « dés égaux »', 'jeu de 52 cartes : « cœur » et « figure »'],
            ['Piège', 'de probabilités non nulles, ils ne sont jamais indépendants', 'se vérifie par un calcul, jamais à l\'intuition'],
          ],
        },
        {
          kind: 'astuce',
          label: 'L\'indépendance se vérifie, elle ne se devine jamais',
          text:
            'Pour savoir si deux événements sont indépendants, compare toujours **numériquement** ' +
            '$P(A \\cap B)$ et $P(A) \\times P(B)$ — jamais à une simple impression. L\'exemple ' +
            'des cartes ci-dessus est justement un cas où l\'intuition ne suffit pas.',
        },
        {
          kind: 'entrainement',
          title: 'Probabilités et ensembles',
          generatorId: '6gen30',
          description: ['Combine union, intersection, complémentaire et tableau à double entrée sur des situations variées.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 30. Probabilités et ensembles »',
        },
        {
          kind: 'entrainement',
          title: 'Fréquence et probabilité',
          generatorId: '6gen75',
          description: [
            'Confronte un modèle à des données simulées : dé équilibré ou truqué, somme de deux dés, ' +
              'objet sans modèle a priori dont la probabilité ne peut qu\'être estimée par une fréquence.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 75. Fréquence et probabilité »',
        },
      ],
    },

    {
      id: 'tiragesarbres',
      number: 2,
      title: 'Tirages, arbres et dénombrement',
      kicker: 'chemin → produit ; événement (plusieurs chemins) → somme',
      blocks: [
        { kind: 'video', title: 'Tirages, arbres et dénombrement — arbres pondérés, permutations, dérangements', youtubeId: 'XHiFlN4Onjc' },
        {
          kind: 'definition',
          label: 'Définition — arbre pondéré',
          items: [
            'Un arbre pondéré représente une suite d\'épreuves : chaque branche porte la ' +
              'probabilité de passer d\'un nœud à l\'autre. Deux règles suffisent pour le lire : ' +
              'la probabilité d\'un **chemin**, c\'est le produit des probabilités des branches ' +
              'traversées ; la probabilité d\'un **événement**, c\'est la somme des probabilités ' +
              'des chemins qui y mènent (loi des probabilités totales).',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'weightedTree',
            firstLevel: [
              { label: 'R', prob: '5/8' },
              { label: 'B', prob: '3/8' },
            ],
            secondLevel: [
              { fromFirst: 0, label: 'R', prob: '4/7', pathProb: '20/56' },
              { fromFirst: 0, label: 'B', prob: '3/7', pathProb: '15/56' },
              { fromFirst: 1, label: 'R', prob: '5/7', pathProb: '15/56' },
              { fromFirst: 1, label: 'B', prob: '2/7', pathProb: '6/56' },
            ],
            caption:
              'Urne à 5 boules rouges, 3 bleues (8 au total), 2 tirages successifs SANS remise : la composition change après le 1er tirage.',
          },
        },
        {
          kind: 'piege',
          text:
            'La probabilité d\'un **chemin** s\'obtient en **multipliant** les probabilités des ' +
            'branches, jamais en les additionnant ! C\'est l\'inverse pour la probabilité d\'un ' +
            '**événement** (plusieurs chemins) : elle s\'obtient en **additionnant**.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi on multiplie le long d\'un chemin',
          blocks: [
            {
              kind: 'para',
              text:
                'Sur un arbre à deux étages, la 1re branche d\'un chemin porte $P(A)$. La 2e branche ' +
                'part du nœud $A$ : elle porte la probabilité de $B$ **sachant** que $A$ est déjà ' +
                'réalisé, c\'est-à-dire $P(B|A)$ (section 1). Par définition de la probabilité ' +
                'conditionnelle, $P(B|A) = \\dfrac{P(A \\cap B)}{P(A)}$ ; en multipliant les deux ' +
                'membres par $P(A)$ : $P(A \\cap B) = P(A) \\times P(B|A)$. La probabilité du chemin ' +
                'est bien le produit de ses deux branches.',
            },
            {
              kind: 'para',
              text:
                'Avec un 3e étage, la même définition, appliquée à $C$ sachant $A \\cap B$, donne ' +
                '$P(A \\cap B \\cap C) = P(A \\cap B) \\times P(C|A \\cap B) = P(A) \\times P(B|A) ' +
                '\\times P(C|A \\cap B)$ : chaque étage ajoute un facteur, quelle que soit la ' +
                'profondeur de l\'arbre.',
            },
            {
              kind: 'para',
              text:
                'Contrôle par dénombrement sur l\'urne ci-dessus (5 rouges, 3 bleues, sans remise) : ' +
                'il y a $8 \\times 7 = 56$ tirages ordonnés équiprobables, dont $5 \\times 4 = 20$ ' +
                'donnent rouge puis rouge. Donc $P(RR) = \\dfrac{20}{56}$, exactement ' +
                '$\\dfrac{5}{8} \\times \\dfrac{4}{7}$ : le produit des deux branches.',
            },
            {
              kind: 'para',
              text:
                'Enfin, deux chemins différents se séparent forcément à un étage : ils sont ' +
                '**incompatibles**. La probabilité d\'un événement atteint par plusieurs chemins est donc ' +
                'la **somme** des probabilités de ces chemins — la seconde règle de lecture de l\'arbre.',
            },
          ],
        },
        { kind: 'subheading', text: 'Avec ou sans remise : tout change' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Avec remise : l\'urne retrouve toujours sa composition initiale — les tirages successifs sont **indépendants**.',
            'Sans remise : la composition change après chaque tirage — les tirages successifs ne sont ' +
              '**pas** indépendants : le résultat du 1er tirage modifie les probabilités du 2e.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux rouges, avec ou sans remise',
          formula: '',
          steps: [
            { tag: 'avec remise', text: '$P(RR) = (5/8)^2 = 25/64$ (indépendance)' },
            { tag: 'sans remise', text: '$P(RR) = (5/8) \\times (4/7) = 5/14$ — au 2e tirage il ne reste que 7 boules, dont 4 rouges' },
          ],
          result: { tag: '', text: '' },
        },
        {
          kind: 'piege',
          text:
            'Utiliser la même probabilité 5/8 au second tirage **sans** remise, comme si de rien ' +
            'n\'était, c\'est l\'erreur la plus fréquente de cette section ! La bonne valeur, ' +
            '4/7, se lit directement sur la 2e branche de l\'arbre.',
        },
        {
          kind: 'methode',
          label: '« Exactement une rouge » — combiner deux chemins',
          items: [
            'Deux chemins de l\'arbre mènent à « exactement une rouge » : $RB$ et $BR$. Sans ' +
              'remise : $P$(exactement 1 rouge) = $P(RB)+P(BR) = \\frac{5}{8} \\times \\frac{3}{7} + ' +
              '\\frac{3}{8} \\times \\frac{5}{7} = \\frac{15}{56}+\\frac{15}{56} = \\frac{15}{28}$.',
            'Et par le complément : $P$(au moins 1 rouge) = $1-P(BB) = 1-6/56 = 25/28$.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Vérifier que les chemins couvrent tout',
          text:
            'La somme des probabilités de **tous** les chemins d\'un arbre vaut toujours 1 (ici, ' +
            'sans remise : 20/56+15/56+15/56+6/56=1). Un excellent moyen de repérer une erreur ' +
            'de calcul avant de répondre !',
        },
        {
          kind: 'application',
          titre: 'Contrôler la qualité d\'une production sans tout casser',
          image: {
            src: '/images/application/production-ampoules.jpg',
            alt: 'Chaîne de production d\'ampoules électriques en usine',
            caption:
              'Chaîne de production d\'ampoules électriques, usines Luma, vers 1960 — ' +
              'exactement le type de production où un test destructif empêche de tout vérifier. ' +
              'Photo : Arbeiderbevegelsens arkiv og bibliotek, CC BY 3.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'weightedTree',
              firstLevel: [
                { label: 'D', prob: '2/20' },
                { label: 'B', prob: '18/20' },
              ],
              secondLevel: [
                { fromFirst: 0, label: 'D', prob: '1/19', pathProb: '2/380' },
                { fromFirst: 0, label: 'B', prob: '18/19', pathProb: '36/380' },
                { fromFirst: 1, label: 'D', prob: '2/19', pathProb: '36/380' },
                { fromFirst: 1, label: 'B', prob: '17/19', pathProb: '306/380', highlight: true },
              ],
              caption: 'Lot de 20 pièces (2 défectueuses D, 18 bonnes B) : échantillon de 2 pièces **sans** remise. Le chemin BB (en évidence) donne P(0 défectueuse)=306/380 ≈ 80,5 %.',
            },
            {
              kind: 'complementBar',
              headline: 'Un lot qui contient 2 pièces défectueuses sur 20',
              parts: [
                { fraction: 306 / 380, label: 'accepté quand même', tone: 'accent' },
                { fraction: 74 / 380, label: 'rejeté', tone: 'faint' },
              ],
              footer: '≈80,5 % + ≈19,5 % = 1',
              caption: 'Règle : le lot est accepté si l\'échantillon de 2 pièces ne contient aucune pièce défectueuse. Ce mauvais lot passe donc le contrôle environ 4 fois sur 5 : c\'est le risque d\'accepter un lot défectueux, que l\'on réduit en prélevant un échantillon plus grand.',
            },
          ],
          text:
            'Une usine ne peut pas tester **tous** les produits qu\'elle fabrique pour vérifier ' +
            'qu\'ils fonctionnent — certains tests sont destructifs (faire éclater une ' +
            'ampoule pour vérifier sa résistance, par exemple), et tester toute la ' +
            'production reviendrait à ne plus rien avoir à vendre ! Les ingénieurs qualité ' +
            'prélèvent donc un échantillon dans un lot, **sans** remise, exactement comme les ' +
            'tirages de cette section, et appliquent une règle de décision fixée à l\'avance : ' +
            'ici, le lot est **accepté si l\'échantillon de 2 pièces ne contient aucune pièce ' +
            'défectueuse**, rejeté sinon. L\'arbre permet alors d\'évaluer le risque de cette ' +
            'règle : un lot qui contient 2 pièces défectueuses sur 20 est accepté quand même avec ' +
            'une probabilité de $\\frac{306}{380} \\approx 80{,}5\\,\\%$ — le contrôle laisse ' +
            'passer ce mauvais lot 4 fois sur 5 ! Avec un échantillon de 4 pièces, ce risque ' +
            'tombe à $\\frac{18}{20} \\times \\frac{17}{19} \\times \\frac{16}{18} \\times ' +
            '\\frac{15}{17} = \\frac{240}{380} \\approx 63\\,\\%$ : choisir la taille de ' +
            'l\'échantillon, c\'est choisir le risque qu\'on accepte de courir.',
          domaines: ['Industrie', 'Contrôle qualité'],
        },
        { kind: 'subheading', text: 'Une autre façon de dénombrer : le diagramme cartésien' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand une expérience combine 2 tirages **indépendants** à résultats numériques (2 dés, ' +
              'par exemple), tu peux représenter les $n \\times m$ issues comme des points ' +
              'd\'une grille : le résultat du 1er tirage en abscisse, celui du 2e en ordonnée. ' +
              'Chaque point de la grille est une issue équiprobable — il suffit alors de ' +
              '**compter** les points qui satisfont la condition cherchée.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'outcomeGrid',
            xMax: 6,
            yMax: 6,
            xAxisLabel: '1er dé',
            yAxisLabel: '2e dé',
            highlighted: [
              { x: 1, y: 4 },
              { x: 2, y: 3 },
              { x: 3, y: 2 },
              { x: 4, y: 1 },
            ],
            caption: 'Les 36 issues du lancer de 2 dés à 6 faces : les 4 points en évidence sont ceux dont la somme vaut 5.',
          },
        },
        {
          kind: 'exemple',
          badge: 'somme 5 avec deux dés',
          formula: '',
          steps: [],
          result: {
            tag: 'résultat',
            text:
              'Sur les 36 couples équiprobables, exactement 4 donnent une somme de 5 : (1;4), ' +
              '(2;3), (3;2), (4;1). D\'où $P$(somme=5) = 4/36 = 1/9.',
          },
        },
        {
          kind: 'exemple',
          badge: 'deux cartes sans remise : la grille perd sa diagonale',
          formula:
            'On tire successivement, sans remise, 2 cartes parmi 6 cartes numérotées de 1 à 6. ' +
            'Le même nombre ne peut plus sortir deux fois : les 6 cases de la diagonale de la ' +
            'grille, (1;1), (2;2), …, (6;6), disparaissent, et il reste $6 \\times 5 = 30$ ' +
            'couples équiprobables.',
          steps: [
            {
              tag: 'somme 7',
              text:
                'Les 6 couples (1;6), (2;5), (3;4), (4;3), (5;2), (6;1) sont tous hors de la ' +
                'diagonale : $P$(somme=7) $= \\frac{6}{30} = \\frac{1}{5}$, contre ' +
                '$\\frac{6}{36} = \\frac{1}{6}$ avec deux dés.',
            },
            {
              tag: 'somme 8',
              text:
                'Avec deux dés, 5 couples donnent 8 : (2;6), (3;5), (4;4), (5;3), (6;2). Sans ' +
                'remise, (4;4) est impossible : $P$(somme=8) $= \\frac{4}{30} = \\frac{2}{15}$, ' +
                'contre $\\frac{5}{36}$ avec deux dés.',
            },
          ],
          result: { tag: '', text: '' },
        },
        { kind: 'subheading', text: 'Dénombrement — permutations et dérangements' },
        {
          kind: 'intuition',
          label: "D'où vient le n! ?",
          text:
            'Range 4 objets dans 4 cases : 4 choix possibles pour la 1re case, puis seulement 3 ' +
            'pour la 2e (un objet est déjà casé), puis 2, puis 1 seul. Au total : ' +
            '$4 \\times 3 \\times 2 \\times 1=24$ façons — c\'est exactement $4!$. Le nombre de ' +
            'choix se réduit d\'une unité à chaque case remplie, jamais l\'inverse.',
        },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Le nombre de façons de ranger $n$ objets distincts (une **permutation**) vaut ' +
              '$n! = n \\times (n-1) \\times \\ldots \\times 1$. Un dérangement, c\'est une ' +
              'permutation où **aucun** objet ne reste à sa place initiale ; leur nombre se note ' +
              '$D(n)$ — et $D(n) \\neq n!$ (par exemple $D(4)$=9, très différent de 4!=24).',
          ],
        },
        {
          kind: 'methode',
          label: 'Compter les dérangements',
          items: [
            'Avec 2 objets, une seule façon : les échanger, $D(2) = 1$. Avec 3 objets, on écrit ' +
              'chaque rangement comme la liste des objets placés en positions 1, 2, 3 : seuls ' +
              '231 et 312 ne laissent aucun objet à sa place, $D(3) = 2$.',
            'Avec 4 objets, les 9 dérangements de 1234 sont : 2143, 2341, 2413, 3142, 3412, ' +
              '3421, 4123, 4312, 4321. Vérifie : dans chacun, le chiffre en position $i$ n\'est ' +
              'jamais $i$.',
            'Au-delà, on utilise la relation $D(n) = (n-1)\\left(D(n-1) + D(n-2)\\right)$ : ' +
              '$D(4) = 3 \\times (2+1) = 9$, $D(5) = 4 \\times (9+2) = 44$, ' +
              '$D(6) = 5 \\times (44+9) = 265$.',
          ],
        },
        {
          kind: 'exemple',
          badge: '4 lettres, 4 enveloppes : dérangements',
          formula: '',
          steps: [
            { tag: 'total', text: '4!=24 répartitions possibles au total' },
            { tag: 'tout correct', text: 'une seule est **entièrement** correcte, donc $P$(tout correct)=1/24' },
            { tag: 'aucune correcte', text: '$P = D(4)/4! = 9/24 = 3/8$' },
            {
              tag: 'exactement 2 correctes',
              text:
                'on énumère les paires de lettres correctement placées — {1;2}, {1;3}, {1;4}, ' +
                '{2;3}, {2;4}, {3;4} : 6 paires. Les 2 lettres restantes doivent alors former ' +
                'un dérangement complet entre elles ($D(2)$=1 façon) : $P=(6 \\times 1)/24=1/4$',
            },
          ],
          result: { tag: '', text: '' },
        },
        {
          kind: 'piege',
          text:
            '« Exactement 3 lettres sur 4 à la bonne place », c\'est structurellement ' +
            '**impossible** (probabilité nulle) ! Si 3 lettres sont bien placées, la 4e l\'est ' +
            'forcément aussi — il ne reste qu\'une seule enveloppe pour une seule lettre.',
        },
        {
          kind: 'para',
          text:
            'Les 24 répartitions des 4 lettres, classées selon le nombre de lettres bien placées. ' +
            'Pour exactement 1 lettre bien placée : 4 choix de cette lettre, puis les 3 autres ' +
            'forment un dérangement, $4 \\times D(3) = 8$ façons.',
        },
        {
          kind: 'featureTable',
          headers: ['Lettres bien placées', '0', '1', '2', '3', '4', 'Total'],
          rows: [
            ['Nombre de répartitions', '9', '8', '6', { text: '0', tone: 'bad' }, '1', '24'],
            ['Probabilité', '$\\frac{9}{24}=\\frac{3}{8}$', '$\\frac{8}{24}=\\frac{1}{3}$', '$\\frac{6}{24}=\\frac{1}{4}$', '$0$', '$\\frac{1}{24}$', '$1$'],
          ],
        },
        {
          kind: 'astuce',
          label: 'Pour aller plus loin — le retour du nombre e',
          text:
            'La probabilité qu\'aucune lettre ne soit bien placée vaut $\\frac{D(n)}{n!}$ : ' +
            '$\\frac{1}{2} = 0{,}5$ pour 2 lettres, $\\frac{2}{6} \\approx 0{,}333$ pour 3, ' +
            '$\\frac{9}{24} = 0{,}375$ pour 4, $\\frac{44}{120} \\approx 0{,}367$ pour 5, ' +
            '$\\frac{265}{720} \\approx 0{,}368$ pour 6 — et elle se stabilise vers ' +
            '$\\frac{1}{e} \\approx 0{,}368$, où $e$ est le nombre du chapitre sur les ' +
            'exponentielles. Que l\'on mélange 6 lettres ou les manteaux de 1 000 invités au ' +
            'vestiaire, la probabilité que personne ne récupère le sien reste d\'environ 37 %.',
        },
        {
          kind: 'entrainement',
          title: 'Tirages, arbres et dénombrement',
          generatorId: '6gen31',
          description: ['Arbres avec ou sans remise, diagrammes cartésiens, permutations et dérangements.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 31. Tirages, arbres et dénombrement »',
        },
      ],
    },

    {
      id: 'independancebayes',
      number: 3,
      title: 'Probabilités totales et théorème de Bayes',
      kicker: 'P(A|B) = P(B|A)×P(A) / P(B)',
      blocks: [
        { kind: 'video', title: 'Indépendance, conditionnement et Bayes — probabilités totales et théorème de Bayes', youtubeId: 'msDT2q5uV7M' },
        {
          kind: 'definition',
          label: 'Définition — partition et loi des probabilités totales',
          items: [
            'Une partition de l\'univers, c\'est une famille d\'événements deux à deux ' +
              '**incompatibles** dont l\'union recouvre l\'univers **entier** — les deux conditions ' +
              'comptent, aucune n\'est optionnelle. Si $B_1,\\ldots,B_n$ forment une partition, ' +
              'la loi des probabilités totales donne, pour tout événement $A$ : ' +
              '$P(A) = \\displaystyle\\sum_{i=1}^{n} P(A|B_i) \\times P(B_i)$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'universePartition',
            parts: ['B₁', 'B₂', 'B₃', 'B₄'],
            universeLabel: 'Ω',
            eventLabel: 'A',
            formulaLabel: 'P(A) = P(A∩B₁) + P(A∩B₂) + P(A∩B₃) + P(A∩B₄)',
            caption:
              'Une partition $B_1,\\ldots,B_4$ de $\\Omega$ : l\'événement $A$ (ombré) traverse ' +
              'les 4 morceaux sans les déborder — sa probabilité totale est la somme de ses 4 tranches.',
          },
        },
        {
          kind: 'piege',
          text:
            'Une partition exige que les événements recouvrent **tout** l\'univers, pas seulement ' +
            'qu\'ils aient une probabilité non nulle. Oublier un morceau de la partition dans ' +
            'la loi des probabilités totales donne un résultat trop petit — sans aucun signal ' +
            'd\'erreur visible !',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'weightedTree',
            firstLevel: [
              { label: 'malade', prob: '0,1' },
              { label: 'non malade', prob: '0,9' },
            ],
            secondLevel: [
              { fromFirst: 0, label: 'T⁺', prob: '0,9', pathProb: '0,09', highlight: true },
              { fromFirst: 0, label: 'T⁻', prob: '0,1', pathProb: '0,01' },
              { fromFirst: 1, label: 'T⁺', prob: '0,2', pathProb: '0,18', highlight: true },
              { fromFirst: 1, label: 'T⁻', prob: '0,8', pathProb: '0,72' },
            ],
            caption:
              'Test médical : P(malade)=0,1, P(T⁺|malade)=0,9, P(T⁺|non malade)=0,2 — les 2 branches menant à T⁺ se combinent.',
          },
        },
        {
          kind: 'exemple',
          badge: 'test médical : probabilités totales',
          formula:
            'Pour un test avec $P(malade)$=0,1, $P(T^+|malade)$=0,9 et $P(T^+|\\text{non malade})$=0,2, ' +
            'la loi des probabilités totales (partition « malade »/« non malade ») donne :',
          steps: [],
          result: { tag: 'résultat', text: '$P(T^+) = 0{,}9 \\times 0{,}1 + 0{,}2 \\times 0{,}9 = 0{,}09+0{,}18 = 0{,}27$' },
        },
        {
          kind: 'definition',
          label: 'Théorème de Bayes',
          items: [
            '$P(A|B) = \\dfrac{P(B|A) \\times P(A)}{P(B)}$. Bayes permet de **retourner** un ' +
              'conditionnement : tu connais $P(B|A)$, tu en déduis $P(A|B)$ — utile dès que ' +
              'seule la probabilité « dans le mauvais sens » est directement connue.',
            'Quand $P(B)$ n\'est pas donnée, on la calcule par la loi des probabilités totales ' +
              'sur la partition $A$, $\\bar{A}$, ce qui donne la forme développée : ' +
              '$P(A|B) = \\dfrac{P(B|A) \\times P(A)}{P(B|A) \\times P(A) + P(B|\\bar{A}) \\times P(\\bar{A})}$.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Le théorème publié après la mort de son auteur',
          text:
            '**Thomas Bayes**, pasteur et mathématicien anglais, ne publie jamais ' +
            'lui-même le théorème qui porte aujourd\'hui son nom. C\'est seulement après ' +
            'sa mort, en 1761, que son ami Richard Price retrouve ses papiers, reconnaît ' +
            'l\'importance du résultat, et le fait publier en 1763 sous le titre « An ' +
            'Essay towards solving a Problem in the Doctrine of Chances ». Pendant ' +
            'longtemps, le théorème reste peu utilisé — il faudra attendre le 20e siècle ' +
            'pour qu\'il devienne un outil central, notamment en intelligence ' +
            'artificielle, en médecine et en science des données, partout où il faut ' +
            'remonter d\'un effet observé (un test positif, un symptôme) à sa cause la ' +
            'plus probable.',
          image: {
            src: '/images/historique/bayes.gif',
            alt: 'Portrait traditionnellement attribué à Thomas Bayes',
            caption:
              'Portrait traditionnellement présenté comme celui de Thomas Bayes (1701–1761), ' +
              'bien que son authenticité reste débattue par les historiens — aucun ' +
              'portrait confirmé de lui n\'existe.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi la formule fonctionne',
          blocks: [
            {
              kind: 'para',
              text:
                'Par définition de la probabilité conditionnelle appliquée à $A$ sachant $B$ : ' +
                '$P(A \\cap B) = P(A|B) \\times P(B)$. La même définition, appliquée cette fois ' +
                'à $B$ sachant $A$, donne $P(A \\cap B) = P(B|A) \\times P(A)$.',
            },
            {
              kind: 'para',
              text:
                'Les deux membres de droite valent tous deux $P(A \\cap B)$ : ils sont donc ' +
                'égaux entre eux. En isolant $P(A|B)$ dans $P(A|B) \\times P(B) = P(B|A) \\times ' +
                'P(A)$, tu retombes exactement sur la formule de Bayes.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'test médical : remonter du test à la maladie',
          formula: 'Sachant le résultat positif, quelle est la probabilité réelle d\'être malade ?',
          steps: [],
          result: { tag: 'résultat', text: '$P(malade|T^+) = \\dfrac{P(T^+|malade) \\times P(malade)}{P(T^+)} = \\dfrac{0{,}9 \\times 0{,}1}{0{,}27} = \\dfrac{1}{3}$' },
        },
        {
          kind: 'piege',
          text:
            '$P(malade|T^+) \\approx 0{,}33$ est **très** différent de $P(T^+|malade) = 0{,}9$ ! ' +
            'Confondre ces deux probabilités conditionnelles, c\'est **le** piège central du ' +
            'théorème de Bayes. Un test « fiable à 90 % » ($P(T^+|malade)$=0,9) ne signifie **pas** ' +
            'qu\'un résultat positif donne 90 % de chances d\'être malade : tout dépend aussi ' +
            'de la proportion de malades ($P(malade)$=0,1 ici) et du taux de faux positifs. Plus la ' +
            'maladie est rare, plus l\'écart se creuse (exemple plus bas).',
        },
        {
          kind: 'atelier',
          tag: 'bayes-test-medical-widget',
          label: 'Manipule toi-même : le piège central de Bayes',
          caption:
            'Fais glisser P(malade), P(T⁺|malade) et P(T⁺|non malade) : les colonnes de ' +
            'fréquences naturelles et le contraste P(T⁺|malade)/P(malade|T⁺) se recalculent en ' +
            'direct. Le réglage de départ reproduit exactement l\'exemple ci-dessus (P(T⁺)=27%, ' +
            'P(malade|T⁺)≈33%).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'naturalFrequencies',
            headline: 'P(malade|T⁺) = 90/270 = 1/3',
            columns: [
              {
                title: 'malades',
                titleTone: 'accent',
                labelSide: 'right',
                segments: [
                  { label: 'T⁻ : 10', count: 10, tone: 'accentFaint' },
                  { label: 'T⁺ : 90', count: 90, tone: 'accent' },
                ],
                footLabel: '100 malades',
              },
              {
                title: 'non malades',
                titleTone: 'good',
                labelSide: 'right',
                segments: [
                  { label: 'T⁻ : 720', count: 720, tone: 'goodFaint' },
                  { label: 'T⁺ : 180', count: 180, tone: 'good' },
                ],
                footLabel: '900 non malades',
              },
              {
                title: '',
                titleTone: 'accent',
                labelSide: 'left',
                segments: [
                  { label: '180', count: 180, tone: 'good' },
                  { label: '90', count: 90, tone: 'accent' },
                ],
                footLabel: '270 positifs',
              },
            ],
            caption:
              'Sur 1000 personnes : 100 malades dont 90 $T^+$, et 900 non malades dont 180 $T^+$ ' +
              '— au total 270 $T^+$, dont seulement 90 sont réellement malades : 90/270=1/3, à ne ' +
              'pas confondre avec 90/100=0,9.',
          },
        },
        { kind: 'subheading', text: 'Le vocabulaire des tests, et le cas d\'une maladie rare' },
        {
          kind: 'definition',
          label: 'Sensibilité, spécificité, faux positifs',
          items: [
            'La **sensibilité** d\'un test, c\'est $P(T^+|\\text{malade})$ : la proportion de ' +
              'malades que le test détecte. Sa **spécificité**, c\'est $P(T^-|\\text{non malade})$ ' +
              ': la proportion de personnes saines qu\'il déclare bien négatives. Un **faux ' +
              'positif** est une personne saine testée positive ; le taux de faux positifs vaut ' +
              '$P(T^+|\\text{non malade}) = 1 - \\text{spécificité}$.',
            'Ce que la personne testée veut savoir, c\'est l\'inverse : $P(\\text{malade}|T^+)$, ' +
              'la **valeur prédictive positive** du test — exactement ce que calcule le théorème ' +
              'de Bayes. Ces mots figurent sur les notices des autotests vendus en pharmacie.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'maladie rare : un test positif, puis un second',
          formula:
            'Une maladie touche 1 % de la population. Le test de dépistage a une sensibilité de ' +
            '99 % et donne 5 % de faux positifs. Une personne est testée positive : quelle est ' +
            'la probabilité qu\'elle soit malade ?',
          steps: [
            {
              tag: 'probabilités totales',
              text:
                '$P(T^+) = 0{,}99 \\times 0{,}01 + 0{,}05 \\times 0{,}99 = 0{,}0099 + 0{,}0495 = 0{,}0594$.',
            },
            {
              tag: 'Bayes',
              text:
                '$P(\\text{malade}|T^+) = \\dfrac{0{,}0099}{0{,}0594} = \\dfrac{1}{6} \\approx 0{,}167$ ' +
                ': malgré un test « fiable à 99 % », un résultat positif ne donne qu\'une chance ' +
                'sur 6 d\'être malade, car les personnes saines sont 99 fois plus nombreuses.',
            },
            {
              tag: 'un second test positif',
              text:
                'La personne refait le test (résultat indépendant du premier, l\'état de santé ' +
                'étant fixé) et il est encore positif. On repart de $P(\\text{malade}) = \\frac{1}{6}$ : ' +
                '$P(\\text{malade}|T^+) = \\dfrac{0{,}99 \\times \\frac{1}{6}}{0{,}99 \\times \\frac{1}{6} ' +
                '+ 0{,}05 \\times \\frac{5}{6}} = \\dfrac{0{,}99}{1{,}24} = \\dfrac{99}{124} \\approx 0{,}80$.',
            },
          ],
          result: {
            tag: 'à retenir',
            text:
              'Un test positif : environ 17 %. Deux tests positifs : environ 80 %. C\'est pourquoi ' +
              'un dépistage positif est toujours confirmé par un second examen avant tout diagnostic.',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — lire P(A|B) dans un tableau à double entrée',
          items: [
            'Comme en section 1, $P(A|B)$ se lit directement dans un tableau à double entrée en ' +
              'restreignant ton attention à la **seule** ligne (ou colonne) de $B$ : c\'est ' +
              'l\'effectif de la case $A \\cap B$ divisé par le **total** de cette ligne — sans ' +
              'même repasser par la formule $P(A \\cap B)/P(B)$, puisque diviser numérateur et ' +
              'dénominateur par le même effectif total ne change rien au résultat.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'école de musique : lecture dans un tableau',
          formula:
            'Une école propose piano et guitare ; elle compte 60 inscrits dont 38 filles, et ' +
            'chaque élève ne suit qu\'un seul instrument. Le professeur de guitare a 28 élèves, ' +
            'dont 15 garçons — le tableau à double entrée se remplit avec ces 4 valeurs ' +
            'd\'énoncé (60, 38, 28, 15), laissées en noir ; les 5 autres cases, mises en ' +
            'évidence, se déduisent par soustraction.',
          steps: [],
          result: { tag: '', text: '' },
        },
        {
          kind: 'featureTable',
          headers: ['', 'Piano', 'Guitare', 'Total'],
          rows: [
            ['Garçons', { text: '7', tone: 'good' }, '15', { text: '22', tone: 'good' }],
            ['Filles', { text: '25', tone: 'good' }, { text: '13', tone: 'good' }, '38'],
            ['Total', { text: '32', tone: 'good' }, '28', '60'],
          ],
        },
        {
          kind: 'para',
          text:
            'Soit $A$ « l\'élève étudie la guitare » et $B$ « l\'élève est un garçon ». Sachant ' +
            'qu\'un élève étudie la guitare (tu restes dans la **seule** colonne « Guitare », de ' +
            'total 28), la probabilité qu\'il soit un garçon vaut $P(B|A) = \\dfrac{15}{28}$.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — incompatibles ou indépendants',
          items: [
            'Section 1 : $A$ et $B$ sont **incompatibles** si $A \\cap B = \\emptyset$, ' +
              '**indépendants** si $P(A \\cap B) = P(A) \\times P(B)$ (soit $P(A|B) = P(A)$ quand ' +
              '$P(B) > 0$). Dans un tableau d\'effectifs, les deux se testent en quelques secondes.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — incompatibles, indépendants, ou ni l\'un ni l\'autre ?',
          blocks: [
            {
              kind: 'para',
              text:
                'Dans une école de 200 élèves, chaque élève joue au plus d\'un instrument. On note ' +
                '$A$ « l\'élève fait du sport en club », $G$ « il joue de la guitare », $V$ « il ' +
                'joue du violon ». On choisit un élève au hasard.',
            },
            {
              kind: 'featureTable',
              headers: ['', 'Guitare (G)', 'Violon (V)', 'Aucun instrument', 'Total'],
              rows: [
                ['Sport (A)', '16', '30', '34', '80'],
                ['Pas de sport', '24', '30', '66', '120'],
                ['Total', '40', '60', '100', '200'],
              ],
            },
            {
              kind: 'para',
              text:
                'Pour $A$ et $G$ : $P(A \\cap G) = \\frac{16}{200} = 0{,}08$ et ' +
                '$P(A) \\times P(G) = \\frac{80}{200} \\times \\frac{40}{200} = 0{,}4 \\times 0{,}2 = 0{,}08$ : ' +
                'l\'égalité est vérifiée, $A$ et $G$ sont **indépendants**. Parmi les guitaristes, ' +
                '$\\frac{16}{40} = 0{,}4$ font du sport, exactement comme dans toute l\'école.',
            },
            {
              kind: 'para',
              text:
                'Pour $G$ et $V$ : aucun élève ne joue des deux instruments, $G \\cap V = \\emptyset$ : ' +
                '$G$ et $V$ sont **incompatibles** — et donc pas indépendants, puisque ' +
                '$P(G) \\times P(V) = 0{,}2 \\times 0{,}3 = 0{,}06 \\neq 0$.',
            },
            {
              kind: 'para',
              text:
                'Pour $A$ et $V$ : $P(A \\cap V) = \\frac{30}{200} = 0{,}15$, alors que ' +
                '$P(A) \\times P(V) = 0{,}4 \\times 0{,}3 = 0{,}12$ : ni incompatibles (30 élèves ' +
                'font les deux), ni indépendants. Parmi les violonistes, ' +
                '$P(A|V) = \\frac{30}{60} = 0{,}5 > 0{,}4$ : les violonistes font plus souvent du sport.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Deux probabilités conditionnées par le même événement se complètent',
          text:
            '$P(malade|T^+) + P(\\text{non malade}|T^+) = 1$ **toujours** (le même événement ' +
            'conditionne $T^+$ des deux côtés). En revanche, $P(malade|T^+) + ' +
            'P(malade|\\text{non } T^+)$ n\'a **aucune** raison de valoir 1 — les deux ' +
            'probabilités sont conditionnées par des événements différents.',
        },
        {
          kind: 'application',
          titre: 'Comment ta boîte mail reconnaît un spam',
          illustrations: [
            {
              kind: 'naturalFrequencies',
              headline: 'P(gratuit|spam) → P(spam|gratuit)',
              columns: [
                {
                  title: 'spam',
                  titleTone: 'accent',
                  segments: [
                    { label: 'sans mot : 40', count: 40, tone: 'accentFaint' },
                    { label: 'avec mot : 60', count: 60, tone: 'accent' },
                  ],
                  labelSide: 'right',
                  footLabel: '100 spams',
                },
                {
                  title: 'légitime',
                  titleTone: 'good',
                  segments: [
                    { label: 'sans mot : 855', count: 855, tone: 'goodFaint' },
                    { label: 'avec mot : 45', count: 45, tone: 'good' },
                  ],
                  labelSide: 'right',
                  footLabel: '900 légitimes',
                },
                {
                  title: '',
                  titleTone: 'accent',
                  segments: [
                    { label: '45', count: 45, tone: 'good' },
                    { label: '60', count: 60, tone: 'accent' },
                  ],
                  labelSide: 'left',
                  footLabel: '105 avec « gratuit »',
                },
              ],
              caption: 'Sur 1000 messages (100 spams), P(gratuit|spam)=60 % mais P(spam|gratuit)=60/(60+45)≈57 % — recombiner par le mot plutôt que par le statut retourne le conditionnement, exactement le calcul que fait le filtre.',
            },
            {
              kind: 'categoricalBarChart',
              bars: [
                { label: '0 mot suspect', value: 5, valueLabel: '5 %', tone: 'faint' },
                { label: '1 mot', value: 40, valueLabel: '40 %', tone: 'faint' },
                { label: '2 mots', value: 85, valueLabel: '85 %', tone: 'faint' },
                { label: '3 mots', value: 98, valueLabel: '98 %', tone: 'accent' },
              ],
              maxValue: 100,
              xAxisLabel: 'mots suspects présents à la fois',
              yAxisLabel: 'P(spam) estimée',
              caption: 'Plus un message contient de mots suspects à la fois, plus P(spam|message) grimpe. Le filtre déplace le message quand elle dépasse un seuil, ici 90 % : c\'est le cas avec 3 mots (98 %), pas encore avec 2 (85 %).',
            },
          ],
          text:
            'Un filtre anti-spam applique le théorème de Bayes des milliers de fois par ' +
            'seconde, à une échelle totalement différente du test médical ci-dessus, mais ' +
            'avec exactement le même raisonnement. Le filtre connaît $P(mot|spam)$ — la ' +
            'fréquence à laquelle un mot donné (« gratuit », « gagner », « urgent »…) ' +
            'apparaît dans les messages déjà classés comme spam — et veut en déduire ' +
            '$P(spam|message)$, la probabilité qu\'un **nouveau** message soit un spam compte ' +
            'tenu des mots qu\'il contient : exactement le même retournement de ' +
            'conditionnement que dans cette section. Plus un message contient de mots ' +
            '« suspects » à la fois, plus cette probabilité calculée grimpe, jusqu\'à ' +
            'dépasser un seuil au-delà duquel le message est automatiquement déplacé dans ' +
            'le dossier spam.',
          domaines: ['Informatique', 'Intelligence artificielle'],
        },
        {
          kind: 'entrainement',
          title: 'Indépendance, conditionnement et Bayes',
          generatorId: '6gen32',
          description: ['Théorème de Bayes, loi des probabilités totales, lecture directe dans un tableau à double entrée.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 32. Indépendance, conditionnement et Bayes »',
        },
        {
          kind: 'entrainement',
          title: 'Arbre, tableau, effectifs',
          generatorId: '6gen74',
          description: [
            'Une même situation écrite de trois façons — pourcentages, arbre pondéré, tableau ' +
              'd\'effectifs — puis P(B|A) et P(A|B) sur les mêmes données, et l\'indépendance vérifiée.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 74. Arbre, tableau, effectifs »',
        },
      ],
    },

    {
      id: 'probabilitesproblemes',
      number: 4,
      title: 'Probabilités : problèmes',
      kicker: 'compter les chemins à k succès dans l’arbre, × pᵏ(1−p)ⁿ⁻ᵏ',
      blocks: [
        { kind: 'video', title: 'Probabilités : problèmes — épreuves répétées et synthèse du chapitre', youtubeId: '8nv_851l7IY' },
        {
          kind: 'definition',
          label: 'Épreuves répétées et indépendantes : toujours un arbre',
          items: [
            'Répéter $n$ fois la MÊME épreuve à deux issues (succès de probabilité $p$, échec ' +
              '$1-p$), en remettant à chaque fois les conditions à l\'identique, c\'est ' +
              'exactement l\'arbre de la section 2 — sauf que les DEUX probabilités $p$ et ' +
              '$1-p$ sont les MÊMES à chaque étage (indépendance : le résultat d\'un tir ' +
              'n\'affecte jamais le suivant).',
            'Sur un chemin donné, tu multiplies les probabilités étage par étage, comme ' +
              'toujours. Mais puisque $p$ et $1-p$ sont identiques à chaque étage, DEUX chemins ' +
              'comptant le MÊME NOMBRE de succès — peu importe à quels étages ils se ' +
              'produisent — ont exactement la même probabilité. Pour trouver $P$(exactement ' +
              '$k$ succès), il suffit donc de COMPTER combien de chemins de l\'arbre ' +
              'contiennent $k$ succès, puis de multiplier ce nombre par la probabilité commune ' +
              'à chacun d\'eux.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Pourquoi on les appelle des « épreuves de Bernoulli »',
          text:
            'Le mathématicien suisse **Jacob Bernoulli** consacre les vingt dernières ' +
            'années de sa vie à l\'étude des épreuves répétées et indépendantes que tu ' +
            'utilises dans cette section — succès ou échec, toujours avec la même ' +
            'probabilité $p$. Son ouvrage Ars Conjectandi (« L\'art de la conjecture »), ' +
            'publié en 1713, huit ans après sa mort, par son neveu Nicolas Bernoulli, ' +
            'contient l\'une des premières démonstrations rigoureuses de ce qu\'on appelle ' +
            'aujourd\'hui la **loi des grands nombres** : plus tu répètes une épreuve, ' +
            'plus la fréquence observée des succès se rapproche de la probabilité ' +
            'théorique $p$ — exactement l\'idée de la stabilisation des fréquences que tu ' +
            'as déjà rencontrée à la section 1. C\'est en son honneur qu\'on appelle ' +
            'aujourd\'hui « épreuve de Bernoulli » toute expérience à deux issues répétée ' +
            'dans les mêmes conditions.',
          image: {
            src: '/images/historique/bernoulli.jpg',
            alt: 'Portrait de Jacob Bernoulli',
            caption: 'Jacob Bernoulli (1655–1705), portrait d\'époque.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — arbre complet à 3 tirs, p = 0,3',
          blocks: [
            {
              kind: 'para',
              text:
                'Avec seulement 3 tirs, l\'arbre complet tient sur 8 chemins — tu peux tous les ' +
                'lister, et les regrouper par nombre de succès (S) :',
            },
            {
              kind: 'featureTable',
              headers: [
                'Nombre de succès',
                'Chemins',
                'Nombre de chemins',
                'Probabilité de CHAQUE chemin',
                'P(X=k)',
              ],
              rows: [
                ['3', 'SSS', '1', '$0{,}3^3=0{,}027$', '$0{,}027$'],
                ['2', 'SSÉ, SÉS, ÉSS', '3', '$0{,}3^2 \\times 0{,}7=0{,}063$', '$3 \\times 0{,}063=0{,}189$'],
                ['1', 'SÉÉ, ÉSÉ, ÉÉS', '3', '$0{,}3 \\times 0{,}7^2=0{,}147$', '$3 \\times 0{,}147=0{,}441$'],
                ['0', 'ÉÉÉ', '1', '$0{,}7^3=0{,}343$', '$0{,}343$'],
              ],
            },
            {
              kind: 'para',
              text:
                'Vérification : 0,027+0,189+0,441+0,343 = 1 EXACTEMENT — les 8 chemins couvrent ' +
                'tous les cas possibles, sans jamais se chevaucher.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la formule des épreuves répétées',
          blocks: [
            {
              kind: 'para',
              text:
                'Un chemin de l\'arbre est une suite de $n$ branches : $k$ d\'entre elles portent un ' +
                'succès (probabilité $p$), les $n-k$ autres un échec (probabilité $1-p$). Les épreuves ' +
                'étant indépendantes, chaque branche garde la même probabilité quel que soit le chemin ' +
                'déjà parcouru : par la règle du produit (section 2), ce chemin a pour probabilité ' +
                '$p^k(1-p)^{n-k}$, quel que soit l\'ORDRE des succès et des échecs (l\'ordre des ' +
                'facteurs ne change pas un produit).',
            },
            {
              kind: 'para',
              text:
                'On note $N_k$ le nombre de chemins qui comptent exactement $k$ succès. L\'événement ' +
                '« $X=k$ » est réalisé par ces $N_k$ chemins, et par eux seuls. Deux chemins ' +
                'différents sont incompatibles : par la règle de la somme, $P(X=k)$ est la somme de ' +
                '$N_k$ probabilités toutes égales à $p^k(1-p)^{n-k}$.',
            },
            {
              kind: 'para',
              text:
                'D\'où $P(X=k) = N_k \\times p^k(1-p)^{n-k}$. Tout le travail se ramène donc à ' +
                'COMPTER les chemins à $k$ succès, en énumérant les positions possibles des succès ' +
                'parmi les $n$ épreuves — comme dans l\'exemple du tireur ci-dessous.',
            },
            {
              kind: 'para',
              text:
                'Contrôle avec l\'arbre à 3 tirs ci-dessus : $N_0 = 1$, $N_1 = 3$, $N_2 = 3$, ' +
                '$N_3 = 1$, soit $1+3+3+1 = 8 = 2^3$ chemins en tout. Chaque chemin est compté une ' +
                'et une seule fois : la somme des $P(X=k)$ vaut bien 1.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'categoricalBarChart',
            bars: [
              { label: '0', value: 0.16807, valueLabel: '0,168' },
              { label: '1', value: 0.36015, valueLabel: '0,360' },
              { label: '2', value: 0.3087, valueLabel: '0,309' },
              { label: '3', value: 0.1323, valueLabel: '0,132' },
              { label: '4', value: 0.02835, valueLabel: '0,028' },
              { label: '5', value: 0.00243, valueLabel: '0,002' },
            ],
            maxValue: 0.4,
            xAxisLabel: 'k (nombre de succès)',
            yAxisLabel: 'P(X=k)',
            caption:
              'Distribution de $P(X=k)$ pour $n$=5 tirs, $p$=0,3 : les 6 barres (k=0 à 5) ' +
              'totalisent une probabilité de 1.',
          },
        },
        {
          kind: 'exemple',
          badge: 'tireur : 2 succès sur 5 tirs, p = 0,3',
          formula: '',
          steps: [
            {
              tag: 'seule la POSITION des 2 succès compte',
              text:
                'Avec 5 tirs, lister les 32 chemins complets serait trop lourd. Mais pour ' +
                '$P(X=2)$, seule la POSITION des 2 succès parmi les 5 tirs compte : chaque ' +
                'position donne un chemin de probabilité $0{,}3^2 \\times 0{,}7^3$, quelle que soit ' +
                'la position exacte. Il suffit d\'énumérer ces positions :',
            },
            {
              tag: 'énumération des positions',
              text: '{1;2}, {1;3}, {1;4}, {1;5}, {2;3}, {2;4}, {2;5}, {3;4}, {3;5}, {4;5} — soit 10 positions distinctes.',
            },
          ],
          result: {
            tag: 'résultat',
            text: '$P(X=2) = 10 \\times 0{,}3^2 \\times 0{,}7^3 = 10 \\times 0{,}09 \\times 0{,}343 = 0{,}3087$',
          },
        },
        {
          kind: 'piege',
          text:
            'Oublier de COMPTER le nombre de positions (ici 10), et ne garder qu\'UNE seule ' +
            'd\'entre elles, donne $0{,}3^2 \\times 0{,}7^3=0{,}03087$ — un résultat 10 fois trop ' +
            'petit ! Le nombre de chemins n\'est JAMAIS optionnel dès que $0<k<n$.',
        },
        {
          kind: 'methode',
          label: '« Au moins un » : toujours par le complément',
          items: [
            '$P$(au moins un succès) se calcule par le complément de « aucun succès », JAMAIS ' +
              'en additionnant des probabilités individuelles — ça dépasserait facilement 1 ! ' +
              '$P(\\text{au moins 1}) = 1 - P(X=0) = 1-(1-p)^n$.',
            'Avec l\'exemple : $1-0{,}7^5 = 1-0{,}16807 = 0{,}83193$.',
          ],
        },
        {
          kind: 'piege',
          text:
            '$P(\\text{au moins 1}) = 5 \\times p = 1{,}5$ est IMPOSSIBLE — une probabilité ne ' +
            'dépasse jamais 1 ! Cette méthode « additionner les $p$ » est toujours fausse. La ' +
            'seule méthode fiable, c\'est le complément, quelle que soit la valeur de $p$ (il ' +
            'fonctionne pour tout $p$ entre 0 et 1, pas seulement $p$=0,5).',
        },
        {
          kind: 'atelier',
          tag: 'binomiale-positions-widget',
          label: 'Manipule toi-même : positions et complément',
          caption:
            'Fais glisser n, p, choisis k : la distribution complète se redessine, avec le ' +
            'calcul correct et les deux pièges (oublier les positions, additionner les p) ' +
            'contrastés en direct. Le réglage de départ (n=5, p=0,3, k=2) reproduit exactement ' +
            'l\'exemple ci-dessus.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complementBar',
            headline: 'n=5, p=0,3 : P(au moins 1 succès) = 1 − P(X=0)',
            parts: [
              { fraction: 0.16807, label: 'P(X=0)=0,168', tone: 'faint' },
              { fraction: 0.83193, label: 'P(au moins 1)=0,832', tone: 'accent' },
            ],
            footer: '0,168 + 0,832 = 1',
            warning: '✗ 5×0,3 = 1,5 (impossible, >1)',
            caption:
              '0,168+0,832=1 EXACTEMENT : $P(X=0)$ et $P$(au moins 1) se partagent toute la ' +
              'barre — additionner 5×0,3=1,5 dépasserait la barre elle-même.',
          },
        },
        {
          kind: 'exemple',
          badge: 'action boursière : 3 jours, p = 0,6',
          formula:
            'Même principe que l\'arbre à 3 tirs ci-dessus, avec $p=0{,}6$ (H « hausse ») : ' +
            '1 chemin HHH, 3 chemins à 2 hausses (HHB, HBH, BHH), 3 chemins à 1 hausse ' +
            '(HBB, BHB, BBH), 1 chemin BBB.',
          steps: [
            { tag: 'P(X=0)', text: '$0{,}4^3=0{,}064$' },
            { tag: 'P(X=1)', text: '$3 \\times 0{,}6 \\times 0{,}4^2=0{,}288$' },
            { tag: 'P(X=2)', text: '$3 \\times 0{,}6^2 \\times 0{,}4=0{,}432$' },
            { tag: 'P(X=3)', text: '$0{,}6^3=0{,}216$' },
          ],
          result: {
            tag: 'somme',
            text:
              'Leur somme, 0,064+0,288+0,432+0,216, vaut exactement 1 — ces 4 valeurs couvrent ' +
              'tous les cas possibles, sans jamais se chevaucher.',
          },
        },
        { kind: 'subheading', text: 'Deux grands classiques : le complément et l\'indépendance' },
        {
          kind: 'exemple',
          badge: 'paradoxe des anniversaires',
          formula:
            'Dans un groupe de 5 personnes, quelle est la probabilité qu\'au moins deux soient nées ' +
            'le même jour ? (On ignore les années bissextiles : 365 jours équiprobables.)',
          steps: [
            {
              tag: 'passer au complément',
              text:
                '« Au moins deux nées le même jour » a pour complément « les 5 anniversaires sont ' +
                'tous différents » : un seul cas à calculer, au lieu de toutes les coïncidences possibles.',
            },
            {
              tag: 'personne après personne',
              text:
                'La 1re personne peut être née n\'importe quel jour ; la 2e doit éviter 1 jour ' +
                '($\\frac{364}{365}$), la 3e en éviter 2 ($\\frac{363}{365}$), et ainsi de suite. ' +
                'Règle du produit sur ce chemin : $P$(tous différents) $= \\frac{364}{365} \\times ' +
                '\\frac{363}{365} \\times \\frac{362}{365} \\times \\frac{361}{365} \\approx 0{,}9729$.',
            },
          ],
          result: {
            tag: 'résultat',
            text:
              '$P$(au moins deux le même jour) $= 1 - 0{,}9729 \\approx 0{,}0271$. Le même calcul ' +
              'avec 23 personnes donne déjà environ $0{,}507$ : plus d\'une chance sur deux !',
          },
        },
        {
          kind: 'exemple',
          badge: 'montage en série ou en parallèle',
          formula:
            'Un appareil comporte deux composants qui tombent en panne indépendamment l\'un de ' +
            'l\'autre : le 1er fonctionne avec une probabilité 0,9, le 2e avec une probabilité 0,8.',
          steps: [
            {
              tag: 'en série',
              text:
                'Le courant traverse les deux composants l\'un après l\'autre : l\'appareil ' +
                'fonctionne seulement si les DEUX fonctionnent. Par indépendance : ' +
                '$P$(fonctionne) $= 0{,}9 \\times 0{,}8 = 0{,}72$.',
            },
            {
              tag: 'en parallèle',
              text:
                'Il suffit qu\'UN des deux fonctionne : c\'est un « au moins un », donc par le ' +
                'complément. L\'appareil tombe en panne seulement si les deux sont en panne : ' +
                '$P$(panne) $= 0{,}1 \\times 0{,}2 = 0{,}02$, d\'où $P$(fonctionne) $= 1 - 0{,}02 = 0{,}98$.',
            },
          ],
          result: {
            tag: 'à retenir',
            text:
              'Série : produit des probabilités de fonctionnement. Parallèle : 1 moins le produit des ' +
              'probabilités de panne. Jamais l\'un à la place de l\'autre — et additionner ' +
              '$0{,}9+0{,}8 = 1{,}7$ ne donne même pas une probabilité.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Probabilités — problèmes',
          generatorId: '6gen33',
          description: [
            'Épreuves répétées et indépendantes, comptage des chemins à k succès dans ' +
              'l\'arbre, « au moins un » par le complément.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 33. Probabilités — problèmes »',
        },
        {
          kind: 'entrainement',
          title: 'Quand l\'intuition se trompe',
          generatorId: '6gen76',
          description: [
            'Trois paradoxes classiques — les paris du chevalier de Méré, le jeu de Monty Hall, ' +
              'les deux enfants — où le calcul contredit l\'intuition.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 76. Quand l\'intuition se trompe »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Probabilités et ensembles',
        formulas: [
          { text: '$0 \\le P(A) \\le 1$' },
          {
            text: '$P(A) = \\dfrac{n(A)}{n(\\Omega)}$',
            condition: 'issues équiprobables — $n(A)$ : cas favorables, $n(\\Omega)$ : cas possibles',
          },
          { text: '$P(\\bar{A}) = 1-P(A)$' },
          { text: '$P(A \\cup B) = P(A)+P(B)-P(A \\cap B)$' },
          {
            text: '$P(\\bar{A} \\cap \\bar{B}) = 1-P(A \\cup B)$',
            condition: 'jamais $1-P(A)-P(B)$',
          },
        ],
      },
      {
        title: 'Arbres, chemins et dénombrement',
        formulas: [
          { text: 'probabilité d\'un chemin = produit des probabilités des branches' },
          { text: 'probabilité d\'un événement = somme des probabilités de ses chemins' },
          { text: '$n! = n \\times (n-1) \\times \\ldots \\times 1$' },
          { text: 'dérangement : permutation où aucun objet ne reste à sa place — $D(n) \\neq n!$, par exemple $D(4) = 9$' },
        ],
      },
      {
        title: 'Conditionnement et indépendance',
        formulas: [
          { text: '$P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}$' },
          {
            text: '$P(A \\cap B) = P(A) \\times P(B)$',
            condition: '$A$, $B$ indépendants',
          },
          {
            text: '$A$, $B$ incompatibles et de probabilités non nulles ⟹ $A$, $B$ jamais indépendants',
            condition: 'car $P(A \\cap B) = 0 \\neq P(A) \\times P(B)$',
          },
        ],
      },
      {
        title: 'Probabilités totales et Bayes',
        formulas: [
          {
            text: '$P(A) = \\displaystyle\\sum_i P(A|B_i) \\times P(B_i)$',
            condition: 'sur une partition de $\\Omega$',
          },
          { text: '$P(A|B) = \\dfrac{P(B|A) \\times P(A)}{P(B)}$' },
        ],
      },
      {
        title: 'Épreuves répétées (loi binomiale)',
        formulas: [
          {
            text: '$P(X=k) = N_k \\times p^k(1-p)^{n-k}$',
            condition: '$N_k$ = nombre de chemins à $k$ succès',
          },
          { text: '$P(\\text{au moins 1 succès}) = 1-(1-p)^n$' },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Probabilité', '$0 \\leq P(A) \\leq 1$ ; équiprobabilité : favorables/possibles'],
        ['Union', '$P(A \\cup B)=P(A)+P(B)-P(A \\cap B)$'],
        ['Complémentaire', '$P(\\bar{A} \\cap \\bar{B})=1-P(A \\cup B)$, jamais $1-P(A)-P(B)$'],
        ['Conditionnement', '$P(A|B)=P(A \\cap B)/P(B) \\neq P(B|A)$'],
        ['Indépendance', '$P(A \\cap B)=P(A) \\times P(B)$ — toujours vérifiée, jamais devinée'],
        ['Incompatibilité', '$P(A \\cap B)=0 \\Rightarrow$ jamais indépendant'],
        ['Arbre pondéré', 'chemin → produit ; événement (plusieurs chemins) → somme'],
        ['Avec/sans remise', 'avec remise → indépendant ; sans remise → jamais'],
        ['Dérangement', '$D(n) \\neq n!$ ; $D(4)$=9'],
        ['Probabilités totales', '$P(A)=\\sum P(A|B_i) \\times P(B_i)$ sur une partition'],
        ['Théorème de Bayes', '$P(A|B)=P(B|A) \\times P(A)/P(B)$'],
        [
          'Épreuves répétées',
          'compter les chemins à $k$ succès dans l’arbre, $\\times p^k(1-p)^{n-k}$',
        ],
      ],
    },
    entrainement: {
      kind: 'entrainement',
      title: 'Les probabilités — quiz vrai/faux',
      generatorId: '6gen69',
      description: ['Quiz de révision transversal à tout le chapitre.'],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 69. Quiz vrai/faux — Les probabilités »',
    },
  },
}
