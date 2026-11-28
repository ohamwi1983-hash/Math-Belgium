import type { ChapterSection, FormulaireGroupe } from '../../../types'

/**
 * 5e (6h) — Nombres réels et suites, partie « Les nombres réels ».
 * Squelette posé par le coordinateur (26/11/2026) : ids, numéros, titres FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Garder le marqueur `// ⟨fin-etape …⟩` en dernière ligne de chaque `blocks`.
 *
 * Contenu (chantier A, 26/11/2026) rédigé d'après les pages jaunes (explorations 1 à 6), bleues (synthèses 1 à 6)
 * et vertes (exercices 1, 2, 11, 26) du manuel : situations et progression reprises, nombres recalculés ou
 * nouveaux (script `calculs.py` du dossier de travail 56-A). Erreurs du manuel non reprises : définition de |x|
 * (« −x si x < 0 », pas ≤ des deux côtés), 1552/896 réduit à 97/56, renvois « chapitre n » retirés.
 * Étape 3 volontairement légère (décision du professeur). Calculatrice des élèves : Casio Graph Math+.
 */
const R = String.raw

/** Rapports de termes consécutifs de Fibonacci (réduites de la fraction continue de Φ). */
const PHI = (1 + Math.sqrt(5)) / 2
const REDUITES = [1, 2, 3 / 2, 5 / 3, 8 / 5, 13 / 8, 21 / 13, 34 / 21]
/** Barre entre espaces fines insécables (U+202F) : la barre de fraction ⁄ est rendue minuscule dans la police des figures. */
const ETIQUETTES_REDUITES = ['1', '2', '3 / 2', '5 / 3', '8 / 5', '13 / 8', '21 / 13', '34 / 21']

