import type { BanqueFormules } from './types'

const r = String.raw

/** Questions « Formule » de 4e — voir `types.ts`. */
export const FORMULES_4E: BanqueFormules = {

  // ── Ch. 1 — La fonction du second degré ────────────────────────────────────────────────────────
  'fonction-second-degre': {
    etudier: [
      {
        id: r`$a>0$ → minimum — $a<0$ → maximum`,
        enonce: r`Pour la parabole d'équation $y = ax^2+bx+c$, que t'apprend le signe de $a$ ? Que représente $c$ sur le graphique ?`,
        corrige: r`$a > 0$ : la parabole est tournée vers le haut, son sommet est un minimum ; $a < 0$ : tournée vers le bas, son sommet est un maximum. $c = f(0)$ est l'ordonnée à l'origine : la parabole passe par $(0\,;\,c)$.`,
      },
      {
        id: r`axe à gauche de Oy ⟺ a et b de même signe ; axe à droite ⟺ signes opposés ; axe = Oy ⟺ $b = 0$`,
        enonce: r`Comment trouve-t-on le signe de $b$ dans $y = ax^2+bx+c$ à partir de la position de l'axe de symétrie par rapport à l'axe $Oy$ ?`,
        corrige: r`Axe à gauche de $Oy$ ($x_S < 0$) : $a$ et $b$ ont le même signe ; axe à droite ($x_S > 0$) : signes opposés ; axe confondu avec $Oy$ : $b = 0$.`,
      },
      {
        id: r`différence seconde $= 2a$`,
        enonce: r`Dans un tableau de valeurs où $x$ avance de 1 en 1, à quoi reconnaît-on une fonction du second degré ? Que vaut alors la différence seconde ?`,
        corrige: r`Les différences secondes sont constantes (des différences premières constantes signalent le premier degré) ; la différence seconde vaut $2a$.`,
      },
      {
        id: r`$x_S = -\dfrac{b}{2a}$`,
        enonce: r`Donne les coordonnées du sommet $S$ de la parabole d'équation $y = ax^2+bx+c$, puis l'équation de son axe de symétrie.`,
        corrige: r`$x_S = -\dfrac{b}{2a}$ et $y_S = f(x_S)$ ; axe de symétrie : $x = x_S$.`,
      },
      {
        id: r`$x_S = \dfrac{x_1+x_2}{2}$`,
        enonce: r`Deux points de la parabole ont la même ordonnée : $f(x_1) = f(x_2)$ (par exemple deux zéros). Que vaut alors $x_S$ ?`,
        corrige: r`$x_S = \dfrac{x_1+x_2}{2}$ : l'axe de symétrie passe par le milieu.`,
      },
      {
        id: r`$\operatorname{dom} f = \mathbb{R}$`,
        enonce: r`Donne le domaine et l'image de $f(x) = ax^2+bx+c$, de sommet $S(x_S\,;\,y_S)$, selon le signe de $a$.`,
        corrige: r`$\operatorname{dom} f = \mathbb{R}$ ; si $a > 0$, $\operatorname{im} f = [y_S\,;\,{+\infty}[$ ; si $a < 0$, $\operatorname{im} f = ]{-\infty}\,;\,y_S]$.`,
      },
      {
        id: r`entre les zéros : signe opposé à $a$`,
        enonce: r`La fonction $f(x) = ax^2+bx+c$ a deux zéros $x_1 < x_2$. Quel est le signe de $f(x)$ entre les zéros ? À l'extérieur des zéros ? Et si $f$ n'a aucun zéro, ou un zéro double ?`,
        corrige: r`Entre les zéros : signe opposé à celui de $a$ ; à l'extérieur : signe de $a$. Sans zéro : signe de $a$ partout ; zéro double : signe de $a$ des deux côtés.`,
      },
    ],
    transformer: [
      {
        id: r`$y=(x-p)^2+q$ — translation horizontale $p$, verticale $q$`,
        enonce: r`Par rapport à la parabole $y = x^2$, quel est l'effet de $p$ et de $q$ dans $y = (x-p)^2+q$ ? Où se trouve le sommet ?`,
        corrige: r`Translation horizontale de $p$ unités (vers la droite si $p > 0$, vers la gauche si $p < 0$) et translation verticale de $q$ unités ; sommet $(p\,;\,q)$.`,
      },
      {
        id: r`$|a|>1$ étire (EV), $0<|a|<1$ comprime (CV) ; $a<0$ retourne la courbe (SOX)`,
        enonce: r`Quel est l'effet du coefficient $a$ dans $y = ax^2$ par rapport à $y = x^2$, selon que $|a| > 1$, $0 < |a| < 1$ ou $a < 0$ ?`,
        corrige: r`$|a| > 1$ : étirement vertical (parabole resserrée) ; $0 < |a| < 1$ : compression verticale (parabole aplatie) ; $a < 0$ : la courbe est retournée (symétrie par rapport à $Ox$).`,
      },
      {
        id: r`du sommet, 1 vers la droite : la courbe passe par $(x_S+1\,;\,y_S+a)$`,
        enonce: r`Sur le graphique d'une parabole de sommet $S(x_S\,;\,y_S)$, comment lit-on la valeur de $a$ ?`,
        corrige: r`À partir du sommet, on avance de 1 vers la droite : la courbe passe par $(x_S+1\,;\,y_S+a)$, elle monte de $a$ (descend si $a < 0$).`,
      },
      {
        id: r`$f(x)=a(x-x_S)^2+y_S$, sommet $S(x_S\,;\,y_S)$`,
        enonce: r`Écris la forme canonique d'une fonction du second degré de coefficient $a$ et de sommet $S(x_S\,;\,y_S)$.`,
        corrige: r`$f(x) = a(x-x_S)^2+y_S$.`,
      },
      {
        id: r`$x^2+bx = \left(x+\dfrac{b}{2}\right)^2-\left(\dfrac{b}{2}\right)^2$`,
        enonce: r`Complète le carré : $x^2+bx = \ldots$`,
        corrige: r`$x^2+bx = \left(x+\dfrac{b}{2}\right)^2-\left(\dfrac{b}{2}\right)^2$.`,
      },
      {
        id: r`$ax^2+bx+c = a\left(x+\dfrac{b}{2a}\right)^2+c-\dfrac{b^2}{4a}$`,
        enonce: r`Écris $ax^2+bx+c$ sous forme canonique, en fonction de $a$, $b$ et $c$.`,
        corrige: r`$ax^2+bx+c = a\left(x+\dfrac{b}{2a}\right)^2+c-\dfrac{b^2}{4a}$.`,
      },
      {
        id: r`$ax^2+bx+c$ (lit c) — $a(x-x_S)^2+y_S$ (lit S) — $a(x-x_1)(x-x_2)$ (lit les zéros)`,
        enonce: r`Donne les trois écritures d'une fonction du second degré (développée, canonique, factorisée) et ce que chacune permet de lire directement.`,
        corrige: r`Développée $ax^2+bx+c$ : le point $(0\,;\,c)$ ; canonique $a(x-x_S)^2+y_S$ : le sommet $S(x_S\,;\,y_S)$ et l'axe $x = x_S$ ; factorisée $a(x-x_1)(x-x_2)$ : les zéros $x_1$ et $x_2$.`,
      },
    ],
    utiliser: [
      {
        id: r`optimum réel $=$ sommet`,
        enonce: r`Dans un problème d'optimisation modélisé par une fonction du second degré, où se trouve l'optimum ? Que fait-on si le sommet n'est pas dans le domaine de validité ?`,
        corrige: r`L'optimum est au sommet si $x_S$ appartient au domaine de validité ; sinon, il est à une borne de ce domaine : on compare les valeurs aux bornes.`,
      },
    ],
  },

  // ── Ch. 2 — Équations et inéquations du second degré ───────────────────────────────────────────
  'equations-inequations-second-degre': {
    resoudre: [
      {
        id: r`$\Delta = b^2-4ac$`,
        enonce: r`Donne la formule du discriminant $\Delta$ de l'équation $ax^2+bx+c=0$, puis ses solutions quand $\Delta > 0$.`,
        corrige: r`$\Delta = b^2-4ac$ ; si $\Delta > 0$ : $x_1 = \dfrac{-b - \sqrt{\Delta}}{2a}$ et $x_2 = \dfrac{-b + \sqrt{\Delta}}{2a}$.`,
      },
      {
        id: r`racine double : $x = -\dfrac{b}{2a}$`,
        enonce: r`Que deviennent les solutions de $ax^2+bx+c=0$ si $\Delta = 0$ ? Et si $\Delta < 0$ ?`,
        corrige: r`$\Delta = 0$ : une racine double $x = -\dfrac{b}{2a}$ ; $\Delta < 0$ : aucune racine réelle.`,
      },
      {
        id: r`$ax^2+bx=0 \Rightarrow x(ax+b)=0$`,
        enonce: r`Comment résout-on rapidement l'équation $ax^2+bx=0$ (sans terme constant) ? Donne ses solutions.`,
        corrige: r`Mise en évidence : $x(ax+b)=0$, donc $x = 0$ ou $x = -\dfrac{b}{a}$.`,
      },
      {
        id: r`$ax^2+c=0 \Rightarrow x = \pm\sqrt{-c/a}$`,
        enonce: r`Comment résout-on rapidement l'équation $ax^2+c=0$ (sans terme en $x$) ? Quand n'a-t-elle aucune solution ?`,
        corrige: r`On isole $x^2 = -\dfrac{c}{a}$ : si $a$ et $c$ sont de signes opposés, $x = \pm\sqrt{-\dfrac{c}{a}}$ ; s'ils sont de même signe, aucune solution ($x^2$ serait négatif).`,
      },
      {
        id: r`$ax^2+bx+c = a\left(x+\dfrac{b}{2a}\right)^2$`,
        enonce: r`À quelle condition sur $a$, $b$ et $c$ le trinôme $ax^2+bx+c$ est-il un carré parfait (à un facteur $a$ près) ? Écris-le alors sous forme de carré.`,
        corrige: r`Si $b^2 = 4ac$ (c'est-à-dire $\Delta = 0$) : $ax^2+bx+c = a\left(x+\dfrac{b}{2a}\right)^2$.`,
      },
      {
        id: r`$a+b+c=0 \Rightarrow x_1 = 1,\ x_2 = \dfrac{c}{a} \qquad a-b+c=0 \Rightarrow x_1 = -1,\ x_2 = -\dfrac{c}{a}$`,
        enonce: r`Si $a+b+c=0$, quelles sont les solutions de $ax^2+bx+c=0$ ? Et si $a-b+c=0$ ?`,
        corrige: r`$a+b+c=0$ : $x_1 = 1$ et $x_2 = \dfrac{c}{a}$ ; $a-b+c=0$ : $x_1 = -1$ et $x_2 = -\dfrac{c}{a}$.`,
      },
      {
        id: r`$ax^2+bx+c = a(x-x_1)(x-x_2)$`,
        enonce: r`L'équation $ax^2+bx+c=0$ a pour racines $x_1$ et $x_2$. Écris la forme factorisée du trinôme $ax^2+bx+c$.`,
        corrige: r`$ax^2+bx+c = a(x-x_1)(x-x_2)$.`,
      },
      {
        id: r`$x_1+x_2=-b/a \quad x_1 \cdot x_2 = c/a$`,
        enonce: r`Exprime la somme $S$ et le produit $P$ des racines de $ax^2+bx+c=0$ en fonction de $a$, $b$ et $c$. Quelle équation a pour solutions deux nombres de somme $S$ et de produit $P$ ?`,
        corrige: r`$S = x_1+x_2 = -\dfrac{b}{a}$ et $P = x_1 \cdot x_2 = \dfrac{c}{a}$ ; équation : $x^2 - Sx + P = 0$.`,
      },
      {
        id: r`$P < 0$ → racines de signes opposés ; $\Delta > 0$ et $P > 0$ → même signe, celui de $S$`,
        enonce: r`Sans calculer les racines de $ax^2+bx+c=0$, comment connaît-on leurs signes à l'aide du produit $P$, de la somme $S$ et de $\Delta$ ?`,
        corrige: r`$P < 0$ : deux racines de signes opposés ; $\Delta > 0$ et $P > 0$ : deux racines de même signe, celui de $S$.`,
      },
    ],
    'signe-trinome': [
      {
        id: r`$\Delta<0$ → signe de $a$, partout`,
        enonce: r`Donne le signe du trinôme $ax^2+bx+c$ selon le signe de son discriminant $\Delta$.`,
        corrige: [
          r`$\Delta < 0$ : signe de $a$ partout.`,
          r`$\Delta = 0$ : signe de $a$, sauf en la racine double $r$ où il est nul.`,
          r`$\Delta > 0$ : signe de $a$ à l'extérieur des racines $x_1$ et $x_2$, signe opposé entre elles.`,
        ],
      },
    ],
    'inconnue-denominateur': [
      {
        id: r`CE : dénominateur $\neq 0$`,
        enonce: r`Quand l'inconnue apparaît au dénominateur, quelle condition d'existence (CE) faut-il poser avant de résoudre ?`,
        corrige: r`Chaque dénominateur doit être différent de $0$ ; les valeurs qui l'annulent sont exclues.`,
      },
    ],
    'inequations-rationnelles': [
      {
        id: r`une valeur de CE est toujours exclue de $S$`,
        enonce: r`Dans une inéquation rationnelle avec $\le$ ou $\ge$, une valeur exclue par la CE peut-elle appartenir à l'ensemble des solutions ? Justifie.`,
        corrige: r`Non : une valeur de CE est toujours exclue de $S$, même avec $\le$ ou $\ge$ — la fraction n'y existe pas (crochet ouvert, double barre dans le tableau).`,
      },
    ],
  },

  // ── Ch. 3 — Caractéristiques d'une fonction et fonctions de référence ──────────────────────────
  'caracteristiques-fonctions-reference': {
    lire: [
      {
        id: r`paire : $f(-a)=f(a)$ — symétrie d'axe Oy`,
        enonce: r`Donne la définition d'une fonction paire et celle d'une fonction impaire. Quelle symétrie présente le graphique dans chaque cas ?`,
        corrige: r`Paire : pour tout $a$ du domaine, $-a$ aussi et $f(-a)=f(a)$ — l'axe $Oy$ est axe de symétrie. Impaire : $f(-a)=-f(a)$ — l'origine est centre de symétrie.`,
      },
      {
        id: r`image de $a$ : $f(a)$, ordonnée du point de la courbe d'abscisse $a$`,
        enonce: r`Comment lit-on sur un graphique l'image d'un réel $a$ ? Et les antécédents d'un réel $k$ ?`,
        corrige: r`Image de $a$ : $f(a)$, l'ordonnée du point de la courbe d'abscisse $a$. Antécédents de $k$ : les abscisses des points de la courbe situés à la hauteur $k$.`,
      },
      {
        id: r`$f(x) > k$ : les $x$ où la courbe est au-dessus de la droite $y = k$`,
        enonce: r`Comment résout-on graphiquement l'inéquation $f(x) > k$ ?`,
        corrige: r`On trace la droite $y = k$ : les solutions sont les $x$ où la courbe est strictement au-dessus de cette droite.`,
      },
    ],
    algebrique: [
      {
        id: r`$x^2$ (ℝ, paire) — $x^3$ (ℝ, impaire)`,
        enonce: r`Donne le domaine et la parité éventuelle de chacune des six fonctions de référence : $x^2$, $x^3$, $\sqrt{x}$, $\sqrt[3]{x}$, $\dfrac{1}{x}$ et $|x|$.`,
        corrige: r`$x^2$ : $\mathbb{R}$, paire ; $x^3$ : $\mathbb{R}$, impaire ; $\sqrt{x}$ : $[0\,;\,{+\infty}[$, ni paire ni impaire ; $\sqrt[3]{x}$ : $\mathbb{R}$, impaire ; $\dfrac{1}{x}$ : $\mathbb{R} \setminus \{0\}$, impaire ; $|x|$ : $\mathbb{R}$, paire.`,
      },
      {
        id: r`racine carrée : $ax+b \ge 0$`,
        enonce: r`Quelle condition d'existence (CE) pose-t-on pour $\sqrt{ax+b}$ ? Et pour $\dfrac{1}{ax+b}$ ? Quelles familles de référence n'imposent aucune condition ?`,
        corrige: r`$\sqrt{ax+b}$ : $ax+b \ge 0$ (le sens s'inverse en divisant par $a < 0$) ; $\dfrac{1}{ax+b}$ : $ax+b \neq 0$ ; carrée, cube, racine cubique et valeur absolue : aucune CE.`,
      },
      {
        id: r`$\sqrt{A} = B$ : $B \ge 0$, puis $A = B^2$`,
        enonce: r`Après l'isolement, on obtient $\sqrt{A} = B$, où $B$ contient $x$. Quelle condition de validité faut-il imposer, et que fait-on ensuite ? Comment traite-t-on $|A| = B$ ?`,
        corrige: r`$\sqrt{A} = B$ : condition $B \ge 0$, puis $A = B^2$ ; chaque candidate est confrontée à $B \ge 0$. $|A| = B$ : $A = B$ si $A \ge 0$, ou $A = -B$ si $A < 0$ (chaque racine avec la condition de sa branche).`,
      },
      {
        id: r`carrée / valeur absolue : $K<0$ → 0 zéro, $K=0$ → 1 zéro, $K>0$ → 2 zéros`,
        enonce: r`Selon le signe de $K$, combien de solutions a l'équation $[\text{famille}](ax+b) = K$ pour la carrée ou la valeur absolue ? Pour la racine carrée ? Pour le cube ou la racine cubique ? Pour l'inverse ?`,
        corrige: [
          r`Carrée, valeur absolue : $0$ si $K < 0$, $1$ si $K = 0$, $2$ si $K > 0$. Racine carrée : $0$ si $K < 0$, $1$ si $K \ge 0$.`,
          r`Cube, racine cubique : toujours exactement $1$. Inverse : $1$ si $K \neq 0$, aucune si $K = 0$.`,
        ],
      },
    ],
    transformer: [
      {
        id: r`$f(x) = SOX \cdot \dfrac{EV}{CV} \cdot g\left(SOY \cdot \dfrac{CH}{EH}\cdot(x-TH)\right)+TV$`,
        enonce: r`Écris la formule unifiée qui exprime une fonction transformée $f$ à partir de la fonction de référence $g$ et des huit paramètres TH, TV, CH, EH, EV, CV, SOX et SOY.`,
        corrige: r`$f(x) = SOX \cdot \dfrac{EV}{CV} \cdot g\left(SOY \cdot \dfrac{CH}{EH}\cdot(x-TH)\right)+TV$ — TH toujours soustrait, TV toujours ajouté.`,
      },
      {
        id: r`point caractéristique toujours en $x=TH$`,
        enonce: r`En quelle abscisse se trouve le point caractéristique (sommet ou point d'inflexion) d'une fonction transformée ?`,
        corrige: r`Toujours en $x = TH$ : seule la translation horizontale le déplace horizontalement.`,
      },
      {
        id: r`$g(kx)$ : facteur $\dfrac{1}{k}$ horizontalement`,
        enonce: r`Par rapport à la courbe de $g$, quel est l'effet du passage de $g(x)$ à $g(kx)$ ?`,
        corrige: r`Une transformation horizontale de facteur $\dfrac{1}{k}$ : compression si $|k| > 1$, étirement si $0 < |k| < 1$.`,
      },
    ],
  },

  // ── Ch. 4 — Statistique descriptive à une variable ─────────────────────────────────────────────
  'statistique-descriptive': {
    frequences: [
      {
        id: r`$f_i = n_i/n$`,
        enonce: r`Dans une série de $n$ données, la valeur $x_i$ a pour effectif $n_i$. Donne sa fréquence $f_i$.`,
        corrige: r`$f_i = \dfrac{n_i}{n}$ (souvent exprimée en %), avec $n = \Sigma n_i$.`,
      },
    ],
    histogramme: [
      {
        id: r`centre de la classe $[a\,;\,b[$ : $\dfrac{a+b}{2}$`,
        enonce: r`Donne le centre et l'amplitude de la classe $[a\,;\,b[$.`,
        corrige: r`Centre : $\dfrac{a+b}{2}$ ; amplitude : $b-a$.`,
      },
    ],
    moyenne: [
      {
        id: r`$\bar{x} = \dfrac{\Sigma(x_i \cdot n_i)}{\Sigma n_i}$`,
        enonce: r`Donne la formule de la moyenne pondérée $\bar{x}$ d'une série de valeurs $x_i$ d'effectifs $n_i$. Que prend-on pour $x_i$ quand les données sont groupées en classes ?`,
        corrige: r`$\bar{x} = \dfrac{\Sigma(x_i \cdot n_i)}{\Sigma n_i}$ ; pour des données en classes, $x_i$ est le centre de la classe.`,
      },
      {
        id: r`$\bar{x} = \Sigma(x_i \cdot f_i)$`,
        enonce: r`Comment calcule-t-on la moyenne $\bar{x}$ quand le tableau donne les fréquences $f_i$ (en nombre décimal) au lieu des effectifs ?`,
        corrige: r`$\bar{x} = \Sigma(x_i \cdot f_i)$ — sans division : la somme des fréquences vaut déjà $1$.`,
      },
    ],
    position: [
      {
        id: r`seuils : $n/2$ (médiane), $n/4$ ($Q_1$), $3n/4$ ($Q_3$)`,
        enonce: r`Pour une série rangée de $n$ données, quels seuils utilise-t-on pour la médiane, $Q_1$ et $Q_3$ ? Quelle valeur retient-on pour chaque seuil ?`,
        corrige: r`Seuils $\dfrac{n}{2}$ (médiane), $\dfrac{n}{4}$ ($Q_1$), $\dfrac{3n}{4}$ ($Q_3$) ; on retient la première valeur dont l'effectif cumulé dépasse strictement le seuil.`,
      },
      {
        id: r`$\text{valeur} = L + \dfrac{\text{seuil}-CF_{avant}}{n_{classe}} \cdot \text{amplitude}$`,
        enonce: r`Données groupées en classes : par quelle formule d'interpolation linéaire calcule-t-on la valeur qui correspond à un seuil ? Précise ce que représente chaque lettre.`,
        corrige: r`$\text{valeur} = L + \dfrac{\text{seuil}-CF_{avant}}{n_{classe}} \cdot \text{amplitude}$ : $L$ borne inférieure de la classe du seuil, $CF_{avant}$ effectif cumulé juste avant cette classe, $n_{classe}$ son effectif.`,
      },
      {
        id: r`mode = valeur (ou classe) de plus grand effectif`,
        enonce: r`Qu'appelle-t-on le mode d'une série statistique ?`,
        corrige: r`La valeur (ou la classe) de plus grand effectif.`,
      },
    ],
    boite: [
      {
        id: r`5 nombres : min, $Q_1$, médiane, $Q_3$, max`,
        enonce: r`Quels sont les cinq nombres qui résument une série dans une boîte à moustaches ? Comment calcule-t-on l'écart interquartile, et que représente-t-il sur la boîte ?`,
        corrige: r`Min, $Q_1$, médiane, $Q_3$, max ; écart interquartile $= Q_3 - Q_1$, la largeur de la boîte.`,
      },
    ],
    dispersion: [
      {
        id: r`$V = \dfrac{\Sigma(x_i-\bar{x})^2 \cdot n_i}{n}$`,
        enonce: r`Donne la formule de l'étendue, celle de la variance $V$ d'une série de valeurs $x_i$ d'effectifs $n_i$ (effectif total $n$, moyenne $\bar{x}$), et celle de l'écart-type.`,
        corrige: r`Étendue $= \max - \min$ ; $V = \dfrac{\Sigma(x_i-\bar{x})^2 \cdot n_i}{n}$ (division par $n$, jamais $n-1$) ; écart-type $= \sqrt{V}$.`,
      },
    ],
    tchebychev: [
      {
        id: r`au moins $\left(1-\dfrac{1}{k^2}\right)\times 100\%$ des valeurs dans $[\bar{x}-k\sigma\,;\,\bar{x}+k\sigma]$`,
        enonce: r`Énonce l'inégalité de Bienaymé-Tchebychev : pour $k > 1$, quelle proportion minimale des valeurs d'une série se trouve dans l'intervalle $[\bar{x}-k\sigma\,;\,\bar{x}+k\sigma]$ ?`,
        corrige: r`Au moins $\left(1-\dfrac{1}{k^2}\right)\times 100\,\%$ des valeurs, quelle que soit la forme de la série.`,
      },
      {
        id: r`$k = \sqrt{\dfrac{100}{100-\text{pourcentage}}}$`,
        enonce: r`Avec l'inégalité de Bienaymé-Tchebychev, comment retrouve-t-on $k$ à partir du pourcentage minimal de valeurs voulu ?`,
        corrige: r`$k = \sqrt{\dfrac{100}{100-\text{pourcentage}}}$ (on résout $1-\dfrac{1}{k^2} = \dfrac{\text{pourcentage}}{100}$).`,
      },
    ],
  },

  // ── Ch. 5 — Cercle trigonométrique & triangles quelconques (degrés seulement) ──────────────────
  'cercle-trigonometrique-triangles': {
    cercle: [
      {
        id: r`$M(\theta)=(\cos\theta\,;\,\sin\theta)$`,
        enonce: r`Quelles sont les coordonnées du point $M(\theta)$ du cercle trigonométrique associé à l'angle $\theta$ ? Quels angles donnent le même point $M$ ?`,
        corrige: r`$M(\theta) = (\cos\theta\,;\,\sin\theta)$ ; $\theta$ et $\theta + k \cdot 360^\circ$ ($k$ entier) donnent le même point.`,
      },
      {
        id: r`quadrant I : $\theta$ — quadrant II : $180°-\theta$ — quadrant III : $\theta-180°$ — quadrant IV : $360°-\theta$`,
        enonce: r`Comment calcule-t-on l'angle du premier quadrant associé à un angle $\theta$ situé dans le quadrant I, II, III ou IV ?`,
        corrige: r`Quadrant I : $\theta$ ; quadrant II : $180^\circ-\theta$ ; quadrant III : $\theta-180^\circ$ ; quadrant IV : $360^\circ-\theta$.`,
      },
      {
        id: r`I : $(+,+,+)$ — II : $(+,-,-)$ — III : $(-,-,+)$ — IV : $(-,+,-)$`,
        enonce: r`Donne les signes de $\sin\theta$, $\cos\theta$ et $\tan\theta$ dans chacun des quatre quadrants.`,
        corrige: r`Dans l'ordre $(\sin\theta, \cos\theta, \tan\theta)$ : I $(+,+,+)$ ; II $(+,-,-)$ ; III $(-,-,+)$ ; IV $(-,+,-)$.`,
      },
      {
        id: r`$\tan\theta = \dfrac{\sin\theta}{\cos\theta}$`,
        enonce: r`Donne la définition de $\tan\theta$ à l'aide de $\sin\theta$ et $\cos\theta$, et la condition pour qu'elle existe.`,
        corrige: r`$\tan\theta = \dfrac{\sin\theta}{\cos\theta}$, si $\cos\theta \neq 0$ (donc sauf $90^\circ$ et $270^\circ$).`,
      },
    ],
    identite: [
      {
        id: r`$\cos^2\theta + \sin^2\theta = 1$`,
        enonce: r`Complète, pour tout angle $\theta$ : $\cos^2\theta + \sin^2\theta = \ldots$`,
        corrige: r`$\cos^2\theta + \sin^2\theta = 1$.`,
      },
      {
        id: r`$\cos\theta = \pm\sqrt{1-\sin^2\theta}$`,
        enonce: r`Connaissant $\sin\theta$ et le quadrant de $\theta$, comment calcule-t-on $\cos\theta$ ?`,
        corrige: r`$\cos\theta = \pm\sqrt{1-\sin^2\theta}$, le signe étant donné par le quadrant.`,
      },
      {
        id: r`$1 + \tan^2\theta = \dfrac{1}{\cos^2\theta}$`,
        enonce: r`Connaissant $\tan\theta$, quelle relation donne $\cos^2\theta$ ? Comment obtient-on ensuite $\sin\theta$ ?`,
        corrige: r`$1 + \tan^2\theta = \dfrac{1}{\cos^2\theta}$ ; puis $\sin\theta = \tan\theta \cdot \cos\theta$ (signes selon le quadrant).`,
      },
    ],
    remarquables: [
      {
        id: r`$\sin 0°=0,\ \sin 30°=\tfrac12,\ \sin 45°=\tfrac{\sqrt2}{2},\ \sin 60°=\tfrac{\sqrt3}{2},\ \sin 90°=1$`,
        enonce: r`Donne les valeurs exactes de $\sin\theta$ et de $\cos\theta$ pour $\theta = 0^\circ$, $30^\circ$, $45^\circ$, $60^\circ$ et $90^\circ$.`,
        corrige: [
          r`$\sin 0^\circ = 0$, $\sin 30^\circ = \dfrac{1}{2}$, $\sin 45^\circ = \dfrac{\sqrt{2}}{2}$, $\sin 60^\circ = \dfrac{\sqrt{3}}{2}$, $\sin 90^\circ = 1$ ;`,
          r`$\cos\theta$ : les mêmes valeurs dans l'ordre inverse ($\cos 0^\circ = 1$, …, $\cos 90^\circ = 0$).`,
        ],
      },
      {
        id: r`$\tan 30°=\tfrac{\sqrt3}{3},\ \tan 45°=1,\ \tan 60°=\sqrt3$`,
        enonce: r`Donne les valeurs exactes de $\tan 30^\circ$, $\tan 45^\circ$ et $\tan 60^\circ$. Pour quels angles de $[0^\circ\,;\,360^\circ[$ la tangente n'est-elle pas définie ?`,
        corrige: r`$\tan 30^\circ = \dfrac{\sqrt{3}}{3}$, $\tan 45^\circ = 1$, $\tan 60^\circ = \sqrt{3}$ ; $\tan 90^\circ$ et $\tan 270^\circ$ ne sont pas définies.`,
      },
    ],
    associes: [
      {
        id: r`$\sin(90°-\theta)=\cos\theta,\ \cos(90°-\theta)=\sin\theta,\ \tan(90°-\theta)=\dfrac{1}{\tan\theta}$`,
        enonce: r`Exprime $\sin(90^\circ-\theta)$, $\cos(90^\circ-\theta)$ et $\tan(90^\circ-\theta)$ à l'aide des nombres trigonométriques de $\theta$ (angles complémentaires).`,
        corrige: r`$\sin(90^\circ-\theta) = \cos\theta$, $\cos(90^\circ-\theta) = \sin\theta$, $\tan(90^\circ-\theta) = \dfrac{1}{\tan\theta}$.`,
      },
      {
        id: r`$\sin(90°+\theta)=\cos\theta,\ \cos(90°+\theta)=-\sin\theta,\ \tan(90°+\theta)=-\dfrac{1}{\tan\theta}$`,
        enonce: r`Exprime $\sin(90^\circ+\theta)$, $\cos(90^\circ+\theta)$ et $\tan(90^\circ+\theta)$ à l'aide des nombres trigonométriques de $\theta$.`,
        corrige: r`$\sin(90^\circ+\theta) = \cos\theta$, $\cos(90^\circ+\theta) = -\sin\theta$, $\tan(90^\circ+\theta) = -\dfrac{1}{\tan\theta}$.`,
      },
      {
        id: r`$\sin(180°-\theta)=\sin\theta,\ \cos(180°-\theta)=-\cos\theta,\ \tan(180°-\theta)=-\tan\theta$`,
        enonce: r`Exprime $\sin(180^\circ-\theta)$, $\cos(180^\circ-\theta)$ et $\tan(180^\circ-\theta)$ à l'aide des nombres trigonométriques de $\theta$ (angles supplémentaires).`,
        corrige: r`$\sin(180^\circ-\theta) = \sin\theta$, $\cos(180^\circ-\theta) = -\cos\theta$, $\tan(180^\circ-\theta) = -\tan\theta$.`,
      },
      {
        id: r`$\sin(180°+\theta)=-\sin\theta,\ \cos(180°+\theta)=-\cos\theta,\ \tan(180°+\theta)=\tan\theta$`,
        enonce: r`Exprime $\sin(180^\circ+\theta)$, $\cos(180^\circ+\theta)$ et $\tan(180^\circ+\theta)$ à l'aide des nombres trigonométriques de $\theta$ (angles anti-supplémentaires).`,
        corrige: r`$\sin(180^\circ+\theta) = -\sin\theta$, $\cos(180^\circ+\theta) = -\cos\theta$, $\tan(180^\circ+\theta) = \tan\theta$.`,
      },
      {
        id: r`$\sin(-\theta)=-\sin\theta,\ \cos(-\theta)=\cos\theta,\ \tan(-\theta)=-\tan\theta$`,
        enonce: r`Exprime $\sin(-\theta)$, $\cos(-\theta)$ et $\tan(-\theta)$ à l'aide des nombres trigonométriques de $\theta$ (angles opposés).`,
        corrige: r`$\sin(-\theta) = -\sin\theta$, $\cos(-\theta) = \cos\theta$, $\tan(-\theta) = -\tan\theta$ ($360^\circ-\theta$ suit les mêmes règles).`,
      },
    ],
    equations: [
      {
        id: r`$\sin\alpha=k$`,
        enonce: r`On résout $\sin\alpha = k$ sur $[0^\circ\,;\,360^\circ[$, avec $0 < |k| < 1$, et $\alpha_0$ est l'angle aigu tel que $\sin\alpha_0 = |k|$. Donne les solutions si $k > 0$, puis si $k < 0$.`,
        corrige: r`$k > 0$ : $\alpha_0$ et $180^\circ-\alpha_0$ ; $k < 0$ : $180^\circ+\alpha_0$ et $360^\circ-\alpha_0$.`,
      },
      {
        id: r`$\cos\alpha=k$`,
        enonce: r`On résout $\cos\alpha = k$ sur $[0^\circ\,;\,360^\circ[$, avec $0 < |k| < 1$, et $\alpha_0$ est l'angle aigu tel que $\cos\alpha_0 = |k|$. Donne les solutions si $k > 0$, puis si $k < 0$.`,
        corrige: r`$k > 0$ : $\alpha_0$ et $360^\circ-\alpha_0$ ; $k < 0$ : $180^\circ-\alpha_0$ et $180^\circ+\alpha_0$.`,
      },
      {
        id: r`$\tan\alpha=k$`,
        enonce: r`On résout $\tan\alpha = k$ sur $[0^\circ\,;\,360^\circ[$, avec $k \neq 0$, et $\alpha_0$ est l'angle aigu tel que $\tan\alpha_0 = |k|$. Donne les solutions si $k > 0$, puis si $k < 0$.`,
        corrige: r`$k > 0$ : $\alpha_0$ et $180^\circ+\alpha_0$ ; $k < 0$ : $180^\circ-\alpha_0$ et $360^\circ-\alpha_0$ (toujours deux solutions, espacées de $180^\circ$).`,
      },
      {
        id: r`$\sin\alpha = k$ ou $\cos\alpha = k$ avec $|k|>1$ : aucune solution`,
        enonce: r`Combien de solutions l'équation $\sin\alpha = k$ (ou $\cos\alpha = k$) a-t-elle sur $[0^\circ\,;\,360^\circ[$ si $|k| > 1$ ? Et si $k = 1$ ou $k = -1$ ?`,
        corrige: r`$|k| > 1$ : aucune solution ; $k = \pm 1$ : une seule solution (les deux se confondent).`,
      },
      {
        id: r`$\sin^2\alpha = k \iff \sin\alpha = \sqrt{k}$ ou $\sin\alpha = -\sqrt{k}$`,
        enonce: r`Comment résout-on l'équation $\sin^2\alpha = k$ ?`,
        corrige: r`Si $k \ge 0$ : $\sin^2\alpha = k \iff \sin\alpha = \sqrt{k}$ ou $\sin\alpha = -\sqrt{k}$ (deux équations de base) ; si $k < 0$ : aucune solution. De même pour $\cos^2\alpha$.`,
      },
      {
        id: r`$P=(r\cos\theta\,;\,r\sin\theta)$`,
        enonce: r`Une nacelle tourne sur un cercle de rayon $r$ dont le centre est à la hauteur $h$ du sol. Donne ses coordonnées (origine au centre) et sa hauteur quand elle est repérée par l'angle $\theta$.`,
        corrige: r`$P = (r\cos\theta\,;\,r\sin\theta)$ ; hauteur $= h + r\sin\theta$.`,
      },
    ],
    triangle: [
      {
        id: r`$\dfrac{a}{\sin\hat A}=\dfrac{b}{\sin\hat B}=\dfrac{c}{\sin\hat C}$`,
        enonce: r`Énonce la loi des sinus dans un triangle $ABC$ de côtés $a$, $b$, $c$ (opposés aux sommets $A$, $B$, $C$). Dans quels cas l'utilise-t-on ?`,
        corrige: r`$\dfrac{a}{\sin\hat A}=\dfrac{b}{\sin\hat B}=\dfrac{c}{\sin\hat C}$ ; cas AAS ou SSA.`,
      },
      {
        id: r`$a^2=b^2+c^2-2bc\cos\hat A$`,
        enonce: r`Énonce la loi des cosinus (Al-Kashi) pour le côté $a$, puis résous-la en $\cos\hat A$. Dans quels cas l'utilise-t-on ?`,
        corrige: r`$a^2=b^2+c^2-2bc\cos\hat A$, donc $\cos\hat A=\dfrac{b^2+c^2-a^2}{2bc}$ ; cas SAS ou SSS.`,
      },
      {
        id: r`$\sin\hat B=\dfrac{b\sin\hat A}{a}$`,
        enonce: r`Cas ambigu (SSA) : on connaît $a$, $b$ et $\hat A$. Comment calcule-t-on $\sin\hat B$ ? Quels angles $\hat B$ retient-on ?`,
        corrige: r`$\sin\hat B=\dfrac{b\sin\hat A}{a}$. Si ce nombre dépasse $1$ : aucun triangle. Sinon, candidats $\hat B$ et $180^\circ-\hat B$ : on garde ceux tels que $\hat A+\hat B<180^\circ$.`,
      },
      {
        id: r`$\text{Aire}=\dfrac12\,bc\sin\hat A=\dfrac12\,ac\sin\hat B=\dfrac12\,ab\sin\hat C$`,
        enonce: r`Donne l'aire d'un triangle $ABC$ à l'aide de deux côtés et de l'angle qu'ils comprennent.`,
        corrige: r`$\text{Aire}=\dfrac{1}{2}\,bc\sin\hat A=\dfrac{1}{2}\,ac\sin\hat B=\dfrac{1}{2}\,ab\sin\hat C$.`,
      },
      {
        id: r`$\text{Aire}=\sqrt{p(p-a)(p-b)(p-c)}$`,
        enonce: r`Énonce la formule de Héron : l'aire d'un triangle de côtés $a$, $b$, $c$.`,
        corrige: r`$\text{Aire}=\sqrt{p(p-a)(p-b)(p-c)}$, avec $p=\dfrac{a+b+c}{2}$ (demi-périmètre).`,
      },
    ],
    triangulation: [
      {
        id: r`$F_R^2=F_1^2+F_2^2-2F_1F_2\cos(180°-\theta)$`,
        enonce: r`Deux forces $\vec{F_1}$ et $\vec{F_2}$ font entre elles un angle $\theta$, mesuré en leur origine commune. Donne le carré de l'intensité $F_R$ de leur résultante.`,
        corrige: r`$F_R^2=F_1^2+F_2^2-2F_1F_2\cos(180^\circ-\theta)$ (Al-Kashi dans le triangle des forces).`,
      },
    ],
  },

  // ── Ch. 6 — Calcul vectoriel (pas de « déterminant » en 4e : critère de colinéarité) ───────────
  'calcul-vectoriel': {
    definition: [
      {
        id: r`$\vec{AB} = \vec{CD}$`,
        enonce: r`Que signifie $\vec{AB} = \vec{CD}$ ? Quelle figure forment alors les points $A$, $B$, $D$, $C$ (non alignés) ?`,
        corrige: r`Les deux vecteurs ont même direction, même sens et même norme ; $ABDC$ est un parallélogramme.`,
      },
    ],
    chasles: [
      {
        id: r`$\vec{AB} + \vec{BC} = \vec{AC}$`,
        enonce: r`Énonce la relation de Chasles : $\vec{AB} + \vec{BC} = \ldots$ Que vaut alors $\vec{AB} + \vec{BC} + \vec{CA}$ ?`,
        corrige: r`$\vec{AB} + \vec{BC} = \vec{AC}$ ; $\vec{AB} + \vec{BC} + \vec{CA} = \vec{0}$ (chaîne fermée).`,
      },
      {
        id: r`$\vec{AB} - \vec{AC} = \vec{CB}$`,
        enonce: r`Réduis en un seul vecteur : $\vec{AB} - \vec{AC} = \ldots$`,
        corrige: r`$\vec{AB} - \vec{AC} = \vec{AB} + \vec{CA} = \vec{CA} + \vec{AB} = \vec{CB}$ (et non $\vec{BC}$).`,
      },
    ],
    composantes: [
      {
        id: r`$\vec{AB}\begin{pmatrix} x_B-x_A \\ y_B-y_A \end{pmatrix}$`,
        enonce: r`Donne les composantes du vecteur $\vec{AB}$, pour $A(x_A\,;y_A)$ et $B(x_B\,;y_B)$.`,
        corrige: r`$\vec{AB}\begin{pmatrix} x_B-x_A \\ y_B-y_A \end{pmatrix}$ (« arrivée moins départ »).`,
      },
    ],
    additionReperes: [
      {
        id: r`$\vec{u}+\vec{v} = \begin{pmatrix} x_u+x_v \\ y_u+y_v \end{pmatrix}$`,
        enonce: r`Donne les composantes de $\vec{u}+\vec{v}$ et de $\vec{u}-\vec{v}$ en fonction de celles de $\vec{u}$ et de $\vec{v}$.`,
        corrige: r`$\vec{u}+\vec{v} = \begin{pmatrix} x_u+x_v \\ y_u+y_v \end{pmatrix}$ et $\vec{u}-\vec{v} = \begin{pmatrix} x_u-x_v \\ y_u-y_v \end{pmatrix}$.`,
      },
    ],
    multiplicationReperes: [
      {
        id: r`$k \cdot \vec{u} = \begin{pmatrix} k \cdot x_u \\ k \cdot y_u \end{pmatrix}$`,
        enonce: r`Donne les composantes de $k \cdot \vec{u}$ en fonction de celles de $\vec{u}$.`,
        corrige: r`$k \cdot \vec{u} = \begin{pmatrix} k \cdot x_u \\ k \cdot y_u \end{pmatrix}$.`,
      },
      {
        id: r`$x_u = a \cdot x_v + b \cdot x_w \quad y_u = a \cdot y_v + b \cdot y_w$`,
        enonce: r`Dans un repère, on veut décomposer $\vec{u} = a\vec{v} + b\vec{w}$, avec $\vec{v}$ et $\vec{w}$ non colinéaires. Quel système résout-on pour trouver $a$ et $b$ ?`,
        corrige: r`$x_u = a \cdot x_v + b \cdot x_w$ et $y_u = a \cdot y_v + b \cdot y_w$.`,
      },
    ],
    norme: [
      {
        id: r`$\|\vec{u}\| = \sqrt{x_u^2+y_u^2}$`,
        enonce: r`Donne la norme du vecteur $\vec{u}\begin{pmatrix} x_u \\ y_u \end{pmatrix}$, puis la distance entre les points $A(x_A\,;y_A)$ et $B(x_B\,;y_B)$.`,
        corrige: r`$\|\vec{u}\| = \sqrt{x_u^2+y_u^2}$ ; $AB = \sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$.`,
      },
      {
        id: r`$\|k \cdot \vec{u}\| = |k| \cdot \|\vec{u}\|$`,
        enonce: r`Exprime $\|k \cdot \vec{u}\|$ à l'aide de $k$ et de $\|\vec{u}\|$.`,
        corrige: r`$\|k \cdot \vec{u}\| = |k| \cdot \|\vec{u}\|$.`,
      },
    ],
    relation: [
      {
        id: r`$x_B=x_A+x_u$, $y_B=y_A+y_u$`,
        enonce: r`Le point $B$ est l'image de $A(x_A\,;y_A)$ par la translation de vecteur $\vec{u}\begin{pmatrix} x_u \\ y_u \end{pmatrix}$. Donne les coordonnées de $B$.`,
        corrige: r`$x_B=x_A+x_u$ et $y_B=y_A+y_u$.`,
      },
      {
        id: r`$x_M=\dfrac{x_A+x_B}{2}$, $y_M=\dfrac{y_A+y_B}{2}$`,
        enonce: r`Donne les coordonnées du milieu $M$ du segment $[AB]$.`,
        corrige: r`$x_M=\dfrac{x_A+x_B}{2}$ et $y_M=\dfrac{y_A+y_B}{2}$.`,
      },
      {
        id: r`$x_{A'}=2x_B-x_A$, $y_{A'}=2y_B-y_A$`,
        enonce: r`Donne les coordonnées du symétrique $A'$ du point $A$ par rapport au point $B$.`,
        corrige: r`$x_{A'}=2x_B-x_A$ et $y_{A'}=2y_B-y_A$ ($B$ est le milieu de $[AA']$).`,
      },
      {
        id: r`$x_D = x_A + x_C - x_B$, $y_D = y_A + y_C - y_B$`,
        enonce: r`$ABCD$ est un parallélogramme dont on connaît les sommets $A$, $B$ et $C$. Donne les coordonnées du quatrième sommet $D$.`,
        corrige: r`$x_D = x_A + x_C - x_B$ et $y_D = y_A + y_C - y_B$.`,
      },
      {
        id: r`$\vec{AM} = k \cdot \vec{AB}$`,
        enonce: r`Le point $M$ est défini par $\vec{AM} = k \cdot \vec{AB}$. Sur quelle droite se trouve $M$ ? Quel point obtient-on pour $k = 0$, $k = \dfrac{1}{2}$ et $k = 1$ ?`,
        corrige: r`$M$ est sur la droite $(AB)$ ; $k = 0$ : $A$ ; $k = \dfrac{1}{2}$ : le milieu de $[AB]$ ; $k = 1$ : $B$.`,
      },
    ],
    colinearite: [
      {
        id: r`$x_u \cdot y_v - y_u \cdot x_v = 0$`,
        enonce: r`Énonce le critère de colinéarité de deux vecteurs $\vec{u}\begin{pmatrix} x_u \\ y_u \end{pmatrix}$ et $\vec{v}\begin{pmatrix} x_v \\ y_v \end{pmatrix}$.`,
        corrige: r`$\vec{u}$ et $\vec{v}$ sont colinéaires si et seulement si $x_u \cdot y_v - y_u \cdot x_v = 0$ (les produits en croix sont égaux).`,
      },
    ],
    orthogonalite: [
      {
        id: r`$x_u \cdot x_v + y_u \cdot y_v = 0$`,
        enonce: r`À quelle condition sur leurs composantes deux vecteurs $\vec{u}$ et $\vec{v}$ sont-ils orthogonaux ?`,
        corrige: r`$\vec{u} \perp \vec{v} \iff x_u \cdot x_v + y_u \cdot y_v = 0$ (produit scalaire nul).`,
      },
      {
        id: r`$\vec{AB} = \vec{DC}$`,
        enonce: r`Un quadrilatère $ABCD$ vérifie $\vec{AB} = \vec{DC}$. Quelle est sa nature ? Quelle condition supplémentaire en fait un losange ? Un rectangle ? Un carré ?`,
        corrige: r`Un parallélogramme. Losange : $\|\vec{AB}\| = \|\vec{BC}\|$ ; rectangle : $x_{AB} \cdot x_{BC} + y_{AB} \cdot y_{BC} = 0$ (angle droit en $B$) ; carré : les deux à la fois.`,
      },
    ],
    directeur: [
      {
        id: r`$\begin{pmatrix} 1 \\ m \end{pmatrix}$`,
        enonce: r`Donne un vecteur directeur de la droite d'équation $y = mx + p$.`,
        corrige: r`$\begin{pmatrix} 1 \\ m \end{pmatrix}$ : quand $x$ augmente de $1$, $y$ augmente de $m$.`,
      },
    ],
    applications: [
      {
        id: r`$R^2 = F_1^2+F_2^2+2 \cdot F_1 \cdot F_2 \cdot \cos\theta$`,
        enonce: r`Deux forces de normes $F_1$ et $F_2$ forment entre elles un angle $\theta$. Donne le carré de la norme $R$ de leur résultante.`,
        corrige: r`$R^2 = F_1^2+F_2^2+2 \cdot F_1 \cdot F_2 \cdot \cos\theta$ (Al-Kashi, car $\cos(180^\circ - \theta) = -\cos\theta$).`,
      },
      {
        id: r`$\dfrac{\sin(\text{déviation})}{F_2} = \dfrac{\sin\theta}{R}$`,
        enonce: r`Comment calcule-t-on la déviation, l'angle entre la résultante $\vec{R}$ et $\vec{F_1}$ ? Quand cette déviation est-elle obtuse ?`,
        corrige: r`Loi des sinus : $\dfrac{\sin(\text{déviation})}{F_2} = \dfrac{\sin\theta}{R}$. Elle est obtuse si $F_1 + F_2\cos\theta < 0$ : elle vaut alors $180^\circ - \alpha_0$ ($\alpha_0$ donné par la calculatrice).`,
      },
      {
        id: r`$\vec{F_3} = -(\vec{F_1} + \vec{F_2})$`,
        enonce: r`Un objet soumis à trois forces $\vec{F_1}$, $\vec{F_2}$, $\vec{F_3}$ est en équilibre. Exprime $\vec{F_3}$ à l'aide de $\vec{F_1}$ et de $\vec{F_2}$.`,
        corrige: r`$\vec{F_3} = -(\vec{F_1} + \vec{F_2})$ : la somme des trois forces est nulle.`,
      },
    ],
  },

  // ── Ch. 7 — Géométrie analytique plane ─────────────────────────────────────────────────────────
  'geometrie-analytique-plane': {
    reperer: [
      {
        id: r`$a \cdot x + b \cdot y + c = 0$`,
        enonce: r`Donne un vecteur directeur de la droite d'équation $a \cdot x + b \cdot y + c = 0$. Cette forme d'équation est-elle possible pour toute droite ?`,
        corrige: r`$\begin{pmatrix} -b \\ a \end{pmatrix}$ (ou tout multiple non nul) ; oui, la forme implicite est toujours possible.`,
      },
      {
        id: r`$y = m \cdot x + p$`,
        enonce: r`Quand une droite ne peut-elle pas s'écrire sous la forme $y = m \cdot x + p$ ? Et sous la forme $x = n \cdot y + q$ ?`,
        corrige: r`$y = m \cdot x + p$ est impossible pour une droite verticale ; $x = n \cdot y + q$ est impossible pour une droite horizontale.`,
      },
      {
        id: r`$\begin{cases} x = x_0+t \cdot \alpha \\ y = y_0+t \cdot \beta \end{cases}$`,
        enonce: r`Écris une équation paramétrique de la droite qui passe par le point $(x_0\,;y_0)$ et admet le vecteur directeur $\begin{pmatrix} \alpha \\ \beta \end{pmatrix}$.`,
        corrige: r`$\begin{cases} x = x_0+t \cdot \alpha \\ y = y_0+t \cdot \beta \end{cases}$ ($t$ réel) — toujours possible.`,
      },
    ],
    caracteristiques: [
      {
        id: r`$m = \tan\theta$`,
        enonce: r`Quel lien y a-t-il entre la pente $m$ d'une droite et l'angle $\theta$ qu'elle forme avec l'axe $Ox$ ? Comment obtient-on ensuite l'angle avec l'axe $Oy$ ?`,
        corrige: r`$m = \tan\theta$, avec $\theta \in [0^\circ;180^\circ[$ ; $\theta_{Oy} = 90^\circ - \theta_{Ox}$, ramené dans $[0^\circ;180^\circ[$ (on ajoute $180^\circ$ s'il est négatif).`,
      },
      {
        id: r`$m = -\dfrac{a}{b}$, $p = -\dfrac{c}{b}$`,
        enonce: r`Donne la pente $m$ et l'ordonnée à l'origine $p$ de la droite d'équation $ax+by+c=0$, avec $b \neq 0$.`,
        corrige: r`$m = -\dfrac{a}{b}$ et $p = -\dfrac{c}{b}$.`,
      },
    ],
    relations: [
      {
        id: r`$\alpha \cdot \beta' - \beta \cdot \alpha' = 0$`,
        enonce: r`Deux droites ont pour vecteurs directeurs $\begin{pmatrix} \alpha \\ \beta \end{pmatrix}$ et $\begin{pmatrix} \alpha' \\ \beta' \end{pmatrix}$. Quelle condition traduit qu'elles sont parallèles ? Qu'elles sont perpendiculaires ? Donne aussi ces conditions avec leurs pentes $m$ et $m'$.`,
        corrige: r`Parallèles : $\alpha \cdot \beta' - \beta \cdot \alpha' = 0$ (critère de colinéarité), ou $m = m'$. Perpendiculaires : $\alpha \cdot \alpha' + \beta \cdot \beta' = 0$ (produit scalaire nul), ou $m \cdot m' = -1$ si aucune n'est verticale ni horizontale.`,
      },
    ],
    distance: [
      {
        id: r`$|x_P - k|$`,
        enonce: r`Quelle est la distance d'un point $P(x_P\,;y_P)$ à la droite verticale $x = k$ ? Et à la droite horizontale $y = k$ ?`,
        corrige: r`$|x_P - k|$ pour la verticale ; $|y_P - k|$ pour l'horizontale.`,
      },
    ],
    'notion-lieu': [
      {
        id: r`$MA^2 = MB^2$`,
        enonce: r`Quel est le lieu des points $M$ équidistants de deux points $A$ et $B$ ? Comment en obtient-on une équation ?`,
        corrige: r`La médiatrice de $[AB]$ : on écrit $MA^2 = MB^2$, on développe, les carrés $x^2$ et $y^2$ s'éliminent et il reste l'équation d'une droite.`,
      },
    ],
    cercle: [
      {
        id: r`$(x-x_0)^2+(y-y_0)^2=r^2$`,
        enonce: r`Donne une équation du cercle de centre $(x_0\,;y_0)$ et de rayon $r$.`,
        corrige: r`$(x-x_0)^2+(y-y_0)^2=r^2$.`,
      },
      {
        id: r`$\vec{CP} \cdot \vec{PM} = 0$`,
        enonce: r`Comment caractérise-t-on la tangente en un point $P$ d'un cercle de centre $C$ ? Quelle condition vérifie un point $M$ de cette tangente ?`,
        corrige: r`Elle est perpendiculaire au rayon $[CP]$ : $\vec{CP} \cdot \vec{PM} = 0$ (produit scalaire nul).`,
      },
    ],
    parabole: [
      {
        id: r`$(x-x_S)^2=2p(y-y_S)$`,
        enonce: r`Donne l'équation d'une parabole de sommet $S(x_S\,;y_S)$ d'axe vertical, puis d'axe horizontal. Comment calcule-t-on son paramètre $p$ à partir du foyer $F$ ?`,
        corrige: r`Axe vertical : $(x-x_S)^2=2p(y-y_S)$ avec $p=2(y_F-y_S)$. Axe horizontal : $(y-y_S)^2=2p(x-x_S)$ avec $p=2(x_F-x_S)$ ($p$ est signé).`,
      },
      {
        id: r`$p = \dfrac{1}{2a}$`,
        enonce: r`La courbe de $y = ax^2$ est une parabole d'axe vertical et de sommet $O$. Que vaut son paramètre $p$ ?`,
        corrige: r`$p = \dfrac{1}{2a}$ (car $x^2 = \dfrac{1}{a}\,y$, donc $2p = \dfrac{1}{a}$).`,
      },
    ],
  },

  // ── Ch. 8 — Géométrie dans l'espace (propriétés à restituer) ───────────────────────────────────
  'geometrie-dans-espace': {
    cavaliere: [
      {
        id: r`Axes $x$ et $z$ : conservés à l'échelle réelle`,
        enonce: r`En perspective cavalière, comment représente-t-on les longueurs mesurées selon les axes $x$ et $z$ ? Et selon l'axe $y$ (la profondeur) ?`,
        corrige: r`Axes $x$ et $z$ : à l'échelle réelle. Axe $y$ : dans une direction à $45^\circ$, longueurs multipliées par $\dfrac{1}{2}$.`,
      },
    ],
    'determiner-plan': [
      {
        id: r`3 points non alignés`,
        enonce: r`Cite les quatre façons de déterminer un plan.`,
        corrige: r`Trois points non alignés ; une droite et un point extérieur à cette droite ; deux droites sécantes ; deux droites parallèles distinctes.`,
      },
    ],
    'deux-droites': [
      {
        id: r`Droites gauches : ni sécantes, ni parallèles (aucun plan commun)`,
        enonce: r`Qu'appelle-t-on deux droites gauches ?`,
        corrige: r`Deux droites ni sécantes ni parallèles : aucun plan ne les contient toutes les deux.`,
      },
    ],
    'trois-plans': [
      {
        id: r`Trois plans sécants deux à deux : intersections concourantes, parallèles ou confondues`,
        enonce: r`Trois plans distincts sont sécants deux à deux. Que peut-on dire des trois droites d'intersection ?`,
        corrige: r`Elles sont concourantes, parallèles ou confondues — jamais quelconques.`,
      },
    ],
    parallelisme: [
      {
        id: r`Droite ∥ plan : $d \parallel \alpha$`,
        enonce: r`À quelle condition une droite $d$ est-elle parallèle à un plan $\alpha$ ?`,
        corrige: r`$d \parallel \alpha$ si $d$ est parallèle à une droite du plan $\alpha$.`,
      },
      {
        id: r`Plan ∥ plan : 2 droites sécantes de l'un, ∥ à 2 droites de l'autre`,
        enonce: r`À quelle condition deux plans sont-ils parallèles ?`,
        corrige: r`Si deux droites sécantes de l'un sont parallèles à deux droites de l'autre.`,
      },
    ],
    section: [
      {
        id: r`Chaque face traversée → exactement **2** sommets de la section`,
        enonce: r`On coupe un solide convexe par un plan. Combien de sommets de la section chaque face traversée contient-elle ? Quelle forme a la section obtenue ?`,
        corrige: r`Exactement $2$ sommets par face traversée ; la section est toujours un seul polygone fermé.`,
      },
      {
        id: r`Parallélépipède : deux faces opposées → deux côtés de section parallèles`,
        enonce: r`Sur un parallélépipède, que peut-on dire des deux côtés de la section situés dans deux faces opposées ?`,
        corrige: r`Ils sont parallèles (deux faces opposées sont dans des plans parallèles).`,
      },
    ],
    'point-de-fuite': [
      {
        id: r`Ligne d'horizon : à la hauteur de l'œil (ou de l'objectif)`,
        enonce: r`En perspective centrale, où se trouve la ligne d'horizon ? Où convergent des fuyantes horizontales parallèles entre elles ? Que deviennent les droites parallèles à la vitre ?`,
        corrige: r`La ligne d'horizon est à la hauteur de l'œil (ou de l'objectif). Des fuyantes horizontales parallèles convergent vers un même point de fuite, sur la ligne d'horizon. Les droites parallèles à la vitre restent parallèles.`,
      },
    ],
    ombre: [
      {
        id: r`Ombre d'un point : parallèle à la direction du soleil, jusqu'au sol ou au premier obstacle`,
        enonce: r`Au soleil, comment construit-on l'ombre d'un point ?`,
        corrige: r`On trace par ce point la parallèle à la direction du soleil (une seule direction pour toute la scène, dans le bon sens), jusqu'au sol ou au premier obstacle.`,
      },
    ],
  },
}
