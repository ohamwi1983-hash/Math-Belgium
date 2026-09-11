import type { ChapterContent } from '../../types'

const PI = Math.PI

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
      blocks: [
        { kind: 'video', title: 'Fonctions réciproques & cyclométriques' },
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
            '$f$ est **bijective** sur $B$ si elle est les deux à la fois : injective ET ' +
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
              caption: 'Bijective : injective ET surjective — chaque élément de B est atteint exactement une fois.',
            },
          ],
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
              compact: true,
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
              compact: true,
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
            compact: true,
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
            compact: true,
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
          label: 'Démonstration — les deux propriétés ci-dessus',
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
          kind: 'methode',
          label: 'Méthode 2 — permutation',
          items: ['Dans $y = f(x)$, permute $x$ et $y$, puis isole $y$.'],
        },
        {
          kind: 'exempleLibre',
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
            'Cas particulier des fonctions homographiques $f(x) = \\dfrac{ax+b}{cx+d}$ : la même ' +
            'méthode donne $f^{-1}(x) = \\dfrac{-dx+b}{cx-a}$, et $f^{-1} = f$ exactement quand $a = -d$.',
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
                compact: true,
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
                compact: true,
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
          kind: 'methode',
          items: [
            "Si $f$ est injective, dérivable en $f^{-1}(x)$, et si $f'(f^{-1}(x)) \\neq 0$, alors :",
            '$(f^{-1})\'(x) = \\dfrac{1}{f\'(f^{-1}(x))}$',
            'Les nombres dérivés de $f$ en $a$ et de $f^{-1}$ en $f(a)$ sont donc inverses ' +
              "l'un de l'autre — ce théorème explique les formules d'arcsin, arccos et arctan " +
              'de la section 4.',
          ],
        },
        {
          kind: 'para',
          text:
            'Ce théorème est **admis sans démonstration** : c\'est le seul résultat du chapitre ' +
            'qui ne soit pas établi ici. Tu peux quand même le vérifier sur des cas où les ' +
            'deux membres se calculent séparément — c\'est tout l\'objet de la vérification ' +
            'croisée ci-dessous.',
        },
        {
          kind: 'exempleLibre',
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
                compact: true,
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
          kind: 'entrainement',
          title: 'Fonctions injectives / surjectives / bijectives',
          generatorId: '6gen1',
          description: [
            "Détermine si une fonction est injective, surjective ou bijective, retrouve sa " +
              "réciproque par décomposition ou permutation, et calcule sa dérivée au point voulu.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 1. Fonctions injectives / surjectives / bijectives »',
        },
      ],
    },
    {
      id: 'cyclometriques',
      number: 2,
      title: 'Les fonctions cyclométriques : arcsin, arccos, arctan',
      blocks: [
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
            compact: true,
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
            compact: true,
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
            compact: true,
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
          headers: ['Fonction', 'Restriction bijective', 'Réciproque', 'Domaine', 'Image'],
          rows: [
            ['sin', '[−π/2 ; π/2]', 'arcsin', '[−1 ; 1]', '[−π/2 ; π/2]'],
            ['cos', '[0 ; π]', 'arccos', '[−1 ; 1]', '[0 ; π]'],
            ['tan', ']−π/2 ; π/2[', 'arctan', 'ℝ', ']−π/2 ; π/2['],
          ],
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
            compact: true,
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
              caption: "y = arcsin(x) : l'arc, mesuré depuis 0, dont l'ordonnée du point d'arrivée vaut x.",
            },
            {
              kind: 'unitCircleArc',
              mode: 'cos',
              angle: 0.75,
              caption: "y = arccos(x) : l'arc, mesuré depuis 0, dont l'abscisse du point d'arrivée vaut x.",
            },
            {
              kind: 'unitCircleArc',
              mode: 'tan',
              angle: Math.atan(0.9),
              caption: "y = arctan(x) : l'arc dont la tangente géométrique (droite verticale) vaut x.",
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
        {
          kind: 'definition',
          label: 'Caractérisation',
          items: [
            '$\\forall x \\in [-1;1], \\forall y \\in \\mathbb{R} : \\quad y = \\arcsin(x) \\iff x = \\sin(y)$ et $y \\in [-\\pi/2 ; \\pi/2]$',
            '$y = \\arccos(x) \\iff x = \\cos(y)$ et $y \\in [0 ; \\pi]$',
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
            compact: true,
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
            caption: 'y = arcsin(x) — domaine [−1 ; 1], image [−π/2 ; π/2].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            caption: 'y = arccos(x) — domaine [−1 ; 1], image [0 ; π].',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            caption: 'y = arctan(x) — domaine ℝ, image ]−π/2 ; π/2[ (asymptotes en pointillés).',
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
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arcsin est impaire',
          blocks: [
            { kind: 'para', text: 'Soit $f(x) = \\arcsin(x)$. Montre que $f(-x) = -f(x)$.' },
            {
              kind: 'para',
              text:
                '$f(-x) = \\arcsin(-x) \\underset{\\text{déf}}{\\iff} \\sin(f(-x)) = ' +
                '\\sin(\\arcsin(-x)) \\underset{\\text{calc}}{\\iff} \\sin(f(-x)) = -x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} -\\sin(f(-x)) = x \\underset{\\text{sin impaire}}' +
                '{\\iff} \\sin(-f(-x)) = x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\arcsin(\\sin(-f(-x))) = \\arcsin(x) ' +
                '\\underset{\\text{calc}}{\\iff} -f(-x) = \\arcsin(x) = f(x)$',
            },
            { kind: 'para', text: 'D\'où $f(-x) = -f(x)$ : arcsin est bien impaire.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arccos(x) + arccos(−x) = π',
          blocks: [
            { kind: 'para', text: 'Soit $y = \\arccos(-x)$.' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\cos(y) = \\cos(\\arccos(-x)) ' +
                '\\underset{\\text{calc}}{\\iff} \\cos(y) = -x \\underset{\\text{calc}}{\\iff} -\\cos(y) = x$',
            },
            { kind: 'para', text: '$\\iff \\cos(\\pi - y) = x$' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} \\arccos(\\cos(\\pi-y)) = \\arccos(x) ' +
                '\\underset{\\text{déf}}{\\iff} \\pi - y = \\arccos(x)$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} y = \\pi - \\arccos(x) \\iff \\arccos(-x) = \\pi - \\arccos(x)$',
            },
            { kind: 'para', text: 'D\'où $\\arccos(x) + \\arccos(-x) = \\pi$.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — arctan est impaire',
          blocks: [
            { kind: 'para', text: 'Soit $f(x) = \\arctan(x)$. Même structure que pour arcsin :' },
            {
              kind: 'para',
              text:
                '$f(-x) = \\arctan(-x) \\underset{\\text{déf}}{\\iff} \\tan(f(-x)) = ' +
                '\\tan(\\arctan(-x)) \\underset{\\text{calc}}{\\iff} \\tan(f(-x)) = -x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} -\\tan(f(-x)) = x \\underset{\\text{tan impaire}}' +
                '{\\iff} \\tan(-f(-x)) = x$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\arctan(\\tan(-f(-x))) = \\arctan(x) ' +
                '\\underset{\\text{calc}}{\\iff} -f(-x) = \\arctan(x) = f(x)$',
            },
            { kind: 'para', text: 'D\'où $f(-x) = -f(x)$ : arctan est bien impaire.' },
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
        {
          kind: 'astuce',
          label: '💡 Valeurs remarquables (sans calculatrice)',
          text:
            '$\\arcsin(0) = 0 \\quad \\arcsin(\\frac{\\sqrt{2}}{2}) = \\pi/4 \\quad ' +
            '\\arcsin(-\\frac{\\sqrt{3}}{2}) = -\\pi/3 \\quad \\arcsin(-1) = -\\pi/2$',
          items: ['$\\arcsin(2)$ n\'existe pas : $2 \\notin [-1;1]$ (hors du domaine).'],
        },
        {
          kind: 'entrainement',
          title: 'arcsin, arccos, arctan',
          generatorId: '6gen2',
          description: [
            'Identifie la restriction bijective correspondant à chaque arcfonction, calcule des ' +
              'valeurs remarquables sans calculatrice, et relie domaine/image à chaque fonction.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 2. arcsin, arccos, arctan »',
        },
      ],
    },
    {
      id: 'equations',
      number: 3,
      title: 'Équations avec fonctions cyclométriques',
      blocks: [
        {
          kind: 'methode',
          label: "Condition d'existence",
          items: [
            'arcsin($u$) et arccos($u$) n\'existent que si $u \\in [-1;1]$.',
            'arctan($u$) existe pour tout $u \\in \\mathbb{R}$ — **aucune CE** à poser.',
          ],
        },
        {
          kind: 'para',
          text:
            'arcsin et arccos sont injectives sur leur domaine : deux images égales entraînent ' +
            'que les arguments eux-mêmes sont égaux.',
        },
        { kind: 'para', text: '$\\arcsin(A) = \\arcsin(B) \\iff A = B \\quad$ (si A, B respectent la CE)' },
        { kind: 'para', text: '$\\arccos(A) = \\arccos(B) \\iff A = B \\quad$ (si A, B respectent la CE)' },
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
          label: 'Démonstration',
          blocks: [
            { kind: 'para', text: 'Soit $y = \\arccos(x)$.' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{déf}}{\\iff} \\cos(y) = \\cos(\\arccos(x)) ' +
                '\\underset{\\text{calc}}{\\iff} \\cos(y) = x$',
            },
            { kind: 'para', text: '$\\underset{\\text{calc}}{\\iff} \\sin(\\pi/2 - y) = x$' },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} \\arcsin(\\sin(\\pi/2-y)) = \\arcsin(x) ' +
                '\\underset{\\text{calc}}{\\iff} \\pi/2 - y = \\arcsin(x)$',
            },
            {
              kind: 'para',
              text:
                '$\\underset{\\text{calc}}{\\iff} y = \\pi/2 - \\arcsin(x) \\iff \\arccos(x) = \\pi/2 - \\arcsin(x)$',
            },
            { kind: 'para', text: 'D\'où $\\arccos(x) + \\arcsin(x) = \\pi/2$.' },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode en 3 temps',
          items: [
            "1) Pose la CE de chaque arcfonction. 2) Résous l'équation « simplifiée » " +
              "obtenue en enlevant les arcfonctions. 3) Vérifie que la solution trouvée " +
              'appartient bien à la CE — sinon, rejette-la.',
          ],
        },
        {
          kind: 'exempleLibre',
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
          kind: 'entrainement',
          title: 'Équations avec fonctions cyclométriques',
          generatorId: '6gen3',
          description: [
            'Résous des équations combinant arcsin, arccos et arctan, en posant systématiquement ' +
              'la condition d\'existence puis en la confrontant à la solution trouvée.',
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
      blocks: [
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
          kind: 'piege',
          text:
            'Attention au signe **moins** devant la dérivée de arccos : c\'est la seule des ' +
            "trois qui est négative ! Comme pour toute composée, n'oublie pas de multiplier " +
            "par $u'(x)$ (règle de la chaîne).",
        },
        { kind: 'subheading', text: 'Pour aller plus loin — d\'où viennent ces trois formules ?' },
        {
          kind: 'para',
          text:
            'Les trois formules du tableau se démontrent toutes de la même façon, en trois ' +
            'temps : appliquer le théorème de la dérivée d\'une réciproque (section 1), faire ' +
            'disparaître la fonction trigonométrique parasite grâce à ' +
            '$\\cos^2 + \\sin^2 = 1$, puis **choisir le bon signe** en regardant sur quel ' +
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
          label: 'Démonstration 1 (rapide) — dérivée de arccos par l\'identité complémentaire',
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
          label: 'Démonstration 2 (méthode directe) — dérivée de arccos',
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
                '**Premier cas — la dérivée supposée est non nulle**, $\\arcsin\'(1) \\neq 0$. ' +
                'arcsin est injective et, par la ' +
                'propriété $(f^{-1})^{-1} = f$ de la section 1, sa propre réciproque est ' +
                '$\\sin|_{[-\\pi/2;\\pi/2]}$. Le théorème de la dérivée d\'une réciproque, ' +
                'appliqué cette fois à arcsin au point $\\pi/2$, donne :',
            },
            {
              kind: 'para',
              text:
                '$\\left(\\sin|_{[-\\pi/2;\\pi/2]}\\right)\'\\!\\left(\\frac{\\pi}{2}\\right) = ' +
                '\\dfrac{1}{\\arcsin\'\\!\\left(\\sin\\frac{\\pi}{2}\\right)} = ' +
                '\\dfrac{1}{\\arcsin\'(1)}$',
            },
            {
              kind: 'para',
              text:
                'L\'inverse d\'un réel non nul n\'est jamais nul, donc ce nombre est différent ' +
                'de 0. Or on sait le calculer autrement : ' +
                '$\\left(\\sin|_{[-\\pi/2;\\pi/2]}\\right)\'(\\pi/2) = \\cos(\\pi/2) = 0$. Le ' +
                'même nombre serait à la fois nul et non nul : contradiction.',
            },
            {
              kind: 'para',
              text:
                '**Second cas — la dérivée supposée est nulle**, $\\arcsin\'(1) = 0$. Le ' +
                'théorème ne s\'applique plus, mais ' +
                'une ligne suffit : en dérivant en $x = 1$ l\'identité ' +
                '$\\sin(\\arcsin(x)) = x$ (valable sur tout $[-1;1]$), la règle de la chaîne ' +
                'donne $\\cos(\\arcsin(1)) \\cdot \\arcsin\'(1) = 1$, c\'est-à-dire ' +
                '$\\cos(\\pi/2) \\cdot \\arcsin\'(1) = 1$, soit $0 = 1$. Absurde.',
            },
            {
              kind: 'para',
              text:
                'Ce second calcul couvre d\'ailleurs les deux cas à lui seul : quelle que soit ' +
                'la valeur supposée de $\\arcsin\'(1)$, la multiplier par ' +
                '$\\cos(\\pi/2) = 0$ ne pourra jamais donner 1.',
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
        { kind: 'subheading', text: 'Exemple résolu — dérivée composée' },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: '$(\\arcsin(2x-1))\'$' },
            { kind: 'para', text: 'Règle de la chaîne avec $u = 2x-1$, $u\' = 2$ :' },
            {
              kind: 'para',
              text:
                '$(\\arcsin(2x-1))\' = \\dfrac{2}{\\sqrt{1-(2x-1)^2}} = \\dfrac{2}{\\sqrt{-4x^2+4x}} = \\dfrac{1}{\\sqrt{-x^2+x}}$',
            },
          ],
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
      ],
    },
    {
      id: 'graphiques',
      number: 5,
      title: 'Reconnaître une fonction cyclométrique à son graphe',
      blocks: [
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
        { kind: 'para', text: 'Les trois graphes de référence à mémoriser :' },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            caption: 'y = arcsin(x)',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            caption: 'y = arccos(x)',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
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
            caption: 'y = arctan(x)',
          },
        },
        {
          kind: 'entrainement',
          title: 'Associer graphique et expression',
          generatorId: '6gen5',
          description: [
            "Identifie la bonne arcfonction à partir d'un graphe inconnu, en s'appuyant sur le " +
              'domaine, le sens de variation et la présence éventuelle d\'asymptotes.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 5. Associer graphique et expression »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Fonction', 'Domaine', 'Image', 'Dérivée (en u)'],
      rows: [
        ['arcsin($u$)', '[−1 ; 1]', '[−π/2 ; π/2]', "$\\dfrac{u'}{\\sqrt{1-u^2}}$"],
        ['arccos($u$)', '[−1 ; 1]', '[0 ; π]', "$-\\dfrac{u'}{\\sqrt{1-u^2}}$"],
        ['arctan($u$)', 'ℝ', ']−π/2 ; π/2[', "$\\dfrac{u'}{1+u^2}$"],
      ],
    },
    forward: 'Identité à connaître : $\\arcsin(u) + \\arccos(u) = \\pi/2$ pour tout $u \\in [-1;1]$.',
  },
}
