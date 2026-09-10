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
      blocks: [
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
            ['Un point et un angle avec Oy', 'même principe, angle mesuré depuis l\'axe vertical'],
            ['Un point et une pente m', '$\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$'],
          ],
        },
        { kind: 'subheading', text: '4 façons d\'écrire la même droite' },
        {
          kind: 'para',
          text:
            'Tu connais un point et le vecteur directeur ? Alors tu peux écrire la même droite ' +
            'de 4 façons différentes. Chacune est utile dans un contexte différent.',
        },
        {
          kind: 'rappel',
          label: "D'où vient la forme paramétrique ? — l'équation vectorielle",
          items: [
            'Un point M(x ; y) appartient à la droite (A, $\\vec{u}$) exactement quand $\\vec{AM}$ ' +
              'et $\\vec{u}$ sont colinéaires. Autrement dit : il existe un nombre t tel que ' +
              '$\\vec{AM} = t \\cdot \\vec{u}$. C\'est l\'**équation vectorielle** de la droite. ' +
              "Écris-la composante par composante : $\\begin{pmatrix} x-x_0 \\\\ y-y_0 " +
              '\\end{pmatrix} = t \\cdot \\begin{pmatrix} a \\\\ b \\end{pmatrix}$. Tu retrouves ' +
              'exactement le système paramétrique $\\begin{cases} x = x_0+t \\cdot a \\\\ y = ' +
              'y_0+t \\cdot b \\end{cases}$.',
          ],
        },
        {
          kind: 'methode',
          label: 'Les 4 formes',
          items: [
            '**Implicite** — $a \\cdot x + b \\cdot y + c = 0$. Le vecteur $\\begin{pmatrix} a ' +
              '\\\\ b \\end{pmatrix}$ est un vecteur **normal** : il est perpendiculaire au ' +
              'vecteur directeur $\\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}$. Tu peux ' +
              'prendre $a=-\\beta$, $b=\\alpha$. Cette forme est **toujours possible**, pour ' +
              "n'importe quelle droite.",
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
      blocks: [
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
      ],
    },

    {
      id: 'caracteristiques',
      number: 3,
      title: "Pente, angle avec les axes, ordonnée à l'origine",
      kicker: 'm = tan θ — trois façons de décrire la même inclinaison',
      blocks: [
        {
          kind: 'para',
          text:
            "La pente, l'angle avec Ox et l'ordonnée à l'origine décrivent chacun un aspect de " +
            'la même droite. Les deux premiers décrivent son inclinaison. Le troisième décrit sa ' +
            'position.',
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
            '**Angle avec Oy** — c\'est l\'angle complémentaire du précédent : $\\theta_{Oy} = 90° - \\theta_{Ox}$ (ramené dans $[0°;180°[$ si négatif).',
            "**Ordonnée à l'origine** — p, c'est la valeur de y quand x = 0. C'est le point où la droite coupe Oy. Elle n'existe pas pour une verticale.",
          ],
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
          kind: 'entrainement',
          title: "Caractéristiques d'une droite",
          generatorId: 'gen46',
          description: ["Pars de n'importe quelle forme d'équation. Retrouve la pente, un angle ou l'ordonnée à l'origine."],
          chantier: '4e',
          whereLabel: "4e → « 46. Caractéristiques d'une droite »",
        },
      ],
    },

    {
      id: 'relations',
      number: 4,
      title: 'Droites parallèles et perpendiculaires',
      kicker: 'déterminant nul ↔ parallèles — produit scalaire nul ↔ perpendiculaires',
      blocks: [
        {
          kind: 'para',
          text:
            'Il y a deux critères sur les vecteurs directeurs, à ne jamais confondre. Ce sont ' +
            'les mêmes que pour la colinéarité et l\'orthogonalité de vecteurs, appliqués ici à ' +
            'des droites.',
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
            'Prends deux vecteurs directeurs $\\vec{u}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ ' +
              "et $\\vec{v}\\begin{pmatrix} a' \\\\ b' \\end{pmatrix}$ :",
            "**Parallèles** ⟺ déterminant nul : $a \\cdot b' - b \\cdot a' = 0$. En pentes (si les deux existent), ça donne $m = m'$.",
            "**Perpendiculaires** ⟺ produit scalaire nul : $a \\cdot a' + b \\cdot b' = 0$. En pentes (si les deux existent), ça donne $m \\cdot m' = -1$.",
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
          kind: 'astuce',
          text:
            '$\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ tourné de 90° donne $\\begin{pmatrix} -b ' +
            '\\\\ a \\end{pmatrix}$ ou $\\begin{pmatrix} b \\\\ -a \\end{pmatrix}$, selon le sens ' +
            'du tour. Les deux sont perpendiculaires à $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ ' +
            "— ce sont juste des multiples négatifs l'un de l'autre. N'importe lequel des deux " +
            'convient pour construire une perpendiculaire.',
        },
        { kind: 'subheading', text: "Démonstration — d'où vient m·m′ = −1 ?" },
        {
          kind: 'para',
          text:
            'Si $\\vec{u}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ et ' +
            "$\\vec{v}\\begin{pmatrix} a' \\\\ b' \\end{pmatrix}$ sont perpendiculaires, tu peux " +
            "toujours écrire $\\vec{v} = \\begin{pmatrix} -k \\cdot b \\\\ k \\cdot a \\end{pmatrix}$ " +
            'pour un certain $k \\neq 0$ (le produit scalaire $a \\cdot (-kb) + b \\cdot (ka) = ' +
            '0$ est toujours vrai, quel que soit k). Les pentes valent alors $m = \\frac{b}{a}$ ' +
            "et $m' = \\frac{ka}{-kb} = \\frac{a}{-b}$. Leur produit vaut $m \\cdot m' = " +
            '\\frac{b}{a} \\cdot \\frac{a}{-b} = -1$, quels que soient a, b et k.',
        },
        {
          kind: 'entrainement',
          title: 'Relations entre droites',
          generatorId: 'gen45',
          description: ['Construis la droite parallèle ou perpendiculaire à une droite donnée. Elle doit passer par un point imposé.'],
          chantier: '4e',
          whereLabel: '4e → « 45. Relations entre droites (parallèle/perpendiculaire) »',
        },
      ],
    },

    {
      id: 'intersection',
      number: 5,
      title: 'Intersection de deux droites',
      kicker: 'sécantes (1 point) — parallèles distinctes (0 point) — confondues (une infinité)',
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
            points: [{ x: 1.8, y: 1.4, label: '(9/5 ; 7/5)', tone: 'ink', labelPos: 'right' }],
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
              text: '$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ et $\\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$ — déterminant $2 \\cdot (-2) - 1 \\cdot 1 = -5 \\neq 0$ → sécantes',
            },
            { tag: 'isoler x dans d₁', text: '$x = 2y-1$' },
            { tag: 'substituer dans d₂', text: '$2(2y-1) + y - 5 = 0 \\to 5y-7=0 \\to y = \\frac{7}{5}$' },
          ],
          result: { tag: "point d'intersection", text: '$x = 2 \\cdot \\frac{7}{5} - 1 = \\frac{9}{5}$ → $(\\frac{9}{5} ; \\frac{7}{5})$' },
        },
        {
          kind: 'entrainement',
          title: 'Intersection entre deux droites',
          generatorId: 'gen48',
          description: ['Diagnostique le cas (sécantes, parallèles ou confondues). Puis calcule le point commun quand il existe.'],
          chantier: '4e',
          whereLabel: '4e → « 48. Intersection entre deux droites »',
        },
      ],
    },

    {
      id: 'distance',
      number: 6,
      title: 'Distance point-droite et droite-droite',
      kicker: 'construire la perpendiculaire, trouver le pied, mesurer — sans formule toute faite',
      blocks: [
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
          kind: 'entrainement',
          title: 'Distance point-droite et droite-droite',
          generatorId: 'gen47',
          description: ['Exercice de synthèse : construis la perpendiculaire, trouve le pied, mesure la distance. Sans jamais utiliser de formule directe.'],
          chantier: '4e',
          whereLabel: '4e → « 47. Distance point-droite et droite-droite »',
        },
      ],
    },

    {
      id: 'notion-lieu',
      number: 7,
      title: "Qu'est-ce qu'un lieu géométrique ?",
      kicker: 'propriété caractéristique — tous les points qui la partagent, et eux seuls',
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
      ],
    },

    {
      id: 'cercle',
      number: 8,
      title: 'Le cercle',
      kicker: "(x−x₀)² + (y−y₀)² = r² — depuis un graphe, ou depuis l'équation développée",
      blocks: [
        {
          kind: 'para',
          text:
            'Un cercle de centre $(x_0 ; y_0)$ et de rayon r, c\'est l\'ensemble des points ' +
            'situés exactement à distance r du centre. Ça donne directement son équation, par ' +
            'Pythagore.',
        },
        {
          kind: 'rappel',
          label: "D'où vient l'équation (x−x₀)² + (y−y₀)² = r² ?",
          items: [
            'Un point P(x ; y) appartient au cercle exactement quand sa distance au centre ' +
              '$C(x_0 ; y_0)$ vaut r : $\\sqrt{(x-x_0)^2+(y-y_0)^2} = r$. Élève les deux membres ' +
              "au carré. Une distance est déjà positive, donc aucune solution n'est perdue. Tu " +
              'obtiens directement $(x-x_0)^2+(y-y_0)^2=r^2$.',
            '**Cas particulier** — cercle centré à l\'origine : $x^2+y^2=r^2$.',
          ],
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
            caption: 'rayon direct si le point marqué est aligné avec le centre, indirect (par Pythagore) sinon',
          },
        },
        {
          kind: 'exemple',
          badge: 'rayon indirect',
          formula: 'Centre C(1 ; 1), point marqué P(4 ; 5) sur le cercle (non aligné avec C).',
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
            'En développant $(x-a)^2+(y-b)^2=r^2$, tu obtiens une équation de la forme ' +
            '$k \\cdot x^2 + k \\cdot y^2 + b_x \\cdot x + b_y \\cdot y = c$. Remarque : c\'est ' +
            '**le même coefficient k devant x² et devant y²**. Retrouver le centre et le rayon, ' +
            "c'est faire le chemin inverse : regrouper, puis compléter le carré.",
        },
        {
          kind: 'attention',
          label: 'Condition — un cercle, pas une ellipse',
          text:
            'Si les coefficients de x² et de y² sont **différents**, l\'équation ne décrit pas ' +
            'un cercle, mais une ellipse ! Cette méthode ne marche que si le coefficient est ' +
            'identique sur les deux carrés.',
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
      ],
    },

    {
      id: 'parabole',
      number: 9,
      title: 'La parabole : foyer, directrice et équation',
      kicker: 'équidistance d\'un point (foyer) et d\'une droite (directrice)',
      blocks: [
        {
          kind: 'para',
          text:
            'Une parabole, c\'est l\'ensemble des points P situés à la même distance d\'un ' +
            'point fixe F, le **foyer**, et d\'une droite fixe d, la **directrice**. Toujours ' +
            '$PF = distance(P, d)$. Le **sommet** S de la parabole est le milieu du segment qui ' +
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
        { kind: 'subheading', text: 'Démonstration — cas le plus simple (sommet à l\'origine, axe vertical)' },
        {
          kind: 'para',
          text:
            'Prends le foyer $F(0 ; p/2)$ et la directrice $d : y=-p/2$. Un point P(x ; y) est ' +
            'sur la parabole exactement quand $dist(P,F) = dist(P,d)$ :',
        },
        {
          kind: 'exemple',
          steps: [
            { tag: 'équidistance', text: '$\\sqrt{x^2+(y-p/2)^2} = y+p/2$' },
            { tag: 'élever au carré', text: '$x^2+y^2-py+p^2/4 = y^2+py+p^2/4$' },
          ],
          result: { tag: 'après simplification', text: '$x^2=2py$' },
        },
        {
          kind: 'para',
          text:
            'Décale maintenant le sommet en $S(x_S ; y_S)$ plutôt qu\'à l\'origine (une simple ' +
            'translation) : tu obtiens directement la forme générale $(x-x_S)^2=2p(y-y_S)$ du ' +
            "tableau ci-dessus. L'axe horizontal s'obtient en échangeant les rôles de x et y.",
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
          description: ['Construis la parabole au compas et à l\'équerre, à partir du foyer et de la directrice seuls. Sans aucune coordonnée à calculer.'],
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
      blocks: [
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
            ['« les points équidistants de (−1 ; 0) et de la droite x=−3 »', 'parabole', 'foyer (−1;0), directrice x=−3'],
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            '**Identifie** le type de chacun des deux lieux, puis extrais-en les paramètres.',
            '**Écris** l\'équation de chaque lieu.',
            '**Résous** le système par substitution — ça mène toujours à une équation **quadratique** à une seule inconnue.',
            '**Dénombre** les solutions (0, 1 ou 2), puis remonte aux coordonnées de chaque point d\'intersection.',
          ],
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
                { x: 1.37, y: 0.811, tone: 'ink', node: true },
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
          kind: 'entrainement',
          title: 'Lieux géométriques',
          generatorId: 'gen54',
          description: ['Reconnais deux lieux décrits par une phrase. Écris leurs équations. Puis trouve leur(s) point(s) commun(s).'],
          chantier: '4e',
          whereLabel: '4e → « 54. Lieux géométriques »',
        },
      ],
    },

    {
      id: 'revision',
      number: 11,
      title: 'Révision — quiz vrai/faux',
      kicker: '260 affirmations en 13 thèmes',
      blocks: [
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre les treize générateurs de ce chapitre. Un thème par ' +
            'générateur, sans fusion : contrairement au chapitre sur les vecteurs, chaque ' +
            "générateur d'ici teste une compétence vraiment distincte.",
        },
      ],
    },
  ],

  recap: {
    items: [
      'Droite — un point + un vecteur directeur, c\'est la seule vérité géométrique. 4 formes ' +
        'équivalentes (implicite, explicite en y, explicite en x, paramétrique) ; les deux ' +
        'formes explicites sont parfois impossibles (verticale/horizontale).',
      'Pente et angle — $m=\\tan\\theta$, $\\theta \\in [0°;180°[$. Angle avec Oy = 90° − angle ' +
        'avec Ox. Ni la pente ni l\'angle avec Oy ne se calculent négativement.',
      'Parallèles / perpendiculaires — déterminant nul ↔ colinéaires ; produit scalaire nul ↔ ' +
        'orthogonaux. En pentes : $m=m\'$ ou $m \\cdot m\'=-1$.',
      "Intersection — compare d'abord les vecteurs directeurs (sécantes ou colinéaires), avant tout calcul de système.",
      'Distance — jamais de formule directe : perpendiculaire, intersection, puis norme du vecteur obtenu.',
      'Cercle — $(x-x_0)^2+(y-y_0)^2=r^2$. En développée, le coefficient de x² et de y² doit ' +
        'être **identique**, puis tu complètes le carré pour retrouver centre et rayon.',
      'Parabole — PF = distance(P, directrice). p est **signé**, le sommet est à mi-chemin entre ' +
        'foyer et directrice, et il y a 2 orientations symétriques.',
      'Lieux géométriques — traduis la phrase en équation, résous le système (toujours une quadratique), dénombre 0, 1 ou 2 solutions.',
    ],
    checklist: {
      label: 'Avant de rendre ta copie',
      items: [
        "Ai-je bien vérifié qu'une droite verticale ou horizontale n'admet pas les deux formes explicites ?",
        'Le p de ma parabole est-il bien signé — jamais une distance donnée en positif par défaut ?',
        'Le coefficient de x² et de y² de mon cercle sont-ils bien identiques avant que je complète le carré ?',
        'Ai-je diagnostiqué le cas (sécantes/parallèles/confondues, 0/1/2 points) avant de me lancer dans un calcul ?',
      ],
    },
    forward:
      "Les mêmes équations de droite et de cercle reviennent telles quelles en géométrie de " +
      "l'espace — avec une troisième coordonnée en plus, et un plan à la place d'une droite.",
    entrainement: {
      kind: 'entrainement',
      title: 'Géométrie analytique plane — quiz vrai/faux',
      generatorId: 'gen65',
      description: ['260 affirmations pré-écrites réparties en 13 thèmes (20 par thème), qui reprennent tout ce chapitre. Un seul essai par question, la justification est toujours révélée.'],
      chantier: '4e',
      whereLabel: '4e → « 65. Géométrie analytique plane — quiz vrai/faux »',
    },
  },
}
