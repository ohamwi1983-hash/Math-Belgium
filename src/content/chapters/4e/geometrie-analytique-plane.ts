import type { ChapterContent } from '../../types'

export const geometrieAnalytiquePlane: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 7,
  title: 'Géométrie analytique plane',
  slug: 'geometrie-analytique-plane',
  lede:
    "Dans ce chapitre, tu vas décrire une figure géométrique avec des nombres — pas seulement " +
    "avec un dessin. Une droite devient une équation à deux inconnues. Un cercle devient une " +
    "relation entre x et y. Une parabole devient l'ensemble des points situés à la même distance " +
    "d'un point et d'une droite. Une fois cette traduction faite, tu n'as plus besoin de dessiner " +
    "à l'œil : calculer une intersection, une distance ou un lien entre deux figures devient une " +
    "question d'algèbre.",

  sections: [
    {
      id: 'reperer',
      number: 1,
      title: 'Décrire une droite : point et vecteur directeur',
      kicker: "5 façons de donner une droite → un point + un vecteur directeur → 4 façons de l'écrire",
      titreCourt: 'Point et vecteur directeur',
      partie: 'Écrire, lire et tracer une droite',
      essentiel: [
        'Une droite est déterminée par **un point** et **un vecteur directeur** $\\vec{u}$ non nul : deux points A et B donnent $\\vec{AB}$, une pente m donne $\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$.',
        'Quatre écritures : implicite $ax + by + c = 0$ (vecteur directeur $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$), explicite $y = mx + p$, explicite $x = ny + q$, paramétrique (une équation par variable, le même paramètre t).',
        'Une verticale n\'a pas de forme $y = mx + p$, une horizontale pas de forme $x = ny + q$ ; l\'implicite et la paramétrique existent toujours.',
      ],
      cartes: [
        { question: 'Donne un vecteur directeur de la droite $ax + by + c = 0$.', reponse: '$\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$, ou n\'importe quel multiple non nul.' },
        { question: 'Quel vecteur directeur pour une droite de pente m ?', reponse: '$\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$.' },
        { question: 'Quelles écritures existent toujours, même pour une droite verticale ?', reponse: 'L\'implicite et la paramétrique.' },
        { question: 'Écris la paramétrique de la droite par A(1 ; 1), de vecteur directeur $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$.', reponse: '$\\begin{cases} x = 1+2t \\\\ y = 1+t \\end{cases}$' },
      ],
      blocks: [
        { kind: 'video', title: 'Décrire une droite : point, vecteur directeur et 4 formes d\'équation', youtubeId: 'OkLInSNqf-Q' },
        {
          kind: 'para',
          text:
            'Une droite est entièrement déterminée par deux choses : **un point qu\'elle ' +
            'traverse**, et **une direction**. Cette direction, c\'est un vecteur directeur ' +
            '$\\vec{u}$, non nul, porté par la droite. L\'énoncé peut te donner cette ' +
            'information de plusieurs façons : deux points, un point et un vecteur, un point et ' +
            'un angle, un point et une pente. Peu importe le point de départ ! La première étape ' +
            'est toujours la même : ramener ça à un point et un vecteur directeur. C\'est la ' +
            'seule vérité géométrique de la droite.',
        },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ça',
          text:
            'Ce vecteur directeur $\\vec{u}$, c\'est exactement celui du chapitre sur le calcul ' +
            "vectoriel — une flèche qui porte une direction, rien de plus. Tu ne réapprends rien " +
            "de nouveau ici : tu l'utilises juste pour une seule chose, dire dans quel sens une " +
            'droite s\'étire. Un point de départ et une direction : c\'est tout ce qu\'il faut ' +
            'pour reconstruire une droite entière, comme deux repères suffisent à reconstruire ' +
            'un trajet parfaitement rectiligne.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5,
            xMax: 8,
            yMin: -0.7,
            yMax: 4,
            showAxes: false,
            vectors: [
              { from: { x: -2, y: 0 }, to: { x: 7.6, y: 3.2 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 1, y: 1 }, to: { x: 3.4, y: 1.8 }, tone: 'accent' },
            ],
            points: [
              { x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 3.6, y: 2, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
              { x: 7.7, y: 3.3, label: 'd', tone: 'ink', node: false },
            ],
            caption:
              "la droite d (pointillés) est fixée par A et par la direction de $\\vec{u}$ : un " +
              "multiple de $\\vec{u}$ reste porté par d, un vecteur non parallèle à d, jamais",
          },
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 6.5,
              yMin: -0.5,
              yMax: 4,
              showAxes: false,
              vectors: [
                { from: { x: 0, y: 0.5 }, to: { x: 6, y: 3.5 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 1, y: 1 }, to: { x: 5, y: 3 }, tone: 'accent' },
              ],
              points: [
                { x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'below' },
                { x: 5, y: 3, label: 'B', tone: 'ink', labelPos: 'above' },
              ],
              caption: 'deux points → $\\vec{AB}$',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 6,
              yMin: -0.5,
              yMax: 3.2,
              showAxes: false,
              vectors: [
                { from: { x: -0.3, y: 0 }, to: { x: 5.5, y: 0 }, tone: 'faint', arrow: false },
                { from: { x: 0.3, y: 0 }, to: { x: 3.58, y: 2.29 }, tone: 'accent' },
              ],
              points: [{ x: 0.3, y: 0, label: 'A', tone: 'ink', labelPos: 'below' }],
              angleArcs: [{ cx: 0.3, cy: 0, fromDeg: 0, toDeg: 35, radiusPx: 20, label: 'θ', tone: 'attn' }],
              caption: 'point + angle θ → $\\begin{pmatrix} \\cos\\theta \\\\ \\sin\\theta \\end{pmatrix}$',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.3,
              xMax: 6,
              yMin: -0.3,
              yMax: 4,
              showAxes: false,
              vectors: [
                { from: { x: 0.3, y: 0.5 }, to: { x: 5.3, y: 3.5 }, tone: 'accent' },
                { from: { x: 2.8, y: 2 }, to: { x: 3.8, y: 2 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 3.8, y: 2 }, to: { x: 3.8, y: 2.6 }, tone: 'faint', dashed: true, arrow: false },
              ],
              points: [
                { x: 0.3, y: 0.5, label: 'A', tone: 'ink', labelPos: 'below' },
                { x: 3.3, y: 1.8, label: '1', tone: 'ink', node: false, labelPos: 'below' },
                { x: 4.05, y: 2.3, label: 'm', tone: 'ink', node: false, labelPos: 'right' },
              ],
              caption: 'point + pente m → $\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$',
            },
          ],
        },
        { kind: 'subheading', text: '5 types de données de départ' },
        {
          kind: 'featureTable',
          headers: ['Donnée fournie', 'Vecteur directeur obtenu'],
          rows: [
            ['Deux points A, B', '$\\vec{AB} = \\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$'],
            ['Un point et un vecteur', 'le vecteur donné, tel quel'],
            ['Un point et un angle avec Ox', '$(\\cos\\theta ; \\sin\\theta)$, ramené à des coordonnées exactes pour un angle remarquable'],
            ['Un point et un angle α avec Oy', '$(\\sin\\alpha ; \\cos\\alpha)$ — même principe, l\'angle avec Ox valant alors 90° − α (α se mesure depuis le demi-axe positif de Oy, voir section 3)'],
            ['Un point et une pente m', '$\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'point et angle de 30° avec Oy',
          formula: 'La droite d passe par A(2 ; −1) et forme un angle de 30° avec Oy. Trouve un vecteur directeur à coordonnées exactes, puis une équation de d.',
          steps: [
            { tag: 'vecteur (sin α ; cos α)', text: '$\\alpha = 30^{\\circ}$ : $\\begin{pmatrix} \\sin 30^{\\circ} \\\\ \\cos 30^{\\circ} \\end{pmatrix} = \\begin{pmatrix} \\frac{1}{2} \\\\ \\frac{\\sqrt{3}}{2} \\end{pmatrix}$' },
            { tag: 'sans fraction', text: 'on multiplie par 2 : $\\vec{u} = \\begin{pmatrix} 1 \\\\ \\sqrt{3} \\end{pmatrix}$, donc la pente vaut $m = \\sqrt{3}$ — l\'angle avec Ox vaut bien $90^{\\circ} - 30^{\\circ} = 60^{\\circ}$, et $\\tan 60^{\\circ} = \\sqrt{3}$' },
            { tag: 'équation', text: '$y + 1 = \\sqrt{3}\\,(x - 2)$, soit $y = \\sqrt{3}\\,x - 2\\sqrt{3} - 1$' },
          ],
          result: { tag: 'implicite', text: '$\\sqrt{3}\\,x - y - 2\\sqrt{3} - 1 = 0$' },
        },
        { kind: 'subheading', text: '4 façons d\'écrire la même droite' },
        {
          kind: 'para',
          text:
            'Tu connais un point et le vecteur directeur ? Alors tu peux écrire la même droite ' +
            'de 4 façons différentes. Chacune est utile dans un contexte différent.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la forme paramétrique, depuis l\'équation vectorielle',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit d la droite qui passe par $A(x_0\\,;\\,y_0)$ et de vecteur directeur ' +
                '$\\vec{u}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$, non nul. Un point $M(x\\,;\\,y)$ est sur d ' +
                'exactement quand $\\vec{AM}$ et $\\vec{u}$ sont colinéaires, c\'est-à-dire quand il existe un ' +
                'réel t tel que $\\vec{AM} = t \\cdot \\vec{u}$ : c\'est l\'**équation vectorielle** de la droite.',
            },
            {
              kind: 'para',
              text:
                'Composante par composante : $\\begin{pmatrix} x-x_0 \\\\ y-y_0 \\end{pmatrix} = ' +
                '\\begin{pmatrix} t \\cdot a \\\\ t \\cdot b \\end{pmatrix}$, donc $x - x_0 = t \\cdot a$ et ' +
                '$y - y_0 = t \\cdot b$.',
            },
            {
              kind: 'para',
              text:
                'On isole x et y : $\\begin{cases} x = x_0+t \\cdot a \\\\ y = y_0+t \\cdot b \\end{cases}$, avec ' +
                'le même paramètre t dans les deux équations. Chaque valeur de t donne un point de d, et ' +
                'chaque point de d est obtenu pour une valeur de t.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Les 4 formes',
          items: [
            '**Implicite** — $a \\cdot x + b \\cdot y + c = 0$. Le vecteur $\\begin{pmatrix} a ' +
              '\\\\ b \\end{pmatrix}$ est un vecteur **normal** : il est perpendiculaire au ' +
              'vecteur directeur $\\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}$. Tu peux ' +
              'prendre $a=-\\beta$, $b=\\alpha$. Dans l\'autre sens, la droite $ax+by+c=0$ admet ' +
              'le vecteur directeur $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ (ou n\'importe quel ' +
              'multiple non nul, comme $\\begin{pmatrix} b \\\\ -a \\end{pmatrix}$). Cette forme est ' +
              "**toujours possible**, pour n'importe quelle droite.",
            '**Explicite en y** — $y = m \\cdot x + p$ (m = pente, p = ordonnée à l\'origine). ' +
              '**Impossible** si la droite est verticale, c\'est-à-dire si son vecteur directeur ' +
              'est $\\begin{pmatrix} 0 \\\\ \\beta \\end{pmatrix}$.',
            '**Explicite en x** — $x = n \\cdot y + q$. **Impossible** si la droite est ' +
              'horizontale, c\'est-à-dire si son vecteur directeur est $\\begin{pmatrix} \\alpha ' +
              '\\\\ 0 \\end{pmatrix}$.',
            '**Paramétrique** — $\\begin{cases} x = x_0+t \\cdot \\alpha \\\\ y = y_0+t \\cdot ' +
              '\\beta \\end{cases}$. Une équation par variable, avec le même paramètre t dans les ' +
              'deux. **Toujours possible**, même pour une verticale ou une horizontale.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi (−b ; a) dirige la droite ax + by + c = 0',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $d : ax + by + c = 0$, avec a et b non tous deux nuls (sinon ce n\'est pas une droite). ' +
                'Prends deux points distincts de d, $M_1(x_1\\,;\\,y_1)$ et $M_2(x_2\\,;\\,y_2)$ : ' +
                '$ax_1 + by_1 + c = 0$ et $ax_2 + by_2 + c = 0$.',
            },
            {
              kind: 'para',
              text:
                'On soustrait ces deux égalités : c disparaît, et il reste $a(x_2-x_1) + b(y_2-y_1) = 0$.',
            },
            {
              kind: 'para',
              text:
                'Compare le vecteur directeur $\\vec{M_1M_2}\\begin{pmatrix} x_2-x_1 \\\\ y_2-y_1 \\end{pmatrix}$ ' +
                'au vecteur $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ par le critère de colinéarité : ' +
                '$(x_2-x_1) \\cdot a - (y_2-y_1) \\cdot (-b) = a(x_2-x_1) + b(y_2-y_1) = 0$.',
            },
            {
              kind: 'para',
              text:
                'Les deux vecteurs sont donc colinéaires, et $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ n\'est pas ' +
                'nul : c\'est un vecteur directeur de d. Au passage, l\'égalité de l\'étape 2 dit aussi que ' +
                '$\\vec{M_1M_2}$ est orthogonal à $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ : c\'est pour cela qu\'on ' +
                'appelle ce vecteur le vecteur **normal** de d.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Verticale et horizontale — les deux cas particuliers',
          text:
            'Une droite **verticale** ($x = $ constante) n\'a pas de pente. Elle n\'a pas non ' +
            'plus de forme explicite en y. Une droite **horizontale** ($y = $ constante) n\'a ' +
            'pas de forme explicite en x. Mais dans les deux cas, l\'implicite et la ' +
            'paramétrique marchent toujours ! Ce sont les deux seules formes qui ne demandent ' +
            'jamais aucune condition.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1,
            xMax: 5,
            yMin: -1,
            yMax: 4,
            grid: true,
            vectors: [{ from: { x: 1, y: 1 }, to: { x: 3, y: 2 }, tone: 'accent' }],
            points: [
              { x: 1, y: 1, label: 'A(1 ; 1)', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 2, label: 'B(3 ; 2)', tone: 'ink', labelPos: 'above' },
              { x: 2.2, y: 1.75, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
            ],
            caption:
              'B = A + $\\vec{u}$, avec $\\vec{u} = \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ — ' +
              "c'est le point de départ de l'exemple ci-dessous",
          },
        },
        {
          kind: 'exemple',
          badge: 'point + vecteur → 4 formes',
          formula: 'A(1 ; 1), vecteur directeur $\\vec{u} = \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$. Écris les 4 formes.',
          steps: [
            { tag: 'vecteur normal', text: 'on tourne u de 90° : $\\begin{pmatrix} a \\\\ b \\end{pmatrix} = \\begin{pmatrix} -1 \\\\ 2 \\end{pmatrix}$' },
            { tag: 'implicite', text: '$-1 \\cdot (x-1) + 2 \\cdot (y-1) = 0 \\to -x+2y-1=0$, soit $x-2y+1=0$' },
            { tag: 'explicite en y', text: '$2y = x+1 \\to y = \\frac{1}{2}x + \\frac{1}{2}$' },
            { tag: 'explicite en x', text: '$x = 2y-1$' },
          ],
          result: { tag: 'paramétrique', text: '$\\begin{cases} x = 1+2t \\\\ y = 1+t \\end{cases}$' },
        },
        {
          kind: 'astuce',
          text:
            'Tu peux passer directement du paramétrique à l\'implicite. Isole t dans chaque ' +
            'équation paramétrique, puis égale les deux : $t = \\frac{x-1}{2} = ' +
            '\\frac{y-1}{1}$. Tu obtiens $1 \\cdot (x-1) = 2 \\cdot (y-1)$, soit $x-2y+1=0$. ' +
            "C'est exactement le même résultat que par le vecteur normal — sans avoir besoin de " +
            'le construire !',
        },
        {
          kind: 'atelier',
          tag: 'droite-formes-widget',
          label: 'Manipule toi-même : une droite, quatre écritures',
          caption:
            'Déplace le point A et l\'extrémité du vecteur directeur u : les quatre ' +
            'écritures de la droite se mettent à jour en direct. L\'implicite et la ' +
            'paramétrique existent toujours ; l\'explicite en y devient impossible pour une ' +
            'droite verticale, l\'explicite en x pour une droite horizontale. Fais glisser t ' +
            ': le point M = A + t·u parcourt toute la droite, c\'est l\'équation vectorielle ' +
            'AM = t·u. Le réglage de départ reproduit l\'exemple ci-dessus.',
        },
        {
          kind: 'historique',
          titre: "Et si Descartes n'était pas seul ?",
          text:
            'Au même moment où René Descartes publie sa fameuse méthode des coordonnées en ' +
            '1637, un autre Français développe, de son côté, une idée presque identique : ' +
            '**Pierre de Fermat**, magistrat toulousain et mathématicien amateur. Dans un ' +
            'texte resté inédit de son vivant, Ad Locos Planos et Solidos Isagoge ' +
            '(« Introduction aux lieux plans et solides »), rédigé vers 1636 — avant même la ' +
            "publication de Descartes — Fermat part d'une équation entre deux inconnues et " +
            'en déduit directement la courbe qu\'elle représente : exactement l\'idée que tu ' +
            "utilises dans ce chapitre, dans l'autre sens, en partant d'un point et d'un " +
            'vecteur directeur pour écrire une équation. Les deux hommes sont arrivés à la ' +
            'même méthode, presque au même moment, sans se concerter.',
          image: {
            src: '/images/historique/fermat.jpg',
            alt: 'Portrait de Pierre de Fermat',
            caption: 'Pierre de Fermat (1601–1665), portrait anonyme du 17e siècle.',
          },
        },
        {
          kind: 'entrainement',
          title: "Équation d'une droite",
          generatorId: 'gen42',
          description: [
            "Pars de l'un des 5 types de données. Extrais le point et le vecteur directeur. Puis écris la forme demandée.",
          ],
          chantier: '4e',
          whereLabel: "4e → « 42. Équation d'une droite »",
        },
      ],
    },

    {
      id: 'lire-tracer',
      number: 2,
      title: 'Lire une droite sur un graphe, la tracer depuis son équation',
      kicker: 'deux compétences réciproques, sur le même quadrillage',
      titreCourt: 'Lire et tracer',
      partie: 'Écrire, lire et tracer une droite',
      essentiel: [
        'Lire une droite : deux points à coordonnées entières, puis le vecteur directeur qui les relie, réduit à sa forme **primitive** (composantes divisées par leur PGCD).',
        'Sur $y = mx + p$ : p se lit où la droite coupe Oy, et m en « escalier » — on avance de 1, on monte de m.',
        'Tracer : deux points suffisent, souvent les intersections avec les axes ; en paramétrique, t = 0 puis t = 1.',
      ],
      cartes: [
        { question: 'Quelle est la forme primitive de $\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$ ?', reponse: '$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ : on divise par le PGCD, 2.' },
        { question: 'Comment lire la pente m sur un graphe ?', reponse: 'On avance de 1 vers la droite et on compte de combien la droite monte (m > 0) ou descend (m < 0).' },
        { question: 'Quels deux points pour tracer une droite donnée en paramétrique ?', reponse: 't = 0 donne le point de départ, t = 1 le point translaté du vecteur directeur.' },
      ],
      blocks: [
        { kind: 'video', title: 'Lire, tracer une droite ; pente, angle et ordonnée à l\'origine', youtubeId: 'XhlMFkJ5XG4' },
        {
          kind: 'para',
          text:
            'Il y a deux compétences symétriques. Tu peux partir d\'un dessin pour en écrire ' +
            "l'équation. Ou partir d'une équation pour la dessiner. Dans les deux sens, tout " +
            'repose sur les mêmes deux points à coordonnées entières.',
        },
        { kind: 'subheading', text: 'Lire une droite sur un graphe' },
        {
          kind: 'para',
          text:
            'Repère deux points de la droite dont les coordonnées sont entières. Le quadrillage ' +
            'les rend visibles directement. Calcule ensuite le vecteur directeur reliant ces deux ' +
            'points. Pour éviter des composantes inutilement grandes, réduis-le toujours à sa ' +
            'forme **primitive** : divise ses deux composantes par leur PGCD.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5,
            xMax: 4.5,
            yMin: -1,
            yMax: 3,
            grid: true,
            vectors: [
              { from: { x: -2, y: -0.5 }, to: { x: 4, y: 2.5 }, tone: 'faint', arrow: false },
              { from: { x: -1, y: 0 }, to: { x: 3, y: 2 }, tone: 'accent' },
            ],
            points: [
              { x: -1, y: 0, label: '(−1 ; 0)', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 2, label: '(3 ; 2)', tone: 'ink', labelPos: 'above' },
              { x: 1.2, y: 1.4, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
            ],
            caption:
              'vecteur directeur brut $\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$, réduit à sa forme ' +
              'primitive $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$',
          },
        },
        {
          kind: 'para',
          text:
            'Si la droite n\'est pas verticale, tu peux aussi lire directement son équation ' +
            'explicite $y = mx + p$ : p est l\'ordonnée du point où elle coupe l\'axe Oy, et m se ' +
            'lit en « escalier » — avance de 1 vers la droite, et compte de combien la droite monte ' +
            '(m > 0) ou descend (m < 0). Sur la figure : $p = \\frac{1}{2}$ et $m = \\frac{1}{2}$, ' +
            'donc $y = \\frac{1}{2}x + \\frac{1}{2}$.',
        },
        { kind: 'subheading', text: 'Tracer une droite depuis son équation' },
        { kind: 'para', text: "Dans l'autre sens, il suffit de trouver deux points, quelle que soit la forme de départ." },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            "**Implicite ou explicite** — choisis une valeur de x (ou de y), calcule l'autre " +
              'coordonnée. Répète avec une deuxième valeur. Les **intersections avec les axes** ' +
              '(x=0, puis y=0) donnent souvent les deux points les plus simples à lire.',
            "**Paramétrique** — le point de départ s'obtient avec t=0. Pour un second point, " +
              "prends n'importe quelle autre valeur de t (t=1 donne directement le point " +
              'translaté du vecteur directeur).',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 3,
            yMin: -4.5,
            yMax: 2.5,
            grid: true,
            vectors: [{ from: { x: -1, y: -4 }, to: { x: 2.5, y: 3 }, tone: 'accent', arrow: false }],
            points: [
              { x: 1, y: 0, label: '(1 ; 0)', tone: 'ink', labelPos: 'right' },
              { x: 0, y: -2, label: '(0 ; −2)', tone: 'ink', labelPos: 'left' },
              { x: 2, y: 2, label: 'd : y = 2x − 2', tone: 'ink', node: false },
            ],
            caption: 'les deux intersections avec les axes suffisent pour tracer la droite en entier',
          },
        },
        {
          kind: 'application',
          titre: 'Positionner un objet à l\'écran, pixel par pixel',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 7,
              yMin: -0.5,
              yMax: 5,
              grid: true,
              vectors: [{ from: { x: 1, y: 1 }, to: { x: 6, y: 4 }, tone: 'accent' }],
              points: [
                { x: 1, y: 1, label: 'P₁ (1 ; 1)', tone: 'ink', labelPos: 'below' },
                { x: 6, y: 4, label: 'P₂ (6 ; 4)', tone: 'ink', labelPos: 'above' },
                { x: 2, y: 2, tone: 'good' },
                { x: 3, y: 2, tone: 'good' },
                { x: 4, y: 3, tone: 'good' },
                { x: 5, y: 3, tone: 'good' },
              ],
              caption:
                "Pour tracer un trait net de P₁ à P₂ sur un écran, le logiciel calcule " +
                "l'équation de la droite (ici pente 0,6), puis arrondit, pixel par pixel " +
                "(points verts), l'ordonnée que donne cette équation à chaque colonne x.",
            },
          ],
          text:
            "Un écran d'ordinateur, de téléphone ou de console est, au fond, un immense " +
            'quadrillage de points — les pixels — repérés exactement comme dans ce chapitre : ' +
            'une abscisse (colonne) et une ordonnée (ligne), souvent avec l\'origine (0 ; 0) ' +
            'dans le coin supérieur gauche plutôt qu\'au centre. Déplacer un personnage dans ' +
            'un jeu vidéo, dessiner une fenêtre, ou afficher du texte au bon endroit revient ' +
            'toujours à calculer une position (x ; y), parfois en résolvant une équation de ' +
            'droite pour tracer un trait net entre deux points — exactement l\'algorithme que ' +
            'les logiciels de dessin utilisent pour relier deux pixels par une ligne droite.',
          domaines: ['Informatique', 'Jeux vidéo'],
        },
        {
          kind: 'entrainement',
          title: 'Lecture graphique',
          generatorId: 'gen43',
          description: [
            "Lis deux points entiers sur un graphe. Puis retrouve l'équation de la droite (cartésienne ou paramétrique).",
          ],
          chantier: '4e',
          whereLabel: "4e → « 43. Lecture graphique — équation d'une droite »",
        },
        {
          kind: 'entrainement',
          title: 'Construction graphique',
          generatorId: 'gen44',
          description: [
            "Pars d'une équation, sous l'une des 4 formes. Place les deux points qui permettent de la tracer.",
          ],
          chantier: '4e',
          whereLabel: '4e → « 44. Construction graphique — tracer une droite »',
        },
        {
          kind: 'entrainement',
          title: 'Lire une droite : associer droites et équations',
          generatorId: 'gen132',
          description: [
            "Quatre droites, quatre équations sous des formes différentes : associe-les. Puis lis une pente et une ordonnée à l'origine en escalier, et repère l'écriture impossible pour une droite verticale ou horizontale.",
          ],
          chantier: '4e',
          whereLabel: '4e → « 132. Lire une droite : associer droites et équations »',
        },
      ],
    },

    {
      id: 'caracteristiques',
      number: 3,
      title: "Pente, angle avec les axes, ordonnée à l'origine",
      kicker: 'm = tan θ — trois façons de décrire la même inclinaison',
      titreCourt: 'Pente et angle',
      partie: 'Écrire, lire et tracer une droite',
      essentiel: [
        'Pente $m = \\dfrac{\\Delta y}{\\Delta x} = \\tan\\theta$, où θ est l\'angle avec Ox, dans $[0^{\\circ};180^{\\circ}[$ : une pente négative donne un angle **obtus**, jamais un angle négatif.',
        'Angle avec Oy : $90^{\\circ} - \\theta_{Ox}$, ramené dans $[0^{\\circ};180^{\\circ}[$. L\'ordonnée à l\'origine p est la valeur de y en x = 0.',
        'Depuis $ax + by + c = 0$ : $m = -\\dfrac{a}{b}$ et $p = -\\dfrac{c}{b}$ ; une verticale n\'a ni pente ni ordonnée à l\'origine.',
      ],
      cartes: [
        { question: '$m = \\sqrt{3}$ : quel angle avec Ox ?', reponse: '$\\tan\\theta = \\sqrt{3}$, donc θ = 60° (et 30° avec Oy).' },
        { question: 'La calculatrice donne $\\tan^{-1}(-1) = -45^{\\circ}$ : quel est l\'angle avec Ox ?', reponse: 'On ajoute 180° : θ = 135°, un angle obtus.' },
        { question: 'Pente et ordonnée à l\'origine de $2x + 2y - 3 = 0$ ?', reponse: '$y = -x + \\dfrac{3}{2}$ : $m = -1$ et $p = \\dfrac{3}{2}$.' },
        { question: 'Quelle droite n\'a pas de pente ?', reponse: 'Une verticale : son angle avec Ox vaut 90°, mais la pente n\'existe pas.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            "La pente, l'angle avec Ox et l'ordonnée à l'origine décrivent chacun un aspect de " +
            'la même droite. Les deux premiers décrivent son inclinaison. Le troisième décrit sa ' +
            'position.',
        },
        {
          kind: 'intuition',
          label: 'Comme un escalier',
          text:
            'La pente m, c\'est juste « de combien tu montes, pour un pas que tu avances ». Un ' +
            'escalier aux marches hautes et courtes a une pente élevée ; une route de montagne ' +
            'annoncée à 8% monte 8 m tous les 100 m parcourus à l\'horizontale. ' +
            '$m = \\dfrac{\\Delta y}{\\Delta x}$ ne dit rien d\'autre que ça, juste écrit avec des lettres.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2,
            xMax: 2.5,
            yMin: -1,
            yMax: 6,
            vectors: [{ from: { x: -1.6, y: -0.7713 }, to: { x: 2, y: 5.4641 }, tone: 'accent', arrow: false }],
            points: [{ x: 0, y: 2, label: 'p = 2', tone: 'tip', labelPos: 'left' }],
            angleArcs: [
              { cx: -1.1547, cy: 0, fromDeg: 0, toDeg: 60, radiusPx: 24, label: '60°', tone: 'attn' },
              { cx: 0, cy: 2, fromDeg: 60, toDeg: 90, radiusPx: 20, label: '30°', tone: 'good' },
            ],
            caption:
              'd : y = √3·x + 2 — pente m = √3, angle avec Ox = 60° (orange), angle avec Oy = 30° (vert), ordonnée à l\'origine p = 2',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            '**Pente** — $m = \\frac{\\Delta y}{\\Delta x}$. C\'est le rapport des composantes du vecteur directeur. Elle **n\'existe pas** pour une verticale.',
            '**Angle avec Ox** — $m = \\tan\\theta$, avec θ dans $[0°;180°[$. Pour une verticale, θ = 90° : la pente n\'existe pas, mais l\'angle si.',
            '**Angle avec Oy** — $\\theta_{Oy} = 90° - \\theta_{Ox}$, ramené dans $[0°;180°[$ : si le résultat est négatif, ajoute 180°. Une verticale fait donc 0° avec Oy, une horizontale 90°, et une droite à 135° avec Ox fait 135° avec Oy.',
            "**Ordonnée à l'origine** — p, c'est la valeur de y quand x = 0. C'est le point où la droite coupe Oy. Elle n'existe pas pour une verticale.",
            '**Depuis l\'implicite** $ax+by+c=0$ (avec $b \\neq 0$) — isole y : $m = -\\frac{a}{b}$ et $p = -\\frac{c}{b}$.',
          ],
        },
        {
          kind: 'para',
          text:
            '**Comment se mesure l\'angle avec Oy ?** L\'angle avec Ox part du demi-axe positif de Ox ' +
            'et tourne dans le sens inverse des aiguilles d\'une montre, vers le demi-axe positif de Oy, ' +
            'jusqu\'à rencontrer la droite. L\'angle avec Oy fait le chemin symétrique : il part du ' +
            '**demi-axe positif de Oy** et tourne dans le **sens des aiguilles d\'une montre**, vers le ' +
            'demi-axe positif de Ox, jusqu\'à rencontrer la droite. On le prend lui aussi dans ' +
            '$[0^{\\circ};180^{\\circ}[$ : c\'est exactement $90^{\\circ} - \\theta_{Ox}$, ramené dans cet ' +
            'intervalle. Ce n\'est donc pas toujours le plus petit angle entre la droite et l\'axe : une ' +
            'droite à $135^{\\circ}$ de Ox fait aussi $135^{\\circ}$ avec Oy, alors qu\'elle ne « penche » ' +
            'que de $45^{\\circ}$ par rapport à lui.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 3.5,
            yMin: -1.2,
            yMax: 3.4875,
            vectors: [{ from: { x: -1.2, y: 3.2 }, to: { x: 3.2, y: -1.2 }, tone: 'accent', arrow: false }],
            points: [
              { x: 2, y: 0, tone: 'ink', node: true },
              { x: 0, y: 2, tone: 'ink', node: true },
              { x: -0.95, y: 2.6, label: 'd', tone: 'accent', node: false },
            ],
            angleArcs: [
              { cx: 2, cy: 0, fromDeg: 0, toDeg: 135, radiusPx: 22, label: '135°', tone: 'attn' },
              { cx: 0, cy: 2, fromDeg: -45, toDeg: 90, radiusPx: 30, label: '135°', tone: 'good' },
            ],
            caption:
              'd : $y = -x + 2$ — l\'angle avec $Ox$ (orange) part du demi-axe positif de $Ox$, sens inverse ' +
              'des aiguilles d\'une montre ; l\'angle avec $Oy$ (vert) part du demi-axe positif de $Oy$, sens ' +
              'des aiguilles d\'une montre : $90^{\\circ} - 135^{\\circ} = -45^{\\circ}$, plus $180^{\\circ}$, ' +
              'donne $135^{\\circ}$',
          },
        },
        {
          kind: 'exemple',
          badge: 'équation → pente, angles, p',
          formula: 'd : y = √3·x + 2',
          steps: [
            { tag: 'pente', text: 'm = √3' },
            { tag: 'angle avec Ox', text: '$\\tan\\theta = \\sqrt{3} \\to \\theta = 60°$' },
            { tag: 'angle avec Oy', text: '90° − 60° = 30°' },
          ],
          result: { tag: "ordonnée à l'origine", text: 'p = 2 (coefficient constant de la forme explicite)' },
        },
        {
          kind: 'piege',
          label: "Piège — l'angle n'est pas toujours la pente",
          text:
            'Une pente négative correspond à un angle avec Ox **obtus** (entre 90° et 180°) — ' +
            'jamais à un angle négatif ! θ reste toujours mesuré dans $[0°;180°[$, dans le sens ' +
            'trigonométrique depuis le demi-axe positif de Ox.',
        },
        {
          kind: 'exemple',
          badge: 'pente négative',
          formula: 'd : 2x + 2y − 3 = 0',
          steps: [
            { tag: 'isoler y', text: '$2y = -2x + 3 \\to y = -x + \\frac{3}{2}$ : $m = -1$ et $p = \\frac{3}{2}$' },
            { tag: 'angle avec Ox', text: '$\\tan\\theta = -1$ ; la calculatrice donne $\\tan^{-1}(-1) = -45°$, hors de $[0°;180°[$ : on ajoute 180°, $\\theta = 135°$ (obtus)' },
            { tag: 'angle avec Oy', text: '90° − 135° = −45°, négatif : on ajoute 180°, soit 135°' },
          ],
          result: { tag: 'résultat', text: '$m = -1$, angle avec $Ox$ $135^\\circ$, angle avec $Oy$ $135^\\circ$, $p = \\dfrac{3}{2}$' },
        },
        {
          kind: 'exemple',
          badge: 'angle non remarquable',
          formula: 'd : y = 2x − 3',
          steps: [
            { tag: 'pente', text: 'm = 2' },
            { tag: 'angle avec Ox', text: '$\\tan\\theta = 2 \\to \\theta = \\tan^{-1}(2) \\approx 63{,}4°$ (calculatrice en degrés)' },
            { tag: 'angle avec Oy', text: '90° − 63,4° ≈ 26,6°' },
          ],
          result: { tag: "ordonnée à l'origine", text: 'p = −3' },
        },
        {
          kind: 'atelier',
          tag: 'pente-angle-widget',
          label: 'Manipule toi-même : pente et angle',
          caption:
            'Fais tourner la droite (angle θ avec Ox) et déplace-la (ordonnée à l\'origine ' +
            'p). La pente m = tan θ se lit sur l\'escalier : on avance de 1, on monte de m. ' +
            'Une pente négative donne un angle obtus, jamais un angle négatif : la ' +
            'calculatrice affiche tan⁻¹(m) < 0, il faut ajouter 180°. À 90°, la droite est ' +
            'verticale et n\'a plus de pente. Le réglage de départ reproduit le premier ' +
            'exemple de la section (θ = 60°, p = 2).',
        },
        {
          kind: 'entrainement',
          title: "Caractéristiques d'une droite",
          generatorId: 'gen46',
          description: ["Pars de n'importe quelle forme d'équation. Retrouve la pente, un angle (arrondi au degré) ou l'ordonnée à l'origine."],
          chantier: '4e',
          whereLabel: "4e → « 46. Caractéristiques d'une droite »",
        },
      ],
    },

    {
      id: 'relations',
      number: 4,
      title: 'Droites parallèles et perpendiculaires',
      kicker: 'critère de colinéarité nul ↔ parallèles — produit scalaire nul ↔ perpendiculaires',
      titreCourt: 'Parallèles, perpendiculaires',
      partie: 'Deux droites : position et distance',
      essentiel: [
        '**Parallèles** ⟺ critère de colinéarité nul : $\\alpha \\cdot \\beta\' - \\beta \\cdot \\alpha\' = 0$ ; en pentes, $m = m\'$.',
        '**Perpendiculaires** ⟺ produit scalaire nul : $\\alpha \\cdot \\alpha\' + \\beta \\cdot \\beta\' = 0$ ; en pentes, $m \\cdot m\' = -1$ si les deux pentes existent.',
        '$\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ tourné de 90° donne $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ ; deux parallèles $ax + by + c = 0$ ne diffèrent que par c.',
      ],
      cartes: [
        { question: 'Quel critère dit que deux droites sont parallèles ?', reponse: 'Le critère de colinéarité de leurs vecteurs directeurs est nul : $\\alpha \\cdot \\beta\' - \\beta \\cdot \\alpha\' = 0$.' },
        { question: '$m_1 = 2$ et $m_2 = -\\dfrac{1}{2}$ : quelle relation entre les droites ?', reponse: 'Perpendiculaires : $m_1 \\cdot m_2 = -1$.' },
        { question: 'Parallèle à $3x - y + 2 = 0$ passant par A(1 ; 4) ?', reponse: '$3x - y + c = 0$ avec $3 - 4 + c = 0$ : $3x - y + 1 = 0$.' },
        { question: 'Une horizontale et une verticale : pourquoi $m \\cdot m\' = -1$ ne marche-t-il pas ?', reponse: 'La verticale n\'a pas de pente ; le produit scalaire, lui, marche toujours.' },
      ],
      blocks: [
        { kind: 'video', title: 'Droites parallèles, perpendiculaires et intersection de deux droites', youtubeId: 'E0Uvj1gvBi0' },
        {
          kind: 'para',
          text:
            'Il y a deux critères sur les vecteurs directeurs, à ne jamais confondre. Ce sont ' +
            'les mêmes que pour la colinéarité et l\'orthogonalité de vecteurs, appliqués ici à ' +
            'des droites.',
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser la perpendicularité',
          text:
            'Tourne un vecteur $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ d\'un quart de tour ' +
            '(90°) : ses deux composantes s\'échangent, et l\'une d\'elles change de signe — tu ' +
            'obtiens $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$. C\'est tout ce qu\'il y a à voir ' +
            'derrière le critère du produit scalaire nul : une droite perpendiculaire à une ' +
            'autre, c\'est simplement sa direction tournée d\'un quart de tour.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -1.5,
              xMax: 8,
              yMin: -1,
              yMax: 4,
              showAxes: false,
              vectors: [
                { from: { x: -0.9, y: -0.3 }, to: { x: 7.5, y: 2.5 }, tone: 'faint', arrow: false },
                { from: { x: -0.9, y: 0.7 }, to: { x: 7.5, y: 3.5 }, tone: 'faint', arrow: false },
                { from: { x: 1.8, y: 0.6 }, to: { x: 5.4, y: 1.8 }, tone: 'accent' },
                { from: { x: 1.8, y: 1.6 }, to: { x: 5.4, y: 2.8 }, tone: 'accent' },
              ],
              caption: 'parallèles — vecteurs directeurs colinéaires',
            },
            {
              kind: 'vectorPlane',
              xMin: -1.5,
              xMax: 7.5,
              yMin: -0.5,
              yMax: 4.5,
              showAxes: false,
              vectors: [
                { from: { x: -0.9, y: 0.7 }, to: { x: 6.9, y: 3.3 }, tone: 'faint', arrow: false },
                { from: { x: 3.7, y: -0.1 }, to: { x: 2.3, y: 4.1 }, tone: 'faint', arrow: false },
                { from: { x: 2.1, y: 1.7 }, to: { x: 5.4, y: 2.8 }, tone: 'good' },
                { from: { x: 3.3, y: 1.1 }, to: { x: 2.5, y: 3.5 }, tone: 'good' },
              ],
              rightAngleMarkers: [{ vertex: { x: 3, y: 2 }, arm1: { x: 6, y: 3 }, arm2: { x: 2, y: 5 }, size: 12 }],
              caption: 'perpendiculaires — vecteurs directeurs orthogonaux',
            },
            {
              kind: 'vectorPlane',
              xMin: -1.5,
              xMax: 6.5,
              yMin: -1.5,
              yMax: 4.5,
              showAxes: false,
              vectors: [
                { from: { x: -1, y: 3 }, to: { x: 6, y: -1 }, tone: 'bad', arrow: false },
                { from: { x: -0.5, y: -1 }, to: { x: 5, y: 4 }, tone: 'bad', arrow: false },
              ],
              caption: "ni l'un ni l'autre — sécantes quelconques",
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Prends deux vecteurs directeurs $\\vec{u}\\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}$ ' +
              "et $\\vec{v}\\begin{pmatrix} \\alpha' \\\\ \\beta' \\end{pmatrix}$ (pour $ax+by+c=0$, prends $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$) :",
            "**Parallèles** ⟺ critère de colinéarité nul : $\\alpha \\cdot \\beta' - \\beta \\cdot \\alpha' = 0$. En pentes (si les deux existent), ça donne $m = m'$.",
            "**Perpendiculaires** ⟺ produit scalaire nul : $\\alpha \\cdot \\alpha' + \\beta \\cdot \\beta' = 0$. En pentes (si les deux existent), ça donne $m \\cdot m' = -1$.",
          ],
        },
        {
          kind: 'exemple',
          badge: 'perpendiculaire par un point',
          formula:
            'd : x − 2y + 1 = 0 (vecteur directeur $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$). ' +
            "Trouve d′, perpendiculaire à d, passant par C(3 ; −1).",
          steps: [
            {
              tag: 'vecteur directeur de d′',
              text: 'on tourne $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ de 90° : $\\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$ — produit scalaire $2 \\cdot 1 + 1 \\cdot (-2) = 0$ ✓',
            },
            { tag: 'vecteur normal de d′', text: 'on tourne $\\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$ de 90° : $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$' },
            { tag: 'implicite', text: '$2 \\cdot (x-3) + 1 \\cdot (y+1) = 0 \\to 2x+y-5=0$' },
          ],
          result: {
            tag: 'd′',
            text: '$2x+y-5=0$, vecteur directeur $\\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$, passe par C(3 ; −1)',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 5.5,
            yMin: -3.5,
            yMax: 4,
            vectors: [
              { from: { x: -1, y: 0 }, to: { x: 5, y: 3 }, tone: 'accent', arrow: false },
              { from: { x: 0.6, y: 3.8 }, to: { x: 4, y: -3 }, tone: 'good', arrow: false },
            ],
            points: [{ x: 3, y: -1, label: 'C(3 ; −1)', tone: 'good', labelPos: 'right' }],
            rightAngleMarkers: [{ vertex: { x: 1.8, y: 1.4 }, arm1: { x: 3.8, y: 2.4 }, arm2: { x: 2.8, y: -0.6 } }],
            caption: 'd et d′ se coupent à angle droit — d′ passe bien par C',
          },
        },
        {
          kind: 'exemple',
          badge: 'parallèle par un point',
          formula: 'd : 3x − y + 2 = 0. Trouve la parallèle d′ à d passant par A(1 ; 4).',
          steps: [
            { tag: 'même direction', text: 'd′ a le même vecteur directeur, donc les mêmes a et b : $d\' : 3x - y + c = 0$' },
            { tag: 'A appartient à d′', text: '$3 \\cdot 1 - 4 + c = 0 \\to c = 1$' },
          ],
          result: { tag: 'd′', text: '$3x - y + 1 = 0$ — deux parallèles ne diffèrent que par c' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — deux droites parallèles ne diffèrent que par c',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $d : ax + by + c = 0$, avec a et b non tous deux nuls, et $d\' : a\'x + b\'y + c\' = 0$ une ' +
                'droite parallèle à d. Leurs vecteurs directeurs $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ et ' +
                '$\\begin{pmatrix} -b\' \\\\ a\' \\end{pmatrix}$ sont colinéaires et non nuls : il existe un réel ' +
                '$k \\neq 0$ tel que $a\' = k \\cdot a$ et $b\' = k \\cdot b$.',
            },
            {
              kind: 'para',
              text:
                'L\'équation de d′ s\'écrit donc $k \\cdot a\\,x + k \\cdot b\\,y + c\' = 0$. On la divise par ' +
                '$k \\neq 0$ : $ax + by + \\dfrac{c\'}{k} = 0$. Les coefficients de x et de y sont ceux de d : ' +
                'seul le terme constant change.',
            },
            {
              kind: 'para',
              text:
                'Réciproquement, une droite d\'équation $ax + by + c\'\' = 0$ admet le même vecteur directeur ' +
                '$\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ que d : elle est parallèle à d, et même confondue ' +
                'avec d si $c\'\' = c$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'reconnaître la relation',
          formula: 'd₁ : y = 2x + 1 et d₂ : x + 2y − 4 = 0 — parallèles, perpendiculaires, ou ni l\'un ni l\'autre ?',
          steps: [
            { tag: 'pentes', text: '$m_1 = 2$ ; $d_2 : y = -\\frac{1}{2}x + 2$, donc $m_2 = -\\frac{1}{2}$' },
            { tag: 'produit', text: '$m_1 \\cdot m_2 = 2 \\cdot \\left(-\\frac{1}{2}\\right) = -1$' },
            { tag: 'contrôle par les directeurs', text: '$\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix} \\cdot \\begin{pmatrix} -2 \\\\ 1 \\end{pmatrix} = -2 + 2 = 0$ ✓' },
          ],
          result: { tag: 'résultat', text: 'd₁ et d₂ sont perpendiculaires' },
        },
        {
          kind: 'atelier',
          tag: 'relations-droites-widget',
          label: 'Manipule toi-même : parallèles, perpendiculaires ou sécantes ?',
          caption:
            'Règle les coefficients de d₁ et d₂ : l\'atelier lit un vecteur directeur (−b ; ' +
            'a) de chaque droite, puis teste le critère de colinéarité (parallèles ?) et le produit ' +
            'scalaire (perpendiculaires ?). Quand les droites sont sécantes, il calcule ' +
            'leur point d\'intersection pas à pas, par substitution ou par combinaison ' +
            '(section 5). En mode Défi, trouve la position relative de deux droites en un ' +
            'seul essai. Le réglage de départ reproduit les exemples des sections 4 et 5.',
        },
        {
          kind: 'astuce',
          text:
            '$\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ tourné de 90° donne $\\begin{pmatrix} -b ' +
            '\\\\ a \\end{pmatrix}$ ou $\\begin{pmatrix} b \\\\ -a \\end{pmatrix}$, selon le sens ' +
            'du tour. Les deux sont perpendiculaires à $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ ' +
            "— ce sont juste des multiples négatifs l'un de l'autre. N'importe lequel des deux " +
            'convient pour construire une perpendiculaire.',
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — d'où vient m·m′ = −1 ?",
          blocks: [
            {
              kind: 'para',
              text:
                'Soient deux droites perpendiculaires, dont aucune n\'est verticale, de vecteurs directeurs ' +
                '$\\vec{u}\\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}$ et ' +
                '$\\vec{v}\\begin{pmatrix} \\alpha\' \\\\ \\beta\' \\end{pmatrix}$. Aucune n\'est verticale, donc ' +
                '$\\alpha \\neq 0$ et $\\alpha\' \\neq 0$, et leurs pentes valent $m = \\dfrac{\\beta}{\\alpha}$ et ' +
                '$m\' = \\dfrac{\\beta\'}{\\alpha\'}$.',
            },
            {
              kind: 'para',
              text:
                'Les droites sont perpendiculaires, donc le produit scalaire de leurs vecteurs directeurs est ' +
                'nul : $\\alpha \\cdot \\alpha\' + \\beta \\cdot \\beta\' = 0$, c\'est-à-dire ' +
                '$\\beta \\cdot \\beta\' = -\\alpha \\cdot \\alpha\'$.',
            },
            {
              kind: 'para',
              text:
                'On en déduit $m \\cdot m\' = \\dfrac{\\beta \\cdot \\beta\'}{\\alpha \\cdot \\alpha\'} = ' +
                '\\dfrac{-\\alpha \\cdot \\alpha\'}{\\alpha \\cdot \\alpha\'} = -1$, puisque $\\alpha \\cdot \\alpha\' \\neq 0$.',
            },
            {
              kind: 'para',
              text:
                'L\'hypothèse « aucune n\'est verticale » est indispensable : la perpendiculaire à une horizontale ' +
                'est verticale, et sa pente n\'existe pas (voir ci-dessous).',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Une horizontale et une verticale',
          text:
            'Une droite horizontale (m = 0) et une droite verticale (pas de pente) sont ' +
            'perpendiculaires, mais « m · m′ = −1 » n\'a alors aucun sens : l\'une des deux pentes ' +
            'n\'existe pas. Le critère du produit scalaire, lui, marche toujours : ' +
            '$\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} \\cdot \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix} = 0$.',
        },
        {
          kind: 'entrainement',
          title: 'Relations entre droites',
          generatorId: 'gen45',
          description: ['Construis la droite parallèle ou perpendiculaire à une droite donnée. Elle doit passer par un point imposé. Ou bien reconnais toi-même la relation entre deux droites.'],
          chantier: '4e',
          whereLabel: '4e → « 45. Relations entre droites (parallèle/perpendiculaire) »',
        },
        { kind: 'subheading', text: "Pour aller plus loin — droites qui dépendent d'un paramètre" },
        {
          kind: 'methode',
          label: 'Méthode — une condition, une équation en m, puis un contrôle',
          items: [
            'Écris $d_m \\equiv a(m)x+b(m)y+c(m)=0$ : chaque coefficient dépend de m, et $\\begin{pmatrix} -b(m) \\\\ a(m) \\end{pmatrix}$ est un vecteur directeur.',
            'Traduis la question : **parallèle** à d → critère de colinéarité nul ; **perpendiculaire** → produit scalaire nul ; **passe par P** → les coordonnées de P vérifient l\'équation ; **horizontale** → $a(m)=0$ ; **verticale** → $b(m)=0$.',
            'Résous l\'équation en m obtenue (premier ou second degré).',
            'Contrôle chaque solution : si $a(m)$ et $b(m)$ sont tous les deux nuls, l\'équation n\'est plus celle d\'une droite — la valeur est rejetée. Il peut donc y avoir 0, 1 ou 2 valeurs.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'droite dépendant d\'un paramètre',
          formula: 'Pour quelle(s) valeur(s) de m la droite $d_m \\equiv (m^2-4)x+(m-2)y+3=0$ est-elle horizontale ?',
          steps: [
            { tag: 'condition', text: 'horizontale ⟺ coefficient de x nul : $m^2-4=0 \\to m=2$ ou $m=-2$' },
            { tag: 'contrôle m = 2', text: '$a(2)=0$ et $b(2)=0$ : il reste $3=0$, ce n\'est pas une droite → rejetée' },
            { tag: 'contrôle m = −2', text: '$a(-2)=0$ et $b(-2)=-4 \\neq 0$ : $d_{-2} \\equiv -4y+3=0$, soit $y=\\dfrac{3}{4}$ ✓' },
          ],
          result: { tag: 'résultat', text: 'une seule valeur : $m=-2$' },
        },
        {
          kind: 'entrainement',
          title: "Droites dépendant d'un paramètre",
          generatorId: 'gen95',
          description: ['Une famille de droites dₘ dépend de m : trouve les valeurs de m pour lesquelles dₘ est parallèle ou perpendiculaire à une droite, passe par un point, est horizontale ou verticale. Pense à contrôler que dₘ reste une droite.'],
          chantier: '4e',
          whereLabel: "4e → « 95. Droites dépendant d'un paramètre »",
        },
      ],
    },

    {
      id: 'intersection',
      number: 5,
      title: 'Intersection de deux droites',
      kicker: 'sécantes (1 point) — parallèles distinctes (0 point) — confondues (une infinité)',
      titreCourt: 'Intersection de deux droites',
      partie: 'Deux droites : position et distance',
      essentiel: [
        'Compare d\'abord les vecteurs directeurs : non colinéaires → droites **sécantes**, un seul point commun ; colinéaires → **confondues** si un point de l\'une est sur l\'autre, sinon **parallèles distinctes**.',
        'Pour des sécantes, on résout le système des deux équations, par substitution ou par combinaison linéaire.',
        'Deux mobiles ne se rencontrent que s\'ils passent au point commun au même instant : $t_1 = t_2$.',
      ],
      cartes: [
        { question: 'Vecteurs directeurs colinéaires : quelles positions sont possibles ?', reponse: 'Confondues (une infinité de points communs) ou parallèles distinctes (aucun).' },
        { question: '$2x - 4y + 2 = 0$ et $x - 2y + 1 = 0$ : quelle position ?', reponse: 'Confondues : la première équation est le double de la seconde.' },
        { question: 'Point commun de $\\begin{cases} x = 1+2t \\\\ y = 3-t \\end{cases}$ et de $x + y - 6 = 0$ ?', reponse: '$(1+2t) + (3-t) - 6 = 0$ donne $t = 2$ : le point (5 ; 1).' },
        { question: 'Deux trajectoires se coupent : les mobiles se rencontrent-ils forcément ?', reponse: 'Non : il faut en plus le même instant, $t_1 = t_2$.' },
      ],
      blocks: [
        { kind: 'para', text: "Il y a trois issues possibles. Distingue-les **avant** de te lancer dans un calcul inutile." },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Compare les vecteurs directeurs. **Non colinéaires** → les droites sont **sécantes**, un seul point d\'intersection : passe à l\'étape 2.',
            '**Colinéaires** → vérifie si un point de l\'une appartient à l\'autre. Si oui, elles sont **confondues** (une infinité de points communs). Sinon, **parallèles distinctes** (aucun point commun).',
            'Pour des sécantes, résous le système des deux équations (par substitution ou par combinaison linéaire) pour obtenir les coordonnées du point commun.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -1,
              xMax: 5.5,
              yMin: -1,
              yMax: 4.7,
              showAxes: false,
              vectors: [
                { from: { x: -0.3, y: 4.24 }, to: { x: 5.3, y: -0.24 }, tone: 'accent', arrow: false },
                { from: { x: -0.3, y: -0.3 }, to: { x: 4.3, y: 4.3 }, tone: 'good', arrow: false },
              ],
              points: [{ x: 2.222, y: 2.222, tone: 'ink', node: true }],
              caption: 'sécantes — 1 point commun',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 5.5,
              yMin: -0.5,
              yMax: 5,
              showAxes: false,
              vectors: [
                { from: { x: 0, y: 3 }, to: { x: 5, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 0, y: 4.3 }, to: { x: 5, y: 3.3 }, tone: 'good', arrow: false },
              ],
              caption: 'parallèles distinctes — 0 point',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 5.5,
              yMin: -0.5,
              yMax: 3,
              showAxes: false,
              vectors: [
                { from: { x: 0, y: 2 }, to: { x: 5, y: 1 }, tone: 'accent', arrow: false },
                { from: { x: 0, y: 2.08 }, to: { x: 5, y: 1.08 }, tone: 'good', dashed: true },
              ],
              points: [{ x: 2.5, y: 0.5, label: 'd₁ ≡ d₂', tone: 'ink', node: false }],
              caption: 'confondues — une infinité de points',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 5.5,
            yMin: -3.5,
            yMax: 4,
            vectors: [
              { from: { x: -1, y: 0 }, to: { x: 5, y: 3 }, tone: 'accent', arrow: false },
              { from: { x: 0.6, y: 3.8 }, to: { x: 4, y: -3 }, tone: 'good', arrow: false },
              { from: { x: 1.8, y: 1.4 }, to: { x: 1.8, y: 0 }, tone: 'faint', dashed: true },
              { from: { x: 1.8, y: 1.4 }, to: { x: 0, y: 1.4 }, tone: 'faint', dashed: true },
            ],
            points: [{ x: 1.8, y: 1.4, label: '(9⁄5 ; 7⁄5)', tone: 'ink', labelPos: 'right' }],
            caption: 'd₁ ∩ d₂ — le point trouvé par le calcul, replacé sur le graphe',
          },
        },
        {
          kind: 'exemple',
          badge: 'résolution par substitution',
          formula: 'd₁ : x − 2y + 1 = 0, d₂ : 2x + y − 5 = 0 — ce sont les deux droites de l\'exemple précédent.',
          steps: [
            {
              tag: 'directeurs non colinéaires',
              text: '$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ et $\\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$ — critère de colinéarité $2 \\cdot (-2) - 1 \\cdot 1 = -5 \\neq 0$ → sécantes',
            },
            { tag: 'isoler x dans d₁', text: '$x = 2y-1$' },
            { tag: 'substituer dans d₂', text: '$2(2y-1) + y - 5 = 0 \\to 5y-7=0 \\to y = \\frac{7}{5}$' },
          ],
          result: { tag: "point d'intersection", text: '$x = 2 \\cdot \\frac{7}{5} - 1 = \\frac{9}{5}$ → $(\\frac{9}{5} ; \\frac{7}{5})$' },
        },
        {
          kind: 'exemple',
          badge: 'parallèles ou confondues ?',
          formula: 'd₁ : 2x − 4y + 2 = 0, d₂ : x − 2y + 1 = 0 et d₃ : x − 2y + 5 = 0.',
          steps: [
            { tag: 'directeurs', text: '$\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$, $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$, $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ : tous colinéaires, les trois droites sont parallèles ou confondues' },
            { tag: 'd₁ et d₂', text: 'l\'équation de d₁ est exactement le double de celle de d₂ : mêmes points, droites **confondues**' },
            { tag: 'd₂ et d₃', text: 'A(1 ; 1) est sur d₂, mais $1 - 2 + 5 = 4 \\neq 0$ : A n\'est pas sur d₃' },
          ],
          result: { tag: 'résultat', text: 'd₁ et d₂ confondues ; d₃ parallèle distincte (aucun point commun)' },
        },
        {
          kind: 'exemple',
          badge: 'une droite sous forme paramétrique',
          formula: '$d_1 : \\begin{cases} x = 1+2t \\\\ y = 3-t \\end{cases}$ et $d_2 : x + y - 6 = 0$.',
          steps: [
            { tag: 'remplacer x et y dans d₂', text: '$(1+2t) + (3-t) - 6 = 0 \\to t - 2 = 0 \\to t = 2$' },
            { tag: 'revenir au point', text: '$x = 1 + 2 \\cdot 2 = 5$ et $y = 3 - 2 = 1$' },
          ],
          result: { tag: "point d'intersection", text: '(5 ; 1) — contrôle dans d₂ : 5 + 1 − 6 = 0 ✓' },
        },
        {
          kind: 'entrainement',
          title: 'Intersection entre deux droites',
          generatorId: 'gen48',
          description: ['Diagnostique le cas (sécantes, parallèles ou confondues). Puis calcule le point commun quand il existe.'],
          chantier: '4e',
          whereLabel: '4e → « 48. Intersection entre deux droites »',
        },
        {
          kind: 'attention',
          label: 'Deux mobiles : deux instants',
          text:
            'Quand chaque droite décrit le mouvement d\'un mobile ($t$ = le temps), on cherche le point commun des ' +
            '**trajectoires** avec deux paramètres différents, $t_1$ pour le premier et $t_2$ pour le second. Les ' +
            'mobiles ne se rencontrent (collision) que si, en plus, $t_1=t_2$ : des trajectoires qui se croisent ne ' +
            'suffisent pas.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 9.5,
            yMin: -1,
            yMax: 8.375,
            grid: true,
            vectors: [
              { from: { x: -0.4, y: 0.3 }, to: { x: 9.4, y: 5.2 }, tone: 'accent', arrow: false },
              { from: { x: 9, y: -1 }, to: { x: -0.375, y: 8.375 }, tone: 'good', arrow: false },
            ],
            points: [
              { x: 1, y: 1, label: 'M₁', tone: 'accent', labelPos: 'above' },
              { x: 3, y: 2, label: 't = 1', tone: 'accent', labelPos: 'below' },
              { x: 7, y: 4, label: 't = 3', tone: 'accent', labelPos: 'below' },
              { x: 8, y: 0, tone: 'good' },
              { x: 7.6, y: -0.55, label: 'M₂', tone: 'good', node: false, labelPos: 'left' },
              { x: 7, y: 1, label: 't = 1', tone: 'good', labelPos: 'right' },
              { x: 6, y: 2, label: 't = 2', tone: 'good', labelPos: 'right' },
              { x: 5, y: 3, label: 'K', tone: 'ink', labelPos: 'above' },
            ],
            caption:
              'M₁ : $\\begin{cases} x = 1+2t \\\\ y = 1+t \\end{cases}$ et M₂ : $\\begin{cases} x = 8-t \\\\ y = t \\end{cases}$ ' +
              '— points marqués à t = 0, 1, 2, 3 ; les trajectoires se coupent en K(5 ; 3), mais M₁ y passe à $t_1 = 2$ et M₂ à $t_2 = 3$ : ' +
              'croisement sans collision',
          },
        },
        {
          kind: 'atelier',
          tag: 'deux-mobiles-widget',
          label: 'Manipule toi-même : deux mobiles',
          caption:
            'Fais avancer le temps t : les deux mobiles parcourent leurs trajectoires. L\'atelier ' +
            'trouve la croix K des trajectoires avec deux paramètres différents, t₁ et t₂ : collision ' +
            'si t₁ = t₂, sinon les mobiles passent en K à des instants différents. Essaie les ' +
            'scénarios « collision » et « trajectoires parallèles ». Le réglage de départ reproduit ' +
            'la figure ci-dessus.',
        },
        {
          kind: 'entrainement',
          title: 'Trajectoires et rencontre',
          generatorId: 'gen97',
          description: ['Deux bateaux, deux drones ou deux joueurs en ligne droite : leurs trajectoires se coupent-elles ? Y passent-ils au même instant ? Collision, croisement sans rencontre ou trajectoires parallèles.'],
          chantier: '4e',
          whereLabel: '4e → « 97. Trajectoires et rencontre »',
        },
      ],
    },

    {
      id: 'distance',
      number: 6,
      title: 'Distance point-droite et droite-droite',
      kicker: 'construire la perpendiculaire, trouver le pied, mesurer — sans formule toute faite',
      titreCourt: 'Distance point-droite',
      partie: 'Deux droites : position et distance',
      essentiel: [
        'Distance d\'un point à une droite, sans formule : la perpendiculaire par le point, son intersection avec la droite (le pied H), puis la norme du vecteur qui relie le point à H.',
        'Entre deux parallèles : un point quelconque de l\'une, puis la même méthode vers l\'autre. Raccourcis : $|x_P - k|$ pour une verticale $x = k$, $|y_P - k|$ pour une horizontale $y = k$.',
        'Le symétrique A′ de A par rapport à d : H est le milieu de [AA′], donc $x_{A\'} = 2x_H - x_A$ et $y_{A\'} = 2y_H - y_A$.',
      ],
      cartes: [
        { question: 'Quelles sont les trois étapes de la distance d\'un point C à une droite d ?', reponse: 'La perpendiculaire à d par C, le pied H (intersection avec d), puis $\\|\\vec{CH}\\|$.' },
        { question: 'Distance d\'un point P à la droite verticale $x = k$ ?', reponse: '$|x_P - k|$, un simple écart d\'abscisses.' },
        { question: 'Comment obtenir le symétrique A′ de A par rapport à d ?', reponse: 'Projeté orthogonal H, puis $x_{A\'} = 2x_H - x_A$ et $y_{A\'} = 2y_H - y_A$.' },
        { question: 'Coordonnées du centre de gravité G du triangle ABC ?', reponse: '$G\\left(\\dfrac{x_A+x_B+x_C}{3}\\,;\\,\\dfrac{y_A+y_B+y_C}{3}\\right)$' },
      ],
      blocks: [
        { kind: 'video', title: 'Distance point-droite, droite-droite et notion de lieu géométrique', youtubeId: 'mkdqsJBJKNU' },
        {
          kind: 'para',
          text:
            "La distance d'un point à une droite se construit. Elle ne se lit pas dans une " +
            "formule apprise par cœur ! C'est un enchaînement de trois compétences que tu as " +
            'déjà vues dans ce chapitre.',
        },
        {
          kind: 'methode',
          label: 'Méthode — point à une droite',
          items: [
            'Construis la droite **perpendiculaire** à d, passant par le point donné (section 4).',
            'Calcule son **intersection** avec d — c\'est le pied de la perpendiculaire (section 5).',
            "La distance cherchée, c'est la **norme** du vecteur qui relie le point de départ à ce pied.",
            'Pour la distance entre **deux droites parallèles**, même méthode : choisis n\'importe quel point sur l\'une des deux, puis applique les 3 étapes vers l\'autre.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -9,
            xMax: 4,
            yMin: -3,
            yMax: 8,
            showAxes: false,
            vectors: [
              { from: { x: -1.4, y: -2.2 }, to: { x: 3.4, y: 4.2 }, tone: 'accent', arrow: false },
              { from: { x: -7, y: 7 }, to: { x: 1, y: 1 }, tone: 'good', dashed: true },
            ],
            points: [
              { x: -7, y: 7, label: 'C', tone: 'good', labelPos: 'left' },
              { x: 1, y: 1, label: 'H', tone: 'ink', labelPos: 'right' },
              { x: 3.6, y: 4.5, label: 'd', tone: 'accent', node: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 1, y: 1 }, arm1: { x: 3.4, y: 4.2 }, arm2: { x: -7, y: 7 } }],
            caption: 'CH ⟂ d, distance exacte de l\'exemple ci-dessous',
          },
        },
        {
          kind: 'exemple',
          badge: 'distance point-droite, sans formule',
          formula: 'd : 4x − 3y − 1 = 0 (vecteur directeur $\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$). Distance de C(−7 ; 7) à d.',
          steps: [
            {
              tag: 'perpendiculaire b, par C',
              text:
                'vecteur directeur $\\begin{pmatrix} 4 \\\\ -3 \\end{pmatrix}$ (produit scalaire ' +
                'avec $\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ : $12-12=0$ ✓) → b : ' +
                '$\\begin{cases} x = -7+4t \\\\ y = 7-3t \\end{cases}$',
            },
            { tag: 'intersection b ∩ d', text: '$4(-7+4t) - 3(7-3t) - 1 = 0 \\to 25t-50=0 \\to t=2 \\to H(1 ; 1)$' },
            { tag: 'vecteur CH', text: '$\\vec{CH} = \\begin{pmatrix} 1-(-7) \\\\ 1-7 \\end{pmatrix} = \\begin{pmatrix} 8 \\\\ -6 \\end{pmatrix}$' },
          ],
          result: { tag: 'distance', text: '$\\|\\vec{CH}\\| = \\sqrt{8^2+6^2} = \\sqrt{100} = 10$' },
        },
        {
          kind: 'astuce',
          label: 'deux raccourcis, sans aucune construction',
          text:
            "Dans ces deux cas seulement, le pied de la perpendiculaire s'obtient sans aucun " +
            "calcul ! C'est déjà l'une des deux coordonnées du point de départ.",
          items: [
            'Distance d\'un point P à une droite **verticale** $x = k$ : $|x_P - k|$ — un simple écart d\'abscisses.',
            'Distance d\'un point P à une droite **horizontale** $y = k$ : $|y_P - k|$ — un simple écart d\'ordonnées.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'distance entre deux droites parallèles',
          formula: 'd₁ : y = 2x + 1 et d₂ : y = 2x − 4 (même pente : parallèles).',
          steps: [
            { tag: 'un point de d₁', text: 'x = 0 donne A(0 ; 1)' },
            { tag: 'perpendiculaire par A', text: 'directeur de d₁ : $\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$, donc perpendiculaire $\\begin{cases} x = 2t \\\\ y = 1 - t \\end{cases}$' },
            { tag: 'pied H sur d₂', text: '$1 - t = 2 \\cdot 2t - 4 \\to 5t = 5 \\to t = 1$, H(2 ; 0)' },
          ],
          result: { tag: 'distance', text: '$\\|\\vec{AH}\\| = \\sqrt{2^2 + (-1)^2} = \\sqrt{5} \\approx 2{,}24$' },
        },
        {
          kind: 'atelier',
          tag: 'distance-droite-widget',
          label: 'Manipule toi-même : la plus courte distance',
          caption:
            'Déplace C, ou les points P et R qui fixent d : la perpendiculaire par C, le ' +
            'pied H et la distance CH se recalculent pas à pas, sans formule toute faite. ' +
            'Fais glisser Q sur d : CQ est toujours plus long que CH, sauf quand Q arrive ' +
            'en H. En mode « Deux parallèles », la distance entre d et d′ est celle d\'un ' +
            'point de d′ à d. Le réglage de départ reproduit le premier exemple de la ' +
            'section (distance 10).',
        },
        {
          kind: 'application',
          titre: 'Mesurer une distance sur un vrai terrain',
          image: {
            src: '/images/application/theodolite.jpg',
            alt: 'Un théodolite, instrument de mesure d\'angles utilisé en géométrie de terrain',
            caption: 'Théodolite utilisé en arpentage. Photo : Djat, CC BY-SA 3.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -2,
              xMax: 12,
              yMin: -2,
              yMax: 11,
              vectors: [
                { from: { x: -1, y: -0.4 }, to: { x: 11, y: 4.4 }, tone: 'accent', arrow: false },
                { from: { x: 6, y: 9 }, to: { x: 8.28, y: 3.31 }, tone: 'good', dashed: true },
              ],
              points: [
                { x: 5, y: 2, label: 'limite de propriété (d)', tone: 'accent', labelPos: 'above', node: false },
                { x: 6, y: 9, label: 'M (coin du mur)', tone: 'good', labelPos: 'above' },
                { x: 8.28, y: 3.31, label: 'P', tone: 'ink', labelPos: 'right' },
              ],
              rightAngleMarkers: [{ vertex: { x: 8.28, y: 3.31 }, arm1: { x: 11, y: 4.4 }, arm2: { x: 6, y: 9 } }],
              caption:
                "Même méthode que l'exemple ci-dessus, appliquée au terrain : le géomètre " +
                'matérialise la limite de propriété (d), construit la perpendiculaire par le ' +
                'point M à contrôler, et mesure MP ≈ 6,1 m — le vrai recul, jamais une ' +
                'distance mesurée en diagonale.',
            },
          ],
          text:
            'Un géomètre-arpenteur qui doit fixer la limite exacte d\'un terrain, ou vérifier ' +
            'qu\'une construction respecte bien le recul minimal imposé par rapport à la ' +
            'voirie ou à la parcelle voisine, applique très exactement la méthode de cette ' +
            'section : il matérialise une droite de référence (souvent la limite de ' +
            'propriété), puis mesure la distance **perpendiculaire** entre cette droite et le ' +
            'point à contrôler (un mur, une clôture) — jamais une distance mesurée « à vue » ' +
            'ou en diagonale, qui surestimerait toujours l\'écart réel. Des instruments comme ' +
            'le théodolite, qui mesurent des angles avec une très grande précision, servent ' +
            'justement à construire cette perpendiculaire sur le terrain, exactement comme tu ' +
            'la construis ici sur le papier.',
          domaines: ['Géomètre', 'Urbanisme'],
        },
        {
          kind: 'entrainement',
          title: 'Distance point-droite et droite-droite',
          generatorId: 'gen47',
          description: ['Exercice de synthèse : construis la perpendiculaire, trouve le pied, mesure la distance. Sans jamais utiliser de formule directe.'],
          chantier: '4e',
          whereLabel: '4e → « 47. Distance point-droite et droite-droite »',
        },
        { kind: 'subheading', text: "Pour aller plus loin — droites remarquables d'un triangle" },
        {
          kind: 'para',
          text:
            'Les droites remarquables d\'un triangle ABC se construisent avec les outils des sections 4 à 6 : un point ' +
            'de passage, puis un vecteur directeur ou un vecteur normal. Deux d\'entre elles suffisent : leur ' +
            'intersection (section 5) donne le point de concours.',
        },
        {
          kind: 'featureTable',
          headers: ['Droite', 'Elle passe par', 'Son vecteur', 'Point de concours'],
          rows: [
            ['médiatrice de [BC]', 'le milieu M de [BC]', 'normal : $\\vec{BC}$', 'O, centre du cercle circonscrit'],
            ['hauteur issue de A', 'le sommet A', 'normal : $\\vec{BC}$', 'H, orthocentre'],
            ['médiane issue de A', 'A et le milieu M de [BC]', 'directeur : $\\vec{AM}$', 'G, centre de gravité : $\\left(\\dfrac{x_A+x_B+x_C}{3}\\,;\\dfrac{y_A+y_B+y_C}{3}\\right)$'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'hauteurs et orthocentre',
          formula: 'Triangle A(0 ; 0), B(6 ; 0), C(2 ; 4) : hauteurs issues de A et de B, puis orthocentre H.',
          steps: [
            { tag: 'hauteur issue de A', text: 'vecteur normal $\\vec{BC}\\begin{pmatrix} -4 \\\\ 4 \\end{pmatrix}$, par A : $-4x+4y=0 \\to x-y=0$' },
            { tag: 'hauteur issue de B', text: 'vecteur normal $\\vec{CA}\\begin{pmatrix} -2 \\\\ -4 \\end{pmatrix}$, par B : $-2(x-6)-4y=0 \\to x+2y-6=0$' },
            { tag: 'intersection', text: '$x=y \\to 3y-6=0 \\to y=2$, puis $x=2$' },
          ],
          result: { tag: 'orthocentre', text: 'H(2 ; 2) — contrôle par la troisième hauteur : $\\vec{CH}\\cdot\\vec{AB}=0 \\cdot 6+(-2) \\cdot 0=0$ ✓' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.8,
            xMax: 6.8,
            yMin: -0.8,
            yMax: 6.325,
            grid: true,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 6, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 2, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: 4 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: -0.6, y: -0.6 }, to: { x: 4.2, y: 4.2 }, tone: 'good', dashed: true, arrow: false },
              { from: { x: 6.6, y: -0.3 }, to: { x: 0.4, y: 2.8 }, tone: 'good', dashed: true, arrow: false },
              { from: { x: 2, y: -0.6 }, to: { x: 2, y: 5 }, tone: 'good', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 6, y: 0, label: 'B', tone: 'ink', labelPos: 'below' },
              { x: 2, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
              { x: 2, y: 2, label: 'H(2 ; 2)', tone: 'accent', labelPos: 'right' },
            ],
            rightAngleMarkers: [
              { vertex: { x: 3, y: 3 }, arm1: { x: 6, y: 0 }, arm2: { x: 0, y: 0 }, size: 9 },
              { vertex: { x: 1.2, y: 2.4 }, arm1: { x: 0, y: 0 }, arm2: { x: 6, y: 0 }, size: 9 },
              { vertex: { x: 2, y: 0 }, arm1: { x: 6, y: 0 }, arm2: { x: 2, y: 4 }, size: 9 },
            ],
            caption:
              'les trois hauteurs du triangle de l\'exemple (pointillés verts) : $x - y = 0$, $x + 2y - 6 = 0$ et ' +
              '$x = 2$ — elles se coupent toutes en l\'orthocentre H(2 ; 2)',
          },
        },
        {
          kind: 'atelier',
          tag: 'droites-remarquables-widget',
          label: 'Manipule toi-même : droites remarquables',
          caption:
            'Déplace A, B et C et choisis les médiatrices, les hauteurs ou les médianes : chaque ' +
            'droite est tracée avec son équation cartésienne, et le point de concours O, H ou G est ' +
            'calculé en valeur exacte. Vérifie qu\'il est aussi sur la troisième droite. Le réglage ' +
            'de départ reproduit l\'exemple ci-dessus (orthocentre H(2 ; 2)).',
        },
        {
          kind: 'astuce',
          text:
            "Aire d'un triangle en repère : prends un côté, par exemple [BC], comme base. La hauteur est la distance de A " +
            'à la droite (BC) : perpendiculaire par A, pied H, puis AH. Alors $\\mathcal{A}=\\dfrac{BC\\cdot AH}{2}$.',
        },
        {
          kind: 'entrainement',
          title: "Droites remarquables d'un triangle",
          generatorId: 'gen94',
          description: ["Écris les équations des médiatrices, des hauteurs ou des médianes d'un triangle et trouve leur point de concours. Ou calcule son aire avec une base et la distance du sommet opposé à la droite de ce côté."],
          chantier: '4e',
          whereLabel: "4e → « 94. Droites remarquables d'un triangle »",
        },
        {
          kind: 'methode',
          label: 'Projeté orthogonal et symétrique d\'un point',
          items: [
            'Le pied H de la perpendiculaire à d passant par A s\'appelle le **projeté orthogonal** de A sur d : on le trouve exactement comme pour la distance (perpendiculaire par A, puis intersection avec d).',
            'Le **symétrique** A′ de A par rapport à d est le point tel que H soit le milieu de [AA′] : $x_{A\'}=2x_H-x_A$ et $y_{A\'}=2y_H-y_A$.',
            'Attention au sens : c\'est H qui est au milieu, donc $2x_H-x_A$, et jamais $2x_A-x_H$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5,
            xMax: 4.5,
            yMin: -2,
            yMax: 4.5625,
            grid: true,
            vectors: [
              { from: { x: -2.5, y: 4.5 }, to: { x: 4, y: -2 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: 3 }, to: { x: 1, y: 1 }, tone: 'good', tick: true, arrow: false },
              { from: { x: 1, y: 1 }, to: { x: -1, y: -1 }, tone: 'good', tick: true, arrow: false },
            ],
            points: [
              { x: 3, y: 3, label: 'A(3 ; 3)', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 1, label: 'H(1 ; 1)', tone: 'accent', labelPos: 'right' },
              { x: -1, y: -1, label: 'A′(−1 ; −1)', tone: 'good', labelPos: 'right' },
              { x: -1.9, y: 3.3, label: 'd', tone: 'accent', node: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 1, y: 1 }, arm1: { x: 3, y: 3 }, arm2: { x: 3, y: -1 } }],
            caption:
              'd : $x + y - 2 = 0$ — H est le projeté orthogonal de A sur d, et le milieu de [AA′] : ' +
              '$x_{A\'} = 2 \\cdot 1 - 3 = -1$, $y_{A\'} = 2 \\cdot 1 - 3 = -1$',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les coordonnées du symétrique',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $H(x_H\\,;\\,y_H)$ le projeté orthogonal de $A(x_A\\,;\\,y_A)$ sur d. Par définition, le ' +
                'symétrique $A\'(x_{A\'}\\,;\\,y_{A\'})$ de A par rapport à d est le point tel que H soit le milieu ' +
                'de [AA′].',
            },
            {
              kind: 'para',
              text:
                'Les coordonnées du milieu donnent $x_H = \\dfrac{x_A + x_{A\'}}{2}$ et ' +
                '$y_H = \\dfrac{y_A + y_{A\'}}{2}$.',
            },
            {
              kind: 'para',
              text:
                'On multiplie par 2 : $2x_H = x_A + x_{A\'}$, puis on isole $x_{A\'}$ : $x_{A\'} = 2x_H - x_A$. ' +
                'De même, $2y_H = y_A + y_{A\'}$ donne $y_{A\'} = 2y_H - y_A$.',
            },
            {
              kind: 'para',
              text:
                'Contrôle avec les vecteurs : H est le milieu de [AA′], donc $\\vec{AH} = \\vec{HA\'}$, soit ' +
                '$x_H - x_A = x_{A\'} - x_H$ : on retrouve $x_{A\'} = 2x_H - x_A$.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Réflexion : où viser ?',
          text:
            'Une bille qui rebondit sur une bande, un rayon lumineux sur un miroir, un ballon contre un mur repartent ' +
            'comme s\'ils venaient du **symétrique** A′ du point de départ A. Pour aller de A à B en touchant d, on vise ' +
            'donc le point I où la droite (A′B) coupe d. Comme la symétrie conserve les longueurs, le trajet ' +
            '$AI+IB$ vaut exactement $A\'B$.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.2,
            xMax: 7.3,
            yMin: -3.8,
            yMax: 4.17,
            vectors: [
              { from: { x: 1, y: 3 }, to: { x: 4, y: 0 }, tone: 'good', arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 6, y: 2 }, tone: 'good' },
              { from: { x: 1, y: -3 }, to: { x: 4, y: 0 }, tone: 'faint', dashed: true },
              { from: { x: 1, y: 3 }, to: { x: 1, y: -3 }, tone: 'faint', dashed: true },
              { from: { x: 1, y: 3 }, to: { x: 2, y: 0 }, tone: 'bad', dashed: true },
              { from: { x: 2, y: 0 }, to: { x: 6, y: 2 }, tone: 'bad', dashed: true },
            ],
            points: [
              { x: 1, y: 3, label: 'A(1 ; 3)', tone: 'ink', labelPos: 'above' },
              { x: 6, y: 2, label: 'B(6 ; 2)', tone: 'ink', labelPos: 'above' },
              { x: 1, y: -3, label: 'A′(1 ; −3)', tone: 'ink', labelPos: 'right' },
              { x: 4, y: 0, tone: 'good' },
              { x: 4.15, y: -0.55, label: 'I(4 ; 0)', tone: 'good', node: false, labelPos: 'right' },
              { x: 2, y: 0, label: 'J', tone: 'bad', labelPos: 'below' },
            ],
            caption:
              'le mur d est l\'axe Ox : A′ est le symétrique de A, et I le point où (A′B) coupe d. ' +
              '$AI + IB = A\'B = \\sqrt{50} \\approx 7{,}07$, alors qu\'en passant par J(2 ; 0) : ' +
              '$AJ + JB = \\sqrt{10} + \\sqrt{20} \\approx 7{,}63$, plus long',
          },
        },
        {
          kind: 'atelier',
          tag: 'reflexion-viser-widget',
          label: 'Manipule toi-même : réflexion, où viser ?',
          caption:
            'Déplace A, B et la droite d (fixée par D et E) : l\'atelier construit le projeté H de A, ' +
            'le symétrique A′, puis le point visé I, où (A′B) coupe d. Le trajet AI + IB vaut A′B. ' +
            'Fais glisser J le long de d : le trajet AJ + JB est toujours plus long, sauf quand J ' +
            'arrive en I. Le réglage de départ reproduit la figure ci-dessus.',
        },
        {
          kind: 'entrainement',
          title: 'Projeté orthogonal, symétrique et réflexion',
          generatorId: 'gen96',
          description: ['Construis la perpendiculaire, trouve le projeté H puis le symétrique A′. En contexte (billard, miroir, mur) : où viser pour atteindre B après un rebond ?'],
          chantier: '4e',
          whereLabel: '4e → « 96. Projeté orthogonal, symétrique et réflexion »',
        },
      ],
    },

    {
      id: 'notion-lieu',
      number: 7,
      title: "Qu'est-ce qu'un lieu géométrique ?",
      kicker: 'propriété caractéristique — tous les points qui la partagent, et eux seuls',
      titreCourt: 'Lieu géométrique',
      partie: 'Lieux géométriques : cercle et parabole',
      essentiel: [
        'Un **lieu géométrique** est l\'ensemble de tous les points qui partagent une propriété — et qui sont les seuls à la partager.',
        'Équidistants de deux parallèles : la parallèle à mi-chemin ; à une distance donnée d\'une droite : la **réunion** de deux parallèles, une de chaque côté.',
        'Équidistants de A et B : on traduit $MA = MB$ par $MA^2 = MB^2$, ce qui donne la médiatrice de [AB].',
      ],
      cartes: [
        { question: 'Quel est le lieu des points situés à la distance r d\'une droite d ?', reponse: 'La réunion de deux droites parallèles à d, une de chaque côté.' },
        { question: 'Quel est le lieu des points équidistants de deux droites parallèles ?', reponse: 'La parallèle située exactement à mi-chemin.' },
        { question: 'Comment traduire « M est équidistant de A et de B » en équation ?', reponse: '$MA^2 = MB^2$ : on obtient la médiatrice de [AB].' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Un **lieu géométrique** est un ensemble de points défini par une phrase — pas par ' +
            "une équation déjà donnée. La première étape, souvent la plus délicate, c'est de " +
            "reconnaître de quelle figure il s'agit (droite, cercle ou parabole), puis d'en " +
            'extraire les paramètres.',
        },
        {
          kind: 'intuition',
          label: 'Pour se représenter un lieu',
          text:
            'Imagine tout le monde dans un parc se plaçant exactement à 5 mètres d\'un arbre : ' +
            'ensemble, ces personnes dessinent un cercle autour de l\'arbre — pas UNE position, ' +
            'mais TOUTES celles qui vérifient la même condition, et elles seules. Un lieu ' +
            'géométrique, c\'est exactement ça : l\'ensemble de tous les points qui obéissent à ' +
            'une règle donnée, rien de plus.',
        },
        {
          kind: 'definition',
          label: 'Définition formelle',
          items: [
            'Un lieu géométrique est un ensemble de points qui partagent tous une **propriété ' +
              'commune** — et qui sont les **seuls** à la partager. Voici deux exemples ' +
              'classiques, à connaître avant même de traduire une phrase en équation :',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1,
            xMax: 8,
            yMin: -0.5,
            yMax: 2.5,
            showAxes: false,
            vectors: [
              { from: { x: -1, y: 2 }, to: { x: 7.5, y: 2 }, tone: 'ink', arrow: false },
              { from: { x: -1, y: 1 }, to: { x: 7.5, y: 1 }, tone: 'accent', arrow: false },
              { from: { x: -1, y: 0 }, to: { x: 7.5, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 2.15 }, to: { x: 3, y: -0.15 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 7.7, y: 2, label: 'a', tone: 'ink', node: false },
              { x: 7.7, y: 1, label: 'c', tone: 'accent', node: false },
              { x: 7.7, y: 0, label: 'b', tone: 'ink', node: false },
            ],
            caption: 'c, équidistante de a et b — le lieu des points équidistants de deux parallèles, c\'est la parallèle médiane',
          },
        },
        {
          kind: 'list',
          items: [
            '**Équidistant de deux droites parallèles** — le lieu, c\'est la droite **parallèle**, exactement à mi-chemin entre les deux.',
            '**À une distance donnée d\'une droite** — le lieu, c\'est la **réunion** de deux droites parallèles à celle-ci (une de chaque côté). Jamais une seule des deux ! Chacune prise isolément ne contient pas tous les points situés à cette distance.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1,
            xMax: 7,
            yMin: -1.6,
            yMax: 1.6,
            showAxes: false,
            vectors: [
              { from: { x: -1, y: 0 }, to: { x: 6.6, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: -1, y: 1 }, to: { x: 6.6, y: 1 }, tone: 'accent', arrow: false },
              { from: { x: -1, y: -1 }, to: { x: 6.6, y: -1 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 3, y: 1 }, tone: 'good' },
              { from: { x: 3, y: 0 }, to: { x: 3, y: -1 }, tone: 'good' },
            ],
            points: [
              { x: 6.8, y: 0, label: 'd', tone: 'ink', node: false },
              { x: 3.3, y: 0.5, label: 'r', tone: 'good', node: false },
              { x: 3.3, y: -0.5, label: 'r', tone: 'good', node: false },
            ],
            caption: 'les points à la distance r de d : la réunion des deux parallèles orange, une de chaque côté',
          },
        },
        { kind: 'subheading', text: 'Traduire une phrase en équation : la médiatrice' },
        {
          kind: 'exemple',
          badge: 'la médiatrice comme lieu',
          formula: 'Trouve l\'équation du lieu des points M(x ; y) équidistants de A(1 ; 2) et B(5 ; 4).',
          steps: [
            { tag: 'traduire', text: 'MA = MB ⟺ MA² = MB² : $(x-1)^2 + (y-2)^2 = (x-5)^2 + (y-4)^2$' },
            { tag: 'développer', text: '$x^2 - 2x + 1 + y^2 - 4y + 4 = x^2 - 10x + 25 + y^2 - 8y + 16$' },
            { tag: 'les carrés s\'éliminent', text: '$8x + 4y - 36 = 0$, soit $2x + y - 9 = 0$' },
          ],
          result: { tag: 'résultat', text: 'une droite, $2x + y - 9 = 0$ : la médiatrice de [AB] — elle passe par le milieu (3 ; 3) et elle est perpendiculaire à $\\vec{AB}\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -1,
            yMax: 6,
            grid: true,
            vectors: [
              { from: { x: 1, y: 2 }, to: { x: 5, y: 4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 1.6, y: 5.8 }, to: { x: 4.8, y: -0.6 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 1, y: 2, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 4, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 3, label: '(3 ; 3)', tone: 'good', labelPos: 'right' },
            ],
            rightAngleMarkers: [{ vertex: { x: 3, y: 3 }, arm1: { x: 5, y: 4 }, arm2: { x: 2.5, y: 4 } }],
            caption: 'tous les points de la droite orange sont à la même distance de A et de B — et eux seuls',
          },
        },
        { kind: 'subheading', text: 'Traduire les autres lieux en équation' },
        {
          kind: 'methode',
          label: 'Méthode — de la phrase à l\'équation',
          items: [
            '**À la distance r d\'une droite d** — deux parallèles à d, de même vecteur normal $\\vec{n}$. Pars d\'un point A de d et avance de r le long de $\\vec{n}$, dans un sens puis dans l\'autre : $B = A + \\dfrac{r}{\\|\\vec{n}\\|}\\,\\vec{n}$ et $B\' = A - \\dfrac{r}{\\|\\vec{n}\\|}\\,\\vec{n}$. Chaque parallèle passe par l\'un de ces points. Pour une horizontale $y = k$ : simplement $y = k + r$ et $y = k - r$.',
            '**Équidistant de deux parallèles** — écris d\'abord les deux équations avec les **mêmes** coefficients de x et de y, $ax + by + c_1 = 0$ et $ax + by + c_2 = 0$ ; la parallèle médiane est $ax + by + \\dfrac{c_1 + c_2}{2} = 0$.',
            '**Équidistant d\'un point F et d\'une droite d** — la parabole de foyer F et de directrice d (section 9) : sommet à mi-chemin, p signé, puis $(x - x_S)^2 = 2p(y - y_S)$.',
            '**À la distance r d\'un point C** — le cercle de centre C et de rayon r (section 8), d\'équation $(x - x_C)^2 + (y - y_C)^2 = r^2$',
          ],
        },
        {
          kind: 'exemple',
          badge: 'à une distance donnée d\'une droite',
          formula: 'Trouve les équations du lieu des points situés à la distance 10 de la droite $d \\equiv 3x + 4y - 12 = 0$.',
          steps: [
            { tag: 'un point et le vecteur normal', text: '$A(4\\,;\\,0)$ est sur d ; $\\vec{n}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$, $\\|\\vec{n}\\| = \\sqrt{9 + 16} = 5$, donc $\\dfrac{10}{5}\\,\\vec{n} = \\begin{pmatrix} 6 \\\\ 8 \\end{pmatrix}$' },
            { tag: 'deux points du lieu', text: '$B = A + \\begin{pmatrix} 6 \\\\ 8 \\end{pmatrix} = (10\\,;\\,8)$ et $B\' = A - \\begin{pmatrix} 6 \\\\ 8 \\end{pmatrix} = (-2\\,;\\,-8)$' },
            { tag: 'les deux parallèles', text: '$3(x - 10) + 4(y - 8) = 0$, soit $3x + 4y - 62 = 0$ ; $3(x + 2) + 4(y + 8) = 0$, soit $3x + 4y + 38 = 0$' },
          ],
          result: { tag: 'résultat', text: 'la réunion des droites $3x + 4y - 62 = 0$ et $3x + 4y + 38 = 0$ — d est à mi-chemin : $\\dfrac{-62 + 38}{2} = -12$' },
        },
        {
          kind: 'piege',
          label: 'Piège — décaler le terme constant de r',
          text:
            'Pour $d \\equiv 3x + 4y - 12 = 0$ et $r = 10$, les droites $3x + 4y - 22 = 0$ et $3x + 4y - 2 = 0$ (terme constant décalé de 10) ne sont **pas** à la ' +
            'distance 10 de d : elles n\'en sont qu\'à 2. Le terme constant s\'écarte de $r \\cdot \\|\\vec{n}\\|$ : ' +
            'passe toujours par les points B et B′.',
        },
        {
          kind: 'entrainement',
          title: 'Traduire un lieu géométrique en équation',
          generatorId: 'gen131',
          description: [
            'Médiatrice, deux parallèles, parallèle médiane, parabole ou cercle : reconnais le lieu décrit par une phrase, puis construis son équation.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 131. Traduire un lieu géométrique en équation »',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la médiatrice, en coordonnées',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$ deux points distincts, et $M(x\\,;\\,y)$. Les ' +
                'distances sont positives, donc $MA = MB \\iff MA^2 = MB^2$, c\'est-à-dire ' +
                '$(x-x_A)^2+(y-y_A)^2 = (x-x_B)^2+(y-y_B)^2$.',
            },
            {
              kind: 'para',
              text:
                'On développe : $x^2 - 2x_Ax + x_A^2 + y^2 - 2y_Ay + y_A^2 = x^2 - 2x_Bx + x_B^2 + y^2 - 2y_By + y_B^2$. ' +
                'Les termes $x^2$ et $y^2$ s\'éliminent, et il reste ' +
                '$2(x_B-x_A)\\,x + 2(y_B-y_A)\\,y + x_A^2+y_A^2-x_B^2-y_B^2 = 0$.',
            },
            {
              kind: 'para',
              text:
                'A et B sont distincts, donc $x_B-x_A$ et $y_B-y_A$ ne sont pas tous deux nuls : c\'est ' +
                'l\'équation d\'une **droite**. Son vecteur normal est ' +
                '$\\begin{pmatrix} 2(x_B-x_A) \\\\ 2(y_B-y_A) \\end{pmatrix} = 2\\vec{AB}$ : elle est ' +
                'perpendiculaire à (AB).',
            },
            {
              kind: 'para',
              text:
                'Le milieu I de [AB] vérifie $IA = IB$ : il est sur cette droite. Le lieu est donc la droite ' +
                'perpendiculaire à (AB) qui passe par le milieu de [AB] : la médiatrice de [AB].',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'lieu-trace-widget',
          label: 'Manipule toi-même : le lieu se dessine',
          caption:
            'Choisis une règle, puis déplace le point M : chaque position laisse une trace verte si ' +
            'la règle est vérifiée, rouge sinon. Les traces vertes dessinent peu à peu le lieu. ' +
            '« Révéler le lieu » trace la médiatrice, les deux parallèles, la parallèle médiane, la ' +
            'parabole ou le cercle, avec son équation.',
        },
      ],
    },

    {
      id: 'cercle',
      number: 8,
      title: 'Le cercle',
      kicker: "(x−x₀)² + (y−y₀)² = r² — depuis un graphe, ou depuis l'équation développée",
      titreCourt: 'Le cercle',
      partie: 'Lieux géométriques : cercle et parabole',
      essentiel: [
        'Cercle de centre $(x_0 ; y_0)$ et de rayon r : $(x-x_0)^2+(y-y_0)^2=r^2$ — c\'est Pythagore.',
        'Depuis $x^2 + y^2 + Dx + Ey + F = 0$ (même coefficient devant x² et y²), on complète les carrés : un second membre positif est r², nul donne un seul point, négatif aucun point.',
        'La tangente en P est perpendiculaire au rayon [CP]. Une droite est extérieure, tangente ou sécante selon que CH > r, CH = r ou CH < r.',
      ],
      cartes: [
        { question: 'Centre et rayon de $(x-2)^2+(y+3)^2=25$ ?', reponse: 'Centre (2 ; −3), rayon 5.' },
        { question: 'Centre C(1 ; 1) et point P(4 ; 5) du cercle : quelle équation ?', reponse: '$r = \\sqrt{3^2+4^2} = 5$ : $(x-1)^2+(y-1)^2=25$.' },
        { question: 'Après avoir complété les carrés, le second membre vaut −5. Conclusion ?', reponse: 'Aucun point : une somme de carrés n\'est jamais négative, ce n\'est pas un cercle.' },
        { question: 'Quand une droite est-elle tangente à un cercle ?', reponse: 'Quand la distance CH du centre à la droite est égale au rayon.' },
      ],
      blocks: [
        { kind: 'video', title: 'Le cercle : équation, centre et rayon', youtubeId: 'tSgRL4q19Go' },
        {
          kind: 'para',
          text:
            'Un cercle de centre $(x_0 ; y_0)$ et de rayon r, c\'est l\'ensemble des points ' +
            'situés exactement à distance r du centre. Ça donne directement son équation, par ' +
            'Pythagore.',
        },
        {
          kind: 'intuition',
          label: 'Comme un compas de jardinier',
          text:
            'Plante un piquet au centre, attache une corde de longueur r, tends-la et tourne : tu ' +
            'traces exactement un cercle — parce que chaque point du tracé reste à la même ' +
            'distance r du piquet, ni plus ni moins. L\'équation du cercle ne dit rien d\'autre ' +
            'que ça, juste en langage algébrique.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — l\'équation du cercle, par Pythagore',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit le cercle de centre $C(x_0\\,;\\,y_0)$ et de rayon $r > 0$. Un point $P(x\\,;\\,y)$ ' +
                'appartient au cercle exactement quand $CP = r$.',
            },
            {
              kind: 'para',
              text:
                'Le vecteur $\\vec{CP}\\begin{pmatrix} x - x_0 \\\\ y - y_0 \\end{pmatrix}$ a pour norme, par ' +
                'Pythagore, $CP = \\sqrt{(x-x_0)^2+(y-y_0)^2}$. La condition s\'écrit donc ' +
                '$\\sqrt{(x-x_0)^2+(y-y_0)^2} = r$.',
            },
            {
              kind: 'para',
              text:
                'Les deux membres sont positifs : on peut les élever au carré sans perdre ni ajouter de ' +
                'solution. On obtient $(x-x_0)^2+(y-y_0)^2=r^2$.',
            },
            {
              kind: 'para',
              text: 'Cas particulier : le cercle centré à l\'origine a pour équation $x^2+y^2=r^2$.',
            },
          ],
        },
        {
          kind: 'historique',
          titre: 'Le théorème que tu croyais réservé aux triangles',
          text:
            "L'équation du cercle que tu viens d'obtenir, $(x-x_0)^2+(y-y_0)^2=r^2$, n'est " +
            'rien d\'autre que le théorème de **Pythagore** (6e siècle avant J.-C.) écrit ' +
            'avec des coordonnées : la distance entre deux points, ' +
            '$\\sqrt{(x-x_0)^2+(y-y_0)^2}$, est l\'hypoténuse d\'un triangle rectangle dont ' +
            'les deux côtés mesurent $|x-x_0|$ et $|y-y_0|$. Ce résultat est attribué à ' +
            'Pythagore et à son école, dans la Grèce antique, qui le pensaient pour des ' +
            'triangles concrets, dessinés — ils n\'avaient ni coordonnées, ni algèbre, ni même de ' +
            'notation symbolique pour les nombres inconnus. Il faudra attendre près de 2000 ' +
            'ans, et l\'invention du repère par Fermat et Descartes, pour que ce théorème ' +
            'devienne aussi l\'équation d\'un cercle.',
        },
        { kind: 'subheading', text: 'Équation depuis un graphe' },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 3.2,
            yMin: -3,
            yMax: 3.2,
            showAxes: false,
            circle: { cx: 0, cy: 0, r: 2.5, tone: 'accent' },
            vectors: [{ from: { x: 0, y: 0 }, to: { x: 1.434, y: 2.048 }, tone: 'good' }],
            points: [
              { x: 0, y: 0, label: 'C(x₀ ; y₀)', tone: 'ink', labelPos: 'left' },
              { x: 1.434, y: 2.048, label: 'point marqué', tone: 'good', labelPos: 'right' },
              { x: 0.9, y: 1.2, label: 'r', tone: 'good', node: false },
            ],
            caption: 'rayon lu directement si le point marqué est sur la même horizontale ou la même verticale que le centre ; sinon, calculé par Pythagore',
          },
        },
        {
          kind: 'exemple',
          badge: 'rayon indirect',
          formula: 'Centre C(1 ; 1), point marqué P(4 ; 5) sur le cercle (ni sur l\'horizontale ni sur la verticale de C).',
          steps: [{ tag: 'vecteur CP', text: '$\\begin{pmatrix} 4-1 \\\\ 5-1 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$' }],
          result: { tag: 'équation', text: '$r = \\|\\vec{CP}\\| = \\sqrt{3^2+4^2} = \\sqrt{25} = 5$ → $(x-1)^2+(y-1)^2=25$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: 0,
            xMax: 5,
            yMin: 0,
            yMax: 6,
            grid: true,
            vectors: [
              { from: { x: 1, y: 1 }, to: { x: 4, y: 1 }, tone: 'tip', dashed: true, arrow: false },
              { from: { x: 4, y: 1 }, to: { x: 4, y: 5 }, tone: 'tip', dashed: true, arrow: false },
              { from: { x: 1, y: 1 }, to: { x: 4, y: 5 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 1, y: 1, label: 'C(1 ; 1)', tone: 'ink', labelPos: 'below' },
              { x: 4, y: 5, label: 'P(4 ; 5)', tone: 'ink', labelPos: 'above' },
              { x: 2.5, y: 0.7, label: '3', tone: 'tip', node: false },
              { x: 4.35, y: 3, label: '4', tone: 'tip', node: false },
              { x: 2.1, y: 3.4, label: 'r = 5', tone: 'accent', node: false },
            ],
            caption: 'le rayon est l\'hypoténuse d\'un triangle rectangle de côtés 3 et 4',
          },
        },
        { kind: 'subheading', text: "Centre et rayon depuis l'équation développée" },
        {
          kind: 'para',
          text:
            'En développant $(x-x_0)^2+(y-y_0)^2=r^2$, tu obtiens une équation de la forme ' +
            '$x^2 + y^2 + D \\cdot x + E \\cdot y + F = 0$ — parfois multipliée par un nombre k, ' +
            'ce qui donne **le même coefficient k devant x² et devant y²**. Retrouver le centre et ' +
            "le rayon, c'est faire le chemin inverse : diviser par k, regrouper, puis compléter le carré.",
        },
        {
          kind: 'attention',
          label: 'Condition — même coefficient devant x² et y²',
          text:
            'Si les coefficients de x² et de y² sont **différents**, l\'équation ne décrit pas ' +
            'un cercle : ce peut être une ellipse, une hyperbole, une parabole, ou même aucun point ' +
            '(tu verras ces courbes, les coniques, en 6e). Cette méthode ne marche que si le ' +
            'coefficient est identique sur les deux carrés.',
        },
        {
          kind: 'exemple',
          badge: 'compléter le carré',
          formula: '$2x^2+2y^2-8x+12y-24=0$',
          steps: [
            { tag: 'diviser par le coefficient commun (2)', text: '$x^2+y^2-4x+6y-12=0$' },
            { tag: 'regrouper x et y séparément', text: '$(x^2-4x)+(y^2+6y)=12$' },
            { tag: 'compléter chaque carré', text: '$(x-2)^2-4+(y+3)^2-9=12$' },
          ],
          result: { tag: 'forme centre-rayon', text: '$(x-2)^2+(y+3)^2=25$ → centre (2 ; −3), rayon 5' },
        },
        {
          kind: 'astuce',
          text:
            "Rayon rationnel ou irrationnel — le nombre que tu obtiens au second membre après " +
            "avoir complété le carré n'est pas toujours un carré parfait. Le rayon peut alors " +
            'rester sous forme de racine (par exemple $r = \\sqrt{18} = 3\\sqrt{2}$) — exactement comme une norme de vecteur.',
        },
        {
          kind: 'attention',
          label: 'Toutes ces équations ne sont pas des cercles',
          text:
            'Après avoir complété le carré, regarde le second membre. **Positif** : c\'est r², tu ' +
            'as bien un cercle. **Nul** : un seul point, le centre. **Négatif** : aucun point du ' +
            'plan ne convient, car une somme de carrés ne peut jamais être négative.',
        },
        {
          kind: 'exemple',
          badge: 'un second membre négatif',
          formula: '$x^2+y^2-2x+4y+10=0$',
          steps: [
            { tag: 'regrouper', text: '$(x^2-2x)+(y^2+4y) = -10$' },
            { tag: 'compléter chaque carré', text: '$(x-1)^2 - 1 + (y+2)^2 - 4 = -10 \\to (x-1)^2+(y+2)^2 = -5$' },
          ],
          result: { tag: 'résultat', text: 'impossible : une somme de carrés vaut au moins 0 — aucun point, ce n\'est pas un cercle' },
        },
        { kind: 'subheading', text: 'Pour aller plus loin — la tangente en un point du cercle' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la tangente est perpendiculaire au rayon',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit un cercle de centre C et de rayon r, P un point de ce cercle, et t la droite qui passe ' +
                'par P, perpendiculaire à (CP). Montrons que t n\'a que le point P en commun avec le cercle : ' +
                'c\'est la tangente en P.',
            },
            {
              kind: 'para',
              text:
                'Soit M un point de t, différent de P. La droite (PM) est t, perpendiculaire à (CP) : le ' +
                'triangle CPM est rectangle en P. Par Pythagore, $CM^2 = CP^2 + PM^2 = r^2 + PM^2$.',
            },
            {
              kind: 'para',
              text:
                'Comme $M \\neq P$, $PM^2 > 0$, donc $CM^2 > r^2$ et $CM > r$ : M est à l\'extérieur du cercle. ' +
                'Le seul point commun de t et du cercle est P.',
            },
            {
              kind: 'para',
              text:
                'En coordonnées : la tangente en P a pour vecteur normal $\\vec{CP}$. Un point M est sur elle ' +
                'exactement quand $\\vec{CP} \\cdot \\vec{PM} = 0$, l\'équation du formulaire.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'tangente en un point du cercle',
          formula: 'Écris l\'équation de la tangente au cercle $(x-1)^2+(y-1)^2=25$ au point P(4 ; 5).',
          steps: [
            { tag: 'propriété', text: 'la tangente en P est perpendiculaire au rayon [CP], avec C(1 ; 1)' },
            { tag: 'vecteur normal', text: '$\\vec{CP}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ est normal à la tangente : $3(x-4) + 4(y-5) = 0$' },
          ],
          result: { tag: 'tangente', text: '$3x + 4y - 32 = 0$ — contrôle : $3 \\cdot 4 + 4 \\cdot 5 - 32 = 0$ ✓' },
        },
        { kind: 'subheading', text: "Pour aller plus loin — position relative d'une droite et d'un cercle" },
        {
          kind: 'methode',
          label: 'Méthode — comparer la distance au rayon',
          items: [
            'Calcule la distance CH du centre C à la droite d, comme à la section 6 : perpendiculaire à d par C, pied H, puis norme de $\\vec{CH}$.',
            'Compare-la au rayon r. **CH > r** : d est extérieure au cercle (aucun point commun). **CH = r** : d est tangente au cercle en H (un seul point commun). **CH < r** : d est sécante (deux points communs).',
            'Pour comparer deux racines, compare leurs carrés : $CH^2$ avec $r^2$, jamais $CH^2$ avec r.',
            'Même idée à l\'envers : le cercle de centre C tangent à une droite d a pour rayon $r = CH$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'droite et cercle : distance et rayon',
          formula: 'Position relative de la droite $d : x + 2y + 5 = 0$ et du cercle $\\Gamma : x^2+y^2-6x-2y-8=0$.',
          steps: [
            { tag: 'centre et rayon', text: '$(x-3)^2+(y-1)^2=18$ : centre C(3 ; 1), rayon $r=\\sqrt{18}=3\\sqrt{2}$' },
            {
              tag: 'pied H',
              text: 'perpendiculaire par C : $\\begin{cases} x = 3+t \\\\ y = 1+2t \\end{cases}$ ; $(3+t)+2(1+2t)+5=0 \\to 5t+10=0 \\to t=-2$ → H(1 ; −3)',
            },
            { tag: 'distance', text: '$CH=\\sqrt{(1-3)^2+(-3-1)^2}=\\sqrt{20}=2\\sqrt{5}$' },
          ],
          result: { tag: 'comparaison', text: '$CH^2=20>18=r^2$, donc $CH>r$ : d est extérieure à Γ, aucun point commun' },
        },
        { kind: 'subheading', text: 'Pour aller plus loin — déterminer un cercle par des conditions' },
        {
          kind: 'methode',
          label: 'Méthode — trouver d\'abord le centre Ω, puis le rayon',
          items: [
            '**Diamètre [AB]** : Ω est le milieu de [AB] et $r=\\dfrac{AB}{2}=\\Omega A$.',
            '**Trois points A, B, C** : Ω est à égale distance des trois points, donc sur la médiatrice de [AB] et sur celle de [BC] (section 7). Ω est l\'intersection de ces deux médiatrices.',
            '**Deux points A, B et un centre sur une droite d** : Ω est l\'intersection de d et de la médiatrice de [AB].',
            'La médiatrice de [AB] passe par le milieu M de [AB] et a pour vecteur normal $\\vec{AB}$ : $a(x-x_M)+b(y-y_M)=0$. Le rayon vaut ensuite $r=\\Omega A$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cercle passant par trois points',
          formula: 'Équation du cercle qui passe par A(4 ; 5), B(−2 ; 5) et C(6 ; 1).',
          steps: [
            { tag: 'médiatrice de [AB]', text: 'milieu (1 ; 5), vecteur normal $\\vec{AB}\\begin{pmatrix} -6 \\\\ 0 \\end{pmatrix}$ : $-6(x-1)=0$, soit $x=1$' },
            { tag: 'médiatrice de [AC]', text: 'milieu (5 ; 3), vecteur normal $\\vec{AC}\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$ : $2(x-5)-4(y-3)=0 \\to x-2y+1=0$' },
            { tag: 'centre Ω', text: '$x=1 \\to 1-2y+1=0 \\to y=1$ : Ω(1 ; 1)' },
          ],
          result: { tag: 'cercle', text: '$r=\\Omega A=\\sqrt{3^2+4^2}=5$ → $(x-1)^2+(y-1)^2=25$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4.8,
            xMax: 6.7,
            yMin: -4.6,
            yMax: 6.18,
            grid: true,
            circle: { cx: 1, cy: 1, r: 5, tone: 'accent' },
            vectors: [
              { from: { x: 4, y: 5 }, to: { x: -2, y: 5 }, tone: 'faint', arrow: false },
              { from: { x: 4, y: 5 }, to: { x: 6, y: 1 }, tone: 'faint', arrow: false },
              { from: { x: 1, y: -4.6 }, to: { x: 1, y: 6.18 }, tone: 'good', dashed: true, arrow: false },
              { from: { x: -4.8, y: -1.9 }, to: { x: 6.7, y: 3.85 }, tone: 'good', dashed: true, arrow: false },
            ],
            points: [
              { x: 4, y: 5, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: -2, y: 5, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 6, y: 1, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 1, tone: 'accent' },
              { x: 1.25, y: 0.35, label: 'Ω(1 ; 1)', tone: 'accent', node: false, labelPos: 'right' },
            ],
            caption:
              'médiatrices de [AB], $x = 1$, et de [AC], $x - 2y + 1 = 0$, en pointillés : elles se coupent ' +
              'au centre Ω(1 ; 1), à la distance 5 des trois points',
          },
        },
        {
          kind: 'atelier',
          tag: 'cercle-equation-widget',
          label: 'Manipule toi-même : centre, rayon et équation',
          caption:
            'Règle le centre et le rayon, et regarde l\'équation se développer. Ou pars ' +
            'd\'une équation développée, et complète les carrés pour retrouver le centre et ' +
            'le rayon. Attention : si le second membre est négatif, ce n\'est pas un cercle. ' +
            'L\'option « Tangente » trace en un point P la tangente, perpendiculaire au ' +
            'rayon [CP], avec son équation.',
        },
        {
          kind: 'application',
          titre: 'Trouver sa position grâce à trois cercles',
          image: {
            src: '/images/application/gps-satellite.jpg',
            alt: 'Illustration d\'un satellite GPS en orbite',
            caption: 'Satellite GPS en orbite. Photo : NASA, domaine public.',
          },
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -6,
              xMax: 14,
              yMin: -6,
              yMax: 14,
              circles: [
                { cx: 0, cy: 0, r: 5, tone: 'accent' },
                { cx: 8, cy: 0, r: 5, tone: 'good' },
                { cx: 3, cy: 8, r: 5.1, tone: 'good' },
              ],
              points: [
                { x: 0, y: 0, label: 'satellite 1', tone: 'accent', labelPos: 'below' },
                { x: 8, y: 0, label: 'satellite 2', tone: 'good', labelPos: 'below' },
                { x: 3, y: 8, label: 'satellite 3', tone: 'good', labelPos: 'above' },
                { x: 4, y: 3, label: 'position calculée', tone: 'ink', labelPos: 'right' },
              ],
              caption:
                "Chaque cercle, c'est « être à la distance mesurée r de ce satellite ». Un " +
                'seul cercle laisse une infinité de positions ; les trois cercles ensemble ' +
                "ne se recoupent qu'en un seul point commun — la trilatération qui donne la " +
                'position GPS.',
            },
          ],
          text:
            'Un récepteur GPS ne « voit » jamais directement sa position : il la calcule. ' +
            'Chaque satellite envoie un signal horodaté, et le récepteur mesure le temps que ' +
            'ce signal a mis à arriver pour en déduire sa distance exacte à ce satellite. ' +
            'Connaître sa distance à un satellite, c\'est savoir qu\'on se trouve quelque ' +
            'part sur une sphère centrée sur ce satellite. Raisonnons **dans le plan**, où la ' +
            'sphère devient un cercle — exactement l\'équation $(x-x_0)^2+(y-y_0)^2=r^2$ de cette ' +
            'section, avec r la distance mesurée. Avec un seul satellite, une infinité de ' +
            'positions sont possibles ; avec un deuxième, l\'intersection des deux cercles réduit ' +
            'à 2 points ; un troisième satellite élimine la dernière ambiguïté. C\'est cette ' +
            'méthode, appelée **trilatération**, qui permet à ton téléphone d\'afficher ta ' +
            'position à quelques mètres près. Dans l\'espace, deux sphères se coupent en tout un ' +
            'cercle, il faut donc une sphère de plus ; et un vrai récepteur utilise encore un ' +
            'satellite supplémentaire pour corriger l\'erreur de sa propre horloge.',
          domaines: ['Navigation', 'Technologie'],
        },
        {
          kind: 'entrainement',
          title: 'Équation depuis un graphe',
          generatorId: 'gen49',
          description: ["Lis le centre et un point du cercle sur un graphe. Puis écris l'équation non développée."],
          chantier: '4e',
          whereLabel: "4e → « 49. Équation d'un cercle depuis un graphe »",
        },
        {
          kind: 'entrainement',
          title: 'Centre et rayon',
          generatorId: 'gen50',
          description: ["Pars de l'équation développée. Complète le carré et retrouve le centre et le rayon exacts."],
          chantier: '4e',
          whereLabel: "4e → « 50. Centre et rayon d'un cercle »",
        },
        {
          kind: 'entrainement',
          title: 'Tangente et position relative',
          generatorId: 'gen92',
          description: ["Écris la tangente en un point du cercle. Décide si une droite est extérieure, tangente ou sécante à un cercle en comparant la distance du centre au rayon. Ou trouve le cercle de centre donné tangent à une droite."],
          chantier: '4e',
          whereLabel: "4e → « 92. Tangente et position relative d'une droite et d'un cercle »",
        },
        {
          kind: 'entrainement',
          title: 'Déterminer un cercle par des conditions',
          generatorId: 'gen93',
          description: ['Trouve l\'équation d\'un cercle à partir de son diamètre, de trois de ses points (médiatrices), ou de deux de ses points et d\'une droite qui porte son centre.'],
          chantier: '4e',
          whereLabel: '4e → « 93. Déterminer un cercle par des conditions »',
        },
      ],
    },

    {
      id: 'parabole',
      number: 9,
      title: 'La parabole : foyer, directrice et équation',
      kicker: 'équidistance d\'un point (foyer) et d\'une droite (directrice)',
      titreCourt: 'La parabole',
      partie: 'Lieux géométriques : cercle et parabole',
      essentiel: [
        'Une parabole est l\'ensemble des points P à égale distance du **foyer** F et de la **directrice** d ; le sommet S est à mi-chemin entre F et d.',
        'Axe vertical : $(x-x_S)^2=2p(y-y_S)$, avec $p = 2(y_F-y_S)$ **signé** et la directrice $y = y_S - \\dfrac{p}{2}$ ; pour un axe horizontal, x et y échangent leurs rôles.',
        'Construction : le cercle de centre F et de rayon r coupe la parallèle à d située à la distance r en des points de la parabole.',
      ],
      cartes: [
        { question: 'Quelle propriété vérifie tout point P de la parabole ?', reponse: 'PF = distance(P, d) : P est à égale distance du foyer et de la directrice.' },
        { question: 'Sommet S(1 ; −1) et foyer F(1 ; 1) : quels p et quelle équation ?', reponse: '$p = 2(1-(-1)) = 4$ : $(x-1)^2 = 8(y+1)$.' },
        { question: 'Axe vertical et p négatif : que se passe-t-il ?', reponse: 'Le foyer est sous le sommet : la parabole s\'ouvre vers le bas.' },
        { question: 'Sommet et p de $(y-3)^2 = 4(x+1)$ ?', reponse: 'S(−1 ; 3) et $2p = 4$, donc $p = 2$ (axe horizontal).' },
      ],
      blocks: [
        { kind: 'video', title: 'La parabole : foyer, directrice, équation et construction au compas', youtubeId: 'C8pnTijgKro' },
        { kind: 'video', title: 'Construction d\'une parabole au compas et à l\'équerre', youtubeId: 'mmRHcf1ttrY' },
        {
          kind: 'para',
          text:
            'Une parabole, c\'est l\'ensemble des points P situés à la même distance d\'un ' +
            'point fixe F, le **foyer**, et d\'une droite fixe d, la **directrice**. Toujours ' +
            '$PF = \\text{dist}(P, d)$. Le **sommet** S de la parabole est le milieu du segment qui ' +
            "relie F au point de d le plus proche — exactement à mi-chemin entre le foyer et la " +
            'directrice.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3.2,
            xMax: 3.2,
            yMin: -1.9,
            yMax: 3,
            showAxes: false,
            curves: [{ fn: (x) => (x * x) / 4, tone: 'accent', xMin: -3, xMax: 3 }],
            vectors: [
              { from: { x: -3.2, y: -1 }, to: { x: 3.2, y: -1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 2, y: 1 }, to: { x: 0, y: 1 }, tone: 'good', dashed: true },
              { from: { x: 2, y: 1 }, to: { x: 2, y: -1 }, tone: 'good', dashed: true },
            ],
            points: [
              { x: 0, y: 0, label: 'S', tone: 'ink', labelPos: 'below' },
              { x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'above' },
              { x: 2, y: 1, label: 'P', tone: 'ink', labelPos: 'right' },
              { x: -2.6, y: -1.35, label: 'directrice d', tone: 'ink', node: false, labelPos: 'below' },
            ],
            caption: 'PF = distance(P, d) — vrai pour **tout** point P de la courbe : c\'est la définition même de la parabole',
          },
        },
        {
          kind: 'intuition',
          label: 'Une image physique',
          text:
            'C\'est le même principe qu\'une antenne parabolique ou le réflecteur d\'un phare de ' +
            'voiture : tous les rayons parallèles à l\'axe, en rebondissant sur la courbe, se ' +
            'concentrent en un seul point — le foyer. Réciproquement, une source de lumière ' +
            'placée exactement au foyer ressort en rayons parfaitement parallèles. Cette ' +
            'propriété n\'est vraie QUE pour cette forme précise, celle définie par ' +
            'l\'équidistance foyer/directrice.',
        },
        {
          kind: 'historique',
          titre: 'La parabole, trouvée en cherchant tout autre chose',
          text:
            'La parabole est découverte vers 350 avant J.-C. par le mathématicien grec ' +
            '**Ménechme**, élève d\'Eudoxe et parfois présenté comme le précepteur ' +
            "d'Alexandre le Grand — mais pas du tout en cherchant une courbe ! Il tente de " +
            "résoudre un problème célèbre de l'Antiquité, la « duplication du cube » " +
            '(construire un cube de volume double d\'un cube donné), impossible à la règle ' +
            'et au compas. En coupant un cône par un plan de différentes façons, il obtient ' +
            'plusieurs courbes nouvelles — dont la parabole — et montre qu\'elles permettent ' +
            'de résoudre son problème. La définition par foyer et directrice que tu utilises ' +
            'aujourd\'hui viendra bien plus tard : on la trouve chez **Pappus d\'Alexandrie**, au ' +
            '4e siècle après J.-C., qui l\'attribue à Euclide. Ménechme, lui, ne connaissait la ' +
            'parabole que comme une tranche de cône.',
        },
        { kind: 'subheading', text: "L'équation" },
        {
          kind: 'para',
          text:
            'Attention : le paramètre **p est signé**. Ce n\'est jamais une simple distance ' +
            "positive ! Il porte à la fois la taille et l'orientation de l'ouverture de la " +
            'parabole.',
        },
        {
          kind: 'featureTable',
          headers: ['Axe', 'Équation', 'p', 'Directrice'],
          rows: [
            ['vertical (directrice horizontale)', '$(x-x_S)^2=2p(y-y_S)$', '$2(y_F-y_S)$', '$y=y_S-p/2$'],
            ['horizontal (directrice verticale)', '$(y-y_S)^2=2p(x-x_S)$', '$2(x_F-x_S)$', '$x=x_S-p/2$'],
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — l\'équation x² = 2py, sommet à l\'origine',
          blocks: [
            {
              kind: 'para',
              text:
                'Prends le foyer $F\\left(0\\,;\\,\\dfrac{p}{2}\\right)$ et la directrice $d : y = -\\dfrac{p}{2}$, ' +
                'avec $p \\neq 0$ : le sommet est l\'origine, à mi-chemin entre F et d. Un point $P(x\\,;\\,y)$ est ' +
                'sur la parabole exactement quand $\\text{dist}(P,F) = \\text{dist}(P,d)$.',
            },
            {
              kind: 'para',
              text:
                'D\'un côté, $\\text{dist}(P,F) = \\sqrt{x^2 + \\left(y - \\dfrac{p}{2}\\right)^2}$. De l\'autre, la ' +
                'distance de P à l\'horizontale $y = -\\dfrac{p}{2}$ est un écart d\'ordonnées : ' +
                '$\\text{dist}(P,d) = \\left|y + \\dfrac{p}{2}\\right|$ — avec une valeur absolue, car p est signé.',
            },
            {
              kind: 'para',
              text:
                'Les deux membres de $\\sqrt{x^2 + \\left(y - \\dfrac{p}{2}\\right)^2} = \\left|y + \\dfrac{p}{2}\\right|$ ' +
                'sont positifs : on peut les élever au carré sans perdre ni ajouter de solution. On obtient ' +
                '$x^2 + y^2 - py + \\dfrac{p^2}{4} = y^2 + py + \\dfrac{p^2}{4}$.',
            },
            {
              kind: 'para',
              text: 'Les termes $y^2$ et $\\dfrac{p^2}{4}$ s\'éliminent : il reste $x^2 - py = py$, soit $x^2 = 2py$.',
            },
          ],
        },
        {
          kind: 'para',
          text:
            'Décale maintenant le sommet en $S(x_S ; y_S)$ plutôt qu\'à l\'origine (une simple ' +
            'translation) : tu obtiens directement la forme générale $(x-x_S)^2=2p(y-y_S)$ du ' +
            "tableau ci-dessus. L'axe horizontal s'obtient en échangeant les rôles de x et y.",
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le foyer de la parabole y = ax², lien avec le chapitre 1',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $a \\neq 0$. L\'équation $y = ax^2$ s\'écrit $x^2 = \\dfrac{1}{a}\\,y$ : c\'est la forme ' +
                '$x^2 = 2py$ d\'une parabole d\'axe vertical et de sommet O, avec $2p = \\dfrac{1}{a}$, soit ' +
                '$p = \\dfrac{1}{2a}$.',
            },
            {
              kind: 'para',
              text:
                'Son foyer est $F\\left(0\\,;\\,\\dfrac{p}{2}\\right)$, et $\\dfrac{p}{2} = \\dfrac{1}{4a}$ : ' +
                '$F\\left(0\\,;\\,\\dfrac{1}{4a}\\right)$. Sa directrice a pour équation $y = -\\dfrac{1}{4a}$.',
            },
            {
              kind: 'para',
              text:
                'Contrôle par la définition : pour $P(x\\,;\\,ax^2)$, $PF^2 = x^2 + \\left(ax^2 - \\dfrac{1}{4a}\\right)^2 ' +
                '= a^2x^4 + \\dfrac{x^2}{2} + \\dfrac{1}{16a^2} = \\left(ax^2 + \\dfrac{1}{4a}\\right)^2$, le carré de ' +
                'la distance de P à la directrice.',
            },
            {
              kind: 'para',
              text:
                'Pour $y = \\dfrac{x^2}{4}$ (la figure du début de section), $a = \\dfrac{1}{4}$ donne $p = 2$ et ' +
                '$F(0\\,;\\,1)$ : c\'est bien le foyer dessiné. Et si $a < 0$, p est négatif : la parabole ' +
                's\'ouvre vers le bas, comme au chapitre 1.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège — un p négatif inverse foyer et directrice',
          text:
            'Un p positif place le foyer **au-dessus** du sommet (axe vertical), ou **à droite** ' +
            '(axe horizontal). Un p négatif les place de l\'autre côté. Si tu te trompes de ' +
            "signe, tu échanges purement et simplement les rôles du foyer et de la directrice !",
        },
        {
          kind: 'exemple',
          badge: 'graphe → équation, axe vertical',
          formula: 'Sommet S(1 ; −1), foyer F(1 ; 1), lus sur un graphe.',
          steps: [
            { tag: 'paramètre p', text: '$p = 2(y_F-y_S) = 2(1-(-1)) = 4$' },
            { tag: 'équation', text: '$(x-1)^2 = 2 \\cdot 4 \\cdot (y+1) = 8(y+1)$' },
          ],
          result: { tag: 'directrice', text: '$y = -1-4/2 = -3$' },
        },
        {
          kind: 'exemple',
          badge: 'parabole tournée vers le bas (p négatif)',
          formula: 'Sommet S(2 ; 1), foyer F(2 ; −1).',
          steps: [
            { tag: 'paramètre p', text: '$p = 2(y_F - y_S) = 2(-1-1) = -4$ : négatif, le foyer est sous le sommet, la parabole s\'ouvre vers le bas' },
            { tag: 'équation', text: '$(x-2)^2 = 2 \\cdot (-4) \\cdot (y-1) = -8(y-1)$' },
          ],
          result: { tag: 'directrice', text: '$y = y_S - p/2 = 1 + 2 = 3$, au-dessus du sommet' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2,
            xMax: 3.5,
            yMin: -3.5,
            yMax: 3.5,
            showAxes: false,
            curvesOfY: [{ fn: (y) => (y * y) / 4, tone: 'accent', yMin: -3.2, yMax: 3.2 }],
            vectors: [{ from: { x: -1, y: -3.5 }, to: { x: -1, y: 3.5 }, tone: 'faint', dashed: true, arrow: false }],
            points: [
              { x: 0, y: 0, label: 'S', tone: 'ink', labelPos: 'below' },
              { x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'above' },
              { x: -1.5, y: -3.1, label: 'd', tone: 'ink', node: false },
            ],
            caption: 'axe horizontal : $(y-y_S)^2=2p(x-x_S)$ — les mêmes rôles que ci-dessus, avec x et y échangés',
          },
        },
        {
          kind: 'exemple',
          badge: 'équation développée → S, F, p, directrice',
          formula: '$y^2-6y-4x+5=0$ (axe horizontal — c\'est y qui est au carré).',
          steps: [
            { tag: 'isoler le carré en y', text: '$y^2-6y = 4x-5$' },
            { tag: 'compléter le carré', text: '$(y-3)^2-9 = 4x-5 \\to (y-3)^2 = 4x+4 = 4(x+1)$' },
            { tag: 'identifier', text: 'sommet S(−1 ; 3), et $2p=4 \\to p=2$' },
          ],
          result: { tag: 'foyer et directrice', text: '$F(x_S+p/2 ; y_S) = F(0 ; 3)$, directrice $x = x_S-p/2 = -2$' },
        },
        { kind: 'subheading', text: "Construction géométrique, au compas et à l'équerre" },
        {
          kind: 'para',
          text:
            "La définition par équidistance te permet de construire la parabole point par " +
            "point, sans jamais lire ni écrire de coordonnées. Choisis un rayon r (assez " +
            "grand) : le **cercle centré en F de rayon r** et la **droite parallèle à la " +
            "directrice, à distance r de celle-ci** se coupent en 0, 1 ou 2 points. Chacun de " +
            "ces points est, par construction, à la fois à distance r de F et à distance r de " +
            "la directrice. Il est donc exactement sur la parabole !",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 3,
            yMin: -2,
            yMax: 4,
            showAxes: false,
            circle: { cx: 0, cy: 1, r: 2.2, tone: 'accent' },
            vectors: [
              { from: { x: -3, y: -1 }, to: { x: 3, y: -1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -3, y: 1.2 }, to: { x: 3, y: 1.2 }, tone: 'attn', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'above' },
              { x: 2.19, y: 1.2, label: 'P₁', tone: 'ink', labelPos: 'above' },
              { x: -2.19, y: 1.2, label: 'P₂', tone: 'ink', labelPos: 'above' },
              { x: -2.4, y: -0.8, label: 'directrice d', tone: 'ink', node: false },
            ],
            caption:
              'cercle (centre F, rayon r) ∩ droite parallèle à d (distance r) — P₁ et P₂ appartiennent tous deux à la parabole',
          },
        },
        {
          kind: 'astuce',
          text:
            'Pour tracer toute la courbe, répète cette construction pour plusieurs valeurs de r ' +
            '(toujours strictement supérieures à la moitié de la distance entre F et la ' +
            'directrice). Tu fais apparaître autant de points de la parabole — assez pour en ' +
            "tracer l'allure complète à main levée.",
        },
        {
          kind: 'para',
          text:
            "**En pratique, aux instruments.** Commence par l'**axe** : à l'équerre, trace la " +
            "perpendiculaire à $d$ passant par $F$ ; elle coupe $d$ en $K$. Le **sommet** $S$ est " +
            "le milieu de $[KF]$ : trace sa **médiatrice** au compas (deux arcs de même ouverture, " +
            "plus grande que la moitié de $KF$, centrés en $K$ puis en $F$) ; la droite qui joint " +
            "leurs points d'intersection coupe l'axe en $S$. Pour chaque ouverture $r$ : pointe en " +
            "$K$, l'arc coupe l'axe en $A$, du côté de $F$, à la distance $r$ de $d$ ; à l'équerre, " +
            "la parallèle à $d$ passant par $A$ (c'est la perpendiculaire à l'axe en $A$) ; enfin, " +
            "**sans changer l'ouverture**, pointe en $F$ : le cercle coupe cette parallèle en deux " +
            "points de la parabole. La même ouverture sert deux fois — c'est elle qui garantit " +
            "$PF = \\text{dist}(P, d)$.",
        },
        { kind: 'subheading', text: 'Deuxième méthode : la médiatrice' },
        {
          kind: 'para',
          text:
            "On peut aussi partir d'un point $H$ de la directrice. Le point $P$ de la parabole " +
            "qui se projette en $H$ sur $d$ vérifie deux conditions. D'abord, sa distance à $d$ " +
            "est $PH$ : $P$ est sur la **perpendiculaire** à $d$ en $H$, tracée à l'équerre. " +
            "Ensuite, $PF = PH$ : $P$ est à égale distance de $F$ et de $H$, donc sur la " +
            "**médiatrice** de $[FH]$, tracée au compas. L'intersection de ces deux droites est " +
            "le point $P$ cherché. Le sommet en est le cas particulier $H = K$ : c'est exactement " +
            "la construction de $S$ ci-dessus.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 3.6,
            yMin: -2,
            yMax: 3,
            showAxes: false,
            curves: [{ fn: (x: number) => (x * x) / 4, tone: 'faint', xMin: -3, xMax: 3.4 }],
            vectors: [
              { from: { x: -3, y: -1 }, to: { x: 3.6, y: -1 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: -2 }, to: { x: 2, y: 3 }, tone: 'attn', arrow: false },
              { from: { x: -1, y: -2 }, to: { x: 3.6, y: 2.6 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 2, y: 1 }, to: { x: 0, y: 1 }, tone: 'good', tick: true, arrow: false },
              { from: { x: 2, y: 1 }, to: { x: 2, y: -1 }, tone: 'good', tick: true, arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 2, y: -1 }, arm1: { x: 1, y: -1 }, arm2: { x: 2, y: 0 } }],
            points: [
              { x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'left' },
              { x: 2, y: -1, label: 'H', tone: 'ink', labelPos: 'below' },
              { x: 2, y: 1, label: 'P', tone: 'accent', labelPos: 'right' },
              { x: 0, y: 0, label: 'S', tone: 'ink', labelPos: 'left' },
              { x: -2.6, y: -0.75, label: 'directrice d', tone: 'ink', node: false },
            ],
            caption:
              'perpendiculaire à d en H (trait plein) ∩ médiatrice de [FH] (pointillés) = P, avec PF = PH',
          },
        },
        {
          kind: 'astuce',
          text:
            "Chaque point $H$ de $d$ donne un point de la parabole, et son **symétrique par " +
            "rapport à l'axe** en donne un second sans nouvelle construction. Avantage : tu " +
            "choisis où tombent les points ($H$ proche de $K$ : un point proche du sommet). " +
            "Bonus : la médiatrice de $[FH]$ touche la parabole en $P$ sans la traverser — c'est " +
            "la **tangente** en $P$.",
        },
        {
          kind: 'atelier',
          tag: 'parabole-foyer-widget',
          label: 'Manipule toi-même : foyer et directrice',
          caption:
            'Déplace le foyer F et la directrice : la parabole est l\'ensemble des points P ' +
            'tels que PF = PH, H étant le pied de la perpendiculaire menée de P à la ' +
            'directrice. Le sommet S est au milieu, et p — le double de l\'écart entre S et ' +
            'F — est signé : négatif, la parabole s\'ouvre de l\'autre côté. Coche « ' +
            'Construction au compas » pour voir un cercle de centre F et une parallèle à la ' +
            'directrice se couper sur la parabole.',
        },
        {
          kind: 'entrainement',
          title: 'Équation depuis un graphe',
          generatorId: 'gen51',
          description: ['Lis le sommet et le foyer sur un graphe. Calcule p et écris l\'équation.'],
          chantier: '4e',
          whereLabel: "4e → « 51. Équation d'une parabole depuis un graphe »",
        },
        {
          kind: 'entrainement',
          title: 'Sommet, foyer, p, directrice',
          generatorId: 'gen52',
          description: ["Pars de l'équation développée. Retrouve tous les éléments caractéristiques de la parabole."],
          chantier: '4e',
          whereLabel: '4e → « 52. Sommet, foyer, p et directrice »',
        },
        {
          kind: 'entrainement',
          title: 'Construction graphique de la parabole',
          generatorId: 'gen53',
          description: ['Construis l\'axe, le sommet puis des points de la parabole avec une équerre et un compas, par la méthode du cercle et de la parallèle ou par celle de la médiatrice. Aucune grille, aucune coordonnée.'],
          chantier: '4e',
          whereLabel: '4e → « 53. Construction graphique de la parabole »',
        },
      ],
    },

    {
      id: 'lieux',
      number: 10,
      title: 'Lieux géométriques : intersection de deux courbes',
      kicker: 'traduire, écrire l\'équation, résoudre le système',
      titreCourt: 'Intersection de deux lieux',
      partie: 'Lieux géométriques : cercle et parabole',
      essentiel: [
        'Méthode : identifier chaque lieu, écrire son équation, résoudre le système par substitution, puis dénombrer les solutions.',
        'Avec une droite et un cercle (ou une parabole), on obtient une équation du second degré au plus : 0, 1 ou 2 points communs ; une racine double veut dire que la droite est tangente.',
        'Une droite parallèle à l\'axe d\'une parabole donne une équation du **premier** degré : un seul point commun, sans être tangente.',
      ],
      cartes: [
        { question: '« Les points dont l\'ordonnée est le triple de l\'abscisse » : quel lieu ?', reponse: 'La droite $y = 3x$.' },
        { question: 'Points communs de $y = x$ et de $(x-1)^2+y^2=5$ ?', reponse: '$x^2 - x - 2 = 0$ : (2 ; 2) et (−1 ; −1).' },
        { question: 'Droite et parabole : la substitution donne $(x-2)^2 = 0$. Conclusion ?', reponse: 'Un seul point commun : la droite est tangente à la parabole.' },
        { question: 'Comment trouver les points communs de deux cercles ?', reponse: 'On soustrait leurs équations : les carrés disparaissent, il reste une droite ; puis on substitue.' },
      ],
      blocks: [
        { kind: 'video', title: 'Lieux géométriques, intersection de deux courbes, révision du chapitre', youtubeId: 'WZbxEM82VOo' },
        {
          kind: 'para',
          text:
            'Droite, cercle et parabole sont chacun des lieux géométriques particuliers. Tu as ' +
            "vu l'équation d'une droite plus tôt dans ce chapitre, et celles du cercle et de la " +
            'parabole dans les deux sections précédentes. Reste à savoir résoudre un problème où ' +
            '**deux** lieux, chacun décrit par une phrase, sont mis en jeu ensemble.',
        },
        {
          kind: 'featureTable',
          headers: ['Description verbale', 'Figure', 'Équation'],
          rows: [
            ['« les points dont l\'ordonnée est le triple de l\'abscisse »', 'droite', 'y = 3x'],
            ['« les points situés à 5 unités du point (2 ; −3) »', 'cercle', '(x−2)²+(y+3)²=25'],
            ['« les points équidistants de (−1 ; 0) et de la droite x=−3 »', 'parabole', 'y² = 4(x+2)'],
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            '**Identifie** le type de chacun des deux lieux, puis extrais-en les paramètres.',
            '**Écris** l\'équation de chaque lieu.',
            '**Résous** le système par substitution — avec une droite et un cercle (ou une parabole), ça mène à une équation **du second degré au plus**, à une seule inconnue.',
            '**Dénombre** les solutions (0, 1 ou 2), puis remonte aux coordonnées de chaque point d\'intersection.',
          ],
        },
        {
          kind: 'attention',
          label: 'Pas toujours une équation du second degré',
          text:
            'La règle « au plus du second degré, donc 0, 1 ou 2 points » vaut quand l\'un des deux lieux ' +
            'est une **droite**. Entre un cercle et une parabole, la substitution mène en général ' +
            'à une équation de degré 4, qui peut avoir jusqu\'à 4 solutions — un cas qui sort du ' +
            'cadre de ce chapitre. Entre deux cercles, en revanche, soustraire les deux équations ' +
            'fait disparaître les carrés et ramène à une droite (voir le dernier exemple).',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -2,
              xMax: 2,
              yMin: -2,
              yMax: 2,
              showAxes: false,
              circle: { cx: 0, cy: 0, r: 1.5, tone: 'accent' },
              vectors: [{ from: { x: -1.8, y: 1.8 }, to: { x: 1.8, y: 1.8 }, tone: 'bad', arrow: false }],
              caption: '0 point — équation sans solution',
            },
            {
              kind: 'vectorPlane',
              xMin: -2,
              xMax: 2,
              yMin: -2,
              yMax: 2,
              showAxes: false,
              circle: { cx: 0, cy: 0, r: 1.5, tone: 'accent' },
              vectors: [{ from: { x: -1.8, y: 1.5 }, to: { x: 1.8, y: 1.5 }, tone: 'attn', arrow: false }],
              points: [{ x: 0, y: 1.5, tone: 'ink', node: true }],
              caption: '1 point — tangence, solution double',
            },
            {
              kind: 'vectorPlane',
              xMin: -2,
              xMax: 2,
              yMin: -2,
              yMax: 2,
              showAxes: false,
              circle: { cx: 0, cy: 0, r: 1.5, tone: 'accent' },
              vectors: [{ from: { x: -1.8, y: -0.34 }, to: { x: 1.7, y: 0.71 }, tone: 'good', arrow: false }],
              points: [
                { x: 1.37, y: 0.611, tone: 'ink', node: true },
                { x: -1.48, y: -0.244, tone: 'ink', node: true },
              ],
              caption: '2 points — deux solutions distinctes',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5,
            xMax: 3.5,
            yMin: -2.5,
            yMax: 3.5,
            grid: true,
            circle: { cx: 1, cy: 0, r: 2.236, tone: 'accent' },
            vectors: [{ from: { x: -2, y: -2 }, to: { x: 3, y: 3 }, tone: 'good', arrow: false }],
            points: [
              { x: 2, y: 2, label: '(2 ; 2)', tone: 'ink', labelPos: 'above' },
              { x: -1, y: -1, label: '(−1 ; −1)', tone: 'ink', labelPos: 'below' },
              { x: 2.6, y: -1.3, label: 'c', tone: 'accent', node: false },
              { x: -1.6, y: -1.9, label: 'd', tone: 'good', node: false },
            ],
            caption: 'd ∩ c — exactement les deux points trouvés par le calcul',
          },
        },
        {
          kind: 'exemple',
          badge: 'droite ∩ cercle',
          formula: 'droite d : y = x — cercle c : $(x-1)^2+y^2=5$',
          steps: [
            { tag: 'substituer y=x dans c', text: '$(x-1)^2+x^2=5 \\to x^2-2x+1+x^2=5$' },
            { tag: 'équation quadratique', text: '$2x^2-2x-4=0 \\to x^2-x-2=0 \\to (x-2)(x+1)=0$' },
            { tag: 'deux solutions', text: '$x=2$ ou $x=-1$, puis $y=x$ pour chacune' },
          ],
          result: { tag: "points d'intersection", text: '(2 ; 2) et (−1 ; −1)' },
        },
        {
          kind: 'atelier',
          tag: 'droite-cercle-widget',
          label: 'Manipule toi-même : droite et cercle',
          caption:
            'Règle le cercle et la droite : en remplaçant y par mx + p dans l\'équation du ' +
            'cercle, on obtient une équation du second degré. Son discriminant Δ décide de ' +
            'tout : Δ < 0, aucun point commun ; Δ = 0, la droite est tangente ; Δ > 0, deux ' +
            'points, dont on calcule les coordonnées. Le réglage de départ reproduit ' +
            'l\'exemple ci-dessus.',
        },
        {
          kind: 'exemple',
          badge: 'droite et parabole tangentes',
          formula: 'Parabole $x^2 = 4y$ et droite $y = x - 1$.',
          steps: [
            { tag: 'remplacer y', text: '$x^2 = 4(x-1) \\to x^2 - 4x + 4 = 0 \\to (x-2)^2 = 0$' },
            { tag: 'une solution double', text: '$x = 2$, puis $y = 2 - 1 = 1$' },
          ],
          result: { tag: 'résultat', text: 'un seul point, (2 ; 1) : la droite est tangente à la parabole' },
        },
        {
          kind: 'exemple',
          badge: 'droite parallèle à l\'axe d\'une parabole',
          formula: 'Parabole $x^2 = 4y$ et droite $x = 2$.',
          steps: [
            { tag: 'remplacer x', text: '$2^2 = 4y \\to 4 = 4y$ : une équation du **premier** degré en y' },
            { tag: 'une seule solution', text: '$y = 1$ : un seul point commun, (2 ; 1)' },
          ],
          result: {
            tag: 'résultat',
            text: 'un seul point, mais la droite $x = 2$, parallèle à l\'axe de la parabole, la traverse : ce n\'est pas une tangente. La tangente en (2 ; 1) est $y = x - 1$, l\'exemple précédent',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 5,
            yMin: -1.5,
            yMax: 6,
            curves: [{ fn: (x: number) => (x * x) / 4, tone: 'accent', xMin: -3, xMax: 4.8 }],
            vectors: [
              { from: { x: 2, y: -1.5 }, to: { x: 2, y: 6 }, tone: 'good', arrow: false },
              { from: { x: -0.5, y: -1.5 }, to: { x: 5, y: 4 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 2, y: 1, label: '(2 ; 1)', tone: 'ink', labelPos: 'left' },
              { x: 2.15, y: 5.5, label: 'x = 2', tone: 'good', node: false, labelPos: 'right' },
              { x: 3.2, y: 1.1, label: 'y = x − 1', tone: 'ink', node: false, labelPos: 'right' },
            ],
            caption:
              'parabole $x^2 = 4y$ : la droite $x = 2$ (verte) la coupe en un seul point en la traversant ; ' +
              'la tangente $y = x - 1$ (pointillés) la touche au même point sans la traverser',
          },
        },
        {
          kind: 'piege',
          label: 'Piège — un seul point ne veut pas toujours dire « tangente »',
          text:
            'Une droite **parallèle à l\'axe** d\'une parabole (une verticale $x = k$ pour une parabole ' +
            'd\'axe vertical) la coupe en un seul point, mais elle la **traverse** : ce n\'est pas une ' +
            'tangente. La substitution donne alors une équation du **premier** degré, pas une racine ' +
            'double. La règle reste vraie : c\'est la racine **double** d\'une équation du second degré ' +
            'qui signale une tangente, pas le simple fait d\'avoir un seul point.',
        },
        {
          kind: 'exemple',
          badge: 'à partir de deux phrases',
          formula:
            '« Les points équidistants de A(0 ; 0) et B(4 ; 0) » et « les points situés à √13 de ' +
            'l\'origine ». Trouve leurs points communs.',
          steps: [
            { tag: '1er lieu : une médiatrice', text: 'la médiatrice de [AB] : la droite $x = 2$' },
            { tag: '2e lieu : un cercle', text: 'centre (0 ; 0), rayon √13 : $x^2 + y^2 = 13$' },
            { tag: 'résoudre', text: '$4 + y^2 = 13 \\to y^2 = 9 \\to y = 3$ ou $y = -3$' },
          ],
          result: { tag: 'points communs', text: '(2 ; 3) et (2 ; −3)' },
        },
        {
          kind: 'exemple',
          badge: 'pour aller plus loin — deux cercles (le GPS)',
          formula: '$x^2+y^2=25$ et $(x-8)^2+y^2=25$ : les satellites 1 et 2 de l\'application GPS (section 8).',
          steps: [
            { tag: 'soustraire les équations', text: '$x^2 - (x-8)^2 = 0 \\to 16x - 64 = 0 \\to x = 4$ (les carrés disparaissent : une droite)' },
            { tag: 'revenir à un cercle', text: '$16 + y^2 = 25 \\to y = 3$ ou $y = -3$' },
          ],
          result: { tag: 'résultat', text: '(4 ; 3) et (4 ; −3). Le 3e satellite tranche : seul (4 ; 3) est à √26 ≈ 5,1 de (3 ; 8)' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6,
            xMax: 14,
            yMin: -9.4,
            yMax: 9.35,
            circles: [
              { cx: 0, cy: 0, r: 5, tone: 'accent' },
              { cx: 8, cy: 0, r: 5, tone: 'good' },
            ],
            vectors: [{ from: { x: 4, y: -9.4 }, to: { x: 4, y: 9.35 }, tone: 'ink', dashed: true, arrow: false }],
            points: [
              { x: 0, y: 0, label: 'C₁', tone: 'accent', labelPos: 'below' },
              { x: 8, y: 0, label: 'C₂', tone: 'good', labelPos: 'below' },
              { x: 4, y: 3, label: '(4 ; 3)', tone: 'ink', labelPos: 'right' },
              { x: 4, y: -3, label: '(4 ; −3)', tone: 'ink', labelPos: 'right' },
              { x: 4.3, y: 8.3, label: 'x = 4', tone: 'ink', node: false, labelPos: 'right' },
            ],
            caption:
              'soustraire $x^2+y^2=25$ et $(x-8)^2+y^2=25$ donne la droite $x = 4$ (pointillés), perpendiculaire ' +
              'à la droite des centres : elle passe par les deux points communs',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la soustraction de deux équations de cercles donne une droite',
          blocks: [
            {
              kind: 'para',
              text:
                'Soient deux cercles de centres distincts $C_1(a_1\\,;\\,b_1)$ et $C_2(a_2\\,;\\,b_2)$, de rayons ' +
                '$r_1$ et $r_2$. Développées, leurs équations s\'écrivent ' +
                '$x^2 + y^2 - 2a_1x - 2b_1y + a_1^2 + b_1^2 - r_1^2 = 0$ et ' +
                '$x^2 + y^2 - 2a_2x - 2b_2y + a_2^2 + b_2^2 - r_2^2 = 0$.',
            },
            {
              kind: 'para',
              text:
                'On soustrait la seconde de la première : $x^2$ et $y^2$ disparaissent, et il reste ' +
                '$2(a_2 - a_1)\\,x + 2(b_2 - b_1)\\,y + k = 0$, où ' +
                '$k = a_1^2 + b_1^2 - r_1^2 - a_2^2 - b_2^2 + r_2^2$ est un nombre.',
            },
            {
              kind: 'para',
              text:
                'Les centres sont distincts, donc $a_2 - a_1$ et $b_2 - b_1$ ne sont pas tous deux nuls : c\'est ' +
                'l\'équation d\'une droite. Son vecteur normal ' +
                '$\\begin{pmatrix} 2(a_2-a_1) \\\\ 2(b_2-b_1) \\end{pmatrix} = 2\\vec{C_1C_2}$ montre qu\'elle est ' +
                'perpendiculaire à la droite des centres $(C_1C_2)$.',
            },
            {
              kind: 'para',
              text:
                'Un point vérifie les deux équations exactement quand il vérifie la première et leur ' +
                'différence : les points communs aux deux cercles sont les points de cette droite qui sont sur ' +
                'le premier cercle. Si les centres étaient confondus, la soustraction ne laisserait que ' +
                '$r_2^2 - r_1^2 = 0$ : aucune droite.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'deux-cercles-widget',
          label: 'Manipule toi-même : deux cercles',
          caption:
            'Déplace les centres et règle les rayons : l\'atelier écrit les deux équations ' +
            'développées et les soustrait. Les carrés disparaissent, il reste une droite, ' +
            'perpendiculaire à la droite des centres ; les points communs, 0, 1 ou 2, sont ceux de ' +
            'cette droite et du premier cercle. Place les deux centres au même endroit : plus de ' +
            'droite. Le réglage de départ reproduit l\'exemple du GPS.',
        },
        {
          kind: 'entrainement',
          title: 'Lieux géométriques',
          generatorId: 'gen54',
          description: ['Reconnais deux lieux décrits par une phrase. Écris leurs équations. Puis trouve leur(s) point(s) commun(s).'],
          chantier: '4e',
          whereLabel: '4e → « 54. Lieux géométriques »',
        },
        {
          kind: 'astuce',
          label: 'Cercle et parabole : le cas du carré commun',
          text:
            'Quand le cercle est centré sur l\'axe de la parabole, par exemple $(x-1)^2+(y-3)^2=10$ et ' +
            '$(x-1)^2=2(y+1)$, le carré $(x-1)^2$ apparaît dans les deux équations : on le remplace par $2(y+1)$ ' +
            'dans celle du cercle, et il reste une équation du **second degré** en y. Attention : une solution en y ' +
            'qui rend $(x-1)^2$ négatif ne donne aucun point, on la rejette.',
        },
        {
          kind: 'entrainement',
          title: 'Intersection de deux cercles',
          generatorId: 'gen98',
          description: ['Deux cercles : soustrais leurs équations pour obtenir une droite, puis substitue. Un cercle et une parabole : remplace le carré commun, et rejette les solutions qui ne donnent aucun point. 0, 1 ou 2 points communs.'],
          chantier: '4e',
          whereLabel: '4e → « 98. Intersection de deux cercles »',
        },
      ],
    },

    {
      id: 'revision',
      number: 11,
      title: 'Révision — quiz vrai/faux',
      kicker: '595 affirmations en 17 thèmes',
      titreCourt: 'Révision : vrai ou faux',
      partie: 'Lieux géométriques : cercle et parabole',
      essentiel: [
        'Le quiz vrai/faux reprend tout le chapitre en 17 thèmes, un par grande notion, dans l\'ordre des sections ; le détective d\'erreurs traque la ligne fausse d\'une copie.',
      ],
      cartes: [
        { question: 'Une copie lit un rayon de 25 dans $(x-1)^2+(y-1)^2=25$. Quelle est l\'erreur ?', reponse: '25 est r² : le rayon vaut 5.' },
        { question: 'Une copie lit le centre (−2 ; 3) dans $(x-2)^2+(y+3)^2=25$. Quelle est l\'erreur ?', reponse: 'Le signe : le centre est (2 ; −3).' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre tout le chapitre : 17 thèmes de 35 affirmations, un par ' +
            'grande notion, dans l\'ordre des sections — de l\'équation d\'une droite aux lieux et aux ' +
            'deux cercles, en passant par les droites à paramètre, les mobiles, les droites ' +
            'remarquables, le projeté et la tangente. Le quiz se fait en ligne : sur la page du ' +
            'chapitre, onglet **Réviser**.',
        },
        {
          kind: 'entrainement',
          title: "Détective d'erreurs : géométrie analytique",
          generatorId: 'gen99',
          description: ["La copie d'un élève contient une ligne fausse (vecteur normal et directeur confondus, pente inversée, signe du centre, r² pris pour r, foyer deux fois trop loin du sommet…). Trouve-la, explique l'erreur et corrige le résultat."],
          chantier: '4e',
          whereLabel: "4e → « 99. Détective d'erreurs : géométrie analytique »",
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Droite : les 4 formes',
        formulas: [
          { text: '$a \\cdot x + b \\cdot y + c = 0$', condition: 'implicite — toujours possible ; vecteur directeur $\\begin{pmatrix} -b \\\\ a \\end{pmatrix}$' },
          { text: '$y = m \\cdot x + p$', condition: 'explicite en y — impossible si verticale' },
          { text: '$x = n \\cdot y + q$', condition: 'explicite en x — impossible si horizontale' },
          {
            text: '$\\begin{cases} x = x_0+t \\cdot \\alpha \\\\ y = y_0+t \\cdot \\beta \\end{cases}$',
            condition: 'paramétrique — toujours possible',
          },
        ],
      },
      {
        title: 'Pente et angles',
        formulas: [
          { text: '$m = \\tan\\theta$', condition: '$\\theta \\in [0^\\circ;180^\\circ[$, angle avec $Ox$' },
          { text: '$m = -\\dfrac{a}{b}$, $p = -\\dfrac{c}{b}$', condition: 'depuis $ax+by+c=0$, $b \\neq 0$' },
          { text: '$\\theta_{Oy} = 90^\\circ - \\theta_{Ox}$', condition: 'ramené dans $[0^\\circ;180^\\circ[$ : $+180^\\circ$ si négatif ; mesuré depuis le demi-axe positif de $Oy$, dans le sens des aiguilles d\'une montre' },
          { text: '$\\begin{pmatrix} \\cos\\theta \\\\ \\sin\\theta \\end{pmatrix}$, $\\begin{pmatrix} \\sin\\alpha \\\\ \\cos\\alpha \\end{pmatrix}$', condition: 'vecteur directeur : angle $\\theta$ avec $Ox$, angle $\\alpha$ avec $Oy$' },
        ],
      },
      {
        title: 'Parallèles et perpendiculaires',
        formulas: [
          {
            text: '$\\alpha \\cdot \\beta\' - \\beta \\cdot \\alpha\' = 0$',
            condition: 'parallèles, critère de colinéarité nul — ou $m=m\'$',
          },
          {
            text: '$\\alpha \\cdot \\alpha\' + \\beta \\cdot \\beta\' = 0$',
            condition: 'perpendiculaires, produit scalaire nul — ou $m \\cdot m\' = -1$ si aucune droite n\'est verticale ni horizontale',
          },
          { text: '$ax + by + c\' = 0$', condition: 'parallèle à $ax + by + c = 0$ : seul $c$ change' },
          { text: '$a(m) = b(m) = 0$', condition: 'droite à paramètre : cette valeur de $m$ est rejetée, ce n\'est plus une droite' },
        ],
      },
      {
        title: 'Intersection, mobiles',
        formulas: [
          { text: '$t_1 = t_2$', condition: 'deux mobiles se rencontrent : même point des trajectoires au même instant' },
        ],
      },
      {
        title: 'Milieu, centre de gravité, aire',
        formulas: [
          { text: '$x_M=\\dfrac{x_A+x_B}{2}$, $y_M=\\dfrac{y_A+y_B}{2}$', condition: 'milieu $M$ de $[AB]$' },
          { text: '$x_G=\\dfrac{x_A+x_B+x_C}{3}$, $y_G=\\dfrac{y_A+y_B+y_C}{3}$', condition: 'centre de gravité $G$ du triangle $ABC$' },
          { text: '$\\mathcal{A}=\\dfrac{BC \\cdot AH}{2}$', condition: '$H$ pied de la perpendiculaire à $(BC)$ issue de $A$' },
        ],
      },
      {
        title: 'Droites remarquables',
        formulas: [
          { text: '$a(x-x_M)+b(y-y_M)=0$', condition: 'médiatrice de $[AB]$ : vecteur normal $\\vec{AB}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$, passe par le milieu $M$' },
          { text: '$a(x-x_A)+b(y-y_A)=0$', condition: 'hauteur issue de $A$ : vecteur normal $\\vec{BC}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$' },
          { text: '$\\vec{AM}$', condition: 'vecteur directeur de la médiane issue de $A$, $M$ milieu de $[BC]$' },
        ],
      },
      {
        title: 'Distance, projeté, symétrique',
        formulas: [
          { text: '$|x_P - k|$', condition: 'distance de $P$ à la verticale $x = k$' },
          { text: '$|y_P - k|$', condition: 'distance de $P$ à l\'horizontale $y = k$' },
          { text: '$x_{A\'}=2x_H-x_A$, $y_{A\'}=2y_H-y_A$', condition: 'symétrique $A\'$ de $A$ par rapport à $d$ ; $H$ projeté orthogonal de $A$ sur $d$' },
        ],
      },
      {
        title: 'Cercle',
        formulas: [
          { text: '$(x-x_0)^2+(y-y_0)^2=r^2$', condition: 'centre $(x_0;y_0)$, rayon $r$ — second membre nul ou négatif : pas de cercle' },
          { text: '$\\vec{CP} \\cdot \\vec{PM} = 0$', condition: 'tangente en $P$ : perpendiculaire au rayon $[CP]$' },
          { text: '$CH > r$, $CH = r$, $CH < r$', condition: 'droite extérieure, tangente, sécante — $CH$ : distance du centre à la droite' },
          { text: '$r = CH$', condition: 'cercle de centre $C$ tangent à la droite $d$' },
        ],
      },
      {
        title: 'Parabole',
        formulas: [
          { text: '$(x-x_S)^2=2p(y-y_S)$', condition: 'axe vertical — $p=2(y_F-y_S)$' },
          { text: '$F\\left(x_S\\,;\\,y_S+\\dfrac{p}{2}\\right)$, $y=y_S-\\dfrac{p}{2}$', condition: 'axe vertical : foyer et directrice' },
          { text: '$(y-y_S)^2=2p(x-x_S)$', condition: 'axe horizontal — $p=2(x_F-x_S)$' },
          { text: '$F\\left(x_S+\\dfrac{p}{2}\\,;\\,y_S\\right)$, $x=x_S-\\dfrac{p}{2}$', condition: 'axe horizontal : foyer et directrice' },
          { text: '$p = \\dfrac{1}{2a}$', condition: 'pour la parabole $y = ax^2$' },
        ],
      },
      {
        title: 'Lieux géométriques',
        formulas: [
          { text: '$MA^2 = MB^2$', condition: 'médiatrice de [AB] — les carrés s\'éliminent, il reste une droite' },
          { text: 'Soustraire les deux équations', condition: 'deux cercles : les carrés disparaissent, il reste une droite' },
          { text: 'Racine double', condition: 'droite tangente au cercle ou à la parabole ; une droite parallèle à l\'axe d\'une parabole la coupe en un seul point sans être tangente' },
        ],
      },
    ],
  },

  recap: {
    items: [
      'Droite — un point + un vecteur directeur, c\'est la seule vérité géométrique. 4 formes ' +
        'équivalentes (implicite, explicite en $y$, explicite en $x$, paramétrique) ; les deux formes ' +
        'explicites sont parfois impossibles (verticale/horizontale).',
      'Pente et angle — $m=\\tan\\theta$, $\\theta \\in [0^\\circ\\,;180^\\circ[$. $\\text{Angle avec } Oy ' +
        '= 90^\\circ - \\text{angle avec } Ox$, ramené dans $[0^\\circ\\,;180^\\circ[$. La pente peut être ' +
        'négative (droite qui descend), mais un angle ne l\'est jamais : une pente négative donne un ' +
        'angle avec $Ox$ obtus.',
      'Parallèles / perpendiculaires — critère de colinéarité nul ↔ colinéaires ; produit scalaire nul ↔ ' +
        'orthogonaux. En pentes : $m=m\'$ ou $m \\cdot m\'=-1$.',
      "Intersection — compare d'abord les vecteurs directeurs (sécantes ou colinéaires), avant tout calcul de système.",
      'Paramètres et mobiles — une condition (parallèle, perpendiculaire, passe par un point…) donne une ' +
        'équation en $m$, et on rejette toute valeur qui annule à la fois $a(m)$ et $b(m)$. Deux mobiles ne ' +
        'se rencontrent que si, en plus d\'un point commun des trajectoires, $t_1 = t_2$.',
      'Distance — jamais de formule directe : perpendiculaire, intersection, puis norme du vecteur obtenu.',
      'Triangle, projeté, symétrique — médiatrice et hauteur ont pour vecteur normal un côté du triangle ; ' +
        'les coordonnées du centre de gravité $G$ sont les moyennes de celles des sommets. Le projeté $H$ ' +
        'est le pied de la perpendiculaire, et le symétrique vérifie $x_{A\'} = 2x_H - x_A$.',
      'Cercle — $(x-x_0)^2+(y-y_0)^2=r^2$. En développée, le coefficient de $x^2$ et de $y^2$ doit ' +
        'être **identique**, puis tu complètes le carré pour retrouver centre et rayon.',
      'Cercle et droite — la tangente en $P$ est perpendiculaire au rayon $[CP]$ ; une droite est ' +
        'extérieure, tangente ou sécante selon que $CH > r$, $CH = r$ ou $CH < r$. Pour déterminer un ' +
        'cercle, on cherche d\'abord son centre : milieu d\'un diamètre, intersection de deux médiatrices.',
      'Parabole — $PF = \\text{distance}(P, \\text{directrice})$. $p$ est **signé**, le sommet est à ' +
        'mi-chemin entre foyer et directrice, et il y a 2 orientations symétriques.',
      'Lieux géométriques — traduis la phrase en équation, résous le système par substitution (au plus du second degré quand l\'un des deux lieux est une droite), dénombre 0, 1 ou 2 solutions. Une droite parallèle à l\'axe d\'une parabole la coupe en un seul point sans être tangente.',
      'Deux cercles — soustraire leurs équations fait disparaître les carrés : il reste une droite, que ' +
        'l\'on substitue dans l\'une des deux équations.',
    ],
    checklist: {
      label: 'Avant de rendre ta copie',
      items: [
        "Ai-je bien vérifié qu'une droite verticale ou horizontale n'admet pas les deux formes explicites ?",
        'Le $p$ de ma parabole est-il bien signé — jamais une distance donnée en positif par défaut ?',
        'Le coefficient de $x^2$ et de $y^2$ de mon cercle sont-ils bien identiques avant que je ' +
          'complète le carré ?',
        'Ai-je diagnostiqué le cas (sécantes / parallèles / confondues, 0, 1 ou 2 points) avant de ' +
          'me lancer dans un calcul ?',
        'Après avoir complété le carré, mon second membre est-il bien positif (sinon, ce n\'est pas un cercle) ?',
        'Ai-je évité « $m \\cdot m\' = -1$ » quand l\'une des deux droites est verticale ou horizontale ?',
      ],
    },
    forward:
      'La parabole de ce chapitre est aussi celle de la fonction du second degré (chapitre 1). En ' +
      '6e, les lieux géométriques reviennent avec des paramètres, et la parabole retrouve deux ' +
      'cousines définies elles aussi par des distances : l\'ellipse et l\'hyperbole (chapitre ' +
      'sur les coniques).',
    entrainement: {
      kind: 'entrainement',
      title: 'Géométrie analytique plane — quiz vrai/faux',
      generatorId: 'gen65',
      description: ['Choisis un thème et teste-toi : 595 affirmations pré-écrites réparties en 17 thèmes (35 par thème), qui reprennent tout le chapitre. Une seule tentative par question, justification toujours révélée.'],
      chantier: '4e',
      whereLabel: '4e → « 65. Géométrie analytique plane — quiz vrai/faux »',
    },
  },
}
