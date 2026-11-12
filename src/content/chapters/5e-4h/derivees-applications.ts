import type { ChapterContent } from '../../types'

export const deriveesApplications: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 5,
  title: 'Dérivées et applications',
  slug: 'derivees-applications',
  lede:
    "La **dérivée** d'une fonction en un point, c'est sa pente exacte à cet instant précis — la " +
    "suite directe des limites du chapitre précédent (la dérivée EST une limite !). Dans ce " +
    "chapitre, tu pars de sa définition, tu t'en sers pour tracer une tangente, puis tu " +
    "apprends à calculer n'importe quelle dérivée avec des règles simples. Ensuite, tu étudies " +
    "les variations et les extremums d'une fonction, tu mènes une étude complète, et tu lis " +
    "tout ça directement sur un graphique. Pour finir : l'optimisation, l'économie, et le mouvement.",

  sections: [
    {
      id: 'definition-derivee',
      number: 1,
      title: "Calculer f'(a) par la définition",
      kicker: "taux d'accroissement, limite quand h→0, interprétation géométrique (pente de la tangente)",
      blocks: [
        { kind: 'video', title: 'Calculer f\'(a) par la définition : taux d\'accroissement, sécante et tangente', youtubeId: 'H1pEUBMk200' },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text:
            "Imagine que tu es en voiture. Ton compteur de vitesse affiche un nombre à **chaque " +
            "instant** — pas une moyenne sur tout le trajet, une valeur précise, là, maintenant. " +
            "C'est exactement ce que mesure une dérivée : pas une vitesse moyenne entre deux " +
            "points, mais la pente **exacte** de la courbe en un seul point. Le taux " +
            "d'accroissement ci-dessous, c'est la vitesse moyenne du trajet. La dérivée f'(a), " +
            "c'est ce que ton compteur affiche à l'instant a.",
        },
        {
          kind: 'rappel',
          label: 'Rappel — définition du nombre dérivé',
          items: [
            'Le **taux d\'accroissement** de f entre a et a+h, c\'est $\\dfrac{f(a+h)-f(a)}{h}$. ' +
              'C\'est la pente de la **sécante** — la droite qui relie les points (a;f(a)) et ' +
              '(a+h;f(a+h)). Fais tendre h vers 0, comme au chapitre précédent : la limite de ce ' +
              'taux, c\'est le **nombre dérivé** f\'(a). $f\'(a) = \\displaystyle\\lim_{h \\to 0} \\dfrac{f(a+h)-f(a)}{h}$.',
          ],
        },
        {
          kind: 'para',
          text:
            'Géométriquement, que se passe-t-il quand h se rapproche de 0 ? Le point ' +
            '(a+h;f(a+h)) glisse le long de la courbe, de plus en plus près de (a;f(a)). La ' +
            '**sécante** pivote petit à petit — jusqu\'à devenir la **tangente** en a. Sa pente ' +
            'limite, c\'est exactement f\'(a).',
        },
        {
          kind: 'exemple',
          badge: 'f\'(a) par la définition, sur une fonction quadratique',
          formula: '$f(x) = x^2-3$, a = 2. Calcule f\'(2) par la définition.',
          steps: [
            { tag: 'f(2)', text: '$f(2) = 4-3 = 1$' },
            { tag: 'développer f(2+h)', text: '$f(2+h) = (2+h)^2-3 = 4+4h+h^2-3 = 1+4h+h^2$' },
            {
              tag: 'taux d\'accroissement, simplifié au maximum',
              text: '$\\dfrac{f(2+h)-f(2)}{h} = \\dfrac{(1+4h+h^2)-1}{h} = \\dfrac{4h+h^2}{h} = 4+h$ (valable pour h≠0)',
            },
          ],
          result: { tag: 'passer à la limite', text: '$f\'(2) = \\displaystyle\\lim_{h \\to 0} (4+h) = 4$' },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x - 3, tone: 'accent' },
              { fn: (x) => 1 + 5 * (x - 2), tone: 'faint', xMin: 1.6, xMax: 3.3 },
              { fn: (x) => 1 + 4.5 * (x - 2), tone: 'faint', xMin: 1.6, xMax: 2.9 },
              { fn: (x) => 1 + 4 * (x - 2), tone: 'good', xMin: 1, xMax: 3.4 },
            ],
            xMin: -0.3,
            xMax: 3.4,
            xTicks: [2],
            fixedYRange: { min: -3.5, max: 8 },
            points: [{ x: 2, y: 1, label: 'A(2;1)', tone: 'accent', labelPos: 'right' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=x^2-3$ — la sécante pour h=1 a une pente de 5, celle pour h=0,5 une pente de 4,5. ' +
              'Elles se rapprochent de la tangente en A, de pente f\'(2)=4.',
          },
        },
        {
          kind: 'para',
          text:
            'Pour **voir** la limite se former, calcule ce taux pour des valeurs de h de plus en ' +
            'plus petites, des deux côtés de 0 (ici, le taux simplifié vaut $4+h$) :',
        },
        {
          kind: 'featureTable',
          headers: ['h', 'taux d\'accroissement'],
          rows: [
            ['$1$', '$\\dfrac{f(3)-f(2)}{1} = 5$'],
            ['$0{,}1$', '$4{,}1$'],
            ['$0{,}01$', '$4{,}01$'],
            ['$-0{,}01$', '$3{,}99$'],
            ['$-0{,}1$', '$3{,}9$'],
          ],
        },
        {
          kind: 'para',
          text:
            'Les taux se rapprochent de 4 par au-dessus ($h > 0$) comme par en dessous ($h < 0$) : ' +
            'c\'est exactement ce que veut dire $f\'(2) = 4$.',
        },
        {
          kind: 'methode',
          label: 'Le squelette, valable pour toute fonction',
          items: [
            'Calcule $f(a)$. Écris $f(a+h)$ en fonction de h : développe-le pour un polynôme ; ' +
              'pour une fraction, ne développe rien, tu réduiras au même dénominateur à l\'étape suivante.',
            'Forme le taux d\'accroissement $\\dfrac{f(a+h)-f(a)}{h}$, puis simplifie-le par h. ' +
              'Il est prêt quand il ne reste plus de facteur h qui annulerait le dénominateur — ' +
              'un h peut rester ailleurs, comme dans $\\dfrac{-3}{1+h}$.',
            'Fais tendre h vers 0 sur l\'expression SIMPLIFIÉE. Tu obtiens f\'(a).',
          ],
        },
        {
          kind: 'attention',
          label: 'Ne jamais remplacer h par 0 AVANT d\'avoir simplifié',
          text:
            'Le taux d\'accroissement brut $\\dfrac{f(a+h)-f(a)}{h}$ vaut toujours $\\frac{0}{0}$ en $h=0$ — ' +
            'une forme indéterminée, comme au chapitre précédent. C\'est exactement pourquoi il ' +
            'faut d\'abord SIMPLIFIER par h (factorisation, ou technique du conjugué pour une ' +
            'racine) avant de faire tendre h vers 0. Jamais l\'inverse !',
        },
        {
          kind: 'astuce',
          label: 'La définition marche pour toute fonction, même sans racine',
          text:
            'Pour $f(x)=\\sqrt{x}$, le taux d\'accroissement se simplifie avec l\'expression ' +
            'conjuguée — comme au chapitre précédent (forme $\\infty-\\infty$ ou $\\frac{0}{0}$ selon l\'écriture). La ' +
            'méthode générale ne change jamais. Seule la technique de simplification s\'adapte ' +
            'à la forme de f.',
        },
        {
          kind: 'exemple',
          badge: 'f\'(a) par la définition, sur une fonction rationnelle',
          formula: '$f(x) = \\dfrac{2x+1}{x-1}$, a = 2. Calcule f\'(2) par la définition.',
          steps: [
            { tag: 'f(2) et f(2+h), sans développer', text: '$f(2) = \\dfrac{5}{1} = 5$ ; $f(2+h) = \\dfrac{2(2+h)+1}{(2+h)-1} = \\dfrac{5+2h}{1+h}$' },
            {
              tag: 'taux d\'accroissement — même dénominateur, puis simplifié par h',
              text: '$\\dfrac{f(2+h)-f(2)}{h} = \\dfrac{1}{h} \\cdot \\dfrac{5+2h-5(1+h)}{1+h} = \\dfrac{1}{h} \\cdot \\dfrac{-3h}{1+h} = \\dfrac{-3}{1+h}$ (valable pour h≠0)',
            },
          ],
          result: { tag: 'passer à la limite', text: '$f\'(2) = \\displaystyle\\lim_{h \\to 0} \\dfrac{-3}{1+h} = -3$' },
        },
        {
          kind: 'historique',
          titre: 'Le vrai premier inventeur de la dérivée ?',
          text:
            "Bien avant Newton et Leibniz, le juriste et mathématicien français **Pierre de " +
            "Fermat** développe dans les années 1630 une méthode, qu'il appelle « adégalité » (adaequalitas), " +
            "pour trouver le maximum ou le minimum d'une courbe — et, au passage, sa tangente " +
            'en un point. Son idée ressemble étonnamment à celle de cette section : il compare ' +
            "la valeur de f en un point a à sa valeur en a+h, simplifie, puis fait disparaître " +
            "h — sans jamais disposer du concept rigoureux de limite, qui n'existera que deux " +
            "siècles plus tard. Newton lui-même reconnaîtra plus tard s'être inspiré de la " +
            'méthode de Fermat. Beaucoup d\'historiens des mathématiques considèrent donc ' +
            'Fermat comme le véritable précurseur du calcul différentiel, des décennies avant ' +
            'que Newton et Leibniz ne le formalisent.',
          image: {
            src: '/images/historique/fermat.jpg',
            alt: 'Portrait de Pierre de Fermat',
            caption: 'Pierre de Fermat (1601–1665), portrait anonyme du 17e siècle.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Calculer f\'(a) par la définition',
          generatorId: '5gen26',
          description: [
            'Calcule f(a) et f(a+h), simplifie le taux d\'accroissement, puis passe à la limite ' +
              'pour obtenir f\'(a) — sur des fonctions affines, quadratiques et rationnelles ' +
              '(k/x, k/x², (mx+p)/(x−q)).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 26. Calculer f\'(a) par la définition »',
        },
      ],
    },
    {
      id: 'tangentes',
      number: 2,
      title: 'Tangentes',
      kicker: 'y=f(a)+f\'(a)(x−a) ; tangente horizontale ⟺ f\'(a)=0 ; tangente vs sécante ; double tangence',
      blocks: [
        { kind: 'video', title: 'Équation d\'une tangente : y = f(a) + f\'(a)(x − a), tangente horizontale, tangente ≠ sécante', youtubeId: 'fD-HtssXw2w' },
        {
          kind: 'intuition',
          label: 'Zoome sur la courbe',
          text:
            "Zoome de plus en plus près sur une courbe, à un endroit précis. Plus tu zoomes, " +
            "plus elle ressemble à... une droite ! C'est cette droite-limite qui est la " +
            "**tangente**. Elle épouse la courbe de si près, à cet endroit, qu'aucune autre " +
            "droite ne colle mieux : c'est la meilleure approximation de la courbe par une " +
            "droite, juste autour de ce point.",
        },
        {
          kind: 'rappel',
          label: 'Rappel — équation de la tangente en un point',
          items: [
            'La tangente à la courbe de f, au point d\'abscisse a, c\'est la droite qui passe ' +
              'par (a;f(a)) avec pour pente f\'(a). Sa pente EST le nombre dérivé — c\'est même ' +
              'sa définition (section 1) : $y = f(a) + f\'(a)(x-a)$.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Pour dériver un polynôme dès maintenant',
          items: [
            'Dérive terme à terme avec $(x^n)\' = n\\,x^{n-1}$, $(k \\cdot u)\' = k \\cdot u\'$ et ' +
              '$(u+v)\' = u\'+v\'$ — ces règles sont démontrées et complétées en section 3. ' +
              'Exemple : $(x^2-2x+1)\' = 2x-2$. Tu peux toujours contrôler une valeur $f\'(a)$ ' +
              'par la définition (section 1).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'équation de la tangente en un point donné',
          formula: '$f(x) = x^2-2x+1$, a=3. Détermine l\'équation de la tangente en x=3.',
          steps: [
            { tag: 'f(3)', text: '$f(3) = 9-6+1 = 4$' },
            { tag: 'f\'(x) puis f\'(3)', text: '$f\'(x) = 2x-2 \\implies f\'(3) = 6-2 = 4$' },
            { tag: 'substituer dans y=f(a)+f\'(a)(x−a)', text: '$y = 4 + 4(x-3) = 4 + 4x - 12$' },
          ],
          result: { tag: 'équation simplifiée', text: '$y = 4x - 8$' },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x - 1) * (x - 1), tone: 'accent' },
              { fn: (x) => 4 + 4 * (x - 3), tone: 'good', xMin: 1.6, xMax: 4.5 },
              { fn: () => 0, tone: 'good', xMin: 0.5, xMax: 1.5 },
            ],
            xMin: -0.5,
            xMax: 4.5,
            xTicks: [3],
            fixedYRange: { min: -1, max: 11 },
            points: [
              { x: 3, y: 4, label: 'a=3 : (3;4)', tone: 'accent', labelPos: 'above' },
              { x: 1, y: 0, label: 'a=1 : tangente horizontale', tone: 'good', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=(x-1)^2$ — la tangente au point (3;4) est oblique, de pente $f\'(3)=4$. Au ' +
              'point (1;0), elle est horizontale, de pente $f\'(1)=0$.',
          },
        },
        {
          kind: 'methode',
          label: 'Tangente horizontale',
          items: [
            'Une tangente est **horizontale** exactement quand sa pente est nulle — quand ' +
              '$f\'(a) = 0$. Reprends $f(x)=x^2-2x+1$ : $f\'(x)=2x-2=0 \\iff x=1$, et ' +
              '$f(1)=1-2+1=0$. La tangente en x=1 est donc la droite $y=0$ : l\'axe des abscisses lui-même !',
          ],
        },
        {
          kind: 'attention',
          label: 'Tangente ≠ sécante',
          text:
            'Une **sécante** relie DEUX points distincts de la courbe, (a;f(a)) et (b;f(b)). Sa ' +
            'pente, c\'est $\\dfrac{f(b)-f(a)}{b-a}$ — le taux d\'accroissement de la section 1. ' +
            'La **tangente** en a est la position LIMITE de cette sécante quand b se rapproche ' +
            'de a : sa pente est f\'(a). **Localement**, au voisinage du point de contact, elle ne ' +
            'touche la courbe qu\'en ce point. Mais plus loin, elle peut très bien recouper la ' +
            'courbe : la tangente à $y=x^3$ en 1, $y=3x-2$, la recoupe en $x=-2$. Une même droite ' +
            'peut même être tangente en deux points (double tangence, ci-dessous).',
        },
        {
          kind: 'astuce',
          label: 'Deux points de contrôle avant de conclure',
          text:
            'Une équation de tangente correcte doit toujours vérifier DEUX choses. Elle passe ' +
            'par le point (a;f(a)) — teste x=a dans ton équation, tu dois retrouver f(a). Et ' +
            'elle a la bonne pente — le coefficient de x doit être exactement f\'(a). Cette ' +
            'double vérification repère immédiatement une erreur.',
        },
        {
          kind: 'exemple',
          badge: 'une droite tangente en deux points (double tangence)',
          formula:
            '$f(x) = x^4 - 2x^2 + 2x + 1$. Détermine la tangente au point d\'abscisse p = 1, puis ' +
            'montre qu\'elle est aussi tangente à la courbe en un second point.',
          steps: [
            { tag: 'tangente en p = 1', text: '$f(1) = 2$ ; $f\'(x) = 4x^3 - 4x + 2 \\implies f\'(1) = 2$ ; $t : y = 2 + 2(x-1) = 2x$' },
            {
              tag: 'points communs : résoudre f(x) = t(x) — x = 1 est racine double',
              text: '$f(x) - 2x = x^4 - 2x^2 + 1$ ; on factorise par $(x-1)^2$ : $x^4 - 2x^2 + 1 = (x-1)^2(x+1)^2$',
            },
            { tag: 'second point commun', text: '$q = -1$, avec $f(-1) = -2 = t(-1)$' },
            { tag: 'vérifier la pente en q', text: '$f\'(-1) = -4 + 4 + 2 = 2$ : c\'est la pente de t' },
          ],
          result: {
            tag: 'conclusion',
            text: 'La droite $y = 2x$ est tangente à la courbe en $x = 1$ ET en $x = -1$ : double tangence.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x ** 4 - 2 * x * x + 2 * x + 1, tone: 'accent' },
              { fn: (x) => 2 * x, tone: 'good' },
            ],
            xMin: -1.9,
            xMax: 1.9,
            xTicks: [-1, 1],
            fixedYRange: { min: -4, max: 8 },
            points: [
              { x: -1, y: -2, label: '(−1;−2)', tone: 'good', labelPos: 'right' },
              { x: 1, y: 2, label: '(1;2)', tone: 'good', labelPos: 'left' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=x⁴−2x²+2x+1 et la droite y=2x, tangente à la courbe en deux points',
          },
        },
        {
          kind: 'astuce',
          label: 'Factoriser grâce à la racine double',
          text:
            'Pour une fonction polynomiale, $f(x) - t(x)$ s\'annule au point de contact a avec une ' +
            'racine (au moins) double : tu peux donc diviser par $(x-a)^2$. Le quotient donne les ' +
            'autres points communs. Un point commun q n\'est un point de tangence que si, en plus, ' +
            '$f\'(q)$ est égal à la pente de la droite.',
        },
        { kind: 'subheading', text: 'La tangente, meilleure approximation de la courbe' },
        {
          kind: 'rappel',
          label: 'Rappel — approximation affine',
          items: [
            'Près de a, la courbe et sa tangente se confondent. Pour h petit : ' +
              '$f(a+h) \\approx f(a) + f\'(a)\\,h$. C\'est la tangente qui sert de « règle » ' +
              'pour estimer f juste à côté d\'un point connu.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'approximation affine d\'une puissance',
          formula: 'Estime $1{,}02^3$ sans calculatrice, à l\'aide de la tangente à $f(x) = x^3$ en $a = 1$.',
          steps: [
            { tag: 'valeur et pente en a = 1', text: '$f(1) = 1$ ; $f\'(x) = 3x^2 \\implies f\'(1) = 3$' },
            { tag: 'approximation avec h = 0,02', text: '$f(1{,}02) \\approx f(1) + f\'(1) \\cdot 0{,}02 = 1 + 0{,}06 = 1{,}06$' },
          ],
          result: {
            tag: 'contrôle',
            text: 'la valeur exacte vaut $1{,}061208$ : l\'erreur est d\'environ $0{,}001$, d\'autant plus petite que h est petit.',
          },
        },
        {
          kind: 'historique',
          titre: 'Le professeur qui a préparé le terrain pour Newton',
          text:
            '**Isaac Barrow**, titulaire de la chaire de mathématiques à Cambridge, a pour ' +
            "élève, dans les années 1660, un certain Isaac Newton. Dans ses travaux de " +
            'géométrie, Barrow utilise une méthode qu\'il appelle le « triangle ' +
            'différentiel » : un petit triangle formé par un segment infinitésimal de la ' +
            'courbe, sa projection horizontale et sa projection verticale, dont le rapport des ' +
            "côtés donne directement la pente de la tangente — l'idée même que tu viens " +
            "d'appliquer dans cette section. En 1669, Barrow cède volontairement sa chaire à " +
            'son brillant élève, convaincu que Newton ira plus loin que lui. L\'histoire lui ' +
            'donnera raison : Newton bâtira sur ces fondations géométriques tout le calcul ' +
            'différentiel.',
          image: {
            src: '/images/historique/barrow.jpg',
            alt: 'Portrait d\'Isaac Barrow',
            caption: 'Isaac Barrow (1630–1677), portrait anonyme.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Tangentes',
          generatorId: '5gen28',
          description: [
            'Écris l\'équation de la tangente en un point donné. Trouve les points où la tangente ' +
              'est horizontale. Ou trouve le second point où une même droite est tangente à la ' +
              'courbe (double tangence), en calculant la pente en ce point.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 28. Tangentes »',
        },
      ],
    },
    {
      id: 'fonction-derivee',
      number: 3,
      title: 'Fonction dérivée',
      kicker:
        'fonction dérivée, domaine de dérivabilité, interprétation du nombre dérivé, dérivées de référence, règles de la somme/produit/quotient/chaîne',
      blocks: [
        { kind: 'video', title: 'La fonction dérivée : dérivabilité, taux de variation, dérivées de référence', youtubeId: 'ln0Bj-SX6K0' },
        { kind: 'video', title: 'Règles de dérivation : somme, produit, quotient et règle de la chaîne', youtubeId: 'a-iBVzWtiO8' },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ça',
          text:
            "Tu connais déjà le taux d'accroissement d'une fonction du premier degré depuis la " +
            "4e (le paramètre m, la pente de la droite). f'(a), c'est la même idée, appliquée à " +
            "N'IMPORTE QUELLE courbe, en un point précis plutôt que sur toute une droite. Rien " +
            "de neuf dans le principe — seulement dans le fait que la pente change maintenant " +
            "d'un point à l'autre.",
        },
        {
          kind: 'rappel',
          label: 'Rappel — domaine de dérivabilité et fonction dérivée',
          items: [
            'f est **dérivable en a** si f\'(a) existe — si la limite du taux d\'accroissement ' +
              'en a est un nombre réel (pas ±∞, pas indéfinie). L\'ensemble des réels où f est ' +
              'dérivable s\'appelle le **domaine de dérivabilité** de f, noté $\\text{dom}_d f$. ' +
              'Il peut être plus petit que dom f : $\\sqrt{x}$ est définie en 0, mais pas dérivable en 0 !',
            'Calcule f\'(a) par la définition (section 1), mais pour un a QUELCONQUE de ' +
              '$\\text{dom}_d f$ — plutôt que pour une seule valeur fixée. Tu obtiens une ' +
              'nouvelle fonction : la **fonction dérivée** f\', qui associe à chaque x son ' +
              'nombre dérivé f\'(x).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'fonction dérivée obtenue directement par la définition',
          formula: '$f(x) = 2x^2-3x$, dom f = ℝ. Détermine f\'(x) par la définition.',
          steps: [
            {
              tag: 'développer f(x+h) − f(x)',
              text: '$f(x+h) - f(x) = [2(x+h)^2-3(x+h)] - [2x^2-3x] = (2x^2+4xh+2h^2-3x-3h) - 2x^2 + 3x = 4xh+2h^2-3h$',
            },
            {
              tag: 'taux d\'accroissement, simplifié par h',
              text: '$\\dfrac{f(x+h)-f(x)}{h} = \\dfrac{4xh+2h^2-3h}{h} = 4x+2h-3$',
            },
          ],
          result: {
            tag: 'passer à la limite',
            text: '$f\'(x) = \\displaystyle\\lim_{h \\to 0} (4x+2h-3) = 4x-3$, $\\text{dom}_d f = \\mathbb{R}$',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — interpréter le nombre dérivé (et le comparer au taux de variation)',
          items: [
            'Le taux de variation (moyen, entre deux points) et le nombre dérivé (instantané, ' +
              'en un seul point) se lisent chacun de deux façons : graphique, et physique. ' +
              'Voici comment, pour un même type de calcul :',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', 'Définition', 'Interprétation graphique', 'Interprétation physique'],
          rows: [
            [
              'Taux de variation entre a et a+h',
              '$\\dfrac{f(a+h)-f(a)}{h}$',
              'pente de la sécante (AB), A(a;f(a)) et B(a+h;f(a+h))',
              'vitesse MOYENNE de variation entre les instants a et a+h',
            ],
            [
              'Nombre dérivé f\'(a)',
              '$f\'(a) = \\displaystyle\\lim_{h \\to 0} \\dfrac{f(a+h)-f(a)}{h}$',
              'pente de la tangente en A(a;f(a)) — limite de la sécante (AB) quand B glisse vers A',
              'vitesse INSTANTANÉE de variation à l\'instant a (voir section 11)',
            ],
          ],
        },
        { kind: 'subheading', text: 'Dérivées de référence' },
        {
          kind: 'featureTable',
          headers: ['f(x)', "f'(x)"],
          rows: [
            ['$x^n$', '$n\\,x^{n-1}$'],
            ['$\\sqrt{x}$ (dérivable pour $x > 0$)', '$\\dfrac{1}{2\\sqrt{x}}$'],
            ['$\\dfrac{1}{x}$', '$-\\dfrac{1}{x^2}$'],
            ['$\\sin x$', '$\\cos x$'],
            ['$\\cos x$', '$-\\sin x$'],
            ['$\\tan x$', '$\\dfrac{1}{\\cos^2 x}$'],
            ['$k$ (constante)', '$0$'],
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — 1/x et √x, retrouvées à partir de la définition (section 1)',
          blocks: [
            {
              kind: 'para',
              text:
                'Les deux entrées les moins évidentes du tableau ci-dessus, mieux vaut ne pas ' +
                'les apprendre par cœur sans savoir d\'où elles viennent. Tu peux les retrouver ' +
                'directement, avec la méthode de la section 1.',
            },
            { kind: 'para', text: '**a.** $f(x) = 1/x$ ($x \\in \\mathbb{R}_0$)' },
            {
              kind: 'para',
              text:
                'Taux d\'accroissement — même dénominateur, puis simplifié par h : ' +
                '$\\dfrac{1/(x+h) - 1/x}{h} = \\dfrac{x-(x+h)}{h \\cdot x(x+h)} = \\dfrac{-h}{h \\cdot x(x+h)} = \\dfrac{-1}{x(x+h)}$',
            },
            { kind: 'para', text: 'Passe à la limite : $f\'(x) = \\displaystyle\\lim_{h \\to 0} \\dfrac{-1}{x(x+h)} = -\\dfrac{1}{x^2}$' },
            { kind: 'para', text: '**b.** $f(x) = \\sqrt{x}$ ($x > 0$ : en 0, on diviserait par $\\sqrt{0}$ — la tangente y est verticale)' },
            {
              kind: 'para',
              text:
                'Forme indéterminée $\\frac{0}{0}$ : multiplie par l\'expression conjuguée : ' +
                '$\\dfrac{\\sqrt{x+h}-\\sqrt{x}}{h} = \\dfrac{(x+h)-x}{h(\\sqrt{x+h}+\\sqrt{x})} = \\dfrac{1}{\\sqrt{x+h}+\\sqrt{x}}$',
            },
            { kind: 'para', text: 'Passe à la limite : $f\'(x) = \\displaystyle\\lim_{h \\to 0} \\dfrac{1}{\\sqrt{x+h}+\\sqrt{x}} = \\dfrac{1}{2\\sqrt{x}}$' },
            {
              kind: 'para',
              text:
                'Les dérivées de sin x et cos x se démontrent aussi par la définition. Mais ' +
                'elles utilisent des limites trigonométriques admises à ce niveau — retiens ' +
                'simplement le résultat, déjà dans le tableau de référence.',
            },
          ],
        },
        { kind: 'subheading', text: 'Règles de calcul' },
        {
          kind: 'methode',
          label: 'Les 5 règles de calcul',
          items: [
            '**Constante en facteur** — $(k \\cdot u)\' = k \\cdot u\'$ (exemple : $(5x^3)\' = 15x^2$).',
            '**Somme** — $(u+v)\' = u\'+v\'$ (chaque terme se dérive indépendamment).',
            '**Produit** — $(u \\cdot v)\' = u\'v + uv\'$.',
            '**Quotient** — $(u/v)\' = \\dfrac{u\'v - uv\'}{v^2}$ (l\'ordre compte dans le numérateur : u\' EN PREMIER).',
            '**Composée (chaîne)** — si $f(x)=g(u(x))$, alors $f\'(x) = u\'(x) \\cdot g\'(u(x))$. Dérive « de ' +
              'l\'extérieur vers l\'intérieur », puis multiplie par la dérivée de l\'intérieur.',
          ],
        },
        { kind: 'subheading', text: 'La règle de la chaîne : cas particuliers courants' },
        {
          kind: 'featureTable',
          headers: ['f(x) — u fonction dérivable de x', "f'(x)"],
          rows: [
            ['$u^n$', "$n\\,u^{n-1} \\cdot u'$"],
            ['$\\dfrac{1}{u}$', "$-\\dfrac{u'}{u^2}$"],
            ['$\\sqrt{u}$ (avec $u > 0$)', "$\\dfrac{u'}{2\\sqrt{u}}$"],
            ['$\\sin u$', "$u' \\cos u$"],
            ['$\\cos u$', "$-u' \\sin u$"],
            ['$\\tan u$', "$\\dfrac{u'}{\\cos^2 u}$"],
          ],
        },
        {
          kind: 'para',
          text:
            'Ce tableau vient directement de la formule générale. Par exemple, pour $f(x)=u^n$ : ' +
            '$g(u)=u^n$, donc $g\'(u)=n\\,u^{n-1}$, et $f\'(x)=u\'(x) \\cdot g\'(u(x))=n\\,u^{n-1} \\cdot u\'$. Chaque colonne ' +
            'du tableau n\'est qu\'une application de cette même règle, avec une « extérieure » ' +
            'g différente à chaque fois.',
        },
        {
          kind: 'para',
          text:
            '**Une autre notation.** Leibniz écrivait la dérivée $\\dfrac{dy}{dx}$ : un « tout petit ' +
            'écart de y » divisé par un « tout petit écart de x » — le taux d\'accroissement, à la ' +
            'limite. La règle de la chaîne s\'y lit presque comme une simplification de fractions : ' +
            '$\\dfrac{dy}{dx} = \\dfrac{dy}{du} \\cdot \\dfrac{du}{dx}$. Tu retrouveras cette ' +
            'notation en physique.',
        },
        {
          kind: 'exemple',
          badge: 'règle du produit',
          formula: '$f(x) = (2x+1)(x^2-3)$. Calcule f\'(x).',
          steps: [
            { tag: 'identifier u et v', text: '$u(x)=2x+1$, $u\'(x)=2$ ; $v(x)=x^2-3$, $v\'(x)=2x$' },
            { tag: 'appliquer (uv)\'=u\'v+uv\'', text: '$f\'(x) = 2(x^2-3) + (2x+1)(2x) = 2x^2-6 + 4x^2+2x$' },
          ],
          result: { tag: 'résultat, réduit', text: '$f\'(x) = 6x^2 + 2x - 6$' },
        },
        {
          kind: 'para',
          text:
            'Vérification par développement direct : $f(x)=(2x+1)(x^2-3)=2x^3+x^2-6x-3$. Sa dérivée ' +
            'terme à terme redonne bien $6x^2+2x-6$.',
        },
        {
          kind: 'wrongRight',
          wrongTag: 'piège — produit des dérivées',
          wrong: '$u\'(x) \\cdot v\'(x) = 2 \\cdot 2x = 4x \\neq f\'(x)$',
          rightTag: 'correct — règle du produit',
          right: '$u\'v+uv\' = 6x^2+2x-6 = f\'(x)$',
        },
        {
          kind: 'attention',
          label: '(uv)\' ≠ u\'·v\', et (u/v)\' ≠ u\'/v\'',
          text:
            'L\'erreur la plus fréquente de ce chapitre : dériver un produit ou un quotient en ' +
            'dérivant chaque facteur SÉPARÉMENT, puis en les recombinant naïvement. Seules la ' +
            'somme et la composition ont une règle « simple ». Le produit et le quotient ' +
            'exigent TOUJOURS la formule complète — $u\'v+uv\'$ ou $\\dfrac{u\'v-uv\'}{v^2}$ — jamais un raccourci !',
        },
        {
          kind: 'exemple',
          badge: 'règle du quotient',
          formula: '$f(x) = \\dfrac{x^2+1}{x-2}$. Calcule f\'(x).',
          steps: [
            { tag: 'identifier u et v', text: '$u(x)=x^2+1$, $u\'(x)=2x$ ; $v(x)=x-2$, $v\'(x)=1$' },
            {
              tag: 'appliquer (u/v)\'=(u\'v−uv\')/v², ordre du numérateur respecté',
              text: '$f\'(x) = \\dfrac{2x(x-2) - (x^2+1)(1)}{(x-2)^2} = \\dfrac{2x^2-4x-x^2-1}{(x-2)^2}$',
            },
          ],
          result: { tag: 'résultat, réduit', text: '$f\'(x) = \\dfrac{x^2-4x-1}{(x-2)^2}$' },
        },
        {
          kind: 'exemple',
          badge: 'règle de la chaîne (composée)',
          formula: '$f(x) = (2x-1)^3$. Calcule f\'(x).',
          steps: [
            { tag: 'décomposer — intérieure u(x)=2x−1, extérieure g(u)=u³', text: '$u\'(x)=2$ ; $g\'(u)=3u^2$' },
            { tag: 'appliquer f\'(x)=u\'(x)·g\'(u(x))', text: '$f\'(x) = 2 \\cdot 3(2x-1)^2 = 6(2x-1)^2$' },
          ],
          result: { tag: 'résultat', text: '$f\'(x) = 6(2x-1)^2$' },
          illustration: {
            kind: 'chain',
            stages: ['u=2x−1'],
            highlightIndex: 0,
            outputLabel: '(2x−1)³',
            caption:
              'décomposition de $f(x)=(2x-1)^3$ — intérieure $u(x)=2x-1$ (encadré), sortie $g(u)=u^3$. ' +
              'On dérive l\'extérieure g d\'abord ($3u^2$), puis on multiplie par $u\'(x)=2$ : ' +
              'l\'ordre inverse de la construction.',
          },
        },
        {
          kind: 'para',
          text:
            'Vérification par développement direct : $(2x-1)^3=8x^3-12x^2+6x-1$, dérivée $= ' +
            '24x^2-24x+6$. Et $6(2x-1)^2=6(4x^2-4x+1)=24x^2-24x+6$. Les deux méthodes tombent ' +
            'exactement d\'accord.',
        },
        {
          kind: 'astuce',
          label: 'Repérer d\'abord la STRUCTURE, avant de dériver',
          text:
            'Avant tout calcul, demande-toi : est-ce une SOMME de termes indépendants (règle de ' +
            'base) ? Un PRODUIT de deux facteurs ? Un QUOTIENT ? Ou une fonction « dans » une ' +
            'autre (composée) ? Repérer ça d\'abord t\'évite d\'appliquer la mauvaise règle. ' +
            'Piège fréquent : traiter une composée (ex. $\\sin(2x)$) comme si l\'intérieure était ' +
            'triviale, en oubliant le facteur de la chaîne ! Et simplifie d\'abord quand c\'est ' +
            'possible : $3x^2 \\cdot x^4 = 3x^6$ se dérive directement en $18x^5$, sans règle du produit.',
        },
        {
          kind: 'historique',
          titre: 'Le premier manuel qui réunit tout le calcul différentiel',
          text:
            "En 1748, l'italienne **Maria Gaetana Agnesi** publie Instituzioni Analitiche, le " +
            'premier ouvrage à présenter de façon unifiée et pédagogique l\'ensemble du calcul ' +
            'différentiel ET intégral — exactement les règles de dérivation (somme, produit, ' +
            'quotient, composée) que tu viens d\'apprendre, organisées pour la première fois ' +
            "comme un vrai cours structuré plutôt qu'une collection d'articles de recherche " +
            "épars. L'ouvrage est traduit dans plusieurs langues et utilisé dans toute " +
            "l'Europe pendant des décennies. En 1750, à 32 ans, Agnesi devient la première femme " +
            'nommée professeure de mathématiques dans une université — à Bologne, bien ' +
            "qu'elle n'y ait finalement jamais enseigné, préférant se consacrer à des œuvres " +
            'caritatives.',
          image: {
            src: '/images/historique/agnesi.jpg',
            alt: 'Portrait de Maria Gaetana Agnesi',
            caption: 'Maria Gaetana Agnesi (1718–1799), gravure, 18e siècle.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Fonction dérivée',
          generatorId: '5gen27',
          description: [
            'Reconnais la structure de f(x) : règle de base, produit, quotient ou composée. ' +
              'Décompose-la si besoin, puis calcule f\'(x) — avec ou sans fonctions trigonométriques.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 27. Fonction dérivée »',
        },
      ],
    },
    {
      id: 'signe-derivees',
      number: 4,
      title: 'Signe de f\' et de f\'\' : variations et concavité',
      kicker: 'signe de f\' ⟺ sens de variation ; signe de f\'\' ⟺ concavité ; point d\'inflexion',
      blocks: [
        { kind: 'video', title: 'Signe de f\' et de f\'\' : variations, extremums, concavité, point d\'inflexion', youtubeId: 'oSM5X-KVRrk' },
        {
          kind: 'para',
          text:
            'Tu sais maintenant définir f\'(a) (section 1), l\'interpréter comme la pente ' +
            'd\'une tangente (section 2), et calculer f\'(x) avec les règles de calcul ' +
            '(section 3). Reste à savoir ce que le SIGNE de f\' (et de f\'\') révèle sur f : son ' +
            'sens de variation, sa concavité, et la position de ses extremums.',
        },
        {
          kind: 'intuition',
          label: 'Pense à une colline',
          text:
            "Au sommet d'une colline, la pente est nulle — un instant parfaitement plat, avant " +
            "de redescendre. Même chose au fond d'une vallée. C'est pour ça qu'un extremum " +
            "(maximum ou minimum) d'une courbe sans pointe a une tangente HORIZONTALE : $f'(a)=0$. Mais attention, " +
            "une pente nulle ne suffit pas à elle seule — il faut aussi que la pente change " +
            "vraiment de signe autour de ce point, sinon ce n'est qu'un replat, pas un vrai sommet.",
        },
        {
          kind: 'rappel',
          label: 'Rappel — signe de f\' ⟺ sens de variation de f',
          items: [
            '$f\'(x) > 0$ sur un intervalle ⟹ f est **croissante** sur cet intervalle (la courbe monte).',
            '$f\'(x) < 0$ sur un intervalle ⟹ f est **décroissante** sur cet intervalle (la courbe descend).',
            '$f\'(a) = 0$ ET f\' **change de signe** en a ⟹ f admet un **extremum local** en a. ' +
              'Maximum si f\' passe de + à − ; minimum si f\' passe de − à +. (C\'est le cas d\'une ' +
              'fonction dérivable en un point intérieur à son domaine : voir plus bas les points où ' +
              'f\'(a) n\'existe pas.)',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — signe de f\'\' ⟺ concavité de f',
          items: [
            '$f\'\'(x) > 0$ sur un intervalle ⟹ f est **convexe** (symbole ∪) : la courbe a la ' +
              'forme d\'un « bol » et reste au-dessus de chacune de ses tangentes.',
            '$f\'\'(x) < 0$ sur un intervalle ⟹ f est **concave** (symbole ∩) : la courbe a la ' +
              'forme d\'un « dôme » et reste en dessous de chacune de ses tangentes.',
            'Un **point d\'inflexion** est un point où f\'\' **change de signe**. La courbe ' +
              'traverse sa tangente à cet endroit, en passant d\'un type de concavité à l\'autre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'signe de f\' et de f\'\' sur une cubique',
          formula: '$f(x) = x^3 - 3x$. Étudie le signe de f\'(x) et de f\'\'(x), et déduis-en variations, extremums et concavité.',
          steps: [
            { tag: 'dériver une première fois', text: '$f\'(x) = 3x^2-3 = 3(x-1)(x+1)$' },
            {
              tag: 'signe de f\' — racines en x=−1 et x=1',
              text: '$x<-1$ : $f\'(x)>0$ (croissante) ; $-1<x<1$ : $f\'(x)<0$ (décroissante) ; $x>1$ : $f\'(x)>0$ (croissante)',
            },
            { tag: 'extremums — là où f\' change de signe', text: 'max local en $x=-1$ : $f(-1)=-1+3=2$ ; min local en $x=1$ : $f(1)=1-3=-2$' },
            { tag: 'dériver une seconde fois', text: '$f\'\'(x) = 6x$' },
          ],
          result: {
            tag: 'concavité et point d\'inflexion',
            text: '$f\'\'(x)<0$ pour $x<0$ (concave, ∩) ; $f\'\'(x)>0$ pour $x>0$ (convexe, ∪) ; $f\'\'(0)=0$ avec changement de signe ⟹ **point d\'inflexion en (0;0)**.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x - 3 * x, tone: 'good', xMax: -1 },
              { fn: (x) => x * x * x - 3 * x, tone: 'bad', xMin: -1, xMax: 1 },
              { fn: (x) => x * x * x - 3 * x, tone: 'good', xMin: 1 },
            ],
            xMin: -2.5,
            xMax: 2.5,
            xTicks: [],
            fixedYRange: { min: -3.5, max: 3.5 },
            points: [
              { x: -1, y: 2, label: 'max local (−1;2)', tone: 'good', labelPos: 'above' },
              { x: 1, y: -2, label: 'min local (1;−2)', tone: 'bad', labelPos: 'below' },
              { x: 0, y: 0, label: 'inflexion (0;0)', tone: 'accent', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=x³−3x — vert = f\'>0 (croissante), rouge = f\'<0 (décroissante), point orange = inflexion',
          },
        },
        {
          kind: 'attention',
          label: 'f\'(a)=0 ne garantit PAS un extremum',
          text:
            'Pour une fonction dérivable, la condition $f\'(a)=0$ est NÉCESSAIRE pour un extremum local en un point intérieur. Mais jamais suffisante ' +
            'à elle seule : il faut en plus que f\' **change réellement de signe** autour de a. ' +
            'Un cas classique où ça échoue est détaillé à la section 5 (point critique sans ' +
            'extremum, $f(x)=x^3$ en $x=0$).',
        },
        {
          kind: 'astuce',
          label: 'Lire d\'abord f\', puis seulement f\'\'',
          text:
            'Ne mélange jamais les deux lectures. Le signe de f\' renseigne sur la **direction** ' +
            'de la courbe (monte/descend). Le signe de f\'\' renseigne sur sa **forme** ' +
            '(bol/dôme). Un extremum se lit sur f\', un point d\'inflexion se lit sur f\'\' — ' +
            'jamais l\'inverse !',
        },
        {
          kind: 'rappel',
          label: 'Quand f\'(a) n\'existe pas : point anguleux, rebroussement, tangente verticale',
          items: [
            '**Point anguleux** — la courbe change brusquement de direction : les pentes à gauche ' +
              'et à droite sont différentes, le taux d\'accroissement n\'a pas de limite unique. ' +
              'Exemple : $|x|$ en 0 (pentes −1 et 1). La fonction peut y avoir un extremum (ici un ' +
              'minimum) sans que f\'(a) vaille 0 — f\'(a) n\'existe pas.',
            '**Point de rebroussement** — les deux morceaux de la courbe arrivent en pointe, en ' +
              'devenant verticaux, et repartent en arrière. Exemple : $\\sqrt{|x|}$ en 0.',
            '**Tangente verticale** — la tangente existe, mais elle est verticale : le taux ' +
              'd\'accroissement tend vers $\\pm\\infty$, donc f\'(a) n\'existe pas (une droite ' +
              'verticale n\'a pas de pente). Exemple : $\\sqrt[3]{x}$ en 0. À ne pas confondre ' +
              'avec une tangente horizontale, où f\'(a) = 0.',
            '**Dérivable ⟹ continue** — si f\'(a) existe, la courbe ne fait pas de saut en a. ' +
              'L\'inverse est faux : $|x|$ est continue en 0 (pas de saut) mais n\'y est pas dérivable.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => Math.abs(x), tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              fixedYRange: { min: -0.5, max: 2 },
              points: [{ x: 0, y: 0, label: '', tone: 'accent' }],
              xAxisLabel: 'x',
              yAxisLabel: 'y',
              caption: 'point anguleux : y=|x| en 0',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => Math.sqrt(Math.abs(x)), tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              fixedYRange: { min: -0.5, max: 1.6 },
              points: [{ x: 0, y: 0, label: '', tone: 'accent' }],
              xAxisLabel: 'x',
              yAxisLabel: 'y',
              caption: 'rebroussement : y=√|x| en 0',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => Math.cbrt(x), tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              fixedYRange: { min: -1.5, max: 1.5 },
              points: [{ x: 0, y: 0, label: '', tone: 'accent' }],
              xAxisLabel: 'x',
              yAxisLabel: 'y',
              caption: 'tangente verticale : y=∛x en 0',
            },
          ],
        },
        {
          kind: 'application',
          titre: "Trouver le moment où une épidémie progresse le plus vite",
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 10 / (1 + Math.exp(-1.2 * (t - 5))), tone: 'accent' }],
              xMin: 0,
              xMax: 10,
              xTicks: [5, 10],
              yTicks: [5, 10],
              points: [{ x: 5, y: 5, label: "point d'inflexion", tone: 'good', labelPos: 'right' }],
              xAxisLabel: 'temps (semaines)',
              yAxisLabel: 'personnes touchées N(t) (milliers)',
              caption:
                "Le nombre total de personnes touchées N(t) : la courbe monte de plus en plus vite " +
                "(convexe), puis de moins en moins vite (concave) — le point d'inflexion, en t = 5 " +
                'semaines, est le moment où l\'épidémie progresse le plus vite.',
            },
            {
              kind: 'curvePlot',
              curves: [
                {
                  fn: (t) => (12 * Math.exp(-1.2 * (t - 5))) / Math.pow(1 + Math.exp(-1.2 * (t - 5)), 2),
                  tone: 'good',
                },
              ],
              xMin: 0,
              xMax: 10,
              xTicks: [5, 10],
              yTicks: [3],
              points: [{ x: 5, y: 3, label: 'pic des nouveaux cas', tone: 'good', labelPos: 'above' }],
              xAxisLabel: 'temps (semaines)',
              yAxisLabel: "nouveaux cas N'(t) (milliers par semaine)",
              caption:
                "Les nouveaux cas N'(t) : leur MAXIMUM tombe en t = 5 semaines — le même instant que " +
                "le point d'inflexion de N(t), lu cette fois comme un sommet sur la courbe de N'.",
            },
          ],
          text:
            "Pendant une épidémie, le nombre total de personnes touchées $N(t)$ augmente d'abord " +
            'lentement, puis de plus en plus vite, avant de ralentir quand une grande partie de la ' +
            "population est immunisée : c'est une courbe en S. Le nombre de **nouveaux cas** par " +
            "semaine est sa dérivée $N'(t)$. Le moment où ces nouveaux cas sont les plus nombreux " +
            "(le « pic » de l'épidémie) est donc un maximum de $N'$, c'est-à-dire un point " +
            "d'inflexion de $N$, repéré par le changement de signe de $N''(t)$ — la même lecture " +
            "que tu viens de faire sur f' et f''. Les épidémiologistes surveillent précisément ce " +
            "point : tant que $N''(t) > 0$, l'épidémie accélère ; dès que $N''(t) < 0$, elle " +
            "ralentit, même si le nombre total de cas continue d'augmenter.",
          domaines: ['Santé publique', 'Biologie'],
        },
        {
          kind: 'entrainement',
          title: 'Association graphique/mots ↔ signe de f\'/f\'\'',
          generatorId: '5gen25',
          description: [
            'Associe un graphique de f à son graphique de f\' — ou à une description verbale de ' +
              'f\'/f\'\'. Reconnaissance directe du lien entre le signe de la dérivée et le ' +
              'comportement de la courbe (en niveau avancé : points anguleux, rebroussements et ' +
              'tangentes verticales).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 25. Association graphique/mots ↔ signe de f\'/f\'\' »',
        },
      ],
    },
    {
      id: 'etude-locale',
      number: 5,
      title: 'Étude locale (extremums et points critiques)',
      kicker: 'tableau de signes de f\', extremums locaux, point critique sans extremum, racines irrationnelles, fonction rationnelle, concavité par f\'\'',
      blocks: [
        { kind: 'video', title: 'Étude locale : tableau de signes de f\', extremums et points critiques', youtubeId: 'MqocKqLTkqY' },
        {
          kind: 'methode',
          label: 'Tableau de signes de f\' complet',
          items: [
            'Si f n\'est pas définie partout, détermine d\'abord son **domaine** : chaque valeur exclue ' +
              'aura sa colonne ∄ dans le tableau.',
            'Résous f\'(x)=0 pour trouver les **zéros** de f\' : ce sont tes candidats extremums ' +
              '(garde les valeurs exactes, même irrationnelles, comme $1 \\pm \\sqrt{2}$).',
            'Étudie le SIGNE de f\' entre et autour de ces zéros (tableau de signes).',
            'Déduis-en les **variations** de f (flèches ↗/↘), puis **classe** chaque zéro : ' +
              'max local si f\' passe de + à −, min local si f\' passe de − à +.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — tableau de signes complet, 2 extremums réels',
          blocks: [
            { kind: 'para', text: 'Reprends $f(x) = x^3-3x$ (section 4) et dresse le tableau de signes complet de f\'.' },
            {
              kind: 'signTable',
              caption: 'Signe de f\'(x) = 3(x−1)(x+1) et variations de f(x)=x³−3x',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '−1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'Signe de f\'(x)',
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
                {
                  label: 'Variations de f',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '↗', tone: 'plain' },
                    { text: 'max (2)', tone: 'zero' },
                    { text: '↘', tone: 'plain' },
                    { text: 'min (−2)', tone: 'zero' },
                    { text: '↗', tone: 'plain' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                'f\' change de signe aux DEUX zéros. Max local en x=−1 (f=2), min local en x=1 ' +
                '(f=−2) : ce sont bien de VRAIS extremums.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Un point critique n\'est pas toujours un extremum',
          text:
            'f\'(a)=0 définit un **point critique** — un candidat à être un extremum. Mais ' +
            'SEULEMENT si f\' change réellement de signe autour de a. Si f\' garde le MÊME ' +
            'signe des deux côtés (par exemple toujours positif), a n\'est PAS un extremum. ' +
            'C\'est un point d\'inflexion à tangente horizontale.',
        },
        {
          kind: 'exemple',
          badge: 'point critique SANS extremum',
          formula: '$f(x) = x^3+2$. Étudie le point critique en x=0.',
          steps: [
            { tag: 'dériver', text: '$f\'(x) = 3x^2$' },
            { tag: 'signe de f\'', text: '$f\'(x) = 3x^2 \\geq 0$ pour TOUT x — jamais négatif, nul seulement en $x=0$' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'f\'(0)=0, MAIS f\' ne change pas de signe (+ des deux côtés) ⟹ **pas d\'extremum** ' +
              'en x=0. C\'est un point d\'inflexion à tangente horizontale : f reste croissante ' +
              'de part et d\'autre.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x + 2, tone: 'accent' },
              { fn: () => 2, tone: 'good', xMin: -0.65, xMax: 0.65 },
            ],
            xMin: -2,
            xMax: 2,
            xTicks: [],
            fixedYRange: { min: -3, max: 7 },
            points: [{ x: 0, y: 2, label: 'point critique (0;2)', tone: 'accent', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=x³+2 — f\' reste ≥0 partout : la courbe ne fait que croiser sa tangente horizontale, aucun extremum',
          },
        },
        {
          kind: 'astuce',
          label: 'Vérifie TOUJOURS les deux côtés d\'un zéro de f\'',
          text:
            'Trouver f\'(a)=0 n\'est que la moitié du travail. Évalue le signe de f\' juste ' +
            'avant ET juste après a — une valeur test suffit de chaque côté. Si le signe est ' +
            'identique des deux côtés, conclus explicitement « pas d\'extremum ». Ne t\'arrête ' +
            'jamais après le seul calcul de f\'(a)=0 !',
        },
        {
          kind: 'atelier',
          tag: 'point-critique-signe-widget',
          label: 'Manipule toi-même : point critique ou vrai extremum ?',
          caption:
            'f(x)=x³−3kx : fais glisser k. Pour k>0, f\' change de signe aux deux zéros ' +
            '(2 vrais extremums, comme l\'exemple ci-dessus en k=1). Pour k=0, f\'(x)=3x² ne ' +
            'change jamais de signe : point critique SANS extremum.',
        },
        { kind: 'subheading', text: 'Racines irrationnelles, fonction rationnelle, dérivée seconde' },
        {
          kind: 'exemple',
          badge: 'racines irrationnelles — valeurs exactes',
          formula: '$f(x) = x^3 - 3x^2 - 3x + 1$. Détermine et classe les extremums locaux de f.',
          steps: [
            { tag: 'dériver', text: '$f\'(x) = 3x^2 - 6x - 3$' },
            {
              tag: 'résoudre f\'(x) = 0 — discriminant',
              text: '$\\Delta = 36 + 36 = 72$, $\\sqrt{72} = 6\\sqrt{2}$ ⟹ $x = \\dfrac{6 \\pm 6\\sqrt{2}}{6} = 1 \\pm \\sqrt{2}$',
            },
            {
              tag: 'signe de f\' — trinôme de coefficient 3 > 0',
              text: '$f\'(x) > 0$ avant $1-\\sqrt{2}$, $f\'(x) < 0$ entre les racines, $f\'(x) > 0$ après $1+\\sqrt{2}$',
            },
            {
              tag: 'valeurs exactes de f (avec x = 1 + u, u² = 2)',
              text: '$f(1+u) = -4 - 6u + u^3 = -4 - 4u$ ⟹ $f(1-\\sqrt{2}) = -4+4\\sqrt{2}$ et $f(1+\\sqrt{2}) = -4-4\\sqrt{2}$',
            },
          ],
          result: {
            tag: 'classement',
            text:
              'max local en $x = 1-\\sqrt{2}$ ($f = -4+4\\sqrt{2} \\approx 1{,}66$) ; min local en ' +
              '$x = 1+\\sqrt{2}$ ($f = -4-4\\sqrt{2} \\approx -9{,}66$). Les valeurs approchées ne ' +
              'servent qu\'à placer les points.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — fonction rationnelle : domaine et colonnes ∄',
          blocks: [
            {
              kind: 'para',
              text: 'Étudie les extremums de $f(x) = \\dfrac{4}{(x-1)^2 - 4}$.',
            },
            {
              kind: 'para',
              text:
                '**Domaine** : $(x-1)^2 - 4 = 0 \\iff x - 1 = \\pm 2 \\iff x = -1$ ou $x = 3$, donc ' +
                '$\\text{dom}\\, f = \\mathbb{R} \\setminus \\{-1\\,;3\\}$.',
            },
            {
              kind: 'para',
              text:
                '**Dérivée** (règle de $\\frac{1}{u}$, avec $u = (x-1)^2 - 4$ et $u\' = 2(x-1)$) : ' +
                '$f\'(x) = \\dfrac{-4 \\cdot 2(x-1)}{\\left((x-1)^2-4\\right)^2} = \\dfrac{-8(x-1)}{\\left((x-1)^2-4\\right)^2}$. ' +
                'Le dénominateur est un carré, positif sur le domaine : f\' a le signe de $-8(x-1)$, ' +
                'et s\'annule seulement en $x = 1$.',
            },
            {
              kind: 'signTable',
              caption: 'Signe de f\'(x) et variations de f',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '−1', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '3', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'Signe de f\'(x)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '∄', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '0', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '∄', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'Variations de f',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '↗', tone: 'plain' },
                    { text: '∄', tone: 'plain' },
                    { text: '↗', tone: 'plain' },
                    { text: 'max (−1)', tone: 'zero' },
                    { text: '↘', tone: 'plain' },
                    { text: '∄', tone: 'plain' },
                    { text: '↘', tone: 'plain' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                'Un seul extremum : un maximum local en $x = 1$, $f(1) = \\dfrac{4}{-4} = -1$. Aux ' +
                'colonnes $-1$ et $3$, f n\'existe pas : ∄ sur chaque ligne, jamais de flèche qui les enjambe.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — tableau de f\'\' : concavité et point d\'inflexion',
          blocks: [
            {
              kind: 'para',
              text:
                'Reprends $f(x) = x^3 - 3x^2 - 3x + 1$ : $f\'(x) = 3x^2 - 6x - 3$, donc ' +
                '$f\'\'(x) = 6x - 6$, qui s\'annule en $x = 1$.',
            },
            {
              kind: 'signTable',
              caption: 'Signe de f\'\'(x) et concavité de f (∪ convexe, ∩ concave, PI = point d\'inflexion)',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'Signe de f\'\'(x)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'Concavité de f',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '∩', tone: 'plain' },
                    { text: 'PI (−4)', tone: 'zero' },
                    { text: '∪', tone: 'plain' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                'f\'\' change de signe en 1 : la courbe passe de concave (∩) à convexe (∪). Point ' +
                'd\'inflexion (PI) en $(1\\,;f(1)) = (1\\,;-4)$. Un zéro de f\'\' sans changement de ' +
                'signe ne serait PAS un point d\'inflexion (exemple : $x^4$ en 0).',
            },
          ],
        },
        {
          kind: 'application',
          titre: "Trouver le moment où un médicament agit le plus fort",
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => (10 * t) / (t * t + 4), tone: 'accent' }],
              xMin: 0,
              xMax: 12,
              xTicks: [2, 4, 6, 8, 10, 12],
              yTicks: [2.5],
              fixedYRange: { min: 0, max: 3 },
              points: [{ x: 2, y: 2.5, label: 'pic — concentration max', tone: 'good', labelPos: 'above' }],
              xAxisLabel: 'temps depuis la prise (h)',
              yAxisLabel: 'concentration C(t)',
              caption:
                "Modèle simplifié $C(t)=\\dfrac{10t}{t^2+4}$ : par la règle du quotient, " +
                "$C'(t)=\\dfrac{10(4-t^2)}{(t^2+4)^2}$, qui s'annule en t = 2 h et passe de + à − : " +
                "pic de concentration $C(2)=2{,}5$, puis élimination.",
            },
          ],
          text:
            "Après la prise d'un médicament par voie orale, sa concentration $C(t)$ dans le " +
            'sang augmente d\'abord (absorption), atteint un pic, puis diminue (élimination). ' +
            'Ce pic — le moment où le médicament est le plus efficace, mais aussi le plus ' +
            "susceptible de provoquer des effets secondaires — est exactement un extremum " +
            "local de $C(t)$ : les pharmacologues le trouvent en résolvant $C'(t)=0$, puis en " +
            "vérifiant que $C'$ change bien de signe autour de cette solution, exactement la " +
            'méthode de cette section. Cette information détermine l\'intervalle entre deux ' +
            "prises d'un médicament : assez court pour que la concentration reste efficace, " +
            'assez long pour éviter une accumulation dangereuse.',
          domaines: ['Pharmacologie', 'Médecine'],
        },
        {
          kind: 'entrainement',
          title: 'Étude locale (extremums et points critiques)',
          generatorId: '5gen29',
          description: [
            'Résous f\'(x)=0 (racines entières, double ou irrationnelles), dresse le tableau de ' +
              'signes — avec les colonnes ∄ d\'une fonction rationnelle — et classe chaque point ' +
              'critique. En niveau avancé, même étude sur f\'\' : concavité (∪/∩) et points d\'inflexion.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 29. Étude locale (extremums et points critiques) »',
        },
      ],
    },
    {
      id: 'lecture-graphique-derivees',
      number: 6,
      title: 'Lecture graphique — dérivées et applications',
      kicker: 'lire directement sur un graphique de f : variations, extremums, concavité — sans calcul',
      blocks: [
        { kind: 'video', title: 'Lecture graphique : variations, extremums, concavité et points d\'inflexion sans calcul', youtubeId: '3OzjZmJUmCU' },
        {
          kind: 'para',
          text:
            'Toutes les notions des sections 4 et 5 se lisent directement sur un graphique de ' +
            'f, SANS calculer la moindre dérivée. Il suffit de savoir reconnaître les formes.',
        },
        {
          kind: 'methode',
          label: 'Ce qu\'il faut repérer sur un graphique de f',
          items: [
            'La courbe MONTE ⟹ f\'>0 sur cet intervalle. La courbe DESCEND ⟹ f\'<0.',
            'Un sommet (pic ou creux), là où la courbe change de direction ⟹ extremum local. ' +
              'f\' y vaut 0 et change de signe.',
            'La courbe a la forme d\'un « bol » (au-dessus de ses tangentes) ⟹ convexe, f\'\'>0. ' +
              'La forme d\'un « dôme » (en-dessous de ses tangentes) ⟹ concave, f\'\'<0.',
            'Le point où la courbe passe de « bol » à « dôme » (ou l\'inverse) ⟹ point d\'inflexion.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'lecture directe, aucune formule donnée',
          formula: 'Le graphique ci-dessous représente une fonction f (sa formule n\'est volontairement pas donnée). Décris ses variations, ses extremums et sa concavité, uniquement par lecture.',
          steps: [
            { tag: 'variations — lues directement', text: 'f décroît avant A, croît entre A et B, décroît après B' },
            { tag: 'extremums — aux changements de direction', text: 'A est un minimum local (creux) ; B est un maximum local (pic)' },
          ],
          result: {
            tag: 'concavité — forme de la courbe',
            text:
              '« bol » (convexe, f\'\'>0) à gauche du point orange, « dôme » (concave, f\'\'<0) à ' +
              'droite — ce point orange est donc un point d\'inflexion, aucun calcul requis pour l\'affirmer.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => -(x * x * x) + 3 * x, tone: 'bad', xMax: -1 },
              { fn: (x) => -(x * x * x) + 3 * x, tone: 'good', xMin: -1, xMax: 1 },
              { fn: (x) => -(x * x * x) + 3 * x, tone: 'bad', xMin: 1 },
            ],
            xMin: -2.5,
            xMax: 2.5,
            xTicks: [],
            fixedYRange: { min: -3.5, max: 3.5 },
            points: [
              { x: -1, y: -2, label: 'A', tone: 'bad', labelPos: 'below' },
              { x: 1, y: 2, label: 'B', tone: 'good', labelPos: 'above' },
              { x: 0, y: 0, label: '', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'graphique de f — points A et B à identifier par simple lecture, sans formule ni calcul',
          },
        },
        {
          kind: 'attention',
          label: 'Un simple changement de pente n\'est pas un extremum',
          text:
            'Une courbe peut ralentir sa montée — une pente qui diminue mais reste positive — ' +
            'sans jamais s\'arrêter ni redescendre. Ce n\'est PAS un extremum, juste une ' +
            'variation de concavité ! Un extremum exige un véritable changement de DIRECTION ' +
            '(la courbe monte puis redescend, ou l\'inverse) — jamais seulement un changement de vitesse.',
        },
        {
          kind: 'exemple',
          badge: 'un point critique qui n\'est PAS un extremum, à la lecture seule',
          formula: 'Second graphique de f (formule toujours non donnée). Au point C, la tangente est horizontale — est-ce pour autant un extremum ?',
          steps: [
            {
              tag: 'variations — lues directement',
              text: 'f croît AVANT C, et croît ENCORE après C — aucun changement de direction nulle part',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              'la tangente en C est bien horizontale (f\'(C)=0). Mais ce n\'est PAS un extremum : ' +
              'la courbe ralentit un instant, puis continue exactement dans le même sens. C\'est ' +
              'exactement le piège décrit dans l\'encadré ci-dessus — ici repéré par simple ' +
              'lecture, sans aucun calcul.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x, tone: 'accent', xMin: -1.6, xMax: 1.6 },
              { fn: () => 0, tone: 'good', xMin: -0.5, xMax: 0.5 },
            ],
            xMin: -1.8,
            xMax: 1.8,
            xTicks: [],
            fixedYRange: { min: -4.5, max: 4.5 },
            points: [{ x: 0, y: 0, label: 'C : tangente horizontale', tone: 'accent', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              'graphique de f — la courbe est TOUJOURS croissante, y compris de part et ' +
              'd\'autre du point C où la tangente est momentanément horizontale',
          },
        },
        {
          kind: 'astuce',
          label: 'Suis le doigt le long de la courbe, de gauche à droite',
          text:
            'Balaie la courbe de gauche à droite en observant si elle monte ou descend. Chaque ' +
            'changement de direction est un extremum à noter. Chaque changement de courbure ' +
            '(bol ↔ dôme) est un point d\'inflexion à noter. Une lecture systématique évite ' +
            'd\'en oublier un.',
        },
        {
          kind: 'exemple',
          badge: "lire le graphique de f' pour retrouver f",
          formula:
            "Le graphique ci-dessous est celui de la DÉRIVÉE $f'(x) = x^2-x-2$, une parabole qui " +
            "coupe l'axe en $-1$ et en $2$. Sans chercher f, déduis-en les variations de f, ses " +
            'extremums et sa concavité.',
          steps: [
            {
              tag: "signe de f' — courbe au-dessus ou en dessous de l'axe",
              text: "$f' > 0$ sur $]-\\infty\\,;-1[$ et sur $]2\\,;+\\infty[$ ; $f' < 0$ sur $]-1\\,;2[$",
            },
            {
              tag: 'variations de f',
              text: "f croît, décroît, puis croît : maximum local en $x = -1$, minimum local en $x = 2$ (f' y change de signe)",
            },
            {
              tag: "concavité — f' descend ou monte",
              text: "$f'$ décroît avant son sommet $x = \\frac{1}{2}$ et croît après : $f'' < 0$ puis $f'' > 0$, donc f est concave puis convexe",
            },
          ],
          result: {
            tag: "point d'inflexion",
            text:
              "en $x = \\frac{1}{2}$, là où le graphique de $f'$ atteint son minimum. À retenir : un " +
              "**zéro** de $f'$ donne un extremum de f, un **extremum** de $f'$ donne un point d'inflexion de f.",
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x * x - x - 2, tone: 'good' }],
            xMin: -2.5,
            xMax: 3.5,
            xTicks: [-1, 0.5, 2],
            fixedYRange: { min: -3, max: 5 },
            points: [
              { x: -1, y: 0, label: '−1', tone: 'accent', labelPos: 'above' },
              { x: 2, y: 0, label: '2', tone: 'accent', labelPos: 'above' },
              { x: 0.5, y: -2.25, label: "minimum de f'", tone: 'good', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: "f'(x)",
            caption:
              "Attention : c'est le graphique de f' (pas de f). Ses zéros donnent les extremums de f, " +
              "son minimum le point d'inflexion de f.",
          },
        },
        {
          kind: 'entrainement',
          title: 'Lecture graphique — dérivées et applications',
          generatorId: '5gen30',
          description: [
            'Un graphique de f est affiché : lis ses asymptotes, repère ses extremums, ses paliers ' +
              'et ses points d\'inflexion, puis déduis-en le signe de f\' et de f\'\' (concavité). ' +
              'Aucun calcul, calculatrice absente.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 30. Lecture graphique — dérivées et applications »',
        },
      ],
    },
    {
      id: 'etudier-fonction',
      number: 7,
      title: 'Étudier une fonction',
      kicker: 'domaine → limites/asymptotes → f\' et variations → f\'\' et concavité → coordonnées → graphique',
      blocks: [
        { kind: 'video', title: 'Étudier une fonction : démarche complète, tableau de variations, asymptotes et synthèse', youtubeId: 'R-cGVkXmkxI' },
        {
          kind: 'para',
          text:
            'L\'étude complète d\'une fonction réunit TOUT ce qui précède, dans un ordre fixe. ' +
            'Elle reconvoque directement les techniques du chapitre précédent pour les limites ' +
            'et les asymptotes.',
        },
        {
          kind: 'methode',
          label: 'La démarche complète, dans l\'ordre',
          items: [
            '**Domaine** — exclus les valeurs interdites (dénominateur nul, etc.).',
            '**Limites aux bornes du domaine et asymptotes** — techniques du chapitre précédent.',
            '**Dérivée** f\'(x) et son **signe** — tableau de signes complet, y compris les colonnes ∄.',
            '**Variations et extremums** — lus directement sur le tableau de signes de f\'.',
            '**Dérivée seconde** f\'\'(x) et son signe — concavité (∪ convexe, ∩ concave) et points ' +
              'd\'inflexion, là où f\'\' change de signe (jamais en une valeur exclue).',
            '**Coordonnées des points remarquables** — calcule f(a) pour chaque extremum et chaque ' +
              'point d\'inflexion.',
            '**Synthèse et graphique** — domaine, tableau complet, asymptotes, points remarquables ' +
              'placés, puis allure de la courbe.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'étude complète — fonction rationnelle avec asymptote oblique',
          formula: '$f(x) = (x-1) + \\dfrac{4}{x-1} = \\dfrac{x^2-2x+5}{x-1}$. Mène l\'étude complète de f.',
          steps: [
            { tag: '1. domaine', text: '$x-1=0 \\iff x=1$ ⟹ $\\text{dom}\\, f = \\mathbb{R} \\setminus \\{1\\}$' },
            {
              tag: '2. asymptote verticale — x=1 (numérateur en x=1 : 1−2+5=4≠0, vraie asymptote)',
              text: '$\\displaystyle\\lim_{x \\to 1^-} f(x) = -\\infty$ ; $\\displaystyle\\lim_{x \\to 1^+} f(x) = +\\infty$',
            },
            { tag: 'asymptote oblique — le terme 4/(x−1) tend vers 0 à l\'infini', text: '$y = x - 1$' },
            { tag: '3. dériver', text: '$f\'(x) = 1 - \\dfrac{4}{(x-1)^2}$' },
            { tag: 'zéros de f\' — résoudre f\'(x)=0', text: '$1 = \\dfrac{4}{(x-1)^2} \\iff (x-1)^2 = 4 \\iff x-1 = \\pm 2 \\iff x = -1$ ou $x = 3$' },
            {
              tag: 'signe de f\' — test en x=−2, x=0, x=2, x=4',
              text: '$f\'(-2)=1-\\frac{4}{9}>0$ ; $f\'(0)=1-4<0$ ; $f\'(2)=1-4<0$ ; $f\'(4)=1-\\frac{4}{9}>0$',
            },
            { tag: '4. extremums et leurs coordonnées', text: '$f(-1)=-2+\\frac{4}{-2}=-4$ (max local) ; $f(3)=2+\\frac{4}{2}=4$ (min local)' },
            {
              tag: '5. dérivée seconde et concavité',
              text: '$f\'\'(x) = \\dfrac{8}{(x-1)^3}$ : négative pour $x<1$ (∩, concave), positive pour $x>1$ (∪, convexe) ; pas de point d\'inflexion, car $x=1$ est exclu du domaine',
            },
          ],
          result: {
            tag: 'synthèse complète',
            text:
              'Domaine $\\mathbb{R} \\setminus \\{1\\}$. Asymptote verticale $x=1$ (+∞ à droite, −∞ à ' +
              'gauche), asymptote oblique $y=x-1$. Max local $(-1\\,;-4)$, min local $(3\\,;4)$. ' +
              'Concave sur $]-\\infty\\,;1[$, convexe sur $]1\\,;+\\infty[$, aucun point d\'inflexion.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x - 1) + 4 / (x - 1), tone: 'accent', xMin: -4, xMax: 0.85 },
              { fn: (x) => (x - 1) + 4 / (x - 1), tone: 'accent', xMin: 1.15, xMax: 6 },
            ],
            xMin: -4,
            xMax: 6,
            xTicks: [1],
            fixedYRange: { min: -8, max: 10 },
            verticalAsymptotes: [{ x: 1, label: 'x=1' }],
            obliqueAsymptotes: [{ a: 1, b: -1, label: 'y=x−1' }],
            points: [
              { x: -1, y: -4, label: 'max local (−1;−4)', tone: 'good', labelPos: 'below' },
              { x: 3, y: 4, label: 'min local (3;4)', tone: 'bad', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=(x-1)+\\frac{4}{x-1}$ — la courbe se resserre progressivement contre l\'asymptote ' +
              'verticale x=1, des deux côtés, et contre l\'asymptote oblique y=x−1.',
          },
        },
        {
          kind: 'piege',
          label: 'La colonne d\'exclusion (CE) n\'a jamais de cellule « variation »',
          text:
            'En x=1, f n\'est pas définie. La colonne correspondante porte le symbole ∄ ' +
            '(n\'existe pas) sur CHAQUE ligne du tableau — jamais une flèche de variation qui ' +
            '« enjamberait » la valeur exclue. Même si les deux morceaux semblent se prolonger ' +
            'visuellement sur le graphique !',
        },
        {
          kind: 'astuce',
          label: 'Réutilise le chapitre précédent sans le refaire',
          text:
            'Le domaine, la nature de l\'asymptote verticale (vraie asymptote ou point vide, ' +
            'test du numérateur), et l\'asymptote oblique (division euclidienne ou méthode des ' +
            'limites) : tout ça suit EXACTEMENT les techniques du chapitre 4. L\'étude complète ' +
            'n\'ajoute que f\', f\'\' et leurs tableaux de signes, par-dessus ce que tu sais déjà.',
        },
        {
          kind: 'exemple',
          badge: 'étude complète — fonction polynomiale (cubique)',
          formula: '$f(x) = x^3 - 3x^2 + 4$. Mène l\'étude complète de f.',
          steps: [
            {
              tag: 'domaine et limites',
              text:
                '$\\text{dom}\\, f = \\mathbb{R}$ (polynôme) : aucune asymptote verticale ; ' +
                '$\\displaystyle\\lim_{x \\to -\\infty} f(x) = -\\infty$ et $\\displaystyle\\lim_{x \\to +\\infty} f(x) = +\\infty$ ' +
                '(terme dominant $x^3$) : ni asymptote horizontale ni oblique',
            },
            {
              tag: 'dérivée et signe',
              text: "$f'(x) = 3x^2-6x = 3x(x-2)$ : $f' > 0$ sur $]-\\infty\\,;0[$, $f' < 0$ sur $]0\\,;2[$, $f' > 0$ sur $]2\\,;+\\infty[$",
            },
            { tag: 'extremums', text: 'maximum local $(0\\,;4)$, minimum local $(2\\,;0)$' },
            {
              tag: 'dérivée seconde et concavité',
              text: "$f''(x) = 6x-6$ : concave sur $]-\\infty\\,;1[$, convexe sur $]1\\,;+\\infty[$ ; point d'inflexion $(1\\,;2)$",
            },
            {
              tag: 'points sur les axes',
              text:
                '$f(-1) = -1-3+4 = 0$ et $f(2) = 0$ : $f(x) = (x+1)(x-2)^2$. La courbe coupe l\'axe en $-1$ ' +
                'et le touche en $2$ (racine double : tangente horizontale), et coupe l\'axe des ordonnées en $(0\\,;4)$',
            },
          ],
          result: {
            tag: 'synthèse',
            text: "f croît jusqu'à $(0\\,;4)$, décroît jusqu'à $(2\\,;0)$, puis croît ; inflexion en $(1\\,;2)$ ; aucune asymptote.",
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x * x * x - 3 * x * x + 4, tone: 'accent' }],
            xMin: -1.6,
            xMax: 3.4,
            xTicks: [-1, 1, 2],
            fixedYRange: { min: -2, max: 6 },
            points: [
              { x: 0, y: 4, label: 'max (0;4)', tone: 'accent', labelPos: 'above' },
              { x: 2, y: 0, label: 'min (2;0)', tone: 'accent', labelPos: 'below' },
              { x: 1, y: 2, label: 'PI (1;2)', tone: 'good', labelPos: 'right' },
              { x: -1, y: 0, label: '', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'f(x) = x³ − 3x² + 4 : maximum (0;4), minimum (2;0) sur l\'axe (racine double), point d\'inflexion (1;2).',
          },
        },
        {
          kind: 'entrainement',
          title: 'Étudier une fonction',
          generatorId: '5gen31',
          description: [
            'Étude complète : domaine, limites et asymptotes, f\' et variations, f\'\' et ' +
              'concavité, coordonnées des points remarquables, synthèse, puis placement de ces ' +
              'points sur le graphique.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 31. Étudier une fonction »',
        },
      ],
    },
    {
      id: 'optimisation-geometrique',
      number: 8,
      title: 'Optimisation géométrique',
      kicker: 'maximiser/minimiser une aire ou un volume sous contrainte, dérivée nulle au point optimal',
      blocks: [
        { kind: 'video', title: 'Optimisation géométrique : maximiser une aire sous contrainte avec la dérivée', youtubeId: 'rFeq-NezwlM' },
        {
          kind: 'methode',
          label: 'Optimiser une grandeur géométrique',
          items: [
            'Exprime la grandeur à optimiser (aire, volume, périmètre) en fonction d\'UNE SEULE ' +
              'variable. Utilise la contrainte donnée pour éliminer les autres.',
            'Dérive cette fonction, résous sa dérivée = 0.',
            'Confirme qu\'il s\'agit bien d\'un maximum (ou d\'un minimum) par le **tableau de ' +
              'signes** de la dérivée sur le domaine réaliste : + puis − pour un maximum, − puis + ' +
              'pour un minimum. Jamais supposé automatiquement !',
          ],
        },
        {
          kind: 'exemple',
          badge: 'rectangle de périmètre fixé, aire maximale',
          formula: 'Un rectangle a un périmètre fixé à 40 m. Quelles dimensions maximisent son aire ?',
          steps: [
            { tag: 'poser la contrainte', text: '$2x + 2y = 40 \\iff y = 20 - x$ (x = largeur, y = longueur, $x \\in \\, ]0\\,;20[$)' },
            { tag: 'exprimer l\'aire en fonction d\'UNE variable', text: '$A(x) = x(20-x) = 20x - x^2$' },
            { tag: 'dériver et résoudre A\'(x)=0', text: '$A\'(x) = 20 - 2x = 0 \\iff x = 10$' },
            { tag: 'confirmer le maximum — tableau de signes de A\'', text: '$A\'(x) > 0$ pour $0 < x < 10$ et $A\'(x) < 0$ pour $10 < x < 20$ : A croît puis décroît ⟹ $x=10$ est bien un MAXIMUM' },
          ],
          result: { tag: 'conclusion', text: '$x=10$ m, $y=20-10=10$ m (un CARRÉ) ⟹ aire maximale $A(10) = 100$ m²' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 20 * x - x * x, tone: 'accent', xMin: 0, xMax: 20 }],
            xMin: -1,
            xMax: 21,
            xTicks: [10],
            fixedYRange: { min: -5, max: 115 },
            points: [{ x: 10, y: 100, label: 'x=10 m, A=100 m²', tone: 'good', labelPos: 'above' }],
            xAxisLabel: 'x (largeur, m)',
            yAxisLabel: 'A(x) (aire, m²)',
            caption: 'A(x)=20x−x² — le maximum de l\'aire est atteint au sommet de la parabole, en x=10 (rectangle carré)',
          },
        },
        {
          kind: 'attention',
          label: 'Ne jamais optimiser deux variables à la fois',
          text:
            'Tant que la fonction dépend de DEUX variables (ici x et y), sa dérivée n\'a pas de ' +
            'sens au programme de ce chapitre. Utilise TOUJOURS la contrainte pour éliminer une ' +
            'variable AVANT de dériver — jamais après !',
        },
        {
          kind: 'astuce',
          label: 'Vérifier le domaine réaliste de x',
          text:
            'Une largeur x doit rester strictement positive ET strictement inférieure au ' +
            'périmètre disponible — ici $x \\in \\, ]0\\,;20[$, sinon $y=20-x$ devient négatif ou nul. Un ' +
            'extremum mathématique situé hors de ce domaine n\'aurait aucun sens géométrique.',
        },
        {
          kind: 'exemple',
          badge: 'affiche avec marges — surface de papier minimale',
          formula:
            'Une affiche contient une zone imprimée rectangulaire de 32 dm², entourée d\'une marge ' +
            'de 1 dm à gauche et à droite, et de 2 dm en haut et en bas. Quelles dimensions de la ' +
            'zone imprimée rendent la surface totale de l\'affiche minimale ?',
          steps: [
            { tag: 'contrainte — x = largeur imprimée, y = hauteur imprimée (en dm)', text: '$x \\cdot y = 32 \\iff y = \\dfrac{32}{x}$, avec $x > 0$' },
            {
              tag: 'surface totale en fonction de x seul — dimensions de l\'affiche : x+2 et y+4',
              text: '$S(x) = (x+2)\\left(\\dfrac{32}{x}+4\\right) = 4x + \\dfrac{64}{x} + 40$',
            },
            { tag: 'dériver et résoudre S\'(x)=0', text: '$S\'(x) = 4 - \\dfrac{64}{x^2} = 0 \\iff x^2 = 16 \\iff x = 4$ (on rejette $x = -4$)' },
            { tag: 'nature — tableau de signes de S\'', text: '$S\'(x) < 0$ pour $0 < x < 4$ et $S\'(x) > 0$ pour $x > 4$ ⟹ minimum en $x = 4$' },
          ],
          result: {
            tag: 'conclusion',
            text: 'zone imprimée de 4 dm sur 8 dm, affiche de 6 dm sur 12 dm : surface minimale $S(4) = 72$ dm²',
          },
        },
        {
          kind: 'exemple',
          badge: 'boîte sans couvercle — volume maximal',
          formula:
            'Dans un carton carré de 30 cm de côté, on découpe un carré de côté x à chaque coin, puis ' +
            'on relève les bords pour former une boîte sans couvercle. Quelle valeur de x rend le ' +
            'volume maximal ?',
          steps: [
            { tag: 'dimensions et domaine', text: 'base carrée de côté $30-2x$, hauteur $x$, avec $x \\in \\,]0\\,;15[$' },
            { tag: 'volume en fonction de x seul', text: '$V(x) = x(30-2x)^2$' },
            {
              tag: "dériver (règle du produit) et résoudre V'(x) = 0",
              text: "$V'(x) = (30-2x)^2 + x \\cdot 2(30-2x)(-2) = (30-2x)(30-6x)$ : $V'(x) = 0 \\iff x = 15$ (hors du domaine) ou $x = 5$",
            },
            { tag: "nature — tableau de signes de V'", text: "$V' > 0$ sur $]0\\,;5[$ et $V' < 0$ sur $]5\\,;15[$ : maximum en $x = 5$" },
          ],
          result: { tag: 'résultat', text: 'carrés de 5 cm : boîte de $20 \\times 20 \\times 5$ cm, volume maximal $V(5) = 2000$ cm³' },
        },
        {
          kind: 'astuce',
          label: 'Quand la grandeur dépend d\'un angle',
          text:
            'Si la grandeur à optimiser dépend d\'un angle α (un trapèze dont on relève les côtés, ' +
            'par exemple), exprime-la avec $\\sin\\alpha$ et $\\cos\\alpha$, puis utilise ' +
            '$\\sin^2\\alpha = 1 - \\cos^2\\alpha$ pour n\'en garder qu\'un. Dérive avec α en ' +
            '**radians** ; convertis en degrés seulement à la fin, si l\'énoncé le demande.',
        },
        {
          kind: 'application',
          titre: 'Minimiser la quantité de métal d\'une canette',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (r) => 2 * Math.PI * r * r + (2 * 330) / r, tone: 'accent', xMin: 1.5, xMax: 8 }],
              xMin: 0,
              xMax: 8,
              xTicks: [2, 4, 6, 8],
              fixedYRange: { min: 0, max: 700 },
              points: [{ x: 3.75, y: 264, label: 'minimum — r ≈ 3,75 cm', tone: 'good', labelPos: 'above' }],
              xAxisLabel: 'rayon r (cm)',
              yAxisLabel: 'aire totale (cm²)',
              caption:
                'Pour un volume fixé à 330 cm³, $A(r)=2\\pi r^2+\\frac{660}{r}$ (base+couvercle+paroi, ' +
                'hauteur éliminée via la contrainte de volume) atteint son minimum en r ≈ 3,75 cm, ' +
                'avec h = 2r ≈ 7,5 cm. Une vraie canette de 33 cl est plus haute : r ≈ 3,3 cm, ' +
                'h ≈ 11,5 cm, soit h ≈ 3,5r.',
            },
          ],
          text:
            "Une canette de boisson a un volume fixé par la réglementation (33 cl, par " +
            "exemple) — mais sa forme, elle, n'est pas imposée : seul le couple rayon/hauteur " +
            'doit respecter ce volume. Minimiser la quantité de métal utilisée (donc le coût ' +
            'de fabrication et le poids à transporter) revient à minimiser l\'aire totale de ' +
            'la canette — base, couvercle et paroi latérale — sous la contrainte que son ' +
            'volume reste constant, exactement le même principe que l\'exemple du rectangle ' +
            "ci-dessus, mais appliqué à un solide. En exprimant l'aire en fonction d'une " +
            'seule variable (le rayon, grâce à la contrainte de volume) puis en dérivant, les ' +
            'ingénieurs trouvent le rapport hauteur/rayon optimal : h = 2r si le métal a partout ' +
            'la même épaisseur. Les vraies canettes sont pourtant plus hautes (h ≈ 3,5r) : leur ' +
            'fond et leur couvercle sont bien plus épais que la paroi, et le sertissage consomme ' +
            'de la matière. Un bon modèle se critique toujours : il faut alors compter le fond et ' +
            'le couvercle « plus cher » — l\'optimum se déplace vers des canettes plus hautes.',
          domaines: ['Ingénierie', 'Industrie'],
        },
        {
          kind: 'entrainement',
          title: 'Optimisation géométrique',
          generatorId: '5gen32',
          description: [
            'Maximise ou minimise une aire ou une surface sous contrainte — trapèze (angle α), ' +
              'cylindre, affiche avec marges, fenêtre surmontée d\'un demi-cercle : exprime la ' +
              'grandeur en fonction d\'une seule variable, dérive, puis justifie la nature de ' +
              'l\'extremum par le tableau de signes.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 32. Optimisation géométrique »',
        },
      ],
    },
    {
      id: 'contexte-economique',
      number: 9,
      title: 'Contexte économique',
      kicker: 'coût marginal = dérivée du coût total ; profit maximal ; interprétation économique de f\'',
      blocks: [
        { kind: 'video', title: 'Contexte économique : coût marginal, recette marginale et bénéfice maximal', youtubeId: 'viSlSAGAl10' },
        {
          kind: 'rappel',
          label: 'Rappel — coût marginal',
          items: [
            'Le **coût marginal**, c\'est le coût de production d\'une unité SUPPLÉMENTAIRE. En ' +
              'pratique, deux façons de l\'estimer : la version DISCRÈTE C(q+1)−C(q) — le coût ' +
              'réel de la (q+1)-ième unité — et la version CONTINUE C\'(q) — la dérivée, la ' +
              'pente instantanée. Les deux sont PROCHES, mais pas identiques.',
            'Le coût marginal $C\'(q)$ est lui-même une fonction de q : il est **minimal** là où ' +
              'sa propre dérivée $C\'\'(q)$ s\'annule en passant de − à +. Pour un coût de degré 3, ' +
              '$C\'\'(q)$ est du premier degré : une seule équation à résoudre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'coût marginal — discret vs dérivée',
          formula: '$C(q) = q^2+4q+100$ (coût total en €, pour q unités). Compare le coût marginal discret et la dérivée en q=10.',
          steps: [
            { tag: 'coût marginal discret — C(11)−C(10)', text: '$C(10) = 100+40+100 = 240$ € ; $C(11) = 121+44+100 = 265$ € ⟹ $C(11)-C(10) = 25$ €' },
            { tag: 'dériver', text: '$C\'(q) = 2q + 4$, donc $C\'(10) = 20+4 = 24$ €' },
          ],
          result: {
            tag: 'écart entre les deux estimations, en % de la dérivée',
            text:
              '$\\dfrac{|25 - 24|}{24} \\times 100 \\approx 4{,}2\\,\\%$. Les deux valeurs sont proches ' +
              'mais pas égales : la dérivée donne la pente INSTANTANÉE en q=10, le calcul discret la ' +
              'variation sur toute une unité.',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — écart en pourcentage',
          items: [
            'Pour comparer les deux estimations, on calcule l\'écart en pourcentage de la dérivée : ' +
              '$\\text{écart} = \\dfrac{|C(q+1) - C(q) - C\'(q)|}{|C\'(q)|} \\times 100\\,\\%$. Selon la ' +
              'fonction de coût et la quantité q, il peut être de quelques pour cent ou beaucoup ' +
              'plus grand : la dérivée n\'est qu\'une approximation du coût de l\'unité suivante.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — bénéfice maximal : égalité des marginales',
          items: [
            'Le bénéfice $B(x)=R(x)-C(x)$ — recette moins coût — est maximal quand $B\'(x)=0$ ' +
              '(et que B\' passe de + à −). C\'est-à-dire quand $R\'(x) = C\'(x)$ : la **recette marginale égale le coût ' +
              'marginal**. C\'est exactement l\'instant où produire une unité de plus cesse ' +
              'd\'être rentable.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'bénéfice maximal, vérification Rm=Cm',
          formula: 'Prix $p(x) = 50-x$ (€, décroissant avec la quantité), coût $C(x) = x^2+10x+20$. Détermine la quantité qui maximise le bénéfice.',
          steps: [
            { tag: 'recette', text: '$R(x) = x \\cdot p(x) = x(50-x) = 50x - x^2$' },
            { tag: 'bénéfice B(x)=R(x)−C(x)', text: '$B(x) = (50x-x^2) - (x^2+10x+20) = -2x^2 + 40x - 20$' },
            { tag: 'dériver et résoudre B\'(x)=0', text: '$B\'(x) = -4x + 40 = 0 \\iff x = 10$ ; B\' passe de + à − en 10 : bien un maximum' },
          ],
          result: {
            tag: 'vérification par égalité des marginales',
            text: '$R\'(x)=50-2x \\implies R\'(10)=30$ ; $C\'(x)=2x+10 \\implies C\'(10)=30$ ⟹ Rm = Cm = 30 € ✓ ; $B(10) = -200+400-20 = 180$ €',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 50 * x - x * x, tone: 'good', xMin: 0, xMax: 20 },
              { fn: (x) => x * x + 10 * x + 20, tone: 'bad', xMin: 0, xMax: 20 },
            ],
            xMin: -1,
            xMax: 21,
            xTicks: [10],
            fixedYRange: { min: -10, max: 650 },
            points: [
              { x: 10, y: 400, label: 'R(10)=400 €', tone: 'good', labelPos: 'above' },
              { x: 10, y: 220, label: 'C(10)=220 € — B(10)=180 € (max)', tone: 'bad', labelPos: 'below' },
            ],
            xAxisLabel: 'x (quantité)',
            yAxisLabel: '€',
            caption:
              '$R(x)=50x-x^2$ (recette, vert) et $C(x)=x^2+10x+20$ (coût, rouge). L\'écart vertical ' +
              'entre les deux, c\'est le bénéfice B(x) — maximal en x=10 (B=180 €).',
          },
        },
        {
          kind: 'piege',
          label: 'Maximiser la RECETTE n\'est pas maximiser le BÉNÉFICE',
          text:
            '$R\'(x)=0$ donne la quantité qui maximise la recette SEULE (ici $x=25$, $R\'(25)=50-50=0$). ' +
            'Piège classique : confondre ce point avec l\'optimum de bénéfice, qui doit ' +
            'TOUJOURS tenir compte du coût (ici x=10, très différent !). Produire davantage ' +
            'augmente parfois la recette, tout en réduisant le bénéfice net — si le coût ' +
            'marginal dépasse la recette marginale.',
        },
        {
          kind: 'astuce',
          label: 'Vérifie que le modèle a un sens économique',
          text:
            'Un coût total réaliste a un coût fixe positif ($C(0) > 0$) et croît avec la quantité ' +
            '(coût marginal $C\'(q) > 0$) : il n\'a donc pas de maximum ni de minimum à chercher. ' +
            'Un prix de vente doit rester positif pour les quantités étudiées. Ce qu\'on optimise, ' +
            'c\'est le bénéfice — ou le coût MOYEN, ci-dessous.',
        },
        {
          kind: 'atelier',
          tag: 'recette-benefice-widget',
          label: 'Manipule toi-même : Rm=Cm au bénéfice maximal',
          caption:
            'R(x) et C(x) sont ceux de l\'exemple ci-dessus. Fais glisser x : regarde R\', C\' ' +
            'se rapprocher (ou s\'éloigner) l\'un de l\'autre, et le verdict changer de sens ' +
            'selon lequel des deux dépasse l\'autre.',
        },
        { kind: 'subheading', text: 'Coût moyen minimal — et la dichotomie pour l\'approcher' },
        {
          kind: 'rappel',
          label: 'Rappel — coût moyen',
          items: [
            'Le **coût moyen** est le coût par unité produite : $C_M(q) = \\dfrac{C(q)}{q}$. Sa ' +
              'dérivée vaut $C_M\'(q) = \\dfrac{q\\,C\'(q) - C(q)}{q^2}$ : elle s\'annule quand ' +
              '$q\\,C\'(q) - C(q) = 0$, c\'est-à-dire quand le **coût marginal égale le coût moyen**.',
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode — la dichotomie (approcher une racine)',
          items: [
            'Trouve un intervalle $[a\\,;b]$ où la fonction P change de signe : $P(a)$ et $P(b)$ de ' +
              'signes contraires. Une racine s\'y trouve.',
            'Calcule P au milieu $m = \\dfrac{a+b}{2}$.',
            'Garde la moitié où P change encore de signe : $[a\\,;m]$ ou $[m\\,;b]$.',
            'Recommence : la largeur de l\'intervalle est divisée par 2 à chaque étape. Arrête-toi ' +
              'quand la précision demandée est atteinte (le milieu final est alors à moins d\'une ' +
              'demi-largeur de la racine).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'coût moyen minimal, par dichotomie',
          formula:
            '$C(q) = q^3 - 6q^2 + 20q + 50$ (coût total en centaines d\'euros, q en centaines ' +
            'd\'unités). Approche la quantité qui rend le coût moyen minimal.',
          steps: [
            { tag: 'condition — coût marginal = coût moyen', text: '$C_M\'(q) = 0 \\iff q\\,C\'(q) - C(q) = 0$' },
            {
              tag: 'équation réduite',
              text: '$q(3q^2-12q+20) - (q^3-6q^2+20q+50) = 2q^3 - 6q^2 - 50 = 0$ : aucune racine évidente',
            },
            { tag: 'intervalle de départ', text: '$P(q) = 2q^3 - 6q^2 - 50$ : $P(4) = -18 < 0$ et $P(5) = 50 > 0$ ⟹ racine dans $[4\\,;5]$' },
            {
              tag: 'quatre étapes de dichotomie',
              text:
                '$P(4{,}5) \\approx 10{,}75 > 0 \\to [4\\,;4{,}5]$ ; $P(4{,}25) \\approx -4{,}84 < 0 \\to [4{,}25\\,;4{,}5]$ ; ' +
                '$P(4{,}375) \\approx 2{,}64 > 0 \\to [4{,}25\\,;4{,}375]$ ; $P(4{,}3125) \\approx -1{,}18 < 0 \\to [4{,}3125\\,;4{,}375]$',
            },
          ],
          result: {
            tag: 'conclusion',
            text: '$q \\approx 4{,}34$ (à 0,03 près) : le coût moyen est minimal pour environ 434 unités. P passe de − à + : $C_M$ décroît puis croît, c\'est bien un minimum.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Contexte économique',
          generatorId: '5gen33',
          description: [
            'Compare le coût marginal discret et la dérivée (écart en %). Détermine un bénéfice ' +
              'maximal par l\'égalité des marginales. En bonus, approche par dichotomie la quantité ' +
              'qui rend le coût moyen minimal.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 33. Contexte économique »',
        },
      ],
    },
    {
      id: 'extrema-bornes',
      number: 10,
      title: 'Extrema en contexte borné',
      kicker: 'sur un intervalle FERMÉ [a;b] : comparer les extremums locaux ET les valeurs aux bornes',
      blocks: [
        { kind: 'video', title: 'Extrema sur un intervalle fermé : comparer extremums locaux et valeurs aux bornes', youtubeId: 'qyRa-UM5VS0' },
        {
          kind: 'attention',
          label: 'Sur un intervalle fermé, l\'extremum ABSOLU n\'est pas toujours un extremum LOCAL',
          text:
            'Sur ℝ tout entier (section 5), le domaine « part à l\'infini ». Mais sur un ' +
            'intervalle FERMÉ ET BORNÉ [a;b], la fonction a aussi une valeur EN a et EN b. ' +
            'L\'extremum absolu peut très bien s\'y trouver — même si aucun extremum local n\'y ' +
            'est présent ! Comparer les valeurs aux bornes n\'est JAMAIS optionnel.',
        },
        {
          kind: 'methode',
          label: 'Trouver l\'extremum absolu sur [a;b]',
          items: [
            'Trouve tous les extremums locaux À L\'INTÉRIEUR de ]a;b[ (comme en section 5).',
            'Calcule f(a) et f(b) — les valeurs AUX bornes.',
            'Compare TOUTES ces valeurs ensemble — extremums locaux, f(a), f(b). Le maximum ' +
              'absolu est la plus grande, le minimum absolu la plus petite, QUEL QUE SOIT ' +
              'l\'endroit où elle se trouve.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'maximum et minimum absolus sur un intervalle fermé',
          formula: '$f(t) = t^3-6t^2+9t+2$ sur l\'intervalle fermé $[0\\,;5]$. Détermine le maximum et le minimum absolus.',
          steps: [
            { tag: 'dériver et résoudre f\'(t)=0', text: '$f\'(t) = 3t^2-12t+9 = 3(t-1)(t-3) = 0 \\iff t=1$ ou $t=3$ (tous deux dans $]0\\,;5[$)' },
            { tag: 'classer les extremums locaux', text: '$f(1) = 1-6+9+2 = 6$ (max local) ; $f(3) = 27-54+27+2 = 2$ (min local)' },
            { tag: 'valeurs AUX BORNES — jamais oubliées', text: '$f(0) = 2$ ; $f(5) = 125-150+45+2 = 22$' },
          ],
          result: {
            tag: 'comparaison de TOUTES les valeurs : 2, 6, 2, 22',
            text: 'Maximum ABSOLU = 22, atteint en t=5 (à la borne !), bien plus grand que le maximum local (6). Minimum ABSOLU = 2, atteint à la fois en t=0 ET en t=3 (égalité entre une borne et un extremum local).',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (t) => t * t * t - 6 * t * t + 9 * t + 2, tone: 'accent', xMin: 0, xMax: 5 },
              { fn: () => 2, tone: 'faint', xMin: 0, xMax: 3 },
            ],
            xMin: -0.4,
            xMax: 5.4,
            xTicks: [],
            fixedYRange: { min: -1, max: 24 },
            points: [
              { x: 1, y: 6, label: 'max local (1;6)', tone: 'good', labelPos: 'above' },
              { x: 3, y: 2, label: 'min local (3;2)', tone: 'bad', labelPos: 'below' },
              { x: 0, y: 2, label: 'f(0)=2', tone: 'bad', labelPos: 'left' },
              { x: 5, y: 22, label: 'f(5)=22 (MAXIMUM ABSOLU)', tone: 'accent', labelPos: 'left' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'f(t)',
            caption:
              '$f(t)=t^3-6t^2+9t+2$ sur $[0\\,;5]$ — le maximum local (t=1, f=6) n\'est PAS le maximum ' +
              'absolu ! Celui-ci se trouve à la borne t=5 (f=22). Le minimum absolu, lui, est ' +
              'atteint à la fois en t=0 et en t=3 (valeur commune 2).',
          },
        },
        {
          kind: 'featureTable',
          headers: ['t', '0 (borne)', '1', '3', '5 (borne)'],
          rows: [
            ['f(t)', '2', '6 (max local)', '2 (min local)', '22'],
            ['Statut', 'min absolu (ex æquo)', '—', 'min absolu (ex æquo)', 'MAX ABSOLU'],
          ],
        },
        {
          kind: 'piege',
          label: 'S\'arrêter au tableau de signes de f\' sans regarder les bornes',
          text:
            'Le tableau de signes de f\' répond correctement « $f(1)=6$ est un maximum LOCAL ». ' +
            'Mais répondre « donc le maximum de f sur $[0\\,;5]$ est 6 » est FAUX ici : $f(5)=22$ ' +
            'dépasse largement cette valeur ! Sur un intervalle borné, la comparaison finale aux ' +
            'bornes n\'est jamais une formalité — c\'est une étape qui peut renverser la conclusion.',
        },
        {
          kind: 'astuce',
          label: 'Dresse une liste unique de candidats avant de comparer',
          text:
            'Regroupe TOUJOURS dans une seule liste : valeurs aux extremums locaux ET valeurs ' +
            'aux deux bornes. Compare cette liste d\'un coup d\'œil. Le plus grand nombre est le ' +
            'maximum absolu, le plus petit le minimum absolu — sans exception ni cas particulier à retenir.',
        },
        {
          kind: 'atelier',
          tag: 'extrema-bornes-widget',
          label: 'Manipule toi-même : le basculement vers la borne',
          caption:
            'f(t)=t³−6t²+9t+2, comme dans l\'exemple. Fais glisser la borne b : à partir d\'un ' +
            'certain point (b=4), la valeur à la borne dépasse le maximum local — le maximum ' +
            'absolu change alors de camp.',
        },
        {
          kind: 'entrainement',
          title: 'Extrema en contexte borné',
          generatorId: '5gen34',
          description: [
            'Sur un intervalle fermé [0 ; T] : dérive, résous f\'(t)=0, dresse le tableau de ' +
              'signes (de 0 à T), calcule f aux points critiques et aux deux bornes, puis identifie ' +
              'le maximum et le minimum absolus parmi TOUTES ces valeurs.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 34. Extrema en contexte borné »',
        },
      ],
    },
    {
      id: 'vitesse-position',
      number: 11,
      title: 'Vitesse et position',
      kicker: 's(t) position, v(t)=s\'(t) vitesse, a(t)=v\'(t)=s\'\'(t) accélération',
      blocks: [
        { kind: 'video', title: 'Vitesse et position : s, v = s\', a = v\' et interprétation du mouvement', youtubeId: 'iSGuNQqjnxc' },
        {
          kind: 'rappel',
          label: 'Rappel — dériver la position donne la vitesse, dériver la vitesse donne l\'accélération',
          items: [
            'Pour un mouvement en ligne droite décrit par une position $s(t)$ (en mètres, t en ' +
              'secondes) : la **vitesse** est $v(t) = s\'(t)$, et l\'**accélération** est $a(t) = ' +
              'v\'(t) = s\'\'(t)$. C\'est exactement la même logique que le sens de variation ' +
              '(section 4), appliquée à la physique — v est la dérivée de la POSITION, a est la ' +
              'dérivée de la VITESSE.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'position, vitesse, accélération sur un mouvement',
          formula: 'Un mobile a pour position $s(t) = -t^2+8t$ (mètres, t∈[0;8] secondes). Étudie son mouvement.',
          steps: [
            { tag: 'vitesse', text: '$v(t) = s\'(t) = -2t + 8$' },
            { tag: 'accélération', text: '$a(t) = v\'(t) = -2$ m/s² (constante)' },
            { tag: 'quand la vitesse s\'annule', text: '$v(t)=0 \\iff t=4$ s ⟹ $s(4) = -16+32 = 16$ m (position maximale, le mobile rebrousse chemin)' },
            { tag: 'signe de v — sens du mouvement', text: '$v(2) = 4 > 0$ (avance) ; $v(6) = -4 < 0$ (recule)' },
          ],
          result: {
            tag: 'interprétation physique',
            text:
              'Le mobile avance (v>0) jusqu\'à t=4 s. Il atteint sa position maximale (16 m) au ' +
              'moment EXACT où v s\'annule, puis recule (v<0). L\'accélération négative ' +
              'constante (−2 m/s²) le freine, puis le fait repartir en arrière — comme un objet ' +
              'lancé, puis freiné.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => -t * t + 8 * t, tone: 'accent', xMin: 0, xMax: 8 }],
            xMin: -0.5,
            xMax: 8.5,
            xTicks: [4],
            fixedYRange: { min: -1, max: 19 },
            points: [{ x: 4, y: 16, label: 's(4)=16 m (maximum)', tone: 'good', labelPos: 'above' }],
            xAxisLabel: 't (s)',
            yAxisLabel: 's(t) (m)',
            caption: 's(t)=−t²+8t — position maximale en t=4 s',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => -2 * t + 8, tone: 'good', xMin: 0, xMax: 8 }],
            xMin: -0.5,
            xMax: 8.5,
            xTicks: [4],
            fixedYRange: { min: -9, max: 9 },
            points: [{ x: 4, y: 0, label: 'v(4)=0', tone: 'good', labelPos: 'above' }],
            xAxisLabel: 't (s)',
            yAxisLabel: 'v(t) (m/s)',
            caption:
              '$v(t)=s\'(t)=-2t+8$ — la position est maximale EXACTEMENT quand la vitesse ' +
              's\'annule (t=4 s) : positive avant (le mobile avance), négative après (il recule).',
          },
        },
        {
          kind: 'rappel',
          label: 'La vitesse n\'est qu\'UN exemple parmi d\'autres grandeurs reliées par une dérivée',
          items: [
            'La dérivée s\'applique chaque fois qu\'une grandeur est le **taux de variation ' +
              'instantané** d\'une autre. La formule $f\'(x) = \\displaystyle\\lim_{h \\to 0} ' +
              '\\dfrac{f(x+h)-f(x)}{h}$ ne change jamais — seule l\'interprétation physique ' +
              'change de nom.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Fonction', 'Variable', 'Dérivée'],
          rows: [
            ['Distance parcourue', 'temps', 'vitesse instantanée'],
            ['Volume', 'temps', 'débit'],
            ['Coût de production', 'quantité produite', 'coût marginal (section 9)'],
            ['Concentration d\'un produit de réaction', 'temps', 'vitesse de réaction (pour un réactif, l\'opposé de la dérivée : sa concentration diminue)'],
            ['Longueur d\'une barre métallique', 'température', 'allongement par degré : $\\alpha \\cdot L_0$ (α = coefficient de dilatation)'],
          ],
        },
        {
          kind: 'para',
          text:
            'La dérivée sert aussi à **optimiser** n\'importe laquelle de ces grandeurs — coût ' +
            'minimal, volume maximal, aire maximale (sections 8 et 9). La méthode reste ' +
            'toujours la même : dérivée nulle au point optimal, confirmée par un tableau de signes.',
        },
        {
          kind: 'attention',
          label: 'Vitesse négative ne veut pas dire « ralentir »',
          text:
            'v(t)<0 signifie que le mobile se déplace dans le sens NÉGATIF — il recule. Ça ne ' +
            'veut pas dire qu\'il ralentit ! Le mobile ralentit quand |v(t)| DIMINUE — ce qui ' +
            'dépend du signe de a(t) par rapport à celui de v(t), jamais du seul signe de v.',
        },
        {
          kind: 'astuce',
          label: 'La position est extrémale exactement quand v=0',
          text:
            'Comme pour tout extremum (section 4) : la position s(t) est maximale ou minimale ' +
            'au moment précis où sa dérivée v(t) s\'annule ET change de signe. Repère toujours ' +
            'ce moment en premier — il structure toute l\'interprétation du mouvement.',
        },
        {
          kind: 'exemple',
          badge: 'atteindre une distance, puis rouler à vitesse constante',
          formula:
            'Une voiture déjà lancée a pour position $s(t) = t^2 + 4t$ (s en m, t en s) jusqu\'à ' +
            'un repère situé à 45 m du départ. Elle roule ensuite à vitesse constante jusqu\'à ' +
            'l\'arrivée, à 115 m du départ. Quand passe-t-elle le repère, à quelle vitesse, et ' +
            'quand arrive-t-elle ?',
          steps: [
            {
              tag: 'résoudre s(t) = 45 — équation du second degré',
              text: '$t^2 + 4t - 45 = 0$, $\\Delta = 16 + 180 = 196$, $t = \\dfrac{-4 \\pm 14}{2}$ : $t = 5$ ou $t = -9$',
            },
            { tag: 'rejeter la racine négative', text: 'un temps négatif n\'a pas de sens ici : le repère est franchi en $t_1 = 5$ s' },
            {
              tag: 'vitesse et accélération au repère',
              text: '$v(t) = s\'(t) = 2t + 4 \\implies v(5) = 14$ m/s ; $a(t) = v\'(t) = 2$ m/s² : $v > 0$ et $a > 0$, la voiture avance de plus en plus vite',
            },
            { tag: 'convertir en km/h — multiplier par 3,6', text: '$14 \\times 3{,}6 = 50{,}4$ km/h' },
            { tag: 'segment à vitesse constante', text: 'il reste $115 - 45 = 70$ m à 14 m/s : $t_2 = \\dfrac{70}{14} = 5$ s' },
          ],
          result: { tag: 'conclusion', text: 'repère franchi à $t = 5$ s, à 50,4 km/h ; arrivée à $t = 5 + 5 = 10$ s' },
        },
        {
          kind: 'astuce',
          label: 'Convertir une vitesse',
          text:
            '$1$ m/s $= 3600$ m/h $= 3{,}6$ km/h : pour passer des m/s aux km/h, multiplie par 3,6 ; ' +
            'pour revenir aux m/s, divise par 3,6. Un ordre de grandeur aide à vérifier : un ' +
            'sprinteur atteint environ 10 m/s, soit 36 km/h.',
        },
        {
          kind: 'exemple',
          badge: 'distance de freinage',
          formula:
            'Une voiture roule à 14 m/s (environ 50 km/h) quand elle freine, avec une décélération ' +
            'constante de 7 m/s² : depuis le début du freinage, sa position vaut $s(t) = 14t - 3{,}5t^2$ ' +
            '(en m, t en s). Quelle distance parcourt-elle avant de s\'arrêter ? Et si elle roulait à 21 m/s (environ 75 km/h) ?',
          steps: [
            { tag: 'vitesse et accélération', text: "$v(t) = s'(t) = 14 - 7t$ ; $a(t) = -7$ m/s² : $v > 0$ et $a < 0$, la voiture ralentit" },
            { tag: 'arrêt — quand v(t) = 0', text: '$14 - 7t = 0 \\iff t = 2$ s' },
            { tag: 'distance de freinage', text: '$s(2) = 28 - 14 = 14$ m' },
            { tag: 'même freinage à 21 m/s', text: '$s(t) = 21t - 3{,}5t^2$ ; $v(t) = 21 - 7t = 0 \\iff t = 3$ s ; $s(3) = 63 - 31{,}5 = 31{,}5$ m' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'vitesse multipliée par 1,5 → distance de freinage multipliée par $2{,}25 = 1{,}5^2$ : elle ' +
              'est proportionnelle au **carré** de la vitesse (sans compter la distance parcourue pendant le temps de réaction).',
          },
        },
        {
          kind: 'historique',
          titre: 'Newton et les « fluxions » : la dérivée est née de la vitesse',
          text:
            'En 1665-1666, l\'université de Cambridge est fermée par la peste. Réfugié dans la ferme ' +
            'familiale, le jeune **Isaac Newton** met au point sa « méthode des fluxions » : il voit ' +
            'chaque grandeur comme une quantité qui « coule » avec le temps (une fluente), et sa ' +
            'vitesse de variation comme sa « fluxion », notée par un point au-dessus de la lettre. ' +
            'C\'est exactement $v(t) = s\'(t)$ : pour Newton, la dérivée est d\'abord une vitesse. ' +
            'Une dizaine d\'années plus tard, **Gottfried Wilhelm Leibniz** invente de son côté la ' +
            'notation $\\frac{dy}{dx}$ (publiée en 1684), celle que l\'on utilise encore. La querelle ' +
            'sur la paternité du calcul différentiel opposera les deux savants, et leurs partisans, ' +
            'pendant des décennies.',
        },
        {
          kind: 'entrainement',
          title: 'Vitesse et position',
          generatorId: '5gen35',
          description: [
            'Résous s(t) = D en rejetant la racine négative, dérive pour obtenir la vitesse et ' +
              'l\'accélération, interprète le sens du mouvement, convertis en km/h — puis, selon la ' +
              'variante, termine le trajet à vitesse constante. Scénarios : sprint, natation, cyclisme...',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 35. Vitesse et position »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Nombre dérivé & tangente',
        formulas: [
          { text: '$f\'(a) = \\displaystyle\\lim_{h \\to 0} \\dfrac{f(a+h)-f(a)}{h}$' },
          { text: '$y = f(a) + f\'(a)(x-a)$', condition: 'équation de la tangente en x=a' },
          { text: '$f\'(a) = 0$', condition: 'tangente horizontale en x=a' },
          { text: '$f(a+h) \\approx f(a) + f\'(a)\\,h$', condition: 'approximation affine, pour h petit' },
          { text: '$f(x) - t(x) = (x-a)^2 \\cdot Q(x)$', condition: 'polynôme : racine double au point de contact a ; une racine double de Q donne un second point de tangence' },
        ],
      },
      {
        title: 'Dérivées de référence',
        formulas: [
          {
            text:
              '$(x^n)\' = n x^{n-1} \\quad (\\sqrt{x})\' = \\dfrac{1}{2\\sqrt{x}} \\quad ' +
              '\\left(\\frac{1}{x}\\right)\' = -\\dfrac{1}{x^2}$',
          },
          {
            text:
              '$(\\sin x)\' = \\cos x \\quad (\\cos x)\' = -\\sin x \\quad ' +
              '(\\tan x)\' = \\dfrac{1}{\\cos^2 x}$',
          },
          {
            text:
              '$(u^n)\' = n u^{n-1} u\' \\quad (\\sqrt{u})\' = \\dfrac{u\'}{2\\sqrt{u}} \\quad ' +
              '\\left(\\frac{1}{u}\\right)\' = -\\dfrac{u\'}{u^2}$',
            condition: 'règle de la chaîne, cas usuels (u fonction de x)',
          },
        ],
      },
      {
        title: 'Règles de calcul',
        formulas: [
          { text: '$(k \\cdot u)\' = k \\cdot u\' \\quad (u+v)\' = u\'+v\'$' },
          { text: '$(uv)\' = u\'v+uv\'$' },
          { text: '$\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v-uv\'}{v^2}$' },
          { text: '$f(x)=g(u(x)) \\Rightarrow f\'(x) = u\'(x) \\cdot g\'(u(x))$' },
        ],
      },
      {
        title: 'Signe de f\' et de f\'\'',
        formulas: [
          { text: '$f\'(x) > 0$', condition: 'f croissante' },
          { text: '$f\'(x) < 0$', condition: 'f décroissante' },
          { text: '$f\'(a) = 0$ et f\' change de signe', condition: 'extremum local en a' },
          { text: '$f\'\'(x) > 0$', condition: 'f convexe (bol, ∪)' },
          { text: '$f\'\'(x) < 0$', condition: 'f concave (dôme, ∩)' },
          { text: '$f\'\'(a) = 0$ et f\'\' change de signe', condition: 'point d\'inflexion en a' },
        ],
      },
      {
        title: 'Applications économiques et physiques',
        formulas: [
          { text: '$C\'(q) \\approx C(q+1) - C(q)$', condition: 'coût marginal, en q unités' },
          { text: '$\\text{écart} = \\dfrac{|C(q+1)-C(q)-C\'(q)|}{|C\'(q)|} \\times 100\\,\\%$', condition: 'écart entre les deux estimations du coût marginal' },
          { text: '$R\'(x) = C\'(x)$', condition: 'bénéfice maximal — recette marginale = coût marginal' },
          { text: '$C_M(q) = \\dfrac{C(q)}{q}$', condition: 'coût moyen — minimal quand $C\'(q) = C_M(q)$' },
          { text: '$v(t) = s\'(t) \\quad a(t) = v\'(t) = s\'\'(t)$' },
          { text: '$1$ m/s $= 3{,}6$ km/h' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Définition de f\'(a)** — la limite du taux d\'accroissement $\\dfrac{f(a+h)-f(a)}{h}$ quand ' +
        'h→0 (chapitre précédent). C\'est la pente de la tangente en a.',
      '**Tangente** — $y=f(a)+f\'(a)(x-a)$. Horizontale ⟺ $f\'(a)=0$. Localement, elle ne touche ' +
        'la courbe qu\'au point de contact, mais elle peut la recouper plus loin — et une même ' +
        'droite peut être tangente en deux points. Près de a, elle approche f : $f(a+h) \\approx f(a)+f\'(a)\\,h$.',
      '**Fonction dérivée** — règles de la somme, du produit ($u\'v+uv\'$), du quotient ' +
        '($\\frac{u\'v-uv\'}{v^2}$) et de la chaîne ($u\'(x) \\cdot g\'(u(x))$). Jamais ' +
        '$(uv)\'=u\'v\'$ ni $\\left(\\frac{u}{v}\\right)\'=\\frac{u\'}{v\'}$ !',
      '**Signe de f\'/f\'\'** — f\'>0 ⟹ croissante, f\'<0 ⟹ décroissante, f\'=0 ET change de ' +
        'signe ⟹ extremum local. f\'\'>0 ⟹ convexe (∪), f\'\'<0 ⟹ concave (∩), f\'\' change de ' +
        'signe ⟹ point d\'inflexion. Point anguleux ou tangente verticale : f\'(a) n\'existe pas.',
      '**Étude locale** — le tableau de signes de f\' (avec les colonnes ∄ des valeurs exclues) ' +
        'donne les variations et les extremums, en valeurs exactes. Un point critique ' +
        '(f\'(a)=0) n\'est un extremum QUE si f\' change réellement de signe.',
      '**Étude complète** — domaine → limites et asymptotes (chapitre précédent) → f\' et ' +
        'variations → f\'\' et concavité → coordonnées des points remarquables → graphique.',
      '**Applications en contexte** — optimisation géométrique (dérivée nulle, nature par le ' +
        'tableau de signes), coût marginal $C\'(q)$ et écart en %, bénéfice maximal ⟺ Rm=Cm, coût ' +
        'moyen minimal ⟺ Cm = $C_M$ (dichotomie si besoin). Extrema BORNÉS : compare aussi aux ' +
        'bornes de l\'intervalle. Vitesse $v=s\'$, accélération $a=v\'=s\'\'$, 1 m/s = 3,6 km/h.',
    ],
    checklist: {
      items: [
        'Ai-je vérifié que f\' change bien de signe avant d\'appeler un point critique un extremum ?',
        'Pour un produit ou un quotient : ai-je utilisé la formule complète, jamais le produit/quotient des dérivées ?',
        'Sur un intervalle FERMÉ : ai-je comparé les extremums locaux AUX valeurs des deux bornes ?',
        'Ma tangente vérifie-t-elle les deux conditions (passe par le point, ET a la bonne pente) ?',
        'Pour un point remarquable, ai-je donné ses DEUX coordonnées, en valeurs exactes ?',
        'Dans un problème concret, ai-je rejeté les solutions sans sens (temps ou longueur négatifs) et donné l\'unité ?',
      ],
    },
    forward:
      'En 6e, tu dériveras de nouvelles fonctions — exponentielles $a^x$ et $e^x$, logarithmes — avec ' +
      'exactement les mêmes règles, puis tu feras le chemin inverse : retrouver une fonction à partir ' +
      'de sa dérivée (primitives), ce qui permet de calculer des aires (intégrales).',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen43',
      description: [
        '7 thèmes de 20 affirmations chacun : reconnaissance graphique, calcul par définition, ' +
          'fonction dérivée, tangentes, étude locale et graphique, étude complète, applications ' +
          'en contexte. Choisis un thème, réponds vrai ou faux — la justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 43. Dérivées et applications — quiz vrai/faux »',
    },
  },
}
