import type { ChapterSection, FormulaireGroupe, IllustrationSpec } from '../../../types'

/**
 * 5e (6h) — Nombres réels et suites, partie « Les suites ».
 * Squelette posé par le coordinateur (26/11/2026) : ids, numéros, titres FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Garder le marqueur `// ⟨fin-etape …⟩` en dernière ligne de chaque `blocks`.
 *
 * Rédaction : chantier B du cours (26/11/2026), d'après le manuel (synthèses 7 à 18, explorations 7 à 19,
 * exercices 12 à 35) et le chapitre « Suites » de la 5e (4h), réécrit pour la 6h. Toutes les valeurs numériques
 * sont recalculées (script `calc.py` du dossier de travail du chantier). Erreurs du manuel non reprises :
 * Malthus né en 1766 (pas 1755), « fractale » créé en 1975 (pas 1974), aire du carré tournant qui tend vers
 * 1 cm² (pas 0), renvois « chapitre n ». Pas de raisonnement par récurrence (seulement la définition par
 * récurrence) ; une durée inconnue en exposant se cherche avec la TABLE de la calculatrice, jamais par logarithme.
 */
const R = String.raw

/** Points du bord d'un carré de k points de côté (suite figurée « carrés creux »). */
function carreCreux(k: number): IllustrationSpec {
  const points: { x: number; y: number; tone: 'accent' }[] = []
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      if (i === 0 || j === 0 || i === k - 1 || j === k - 1) points.push({ x: i, y: j, tone: 'accent' })
    }
  }
  return {
    kind: 'vectorPlane',
    xMin: -0.6,
    xMax: 4.6,
    yMin: -0.6,
    yMax: 4.6,
    showAxes: false,
    points,
    caption: R`Figure ${String(k - 1)} : $${String(points.length)}$ points`,
  }
}

