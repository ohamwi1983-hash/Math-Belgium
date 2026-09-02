import type { ChapterContent } from '../../types'

export const suites: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 3,
  title: 'Les suites',
  slug: 'suites',
  lede:
    'Une suite numérique associe à chaque rang $n$ un nombre $u_n$ — le premier terme est ' +
    'toujours $u_1$, jamais $u_0$. Ce chapitre étudie les deux familles de référence — ' +
    'arithmétique (on ajoute toujours la même raison) et géométrique (on multiplie toujours par ' +
    'la même raison) —, leur comportement à long terme (convergence ou divergence), des ' +
    "problèmes concrets qui s'y ramènent, la comparaison de deux suites terme à terme, et enfin " +
    'les suites récurrentes affines, qui se stabilisent — ou non — autour d\'un régime permanent.',

  sections: [
    {
      id: 'suites-arithmetiques',
      number: 1,
      title: 'Suites arithmétiques, formule générale et termes',
      kicker: 'u_(n+1) = u_n + r — terme général et somme des n premiers termes',
      blocks: [
        {
          kind: 'rappel',
          label: 'Rappel — définition et notations d\'une suite numérique',
          items: [
            'Une **suite numérique** est une liste ordonnée de nombres réels, notée ' +
              '$(u_n)_{n \\in \\mathbb{N}_0}$ — le premier terme est toujours $u_1$, jamais ' +
              '$u_0$. Le terme d\'indice n se note aussi parfois $u(n)$, comme une valeur de ' +
              'fonction en n.',
            'Une suite est définie soit de façon **explicite** ($u_n$ directement en fonction ' +
              'de n, ex. $u_n=3n-1$), soit par **récurrence** (un terme en fonction du ou des ' +
              'précédents, ex. $u_{n+1}=u_n+r$) — dans ce dernier cas, il faut aussi connaître ' +
              'un premier terme pour pouvoir calculer tous les autres.',
          ],
        },
        {
          kind: 'para',
          text:
            'Une suite est **arithmétique** lorsqu\'on passe d\'un terme au suivant en ajoutant ' +
            'toujours le **même nombre** $r$, appelé la **raison** : $u_{n+1} = u_n + r$. À ' +
            'partir du premier terme $u_1$, chaque terme s\'obtient donc en ajoutant $r$ autant ' +
            'de fois que de « pas » depuis le rang 1.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — les deux formules à retenir',
          items: [
            '**Terme général** — $u_n = u_1 + (n-1)r$ (n−1 pas depuis le rang 1, jamais n pas).',
            '**Somme des n premiers termes** — $S_n = \\dfrac{n(u_1+u_n)}{2}$ (n fois la ' +
              'moyenne du premier et du dernier terme).',
            '**Terme comme moyenne** — sauf le premier et le dernier, tout terme est la ' +
              '**moyenne arithmétique** de ses deux voisins : $u_n = \\dfrac{u_{n-1}+u_{n+1}}{2}$ (n≥2).',
          ],
        },
        {
          kind: 'para',
          text:
            'Le signe de $r$ gouverne entièrement le sens de variation : si $r > 0$, la suite ' +
            'est croissante ; si $r < 0$, elle est décroissante ; si $r = 0$, elle est ' +
            'constante. Deux données suffisent toujours à reconstruire toute la suite — peu ' +
            'importe lesquelles.',
        },
        {
          kind: 'exemple',
          badge: 'retrouver r et u₁ à partir de deux termes',
          formula: 'Une suite arithmétique vérifie $u_3 = 11$ et $u_7 = 27$. Détermine sa raison, son premier terme, puis calcule $u_{20}$ et $S_{20}$.',
          steps: [
            { tag: 'raison — entre les rangs 3 et 7, il y a 7−3 = 4 pas', text: '$r = \\dfrac{u_7-u_3}{7-3} = \\dfrac{27-11}{4} = \\dfrac{16}{4} = 4$' },
            { tag: 'premier terme — revenir de u₃ à u₁, soit 2 pas en arrière', text: '$u_1 = u_3 - (3-1) \\times 4 = 11-8 = 3$' },
            { tag: 'terme général', text: '$u_n = 3+(n-1) \\times 4 = 4n-1$' },
            { tag: 'u₂₀ — u_n = u₁ + (n−1)r', text: '$u_{20} = 3+(20-1) \\times 4 = 3+76 = 79$' },
          ],
          result: {
            tag: 'S₂₀ — somme des 20 premiers termes',
            text: '$S_{20} = \\dfrac{20 \\times (u_1+u_{20})}{2} = \\dfrac{20 \\times 82}{2} = 820$',
          },
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 3, label: '3' },
              { n: 2, value: 7, label: '7' },
              { n: 3, value: 11, label: '11' },
              { n: 4, value: 15, label: '15' },
              { n: 5, value: 19, label: '19' },
              { n: 6, value: 23, label: '23' },
            ],
            connector: 'straight',
            stepIndicator: { fromIndex: 1, toIndex: 2, label: '+r' },
            xAxisLabel: 'n',
            yAxisLabel: 'u_n',
            caption: 'points de la suite u₁=3, r=4 — chaque pas vers la droite ajoute exactement r en hauteur',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — n−1 pas, pas n',
          text:
            'Pour passer de $u_1$ à $u_n$, on effectue $n-1$ pas de raison $r$ — pas $n$ pas. ' +
            'L\'erreur classique est d\'écrire $u_n = u_1 + n \\times r$ : elle décale tous les ' +
            'résultats d\'un cran. Vérifie toujours sur $u_1$ lui-même : la formule doit ' +
            'redonner $u_1$ exactement pour n=1, ce qui n\'est vrai qu\'avec $(n-1)$.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — deux données, dans n\'importe quel ordre',
          text:
            'Que l\'énoncé donne u₁ et un autre terme, deux termes quelconques, ou un terme et ' +
            'une somme $S_n$, la méthode reste la même : isoler d\'abord ce qui peut l\'être ' +
            '(souvent r, par soustraction de deux termes), puis substituer pour trouver le ' +
            'reste. Une seule exception à retenir : si l\'énoncé donne un terme $u_n$ ET la ' +
            'somme $S_n$ au même rang, on retrouve u₁ **avant** r (via $S_n=n(u_1+u_n)/2$), ' +
            'l\'ordre inverse de d\'habitude.',
        },
        {
          kind: 'methode',
          label: 'Démonstration — d\'où vient la formule de S_n ?',
          items: [
            'On écrit la somme normalement, puis à l\'envers, et on additionne les deux termes ' +
              'à termes : $2S_n = (u_1+u_n) + (u_2+u_{n-1}) + (u_3+u_{n-2}) + \\ldots + (u_n+u_1)$.',
            'Chaque parenthèse vaut exactement $u_1+u_n$ : par exemple $u_2+u_{n-1} = ' +
              '(u_1+r)+(u_n-r) = u_1+u_n$, et de même pour chaque paire suivante. Il y a n ' +
              'parenthèses, toutes identiques, d\'où :',
            '$2S_n = n \\times (u_1+u_n) \\implies S_n = \\dfrac{n(u_1+u_n)}{2}$',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Suites arithmétiques, formule générale et termes',
          generatorId: '5gen14',
          description: [
            'Retrouve la raison, le premier terme, un terme quelconque ou la somme des n ' +
              'premiers termes d\'une suite arithmétique à partir de deux données au choix.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 14. Suites arithmétiques, formule générale et termes »',
        },
      ],
    },
    {
      id: 'suites-geometriques',
      number: 2,
      title: 'Suites géométriques, formule générale et termes',
      kicker: 'u_(n+1) = u_n × q — somme finie et somme infinie',
      blocks: [
        {
          kind: 'para',
          text:
            'Une suite est **géométrique** lorsqu\'on passe d\'un terme au suivant en ' +
            'multipliant toujours par le **même nombre** $q$, appelé la **raison** : ' +
            '$u_{n+1} = u_n \\times q$.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — les formules à retenir',
          items: [
            '**Terme général** — $u_n = u_1 \\times q^{n-1}$.',
            '**Somme des n premiers termes** (q≠1) — $S_n = u_1 \\times \\dfrac{1-q^n}{1-q}$.',
            '**Somme infinie** — $S_\\infty = \\dfrac{u_1}{1-q}$, **seulement si** $|q| < 1$.',
            '**Terme comme moyenne** — sauf le premier et le dernier, tout terme (positif) est ' +
              'la **moyenne géométrique** de ses deux voisins : $u_n = \\sqrt{u_{n-1} \\times u_{n+1}}$ (n≥2).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'terme général et somme finie',
          formula: 'Une suite géométrique a pour premier terme $u_1 = 2$ et pour raison $q = 3$. Calcule $u_5$ et $S_5$.',
          steps: [{ tag: 'terme général — u_n = u₁ × q^(n−1)', text: '$u_5 = 2 \\times 3^4 = 2 \\times 81 = 162$' }],
          result: {
            tag: 'somme des 5 premiers termes',
            text: '$S_5 = 2 \\times \\dfrac{1-3^5}{1-3} = 2 \\times \\dfrac{-242}{-2} = 2 \\times 121 = 242$',
          },
        },
        {
          kind: 'astuce',
          text: 'Vérification directe : $2+6+18+54+162 = 242$ ✓ — un bon réflexe pour confirmer un résultat de somme finie.',
        },
        {
          kind: 'piege',
          label: 'Piège classique — la somme infinie n\'existe pas toujours quand la suite converge',
          text:
            'Si $q = 1$, la suite $u_n = u_1$ est constante, donc elle **converge** — mais sa ' +
            'somme $S_n = n \\times u_1$ tend vers l\'infini : la somme infinie **n\'existe ' +
            'pas**. Exemple : $u_1 = 5$, $q = 1$ — la suite 5, 5, 5, 5, … converge bien vers 5, ' +
            'mais $S_n = 5n$ ne cesse de grandir. La condition « $|q| < 1$ strictement » pour ' +
            '$S_\\infty$ est donc plus stricte que la simple convergence de la suite (qui, elle, ' +
            'tolère aussi q = 1).',
        },
        {
          kind: 'exemple',
          badge: 'somme infinie, |q| < 1',
          formula: '$u_1 = 8$, $q = \\dfrac{1}{2}$. Comme |q| = 0,5 < 1, $S_\\infty$ existe.',
          steps: [],
          result: { tag: 'somme infinie', text: '$S_\\infty = \\dfrac{8}{1-0{,}5} = \\dfrac{8}{0{,}5} = 16$' },
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 8, label: '8' },
              { n: 2, value: 4, label: '4' },
              { n: 3, value: 2, label: '2' },
              { n: 4, value: 1, label: '1' },
              { n: 5, value: 0.5, label: '0,5' },
              { n: 6, value: 0.25, label: '0,25' },
            ],
            connector: 'smooth',
            trendLabel: { afterIndex: 5, text: 'u_n → 0' },
            xAxisLabel: 'n',
            yAxisLabel: 'u_n',
            caption: 'termes de la suite u₁=8, q=0,5 — chaque terme est la moitié du précédent, la suite tend vers 0',
          },
        },
        {
          kind: 'astuce',
          label: 'Astuce — le signe de q gouverne l\'alternance',
          text:
            'Si $q > 0$, tous les termes gardent le signe de $u_1$. Si $q < 0$, le signe ' +
            'alterne à chaque terme ($u_1$, $-|u_1q|$, $+|u_1q^2|$, …) : c\'est un excellent ' +
            'indice visuel pour repérer q négatif rien qu\'en lisant une liste de termes.',
        },
        {
          kind: 'methode',
          label: 'Démonstration — d\'où vient la formule de S_n ?',
          items: [
            'On multiplie la somme par q, puis on soustrait : presque tous les termes ' +
              's\'annulent. $S_n = u_1+u_2+\\ldots+u_n$ et $q \\times S_n = u_2+u_3+\\ldots+u_n+u_{n+1}$.',
            'En soustrayant terme à terme, tous les termes du milieu ($u_2$ à $u_n$) ' +
              's\'annulent — il ne reste que le tout premier et le tout dernier : ' +
              '$S_n(1-q) = u_1 - u_{n+1} = u_1 - u_1q^n = u_1(1-q^n)$.',
            '$S_n = u_1 \\times \\dfrac{1-q^n}{1-q}$ (q≠1)',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Suites géométriques, formule générale et termes',
          generatorId: '5gen15',
          description: [
            'Retrouve la raison, le premier terme, un terme quelconque, la somme finie ou la ' +
              'somme infinie (quand elle existe) d\'une suite géométrique à partir de deux ' +
              'données au choix.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 15. Suites géométriques, formule générale et termes »',
        },
      ],
    },
    {
      id: 'convergence-divergence',
      number: 3,
      title: 'Convergence et divergence des suites',
      kicker: 'classer une suite arithmétique, géométrique ou rationnelle selon son comportement à l\'infini',
      blocks: [
        {
          kind: 'para',
          text:
            'Une suite **converge** quand ses termes se rapprochent d\'une valeur fixe lorsque ' +
            'n devient très grand ; sinon, elle **diverge** (vers +∞, vers −∞, ou sans limite ' +
            'du tout, en oscillant). Le classement se fait différemment selon la famille de la suite.',
        },
        {
          kind: 'methode',
          label: 'Méthode — classer selon la famille',
          items: [
            '**Arithmétique** — seul le signe de r compte : r=0 (constante) converge ; r≠0 ' +
              'diverge (vers +∞ si r>0, vers −∞ si r<0).',
            '**Géométrique** — |q|<1 converge vers 0 ; q=1 (constante) converge ; q>1 diverge ' +
              'vers ±∞ (selon le signe de u₁) ; q=−1 oscille entre u₁ et −u₁ sans converger ; ' +
              'q<−1 oscille avec une amplitude qui grandit indéfiniment.',
            '**Rationnelle** $u_n=P(n)/Q(n)$ — comparer les degrés de P et Q.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'les 3 cas d\'une suite rationnelle',
          steps: [
            {
              tag: 'degré(P) < degré(Q) — la limite est 0',
              text: '$u_n = \\dfrac{2n+1}{n^2+3}$ — à n=100 : $\\dfrac{201}{10\\,003} \\approx 0{,}0201$, de plus en plus proche de 0',
            },
            {
              tag: 'degré(P) = degré(Q) — la limite est le rapport des coefficients dominants',
              text: '$u_n = \\dfrac{3n^2+2}{n^2+5}$ — limite = $3/1=3$ ; à n=100 : $\\dfrac{30\\,002}{10\\,005} \\approx 2{,}9987$',
            },
          ],
          result: {
            tag: 'degré(P) > degré(Q) — la suite diverge (ici vers +∞)',
            text: '$u_n = \\dfrac{n^2+1}{n+2}$ — à n=100 : $\\dfrac{10\\,001}{102} \\approx 98{,}05$, en croissance sans borne',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — q=−1 n\'est ni « converge » ni « diverge vers l\'infini »',
          text:
            'Une suite géométrique de raison $q = -1$ (par exemple $u_1=5$ : 5, −5, 5, −5, …) ' +
            'reste toujours bornée entre u₁ et −u₁ — elle ne part donc jamais vers l\'infini — ' +
            'mais elle ne se stabilise pas non plus sur une seule valeur : elle **oscille**, ' +
            'sans converger. Ne classe jamais ce cas dans « diverge vers +∞ » ou « diverge vers ' +
            '−∞ » : la bonne catégorie est « oscille, ne converge pas ». Pour $q < -1$, ' +
            'l\'amplitude de l\'oscillation grandit en plus indéfiniment — la suite diverge, ' +
            'mais toujours sans limite signée.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — pour une suite rationnelle, diviser par la puissance dominante de n',
          text:
            'Pour retrouver la limite d\'une suite $u_n=P(n)/Q(n)$, divise numérateur ET ' +
            'dénominateur par la plus haute puissance de n **au dénominateur** : tous les ' +
            'termes en 1/n, 1/n² … tendent alors vers 0, et il ne reste que le rapport des ' +
            'coefficients dominants (ou 0, ou une croissance sans borne selon les degrés restants).',
        },
        {
          kind: 'entrainement',
          title: 'Convergence et divergence des suites',
          generatorId: '5gen16',
          description: [
            'Classe des suites arithmétiques, géométriques et rationnelles selon leur ' +
              'comportement à l\'infini : convergente, divergente vers +∞/−∞, ou oscillante sans limite.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 16. Convergence et divergence des suites »',
        },
      ],
    },
    {
      id: 'problemes-classiques',
      number: 4,
      title: 'Problèmes classiques sur les suites',
      kicker: 'traduire une mise en situation en suite arithmétique ou géométrique',
      blocks: [
        {
          kind: 'para',
          text:
            'De nombreuses situations concrètes se ramènent à une suite arithmétique ou ' +
            'géométrique — à condition de bien identifier ce qui joue le rôle de raison, et si ' +
            'celle-ci s\'ajoute ou se multiplie d\'une étape à l\'autre.',
        },
        {
          kind: 'exemple',
          badge: 'légende du jeu d\'échecs — grains de blé',
          formula:
            'Selon la légende, l\'inventeur du jeu d\'échecs demande pour récompense un grain ' +
            'de blé sur la première case de l\'échiquier, deux sur la deuxième, quatre sur la ' +
            'troisième, et ainsi de suite en doublant à chaque case, jusqu\'à la 64ᵉ. Combien de ' +
            'grains sur la 64ᵉ case ? Et au total sur les 64 cases ?',
          steps: [
            { tag: 'reconnaître la suite — chaque case double la précédente : géométrique de raison q=2', text: '$u_1 = 1,\\ q = 2$' },
            { tag: 'petit cas de contrôle, 4 cases — S₄ = (2⁴−1)/(2−1)', text: '$1+2+4+8 = 15 = 2^4-1$ ✓' },
            { tag: 'grains sur la 64ᵉ case — u_n = u₁ × q^(n−1)', text: '$u_{64} = 1 \\times 2^{63} = 9\\,223\\,372\\,036\\,854\\,775\\,808$' },
          ],
          result: {
            tag: 'total sur les 64 cases — S_n = u₁(1−qⁿ)/(1−q)',
            text: '$S_{64} = \\dfrac{1-2^{64}}{1-2} = 2^{64}-1 = 18\\,446\\,744\\,073\\,709\\,551\\,615$ grains',
          },
        },
        {
          kind: 'astuce',
          text:
            'Un nombre qui dépasse largement toute la production mondiale de blé — l\'exemple ' +
            'classique pour montrer à quel point une croissance géométrique explose vite, même ' +
            'avec la plus petite raison entière possible (q=2).',
        },
        { kind: 'video', title: 'Visualiser la croissance de l\'échiquier de blé' },
        {
          kind: 'attention',
          label: 'Attention — identifier ce qui varie AVANT de choisir le modèle',
          text:
            'Un capital qui gagne « 3 % d\'intérêt chaque année » est **géométrique** (on ' +
            'multiplie par 1,03 à chaque étape), alors qu\'un capital qui gagne « 30 € chaque ' +
            'année » est **arithmétique** (on ajoute toujours 30). Un même mot — « augmente » ' +
            '— peut donc cacher les deux mécanismes : c\'est la formulation précise de ' +
            'l\'énoncé (« pourcentage » vs « montant fixe ») qui tranche, jamais une habitude ' +
            'de lecture rapide.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — vérifier sur un petit cas avant de calculer le grand',
          text:
            'Avant de te lancer dans $u_{64}$ ou $S_{64}$, vérifie ta formule sur un petit ' +
            'nombre de termes que tu peux additionner à la main (voir la ligne « petit cas de ' +
            'contrôle » ci-dessus) — une erreur de formule se voit tout de suite sur 4 termes, ' +
            'jamais sur 64.',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes classiques sur les suites',
          generatorId: '5gen17',
          description: [
            'Traduis des mises en situation concrètes (échiquier de blé, épargne, population, ' +
              'triangles emboîtés, suite de Fibonacci…) en suite arithmétique ou géométrique, ' +
              'puis résous à plusieurs inconnues.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 17. Problèmes classiques sur les suites »',
        },
      ],
    },
    {
      id: 'comparaison-numerique',
      number: 5,
      title: 'Comparaison numérique de deux suites',
      kicker: 'tableau de valeurs, rang de bascule, traduire l\'indice dans l\'unité du contexte',
      blocks: [
        {
          kind: 'para',
          text:
            'Comparer deux suites ne demande pas toujours de résoudre une équation : on peut ' +
            'simplement calculer les deux suites terme à terme, dans un tableau, jusqu\'à ' +
            'repérer le rang à partir duquel une condition (par exemple « $u_n > v_n$ ») ' +
            'devient vraie et le reste ensuite.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — deux villes, deux modèles de croissance',
          blocks: [
            {
              kind: 'para',
              text:
                'En l\'an 2000, la ville A compte 2000 habitants et croît de 10 % par an ' +
                '(géométrique, $u_1$=2000, q=1,1). La même année, la ville B compte 5000 ' +
                'habitants et croît de 200 habitants par an (arithmétique, $v_1$=5000, r=200). ' +
                'À partir de quelle année la ville A dépasse-t-elle la ville B ?',
            },
            {
              kind: 'featureTable',
              headers: ['n (année)', 'uₙ (ville A)', 'vₙ (ville B)', 'uₙ > vₙ ?'],
              rows: [
                ['15 (2014)', '≈ 7 595', '7 800', 'non'],
                ['**16 (2015)**', '**≈ 8 354**', '**8 000**', '**oui — bascule ici**'],
                ['17 (2016)', '≈ 9 190', '8 200', 'oui'],
              ],
            },
            { kind: 'para', text: 'Conclusion : n = 16, ce qui correspond à l\'année 2000 + (16−1) = **2015**.' },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (n) => 2000 * Math.pow(1.1, n - 1), tone: 'accent' },
                  { fn: (n) => 5000 + 200 * (n - 1), tone: 'good' },
                ],
                xMin: 1,
                xMax: 17,
                xTicks: [1, 5, 10, 15],
                fixedYRange: { min: 0, max: 9500 },
                points: [{ x: 16, y: 2000 * Math.pow(1.1, 15), label: 'bascule (n=16)', tone: 'accent' }],
                xAxisLabel: 'n',
                yAxisLabel: 'habitants',
                caption: 'A (géométrique, en accent) accélère et finit par dépasser B (arithmétique, en vert), au rang n=16',
              },
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège du second champ — ne pas laisser la réponse en simple numéro de rang',
          text:
            'Trouver $n = 16$ ne répond qu\'à moitié à la question « à partir de quelle ' +
            '**année** ». Le second champ — la traduction de n dans l\'unité du contexte (ici, ' +
            'l\'année réelle) — fait partie intégrante de la réponse : oublier de convertir ' +
            'l\'indice n en année, en mois, ou en toute autre unité du contexte est une erreur ' +
            'aussi grave que de se tromper sur n lui-même.',
        },
        {
          kind: 'attention',
          label: 'Attention — vérifier que le cran précédent ne satisfait pas déjà la condition',
          text:
            'Un rang n qui satisfait $u_n > v_n$ ne suffit pas à conclure que c\'est le ' +
            '**bon** rang de bascule : il faut aussi vérifier que la condition est encore ' +
            '**fausse** au rang précédent (n−1). Dans l\'exemple ci-dessus, n=17 vérifie bien ' +
            '$u_{17}>v_{17}$, mais ce n\'est pas le premier rang à le faire — c\'est n=16, ' +
            'puisqu\'à n=15 la condition est encore fausse (7 595 < 7 800).',
        },
        {
          kind: 'entrainement',
          title: 'Comparaison numérique de deux suites',
          generatorId: '5gen18',
          description: [
            'Complète un tableau de valeurs pour deux suites en situation concrète, détermine ' +
              'le rang exact de bascule d\'une condition, puis traduis ce rang dans l\'unité du ' +
              'contexte (année, mois…).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 18. Comparaison numérique de deux suites »',
        },
      ],
    },
    {
      id: 'recurrente-affine',
      number: 6,
      title: 'Suite récurrente affine et régime permanent',
      kicker: 'u_(n+1) = a×u_n + b — point fixe L = b/(1−a), convergence si |a| < 1',
      blocks: [
        {
          kind: 'para',
          text:
            'Une suite **récurrente affine** combine les deux mécanismes précédents dans une ' +
            'seule relation : $u_{n+1} = a \\times u_n + b$, avec $a \\neq 1$ (sinon c\'est une ' +
            'suite arithmétique) et $b \\neq 0$ (sinon c\'est une suite géométrique). Si elle ' +
            'converge, elle se stabilise autour d\'une valeur particulière : le **régime permanent**.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — le point fixe L',
          items: [
            'Si la suite converge, sa limite $L$ vérifie $L = a \\times L + b$ (le terme ' +
              'suivant est identique au terme lui-même, à l\'équilibre) — d\'où ' +
              '$L = \\dfrac{b}{1-a}$ (a≠1). Cette convergence n\'a lieu que si $|a| < 1$ ; ' +
              'sinon L n\'existe pas.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'dilution — régime convergent',
          formula:
            'Un réservoir contient 5 L d\'un produit dilué. Chaque jour, 25 % du contenu est ' +
            'retiré et remplacé par 4 L de produit pur : $u_{n+1} = 0{,}75 \\times u_n + 4$, ' +
            'avec $u_1 = 5$.',
          steps: [
            { tag: 'condition de convergence', text: '$|a| = |0{,}75| < 1 \\implies$ la suite converge' },
            { tag: 'premiers termes — u_(n+1) = 0,75×u_n + 4, calculés un par un', text: '$u_1=5 \\to u_2=7{,}75 \\to u_3=9{,}8125 \\to u_4 \\approx 11{,}36$' },
          ],
          result: { tag: 'régime permanent — L = b/(1−a)', text: '$L = \\dfrac{4}{1-0{,}75} = \\dfrac{4}{0{,}25} = 16$' },
          illustration: {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 5, label: '5' },
              { n: 2, value: 7.75, label: '7,75' },
              { n: 3, value: 9.8125, label: '9,81' },
              { n: 4, value: 11.359375, label: '11,36' },
              { n: 5, value: 12.51953125, label: '12,52' },
              { n: 6, value: 13.3896484375, label: '13,39' },
            ],
            connector: 'smooth',
            referenceLine: { value: 16, label: 'L=16' },
            xAxisLabel: 'n',
            yAxisLabel: 'u_n',
            caption: 'les termes se rapprochent de plus en plus de L=16, sans jamais tout à fait l\'atteindre',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — vérifier |a| < 1 avant même de calculer L',
          text:
            'Si $|a| \\ge 1$ (par exemple $a=1{,}2$), la formule $L=b/(1-a)$ donne encore un ' +
            'nombre — mais ce nombre **n\'est pas une limite** : la suite diverge. Avec ' +
            'a=1,2, b=3, u₁=2 : $u_2=1{,}2\\times2+3=5{,}4$ ; $u_3=1{,}2\\times5{,}4+3=9{,}48$ ; ' +
            '$u_4=1{,}2\\times9{,}48+3=14{,}376$ — les termes s\'éloignent de plus en plus, ils ' +
            'ne se rapprochent d\'aucune valeur. La bonne réponse ici est « le régime permanent ' +
            'n\'existe pas », jamais une valeur numérique calculée à partir d\'un a qui ne le permet pas.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — les cas limites sont des suites déjà connues',
          text:
            'Si $a=1$, la relation devient $u_{n+1}=u_n+b$ — une suite arithmétique de raison ' +
            'b, déguisée. Si $b=0$, elle devient $u_{n+1}=a \\times u_n$ — une suite ' +
            'géométrique de raison a, déguisée. Reconnaître ces deux cas particuliers permet de ' +
            'retomber directement sur les formules déjà connues, sans repasser par L.',
        },
        {
          kind: 'entrainement',
          title: 'Suite récurrente affine et régime permanent',
          generatorId: '5gen19',
          description: [
            'Pose une relation de récurrence affine à partir d\'un contexte de dosage, ' +
              'détermine si un régime permanent existe et calcule-le le cas échéant, puis ' +
              'calcule les premiers termes de la suite.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 19. Suite récurrente affine et régime permanent »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Suite arithmétique** — $u_{n+1}=u_n+r$, $u_n=u_1+(n-1)r$ (jamais n×r), ' +
        '$S_n=n(u_1+u_n)/2$ (démontrée par la double somme) ; le signe de r fixe le sens de ' +
        'variation ; tout terme est la moyenne arithmétique de ses voisins.',
      '**Suite géométrique** — $u_{n+1}=u_n \\times q$, $u_n=u_1 \\times q^{n-1}$, ' +
        '$S_n=u_1(1-q^n)/(1-q)$ (démontrée par télescopage $S_n-qS_n$) ; ' +
        '$S_\\infty=u_1/(1-q)$ seulement si $|q|<1$ STRICTEMENT (q=1 converge mais $S_\\infty$ ' +
        'n\'existe pas) ; tout terme positif est la moyenne géométrique de ses voisins.',
      '**Convergence/divergence** — arithmétique : signe de r ; géométrique : |q| et signe de ' +
        'q (attention à q=−1, qui oscille sans converger ni diverger vers l\'infini) ; ' +
        'rationnelle $P(n)/Q(n)$ : comparer les degrés.',
      '**Problèmes classiques** — bien distinguer « ajoute un montant fixe » (arithmétique) de ' +
        '« multiplie par un facteur fixe » (géométrique) avant de choisir le modèle.',
      '**Comparaison numérique** — tableau de valeurs jusqu\'au rang de bascule ; vérifier que ' +
        'la condition est fausse au rang précédent ; toujours traduire n dans l\'unité du contexte.',
      '**Suite récurrente affine** — $u_{n+1}=a \\times u_n+b$, $L=b/(1-a)$ si $|a|<1$ ' +
        'STRICTEMENT ; sinon le régime permanent n\'existe pas, quel que soit ce que donnerait la formule.',
    ],
    checklist: {
      items: [
        'Pour $u_n$ : ai-je bien utilisé (n−1) pas depuis $u_1$, jamais n pas ?',
        'Pour $S_\\infty$ ou pour L : ai-je vérifié |q|<1 (ou |a|<1) STRICTEMENT, pas seulement ' +
          'que la suite elle-même converge ?',
        'Pour un rang de bascule : ai-je vérifié que la condition est fausse juste avant, et ' +
          'traduit n dans l\'unité du contexte ?',
        'Pour un problème concret : ai-je bien identifié si la variation est un montant fixe ' +
          '(arithmétique) ou un facteur fixe (géométrique) ?',
      ],
    },
    forward:
      'Ces mêmes suites reviendront comme point de départ du chapitre suivant, où l\'on ' +
      'cherchera cette fois le comportement d\'une fonction — plutôt que d\'une liste de ' +
      'termes — lorsque la variable devient très grande.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen41',
      description: [
        '7 thèmes de 20 affirmations chacun (suites arithmétiques, suites géométriques, ' +
          'convergence et divergence, problèmes classiques, comparaison numérique, suite ' +
          'récurrente affine, transversal) — choisis un thème, réponds vrai ou faux, la ' +
          'justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 41. Suites — quiz vrai/faux »',
    },
  },
}
