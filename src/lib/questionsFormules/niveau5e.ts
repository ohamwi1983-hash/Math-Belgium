import type { BanqueFormules } from './types'

const r = String.raw

/** Questions « Formule » de 5e — voir `types.ts`. */
export const FORMULES_5E: BanqueFormules = {

  // ── Ch. 1 — Fonctions : rappels et compléments ─────────────────────────────────────────────────
  'fonctions-composees': {
    domaine: [
      {
        id: r`dénominateur : $D(x) \neq 0$`,
        enonce: r`Quelle condition d'existence pose-t-on pour un dénominateur ? Pour une racine d'indice pair ? Pour une racine d'indice pair située au dénominateur ?`,
        corrige: r`Dénominateur : $D(x) \neq 0$. Racine d'indice pair : radicande $\ge 0$. Racine au dénominateur : radicande $> 0$ (à la fois $\ge 0$ et $\neq 0$).`,
      },
      {
        id: r`plusieurs CE : intersection de leurs solutions`,
        enonce: r`Quelles expressions n'imposent aucune condition d'existence ? Quand une fonction impose plusieurs conditions, comment combine-t-on leurs solutions ?`,
        corrige: r`Racine d'indice impair et valeur absolue : aucune CE. Plusieurs CE : on prend l'intersection de leurs solutions (toutes les conditions à la fois, jamais une union).`,
      },
      {
        id: r`signe de $\dfrac{N(x)}{D(x)}$ : tableau de signes de $N$ et de $D$, règle des signes colonne par colonne`,
        enonce: r`Comment étudie-t-on le signe de $\dfrac{N(x)}{D(x)}$ ? Qu'écrit-on dans la dernière ligne du tableau sous les zéros de $D$, et sous ceux de $N$ ?`,
        corrige: r`Tableau de signes de $N$ et de $D$, puis règle des signes colonne par colonne ; double barre sous les zéros de $D$ (valeurs interdites), $0$ sous ceux de $N$.`,
      },
      {
        id: r`$\sqrt{\dfrac{N(x)}{D(x)}}$ : garder les colonnes « + » et les zéros de N`,
        enonce: r`Pour trouver le domaine de $\sqrt{\dfrac{N(x)}{D(x)}}$, que garde-t-on dans le tableau de signes de $\dfrac{N(x)}{D(x)}$ ?`,
        corrige: r`Les colonnes « $+$ » et les zéros de $N$ — jamais la double barre (zéros de $D$).`,
      },
      {
        id: r`$\operatorname{Im} f$ : l’ensemble des valeurs $f(x)$ atteintes quand x parcourt $\operatorname{dom} f$`,
        enonce: r`Qu'appelle-t-on l'image $\operatorname{Im} f$ d'une fonction $f$ ? Comment la lit-on sur un graphique ?`,
        corrige: r`L'ensemble des valeurs $f(x)$ atteintes quand $x$ parcourt $\operatorname{dom} f$ ; sur un graphique, la projection de la courbe sur l'axe des $y$.`,
      },
    ],
    decomposer: [
      {
        id: r`$(f\circ g)(x) = f(g(x))$`,
        enonce: r`Donne la définition de $(f\circ g)(x)$. Laquelle des deux fonctions agit en premier ?`,
        corrige: r`$(f\circ g)(x) = f(g(x))$ : $g$ agit en premier, $f$ en second.`,
      },
      {
        id: r`$f(x) = mx + p$, $g(x) = m'x + p'$ : $(f\circ g)(x) = mm'x + (mp' + p)$`,
        enonce: r`Pour $f(x) = mx + p$ et $g(x) = m'x + p'$, donne $(f\circ g)(x)$. Quel type de fonction obtient-on, et quelle est sa pente ?`,
        corrige: r`$(f\circ g)(x) = mm'x + (mp' + p)$ : une fonction affine, de pente $mm'$ (produit des pentes).`,
      },
      {
        id: r`décomposer : repérer la dernière opération effectuée, l’éplucher, recommencer`,
        enonce: r`Comment décompose-t-on une écriture composée $h(x)$ en fonctions de référence ?`,
        corrige: r`On repère la dernière opération effectuée, on l'« épluche », puis on recommence sur ce qui reste ; chaque étage est une fonction de référence (affine, polynôme simple, puissance, racine, inverse, valeur absolue).`,
      },
    ],
    composer: [
      {
        id: r`$\operatorname{dom}(f\circ g) = \{x \in \operatorname{dom} g : g(x) \in \operatorname{dom} f\}$`,
        enonce: r`Exprime le domaine de $f\circ g$ à l'aide de $\operatorname{dom} g$ et de $\operatorname{dom} f$. Que se passe-t-il si l'image de $g$ n'a aucun point commun avec $\operatorname{dom} f$ ?`,
        corrige: r`$\operatorname{dom}(f\circ g) = \{x \in \operatorname{dom} g : g(x) \in \operatorname{dom} f\}$ (les deux conditions à la fois) ; sinon $\operatorname{dom}(f\circ g) = \varnothing$ : la composée n'est définie nulle part.`,
      },
      {
        id: r`$(f\circ g)\circ h = f\circ(g\circ h)$`,
        enonce: r`Que peut-on dire de $(f\circ g)\circ h$ et de $f\circ(g\circ h)$ ? Peut-on échanger l'ordre des fonctions dans une composée ?`,
        corrige: r`$(f\circ g)\circ h = f\circ(g\circ h)$ (associativité) : seule la place des parenthèses est libre, jamais l'ordre des fonctions.`,
      },
    ],
    graphique: [
      {
        id: r`$(g\circ f)(a) = g(f(a))$`,
        enonce: r`Comment lit-on $(g\circ f)(a)$ à partir des graphiques $C_f$ et $C_g$ ? Quand cette valeur n'existe-t-elle pas ?`,
        corrige: r`$(g\circ f)(a) = g(f(a))$ : on lit $f(a)$ sur $C_f$, puis on reporte cette valeur sur l'axe des $x$ de $C_g$. Elle n'existe pas si $f(a)$ sort du domaine de $g$ (une portion simplement non tracée n'est pas « n'existe pas »).`,
      },
    ],
    contexte: [
      {
        id: r`$h(r) = \dfrac{V}{\pi r^2}$`,
        enonce: r`Un cylindre fermé a pour volume $V$ et pour rayon $r$. Exprime sa hauteur $h(r)$, puis son aire totale $A(r)$.`,
        corrige: r`$h(r) = \dfrac{V}{\pi r^2}$ ; $A(r) = 2\pi r^2 + 2\pi r \cdot h(r) = 2\pi r^2 + \dfrac{2V}{r}$.`,
      },
      {
        id: r`$A(r) = 2\pi r^2 + \dfrac{2V}{r}$`,
        enonce: r`Pour un cylindre fermé de volume $V$ donné, quelle relation entre la hauteur $h$ et le rayon $r$ rend l'aire totale minimale ? Pour quel rayon ?`,
        corrige: r`L'aire est minimale quand $h = 2r$, en $r = \sqrt[3]{\dfrac{V}{2\pi}}$.`,
      },
      {
        id: r`$c(x) = \dfrac{C(x)}{x}$`,
        enonce: r`Le coût total de production de $x$ objets vaut $C(x)$. Comment obtient-on le coût unitaire $c(x)$ ? De quoi se compose le coût total ?`,
        corrige: r`$c(x) = \dfrac{C(x)}{x}$ (un quotient, pas une composition) ; coût total $=$ coût fixe $+$ coûts qui dépendent de la quantité $x$.`,
      },
      {
        id: r`$B(x) = CA(x) - C(x)$`,
        enonce: r`$CA(x)$ est le chiffre d'affaires et $C(x)$ le coût total pour $x$ objets. Comment définit-on le bénéfice $B(x)$ ? Qu'appelle-t-on le seuil de rentabilité ?`,
        corrige: r`$B(x) = CA(x) - C(x)$ ; le seuil de rentabilité est la plus petite solution de $B(x) = 0$.`,
      },
    ],
  },

  // ── Ch. 2 — Trigonométrie ──────────────────────────────────────────────────────────────────────
  trigonometrie: {
    'arcs-secteurs': [
      {
        id: r`$\text{angle}_{rad} = \text{angle}_{deg} \times \dfrac{\pi}{180}$`,
        enonce: r`Comment convertit-on un angle de degrés en radians ? Et de radians en degrés ?`,
        corrige: r`$\text{angle}_{rad} = \text{angle}_{deg} \times \dfrac{\pi}{180}$ et $\text{angle}_{deg} = \text{angle}_{rad} \times \dfrac{180}{\pi}$.`,
      },
      {
        id: r`$s = r\theta$`,
        enonce: r`Un secteur circulaire de rayon $r$ a un angle au centre $\theta$, en radians. Donne la longueur $s$ de son arc et son aire $A$.`,
        corrige: r`$s = r\theta$ et $A = \dfrac{1}{2}r^2\theta$ ($\theta$ toujours en radians).`,
      },
      {
        id: r`$\theta = \dfrac{s}{r}$`,
        enonce: r`Dans un secteur circulaire, comment retrouve-t-on l'angle $\theta$ à partir de l'arc $s$ et du rayon $r$ ? Le rayon à partir de l'aire $A$ et de l'arc $s$ ? Le rayon à partir de l'aire $A$ et de l'angle $\theta$ ?`,
        corrige: r`$\theta = \dfrac{s}{r}$ ; $r = \dfrac{2A}{s}$ (car $A = \dfrac{1}{2}r \cdot s$) ; $r = \sqrt{\dfrac{2A}{\theta}}$.`,
      },
    ],
    polygones: [
      {
        id: r`$\theta = \dfrac{2\pi}{n}$`,
        enonce: r`Un polygone régulier à $n$ côtés est inscrit dans un cercle de rayon $r$. Donne l'angle au centre qui intercepte un côté, puis la longueur de l'arc et l'aire du secteur qui couvrent $k$ côtés.`,
        corrige: r`$\theta = \dfrac{2\pi}{n}$ ; arc $s = k \cdot \dfrac{2\pi r}{n}$ ; secteur $A = k \cdot \dfrac{\pi r^2}{n}$.`,
      },
    ],
    'geometrie-cercle': [
      {
        id: r`$A_{segment} = \dfrac{1}{2}r^2(\theta - \sin\theta)$`,
        enonce: r`Donne l'aire d'un triangle isocèle dont les côtés égaux mesurent $r$ et forment l'angle $\theta$, puis l'aire du segment circulaire de rayon $r$ et d'angle au centre $\theta$ (en radians).`,
        corrige: r`$A_{triangle} = \dfrac{1}{2}r^2\sin\theta$ ; $A_{segment} = \dfrac{1}{2}r^2(\theta - \sin\theta)$ (secteur moins triangle).`,
      },
      {
        id: r`$c^2 = 2r^2(1-\cos\theta)$`,
        enonce: r`Dans un cercle de rayon $r$, une corde de longueur $c$ sous-tend l'angle au centre $\theta$. Exprime $c^2$ en fonction de $r$ et $\theta$, puis $\cos\theta$ en fonction de $c$ et $r$.`,
        corrige: r`$c^2 = 2r^2(1-\cos\theta)$ (loi des cosinus) ; $\cos\theta = 1 - \dfrac{c^2}{2r^2}$.`,
      },
      {
        id: r`$A_{balayée} = \dfrac{1}{2}\theta(r_1^2 - r_2^2)$`,
        enonce: r`Un essuie-glace pivote d'un angle $\theta$ (en radians) ; son balai racle la vitre entre les distances $r_2$ et $r_1$ du pivot ($r_2 < r_1$). Donne l'aire balayée.`,
        corrige: r`$A_{\text{balayée}} =\dfrac{1}{2}\theta(r_1^2 - r_2^2)$ (différence de deux secteurs).`,
      },
    ],
    parametres: [
      {
        id: r`$A = \dfrac{max-min}{2} \quad b = \dfrac{max+min}{2}$`,
        enonce: r`Pour $f(x) = A\sin(\omega x + \varphi) + b$, comment calcule-t-on l'amplitude $A$ et la valeur moyenne $b$ à partir du maximum et du minimum de $f$ ?`,
        corrige: r`$A = \dfrac{max-min}{2}$ et $b = \dfrac{max+min}{2}$.`,
      },
      {
        id: r`$T = \dfrac{2\pi}{\omega}$`,
        enonce: r`Donne la période $T$ et la fréquence de $f(x) = A\sin(\omega x + \varphi) + b$ en fonction de $\omega$.`,
        corrige: r`$T = \dfrac{2\pi}{\omega}$ (jamais l'inverse de $\omega$) ; $\text{fréquence} = \dfrac{1}{T} = \dfrac{\omega}{2\pi}$.`,
      },
      {
        id: r`$\Phi = -\dfrac{\varphi}{\omega}$`,
        enonce: r`De combien la courbe de $f(x) = A\sin(\omega x + \varphi) + b$ est-elle décalée horizontalement ? Donne ce décalage $\Phi$ en fonction de $\varphi$ et $\omega$, et l'intervalle où l'on choisit le déphasage $\varphi$.`,
        corrige: r`$\Phi = -\dfrac{\varphi}{\omega}$ (vers la droite si $\Phi > 0$) ; $\varphi \in \, ]{-\pi}\,;\pi]$ (on ajoute ou retranche $2\pi$ pour l'y ramener).`,
      },
    ],
    'lecture-graphique': [
      {
        id: r`$\varphi = -\omega \cdot x_0$`,
        enonce: r`Sur le graphique de $f(x) = A\sin(\omega x + \varphi) + b$, avec $A > 0$, comment obtient-on $\varphi$ à partir de l'abscisse $x_0$ d'une traversée montante de la ligne moyenne ? Et à partir de l'abscisse $x_{max}$ d'un maximum ?`,
        corrige: r`$\varphi = -\omega \cdot x_0$ ; $\varphi = \dfrac{\pi}{2} - \omega x_{max}$ (puis ramené dans $]{-\pi}\,;\pi]$).`,
      },
    ],
    extremums: [
      {
        id: r`$max = b + |A|$, $\ min = b - |A|$`,
        enonce: r`Donne le maximum et le minimum de $f(x) = A\sin(\omega x + \varphi) + b$.`,
        corrige: r`$max = b + |A|$ et $min = b - |A|$ (si $A < 0$, le maximum correspond à $\sin(u) = -1$).`,
      },
      {
        id: r`$\sin(u) = 1$`,
        enonce: r`Avec $u = \omega x + \varphi$ et $A > 0$, quelle équation en $u$ donne les maximums seuls de $A\sin(u) + b$ ? Les minimums seuls ? Tous les extremums ?`,
        corrige: r`Maximums : $\sin(u) = 1 \iff u = \dfrac{\pi}{2} + 2k\pi$ ; minimums : $\sin(u) = -1 \iff u = -\dfrac{\pi}{2} + 2k\pi$ ; tous : $|\sin(u)| = 1 \iff u = \dfrac{\pi}{2} + k\pi$.`,
      },
      {
        id: r`$\cos(u) = 1 \iff u = 2k\pi$`,
        enonce: r`Avec $u = \omega x + \varphi$ et $A > 0$, quelle équation en $u$ donne les maximums seuls de $A\cos(u) + b$ ? Les minimums seuls ? Tous les extremums ?`,
        corrige: r`Maximums : $\cos(u) = 1 \iff u = 2k\pi$ ; minimums : $\cos(u) = -1 \iff u = \pi + 2k\pi$ ; tous : $|\cos(u)| = 1 \iff u = k\pi$.`,
      },
    ],
    equations: [
      {
        id: r`$\sin x = c \Rightarrow x=\alpha+2k\pi$ ou $x=(\pi-\alpha)+2k\pi$`,
        enonce: r`Donne toutes les solutions de $\sin x = c$, à l'aide d'une solution particulière $\alpha$ ($k \in \mathbb{Z}$). Quand cette équation n'a-t-elle aucune solution ?`,
        corrige: r`$x = \alpha + 2k\pi$ ou $x = (\pi - \alpha) + 2k\pi$ ; aucune solution si $|c| > 1$.`,
      },
      {
        id: r`$\cos x = c \Rightarrow x=\alpha+2k\pi$ ou $x=-\alpha+2k\pi$`,
        enonce: r`Donne toutes les solutions de $\cos x = c$, puis celles de $\tan x = c$, à l'aide d'une solution particulière $\alpha$ ($k \in \mathbb{Z}$).`,
        corrige: r`$\cos x = c$ : $x = \alpha + 2k\pi$ ou $x = -\alpha + 2k\pi$ (aucune solution si $|c| > 1$) ; $\tan x = c$ : $x = \alpha + k\pi$ (une seule famille).`,
      },
      {
        id: r`$\sin^2 x + \cos^2 x = 1$`,
        enonce: r`Pour résoudre une équation du second degré en $\sin x$ et $\cos x$, quelle identité et quelle substitution utilise-t-on ? Quelles valeurs de l'inconnue auxiliaire rejette-t-on ?`,
        corrige: r`$\sin^2 x + \cos^2 x = 1$ pour n'avoir plus qu'une seule fonction, puis on pose $t = \cos x$ (ou $t = \sin x$) ; on rejette les valeurs telles que $|t| > 1$.`,
      },
      {
        id: r`$\sin\theta = \cos\left(\frac{\pi}{2}-\theta\right)$, $\;-\tan\theta = \tan(-\theta)$`,
        enonce: r`Complète : $\sin\theta = \cos(\ldots)$ et $-\tan\theta = \tan(\ldots)$.`,
        corrige: r`$\sin\theta = \cos\left(\dfrac{\pi}{2}-\theta\right)$ et $-\tan\theta = \tan(-\theta)$.`,
      },
      {
        id: r`$\tan u$ existe $\iff u \neq \frac{\pi}{2}+k\pi$`,
        enonce: r`Pour quelles valeurs de $u$ l'expression $\tan u$ existe-t-elle ?`,
        corrige: r`$\tan u$ existe $\iff u \neq \dfrac{\pi}{2}+k\pi$, $k \in \mathbb{Z}$.`,
      },
    ],
    modeliser: [
      {
        id: r`$\omega = \dfrac{2\pi}{T}$`,
        enonce: r`Un phénomène est modélisé par $f(t) = A\sin(\omega t + \varphi) + b$, avec $A > 0$. Comment calcule-t-on $\omega$ à partir de la durée $T$ d'un cycle complet ? Quelle équation donne $\varphi$ si le maximum est atteint en $t_0$ ?`,
        corrige: r`$\omega = \dfrac{2\pi}{T}$ ; $\omega t_0 + \varphi = \dfrac{\pi}{2}$ (pour un minimum atteint en $t_0$ : $-\dfrac{\pi}{2}$).`,
      },
      {
        id: r`$\sin\varphi = m$ : $\varphi = \arcsin m$ ou $\varphi = \pi - \arcsin m$`,
        enonce: r`Au départ, la grandeur n'est pas à un extremum et l'on obtient $\sin\varphi = m$. Quelles sont les deux valeurs possibles de $\varphi$ dans $]{-\pi}\,;\pi]$ ? Comment choisit-on ?`,
        corrige: r`$\varphi = \arcsin m$ ou $\varphi = \pi - \arcsin m$ ; le sens de variation au départ (monte ou descend) tranche.`,
      },
      {
        id: r`$\omega = \dfrac{\alpha_2 - \alpha_1}{t_2 - t_1}$, $\ \varphi = \alpha_1 - \omega t_1$`,
        enonce: r`Deux points $(t_1\,;f_1)$ et $(t_2\,;f_2)$ d'une même montée donnent $\omega t_1 + \varphi = \alpha_1$ et $\omega t_2 + \varphi = \alpha_2$. Comment obtient-on $\omega$, puis $\varphi$ ?`,
        corrige: r`On soustrait membre à membre : $\omega = \dfrac{\alpha_2 - \alpha_1}{t_2 - t_1}$ ; puis on remplace : $\varphi = \alpha_1 - \omega t_1$.`,
      },
      {
        id: r`$\sin u \geq m \iff u \in [\arcsin m\,;\pi-\arcsin m]+2k\pi$`,
        enonce: r`Pour $-1 < m < 1$, donne les solutions de l'inéquation $\sin u \ge m$.`,
        corrige: r`$\sin u \ge m \iff u \in [\arcsin m\,;\pi-\arcsin m]+2k\pi$, $k \in \mathbb{Z}$ (l'arc du haut du cercle).`,
      },
    ],
  },

  // ── Ch. 3 — Suites ─────────────────────────────────────────────────────────────────────────────
  suites: {
    'suites-arithmetiques': [
      {
        id: r`$u_n = u_1 + (n-1)r$`,
        enonce: r`Donne le terme général $u_n$ d'une suite arithmétique de premier terme $u_1$ et de raison $r$, puis la relation entre deux termes quelconques $u_n$ et $u_p$.`,
        corrige: r`$u_n = u_1 + (n-1)r$ ; $u_n = u_p + (n-p)r$.`,
      },
      {
        id: r`$S_n = \dfrac{n(u_1+u_n)}{2}$`,
        enonce: r`Donne la somme $S_n$ des $n$ premiers termes d'une suite arithmétique. Combien de termes compte la somme $u_p + \ldots + u_n$, et que vaut-elle ?`,
        corrige: r`$S_n = \dfrac{n(u_1+u_n)}{2}$ ; $u_p + \ldots + u_n$ compte $n-p+1$ termes et vaut $(n-p+1)\times\dfrac{u_p+u_n}{2}$.`,
      },
      {
        id: r`$u_n = \dfrac{u_{n-1}+u_{n+1}}{2}$`,
        enonce: r`Quelle relation lie trois termes consécutifs $u_{n-1}$, $u_n$ et $u_{n+1}$ d'une suite arithmétique ?`,
        corrige: r`$u_n = \dfrac{u_{n-1}+u_{n+1}}{2}$ (moyenne arithmétique de ses voisins), pour $n \ge 2$.`,
      },
    ],
    'suites-geometriques': [
      {
        id: r`$u_n = u_1 \times q^{n-1}$`,
        enonce: r`Donne le terme général $u_n$ d'une suite géométrique de premier terme $u_1$ et de raison $q$, puis la relation entre deux termes quelconques $u_n$ et $u_p$.`,
        corrige: r`$u_n = u_1 \times q^{n-1}$ ; $u_n = u_p \times q^{n-p}$.`,
      },
      {
        id: r`$q = 1 + \dfrac{t}{100}$`,
        enonce: r`Quelle raison $q$ correspond à une hausse de $t$ % à chaque étape ? À une baisse de $t$ % ?`,
        corrige: r`Hausse : $q = 1 + \dfrac{t}{100}$ ; baisse : $q = 1 - \dfrac{t}{100}$.`,
      },
      {
        id: r`$S_n = u_1 \times \dfrac{1-q^n}{1-q}$`,
        enonce: r`Donne la somme $S_n$ des $n$ premiers termes d'une suite géométrique de premier terme $u_1$ et de raison $q \neq 1$.`,
        corrige: r`$S_n = u_1 \times \dfrac{1-q^n}{1-q}$.`,
      },
      {
        id: r`$u_n = \sqrt{u_{n-1} \times u_{n+1}}$`,
        enonce: r`Quelle relation lie trois termes consécutifs positifs $u_{n-1}$, $u_n$ et $u_{n+1}$ d'une suite géométrique ?`,
        corrige: r`$u_n = \sqrt{u_{n-1} \times u_{n+1}}$ (moyenne géométrique de ses voisins), pour $n \ge 2$.`,
      },
    ],
    convergence: [
      {
        id: r`$r>0 \Rightarrow \lim u_n = +\infty$`,
        enonce: r`Quelle est la limite d'une suite arithmétique de premier terme $u_1$, selon le signe de sa raison $r$ ?`,
        corrige: r`$r > 0$ : $+\infty$ ; $r < 0$ : $-\infty$ ; $r = 0$ : $u_1$ (suite constante).`,
      },
      {
        id: r`$|q|<1 \Rightarrow \lim u_n = 0$`,
        enonce: r`Quelle est la limite d'une suite géométrique de premier terme $u_1$ et de raison $q$, selon que $|q| < 1$, $q = 1$, $q > 1$, $q = -1$ ou $q < -1$ ?`,
        corrige: [
          r`$|q| < 1$ : $0$ ; $q = 1$ : $u_1$ (suite constante) ; $q > 1$ : $\pm\infty$ (signe de $u_1$).`,
          r`$q = -1$ : pas de limite (elle oscille entre $u_1$ et $-u_1$) ; $q < -1$ : pas de limite ($|u_n|$ grandit sans borne en changeant de signe).`,
        ],
      },
      {
        id: r`$S_\infty = \dfrac{u_1}{1-q}$`,
        enonce: r`Que vaut la somme infinie $S_\infty$ des termes d'une suite géométrique de premier terme $u_1$ et de raison $q$ ? À quelle condition existe-t-elle ?`,
        corrige: r`$S_\infty = \dfrac{u_1}{1-q}$, seulement si $|q| < 1$.`,
      },
      {
        id: r`degré(P) < degré(Q) $\Rightarrow \lim u_n = 0$`,
        enonce: r`Comment trouve-t-on la limite de $u_n = \dfrac{P(n)}{Q(n)}$ ($P$ et $Q$ polynômes) en comparant les degrés de $P$ et de $Q$ ?`,
        corrige: r`Degré de $P$ < degré de $Q$ : limite $0$ ; degrés égaux : rapport des coefficients dominants ; degré de $P$ > degré de $Q$ : $\pm\infty$.`,
      },
    ],
    'recurrente-affine': [
      {
        id: r`$L = \dfrac{b}{1-a}$`,
        enonce: r`Pour la suite définie par $u_{n+1} = a \times u_n + b$, que vaut le régime permanent $L$ ? À quelle condition la suite converge-t-elle vers $L$ ?`,
        corrige: r`$L = \dfrac{b}{1-a}$ (point fixe) ; la suite converge vers $L$ si $|a| < 1$.`,
      },
      {
        id: r`$u_n = L + (u_1 - L)\times a^{n-1}$`,
        enonce: r`Donne la formule explicite de $u_n$ pour la suite $u_{n+1} = a \times u_n + b$, à l'aide de son régime permanent $L$ et de $u_1$.`,
        corrige: r`$u_n = L + (u_1 - L)\times a^{n-1}$ : la suite $v_n = u_n - L$ est géométrique de raison $a$.`,
      },
    ],
  },

  // ── Ch. 4 — Limites et asymptotes ──────────────────────────────────────────────────────────────
  'limites-asymptotes': {
    'limites-calcul': [
      {
        id: r`$\lim_{x\to+\infty} x^n = +\infty$`,
        enonce: r`Donne les limites de $x^n$ ($n \ge 1$ entier) en $+\infty$ et en $-\infty$.`,
        corrige: r`$\displaystyle\lim_{x\to+\infty} x^n = +\infty$ ; en $-\infty$ : $+\infty$ si $n$ est pair, $-\infty$ si $n$ est impair.`,
      },
      {
        id: r`$\lim_{x\to\pm\infty} 1/x = 0$`,
        enonce: r`Donne les limites de $\dfrac{1}{x}$ en $\pm\infty$, en $0^+$ et en $0^-$.`,
        corrige: r`$\displaystyle\lim_{x\to\pm\infty} \dfrac{1}{x} = 0$ ; $\displaystyle\lim_{x\to 0^+} \dfrac{1}{x} = +\infty$ ; $\displaystyle\lim_{x\to 0^-} \dfrac{1}{x} = -\infty$.`,
      },
      {
        id: r`$\dfrac{0}{0}$ — factoriser le facteur commun, puis simplifier`,
        enonce: r`Comment lève-t-on une forme indéterminée $\dfrac{0}{0}$ ? Une forme $\dfrac{\infty}{\infty}$ ? Une forme $\infty - \infty$ ?`,
        corrige: r`$\dfrac{0}{0}$ : on factorise numérateur et dénominateur par leur facteur commun, puis on simplifie. $\dfrac{\infty}{\infty}$ : on met en évidence le terme de plus haut degré, en haut et en bas. $\infty - \infty$ : terme dominant (polynômes) ou expression conjuguée (racines).`,
      },
    ],
    'asymptote-oblique': [
      {
        id: r`AV : $x=a$`,
        enonce: r`À quelle condition la courbe de $f$ admet-elle une asymptote verticale $x = a$ ? Une asymptote horizontale $y = b$ ? Une asymptote oblique $y = ax + b$ ?`,
        corrige: [
          r`AV $x = a$ : $\displaystyle\lim_{x\to a^-} f(x) = \pm\infty$ ou $\displaystyle\lim_{x\to a^+} f(x) = \pm\infty$.`,
          r`AH $y = b$ : $\displaystyle\lim_{x\to\pm\infty} f(x) = b$. AO $y = ax + b$ : $\displaystyle\lim_{x\to\pm\infty} [f(x)-(ax+b)] = 0$.`,
        ],
      },
      {
        id: r`$a = \lim_{x\to\pm\infty} \dfrac{f(x)}{x}$`,
        enonce: r`Comment calcule-t-on les coefficients $a$ et $b$ de l'asymptote oblique $y = ax + b$ de la courbe de $f$ ?`,
        corrige: r`$a = \displaystyle\lim_{x\to\pm\infty} \dfrac{f(x)}{x}$, puis $b = \displaystyle\lim_{x\to\pm\infty} [f(x)-ax]$ (par division euclidienne : le reste ne fait jamais partie de l'asymptote).`,
      },
    ],
    'limites-contexte': [
      {
        id: r`$f(x)=\dfrac{bx+q}{x+p} = b+\dfrac{a}{x+p}$`,
        enonce: r`Par division euclidienne, écris $f(x) = \dfrac{bx+q}{x+p}$ sous la forme $b + \dfrac{a}{x+p}$. Quelle asymptote horizontale en découle ?`,
        corrige: r`$f(x) = b + \dfrac{a}{x+p}$ avec $a = q - bp$ ; asymptote horizontale $y = b$.`,
      },
    ],
    'etude-complete': [
      {
        id: r`deg(N) < deg(D)`,
        enonce: r`Pour une fonction rationnelle $f(x) = \dfrac{N(x)}{D(x)}$, quelle asymptote obtient-on en $\pm\infty$ selon les degrés de $N$ et de $D$ ?`,
        corrige: r`Degré de $N$ < degré de $D$ : AH $y = 0$ ; degrés égaux : AH $y = b$, $b$ rapport des coefficients dominants ; degré de $N$ = degré de $D$ $+ 1$ : asymptote oblique ; au-delà : aucune asymptote de cette forme.`,
      },
      {
        id: r`recoupement : $f(x)=ax+b$`,
        enonce: r`Comment cherche-t-on le point où la courbe de $f$ recoupe son asymptote oblique $y = ax + b$ ?`,
        corrige: r`On résout $f(x) = ax + b$ : c'est là où le reste de la division euclidienne s'annule.`,
      },
    ],
  },

  // ── Ch. 5 — Dérivées et applications ───────────────────────────────────────────────────────────
  'derivees-applications': {
    'definition-derivee': [
      {
        id: r`$f'(a) = \displaystyle\lim_{h \to 0} \dfrac{f(a+h)-f(a)}{h}$`,
        enonce: r`Donne la définition du nombre dérivé $f'(a)$ comme limite d'un taux d'accroissement.`,
        corrige: r`$f'(a) = \displaystyle\lim_{h \to 0} \dfrac{f(a+h)-f(a)}{h}$.`,
      },
    ],
    tangentes: [
      {
        id: r`$y = f(a) + f'(a)(x-a)$`,
        enonce: r`Donne l'équation de la tangente à la courbe de $f$ au point d'abscisse $a$. Quand cette tangente est-elle horizontale ?`,
        corrige: r`$y = f(a) + f'(a)(x-a)$ ; elle est horizontale si $f'(a) = 0$.`,
      },
      {
        id: r`$f(a+h) \approx f(a) + f'(a)\,h$`,
        enonce: r`Donne l'approximation affine de $f(a+h)$ pour $h$ petit.`,
        corrige: r`$f(a+h) \approx f(a) + f'(a)\,h$.`,
      },
      {
        id: r`$f(x) - t(x) = (x-a)^2 \cdot Q(x)$`,
        enonce: r`$f$ est une fonction polynomiale et $t$ sa tangente au point d'abscisse $a$. Quelle forme a $f(x) - t(x)$ ?`,
        corrige: r`$f(x) - t(x) = (x-a)^2 \cdot Q(x)$ : racine (au moins) double au point de contact ; une racine double de $Q$ donne un second point de tangence.`,
      },
      {
        id: r`$f'(a) = m$`,
        enonce: r`On cherche les points de la courbe de $f$ où la tangente a une pente $m$ donnée. Quelle équation résout-on ?`,
        corrige: r`$f'(a) = m$ : ses solutions sont les abscisses $a$ des points de contact ; la tangente y est $y = f(a) + m(x-a)$.`,
      },
      {
        id: r`$y_P = f(a) + f'(a)(x_P - a)$`,
        enonce: r`Une tangente à la courbe de $f$, au point d'abscisse $a$, passe par un point $P(x_P\,;y_P)$ hors de la courbe. Quelle équation vérifie $a$ ?`,
        corrige: r`$y_P = f(a) + f'(a)(x_P - a)$ : on remplace $x$ et $y$ par les coordonnées de $P$ dans l'équation de la tangente, puis on résout en $a$.`,
      },
    ],
    'fonction-derivee': [
      {
        id: r`$(x^n)' = n x^{n-1} \quad (\sqrt{x})' = \dfrac{1}{2\sqrt{x}} \quad \left(\frac{1}{x}\right)' = -\dfrac{1}{x^2}$`,
        enonce: r`Donne les dérivées de $x^n$, de $\sqrt{x}$ et de $\dfrac{1}{x}$.`,
        corrige: r`$(x^n)' = n x^{n-1}$, $(\sqrt{x})' = \dfrac{1}{2\sqrt{x}}$, $\left(\dfrac{1}{x}\right)' = -\dfrac{1}{x^2}$.`,
      },
      {
        id: r`$(\sin x)' = \cos x \quad (\cos x)' = -\sin x \quad (\tan x)' = \dfrac{1}{\cos^2 x}$`,
        enonce: r`Donne les dérivées de $\sin x$, de $\cos x$ et de $\tan x$.`,
        corrige: r`$(\sin x)' = \cos x$, $(\cos x)' = -\sin x$, $(\tan x)' = \dfrac{1}{\cos^2 x}$.`,
      },
      {
        id: r`$(u^n)' = n u^{n-1} u' \quad (\sqrt{u})' = \dfrac{u'}{2\sqrt{u}} \quad \left(\frac{1}{u}\right)' = -\dfrac{u'}{u^2}$`,
        enonce: r`Donne les dérivées de $u^n$, de $\sqrt{u}$ et de $\dfrac{1}{u}$, où $u$ est une fonction de $x$.`,
        corrige: r`$(u^n)' = n u^{n-1} u'$, $(\sqrt{u})' = \dfrac{u'}{2\sqrt{u}}$, $\left(\dfrac{1}{u}\right)' = -\dfrac{u'}{u^2}$.`,
      },
      {
        id: r`$(uv)' = u'v+uv'$`,
        enonce: r`Donne la dérivée d'un produit $uv$ et celle d'un quotient $\dfrac{u}{v}$.`,
        corrige: r`$(uv)' = u'v+uv'$ et $\left(\dfrac{u}{v}\right)' = \dfrac{u'v-uv'}{v^2}$.`,
      },
      {
        id: r`$f(x)=g(u(x)) \Rightarrow f'(x) = u'(x) \cdot g'(u(x))$`,
        enonce: r`Si $f(x) = g(u(x))$, que vaut $f'(x)$ ?`,
        corrige: r`$f'(x) = u'(x) \cdot g'(u(x))$ (règle de la chaîne).`,
      },
      {
        id: r`unité de $f'(a)$`,
        enonce: r`Une température $T(t)$ est mesurée en °C, le temps $t$ en heures. Dans quelle unité s'exprime le taux de variation instantané $T'(a)$, et que dit son signe ?`,
        corrige: r`En °C/h : unité de $T$ par unité de $t$. Si $T'(a) > 0$, la température augmente à l'instant $a$ ; si $T'(a) < 0$, elle diminue.`,
      },
    ],
    'signe-derivees': [
      {
        id: r`$f'(x) > 0$`,
        enonce: r`Que peut-on dire de $f$ sur un intervalle où $f'(x) > 0$ ? Où $f'(x) < 0$ ? Où $f''(x) > 0$ ? Où $f''(x) < 0$ ?`,
        corrige: r`$f' > 0$ : $f$ croissante ; $f' < 0$ : $f$ décroissante ; $f'' > 0$ : $f$ convexe (« bol », $\cup$) ; $f'' < 0$ : $f$ concave (« dôme », $\cap$).`,
      },
    ],
    'etude-locale': [
      {
        id: r`$f'(a) = 0$ et f' change de signe`,
        enonce: r`À quelle condition $f$ a-t-elle un extremum local en $a$ ? Et un point d'inflexion en $a$ ?`,
        corrige: r`Extremum local : $f'(a) = 0$ et $f'$ change de signe en $a$. Point d'inflexion : $f''(a) = 0$ et $f''$ change de signe en $a$.`,
      },
      {
        id: r`conditions sur $ax^3+bx^2+cx+d$`,
        enonce: r`On cherche $f(x) = ax^3+bx^2+cx+d$. Quelle équation traduit chaque condition : la courbe passe par $(x_0\,;y_0)$ ; la tangente en $x_0$ a la pente $m$ ; la tangente en $x_0$ est horizontale ; la courbe a un point d'inflexion en $x_1$ ?`,
        corrige: r`$f(x_0) = y_0$ ; $f'(x_0) = m$ ; $f'(x_0) = 0$ ; $f''(x_1) = 0$, avec $f'(x) = 3ax^2+2bx+c$ et $f''(x) = 6ax+2b$.`,
      },
    ],
    'optimisation-geometrique': [
      {
        id: r`$AM^2 = (x-x_A)^2 + (f(x)-y_A)^2$`,
        enonce: r`$M(x\,;f(x))$ est un point de la courbe de $f$ et $A(x_A\,;y_A)$ un point fixe. Comment exprime-t-on la distance $AM$, et quelle fonction minimise-t-on pour trouver le point le plus proche ?`,
        corrige: r`$AM^2 = (x-x_A)^2 + (f(x)-y_A)^2$ (Pythagore) ; on minimise $D(x) = AM^2$, qui a le même point optimal que $AM$, puis on prend la racine.`,
      },
      {
        id: r`$t = \dfrac{d}{v}$`,
        enonce: r`Quel temps faut-il pour parcourir une distance $d$ à vitesse constante $v$ ? Et pour un trajet en deux portions, à deux vitesses différentes ?`,
        corrige: r`$t = \dfrac{d}{v}$ ; sur un trajet en deux portions, on additionne les deux temps : $t = \dfrac{d_1}{v_1} + \dfrac{d_2}{v_2}$.`,
      },
    ],
    'contexte-economique': [
      {
        id: r`$C'(q) \approx C(q+1) - C(q)$`,
        enonce: r`Que représente $C'(q)$ pour une fonction de coût $C$ ? Comment calcule-t-on l'écart en pourcentage entre $C'(q)$ et $C(q+1) - C(q)$ ?`,
        corrige: r`Le coût marginal : $C'(q) \approx C(q+1) - C(q)$ ; $\text{écart} = \dfrac{|C(q+1)-C(q)-C'(q)|}{|C'(q)|} \times 100\,\%$.`,
      },
      {
        id: r`$R'(x) = C'(x)$`,
        enonce: r`$R$ est la recette et $C$ le coût de production de $x$ unités. Quelle égalité vérifie la production qui rend le bénéfice maximal ?`,
        corrige: r`$R'(x) = C'(x)$ : recette marginale $=$ coût marginal (car $B'(x) = R'(x) - C'(x) = 0$).`,
      },
      {
        id: r`$C_M(q) = \dfrac{C(q)}{q}$`,
        enonce: r`Donne le coût moyen $C_M(q)$. Quand est-il minimal ?`,
        corrige: r`$C_M(q) = \dfrac{C(q)}{q}$ ; il est minimal quand $C'(q) = C_M(q)$.`,
      },
    ],
    'vitesse-position': [
      {
        id: r`$v(t) = s'(t) \quad a(t) = v'(t) = s''(t)$`,
        enonce: r`La position $s(t)$ décrit un mouvement en ligne droite. Exprime la vitesse $v(t)$ et l'accélération $a(t)$ à l'aide de $s$. Comment convertit-on une vitesse de m/s en km/h ?`,
        corrige: r`$v(t) = s'(t)$ et $a(t) = v'(t) = s''(t)$ ; $1$ m/s $= 3{,}6$ km/h (on multiplie par $3{,}6$).`,
      },
      {
        id: r`$d = \dfrac{v_0^2}{2a}$`,
        enonce: r`Une voiture roule à la vitesse $v_0$ (en m/s) quand elle freine, avec une décélération constante $a$ (en m/s²). Quelle est sa distance de freinage ? Que devient-elle si la vitesse double ?`,
        corrige: r`$d = \dfrac{v_0^2}{2a}$ : elle est proportionnelle au carré de la vitesse, donc multipliée par 4 si la vitesse double.`,
      },
    ],
  },

  // ── Ch. 6 — Statistique à deux variables ───────────────────────────────────────────────────────
  'statistique-deux-variables': {
    'nuage-point-moyen': [
      {
        id: r`$G(\bar{x}\,;\bar{y})$`,
        enonce: r`Donne les coordonnées du point moyen $G$ d'un nuage de $n$ points $(x_i\,;y_i)$.`,
        corrige: r`$G(\bar{x}\,;\bar{y})$, avec $\bar{x} = \dfrac{1}{n}\sum x_i$ et $\bar{y} = \dfrac{1}{n}\sum y_i$ (des moyennes, jamais des médianes).`,
      },
      {
        id: r`$\sum x_i = n\,\bar{x}$`,
        enonce: r`On connaît le point moyen $G(\bar{x}\,;\bar{y})$ d'une série de $n$ couples dont une abscisse est effacée. Quelle relation permet de la retrouver ?`,
        corrige: r`$\sum x_i = n\,\bar{x}$ : la valeur manquante vaut $n\,\bar{x}$ moins la somme des abscisses connues (de même pour les ordonnées).`,
      },
    ],
    ajustement: [
      {
        id: r`interpolation : $x$ dans l'intervalle des données ; extrapolation : en dehors`,
        enonce: r`Quand parle-t-on d'interpolation, et quand d'extrapolation ? Laquelle demande de la prudence ?`,
        corrige: r`Interpolation : on estime pour une valeur de $x$ dans l'intervalle des données ; extrapolation : en dehors. L'extrapolation demande de la prudence, d'autant plus qu'on s'éloigne des données.`,
      },
      {
        id: r`nuage aligné : affine ; en arc : second degré ; qui décolle : exponentielle`,
        enonce: r`Quel type d'ajustement envisage-t-on pour un nuage à peu près aligné ? En arc ? Qui « décolle » de plus en plus vite ?`,
        corrige: r`Aligné : ajustement affine (une droite $y = ax + b$) ; en arc : fonction du second degré ; qui décolle : fonction exponentielle.`,
      },
    ],
    mayer: [
      {
        id: r`droite de Mayer : $(G_1G_2)$`,
        enonce: r`Décris la méthode de Mayer pour obtenir une droite d'ajustement.`,
        corrige: r`Trier les données selon les $x_i$, les partager en deux groupes d'effectifs égaux (à une unité près), calculer les points moyens $G_1$ et $G_2$ des groupes : la droite de Mayer est $(G_1G_2)$.`,
      },
      {
        id: r`$a = \dfrac{\bar{y}_2 - \bar{y}_1}{\bar{x}_2 - \bar{x}_1}$`,
        enonce: r`Donne la pente de la droite de Mayer à partir de $G_1(\bar{x}_1\,;\bar{y}_1)$ et $G_2(\bar{x}_2\,;\bar{y}_2)$. Comment obtient-on ensuite $b$ ?`,
        corrige: r`$a = \dfrac{\bar{y}_2 - \bar{y}_1}{\bar{x}_2 - \bar{x}_1}$ ; puis $\bar{y}_1 = a\bar{x}_1 + b$ donne $b$ (avec la pente non arrondie).`,
      },
      {
        id: r`la droite de Mayer passe par $G$`,
        enonce: r`Par quel point remarquable passe toujours la droite de Mayer ? Est-ce le milieu de $[G_1G_2]$ ?`,
        corrige: r`Par le point moyen $G(\bar{x}\,;\bar{y})$ du nuage ; c'est le milieu de $[G_1G_2]$ seulement si les deux groupes ont le même effectif.`,
      },
    ],
    'moindres-carres': [
      {
        id: r`$S = \sum \big(y_i - (ax_i + b)\big)^2$ minimale`,
        enonce: r`Quelle quantité la droite des moindres carrés rend-elle minimale ?`,
        corrige: r`La somme des carrés des écarts verticaux $S = \sum \big(y_i - (ax_i + b)\big)^2$.`,
      },
      {
        id: r`$a = \dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2}$`,
        enonce: r`Donne la formule de la pente $a$ de la droite des moindres carrés (coefficient de régression).`,
        corrige: r`$a = \dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2}$.`,
      },
      {
        id: r`$y - \bar{y} = a(x - \bar{x})$, $b = \bar{y} - a\bar{x}$`,
        enonce: r`Donne l'équation de la droite des moindres carrés à l'aide de sa pente $a$ et du point moyen. Que vaut $b$ ?`,
        corrige: r`$y - \bar{y} = a(x - \bar{x})$ : elle passe par $G$, donc $b = \bar{y} - a\bar{x}$.`,
      },
      {
        id: r`$\sigma_x$ divise par $n$, $S_x$ par $n - 1$`,
        enonce: r`La calculatrice affiche $S_x$ et $\sigma_x$. Lequel utilise-t-on dans ce cours, et pourquoi ?`,
        corrige: r`$\sigma_x$, qui divise par $n$ (comme en 4e) ; $S_x$ divise par $n - 1$.`,
      },
    ],
    correlation: [
      {
        id: r`$V(x) = \dfrac{1}{n}\sum (x_i-\bar{x})^2 = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2$`,
        enonce: r`Donne les deux formules de la variance $V(x)$ et le lien avec l'écart-type $\sigma_x$.`,
        corrige: r`$V(x) = \dfrac{1}{n}\sum (x_i-\bar{x})^2 = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2$ et $\sigma_x = \sqrt{V(x)}$.`,
      },
      {
        id: r`$\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$`,
        enonce: r`Donne les deux formules de la covariance $\operatorname{Cov}(x,y)$. Que dit son signe ?`,
        corrige: r`$\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum (x_i-\bar{x})(y_i-\bar{y}) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$ ; positive : $x$ et $y$ varient dans le même sens ; négative : en sens contraire.`,
      },
      {
        id: r`$r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$`,
        enonce: r`Donne la formule du coefficient de corrélation linéaire $r$. Entre quelles valeurs est-il compris ? Quand vaut-il $\pm 1$ ?`,
        corrige: r`$r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$, compris entre $-1$ et $1$ ; $r = \pm 1$ exactement quand les points sont alignés.`,
      },
      {
        id: r`$a = \dfrac{\operatorname{Cov}(x,y)}{V(x)}$`,
        enonce: r`Exprime la pente $a$ de la droite des moindres carrés à l'aide de la covariance. Qu'en déduit-on pour le signe de $a$, de $\operatorname{Cov}(x,y)$ et de $r$ ?`,
        corrige: r`$a = \dfrac{\operatorname{Cov}(x,y)}{V(x)}$ : $a$, la covariance et $r$ ont toujours le même signe.`,
      },
      {
        id: r`$|r| = \sqrt{R^2}$`,
        enonce: r`Un tableur affiche le coefficient de détermination $R^2$ d'un ajustement affine. Comment retrouve-t-on $r$ ?`,
        corrige: r`$|r| = \sqrt{R^2}$ ; le signe de $r$ est celui de la pente (nuage qui monte ou qui descend).`,
      },
      {
        id: r`seuils : $0{,}35$ ; $0{,}60$ ; $0{,}80$ ; $0{,}98$`,
        enonce: r`Donne le tableau d'interprétation de $|r|$ : corrélation nulle, faible, moyenne, forte, très forte, parfaite.`,
        corrige: r`Nulle : $|r| < 0{,}35$ ; faible : $0{,}35 \le |r| < 0{,}60$ ; moyenne : $0{,}60 \le |r| < 0{,}80$ ; forte : $0{,}80 \le |r| < 0{,}98$ ; très forte : $0{,}98 \le |r| < 1$ ; parfaite : $|r| = 1$.`,
      },
      {
        id: r`$x' = kx + c$ ($k > 0$) : $r$ inchangé`,
        enonce: r`On change d'unité ou d'origine : $x'_i = kx_i + c$ avec $k > 0$. Que deviennent le coefficient de corrélation et la pente de la droite ?`,
        corrige: r`$r$ ne change pas ; la pente, elle, change (elle est divisée par $k$). Si $k < 0$, $r$ change de signe.`,
      },
    ],
    interpreter: [
      {
        id: r`prévision fiable : $|r|$ proche de $1$, interpolation, même contexte`,
        enonce: r`À quelles trois conditions une prévision faite avec une droite d'ajustement est-elle raisonnable ?`,
        corrige: r`$|r|$ proche de $1$ (nuage à peu près aligné) ; interpolation plutôt qu'extrapolation ; un contexte qui reste celui des données.`,
      },
      {
        id: r`corrélation ≠ causalité : cause commune, coïncidence, causalité inverse, effet décalé`,
        enonce: r`Une forte corrélation ne prouve pas une causalité. Cite les quatre explications possibles d'une corrélation sans causalité directe.`,
        corrige: r`Une cause commune (troisième variable), une coïncidence, une causalité dans l'autre sens, ou un effet décalé dans le temps.`,
      },
    ],
  },
}