export const sectionsSuites: ChapterSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'definir-suite',
    number: 6,
    title: 'Définir et représenter une suite',
    kicker: 'formule explicite ou récurrence, suite = fonction sur ℕ₀',
    titreCourt: 'Définir une suite',
    partie: 'Les suites',
    essentiel: [
      R`Une **suite numérique** est une fonction définie sur $\mathbb{N}_0$ et à valeurs dans $\mathbb{R}$ : à chaque indice $n$, elle associe un **terme** $u_n$. Son graphique est formé de points isolés.`,
      R`On la définit par une **formule explicite** ($u_n$ en fonction de $n$) ou **par récurrence** (un terme en fonction du précédent, avec le premier terme). Quelques termes ne suffisent jamais à prouver une formule : c'est une conjecture.`,
      R`Récurrente affine $u_{n+1} = a\,u_n + b$, avec $a \neq 1$ : le point fixe $L = \dfrac{b}{1-a}$ vérifie $L = aL + b$, et l'écart $u_n - L$ est multiplié par $a$ à chaque pas. Si $|a| > 1$, toute erreur sur $u_1$ explose.`,
    ],
    cartes: [
      { question: R`$u_1 = 2$ et $u_{n+1} = \dfrac{u_n}{1+u_n}$ : premiers termes ?`, reponse: R`$2$ ; $\dfrac{2}{3}$ ; $\dfrac{2}{5}$ ; $\dfrac{2}{7}$ : on conjecture $u_n = \dfrac{2}{2n-1}$.` },
      { question: R`$u_n = n^2 + 3n$ : que vaut $u_{n+1}$ ?`, reponse: R`$(n+1)^2 + 3(n+1) = n^2 + 5n + 4$, et non $u_n + 1$.` },
      { question: R`Point fixe de $u_{n+1} = 0{,}7\,u_n + 3$ ?`, reponse: R`$L = \dfrac{3}{1 - 0{,}7} = 10$.` },
      { question: R`$u_1 = \dfrac{1}{7}$ et $u_{n+1} = 29\,u_n - 4$ : pourquoi la calculatrice donne-t-elle des termes faux ?`, reponse: R`La suite vaut toujours $\dfrac{1}{7}$, mais l'erreur d'arrondi sur $u_1$ est multipliée par $29$ à chaque pas.` },
    ],
    blocks: [
      { kind: 'video', title: 'Définir une suite : formule explicite, récurrence et représentation graphique' },
      { kind: 'subheading', text: 'Qu’est-ce qu’une suite numérique ?' },
      {
        kind: 'intuition',
        label: 'Pour visualiser',
        text: R`Imagine une rangée infinie de cases numérotées $1$, $2$, $3$… Chaque case contient un seul nombre : la case n° 1 contient $u_1$, la case n° 2 contient $u_2$, et ainsi de suite. Connaître la suite, c'est savoir ce que contient **chaque** case, aussi loin qu'on aille : jamais une case vide, jamais deux nombres dans la même case.`,
      },
      {
        kind: 'para',
        text: R`Une **suite numérique** est une liste ordonnée et infinie de nombres réels, numérotés par les naturels non nuls $1, 2, 3, \ldots$ ; l'ensemble de ces indices se note $\mathbb{N}_0$. Le premier terme se note $u_1$, le terme d'indice $n$ (le $n$-ième terme) se note $u_n$, et la suite entière $(u_n)_{n\in\mathbb{N}_0}$, ou plus simplement $(u_n)$. La lettre $u$ peut être remplacée par une autre ($v_n$, $a_n$…). On parle parfois de suite **finie** pour une liste qui s'arrête ; dans ce chapitre, « suite » veut toujours dire suite infinie.`,
      },
      {
        kind: 'definition',
        label: 'Définitions — suite numérique, terme, indice',
        items: [
          R`On appelle **suite numérique** toute fonction définie sur $\mathbb{N}_0$ et à valeurs dans $\mathbb{R}$. Elle se note $(u_n)_{n\in\mathbb{N}_0}$.`,
          R`On appelle **terme** d'une suite $(u_n)_{n\in\mathbb{N}_0}$ l'image d'un élément $n$ de $\mathbb{N}_0$ ; le naturel $n$ est l'**indice** (ou le **rang**) de ce terme, noté $u_n$.`,
        ],
      },
      {
        kind: 'para',
        text: R`Écrire $u_n$, c'est donc écrire $f(n)$ pour une fonction $f$ qui n'accepte que les naturels non nuls : on met l'indice en bas plutôt qu'entre parenthèses, par habitude. La suite $u_n = \dfrac{n}{n+1}$, c'est la fonction $f(x) = \dfrac{x}{x+1}$ regardée seulement en $x = 1, 2, 3, \ldots$`,
      },
      { kind: 'subheading', text: 'Deux façons de définir une suite' },
      {
        kind: 'rappel',
        label: 'Formule explicite ou récurrence',
        items: [
          R`**Formule explicite** : le **terme général** $u_n$ s'exprime directement en fonction de l'indice $n$. Ex. $u_n = \dfrac{n}{n+1}$ donne la suite $\left(\dfrac{1}{2}\,;\dfrac{2}{3}\,;\dfrac{3}{4}\,;\ldots\right)$ : on remplace $n$ par $1$, $2$, $3$…`,
          R`**Par récurrence** : un terme s'exprime en fonction du (ou des) terme(s) précédent(s). Il faut alors aussi donner le premier terme. Ex. $u_{n+1} = \dfrac{u_n}{1+u_n}$ et $u_1 = 2$ donnent la suite $\left(2\,;\dfrac{2}{3}\,;\dfrac{2}{5}\,;\ldots\right)$.`,
          R`Une formule explicite donne n'importe quel terme d'un coup ; une récurrence oblige à calculer tous les termes précédents.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'calculer des termes d’une suite explicite',
        formula: R`La suite $(u_n)$ est définie par $u_n = \dfrac{n}{n+1}$. Calcule $u_1$, $u_2$, $u_3$ et $u_{10}$, puis exprime $u_{n+1}$ en fonction de $n$.`,
        steps: [
          { tag: 'remplacer n par 1, 2, 3', text: R`$u_1 = \dfrac{1}{2}$, $u_2 = \dfrac{2}{3}$, $u_3 = \dfrac{3}{4}$` },
          { tag: 'un terme lointain, directement', text: R`$u_{10} = \dfrac{10}{11}$ : inutile de calculer $u_4$ à $u_9$.` },
          { tag: 'remplacer chaque n par (n + 1)', text: R`$u_{n+1} = \dfrac{n+1}{(n+1)+1} = \dfrac{n+1}{n+2}$` },
        ],
        result: { tag: 'résultat', text: R`La suite commence par $\dfrac{1}{2}$ ; $\dfrac{2}{3}$ ; $\dfrac{3}{4}$, $u_{10} = \dfrac{10}{11}$ et $u_{n+1} = \dfrac{n+1}{n+2}$.` },
      },
      {
        kind: 'attention',
        label: 'Attention — uₙ₊₁ n’est pas uₙ + 1, u₂ₙ n’est pas 2uₙ',
        text: R`L'indice est un **rang** : $u_{n+1}$ est le terme de rang $n+1$, obtenu en remplaçant **chaque** $n$ par $(n+1)$. Avec $u_n = n^2 + 3n$ : $u_{n+1} = (n+1)^2 + 3(n+1) = n^2 + 5n + 4$, alors que $u_n + 1 = n^2 + 3n + 1$. De même, $u_{2n} = (2n)^2 + 3 \times 2n = 4n^2 + 6n$ (le terme de rang $2n$), à ne pas confondre avec $2u_n = 2n^2 + 6n$ (le double du terme), ni $u_{n-1}$ avec $u_n - 1$.`,
      },
      {
        kind: 'exemple',
        badge: 'conjecturer une formule explicite à partir d’une récurrence',
        formula: R`La suite $(u_n)$ est définie par $u_1 = 2$ et $u_{n+1} = \dfrac{u_n}{1+u_n}$. Calcule ses quatre premiers termes, propose une formule explicite, puis contrôle-la sur le terme suivant.`,
        steps: [
          { tag: 'un terme à partir du précédent', text: R`$u_2 = \dfrac{2}{1+2} = \dfrac{2}{3}$, puis $u_3 = \dfrac{\frac{2}{3}}{1+\frac{2}{3}} = \dfrac{\frac{2}{3}}{\frac{5}{3}} = \dfrac{2}{5}$` },
          { tag: 'le quatrième terme', text: R`$u_4 = \dfrac{\frac{2}{5}}{1+\frac{2}{5}} = \dfrac{\frac{2}{5}}{\frac{7}{5}} = \dfrac{2}{7}$` },
          { tag: 'repérer la régularité', text: R`Numérateurs : toujours $2$. Dénominateurs : $1$, $3$, $5$, $7$, les nombres impairs ; le $n$-ième vaut $2n - 1$. Conjecture : $u_n = \dfrac{2}{2n-1}$.` },
          { tag: 'contrôler sur u₅', text: R`Par la formule : $u_5 = \dfrac{2}{9}$. Par la récurrence : $u_5 = \dfrac{\frac{2}{7}}{\frac{9}{7}} = \dfrac{2}{9}$. Les deux concordent.` },
        ],
        result: { tag: 'conjecture', text: R`$u_n = \dfrac{2}{2n-1}$, confirmée sur les cinq premiers termes.` },
      },
      {
        kind: 'attention',
        label: 'Attention — quelques termes ne prouvent pas une formule',
        text: R`Une formule qui marche de $u_1$ à $u_5$ reste une **conjecture** : rien ne garantit, à ce stade, qu'elle marche pour $u_{100}$. Pour en être sûr, il faut un raisonnement valable pour **tous** les rangs. Contrôler la conjecture sur des termes qu'on n'a pas utilisés pour la trouver (ici $u_5$) la rend plus crédible, sans la démontrer. Méfie-toi des régularités tirées trop vite de quelques nombres (voir « Le sais-tu ? » en fin d'étape).`,
      },
      { kind: 'subheading', text: 'Représenter une suite' },
      {
        kind: 'para',
        text: R`Comme une fonction, une suite se représente dans un repère par les points $(n\,;u_n)$. Mais $n$ ne prend que les valeurs $1, 2, 3, \ldots$ : le graphique d'une suite est formé de **points isolés**, qu'on ne relie jamais par un trait.`,
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'sequencePlot',
          points: [
            { n: 1, value: 2, label: '' },
            { n: 2, value: 2 / 3, label: '0,67' },
            { n: 3, value: 0.4, label: '0,4' },
            { n: 4, value: 2 / 7, label: '0,29' },
            { n: 5, value: 2 / 9, label: '0,22' },
            { n: 6, value: 2 / 11, label: '0,18' },
            { n: 7, value: 2 / 13, label: '0,15' },
            { n: 8, value: 2 / 15, label: '0,13' },
          ],
          connector: 'none',
          yTicks: [1, 2],
          xAxisLabel: 'n',
          yAxisLabel: 'u_n',
          caption: R`La suite $u_n = \dfrac{2}{2n-1}$ : des points isolés, qui se rapprochent de $0$ sans jamais l'atteindre.`,
        },
      },
      { kind: 'subheading', text: 'Suites figurées' },
      {
        kind: 'para',
        text: R`Certaines suites naissent d'un dessin : on construit des figures de points de plus en plus grandes et on compte les points de chaque figure. Pour trouver une formule, on compare deux figures **consécutives** (que faut-il ajouter pour passer de l'une à la suivante ?), puis on cherche à compter directement les points de la figure $n$.`,
      },
      { kind: 'illustrationGroup', items: [carreCreux(2), carreCreux(3), carreCreux(4), carreCreux(5)] },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — compter les points d’une suite figurée',
        blocks: [
          { kind: 'para', text: R`Les figures ci-dessus sont des carrés creux : la figure $n$ est le bord d'un carré de $n+1$ points de côté. On note $p_n$ le nombre de points de la figure $n$. Calcule $p_1$ à $p_4$, trouve comment passer d'une figure à la suivante, puis une formule explicite, et calcule $p_{100}$.` },
          { kind: 'para', text: R`**Compter.** $p_1 = 4$, $p_2 = 8$, $p_3 = 12$, $p_4 = 16$.` },
          { kind: 'para', text: R`**De proche en proche.** Chaque figure a un point de plus sur chacun de ses $4$ côtés : $p_{n+1} = p_n + 4$, avec $p_1 = 4$. C'est une définition par récurrence.` },
          { kind: 'para', text: R`**Formule explicite.** Le bord compte $4$ côtés de $n+1$ points, mais les $4$ coins sont comptés deux fois : $p_n = 4(n+1) - 4 = 4n$. Contrôle : $p_3 = 12$.` },
          { kind: 'para', text: R`**Conclusion.** $p_{100} = 400$ : la formule explicite donne ce terme directement, sans dessiner les $99$ figures précédentes.` },
        ],
      },
      {
        kind: 'featureTable',
        caption: R`D'autres suites figurées : la règle de passage et la formule explicite.`,
        headers: ['figures', 'premiers termes', 'pour passer à la suivante', 'formule'],
        rows: [
          ['croix (+1 point par branche)', R`$1$ ; $4$ ; $7$ ; $10$`, R`$+3$`, R`$p_n = 3n - 2$`],
          ['triangles (+1 rangée)', R`$1$ ; $4$ ; $9$ ; $16$`, R`$+3$, $+5$, $+7$…`, R`$p_n = n^2$`],
          ['rectangles n × (n + 2)', R`$3$ ; $8$ ; $15$ ; $24$`, R`$+5$, $+7$, $+9$…`, R`$p_n = n(n+2)$`],
        ],
      },
      { kind: 'subheading', text: 'Calculer des termes avec la calculatrice' },
      {
        kind: 'methode',
        label: 'Méthode — le menu Récurrence de la Casio Graph Math+',
        items: [
          R`Ouvre le menu **Récurrence** et choisis le type de relation où le terme suivant s'exprime en fonction du précédent : la calculatrice l'écrit $a_{n+1}$ en fonction de $a_n$ (sa suite s'appelle $a$, pas $u$).`,
          R`Entre la relation, par exemple $a_{n+1} = \dfrac{a_n}{1+a_n}$, puis règle la table : premier indice $1$, premier terme $a_1 = 2$, dernier indice voulu.`,
          R`Affiche la table des termes. Elle donne des valeurs décimales ($0{,}666\,666\ldots$ pour $\dfrac{2}{3}$) : reconnais les fractions si tu cherches une formule exacte.`,
          R`Pour une formule explicite, le menu **Table** suffit : entre la fonction de $x$ et fais varier $x$ de $1$ à $10$ par pas de $1$.`,
          R`Les intitulés des réglages peuvent varier d'une version à l'autre : contrôle toujours les premiers termes calculés à la main.`,
        ],
      },
      { kind: 'subheading', text: 'Reconnaître une régularité : ajouter ou multiplier ?' },
      {
        kind: 'para',
        text: R`Deux familles de suites reviendront sans cesse : les suites **arithmétiques**, où l'on passe d'un terme au suivant en **ajoutant** toujours le même nombre (étape 7), et les suites **géométriques**, où l'on **multiplie** toujours par le même nombre (étape 8). Avant de les étudier, apprends à les reconnaître.`,
      },
      {
        kind: 'methode',
        label: 'Méthode — reconnaître la nature d’une suite',
        items: [
          R`**Formule explicite** : calcule $u_{n+1} - u_n$ et $\dfrac{u_{n+1}}{u_n}$, puis simplifie. Un résultat constant (sans $n$) donne la raison ; si les deux dépendent de $n$, la suite n'est ni arithmétique ni géométrique.`,
          R`**Récurrence** : soustrais $u_n$ (ou divise par $u_n$) dans la relation. $u_{n+1} = 2(u_n + 3) - u_n$ se réduit à $u_{n+1} - u_n = 6$ : arithmétique. $u_{n+1} = 2u_n + 1$ donne $u_{n+1} - u_n = u_n + 1$, qui n'est pas constant.`,
          R`**Liste de termes** : calcule **tous** les écarts et **tous** les rapports. Un seul écart différent exclut « arithmétique ». Mais une liste finie ne prouve jamais la nature d'une suite : on dit seulement qu'elle est **compatible** avec une suite arithmétique ou géométrique.`,
          R`**Mesures arrondies** : des écarts ou des rapports qui ne diffèrent que dans les derniers chiffres (ceux que l'arrondi rend incertains) sont compatibles avec une raison constante ; on donne alors une raison **environ** égale à une valeur.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'des mesures arrondies : raison environ 0,78',
        formula: R`On envoie un faisceau de rayons X d'intensité $2{,}40$ unités à travers des plaques d'un même matériau. Après $1$, $2$, $3$ et $4$ cm de matériau, on mesure, arrondies au centième, les intensités $1{,}87$ ; $1{,}46$ ; $1{,}14$ ; $0{,}89$. Ces mesures sont-elles compatibles avec une suite arithmétique ? avec une suite géométrique ?`,
        steps: [
          { tag: 'les écarts', text: R`$1{,}87 - 2{,}40 = -0{,}53$, puis $-0{,}41$ ; $-0{,}32$ ; $-0{,}25$ : nettement différents, la suite n'est pas arithmétique.` },
          { tag: 'les rapports', text: R`$\dfrac{1{,}87}{2{,}40} \approx 0{,}779$ ; $\dfrac{1{,}46}{1{,}87} \approx 0{,}781$ ; $\dfrac{1{,}14}{1{,}46} \approx 0{,}781$ ; $\dfrac{0{,}89}{1{,}14} \approx 0{,}781$` },
          { tag: 'tenir compte de l’arrondi', text: R`Les mesures sont arrondies au centième : des rapports qui ne diffèrent qu'à la troisième décimale sont compatibles avec un rapport constant.` },
        ],
        result: { tag: 'résultat', text: R`Compatible avec une suite géométrique de raison **environ** $0{,}78$ : chaque centimètre laisse passer environ $78\,\%$ de l'intensité. Contrôle : $2{,}40 \times 0{,}78^4 \approx 0{,}89$.` },
      },
      { kind: 'subheading', text: 'Suite récurrente affine et point fixe' },
      {
        kind: 'para',
        text: R`Une suite peut être définie par une récurrence de la forme $u_{n+1} = a\,u_n + b$, avec $a \neq 1$ (sinon on ajoute toujours $b$ : suite arithmétique) et $b \neq 0$ (sinon on multiplie toujours par $a$ : suite géométrique). C'est une **suite récurrente affine**. On la rencontre dès qu'une grandeur perd ou gagne une fraction d'elle-même à chaque étape, tout en recevant (ou en perdant) une quantité fixe : une dose de médicament partiellement éliminée puis renouvelée, une pollution partiellement filtrée puis réémise, une dette qui produit des intérêts et qu'on rembourse par mensualités.`,
      },
      {
        kind: 'rappel',
        label: 'Point fixe d’une récurrence affine',
        items: [
          R`On appelle **point fixe** de la récurrence $u_{n+1} = a\,u_n + b$ le nombre $L$ tel que $L = aL + b$ : $L(1 - a) = b$, donc $L = \dfrac{b}{1-a}$ (on peut diviser car $a \neq 1$).`,
          R`Si $u_1 = L$, tous les termes valent $L$ : la suite est constante. Sinon, tout dépend de $a$ (démonstration ci-dessous).`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — l’écart au point fixe est multiplié par a à chaque pas',
        blocks: [
          { kind: 'para', text: R`**1.** Pose $v_n = u_n - L$ : l'écart entre le terme $u_n$ et le point fixe $L$.` },
          { kind: 'para', text: R`**2.** Comme $L = aL + b$, on peut écrire $b = L - aL$. Alors $v_{n+1} = u_{n+1} - L = a\,u_n + b - L$.` },
          { kind: 'para', text: R`**3.** En remplaçant $b$ : $v_{n+1} = a\,u_n + L - aL - L = a\,u_n - aL$, soit $v_{n+1} = a(u_n - L) = a\,v_n$.` },
          { kind: 'para', text: R`**Conclusion.** À chaque pas, l'écart au point fixe est **multiplié par** $a$ : la suite des écarts est géométrique de raison $a$ (étape 8), et $u_n = L + (u_1 - L)\,a^{n-1}$. Si $|a| < 1$, l'écart rétrécit et la suite se rapproche de $L$ (étape 9) ; si $|a| > 1$, il grandit, et la suite s'éloigne de $L$ dès que $u_1 \neq L$.` },
        ],
      },
      {
        kind: 'exemple',
        badge: 'dilution répétée dans un aquarium',
        formula: R`La concentration d'un produit dans un aquarium (en mg/L) suit la récurrence $u_{n+1} = 0{,}7\,u_n + 3$, avec $u_1 = 1$ : chaque semaine, $30\,\%$ du produit est filtré, puis un apport extérieur réintroduit $3$ mg/L. Calcule le point fixe, les premiers termes et les écarts au point fixe, puis $u_{10}$.`,
        steps: [
          { tag: 'point fixe', text: R`$L = \dfrac{3}{1 - 0{,}7} = \dfrac{3}{0{,}3} = 10$` },
          { tag: 'premiers termes', text: R`$u_2 = 0{,}7 \times 1 + 3 = 3{,}7$, puis $u_3 = 5{,}59$ et $u_4 = 6{,}913$` },
          { tag: 'écarts au point fixe', text: R`$v_1 = 1 - 10 = -9$, $v_2 = 3{,}7 - 10 = -6{,}3 = 0{,}7 \times (-9)$ : l'écart est bien multiplié par $0{,}7$.` },
          { tag: 'un terme lointain', text: R`$u_n = 10 - 9 \times 0{,}7^{\,n-1}$, donc $u_{10} = 10 - 9 \times 0{,}7^9 \approx 9{,}64$` },
        ],
        result: { tag: 'résultat', text: R`La concentration monte vers $10$ mg/L sans l'atteindre : chaque semaine, l'écart à $10$ perd $30\,\%$ de sa valeur ; $u_{10} \approx 9{,}64$ mg/L.` },
        illustration: {
          kind: 'sequencePlot',
          points: [
            { n: 1, value: 1, label: '' },
            { n: 2, value: 3.7, label: '3,7' },
            { n: 3, value: 5.59, label: '5,59' },
            { n: 4, value: 6.913, label: '6,91' },
            { n: 5, value: 7.8391, label: '7,84' },
            { n: 6, value: 8.48737, label: '8,49' },
            { n: 7, value: 8.941159, label: '8,94' },
            { n: 8, value: 9.2588113, label: '9,26' },
            { n: 9, value: 9.48116791, label: '9,48' },
          ],
          connector: 'none',
          yTicks: [1, 5, 10],
          referenceLine: { value: 10, label: 'L=10' },
          xAxisLabel: 'n',
          yAxisLabel: 'u_n',
          caption: R`$u_{n+1} = 0{,}7\,u_n + 3$, $u_1 = 1$ : les termes se rapprochent du point fixe $L = 10$ sans jamais l'atteindre.`,
        },
      },
      {
        kind: 'attention',
        label: 'Attention — un point fixe n’est une limite que si |a| < 1',
        text: R`La formule $L = \dfrac{b}{1-a}$ donne toujours un nombre, quel que soit $a \neq 1$. Mais ce nombre n'est la valeur vers laquelle la suite se stabilise que si $|a| < 1$. Si $|a| \geq 1$ (et $u_1 \neq L$), l'écart au point fixe ne rétrécit pas : la suite ne s'en rapproche pas. Vérifie toujours $|a|$ avant d'interpréter $L$.`,
      },
      {
        kind: 'atelier',
        tag: 'suite-recurrente-affine-widget',
        label: 'Manipule toi-même — le point fixe en direct',
        caption:
          'Fais glisser a au-delà de 1 (ou en dessous de −1) : la formule donne toujours un nombre L, mais la ligne ' +
          'passe en rouge et les termes ne s’en rapprochent plus. Pour a = −1, la suite oscille entre deux valeurs. ' +
          'Dans l’onglet « Toile d’araignée », le point fixe est l’intersection des droites y = a·x + b et y = x, et ' +
          'le chemin de la récurrence forme un escalier (0 < a < 1) ou une spirale (−1 < a < 0) qui s’y resserre. ' +
          'Sous le graphique, les écarts vₙ = uₙ − L sont multipliés par a à chaque étape.',
      },
      {
        kind: 'application',
        titre: 'Une dose de médicament qui s’installe dans l’organisme',
        text: R`Un patient prend $400$ mg d'un médicament toutes les $12$ heures ; entre deux prises, son organisme en élimine les trois quarts. Juste après la $n$-ième prise, la quantité présente $q_n$ (en mg) vérifie $q_{n+1} = 0{,}25\,q_n + 400$, avec $q_1 = 400$ : $400$, puis $500$, $525$, $531{,}25$… Le point fixe vaut $\dfrac{400}{1 - 0{,}25} \approx 533{,}3$ mg, et $|0{,}25| < 1$ : après quelques prises, la quantité se stabilise autour de cette valeur, qu'on appelle l'**état d'équilibre**. Les pharmacologues choisissent la dose et l'intervalle entre les prises pour que cet équilibre tombe dans la zone où le médicament agit sans être toxique.`,
        domaines: ['Médecine', 'Pharmacologie'],
        illustrations: [
          {
            kind: 'sequencePlot',
            points: [
              { n: 1, value: 400, label: '400' },
              { n: 2, value: 500, label: '500' },
              { n: 3, value: 525, label: '525' },
              { n: 4, value: 531.25, label: '531' },
              { n: 5, value: 532.8125, label: '533' },
              { n: 6, value: 533.203125, label: '533' },
            ],
            connector: 'none',
            referenceLine: { value: 1600 / 3, label: 'L' },
            xAxisLabel: 'prise n',
            yAxisLabel: 'q_n (mg)',
            caption: R`Quantité juste après chaque prise : $q_{n+1} = 0{,}25\,q_n + 400$ se stabilise près de $533{,}3$ mg.`,
          },
        ],
      },
      { kind: 'subheading', text: 'Calculatrice… prudence !' },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — une suite constante que la calculatrice fait exploser',
        blocks: [
          { kind: 'para', text: R`On considère la suite définie par $u_1 = \dfrac{1}{7}$ et $u_{n+1} = 29\,u_n - 4$. Calcule ses premiers termes à la main, puis à partir d'une valeur décimale de $\dfrac{1}{7}$. Explique ce que l'on observe.` },
          { kind: 'para', text: R`**À la main.** $u_2 = 29 \times \dfrac{1}{7} - 4 = \dfrac{29}{7} - \dfrac{28}{7} = \dfrac{1}{7}$ : on retombe sur $u_1$, et ainsi de suite. Tous les termes valent $\dfrac{1}{7}$ : la suite est **constante**. Normal : le point fixe vaut $L = \dfrac{-4}{1 - 29} = \dfrac{1}{7}$, et $u_1 = L$.` },
          { kind: 'para', text: R`**Avec une valeur arrondie.** Si l'on part de $u_1 = 0{,}142\,857$ (six décimales), on obtient :` },
          {
            kind: 'featureTable',
            headers: ['n', 'uₙ calculé à partir de 0,142 857', 'valeur exacte'],
            rows: [
              ['1', R`$0{,}142\,857$`, R`$\dfrac{1}{7}$`],
              ['2', R`$0{,}142\,853$`, R`$\dfrac{1}{7}$`],
              ['3', R`$0{,}142\,737$`, R`$\dfrac{1}{7}$`],
              ['4', R`$0{,}139\,373$`, R`$\dfrac{1}{7}$`],
              ['5', R`$0{,}041\,817$`, R`$\dfrac{1}{7}$`],
              ['6', R`$-2{,}787$`, R`$\dfrac{1}{7}$`],
              ['7', R`$-84{,}83$`, R`$\dfrac{1}{7}$`],
            ],
          },
          { kind: 'para', text: R`**Explication.** L'écart $v_n = u_n - \dfrac{1}{7}$ est multiplié par $a = 29$ à chaque pas (démonstration ci-dessus). Au départ, $v_1 = 0{,}142\,857 - \dfrac{1}{7} \approx -1{,}4 \times 10^{-7}$ : invisible. Mais après $4$ pas, il a été multiplié par $29^4 = 707\,281$, donc $v_5 \approx -0{,}10$ ; après $6$ pas, par $29^6 \approx 5{,}9 \times 10^{8}$, donc $v_7 \approx -85$.` },
          { kind: 'para', text: R`**Et la calculatrice ?** Elle travaille avec une quinzaine de chiffres, pas une infinité : dans le menu Récurrence, $\dfrac{1}{7}$ devient une valeur décimale très proche, mais pas égale. L'erreur de départ est minuscule ; multipliée par $29$ à chaque pas, elle finit toujours par devenir visible, puis énorme. Avec dix décimales ($0{,}142\,857\,142\,9$), les termes valent déjà environ $0{,}168$ au rang $7$ et $21{,}6$ au rang $9$.` },
          { kind: 'para', text: R`**Morale.** Une récurrence $u_{n+1} = a\,u_n + b$ avec $|a| > 1$ amplifie la moindre erreur : son point fixe est **instable**. Ce que donne une machine se contrôle par le raisonnement (ici, le point fixe), jamais l'inverse.` },
        ],
      },
      {
        kind: 'historique',
        titre: 'Une suite n’est pas déterminée par ses premiers termes',
        text: R`Les tests psychotechniques demandent souvent de « continuer la suite » $2$, $3$, $5$… Mais quelques termes ne suffisent **jamais** à déterminer une suite : on peut toujours trouver une règle qui les donne, puis n'importe quoi ensuite. $2$, $3$, $5$, $7$, $11$ : les nombres premiers. $2$, $3$, $5$, $8$, $13$ : chaque terme est la somme des deux précédents. $2$, $3$, $5$, $8$, $12$ : on ajoute $1$, puis $2$, puis $3$, puis $4$. Et la formule $u_n = \dfrac{(n-1)^3 + 5(n-1)}{6} + 2$ donne $2$, $3$, $5$, $9$, $16$, $27$. Avec un polynôme de degré assez grand, on peut même imposer n'importe quelle valeur au quatrième terme. Ce que l'examinateur attend, c'est la règle qu'il juge « la plus simple » : une préférence humaine, pas une obligation mathématique.`,
      },
      {
        kind: 'entrainement',
        title: 'Définir et reconnaître une suite',
        generatorId: '56gen3',
        description: [
          'Exprime uₙ₊₁, u₂ₙ ou uₙ₋₁ à partir d’une formule explicite, calcule les premiers termes d’une suite ' +
            'récurrente, puis décide si une suite (formule, récurrence, liste de termes ou mesures arrondies) est ' +
            'arithmétique, géométrique ou ni l’une ni l’autre, et donne sa raison.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Définir et reconnaître une suite »',
      },
      {
        kind: 'entrainement',
        title: 'Suite récurrente affine et régime permanent',
        generatorId: '56gen12',
        description: [
          'Pose la récurrence uₙ₊₁ = a·uₙ + b à partir d’un contexte (dosage, dilution, population, dette), calcule ' +
            'son point fixe et les termes suivants, et décide si la suite s’en rapproche. Avec |a| > 1, observe ce que ' +
            'devient une petite erreur sur u₁ : le point fixe est instable.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Suite récurrente affine et régime permanent »',
      },
      {
        kind: 'atelier',
        tag: 'calculatrice-prudence-widget',
        label: 'Manipule toi-même : calculatrice… prudence !',
        caption:
          'La suite définie par u₁ = 1⁄7 et uₙ₊₁ = 29uₙ − 4 est constante : 29 · 1⁄7 − 4 = 1⁄7. Mais si on tape u₁ arrondi à k décimales, l’écart avec 1⁄7 est multiplié par 29 à chaque pas, et les termes calculés finissent par s’envoler, même avec quinze décimales.',
      },
      // ⟨fin-etape definir-suite⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'suites-arithmetiques',
    number: 7,
    title: 'Suites arithmétiques',
    kicker: 'uₙ = u₁ + (n − 1)r, somme et symbole Σ',
    titreCourt: 'Suites arithmétiques',
    partie: 'Les suites',
    essentiel: [
      R`Une suite est **arithmétique** de raison $r$ si $u_{n+1} = u_n + r$ pour tout $n \in \mathbb{N}_0$ : $u_n = u_1 + (n-1)r$ et $u_m - u_n = (m-n)r$. Ses points sont isolés et alignés : croissance **linéaire**.`,
      R`Chaque terme (sauf le premier) est la **moyenne arithmétique** de ses deux voisins. Somme des $n$ premiers termes : $S_n = \dfrac{n(u_1+u_n)}{2}$ ; de $u_p$ à $u_n$, il y a $n - p + 1$ termes.`,
      R`$\sum\limits_{i=1}^{n} u_i$ se lit « somme, pour $i$ allant de $1$ à $n$, de $u_i$ ». Une somme se coupe en morceaux et un facteur constant sort du $\Sigma$, mais $\sum\limits_{i=1}^{n} c = nc$.`,
    ],
    cartes: [
      { question: R`$u_7 = 25$ et $u_{12} = 45$ : raison et premier terme ?`, reponse: R`$5r = 20$, donc $r = 4$ et $u_1 = 25 - 6 \times 4 = 1$.` },
      { question: R`Combien de termes de $u_5$ à $u_{20}$ ?`, reponse: R`$20 - 5 + 1 = 16$ termes, et non $15$.` },
      { question: R`Que vaut $\sum\limits_{i=1}^{12} (1 - 2i)$ ?`, reponse: R`$12 - 2 \times \dfrac{12 \times 13}{2} = 12 - 156 = -144$.` },
      { question: 'Pourquoi les points d’une suite arithmétique sont-ils alignés ?', reponse: R`D'un point au suivant, on avance toujours de $1$ en $n$ et de $r$ en $u_n$ : ils sont sur une droite de pente $r$.` },
    ],
    blocks: [
      { kind: 'video', title: 'Suites arithmétiques : raison, terme général, somme et symbole Σ' },
      {
        kind: 'definition',
        label: 'Définition — suite arithmétique',
        items: [
          R`Soit $r$ un nombre réel. On appelle **suite arithmétique de raison** $r$ toute suite $(u_n)_{n\in\mathbb{N}_0}$ telle que $\forall n \in \mathbb{N}_0 : u_{n+1} = u_n + r$.`,
          R`La **raison** est la différence constante entre deux termes consécutifs : $r = u_{n+1} - u_n$. C'est le nombre (positif ou négatif) qu'il faut ajouter à un terme pour obtenir le suivant.`,
        ],
      },
      {
        kind: 'para',
        text: R`Si $r > 0$, la suite est croissante ; si $r < 0$, elle est décroissante ; si $r = 0$, elle est constante. Dans un repère, ses points sont **isolés et alignés** : d'un point au suivant, on avance toujours de $1$ vers la droite et de $r$ vers le haut. On dit que sa croissance est **linéaire**.`,
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [],
          xMin: 0.5,
          xMax: 9.7,
          xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          yTicks: [-2, 0, 2, 4, 6],
          fixedYRange: { min: -3, max: 7.5 },
          points: [
            ...[2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5].map((y, i) => ({ x: i + 1, y, label: i === 8 ? '(u_n)' : '', tone: 'accent' as const, labelPos: 'left' as const })),
            ...[4, 3.25, 2.5, 1.75, 1, 0.25, -0.5, -1.25, -2].map((y, i) => ({ x: i + 1, y, label: i === 8 ? '(v_n)' : '', tone: 'bad' as const, labelPos: 'left' as const })),
          ],
          xAxisLabel: 'n',
          yAxisLabel: '',
          caption: R`$(u_n)$ : $u_1 = 2{,}5$ et $r = 0{,}5$, elle croît ; $(v_n)$ : $v_1 = 4$ et $r = -0{,}75$, elle décroît. Chaque suite a ses points alignés, sur une droite de pente $r$.`,
        },
      },
      { kind: 'subheading', text: 'Terme général, écart entre deux termes, moyenne' },
      {
        kind: 'rappel',
        label: 'Les formules d’une suite arithmétique',
        items: [
          R`**Terme général** : $u_n = u_1 + (n-1)r$.`,
          R`**Écart entre deux termes quelconques** : $u_m - u_n = (m-n)r$, donc $u_m = u_n + (m-n)r$ ; inutile de connaître $u_1$ pour relier deux termes.`,
          R`**Moyenne arithmétique** : chaque terme, sauf le premier, est la moyenne de ses deux voisins : $u_n = \dfrac{u_{n-1}+u_{n+1}}{2}$ ($n \geq 2$).`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — les trois formules d’une suite arithmétique',
        blocks: [
          { kind: 'para', text: R`**Terme général.** Écris la définition pour les indices $1$ à $n - 1$ : $u_2 - u_1 = r$, $u_3 - u_2 = r$, …, $u_n - u_{n-1} = r$. Additionne ces $n - 1$ égalités membre à membre. À gauche, chaque terme intermédiaire apparaît une fois avec le signe $+$ et une fois avec le signe $-$ : il disparaît, et il reste $u_n - u_1$. À droite, on obtient $n - 1$ fois $r$. Donc $u_n = u_1 + (n-1)r$.` },
          { kind: 'para', text: R`**Écart entre deux termes.** $u_m = u_1 + (m-1)r$ et $u_n = u_1 + (n-1)r$. En soustrayant, les $u_1$ s'annulent et il reste $(m - 1 - n + 1)r$ : $u_m - u_n = (m-n)r$.` },
          { kind: 'para', text: R`**Moyenne arithmétique.** Pour $n \geq 2$ : $u_n - u_{n-1} = r$ et $u_{n+1} - u_n = r$. Donc $u_n - u_{n-1} = u_{n+1} - u_n$, d'où $2u_n = u_{n-1} + u_{n+1}$ et $u_n = \dfrac{u_{n-1}+u_{n+1}}{2}$.` },
        ],
      },
      {
        kind: 'attention',
        label: 'Attention — le facteur de r est (n − 1), jamais n',
        text: R`Pour passer de $u_1$ à $u_n$, on ajoute la raison $n - 1$ fois, pas $n$ fois : de $u_1$ à $u_2$, un seul pas ; de $u_1$ à $u_6$, cinq pas. Écrire $u_n = u_1 + nr$ est l'erreur la plus fréquente sur cette formule. Même réflexe entre deux termes : de $u_7$ à $u_{12}$, il y a $12 - 7 = 5$ pas.`,
      },
      {
        kind: 'exemple',
        badge: 'deux termes connus : retrouver la raison et le premier terme',
        formula: R`Dans une suite arithmétique, $u_7 = 25$ et $u_{12} = 45$. Calcule la raison, le premier terme et $u_{15}$.`,
        steps: [
          { tag: 'relier les deux termes', text: R`$u_{12} - u_7 = (12-7)r$, donc $45 - 25 = 5r$ et $r = 4$` },
          { tag: 'le premier terme', text: R`$u_7 = u_1 + 6r$, donc $u_1 = 25 - 6 \times 4 = 1$` },
          { tag: 'un autre terme', text: R`$u_{15} = u_{12} + 3r = 45 + 12 = 57$` },
        ],
        result: { tag: 'résultat', text: R`$r = 4$, $u_1 = 1$ et $u_{15} = 57$ (contrôle : $1 + 14 \times 4 = 57$).` },
      },
      {
        kind: 'exemple',
        badge: 'quatre termes consécutifs dont on connaît la somme',
        formula: R`La somme de quatre termes consécutifs d'une suite arithmétique vaut $35$, et le quatrième vaut quatre fois le premier. Quels sont ces quatre nombres ?`,
        steps: [
          { tag: 'nommer les termes', text: R`$a$ ; $a + r$ ; $a + 2r$ ; $a + 3r$` },
          { tag: 'traduire la somme', text: R`$4a + 6r = 35$` },
          { tag: 'traduire la seconde condition', text: R`$a + 3r = 4a$, donc $3r = 3a$ et $r = a$` },
          { tag: 'remplacer', text: R`$4a + 6a = 10a = 35$, donc $a = 3{,}5$ et $r = 3{,}5$` },
        ],
        result: { tag: 'résultat', text: R`$3{,}5$ ; $7$ ; $10{,}5$ ; $14$ (contrôle : la somme vaut $35$ et $14 = 4 \times 3{,}5$).` },
      },
      { kind: 'subheading', text: 'La somme des n premiers termes' },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la double échelle, pour la somme des n premiers termes',
        blocks: [
          { kind: 'para', text: R`Note $S_n = u_1 + u_2 + \ldots + u_n$. Écris cette somme une seconde fois, à l'envers, et additionne les deux lignes colonne par colonne :` },
          { kind: 'para', text: R`$S_n = u_1 + u_2 + \ldots + u_{n-1} + u_n$` },
          { kind: 'para', text: R`$S_n = u_n + u_{n-1} + \ldots + u_2 + u_1$` },
          { kind: 'para', text: R`**Chaque colonne vaut** $u_1 + u_n$. La colonne $i$ associe $u_i = u_1 + (i-1)r$, le $i$-ième terme depuis le début, et $u_{n+1-i} = u_n - (i-1)r$, le $i$-ième terme depuis la fin (on recule $i - 1$ fois de $r$). Leur somme vaut $u_1 + u_n$ : les $(i-1)r$ se compensent.` },
          { kind: 'para', text: R`**Avec le symbole** $\Sigma$, le même calcul s'écrit : $2S_n = \sum\limits_{i=1}^{n} (u_i + u_{n+1-i})$, puis $2S_n = \sum\limits_{i=1}^{n} \big(u_1 + (i-1)r + u_n - (i-1)r\big)$, et enfin $2S_n = \sum\limits_{i=1}^{n} (u_1 + u_n) = n(u_1 + u_n)$.` },
          { kind: 'para', text: R`**Conclusion.** $S_n = \dfrac{n(u_1+u_n)}{2}$. En remplaçant $u_n$ par $u_1 + (n-1)r$, on obtient aussi $S_n = \dfrac{n\big(2u_1 + (n-1)r\big)}{2}$.` },
        ],
      },
      {
        kind: 'atelier',
        tag: 'gauss-double-echelle-widget',
        label: 'Manipule toi-même — la double échelle',
        caption:
          'Règle n, u₁ et r, puis appuie sur « Assembler » : la même suite écrite à l’envers descend d’un seul bloc et ' +
          's’emboîte parfaitement sur l’escalier, car chaque colonne vaut u₁ + uₙ. Le rectangle obtenu contient deux ' +
          'fois la somme : 2·Sₙ = n × (u₁ + uₙ). Le bouton « Gauss » refait le calcul du jeune Gauss : 1 + 2 + … + 100 = 5 050.',
      },
      {
        kind: 'rappel',
        label: 'Somme des n premiers termes d’une suite arithmétique',
        items: [
          R`$S_n = \dfrac{n(u_1+u_n)}{2}$ : le nombre de termes fois la moyenne du premier et du dernier.`,
          R`Sans connaître $u_n$ : $S_n = \dfrac{n\big(2u_1 + (n-1)r\big)}{2}$.`,
        ],
      },
      {
        kind: 'historique',
        titre: 'Un écolier de neuf ans qui déjoue le piège du maître',
        text: R`Vers 1785, un instituteur allemand demande à ses élèves d'additionner tous les nombres de $1$ à $100$, un calcul censé occuper la classe longtemps. Le jeune **Carl Friedrich Gauss**, âgé de neuf ans, pose presque aussitôt sa tablette avec la bonne réponse : $5\,050$. Sa méthode est celle de la démonstration ci-dessus : il associe le premier terme ($1$) au dernier ($100$), le deuxième ($2$) à l'avant-dernier ($99$), et ainsi de suite ; chaque paire vaut $101$, et il y a $50$ paires, donc $50 \times 101 = 5\,050$. L'anecdote, racontée depuis le 19e siècle, n'est peut-être pas exacte dans tous ses détails, mais la méthode est bien celle de la « double échelle ». Gauss deviendra l'un des plus grands mathématiciens de l'histoire.`,
        image: {
          src: '/images/historique/gauss.jpg',
          alt: 'Portrait de Carl Friedrich Gauss',
          caption: 'Carl Friedrich Gauss (1777–1855), portrait d’après Christian Albrecht Jensen (1840), copie de Gottlieb Biermann (1887).',
        },
      },
      {
        kind: 'exemple',
        badge: 'somme des 12 premiers termes',
        formula: R`Calcule la somme des $12$ premiers termes de la suite arithmétique de premier terme $u_1 = -4$ et de raison $r = 3$.`,
        steps: [
          { tag: 'le dernier terme de la somme', text: R`$u_{12} = -4 + 11 \times 3 = 29$` },
          { tag: 'appliquer la formule', text: R`$S_{12} = \dfrac{12 \times (-4 + 29)}{2} = 6 \times 25$` },
        ],
        result: { tag: 'résultat', text: R`$S_{12} = 150$ (contrôle avec $u_1$ et $r$ : $\dfrac{12\big(2 \times (-4) + 11 \times 3\big)}{2}$ $= 6 \times 25 = 150$).` },
      },
      {
        kind: 'exemple',
        badge: 'les échelons d’une échelle',
        formula: R`Une échelle de cueillette a $8$ échelons dont la longueur décroît régulièrement, de $55$ cm à la base jusqu'à $20$ cm pour l'échelon du haut. Détermine la longueur des échelons intermédiaires, puis la longueur totale de bois nécessaire pour les $8$ échelons.`,
        steps: [
          { tag: 'la raison', text: R`$u_8 = u_1 + 7r$, donc $20 = 55 + 7r$ et $r = -5$` },
          { tag: 'les échelons', text: R`$55$ ; $50$ ; $45$ ; $40$ ; $35$ ; $30$ ; $25$ ; $20$ (en cm)` },
          { tag: 'la longueur totale', text: R`$S_8 = \dfrac{8 \times (55 + 20)}{2} = 4 \times 75 = 300$` },
        ],
        result: { tag: 'résultat', text: R`Échelons intermédiaires : $50$, $45$, $40$, $35$, $30$ et $25$ cm ; il faut $300$ cm de bois.` },
      },
      {
        kind: 'attention',
        label: 'Attention — une somme qui ne commence pas à u₁ : compte les termes',
        text: R`De $u_p$ à $u_n$, il y a $n - p + 1$ termes, pas $n - p$ : de $u_5$ à $u_{20}$, il y a $16$ termes (comme $16$ piquets pour $15$ intervalles). La somme vaut alors $(n - p + 1) \times \dfrac{u_p + u_n}{2}$. Même réflexe pour une liste de nombres : de $10$ à $100$, de $2$ en $2$, il y a $\dfrac{100 - 10}{2} + 1 = 46$ nombres pairs.`,
      },
      {
        kind: 'exemple',
        badge: 'les économies de Vincent',
        formula: R`En janvier 2010, Vincent économise $12{,}50$ € ; chaque mois, il économise $1{,}20$ € de plus que le mois précédent. Combien économise-t-il en décembre 2011 ? Combien a-t-il économisé en tout de janvier 2010 à décembre 2011 ?`,
        steps: [
          { tag: 'le rang du mois cherché', text: R`Janvier 2010 a le rang $1$ ; décembre 2011 a le rang $12 + 12 = 24$. Économie du mois de rang $n$ : $u_n = 12{,}50 + (n-1) \times 1{,}20$.` },
          { tag: 'décembre 2011', text: R`$u_{24} = 12{,}50 + 23 \times 1{,}20 = 40{,}10$` },
          { tag: 'le total sur 24 mois', text: R`$S_{24} = \dfrac{24 \times (12{,}50 + 40{,}10)}{2}$ $= 12 \times 52{,}60$` },
        ],
        result: { tag: 'résultat', text: R`$40{,}10$ € en décembre 2011 et $631{,}20$ € au total.` },
      },
      { kind: 'subheading', text: 'Le symbole Σ' },
      {
        kind: 'para',
        text: R`Écrire $u_1 + u_2 + \ldots + u_n$ est long, et les points de suspension laissent deviner les termes cachés. Le symbole $\Sigma$ (sigma, la lettre grecque « S », pour « somme ») dit tout en une fois : $\sum\limits_{i=1}^{n} u_i = u_1 + u_2 + \ldots + u_n$. On lit « somme, pour $i$ allant de $1$ à $n$, de $u_i$ ». La lettre $i$ est l'**indice de sommation** : elle prend toutes les valeurs entières de la borne du bas à celle du haut. On peut la remplacer par une autre lettre ($k$, $j$) sans rien changer.`,
      },
      {
        kind: 'rappel',
        label: 'Calculer avec Σ',
        items: [
          R`**Couper une somme** : $\sum\limits_{i=1}^{n} (a_i + b_i) = \sum\limits_{i=1}^{n} a_i + \sum\limits_{i=1}^{n} b_i$.`,
          R`**Sortir un facteur constant** : $\sum\limits_{i=1}^{n} k\,a_i = k \sum\limits_{i=1}^{n} a_i$.`,
          R`**Somme d'une constante** : $\sum\limits_{i=1}^{n} c = nc$ ($n$ termes égaux à $c$).`,
          R`**Somme des premiers naturels** : $\sum\limits_{i=1}^{n} i = \dfrac{n(n+1)}{2}$ (suite arithmétique de premier terme $1$ et de raison $1$).`,
          R`**Changer d'indice** : $\sum\limits_{i=1}^{n} u_{i+1} = \sum\limits_{j=2}^{n+1} u_j$ ; on pose $j = i + 1$ : quand $i$ va de $1$ à $n$, $j$ va de $2$ à $n + 1$.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'calculer une somme écrite avec Σ',
        formula: R`Calcule $\sum\limits_{i=1}^{12} (1 - 2i)$.`,
        steps: [
          { tag: 'écrire quelques termes', text: R`$(-1) + (-3) + (-5) + \ldots + (-23)$ : $12$ termes d'une suite arithmétique de raison $-2$` },
          { tag: 'couper et sortir le facteur', text: R`$\sum\limits_{i=1}^{12} 1 - 2\sum\limits_{i=1}^{12} i = 12 - 2 \times \dfrac{12 \times 13}{2}$` },
        ],
        result: { tag: 'résultat', text: R`$12 - 156 = -144$ (contrôle par la double échelle : $\dfrac{12 \times (-1 - 23)}{2} = -144$).` },
      },
      {
        kind: 'exemple',
        badge: 'une somme avec Σ en fonction de n',
        formula: R`Exprime $\sum\limits_{i=1}^{n} (3i - 2)$ en fonction de $n$.`,
        steps: [
          { tag: 'couper et sortir les facteurs', text: R`$3\sum\limits_{i=1}^{n} i - \sum\limits_{i=1}^{n} 2 = 3 \times \dfrac{n(n+1)}{2} - 2n$` },
          { tag: 'réduire', text: R`$\dfrac{3n^2 + 3n - 4n}{2}$ $= \dfrac{3n^2 - n}{2} = \dfrac{n(3n-1)}{2}$` },
          { tag: 'contrôler pour n = 3', text: R`$1 + 4 + 7 = 12$ et $\dfrac{3 \times 8}{2} = 12$` },
        ],
        result: { tag: 'résultat', text: R`$\sum\limits_{i=1}^{n} (3i - 2) = \dfrac{n(3n-1)}{2}$` },
      },
      {
        kind: 'piege',
        label: 'Oublier que la somme d’une constante vaut n fois la constante',
        text: R`$\sum\limits_{i=1}^{n} 2 = 2 + 2 + \ldots + 2 = 2n$, et non $2$ : la constante est additionnée autant de fois qu'il y a de termes. De même, $\sum\limits_{i=3}^{10} 5 = 8 \times 5 = 40$ : de $3$ à $10$, il y a $10 - 3 + 1 = 8$ termes.`,
      },
      {
        kind: 'entrainement',
        title: 'Suites arithmétiques, formule générale et termes',
        generatorId: '56gen1',
        description: [
          'Retrouve un terme, la raison ou le premier terme d’une suite arithmétique, isole une inconnue x donnée dans ' +
            'des termes ou dans une somme, ou le rang n d’un terme, et calcule une somme de termes.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Suites arithmétiques, formule générale et termes »',
      },
      {
        kind: 'entrainement',
        title: 'Calculer avec le symbole Σ',
        generatorId: '56gen21',
        description: [
          'Écris une somme avec le symbole Σ (bornes et terme général), développe une somme donnée, calcule-la en ' +
            'séparant une partie arithmétique et une partie géométrique, et change d’indice.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Calculer avec le symbole Σ »',
      },
      // ⟨fin-etape suites-arithmetiques⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'suites-geometriques',
    number: 8,
    title: 'Suites géométriques',
    kicker: 'uₙ = u₁·qⁿ⁻¹, somme par S − qS',
    titreCourt: 'Suites géométriques',
    partie: 'Les suites',
    essentiel: [
      R`Une suite est **géométrique** de raison $q \neq 0$ si $u_n \neq 0$ et $u_{n+1} = q\,u_n$ pour tout $n \in \mathbb{N}_0$ : $u_n = u_1\,q^{n-1}$ et $\dfrac{u_m}{u_n} = q^{m-n}$. Trois termes consécutifs vérifient $b^2 = ac$.`,
      R`Somme des $n$ premiers termes, pour $q \neq 1$ : $S_n = u_1\,\dfrac{1-q^n}{1-q}$, obtenue en calculant $S_n - qS_n$ ; si $q = 1$, $S_n = n\,u_1$.`,
      R`Insérer $k$ termes entre $a$ et $b$, c'est résoudre $q^{k+1} = \dfrac{b}{a}$ ; avec un exposant pair, deux raisons opposées sont possibles. Une suite géométrique de raison $q > 1$ finit toujours par dépasser une suite arithmétique.`,
    ],
    cartes: [
      { question: R`$u_2 = 392$ et $u_5 = 49$ : raison et premier terme ?`, reponse: R`$q^3 = \dfrac{49}{392} = \dfrac{1}{8}$, donc $q = \dfrac{1}{2}$ et $u_1 = 784$.` },
      { question: R`$u_1 = 3$ et $q = 2$ : somme des $8$ premiers termes ?`, reponse: R`$S_8 = 3 \times \dfrac{1 - 2^8}{1 - 2} = 3 \times 255 = 765$.` },
      { question: R`Trois termes consécutifs $a$, $b$, $c$ d'une suite géométrique : quelle relation ?`, reponse: R`$b^2 = ac$, et aucun terme n'est nul.` },
      { question: R`$+10\,\%$ puis $-10\,\%$ : le prix revient-il à sa valeur de départ ?`, reponse: R`Non : $1{,}10 \times 0{,}90 = 0{,}99$, il a baissé de $1\,\%$.` },
    ],
    blocks: [
      { kind: 'video', title: 'Suites géométriques : raison, terme général, somme et croissance exponentielle' },
      {
        kind: 'definition',
        label: 'Définition — suite géométrique',
        items: [
          R`Soit $q$ un nombre réel non nul. On appelle **suite géométrique de raison** $q$ toute suite $(u_n)_{n\in\mathbb{N}_0}$ telle que, pour tout $n \in \mathbb{N}_0$ : $u_n \neq 0$ et $u_{n+1} = q\,u_n$.`,
          R`La **raison** est le rapport constant entre deux termes consécutifs : $q = \dfrac{u_{n+1}}{u_n}$. C'est le nombre par lequel il faut multiplier un terme pour obtenir le suivant.`,
        ],
      },
      {
        kind: 'featureTable',
        caption: 'Le sens de variation d’une suite géométrique dépend de q et du signe de u₁.',
        headers: ['', 'q < 0', '0 < q < 1', 'q = 1', 'q > 1'],
        rows: [
          ['u₁ > 0', 'ni croissante ni décroissante', 'strictement décroissante', 'constante', 'strictement croissante'],
          ['u₁ < 0', 'ni croissante ni décroissante', 'strictement croissante', 'constante', 'strictement décroissante'],
        ],
      },
      {
        kind: 'para',
        text: R`Avec $q < 0$, les termes changent de signe à chaque pas. Une raison égale à $1$ n'a guère d'intérêt : tous les termes sont égaux. Quand $q > 1$ et $u_1 > 0$, la croissance est dite **exponentielle** : les points restent isolés, mais s'écartent de plus en plus vite de l'axe horizontal, alors que ceux d'une suite arithmétique restent alignés.`,
      },
      {
        kind: 'illustration',
        illustration:
          {
            kind: 'curvePlot',
            curves: [],
            xMin: 0.5,
            xMax: 9.6,
            xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            yTicks: [1, 2, 3, 4, 5, 6],
            fixedYRange: { min: 0, max: 6.6 },
            points: [
              ...Array.from({ length: 9 }, (_, i) => ({ x: i + 1, y: 1.2 ** i, label: i === 8 ? '(u_n)' : '', tone: 'accent' as const, labelPos: 'above' as const })),
              ...Array.from({ length: 9 }, (_, i) => ({ x: i + 1, y: 6 * 0.6 ** i, label: i === 1 ? '(v_n)' : '', tone: 'bad' as const, labelPos: 'right' as const })),
            ],
            xAxisLabel: 'n',
            yAxisLabel: '',
            caption: R`Premier terme positif : $u_n = 1{,}2^{\,n-1}$ croît, $v_n = 6 \times 0{,}6^{\,n-1}$ décroît vers $0$.`,
          },
      },
      {
        kind: 'illustration',
        illustration:
          {
            kind: 'curvePlot',
            curves: [],
            xMin: 0.5,
            xMax: 9.6,
            xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            yTicks: [-6, -5, -4, -3, -2, -1],
            fixedYRange: { min: -6.6, max: 0.4 },
            points: [
              ...Array.from({ length: 9 }, (_, i) => ({ x: i + 1, y: -(1.2 ** i), label: i === 8 ? '(u_n)' : '', tone: 'accent' as const, labelPos: 'below' as const })),
              ...Array.from({ length: 9 }, (_, i) => ({ x: i + 1, y: -6 * 0.6 ** i, label: i === 1 ? '(v_n)' : '', tone: 'bad' as const, labelPos: 'right' as const })),
            ],
            xAxisLabel: 'n',
            yAxisLabel: '',
            caption: R`Premier terme négatif : $u_n = -1{,}2^{\,n-1}$ décroît, $v_n = -6 \times 0{,}6^{\,n-1}$ croît vers $0$.`,
          },
      },
      {
        kind: 'atelier',
        tag: 'arithmetique-ou-geometrique-widget',
        label: 'Manipule toi-même — arithmétique, géométrique, ou ni l’une ni l’autre ?',
        caption:
          'Cinq termes, une question : arithmétique, géométrique, les deux, ou ni l’une ni l’autre ? Fais calculer les ' +
          'différences et les rapports avant de répondre — tu n’as qu’un essai. Attention aux pièges : les carrés, les ' +
          'nombres triangulaires ou Fibonacci ont l’air réguliers sans être ni l’un ni l’autre, et une suite constante ' +
          'non nulle est les deux à la fois.',
      },
      { kind: 'subheading', text: 'Terme général, rapport de deux termes, moyenne géométrique' },
      {
        kind: 'rappel',
        label: 'Les formules d’une suite géométrique',
        items: [
          R`**Terme général** : $u_n = u_1\,q^{n-1}$.`,
          R`**Rapport de deux termes quelconques** : $\dfrac{u_m}{u_n} = q^{m-n}$, donc $u_m = u_n\,q^{m-n}$.`,
          R`**Moyenne géométrique** : trois termes consécutifs vérifient $u_n^2 = u_{n-1}\,u_{n+1}$ ($n \geq 2$). Si les termes sont strictement positifs, chacun (sauf le premier) est la moyenne géométrique de ses deux voisins : $u_n = \sqrt{u_{n-1}\,u_{n+1}}$.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — terme général et rapport de deux termes d’une suite géométrique',
        blocks: [
          { kind: 'para', text: R`**Terme général.** Écris la définition pour les indices $1$ à $n - 1$ : $\dfrac{u_2}{u_1} = q$, $\dfrac{u_3}{u_2} = q$, …, $\dfrac{u_n}{u_{n-1}} = q$ (aucun terme n'est nul). Multiplie ces $n - 1$ égalités membre à membre. À gauche, chaque terme intermédiaire apparaît une fois au numérateur et une fois au dénominateur : il se simplifie, et il reste $\dfrac{u_n}{u_1}$. À droite, on obtient $q^{n-1}$. Donc $u_n = u_1\,q^{n-1}$.` },
          { kind: 'para', text: R`**Rapport de deux termes.** $\dfrac{u_m}{u_n} = \dfrac{u_1\,q^{m-1}}{u_1\,q^{n-1}} = q^{(m-1)-(n-1)} = q^{m-n}$.` },
          { kind: 'para', text: R`**Moyenne géométrique.** Pour $n \geq 2$ : $\dfrac{u_n}{u_{n-1}} = q = \dfrac{u_{n+1}}{u_n}$, donc, par un produit en croix, $u_n^2 = u_{n-1}\,u_{n+1}$. Si les termes sont positifs, on prend la racine carrée : $u_n = \sqrt{u_{n-1}\,u_{n+1}}$.` },
        ],
      },
      {
        kind: 'exemple',
        badge: 'retrouver q à partir de u₂ et u₅',
        formula: R`Dans une suite géométrique, $u_2 = 392$ et $u_5 = 49$. Calcule la raison, le premier terme et $u_{10}$.`,
        steps: [
          { tag: 'le rapport des deux termes', text: R`$\dfrac{u_5}{u_2} = q^{5-2}$, donc $q^3 = \dfrac{49}{392} = \dfrac{1}{8}$` },
          { tag: 'racine cubique', text: R`$q = \dfrac{1}{2}$ : l'exposant $3$ est impair, une seule solution.` },
          { tag: 'premier terme et dixième terme', text: R`$u_1 = \dfrac{u_2}{q} = 784$ et $u_{10} = u_5\,q^5 = \dfrac{49}{32}$` },
        ],
        result: { tag: 'résultat', text: R`$q = \dfrac{1}{2}$, $u_1 = 784$ et $u_{10} = \dfrac{49}{32} = 1{,}531\,25$.` },
      },
      {
        kind: 'attention',
        label: 'Attention — racine d’exposant pair : une, deux ou aucune raison',
        text: R`Résoudre $q^k = a$, c'est chercher une racine $k$-ième. Si $k$ est **pair**, il existe **deux** solutions opposées $\pm\sqrt[k]{a}$ dès que $a > 0$, car $(-q)^k = q^k$ ; et **aucune** si $a < 0$, car une puissance paire d'un réel n'est jamais négative. Ne garde la solution positive seule que si l'énoncé le demande (par exemple, une suite à termes positifs).`,
      },
      {
        kind: 'exemple',
        badge: 'insérer cinq termes entre 2 et 31 250',
        formula: R`Insère cinq nombres entre $2$ et $31\,250$ pour obtenir sept termes consécutifs d'une suite géométrique.`,
        steps: [
          { tag: 'compter les pas', text: R`Sept termes, de $u_1 = 2$ à $u_7 = 31\,250$ : six pas, donc $2\,q^6 = 31\,250$ et $q^6 = 15\,625$` },
          { tag: 'racine sixième : exposant pair', text: R`$15\,625 = 5^6$, donc $q = 5$ ou $q = -5$` },
          { tag: 'les deux suites', text: R`$2$ ; $10$ ; $50$ ; $250$ ; $1\,250$ ; $6\,250$ ; $31\,250$, ou $2$ ; $-10$ ; $50$ ; $-250$ ; $1\,250$ ; $-6\,250$ ; $31\,250$` },
        ],
        result: { tag: 'résultat', text: R`Deux réponses, selon que $q = 5$ ou $q = -5$.` },
      },
      {
        kind: 'methode',
        label: 'Méthode — insérer k termes entre a et b',
        items: [
          R`Les $k$ termes insérés, avec $a$ et $b$, forment $k + 2$ termes consécutifs : il y a $k + 1$ pas de $a$ à $b$, donc $b = a\,q^{k+1}$ et $q^{k+1} = \dfrac{b}{a}$.`,
          R`Si $k + 1$ est impair : une seule raison, $q = \sqrt[k+1]{\dfrac{b}{a}}$.`,
          R`Si $k + 1$ est pair : deux raisons opposées si $\dfrac{b}{a} > 0$, aucune si $\dfrac{b}{a} < 0$.`,
          R`Calcule les termes de proche en proche, en multipliant par $q$, et contrôle que le dernier vaut bien $b$.`,
        ],
      },
      { kind: 'subheading', text: 'La somme des n premiers termes' },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la somme des n premiers termes par S − qS',
        blocks: [
          { kind: 'para', text: R`**1.** $S_n = u_1 + u_2 + \ldots + u_n$, c'est-à-dire $S_n = \sum\limits_{i=1}^{n} u_i$.` },
          { kind: 'para', text: R`**2.** Multiplie par $q$ : chaque terme devient le suivant, car $q\,u_i = u_{i+1}$. Donc $qS_n = u_2 + u_3 + \ldots + u_{n+1}$, c'est-à-dire $qS_n = \sum\limits_{i=1}^{n} u_{i+1} = \sum\limits_{i=2}^{n+1} u_i$ (changement d'indice).` },
          { kind: 'para', text: R`**3.** Soustrais membre à membre : les termes de $u_2$ à $u_n$ figurent dans les deux sommes et disparaissent. $S_n - qS_n = u_1 + \sum\limits_{i=2}^{n} u_i - \sum\limits_{i=2}^{n} u_i - u_{n+1}$, donc $S_n - qS_n = u_1 - u_{n+1}$.` },
          { kind: 'para', text: R`**Conclusion.** $S_n(1 - q) = u_1 - u_1\,q^n$. Si $q \neq 1$, on divise par $1 - q$ : $S_n = u_1\,\dfrac{1-q^n}{1-q}$. Si $q = 1$, tous les termes valent $u_1$ et $S_n = n\,u_1$.` },
        ],
      },
      {
        kind: 'rappel',
        label: 'Somme des n premiers termes d’une suite géométrique',
        items: [
          R`Si $q \neq 1$ : $S_n = u_1\,\dfrac{1-q^n}{1-q}$, soit $\sum\limits_{i=1}^{n} u_1\,q^{i-1} = u_1\,\dfrac{1-q^n}{1-q}$.`,
          R`Si $q = 1$ : $S_n = n\,u_1$.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'le coût d’un forage',
        formula: R`Une entreprise de forage fait payer $100$ unités monétaires (UM) le premier mètre ; chaque mètre supplémentaire coûte $4\,\%$ de plus que le précédent. Calcule le coût d'un forage de $25$ m, puis la profondeur maximale possible avec un budget de $6\,000$ UM.`,
        steps: [
          { tag: 'reconnaître la suite', text: R`Le $n$-ième mètre coûte $c_n = 100 \times 1{,}04^{\,n-1}$ : suite géométrique, $c_1 = 100$, $q = 1{,}04$.` },
          { tag: 'coût de 25 m', text: R`$S_{25} = 100 \times \dfrac{1 - 1{,}04^{25}}{1 - 1{,}04} \approx 4\,164{,}59$` },
          { tag: 'le budget : table de la calculatrice', text: R`$S_n = 100 \times \dfrac{1 - 1{,}04^{n}}{1 - 1{,}04}$ : $n$ est en exposant, on balaie la table. $S_{31} \approx 5\,932{,}83$ et $S_{32} \approx 6\,270{,}15$.` },
        ],
        result: { tag: 'résultat', text: R`Un forage de $25$ m coûte environ $4\,164{,}59$ UM ; avec $6\,000$ UM, on peut forer jusqu'à $31$ m.` },
      },
      {
        kind: 'exemple',
        badge: 'la légende de l’échiquier',
        formula: R`Une légende raconte qu'un roi veut récompenser l'inventeur du jeu d'échecs. L'inventeur demande un grain de blé sur la première case de l'échiquier, deux sur la deuxième, quatre sur la troisième, et ainsi de suite en doublant à chaque case, jusqu'à la 64ᵉ case. Combien de grains de blé cela représente-t-il ?`,
        steps: [
          { tag: 'reconnaître la suite', text: R`Case $n$ : $u_n = 2^{n-1}$ grains ; géométrique, $u_1 = 1$, $q = 2$.` },
          { tag: 'somme des 64 premiers termes', text: R`$S_{64} = \sum\limits_{i=1}^{64} 2^{i-1} = \dfrac{1 - 2^{64}}{1 - 2} = 2^{64} - 1$` },
        ],
        result: { tag: 'résultat', text: R`$2^{64} - 1 \approx 1{,}84 \times 10^{19}$ grains : à environ $0{,}05$ g le grain, plus de $9 \times 10^{11}$ tonnes, plus d'un millier de fois la production mondiale annuelle de blé (environ $800$ millions de tonnes).` },
      },
      {
        kind: 'atelier',
        tag: 'echiquier-widget',
        label: 'Manipule toi-même — la légende de l’échiquier',
        caption:
          'Avance case par case : la case n contient 2ⁿ⁻¹ grains, toujours un de plus que toutes les cases précédentes ' +
          'réunies — d’où le total 2ⁿ − 1. Suis la masse de blé : plus d’un million de grains dès la 20ᵉ case, une ' +
          'tonne dès la 25ᵉ, plus que la production mondiale annuelle dès la 54ᵉ.',
      },
      {
        kind: 'attention',
        label: 'Attention — une somme qui ne commence pas à u₁ : le premier terme de la somme',
        text: R`La formule $S_n = u_1\,\dfrac{1-q^n}{1-q}$ vaut pour les $n$ termes à partir de $u_1$. Pour $u_p + u_{p+1} + \ldots + u_n$, remplace $u_1$ par le **premier terme de la somme**, $u_p$, et l'exposant par le **nombre de termes**, $N = n - p + 1$ : $S = u_p\,\dfrac{1-q^N}{1-q}$. Pour une somme écrite en extension, comme $3 + 6 + 12 + \ldots + 3\,072$ : $q = 2$, et $3 \times 2^{N-1} = 3\,072$ donne $2^{N-1} = 1\,024 = 2^{10}$, donc $N = 11$ termes.`,
      },
      { kind: 'subheading', text: 'Trois ou quatre termes consécutifs' },
      {
        kind: 'methode',
        label: 'Méthode — trois termes consécutifs a, b, c',
        items: [
          R`Arithmétique : $b$ est la moyenne de ses voisins, $2b = a + c$. Géométrique : $\dfrac{b}{a} = \dfrac{c}{b}$, donc $b^2 = ac$ ; c'est plus sûr que $b = \sqrt{ac}$, faux quand $b$ est négatif.`,
          R`Si $a$, $b$, $c$ dépendent d'une inconnue, remplace, développe et résous l'équation obtenue (du premier ou du second degré).`,
          R`Vérifie chaque solution : dans une suite géométrique, **aucun terme n'est nul** ; une solution qui annule un terme est écartée.`,
        ],
      },
      {
        kind: 'exemple',
        badge: '35 ; m ; 875 : arithmétique ou géométrique',
        formula: R`Détermine $m$ pour que $35$ ; $m$ ; $875$ soient trois termes consécutifs d'une suite arithmétique, puis d'une suite géométrique.`,
        steps: [
          { tag: 'arithmétique : 2b = a + c', text: R`$2m = 35 + 875 = 910$, donc $m = 455$ (raison $420$)` },
          { tag: 'géométrique : b² = ac', text: R`$m^2 = 35 \times 875 = 30\,625$, donc $m = 175$ ou $m = -175$` },
          { tag: 'contrôler les raisons', text: R`$\dfrac{175}{35} = \dfrac{875}{175} = 5$ et $\dfrac{-175}{35} = \dfrac{875}{-175} = -5$` },
        ],
        result: { tag: 'résultat', text: R`Arithmétique : $m = 455$. Géométrique : $m = 175$ (raison $5$) ou $m = -175$ (raison $-5$).` },
      },
      {
        kind: 'exemple',
        badge: 'quatre termes consécutifs dont on connaît le produit',
        formula: R`Le produit de quatre termes consécutifs d'une suite géométrique vaut $256$, et le quatrième vaut quatre fois le premier. Quels sont ces quatre nombres ?`,
        steps: [
          { tag: 'nommer les termes', text: R`$a$ ; $aq$ ; $aq^2$ ; $aq^3$` },
          { tag: 'le quatrième vaut quatre fois le premier', text: R`$aq^3 = 4a$, donc $q^3 = 4$ et $q = \sqrt[3]{4}$` },
          { tag: 'le produit', text: R`$a^4 q^6 = 256$ ; or $q^6 = (q^3)^2 = 16$, donc $a^4 = 16$ et $a = 2$ ou $a = -2$` },
          { tag: 'les termes', text: R`$aq^2 = 2\sqrt[3]{16} = 4\sqrt[3]{2}$ et $aq^3 = 8$ (pour $a = 2$)` },
        ],
        result: { tag: 'résultat', text: R`$2$ ; $2\sqrt[3]{4}$ ; $4\sqrt[3]{2}$ ; $8$, ou leurs opposés $-2$ ; $-2\sqrt[3]{4}$ ; $-4\sqrt[3]{2}$ ; $-8$ (environ $2$ ; $3{,}17$ ; $5{,}04$ ; $8$).` },
      },
      {
        kind: 'historique',
        titre: 'Le triangle de Kepler et le nombre d’or',
        text: R`Existe-t-il un triangle rectangle dont les côtés $a$, $aq$, $aq^2$ ($q > 1$) forment une suite géométrique ? L'hypoténuse est le plus grand côté, $aq^2$, et Pythagore donne $a^2 + a^2q^2 = a^2q^4$, soit $q^4 - q^2 - 1 = 0$. C'est une équation du second degré en $q^2$ ; sa solution positive est $q^2 = \dfrac{1+\sqrt{5}}{2} = \Phi$, le nombre d'or (étape 1), donc $q = \sqrt{\Phi} \approx 1{,}272$. Les côtés sont proportionnels à $1$, $\sqrt{\Phi}$ et $\Phi$. On attribue cette remarque à **Johannes Kepler**, dans une lettre de 1597 à son ancien professeur Michael Mästlin : ce triangle porte aujourd'hui le nom de « triangle de Kepler ».`,
        image: {
          src: '/images/historique/kepler.jpg',
          alt: 'Portrait de Johannes Kepler',
          caption: 'Johannes Kepler (1571–1630), portrait d’après un original de 1620.',
        },
      },
      { kind: 'subheading', text: 'Modéliser : pourcentages et croissances concurrentes' },
      {
        kind: 'rappel',
        label: 'Pourcentage d’évolution et raison',
        items: [
          R`Une **hausse** de $t\,\%$ multiplie par $q = 1 + \dfrac{t}{100}$, une **baisse** de $t\,\%$ par $q = 1 - \dfrac{t}{100}$. Ex. $+8\,\%$ donne $q = 1{,}08$ ; $-15\,\%$ donne $q = 0{,}85$.`,
          R`Un pourcentage **fixe** d'une quantité qui change à chaque étape donne une suite géométrique ; une quantité **fixe** ajoutée à chaque étape donne une suite arithmétique.`,
        ],
      },
      {
        kind: 'wrongRight',
        wrongTag: '+10 % puis −10 % : retour au départ ?',
        wrong: R`$+10\,\% - 10\,\% = 0\,\%$, donc le prix revient à sa valeur de départ.`,
        rightTag: 'les coefficients se multiplient',
        right: R`$1{,}10 \times 0{,}90 = 0{,}99$ : au total, le prix a **baissé de 1 %**. Des pourcentages successifs se multiplient, ils ne s'additionnent jamais.`,
      },
      {
        kind: 'methode',
        label: 'Méthode — de l’énoncé à la suite',
        items: [
          R`**Nature** : à chaque étape, ajoute-t-on la même quantité (suite arithmétique) ou multiplie-t-on par le même nombre (suite géométrique) ?`,
          R`**Premier terme** : $u_1$ est la valeur de l'étape de rang $1$ fixée par l'énoncé (souvent la première année).`,
          R`**Rang d'une année** : on compte à partir de l'année de rang $1$, sans oublier le « $+1$ ». Si 2025 a le rang $1$, l'année 2031 a le rang $2031 - 2025 + 1 = 7$.`,
          R`**Question** : la valeur d'une année est un terme $u_n$ ; un total sur plusieurs années est une somme ; la première année où l'on franchit un seuil se trouve avec la table de la calculatrice, en vérifiant que le seuil n'était pas encore franchi au rang précédent.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — les prévisions de Malthus',
        blocks: [
          { kind: 'para', text: R`En 1800, l'Angleterre compte $8$ millions d'habitants. Selon une hypothèse de Malthus, sa population augmente de $2\,\%$ par an, tandis que son agriculture, qui nourrit $10$ millions de personnes en 1800, permet d'en nourrir $500\,000$ de plus chaque année. Calcule la population et le nombre de personnes que l'agriculture peut nourrir en 1900, puis l'année à partir de laquelle l'agriculture ne suffit plus, selon ce modèle.` },
          { kind: 'para', text: R`**Deux suites** (rang $1$ = année 1800, rang $n$ = année $1799 + n$). Population en millions : $p_n = 8 \times 1{,}02^{\,n-1}$, géométrique. Personnes nourries en millions : $a_n = 10 + 0{,}5(n-1)$, arithmétique.` },
          { kind: 'para', text: R`**En 1900** (rang $101$) : $p_{101} = 8 \times 1{,}02^{100} \approx 57{,}96$ millions et $a_{101} = 10 + 0{,}5 \times 100 = 60$ millions : l'agriculture suffit encore.` },
          {
            kind: 'featureTable',
            headers: ['année', 'rang n', 'population (millions)', 'nourris (millions)', 'assez'],
            rows: [
              ['1800', '1', R`$8$`, R`$10$`, 'oui'],
              ['1850', '51', R`$21{,}53$`, R`$35$`, 'oui'],
              ['1900', '101', R`$57{,}96$`, R`$60$`, 'oui'],
              ['1902', '103', R`$60{,}299$`, R`$61$`, 'oui'],
              ['**1903**', '**104**', R`$61{,}505$`, R`$61{,}5$`, { text: 'non', tone: 'bad' }],
            ],
          },
          { kind: 'para', text: R`**Conclusion.** Au rang $104$, $p_{104} \approx 61{,}505 > a_{104} = 61{,}5$, alors qu'au rang $103$, $p_{103} \approx 60{,}299 < a_{103} = 61$ : selon ce modèle, l'agriculture ne suffit plus à partir de **1903**. Une suite géométrique de raison supérieure à $1$ finit toujours par dépasser une suite arithmétique, même si elle part de plus bas.` },
        ],
      },
      {
        kind: 'historique',
        titre: 'Thomas Malthus et la course entre la population et la nourriture',
        text: R`En 1798, l'économiste et pasteur anglais **Thomas Robert Malthus** (1766–1834) publie son **Essai sur le principe de population**. Il y affirme qu'une population que rien ne freine double tous les vingt-cinq ans environ (une progression géométrique), alors que les ressources alimentaires ne peuvent croître que d'une même quantité à chaque période (une progression arithmétique). Sa conclusion pessimiste : la population finira toujours par dépasser ce que la terre peut nourrir. En Angleterre, ses prévisions ne se sont pas réalisées : les rendements agricoles ont augmenté bien plus vite qu'une suite arithmétique, et la natalité a baissé. Mais son raisonnement a profondément marqué l'économie et inspiré Charles Darwin.`,
        image: {
          src: '/images/historique/malthus.jpg',
          alt: 'Portrait de Thomas Robert Malthus',
          caption: 'Thomas Robert Malthus (1766–1834), portrait du 19e siècle.',
        },
      },
      {
        kind: 'atelier',
        tag: 'comparaison-suites-widget',
        label: 'Manipule toi-même — trouve le rang de bascule',
        caption:
          'Choisis un préréglage (deux villes, intérêts simples contre composés, ou pas de bascule) et règle les deux ' +
          'suites : le tableau de balayage surligne le PREMIER rang où B dépasse A, en montrant qu’au rang précédent ce ' +
          'n’était pas encore le cas. Coche « Je parie d’abord » pour proposer une année avant de voir la réponse.',
      },
      {
        kind: 'entrainement',
        title: 'Suites géométriques, formule générale et termes',
        generatorId: '56gen2',
        description: [
          'Retrouve un terme, la raison ou le premier terme d’une suite géométrique (avec le piège de la racine paire : ' +
            'une ou deux raisons), insère k termes entre deux nombres, isole une inconnue x ou le rang n d’un terme, et ' +
            'calcule une somme.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Suites géométriques, formule générale et termes »',
      },
      {
        kind: 'entrainement',
        title: 'Sommes de termes consécutifs',
        generatorId: '56gen4',
        description: [
          'Calcule la somme de uₚ à uₙ d’une suite arithmétique ou géométrique, ou une somme écrite en extension ' +
            '(7 + 11 + … + 203, 3 + 6 + 12 + … + 3 072) : compte les termes, trouve le premier terme de la somme, puis ' +
            'applique la bonne formule.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Sommes de termes consécutifs »',
      },
      {
        kind: 'entrainement',
        title: 'Trois termes consécutifs',
        generatorId: '56gen5',
        description: [
          'Trois nombres dépendent de x : pour quelles valeurs forment-ils trois termes consécutifs d’une suite ' +
            'arithmétique (2b = a + c) ou géométrique (b² = a·c) ? Retrouve aussi quatre termes consécutifs dont on ' +
            'connaît la somme ou le produit, et le triangle rectangle dont les côtés forment une suite géométrique (q² = Φ).',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Trois termes consécutifs »',
      },
      {
        kind: 'entrainement',
        title: 'Modéliser une situation par une suite',
        generatorId: '56gen9',
        description: [
          'Des situations concrètes (salaire, population, épargne, valeur d’une voiture…) qui évoluent d’une quantité ' +
            'ou d’un pourcentage constant : reconnais la suite, trouve u₁ et la raison, puis calcule la valeur d’une ' +
            'année, un total ou la première année où l’on franchit un seuil.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Modéliser une situation par une suite »',
      },
      {
        kind: 'entrainement',
        title: 'Comparaison numérique de deux suites',
        generatorId: '56gen11',
        description: [
          'Calcule deux suites concurrentes (villes, stocks, épargne, modèle de Malthus) sur une plage de rangs, ' +
            'repère le premier rang où l’une dépasse l’autre en vérifiant le rang précédent, puis traduis ce rang en ' +
            'année ou en mois.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Comparaison numérique de deux suites »',
      },
      // ⟨fin-etape suites-geometriques⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'limite-suite',
    number: 9,
    title: 'Limite d’une suite',
    kicker: 'convergence, définition avec ε',
    titreCourt: 'Limite d’une suite',
    partie: 'Les suites',
    essentiel: [
      R`$\lim\limits_{n\to+\infty} u_n = \ell$ signifie : pour tout $\varepsilon > 0$, il existe un rang $m$ tel que $n > m \Rightarrow |u_n - \ell| < \varepsilon$. La suite est alors **convergente** ; sinon, elle est **divergente**.`,
      R`Arithmétique : $+\infty$ si $r > 0$, $-\infty$ si $r < 0$. Géométrique : $0$ si $0 < |q| < 1$, $u_1$ si $q = 1$, $\pm\infty$ (signe de $u_1$) si $q > 1$, pas de limite si $q \leq -1$.`,
      R`Les rapports de deux termes consécutifs de la suite de Fibonacci vérifient $v_{n+1} = 1 + \dfrac{1}{v_n}$ et tendent vers le nombre d'or $\Phi = \dfrac{1+\sqrt{5}}{2}$.`,
    ],
    cartes: [
      { question: R`Que signifie $|u_n - \ell| < \varepsilon$ sur un graphique ?`, reponse: R`Le point $(n\,;u_n)$ est dans la bande horizontale comprise entre $\ell - \varepsilon$ et $\ell + \varepsilon$.` },
      { question: R`$u_n = 2 + \dfrac{1}{n}$ : à partir de quel rang a-t-on $|u_n - 2| < 0{,}01$ ?`, reponse: R`$\dfrac{1}{n} < 0{,}01 \iff n > 100$ : $m = 100$.` },
      { question: R`Limite d'une suite géométrique de raison $q = -1$ ?`, reponse: R`Aucune : elle oscille entre $u_1$ et $-u_1$, sans tendre vers l'infini.` },
      { question: R`Pourquoi $1{,}05^n$ tend-il vers $+\infty$ ?`, reponse: R`$1{,}05^n \geq 1 + 0{,}05\,n$, qui dépasse n'importe quel réel quand $n$ grandit.` },
    ],
    blocks: [
      { kind: 'video', title: 'Limite d’une suite : définition avec ε, suites convergentes et divergentes' },
      {
        kind: 'intuition',
        label: 'Pour visualiser : un couloir autour de ℓ',
        text: R`Imagine une bande horizontale, aussi étroite que tu veux, centrée sur un nombre $\ell$. Dire qu'une suite **tend vers** $\ell$, c'est dire que, quelle que soit la largeur de la bande, les points de la suite finissent par y entrer **et ne plus en sortir**. Une bande plus étroite oblige à attendre plus longtemps, mais un tel rang existe toujours. Quelques points dans la bande ne suffisent pas : il faut que **tous** les suivants y restent.`,
      },
      {
        kind: 'para',
        text: R`Que deviennent les termes d'une suite quand $n$ devient de plus en plus grand ? Compare trois suites :`,
      },
      {
        kind: 'featureTable',
        headers: ['n', '(−1)ⁿ', '1,5 − 0,75n', '2ⁿ'],
        rows: [
          ['1', R`$-1$`, R`$0{,}75$`, R`$2$`],
          ['2', R`$1$`, R`$0$`, R`$4$`],
          ['3', R`$-1$`, R`$-0{,}75$`, R`$8$`],
          ['4', R`$1$`, R`$-1{,}5$`, R`$16$`],
          ['5', R`$-1$`, R`$-2{,}25$`, R`$32$`],
          ['10', R`$1$`, R`$-6$`, R`$1\,024$`],
          ['20', R`$1$`, R`$-13{,}5$`, R`$1\,048\,576$`],
          ['50', R`$1$`, R`$-36$`, R`$\approx 1{,}13 \times 10^{15}$`],
          ['100', R`$1$`, R`$-73{,}5$`, R`$\approx 1{,}27 \times 10^{30}$`],
        ],
      },
      {
        kind: 'para',
        text: R`Quand $n \to +\infty$, les termes d'une suite peuvent devenir aussi proches qu'on veut d'un réel $\ell$, à partir d'un certain rang : la suite **converge** vers $\ell$. Ils peuvent devenir plus grands que n'importe quel réel positif (limite $+\infty$, comme $2^n$), ou plus petits que n'importe quel réel négatif (limite $-\infty$, comme $1{,}5 - 0{,}75n$). Ou n'avoir aucun de ces comportements, comme $(-1)^n$, qui saute de $-1$ à $1$ sans jamais se fixer.`,
      },
      {
        kind: 'definition',
        label: 'Définitions — limite d’une suite, suite convergente',
        items: [
          R`Soit $(u_n)_{n\in\mathbb{N}_0}$ une suite et $\ell$ un réel. On dit que $\ell$ est la **limite** de la suite, et on note $\lim\limits_{n\to+\infty} u_n = \ell$, si et seulement si $\forall \varepsilon \in \mathbb{R}_0^+$, $\exists m \in \mathbb{N}_0$ : $n > m \Rightarrow |u_n - \ell| < \varepsilon$.`,
          R`On dit que $\lim\limits_{n\to+\infty} u_n = +\infty$ si et seulement si $\forall r \in \mathbb{R}_0^+$, $\exists m \in \mathbb{N}_0$ : $n > m \Rightarrow u_n > r$.`,
          R`On dit que $\lim\limits_{n\to+\infty} u_n = -\infty$ si et seulement si $\forall r \in \mathbb{R}_0^-$, $\exists m \in \mathbb{N}_0$ : $n > m \Rightarrow u_n < r$.`,
          R`Une suite dont la limite est un **réel** est dite **convergente**. Une suite qui n'est pas convergente (limite infinie, ou pas de limite du tout) est dite **divergente**.`,
        ],
      },
      {
        kind: 'rappel',
        label: 'Lire la définition',
        items: [
          R`« Pour tout $\varepsilon > 0$ » : quelle que soit la précision exigée, aussi petite soit-elle…`,
          R`« il existe un rang $m$ » : … on peut trouver un rang, qui dépend de $\varepsilon$…`,
          R`« $n > m \Rightarrow |u_n - \ell| < \varepsilon$ » : … au-delà duquel **tous** les termes sont à moins de $\varepsilon$ de $\ell$. Comme $|u_n - \ell| < \varepsilon \iff \ell - \varepsilon < u_n < \ell + \varepsilon$ (étape 4), les points $(n\,;u_n)$ restent alors dans la bande de hauteur $2\varepsilon$ centrée sur $\ell$.`,
          R`L'ordre des quantificateurs compte (étape 3) : $\varepsilon$ est choisi d'abord, $m$ ensuite, en fonction de $\varepsilon$.`,
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [],
          xMin: 0.4,
          xMax: 12.6,
          xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          yTicks: [1.75, 2, 2.25, 2.5, 3],
          yTickLabels: { 1.75: '1,75', 2: '2', 2.25: '2,25', 2.5: '2,5', 3: '3' },
          fixedYRange: { min: 1.5, max: 3.2 },
          shadedRegions: [{ from: 0.4, to: 12.6, upper: () => 2.25, lower: () => 1.75, tone: 'good' }],
          horizontalAsymptotes: [{ y: 2, label: 'ℓ = 2' }],
          points: Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 2 + 1 / (i + 1), label: '', tone: (i + 1 > 4 ? 'good' : 'bad') as 'good' | 'bad' })),
          xAxisLabel: 'n',
          yAxisLabel: 'u_n',
          caption: R`$u_n = 2 + \dfrac{1}{n}$ et la bande de hauteur $2\varepsilon$ autour de $\ell = 2$, pour $\varepsilon = 0{,}25$ : dès que $n > 4$, tous les points sont dans la bande (en vert). Ici, $m = 4$ convient.`,
        },
      },
      {
        kind: 'exemple',
        badge: 'trouver le rang m pour un ε donné : forme rationnelle',
        formula: R`On considère la suite $u_n = \dfrac{2n+3}{n+1}$. Trouve un rang $m$ au-delà duquel $|u_n - 2| < 10^{-3}$, puis montre qu'un tel rang existe pour tout $\varepsilon > 0$.`,
        steps: [
          { tag: 'simplifier l’écart', text: R`$u_n - 2 = \dfrac{2n + 3 - 2(n+1)}{n+1}$, donc $u_n - 2 = \dfrac{1}{n+1}$, qui est positif` },
          { tag: 'résoudre l’inéquation', text: R`$\dfrac{1}{n+1} < 10^{-3} \iff n + 1 > 1\,000$, c'est-à-dire $n > 999$ : $m = 999$ convient.` },
          { tag: 'pour un ε quelconque', text: R`$\dfrac{1}{n+1} < \varepsilon \iff n > \dfrac{1}{\varepsilon} - 1$ : tout naturel $m \geq \dfrac{1}{\varepsilon} - 1$ convient, et il en existe (axiome d'Archimède, étape 3).` },
        ],
        result: { tag: 'résultat', text: R`Pour $\varepsilon = 10^{-3}$, $m = 999$ ; un tel rang existe pour tout $\varepsilon > 0$, donc $\lim\limits_{n\to+\infty} \dfrac{2n+3}{n+1} = 2$.` },
      },
      {
        kind: 'exemple',
        badge: 'trouver le rang m avec la table de la calculatrice',
        formula: R`On considère la suite $u_n = 3 + 5 \times 0{,}8^n$. À partir de quel rang a-t-on $|u_n - 3| < 0{,}01$ ?`,
        steps: [
          { tag: 'l’écart', text: R`$|u_n - 3| = 5 \times 0{,}8^n$, donc on cherche $5 \times 0{,}8^n < 0{,}01$, c'est-à-dire $0{,}8^n < 0{,}002$` },
          { tag: 'n en exposant : la table', text: R`Menu Table, fonction $0{,}8^x$ : $0{,}8^{27} \approx 0{,}002\,42$ et $0{,}8^{28} \approx 0{,}001\,93$.` },
          { tag: 'tous les suivants conviennent', text: R`La suite $0{,}8^n$ est décroissante : si $0{,}8^{28} < 0{,}002$, tous les termes suivants le sont aussi.` },
        ],
        result: { tag: 'résultat', text: R`$|u_n - 3| < 0{,}01$ pour tout $n \geq 28$ : le rang $m = 27$ convient.` },
      },
      { kind: 'subheading', text: 'Limites des suites arithmétiques et géométriques' },
      {
        kind: 'featureTable',
        caption: 'Suite arithmétique de raison r.',
        headers: ['raison r', 'comportement', 'limite'],
        rows: [
          ['r > 0', 'strictement croissante', R`$\lim\limits_{n\to+\infty} u_n = +\infty$`],
          ['r < 0', 'strictement décroissante', R`$\lim\limits_{n\to+\infty} u_n = -\infty$`],
          ['r = 0', 'constante', R`$\lim\limits_{n\to+\infty} u_n = u_1$`],
        ],
      },
      {
        kind: 'featureTable',
        caption: 'Suite géométrique de raison q ≠ 0.',
        headers: ['raison q', 'comportement', 'limite'],
        rows: [
          ['q ≤ −1', 'signes alternés, |uₙ| ne diminue pas', 'pas de limite'],
          ['0 < |q| < 1', '|uₙ| diminue', R`$\lim\limits_{n\to+\infty} u_n = 0$`],
          ['q = 1', 'constante', R`$\lim\limits_{n\to+\infty} u_n = u_1$`],
          ['q > 1 et u₁ > 0', 'strictement croissante', R`$\lim\limits_{n\to+\infty} u_n = +\infty$`],
          ['q > 1 et u₁ < 0', 'strictement décroissante', R`$\lim\limits_{n\to+\infty} u_n = -\infty$`],
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — une suite arithmétique de raison r > 0 tend vers +∞',
        blocks: [
          { kind: 'para', text: R`Soit $(u_n)$ une suite arithmétique de raison $r > 0$, et soit un réel $A > 0$ (il joue le rôle du $r$ de la définition ; on le renomme pour ne pas le confondre avec la raison). Il faut trouver un rang $m$ au-delà duquel $u_n > A$.` },
          { kind: 'para', text: R`$u_n > A \iff u_1 + (n-1)r > A$, c'est-à-dire $n > 1 + \dfrac{A - u_1}{r}$ (on divise par $r > 0$ : le sens ne change pas).` },
          { kind: 'para', text: R`Par l'axiome d'Archimède (étape 3), il existe un naturel $m$ supérieur au réel $1 + \dfrac{A - u_1}{r}$. Alors, pour tout $n > m$, on a $u_n > A$.` },
          { kind: 'para', text: R`**Conclusion.** $\lim\limits_{n\to+\infty} u_n = +\infty$. Pour $r < 0$, le même raisonnement, avec un réel $A < 0$ et en changeant le sens de l'inégalité quand on divise par $r$, donne $-\infty$.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — qⁿ tend vers +∞ si q > 1',
        blocks: [
          { kind: 'para', text: R`**Une inégalité utile.** Pose $q = 1 + h$, avec $h > 0$. Alors $(1+h)^n = (1+h)(1+h)\cdots(1+h)$, un produit de $n$ facteurs. Développe-le en distribuant : on obtient une somme de produits, chacun formé en prenant, dans chaque facteur, soit $1$, soit $h$.` },
          { kind: 'para', text: R`Prendre $1$ partout donne le produit $1$. Prendre $h$ dans un seul facteur et $1$ dans les autres donne $h$, et ce de $n$ façons. Tous les autres produits ($h^2$, $h^3$…) sont positifs. Donc $(1+h)^n \geq 1 + nh$. Par exemple, $1{,}1^{10} \approx 2{,}59 \geq 1 + 10 \times 0{,}1 = 2$.` },
          { kind: 'para', text: R`**La limite.** Soit un réel $A > 0$. Par l'axiome d'Archimède, il existe un naturel $m \geq \dfrac{A - 1}{h}$. Pour tout $n > m$, on a $1 + nh > A$, donc $q^n \geq 1 + nh > A$. Ainsi $\lim\limits_{n\to+\infty} q^n = +\infty$.` },
          { kind: 'para', text: R`**Conclusion pour la suite géométrique.** $u_n = u_1\,q^{n-1} = \dfrac{u_1}{q}\,q^n$ : un multiple de $q^n$ par un nombre positif si $u_1 > 0$ (la suite tend vers $+\infty$), par un nombre négatif si $u_1 < 0$ (elle tend vers $-\infty$).` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — qⁿ tend vers 0 si 0 < |q| < 1',
        blocks: [
          { kind: 'para', text: R`Pose $Q = \dfrac{1}{|q|}$. Comme $0 < |q| < 1$, on a $Q > 1$, donc $Q^n$ tend vers $+\infty$ (démonstration précédente).` },
          { kind: 'para', text: R`Soit $\varepsilon > 0$. Il existe un rang $m$ tel que, pour tout $n > m$, $Q^n > \dfrac{1}{\varepsilon}$. Alors $|q^n - 0| = |q|^n = \dfrac{1}{Q^n} < \varepsilon$.` },
          { kind: 'para', text: R`**Conclusion.** $\lim\limits_{n\to+\infty} q^n = 0$. Pour la suite géométrique $u_n = \dfrac{u_1}{q}\,q^n$, le même raisonnement, appliqué à $\dfrac{\varepsilon\,|q|}{|u_1|}$ au lieu de $\varepsilon$, montre que $u_n$ tend aussi vers $0$.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — si q ≤ −1, la suite géométrique n’a pas de limite',
        blocks: [
          { kind: 'para', text: R`Si $q \leq -1$, deux termes consécutifs $u_n$ et $u_{n+1} = q\,u_n$ sont de signes contraires, et $|u_{n+1}| = |q|\,|u_n| \geq |u_n|$ : tous les termes vérifient $|u_n| \geq |u_1|$.` },
          { kind: 'para', text: R`**Pas de limite infinie** : les signes alternent, donc la suite ne reste jamais au-dessus d'un réel positif, ni en dessous d'un réel négatif.` },
          { kind: 'para', text: R`**Pas de limite réelle** : si la suite tendait vers un réel $\ell$, prenons $\varepsilon = |u_1|$. À partir d'un certain rang, tous les termes seraient dans l'intervalle $]\ell - |u_1|\,;\ell + |u_1|[$, de longueur $2|u_1|$. Or deux termes consécutifs, de signes contraires, sont à la distance $|u_{n+1} - u_n| = |u_{n+1}| + |u_n| \geq 2|u_1|$ : ils ne peuvent pas être tous les deux dans un intervalle ouvert de longueur $2|u_1|$. C'est une contradiction.` },
          { kind: 'para', text: R`**Conclusion.** Si $q \leq -1$, la suite n'a pas de limite. Pour $q = -1$, elle oscille entre $u_1$ et $-u_1$ ; pour $q < -1$, elle oscille avec des termes de plus en plus grands en valeur absolue.` },
        ],
      },
      {
        kind: 'attention',
        label: 'Attention — q = −1 ne diverge pas vers l’infini',
        text: R`Une suite géométrique de raison $q = -1$ (ex. $3$ ; $-3$ ; $3$ ; $-3$ ; …) reste coincée entre $u_1$ et $-u_1$ : elle ne tend ni vers $+\infty$ ni vers $-\infty$, et elle ne se stabilise sur aucune valeur. Sa limite n'existe pas. Ne la range ni avec les cas $q > 1$, ni avec les cas convergents.`,
      },
      {
        kind: 'atelier',
        tag: 'convergence-suite-widget',
        label: 'Manipule toi-même — les comportements à l’infini en direct',
        caption:
          'Bascule entre arithmétique et géométrique, puis fais glisser la raison : passe par q = −1 pile (points en ' +
          'rouge) pour voir l’oscillation qui ne tend PAS vers l’infini, à ne pas confondre avec q > 1. Coche ensuite ' +
          '« Afficher une bande ε » : pour une suite convergente, à partir d’un certain rang N, tous les termes restent ' +
          'dans la bande autour de la limite — c’est exactement la définition. Rétrécis ε : N recule, mais il existe ' +
          'toujours. Pour q = −1, aucune bande étroite ne convient.',
      },
      { kind: 'subheading', text: 'Le cas d’un quotient de deux polynômes en n' },
      {
        kind: 'methode',
        label: 'Méthode — comparer les degrés',
        items: [
          R`Divise le numérateur ET le dénominateur par la plus haute puissance de $n$ du **dénominateur** : des termes en $\dfrac{1}{n}$, $\dfrac{1}{n^2}$… apparaissent, et ils tendent vers $0$ (par exemple, $\dfrac{1}{n} < \varepsilon$ dès que $n > \dfrac{1}{\varepsilon}$).`,
          R`Degré du numérateur plus petit que celui du dénominateur : la limite vaut $0$.`,
          R`Degrés égaux : la limite est le **rapport des coefficients dominants**.`,
          R`Degré du numérateur plus grand : la limite vaut $+\infty$ ou $-\infty$, selon les signes des coefficients dominants.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'limite d’un quotient de polynômes : degrés égaux',
        formula: R`Calcule $\lim\limits_{n\to+\infty} \dfrac{3n - 1}{2n + 5}$.`,
        steps: [
          { tag: 'diviser par n, la plus haute puissance du dénominateur', text: R`$\dfrac{3n - 1}{2n + 5} = \dfrac{3 - \frac{1}{n}}{2 + \frac{5}{n}}$` },
          { tag: 'les termes en 1⁄n tendent vers 0', text: R`$\dfrac{3 - \frac{1}{n}}{2 + \frac{5}{n}}$ tend vers $\dfrac{3 - 0}{2 + 0} = \dfrac{3}{2}$` },
        ],
        result: { tag: 'résultat', text: R`$\lim\limits_{n\to+\infty} \dfrac{3n - 1}{2n + 5} = \dfrac{3}{2}$ : même degré, rapport des coefficients dominants.` },
      },
      { kind: 'subheading', text: 'Les rapports de Fibonacci tendent vers le nombre d’or' },
      {
        kind: 'para',
        text: R`La **suite de Fibonacci** est définie par $F_1 = F_2 = 1$ et $F_{n+2} = F_{n+1} + F_n$ : chaque terme est la somme des deux précédents. Elle commence par $1$, $1$, $2$, $3$, $5$, $8$, $13$, $21$, $34$, $55$, $89$, $144$… On la retrouve dans les spirales de nombreuses plantes : $8$ spirales d'écailles dans un sens et $13$ dans l'autre sur un ananas, $21$ et $34$ (ou $34$ et $55$) dans un cœur de tournesol, $5$ et $8$ sur une pomme de pin. Regardons les rapports de deux termes consécutifs, $v_n = \dfrac{F_{n+1}}{F_n}$.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la récurrence des rapports de Fibonacci et leur limite',
        blocks: [
          { kind: 'para', text: R`**La récurrence.** $v_{n+1} = \dfrac{F_{n+2}}{F_{n+1}} = \dfrac{F_{n+1} + F_n}{F_{n+1}} = 1 + \dfrac{F_n}{F_{n+1}}$, c'est-à-dire $v_{n+1} = 1 + \dfrac{1}{v_n}$.` },
          { kind: 'para', text: R`**Si la suite converge** vers un réel $\ell$, alors $v_{n+1}$ tend aussi vers $\ell$ (c'est la même suite, décalée d'un rang), et $1 + \dfrac{1}{v_n}$ tend vers $1 + \dfrac{1}{\ell}$. Donc $\ell = 1 + \dfrac{1}{\ell}$, soit $\ell^2 - \ell - 1 = 0$.` },
          { kind: 'para', text: R`Cette équation a deux solutions, $\dfrac{1+\sqrt{5}}{2}$ et $\dfrac{1-\sqrt{5}}{2}$. Tous les $v_n$ sont supérieurs ou égaux à $1$, donc $\ell \geq 1$ : $\ell = \dfrac{1+\sqrt{5}}{2} = \Phi \approx 1{,}618$, le nombre d'or (étape 1).` },
          { kind: 'para', text: R`**Conclusion.** Les rapports ($1$ ; $2$ ; $1{,}5$ ; $1{,}667$ ; $1{,}6$ ; $1{,}625$ ; $1{,}615$ ; $1{,}619$ ; $1{,}618$…) se rapprochent de $\Phi$, alternativement au-dessus et en dessous. Que la suite converge effectivement, nous l'admettons ici, sur la foi de la table et de la figure.` },
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'sequencePlot',
          points: [
            { n: 1, value: 1, label: '' },
            { n: 2, value: 2, label: '2' },
            { n: 3, value: 1.5, label: '1,5' },
            { n: 4, value: 5 / 3, label: '1,667' },
            { n: 5, value: 1.6, label: '1,6' },
            { n: 6, value: 1.625, label: '1,625' },
            { n: 7, value: 21 / 13, label: '' },
            { n: 8, value: 34 / 21, label: '' },
            { n: 9, value: 55 / 34, label: '' },
            { n: 10, value: 89 / 55, label: '' },
          ],
          connector: 'none',
          yTicks: [1, 2],
          referenceLine: { value: (1 + Math.sqrt(5)) / 2, label: 'Φ' },
          xAxisLabel: 'n',
          yAxisLabel: 'v_n',
          caption: R`Les rapports $v_n = \dfrac{F_{n+1}}{F_n}$ oscillent autour de $\Phi \approx 1{,}618$ et s'en rapprochent.`,
        },
      },
      {
        kind: 'exemple',
        badge: 'deux rapports consécutifs à moins de 10⁻⁴',
        formula: R`À l'aide de la table des nombres de Fibonacci, détermine un rang à partir duquel $|v_{n+1} - v_n| < 10^{-4}$.`,
        steps: [
          { tag: 'les nombres utiles', text: R`$F_{10} = 55$, $F_{11} = 89$, $F_{12} = 144$, $F_{13} = 233$` },
          { tag: 'au rang 10', text: R`$|v_{11} - v_{10}| = \left|\dfrac{144}{89} - \dfrac{89}{55}\right|$ $= \dfrac{1}{4\,895} \approx 2{,}0 \times 10^{-4}$ : trop grand` },
          { tag: 'au rang 11', text: R`$|v_{12} - v_{11}| = \left|\dfrac{233}{144} - \dfrac{144}{89}\right|$ $= \dfrac{1}{12\,816} \approx 7{,}8 \times 10^{-5}$` },
          { tag: 'la suite de la table', text: R`Les écarts suivants sont encore plus petits (le dénominateur grandit à chaque rang).` },
        ],
        result: { tag: 'résultat', text: R`$|v_{n+1} - v_n| < 10^{-4}$ dès $n = 11$.` },
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — les puissances du nombre d’or',
        blocks: [
          { kind: 'para', text: R`Sachant que $\Phi^2 = \Phi + 1$, écris $\Phi^3$, $\Phi^4$, $\Phi^5$ et $\Phi^6$ sous la forme $a\Phi + b$. Que remarques-tu ?` },
          { kind: 'para', text: R`**La règle de calcul.** Si $\Phi^n = a\Phi + b$, alors $\Phi^{n+1} = a\Phi^2 + b\Phi$, donc $\Phi^{n+1} = a(\Phi + 1) + b\Phi = (a + b)\Phi + a$.` },
          { kind: 'para', text: R`**Les puissances.** $\Phi^2 = \Phi + 1$, $\Phi^3 = 2\Phi + 1$, $\Phi^4 = 3\Phi + 2$, $\Phi^5 = 5\Phi + 3$, $\Phi^6 = 8\Phi + 5$.` },
          { kind: 'para', text: R`**Constat.** Les coefficients sont des nombres de Fibonacci consécutifs : $\Phi^n = F_n\,\Phi + F_{n-1}$ pour $n \geq 2$. C'est la règle de calcul (nouveau coefficient de $\Phi$ : $a + b$ ; nouveau terme constant : $a$) qui les fabrique, comme la règle de Fibonacci. Contrôle numérique : $8\Phi + 5 \approx 17{,}944$ et $\Phi^6 \approx 17{,}944$.` },
        ],
      },
      {
        kind: 'atelier',
        tag: 'fibonacci-nombre-d-or-widget',
        label: 'Manipule toi-même — Fibonacci et le nombre d’or',
        caption:
          'Choisis les deux premiers termes, puis applique la règle uₙ₊₂ = uₙ₊₁ + uₙ. Le rapport de deux termes ' +
          'successifs oscille autour de φ ≈ 1,618, alternativement au-dessus et en dessous, et s’en rapproche — quels ' +
          'que soient les deux premiers termes, sauf s’ils sont tous les deux nuls.',
      },
      {
        kind: 'historique',
        titre: 'Des lapins, des chiffres et un livre de calcul',
        text: R`En 1202, le marchand et mathématicien italien **Leonardo Fibonacci** (Léonard de Pise) publie le **Liber Abaci**, le « livre du calcul », qui fait connaître en Europe les chiffres indo-arabes de $0$ à $9$. Il y pose un problème de lapins : un couple engendre chaque mois un nouveau couple à partir de son deuxième mois d'existence ; combien de couples aura-t-on au bout d'un an ? Les nombres de couples, mois après mois, forment exactement la suite qui porte aujourd'hui son nom. Fibonacci ne l'a pas inventée : elle apparaît des siècles plus tôt chez des savants indiens, à propos de rythmes poétiques. Son lien avec le nombre d'or a été étudié bien plus tard, notamment par Kepler.`,
        image: {
          src: '/images/historique/fibonacci.jpg',
          alt: 'Portrait imaginé de Leonardo Fibonacci',
          caption: 'Portrait imaginé de Leonardo Fibonacci, gravure italienne du 19e siècle (aucun portrait contemporain de Fibonacci n’existe).',
        },
      },
      {
        kind: 'entrainement',
        title: 'Convergence et divergence des suites',
        generatorId: '56gen6',
        description: [
          'Décide la limite d’une suite arithmétique ou géométrique (avec les pièges q = −1 et q < −1), ou d’un ' +
            'quotient de deux polynômes en n en comparant les degrés.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Convergence et divergence des suites »',
      },
      {
        kind: 'entrainement',
        title: 'Rang à partir duquel |uₙ − ℓ| < ε',
        generatorId: '56gen22',
        description: [
          'Pour une suite qui converge vers ℓ, trouve le premier rang à partir duquel |uₙ − ℓ| < ε : en résolvant une ' +
            'inéquation (quotient de deux expressions du premier degré en n) ou avec la table de la calculatrice ' +
            '(ℓ + k·qⁿ, rapports de Fibonacci).',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Rang à partir duquel |uₙ − ℓ| < ε »',
      },
      // ⟨fin-etape limite-suite⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'sommes-infinies',
    number: 10,
    title: 'Sommes infinies',
    kicker: 'limite des sommes partielles, série harmonique',
    titreCourt: 'Sommes infinies',
    partie: 'Les suites',
    essentiel: [
      R`La somme de tous les termes d'une suite est, par définition, la limite (si elle existe) de ses sommes partielles $S_n = u_1 + \ldots + u_n$ ; elle se note $\sum\limits_{i=1}^{+\infty} u_i$.`,
      R`Suite géométrique avec $0 < |q| < 1$ : $\sum\limits_{i=1}^{+\infty} u_i = \dfrac{u_1}{1-q}$. Si $|q| \geq 1$ (et $u_1 \neq 0$), la somme infinie n'est pas un réel ; une suite arithmétique non nulle donne $+\infty$ ou $-\infty$.`,
      R`Des termes qui tendent vers $0$ ne suffisent pas : la série harmonique $1 + \dfrac{1}{2} + \dfrac{1}{3} + \ldots$ tend vers $+\infty$. Une suite qui décroît ne tend pas forcément vers $0$ (carré tournant).`,
    ],
    cartes: [
      { question: R`Que vaut $6 + 2 + \dfrac{2}{3} + \dfrac{2}{9} + \ldots$ ?`, reponse: R`$q = \dfrac{1}{3}$, donc $\dfrac{6}{1 - \frac{1}{3}} = 9$.` },
      { question: R`Balle lâchée de $2$ m qui remonte à $75\,\%$ de sa hauteur : distance totale ?`, reponse: R`$2 + 2 \times \dfrac{1{,}5}{1 - 0{,}75} = 2 + 12 = 14$ m.` },
      { question: R`Les termes de la série harmonique tendent vers $0$ : sa somme est-elle finie ?`, reponse: R`Non : par paquets de termes valant chacun au moins $\dfrac{1}{2}$, elle dépasse tout réel.` },
      { question: 'Flocon de von Koch : que deviennent l’aire et le périmètre ?', reponse: R`L'aire tend vers $\dfrac{2\sqrt{3}}{5}$, le périmètre vers $+\infty$.` },
    ],
    blocks: [
      { kind: 'video', title: 'Sommes infinies : somme d’une suite géométrique, Zénon, série harmonique et fractales' },
      {
        kind: 'para',
        text: R`Quelle est la somme $u_1 + u_2 + u_3 + \ldots$ de **tous** les termes d'une suite ? On ne peut pas faire une infinité d'additions : il faut d'abord donner un sens à cette écriture. L'idée : additionner de plus en plus de termes, et regarder vers quoi tendent ces sommes.`,
      },
      {
        kind: 'definition',
        label: 'Définition — somme de tous les termes d’une suite',
        items: [
          R`La **somme partielle** de rang $n$ de la suite $(u_n)$ est $S_n = u_1 + u_2 + \ldots + u_n = \sum\limits_{i=1}^{n} u_i$.`,
          R`La somme de tous les termes de $(u_n)$ est, par définition, la limite des sommes partielles, si elle existe : $\sum\limits_{i=1}^{+\infty} u_i = \lim\limits_{n\to+\infty} S_n$.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — un carré coupé en deux, puis encore en deux',
        blocks: [
          { kind: 'para', text: R`On colorie la moitié d'un carré d'aire $1$, puis la moitié de la surface restante, puis la moitié de ce qui reste, et ainsi de suite indéfiniment. Calcule les aires coloriées et leur somme.` },
          { kind: 'para', text: R`**Les aires coloriées** forment la suite $\dfrac{1}{2}$ ; $\dfrac{1}{4}$ ; $\dfrac{1}{8}$ ; … : géométrique, de premier terme $\dfrac{1}{2}$ et de raison $\dfrac{1}{2}$. Son terme général $u_n = \dfrac{1}{2^n}$ tend vers $0$.` },
          { kind: 'para', text: R`**Les sommes partielles.** Après $n$ étapes, il reste à colorier une surface d'aire $\dfrac{1}{2^n}$, donc $S_n = 1 - \dfrac{1}{2^n}$. La formule de l'étape 8 donne la même chose : $S_n = \dfrac{1}{2} \times \dfrac{1 - \frac{1}{2^n}}{1 - \frac{1}{2}} = 1 - \dfrac{1}{2^n}$.` },
          { kind: 'para', text: R`**Conclusion.** $\dfrac{1}{2^n}$ tend vers $0$, donc $S_n$ tend vers $1$ : $\dfrac{1}{2} + \dfrac{1}{4} + \dfrac{1}{8} + \ldots = 1$. Une infinité d'aires, qui remplissent exactement le carré de départ.` },
          {
            kind: 'illustration',
            illustration: {
              kind: 'sequencePlot',
              points: [
                { n: 1, value: 0.5, label: '' },
                { n: 2, value: 0.75, label: '0,75' },
                { n: 3, value: 0.875, label: '0,875' },
                { n: 4, value: 0.9375, label: '' },
                { n: 5, value: 0.96875, label: '' },
                { n: 6, value: 0.984375, label: '' },
                { n: 7, value: 0.9921875, label: '' },
                { n: 8, value: 0.99609375, label: '' },
              ],
              connector: 'none',
              yTicks: [1],
              referenceLine: { value: 1, label: '1' },
              xAxisLabel: 'n',
              yAxisLabel: 'S_n',
              caption: R`Les sommes partielles $S_n = 1 - \dfrac{1}{2^n}$ se rapprochent de $1$.`,
            },
          },
        ],
      },
      { kind: 'subheading', text: 'Suites arithmétiques et géométriques' },
      {
        kind: 'rappel',
        label: 'Somme de tous les termes d’une suite arithmétique ou géométrique',
        items: [
          R`**Arithmétique** de raison $r$ : si $r > 0$, $\lim\limits_{n\to+\infty} S_n = +\infty$ ; si $r < 0$, $\lim\limits_{n\to+\infty} S_n = -\infty$. Si $r = 0$, $S_n = n\,u_1$ tend vers $+\infty$ ou $-\infty$ selon le signe de $u_1$ (sauf pour la suite nulle).`,
          R`**Géométrique** de raison $q \neq 0$ : si $0 < |q| < 1$, $\sum\limits_{i=1}^{+\infty} u_i = \lim\limits_{n\to+\infty} S_n = \dfrac{u_1}{1-q}$.`,
          R`Si $q = 1$, $S_n = n\,u_1$ tend vers $+\infty$ ou $-\infty$ (signe de $u_1$) ; si $q > 1$, $S_n$ tend vers $+\infty$ si $u_1 > 0$, vers $-\infty$ si $u_1 < 0$ ; si $q \leq -1$, $(S_n)$ n'a pas de limite.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la somme de tous les termes d’une suite géométrique',
        blocks: [
          { kind: 'para', text: R`Pour $q \neq 1$ (étape 8) : $S_n = u_1\,\dfrac{1-q^n}{1-q}$, qu'on écrit $S_n = \dfrac{u_1}{1-q} - \dfrac{u_1}{1-q}\,q^n$.` },
          { kind: 'para', text: R`**Si** $0 < |q| < 1$, $q^n$ tend vers $0$ (étape 9) : le second terme tend vers $0$, et $S_n$ tend vers $\dfrac{u_1}{1-q}$.` },
          { kind: 'para', text: R`**Si** $q > 1$, $q^n$ tend vers $+\infty$ et $1 - q < 0$ : le second terme, $-\dfrac{u_1}{1-q}\,q^n$, a le signe de $u_1$ et grandit sans borne. **Si** $q \leq -1$, $q^n$ n'a pas de limite, donc $S_n$ non plus.` },
          { kind: 'para', text: R`**Conclusion.** Pour $u_1 \neq 0$, la somme de tous les termes de la suite géométrique est un réel si et seulement si $0 < |q| < 1$, et alors $\sum\limits_{i=1}^{+\infty} u_1\,q^{i-1} = \dfrac{u_1}{1-q}$.` },
        ],
      },
      {
        kind: 'exemple',
        badge: 'somme infinie d’une suite géométrique',
        formula: R`Calcule la somme de tous les termes de la suite géométrique de premier terme $u_1 = 6$ et de raison $q = \dfrac{1}{3}$ : $6 + 2 + \dfrac{2}{3} + \dfrac{2}{9} + \ldots$`,
        steps: [
          { tag: 'vérifier la condition', text: R`$0 < |q| = \dfrac{1}{3} < 1$ : la somme existe.` },
          { tag: 'appliquer la formule', text: R`$\dfrac{6}{1 - \frac{1}{3}} = \dfrac{6}{\frac{2}{3}} = 6 \times \dfrac{3}{2}$` },
        ],
        result: { tag: 'résultat', text: R`$6 + 2 + \dfrac{2}{3} + \dfrac{2}{9} + \ldots = 9$` },
      },
      {
        kind: 'attention',
        label: 'Attention — q = 1 : la suite converge, la somme de ses termes non',
        text: R`Pour $q = 1$, la suite est constante, donc convergente. Mais $S_n = n\,u_1$ grandit sans borne (si $u_1 \neq 0$) : la somme de tous ses termes n'est pas un réel. Une suite peut converger sans que la somme de ses termes soit finie. Vérifie toujours $|q| < 1$, **strictement**, avant d'écrire $\dfrac{u_1}{1-q}$.`,
      },
      {
        kind: 'historique',
        titre: 'Le paradoxe d’Achille et de la tortue',
        text: R`Au 5e siècle avant notre ère, le philosophe grec **Zénon d'Élée** imagine des paradoxes restés célèbres. Pour qu'Achille, le coureur le plus rapide, rattrape une tortue partie avec de l'avance, il doit d'abord atteindre le point de départ de la tortue ; mais pendant ce temps, la tortue a avancé. Achille doit alors atteindre ce nouveau point, et la tortue a encore avancé… Une infinité d'étapes : Zénon en conclut qu'Achille ne rattrapera jamais la tortue. L'erreur est de croire qu'une infinité de durées a forcément une somme infinie. Si Achille court dix fois plus vite que la tortue, les durées des étapes forment une suite géométrique de raison $\dfrac{1}{10}$ : leur somme est finie, et Achille rattrape bien la tortue, en un temps fini.`,
        image: {
          src: '/images/historique/zeno.jpg',
          alt: 'Fresque représentant Zénon d’Élée',
          caption:
            'Zénon d’Élée montrant aux jeunes gens les portes de la Vérité et du Mensonge, fresque attribuée à ' +
            'Pellegrino Tibaldi ou Bartolomeo Carducci, fin du 16e siècle, bibliothèque de l’Escurial (Madrid).',
        },
      },
      {
        kind: 'atelier',
        tag: 'somme-infinie-zenon-widget',
        label: 'Manipule toi-même — une infinité de termes, une somme finie',
        caption:
          'Choisis u₁ et q, puis ajoute des termes. Le carré représente la somme infinie : chaque terme en remplit une ' +
          'part, et ce qui manque est multiplié par q à chaque étape, sans jamais disparaître. Avec q négatif, les ' +
          'sommes font des allers-retours autour de la limite ; avec q ≥ 1, elles ne se stabilisent pas. Le préréglage ' +
          '« 0,999… » montre pourquoi 0,999… = 1.',
      },
      {
        kind: 'exemple',
        badge: '0,999… = 1 et 7,0799… = 7,08',
        formula: R`Écris $0{,}999\ldots$ et $7{,}079\,99\ldots$ (une infinité de $9$) à l'aide d'une somme infinie, puis calcule ces deux nombres.`,
        steps: [
          { tag: 'découper en termes', text: R`$0{,}999\ldots = 0{,}9 + 0{,}09 + 0{,}009 + \ldots$ : géométrique, $u_1 = 0{,}9$ et $q = 0{,}1$` },
          { tag: 'appliquer la formule', text: R`$\dfrac{0{,}9}{1 - 0{,}1} = \dfrac{0{,}9}{0{,}9} = 1$` },
          { tag: 'une partie qui ne se répète pas', text: R`$7{,}079\,99\ldots = 7{,}07 + 0{,}009\,99\ldots$, et $0{,}009 + 0{,}000\,9 + \ldots$ est géométrique ($u_1 = 0{,}009$, $q = 0{,}1$), de somme $\dfrac{0{,}009}{1 - 0{,}1} = 0{,}01$` },
        ],
        result: { tag: 'résultat', text: R`$0{,}999\ldots = 1$ et $7{,}079\,99\ldots = 7{,}08$ : deux écritures décimales d'un même nombre, comme annoncé à l'étape 2.` },
      },
      { kind: 'subheading', text: 'Problèmes classiques de sommes infinies' },
      {
        kind: 'methode',
        label: 'Méthode — une somme infinie en situation',
        items: [
          R`Repère ce qui se répète en se **multipliant** : nomme le terme général, calcule $u_1$, puis la raison $q = \dfrac{u_2}{u_1}$.`,
          R`Vérifie $0 < |q| < 1$ avant d'écrire $\dfrac{u_1}{1-q}$.`,
          R`Reviens à la question posée : la somme infinie n'est souvent qu'**une partie** de la réponse (une partie décimale qui ne se répète pas, une première chute qui ne compte qu'une fois…).`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'la balle qui rebondit',
        formula: R`Une balle est lâchée d'une hauteur de $2$ m. Chaque fois qu'elle touche le sol, elle remonte à $75\,\%$ de sa hauteur précédente. Quelle hauteur atteint-elle après le troisième rebond ? Après combien de rebonds remonte-t-elle à moins de $15$ cm ? Quelle distance parcourt-elle en tout ?`,
        steps: [
          { tag: 'hauteur après le k-ième rebond', text: R`$h_k = 2 \times 0{,}75^k$, donc $h_3 = 2 \times 0{,}75^3 = 0{,}843\,75$ m` },
          { tag: 'le seuil de 15 cm : la table', text: R`$h_9 \approx 0{,}150\,2$ m, encore au-dessus de $0{,}15$ ; $h_{10} \approx 0{,}112\,6$ m.` },
          { tag: 'les remontées', text: R`$h_1 + h_2 + \ldots = \dfrac{1{,}5}{1 - 0{,}75} = 6$ m` },
          { tag: 'la distance totale', text: R`Première chute ($2$ m), puis chaque remontée est suivie d'une descente de même longueur : $2 + 2 \times 6$.` },
        ],
        result: { tag: 'résultat', text: R`Environ $84$ cm après le troisième rebond ; moins de $15$ cm à partir du dixième rebond ; $14$ m parcourus en tout.` },
      },
      {
        kind: 'exemple',
        badge: 'les vagues',
        formula: R`Sur un segment $[AB]$ de longueur $2$, on trace la courbe $C_1$ formée de deux demi-cercles de diamètre $1$, puis $C_2$ formée de quatre demi-cercles de diamètre $\dfrac{1}{2}$, puis $C_3$ formée de huit demi-cercles de diamètre $\dfrac{1}{4}$, et ainsi de suite. Quelle est la longueur de chaque courbe ? Quelle est la somme des aires des surfaces comprises entre chaque courbe et le segment $[AB]$ ?`,
        steps: [
          { tag: 'la courbe Cₙ', text: R`$2^n$ demi-cercles de diamètre $\dfrac{1}{2^{n-1}}$, chacun de longueur $\dfrac{\pi}{2} \times \dfrac{1}{2^{n-1}}$` },
          { tag: 'sa longueur', text: R`$2^n \times \dfrac{\pi}{2^n} = \pi$ : toutes les courbes mesurent $\pi$, et leurs longueurs mises bout à bout tendent vers $+\infty$.` },
          { tag: 'les aires', text: R`Un demi-disque de diamètre $d$ a pour aire $\dfrac{\pi d^2}{8}$ ; sous $C_n$ : $\dfrac{\pi}{4}$, $\dfrac{\pi}{8}$, $\dfrac{\pi}{16}$… : géométrique, $u_1 = \dfrac{\pi}{4}$, $q = \dfrac{1}{2}$.` },
          { tag: 'la somme des aires', text: R`$\dfrac{\frac{\pi}{4}}{1 - \frac{1}{2}} = \dfrac{\pi}{2}$` },
        ],
        result: { tag: 'résultat', text: R`Chaque courbe mesure $\pi$ (leur longueur totale est infinie), mais la somme des aires vaut $\dfrac{\pi}{2}$.` },
      },
      {
        kind: 'exemple',
        badge: 'un pieu enfoncé par coups successifs',
        formula: R`Au premier coup, un pieu s'enfonce de $2$ m dans le sol ; à chaque coup suivant, il s'enfonce de $20\,\%$ de moins qu'au coup précédent. Quelle profondeur atteint-il après $n$ coups ? Cette profondeur est-elle limitée ?`,
        steps: [
          { tag: 'l’enfoncement du k-ième coup', text: R`$2 \times 0{,}8^{\,k-1}$ : géométrique, $u_1 = 2$, $q = 0{,}8$` },
          { tag: 'la profondeur après n coups', text: R`$S_n = 2 \times \dfrac{1 - 0{,}8^n}{1 - 0{,}8} = 10\,(1 - 0{,}8^n)$` },
          { tag: 'la limite', text: R`$0{,}8^n$ tend vers $0$, donc $S_n$ tend vers $10$, sans jamais l'atteindre.` },
        ],
        result: { tag: 'résultat', text: R`La profondeur reste inférieure à $10$ m et s'en rapproche : après $10$ coups, $S_{10} \approx 8{,}93$ m.` },
      },
      { kind: 'subheading', text: 'La série harmonique : des termes qui tendent vers 0, une somme infinie' },
      {
        kind: 'para',
        text: R`On appelle **série harmonique** la somme $1 + \dfrac{1}{2} + \dfrac{1}{3} + \dfrac{1}{4} + \ldots$ des inverses des naturels non nuls. Ses termes tendent vers $0$, et ses sommes partielles grandissent très lentement : $S_{10} \approx 2{,}93$, $S_{100} \approx 5{,}19$, $S_{1\,000} \approx 7{,}49$, et il faut aller jusqu'à $n = 12\,367$ pour dépasser $10$. Ont-elles une limite réelle, comme les sommes géométriques ?`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la série harmonique tend vers +∞',
        blocks: [
          { kind: 'para', text: R`**Des paquets.** Groupe les termes en paquets qui finissent chacun à une puissance de $2$ : $1 + \dfrac{1}{2}$, puis $\dfrac{1}{3} + \dfrac{1}{4}$, puis $\dfrac{1}{5} + \dfrac{1}{6} + \dfrac{1}{7} + \dfrac{1}{8}$, puis $\dfrac{1}{9} + \ldots + \dfrac{1}{16}$, et ainsi de suite.` },
          { kind: 'para', text: R`**Chaque paquet vaut au moins** $\dfrac{1}{2}$. Le paquet qui finit à $\dfrac{1}{2^k}$ commence à $\dfrac{1}{2^{k-1}+1}$ : il contient $2^{k-1}$ termes, tous supérieurs ou égaux au dernier, $\dfrac{1}{2^k}$. Sa somme vaut donc au moins $2^{k-1} \times \dfrac{1}{2^k} = \dfrac{1}{2}$. Par exemple, $\dfrac{1}{5} + \dfrac{1}{6} + \dfrac{1}{7} + \dfrac{1}{8} \geq 4 \times \dfrac{1}{8} = \dfrac{1}{2}$.` },
          { kind: 'para', text: R`**Conclusion.** $S_{2^k} \geq 1 + k \times \dfrac{1}{2}$ (le terme $1$, puis $k$ paquets). Pour dépasser un réel $A$ quelconque, il suffit de prendre un naturel $k > 2(A - 1)$ (axiome d'Archimède) : alors $S_n > A$ pour tout $n \geq 2^k$, car les sommes partielles augmentent. Donc $\lim\limits_{n\to+\infty} S_n = +\infty$.` },
        ],
      },
      {
        kind: 'piege',
        label: 'Des termes qui tendent vers 0 ne suffisent pas',
        text: R`Pour que la somme de tous les termes soit un réel, il faut que les termes tendent vers $0$ (sinon on ajoute sans cesse des quantités qui ne deviennent pas négligeables). Mais cela ne suffit pas : $\dfrac{1}{n}$ tend vers $0$, et pourtant $1 + \dfrac{1}{2} + \dfrac{1}{3} + \ldots = +\infty$. Les termes de la série harmonique diminuent trop lentement.`,
      },
      {
        kind: 'historique',
        titre: 'Nicole Oresme et la somme qui ne s’arrête pas',
        text: R`Vers 1350, le philosophe et évêque normand **Nicole Oresme** démontre que la série harmonique dépasse n'importe quel nombre, par exactement le groupement en paquets ci-dessus. Son raisonnement est oublié pendant trois siècles : la divergence de la série harmonique est redémontrée au 17e siècle par Pietro Mengoli, puis par les frères Jacques et Jean Bernoulli. Oresme est aussi l'un des premiers à représenter une grandeur qui varie par une figure, une idée qui annonce les graphiques de fonctions.`,
        image: {
          src: '/images/historique/oresme.jpg',
          alt: 'Miniature représentant Nicole Oresme, Traité de la sphère',
          caption: 'Nicole Oresme (v. 1320–1382), miniature du Traité de la sphère, Bibliothèque nationale de France, fonds français 565 (v. 1400–1420).',
        },
      },
      { kind: 'subheading', text: 'Fractales : une aire finie, un périmètre infini' },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — le flocon de von Koch',
        blocks: [
          { kind: 'para', text: R`On part d'un triangle équilatéral $P_1$ de côté $1$. Pour passer d'un polygone au suivant, on partage chaque côté en trois segments égaux, on construit sur le segment du milieu un triangle équilatéral tourné vers l'extérieur, et on efface ce segment du milieu. Vers quoi tendent la longueur des côtés, le périmètre et l'aire des polygones $P_n$ ?` },
          { kind: 'para', text: R`**Côtés et périmètre.** Chaque côté est remplacé par $4$ côtés trois fois plus courts. $P_n$ a donc $3 \times 4^{n-1}$ côtés de longueur $\dfrac{1}{3^{n-1}}$, qui tend vers $0$. Son périmètre vaut $p_n = 3 \times \left(\dfrac{4}{3}\right)^{n-1}$ : suite géométrique de raison $\dfrac{4}{3} > 1$, qui tend vers $+\infty$.` },
          { kind: 'para', text: R`**L'aire ajoutée à chaque étape.** Un triangle équilatéral de côté $c$ a pour aire $\dfrac{\sqrt{3}}{4}c^2$ ; $P_1$ a donc pour aire $\dfrac{\sqrt{3}}{4}$. Pour passer de $P_n$ à $P_{n+1}$, on ajoute un petit triangle de côté $\dfrac{1}{3^n}$ sur chacun des $3 \times 4^{n-1}$ côtés : l'aire ajoutée vaut $3 \times 4^{n-1} \times \dfrac{\sqrt{3}}{4} \times \dfrac{1}{9^n}$.` },
          { kind: 'para', text: R`**La somme des aires ajoutées.** Pour $n = 1$, elle vaut $\dfrac{\sqrt{3}}{12}$, puis on multiplie par $\dfrac{4}{9}$ d'une étape à la suivante : suite géométrique de raison $\dfrac{4}{9}$. Sa somme vaut $\dfrac{\frac{\sqrt{3}}{12}}{1 - \frac{4}{9}} = \dfrac{\sqrt{3}}{12} \times \dfrac{9}{5} = \dfrac{3\sqrt{3}}{20}$.` },
          { kind: 'para', text: R`**Conclusion.** L'aire tend vers $\dfrac{\sqrt{3}}{4} + \dfrac{3\sqrt{3}}{20} = \dfrac{8\sqrt{3}}{20} = \dfrac{2\sqrt{3}}{5} \approx 0{,}693$, soit $\dfrac{8}{5}$ de l'aire du triangle de départ, alors que le périmètre tend vers $+\infty$ : une figure d'aire finie, bordée par une courbe de longueur infinie. Le mathématicien suédois Helge von Koch a décrit cette courbe en 1904.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — le triangle de Sierpinski',
        blocks: [
          { kind: 'para', text: R`On part d'un triangle équilatéral de côté $10$ cm. À chaque étape, dans chaque triangle restant, on joint les milieux des côtés et on retire le triangle central. Après $n$ étapes, combien reste-t-il de triangles ? Quelles sont leur aire totale et leur périmètre total ? Vers quoi tendent ces grandeurs ?` },
          { kind: 'para', text: R`**Nombre de triangles.** Chaque triangle est remplacé par $3$ triangles : après $n$ étapes, il en reste $3^n$ ($3$, puis $9$, puis $27$…).` },
          { kind: 'para', text: R`**Aire.** À chaque étape, on retire un quart de l'aire restante : l'aire est multipliée par $\dfrac{3}{4}$. Le triangle de départ a pour aire $\dfrac{\sqrt{3}}{4} \times 10^2 = 25\sqrt{3} \approx 43{,}3$ cm² ; après $n$ étapes, l'aire vaut $25\sqrt{3} \times \left(\dfrac{3}{4}\right)^n$, qui tend vers $0$.` },
          { kind: 'para', text: R`**Périmètre.** Après $n$ étapes, il y a $3^n$ triangles de côté $\dfrac{10}{2^n}$ : le périmètre total vaut $3^n \times 3 \times \dfrac{10}{2^n} = 30 \times \left(\dfrac{3}{2}\right)^n$, qui tend vers $+\infty$.` },
          { kind: 'para', text: R`**Conclusion.** À la limite, la figure n'a plus d'aire, mais un périmètre infini. Le mathématicien polonais Wacław Sierpiński l'a étudiée en 1915. Ces figures qui se répètent à toutes les échelles s'appellent des **fractales**, un mot créé par Benoît Mandelbrot en 1975.` },
        ],
      },
      { kind: 'subheading', text: 'Un piège : le carré tournant' },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — le carré tournant : l’aire ne tend pas vers 0',
        blocks: [
          { kind: 'para', text: R`On part d'un carré de $10$ cm de côté. On trace à l'intérieur un deuxième carré dont chaque sommet est sur un côté du premier, à $1$ cm d'un sommet (en tournant toujours dans le même sens), puis un troisième dans le deuxième, et ainsi de suite indéfiniment. La suite des aires tend-elle vers $0$ ?` },
          { kind: 'para', text: R`**De proche en proche.** Si un carré a pour côté $c_n$, chaque coin forme un triangle rectangle de côtés $1$ et $c_n - 1$, dont l'hypoténuse est le côté du carré suivant : $c_{n+1} = \sqrt{1 + (c_n - 1)^2}$, avec $c_1 = 10$.` },
          { kind: 'para', text: R`**Les valeurs.** $c_2 = \sqrt{82} \approx 9{,}06$, $c_3 \approx 8{,}12$, …, $c_{10} \approx 2{,}06$, $c_{11} \approx 1{,}46$, $c_{12} \approx 1{,}10$, $c_{13} \approx 1{,}005$, $c_{14} \approx 1{,}000\,01$.` },
          { kind: 'para', text: R`**La limite.** Le côté ne descend jamais sous $1$, car $c_{n+1}^2 = 1 + (c_n - 1)^2 > 1$ ; et il diminue tant que $c_n > 1$, car $c_{n+1}^2 - c_n^2 = 2 - 2c_n < 0$. Une suite qui diminue sans jamais passer sous un même nombre converge (propriété de $\mathbb{R}$ que nous admettons : $\mathbb{R}$ n'a pas de « trou », étape 3). Sa limite $\ell$ vérifie $\ell = \sqrt{1 + (\ell - 1)^2}$, soit $\ell^2 = \ell^2 - 2\ell + 2$, donc $\ell = 1$.` },
          { kind: 'para', text: R`**Conclusion.** Le côté tend vers $1$ cm, donc l'aire tend vers $1$ cm², et non vers $0$ : les carrés tournent en se resserrant autour d'un carré de $1$ cm de côté. Penser « des carrés de plus en plus petits, donc une aire qui tend vers $0$ » est un piège : diminuer ne veut pas dire tendre vers $0$.` },
          {
            kind: 'illustration',
            illustration: {
              kind: 'sequencePlot',
              points: [
                { n: 1, value: 100, label: '' },
                { n: 2, value: 82, label: '82' },
                { n: 3, value: 65.8892, label: '' },
                { n: 4, value: 51.6548, label: '51,7' },
                { n: 5, value: 39.2805, label: '' },
                { n: 6, value: 28.7457, label: '28,7' },
                { n: 7, value: 20.0227, label: '' },
                { n: 8, value: 13.0734, label: '13,1' },
                { n: 9, value: 7.8419, label: '' },
                { n: 10, value: 4.2412, label: '4,24' },
                { n: 11, value: 2.1224, label: '' },
                { n: 12, value: 1.2087, label: '1,21' },
                { n: 13, value: 1.0099, label: '' },
                { n: 14, value: 1.0, label: '1,00' },
              ],
              connector: 'none',
              referenceLine: { value: 1, label: '' },
              yTicks: [20, 40, 60, 80, 100],
              xAxisLabel: 'n',
              yAxisLabel: 'aire (cm²)',
              caption: R`Les aires $c_n^2$ des carrés tournants diminuent, mais tendent vers $1$ cm², pas vers $0$.`,
            },
          },
        ],
      },
      {
        kind: 'entrainement',
        title: 'Somme infinie en situation',
        generatorId: '56gen7',
        description: [
          'Nombre décimal périodique à écrire en fraction, balle qui rebondit, poursuite d’Achille et de la tortue ' +
            '(Zénon), figures emboîtées : premier terme, raison, condition |q| < 1, somme infinie, puis réponse au problème.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Somme infinie en situation »',
      },
      {
        kind: 'entrainement',
        title: 'Problèmes classiques sur les suites',
        generatorId: '56gen8',
        description: [
          'Des mises en situation historiques ou géométriques (échiquier, papyrus de Rhind, Fibonacci, triangles en ' +
            'zigzag, carrés emboîtés, suites combinées, vitesse) et des fractales (flocon de von Koch, triangle de ' +
            'Sierpinski : nombre de triangles, aire et périmètre à l’étape n, limites).',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Problèmes classiques sur les suites »',
      },
      {
        kind: 'entrainement',
        title: 'Détective d’erreurs : suites',
        generatorId: '56gen10',
        description: [
          'La copie d’un élève (somme de termes, évolution en pourcentage, somme infinie, limite) contient une erreur : ' +
            'trouve la ligne fausse, nomme l’erreur (n au lieu de n − 1, terme oublié dans le compte, |q| ≥ 1, raison ' +
            'inversée…), puis donne le bon résultat.',
        ],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « Détective d’erreurs : suites »',
      },
      {
        kind: 'atelier',
        tag: 'serie-harmonique-widget',
        label: 'Manipule toi-même : la série harmonique diverge',
        caption:
          'Groupe les termes 1⁄n par paquets de 1, 2, 4, 8… termes : chaque paquet vaut au moins 1⁄2 (Oresme). Les sommes partielles dépassent donc n’importe quel nombre, très lentement : il faut 12 367 termes pour dépasser 10.',
      },
      {
        kind: 'atelier',
        tag: 'fractales-widget',
        label: 'Manipule toi-même : flocon de von Koch et triangle de Sierpinski',
        caption:
          'Avance étape par étape. Le flocon de von Koch a une aire qui tend vers 2√3⁄5 (pour un triangle de départ de côté 1) et un périmètre qui tend vers +∞ ; le triangle de Sierpinski a une aire qui tend vers 0 et un périmètre total qui tend vers +∞. Le panneau écrit les suites géométriques qui le prouvent.',
      },
      // ⟨fin-etape sommes-infinies⟩
    ],
  },
]

/** Puces de « Ce qu'il faut retenir » de cette partie (KaTeX, voir content-authoring.md « Synthèses en KaTeX »). */
export const recapItemsSuites: string[] = [
  R`**Suites** — une suite est une fonction de $\mathbb{N}_0$ dans $\mathbb{R}$, définie par une formule explicite ou par récurrence (avec le premier terme). Récurrente affine $u_{n+1} = a\,u_n + b$, $a \neq 1$ : point fixe $L = \dfrac{b}{1-a}$ ; l'écart $u_n - L$ est multiplié par $a$ à chaque pas (point fixe instable si $|a| > 1$).`,
  R`**Suite arithmétique** — $u_{n+1} = u_n + r$, $u_n = u_1 + (n-1)r$, $u_m - u_n = (m-n)r$, $S_n = \dfrac{n(u_1+u_n)}{2}$ ; de $u_p$ à $u_n$ : $n - p + 1$ termes. Avec $\Sigma$ : $\sum\limits_{i=1}^{n} c = nc$ et $\sum\limits_{i=1}^{n} i = \dfrac{n(n+1)}{2}$.`,
  R`**Suite géométrique** — $u_{n+1} = q\,u_n$ ($q \neq 0$), $u_n = u_1\,q^{n-1}$, $\dfrac{u_m}{u_n} = q^{m-n}$, $S_n = u_1\,\dfrac{1-q^n}{1-q}$ si $q \neq 1$ ($S_n = n\,u_1$ si $q = 1$). Insérer $k$ termes : $q^{k+1} = \dfrac{b}{a}$ ; exposant pair : deux raisons opposées ou aucune.`,
  R`**Limite** — $\lim\limits_{n\to+\infty} u_n = \ell$ : pour tout $\varepsilon > 0$, il existe $m$ tel que $n > m \Rightarrow |u_n - \ell| < \varepsilon$. Géométrique : $0$ si $0 < |q| < 1$, $\pm\infty$ si $q > 1$, pas de limite si $q \leq -1$. Rapports de Fibonacci : limite $\Phi = \dfrac{1+\sqrt{5}}{2}$.`,
  R`**Somme infinie** — limite des sommes partielles : $\sum\limits_{i=1}^{+\infty} u_1\,q^{i-1} = \dfrac{u_1}{1-q}$ si $0 < |q| < 1$. Série harmonique : $+\infty$, bien que $\dfrac{1}{n}$ tende vers $0$.`,
]

/** Groupes du formulaire de fin de chapitre pour cette partie (formules utiles aux générateurs). */
export const formulaireGroupesSuites: FormulaireGroupe[] = [
  {
    title: 'Suite arithmétique',
    formulas: [
      { text: R`$u_n = u_1 + (n-1)r$` },
      { text: R`$u_m - u_n = (m-n)r$`, condition: 'relation entre deux termes quelconques' },
      { text: R`$S_n = \dfrac{n(u_1+u_n)}{2} = \dfrac{n\big(2u_1 + (n-1)r\big)}{2}$` },
      { text: R`$u_p + \ldots + u_n = (n-p+1) \times \dfrac{u_p+u_n}{2}$`, condition: R`somme qui ne commence pas à $u_1$ : $n - p + 1$ termes` },
      { text: R`$2b = a + c$`, condition: R`trois termes consécutifs $a$, $b$, $c$` },
    ],
  },
  {
    title: 'Symbole Σ',
    formulas: [
      { text: R`$\sum\limits_{i=1}^{n} c = nc$` },
      { text: R`$\sum\limits_{i=1}^{n} i = \dfrac{n(n+1)}{2}$` },
      { text: R`$\sum\limits_{i=1}^{n} (a_i + b_i) = \sum\limits_{i=1}^{n} a_i + \sum\limits_{i=1}^{n} b_i$`, condition: R`et $\sum\limits_{i=1}^{n} k\,a_i = k\sum\limits_{i=1}^{n} a_i$` },
      { text: R`$\sum\limits_{i=1}^{n} u_{i+1} = \sum\limits_{j=2}^{n+1} u_j$`, condition: 'changement d’indice j = i + 1' },
    ],
  },
  {
    title: 'Suite géométrique',
    formulas: [
      { text: R`$u_n = u_1\,q^{n-1}$` },
      { text: R`$\dfrac{u_m}{u_n} = q^{m-n}$`, condition: 'rapport de deux termes quelconques' },
      { text: R`$q^{k+1} = \dfrac{b}{a}$`, condition: R`insérer $k$ termes entre $a$ et $b$ ; exposant pair : deux raisons opposées ou aucune` },
      { text: R`$S_n = u_1\,\dfrac{1-q^n}{1-q}$`, condition: R`$q \neq 1$ ; si $q = 1$, $S_n = n\,u_1$` },
      { text: R`$b^2 = ac$`, condition: R`trois termes consécutifs $a$, $b$, $c$ (aucun n'est nul)` },
      { text: R`$q = 1 + \dfrac{t}{100}$`, condition: R`hausse de $t\,\%$ ; baisse de $t\,\%$ : $q = 1 - \dfrac{t}{100}$` },
    ],
  },
  {
    title: 'Limites',
    formulas: [
      { text: R`$\lim\limits_{n\to+\infty} u_n = \ell$`, condition: R`pour tout $\varepsilon > 0$, il existe $m$ : $n > m \Rightarrow |u_n - \ell| < \varepsilon$` },
      { text: R`$r > 0 \Rightarrow \lim\limits_{n\to+\infty} u_n = +\infty$`, condition: R`suite arithmétique ; $r < 0$ : $-\infty$` },
      { text: R`$0 < |q| < 1 \Rightarrow \lim\limits_{n\to+\infty} u_n = 0$`, condition: 'suite géométrique' },
      { text: R`$q > 1 \Rightarrow \lim\limits_{n\to+\infty} u_n = \pm\infty$`, condition: R`signe de $u_1$ ; $q \leq -1$ : pas de limite ; $q = 1$ : $u_1$` },
      { text: R`$\Phi = \dfrac{1+\sqrt{5}}{2}$`, condition: R`limite des rapports de Fibonacci, solution positive de $\ell = 1 + \dfrac{1}{\ell}$` },
    ],
  },
  {
    title: 'Sommes infinies',
    formulas: [
      { text: R`$\sum\limits_{i=1}^{+\infty} u_i = \lim\limits_{n\to+\infty} S_n$` },
      { text: R`$\sum\limits_{i=1}^{+\infty} u_1\,q^{i-1} = \dfrac{u_1}{1-q}$`, condition: R`seulement si $0 < |q| < 1$` },
    ],
  },
  {
    title: 'Suite récurrente affine',
    formulas: [
      { text: R`$u_{n+1} = a\,u_n + b$`, condition: R`$a \neq 1$, $b \neq 0$` },
      { text: R`$L = \dfrac{b}{1-a}$`, condition: R`point fixe ; la suite s'en rapproche seulement si $|a| < 1$` },
      { text: R`$u_n = L + (u_1 - L)\,a^{n-1}$`, condition: R`l'écart $u_n - L$ est multiplié par $a$ à chaque pas` },
    ],
  },
]
