import type { ChapterContent } from '../../types'

export const lieuxGeometriques: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 9,
  title: 'Lieux géométriques',
  slug: 'lieux-geometriques',
  lede:
    "Retrouver un triangle à partir des milieux de ses côtés, construire le cercle qui passe par " +
    "trois points, décrire par une équation l'ensemble des points vérifiant une condition donnée, " +
    "ou suivre la trajectoire du point d'intersection de deux droites mobiles : ce chapitre relie " +
    "l'algèbre des droites (forme implicite $ax+by+c=0$) et des cercles à la question centrale de " +
    'la géométrie analytique — quelle équation caractérise un ensemble de points défini géométriquement ?',

  sections: [
    {
      id: 'points-droites-remarquables',
      number: 1,
      title: 'Points et droites remarquables du triangle',
      kicker: 'toute droite en forme implicite ax+by+c=0 — bissectrice, milieux, aire variable, symétrique',
      blocks: [
        {
          kind: 'para',
          text:
            "Un triangle porte plusieurs points remarquables — pied d'une bissectrice, sommets " +
            "retrouvés depuis leurs milieux, symétrique d'un point — que la géométrie analytique " +
            "retrouve tous par le même outil : une droite écrite sous forme implicite, jamais sous " +
            'forme explicite.',
        },
        {
          kind: 'definition',
          label: 'Repère affine ou orthonormé ?',
          items: [
            'Un repère est dit **orthonormé** quand ses deux axes sont perpendiculaires et munis ' +
              "de la même unité de longueur — le seul type de repère où une distance (Pythagore), " +
              "un angle (produit scalaire) ou une équation de cercle se calculent avec les formules usuelles.",
            'Un repère seulement **affine** (axes quelconques, unités éventuellement différentes) ' +
              'reste valable pour tout ce qui est invariant par affinité — alignement, ' +
              'parallélisme, milieu, barycentre — mais jamais pour une distance, un angle ou un ' +
              "cercle, notions qui n'ont alors plus de sens.",
          ],
        },
        {
          kind: 'astuce',
          text:
            "Avant d'écrire $dist(P;d)=\\ldots$ ou une équation de cercle " +
            '$x^2+y^2+Dx+Ey+F=0$, toujours vérifier que le repère de l\'énoncé est bien annoncé ' +
            '**orthonormé** — tout ce chapitre (cercles, distances, angles) suppose ce repère, sauf ' +
            'mention contraire explicite.',
        },
        {
          kind: 'definition',
          label: 'Convention — toute droite en forme implicite',
          items: [
            "Tout au long de ce chapitre, une droite s'écrit $ax+by+c=0$ — jamais $y=mx+p$. Cette " +
              "forme n'a aucun cas particulier pour une droite verticale, et réduit toute " +
              'intersection de deux droites à un système 2×2.',
            'Comparer deux équations de la même droite se fait par **proportionnalité** du ' +
              'triplet $(a;b;c)$, jamais coefficient par coefficient : $4x+6y-10=0$ et ' +
              '$2x+3y-5=0$ sont la même droite.',
          ],
        },
        {
          kind: 'methode',
          label: 'Vecteur directeur, vecteur normal, rotation de 90°',
          items: [
            'Une droite de vecteur directeur $(d_x;d_y)$ a pour vecteur normal $(-d_y;d_x)$ — la ' +
              'rotation de 90° du directeur, jamais le vecteur recopié tel quel.',
            'Une droite passant par $P(x_0;y_0)$ de normale $(a;b)$ a pour équation ' +
              '$a(x-x_0)+b(y-y_0)=0$.',
          ],
        },
        {
          kind: 'attention',
          label: "Piège classique — parallélisme et perpendicularité ne s'échangent jamais",
          text:
            'Pour deux droites de normales $(a_1;b_1)$ et $(a_2;b_2)$ : $a_1b_2-a_2b_1=0$ ⟺ ' +
            'droites **parallèles** ; $a_1a_2+b_1b_2=0$ ⟺ droites **perpendiculaires**. Confondre ' +
            "les deux critères est l'erreur la plus fréquente de ce chapitre.",
        },
        { kind: 'subheading', text: 'Caractériser une droite par sa pente' },
        {
          kind: 'methode',
          label: 'Pente, parallélisme, perpendicularité, angle',
          items: [
            'Si $b \\neq 0$, la droite $ax+by+c=0$ a pour pente $m=-a/b$ (coefficient directeur).',
            'Parallèles ⟺ $m_1=m_2$ ; perpendiculaires ⟺ $m_1 \\cdot m_2=-1$.',
            'Angle $\\theta$ entre deux droites sécantes de pentes $m_1$, $m_2$ : ' +
              '$\\tan\\theta = \\dfrac{|m_2-m_1|}{1+m_1 m_2}$.',
          ],
        },
        {
          kind: 'attention',
          label: "Piège classique — une droite verticale n'a pas de pente",
          text:
            'Une droite $x=k$ (verticale, $b=0$) n\'a pas de pente définie — toujours traiter ce ' +
            'cas à part (ou raisonner uniquement avec les normales $(a;b)$, qui n\'ont, elles, ' +
            'jamais de cas particulier).',
        },
        { kind: 'subheading', text: "Distance d'un point à une droite" },
        {
          kind: 'definition',
          items: [
            'Dans un repère orthonormé, la distance du point $P(x_P;y_P)$ à la droite ' +
              '$d:ax+by+c=0$ vaut $dist(P;d) = \\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'distance point-droite',
          formula: 'd : $3x-4y+12=0$, P(2 ; −1)',
          steps: [
            { tag: 'numérateur', text: '$|3\\times 2 - 4\\times(-1)+12| = |6+4+12|=22$' },
            { tag: 'dénominateur', text: '$\\sqrt{3^2+4^2}=\\sqrt{25}=5$' },
          ],
          result: {
            tag: 'distance',
            text:
              '$dist(P;d)=22/5=4{,}4$ — pied de la perpendiculaire $H=(-0{,}64;2{,}52)$, ' +
              'vérification $PH=\\sqrt{2{,}64^2+3{,}52^2}=4{,}4$ ✓',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -7,
            xMax: 5,
            yMin: -3,
            yMax: 7,
            vectors: [
              { from: { x: -6, y: -1.5 }, to: { x: 4, y: 6 }, tone: 'ink', arrow: false },
              { from: { x: 2, y: -1 }, to: { x: -0.64, y: 2.52 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 2, y: -1, label: 'P', tone: 'accent', labelPos: 'above' },
              { x: -0.64, y: 2.52, label: 'H', tone: 'ink', labelPos: 'left' },
              { x: 0.9, y: 0.9, label: '4,4', tone: 'accent', node: false },
            ],
            caption:
              'distance de P(2;−1) à la droite d : 3x−4y+12=0, via le pied de la perpendiculaire H — PH=4,4',
          },
        },
        { kind: 'subheading', text: 'Boîte à outils — les 5 questions classiques sur les droites' },
        {
          kind: 'methode',
          label: 'Comment…',
          items: [
            "**Vérifier qu'un point** $M(x;y)$ **appartient à** $d:ax+by+c=0$ **?** → contrôler que $ax+by+c=0$.",
            "**Trouver l'équation de la droite passant par deux points A, B ?** → vecteur " +
              'directeur $\\vec{AB}$, normale = rotation de 90°, puis $a(x-x_A)+b(y-y_A)=0$.',
            '**Trouver l\'intersection de deux droites ?** → résoudre le système 2×2 ; système ' +
              'impossible ⟺ parallèles distinctes, indéterminé ⟺ confondues.',
            '**Vérifier que trois droites sont concourantes ?** → résoudre le système formé par ' +
              'deux d\'entre elles, puis contrôler que le point obtenu vérifie aussi la 3e équation.',
            '**Vérifier que trois points sont alignés ?** → écrire l\'équation de la droite ' +
              "passant par deux d'entre eux, puis contrôler que le 3e la vérifie.",
          ],
        },
        { kind: 'subheading', text: 'Retrouver un triangle à partir des milieux de ses côtés' },
        {
          kind: 'methode',
          items: [
            "Si $A'$, $B'$, $C'$ sont les milieux respectifs de $[BC]$, $[CA]$, $[AB]$, chaque " +
              "sommet se retrouve par $A = B'+C'-A'$ (et permutations circulaires pour B, C).",
          ],
        },
        {
          kind: 'exemple',
          badge: 'milieux → sommets',
          formula: "A'(1;−1), B'(4;1), C'(−1;2)",
          steps: [
            { tag: 'sommet A', text: "$A=B'+C'-A' = (4;1)+(-1;2)-(1;-1) = (2;4)$" },
            { tag: 'sommet B', text: "$B=A'+C'-B' = (-4;0)$" },
            { tag: 'sommet C', text: "$C=A'+B'-C' = (6;-2)$" },
          ],
          result: {
            tag: 'vérification',
            text: "$A'$ doit être le milieu de $[BC]$ : $\\left(\\dfrac{-4+6}{2};\\dfrac{0-2}{2}\\right) = (1;-1)$ ✓",
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -5.5,
            xMax: 7.5,
            yMin: -3.5,
            yMax: 5.5,
            vectors: [
              { from: { x: 2, y: 4 }, to: { x: -4, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: -4, y: 0 }, to: { x: 6, y: -2 }, tone: 'ink', arrow: false },
              { from: { x: 6, y: -2 }, to: { x: 2, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 4, y: 1 }, to: { x: 2, y: 4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -1, y: 2 }, to: { x: 2, y: 4 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 2, y: 4, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: -4, y: 0, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 6, y: -2, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 1, y: -1, label: "A'", tone: 'accent', labelPos: 'below' },
              { x: 4, y: 1, label: "B'", tone: 'accent', labelPos: 'above' },
              { x: -1, y: 2, label: "C'", tone: 'accent', labelPos: 'left' },
            ],
            caption:
              "triangle ABC retrouvé à partir de ses 3 milieux A', B', C' — la relation A=B'+C'−A' se lit comme un parallélogramme A'B'AC'",
          },
        },
        { kind: 'subheading', text: "Point d'une bissectrice — théorème de la bissectrice" },
        {
          kind: 'definition',
          items: [
            'La bissectrice issue de B coupe le côté opposé $[AC]$ en un point $I$ tel que ' +
              '$AI/IC = AB/BC$ — jamais au milieu de $[AC]$, sauf triangle isocèle en B.',
            '$I = \\dfrac{BC \\times A + AB \\times C}{AB+BC}$',
          ],
        },
        {
          kind: 'exemple',
          badge: 'bissectrice',
          formula: 'B(0;0), A(3;4), C(0;4)',
          steps: [
            { tag: 'longueurs', text: '$AB=\\sqrt{3^2+4^2}=5$ (triplet 3-4-5), $BC=4$' },
            { tag: 'rapport', text: 'théorème de la bissectrice : $AI/IC=5/4$' },
            { tag: 'point I', text: '$I = \\dfrac{4\\times(3;4)+5\\times(0;4)}{4+5} = \\dfrac{(12;36)}{9}$' },
          ],
          result: { tag: 'I', text: '$I = \\left(\\dfrac{4}{3};4\\right)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1,
            xMax: 4,
            yMin: -1,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 4 }, to: { x: 0, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 4 / 3, y: 4 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 4, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'left' },
              { x: 4 / 3, y: 4, label: 'I', tone: 'accent', labelPos: 'below' },
            ],
            caption: "triangle ABC avec la bissectrice issue de B coupant [AC] en I, tel que AI/IC=AB/BC",
          },
        },
        {
          kind: 'attention',
          label: 'Piège classique — bissectrice ≠ médiane',
          text:
            'Prendre le milieu de $[AC]$ — soit $(3/2;4)$ — à la place de $I=(4/3;4)$ confond la ' +
            'bissectrice avec la médiane : ces deux droites ne coïncident que si le triangle est ' +
            'isocèle en B (ici $AB=5 \\neq 4=BC$, donc jamais).',
        },
        { kind: 'subheading', text: 'Aire variable — un point qui parcourt une droite' },
        {
          kind: 'methode',
          items: [
            'Si $C(t)=P_0+t\\cdot\\vec{dir}$ parcourt une droite $d$ (non parallèle à $(AB)$), ' +
              "l'aire du triangle $ABC(t)$ vaut $\\tfrac12|K+M\\cdot t|$ — une valeur absolue, donc " +
              '$|K+Mt|=2k$ équivaut à $K+Mt=2k$ OU $K+Mt=-2k$ : toujours exactement deux solutions distinctes.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'aire variable',
          formula: 'A(1;1), B(5;1), d : x=3, aire cible k=6',
          steps: [{ tag: 'deux positions', text: '$C_1=(3;4)$ et $C_2=(3;-2)$' }],
          result: {
            tag: 'vérification',
            text:
              "base $AB=4$, hauteur = distance de C à la droite $y=1$ = 3 dans les deux cas, aire " +
              '$=\\dfrac{4\\times3}{2}=6$ ✓ pour les deux',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6.5,
            yMin: -3.5,
            yMax: 5.5,
            vectors: [
              { from: { x: 3, y: -3.5 }, to: { x: 3, y: 5.5 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 1, y: 1 }, to: { x: 5, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: 5, y: 1 }, to: { x: 3, y: 4 }, tone: 'ink', arrow: false },
              { from: { x: 3, y: 4 }, to: { x: 1, y: 1 }, tone: 'ink', arrow: false },
              { from: { x: 5, y: 1 }, to: { x: 3, y: -2 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: -2 }, to: { x: 1, y: 1 }, tone: 'accent', arrow: false },
            ],
            points: [
              { x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 4, label: 'C₁', tone: 'ink', labelPos: 'above' },
              { x: 3, y: -2, label: 'C₂', tone: 'accent', labelPos: 'below' },
            ],
            caption: 'deux positions C₁ et C₂ sur la droite x=3 donnant chacune une aire de 6 pour le triangle ABC',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — ne garder qu'une seule solution",
          text:
            'Répondre uniquement $C=(3;4)$ ignore que $C=(3;-2)$ convient tout autant — la valeur ' +
            'absolue dans la formule de l\'aire garantit toujours deux solutions symétriques par ' +
            'rapport à $(AB)$, jamais une seule, tant que $d$ n\'est ni parallèle à $(AB)$ ni ' +
            'sécante en A ou B.',
        },
        { kind: 'subheading', text: "Symétrique d'un point par rapport à une droite" },
        {
          kind: 'definition',
          items: [
            "Le symétrique $Q$ d'un point $P$ par rapport à une droite $d$ vérifie $Q=2H-P$, où " +
              '$H$ est le pied de la perpendiculaire abaissée de $P$ sur $d$ — $H$ est alors le ' +
              'milieu de $[PQ]$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'symétrique',
          formula: 'd=(AB) avec A(0;0), B(2;1), P(1;5)',
          steps: [
            { tag: 'équation de (AB)', text: '$-x+2y=0$' },
            { tag: 'perpendiculaire par P', text: '$-2x-y+7=0$' },
            { tag: 'intersection', text: '$H=\\left(\\dfrac{14}{5};\\dfrac{7}{5}\\right)$' },
          ],
          result: { tag: 'Q', text: '$Q=2H-P=\\left(\\dfrac{23}{5};\\dfrac{-11}{5}\\right)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 6.5,
            yMin: -3.5,
            yMax: 6.5,
            vectors: [
              { from: { x: -1, y: -0.5 }, to: { x: 5, y: 2.5 }, tone: 'ink', arrow: false },
              { from: { x: 1, y: 5 }, to: { x: 4.6, y: -2.2 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 2, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 5, label: 'P', tone: 'accent', labelPos: 'above' },
              { x: 2.8, y: 1.4, label: 'H', tone: 'ink', labelPos: 'right' },
              { x: 4.6, y: -2.2, label: 'Q', tone: 'accent', labelPos: 'below' },
            ],
            caption:
              'symétrique Q du point P par rapport à la droite (AB) : H, pied de la perpendiculaire, est le milieu de [PQ]',
          },
        },
        {
          kind: 'astuce',
          text:
            "Même si A, B, P ont des coordonnées entières, H a pour dénominateur $a^2+b^2$ (avec " +
            "$(a;b)$ la normale de $(AB)$) — égal à 1 seulement dans des cas très particuliers. " +
            "Ne jamais s'étonner d'un résultat fractionnaire ici, et ne jamais arrondir avant la " +
            'fin du calcul.',
        },
        { kind: 'subheading', text: 'Démontrer une propriété par la géométrie analytique — méthode générale' },
        {
          kind: 'methode',
          label: 'Méthode en 4 étapes',
          items: [
            "Choisir un repère **adapté** à la figure — souvent un sommet à l'origine et un côté " +
              'sur un axe, pour simplifier les calculs sans perdre en généralité.',
            'Traduire les données en coordonnées avec des **paramètres génériques** (des lettres, ' +
              "jamais des nombres fixés) — une propriété prouvée pour des lettres vaut pour tous " +
              "les cas particuliers, alors qu'un exemple numérique n'en prouve qu'un seul.",
            'Traduire la propriété à démontrer en une égalité entre expressions calculées à ' +
              'partir de ces paramètres.',
            'Développer les deux membres et constater qu\'ils coïncident, quels que soient les ' +
              'paramètres.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — les diagonales d'un parallélogramme se coupent en leur milieu",
          blocks: [
            {
              kind: 'para',
              text:
                'Repère choisi : $A(0;0)$, $B(2a;0)$, $D(2b;2c)$ avec a, b, c **quelconques** (le ' +
                'facteur 2 évite toute fraction dans les milieux). Comme ABCD est un ' +
                'parallélogramme, $C=B+D-A=(2a+2b;2c)$.',
            },
            {
              kind: 'para',
              text: 'milieu$[AC] = (a+b;c)$ et milieu$[BD] = (a+b;c)$',
            },
            {
              kind: 'para',
              text:
                'Les deux milieux sont **identiques** pour tout a, b, c — les diagonales $[AC]$ et ' +
                '$[BD]$ se coupent bien toujours en leur milieu commun, quel que soit le ' +
                'parallélogramme choisi.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1,
            xMax: 7,
            yMin: -1,
            yMax: 4,
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
              { x: 3, y: 1.5, label: 'milieu commun', tone: 'accent', labelPos: 'above' },
            ],
            caption:
              'parallélogramme ABCD (a=2, b=1, c=1,5 pour l\'illustration) : les diagonales [AC] et [BD] se coupent en leur milieu commun (3;1,5)',
          },
        },
        {
          kind: 'astuce',
          text:
            'Traiter cet exemple avec des coordonnées numériques fixées (ex. B(4;0), D(2;3)) ne ' +
            'prouverait la propriété que pour ce parallélogramme précis. Garder a, b, c génériques ' +
            'est ce qui transforme un exemple en démonstration.',
        },
        {
          kind: 'entrainement',
          title: 'Points et droites remarquables du triangle',
          generatorId: '6gen54',
          description: [
            "Retrouve un sommet depuis les milieux des côtés, place un point de bissectrice, fais " +
              "varier l'aire d'un triangle ou construis le symétrique d'un point par rapport à une " +
              'droite — toute droite en forme implicite ax+by+c=0.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 54. Points et droites remarquables du triangle »',
        },
      ],
    },

    {
      id: 'cercles',
      number: 2,
      title: 'Cercles',
      kicker: 'x²+y²+Dx+Ey+F=0 ↔ centre (−D/2;−E/2), rayon — 3 points, 2 points+rayon, inscrit, tangentes',
      blocks: [
        {
          kind: 'para',
          text:
            'Un cercle se manipule sous deux formes — générale (utile quand le centre est inconnu) ' +
            'et centre-rayon — et les grands classiques (par 3 points, par 2 points et un rayon, ' +
            'inscrit à un triangle, tangentes depuis un point extérieur) sy ramènent tous.',
        },
        {
          kind: 'definition',
          label: "Deux formes d'équation",
          items: [
            "Un cercle s'écrit soit sous forme **générale** $x^2+y^2+Dx+Ey+F=0$ (utile quand le " +
              'centre est inconnu), soit sous forme **centre-rayon** une fois D, E, F connus : ' +
              'centre $=\\left(-\\dfrac{D}{2};-\\dfrac{E}{2}\\right)$, rayon ' +
              '$=\\sqrt{\\dfrac{D^2}{4}+\\dfrac{E^2}{4}-F}$.',
          ],
        },
        { kind: 'subheading', text: 'Cercle passant par 3 points' },
        {
          kind: 'methode',
          items: [
            'Substituer chaque point dans $x^2+y^2+Dx+Ey+F=0$ donne un système **linéaire** de 3 ' +
              'équations en $(D;E;F)$ — le terme $x^2+y^2$ de chaque point est un nombre connu, ' +
              'passé au second membre. Trois points non alignés déterminent toujours un unique cercle.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cercle par 3 points',
          formula: 'A(5;3), B(−3;−1), C(2;−6)',
          steps: [
            { tag: 'système', text: '$5D+3E+F=-34$ ; $-3D-E+F=-10$ ; $2D-6E+F=-40$' },
            { tag: 'résolution', text: 'par soustractions successives : $D=-4$, $E=2$, $F=-20$' },
          ],
          result: { tag: 'centre et rayon', text: 'centre $=(2;-1)$, rayon $=\\sqrt{4+1+20}=\\sqrt{25}=5$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4.5,
            xMax: 8.5,
            yMin: -7.5,
            yMax: 5.5,
            circle: { cx: 2, cy: -1, r: 5, tone: 'accent' },
            points: [
              { x: 5, y: 3, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: -3, y: -1, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 2, y: -6, label: 'C', tone: 'ink', labelPos: 'below' },
              { x: 2, y: -1, label: 'centre', tone: 'accent', labelPos: 'above' },
            ],
            caption:
              "cercle de centre (2;−1) et rayon 5 passant par A(5;3), B(−3;−1) et C(2;−6) — trois points non alignés déterminent toujours un unique cercle",
          },
        },
        { kind: 'subheading', text: 'Cercle passant par 2 points, rayon donné' },
        {
          kind: 'methode',
          items: [
            'Le centre est nécessairement sur la **médiatrice** de $[AB]$ ; imposer la distance $r$ ' +
              'depuis un point de cette médiatrice donne une équation du second degré : **deux ' +
              'centres possibles**, symétriques par rapport à $(AB)$, dès que $2r>AB$.',
          ],
        },
        {
          kind: 'exemple',
          badge: '2 points, rayon donné',
          formula: 'A(0;0), B(6;0), rayon r=5',
          steps: [
            { tag: 'médiatrice', text: '$x=3$' },
            { tag: 'équation', text: 'un centre $(3;k)$ à distance 5 de A vérifie $9+k^2=25$, donc $k=\\pm4$' },
          ],
          result: { tag: 'deux centres', text: 'centre$_1$ $=(3;4)$ et centre$_2$ $=(3;-4)$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -7,
            xMax: 13,
            yMin: -9.5,
            yMax: 9.5,
            circles: [
              { cx: 3, cy: 4, r: 5, tone: 'accent' },
              { cx: 3, cy: -4, r: 5, tone: 'good' },
            ],
            vectors: [{ from: { x: 3, y: -9.5 }, to: { x: 3, y: 9.5 }, tone: 'faint', dashed: true, arrow: false }],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 6, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 4, label: 'centre₁', tone: 'accent', labelPos: 'above' },
              { x: 3, y: -4, label: 'centre₂', tone: 'good', labelPos: 'below' },
            ],
            caption: '2 cercles de rayon 5 passant par A et B, centres (3;4) et (3;−4), symétriques par rapport à (AB)',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — n'en retenir qu'un seul",
          text:
            'Ne donner que le centre $(3;4)$ ignore que $(3;-4)$ répond tout aussi bien à la ' +
            'question — sauf précision supplémentaire dans l\'énoncé (ex. « au-dessus de (AB) »), ' +
            'les deux solutions doivent toujours être données.',
        },
        { kind: 'subheading', text: 'Cercle inscrit à un triangle' },
        {
          kind: 'definition',
          items: [
            'Avec $a=BC$, $b=CA$, $c=AB$ (côtés **opposés** aux sommets), le centre du cercle ' +
              'inscrit (incentre) est le barycentre pondéré par les côtés opposés : incentre ' +
              '$=\\dfrac{aA+bB+cC}{a+b+c}$, rayon $=\\dfrac{\\text{aire}}{\\text{demi-périmètre}}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cercle inscrit',
          formula: 'triangle rectangle A(0;0), B(3;0), C(0;4)',
          steps: [
            { tag: 'côtés (3-4-5)', text: '$a=BC=5$, $b=CA=4$, $c=AB=3$' },
            { tag: 'incentre', text: '$\\dfrac{5\\times(0;0)+4\\times(3;0)+3\\times(0;4)}{12} = \\dfrac{(12;12)}{12}=(1;1)$' },
          ],
          result: { tag: 'rayon', text: 'aire $=6$, demi-périmètre $=6$, donc rayon $=1$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2,
            xMax: 5,
            yMin: -1.5,
            yMax: 5.5,
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
              { x: 1, y: 1, label: 'I', tone: 'accent', labelPos: 'right' },
            ],
            caption: 'cercle inscrit au triangle rectangle 3-4-5 : centre I(1;1), rayon 1',
          },
        },
        {
          kind: 'attention',
          label: 'Piège classique — incentre ≠ centre de gravité',
          text:
            '$(A+B+C)/3=(1;4/3)$ est le **centre de gravité**, pas l\'incentre — l\'incentre ' +
            'pondère chaque sommet par le côté opposé (a, b, c), une moyenne pondérée, jamais une ' +
            'moyenne simple. Les deux points ne coïncident que pour un triangle équilatéral.',
        },
        { kind: 'subheading', text: "Tangentes à un cercle depuis un point extérieur" },
        {
          kind: 'methode',
          items: [
            'Pour un cercle de centre O et rayon r, et un point P **extérieur** ($OP>r$), il ' +
              'existe toujours **exactement deux** droites tangentes passant par P.',
            'Méthode : écrire une droite générique par P sous forme $a(x-x_P)+b(y-y_P)=0$, imposer ' +
              '$dist(O;d)=r$ — cette condition donne une équation du second degré (en $a/b$ ou en ' +
              'la pente m), dont les deux solutions sont les deux tangentes.',
          ],
        },
        {
          kind: 'astuce',
          text:
            'Par Pythagore dans le triangle rectangle OTP (T = point de contact, $OT \\perp TP$) : ' +
            '$PT=\\sqrt{OP^2-r^2}$ — utile pour vérifier un résultat, ou répondre directement si ' +
            'seule la longueur est demandée.',
        },
        {
          kind: 'exemple',
          badge: 'tangentes depuis un point',
          formula: 'cercle $x^2+y^2=25$, P(0;13)',
          steps: [
            { tag: 'vérification', text: 'centre O(0;0), r=5, $OP=13>5$ donc P est bien extérieur' },
            { tag: 'droite par P', text: '$y=mx+13$, soit $mx-y+13=0$' },
            {
              tag: 'condition dist(O;d)=5',
              text: '$\\dfrac{13}{\\sqrt{m^2+1}}=5 \\Rightarrow m^2=\\dfrac{144}{25} \\Rightarrow m=\\pm\\dfrac{12}{5}$',
            },
          ],
          result: {
            tag: 'tangentes',
            text:
              '$T_1(-60/13;25/13)$ et $T_2(60/13;25/13)$, symétriques par rapport à (OP) ; longueur ' +
              'tangentielle $\\sqrt{13^2-5^2}=12=PT_1=PT_2$',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -8,
            xMax: 8,
            yMin: -2,
            yMax: 14,
            circle: { cx: 0, cy: 0, r: 5, tone: 'faint' },
            vectors: [
              { from: { x: 0, y: 13 }, to: { x: -60 / 13, y: 25 / 13 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 13 }, to: { x: 60 / 13, y: 25 / 13 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 0, y: 13 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 0, y: 13, label: 'P', tone: 'accent', labelPos: 'right' },
              { x: -60 / 13, y: 25 / 13, label: 'T₁', tone: 'ink', labelPos: 'left' },
              { x: 60 / 13, y: 25 / 13, label: 'T₂', tone: 'ink', labelPos: 'right' },
            ],
            caption:
              'depuis P(0;13), 2 tangentes au cercle de centre O et rayon 5, touchant en T₁ et T₂ — longueur PT₁=PT₂=12',
          },
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
      ],
    },

    {
      id: 'lieux-elimination',
      number: 3,
      title: 'Lieux géométriques et élimination de paramètre',
      kicker: 'traduire une condition en (x;y), sans paramètre à éliminer — 7 natures possibles',
      blocks: [
        {
          kind: 'para',
          text:
            'Un lieu géométrique se décrit toujours en traduisant une condition en une équation. ' +
            "Cette section couvre les lieux qui se traduisent directement en (x;y), sans paramètre " +
            "à éliminer — la méthode des génératrices (deux droites mobiles), plus délicate, fait " +
            "l'objet de la section suivante.",
        },
        {
          kind: 'definition',
          label: "7 natures possibles d'un lieu",
          items: [
            "L'ensemble des points vérifiant une condition géométrique donnée (un **lieu**) est " +
              'toujours l\'une de ces natures : vide, un point, une droite, une paire de droites, ' +
              'un cercle, une bande pleine (région, bords compris), ou une forme étendue ' +
              '(polygone). Identifier laquelle exige souvent de distinguer des cas très proches en apparence.',
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode de traduction — sans paramètre',
          items: [
            "Tous les lieux de cette section s'obtiennent par **traduction directe** : la " +
              "condition de l'énoncé (une distance, une somme, un rapport) s'écrit immédiatement " +
              "en (x;y), sans paramètre à éliminer. C'est différent des lieux de la section " +
              'suivante (méthode des **génératrices**, où deux droites mobiles dépendent d\'un ' +
              'paramètre commun α à éliminer) et de ceux donnés par une **représentation ' +
              'paramétrique** ci-dessous (où x et y dépendent séparément d\'un même paramètre, ' +
              'éliminé via une identité).',
          ],
        },
        { kind: 'subheading', text: 'Valeur absolue — somme ou différence, deux natures opposées' },
        {
          kind: 'methode',
          items: [
            'Pour $p=2$, $q=-1$, $k=3$ : $|x-p|+|y-q|=k$ (**somme**) donne un **losange** borné, ' +
              'de sommets obtenus en annulant tour à tour une seule valeur absolue — $(p\\pm k;q)$ ' +
              'et $(p;q\\pm k)$, jamais les 4 combinaisons de signes $(p\\pm k;q\\pm k)$ (qui ' +
              "donneraient les sommets d'un carré ne vérifiant même pas l'équation).",
            '$|x-p|-|y-q|=k$ (**différence**) donne au contraire un lieu **non borné**, 4 demi-droites.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -3,
              xMax: 7,
              yMin: -6,
              yMax: 4,
              vectors: [
                { from: { x: 5, y: -1 }, to: { x: 2, y: 2 }, tone: 'ink', arrow: false },
                { from: { x: 2, y: 2 }, to: { x: -1, y: -1 }, tone: 'ink', arrow: false },
                { from: { x: -1, y: -1 }, to: { x: 2, y: -4 }, tone: 'ink', arrow: false },
                { from: { x: 2, y: -4 }, to: { x: 5, y: -1 }, tone: 'ink', arrow: false },
              ],
              points: [
                { x: 2, y: -1, label: '(2;−1)', tone: 'accent', labelPos: 'above' },
                { x: 5, y: -1, label: '(5;−1)', tone: 'ink', labelPos: 'right' },
                { x: 2, y: 2, label: '(2;2)', tone: 'ink', labelPos: 'above' },
                { x: -1, y: -1, label: '(−1;−1)', tone: 'ink', labelPos: 'left' },
                { x: 2, y: -4, label: '(2;−4)', tone: 'ink', labelPos: 'below' },
              ],
              caption: 'losange $|x-2|+|y+1|=3$ : sommets (5;−1), (2;2), (−1;−1), (2;−4)',
            },
            {
              kind: 'vectorPlane',
              xMin: -6,
              xMax: 11,
              yMin: -6,
              yMax: 5,
              vectors: [
                { from: { x: 5, y: -1 }, to: { x: 9, y: 3 }, tone: 'ink', arrow: false },
                { from: { x: 5, y: -1 }, to: { x: 8, y: -4 }, tone: 'ink', arrow: false },
                { from: { x: -1, y: -1 }, to: { x: -4, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: -1, y: -1 }, to: { x: -4, y: -4 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 5, y: -1, label: '(5;−1)', tone: 'ink', labelPos: 'above' },
                { x: -1, y: -1, label: '(−1;−1)', tone: 'accent', labelPos: 'above' },
              ],
              caption: 'lieu non borné $|x-2|-|y+1|=3$ : 4 demi-droites partant de (5;−1) et (−1;−1)',
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — sommets du losange',
          text:
            "Répondre $(5;2)$, $(5;-4)$, $(-1;2)$, $(-1;-4)$ (les 4 combinaisons $p\\pm k$, " +
            "$q\\pm k$) est faux : ces 4 points sont les sommets d'un **carré** qui ne vérifie pas " +
            "l'équation. Un seul terme s'annule à la fois — les vrais sommets sont $(p+k;q)$, " +
            '$(p-k;q)$, $(p;q+k)$, $(p;q-k)$.',
        },
        { kind: 'subheading', text: 'Somme de carrés de distances — le théorème de la médiane' },
        {
          kind: 'definition',
          items: [
            'Pour M milieu de $[AB]$ : $PA^2+PB^2 = 2\\times PM^2 + AB^2/2$. Le lieu $PA^2+PB^2=k$ ' +
              'a donc toujours un seuil $AB^2/2$, avec trois régimes stricts : $k>$seuil → cercle ' +
              'centré M ; $k=$seuil → le point M seul ; $k<$seuil → vide.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'théorème de la médiane',
          formula: 'A(2;−2), B(−4;4)',
          steps: [{ tag: 'seuil', text: '$AB^2=(-6)^2+6^2=72$, seuil $=36$' }],
          result: { tag: 'k=54>36', text: 'cercle de centre $M=(-1;1)$ et de rayon $\\sqrt{(54-36)/2}=3$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6,
            xMax: 4,
            yMin: -4,
            yMax: 6,
            circle: { cx: -1, cy: 1, r: 3, tone: 'accent' },
            vectors: [{ from: { x: 2, y: -2 }, to: { x: -4, y: 4 }, tone: 'faint', dashed: true, arrow: false }],
            points: [
              { x: 2, y: -2, label: 'A', tone: 'ink', labelPos: 'right' },
              { x: -4, y: 4, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: -1, y: 1, label: 'M', tone: 'accent', labelPos: 'above' },
            ],
            caption: '$PA^2+PB^2=54>36=$ seuil : cercle de centre M(−1;1) et de rayon 3',
          },
        },
        {
          kind: 'astuce',
          text:
            'Au seuil exact, le lieu n\'est pas un « tout petit cercle » mais **exactement** le ' +
            'point M, rayon nul — et strictement en dessous du seuil, le lieu est réellement ' +
            '**vide** (aucune tolérance). Ces trois régimes ne se mélangent jamais.',
        },
        { kind: 'subheading', text: "Cercle d'Apollonius" },
        {
          kind: 'definition',
          items: [
            'Pour $A(-a;0)$, $B(a;0)$, le lieu $PA^2=k\\times PB^2$ est : si $k=1$, la ' +
              '**médiatrice** de $[AB]$ (traitement à part, jamais une limite numérique de la ' +
              'formule générale) ; si $k \\neq 1$, un **cercle** centré sur l\'axe (AB).',
          ],
        },
        {
          kind: 'exemple',
          badge: "cercle d'Apollonius",
          formula: 'A(−3;0), B(3;0), k=4',
          steps: [{ tag: 'triplet pythagoricien (3,4,5)', text: 'centre en $x_0=5$, rayon 4' }],
          result: { tag: 'équation', text: '$(x-5)^2+y^2 = 16$' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -5,
            xMax: 11,
            yMin: -7.5,
            yMax: 7.5,
            circle: { cx: 5, cy: 0, r: 4, tone: 'accent' },
            vectors: [{ from: { x: 0, y: -7 }, to: { x: 0, y: 7 }, tone: 'good', dashed: true, arrow: false }],
            points: [
              { x: -3, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 5, y: 0, label: 'centre (k=4)', tone: 'accent', labelPos: 'above' },
              { x: 0, y: 6.5, label: 'médiatrice (k=1)', tone: 'good', node: false, labelPos: 'right' },
            ],
            caption: "cercle d'Apollonius pour k=4 (centre (5;0), rayon 4) et médiatrice pour k=1 (x=0, en pointillé)",
          },
        },
        { kind: 'subheading', text: 'Somme de distances simples — un seuil différent' },
        {
          kind: 'attention',
          label: 'Piège classique — 4c au lieu de 4c²',
          text:
            'Pour un carré $[-c;c]^2$ : le seuil de la somme des **carrés** des distances aux 4 ' +
            'côtés vaut $4c^2$ (comme le théorème de la médiane ci-dessus) ; le seuil de la somme ' +
            'des distances **simples** (non élevées au carré) vaut $4c$ — ne jamais confondre ces ' +
            'deux formules qui se ressemblent.',
        },
        {
          kind: 'exemple',
          badge: 'somme de distances simples',
          formula: 'deux droites parallèles x=0 et x=d (d=5)',
          steps: [{ tag: 'observation', text: '$|x|+|x-d|$ vaut exactement d sur toute la bande $[0;d]$ (pas seulement en un point)' }],
          result: {
            tag: 'k=5=d vs k=8>d',
            text:
              'pour $k=d=5$, le lieu est la bande **pleine** ; pour $k=8>d$, le lieu devient 2 ' +
              'droites, $x=(d-k)/2=-1{,}5$ et $x=(d+k)/2=6{,}5$',
          },
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -3,
              xMax: 8,
              yMin: -3,
              yMax: 3,
              vectors: [
                { from: { x: 0, y: -3 }, to: { x: 0, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 5, y: -3 }, to: { x: 5, y: 3 }, tone: 'accent', arrow: false },
              ],
              points: [{ x: 2.5, y: 0, label: '[0;5]', tone: 'accent', node: false, labelPos: 'above' }],
              caption:
                "k=5=d : toute la bande [0;5], bords compris, vérifie l'équation — non représentée en teinte pleine ici (vectorPlane ne trace pas de région ombrée), seules les deux droites bornes sont tracées",
            },
            {
              kind: 'vectorPlane',
              xMin: -3,
              xMax: 8,
              yMin: -3,
              yMax: 3,
              vectors: [
                { from: { x: 0, y: -3 }, to: { x: 0, y: 3 }, tone: 'faint', arrow: false },
                { from: { x: 5, y: -3 }, to: { x: 5, y: 3 }, tone: 'faint', arrow: false },
                { from: { x: -1.5, y: -3 }, to: { x: -1.5, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 6.5, y: -3 }, to: { x: 6.5, y: 3 }, tone: 'accent', arrow: false },
              ],
              points: [{ x: 2.5, y: 0, label: 'k=8>d', tone: 'accent', node: false, labelPos: 'above' }],
              caption:
                "k=8>d : le lieu devient 2 droites, x=−1,5 et x=6,5 — les 2 droites d'origine (x=0 et x=5) restent en fond, en gris",
            },
          ],
        },
        { kind: 'subheading', text: 'Lieu défini par une représentation paramétrique' },
        {
          kind: 'definition',
          items: [
            'Un lieu peut être donné directement par deux équations $x=f(t)$, $y=g(t)$ (une ' +
              '**représentation paramétrique**), plutôt que par une seule condition géométrique. ' +
              'Pour retrouver l\'équation cartésienne du lieu, on élimine t entre les deux ' +
              'équations — le plus souvent via une **identité** qui relie f et g (par exemple ' +
              '$\\cos^2 t+\\sin^2 t=1$).',
          ],
        },
        {
          kind: 'exemple',
          badge: "l'astroïde",
          formula: '$x=\\cos^3\\lambda$, $y=\\sin^3\\lambda$',
          steps: [
            { tag: 'isoler', text: 'on prend la racine cubique de chaque équation pour isoler $\\cos\\lambda$ et $\\sin\\lambda$' },
            { tag: 'identité', text: '$x^{2/3}+y^{2/3} = \\cos^2\\lambda+\\sin^2\\lambda = 1$' },
          ],
          result: {
            tag: 'astroïde',
            text:
              'courbe fermée, à 4 « pointes » sur les axes en $(\\pm1;0)$ et $(0;\\pm1)$ ; la ' +
              'restriction $\\lambda \\in [0;2\\pi[$ balaie la courbe entière une seule fois',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 1.5,
            yMin: -1.4,
            yMax: 1.4,
            curves: [
              { fn: (x) => Math.pow(1 - Math.pow(Math.abs(x), 2 / 3), 1.5), tone: 'ink', xMin: -1, xMax: 1 },
              { fn: (x) => -Math.pow(1 - Math.pow(Math.abs(x), 2 / 3), 1.5), tone: 'ink', xMin: -1, xMax: 1 },
            ],
            points: [
              { x: 1, y: 0, label: '(1;0)', tone: 'ink', labelPos: 'right' },
              { x: -1, y: 0, label: '(−1;0)', tone: 'ink', labelPos: 'left' },
              { x: 0, y: 1, label: '(0;1)', tone: 'ink', labelPos: 'above' },
              { x: 0, y: -1, label: '(0;−1)', tone: 'ink', labelPos: 'below' },
            ],
            caption: "astroïde $x=\\cos^3\\lambda$, $y=\\sin^3\\lambda$, d'équation cartésienne $x^{2/3}+y^{2/3}=1$",
          },
        },
        {
          kind: 'astuce',
          text:
            'Pour contrôler un résultat, choisir une valeur simple de λ (ex. $\\lambda=\\pi/2$ ' +
            'donne $\\cos\\lambda=0$, $\\sin\\lambda=1$, donc le point (0;1)) et vérifier qu\'il ' +
            "satisfait bien l'équation cartésienne obtenue — un contrôle rapide qui ne demande " +
            'aucun nouveau calcul.',
        },
        {
          kind: 'entrainement',
          title: 'Lieux géométriques et élimination de paramètre',
          generatorId: '6gen56',
          description: [
            'Traduis une condition géométrique (valeur absolue, somme de carrés de distances, ' +
              'rapport de distances, représentation paramétrique) directement en équation, sans ' +
              'paramètre à éliminer.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 56. Lieux géométriques et élimination de paramètre »',
        },
      ],
    },

    {
      id: 'methode-generatrices',
      number: 4,
      title: 'Problèmes de lieux : méthode des génératrices',
      kicker: 'deux droites mobiles, un paramètre commun α — éliminer, factoriser, trier singulier/parasite/propre',
      blocks: [
        {
          kind: 'para',
          text:
            "Certains lieux ne se traduisent pas directement : le point cherché est l'intersection " +
            "de deux droites qui bougent ensemble, pilotées par un même paramètre. Il faut alors " +
            "éliminer ce paramètre pour faire apparaître l'équation du lieu.",
        },
        {
          kind: 'definition',
          label: 'Méthode des génératrices',
          items: [
            'Un point mobile est parfois défini comme l\'intersection de deux droites qui ' +
              "dépendent toutes deux d'un même paramètre α — les **génératrices**.",
            "La méthode : (1) écrire les deux équations en fonction de α ; (2) **éliminer** α " +
              'entre les deux pour obtenir une équation brute en (x;y) ; (3) factoriser ; (4) ' +
              'trier chaque morceau : **singulier** (les deux génératrices coïncident pour un α ' +
              "précis), **parasite** (solution algébrique qu'aucune valeur de α n'atteint), ou " +
              '**propre** (fait réellement partie du lieu) ; (5) préciser la **restriction** — la ' +
              'portion réellement balayée quand α parcourt son domaine.',
          ],
        },
        {
          kind: 'attention',
          label: 'Piège classique — chercher un parasite « par réflexe »',
          text:
            "Tous les problèmes de génératrices n'ont pas les 3 morceaux : certains n'ont aucun " +
            "parasite, d'autres aucun singulier. Le statut de chaque morceau se lit sur la " +
            'configuration géométrique réelle, jamais par habitude — vérifier à chaque fois ' +
            'plutôt que supposer.',
        },
        { kind: 'subheading', text: 'Exemple résolu en détail — un parallélogramme' },
        {
          kind: 'exempleLibre',
          label: 'A(0;0), B(4;0), D(0;6), C(4;6) — Z(0;α)∈[AD], Y(4;α)∈[BC]',
          blocks: [
            {
              kind: 'para',
              text:
                'Génératrices : droite (AY) → $\\alpha x - 4y=0$ ; droite (BZ) → ' +
                '$\\alpha(x-4)+4y=0$. En éliminant α (produit croisé) puis en factorisant : ' +
                '$y(2x-4)=0$.',
            },
            {
              kind: 'para',
              text:
                'Morceau $y=0$ (pour $\\alpha=0$, les deux génératrices coïncident) : ' +
                '**singulier**. Morceau $x=2$ : **propre** — remarquer qu\'il ne dépend pas de la ' +
                'hauteur 6, seulement de la largeur ($x=b/2$).',
            },
            {
              kind: 'para',
              text:
                'Restriction : pour $\\alpha \\in \\,]0;6[$, le point d\'intersection est ' +
                '$(2;\\alpha/2)$ — un **segment ouvert** entre le milieu de $[AB]$, soit (2;0), et ' +
                'le centre du parallélogramme, soit (2;3).',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 5.5,
            yMin: -1.5,
            yMax: 7.5,
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
              { x: 2, y: 0.5, tone: 'accent', node: true },
              { x: 2, y: 1.5, tone: 'accent', node: true },
              { x: 2, y: 2.5, tone: 'accent', node: true },
              { x: 2, y: 3, label: '(2;3)', tone: 'accent', labelPos: 'above' },
              { x: 2, y: 0, label: '(2;0)', tone: 'accent', labelPos: 'below' },
            ],
            caption:
              '3 positions de α (1, 3, 5) : les droites (AY) et (BZ) se coupent toujours sur x=2 — le lieu est le segment ouvert entre (2;0) et (2;3)',
          },
        },
        {
          kind: 'astuce',
          text:
            "Ici, $x=2$ ne dépend pas de la hauteur du parallélogramme — seule la **restriction** " +
            '(le segment réellement balayé, qui va jusqu\'à y=3) en dépend. Toujours distinguer ' +
            "l'équation du lieu de sa restriction : décrire un lieu sans restriction est une " +
            'réponse incomplète.',
        },
        { kind: 'subheading', text: "Une médiane qui émerge d'une famille de céviennes" },
        {
          kind: 'exempleLibre',
          label: 'A(0;4), B(0;0), C(6;0) — droite parallèle à (BC) à hauteur α',
          blocks: [
            {
              kind: 'para',
              text:
                'Pour chaque hauteur α, la parallèle à (BC) coupe $[AB]$ en D et $[AC]$ en E ; le ' +
                'lieu de $(BE)\\cap(CD)$, une fois α éliminé et factorisé, donne un morceau ' +
                'singulier $y=0$ et un morceau propre $4x+3y-12=0$.',
            },
            {
              kind: 'para',
              text:
                'Vérification : cette droite passe par A(0;4) et par le milieu de $[BC]$, (3;0) — ' +
                "c'est très exactement la **médiane** issue de A, qui émerge comme lieu " +
                'd\'intersection sans jamais être postulée au départ.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1.5,
            xMax: 7.5,
            yMin: -1.5,
            yMax: 5.5,
            vectors: [
              { from: { x: 0, y: 4 }, to: { x: 0, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 0, y: 4 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 4 }, to: { x: 3, y: 0 }, tone: 'accent', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 0, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 1.8, y: 2.4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 0, y: 2.4 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 4, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: 0, y: 0, label: 'B', tone: 'ink', labelPos: 'left' },
              { x: 6, y: 0, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 0, label: 'milieu BC', tone: 'ink', labelPos: 'below' },
              { x: 0.75, y: 3, tone: 'accent', node: true },
              { x: 1.8, y: 1.6, tone: 'accent', node: true },
            ],
            caption:
              'pour 2 hauteurs de la parallèle à (BC), les céviennes (BE) et (CD) se coupent toujours sur la médiane issue de A',
          },
        },
        { kind: 'subheading', text: 'Un point du lieu jamais atteint — le piège du parasite' },
        {
          kind: 'exempleLibre',
          label: "A(3;0), B(−2;0), C(0;α) sur l'axe des ordonnées",
          blocks: [
            {
              kind: 'para',
              text:
                'Les deux génératrices (perpendiculaires à (AC) par A, à (BC) par B) s\'éliminent ' +
                'directement en $x=1$.',
            },
            {
              kind: 'para',
              text:
                "Un seul morceau, entièrement **propre** — mais le point (1;0) lui-même n'est " +
                'jamais atteint : il faudrait α infini pour l\'obtenir. Un point **parasite** peut ' +
                "donc exister même quand l'équation factorisée n'a qu'un seul morceau, entièrement " +
                'propre par ailleurs.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4,
            xMax: 5,
            yMin: -5,
            yMax: 4,
            vectors: [
              { from: { x: 1, y: -5 }, to: { x: 1, y: 4 }, tone: 'accent', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 0, y: 2 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -2, y: 0 }, to: { x: 0, y: 2 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 3, y: 0 }, to: { x: 0, y: -3 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -2, y: 0 }, to: { x: 0, y: -3 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 3, y: 0, label: 'A', tone: 'ink', labelPos: 'above' },
              { x: -2, y: 0, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 0, y: 2, tone: 'ink', node: true },
              { x: 0, y: -3, tone: 'ink', node: true },
              { x: 1, y: -3, tone: 'accent', node: true },
              { x: 1, y: 2, tone: 'accent', node: true },
              { x: 1, y: 0, label: '(1;0) exclu', tone: 'bad', labelPos: 'below' },
            ],
            caption:
              'pour 2 positions de C, les perpendiculaires se coupent toujours sur x=1 — mais jamais exactement au point (1;0) (en rouge), qui exigerait α infini',
          },
        },
        {
          kind: 'attention',
          label: "Piège classique — la technique d'élimination ne se généralise jamais automatiquement",
          text:
            'Le produit croisé (utile quand les deux génératrices ont des coefficients de α ' +
            'différents), la soustraction directe (quand elles partagent le même coefficient) et ' +
            'la substitution (quand un angle double $\\tan(2\\alpha)$ intervient) ne sont pas ' +
            "interchangeables — appliquer aveuglément la même technique d'une configuration à " +
            "l'autre peut introduire un facteur parasite en trop.",
        },
        {
          kind: 'entrainement',
          title: 'Problèmes de lieux : méthode des génératrices',
          generatorId: '6gen57',
          description: [
            "Élimine le paramètre commun à deux droites mobiles, factorise, puis trie " +
              "singulier / parasite / propre pour décrire le lieu de leur point d'intersection.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 57. Problèmes de lieux : méthode des génératrices »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Repère affine / orthonormé', 'distance, angle, cercle : uniquement valables dans un repère **orthonormé**'],
        ['Droite', '$ax+by+c=0$ — comparaison par proportionnalité, jamais terme à terme'],
        [
          'Parallélisme / perpendicularité',
          '$a_1b_2-a_2b_1=0$ / $a_1a_2+b_1b_2=0$ — ou, avec les pentes, $m_1=m_2$ / $m_1m_2=-1$',
        ],
        ["Distance d'un point à une droite", '$dist(P;d)=|ax_P+by_P+c|/\\sqrt{a^2+b^2}$'],
        ['Milieux → sommets', "$A=B'+C'-A'$ (et permutations)"],
        ['Bissectrice', '$AI/IC=AB/BC$ — jamais le milieu, sauf triangle isocèle en B'],
        ['Symétrique par rapport à une droite', '$Q=2H-P$, H pied de la perpendiculaire'],
        ['Démontrer une propriété analytiquement', '4 étapes : repère adapté, paramètres génériques, traduire, développer les deux membres'],
        ['Cercle (forme générale)', '$x^2+y^2+Dx+Ey+F=0$ — centre $(-D/2;-E/2)$, rayon $\\sqrt{D^2/4+E^2/4-F}$'],
        ['Cercle par 2 points, rayon donné', 'toujours 2 centres possibles, symétriques par rapport à la droite'],
        ['Cercle inscrit', 'incentre $=(aA+bB+cC)/(a+b+c)$ — jamais le centre de gravité'],
        ['Tangentes depuis un point extérieur', 'toujours 2, via $dist(O;d)=r$ ; longueur $=\\sqrt{OP^2-r^2}$'],
        ["7 natures d'un lieu", 'vide, point, droite, paire de droites, cercle, bande pleine, forme étendue'],
        ['$|x-p|+|y-q|=k$ vs $|x-p|-|y-q|=k$', 'losange borné vs lieu non borné (4 demi-droites)'],
        ['Théorème de la médiane', '$PA^2+PB^2=k$ : seuil $AB^2/2$, 3 régimes cercle/point/vide'],
        ["Cercle d'Apollonius", '$PA^2=k\\cdot PB^2$ : k=1 → médiatrice ; k≠1 → cercle'],
        ['Lieu paramétrique', 'éliminer t via une identité (ex. astroïde : $x^{2/3}+y^{2/3}=1$)'],
        ['Méthode des génératrices', 'éliminer α, factoriser, trier singulier/parasite/propre, préciser la restriction'],
      ],
    },
    forward:
      "Le lien entre une figure et son équation, construit ici pour des droites et des cercles, " +
      "se retrouvera à l'identique en géométrie de l'espace — avec une troisième coordonnée en " +
      'plus.',
    entrainement: {
      kind: 'entrainement',
      title: 'Lieux géométriques — quiz vrai/faux',
      generatorId: '6gen72',
      description: [
        'Affirmations vrai/faux réparties par thème qui reprennent tout ce chapitre. Un seul essai ' +
          'par question, la justification est toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 72. Lieux géométriques — quiz vrai/faux »',
    },
  },
}
