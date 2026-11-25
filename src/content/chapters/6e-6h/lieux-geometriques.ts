import type { ChapterContent } from '../../types'

export const lieuxGeometriques: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 9,
  title: 'Lieux géométriques',
  slug: 'lieux-geometriques',
  lede:
    "Retrouve un triangle à partir de ses milieux, ses points remarquables et sa droite d'Euler. " +
    "Construis le cercle qui passe par trois points. Traduis en équation l'ensemble des points qui " +
    "vérifient une même condition. Ou suis la trajectoire du point où se croisent deux droites " +
    "mobiles : ce chapitre relie l'algèbre des droites (forme implicite $ax+by+c=0$) et des cercles " +
    'à la grande question de la géométrie analytique — quelle équation caractérise un ensemble de ' +
    'points défini géométriquement ?',

  sections: [
    {
      id: 'points-droites-remarquables',
      number: 1,
      title: 'Points et droites remarquables du triangle',
      kicker: 'toute droite en ax+by+c=0 — distance, médianes, médiatrices, hauteurs, G, O, H, droite d’Euler, bissectrice, symétrique',
      titreCourt: "Points remarquables",
      partie: "Le triangle et le cercle en coordonnées",
      essentiel: [
        "Dans tout ce chapitre, une droite s'écrit $ax+by+c=0$ ; deux équations de la même droite sont **proportionnelles**, et $\\mathrm{dist}(P\\,;d)=\\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}$.",
        "Les médianes se coupent en $G=\\dfrac{A+B+C}{3}$, les médiatrices en $O$ (centre du cercle circonscrit), les hauteurs en $H$ ; $O$, $G$, $H$ sont alignés : $\\overrightarrow{OH}=3\\,\\overrightarrow{OG}$ (droite d'Euler).",
        "La bissectrice issue de $B$ coupe $[AC]$ en $I$ tel que $\\dfrac{AI}{IC}=\\dfrac{AB}{BC}$ ; le symétrique de $P$ par rapport à une droite est $Q=2H-P$.",
      ],
      cartes: [
        { question: "Quelle normale utilise-t-on pour la hauteur issue de $A$ ?", reponse: "$\\overrightarrow{BC}$, le côté opposé ; la droite passe par $A$." },
        { question: "Triangle $A(0\\,;0)$, $B(8\\,;0)$, $C(1\\,;7)$, avec $O(4\\,;3)$ : que vaut $H$ ?", reponse: "$H=A+B+C-2O=(9-8\\,;7-6)=(1\\,;1)$." },
        { question: "Distance de $P(2\\,;-1)$ à la droite $3x-4y+12=0$ ?", reponse: "$\\dfrac{|6+4+12|}{5}=4{,}4$." },
        { question: "$C$ parcourt une droite non parallèle à $(AB)$ : combien de positions donnent une aire $k>0$ ?", reponse: "Deux, symétriques par rapport au point où la droite coupe $(AB)$." },
      ],
      blocks: [
        { kind: 'video', title: 'Points et droites remarquables (1/2) : repère, forme implicite, pente, distance', youtubeId: 'IxrD4EpvX88' },
        { kind: 'video', title: 'Points et droites remarquables (2/2) : milieux, bissectrice, aire variable', youtubeId: 'cGborW9oZH8' },
        {
          kind: 'para',
          text:
            'Un triangle cache plusieurs points remarquables : le **centre de gravité** $G$ (où se ' +
            'coupent les médianes), le centre $O$ du **cercle circonscrit** (médiatrices), ' +
            "l'**orthocentre** $H$ (hauteurs), le centre $I$ du **cercle inscrit** (bissectrices), le " +
            "pied d'une bissectrice, les sommets retrouvés à partir des milieux, le symétrique d'un " +
            'point. La géométrie analytique les retrouve tous avec le même outil : une droite écrite ' +
            'sous forme implicite — jamais sous forme explicite.',
        },
        {
          kind: 'intuition',
          label: 'Le prolongement direct de 4e',
          text:
            "Tu as déjà presque tout l'outillage : une droite en $ax+by+c=0$, un vecteur directeur, " +
            'une normale — exactement ce que tu as construit en géométrie analytique plane, en 4e. Ce ' +
            'chapitre réutilise ces mêmes outils sur des figures plus riches (triangle, cercle, lieu) ' +
            "plutôt que sur une seule droite isolée, et il ajoute ce qui manquait : la distance d'un " +
            'point à une droite, démontrée ci-dessous, et les points remarquables du triangle.',
        },
        {
          kind: 'definition',
          label: 'Repère affine ou orthonormé ?',
          items: [
            'Un repère **orthonormé** a deux axes perpendiculaires, avec la même unité sur les ' +
              "deux — le seul repère où une distance (Pythagore), un angle (produit scalaire) ou " +
              'une équation de cercle se calculent avec les formules habituelles.',
            'Un repère seulement **affine** (axes quelconques, unités parfois différentes) reste ' +
              "valable pour tout ce qui ne change pas par affinité : alignement, parallélisme, " +
              'milieu, centre de gravité. Distances, angles et cercles y existent toujours, mais leurs ' +
              "formules habituelles n'y sont plus valables : $\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$ ne " +
              'donne plus la distance $AB$.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -2.5, xMax: 3.5, yMin: -2.1875, yMax: 3.4375,
              showAxes: false,
              circle: { cx: 0, cy: 0, r: 1.8, tone: 'accent' },
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'ink', arrow: true },
                { from: { x: 0, y: 0 }, to: { x: 0, y: 2.8 }, tone: 'ink', arrow: true },
              ],
              rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 3, y: 0 }, arm2: { x: 0, y: 2.8 } }],
              angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 90, radiusPx: 16, tone: 'good', label: '90°' }],
              points: [
                { x: 3.05, y: 0, label: 'x', tone: 'ink', node: false, labelPos: 'right' },
                { x: 0, y: 2.9, label: 'y', tone: 'ink', node: false, labelPos: 'right' },
                { x: -2.3, y: 3.0, label: 'orthonormé ✓', tone: 'good', node: false, labelPos: 'right' },
              ],
              caption: 'repère ORTHONORMÉ : un cercle y reste rond, distances et angles se calculent avec les formules usuelles',
            },
            {
              kind: 'vectorPlane',
              xMin: -2.5, xMax: 3.5, yMin: -2.1875, yMax: 3.4375,
              showAxes: false,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'ink', arrow: true },
                { from: { x: 0, y: 0 }, to: { x: 1.3, y: 2.7 }, tone: 'ink', arrow: true },
              ],
              angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 64.3, radiusPx: 18, tone: 'accent', label: '≠90°' }],
              points: [
                { x: 3.05, y: 0, label: 'x', tone: 'ink', node: false, labelPos: 'right' },
                { x: 1.3, y: 2.75, label: 'y', tone: 'ink', node: false, labelPos: 'above' },
                { x: -2.3, y: 3.0, label: 'affine : axes obliques', tone: 'accent', node: false, labelPos: 'right' },
              ],
              caption:
                'repère seulement AFFINE (axes non perpendiculaires, unités éventuellement différentes) : les formules de distance, d’angle et de cercle ne sont plus valables',
            },
          ],
        },
        {
          kind: 'astuce',
          text:
            "Avant d'écrire $\\mathrm{dist}(P\\,;d)=\\ldots$ ou une équation de cercle " +
            '$x^2+y^2+Dx+Ey+F=0$, vérifie toujours que l\'énoncé annonce bien un repère ' +
            '**orthonormé** ! Tout ce chapitre (cercles, distances, angles) suppose ce repère, sauf ' +
            'mention contraire explicite.',
        },
        {
          kind: 'definition',
          label: 'Convention — toute droite en forme implicite',
          items: [
            "Dans tout ce chapitre, une droite s'écrit $ax+by+c=0$ — jamais $y=mx+p$. Cette forme " +
              "n'a aucun cas particulier pour une droite verticale, et ramène toute intersection " +
              'de deux droites à un simple système 2×2.',
            'Pour comparer deux équations de la même droite, compare le triplet $(a\\,;b\\,;c)$ par ' +
              '**proportionnalité** — jamais coefficient par coefficient. $4x+6y-10=0$ et ' +
              '$2x+3y-5=0$ sont la même droite.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3, xMax: 5, yMin: -2.5, yMax: 5,
            vectors: [{ from: { x: -3, y: 11 / 3 }, to: { x: 5, y: -5 / 3 }, tone: 'accent', arrow: false }],
            points: [{ x: -2.8, y: -1.7, label: '2x+3y−5=0 ≡ 4x+6y−10=0', tone: 'accent', node: false, labelPos: 'right' }],
            caption: '2x+3y−5=0 et 4x+6y−10=0 : deux équations proportionnelles d\'une seule et même droite, jamais deux droites différentes',
          },
        },
        {
          kind: 'methode',
          label: 'Vecteur directeur, vecteur normal, rotation de 90°',
          items: [
            'Une droite de vecteur directeur $(d_x\\,;d_y)$ a pour vecteur normal $(-d_y\\,;d_x)$ : la ' +
              'rotation de 90° du directeur — jamais le vecteur recopié tel quel !',
            'Une droite qui passe par $P(x_0\\,;y_0)$ avec pour normale $(a\\,;b)$ a pour équation ' +
              '$a(x-x_0)+b(y-y_0)=0$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2, xMax: 3, yMin: -1, yMax: 3.6875,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2, y: 1 }, tone: 'ink' },
              { from: { x: 0, y: 0 }, to: { x: -1, y: 2 }, tone: 'accent' },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 2, y: 1 }, arm2: { x: -1, y: 2 } }],
            points: [
              { x: 2, y: 1, label: 'd=(2;1)', tone: 'ink', labelPos: 'below' },
              { x: -1, y: 2, label: 'n=(−1;2)', tone: 'accent', labelPos: 'above' },
            ],
            caption: 'vecteur directeur $\\vec{d}=(2\\,;1)$ d\'une droite et son vecteur normal $\\vec{n}=(-1\\,;2)$, obtenu par rotation de 90° de $\\vec{d}$',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — parallélisme et perpendicularité ne s'échangent jamais",
          text:
            'Pour deux droites de normales $(a_1\\,;b_1)$ et $(a_2\\,;b_2)$ : $a_1b_2-a_2b_1=0$ ⟺ ' +
            'droites **parallèles** ; $a_1a_2+b_1b_2=0$ ⟺ droites **perpendiculaires**. Confondre ' +
            "les deux critères, c'est l'erreur la plus fréquente de ce chapitre !",
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -3, xMax: 3, yMin: -2, yMax: 3.625,
              vectors: [
                { from: { x: -3, y: -1.5 }, to: { x: 3, y: 1.5 }, tone: 'ink', arrow: false },
                { from: { x: -3, y: 0.5 }, to: { x: 3, y: 3.5 }, tone: 'accent', arrow: false },
              ],
              caption: 'deux droites parallèles : $a_1b_2-a_2b_1=0$',
            },
            {
              kind: 'vectorPlane',
              xMin: -3, xMax: 3, yMin: -2.8125, yMax: 2.8125,
              vectors: [
                { from: { x: -3, y: -1.5 }, to: { x: 3, y: 1.5 }, tone: 'ink', arrow: false },
                { from: { x: -1.2, y: 2.4 }, to: { x: 1.2, y: -2.4 }, tone: 'accent', arrow: false },
              ],
              rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 3, y: 1.5 }, arm2: { x: -1.2, y: 2.4 } }],
              caption: 'deux droites perpendiculaires : $a_1a_2+b_1b_2=0$ — ne jamais confondre les deux critères',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'relations-droites-widget',
          label: 'Manipule toi-même : parallèles, perpendiculaires ou sécantes ?',
          caption:
            'Rappel de 4e. Règle les coefficients de deux droites ax + by + c = 0 : l’atelier lit un ' +
            'vecteur directeur (−b ; a) de chacune, perpendiculaire à la normale (a ; b), puis teste le ' +
            'parallélisme (critère de colinéarité, l’équivalent de a₁b₂ − a₂b₁ = 0) et la ' +
            'perpendicularité (produit scalaire nul). Pour deux sécantes, il calcule le point ' +
            'd’intersection pas à pas. En mode Défi, trouve la position relative en un seul essai.',
        },
        { kind: 'subheading', text: 'Caractériser une droite par sa pente' },
        {
          kind: 'methode',
          label: 'Pente, parallélisme, perpendicularité, angle',
          items: [
            'Si $b \\neq 0$, la droite $ax+by+c=0$ a pour pente $m=-\\dfrac{a}{b}$.',
            'Parallèles ⟺ $m_1=m_2$. Perpendiculaires ⟺ $m_1 \\cdot m_2=-1$.',
            "Angle aigu $\\theta$ entre deux droites sécantes de pentes $m_1$ et $m_2$, quand " +
              '$1+m_1m_2\\neq0$ : $\\tan\\theta = \\left|\\dfrac{m_2-m_1}{1+m_1 m_2}\\right|$ — la valeur ' +
              'absolue porte sur **tout** le quotient. Si $1+m_1m_2=0$, les droites sont ' +
              'perpendiculaires : $\\theta=90^\\circ$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3, xMax: 3, yMin: -2.8125, yMax: 2.8125,
            vectors: [
              { from: { x: -3, y: -0.9 }, to: { x: 2.6, y: 0.78 }, tone: 'ink', arrow: false },
              { from: { x: -1.5, y: 2.25 }, to: { x: 1.5, y: -2.25 }, tone: 'accent', arrow: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: -56.3, toDeg: 16.7, radiusPx: 26, tone: 'good', label: 'θ' }],
            points: [
              { x: 2.3, y: 0.69, label: 'm₁', tone: 'ink', labelPos: 'above', node: false },
              { x: 1.5, y: -2.25, label: 'm₂', tone: 'accent', labelPos: 'right', node: false },
            ],
            caption: 'deux droites sécantes de pentes $m_1=0{,}3$ et $m_2=-1{,}5$ : $\\tan\\theta=\\left|\\dfrac{-1{,}8}{0{,}55}\\right|$, soit $\\theta\\approx73^\\circ$',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — une droite verticale n'a pas de pente",
          text:
            'Une droite $x=k$ (verticale, $b=0$) n\'a pas de pente définie ! Traite toujours ce ' +
            "cas à part — ou raisonne uniquement avec les normales $(a\\,;b)$, qui n'ont jamais de " +
            'cas particulier.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2, xMax: 4, yMin: -2.8125, yMax: 2.8125,
            vectors: [{ from: { x: 2, y: -2.8125 }, to: { x: 2, y: 2.8125 }, tone: 'accent', arrow: false }],
            points: [{ x: 2, y: -1.2, label: 'x=k', tone: 'accent', node: false, labelPos: 'right' }],
            caption: 'droite verticale $x=k$ : aucune pente n\'est définie',
          },
        },
        { kind: 'subheading', text: "Distance d'un point à une droite" },
        {
          kind: 'definition',
          label: "Distance d'un point à une droite",
          items: [
            'La distance du point $P$ à la droite $d$ est la longueur $PH$, où $H$ est le pied de la ' +
              'perpendiculaire menée de $P$ à $d$ : la plus courte distance de $P$ à un point de $d$.',
            'Dans un repère orthonormé, pour $P(x_P\\,;y_P)$ et $d \\equiv ax+by+c=0$ : ' +
              '$\\mathrm{dist}(P\\,;d) = \\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}$ (démontré ci-dessous).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'distance point-droite',
          formula: 'Calcule la distance du point $P(2\\,;-1)$ à la droite $d \\equiv 3x-4y+12=0$, puis vérifie-la avec le pied $H$ de la perpendiculaire.',
          steps: [
            { tag: 'numérateur', text: '$|3\\times 2 - 4\\times(-1)+12|$ $= |6+4+12|$ $=22$' },
            { tag: 'dénominateur', text: '$\\sqrt{3^2+(-4)^2}=\\sqrt{25}=5$' },
            { tag: 'pied H', text: '$H=P+t\\,(3\\,;-4)$ avec $t=-\\dfrac{22}{25}$ : $H(-0{,}64\\,;2{,}52)$' },
          ],
          result: {
            tag: 'distance',
            text:
              '$\\mathrm{dist}(P\\,;d)=\\dfrac{22}{5}=4{,}4$ ; vérification : ' +
              '$PH=\\sqrt{2{,}64^2+3{,}52^2}$ $=\\sqrt{19{,}36}=4{,}4$ ✓',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 5.5, yMin: -3, yMax: 8.25,
            vectors: [
              { from: { x: -6.5, y: -1.875 }, to: { x: 5.5, y: 7.125 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: -1 }, to: { x: -0.64, y: 2.52 }, tone: 'accent', dashed: true, arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: -0.64, y: 2.52 }, arm1: { x: 3, y: 5.25 }, arm2: { x: 2, y: -1 } }],
            points: [
              { x: 2, y: -1, label: 'P', tone: 'accent', labelPos: 'right' },
              { x: -0.64, y: 2.52, label: 'H', tone: 'ink', labelPos: 'left' },
              { x: 1.08, y: 1.06, label: '4,4', tone: 'accent', node: false, labelPos: 'right' },
              { x: 3.4, y: 5.55, label: 'd', tone: 'ink', node: false, labelPos: 'left' },
            ],
            caption:
              'distance de $P(2\\,;-1)$ à la droite $d \\equiv 3x-4y+12=0$ : $H$, pied de la perpendiculaire, donne $PH=4{,}4$',
          },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — distance d'un point à une droite",
          blocks: [
            {
              kind: 'para',
              text:
                'Le vecteur $\\vec{n}=(a\\,;b)$ est normal à $d$ : la perpendiculaire à $d$ menée par $P$ ' +
                'est dirigée par $\\vec{n}$, donc son pied s\'écrit $H=(x_P+ta\\,;y_P+tb)$ pour un certain ' +
                'réel $t$ — **droite dirigée par le vecteur normal, passant par** $P$.',
            },
            {
              kind: 'para',
              text:
                '$H\\in d$ : $a(x_P+ta)+b(y_P+tb)+c=0$, soit $ax_P+by_P+c+t(a^2+b^2)=0$, donc ' +
                '$t=-\\dfrac{ax_P+by_P+c}{a^2+b^2}$ — **le pied vérifie l\'équation de la droite** ($a^2+b^2\\neq0$).',
            },
            {
              kind: 'para',
              text:
                '$\\overrightarrow{PH}=t\\,\\vec{n}$, donc $PH=|t|\\sqrt{a^2+b^2}$ ' +
                '$=\\dfrac{|ax_P+by_P+c|}{a^2+b^2}\\sqrt{a^2+b^2}$ ' +
                '$=\\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}$ — **norme d\'un multiple d\'un vecteur**.',
            },
            {
              kind: 'para',
              text:
                "Pour tout autre point $Q$ de $d$, le triangle $PHQ$ est rectangle en $H$ : $PQ>PH$ " +
                '(Pythagore). $PH$ est donc bien la plus courte distance de $P$ à $d$.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'distance-droite-widget',
          label: 'Manipule toi-même : la plus courte distance',
          caption:
            'Rappel de 4e. Déplace C, ou les points P et R qui fixent d : la perpendiculaire par C, le ' +
            'pied H et la distance CH se recalculent pas à pas. Compare avec la formule |ax + by + c| / ' +
            '√(a² + b²) ci-dessus : même résultat. Fais glisser Q sur d : CQ est toujours plus long que ' +
            'CH, sauf en H. En mode « Deux parallèles », la distance entre d et d′ est celle d’un point ' +
            'de d′ à d.',
        },
        { kind: 'subheading', text: 'Boîte à outils — les 5 questions classiques sur les droites' },
        {
          kind: 'methode',
          label: 'Comment…',
          items: [
            "**Un point** $M(x\\,;y)$ **appartient-il à** $d \\equiv ax+by+c=0$ **?** → vérifie que $ax+by+c=0$.",
            "**Quelle est l'équation de la droite passant par deux points A, B ?** → prends le " +
              'vecteur directeur $\\overrightarrow{AB}$, tourne-le de 90° pour la normale, puis écris ' +
              '$a(x-x_A)+b(y-y_A)=0$.',
            '**Comment trouver l\'intersection de deux droites ?** → résous le système 2×2. ' +
              'Système impossible ⟺ droites parallèles distinctes ; indéterminé ⟺ droites confondues.',
            '**Trois droites sont-elles concourantes ?** → résous le système formé par deux ' +
              "d'entre elles, puis vérifie que le point trouvé satisfait aussi la 3e équation.",
            '**Trois points sont-ils alignés ?** → écris l\'équation de la droite passant par ' +
              "deux d'entre eux, puis vérifie que le 3e la vérifie aussi.",
          ],
        },
        { kind: 'subheading', text: 'Les points remarquables du triangle : G, O, H et la droite d’Euler' },
        {
          kind: 'definition',
          label: 'Quatre familles de droites, quatre points',
          items: [
            'Une **médiane** joint un sommet au milieu du côté opposé. Les trois médianes se coupent ' +
              'au **centre de gravité** $G=\\dfrac{A+B+C}{3}$ (moyenne des coordonnées des sommets), ' +
              'situé aux deux tiers de chaque médiane en partant du sommet.',
            'La **médiatrice** d\'un côté est la perpendiculaire à ce côté en son milieu. Les trois ' +
              'médiatrices se coupent en $O$, équidistant des trois sommets : le centre du **cercle ' +
              'circonscrit**.',
            'La **hauteur** issue d\'un sommet est la perpendiculaire au côté opposé passant par ce ' +
              'sommet. Les trois hauteurs se coupent en $H$, l\'**orthocentre**.',
            'La **bissectrice** d\'un angle le partage en deux angles égaux. Les trois bissectrices ' +
              'se coupent en $I$, équidistant des trois côtés : le centre du **cercle inscrit** (§ 2).',
            "**Droite d'Euler** : $O$, $G$ et $H$ sont alignés, avec $\\overrightarrow{OH}=3\\,\\overrightarrow{OG}$ " +
              '(donc $GH=2\\,OG$) ; autrement dit $H=A+B+C-2O$.',
          ],
        },
        {
          kind: 'methode',
          label: 'Points remarquables par équations',
          items: [
            '**Médiane issue de A** : la droite qui passe par $A$ et par le milieu $A\'$ de $[BC]$.',
            '**Médiatrice de [BC]** : normale $\\overrightarrow{BC}$, passe par le milieu de $[BC]$.',
            '**Hauteur issue de A** : normale $\\overrightarrow{BC}$ (le côté opposé !), passe par $A$.',
            "**G** : moyenne des sommets. **O** : intersection de deux médiatrices. **H** : intersection " +
              'de deux hauteurs — ou directement $H=A+B+C-2O$ une fois $O$ connu. La troisième droite sert ' +
              'de vérification.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'G, O, H du triangle A(0 ; 0), B(8 ; 0), C(1 ; 7)',
          formula:
            "Pour le triangle $A(0\\,;0)$, $B(8\\,;0)$, $C(1\\,;7)$, détermine le centre de gravité $G$, le centre " +
            "$O$ du cercle circonscrit et l'orthocentre $H$, puis vérifie que $O$, $G$ et $H$ sont alignés.",
          steps: [
            { tag: 'G', text: '$G=\\left(\\dfrac{0+8+1}{3}\\,;\\dfrac{0+0+7}{3}\\right)$ $=\\left(3\\,;\\dfrac{7}{3}\\right)$' },
            {
              tag: 'O',
              text:
                'médiatrice de $[AB]$ : $x=4$ ; médiatrice de $[AC]$ (milieu $(0{,}5\\,;3{,}5)$, normale $(1\\,;7)$) : ' +
                '$x+7y-25=0$ ; donc $O(4\\,;3)$, et $OA=OB=OC=5$',
            },
            {
              tag: 'H',
              text:
                'hauteur issue de $C$ : $x=1$ ; hauteur issue de $A$ (normale $\\overrightarrow{BC}=(-7\\,;7)$) : ' +
                '$-7x+7y=0$ ; donc $H(1\\,;1)$ ; contrôle : $H=A+B+C-2O$ $=(9-8\\,;7-6)$ ✓',
            },
          ],
          result: {
            tag: 'droite d’Euler',
            text:
              '$\\overrightarrow{OG}=\\left(-1\\,;-\\dfrac{2}{3}\\right)$ et $\\overrightarrow{OH}=(-3\\,;-2)=3\\,\\overrightarrow{OG}$ : ' +
              '$O$, $G$, $H$ sont alignés',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.6, xMax: 9.6, yMin: -2.3, yMax: 8.2,
            circle: { cx: 4, cy: 3, r: 5, tone: 'faint' },
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 8, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 8, y: 0 }, to: { x: 1, y: 7 }, tone: 'ink', arrow: false },
              { from: { x: 1, y: 7 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 1 / 3 }, to: { x: 9, y: 19 / 3 }, tone: 'good', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 8, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 7, label: 'C', tone: 'ink', labelPos: 'above' },
              { x: 4, y: 3, label: 'O', tone: 'accent', labelPos: 'below' },
              { x: 3, y: 7 / 3, label: 'G', tone: 'good', labelPos: 'below' },
              { x: 1, y: 1, label: 'H', tone: 'bad', labelPos: 'above' },
            ],
            caption:
              "triangle $A(0\\,;0)$, $B(8\\,;0)$, $C(1\\,;7)$ : cercle circonscrit de centre $O(4\\,;3)$ et de rayon 5 ; $O$, $G\\left(3\\,;\\frac{7}{3}\\right)$ et $H(1\\,;1)$ sur la droite d'Euler (en vert)",
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les trois médianes sont concourantes en G = (A + B + C)/3',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $G=\\dfrac{A+B+C}{3}$ (coordonnées) et $A\'=\\dfrac{B+C}{2}$ le milieu de $[BC]$. Le point ' +
                "situé aux deux tiers de $[AA']$ en partant de $A$ est $A+\\dfrac{2}{3}(A'-A)$ — **un point d'un " +
                'segment, repéré par une fraction de sa longueur**.',
            },
            {
              kind: 'para',
              text:
                "$A+\\dfrac{2}{3}(A'-A)=\\dfrac{1}{3}A+\\dfrac{2}{3}\\cdot\\dfrac{B+C}{2}$ $=\\dfrac{A+B+C}{3}=G$ : " +
                '$G$ est sur la médiane issue de $A$, aux deux tiers en partant du sommet.',
            },
            {
              kind: 'para',
              text:
                "L'expression $\\dfrac{A+B+C}{3}$ ne change pas quand on échange les noms des sommets : le même " +
                'calcul place $G$ sur la médiane issue de $B$ et sur celle issue de $C$. Les trois médianes ' +
                'passent donc par $G$ — **elles sont concourantes**.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la médiatrice de [AB] est exactement l’ensemble des points équidistants de A et de B',
          blocks: [
            {
              kind: 'para',
              text:
                'Repère orthonormé choisi : origine au milieu de $[AB]$, axe des abscisses sur $(AB)$, ' +
                "donc $A(-a\\,;0)$ et $B(a\\,;0)$ avec $a>0$ — ce choix ne restreint rien (§ 3). La médiatrice " +
                'de $[AB]$ est alors l\'axe des ordonnées, $x=0$.',
            },
            {
              kind: 'para',
              text:
                'Pour $P(x\\,;y)$ : $PA=PB$ ⟺ $PA^2=PB^2$ (deux longueurs positives) ⟺ ' +
                '$(x+a)^2+y^2=(x-a)^2+y^2$ ⟺ $4ax=0$ ⟺ $x=0$.',
            },
            {
              kind: 'para',
              text:
                "Chaque étape est une **équivalence** : tout point équidistant de $A$ et de $B$ est sur la " +
                'médiatrice, **et** tout point de la médiatrice est équidistant de $A$ et de $B$ (réciproque). ' +
                "C'est le modèle de toute démonstration de lieu (§ 4).",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les trois médiatrices sont concourantes en un point équidistant des sommets',
          blocks: [
            {
              kind: 'para',
              text:
                'Les médiatrices de $[AB]$ et de $[AC]$ sont perpendiculaires à $(AB)$ et à $(AC)$, qui ne ' +
                'sont pas parallèles ($A$, $B$, $C$ non alignés) : elles se coupent en un point $O$ — **deux ' +
                'droites de normales non parallèles sont sécantes**.',
            },
            {
              kind: 'para',
              text:
                '$O$ est sur la médiatrice de $[AB]$, donc $OA=OB$ ; il est sur celle de $[AC]$, donc $OA=OC$ ' +
                '— **démonstration précédente, sens direct**. Donc $OB=OC$.',
            },
            {
              kind: 'para',
              text:
                '$OB=OC$ : $O$ est équidistant de $B$ et de $C$, donc sur la médiatrice de $[BC]$ — ' +
                '**démonstration précédente, réciproque**. Les trois médiatrices passent par $O$, et ' +
                '$OA=OB=OC$ : le cercle de centre $O$ passant par $A$ passe aussi par $B$ et $C$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les trois hauteurs sont concourantes',
          blocks: [
            {
              kind: 'para',
              text:
                'Repère orthonormé choisi : axe des abscisses sur $(AB)$, axe des ordonnées sur la hauteur ' +
                'issue de $C$ ; donc $A(a\\,;0)$, $B(b\\,;0)$, $C(0\\,;c)$ avec $a\\neq b$ et $c\\neq0$. Tout ' +
                'triangle peut être placé ainsi : **le repère ne perd pas la généralité**.',
            },
            {
              kind: 'para',
              text:
                'Hauteur issue de $C$ : $x=0$. Hauteur issue de $A$ : normale $\\overrightarrow{BC}=(-b\\,;c)$, ' +
                'donc $-b(x-a)+cy=0$. Hauteur issue de $B$ : normale $\\overrightarrow{AC}=(-a\\,;c)$, donc ' +
                '$-a(x-b)+cy=0$ — **une normale et un point**.',
            },
            {
              kind: 'para',
              text:
                'En $x=0$, les deux dernières équations deviennent toutes les deux $ab+cy=0$, soit ' +
                '$y=-\\dfrac{ab}{c}$. Les trois hauteurs passent donc par $H\\left(0\\,;-\\dfrac{ab}{c}\\right)$ : ' +
                'elles sont **concourantes**.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — la droite d'Euler : O, G, H alignés et OH = 3 OG",
          blocks: [
            {
              kind: 'para',
              text:
                'Même repère que pour les hauteurs : $A(a\\,;0)$, $B(b\\,;0)$, $C(0\\,;c)$, et ' +
                '$H\\left(0\\,;-\\dfrac{ab}{c}\\right)$. Le centre de gravité vaut ' +
                '$G\\left(\\dfrac{a+b}{3}\\,;\\dfrac{c}{3}\\right)$.',
            },
            {
              kind: 'para',
              text:
                'Médiatrice de $[AB]$ : $x=\\dfrac{a+b}{2}$. Médiatrice de $[AC]$ : $-a\\left(x-\\dfrac{a}{2}\\right)+c\\left(y-\\dfrac{c}{2}\\right)=0$. ' +
                'En $x=\\dfrac{a+b}{2}$ : $-\\dfrac{ab}{2}+cy-\\dfrac{c^2}{2}=0$, donc ' +
                '$O\\left(\\dfrac{a+b}{2}\\,;\\dfrac{c^2+ab}{2c}\\right)$.',
            },
            {
              kind: 'para',
              text:
                '$\\overrightarrow{OG}=\\left(-\\dfrac{a+b}{6}\\,;\\dfrac{2c^2-3c^2-3ab}{6c}\\right)$ ' +
                '$=\\left(-\\dfrac{a+b}{6}\\,;-\\dfrac{c^2+3ab}{6c}\\right)$.',
            },
            {
              kind: 'para',
              text:
                '$\\overrightarrow{OH}=\\left(-\\dfrac{a+b}{2}\\,;-\\dfrac{ab}{c}-\\dfrac{c^2+ab}{2c}\\right)$ ' +
                '$=\\left(-\\dfrac{a+b}{2}\\,;-\\dfrac{c^2+3ab}{2c}\\right)$ $=3\\,\\overrightarrow{OG}$.',
            },
            {
              kind: 'para',
              text:
                '$\\overrightarrow{OH}=3\\,\\overrightarrow{OG}$ : les vecteurs sont colinéaires, donc $O$, $G$, $H$ ' +
                'sont alignés, avec $OH=3\\,OG$ et $GH=2\\,OG$. Si $O=G$, alors $H=O$ aussi : les trois points ' +
                'sont confondus (triangle équilatéral).',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Où sont O et H ? Trois cas à connaître',
          text:
            '**Triangle équilatéral** : $G$, $O$, $H$ et $I$ sont confondus. **Triangle rectangle** : $H$ est ' +
            "le sommet de l'angle droit et $O$ le milieu de l'hypoténuse. **Triangle obtusangle** : $O$ et $H$ " +
            'sont **à l\'extérieur** du triangle — seul $G$ (et $I$) restent toujours à l\'intérieur.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -1.5, xMax: 7.5, yMin: -1.8, yMax: 6.6375,
              circle: { cx: 3, cy: 2, r: Math.sqrt(13), tone: 'faint' },
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 6, y: 0 }, tone: 'ink', arrow: false },
                { from: { x: 6, y: 0 }, to: { x: 0, y: 4 }, tone: 'ink', arrow: false },
                { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              ],
              rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 6, y: 0 }, arm2: { x: 0, y: 4 } }],
              points: [
                { x: 0, y: 0, label: 'H = A', tone: 'bad', labelPos: 'below' },
                { x: 6, y: 0, label: 'B', tone: 'ink', labelPos: 'below' },
                { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
                { x: 3, y: 2, label: 'O', tone: 'accent', labelPos: 'above' },
              ],
              caption: 'triangle rectangle en $A$ : $H=A$, et $O$ est le milieu de l’hypoténuse $[BC]$',
            },
            {
              kind: 'vectorPlane',
              xMin: -1.5, xMax: 9.5, yMin: -3.2, yMax: 7.1125,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 8, y: 0 }, tone: 'ink', arrow: false },
                { from: { x: 8, y: 0 }, to: { x: 2, y: 2 }, tone: 'ink', arrow: false },
                { from: { x: 2, y: 2 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
                { from: { x: 0, y: 0 }, to: { x: 2, y: 6 }, tone: 'bad', dashed: true, arrow: false },
                { from: { x: 8, y: 0 }, to: { x: 2, y: 6 }, tone: 'bad', dashed: true, arrow: false },
                { from: { x: 2, y: 0 }, to: { x: 2, y: 6 }, tone: 'bad', dashed: true, arrow: false },
                { from: { x: 4, y: 1 }, to: { x: 4, y: -2 }, tone: 'accent', dashed: true, arrow: false },
                { from: { x: 0, y: 2 }, to: { x: 4, y: -2 }, tone: 'accent', dashed: true, arrow: false },
              ],
              points: [
                { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
                { x: 8, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
                { x: 2, y: 2, label: 'C', tone: 'ink', labelPos: 'right' },
                { x: 2, y: 6, label: 'H', tone: 'bad', labelPos: 'right' },
                { x: 4, y: -2, label: 'O', tone: 'accent', labelPos: 'right' },
              ],
              caption: 'triangle obtusangle en $C$ : les hauteurs (en rouge) se coupent en $H(2\\,;6)$, les médiatrices en $O(4\\,;-2)$, tous deux hors du triangle',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — hauteur et médiatrice ont la même normale',
          text:
            'La hauteur issue de $A$ et la médiatrice de $[BC]$ ont toutes les deux pour normale ' +
            "$\\overrightarrow{BC}$ — c'est le côté qui sert de **normale**, jamais de vecteur directeur. " +
            'Ce qui les distingue, c\'est le point par lequel elles passent : $A$ pour la hauteur, le milieu ' +
            "de $[BC]$ pour la médiatrice. Et $O$ n'est **pas** la moyenne des sommets : c'est $G$.",
        },
        { kind: 'subheading', text: 'Pour aller plus loin — le cercle des neuf points' },
        {
          kind: 'definition',
          items: [
            'Les milieux des trois côtés, les pieds des trois hauteurs et les milieux de $[AH]$, $[BH]$, ' +
              '$[CH]$ sont sur un même cercle : le **cercle des neuf points**, de centre $N$, milieu de ' +
              '$[OH]$, et de rayon $\\dfrac{R}{2}$, la moitié du rayon du cercle circonscrit.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.6, xMax: 9.6, yMin: -2.3, yMax: 8.2,
            circle: { cx: 2.5, cy: 2, r: 2.5, tone: 'accent' },
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 8, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 8, y: 0 }, to: { x: 1, y: 7 }, tone: 'ink', arrow: false },
              { from: { x: 1, y: 7 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 4, y: 3 }, to: { x: 1, y: 1 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 8, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 7, label: 'C', tone: 'ink', labelPos: 'above' },
              { x: 4, y: 3, label: 'O', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 1, label: 'H', tone: 'ink', labelPos: 'right' },
              { x: 2.5, y: 2, label: 'N', tone: 'accent', labelPos: 'above' },
              { x: 4, y: 0, tone: 'good' },
              { x: 4.5, y: 3.5, tone: 'good' },
              { x: 0.5, y: 3.5, tone: 'good' },
              { x: 1, y: 0, tone: 'bad' },
              { x: 4, y: 4, tone: 'bad' },
              { x: 0.16, y: 1.12, tone: 'bad' },
              { x: 0.5, y: 0.5, tone: 'ink' },
              { x: 4.5, y: 0.5, tone: 'ink' },
              { x: 1, y: 4, tone: 'ink' },
            ],
            caption:
              'même triangle : milieux des côtés (verts), pieds des hauteurs (rouges), milieux de $[AH]$, $[BH]$, $[CH]$ (sans couleur) sur le cercle de centre $N(2{,}5\\,;2)$, milieu de $[OH]$, et de rayon $2{,}5=\\frac{R}{2}$',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le cercle des neuf points (pour aller plus loin)',
          blocks: [
            {
              kind: 'para',
              text:
                'Repère des hauteurs : $A(a\\,;0)$, $B(b\\,;0)$, $C(0\\,;c)$, $H\\left(0\\,;-\\dfrac{ab}{c}\\right)$, ' +
                '$O\\left(\\dfrac{a+b}{2}\\,;\\dfrac{c^2+ab}{2c}\\right)$. Le milieu de $[OH]$ est ' +
                '$N\\left(\\dfrac{a+b}{4}\\,;\\dfrac{c^2-ab}{4c}\\right)$.',
            },
            {
              kind: 'para',
              text:
                'Les trois points liés au sommet $C$ : le pied de la hauteur $(0\\,;0)$, le milieu de $[AB]$ ' +
                '$\\left(\\dfrac{a+b}{2}\\,;0\\right)$ et le milieu de $[CH]$ $\\left(0\\,;\\dfrac{c^2-ab}{2c}\\right)$. ' +
                'Chacun est à la distance $\\rho$ de $N$, avec ' +
                '$\\rho^2=\\left(\\dfrac{a+b}{4}\\right)^2+\\left(\\dfrac{c^2-ab}{4c}\\right)^2$ — **un seul calcul de ' +
                'distance par point**.',
            },
            {
              kind: 'para',
              text:
                '$R^2=OA^2=\\left(\\dfrac{a-b}{2}\\right)^2+\\left(\\dfrac{c^2+ab}{2c}\\right)^2$. En développant, ' +
                '$(a+b)^2c^2+(c^2-ab)^2$ et $(a-b)^2c^2+(c^2+ab)^2$ valent tous les deux ' +
                '$a^2c^2+b^2c^2+c^4+a^2b^2$ : donc $\\rho^2=\\dfrac{R^2}{4}$, soit $\\rho=\\dfrac{R}{2}$.',
            },
            {
              kind: 'para',
              text:
                "$N$ (milieu de $[OH]$) et $\\dfrac{R}{2}$ ne dépendent pas du sommet qui a servi à choisir le " +
                'repère : le même calcul, fait à partir de $A$ puis de $B$, place leurs trois points sur ' +
                '**le même** cercle. Les neuf points sont donc cocycliques.',
            },
          ],
        },
        {
          kind: 'historique',
          titre: "Une droite, puis un cercle à neuf points",
          text:
            "En **1765**, **Leonhard Euler** démontre que le centre de gravité, l'orthocentre et le centre du " +
            'cercle circonscrit de tout triangle sont alignés (mémoire publié en 1767) — la droite porte ' +
            "aujourd'hui son nom. En **1821**, **Charles-Julien Brianchon** et **Jean-Victor Poncelet** " +
            'publient que les milieux des côtés et les pieds des hauteurs sont sur un même cercle ; en ' +
            '**1822**, **Karl Wilhelm Feuerbach** montre que ce cercle est tangent au cercle inscrit et aux ' +
            'trois cercles exinscrits. Le nom de « cercle des neuf points » est dû à **Olry Terquem**, en ' +
            '**1842**. Plus de deux mille ans après Euclide, le triangle avait encore des secrets.',
        },
        {
          kind: 'atelier',
          tag: 'points-remarquables-widget',
          label: 'Manipule toi-même : les points remarquables du triangle',
          caption:
            'Fais glisser A, B et C. Allume les médianes (G, centre de gravité), les hauteurs (H, ' +
            'orthocentre), les médiatrices (O, centre du cercle circonscrit), les bissectrices (I, centre ' +
            'du cercle inscrit). O, G et H restent toujours alignés sur la droite d’Euler, avec GH = 2 × ' +
            'OG. Essaie les triangles équilatéral (tout est confondu), rectangle (H au sommet de l’angle ' +
            'droit, O au milieu de l’hypoténuse) et obtus (O et H sortent du triangle), puis le cercle ' +
            'des neuf points.',
        },
        { kind: 'subheading', text: 'Retrouver un triangle à partir des milieux de ses côtés' },
        {
          kind: 'methode',
          items: [
            "Si $A'$, $B'$, $C'$ sont les milieux respectifs de $[BC]$, $[CA]$, $[AB]$, tu " +
              "retrouves chaque sommet par $A = B'+C'-A'$ (et permutations circulaires pour $B$, $C$) : " +
              "$A'B'AC'$ est un parallélogramme (théorème des milieux).",
            'Si l\'on connaît un sommet $A$ et les médianes issues de $B$ et de $C$ : $B$ est sur sa ' +
              'médiane, et le milieu de $[AB]$ est sur la médiane issue de $C$ — deux équations ' +
              'linéaires qui donnent $B$ ; de même pour $C$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'milieux → sommets',
          formula:
            "Les milieux des côtés $[BC]$, $[CA]$ et $[AB]$ d'un triangle $ABC$ sont $A'(1\\,;-1)$, $B'(4\\,;1)$ et " +
            "$C'(-1\\,;2)$. Détermine les sommets $A$, $B$ et $C$.",
          steps: [
            { tag: 'sommet A', text: "$A=B'+C'-A'$ $= (4\\,;1)+(-1\\,;2)-(1\\,;-1)$ $= (2\\,;4)$" },
            { tag: 'sommet B', text: "$B=A'+C'-B' = (-4\\,;0)$" },
            { tag: 'sommet C', text: "$C=A'+B'-C' = (6\\,;-2)$" },
          ],
          result: {
            tag: 'vérification',
            text: "$A'$ doit être le milieu de $[BC]$ : $\\left(\\dfrac{-4+6}{2}\\,;\\dfrac{0-2}{2}\\right) = (1\\,;-1)$ ✓",
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -5.5, xMax: 7.5, yMin: -5.09375, yMax: 7.09375,
            regions: [{ polygon: [{ x: 1, y: -1 }, { x: 4, y: 1 }, { x: 2, y: 4 }, { x: -1, y: 2 }], tone: 'accent' }],
            vectors: [
              { from: { x: 2, y: 4 }, to: { x: -4, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: -4, y: 0 }, to: { x: 6, y: -2 }, tone: 'ink', arrow: false },
              { from: { x: 6, y: -2 }, to: { x: 2, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 1, y: -1 }, to: { x: 4, y: 1 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 1, y: -1 }, to: { x: -1, y: 2 }, tone: 'accent', dashed: true, arrow: false },
            ],
            points: [
              { x: 2, y: 4, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: -4, y: 0, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 6, y: -2, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 1, y: -1, label: "A'", tone: 'accent', labelPos: 'below' },
              { x: 4, y: 1, label: "B'", tone: 'accent', labelPos: 'right' },
              { x: -1, y: 2, label: "C'", tone: 'accent', labelPos: 'left' },
            ],
            caption:
              "triangle $ABC$ retrouvé à partir de ses 3 milieux : le parallélogramme $A'B'AC'$ (teinté) traduit $A=B'+C'-A'$",
          },
        },
        { kind: 'subheading', text: "Point d'une bissectrice — théorème de la bissectrice" },
        {
          kind: 'intuition',
          label: "Ce que fait vraiment une bissectrice",
          text:
            "Un point sur la bissectrice d'un angle est à **égale distance** des deux côtés de " +
            'cet angle — imagine-toi pile au milieu entre deux murs qui se referment sur toi, à ' +
            "la même distance des deux. C'est cette égalité de distance, appliquée aux deux " +
            "côtés issus de $B$, qui fixe la position exacte du point $I$ sur $[AC]$.",
        },
        {
          kind: 'definition',
          items: [
            'La bissectrice issue de $B$ coupe le côté opposé $[AC]$ en un point $I$ tel que ' +
              '$\\dfrac{AI}{IC} = \\dfrac{AB}{BC}$ — jamais au milieu de $[AC]$, sauf si le triangle est isocèle en $B$ !',
            '$I = \\dfrac{BC \\times A + AB \\times C}{AB+BC}$',
          ],
        },
        {
          kind: 'exemple',
          badge: 'pied de la bissectrice',
          formula:
            'Dans le triangle $B(0\\,;0)$, $A(3\\,;4)$, $C(0\\,;4)$, la bissectrice issue de $B$ coupe $[AC]$ en $I$. ' +
            'Calcule les coordonnées de $I$.',
          steps: [
            { tag: 'longueurs', text: '$AB=\\sqrt{3^2+4^2}=5$, $BC=4$' },
            { tag: 'rapport', text: 'théorème de la bissectrice : $\\dfrac{AI}{IC}=\\dfrac{5}{4}$' },
            { tag: 'point I', text: '$I = \\dfrac{4\\times(3\\,;4)+5\\times(0\\,;4)}{4+5}$ $= \\dfrac{(12\\,;36)}{9}$' },
          ],
          result: { tag: 'I', text: '$I = \\left(\\dfrac{4}{3}\\,;4\\right)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.27, xMax: 4.2767, yMin: -0.6, yMax: 4.6,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 4 }, to: { x: 0, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 4 / 3, y: 4 }, tone: 'accent', arrow: false },
            ],
            angleArcs: [
              { cx: 0, cy: 0, fromDeg: 53.13, toDeg: 71.57, radiusPx: 30, tone: 'good' },
              { cx: 0, cy: 0, fromDeg: 71.57, toDeg: 90, radiusPx: 36, tone: 'good' },
            ],
            points: [
              { x: 0, y: 0, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 4, label: 'A', tone: 'ink', labelPos: 'right' },
              { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
              { x: 4 / 3, y: 4, label: 'I', tone: 'accent', labelPos: 'above' },
            ],
            caption: "triangle $ABC$ : la bissectrice issue de $B$ partage l'angle en deux angles égaux et coupe $[AC]$ en $I$, avec $\\dfrac{AI}{IC}=\\dfrac{AB}{BC}$",
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — théorème de la bissectrice : AI/IC = AB/BC',
          blocks: [
            {
              kind: 'para',
              text:
                'Les triangles $ABI$ et $CBI$ ont la même hauteur issue de $B$ (la distance de $B$ à la ' +
                'droite $(AC)$) : $\\dfrac{\\text{aire}(ABI)}{\\text{aire}(CBI)}=\\dfrac{AI}{IC}$ — **même hauteur, ' +
                'les aires sont dans le rapport des bases**.',
            },
            {
              kind: 'para',
              text:
                '$I$ est sur la bissectrice issue de $B$, donc à la même distance $\\delta$ des droites ' +
                '$(BA)$ et $(BC)$. En prenant $[AB]$ et $[BC]$ comme bases : $\\text{aire}(ABI)=\\dfrac{AB\\cdot\\delta}{2}$ ' +
                'et $\\text{aire}(CBI)=\\dfrac{BC\\cdot\\delta}{2}$ — **un point de la bissectrice est équidistant des ' +
                'deux côtés**.',
            },
            {
              kind: 'para',
              text:
                'Les deux expressions du même rapport donnent $\\dfrac{AI}{IC}=\\dfrac{AB}{BC}$. Comme $I$ est ' +
                'sur $[AC]$ : $I=A+\\dfrac{AB}{AB+BC}\\,(C-A)$ $=\\dfrac{BC\\times A+AB\\times C}{AB+BC}$.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — bissectrice ≠ médiane',
          text:
            'Prendre le milieu de $[AC]$ — soit $\\left(\\dfrac{3}{2}\\,;4\\right)$ — à la place de ' +
            '$I=\\left(\\dfrac{4}{3}\\,;4\\right)$, c\'est confondre la bissectrice avec la médiane ! Ces deux droites ' +
            'ne coïncident que si le triangle est isocèle en $B$ (ici $AB=5 \\neq 4=BC$, donc jamais).',
        },
        {
          kind: 'historique',
          titre: 'Des règles vieilles de 2300 ans',
          text:
            "La bissectrice d'un angle, le milieu et la perpendiculaire d'un segment, les cercles inscrit " +
            "et circonscrit d'un triangle : ces constructions ne datent pas de la géométrie analytique — " +
            "elles figurent déjà, démontrées à la règle et au compas, dans les Éléments d'**Euclide**, " +
            'rédigés vers 300 avant J.-C. à Alexandrie. Le centre de gravité, lui, vient d\'**Archimède** ' +
            '(De l\'équilibre des plans, IIIe siècle avant J.-C.), et la concourance des hauteurs est absente ' +
            "des Éléments. Euclide ne connaissait ni coordonnées ni équations : chaque propriété s'y " +
            "démontre par un raisonnement purement géométrique, à partir d'un petit nombre d'axiomes. Ce " +
            "que la géométrie analytique t'apporte, c'est un outil différent pour retrouver les mêmes " +
            'résultats — pas une nouvelle géométrie, mais une nouvelle façon, souvent bien plus rapide, ' +
            'de la calculer.',
          image: {
            src: '/images/historique/euclid.jpg',
            alt: "Détail de L'École d'Athènes représentant Euclide",
            caption:
              "Détail de L'École d'Athènes (1509–1511) de Raphaël, traditionnellement identifié " +
              "comme Euclide — l'identification exacte de cette figure reste débattue par les " +
              'historiens de l\'art.',
          },
        },
        { kind: 'subheading', text: 'Aire variable — un point qui parcourt une droite' },
        {
          kind: 'methode',
          items: [
            "Aire d'un triangle à partir de deux vecteurs : $\\text{aire}(ABC)=\\dfrac{1}{2}\\,|x_{AB}\\,y_{AC}-y_{AB}\\,x_{AC}|$ " +
              '(base $AB$ multipliée par la distance de $C$ à $(AB)$, divisée par 2).',
            'Si $C(t)=P_0+t\\,\\vec{u}$ parcourt une droite $d$, on obtient $\\text{aire}=\\dfrac{1}{2}|K+Mt|$, avec ' +
              '$K=x_{AB}\\,y_{AP_0}-y_{AB}\\,x_{AP_0}$ et $M=x_{AB}\\,y_{u}-y_{AB}\\,x_{u}$.',
            "Aire $=k$ ⟺ $|K+Mt|=2k$ ⟺ $K+Mt=2k$ **ou** $K+Mt=-2k$. Si $d$ n'est pas parallèle à $(AB)$ " +
              "($M\\neq0$) et $k>0$, il y a **deux** solutions, situées de part et d'autre de $(AB)$.",
          ],
        },
        {
          kind: 'exemple',
          badge: 'aire variable',
          formula:
            'On donne $A(1\\,;1)$ et $B(5\\,;1)$. Le point $C$ parcourt la droite $d \\equiv x=3$. Détermine les ' +
            'positions de $C$ pour lesquelles le triangle $ABC$ a une aire égale à $6$.',
          steps: [
            { tag: 'paramétrage', text: '$C(t)=(3\\,;1)+t\\,(0\\,;1)$ ; $\\overrightarrow{AB}=(4\\,;0)$, $\\overrightarrow{AP_0}=(2\\,;0)$, $\\vec{u}=(0\\,;1)$' },
            { tag: 'K et M', text: '$K=4\\times0-0\\times2=0$ et $M=4\\times1-0\\times0=4$, donc aire $=\\dfrac{1}{2}|4t|$' },
            { tag: 'équation', text: '$|4t|=12$ ⟺ $t=3$ ou $t=-3$' },
          ],
          result: {
            tag: 'deux positions',
            text: '$C_1(3\\,;4)$ et $C_2(3\\,;-2)$ ; contrôle : base $AB=4$, hauteur $3$, aire $=\\dfrac{4\\times3}{2}=6$ ✓',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.6, xMax: 7.6133, yMin: -2.9, yMax: 4.8,
            vectors: [
              { from: { x: 3, y: -2.9 }, to: { x: 3, y: 4.8 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 1, y: 1 }, to: { x: 5, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: 5, y: 1 }, to: { x: 3, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 4 }, to: { x: 1, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: 5, y: 1 }, to: { x: 3, y: -2 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: -2 }, to: { x: 1, y: 1 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 4, label: 'C₁', tone: 'ink', labelPos: 'right' },
              { x: 3, y: -2, label: 'C₂', tone: 'accent', labelPos: 'right' },
              { x: 3, y: 1, tone: 'good' },
              { x: 3.35, y: 1.5, label: 'I', tone: 'good', node: false, labelPos: 'right' },
            ],
            caption: 'deux positions $C_1$ et $C_2$ sur $d \\equiv x=3$ donnant chacune une aire de 6, symétriques par rapport au point $I(3\\,;1)$ où $d$ coupe $(AB)$',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — ne garder qu'une seule solution",
          text:
            'Répondre uniquement $C(3\\,;4)$ oublie que $C(3\\,;-2)$ convient tout autant ! Les deux solutions ' +
            '$t=\\dfrac{\\pm2k-K}{M}$ encadrent $t_0=-\\dfrac{K}{M}$, qui donne le point $I$ où $d$ coupe $(AB)$ ' +
            "(aire nulle) : elles sont **symétriques par rapport au point** $I$. Elles ne sont symétriques " +
            "par rapport à la droite $(AB)$ que si $d \\perp (AB)$, comme ici. Si $d$ est parallèle à $(AB)$, " +
            "l'aire est constante : tous les points de $d$ conviennent, ou aucun.",
        },
        {
          kind: 'atelier',
          tag: 'aire-variable-widget',
          label: 'Manipule toi-même : l’aire variable',
          caption:
            'A(1 ; 1) et B(5 ; 1) sont fixes, C glisse sur une droite d. En bas, l’aire du triangle ABC ' +
            'en fonction de t : un V, ½|K + Mt|. La droite « aire = k » coupe le V en deux points : deux ' +
            'positions C₁ et C₂, symétriques par rapport au point I où d coupe (AB). Elles ne sont ' +
            'symétriques par rapport à la droite (AB) que si d est perpendiculaire à (AB) : choisis « d ' +
            'oblique » pour le voir. Essaie aussi k = 0, une droite qui passe par A, et une parallèle à ' +
            '(AB).',
        },
        { kind: 'subheading', text: "Symétrique d'un point par rapport à une droite" },
        {
          kind: 'definition',
          items: [
            "Le symétrique $Q$ d'un point $P$ par rapport à une droite $d$ vérifie $Q=2H-P$, où " +
              '$H$ est le pied de la perpendiculaire abaissée de $P$ sur $d$ : $H$ est alors le ' +
              'milieu de $[PQ]$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'symétrique',
          formula: 'Détermine le symétrique $Q$ du point $P(1\\,;5)$ par rapport à la droite $(AB)$, avec $A(0\\,;0)$ et $B(2\\,;1)$.',
          steps: [
            { tag: 'équation de (AB)', text: 'directeur $(2\\,;1)$, normale $(-1\\,;2)$ : $-x+2y=0$' },
            { tag: 'perpendiculaire par P', text: 'normale $(2\\,;1)$ : $2(x-1)+(y-5)=0$, soit $2x+y-7=0$' },
            { tag: 'intersection', text: '$H=\\left(\\dfrac{14}{5}\\,;\\dfrac{7}{5}\\right)$' },
          ],
          result: { tag: 'Q', text: '$Q=2H-P=\\left(\\dfrac{23}{5}\\,;-\\dfrac{11}{5}\\right)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.6, xMax: 7.7867, yMin: -3, yMax: 5.8,
            vectors: [
              { from: { x: -1.6, y: -0.8 }, to: { x: 7.7, y: 3.85 }, tone: 'ink', arrow: false },
              { from: { x: 1, y: 5 }, to: { x: 4.6, y: -2.2 }, tone: 'faint', dashed: true, arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 2.8, y: 1.4 }, arm1: { x: 5, y: 2.5 }, arm2: { x: 1, y: 5 } }],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: 2, y: 1, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 1, y: 5, label: 'P', tone: 'accent', labelPos: 'right' },
              { x: 2.8, y: 1.4, label: 'H', tone: 'ink', labelPos: 'below' },
              { x: 4.6, y: -2.2, label: 'Q', tone: 'accent', labelPos: 'right' },
            ],
            caption:
              'symétrique $Q$ du point $P$ par rapport à la droite $(AB)$ : $H$, pied de la perpendiculaire, est le milieu de $[PQ]$',
          },
        },
        {
          kind: 'astuce',
          text:
            "Même si $A$, $B$, $P$ ont des coordonnées entières, $H$ a pour dénominateur $a^2+b^2$ (avec " +
            "$(a\\,;b)$ la normale de $(AB)$) — égal à 1 seulement dans des cas très particuliers. " +
            "Ne t'étonne jamais d'un résultat fractionnaire ici, et n'arrondis jamais avant la " +
            'fin du calcul !',
        },
        { kind: 'subheading', text: 'Trois constructions qui reviennent souvent' },
        {
          kind: 'methode',
          items: [
            '**Droites passant par** $P$ **et équidistantes de** $A$ **et de** $B$ : il y en a deux — la parallèle à ' +
              '$(AB)$ passant par $P$, et la droite qui passe par $P$ et par le milieu de $[AB]$. On oublie ' +
              'souvent la parallèle.',
            "**Carré** : la rotation de 90° envoie $\\vec{v}=(x\\,;y)$ sur $(-y\\,;x)$. Si $O$ est le centre et " +
              '$\\vec{v}=\\overrightarrow{OA}$, les sommets sont $O+\\vec{v}$, $O+\\text{rot}(\\vec{v})$, $O-\\vec{v}$, ' +
              '$O-\\text{rot}(\\vec{v})$ ; le centre est aussi le pied de la perpendiculaire menée d\'un sommet à ' +
              "la diagonale qui ne le contient pas.",
            '**Rayon réfléchi** par un miroir $d$ : le rayon issu de $P$ frappe $d$ en $M$ et repart comme s\'il ' +
              'venait du symétrique $P\'$ de $P$ par rapport à $d$. Le rayon réfléchi est donc porté par la ' +
              "droite $(P'M)$ (angle d'incidence = angle de réflexion).",
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5, xMax: 8.5, yMin: -4.2, yMax: 4.2375,
            showAxes: false,
            vectors: [
              { from: { x: -0.5, y: 0 }, to: { x: 8.5, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 1, y: 3 }, to: { x: 4, y: 0 }, tone: 'accent' },
              { from: { x: 4, y: 0 }, to: { x: 7, y: 3 }, tone: 'accent' },
              { from: { x: 1, y: -3 }, to: { x: 4, y: 0 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 1, y: 3 }, to: { x: 1, y: -3 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 4, y: 2.6 }, tone: 'faint', dashed: true, arrow: false },
            ],
            angleArcs: [
              { cx: 4, cy: 0, fromDeg: 90, toDeg: 135, radiusPx: 28, tone: 'good' },
              { cx: 4, cy: 0, fromDeg: 45, toDeg: 90, radiusPx: 28, tone: 'good' },
            ],
            points: [
              { x: 1, y: 3, label: 'P', tone: 'accent', labelPos: 'left' },
              { x: 1, y: -3, label: "P'", tone: 'ink', labelPos: 'left' },
              { x: 4, y: 0, label: 'M', tone: 'ink', labelPos: 'below' },
              { x: 8, y: 0.4, label: 'd', tone: 'ink', node: false, labelPos: 'above' },
            ],
            caption: "rayon issu de $P$, réfléchi en $M$ par le miroir $d$ : il repart dans le prolongement de $[P'M]$, $P'$ étant le symétrique de $P$",
          },
        },
        {
          kind: 'entrainement',
          title: 'Constructions analytiques dans le triangle',
          generatorId: '6gen54',
          description: ['Milieux, bissectrice, aire imposée, symétrique, carré et rayon réfléchi, par le calcul.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 54. Constructions analytiques dans le triangle »',
        },
        {
          kind: 'entrainement',
          title: "Points remarquables et droite d'Euler",
          generatorId: '6gen124',
          description: [
            "Calcule le centre de gravité, une médiatrice et une hauteur en forme implicite, le centre du cercle circonscrit et l'orthocentre d'un triangle, puis le centre du cercle des neuf points sur la droite d'Euler.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 124. Points remarquables et droite d'Euler »",
        },
      ],
    },

    {
      id: 'cercles',
      number: 2,
      title: 'Cercles',
      kicker: 'x² + y² + Dx + Ey + F = 0 ↔ centre (−D⁄2 ; −E⁄2) — 3 points, 2 points et un rayon, corde, inscrit, exinscrits, tangentes',
      titreCourt: "Cercles",
      partie: "Le triangle et le cercle en coordonnées",
      essentiel: [
        "$x^2+y^2+Dx+Ey+F=0$ : centre $\\left(-\\dfrac{D}{2}\\,;-\\dfrac{E}{2}\\right)$, rayon $\\sqrt{\\dfrac{D^2}{4}+\\dfrac{E^2}{4}-F}$ ; avec $m(x^2+y^2)$, on obtient un cercle, un point ou le vide.",
        "Cercle par 2 points et un rayon : deux centres si $2r>AB$, un si $2r=AB$, aucun si $2r<AB$ ; l'incentre vaut $\\dfrac{aA+bB+cC}{a+b+c}$.",
        "Tangentes depuis $P$ extérieur : droite $a(x-x_P)+b(y-y_P)=0$ et $\\mathrm{dist}(O\\,;d)=r$, verticale comprise ; $PT=\\sqrt{OP^2-r^2}$.",
      ],
      cartes: [
        { question: "$2x^2+2y^2-8x+4y+10=0$ est-elle l'équation d'un cercle ?", reponse: "Non : $(x-2)^2+(y+1)^2=0$, c'est le seul point $(2\\,;-1)$." },
        { question: "Combien de cercles de rayon 2 passent par $A(0\\,;0)$ et $B(6\\,;0)$ ?", reponse: "Aucun : $2r=4<6=AB$." },
        { question: "Une corde de longueur $L$ est à la distance $\\delta$ du centre. Que vaut le rayon ?", reponse: "$r^2=\\delta^2+\\left(\\dfrac{L}{2}\\right)^2$." },
        { question: "Combien de cercles sont tangents aux trois droites qui portent les côtés d'un triangle ?", reponse: "Quatre : le cercle inscrit et trois cercles exinscrits." },
      ],
      blocks: [
        { kind: 'video', title: 'Cercles : équation, 3 points, 2 points et rayon, inscrit, tangentes', youtubeId: 'jt_aOsw6y4k' },
        {
          kind: 'para',
          text:
            'Un cercle se manipule sous deux formes : la forme générale (utile quand le centre ' +
            "est encore inconnu) et la forme centre-rayon. Les grands classiques de cette section " +
            '— cercle par 3 points, par 2 points et un rayon, cercle qui découpe une corde donnée, ' +
            "cercles inscrit et exinscrits d'un triangle, tangentes depuis un point extérieur — s'y " +
            'ramènent tous.',
        },
        {
          kind: 'intuition',
          label: 'Le cercle, le lieu le plus simple qui soit',
          text:
            "Reprends l'image du parc : tout le monde qui se tient exactement à 5 mètres d'un " +
            "arbre dessine un cercle autour de lui. C'est le lieu géométrique le plus simple qui " +
            "existe — l'ensemble de tous les points à une distance fixe (le rayon) d'un point " +
            "fixe (le centre), comme une corde tendue autour d'un piquet planté au centre. Toute " +
            "cette section n'est que la version algébrique de cette même idée.",
        },
        {
          kind: 'definition',
          label: "Deux formes d'équation",
          items: [
            "Un cercle s'écrit soit sous forme **générale** $x^2+y^2+Dx+Ey+F=0$ (utile tant que " +
              'le centre est encore inconnu), soit sous forme **centre-rayon** $(x-x_0)^2+(y-y_0)^2=r^2$ ' +
              'une fois $D$, $E$, $F$ connus : centre $\\left(-\\dfrac{D}{2}\\,;-\\dfrac{E}{2}\\right)$, rayon ' +
              '$\\sqrt{\\dfrac{D^2}{4}+\\dfrac{E^2}{4}-F}$.',
            'Une équation $m(x^2+y^2)+Dx+Ey+F=0$ ($m\\neq0$) se divise d\'abord par $m$, puis on complète ' +
              'les carrés : $\\left(x+\\dfrac{D}{2m}\\right)^2+\\left(y+\\dfrac{E}{2m}\\right)^2=\\rho$ avec ' +
              '$\\rho=\\dfrac{D^2+E^2}{4m^2}-\\dfrac{F}{m}$. Si $\\rho>0$ : un **cercle** de rayon $\\sqrt{\\rho}$ ; si ' +
              '$\\rho=0$ : un seul **point** ; si $\\rho<0$ : l\'ensemble est **vide**.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cercle, point ou vide ?',
          formula: "Détermine la nature de l'ensemble des points $(x\\,;y)$ tels que $2x^2+2y^2-8x+4y+10=0$.",
          steps: [
            { tag: 'diviser par m = 2', text: '$x^2+y^2-4x+2y+5=0$' },
            { tag: 'compléter les carrés', text: '$(x-2)^2-4+(y+1)^2-1+5=0$, soit $(x-2)^2+(y+1)^2=0$' },
          ],
          result: {
            tag: 'nature',
            text:
              '$\\rho=0$ : l\'ensemble est le seul point $(2\\,;-1)$ — pas un cercle. Avec $+12$ au lieu de ' +
              '$+10$, on obtiendrait $(x-2)^2+(y+1)^2=-1$ : ensemble vide.',
          },
        },
        {
          kind: 'atelier',
          tag: 'cercle-equation-widget',
          label: 'Manipule toi-même : centre, rayon et équation',
          caption:
            'Rappel de 4e. Règle le centre et le rayon, et regarde la forme générale x² + y² + Dx + Ey + ' +
            'F = 0 se développer. Ou pars de D, E et F, et complète les carrés pour retrouver le centre ' +
            '(−D/2 ; −E/2) et le rayon : si D²/4 + E²/4 − F est négatif, ce n’est pas un cercle (aucun ' +
            'point) ; s’il est nul, un seul point.',
        },
        { kind: 'subheading', text: 'Cercle passant par 3 points' },
        {
          kind: 'methode',
          items: [
            'Substitue chaque point dans $x^2+y^2+Dx+Ey+F=0$ : tu obtiens un système **linéaire** ' +
              'de 3 équations en $(D\\,;E\\,;F)$ — le terme $x^2+y^2$ de chaque point est un nombre ' +
              'connu, à passer au second membre. Trois points non alignés déterminent toujours un ' +
              'unique cercle : son centre est le point de concours des médiatrices (§ 1).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cercle par 3 points',
          formula: 'Détermine le centre et le rayon du cercle qui passe par $A(5\\,;3)$, $B(-3\\,;-1)$ et $C(2\\,;-6)$.',
          steps: [
            { tag: 'système', text: '$5D+3E+F=-34$ ; $-3D-E+F=-10$ ; $2D-6E+F=-40$' },
            { tag: 'résolution', text: 'par soustractions successives : $D=-4$, $E=2$, $F=-20$' },
          ],
          result: { tag: 'centre et rayon', text: 'centre $(2\\,;-1)$, rayon $\\sqrt{4+1+20}=\\sqrt{25}=5$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4.5, xMax: 8.5, yMin: -7, yMax: 5.1875,
            circle: { cx: 2, cy: -1, r: 5, tone: 'accent' },
            points: [
              { x: 5, y: 3, label: 'A', tone: 'ink', labelPos: 'right' },
              { x: -3, y: -1, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 2, y: -6, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 2, y: -1, label: 'centre', tone: 'accent', labelPos: 'below' },
            ],
            caption:
              "cercle de centre $(2\\,;-1)$ et de rayon 5 passant par $A(5\\,;3)$, $B(-3\\,;-1)$ et $C(2\\,;-6)$ — trois points non alignés déterminent toujours un unique cercle",
          },
        },
        {
          kind: 'atelier',
          tag: 'triangle-deformable-widget',
          label: 'Manipule toi-même : le cercle par trois points',
          caption:
            'Rappel de 4e. Fais glisser les sommets : le cercle qui passe par les trois points (le cercle ' +
            'circonscrit au triangle) existe toujours tant que le triangle n’est pas aplati. Son diamètre ' +
            'vaut a / sin Â = b / sin B̂ = c / sin Ĉ (loi des sinus). Quand les trois points s’alignent ' +
            'presque, le cercle devient immense : trois points alignés n’ont pas de cercle.',
        },
        { kind: 'subheading', text: 'Cercle passant par 2 points, rayon donné' },
        {
          kind: 'intuition',
          label: 'Pourquoi le centre est-il sur la médiatrice ?',
          text:
            "La médiatrice de $[AB]$, c'est l'ensemble de tous les points à **égale distance** de " +
            "$A$ et de $B$ (§ 1). Le centre d'un cercle passant par $A$ et $B$ doit être à cette même " +
            'distance (le rayon) des deux points : il est donc forcément sur cette médiatrice.',
        },
        {
          kind: 'methode',
          items: [
            'Le centre est forcément sur la **médiatrice** de $[AB]$. Impose la distance $r$ ' +
              'depuis un point de cette médiatrice : tu obtiens une équation du second degré.',
            'Trois cas : **deux centres**, symétriques par rapport à $(AB)$, si $2r>AB$ ; **un seul** ' +
              '(le milieu de $[AB]$) si $2r=AB$ ; **aucun** si $2r<AB$.',
          ],
        },
        {
          kind: 'exemple',
          badge: '2 points, rayon donné',
          formula: 'Détermine les centres des cercles de rayon $5$ qui passent par $A(0\\,;0)$ et $B(6\\,;0)$.',
          steps: [
            { tag: 'comparer', text: '$2r=10>6=AB$ : deux centres' },
            { tag: 'médiatrice', text: '$x=3$' },
            { tag: 'équation', text: 'un centre $(3\\,;k)$ à distance 5 de $A$ vérifie $9+k^2=25$, donc $k=\\pm4$' },
          ],
          result: { tag: 'deux centres', text: '$(3\\,;4)$ et $(3\\,;-4)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -7, xMax: 13, yMin: -9.375, yMax: 9.375,
            circles: [
              { cx: 3, cy: 4, r: 5, tone: 'accent' },
              { cx: 3, cy: -4, r: 5, tone: 'good' },
            ],
            vectors: [{ from: { x: 3, y: -9.375 }, to: { x: 3, y: 9.375 }, tone: 'faint', dashed: true, arrow: false }],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 6, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 4, label: 'centre₁', tone: 'accent', labelPos: 'right' },
              { x: 3, y: -4, label: 'centre₂', tone: 'good', labelPos: 'right' },
            ],
            caption: '2 cercles de rayon 5 passant par $A$ et $B$, de centres $(3\\,;4)$ et $(3\\,;-4)$, symétriques par rapport à $(AB)$',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — n'en retenir qu'un seul",
          text:
            'Quand $2r>AB$, ne donner que le centre $(3\\,;4)$ oublie que $(3\\,;-4)$ répond tout aussi bien ' +
            'à la question ! Sauf précision supplémentaire dans l\'énoncé (ex. « au-dessus de $(AB)$ »), ' +
            'donne les deux solutions — et vérifie d\'abord, en comparant $2r$ à $AB$, combien il y en a.',
        },
        {
          kind: 'application',
          titre: 'Localiser un téléphone mobile entre deux antennes',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -3.5, xMax: 3.5, yMin: -1.5, yMax: 5.0625,
              vectors: [
                { from: { x: -2, y: 0 }, to: { x: 2, y: 0 }, tone: 'faint', arrow: false },
                { from: { x: 0, y: 3 }, to: { x: -2, y: 0 }, tone: 'accent', tick: true },
                { from: { x: 0, y: 3 }, to: { x: 2, y: 0 }, tone: 'accent', tick: true },
                { from: { x: 0, y: -1 }, to: { x: 0, y: 4.8 }, tone: 'good', dashed: true, arrow: false },
              ],
              points: [
                { x: -2, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
                { x: 2, y: 0, label: 'B', tone: 'ink', labelPos: 'below' },
                { x: 0, y: 3, label: 'P', tone: 'good', labelPos: 'right' },
              ],
              caption:
                "Deux antennes A et B captent le signal avec le même retard : le " +
                "téléphone P est à égale distance de A et de B, donc forcément quelque " +
                "part sur la médiatrice de [AB] (en pointillés) — sans savoir encore où " +
                "exactement sur cette droite.",
            },
            {
              kind: 'vectorPlane',
              xMin: -3.75, xMax: 3.75, yMin: -2.5, yMax: 4.53125,
              circle: { cx: 0, cy: 0.875, r: 3.125, tone: 'faint' },
              vectors: [
                { from: { x: 0, y: -2 }, to: { x: 0, y: 4 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: -2, y: -0.625 }, to: { x: 3.5, y: 3.5 }, tone: 'faint', dashed: true, arrow: false },
              ],
              points: [
                { x: -3, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
                { x: 3, y: 0, label: 'B', tone: 'ink', labelPos: 'below' },
                { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
                { x: 0, y: 0.875, label: 'téléphone', tone: 'good', labelPos: 'left' },
              ],
              caption:
                "Une troisième antenne C ajoute une troisième médiatrice : son " +
                "intersection avec la première isole un point UNIQUE — toutes les " +
                "antennes sont à égale distance de ce point (même cercle en fond).",
            },
          ],
          text:
            'Quand un technicien doit localiser un défaut sur une ligne (électrique, ' +
            'téléphonique, fibre optique) à partir de deux points de mesure A et B équidistants ' +
            'du défaut, il sait immédiatement que ce défaut se trouve quelque part sur la ' +
            'médiatrice de [AB] — exactement le raisonnement que tu viens de faire pour trouver ' +
            'le centre d\'un cercle. En téléphonie mobile, le même principe sert à localiser un ' +
            "téléphone : si deux antennes relais reçoivent son signal avec un retard identique, " +
            "l'appareil se trouve forcément sur la médiatrice qui sépare les deux antennes. " +
            "Ajouter une troisième antenne, avec une troisième médiatrice, suffit alors à isoler " +
            'un point unique — la position du téléphone.',
          domaines: ['Télécommunications', 'Ingénierie'],
          image: {
            src: '/images/application/cell-tower.jpg',
            alt: 'Antenne relais de téléphonie mobile',
            caption: 'Antenne relais de téléphonie mobile. Photo : Superbmust, CC BY-SA 3.0, via Wikimedia Commons.',
          },
        },
        { kind: 'subheading', text: 'Trois autres façons de fixer un cercle' },
        {
          kind: 'methode',
          items: [
            '**Deux points et une droite qui porte le centre** : le centre est à l\'intersection de la ' +
              'médiatrice de $[AB]$ et de la droite donnée (un seul point si elles ne sont pas parallèles).',
            '**Tangent à l\'axe des abscisses en** $(b\\,;0)$ **et passant par** $A$ : le centre est sur la ' +
              "perpendiculaire à l'axe en ce point, donc $(b\\,;r)$ si $y_A>0$ ; la condition $\\Omega A=r$ donne " +
              '$(b-x_A)^2+(r-y_A)^2=r^2$, où $r^2$ disparaît : $r=\\dfrac{(b-x_A)^2+y_A^2}{2y_A}$. Même idée ' +
              "pour l'axe des ordonnées, en échangeant les rôles de $x$ et de $y$.",
            '**Corde de longueur** $L$ **sur une droite** $d$ : la perpendiculaire menée du centre $\\Omega$ à $d$ ' +
              'coupe la corde en son milieu, donc (Pythagore) $r^2=\\delta^2+\\left(\\dfrac{L}{2}\\right)^2$ avec ' +
              '$\\delta=\\mathrm{dist}(\\Omega\\,;d)$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'tangent à un axe',
          formula: "Détermine le cercle tangent à l'axe des abscisses au point $(3\\,;0)$ et qui passe par $A(1\\,;2)$.",
          steps: [
            { tag: 'centre', text: 'le centre est sur la droite $x=3$, au-dessus de l\'axe : $\\Omega(3\\,;r)$' },
            { tag: 'condition', text: '$\\Omega A^2=r^2$ : $(3-1)^2+(r-2)^2=r^2$, soit $8-4r=0$' },
          ],
          result: { tag: 'cercle', text: '$r=2$, centre $(3\\,;2)$ : $(x-3)^2+(y-2)^2=4$' },
        },
        {
          kind: 'exemple',
          badge: 'corde de longueur donnée',
          formula:
            'Le cercle de centre $\\Omega(1\\,;2)$ découpe sur la droite $d \\equiv 3x-4y+15=0$ une corde de ' +
            'longueur $8$. Détermine son équation.',
          steps: [
            { tag: 'distance au centre', text: '$\\delta=\\dfrac{|3\\times1-4\\times2+15|}{\\sqrt{9+16}}=\\dfrac{10}{5}=2$' },
            { tag: 'Pythagore', text: '$r^2=\\delta^2+\\left(\\dfrac{L}{2}\\right)^2=4+16=20$' },
          ],
          result: { tag: 'cercle', text: '$(x-1)^2+(y-2)^2=20$ — rayon $2\\sqrt{5}$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4.6, xMax: 6.6, yMin: -3.2, yMax: 7.3,
            circle: { cx: 1, cy: 2, r: Math.sqrt(20), tone: 'accent' },
            vectors: [
              { from: { x: -4.6, y: 0.3 }, to: { x: 4.7333, y: 7.3 }, tone: 'ink', arrow: false },
              { from: { x: -3.4, y: 1.2 }, to: { x: 3, y: 6 }, tone: 'good', arrow: false },
              { from: { x: 1, y: 2 }, to: { x: -0.2, y: 3.6 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 1, y: 2 }, to: { x: 3, y: 6 }, tone: 'faint', dashed: true, arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: -0.2, y: 3.6 }, arm1: { x: 3, y: 6 }, arm2: { x: 1, y: 2 } }],
            points: [
              { x: 1, y: 2, label: 'Ω', tone: 'accent', labelPos: 'below' },
              { x: -0.2, y: 3.6, label: 'M', tone: 'ink', labelPos: 'above' },
              { x: -3.4, y: 1.2, tone: 'good' },
              { x: 3, y: 6, tone: 'good' },
              { x: 5.4, y: 6.3, label: 'd', tone: 'ink', node: false, labelPos: 'right' },
            ],
            caption: 'corde de longueur 8 (en vert) : $\\Omega M=\\delta=2$, $M$ milieu de la corde, et $r^2=2^2+4^2=20$',
          },
        },
        { kind: 'subheading', text: 'Cercle inscrit et cercles exinscrits' },
        {
          kind: 'definition',
          items: [
            'Avec $a=BC$, $b=CA$, $c=AB$ (les côtés **opposés** à chaque sommet), le centre du ' +
              "cercle inscrit (l'incentre) est le point de concours des bissectrices : " +
              'incentre $=\\dfrac{aA+bB+cC}{a+b+c}$, rayon $=\\dfrac{\\text{aire}}{\\text{demi-périmètre}}$.',
            'Trois droites qui forment un triangle ont **quatre** cercles tangents : le cercle inscrit et ' +
              'trois cercles **exinscrits**, chacun tangent à un côté et aux prolongements des deux autres. ' +
              "Le centre de l'exinscrit opposé à $A$ est $J_A=\\dfrac{-aA+bB+cC}{-a+b+c}$ (bissectrice intérieure " +
              'en $A$, extérieures en $B$ et $C$), et son rayon vaut $\\dfrac{\\text{aire}}{p-a}$, avec $p$ le ' +
              'demi-périmètre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cercle inscrit',
          formula: 'Détermine le centre et le rayon du cercle inscrit au triangle rectangle $A(0\\,;0)$, $B(3\\,;0)$, $C(0\\,;4)$.',
          steps: [
            { tag: 'côtés opposés', text: '$a=BC=5$, $b=CA=4$, $c=AB=3$' },
            { tag: 'incentre', text: '$\\dfrac{5\\times(0\\,;0)+4\\times(3\\,;0)+3\\times(0\\,;4)}{12}$ $= \\dfrac{(12\\,;12)}{12}$ $=(1\\,;1)$' },
          ],
          result: {
            tag: 'rayon',
            text:
              'aire $=6$, demi-périmètre $=6$, donc rayon $=1$ ; l\'exinscrit opposé à $A$ a pour centre ' +
              '$\\dfrac{(12\\,;12)}{2}=(6\\,;6)$ et pour rayon $\\dfrac{6}{6-5}=6$',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2, xMax: 5, yMin: -1.2, yMax: 5.3625,
            circle: { cx: 1, cy: 1, r: 1, tone: 'accent' },
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 0, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
              { x: 1, y: 1, label: 'I', tone: 'accent', labelPos: 'below' },
            ],
            caption: 'cercle inscrit au triangle rectangle 3-4-5 : centre $I(1\\,;1)$, rayon 1',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — l’incentre (aA + bB + cC)/(a + b + c) est équidistant des trois côtés',
          blocks: [
            {
              kind: 'para',
              text:
                'La bissectrice issue de $A$ coupe $[BC]$ en $I_A$ tel que $\\dfrac{BI_A}{I_AC}=\\dfrac{AB}{AC}=\\dfrac{c}{b}$, ' +
                'donc $I_A=\\dfrac{bB+cC}{b+c}$ — **théorème de la bissectrice (§ 1)**.',
            },
            {
              kind: 'para',
              text:
                'Le point $I=\\dfrac{aA+bB+cC}{a+b+c}$ s\'écrit $I=\\dfrac{a\\,A+(b+c)\\,I_A}{a+(b+c)}$ : c\'est une ' +
                'moyenne pondérée de $A$ et de $I_A$, à coefficients positifs, donc un point du segment $[AI_A]$ ' +
                '— **le point est donc sur la bissectrice issue de** $A$.',
            },
            {
              kind: 'para',
              text:
                "L'expression de $I$ est la même quand on échange les rôles des sommets (et des côtés opposés) : " +
                '$I$ est aussi sur les bissectrices issues de $B$ et de $C$.',
            },
            {
              kind: 'para',
              text:
                'Sur la bissectrice issue de $A$, $I$ est équidistant de $(AB)$ et de $(AC)$ ; sur celle issue de ' +
                "$B$, de $(BA)$ et de $(BC)$. Il est donc à la même distance $r$ des trois côtés : c'est le centre " +
                'du cercle inscrit, de rayon $r$.',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — incentre ≠ centre de gravité',
          text:
            '$\\dfrac{A+B+C}{3}=\\left(1\\,;\\dfrac{4}{3}\\right)$, c\'est le **centre de gravité** — pas l\'incentre ! ' +
            "L'incentre pondère chaque sommet par le côté opposé ($a$, $b$, $c$) : une moyenne pondérée, " +
            'jamais une moyenne simple. Les deux points ne coïncident que pour un triangle équilatéral.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2, xMax: 5, yMin: -1.2, yMax: 5.3625,
            circle: { cx: 1, cy: 1, r: 1, tone: 'faint' },
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 0, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
              { x: 1, y: 1, label: 'I', tone: 'accent', labelPos: 'below' },
              { x: 1, y: 4 / 3, label: 'G', tone: 'good', labelPos: 'above' },
            ],
            caption:
              "l'incentre $I(1\\,;1)$ (moyenne pondérée par les côtés opposés) et le centre de gravité $G\\left(1\\,;\\dfrac{4}{3}\\right)$ (moyenne simple) sont deux points distincts",
          },
        },
        { kind: 'subheading', text: 'Droite et cercle : position relative, tangente en un point' },
        {
          kind: 'methode',
          items: [
            'Pour un cercle de centre $\\Omega$ et de rayon $r$ et une droite $d$, compare $\\delta=\\mathrm{dist}(\\Omega\\,;d)$ ' +
              'à $r$ : $\\delta>r$ → aucun point commun ; $\\delta=r$ → un seul (la droite est **tangente**) ; ' +
              '$\\delta<r$ → deux points (droite **sécante**).',
            'La **tangente** en un point $T$ du cercle est perpendiculaire au rayon $[\\Omega T]$ : elle a pour ' +
              'normale $\\overrightarrow{\\Omega T}$, donc pour équation $(x_T-x_\\Omega)(x-x_T)$ $+(y_T-y_\\Omega)(y-y_T)=0$.',
          ],
        },
        { kind: 'subheading', text: "Tangentes à un cercle depuis un point extérieur" },
        {
          kind: 'methode',
          items: [
            'Pour un cercle de centre $O$ et de rayon $r$, et un point $P$ : **aucune** tangente si $P$ est ' +
              "intérieur ($OP<r$), **une** si $P$ est sur le cercle, **exactement deux** si $P$ est extérieur ($OP>r$).",
            'Méthode : écris une droite générique par $P$ sous la forme $a(x-x_P)+b(y-y_P)=0$, puis ' +
              'impose $\\mathrm{dist}(O\\,;d)=r$. Cette condition donne une équation du second degré en $a$ et $b$ ' +
              '(homogène) : ses deux solutions, à un facteur près, sont les deux tangentes.',
            "Pas de $y=mx+p$ : cette écriture oublie la droite verticale $x=x_P$, qui peut être l'une des " +
              'deux tangentes. Le cas $b=0$ est examiné à part dans la forme implicite.',
          ],
        },
        {
          kind: 'astuce',
          text:
            'Par Pythagore dans le triangle $OTP$ rectangle en $T$ ($T$ = point de contact) : ' +
            '$PT=\\sqrt{OP^2-r^2}$, la même longueur pour les deux tangentes. Utile pour vérifier un résultat, ' +
            'ou pour répondre directement si seule la longueur est demandée.',
        },
        {
          kind: 'exemple',
          badge: 'tangentes depuis un point',
          formula:
            "Détermine les équations des tangentes au cercle $x^2+y^2=25$ menées par $P(0\\,;13)$, leurs points de " +
            'contact et la longueur $PT$.',
          steps: [
            { tag: 'position de P', text: 'centre $O(0\\,;0)$, $r=5$, $OP=13>5$ : $P$ est extérieur, deux tangentes' },
            { tag: 'droite par P', text: '$ax+b(y-13)=0$ ; $\\mathrm{dist}(O\\,;d)=\\dfrac{|-13b|}{\\sqrt{a^2+b^2}}=5$' },
            { tag: 'équation en a, b', text: '$169b^2=25a^2+25b^2$, soit $144b^2=25a^2$ : $a=\\pm\\dfrac{12}{5}\\,b$ (et $b=0$ impossible)' },
          ],
          result: {
            tag: 'tangentes',
            text:
              '$12x+5y-65=0$ et $12x-5y+65=0$ ; points de contact $T_1\\left(-\\dfrac{60}{13}\\,;\\dfrac{25}{13}\\right)$ et $T_2\\left(\\dfrac{60}{13}\\,;\\dfrac{25}{13}\\right)$ ' +
              "(pieds des perpendiculaires menées de $O$) ; $PT=\\sqrt{13^2-5^2}=12$",
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -10.56, xMax: 10.56, yMin: -5.6, yMax: 14.2,
            circle: { cx: 0, cy: 0, r: 5, tone: 'faint' },
            vectors: [
              { from: { x: 0, y: 13 }, to: { x: -75 / 13, y: -11 / 13 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 13 }, to: { x: 75 / 13, y: -11 / 13 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: -60 / 13, y: 25 / 13 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 60 / 13, y: 25 / 13 }, tone: 'faint', dashed: true, arrow: false },
            ],
            rightAngleMarkers: [
              { vertex: { x: -60 / 13, y: 25 / 13 }, arm1: { x: 0, y: 0 }, arm2: { x: 0, y: 13 } },
              { vertex: { x: 60 / 13, y: 25 / 13 }, arm1: { x: 0, y: 0 }, arm2: { x: 0, y: 13 } },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 0, y: 13, label: 'P', tone: 'accent', labelPos: 'left' },
              { x: -60 / 13, y: 25 / 13, label: 'T₁', tone: 'ink', labelPos: 'left' },
              { x: 60 / 13, y: 25 / 13, label: 'T₂', tone: 'ink', labelPos: 'right' },
            ],
            caption:
              'depuis $P(0\\,;13)$, deux tangentes au cercle de centre $O$ et de rayon 5, perpendiculaires aux rayons $[OT_1]$ et $[OT_2]$ — $PT_1=PT_2=12$',
          },
        },
        {
          kind: 'exemple',
          badge: 'une tangente verticale',
          formula: 'Détermine les tangentes au cercle $x^2+y^2=25$ menées par $P(5\\,;3)$.',
          steps: [
            { tag: 'position de P', text: '$OP=\\sqrt{34}>5$ : deux tangentes' },
            { tag: 'condition', text: '$\\dfrac{|-5a-3b|}{\\sqrt{a^2+b^2}}=5$ ⟺ $(5a+3b)^2=25(a^2+b^2)$ ⟺ $b(30a-16b)=0$' },
            { tag: 'deux cas', text: '$b=0$ : la droite verticale $x=5$ ; $15a=8b$ : $8(x-5)+15(y-3)=0$' },
          ],
          result: {
            tag: 'tangentes',
            text: '$x=5$ et $8x+15y-85=0$ ; $PT=\\sqrt{34-25}=3$ — avec $y=mx+p$, on aurait perdu $x=5$',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 9.5, yMin: -6.5, yMax: 8.5,
            circle: { cx: 0, cy: 0, r: 5, tone: 'faint' },
            vectors: [
              { from: { x: 5, y: -6.5 }, to: { x: 5, y: 8.5 }, tone: 'accent', arrow: false },
              { from: { x: -5.3125, y: 8.5 }, to: { x: 9.5, y: 0.6 }, tone: 'good', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 5, y: 3, label: 'P', tone: 'ink', labelPos: 'right' },
              { x: 5, y: 0, label: 'T₁', tone: 'accent', labelPos: 'right' },
              { x: 40 / 17, y: 75 / 17, label: 'T₂', tone: 'good', labelPos: 'below' },
            ],
            caption: 'depuis $P(5\\,;3)$ : la tangente verticale $x=5$ (orange) et $8x+15y-85=0$ (vert)',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — longueur d’une tangente : PT = √(OP² − r²)',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $T$ un point de contact d\'une tangente menée par $P$. La tangente en $T$ est perpendiculaire ' +
                'au rayon $[OT]$ — **propriété de la tangente** : le triangle $OTP$ est rectangle en $T$.',
            },
            {
              kind: 'para',
              text:
                'Pythagore : $OP^2=OT^2+PT^2=r^2+PT^2$, donc $PT^2=OP^2-r^2$ et $PT=\\sqrt{OP^2-r^2}$ ' +
                '(positif, car $P$ est extérieur : $OP>r$).',
            },
            {
              kind: 'para',
              text:
                'Ce calcul ne dépend que de $OP$ et de $r$ : les deux tangentes menées par $P$ ont la même ' +
                'longueur, $PT_1=PT_2$.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'droite-cercle-widget',
          label: 'Manipule toi-même : droite et cercle',
          caption:
            'Rappel de 4e. La droite est écrite ici y = mx + p (ou x = k si elle est verticale), comme ' +
            'dans l’exemple des tangentes ci-dessus. En remplaçant y dans l’équation du cercle, on ' +
            'obtient une équation du second degré : Δ < 0, aucun point commun ; Δ = 0, la droite est ' +
            'tangente ; Δ > 0, deux points. Cherche les valeurs de p qui rendent la droite tangente.',
        },
        {
          kind: 'entrainement',
          title: 'Cercles',
          generatorId: '6gen55',
          description: [
            'Construis un cercle par 3 points, par 2 points et un rayon donné, le cercle inscrit à ' +
              'un triangle, ou les tangentes depuis un point extérieur.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 55. Cercles »',
        },
        {
          kind: 'entrainement',
          title: 'Reconnaître droites, points et cercles remarquables',
          generatorId: '6gen125',
          description: [
            'Sur une figure codée, nomme la droite, le point ou le cercle remarquable tracé, puis la propriété qui le caractérise (point de concours, distances égales, centre).',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 125. Reconnaître droites, points et cercles remarquables »',
        },
        {
          kind: 'entrainement',
          title: 'Tangentes et position relative droite–cercle',
          generatorId: '6gen126',
          description: [
            "Droite sécante, tangente ou extérieure à un cercle (distance au centre), tangente en un point du cercle, tangentes issues d'un point extérieur — la verticale comprise — et longueur PT.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 126. Tangentes et position relative droite–cercle »',
        },
      ],
    },

    {
      id: 'methode-generale-demonstration',
      number: 3,
      title: 'Démontrer une propriété par la géométrie analytique',
      kicker: 'méthode générale en 4 étapes — repère adapté, paramètres génériques, traduire, développer',
      titreCourt: "Démontrer en coordonnées",
      partie: "Démontrer et traduire",
      essentiel: [
        "Démontrer par la géométrie analytique : repère adapté, paramètres génériques (des lettres), traduire la propriété en une égalité, développer les deux membres.",
        "Un repère est adapté s'il ne perd pas la généralité : pour un triangle quelconque, $B(a\\,;0)$ et $C(a\\,;c)$ imposent un angle droit — à éviter.",
      ],
      cartes: [
        { question: "Pourquoi un exemple numérique ne démontre-t-il rien ?", reponse: "Il ne vérifie la propriété que pour une figure ; des lettres couvrent tous les cas." },
        { question: "Quel repère choisir pour un parallélogramme $ABCD$ ?", reponse: "$A(0\\,;0)$, $B(2a\\,;0)$, $D(2b\\,;2c)$, puis $C=B+D-A$." },
        { question: "$P$ et $Q$ sont les milieux de $[AB]$ et de $[BC]$. Que vaut $\\overrightarrow{PQ}$ ?", reponse: "$\\dfrac{1}{2}\\overrightarrow{AC}$ — d'où le parallélogramme de Varignon." },
      ],
      blocks: [
        { kind: 'video', title: 'Démontrer par la géométrie analytique (la vidéo traite aussi le début des lieux)', youtubeId: 'zBLg2ppOiN4' },
        {
          kind: 'para',
          text:
            "Au § 1, tu as déjà démontré par le calcul que les hauteurs d'un triangle sont concourantes et " +
            "que $O$, $G$, $H$ sont alignés. Cette section dégage la méthode commune à toutes ces " +
            'démonstrations, et l\'applique à quatre propriétés classiques du parallélogramme, du ' +
            'quadrilatère, du triangle rectangle et du cercle.',
        },
        {
          kind: 'methode',
          label: 'Méthode en 4 étapes',
          items: [
            "Choisis un repère **adapté** à la figure — souvent un sommet à l'origine et un côté " +
              'sur un axe, pour simplifier les calculs sans perdre en généralité.',
            'Traduis les données en coordonnées avec des **paramètres génériques** (des lettres, ' +
              "jamais des nombres fixés). Une propriété prouvée pour des lettres vaut pour tous " +
              "les cas particuliers — un exemple numérique, lui, n'en prouve qu'un seul !",
            'Traduis la propriété à démontrer en une égalité entre deux expressions calculées à ' +
              'partir de ces paramètres (égalité de milieux, de longueurs au carré, produit scalaire nul…).',
            'Développe les deux membres et vérifie qu\'ils coïncident, quels que soient les ' +
              'paramètres.',
          ],
        },
        {
          kind: 'definition',
          label: 'Un repère qui ne perd pas la généralité',
          items: [
            'Un repère est **adapté** quand toute figure du type étudié peut y être placée par une ' +
              'translation et une rotation : on ne restreint alors aucun cas. Repères classiques (lettres ' +
              'quelconques, non nulles quand il le faut) :',
            '**triangle quelconque** : $A(0\\,;0)$, $B(b\\,;0)$, $C(c\\,;d)$ — ou, pour les hauteurs, le pied de ' +
              "la hauteur issue de $C$ à l'origine : $A(a\\,;0)$, $B(b\\,;0)$, $C(0\\,;c)$ ; **triangle rectangle " +
              'en** $A$ : $A(0\\,;0)$, $B(b\\,;0)$, $C(0\\,;c)$ ; **triangle isocèle en** $A$ : $A(0\\,;a)$, ' +
              '$B(-b\\,;0)$, $C(b\\,;0)$.',
            '**parallélogramme** : $A(0\\,;0)$, $B(2a\\,;0)$, $D(2b\\,;2c)$, $C=B+D-A$ ; **rectangle** : ' +
              '$A(0\\,;0)$, $B(a\\,;0)$, $D(0\\,;b)$ ; **cercle** : centre à l\'origine, et deux points ' +
              'diamétralement opposés en $(\\pm r\\,;0)$.',
            'Le facteur 2 dans les coordonnées évite les fractions dans les milieux.',
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — un repère trop particulier',
          text:
            'Pour un triangle quelconque, poser $B(a\\,;0)$ et $C(a\\,;c)$ impose $(BC) \\perp (AB)$ : le ' +
            "triangle est alors rectangle en $B$, et la « démonstration » ne vaut que pour ce cas. De même, " +
            'prendre $C(c\\,;c)$ impose un angle de 45°. Avant de calculer, demande-toi : **n\'importe quel ' +
            'triangle** peut-il être placé ainsi ?',
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — les diagonales d'un parallélogramme se coupent en leur milieu",
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : $A(0\\,;0)$, $B(2a\\,;0)$, $D(2b\\,;2c)$, avec $a$, $b$, $c$ **quelconques** ($a\\neq0$, ' +
                '$c\\neq0$ ; le facteur 2 évite toute fraction dans les milieux). Comme $ABCD$ est un ' +
                'parallélogramme, $\\overrightarrow{DC}=\\overrightarrow{AB}$, donc $C=B+D-A=(2a+2b\\,;2c)$.',
            },
            {
              kind: 'para',
              text: 'milieu de $[AC]$ : $(a+b\\,;c)$ ; milieu de $[BD]$ : $(a+b\\,;c)$.',
            },
            {
              kind: 'para',
              text:
                'Les deux milieux sont **identiques**, pour tous $a$, $b$, $c$ ! Les diagonales $[AC]$ ' +
                'et $[BD]$ se coupent donc toujours en leur milieu commun, quel que soit le ' +
                'parallélogramme choisi.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1, xMax: 7, yMin: -2.25, yMax: 5.25,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 6, y: 3 }, tone: 'ink', arrow: false },
              { from: { x: 6, y: 3 }, to: { x: 2, y: 3 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: 3 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 3 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 2, y: 3 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 4, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 6, y: 3, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 2, y: 3, label: 'D', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 1.5, label: 'M', tone: 'accent', labelPos: 'below' },
            ],
            caption:
              "parallélogramme $ABCD$ ($a=2$, $b=1$, $c=1{,}5$ pour l'illustration) : les diagonales $[AC]$ et $[BD]$ se coupent en leur milieu commun $M(3\\,;1{,}5)$",
          },
        },
        {
          kind: 'astuce',
          text:
            'Traiter cet exemple avec des coordonnées numériques fixées (ex. $B(4\\,;0)$, $D(2\\,;3)$) ne ' +
            'prouverait la propriété que pour ce parallélogramme précis. Garder $a$, $b$, $c$ ' +
            'génériques, c\'est exactement ce qui transforme un exemple en démonstration.',
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — les milieux des côtés d'un quadrilatère forment un parallélogramme (Varignon)",
          blocks: [
            {
              kind: 'para',
              text:
                'Ici, aucun repère particulier n\'est nécessaire : $A$, $B$, $C$, $D$ ont des coordonnées ' +
                'quelconques. Les milieux des côtés sont $P=\\dfrac{A+B}{2}$, $Q=\\dfrac{B+C}{2}$, $R=\\dfrac{C+D}{2}$ ' +
                'et $S=\\dfrac{D+A}{2}$ — **coordonnées d\'un milieu**.',
            },
            {
              kind: 'para',
              text:
                '$\\overrightarrow{PQ}=Q-P=\\dfrac{C-A}{2}$ et $\\overrightarrow{SR}=R-S=\\dfrac{C-A}{2}$ : ' +
                '$\\overrightarrow{PQ}=\\overrightarrow{SR}=\\dfrac{1}{2}\\overrightarrow{AC}$.',
            },
            {
              kind: 'para',
              text:
                'Deux côtés opposés de $PQRS$ sont représentés par le même vecteur : $PQRS$ est un ' +
                'parallélogramme (dès que $P$, $Q$, $R$ ne sont pas alignés), et ses côtés sont parallèles ' +
                'aux diagonales du quadrilatère, de longueur moitié.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.8, xMax: 8.8, yMin: -1.2, yMax: 7.8,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 7, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: 7, y: 1 }, to: { x: 8, y: 6 }, tone: 'ink', arrow: false },
              { from: { x: 8, y: 6 }, to: { x: 2, y: 5 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: 5 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 3.5, y: 0.5 }, to: { x: 7.5, y: 3.5 }, tone: 'accent', arrow: false },
              { from: { x: 7.5, y: 3.5 }, to: { x: 5, y: 5.5 }, tone: 'accent', arrow: false },
              { from: { x: 5, y: 5.5 }, to: { x: 1, y: 2.5 }, tone: 'accent', arrow: false },
              { from: { x: 1, y: 2.5 }, to: { x: 3.5, y: 0.5 }, tone: 'accent', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 8, y: 6 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 7, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 8, y: 6, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 2, y: 5, label: 'D', tone: 'ink', labelPos: 'left' },
              { x: 3.5, y: 0.5, label: 'P', tone: 'accent', labelPos: 'below' },
              { x: 7.5, y: 3.5, label: 'Q', tone: 'accent', labelPos: 'right' },
              { x: 5, y: 5.5, label: 'R', tone: 'accent', labelPos: 'above' },
              { x: 1, y: 2.5, label: 'S', tone: 'accent', labelPos: 'left' },
            ],
            caption: 'quadrilatère $ABCD$ quelconque : les milieux $P$, $Q$, $R$, $S$ de ses côtés forment un parallélogramme dont les côtés $[PQ]$ et $[SR]$ sont parallèles à la diagonale $[AC]$ (pointillés)',
          },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — dans un triangle rectangle, la médiane issue de l'angle droit vaut la moitié de l'hypoténuse",
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : le triangle est rectangle en $A$ ; $A(0\\,;0)$, $B(2b\\,;0)$, $C(0\\,;2c)$ avec ' +
                '$b\\neq0$ et $c\\neq0$ — tout triangle rectangle peut être placé ainsi (les deux côtés de ' +
                "l'angle droit sur les axes).",
            },
            {
              kind: 'para',
              text:
                'Le milieu de l\'hypoténuse $[BC]$ est $M(b\\,;c)$. Alors $AM=\\sqrt{b^2+c^2}$ et ' +
                '$BC=\\sqrt{(2b)^2+(2c)^2}=2\\sqrt{b^2+c^2}$ — **distance entre deux points**.',
            },
            {
              kind: 'para',
              text:
                'Donc $AM=\\dfrac{BC}{2}$, pour tous $b$ et $c$. Conséquence : $MA=MB=MC$, le milieu de ' +
                "l'hypoténuse est le centre du cercle circonscrit (§ 1).",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — un angle inscrit dans un demi-cercle est droit (Thalès)',
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : centre du cercle à l\'origine, rayon $r$, diamètre $[AB]$ sur l\'axe des ' +
                'abscisses : $A(-r\\,;0)$, $B(r\\,;0)$. Soit $P(x\\,;y)$ un point du cercle, distinct de $A$ et de ' +
                '$B$ : $x^2+y^2=r^2$.',
            },
            {
              kind: 'para',
              text:
                '$\\overrightarrow{PA}=(-r-x\\,;-y)$ et $\\overrightarrow{PB}=(r-x\\,;-y)$, donc ' +
                '$\\overrightarrow{PA}\\cdot\\overrightarrow{PB}$ $=(-r-x)(r-x)+y^2$ $=x^2-r^2+y^2$ — **produit scalaire ' +
                'en composantes**.',
            },
            {
              kind: 'para',
              text:
                'Comme $x^2+y^2=r^2$, ce produit scalaire est nul : $(PA) \\perp (PB)$, l\'angle $\\widehat{APB}$ ' +
                'est droit. La réciproque — et le sort de $A$ et de $B$ — est traitée au § 4, comme un lieu.',
            },
          ],
        },
        {
          kind: 'historique',
          titre: 'La révolution qui a transformé la géométrie en calcul',
          text:
            'La méthode que tu viens d\'appliquer — choisir un repère, nommer les points avec ' +
            "des lettres, puis calculer — n'a rien d'évident. Elle naît presque en même temps chez deux " +
            'Français : **Pierre de Fermat**, qui écrit vers 1636 son Introduction aux lieux plans et ' +
            'solides (diffusée en manuscrit, publiée après sa mort), et **René Descartes**, qui publie en ' +
            '1637 La Géométrie, où il décrit une figure par des coordonnées et transforme un problème ' +
            'géométrique en un problème algébrique. Les Grecs repéraient déjà certains points par deux ' +
            'longueurs — Apollonius de Perga le fait pour les coniques — mais sans jamais en faire une ' +
            'méthode de calcul générale. Le terme « coordonnées cartésiennes » vient du nom latinisé de ' +
            'Descartes, Cartesius.',
          image: {
            src: '/images/historique/descartes.jpg',
            alt: 'Portrait de René Descartes',
            caption: "René Descartes (1596–1650), portrait d'après Frans Hals, vers 1649.",
          },
        },
        {
          kind: 'entrainement',
          title: 'Démontrer par la géométrie analytique',
          generatorId: '6gen123',
          description: [
            "Choisis un repère qui ne perd pas la généralité, calcule les coordonnées en lettres, puis établis l'égalité qui prouve la propriété : diagonales du parallélogramme, médianes, Varignon, médiane du triangle rectangle, losange.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 123. Démontrer par la géométrie analytique »',
        },
      ],
    },

    {
      id: 'lieux-elimination',
      number: 4,
      title: 'Lieux par traduction directe',
      kicker: 'traduire une condition en (x ; y), sans paramètre à éliminer — natures, seuils, points exclus',
      titreCourt: "Lieux directs",
      partie: "Démontrer et traduire",
      essentiel: [
        "Démontrer un lieu, c'est prouver les deux inclusions (réciproque comprise) et exclure les points où la condition n'a pas de sens.",
        "$PA^2+PB^2=k$ : seuil $\\dfrac{AB^2}{2}$, cercle, point ou vide ; $PA^2-PB^2=k$ : une droite perpendiculaire à $(AB)$ ; $PA^2=k\\cdot PB^2$ : médiatrice si $k=1$, cercle sinon.",
        "$|x-p|+|y-q|=k$ est un losange, $|x-p|-|y-q|=k$ quatre demi-droites ; les points équidistants de deux droites sécantes forment deux droites perpendiculaires.",
      ],
      cartes: [
        { question: "Lieu des points $P$ tels que $\\widehat{APB}$ est droit ?", reponse: "Le cercle de diamètre $[AB]$, privé de $A$ et de $B$." },
        { question: "Sommets du losange $|x-2|+|y+1|=3$ ?", reponse: "$(5\\,;-1)$, $(-1\\,;-1)$, $(2\\,;2)$ et $(2\\,;-4)$." },
        { question: "$A(2\\,;-2)$, $B(-4\\,;4)$ : seuil du lieu $PA^2+PB^2=k$ ?", reponse: "$\\dfrac{AB^2}{2}=\\dfrac{72}{2}=36$." },
        { question: "Carré $[-2\\,;2]^2$ : lieu « somme des distances aux côtés $=8$ » ?", reponse: "$8=4c$ : tout le carré plein, bords compris." },
      ],
      blocks: [
        { kind: 'video', title: 'Lieux (1/2) : natures et valeurs absolues (suite de la vidéo précédente)', youtubeId: 'zBLg2ppOiN4' },
        { kind: 'video', title: "Lieux (2/2) : théorème de la médiane, cercle d'Apollonius, somme de distances, bande", youtubeId: '0t9CTcdP-Sg' },
        {
          kind: 'para',
          text:
            'Un lieu géométrique se décrit en traduisant une condition en une équation (ou une ' +
            "inéquation). Cette section couvre les lieux qui se traduisent directement en $(x\\,;y)$, sans " +
            "aucun paramètre à éliminer. La méthode des génératrices (deux droites mobiles) fait l'objet " +
            'de la section suivante, et les représentations paramétriques de la dernière.',
        },
        {
          kind: 'intuition',
          label: 'Un lieu géométrique, en une image',
          text:
            "Reprends encore l'image du parc : un lieu géométrique, c'est l'ensemble de **tous** " +
            'les points qui obéissent à une même règle — comme tout le monde qui se tient à ' +
            'exactement 5 mètres d\'un arbre — et **seulement** ceux-là. Traduire un lieu en ' +
            'équation, c\'est écrire cette règle avec $x$ et $y$ au lieu de mots.',
        },
        {
          kind: 'definition',
          label: "Les natures les plus fréquentes d'un lieu",
          items: [
            "L'ensemble des points qui vérifient une condition géométrique donnée s'appelle un **lieu**. " +
              'Dans ce chapitre, les natures les plus fréquentes sont : le vide ; un point ; une droite ; deux ' +
              'droites (sécantes ou parallèles) ; des demi-droites ou un segment ; un cercle, éventuellement ' +
              'privé de quelques points ; une bande (la région entre deux parallèles, bords compris) ; un ' +
              'polygone plein (carré) ou un contour de polygone (losange, octogone).',
            "Ce n'est pas une liste fermée : une astroïde (§ 6), une parabole, une ellipse ou une hyperbole " +
              '(chapitre 10) sont aussi des lieux. Identifier la nature demande souvent de distinguer des cas ' +
              'qui se ressemblent beaucoup en apparence — un seuil, une somme ou une différence.',
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode de traduction — sans paramètre',
          items: [
            "Tous les lieux de cette section s'obtiennent par **traduction directe** : la " +
              "condition de l'énoncé (une distance, une somme, un rapport, un angle droit) s'écrit " +
              'immédiatement en $(x\\,;y)$, sans aucun paramètre à éliminer. C\'est différent des lieux de la ' +
              'section suivante (méthode des **génératrices**, où deux droites mobiles dépendent d\'un ' +
              'paramètre commun $\\alpha$ à éliminer) et de ceux donnés par une **représentation ' +
              'paramétrique** (§ 6, où $x$ et $y$ dépendent séparément d\'un même paramètre).',
          ],
        },
        {
          kind: 'methode',
          label: "Démontrer qu'un ensemble est exactement le lieu cherché",
          items: [
            'Dire « le lieu des points vérifiant la condition est l\'ensemble $E$ », c\'est démontrer **deux** ' +
              'choses : tout point qui vérifie la condition est dans $E$ ; **et** tout point de $E$ vérifie la ' +
              'condition (la **réciproque**).',
            'En coordonnées, une chaîne d\'**équivalences** (⟺) fait les deux d\'un coup — c\'est ce qu\'on a fait ' +
              'pour la médiatrice au § 1. Attention aux étapes qui ne sont pas des équivalences : élever au carré ' +
              'une égalité dont les membres peuvent être de signes différents, diviser par une expression qui ' +
              's\'annule, ou parler d\'un angle, d\'une droite, d\'un triangle qui n\'existe pas pour certains points.',
            "Ces points-là sont à **exclure** : le lieu est alors une **partie** de la courbe trouvée (un cercle " +
              'privé de points, un segment ouvert, une demi-droite…). Conclure toujours par la description ' +
              'exacte : la courbe, et ce qu\'on en retire.',
          ],
        },
        {
          kind: 'application',
          titre: 'Comment un GPS calcule ta position',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -7.1, xMax: 7.1, yMin: -4.5, yMax: 8.8125,
              circles: [
                { cx: -2, cy: 0, r: 4, tone: 'faint' },
                { cx: 2, cy: 0, r: 4, tone: 'faint' },
                { cx: 0, cy: 6, r: 2.536, tone: 'accent' },
              ],
              points: [
                { x: -2, y: 0, label: 'satellite 1', tone: 'ink', labelPos: 'left' },
                { x: 2, y: 0, label: 'satellite 2', tone: 'ink', labelPos: 'right' },
                { x: 0, y: 6, label: 'satellite 3', tone: 'ink', labelPos: 'above' },
                { x: 0, y: 3.464, label: 'TA position', tone: 'good', labelPos: 'right' },
                { x: 0, y: -3.464, label: 'écarté', tone: 'bad', labelPos: 'below' },
              ],
              caption:
                "Avec 2 satellites, les 2 cercles de distance connue se coupent en 2 " +
                "points (ambigu). Un 3e cercle (orange) ne passe QUE par l'un des deux — " +
                "il élimine l'ambiguïté et fixe ta position de façon unique.",
            },
          ],
          text:
            'Un récepteur GPS applique, en trois dimensions, exactement le principe de cette ' +
            'section : traduire une condition de distance en équation. Chaque satellite envoie ' +
            'un signal daté ; le récepteur mesure le temps de trajet et en déduit sa distance ' +
            'à ce satellite — ce qui place le récepteur quelque part sur une SPHÈRE ' +
            "centrée sur ce satellite (l'équivalent en 3D du cercle que tu traces en 2D). Avec " +
            'UN satellite, le lieu possible est toute une sphère ; avec DEUX, c\'est ' +
            "l'intersection de deux sphères (un cercle) ; avec TROIS, deux points seulement " +
            'restent possibles, dont l\'un est en général loin de la Terre. Mais l\'horloge du récepteur ' +
            "n'est pas parfaite : un QUATRIÈME satellite sert surtout à corriger cette erreur d'horloge, " +
            'la quatrième inconnue du problème. Le GPS ne « sait » jamais directement où tu es : il ' +
            "calcule, comme toi, l'intersection de plusieurs lieux géométriques.",
          domaines: ['Navigation', 'Technologie'],
          image: {
            src: '/images/application/gps-satellite.jpg',
            alt: "Vue d'artiste d'un satellite GPS en orbite",
            caption: "Vue d'artiste d'un satellite GPS Block II-F en orbite. NASA, domaine public.",
          },
        },
        { kind: 'subheading', text: 'Valeur absolue — somme ou différence, deux natures opposées' },
        {
          kind: 'methode',
          items: [
            'Pour $p=2$, $q=-1$, $k=3$ : $|x-p|+|y-q|=k$ (**somme**) donne un **losange** borné. ' +
              'Ses sommets s\'obtiennent en annulant tour à tour une seule valeur absolue — ' +
              '$(p\\pm k\\,;q)$ et $(p\\,;q\\pm k)$ — jamais les 4 combinaisons de signes $(p\\pm k\\,;q\\pm k)$, ' +
              "qui donneraient les sommets d'un carré ne vérifiant même pas l'équation !",
            '$|x-p|-|y-q|=k$ (**différence**) donne au contraire un lieu **non borné** : 4 demi-droites, ' +
              'issues de $(p+k\\,;q)$ et de $(p-k\\,;q)$.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -3, xMax: 7, yMin: -5.6875, yMax: 3.6875,
              vectors: [
                { from: { x: 5, y: -1 }, to: { x: 2, y: 2 }, tone: 'ink', arrow: false },
                { from: { x: 2, y: 2 }, to: { x: -1, y: -1 }, tone: 'ink', arrow: false },
                { from: { x: -1, y: -1 }, to: { x: 2, y: -4 }, tone: 'ink', arrow: false },
                { from: { x: 2, y: -4 }, to: { x: 5, y: -1 }, tone: 'ink', arrow: false },
              ],
              points: [
                { x: 2, y: -1, label: '(2;−1)', tone: 'accent', labelPos: 'below' },
                { x: 5, y: -1, label: '(5;−1)', tone: 'ink', labelPos: 'right' },
                { x: 2, y: 2, label: '(2;2)', tone: 'ink', labelPos: 'right' },
                { x: -1, y: -1, label: '(−1;−1)', tone: 'ink', labelPos: 'below' },
                { x: 2, y: -4, label: '(2;−4)', tone: 'ink', labelPos: 'right' },
              ],
              caption: 'losange $|x-2|+|y+1|=3$ : sommets $(5\\,;-1)$, $(2\\,;2)$, $(-1\\,;-1)$, $(2\\,;-4)$',
            },
            {
              kind: 'vectorPlane',
              xMin: -6, xMax: 11, yMin: -8.5, yMax: 7.4375,
              vectors: [
                { from: { x: 5, y: -1 }, to: { x: 11, y: 5 }, tone: 'ink', arrow: false },
                { from: { x: 5, y: -1 }, to: { x: 11, y: -7 }, tone: 'ink', arrow: false },
                { from: { x: -1, y: -1 }, to: { x: -6, y: 4 }, tone: 'accent', arrow: false },
                { from: { x: -1, y: -1 }, to: { x: -6, y: -6 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 5, y: -1, label: '(5;−1)', tone: 'ink', labelPos: 'right' },
                { x: -1, y: -1, label: '(−1;−1)', tone: 'accent', labelPos: 'right' },
              ],
              caption: 'lieu non borné $|x-2|-|y+1|=3$ : 4 demi-droites issues de $(5\\,;-1)$ et de $(-1\\,;-1)$',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — sommets du losange',
          text:
            "Répondre $(5\\,;2)$, $(5\\,;-4)$, $(-1\\,;2)$, $(-1\\,;-4)$ (les 4 combinaisons $p\\pm k$, " +
            "$q\\pm k$) est faux ! Ces 4 points sont les sommets d'un **carré**, qui ne vérifie " +
            "pas l'équation. Un seul terme s'annule à la fois : les vrais sommets sont $(p+k\\,;q)$, " +
            '$(p-k\\,;q)$, $(p\\,;q+k)$, $(p\\,;q-k)$.',
        },
        { kind: 'subheading', text: 'Somme de carrés de distances — le théorème de la médiane' },
        {
          kind: 'definition',
          items: [
            'Pour $M$ milieu de $[AB]$ et tout point $P$ : $PA^2+PB^2 = 2\\,PM^2 + \\dfrac{AB^2}{2}$ (théorème de la ' +
              'médiane). Le lieu $PA^2+PB^2=k$ a donc un seuil, $\\dfrac{AB^2}{2}$, avec trois régimes : ' +
              '$k>$ seuil → cercle centré en $M$, de rayon $\\sqrt{\\dfrac{k-\\text{seuil}}{2}}$ ; $k=$ seuil → le ' +
              'point $M$ seul ; $k<$ seuil → lieu vide.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'somme de carrés : PA² + PB² = 54',
          formula: 'On donne $A(2\\,;-2)$ et $B(-4\\,;4)$. Détermine le lieu des points $P$ tels que $PA^2+PB^2=54$.',
          steps: [
            { tag: 'seuil', text: '$AB^2=(-6)^2+6^2=72$, seuil $=\\dfrac{72}{2}=36$' },
            { tag: 'milieu', text: '$M(-1\\,;1)$ ; $54>36$ : un cercle centré en $M$' },
          ],
          result: { tag: 'cercle', text: 'centre $M(-1\\,;1)$, rayon $\\sqrt{\\dfrac{54-36}{2}}=3$ : $(x+1)^2+(y-1)^2=9$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6, xMax: 4, yMin: -3.6875, yMax: 5.6875,
            circle: { cx: -1, cy: 1, r: 3, tone: 'accent' },
            vectors: [{ from: { x: 2, y: -2 }, to: { x: -4, y: 4 }, tone: 'faint', dashed: true, arrow: false }],
            points: [
              { x: 2, y: -2, label: 'A', tone: 'ink', labelPos: 'right' },
              { x: -4, y: 4, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: -1, y: 1, label: 'M', tone: 'accent', labelPos: 'right' },
            ],
            caption: '$PA^2+PB^2=54>36=$ seuil : cercle de centre $M(-1\\,;1)$ et de rayon 3',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — théorème de la médiane : PA² + PB² = 2 PM² + AB²/2',
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : origine au milieu $M$ de $[AB]$, axe des abscisses sur $(AB)$ : $A(-a\\,;0)$, ' +
                '$B(a\\,;0)$ avec $a>0$, donc $AB=2a$. Soit $P(x\\,;y)$ quelconque.',
            },
            {
              kind: 'para',
              text:
                '$PA^2+PB^2$ $=(x+a)^2+y^2+(x-a)^2+y^2$ $=2x^2+2y^2+2a^2$ — **les doubles produits s\'annulent**.',
            },
            {
              kind: 'para',
              text:
                'Or $PM^2=x^2+y^2$ et $\\dfrac{AB^2}{2}=\\dfrac{4a^2}{2}=2a^2$ : donc $PA^2+PB^2=2\\,PM^2+\\dfrac{AB^2}{2}$. ' +
                'Comme $PM^2\\geq0$, la somme vaut au moins $\\dfrac{AB^2}{2}$, et ne l\'atteint qu\'en $P=M$ : c\'est ' +
                "l'origine du seuil.",
            },
          ],
        },
        {
          kind: 'astuce',
          text:
            'Au seuil exact, le lieu n\'est pas un « tout petit cercle » mais **exactement** le ' +
            'point $M$, rayon nul. Et strictement en dessous du seuil, le lieu est réellement ' +
            '**vide** — aucune tolérance ! Une simple distance $PA=k$ a aussi trois régimes (cercle, point ' +
            '$A$, vide) ; la différence est la position du seuil : $\\dfrac{AB^2}{2}$ au lieu de 0.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -6, xMax: 4, yMin: -3.6875, yMax: 5.6875,
              circle: { cx: -1, cy: 1, r: 3, tone: 'accent' },
              points: [
                { x: 2, y: -2, label: 'A', tone: 'ink', labelPos: 'right' },
                { x: -4, y: 4, label: 'B', tone: 'ink', labelPos: 'left' },
                { x: -1, y: 1, label: 'M', tone: 'accent', labelPos: 'right' },
              ],
              caption: '$k=54>36$ : cercle de centre $M$, de rayon 3',
            },
            {
              kind: 'vectorPlane',
              xMin: -6, xMax: 4, yMin: -3.6875, yMax: 5.6875,
              points: [
                { x: 2, y: -2, label: 'A', tone: 'ink', labelPos: 'right' },
                { x: -4, y: 4, label: 'B', tone: 'ink', labelPos: 'left' },
                { x: -1, y: 1, label: 'M (seul)', tone: 'accent', labelPos: 'right' },
              ],
              caption: '$k=36=$ seuil : le lieu est exactement le point $M$',
            },
            {
              kind: 'vectorPlane',
              xMin: -6, xMax: 4, yMin: -3.6875, yMax: 5.6875,
              points: [
                { x: 2, y: -2, label: 'A', tone: 'ink', labelPos: 'right' },
                { x: -4, y: 4, label: 'B', tone: 'ink', labelPos: 'left' },
                { x: -1, y: 1.6, label: '∅ (vide)', tone: 'bad', node: false, labelPos: 'right' },
              ],
              caption: '$k=20<36$ : le lieu est vide, aucun point ne convient',
            },
          ],
        },
        { kind: 'subheading', text: 'Différence de carrés de distances — une droite' },
        {
          kind: 'definition',
          items: [
            'Le lieu des points $P$ tels que $PA^2-PB^2=k$ est, pour tout réel $k$, une **droite ' +
              'perpendiculaire** à $(AB)$ — sans aucun seuil. Pour $k=0$, c\'est la médiatrice de $[AB]$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le lieu PA² − PB² = k est une droite perpendiculaire à (AB)',
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : $A(-a\\,;0)$, $B(a\\,;0)$ avec $a>0$ (origine au milieu de $[AB]$). Pour $P(x\\,;y)$ : ' +
                '$PA^2-PB^2$ $=(x+a)^2+y^2-(x-a)^2-y^2$ $=4ax$ — **les carrés s\'éliminent**.',
            },
            {
              kind: 'para',
              text:
                '$PA^2-PB^2=k$ ⟺ $4ax=k$ ⟺ $x=\\dfrac{k}{4a}$ : une droite parallèle à l\'axe des ordonnées, donc ' +
                'perpendiculaire à $(AB)$. Chaque étape est une équivalence : tous les points de cette droite, et ' +
                'eux seuls, conviennent.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'différence de carrés',
          formula: 'On donne $A(-2\\,;0)$ et $B(4\\,;0)$. Détermine le lieu des points $P$ tels que $PA^2-PB^2=12$.',
          steps: [
            { tag: 'traduction', text: '$(x+2)^2+y^2-(x-4)^2-y^2=12$' },
            { tag: 'réduction', text: '$(4x+4)-(-8x+16)=12$, soit $12x-12=12$' },
          ],
          result: { tag: 'droite', text: '$x=2$ : la droite perpendiculaire à $(AB)$ passant par $(2\\,;0)$' },
        },
        { kind: 'subheading', text: "Cercle d'Apollonius" },
        {
          kind: 'definition',
          items: [
            'Pour $A(-a\\,;0)$, $B(a\\,;0)$ et $k>0$, le lieu $PA^2=k\\cdot PB^2$ est : si $k=1$, la ' +
              '**médiatrice** de $[AB]$ — un traitement à part, jamais une simple limite ' +
              'numérique de la formule générale ; si $k \\neq 1$, un **cercle** centré sur l\'axe $(AB)$, de centre ' +
              '$\\left(\\dfrac{a(k+1)}{k-1}\\,;0\\right)$ et de rayon $\\dfrac{2a\\sqrt{k}}{|k-1|}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Apollonius : PA² = 4 PB²',
          formula: 'On donne $A(-3\\,;0)$ et $B(3\\,;0)$. Détermine le lieu des points $P$ tels que $PA^2=4\\,PB^2$.',
          steps: [
            { tag: 'traduction', text: '$(x+3)^2+y^2=4\\left[(x-3)^2+y^2\\right]$' },
            { tag: 'développer', text: '$x^2+6x+9+y^2$ $=4x^2-24x+36+4y^2$, soit $3x^2-30x+3y^2+27=0$' },
            { tag: 'diviser par 3', text: '$x^2-10x+y^2+9=0$, soit $(x-5)^2+y^2=16$' },
          ],
          result: {
            tag: 'cercle',
            text: 'centre $(5\\,;0)$, rayon $4$ ; contrôle : $\\dfrac{3\\times5}{3}=5$ et $\\dfrac{2\\times3\\times2}{3}=4$ ✓',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -5, xMax: 11, yMin: -7.5, yMax: 7.5,
            circle: { cx: 5, cy: 0, r: 4, tone: 'accent' },
            vectors: [{ from: { x: 0, y: -7.5 }, to: { x: 0, y: 7.5 }, tone: 'good', dashed: true, arrow: false }],
            points: [
              { x: -3, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 0, label: 'B', tone: 'ink', labelPos: 'below' },
              { x: 5, y: 0, label: 'centre', tone: 'accent', labelPos: 'below' },
              { x: 0, y: -6.6, label: 'médiatrice (k=1)', tone: 'good', node: false, labelPos: 'right' },
            ],
            caption: "cercle d'Apollonius pour $k=4$ (centre $(5\\,;0)$, rayon 4) et médiatrice pour $k=1$ ($x=0$, en pointillé)",
          },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — le cercle d'Apollonius : centre et rayon",
          blocks: [
            {
              kind: 'para',
              text:
                '$PA^2=k\\,PB^2$ ⟺ $(x+a)^2+y^2=k\\left[(x-a)^2+y^2\\right]$ ⟺ ' +
                '$(1-k)x^2+(1-k)y^2$ $+2a(1+k)x+a^2(1-k)=0$ — **développer et tout passer dans le premier membre**.',
            },
            {
              kind: 'para',
              text:
                'Si $k=1$ : il reste $4ax=0$, soit $x=0$ — la médiatrice de $[AB]$. Si $k\\neq1$, on divise par ' +
                '$1-k\\neq0$ : $x^2+y^2+\\dfrac{2a(1+k)}{1-k}\\,x+a^2=0$.',
            },
            {
              kind: 'para',
              text:
                'C\'est la forme générale d\'un cercle, avec $D=\\dfrac{2a(1+k)}{1-k}$, $E=0$, $F=a^2$ : centre ' +
                '$x_0=-\\dfrac{D}{2}=\\dfrac{a(k+1)}{k-1}$, et $r^2=x_0^2-a^2$ $=a^2\\,\\dfrac{(k+1)^2-(k-1)^2}{(k-1)^2}$ $=\\dfrac{4a^2k}{(k-1)^2}$.',
            },
            {
              kind: 'para',
              text: '$r^2>0$, donc c\'est bien un cercle, de rayon $r=\\dfrac{2a\\sqrt{k}}{|k-1|}$, centré sur $(AB)$.',
            },
          ],
        },
        {
          kind: 'historique',
          titre: 'Le cercle qui porte un nom depuis 2200 ans',
          text:
            'Le « cercle d\'Apollonius » que tu viens de retrouver porte le nom du ' +
            'mathématicien grec **Apollonius de Perga** (environ 262–190 avant J.-C.), surnommé ' +
            '« le Grand Géomètre » par ses contemporains. Son traité Coniques (tu le retrouveras ' +
            'au chapitre suivant) reste l\'un des sommets des mathématiques grecques — mais il a ' +
            'aussi écrit un ouvrage aujourd\'hui perdu, Lieux plans, entièrement consacré à ce ' +
            'type de problème : retrouver quelle courbe trace un point soumis à une condition de ' +
            'distance. Le texte original a disparu, mais son contenu nous est connu grâce à ' +
            'Pappus d\'Alexandrie, qui en a résumé les résultats plusieurs siècles plus tard — ' +
            'c\'est ainsi que le nom d\'Apollonius est resté attaché à ce cercle précis, plus de ' +
            'deux millénaires après sa découverte.',
        },
        { kind: 'subheading', text: 'Points équidistants de deux droites — les bissectrices' },
        {
          kind: 'definition',
          items: [
            "Le lieu des points équidistants de deux droites **sécantes** $d_1 \\equiv a_1x+b_1y+c_1=0$ et " +
              '$d_2 \\equiv a_2x+b_2y+c_2=0$ est formé de **deux droites perpendiculaires**, les bissectrices des ' +
              'angles qu\'elles forment : $\\dfrac{a_1x+b_1y+c_1}{\\sqrt{a_1^2+b_1^2}}=\\pm\\dfrac{a_2x+b_2y+c_2}{\\sqrt{a_2^2+b_2^2}}$.',
            'Pour deux droites **parallèles**, le lieu est une seule droite, parallèle aux deux et à mi-chemin.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'bissectrices de deux droites',
          formula: "Détermine le lieu des points équidistants des droites $d_1 \\equiv y=0$ et $d_2 \\equiv 3x-4y=0$.",
          steps: [
            { tag: 'distances', text: '$\\mathrm{dist}(P\\,;d_1)=|y|$ et $\\mathrm{dist}(P\\,;d_2)=\\dfrac{|3x-4y|}{5}$' },
            { tag: 'équation', text: '$5y=\\pm(3x-4y)$ : $3x-9y=0$ ou $3x+y=0$' },
          ],
          result: { tag: 'deux droites', text: '$x-3y=0$ et $3x+y=0$ ; normales $(1\\,;-3)$ et $(3\\,;1)$ : $3-3=0$, perpendiculaires ✓' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4, xMax: 4, yMin: -3.75, yMax: 3.75,
            showAxes: false,
            vectors: [
              { from: { x: -4, y: 0 }, to: { x: 4, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: -4, y: -3 }, to: { x: 4, y: 3 }, tone: 'ink', arrow: false },
              { from: { x: -4, y: -4 / 3 }, to: { x: 4, y: 4 / 3 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: -1.25, y: 3.75 }, to: { x: 1.25, y: -3.75 }, tone: 'accent', dashed: true, arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 3, y: 1 }, arm2: { x: -1, y: 3 } }],
            points: [
              { x: 3.6, y: 0, label: 'd₁', tone: 'ink', node: false, labelPos: 'below' },
              { x: 3.3, y: 2.475, label: 'd₂', tone: 'ink', node: false, labelPos: 'left' },
            ],
            caption: "les deux bissectrices (pointillés) de $d_1 \\equiv y=0$ et $d_2 \\equiv 3x-4y=0$ : $x-3y=0$ et $3x+y=0$, perpendiculaires",
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les points équidistants de deux droites sécantes forment deux droites perpendiculaires',
          blocks: [
            {
              kind: 'para',
              text:
                'Notons $n_1=\\sqrt{a_1^2+b_1^2}$, $n_2=\\sqrt{a_2^2+b_2^2}$. $P$ est équidistant de $d_1$ et $d_2$ ⟺ ' +
                '$\\dfrac{|a_1x+b_1y+c_1|}{n_1}=\\dfrac{|a_2x+b_2y+c_2|}{n_2}$ — **distance d\'un point à une droite (§ 1)**.',
            },
            {
              kind: 'para',
              text:
                '$|u|=|v|$ ⟺ $u=v$ ou $u=-v$ : le lieu est la réunion des ensembles ' +
                '$\\left(\\dfrac{a_1}{n_1}\\mp\\dfrac{a_2}{n_2}\\right)x+\\left(\\dfrac{b_1}{n_1}\\mp\\dfrac{b_2}{n_2}\\right)y+\\ldots=0$.',
            },
            {
              kind: 'para',
              text:
                "Ce sont deux droites : leurs normales $\\dfrac{\\vec{n}_1}{n_1}\\mp\\dfrac{\\vec{n}_2}{n_2}$ ne sont pas " +
                'nulles, car les normales $\\vec{n}_1=(a_1\\,;b_1)$ et $\\vec{n}_2=(a_2\\,;b_2)$ ne sont pas parallèles ' +
                '(droites sécantes).',
            },
            {
              kind: 'para',
              text:
                'Produit scalaire de ces deux normales : $\\dfrac{\\|\\vec{n}_1\\|^2}{n_1^2}-\\dfrac{\\|\\vec{n}_2\\|^2}{n_2^2}=1-1=0$ : ' +
                'les deux droites sont **perpendiculaires**.',
            },
          ],
        },
        { kind: 'subheading', text: "Un lieu avec des points exclus — l'angle droit" },
        {
          kind: 'exempleLibre',
          label: "Démonstration — l'ensemble des points P tels que l'angle APB est droit est le cercle de diamètre [AB], privé de A et de B",
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : origine au milieu de $[AB]$, $A(-r\\,;0)$, $B(r\\,;0)$. L\'angle $\\widehat{APB}$ n\'a de ' +
                'sens que si $P\\neq A$ et $P\\neq B$ : ces deux points sont **exclus d\'office**.',
            },
            {
              kind: 'para',
              text:
                'Pour $P(x\\,;y)$ distinct de $A$ et de $B$ : $\\widehat{APB}$ droit ⟺ ' +
                '$\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=0$ ⟺ $(-r-x)(r-x)+y^2=0$ ⟺ $x^2+y^2=r^2$ — **chaîne ' +
                "d'équivalences**.",
            },
            {
              kind: 'para',
              text:
                "L'équation $x^2+y^2=r^2$ est celle du cercle de diamètre $[AB]$. $A$ et $B$ vérifient l'équation, " +
                'mais pas la condition : le lieu est le cercle de diamètre $[AB]$ **privé de** $A$ **et de** $B$. ' +
                'Le § 3 démontrait le sens direct (Thalès) ; ici, les équivalences donnent aussi la réciproque.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4.8, xMax: 4.8, yMin: -4.5, yMax: 4.5,
            circle: { cx: 0, cy: 0, r: 3, tone: 'accent' },
            vectors: [
              { from: { x: 1.8, y: 2.4 }, to: { x: -3, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 1.8, y: 2.4 }, to: { x: 3, y: 0 }, tone: 'ink', arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 1.8, y: 2.4 }, arm1: { x: -3, y: 0 }, arm2: { x: 3, y: 0 } }],
            points: [
              { x: -3, y: 0, label: 'A', tone: 'bad', labelPos: 'left', open: true },
              { x: 3, y: 0, label: 'B', tone: 'bad', labelPos: 'right', open: true },
              { x: 1.8, y: 2.4, label: 'P', tone: 'ink', labelPos: 'above' },
            ],
            caption: "lieu des points $P$ tels que $\\widehat{APB}$ est droit : le cercle de diamètre $[AB]$, privé de $A$ et de $B$ (points creux)",
          },
        },
        { kind: 'subheading', text: 'Somme de distances simples — un seuil différent' },
        {
          kind: 'attention',
          label: 'Piège classique — 4c au lieu de 4c²',
          text:
            'Pour le carré $[-c\\,;c]^2$ : la somme des **carrés** des distances aux 4 droites qui portent ' +
            'ses côtés vaut $2x^2+2y^2+4c^2$ — un cercle centré à l\'origine, de seuil $4c^2$ (comme le ' +
            'théorème de la médiane ci-dessus). La somme des distances **simples** (non élevées au carré) a ' +
            'pour seuil $4c$ — ne confonds jamais ces deux formules qui se ressemblent !',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3, xMax: 3, yMin: -2.8125, yMax: 2.8125,
            vectors: [
              { from: { x: -2, y: -2 }, to: { x: 2, y: -2 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: -2 }, to: { x: 2, y: 2 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: 2 }, to: { x: -2, y: 2 }, tone: 'ink', arrow: false },
              { from: { x: -2, y: 2 }, to: { x: -2, y: -2 }, tone: 'ink', arrow: false },
              { from: { x: 0.5, y: -0.7 }, to: { x: 0.5, y: 2 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 0.5, y: -0.7 }, to: { x: 0.5, y: -2 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 0.5, y: -0.7 }, to: { x: 2, y: -0.7 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 0.5, y: -0.7 }, to: { x: -2, y: -0.7 }, tone: 'accent', dashed: true, arrow: false },
            ],
            points: [
              { x: 0.5, y: -0.7, tone: 'accent' },
              { x: 0.6, y: -1.0, label: 'P', tone: 'accent', node: false, labelPos: 'right' },
            ],
            caption:
              "les 4 distances perpendiculaires d'un point $P$ aux côtés du carré $[-c\\,;c]^2$ : la somme de leurs carrés et leur somme simple ont deux seuils différents",
          },
        },
        {
          kind: 'definition',
          label: 'Somme des distances aux quatre côtés du carré [−c ; c]²',
          items: [
            'Pour un point $P$ **intérieur** au carré, la somme des distances aux 4 droites qui portent les ' +
              'côtés vaut $(c-x)+(x+c)+(c-y)+(y+c)=4c$, quelle que soit sa position ; à l\'extérieur, elle est ' +
              'plus grande.',
            'Trois régimes pour le lieu « somme $=k$ » : $k<4c$ → **vide** ; $k=4c$ → tout le **carré plein**, ' +
              'bords compris ; $k>4c$ → un **octogone**, de sommets $\\left(\\pm\\left(\\dfrac{k}{2}-c\\right)\\,;\\pm c\\right)$ ' +
              'et $\\left(\\pm c\\,;\\pm\\left(\\dfrac{k}{2}-c\\right)\\right)$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'carré plein ou octogone',
          formula:
            'Pour le carré $[-2\\,;2]^2$, détermine le lieu des points dont la somme des distances aux 4 droites ' +
            'portant les côtés vaut $8$, puis $12$.',
          steps: [
            { tag: 'seuil', text: '$4c=8$' },
            { tag: 'k = 8', text: 'seuil atteint : tout le carré plein, bords compris' },
            {
              tag: 'k = 12',
              text:
                'à droite du carré ($x>2$, $|y|\\leq2$) : $(x-2)+(x+2)+4=12$, donc $x=4$ ; dans le coin ($x>2$, $y>2$) : ' +
                '$2x+2y=12$, soit $x+y=6$',
            },
          ],
          result: {
            tag: 'octogone',
            text: 'pour $k=12$ : l\'octogone de sommets $(\\pm4\\,;\\pm2)$ et $(\\pm2\\,;\\pm4)$',
          },
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -5, xMax: 5, yMin: -4.6875, yMax: 4.6875,
              regions: [{ polygon: [{ x: -2, y: -2 }, { x: 2, y: -2 }, { x: 2, y: 2 }, { x: -2, y: 2 }], tone: 'accent' }],
              vectors: [
                { from: { x: -2, y: -2 }, to: { x: 2, y: -2 }, tone: 'accent', arrow: false },
                { from: { x: 2, y: -2 }, to: { x: 2, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 2, y: 2 }, to: { x: -2, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: -2, y: 2 }, to: { x: -2, y: -2 }, tone: 'accent', arrow: false },
              ],
              caption: '$k=4c=8$ : tout le carré plein (teinté), bords compris',
            },
            {
              kind: 'vectorPlane',
              xMin: -5, xMax: 5, yMin: -4.6875, yMax: 4.6875,
              vectors: [
                { from: { x: -2, y: -2 }, to: { x: 2, y: -2 }, tone: 'faint', arrow: false },
                { from: { x: 2, y: -2 }, to: { x: 2, y: 2 }, tone: 'faint', arrow: false },
                { from: { x: 2, y: 2 }, to: { x: -2, y: 2 }, tone: 'faint', arrow: false },
                { from: { x: -2, y: 2 }, to: { x: -2, y: -2 }, tone: 'faint', arrow: false },
                { from: { x: 4, y: -2 }, to: { x: 4, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 4, y: 2 }, to: { x: 2, y: 4 }, tone: 'accent', arrow: false },
                { from: { x: 2, y: 4 }, to: { x: -2, y: 4 }, tone: 'accent', arrow: false },
                { from: { x: -2, y: 4 }, to: { x: -4, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: -4, y: 2 }, to: { x: -4, y: -2 }, tone: 'accent', arrow: false },
                { from: { x: -4, y: -2 }, to: { x: -2, y: -4 }, tone: 'accent', arrow: false },
                { from: { x: -2, y: -4 }, to: { x: 2, y: -4 }, tone: 'accent', arrow: false },
                { from: { x: 2, y: -4 }, to: { x: 4, y: -2 }, tone: 'accent', arrow: false },
              ],
              caption: '$k=12>8$ : un octogone de sommets $(\\pm4\\,;\\pm2)$ et $(\\pm2\\,;\\pm4)$, le carré en gris',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'bande pleine ou deux droites',
          formula:
            'Détermine le lieu des points dont la somme des distances aux droites parallèles $x=0$ et $x=5$ ' +
            'vaut $5$, puis $8$.',
          steps: [
            { tag: 'traduction', text: '$|x|+|x-5|=k$ ; pour $0\\leq x\\leq5$, $|x|+|x-5|=x+5-x=5$, quel que soit $x$' },
            { tag: 'k = 5', text: 'seuil atteint (la distance entre les droites) : toute la bande $0\\leq x\\leq5$' },
            { tag: 'k = 8', text: 'à gauche : $-2x+5=8$, $x=-1{,}5$ ; à droite : $2x-5=8$, $x=6{,}5$' },
          ],
          result: {
            tag: 'nature',
            text: 'pour $k=5$, la bande **pleine**, bords compris ; pour $k=8$, deux droites $x=-1{,}5$ et $x=6{,}5$ ; pour $k<5$, le vide',
          },
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -3, xMax: 8, yMin: -5.15625, yMax: 5.15625,
              regions: [{ polygon: [{ x: 0, y: -5.15625 }, { x: 5, y: -5.15625 }, { x: 5, y: 5.15625 }, { x: 0, y: 5.15625 }], tone: 'accent' }],
              vectors: [
                { from: { x: 0, y: -5.15625 }, to: { x: 0, y: 5.15625 }, tone: 'accent', arrow: false },
                { from: { x: 5, y: -5.15625 }, to: { x: 5, y: 5.15625 }, tone: 'accent', arrow: false },
              ],
              caption: "$k=5$ : toute la bande $0\\leq x\\leq5$ (teintée), bords compris, vérifie l'équation",
            },
            {
              kind: 'vectorPlane',
              xMin: -3, xMax: 8, yMin: -5.15625, yMax: 5.15625,
              vectors: [
                { from: { x: 0, y: -5.15625 }, to: { x: 0, y: 5.15625 }, tone: 'faint', arrow: false },
                { from: { x: 5, y: -5.15625 }, to: { x: 5, y: 5.15625 }, tone: 'faint', arrow: false },
                { from: { x: -1.5, y: -5.15625 }, to: { x: -1.5, y: 5.15625 }, tone: 'accent', arrow: false },
                { from: { x: 6.5, y: -5.15625 }, to: { x: 6.5, y: 5.15625 }, tone: 'accent', arrow: false },
              ],
              caption:
                "$k=8>5$ : le lieu devient deux droites, $x=-1{,}5$ et $x=6{,}5$ — les droites d'origine ($x=0$ et $x=5$) restent en gris",
            },
          ],
        },
        {
          kind: 'astuce',
          text:
            "Avec deux droites **sécantes**, il n'y a plus de seuil (le minimum 0 n'est atteint qu'au point " +
            "d'intersection) : pour tout $k>0$, la somme des distances vaut $k$ sur un **losange** si les droites " +
            'sont perpendiculaires (par exemple $|x|+|y|=k$ pour les deux axes), sur un **parallélogramme** sinon.',
        },
        {
          kind: 'atelier',
          tag: 'trace-lieu-widget',
          label: 'Manipule toi-même : trace le lieu',
          caption:
            'Choisis une condition, puis promène M : il devient vert quand il la vérifie, et laisse une ' +
            'trace. Fais glisser k pour voir défiler les régimes : cercle, point ou vide (MA² + MB² = k) ' +
            '; médiatrice pour k = 1 (Apollonius) ; bande pleine ou deux droites ; carré plein ou ' +
            'octogone ; losange (somme) contre quatre demi-droites (différence). « Montrer le lieu » le ' +
            'trace en entier, points exclus en rond vide (angle droit : A et B).',
        },
        {
          kind: 'entrainement',
          title: 'Lieux géométriques et élimination de paramètre',
          generatorId: '6gen56',
          description: [
            'Traduis une condition géométrique (valeur absolue, somme de carrés de distances, ' +
              'rapport de distances) directement en équation, reconnais un cercle, un point ou le vide, ' +
              "puis élimine le paramètre d'une représentation paramétrique.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 56. Lieux géométriques et élimination de paramètre »',
        },
        {
          kind: 'entrainement',
          title: 'Traduire un lieu : réciproque et points exclus',
          generatorId: '6gen128',
          description: [
            'Traduis une condition (angle droit, milieu d\'une corde, centres de cercles tangents, triangle isocèle ou rectangle) en une équation du lieu complet, puis vérifie la réciproque : combien de points faut-il exclure, lesquels, et pourquoi.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 128. Traduire un lieu : réciproque et points exclus »',
        },
        {
          kind: 'entrainement',
          title: 'Quelle est la nature du lieu ?',
          generatorId: '6gen127',
          description: [
            "Reconnais la nature d'un lieu (vide, point, droite(s), cercle, bande, losange, carré plein, octogone, demi-droites) à partir de sa condition, en comparant au bon seuil, puis donne ses éléments caractéristiques.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 127. Quelle est la nature du lieu ? »',
        },
      ],
    },

    {
      id: 'methode-generatrices',
      number: 5,
      title: 'Problèmes de lieux : méthode des génératrices',
      kicker: 'deux droites mobiles, un paramètre commun α — éliminer, factoriser, trier singulier/parasite/propre, restreindre',
      titreCourt: "Génératrices",
      partie: "Lieux en mouvement : un paramètre à éliminer",
      essentiel: [
        "Génératrices : écrire les deux droites en fonction de $\\alpha$, éliminer $\\alpha$, factoriser, trier singulier / parasite / propre, puis préciser la restriction.",
        "Soustraction directe si les deux équations ont le même terme en $\\alpha$, substitution ou produit croisé sinon ; un point qui voit $[AB]$ sous un angle constant décrit un arc capable.",
      ],
      cartes: [
        { question: "Rectangle $A(0\\,;0)$, $B(4\\,;0)$, $C(4\\,;6)$, $D(0\\,;6)$ : lieu de $(AY)\\cap(BZ)$ ?", reponse: "Le segment ouvert de $(2\\,;0)$ à $(2\\,;3)$, sur la droite $x=2$." },
        { question: "Qu'est-ce qu'un morceau singulier ?", reponse: "Un morceau où les deux génératrices coïncident pour une valeur précise de $\\alpha$." },
        { question: "Lieu du milieu d'une échelle de 6 m qui glisse contre un mur ?", reponse: "Le quart de cercle $x^2+y^2=9$, avec $x\\geq0$ et $y\\geq0$." },
      ],
      blocks: [
        { kind: 'video', title: 'Méthode des génératrices (la vidéo traite aussi la représentation paramétrique)', youtubeId: 'YeIGZS6xZs0' },
        {
          kind: 'para',
          text:
            "Certains lieux ne se traduisent pas directement : le point cherché est l'intersection " +
            "de deux droites qui bougent ensemble, pilotées par un même paramètre. Il faut alors " +
            "éliminer ce paramètre pour faire apparaître l'équation du lieu.",
        },
        {
          kind: 'intuition',
          label: 'Deux règles qui pivotent ensemble',
          text:
            "Imagine deux règles articulées, chacune pivotant autour d'un point fixe, réglées " +
            'pour tourner **en même temps**, au même rythme. Leur point de croisement se déplace ' +
            "tout seul et trace un chemin — c'est exactement ce chemin, ce lieu, que la méthode " +
            'des génératrices permet de retrouver, sans avoir à suivre les deux règles image par ' +
            'image.',
        },
        {
          kind: 'definition',
          label: 'Méthode des génératrices',
          items: [
            'Un point mobile est parfois défini comme l\'intersection de deux droites qui ' +
              "dépendent toutes deux d'un même paramètre $\\alpha$ — les **génératrices**.",
            "La méthode, en 5 étapes : (1) écris les deux équations en fonction de $\\alpha$ ; (2) " +
              '**élimine** $\\alpha$ entre les deux pour obtenir une équation brute en $(x\\,;y)$ ; (3) ' +
              'factorise ; (4) trie chaque morceau — **singulier** (les deux génératrices ' +
              'coïncident pour une valeur précise de $\\alpha$ : leur « intersection » est toute une droite), ' +
              "**parasite** (une solution algébrique qu'aucune valeur de $\\alpha$ n'atteint jamais), ou " +
              '**propre** (il fait réellement partie du lieu) ; (5) précise la **restriction** — la portion ' +
              'vraiment balayée quand $\\alpha$ parcourt son domaine, et les points jamais atteints.',
          ],
        },
        {
          kind: 'application',
          titre: 'Suivre un point que deux instruments croisent en même temps',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -5.5, xMax: 5.5, yMin: -1.5, yMax: 8.8125,
              curves: [
                { fn: (x) => 3 + Math.sqrt(Math.max(0, 18 - x * x)), tone: 'accent', xMin: -Math.sqrt(18), xMax: Math.sqrt(18) },
                { fn: (x) => 3 - Math.sqrt(Math.max(0, 18 - x * x)), tone: 'accent', xMin: -Math.sqrt(18), xMax: -3 },
                { fn: (x) => 3 - Math.sqrt(Math.max(0, 18 - x * x)), tone: 'accent', xMin: 3, xMax: Math.sqrt(18) },
              ],
              vectors: [
                { from: { x: -3, y: 0 }, to: { x: 2.1213, y: 6.6742 }, tone: 'ink' },
                { from: { x: 3, y: 0 }, to: { x: 2.1213, y: 6.6742 }, tone: 'good' },
                { from: { x: -3, y: 0 }, to: { x: -2.1213, y: 6.6742 }, tone: 'faint', dashed: true },
                { from: { x: 3, y: 0 }, to: { x: -2.1213, y: 6.6742 }, tone: 'faint', dashed: true },
              ],
              angleArcs: [{ cx: 2.1213, cy: 6.6742, fromDeg: 232.5, toDeg: 277.5, radiusPx: 26, tone: 'bad', label: '45°' }],
              points: [
                { x: -3, y: 0, label: 'radar A', tone: 'ink', labelPos: 'below' },
                { x: 3, y: 0, label: 'radar B', tone: 'ink', labelPos: 'below' },
                { x: 2.1213, y: 6.6742, label: 'P', tone: 'bad', labelPos: 'right' },
                { x: -2.1213, y: 6.6742, tone: 'bad' },
              ],
              caption:
                "Deux radars dont les faisceaux tournent au même rythme gardent entre eux un angle " +
                "constant (ici 45°) : le point de croisement P voit toujours le segment [AB] sous le " +
                "même angle, et décrit un arc de cercle passant par A et B (en orange) — un « arc capable ».",
            },
          ],
          text:
            "Deux radars (ou deux stations de triangulation au sol) qui tournent en " +
            'synchronisation, chacun balayant l\'horizon à la même vitesse angulaire, voient ' +
            'leurs deux faisceaux se croiser en un point qui se déplace tout seul au fil du ' +
            'temps — exactement la configuration des deux génératrices de cette méthode. Comme les deux ' +
            "faisceaux tournent du même angle dans le même temps, l'angle entre eux ne change pas : le point " +
            'de croisement décrit un arc de cercle passant par les deux radars. Les ' +
            "marins utilisaient déjà ce principe avant l'informatique : deux phares, ou deux relevés " +
            "d'angle successifs depuis le bateau, permettaient de retrouver par construction " +
            "géométrique la trajectoire d'un autre navire ou la position d'un danger — les mêmes " +
            "outils d'élimination de paramètre que tu utilises dans cette section.",
          domaines: ['Radar', 'Navigation maritime'],
          image: {
            src: '/images/application/radar.jpg',
            alt: 'Antenne radar de poursuite longue portée',
            caption: 'Antenne du radar ALTAIR, atoll de Kwajalein. US Army, domaine public.',
          },
        },
        {
          kind: 'attention',
          label: 'Piège classique — chercher un parasite « par réflexe »',
          text:
            "Tous les problèmes de génératrices n'ont pas forcément les 3 morceaux : certains " +
            "n'ont aucun parasite, d'autres aucun singulier. Le statut de chaque morceau se lit " +
            'sur la configuration géométrique réelle — jamais par habitude. Vérifie à chaque ' +
            'fois, ne suppose jamais.',
        },
        { kind: 'subheading', text: 'Exemple résolu en détail — un rectangle' },
        {
          kind: 'exempleLibre',
          label: "Un rectangle et deux droites qui pivotent : le lieu d'intersection",
          blocks: [
            {
              kind: 'para',
              text:
                'Données : le rectangle $A(0\\,;0)$, $B(4\\,;0)$, $C(4\\,;6)$, $D(0\\,;6)$ ; les points $Z(0\\,;\\alpha)\\in\\,]AD[$ ' +
                'et $Y(4\\,;\\alpha)\\in\\,]BC[$, avec $\\alpha\\in\\,]0\\,;6[$.',
            },
            {
              kind: 'para',
              text:
                'Génératrices : droite $(AY)$ → $\\alpha x - 4y=0$ ; droite $(BZ)$ → ' +
                '$\\alpha(x-4)+4y=0$. En éliminant $\\alpha$ (de la première, $\\alpha=\\dfrac{4y}{x}$, reporté dans la ' +
                'seconde, puis on multiplie par $x$) et en factorisant, on obtient $y(2x-4)=0$.',
            },
            {
              kind: 'para',
              text:
                'Morceau $y=0$ : pour $\\alpha=0$, les deux génératrices coïncident (toutes les deux avec $(AB)$) : ' +
                '**singulier**. Morceau $x=2$ : **propre** — remarque qu\'il ne dépend pas de la ' +
                'hauteur 6, seulement de la largeur $AB=4$ : $x=\\dfrac{AB}{2}$.',
            },
            {
              kind: 'para',
              text:
                'Restriction : pour $\\alpha \\in \\,]0\\,;6[$, le point d\'intersection est ' +
                '$\\left(2\\,;\\dfrac{\\alpha}{2}\\right)$ — un **segment ouvert** entre le milieu de $[AB]$, soit $(2\\,;0)$, et ' +
                'le centre du rectangle, soit $(2\\,;3)$, ces deux extrémités étant exclues.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5333, xMax: 6.5333, yMin: -1.2, yMax: 7.3,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 4, y: 6 }, tone: 'faint', arrow: false },
              { from: { x: 4, y: 6 }, to: { x: 0, y: 6 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 6 }, to: { x: 0, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 4, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 0, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 4, y: 3 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 0, y: 3 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 4, y: 5 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 4, y: 0 }, to: { x: 0, y: 5 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 2, y: 0 }, to: { x: 2, y: 3 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 4, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 0, y: 6, label: 'D', tone: 'ink', labelPos: 'left' },
              { x: 4, y: 6, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 2, y: 0.5, tone: 'accent' },
              { x: 2, y: 1.5, tone: 'accent' },
              { x: 2, y: 2.5, tone: 'accent' },
              { x: 2, y: 3, label: '(2;3)', tone: 'accent', labelPos: 'above', open: true },
              { x: 2, y: 0, label: '(2;0)', tone: 'accent', labelPos: 'below', open: true },
            ],
            caption:
              '3 positions de $\\alpha$ (1, 3, 5) : les droites $(AY)$ et $(BZ)$ se coupent toujours sur $x=2$ — le lieu est le segment ouvert entre $(2\\,;0)$ et $(2\\,;3)$ (extrémités creuses, exclues)',
          },
        },
        {
          kind: 'astuce',
          text:
            "Ici, $x=2$ ne dépend pas de la hauteur du rectangle — seule la **restriction** " +
            '(le segment réellement balayé, qui va jusqu\'à $y=3$) en dépend. Distingue toujours ' +
            "l'équation du lieu de sa restriction : décrire un lieu sans sa restriction, c'est " +
            'une réponse incomplète.',
        },
        {
          kind: 'atelier',
          tag: 'generatrices-animees-widget',
          label: 'Manipule toi-même : les génératrices en mouvement',
          caption:
            'Lance l’animation ou fais glisser α : les deux génératrices tournent ensemble et leur point ' +
            'd’intersection P laisse une trace. Pour α = 0, elles sont confondues (morceau singulier). ' +
            'Avec les perpendiculaires, le point (1 ; 0) n’est jamais atteint ; avec les angles α et 2α, ' +
            'P fait le tour d’un cercle sauf un point. « Montrer le lieu » donne l’équation factorisée, ' +
            'le statut de chaque morceau et la restriction.',
        },
        { kind: 'subheading', text: "Une médiane qui émerge d'une famille de céviennes" },
        {
          kind: 'exempleLibre',
          label: 'Deux céviennes mobiles dans un triangle : le lieu est une médiane',
          blocks: [
            {
              kind: 'para',
              text:
                "Une **cévienne** est un segment qui joint un sommet d'un triangle à un point du côté opposé. " +
                'Données : $A(0\\,;4)$, $B(0\\,;0)$, $C(6\\,;0)$ ; pour $\\alpha\\in\\,]0\\,;4[$, la parallèle à $(BC)$ ' +
                "d'équation $y=\\alpha$ coupe $[AB]$ en $D(0\\,;\\alpha)$ et $[AC]$ en $E\\left(6-\\dfrac{3\\alpha}{2}\\,;\\alpha\\right)$.",
            },
            {
              kind: 'para',
              text:
                'Génératrices : $(BE)$ → $\\alpha x-\\left(6-\\dfrac{3\\alpha}{2}\\right)y=0$ ; $(CD)$ → $\\alpha(x-6)+6y=0$. ' +
                "En éliminant $\\alpha$ et en factorisant : $y(4x+3y-12)=0$.",
            },
            {
              kind: 'para',
              text:
                'Morceau $y=0$ : pour $\\alpha=0$, $(BE)$ et $(CD)$ coïncident avec $(BC)$ : **singulier**. Morceau ' +
                "$4x+3y-12=0$ : **propre**. Il passe par $A(0\\,;4)$ et par le milieu $(3\\,;0)$ de $[BC]$ — c'est la " +
                "**médiane** issue de $A$, qui apparaît ici comme un lieu d'intersection, sans jamais avoir été " +
                'postulée au départ.',
            },
            {
              kind: 'para',
              text:
                'Restriction : le point d\'intersection a pour ordonnée $y=\\dfrac{4\\alpha}{8-\\alpha}$, qui croît de $0$ ' +
                'à $4$ quand $\\alpha$ parcourt $]0\\,;4[$. Le lieu est le **segment ouvert** joignant le milieu de ' +
                '$[BC]$ à $A$, extrémités exclues.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5, xMax: 7.5, yMin: -2.21875, yMax: 6.21875,
            vectors: [
              { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 0, y: 4 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 4 }, to: { x: 3, y: 0 }, tone: 'accent', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 4.5, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 0, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 3, y: 2 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 0, y: 2 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 4, label: 'A', tone: 'accent', labelPos: 'left', open: true },
              { x: 0, y: 0, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 6, y: 0, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 0, label: 'milieu de [BC]', tone: 'accent', labelPos: 'below', open: true },
              { x: 18 / 7, y: 4 / 7, tone: 'accent' },
              { x: 2, y: 4 / 3, tone: 'accent' },
            ],
            caption:
              'pour 2 hauteurs de la parallèle à $(BC)$ ($\\alpha=1$ et $\\alpha=2$), les céviennes $(BE)$ et $(CD)$ se coupent sur la médiane issue de $A$ — lieu : le segment ouvert, extrémités creuses',
          },
        },
        { kind: 'subheading', text: 'Un point du lieu jamais atteint — le piège du parasite' },
        {
          kind: 'exempleLibre',
          label: "Deux perpendiculaires mobiles : une droite privée d'un point",
          blocks: [
            {
              kind: 'para',
              text:
                'Données : $A(3\\,;0)$, $B(-2\\,;0)$ et $C(0\\,;\\alpha)$ variable sur l\'axe des ordonnées ($\\alpha\\neq0$). ' +
                'Génératrices : la perpendiculaire à $(AC)$ par $A$, $-3(x-3)+\\alpha y=0$, et la perpendiculaire à ' +
                '$(BC)$ par $B$, $2(x+2)+\\alpha y=0$.',
            },
            {
              kind: 'para',
              text:
                "Les deux équations ont le même terme $\\alpha y$ : en les soustrayant, $\\alpha$ disparaît d'un coup : " +
                '$-5x+5=0$, soit $x=1$. Un seul morceau, entièrement **propre**.',
            },
            {
              kind: 'para',
              text:
                'Restriction : le point d\'intersection est $\\left(1\\,;-\\dfrac{6}{\\alpha}\\right)$, et $-\\dfrac{6}{\\alpha}$ prend ' +
                'toutes les valeurs **sauf 0**. Le point $(1\\,;0)$ n\'est jamais atteint (il faudrait un $\\alpha$ ' +
                "infini) : c'est un point **parasite**. Le lieu est la droite $x=1$ privée de $(1\\,;0)$.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4, xMax: 5, yMin: -5, yMax: 3.4375,
            vectors: [
              { from: { x: 1, y: -5 }, to: { x: 1, y: 3.4375 }, tone: 'good', arrow: false },
              { from: { x: -1 / 3, y: -5 }, to: { x: 5, y: 3 }, tone: 'accent', arrow: false },
              { from: { x: -4, y: 2 }, to: { x: 3, y: -5 }, tone: 'accent', arrow: false },
              { from: { x: -0.4375, y: 3.4375 }, to: { x: 5, y: -2 }, tone: 'ink', arrow: false },
              { from: { x: -4, y: -4 / 3 }, to: { x: 3.15625, y: 3.4375 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 0, y: 2 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -2, y: 0 }, to: { x: 0, y: 2 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 0, y: -3 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -2, y: 0 }, to: { x: 0, y: -3 }, tone: 'faint', dashed: true, arrow: false },
            ],
            rightAngleMarkers: [
              { vertex: { x: 3, y: 0 }, arm1: { x: 0, y: 2 }, arm2: { x: 1, y: -3 }, size: 8 },
              { vertex: { x: -2, y: 0 }, arm1: { x: 0, y: 2 }, arm2: { x: 1, y: -3 }, size: 8 },
            ],
            points: [
              { x: 3, y: 0, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: -2, y: 0, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 0, y: 2, label: 'C₁', tone: 'accent', labelPos: 'left' },
              { x: 0, y: -3, label: 'C₂', tone: 'ink', labelPos: 'left' },
              { x: 1, y: -3, tone: 'good' },
              { x: 1, y: 2, tone: 'good' },
              { x: 1, y: 0, tone: 'bad', open: true },
            ],
            caption:
              'pour $C_1(0\\,;2)$ (droites orange) et $C_2(0\\,;-3)$ (deux autres droites), les perpendiculaires à $(AC)$ en $A$ et à $(BC)$ en $B$ se coupent sur $x=1$, en $(1\\,;-3)$ et $(1\\,;2)$ — jamais au point creux $(1\\,;0)$, qui exigerait $\\alpha$ infini',
          },
        },
        { kind: 'subheading', text: 'Quand un angle double intervient — la substitution' },
        {
          kind: 'exempleLibre',
          label: 'Des angles α et 2α : un demi-cercle',
          blocks: [
            {
              kind: 'para',
              text:
                'Données : $A(0\\,;0)$, $B(4\\,;0)$, $\\alpha\\in\\,]0^\\circ\\,;90^\\circ[$. La droite $a$ passe par $A$ et fait ' +
                "l'angle $\\alpha$ avec $(AB)$ ; la droite $b$ passe par $B$ et fait l'angle $2\\alpha$ avec $(AB)$ (angles " +
                "mesurés à partir du sens des $x$ croissants). On note $t=\\tan\\alpha>0$, et $\\tan 2\\alpha=\\dfrac{2t}{1-t^2}$.",
            },
            {
              kind: 'para',
              text:
                'Génératrices : $a$ → $y=tx$ ; $b$ → $y(1-t^2)=2t(x-4)$. Les coefficients de $t$ ne sont ni égaux ni ' +
                "proportionnels : on **substitue** $t=\\dfrac{y}{x}$ (tiré de $a$) dans $b$, puis on multiplie par $x^2$ : " +
                '$y(x^2-y^2)=2xy(x-4)$, soit $y\\left(8x-x^2-y^2\\right)=0$.',
            },
            {
              kind: 'para',
              text:
                'Morceau $y=0$ : aucune valeur de $\\alpha$ ne donne un point de l\'axe — l\'intersection ' +
                '$\\left(\\dfrac{8}{1+t^2}\\,;\\dfrac{8t}{1+t^2}\\right)$ a toujours $y>0$ : **parasite**. Morceau ' +
                "$(x-4)^2+y^2=16$ : le cercle de centre $B$ et de rayon $AB=4$ (**propre**). Géométriquement : l'angle " +
                'en $P$ vaut $2\\alpha-\\alpha=\\alpha$, le triangle $ABP$ est isocèle en $B$, donc $BP=BA$.',
            },
            {
              kind: 'para',
              text:
                'Restriction : quand $\\alpha$ parcourt $]0^\\circ\\,;90^\\circ[$, $y>0$ et $x=\\dfrac{8}{1+t^2}$ parcourt ' +
                '$]0\\,;8[$ : le lieu est le **demi-cercle supérieur, privé de ses extrémités** $(0\\,;0)$ et $(8\\,;0)$. ' +
                "Pour $\\alpha=45^\\circ$, $b$ est verticale ($\\tan 90^\\circ$ n'existe pas) : on vérifie à part que $P(4\\,;4)$ est " +
                'bien sur le cercle.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5, xMax: 9.5, yMin: -2.5, yMax: 7.8125,
            curves: [{ fn: (x) => Math.sqrt(Math.max(0, 16 - (x - 4) * (x - 4))), tone: 'accent', xMin: 0, xMax: 8 }],
            vectors: [
              { from: { x: -1.5, y: -0.866 }, to: { x: 9.5, y: 5.4848 }, tone: 'ink', arrow: false },
              { from: { x: 2.5566, y: -2.5 }, to: { x: 8.5106, y: 7.8125 }, tone: 'good', arrow: false },
            ],
            angleArcs: [
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 30, radiusPx: 34, tone: 'attn', label: 'α' },
              { cx: 4, cy: 0, fromDeg: 0, toDeg: 60, radiusPx: 26, tone: 'good', label: '2α' },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'accent', labelPos: 'below', open: true },
              { x: 4, y: 0, label: 'B', tone: 'ink', labelPos: 'below' },
              { x: 8, y: 0, tone: 'accent', open: true },
              { x: 6, y: 3.4641, label: 'P', tone: 'bad', labelPos: 'left' },
            ],
            caption: 'pour $\\alpha=30^\\circ$, $a$ et $b$ (en vert) se coupent en $P(6\\,;2\\sqrt3)$ ; le lieu est le demi-cercle de centre $B$ et de rayon 4, privé de $(0\\,;0)$ et de $(8\\,;0)$',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — la technique d'élimination ne se généralise jamais automatiquement",
          text:
            'Le produit croisé (ou la substitution) quand les coefficients de $\\alpha$ diffèrent, la ' +
            'soustraction directe quand les deux génératrices ont le même terme en $\\alpha$, la substitution ' +
            "quand un angle double $\\tan(2\\alpha)$ intervient : ces techniques ne sont pas interchangeables ! " +
            "Appliquer aveuglément la même technique d'une configuration à l'autre peut faire apparaître un " +
            'facteur parasite en trop — ou en perdre un.',
        },
        { kind: 'subheading', text: 'Un point qui bouge en contexte' },
        {
          kind: 'methode',
          label: 'Lieu d’un point mobile défini par une situation',
          items: [
            'Choisis le **paramètre** qui pilote la situation (une longueur, un angle, une coordonnée) et un ' +
              'repère adapté.',
            'Exprime les coordonnées du point mobile en fonction de ce paramètre — directement quand c\'est ' +
              'possible (milieu, centre de gravité $\\dfrac{A+B+C}{3}$…), sinon par deux génératrices.',
            'Élimine le paramètre, puis lis la **restriction imposée par le contexte** : longueurs positives, ' +
              'quart de plan, triangle non aplati, angle dans un intervalle.',
            'À reconnaître : un point qui voit $[AB]$ sous un angle **droit** est sur le cercle de diamètre ' +
              '$[AB]$ (§ 4) — c\'est le cas du pied de la perpendiculaire menée d\'un point fixe à une droite qui ' +
              'tourne autour d\'un autre point fixe ; sous un angle constant quelconque, sur un **arc capable** ' +
              '(les radars ci-dessus).',
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Une échelle qui glisse : le lieu de son milieu",
          blocks: [
            {
              kind: 'para',
              text:
                'Une échelle de 6 m glisse : son pied $A(a\\,;0)$ reste sur le sol (axe des abscisses), son sommet ' +
                '$B(0\\,;b)$ contre le mur (axe des ordonnées), avec $a\\geq0$, $b\\geq0$ et $a^2+b^2=36$ (Pythagore). ' +
                'Quel est le lieu du milieu $M$ de l\'échelle ?',
            },
            {
              kind: 'para',
              text:
                '$M\\left(\\dfrac{a}{2}\\,;\\dfrac{b}{2}\\right)$ : $x=\\dfrac{a}{2}$ et $y=\\dfrac{b}{2}$, donc $a=2x$, $b=2y$, et ' +
                '$4x^2+4y^2=36$, soit $x^2+y^2=9$ — **le paramètre est éliminé par la relation de Pythagore**.',
            },
            {
              kind: 'para',
              text:
                'Restriction imposée par le contexte : $x\\geq0$ et $y\\geq0$. Le lieu est le **quart de cercle** de ' +
                "centre $O$ et de rayon 3 situé dans le premier quadrant, de $(3\\,;0)$ (échelle couchée) à $(0\\,;3)$ " +
                '(échelle verticale).',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.8, xMax: 6.8, yMin: -0.8, yMax: 6.325,
            curves: [{ fn: (x) => Math.sqrt(Math.max(0, 9 - x * x)), tone: 'accent', xMin: 0, xMax: 3 }],
            vectors: [
              { from: { x: 3.6, y: 0 }, to: { x: 0, y: 4.8 }, tone: 'ink', arrow: false },
              { from: { x: 5.2, y: 0 }, to: { x: 0, y: 2.9933 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 3.6, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 0, y: 4.8, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 1.8, y: 2.4, label: 'M', tone: 'bad', labelPos: 'right' },
              { x: 2.6, y: 1.4967, tone: 'bad' },
            ],
            caption: "échelle de 6 m dans deux positions : son milieu $M$ reste sur le quart de cercle de centre $O$ et de rayon 3 (en orange)",
          },
        },
        {
          kind: 'exempleLibre',
          label: "Le centre de gravité d'un triangle dont un sommet glisse sur une droite",
          blocks: [
            {
              kind: 'para',
              text:
                'Données : $B(0\\,;0)$, $C(6\\,;0)$ fixes, et $A(3\\,;\\alpha)$ qui parcourt la droite $x=3$, avec ' +
                '$\\alpha\\neq0$ (sinon le triangle est aplati). Lieu du centre de gravité $G$ ?',
            },
            {
              kind: 'para',
              text:
                '$G=\\dfrac{A+B+C}{3}=\\left(3\\,;\\dfrac{\\alpha}{3}\\right)$ : pas besoin de génératrices, les coordonnées ' +
                'de $G$ s\'écrivent directement. On peut aussi couper les médianes $(BN)$ et $(CM)$ ($M$, $N$ milieux ' +
                'de $[AB]$ et de $[AC]$) : leurs équations ont le même terme en $\\alpha$, et une soustraction donne $x=3$.',
            },
            {
              kind: 'para',
              text:
                '$\\dfrac{\\alpha}{3}$ prend toutes les valeurs sauf 0 : le lieu est la droite $x=3$ **privée de** ' +
                '$(3\\,;0)$, le point qui correspondrait au triangle aplati.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Problèmes de lieux : méthode des génératrices',
          generatorId: '6gen57',
          description: [
            "Élimine le paramètre commun à deux droites mobiles, factorise, puis trie " +
              "singulier / parasite / propre et précise la restriction pour décrire le lieu de leur point d'intersection.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 57. Problèmes de lieux : méthode des génératrices »',
        },
        {
          kind: 'entrainement',
          title: 'Lieux en contexte : un point qui bouge',
          generatorId: '6gen130',
          description: [
            'Une échelle qui glisse, deux radars qui tournent au même rythme, un centre de gravité, le pied d\'une perpendiculaire : exprime le point mobile, élimine le paramètre, puis précise la partie du lieu imposée par la situation.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 130. Lieux en contexte : un point qui bouge »',
        },
      ],
    },

    {
      id: 'lieu-parametrique',
      number: 6,
      title: 'Lieux définis par une représentation paramétrique',
      kicker: 'x = f(t), y = g(t) — éliminer t par une identité, puis décrire la partie réellement balayée',
      titreCourt: "Lieux paramétriques",
      partie: "Lieux en mouvement : un paramètre à éliminer",
      essentiel: [
        "Pour $x=f(t)$, $y=g(t)$ : éliminer $t$ par une identité ($\\cos^2t+\\sin^2t=1$, $\\cos 2t=2\\cos^2t-1$), puis décrire la partie réellement balayée.",
        "Le lieu peut être la courbe entière, une demi-courbe, un arc ou la courbe privée de points : la réciproque compte autant que l'équation.",
      ],
      cartes: [
        { question: "Lieu des points $(\\cos t\\,;\\cos 2t)$ ?", reponse: "L'arc de la parabole $y=2x^2-1$ pour $x\\in[-1\\,;1]$." },
        { question: "Équation cartésienne de l'astroïde $(\\cos^3\\lambda\\,;\\sin^3\\lambda)$ ?", reponse: "$|x|^{2/3}+|y|^{2/3}=1$." },
        { question: "$x=\\dfrac{1}{t+1}$ : quelle valeur $x$ ne prend-il jamais ?", reponse: "$0$ — le point correspondant est exclu du lieu." },
      ],
      blocks: [
        { kind: 'video', title: 'Lieu défini par une représentation paramétrique (suite de la vidéo de la section 5)', youtubeId: 'YeIGZS6xZs0' },
        {
          kind: 'definition',
          items: [
            'Un lieu peut être donné directement par deux équations $x=f(t)$, $y=g(t)$ — une ' +
              '**représentation paramétrique** — plutôt que par une seule condition géométrique. ' +
              'Pour retrouver l\'équation cartésienne du lieu, on élimine $t$ entre les deux ' +
              'équations, le plus souvent grâce à une **identité** qui relie $f$ et $g$.',
            "L'équation obtenue décrit en général une courbe **plus grande** que le lieu : quand $t$ parcourt " +
              'son domaine, $x$ et $y$ ne prennent pas forcément toutes les valeurs. Le lieu peut être la courbe ' +
              'entière, une demi-courbe, un arc, ou la courbe privée de quelques points.',
          ],
        },
        {
          kind: 'methode',
          label: 'Éliminer t, puis décrire la partie balayée',
          items: [
            "**Choisir la technique** : $\\cos^2t+\\sin^2t=1$ quand $x$ et $y$ font intervenir $\\cos t$ et " +
              '$\\sin t$ ; $\\cos 2t=2\\cos^2t-1$ quand l\'un utilise $t$ et l\'autre $2t$ ; isoler $t$ dans ' +
              'l\'équation la plus simple et reporter ; former un quotient ou une puissance qui fait disparaître ' +
              '$t$ (par exemple $x=t^3$, $y=t^2$ donnent $x^2=t^6=y^3$).',
            '**Écrire l\'équation cartésienne** et reconnaître la courbe.',
            "**Décrire la partie balayée** : chercher l'ensemble des valeurs prises par $x$ (et $y$) quand $t$ " +
              'parcourt son domaine — une racine carrée est positive, un cosinus reste dans $[-1\\,;1]$, une ' +
              'fraction $\\dfrac{1}{t+a}$ ne vaut jamais 0.',
            '**Vérifier la réciproque** : chaque point de la partie annoncée est-il atteint par au moins une ' +
              'valeur de $t$ ? C\'est la même exigence qu\'au § 4 : le lieu, tout le lieu, rien que le lieu.',
          ],
        },
        {
          kind: 'exemple',
          badge: "l'astroïde",
          formula:
            'Détermine une équation cartésienne du lieu des points $\\left(\\cos^3\\lambda\\,;\\sin^3\\lambda\\right)$ quand ' +
            '$\\lambda$ parcourt $[0\\,;2\\pi[$, et précise la partie balayée.',
          steps: [
            { tag: 'isoler', text: 'on prend la racine cubique de chaque équation : $\\sqrt[3]{x}=\\cos\\lambda$ et $\\sqrt[3]{y}=\\sin\\lambda$' },
            {
              tag: 'identité',
              text: '$\\left(\\sqrt[3]{x}\\right)^2+\\left(\\sqrt[3]{y}\\right)^2 = \\cos^2\\lambda+\\sin^2\\lambda = 1$, soit $|x|^{2/3}+|y|^{2/3}=1$',
            },
            {
              tag: 'réciproque',
              text: 'si $u=\\sqrt[3]{x}$ et $v=\\sqrt[3]{y}$ vérifient $u^2+v^2=1$, il existe $\\lambda$ tel que $u=\\cos\\lambda$, $v=\\sin\\lambda$',
            },
          ],
          result: {
            tag: 'astroïde',
            text:
              'courbe fermée, à 4 « pointes » sur les axes en $(\\pm1\\,;0)$ et $(0\\,;\\pm1)$ ; la ' +
              'restriction $\\lambda \\in [0\\,;2\\pi[$ balaie la courbe entière une seule fois',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.7, xMax: 1.7, yMin: -1.59375, yMax: 1.59375,
            curves: [
              { fn: (x) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), 2 / 3)), 1.5), tone: 'ink', xMin: -1, xMax: 1 },
              { fn: (x) => -Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), 2 / 3)), 1.5), tone: 'ink', xMin: -1, xMax: 1 },
            ],
            points: [
              { x: 1, y: 0, label: '(1;0)', tone: 'ink', labelPos: 'above' },
              { x: -1, y: 0, label: '(−1;0)', tone: 'ink', labelPos: 'above' },
              { x: 0, y: 1, label: '(0;1)', tone: 'ink', labelPos: 'right' },
              { x: 0, y: -1, label: '(0;−1)', tone: 'ink', labelPos: 'right' },
            ],
            caption: "astroïde $x=\\cos^3\\lambda$, $y=\\sin^3\\lambda$, d'équation cartésienne $|x|^{2/3}+|y|^{2/3}=1$",
          },
        },
        {
          kind: 'atelier',
          tag: 'courbe-parametree-widget',
          label: 'Manipule toi-même : une courbe paramétrée',
          caption:
            'Fais varier t (ou lance l’animation) : le point P trace sa courbe en orange, par-dessus la ' +
            'courbe cartésienne complète en gris, obtenue en éliminant t. Astroïde, cercle et t + 1 ; t² ' +
            '− 3 décrivent toute leur courbe ; x = cos t, y = cos 2t ne décrit qu’un arc de parabole, et ' +
            'x = t², y = t⁴ une demi-parabole parcourue deux fois. L’équation seule ne dit pas tout : il ' +
            'faut aussi la partie décrite.',
        },
        {
          kind: 'astuce',
          text:
            'Pour contrôler un résultat, choisis une valeur simple de $\\lambda$ (ex. $\\lambda=\\dfrac{\\pi}{2}$ ' +
            'donne $\\cos\\lambda=0$, $\\sin\\lambda=1$, donc le point $(0\\,;1)$) et vérifie qu\'il ' +
            "satisfait bien l'équation cartésienne obtenue — un contrôle rapide qui ne demande " +
            'aucun nouveau calcul. Attention : $x^{2/3}$ n\'est pas défini pour $x<0$ avec une puissance ' +
            'fractionnaire ; écris $\\left(\\sqrt[3]{x}\\right)^2$ ou $|x|^{2/3}$ pour couvrir les quatre quadrants.',
        },
        {
          kind: 'exemple',
          badge: 'un arc de parabole',
          formula:
            'Détermine le lieu des points $(\\cos t\\,;\\cos 2t)$ quand $t$ parcourt $\\mathbb{R}$ : équation cartésienne et ' +
            'partie balayée.',
          steps: [
            { tag: 'identité', text: '$\\cos 2t=2\\cos^2t-1$, donc $y=2x^2-1$' },
            { tag: 'valeurs de x', text: '$x=\\cos t$ parcourt $[-1\\,;1]$, et chaque valeur de $[-1\\,;1]$ est atteinte' },
          ],
          result: {
            tag: 'lieu',
            text: "l'**arc** de la parabole $y=2x^2-1$ pour $x\\in[-1\\,;1]$, de $(-1\\,;1)$ à $(1\\,;1)$ en passant par $(0\\,;-1)$ — pas la parabole entière",
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.2, xMax: 2.2, yMin: -1.6, yMax: 2.525,
            curves: [
              { fn: (x) => 2 * x * x - 1, tone: 'faint', xMin: -1.25, xMax: 1.25 },
              { fn: (x) => 2 * x * x - 1, tone: 'accent', xMin: -1, xMax: 1 },
            ],
            points: [
              { x: -1, y: 1, label: '(−1;1)', tone: 'accent', labelPos: 'left' },
              { x: 1, y: 1, label: '(1;1)', tone: 'accent', labelPos: 'right' },
              { x: 0, y: -1, label: '(0;−1)', tone: 'accent', labelPos: 'right' },
            ],
            caption: 'le lieu de $(\\cos t\\,;\\cos 2t)$ : seulement l’arc orange de la parabole $y=2x^2-1$ (en gris, la partie jamais atteinte)',
          },
        },
        {
          kind: 'exemple',
          badge: "une droite privée d'un point",
          formula:
            'Détermine le lieu des points $\\left(\\dfrac{1}{t+1}\\,;\\dfrac{t+3}{t+1}\\right)$ quand $t$ parcourt ' +
            '$\\mathbb{R}\\setminus\\{-1\\}$.',
          steps: [
            { tag: 'fraction', text: '$\\dfrac{t+3}{t+1}=1+\\dfrac{2}{t+1}$, donc $y=1+2x$ — sans même isoler $t$' },
            { tag: 'valeurs de x', text: '$x=\\dfrac{1}{t+1}$ prend toutes les valeurs **sauf 0**' },
          ],
          result: { tag: 'lieu', text: 'la droite $y=2x+1$, **privée du point** $(0\\,;1)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5, xMax: 2.5, yMin: -2.34375, yMax: 2.34375,
            vectors: [{ from: { x: -1.671875, y: -2.34375 }, to: { x: 0.671875, y: 2.34375 }, tone: 'accent', arrow: false }],
            points: [{ x: 0, y: 1, label: '(0;1) exclu', tone: 'bad', labelPos: 'right', open: true }],
            caption: 'le lieu : la droite $y=2x+1$ privée de $(0\\,;1)$ (point creux), qui correspondrait à une valeur infinie de $t$',
          },
        },
        {
          kind: 'attention',
          label: 'Piège classique — la racine carrée coupe la courbe en deux',
          text:
            'Pour $x=\\sqrt{t}+1$, $y=2t-3$ ($t\\geq0$) : $t=(x-1)^2$ donne $y=2(x-1)^2-3$, une parabole. Mais ' +
            '$x=\\sqrt{t}+1\\geq1$ : le lieu n\'est que la **demi-parabole** $x\\geq1$. De même, ' +
            "$x=2+3\\cos t$, $y=-1+3\\sin t$ décrit le cercle entier pour $t\\in[0\\,;2\\pi[$, mais seulement le " +
            'demi-cercle supérieur ($y\\geq-1$) pour $t\\in[0\\,;\\pi]$.',
        },
        {
          kind: 'entrainement',
          title: 'Courbe paramétrée : élimination et restriction',
          generatorId: '6gen129',
          description: [
            'Élimine t grâce à une identité (cos² t + sin² t = 1, cos 2t = 2cos² t − 1) ou en l\'isolant, trouve l\'équation cartésienne, puis décide si M décrit toute la courbe, une moitié ou un arc, et par quelle condition.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 129. Courbe paramétrée : élimination et restriction »',
        },
        {
          kind: 'entrainement',
          title: 'Détective d\'erreurs : lieux, droites et cercles',
          generatorId: '6gen131',
          description: [
            'Trouve la ligne fausse dans la copie d\'un élève (sommets du losange, théorème de la médiane, Apollonius pour k = 1, centre sans diviser par m, incentre, aire variable, tangente verticale, points exclus), explique l\'erreur et corrige.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 131. Détective d\'erreurs : lieux, droites et cercles »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Droites',
        formulas: [
          { text: '$ax+by+c=0$', condition: 'forme implicite — jamais $y=mx+p$ ; normale $(a\\,;b)$' },
          { text: '$m = -\\dfrac{a}{b}$', condition: 'pente, si $b\\neq0$' },
          { text: '$a_1b_2-a_2b_1=0$', condition: 'parallèles — ou $m_1=m_2$' },
          { text: '$a_1a_2+b_1b_2=0$', condition: 'perpendiculaires — ou $m_1 \\cdot m_2=-1$' },
          { text: '$\\tan\\theta=\\left|\\dfrac{m_2-m_1}{1+m_1m_2}\\right|$', condition: 'angle aigu entre deux droites, si $1+m_1m_2\\neq0$' },
          { text: '$\\mathrm{dist}(P\\,;d) = \\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}$', condition: 'repère orthonormé' },
        ],
      },
      {
        title: 'Points remarquables du triangle',
        formulas: [
          { text: '$G=\\dfrac{A+B+C}{3}$', condition: 'centre de gravité, aux deux tiers de chaque médiane' },
          { text: '$OA=OB=OC$', condition: 'centre du cercle circonscrit : intersection de deux médiatrices' },
          { text: '$H=A+B+C-2O$', condition: 'orthocentre ; hauteur issue de $A$ : normale $\\overrightarrow{BC}$, passe par $A$' },
          { text: '$\\overrightarrow{OH}=3\\,\\overrightarrow{OG}$', condition: "droite d'Euler ; centre du cercle des neuf points : milieu de $[OH]$" },
          { text: '$\\dfrac{AI}{IC} = \\dfrac{AB}{BC}$', condition: 'bissectrice issue de $B$, coupant $[AC]$ en $I$' },
          { text: '$I = \\dfrac{BC\\times A + AB\\times C}{AB+BC}$' },
        ],
      },
      {
        title: 'Constructions dans le triangle',
        formulas: [
          { text: "$A = B'+C'-A'$", condition: 'sommet retrouvé à partir des 3 milieux (et permutations)' },
          { text: '$Q = 2H-P$', condition: 'symétrique de $P$ par rapport à une droite, $H$ pied de la perpendiculaire' },
          { text: '$\\text{aire}(ABC)=\\dfrac{1}{2}\\,|x_{AB}\\,y_{AC}-y_{AB}\\,x_{AC}|$' },
          {
            text: '$|K+Mt| = 2k \\iff K+Mt=2k$ ou $K+Mt=-2k$',
            condition: 'aire variable, un sommet parcourant une droite non parallèle à $(AB)$ : deux solutions',
          },
          { text: '$(x\\,;y) \\mapsto (-y\\,;x)$', condition: 'rotation de 90° (sommets d’un carré)' },
        ],
      },
      {
        title: 'Cercles',
        formulas: [
          { text: '$x^2+y^2+Dx+Ey+F=0$', condition: 'forme générale' },
          { text: 'centre $\\left(-\\dfrac{D}{2}\\,;-\\dfrac{E}{2}\\right) \\quad$ rayon $\\sqrt{\\dfrac{D^2}{4}+\\dfrac{E^2}{4}-F}$' },
          {
            text: '$m(x^2+y^2)+Dx+Ey+F=0$ : $\\rho=\\dfrac{D^2+E^2}{4m^2}-\\dfrac{F}{m}$',
            condition: 'centre $\\left(-\\dfrac{D}{2m}\\,;-\\dfrac{E}{2m}\\right)$ ; cercle si $\\rho>0$, point si $\\rho=0$, vide si $\\rho<0$',
          },
          { text: '$r^2=\\delta^2+\\left(\\dfrac{L}{2}\\right)^2$', condition: 'corde de longueur $L$, $\\delta$ = distance du centre à la droite' },
          { text: '$r=\\dfrac{(b-x_A)^2+y_A^2}{2y_A}$', condition: "cercle tangent à l'axe des abscisses en $(b\\,;0)$, passant par $A$" },
          { text: '$(x_T-x_\\Omega)(x-x_T)$ $+(y_T-y_\\Omega)(y-y_T)=0$', condition: 'tangente en $T$ au cercle de centre $\\Omega$' },
          {
            text: '$PT = \\sqrt{OP^2-r^2}$',
            condition: "longueur d'une tangente depuis $P$ extérieur au cercle de centre $O$, de rayon $r$",
          },
          { text: 'incentre $= \\dfrac{aA+bB+cC}{a+b+c}$', condition: '$a$, $b$, $c$ = côtés opposés à $A$, $B$, $C$ ; rayon $=\\dfrac{\\text{aire}}{p}$' },
          { text: '$J_A=\\dfrac{-aA+bB+cC}{-a+b+c}$', condition: 'centre du cercle exinscrit opposé à $A$ ; rayon $=\\dfrac{\\text{aire}}{p-a}$' },
        ],
      },
      {
        title: 'Lieux par traduction directe',
        formulas: [
          { text: '$|x-p|+|y-q|=k$', condition: 'losange de sommets $(p\\pm k\\,;q)$ et $(p\\,;q\\pm k)$' },
          { text: '$|x-p|-|y-q|=k$', condition: '4 demi-droites — lieu non borné' },
          {
            text: '$PA^2+PB^2 = 2\\,PM^2+\\dfrac{AB^2}{2}$',
            condition: '$M$ milieu de $[AB]$ — seuil $\\dfrac{AB^2}{2}$ : cercle, point ou vide',
          },
          { text: '$PA^2-PB^2=k$', condition: 'droite perpendiculaire à $(AB)$ ; $x=\\dfrac{k}{4a}$ pour $A(-a\\,;0)$, $B(a\\,;0)$' },
          {
            text: '$PA^2 = k\\cdot PB^2$',
            condition: "médiatrice si $k=1$ ; sinon cercle de centre $\\left(\\dfrac{a(k+1)}{k-1}\\,;0\\right)$, de rayon $\\dfrac{2a\\sqrt{k}}{|k-1|}$",
          },
          {
            text: '$\\dfrac{a_1x+b_1y+c_1}{\\sqrt{a_1^2+b_1^2}}=\\pm\\dfrac{a_2x+b_2y+c_2}{\\sqrt{a_2^2+b_2^2}}$',
            condition: 'bissectrices : points équidistants de deux droites sécantes',
          },
          { text: '$\\widehat{APB}=90^\\circ$', condition: 'cercle de diamètre $[AB]$, privé de $A$ et de $B$' },
          { text: 'somme des distances aux côtés du carré $[-c\\,;c]^2$ $=k$', condition: 'vide si $k<4c$, carré plein si $k=4c$, octogone si $k>4c$' },
          { text: '$|x|+|x-d|=k$', condition: 'vide si $k<d$, bande pleine si $k=d$, deux droites si $k>d$' },
        ],
      },
      {
        title: 'Génératrices et paramètres',
        formulas: [
          { text: '$\\cos^2t+\\sin^2t=1 \\qquad \\cos 2t=2\\cos^2t-1$', condition: 'identités pour éliminer $t$' },
          { text: '$\\tan 2\\alpha=\\dfrac{2\\tan\\alpha}{1-\\tan^2\\alpha}$', condition: 'génératrices avec des angles $\\alpha$ et $2\\alpha$' },
          { text: '$|x|^{2/3}+|y|^{2/3}=1$', condition: 'astroïde — issue de $x=\\cos^3\\lambda$, $y=\\sin^3\\lambda$' },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Repère affine / orthonormé', 'distance, angle, cercle : leurs formules ne valent que dans un repère **orthonormé**'],
        ['Droite', '$ax+by+c=0$ — comparaison par proportionnalité, jamais terme à terme'],
        [
          'Parallélisme / perpendicularité',
          '$a_1b_2-a_2b_1=0$ / $a_1a_2+b_1b_2=0$ — ou, avec les pentes, $m_1=m_2$ / $m_1m_2=-1$',
        ],
        ["Distance d'un point à une droite", '$\\mathrm{dist}(P\\,;d)=\\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}$'],
        ['Points remarquables', '$G=\\dfrac{A+B+C}{3}$ (médianes), $O$ (médiatrices), $H$ (hauteurs), $I$ (bissectrices)'],
        ["Droite d'Euler", '$O$, $G$, $H$ alignés : $\\overrightarrow{OH}=3\\,\\overrightarrow{OG}$, soit $H=A+B+C-2O$'],
        ['Milieux → sommets', "$A=B'+C'-A'$ (et permutations)"],
        ['Bissectrice', '$\\dfrac{AI}{IC}=\\dfrac{AB}{BC}$ — jamais le milieu, sauf triangle isocèle en $B$'],
        ['Aire variable', '$|K+Mt|=2k$ : deux positions, symétriques par rapport au point où $d$ coupe $(AB)$'],
        ['Symétrique par rapport à une droite', '$Q=2H-P$, $H$ pied de la perpendiculaire'],
        ['Cercle (forme générale)', '$x^2+y^2+Dx+Ey+F=0$ — centre $\\left(-\\dfrac{D}{2}\\,;-\\dfrac{E}{2}\\right)$, rayon $\\sqrt{\\dfrac{D^2}{4}+\\dfrac{E^2}{4}-F}$ ; avec $m(x^2+y^2)$ : cercle, point ou vide'],
        ['Cercle par 2 points, rayon donné', '2 centres si $2r>AB$, 1 si $2r=AB$, aucun si $2r<AB$'],
        ['Cercles inscrit et exinscrits', 'incentre $=\\dfrac{aA+bB+cC}{a+b+c}$ — jamais le centre de gravité ; 4 cercles tangents aux 3 côtés'],
        ['Tangentes depuis un point extérieur', '2, via $\\mathrm{dist}(O\\,;d)=r$ avec $a(x-x_P)+b(y-y_P)=0$ (verticale comprise) ; longueur $\\sqrt{OP^2-r^2}$'],
        ['Démontrer une propriété analytiquement', '4 étapes : repère adapté (sans perdre la généralité), paramètres génériques, traduire, développer'],
        ['Démontrer un lieu', 'les deux inclusions (réciproque comprise), points exclus, lieu complet ou partie'],
        ['Natures fréquentes d’un lieu', 'vide, point, droite(s), demi-droites ou segment, cercle (privé de points), bande, polygone — et d’autres courbes'],
        ['$|x-p|+|y-q|=k$ vs $|x-p|-|y-q|=k$', 'losange borné vs lieu non borné (4 demi-droites)'],
        ['Théorème de la médiane', '$PA^2+PB^2=k$ : seuil $\\dfrac{AB^2}{2}$, 3 régimes cercle/point/vide ; $PA^2-PB^2=k$ : une droite'],
        ["Cercle d'Apollonius", '$PA^2=k\\cdot PB^2$ : $k=1$ → médiatrice ; $k\\neq1$ → cercle centré sur $(AB)$'],
        ['Somme de distances simples', 'seuil $4c$ (carré : vide, carré plein, octogone) ou $d$ (bande) — pas $4c^2$'],
        ['Méthode des génératrices', 'éliminer $\\alpha$, factoriser, trier singulier/parasite/propre, préciser la restriction'],
        ['Lieu paramétrique', 'éliminer $t$ via une identité (ex. astroïde : $|x|^{2/3}+|y|^{2/3}=1$), puis la partie balayée'],
      ],
    },
    forward:
      "Au chapitre 10, tu retrouveras ces méthodes pour les coniques : la parabole, l'ellipse et " +
      "l'hyperbole sont elles aussi des lieux géométriques, définis par une condition de distance à un " +
      'foyer et à une directrice.',
    entrainement: {
      kind: 'entrainement',
      title: 'Lieux géométriques — quiz vrai/faux',
      generatorId: '6gen72',
      description: [
        'Des affirmations vrai/faux réparties par thème, qui reprennent tout ce chapitre. Un ' +
          'seul essai par question — la justification est toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 72. Lieux géométriques — quiz vrai/faux »',
    },
  },
}
