import type { ChapterContent } from '../../types'

// Excès de sécurité systématique pour toute expression sous une racine construite à partir d'une
// relation foyer-directrice ou d'une équation implicite (ellipse/hyperbole/parabole) : le
// sur-échantillonnage de VectorPlane (60 points par courbe) peut tomber tout près d'une borne de
// domaine où l'expression vaut 0 à l'erreur d'arrondi flottant près — sans ce garde-fou, un sqrt
// d'un nombre infinitésimalement négatif produit NaN et casse le tracé du path SVG.
const r = (x: number) => Math.sqrt(Math.max(0, x))

// Texte brut (sans échappement des barres obliques inverses) pour les champs RichText chargés de
// LaTeX : `R\`$\dfrac{x^2}{a^2}$\`` au lieu de `'$\\dfrac{x^2}{a^2}$'`.
const R = String.raw

// Figures : TOUTES isotropes (viewBox 320 × 300 → domaine au rapport 16/15 : un cercle reste rond,
// une asymptote garde sa pente), aucune courbe hors du cadre (les branches d'hyperbole sont tracées
// en x = f(y) sur la hauteur du cadre, `curvesOfY`), étiquettes jamais posées sur une courbe.
// Contrôle : `check.mjs` du dossier de travail `afd-6e10`.