export const sectionsReels: ChapterSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'irrationnels',
    number: 1,
    title: 'Des nombres qui ne sont pas des fractions',
    kicker: '√2 irrationnel, ensembles ℕ, ℤ, ℚ, ℝ',
    titreCourt: 'Irrationnels',
    partie: 'Les nombres réels',
    essentiel: [
      R`Un nombre est **rationnel** s'il s'écrit $\dfrac{m}{n}$ avec $m \in \mathbb{Z}$ et $n \in \mathbb{Z}_0$ ; sinon, il est **irrationnel**. $\sqrt{2}$, $\sqrt{p}$ ($p$ premier), $\sqrt[3]{7}$, $\pi$ et le nombre d'or $\Phi$ sont irrationnels.`,
      R`Pour démontrer qu'un nombre est irrationnel, on raisonne **par l'absurde** : on le suppose égal à $\dfrac{m}{n}$, on élève à la puissance voulue et on compare les exposants des facteurs premiers des deux membres.`,
      R`$\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$ : les irrationnels sont les réels qui ne sont pas rationnels.`,
    ],
    cartes: [
      { question: R`Pourquoi $m^2 = 2n^2$ n'a-t-elle aucune solution en naturels non nuls ?`, reponse: R`Dans $m^2$, l'exposant de $2$ est pair ; dans $2n^2$, il est impair. Un même nombre n'a qu'une décomposition en facteurs premiers.` },
      { question: R`Plus petit ensemble qui contient $\sqrt[3]{-27}$ ? Et $\sin 30^\circ$ ?`, reponse: R`$\sqrt[3]{-27} = -3 \in \mathbb{Z}$ ; $\sin 30^\circ = \dfrac{1}{2} \in \mathbb{Q}$.` },
      { question: R`Quelle équation le nombre d'or $\Phi$ vérifie-t-il ?`, reponse: R`$\Phi^2 - \Phi - 1 = 0$, c'est-à-dire $\Phi = 1 + \dfrac{1}{\Phi}$ ; sa solution positive est $\Phi = \dfrac{1+\sqrt{5}}{2} \approx 1{,}618$.` },
      { question: R`$m^3 = 64n^3$ a-t-elle des solutions en naturels non nuls ?`, reponse: R`Oui, une infinité : $m = 4n$, car $64 = 4^3$. Le nombre $\sqrt[3]{64} = 4$ est rationnel.` },
    ],
    blocks: [
      { kind: 'subheading', text: 'Deux segments sans commune mesure' },
      {
        kind: 'intuition',
        label: 'Pour visualiser',
        text: R`Imagine une petite baguette, toujours la même, que tu reportes bout à bout. Si elle tient exactement $n$ fois dans le côté d'un carré **et** $m$ fois dans sa diagonale, elle est une **commune mesure** des deux segments, et le rapport diagonale sur côté vaut $\dfrac{m}{n}$. Les pythagoriciens pensaient qu'une telle baguette existe toujours, quitte à la prendre minuscule. Pour le côté et la diagonale d'un carré, elle n'existe pas : aucune baguette, si petite soit-elle, ne tombe juste dans les deux.`,
      },
      {
        kind: 'para',
        text: R`Au VIᵉ siècle avant notre ère, les disciples de Pythagore pensaient que les nombres naturels suffisent à comparer deux longueurs : on trouve toujours un petit segment $c$ contenu un nombre entier de fois dans chacune. Si $c$ est contenu $n$ fois dans le côté d'un carré et $m$ fois dans sa diagonale, le rapport de la diagonale au côté est le **rapport de deux naturels** $\dfrac{m}{n}$.`,
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'vectorPlane',
          xMin: -0.3,
          xMax: 1.3,
          yMin: -0.25,
          yMax: 1.25,
          showAxes: false,
          vectors: [
            { from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, tone: 'ink', arrow: false },
            { from: { x: 1, y: 0 }, to: { x: 1, y: 1 }, tone: 'ink', arrow: false },
            { from: { x: 1, y: 1 }, to: { x: 0, y: 1 }, tone: 'ink', arrow: false },
            { from: { x: 0, y: 1 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
            { from: { x: 0, y: 0 }, to: { x: 1, y: 1 }, tone: 'accent', arrow: false },
          ],
          points: [
            { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
            { x: 1, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
            { x: 1, y: 1, label: 'C', tone: 'ink', labelPos: 'right' },
            { x: 0, y: 1, label: 'D', tone: 'ink', labelPos: 'left' },
            { x: 0.5, y: -0.1, label: 'n·c', tone: 'ink', node: false, labelPos: 'below' },
            { x: 0.52, y: 0.5, label: 'm·c', tone: 'accent', node: false, labelPos: 'right' },
          ],
          rightAngleMarkers: [{ vertex: { x: 1, y: 0 }, arm1: { x: 0, y: 0 }, arm2: { x: 1, y: 1 } }],
          caption: R`Si un segment $c$ tenait $n$ fois dans le côté $[AB]$ et $m$ fois dans la diagonale $[AC]$, le théorème de Pythagore donnerait $(mc)^2 = 2\,(nc)^2$, donc $m^2 = 2n^2$.`,
        },
      },
      {
        kind: 'para',
        text: R`Dans le triangle $ABC$ rectangle en $B$, le théorème de Pythagore donne $AC^2 = AB^2 + BC^2 = 2\,AB^2$. Avec $AB = n\,c$ et $AC = m\,c$, on obtient $m^2c^2 = 2n^2c^2$, donc $m^2 = 2n^2$. Essaie : $m = 7$ et $n = 5$ donnent $m^2 = 49$ et $2n^2 = 50$, presque ; $m = 17$ et $n = 12$ donnent $289$ et $288$, presque encore… mais jamais exactement. La démonstration suivante prouve qu'aucun couple ne marche.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — √2 n’est pas une fraction',
        blocks: [
          { kind: 'para', text: R`**Hypothèse (par l'absurde).** Supposons que $\sqrt{2} = \dfrac{m}{n}$, avec $m$ et $n$ naturels non nuls. En élevant au carré : $2 = \dfrac{m^2}{n^2}$, donc $m^2 = 2n^2$.` },
          { kind: 'para', text: R`**Le membre de gauche.** Décomposons $m$ en facteurs premiers. Dans $m^2 = m \cdot m$, chaque facteur premier apparaît deux fois plus souvent que dans $m$ : tous ses exposants sont **pairs**. En particulier, l'exposant de $2$ dans $m^2$ est pair (il vaut $0$ si $m$ est impair).` },
          { kind: 'para', text: R`**Le membre de droite.** Pour la même raison, l'exposant de $2$ dans $n^2$ est pair ; dans $2n^2$, on ajoute un facteur $2$ : l'exposant de $2$ est **impair**.` },
          { kind: 'para', text: R`**Contradiction.** Un naturel n'a qu'une seule décomposition en facteurs premiers. Le nombre $m^2 = 2n^2$ aurait un exposant de $2$ à la fois pair et impair : c'est impossible. L'hypothèse est donc fausse : $\sqrt{2}$ ne s'écrit pas sous la forme d'une fraction.` },
          { kind: 'para', text: R`**Conséquence.** Le côté et la diagonale d'un carré n'ont aucune commune mesure : on dit qu'ils sont **incommensurables**.` },
        ],
      },
      {
        kind: 'definition',
        items: [
          R`Un nombre est **rationnel** s'il peut s'écrire $\dfrac{m}{n}$, avec $m \in \mathbb{Z}$ et $n \in \mathbb{Z}_0$ (entier non nul). L'ensemble des rationnels se note $\mathbb{Q}$ (de « quotient »).`,
          R`Un nombre réel qui n'est pas rationnel est **irrationnel**. Deux segments dont le rapport des longueurs est irrationnel sont **incommensurables**.`,
        ],
      },
      {
        kind: 'historique',
        titre: 'Le secret des pythagoriciens',
        text: R`Selon la légende, c'est **Hippase de Métaponte**, un disciple de Pythagore (Vᵉ siècle avant notre ère), qui aurait découvert que le côté et la diagonale d'un carré n'ont pas de commune mesure. Pour une école qui pensait que « tout est nombre », c'est-à-dire rapport de nombres entiers, la découverte était dérangeante : d'après les récits les plus dramatiques, Hippase aurait péri en mer pour avoir divulgué ce secret. Aucun document de l'époque ne permet de vérifier ces récits. Ce qui est sûr, c'est qu'au IVᵉ siècle avant notre ère, Aristote cite une preuve par l'absurde de ce résultat, fondée sur le pair et l'impair, proche de celle que tu viens de lire. Le mot « irrationnel » traduit le latin **irrationalis** : sans « ratio », c'est-à-dire sans rapport.`,
      },
      { kind: 'subheading', text: 'Racines carrées et racines cubiques' },
      {
        kind: 'para',
        text: R`La démonstration précédente n'utilise qu'une chose : le facteur $2$ apparaît une seule fois dans $2n^2$. Elle marche donc pour tout nombre premier $p$ à la place de $2$, et même pour une racine cubique, à condition de regarder les exposants modulo $3$.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — √p est irrationnel pour tout nombre premier p',
        blocks: [
          { kind: 'para', text: R`Soit $p$ un nombre premier ($2$, $3$, $5$, $7$, $11$…). Supposons $\sqrt{p} = \dfrac{m}{n}$ avec $m$, $n$ naturels non nuls ; alors $m^2 = p\,n^2$.` },
          { kind: 'para', text: R`Dans $m^2$, l'exposant de $p$ est pair. Dans $p\,n^2$, il vaut $1$ plus un nombre pair : il est impair. La décomposition en facteurs premiers étant unique, c'est impossible. Donc $\sqrt{p}$ est irrationnel.` },
          { kind: 'para', text: R`**Exemple.** $\sqrt{7} \approx 2{,}6458$ est irrationnel : l'égalité $m^2 = 7n^2$ n'a aucune solution en naturels non nuls.` },
        ],
      },
      {
        kind: 'exemple',
        badge: 'jamais ou souvent ? quatre égalités entre naturels',
        formula: R`Pour quels couples de naturels non nuls $(m\,;n)$ les égalités suivantes sont-elles vérifiées : $m^2 = 7n^2$ ; $m^2 = 9n^2$ ; $m^3 = 2n^3$ ; $m^3 = 64n^3$ ?`,
        steps: [
          { tag: 'm² = 7n²', text: R`Jamais : l'exposant de $7$ est pair dans $m^2$, impair dans $7n^2$ (démonstration ci-dessus).` },
          { tag: 'm² = 9n²', text: R`Souvent : exactement quand $m = 3n$, car $9n^2 = (3n)^2$. Une infinité de couples, $(3\,;1)$, $(6\,;2)$… car $\sqrt{9} = 3$ est un naturel.` },
          { tag: 'm³ = 2n³', text: R`Jamais : dans un cube $m^3$, chaque exposant est un multiple de $3$ ; dans $2n^3$, l'exposant de $2$ vaut $1$ plus un multiple de $3$.` },
          { tag: 'm³ = 64n³', text: R`Souvent : exactement quand $m = 4n$, car $64n^3 = (4n)^3$ : $\sqrt[3]{64} = 4$.` },
        ],
        result: { tag: 'conclusion', text: R`$\sqrt{7}$ et $\sqrt[3]{2}$ sont irrationnels ; $\sqrt{9}$ et $\sqrt[3]{64}$ sont des naturels.` },
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — ∛7 est irrationnel',
        blocks: [
          { kind: 'para', text: R`Supposons $\sqrt[3]{7} = \dfrac{m}{n}$ avec $m$, $n$ naturels non nuls. En élevant au cube : $m^3 = 7n^3$.` },
          { kind: 'para', text: R`Dans $m^3 = m \cdot m \cdot m$, chaque exposant est le triple de celui de $m$ : l'exposant de $7$ est un **multiple de 3** ($0$, $3$, $6$…).` },
          { kind: 'para', text: R`Dans $7n^3$, l'exposant de $7$ vaut $1$ plus un multiple de $3$ ($1$, $4$, $7$…) : ce n'est **pas** un multiple de $3$.` },
          { kind: 'para', text: R`Les deux membres ont la même décomposition en facteurs premiers : contradiction. Donc $\sqrt[3]{7} \approx 1{,}913$ est irrationnel. Avec $64 = 2^6$ à la place de $7$, l'exposant de $2$ dans $64n^3$ est $6$ plus un multiple de $3$, donc un multiple de $3$ : aucune contradiction, et en effet $\sqrt[3]{64} = 4$.` },
        ],
      },
      {
        kind: 'rappel',
        label: 'À retenir — racine d’un naturel',
        items: [
          R`Pour un naturel $n$, $\sqrt{n}$ est soit un naturel (quand $n$ est un carré parfait : $1$, $4$, $9$, $16$…), soit un irrationnel. De même, $\sqrt[3]{n}$ est un naturel si $n$ est un cube parfait ($1$, $8$, $27$, $64$…), sinon un irrationnel.`,
        ],
      },
      {
        kind: 'piege',
        label: 'Juger la racine sans simplifier',
        text: R`Une racine écrite n'est pas forcément irrationnelle : $\sqrt{\dfrac{9}{4}} = \dfrac{3}{2}$, $\dfrac{\sqrt{8}}{\sqrt{2}} = \sqrt{4} = 2$, $\sqrt[3]{-27} = -3$. Simplifie toujours avant de conclure. À l'inverse, $\sqrt{8} = 2\sqrt{2}$ est irrationnel même si $8$ n'est pas premier : $8$ n'est pas un carré parfait.`,
      },
      { kind: 'subheading', text: 'Les ensembles de nombres' },
      {
        kind: 'definition',
        items: [
          R`$\mathbb{N} = \{0\,;1\,;2\,;3\,;\dots\}$ : les **naturels**, qui servent à compter. $\mathbb{Z}$ : les **entiers**, les naturels et leurs opposés.`,
          R`$\mathbb{Q}$ : les **rationnels**, quotients $\dfrac{m}{n}$ d'un entier par un entier non nul ; tout entier est rationnel ($-3 = \dfrac{-3}{1}$).`,
          R`$\mathbb{R}$ : les **réels**, qui repèrent tous les points d'une droite munie d'une origine et d'une unité. Les réels qui ne sont pas rationnels forment l'ensemble des irrationnels, $\mathbb{R} \setminus \mathbb{Q}$. On a $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$.`,
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'numberSetsNesting',
          // Positions calculées pour que chaque point ET son étiquette restent dans leur couronne, sans toucher un
          // contour ni une autre étiquette (script `ensembles.py` du dossier de travail 56-A).
          rings: [
            { rx: 176, ry: 145, label: 'ℝ' },
            { rx: 144, ry: 110, label: 'ℚ' },
            { rx: 96, ry: 70, label: 'ℤ' },
            { rx: 52, ry: 34, label: 'ℕ' },
          ],
          examplePoints: [
            { dx: 28, dy: 5, label: '0', anchor: 'start' },
            { dx: -14, dy: 20, label: '23⁵' },
            { dx: 55, dy: 41, label: '−2' },
            { dx: 22, dy: 53, label: '∛−27', anchor: 'end' },
            { dx: 22, dy: 92, label: 'sin 30°', anchor: 'end' },
            { dx: 19, dy: -79, label: '3·10⁻⁶', anchor: 'start' },
            { dx: -17, dy: 125, label: 'cos 17°', anchor: 'start' },
            { dx: 28, dy: -121, label: 'π⁄2', anchor: 'start' },
            { dx: -68, dy: -118, label: '−½·√5', anchor: 'start' },
          ],
          caption: R`Chaque nombre est placé dans le plus petit ensemble qui le contient : $23^5 = 6\,436\,343 \in \mathbb{N}$, $\sqrt[3]{-27} = -3 \in \mathbb{Z}$, $\sin 30^\circ = \dfrac{1}{2} \in \mathbb{Q}$ ; $3 \cdot 10^{-6} \in \mathbb{Q}$ ; $\cos 17^\circ$, $\dfrac{\pi}{2}$ et $-\dfrac{1}{2}\sqrt{5}$ sont irrationnels.`,
        },
      },
      {
        kind: 'exemple',
        badge: 'placer des nombres dans le plus petit ensemble qui les contient',
        formula: R`Donne le plus petit ensemble ($\mathbb{N}$, $\mathbb{Z}$, $\mathbb{Q}$ ou $\mathbb{R} \setminus \mathbb{Q}$) qui contient chacun des nombres : $\sqrt{\dfrac{9}{4}}$ ; $\dfrac{\sqrt{8}}{\sqrt{2}}$ ; $\sqrt[3]{-27}$ ; $-\dfrac{\sqrt{5}}{2}$ ; $3 \cdot 10^{-6}$ ; $1 + \sqrt{2}$.`,
        steps: [
          { tag: 'simplifier d’abord', text: R`$\sqrt{\dfrac{9}{4}} = \dfrac{3}{2} \in \mathbb{Q}$ ; $\dfrac{\sqrt{8}}{\sqrt{2}} = \sqrt{4} = 2 \in \mathbb{N}$ ; $\sqrt[3]{-27} = -3 \in \mathbb{Z}$.` },
          { tag: 'puissances de 10', text: R`$3 \cdot 10^{-6} = \dfrac{3}{1\,000\,000} \in \mathbb{Q}$ (pas un entier).` },
          { tag: 'racines irrationnelles', text: R`Si $-\dfrac{\sqrt{5}}{2}$ valait un rationnel $q$, alors $\sqrt{5} = -2q$ serait rationnel : impossible ($5$ est premier). De même, si $1 + \sqrt{2} = q$, alors $\sqrt{2} = q - 1$ serait rationnel.` },
        ],
        result: { tag: 'résultat', text: R`$\dfrac{3}{2}$ et $3 \cdot 10^{-6}$ : $\mathbb{Q}$ ; $2$ : $\mathbb{N}$ ; $-3$ : $\mathbb{Z}$ ; $-\dfrac{\sqrt{5}}{2}$ et $1 + \sqrt{2}$ : $\mathbb{R} \setminus \mathbb{Q}$.` },
      },
      {
        kind: 'application',
        titre: 'Le format A4 et la racine carrée de 2',
        text: R`Les feuilles A0, A1, A2, A3, A4… (norme ISO 216) sont construites pour qu'une feuille pliée en deux, dans le sens de la longueur, garde **la même forme** : deux A4 côte à côte forment un A3, deux A5 un A4. Si une feuille mesure $L$ sur $\ell$, sa moitié mesure $\ell$ sur $\dfrac{L}{2}$ ; même forme veut dire $\dfrac{L}{\ell} = \dfrac{\ell}{L/2}$, donc $L^2 = 2\ell^2$ et $\dfrac{L}{\ell} = \sqrt{2}$. Comme $\sqrt{2}$ est irrationnel, aucune feuille aux côtés entiers en millimètres n'a exactement ce rapport : l'A4 mesure $297$ mm sur $210$ mm, et $\dfrac{297}{210} \approx 1{,}41429$ approche $\sqrt{2} \approx 1{,}41421$ au millième près. C'est ce qui permet d'agrandir un A4 en A3 à la photocopieuse (taux $141\,\%$) sans déformer la page.`,
        domaines: ['Imprimerie', 'Normalisation'],
      },
      { kind: 'subheading', text: 'Le nombre d’or, un autre irrationnel' },
      {
        kind: 'para',
        text: R`Un **rectangle d'or** a la propriété suivante : si on lui accole un carré le long de sa longueur, le grand rectangle obtenu lui est **semblable** (même forme, en plus grand). Le rapport de sa longueur $L$ à sa largeur $\ell$ est le **nombre d'or**, noté $\Phi$ (la lettre grecque « phi »).`,
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'vectorPlane',
          xMin: -0.3,
          xMax: 2.9,
          yMin: -0.4,
          yMax: 2.6,
          showAxes: false,
          regions: [
            { polygon: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1.618 }, { x: 0, y: 1.618 }], tone: 'good' },
            { polygon: [{ x: 1, y: 0 }, { x: 2.618, y: 0 }, { x: 2.618, y: 1.618 }, { x: 1, y: 1.618 }], tone: 'accent' },
          ],
          vectors: [
            { from: { x: 0, y: 0 }, to: { x: 2.618, y: 0 }, tone: 'ink', arrow: false },
            { from: { x: 2.618, y: 0 }, to: { x: 2.618, y: 1.618 }, tone: 'ink', arrow: false },
            { from: { x: 2.618, y: 1.618 }, to: { x: 0, y: 1.618 }, tone: 'ink', arrow: false },
            { from: { x: 0, y: 1.618 }, to: { x: 0, y: 0 }, tone: 'ink', arrow: false },
            { from: { x: 1, y: 0 }, to: { x: 1, y: 1.618 }, tone: 'ink', arrow: false },
          ],
          points: [
            { x: 0.5, y: 1.618, label: 'ℓ', tone: 'good', node: false, labelPos: 'above' },
            { x: 1.81, y: 1.618, label: 'L', tone: 'accent', node: false, labelPos: 'above' },
            { x: 0, y: 0.81, label: 'L', tone: 'ink', node: false, labelPos: 'left' },
          ],
          caption: R`Le rectangle d'or (vert) mesure $L$ sur $\ell$ ; avec le carré de côté $L$ (orange), on obtient un rectangle $(L + \ell)$ sur $L$ de même forme : $\dfrac{L + \ell}{L} = \dfrac{L}{\ell} = \Phi$.`,
        },
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — Φ = 1 + 1/Φ, puis Φ² − Φ − 1 = 0',
        blocks: [
          { kind: 'para', text: R`**Même forme.** Le grand rectangle mesure $L + \ell$ sur $L$, le petit $L$ sur $\ell$ : $\dfrac{L + \ell}{L} = \dfrac{L}{\ell}$.` },
          { kind: 'para', text: R`**Avec Φ.** Le membre de droite vaut $\Phi$. Celui de gauche vaut $1 + \dfrac{\ell}{L} = 1 + \dfrac{1}{\Phi}$. Donc $\Phi = 1 + \dfrac{1}{\Phi}$.` },
          { kind: 'para', text: R`**Équation du second degré.** En multipliant par $\Phi \neq 0$ : $\Phi^2 = \Phi + 1$, c'est-à-dire $\Phi^2 - \Phi - 1 = 0$. Le discriminant vaut $\Delta = 1 + 4 = 5$ ; les solutions sont $\dfrac{1 \pm \sqrt{5}}{2}$. Un rapport de longueurs est positif : $\Phi = \dfrac{1 + \sqrt{5}}{2} \approx 1{,}618$.` },
          { kind: 'para', text: R`**Φ est irrationnel.** Si $\Phi$ valait un rationnel $q$, alors $\sqrt{5} = 2q - 1$ serait rationnel, ce qui est faux ($5$ est premier).` },
        ],
      },
      {
        kind: 'para',
        text: R`Remplaçons $\Phi$ par $1 + \dfrac{1}{\Phi}$ dans le second membre de $\Phi = 1 + \dfrac{1}{\Phi}$, puis recommençons : $\Phi = 1 + \cfrac{1}{1 + \cfrac{1}{\Phi}} = 1 + \cfrac{1}{1 + \cfrac{1}{1 + \cfrac{1}{\Phi}}}$, et ainsi de suite. On obtient une **fraction continue** qui ne s'arrête jamais. Si on l'arrête à un étage en remplaçant le dernier $\Phi$ par $1$, on obtient une **réduite**, une valeur approchée rationnelle de $\Phi$.`,
      },
      {
        kind: 'exemple',
        badge: 'calculer les réduites de la fraction continue de Φ',
        formula: R`Calcule les huit premières réduites de la fraction continue de $\Phi$, en partant de $1$ et en appliquant chaque fois $r \mapsto 1 + \dfrac{1}{r}$. Que reconnais-tu ?`,
        steps: [
          { tag: 'premières réduites', text: R`$1$ ; $1 + \dfrac{1}{1} = 2$ ; $1 + \dfrac{1}{2} = \dfrac{3}{2}$ ; $1 + \dfrac{2}{3} = \dfrac{5}{3}$.` },
          { tag: 'suivantes', text: R`$1 + \dfrac{3}{5} = \dfrac{8}{5}$ ; $1 + \dfrac{5}{8} = \dfrac{13}{8}$ ; $1 + \dfrac{8}{13} = \dfrac{21}{13}$ ; $1 + \dfrac{13}{21} = \dfrac{34}{21}$.` },
          { tag: 'reconnaître', text: R`Numérateurs et dénominateurs sont les termes de la suite de Fibonacci $1, 1, 2, 3, 5, 8, 13, 21, 34$, où chaque terme est la somme des deux précédents : $1 + \dfrac{a}{b} = \dfrac{b + a}{b}$.` },
          { tag: 'en décimal', text: R`$1{,}5$ ; $1{,}667$ ; $1{,}6$ ; $1{,}625$ ; $1{,}615$ ; $1{,}619$ : les réduites sont tour à tour inférieures et supérieures à $\Phi \approx 1{,}618$.` },
        ],
        result: { tag: 'résultat', text: R`$1$ ; $2$ ; $\dfrac{3}{2}$ ; $\dfrac{5}{3}$ ; $\dfrac{8}{5}$ ; $\dfrac{13}{8}$ ; $\dfrac{21}{13}$ ; $\dfrac{34}{21}$ : les rapports de deux termes consécutifs de Fibonacci.` },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [],
          xMin: 0,
          xMax: 8.6,
          xTicks: [1, 2, 3, 4, 5, 6, 7, 8],
          yTicks: [1, 1.5, 2],
          fixedYRange: { min: 0.8, max: 2.2 },
          horizontalAsymptotes: [{ y: PHI, label: 'Φ' }],
          points: REDUITES.map((v, i) => ({
            x: i + 1,
            y: v,
            label: ETIQUETTES_REDUITES[i],
            tone: v > PHI ? ('bad' as const) : ('good' as const),
            labelPos: v > PHI ? ('above' as const) : ('below' as const),
          })),
          xAxisLabel: 'n',
          yAxisLabel: 'réduite',
          caption: R`Les huit premières réduites : en vert sous $\Phi$, en rouge au-dessus. Elles se rapprochent de $\Phi$ en l'encadrant de plus en plus étroitement (voir les intervalles emboîtés du point 3 et la limite du point 9).`,
        },
      },
      {
        kind: 'atelier',
        tag: 'angle-d-or-widget',
        label: 'Manipule toi-même — l’angle d’or du tournesol',
        caption:
          'Fais varier l’angle entre deux graines successives. Avec une fraction simple de tour (90°, 120°, 144°), les graines s’alignent en rayons et laissent des vides ; avec l’angle d’or (≈ 137,5°, soit un tour divisé par Φ²), elles remplissent tout le disque, justement parce que Φ est irrationnel : aucune graine ne retombe jamais exactement dans la direction d’une autre.',
      },
      {
        kind: 'entrainement',
        title: 'Rationnel ou irrationnel ?',
        generatorId: '56gen14',
        description: ['Place des nombres (racines, fractions, π, cos 60°, Φ, écritures périodiques…) dans le plus petit ensemble qui les contient, ℕ, ℤ, ℚ ou les irrationnels, après les avoir simplifiés.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 14. Rationnel ou irrationnel ? »',
      },
      {
        kind: 'entrainement',
        title: 'Démontrer qu’un nombre est irrationnel',
        generatorId: '56gen15',
        description: ['Démonstration guidée par l’absurde, écran par écran : supposer √n ou ∛n égal à m⁄n, élever, comparer les exposants des facteurs premiers et conclure — ou reconnaître un carré parfait.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 15. Démontrer qu’un nombre est irrationnel »',
      },
      // ⟨fin-etape irrationnels⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'ecritures-decimales',
    number: 2,
    title: 'Écritures décimales des rationnels et des irrationnels',
    kicker: 'limitée, périodique ou illimitée non périodique',
    titreCourt: 'Écritures décimales',
    partie: 'Les nombres réels',
    essentiel: [
      R`Un réel est rationnel si et seulement si son écriture décimale est **limitée** ou **illimitée périodique** ; un irrationnel a une écriture décimale **illimitée non périodique**.`,
      R`Dans la division de $m$ par $n$, les restes sont compris entre $0$ et $n - 1$ : un reste revient forcément, et la période a au plus $n - 1$ chiffres.`,
      R`Une fraction irréductible a une écriture décimale limitée si et seulement si son dénominateur ne contient que les facteurs premiers $2$ et $5$.`,
    ],
    cartes: [
      { question: R`Écris $0{,}\overline{12}$ sous forme de fraction irréductible.`, reponse: R`Avec $x = 0{,}\overline{12}$ : $100x - x = 12$, donc $x = \dfrac{12}{99} = \dfrac{4}{33}$.` },
      { question: R`Pourquoi la période de $\dfrac{a}{7}$ a-t-elle au plus $6$ chiffres ?`, reponse: R`Les restes possibles sont $1$, $2$, …, $6$ (un reste nul arrête la division) : après au plus $6$ étapes, un reste revient et les chiffres se répètent.` },
      { question: R`$7{,}07999\ldots$ et $7{,}08$ sont-ils deux nombres différents ?`, reponse: R`Non : $1000x - 100x = 7079{,}99\ldots - 707{,}99\ldots = 6372$, donc $x = \dfrac{6372}{900} = 7{,}08$.` },
      { question: R`$\dfrac{7}{12}$ a-t-il une écriture décimale limitée ?`, reponse: R`Non : $12 = 2^2 \cdot 3$ contient le facteur $3$ ; $\dfrac{7}{12} = 0{,}58\overline{3}$.` },
    ],
    blocks: [
      { kind: 'subheading', text: 'De la fraction à l’écriture décimale' },
      {
        kind: 'para',
        text: R`Pour écrire $\dfrac{m}{n}$ en décimal, on pose la division de $m$ par $n$. À chaque étape, on multiplie le reste par $10$ et on le divise par $n$ : on obtient un chiffre et un **nouveau reste**, toujours compris entre $0$ et $n - 1$. On note la partie qui se répète avec une barre : $\dfrac{1}{3} = 0{,}333\ldots = 0{,}\overline{3}$.`,
      },
      {
        kind: 'exemple',
        badge: 'prévoir le centième chiffre après la virgule',
        formula: R`Quel est le centième chiffre après la virgule de l'écriture décimale de $\dfrac{2617}{7}$ ?`,
        steps: [
          { tag: 'partie entière', text: R`$2617 = 7 \times 373 + 6$, donc $\dfrac{2617}{7} = 373 + \dfrac{6}{7}$.` },
          { tag: 'restes successifs', text: R`Pour $\dfrac{6}{7}$ : $60 = 7 \times 8 + 4$, $40 = 7 \times 5 + 5$, $50 = 7 \times 7 + 1$, $10 = 7 \times 1 + 3$, $30 = 7 \times 4 + 2$, $20 = 7 \times 2 + 6$. Le reste $6$ revient : les chiffres $857142$ se répètent.` },
          { tag: 'écriture', text: R`$\dfrac{2617}{7} = 373{,}\overline{857142}$, période de $6$ chiffres.` },
          { tag: 'centième chiffre', text: R`$100 = 6 \times 16 + 4$ : après $16$ périodes complètes, le centième chiffre est le quatrième chiffre de la période $857142$.` },
        ],
        result: { tag: 'résultat', text: R`Le centième chiffre après la virgule est $1$.` },
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — repérer la période grâce aux restes',
        blocks: [
          { kind: 'para', text: R`Écris $\dfrac{17}{70}$ en décimal et donne sa période.` },
          {
            kind: 'featureTable',
            headers: ['Reste × 10', 'Division par 70', 'Chiffre', 'Nouveau reste'],
            rows: [
              ['$170$', R`$70 \times 2 + 30$`, '$2$', '$30$'],
              ['$300$', R`$70 \times 4 + 20$`, '$4$', '$20$'],
              ['$200$', R`$70 \times 2 + 60$`, '$2$', '$60$'],
              ['$600$', R`$70 \times 8 + 40$`, '$8$', '$40$'],
              ['$400$', R`$70 \times 5 + 50$`, '$5$', '$50$'],
              ['$500$', R`$70 \times 7 + 10$`, '$7$', '$10$'],
              ['$100$', R`$70 \times 1 + 30$`, '$1$', { text: '$30$ (déjà vu)', tone: 'bad' }],
            ],
          },
          { kind: 'para', text: R`Le reste $30$ revient : à partir de là, les chiffres $428571$ se répètent. Donc $\dfrac{17}{70} = 0{,}2\overline{428571}$ : un chiffre avant la période, puis une période de $6$ chiffres, bien moins que les $69$ chiffres permis par les $69$ restes non nuls possibles.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — l’écriture décimale d’un rationnel est limitée ou périodique',
        blocks: [
          { kind: 'para', text: R`Soit $\dfrac{m}{n}$ avec $m \in \mathbb{N}$ et $n \in \mathbb{N}_0$ (pour un rationnel négatif, on raisonne sur son opposé). Dans la division de $m$ par $n$, chaque reste est un naturel compris entre $0$ et $n - 1$.` },
          { kind: 'para', text: R`**Cas 1.** Si un reste vaut $0$, la division s'arrête : l'écriture décimale est **limitée**.` },
          { kind: 'para', text: R`**Cas 2.** Sinon, tous les restes sont parmi les $n - 1$ valeurs $1$, $2$, …, $n - 1$. Après au plus $n - 1$ étapes, un reste déjà rencontré revient. Or le chiffre suivant et le reste suivant ne dépendent que du reste actuel : à partir de ce moment, les mêmes calculs se répètent dans le même ordre. L'écriture est **illimitée périodique**, avec une période d'au plus $n - 1$ chiffres.` },
        ],
      },
      { kind: 'subheading', text: 'De l’écriture décimale à la fraction' },
      {
        kind: 'exemple',
        badge: 'écriture périodique → fraction irréductible',
        formula: R`Écris $x = 2{,}1\overline{36}$ sous forme de fraction irréductible.`,
        steps: [
          { tag: 'décaler la virgule', text: R`Un chiffre avant la période, deux chiffres dans la période : $10x = 21{,}\overline{36}$ et $1000x = 2136{,}\overline{36}$.` },
          { tag: 'soustraire', text: R`Les deux nombres ont les mêmes décimales : $1000x - 10x = 2136 - 21$, donc $990x = 2115$.` },
          { tag: 'simplifier', text: R`$x = \dfrac{2115}{990} = \dfrac{47}{22}$ (on divise par $45$).` },
          { tag: 'vérifier', text: R`À la calculatrice, $47 \div 22 = 2{,}13636\ldots$` },
        ],
        result: { tag: 'résultat', text: R`$2{,}1\overline{36} = \dfrac{47}{22}$` },
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — une écriture limitée ou périodique est celle d’un rationnel',
        blocks: [
          { kind: 'para', text: R`**Écriture limitée.** Si $x$ a $k$ décimales, $10^k x$ est un entier $N$, et $x = \dfrac{N}{10^k}$ est rationnel.` },
          { kind: 'para', text: R`**Écriture périodique.** Supposons que $x$ ait $k$ chiffres après la virgule avant la période, et une période de $p$ chiffres. Alors $10^{k+p}x$ et $10^k x$ ont exactement les mêmes décimales (la période juste après la virgule).` },
          { kind: 'para', text: R`Leur différence $10^{k+p}x - 10^k x = 10^k(10^p - 1)\,x$ est donc un entier $N$, et $x = \dfrac{N}{10^k(10^p - 1)}$ est rationnel.` },
          { kind: 'para', text: R`**Conclusion.** Avec la démonstration précédente : un réel est rationnel si et seulement si son écriture décimale est limitée ou illimitée périodique.` },
        ],
      },
      {
        kind: 'exemple',
        badge: 'montrer que 7,0799999… = 7,08',
        formula: R`Montre que $x = 7{,}07\overline{9} = 7{,}0799999\ldots$ est égal à $7{,}08$.`,
        steps: [
          { tag: 'décaler la virgule', text: R`$100x = 707{,}999\ldots$ et $1000x = 7079{,}999\ldots$ ont les mêmes décimales.` },
          { tag: 'soustraire', text: R`$1000x - 100x = 7079 - 707$, donc $900x = 6372$.` },
          { tag: 'conclure', text: R`$x = \dfrac{6372}{900} = \dfrac{177}{25} = 7{,}08$.` },
        ],
        result: { tag: 'résultat', text: R`$7{,}07\overline{9} = 7{,}08$ : ce sont deux écritures du même nombre.` },
      },
      {
        kind: 'attention',
        label: 'Un même nombre, deux écritures',
        text: R`Un nombre décimal limité non nul a toujours une seconde écriture, qui se termine par des $9$ : $7{,}08 = 7{,}07\overline{9}$ et $1 = 0{,}\overline{9}$. Entre $7{,}07999\ldots$ et $7{,}08$, il n'y a donc **aucun** nombre : ce sont le même point de la droite. Le point 10 retrouvera $0{,}\overline{9} = 1$ comme une somme infinie $0{,}9 + 0{,}09 + 0{,}009 + \ldots$`,
      },
      { kind: 'subheading', text: 'Limitée ou périodique ? Le dénominateur décide' },
      {
        kind: 'rappel',
        label: 'Critère du dénominateur',
        items: [
          R`Une fraction **irréductible** $\dfrac{m}{n}$ a une écriture décimale limitée si et seulement si $n$ ne contient que les facteurs premiers $2$ et $5$ : $n = 2^a \cdot 5^b$. Sinon, son écriture est illimitée périodique.`,
          R`**Pourquoi ?** $\dfrac{m}{n}$ limitée à $k$ décimales s'écrit $\dfrac{N}{10^k} = \dfrac{N}{2^k \cdot 5^k}$ : après simplification, il ne reste que des $2$ et des $5$ au dénominateur. Inversement, si $n = 2^a \cdot 5^b$, on complète par des $2$ ou des $5$ pour obtenir une puissance de $10$ : $\dfrac{3}{40} = \dfrac{3}{2^3 \cdot 5} = \dfrac{3 \cdot 25}{2^3 \cdot 5^3} = \dfrac{75}{1000}$.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'limitée ou périodique, sans poser la division',
        formula: R`Sans poser la division, dis si l'écriture décimale est limitée ou périodique, puis vérifie : $\dfrac{3}{40}$ ; $\dfrac{9}{250}$ ; $\dfrac{7}{12}$ ; $\dfrac{11}{24}$ ; $\dfrac{5}{13}$.`,
        steps: [
          { tag: 'facteurs 2 et 5 seulement', text: R`$40 = 2^3 \cdot 5$ et $250 = 2 \cdot 5^3$ : limitées. $\dfrac{3}{40} = 0{,}075$ et $\dfrac{9}{250} = 0{,}036$.` },
          { tag: 'un facteur 3', text: R`$12 = 2^2 \cdot 3$ et $24 = 2^3 \cdot 3$ : périodiques. $\dfrac{7}{12} = 0{,}58\overline{3}$ et $\dfrac{11}{24} = 0{,}458\overline{3}$.` },
          { tag: 'un facteur 13', text: R`$13$ est premier, différent de $2$ et $5$ : périodique, $\dfrac{5}{13} = 0{,}\overline{384615}$ (période de $6$ chiffres, au plus $12$).` },
        ],
        result: { tag: 'résultat', text: R`Limitées : $\dfrac{3}{40}$ et $\dfrac{9}{250}$. Périodiques : $\dfrac{7}{12}$, $\dfrac{11}{24}$ et $\dfrac{5}{13}$.` },
      },
      {
        kind: 'piege',
        label: 'Simplifier avant d’appliquer le critère',
        text: R`Le critère ne vaut que pour une fraction **irréductible** : $\dfrac{21}{60}$ a un facteur $3$ au dénominateur, et pourtant $\dfrac{21}{60} = \dfrac{7}{20} = 0{,}35$ est limitée, car le $3$ se simplifie.`,
      },
      { kind: 'subheading', text: 'Les irrationnels : une écriture illimitée non périodique' },
      {
        kind: 'para',
        text: R`Un irrationnel n'a donc ni écriture limitée, ni période : $\pi = 3{,}14159265\ldots$ ; $\sqrt{2} = 1{,}41421356\ldots$ ; $\sqrt[5]{-4} = -1{,}31950791\ldots$ Une calculatrice n'en affiche qu'une **valeur approchée** : $3{,}14$ ou $\dfrac{22}{7} = 3{,}\overline{142857}$ sont des rationnels proches de $\pi$, pas $\pi$.`,
      },
      {
        kind: 'piege',
        label: 'Une régularité n’est pas une période',
        text: R`$0{,}1010010001000010\ldots$ (un $1$, puis un $0$ de plus à chaque fois) suit une règle simple, mais aucun bloc de chiffres ne se répète à l'identique : ce nombre est irrationnel. À l'inverse, un affichage de calculatrice comme $0{,}1428571429$ ne prouve rien à lui seul : seul un calcul exact (les restes, ou une fraction) établit une période.`,
      },
      {
        kind: 'historique',
        titre: 'Un Brugeois invente l’écriture décimale',
        text: R`Jusqu'à la fin du XVIᵉ siècle, en Europe, on calcule avec des fractions ordinaires ou des fractions de base $60$ héritées des astronomes. En 1585, **Simon Stevin**, né à Bruges en 1548, publie un petit livre en néerlandais, **De Thiende** (« Le dixième »), traduit la même année en français sous le titre **La Disme**. Il y montre comment écrire et calculer avec des « nombres à virgule » : dixièmes, centièmes, millièmes, avec les mêmes règles que pour les entiers. Sa notation était lourde (il entourait le rang de chaque chiffre), mais l'idée a conquis toute l'Europe ; il plaidait même pour des poids, des mesures et des monnaies décimaux, deux siècles avant le système métrique.`,
      },
      {
        kind: 'application',
        titre: 'Pourquoi un ordinateur trouve 0,1 + 0,2 ≠ 0,3',
        text: R`Un ordinateur écrit les nombres en base $2$ et garde un nombre fixé de chiffres. Le critère du dénominateur marche dans toutes les bases : en base $2$, une fraction irréductible a une écriture limitée si et seulement si son dénominateur est une puissance de $2$. Or $0{,}1 = \dfrac{1}{10} = \dfrac{1}{2 \cdot 5}$ : son écriture en base $2$ est **périodique**, $0{,}0\overline{0011}$. L'ordinateur la coupe, donc il ne stocke qu'une valeur approchée de $0{,}1$, de même pour $0{,}2$, et la somme des deux approximations n'est pas exactement l'approximation de $0{,}3$. Beaucoup de langages de programmation affichent ainsi $0{,}1 + 0{,}2 = 0{,}30000000000000004$. Les logiciels de banque, eux, comptent en centimes entiers pour éviter ces écarts.`,
        domaines: ['Informatique'],
      },
      {
        kind: 'entrainement',
        title: 'Écriture décimale et fraction',
        generatorId: '56gen16',
        description: ['Écris une fraction en décimal et trouve la longueur de sa période, transforme une écriture périodique en fraction irréductible (comme 2,1(36) ou 7,0799…), et prévois si l’écriture est limitée ou périodique d’après le dénominateur.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 16. Écriture décimale et fraction »',
      },
      // ⟨fin-etape ecritures-decimales⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'axiomes',
    number: 3,
    title: 'Les axiomes des nombres réels',
    kicker: 'quantificateurs, axiomes, Archimède, intervalles emboîtés',
    titreCourt: 'Axiomes de ℝ',
    partie: 'Les nombres réels',
    essentiel: [
      R`Un **axiome** est un énoncé admis sans démonstration ; à partir des axiomes de $\mathbb{R}$ (addition, multiplication, ordre), on démontre toutes les règles de calcul.`,
      R`$\forall$ se lit « pour tout », $\exists$ « il existe » ; l'ordre des quantificateurs change le sens : « $\forall x\ \exists y : y > x$ » est vrai, « $\exists y\ \forall x : y > x$ » est faux.`,
      R`Axiome des intervalles emboîtés : des intervalles fermés emboîtés $[a_n\,;b_n]$ ont toujours au moins un réel commun. C'est lui qui « bouche les trous » de $\mathbb{Q}$, comme celui où se trouve $\Phi$.`,
    ],
    cartes: [
      { question: R`« $\exists y \in \mathbb{R}\ \forall x \in \mathbb{R} : y > x$ » est-il vrai ?`, reponse: R`Faux : un tel $y$ devrait être plus grand que lui-même (prends $x = y$).` },
      { question: R`Comment définit-on $x - y$ à partir des axiomes ?`, reponse: R`$x - y = x + (-y)$ : la somme de $x$ et de l'opposé de $y$.` },
      { question: R`Que dit l'axiome d'Archimède ?`, reponse: R`Pour tous réels $a > 0$ et $b$, il existe un naturel $n$ tel que $n\,a > b$ : en reportant assez de fois $a$, on dépasse $b$.` },
      { question: R`Quelle est la négation de « tout réel a un carré strictement positif » ?`, reponse: R`« Il existe un réel dont le carré n'est pas strictement positif » : c'est vrai, avec $x = 0$.` },
    ],
    blocks: [
      { kind: 'subheading', text: 'Qu’est-ce qu’un axiome ?' },
      {
        kind: 'para',
        text: R`Un **axiome** (du grec **axiôma**, « ce qui est jugé digne, évident ») est un énoncé qu'on admet sans le démontrer. Pour les mathématiciens grecs, c'était une vérité évidente ; aujourd'hui, c'est un **point de départ** choisi : on ne démontre pas les axiomes d'une théorie, on s'en sert pour démontrer tout le reste. L'ensemble des axiomes d'une théorie est son **axiomatique**.`,
      },
      {
        kind: 'para',
        text: R`Les années précédentes, tu as utilisé beaucoup de règles de calcul en les admettant ou en les vérifiant sur des exemples. Ce point montre de quels axiomes elles découlent toutes. Tu n'as pas à les mémoriser par cœur : elles servent de référence, pour savoir **quelle règle** justifie un calcul.`,
      },
      { kind: 'subheading', text: 'Les quantificateurs' },
      {
        kind: 'definition',
        items: [
          R`$\forall$ se lit « pour tout » (quantificateur **universel**) ; $\exists$ se lit « il existe », au sens de « il existe au moins un » (quantificateur **existentiel**).`,
          R`Le symbole $\mid$ se lit « tel que » : $\{x \in \mathbb{R} \mid x^2 = 2\} = \{-\sqrt{2}\,;\sqrt{2}\}$.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'l’ordre des quantificateurs change le sens',
        formula: R`Dis si chaque énoncé est vrai ou faux, et justifie : (1) $\forall x \in \mathbb{R}\ \exists y \in \mathbb{R} : y > x$ ; (2) $\exists y \in \mathbb{R}\ \forall x \in \mathbb{R} : y > x$.`,
        steps: [
          { tag: 'lire (1)', text: R`« Pour chaque réel $x$, on peut trouver un réel $y$ plus grand. » Le $y$ peut dépendre de $x$ : $y = x + 1$ convient toujours.` },
          { tag: 'lire (2)', text: R`« Il existe un réel $y$, le même pour tous, plus grand que tous les réels $x$. » Si un tel $y$ existait, il serait plus grand que lui-même en prenant $x = y$ : impossible.` },
        ],
        result: { tag: 'résultat', text: R`(1) est vrai, (2) est faux : seul l'ordre des quantificateurs a changé.` },
      },
      {
        kind: 'piege',
        label: 'Nier un énoncé quantifié',
        text: R`La négation de « $\forall x$, $P(x)$ » est « $\exists x$, non $P(x)$ » : pour montrer qu'un énoncé universel est faux, **un seul contre-exemple** suffit. La négation de « $\exists x$, $P(x)$ » est « $\forall x$, non $P(x)$ ». Ainsi, « $\forall x \in \mathbb{R} : x^2 > 0$ » est faux, car $0^2 = 0$ ; mais « $\exists x \in \mathbb{R} : x^2 < 0$ » est faux aussi, car tout carré est positif.`,
      },
      { kind: 'subheading', text: 'Les axiomes de ℝ' },
      {
        kind: 'para',
        text: R`Les réels forment un ensemble $\mathbb{R}$ muni de deux opérations, l'**addition** (à tout couple $(x\,;y)$ correspond un réel $x + y$) et la **multiplication** (un réel $x \cdot y$), et d'une relation d'**ordre** $\leq$. Ils vérifient les axiomes suivants.`,
      },
      {
        kind: 'featureTable',
        caption: 'Axiomes de l’addition',
        headers: ['', 'Énoncé', 'Nom'],
        rows: [
          ['(1)', R`$\forall x, y, z \in \mathbb{R} : x + (y + z) = (x + y) + z$`, 'associativité'],
          ['(2)', R`$\exists e \in \mathbb{R}\ \forall x \in \mathbb{R} : e + x = x = x + e$`, R`neutre, noté $0$`],
          ['(3)', R`$\forall x \in \mathbb{R}\ \exists y \in \mathbb{R} : y + x = 0 = x + y$`, R`symétrique : l'opposé $-x$`],
          ['(4)', R`$\forall x, y \in \mathbb{R} : x + y = y + x$`, 'commutativité'],
        ],
      },
      {
        kind: 'featureTable',
        caption: 'Axiomes de la multiplication',
        headers: ['', 'Énoncé', 'Nom'],
        rows: [
          ['(1)', R`$\forall x, y, z \in \mathbb{R} : x \cdot (y \cdot z) = (x \cdot y) \cdot z$`, 'associativité'],
          ['(2)', R`$\exists e' \in \mathbb{R}_0\ \forall x \in \mathbb{R} : e' \cdot x = x = x \cdot e'$`, R`neutre, noté $1$`],
          ['(3)', R`$\forall x \in \mathbb{R}_0\ \exists y \in \mathbb{R}_0 : y \cdot x = 1 = x \cdot y$`, R`symétrique : l'inverse $\dfrac{1}{x}$`],
          ['(4)', R`$\forall x, y \in \mathbb{R} : x \cdot y = y \cdot x$`, 'commutativité'],
          ['(5)', R`$\forall x, y, z \in \mathbb{R} : x \cdot (y + z) = x \cdot y + x \cdot z$`, 'distributivité'],
        ],
      },
      {
        kind: 'featureTable',
        caption: 'Axiomes de la relation d’ordre ≤',
        headers: ['', 'Énoncé', 'Nom'],
        rows: [
          ['(1)', R`$\forall x \in \mathbb{R} : x \leq x$`, 'réflexivité'],
          ['(2)', R`$\forall x, y, z \in \mathbb{R}$ : si $x \leq y$ et $y \leq z$, alors $x \leq z$`, 'transitivité'],
          ['(3)', R`$\forall x, y \in \mathbb{R}$ : si $x \leq y$ et $y \leq x$, alors $x = y$`, 'antisymétrie'],
          ['(4)', R`$\forall x, y \in \mathbb{R}$ : $x \leq y$ ou $y \leq x$`, 'ordre total'],
          ['(5)', R`$\forall x, y, z \in \mathbb{R} : x \leq y \Rightarrow x + z \leq y + z$`, 'compatible avec l’addition'],
          ['(6)', R`$\forall x, y, z \in \mathbb{R}$ : si $x \leq y$ et $0 \leq z$, alors $x \cdot z \leq y \cdot z$`, 'compatible avec la multiplication par un positif'],
        ],
      },
      {
        kind: 'definition',
        label: 'Définitions à partir des axiomes',
        items: [
          R`**Soustraction** : $\forall x, y \in \mathbb{R} : x - y = x + (-y)$, la somme de $x$ et de l'opposé de $y$.`,
          R`**Division** : $\forall x \in \mathbb{R}\ \forall y \in \mathbb{R}_0 : \dfrac{x}{y} = x \cdot \dfrac{1}{y}$, le produit de $x$ par l'inverse de $y$.`,
          R`**Inégalité stricte** : $x < y$ si et seulement si $x \leq y$ et $x \neq y$.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — a · 0 = 0, à partir des axiomes',
        blocks: [
          { kind: 'para', text: R`Soit $a$ un réel. On veut prouver $a \cdot 0 = 0$ en n'utilisant que les axiomes.` },
          { kind: 'para', text: R`**1.** $0$ est neutre pour l'addition, donc $0 + 0 = 0$, et $a \cdot 0 = a \cdot (0 + 0)$.` },
          { kind: 'para', text: R`**2.** Par distributivité, $a \cdot (0 + 0) = a \cdot 0 + a \cdot 0$. Donc $a \cdot 0 = a \cdot 0 + a \cdot 0$.` },
          { kind: 'para', text: R`**3.** Ajoutons l'opposé $-(a \cdot 0)$ aux deux membres. À gauche, on obtient $0$ (symétrique). À droite, on regroupe autrement (associativité) : $a \cdot 0 + \big(a \cdot 0 + (-(a \cdot 0))\big)$, c'est-à-dire $a \cdot 0 + 0$ (symétrique), donc $a \cdot 0$ (neutre).` },
          { kind: 'para', text: R`**Conclusion.** $0 = a \cdot 0$ : un produit dont un facteur est nul est nul. Cette règle « évidente » est bien une conséquence des axiomes.` },
        ],
      },
      { kind: 'subheading', text: 'Archimède et les intervalles emboîtés' },
      {
        kind: 'para',
        text: R`Les axiomes précédents sont vérifiés aussi par les rationnels : ils ne disent pas en quoi $\mathbb{R}$ est plus grand que $\mathbb{Q}$. Il faut deux axiomes de plus.`,
      },
      {
        kind: 'definition',
        label: 'Axiome d’Archimède',
        items: [
          R`$\forall a \in \mathbb{R}_0^+\ \forall b \in \mathbb{R}\ \exists n \in \mathbb{N} : n\,a > b$. En reportant un segment $a$ assez de fois, on finit par dépasser n'importe quel segment $b$, si grand soit-il.`,
        ],
      },
      {
        kind: 'para',
        text: R`Euclide l'énonce déjà dans ses **Éléments** (livre V, vers 300 avant notre ère) : « des grandeurs sont dites avoir un rapport entre elles quand elles peuvent, étant multipliées, se dépasser mutuellement ». Cet axiome permet de comparer des grandeurs incommensurables et fonde la **méthode d'exhaustion** d'Eudoxe, qu'Archimède utilise pour encadrer $\pi$ entre deux nombres qui ne diffèrent que d'environ $0{,}002$. En 1899, **David Hilbert** le reprend dans ses **Fondements de la géométrie** sous le nom d'axiome du continu : en reportant sur une droite un segment $[AA_1]$, on obtient des points $A_1, A_2, A_3, \ldots$, et après un nombre fini de reports on dépasse n'importe quel point $B$ de la demi-droite.`,
      },
      {
        kind: 'definition',
        label: 'Axiome des intervalles emboîtés (Cantor)',
        items: [
          R`Si $[a_1\,;b_1] \supset [a_2\,;b_2] \supset [a_3\,;b_3] \supset \ldots$ sont des intervalles fermés emboîtés, c'est-à-dire si $\forall n \in \mathbb{N}_0 : a_n \leq a_{n+1} \leq b_{n+1} \leq b_n$, alors il existe au moins un réel $x$ qui appartient à tous ces intervalles : $\exists x \in \mathbb{R}\ \forall n \in \mathbb{N}_0 : a_n \leq x \leq b_n$.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'encadrer Φ par des intervalles emboîtés',
        formula: R`Les réduites $1$ ; $2$ ; $\dfrac{3}{2}$ ; $\dfrac{5}{3}$ ; $\dfrac{8}{5}$ ; $\dfrac{13}{8}$ ; $\dfrac{21}{13}$ ; $\dfrac{34}{21}$ de la fraction continue de $\Phi$ (point 1) sont tour à tour inférieures et supérieures à $\Phi$. Écris les intervalles qu'elles forment deux à deux et leurs longueurs.`,
        steps: [
          { tag: 'intervalles', text: R`$[1\,;2] \supset \left[\dfrac{3}{2}\,;\dfrac{5}{3}\right]$ $\supset \left[\dfrac{8}{5}\,;\dfrac{13}{8}\right]$ $\supset \left[\dfrac{21}{13}\,;\dfrac{34}{21}\right]$` },
          { tag: 'en décimal', text: R`$[1\,;2] \supset [1{,}5\,;1{,}667]$ $\supset [1{,}6\,;1{,}625]$ $\supset [1{,}6154\,;1{,}6190]$` },
          { tag: 'longueurs', text: R`$1$ ; $\dfrac{5}{3} - \dfrac{3}{2} = \dfrac{1}{6}$ ; $\dfrac{13}{8} - \dfrac{8}{5} = \dfrac{1}{40}$ ; $\dfrac{34}{21} - \dfrac{21}{13} = \dfrac{442 - 441}{273} = \dfrac{1}{273}$` },
        ],
        result: { tag: 'conclusion', text: R`Les intervalles sont emboîtés et de plus en plus courts ; $\Phi \approx 1{,}6180$ appartient à chacun d'eux.` },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'intervalComparison',
          min: 0.95,
          max: 2.05,
          ticks: [1, 2],
          rows: [
            { ranges: [{ from: 1, to: 2, tone: 'accent', label: '[1 ; 2]' }], overlapAt: PHI },
            { ranges: [{ from: 1.5, to: 5 / 3, tone: 'accent', label: '[3 / 2 ; 5 / 3]' }], overlapAt: PHI },
            { ranges: [{ from: 1.6, to: 1.625, tone: 'accent', label: '[8 / 5 ; 13 / 8]' }], overlapAt: PHI },
            { ranges: [{ from: 21 / 13, to: 34 / 21, tone: 'accent', label: '[21 / 13 ; 34 / 21]' }], overlapAt: PHI },
          ],
          caption: R`Quatre intervalles emboîtés de plus en plus courts ; le rond marque $\Phi \approx 1{,}618$, qui est dans chacun d'eux.`,
        },
      },
      {
        kind: 'para',
        text: R`Si on ne connaissait que les rationnels, aucun nombre ne serait commun à **tous** les intervalles formés par les réduites, en continuant la liste sans fin : le seul point commun, $\Phi$, est irrationnel. Il y aurait un « trou » dans la droite. L'axiome des intervalles emboîtés affirme que $\mathbb{R}$ n'a pas de tels trous. En 1872, **Richard Dedekind** donne une autre façon de le dire : chaque réel coupe l'ensemble des rationnels en deux classes, ceux qui sont « avant » et ceux qui sont « après » ; il définit les réels comme ces **coupures**. C'est ce qui permet d'associer à chaque point d'une droite graduée un réel, et à chaque réel un point.`,
      },
      {
        kind: 'historique',
        titre: 'Deux mille ans pour définir les réels',
        text: R`Les Grecs savaient raisonner sur des grandeurs incommensurables : la théorie des proportions d'**Eudoxe de Cnide** (IVᵉ siècle avant notre ère), exposée au livre V des **Éléments** d'Euclide, compare deux rapports sans jamais écrire de nombre irrationnel. Pendant deux mille ans, les mathématiciens calculent ensuite avec $\sqrt{2}$ ou $\pi$ sans savoir définir précisément ce qu'est un réel. Ce n'est qu'au XIXᵉ siècle, quand l'analyse a besoin de rigueur, que **Méray**, **Cantor** et **Dedekind** (tous vers 1870) en donnent des constructions à partir des rationnels, et qu'on dégage la liste d'axiomes de ce point.`,
        image: {
          src: '/images/historique/euclid.jpg',
          alt: "Détail de L'École d'Athènes représentant Euclide",
          caption:
            "Détail de L'École d'Athènes (1509–1511) de Raphaël, traditionnellement identifié comme Euclide — l'identification exacte de cette figure reste débattue par les historiens de l'art.",
        },
      },
      {
        kind: 'entrainement',
        title: 'Énoncés quantifiés et axiomes',
        generatorId: '56gen17',
        description: ['Dis si des énoncés avec ∀ et ∃ sont vrais ou faux (l’ordre compte), écris leur négation, puis retrouve quel axiome justifie chaque étape d’un calcul : associativité, distributivité, neutre, symétrique, compatibilité de ≤…'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 17. Énoncés quantifiés et axiomes »',
      },
      {
        kind: 'atelier',
        tag: 'phi-intervalles-widget',
        label: 'Manipule toi-même : des intervalles emboîtés autour de Φ',
        caption:
          'Les rapports de deux termes consécutifs de la suite de Fibonacci (1, 2, 3⁄2, 5⁄3, 8⁄5…) tombent tour à tour sous Φ et au-dessus. Deux rapports consécutifs forment un intervalle qui contient Φ, emboîté dans le précédent et de plus en plus court. Agrandis la droite (×10, ×100…) pour suivre les intervalles : aucun rationnel n’est dans tous, seul Φ, irrationnel, l’est.',
      },
      // ⟨fin-etape axiomes⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'valeur-absolue',
    number: 4,
    title: 'Valeur absolue et distance',
    kicker: '|x − y| est la distance entre x et y',
    titreCourt: 'Valeur absolue',
    partie: 'Les nombres réels',
    essentiel: [
      R`$|x| = x$ si $x \geq 0$ et $|x| = -x$ si $x < 0$ ; $|x - y|$ est la **distance** entre $x$ et $y$ sur la droite des réels.`,
      R`Pour $r \geq 0$ : $|x - a| \leq r \iff a - r \leq x \leq a + r$. Et $|A| = |B| \iff A = B$ ou $A = -B$.`,
      R`Inégalité triangulaire : $|x + y| \leq |x| + |y|$. Pour écrire une expression sans valeur absolue, on découpe la droite aux zéros de ce qui est entre les barres.`,
    ],
    cartes: [
      { question: R`Résous $|x - 2| = 5$.`, reponse: R`$x - 2 = 5$ ou $x - 2 = -5$ : $S = \{-3\,;7\}$.` },
      { question: R`Que vaut $\sqrt{x^2}$ ?`, reponse: R`$|x|$, et non $x$ : $\sqrt{(-3)^2} = \sqrt{9} = 3$.` },
      { question: R`Écris $|x - 3| \leq 2$ sous forme d'intervalle.`, reponse: R`$x \in [1\,;5]$ : les réels à distance au plus $2$ de $3$.` },
      { question: R`Solutions de $|3x + 1| = -2$ ?`, reponse: R`Aucune : une valeur absolue n'est jamais négative, $S = \varnothing$.` },
    ],
    blocks: [
      { kind: 'subheading', text: 'Une distance à zéro' },
      {
        kind: 'intuition',
        label: 'Pour visualiser',
        text: R`Sur une route droite, « la maison est à $70$ m de la boulangerie » ne dit pas de quel côté elle se trouve. Si on place la boulangerie en $0$ sur une droite graduée, la maison est en $70$ ou en $-70$. La **valeur absolue** retient exactement cette information : une distance, sans le côté. $|70| = |-70| = 70$.`,
      },
      {
        kind: 'definition',
        items: [
          R`La **valeur absolue** d'un réel $x$ est le réel $|x|$ défini par $|x| = x$ si $x \geq 0$ et $|x| = -x$ si $x < 0$. Exemples : $|4{,}5| = 4{,}5$ ; $|-3| = -(-3) = 3$ ; $|0| = 0$.`,
          R`Le réel $|x - y|$ est la **distance** entre les réels $x$ et $y$ : la longueur du segment qui les joint sur la droite graduée.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'distances le long d’une route',
        formula: R`Une boulangerie est située le long d'une route rectiligne. La maison A est à $80$ m de la boulangerie, la maison B à $25$ m. Quelles sont les distances possibles entre A et B ?`,
        steps: [
          { tag: 'droite graduée', text: R`On place la boulangerie en $0$ : A est en $a$ avec $|a| = 80$, donc $a = 80$ ou $a = -80$ ; B est en $b = 25$ ou $b = -25$.` },
          { tag: 'même côté', text: R`$a = 80$ et $b = 25$ : $|a - b| = |55| = 55$ (de même pour $-80$ et $-25$).` },
          { tag: 'côtés opposés', text: R`$a = 80$ et $b = -25$ : $|a - b| = |105| = 105$ (de même pour $-80$ et $25$).` },
        ],
        result: { tag: 'résultat', text: R`A et B sont à $55$ m ou à $105$ m l'un de l'autre.` },
      },
      {
        kind: 'featureTable',
        caption: 'Propriétés de la valeur absolue',
        headers: ['', 'Pour tous réels x et y'],
        rows: [
          ['a', R`$|x| = \max\{-x\,;x\}$`],
          ['b', R`$|x| = \sqrt{x^2}$`],
          ['c', R`$|x| \geq 0$, et $|x| = 0 \iff x = 0$`],
          ['d', R`$|x| = |-x|$`],
          ['e', R`$|x| \leq y \iff -y \leq x \leq y$`],
          ['f', R`$|x| < y \iff -y < x < y$`],
          ['g', R`$|x + y| \leq |x| + |y|$ (inégalité triangulaire)`],
          ['h', R`$|x \cdot y| = |x| \cdot |y|$`],
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — |x| ≤ y si et seulement si −y ≤ x ≤ y',
        blocks: [
          { kind: 'para', text: R`**Un encadrement utile.** Pour tout réel $x$, $-|x| \leq x \leq |x|$ : si $x \geq 0$, c'est $-x \leq x \leq x$ ; si $x < 0$, c'est $x \leq x \leq -x$.` },
          { kind: 'para', text: R`**Sens direct.** Supposons $|x| \leq y$. Alors $-y \leq -|x|$, et avec l'encadrement : $-y \leq -|x| \leq x \leq |x| \leq y$.` },
          { kind: 'para', text: R`**Réciproque.** Supposons $-y \leq x \leq y$. Si $x \geq 0$, $|x| = x \leq y$. Si $x < 0$, $|x| = -x$, et $-y \leq x$ donne $-x \leq y$. Dans les deux cas, $|x| \leq y$.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — l’inégalité triangulaire |x + y| ≤ |x| + |y|',
        blocks: [
          { kind: 'para', text: R`**1.** On écrit l'encadrement pour $x$ et pour $y$ : $-|x| \leq x \leq |x|$ et $-|y| \leq y \leq |y|$.` },
          { kind: 'para', text: R`**2.** On additionne membre à membre (compatibilité de $\leq$ avec l'addition, utilisée deux fois) : $-\big(|x| + |y|\big) \leq x + y \leq |x| + |y|$.` },
          { kind: 'para', text: R`**3.** C'est la forme $-c \leq X \leq c$ de la propriété démontrée juste avant, avec $X = x + y$ et $c = |x| + |y|$. Donc $|x + y| \leq |x| + |y|$.` },
          { kind: 'para', text: R`**Exemple.** $|-12 + 3| = 9$ et $|-12| + |3| = 15$ : on a bien $9 \leq 15$. L'égalité n'a lieu que si $x$ et $y$ ont le même signe (ou si l'un est nul).` },
        ],
      },
      {
        kind: 'piege',
        label: 'La valeur absolue d’une somme',
        text: R`$|a + b|$ n'est pas $|a| + |b|$ en général : $|-3 + 5| = |2| = 2$, alors que $|-3| + |5| = 8$. Au contraire, pour un produit, $|a \cdot b| = |a| \cdot |b|$ est toujours vrai.`,
      },
      { kind: 'subheading', text: 'Distances et intervalles' },
      {
        kind: 'rappel',
        label: 'Traduire une distance en intervalle (r > 0)',
        items: [
          R`$|x - a| \leq r$ $\iff a - r \leq x \leq a + r$ $\iff x \in [a - r\,;a + r]$ : les réels à distance au plus $r$ de $a$.`,
          R`$|x - a| < r \iff x \in\ ]a - r\,;a + r[$ ; $|x - a| \geq r \iff x \leq a - r$ ou $x \geq a + r$.`,
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'domainLine',
          min: -1,
          max: 7,
          segments: [{ from: 1, to: 5 }],
          points: [
            { value: 1, closed: true, label: '1', tone: 'good' },
            { value: 5, closed: true, label: '5', tone: 'good' },
          ],
          extraTicks: [{ value: 3, label: 'a = 3' }],
          rangeAnnotations: [
            { from: 1, to: 3, label: 'r = 2' },
            { from: 3, to: 5, label: 'r = 2' },
          ],
          axisLabel: 'x',
          axisLabelAtEnd: true,
          caption: R`$|x - 3| \leq 2$ : les réels à distance au plus $2$ de $3$ forment l'intervalle $[1\,;5]$.`,
        },
      },
      {
        kind: 'exemple',
        badge: 'traduire une distance en intervalle',
        formula: R`Écris sous forme d'intervalle ou de réunion d'intervalles l'ensemble des réels $x$ tels que : $|x - 3| \leq 2$ ; $|2x - 5| < 3$ ; $|x + 5| > 3$.`,
        steps: [
          { tag: '|x − 3| ≤ 2', text: R`$-2 \leq x - 3 \leq 2$, donc $1 \leq x \leq 5$.` },
          { tag: '|2x − 5| < 3', text: R`$-3 < 2x - 5 < 3$, donc $2 < 2x < 8$ et $1 < x < 4$.` },
          { tag: '|x + 5| > 3', text: R`$|x - (-5)| > 3$ : distance à $-5$ plus grande que $3$. Donc $x + 5 < -3$ ou $x + 5 > 3$, c'est-à-dire $x < -8$ ou $x > -2$.` },
        ],
        result: { tag: 'résultat', text: R`$[1\,;5]$ ; $]1\,;4[$ ; $]{-\infty}\,;-8[\ \cup\ ]{-2}\,;+\infty[$` },
      },
      {
        kind: 'piege',
        label: 'Le signe dans |x + a|',
        text: R`$|x + 5|$ est la distance de $x$ à $-5$, pas à $5$ : $|x + 5| = |x - (-5)|$. Écris toujours la différence avant de lire la distance.`,
      },
      { kind: 'subheading', text: 'Équations et inéquations' },
      {
        kind: 'methode',
        label: 'Méthode — équations et inéquations avec une valeur absolue',
        items: [
          R`$|A| = c$ : si $c < 0$, aucune solution ; si $c = 0$, $A = 0$ ; si $c > 0$, $A = c$ ou $A = -c$.`,
          R`$|A| = |B| \iff A = B$ ou $A = -B$ (deux nombres de même valeur absolue sont égaux ou opposés).`,
          R`Pour $c > 0$ : $|A| < c \iff -c < A < c$ ; $|A| > c \iff A < -c$ ou $A > c$. Pour $c \leq 0$, raisonne sur le fait qu'une valeur absolue est toujours positive.`,
          R`Vérifie en remplaçant une ou deux solutions dans l'énoncé de départ (ou avec un logiciel graphique).`,
        ],
      },
      {
        kind: 'exemple',
        badge: '|ax + b| = c : les trois cas selon le signe de c',
        formula: R`Résous dans $\mathbb{R}$ : $|x - 2| = 5$ ; $|3x + 1| = 0$ ; $|3x + 1| = -2$.`,
        steps: [
          { tag: 'c > 0', text: R`$|x - 2| = 5 \iff x - 2 = 5$ ou $x - 2 = -5 \iff x = 7$ ou $x = -3$.` },
          { tag: 'c = 0', text: R`$|3x + 1| = 0$ $\iff 3x + 1 = 0$ $\iff x = -\dfrac{1}{3}$.` },
          { tag: 'c < 0', text: R`Une valeur absolue n'est jamais négative : $|3x + 1| = -2$ n'a aucune solution.` },
        ],
        result: { tag: 'résultat', text: R`$S = \{-3\,;7\}$ ; $S = \left\{-\dfrac{1}{3}\right\}$ ; $S = \varnothing$` },
      },
      {
        kind: 'exemple',
        badge: 'deux valeurs absolues égales',
        formula: R`Résous dans $\mathbb{R}$ : $|5x + 1| = |x - 3|$.`,
        steps: [
          { tag: 'égaux', text: R`$5x + 1 = x - 3$ $\iff 4x = -4$ $\iff x = -1$.` },
          { tag: 'opposés', text: R`$5x + 1 = -(x - 3) = -x + 3$ $\iff 6x = 2$ $\iff x = \dfrac{1}{3}$.` },
          { tag: 'vérifier', text: R`$x = -1$ : $|-4| = |-4| = 4$. $x = \dfrac{1}{3}$ : $\left|\dfrac{8}{3}\right| = \left|-\dfrac{8}{3}\right| = \dfrac{8}{3}$.` },
        ],
        result: { tag: 'résultat', text: R`$S = \left\{-1\,;\dfrac{1}{3}\right\}$` },
      },
      {
        kind: 'exemple',
        badge: 'une inéquation avec un carré',
        formula: R`Résous dans $\mathbb{R}$ : $|x^2 - 4| > 2$.`,
        steps: [
          { tag: 'enlever la valeur absolue', text: R`$|x^2 - 4| > 2 \iff x^2 - 4 < -2$ ou $x^2 - 4 > 2 \iff x^2 < 2$ ou $x^2 > 6$.` },
          { tag: 'premier cas', text: R`$x^2 < 2$ $\iff |x| < \sqrt{2}$ $\iff -\sqrt{2} < x < \sqrt{2}$.` },
          { tag: 'second cas', text: R`$x^2 > 6$ $\iff |x| > \sqrt{6}$ $\iff x < -\sqrt{6}$ ou $x > \sqrt{6}$.` },
        ],
        result: { tag: 'résultat', text: R`$S = \ ]{-\infty}\,;-\sqrt{6}[$ $\cup\ ]{-\sqrt{2}}\,;\sqrt{2}[$ $\cup\ ]\sqrt{6}\,;+\infty[$` },
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [
            { fn: (x: number) => Math.abs(x * x - 4), tone: 'accent' },
            { fn: () => 2, tone: 'faint' },
          ],
          xMin: -3.3,
          xMax: 3.3,
          xTicks: [-3, -2, -1, 1, 2, 3],
          yTicks: [4],
          fixedYRange: { min: -0.5, max: 6 },
          points: [
            { x: -Math.sqrt(6), y: 2, label: '', tone: 'bad' },
            { x: -Math.sqrt(2), y: 2, label: '', tone: 'bad' },
            { x: Math.sqrt(2), y: 2, label: '', tone: 'bad' },
            { x: Math.sqrt(6), y: 2, label: '', tone: 'bad' },
          ],
          // Étiquettes posées à la main sous la droite y = 2, là où la courbe ne passe pas.
          textLabels: [
            { x: -2.85, y: 1.35, text: '−√6', tone: 'bad', anchor: 'middle' },
            { x: -1.0, y: 1.35, text: '−√2', tone: 'bad', anchor: 'middle' },
            { x: 1.0, y: 1.35, text: '√2', tone: 'bad', anchor: 'middle' },
            { x: 2.85, y: 1.35, text: '√6', tone: 'bad', anchor: 'middle' },
            { x: -3.2, y: 2.35, text: 'y = 2', tone: 'faint', anchor: 'start' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: R`La courbe de $y = |x^2 - 4|$ (le morceau de parabole sous l'axe est replié au-dessus) est au-dessus de la droite $y = 2$ sur $]{-\infty}\,;-\sqrt{6}[$, sur $]{-\sqrt{2}}\,;\sqrt{2}[$ et sur $]\sqrt{6}\,;+\infty[$.`,
        },
      },
      {
        kind: 'exemple',
        badge: 'comparer deux distances',
        formula: R`Résous dans $\mathbb{R}$ : $|x + 6| > |x - 4|$.`,
        steps: [
          { tag: 'lire des distances', text: R`$|x - (-6)|$ est la distance de $x$ à $-6$, $|x - 4|$ sa distance à $4$. On cherche les réels plus proches de $4$ que de $-6$.` },
          { tag: 'milieu', text: R`Le milieu de $-6$ et $4$ est $\dfrac{-6 + 4}{2} = -1$ : ce sont les réels situés après $-1$.` },
          { tag: 'confirmer par le calcul', text: R`Deux nombres positifs sont dans le même ordre que leurs carrés : $(x + 6)^2 > (x - 4)^2$ $\iff 12x + 36 > -8x + 16$ $\iff 20x > -20$ $\iff x > -1$.` },
        ],
        result: { tag: 'résultat', text: R`$S = \ ]{-1}\,;+\infty[$` },
      },
      {
        kind: 'piege',
        label: 'Une valeur absolue plus petite qu’un négatif',
        text: R`$|x| < -2$ n'a **aucune** solution, car $|x| \geq 0 > -2$ ; à l'inverse, $|x| > -2$ est vrai pour **tous** les réels. Ne traduis pas $|x| < -2$ par « $2 < x < -2$ » sans remarquer que c'est impossible.`,
      },
      { kind: 'subheading', text: 'Écrire sans valeur absolue' },
      {
        kind: 'methode',
        label: 'Méthode — écrire une expression sans valeur absolue',
        items: [
          R`Cherche le zéro de chaque expression entre barres et range ces zéros sur la droite.`,
          R`Sur chaque intervalle, remplace $|A|$ par $A$ si $A \geq 0$, par $-A$ si $A < 0$ (un tableau aide à ne rien oublier).`,
          R`Réduis l'expression sur chaque intervalle et contrôle aux bornes : deux morceaux voisins donnent la même valeur au zéro qui les sépare.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — écrire |x − 1| + |2x + 3| sans valeur absolue',
        blocks: [
          { kind: 'para', text: R`Écris $f(x) = |x - 1| + |2x + 3|$ sans valeur absolue.` },
          { kind: 'para', text: R`**Zéros.** $x - 1 = 0$ pour $x = 1$ ; $2x + 3 = 0$ pour $x = -\dfrac{3}{2}$. La droite est coupée en trois intervalles.` },
          {
            kind: 'signTable',
            caption: 'Chaque valeur absolue, puis la somme, sur les trois intervalles',
            rows: [
              {
                label: 'x',
                cells: [
                  { text: '−∞', tone: 'plain' },
                  { text: '', tone: 'plain' },
                  { text: '−3⁄2', tone: 'zero' },
                  { text: '', tone: 'plain' },
                  { text: '1', tone: 'zero' },
                  { text: '', tone: 'plain' },
                  { text: '+∞', tone: 'plain' },
                ],
              },
              {
                label: '|x − 1|',
                cells: [
                  { text: '', tone: 'plain' },
                  { text: '−x + 1', tone: 'plain' },
                  { text: '5⁄2', tone: 'plain' },
                  { text: '−x + 1', tone: 'plain' },
                  { text: '0', tone: 'zero' },
                  { text: 'x − 1', tone: 'plain' },
                  { text: '', tone: 'plain' },
                ],
              },
              {
                label: '|2x + 3|',
                cells: [
                  { text: '', tone: 'plain' },
                  { text: '−2x − 3', tone: 'plain' },
                  { text: '0', tone: 'zero' },
                  { text: '2x + 3', tone: 'plain' },
                  { text: '5', tone: 'plain' },
                  { text: '2x + 3', tone: 'plain' },
                  { text: '', tone: 'plain' },
                ],
              },
              {
                label: 'f(x)',
                cells: [
                  { text: '', tone: 'plain' },
                  { text: '−3x − 2', tone: 'plain' },
                  { text: '5⁄2', tone: 'plain' },
                  { text: 'x + 4', tone: 'plain' },
                  { text: '5', tone: 'plain' },
                  { text: '3x + 2', tone: 'plain' },
                  { text: '', tone: 'plain' },
                ],
              },
            ],
          },
          { kind: 'para', text: R`**Conclusion.** $f(x) = \begin{cases} -3x - 2 & \text{si } x < -\frac{3}{2} \\ x + 4 & \text{si } -\frac{3}{2} \leq x < 1 \\ 3x + 2 & \text{si } x \geq 1 \end{cases}$` },
          { kind: 'para', text: R`**Contrôle.** En $-\dfrac{3}{2}$ : $-3 \cdot \left(-\dfrac{3}{2}\right) - 2 = \dfrac{5}{2}$ et $-\dfrac{3}{2} + 4 = \dfrac{5}{2}$. En $1$ : $1 + 4 = 5$ et $3 + 2 = 5$. Les morceaux se raccordent.` },
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: (x: number) => Math.abs(x - 1) + Math.abs(2 * x + 3), tone: 'accent' }],
          xMin: -3.5,
          xMax: 2.5,
          xTicks: [-3, -2, -1, 1, 2],
          yTicks: [2, 4, 6, 8],
          fixedYRange: { min: -0.5, max: 9 },
          points: [
            { x: -1.5, y: 2.5, label: '(−1,5 ; 2,5)', tone: 'good', labelPos: 'below' },
            { x: 1, y: 5, label: '(1 ; 5)', tone: 'good', labelPos: 'right' },
          ],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption: R`La courbe de $f(x) = |x - 1| + |2x + 3|$ est formée de trois morceaux de droites, de pentes $-3$, $1$ et $3$, qui se raccordent aux zéros $-\dfrac{3}{2}$ et $1$.`,
        },
      },
      {
        kind: 'piege',
        label: 'Racine d’un carré',
        text: R`$\sqrt{x^2} = |x|$, et non $x$ : pour $x = -3$, $\sqrt{(-3)^2} = \sqrt{9} = 3 = |-3|$. De même, $\sqrt{(x - 2)^2} = |x - 2|$, qui vaut $2 - x$ quand $x < 2$.`,
      },
      {
        kind: 'application',
        titre: 'Accepter ou refuser une pièce usinée',
        text: R`Sur un plan de fabrication, une cote s'écrit par exemple $20 \pm 0{,}05$ mm : une pièce est acceptée si son diamètre $d$ vérifie $|d - 20| \leq 0{,}05$, c'est-à-dire $d \in [19{,}95\,;20{,}05]$. Le contrôle automatique d'une chaîne de production fait exactement ce test : il mesure $d$, calcule l'écart $|d - 20|$ à la valeur visée et rejette la pièce si l'écart dépasse la tolérance. La valeur absolue traduit le fait qu'un écart de $0{,}06$ mm est aussi grave en trop qu'en moins.`,
        domaines: ['Mécanique', 'Contrôle qualité'],
      },
      {
        kind: 'entrainement',
        title: 'Équations et inéquations avec valeurs absolues',
        generatorId: '56gen18',
        description: ['Résous |ax + b| = c, < c ou ≥ c selon le signe de c, |A| = |B| et |x² − k| comparé à c, puis donne la réponse sous forme d’ensemble ou de réunion d’intervalles.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 18. Équations et inéquations avec valeurs absolues »',
      },
      {
        kind: 'entrainement',
        title: 'Écrire sans valeur absolue',
        generatorId: '56gen19',
        description: ['Écris une expression comme |x − a| + |bx + c| par morceaux : zéros, tableau, expression réduite sur chaque intervalle, contrôle aux bornes.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 19. Écrire sans valeur absolue »',
      },
      {
        kind: 'atelier',
        tag: 'valeur-absolue-distance-widget',
        label: 'Manipule toi-même : valeur absolue et distance sur la droite',
        caption:
          'Règle a et r, choisis le symbole (<, ≤, >, ≥ ou =) : les solutions de |x − a| ◇ r s’allument sur la droite et s’écrivent en intervalles. Fais glisser le point x pour lire sa distance à a. Essaie aussi r = 0 et r négatif : une distance n’est jamais négative.',
      },
      // ⟨fin-etape valeur-absolue⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'approcher-densite',
    number: 5,
    title: 'Encadrer, approcher, densité',
    kicker: 'erreurs, algorithme de Héron, dénombrable ou continu',
    titreCourt: 'Approcher un réel',
    partie: 'Les nombres réels',
    essentiel: [
      R`Si $a$ et $b$ sont connus à $e$ près, le périmètre $2(a + b)$ est connu à $4e$ près et l'aire $ab$ à $(a + b)\,e + e^2$ près : les erreurs s'accumulent dans les calculs.`,
      R`Algorithme de Héron : $a_{n+1} = \dfrac{1}{2}\left(a_n + \dfrac{A}{a_n}\right)$ ; $\sqrt{A}$ est toujours entre $\dfrac{A}{a_n}$ et $a_n$, et l'encadrement se resserre très vite.`,
      R`Entre deux réels distincts, il y a une infinité de rationnels et une infinité d'irrationnels. $\mathbb{N}$, $\mathbb{Z}$ et $\mathbb{Q}$ sont dénombrables ; $\mathbb{R}$ ne l'est pas.`,
    ],
    cartes: [
      { question: R`Premier pas de Héron pour $\sqrt{18}$, depuis le rectangle $2 \times 9$ ?`, reponse: R`Longueur $\dfrac{2 + 9}{2} = 5{,}5$, largeur $\dfrac{18}{5{,}5} \approx 3{,}27$ : $3{,}27 < \sqrt{18} < 5{,}5$.` },
      { question: R`Donne un réel strictement compris entre $\dfrac{3}{7}$ et $\dfrac{4}{9}$.`, reponse: R`Leur moyenne $\dfrac{1}{2}\left(\dfrac{3}{7} + \dfrac{4}{9}\right) = \dfrac{55}{126}$ ; il y en a une infinité d'autres.` },
      { question: R`Quel est le plus petit rationnel de $]3\,;3{,}01]$ ?`, reponse: R`Il n'y en a pas : pour tout rationnel $q$ de l'intervalle, $\dfrac{3 + q}{2}$ est un rationnel de l'intervalle plus petit que $q$.` },
      { question: R`$\mathbb{Q}$ est-il dénombrable ? Et $\mathbb{R}$ ?`, reponse: R`$\mathbb{Q}$ oui : on peut numéroter tous les rationnels. $\mathbb{R}$ non (Cantor) : on dit qu'il a la puissance du continu.` },
    ],
    blocks: [
      { kind: 'subheading', text: 'Calculer avec des mesures approchées' },
      {
        kind: 'para',
        text: R`Une mesure n'est jamais tout à fait exacte : une longueur lue « $12{,}4$ cm à $0{,}1$ cm près » vérifie $12{,}3 \leq a \leq 12{,}5$. Quand on calcule avec des valeurs approchées, le résultat est lui aussi approché, et il faut savoir **encadrer** l'erreur.`,
      },
      {
        kind: 'exemple',
        badge: 'encadrer le périmètre et l’aire d’un rectangle mesuré',
        formula: R`Les côtés d'un rectangle mesurent $12{,}4$ cm et $7{,}8$ cm, à $0{,}1$ cm près. Encadre son périmètre et son aire.`,
        steps: [
          { tag: 'encadrer les côtés', text: R`$12{,}3 \leq a \leq 12{,}5$ et $7{,}7 \leq b \leq 7{,}9$.` },
          { tag: 'périmètre', text: R`$2(12{,}3 + 7{,}7) \leq 2(a + b)$ $\leq 2(12{,}5 + 7{,}9)$, donc $40 \leq P \leq 40{,}8$ : $P = 40{,}4$ cm à $0{,}4$ cm près.` },
          { tag: 'aire', text: R`$12{,}3 \times 7{,}7 \leq ab \leq 12{,}5 \times 7{,}9$, donc $94{,}71 \leq A \leq 98{,}75$ (en cm²).` },
          { tag: 'comparer', text: R`Le calcul « direct » donne $12{,}4 \times 7{,}8 = 96{,}72$, mais l'aire réelle peut s'en écarter de plus de $2$ cm².` },
        ],
        result: { tag: 'résultat', text: R`$40 \leq P \leq 40{,}8$ cm et $94{,}71 \leq A \leq 98{,}75$ cm².` },
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — comment l’erreur se propage dans un périmètre et une aire',
        blocks: [
          { kind: 'para', text: R`On mesure deux longueurs $x$ et $y$ ; on obtient $a$ et $b$ à $e$ près : $a - e \leq x \leq a + e$ et $b - e \leq y \leq b + e$, avec $a - e > 0$ et $b - e > 0$.` },
          { kind: 'para', text: R`**Périmètre.** En additionnant (compatibilité de $\leq$ avec l'addition), puis en multipliant par $2 > 0$ : $2(a + b) - 4e \leq 2(x + y)$ $\leq 2(a + b) + 4e$. L'erreur sur le périmètre est au plus $4e$.` },
          { kind: 'para', text: R`**Aire.** Toutes les longueurs étant positives, on peut multiplier les encadrements (compatibilité avec la multiplication par un positif) : $(a - e)(b - e) \leq xy \leq (a + e)(b + e)$, c'est-à-dire $ab - (a + b)\,e + e^2 \leq xy$ $\leq ab + (a + b)\,e + e^2$. L'erreur sur l'aire est au plus $(a + b)\,e + e^2$.` },
          { kind: 'para', text: R`**Conséquence.** Avec des mesures données à $10^{-n}$ près, le périmètre est connu à $4 \cdot 10^{-n}$ près, et l'aire à environ $(a + b) \cdot 10^{-n}$ près : plus les côtés sont grands, plus l'erreur sur l'aire est grande.` },
        ],
      },
      {
        kind: 'attention',
        label: 'Arrondir à la fin seulement',
        text: R`Arrondir les valeurs intermédiaires ajoute une erreur à chaque étape. Garde les valeurs exactes (ou la mémoire de la calculatrice) pendant le calcul, et n'arrondis que le résultat final, en tenant compte de la précision des données.`,
      },
      { kind: 'subheading', text: 'L’algorithme de Héron' },
      {
        kind: 'para',
        text: R`Pour approcher $\sqrt{A}$ ($A > 1$), **Héron d'Alexandrie** (Iᵉʳ siècle de notre ère) utilise des rectangles d'aire $A$. Un carré d'aire $A$ aurait pour côté exactement $\sqrt{A}$. Un rectangle d'aire $A$ dont la longueur $a$ est plus grande que $\sqrt{A}$ a une largeur $\dfrac{A}{a}$ plus petite que $\sqrt{A}$ : ses deux côtés **encadrent** $\sqrt{A}$. Pour s'approcher du carré, on prend comme nouvelle longueur la **moyenne** des deux côtés, et on recommence.`,
      },
      {
        kind: 'definition',
        label: 'Algorithme de Héron',
        items: [
          R`On choisit $a_1 > 0$, puis $a_{n+1} = \dfrac{1}{2}\left(a_n + \dfrac{A}{a_n}\right)$. Le rectangle numéro $n$ mesure $a_n$ sur $\dfrac{A}{a_n}$, et (dès que $a_n \geq \sqrt{A}$) $\dfrac{A}{a_n} \leq \sqrt{A} \leq a_n$.`,
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'vectorPlane',
          xMin: -0.6,
          xMax: 9.9,
          // Domaine isotrope (rapport 16/15) : le dernier rectangle doit paraître presque carré.
          yMin: -2.6,
          yMax: 7.24,
          showAxes: false,
          vectors: [
            { from: { x: 0, y: 0 }, to: { x: 9, y: 0 }, tone: 'faint', arrow: false },
            { from: { x: 9, y: 0 }, to: { x: 9, y: 2 }, tone: 'faint', arrow: false },
            { from: { x: 9, y: 2 }, to: { x: 0, y: 2 }, tone: 'faint', arrow: false },
            { from: { x: 0, y: 0 }, to: { x: 0, y: 2 }, tone: 'faint', arrow: false },
            { from: { x: 5.5, y: 0 }, to: { x: 5.5, y: 18 / 5.5 }, tone: 'bad', arrow: false },
            { from: { x: 5.5, y: 18 / 5.5 }, to: { x: 0, y: 18 / 5.5 }, tone: 'bad', arrow: false },
            { from: { x: 0, y: 0 }, to: { x: 0, y: 18 / 5.5 }, tone: 'bad', arrow: false },
            { from: { x: 0, y: 0 }, to: { x: 5.5, y: 0 }, tone: 'bad', arrow: false },
            { from: { x: 4.3864, y: 0 }, to: { x: 4.3864, y: 4.1036 }, tone: 'good', arrow: false },
            { from: { x: 4.3864, y: 4.1036 }, to: { x: 0, y: 4.1036 }, tone: 'good', arrow: false },
            { from: { x: 0, y: 2 }, to: { x: 0, y: 4.1036 }, tone: 'good', arrow: false },
          ],
          points: [
            { x: 7.25, y: 0.55, label: '9 × 2', tone: 'ink', node: false, labelPos: 'above' },
            { x: 5.5, y: 2.75, label: '5,5 × 3,27', tone: 'bad', node: false, labelPos: 'right' },
            { x: 2.2, y: 4.1036, label: '4,39 × 4,10', tone: 'good', node: false, labelPos: 'above' },
          ],
          caption: R`Trois rectangles d'aire $18$, de plus en plus proches d'un carré : $9 \times 2$, puis $5{,}5 \times 3{,}27$, puis $4{,}39 \times 4{,}10$. Le côté du carré, $\sqrt{18} \approx 4{,}243$, est toujours entre la largeur et la longueur.`,
        },
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — encadrer √18 à 10⁻⁴ près par l’algorithme de Héron',
        blocks: [
          { kind: 'para', text: R`En partant d'un rectangle de dimensions $2$ et $9$, écris les encadrements successifs de $\sqrt{18}$ jusqu'à pouvoir donner sa valeur approchée à $10^{-4}$ près.` },
          {
            kind: 'featureTable',
            headers: ['Rectangle', 'Largeur 18 ⁄ aₙ', 'Longueur aₙ', 'Écart'],
            rows: [
              ['$1$', '$2$', '$9$', '$7$'],
              ['$2$', R`$3{,}272727\ldots$`, R`$5{,}5$`, R`$2{,}23$`],
              ['$3$', R`$4{,}103627\ldots$`, R`$4{,}386364\ldots$`, R`$0{,}28$`],
              ['$4$', R`$4{,}240287\ldots$`, R`$4{,}244995\ldots$`, R`$0{,}0047$`],
              ['$5$', R`$4{,}2426400\ldots$`, R`$4{,}2426413\ldots$`, R`$0{,}0000013$`],
            ],
          },
          { kind: 'para', text: R`**Calcul d'une ligne.** $a_3 = \dfrac{1}{2}(5{,}5 + 3{,}272727\ldots) = 4{,}386363\ldots$ et $\dfrac{18}{4{,}386363\ldots} = 4{,}103626\ldots$ Garde toutes les décimales en mémoire de la calculatrice.` },
          { kind: 'para', text: R`**Lecture.** Au rectangle $4$, $4{,}2402 < \sqrt{18} < 4{,}2450$ : pas assez précis. Au rectangle $5$, $4{,}2426400 < \sqrt{18} < 4{,}2426413$ : les deux bornes commencent par $4{,}2426$.` },
          { kind: 'para', text: R`**Conclusion.** $\sqrt{18} \approx 4{,}2426$ à $10^{-4}$ près. Remarque : l'écart entre les côtés passe de $0{,}28$ à $0{,}0047$ puis à $0{,}0000013$ : le nombre de décimales exactes double environ à chaque étape.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — √A reste toujours entre la largeur et la longueur',
        blocks: [
          { kind: 'para', text: R`**1.** Si $a > 0$ et $a \geq \sqrt{A}$, alors $\dfrac{A}{a} \leq \dfrac{A}{\sqrt{A}} = \sqrt{A}$ : la largeur est sous $\sqrt{A}$ quand la longueur est au-dessus.` },
          { kind: 'para', text: R`**2.** Pour tout $a_n > 0$ : $a_{n+1} - \sqrt{A} = \dfrac{a_n^2 + A - 2a_n\sqrt{A}}{2a_n}$ $= \dfrac{(a_n - \sqrt{A})^2}{2a_n} \geq 0$. Donc, dès le deuxième rectangle, la longueur est au-dessus de $\sqrt{A}$, et par le point 1, la largeur en dessous.` },
          { kind: 'para', text: R`**3.** La longueur diminue : comme $\dfrac{A}{a_n} \leq a_n$, la moyenne $a_{n+1}$ des deux côtés est au plus $a_n$. L'encadrement se resserre donc à chaque étape.` },
          { kind: 'para', text: R`**4.** L'égalité du point 2 explique la rapidité : l'écart à $\sqrt{A}$ est remplacé par (presque) son **carré**, divisé par $2a_n$. Un écart de $0{,}01$ devient environ $0{,}0001$, puis $0{,}00000001$.` },
        ],
      },
      {
        kind: 'astuce',
        label: 'À la calculatrice',
        text: R`Dans le menu **Récurrence** de la Casio Graph Math+, entre la suite $a_{n+1} = \dfrac{1}{2}\left(a_n + \dfrac{18}{a_n}\right)$ avec $a_1 = 9$, puis affiche la table : les termes successifs apparaissent d'un coup. Pour la largeur, calcule $18 \div a_n$ sur la valeur affichée en mémoire.`,
      },
      {
        kind: 'historique',
        titre: 'Une racine de 2 gravée il y a près de 4 000 ans',
        text: R`Bien avant Héron, les scribes babyloniens savaient approcher les racines carrées. La petite tablette d'argile **YBC 7289**, conservée à l'université Yale et datée d'environ 1800 à 1600 avant notre ère, montre un carré et ses diagonales ; on y lit, en base $60$, le nombre $1 + \dfrac{24}{60} + \dfrac{51}{60^2} + \dfrac{10}{60^3} \approx 1{,}4142130$, alors que $\sqrt{2} = 1{,}4142136\ldots$ : six décimales exactes. On ne sait pas avec certitude comment ils l'ont obtenu, mais une méthode de moyennes comme celle de Héron y conduit en quelques étapes.`,
        image: {
          src: '/images/historique/tablette-babylonienne.jpg',
          alt: 'Tablette d’argile babylonienne couverte d’écriture cunéiforme',
          caption: 'Tablette babylonienne YBC 7289 (vers 1800–1600 av. J.-C.), Yale Babylonian Collection.',
        },
      },
      { kind: 'subheading', text: 'La méthode des puissances' },
      {
        kind: 'exemple',
        badge: 'approcher √3 par une fraction avec des puissances',
        formula: R`Sachant que $0 < \sqrt{3} - 1 < 1$, calcule $(\sqrt{3} - 1)^2$, $(\sqrt{3} - 1)^4$ et $(\sqrt{3} - 1)^8$ sous la forme $u - v\sqrt{3}$, et déduis-en une fraction proche de $\sqrt{3}$.`,
        steps: [
          { tag: 'carrés successifs', text: R`$(\sqrt{3} - 1)^2 = 3 - 2\sqrt{3} + 1$ $= 4 - 2\sqrt{3}$ ; $(4 - 2\sqrt{3})^2 = 16 - 16\sqrt{3} + 12$ $= 28 - 16\sqrt{3}$.` },
          { tag: 'encore une fois', text: R`$(28 - 16\sqrt{3})^2 = 784 - 896\sqrt{3} + 768$ $= 1552 - 896\sqrt{3}$.` },
          { tag: 'un nombre petit', text: R`Une puissance d'un nombre compris entre $0$ et $1$ diminue : $1552 - 896\sqrt{3} = (\sqrt{3} - 1)^8 \approx 0{,}082$. En le négligeant, $\sqrt{3} \approx \dfrac{1552}{896} = \dfrac{97}{56}$.` },
          { tag: 'précision', text: R`$\dfrac{97}{56} = 1{,}7321428\ldots$ et $\sqrt{3} = 1{,}7320508\ldots$ : l'erreur vaut $\dfrac{0{,}082}{896} \approx 9 \cdot 10^{-5}$.` },
        ],
        result: { tag: 'résultat', text: R`$\sqrt{3} \approx \dfrac{97}{56}$, à moins de $10^{-4}$ près.` },
      },
      {
        kind: 'para',
        text: R`Le même procédé marche pour $\sqrt{5}$ avec $0 < \sqrt{5} - 2 < 1$ : $(\sqrt{5} - 2)^2 = 9 - 4\sqrt{5}$, puis $(9 - 4\sqrt{5})^2 = 161 - 72\sqrt{5} \approx 0{,}0031$, d'où $\sqrt{5} \approx \dfrac{161}{72} = 2{,}23611\ldots$ (au lieu de $2{,}23607\ldots$).`,
      },
      { kind: 'subheading', text: 'Densité : toujours un nombre entre deux nombres' },
      {
        kind: 'para',
        text: R`Entre deux réels $a < b$, il y a toujours un autre réel, par exemple leur moyenne $c = \dfrac{a + b}{2}$. On recommence entre $a$ et $c$, puis entre $a$ et le nouveau milieu… : entre deux réels distincts, il y a une **infinité** de réels. Si $a$ et $b$ sont rationnels, $c$ l'est aussi : il y a une infinité de rationnels entre deux rationnels. On dit que $\mathbb{Q}$ et $\mathbb{R}$ sont **denses**. Par exemple, $\dfrac{55}{126}$ est entre $\dfrac{3}{7}$ et $\dfrac{4}{9}$.`,
      },
      {
        kind: 'exemple',
        badge: 'existe-t-il un plus petit rationnel dans ]3 ; 3,01] ?',
        formula: R`Existe-t-il un plus petit rationnel dans l'intervalle $]3\,;3{,}01]$ ? Un plus grand rationnel dans $[3\,;3{,}01[$ ?`,
        steps: [
          { tag: 'raisonner par l’absurde', text: R`Supposons que $q$ soit le plus petit rationnel de $]3\,;3{,}01]$. Alors $q' = \dfrac{3 + q}{2}$ est rationnel, et $3 < q' < q$ : $q'$ est dans l'intervalle et plus petit que $q$. Contradiction.` },
          { tag: 'même idée', text: R`Si $q$ était le plus grand rationnel de $[3\,;3{,}01[$, le rationnel $\dfrac{q + 3{,}01}{2}$ serait dans l'intervalle et plus grand que $q$.` },
        ],
        result: { tag: 'résultat', text: R`Non, dans les deux cas : une borne exclue n'est jamais « atteinte par le rationnel suivant », car il n'y a pas de rationnel suivant.` },
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — entre deux rationnels, il y a un irrationnel',
        blocks: [
          { kind: 'para', text: R`Soient $a < b$ deux rationnels. Posons $x = a + \dfrac{b - a}{\sqrt{2}}$.` },
          { kind: 'para', text: R`**x est entre a et b.** Comme $0 < \dfrac{1}{\sqrt{2}} < 1$ et $b - a > 0$ : $0 < \dfrac{b - a}{\sqrt{2}} < b - a$, donc $a < x < b$.` },
          { kind: 'para', text: R`**x est irrationnel.** Si $x$ était un rationnel $q$, alors $\sqrt{2} = \dfrac{b - a}{q - a}$ serait un quotient de rationnels, donc rationnel : impossible.` },
          { kind: 'para', text: R`**Conséquence.** En recommençant entre $a$ et $x$… on obtient une infinité d'irrationnels entre $a$ et $b$. Exemple : entre $1{,}41$ et $1{,}42$, le nombre $1{,}41 + \dfrac{0{,}01}{\sqrt{2}} \approx 1{,}41707$ est irrationnel.` },
        ],
      },
      {
        kind: 'para',
        text: R`Inversement, entre deux réels $a < b$ quelconques, il y a toujours un rationnel : par l'axiome d'Archimède, il existe un naturel $n$ tel que $n(b - a) > 1$ ; deux multiples consécutifs de $\dfrac{1}{n}$ sont alors trop proches pour « enjamber » l'intervalle $]a\,;b[$, et l'un d'eux tombe dedans.`,
      },
      { kind: 'subheading', text: 'Dénombrable ou continu' },
      {
        kind: 'para',
        text: R`Un ensemble infini est **dénombrable** si on peut numéroter ses éléments $1$, $2$, $3$… sans en oublier aucun, c'est-à-dire les apparier un à un avec les éléments de $\mathbb{N}_0$. $\mathbb{N}$ est dénombrable ; $\mathbb{Z}$ aussi, en alternant les signes :`,
      },
      {
        kind: 'featureTable',
        headers: ['Numéro', '1', '2', '3', '4', '5', '6', '7', '…'],
        rows: [[R`Élément de $\mathbb{Z}$`, '$0$', '$1$', '$-1$', '$2$', '$-2$', '$3$', '$-3$', R`$\ldots$`]],
      },
      {
        kind: 'para',
        text: R`Plus surprenant, $\mathbb{Q}$ est dénombrable lui aussi : on range les fractions $\dfrac{m}{n}$ dans un tableau infini (ligne $m$, colonne $n$) et on le parcourt diagonale par diagonale, en sautant les fractions déjà rencontrées ($\dfrac{2}{2} = \dfrac{1}{1}$…). En revanche, **Georg Cantor** a démontré que $\mathbb{R}$ n'est **pas** dénombrable : toute liste numérotée de réels en oublie forcément (démonstration admise ici). On dit que $\mathbb{R}$ a la **puissance du continu** : il y a « plus » de réels que de rationnels, bien que $\mathbb{Q}$ soit dense dans $\mathbb{R}$.`,
      },
      {
        kind: 'historique',
        titre: 'Cantor et les infinis de tailles différentes',
        text: R`En 1874, **Georg Cantor** (1845–1918) publie un résultat qui stupéfie ses contemporains : les nombres réels ne peuvent pas être numérotés, alors que les rationnels, pourtant présents partout sur la droite, le peuvent. Il existe donc des infinis plus grands que d'autres. En 1891, il en donne une preuve célèbre, l'**argument diagonal** : à partir de n'importe quelle liste de réels écrits en décimal, il fabrique un réel dont la $n$-ième décimale diffère de celle du $n$-ième réel de la liste, donc un réel absent de la liste. Ses idées furent violemment contestées de son vivant ; elles sont aujourd'hui à la base de la théorie des ensembles.`,
        image: {
          src: '/images/historique/cantor.jpg',
          alt: 'Portrait de Georg Cantor',
          caption: 'Georg Cantor (1845–1918), photographie d’époque.',
        },
      },
      {
        kind: 'application',
        titre: 'Comment une calculatrice trouve une racine carrée',
        text: R`Une calculatrice ne connaît pas $\sqrt{18}$ : elle n'effectue que des additions, des multiplications et des divisions. Pour afficher une racine carrée, beaucoup de programmes de calcul utilisent la méthode de Héron, appelée aussi **méthode de Newton** : ils partent d'une première valeur approchée (lue dans une petite table) et appliquent $a_{n+1} = \dfrac{1}{2}\left(a_n + \dfrac{A}{a_n}\right)$. Comme le nombre de décimales exactes double environ à chaque étape, trois ou quatre passages suffisent pour les quinze chiffres affichés. La même idée, remplacer un nombre par une moyenne qui « corrige » l'erreur, sert à calculer des inverses et à résoudre des équations dans tous les logiciels scientifiques.`,
        domaines: ['Informatique', 'Calcul scientifique'],
      },
      {
        kind: 'entrainement',
        title: 'Héron et encadrements successifs',
        generatorId: '56gen20',
        description: ['Applique l’algorithme de Héron à √A depuis un premier rectangle : termes successifs, encadrements, nombre d’étapes pour une précision donnée (menu Récurrence), puis la méthode des puissances pour approcher √p par une fraction.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 20. Héron et encadrements successifs »',
      },
      {
        kind: 'atelier',
        tag: 'heron-rectangles-widget',
        label: 'Manipule toi-même : les rectangles de Héron',
        caption:
          'Tous les rectangles ont la même aire A ; la longueur suivante est la moyenne des deux côtés. Les rectangles se rapprochent du carré de côté √A, et chacun encadre √A entre sa largeur et sa longueur. Les chiffres communs aux deux bornes, donc sûrs, sont en vert : leur nombre double à peu près à chaque étape.',
      },
      // ⟨fin-etape approcher-densite⟩
    ],
  },
]

/** Puces de « Ce qu'il faut retenir » de cette partie (KaTeX, voir content-authoring.md « Synthèses en KaTeX »). */
export const recapItemsReels: string[] = [
  R`**Irrationnels** : $\sqrt{2}$, $\sqrt{p}$ ($p$ premier), $\sqrt[3]{7}$, $\pi$ et $\Phi = \dfrac{1 + \sqrt{5}}{2}$ ne s'écrivent pas $\dfrac{m}{n}$ ; preuve par l'absurde, en comparant les exposants des facteurs premiers. $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$.`,
  R`**Écritures décimales** : rationnel $\iff$ écriture limitée ou périodique ; irrationnel $\iff$ illimitée non périodique. Fraction irréductible $\dfrac{m}{n}$ : limitée $\iff$ $n = 2^a \cdot 5^b$ ; période d'au plus $n - 1$ chiffres ; $0{,}\overline{9} = 1$.`,
  R`**Axiomes** : $\forall$ (pour tout), $\exists$ (il existe), leur ordre change le sens ; addition, multiplication, ordre $\leq$, axiome d'Archimède, intervalles emboîtés ; $x - y = x + (-y)$, $\dfrac{x}{y} = x \cdot \dfrac{1}{y}$.`,
  R`**Valeur absolue** : $|x - y|$ = distance de $x$ à $y$ ; $|x - a| \leq r \iff x \in [a - r\,;a + r]$ ; $|A| = |B| \iff A = \pm B$ ; $|x + y| \leq |x| + |y|$ ; $\sqrt{x^2} = |x|$.`,
  R`**Approcher** : erreurs $4e$ sur un périmètre, $(a + b)\,e + e^2$ sur une aire ; Héron $a_{n+1} = \dfrac{1}{2}\left(a_n + \dfrac{A}{a_n}\right)$, avec $\dfrac{A}{a_n} \leq \sqrt{A} \leq a_n$.`,
  R`**Densité** : entre deux réels distincts, une infinité de rationnels et d'irrationnels ; $\mathbb{N}$, $\mathbb{Z}$, $\mathbb{Q}$ dénombrables, $\mathbb{R}$ non dénombrable.`,
]

/** Groupes du formulaire de fin de chapitre pour cette partie (formules utiles aux générateurs). */
export const formulaireGroupesReels: FormulaireGroupe[] = [
  {
    title: 'Rationnels et irrationnels',
    formulas: [
      { text: R`$x \in \mathbb{Q} \iff x = \dfrac{m}{n}$, $m \in \mathbb{Z}$, $n \in \mathbb{Z}_0$`, condition: R`$\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$` },
      { text: R`$\sqrt{n}$ ($n \in \mathbb{N}$) est un naturel si $n$ est un carré parfait, sinon un irrationnel`, condition: R`de même pour $\sqrt[3]{n}$ avec les cubes parfaits` },
      { text: R`$\sqrt{p} = \dfrac{m}{n} \Rightarrow m^2 = p\,n^2$ : exposant de $p$ pair à gauche, impair à droite`, condition: R`$\sqrt[3]{p}$ : $m^3 = p\,n^3$, exposant de $p$ multiple de $3$ à gauche, pas à droite` },
    ],
  },
  {
    title: 'Écritures décimales',
    formulas: [
      { text: R`$x \in \mathbb{Q} \iff$ écriture décimale limitée ou illimitée périodique` },
      { text: R`$k$ chiffres avant la période, $p$ dans la période : $10^{k+p}x - 10^k x$ est un entier`, condition: R`exemple : $1000x - 10x = 2115$ pour $x = 2{,}1\overline{36}$` },
      { text: R`$\dfrac{m}{n}$ irréductible : écriture limitée $\iff n = 2^a \cdot 5^b$`, condition: R`sinon périodique, période d'au plus $n - 1$ chiffres` },
    ],
  },
  {
    title: 'Quantificateurs et axiomes',
    formulas: [
      { text: R`Négation de « $\forall x$, $P(x)$ » : « $\exists x$, non $P(x)$ »`, condition: R`négation de « $\exists x$, $P(x)$ » : « $\forall x$, non $P(x)$ »` },
      { text: R`$x + (y + z) = (x + y) + z$ ; $x + y = y + x$ ; $x + 0 = x$ ; $x + (-x) = 0$`, condition: R`de même pour la multiplication, avec $1$ et l'inverse $\dfrac{1}{x}$ ($x \neq 0$)` },
      { text: R`$x \cdot (y + z) = x \cdot y + x \cdot z$`, condition: 'distributivité' },
      { text: R`$x \leq y \Rightarrow x + z \leq y + z$ ; si $0 \leq z$ : $x \leq y \Rightarrow xz \leq yz$`, condition: 'compatibilité de l’ordre' },
    ],
  },
  {
    title: 'Valeur absolue',
    formulas: [
      { text: R`$|x| = x$ si $x \geq 0$ ; $|x| = -x$ si $x < 0$`, condition: R`$|x - y|$ = distance de $x$ à $y$` },
      { text: R`$|A| = c$ : aucune solution si $c < 0$ ; $A = 0$ si $c = 0$ ; $A = \pm c$ si $c > 0$` },
      { text: R`$|A| = |B| \iff A = B$ ou $A = -B$` },
      { text: R`$|A| < c \iff -c < A < c$ ; $|A| > c \iff A < -c$ ou $A > c$`, condition: R`pour $c > 0$` },
      { text: R`$|x - a| \leq r \iff x \in [a - r\,;a + r]$` },
    ],
  },
  {
    title: 'Approcher une racine',
    formulas: [
      { text: R`$a_{n+1} = \dfrac{1}{2}\left(a_n + \dfrac{A}{a_n}\right)$`, condition: R`si $a_n \geq \sqrt{A}$ (vrai dès $n \geq 2$) : $\dfrac{A}{a_n} \leq \sqrt{A} \leq a_n$` },
      { text: R`$0 < \sqrt{p} - k < 1$ : $(\sqrt{p} - k)^{2^j} = u - v\sqrt{p} \approx 0$ donne $\sqrt{p} \approx \dfrac{u}{v}$`, condition: R`exemple : $\sqrt{3} \approx \dfrac{1552}{896} = \dfrac{97}{56}$` },
    ],
  },
]
