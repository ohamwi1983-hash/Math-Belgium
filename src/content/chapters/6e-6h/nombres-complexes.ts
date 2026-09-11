import type { ChapterContent } from '../../types'

const PI = Math.PI
const deg = (rad: number) => (rad * 180) / PI

export const nombresComplexes: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 5,
  title: 'Nombres complexes',
  slug: 'nombres-complexes',
  lede:
    "$x^2=-1$ n'a aucune solution dans ℝ. Les nombres complexes comblent ce trou : tu " +
    "introduis un nouveau nombre, $i$, tel que $i^2=-1$, puis tu bâtis dessus toute une " +
    "nouvelle algèbre — avec sa propre géométrie (le plan d'Argand) et ses propres outils " +
    "(module, argument, formule de Moivre). De quoi résoudre des équations qui semblaient " +
    "impossibles, décrire des transformations du plan, et retrouver des propriétés de " +
    "figures géométriques.",

  sections: [
    {
      id: 'operationsbase',
      number: 1,
      title: 'Opérations de base et puissances de i',
      kicker: 'i²=−1, forme a+bi, conjugué, division',
      blocks: [
        {
          kind: 'intuition',
          label: 'Une histoire déjà vécue',
          text:
            'Les nombres négatifs ont longtemps semblé absurdes : comment un nombre ' +
            'pourrait-il être « plus petit que rien » ? Ils sont pourtant devenus ' +
            'indispensables dès qu\'il a fallu représenter une dette, ou une température sous ' +
            'zéro. $i$ suit exactement le même chemin : $x^2=-1$ paraît impossible tant que tu ' +
            'restes dans ℝ, mais $i$ devient nécessaire dès que tu veux résoudre ce type ' +
            'd\'équation, ou décrire certaines rotations du plan. Ce n\'est pas un nombre ' +
            '« magique » — c\'est un nombre de plus, comme les négatifs en leur temps.',
        },
        {
          kind: 'definition',
          items: [
            'ℝ n\'a aucune solution à $x^2=-1$. Tu introduis donc un nouveau nombre, $i$, tel ' +
              'que $i^2=-1$. Tout nombre de la forme $z = a+bi$ (avec $a,b \\in \\mathbb{R}$) ' +
              's\'appelle un **nombre complexe** : $a$ est sa **partie réelle** ($Re(z)$), $b$ ' +
              'sa **partie imaginaire** ($Im(z)$). L\'ensemble des nombres complexes se note ' +
              'ℂ. ℝ en est un sous-ensemble — les complexes de partie imaginaire nulle — ' +
              'lui-même bâti sur ℕ⊂ℤ⊂ℚ⊂ℝ.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'numberSetsNesting',
            rings: [
              { rx: 150, ry: 125, label: 'ℂ' },
              { rx: 118, ry: 98, label: 'ℝ' },
              { rx: 84, ry: 70, label: 'ℚ' },
              { rx: 54, ry: 45, label: 'ℤ' },
              { rx: 26, ry: 22, label: 'ℕ' },
            ],
            examplePoints: [
              { dx: 0, dy: 10, label: '1 ; 2 ; 3', anchor: 'start' },
              { dx: -40, dy: 6, label: '−3', anchor: 'end' },
              { dx: 62, dy: 24, label: '1/2', anchor: 'start' },
              { dx: -95, dy: -50, label: '√2', anchor: 'end' },
              { dx: 128, dy: 68, label: 'i', anchor: 'start' },
            ],
            caption:
              "ℂ prolonge l'emboîtement ℕ⊂ℤ⊂ℚ⊂ℝ : chaque ensemble est inclus dans le suivant, " +
              "et ℂ contient enfin des nombres comme $i$, qu'aucun des précédents ne savait " +
              'exprimer.',
          },
        },
        {
          kind: 'definition',
          label: 'Nombres complexes égaux',
          items: [
            '$(a_1+b_1i) = (a_2+b_2i) \\iff a_1=a_2$ et $b_1=b_2$',
            'Deux complexes sont égaux SEULEMENT s\'ils ont la même partie réelle ET la même ' +
              'partie imaginaire — jamais une égalité « globale » approchée. C\'est ce qui te ' +
              'permet d\'identifier séparément les deux parties dans une équation entre ' +
              'complexes : tu t\'en serviras pour la racine carrée, à la section 2.',
          ],
        },
        {
          kind: 'methode',
          label: 'Opérations de base',
          items: [
            '**Addition/soustraction** : traite séparément les parties réelles et ' +
              'imaginaires. $(a+bi) \\pm (c+di) = (a\\pm c) + (b\\pm d)i$',
            '**Multiplication** : développe comme un produit de binômes, puis remplace ' +
              '$i^2$ par $-1$. $(a+bi)(c+di) = ac+adi+bci+bdi^2 = (ac-bd) + (ad+bc)i$',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'développer, puis remplacer i²=−1', text: '$(2+i)(3-i) = 6-2i+3i-i^2 = 6+i-(-1)$' }],
          result: { tag: 'résultat', text: '$7+i$' },
        },
        {
          kind: 'piege',
          text:
            '$i^2 = 1$ est FAUX ! Par définition, $i^2=-1$ — c\'est tout l\'intérêt d\'avoir ' +
            'introduit $i$ : donner enfin une racine carrée à un nombre négatif.',
        },
        {
          kind: 'definition',
          label: 'Structure algébrique de ℂ',
          items: [
            'L\'addition et la multiplication se comportent dans ℂ exactement comme dans ℝ : ' +
              'toutes deux sont **associatives** et **commutatives**, ont un **élément ' +
              'neutre** (0 pour +, 1 pour ×), et la multiplication est **distributive** sur ' +
              'l\'addition. Tout complexe $z$ a un **opposé** $-z$, et tout complexe NON NUL a ' +
              'un **inverse** $1/z$. ℂ est donc, comme ℝ, un corps commutatif.',
          ],
        },
        {
          kind: 'piege',
          text:
            'Contrairement à ℝ, il n\'existe AUCUNE relation d\'ordre dans ℂ compatible avec ' +
            'les opérations : des écritures comme $z_1 < z_2$ ou $z > 0$ n\'ont tout simplement ' +
            'AUCUN sens pour des complexes non réels ! Seuls des nombres RÉELS (parties ' +
            'réelles, parties imaginaires, longueurs…) se comparent avec <, ≤, >, ≥ — jamais ' +
            'deux complexes quelconques entre eux.',
        },
        {
          kind: 'definition',
          label: 'Conjugué',
          items: [
            'Le conjugué de $z = a+bi$ est $\\bar{z} = a-bi$ : même partie réelle, partie ' +
              'imaginaire opposée.',
            '$z+\\bar{z} = 2a$ (réel) $\\quad z\\cdot\\bar{z} = a^2+b^2$ (réel positif ou nul)',
          ],
        },
        {
          kind: 'piege',
          text:
            'Le conjugué de $z$ n\'est PAS son opposé $-z$ ! Le conjugué change seulement le ' +
            'signe de la partie IMAGINAIRE ($a-bi$) ; l\'opposé change les DEUX signes ' +
            '($-a-bi$).',
        },
        { kind: 'subheading', text: 'Division de deux complexes' },
        {
          kind: 'definition',
          label: 'Formule générale de l\'inverse',
          items: [
            'Pour tout $z=a+bi$ NON NUL, l\'inverse de $z$ s\'obtient en multipliant par le ' +
              'conjugué : $\\dfrac{1}{z} = \\dfrac{\\bar{z}}{z\\bar{z}} = \\dfrac{a-bi}{a^2+b^2}$',
            'C\'est le même principe qui sert juste en dessous : $z\\cdot\\bar{z}$ est toujours ' +
              'réel (rappel ci-dessus), donc multiplier par $\\bar{z}$ fait disparaître $i$ du ' +
              'dénominateur.',
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Pour diviser par $c+di$, multiplie numérateur et dénominateur par le conjugué ' +
              'du **dénominateur**, $c-di$ : le dénominateur devient réel ($c^2+d^2$).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'multiplier par le conjugué du dénominateur', text: '$\\dfrac{1+i}{1-i} = \\dfrac{(1+i)(1+i)}{(1-i)(1+i)} = \\dfrac{2i}{2}$' }],
          result: { tag: 'résultat', text: '$i$' },
        },
        { kind: 'subheading', text: 'Puissances de i' },
        {
          kind: 'intuition',
          label: '×i, c\'est tourner d\'un quart de tour',
          text:
            'Multiplier par $i$, ce n\'est pas qu\'une manipulation algébrique : ' +
            'géométriquement, ça fait tourner le point d\'un quart de tour (90°) autour de ' +
            'l\'origine, toujours dans le même sens. Pars de 1, multiplie par $i$ : tu arrives ' +
            'en $i$. Encore une fois : tu arrives en $-1$. Encore : $-i$. Encore : retour à 1. ' +
            'Quatre quarts de tour, un tour complet — exactement le cycle de période 4 que tu ' +
            'vas retrouver juste en dessous.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1.5,
            xMax: 1.5,
            yMin: -1.5,
            yMax: 1.5,
            circle: { cx: 0, cy: 0, r: 1, tone: 'faint' },
            points: [
              { x: 1, y: 0, label: '1', tone: 'accent', labelPos: 'below' },
              { x: 0, y: 1, label: 'i', tone: 'accent', labelPos: 'right' },
              { x: -1, y: 0, label: '−1', tone: 'accent', labelPos: 'below' },
              { x: 0, y: -1, label: '−i', tone: 'accent', labelPos: 'right' },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 90, radiusPx: 26, label: '×i', tone: 'good' }],
            caption:
              'Les puissances de $i$ tournent de 90° à chaque multiplication : 4 positions sur ' +
              'le cercle unité, puis le cycle recommence.',
          },
        },
        {
          kind: 'methode',
          label: 'Cycle de période 4',
          items: [
            '$i^0=1 \\quad i^1=i \\quad i^2=-1 \\quad i^3=-i \\quad i^4=1$ puis le cycle recommence',
            'Pour calculer $i^n$, garde seulement le reste de la division de $n$ par 4.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'décomposer l\'exposant', text: '$2021 = 4 \\times 505 + 1$' }],
          result: { tag: 'résultat', text: '$i^{2021} = i^1 = i$' },
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier',
          text:
            'Pour vérifier un calcul sur des complexes, reviens à la forme $a+bi$ et identifie ' +
            'séparément partie réelle et partie imaginaire — ne les mélange jamais dans un ' +
            'même terme.',
        },
        {
          kind: 'entrainement',
          title: 'Opérations de base et puissances de i',
          generatorId: '6gen34',
          description: ['Entraîne-toi sur les additions, produits, quotients et puissances de i — jusqu\'au cycle de période 4.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 34. Opérations de base et puissances de i »',
        },
      ],
    },
    {
      id: 'affixesracines',
      number: 2,
      title: 'Affixes et racines carrées',
      kicker: 'affixe, plan d\'Argand, milieu, racine carrée',
      blocks: [
        {
          kind: 'intuition',
          label: 'Le plan complexe, comme une carte',
          text:
            'Pense à une carte, ou à un GPS : une position se donne par deux coordonnées, ' +
            'est-ouest et nord-sud. Dans le plan d\'Argand, c\'est pareil — la partie réelle ' +
            'joue le rôle de l\'est-ouest, la partie imaginaire celui du nord-sud. Chaque ' +
            'nombre complexe devient un point précis (ou une flèche depuis l\'origine), pas ' +
            'juste une formule abstraite avec un $i$ dedans.',
        },
        {
          kind: 'definition',
          label: 'Définition — affixe, plan d\'Argand',
          items: [
            'À tout nombre complexe $z=a+bi$, tu associes le point $M(a;b)$ du plan : $z$ est ' +
              'l\'**affixe** de $M$. Ce plan, muni des axes « Re » (partie réelle) et « Im » ' +
              '(partie imaginaire), s\'appelle le **plan d\'Argand**. Le vecteur $\\vec{OM}$ a ' +
              'la même affixe que le point $M$ ; plus généralement, le vecteur $\\vec{AB}$ a ' +
              'pour affixe $z_B - z_A$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1,
            xMax: 5,
            yMin: -1,
            yMax: 7,
            points: [
              { x: 1, y: 2, label: 'A', tone: 'accent', labelPos: 'left' },
              { x: 4, y: 6, label: 'B', tone: 'accent', labelPos: 'right' },
              { x: 2.5, y: 4, label: 'M', tone: 'good', labelPos: 'left' },
            ],
            vectors: [{ from: { x: 1, y: 2 }, to: { x: 4, y: 6 }, tone: 'accent' }],
            caption: "Affixes de $A$ et $B$, de leur milieu $M$, et distance $AB=|z_B-z_A|$.",
          },
        },
        {
          kind: 'methode',
          label: 'Milieu et distance',
          items: [
            '$z_M = \\dfrac{z_A+z_B}{2} \\qquad AB = |z_B - z_A|$',
            'La notation $|a+bi| = \\sqrt{a^2+b^2}$ désigne la LONGUEUR du vecteur d\'affixe ' +
              '$a+bi$ — c\'est simplement le théorème de Pythagore, appliqué dans le plan ' +
              'd\'Argand. Tu étudieras cette longueur pour elle-même à la section 4.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'zB−zA', text: 'Pour $z_A=1+2i$ et $z_B=4+6i$ : $z_B-z_A = 3+4i$' }],
          result: { tag: 'résultat', text: '$AB = \\sqrt{3^2+4^2} = 5$' },
        },
        {
          kind: 'piege',
          text:
            'La distance $AB$ utilise la DIFFÉRENCE des affixes ($|z_B-z_A|$), jamais leur ' +
            'somme ! $|z_A+z_B|$ n\'est la distance entre aucune paire de points simplement ' +
            'reliés à $A$ et $B$.',
        },
        { kind: 'subheading', text: 'Racine carrée d\'un nombre complexe' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Pour trouver $x+iy$ tel que $(x+iy)^2 = a+bi$ : développe $(x^2-y^2) + 2xyi = ' +
              'a+bi$, puis identifie les parties réelle et imaginaire. Une 3e équation ' +
              'apparaît en ÉLEVANT AU CARRÉ ces deux équations puis en les ADDITIONNANT membre ' +
              'à membre (démonstration ci-dessous) :',
            '$x^2-y^2 = a \\qquad 2xy = b \\qquad x^2+y^2 = \\sqrt{a^2+b^2}$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi la 3e équation débloque le système',
          blocks: [
            { kind: 'para', text: '$(x^2-y^2)^2 = a^2$ — 1re équation élevée au carré' },
            { kind: 'para', text: '$(2xy)^2 = b^2 \\implies 4x^2y^2 = b^2$ — 2e équation élevée au carré' },
            {
              kind: 'para',
              text:
                'Développe la 1re ligne : $x^4-2x^2y^2+y^4 = a^2$. En ADDITIONNANT cette ' +
                'égalité à $4x^2y^2=b^2$, les termes en $x^2y^2$ se recombinent en carré parfait :',
            },
            { kind: 'para', text: '$x^4+2x^2y^2+y^4 = a^2+b^2$ — somme des deux lignes précédentes' },
            { kind: 'para', text: '$(x^2+y^2)^2 = a^2+b^2$ — le membre de gauche est un carré parfait' },
            {
              kind: 'para',
              text:
                'Comme $x^2+y^2 \\ge 0$ (somme de deux carrés réels), tu peux prendre la ' +
                'racine carrée RÉELLE des deux membres sans ambiguïté de signe : $x^2+y^2 = ' +
                '\\sqrt{a^2+b^2}$. Tu as alors 3 équations linéaires en $x^2$ et $y^2$ (la 1re ' +
                'et cette nouvelle 3e), qui se résolvent par somme et différence — la 2e ' +
                'équation ne sert qu\'à la toute fin, pour fixer le signe RELATIF de $x$ et $y$.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'La 3e équation est $x^2+y^2 = \\sqrt{a^2+b^2}$ — avec la RACINE CARRÉE ! C\'est ' +
            '$(x^2+y^2)^2$ qui vaut $a^2+b^2$, pas $x^2+y^2$ tout seul. Oublier cette racine ' +
            'est l\'erreur classique.',
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu — 3+4i',
          steps: [
            { tag: 'carrés additionnés → 3e équation', text: '$\\sqrt{3^2+4^2}=5$, d\'où le système $x^2-y^2=3,\\ 2xy=4,\\ x^2+y^2=5$' },
            { tag: 'somme / différence', text: 'En additionnant/soustrayant : $x^2=4,\\ y^2=1$, donc $x=\\pm2,\\ y=\\pm1$' },
            { tag: 'signe relatif via 2xy=4>0', text: '$x$ et $y$ ont le MÊME signe' },
          ],
          result: { tag: 'racines carrées de 3+4i', text: '$\\pm(2+i)$' },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu, en détail — racines carrées de 5−12i',
          blocks: [
            { kind: 'para', text: 'Poser $z=x+iy$ dans $z^2=5-12i$ : $x^2-y^2+2xyi = 5-12i$' },
            { kind: 'para', text: 'Égaler parties réelle et imaginaire : $x^2-y^2=5$ (1) $\\quad 2xy=-12$ (2)' },
            { kind: 'para', text: 'Élever (1) et (2) au carré, puis additionner membre à membre : $(x^2+y^2)^2 = 5^2+12^2 = 169$' },
            { kind: 'para', text: '3e équation : $x^2+y^2 = \\sqrt{169} = 13$ (3)' },
            { kind: 'para', text: '(1)+(3), divisé par 2 : $x^2 = (5+13)/2 = 9$ — (3)−(1), divisé par 2 : $y^2 = (13-5)/2 = 4$' },
            { kind: 'para', text: 'D\'où $x=\\pm3,\\ y=\\pm2$. Signe relatif via (2) : $2xy=-12<0 \\implies x$ et $y$ de signes OPPOSÉS' },
            { kind: 'para', text: 'Conclusion : racines carrées de $5-12i$ : $z_1=3-2i$ et $z_2=-3+2i$' },
            { kind: 'para', text: 'Vérification : $(3-2i)^2 = 9-12i+4i^2 = 9-12i-4 = 5-12i$ ✓' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Toujours deux racines, opposées',
          text:
            'Un nombre complexe non nul a toujours EXACTEMENT deux racines carrées, opposées ' +
            'l\'une de l\'autre : si $z_0$ convient, $-z_0$ convient aussi (car $(-z_0)^2 = ' +
            'z_0^2$) — jamais une seule.',
        },
        {
          kind: 'entrainement',
          title: 'Affixes et racines carrées',
          generatorId: '6gen35',
          description: ['Calcule un milieu, une distance, ou les deux racines carrées d\'un nombre complexe grâce au système x²−y², 2xy, somme des carrés.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 35. Affixes et racines carrées »',
        },
      ],
    },
    {
      id: 'equationscomplexes',
      number: 3,
      title: 'Équations dans ℂ',
      kicker: 'Δ<0, deux solutions conjuguées ; équations bicarrées',
      blocks: [
        {
          kind: 'definition',
          label: 'Second degré à discriminant négatif',
          items: [
            'Pour $az^2+bz+c=0$ ($a,b,c$ réels), si $\\Delta<0$ : AUCUNE solution réelle, mais ' +
              'exactement DEUX solutions complexes, conjuguées l\'une de l\'autre :',
            '$z = \\dfrac{-b \\pm i\\sqrt{|\\Delta|}}{2a}$',
            'On écrit $\\Delta = -|\\Delta| = i^2|\\Delta|$, d\'où $\\sqrt{\\Delta} = ' +
              'i\\sqrt{|\\Delta|}$ — jamais de racine carrée réelle laissée sur un nombre ' +
              'négatif.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la même mise sous forme canonique que dans ℝ, poursuivie dans ℂ',
          blocks: [
            { kind: 'para', text: '$az^2+bz+c = a[z^2+\\dfrac{b}{a}z]+c$ — on factorise $a$ dans les 2 premiers termes' },
            { kind: 'para', text: '$= a[(z+\\dfrac{b}{2a})^2 - \\dfrac{b^2}{4a^2}]+c$ — carré parfait, identité $(u+v)^2=u^2+2uv+v^2$' },
            { kind: 'para', text: '$= a(z+\\dfrac{b}{2a})^2 - \\dfrac{b^2-4ac}{4a} = a(z+\\dfrac{b}{2a})^2 - \\dfrac{\\Delta}{4a}$ — on regroupe et on nomme $\\Delta=b^2-4ac$' },
            {
              kind: 'para',
              text:
                'L\'équation $az^2+bz+c=0$ équivaut donc à $(z+\\dfrac{b}{2a})^2 = ' +
                '\\dfrac{\\Delta}{4a^2}$. Jusqu\'ici, RIEN ne dépend du signe de $\\Delta$ — ' +
                'c\'est exactement la même identité que dans ℝ. La différence n\'apparaît ' +
                'qu\'à l\'étape suivante : dans ℝ, tu t\'arrêtes si $\\Delta<0$ (pas de racine ' +
                'carrée réelle) ; dans ℂ, tu continues, en écrivant $\\Delta/4a^2 = ' +
                'i^2|\\Delta|/4a^2$ — ce qui EST un carré parfait complexe : ' +
                '$(i\\sqrt{|\\Delta|}/2a)^2$. Tu en tires $z+b/2a = \\pm i\\sqrt{|\\Delta|}/2a$, ' +
                'd\'où la formule annoncée.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -4,
            xMax: 2,
            yMin: -3,
            yMax: 3,
            points: [
              { x: -1, y: 2, label: 'z₁', tone: 'accent', labelPos: 'above' },
              { x: -1, y: -2, label: 'z₂', tone: 'good', labelPos: 'below' },
              { x: -1, y: 0, label: '−1', tone: 'ink', labelPos: 'right' },
            ],
            vectors: [{ from: { x: -1, y: 2 }, to: { x: -1, y: -2 }, tone: 'faint', dashed: true }],
            caption:
              'Les 2 solutions complexes de $z^2+2z+5=0$, $z_1=-1+2i$ et $z_2=-1-2i=\\bar{z}_1$, ' +
              'sont symétriques par rapport à l\'axe réel — la partie réelle commune $-1$ ' +
              'marque leur milieu.',
          },
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'discriminant', text: '$z^2+2z+5=0$ : $\\Delta=4-20=-16$, $\\sqrt{|\\Delta|}=4$' }],
          result: { tag: 'résultat', text: '$z = \\dfrac{-2\\pm4i}{2} = -1\\pm2i$' },
        },
        { kind: 'subheading', text: 'Équations bicarrées' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Une équation bicarrée $az^4+bz^2+c=0$ se ramène à une équation du second degré ' +
              'grâce au changement de variable $u=z^2$. Chaque solution $u\\ne0$ te donne ' +
              'ensuite EXACTEMENT 2 valeurs de $z$ — ses 2 racines carrées.',
          ],
        },
        {
          kind: 'piege',
          text:
            'Le changement de variable est $u=z^2$, jamais $u=z$ (l\'équation resterait de ' +
            'degré 4) ! Et si une valeur de $u$ est NÉGATIVE, ses racines carrées sont ' +
            'simplement imaginaires pures — aucune raison de la rejeter, tu es dans ℂ.',
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'Pose $u=z^2$ dans $z^4-5z^2+4=0$ : $u^2-5u+4=0$ donne $u=1$ ou $u=4$, d\'où ' +
                '$z = \\pm1$ ou $\\pm2$ — 4 solutions réelles.',
            },
            {
              kind: 'para',
              text:
                'Pour $z^4+5z^2+4=0$ : ici $u^2+5u+4=0$ donne $u=-1$ ou $u=-4$, toutes deux ' +
                'négatives — les 4 solutions sont $z = \\pm i$ ou $\\pm2i$, purement ' +
                'imaginaires : aucune n\'est réelle.',
            },
          ],
        },
        {
          kind: 'definition',
          label: 'Théorème fondamental de l\'algèbre',
          items: [
            'Dans ℂ, tout polynôme de degré $n$ ($n\\ge1$) a exactement $n$ racines, comptées ' +
              'avec multiplicité — contrairement à ℝ, où un polynôme peut n\'avoir aucune ' +
              'racine réelle du tout.',
          ],
        },
        {
          kind: 'methode',
          label: 'Racines conjuguées d\'un polynôme réel',
          items: [
            'Si $z_0$ est une racine NON RÉELLE d\'un polynôme à coefficients RÉELS, son ' +
              'conjugué $\\bar{z}_0$ en est forcément une racine aussi. Tu peux alors ' +
              'factoriser : $a(z-z_0)(z-\\bar{z}_0)$.',
            'Ce produit redonne bien un polynôme à coefficients RÉELS en $z$, puisque ' +
              '$z_0+\\bar{z}_0$ et $z_0\\cdot\\bar{z}_0$ sont tous deux réels.',
          ],
        },
        {
          kind: 'piege',
          text:
            'Cette propriété exige des coefficients RÉELS ! Pour un polynôme à coefficients ' +
            'vraiment complexes, rien ne garantit que le conjugué d\'une racine en soit une ' +
            'aussi.',
        },
        {
          kind: 'entrainement',
          title: 'Équations dans ℂ',
          generatorId: '6gen36',
          description: ['Résous une équation du second degré à discriminant négatif, ou une équation bicarrée, dans ℂ.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 36. Équations dans ℂ »',
        },
      ],
    },
    {
      id: 'formetrigonometrique',
      number: 4,
      title: 'Forme trigonométrique, module, argument',
      kicker: 'module, argument, forme trigonométrique et exponentielle',
      blocks: [
        {
          kind: 'intuition',
          label: 'Le module, c\'est juste une distance',
          text:
            'Ne te laisse pas intimider par le mot « module » : $|z|$ répond simplement à la ' +
            'question « à quelle distance de l\'origine ? ». Tu la calcules exactement comme ' +
            'n\'importe quelle distance dans le plan, avec Pythagore — rien de neuf ici, ' +
            'seulement un nouveau nom pour une idée que tu maîtrises déjà.',
        },
        {
          kind: 'definition',
          label: 'Module et argument',
          items: [
            'Le **module** de $z=a+bi$ est sa distance à l\'origine : $|z| = \\sqrt{a^2+b^2}$, ' +
              'toujours positif ou nul — c\'est la même longueur qu\'à la section 2, pour la ' +
              'distance $AB=|z_B-z_A|$, qui reçoit ici enfin son nom. L\'**argument** $arg(z)$ ' +
              'est l\'angle (à $2\\pi$ près) entre l\'axe des réels positifs et le vecteur ' +
              '$\\vec{OM}$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1,
            xMax: 4,
            yMin: -1,
            yMax: 3,
            points: [{ x: 3, y: 2, label: 'M(z)', tone: 'accent', labelPos: 'right' }],
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 2 }, tone: 'accent' },
              { from: { x: 3, y: 2 }, to: { x: 3, y: 0 }, tone: 'faint', dashed: true },
              { from: { x: 3, y: 2 }, to: { x: 0, y: 2 }, tone: 'faint', dashed: true },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: deg(Math.atan2(2, 3)), radiusPx: 22, label: 'θ', tone: 'accent' }],
            caption: 'Module $r=|z|$ et argument $\\theta$ : $a=r\\cos\\theta$, $b=r\\sin\\theta$.',
          },
        },
        {
          kind: 'definition',
          label: 'Forme trigonométrique et forme exponentielle',
          items: [
            '$z = r(\\cos\\theta+i\\sin\\theta) = re^{i\\theta}$',
            'La seconde écriture, la forme exponentielle, vient directement de la formule ' +
              'd\'Euler : $e^{i\\theta}=\\cos\\theta+i\\sin\\theta$.',
          ],
        },
        {
          kind: 'piege',
          text:
            'Dans $z=r(\\cos\\theta+i\\sin\\theta)$, $r$ est TOUJOURS positif ou nul, jamais ' +
            'négatif ! C\'est l\'angle $\\theta$ qui code la position (le quadrant), pas le ' +
            'signe de $r$.',
        },
        { kind: 'subheading', text: 'Retrouver l\'argument depuis a et b' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Si $a>0$, $arg(z) = \\arctan(b/a)$ directement. Si $a<0$, tu dois AJOUTER (ou ' +
              'soustraire) $\\pi$ à cette valeur — sinon tu obtiens l\'argument du complexe ' +
              'opposé, pas celui de $z$.',
          ],
        },
        {
          kind: 'methode',
          label: 'Produit et quotient',
          items: [
            'Multiplier deux complexes MULTIPLIE leurs modules et ADDITIONNE leurs arguments. ' +
              'Diviser DIVISE les modules et SOUSTRAIT les arguments.',
            '$r_1e^{i\\theta_1} \\cdot r_2e^{i\\theta_2} = r_1r_2 e^{i(\\theta_1+\\theta_2)} ' +
              '\\qquad \\dfrac{r_1e^{i\\theta_1}}{r_2e^{i\\theta_2}} = \\dfrac{r_1}{r_2} e^{i(\\theta_1-\\theta_2)}$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi le produit additionne les arguments',
          blocks: [
            { kind: 'para', text: '$z_1z_2 = r_1(\\cos\\theta_1+i\\sin\\theta_1) \\cdot r_2(\\cos\\theta_2+i\\sin\\theta_2)$ — on part des deux formes trigonométriques' },
            { kind: 'para', text: '$= r_1r_2[\\cos\\theta_1\\cos\\theta_2 + i\\cos\\theta_1\\sin\\theta_2 + i\\sin\\theta_1\\cos\\theta_2 + i^2\\sin\\theta_1\\sin\\theta_2]$ — on développe le produit des 2 binômes, terme à terme (4 termes)' },
            { kind: 'para', text: '$= r_1r_2[(\\cos\\theta_1\\cos\\theta_2-\\sin\\theta_1\\sin\\theta_2) + i(\\sin\\theta_1\\cos\\theta_2+\\sin\\theta_2\\cos\\theta_1)]$ — on remplace $i^2$ par $-1$, puis on regroupe partie réelle / partie en $i$' },
            {
              kind: 'para',
              text:
                'Les deux parenthèses sont exactement les formules d\'addition trigonométrique ' +
                '— celles que la formule de Moivre redémontre par récurrence à la section 5 : ' +
                '$\\cos(\\theta_1+\\theta_2) = \\cos\\theta_1\\cos\\theta_2-' +
                '\\sin\\theta_1\\sin\\theta_2$ et $\\sin(\\theta_1+\\theta_2) = ' +
                '\\sin\\theta_1\\cos\\theta_2+\\sin\\theta_2\\cos\\theta_1$. D\'où $z_1z_2 = ' +
                'r_1r_2[\\cos(\\theta_1+\\theta_2)+i\\sin(\\theta_1+\\theta_2)]$ : c\'est de ' +
                'nouveau une forme trigonométrique valide (le facteur devant est bien ' +
                'positif), de module $r_1r_2$ et d\'argument $\\theta_1+\\theta_2$.',
            },
            {
              kind: 'para',
              text:
                'Pour le quotient, multiplie numérateur et dénominateur par le conjugué de ' +
                '$z_2$ : $z_1/z_2 = z_1\\bar{z}_2/(z_2\\bar{z}_2) = z_1\\bar{z}_2/r_2^2$. Or ' +
                '$\\bar{z}_2 = r_2(\\cos\\theta_2-i\\sin\\theta_2) = ' +
                'r_2(\\cos(-\\theta_2)+i\\sin(-\\theta_2))$, puisque $\\cos(-\\theta)=' +
                '\\cos\\theta$ et $\\sin(-\\theta)=-\\sin\\theta$ : le conjugué a donc le MÊME ' +
                'module $r_2$ et l\'argument OPPOSÉ $-\\theta_2$. Le produit $z_1\\bar{z}_2$ ' +
                'a alors pour module $r_1r_2$ et pour argument $\\theta_1-\\theta_2$ ' +
                '(démonstration ci-dessus) ; diviser par le réel positif $r_2^2$ divise le ' +
                'module par $r_2^2$ sans toucher l\'argument — d\'où le module final ' +
                '$r_1r_2/r_2^2 = r_1/r_2$.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -3,
            xMax: 4,
            yMin: -1,
            yMax: 7,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2 * Math.cos(PI / 3), y: 2 * Math.sin(PI / 3) }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 3 * Math.cos(PI / 6), y: 3 * Math.sin(PI / 6) }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 0, y: 6 }, tone: 'bad' },
            ],
            points: [
              { x: 2 * Math.cos(PI / 3), y: 2 * Math.sin(PI / 3), label: 'z₁', tone: 'accent', labelPos: 'left' },
              { x: 3 * Math.cos(PI / 6), y: 3 * Math.sin(PI / 6), label: 'z₂', tone: 'good', labelPos: 'right' },
              { x: 0, y: 6, label: 'z₁z₂', tone: 'bad', labelPos: 'left' },
            ],
            angleArcs: [
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 60, radiusPx: 16, label: 'θ₁', tone: 'accent' },
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 30, radiusPx: 28, label: 'θ₂', tone: 'good' },
            ],
            caption: 'Le produit $z_1z_2$ : les modules se multiplient, les arguments s\'additionnent.',
          },
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'multiplier modules et additionner arguments', text: 'Pour $z_1=2e^{i\\pi/3}$ et $z_2=3e^{i\\pi/6}$ : $z_1z_2 = (2\\times3)e^{i(\\pi/3+\\pi/6)}$' }],
          result: { tag: 'résultat', text: '$= 6e^{i\\pi/2}$' },
        },
        {
          kind: 'piege',
          text:
            'Les modules se MULTIPLIENT dans un produit ($2\\times3=6$), ils ne s\'additionnent ' +
            'JAMAIS ($2+3=5$ serait faux !). C\'est l\'inverse pour les arguments : ils ' +
            's\'ADDITIONNENT, ils ne se multiplient jamais.',
        },
        {
          kind: 'astuce',
          label: 'Angles remarquables',
          text:
            'Les multiples de $\\pi/6$ ou $\\pi/4$ sont dits « remarquables » : leur cosinus et ' +
            'leur sinus s\'expriment exactement (racines, fractions), sans aucune ' +
            'approximation décimale — retiens-les, ce sont les angles les plus utiles de tout ' +
            'le chapitre.',
        },
        {
          kind: 'featureTable',
          caption: 'Récapitulatif : effet de chaque opération sur module et argument',
          headers: ['Opération', 'Module', 'Argument (à 2π près)'],
          rows: [
            ['Conjugué $\\bar{z}$', '$|\\bar{z}|=|z|$', '$arg(\\bar{z})=-arg(z)$'],
            ['Opposé $-z$', '$|-z|=|z|$', '$arg(-z)=\\pi+arg(z)$'],
            ['Produit $z_1z_2$', '$|z_1z_2|=|z_1|\\cdot|z_2|$', '$arg(z_1z_2)=arg(z_1)+arg(z_2)$'],
            ['Inverse $1/z$', '$|1/z|=1/|z|$', '$arg(1/z)=-arg(z)$'],
            ['Puissance $z^n$', '$|z^n|=|z|^n$', '$arg(z^n)=n\\cdot arg(z)$'],
            ['Quotient $z_1/z_2$', '$|z_1/z_2|=|z_1|/|z_2|$', '$arg(z_1/z_2)=arg(z_1)-arg(z_2)$'],
          ],
        },
        {
          kind: 'entrainement',
          title: 'Forme trigonométrique, module et argument',
          generatorId: '6gen37',
          description: ['Calcule module et argument, convertis entre les formes algébrique/trigonométrique/exponentielle, et multiplie/divise des complexes sous forme exponentielle.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 37. Forme trigonométrique, module et argument »',
        },
      ],
    },
    {
      id: 'formulemoivre',
      number: 5,
      title: 'Formule de Moivre',
      kicker: '(cosθ+isinθ)ⁿ = cos(nθ)+isin(nθ)',
      blocks: [
        {
          kind: 'definition',
          label: 'Formule de Moivre',
          items: ['$(\\cos\\theta+i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$, pour tout entier $n$'],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1.3,
            xMax: 1.3,
            yMin: -1.3,
            yMax: 1.3,
            circle: { cx: 0, cy: 0, r: 1, tone: 'faint' },
            points: [
              { x: Math.cos((25 * PI) / 180), y: Math.sin((25 * PI) / 180), label: 'z', tone: 'accent', labelPos: 'right' },
              { x: Math.cos((75 * PI) / 180), y: Math.sin((75 * PI) / 180), label: 'z³', tone: 'good', labelPos: 'above' },
            ],
            angleArcs: [
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 25, radiusPx: 18, label: 'θ', tone: 'accent' },
              { cx: 0, cy: 0, fromDeg: 0, toDeg: 75, radiusPx: 36, label: '3θ', tone: 'good' },
            ],
            caption:
              'Élever à la puissance $n$ un point du cercle unité d\'angle $\\theta$ multiplie ' +
              'son angle par $n$ — ici $n=3$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — via la forme exponentielle',
          blocks: [
            { kind: 'para', text: '$\\cos\\theta+i\\sin\\theta = e^{i\\theta}$ — formule d\'Euler (section 4) : c\'est la définition même de $e^{i\\theta}$' },
            { kind: 'para', text: '$(\\cos\\theta+i\\sin\\theta)^n = (e^{i\\theta})^n$ — on élève les deux membres à la puissance $n$' },
            { kind: 'para', text: '$(e^{i\\theta})^n = e^{i\\theta}\\cdot e^{i\\theta}\\cdots e^{i\\theta}$ ($n$ facteurs) $= e^{i(\\theta+\\theta+\\ldots+\\theta)} = e^{in\\theta}$ — propriété des puissances : les exposants s\'additionnent, $n$ fois le même angle' },
            {
              kind: 'para',
              text:
                'Reste à réécrire $e^{in\\theta}$ sous forme trigonométrique : par la formule ' +
                'd\'Euler, appliquée cette fois à l\'angle $n\\theta$, $e^{in\\theta} = ' +
                '\\cos(n\\theta)+i\\sin(n\\theta)$. En combinant les deux bouts de la chaîne ' +
                'd\'égalités : $(\\cos\\theta+i\\sin\\theta)^n = \\cos(n\\theta)+i\\sin(n\\theta)$ ' +
                '— exactement la formule de Moivre.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration alternative — par récurrence sur n, sans passer par e^(iθ)',
          blocks: [
            { kind: 'para', text: '$(\\cos\\theta+i\\sin\\theta)^1 = \\cos(1\\cdot\\theta)+i\\sin(1\\cdot\\theta)$ — initialisation : vrai trivialement pour $n=1$' },
            { kind: 'para', text: 'Hérédité — tu supposes la propriété vraie au rang $n-1$ : $(\\cos\\theta+i\\sin\\theta)^{n-1} = \\cos((n-1)\\theta)+i\\sin((n-1)\\theta)$' },
            { kind: 'para', text: '$(\\cos\\theta+i\\sin\\theta)^n = (\\cos\\theta+i\\sin\\theta)^{n-1}\\cdot(\\cos\\theta+i\\sin\\theta)^1$ — tu sépares un facteur, pour appliquer l\'hypothèse de récurrence' },
            { kind: 'para', text: '$= [\\cos((n-1)\\theta)+i\\sin((n-1)\\theta)]\\cdot[\\cos\\theta+i\\sin\\theta]$ — tu remplaces le premier facteur par l\'hypothèse de récurrence' },
            {
              kind: 'para',
              text:
                'C\'est exactement le produit de deux complexes trigonométriques traité à la ' +
                'section 4 (module 1 ici, aux angles $(n-1)\\theta$ et $\\theta$) : il vaut ' +
                '$\\cos[(n-1)\\theta+\\theta]+i\\sin[(n-1)\\theta+\\theta] = ' +
                '\\cos(n\\theta)+i\\sin(n\\theta)$. La propriété est donc vraie au rang $n$ dès ' +
                'qu\'elle l\'est au rang $n-1$ ; comme elle est vraie au rang 1, elle est ' +
                'vraie pour tout entier $n\\ge1$ — c\'est le principe de récurrence.',
            },
          ],
        },
        { kind: 'subheading', text: 'Développer cos(nx) et sin(nx)' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Développe $(\\cos x+i\\sin x)^n$ par le binôme de Newton : $(\\cos x+i\\sin ' +
              'x)^n = \\sum_{k=0}^{n} C(n,k)\\cdot\\cos^{n-k}x\\cdot(i\\sin x)^k$',
            'Chaque terme contient $i^k$ : simplifie-le grâce au cycle de période 4 ' +
              '(section 1). Les termes à $k$ PAIR redonnent un réel (la partie $\\cos(nx)$) ; ' +
              'les termes à $k$ IMPAIR redonnent un imaginaire pur (la partie $i\\cdot\\sin(nx)$). ' +
              'Il ne reste plus qu\'à identifier les deux parties séparément.',
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central de cette technique',
          text:
            'Oublier UN SEUL signe issu d\'un $i^2$ ou $i^4$ (le traiter comme $+1$ au lieu de ' +
            '$-1$, par exemple) rend le résultat final faux — même si tous les autres termes ' +
            'sont exacts ! Chaque puissance de $i$ doit être résolue une par une.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n=2',
          blocks: [
            {
              kind: 'para',
              text:
                '$(\\cos x+i\\sin x)^2 = \\cos^2x + 2i\\sin x\\cos x + i^2\\sin^2x = ' +
                '(\\cos^2x-\\sin^2x) + i(2\\sin x\\cos x)$ :',
            },
            { kind: 'para', text: '$\\cos(2x) = \\cos^2x-\\sin^2x \\qquad \\sin(2x) = 2\\sin x\\cos x$' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — n=3',
          blocks: [
            {
              kind: 'para',
              text:
                'Développe $(\\cos x+i\\sin x)^3$ et sépare les termes à $k$ pair (0 et 2) de ' +
                'ceux à $k$ impair (1 et 3) :',
            },
            { kind: 'para', text: '$\\cos(3x) = \\cos^3x-3\\cos x\\sin^2x \\qquad \\sin(3x) = 3\\cos^2x\\sin x-\\sin^3x$' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Les coefficients ne dépendent jamais de x',
          text:
            'Les coefficients binomiaux $C(n,k)$ sont purement COMBINATOIRES : ils ne ' +
            'dépendent que de $n$ et $k$, jamais de l\'angle $x$ — exactement comme dans le ' +
            'développement classique de $(a+b)^n$.',
        },
        {
          kind: 'entrainement',
          title: 'Formule de Moivre',
          generatorId: '6gen38',
          description: ['Applique la formule de Moivre, et développe cos(nx)/sin(nx) grâce au binôme de Newton.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 38. Formule de Moivre »',
        },
      ],
    },
    {
      id: 'racinesniemes',
      number: 6,
      title: 'Racines n-ièmes d\'un nombre complexe',
      kicker: 'zₖ = r^{1/n}e^{i(θ+2kπ)/n} — polygone régulier',
      blocks: [
        {
          kind: 'definition',
          label: 'Formule générale',
          items: [
            'Les $n$ racines n-ièmes d\'un nombre complexe non nul $z=re^{i\\theta}$ sont : ' +
              '$z_k = r^{1/n}\\cdot e^{i(\\theta+2k\\pi)/n}$, pour $k=0,1,\\ldots,n-1$',
            'Pour trouver ces racines, tu dois d\'abord écrire $z$ sous forme trigonométrique ' +
              'ou exponentielle (module et argument) — il n\'existe aucune formule directe ' +
              'depuis $a+bi$ tout seul.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1.3,
            xMax: 1.3,
            yMin: -1.3,
            yMax: 1.3,
            circle: { cx: 0, cy: 0, r: 1, tone: 'faint' },
            polygon: { points: Array.from({ length: 6 }, (_, k) => ({ x: Math.cos((k * PI) / 3), y: Math.sin((k * PI) / 3) })), tone: 'accent' },
            points: Array.from({ length: 6 }, (_, k) => ({ x: Math.cos((k * PI) / 3), y: Math.sin((k * PI) / 3), tone: 'accent' as const })),
            caption:
              'Les 6 racines sixièmes de l\'unité, régulièrement réparties sur le cercle ' +
              'unité (angles espacés de $2\\pi/6$).',
          },
        },
        {
          kind: 'methode',
          label: 'Une répartition géométrique régulière',
          items: [
            'Toutes les racines partagent le MÊME module $r^{1/n}$ — seul l\'argument change ' +
              '— et se répartissent régulièrement sur un cercle de centre $O$ : l\'angle ' +
              'entre deux racines consécutives vaut toujours $2\\pi/n$. Relie-les entre elles ' +
              ': tu obtiens un polygone régulier à $n$ côtés, inscrit dans ce cercle.',
          ],
        },
        {
          kind: 'piege',
          text:
            'L\'espacement angulaire correct est en $2k\\pi$, pas $k\\pi$ — une erreur d\'un ' +
            'facteur 2 donnerait un espacement deux fois trop petit ! Au-delà de $k=n-1$, les ' +
            'angles se répètent modulo $2\\pi$ : il n\'y a jamais plus de $n$ racines ' +
            'distinctes.',
        },
        { kind: 'subheading', text: 'Racines n-ièmes de l\'unité' },
        {
          kind: 'definition',
          label: 'Cas particulier z=1 (r=1, θ=0)',
          items: ['racines n-ièmes de 1 : $e^{2ik\\pi/n}$, pour $k=0,1,\\ldots,n-1$'],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'Pour $n=4$ : les 4 racines quatrièmes de l\'unité sont $1, i, -1, -i$ — les 4 ' +
                'sommets d\'un carré. Pour $n=3$ : les 3 racines cubiques de l\'unité sont ' +
                '$1, e^{2i\\pi/3}, e^{4i\\pi/3}$ — un triangle équilatéral. Attention : $i$ ' +
                'et $-i$ sont des racines QUATRIÈMES, jamais cubiques !',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'La somme des racines n-ièmes de l\'unité vaut 0',
          text:
            'C\'est une identité classique, valable dès que $n\\ge2$ : géométriquement, leur ' +
            'isobarycentre est le centre du cercle, l\'origine $O$.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi cette somme est nulle',
          blocks: [
            { kind: 'para', text: '$S = \\sum_{k=0}^{n-1} e^{2ik\\pi/n} = \\sum_{k=0}^{n-1} (e^{2i\\pi/n})^k$ — pose $\\omega=e^{2i\\pi/n}$ : chaque racine est une puissance de $\\omega$' },
            { kind: 'para', text: '$S = 1+\\omega+\\omega^2+\\ldots+\\omega^{n-1}$ — somme géométrique de raison $\\omega$, $n$ termes' },
            { kind: 'para', text: '$(\\omega-1)\\cdot S = \\omega^n - 1$ — identité de la somme géométrique : $(\\omega-1)(1+\\omega+\\ldots+\\omega^{n-1}) = \\omega^n-1$ (les termes intermédiaires se télescopent)' },
            {
              kind: 'para',
              text:
                'Or $\\omega^n = (e^{2i\\pi/n})^n = e^{2i\\pi} = 1$ — formule de Moivre, ' +
                'section 5, ou simplement un tour complet du cercle — donc $\\omega^n-1 = 0$. ' +
                'Comme $n\\ge2$, $\\omega=e^{2i\\pi/n}\\ne1$ (l\'angle $2\\pi/n$ n\'est pas un ' +
                'multiple de $2\\pi$), donc $\\omega-1\\ne0$ : tu peux diviser, et $S = ' +
                '0/(\\omega-1) = 0$.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Racines n-ièmes d\'un nombre complexe',
          generatorId: '6gen39',
          description: ['Calcule les n racines n-ièmes d\'un nombre complexe, ou celles de l\'unité.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 39. Racines n-ièmes d\'un nombre complexe »',
        },
      ],
    },
    {
      id: 'transformationsplan',
      number: 7,
      title: 'Transformations du plan',
      kicker: 'translation, rotation, homothétie, similitude',
      blocks: [
        {
          kind: 'intuition',
          label: 'Une idée déjà familière : tourner, agrandir, glisser',
          text:
            'Translation, rotation, homothétie : tu connais déjà ces trois transformations ' +
            'depuis la géométrie. Ce qui change ici, c\'est l\'outil — au lieu de manipuler ' +
            'des coordonnées, UNE SEULE multiplication (ou addition) complexe suffit à décrire ' +
            'chacune d\'elles. Multiplier par un nombre de module 1, c\'est tourner ; ' +
            'multiplier par un réel, c\'est agrandir ou réduire ; additionner un complexe, ' +
            'c\'est glisser. Les nombres complexes ne sont pas là pour compliquer la ' +
            'géométrie — ils la rendent plus rapide à calculer.',
        },
        {
          kind: 'definition',
          label: 'Trois transformations de base',
          items: [
            '**Translation** de vecteur d\'affixe $b$ : $z\' = z+b$.',
            '**Rotation** de centre $\\Omega$ (affixe $z_0$) et d\'angle $\\theta$ : $z\' = ' +
              'e^{i\\theta}(z-z_0)+z_0$.',
            '**Homothétie** de centre $\\Omega$ et de rapport $k$ RÉEL : $z\' = k(z-z_0)+z_0$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1,
            xMax: 5,
            yMin: -1,
            yMax: 3,
            polygon: { points: [{ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 2 }], tone: 'faint' },
            points: [
              { x: 1, y: 1, label: 'M(z)', tone: 'accent', labelPos: 'left' },
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 1, label: 'A(c)', tone: 'good', labelPos: 'below' },
              { x: 4, y: 2, label: 'P(z+c)', tone: 'accent', labelPos: 'right' },
            ],
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'good' },
              { from: { x: 1, y: 1 }, to: { x: 4, y: 2 }, tone: 'accent', dashed: true },
            ],
            caption:
              "Addition $z+c$ = translation de vecteur d'affixe $c$ : $P$ est le 4e sommet du " +
              'parallélogramme $MOAP$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — l\'addition correspond à une translation',
          blocks: [
            { kind: 'para', text: '$M(z),\\ z=x+yi \\qquad A(c),\\ c=a+bi \\qquad P(z+c)$ — nomme les 3 points par leurs affixes' },
            { kind: 'para', text: '$z+c = (x+a)+(y+b)i$ — développe l\'affixe de $P$, partie réelle + partie imaginaire' },
            { kind: 'para', text: 'affixe de $\\vec{MP}$ = affixe($P$) − affixe($M$) = $(z+c) - z = c$ — rappel : l\'affixe d\'un vecteur $\\vec{UV}$ est affixe($V$)−affixe($U$) (section 2)' },
            { kind: 'para', text: 'affixe de $\\vec{OA}$ = affixe($A$) − affixe($O$) = $c - 0 = c$ — même calcul pour le vecteur de référence $\\vec{OA}$' },
            {
              kind: 'para',
              text:
                '$\\vec{MP}$ et $\\vec{OA}$ ont donc TOUJOURS la même affixe $c$, quel que soit ' +
                'le point $M$ de départ — ils sont donc toujours égaux comme vecteurs (même ' +
                'direction, même sens, même longueur). Deux vecteurs égaux, c\'est exactement ' +
                'dire que $P$ est l\'image de $M$ par la translation de vecteur $\\vec{OA}$ : ' +
                'c\'est la définition même d\'une translation. Comme ça vaut pour tout $M$, la ' +
                'transformation $z\\mapsto z+c$ tout entière EST cette translation.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1,
            xMax: 5,
            yMin: -1,
            yMax: 3,
            points: [
              { x: 1, y: 1, label: 'Ω', tone: 'ink', labelPos: 'below' },
              { x: 3.5, y: 1, label: 'M', tone: 'accent', labelPos: 'right' },
              { x: 1 + 2.5 * Math.cos((50 * PI) / 180), y: 1 + 2.5 * Math.sin((50 * PI) / 180), label: 'M′', tone: 'good', labelPos: 'above' },
            ],
            vectors: [
              { from: { x: 1, y: 1 }, to: { x: 3.5, y: 1 }, tone: 'accent' },
              { from: { x: 1, y: 1 }, to: { x: 1 + 2.5 * Math.cos((50 * PI) / 180), y: 1 + 2.5 * Math.sin((50 * PI) / 180) }, tone: 'good' },
            ],
            angleArcs: [{ cx: 1, cy: 1, fromDeg: 0, toDeg: 50, radiusPx: 20, label: 'θ', tone: 'accent' }],
            caption: 'Rotation de centre $\\Omega$ et d\'angle $\\theta$ : on ramène le centre à l\'origine, on tourne, on translate de retour.',
          },
        },
        {
          kind: 'piege',
          text:
            'Dans la formule de rotation, c\'est $(z-z_0)$ qu\'il faut utiliser, jamais ' +
            '$(z_0-z)$ ! Inverser l\'ordre revient à ajouter $\\pi$ à l\'angle appliqué. Le ' +
            'multiplicateur $e^{i\\theta}$ a toujours pour module 1 : une rotation conserve ' +
            'les distances.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi multiplier par un complexe combine rotation et homothétie',
          blocks: [
            { kind: 'para', text: 'Cas $z_0=0$ (centre $O$) : $z = \\rho(\\cos\\theta+i\\sin\\theta), \\ c = r(\\cos\\alpha+i\\sin\\alpha)$ — écris $z$ et le multiplicateur $c$ sous forme trigonométrique' },
            { kind: 'para', text: '$zc = r\\rho[\\cos(\\theta+\\alpha)+i\\sin(\\theta+\\alpha)]$ — formule du produit (section 4)' },
            {
              kind: 'para',
              text:
                'Le point d\'affixe $zc$ a donc pour module $r\\rho$ (celui de $z$, multiplié ' +
                'par $r=|c|$) et pour argument $\\theta+\\alpha$ (celui de $z$, augmenté de ' +
                '$\\alpha=arg(c)$). Ajouter $\\alpha$ à l\'argument SANS toucher au module, ' +
                'c\'est une rotation de centre $O$ et d\'angle $\\alpha$ ; multiplier ensuite ' +
                'le module par $r$ SANS toucher à l\'argument, c\'est une homothétie de ' +
                'centre $O$ et de rapport $r$. Les deux effets se produisent en même temps ' +
                'dans $zc$ : c\'est bien la composée des deux.',
            },
            { kind: 'para', text: 'Cas général (centre $\\Omega$ d\'affixe $z_0$) : $z\'-z_0 = c(z-z_0)$ — applique le cas $z_0=0$ ci-dessus au vecteur $\\vec{\\Omega M}$, d\'affixe $z-z_0$' },
            {
              kind: 'para',
              text:
                'Le vecteur $\\vec{\\Omega M}$ subit la rotation+homothétie de centre $O$ ' +
                'tout juste démontrée (tout vecteur peut se traiter comme si son origine ' +
                'était $O$) : il devient $\\vec{\\Omega M\'}$, d\'affixe $c(z-z_0)$. Il ne ' +
                'reste qu\'à retranslater l\'origine en $\\Omega$ (translation, ci-dessus) ' +
                'pour obtenir $z\' = z_0 + c(z-z_0)$ : exactement la formule annoncée en tête ' +
                'de section, avec $c=e^{i\\theta}$ pour une rotation pure, ou $c=k$ réel pour ' +
                'une homothétie pure.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Deux cas particuliers utiles',
          text:
            '$z\'=iz$ : comme $i=e^{i\\pi/2}$, c\'est la rotation de centre $O$ et d\'angle ' +
            '$\\pi/2$ (module 1 : pas d\'homothétie). $z\'=i^2z=-z$ : deux rotations de ' +
            '$\\pi/2$ composées, donc une rotation de $\\pi$ — c\'est la symétrie centrale de ' +
            'centre $O$ : $M$ et $M\'$ alignés avec $O$, à égale distance de part et d\'autre.',
        },
        {
          kind: 'definition',
          label: 'Similitude directe',
          items: [
            'Une similitude directe s\'écrit $z\' = az+b$, avec $a$ un complexe NON NUL. En ' +
              'écrivant $a = |a|e^{i\\theta}$, tu vois qu\'elle combine une rotation d\'angle ' +
              '$\\theta = arg(a)$ et une homothétie de rapport $|a|$, de même centre.',
            '$|a|$ = rapport d\'agrandissement $\\qquad arg(a)$ = angle de rotation',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Transformation', 'Condition sur a (dans z′=az+b)'],
          rows: [
            ['Translation', '$a=1$'],
            ['Rotation', '$|a|=1,\\ a\\ne1$'],
            ['Homothétie', '$a$ réel, $a\\ne0$, $a\\ne1$'],
            ['Similitude générale', '$a$ complexe quelconque, $a\\ne0$'],
          ],
        },
        {
          kind: 'methode',
          label: 'Retrouver le centre d\'une transformation',
          items: ['Pour $a\\ne1$, le centre $\\Omega$ est l\'unique point FIXE de la transformation : résous $z_0=az_0+b$, ce qui donne $z_0 = \\dfrac{b}{1-a}$.'],
        },
        {
          kind: 'astuce',
          label: 'Composer, c\'est multiplier les multiplicateurs',
          text:
            'Deux transformations de MÊME centre $\\Omega$ (multiplicateurs $a$ et $k$) ' +
            'commutent toujours : leur composée a pour multiplicateur $ak=ka$, puisque la ' +
            'multiplication complexe est commutative. En revanche, une rotation et une ' +
            'translation ne commutent PAS en général — l\'ordre de composition compte.',
        },
        {
          kind: 'entrainement',
          title: 'Transformations du plan via les nombres complexes',
          generatorId: '6gen40',
          description: ['Détermine l\'écriture complexe d\'une translation, rotation, homothétie ou similitude — ou retrouve le centre et le type d\'une transformation donnée.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 40. Transformations du plan via les nombres complexes »',
        },
      ],
    },
    {
      id: 'trianglescomplexes',
      number: 8,
      title: 'Propriétés géométriques de triangles',
      kicker: 'alignement, orthogonalité, isocèle, rectangle, équilatéral',
      blocks: [
        {
          kind: 'definition',
          label: 'Critères par un rapport d\'affixes',
          items: ['Pour des points $A,B,C$ distincts et des vecteurs non nuls d\'affixes $z_U, z_V$ :'],
        },
        {
          kind: 'featureTable',
          headers: ['Rapport', 'Signifie'],
          rows: [
            ['$\\dfrac{z_C-z_A}{z_B-z_A}$ réel', '$A,B,C$ alignés'],
            ['$\\dfrac{z_V}{z_U}$ réel', 'vecteurs colinéaires (parallèles)'],
            ['$\\dfrac{z_V}{z_U}$ imaginaire pur', 'vecteurs orthogonaux'],
          ],
        },
        {
          kind: 'piege',
          text:
            'Un rapport RÉEL signale un alignement (ou une colinéarité), un rapport ' +
            'IMAGINAIRE PUR signale une orthogonalité — les deux se confondent facilement, ' +
            'fais bien attention !',
        },
        {
          kind: 'methode',
          label: 'Triangle isocèle, rectangle',
          items: [
            '$ABC$ est isocèle en $A$ ⟺ $|z_B-z_A| = |z_C-z_A|$ — égalité des MODULES, jamais ' +
              'des complexes eux-mêmes ! (ça forcerait $B=C$).',
            '$ABC$ est rectangle en $A$ ⟺ $\\dfrac{z_B-z_A}{z_C-z_A}$ imaginaire pur ' +
              '(orthogonalité de $AB$ et $AC$).',
          ],
        },
        { kind: 'subheading', text: 'Construire un triangle équilatéral par rotation' },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1,
            xMax: 3,
            yMin: -1,
            yMax: 3,
            polygon: { points: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2 * Math.cos(PI / 3), y: 2 * Math.sin(PI / 3) }], tone: 'faint' },
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 2, y: 0, label: 'B', tone: 'accent', labelPos: 'below' },
              { x: 2 * Math.cos(PI / 3), y: 2 * Math.sin(PI / 3), label: 'F', tone: 'good', labelPos: 'above' },
            ],
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2, y: 0 }, tone: 'accent', tick: true },
              { from: { x: 0, y: 0 }, to: { x: 2 * Math.cos(PI / 3), y: 2 * Math.sin(PI / 3) }, tone: 'good', tick: true },
              { from: { x: 2, y: 0 }, to: { x: 2 * Math.cos(PI / 3), y: 2 * Math.sin(PI / 3) }, tone: 'bad', tick: true },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 60, radiusPx: 24, label: 'π/3', tone: 'accent' }],
            caption: '$OBF$ est équilatéral pour tout $B\\ne O$, avec $F=B\\cdot e^{i\\pi/3}$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le triangle OBF est équilatéral',
          blocks: [
            { kind: 'para', text: '$F = B\\cdot e^{i\\pi/3}$ — définition de $F$ : l\'image de $B$ par la rotation de centre $O$ et d\'angle $\\pi/3$' },
            { kind: 'para', text: '$OF = |F-0| = |B\\cdot e^{i\\pi/3}| = |B|\\cdot|e^{i\\pi/3}| = |B| = OB$ — module d\'un produit = produit des modules (section 4), et $|e^{i\\pi/3}|=1$' },
            { kind: 'para', text: 'Premier côté déjà acquis : une rotation conserve les distances au centre, donc $OF=OB$ — c\'était prévisible sans calcul, mais le calcul confirme la valeur commune.' },
            { kind: 'para', text: '$BF = |F-B| = |B\\cdot e^{i\\pi/3} - B| = |B|\\cdot|e^{i\\pi/3}-1|$ — mets $B$ en évidence, puis module d\'un produit = produit des modules' },
            { kind: 'para', text: 'Reste à évaluer $|e^{i\\pi/3}-1|$. Méthode générale, pour tout angle $\\theta$ : factorise par $e^{i\\theta/2}$.' },
            { kind: 'para', text: '$e^{i\\theta}-1 = e^{i\\theta/2}(e^{i\\theta/2}-e^{-i\\theta/2})$ — mise en évidence de $e^{i\\theta/2}$ (vérifiable en redéveloppant)' },
            { kind: 'para', text: '$e^{i\\theta/2}-e^{-i\\theta/2} = [\\cos(\\theta/2)+i\\sin(\\theta/2)] - [\\cos(\\theta/2)-i\\sin(\\theta/2)] = 2i\\sin(\\theta/2)$ — formule d\'Euler sur chaque terme, puis $\\cos(-x)=\\cos x$ et $\\sin(-x)=-\\sin x$' },
            {
              kind: 'para',
              text:
                'Donc $e^{i\\theta}-1 = 2i\\cdot e^{i\\theta/2}\\cdot\\sin(\\theta/2)$, un ' +
                'produit de trois facteurs dont tu connais chaque module : $|2i|=2$, ' +
                '$|e^{i\\theta/2}|=1$, et $\\sin(\\theta/2)$ est ici un réel. D\'où ' +
                '$|e^{i\\theta}-1| = 2|\\sin(\\theta/2)|$. Pour $\\theta=\\pi/3\\in]0;2\\pi[$, ' +
                '$\\sin(\\theta/2)=\\sin(\\pi/6)=1/2>0$, donc $|e^{i\\pi/3}-1| = 2\\times(1/2) = 1$.',
            },
            { kind: 'para', text: 'Conclusion : $BF = |B|\\times1 = |B| = OB = OF$ — les 3 côtés du triangle $OBF$ sont égaux, il est bien équilatéral, et ça marche pour n\'importe quel $B\\ne O$ de départ.' },
          ],
        },
        {
          kind: 'astuce',
          label: 'Loi des cosinus depuis les affixes',
          text:
            'Une fois les 3 longueurs d\'un triangle obtenues comme modules de différences ' +
            'd\'affixes, la loi des cosinus te permet de retrouver un angle — sans garantie ' +
            'que cet angle soit remarquable, même avec des côtés entiers (le seul type ' +
            'd\'exercice de ce chapitre vérifié par tolérance décimale plutôt que par égalité ' +
            'exacte).',
        },
        {
          kind: 'entrainement',
          title: 'Propriétés géométriques de triangles',
          generatorId: '6gen41',
          description: ['Détermine si des points sont alignés, si des vecteurs sont orthogonaux, ou reconnais un triangle isocèle, rectangle ou équilatéral — à partir de leurs affixes.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 41. Propriétés géométriques de triangles »',
        },
      ],
    },
    {
      id: 'problemesavances',
      number: 9,
      title: 'Nombres complexes : problèmes avancés',
      kicker: 'zⁿ réel/positif, lieux géométriques, transformations avancées',
      blocks: [
        {
          kind: 'definition',
          label: 'Quand zⁿ est-il réel ? réel positif ?',
          items: [
            'Pour $z=re^{i\\theta}$ non nul ($r>0$), $z^n = r^ne^{in\\theta}$ :',
            '$z^n$ réel ⟺ $n\\theta \\equiv 0 \\pmod{\\pi}$ ⟺ $\\theta \\equiv 0 \\ [\\pi/n]$',
            '$z^n$ réel POSITIF ⟺ $n\\theta \\equiv 0 \\pmod{2\\pi}$ ⟺ $\\theta \\equiv 0 \\ [2\\pi/n]$',
          ],
        },
        {
          kind: 'piege',
          text:
            '« Réel » (mod $\\pi$) et « réel POSITIF » (mod $2\\pi$) ne demandent PAS la même ' +
            'condition ! Un angle qui rend $z^n$ réel NÉGATIF vérifie $n\\theta \\equiv \\pi ' +
            '\\pmod{2\\pi}$, pas 0 — il satisfait la condition « réel » mais pas « réel ' +
            'positif ». Confondre les deux modules ($\\pi$ contre $2\\pi$) est l\'erreur la ' +
            'plus fréquente sur ce type d\'exercice.',
        },
        {
          kind: 'exemple',
          badge: 'Exemple résolu',
          steps: [{ tag: 'condition mod 2π, divisée par n=3', text: 'Pour $z=e^{i\\theta}$, $\\theta\\in[0;2\\pi[$, $z^3$ réel positif ⟺ $3\\theta \\equiv 0 \\pmod{2\\pi}$' }],
          result: { tag: 'résultat — 3 valeurs', text: '$\\theta \\in \\{0,\\ 2\\pi/3,\\ 4\\pi/3\\}$' },
        },
        {
          kind: 'definition',
          label: 'Lieux géométriques',
          items: ['Un point $M$ d\'affixe $z$ qui vérifie une condition sur $z-a$ (où $a$ est l\'affixe d\'un point fixe $A$) décrit une courbe simple, selon la nature de cette condition :'],
        },
        {
          kind: 'featureTable',
          headers: ['Condition', 'Lieu décrit'],
          rows: [
            ['$|z-a| = k$ ($k>0$)', 'cercle de centre $A$, rayon $k$'],
            ['$arg(z-a) \\equiv \\theta_0 \\pmod{2\\pi}$', 'demi-droite d\'origine $A$ (exclue), d\'angle $\\theta_0$'],
            ['$arg(z-a) \\equiv \\theta_0 \\pmod{\\pi}$', 'droite complète passant par $A$ (privée de $A$), de direction $\\theta_0$'],
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'complexPlane',
            xMin: -1,
            xMax: 4,
            yMin: -2,
            yMax: 3,
            circle: { cx: 1, cy: 1, r: 1.3, tone: 'accent' },
            points: [{ x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'left' }],
            vectors: [{ from: { x: 1, y: 1 }, to: { x: 1 + 2.2 * Math.cos((40 * PI) / 180), y: 1 + 2.2 * Math.sin((40 * PI) / 180) }, tone: 'good' }],
            caption:
              'Cercle $|z-a|=k$ et demi-droite $arg(z-a)\\equiv\\theta_0 \\pmod{2\\pi}$, tous ' +
              'deux issus du même point $A$.',
          },
        },
        {
          kind: 'piege',
          text:
            '« mod $2\\pi$ » ne retient qu\'UN SEUL des deux rayons opposés issus de $A$ — une ' +
            'DEMI-droite ; « mod $\\pi$ » retient les DEUX à la fois, ce qui forme une droite ' +
            'complète. Prendre « mod $\\pi$ » là où l\'énoncé impose « mod $2\\pi$ » ajoute au ' +
            'lieu la moitié qui ne convient pas !',
        },
        { kind: 'subheading', text: 'Une transformation qui conserve le cercle unité' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pour |a|≠1, si |z|=1 alors |z′|=1 avec z′ = (z−a)/(1−āz)',
          blocks: [
            { kind: 'para', text: 'Hypothèse : $|z|=1$, c\'est-à-dire $z\\cdot\\bar{z}=1$ — définition du module au carré (section 1), appliquée à $|z|=1$' },
            { kind: 'para', text: '$z\\cdot\\bar{z}=1 \\implies \\bar{z} = 1/z$ — divise les deux membres par $z$ (non nul, car $|z|=1$)' },
            { kind: 'para', text: 'Tu veux calculer $|z\'| = |z-a| / |1-\\bar{a}z|$. Le numérateur est déjà simple ; transforme le DÉNOMINATEUR pour faire apparaître ce même $|z-a|$.' },
            { kind: 'para', text: '$|1-\\bar{a}z| = |z|\\cdot|1/z-\\bar{a}|$ — mets $z$ en évidence dans $1-\\bar{a}z = z(1/z-\\bar{a})$, puis module d\'un produit' },
            { kind: 'para', text: '$= 1\\cdot|\\bar{z}-\\bar{a}| = |\\bar{z}-\\bar{a}|$ — $|z|=1$ (hypothèse), et $1/z=\\bar{z}$ (étape précédente)' },
            { kind: 'para', text: '$|\\bar{z}-\\bar{a}| = |\\overline{z-a}| = |z-a|$ — conjugué d\'une différence, puis même module (section 4)' },
            {
              kind: 'para',
              text:
                'En combinant toute la chaîne : $|1-\\bar{a}z| = |z-a|$ — le dénominateur vaut ' +
                'exactement le numérateur ! Donc $|z\'| = |z-a| / |z-a| = 1$ (le quotient est ' +
                'bien défini car $z\\ne a$ : sinon $|a|=|z|=1$, exclu par hypothèse). Tout ' +
                'point du cercle unité est donc envoyé par cette transformation sur un AUTRE ' +
                'point du cercle unité.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Toujours repartir de la définition du module',
          text:
            'Sur un problème avancé, la seule stratégie vraiment sûre reste d\'écrire $|u|^2 = ' +
            'u\\cdot\\bar{u}$ (ou, pour $|u|=1$, $\\bar{u}=1/u$) et de manipuler des égalités, ' +
            'plutôt que de deviner un résultat — les raccourcis mémorisés sur des cas ' +
            'particuliers ne se généralisent pas toujours.',
        },
        {
          kind: 'entrainement',
          title: 'Nombres complexes — problèmes avancés',
          generatorId: '6gen42',
          description: ['Détermine si un nombre complexe élevé à une puissance est réel ou réel positif, décris un lieu géométrique, ou démontre une propriété d\'une transformation complexe.'],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 42. Nombres complexes — problèmes avancés »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Définition** — $i^2=-1$, $z=a+bi$, conjugué $\\bar{z}=a-bi$.',
      '**Puissances de i** — cycle de période 4 : $1, i, -1, -i$.',
      '**Affixe** — $M(a;b) \\leftrightarrow z=a+bi$ ; $AB=|z_B-z_A|$.',
      '**Racine carrée** — système $x^2-y^2=a$, $2xy=b$, $x^2+y^2=|z|$ — toujours 2 racines opposées.',
      '**Δ<0** — $z = (-b\\pm i\\sqrt{|\\Delta|})/2a$, 2 solutions conjuguées.',
      '**Module, argument** — $|z|=\\sqrt{a^2+b^2}$, $z=re^{i\\theta}$ ; produit → modules ×, arguments +.',
      '**Moivre** — $(\\cos\\theta+i\\sin\\theta)^n = \\cos(n\\theta)+i\\sin(n\\theta)$.',
      '**Racines n-ièmes** — $z_k = r^{1/n}e^{i(\\theta+2k\\pi)/n}$, $k=0,\\ldots,n-1$ — polygone régulier.',
      '**Transformations** — $z\'=az+b$ : rotation $|a|=1$, homothétie $a$ réel, similitude sinon.',
      '**Alignement / orthogonalité** — rapport d\'affixes réel ↔ aligné ; imaginaire pur ↔ orthogonal.',
      '**Lieux géométriques** — $|z-a|=k$ → cercle ; $arg(z-a)$ mod $2\\pi$ → demi-droite, mod $\\pi$ → droite.',
    ],
    checklist: {
      items: [
        'Ai-je bien écrit une racine carrée d\'un nombre négatif avec $i$, jamais laissée telle quelle ?',
        'Pour un rapport d\'affixes : ai-je bien distingué « réel » (alignement/colinéarité) et « imaginaire pur » (orthogonalité) ?',
        'Pour un produit ou un quotient : ai-je multiplié/divisé les MODULES et additionné/soustrait les ARGUMENTS (jamais l\'inverse) ?',
        'Pour un lieu géométrique en argument : ai-je bien distingué mod $2\\pi$ (demi-droite) et mod $\\pi$ (droite complète) ?',
      ],
    },
    forward:
      'Le plan d\'Argand, le module et l\'argument reviennent dans les problèmes de synthèse ' +
      'qui combinent géométrie et algèbre — les nombres complexes offrent souvent le chemin ' +
      'le plus court vers une propriété qu\'une preuve purement géométrique rendrait longue ' +
      'et pénible.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz de révision — vrai ou faux sur tout le chapitre',
      generatorId: '6gen68',
      description: ['Choisis un thème et teste-toi sur tout le chapitre — affirmations pré-écrites, une seule tentative par question, justification toujours révélée.'],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 68. Quiz vrai/faux — Nombres complexes »',
    },
  },
}