export const coniques: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 10,
  title: 'Les coniques',
  slug: 'coniques',
  lede:
    "Parabole, ellipse, hyperbole : trois courbes, mais un seul cône ! Coupe-le sous des angles différents, et tu obtiens l'une ou l'autre. Les trois partagent aussi la même définition : le rapport entre la distance à un point (le **foyer**) et la distance à une droite (la **directrice**) y reste constant — cette constante $e$, c'est l'**excentricité**. Dans ce chapitre, tu vas construire leurs équations, apprendre à les reconnaître derrière une équation générale $mx^2+ny^2+qxy+rx+sy+t=0$, les couper par une droite, leur mener une tangente — et comprendre pourquoi un miroir parabolique concentre toute la lumière en un seul point.",
  sections: [
    {
      id: 'identifier',
      number: 1,
      title: 'Identifier et caractériser une conique',
      kicker: 'Parabole, ellipse, hyperbole : trois lieux, une même démarche.',
      titreCourt: 'Les trois coniques',
      partie: 'Trois courbes, un seul nombre e',
      essentiel: [
        R`Parabole : $|PF|=\text{dist}(P\,;d)$, $p=\text{dist}(F\,;d)$, équation $y^2=2px$ avec $F\left(\frac{p}{2}\,;0\right)$ et $d\equiv x=-\frac{p}{2}$.`,
        R`Ellipse : $|PF|+|PF'|=2a$ ($a>c$), $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ avec $b^2=a^2-c^2$ ; hyperbole : $\big||PF|-|PF'|\big|=2a$ ($c>a$), $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ avec $b^2=c^2-a^2$, asymptotes $y=\pm\dfrac{b}{a}x$.`,
        R`$a^2$ est toujours sous le carré de l'axe focal : le plus grand dénominateur pour l'ellipse, le terme positif pour l'hyperbole. Hyperbole équilatère : $x^2-y^2=a^2$, et $XY=\dfrac{a^2}{2}$ dans le repère de ses asymptotes.`,
      ],
      cartes: [
        { question: R`Où sont le foyer et la directrice de la parabole $y^2=2px$ ?`, reponse: R`$F\left(\dfrac{p}{2}\,;0\right)$ et $d\equiv x=-\dfrac{p}{2}$ : le sommet est à mi-chemin, à la distance $\dfrac{p}{2}$ des deux.` },
        { question: R`Ellipse $\dfrac{x^2}{9}+\dfrac{y^2}{25}=1$ : quel est son axe focal et où sont ses foyers ?`, reponse: R`$a^2=25$ est sous $y^2$ : axe focal vertical, $c^2=25-9=16$, foyers $(0\,;\pm4)$.` },
        { question: R`Hyperbole $\dfrac{x^2}{9}-\dfrac{y^2}{16}=1$ : foyers et asymptotes ?`, reponse: R`$c^2=9+16=25$ : foyers $(\pm5\,;0)$ ; asymptotes $y=\pm\dfrac{4}{3}x$.` },
        { question: R`Que devient $x^2-y^2=8$ dans le repère de ses asymptotes ?`, reponse: R`$XY=\dfrac{a^2}{2}=4$ (et non $8$).` },
      ],
      blocks: [
        { kind: 'video', title: 'Identifier une conique (1/5) : la parabole — lampe de poche, foyer-directrice, construction', youtubeId: 'rvNL1CDMuNE' },
        { kind: 'video', title: "Identifier une conique (2/5) : l'ellipse — définition, construction par deux cercles, équation", youtubeId: 'GnBXVzw0vKY' },
        { kind: 'video', title: "Identifier une conique (3/5) : l'ellipse — caractéristiques, axes, sommets, cercle aplati", youtubeId: 'g1CRzs4qeAk' },
        { kind: 'video', title: "Identifier une conique (4/5) : l'hyperbole — définition, construction, équation par les génératrices", youtubeId: 'oAIMvlSz3io' },
        { kind: 'video', title: "Identifier une conique (5/5) : l'hyperbole — asymptotes, rectangle, hyperbole équilatère, xy=k", youtubeId: 'hHaOR0ULXS8' },
        {
          kind: 'para',
          text:
            "Chacune des trois coniques se définit par une condition de distance, se construit point par point à la règle et au compas, et a une équation **simple** — à condition de bien choisir le repère ! Cette section les parcourt toutes les trois, toujours dans le même ordre : définition → construction → équation → caractéristiques → importance du repère.",
        },
        {
          kind: 'intuition',
          label: 'Pourquoi « coniques » ? La lampe de poche',
          text:
            "Pointe une lampe de poche bien droit vers un mur : tu obtiens un **cercle** de lumière. Incline-la un peu : le cercle s'étire en **ellipse**. Incline-la encore, jusqu'à ce que le bord du faisceau devienne parallèle au mur : tu obtiens une **parabole**. Incline-la plus loin : c'est une **hyperbole**. Le faisceau de la lampe, c'est un cône de lumière — et chaque forme est juste une **coupe** de ce cône, selon l'angle du mur. D'où le nom : sections **coniques**.",
        },
        {
          kind: 'historique',
          titre: 'Le mathématicien qui a nommé ces trois courbes il y a 2200 ans',
          text:
            'Le savant grec **Apollonius de Perga** (IIIᵉ–IIᵉ siècle av. J.-C.) écrit un traité ' +
            'en huit livres, intitulé **Coniques**, qui reste pendant près de 2000 ans la ' +
            "référence sur ces courbes — c'est lui qui invente les noms « ellipse », " +
            '« parabole » et « hyperbole » que tu utilises aujourd\'hui, choisis d\'après des ' +
            'mots grecs signifiant respectivement « défaut », « égalité » et « excès ». ' +
            "Contrairement à ce que tu viens de voir avec la lampe de poche, Apollonius ne " +
            'dispose d\'aucune des notions modernes (repère, équation, fonction) : il obtient ' +
            'tous ses résultats par des raisonnements purement géométriques, en coupant un ' +
            "seul cône sous des angles différents — exactement l'idée que tu viens d'utiliser. " +
            'Sur les huit livres de son traité, quatre seulement nous sont parvenus en grec ; ' +
            "les trois suivants n'ont survécu que grâce à une traduction arabe du IXᵉ siècle, " +
            'et le dernier est définitivement perdu.',
          image: {
            src: '/images/historique/apollonius.jpg',
            alt: "Gravure imaginaire représentant Apollonius de Perga, édition de 1537",
            caption:
              "Apollonius de Perga, représentation imaginaire tirée d'une édition de 1537 de " +
              "son œuvre — aucun portrait contemporain d'Apollonius n'existe.",
          },
        },
        { kind: 'subheading', text: 'A. La parabole' },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà (4e)',
          text:
            R`Au chapitre 7 de 4e (géométrie analytique plane), tu as déjà rencontré la parabole comme lieu des points équidistants d'un foyer $F$ et d'une directrice $d$ : construction au compas, équation $x^2=2py$ quand le sommet est l'origine et l'axe vertical, puis $(x-x_S)^2=2p(y-y_S)$ après translation. Ici, on garde la même lettre et le même sens : $p=\text{dist}(F\,;d)$ — avec une seule différence d'écriture : $p$ est toujours **positif**, et c'est un signe dans l'équation ($y^2=-2px$, $x^2=-2py$) qui dit de quel côté la parabole s'ouvre. Cette partie va donc vite ; la nouveauté du chapitre, ce sont l'ellipse, l'hyperbole et ce qui réunit les trois.`,
        },
        {
          kind: 'definition',
          label: 'Définition — la parabole',
          items: [
            "On appelle **parabole** le lieu des points du plan situés à égale distance d'une droite (la **directrice** de la parabole) et d'un point n'appartenant pas à cette droite (le **foyer** de la parabole).",
            R`On note $F$ le foyer, $d$ la directrice, et $p = \text{dist}(F\,;d) > 0$ — ce nombre $p$ est le **paramètre** de la parabole.`,
          ],
        },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ce genre de définition',
          text:
            "« Le lieu des points qui vérifient telle condition de distance » : c'est exactement la même démarche que dans le chapitre sur les lieux géométriques ! Une conique n'est rien d'autre qu'un lieu géométrique particulier, défini par une condition sur des distances — ici, à un point et à une droite (la parabole), ou à deux points (l'ellipse et l'hyperbole, plus loin).",
        },
        {
          kind: 'methode',
          label: 'Méthode — construire la parabole point par point',
          items: [
            R`Tu cherches les points $A$ et $B$ de la parabole à distance $r$ de $F$ **et** de $d$ ? Ils se trouvent forcément sur le cercle de centre $F$ et de rayon $r$, **et** sur la parallèle à $d$ située à distance $r$ de $d$, du même côté que $F$.`,
            R`(1) choisis un réel $r \geq \frac{p}{2}$ ; (2) trace le cercle de centre $F$ et de rayon $r$, ainsi que la parallèle à $d$ à distance $r$ ; (3) marque le(s) point(s) d'intersection ; (4) recommence (2) et (3) avec d'autres valeurs de $r \geq \frac{p}{2}$.`,
          ],
        },
        {
          kind: 'piege',
          label: "La borne r ≥ p⁄2 n'est pas décorative",
          text:
            R`Pour $r < \frac{p}{2}$, le cercle et la parallèle ne se coupent **pas du tout** ! Aucun point de la parabole n'est jamais plus proche de $F$ que $\frac{p}{2}$. Pour $r = \frac{p}{2}$ pile, il n'y a qu'**un seul** point (le sommet). Pour $r > \frac{p}{2}$, il y en a exactement **deux**, symétriques par rapport à l'axe focal.`,
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
              { x: 2.25, y: 3, label: 'P', tone: 'ink', labelPos: 'above' },
              { x: -1, y: -3.1, label: 'd', tone: 'ink', node: false, labelPos: 'left' },
            ],
            caption:
              R`Parabole de foyer $F(1\,;0)$ et de directrice $d \equiv x=-1$ : $p=2$, équation $y^2=4x$. Pour tout point $P$ de la courbe, $|PF| = \text{dist}(P\,;d)$ — ici $3{,}25$ dans les deux cas.`,
          },
        },
        { kind: 'subheading', text: 'Équation cartésienne de la parabole' },
        {
          kind: 'para',
          text:
            R`Choisis un repère **orthonormé** : axe des abscisses perpendiculaire à $d$ et passant par $F$, axe des ordonnées parallèle à $d$, à égale distance de $F$ et de $d$. Dans ce repère, $F\left(\frac{p}{2}\,;0\right)$ et $d \equiv x = -\frac{p}{2}$.`,
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — équation de la parabole à partir du foyer et de la directrice",
          blocks: [
            { kind: 'para', text: R`Soit $P(x\,;y)$ un point du plan. **Définition** : $P \in \mathcal{P} \iff |FP| = \text{dist}(P\,;d)$.` },
            { kind: 'para', text: R`**Distances en coordonnées** : $\iff \sqrt{\left(x-\frac{p}{2}\right)^2+y^2} = \left|x+\frac{p}{2}\right|$.` },
            { kind: 'para', text: R`**Élévation au carré** (les deux membres sont positifs, c'est une équivalence) : $\iff \left(x-\frac{p}{2}\right)^2+y^2 = \left(x+\frac{p}{2}\right)^2$.` },
            { kind: 'para', text: R`**Développement** : $\iff x^2-px+\frac{p^2}{4}+y^2 = x^2+px+\frac{p^2}{4}$.` },
            { kind: 'para', text: R`**Simplification** : $\iff y^2 = 2px$.` },
          ],
        },
        {
          kind: 'para',
          text:
            R`Tu peux aussi retrouver cette équation par la **méthode des génératrices** : les points de la parabole sont obtenus comme intersections de droites et de cercles variables, et le paramètre de construction $r$ s'élimine entre les deux équations.`,
        },
        {
          kind: 'definition',
          label: 'À retenir — équation cartésienne de la parabole',
          items: [
            R`La parabole $\mathcal{P}$ de foyer $F\left(\frac{p}{2}\,;0\right)$ et de directrice $d \equiv x = -\frac{p}{2}$ a pour équation : $y^2 = 2px$. Son excentricité vaut $e=1$ (rapport des distances au foyer et à la directrice).`,
          ],
        },
        { kind: 'subheading', text: 'Caractéristiques de la parabole' },
        {
          kind: 'para',
          text:
            R`Transforme l'équation : $y^2 = 2px \iff y = \pm\sqrt{2px}$. La parabole est donc l'union du graphique de $f(x) = \sqrt{2px}$ et de son symétrique par rapport à l'axe des abscisses. Étudie $f$, et tu obtiens :`,
        },
        {
          kind: 'methode',
          label: 'Étude de la fonction associée',
          items: [
            R`$\text{dom}\,f = [0\,;+\infty[$`,
            R`pas d'asymptote, car $\lim\limits_{x\to+\infty} f(x) = +\infty$ et $\lim\limits_{x\to+\infty} \dfrac{f(x)}{x} = 0$`,
            R`dérivée première : $\forall x \in \,]0\,;+\infty[$, $f'(x) = \dfrac{p}{\sqrt{2px}} > 0$ — $f$ est strictement croissante`,
            R`en $0$, $f$ n'est pas dérivable : $\lim\limits_{x\to0^+} f'(x) = +\infty$ — la tangente au sommet est **verticale** (c'est l'axe des ordonnées, $x=0$)`,
            R`dérivée seconde : $\forall x \in \,]0\,;+\infty[$, $f''(x) = \dfrac{-p^2}{\sqrt{(2px)^3}} < 0$ — $f$ est concave`,
          ],
        },
        {
          kind: 'definition',
          label: 'Vocabulaire — axe focal et sommet',
          items: [
            R`La parabole a **un seul** axe de symétrie : il passe par le foyer et est perpendiculaire à la directrice — c'est l'**axe focal**. Le point où la parabole coupe cet axe est son **sommet** : le point de la parabole le plus proche du foyer et de la directrice, à distance $\frac{p}{2}$ des deux.`,
          ],
        },
        { kind: 'subheading', text: 'Importance du choix du repère' },
        {
          kind: 'para',
          text:
            "L'équation de la parabole est la plus simple dans un repère dont l'origine est le **sommet** et dont un axe est l'**axe focal**. Selon l'orientation choisie, tu obtiens l'une de ces quatre équations :",
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curvesOfY: [{ fn: (y) => (y * y) / 4, tone: 'accent' }],
              vectors: [{ from: { x: -1, y: -2.25 }, to: { x: -1, y: 2.25 }, tone: 'ink', dashed: true }],
              points: [
                { x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: -1, y: 1.7, label: 'd', tone: 'ink', node: false, labelPos: 'left' },
              ],
              caption: R`$F\left(\frac{p}{2}\,;0\right)$, $d \equiv x=-\frac{p}{2}$ → $y^2 = 2px$`,
            },
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curvesOfY: [{ fn: (y) => -(y * y) / 4, tone: 'accent' }],
              vectors: [{ from: { x: 1, y: -2.25 }, to: { x: 1, y: 2.25 }, tone: 'ink', dashed: true }],
              points: [
                { x: -1, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: 1, y: 1.7, label: 'd', tone: 'ink', node: false, labelPos: 'right' },
              ],
              caption: R`$F\left(-\frac{p}{2}\,;0\right)$, $d \equiv x=\frac{p}{2}$ → $y^2 = -2px$`,
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
              points: [
                { x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'right' },
                { x: -1.9, y: -1, label: 'd', tone: 'ink', node: false, labelPos: 'below' },
              ],
              caption: R`$F\left(0\,;\frac{p}{2}\right)$, $d \equiv y=-\frac{p}{2}$ → $x^2 = 2py$`,
            },
            {
              kind: 'vectorPlane',
              xMin: -2.4, xMax: 2.4, yMin: -2.25, yMax: 2.25,
              curves: [{ fn: (x) => -(x * x) / 4, tone: 'accent' }],
              vectors: [{ from: { x: -2.4, y: 1 }, to: { x: 2.4, y: 1 }, tone: 'ink', dashed: true }],
              points: [
                { x: 0, y: -1, label: 'F', tone: 'good', labelPos: 'right' },
                { x: -1.9, y: 1, label: 'd', tone: 'ink', node: false, labelPos: 'above' },
              ],
              caption: R`$F\left(0\,;-\frac{p}{2}\right)$, $d \equiv y=\frac{p}{2}$ → $x^2 = -2py$`,
            },
          ],
        },
        {
          kind: 'astuce',
          label: "Lire l'orientation directement sur l'équation",
          text:
            R`La variable au **carré** te donne l'axe focal, la variable au premier degré te donne le sens d'ouverture. $y^2=2px$ → axe focal = axe des $x$, ouverture vers les $x$ positifs. $x^2=-2py$ → axe focal = axe des $y$, ouverture vers les $y$ négatifs. Et dans tous les cas : le foyer est à distance $\frac{p}{2}$ du sommet, du côté de l'ouverture ; la directrice est de l'autre côté, à la même distance.`,
        },
        {
          kind: 'piege',
          label: 'Le coefficient de x vaut 2p, pas p',
          text:
            R`Dans $y^2=8x$, le coefficient $8$ vaut $2p$ : $p=4$, le foyer est en $\left(\frac{p}{2}\,;0\right)=(2\,;0)$ et la directrice est $x=-2$. Prendre $p=8$ (foyer en $(4\,;0)$) ou $p=2$ (foyer en $(1\,;0)$, la convention de certains livres qui écrivent $y^2=4px$) donne un foyer faux. Dans ce cours, $p$ est **toujours** la distance du foyer à la directrice.`,
        },
        { kind: 'subheading', text: "B. L'ellipse" },
        {
          kind: 'definition',
          label: "Définition — l'ellipse",
          items: [
            R`Une **ellipse**, c'est le lieu des points du plan dont la **somme** des distances à deux points fixes $F$ et $F'$ (les **foyers** de l'ellipse) reste **constante**.`,
            R`On note $|FF'| = 2c > 0$ la distance entre les foyers, et $2a > 0$ cette somme constante.`,
          ],
        },
        {
          kind: 'intuition',
          label: 'Le jardinier et ses deux piquets',
          text:
            "Un jardinier plante deux piquets, y noue une ficelle **lâche**, puis la tend avec la pointe d'un bâton et trace en faisant le tour : la courbe obtenue est une **ellipse** ! Ça marche parce que la longueur de la ficelle (fixe) est exactement la somme des distances aux deux piquets — les deux foyers. C'est pour ça qu'une ellipse a **deux** foyers, là où la parabole n'en a qu'un : sa définition repose sur une somme de deux distances, pas sur une seule.",
        },
        {
          kind: 'methode',
          label: "Méthode — construire l'ellipse point par point",
          items: [
            R`Tu cherches un point de l'ellipse à distance $r$ de $F$ ? Il est forcément sur le cercle de centre $F$ et de rayon $r$, **et** sur le cercle de centre $F'$ et de rayon $2a-r$ — leur somme vaut bien $2a$.`,
            R`(1) choisis $r$ avec $a-c \leq r \leq a+c$ ; (2) trace les deux cercles ; (3) marque leurs points d'intersection ; (4) recommence avec d'autres valeurs de $r$.`,
          ],
        },
        {
          kind: 'piege',
          label: "L'ellipse n'existe que si a > c",
          text:
            R`Tout ça n'a de sens que si $a > c$ ! Si $a < c$, le lieu est **vide** : la somme des distances aux deux foyers vaut toujours au moins $|FF'| = 2c$. Si $a = c$, tu obtiens le **segment** $[FF']$, pas une ellipse. Vérifie toujours $a > c$ avant de te lancer dans un calcul.`,
        },
        { kind: 'subheading', text: "Équation cartésienne de l'ellipse" },
        {
          kind: 'para',
          text:
            R`Prends un repère orthonormé : axe des abscisses passant par $F$ et $F'$, axe des ordonnées = médiatrice de $[FF']$. Dans ce repère, $F(c\,;0)$ et $F'(-c\,;0)$.`,
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — équation réduite de l'ellipse",
          blocks: [
            { kind: 'para', text: R`**Définition** : $P(x\,;y) \in \mathcal{E} \iff \sqrt{(x-c)^2+y^2} + \sqrt{(x+c)^2+y^2} = 2a$.` },
            { kind: 'para', text: R`**Élévation au carré** (deux membres positifs) : $\iff (x-c)^2+y^2+(x+c)^2+y^2+2\sqrt{(x-c)^2+y^2}\,\sqrt{(x+c)^2+y^2} = 4a^2$.` },
            { kind: 'para', text: R`**On isole le produit des racines et on divise par 2** : $\iff \sqrt{(x-c)^2+y^2}\,\sqrt{(x+c)^2+y^2} = 2a^2-c^2-x^2-y^2$.` },
            { kind: 'para', text: R`**Nouvelle élévation au carré.** Le membre de gauche est positif : l'équivalence n'est vraie que si le membre de droite l'est aussi, c'est-à-dire si $x^2+y^2 \leq 2a^2-c^2$. Sous cette condition : $\iff \big((x-c)^2+y^2\big)\big((x+c)^2+y^2\big) = (2a^2-c^2-x^2-y^2)^2$.` },
            { kind: 'para', text: R`**Regroupement en produit remarquable** : $\iff \big((x^2+y^2+c^2)-2cx\big)\big((x^2+y^2+c^2)+2cx\big) = \big(2a^2-(x^2+y^2+c^2)\big)^2$.` },
            { kind: 'para', text: R`**Termes semblables** : $\iff (a^2-c^2)x^2+a^2y^2 = a^2(a^2-c^2)$.` },
            { kind: 'para', text: R`**On pose** $b^2=a^2-c^2$, $b>0$ (possible car $a>c$) : $\iff b^2x^2+a^2y^2 = a^2b^2 \iff \dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$.` },
            { kind: 'para', text: R`**La condition posée est automatique.** Avec $2a^2-c^2=a^2+b^2$, elle s'écrit $x^2+y^2 \leq a^2+b^2$ ; or tout point solution de l'équation finale vérifie $\frac{x^2}{a^2} \leq 1$ et $\frac{y^2}{b^2} \leq 1$, donc $x^2 \leq a^2$ et $y^2 \leq b^2$. Toutes les équivalences sont donc justifiées.` },
          ],
        },
        {
          kind: 'definition',
          label: "À retenir — équation cartésienne de l'ellipse",
          items: [
            R`L'ellipse de foyers $F(c\,;0)$ et $F'(-c\,;0)$ dont les points se trouvent à des distances de $F$ et $F'$ dont la somme vaut $2a$, avec $a > c$, a pour équation : $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1 \quad \text{avec} \quad b^2 = a^2-c^2 \;\, (b>0)$`,
          ],
        },
        {
          kind: 'historique',
          titre: 'Comment Kepler a découvert que les planètes ne tournent pas en cercle',
          text:
            'Depuis l\'Antiquité, on décrit les mouvements des planètes par des cercles ' +
            '— autour de la Terre, avec des cercles qui roulent sur d\'autres cercles (les ' +
            '« épicycles »), puis, avec Copernic (1543), autour du Soleil. Au début du XVIIᵉ ' +
            "siècle, l'astronome allemand **Johannes Kepler** analyse des décennies " +
            "d'observations extrêmement précises de la planète Mars réalisées par Tycho " +
            "Brahe, et constate que ça ne colle pas : les écarts entre les positions " +
            'observées et celles que prédit un cercle sont trop grands pour être une erreur ' +
            'de mesure. Après des années de calculs à la main, il comprend vers 1605 que ' +
            "l'orbite de Mars est une **ellipse**, avec le Soleil placé en l'un de ses deux " +
            "foyers — jamais au centre — et le publie en 1609 dans son ouvrage « Astronomia nova ». " +
            "Cette découverte, aujourd'hui appelée la première loi de Kepler, s'applique à " +
            'toutes les planètes du Système solaire, y compris la Terre. Le point de ' +
            "l'orbite le plus proche du Soleil s'appelle le **périhélie** (distance $a-c$), " +
            "le plus éloigné l'**aphélie** (distance $a+c$).",
          image: {
            src: '/images/historique/kepler.jpg',
            alt: 'Portrait de Johannes Kepler',
            caption: "Johannes Kepler (1571–1630), portrait d'après un original de 1620.",
          },
        },
        { kind: 'subheading', text: "Caractéristiques de l'ellipse" },
        {
          kind: 'para',
          text:
            R`Même démarche : $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1 \iff y = \pm\dfrac{b}{a}\sqrt{a^2-x^2}$. L'ellipse est donc l'union du graphique de $f(x) = \dfrac{b}{a}\sqrt{a^2-x^2}$ et de son symétrique par rapport à l'axe des abscisses.`,
        },
        {
          kind: 'methode',
          label: 'Étude de la fonction associée',
          items: [
            R`$\text{dom}\,f = [-a\,;a]$ — donc **pas d'asymptote** (domaine borné)`,
            R`dérivée première : $f'(x) = \dfrac{-bx}{a\sqrt{a^2-x^2}}$ — positive dans $]-a\,;0[$, nulle en $0$, négative dans $]0\,;a[$ ; en $\pm a$, $f$ n'est pas dérivable (tangente verticale)`,
            R`dérivée seconde : $\forall x \in \,]-a\,;a[$, $f''(x) = \dfrac{-ab}{\sqrt{(a^2-x^2)^3}} < 0$ — concave`,
          ],
        },
        {
          kind: 'definition',
          label: 'Vocabulaire — axes, centre, sommets, grand et petit axe',
          items: [
            R`L'ellipse a **deux** axes de symétrie : l'**axe focal** passe par les foyers, l'**axe non focal** est la médiatrice de $[FF']$. Leur point d'intersection est le **centre** de l'ellipse. Les points où l'ellipse coupe ses axes de symétrie sont ses **sommets** — elle en a donc **quatre**.`,
            R`L'ellipse d'équation $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ a pour sommets $(a\,;0)$, $(-a\,;0)$, $(0\,;b)$ et $(0\,;-b)$. Les nombres $2a$, $2b$ et $2c$ (tous strictement positifs) portent chacun un nom : **grand axe**, **petit axe** et **distance focale**.`,
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09375, yMax: 6.09375,
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
              caption: R`Ellipse $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$ : $a=5$, $b=4$, $c=3$. Foyers $F(3\,;0)$ et $F'(-3\,;0)$, sommets $(\pm5\,;0)$ et $(0\,;\pm4)$. Pour tout point $P$ : $|PF|+|PF'| = 2a = 10$.`,
            },
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09375, yMax: 6.09375,
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
                R`Toute ellipse est un cercle « aplati » : le graphique de $f(x)=\dfrac{b}{a}\sqrt{a^2-x^2}$ s'obtient en multipliant par $\dfrac{b}{a}$ l'ordonnée de chaque point du cercle $g(x)=\sqrt{a^2-x^2}$ (ici $\frac{4}{5}$ : le point $(3\,;4)$ du cercle devient $(3\,;3{,}2)$).`,
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — l'ellipse est un cercle aplati",
          blocks: [
            { kind: 'para', text: R`Soit $\mathcal{C}$ le cercle $x^2+y^2=a^2$ et $0<b<a$. À tout point $M(x\,;y_M)$ du plan, associe le point $P\left(x\,;\frac{b}{a}\,y_M\right)$ : même abscisse, ordonnée multipliée par $\frac{b}{a}$. Inversement, $P(x\,;y)$ provient du point $M\left(x\,;\frac{a}{b}\,y\right)$.` },
            { kind: 'para', text: R`$P(x\,;y)$ provient d'un point du cercle $\iff x^2+\left(\frac{a}{b}\,y\right)^2=a^2 \iff x^2+\frac{a^2y^2}{b^2}=a^2$.` },
            { kind: 'para', text: R`En divisant par $a^2$ : $\iff \dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$. Les points obtenus sont exactement ceux de l'ellipse : l'ellipse est l'image du cercle de rayon $a$ par cet aplatissement vertical de rapport $\frac{b}{a}$.` },
          ],
        },
        {
          kind: 'astuce',
          label: "Le cercle est le cas c = 0 de l'ellipse",
          text:
            R`Si les deux foyers sont confondus ($c=0$), alors $b^2 = a^2-0 = a^2$, donc $b=a$. L'équation $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ devient $x^2+y^2=a^2$ : l'équation d'un cercle de centre $(0\,;0)$ et de rayon $a$ ! Un cercle, c'est donc juste une ellipse dont les deux foyers sont tombés au même endroit — le centre.`,
        },
        {
          kind: 'piege',
          label: "a² n'est pas toujours sous x²",
          text:
            R`L'équation de l'ellipse n'est simple que dans un repère dont les axes sont ses axes de symétrie. Si l'axe focal est l'axe des **abscisses** ($F(c\,;0)$, $F'(-c\,;0)$), l'équation est $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$. Si l'axe focal est l'axe des **ordonnées** ($F(0\,;c)$, $F'(0\,;-c)$), elle devient $\dfrac{y^2}{a^2} + \dfrac{x^2}{b^2} = 1$ — dans les deux cas avec $b^2=a^2-c^2$, et $b$ reste le petit demi-axe. C'est toujours le **plus grand dénominateur** qui est $a^2$ et désigne l'axe focal — jamais la position de $x$ ou de $y$ dans l'écriture !`,
        },
        { kind: 'subheading', text: "C. L'hyperbole" },
        {
          kind: 'definition',
          label: "Définition — l'hyperbole",
          items: [
            R`Une **hyperbole**, c'est le lieu des points du plan dont la **valeur absolue de la différence** des distances à deux points fixes $F$ et $F'$ (les **foyers**) reste constante.`,
            R`On note $|FF'| = 2c > 0$ la distance entre les foyers, et $2a > 0$ cette constante. Une hyperbole a **deux parties**, appelées ses **branches** : celle des points plus proches de $F$ ($|PF'|-|PF|=2a$) et celle des points plus proches de $F'$ ($|PF|-|PF'|=2a$).`,
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — construire l'hyperbole point par point",
          items: [
            R`Un point à distance $r$ de $F$ est forcément sur le cercle de centre $F$ et de rayon $r$, **et** sur le cercle de centre $F'$ et de rayon $2a+r$ — leur différence vaut bien $2a$.`,
            R`(1) choisis $r \geq c-a$ ; (2) trace les deux cercles ; (3) marque leurs intersections ; (4) recommence. Tu obtiens ainsi une seule branche ; l'autre s'obtient en échangeant les rôles de $F$ et $F'$.`,
          ],
        },
        {
          kind: 'piege',
          label: "L'hyperbole exige c > a, l'ellipse a > c",
          text:
            R`Pour l'hyperbole, il faut $c > a$ ! Si $c < a$, le lieu est **vide** ; si $a = c$, c'est la droite $FF'$ privée du segment $]FF'[$. L'inégalité est **exactement inversée** par rapport à l'ellipse — comme la relation entre $a$, $b$ et $c$ : $b^2=a^2-c^2$ pour l'ellipse, $b^2=c^2-a^2$ pour l'hyperbole. Ne recopie jamais l'une pour l'autre.`,
        },
        { kind: 'subheading', text: "Équation cartésienne de l'hyperbole — méthode des génératrices" },
        {
          kind: 'para',
          text:
            R`Repère orthonormé : abscisses passant par $F$ et $F'$, ordonnées = médiatrice de $[FF']$, donc $F(c\,;0)$ et $F'(-c\,;0)$. Cette fois, on part du **procédé de construction** : tout point de la branche proche de $F$ est sur le cercle $\mathcal{C}_1$ de centre $F$ et de rayon $r$ et sur le cercle $\mathcal{C}_2$ de centre $F'$ et de rayon $2a+r$. Ces deux cercles sont les **génératrices** ; il ne reste plus qu'à éliminer le paramètre $r$.`,
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — équation réduite de l'hyperbole par élimination du paramètre",
          blocks: [
            { kind: 'para', text: R`**Les deux génératrices** ($r \geq c-a$) : $\mathcal{C}_1 \equiv (x-c)^2+y^2 = r^2$ et $\mathcal{C}_2 \equiv (x+c)^2+y^2 = (2a+r)^2$.` },
            { kind: 'para', text: R`**On soustrait la première équation de la seconde** : $4cx = 4a^2+4ar$, donc $r = \dfrac{c}{a}x - a$.` },
            { kind: 'para', text: R`**On remplace** $r$ **dans** $\mathcal{C}_1$ : $(x-c)^2+y^2 = \left(\dfrac{c}{a}x-a\right)^2$.` },
            { kind: 'para', text: R`**Développement et regroupement** : $x^2-2cx+c^2+y^2 = \dfrac{c^2}{a^2}x^2-2cx+a^2 \iff \left(\dfrac{a^2-c^2}{a^2}\right)x^2 + y^2 = a^2-c^2$.` },
            { kind: 'para', text: R`**On pose** $b^2=c^2-a^2$, $b>0$ (possible car $c>a$) : $-\dfrac{b^2}{a^2}x^2 + y^2 = -b^2$, puis, en divisant par $-b^2$ : $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1$.` },
            { kind: 'para', text: R`**Analyse du lieu.** La condition $r = \frac{c}{a}x - a \geq c-a$ impose $x \geq a$ : ces génératrices ne donnent que la branche de droite. Pour l'autre branche, on échange les rôles de $F$ et $F'$ (cercle de centre $F'$ et de rayon $r$, cercle de centre $F$ et de rayon $2a+r$), ce qui donne la même équation avec $x \leq -a$. Inversement, tout point de cette équation vérifie $|x|\geq a$ et provient de l'une des deux constructions : l'équation décrit exactement les deux branches.` },
          ],
        },
        {
          kind: 'definition',
          label: "À retenir — équation cartésienne de l'hyperbole",
          items: [
            R`L'hyperbole de foyers $F(c\,;0)$ et $F'(-c\,;0)$ dont les points se trouvent à des distances de $F$ et $F'$ dont la valeur absolue de la différence vaut $2a$, avec $c > a$, a pour équation : $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1 \quad \text{avec} \quad b^2 = c^2-a^2 \;\, (b>0)$`,
          ],
        },
        { kind: 'subheading', text: "Caractéristiques de l'hyperbole" },
        {
          kind: 'para',
          text:
            R`$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1 \iff y = \pm\dfrac{b}{a}\sqrt{x^2-a^2}$ : l'hyperbole est donc l'union du graphique de $f(x) = \dfrac{b}{a}\sqrt{x^2-a^2}$ et de son symétrique par rapport à l'axe des abscisses.`,
        },
        {
          kind: 'methode',
          label: 'Étude de la fonction associée',
          items: [
            R`$\text{dom}\,f = \,]-\infty\,;-a] \cup [a\,;+\infty[$`,
            R`asymptotes obliques : $AO_{+\infty} \equiv y = \dfrac{b}{a}x$ et $AO_{-\infty} \equiv y = -\dfrac{b}{a}x$ (démonstration ci-dessous)`,
            R`dérivée première : $f'(x) = \dfrac{bx}{a\sqrt{x^2-a^2}}$ — positive dans $]a\,;+\infty[$, négative dans $]-\infty\,;-a[$ ; en $\pm a$, tangente verticale`,
            R`dérivée seconde : $\forall x \in \,]-\infty\,;-a[\,\cup\,]a\,;+\infty[$, $f''(x) = \dfrac{-ab}{\sqrt{(x^2-a^2)^3}} < 0$`,
          ],
        },
        {
          kind: 'definition',
          label: 'Vocabulaire — axes, centre, sommets, asymptotes',
          items: [
            R`L'hyperbole a **deux** axes de symétrie : l'**axe focal** passe par les foyers, l'**axe non focal** est la médiatrice de $[FF']$. Leur intersection est le **centre**. Les points où l'hyperbole coupe ses axes de symétrie sont ses **sommets** — elle en a **deux**, tous deux sur l'axe focal. Elle a aussi **deux asymptotes**, qui passent par le centre.`,
            R`L'hyperbole d'équation $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ a pour sommets $(a\,;0)$ et $(-a\,;0)$, pour foyers $(c\,;0)$ et $(-c\,;0)$, et pour asymptotes les droites $y = \dfrac{b}{a}x$ et $y = -\dfrac{b}{a}x$.`,
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 6.5, yMin: -6.09375, yMax: 6.09375,
            curvesOfY: [
              { fn: (y) => 3 * r(1 + (y * y) / 16), tone: 'accent' },
              { fn: (y) => -3 * r(1 + (y * y) / 16), tone: 'accent' },
            ],
            vectors: [
              { from: { x: -4.5703, y: -6.09375 }, to: { x: 4.5703, y: 6.09375 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: -4.5703, y: 6.09375 }, to: { x: 4.5703, y: -6.09375 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: 3, y: 4 }, to: { x: 3, y: -4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 3, y: -4 }, to: { x: -3, y: -4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -3, y: -4 }, to: { x: -3, y: 4 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -3, y: 4 }, to: { x: 3, y: 4 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 5, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: -5, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
              { x: 3, y: 0, label: 'S', tone: 'ink', labelPos: 'left' },
              { x: -3, y: 0, label: "S'", tone: 'ink', labelPos: 'right' },
            ],
            caption:
              R`Hyperbole $\dfrac{x^2}{9}-\dfrac{y^2}{16}=1$ : $a=3$, $b=4$, $c=5$. Sommets $(\pm3\,;0)$, foyers $(\pm5\,;0)$, asymptotes $y=\pm\dfrac{4}{3}x$. Le rectangle en pointillé $(\pm a\,;\pm b)$ donne les asymptotes par ses diagonales.`,
          },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — les asymptotes de l'hyperbole",
          blocks: [
            { kind: 'para', text: R`Sur la branche de droite, la moitié supérieure est le graphique de $f(x)=\dfrac{b}{a}\sqrt{x^2-a^2}$ ($x\geq a$). Montrons que $\lim\limits_{x\to+\infty}\left(f(x)-\dfrac{b}{a}x\right)=0$.` },
            { kind: 'para', text: R`**On multiplie par l'expression conjuguée** : $f(x)-\dfrac{b}{a}x=\dfrac{b}{a}\left(\sqrt{x^2-a^2}-x\right)=\dfrac{b}{a}\cdot\dfrac{(x^2-a^2)-x^2}{\sqrt{x^2-a^2}+x}=\dfrac{-ab}{\sqrt{x^2-a^2}+x}$.` },
            { kind: 'para', text: R`**Limite** : le dénominateur tend vers $+\infty$ quand $x\to+\infty$, donc la différence tend vers $0$ : la droite $y=\frac{b}{a}x$ est asymptote oblique en $+\infty$. Elle est même **négative** : la courbe reste sous son asymptote.` },
            { kind: 'para', text: R`**Les autres morceaux** s'en déduisent par symétrie : la moitié inférieure ($y=-f(x)$) a pour asymptote $y=-\frac{b}{a}x$ en $+\infty$, et la branche de gauche, symétrique de celle de droite par rapport à l'axe des ordonnées, admet les mêmes droites comme asymptotes en $-\infty$.` },
          ],
        },
        {
          kind: 'astuce',
          label: 'Tracer les asymptotes avant la courbe',
          text:
            R`Le rectangle de sommets $(\pm a\,;\pm b)$ — largeur $2a$, hauteur $2b$ — a pour diagonales exactement les deux asymptotes $y=\pm\frac{b}{a}x$ ! Trace ce rectangle, puis ses diagonales, puis la courbe qui part des sommets $(\pm a\,;0)$ en se collant aux diagonales : un tracé correct, sans calculer un seul point.`,
        },
        {
          kind: 'definition',
          label: "Hyperbole d'axe focal vertical",
          items: [
            R`Si les foyers sont $F(0\,;c)$ et $F'(0\,;-c)$, l'équation devient $\dfrac{y^2}{a^2} - \dfrac{x^2}{b^2} = 1$, toujours avec $b^2=c^2-a^2$. Ses sommets sont $(0\,;\pm a)$, ses asymptotes $y = \pm\dfrac{a}{b}x$, ses directrices (section 2) $y=\pm\dfrac{a^2}{c}$.`,
            R`Pour l'hyperbole, $a^2$ est sous le carré qui porte le signe **plus** — jamais forcément le plus grand dénominateur : dans $\dfrac{y^2}{4}-\dfrac{x^2}{9}=1$, $a^2=4$, $b^2=9$, $c^2=13$, et l'axe focal est vertical.`,
          ],
        },
        {
          kind: 'piege',
          label: 'La pente des asymptotes dépend de l’axe focal',
          text:
            R`Les asymptotes sont les diagonales du rectangle de côtés $2a$ (le long de l'axe focal) et $2b$. Axe focal horizontal : $y=\pm\frac{b}{a}x$. Axe focal vertical : $y=\pm\frac{a}{b}x$. Recopier $\frac{b}{a}$ pour une hyperbole d'axe vertical donne des asymptotes fausses. Le plus sûr : écrire l'équation avec un second membre nul, $\frac{y^2}{a^2}-\frac{x^2}{b^2}=0$, et la résoudre en $y$.`,
        },
        { kind: 'subheading', text: "Un cas particulier — l'hyperbole équilatère" },
        {
          kind: 'para',
          text:
            R`Quand $c = a\sqrt{2}$, alors $b^2 = c^2-a^2 = a^2$, donc $b = a$ : l'équation s'écrit $x^2 - y^2 = a^2$. Ses asymptotes sont les droites $y = \pm x$ — les bissectrices des axes de coordonnées, donc **perpendiculaires** entre elles ! C'est l'**hyperbole équilatère**.`,
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — l'hyperbole équilatère dans le repère de ses asymptotes",
          blocks: [
            { kind: 'para', text: R`Prends **les asymptotes elles-mêmes** comme axes : l'axe des $X$ porté par la droite $y=x$, l'axe des $Y$ porté par la droite $y=-x$, avec la même unité. Les nouvelles coordonnées d'un point $(x\,;y)$ sont ses distances signées à ces deux droites : $X=\dfrac{x+y}{\sqrt{2}}$ et $Y=\dfrac{x-y}{\sqrt{2}}$.` },
            { kind: 'para', text: R`**On factorise** : $x^2-y^2=(x+y)(x-y)=\sqrt{2}\,X\cdot\sqrt{2}\,Y=2XY$.` },
            { kind: 'para', text: R`**Conclusion** : $x^2-y^2=a^2 \iff 2XY=a^2 \iff XY=\dfrac{a^2}{2}$. Dans le repère de ses asymptotes, l'hyperbole équilatère a pour équation $XY=k$, avec $k=\dfrac{a^2}{2}$ ; ses axes de symétrie sont alors les droites $Y=X$ et $Y=-X$.` },
            { kind: 'para', text: R`**Dans l'autre sens**, l'hyperbole $xy=k$ ($k>0$, asymptotes = axes du repère) est équilatère, avec $a^2=2k$ : sommets $(\sqrt{k}\,;\sqrt{k})$ et $(-\sqrt{k}\,;-\sqrt{k})$, à la distance $a=\sqrt{2k}$ du centre ; foyers $(\sqrt{2k}\,;\sqrt{2k})$ et $(-\sqrt{2k}\,;-\sqrt{2k})$, à la distance $c=a\sqrt{2}=2\sqrt{k}$. Si $k<0$, les branches sont dans les quadrants II et IV.` },
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -4.5, xMax: 4.5, yMin: -4.21875, yMax: 4.21875,
              curvesOfY: [
                { fn: (y) => r(y * y + 4), tone: 'accent', yMin: -4.03, yMax: 4.03 },
                { fn: (y) => -r(y * y + 4), tone: 'accent', yMin: -4.03, yMax: 4.03 },
              ],
              vectors: [
                { from: { x: -4.21875, y: -4.21875 }, to: { x: 4.21875, y: 4.21875 }, tone: 'ink', dashed: true, arrow: false },
                { from: { x: -4.21875, y: 4.21875 }, to: { x: 4.21875, y: -4.21875 }, tone: 'ink', dashed: true, arrow: false },
              ],
              caption: R`Hyperbole équilatère $x^2-y^2=4$ ($a=b=2$, $c=2\sqrt{2}$) : asymptotes $y=\pm x$, perpendiculaires.`,
            },
            {
              kind: 'vectorPlane',
              xMin: -6, xMax: 6, yMin: -5.625, yMax: 5.625,
              curves: [
                { fn: (x) => 2 / x, tone: 'accent', xMin: 0.36, xMax: 6 },
                { fn: (x) => 2 / x, tone: 'accent', xMin: -6, xMax: -0.36 },
              ],
              points: [
                { x: Math.SQRT2, y: Math.SQRT2, label: '', tone: 'ink', node: true },
                { x: -Math.SQRT2, y: -Math.SQRT2, label: '', tone: 'ink', node: true },
              ],
              caption: R`La même courbe dans le repère de ses asymptotes : $XY=k$ avec $k=\dfrac{a^2}{2}=2$. Sommets $(\sqrt{2}\,;\sqrt{2})$ et $(-\sqrt{2}\,;-\sqrt{2})$, à la distance $a=2$ du centre ; axes de symétrie $Y=X$ et $Y=-X$.`,
            },
          ],
        },
        {
          kind: 'piege',
          label: 'k vaut a²⁄2, pas a²',
          text:
            R`Une équation $xy = k$ ne « ressemble » pas du tout à $\frac{x^2}{a^2}-\frac{y^2}{b^2}=1$, et pourtant les deux décrivent une hyperbole ! La première est écrite dans le repère des asymptotes, la seconde dans celui des axes de symétrie. En passant de l'une à l'autre, le **facteur 2** est le piège classique : $x^2-y^2=8$ devient $XY=4$, et $xy=3$ a pour demi-axe $a=\sqrt{6}$ (et non $\sqrt{3}$). Retiens aussi qu'un terme en $xy$ signale que les axes de symétrie de la conique ne sont **pas** parallèles aux axes de coordonnées (voir section 2).`,
        },
        {
          kind: 'astuce',
          label: "Distinguer les trois coniques en un coup d'œil sur l'équation réduite",
          text:
            "Une fois l'équation ramenée à sa forme réduite, un coup d'œil suffit : deux carrés **additionnés** égaux à 1 → **ellipse** (cercle si les deux dénominateurs sont égaux) ; deux carrés **soustraits** égaux à 1 → **hyperbole** (l'axe focal est celui de la variable dont le carré est positif) ; un seul carré, l'autre variable au premier degré → **parabole**.",
        },
        {
          kind: 'methode',
          label: "Méthode — représenter une conique à partir de son équation réduite",
          items: [
            R`(1) **Nature et axe focal** : lis le signe entre les carrés (ou l'unique carré de la parabole) et repère où se trouve $a^2$.`,
            R`(2) **Centre et sommets** (ou sommet et foyer de la parabole) : place le centre, puis $(\pm a\,;0)$ et, pour l'ellipse, $(0\,;\pm b)$ — ou l'équivalent sur l'axe vertical.`,
            R`(3) **Foyers** : calcule $c$ ($c^2=a^2-b^2$ pour l'ellipse, $c^2=a^2+b^2$ pour l'hyperbole) et place $(\pm c\,;0)$ ; pour la parabole, le foyer à $\frac{p}{2}$ du sommet du côté de l'ouverture et la directrice à $\frac{p}{2}$ de l'autre côté.`,
            R`(4) **Guides** : pour l'hyperbole, le rectangle $(\pm a\,;\pm b)$ et ses diagonales (les asymptotes) ; pour l'ellipse, le rectangle $(\pm a\,;\pm b)$ dans lequel elle s'inscrit.`,
            R`(5) **Tracé** : courbe lisse qui passe par les sommets, tangente verticale (ou horizontale) en chaque sommet, qui se colle aux asymptotes de l'hyperbole.`,
          ],
        },
        {
          kind: 'entrainement',
          title: 'Identifier et caractériser une conique',
          generatorId: '6gen58',
          description: [
            "Reconnais la nature d'une conique à partir de son équation (réduite, ou à réduire par translation), puis retrouve ses foyers, sommets et asymptotes.",
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
      kicker: 'Un seul énoncé, un seul nombre e, trois coniques.',
      titreCourt: 'Excentricité et réduction',
      partie: 'Trois courbes, un seul nombre e',
      essentiel: [
        R`Toute conique autre que le cercle est le lieu des points tels que $\dfrac{\text{dist}(P\,;F)}{\text{dist}(P\,;d)}=e$ : $0<e<1$ ellipse, $e=1$ parabole, $e>1$ hyperbole. Pour une conique centrée, $e=\dfrac{c}{a}$ et les directrices sont $x=\pm\dfrac{a^2}{c}$.`,
        R`Réduire une équation sans terme en $xy$ : compléter les carrés, puis translater l'origine au centre (ou au sommet). Un seul carré → parabole $(y-k)^2=2p(x-h)$.`,
        R`Une équation du second degré n'est pas toujours une conique : elle peut décrire un **point**, l'**ensemble vide** ou **deux droites** (cas dégénérés).`,
      ],
      cartes: [
        { question: R`Une conique a pour excentricité $e=\dfrac{3}{2}$. Quelle est sa nature ?`, reponse: R`$e>1$ : une hyperbole.` },
        { question: R`Directrices de l'ellipse $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$ ?`, reponse: R`$c=3$ : $x=\pm\dfrac{a^2}{c}=\pm\dfrac{25}{3}$ ; excentricité $\dfrac{3}{5}$.` },
        { question: R`Que décrit $(x-1)^2+4(y+2)^2=0$ ?`, reponse: R`Le seul point $(1\,;-2)$ : une somme de carrés positifs n'est nulle que si chaque carré l'est.` },
        { question: R`Sommet, foyer et directrice de $(y-2)^2=8(x-3)$ ?`, reponse: R`$2p=8$, $p=4$ : sommet $(3\,;2)$, foyer $(5\,;2)$, directrice $x=1$.` },
      ],
      blocks: [
        { kind: 'video', title: 'Excentricité (1/3) : un seul curseur e, trois courbes, caractérisation focale, équation générale', youtubeId: 'c1b3hbCqCl8' },
        { kind: 'video', title: 'Excentricité (2/3) : le cône de révolution et le théorème de Dandelin-Quételet (version 3D)', youtubeId: 'g_g7C0Xe3n4' },
        { kind: 'video', title: "Excentricité (3/3) : réduire l'équation d'une conique par translation", youtubeId: '8-PZoz8OWzM' },
        {
          kind: 'para',
          text:
            "Les trois coniques de la section 1 ont chacune leur propre définition. Et pourtant, il existe **un seul** énoncé qui les décrit toutes les trois à la fois ! C'est un seul nombre, l'excentricité, qui décide laquelle des trois tu obtiens.",
        },
        {
          kind: 'intuition',
          label: 'Un seul curseur, trois courbes',
          text:
            R`Imagine un curseur qui commande une seule valeur, l'excentricité $e$. À $e=0$, tu obtiens un cercle. Fais-le glisser un peu : le cercle s'étire en ellipse, de plus en plus allongée à mesure que $e$ se rapproche de 1. À $e=1$ pile, l'ellipse « s'ouvre » et devient une parabole. Continue à faire glisser le curseur au-delà de 1 : c'est une hyperbole, de plus en plus ouverte. Un seul nombre, un seul réglage — et les trois coniques défilent l'une après l'autre.`,
        },
        {
          kind: 'definition',
          label: "Propriété — une propriété commune de l'ellipse et de l'hyperbole",
          items: [
            R`Soient $a, b, c \in \mathbb{R}_0^+$, avec $c^2=a^2-b^2$ pour l'ellipse et $c^2=a^2+b^2$ pour l'hyperbole. L'ellipse d'équation $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ (ou l'hyperbole d'équation $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$) est le lieu des points du plan dont le rapport de la distance au point $F(c\,;0)$ à la distance à la droite $d \equiv x = \dfrac{a^2}{c}$ est constant et vaut $\dfrac{c}{a}$.`,
            R`Ce rapport constant est appelé **excentricité** et se note $e$ : on a donc $e = \dfrac{c}{a}$ — inférieure à 1 pour l'ellipse ($c<a$), supérieure à 1 pour l'hyperbole ($c>a$).`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — caractérisation foyer-directrice de l'ellipse",
          blocks: [
            { kind: 'para', text: R`**Condition de départ** : $\dfrac{|PF|}{\text{dist}(P\,;d)} = \dfrac{c}{a}$, avec $P(x\,;y)$, $F(c\,;0)$ et $d\equiv x=\frac{a^2}{c}$.` },
            { kind: 'para', text: R`**Produit en croix** : $\iff a\sqrt{(x-c)^2+y^2} = c\cdot\left|x-\dfrac{a^2}{c}\right| = |cx-a^2|$.` },
            { kind: 'para', text: R`**Élévation au carré** (deux membres positifs) : $\iff a^2(x^2-2cx+c^2+y^2) = c^2x^2-2a^2cx+a^4$.` },
            { kind: 'para', text: R`**Le terme** $-2a^2cx$ **s'élimine ; on regroupe** : $\iff (a^2-c^2)x^2+a^2y^2 = a^2(a^2-c^2)$.` },
            { kind: 'para', text: R`**Avec** $b^2 = a^2-c^2$ : $\iff b^2x^2+a^2y^2 = a^2b^2 \iff \dfrac{x^2}{a^2}+\dfrac{y^2}{b^2} = 1$.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — caractérisation foyer-directrice de l'hyperbole",
          blocks: [
            { kind: 'para', text: R`Les quatre premières étapes sont identiques (rien n'y suppose $c<a$) : $\dfrac{|PF|}{\text{dist}(P\,;d)} = \dfrac{c}{a} \iff (a^2-c^2)x^2+a^2y^2 = a^2(a^2-c^2)$.` },
            { kind: 'para', text: R`**Cette fois** $c>a$ **: on pose** $b^2 = c^2-a^2>0$, de sorte que $a^2-c^2=-b^2$ : $\iff -b^2x^2+a^2y^2 = -a^2b^2$.` },
            { kind: 'para', text: R`**Division par** $-a^2b^2$ : $\iff \dfrac{x^2}{a^2}-\dfrac{y^2}{b^2} = 1$. Le même foyer $F(c\,;0)$ et la même directrice $x=\frac{a^2}{c}$ décrivent cette fois les **deux** branches.` },
          ],
        },
        {
          kind: 'para',
          text:
            R`Tu peux facilement montrer qu'on peut remplacer $F(c\,;0)$ par $F'(-c\,;0)$, et la droite $d \equiv x=\frac{a^2}{c}$ par $d' \equiv x=-\frac{a^2}{c}$ (symétrie par rapport à l'axe des ordonnées). Les droites $d$ et $d'$ sont les **directrices** de la conique ; $F$ et $F'$ en sont les foyers. Pour l'ellipse, $\frac{a^2}{c}>a$ : les directrices sont à l'extérieur ; pour l'hyperbole, $\frac{a^2}{c}<a$ : elles passent entre les deux branches.`,
        },
        {
          kind: 'definition',
          label: 'À retenir — caractérisation focale, valable pour les trois coniques',
          items: [
            R`Toute **conique**, à l'exclusion du cercle, est le lieu des points du plan dont le rapport entre la distance à un point (le **foyer**) et la distance à une droite ne contenant pas ce point (la **directrice**) est une constante $e$ (l'**excentricité**) : $\dfrac{\text{dist}(P\,;F)}{\text{dist}(P\,;d)} = e$`,
            R`$0 < e < 1$ → la conique est une **ellipse** ; $e = 1$ → c'est une **parabole** (on retrouve la définition de la section 1) ; $e > 1$ → c'est une **hyperbole**.`,
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.5, xMax: 4, yMin: -3.046875, yMax: 3.046875,
            vectors: [{ from: { x: 0, y: -3.046875 }, to: { x: 0, y: 3.046875 }, tone: 'ink', dashed: true, arrow: false }],
            curves: [
              { fn: (x) => r(-0.75 * x * x + 2 * x - 1), tone: 'good', xMin: 2 / 3, xMax: 2 },
              { fn: (x) => -r(-0.75 * x * x + 2 * x - 1), tone: 'good', xMin: 2 / 3, xMax: 2 },
            ],
            curvesOfY: [
              { fn: (y) => (y * y + 1) / 2, tone: 'accent', yMin: -2.645, yMax: 2.645 },
              { fn: (y) => (-1 + r(4 + 3 * y * y)) / 3, tone: 'bad' },
              { fn: (y) => (-1 - r(4 + 3 * y * y)) / 3, tone: 'bad' },
            ],
            points: [
              { x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: 0, y: 2.6, label: 'd', tone: 'ink', node: false, labelPos: 'left' },
            ],
            caption:
              R`Trois coniques de même foyer $F(1\,;0)$ et de même directrice $d \equiv x=0$. Seule l'excentricité change : $e=0{,}5$ (ellipse, vert), $e=1$ (parabole, orange), $e=2$ (hyperbole à deux branches, rouge).`,
          },
        },
        {
          kind: 'astuce',
          label: 'Conique centrée ou non centrée',
          text:
            "**Conique centrée** désigne l'ellipse ou l'hyperbole, qui ont un centre de symétrie ; la parabole, elle, est une conique **non centrée**. Une conique centrée a toujours deux foyers et deux directrices ; une parabole n'en a qu'un et qu'une. Et le **cercle** ? Son excentricité est nulle, et il n'a **pas** de directrice — c'est pour ça qu'il est exclu de la caractérisation focale ci-dessus.",
        },
        {
          kind: 'methode',
          label: "Méthode — équation d'une conique à partir d'un foyer, d'une directrice et de l'excentricité",
          items: [
            R`(1) **Nature** : lis-la directement sur $e$ ($e<1$, $e=1$, $e>1$).`,
            R`(2) **Distances** : $\text{dist}(P\,;F)=\sqrt{(x-x_F)^2+(y-y_F)^2}$ ; pour la directrice $d\equiv ux+vy+w=0$, $\text{dist}(P\,;d)=\dfrac{|ux+vy+w|}{\sqrt{u^2+v^2}}$ (directrice verticale $x=k$ : $|x-k|$ ; horizontale $y=k$ : $|y-k|$).`,
            R`(3) **Élévation au carré** : $\text{dist}(P\,;F)^2=e^2\cdot\text{dist}(P\,;d)^2$ — sans oublier le **carré** de $e$.`,
            R`(4) **Développement** : tu obtiens l'équation sous la forme générale ; une équation proportionnelle (multipliée par un même nombre non nul) décrit la même conique.`,
            R`(5) **Contrôle** : réduis-la (voir plus bas) et vérifie que $\frac{c}{a}$ redonne bien $e$.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — foyer F(0 ; 1), directrice d ≡ y = 4, excentricité 1⁄2',
          blocks: [
            { kind: 'para', text: R`**Nature** : $e=\frac{1}{2}<1$, c'est une ellipse. La directrice est **horizontale** : $\text{dist}(P\,;d)=|y-4|$.` },
            { kind: 'para', text: R`**Équation** : $x^2+(y-1)^2=\dfrac{1}{4}(y-4)^2 \iff 4x^2+4y^2-8y+4=y^2-8y+16 \iff 4x^2+3y^2=12$.` },
            { kind: 'para', text: R`**Réduite** : $\dfrac{x^2}{3}+\dfrac{y^2}{4}=1$ — le plus grand dénominateur est sous $y^2$ : axe focal vertical, $a=2$, $b=\sqrt{3}$, $c=1$.` },
            { kind: 'para', text: R`**Contrôle** : foyer $(0\,;c)=(0\,;1)$ ✓, $e=\frac{c}{a}=\frac{1}{2}$ ✓, directrice $y=\frac{a^2}{c}=4$ ✓.` },
          ],
        },
        {
          kind: 'definition',
          label: "Équation générale d'une conique",
          items: [
            R`Si, dans un repère orthonormé, on fournit le foyer d'une conique, sa directrice et son excentricité, on peut en déterminer une équation cartésienne. Cette équation s'écrit toujours sous la forme générale : $m\,x^2 + n\,y^2 + q\,xy + r\,x + s\,y + t = 0$`,
            R`où $m, n, q, r, s, t \in \mathbb{R}$ et $(m\,;n\,;q) \neq (0\,;0\,;0)$ — au moins un terme du second degré est présent, sans quoi il s'agirait d'une droite. **La réciproque est fausse** : une équation de cette forme peut aussi décrire un point, deux droites ou l'ensemble vide (cas dégénérés, plus bas).`,
          ],
        },
        { kind: 'subheading', text: 'Coniques et cônes — le théorème de Dandelin-Quételet' },
        {
          kind: 'para',
          text:
            "Le mot « conique » n'est pas choisi au hasard ! Ces courbes s'obtiennent en coupant un **cône de révolution** (engendré par la rotation, autour d'un axe, d'une droite de l'espace qui coupe cet axe) par un plan ne passant pas par le sommet du cône. Selon la position de ce plan, la section est un **cercle** (plan perpendiculaire à l'axe), une **ellipse**, une **parabole** ou une **hyperbole** — exactement les quatre formes de la lampe de poche vues plus haut. Un plan qui passe par le sommet donne, lui, un point, une droite ou deux droites : les cas dégénérés.",
        },
        {
          kind: 'definition',
          label: 'Théorème de Dandelin-Quételet',
          items: [
            "La section d'un cône de révolution par un plan est une conique dont les **foyers** sont les points de contact avec ce plan des deux sphères inscrites dans ce cône et tangentes au plan, et les **directrices**, les intersections avec ce plan des deux plans contenant les cercles de contact de ces sphères avec le cône.",
            "Germinal Pierre Dandelin (1794–1847), mathématicien et ingénieur militaire, et Lambert Adolphe Jacques Quételet (1796–1874), fondateur de l'Observatoire royal de Belgique — ce théorème, publié en 1822, est aussi connu sous le nom de **théorème belge**.",
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — théorème de Dandelin-Quételet (cas de l'ellipse)",
          blocks: [
            {
              kind: 'para',
              text:
                R`Soit $P$ un point quelconque de l'ellipse. Considérons la droite passant par $P$ et le sommet du cône (une **génératrice** du cône) et désignons par $M$ et $M'$ les points où cette droite est tangente aux deux sphères.`,
            },
            { kind: 'para', text: R`$|PM| = |PF|$ : ce sont deux segments de tangentes menées de $P$ à la petite sphère.` },
            { kind: 'para', text: R`$|PM'| = |PF'|$ : deux segments de tangentes menées de $P$ à la grande sphère.` },
            { kind: 'para', text: R`$|PF| + |PF'| = |PM| + |PM'| = |MM'|$, car $M$ et $M'$ sont de part et d'autre de $P$ sur la génératrice.` },
            {
              kind: 'para',
              text:
                R`$|MM'|$ est la distance entre les deux cercles de contact **mesurée le long d'une génératrice** : elle ne dépend pas du choix du point $P$. La somme $|PF|+|PF'|$ est donc constante, et les points $F$ et $F'$ sont bien les foyers d'une ellipse, telle que définie en section 1.`,
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
              { x: 0.323, y: 0.689, label: 'F', tone: 'good', labelPos: 'above' },
              { x: -0.749, y: 0.347, label: "F'", tone: 'good', labelPos: 'below' },
              { x: -1.845, y: 0, label: 'P', tone: 'ink', labelPos: 'above' },
            ],
            caption:
              R`Vue en coupe du cône : les deux sphères inscrites touchent le plan de section en $F$ et $F'$, et la génératrice en $M$ et $M'$. $|PF|+|PF'| = |PM|+|PM'| = |MM'|$, constante.`,
          },
        },
        {
          kind: 'historique',
          titre: 'Un officier du génie et un astronome, auteurs du « théorème belge »',
          text:
            "Germinal Dandelin n'est pas un mathématicien de carrière à l'origine : né en " +
            "France en 1794, il étudie à l'École polytechnique et sert comme officier du génie " +
            "dans l'armée de Napoléon ; il est blessé le 30 mars 1814 en défendant Paris. Il " +
            "s'installe ensuite dans ce qui est alors le Royaume des Pays-Bas, dont il devient " +
            'citoyen en 1816 — la Belgique n\'existe qu\'à partir de 1830. C\'est là qu\'il publie, ' +
            "en 1822, la démonstration par les sphères inscrites que tu viens d'étudier ; il " +
            "enseignera plus tard l'exploitation des mines à l'Université de Liège (1825), puis " +
            "la physique et l'astronomie à Namur. Son ami de jeunesse Adolphe Quételet, " +
            "rencontré au lycée de Gand, fonde l'Observatoire royal de Belgique et devient un " +
            "pionnier de la statistique appliquée aux populations humaines — c'est lui qui " +
            "invente l'indice de masse corporelle (IMC), encore utilisé aujourd'hui en " +
            'médecine. Deux parcours très différents, réunis dans un seul théorème que les ' +
            'manuels francophones surnomment encore « le théorème belge ».',
          image: {
            src: '/images/historique/quetelet-coniques.jpg',
            alt: "Portrait d'Adolphe Quételet",
            caption:
              'Adolphe Quételet (1796–1874), gravure de Joseph-Arnold Demannez — co-auteur du ' +
              'théorème avec Germinal Dandelin, dont aucun portrait librement réutilisable ' +
              "n'a pu être trouvé.",
          },
        },
        { kind: 'subheading', text: "Réduire l'équation d'une conique" },
        {
          kind: 'para',
          text:
            R`Toute la section 1 suppose un repère **adapté** à la conique : les axes de coordonnées coïncident avec les axes de symétrie (coniques centrées, origine au centre), ou un axe coïncide avec l'axe de symétrie et l'origine avec le sommet (parabole). Dans un repère quelconque, l'équation prend la forme générale $mx^2+ny^2+qxy+rx+sy+t=0$ — et là, difficile d'y lire directement la nature et les caractéristiques de la conique !`,
        },
        {
          kind: 'methode',
          label: "Méthode — réduction de l'équation d'une conique",
          items: [
            R`Passer du repère initial à un repère adapté, ça s'appelle **réduire** l'équation de la conique. Ici, on se limite à une simple **translation** (axes parallèles, même sens) — ça suffit dès que l'équation ne contient pas de terme en $xy$.`,
            R`(1) regroupe les termes en $x$ d'un côté, ceux en $y$ de l'autre ; (2) complète chaque groupe qui contient un carré en un **carré parfait**, en ajoutant la même quantité aux deux membres ; (3) factorise ; (4) **deux carrés** et un second membre non nul : divise pour ramener le second membre à 1 (attention à son signe) — **un seul carré** : isole-le pour obtenir $(y-k)^2=2p(x-h)$ ou $(x-h)^2=2p(y-k)$ (avec un signe) — **second membre nul ou de signe impossible** : c'est un cas dégénéré ; (5) lis la translation $(x'\,;y')$ et identifie la conique.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 16x² − 36y² + 80x + 252y − 197 = 0',
          blocks: [
            { kind: 'para', text: "**1) Transformation de l'équation.**" },
            { kind: 'para', text: R`$16x^2 - 36y^2 + 80x + 252y - 197 = 0$` },
            { kind: 'para', text: R`$\iff (16x^2 + 80x) - (36y^2 - 252y) = 197$` },
            { kind: 'para', text: R`$\iff (16x^2+80x+100) - (36y^2-252y+441) = 197+100-441$` },
            { kind: 'para', text: R`car $16x^2+80x+100 = (4x+10)^2$ et $36y^2-252y+441 = (6y-21)^2$ :` },
            { kind: 'para', text: R`$\iff (4x+10)^2 - (6y-21)^2 = -144$` },
            { kind: 'para', text: R`$\iff 16\left(x+\dfrac{5}{2}\right)^2 - 36\left(y-\dfrac{7}{2}\right)^2 = -144$` },
            { kind: 'para', text: R`$\iff -\dfrac{\left(x+\frac{5}{2}\right)^2}{9} + \dfrac{\left(y-\frac{7}{2}\right)^2}{4} = 1$` },
            {
              kind: 'para',
              text:
                R`**2) Changement de repère.** On passe du repère $R_1$ d'origine $O(0\,;0)$ à un repère $R_2$ d'origine $O'\left(-\frac{5}{2}\,;\frac{7}{2}\right)$ par translation de vecteur $\overrightarrow{OO'}$. Les coordonnées $(x'\,;y')$ d'un point dans le nouveau repère sont : $x' = x+\dfrac{5}{2}$ et $y' = y-\dfrac{7}{2}$.`,
            },
            { kind: 'para', text: R`**3) Équation de la conique dans le repère** $R_2$ : $\dfrac{y'^2}{4} - \dfrac{x'^2}{9} = 1$.` },
            {
              kind: 'para',
              text:
                R`**4) Nature.** C'est une **hyperbole**, dont l'axe focal est l'axe des **ordonnées** du repère $R_2$ (c'est le carré en $y'$ qui est positif). On lit $a=2$, $b=3$, et $c = \sqrt{a^2+b^2} = \sqrt{4+9} = \sqrt{13}$.`,
            },
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Dans le repère R₂', 'Dans le repère R₁ (donné)'],
          rows: [
            ["hyperbole centrée à l'origine, axe focal = axe des ordonnées", R`hyperbole centrée en $O'\left(-\frac{5}{2}\,;\frac{7}{2}\right)$, axe focal $x=-\frac{5}{2}$, axe non focal $y=\frac{7}{2}$`],
            [R`$a=2$, $b=3$, $c=\sqrt{13}$`, R`$a=2$, $b=3$, $c=\sqrt{13}$`],
            [R`foyers $F(0\,;\sqrt{13})$ et $F'(0\,;-\sqrt{13})$`, R`foyers $F\left(-\frac{5}{2}\,;\frac{7}{2}+\sqrt{13}\right)$ et $F'\left(-\frac{5}{2}\,;\frac{7}{2}-\sqrt{13}\right)$`],
            [R`directrices $y' = \pm\dfrac{4\sqrt{13}}{13}$`, R`directrices $y = \dfrac{7}{2} \pm \dfrac{4\sqrt{13}}{13}$`],
            [R`excentricité $e=\dfrac{\sqrt{13}}{2}$`, R`excentricité $e=\dfrac{\sqrt{13}}{2}$`],
            [R`sommets $S(0\,;2)$ et $S'(0\,;-2)$`, R`sommets $S\left(-\frac{5}{2}\,;\frac{11}{2}\right)$ et $S'\left(-\frac{5}{2}\,;\frac{3}{2}\right)$`],
            [R`asymptotes $y' = \pm\dfrac{2}{3}x'$`, R`asymptotes $y = \dfrac{2}{3}x+\dfrac{31}{6}$ et $y=-\dfrac{2}{3}x+\dfrac{11}{6}$`],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -8, xMax: 3, yMin: -1.65625, yMax: 8.65625,
            curves: [
              { fn: (x) => 3.5 + 2 * r(1 + ((x + 2.5) * (x + 2.5)) / 9), tone: 'accent' },
              { fn: (x) => 3.5 - 2 * r(1 + ((x + 2.5) * (x + 2.5)) / 9), tone: 'accent' },
            ],
            vectors: [
              { from: { x: -8, y: 3.5 }, to: { x: 3, y: 3.5 }, tone: 'ink', dashed: true, arrow: false },
              // axe x' = −2,5 en quatre morceaux : les trous (invisibles dans un pointillé) laissent la place aux étiquettes S', O', S
              { from: { x: -2.5, y: -1.65625 }, to: { x: -2.5, y: 0.85 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: -2.5, y: 1.32 }, to: { x: -2.5, y: 3.8 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: -2.5, y: 4.26 }, to: { x: -2.5, y: 5.8 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: -2.5, y: 6.26 }, to: { x: -2.5, y: 8.65625 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: -8, y: -1 / 6 }, to: { x: 3, y: 43 / 6 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -8, y: 43 / 6 }, to: { x: 3, y: -1 / 6 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: -2.5, y: 3.5, label: "O'", tone: 'ink', labelPos: 'above' },
              { x: -2.5, y: 5.5, label: 'S', tone: 'accent', labelPos: 'above' },
              { x: -2.5, y: 1.5, label: "S'", tone: 'accent', labelPos: 'below' },
              { x: -2.5, y: 3.5 + Math.sqrt(13), label: 'F', tone: 'good', labelPos: 'right' },
              { x: -2.5, y: 3.5 - Math.sqrt(13), label: "F'", tone: 'good', labelPos: 'right' },
            ],
            caption:
              R`La conique $16x^2-36y^2+80x+252y-197=0$ dans le repère donné $R_1$ : hyperbole de centre $O'\left(-\frac{5}{2}\,;\frac{7}{2}\right)$, sommets $S\left(-\frac{5}{2}\,;\frac{11}{2}\right)$ et $S'\left(-\frac{5}{2}\,;\frac{3}{2}\right)$, foyers $F$ et $F'$ à la distance $\sqrt{13}$ du centre. Les axes translatés $x'$ et $y'$ et les asymptotes sont en pointillé.`,
          },
        },
        {
          kind: 'piege',
          label: 'Un terme en xy interdit la simple translation',
          text:
            R`Un terme en $xy$ dans l'équation signifie que les axes de symétrie de la conique **ne sont pas parallèles** aux axes de coordonnées ! Une simple translation ne suffit alors plus : il faudrait en plus une rotation. Vérifie donc l'absence de terme en $xy$ **avant** de te lancer dans la complétion des carrés — c'est le tout premier réflexe.`,
        },
        {
          kind: 'piege',
          label: "Le signe du second membre décide de l'axe focal",
          text:
            R`Après complétion des carrés, l'exemple donne $16\left(x+\frac{5}{2}\right)^2 - 36\left(y-\frac{7}{2}\right)^2 = -144$. En divisant par $-144$ (un nombre **négatif**), les deux signes s'inversent ! C'est le carré en $y$ qui devient positif : l'axe focal est donc **vertical**. Diviser sans faire attention au signe te fait écrire $\frac{x'^2}{9} - \frac{y'^2}{4} = 1$, une hyperbole d'axe focal horizontal — et toutes les caractéristiques qui suivent deviennent fausses.`,
        },
        {
          kind: 'astuce',
          label: 'Vérifier la réduction en testant un sommet',
          text:
            R`Une fois les sommets calculés dans $R_1$ (ici $S\left(-\frac{5}{2}\,;\frac{11}{2}\right)$), substitue-les dans l'équation générale de départ : $16\cdot\frac{25}{4}-36\cdot\frac{121}{4}+80\cdot\left(-\frac{5}{2}\right)+252\cdot\frac{11}{2}-197 = 100-1089-200+1386-197 = 0$ ✓. Un contrôle de 10 secondes qui attrape toute erreur de complétion de carré ou de signe !`,
        },
        { kind: 'subheading', text: 'Réduire l’équation d’une parabole' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — y² − 4y − 8x + 28 = 0',
          blocks: [
            { kind: 'para', text: R`**1) Un seul carré** (en $y$), $x$ au premier degré : c'est une parabole d'axe focal horizontal. On complète le carré en $y$ : $y^2-4y+4 = 8x-28+4 \iff (y-2)^2 = 8x-24 \iff (y-2)^2 = 8(x-3)$.` },
            { kind: 'para', text: R`**2) Changement de repère** : origine $O'(3\,;2)$, $x'=x-3$, $y'=y-2$ ; l'équation devient $y'^2=8x'$, de la forme $y'^2=2px'$ avec $2p=8$, donc $p=4$.` },
            { kind: 'para', text: R`**3) Éléments dans** $R_1$. Sommet $S(3\,;2)$, axe focal $y=2$, ouverture vers les $x$ positifs (coefficient positif) ; foyer à $\frac{p}{2}=2$ du sommet : $F(5\,;2)$ ; directrice à $2$ de l'autre côté : $d\equiv x=1$.` },
            { kind: 'para', text: R`**4) Contrôle** : le point $(5\,;-2)$ est sur la courbe ($(-4)^2=16=8\cdot2$ ✓) ; sa distance au foyer $F(5\,;2)$ vaut $4$ et sa distance à la directrice vaut $5-1=4$ ✓.` },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -1, xMax: 9, yMin: -2.6875, yMax: 6.6875,
            curvesOfY: [{ fn: (y) => 3 + ((y - 2) * (y - 2)) / 8, tone: 'accent' }],
            vectors: [
              { from: { x: 1, y: -2.6875 }, to: { x: 1, y: 6.6875 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: 5, y: -2 }, to: { x: 5, y: 2 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 5, y: -2 }, to: { x: 1, y: -2 }, tone: 'accent', dashed: true, arrow: false },
            ],
            points: [
              { x: 3, y: 2, label: 'S', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 2, label: 'F', tone: 'good', labelPos: 'above' },
              { x: 5, y: -2, label: 'P', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 6, label: 'd', tone: 'ink', node: false, labelPos: 'left' },
            ],
            caption: R`La parabole $(y-2)^2=8(x-3)$ : sommet $S(3\,;2)$, foyer $F(5\,;2)$, directrice $d\equiv x=1$, axe focal $y=2$. Pour $P(5\,;-2)$ : $|PF|=\text{dist}(P\,;d)=4$.`,
          },
        },
        { kind: 'subheading', text: 'Quand la réduction ne donne pas de conique : les cas dégénérés' },
        {
          kind: 'para',
          text:
            R`Après la complétion des carrés, il arrive que la dernière étape échoue : le second membre est **nul**, ou il a le **mauvais signe**. L'équation décrit alors un objet plus simple qu'une conique — on parle de **conique dégénérée**. Ces cas apparaissent exactement à l'étape (4) de la méthode.`,
        },
        {
          kind: 'definition',
          label: 'Les cas dégénérés',
          items: [
            R`**Deux carrés de même signe, second membre nul** : $\alpha X^2+\beta Y^2=0$ avec $\alpha,\beta>0$ décrit **un seul point**, le centre ($X=Y=0$). Exemple : $4x^2+9y^2=0$ n'a que la solution $(0\,;0)$.`,
            R`**Deux carrés de même signe, second membre du signe opposé** : $\alpha X^2+\beta Y^2=-\gamma$ avec $\alpha,\beta,\gamma>0$ décrit l'**ensemble vide**. Exemple : $3x^2+5y^2=-15$ (le premier membre est positif).`,
            R`**Deux carrés de signes opposés, second membre nul** : $\alpha X^2-\beta Y^2=0$ décrit **deux droites sécantes** au centre, $Y=\pm\sqrt{\frac{\alpha}{\beta}}\,X$. Exemple : $x^2-y^2=0 \iff (x-y)(x+y)=0$, les droites $y=x$ et $y=-x$ — les asymptotes d'une hyperbole « écrasée ».`,
            R`**Un seul carré, l'autre variable absente** : $Y^2=\gamma$ décrit **deux droites parallèles** si $\gamma>0$ ($Y=\pm\sqrt{\gamma}$), **une droite** si $\gamma=0$, et l'**ensemble vide** si $\gamma<0$.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — trois équations qui ne sont pas des coniques',
          blocks: [
            { kind: 'para', text: R`**a)** $x^2+4y^2-2x+16y+17=0 \iff (x-1)^2+4(y+2)^2 = -17+1+16 = 0$ : une somme de carrés nulle, donc $x=1$ et $y=-2$ — c'est le **point** $(1\,;-2)$.` },
            { kind: 'para', text: R`**b)** $x^2+4y^2-2x+16y+20=0 \iff (x-1)^2+4(y+2)^2 = -3$ : le premier membre est positif, l'ensemble est **vide**.` },
            { kind: 'para', text: R`**c)** $x^2-4y^2-2x+1=0 \iff (x-1)^2=4y^2 \iff x-1=2y$ ou $x-1=-2y$ : **deux droites sécantes** en $(1\,;0)$, $y=\frac{x-1}{2}$ et $y=-\frac{x-1}{2}$.` },
          ],
        },
        {
          kind: 'piege',
          label: 'Diviser par zéro, ou par un nombre du mauvais signe',
          text:
            R`Face à $(x-1)^2+4(y+2)^2=0$, « diviser pour ramener à 1 » est impossible : il n'y a ni ellipse ni demi-axes, seulement un point. Face à $(x-1)^2+4(y+2)^2=-3$, diviser par $-3$ donnerait deux dénominateurs négatifs, $\frac{(x-1)^2}{-3}+\frac{(y+2)^2}{-3/4}=1$ : aucune ellipse n'a de « demi-axe » imaginaire — l'ensemble est vide. Regarde toujours le **signe du second membre** avant de conclure.`,
        },
        {
          kind: 'astuce',
          label: 'Une racine isolée ne décrit qu’une demi-conique',
          text:
            R`Résoudre l'équation d'une conique en $y$ donne en général **deux** fonctions, $y=k+\ldots$ et $y=k-\ldots$ (section 1). Une équation où la racine est isolée avec un **seul** signe, comme $y=-4-\frac{1}{3}\sqrt{36-(x-2)^2}$, ne décrit que la moitié de la conique : ici la moitié $y\leq-4$ de l'ellipse $\frac{(x-2)^2}{36}+\frac{(y+4)^2}{4}=1$. Pour identifier la courbe, isole la racine, élève au carré **en notant la condition de signe** ($y+4\leq0$), puis réduis : la réponse est « la demi-ellipse située sous la droite $y=-4$ », pas « l'ellipse ».`,
        },
        {
          kind: 'entrainement',
          title: "Excentricité, foyers, directrices et réduction d'équation",
          generatorId: '6gen59',
          description: [
            "Établis l'équation d'une conique à partir de ses éléments (foyer, sommet, directrice, excentricité, point, asymptotes), puis identifie la conique obtenue.",
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
      kicker: 'Exploiter les distances aux foyers sans repasser par une équation.',
      titreCourt: 'Rayons focaux et aire',
      partie: 'Distances, droites et tangentes',
      essentiel: [
        R`Rayons focaux d'un point $P(x\,;y)$ de l'ellipse : $|PF|=a-ex$ et $|PF'|=a+ex$ ($F(c\,;0)$, $e=\frac{c}{a}$), donc $a-c\leq|PF|\leq a+c$ ; avec un rapport $k=\frac{|PF|}{|PF'|}$ : $|PF'|=\dfrac{2a}{k+1}$, $|PF|=\dfrac{2ak}{k+1}$.`,
        R`Aire du triangle focal : loi des cosinus avec $|FF'|^2=4c^2$, puis $\frac{1}{2}|PF|\,|PF'|\sin\theta$ — ou directement $\text{aire}=b^2\tan\frac{\theta}{2}$, où $\theta=\widehat{FPF'}$.`,
        R`Une condition géométrique se traduit en une relation entre $a$, $b$, $c$, puis en $e=\frac{c}{a}$ ; une ellipse a toujours $0<e<1$.`,
      ],
      cartes: [
        { question: R`Ellipse $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$ : entre quelles valeurs varie $|PF|$ ?`, reponse: R`Entre $a-c=2$ (sommet le plus proche de $F$) et $a+c=8$.` },
        { question: R`Périhélie $2$ UA, aphélie $8$ UA : demi-grand axe et excentricité de l'orbite ?`, reponse: R`$a=\frac{2+8}{2}=5$, $c=\frac{8-2}{2}=3$, $e=\frac{3}{5}$ — le Soleil est à un foyer, pas au centre.` },
        { question: R`Aire du triangle $FPF'$ quand l'angle en $P$ est droit, pour $b=4$ ?`, reponse: R`$b^2\tan 45^\circ=16$.` },
        { question: R`Quelle excentricité si l'angle $\widehat{FBF'}$ est droit ($B$ sommet de l'axe non focal) ?`, reponse: R`$a^2=2c^2$, donc $e=\dfrac{\sqrt{2}}{2}$.` },
      ],
      blocks: [
        { kind: 'video', title: "Aire et rayons focaux (1/2) : l'aire du triangle FPF'", youtubeId: 'oOk45q1kWKw' },
        { kind: 'video', title: "Aire et rayons focaux (2/2) : l'excentricité à partir d'une condition géométrique", youtubeId: 'fHReGue2Rbc' },
        {
          kind: 'para',
          text:
            "Les sections 1 et 2 t'ont fait produire des équations. Cette section fait l'inverse : elle exploite les propriétés purement **métriques** de l'ellipse — les distances aux foyers, appelées **rayons focaux**, et l'excentricité — sans repasser par une équation cartésienne.",
        },
        { kind: 'subheading', text: 'A. Rayons focaux et aire du triangle foyer-point-foyer' },
        {
          kind: 'definition',
          label: 'Définition — rayons focaux',
          items: [
            R`Pour un point $P$ d'une ellipse de foyers $F$ et $F'$, les distances $|PF|$ et $|PF'|$ sont les **rayons focaux** de $P$. La propriété caractéristique de l'ellipse s'écrit alors : $|PF| + |PF'| = 2a \quad \text{(pour tout point } P \text{ de l'ellipse)}$`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — les rayons focaux en fonction de l'abscisse",
          blocks: [
            { kind: 'para', text: R`Soit $P(x\,;y)$ un point de l'ellipse $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$, de foyers $F(c\,;0)$ et $F'(-c\,;0)$, avec $b^2=a^2-c^2$ et $e=\frac{c}{a}$.` },
            { kind: 'para', text: R`**On remplace** $y^2$ grâce à l'équation : $y^2=b^2\left(1-\frac{x^2}{a^2}\right)=(a^2-c^2)-\frac{(a^2-c^2)x^2}{a^2}$.` },
            { kind: 'para', text: R`**Carré du rayon focal** : $|PF|^2=(x-c)^2+y^2=x^2-2cx+c^2+a^2-c^2-x^2+\frac{c^2x^2}{a^2}=a^2-2cx+\frac{c^2x^2}{a^2}=\left(a-\frac{c}{a}x\right)^2$.` },
            { kind: 'para', text: R`**Signe** : $|x|\leq a$ et $c<a$, donc $\frac{c}{a}x\leq c<a$ et $a-\frac{c}{a}x>0$. D'où $|PF|=a-\dfrac{c}{a}x=a-ex$, puis $|PF'|=2a-|PF|=a+ex$.` },
            { kind: 'para', text: R`**Bornes** : quand $x$ parcourt $[-a\,;a]$, $a-ex$ décroît de $a+c$ à $a-c$ : $a-c\leq|PF|\leq a+c$. Le minimum est atteint au sommet $(a\,;0)$, le plus proche de $F$, le maximum au sommet $(-a\,;0)$.` },
          ],
        },
        {
          kind: 'astuce',
          label: "Et pour l'hyperbole ?",
          text:
            R`Le même calcul, avec $b^2=c^2-a^2$, donne $|PF|^2=\left(\frac{c}{a}x-a\right)^2$, donc $|PF|=|ex-a|$ et $|PF'|=|ex+a|$. Sur la branche de droite ($x\geq a$) : $|PF|=ex-a$ et $|PF'|=ex+a$ — leur différence vaut bien $2a$.`,
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — une orbite de périhélie 2 UA et d’aphélie 8 UA',
          blocks: [
            { kind: 'para', text: R`Une planète tourne autour du Soleil sur une ellipse dont le Soleil occupe un **foyer**. Sa plus petite distance au Soleil (périhélie) vaut $2$ UA, sa plus grande (aphélie) $8$ UA. Détermine $a$, $c$, $e$, $b$ et une équation de l'orbite.` },
            { kind: 'para', text: R`**Rayons focaux extrêmes** : périhélie $=a-c=2$ et aphélie $=a+c=8$. En additionnant : $2a=10$, $a=5$ ; en soustrayant : $2c=6$, $c=3$.` },
            { kind: 'para', text: R`**Excentricité et petit axe** : $e=\frac{c}{a}=\frac{3}{5}$ ; $b^2=a^2-c^2=16$, $b=4$.` },
            { kind: 'para', text: R`**Équation** (centre à l'origine, Soleil en $F(3\,;0)$) : $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$. Le Soleil n'est pas au centre de l'orbite : il est à $3$ UA du centre.` },
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — aire du triangle FPF′ en 3 étapes",
          items: [
            R`(1) **Rayons focaux.** Si l'énoncé donne le rapport $k = \frac{|PF|}{|PF'|}$, résous le système $\{|PF|+|PF'|=2a \; ; \; |PF|=k\cdot|PF'|\} \implies |PF'| = \dfrac{2a}{k+1}$, $|PF| = \dfrac{2ak}{k+1}$.`,
            R`(2) **Angle au sommet** $P$, par la loi des cosinus dans le triangle $FPF'$, dont le troisième côté est $|FF'|=2c$ : $\cos(\widehat{FPF'}) = \dfrac{|PF|^2+|PF'|^2-4c^2}{2\cdot|PF|\cdot|PF'|}$ avec $c^2=a^2-b^2$.`,
            R`(3) **Aire**, par la formule du sinus : $\text{aire} = \dfrac{1}{2}\cdot|PF|\cdot|PF'|\cdot\sin(\widehat{FPF'})$ avec $\sin = \sqrt{1-\cos^2}$.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — ellipse x²⁄25 + y²⁄16 = 1, point P tel que |PF| = 2·|PF′|",
          blocks: [
            {
              kind: 'para',
              text: R`Données : $a=5$, $b=4$, donc $c^2=a^2-b^2=25-16=9$ (et $c=3$, $|FF'|=6$). Rapport $k=2$.`,
            },
            {
              kind: 'para',
              text:
                R`**(1) Rayons focaux** — système $\{|PF|+|PF'|=10 \; ; \; |PF|=2|PF'|\}$ : $3\cdot|PF'|=10 \implies |PF'|=\dfrac{10}{3}$ et $|PF|=\dfrac{20}{3}$. Contrôle : la somme vaut $\frac{30}{3}=10=2a$ ✓, le rapport vaut bien $2$ ✓, et $|PF|$ est bien dans $[a-c\,;a+c]=[2\,;8]$ ✓.`,
            },
            {
              kind: 'para',
              text:
                R`**(2) Angle** — loi des cosinus, avec $4c^2=36$ : $\cos(\widehat{FPF'}) = \dfrac{\frac{400}{9}+\frac{100}{9}-36}{2\cdot\frac{20}{3}\cdot\frac{10}{3}} = \dfrac{\frac{176}{9}}{\frac{400}{9}} = \dfrac{11}{25}$.`,
            },
            {
              kind: 'para',
              text: R`**(3) Aire** — d'abord le sinus : $\sin(\widehat{FPF'}) = \sqrt{1-\dfrac{121}{625}} = \sqrt{\dfrac{504}{625}} = \dfrac{6\sqrt{14}}{25}$.`,
            },
            {
              kind: 'para',
              text: R`Puis l'aire : $\text{aire} = \dfrac{1}{2}\cdot\dfrac{20}{3}\cdot\dfrac{10}{3}\cdot\dfrac{6\sqrt{14}}{25} = \dfrac{1200\sqrt{14}}{450} = \dfrac{8\sqrt{14}}{3} \approx 9{,}98$.`,
            },
            {
              kind: 'para',
              text:
                R`**Recoupement par la formule de Héron** (côtés $\frac{20}{3}$, $\frac{10}{3}$ et $6$, demi-périmètre $s=8$) : $\text{aire} = \sqrt{8\cdot\dfrac{4}{3}\cdot\dfrac{14}{3}\cdot 2} = \sqrt{\dfrac{896}{9}} = \dfrac{8\sqrt{14}}{3}$ ✓ — résultat identique.`,
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 6.5, yMin: -6.09375, yMax: 6.09375,
            curves: [
              { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
            ],
            vectors: [
              { from: { x: -25 / 9, y: (8 * Math.sqrt(14)) / 9 }, to: { x: 3, y: 0 }, tone: 'good', arrow: false },
              { from: { x: -25 / 9, y: (8 * Math.sqrt(14)) / 9 }, to: { x: -3, y: 0 }, tone: 'good', arrow: false },
              { from: { x: 3, y: 0 }, to: { x: -3, y: 0 }, tone: 'ink', arrow: false },
            ],
            angleArcs: [{ cx: -25 / 9, cy: (8 * Math.sqrt(14)) / 9, fromDeg: -93.8, toDeg: -29.9, radiusPx: 18, tone: 'accent' }],
            points: [
              { x: 3, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: -3, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
              { x: -25 / 9, y: (8 * Math.sqrt(14)) / 9, label: 'P', tone: 'ink', labelPos: 'above' },
            ],
            caption:
              R`Triangle $FPF'$ sur l'ellipse $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$, pour $|PF|=2|PF'|$ : $|PF'|=\dfrac{10}{3}$, $|PF|=\dfrac{20}{3}$, $|FF'|=6$, aire $= \dfrac{8\sqrt{14}}{3} \approx 9{,}98$.`,
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — aire du triangle focal en fonction de b et de l’angle',
          blocks: [
            { kind: 'para', text: R`Notons $r_1=|PF|$, $r_2=|PF'|$ et $\theta=\widehat{FPF'}$, pour un point $P$ de l'ellipse non situé sur l'axe focal. On sait que $r_1+r_2=2a$ et $|FF'|=2c$.` },
            { kind: 'para', text: R`**Loi des cosinus** : $4c^2=r_1^2+r_2^2-2r_1r_2\cos\theta=(r_1+r_2)^2-2r_1r_2(1+\cos\theta)=4a^2-2r_1r_2(1+\cos\theta)$.` },
            { kind: 'para', text: R`**On isole le produit** : $2r_1r_2(1+\cos\theta)=4(a^2-c^2)=4b^2$, donc $r_1r_2=\dfrac{2b^2}{1+\cos\theta}$.` },
            { kind: 'para', text: R`**Aire** : $\dfrac{1}{2}r_1r_2\sin\theta=\dfrac{b^2\sin\theta}{1+\cos\theta}$. Avec $\sin\theta=2\sin\frac{\theta}{2}\cos\frac{\theta}{2}$ et $1+\cos\theta=2\cos^2\frac{\theta}{2}$ : $\text{aire}=b^2\tan\dfrac{\theta}{2}$.` },
            { kind: 'para', text: R`**Recoupement sur l'exemple** : $b^2=16$, $\cos\theta=\frac{11}{25}$, $\sin\theta=\frac{6\sqrt{14}}{25}$, donc $\frac{\sin\theta}{1+\cos\theta}=\frac{6\sqrt{14}}{36}=\frac{\sqrt{14}}{6}$ et l'aire vaut $16\cdot\frac{\sqrt{14}}{6}=\frac{8\sqrt{14}}{3}$ ✓.` },
          ],
        },
        {
          kind: 'piege',
          label: 'Croire que |PF| = |PF′| = a',
          text:
            R`L'égalité $|PF|=|PF'|=a$ n'est vraie que dans **un seul** cas : quand $P$ est un sommet de l'axe **non focal** ($P(0\,;\pm b)$). Pour tout autre point, les deux rayons focaux sont différents — et seul le système $\{$somme$=2a$ ; rapport$=k\}$ (ou les formules $a\mp ex$ si l'on connaît l'abscisse) permet de les retrouver séparément. La propriété $|PF|+|PF'|=2a$ est donc ta **porte d'entrée obligatoire** dans ce genre de problème.`,
        },
        {
          kind: 'astuce',
          label: "N'extrais jamais c, seul c² est nécessaire",
          text:
            R`La loi des cosinus n'utilise que $|FF'|^2=4c^2=4(a^2-b^2)$ — jamais $c$ lui-même, qui est souvent irrationnel (ex. $a=5$, $b=3 \to c=4$, mais $a=5$, $b=2 \to c=\sqrt{21}$). En gardant $c^2$ entier tout du long, ton cosinus reste une fraction exacte ; seule l'aire finale, qui passe par un sinus, peut devenir irrationnelle.`,
        },
        {
          kind: 'piege',
          label: 'Un point P doit exister réellement',
          text:
            R`Quand $P$ parcourt l'ellipse, $|PF|$ ne prend que des valeurs dans $[a-c\,;a+c]$. Avec un rapport $k=\frac{|PF|}{|PF'|}\geq1$, il faut donc $\frac{2ak}{k+1}\leq a+c$, c'est-à-dire $k\leq\dfrac{a+c}{a-c}=\dfrac{1+e}{1-e}$. Un rapport plus grand place $|PF|$ **hors** de l'intervalle : le triangle $FPF'$ ne se referme plus, le cosinus calculé sort de $[-1\,;1]$, et le calcul te donnerait un sinus impossible ! Vérifie toujours $a-c \leq |PF| \leq a+c$ avant de conclure.`,
        },
        { kind: 'subheading', text: "B. Excentricité à partir d'une condition géométrique" },
        {
          kind: 'para',
          text:
            R`Une condition géométrique sur une ellipse se traduit toujours en une équation reliant $a$, $b$ et $c$ — que tu résous ensuite en $e=\frac{c}{a}$. Le premier outil est la signification géométrique de la relation $a^2=b^2+c^2$ :`,
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les sommets (0 ; ±b) sont à la distance a des foyers',
          blocks: [
            { kind: 'para', text: R`Soit $B(0\,;b)$, sommet de l'axe non focal de l'ellipse de foyers $F(c\,;0)$ et $F'(-c\,;0)$. $B$ est sur la médiatrice de $[FF']$, donc $|BF|=|BF'|$.` },
            { kind: 'para', text: R`$B$ est un point de l'ellipse : $|BF|+|BF'|=2a$. Les deux distances étant égales, $|BF|=|BF'|=a$.` },
            { kind: 'para', text: R`**Pythagore** dans le triangle $OBF$, rectangle en $O$ ($|OB|=b$, $|OF|=c$, $|BF|=a$) : $a^2=b^2+c^2$. Le demi-grand axe est l'hypoténuse d'un triangle rectangle dont les côtés de l'angle droit sont $b$ et $c$ — c'est la relation $b^2=a^2-c^2$ vue en section 1.` },
          ],
        },
        {
          kind: 'para',
          text: 'Voici trois conditions classiques :',
        },
        {
          kind: 'exempleLibre',
          label: "Condition 1 — l'angle FBF′ est droit, B sommet de l'axe non focal",
          blocks: [
            {
              kind: 'para',
              text:
                R`On vient de voir que $|BF|=|BF'|=a$. Le triangle $FBF'$ est donc **rectangle isocèle** en $B$, et Pythagore donne :`,
            },
            { kind: 'para', text: R`$a^2+a^2 = (2c)^2 \iff 2a^2=4c^2 \iff a^2=2c^2$` },
            { kind: 'para', text: R`$\implies e^2 = \dfrac{c^2}{a^2} = \dfrac{1}{2} \implies e = \dfrac{\sqrt{2}}{2} \approx 0{,}707$` },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -2.1333, xMax: 2.1333, yMin: -2, yMax: 2,
            curves: [
              { fn: (x) => r(1 - (x * x) / 2), tone: 'accent', xMin: -Math.SQRT2, xMax: Math.SQRT2 },
              { fn: (x) => -r(1 - (x * x) / 2), tone: 'accent', xMin: -Math.SQRT2, xMax: Math.SQRT2 },
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
              R`Ellipse $\dfrac{x^2}{2}+y^2=1$ ($a=\sqrt{2}$, $b=1$, $c=1$) : depuis le sommet $B(0\,;1)$ de l'axe non focal, l'angle $FBF'$ est droit. $|BF|=|BF'|=a=\sqrt{2}$, $|FF'|=2$. Excentricité $e=\dfrac{\sqrt{2}}{2}$.`,
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Condition 2 — un point de même abscisse que le foyer, et (OP) parallèle à (A′B)',
          blocks: [
            {
              kind: 'para',
              text:
                R`L'ellipse $\frac{x^2}{a^2}+\frac{y^2}{b^2}=1$ a pour foyer $F(c\,;0)$, pour sommets $A'(-a\,;0)$ et $B(0\,;b)$. Le point $P$ de l'ellipse d'abscisse $c$ et d'ordonnée positive est tel que $(OP)$ est parallèle à $(A'B)$. Quelle est l'excentricité ?`,
            },
            { kind: 'para', text: R`**Ordonnée de** $P$ : $\frac{c^2}{a^2}+\frac{y^2}{b^2}=1 \iff y^2=b^2\cdot\frac{a^2-c^2}{a^2}=\frac{b^4}{a^2}$, donc $P\left(c\,;\frac{b^2}{a}\right)$.` },
            { kind: 'para', text: R`**Pentes** : $(OP)$ a pour pente $\dfrac{b^2/a}{c}=\dfrac{b^2}{ac}$ ; $(A'B)$ a pour pente $\dfrac{b-0}{0-(-a)}=\dfrac{b}{a}$.` },
            { kind: 'para', text: R`**Parallélisme** : $\dfrac{b^2}{ac}=\dfrac{b}{a} \iff b=c$. Alors $a^2 = b^2+c^2 = 2c^2$ et $e = \dfrac{c}{a} = \dfrac{\sqrt{2}}{2}$.` },
            {
              kind: 'para',
              text:
                R`Même valeur que la condition 1 : ce n'est pas un hasard, ce sont deux formulations du **même** fait géométrique ($a^2=2c^2 \iff b=c$). Ce qui compte ici, c'est la traduction de la condition, pas la valeur trouvée.`,
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
                R`Les directrices d'une ellipse sont $x=\pm \frac{a^2}{c}$ : leur distance vaut $\frac{2a^2}{c} = \frac{2a}{e}$. Les foyers sont $(\pm c\,;0)$ : leur distance vaut $2c=2ae$. La condition $D(\text{directrices}) = k\cdot D(\text{foyers})$ s'écrit donc :`,
            },
            { kind: 'para', text: R`$\dfrac{2a}{e} = k\cdot 2ae \iff 1 = ke^2 \iff e^2 = \dfrac{1}{k} \implies e = \dfrac{1}{\sqrt{k}}$` },
            {
              kind: 'para',
              text:
                R`Le demi-grand axe $a$ **disparaît** de l'équation : la condition ne dépend que de $e$. Pour $k=4 \to e=\frac{1}{2}$ ; pour $k=9 \to e=\frac{1}{3}$ ; pour $k=5 \to e=\frac{1}{\sqrt{5}} \approx 0{,}447$. Il faut $k > 1$ pour que $e<1$ (pour $k=1{,}5$, $e\approx0{,}816$) : pour une ellipse, les directrices sont toujours plus écartées que les foyers.`,
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Contrôler une excentricité trouvée par sa fourchette',
          text:
            R`Une ellipse a toujours $0<e<1$. Si tu trouves $e \geq 1$, c'est le signal d'alarme : soit une erreur de traduction, soit une condition tout simplement impossible pour une ellipse (elle décrirait alors une parabole ou une hyperbole). Et pour vérifier l'ordre de grandeur : un $e$ proche de 0 correspond à une ellipse presque circulaire, un $e$ proche de 1 à une ellipse très allongée — un simple croquis suffit à sentir si ton résultat est plausible.`,
        },
        {
          kind: 'entrainement',
          title: 'Aire, rayons focaux et excentricité',
          generatorId: '6gen60',
          description: [
            "Calcule des rayons focaux à partir d'un rapport donné, déduis-en une aire de triangle, ou remonte d'une condition géométrique jusqu'à l'excentricité.",
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
      titreCourt: 'Droite et conique',
      partie: 'Distances, droites et tangentes',
      essentiel: [
        R`On substitue la droite dans la conique. Si l'équation obtenue est du second degré : $\Delta>0$ → 2 points (sécante), $\Delta=0$ → 1 point double (tangente), $\Delta<0$ → aucun point (extérieure).`,
        R`Si le coefficient de $x^2$ s'annule (droite parallèle à une asymptote d'une hyperbole, ou à l'axe d'une parabole), l'équation est du premier degré : **un seul point**, et la droite est sécante, pas tangente.`,
        R`Deux coniques : combiner leurs équations pour éliminer un terme, puis résoudre le système avec l'une des deux équations de départ.`,
      ],
      cartes: [
        { question: R`Que signifie $\Delta=0$ pour l'équation obtenue en substituant une droite dans une conique ?`, reponse: R`Un seul point d'intersection, double : la droite est tangente à la conique.` },
        { question: R`$y=2x+1$ et $x^2-\dfrac{y^2}{4}=1$ : combien de points communs ?`, reponse: R`Un seul, $\left(-\frac{5}{4}\,;-\frac{3}{2}\right)$ : la droite est parallèle à l'asymptote $y=2x$, l'équation est du premier degré — et la droite n'est pas tangente.` },
        { question: R`Comment couper une conique par une droite verticale $x=k$ ?`, reponse: R`On remplace $x$ par $k$ dans l'équation de la conique et on résout en $y$.` },
      ],
      blocks: [
        { kind: 'video', title: "Intersection d'une conique et d'une droite", youtubeId: 'RR6ODGuacN0' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            R`Chercher l'intersection entre une droite et une conique revient à résoudre le système formé par leurs deux équations — 1er degré pour la droite, 2e degré pour la conique. Substitue l'équation de la droite dans celle de la conique : tu obtiens une équation à une seule inconnue, **en général** du second degré. Elle a donc **au maximum deux** solutions : une droite coupe une conique en deux points au plus.`,
            R`Si l'équation est du second degré, le nombre de solutions se lit sur son discriminant $\Delta$ : $\Delta>0$ → 2 points (droite **sécante**) ; $\Delta=0$ → 1 point double (droite **tangente**, voir section 5) ; $\Delta<0$ → aucun point (droite **extérieure**).`,
            R`Si le coefficient du second degré **s'annule**, l'équation est du premier degré : un seul point (ou aucun), **sans** tangence — voir le piège ci-dessous.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — droite par A(−4 ; 0) et B(0 ; −3), conique de foyer F(3 ; −2), directrice d′ ≡ x = −1⁄5, excentricité e = 5⁄3",
          blocks: [
            {
              kind: 'para',
              text:
                R`**1) Équation de la droite.** Elle passe par $A(-4\,;0)$ et $B(0\,;-3)$ : pente $m=\frac{-3-0}{0-(-4)}=-\frac{3}{4}$, ordonnée à l'origine $-3$. $d \equiv y = -\dfrac{3}{4}x - 3$.`,
            },
            {
              kind: 'para',
              text:
                R`**2) Équation de la conique**, par la caractérisation focale $\text{dist}(P\,;F) = e\cdot\text{dist}(P\,;d')$, avec $e=\frac{5}{3}>1$ — c'est donc une hyperbole :`,
            },
            { kind: 'para', text: R`$\sqrt{(x-3)^2+(y+2)^2} = \dfrac{5}{3}\left|x+\dfrac{1}{5}\right|$` },
            { kind: 'para', text: R`$\iff (x-3)^2+(y+2)^2 = \dfrac{25}{9}\left(x+\dfrac{1}{5}\right)^2$` },
            { kind: 'para', text: R`$\iff 9x^2-54x+81+9y^2+36y+36 = 25x^2+10x+1$` },
            { kind: 'para', text: R`$\iff 16x^2 - 9y^2 + 64x - 36y - 116 = 0$` },
            {
              kind: 'para',
              text:
                R`**3) Résolution du système.** On substitue $y=-\frac{3}{4}x-3$ dans l'équation de la conique. Comme $y^2=\frac{9}{16}x^2+\frac{9}{2}x+9$, il vient $-9y^2=-\frac{81}{16}x^2-\frac{81}{2}x-81$ et $-36y=27x+108$ :`,
            },
            { kind: 'para', text: R`$16x^2 - \dfrac{81}{16}x^2 - \dfrac{81}{2}x - 81 + 64x + 27x + 108 - 116 = 0$` },
            { kind: 'para', text: R`$\iff 175x^2 + 808x - 1424 = 0$ (après multiplication par 16).` },
            {
              kind: 'para',
              text: R`**4) Discriminant et racines.** $\Delta = 808^2+4\cdot175\cdot1424 = 652\,864+996\,800 = 1\,649\,664 = 9216\cdot179$.`,
            },
            { kind: 'para', text: R`Donc $\sqrt{\Delta} = 96\sqrt{179}$ et $x = \dfrac{-808\pm96\sqrt{179}}{350} = \dfrac{-404\pm48\sqrt{179}}{175}$.` },
            { kind: 'para', text: R`En reportant dans $y=-\frac{3}{4}x-3$ : $y = \dfrac{-222\mp36\sqrt{179}}{175}$.` },
            { kind: 'para', text: R`**5) Points d'intersection.** $\Delta>0$ : la droite est sécante, il y a bien 2 points.` },
            { kind: 'para', text: R`$P\left(\dfrac{-404+48\sqrt{179}}{175}\,;\dfrac{-222-36\sqrt{179}}{175}\right)$` },
            { kind: 'para', text: R`$Q\left(\dfrac{-404-48\sqrt{179}}{175}\,;\dfrac{-222+36\sqrt{179}}{175}\right)$` },
            {
              kind: 'para',
              text:
                R`Valeurs approchées ($\sqrt{179}\approx13{,}379$) : $P \approx (1{,}36\,;-4{,}02)$ et $Q \approx (-5{,}98\,;1{,}48)$ — un point sur chaque branche de l'hyperbole.`,
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
              { x: (-404 + 48 * Math.sqrt(179)) / 175, y: (-222 - 36 * Math.sqrt(179)) / 175, label: 'P', tone: 'ink', labelPos: 'right' },
              { x: (-404 - 48 * Math.sqrt(179)) / 175, y: (-222 + 36 * Math.sqrt(179)) / 175, label: 'Q', tone: 'ink', labelPos: 'right' },
            ],
            caption:
              R`La droite $d \equiv y=-\dfrac{3}{4}x-3$ coupe l'hyperbole $16x^2-9y^2+64x-36y-116=0$ en 2 points, $P$ sur la branche droite et $Q$ sur la branche gauche.`,
          },
        },
        {
          kind: 'astuce',
          label: "Réduire l'équation de la conique pour se contrôler",
          text:
            R`La conique de l'exemple se réduit (méthode de la section 2) en $16(x+2)^2-9(y+2)^2=144$, soit $\frac{(x+2)^2}{9}-\frac{(y+2)^2}{16}=1$ : hyperbole de centre $(-2\,;-2)$, $a=3$, $b=4$, $c=5$, sommets $(1\,;-2)$ et $(-5\,;-2)$. Excentricité $e=\frac{c}{a}=\frac{5}{3}$ ✓ — exactement la valeur de l'énoncé ! Ce contrôle vérifie d'un coup toute l'étape 2, avant même d'entamer la substitution.`,
        },
        {
          kind: 'piege',
          label: 'Élever au carré une valeur absolue',
          text:
            R`La caractérisation focale contient $\left|x+\frac{1}{5}\right|$. Élever au carré est ici légitime — c'est une équivalence, puisque les deux membres sont positifs (une racine carrée d'un côté, une valeur absolue de l'autre) — et l'équation obtenue décrit **toute** la conique. N'écarte donc jamais d'office les points situés d'un côté de la directrice : pour une hyperbole, les deux branches sont de part et d'autre de chaque directrice, et toutes deux vérifient la condition.`,
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — trois droites parallèles face à une même ellipse',
          blocks: [
            { kind: 'para', text: R`On coupe l'ellipse $\dfrac{x^2}{8}+\dfrac{y^2}{2}=1$, c'est-à-dire $x^2+4y^2=8$, par les droites $y=\frac{1}{2}x+k$ pour $k=1$, $k=2$ et $k=3$.` },
            { kind: 'para', text: R`**Substitution générale** : $x^2+4\left(\frac{1}{2}x+k\right)^2=8 \iff 2x^2+4kx+4k^2-8=0 \iff x^2+2kx+2k^2-4=0$, de discriminant $\Delta=4k^2-4(2k^2-4)=16-4k^2$.` },
            { kind: 'para', text: R`$k=1$ : $\Delta=12>0$, deux points ($x=-1\pm\sqrt{3}$) : droite **sécante**.` },
            { kind: 'para', text: R`$k=2$ : $\Delta=0$, l'équation devient $x^2+4x+4=(x+2)^2=0$ : un seul point, double, $(-2\,;1)$ : droite **tangente**.` },
            { kind: 'para', text: R`$k=3$ : $\Delta=-20<0$, aucun point : droite **extérieure**.` },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -4.5, xMax: 4.5, yMin: -2.5, yMax: 5.9375,
            curves: [
              { fn: (x) => r(2 - (x * x) / 4), tone: 'accent', xMin: -2 * Math.SQRT2, xMax: 2 * Math.SQRT2 },
              { fn: (x) => -r(2 - (x * x) / 4), tone: 'accent', xMin: -2 * Math.SQRT2, xMax: 2 * Math.SQRT2 },
            ],
            vectors: [
              { from: { x: -4.5, y: -1.25 }, to: { x: 4.5, y: 3.25 }, tone: 'good', arrow: false },
              { from: { x: -4.5, y: -0.25 }, to: { x: 4.5, y: 4.25 }, tone: 'attn', arrow: false },
              { from: { x: -4.5, y: 0.75 }, to: { x: 4.5, y: 5.25 }, tone: 'bad', arrow: false },
            ],
            points: [{ x: -2, y: 1, label: 'T', tone: 'ink', labelPos: 'above' }],
            caption: R`L'ellipse $x^2+4y^2=8$ et les droites $y=\frac{1}{2}x+k$ : $k=1$ sécante (vert), $k=2$ tangente en $T(-2\,;1)$ (orange), $k=3$ extérieure (rouge).`,
          },
        },
        {
          kind: 'piege',
          label: "Un discriminant nul n'est pas « pas de solution »",
          text:
            R`$\Delta=0$ signifie exactement **un** point d'intersection (double), jamais zéro : la droite est alors tangente à la conique. C'est $\Delta<0$ qui donne l'ensemble vide — pas $\Delta=0$ ! Confondre les deux te fait déclarer extérieure une droite qui pourtant touche la courbe.`,
        },
        {
          kind: 'piege',
          label: 'Coefficient de x² nul : un seul point, mais pas de tangence',
          text:
            R`Coupe l'hyperbole $x^2-\frac{y^2}{4}=1$ par la droite $y=2x+1$, parallèle à l'asymptote $y=2x$ : $x^2-\frac{(2x+1)^2}{4}=1 \iff x^2-x^2-x-\frac{1}{4}=1 \iff x=-\frac{5}{4}$, puis $y=-\frac{3}{2}$. Les termes en $x^2$ se sont **annulés** : l'équation est du premier degré, il n'y a pas de discriminant, et l'unique point $\left(-\frac{5}{4}\,;-\frac{3}{2}\right)$ n'est **pas** un point de tangence — la droite traverse la courbe. Même phénomène pour une droite parallèle à l'axe d'une parabole ($y=3$ coupe $y^2=2x$ en un seul point, $\left(\frac{9}{2}\,;3\right)$). La règle « $\Delta=0 \iff$ tangente » ne vaut **que** si l'équation reste du second degré.`,
        },
        {
          kind: 'piege',
          label: "La droite verticale n'entre pas dans y = mx + p",
          text:
            R`Si la droite de l'énoncé est verticale ($x=k$), elle n'a pas de pente : impossible de la substituer sous la forme $y=mx+p$ ! Remplace plutôt $x$ par $k$ dans l'équation de la conique, et résous en $y$. La méthode reste la même, seule l'inconnue restante change.`,
        },
        {
          kind: 'astuce',
          label: 'Et une conique dégénérée ?',
          text:
            R`Si l'« équation de la conique » décrit en fait deux droites (cas dégénéré, section 2), une droite peut être **contenue** dans l'ensemble : la substitution donne alors $0=0$, vrai pour tout $x$ — une infinité de points communs. Exemple : $y=x$ et $x^2-y^2=0$.`,
        },
        { kind: 'subheading', text: 'Intersection de deux coniques' },
        {
          kind: 'methode',
          label: 'Méthode — points communs à deux coniques',
          items: [
            R`(1) **Combine** les deux équations (ajoute à l'une un multiple de l'autre) pour faire disparaître un terme : $x^2$, $y^2$, ou les deux à la fois s'ils ont les mêmes coefficients.`,
            R`(2) L'équation obtenue est vérifiée par tous les points communs, mais elle ne suffit pas : résous-la **avec l'une des deux équations de départ** (système équivalent).`,
            R`(3) **Vérifie** chaque point trouvé dans les deux équations de départ. Deux coniques peuvent avoir jusqu'à **quatre** points communs.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — l'ellipse x² + 2y² = 41 et l'hyperbole y² − x² = 7",
          blocks: [
            { kind: 'para', text: R`**Éliminer** $x^2$ : en additionnant les deux équations, $3y^2=48$, donc $y^2=16$ et $y=\pm4$.` },
            { kind: 'para', text: R`**Reporter dans l'hyperbole** : $x^2=y^2-7=9$, donc $x=\pm3$.` },
            { kind: 'para', text: R`**Quatre points communs** : $(3\,;4)$, $(-3\,;4)$, $(3\,;-4)$ et $(-3\,;-4)$. Vérification pour $(3\,;4)$ : $9+32=41$ ✓ et $16-9=7$ ✓ ; les trois autres s'en déduisent par symétrie.` },
            { kind: 'para', text: R`**Une combinaison qui donne un cercle.** $(x^2+2y^2-41)+\frac{1}{2}(x^2-y^2+7)=0 \iff \frac{3}{2}x^2+\frac{3}{2}y^2-\frac{75}{2}=0 \iff x^2+y^2=25$. Ce cercle passe par les quatre points communs — mais tous ses points ne sont pas communs aux deux coniques : il faut encore le **recouper** avec l'une d'elles.` },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -7, xMax: 7, yMin: -6.5625, yMax: 6.5625,
            circle: { cx: 0, cy: 0, r: 5, tone: 'faint' },
            curves: [
              { fn: (x) => r((41 - x * x) / 2), tone: 'accent', xMin: -Math.sqrt(41), xMax: Math.sqrt(41) },
              { fn: (x) => -r((41 - x * x) / 2), tone: 'accent', xMin: -Math.sqrt(41), xMax: Math.sqrt(41) },
              { fn: (x) => r(7 + x * x), tone: 'good', xMin: -6, xMax: 6 },
              { fn: (x) => -r(7 + x * x), tone: 'good', xMin: -6, xMax: 6 },
            ],
            points: [
              { x: 3, y: 4, label: '', tone: 'ink' },
              { x: -3, y: 4, label: '', tone: 'ink' },
              { x: 3, y: -4, label: '', tone: 'ink' },
              { x: -3, y: -4, label: '', tone: 'ink' },
            ],
            caption: R`L'ellipse $x^2+2y^2=41$ (orange) et l'hyperbole $y^2-x^2=7$ (vert) se coupent en $(\pm3\,;\pm4)$ ; le cercle $x^2+y^2=25$ (gris), obtenu par combinaison, passe par ces quatre points.`,
          },
        },
        {
          kind: 'entrainement',
          title: "Intersection d'une conique et d'une droite",
          generatorId: '6gen61',
          description: [
            "Substitue l'équation d'une droite dans celle d'une conique, résous le système, puis interprète le discriminant obtenu ; cherche aussi les points communs de deux coniques.",
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
      titreCourt: 'Tangentes',
      partie: 'Distances, droites et tangentes',
      essentiel: [
        R`Tangente en $P(x_P\,;y_P)$ : dériver la branche qui contient $P$ ($y_P>0$ : celle du haut), ou utiliser la forme dédoublée — ellipse $\dfrac{xx_P}{a^2}+\dfrac{yy_P}{b^2}=1$, hyperbole $\dfrac{xx_P}{a^2}-\dfrac{yy_P}{b^2}=1$, parabole $yy_P=p(x+x_P)$.`,
        R`Condition de tangence de $y=mx+k$ : $k^2=a^2m^2+b^2$ (ellipse), $k^2=a^2m^2-b^2$ (hyperbole d'axe horizontal), $k=\dfrac{p}{2m}$ (parabole $y^2=2px$).`,
        R`Aux sommets de l'axe focal (et au sommet d'une parabole d'axe horizontal), la tangente est **verticale** : la pente n'existe pas, mais la forme dédoublée la donne.`,
      ],
      cartes: [
        { question: R`Tangente à $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$ au point $\left(3\,;\frac{16}{5}\right)$ ?`, reponse: R`$\dfrac{3x}{25}+\dfrac{y}{5}=1$, soit $3x+5y=25$.` },
        { question: R`Tangente à la parabole $y^2=4x$ au point $(4\,;4)$ ?`, reponse: R`$p=2$ : $4y=2(x+4)$, soit $y=\frac{1}{2}x+2$.` },
        { question: R`Pour quels $k$ la droite $y=\frac{1}{2}x+k$ est-elle tangente à $\dfrac{x^2}{8}+\dfrac{y^2}{2}=1$ ?`, reponse: R`$k^2=8\cdot\frac{1}{4}+2=4$ : $k=2$ ou $k=-2$.` },
        { question: R`Tangente à l'ellipse en son sommet $(a\,;0)$ ?`, reponse: R`La droite verticale $x=a$ (forme dédoublée : $\frac{x\cdot a}{a^2}=1$).` },
      ],
      blocks: [
        { kind: 'video', title: 'Tangentes à une conique', youtubeId: 'JBo7U-lIeK4' },
        {
          kind: 'para',
          text:
            R`Une conique n'est pas le graphique d'une fonction : la verticale d'abscisse $x$ la traverse en général en deux points. Mais elle est l'**union de deux graphiques de fonctions** (section 1) — et la tangente en un point $P$ de la conique, c'est simplement la tangente au graphique de celle des deux fonctions qui contient $P$.`,
        },
        {
          kind: 'methode',
          label: "Méthode — tangente en un point d'une conique",
          items: [
            R`(1) écris la conique comme union de deux graphiques $y=\pm f(x)$ ; (2) choisis la branche qui contient $P(x_P\,;y_P)$ — celle du haut si $y_P>0$, celle du bas si $y_P<0$ ; (3) dérive cette fonction et évalue-la en $x_P$ : c'est la **pente** de la tangente ; (4) écris $y-y_P = f'(x_P)(x-x_P)$.`,
          ],
        },
        { kind: 'subheading', text: "Cas de l'ellipse — la dérivation complète" },
        {
          kind: 'para',
          text: R`Soient l'ellipse d'équation $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ et un point $P(x_P\,;y_P)$ de cette ellipse, avec $y_P\neq0$.`,
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — pente de la tangente à l'ellipse",
          blocks: [
            { kind: 'para', text: R`$P$ **est sur l'ellipse** : $\dfrac{x_P^2}{a^2}+\dfrac{y_P^2}{b^2}=1 \iff b^2x_P^2+a^2y_P^2=a^2b^2$, donc $y_P = \pm\dfrac{b}{a}\sqrt{a^2-x_P^2}$.` },
            { kind: 'para', text: R`**Branche supérieure** ($y_P>0$) : $P$ est un point du graphique de $f(x) = \dfrac{b}{a}\sqrt{a^2-x^2}$, avec $x_P \in \,]-a\,;a[$.` },
            { kind: 'para', text: R`**Dérivée** (dérivée d'une racine composée) : $f'(x)=\dfrac{b}{a}\cdot\dfrac{-2x}{2\sqrt{a^2-x^2}}$, donc $f'(x_P) = -\dfrac{bx_P}{a\sqrt{a^2-x_P^2}}$.` },
            { kind: 'para', text: R`**Sans racine** : comme $\sqrt{a^2-x_P^2}=\frac{a}{b}\,y_P$, on obtient $f'(x_P) = -\dfrac{bx_P}{a\cdot\frac{a}{b}y_P} = -\dfrac{b^2x_P}{a^2y_P}$.` },
            { kind: 'para', text: R`**Branche inférieure** ($y_P<0$) : on dérive $-f$ ; $f'$ change de signe, mais $\sqrt{a^2-x_P^2}=-\frac{a}{b}\,y_P$ aussi : la formule $-\dfrac{b^2x_P}{a^2y_P}$ reste la même.` },
          ],
        },
        {
          kind: 'para',
          text:
            R`La seconde écriture, $-\frac{b^2x_P}{a^2y_P}$, est la forme la plus utile : elle ne contient plus de racine, et elle vaut pour les deux branches. Le même calcul donne, pour l'hyperbole $\frac{x^2}{a^2}-\frac{y^2}{b^2}=1$, la pente $+\dfrac{b^2x_P}{a^2y_P}$, et pour la parabole $y^2=2px$, la pente $\dfrac{p}{y_P}$.`,
        },
        {
          kind: 'definition',
          label: 'À retenir — équation de la tangente, forme « dédoublée »',
          items: [
            R`En développant $y-y_P = -\frac{b^2x_P}{a^2y_P}(x-x_P)$ et en utilisant $b^2x_P^2+a^2y_P^2=a^2b^2$, on obtient une forme symétrique dite **dédoublée** : elle s'obtient de l'équation de la conique en remplaçant $x^2$ par $x\cdot x_P$, $y^2$ par $y\cdot y_P$, et, s'il y a des termes du premier degré, $x$ par $\frac{x+x_P}{2}$ et $y$ par $\frac{y+y_P}{2}$ :`,
            R`ellipse : $\dfrac{x\,x_P}{a^2} + \dfrac{y\,y_P}{b^2} = 1$ ; hyperbole : $\dfrac{x\,x_P}{a^2} - \dfrac{y\,y_P}{b^2} = 1$ ; parabole $y^2=2px$ : $y\,y_P = p(x+x_P)$.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — forme dédoublée de la tangente à l'ellipse",
          blocks: [
            { kind: 'para', text: R`**Équation de la tangente** en $P(x_P\,;y_P)$, $y_P\neq0$ : $y-y_P=-\dfrac{b^2x_P}{a^2y_P}(x-x_P)$.` },
            { kind: 'para', text: R`**On multiplie par** $a^2y_P$ : $a^2y_Py-a^2y_P^2=-b^2x_Px+b^2x_P^2 \iff b^2x_Px+a^2y_Py=b^2x_P^2+a^2y_P^2$.` },
            { kind: 'para', text: R`$P$ **est sur l'ellipse** : le second membre vaut $a^2b^2$. En divisant par $a^2b^2$ : $\dfrac{x\,x_P}{a^2}+\dfrac{y\,y_P}{b^2}=1$.` },
            { kind: 'para', text: R`**Si** $y_P=0$, $P$ est un sommet $(\pm a\,;0)$ : la tangente est la verticale $x=\pm a$, et la formule donne $\frac{x\cdot(\pm a)}{a^2}=1 \iff x=\pm a$ — elle reste vraie. Pour l'hyperbole, le même calcul avec la pente $+\frac{b^2x_P}{a^2y_P}$ donne $\frac{x\,x_P}{a^2}-\frac{y\,y_P}{b^2}=1$.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — forme dédoublée de la tangente à la parabole',
          blocks: [
            { kind: 'para', text: R`Soit $P(x_P\,;y_P)$ un point de la parabole $y^2=2px$ avec $y_P>0$ : il est sur le graphique de $f(x)=\sqrt{2px}$.` },
            { kind: 'para', text: R`**Pente** : $f'(x)=\dfrac{2p}{2\sqrt{2px}}=\dfrac{p}{\sqrt{2px}}$, donc $f'(x_P)=\dfrac{p}{y_P}$ (même résultat sur la branche inférieure).` },
            { kind: 'para', text: R`**Équation** : $y-y_P=\dfrac{p}{y_P}(x-x_P) \iff y\,y_P-y_P^2=px-px_P$. Comme $y_P^2=2px_P$ : $y\,y_P=px-px_P+2px_P=p(x+x_P)$.` },
            { kind: 'para', text: R`**Au sommet** ($x_P=y_P=0$), la formule donne $0=px$, soit $x=0$ : la tangente verticale.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — tangente à x²⁄25 + y²⁄16 = 1 au point P(3 ; 16⁄5)',
          blocks: [
            {
              kind: 'para',
              text:
                R`**1) Vérifier que** $P$ **est sur l'ellipse.** $\frac{9}{25}+\frac{(16/5)^2}{16} = \frac{9}{25}+\frac{16}{25} = 1$ ✓. Ici $a=5$, $b=4$, $y_P=\frac{16}{5}>0$ : c'est la branche supérieure $f(x)=\frac{4}{5}\sqrt{25-x^2}$.`,
            },
            {
              kind: 'para',
              text: R`**2) Pente.** $f'(3) = -\dfrac{b^2x_P}{a^2y_P} = -\dfrac{16\cdot3}{25\cdot\frac{16}{5}} = -\dfrac{48}{80} = -\dfrac{3}{5}$.`,
            },
            { kind: 'para', text: R`Contrôle par la première écriture : $-\dfrac{bx_P}{a\sqrt{a^2-x_P^2}} = -\dfrac{4\cdot3}{5\cdot4} = -\dfrac{3}{5}$ ✓.` },
            {
              kind: 'para',
              text: R`**3) Équation de la tangente.** $y-\dfrac{16}{5} = -\dfrac{3}{5}(x-3) \iff y = -\dfrac{3}{5}x+5 \iff 3x+5y=25$.`,
            },
            {
              kind: 'para',
              text: R`**4) Contrôle par la forme dédoublée.** $\dfrac{3x}{25}+\dfrac{\frac{16}{5}y}{16}=1 \iff \dfrac{3x}{25}+\dfrac{y}{5}=1 \iff 3x+5y=25$ ✓ — même droite.`,
            },
            {
              kind: 'para',
              text:
                R`**5) Contrôle par le discriminant.** En substituant $y=-\frac{3}{5}x+5$ dans $16x^2+25y^2=400$ : $16x^2+9x^2-150x+625-400 = 25x^2-150x+225 = 25(x-3)^2$. Racine **double** en $x=3$, donc $\Delta=0$ : la droite est bien tangente, et le point de contact est bien $P$ ✓.`,
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -6.5, xMax: 6.5, yMin: -6.09375, yMax: 6.09375,
            curves: [
              { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
            ],
            vectors: [{ from: { x: -1.823, y: 6.09375 }, to: { x: 6.5, y: 1.1 }, tone: 'attn', arrow: false }],
            points: [{ x: 3, y: 3.2, label: 'P', tone: 'ink', labelPos: 'right' }],
            caption:
              R`Tangente à l'ellipse $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$ au point $P(3\,;3{,}2)$ : droite $3x+5y=25$, de pente $-\dfrac{3}{5}$. Elle touche l'ellipse en $P$ et ne la recoupe nulle part.`,
          },
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — tangentes à une hyperbole et à une parabole",
          blocks: [
            { kind: 'para', text: R`**Hyperbole** $\dfrac{x^2}{9}-\dfrac{y^2}{16}=1$ **au point** $P\left(5\,;\frac{16}{3}\right)$. Vérification : $\frac{25}{9}-\frac{256/9}{16}=\frac{25}{9}-\frac{16}{9}=1$ ✓. Forme dédoublée : $\dfrac{5x}{9}-\dfrac{\frac{16}{3}y}{16}=1 \iff \dfrac{5x}{9}-\dfrac{y}{3}=1 \iff 5x-3y=9$.` },
            { kind: 'para', text: R`Contrôle par la pente : $\dfrac{b^2x_P}{a^2y_P}=\dfrac{16\cdot5}{9\cdot\frac{16}{3}}=\dfrac{5}{3}$, et la droite $5x-3y=9$ a bien pour pente $\frac{5}{3}$ ✓.` },
            { kind: 'para', text: R`**Parabole** $y^2=4x$ ($2p=4$, $p=2$) **au point** $P(4\,;4)$. Forme dédoublée : $4y=2(x+4) \iff y=\dfrac{1}{2}x+2$. Pente $\frac{p}{y_P}=\frac{2}{4}=\frac{1}{2}$ ✓. Cette tangente coupe l'axe focal en $T(-4\,;0)$ : l'abscisse de $T$ est l'opposée de celle de $P$ (on s'en servira en section 6).` },
          ],
        },
        {
          kind: 'piege',
          label: "Les sommets de l'axe focal n'ont pas de pente",
          text:
            R`Aux sommets $(\pm a\,;0)$ d'une ellipse (ou d'une hyperbole), $y_P=0$ : la formule $-\frac{b^2x_P}{a^2y_P}$ **n'a plus de sens** (division par zéro), et $f$ n'y est d'ailleurs pas dérivable ! C'est normal : la tangente y est **verticale**, d'équation $x=\pm a$. Même chose au sommet de la parabole $y^2=2px$ : tangente $x=0$. La forme dédoublée, elle, reste valable et donne directement ces droites.`,
        },
        {
          kind: 'piege',
          label: 'Dériver la mauvaise branche',
          text:
            R`Pour $y_P<0$, c'est la branche $y=-f(x)$ qu'il faut dériver ! Utiliser $f$ te donne une pente de **signe opposé**, et une tangente symétrique de la bonne par rapport à l'axe des abscisses — une erreur invisible sur le calcul, mais très visible sur un croquis. Fais toujours un croquis rapide pour vérifier de quel côté la tangente doit pencher.`,
        },
        {
          kind: 'astuce',
          label: 'La forme dédoublée évite entièrement la dérivation',
          text:
            R`Une fois établie, la forme dédoublée s'écrit sans aucun calcul de dérivée, ne présente aucun cas particulier (sommets compris), et se retient très facilement : tu remplaces, dans l'équation de la conique, $x^2$ par $xx_P$, $y^2$ par $yy_P$, $x$ par $\frac{x+x_P}{2}$ et $y$ par $\frac{y+y_P}{2}$. Il faut quand même la **justifier** par la dérivation quand l'énoncé demande la démarche.`,
        },
        { kind: 'subheading', text: 'Tangentes de pente donnée, tangentes issues d’un point' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — condition de tangence d’une droite à une ellipse',
          blocks: [
            { kind: 'para', text: R`On cherche quand la droite $y=mx+k$ est tangente à l'ellipse $b^2x^2+a^2y^2=a^2b^2$, c'est-à-dire quand leur intersection est un point double.` },
            { kind: 'para', text: R`**Substitution** : $b^2x^2+a^2(mx+k)^2=a^2b^2 \iff (b^2+a^2m^2)x^2+2a^2mkx+a^2(k^2-b^2)=0$ — une équation du second degré, car $b^2+a^2m^2>0$.` },
            { kind: 'para', text: R`**Discriminant** (réduit) : $\dfrac{\Delta}{4}=a^4m^2k^2-(b^2+a^2m^2)\,a^2(k^2-b^2)=a^2\left(b^4-b^2k^2+a^2m^2b^2\right)=a^2b^2\left(a^2m^2+b^2-k^2\right)$.` },
            { kind: 'para', text: R`**Conclusion** : la droite est tangente $\iff \Delta=0 \iff k^2=a^2m^2+b^2$. Pour toute pente $m$, il y a donc exactement **deux** tangentes, symétriques par rapport au centre.` },
          ],
        },
        {
          kind: 'definition',
          label: 'À retenir — conditions de tangence de la droite y = mx + k',
          items: [
            R`Ellipse $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ : $k^2=a^2m^2+b^2$.`,
            R`Hyperbole $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ : $k^2=a^2m^2-b^2$ — il faut $|m|>\frac{b}{a}$ (plus raide que les asymptotes). Hyperbole $\dfrac{y^2}{a^2}-\dfrac{x^2}{b^2}=1$ : $k^2=a^2-b^2m^2$ — il faut cette fois $|m|<\frac{a}{b}$ (plus plate que les asymptotes).`,
            R`Parabole $y^2=2px$ ($m\neq0$) : $k=\dfrac{p}{2m}$.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — tangentes de pente 1⁄2 et tangentes issues de P(0 ; 2)',
          blocks: [
            { kind: 'para', text: R`Ellipse $\dfrac{x^2}{8}+\dfrac{y^2}{2}=1$ : $a^2=8$, $b^2=2$.` },
            { kind: 'para', text: R`**a) Tangentes de pente** $\frac{1}{2}$. $k^2=8\cdot\frac{1}{4}+2=4$, donc $k=2$ ou $k=-2$ : $y=\frac{1}{2}x+2$ et $y=\frac{1}{2}x-2$. Point de contact de la première : la substitution donne $(x+2)^2=0$ (section 4), donc $T(-2\,;1)$.` },
            { kind: 'para', text: R`**b) Tangentes issues de** $P(0\,;2)$. Une droite non verticale par $P$ s'écrit $y=mx+2$ ($k=2$). Condition : $4=8m^2+2 \iff m^2=\frac{1}{4} \iff m=\pm\frac{1}{2}$. Deux tangentes, $y=\frac{1}{2}x+2$ et $y=-\frac{1}{2}x+2$, de points de contact $(-2\,;1)$ et $(2\,;1)$. La verticale $x=0$ par $P$ coupe l'ellipse en $(0\,;\pm\sqrt{2})$ : elle n'est pas tangente.` },
            { kind: 'para', text: R`**Position du point** : $P$ est extérieur ($\frac{0}{8}+\frac{4}{2}=2>1$) : deux tangentes. Un point de l'ellipse n'en a qu'une, un point intérieur aucune.` },
          ],
        },
        {
          kind: 'methode',
          label: "Méthode — tangentes issues d'un point P(x₀ ; y₀)",
          items: [
            R`(1) **Position** : remplace $(x_0\,;y_0)$ dans le premier membre de l'équation réduite ; comparé au second membre, il dit si $P$ est extérieur (deux tangentes), sur la conique (une) ou intérieur (aucune).`,
            R`(2) Écris une droite par $P$ : $y=m(x-x_0)+y_0$, donc $k=y_0-mx_0$, et impose la condition de tangence : équation du second degré en $m$.`,
            R`(3) **N'oublie pas la verticale** $x=x_0$ : elle n'a pas de pente, mais elle peut être tangente (si $x_0=\pm a$ pour une ellipse ou une hyperbole d'axe horizontal).`,
            R`(4) Points de contact : par la substitution (racine double), ou en identifiant la tangente à la forme dédoublée.`,
          ],
        },
        {
          kind: 'astuce',
          label: "Le point de la conique le plus proche d'une droite",
          text:
            R`Si une droite $\Delta$ ne coupe pas la conique, le point de la conique le plus proche de $\Delta$ est un point de contact d'une tangente **parallèle** à $\Delta$ (même pente) — celle qui est du côté de $\Delta$. Exemple : pour l'ellipse $\frac{x^2}{8}+\frac{y^2}{2}=1$ et la droite $x-2y+8=0$ (pente $\frac{1}{2}$), les tangentes parallèles sont $y=\frac{1}{2}x\pm2$ ; la plus proche est $y=\frac{1}{2}x+2$, de contact $T(-2\,;1)$, et la distance cherchée vaut $\frac{|-2-2+8|}{\sqrt{5}}=\frac{4}{\sqrt{5}}=\frac{4\sqrt{5}}{5}$. Vérifie d'abord que la droite ne coupe pas la conique : sinon la distance minimale est nulle.`,
        },
        {
          kind: 'astuce',
          label: 'Trouver une conique dont on connaît une tangente',
          text:
            R`La condition de tangence fournit une **équation entre** $a^2$ **et** $b^2$. Exemple : l'ellipse $\frac{x^2}{a^2}+\frac{y^2}{2}=1$ est tangente à $y=\frac{1}{2}x+2$ si $4=\frac{a^2}{4}+2$, soit $a^2=8$. Avec deux inconnues $a^2$ et $b^2$, une seconde donnée (un point de la conique, une autre tangente) complète le système.`,
        },
        {
          kind: 'entrainement',
          title: 'Tangentes à une conique',
          generatorId: '6gen62',
          description: [
            "Détermine la tangente à une conique en un point, les tangentes de pente donnée ou issues d'un point, ou une conique tangente à une droite — forme dédoublée et condition de tangence.",
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
      titreCourt: 'Propriétés optiques',
      partie: 'Miroirs et applications',
      essentiel: [
        R`Parabole : un rayon parallèle à l'axe est réfléchi vers le foyer ; un rayon issu du foyer est réfléchi parallèlement à l'axe.`,
        R`Ellipse : un rayon issu d'un foyer est réfléchi vers l'autre foyer. Hyperbole : un rayon issu d'un foyer repart comme s'il **venait** de l'autre foyer ; un rayon dirigé vers un foyer est renvoyé vers l'autre.`,
        R`Dans les trois cas, la tangente en $P$ fait des angles égaux avec les deux droites qui vont de $P$ vers les foyers (ou vers le foyer et parallèlement à l'axe, pour la parabole).`,
      ],
      cartes: [
        { question: R`Où placer le capteur d'une antenne parabolique de diamètre $60$ cm et de profondeur $9$ cm ?`, reponse: R`Au foyer, à $\dfrac{D^2}{16h}=\dfrac{3600}{144}=25$ cm du sommet.` },
        { question: R`Un miroir elliptique concentre-t-il un faisceau de rayons parallèles ?`, reponse: R`Non : seule la parabole concentre des rayons parallèles ; l'ellipse renvoie vers un foyer ce qui part de l'autre.` },
        { question: R`Que devient un rayon issu d'un foyer d'un miroir hyperbolique ?`, reponse: R`Il est réfléchi sur la droite qui le relie à l'autre foyer, mais en s'en éloignant : il semble venir de l'autre foyer.` },
        { question: R`Pourquoi les ondes d'un lithotriteur arrivent-elles toutes en même temps sur le calcul rénal ?`, reponse: R`Tous les trajets foyer → paroi → foyer ont la même longueur $2a$.` },
      ],
      blocks: [
        { kind: 'video', title: 'Propriétés optiques des coniques', youtubeId: 'ITXxHxKQQeM' },
        {
          kind: 'para',
          text:
            "Un rayon lumineux qui frappe un miroir courbe se réfléchit selon la loi de Descartes : l'angle d'incidence et l'angle de réflexion, mesurés par rapport à la **tangente** au point d'impact, sont égaux. Et les coniques ont, vis-à-vis de leurs foyers, exactement la propriété d'angles qui rend ces réflexions si remarquables !",
        },
        { kind: 'subheading', text: 'A. La parabole' },
        {
          kind: 'intuition',
          label: 'Le secret des miroirs paraboliques',
          text:
            "Imagine des rayons de lumière qui arrivent tous parallèles, comme les rayons du soleil, et qui frappent un miroir courbe. Sur un miroir parabolique, ils rebondissent tous vers le **même point** : le foyer — peu importe à quelle distance de l'axe chaque rayon a frappé le miroir ! Sur n'importe quelle autre courbe, ils partiraient dans des directions différentes, sans jamais converger. C'est cette propriété que la démonstration ci-dessous établit.",
        },
        {
          kind: 'definition',
          label: 'Propriété optique de la parabole',
          items: [
            R`En tout point $P$ d'une parabole, la droite joignant $P$ au foyer $F$ et la parallèle à l'axe de symétrie passant par $P$ forment des angles aigus **de même amplitude** avec la tangente à la parabole en $P$.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — propriété optique de la parabole',
          blocks: [
            { kind: 'para', text: R`Soit la parabole $y^2=2px$, de foyer $F\left(\frac{p}{2}\,;0\right)$ et de directrice $d\equiv x=-\frac{p}{2}$, et $P(x_P\,;y_P)$ un de ses points, autre que le sommet.` },
            { kind: 'para', text: R`**Où la tangente coupe l'axe.** La tangente en $P$ a pour équation $y\,y_P=p(x+x_P)$ (section 5). Pour $y=0$ : $x=-x_P$. Elle coupe donc l'axe focal en $T(-x_P\,;0)$.` },
            { kind: 'para', text: R`**Le triangle** $FPT$ **est isocèle en** $F$. D'une part $|FT|=\frac{p}{2}-(-x_P)=x_P+\frac{p}{2}$. D'autre part, $P$ est sur la parabole : $|FP|=\text{dist}(P\,;d)=x_P+\frac{p}{2}$. Donc $|FT|=|FP|$, et les angles à la base sont égaux : $\widehat{FTP}=\widehat{FPT}$.` },
            { kind: 'para', text: R`**Angles correspondants.** La parallèle à l'axe menée par $P$ et l'axe focal sont deux parallèles coupées par la tangente : l'angle qu'elle fait avec la tangente est égal à $\widehat{FTP}$. Il est donc égal à $\widehat{FPT}$, l'angle entre la tangente et $(PF)$ : c'est la propriété annoncée.` },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -5, xMax: 6, yMin: -3.5, yMax: 6.8125,
            curvesOfY: [{ fn: (y) => (y * y) / 4, tone: 'accent', yMin: -3.5, yMax: 4.89 }],
            vectors: [
              { from: { x: -4, y: 0 }, to: { x: 6, y: 5 }, tone: 'ink', dashed: true, arrow: false },
              { from: { x: 4, y: 4 }, to: { x: 1, y: 0 }, tone: 'good', arrow: false },
              { from: { x: 4, y: 4 }, to: { x: 6, y: 4 }, tone: 'attn', arrow: false },
            ],
            angleArcs: [
              { cx: 4, cy: 4, fromDeg: -153.43, toDeg: -126.87, radiusPx: 22, tone: 'accent' },
              { cx: 4, cy: 4, fromDeg: 0, toDeg: 26.57, radiusPx: 22, tone: 'accent' },
              { cx: -4, cy: 0, fromDeg: 0, toDeg: 26.57, radiusPx: 22, tone: 'accent' },
            ],
            points: [
              { x: 1, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
              { x: 4, y: 4, label: 'P', tone: 'ink', labelPos: 'above' },
              { x: -4, y: 0, label: 'T', tone: 'ink', labelPos: 'below' },
            ],
            caption: R`Parabole $y^2=4x$ ($p=2$, $F(1\,;0)$) et tangente en $P(4\,;4)$, qui coupe l'axe en $T(-4\,;0)$. $|FT|=|FP|=5$ : le triangle $FPT$ est isocèle, et les trois angles marqués sont égaux.`,
          },
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
              { from: { x: 1.5, y: 6.3 }, to: { x: 1.5, y: 0.5625 }, tone: 'attn' },
              { from: { x: -1.5, y: 6.3 }, to: { x: -1.5, y: 0.5625 }, tone: 'attn' },
              { from: { x: -3, y: 6.3 }, to: { x: -3, y: 2.25 }, tone: 'attn' },
              { from: { x: 3, y: 2.25 }, to: { x: 0, y: 1 }, tone: 'good' },
              { from: { x: 1.5, y: 0.5625 }, to: { x: 0, y: 1 }, tone: 'good' },
              { from: { x: -1.5, y: 0.5625 }, to: { x: 0, y: 1 }, tone: 'good' },
              { from: { x: -3, y: 2.25 }, to: { x: 0, y: 1 }, tone: 'good' },
            ],
            points: [{ x: 0, y: 1, label: 'F', tone: 'good', labelPos: 'above' }],
            caption:
              R`Miroir parabolique $x^2=4y$ ($p=2$, foyer $F(0\,;1)$) : quatre rayons parallèles à l'axe, arrivant à des distances différentes de l'axe, convergent tous exactement en $F$ après réflexion.`,
          },
        },
        {
          kind: 'astuce',
          label: 'Pourquoi les antennes et les phares sont paraboliques',
          text:
            "Une antenne parabolique reçoit des ondes venues d'un satellite très éloigné, donc pratiquement **parallèles** : elles se concentrent toutes au foyer, où l'on place le capteur. Un phare de voiture, lui, fonctionne à l'envers : la source est placée au foyer, et le miroir renvoie un faisceau parallèle. Un four solaire exploite la première propriété, un télescope à réflexion aussi.",
        },
        {
          kind: 'exempleLibre',
          label: "Exemple résolu — où placer le capteur d'une antenne parabolique ?",
          blocks: [
            { kind: 'para', text: R`Une antenne parabolique a un diamètre $D=60$ cm et une profondeur $h=9$ cm (mesurée le long de l'axe, du sommet jusqu'au plan du bord). À quelle distance du sommet faut-il placer le capteur ?` },
            { kind: 'para', text: R`**Repère** : sommet à l'origine, axe vertical : la coupe de l'antenne est la parabole $x^2=2py$. Le bord est au point $\left(\frac{D}{2}\,;h\right)=(30\,;9)$.` },
            { kind: 'para', text: R`**Paramètre** : $30^2=2p\cdot9 \iff p=\dfrac{900}{18}=50$. Le foyer est à $\dfrac{p}{2}=25$ cm du sommet.` },
            { kind: 'para', text: R`**Formule générale** : $\left(\frac{D}{2}\right)^2=2ph$ donne $p=\dfrac{D^2}{8h}$, et la distance focale (du sommet au foyer) vaut $\dfrac{p}{2}=\dfrac{D^2}{16h}$ — ici $\frac{3600}{144}=25$ cm ✓. Piège : $\frac{D}{2}$ est le **rayon** de l'antenne, et la distance focale vaut $\frac{p}{2}$, pas $p$.` },
          ],
        },
        {
          kind: 'application',
          titre: "Capter un signal venu de l'espace avec une parabole",
          illustrations: [
            {
              kind: 'categoricalBarChart',
              orientation: 'horizontal',
              scale: 'log',
              logMin: -1,
              bars: [
                { label: '0,6 m', value: 0.36, valueLabel: '0,36' },
                { label: '3 m', value: 9, valueLabel: '9' },
                { label: '500 m', value: 250000, valueLabel: '250 000' },
              ],
              footnote: 'FAST : ≈ 700 000 fois plus de signal capté',
              caption:
                "La surface qui capte les ondes — donc la puissance du signal reçu au " +
                "foyer — grandit comme le carré du diamètre. C'est pour ça qu'un " +
                "radiotélescope comme FAST (500 m) écrase une antenne domestique (0,6 m) ; " +
                "échelle logarithmique pour que les trois tiennent sur le même graphe.",
            },
          ],
          text:
            "Tu viens de voir que tout rayon parallèle à l'axe d'une parabole se réfléchit " +
            "vers le foyer : c'est exactement le principe d'une antenne satellite ou d'un " +
            "radiotélescope. Un satellite de télécommunication est si loin (36 000 km pour " +
            'un satellite géostationnaire) que les ondes radio qu\'il émet arrivent quasiment ' +
            'parallèles entre elles au moment où elles atteignent la Terre. Une antenne ' +
            'parabolique capte ces ondes sur toute sa surface — parfois plusieurs mètres de ' +
            "diamètre — et les concentre **toutes** en un seul point, le foyer, où se trouve le " +
            "récepteur (le « LNB »). Plus le diamètre de la parabole est grand, plus elle " +
            'capte d\'ondes et plus le signal reçu au foyer est puissant — c\'est pour ça que ' +
            'les plus grands radiotélescopes du monde, comme celui de 500 mètres de diamètre ' +
            "en Chine (FAST), peuvent détecter des signaux radio émis à des milliards " +
            "d'années-lumière.",
          domaines: ['Télécommunications', 'Astronomie'],
          image: {
            src: '/images/application/satellite-dish.jpg',
            alt: 'Antenne parabolique de communication par satellite',
            caption:
              'Antenne parabolique de 28,5 m de la station terrienne de Raisting, Allemagne. ' +
              'Photo : Richard Bartz, CC BY-SA 2.5, via Wikimedia Commons.',
          },
        },
        { kind: 'subheading', text: "B. L'ellipse et l'hyperbole" },
        {
          kind: 'definition',
          label: "Propriété optique de l'ellipse et de l'hyperbole",
          items: [
            R`Les droites joignant un point quelconque $P$ d'une ellipse (d'une hyperbole) à ses **foyers** forment des angles aigus **de même amplitude** avec la tangente à la courbe en ce point.`,
            R`Pour l'ellipse, la tangente est la bissectrice **extérieure** de l'angle $\widehat{FPF'}$ ; pour l'hyperbole, elle en est la bissectrice **intérieure**.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — propriété optique de l'ellipse",
          blocks: [
            { kind: 'para', text: R`Soit $P$ un point de l'ellipse de foyers $F$ et $F'$, et $t$ la tangente en $P$. On admet que $t$ reste à l'extérieur de l'ellipse, sauf en $P$ : pour tout point $M\neq P$ de $t$, $|MF|+|MF'|>2a$.` },
            { kind: 'para', text: R`**Symétrique d'un foyer.** Soit $G$ le symétrique de $F$ par rapport à $t$. Pour tout point $M$ de $t$, $|MF|=|MG|$, donc $|MF|+|MF'|=|MG|+|MF'|\geq|GF'|$ (inégalité triangulaire), avec égalité seulement si $M$ est sur le segment $[GF']$.` },
            { kind: 'para', text: R`$P$ **est le point de** $t$ **qui minimise la somme** : $|PF|+|PF'|=2a$, alors que tous les autres points de $t$ donnent plus que $2a$. Le minimum $|GF'|$ est donc atteint en $P$, et $P$ est sur le segment $[GF']$ : $G$, $P$, $F'$ sont alignés.` },
            { kind: 'para', text: R`**Les angles.** L'angle entre $t$ et $(PF)$ est égal, par symétrie, à l'angle entre $t$ et $(PG)$ ; et comme $G$, $P$, $F'$ sont alignés, celui-ci est opposé par le sommet à l'angle entre $t$ et $(PF')$. Les deux angles sont donc égaux. Pour l'hyperbole, le même raisonnement avec la différence des distances montre que la tangente est la bissectrice intérieure de $\widehat{FPF'}$.` },
          ],
        },
        {
          kind: 'methode',
          label: 'Conséquences — les miroirs elliptique et hyperbolique',
          items: [
            R`Dans un miroir **elliptique**, tout rayon lumineux issu d'un foyer est réfléchi **vers l'autre foyer**.`,
            R`Dans un miroir **hyperbolique**, tout rayon lumineux issu d'un foyer est réfléchi comme s'il **venait de l'autre foyer** : le rayon réfléchi s'éloigne de cet autre foyer, mais son **prolongement** en arrière passe par lui. Inversement, un rayon **dirigé vers** un foyer est renvoyé vers l'autre foyer.`,
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -6.5, xMax: 6.5, yMin: -6.09375, yMax: 6.09375,
              curves: [
                { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
                { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'accent', xMin: -5, xMax: 5 },
              ],
              vectors: [
                { from: { x: -3, y: 0 }, to: { x: 3, y: 3.2 }, tone: 'attn' },
                { from: { x: 3, y: 3.2 }, to: { x: 3, y: 0 }, tone: 'good' },
                { from: { x: -1.823, y: 6.09375 }, to: { x: 6.5, y: 1.1 }, tone: 'ink', dashed: true, arrow: false },
              ],
              points: [
                { x: 3, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: -3, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
                { x: 3, y: 3.2, label: 'P', tone: 'ink', labelPos: 'right' },
              ],
              caption:
                R`Miroir elliptique : quel que soit le point d'impact, un rayon parti de $F'$ repasse par $F$. La tangente $3x+5y=25$ y fait le même angle avec $(PF')$ qu'avec $(PF)$.`,
            },
            {
              kind: 'vectorPlane',
              xMin: -7, xMax: 7, yMin: -6.5625, yMax: 6.5625,
              curvesOfY: [
                { fn: (y) => 3 * r(1 + (y * y) / 16), tone: 'accent' },
                { fn: (y) => -3 * r(1 + (y * y) / 16), tone: 'accent' },
              ],
              vectors: [
                { from: { x: -5, y: 0 }, to: { x: 3.75, y: 3 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 5, y: 0 }, to: { x: 3.75, y: 3 }, tone: 'attn' },
                { from: { x: 3.75, y: 3 }, to: { x: 7, y: 3 + (3.25 * 3) / 8.75 }, tone: 'good' },
                { from: { x: 1.5, y: -2 }, to: { x: 5.353, y: 6.5625 }, tone: 'ink', dashed: true, arrow: false },
              ],
              angleArcs: [
                { cx: 3.75, cy: 3, fromDeg: -114.23, toDeg: -67.38, radiusPx: 18, tone: 'accent' },
                { cx: 3.75, cy: 3, fromDeg: 18.92, toDeg: 65.77, radiusPx: 18, tone: 'accent' },
              ],
              points: [
                { x: 5, y: 0, label: 'F', tone: 'good', labelPos: 'below' },
                { x: -5, y: 0, label: "F'", tone: 'good', labelPos: 'below' },
                { x: 3.75, y: 3, label: 'P', tone: 'ink', labelPos: 'above' },
              ],
              caption:
                R`Miroir hyperbolique $\frac{x^2}{9}-\frac{y^2}{16}=1$ : le rayon issu de $F$ frappe le miroir en $P\left(\frac{15}{4}\,;3\right)$ et repart comme s'il venait de $F'$ (prolongement en pointillé). La tangente $20x-9y=48$ fait des angles égaux avec le rayon incident et le rayon réfléchi.`,
            },
          ],
        },
        {
          kind: 'astuce',
          label: "De l'ellipse à la parabole : le second foyer part à l'infini",
          text:
            R`La propriété de la parabole est en fait le **cas limite** de celle de l'ellipse ! Éloigne indéfiniment le second foyer $F'$ : les droites $PF'$ deviennent toutes parallèles entre elles — parallèles à l'axe. L'énoncé « $PF$ et $PF'$ font des angles égaux avec la tangente » devient alors « $PF$ et la parallèle à l'axe font des angles égaux avec la tangente » : exactement la propriété de la parabole. Une seule idée, trois formulations.`,
        },
        {
          kind: 'piege',
          label: "L'ellipse ne concentre pas les rayons parallèles",
          text:
            "La propriété de l'ellipse concerne **les deux foyers** : elle relie un foyer à l'autre, jamais une direction parallèle à un foyer ! Un faisceau de rayons parallèles envoyé sur un miroir elliptique ne se concentre en **aucun** point — seul le miroir **parabolique** a cette propriété. Et symétriquement, un rayon issu du foyer d'une parabole ne repasse par aucun « second foyer » : la parabole n'en a qu'un.",
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — calculer un rayon réfléchi',
          blocks: [
            { kind: 'para', text: R`**Miroir elliptique** $\dfrac{x^2}{25}+\dfrac{y^2}{16}=1$ ($F(3\,;0)$, $F'(-3\,;0)$). Un rayon issu de $F'$ frappe le miroir en $P\left(4\,;\frac{12}{5}\right)$ (vérification : $\frac{16}{25}+\frac{144/25}{16}=\frac{16}{25}+\frac{9}{25}=1$ ✓). Il est réfléchi vers $F$ : il suit la droite $(PF)$, de pente $\frac{12/5-0}{4-3}=\frac{12}{5}$, soit $y=\frac{12}{5}(x-3)$, ou $12x-5y-36=0$.` },
            { kind: 'para', text: R`**Miroir hyperbolique** $\dfrac{x^2}{9}-\dfrac{y^2}{16}=1$ ($F(5\,;0)$, $F'(-5\,;0)$). Un rayon issu de $F$ frappe le miroir en $P\left(\frac{15}{4}\,;3\right)$. Il repart sur la droite $(F'P)$, de pente $\frac{3-0}{15/4+5}=\frac{12}{35}$ : $12x-35y+60=0$ — mais seulement sur la **demi-droite** qui part de $P$ et s'éloigne de $F'$ (les points d'abscisse $x\geq\frac{15}{4}$).` },
            { kind: 'para', text: R`**Miroir parabolique** $y^2=4x$ ($F(1\,;0)$). Un rayon issu de $F$ frappe le miroir en $P(4\,;4)$ : il repart parallèlement à l'axe, sur la demi-droite $y=4$, $x\geq4$.` },
            { kind: 'para', text: R`**Contrôle par les angles** (ellipse) : la tangente en $P$ a pour équation $\frac{4x}{25}+\frac{12y}{80}=1$, soit $16x+15y=100$ ; elle fait des angles égaux avec $(PF)$ et $(PF')$ — c'est ce que garantit la propriété, sans aucun calcul d'angle.` },
          ],
        },
        {
          kind: 'astuce',
          label: 'Applications concrètes des trois miroirs',
          text:
            "**Parabolique** : antenne satellite, phare, four solaire, télescope de Newton. **Elliptique** : lithotritie (les ondes de choc émises depuis un foyer se concentrent sur le calcul rénal placé à l'autre foyer) et « galeries à écho ». **Hyperbolique** : le petit miroir secondaire d'un télescope de type Cassegrain. Les rayons réfléchis par le grand miroir parabolique convergent vers son foyer ; avant de l'atteindre, ils rencontrent le miroir hyperbolique, dont un foyer est ce même point : dirigés vers ce foyer, ils sont renvoyés vers l'**autre** foyer de l'hyperbole, situé derrière le miroir principal percé en son centre. Le foyer du télescope est ainsi déplacé derrière le grand miroir, et la distance focale est allongée sans allonger le tube.",
        },
        {
          kind: 'application',
          titre: "Détruire un calcul rénal sans opération grâce à l'ellipse",
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -6,
              xMax: 6,
              yMin: -5.625,
              yMax: 5.625,
              curves: [
                { fn: (x) => 4 * r(1 - (x * x) / 25), tone: 'faint', xMin: -5, xMax: 5 },
                { fn: (x) => -4 * r(1 - (x * x) / 25), tone: 'faint', xMin: -5, xMax: 5 },
              ],
              vectors: [
                { from: { x: -3, y: 0 }, to: { x: 4, y: 2.4 }, tone: 'attn' },
                { from: { x: 4, y: 2.4 }, to: { x: 3, y: 0 }, tone: 'good' },
                { from: { x: -3, y: 0 }, to: { x: 0, y: 4 }, tone: 'attn' },
                { from: { x: 0, y: 4 }, to: { x: 3, y: 0 }, tone: 'good' },
                { from: { x: -3, y: 0 }, to: { x: -2, y: 3.6661 }, tone: 'attn' },
                { from: { x: -2, y: 3.6661 }, to: { x: 3, y: 0 }, tone: 'good' },
              ],
              points: [
                { x: -3, y: 0, label: 'générateur', tone: 'attn', labelPos: 'below' },
                { x: 3, y: 0, label: 'calcul rénal', tone: 'good', labelPos: 'below' },
              ],
              caption:
                "Trois ondes de choc parties du générateur (foyer de gauche), chacune " +
                "réfléchie par la paroi elliptique vers le calcul rénal (foyer de droite). " +
                "Les trois trajets ont la même longueur, $2a=10$ : les ondes arrivent " +
                "ensemble, et toute l'énergie se concentre au même point.",
            },
          ],
          text:
            "La propriété optique de l'ellipse — tout ce qui part d'un foyer passe par " +
            "l'autre — a une application médicale directe : la **lithotritie " +
            'extracorporelle**. Le patient est positionné de façon à ce que son calcul rénal ' +
            "(un « calcul » ici au sens médical, pas mathématique) se trouve exactement au " +
            "second foyer d'un réflecteur en forme d'ellipse. Un générateur placé au premier " +
            'foyer émet de courtes ondes de choc ; comme elles partent toutes d\'un foyer, ' +
            "l'ellipse les renvoie **toutes** vers le second foyer. Mieux : la définition même " +
            "de l'ellipse dit que chaque trajet générateur → paroi → calcul mesure $2a$, quel " +
            "que soit le point de la paroi touché. Toutes les ondes arrivent donc **en même " +
            "temps** et s'additionnent, avec assez d'énergie pour fragmenter le calcul en " +
            'petits morceaux — qui seront ensuite éliminés naturellement. Le reste du corps ' +
            "du patient, traversé par des ondes individuellement peu puissantes, n'est pas " +
            "endommagé : l'énergie ne se concentre qu'au second foyer, nulle part ailleurs.",
          domaines: ['Médecine'],
          image: {
            src: '/images/application/lithotripsy.jpg',
            alt: 'Appareil de lithotritie extracorporelle par ondes de choc',
            caption:
              "Appareil de thérapie par ondes de choc extracorporelles (ESWT), utilisé entre " +
              'autres pour la lithotritie. Photo : Mattes, CC BY-SA 3.0, via Wikimedia ' +
              'Commons.',
          },
        },
        {
          kind: 'application',
          titre: 'Trouver sa position en mer grâce à des hyperboles',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -7,
              xMax: 7.5,
              yMin: -6.796875,
              yMax: 6.796875,
              curvesOfY: [
                { fn: (y) => 3 * r(1 + (y * y) / 16), tone: 'accent' },
              ],
              vectors: [
                { from: { x: -5, y: 0 }, to: { x: 3.75, y: 3 }, tone: 'attn', dashed: true },
                { from: { x: 5, y: 0 }, to: { x: 3.75, y: 3 }, tone: 'good' },
              ],
              points: [
                { x: -5, y: 0, label: 'émetteur 1', tone: 'ink', labelPos: 'below' },
                { x: 5, y: 0, label: 'émetteur 2', tone: 'ink', labelPos: 'below' },
                { x: 3.75, y: 3, label: 'N', tone: 'bad', labelPos: 'right' },
              ],
              caption:
                "Pour tout point de cette branche, la distance à l'émetteur 1 (pointillé) " +
                "moins la distance à l'émetteur 2 (plein) vaut la même constante — ici " +
                "9,25 − 3,25 = 6 pour le navire N. C'est exactement ce que mesure la différence " +
                "de temps d'arrivée : une seule paire d'émetteurs place le navire sur une " +
                "branche d'hyperbole, pas en un point.",
            },
            {
              kind: 'vectorPlane',
              xMin: -7,
              xMax: 7,
              yMin: -6.5625,
              yMax: 6.5625,
              curvesOfY: [
                { fn: (y) => 3 * r(1 + (y * y) / 16), tone: 'accent' },
              ],
              curves: [
                { fn: (x) => 3 * r(1 + (x * x) / 16), tone: 'good' },
              ],
              points: [
                { x: -5, y: 0, label: 'A₁', tone: 'ink', labelPos: 'below' },
                { x: 5, y: 0, label: 'B₁', tone: 'ink', labelPos: 'below' },
                { x: 0, y: -5, label: 'A₂', tone: 'ink', labelPos: 'right' },
                { x: 0, y: 5, label: 'B₂', tone: 'ink', labelPos: 'left' },
                { x: 12 / Math.sqrt(7), y: 12 / Math.sqrt(7), label: 'N', tone: 'bad', labelPos: 'left' },
              ],
              caption:
                "Une deuxième paire d'émetteurs (A₂, B₂, orientée autrement) place le navire " +
                "sur une seconde branche d'hyperbole (verte). Ici, les deux branches se coupent " +
                "en un seul point N ; mais deux branches peuvent aussi se couper en deux " +
                "points, et il faut alors une autre information (une troisième paire, la " +
                "position estimée) pour lever l'ambiguïté.",
            },
          ],
          text:
            "Avant le GPS, les navires et les avions se repéraient avec un système appelé " +
            'LORAN : des émetteurs radio au sol, à des positions connues et fixes, envoient ' +
            'des signaux synchronisés (une station principale, puis des stations secondaires ' +
            "avec un retard connu, que le récepteur retranche). Un récepteur à bord mesure la " +
            "différence de temps d'arrivée $\\Delta t$ des signaux de deux émetteurs. Or " +
            "l'ensemble des points où cette différence de temps (donc la différence de " +
            "distance $v\\cdot\\Delta t$ aux deux émetteurs, avec $v$ la vitesse des ondes) " +
            "reste constante est précisément une **branche d'hyperbole**, dont les deux " +
            "émetteurs sont les foyers et pour laquelle $2a=v\\cdot\\Delta t$ ! Le signe de " +
            "$\\Delta t$ dit de quel émetteur le navire est le plus proche, donc sur quelle " +
            "branche il se trouve. Une seconde paire d'émetteurs place le navire sur une " +
            "seconde branche, et l'intersection des deux donne sa position — à condition de " +
            "lever l'ambiguïté quand elles se coupent en deux points. Le GPS moderne repose " +
            'sur un principe voisin : il mesure les temps de parcours de signaux venus de ' +
            'satellites, et la position est à l\'intersection de sphères (le quatrième ' +
            "satellite sert à corriger l'horloge du récepteur).",
          domaines: ['Navigation', 'Géolocalisation'],
        },
        {
          kind: 'entrainement',
          title: 'Propriétés optiques des coniques',
          generatorId: '6gen63',
          description: [
            "Retrouve le trajet d'un rayon réfléchi par un miroir parabolique, elliptique ou hyperbolique à partir de ses foyers et de la propriété optique.",
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 63. Propriétés optiques des coniques »',
        },
        { kind: 'video', title: 'Synthèse du chapitre', youtubeId: 'nebYPmMQg38' },
      ],
    },
  ],
  formulaire: {
    groups: [
      {
        title: 'Parabole',
        formulas: [
          { text: R`$p = \text{dist}(F\,;d)$`, condition: R`$F$ = foyer, $d$ = directrice ; excentricité $e=1$` },
          { text: R`$y^2=2px$`, condition: R`foyer $F\left(\frac{p}{2}\,;0\right)$, directrice $d\equiv x=-\frac{p}{2}$, sommet à l'origine` },
          {
            text: R`$y^2=\pm2px \qquad x^2=\pm2py$`,
            condition: "le carré donne l'axe focal, le signe le sens d'ouverture",
          },
          { text: R`$(y-k)^2=2p(x-h)$`, condition: R`sommet $(h\,;k)$, foyer $\left(h+\frac{p}{2}\,;k\right)$, directrice $x=h-\frac{p}{2}$` },
        ],
      },
      {
        title: 'Ellipse',
        formulas: [
          { text: R`$|PF|+|PF'|=2a$`, condition: R`$|FF'|=2c$ ; existe ssi $a>c$` },
          {
            text: R`$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$`,
            condition: R`$b^2=a^2-c^2$ ; sommets $(\pm a\,;0)$, $(0\,;\pm b)$ ; foyers $(\pm c\,;0)$`,
          },
          { text: R`$\dfrac{y^2}{a^2}+\dfrac{x^2}{b^2}=1$`, condition: R`axe focal vertical : foyers $(0\,;\pm c)$ ; $a^2$ est toujours le plus grand dénominateur` },
          { text: R`$c=0 \implies b=a \implies x^2+y^2=a^2$`, condition: 'cercle = ellipse à foyers confondus' },
        ],
      },
      {
        title: 'Hyperbole',
        formulas: [
          { text: R`$\big||PF|-|PF'|\big|=2a$`, condition: R`$|FF'|=2c$ ; existe ssi $c>a$ ; 2 branches` },
          {
            text: R`$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$`,
            condition: R`$b^2=c^2-a^2$ ; sommets $(\pm a\,;0)$ ; foyers $(\pm c\,;0)$ ; asymptotes $y=\pm\frac{b}{a}x$`,
          },
          {
            text: R`$\dfrac{y^2}{a^2}-\dfrac{x^2}{b^2}=1$`,
            condition: R`axe focal vertical : sommets $(0\,;\pm a)$, foyers $(0\,;\pm c)$, asymptotes $y=\pm\frac{a}{b}x$`,
          },
          {
            text: R`$x^2-y^2=a^2 \iff XY=\dfrac{a^2}{2}$`,
            condition: R`hyperbole équilatère ($c=a\sqrt{2}$, asymptotes $y=\pm x$) ; à droite, dans le repère de ses asymptotes`,
          },
        ],
      },
      {
        title: 'Excentricité, foyers et directrices',
        formulas: [
          { text: R`$e = \dfrac{c}{a}$`, condition: R`ellipse $0<e<1$, hyperbole $e>1$` },
          {
            text: R`$\dfrac{\text{dist}(P\,;F)}{\text{dist}(P\,;d)} = e$`,
            condition: R`$e<1$ ellipse, $e=1$ parabole, $e>1$ hyperbole ; cercle : $e=0$, sans directrice`,
          },
          { text: R`$x=\pm\dfrac{a^2}{c}$`, condition: R`directrices d'une conique centrée d'axe focal horizontal ($y=\pm\frac{a^2}{c}$ si l'axe est vertical)` },
          { text: R`$\text{dist}(P\,;d)=\dfrac{|ux_P+vy_P+w|}{\sqrt{u^2+v^2}}$`, condition: R`directrice $d\equiv ux+vy+w=0$` },
          {
            text: R`$mx^2+ny^2+qxy+rx+sy+t=0$`,
            condition: R`équation générale ; réduction par translation seulement sans terme en $xy$ ; peut aussi décrire un point, deux droites ou le vide`,
          },
        ],
      },
      {
        title: 'Rayons focaux et aire du triangle focal',
        formulas: [
          { text: R`$|PF|=a-ex \qquad |PF'|=a+ex$`, condition: R`ellipse, $F(c\,;0)$ ; donc $a-c\leq|PF|\leq a+c$ (périhélie $a-c$, aphélie $a+c$)` },
          {
            text: R`$|PF'| = \dfrac{2a}{k+1} \qquad |PF| = \dfrac{2ak}{k+1}$`,
            condition: R`à partir du rapport $k=\frac{|PF|}{|PF'|}$`,
          },
          {
            text: R`$\cos(\widehat{FPF'}) = \dfrac{|PF|^2+|PF'|^2-4c^2}{2|PF|\,|PF'|}$`,
            condition: R`$c^2=a^2-b^2$ (loi des cosinus)`,
          },
          { text: R`$\text{aire} = \dfrac{1}{2}|PF|\,|PF'|\sin(\widehat{FPF'})=b^2\tan\dfrac{\widehat{FPF'}}{2}$` },
        ],
      },
      {
        title: 'Intersection, tangentes et réflexion',
        formulas: [
          {
            text: R`substituer la droite dans la conique`,
            condition: R`second degré : $\Delta>0$ sécante, $\Delta=0$ tangente, $\Delta<0$ extérieure ; coefficient de $x^2$ nul : un seul point, sans tangence`,
          },
          {
            text: R`$f'(x_P) = -\dfrac{b^2x_P}{a^2y_P}$`,
            condition: R`pente de la tangente à l'ellipse ; $+\frac{b^2x_P}{a^2y_P}$ pour l'hyperbole ; $\frac{p}{y_P}$ pour la parabole $y^2=2px$`,
          },
          {
            text: R`$\dfrac{xx_P}{a^2} \pm \dfrac{yy_P}{b^2} = 1$`,
            condition: 'forme dédoublée — ellipse (+), hyperbole (−)',
          },
          { text: R`$yy_P=p(x+x_P)$`, condition: R`tangente à la parabole $y^2=2px$ en $P$` },
          {
            text: R`$k^2=a^2m^2\pm b^2$`,
            condition: R`$y=mx+k$ tangente à l'ellipse (+) ou à l'hyperbole d'axe horizontal (−) ; parabole $y^2=2px$ : $k=\frac{p}{2m}$`,
          },
          {
            text: R`$PF$ et $PF'$ font des angles égaux avec la tangente en $P$`,
            condition: R`ellipse : rayon issu d'un foyer → vers l'autre ; hyperbole : il semble venir de l'autre foyer`,
          },
          { text: R`$\dfrac{D^2}{16h}$`, condition: R`distance du sommet au foyer d'une antenne parabolique de diamètre $D$ et de profondeur $h$` },
        ],
      },
    ],
  },

  recap: {
    table: {
      headers: ['Notion', 'Point clé'],
      rows: [
        ['Parabole — définition', R`lieu des points équidistants d'un point $F$ (foyer) et d'une droite $d$ (directrice), $p=\text{dist}(F\,;d)$`],
        ['Parabole — équation', R`$y^2=2px$, avec $F\left(\dfrac{p}{2}\,;0\right)$ et $d\equiv x=-\dfrac{p}{2}$ ; sommet à l'origine`],
        ['Parabole — 4 orientations', R`$y^2=\pm 2px$ (axe focal horizontal), $x^2=\pm 2py$ (axe focal vertical) — le carré donne l'axe, le signe le sens`],
        ['Ellipse — définition', R`$|PF|+|PF'|=2a$, $|FF'|=2c$, existe ssi $a>c$`],
        ['Ellipse — équation', R`$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ avec $b^2=a^2-c^2$ ; sommets $(\pm a\,;0)$, $(0\,;\pm b)$ ; foyers $(\pm c\,;0)$ ; $a^2$ = plus grand dénominateur`],
        ['Ellipse — vocabulaire', R`grand axe $2a$, petit axe $2b$, distance focale $2c$ ; 2 axes de symétrie, 1 centre, 4 sommets`],
        ['Cercle et ellipse', R`toute ellipse = cercle aplati du facteur $\dfrac{b}{a}$ ; $c=0 \implies b=a \implies x^2+y^2=a^2$`],
        ['Hyperbole — définition', R`$\big||PF|-|PF'|\big|=2a$, existe ssi $c>a$ ; 2 branches`],
        ['Hyperbole — équation', R`$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ avec $b^2=c^2-a^2$ ; sommets $(\pm a\,;0)$ ; asymptotes $y=\pm\dfrac{b}{a}x$ ; axe vertical : $\dfrac{y^2}{a^2}-\dfrac{x^2}{b^2}=1$, asymptotes $y=\pm\dfrac{a}{b}x$`],
        ['Hyperbole équilatère', R`$c=a\sqrt{2} \implies x^2-y^2=a^2$, asymptotes $y=\pm x$ ; dans le repère de ses asymptotes : $XY=\dfrac{a^2}{2}$`],
        ['Caractérisation focale', R`$\dfrac{\text{dist}(P\,;F)}{\text{dist}(P\,;d)} = e$ : $e<1$ ellipse, $e=1$ parabole, $e>1$ hyperbole ; cercle : $e=0$, sans directrice`],
        ['Excentricité et directrices', R`$e = \dfrac{c}{a}$ ; directrices d'une conique centrée : $x=\pm\dfrac{a^2}{c}$`],
        ['Dandelin-Quételet', R`foyers = contacts des 2 sphères inscrites avec le plan de section ; preuve par $|PF|+|PF'|=|PM|+|PM'|=|MM'|$`],
        ['Équation générale', R`$mx^2+ny^2+qxy+rx+sy+t=0$, $(m\,;n\,;q)\neq(0\,;0\,;0)$ — parfois un point, deux droites ou le vide`],
        ['Réduction par translation', R`possible ssi **pas** de terme en $xy$ ; compléter les carrés, puis $x'=x-x_0$, $y'=y-y_0$ ; un seul carré : $(y-k)^2=2p(x-h)$`],
        ['Cas dégénérés', R`$(x-1)^2+4(y+2)^2=0$ : un point ; $=-3$ : vide ; $(x-1)^2=4y^2$ : deux droites`],
        ['Rayons focaux', R`$|PF|=a-ex$, $|PF'|=a+ex$ ; $a-c\leq|PF|\leq a+c$ ; rapport $k$ : $|PF'|=\dfrac{2a}{k+1}$`],
        ['Aire du triangle focal', R`loi des cosinus avec $4c^2$, puis $\dfrac{1}{2}|PF|\,|PF'|\sin\theta$, ou $b^2\tan\dfrac{\theta}{2}$ ; exemple $a=5$, $b=4$, $k=2$ : $\dfrac{8\sqrt{14}}{3}$`],
        ['Excentricité par condition', R`$b=c$ ou angle droit en $B(0\,;b) \to e=\dfrac{\sqrt{2}}{2}$ ; $\dfrac{2a}{e} = k\cdot2ae \to e=\dfrac{1}{\sqrt{k}}$ ($k>1$)`],
        ['Intersection droite-conique', R`substituer : second degré → $\Delta>0$ sécante, $\Delta=0$ tangente, $\Delta<0$ extérieure ; premier degré (droite parallèle à une asymptote ou à l'axe) → un seul point, sans tangence`],
        ['Intersection de deux coniques', R`combiner les équations pour éliminer un terme, puis résoudre avec l'une d'elles ; jusqu'à 4 points`],
        ['Tangente — par la dérivée', R`choisir la branche contenant $P$, puis pente $-\dfrac{b^2x_P}{a^2y_P}$ (ellipse), $\dfrac{b^2x_P}{a^2y_P}$ (hyperbole), $\dfrac{p}{y_P}$ (parabole)`],
        ['Tangente — forme dédoublée', R`$\dfrac{xx_P}{a^2} \pm \dfrac{yy_P}{b^2} = 1$ (ellipse / hyperbole) ; $yy_P=p(x+x_P)$ (parabole) ; sommets : tangente verticale`],
        ['Condition de tangence', R`$y=mx+k$ : $k^2=a^2m^2+b^2$ (ellipse), $k^2=a^2m^2-b^2$ (hyperbole), $k=\dfrac{p}{2m}$ (parabole)`],
        ['Propriété optique — parabole', R`rayon parallèle à l'axe → réfléchi vers le foyer ; rayon issu du foyer → réfléchi parallèlement à l'axe`],
        ['Propriété optique — ellipse / hyperbole', R`$PF$ et $PF'$ font des angles égaux avec la tangente ; ellipse : rayon issu d'un foyer → vers l'autre ; hyperbole : il semble venir de l'autre`],
      ],
    },
    forward:
      "Retiens surtout ceci : un même rapport de distances — l'excentricité — engendre trois courbes distinctes selon sa valeur. C'est un bel exemple de la façon dont un seul énoncé algébrique peut recouvrir des objets géométriques très différents. Avec les propriétés optiques, c'est aussi l'aboutissement de tout le programme de géométrie analytique de la 6e.",
    entrainement: {
      kind: 'entrainement',
      title: 'Les coniques — quiz vrai/faux',
      generatorId: '6gen73',
      description: [
        'Des affirmations vrai/faux réparties par thème, qui reprennent tout le chapitre. Un seul essai par question, la justification est toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 73. Les coniques — quiz vrai/faux »',
    },
  },
}
