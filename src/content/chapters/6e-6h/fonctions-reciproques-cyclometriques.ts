import type { ChapterContent } from '../../types'

const PI = Math.PI

/** Réciproque de x ↦ x³ + x (strictement croissante sur ℝ), calculée par dichotomie : aucune
 * expression simple n'existe, c'est justement l'intérêt de l'exemple « en un point ». */
function reciproqueCubePlusX(y: number): number {
  let bas = -10
  let haut = 10
  for (let i = 0; i < 60; i++) {
    const milieu = (bas + haut) / 2
    if (milieu * milieu * milieu + milieu < y) bas = milieu
    else haut = milieu
  }
  return (bas + haut) / 2
}

export const fonctionsReciproquesCyclometriques: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 1,
  title: 'Fonctions réciproques & cyclométriques',
  slug: 'fonctions-reciproques-cyclometriques',
  lede:
    'Toute fonction bijective a une réciproque, qui « défait » ce qu\'elle fait. Applique cette ' +
    'idée à sin, cos et tan : tu obtiens trois nouvelles fonctions, les **arcfonctions** — ' +
    "indispensables pour résoudre des équations trigonométriques et retrouver un angle à partir " +
    "d'un rapport.",

  sections: [
    {
      id: 'reciproques',
      number: 1,
      title: "Fonction réciproque d'une fonction bijective",
      titreCourt: 'Fonction réciproque',
      partie: 'Réciproques et arcfonctions',
      essentiel: [
        'f est **injective** si deux entrées différentes ne donnent jamais la même image : toute droite horizontale coupe son graphe en au plus un point. Seule une fonction bijective a une réciproque $f^{-1}$, qui « défait » f : $f^{-1}(f(x)) = x$.',
        'dom($f^{-1}$) = Image($f$) et Image($f^{-1}$) = dom($f$) ; les deux graphes sont symétriques par rapport à $y = x$. Pour trouver $f^{-1}$ : permute x et y dans $y = f(x)$, puis isole y.',
        'Dérivée d\'une réciproque : $(f^{-1})\'(x) = \\dfrac{1}{f\'(f^{-1}(x))}$, si $f\'(f^{-1}(x)) \\neq 0$ — la pente s\'inverse.',
      ],
      cartes: [
        { question: '$f(x) = \\dfrac{5}{x-1}$ : que vaut $f^{-1}(x)$ ?', reponse: '$1 + \\dfrac{5}{x}$, et non $\\dfrac{1}{f(x)} = \\dfrac{x-1}{5}$.' },
        { question: 'Comment rendre $x \\mapsto x^2$ inversible ?', reponse: 'La restreindre à $\\mathbb{R}^+$ : sa réciproque est alors $\\sqrt{x}$.' },
        { question: '$f(x) = x^3 + x$ : que vaut $(f^{-1})\'(2)$ ?', reponse: '$f(1) = 2$ et $f\'(1) = 4$, donc $(f^{-1})\'(2) = \\dfrac{1}{4}$.' },
        { question: 'Le point $(a ; b)$ est sur le graphe de f : quel point est sur celui de $f^{-1}$ ?', reponse: '$(b ; a)$, son symétrique par rapport à $y = x$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Fonction réciproque d\'une fonction bijective (1/2)', youtubeId: 'cljx_XgPpeE' },
        { kind: 'video', title: 'Fonction réciproque : trouver f⁻¹ et la dériver (2/2)', youtubeId: 'fzLkgKdVM3g' },
        { kind: 'subheading', text: 'Injective, surjective, bijective' },
        {
          kind: 'para',
          text:
            'Prends une fonction $f$ définie sur un ensemble $A$, à valeurs dans un ensemble ' +
            '$B$. Elle peut avoir trois propriétés indépendantes :',
        },
        {
          kind: 'definition',
          items: [
            '$f$ est **injective** si $f(x_1) = f(x_2)$ entraîne toujours $x_1 = x_2$ : deux ' +
              'entrées différentes ne donnent jamais la même image.',
            '$f$ est **surjective** sur $B$ si Image($f$) = $B$ : tout élément de $B$ est ' +
              'atteint, pas seulement une partie de $B$.',
            '$f$ est **bijective** sur $B$ si elle est les deux à la fois : injective **et** ' +
              'surjective sur $B$.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'setMapping',
              setALabel: 'A',
              setBLabel: 'B',
              pointsA: [0, 0.5, 1],
              pointsB: [0, 1 / 3, 2 / 3, 1],
              arrows: [
                { from: 0, to: 0 },
                { from: 1, to: 1 },
                { from: 2, to: 3 },
              ],
              caption:
                'Injective (deux flèches distinctes → deux images distinctes) mais non ' +
                "surjective : un élément de B n'est atteint par personne.",
            },
            {
              kind: 'setMapping',
              setALabel: 'A',
              setBLabel: 'B',
              pointsA: [0, 1 / 3, 2 / 3, 1],
              pointsB: [0, 0.5, 1],
              arrows: [
                { from: 0, to: 0 },
                { from: 1, to: 0 },
                { from: 2, to: 1 },
                { from: 3, to: 2 },
              ],
              caption:
                'Surjective (tout élément de B est atteint) mais non injective : deux éléments ' +
                'de A partagent la même image.',
            },
            {
              kind: 'setMapping',
              setALabel: 'A',
              setBLabel: 'B',
              pointsA: [0, 0.5, 1],
              pointsB: [0, 0.5, 1],
              arrows: [
                { from: 0, to: 0 },
                { from: 1, to: 1 },
                { from: 2, to: 2 },
              ],
              caption: 'Bijective : injective et surjective — chaque élément de B est atteint exactement une fois.',
            },
          ],
        },
        {
          kind: 'historique',
          titre: 'Le mathématicien qui a osé comparer des infinis',
          text:
            'Les mots « injective », « surjective » et « bijective » que tu viens de voir ' +
            'trouvent leur origine dans les travaux du mathématicien allemand **Georg ' +
            'Cantor**, dans les années 1870. Cantor cherche alors à répondre à une question ' +
            'qui semblait presque absurde : peut-on comparer la « taille » de deux ensembles ' +
            'infinis ? Son idée, révolutionnaire pour l\'époque, est exactement celle de ' +
            'cette section — s\'il existe une bijection entre deux ensembles (chaque élément ' +
            'de l\'un associé à exactement un élément de l\'autre, sans rien oublier ni ' +
            'répéter), alors ces deux ensembles ont, par définition, « autant » d\'éléments, ' +
            'même s\'ils sont tous les deux infinis. Cantor démontre ainsi l\'un des résultats ' +
            'les plus déroutants des mathématiques : il existe une bijection entre ' +
            '$\\mathbb{N}$ et $\\mathbb{Q}$ (ces deux infinis ont « la même taille »), mais ' +
            'aucune bijection n\'existe entre $\\mathbb{N}$ et $\\mathbb{R}$ — il y a donc ' +
            'plusieurs sortes d\'infini. Ses idées ont été violemment contestées par certains ' +
            'de ses contemporains avant de devenir un pilier des mathématiques modernes.',
          image: {
            src: '/images/historique/cantor.jpg',
            alt: 'Portrait de Georg Cantor',
            caption: 'Georg Cantor (1845–1918), photographie d\'époque.',
          },
        },
        {
          kind: 'astuce',
          label: "💡 Lire l'injectivité sur un graphique",
          text:
            'Un test rapide, sans aucun calcul : une fonction est injective si et seulement ' +
            'si **toute droite horizontale coupe son graphe en au plus un point**.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => (x * x * x) / 4, tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              testLine: { y: 0.5, points: [{ x: Math.cbrt(2) }] },
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'Une seule intersection → injective.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => x * x - 1, tone: 'accent' }],
              xMin: -2,
              xMax: 2,
              xTicks: [],
              testLine: { y: 0.5, points: [{ x: -Math.sqrt(1.5) }, { x: Math.sqrt(1.5) }] },
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'Deux intersections → non injective.',
            },
          ],
        },
        { kind: 'subheading', text: 'Relation réciproque et fonction réciproque' },
        {
          kind: 'atelier',
          tag: 'droite-horizontale-widget',
          label: 'Manipule toi-même — la droite horizontale',
          caption:
            'Fais glisser la droite horizontale y = k et compte ses intersections avec le ' +
            'graphe. Choisis ensuite une restriction du domaine : la partie jetée passe en ' +
            'gris, et le verdict dit si la fonction restreinte est injective. Une ' +
            'restriction est bonne quand plus aucune horizontale ne coupe deux fois.',
        },
        {
          kind: 'para',
          text:
            "Seule une fonction bijective (entre un domaine et un ensemble d'arrivée bien " +
            'choisis) a une **réciproque**, notée $f^{-1}$, qui « défait » $f$ :',
        },
        { kind: 'para', text: '$f^{-1}(f(x)) = x \\quad$ et $\\quad f(f^{-1}(y)) = y$' },
        {
          kind: 'intuition',
          label: 'La machine qui défait',
          text:
            "Une fonction $f$, c'est une machine : tu entres $x$, elle ressort $f(x)$. Sa " +
            'réciproque $f^{-1}$ est une seconde machine qui fait le trajet **inverse** : tu ' +
            'lui donnes $f(x)$, elle te rend $x$. Comme une clé qui verrouille un cadenas et ' +
            "une clé qui le déverrouille — l'une défait exactement ce que l'autre a fait.",
        },
        {
          kind: 'definition',
          label: 'Relation réciproque — la définition précise',
          items: [
            'Soit $f$ une fonction de $\\mathbb{R}$ dans $\\mathbb{R}$. La **relation ' +
              'réciproque** de $f$ associe, à tout élément $x$ de Image($f$), **le ou les** ' +
              'éléments $y$ de dom($f$) tels que $f(y) = x$.',
            'Cette relation existe toujours, quelle que soit $f$ — rien de particulier n\'est ' +
              'requis pour l\'écrire. Ce qui n\'est pas garanti, c\'est qu\'elle soit une ' +
              '**fonction** : il faudrait pour ça qu\'à chaque $x$ corresponde **un seul** $y$, ' +
              'et rien ici ne l\'assure.',
          ],
        },
        {
          kind: 'para',
          text:
            'Autrement dit : dès que $f$ est **injective**, sa réciproque est déjà une ' +
            "fonction — il suffit de restreindre l'ensemble d'arrivée à Image($f$) pour obtenir " +
            'la bijectivité automatiquement. Ce point mérite une démonstration : c\'est lui ' +
            'qui autorise la notation $f^{-1}$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — si f est injective, sa relation réciproque est une fonction',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $f$ une fonction injective, et soit $x \\in$ Image($f$). Dire que la ' +
                'relation réciproque est une fonction, c\'est dire qu\'elle associe à ce $x$ ' +
                '**une valeur, et une seule**. Deux choses à vérifier : qu\'il existe au moins ' +
                'un $y$ convenable, et qu\'il n\'y en a pas deux.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — existence.** $x \\in$ Image($f$) veut justement dire, par ' +
                'définition de l\'image, qu\'il existe au moins un $y \\in$ dom($f$) tel que ' +
                '$f(y) = x$. La relation réciproque associe donc bien au moins une valeur à ' +
                '$x$ — le domaine de départ Image($f$) a été choisi exactement pour ça.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — unicité.** Suppose que deux éléments $y_1$ et $y_2$ de dom($f$) ' +
                'conviennent tous les deux : $f(y_1) = x$ et $f(y_2) = x$. Alors ' +
                '$f(y_1) = f(y_2)$ — exactement la situation où l\'injectivité conclut : ' +
                '$f(y_1) = f(y_2) \\implies y_1 = y_2$. Les deux antécédents supposés distincts ' +
                'n\'en faisaient donc qu\'un.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — conclusion.** À chaque $x$ de Image($f$), la relation réciproque ' +
                'associe un $y$ (étape 1) et un seul (étape 2) : c\'est exactement la ' +
                'définition d\'une fonction. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Tu peux alors la noter $f^{-1}$ et parler de **fonction réciproque**. Remarque ' +
                'où l\'injectivité sert vraiment : jamais pour l\'existence (elle vient de ' +
                'Image($f$)), seulement pour l\'unicité.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'La notation $f^{-1}$ est trompeuse : $f^{-1}(x)$ et $\\dfrac{1}{f(x)}$ sont deux ' +
            'objets sans aucun rapport ! Pour $f(x) = \\dfrac{5}{x-1}$, tu verras que ' +
            '$f^{-1}(x) = 1 + \\dfrac{5}{x}$, alors que $\\dfrac{1}{f(x)} = \\dfrac{x-1}{5}$.',
        },
        {
          kind: 'para',
          text:
            "À l'inverse : si $f$ n'est pas injective, sa relation réciproque n'est pas une " +
            'fonction — un même $x$ y aurait plusieurs images.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x, tone: 'accent', xMin: -Math.sqrt(2), xMax: Math.sqrt(2) },
              { fn: (x) => Math.sqrt(Math.max(0, x)), tone: 'good', xMin: 0, xMax: 2 },
              { fn: (x) => -Math.sqrt(Math.max(0, x)), tone: 'good', xMin: 0, xMax: 2 },
              { fn: (x) => x, tone: 'faint' },
            ],
            xMin: -2,
            xMax: 2,
            xTicks: [],
            points: [
              { x: 1, y: 1, label: '', tone: 'bad' },
              { x: 1, y: -1, label: '', tone: 'bad' },
            ],
            xAxisLabel: '',
            yAxisLabel: '',
            caption:
              'En orange : $y = x^2$ (domaine ℝ, non injective). En vert : sa relation ' +
              'réciproque $y = \\pm\\sqrt{x}$, qui n\'est pas une fonction — en $x = 1$, elle ' +
              'donne deux images (points marqués).',
          },
        },
        {
          kind: 'historique',
          titre: 'Qu\'est-ce qu\'une fonction, au juste ?',
          text:
            'Ce que tu viens de démontrer — qu\'une relation réciproque n\'est une fonction ' +
            'que si elle associe **une seule** valeur à chaque $x$ — repose sur une définition ' +
            'qui n\'a rien d\'évident historiquement. Pendant longtemps, une « fonction » ' +
            'désignait seulement une expression algébrique explicite, comme $x^2$ ou ' +
            '$\\sin(x)$. C\'est le mathématicien allemand **Peter Gustav Lejeune Dirichlet** ' +
            'qui, en 1837, propose la définition moderne que ce chapitre utilise sans le ' +
            'dire : une fonction est simplement une correspondance qui associe, à chaque ' +
            'élément d\'un ensemble de départ, **un seul** élément d\'un ensemble d\'arrivée — ' +
            'peu importe que cette correspondance s\'exprime par une formule, un graphique ' +
            'ou même un tableau de valeurs. Cette définition, bien plus large que ' +
            'l\'ancienne, est exactement ce qui permet de parler proprement d\'injectivité, ' +
            'de surjectivité et de réciproque, quelle que soit la fonction considérée.',
          image: {
            src: '/images/historique/dirichlet.jpg',
            alt: 'Portrait de Peter Gustav Lejeune Dirichlet',
            caption: 'Peter Gustav Lejeune Dirichlet (1805–1859), lithographie d\'époque.',
          },
        },
        { kind: 'subheading', text: 'Domaine, image et graphe de la réciproque' },
        {
          kind: 'definition',
          label: 'Domaine et ensemble-image de la réciproque',
          items: [
            'Pour $f$ injective : dom($f^{-1}$) = Image($f$) et Image($f^{-1}$) = dom($f$).',
          ],
        },
        {
          kind: 'para',
          text:
            'Rien à calculer ici : c\'est la construction même de la relation réciproque qui ' +
            'l\'impose. Elle part des éléments $x$ de Image($f$) — ce sont donc eux, et eux ' +
            'seuls, qui ont une image par $f^{-1}$, d\'où dom($f^{-1}$) = Image($f$). Elle les ' +
            'renvoie vers des éléments $y$ de dom($f$), qui sont donc exactement les valeurs ' +
            'prises par $f^{-1}$, d\'où Image($f^{-1}$) = dom($f$). Les deux ensembles ont ' +
            'simplement **échangé leur rôle**.',
        },
        {
          kind: 'para',
          text:
            'Cet échange se lit d\'un coup d\'œil sur les graphiques. Passer de $f$ à $f^{-1}$, ' +
            'c\'est permuter l\'abscisse et l\'ordonnée de chaque point : chaque point ' +
            '$(a ; b)$ devient $(b ; a)$. Dans un repère orthonormé, les deux graphes sont donc ' +
            '**symétriques** par rapport à la droite $y = x$.',
        },
        {
          kind: 'intuition',
          label: 'Un miroir posé sur y = x',
          text:
            'Pose un miroir le long de la droite $y = x$ : le reflet du graphe de $f$ dans ce ' +
            "miroir, c'est exactement le graphe de $f^{-1}$. Chaque point $(a\\,;\\,b)$ de $f$ " +
            'a son reflet $(b\\,;\\,a)$ sur $f^{-1}$ — retiens cette image, elle marche pour ' +
            "toute fonction réciproque, y compris pour arcsin, arccos et arctan plus loin dans " +
            'ce chapitre.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 2 * x + 1, tone: 'accent', xMin: -2.5, xMax: 1.5 },
              { fn: (x) => (x - 1) / 2, tone: 'good' },
              { fn: (x) => x, tone: 'faint' },
            ],
            xMin: -4,
            xMax: 4,
            xTicks: [],
            xAxisLabel: '',
            yAxisLabel: '',
            caption:
              'En orange : $f(x) = 2x+1$. En vert : sa réciproque $f^{-1}(x) = \\dfrac{x-1}{2}$. ' +
              'Les deux graphes sont symétriques par rapport à la droite $y = x$ (pointillés).',
          },
        },
        {
          kind: 'atelier',
          tag: 'reciproque-miroir-widget',
          label: 'Manipule toi-même — le miroir f / f⁻¹',
          caption:
            'Fais glisser le point sur f (en orange) : son symétrique suit automatiquement sur ' +
            'f⁻¹ (en vert), de l\'autre côté de la droite y = x. Bascule entre une fonction ' +
            'linéaire et une fonction cubique pour voir que le miroir marche pour toute ' +
            'fonction bijective, pas seulement pour une droite.',
        },
        {
          kind: 'definition',
          label: 'Propriétés de la réciproque',
          items: [
            'Pour $f$ injective, $f^{-1}$ l\'est aussi, et sa propre réciproque redonne $f$ : $(f^{-1})^{-1} = f$.',
            'Pour deux fonctions injectives $f$, $g$, la relation « être réciproque l\'une de ' +
              "l'autre » est symétrique : $g = f^{-1} \\iff f = g^{-1}$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la réciproque de f⁻¹ est f',
          blocks: [
            {
              kind: 'para',
              text:
                'Tout se déduit directement de la définition de la relation réciproque, sans ' +
                'aucun calcul : il suffit de la relire. Écrivons-la une fois pour toutes sous ' +
                'forme d\'équivalence, pour $f$ injective :',
            },
            {
              kind: 'para',
              text:
                '$(\\star) \\quad \\forall x \\in \\text{Im}(f), \\forall y \\in \\text{dom}(f) : ' +
                '\\quad y = f^{-1}(x) \\iff f(y) = x$',
            },
            {
              kind: 'para',
              text:
                '**Point 1 — la réciproque est elle aussi injective.** Suppose ' +
                '$f^{-1}(x_1) = f^{-1}(x_2)$, et ' +
                'note $y$ cette valeur commune. Par $(\\star)$ lu de gauche à droite, ' +
                '$f(y) = x_1$ et $f(y) = x_2$ ; comme $f$ est une fonction, elle n\'attribue ' +
                'qu\'une seule image à $y$, donc $x_1 = x_2$. C\'est exactement la définition ' +
                'de l\'injectivité de $f^{-1}$ — et c\'est ce qui permet de parler de la ' +
                'fonction $(f^{-1})^{-1}$ au point suivant.',
            },
            {
              kind: 'para',
              text:
                '**Point 2 — la réciproque de la réciproque redonne la fonction de départ.** ' +
                'Applique $(\\star)$ à la fonction ' +
                'injective $f^{-1}$ elle-même : pour tout $y$, $z = (f^{-1})^{-1}(y) \\iff ' +
                'f^{-1}(z) = y$. Or, à nouveau par $(\\star)$ (cette fois pour $f$), ' +
                '$f^{-1}(z) = y \\iff f(y) = z$. En enchaînant les deux équivalences : ' +
                '$z = (f^{-1})^{-1}(y) \\iff z = f(y)$.',
            },
            {
              kind: 'para',
              text:
                'Les deux fonctions prennent donc la même valeur en tout point, et le même ' +
                'domaine aussi, puisque dom$\\big((f^{-1})^{-1}\\big) = $ ' +
                'Image($f^{-1}$) $= $ dom($f$), d\'après la propriété « domaine et ' +
                'ensemble-image » vue plus haut. Même domaine, mêmes valeurs : ' +
                '$(f^{-1})^{-1} = f$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                '**Point 3 — le lien est symétrique.** Dire $g = f^{-1}$, ' +
                'c\'est dire, par $(\\star)$ : pour tous $x$ et $y$, $y = g(x) \\iff f(y) = x$. ' +
                'Cette phrase est **déjà symétrique** en $f$ et $g$ : lue de droite à gauche, ' +
                'elle dit que pour tous $x$ et $y$, $x = f(y) \\iff g(x) = y$ — mot pour mot ' +
                'la définition de $f = g^{-1}$. Une équivalence se lit dans les deux sens : les ' +
                'deux énoncés n\'en font qu\'un. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'C\'est cette symétrie qui autorise à parler d\'un **couple** de fonctions ' +
                'réciproques l\'une de l\'autre, sans devoir préciser laquelle est « la » ' +
                'réciproque de l\'autre. C\'est aussi elle qui rend leurs deux graphes ' +
                'symétriques par rapport à $y = x$ : la symétrie axiale, appliquée deux fois, ' +
                'ramène chaque graphe sur lui-même.',
            },
          ],
        },
        { kind: 'subheading', text: "Trouver l'expression analytique de f⁻¹" },
        {
          kind: 'methode',
          label: 'Méthode 1 — décomposition en fonctions élémentaires',
          items: [
            'Décompose $f$ en une chaîne d\'opérations élémentaires (chacune facile à ' +
              '« défaire »), puis remonte la chaîne en partant de l\'image.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — décomposition de f',
          blocks: [
            { kind: 'para', text: '$f(x) = \\dfrac{5}{x - 1}$' },
            {
              kind: 'operationChain',
              direction: 'forward',
              nodes: ['$x$', '$x - 1$', '$\\dfrac{1}{x-1}$', '$\\dfrac{5}{x-1}$'],
              operations: ['soustraire 1', 'inverser', '× 5'],
            },
            {
              kind: 'para',
              text: "Construis la réciproque en défaisant chaque opération, dans l'ordre inverse, en partant de l'image :",
            },
            {
              kind: 'operationChain',
              direction: 'backward',
              nodes: ['$1 + \\dfrac{5}{x}$', '$\\dfrac{5}{x}$', '$\\dfrac{x}{5}$', '$x$'],
              operations: ['ajouter 1', 'inverser', 'diviser par 5'],
            },
            {
              kind: 'para',
              text:
                "D'où $f^{-1}(x) = 1 + \\dfrac{5}{x}$, exactement le même résultat qu'avec la " +
                'méthode 2 ci-dessous.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'machine-reciproque-widget',
          label: 'Manipule toi-même — la machine qui défait',
          caption:
            'À gauche, la chaîne d\'opérations de f, lue de haut en bas ; à droite, la ' +
            'chaîne réciproque, qui défait chaque opération dans l\'ordre inverse, lue de ' +
            'bas en haut. Fais varier x : sur chaque ligne, les deux colonnes affichent la ' +
            'même valeur, et le retour rend le x de départ. Avec 5/(x − 1), essaie x = 1.',
        },
        {
          kind: 'methode',
          label: 'Méthode 2 — permutation',
          items: ['Dans $y = f(x)$, permute $x$ et $y$, puis isole $y$.'],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — permutation',
          blocks: [
            { kind: 'para', text: '$f(x) = \\dfrac{5}{x - 1}$' },
            { kind: 'para', text: 'Permutation : $x = \\dfrac{5}{y - 1}$.' },
            {
              kind: 'para',
              text:
                'Isolement : $x(y-1) = 5 \\implies xy - x = 5 \\implies y = \\dfrac{5 + x}{x} = ' +
                '\\dfrac{5}{x} + 1$.',
            },
            { kind: 'para', text: "D'où $f^{-1}(x) = 1 + \\dfrac{5}{x}$." },
          ],
        },
        {
          kind: 'para',
          text:
            'Cas particulier des fonctions homographiques $f(x) = \\dfrac{ax+b}{cx+d}$, avec ' +
            '$ad - bc \\neq 0$ (sinon $f$ est constante, donc pas injective) : la même méthode donne ' +
            '$f^{-1}(x) = \\dfrac{-dx+b}{cx-a}$. Et $f^{-1} = f$ exactement quand $a = -d$, ou quand ' +
            '$f$ est l\'identité ($b = c = 0$ et $a = d$, soit $f(x) = x$).',
        },
        { kind: 'subheading', text: 'Réparer une fonction non injective en restreignant son domaine' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — retour sur y = x²',
          blocks: [
            {
              kind: 'para',
              text:
                'Tu as vu plus haut que $f : \\mathbb{R} \\to \\mathbb{R} : x \\mapsto x^2$ ' +
                "n'est pas injective, donc sa relation réciproque n'est pas une fonction. Sa " +
                '**restriction** à $\\mathbb{R}^+$, elle, l\'est :',
            },
            { kind: 'para', text: '$f|_{\\mathbb{R}^+} : \\mathbb{R}^+ \\to \\mathbb{R}^+ : x \\mapsto x^2$' },
            {
              kind: 'para',
              text:
                'Sur $\\mathbb{R}^+$, deux réels distincts ont des carrés distincts : ' +
                '$f|_{\\mathbb{R}^+}$ est injective et a une réciproque, ' +
                '$f|_{\\mathbb{R}^+}^{-1}(x) = \\sqrt{x}$ — **attention !** $f|_{\\mathbb{R}^+}$ ' +
                'et $f$ restent deux fonctions différentes (même formule, mais domaines ' +
                'différents : $\\mathbb{R}^+$ contre $\\mathbb{R}$).',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => x * x, tone: 'faint', xMin: -1, xMax: 0 },
                  { fn: (x) => x * x, tone: 'accent', xMin: 0, xMax: 1.75 },
                  { fn: (x) => Math.sqrt(Math.max(0, x)), tone: 'good', xMin: 0, xMax: 4 },
                  { fn: (x) => x, tone: 'faint' },
                ],
                xMin: -1,
                xMax: 4,
                xTicks: [1, 2, 3],
                fixedYRange: { min: -1, max: 2.9 },
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'La branche gauche de la parabole (en gris) a été jetée : il ne reste, en ' +
                  'orange, que la restriction $f|_{\\mathbb{R}^+}$, injective. Sa réciproque ' +
                  '$y = \\sqrt{x}$ (en vert) est bien une fonction — une seule branche cette ' +
                  'fois — symétrique de la portion orange par rapport à la diagonale grise $y = x$.',
              },
            },
            {
              kind: 'para',
              text:
                'À l\'inverse, $g(x) = x^3$ (vue plus bas) est déjà injective sur $\\mathbb{R}$ ' +
                "tout entier : aucune restriction n'est nécessaire pour lui trouver une réciproque.",
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => x * x * x, tone: 'accent', xMin: -2.2, xMax: 2.2 },
                  { fn: Math.cbrt, tone: 'good', xMin: -2.2, xMax: 2.2 },
                  { fn: (x) => x, tone: 'faint' },
                ],
                xMin: -2.2,
                xMax: 2.2,
                xTicks: [-1, 1],
                fixedYRange: { min: -1.75, max: 1.75 },
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'En orange : $g(x) = x^3$. Toute droite horizontale ne la coupe qu\'une fois ' +
                  '— elle est injective sur $\\mathbb{R}$ entier. En vert : sa réciproque ' +
                  '$g^{-1}(x) = \\sqrt[3]{x}$, symétrique par rapport à $y = x$ (en gris), ' +
                  'définie elle aussi sur $\\mathbb{R}$ entier.',
              },
            },
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — étudier la réciproque d'une fonction",
          items: [
            'Détermine le **domaine** de $f$.',
            "Vérifie que $f$ est **injective** : $f(x_1) = f(x_2) \\implies x_1 = x_2$, ou $f$ " +
              'strictement monotone sur un intervalle, ou le test de la droite horizontale. Si elle ' +
              "ne l'est pas, **restreins** son domaine à un intervalle où elle l'est.",
            "Détermine l'**image** de $f$ : c'est le domaine de $f^{-1}$.",
            "Trouve l'**expression** de $f^{-1}$, par décomposition ou par permutation.",
            'Contrôle sur une valeur : si $f(a) = b$, alors $f^{-1}(b)$ doit redonner $a$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — restreindre un trinôme pour l'inverser",
          blocks: [
            { kind: 'para', text: '$f(x) = x^2 - 4x + 1$' },
            {
              kind: 'para',
              text:
                '**Forme canonique.** $f(x) = (x-2)^2 - 3$ : une parabole de sommet $(2 ; -3)$. ' +
                "Elle n'est pas injective sur $\\mathbb{R}$ : $f(0) = f(4) = 1$, deux réels " +
                "symétriques par rapport à $x = 2$ ont la même image.",
            },
            {
              kind: 'para',
              text:
                '**Restriction.** Sur $[2 ; +\\infty[$, $f$ est strictement croissante, donc ' +
                'injective. Son image y est $[-3 ; +\\infty[$ : $(x-2)^2$ prend toutes les valeurs ' +
                'positives, et seulement elles.',
            },
            {
              kind: 'para',
              text:
                '**Permutation.** $x = (y-2)^2 - 3$ avec $y \\ge 2$, soit $(y-2)^2 = x + 3$. Comme ' +
                '$y - 2 \\ge 0$, on garde la racine positive : $y - 2 = \\sqrt{x+3}$.',
            },
            {
              kind: 'para',
              text:
                "D'où $f^{-1}(x) = 2 + \\sqrt{x+3}$, de domaine $[-3 ; +\\infty[$ et d'image " +
                '$[2 ; +\\infty[$. Contrôle : $f(4) = 1$ et $f^{-1}(1) = 2 + \\sqrt{4} = 4$ ✓.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'vectorPlane',
                xMin: -4,
                xMax: 6.6667,
                yMin: -4,
                yMax: 6,
                grid: true,
                curves: [
                  { fn: (x) => (x - 2) * (x - 2) - 3, tone: 'faint', xMin: -1, xMax: 2 },
                  { fn: (x) => (x - 2) * (x - 2) - 3, tone: 'accent', xMin: 2, xMax: 5 },
                  { fn: (x) => 2 + Math.sqrt(Math.max(0, x + 3)), tone: 'good', xMin: -3, xMax: 6.6667 },
                ],
                vectors: [{ from: { x: -4, y: -4 }, to: { x: 6, y: 6 }, tone: 'faint', dashed: true, arrow: false }],
                points: [
                  { x: 4, y: 1, label: '(4 ; 1)', tone: 'accent', labelPos: 'right' },
                  { x: 1, y: 4, label: '(1 ; 4)', tone: 'good', labelPos: 'above' },
                  { x: 2, y: -3, label: '(2 ; −3)', tone: 'accent', labelPos: 'right' },
                  { x: -3, y: 2, label: '(−3 ; 2)', tone: 'good', labelPos: 'below' },
                ],
                caption:
                  'En orange : la restriction de $f$ à $[2 ; +\\infty[$ (la branche grise est ' +
                  'écartée). En vert : $f^{-1}(x) = 2 + \\sqrt{x+3}$. Chaque point $(a ; b)$ de ' +
                  "l'une a son symétrique $(b ; a)$ sur l'autre, par rapport à $y = x$ (pointillés) : le " +
                  'sommet $(2 ; -3)$ devient le point de départ $(-3 ; 2)$ de $f^{-1}$.',
              },
            },
          ],
        },
        { kind: 'subheading', text: "Dérivée d'une fonction réciproque" },
        {
          kind: 'para',
          text:
            'Quand tu as une expression exploitable de $f^{-1}$, aucun problème : tu la dérives ' +
            'avec les règles habituelles. Ainsi ' +
            '$\\left(\\sqrt{x}\\right)\' = \\dfrac{1}{2\\sqrt{x}}$ pour la réciproque de ' +
            '$x^2$ sur $\\mathbb{R}^+$, ou $\\left(1 + \\dfrac{5}{x}\\right)\' = ' +
            '-\\dfrac{5}{x^2}$ pour celle de $\\dfrac{5}{x-1}$. Mais il arrive qu\'on ne ' +
            'connaisse **aucune** expression exploitable de $f^{-1}$ — ce sera exactement le ' +
            'cas d\'arcsin, arccos et arctan. Le théorème suivant permet quand même de la ' +
            'dériver, à partir de la seule dérivée de $f$.',
        },
        {
          kind: 'intuition',
          label: "Pourquoi la pente s'inverse",
          text:
            'Tu viens de voir que les graphes de $f$ et $f^{-1}$ sont symétriques par rapport ' +
            'à $y = x$. Or réfléchir une droite par rapport à $y = x$ échange ses deux axes : ' +
            "une tangente de pente $m$ devient, après le miroir, une tangente de pente $1/m$. " +
            "C'est exactement pour ça que la dérivée de $f^{-1}$ est **l'inverse** de celle de " +
            "$f$ — le théorème qui suit ne fait que traduire cette image en formule.",
        },
        {
          kind: 'atelier',
          tag: 'pentes-inverses-widget',
          label: 'Manipule toi-même — des pentes inverses',
          caption:
            'Déplace le point A(a ; b) sur f (en orange) : son reflet A′(b ; a) sur f⁻¹ (en ' +
            'vert) porte une tangente dont la pente est l\'inverse de celle de f en A. Le ' +
            'petit triangle de pente montre pourquoi : le miroir y = x échange ses deux ' +
            'côtés. Amène A là où la tangente à f est horizontale : celle de f⁻¹ devient ' +
            'verticale.',
        },
        {
          kind: 'methode',
          label: "Théorème — dérivée d'une fonction réciproque",
          items: [
            'Si $f$ est **continue et strictement monotone sur un intervalle** $I$, et si $f$ est ' +
              "dérivable en $f^{-1}(x)$ avec $f'(f^{-1}(x)) \\neq 0$, alors $f^{-1}$ est dérivable " +
              'en $x$ et :',
            '$(f^{-1})\'(x) = \\dfrac{1}{f\'(f^{-1}(x))}$',
            'Les nombres dérivés de $f$ en $a$ et de $f^{-1}$ en $f(a)$ sont donc inverses ' +
              "l'un de l'autre — ce théorème explique les formules d'arcsin, arccos et arctan " +
              'de la section 4.',
          ],
        },
        {
          kind: 'para',
          text:
            'L\'hypothèse « sur un intervalle » n\'est pas décorative : c\'est elle qui garantit ' +
            'que $f^{-1}$ est continue, sans quoi elle ne pourrait pas être dérivable. ' +
            'Ce théorème est **admis sans démonstration** : c\'est le seul résultat du chapitre ' +
            'qui ne soit pas établi ici. Tu peux quand même le vérifier sur des cas où les ' +
            'deux membres se calculent séparément — c\'est tout l\'objet de la vérification ' +
            'croisée ci-dessous.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — dérivée de la racine cubique',
          blocks: [
            {
              kind: 'para',
              text:
                '$f(x) = x^3$ (déjà bijective sur $\\mathbb{R}$, sans restriction), $f\'(x) = ' +
                '3x^2$, $f^{-1}(x) = \\sqrt[3]{x}$.',
            },
            { kind: 'para', text: '$(\\sqrt[3]{x})\' = \\dfrac{1}{3(\\sqrt[3]{x})^2}$' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — vérification croisée',
          blocks: [
            {
              kind: 'para',
              text:
                'Reprends $f(x) = \\dfrac{5}{x-1}$, $f^{-1}(x) = 1 + \\dfrac{5}{x}$, et calcule ' +
                '$(f^{-1})\'(-5)$ de deux façons.',
            },
            {
              kind: 'para',
              text:
                'Par le théorème : $f^{-1}(-5) = 1 - 1 = 0$, et $f\'(x) = -\\dfrac{5}{(x-1)^2}$ ' +
                'donne $f\'(0) = -5$. D\'où $(f^{-1})\'(-5) = \\dfrac{1}{-5} = -\\dfrac{1}{5}$.',
            },
            {
              kind: 'para',
              text:
                'Par dérivation directe : $(f^{-1})\'(x) = (1 + \\dfrac{5}{x})\' = -\\dfrac{5}{x^2}$, ' +
                'donc $(f^{-1})\'(-5) = -\\dfrac{5}{25} = -\\dfrac{1}{5}$. Les deux méthodes ' +
                'concordent ✓ — la première est surtout utile quand $f^{-1}$ ne se dérive pas directement.',
            },
            {
              kind: 'para',
              text:
                'Rien n\'obligeait à s\'arrêter à $x = -5$ : le théorème redonne en fait la ' +
                'dérivée complète. Pour tout réel $x$ non nul, remplace $f^{-1}(x)$ par ' +
                '$1 + \\dfrac{5}{x}$ dans $f\'$ :',
            },
            {
              kind: 'para',
              text:
                '$(f^{-1})\'(x) = \\dfrac{1}{f\'(f^{-1}(x))} = ' +
                '\\dfrac{1}{f\'\\!\\left(1 + \\frac{5}{x}\\right)} = ' +
                '\\dfrac{1}{\\dfrac{-5}{\\left(\\left(1+\\frac{5}{x}\\right)-1\\right)^2}}$',
            },
            {
              kind: 'para',
              text:
                'Le dénominateur intérieur se simplifie tout seul : ' +
                '$\\left(1+\\frac{5}{x}\\right)-1 = \\dfrac{5}{x}$, dont le carré vaut ' +
                '$\\dfrac{25}{x^2}$. Il reste :',
            },
            {
              kind: 'para',
              text:
                '$(f^{-1})\'(x) = \\dfrac{1}{\\dfrac{-5}{\\frac{25}{x^2}}} = ' +
                '\\dfrac{1}{-5 \\cdot \\dfrac{x^2}{25}} = -\\dfrac{5}{x^2}$',
            },
            {
              kind: 'para',
              text:
                'C\'est exactement la dérivée obtenue en dérivant $1 + \\dfrac{5}{x}$ ' +
                'directement : le théorème n\'invente rien, il donne un **second chemin** vers ' +
                'le même résultat — le seul disponible quand tu ne connais pas d\'expression ' +
                'commode de $f^{-1}$, ce qui sera précisément le cas d\'arcsin, arccos et arctan.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => 5 / (x - 1), tone: 'accent' },
                  { fn: (x) => 1 + 5 / x, tone: 'good' },
                  { fn: (x) => x, tone: 'faint' },
                ],
                xMin: -7,
                xMax: 7,
                xTicks: [-5, 5],
                points: [
                  { x: 0, y: -5, label: '(0 ; −5)', tone: 'accent', labelPos: 'left' },
                  { x: -5, y: 0, label: '(−5 ; 0)', tone: 'good', labelPos: 'above' },
                ],
                fixedYRange: { min: -5.5, max: 5.5 },
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  'En orange : $f(x) = \\dfrac{5}{x-1}$. En vert : $f^{-1}(x) = 1 + \\dfrac{5}{x}$. ' +
                  'Les deux graphes sont symétriques par rapport à $y = x$ (en gris) : le point ' +
                  '$(0 ; -5)$ de $f$ se reflète exactement en $(-5 ; 0)$ sur $f^{-1}$ — c\'est ' +
                  'la paire de points utilisée dans la vérification croisée ci-dessus.',
              },
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — nombre dérivé d'une réciproque sans connaître son expression",
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $f(x) = x^3 + x$. Calcule $(f^{-1})'(2)$, sans chercher l'expression de " +
                '$f^{-1}$ (il n\'en existe pas de simple).',
            },
            {
              kind: 'para',
              text:
                "**Hypothèses.** $f'(x) = 3x^2 + 1 > 0$ : $f$ est continue et strictement " +
                'croissante sur l\'intervalle $\\mathbb{R}$, donc injective.',
            },
            {
              kind: 'para',
              text:
                '**Antécédent de 2.** On cherche $a$ tel que $f(a) = 2$ : $a = 1$ convient, car ' +
                '$1^3 + 1 = 2$. Donc $f^{-1}(2) = 1$.',
            },
            {
              kind: 'para',
              text:
                "**Théorème.** $f'(1) = 3 + 1 = 4 \\neq 0$, d'où " +
                "$(f^{-1})'(2) = \\dfrac{1}{f'(f^{-1}(2))} = \\dfrac{1}{f'(1)} = \\dfrac{1}{4}$.",
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'vectorPlane',
                xMin: -1,
                xMax: 3.2667,
                yMin: -1,
                yMax: 3,
                grid: true,
                curves: [
                  { fn: (x) => x * x * x + x, tone: 'accent', xMin: -0.68, xMax: 1.21 },
                  { fn: reciproqueCubePlusX, tone: 'good', xMin: -1, xMax: 3.2667 },
                ],
                vectors: [
                  { from: { x: -1, y: -1 }, to: { x: 3, y: 3 }, tone: 'faint', dashed: true, arrow: false },
                  { from: { x: 0.25, y: -1 }, to: { x: 1.25, y: 3 }, tone: 'accent', dashed: true, arrow: false },
                  { from: { x: -1, y: 0.25 }, to: { x: 3.2667, y: 1.3167 }, tone: 'good', dashed: true, arrow: false },
                ],
                points: [
                  { x: 1, y: 2, label: '(1 ; 2)', tone: 'accent', labelPos: 'left' },
                  { x: 2, y: 1, label: '(2 ; 1)', tone: 'good', labelPos: 'below' },
                ],
                caption:
                  'En orange : $f(x) = x^3 + x$ et sa tangente en $(1 ; 2)$, de pente $4$. En ' +
                  "vert : $f^{-1}$ et sa tangente en $(2 ; 1)$, de pente $\\dfrac{1}{4}$. Le miroir " +
                  "$y = x$ échange les deux tangentes : la pente s'inverse.",
              },
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Remarque — le théorème donne une condition suffisante, pas nécessaire',
          text:
            "Si les hypothèses du théorème ne sont pas vérifiées en un point, cela ne prouve " +
            '**pas** que $f^{-1}$ n\'y est pas dérivable ! Ça veut juste dire que ce théorème ' +
            'ne permet pas de conclure. Exemple : pour $f(x) = \\sqrt[5]{x}$, $f\'(0)$ n\'existe pas (tangente ' +
            "verticale), donc le théorème ne s'applique pas en $x = 0$. Pourtant $f^{-1}(x) = " +
            'x^5$ est parfaitement dérivable en 0, avec $(f^{-1})\'(0) = 5 \\cdot 0^4 = 0$.',
        },
        {
          kind: 'application',
          titre: 'Calculer l\'angle d\'un bras robotisé à partir de sa position',
          image: {
            src: '/images/application/robot-arm.jpg',
            alt: 'Bras robotisés industriels KUKA sur une chaîne de montage',
            caption: 'Bras robotisés industriels KUKA. Photo : Mixabest, CC BY-SA 3.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => Math.sin(x), tone: 'accent', xMin: -PI / 2, xMax: PI / 2 }],
              xMin: -PI / 2 - 0.15,
              xMax: PI / 2 + 0.15,
              xTicks: [-PI / 2, PI / 2],
              xTickLabels: { [-PI / 2]: '-π/2', [PI / 2]: 'π/2' },
              fixedYRange: { min: -1.2, max: 1.2 },
              points: [{ x: 0.8727, y: 0.766, label: '', tone: 'accent' }],
              textLabels: [{ x: -PI / 2 + 0.1, y: -1.05, text: 'direct : θ → position', tone: 'accent', anchor: 'start' }],
              xAxisLabel: 'θ (angle)',
              yAxisLabel: 'position',
              caption:
                "La fonction qui transforme un angle θ en position (sin, restreinte pour être " +
                'bijective) — lire de gauche à droite donne la cinématique **directe** (angle connu ' +
                '→ position calculée) ; lire de droite à gauche, à partir d\'une position ' +
                "cible, donne la cinématique **inverse** — c'est arcsin qui fait cette lecture.",
            },
            {
              kind: 'vectorPlane',
              xMin: -0.3,
              xMax: 1.6,
              yMin: -0.3,
              yMax: 1.6,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 0.9, y: 1.073 }, tone: 'accent' },
                { from: { x: 0.9, y: 1.073 }, to: { x: 0.9, y: 0 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 0.9, y: 1.073 }, to: { x: 0, y: 1.073 }, tone: 'faint', dashed: true, arrow: false },
              ],
              points: [{ x: 0.9, y: 1.073, label: 'pince', tone: 'accent', labelPos: 'above' }],
              angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 50, radiusPx: 26, label: 'θ', tone: 'accent' }],
              caption:
                "Le bras vu de dessus : à partir de l'angle θ de l'articulation, la position " +
                'de la pince se calcule directement (trigonométrie). Mais si c\'est la ' +
                "position qui est imposée, il faut inverser — retrouver θ à partir de la " +
                "hauteur de la pince, exactement le rôle d'arcsin.",
            },
          ],
          text:
            'En robotique, un bras articulé doit souvent atteindre une position précise dans ' +
            "l'espace — attraper un objet, souder un point donné. Calculer la position de la " +
            'pince à partir des angles des articulations est facile (c\'est une fonction ' +
            'directe, de la trigonométrie classique). Mais le problème **inverse** — retrouver ' +
            "les angles qu'il faut donner à chaque articulation pour atteindre une position " +
            'voulue — est exactement le problème de la fonction réciproque : on connaît la ' +
            'sortie, on cherche l\'entrée. Ce calcul, appelé **cinématique inverse**, utilise ' +
            'directement les fonctions réciproques (souvent cyclométriques, comme tu les ' +
            'verras à la section suivante) pour transformer une position 3D cible en angles ' +
            "d'articulation — un calcul refait des dizaines de fois par seconde par le " +
            "logiciel de contrôle d'un robot industriel.",
          domaines: ['Robotique', 'Informatique'],
        },
        {
          kind: 'entrainement',
          title: 'Fonctions injectives / surjectives / bijectives',
          generatorId: '6gen1',
          description: [
            "Détermine le domaine d'une fonction, décide si elle est injective, trouve son " +
              'image, puis retrouve sa réciproque par décomposition ou permutation.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 1. Fonctions injectives / surjectives / bijectives »',
        },
        {
          kind: 'entrainement',
          title: 'Graphe de la réciproque',
          generatorId: '6gen154',
          description: [
            'Sur un quadrillage à la même échelle en x et en y : point (a ; b) → (b ; a), domaine et ' +
              "image échangés (crochets compris), graphe de f⁻¹ symétrique par rapport à y = x, et " +
              'pente de la tangente à f⁻¹, inverse de celle de f.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 154. Graphe de la réciproque »',
        },
        {
          kind: 'entrainement',
          title: "Dérivée d'une réciproque en un point",
          generatorId: '6gen155',
          description: [
            'Sans expression de f⁻¹ (x³ + x, eˣ + x, x + sin x…) : trouve x₀ = f⁻¹(y₀) par une valeur ' +
              "évidente, calcule f′(x₀), décide si le théorème s'applique (f′(x₀) ≠ 0) et conclus " +
              "(f⁻¹)′(y₀) = 1/f′(x₀) — ou une tangente verticale.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 155. Dérivée d'une réciproque en un point »",
        },
      ],
    },
    {
      id: 'cyclometriques',
      number: 2,
      title: 'Les fonctions cyclométriques : arcsin, arccos, arctan',
      titreCourt: 'Fonctions cyclométriques',
      partie: 'Réciproques et arcfonctions',
      essentiel: [
        'arcsin : $[-1 ; 1] \\to [-\\pi/2 ; \\pi/2]$ ; arccos : $[-1 ; 1] \\to [0 ; \\pi]$ ; arctan : $\\mathbb{R} \\to \\; ]-\\pi/2 ; \\pi/2[$. arcsin(x) est l\'**unique** angle de son image dont le sinus vaut x.',
        'arcsin et arctan sont croissantes et impaires ; arccos est décroissante et vérifie $\\arccos(-x) = \\pi - \\arccos(x)$.',
        '$\\sin(\\arcsin x) = x$ toujours, mais $\\arcsin(\\sin \\theta) = \\theta$ seulement si θ est dans l\'image. $\\cos(\\arcsin x) = \\sqrt{1 - x^2}$, jamais négatif.',
      ],
      cartes: [
        { question: 'Que vaut $\\arccos\\left(-\\dfrac{1}{2}\\right)$ ?', reponse: '$\\dfrac{2\\pi}{3}$ : arccos ne donne jamais un angle négatif.' },
        { question: 'Que vaut $\\arcsin\\left(\\sin \\dfrac{5\\pi}{6}\\right)$ ?', reponse: '$\\dfrac{\\pi}{6}$ : même sinus, et $\\dfrac{\\pi}{6}$ est dans $[-\\pi/2 ; \\pi/2]$.' },
        { question: 'Que vaut $\\cos\\left(\\arcsin \\dfrac{3}{5}\\right)$ ?', reponse: '$\\sqrt{1 - \\dfrac{9}{25}} = \\dfrac{4}{5}$.' },
        { question: '$\\arcsin(2)$ existe-t-il ?', reponse: 'Non : $2 \\notin [-1;1]$, hors du domaine.' },
      ],
      blocks: [
        { kind: 'video', title: 'arcsin, arccos, arctan', youtubeId: 'Z6mRx1Lzgoc' },
        { kind: 'subheading', text: 'Restreindre sin, cos et tan pour les inverser' },
        {
          kind: 'para',
          text:
            'sin, cos et tan sont périodiques : elles ne sont donc **jamais injectives** sur ' +
            "$\\mathbb{R}$ tout entier, et n'ont pas de réciproque sur $\\mathbb{R}$. Pour en " +
            'construire une, il faut **restreindre le domaine** à un intervalle où la fonction ' +
            'redevient bijective — le plus court possible, et contenant 0.',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi il faut restreindre le domaine',
          text:
            'sin(0) = 0, mais sin(π) = 0 aussi, et sin(2π) = 0… une infinité de $x$ donnent la ' +
            "même image : sin n'est donc pas injective sur ℝ, et — tu l'as vu en section 1 — " +
            'sans injectivité, pas de réciproque possible. La solution : garder un seul ' +
            '« tour » de la fonction, le plus court possible, sur lequel elle redevient ' +
            'injective (et même bijective, vers son image). Exactement l\'idée de la section 1, ' +
            'appliquée à sin, cos et tan.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.sin, tone: 'faint', xMin: -2 * PI, xMax: 2 * PI },
              { fn: Math.sin, tone: 'accent', xMin: -PI / 2, xMax: PI / 2 },
            ],
            xMin: -2 * PI,
            xMax: 2 * PI,
            xTicks: [-PI / 2, PI / 2],
            xTickLabels: { [-PI / 2]: '-π/2', [PI / 2]: 'π/2' },
            fixedYRange: { min: -1.3, max: 1.3 },
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'sin restreint à [−π/2 ; π/2] (en accent) : bijective de cet intervalle vers [−1 ; 1].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.cos, tone: 'faint', xMin: -2 * PI, xMax: 2 * PI },
              { fn: Math.cos, tone: 'accent', xMin: 0, xMax: PI },
            ],
            xMin: -2 * PI,
            xMax: 2 * PI,
            xTicks: [0, PI],
            xTickLabels: { 0: '0', [PI]: 'π' },
            fixedYRange: { min: -1.3, max: 1.3 },
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'cos restreint à [0 ; π] (en accent) : bijective de cet intervalle vers [−1 ; 1].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.tan, tone: 'faint', xMin: -PI + 0.18, xMax: -PI / 2 - 0.06 },
              { fn: Math.tan, tone: 'accent', xMin: -PI / 2 + 0.06, xMax: PI / 2 - 0.06 },
              { fn: Math.tan, tone: 'faint', xMin: PI / 2 + 0.06, xMax: PI - 0.18 },
            ],
            xMin: -3 * PI,
            xMax: 3 * PI,
            xTicks: [-PI / 2, PI / 2],
            xTickLabels: { [-PI / 2]: '-π/2', [PI / 2]: 'π/2' },
            verticalAsymptotes: [{ x: -PI / 2 }, { x: PI / 2 }],
            fixedYRange: { min: -4, max: 4 },
            xAxisLabel: '',
            yAxisLabel: '',
            caption: 'tan restreint à ]−π/2 ; π/2[ (en accent) : bijective de cet intervalle vers ℝ tout entier.',
          },
        },
        {
          kind: 'para',
          text:
            'La réciproque de chaque restriction porte un nom : « arc » + le nom de la ' +
            'fonction — littéralement « l\'arc dont le sinus/cosinus/la tangente vaut… ».',
        },
        {
          kind: 'featureTable',
          headers: ['Restriction bijective', 'Réciproque : domaine → image'],
          rows: [
            ['sin sur $\\left[-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right]$', 'arcsin : $[-1 ; 1] \\to \\left[-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right]$'],
            ['cos sur $[0 ; \\pi]$', 'arccos : $[-1 ; 1] \\to [0 ; \\pi]$'],
            ['tan sur $\\left]-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right[$', 'arctan : $\\mathbb{R} \\to \\left]-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right[$'],
          ],
        },
        {
          kind: 'historique',
          titre: 'Pourquoi « arcsin » et pas seulement « sin⁻¹ » ?',
          text:
            'Tu as déjà vu, en section 1, à quel point la notation $f^{-1}$ peut prêter à ' +
            'confusion avec $1/f$. C\'est l\'astronome et mathématicien britannique **John ' +
            'Herschel** qui introduit, en 1813, la notation $\\sin^{-1}(x)$ pour désigner la ' +
            'réciproque de sin — en l\'alignant sur la notation générale $f^{-1}$ des ' +
            'fonctions réciproques. Problème : $\\sin^{-1}(x)$ ressemble furieusement à ' +
            '$1/\\sin(x)$, qui est une fonction complètement différente (la cosécante) ! ' +
            'C\'est pour éviter cette ambiguïté que la notation $\\arcsin$, $\\arccos$, ' +
            '$\\arctan$ s\'est peu à peu imposée en parallèle — « arc » rappelle que le ' +
            'résultat est un **angle** (un arc de cercle), pas l\'inverse d\'un nombre. Les deux ' +
            'notations cohabitent encore aujourd\'hui : ta calculatrice affiche sans doute ' +
            '$\\sin^{-1}$, mais $\\arcsin$ reste la notation la plus sûre dès que la ' +
            'confusion est possible.',
          image: {
            src: '/images/historique/herschel.jpg',
            alt: 'Portrait de John Herschel',
            caption: 'John Herschel (1792–1871), photographie par Julia Margaret Cameron, 1867.',
          },
        },
        {
          kind: 'para',
          text:
            'Le tableau se lit aussi géométriquement : chaque arcfonction s\'obtient en ' +
            'réfléchissant le graphe de sa restriction par rapport à la droite $y = x$ — le ' +
            'miroir de la section 1. Colonnes « Domaine » et « Image » comprises, qui ne font ' +
            'qu\'échanger celles de la restriction :',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.sin, tone: 'accent', xMin: -PI / 2, xMax: PI / 2 },
              { fn: Math.asin, tone: 'good', xMin: -1, xMax: 1 },
              { fn: (x) => x, tone: 'faint' },
            ],
            xMin: -2.23,
            xMax: 2.23,
            xTicks: [-PI / 2, -1, 1, PI / 2],
            xTickLabels: { [-PI / 2]: '-π/2', [-1]: '-1', 1: '1', [PI / 2]: 'π/2' },
            points: [
              { x: PI / 2, y: 1, label: '', tone: 'accent' },
              { x: 1, y: PI / 2, label: '', tone: 'good' },
              { x: -PI / 2, y: -1, label: '', tone: 'accent' },
              { x: -1, y: -PI / 2, label: '', tone: 'good' },
            ],
            fixedYRange: { min: -1.75, max: 1.75 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'En orange : la restriction de sin à $[-\\pi/2 ; \\pi/2]$, qui va de cet ' +
              'intervalle vers $[-1 ; 1]$. En vert : sa réciproque arcsin, qui va de ' +
              '$[-1 ; 1]$ vers $[-\\pi/2 ; \\pi/2]$ — domaine et image échangés. Les deux ' +
              'courbes se déduisent l\'une de l\'autre par symétrie autour de la diagonale ' +
              'grise $y = x$ : les points marqués $(\\pi/2 ; 1)$ et $(1 ; \\pi/2)$ se ' +
              'correspondent. Même figure, mutatis mutandis, pour cos/arccos et tan/arctan.',
          },
        },
        {
          kind: 'atelier',
          tag: 'cyclometrique-miroir-widget',
          label: 'Manipule toi-même — le même miroir, appliqué à sin/cos/tan',
          caption:
            'Choisis sin, cos ou tan : le point mobile sur la restriction bijective (en orange) ' +
            'a toujours son symétrique sur l\'arcfonction (en vert), par rapport à y = x — ' +
            'exactement le miroir de la section précédente, appliqué ici aux trois fonctions ' +
            'cyclométriques.',
        },
        { kind: 'subheading', text: "D'où vient le mot « arc » ?" },
        {
          kind: 'para',
          text:
            'Sur le cercle trigonométrique (rayon 1), un angle $y$ se mesure justement par la ' +
            "longueur de l'**arc** de cercle qu'il intercepte à partir de 0. Chaque arcfonction " +
            'répond donc littéralement à la question « quel est l\'arc $y$ dont le ' +
            'sinus/cosinus/la tangente vaut $x$ ? » :',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'unitCircleArc',
              mode: 'sin',
              angle: 0.75,
              caption: "$y = \\arcsin(x)$ : l'arc, mesuré depuis $0$, dont l'ordonnée du point d'arrivée vaut $x$.",
            },
            {
              kind: 'unitCircleArc',
              mode: 'cos',
              angle: 0.75,
              caption: "$y = \\arccos(x)$ : l'arc, mesuré depuis $0$, dont l'abscisse du point d'arrivée vaut $x$.",
            },
            {
              kind: 'unitCircleArc',
              mode: 'tan',
              angle: Math.atan(0.9),
              caption: "$y = \\arctan(x)$ : l'arc dont la tangente géométrique (droite verticale) vaut $x$.",
            },
          ],
        },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ce cercle',
          text:
            'Ce cercle trigonométrique, tu le manipules depuis la 4e/5e : sin(π/6) = 1/2, ' +
            "cos(π/3) = 1/2, etc. Une arcfonction ne fait rien de neuf — elle pose juste la " +
            'même question à l\'envers. Tu savais lire sin(π/6) = 1/2 ; tu sais donc déjà, sans ' +
            'aucun calcul supplémentaire, qu\'arcsin(1/2) = π/6.',
        },
        { kind: 'subheading', text: 'Caractérisation, limites et graphes' },
        {
          kind: 'definition',
          label: 'Caractérisation',
          items: [
            '$\\forall x \\in [-1;1], \\forall y \\in \\mathbb{R} : \\quad y = \\arcsin(x) \\iff x = \\sin(y)$ et $y \\in [-\\pi/2 ; \\pi/2]$',
            '$\\forall x \\in [-1;1], \\forall y \\in \\mathbb{R} : \\quad y = \\arccos(x) \\iff x = \\cos(y)$ et $y \\in [0 ; \\pi]$',
            '$\\forall x, y \\in \\mathbb{R} : \\quad y = \\arctan(x) \\iff x = \\tan(y)$ et $y \\in ]-\\pi/2 ; \\pi/2[$',
          ],
        },
        {
          kind: 'para',
          text:
            "Les bornes de l'image d'arctan se lisent aussi comme deux limites, correspondant " +
            'aux deux asymptotes horizontales du graphe :',
        },
        {
          kind: 'para',
          text: '$\\displaystyle\\lim_{x \\to -\\infty} \\arctan(x) = -\\pi/2 \\qquad \\displaystyle\\lim_{x \\to +\\infty} \\arctan(x) = \\pi/2$',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: Math.asin, tone: 'accent', xMin: -1, xMax: 1 }],
            xMin: -1.3,
            xMax: 1.3,
            xTicks: [-1, 1],
            points: [
              { x: -1, y: -PI / 2, label: '', tone: 'accent' },
              { x: 1, y: PI / 2, label: '', tone: 'accent' },
            ],
            fixedYRange: { min: -1.9, max: 1.9 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: '$y = \\arcsin(x)$ — domaine $[-1 ; 1]$, image $[-\\pi/2 ; \\pi/2]$.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: Math.acos, tone: 'accent', xMin: -1, xMax: 1 }],
            xMin: -1.3,
            xMax: 1.3,
            xTicks: [-1, 1],
            points: [
              { x: -1, y: PI, label: '', tone: 'accent' },
              { x: 1, y: 0, label: '', tone: 'accent' },
            ],
            fixedYRange: { min: -0.3, max: 3.5 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: '$y = \\arccos(x)$ — domaine $[-1 ; 1]$, image $[0 ; \\pi]$.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: Math.atan, tone: 'accent' }],
            xMin: -10,
            xMax: 10,
            xTicks: [-8, -4, 4, 8],
            horizontalAsymptotes: [
              { y: PI / 2, label: 'AH ≡ y = π/2' },
              { y: -PI / 2, label: 'AH ≡ y = −π/2' },
            ],
            fixedYRange: { min: -2.1, max: 2.1 },
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: '$y = \\arctan(x)$ — domaine $\\mathbb{R}$, image $]-\\pi/2 ; \\pi/2[$ (asymptotes en pointillés).',
          },
        },
        {
          kind: 'piege',
          text:
            'arcsin($x$) n\'est **pas** « un » angle dont le sinus vaut $x$ parmi tous les ' +
            'possibles (il y en a une infinité par périodicité) ! C\'est **l\'unique** angle de ' +
            '[−π/2 ; π/2] dont le sinus vaut $x$. Même logique pour arccos et arctan, chacune ' +
            'avec sa propre image.',
        },
        { kind: 'subheading', text: 'Parité et sens de variation' },
        {
          kind: 'para',
          text:
            'Les trois démonstrations qui suivent reposent toutes sur la caractérisation : pour ' +
            'prouver que $y$ **est** $\\arcsin(x)$, il faut vérifier **deux** choses, ' +
            '$\\sin(y) = x$ **et** $y \\in [-\\pi/2 ; \\pi/2]$. Oublier la seconde, c\'est ' +
            'exactement le piège ci-dessus.',
        },
        {
          kind: 'atelier',
          tag: 'arc-de-trig-widget',
          label: 'Manipule toi-même — arcsin(sin θ), arccos(cos θ), arctan(tan θ)',
          caption:
            'Fais tourner θ n\'importe où sur le cercle, de −2π à 2π. Le résultat (en vert) ' +
            'est toujours l\'angle de l\'image de l\'arcfonction qui a le même sinus, le même ' +
            'cosinus ou la même tangente que θ : il ne vaut θ que si θ est déjà dans cette ' +
            'image. Le graphique de droite montre la courbe « en dents de scie » obtenue.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arcsin est impaire',
          blocks: [
            {
              kind: 'para',
              text:
                'Le domaine $[-1 ; 1]$ est symétrique : si $x$ y est, $-x$ aussi. Soit ' +
                '$x \\in [-1 ; 1]$ et $y = \\arcsin(x)$. Par la caractérisation, ' +
                '$\\sin(y) = x$ et $y \\in [-\\pi/2 ; \\pi/2]$.',
            },
            {
              kind: 'para',
              text:
                '**Le sinus.** sin est impaire : $\\sin(-y) = -\\sin(y) = -x$.',
            },
            {
              kind: 'para',
              text:
                "**L'intervalle.** $-\\pi/2 \\le y \\le \\pi/2$ donne, en multipliant par $-1$, " +
                '$-\\pi/2 \\le -y \\le \\pi/2$ : l\'intervalle est symétrique, $-y$ y est aussi.',
            },
            {
              kind: 'para',
              text:
                "**Conclusion.** $-y$ vérifie les deux conditions de la caractérisation pour " +
                '$-x$ : $-y = \\arcsin(-x)$, c\'est-à-dire $\\arcsin(-x) = -\\arcsin(x)$. ' +
                'arcsin est impaire. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arccos(x) + arccos(−x) = π',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $x \\in [-1 ; 1]$ (alors $-x$ y est aussi) et $y = \\arccos(x)$. Par la ' +
                'caractérisation, $\\cos(y) = x$ et $y \\in [0 ; \\pi]$.',
            },
            {
              kind: 'para',
              text:
                '**Le cosinus.** Les angles $y$ et $\\pi - y$ sont supplémentaires : ' +
                '$\\cos(\\pi - y) = -\\cos(y) = -x$.',
            },
            {
              kind: 'para',
              text:
                "**L'intervalle.** $0 \\le y \\le \\pi$ donne $-\\pi \\le -y \\le 0$, puis, en " +
                'ajoutant $\\pi$, $0 \\le \\pi - y \\le \\pi$ : $\\pi - y \\in [0 ; \\pi]$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** $\\pi - y$ vérifie les deux conditions pour $-x$ : ' +
                '$\\pi - y = \\arccos(-x)$, soit $\\arccos(-x) = \\pi - \\arccos(x)$, ' +
                'c\'est-à-dire $\\arccos(x) + \\arccos(-x) = \\pi$. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arctan est impaire',
          blocks: [
            {
              kind: 'para',
              text:
                'Même plan que pour arcsin. Soit $x \\in \\mathbb{R}$ et $y = \\arctan(x)$ : ' +
                '$\\tan(y) = x$ et $y \\in \\; ]-\\pi/2 ; \\pi/2[$.',
            },
            {
              kind: 'para',
              text:
                'tan est impaire : $\\tan(-y) = -\\tan(y) = -x$. Et $-\\pi/2 < y < \\pi/2$ donne ' +
                '$-\\pi/2 < -y < \\pi/2$ : $-y$ est encore dans l\'image de arctan.',
            },
            {
              kind: 'para',
              text:
                "**Conclusion.** $-y = \\arctan(-x)$, soit $\\arctan(-x) = -\\arctan(x)$ : " +
                'arctan est impaire. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'À retenir',
          items: [
            'arcsin et arctan sont strictement croissantes ; arccos est strictement décroissante.',
            'arcsin et arctan sont **impaires** : $\\arcsin(-x) = -\\arcsin(x)$ et $\\arctan(-x) = -\\arctan(x)$.',
            'arccos n\'est **pas** impaire, mais vérifie $\\arccos(-x) = \\pi - \\arccos(x)$ — ' +
              'démontré ci-dessus.',
          ],
        },
        { kind: 'subheading', text: 'Valeurs remarquables, sans calculatrice' },
        {
          kind: 'methode',
          label: 'Méthode — calculer arcsin(a), arccos(a) ou arctan(a)',
          items: [
            "Vérifie que $a$ est dans le domaine : $a \\in [-1 ; 1]$ pour arcsin et arccos. " +
              "Sinon, l'expression n'existe pas.",
            "Cherche sur le cercle trigonométrique un angle dont le sinus (le cosinus, la " +
              'tangente) vaut $a$.',
            "Garde **le seul** de ces angles qui est dans l'image : $[-\\pi/2 ; \\pi/2]$ pour " +
              'arcsin, $[0 ; \\pi]$ pour arccos, $]-\\pi/2 ; \\pi/2[$ pour arctan.',
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Valeurs remarquables de arcsin et arccos',
          headers: ['x', 'arcsin x', 'arccos x'],
          rows: [
            ['$-1$', '$-\\dfrac{\\pi}{2}$', '$\\pi$'],
            ['$-\\dfrac{\\sqrt{3}}{2}$', '$-\\dfrac{\\pi}{3}$', '$\\dfrac{5\\pi}{6}$'],
            ['$-\\dfrac{\\sqrt{2}}{2}$', '$-\\dfrac{\\pi}{4}$', '$\\dfrac{3\\pi}{4}$'],
            ['$-\\dfrac{1}{2}$', '$-\\dfrac{\\pi}{6}$', '$\\dfrac{2\\pi}{3}$'],
            ['$0$', '$0$', '$\\dfrac{\\pi}{2}$'],
            ['$\\dfrac{1}{2}$', '$\\dfrac{\\pi}{6}$', '$\\dfrac{\\pi}{3}$'],
            ['$\\dfrac{\\sqrt{2}}{2}$', '$\\dfrac{\\pi}{4}$', '$\\dfrac{\\pi}{4}$'],
            ['$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{\\pi}{3}$', '$\\dfrac{\\pi}{6}$'],
            ['$1$', '$\\dfrac{\\pi}{2}$', '$0$'],
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Valeurs remarquables de arctan',
          headers: ['x', 'arctan x'],
          rows: [
            ['$-\\sqrt{3}$', '$-\\dfrac{\\pi}{3}$'],
            ['$-1$', '$-\\dfrac{\\pi}{4}$'],
            ['$-\\dfrac{\\sqrt{3}}{3}$', '$-\\dfrac{\\pi}{6}$'],
            ['$0$', '$0$'],
            ['$\\dfrac{\\sqrt{3}}{3}$', '$\\dfrac{\\pi}{6}$'],
            ['$1$', '$\\dfrac{\\pi}{4}$'],
            ['$\\sqrt{3}$', '$\\dfrac{\\pi}{3}$'],
          ],
        },
        {
          kind: 'astuce',
          label: '💡 Deux contrôles rapides',
          text:
            'arccos ne donne **jamais** un angle négatif : $\\arccos\\left(-\\dfrac{1}{2}\\right) = ' +
            '\\dfrac{2\\pi}{3}$, pas $-\\dfrac{\\pi}{3}$. Et chaque ligne du premier tableau vérifie ' +
            '$\\arcsin(x) + \\arccos(x) = \\dfrac{\\pi}{2}$ (section 3).',
          items: ['$\\arcsin(2)$ n\'existe pas : $2 \\notin [-1;1]$ (hors du domaine).'],
        },
        { kind: 'subheading', text: 'Composer une arcfonction et une fonction trigonométrique' },
        {
          kind: 'para',
          text:
            'Une arcfonction « défait » la fonction trigonométrique correspondante… mais pas de ' +
            'la même façon dans les deux sens.',
        },
        {
          kind: 'definition',
          label: 'Les deux compositions',
          items: [
            "**Fonction trigonométrique d'une arcfonction : toujours.** " +
              '$\\sin(\\arcsin x) = x$ et $\\cos(\\arccos x) = x$ pour tout $x \\in [-1 ; 1]$ ; ' +
              '$\\tan(\\arctan x) = x$ pour tout $x \\in \\mathbb{R}$.',
            "**Arcfonction d'une fonction trigonométrique : seulement sur l'image.** " +
              '$\\arcsin(\\sin \\theta) = \\theta \\iff \\theta \\in [-\\pi/2 ; \\pi/2]$ ; ' +
              '$\\arccos(\\cos \\theta) = \\theta \\iff \\theta \\in [0 ; \\pi]$ ; ' +
              '$\\arctan(\\tan \\theta) = \\theta \\iff \\theta \\in \\; ]-\\pi/2 ; \\pi/2[$.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi un seul sens est automatique',
          text:
            "$\\arcsin(x)$ est, par définition, un angle dont le sinus vaut $x$ : en reprenant " +
            'son sinus, tu retrouves forcément $x$. Dans l\'autre sens, arcsin ne sait rendre ' +
            'que des angles de $[-\\pi/2 ; \\pi/2]$ : si $\\theta$ n\'y est pas, ' +
            '$\\arcsin(\\sin \\theta)$ ne peut pas valoir $\\theta$. Il rend l\'angle de ' +
            "l'image qui a **le même sinus** que $\\theta$.",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arcsin(sin θ) = θ exactement quand θ ∈ [−π/2 ; π/2]',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $\\theta$ un réel. $\\sin(\\theta) \\in [-1 ; 1]$, donc ' +
                '$\\arcsin(\\sin \\theta)$ existe toujours. Par la caractérisation, c\'est ' +
                'l\'unique $y \\in [-\\pi/2 ; \\pi/2]$ tel que $\\sin(y) = \\sin(\\theta)$.',
            },
            {
              kind: 'para',
              text:
                '**Si** $\\theta \\in [-\\pi/2 ; \\pi/2]$, $y = \\theta$ convient : il est dans ' +
                "l'intervalle et a le bon sinus. Par unicité, $\\arcsin(\\sin \\theta) = \\theta$.",
            },
            {
              kind: 'para',
              text:
                "**Si** $\\theta \\notin [-\\pi/2 ; \\pi/2]$, $\\arcsin(\\sin \\theta)$, qui est " +
                'toujours dans $[-\\pi/2 ; \\pi/2]$, ne peut pas être égal à $\\theta$. ' +
                'Les deux cas réunis donnent l\'équivalence. Même raisonnement pour arccos ' +
                '(intervalle $[0 ; \\pi]$) et arctan ($]-\\pi/2 ; \\pi/2[$). $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — calculer arcsin(sin θ), arccos(cos θ) ou arctan(tan θ)",
          items: [
            "Si $\\theta$ est dans l'image de l'arcfonction, le résultat est $\\theta$.",
            'Sinon, calcule la valeur trigonométrique de $\\theta$ (cercle, valeurs remarquables).',
            "Cherche l'angle de l'image qui a cette valeur. Outils : " +
              '$\\sin(\\pi - \\theta) = \\sin(\\theta)$, $\\cos(-\\theta) = \\cos(\\theta)$, ' +
              '$\\tan(\\theta - \\pi) = \\tan(\\theta)$, et retirer des tours de $2\\pi$.',
            "Pour un mélange comme $\\arcsin(\\tan \\theta)$, vérifie d'abord l'existence : une " +
              'tangente peut sortir de $[-1 ; 1]$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — ramener l'angle dans l'image",
          blocks: [
            {
              kind: 'para',
              text:
                '**a)** $\\arcsin\\left(\\sin \\dfrac{5\\pi}{6}\\right)$ : $\\dfrac{5\\pi}{6} ' +
                '\\notin [-\\pi/2 ; \\pi/2]$. Or $\\sin \\dfrac{5\\pi}{6} = \\dfrac{1}{2} = ' +
                '\\sin \\dfrac{\\pi}{6}$, et $\\dfrac{\\pi}{6}$ est dans l\'image : le résultat ' +
                'vaut $\\dfrac{\\pi}{6}$.',
            },
            {
              kind: 'para',
              text:
                '**b)** $\\arccos\\left(\\cos\\left(-\\dfrac{\\pi}{3}\\right)\\right)$ : ' +
                '$-\\dfrac{\\pi}{3} \\notin [0 ; \\pi]$. Or $\\cos\\left(-\\dfrac{\\pi}{3}\\right) = ' +
                '\\cos \\dfrac{\\pi}{3} = \\dfrac{1}{2}$ : le résultat vaut $\\dfrac{\\pi}{3}$.',
            },
            {
              kind: 'para',
              text:
                '**c)** $\\arctan\\left(\\tan \\dfrac{3\\pi}{4}\\right)$ : $\\tan \\dfrac{3\\pi}{4} = ' +
                '-1$, et $\\arctan(-1) = -\\dfrac{\\pi}{4}$ (c\'est $\\dfrac{3\\pi}{4} - \\pi$).',
            },
            {
              kind: 'para',
              text:
                '**d)** $\\arcsin\\left(\\tan \\dfrac{\\pi}{3}\\right)$ : $\\tan \\dfrac{\\pi}{3} = ' +
                '\\sqrt{3} \\approx 1{,}73 > 1$. L\'expression **n\'existe pas**.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'circleAngles',
                points: [
                  { angle: (5 * PI) / 6, label: '5π/6', tone: 'bad' },
                  { angle: PI / 6, label: 'π/6', tone: 'good' },
                ],
                connectPoints: true,
                angleArcs: [
                  { from: -PI / 2, to: PI / 2, tone: 'good', radiusPx: 112 },
                  { from: 0, to: (5 * PI) / 6, tone: 'bad', radiusPx: 30, arrow: true },
                  { from: 0, to: PI / 6, tone: 'good', radiusPx: 48, arrow: true },
                ],
                caption:
                  'Les angles $\\dfrac{5\\pi}{6}$ (rouge) et $\\dfrac{\\pi}{6}$ (vert) ont le même ' +
                  'sinus $\\dfrac{1}{2}$ : la corde qui les relie est horizontale. Seul ' +
                  '$\\dfrac{\\pi}{6}$ est sur l\'arc vert $[-\\pi/2 ; \\pi/2]$, l\'image de arcsin : ' +
                  "c'est lui que rend $\\arcsin\\left(\\sin \\dfrac{5\\pi}{6}\\right)$.",
              },
            },
          ],
        },
        {
          kind: 'para',
          text:
            "Reste l'autre famille : une fonction trigonométrique **différente** appliquée à une " +
            'arcfonction, comme $\\cos(\\arcsin x)$. Le calcul se fait sans aucun angle, grâce à ' +
            '$\\cos^2 + \\sin^2 = 1$.',
        },
        {
          kind: 'definition',
          label: "Fonction trigonométrique d'une autre arcfonction",
          items: [
            '$\\cos(\\arcsin x) = \\sqrt{1 - x^2}$ et $\\sin(\\arccos x) = \\sqrt{1 - x^2}$, pour ' +
              '$x \\in [-1 ; 1]$.',
            '$\\tan(\\arcsin x) = \\dfrac{x}{\\sqrt{1 - x^2}}$ pour $x \\in \\; ]-1 ; 1[$, et ' +
              '$\\tan(\\arccos x) = \\dfrac{\\sqrt{1 - x^2}}{x}$ pour $x \\in [-1 ; 1]$, $x \\neq 0$.',
            '$\\cos(\\arctan x) = \\dfrac{1}{\\sqrt{1 + x^2}}$ et ' +
              '$\\sin(\\arctan x) = \\dfrac{x}{\\sqrt{1 + x^2}}$, pour tout $x \\in \\mathbb{R}$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — cos(arcsin x) = √(1 − x²) et sin(arccos x) = √(1 − x²)',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $x \\in [-1 ; 1]$ et $\\theta = \\arcsin(x)$ : $\\sin(\\theta) = x$ et ' +
                '$\\theta \\in [-\\pi/2 ; \\pi/2]$.',
            },
            {
              kind: 'para',
              text:
                '**Le carré.** $\\cos^2(\\theta) = 1 - \\sin^2(\\theta) = 1 - x^2$, donc ' +
                '$\\cos(\\theta) = \\sqrt{1 - x^2}$ ou $\\cos(\\theta) = -\\sqrt{1 - x^2}$.',
            },
            {
              kind: 'para',
              text:
                "**Le signe.** Sur $[-\\pi/2 ; \\pi/2]$ (moitié droite du cercle), le cosinus est " +
                'positif ou nul : $\\cos(\\arcsin x) = \\sqrt{1 - x^2}$.',
            },
            {
              kind: 'para',
              text:
                "**De même** avec $\\theta = \\arccos(x) \\in [0 ; \\pi]$ : $\\sin^2(\\theta) = 1 - x^2$, " +
                'et le sinus est positif ou nul sur $[0 ; \\pi]$ (moitié haute) : ' +
                '$\\sin(\\arccos x) = \\sqrt{1 - x^2}$.',
            },
            {
              kind: 'para',
              text:
                '**Les tangentes** en découlent par $\\tan = \\dfrac{\\sin}{\\cos}$, là où le ' +
                'dénominateur ne s\'annule pas : $\\tan(\\arcsin x) = \\dfrac{x}{\\sqrt{1 - x^2}}$ ' +
                '($x \\neq \\pm 1$) et $\\tan(\\arccos x) = \\dfrac{\\sqrt{1 - x^2}}{x}$ ' +
                '($x \\neq 0$). $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — cos(arctan x) = 1/√(1 + x²)',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $x \\in \\mathbb{R}$ et $\\theta = \\arctan(x)$ : $\\tan(\\theta) = x$ et ' +
                '$\\theta \\in \\; ]-\\pi/2 ; \\pi/2[$.',
            },
            {
              kind: 'para',
              text:
                '**Le carré.** En divisant $\\cos^2 + \\sin^2 = 1$ par $\\cos^2(\\theta)$, qui ' +
                'n\'est pas nul : $1 + \\tan^2(\\theta) = \\dfrac{1}{\\cos^2(\\theta)}$, d\'où ' +
                '$\\cos^2(\\theta) = \\dfrac{1}{1 + x^2}$.',
            },
            {
              kind: 'para',
              text:
                "**Le signe.** Sur $]-\\pi/2 ; \\pi/2[$, le cosinus est strictement positif : " +
                '$\\cos(\\arctan x) = \\dfrac{1}{\\sqrt{1 + x^2}}$.',
            },
            {
              kind: 'para',
              text:
                '**Le sinus** suit : $\\sin(\\theta) = \\tan(\\theta) \\cdot \\cos(\\theta) = ' +
                '\\dfrac{x}{\\sqrt{1 + x^2}}$. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            '$\\cos(\\arcsin x)$ vaut $\\sqrt{1 - x^2}$, **jamais** $-\\sqrt{1 - x^2}$, même ' +
            'quand $x$ est négatif : le signe ne dépend pas de $x$, mais de l\'image de ' +
            'l\'arcfonction (ici $[-\\pi/2 ; \\pi/2]$, où le cosinus est positif).',
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — fonction trigonométrique d'une arcfonction",
          blocks: [
            {
              kind: 'para',
              text:
                '**a)** $\\cos\\left(\\arcsin \\dfrac{3}{5}\\right) = \\sqrt{1 - \\dfrac{9}{25}} = ' +
                '\\sqrt{\\dfrac{16}{25}} = \\dfrac{4}{5}$.',
            },
            {
              kind: 'para',
              text:
                '**b)** $\\tan\\left(\\arccos\\left(-\\dfrac{1}{2}\\right)\\right) = ' +
                '\\dfrac{\\sqrt{1 - \\frac{1}{4}}}{-\\frac{1}{2}} = ' +
                '\\dfrac{\\frac{\\sqrt{3}}{2}}{-\\frac{1}{2}} = -\\sqrt{3}$. Contrôle : ' +
                '$\\arccos\\left(-\\dfrac{1}{2}\\right) = \\dfrac{2\\pi}{3}$ et ' +
                '$\\tan \\dfrac{2\\pi}{3} = -\\sqrt{3}$ ✓.',
            },
            {
              kind: 'para',
              text:
                '**c)** $\\sin(\\arctan 2) = \\dfrac{2}{\\sqrt{1 + 4}} = \\dfrac{2}{\\sqrt{5}} = ' +
                '\\dfrac{2\\sqrt{5}}{5}$.',
            },
            {
              kind: 'para',
              text:
                '**d)** Avec une variable : $\\cos(\\arcsin 3x) = \\sqrt{1 - (3x)^2} = ' +
                '\\sqrt{1 - 9x^2}$, pour $3x \\in [-1 ; 1]$, soit ' +
                '$x \\in \\left[-\\dfrac{1}{3} ; \\dfrac{1}{3}\\right]$. C\'est $3x$ tout entier ' +
                'qui est mis au carré.',
            },
          ],
        },
        {
          kind: 'application',
          titre: "Calculer l'angle de réfraction de la lumière",
          image: {
            src: '/images/application/refraction-pencil.jpg',
            alt: "Un crayon plongé dans un verre d'eau paraissant cassé à cause de la réfraction",
            caption: "Un crayon dans un verre d'eau : la réfraction à la surface le fait paraître cassé. Photo : Snehit Jamre, CC BY-SA 4.0, via Wikimedia Commons.",
          },
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -1.4,
              xMax: 1.4,
              yMin: -1.3,
              yMax: 1.3,
              vectors: [
                { from: { x: -0.836, y: 0.996 }, to: { x: 0, y: 0 }, tone: 'accent' },
                { from: { x: 0, y: 0 }, to: { x: 0.532, y: -0.962 }, tone: 'good' },
                { from: { x: 0, y: -1.2 }, to: { x: 0, y: 1.2 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: -1.3, y: 0 }, to: { x: 1.3, y: 0 }, tone: 'ink', arrow: false },
              ],
              angleArcs: [
                { cx: 0, cy: 0, fromDeg: 90, toDeg: 130, radiusPx: 26, label: 'θ₁', tone: 'accent' },
                { cx: 0, cy: 0, fromDeg: 270, toDeg: 298.93, radiusPx: 22, label: 'θ₂', tone: 'good' },
              ],
              points: [
                { x: -1.05, y: 0.55, label: 'air', tone: 'ink', node: false },
                { x: -1.05, y: -0.5, label: 'eau', tone: 'ink', node: false },
              ],
              caption:
                "Le rayon incident (orange, angle $\\theta_1 = 40^\\circ$ par rapport à la normale pointillée) " +
                'se rapproche de la normale en entrant dans l\'eau — le rayon réfracté (vert) ' +
                'fait un angle $\\theta_2$ plus petit, exactement ce que calcule la formule ci-dessous.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => (Math.asin(Math.sin((x * PI) / 180) / 1.33) * 180) / PI, tone: 'good' }],
              xMin: 0,
              xMax: 90,
              xTicks: [30, 60, 90],
              yTicks: [30, 60],
              fixedYRange: { min: 0, max: 70 },
              points: [{ x: 40, y: 28.93, label: '', tone: 'accent' }],
              textLabels: [{ x: 45, y: 12, text: 'θ₁=40° → θ₂≈28,9°', tone: 'accent', anchor: 'start' }],
              xAxisLabel: 'θ₁ (air)',
              yAxisLabel: 'θ₂ (eau)',
              caption:
                '$\\theta_2$ en fonction de $\\theta_1$ pour un passage air → eau ($n_1 = 1$ ; $n_2 = 1{,}33$) : ' +
                '$\\theta_2 = \\arcsin\\left(\\dfrac{\\sin(\\theta_1)}{1{,}33}\\right)$. Le rayon ' +
                'réfracté fait un angle plus petit que le rayon incident, sauf en incidence ' +
                'normale ($\\theta_1 = 0$ : le rayon n\'est pas dévié).',
            },
          ],
          text:
            "Quand un rayon de lumière passe d'un milieu à un autre — de l'air à l'eau, par " +
            "exemple — il change de direction : c'est la **réfraction**. La loi de " +
            'Snell-Descartes relie les deux angles (par rapport à la normale) et les indices ' +
            'de réfraction des deux milieux : $n_1\\sin(\\theta_1) = n_2\\sin(\\theta_2)$. ' +
            'Pour calculer directement l\'angle de réfraction $\\theta_2$ à partir de ' +
            "l'angle d'incidence $\\theta_1$, il faut **isoler** $\\theta_2$ — et donc appliquer " +
            'arcsin aux deux membres : $\\theta_2 = \\arcsin\\left(\\dfrac{n_1\\sin(\\theta_1)}' +
            '{n_2}\\right)$. C\'est exactement arcsin qui permet aux opticiens et aux ' +
            'fabricants de lentilles de calculer la trajectoire précise d\'un rayon lumineux ' +
            'à travers un système optique. Dans l\'autre sens, de l\'eau vers l\'air ' +
            '($n_1 = 1{,}33$ ; $n_2 = 1$), l\'argument $1{,}33\\sin(\\theta_1)$ dépasse $1$ dès que ' +
            '$\\theta_1 > \\arcsin\\left(\\dfrac{1}{1{,}33}\\right) \\approx 48{,}8^\\circ$ : arcsin ' +
            'n\'existe plus, il n\'y a **pas de rayon réfracté**. C\'est la réflexion totale — la ' +
            'condition d\'existence de arcsin, vue comme un phénomène physique.',
          domaines: ['Physique', 'Optique'],
        },
        {
          kind: 'atelier',
          tag: 'refraction-widget',
          label: 'Manipule toi-même — réfraction et angle limite',
          caption:
            'Choisis les deux milieux et fais varier l\'angle d\'incidence θ₁. L\'angle ' +
            'réfracté θ₂ se calcule avec arcsin, qui n\'existe que si n₁ sin θ₁ / n₂ ne ' +
            'dépasse pas 1. Fais passer la lumière du verre vers l\'air : au-delà de l\'angle ' +
            'limite, il n\'y a plus de rayon réfracté, c\'est la réflexion totale.',
        },
        {
          kind: 'entrainement',
          title: 'arcsin, arccos, arctan',
          generatorId: '6gen2',
          description: [
            "Décide si une expression avec arcsin, arccos ou arctan existe — seule ou composée " +
              'avec sin, cos, tan — puis donne sa valeur exacte, sans calculatrice.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 2. arcsin, arccos, arctan »',
        },
        {
          kind: 'entrainement',
          title: 'Identités trig∘arc et arc∘trig',
          generatorId: '6gen153',
          description: [
            "Décide si l'angle est dans l'image de l'arcfonction, puis ramène arcsin(sin θ), " +
              'arccos(cos θ) ou arctan(tan θ) dans l\'image ; calcule cos(arcsin a), tan(arccos a), ' +
              "sin(arctan a)… avec le bon signe, et simplifie cos(arcsin(kx)) en √(1 − k²x²).",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 153. Identités trig∘arc et arc∘trig »',
        },
        {
          kind: 'entrainement',
          title: 'Restreindre pour inverser',
          generatorId: '6gen159',
          description: [
            'Restreins un trinôme, sin, cos ou tan au plus grand intervalle monotone contenant un point donné, ' +
              'puis exprime la réciproque (π − arcsin x, 2π − arccos x, arctan x + π…).',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 159. Restreindre pour inverser »',
        },
      ],
    },
    {
      id: 'equations',
      number: 3,
      title: 'Équations avec fonctions cyclométriques',
      titreCourt: 'Équations avec arcfonctions',
      partie: 'Équations et dérivées',
      essentiel: [
        'D\'abord la condition d\'existence : arcsin(u) et arccos(u) exigent $u \\in [-1;1]$ ; arctan(u) n\'impose aucune CE.',
        'Même arcfonction des deux côtés : $\\arcsin(A) = \\arcsin(B) \\iff A = B$, puis on rejette les solutions hors CE. Arcfonction égale à un angle α : α doit être dans l\'image, puis $u = \\sin(\\alpha)$.',
        'Deux arcfonctions différentes : une fonction trigonométrique des deux côtés, puis le tri des candidats (solutions parasites). Identité utile : $\\arcsin(u) + \\arccos(u) = \\pi/2$.',
      ],
      cartes: [
        { question: '$\\arccos(x^2 - 1) = \\arccos(1 - x)$ donne $x = 1$ ou $x = -2$ : que garder ?', reponse: 'Seulement $x = 1$ : la CE est $[0 ; \\sqrt{2}]$, et $\\arccos(3)$ n\'existe pas.' },
        { question: 'Résous $\\arctan(3x + 1) = \\dfrac{\\pi}{2}$.', reponse: '$S = \\varnothing$ : l\'image de arctan est l\'intervalle ouvert $]-\\pi/2 ; \\pi/2[$.' },
        { question: 'Résous $\\arccos(2x - 1) = \\dfrac{2\\pi}{3}$.', reponse: '$2x - 1 = \\cos \\dfrac{2\\pi}{3} = -\\dfrac{1}{2}$, donc $x = \\dfrac{1}{4}$.' },
        { question: 'Résous $\\arccos(x + 1) = -\\dfrac{\\pi}{4}$.', reponse: '$S = \\varnothing$, sans calcul : arccos ne prend jamais de valeur négative.' },
      ],
      blocks: [
        { kind: 'video', title: 'Équations avec fonctions cyclométriques', youtubeId: 'xt5WElsrQ5A' },
        { kind: 'subheading', text: "La condition d'existence d'abord" },
        {
          kind: 'methode',
          label: "Condition d'existence",
          items: [
            'arcsin($u$) et arccos($u$) n\'existent que si $u \\in [-1;1]$.',
            'arctan($u$) existe pour tout $u \\in \\mathbb{R}$ — **aucune CE** à poser.',
          ],
        },
        { kind: 'subheading', text: 'La même arcfonction des deux côtés' },
        {
          kind: 'para',
          text:
            'arcsin, arccos et arctan sont injectives sur leur domaine : deux images égales ' +
            'entraînent que les arguments eux-mêmes sont égaux.',
        },
        { kind: 'para', text: '$\\arcsin(A) = \\arcsin(B) \\iff A = B \\quad$ (si $A$, $B$ respectent la CE)' },
        { kind: 'para', text: '$\\arccos(A) = \\arccos(B) \\iff A = B \\quad$ (si $A$, $B$ respectent la CE)' },
        { kind: 'para', text: '$\\arctan(A) = \\arctan(B) \\iff A = B \\quad$ (sans aucune CE)' },
        {
          kind: 'para',
          text:
            'La justification tient en une ligne, et elle explique pourquoi la CE n\'est pas ' +
            'négociable : si $\\arcsin(A) = \\arcsin(B)$, applique sin aux deux membres. ' +
            'Comme $\\sin(\\arcsin(u)) = u$ pour tout $u$ de $[-1;1]$ — et **seulement** pour ' +
            'ceux-là — tu obtiens $A = B$. La réciproque est immédiate : deux quantités égales ' +
            'ont la même image. Hors CE, $\\arcsin(A)$ n\'existe même pas : l\'équivalence ' +
            'perd tout son sens.',
        },
        {
          kind: 'para',
          text: 'Identité utile, qui relie les deux fonctions (angles complémentaires d\'un triangle rectangle) :',
        },
        { kind: 'para', text: '$\\arcsin(u) + \\arccos(u) = \\pi/2 \\quad \\forall u \\in [-1;1]$' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arcsin(u) + arccos(u) = π/2',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $u \\in [-1 ; 1]$ et $y = \\arccos(u)$. Par la caractérisation (section 2), ' +
                '$\\cos(y) = u$ et $y \\in [0 ; \\pi]$.',
            },
            {
              kind: 'para',
              text:
                "**Le sinus.** Les angles $y$ et $\\pi/2 - y$ sont complémentaires : " +
                '$\\sin(\\pi/2 - y) = \\cos(y) = u$.',
            },
            {
              kind: 'para',
              text:
                "**L'intervalle.** $0 \\le y \\le \\pi$ donne $-\\pi \\le -y \\le 0$, puis, en " +
                'ajoutant $\\pi/2$, $-\\pi/2 \\le \\pi/2 - y \\le \\pi/2$ : ' +
                '$\\pi/2 - y \\in [-\\pi/2 ; \\pi/2]$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** $\\pi/2 - y$ vérifie les deux conditions de la caractérisation de ' +
                '$\\arcsin(u)$ : $\\pi/2 - y = \\arcsin(u)$, soit ' +
                '$\\arcsin(u) + \\arccos(u) = \\pi/2$. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode en 3 temps — la même arcfonction des deux côtés',
          items: [
            "1) Pose la CE de chaque arcfonction. 2) Résous l'équation « simplifiée » " +
              "obtenue en enlevant les arcfonctions. 3) Vérifie que la solution trouvée " +
              'appartient bien à la CE — sinon, rejette-la.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — la même arcfonction des deux côtés',
          blocks: [
            { kind: 'para', text: '$\\arcsin(2x-1) = \\arcsin(x)$' },
            { kind: 'para', text: 'CE : $2x - 1 \\in [-1;1]$ et $x \\in [-1;1]$, soit $x \\in [0;1]$.' },
            { kind: 'para', text: 'Injectivité de arcsin : $2x - 1 = x \\implies x = 1$.' },
            { kind: 'para', text: 'Vérification : $1 \\in [0;1]$ ✓ — solution acceptée : $x = 1$.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — quand la CE rejette une solution',
          blocks: [
            {
              kind: 'para',
              text:
                'L\'étape 3 de la méthode n\'est pas une formalité ! Il arrive qu\'une solution ' +
                'parfaitement correcte de l\'équation simplifiée doive être **rejetée**. En ' +
                'voici un exemple.',
            },
            { kind: 'para', text: '$\\arccos(x^2 - 1) = \\arccos(1 - x)$' },
            {
              kind: 'para',
              text:
                '**Étape 1 — la CE.** Il faut que les deux arguments vivent dans $[-1;1]$. ' +
                'D\'une part $-1 \\le x^2 - 1 \\le 1$, soit $0 \\le x^2 \\le 2$ : la première ' +
                'inégalité est toujours vraie, la seconde donne ' +
                '$x \\in [-\\sqrt{2} ; \\sqrt{2}]$. D\'autre part $-1 \\le 1 - x \\le 1$, soit ' +
                '$0 \\le x \\le 2$. En intersectant : CE $\\equiv x \\in [0 ; \\sqrt{2}]$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — l\'équation simplifiée.** Par injectivité de arccos, ' +
                '$x^2 - 1 = 1 - x$, soit $x^2 + x - 2 = 0$. Le discriminant vaut ' +
                '$1 + 8 = 9$, d\'où $x = \\dfrac{-1 \\pm 3}{2}$ : deux candidats, $x = 1$ et $x = -2$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — confrontation à la CE.** $1 \\in [0 ; \\sqrt{2}]$ ✓ : la solution ' +
                'est acceptée. Mais $-2 \\notin [0 ; \\sqrt{2}]$ ✗ : elle est rejetée. Et pour ' +
                'cause — en $x = -2$, l\'argument de gauche vaut ' +
                '$(-2)^2 - 1 = 3$, et $\\arccos(3)$ n\'existe tout simplement pas.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'domainLine',
                min: -2.6,
                max: 2.2,
                segments: [{ from: 0, to: Math.SQRT2 }],
                points: [
                  { value: -2, closed: true, label: '−2', tone: 'bad', sublabel: 'rejeté' },
                  { value: 1, closed: true, label: '1', tone: 'good', sublabel: 'accepté' },
                ],
                extraTicks: [
                  { value: 0, label: '0' },
                  { value: Math.SQRT2, label: '√2' },
                ],
                axisLabel: 'CE : x ∈ [0 ; √2]',
                caption:
                  'Le trait vert porte la condition d\'existence. Des deux candidats fournis ' +
                  'par l\'équation simplifiée, seul $x = 1$ y tombe ; $x = -2$, pourtant racine ' +
                  'exacte de $x^2 + x - 2 = 0$, est hors CE et disparaît.',
              },
            },
            { kind: 'para', text: "Solution finale : $S = \\{1\\}$." },
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — avec arctan, aucune condition d'existence",
          blocks: [
            { kind: 'para', text: '$\\arctan(x^2 - 2) = \\arctan(x)$' },
            {
              kind: 'para',
              text:
                'arctan est définie sur $\\mathbb{R}$ : pas de CE. Par injectivité, ' +
                '$x^2 - 2 = x$, soit $x^2 - x - 2 = (x-2)(x+1) = 0$.',
            },
            {
              kind: 'para',
              text:
                'Les deux racines sont acceptées telles quelles : $S = \\{-1 ; 2\\}$. Attention, ' +
                "l'absence de CE ne garantit pas de solution : $\\arctan(x^2 + 1) = \\arctan(x)$ " +
                'mène à $x^2 - x + 1 = 0$, de discriminant $-3$, donc $S = \\varnothing$.',
            },
          ],
        },
        { kind: 'subheading', text: 'Une arcfonction égale à un angle' },
        {
          kind: 'methode',
          label: 'Méthode — résoudre arcsin(u) = α (de même avec arccos et arctan)',
          items: [
            "Vérifie que l'angle $\\alpha$ est dans l'**image** de l'arcfonction : " +
              '$[-\\pi/2 ; \\pi/2]$ pour arcsin, $[0 ; \\pi]$ pour arccos, $]-\\pi/2 ; \\pi/2[$ ' +
              "pour arctan. Sinon, l'équation n'a **aucune solution**.",
            'Si oui, applique la fonction trigonométrique : $\\arcsin(u) = \\alpha \\iff ' +
              'u = \\sin(\\alpha)$ (caractérisation, section 2).',
            "Résous $u = \\sin(\\alpha)$. Aucune CE à vérifier en plus : $\\sin(\\alpha)$ est " +
              'forcément dans $[-1 ; 1]$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — une arcfonction égale à un angle',
          blocks: [
            {
              kind: 'para',
              text:
                '**a)** $\\arccos(2x - 1) = \\dfrac{2\\pi}{3}$ : $\\dfrac{2\\pi}{3} \\in [0 ; \\pi]$ ✓. ' +
                'Donc $2x - 1 = \\cos \\dfrac{2\\pi}{3} = -\\dfrac{1}{2}$, soit $x = \\dfrac{1}{4}$ : ' +
                '$S = \\left\\{\\dfrac{1}{4}\\right\\}$.',
            },
            {
              kind: 'para',
              text:
                '**b)** $\\arcsin(x^2 - 1) = -\\dfrac{\\pi}{6}$ : $-\\dfrac{\\pi}{6} \\in ' +
                '[-\\pi/2 ; \\pi/2]$ ✓. Donc $x^2 - 1 = \\sin\\left(-\\dfrac{\\pi}{6}\\right) = ' +
                '-\\dfrac{1}{2}$, soit $x^2 = \\dfrac{1}{2}$ : ' +
                '$S = \\left\\{-\\dfrac{\\sqrt{2}}{2} ; \\dfrac{\\sqrt{2}}{2}\\right\\}$.',
            },
            {
              kind: 'para',
              text:
                '**c)** $\\arctan(3x + 1) = \\dfrac{\\pi}{2}$ : l\'image de arctan est ' +
                "l'intervalle **ouvert** $]-\\pi/2 ; \\pi/2[$, la valeur $\\dfrac{\\pi}{2}$ n'est " +
                'jamais atteinte : $S = \\varnothing$.',
            },
            {
              kind: 'para',
              text:
                '**d)** $\\arccos(x + 1) = -\\dfrac{\\pi}{4}$ : arccos ne prend jamais de valeur ' +
                'négative : $S = \\varnothing$, sans aucun calcul.',
            },
          ],
        },
        { kind: 'subheading', text: 'Deux arcfonctions différentes' },
        {
          kind: 'intuition',
          label: "Pourquoi on ne peut plus « enlever » les arcfonctions",
          text:
            '$\\arcsin\\left(\\dfrac{1}{2}\\right) = \\dfrac{\\pi}{6}$ et ' +
            '$\\arccos\\left(\\dfrac{\\sqrt{3}}{2}\\right) = \\dfrac{\\pi}{6}$ : les deux membres ' +
            'sont égaux, et pourtant $\\dfrac{1}{2} \\neq \\dfrac{\\sqrt{3}}{2}$. L\'injectivité ' +
            'ne sert que pour **la même** arcfonction des deux côtés. Avec deux arcfonctions ' +
            'différentes, on applique une fonction trigonométrique aux deux membres, puis les ' +
            'identités de la section 2.',
        },
        {
          kind: 'methode',
          label: 'Méthode — arcsin(A) = arccos(B), et les autres mélanges',
          items: [
            '**CE** : $A$ et $B$ dans $[-1 ; 1]$ (rien pour un argument de arctan).',
            "**Compatibilité des images** : la valeur commune $\\theta$ est dans les deux images. " +
              'Pour arcsin et arccos, $\\theta \\in [0 ; \\pi/2]$, donc $A = \\sin\\theta \\ge 0$ ' +
              'et $B = \\cos\\theta \\ge 0$.',
            "**Une fonction trigonométrique des deux côtés** : $\\cos(\\arcsin A) = B$, soit " +
              '$\\sqrt{1 - A^2} = B$, puis, au carré, $1 - A^2 = B^2$.',
            '**Tri des candidats** : les solutions obtenues ne sont que des candidates. Garde ' +
              'celles qui respectent la CE **et** la compatibilité ; les autres sont des ' +
              'solutions parasites.',
          ],
        },
        {
          kind: 'attention',
          label: 'Quand appliquer sin ou cos est-il une équivalence ?',
          text:
            'Seulement si cette fonction est injective sur un intervalle qui contient les deux ' +
            'membres. sin est injective sur $[-\\pi/2 ; \\pi/2]$, qui contient arcsin et arctan : ' +
            '$\\arctan(A) = \\arcsin(B) \\iff \\sin(\\arctan A) = B$. Pour arcsin et arccos, ' +
            "aucune des deux fonctions n'est injective sur un intervalle contenant les deux " +
            'images : appliquer cos, puis élever au carré, peut **ajouter** des solutions.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — arcsin et arccos : une solution parasite',
          blocks: [
            { kind: 'para', text: '$\\arcsin(4x) = \\arccos(3x)$' },
            {
              kind: 'para',
              text:
                '**CE.** $4x \\in [-1 ; 1]$ donne $x \\in \\left[-\\dfrac{1}{4} ; \\dfrac{1}{4}\\right]$, ' +
                'et $3x \\in [-1 ; 1]$ donne $x \\in \\left[-\\dfrac{1}{3} ; \\dfrac{1}{3}\\right]$ : ' +
                'CE $\\equiv x \\in \\left[-\\dfrac{1}{4} ; \\dfrac{1}{4}\\right]$.',
            },
            {
              kind: 'para',
              text:
                '**Compatibilité.** La valeur commune est dans $[0 ; \\pi/2]$ : $4x \\ge 0$ et ' +
                '$3x \\ge 0$, soit $x \\ge 0$.',
            },
            {
              kind: 'para',
              text:
                '**Cosinus des deux membres.** $\\cos(\\arcsin 4x) = 3x$ donne ' +
                '$\\sqrt{1 - 16x^2} = 3x$ ; au carré, $1 - 16x^2 = 9x^2$, soit ' +
                '$x^2 = \\dfrac{1}{25}$ : deux candidats, $x = \\dfrac{1}{5}$ et $x = -\\dfrac{1}{5}$.',
            },
            {
              kind: 'para',
              text:
                '**Tri.** Les deux candidats sont dans la CE. Mais $-\\dfrac{1}{5} < 0$ : en ' +
                '$x = -\\dfrac{1}{5}$, $\\arcsin\\left(-\\dfrac{4}{5}\\right)$ est négatif alors que ' +
                '$\\arccos\\left(-\\dfrac{3}{5}\\right)$ dépasse $\\dfrac{\\pi}{2}$ — candidat ' +
                'parasite, créé par la mise au carré. Reste $S = \\left\\{\\dfrac{1}{5}\\right\\}$, ' +
                'et en effet $\\arcsin\\left(\\dfrac{4}{5}\\right) = \\arccos\\left(\\dfrac{3}{5}\\right) ' +
                '\\approx 0{,}927$.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'domainLine',
                min: -0.36,
                max: 0.36,
                segments: [{ from: 0, to: 0.25 }],
                points: [
                  { value: -0.2, closed: true, label: '−1/5', tone: 'bad', sublabel: 'rejeté' },
                  { value: 0.2, closed: true, label: '1/5', tone: 'good', sublabel: 'accepté' },
                ],
                extraTicks: [{ value: 0, label: '0' }],
                axisLabel: 'CE et compatibilité : x ∈ [0 ; 1/4]',
                caption:
                  'La CE est $\\left[-\\dfrac{1}{4} ; \\dfrac{1}{4}\\right]$ ; la compatibilité des ' +
                  "images ne garde que sa moitié positive (trait vert). $x = -\\dfrac{1}{5}$ est " +
                  'dans la CE, mais pas dans le trait vert : il est rejeté.',
              },
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — arctan et arcsin : appliquer sin sans perdre de solution',
          blocks: [
            { kind: 'para', text: '$\\arctan(x) = \\arcsin\\left(\\dfrac{x}{\\sqrt{2}}\\right)$' },
            {
              kind: 'para',
              text:
                '**CE.** $\\dfrac{x}{\\sqrt{2}} \\in [-1 ; 1]$, soit $x \\in [-\\sqrt{2} ; \\sqrt{2}]$. ' +
                'Les deux membres sont dans $[-\\pi/2 ; \\pi/2]$, où sin est injective : appliquer ' +
                'sin est une équivalence.',
            },
            {
              kind: 'para',
              text:
                '**Sinus des deux membres.** $\\sin(\\arctan x) = \\dfrac{x}{\\sqrt{2}}$, soit ' +
                '$\\dfrac{x}{\\sqrt{1 + x^2}} = \\dfrac{x}{\\sqrt{2}}$ : $x = 0$, ou ' +
                '$\\sqrt{1 + x^2} = \\sqrt{2}$, c\'est-à-dire $x^2 = 1$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** $S = \\{-1 ; 0 ; 1\\}$, les trois dans la CE. Contrôle : ' +
                '$\\arctan(1) = \\dfrac{\\pi}{4} = \\arcsin\\left(\\dfrac{\\sqrt{2}}{2}\\right)$ ✓.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'equation-ce-widget',
          label: 'Manipule toi-même — équation et condition d\'existence',
          caption:
            'Chaque membre n\'est tracé que là où il existe : les bandes sous le graphique ' +
            'montrent la CE de chaque membre, la bande verte leur partie commune. Les ' +
            'candidats de l\'équation simplifiée sont acceptés s\'ils tombent dans la CE, ' +
            'rejetés sinon. Fais glisser x sur un candidat rejeté : au moins un des deux ' +
            'membres n\'existe plus.',
        },
        {
          kind: 'entrainement',
          title: 'Équations avec fonctions cyclométriques',
          generatorId: '6gen3',
          description: [
            'Résous des équations avec arcsin, arccos et arctan — même arcfonction des deux ' +
              'côtés, arcfonction égale à un angle, arcfonctions différentes — en posant la ' +
              'condition d\'existence puis en triant les candidats.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 3. Équations avec fonctions cyclométriques »',
        },
      ],
    },
    {
      id: 'derivees',
      number: 4,
      title: 'Dérivées des fonctions cyclométriques',
      titreCourt: 'Dérivées des arcfonctions',
      partie: 'Équations et dérivées',
      essentiel: [
        '$(\\arcsin u)\' = \\dfrac{u\'}{\\sqrt{1-u^2}}$, $(\\arccos u)\' = -\\dfrac{u\'}{\\sqrt{1-u^2}}$ et $(\\arctan u)\' = \\dfrac{u\'}{1+u^2}$.',
        'Pour arcsin et arccos, valable seulement si $u(x) \\in \\; ]-1 ; 1[$ ; pour arctan, sur $\\mathbb{R}$. N\'oublie ni le facteur u′ ni le signe moins de arccos : c\'est u tout entier qui est mis au carré.',
        'Une dérivée nulle sur un intervalle donne une fonction constante : $\\arctan(x) + \\arctan\\left(\\dfrac{1}{x}\\right) = \\dfrac{\\pi}{2}$ pour $x > 0$.',
      ],
      cartes: [
        { question: 'Dérive $\\arctan(3x)$.', reponse: '$\\dfrac{3}{1 + 9x^2}$, et non $\\dfrac{3}{1 + 3x^2}$.' },
        { question: 'Dérive $\\arccos(x^2)$.', reponse: '$-\\dfrac{2x}{\\sqrt{1 - x^4}}$, pour $x \\in \\; ]-1 ; 1[$.' },
        { question: 'D\'où vient le signe moins de la dérivée de arccos ?', reponse: 'De la dérivée de cos, qui vaut −sin : arccos est décroissante.' },
        { question: 'arcsin est-elle dérivable en 1 ?', reponse: 'Non : dériver $\\sin(\\arcsin x) = x$ en 1 donnerait $0 \\cdot \\arcsin\'(1) = 1$, absurde.' },
      ],
      blocks: [
        { kind: 'video', title: 'Dérivées des fonctions cyclométriques', youtubeId: 'UvcxAUJF9d0' },
        { kind: 'subheading', text: 'Les trois formules' },
        { kind: 'para', text: 'Pour $u = u(x)$ une fonction dérivable :' },
        {
          kind: 'featureTable',
          headers: ['Fonction', 'Dérivée'],
          rows: [
            ['arcsin($u$)', "$\\dfrac{u'}{\\sqrt{1-u^2}}$"],
            ['arccos($u$)', "$-\\dfrac{u'}{\\sqrt{1-u^2}}$"],
            ['arctan($u$)', "$\\dfrac{u'}{1+u^2}$"],
          ],
        },
        {
          kind: 'para',
          text:
            'Pour arcsin et arccos, la formule n\'est valable que là où $u(x) \\in \\; ]-1 ; 1[$ : ' +
            'en $u = \\pm 1$, le dénominateur s\'annule (et arcsin n\'y est pas dérivable, ' +
            'démontré plus bas). Pour arctan, aucune restriction.',
        },
        {
          kind: 'piege',
          text:
            'Attention au signe **moins** devant la dérivée de arccos : c\'est la seule des ' +
            "trois qui est négative ! Comme pour toute composée, n'oublie pas de multiplier " +
            "par $u'(x)$ (règle de la chaîne).",
        },
        {
          kind: 'atelier',
          tag: 'cyclometrique-tangente-widget',
          label: 'Manipule toi-même — la tangente et sa pente',
          caption:
            'Choisis arcsin, arccos ou arctan, puis fais glisser le point sur la courbe : la ' +
            'pente affichée est calculée par la formule du tableau ci-dessus. Rapproche-toi de ' +
            '±1 en arcsin/arccos pour voir la tangente devenir presque verticale — la pente ' +
            'explose, exactement ce que la démonstration de non-dérivabilité en ±1 établira ' +
            'plus loin.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — d\'où viennent ces trois formules ?' },
        {
          kind: 'para',
          text:
            'Les trois formules du tableau se démontrent toutes de la même façon, en trois ' +
            'temps : appliquer le théorème de la dérivée d\'une réciproque (section 1), faire ' +
            'disparaître la fonction trigonométrique parasite grâce à ' +
            '$\\cos^2 + \\sin^2 = 1$ (les identités de la section 2), puis **choisir le bon signe** en regardant sur quel ' +
            'intervalle vit l\'arcfonction. C\'est ce troisième temps qui distingue arcsin de ' +
            'arccos, et qui produit le signe moins.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — dérivée de arcsin',
          blocks: [
            {
              kind: 'para',
              text:
                '**Étape 1 — appliquer le théorème.** arcsin est la réciproque de la ' +
                'restriction $\\sin|_{[-\\pi/2;\\pi/2]}$, dont la dérivée est cos. Le théorème ' +
                'de la section 1, avec $f = \\sin|_{[-\\pi/2;\\pi/2]}$ et donc $f\' = \\cos$, ' +
                'donne, en tout $x$ où le dénominateur ne s\'annule pas :',
            },
            { kind: 'para', text: '$\\arcsin\'(x) = \\dfrac{1}{\\cos(\\arcsin(x))}$' },
            {
              kind: 'para',
              text:
                'Tu peux aussi le lire sans le théorème, par dérivation implicite : ' +
                '$\\sin(\\arcsin(x)) = x$ pour tout $x$ de $[-1;1]$ ; en dérivant les deux ' +
                'membres (règle de la chaîne à gauche), ' +
                '$\\cos(\\arcsin(x)) \\cdot \\arcsin\'(x) = 1$ — la même égalité.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — éliminer le cosinus.** Ce dénominateur est inutilisable tel quel : ' +
                'il faut l\'exprimer en fonction de $x$ seul. L\'identité fondamentale ' +
                '$\\cos^2(u) + \\sin^2(u) = 1$ donne $\\cos(u) = \\pm\\sqrt{1 - \\sin^2(u)}$. ' +
                'En posant $u = \\arcsin(x)$, et puisque $\\sin(\\arcsin(x)) = x$ :',
            },
            {
              kind: 'para',
              text:
                '$\\cos(\\arcsin(x)) = \\pm\\sqrt{1 - \\sin^2(\\arcsin(x))} = \\pm\\sqrt{1 - x^2}$',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — trancher le signe.** C\'est ici que l\'image de arcsin sert. Par ' +
                'construction, $\\arcsin(x) \\in [-\\pi/2 ; \\pi/2]$, et sur cet intervalle le ' +
                'cosinus est **positif ou nul** (c\'est la moitié droite du cercle ' +
                'trigonométrique). Le signe $\\pm$ est donc un $+$ :',
            },
            { kind: 'para', text: '$\\cos(\\arcsin(x)) = \\sqrt{1 - x^2}$' },
            {
              kind: 'para',
              text:
                '**Conclusion.** En reportant dans l\'étape 1 : ' +
                '$\\arcsin\'(x) = \\dfrac{1}{\\sqrt{1-x^2}}$, pour tout $x \\in \\; ]-1 ; 1[$ ' +
                '— les bornes $\\pm 1$ sont exclues, puisque le dénominateur y devient nul. ' +
                '$\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — dérivée de arccos par l\'identité complémentaire',
          blocks: [
            {
              kind: 'para',
              text:
                'Grâce à l\'identité $\\arccos(x) = \\pi/2 - \\arcsin(x)$ (section précédente), la ' +
                'dérivée de arcsin suffit :',
            },
            {
              kind: 'para',
              text:
                '$(\\arccos(x))\' = (\\pi/2 - \\arcsin(x))\' = -(\\arcsin(x))\' = -\\dfrac{1}{\\sqrt{1-x^2}}$',
            },
            {
              kind: 'para',
              text:
                'La constante $\\pi/2$ se dérive en 0 : il ne reste que le signe moins, et ' +
                'c\'est bien de là qu\'il vient. Cette démonstration est rapide, mais elle ' +
                '**dépend** de l\'identité complémentaire et ne dit rien de propre à arccos — ' +
                'd\'où l\'intérêt de la refaire par la méthode directe, exactement comme pour ' +
                'arcsin.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — dérivée de arccos par la méthode directe',
          blocks: [
            {
              kind: 'para',
              text:
                '**Étape 1 — appliquer le théorème.** arccos est la réciproque de la ' +
                'restriction $\\cos|_{[0;\\pi]}$, dont la dérivée est $-\\sin$. Le théorème de ' +
                'la section 1 donne donc :',
            },
            {
              kind: 'para',
              text:
                '$\\arccos\'(x) = \\dfrac{1}{-\\sin(\\arccos(x))} = -\\dfrac{1}{\\sin(\\arccos(x))}$',
            },
            {
              kind: 'para',
              text:
                'Par dérivation implicite, on obtient exactement la même chose : en dérivant ' +
                '$\\cos(\\arccos(x)) = x$ membre à membre, ' +
                '$-\\sin(\\arccos(x)) \\cdot \\arccos\'(x) = 1$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — éliminer le sinus.** Cette fois, c\'est le sinus qu\'il faut ' +
                'exprimer en fonction de $x$. La même identité $\\cos^2 + \\sin^2 = 1$, lue ' +
                'dans l\'autre sens, donne $\\sin(u) = \\pm\\sqrt{1 - \\cos^2(u)}$. En posant ' +
                '$u = \\arccos(x)$, et puisque $\\cos(\\arccos(x)) = x$ :',
            },
            {
              kind: 'para',
              text:
                '$\\sin(\\arccos(x)) = \\pm\\sqrt{1 - \\cos^2(\\arccos(x))} = \\pm\\sqrt{1 - x^2}$',
            },
            {
              kind: 'para',
              text:
                '**Étape 3 — trancher le signe.** L\'argument est le même que pour arcsin, mais ' +
                'il porte sur une autre fonction et sur un autre intervalle : ici ' +
                '$\\arccos(x) \\in [0 ; \\pi]$, et sur cet intervalle c\'est le **sinus** qui ' +
                'est positif ou nul (moitié haute du cercle trigonométrique). Le signe $\\pm$ ' +
                'est donc encore un $+$ :',
            },
            { kind: 'para', text: '$\\sin(\\arccos(x)) = \\sqrt{1 - x^2}$' },
            {
              kind: 'para',
              text:
                '**Conclusion.** En reportant dans l\'étape 1 : ' +
                '$\\arccos\'(x) = -\\dfrac{1}{\\sqrt{1-x^2}}$ pour tout ' +
                '$x \\in \\; ]-1 ; 1[$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Le signe moins n\'est donc pas un caprice à mémoriser : il vient de la dérivée ' +
                'de cos, qui vaut $-\\sin$, et non du choix du signe de la racine (celui-ci est ' +
                'positif dans les deux démonstrations). Il traduit un fait visible sur le ' +
                'graphe : arccos est **décroissante**, alors que arcsin est croissante.',
            },
            {
              kind: 'para',
              text:
                'À retenir de la comparaison des deux démonstrations : la méthode est ' +
                'identique, seul l\'intervalle-image change, et c\'est lui qui décide quelle ' +
                'fonction ($\\cos$ pour arcsin, $\\sin$ pour arccos) est garantie positive. ' +
                'La démonstration pour arctan, ci-dessous, suit le même plan — à ceci près ' +
                'qu\'aucune racine carrée n\'y apparaît, ce qui lui épargne toute discussion ' +
                'de signe.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — dérivée de arctan',
          blocks: [
            {
              kind: 'para',
              text:
                'Même plan que pour arcsin et arccos. Soit $f(x) = \\arctan(x)$ ; par ' +
                'définition de arctan, $x = \\tan(f(x))$ pour tout réel $x$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 1 — dériver les deux membres.** À gauche, $x\' = 1$. À droite, on ' +
                'compose avec la règle de la chaîne, en utilisant la dérivée de la tangente ' +
                'sous sa forme la plus commode ici, $(\\tan u)\' = (1 + \\tan^2 u) \\cdot u\'$ ' +
                '(qui n\'est qu\'une réécriture de $1/\\cos^2 u$) :',
            },
            { kind: 'para', text: '$1 = \\big(1+\\tan^2(f(x))\\big) \\cdot f\'(x)$' },
            {
              kind: 'para',
              text:
                'C\'est très exactement ce que donnerait le théorème de la section 1 appliqué ' +
                'à la restriction $\\tan|_{]-\\pi/2;\\pi/2[}$, dont arctan est la réciproque : ' +
                '$\\arctan\'(x) = \\dfrac{1}{\\tan\'(\\arctan(x))} = ' +
                '\\dfrac{1}{1+\\tan^2(\\arctan(x))}$.',
            },
            {
              kind: 'para',
              text:
                '**Étape 2 — faire réapparaître la variable.** La tangente parasite s\'élimine sans ' +
                'aucun détour par $\\cos^2 + \\sin^2 = 1$ : par définition de $f$, ' +
                '$\\tan(f(x)) = x$, donc $\\tan^2(f(x)) = x^2$. D\'où :',
            },
            { kind: 'para', text: '$f\'(x) = \\dfrac{1}{1+\\tan^2(f(x))} = \\dfrac{1}{1+x^2}$' },
            {
              kind: 'para',
              text:
                '**Étape 3 — le signe ?** Il n\'y a rien à trancher : aucune racine carrée n\'a ' +
                'été introduite, donc aucune ambiguïté de signe à lever. C\'est la seule des ' +
                'trois démonstrations qui se passe de l\'étude de l\'intervalle-image.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** $\\arctan\'(x) = \\dfrac{1}{1+x^2}$, et cette fois pour **tout** ' +
                'réel $x$ : le dénominateur $1 + x^2$ ne s\'annule jamais. Contrairement à ' +
                'arcsin et arccos, arctan est donc dérivable sur $\\mathbb{R}$ entier — sans ' +
                'aucun point exclu. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arcsin n\'est dérivable ni en 1, ni en −1',
          blocks: [
            {
              kind: 'para',
              text:
                'Raisonne par l\'absurde : **suppose** arcsin dérivable en 1, et cherche la ' +
                'contradiction.',
            },
            {
              kind: 'para',
              text:
                '**La contradiction.** L\'identité $\\sin(\\arcsin(x)) = x$ est valable sur tout ' +
                '$[-1 ; 1]$. Si arcsin était dérivable en 1, on pourrait dériver les deux membres ' +
                'en $x = 1$ ; la règle de la chaîne donnerait ' +
                '$\\cos(\\arcsin(1)) \\cdot \\arcsin\'(1) = 1$, c\'est-à-dire ' +
                '$\\cos(\\pi/2) \\cdot \\arcsin\'(1) = 1$, soit $0 \\cdot \\arcsin\'(1) = 1$.',
            },
            {
              kind: 'para',
              text:
                'Quelle que soit la valeur supposée de $\\arcsin\'(1)$, la multiplier par ' +
                '$0$ ne donnera jamais $1$ : absurde.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** arcsin n\'est pas dérivable en 1. De manière analogue en $-1$ ' +
                '(avec $\\arcsin(-1) = -\\pi/2$ et $\\cos(-\\pi/2) = 0$), elle ne l\'est pas ' +
                'non plus. Sa dérivée est donc définie sur l\'intervalle **ouvert** $]-1 ; 1[$ ' +
                'seulement. $\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Attention à l\'ordre du raisonnement',
          text:
            'Le fait que la formule $\\dfrac{1}{\\sqrt{1-x^2}}$ ne soit pas définie en ' +
            '$x = \\pm 1$ ne prouve **rien** à lui seul ! Cette formule vient du théorème de ' +
            'la section 1, dont les hypothèses ne sont pas vérifiées en $\\pm 1$ — et tu as vu ' +
            'que des hypothèses non vérifiées n\'établissent jamais la non-dérivabilité ' +
            '(contre-exemple de $\\sqrt[5]{x}$). Seul le raisonnement par l\'absurde ci-dessus ' +
            'établit réellement que arcsin n\'est pas dérivable en $\\pm 1$.',
        },
        { kind: 'subheading', text: 'Dériver une expression avec une arcfonction' },
        {
          kind: 'methode',
          label: 'Méthode — dériver arcsin(u), arccos(u) ou arctan(u)',
          items: [
            "Repère l'argument $u$ et calcule $u'$.",
            "Applique la formule du tableau, sans oublier le facteur $u'$ ni le signe moins de " +
              'arccos. C\'est $u$ **tout entier** qui est mis au carré.',
            'Simplifie (mise en évidence sous la racine, puissances).',
            "Pour arcsin et arccos, donne l'intervalle de validité : $u(x) \\in \\; ]-1 ; 1[$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — dérivée composée',
          blocks: [
            { kind: 'para', text: '$(\\arcsin(2x-1))\'$' },
            { kind: 'para', text: 'Règle de la chaîne avec $u = 2x-1$, $u\' = 2$ :' },
            {
              kind: 'para',
              text:
                '$(\\arcsin(2x-1))\' = \\dfrac{2}{\\sqrt{1-(2x-1)^2}} = \\dfrac{2}{\\sqrt{-4x^2+4x}} = \\dfrac{2}{2\\sqrt{x-x^2}} = \\dfrac{1}{\\sqrt{x-x^2}}$',
            },
            {
              kind: 'para',
              text:
                '**Validité.** $2x - 1 \\in \\; ]-1 ; 1[$ donne $0 < 2x < 2$, soit ' +
                '$x \\in \\; ]0 ; 1[$ : c\'est là, et là seulement, que la formule vaut. On le ' +
                'retrouve sur le résultat, $x - x^2 = x(1-x) > 0$ exactement sur $]0 ; 1[$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — arctan(3x) et arccos(x²)',
          blocks: [
            {
              kind: 'para',
              text:
                '**a)** $u = 3x$, $u\' = 3$ : $(\\arctan(3x))\' = \\dfrac{3}{1 + (3x)^2} = ' +
                '\\dfrac{3}{1 + 9x^2}$, valable sur $\\mathbb{R}$ — et non $\\dfrac{3}{1 + 3x^2}$.',
            },
            {
              kind: 'para',
              text:
                '**b)** $u = x^2$, $u\' = 2x$ : $(\\arccos(x^2))\' = -\\dfrac{2x}{\\sqrt{1 - x^4}}$, ' +
                'valable pour $x^2 < 1$, soit $x \\in \\; ]-1 ; 1[$.',
            },
          ],
        },
        {
          kind: 'para',
          text:
            "Une dérivée nulle sur un intervalle signifie une fonction constante : c'est une " +
            'autre façon d\'établir une identité entre arcfonctions.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arctan(x) + arctan(1/x) = π/2 pour x > 0',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $g(x) = \\arctan(x) + \\arctan\\left(\\dfrac{1}{x}\\right)$ sur ' +
                "l'intervalle $]0 ; +\\infty[$.",
            },
            {
              kind: 'para',
              text:
                '**La dérivée.** Avec $u = \\dfrac{1}{x}$, $u\' = -\\dfrac{1}{x^2}$ : ' +
                "$g'(x) = \\dfrac{1}{1 + x^2} + \\dfrac{-\\frac{1}{x^2}}{1 + \\frac{1}{x^2}} = " +
                '\\dfrac{1}{1 + x^2} - \\dfrac{1}{x^2 + 1} = 0$.',
            },
            {
              kind: 'para',
              text:
                '**Constante.** $g$ a une dérivée nulle sur un **intervalle** : elle y est ' +
                "constante. Sa valeur en $x = 1$ : $g(1) = \\dfrac{\\pi}{4} + \\dfrac{\\pi}{4} = " +
                '\\dfrac{\\pi}{2}$. Donc $\\arctan(x) + \\arctan\\left(\\dfrac{1}{x}\\right) = ' +
                '\\dfrac{\\pi}{2}$ pour tout $x > 0$. $\\qquad \\blacksquare$',
            },
            {
              kind: 'para',
              text:
                'Pour $x < 0$, l\'imparité de arctan donne $-\\dfrac{\\pi}{2}$ : la somme ' +
                "n'est pas la même sur $]-\\infty ; 0[$, c'est pourquoi le mot « intervalle » " +
                'compte.',
            },
          ],
        },
        {
          kind: 'application',
          titre: 'Trouver la meilleure place pour regarder un écran',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -0.3,
              xMax: 3.6,
              yMin: -0.3,
              yMax: 4.6,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'accent' },
                { from: { x: 0, y: 0 }, to: { x: 3, y: 4 }, tone: 'good' },
                { from: { x: 3, y: 1 }, to: { x: 3, y: 4 }, tone: 'ink', arrow: false },
              ],
              points: [
                { x: 3, y: 1, label: 'bas (a)', tone: 'accent', labelPos: 'right' },
                { x: 3, y: 4, label: 'haut (b)', tone: 'good', labelPos: 'right' },
                { x: 0, y: 0, label: 'toi', tone: 'ink', labelPos: 'left' },
              ],
              angleArcs: [{ cx: 0, cy: 0, fromDeg: 18.43, toDeg: 53.13, radiusPx: 50, label: 'θ', tone: 'bad' }],
              caption:
                "Depuis ta place, à distance x du mur, l'écran (entre les hauteurs a et b au-" +
                "dessus de tes yeux) est vu sous l'angle θ — la différence entre les deux " +
                'angles arctan vers le haut et le bas de l\'écran.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => ((Math.atan(4 / x) - Math.atan(1 / x)) * 180) / PI, tone: 'good' }],
              xMin: 0.2,
              xMax: 12,
              xTicks: [2, 4, 6, 8, 10],
              fixedYRange: { min: 0, max: 40 },
              points: [{ x: 2, y: 36.87, label: '', tone: 'bad' }],
              textLabels: [{ x: 4.5, y: 37, text: 'maximum en x = 2 (θ ≈ 36,9°)', tone: 'bad', anchor: 'start' }],
              xAxisLabel: 'distance x',
              yAxisLabel: 'angle θ (°)',
              caption:
                '$\\theta(x) = \\arctan\\left(\\dfrac{4}{x}\\right) - \\arctan\\left(\\dfrac{1}{x}\\right)$, pour $a = 1$ et $b = 4$ (en unités de hauteur ' +
                "d'yeux) : l'angle est maximal à une distance précise — ni trop près ni trop " +
                'loin — exactement le sommet de cette courbe, trouvé en dérivant.',
            },
          ],
          text:
            "Au cinéma ou devant un grand panneau publicitaire, l'angle sous lequel tu vois " +
            "l'écran — et donc ton confort visuel — dépend de ta distance au mur. Trop près, " +
            "l'écran se voit sous un angle très rasant, presque nul ; trop loin, l'angle " +
            'devient minuscule : entre les deux, une distance le rend maximal. Ce ' +
            "problème classique d'optimisation se modélise avec arctan : si l'écran est " +
            'accroché entre les hauteurs $a$ et $b$ au-dessus de tes yeux, l\'angle sous ' +
            'lequel tu le vois depuis une distance $x$ vaut $\\theta(x) = \\arctan(b/x) - ' +
            '\\arctan(a/x)$. Trouver la distance qui **maximise** cet angle — la meilleure place ' +
            'dans la salle — demande exactement ce que tu viens d\'apprendre : dériver une ' +
            'expression contenant arctan, puis chercher où cette dérivée s\'annule.',
          domaines: ['Physique', 'Optimisation'],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — la meilleure distance pour regarder l'écran",
          blocks: [
            {
              kind: 'para',
              text:
                'Écran entre les hauteurs $a = 1$ et $b = 4$ au-dessus des yeux : ' +
                '$\\theta(x) = \\arctan\\left(\\dfrac{4}{x}\\right) - \\arctan\\left(\\dfrac{1}{x}\\right)$, ' +
                'pour $x > 0$.',
            },
            {
              kind: 'para',
              text:
                '**Dérivée.** Pour $\\arctan\\left(\\dfrac{k}{x}\\right)$, $u = \\dfrac{k}{x}$ et ' +
                "$u' = -\\dfrac{k}{x^2}$, d'où $\\left(\\arctan \\dfrac{k}{x}\\right)' = " +
                '\\dfrac{-\\frac{k}{x^2}}{1 + \\frac{k^2}{x^2}} = -\\dfrac{k}{x^2 + k^2}$. Donc ' +
                "$\\theta'(x) = -\\dfrac{4}{x^2 + 16} + \\dfrac{1}{x^2 + 1}$.",
            },
            {
              kind: 'para',
              text:
                "**Signe.** $\\theta'(x) = \\dfrac{-4(x^2 + 1) + (x^2 + 16)}{(x^2 + 16)(x^2 + 1)} = " +
                '\\dfrac{12 - 3x^2}{(x^2 + 16)(x^2 + 1)}$ : positif pour $x < 2$, nul en ' +
                '$x = 2$, négatif ensuite.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** L\'angle est maximal à la distance $x = 2$, et vaut ' +
                '$\\theta(2) = \\arctan(2) - \\arctan\\left(\\dfrac{1}{2}\\right) \\approx 36{,}9^\\circ$. ' +
                'En général, le même calcul donne $x = \\sqrt{ab}$.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'angle-de-vue-widget',
          label: 'Manipule toi-même — l\'angle de vue',
          caption:
            'Avance ou recule face au mur : l\'angle θ sous lequel tu vois l\'écran se lit ' +
            'sur la scène (à l\'échelle) et sur le graphique. Tout près du mur, θ tend vers ' +
            '0 ; très loin aussi. Le maximum est atteint en x = √(ab) : change la hauteur ' +
            'de l\'écran et sa position pour voir la meilleure place se déplacer.',
        },
        {
          kind: 'entrainement',
          title: 'Dérivées de fonctions cyclométriques',
          generatorId: '6gen4',
          description: [
            'Dérive des expressions composées avec arcsin, arccos et arctan en appliquant la ' +
              'règle de la chaîne, formule et signe compris.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 4. Dérivées de fonctions cyclométriques »',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes avec arcfonctions',
          generatorId: '6gen156',
          description: [
            'Réfraction et angle limite (existe-t-il un rayon réfracté ?), meilleure distance pour ' +
              'regarder un tableau, échelle contre un mur : modélise, choisis l\'arcfonction qui convient ' +
              'et calcule l\'angle à la calculatrice.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 156. Problèmes avec arcfonctions »',
        },
      ],
    },
    {
      id: 'graphiques',
      number: 5,
      title: 'Reconnaître une fonction cyclométrique à son graphe',
      titreCourt: 'Reconnaître le graphe',
      partie: 'Graphes et études',
      essentiel: [
        'Domaine [−1 ; 1] : arcsin ou arccos ; domaine ℝ et asymptotes horizontales $y = \\pm\\pi/2$ : arctan. arccos est la seule décroissante.',
        '$f(x) = c + k\\cdot\\arcsin(mx + n)$ : domaine par $-1 \\le mx + n \\le 1$ ; image : celle de l\'arcfonction multipliée par k, puis augmentée de c.',
        'Passer par l\'origine ne suffit pas pour être impaire : seul le centre de symétrie, ou le calcul de f(−x), permet de conclure.',
      ],
      cartes: [
        { question: '$f(x) = \\dfrac{\\pi}{2} + 2\\arcsin(x - 1)$ : domaine et image ?', reponse: 'Domaine $[0 ; 2]$, image $\\left[-\\dfrac{\\pi}{2} ; \\dfrac{3\\pi}{2}\\right]$.' },
        { question: '$g(x) = \\dfrac{\\pi}{2} - 2\\arctan(x + 1)$ : croissante ou décroissante ?', reponse: 'Décroissante, car $k \\cdot m = -2 < 0$.' },
        { question: 'Asymptotes horizontales de $c + k\\cdot\\arctan(mx + n)$ ?', reponse: '$y = c \\pm k\\dfrac{\\pi}{2}$.' },
        { question: 'Un graphe de domaine ℝ sans asymptote : est-ce une arcfonction seule ?', reponse: 'Non : seule arctan a le domaine ℝ, et elle a les asymptotes $y = \\pm\\pi/2$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Reconnaître une fonction cyclométrique à son graphe', youtubeId: 'dCyJByIOeso' },
        { kind: 'subheading', text: 'Les trois graphes de référence' },
        {
          kind: 'para',
          text: 'Face à un graphe inconnu, trois questions suffisent presque toujours à trouver la bonne arcfonction :',
        },
        {
          kind: 'methode',
          items: [
            '**Le domaine est-il borné ou non ?** Borné à [−1 ; 1] → arcsin ou arccos ' +
              '(éventuellement composée). Non borné (ℝ) → arctan.',
            '**La courbe est-elle croissante ou décroissante ?** arcsin et arctan sont ' +
              'croissantes ; arccos est décroissante.',
            '**Y a-t-il des asymptotes horizontales ?** Seule arctan en a ($y = \\pm\\pi/2$) — ' +
              "un domaine ℝ sans asymptote n'est pas une arcfonction seule.",
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les caractéristiques des trois arcfonctions',
          headers: ['Fonction', 'Domaine, image, sens, parité, asymptotes, extremums'],
          rows: [
            ['arcsin', 'domaine $[-1 ; 1]$, image $\\left[-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right]$ ; croissante ; impaire ; aucune asymptote ; minimum $-\\frac{\\pi}{2}$ en $-1$, maximum $\\frac{\\pi}{2}$ en $1$'],
            ['arccos', 'domaine $[-1 ; 1]$, image $[0 ; \\pi]$ ; décroissante ; ni paire ni impaire ; aucune asymptote ; maximum $\\pi$ en $-1$, minimum $0$ en $1$'],
            ['arctan', 'domaine $\\mathbb{R}$, image $\\left]-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right[$ ; croissante ; impaire ; asymptotes $y = \\pm\\frac{\\pi}{2}$ ; aucun extremum'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: Math.atan, tone: 'bad' },
              { fn: Math.asin, tone: 'accent', xMin: -1, xMax: 1 },
              { fn: Math.acos, tone: 'good', xMin: -1, xMax: 1 },
            ],
            xMin: -4,
            xMax: 4,
            xTicks: [-3, -2, -1, 1, 2, 3],
            yTicks: [-PI / 2, PI / 2, PI],
            yTickLabels: { [-PI / 2]: '−π/2', [PI / 2]: 'π/2', [PI]: 'π' },
            grid: true,
            fixedYRange: { min: -2.1, max: 3.7 },
            points: [
              { x: -1, y: -PI / 2, label: '', tone: 'accent' },
              { x: 1, y: PI / 2, label: '', tone: 'accent' },
              { x: -1, y: PI, label: '', tone: 'good' },
              { x: 1, y: 0, label: '', tone: 'good' },
            ],
            textLabels: [
              { x: 1.15, y: 1.95, text: 'arcsin', tone: 'accent', anchor: 'start' },
              { x: -1.15, y: 3.3, text: 'arccos', tone: 'good', anchor: 'end' },
              { x: 3.9, y: 0.9, text: 'arctan', tone: 'bad', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Les trois arcfonctions sur un même repère : arcsin (orange) et arccos (vert) ' +
              'vivent sur $[-1 ; 1]$, arctan (rouge) sur $\\mathbb{R}$, coincée entre les droites ' +
              '$y = -\\pi/2$ et $y = \\pi/2$ de la grille. arccos est la seule décroissante.',
          },
        },
        { kind: 'subheading', text: 'Fonctions transformées : f(x) = c + k·arc(mx + n)' },
        {
          kind: 'para',
          text:
            'Les graphes rencontrés en exercice sont rarement ceux des arcfonctions seules : ils ' +
            'sont décalés, étirés ou retournés. Chaque paramètre a un effet précis, qui se lit ' +
            'sans tracer la courbe.',
        },
        {
          kind: 'methode',
          label: 'Méthode — étudier f(x) = c + k·arcsin(mx + n) (de même avec arccos, arctan)',
          items: [
            '**Domaine** : résous $-1 \\le mx + n \\le 1$ pour arcsin et arccos ; $\\mathbb{R}$ ' +
              'pour arctan.',
            "**Image** : multiplie l'image de l'arcfonction par $k$ (les bornes s'échangent si " +
              '$k < 0$), puis ajoute $c$. Pour arctan, l\'intervalle reste **ouvert**.',
            '**Sens de variation** : pour arcsin et arctan, $f$ est croissante si $k \\cdot m > 0$, ' +
              'décroissante si $k \\cdot m < 0$ ; pour arccos, c\'est l\'inverse.',
            '**Extremums** : pour arcsin et arccos, aux deux bornes du domaine (leurs valeurs ' +
              "sont les bornes de l'image). Pour arctan, aucun extremum, mais deux asymptotes " +
              'horizontales $y = c \\pm k\\dfrac{\\pi}{2}$.',
            '**Symétrie et parité** : le graphe est symétrique par rapport au point ' +
              '$\\left(-\\dfrac{n}{m} ; c\\right)$ (arcsin, arctan) ou ' +
              '$\\left(-\\dfrac{n}{m} ; c + k\\dfrac{\\pi}{2}\\right)$ (arccos). $f$ est impaire ' +
              'seulement si ce centre est l\'origine ; elle n\'est jamais paire, puisqu\'elle est ' +
              'strictement monotone.',
            "**Ordonnée à l'origine** : $f(0)$, si $0$ est dans le domaine.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — lire f(x) = π/2 + 2·arcsin(x − 1)',
          blocks: [
            {
              kind: 'para',
              text:
                '**Domaine.** $-1 \\le x - 1 \\le 1$, soit $x \\in [0 ; 2]$.',
            },
            {
              kind: 'para',
              text:
                '**Image.** $2 \\cdot \\left[-\\dfrac{\\pi}{2} ; \\dfrac{\\pi}{2}\\right] = [-\\pi ; \\pi]$, ' +
                'puis $+\\dfrac{\\pi}{2}$ : $\\left[-\\dfrac{\\pi}{2} ; \\dfrac{3\\pi}{2}\\right]$.',
            },
            {
              kind: 'para',
              text:
                '**Variations et extremums.** $k = 2 > 0$ et $m = 1 > 0$ : $f$ est croissante. ' +
                'Minimum $f(0) = \\dfrac{\\pi}{2} + 2\\arcsin(-1) = -\\dfrac{\\pi}{2}$, maximum ' +
                '$f(2) = \\dfrac{3\\pi}{2}$.',
            },
            {
              kind: 'para',
              text:
                "**Symétrie, parité, ordonnée à l'origine.** Centre de symétrie " +
                '$\\left(1 ; \\dfrac{\\pi}{2}\\right)$. Le domaine $[0 ; 2]$ n\'est pas symétrique ' +
                "par rapport à 0 : $f$ n'est ni paire ni impaire. Ordonnée à l'origine : " +
                '$f(0) = -\\dfrac{\\pi}{2}$.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (x) => PI / 2 + 2 * Math.asin(x - 1), tone: 'accent', xMin: 0, xMax: 2 }],
                xMin: -0.8,
                xMax: 2.8,
                xTicks: [1, 2],
                yTicks: [-PI / 2, PI / 2, PI, (3 * PI) / 2],
                yTickLabels: { [-PI / 2]: '−π/2', [PI / 2]: 'π/2', [PI]: 'π', [(3 * PI) / 2]: '3π/2' },
                grid: true,
                fixedYRange: { min: -2.3, max: 5.4 },
                points: [
                  { x: 0, y: -PI / 2, label: '(0 ; −π/2)', tone: 'accent', labelPos: 'right' },
                  { x: 1, y: PI / 2, label: '', tone: 'good' },
                  { x: 2, y: (3 * PI) / 2, label: '(2 ; 3π/2)', tone: 'accent', labelPos: 'left' },
                ],
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  '$f(x) = \\dfrac{\\pi}{2} + 2\\arcsin(x - 1)$ : domaine $[0 ; 2]$ et image ' +
                  '$\\left[-\\dfrac{\\pi}{2} ; \\dfrac{3\\pi}{2}\\right]$, lus sur les lignes de la ' +
                  'grille. Le point vert $\\left(1 ; \\dfrac{\\pi}{2}\\right)$ est le centre de symétrie.',
              },
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — lire g(x) = π/2 − 2·arctan(x + 1)',
          blocks: [
            {
              kind: 'para',
              text:
                '**Domaine et image.** Domaine $\\mathbb{R}$. $-2 \\cdot \\left]-\\dfrac{\\pi}{2} ; ' +
                '\\dfrac{\\pi}{2}\\right[ = \\; ]-\\pi ; \\pi[$, puis $+\\dfrac{\\pi}{2}$ : ' +
                '$\\left]-\\dfrac{\\pi}{2} ; \\dfrac{3\\pi}{2}\\right[$.',
            },
            {
              kind: 'para',
              text:
                '**Variations et asymptotes.** $k \\cdot m = -2 < 0$ : $g$ est décroissante, sans ' +
                'extremum. En $+\\infty$, $\\arctan(x + 1) \\to \\dfrac{\\pi}{2}$, donc ' +
                '$g(x) \\to -\\dfrac{\\pi}{2}$ ; en $-\\infty$, $g(x) \\to \\dfrac{3\\pi}{2}$ : deux ' +
                'asymptotes horizontales.',
            },
            {
              kind: 'para',
              text:
                "**Ordonnée à l'origine et parité.** $g(0) = \\dfrac{\\pi}{2} - 2 \\cdot " +
                '\\dfrac{\\pi}{4} = 0$ : la courbe passe par l\'origine. Pourtant $g$ n\'est pas ' +
                'impaire : son centre de symétrie est $\\left(-1 ; \\dfrac{\\pi}{2}\\right)$, et par ' +
                'exemple $g(-2) = \\pi$ alors que $g(2) = \\dfrac{\\pi}{2} - 2\\arctan(3) \\neq -\\pi$.',
            },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (x) => PI / 2 - 2 * Math.atan(x + 1), tone: 'accent' }],
                xMin: -7,
                xMax: 5,
                xTicks: [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4],
                yTicks: [-PI / 2, PI / 2, PI, (3 * PI) / 2],
                yTickLabels: { [-PI / 2]: '−π/2', [PI / 2]: 'π/2', [PI]: 'π', [(3 * PI) / 2]: '3π/2' },
                grid: true,
                horizontalAsymptotes: [{ y: -PI / 2 }, { y: (3 * PI) / 2 }],
                fixedYRange: { min: -2.4, max: 5.6 },
                points: [
                  { x: -1, y: PI / 2, label: '', tone: 'good' },
                  { x: -2, y: PI, label: '(−2 ; π)', tone: 'accent', labelPos: 'above' },
                  { x: 0, y: 0, label: '', tone: 'bad' },
                ],
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                caption:
                  '$g(x) = \\dfrac{\\pi}{2} - 2\\arctan(x + 1)$ : décroissante, entre les asymptotes ' +
                  '$y = \\dfrac{3\\pi}{2}$ (en $-\\infty$) et $y = -\\dfrac{\\pi}{2}$ (en $+\\infty$). ' +
                  "Elle passe par l'origine (point rouge), mais son centre de symétrie est le point " +
                  'vert $\\left(-1 ; \\dfrac{\\pi}{2}\\right)$ : elle n\'est pas impaire.',
              },
            },
          ],
        },
        {
          kind: 'piege',
          text:
            "Passer par l'origine ne suffit pas pour être impaire (exemple ci-dessus) ; et une " +
            'transformée de arccos peut l\'être : $\\arccos(x) - \\dfrac{\\pi}{2} = -\\arcsin(x)$, ' +
            'de centre $(0 ; 0)$. Le seul test fiable est le centre de symétrie, ou le calcul de ' +
            '$f(-x)$.',
        },
        {
          kind: 'atelier',
          tag: 'transformees-arc-widget',
          label: 'Manipule toi-même — les transformées c + k·arc(mx + n)',
          caption:
            'Choisis arcsin, arccos ou arctan, puis règle k, m, n et c. Le domaine (en ' +
            'vert, sur l\'axe des abscisses) et l\'image (en violet, sur l\'axe des ordonnées) ' +
            'se recalculent en direct, en valeurs exactes. Observe ce qui change le domaine ' +
            '(seulement m et n) et ce qui change l\'image (seulement k et c), et quand le ' +
            'sens de variation s\'inverse.',
        },
        {
          kind: 'entrainement',
          title: 'Associer graphique et expression',
          generatorId: '6gen5',
          description: [
            "Associe un graphique à l'expression d'une fonction cyclométrique transformée, puis " +
              "lis son domaine, son image, sa parité, son ordonnée à l'origine et ses extremums.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 5. Associer graphique et expression »',
        },
        {
          kind: 'entrainement',
          title: "Détective d'erreurs : réciproques et arcfonctions",
          generatorId: '6gen152',
          description: [
            "La résolution d'un élève contient une seule ligne fausse : trouve-la, nomme l'erreur " +
              '(f⁻¹ prise pour 1/f, arcsin(sin θ) = θ hors de l\'image, signe oublié devant la dérivée de ' +
              "arccos, u′ oublié, (kx)² écrit kx², candidat hors condition d'existence, sens de " +
              "l'inégalité non inversé, ±π/2 atteints par arctan, injectivité sur une réunion d'intervalles) " +
              'et corrige le résultat.',
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 152. Détective d'erreurs : réciproques et arcfonctions »",
        },
        {
          kind: 'entrainement',
          title: 'Lire une transformée c + k·arc(mx + n)',
          generatorId: '6gen158',
          description: [
            'Sur une grille aux multiples de π/4 : lis le domaine et l\'image d\'une transformée d\'arcsin, ' +
              'arccos ou arctan, puis retrouve m, n, k, c et l\'expression.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 158. Lire une transformée c + k·arc(mx + n) »',
        },
      ],
    },
    {
      id: 'etude',
      number: 6,
      title: 'Étudier une fonction cyclométrique',
      titreCourt: 'Étude complète',
      partie: 'Graphes et études',
      essentiel: [
        'Même ordre que pour toute fonction : domaine (CE), parité, limites et asymptotes, dérivée et signe, tableau de variations, graphe.',
        '$\\lim\\limits_{x \\to \\pm\\infty} \\arctan(x) = \\pm\\dfrac{\\pi}{2}$. Asymptote oblique : $a = \\lim\\limits_{x \\to \\infty} \\dfrac{f(x)}{x}$, puis $b = \\lim\\limits_{x \\to \\infty} \\big(f(x) - ax\\big)$.',
        'Une fonction paire ou impaire s\'étudie sur $[0 ; +\\infty[$, puis se complète par symétrie.',
      ],
      cartes: [
        { question: '$g(x) = \\arctan(x) - \\dfrac{x}{2}$ : paire ou impaire ?', reponse: 'Impaire : $g(-x) = -\\arctan(x) + \\dfrac{x}{2} = -g(x)$.' },
        { question: 'Même g : où est son maximum ?', reponse: '$g\'(x) = \\dfrac{1 - x^2}{2(1 + x^2)}$ s\'annule en 1 : maximum $g(1) = \\dfrac{\\pi}{4} - \\dfrac{1}{2}$.' },
        { question: 'Même g : asymptote oblique en $+\\infty$ ?', reponse: '$y = -\\dfrac{x}{2} + \\dfrac{\\pi}{2}$, car $g(x) + \\dfrac{x}{2} = \\arctan(x) \\to \\dfrac{\\pi}{2}$.' },
        { question: '$f(x) = x\\arctan(x)$ : paire ou impaire ?', reponse: 'Paire : produit de deux fonctions impaires.' },
      ],
      blocks: [
        { kind: 'video', title: 'Étudier une fonction cyclométrique' },
        {
          kind: 'para',
          text:
            "Étudier complètement une fonction qui contient une arcfonction suit le même ordre " +
            'que pour toute fonction. Ce chapitre fournit les outils de chaque étape : la CE pour ' +
            'le domaine, la parité de arcsin et arctan, les limites $\\pm\\dfrac{\\pi}{2}$ de ' +
            'arctan, et les dérivées de la section 4.',
        },
        {
          kind: 'methode',
          label: 'Méthode — étude complète',
          items: [
            '**Domaine** : CE de chaque arcfonction, dénominateurs, racines.',
            '**Parité** : si le domaine est symétrique, compare $f(-x)$ à $f(x)$. Une fonction ' +
              "paire ou impaire s'étudie sur $[0 ; +\\infty[$, puis se complète par symétrie.",
            '**Limites et asymptotes** : $\\displaystyle\\lim_{x \\to \\pm\\infty} \\arctan(x) = ' +
              '\\pm\\dfrac{\\pi}{2}$ ; arcsin et arccos sont bornées, et prennent leurs valeurs ' +
              'extrêmes aux bornes de leur domaine. Asymptote oblique $y = ax + b$ : ' +
              '$a = \\displaystyle\\lim_{x \\to \\infty} \\dfrac{f(x)}{x}$, ' +
              '$b = \\displaystyle\\lim_{x \\to \\infty} \\big(f(x) - ax\\big)$.',
            "**Dérivée et signe** : formules de la section 4 (valables sur $]-1 ; 1[$ pour arcsin " +
              'et arccos), puis tableau de signes.',
            '**Tableau de variations** : extremums, valeurs aux bornes, asymptotes.',
            '**Graphe** : il doit confirmer chaque ligne du tableau.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — étude de g(x) = arctan(x) − x/2',
          blocks: [
            {
              kind: 'para',
              text:
                '**1) Domaine :** $\\mathbb{R}$. **2) Parité :** $g(-x) = -\\arctan(x) + ' +
                '\\dfrac{x}{2} = -g(x)$ : $g$ est impaire, son graphe est symétrique par rapport à ' +
                "l'origine.",
            },
            {
              kind: 'para',
              text:
                '**3) Limites et asymptotes :** en $+\\infty$, $\\arctan(x) \\to \\dfrac{\\pi}{2}$ ' +
                'et $-\\dfrac{x}{2} \\to -\\infty$, donc $g(x) \\to -\\infty$. Comme ' +
                '$g(x) - \\left(-\\dfrac{x}{2}\\right) = \\arctan(x) \\to \\dfrac{\\pi}{2}$, la droite ' +
                '$y = -\\dfrac{x}{2} + \\dfrac{\\pi}{2}$ est asymptote oblique en $+\\infty$ ; par ' +
                'imparité, $y = -\\dfrac{x}{2} - \\dfrac{\\pi}{2}$ l\'est en $-\\infty$.',
            },
            {
              kind: 'para',
              text:
                "**4) Dérivée :** $g'(x) = \\dfrac{1}{1 + x^2} - \\dfrac{1}{2} = " +
                '\\dfrac{1 - x^2}{2(1 + x^2)}$ : du signe de $1 - x^2$, positive sur $]-1 ; 1[$, ' +
                'négative en dehors.',
            },
            {
              kind: 'para',
              text:
                '**5) Extremums :** minimum en $x = -1$, $g(-1) = \\dfrac{1}{2} - \\dfrac{\\pi}{4} ' +
                '\\approx -0{,}29$ ; maximum en $x = 1$, $g(1) = \\dfrac{\\pi}{4} - \\dfrac{1}{2} ' +
                '\\approx 0{,}29$.',
            },
          ],
        },
        {
          kind: 'signTable',
          caption: 'Tableau de variations de g(x) = arctan(x) − x/2 sur [0 ; +∞[ (g impaire : le reste par symétrie)',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '0', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '1', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'zero' },
              ],
            },
            {
              label: 'signe de g′(x)',
              cells: [
                { text: '+', tone: 'pos' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '−', tone: 'neg' },
                { text: '', tone: 'plain' },
              ],
            },
            {
              label: 'variations de g',
              cells: [
                { text: '0', tone: 'plain' },
                { text: '↗', tone: 'plain' },
                { text: '≈ 0,29', tone: 'zero' },
                { text: '↘', tone: 'plain' },
                { text: '−∞', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.atan(x) - x / 2, tone: 'accent' }],
            xMin: -6,
            xMax: 6,
            xTicks: [-4, -2, 2, 4],
            obliqueAsymptotes: [
              { a: -0.5, b: PI / 2, from: 0.5, to: 6 },
              { a: -0.5, b: -PI / 2, from: -6, to: -0.5 },
            ],
            fixedYRange: { min: -2.6, max: 2.6 },
            points: [
              { x: 1, y: PI / 4 - 0.5, label: 'max', tone: 'good', labelPos: 'above' },
              { x: -1, y: 0.5 - PI / 4, label: 'min', tone: 'bad', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              '$g(x) = \\arctan(x) - \\dfrac{x}{2}$, impaire : un minimum en $x = -1$, un maximum ' +
              'en $x = 1$, et deux asymptotes obliques parallèles (pointillés) : ' +
              '$y = -\\dfrac{x}{2} + \\dfrac{\\pi}{2}$ en $+\\infty$, $y = -\\dfrac{x}{2} - \\dfrac{\\pi}{2}$ en $-\\infty$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — étude de f(x) = x·arctan(x)',
          blocks: [
            {
              kind: 'para',
              text:
                '**1) Domaine :** $\\mathbb{R}$. **2) Parité :** $f(-x) = (-x) \\cdot \\arctan(-x) = ' +
                'x \\cdot \\arctan(x) = f(x)$ : $f$ est paire (produit de deux fonctions impaires).',
            },
            {
              kind: 'para',
              text:
                '**3) Limites :** en $+\\infty$, $x \\to +\\infty$ et $\\arctan(x) \\to ' +
                '\\dfrac{\\pi}{2} > 0$ : $f(x) \\to +\\infty$, et de même en $-\\infty$ par parité.',
            },
            {
              kind: 'para',
              text:
                '**Asymptote oblique** en $+\\infty$ : $a = \\displaystyle\\lim_{x \\to +\\infty} ' +
                '\\dfrac{f(x)}{x} = \\lim_{x \\to +\\infty} \\arctan(x) = \\dfrac{\\pi}{2}$. Puis, ' +
                'avec $\\arctan(x) - \\dfrac{\\pi}{2} = -\\arctan\\left(\\dfrac{1}{x}\\right)$ ' +
                '(section 4) et $t = \\dfrac{1}{x} \\to 0^+$ : $f(x) - \\dfrac{\\pi}{2}x = ' +
                '-\\dfrac{\\arctan(t)}{t} \\to -\\arctan\'(0) = -1$ (définition du nombre dérivé ' +
                'en 0). D\'où l\'asymptote $y = \\dfrac{\\pi}{2}x - 1$ en $+\\infty$, et ' +
                '$y = -\\dfrac{\\pi}{2}x - 1$ en $-\\infty$ par parité.',
            },
            {
              kind: 'para',
              text:
                "**4) Dérivée :** $f'(x) = \\arctan(x) + \\dfrac{x}{1 + x^2}$. Pour $x > 0$, les " +
                'deux termes sont positifs ; pour $x < 0$, les deux sont négatifs ; ' +
                "$f'(0) = 0$. **5) Extremum :** $f$ décroît puis croît : minimum $f(0) = 0$.",
            },
          ],
        },
        {
          kind: 'signTable',
          caption: 'Tableau de variations de f(x) = x·arctan(x)',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '0', tone: 'zero' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'zero' },
              ],
            },
            {
              label: 'signe de f′(x)',
              cells: [
                { text: '', tone: 'plain' },
                { text: '−', tone: 'neg' },
                { text: '0', tone: 'zero' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
              ],
            },
            {
              label: 'variations de f',
              cells: [
                { text: '+∞', tone: 'plain' },
                { text: '↘', tone: 'plain' },
                { text: 'min 0', tone: 'zero' },
                { text: '↗', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x * Math.atan(x), tone: 'accent' }],
            xMin: -5,
            xMax: 5,
            xTicks: [-4, -2, 2, 4],
            obliqueAsymptotes: [
              { a: PI / 2, b: -1, from: 0.6, to: 5 },
              { a: -PI / 2, b: -1, from: -5, to: -0.6 },
            ],
            fixedYRange: { min: -1.6, max: 7.6 },
            points: [{ x: 0, y: 0, label: '', tone: 'good' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              '$f(x) = x\\arctan(x)$, paire : minimum en l\'origine, et deux asymptotes obliques ' +
              '$y = \\dfrac{\\pi}{2}x - 1$ en $+\\infty$ et $y = -\\dfrac{\\pi}{2}x - 1$ en $-\\infty$ ' +
              '(pointillés), dont la courbe se rapproche par au-dessus.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Étude d\'une fonction cyclométrique',
          generatorId: '6gen157',
          description: [
            'Domaine, dérivée (règle de la chaîne, du produit), zéros de f′, variations intervalle par intervalle ' +
              'et tableau de variation avec extremums, valeurs aux bornes et limites exacts.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 157. Étude d\'une fonction cyclométrique »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Fonction réciproque',
        formulas: [
          { text: '$f^{-1}(f(x)) = x$ et $f(f^{-1}(y)) = y$', condition: 'pour $f$ injective' },
          {
            text: '$\\text{dom}(f^{-1}) = \\text{Im}(f) \\quad \\text{Im}(f^{-1}) = \\text{dom}(f)$',
          },
          { text: '$(f^{-1})^{-1} = f$' },
          { text: '$(a ; b) \\in$ graphe de $f \\iff (b ; a) \\in$ graphe de $f^{-1}$', condition: 'symétrie par rapport à $y = x$' },
          {
            text: '$f(x) = \\dfrac{ax+b}{cx+d} \\implies f^{-1}(x) = \\dfrac{-dx+b}{cx-a}$',
            condition: 'si $ad - bc \\neq 0$',
          },
          {
            text: "$(f^{-1})'(x) = \\dfrac{1}{f'(f^{-1}(x))}$",
            condition: "$f$ continue et strictement monotone sur un intervalle, $f'(f^{-1}(x)) \\neq 0$",
          },
          { text: "$(f^{-1})'(f(a)) = \\dfrac{1}{f'(a)}$", condition: "mêmes hypothèses, $f'(a) \\neq 0$" },
        ],
      },
      {
        title: 'Restrictions bijectives et caractérisation',
        formulas: [
          {
            text: 'sin sur $[-\\pi/2;\\pi/2]$ $\\to$ arcsin',
            condition: 'dom $[-1;1]$, image $[-\\pi/2;\\pi/2]$',
          },
          {
            text: 'cos sur $[0;\\pi]$ $\\to$ arccos',
            condition: 'dom $[-1;1]$, image $[0;\\pi]$',
          },
          {
            text: 'tan sur $]-\\pi/2;\\pi/2[$ $\\to$ arctan',
            condition: 'dom $\\mathbb{R}$, image $]-\\pi/2;\\pi/2[$',
          },
          { text: '$y = \\arcsin(x) \\iff \\sin(y) = x$ et $y \\in [-\\pi/2 ; \\pi/2]$', condition: 'pour $x \\in [-1;1]$' },
          { text: '$y = \\arccos(x) \\iff \\cos(y) = x$ et $y \\in [0 ; \\pi]$', condition: 'pour $x \\in [-1;1]$' },
          { text: '$y = \\arctan(x) \\iff \\tan(y) = x$ et $y \\in \\; ]-\\pi/2 ; \\pi/2[$', condition: 'pour $x \\in \\mathbb{R}$' },
          {
            text: '$\\displaystyle\\lim_{x \\to -\\infty} \\arctan(x) = -\\dfrac{\\pi}{2} \\quad \\displaystyle\\lim_{x \\to +\\infty} \\arctan(x) = \\dfrac{\\pi}{2}$',
            condition: 'asymptotes $y = \\pm\\pi/2$',
          },
        ],
      },
      {
        title: 'Parité et valeurs remarquables',
        formulas: [
          {
            text: '$\\arcsin(-x) = -\\arcsin(x) \\quad \\arctan(-x) = -\\arctan(x)$',
            condition: 'arcsin et arctan sont impaires',
          },
          { text: '$\\arccos(-x) = \\pi - \\arccos(x)$', condition: 'pour $x \\in [-1;1]$' },
          { text: '$\\arcsin\\dfrac{1}{2} = \\dfrac{\\pi}{6} \\quad \\arcsin\\dfrac{\\sqrt{2}}{2} = \\dfrac{\\pi}{4} \\quad \\arcsin\\dfrac{\\sqrt{3}}{2} = \\dfrac{\\pi}{3}$' },
          { text: '$\\arccos\\dfrac{1}{2} = \\dfrac{\\pi}{3} \\quad \\arccos\\left(-\\dfrac{1}{2}\\right) = \\dfrac{2\\pi}{3} \\quad \\arccos(-1) = \\pi$' },
          { text: '$\\arctan 1 = \\dfrac{\\pi}{4} \\quad \\arctan \\sqrt{3} = \\dfrac{\\pi}{3} \\quad \\arctan\\dfrac{\\sqrt{3}}{3} = \\dfrac{\\pi}{6}$' },
        ],
      },
      {
        title: 'Composer arcfonction et fonction trigonométrique',
        formulas: [
          { text: '$\\sin(\\arcsin x) = x \\quad \\cos(\\arccos x) = x$', condition: 'pour tout $x \\in [-1;1]$' },
          { text: '$\\tan(\\arctan x) = x$', condition: 'pour tout $x \\in \\mathbb{R}$' },
          { text: '$\\arcsin(\\sin\\theta) = \\theta$', condition: 'seulement si $\\theta \\in [-\\pi/2 ; \\pi/2]$' },
          { text: '$\\arccos(\\cos\\theta) = \\theta$', condition: 'seulement si $\\theta \\in [0 ; \\pi]$' },
          { text: '$\\arctan(\\tan\\theta) = \\theta$', condition: 'seulement si $\\theta \\in \\; ]-\\pi/2 ; \\pi/2[$' },
          { text: '$\\cos(\\arcsin x) = \\sqrt{1-x^2} \\quad \\sin(\\arccos x) = \\sqrt{1-x^2}$', condition: 'pour $x \\in [-1;1]$' },
          { text: '$\\tan(\\arcsin x) = \\dfrac{x}{\\sqrt{1-x^2}}$', condition: 'pour $x \\in \\; ]-1;1[$' },
          { text: '$\\tan(\\arccos x) = \\dfrac{\\sqrt{1-x^2}}{x}$', condition: 'pour $x \\in [-1;1]$, $x \\neq 0$' },
          { text: '$\\cos(\\arctan x) = \\dfrac{1}{\\sqrt{1+x^2}} \\quad \\sin(\\arctan x) = \\dfrac{x}{\\sqrt{1+x^2}}$', condition: 'pour tout $x \\in \\mathbb{R}$' },
        ],
      },
      {
        title: 'Équations cyclométriques',
        formulas: [
          { text: 'arcsin($u$), arccos($u$) existent', condition: 'ssi $u \\in [-1;1]$' },
          { text: 'arctan($u$) existe', condition: 'pour tout $u \\in \\mathbb{R}$' },
          { text: '$\\arcsin(u) + \\arccos(u) = \\pi/2$', condition: 'pour tout $u \\in [-1;1]$' },
          { text: '$\\arcsin(A)=\\arcsin(B) \\iff A=B$', condition: 'si $A$, $B$ respectent la CE' },
          { text: '$\\arccos(A)=\\arccos(B) \\iff A=B$', condition: 'si $A$, $B$ respectent la CE' },
          { text: '$\\arctan(A)=\\arctan(B) \\iff A=B$', condition: 'sans CE' },
          { text: '$\\arcsin(u) = \\alpha \\iff u = \\sin(\\alpha)$', condition: 'si $\\alpha \\in [-\\pi/2;\\pi/2]$ ; sinon aucune solution' },
          { text: '$\\arcsin(A) = \\arccos(B) \\implies A \\ge 0$ et $B \\ge 0$', condition: 'compatibilité des images' },
        ],
      },
      {
        title: 'Dérivées des fonctions cyclométriques',
        formulas: [
          { text: "$(\\arcsin u)' = \\dfrac{u'}{\\sqrt{1-u^2}}$", condition: 'là où $u \\in \\; ]-1;1[$' },
          { text: "$(\\arccos u)' = -\\dfrac{u'}{\\sqrt{1-u^2}}$", condition: 'là où $u \\in \\; ]-1;1[$' },
          { text: "$(\\arctan u)' = \\dfrac{u'}{1+u^2}$", condition: 'partout où $u$ est dérivable' },
          { text: '$\\arctan(x) + \\arctan\\left(\\dfrac{1}{x}\\right) = \\dfrac{\\pi}{2}$', condition: 'pour $x > 0$' },
        ],
      },
      {
        title: 'Fonctions transformées',
        formulas: [
          { text: 'dom de $c + k\\arcsin(mx+n)$ : $-1 \\le mx + n \\le 1$', condition: 'de même pour arccos ; $\\mathbb{R}$ pour arctan' },
          { text: 'image de $c + k\\arcsin(mx+n)$ : $\\left[c - |k|\\dfrac{\\pi}{2} ; c + |k|\\dfrac{\\pi}{2}\\right]$' },
          { text: 'asymptotes de $c + k\\arctan(mx+n)$ : $y = c \\pm k\\dfrac{\\pi}{2}$' },
          { text: 'centre de symétrie de $c + k\\arcsin(mx+n)$ : $\\left(-\\dfrac{n}{m} ; c\\right)$', condition: 'de même pour arctan' },
        ],
      },
      {
        title: 'Étude de fonction',
        formulas: [
          { text: 'domaine → parité → limites et asymptotes → dérivée et signe → variations → graphe' },
          {
            text: 'asymptote oblique $y = ax + b$ : $a = \\displaystyle\\lim_{x \\to \\infty} \\dfrac{f(x)}{x}$, $b = \\displaystyle\\lim_{x \\to \\infty} \\big(f(x) - ax\\big)$',
          },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Fonction', 'Domaine → image ; dérivée'],
      rows: [
        ['arcsin($u$)', "$[-1 ; 1] \\to \\left[-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right]$ ; $\\dfrac{u'}{\\sqrt{1-u^2}}$"],
        ['arccos($u$)', "$[-1 ; 1] \\to [0 ; \\pi]$ ; $-\\dfrac{u'}{\\sqrt{1-u^2}}$"],
        ['arctan($u$)', "$\\mathbb{R} \\to \\left]-\\frac{\\pi}{2} ; \\frac{\\pi}{2}\\right[$ ; $\\dfrac{u'}{1+u^2}$"],
      ],
    },
    forward:
      'À connaître aussi : $\\arcsin(u) + \\arccos(u) = \\pi/2$ pour tout $u \\in [-1;1]$, et ' +
      '$\\arcsin(\\sin\\theta) = \\theta$ **seulement** si $\\theta \\in [-\\pi/2 ; \\pi/2]$.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai/faux : réviser tout le chapitre',
      generatorId: '6gen64',
      description: [
        'Choisis un thème et teste-toi sur tout le chapitre : affirmations pré-écrites, une ' +
          'seule tentative par question, justification toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 64. Quiz vrai/faux — Fonctions réciproques et cyclométriques »',
    },
  },
}
