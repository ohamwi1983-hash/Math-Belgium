import type { ChapterContent } from '../../types'

// Excès de sécurité systématique pour toute expression sous une racine construite à partir d'une
// relation foyer-directrice ou d'une équation implicite (ellipse/hyperbole/parabole) : le
// sur-échantillonnage de VectorPlane (60 points par courbe) peut tomber tout près d'une borne de
// domaine où l'expression vaut 0 à l'erreur d'arrondi flottant près — sans ce garde-fou, un sqrt
// d'un nombre infinitésimalement négatif produit NaN et casse le tracé du path SVG.
const r = (x: number) => Math.sqrt(Math.max(0, x))

export const coniques: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 10,
  title: 'Les coniques',
  slug: 'coniques',
  lede:
    "Une parabole, une ellipse et une hyperbole ne sont pas trois courbes sans rapport : ce sont les trois sections planes d'un même cône, et les trois lieux d'un même énoncé — le rapport entre la distance à un point (le **foyer**) et la distance à une droite (la **directrice**) y vaut une constante $e$, l'**excentricité**. Ce chapitre construit leurs équations, apprend à les reconnaître derrière une équation générale $mx^2+ny^2+qxy+rx+sy+t=0$, à les couper par une droite, à leur mener une tangente — et à comprendre pourquoi un miroir parabolique concentre la lumière en un point.",
  sections: [
    {
      id: 'identifier',
      number: 1,
      title: 'Identifier et caractériser une conique',
      kicker: 'Parabole, ellipse, hyperbole : trois lieux, une même structure de section.',
      blocks: [
        {
          kind: 'para',
          text:
            "Les trois coniques se définissent chacune par une condition de distance, se construisent point par point à la règle et au compas, et admettent une équation cartésienne **simple** à la seule condition de choisir le bon repère. Cette section parcourt les trois, dans le même ordre à chaque fois : définition → construction → équation → caractéristiques → importance du repère.",
        },
        { kind: 'subheading', text: 'A. La parabole' },
        {
          kind: 'definition',
          label: 'Définition — la parabole',
          items: [
            "On appelle **parabole** le lieu des points du plan situés à égale distance d'une droite (la **directrice** de la parabole) et d'un point n'appartenant pas à cette droite (le **foyer** de la parabole).",
            'On note $F$ le foyer, $d$ la directrice, et $p = \\text{dist}(F;d) > 0$ — ce nombre $p$ est le **paramètre** de la parabole.',
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode — construire la parabole point par point',
          items: [
            "Les points $A$ et $B$ de la parabole situés à distance $r$ de $F$ et de $d$ se trouvent à la fois sur le cercle de centre $F$ et de rayon $r$, et sur une parallèle à $d$ située à distance $r$ de $d$, du même côté que $F$.",
            "(1) choisir un réel $r \\geq p/2$ ; (2) tracer le cercle de centre $F$ et de rayon $r$, ainsi que la parallèle à $d$ à distance $r$ ; (3) marquer le(s) point(s) d'intersection de ces deux objets ; (4) recommencer (2) et (3) pour d'autres valeurs $r \\geq p/2$.",
          ],
        },
        {
          kind: 'piege',
          label: 'La borne r ≥ p/2 n\'est pas décorative',
          text:
            'Pour $r < p/2$ le cercle et la parallèle ne se coupent **pas** : aucun point de la parabole n\'est plus proche de $F$ que $p/2$. Pour $r = p/2$ exactement, il n\'y a qu\'**un** point (le sommet) ; pour $r > p/2$, il y en a exactement **deux**, symétriques par rapport à l\'axe focal.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2, xMax: 6, yMin: -3.75, yMax: 3.75,
            showAxes: true,
            curvesOfY: [{ fn: (y) => (y * y) / 4, tone: 'accent' }],
            vectors: [
              { from: { x: -1, y: -3.75 }, to: { x: -1, y: 3.75 }, tone: 'ink', dashed: true },
              { from: { x: 2.25, y: 3 }, to: { x: 1, y: 0 }, tone: 'accent', dashed: true },
              { from: { x: 2.25, y: 3 }, to: { x: -1, y: 3 }, tone: 'accent', dashed: true },
            ],
            points: [
              { x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: 2.25, y: 3, label: 'P', tone: 'ink', labelPos: 'right' },
              { x: -1, y: -3.3, label: 'd', tone: 'ink', node: false, labelPos: 'below' },
            ],
            caption:
              'Parabole de foyer F(1;0) et de directrice d ≡ x=−1 (donc p=2, équation y²=4x). Pour tout point P de la courbe, |PF| = dist(P;d) — ici 3,25 dans les deux cas.',
          },
        },
        { kind: 'subheading', text: 'Équation cartésienne de la parabole' },
        {
          kind: 'para',
          text:
            "Le repère se choisit **orthonormé**, avec l'axe des abscisses perpendiculaire à $d$ et passant par $F$, et l'axe des ordonnées parallèle à $d$ et à égale distance de $F$ et de $d$. Alors $F(p/2 ; 0)$ et $d \\equiv x = -p/2$.",
        },
        {
          kind: 'exemple',
          badge: "Démonstration — de la définition à l'équation",
          steps: [
            { tag: 'point du lieu', text: '$P(x;y) \\in \\mathcal{P}$' },
            { tag: 'définition', text: '$\\iff |FP| = \\text{dist}(P;d)$' },
            { tag: 'distances en coordonnées', text: '$\\iff \\sqrt{(x-p/2)^2+y^2} = |x+p/2|$' },
            { tag: 'élévation au carré (2 membres positifs)', text: '$\\iff (x-p/2)^2+y^2 = (x+p/2)^2$' },
            { tag: 'développement', text: '$\\iff x^2-px+p^2/4+y^2 = x^2+px+p^2/4$' },
          ],
          result: { tag: 'simplification', text: '$y^2 = 2px$' },
        },
        {
          kind: 'para',
          text:
            "Il est également possible d'obtenir cette équation par la **méthode des génératrices** : les points de la parabole sont alors obtenus comme intersections de droites et de cercles variables, et le paramètre de construction $r$ est éliminé entre les deux équations.",
        },
        {
          kind: 'definition',
          label: 'À retenir — équation cartésienne de la parabole',
          items: [
            'La parabole $\\mathcal{P}$ de foyer $F(\\frac{p}{2} ; 0)$ et de directrice $d \\equiv x = -\\frac{p}{2}$ a pour équation : $y^2 = 2px$',
          ],
        },
        { kind: 'subheading', text: 'Caractéristiques de la parabole' },
        {
          kind: 'para',
          text:
            'En transformant l\'équation : $y^2 = 2px \\iff y = \\pm\\sqrt{2px}$. La parabole est donc l\'union du graphique de la fonction $f(x) = \\sqrt{2px}$ et de son symétrique par rapport à l\'axe des abscisses. L\'étude de $f$ donne :',
        },
        {
          kind: 'methode',
          label: 'Étude de la fonction associée',
          items: [
            '$\\text{dom}\\,f = [0 ; +\\infty[$',
            'pas d\'asymptote, car $\\lim_{x\\to+\\infty} f(x) = +\\infty$ et $\\lim_{x\\to+\\infty} \\frac{f(x)}{x} = 0$',
            'dérivée première : $\\forall x \\in \\,]0;+\\infty[$, $f\'(x) = \\frac{p}{\\sqrt{2px}} > 0$ — $f$ est strictement croissante',
            'dérivée seconde : $\\forall x \\in \\,]0;+\\infty[$, $f\'\'(x) = \\frac{-p^2}{\\sqrt{(2px)^3}} < 0$ — $f$ est concave',
          ],
        },
        {
          kind: 'definition',
          label: 'Vocabulaire — axe focal et sommet',
          items: [
            'La parabole possède **un** axe de symétrie, passant par le foyer et perpendiculaire à la directrice : c\'est l\'**axe focal**. Le point d\'intersection entre la parabole et son axe de symétrie est le **sommet** de la parabole : c\'est le point de la parabole le plus proche du foyer et de la directrice (à distance $p/2$ de chacun).',
          ],
        },
        { kind: 'subheading', text: 'Importance du choix du repère' },
        {
          kind: 'para',
          text:
            "L'équation de la parabole est la plus simple dans un repère dont l'origine est le **sommet** et dont un des axes est l'**axe focal**. Selon l'orientation choisie, quatre équations apparaissent :",
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curvesOfY: [{ fn: (y) => (y * y) / 4, tone: 'accent' }],
              vectors: [{ from: { x: -1, y: -2.25 }, to: { x: -1, y: 2.25 }, tone: 'ink', dashed: true }],
              points: [{ x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' }],
              caption: 'F(p/2;0), d ≡ x=−p/2 → y² = 2px',
            },
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curvesOfY: [{ fn: (y) => -(y * y) / 4, tone: 'accent' }],
              vectors: [{ from: { x: 1, y: -2.25 }, to: { x: 1, y: 2.25 }, tone: 'ink', dashed: true }],
              points: [{ x: -1, y: 0, label: 'F', tone: 'good', labelPos: 'below' }],
              caption: 'F(−p/2;0), d ≡ x=p/2 → y² = −2px',
            },
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curves: [{ fn: (x) => (x * x) / 4, tone: 'accent' }],
              vectors: [{ from: { x: -2.4, y: -1 }, to: { x: 2.4, y: -1 }, tone: 'ink', dashed: true }],
              points: [{ x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'right' }],
              caption: 'F(0;p/2), d ≡ y=−p/2 → x² = 2py',
            },
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curves: [{ fn: (x) => -(x * x) / 4, tone: 'accent' }],
              vectors: [{ from: { x: -2.4, y: 1 }, to: { x: 2.4, y: 1 }, tone: 'ink', dashed: true }],
              points: [{ x: 0, y: -1, label: 'F', tone: 'good', labelPos: 'right' }],
              caption: 'F(0;−p/2), d ≡ y=p/2 → x² = −2py',
            },
          ],
        },
        {
          kind: 'astuce',
          label: "Lire l'orientation directement sur l'équation",
          text:
            'La variable qui est au **carré** donne l\'axe focal, la variable au premier degré donne le sens d\'ouverture : $y^2=2px$ → axe focal = axe des $x$, ouverture vers les $x$ positifs. $x^2=-2py$ → axe focal = axe des $y$, ouverture vers les $y$ négatifs. Et dans tous les cas, le foyer est à distance $p/2$ du sommet, du côté de l\'ouverture ; la directrice est de l\'autre côté, à la même distance.',
        },
        { kind: 'subheading', text: "B. L'ellipse" },
        {
          kind: 'definition',
          label: "Définition — l'ellipse",
          items: [
            "On appelle **ellipse** le lieu des points du plan situés à des distances de deux points fixes $F$ et $F'$ (les **foyers** de l'ellipse) dont la **somme est constante**.",
            "On note $|FF'| = 2c > 0$ et $2a > 0$ cette somme constante.",
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — construire l'ellipse point par point",
          items: [
            "Les points $A$ et $B$ de l'ellipse se trouvent à la fois sur le cercle de centre $F$ et de rayon $r$, et sur le cercle de centre $F'$ et de rayon $2a-r$ (leur somme vaut bien $2a$).",
            "(1) choisir $r$ avec $a-c \\leq r \\leq a+c$ ; (2) tracer les deux cercles ; (3) marquer leurs points d'intersection ; (4) recommencer pour d'autres $r$.",
          ],
        },
        {
          kind: 'piege',
          label: "L'ellipse n'existe que si a > c",
          text:
            "Ce qui précède ne prend tout son sens que si $a > c$. Si $a < c$, le lieu est **vide** (la somme des distances aux deux foyers est toujours au moins $|FF'| = 2c$). Si $a = c$, il s'agit du **segment** $[FF']$, pas d'une ellipse. Vérifier $a > c$ avant tout calcul.",
        },
        { kind: 'subheading', text: "Équation cartésienne de l'ellipse" },
        {
          kind: 'para',
          text:
            "Repère orthonormé : axe des abscisses passant par $F$ et $F'$, axe des ordonnées = médiatrice de $[FF']$. Alors $F(c;0)$ et $F'(-c;0)$.",
        },
        {
          kind: 'exemple',
          badge: "Démonstration — de la définition à l'équation",
          steps: [
            { tag: 'définition', text: "$P(x;y) \\in \\mathcal{E} \\iff \\sqrt{(x-c)^2+y^2} + \\sqrt{(x+c)^2+y^2} = 2a$" },
            { tag: 'élévation au carré', text: '$\\iff (x-c)^2+y^2+(x+c)^2+y^2+2\\sqrt{(x-c)^2+y^2}\\sqrt{(x+c)^2+y^2} = 4a^2$' },
            { tag: 'isolement des racines, division par 2', text: '$\\iff \\sqrt{(x-c)^2+y^2}\\sqrt{(x+c)^2+y^2} = 2a^2-c^2-x^2-y^2$' },
            { tag: 'carré, membres de même signe', text: '$\\iff ((x-c)^2+y^2)((x+c)^2+y^2) = (2a^2-c^2-x^2-y^2)^2$' },
            { tag: 'regroupement, produits remarquables', text: '$\\iff ((x^2+y^2+c^2)-2cx)((x^2+y^2+c^2)+2cx) = (2a^2-(x^2+y^2+c^2))^2$' },
            { tag: 'termes semblables, simplification', text: '$\\iff (a^2-c^2)x^2+a^2y^2 = a^2(a^2-c^2)$' },
            { tag: 'on pose b²=a²−c², b>0 (car a>c)', text: '$\\iff b^2x^2+a^2y^2 = a^2b^2$' },
          ],
          result: { tag: 'division par a²b²', text: '$\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$' },
        },
        {
          kind: 'para',
          text:
            'La condition $x^2+y^2 \\leq a^2+b^2$, nécessaire aux mises au carré, est en fait **superflue** : tout point solution de l\'équation finale vérifie $x^2/a^2 \\leq 1$ et $y^2/b^2 \\leq 1$, donc $x^2 \\leq a^2$ et $y^2 \\leq b^2$, d\'où $x^2+y^2 \\leq a^2+b^2$.',
        },
        {
          kind: 'definition',
          label: "À retenir — équation cartésienne de l'ellipse",
          items: [
            "L'ellipse de foyers $F(c;0)$ et $F'(-c;0)$ dont les points se trouvent à des distances de $F$ et $F'$ dont la somme vaut $2a$, avec $a > c$, a pour équation : $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1 \\quad \\text{avec} \\quad b^2 = a^2-c^2 \\;\\, (b>0)$",
          ],
        },
        { kind: 'subheading', text: "Caractéristiques de l'ellipse" },
        {
          kind: 'para',
          text:
            "De même : $x^2/a^2+y^2/b^2=1 \\iff y = \\pm\\dfrac{b}{a}\\sqrt{a^2-x^2}$. L'ellipse est l'union du graphique de $f(x) = \\dfrac{b}{a}\\sqrt{a^2-x^2}$ et de son symétrique par rapport à l'axe des abscisses.",
        },
        {
          kind: 'methode',
          label: 'Étude de la fonction associée',
          items: [
            '$\\text{dom}\\,f = [-a;a]$ — donc **pas d\'asymptote** (domaine borné)',
            'dérivée première : $f\'(x) = \\dfrac{-bx}{a\\sqrt{a^2-x^2}}$ — positive dans $]-a;0]$, négative dans $[0;a[$',
            'dérivée seconde : $\\forall x \\in \\,]-a;a[$, $f\'\'(x) = \\dfrac{-ab}{\\sqrt{(a^2-x^2)^3}} < 0$ — concave',
          ],
        },
        {
          kind: 'definition',
          label: 'Vocabulaire — axes, centre, sommets, grand et petit axe',
          items: [
            "L'ellipse possède **deux** axes de symétrie : l'**axe focal** passe par les foyers, l'**axe non focal** est la médiatrice de $[FF']$. Leur point d'intersection est le **centre** de l'ellipse. Les points d'intersection entre l'ellipse et ses axes de symétrie sont ses **sommets** : l'ellipse en possède donc **quatre**.",
            "Ainsi, l'ellipse d'équation $x^2/a^2+y^2/b^2=1$ a pour sommets $(a;0)$, $(-a;0)$, $(0;b)$ et $(0;-b)$. Les nombres strictement positifs $2a$, $2b$ et $2c$ sont appelés respectivement **grand axe**, **petit axe** et **distance focale** de l'ellipse.",
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
              curves: [
                { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
                { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              ],
              vectors: [
                { from: { x: 3, y: 3.2 }, to: { x: 3, y: 0 }, tone: 'accent', dashed: true, arrow: false },
                { from: { x: 3, y: 3.2 }, to: { x: -3, y: 0 }, tone: 'accent', dashed: true, arrow: false },
              ],
              points: [
                { x: 3, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: -3, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
                { x: 3, y: 3.2, label: 'P', tone: 'ink', labelPos: 'right' },
              ],
              caption: "Ellipse x²/25+y²/16=1 : a=5, b=4, c=3. Foyers F(3;0) et F′(−3;0), sommets (±5;0) et (0;±4). Pour tout point P : |PF|+|PF′| = 2a = 10.",
            },
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
              circle: { cx: 0, cy: 0, r: 5, tone: 'faint' },
              curves: [
                { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
                { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              ],
              vectors: [{ from: { x: 3, y: 4 }, to: { x: 3, y: 3.2 }, tone: 'attn', dashed: true, arrow: false }],
              points: [
                { x: 3, y: 4, label: '', tone: 'ink', node: true },
                { x: 3, y: 3.2, label: '', tone: 'ink', node: true },
              ],
              caption:
                "Toute ellipse est un cercle « aplati » : le graphique de f(x)=(b/a)√(a²−x²) s'obtient en multipliant par b/a l'ordonnée de chaque point du cercle g(x)=√(a²−x²).",
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Le cercle est le cas c = 0 de l\'ellipse',
          text:
            "Si les deux foyers sont confondus ($c=0$), alors $b^2 = a^2-0 = a^2$, donc $b=a$, et l'équation $x^2/a^2+y^2/b^2=1$ devient $x^2+y^2=a^2$ : l'équation du cercle de centre $(0;0)$ et de rayon $a$. Un cercle est exactement une ellipse dont les deux foyers coïncident avec le centre.",
        },
        {
          kind: 'piege',
          label: 'b n\'est pas toujours le « petit » demi-axe de l\'équation lue à gauche',
          text:
            "L'équation de l'ellipse n'est simple que dans un repère dont les axes de coordonnées sont ses axes de symétrie. Si l'axe focal est l'axe des **abscisses** ($F(c;0)$, $F'(-c;0)$), l'équation est $x^2/a^2 + y^2/b^2 = 1$ ; si l'axe focal est l'axe des **ordonnées** ($F(0;c)$, $F'(0;-c)$), l'équation devient $y^2/a^2 + x^2/b^2 = 1$ — dans les deux cas avec $b^2=a^2-c^2$. C'est le plus grand dénominateur qui porte $a^2$ et désigne l'axe focal, jamais la position de $x$ ou de $y$ dans l'écriture.",
        },
        { kind: 'subheading', text: "C. L'hyperbole" },
        {
          kind: 'definition',
          label: "Définition — l'hyperbole",
          items: [
            "On appelle **hyperbole** le lieu des points du plan situés à des distances de deux points fixes $F$ et $F'$ (les **foyers** de l'hyperbole) dont la **valeur absolue de la différence est constante**.",
            "On note $|FF'| = 2c > 0$ et $2a > 0$ cette constante. Une hyperbole est constituée de **deux parties**, appelées **branches** de l'hyperbole.",
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — construire l'hyperbole point par point",
          items: [
            "Les points $A$ et $B$ se trouvent à la fois sur le cercle de centre $F$ et de rayon $r$ et sur le cercle de centre $F'$ et de rayon $2a+r$ (la différence vaut bien $2a$).",
            "(1) choisir $r \\geq c-a$ ; (2) tracer les deux cercles ; (3) marquer leurs intersections ; (4) recommencer. On obtient ainsi une seule branche ; l'autre s'obtient en échangeant les rôles de $F$ et $F'$.",
          ],
        },
        {
          kind: 'piege',
          label: "L'hyperbole exige c > a, l'ellipse a > c",
          text:
            "Pour l'hyperbole, le lieu n'a de sens que si $c > a$ ; si $c < a$ il est **vide**, et si $a = c$ c'est la droite $FF'$ privée du segment $]FF'[$. L'inégalité est **exactement inversée** par rapport à l'ellipse — comme la relation entre $a$, $b$ et $c$ : $b^2=a^2-c^2$ pour l'ellipse, $b^2=c^2-a^2$ pour l'hyperbole. Ne jamais recopier l'une pour l'autre.",
        },
        { kind: 'subheading', text: "Équation cartésienne de l'hyperbole — méthode des génératrices" },
        {
          kind: 'para',
          text:
            "Repère orthonormé : abscisses passant par $F$ et $F'$, ordonnées = médiatrice de $[FF']$, donc $F(c;0)$ et $F'(-c;0)$. On utilise cette fois le **procédé de construction** : tout point de l'hyperbole est sur le cercle $\\mathcal{C}_1$ de centre $F$ et de rayon $r$ ET sur le cercle $\\mathcal{C}_2$ de centre $F'$ et de rayon $2a+r$. Ces deux cercles sont les **génératrices** ; il reste à éliminer le paramètre $r$.",
        },
        {
          kind: 'exemple',
          badge: 'Démonstration — élimination du paramètre r',
          steps: [
            { tag: 'les 2 génératrices, r ≥ c−a', text: '$\\mathcal{C}_1 \\equiv (x-c)^2+y^2 = r^2 \\;\\; ; \\;\\; \\mathcal{C}_2 \\equiv (x+c)^2+y^2 = (2a+r)^2$' },
            { tag: 'on soustrait la 1ʳᵉ de la 2ᵉ', text: '$4xc = 4a^2+4ar$' },
            { tag: 'on isole r', text: '$\\implies r = \\dfrac{c}{a}x - a$' },
            { tag: 'on remplace r dans 𝒞₁', text: '$\\implies (x-c)^2+y^2 = \\left(\\dfrac{c}{a}x-a\\right)^2$' },
            { tag: 'développement et regroupement', text: '$\\iff \\left(\\dfrac{a^2-c^2}{a^2}\\right)x^2 + y^2 = a^2-c^2$' },
            { tag: 'on pose b²=c²−a², b>0 (car c>a)', text: '$\\iff -\\dfrac{b^2}{a^2}x^2 + y^2 = -b^2$' },
          ],
          result: { tag: 'division par −b²', text: '$\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$' },
        },
        {
          kind: 'para',
          text:
            "**Analyse du lieu.** La condition $r = (c/a)\\cdot x - a$ avec $r \\geq c-a$ implique $x \\geq a$ : on n'obtient ainsi qu'une « demi-hyperbole ». L'autre branche s'obtient en considérant les cercles $\\mathcal{C}_1$ de centre $F'$ et de rayon $r$, et $\\mathcal{C}_2$ de centre $F$ et de rayon $2a+r$.",
        },
        {
          kind: 'definition',
          label: "À retenir — équation cartésienne de l'hyperbole",
          items: [
            "L'hyperbole de foyers $F(c;0)$ et $F'(-c;0)$ dont les points se trouvent à des distances de $F$ et $F'$ dont la valeur absolue de la différence vaut $2a$, avec $c > a$, a pour équation : $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1 \\quad \\text{avec} \\quad b^2 = c^2-a^2 \\;\\, (b>0)$",
          ],
        },
        { kind: 'subheading', text: "Caractéristiques de l'hyperbole" },
        {
          kind: 'para',
          text:
            "$x^2/a^2-y^2/b^2=1 \\iff y = \\pm\\dfrac{b}{a}\\sqrt{x^2-a^2}$. L'hyperbole est l'union du graphique de $f(x) = \\dfrac{b}{a}\\sqrt{x^2-a^2}$ et de son symétrique par rapport à l'axe des abscisses.",
        },
        {
          kind: 'methode',
          label: 'Étude de la fonction associée',
          items: [
            '$\\text{dom}\\,f = \\,]-\\infty;-a] \\cup [a;+\\infty[$',
            "asymptotes obliques : $AO_{+\\infty} \\equiv y = \\dfrac{b}{a}x$ et $AO_{-\\infty} \\equiv y = -\\dfrac{b}{a}x$",
            "dérivée première : $f'(x) = \\dfrac{bx}{a\\sqrt{x^2-a^2}}$ — positive dans $]a;+\\infty[$, négative dans $]-\\infty;-a[$",
            "dérivée seconde : $\\forall x \\in \\,]-\\infty;-a[\\,\\cup\\,]a;+\\infty[$, $f''(x) = \\dfrac{-ab}{\\sqrt{(x^2-a^2)^3}} < 0$",
          ],
        },
        {
          kind: 'definition',
          label: 'Vocabulaire — axes, centre, sommets, asymptotes',
          items: [
            "L'hyperbole possède **deux** axes de symétrie : l'**axe focal** passe par les foyers, l'**axe non focal** est la médiatrice de $[FF']$. Leur intersection est le **centre**. Les points d'intersection entre l'hyperbole et ses axes de symétrie sont ses **sommets** : elle en possède **deux**, tous deux sur l'axe focal. Elle possède également **deux asymptotes**, qui passent par son centre.",
            "Ainsi, l'hyperbole d'équation $x^2/a^2-y^2/b^2=1$ a pour sommets $(a;0)$ et $(-a;0)$, et pour asymptotes les droites $y = \\dfrac{b}{a}x$ et $y = -\\dfrac{b}{a}x$.",
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
            curves: [
              { fn: (x) => 4 * r((x * x) / 9 - 1), tone: 'accent', xMin: 3, xMax: 6.5 },
              { fn: (x) => -4 * r((x * x) / 9 - 1), tone: 'accent', xMin: 3, xMax: 6.5 },
              { fn: (x) => 4 * r((x * x) / 9 - 1), tone: 'accent', xMin: -6.5, xMax: -3 },
              { fn: (x) => -4 * r((x * x) / 9 - 1), tone: 'accent', xMin: -6.5, xMax: -3 },
            ],
            vectors: [
              { from: { x: -4.57, y: -6.09 }, to: { x: 4.57, y: 6.09 }, tone: 'ink', dashed: true },
              { from: { x: -4.57, y: 6.09 }, to: { x: 4.57, y: -6.09 }, tone: 'ink', dashed: true },
              { from: { x: 3, y: 4 }, to: { x: 3, y: -4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 3, y: -4 }, to: { x: -3, y: -4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -3, y: -4 }, to: { x: -3, y: 4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -3, y: 4 }, to: { x: 3, y: 4 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 5, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: -5, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
              { x: 3, y: 0, label: 'S', tone: 'ink', labelPos: 'above' },
              { x: -3, y: 0, label: "S'", tone: 'ink', labelPos: 'above' },
            ],
            caption:
              "Hyperbole x²/9−y²/16=1 : a=3, b=4, c=5. Sommets (±3;0), foyers (±5;0), asymptotes y=±(4/3)x. Le rectangle en pointillé (±a;±b) donne les asymptotes par ses diagonales.",
          },
        },
        {
          kind: 'astuce',
          label: 'Tracer les asymptotes avant la courbe',
          text:
            "Le rectangle de sommets $(\\pm a;\\pm b)$ — largeur $2a$, hauteur $2b$ — a pour diagonales exactement les deux asymptotes $y=\\pm(b/a)x$. Tracer ce rectangle puis ses diagonales, et enfin la courbe qui part des sommets $(\\pm a;0)$ en se collant aux diagonales, donne un tracé correct sans aucun calcul de point.",
        },
        { kind: 'subheading', text: "Un cas particulier — l'hyperbole équilatère" },
        {
          kind: 'para',
          text:
            "Lorsque $c = a\\sqrt{2}$, on a $b^2 = c^2-a^2 = a^2$, donc $b = a$ : l'équation s'écrit $x^2 - y^2 = a^2$. Ses asymptotes sont les droites $y = \\pm x$ — les bissectrices des axes de coordonnées, donc **perpendiculaires** entre elles. C'est l'**hyperbole équilatère**.",
        },
        {
          kind: 'para',
          text:
            "Si l'on travaille dans un repère dont les axes de coordonnées sont **les asymptotes elles-mêmes**, son équation devient $xy = k$ ($k$ constante). Ses axes de symétrie sont alors les droites $y = x$ et $y = -x$.",
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -4.5, xMax: 4.5, yMin: -4.22, yMax: 4.22,
              curves: [
                { fn: (x) => r(x * x - 4), tone: 'accent', xMin: 2, xMax: 4.5 },
                { fn: (x) => -r(x * x - 4), tone: 'accent', xMin: 2, xMax: 4.5 },
                { fn: (x) => r(x * x - 4), tone: 'accent', xMin: -4.5, xMax: -2 },
                { fn: (x) => -r(x * x - 4), tone: 'accent', xMin: -4.5, xMax: -2 },
              ],
              vectors: [
                { from: { x: -4.22, y: -4.22 }, to: { x: 4.22, y: 4.22 }, tone: 'ink', dashed: true },
                { from: { x: -4.22, y: 4.22 }, to: { x: 4.22, y: -4.22 }, tone: 'ink', dashed: true },
              ],
              caption: 'Hyperbole équilatère x²−y²=4 (a=b=2, c=2√2) : asymptotes y=±x, perpendiculaires.',
            },
            {
              kind: 'vectorPlane',
              xMin: -6, xMax: 6, yMin: -5.625, yMax: 5.625,
              curves: [
                { fn: (x) => 4 / x, tone: 'accent', xMin: 0.75, xMax: 6 },
                { fn: (x) => 4 / x, tone: 'accent', xMin: -6, xMax: -0.75 },
              ],
              caption: 'La MÊME courbe vue dans le repère de ses asymptotes : xy=k (ici k=4). Les axes de symétrie sont alors y=x et y=−x.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Reconnaître une hyperbole sous la forme xy = k',
          text:
            "Une équation $xy = k$ ne « ressemble » pas à $x^2/a^2-y^2/b^2=1$, et pourtant les deux décrivent une hyperbole — la première dans le repère des asymptotes, la seconde dans celui des axes de symétrie. Le terme en $xy$ signale toujours que les axes de symétrie de la conique ne sont **pas** parallèles aux axes de coordonnées (voir section 2).",
        },
        {
          kind: 'astuce',
          label: "Distinguer les trois coniques en un coup d'œil sur l'équation réduite",
          text:
            "Une fois l'équation ramenée à sa forme réduite : deux carrés **additionnés** égaux à 1 → **ellipse** (cercle si les deux dénominateurs sont égaux) ; deux carrés **soustraits** égaux à 1 → **hyperbole** (l'axe focal est celui de la variable dont le carré est positif) ; un seul carré, l'autre variable au premier degré → **parabole**.",
        },
        {
          kind: 'entrainement',
          title: 'Identifier et caractériser une conique',
          generatorId: '6gen58',
          description: [
            "Reconnaître, à partir d'une équation réduite ou d'une description géométrique, la nature d'une conique et en extraire foyers, sommets et asymptotes.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 58. Identifier et caractériser une conique »',
        },
      ],
    },
    {
      id: 'excentricite',
      number: 2,
      title: "Excentricité, foyers, directrices et réduction d'équation",
      kicker: "Un seul énoncé, un seul nombre e, trois coniques.",
      blocks: [
        {
          kind: 'para',
          text:
            "Les trois coniques de la section 1 ont été définies par trois conditions différentes. Il existe pourtant **un seul** énoncé qui les décrit toutes les trois — et c'est le nombre qui y apparaît, l'excentricité, qui décide laquelle on obtient.",
        },
        {
          kind: 'definition',
          label: "Propriété — une propriété commune de l'ellipse et de l'hyperbole",
          items: [
            "Soient $a, b, c \\in \\mathbb{R}_0^+$. L'ellipse d'équation $x^2/a^2+y^2/b^2=1$ (ou l'hyperbole d'équation $x^2/a^2-y^2/b^2=1$) est le lieu des points du plan dont le rapport de la distance au point $F(c;0)$ à la distance à la droite $d \\equiv x = a^2/c$ est constant et vaut $c/a$.",
            'Ce rapport constant est appelé **excentricité** et se note $e$ : on a donc $e = c/a$.',
          ],
        },
        {
          kind: 'exemple',
          badge: "Démonstration (cas de l'ellipse)",
          steps: [
            { tag: 'condition de départ', text: '$\\dfrac{|PF|}{\\text{dist}(P;d)} = \\dfrac{c}{a}$' },
            { tag: 'produit en croix', text: '$\\iff a\\sqrt{(x-c)^2+y^2} = c\\cdot\\left|x-\\dfrac{a^2}{c}\\right|$' },
            { tag: 'élévation au carré', text: '$\\iff a^2(x^2+y^2+c^2-2cx) = c^2x^2+a^4-2a^2cx$' },
            { tag: '−2a²cx s\'élimine, regroupement', text: '$\\iff (a^2-c^2)x^2+a^2y^2 = a^2(a^2-c^2)$' },
          ],
          result: { tag: 'b² = a²−c²', text: '$\\iff b^2x^2+a^2y^2 = a^2b^2 \\iff \\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2} = 1$' },
        },
        {
          kind: 'para',
          text:
            "Il est facile de montrer que l'on peut remplacer $F(c;0)$ par $F'(-c;0)$ et la droite $d \\equiv x=a^2/c$ par $d' \\equiv x=-a^2/c$. Les droites $d$ et $d'$ sont appelées **directrices** de l'ellipse ; $F$ et $F'$ en sont les foyers. La démonstration dans le cas de l'hyperbole est analogue.",
        },
        {
          kind: 'definition',
          label: 'À retenir — caractérisation focale, valable pour les trois coniques',
          items: [
            "Toute **conique**, à l'exclusion du cercle, est le lieu des points du plan dont le rapport entre la distance à un point (le **foyer**) et la distance à une droite ne contenant pas ce point (la **directrice**) est une constante $e$ (l'**excentricité**) : $\\dfrac{\\text{dist}(P;F)}{\\text{dist}(P;d)} = e$",
            '$0 < e < 1$ → la conique est une **ellipse** ; $e = 1$ → c\'est une **parabole** (on retrouve la définition de la section 1) ; $e > 1$ → c\'est une **hyperbole**.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5, xMax: 4, yMin: -3.28, yMax: 3.28,
            vectors: [{ from: { x: 0, y: -3.28 }, to: { x: 0, y: 3.28 }, tone: 'ink', dashed: true }],
            curves: [
              { fn: (x) => r(-0.75 * x * x + 2 * x - 1), tone: 'good', xMin: 0.667, xMax: 2 },
              { fn: (x) => -r(-0.75 * x * x + 2 * x - 1), tone: 'good', xMin: 0.667, xMax: 2 },
              { fn: (x) => r(2 * x - 1), tone: 'accent', xMin: 0.5, xMax: 4 },
              { fn: (x) => -r(2 * x - 1), tone: 'accent', xMin: 0.5, xMax: 4 },
              { fn: (x) => r(3 * x * x + 2 * x - 1), tone: 'bad', xMin: 0.334, xMax: 1.675 },
              { fn: (x) => -r(3 * x * x + 2 * x - 1), tone: 'bad', xMin: 0.334, xMax: 1.675 },
              { fn: (x) => r(3 * x * x + 2 * x - 1), tone: 'bad', xMin: -2.34, xMax: -1 },
              { fn: (x) => -r(3 * x * x + 2 * x - 1), tone: 'bad', xMin: -2.34, xMax: -1 },
            ],
            points: [{ x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' }],
            caption:
              "Trois coniques de MÊME foyer F(1;0) et de MÊME directrice d ≡ x=0. Seule l'excentricité change : e=0,5 (ellipse, vert), e=1 (parabole, orange), e=2 (hyperbole à 2 branches, rouge).",
          },
        },
        {
          kind: 'astuce',
          label: 'Conique centrée ou non centrée',
          text:
            "L'expression **conique centrée** désigne une ellipse ou une hyperbole, car elles possèdent un centre de symétrie ; les paraboles sont des coniques **non centrées**. Une conique centrée a toujours deux foyers et deux directrices, une parabole n'en a qu'un et qu'une. Quant au **cercle**, il est d'excentricité nulle et n'a **pas** de directrice — c'est pourquoi il est exclu de la caractérisation focale ci-dessus.",
        },
        {
          kind: 'definition',
          label: "Équation générale d'une conique",
          items: [
            "Si, dans un repère orthonormé, on fournit le foyer d'une conique, sa directrice et son excentricité, on peut en déterminer une équation cartésienne. Cette équation s'écrit toujours sous la forme générale : $m\\,x^2 + n\\,y^2 + q\\,xy + r\\,x + s\\,y + t = 0$",
            'où $m, n, q, r, s, t \\in \\mathbb{R}$ et $(m;n;q) \\neq (0;0;0)$ — au moins un terme du second degré est présent, sans quoi il s\'agirait d\'une droite.',
          ],
        },
        { kind: 'subheading', text: 'Coniques et cônes — le théorème de Dandelin-Quételet' },
        {
          kind: 'para',
          text:
            "Le mot « conique » n'est pas choisi au hasard : il s'agit des courbes obtenues en coupant un **cône de révolution** (engendré par la rotation, autour d'un axe, d'une droite de l'espace coupant cet axe) par un plan ne passant pas par le sommet du cône. Selon la position du plan, la section est un **cercle** (plan perpendiculaire à l'axe), une **ellipse**, une **parabole** ou une **hyperbole**.",
        },
        {
          kind: 'definition',
          label: 'Théorème de Dandelin-Quételet',
          items: [
            "*La section d'un cône de révolution par un plan est une conique dont les **foyers** sont les points de contact avec ce plan des deux sphères inscrites dans ce cône et tangentes au plan, et les **directrices**, les intersections avec ce plan des deux plans contenant les cercles de contact de ces sphères avec le cône.*",
            'Germinal Pierre Dandelin (1794-1847), mathématicien belge, et Lambert Adolphe Jacques Quételet (1796-1874), fondateur de l\'Observatoire royal de Belgique — ce théorème est aussi connu sous le nom de **théorème belge**.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration (cas où la section est une ellipse)',
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $P$ un point quelconque de l'ellipse. Considérons la droite passant par $P$ et le sommet du cône (une **génératrice** du cône) et désignons par $M$ et $M'$ les points où cette droite est tangente aux deux sphères.",
            },
            { kind: 'para', text: '$|PM| = |PF|$ (2 tangentes à la petite sphère issues de P)' },
            { kind: 'para', text: "$|PM'| = |PF'|$ (2 tangentes à la grande sphère issues de P)" },
            { kind: 'para', text: "$|PF| + |PF'| = |PM| + |PM'| = |MM'|$ (M et M′ de part et d'autre de P)" },
            {
              kind: 'para',
              text:
                "$|MM'|$ est la distance entre les deux cercles de contact **mesurée le long d'une génératrice** : elle ne dépend pas du choix du point $P$. La somme $|PF|+|PF'|$ est donc constante, et les points $F$ et $F'$ sont bien les foyers d'une ellipse, telle que définie en section 1.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -5, xMax: 5, yMin: -4.675, yMax: 4.7,
            showAxes: false,
            vectors: [
              { from: { x: 0, y: 4.5 }, to: { x: -3.729, y: -4.602 }, tone: 'ink', arrow: false },
              { from: { x: 0, y: 4.5 }, to: { x: 3.729, y: -4.602 }, tone: 'ink', arrow: false },
              { from: { x: -5, y: -1.0096 }, to: { x: 5, y: 2.1824 }, tone: 'accent', arrow: false },
            ],
            circles: [
              { cx: 0, cy: 1.7, r: 1.061, tone: 'good' },
              { cx: 0, cy: -2, r: 2.464, tone: 'good' },
            ],
            points: [
              { x: -0.982, y: 2.103, label: 'M', tone: 'ink', labelPos: 'left' },
              { x: -2.28, y: -1.065, label: "M'", tone: 'ink', labelPos: 'left' },
              { x: 0.323, y: 0.689, label: 'F', tone: 'good', labelPos: 'right' },
              { x: -0.749, y: 0.347, label: "F'", tone: 'good', labelPos: 'left' },
              { x: -1.845, y: 0, label: 'P', tone: 'ink', labelPos: 'below' },
            ],
            caption:
              "Vue en coupe du cône : les 2 sphères inscrites touchent le plan de section en F et F′, et la génératrice en M et M′. |PF|+|PF′| = |PM|+|PM′| = |MM′|, constante.",
          },
        },
        { kind: 'subheading', text: "Réduire l'équation d'une conique" },
        {
          kind: 'para',
          text:
            "Toute l'étude de la section 1 suppose un repère **adapté** à la conique : les axes de coordonnées coïncident avec les axes de symétrie (coniques centrées, l'origine étant le centre), ou bien un axe coïncide avec l'axe de symétrie et l'origine avec le sommet (parabole). Dans un repère quelconque, l'équation est de la forme générale $mx^2+ny^2+qxy+rx+sy+t=0$, et il est difficile d'y lire la nature et les caractéristiques de la conique.",
        },
        {
          kind: 'methode',
          label: "Méthode — réduction de l'équation d'une conique",
          items: [
            "Passer du repère initial à un repère adapté s'appelle la **réduction** de l'équation de la conique. On se limite ici au cas d'une simple **translation** (axes parallèles, mêmes sens) — ce qui suffit dès que l'équation ne contient pas de terme en $xy$.",
            "(1) regrouper les termes en $x$ d'un côté, les termes en $y$ de l'autre ; (2) compléter chaque groupe en un **carré parfait**, en ajoutant la même quantité aux deux membres ; (3) factoriser ; (4) diviser pour ramener le second membre à 1 ; (5) lire la translation $(x';y')$ et identifier la conique.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 16x² − 36y² + 80x + 252y − 197 = 0',
          blocks: [
            { kind: 'para', text: '**1) Transformation de l\'équation.**' },
            { kind: 'para', text: '$16x^2 - 36y^2 + 80x + 252y - 197 = 0$' },
            { kind: 'para', text: '$\\iff (16x^2 + 80x) - (36y^2 - 252y) = 197$' },
            { kind: 'para', text: '$\\iff (16x^2+80x+100) - (36y^2-252y+441) = 197+100-441$' },
            { kind: 'para', text: 'car $16x^2+80x+100 = (4x+10)^2$ et $36y^2-252y+441 = (6y-21)^2$ :' },
            { kind: 'para', text: '$\\iff (4x+10)^2 - (6y-21)^2 = -144$' },
            { kind: 'para', text: '$\\iff 16\\left(x+\\dfrac{5}{2}\\right)^2 - 36\\left(y-\\dfrac{7}{2}\\right)^2 = -144$' },
            { kind: 'para', text: '$\\iff -\\dfrac{(x+5/2)^2}{9} + \\dfrac{(y-7/2)^2}{4} = 1$' },
            {
              kind: 'para',
              text:
                "**2) Changement de repère.** On passe du repère $R_1$ d'origine $O(0;0)$ à un repère $R_2$ d'origine $O'(-5/2 ; 7/2)$ par translation de vecteur $\\overrightarrow{OO'}$. Les coordonnées $(x';y')$ d'un point dans le nouveau repère sont : $x' = x+\\dfrac{5}{2} \\qquad y' = y-\\dfrac{7}{2}$",
            },
            { kind: 'para', text: "**3) Équation de la conique dans le repère** $R_2$. $\\dfrac{y'^2}{4} - \\dfrac{x'^2}{9} = 1$" },
            {
              kind: 'para',
              text:
                "**4) Nature.** C'est une **hyperbole**, dont l'axe focal est l'axe des **ordonnées** du repère $R_2$ (c'est le carré en $y'$ qui est positif). On lit $a=2$, $b=3$, et $c = \\sqrt{a^2+b^2} = \\sqrt{4+9} = \\sqrt{13}$.",
            },
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Dans le repère R₂', 'Dans le repère R₁ (donné)'],
          rows: [
            ["hyperbole centrée à l'origine, axe focal = axe des ordonnées", "hyperbole centrée en $O'(-5/2;7/2)$, axe focal $x=-5/2$, axe non focal $y=7/2$"],
            ['$a=2$, $b=3$, $c=\\sqrt{13}$', '$a=2$, $b=3$, $c=\\sqrt{13}$'],
            ["foyers $F(0;\\sqrt{13})$ et $F'(0;-\\sqrt{13})$", "foyers $F(-5/2;7/2+\\sqrt{13})$ et $F'(-5/2;7/2-\\sqrt{13})$"],
            ["directrices $y' = \\pm\\dfrac{4\\sqrt{13}}{13}$", "directrices $y = \\dfrac{7}{2} \\pm \\dfrac{4\\sqrt{13}}{13}$"],
            ['excentricité $e=\\dfrac{\\sqrt{13}}{2}$', 'excentricité $e=\\dfrac{\\sqrt{13}}{2}$'],
            ["sommets $S(0;2)$ et $S'(0;-2)$", "sommets $S(-5/2;11/2)$ et $S'(-5/2;3/2)$"],
            ["asymptotes $y' = \\pm\\dfrac{2}{3}x'$", "asymptotes $y = \\dfrac{2}{3}x+\\dfrac{31}{6}$ et $y=-\\dfrac{2}{3}x+\\dfrac{11}{6}$"],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -8, xMax: 3, yMin: -1.66, yMax: 8.66,
            curves: [
              { fn: (x) => 3.5 + 2 * r(1 + ((x + 2.5) * (x + 2.5)) / 9), tone: 'accent' },
              { fn: (x) => 3.5 - 2 * r(1 + ((x + 2.5) * (x + 2.5)) / 9), tone: 'accent' },
            ],
            vectors: [
              { from: { x: -8, y: 3.5 }, to: { x: 3, y: 3.5 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: -2.5, y: -1.66 }, to: { x: -2.5, y: 8.66 }, tone: 'ink', dashed: true, arrow: false },
            ],
            points: [
              { x: -2.5, y: 3.5, label: "O'", tone: 'ink', labelPos: 'left' },
              { x: -2.5, y: 5.5, label: 'S', tone: 'accent', labelPos: 'right' },
              { x: -2.5, y: 1.5, label: "S'", tone: 'accent', labelPos: 'right' },
            ],
            caption:
              "La conique 16x²−36y²+80x+252y−197=0 dans le repère donné R₁ : hyperbole de centre O′(−5/2;7/2), sommets S(−5/2;11/2) et S′(−5/2;3/2). Les axes translatés x′ et y′ sont en pointillé.",
          },
        },
        {
          kind: 'piege',
          label: 'Un terme en xy interdit la simple translation',
          text:
            "La présence d'un terme en $xy$ exprime le fait que les axes de symétrie de la conique **ne sont pas parallèles** aux axes de coordonnées. Dans ce cas, une translation ne suffit plus : il faudrait en plus une rotation. Vérifier l'absence du terme en $xy$ est donc la toute première chose à faire avant de se lancer dans la complétion des carrés.",
        },
        {
          kind: 'piege',
          label: "Le signe du second membre décide de l'axe focal",
          text:
            "Après complétion des carrés, l'exemple donne $16(x+5/2)^2 - 36(y-7/2)^2 = -144$. En divisant par $-144$ (un nombre **négatif**), les deux signes s'inversent : c'est le carré en $y$ qui devient positif, donc l'axe focal est **vertical**. Diviser sans faire attention au signe conduit à écrire $x'^2/9 - y'^2/4 = 1$, une hyperbole d'axe focal horizontal — toutes les caractéristiques suivantes sont alors fausses.",
        },
        {
          kind: 'astuce',
          label: 'Vérifier la réduction en testant un sommet',
          text:
            "Une fois les sommets calculés dans $R_1$ (ici $S(-5/2;11/2)$), il suffit de les substituer dans l'équation générale de départ : $16(-5/2)^2-36(11/2)^2+80(-5/2)+252(11/2)-197 = 100-1089-200+1386-197 = 0$ ✓. Un contrôle de 10 secondes qui attrape toute erreur de complétion de carré ou de signe.",
        },
        {
          kind: 'entrainement',
          title: "Excentricité, foyers, directrices et réduction d'équation",
          generatorId: '6gen59',
          description: [
            "Passer de foyer/directrice/excentricité à une équation, réduire une équation générale par translation, et identifier la conique obtenue.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 59. Excentricité, foyers, directrices et réduction d'équation »",
        },
      ],
    },
    {
      id: 'airefocale',
      number: 3,
      title: 'Aire, rayons focaux et excentricité',
      kicker: 'Exploiter les distances aux foyers sans jamais repasser par une équation.',
      blocks: [
        {
          kind: 'para',
          text:
            "Les sections 1 et 2 ont produit des équations. Cette section-ci exploite au contraire les propriétés purement **métriques** de l'ellipse — les distances aux foyers, appelées **rayons focaux**, et l'excentricité — sans jamais avoir besoin de repasser par une équation cartésienne.",
        },
        { kind: 'subheading', text: 'A. Aire du triangle foyer-point-foyer' },
        {
          kind: 'definition',
          label: 'Définition — rayons focaux',
          items: [
            "Pour un point $P$ d'une ellipse de foyers $F$ et $F'$, les distances $|PF|$ et $|PF'|$ sont les **rayons focaux** de $P$. La propriété caractéristique de l'ellipse s'écrit alors : $|PF| + |PF'| = 2a \\quad \\text{(pour tout point } P \\text{ de l'ellipse)}$",
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode — aire du triangle FPF′ en 3 étapes',
          items: [
            "(1) **Rayons focaux.** Si l'énoncé donne le rapport $k = |PF|/|PF'|$, résoudre le système $\\{|PF|+|PF'|=2a \\; ; \\; |PF|=k\\cdot|PF'|\\} \\implies |PF'| = \\dfrac{2a}{k+1}$, $|PF| = \\dfrac{2ak}{k+1}$.",
            "(2) **Angle au sommet P**, par la loi des cosinus dans le triangle $FPF'$, dont le troisième côté est $|FF'|=2c$ : $\\cos(\\widehat{FPF'}) = \\dfrac{|PF|^2+|PF'|^2-4c^2}{2\\cdot|PF|\\cdot|PF'|}$ avec $c^2=a^2-b^2$.",
            "(3) **Aire**, par la formule du sinus : $\\text{aire} = \\dfrac{1}{2}\\cdot|PF|\\cdot|PF'|\\cdot\\sin(\\widehat{FPF'})$ avec $\\sin = \\sqrt{1-\\cos^2}$.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — ellipse x²/25+y²/16=1, point P tel que |PF| = 2·|PF′|",
          blocks: [
            {
              kind: 'para',
              text:
                'Données : $a=5$, $b=4$, donc $c^2=a^2-b^2=25-16=9$ (et $c=3$, $|FF\'|=6$). Rapport $k=2$.',
            },
            {
              kind: 'para',
              text:
                "**(1) Rayons focaux** — système $\\{|PF|+|PF'|=10 \\; ; \\; |PF|=2|PF'|\\}$ : $3\\cdot|PF'|=10 \\implies |PF'|=\\dfrac{10}{3}$ et $|PF|=\\dfrac{20}{3}$. Contrôle : la somme vaut $30/3=10=2a$ ✓ et le rapport vaut bien 2 ✓.",
            },
            {
              kind: 'para',
              text:
                '**(2) Angle** — loi des cosinus, avec $4c^2=36$ : $\\cos(\\widehat{FPF\'}) = \\dfrac{400/9+100/9-36}{2\\cdot(20/3)\\cdot(10/3)} = \\dfrac{176/9}{400/9} = \\dfrac{11}{25}$',
            },
            {
              kind: 'para',
              text:
                "**(3) Aire** — sinus puis formule : $\\sin(\\widehat{FPF'}) = \\sqrt{1-\\dfrac{121}{625}} = \\sqrt{\\dfrac{504}{625}} = \\dfrac{6\\sqrt{14}}{25}$ $\\text{aire} = \\dfrac{1}{2}\\cdot\\dfrac{20}{3}\\cdot\\dfrac{10}{3}\\cdot\\dfrac{6\\sqrt{14}}{25} = \\dfrac{600\\sqrt{14}}{225} = \\dfrac{8\\sqrt{14}}{3} \\approx 9,98$",
            },
            {
              kind: 'para',
              text:
                "**Recoupement par la formule de Héron** (côtés 20/3, 10/3 et 6, demi-périmètre $s=8$) : $\\text{aire} = \\sqrt{8\\cdot\\dfrac{4}{3}\\cdot\\dfrac{14}{3}\\cdot 2} = \\sqrt{\\dfrac{896}{9}} = \\dfrac{8\\sqrt{14}}{3}$ ✓ — résultat identique.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
            curves: [
              { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
            ],
            vectors: [
              { from: { x: -2.778, y: 3.326 }, to: { x: 3, y: 0 }, tone: 'good', arrow: false },
              { from: { x: -2.778, y: 3.326 }, to: { x: -3, y: 0 }, tone: 'good', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: -3, y: 0 }, tone: 'ink', arrow: false },
            ],
            angleArcs: [{ cx: -2.778, cy: 3.326, fromDeg: -93.8, toDeg: -30, radiusPx: 18, tone: 'accent' }],
            points: [
              { x: 3, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: -3, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
              { x: -2.778, y: 3.326, label: 'P', tone: 'ink', labelPos: 'above' },
            ],
            caption:
              "Triangle FPF′ sur l'ellipse x²/25+y²/16=1, pour |PF|=2|PF′| : |PF′|=10/3, |PF|=20/3, |FF′|=6, aire = 8√14/3 ≈ 9,98.",
          },
        },
        {
          kind: 'piege',
          label: 'Croire que |PF| = |PF′| = a',
          text:
            "L'égalité $|PF|=|PF'|=a$ n'est vraie qu'en **un** seul cas : lorsque $P$ est un sommet de l'axe **non focal** ($P(0;\\pm b)$). Pour tout autre point, les deux rayons focaux sont différents, et rien d'autre que le système $\\{$somme$=2a$ ; rapport$=k\\}$ ne permet de les déterminer séparément. C'est la propriété caractéristique $|PF|+|PF'|=2a$ qui est la **clé d'entrée obligatoire** du problème.",
        },
        {
          kind: 'astuce',
          label: "N'extraire jamais c, seul c² est nécessaire",
          text:
            "La loi des cosinus n'utilise que $|FF'|^2=4c^2=4(a^2-b^2)$ — jamais $c$ lui-même, qui est souvent irrationnel (ex. $a=5$, $b=3 \\to c=4$, mais $a=5$, $b=2 \\to c=\\sqrt{21}$). En gardant $c^2$ entier tout du long, le cosinus reste une fraction exacte ; seule l'aire finale, qui passe par un sinus, peut être irrationnelle.",
        },
        {
          kind: 'piege',
          label: 'Un point P doit exister réellement',
          text:
            "Quand $P$ parcourt l'ellipse, $|PF|$ ne prend que les valeurs de l'intervalle $[a-c;a+c]$ (minimum au sommet le plus proche de $F$, maximum au sommet le plus éloigné). Un rapport $k$ trop grand pour une ellipse trop peu excentrée place $|PF|=2ak/(k+1)$ hors de cet intervalle : le triangle $FPF'$ ne se referme plus, $|\\cos| \\geq 1$, et le calcul produirait un sinus impossible. Toujours vérifier $a-c \\leq |PF| \\leq a+c$ avant de conclure.",
        },
        { kind: 'subheading', text: "B. Excentricité à partir d'une condition géométrique" },
        {
          kind: 'para',
          text:
            "Une condition géométrique portant sur une ellipse se traduit en une équation reliant $a$, $b$ et $c$, qui se résout ensuite en $e=c/a$. Trois conditions classiques :",
        },
        {
          kind: 'exempleLibre',
          label: "Condition 1 — l'angle FBF′ est droit, B sommet de l'axe non focal",
          blocks: [
            {
              kind: 'para',
              text:
                "Soit $B(0;b)$, sommet de l'axe non focal. Comme $B$ est sur l'axe non focal, $|BF|=|BF'|$, et la propriété caractéristique donne $|BF|+|BF'|=2a$, donc $|BF|=|BF'|=a$. Le triangle $FBF'$ est donc **rectangle isocèle** en $B$, et Pythagore donne :",
            },
            { kind: 'para', text: '$a^2+a^2 = (2c)^2 \\iff 2a^2=4c^2 \\iff a^2=2c^2$' },
            { kind: 'para', text: '$\\implies e^2 = \\dfrac{c^2}{a^2} = \\dfrac{1}{2} \\implies e = \\dfrac{\\sqrt{2}}{2} \\approx 0{,}707$' },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.13, xMax: 2.13, yMin: -2, yMax: 2,
            curves: [
              { fn: (x) => r(1 - (x * x) / 2), tone: 'accent', xMin: -1.414, xMax: 1.414 },
              { fn: (x) => -r(1 - (x * x) / 2), tone: 'accent', xMin: -1.414, xMax: 1.414 },
            ],
            vectors: [
              { from: { x: 0, y: 1 }, to: { x: 1, y: 0 }, tone: 'accent', arrow: false },
              { from: { x: 0, y: 1 }, to: { x: -1, y: 0 }, tone: 'accent', arrow: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 1 }, arm1: { x: 1, y: 0 }, arm2: { x: -1, y: 0 } }],
            points: [
              { x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: -1, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
              { x: 0, y: 1, label: 'B', tone: 'ink', labelPos: 'above' },
            ],
            caption:
              "Ellipse x²/2+y²=1 (a=√2, b=1, c=1) : depuis le sommet B(0;1) de l'axe non focal, l'angle FBF′ est droit. |BF|=|BF′|=a=√2, |FF′|=2. Excentricité e=√2/2.",
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Condition 2 — b = c',
          blocks: [
            {
              kind: 'para',
              text:
                "Un point $P$ de l'ellipse a la même abscisse qu'un foyer, et $OP$ est parallèle à la droite joignant un sommet principal à un sommet secondaire. Cette condition se traduit directement par $b=c$ :",
            },
            { kind: 'para', text: '$a^2 = b^2+c^2 = 2c^2 \\implies e = \\dfrac{\\sqrt{2}}{2}$' },
            {
              kind: 'para',
              text:
                "Même valeur que la condition 1 : ce n'est pas un hasard, ce sont deux formulations classiques du **même** fait géométrique ($a^2=2c^2 \\iff b=c$). L'intérêt pédagogique est la dérivation, pas la diversité du résultat.",
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Condition 3 — la distance entre les directrices vaut k fois la distance entre les foyers',
          blocks: [
            {
              kind: 'para',
              text:
                "Les directrices d'une ellipse sont $x=\\pm a^2/c$ : leur distance vaut $2a^2/c = 2a/e$. Les foyers sont $(\\pm c;0)$ : leur distance vaut $2c=2ae$. La condition $D(\\text{directrices}) = k\\cdot D(\\text{foyers})$ s'écrit donc :",
            },
            { kind: 'para', text: '$\\dfrac{2a}{e} = k\\cdot 2ae \\iff 1 = ke^2 \\iff e^2 = \\dfrac{1}{k} \\implies e = \\dfrac{1}{\\sqrt{k}}$' },
            {
              kind: 'para',
              text:
                "Le demi-grand axe $a$ **disparaît** de l'équation : la condition ne dépend que de $e$. Pour $k=4 \\to e=1/2$ ; pour $k=9 \\to e=1/3$ ; pour $k=5 \\to e=1/\\sqrt{5} \\approx 0{,}447$. Il faut $k \\geq 2$ pour que $e<1$, condition d'existence de l'ellipse.",
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Contrôler une excentricité trouvée par sa fourchette',
          text:
            "Une ellipse a toujours $0<e<1$. Toute condition géométrique qui aboutit à $e \\geq 1$ signale soit une erreur de traduction, soit une condition impossible pour une ellipse (elle décrirait alors une parabole ou une hyperbole). Réciproquement, un $e$ très proche de 0 correspond à une ellipse presque circulaire, un $e$ proche de 1 à une ellipse très allongée : un simple croquis suffit à valider l'ordre de grandeur.",
        },
        {
          kind: 'entrainement',
          title: 'Aire, rayons focaux et excentricité',
          generatorId: '6gen60',
          description: [
            "Calculer des rayons focaux à partir d'un rapport donné, en déduire une aire de triangle, ou remonter d'une condition géométrique à l'excentricité.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 60. Aire, rayons focaux et excentricité »',
        },
      ],
    },
    {
      id: 'intersection',
      number: 4,
      title: "Intersection d'une conique et d'une droite",
      kicker: 'Un système à résoudre, jamais plus de deux points.',
      blocks: [
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            "Déterminer l'éventuelle intersection entre une droite et une conique revient à résoudre le système formé par les équations de cette droite (1er degré) et de cette conique (2e degré). En substituant l'équation de la droite dans celle de la conique, on obtient une équation du second degré en une seule inconnue : la résolution de ce système fournit donc **au maximum deux** points d'intersection.",
            "Le nombre de solutions se lit sur le discriminant $\\Delta$ de cette équation : $\\Delta>0$ → 2 points (droite **sécante**) ; $\\Delta=0$ → 1 point (droite **tangente**, voir section 5) ; $\\Delta<0$ → aucun point (droite **extérieure**).",
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — droite par A(−4;0) et B(0;−3), conique de foyer F(3;−2), directrice d′ ≡ x=−1/5, excentricité e=5/3",
          blocks: [
            {
              kind: 'para',
              text:
                "**1) Équation de la droite.** Elle passe par $A(-4;0)$ et $B(0;-3)$ : pente $m=(-3-0)/(0-(-4))=-3/4$, ordonnée à l'origine $-3$. $d \\equiv y = -\\dfrac{3}{4}x - 3$",
            },
            {
              kind: 'para',
              text:
                "**2) Équation de la conique**, par la caractérisation focale $\\text{dist}(P;F) = e\\cdot\\text{dist}(P;d')$, avec $e=5/3>1$ — c'est donc une hyperbole :",
            },
            { kind: 'para', text: "$\\sqrt{(x-3)^2+(y+2)^2} = \\dfrac{5}{3}\\left|x+\\dfrac{1}{5}\\right|$" },
            { kind: 'para', text: '$\\iff (x-3)^2+(y+2)^2 = \\dfrac{25}{9}\\left(x+\\dfrac{1}{5}\\right)^2$' },
            { kind: 'para', text: '$\\iff 9x^2-54x+81+9y^2+36y+36 = 25x^2+10x+1$' },
            { kind: 'para', text: '$\\iff 16x^2 - 9y^2 + 64x - 36y - 116 = 0$' },
            {
              kind: 'para',
              text:
                "**3) Résolution du système.** On substitue $y=-(3/4)x-3$ dans l'équation de la conique. Comme $y^2=(9/16)x^2+(9/2)x+9$, il vient $-9y^2=-(81/16)x^2-(81/2)x-81$ et $-36y=27x+108$ :",
            },
            { kind: 'para', text: '$16x^2 - \\dfrac{81}{16}x^2 - \\dfrac{81}{2}x - 81 + 64x + 27x + 108 - 116 = 0$' },
            { kind: 'para', text: '$\\iff 175x^2 + 808x - 1424 = 0 \\quad \\text{(après multiplication par 16)}$' },
            {
              kind: 'para',
              text:
                '**4) Discriminant et racines.** $\\Delta = 808^2+4\\cdot175\\cdot1424 = 652\\,864+996\\,800 = 1\\,649\\,664 = 9216\\cdot179$ $\\sqrt{\\Delta} = 96\\sqrt{179} \\implies x = \\dfrac{-808\\pm96\\sqrt{179}}{350} = \\dfrac{-404\\pm48\\sqrt{179}}{175}$',
            },
            { kind: 'para', text: "En reportant dans $y=-(3/4)x-3$ : $y = \\dfrac{-222\\mp36\\sqrt{179}}{175}$" },
            {
              kind: 'para',
              text:
                "**5) Points d'intersection.** $\\Delta>0$ : la droite est sécante, il y a bien 2 points. $P\\left(\\dfrac{-404+48\\sqrt{179}}{175};\\dfrac{-222-36\\sqrt{179}}{175}\\right) \\quad\\text{et}\\quad Q\\left(\\dfrac{-404-48\\sqrt{179}}{175};\\dfrac{-222+36\\sqrt{179}}{175}\\right)$",
            },
            {
              kind: 'para',
              text:
                'Valeurs approchées ($\\sqrt{179}\\approx13{,}379$) : $P \\approx (1{,}36;-4{,}02)$ et $Q \\approx (-5{,}98;1{,}48)$ — un point sur chaque branche de l\'hyperbole.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -8, xMax: 4, yMin: -7.625, yMax: 3.625,
            curvesOfY: [
              { fn: (y) => -2 + 3 * r(1 + ((y + 2) * (y + 2)) / 16), tone: 'accent' },
              { fn: (y) => -2 - 3 * r(1 + ((y + 2) * (y + 2)) / 16), tone: 'accent' },
            ],
            vectors: [{ from: { x: -8, y: 3 }, to: { x: 4, y: -6 }, tone: 'attn', arrow: false }],
            points: [
              { x: 1.36, y: -4.02, label: 'P', tone: 'ink', labelPos: 'right' },
              { x: -5.98, y: 1.48, label: 'Q', tone: 'ink', labelPos: 'left' },
            ],
            caption:
              'La droite d ≡ y=−(3/4)x−3 coupe l\'hyperbole 16x²−9y²+64x−36y−116=0 en 2 points, P sur la branche droite et Q sur la branche gauche.',
          },
        },
        {
          kind: 'astuce',
          label: "Réduire l'équation de la conique pour se contrôler",
          text:
            "La conique de l'exemple se réduit (méthode de la section 2) en $16(x+2)^2-9(y+2)^2=144$, c'est-à-dire $(x+2)^2/9-(y+2)^2/16=1$ : hyperbole de centre $(-2;-2)$, $a=3$, $b=4$, $c=5$, sommets $(1;-2)$ et $(-5;-2)$. Excentricité $e=c/a=5/3$ ✓ — exactement la valeur donnée dans l'énoncé. Ce contrôle vérifie d'un coup toute l'étape 2, avant d'entamer la substitution.",
        },
        {
          kind: 'piege',
          label: 'Élever au carré une valeur absolue sans précaution',
          text:
            "La caractérisation focale contient $|x+1/5|$. L'élévation au carré est ici légitime car les deux membres sont positifs (une racine carrée d'un côté, une valeur absolue de l'autre) — mais elle fait disparaître le signe, ce qui est précisément la raison pour laquelle une hyperbole a **deux branches** : celle du côté $x>-1/5$ et celle du côté $x<-1/5$. Ne jamais éliminer d'office l'une des deux.",
        },
        {
          kind: 'piege',
          label: "Un discriminant nul n'est pas « pas de solution »",
          text:
            "$\\Delta=0$ signifie exactement **un** point d'intersection (double), pas zéro : la droite est alors tangente à la conique. C'est $\\Delta<0$ qui donne l'ensemble vide. Confondre les deux revient à déclarer extérieure une droite qui touche pourtant la courbe.",
        },
        {
          kind: 'piege',
          label: 'La droite verticale n\'entre pas dans y = mx + p',
          text:
            "Si la droite de l'énoncé est verticale ($x=k$), elle n'a pas de pente et ne peut pas être substituée sous la forme $y=mx+p$ : il faut alors remplacer $x$ par $k$ dans l'équation de la conique et résoudre en $y$. La méthode est la même, l'inconnue restante change.",
        },
        {
          kind: 'entrainement',
          title: "Intersection d'une conique et d'une droite",
          generatorId: '6gen61',
          description: [
            "Substituer l'équation d'une droite dans celle d'une conique, résoudre le système et interpréter le discriminant obtenu.",
          ],
          chantier: '6e-6h',
          whereLabel: "6e (6h) → « 61. Intersection d'une conique et d'une droite »",
        },
      ],
    },
    {
      id: 'tangentes',
      number: 5,
      title: 'Tangentes à une conique',
      kicker: "Chaque conique est l'union de deux graphiques : dériver le bon.",
      blocks: [
        {
          kind: 'para',
          text:
            "Une conique n'est pas le graphique d'une fonction : la verticale d'abscisse $x$ la rencontre en général en deux points. Mais elle est l'**union de deux graphiques de fonctions** (section 1) — et la tangente en un point $P$ de la conique est simplement la tangente au graphique de celle de ces deux fonctions qui contient $P$.",
        },
        {
          kind: 'methode',
          label: 'Méthode — tangente en un point d\'une conique',
          items: [
            "(1) Écrire la conique comme union de deux graphiques $y=\\pm f(x)$ ; (2) choisir la branche qui contient $P(x_P;y_P)$ — celle du haut si $y_P>0$, celle du bas si $y_P<0$ ; (3) dériver cette fonction et évaluer en $x_P$ : c'est la **pente** de la tangente ; (4) écrire $y-y_P = f'(x_P)(x-x_P)$.",
          ],
        },
        { kind: 'subheading', text: 'Cas de l\'ellipse — la dérivation complète' },
        {
          kind: 'para',
          text: "Soient l'ellipse d'équation $x^2/a^2+y^2/b^2=1$ et un point $P(x_P;y_P)$ de cette ellipse.",
        },
        {
          kind: 'exemple',
          badge: 'Démonstration — pente de la tangente en P',
          steps: [
            { tag: 'P est sur l\'ellipse', text: '$\\dfrac{x_P^2}{a^2}+\\dfrac{y_P^2}{b^2}=1 \\iff b^2x_P^2+a^2y_P^2=a^2b^2$' },
            { tag: 'on isole yP', text: '$\\iff y_P = \\pm\\dfrac{b}{a}\\sqrt{a^2-x_P^2}$' },
            { tag: 'branche supérieure', text: '$\\text{on considère } y_P>0 : \\; y_P = \\dfrac{b}{a}\\sqrt{a^2-x_P^2}$' },
            { tag: 'la fonction dont P est un point', text: '$f(x) = \\dfrac{b}{a}\\sqrt{a^2-x^2}, \\; x_P \\in \\,]-a;a[$' },
          ],
          result: { tag: 'dérivée, puis a√(a²−xP²) = a²yP/b', text: "$f'(x_P) = -\\dfrac{bx_P}{a\\sqrt{a^2-x_P^2}} = -\\dfrac{b^2x_P}{a^2y_P}$" },
        },
        {
          kind: 'para',
          text:
            "La seconde écriture, $-b^2x_P/(a^2y_P)$, est la forme utile : elle ne contient plus de racine et vaut aussi pour la branche inférieure ($y_P<0$), la démonstration étant identique au signe près.",
        },
        {
          kind: 'definition',
          label: 'À retenir — équation de la tangente, forme « dédoublée »',
          items: [
            "En développant $y-y_P = -\\dfrac{b^2x_P}{a^2y_P}(x-x_P)$ et en utilisant $b^2x_P^2+a^2y_P^2=a^2b^2$, on obtient une forme symétrique dite **dédoublée**, car elle s'obtient de l'équation de la conique en remplaçant $x^2$ par $x\\cdot x_P$ et $y^2$ par $y\\cdot y_P$ :",
            "ellipse : $\\dfrac{x\\,x_P}{a^2} + \\dfrac{y\\,y_P}{b^2} = 1$   hyperbole : $\\dfrac{x\\,x_P}{a^2} - \\dfrac{y\\,y_P}{b^2} = 1$   parabole : $y\\,y_P = p(x+x_P)$",
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — tangente à x²/25+y²/16=1 au point P(3 ; 16/5)',
          blocks: [
            {
              kind: 'para',
              text:
                "**1) Vérifier que P est sur l'ellipse.** $9/25+(16/5)^2/16 = 9/25+16/25 = 1$ ✓. Ici $a=5$, $b=4$, $y_P=16/5>0$ : c'est la branche supérieure $f(x)=(4/5)\\sqrt{25-x^2}$.",
            },
            {
              kind: 'para',
              text:
                "**2) Pente.** $f'(3) = -\\dfrac{b^2x_P}{a^2y_P} = -\\dfrac{16\\times3}{25\\times(16/5)} = -\\dfrac{48}{80} = -\\dfrac{3}{5}$ Contrôle par la première écriture : $-bx_P/(a\\sqrt{a^2-x_P^2}) = -(4\\times3)/(5\\times4) = -3/5$ ✓.",
            },
            {
              kind: 'para',
              text:
                "**3) Équation de la tangente.** $y-\\dfrac{16}{5} = -\\dfrac{3}{5}(x-3) \\iff y = -\\dfrac{3}{5}x+5 \\iff 3x+5y=25$",
            },
            {
              kind: 'para',
              text:
                "**4) Contrôle par la forme dédoublée.** $x\\cdot3/25+y\\cdot(16/5)/16=1 \\iff 3x/25+y/5=1 \\iff 3x+5y=25$ ✓ — même droite.",
            },
            {
              kind: 'para',
              text:
                "**5) Contrôle par le discriminant.** En substituant $y=-(3/5)x+5$ dans $16x^2+25y^2=400$ : $16x^2+9x^2-150x+625-400 = 25x^2-150x+225 = 25(x-3)^2$. Racine **double** en $x=3$, donc $\\Delta=0$ : la droite est bien tangente, et le point de contact est bien $P$ ✓.",
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
            curves: [
              { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
            ],
            vectors: [{ from: { x: -6.5, y: 5 - 0.6 * -6.5 }, to: { x: 6.5, y: 5 - 0.6 * 6.5 }, tone: 'attn', arrow: false }],
            points: [{ x: 3, y: 3.2, label: 'P', tone: 'ink', labelPos: 'right' }],
            caption:
              "Tangente à l'ellipse x²/25+y²/16=1 au point P(3;3,2) : droite 3x+5y=25, de pente −3/5. Elle touche l'ellipse en P et ne la recoupe nulle part.",
          },
        },
        {
          kind: 'piege',
          label: "Les sommets de l'axe focal n'ont pas de pente",
          text:
            "Aux sommets $(\\pm a;0)$ d'une ellipse (ou d'une hyperbole), $y_P=0$ : la formule $-b^2x_P/(a^2y_P)$ **n'a pas de sens** (division par zéro), et $f$ n'y est d'ailleurs pas dérivable. C'est normal : la tangente y est **verticale**, d'équation $x=\\pm a$. La forme dédoublée, elle, reste valable et donne directement $x(\\pm a)/a^2=1 \\iff x=\\pm a$.",
        },
        {
          kind: 'piege',
          label: 'Dériver la mauvaise branche',
          text:
            "Pour $y_P<0$, c'est la branche $y=-f(x)$ qu'il faut dériver ; utiliser $f$ donne une pente de **signe opposé** et une tangente symétrique de la bonne par rapport à l'axe des abscisses — une erreur invisible sur le calcul, très visible sur un croquis. Faire systématiquement un croquis rapide pour vérifier de quel côté la tangente doit pencher.",
        },
        {
          kind: 'astuce',
          label: 'La forme dédoublée évite entièrement la dérivation',
          text:
            "Une fois établie, la forme dédoublée s'écrit sans aucun calcul de dérivée, ne présente aucun cas particulier (sommets compris) et se retient très facilement : on remplace, dans l'équation de la conique, $x^2$ par $xx_P$, $y^2$ par $yy_P$, $x$ par $(x+x_P)/2$ et $y$ par $(y+y_P)/2$. Elle reste cependant à **justifier** par la dérivation lorsque l'énoncé demande la démarche.",
        },
        {
          kind: 'entrainement',
          title: 'Tangentes à une conique',
          generatorId: '6gen62',
          description: [
            "Déterminer la tangente à une conique en un point donné, par dérivation ou par la forme dédoublée, avec contrôle par le discriminant.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 62. Tangentes à une conique »',
        },
      ],
    },
    {
      id: 'optique',
      number: 6,
      title: 'Propriétés optiques des coniques',
      kicker: 'Un rayon lumineux, une tangente, un foyer — trois miroirs, une seule loi.',
      blocks: [
        {
          kind: 'para',
          text:
            "Un rayon lumineux qui frappe un miroir courbe se réfléchit selon la loi de Descartes : l'angle d'incidence et l'angle de réflexion, mesurés par rapport à la **tangente** au point d'impact, sont égaux. Les coniques ont, vis-à-vis de leurs foyers, exactement la propriété d'angles qui rend ces réflexions remarquables.",
        },
        { kind: 'subheading', text: 'A. La parabole' },
        {
          kind: 'definition',
          label: 'Propriété optique de la parabole',
          items: [
            "En tout point $P$ d'une parabole, la droite joignant $P$ au foyer $F$ et la parallèle à l'axe de symétrie passant par $P$ forment des angles aigus **de même amplitude** avec la tangente à la parabole en $P$.",
          ],
        },
        {
          kind: 'methode',
          label: 'Conséquences — le miroir parabolique',
          items: [
            'Dans un miroir parabolique :',
            "tout rayon lumineux **parallèle à l'axe** de symétrie est réfléchi **en direction du foyer** ;",
            "tout rayon lumineux **issu du foyer** est réfléchi **parallèlement à l'axe** de symétrie.",
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4, xMax: 4, yMin: -1, yMax: 6.5,
            curves: [{ fn: (x) => (x * x) / 4, tone: 'accent' }],
            vectors: [
              { from: { x: 3, y: 6.3 }, to: { x: 3, y: 2.25 }, tone: 'attn' },
              { from: { x: 2.25, y: 6.3 }, to: { x: 1.5, y: 0.5625 }, tone: 'attn' },
              { from: { x: -1.5, y: 6.3 }, to: { x: -1.5, y: 0.5625 }, tone: 'attn' },
              { from: { x: -3, y: 6.3 }, to: { x: -3, y: 2.25 }, tone: 'attn' },
              { from: { x: 3, y: 2.25 }, to: { x: 0, y: 1 }, tone: 'good' },
              { from: { x: 1.5, y: 0.5625 }, to: { x: 0, y: 1 }, tone: 'good' },
              { from: { x: -1.5, y: 0.5625 }, to: { x: 0, y: 1 }, tone: 'good' },
              { from: { x: -3, y: 2.25 }, to: { x: 0, y: 1 }, tone: 'good' },
            ],
            points: [{ x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'right' }],
            caption:
              'Miroir parabolique x²=4y (foyer F(0;1)) : quatre rayons parallèles à l\'axe, arrivant à des distances différentes de l\'axe, convergent tous exactement en F après réflexion.',
          },
        },
        {
          kind: 'astuce',
          label: 'Pourquoi les antennes et les phares sont paraboliques',
          text:
            "Une antenne parabolique reçoit des ondes venues d'un satellite très éloigné, donc pratiquement **parallèles** : elles se concentrent toutes au foyer, où l'on place le capteur. Un phare de voiture fonctionne dans l'autre sens : la source est placée au foyer, et le miroir renvoie un faisceau parallèle. Un four solaire exploite la première propriété, un télescope à réflexion aussi.",
        },
        { kind: 'subheading', text: "B. L'ellipse et l'hyperbole" },
        {
          kind: 'definition',
          label: "Propriété optique de l'ellipse et de l'hyperbole",
          items: [
            "Les droites joignant un point quelconque d'une ellipse (d'une hyperbole) à ses **foyers** forment des angles aigus **de même amplitude** avec la tangente à la courbe en ce point.",
            'Les démonstrations sont analogues à celle de la propriété de la parabole.',
          ],
        },
        {
          kind: 'methode',
          label: 'Conséquence — les miroirs elliptique et hyperbolique',
          items: [
            "Dans un miroir **elliptique** (**hyperbolique**), tout rayon lumineux issu d'un foyer est réfléchi selon une droite qui **passe par l'autre foyer**.",
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
              curves: [
                { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
                { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              ],
              vectors: [
                { from: { x: -3, y: 0 }, to: { x: 3, y: 3.2 }, tone: 'attn' },
                { from: { x: 3, y: 3.2 }, to: { x: 3, y: 0 }, tone: 'good' },
                { from: { x: -6.5, y: 5 - 0.6 * -6.5 }, to: { x: 6.5, y: 5 - 0.6 * 6.5 }, tone: 'ink', dashed: true, arrow: false },
              ],
              points: [
                { x: 3, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: -3, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
                { x: 3, y: 3.2, label: 'P', tone: 'ink', labelPos: 'right' },
              ],
              caption:
                "Miroir elliptique : quel que soit le point d'impact, un rayon parti de F′ repasse par F. La tangente y fait le même angle avec PF′ qu'avec PF.",
            },
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09, yMax: 6.09,
              curves: [
                { fn: (x) => 4 * r((x * x) / 9 - 1), tone: 'accent', xMin: 3, xMax: 6.5 },
                { fn: (x) => -4 * r((x * x) / 9 - 1), tone: 'accent', xMin: 3, xMax: 6.5 },
                { fn: (x) => 4 * r((x * x) / 9 - 1), tone: 'accent', xMin: -6.5, xMax: -3 },
                { fn: (x) => -4 * r((x * x) / 9 - 1), tone: 'accent', xMin: -6.5, xMax: -3 },
              ],
              vectors: [
                { from: { x: -5, y: 0 }, to: { x: 5, y: 16 / 3 }, tone: 'attn' },
                { from: { x: 5, y: 16 / 3 }, to: { x: 5, y: 0 }, tone: 'good' },
                { from: { x: 5 - 9 / 5, y: 0 }, to: { x: 5 + 9 / 5, y: 3 }, tone: 'ink', dashed: true, arrow: false },
              ],
              points: [
                { x: 5, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: -5, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
                { x: 5, y: 16 / 3, label: 'P', tone: 'ink', labelPos: 'right' },
              ],
              caption:
                'Miroir hyperbolique : en P, la tangente 5x−3y=9 fait des angles égaux avec PF et PF′ — un rayon dirigé vers un foyer repart comme s\'il venait de l\'autre.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'De l\'ellipse à la parabole : le second foyer part à l\'infini',
          text:
            "La propriété de la parabole est le **cas limite** de celle de l'ellipse. Si l'on éloigne indéfiniment le second foyer $F'$, les droites $PF'$ deviennent toutes parallèles entre elles — parallèles à l'axe. L'énoncé « $PF$ et $PF'$ font des angles égaux avec la tangente » devient alors « $PF$ et la parallèle à l'axe font des angles égaux avec la tangente » : exactement la propriété de la parabole. Une seule idée, trois formulations.",
        },
        {
          kind: 'piege',
          label: "L'ellipse ne concentre PAS les rayons parallèles",
          text:
            "La propriété de l'ellipse concerne **les deux foyers** : elle relie un foyer à l'autre, jamais une direction parallèle à un foyer. Un faisceau de rayons parallèles envoyé sur un miroir elliptique ne se concentre en **aucun** point — seul le miroir *parabolique* possède cette propriété. Symétriquement, un rayon issu du foyer d'une parabole ne repasse par aucun « second foyer » : la parabole n'en a qu'un.",
        },
        {
          kind: 'astuce',
          label: 'Applications concrètes des trois miroirs',
          text:
            "**Parabolique** : antenne satellite, phare, four solaire, télescope de Newton. **Elliptique** : lithotripsie (les ondes de choc émises depuis un foyer se concentrent sur le calcul rénal placé à l'autre foyer) et « galeries à écho ». **Hyperbolique** : le petit miroir secondaire d'un télescope de type Cassegrain, qui renvoie le faisceau vers l'oculaire sans déplacer le foyer effectif.",
        },
        {
          kind: 'entrainement',
          title: 'Propriétés optiques des coniques',
          generatorId: '6gen63',
          description: [
            "Retrouver, pour chaque conique, le trajet d'un rayon réfléchi à partir de la propriété de tangente aux foyers.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 63. Propriétés optiques des coniques »',
        },
      ],
    },
  ],
  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Parabole — définition', "lieu des points équidistants d'un point $F$ (foyer) et d'une droite $d$ (directrice), $p=\\text{dist}(F;d)$"],
        ['Parabole — équation', "$y^2=2px$, avec $F(p/2;0)$ et $d\\equiv x=-p/2$ ; sommet à l'origine"],
        ['Parabole — 4 orientations', 'y²=±2px (axe focal horizontal), x²=±2py (axe focal vertical) — le carré donne l\'axe, le signe le sens'],
        ["Ellipse — définition", "$|PF|+|PF'|=2a$, $|FF'|=2c$, existe ssi $a>c$"],
        ['Ellipse — équation', "$x^2/a^2+y^2/b^2=1$ avec $b^2=a^2-c^2$ ; sommets $(\\pm a;0)$, $(0;\\pm b)$ ; foyers $(\\pm c;0)$"],
        ['Ellipse — vocabulaire', 'grand axe $2a$, petit axe $2b$, distance focale $2c$ ; 2 axes de symétrie, 1 centre, 4 sommets'],
        ['Cercle et ellipse', "toute ellipse = cercle comprimé du facteur $b/a$ ; $c=0 \\implies b=a \\implies x^2+y^2=a^2$"],
        ["Hyperbole — définition", "$\\big||PF|-|PF'|\\big|=2a$, existe ssi $c>a$ ; 2 branches"],
        ['Hyperbole — équation', '$x^2/a^2-y^2/b^2=1$ avec $b^2=c^2-a^2$ ; sommets $(\\pm a;0)$ ; asymptotes $y=\\pm(b/a)x$'],
        ['Hyperbole équilatère', "$c=a\\sqrt{2} \\implies x^2-y^2=a^2$, asymptotes $y=\\pm x$ perpendiculaires ; sur ses asymptotes : $xy=k$"],
        ['Caractérisation focale', '$\\text{dist}(P;F)/\\text{dist}(P;d) = e$ : $e<1$ ellipse, $e=1$ parabole, $e>1$ hyperbole ; cercle : $e=0$, sans directrice'],
        ['Excentricité et directrices', 'e = c/a ; directrices d\'une conique centrée : $x=\\pm a^2/c$'],
        ['Dandelin-Quételet', "foyers = contacts des 2 sphères inscrites avec le plan de section ; preuve par $|PF|+|PF'|=|PM|+|PM'|=|MM'|$"],
        ['Équation générale', '$mx^2+ny^2+qxy+rx+sy+t=0$, $(m;n;q)\\neq(0;0;0)$'],
        ['Réduction par translation', 'possible ssi **pas** de terme en $xy$ ; compléter les carrés, puis $x'+"'"+'=x-x_0$, $y'+"'"+'=y-y_0$'],
        ['Exemple résolu — réduction', "$16x^2-36y^2+80x+252y-197=0 \\to y'^2/4-x'^2/9=1$, centre $O'(-5/2;7/2)$, $a=2$, $b=3$, $c=\\sqrt{13}$"],
        ['Rayons focaux et aire', "système $\\{|PF|+|PF'|=2a \\; ; \\; |PF|=k|PF'|\\}$, loi des cosinus avec $4c^2$, puis $\\tfrac12|PF||PF'|\\sin$"],
        ['Exemple résolu — aire', "$a=5$, $b=4$, $k=2 \\to |PF'|=10/3$, $|PF|=20/3$, $\\cos=11/25$, aire $=8\\sqrt{14}/3\\approx9{,}98$"],
        ['Excentricité par condition', "$b=c$ ou angle droit en $B(0;b) \\to e=\\sqrt{2}/2$ ; $2a/e = k\\cdot2ae \\to e=1/\\sqrt{k}$"],
        ['Intersection droite-conique', 'substituer, résoudre le 2e degré : $\\Delta>0$ sécante, $\\Delta=0$ tangente, $\\Delta<0$ extérieure — jamais plus de 2 points'],
        ['Exemple résolu — intersection', '$175x^2+808x-1424=0 \\to x=(-404\\pm48\\sqrt{179})/175$, $y=(-222\\mp36\\sqrt{179})/175$'],
        ['Tangente — par la dérivée', "choisir la branche contenant $P$, puis pente $f'(x_P) = -b^2x_P/(a^2y_P)$ pour l'ellipse"],
        ['Tangente — forme dédoublée', "$xx_P/a^2 \\pm yy_P/b^2 = 1$ (ellipse / hyperbole) ; $yy_P=p(x+x_P)$ (parabole)"],
        ['Exemple résolu — tangente', "ellipse $x^2/25+y^2/16=1$, $P(3;16/5) \\to$ pente $-3/5$, tangente $3x+5y=25$, $\\Delta=0$ ✓"],
        ['Propriété optique — parabole', "rayon parallèle à l'axe ⟶ réfléchi vers le foyer ; rayon issu du foyer ⟶ réfléchi parallèlement à l'axe"],
        ['Propriété optique — ellipse / hyperbole', "$PF$ et $PF'$ font des angles égaux avec la tangente en $P$ ; rayon issu d'un foyer ⟶ passe par l'autre foyer"],
      ],
    },
    forward:
      "La caractérisation focale — un même rapport de distances qui engendre trois courbes distinctes selon sa valeur — est un bel exemple de la façon dont un seul énoncé algébrique peut recouvrir des objets géométriques a priori très différents ; c'est aussi, avec les propriétés optiques, l'aboutissement du programme de géométrie analytique de la 6e.",
    entrainement: {
      kind: 'entrainement',
      title: 'Les coniques — quiz vrai/faux',
      generatorId: '6gen73',
      description: [
        'Affirmations vrai/faux réparties par thème qui reprennent tout ce chapitre. Un seul essai par question, la justification est toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 73. Les coniques — quiz vrai/faux »',
    },
  },
}
