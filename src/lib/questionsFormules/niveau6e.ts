import type { BanqueFormules } from './types'

const r = String.raw

/** Questions « Formule » de 6e (6 h) — voir `types.ts`. */
export const FORMULES_6E: BanqueFormules = {
  // ── Ch. 1 — Fonctions réciproques & cyclométriques ─────────────────────────────────────────────
  'fonctions-reciproques-cyclometriques': {
    reciproques: [
      {
        id: r`$f^{-1}(f(x)) = x$ et $f(f^{-1}(y)) = y$`,
        enonce: r`Si $f$ est injective, que valent $f^{-1}(f(x))$ et $f(f^{-1}(y))$ ?`,
        corrige: r`$f^{-1}(f(x)) = x$ pour tout $x \in \text{dom}(f)$, et $f(f^{-1}(y)) = y$ pour tout $y \in \text{Im}(f)$.`,
      },
      {
        id: r`$\text{dom}(f^{-1}) = \text{Im}(f) \quad \text{Im}(f^{-1}) = \text{dom}(f)$`,
        enonce: r`Exprime le domaine et l'image de $f^{-1}$ à l'aide du domaine et de l'image de $f$.`,
        corrige: r`$\text{dom}(f^{-1}) = \text{Im}(f)$ et $\text{Im}(f^{-1}) = \text{dom}(f)$.`,
      },
      {
        id: r`$(a ; b) \in$ graphe de $f \iff (b ; a) \in$ graphe de $f^{-1}$`,
        enonce: r`Quelle propriété relie le graphe de $f$ et celui de $f^{-1}$ ? Que devient un point $(a\,;b)$ du graphe de $f$ ?`,
        corrige: r`Les deux graphes sont symétriques par rapport à la droite $y = x$ : $(a\,;b) \in$ graphe de $f \iff (b\,;a) \in$ graphe de $f^{-1}$.`,
      },
      {
        id: r`$f(x) = \dfrac{ax+b}{cx+d} \implies f^{-1}(x) = \dfrac{-dx+b}{cx-a}$`,
        enonce: r`Si $f(x)=\dfrac{ax+b}{cx+d}$ avec $ad-bc\neq0$, donne l'expression de $f^{-1}(x)$.`,
        corrige: r`$f^{-1}(x) = \dfrac{-dx+b}{cx-a}$.`,
      },
      {
        id: r`$(f^{-1})'(x) = \dfrac{1}{f'(f^{-1}(x))}$`,
        enonce: r`Si $f$ est continue et strictement monotone sur un intervalle, donne l'expression de $(f^{-1})'(x)$ et la condition à vérifier.`,
        corrige: r`$(f^{-1})'(x) = \dfrac{1}{f'(f^{-1}(x))}$, à condition que $f'(f^{-1}(x)) \neq 0$.`,
      },
      {
        id: r`$(f^{-1})'(f(a)) = \dfrac{1}{f'(a)}$`,
        enonce: r`Si $f$ est continue et strictement monotone sur un intervalle, exprime $(f^{-1})'(f(a))$ à l'aide de $f'(a)$, et donne la condition à vérifier.`,
        corrige: r`$(f^{-1})'(f(a)) = \dfrac{1}{f'(a)}$, à condition que $f'(a) \neq 0$.`,
      },
    ],
    cyclometriques: [
      {
        id: r`sin sur $[-\pi/2;\pi/2]$ $\to$ arcsin`,
        enonce: r`Sur quel intervalle restreint-on la fonction $\sin$ pour définir $\arcsin$ ? Donne le domaine et l'image de $\arcsin$.`,
        corrige: r`$\sin$ est restreinte à $[-\pi/2\,;\pi/2]$ ; $\arcsin$ a pour domaine $[-1\,;1]$ et pour image $[-\pi/2\,;\pi/2]$.`,
      },
      {
        id: r`cos sur $[0;\pi]$ $\to$ arccos`,
        enonce: r`Sur quel intervalle restreint-on la fonction $\cos$ pour définir $\arccos$ ? Donne le domaine et l'image de $\arccos$.`,
        corrige: r`$\cos$ est restreinte à $[0\,;\pi]$ ; $\arccos$ a pour domaine $[-1\,;1]$ et pour image $[0\,;\pi]$.`,
      },
      {
        id: r`tan sur $]-\pi/2;\pi/2[$ $\to$ arctan`,
        enonce: r`Sur quel intervalle restreint-on la fonction $\tan$ pour définir $\arctan$ ? Donne le domaine et l'image de $\arctan$.`,
        corrige: r`$\tan$ est restreinte à $]{-\pi/2}\,;\pi/2[$ ; $\arctan$ a pour domaine $\mathbb{R}$ et pour image $]{-\pi/2}\,;\pi/2[$.`,
      },
      {
        id: r`$y = \arcsin(x) \iff \sin(y) = x$ et $y \in [-\pi/2 ; \pi/2]$`,
        enonce: r`Pour $x \in [-1\,;1]$, complète la caractérisation : $y = \arcsin(x) \iff \ldots$`,
        corrige: r`$y = \arcsin(x) \iff \sin(y) = x$ et $y \in [-\pi/2\,;\pi/2]$.`,
      },
      {
        id: r`$y = \arccos(x) \iff \cos(y) = x$ et $y \in [0 ; \pi]$`,
        enonce: r`Complète les caractérisations : $y = \arccos(x) \iff \ldots$ (pour $x \in [-1\,;1]$) et $y = \arctan(x) \iff \ldots$ (pour $x \in \mathbb{R}$).`,
        corrige: r`$y = \arccos(x) \iff \cos(y) = x$ et $y \in [0\,;\pi]$ ; $y = \arctan(x) \iff \tan(y) = x$ et $y \in\, ]{-\pi/2}\,;\pi/2[$.`,
      },
      {
        id: r`$\displaystyle\lim_{x \to -\infty} \arctan(x) = -\dfrac{\pi}{2} \quad \displaystyle\lim_{x \to +\infty} \arctan(x) = \dfrac{\pi}{2}$`,
        enonce: r`Donne les limites de $\arctan(x)$ en $-\infty$ et en $+\infty$, et les asymptotes du graphe qui s'en déduisent.`,
        corrige: r`$\displaystyle\lim_{x \to -\infty} \arctan(x) = -\dfrac{\pi}{2}$ et $\displaystyle\lim_{x \to +\infty} \arctan(x) = \dfrac{\pi}{2}$ : asymptotes horizontales $y = -\dfrac{\pi}{2}$ et $y = \dfrac{\pi}{2}$.`,
      },
      {
        id: r`$\arcsin(-x) = -\arcsin(x) \quad \arctan(-x) = -\arctan(x)$`,
        enonce: r`Exprime $\arcsin(-x)$, $\arctan(-x)$ et $\arccos(-x)$ en fonction de $\arcsin(x)$, $\arctan(x)$ et $\arccos(x)$.`,
        corrige: r`$\arcsin(-x) = -\arcsin(x)$ et $\arctan(-x) = -\arctan(x)$ (fonctions impaires) ; $\arccos(-x) = \pi - \arccos(x)$ pour $x \in [-1\,;1]$.`,
      },
      {
        id: r`$\arcsin\dfrac{1}{2} = \dfrac{\pi}{6} \quad \arcsin\dfrac{\sqrt{2}}{2} = \dfrac{\pi}{4} \quad \arcsin\dfrac{\sqrt{3}}{2} = \dfrac{\pi}{3}$`,
        enonce: r`Donne les valeurs exactes de $\arcsin\dfrac{1}{2}$, $\arcsin\dfrac{\sqrt{2}}{2}$ et $\arcsin\dfrac{\sqrt{3}}{2}$.`,
        corrige: r`$\arcsin\dfrac{1}{2} = \dfrac{\pi}{6}$, $\arcsin\dfrac{\sqrt{2}}{2} = \dfrac{\pi}{4}$, $\arcsin\dfrac{\sqrt{3}}{2} = \dfrac{\pi}{3}$.`,
      },
      {
        id: r`$\arccos\dfrac{1}{2} = \dfrac{\pi}{3} \quad \arccos\left(-\dfrac{1}{2}\right) = \dfrac{2\pi}{3} \quad \arccos(-1) = \pi$`,
        enonce: r`Donne les valeurs exactes de $\arccos\dfrac{1}{2}$, $\arccos\left(-\dfrac{1}{2}\right)$ et $\arccos(-1)$.`,
        corrige: r`$\arccos\dfrac{1}{2} = \dfrac{\pi}{3}$, $\arccos\left(-\dfrac{1}{2}\right) = \dfrac{2\pi}{3}$, $\arccos(-1) = \pi$.`,
      },
      {
        id: r`$\arctan 1 = \dfrac{\pi}{4} \quad \arctan \sqrt{3} = \dfrac{\pi}{3} \quad \arctan\dfrac{\sqrt{3}}{3} = \dfrac{\pi}{6}$`,
        enonce: r`Donne les valeurs exactes de $\arctan 1$, $\arctan\sqrt{3}$ et $\arctan\dfrac{\sqrt{3}}{3}$.`,
        corrige: r`$\arctan 1 = \dfrac{\pi}{4}$, $\arctan\sqrt{3} = \dfrac{\pi}{3}$, $\arctan\dfrac{\sqrt{3}}{3} = \dfrac{\pi}{6}$.`,
      },
      {
        id: r`$\sin(\arcsin x) = x \quad \cos(\arccos x) = x$`,
        enonce: r`Simplifie $\sin(\arcsin x)$, $\cos(\arccos x)$ et $\tan(\arctan x)$, en précisant pour quels $x$ chaque égalité est valable.`,
        corrige: r`$\sin(\arcsin x) = x$ et $\cos(\arccos x) = x$ pour tout $x \in [-1\,;1]$ ; $\tan(\arctan x) = x$ pour tout $x \in \mathbb{R}$.`,
      },
      {
        id: r`$\arcsin(\sin\theta) = \theta$`,
        enonce: r`À quelle condition sur $\theta$ a-t-on $\arcsin(\sin\theta) = \theta$ ? Même question pour $\arccos(\cos\theta) = \theta$ et pour $\arctan(\tan\theta) = \theta$.`,
        corrige: r`$\arcsin(\sin\theta) = \theta$ seulement si $\theta \in [-\pi/2\,;\pi/2]$ ; $\arccos(\cos\theta) = \theta$ seulement si $\theta \in [0\,;\pi]$ ; $\arctan(\tan\theta) = \theta$ seulement si $\theta \in\, ]{-\pi/2}\,;\pi/2[$.`,
      },
      {
        id: r`$\cos(\arcsin x) = \sqrt{1-x^2} \quad \sin(\arccos x) = \sqrt{1-x^2}$`,
        enonce: r`Pour $x \in [-1\,;1]$, exprime $\cos(\arcsin x)$ et $\sin(\arccos x)$ en fonction de $x$, sans fonction trigonométrique.`,
        corrige: r`$\cos(\arcsin x) = \sqrt{1-x^2}$ et $\sin(\arccos x) = \sqrt{1-x^2}$.`,
      },
      {
        id: r`$\tan(\arcsin x) = \dfrac{x}{\sqrt{1-x^2}}$`,
        enonce: r`Exprime $\tan(\arcsin x)$ et $\tan(\arccos x)$ en fonction de $x$, en précisant pour quels $x$.`,
        corrige: r`$\tan(\arcsin x) = \dfrac{x}{\sqrt{1-x^2}}$ pour $x \in\, ]{-1}\,;1[$ ; $\tan(\arccos x) = \dfrac{\sqrt{1-x^2}}{x}$ pour $x \in [-1\,;1]$, $x \neq 0$.`,
      },
      {
        id: r`$\cos(\arctan x) = \dfrac{1}{\sqrt{1+x^2}} \quad \sin(\arctan x) = \dfrac{x}{\sqrt{1+x^2}}$`,
        enonce: r`Pour tout réel $x$, exprime $\cos(\arctan x)$ et $\sin(\arctan x)$ en fonction de $x$.`,
        corrige: r`$\cos(\arctan x) = \dfrac{1}{\sqrt{1+x^2}}$ et $\sin(\arctan x) = \dfrac{x}{\sqrt{1+x^2}}$.`,
      },
    ],
    equations: [
      {
        id: r`arcsin($u$), arccos($u$) existent`,
        enonce: r`Pour quelles valeurs de $u$ les expressions $\arcsin(u)$, $\arccos(u)$ et $\arctan(u)$ existent-elles ?`,
        corrige: r`$\arcsin(u)$ et $\arccos(u)$ existent si et seulement si $u \in [-1\,;1]$ ; $\arctan(u)$ existe pour tout $u \in \mathbb{R}$.`,
      },
      {
        id: r`$\arcsin(u) + \arccos(u) = \pi/2$`,
        enonce: r`Complète, pour tout $u \in [-1\,;1]$ : $\arcsin(u) + \arccos(u) = \ldots$`,
        corrige: r`$\arcsin(u) + \arccos(u) = \dfrac{\pi}{2}$.`,
      },
      {
        id: r`$\arcsin(A)=\arcsin(B) \iff A=B$`,
        enonce: r`Que peut-on dire de $A$ et $B$ si $\arcsin(A) = \arcsin(B)$ ? Même question avec $\arccos$ et avec $\arctan$. Quelle condition faut-il vérifier dans chaque cas ?`,
        corrige: r`Dans les trois cas, $A = B$ (les arcfonctions sont injectives). Pour $\arcsin$ et $\arccos$, $A$ et $B$ doivent respecter la CE ($A, B \in [-1\,;1]$) ; pour $\arctan$, aucune condition.`,
      },
      {
        id: r`$\arcsin(u) = \alpha \iff u = \sin(\alpha)$`,
        enonce: r`Soit $\alpha$ un réel donné. Quand l'équation $\arcsin(u) = \alpha$ a-t-elle une solution, et laquelle ?`,
        corrige: r`Si $\alpha \in [-\pi/2\,;\pi/2]$ : $\arcsin(u) = \alpha \iff u = \sin(\alpha)$. Sinon, aucune solution ($\alpha$ n'est pas dans l'image de $\arcsin$).`,
      },
      {
        id: r`$\arcsin(A) = \arccos(B) \implies A \ge 0$ et $B \ge 0$`,
        enonce: r`Si $\arcsin(A) = \arccos(B)$, quel est le signe de $A$ et celui de $B$ ? Justifie.`,
        corrige: r`$A \ge 0$ et $B \ge 0$ : la valeur commune est dans les deux images, $[-\pi/2\,;\pi/2] \cap [0\,;\pi] = [0\,;\pi/2]$, où $\sin$ et $\cos$ sont positifs.`,
      },
    ],
    derivees: [
      {
        id: r`$(\arcsin u)' = \dfrac{u'}{\sqrt{1-u^2}}$`,
        enonce: r`Donne la dérivée de $\arcsin u$ et celle de $\arccos u$, où $u$ est une fonction dérivable. Où ces formules sont-elles valables ?`,
        corrige: r`$(\arcsin u)' = \dfrac{u'}{\sqrt{1-u^2}}$ et $(\arccos u)' = -\dfrac{u'}{\sqrt{1-u^2}}$, là où $u \in\, ]{-1}\,;1[$.`,
      },
      {
        id: r`$(\arctan u)' = \dfrac{u'}{1+u^2}$`,
        enonce: r`Donne la dérivée de $\arctan u$, où $u$ est une fonction dérivable.`,
        corrige: r`$(\arctan u)' = \dfrac{u'}{1+u^2}$, partout où $u$ est dérivable.`,
      },
      {
        id: r`$\arctan(x) + \arctan\left(\dfrac{1}{x}\right) = \dfrac{\pi}{2}$`,
        enonce: r`Pour $x > 0$, que vaut $\arctan(x) + \arctan\left(\dfrac{1}{x}\right)$ ?`,
        corrige: r`$\arctan(x) + \arctan\left(\dfrac{1}{x}\right) = \dfrac{\pi}{2}$ pour tout $x > 0$.`,
      },
    ],
    graphiques: [
      {
        id: r`dom de $c + k\arcsin(mx+n)$ : $-1 \le mx + n \le 1$`,
        enonce: r`Comment détermine-t-on le domaine de $f(x) = c + k\arcsin(mx+n)$ ? Et celui de $g(x) = c + k\arctan(mx+n)$ ?`,
        corrige: r`$\text{dom}(f)$ : on résout $-1 \le mx + n \le 1$ (de même pour $\arccos$) ; $\text{dom}(g) = \mathbb{R}$.`,
      },
      {
        id: r`image de $c + k\arcsin(mx+n)$ : $\left[c - |k|\dfrac{\pi}{2} ; c + |k|\dfrac{\pi}{2}\right]$`,
        enonce: r`Donne l'image de $f(x) = c + k\arcsin(mx+n)$.`,
        corrige: r`$\text{Im}(f) = \left[c - |k|\dfrac{\pi}{2}\,;c + |k|\dfrac{\pi}{2}\right]$ (image de $\arcsin$ multipliée par $k$, puis décalée de $c$).`,
      },
      {
        id: r`asymptotes de $c + k\arctan(mx+n)$ : $y = c \pm k\dfrac{\pi}{2}$`,
        enonce: r`Donne les asymptotes horizontales du graphe de $f(x) = c + k\arctan(mx+n)$.`,
        corrige: r`$y = c - k\dfrac{\pi}{2}$ et $y = c + k\dfrac{\pi}{2}$.`,
      },
      {
        id: r`centre de symétrie de $c + k\arcsin(mx+n)$ : $\left(-\dfrac{n}{m} ; c\right)$`,
        enonce: r`Donne le centre de symétrie du graphe de $f(x) = c + k\arcsin(mx+n)$ (c'est le même pour $c + k\arctan(mx+n)$).`,
        corrige: r`Le point $\left(-\dfrac{n}{m}\,;c\right)$.`,
      },
    ],
    etude: [
      {
        id: r`asymptote oblique $y = ax + b$ : $a = \displaystyle\lim_{x \to \infty} \dfrac{f(x)}{x}$, $b = \displaystyle\lim_{x \to \infty} \big(f(x) - ax\big)$`,
        enonce: r`Comment calcule-t-on les coefficients $a$ et $b$ d'une asymptote oblique $y = ax + b$ du graphe de $f$ en $+\infty$ (ou en $-\infty$) ?`,
        corrige: r`$a = \displaystyle\lim_{x \to \infty} \dfrac{f(x)}{x}$ (réel non nul), puis $b = \displaystyle\lim_{x \to \infty} \big(f(x) - ax\big)$ (réel).`,
      },
    ],
  },

  // ── Ch. 2 — Fonctions exponentielles ───────────────────────────────────────────────────────────
  'fonctions-exponentielles': {
    limites: [
      {
        id: r`$a^r \cdot a^s = a^{r+s} \qquad \dfrac{a^r}{a^s} = a^{r-s}$`,
        enonce: r`Pour $a > 0$ et $r$, $s$ réels, complète : $a^r \cdot a^s = \ldots$, $\dfrac{a^r}{a^s} = \ldots$ et $(a^r)^s = \ldots$`,
        corrige: r`$a^r \cdot a^s = a^{r+s}$, $\dfrac{a^r}{a^s} = a^{r-s}$, $(a^r)^s = a^{r \cdot s}$.`,
      },
      {
        id: r`$\displaystyle\lim_{x \to -\infty} a^x = 0 \qquad \displaystyle\lim_{x \to +\infty} a^x = +\infty$`,
        enonce: r`Donne les limites de $a^x$ en $-\infty$ et en $+\infty$, d'abord si $a > 1$, puis si $0 < a < 1$.`,
        corrige: [
          r`Si $a > 1$ : $\displaystyle\lim_{x \to -\infty} a^x = 0$ et $\displaystyle\lim_{x \to +\infty} a^x = +\infty$.`,
          r`Si $0 < a < 1$ : $\displaystyle\lim_{x \to -\infty} a^x = +\infty$ et $\displaystyle\lim_{x \to +\infty} a^x = 0$.`,
        ],
      },
      {
        id: r`$\displaystyle\lim_{x \to +\infty} \dfrac{x^n}{a^x} = 0$`,
        enonce: r`Pour $a > 1$ et $n$ entier, donne $\displaystyle\lim_{x \to +\infty} \dfrac{x^n}{a^x}$ et $\displaystyle\lim_{x \to -\infty} x^n \cdot a^x$.`,
        corrige: r`Les deux limites valent $0$ : l'exponentielle domine toute puissance de $x$.`,
      },
      {
        id: r`$\displaystyle\lim_{x \to 0} \dfrac{e^x - 1}{x} = 1$`,
        enonce: r`Que vaut $\displaystyle\lim_{x \to 0} \dfrac{e^x - 1}{x}$ ? Et, pour $a > 0$, $\displaystyle\lim_{x \to 0} \dfrac{a^x - 1}{x}$ ?`,
        corrige: r`$\displaystyle\lim_{x \to 0} \dfrac{e^x - 1}{x} = 1$ et $\displaystyle\lim_{x \to 0} \dfrac{a^x - 1}{x} = \ln(a)$ (nombre dérivé de $a^x$ en $0$).`,
      },
    ],
    derivee: [
      {
        id: r`$e = \displaystyle\lim_{x \to +\infty} \left(1+\dfrac{1}{x}\right)^x \approx 2{,}718$`,
        enonce: r`Donne la définition du nombre $e$ par une limite, et sa valeur approchée au millième.`,
        corrige: r`$e = \displaystyle\lim_{x \to +\infty} \left(1+\dfrac{1}{x}\right)^x \approx 2{,}718$.`,
      },
      {
        id: r`$\displaystyle\lim_{x \to +\infty} \left(1+\dfrac{k}{x}\right)^{mx} = e^{km}$`,
        enonce: r`Pour $k$ et $m$ réels, que vaut $\displaystyle\lim_{x \to +\infty} \left(1+\dfrac{k}{x}\right)^{mx}$ ?`,
        corrige: r`$\displaystyle\lim_{x \to +\infty} \left(1+\dfrac{k}{x}\right)^{mx} = e^{km}$.`,
      },
      {
        id: r`$(a^x)' = \ln(a) \cdot a^x$`,
        enonce: r`Donne la dérivée de $a^x$ (avec $a > 0$) et celle de $e^x$.`,
        corrige: r`$(a^x)' = \ln(a) \cdot a^x$ et $(e^x)' = e^x$.`,
      },
      {
        id: r`$(a^{g(x)})' = g'(x) \cdot a^{g(x)} \cdot \ln(a)$`,
        enonce: r`Donne la dérivée de $a^{g(x)}$ et celle de $e^{u(x)}$, où $g$ et $u$ sont des fonctions dérivables.`,
        corrige: r`$(a^{g(x)})' = g'(x) \cdot a^{g(x)} \cdot \ln(a)$ et $(e^{u(x)})' = u'(x) \cdot e^{u(x)}$ (règle de la chaîne).`,
      },
      {
        id: r`$\ln(a) > 0$ si $a > 1 \qquad \ln(1) = 0 \qquad \ln(a) < 0$ si $0 < a < 1$`,
        enonce: r`Selon la valeur de $a > 0$, quel est le signe de $\ln(a)$ ? Qu'en déduis-tu pour les variations de la fonction $x \mapsto a^x$ ?`,
        corrige: r`$\ln(a) > 0$ si $a > 1$, $\ln(1) = 0$, $\ln(a) < 0$ si $0 < a < 1$ : $a^x$ est croissante si $a > 1$, décroissante si $0 < a < 1$.`,
      },
      {
        id: r`$\displaystyle\lim_{x \to a} \dfrac{f(x)}{g(x)} = \displaystyle\lim_{x \to a} \dfrac{f'(x)}{g'(x)}$`,
        enonce: r`Énonce la règle de L'Hôpital : par quoi peut-on remplacer $\displaystyle\lim_{x \to a} \dfrac{f(x)}{g(x)}$, et à quelles conditions ?`,
        corrige: r`$\displaystyle\lim_{x \to a} \dfrac{f(x)}{g(x)} = \displaystyle\lim_{x \to a} \dfrac{f'(x)}{g'(x)}$ si la forme est $\dfrac{0}{0}$ ou $\dfrac{\infty}{\infty}$, si $f$ et $g$ sont dérivables au voisinage de $a$ avec $g' \neq 0$, et si la limite de droite existe (aussi en $\pm\infty$).`,
      },
    ],
    graphique: [
      {
        id: r`$f' > 0$ : $f$ strictement croissante ; $f' < 0$ : $f$ strictement décroissante`,
        enonce: r`Que peut-on dire de $f$ sur un intervalle où $f' > 0$ ? Où $f' < 0$ ? Et en un point où $f'$ s'annule en changeant de signe ?`,
        corrige: r`$f' > 0$ : $f$ strictement croissante ; $f' < 0$ : $f$ strictement décroissante. Si $f'$ s'annule en changeant de signe, $f$ a un extremum : un maximum si $f'$ passe de $+$ à $-$, un minimum si elle passe de $-$ à $+$.`,
      },
      {
        id: r`$f$ paire $\Rightarrow f'$ impaire ; $f$ impaire $\Rightarrow f'$ paire`,
        enonce: r`Si $f$ est paire, quelle est la parité de $f'$ ? Et si $f$ est impaire ?`,
        corrige: r`$f$ paire $\Rightarrow$ $f'$ impaire ; $f$ impaire $\Rightarrow$ $f'$ paire.`,
      },
    ],
    equations: [
      {
        id: r`$a^x = a^y \iff x = y$`,
        enonce: r`Pour $a > 0$ et $a \neq 1$, complète : $a^x = a^y \iff \ldots$`,
        corrige: r`$a^x = a^y \iff x = y$.`,
      },
      {
        id: r`substitution $t = a^x$`,
        enonce: r`Quand on pose $t = a^x$ pour résoudre une équation, quelle condition doit vérifier $t$ ? Que fait-on d'une racine qui ne la vérifie pas ?`,
        corrige: r`$t = a^x > 0$ pour tout $x$ : on rejette toute racine $t \le 0$.`,
      },
    ],
    inequations: [
      {
        id: r`$a^x \le a^y \iff x \le y$`,
        enonce: r`Complète $a^x \le a^y \iff \ldots$, d'abord si $a > 1$, puis si $0 < a < 1$.`,
        corrige: r`Si $a > 1$ : $a^x \le a^y \iff x \le y$ (sens conservé). Si $0 < a < 1$ : $a^x \le a^y \iff x \ge y$ (sens inversé).`,
      },
    ],
    etude: [
      {
        id: r`$f'' > 0$ : $f$ convexe ; $f'' < 0$ : $f$ concave`,
        enonce: r`Que peut-on dire de $f$ là où $f'' > 0$ ? Là où $f'' < 0$ ? Et en un point où $f''$ change de signe ?`,
        corrige: r`$f'' > 0$ : $f$ convexe ; $f'' < 0$ : $f$ concave ; un changement de signe de $f''$ donne un point d'inflexion.`,
      },
      {
        id: r`$y = mx + p$ asymptote oblique en $+\infty$ si $\displaystyle\lim_{x \to +\infty} \left[f(x) - (mx + p)\right] = 0$`,
        enonce: r`À quelle condition la droite $y = mx + p$ est-elle asymptote oblique au graphe de $f$ en $+\infty$ ?`,
        corrige: r`Si $\displaystyle\lim_{x \to +\infty} \left[f(x) - (mx + p)\right] = 0$ (même définition en $-\infty$).`,
      },
    ],
    problemes: [
      {
        id: r`$Q(t) = Q_0 \cdot r^t$`,
        enonce: r`Une quantité vaut $Q_0$ au départ et augmente de $p$ % par période. Donne son modèle $Q(t)$. Que change une diminution de $p$ % par période ?`,
        corrige: r`$Q(t) = Q_0 \cdot r^t$ avec $r = 1 + \dfrac{p}{100}$ (croissance, $r > 1$) ; pour une diminution, $r = 1 - \dfrac{p}{100}$ ($0 < r < 1$).`,
      },
      {
        id: r`$\dfrac{f(s)}{f(r)} = a^{s-r}$`,
        enonce: r`Pour $f(x) = k \cdot a^x$, exprime le rapport $\dfrac{f(s)}{f(r)}$ en fonction de $a$, $r$ et $s$.`,
        corrige: r`$\dfrac{f(s)}{f(r)} = a^{s-r}$ : à écart constant, le rapport est constant.`,
      },
      {
        id: r`$T(t) = L + C \cdot q^t$`,
        enonce: r`Vers quelle valeur tend $T(t) = L + C \cdot q^t$ quand $t \to +\infty$, si $0 < q < 1$ ? Et $Q_0\left(1 - q^t\right)$ ?`,
        corrige: r`$T(t)$ tend vers $L$ (car $q^t \to 0$) ; $Q_0\left(1 - q^t\right)$ tend vers $Q_0$.`,
      },
      {
        id: r`$\dfrac{T(t_0 + 2d) - T(t_0 + d)}{T(t_0 + d) - T(t_0)} = q^d$`,
        enonce: r`Pour $T(t) = L + C \cdot q^t$, que vaut le rapport $\dfrac{T(t_0 + 2d) - T(t_0 + d)}{T(t_0 + d) - T(t_0)}$ ?`,
        corrige: r`Il vaut $q^d$ : trois mesures à intervalles égaux $d$ suffisent pour retrouver $q$.`,
      },
      {
        id: r`maximum de $t^n \cdot e^{-at}$ en $t = \dfrac{n}{a}$`,
        enonce: r`Pour $a > 0$ et $t \ge 0$, en quelle valeur de $t$ la fonction $f(t) = t^n \cdot e^{-at}$ atteint-elle son maximum ?`,
        corrige: r`En $t = \dfrac{n}{a}$ : $f'(t) = t^{n-1} e^{-at}(n - at)$ y change de signe, de $+$ à $-$.`,
      },
    ],
  },

  // ── Ch. 3 — Fonctions logarithmes ──────────────────────────────────────────────────────────────
  'fonctions-logarithmes': {
    proprietes: [
      {
        id: r`$\log_a(x) = y \iff a^y = x$`,
        enonce: r`Donne la définition de $\log_a(x)$ (pour $a > 0$, $a \neq 1$ et $x > 0$) à l'aide d'une puissance de $a$.`,
        corrige: r`$\log_a(x) = y \iff a^y = x$ : $\log_a(x)$ est l'exposant à donner à $a$ pour obtenir $x$.`,
      },
      {
        id: r`$\log_a(1) = 0 \qquad \log_a(a) = 1$`,
        enonce: r`Que valent $\log_a(1)$, $\log_a(a)$, $\log_a(a^r)$ et $a^{\log_a(x)}$ (avec $x > 0$) ?`,
        corrige: r`$\log_a(1) = 0$, $\log_a(a) = 1$, $\log_a(a^r) = r$, $a^{\log_a(x)} = x$.`,
      },
      {
        id: r`$\log_a(xy) = \log_a(x) + \log_a(y)$`,
        enonce: r`Pour $x, y > 0$, complète : $\log_a(xy) = \ldots$ et $\log_a\left(\dfrac{x}{y}\right) = \ldots$`,
        corrige: r`$\log_a(xy) = \log_a(x) + \log_a(y)$ et $\log_a\left(\dfrac{x}{y}\right) = \log_a(x) - \log_a(y)$.`,
      },
      {
        id: r`$\log_a(x^r) = r \cdot \log_a(x)$`,
        enonce: r`Pour $x > 0$ et $r$ réel, complète : $\log_a(x^r) = \ldots$`,
        corrige: r`$\log_a(x^r) = r \cdot \log_a(x)$.`,
      },
      {
        id: r`$\log_a(x) = \dfrac{\ln(x)}{\ln(a)}$`,
        enonce: r`Exprime $\log_a(x)$ à l'aide du logarithme népérien (formule du changement de base).`,
        corrige: r`$\log_a(x) = \dfrac{\ln(x)}{\ln(a)}$.`,
      },
    ],
    equations: [
      {
        id: r`$\log_a(x) = \log_a(y) \iff x = y$`,
        enonce: r`Pour $x, y > 0$, complète : $\log_a(x) = \log_a(y) \iff \ldots$`,
        corrige: r`$\log_a(x) = \log_a(y) \iff x = y$.`,
      },
    ],
    inequations: [
      {
        id: r`$\log_a(u) \le \log_a(v) \iff u \le v$`,
        enonce: r`Pour $u, v > 0$, complète $\log_a(u) \le \log_a(v) \iff \ldots$, d'abord si $a > 1$, puis si $0 < a < 1$.`,
        corrige: r`Si $a > 1$ : $\log_a(u) \le \log_a(v) \iff u \le v$ (sens conservé). Si $0 < a < 1$ : $\log_a(u) \le \log_a(v) \iff u \ge v$ (sens inversé).`,
      },
    ],
    derivee: [
      {
        id: r`$(\ln(x))' = \dfrac{1}{x}$`,
        enonce: r`Donne la dérivée de $\ln(x)$ et celle de $\log_a(x)$.`,
        corrige: r`$(\ln(x))' = \dfrac{1}{x}$ et $(\log_a(x))' = \dfrac{1}{x \cdot \ln(a)}$, pour $x > 0$.`,
      },
      {
        id: r`$(\ln(u(x)))' = \dfrac{u'(x)}{u(x)}$`,
        enonce: r`Donne la dérivée de $\ln(u(x))$ et celle de $\ln|u(x)|$, où $u$ est dérivable. Où chaque formule est-elle valable ?`,
        corrige: r`$(\ln(u(x)))' = \dfrac{u'(x)}{u(x)}$ là où $u(x) > 0$ ; $(\ln|u(x)|)' = \dfrac{u'(x)}{u(x)}$ là où $u(x) \neq 0$ (en particulier $(\ln|x|)' = \dfrac{1}{x}$).`,
      },
      {
        id: r`$((g(x))^{h(x)})' = \left(h'(x)\ln(g(x)) + \dfrac{h(x)g'(x)}{g(x)}\right)(g(x))^{h(x)}$`,
        enonce: r`Par dérivation logarithmique, donne la dérivée de $(g(x))^{h(x)}$, avec $g(x) > 0$.`,
        corrige: r`$((g(x))^{h(x)})' = \left(h'(x)\ln(g(x)) + \dfrac{h(x)g'(x)}{g(x)}\right)(g(x))^{h(x)}$.`,
      },
    ],
    limites: [
      {
        id: r`$\lim_{x \to 0^+} \log_a(x) = -\infty \quad \lim_{x \to +\infty} \log_a(x) = +\infty$`,
        enonce: r`Donne les limites de $\log_a(x)$ en $0^+$ et en $+\infty$, d'abord si $a > 1$, puis si $0 < a < 1$.`,
        corrige: [
          r`Si $a > 1$ : $\displaystyle\lim_{x \to 0^+} \log_a(x) = -\infty$ et $\displaystyle\lim_{x \to +\infty} \log_a(x) = +\infty$.`,
          r`Si $0 < a < 1$ : $\displaystyle\lim_{x \to 0^+} \log_a(x) = +\infty$ et $\displaystyle\lim_{x \to +\infty} \log_a(x) = -\infty$.`,
        ],
      },
      {
        id: r`$\displaystyle\lim_{x \to +\infty} \dfrac{\log_a(x)}{x^k} = 0$`,
        enonce: r`Pour $a > 1$ et $k > 0$, que vaut $\displaystyle\lim_{x \to +\infty} \dfrac{\log_a(x)}{x^k}$ ? Range $a^x$, $x^n$ et $\log_b(x)$ pour $x$ assez grand ($a > 1$, $b > 1$, $n > 0$).`,
        corrige: r`$\displaystyle\lim_{x \to +\infty} \dfrac{\log_a(x)}{x^k} = 0$ ; pour $x$ assez grand, $a^x > x^n > \log_b(x)$.`,
      },
      {
        id: r`$\displaystyle\lim_{x \to 0^+} x\ln(x) = 0 \qquad \lim_{u \to 0} \dfrac{\ln(1+u)}{u} = 1$`,
        enonce: r`Donne $\displaystyle\lim_{x \to 0^+} x\ln(x)$ et $\displaystyle\lim_{u \to 0} \dfrac{\ln(1+u)}{u}$.`,
        corrige: r`$\displaystyle\lim_{x \to 0^+} x\ln(x) = 0$ et $\displaystyle\lim_{u \to 0} \dfrac{\ln(1+u)}{u} = 1$.`,
      },
      {
        id: r`$f(x)^{g(x)} = e^{g(x)\ln f(x)}$`,
        enonce: r`Pour $f(x) > 0$, comment réécrit-on $f(x)^{g(x)}$ pour lever une forme indéterminée $1^{\infty}$, $0^{0}$ ou $(+\infty)^{0}$ ? Que vaut alors la limite si $g(x)\ln f(x) \to L$ ?`,
        corrige: r`$f(x)^{g(x)} = e^{g(x)\ln f(x)}$ ; si $g(x)\ln f(x) \to L$, la puissance tend vers $e^{L}$ ($+\infty$ si $L = +\infty$, $0$ si $L = -\infty$).`,
      },
    ],
    hyperboliques: [
      {
        id: r`$\text{ch}(x) = \dfrac{e^x+e^{-x}}{2} \qquad \text{sh}(x) = \dfrac{e^x-e^{-x}}{2}$`,
        enonce: r`Donne la définition de $\text{ch}(x)$ et celle de $\text{sh}(x)$ à l'aide de l'exponentielle.`,
        corrige: r`$\text{ch}(x) = \dfrac{e^x+e^{-x}}{2}$ et $\text{sh}(x) = \dfrac{e^x-e^{-x}}{2}$.`,
      },
      {
        id: r`$\text{ch}^2(x) - \text{sh}^2(x) = 1$`,
        enonce: r`Complète, pour tout réel $x$ : $\text{ch}^2(x) - \text{sh}^2(x) = \ldots$`,
        corrige: r`$\text{ch}^2(x) - \text{sh}^2(x) = 1$.`,
      },
      {
        id: r`$\text{sh}'(x) = \text{ch}(x) \qquad \text{ch}'(x) = \text{sh}(x)$`,
        enonce: r`Donne les dérivées de $\text{sh}(x)$ et de $\text{ch}(x)$.`,
        corrige: r`$\text{sh}'(x) = \text{ch}(x)$ et $\text{ch}'(x) = \text{sh}(x)$.`,
      },
      {
        id: r`$\text{argsh}(x) = \ln\left(x + \sqrt{x^2+1}\right)$`,
        enonce: r`Exprime $\text{argsh}(x)$, la réciproque de $\text{sh}$, à l'aide de la fonction $\ln$.`,
        corrige: r`$\text{argsh}(x) = \ln\left(x + \sqrt{x^2+1}\right)$.`,
      },
    ],
    graphique: [
      {
        id: r`$\ln(x) \le x - 1$`,
        enonce: r`Compare $\ln(x)$ et $x - 1$ pour tout $x > 0$. Pour quelle valeur de $x$ y a-t-il égalité ?`,
        corrige: r`$\ln(x) \le x - 1$ pour tout $x > 0$, avec égalité seulement en $x = 1$.`,
      },
    ],
    problemes: [
      {
        id: r`$T = \dfrac{\ln(2)}{\lambda}$`,
        enonce: r`Pour une quantité qui suit $N(t) = N_0 e^{-\lambda t}$, exprime la demi-vie $T$ en fonction de $\lambda$.`,
        corrige: r`$T = \dfrac{\ln(2)}{\lambda}$ (car $e^{-\lambda T} = \dfrac{1}{2}$).`,
      },
      {
        id: r`$t = \dfrac{\ln(2)}{r}$`,
        enonce: r`Pour une quantité qui suit $C(t) = C_0 e^{rt}$, exprime le temps de doublement en fonction de $r$.`,
        corrige: r`$t = \dfrac{\ln(2)}{r}$ (car $e^{rt} = 2$).`,
      },
    ],
  },

  // ── Ch. 4 — Intégrales et primitives ───────────────────────────────────────────────────────────
  'primitives-integrales': {
    primitives: [
      {
        id: r`$\int x^n dx = \dfrac{x^{n+1}}{n+1} + C$`,
        enonce: r`Donne les primitives de $x^n$ (avec $n \neq -1$) et celles de $\dfrac{1}{x}$.`,
        corrige: r`$\int x^n \, dx = \dfrac{x^{n+1}}{n+1} + C$ ; $\int \dfrac{1}{x} \, dx = \ln|x| + C$ (une constante propre à chaque intervalle de $\mathbb{R}_0$).`,
      },
      {
        id: r`$\int e^x dx = e^x + C \qquad \int e^{kx} dx = \dfrac{1}{k}e^{kx} + C$`,
        enonce: r`Donne les primitives de $e^x$ et celles de $e^{kx}$ (avec $k \neq 0$).`,
        corrige: r`$\int e^x \, dx = e^x + C$ et $\int e^{kx} \, dx = \dfrac{1}{k}e^{kx} + C$.`,
      },
      {
        id: r`$\int \cos(x) dx = \sin(x) + C \qquad \int \sin(x) dx = -\cos(x) + C$`,
        enonce: r`Donne les primitives de $\cos(x)$, de $\sin(x)$ et de $\dfrac{1}{\cos^2(x)}$.`,
        corrige: r`$\int \cos(x) \, dx = \sin(x) + C$, $\int \sin(x) \, dx = -\cos(x) + C$, $\int \dfrac{1}{\cos^2(x)} \, dx = \tan(x) + C$.`,
      },
      {
        id: r`$\int \ln(x) dx = x\ln(x) - x + C \qquad \int \dfrac{1}{\cos^2(x)} dx = \tan(x) + C$`,
        enonce: r`Donne les primitives de $\ln(x)$ sur $]0\,;+\infty[$.`,
        corrige: r`$\int \ln(x) \, dx = x\ln(x) - x + C$.`,
      },
      {
        id: r`$\int \dfrac{1}{1+x^2} dx = \arctan(x) + C \qquad \int \dfrac{1}{\sqrt{1-x^2}} dx = \arcsin(x) + C$`,
        enonce: r`Donne les primitives de $\dfrac{1}{1+x^2}$ et celles de $\dfrac{1}{\sqrt{1-x^2}}$.`,
        corrige: r`$\int \dfrac{1}{1+x^2} \, dx = \arctan(x) + C$ et $\int \dfrac{1}{\sqrt{1-x^2}} \, dx = \arcsin(x) + C$.`,
      },
      {
        id: r`$u'e^u \to e^u + C \qquad \dfrac{u'}{u} \to \ln|u| + C \qquad u'u^n \to \dfrac{u^{n+1}}{n+1} + C$`,
        enonce: r`Donne une primitive de $u'e^u$, de $\dfrac{u'}{u}$ et de $u'u^n$ (avec $n \neq -1$), où $u$ est une fonction dérivable.`,
        corrige: r`$u'e^u \to e^u + C$ ; $\dfrac{u'}{u} \to \ln|u| + C$ ; $u'u^n \to \dfrac{u^{n+1}}{n+1} + C$.`,
      },
      {
        id: r`$\int f(x) \cdot g'(x) dx = f(x) \cdot g(x) - \int f'(x) \cdot g(x) dx$`,
        enonce: r`Énonce la formule d'intégration par parties : $\int f(x) \cdot g'(x) \, dx = \ldots$`,
        corrige: r`$\int f(x) \cdot g'(x) \, dx = f(x) \cdot g(x) - \int f'(x) \cdot g(x) \, dx$.`,
      },
      {
        id: r`$\int f(ax+b)dx = \dfrac{1}{a}F(ax+b) + C$`,
        enonce: r`Si $F$ est une primitive de $f$ et $a \neq 0$, donne les primitives de $f(ax+b)$.`,
        corrige: r`$\int f(ax+b) \, dx = \dfrac{1}{a}F(ax+b) + C$.`,
      },
    ],
    conditioninitiale: [
      {
        id: r`primitive générale : $F(x) + C$`,
        enonce: r`Si $F$ est une primitive de $f$ sur un intervalle, quelles sont toutes les primitives de $f$ ? Comment trouve-t-on celle qui vaut $y_0$ en $x_0$ ?`,
        corrige: r`Toutes les primitives s'écrivent $F(x) + C$, $C \in \mathbb{R}$ ; on résout $F(x_0) + C = y_0$ en $C$.`,
      },
    ],
    integralesdefinies: [
      {
        id: r`$\int_a^b f(x) dx = F(b) - F(a)$`,
        enonce: r`Si $f$ est continue sur $[a\,;b]$ et $F$ est une primitive de $f$, que vaut $\int_a^b f(x) \, dx$ (théorème fondamental) ?`,
        corrige: r`$\int_a^b f(x) \, dx = [F(x)]_a^b = F(b) - F(a)$, quelle que soit la primitive $F$ choisie.`,
      },
      {
        id: r`$\int_a^a f(x) dx = 0 \qquad \int_a^b f(x) dx = -\int_b^a f(x) dx$`,
        enonce: r`Complète : $\int_a^a f(x) \, dx = \ldots$, $\int_b^a f(x) \, dx = \ldots$ (à l'aide de $\int_a^b f(x) \, dx$) et $\int_a^c f(x) \, dx + \int_c^b f(x) \, dx = \ldots$`,
        corrige: r`$\int_a^a f(x) \, dx = 0$ ; $\int_b^a f(x) \, dx = -\int_a^b f(x) \, dx$ ; $\int_a^c f(x) \, dx + \int_c^b f(x) \, dx = \int_a^b f(x) \, dx$ (additivité).`,
      },
      {
        id: r`$A(x) = \int_a^x f(t)dt \implies A'(x) = f(x)$`,
        enonce: r`Si $f$ est continue et $A(x) = \int_a^x f(t) \, dt$, que vaut $A'(x)$ ?`,
        corrige: r`$A'(x) = f(x)$ : la fonction aire est une primitive de $f$.`,
      },
      {
        id: r`$\int_{-a}^{a} f = 0$ si f impaire $\qquad \int_{-a}^{a} f = 2\int_0^a f$ si f paire`,
        enonce: r`Que vaut $\int_{-a}^{a} f(x) \, dx$ si $f$ est impaire ? Et si $f$ est paire ?`,
        corrige: r`$f$ impaire : $\int_{-a}^{a} f(x) \, dx = 0$ ; $f$ paire : $\int_{-a}^{a} f(x) \, dx = 2\int_0^a f(x) \, dx$.`,
      },
      {
        id: r`$\int_a^b f(x) dx \approx \dfrac{\Delta x}{2}[f(x_0)+f(x_n)+2(f(x_1)+\ldots+f(x_{n-1}))]$`,
        enonce: r`On partage $[a\,;b]$ en $n$ intervalles de même largeur $\Delta x$, de bornes $x_0 = a, x_1, \ldots, x_n = b$. Écris l'approximation de $\int_a^b f(x) \, dx$ par la méthode des trapèzes.`,
        corrige: r`$\int_a^b f(x) \, dx \approx \dfrac{\Delta x}{2}\big[f(x_0)+f(x_n)+2\big(f(x_1)+\ldots+f(x_{n-1})\big)\big]$.`,
      },
      {
        id: r`valeur moyenne $= \dfrac{1}{b-a}\int_a^b f(x) dx$`,
        enonce: r`Donne la formule de la valeur moyenne d'une fonction $f$ sur $[a\,;b]$.`,
        corrige: r`Valeur moyenne $= \dfrac{1}{b-a}\int_a^b f(x) \, dx$.`,
      },
    ],
    aires: [
      {
        id: r`aire $= \int_a^b f(x) dx$`,
        enonce: r`Comment calcule-t-on l'aire comprise entre le graphe de $f$ et l'axe $Ox$ sur $[a\,;b]$ si $f \ge 0$ ? Si $f \le 0$ ? Et si $f$ change de signe ?`,
        corrige: r`$f \ge 0$ : aire $= \int_a^b f(x) \, dx$ ; $f \le 0$ : aire $= -\int_a^b f(x) \, dx$ ; si $f$ change de signe, on découpe $[a\,;b]$ aux racines et on additionne les aires.`,
      },
      {
        id: r`aire entre deux courbes $= \int_a^b (f(x)-g(x)) dx$`,
        enonce: r`Comment calcule-t-on l'aire comprise entre les courbes $y = f(x)$ et $y = g(x)$ sur $[a\,;b]$, si $f(x) \ge g(x)$ sur cet intervalle ?`,
        corrige: r`Aire $= \int_a^b \big(f(x)-g(x)\big) \, dx$.`,
      },
    ],
    volumes: [
      {
        id: r`$V = \pi \int_a^b [f(x)]^2 dx$`,
        enonce: r`Donne le volume du solide engendré par la rotation autour de l'axe $Ox$ de la région sous le graphe de $f$, sur $[a\,;b]$ (méthode des disques).`,
        corrige: r`$V = \pi \int_a^b [f(x)]^2 \, dx$.`,
      },
      {
        id: r`$V = \pi \int_a^b ([f(x)]^2 - [g(x)]^2) dx$`,
        enonce: r`Donne le volume du solide engendré par la rotation autour de l'axe $Ox$ de la région comprise entre les graphes de $f$ et de $g$ sur $[a\,;b]$, avec $f \ge g \ge 0$ (méthode des rondelles).`,
        corrige: r`$V = \pi \int_a^b \big([f(x)]^2 - [g(x)]^2\big) \, dx$.`,
      },
      {
        id: r`$V_{\text{boule}} = \dfrac{4}{3}\pi r^3 \qquad V_{\text{cône}} = \dfrac{\pi r^2 h}{3}$`,
        enonce: r`Donne le volume d'une boule de rayon $r$ et celui d'un cône de rayon de base $r$ et de hauteur $h$ (formules retrouvées par la méthode des disques).`,
        corrige: r`$V_{\text{boule}} = \dfrac{4}{3}\pi r^3$ et $V_{\text{cône}} = \dfrac{\pi r^2 h}{3}$.`,
      },
    ],
    longueurarc: [
      {
        id: r`$L = \int_a^b \sqrt{1+[f'(x)]^2} dx$`,
        enonce: r`Donne la formule de la longueur de l'arc de la courbe $y = f(x)$ entre $x = a$ et $x = b$.`,
        corrige: r`$L = \int_a^b \sqrt{1+[f'(x)]^2} \, dx$.`,
      },
    ],
  },

  // ── Ch. 5 — Nombres complexes ──────────────────────────────────────────────────────────────────
  'nombres-complexes': {
    operationsbase: [
      {
        id: r`$i^2=-1$`,
        enonce: r`Que vaut $i^2$ ? Donne le conjugué $\bar{z}$ du nombre complexe $z = a+bi$.`,
        corrige: r`$i^2 = -1$ ; $\bar{z} = a-bi$ (même partie réelle, partie imaginaire opposée).`,
      },
      {
        id: r`$z+\bar{z}=2a \quad z\cdot\bar{z}=a^2+b^2$`,
        enonce: r`Pour $z = a+bi$, que valent $z+\bar{z}$ et $z\cdot\bar{z}$ ?`,
        corrige: r`$z+\bar{z} = 2a$ (réel) et $z\cdot\bar{z} = a^2+b^2$ (réel positif ou nul).`,
      },
      {
        id: r`$\dfrac{1}{z} = \dfrac{a-bi}{a^2+b^2}$`,
        enonce: r`Pour $z = a+bi$ non nul, écris $\dfrac{1}{z}$ sous forme algébrique.`,
        corrige: r`$\dfrac{1}{z} = \dfrac{a-bi}{a^2+b^2}$ (on multiplie numérateur et dénominateur par $\bar{z}$).`,
      },
    ],
    affixesracines: [
      {
        id: r`$z_M = \dfrac{z_A+z_B}{2} \quad AB = |z_B-z_A|$`,
        enonce: r`Les points $A$ et $B$ ont pour affixes $z_A$ et $z_B$. Donne l'affixe du milieu $M$ de $[AB]$ et la longueur $AB$.`,
        corrige: r`$z_M = \dfrac{z_A+z_B}{2}$ et $AB = |z_B-z_A|$.`,
      },
      {
        id: r`$x^2-y^2=a \quad 2xy=b \quad x^2+y^2=\sqrt{a^2+b^2}$`,
        enonce: r`Pour trouver une racine carrée $x+iy$ de $a+bi$, quel système d'équations résout-on ? Combien de racines carrées obtient-on ?`,
        corrige: r`$x^2-y^2 = a$, $2xy = b$ et $x^2+y^2 = \sqrt{a^2+b^2}$ (égalité des modules) ; on obtient toujours deux racines carrées opposées.`,
      },
    ],
    equationscomplexes: [
      {
        id: r`$z = \dfrac{-b \pm i\sqrt{|\Delta|}}{2a}$`,
        enonce: r`Si $\Delta = b^2 - 4ac < 0$, donne les solutions dans $\mathbb{C}$ de l'équation $az^2+bz+c = 0$ (coefficients réels).`,
        corrige: r`$z = \dfrac{-b \pm i\sqrt{|\Delta|}}{2a}$ : deux solutions complexes conjuguées.`,
      },
      {
        id: r`$u=z^2$`,
        enonce: r`Quelle substitution ramène l'équation bicarrée $az^4+bz^2+c = 0$ à une équation du second degré ? Combien de valeurs de $z$ donne chaque solution non nulle ?`,
        corrige: r`On pose $u = z^2$ ; chaque solution $u \neq 0$ donne deux valeurs de $z$ (ses deux racines carrées).`,
      },
    ],
    formetrigonometrique: [
      {
        id: r`$|z|=\sqrt{a^2+b^2} \quad z = r(\cos\theta+i\sin\theta) = re^{i\theta}$`,
        enonce: r`Donne le module de $z = a+bi$, puis la forme trigonométrique et la forme exponentielle d'un nombre complexe de module $r$ et d'argument $\theta$.`,
        corrige: r`$|z| = \sqrt{a^2+b^2}$ ; $z = r(\cos\theta+i\sin\theta) = re^{i\theta}$.`,
      },
      {
        id: r`$\arg(z)=\arctan\dfrac{b}{a}$`,
        enonce: r`Comment calcule-t-on l'argument de $z = a+bi$, dans $]{-\pi}\,;\pi]$, si $a > 0$ ? Que change-t-on si $a < 0$ ? Et si $a = 0$ ?`,
        corrige: r`Si $a > 0$ : $\arg(z) = \arctan\dfrac{b}{a}$. Si $a < 0$ : on ajoute $\pi$ (si $b \ge 0$) ou on retranche $\pi$ (si $b < 0$). Si $a = 0$ : $\arg(z) = \dfrac{\pi}{2}$ si $b > 0$, $-\dfrac{\pi}{2}$ si $b < 0$.`,
      },
      {
        id: r`$r_1e^{i\theta_1} \cdot r_2e^{i\theta_2} = r_1r_2\, e^{i(\theta_1+\theta_2)}$`,
        enonce: r`Que deviennent les modules et les arguments quand on multiplie deux nombres complexes $r_1e^{i\theta_1}$ et $r_2e^{i\theta_2}$ ? Et quand on divise le premier par le second ?`,
        corrige: r`$r_1e^{i\theta_1} \cdot r_2e^{i\theta_2} = r_1r_2\, e^{i(\theta_1+\theta_2)}$ (modules multipliés, arguments additionnés) ; $\dfrac{r_1e^{i\theta_1}}{r_2e^{i\theta_2}} = \dfrac{r_1}{r_2}\, e^{i(\theta_1-\theta_2)}$ (modules divisés, arguments soustraits).`,
      },
    ],
    formulemoivre: [
      {
        id: r`$(\cos\theta+i\sin\theta)^n = \cos(n\theta)+i\sin(n\theta)$`,
        enonce: r`Énonce la formule de Moivre : $(\cos\theta+i\sin\theta)^n = \ldots$`,
        corrige: r`$(\cos\theta+i\sin\theta)^n = \cos(n\theta)+i\sin(n\theta)$.`,
      },
    ],
    racinesniemes: [
      {
        id: r`$z_k = r^{1/n}\cdot e^{i(\theta+2k\pi)/n}$`,
        enonce: r`Donne les $n$ racines $n$-ièmes du nombre complexe non nul $z = re^{i\theta}$. Quelle figure forment leurs images dans le plan ?`,
        corrige: r`$z_k = r^{1/n}\cdot e^{i(\theta+2k\pi)/n}$ pour $k = 0, 1, \ldots, n-1$ : les sommets d'un polygone régulier à $n$ côtés.`,
      },
    ],
    transformationsplan: [
      {
        id: r`$z' = z+b$`,
        enonce: r`Écris l'expression complexe de la translation de vecteur d'affixe $b$, puis celle de la rotation de centre $\Omega$ (d'affixe $z_0$) et d'angle $\theta$.`,
        corrige: r`Translation : $z' = z+b$ ; rotation : $z' = e^{i\theta}(z-z_0)+z_0$.`,
      },
      {
        id: r`$z' = az+b$`,
        enonce: r`Quelle transformation du plan l'expression $z' = az+b$ représente-t-elle ? Si $a \neq 1$, quelle est l'affixe de son centre ?`,
        corrige: r`Une similitude ; si $a \neq 1$, son centre a pour affixe $z_0 = \dfrac{b}{1-a}$.`,
      },
    ],
    trianglescomplexes: [
      {
        id: r`$\dfrac{z_C-z_A}{z_B-z_A}$ réel $\Rightarrow$ alignés, imaginaire pur $\Rightarrow$ orthogonaux`,
        enonce: r`Que peut-on dire des points $A$, $B$, $C$ si le quotient $\dfrac{z_C-z_A}{z_B-z_A}$ est réel ? Et s'il est imaginaire pur ?`,
        corrige: r`Réel : $A$, $B$, $C$ sont alignés. Imaginaire pur : $(AB) \perp (AC)$, le triangle est rectangle en $A$.`,
      },
      {
        id: r`$\dfrac{z_C-z_A}{z_B-z_A}=e^{\pm i\pi/3}$`,
        enonce: r`Quelle valeur doit prendre le quotient $\dfrac{z_C-z_A}{z_B-z_A}$ pour que le triangle $ABC$ soit équilatéral ?`,
        corrige: r`$\dfrac{z_C-z_A}{z_B-z_A} = e^{i\pi/3}$ ou $e^{-i\pi/3}$ (module $1$ : $AC = AB$ ; angle $\dfrac{\pi}{3}$ en $A$).`,
      },
    ],
    problemesavances: [
      {
        id: r`$|z-a|=k \Rightarrow$ cercle`,
        enonce: r`Les points $A$ et $B$ ont pour affixes $a$ et $b$. Quel est l'ensemble des points d'affixe $z$ tels que $|z-a| = k$ ($k > 0$) ? Et tels que $|z-a| = |z-b|$ ?`,
        corrige: r`$|z-a| = k$ : le cercle de centre $A$ et de rayon $k$ ; $|z-a| = |z-b|$ : la médiatrice du segment $[AB]$.`,
      },
    ],
  },

  // ── Ch. 6 — Les probabilités ───────────────────────────────────────────────────────────────────
  probabilites: {
    probabilitesensembles: [
      {
        id: r`$P(A) = \dfrac{n(A)}{n(\Omega)}$`,
        enonce: r`Dans une situation d'équiprobabilité, comment calcule-t-on la probabilité d'un événement $A$ ?`,
        corrige: r`$P(A) = \dfrac{\text{nombre de cas favorables}}{\text{nombre de cas possibles}}$ — seulement si les résultats sont équiprobables.`,
      },
      {
        id: r`$P(\bar{A}) = 1-P(A)$`,
        enonce: r`Exprime la probabilité de l'événement contraire $\bar{A}$ en fonction de $P(A)$.`,
        corrige: r`$P(\bar{A}) = 1-P(A)$.`,
      },
      {
        id: r`$P(A \cup B) = P(A)+P(B)-P(A \cap B)$`,
        enonce: r`Complète : $P(A \cup B) = \ldots$`,
        corrige: r`$P(A \cup B) = P(A)+P(B)-P(A \cap B)$.`,
      },
      {
        id: r`$P(\bar{A} \cap \bar{B}) = 1-P(A \cup B)$`,
        enonce: r`Exprime $P(\bar{A} \cap \bar{B})$, la probabilité que ni $A$ ni $B$ ne se réalise, à l'aide de $P(A \cup B)$.`,
        corrige: r`$P(\bar{A} \cap \bar{B}) = 1-P(A \cup B)$ (jamais $1-P(A)-P(B)$).`,
      },
      {
        id: r`$P(A|B) = \dfrac{P(A \cap B)}{P(B)}$`,
        enonce: r`Donne la définition de la probabilité conditionnelle $P(A|B)$, avec $P(B) \neq 0$.`,
        corrige: r`$P(A|B) = \dfrac{P(A \cap B)}{P(B)}$.`,
      },
      {
        id: r`$P(A \cap B) = P(A) \times P(B)$`,
        enonce: r`À quelle condition deux événements $A$ et $B$ sont-ils indépendants ? Deux événements incompatibles, de probabilités non nulles, peuvent-ils être indépendants ?`,
        corrige: r`$A$ et $B$ sont indépendants si $P(A \cap B) = P(A) \times P(B)$. Incompatibles et de probabilités non nulles, ils ne le sont jamais : $P(A \cap B) = 0 \neq P(A) \times P(B)$.`,
      },
    ],
    tiragesarbres: [
      {
        id: r`probabilité d'un chemin = produit des probabilités des branches`,
        enonce: r`Dans un arbre pondéré, comment calcule-t-on la probabilité d'un chemin ? Et celle d'un événement réalisé par plusieurs chemins ?`,
        corrige: r`Probabilité d'un chemin : produit des probabilités de ses branches. Probabilité d'un événement : somme des probabilités des chemins qui le réalisent.`,
      },
      {
        id: r`$P(A \cap B) = P(A) \times P(B|A)$`,
        enonce: r`Sur un arbre à deux étages, exprime $P(A \cap B)$ à l'aide de $P(A)$ et d'une probabilité conditionnelle.`,
        corrige: r`$P(A \cap B) = P(A) \times P(B|A)$.`,
      },
      {
        id: r`$n! = n \times (n-1) \times \ldots \times 1$`,
        enonce: r`De combien de façons peut-on ranger $n$ objets distincts ? Écris ce nombre comme un produit.`,
        corrige: r`$n! = n \times (n-1) \times \ldots \times 1$.`,
      },
    ],
    independancebayes: [
      {
        id: r`$P(A) = \displaystyle\sum_i P(A|B_i) \times P(B_i)$`,
        enonce: r`Les événements $B_1, B_2, \ldots$ forment une partition de $\Omega$. Énonce la loi des probabilités totales pour un événement $A$.`,
        corrige: r`$P(A) = \displaystyle\sum_i P(A|B_i) \times P(B_i)$.`,
      },
      {
        id: r`$P(A|B) = \dfrac{P(B|A) \times P(A)}{P(B)}$`,
        enonce: r`Énonce le théorème de Bayes : exprime $P(A|B)$ à l'aide de $P(B|A)$. Développe ensuite $P(B)$ sur la partition $A$, $\bar{A}$.`,
        corrige: [
          r`$P(A|B) = \dfrac{P(B|A) \times P(A)}{P(B)}$,`,
          r`soit $P(A|B) = \dfrac{P(B|A) \times P(A)}{P(B|A) \times P(A) + P(B|\bar{A}) \times P(\bar{A})}$.`,
        ],
      },
    ],
    probabilitesproblemes: [
      {
        id: r`$P(X=k) = N_k \times p^k(1-p)^{n-k}$`,
        enonce: r`On répète $n$ épreuves indépendantes dont la probabilité de succès vaut $p$ ; $N_k$ est le nombre de chemins de l'arbre qui comptent exactement $k$ succès. Donne la probabilité d'obtenir exactement $k$ succès.`,
        corrige: r`$P(X=k) = N_k \times p^k(1-p)^{n-k}$.`,
      },
      {
        id: r`$P(\text{au moins 1 succès}) = 1-(1-p)^n$`,
        enonce: r`On répète $n$ épreuves indépendantes dont la probabilité de succès vaut $p$. Donne la probabilité d'obtenir au moins un succès.`,
        corrige: r`$P(\text{au moins 1 succès}) = 1-(1-p)^n$ (complément de « aucun succès »).`,
      },
      {
        id: r`$P(\text{série fonctionne}) = p_1 \times p_2$`,
        enonce: r`Deux composants indépendants fonctionnent avec les probabilités $p_1$ et $p_2$. Donne la probabilité que le système fonctionne s'ils sont montés en série, puis s'ils sont montés en parallèle.`,
        corrige: r`Série : $p_1 \times p_2$. Parallèle : $1-(1-p_1)(1-p_2)$.`,
      },
    ],
  },

  // ── Ch. 7 — Analyse combinatoire ───────────────────────────────────────────────────────────────
  'analyse-combinatoire': {
    // Notation du cours (audit 6e ch. 7, lot A) : n éléments disponibles, p choisis ; k = rang d'un
    // terme ou nombre de succès ; r = nombre de types. Ids gardés quand la question existait déjà.
    denombrementfondamental: [
      {
        id: r`$n! = n \times (n-1) \times \ldots \times 1$`,
        enonce: r`Que vaut $n!$ ? Et $0!$ ?`,
        corrige: r`$n! = n \times (n-1) \times \ldots \times 1$ et $0! = 1$.`,
      },
      {
        id: r`$A_n^k = \dfrac{n!}{(n-k)!}$`,
        enonce: r`On choisit $p$ éléments parmi $n$ et l'ordre compte. Donne le nombre d'arrangements $A_n^p$ à l'aide de factorielles.`,
        corrige: r`$A_n^p = \dfrac{n!}{(n-p)!} = n \times (n-1) \times \ldots \times (n-p+1)$.`,
      },
      {
        id: r`$C_n^k = \dfrac{n!}{k!(n-k)!} = \dfrac{A_n^k}{k!}$`,
        enonce: r`On choisit $p$ éléments parmi $n$ et l'ordre ne compte pas. Donne le nombre de combinaisons $C_n^p$ à l'aide de factorielles, puis à l'aide de $A_n^p$.`,
        corrige: r`$C_n^p = \dfrac{n!}{p!\,(n-p)!} = \dfrac{A_n^p}{p!}$.`,
      },
      {
        id: r`$C_n^k = C_n^{n-k}$`,
        enonce: r`Quelle autre combinaison d'éléments parmi $n$ est toujours égale à $C_n^p$ ? Pourquoi ?`,
        corrige: r`$C_n^p = C_n^{n-p}$ : choisir les $p$ éléments que l'on garde revient à choisir les $n-p$ éléments que l'on laisse.`,
      },
      {
        id: r`$P_n = n!$`,
        enonce: r`De combien de façons peut-on ranger, dans un ordre, les $n$ éléments distincts d'un ensemble (permutation simple $P_n$) ?`,
        corrige: r`$P_n = A_n^n = n!$.`,
      },
      {
        id: r`table : $(n-1)!$`,
        enonce: r`De combien de façons peut-on disposer $n$ objets distincts autour d'une table ronde (rotations équivalentes) ? Et sur un collier (rotations et réflexions équivalentes, $n \geq 3$) ?`,
        corrige: r`Table : $(n-1)!$ ; collier : $\dfrac{(n-1)!}{2}$.`,
      },
      {
        id: r`$B_n^p = n^p$`,
        enonce: r`On choisit $p$ éléments parmi $n$, avec répétition autorisée. Combien de choix si l'ordre compte ? Et si l'ordre ne compte pas ?`,
        corrige: r`L'ordre compte : $B_n^p = n^p$. L'ordre ne compte pas : $\Gamma_n^p = C_{n+p-1}^p$.`,
      },
      {
        id: r`au moins un de chaque type : $C_{p-1}^{n-1}$`,
        enonce: r`On choisit $p$ objets parmi $n$ types, avec répétition et sans ordre, et chaque type doit apparaître au moins une fois ($p \geq n$). Combien de choix sont possibles ?`,
        corrige: r`$\Gamma_n^{p-n} = C_{p-1}^{p-n} = C_{p-1}^{n-1}$ (on place d'abord un objet de chaque type).`,
      },
      {
        id: r`$D(n) = \dfrac{n(n-3)}{2}$`,
        enonce: r`Combien de diagonales a un polygone convexe à $n$ côtés ?`,
        corrige: r`$D(n) = \dfrac{n(n-3)}{2}$.`,
      },
      {
        id: r`$\dfrac{(n+1)!}{(n-1)!} = n(n+1)$`,
        enonce: r`Simplifie $\dfrac{(n+1)!}{(n-1)!}$, puis écris $A_n^2$ et $C_n^2$ comme des polynômes en $n$.`,
        corrige: r`$\dfrac{(n+1)!}{(n-1)!} = n(n+1)$ ; $A_n^2 = n(n-1)$ ; $C_n^2 = \dfrac{n(n-1)}{2}$.`,
      },
    ],
    denombrementcombine: [
      {
        id: r`$\dfrac{n!}{n_1! \times n_2! \times \ldots \times n_k!}$`,
        enonce: r`$n$ personnes sont réparties en $r$ groupes nommés, de tailles fixées $n_1, n_2, \ldots, n_r$ (avec $n_1 + \ldots + n_r = n$). Donne le nombre de répartitions possibles. Que compte encore ce nombre pour un mot de $n$ lettres ?`,
        corrige: r`$\dfrac{n!}{n_1! \times n_2! \times \ldots \times n_r!}$ ; c'est aussi le nombre de permutations distinctes de $n$ lettres dont $n_1, \ldots, n_r$ sont identiques.`,
      },
      {
        id: r`groupes non nommés de même taille`,
        enonce: r`$n$ personnes sont réparties en $r$ groupes de même taille qui n'ont ni nom ni numéro. Comment obtient-on le nombre de répartitions à partir du cas des groupes nommés ?`,
        corrige: r`On divise le nombre de répartitions en groupes nommés par $r!$, le nombre de façons de nommer les $r$ groupes.`,
      },
      {
        id: r`anagrammes : permutations distinctes $-1$`,
        enonce: r`Un mot compte $P$ permutations distinctes de ses lettres. Combien a-t-il d'anagrammes ?`,
        corrige: r`$P - 1$ : une anagramme est un mot différent du mot de départ.`,
      },
      {
        id: r`bloc`,
        enonce: r`Comment compte-t-on les rangements de lettres où certaines lettres doivent rester côte à côte ? Et ceux où deux lettres ne doivent jamais être côte à côte ?`,
        corrige: r`Côte à côte : (rangements du bloc et des autres lettres) $\times$ (ordres dans le bloc). Jamais côte à côte : total $-$ (rangements où elles forment un bloc).`,
      },
      {
        id: r`ET indépendant $\Rightarrow$ multiplier`,
        enonce: r`Dans un dénombrement en plusieurs choix, quand multiplie-t-on les nombres de possibilités ? Quand les additionne-t-on ?`,
        corrige: r`Choix successifs indépendants (« et ») : on multiplie. Cas qui s'excluent (« ou » exclusif) : on additionne.`,
      },
      {
        id: r`exclusion : total $-$ (les deux ensemble)`,
        enonce: r`On forme un groupe dans lequel deux personnes sont soumises à une contrainte. Comment compte-t-on les groupes si elles refusent d'être ensemble ? Et si elles sont inséparables ?`,
        corrige: r`Refus : total $-$ (groupes où les deux sont ensemble). Inséparables : (groupes où les deux sont ensemble) $+$ (groupes où les deux sont absentes).`,
      },
      {
        id: r`au moins un : total $-$ aucun`,
        enonce: r`Comment compte-t-on rapidement les choix qui contiennent « au moins un » élément d'un certain type ?`,
        corrige: r`Par le complément : total $-$ (choix qui n'en contiennent aucun).`,
      },
      {
        id: r`inclusion-exclusion`,
        enonce: r`Comment compte-t-on les objets qui ont à la fois la propriété $A$ et la propriété $B$, à partir de ceux qui ratent $A$, de ceux qui ratent $B$ et de ceux qui ratent les deux ?`,
        corrige: r`$N(A \text{ et } B) = \text{total} - N(\text{pas } A) - N(\text{pas } B) + N(\text{ni } A \text{ ni } B)$.`,
      },
      {
        id: r`$C_n^2 + n = C_{n+1}^2$`,
        enonce: r`On choisit 2 valeurs parmi $n$, sans ordre, une même valeur pouvant être prise deux fois (comme les deux moitiés d'un domino). Combien de choix ?`,
        corrige: r`$C_n^2 + n = C_{n+1}^2 = \Gamma_n^2$.`,
      },
    ],
    binomenewton: [
      {
        id: r`$(a+b)^n = \displaystyle\sum_{k=0}^{n} C_n^k \, a^{n-k} b^k$`,
        enonce: r`Écris la formule du binôme de Newton : $(a+b)^n = \ldots$`,
        corrige: r`$(a+b)^n = \displaystyle\sum_{k=0}^{n} C_n^k \, a^{n-k} b^k$.`,
      },
      {
        id: r`$T_{k+1} = C_n^k \times a^{n-k} \times b^k$`,
        enonce: r`Donne le terme général $T_{k+1}$ (de rang $k+1$) du développement de $(a+b)^n$.`,
        corrige: r`$T_{k+1} = C_n^k \times a^{n-k} \times b^k$.`,
      },
      {
        id: r`terme indépendant de $x$`,
        enonce: r`Comment trouve-t-on le terme indépendant de $x$ dans le développement d'un binôme comme $\left(x^2 - \dfrac{2}{x}\right)^n$ ?`,
        corrige: r`On écrit le terme général $T_{k+1}$, on réduit la puissance de $x$, et on cherche l'entier $k$ ($0 \leq k \leq n$) qui rend cet exposant nul ; s'il n'existe pas, il n'y a pas de terme indépendant.`,
      },
      {
        id: r`$C_n^k = C_{n-1}^{k-1}+C_{n-1}^k$`,
        enonce: r`Énonce la relation de Pascal : $C_n^k = \ldots$ (à l'aide de deux combinaisons de $n-1$ éléments), en précisant pour quels $k$ elle est valable.`,
        corrige: r`$C_n^k = C_{n-1}^{k-1}+C_{n-1}^k$, pour $1 \leq k \leq n-1$.`,
      },
      {
        id: r`$\displaystyle\sum_{k=0}^{n} C_n^k = 2^n$`,
        enonce: r`Que vaut la somme $\displaystyle\sum_{k=0}^{n} C_n^k$ ? Combien de parties possède un ensemble à $n$ éléments ?`,
        corrige: r`$\displaystyle\sum_{k=0}^{n} C_n^k = 2^n$ (on développe $(1+1)^n$) ; un ensemble à $n$ éléments a $2^n$ parties.`,
      },
      {
        id: r`chemins : $C_{m+n}^n$`,
        enonce: r`Sur un quadrillage de $m$ cases de large et $n$ de haut, combien de chemins vont d'un coin au coin opposé en avançant uniquement d'une case vers la droite ou vers le haut ?`,
        corrige: r`$C_{m+n}^n$ : on choisit les $n$ pas vers le haut parmi les $m+n$ pas.`,
      },
      {
        id: r`$(1+\varepsilon)^n \approx 1+n\varepsilon$`,
        enonce: r`Donne une approximation de $(1+\varepsilon)^n$, et la condition pour qu'elle soit bonne.`,
        corrige: r`$(1+\varepsilon)^n \approx 1+n\varepsilon$, valable quand $n\varepsilon$ est petit.`,
      },
    ],
    probabilitehypergeometrique: [
      {
        id: r`$P(k) = \dfrac{C_K^k \times C_{N-K}^{n-k}}{C_N^n}$`,
        enonce: r`Une population de $N$ éléments contient $K$ succès ; on en tire $n$ sans remise. Donne la probabilité d'obtenir exactement $k$ succès.`,
        corrige: r`$P(k) = \dfrac{C_K^k \times C_{N-K}^{n-k}}{C_N^n}$ (loi hypergéométrique).`,
      },
      {
        id: r`séquence exacte : $\dfrac{1}{A_n^p}$`,
        enonce: r`On tire $p$ éléments, sans remise, parmi $n$ éléments distincts. Quelle est la probabilité d'obtenir une séquence précise, imposée à l'avance ?`,
        corrige: r`$\dfrac{1}{n} \times \dfrac{1}{n-1} \times \ldots \times \dfrac{1}{n-p+1} = \dfrac{1}{A_n^p}$.`,
      },
    ],
    binomialesequence: [
      {
        id: r`$P(X=k) = C_n^k \times p^k \times (1-p)^{n-k}$`,
        enonce: r`On répète $n$ épreuves indépendantes dont la probabilité de succès vaut $p$. Donne $P(X=k)$, la probabilité d'obtenir exactement $k$ succès.`,
        corrige: r`$P(X=k) = C_n^k \times p^k \times (1-p)^{n-k}$ (loi binomiale).`,
      },
    ],
  },

  // ── Ch. 8 — Variables aléatoires et lois de probabilités ───────────────────────────────────────
  'variables-aleatoires': {
    variablesdiscretes: [
      {
        id: r`$F(x) = P(X \le x)$`,
        enonce: r`Donne la définition de la fonction de répartition $F$ d'une variable aléatoire $X$, puis $P(a < X \le b)$ et $P(X > a)$ à l'aide de $F$.`,
        corrige: r`$F(x) = P(X \le x)$ ; $P(a < X \le b) = F(b) - F(a)$ et $P(X > a) = 1 - F(a)$.`,
      },
      {
        id: r`$E(X) = \displaystyle\sum_i x_i \times P(X=x_i)$`,
        enonce: r`Une variable aléatoire discrète $X$ prend les valeurs $x_1, \ldots, x_n$. Donne la formule de son espérance $E(X)$.`,
        corrige: r`$E(X) = \displaystyle\sum_{i=1}^{n} x_i \times P(X=x_i)$.`,
      },
      {
        id: r`$V(X) = E(X^2)-[E(X)]^2$`,
        enonce: r`Donne la variance $V(X)$ d'une variable aléatoire discrète à l'aide de $E(X^2)$ et de $E(X)$ (formule de König), puis l'écart-type $\sigma(X)$.`,
        corrige: r`$V(X) = E(X^2)-[E(X)]^2$, avec $E(X^2)=\sum_i x_i^2\,P(X=x_i)$, et $\sigma(X) = \sqrt{V(X)}$.`,
      },
      {
        id: r`$E(aX+b)=aE(X)+b$`,
        enonce: r`$a$ et $b$ sont deux réels. Exprime $E(aX+b)$, $V(aX+b)$ et $\sigma(aX+b)$ à l'aide de $E(X)$, $V(X)$ et $\sigma(X)$.`,
        corrige: r`$E(aX+b) = a\,E(X)+b$ ; $V(aX+b) = a^2\,V(X)$ ; $\sigma(aX+b) = |a|\,\sigma(X)$.`,
      },
      {
        id: r`$E(X) = nK/N$`,
        enonce: r`On tire $n$ éléments sans remise dans une population de $N$ éléments dont $K$ sont des succès ; $X$ compte les succès (loi hypergéométrique). Que vaut $E(X)$ ?`,
        corrige: r`$E(X) = \dfrac{nK}{N}$.`,
      },
      {
        id: r`$E(X) = \dfrac{n+1}{2} \quad V(X) = \dfrac{n^2-1}{12}$`,
        enonce: r`$X$ suit la loi uniforme discrète sur les valeurs $1, 2, \ldots, n$ (toutes de probabilité $\dfrac{1}{n}$). Donne $E(X)$ et $V(X)$.`,
        corrige: r`$E(X) = \dfrac{n+1}{2}$ et $V(X) = \dfrac{n^2-1}{12}$ (pour les valeurs $1, 2, \ldots, n$ seulement).`,
      },
    ],
    loibinomiale: [
      {
        id: r`$P(X=k) = C(n,k) \times p^k \times (1-p)^{n-k}$`,
        enonce: r`$X$ suit la loi binomiale $\mathcal{B}(n\,;p)$. Donne $P(X=k)$, pour $k = 0, 1, \ldots, n$.`,
        corrige: r`$P(X=k) = C_n^k \times p^k \times (1-p)^{n-k}$.`,
      },
      {
        id: r`$E(X) = np \quad V(X) = np(1-p)$`,
        enonce: r`Donne l'espérance, la variance et l'écart-type d'une variable aléatoire $X\sim\mathcal{B}(n\,;p)$.`,
        corrige: r`$E(X) = np$, $V(X) = np(1-p)$ et $\sigma(X) = \sqrt{np(1-p)}$.`,
      },
      {
        id: r`$n > \dfrac{\ln(1-\text{seuil})}{\ln(1-p)}$`,
        enonce: r`Chaque épreuve réussit avec la probabilité $p$, indépendamment des autres. Quelle inégalité doit vérifier le nombre $n$ d'épreuves pour que la probabilité d'obtenir au moins un succès dépasse un seuil $s$ ?`,
        corrige: r`$1-(1-p)^n > s \iff n > \dfrac{\ln(1-s)}{\ln(1-p)}$ (le sens change car $\ln(1-p)<0$ ; on prend le plus petit entier qui convient).`,
      },
    ],
    variablecontinue: [
      {
        id: r`$\displaystyle\int_u^v f(t)\,dt = 1$`,
        enonce: r`$f$ est la densité d'une variable aléatoire continue $X$ à valeurs dans $[u\,;v]$. Quelles propriétés vérifie $f$ ? Comment calcule-t-on $P(a \le X \le b)$ ?`,
        corrige: r`$f$ est positive et continue sur $[u\,;v]$, et $\displaystyle\int_u^v f(t)\,dt = 1$ ; $P(a \le X \le b) = \displaystyle\int_a^b f(t)\,dt$.`,
      },
      {
        id: r`$E(X) = \displaystyle\int_u^v t\,f(t)\,dt$`,
        enonce: r`$X$ est une variable aléatoire continue de densité $f$ sur $[u\,;v]$. Donne son espérance et sa variance.`,
        corrige: r`$E(X) = \displaystyle\int_u^v t\,f(t)\,dt$ et $V(X) = \displaystyle\int_u^v t^2 f(t)\,dt - [E(X)]^2$.`,
      },
      {
        id: r`fonction de répartition continue`,
        enonce: r`$X$ est une variable aléatoire continue de densité $f$ et de fonction de répartition $F$. Que vaut $P(X=a)$ ? Exprime $P(a < X < b)$ à l'aide de $F$, et donne le lien entre $F$ et $f$.`,
        corrige: r`$P(X=a) = 0$ ; $P(a < X < b) = P(a \le X \le b) = F(b) - F(a)$ ; $F' = f$ (là où $F$ est dérivable).`,
      },
    ],
    discreteoucontinue: [
      {
        id: r`somme ou intégrale`,
        enonce: r`Comment calcule-t-on l'espérance d'une variable aléatoire discrète ? Et celle d'une variable aléatoire continue de densité $f$ sur $[u\,;v]$ ?`,
        corrige: r`Discrète : $E(X) = \displaystyle\sum_i x_i\,P(X=x_i)$ (une somme). Continue : $E(X) = \displaystyle\int_u^v t\,f(t)\,dt$ (une intégrale).`,
      },
    ],
    loiuniformecontinue: [
      {
        id: r`$P(c \le X \le d) = \dfrac{d-c}{b-a}$`,
        enonce: r`$X$ suit la loi uniforme continue sur $[a\,;b]$. Donne sa densité, puis $P(c \le X \le d)$ pour $[c\,;d]$ contenu dans $[a\,;b]$.`,
        corrige: r`Densité $f(t) = \dfrac{1}{b-a}$ sur $[a\,;b]$ ; $P(c \le X \le d) = \dfrac{d-c}{b-a}$.`,
      },
      {
        id: r`$E(X) = \dfrac{a+b}{2} \quad V(X) = \dfrac{(b-a)^2}{12}$`,
        enonce: r`Donne l'espérance, la variance et l'écart-type d'une variable aléatoire qui suit la loi uniforme continue sur $[a\,;b]$.`,
        corrige: r`$E(X) = \dfrac{a+b}{2}$, $V(X) = \dfrac{(b-a)^2}{12}$ et $\sigma(X) = \dfrac{b-a}{\sqrt{12}}$.`,
      },
      {
        id: r`retrouver $a$ et $b$`,
        enonce: r`$X$ suit la loi uniforme continue sur $[a\,;b]$, et l'on connaît $E(X)$ et $V(X)$. Quelles relations donnent $a+b$ et $b-a$ ?`,
        corrige: r`$a+b = 2E(X)$ et $b-a = \sqrt{12\,V(X)}$.`,
      },
    ],
    loinormale: [
      {
        id: r`$Z = \dfrac{X-\mu}{\sigma}$`,
        enonce: r`$X$ suit la loi normale $\mathcal{N}(\mu\,;\sigma)$, de moyenne $\mu$ et d'écart-type $\sigma$. Quelle variable $Z$ suit la loi normale centrée réduite ? Comment revient-on d'une valeur $z$ à la valeur $x$ correspondante ?`,
        corrige: r`$Z = \dfrac{X-\mu}{\sigma}$ ; retour : $x = \mu + z \times \sigma$.`,
      },
      {
        id: r`$\Phi(-z) = 1-\Phi(z)$`,
        enonce: r`$\Phi$ est la fonction de répartition de la loi normale centrée réduite : $\Phi(z) = P(Z \le z)$. Exprime $\Phi(-z)$ et $P(Z \ge z)$ à l'aide de $\Phi(z)$.`,
        corrige: r`$\Phi(-z) = 1-\Phi(z)$ (symétrie de la courbe en cloche) et $P(Z \ge z) = 1-\Phi(z)$.`,
      },
      {
        id: r`$P(a \le Z \le b) = \Phi(b)-\Phi(a)$`,
        enonce: r`$Z\sim\mathcal{N}(0\,;1)$. Exprime à l'aide de $\Phi$ : $P(a \le Z \le b)$, $P(0 \le Z \le t)$ pour $t>0$, et $P(-k \le Z \le k)$ pour $k>0$.`,
        corrige: r`$P(a \le Z \le b) = \Phi(b)-\Phi(a)$ ; $P(0 \le Z \le t) = \Phi(t)-0{,}5$ ; $P(-k \le Z \le k) = 2\Phi(k)-1$.`,
      },
      {
        id: r`règle empirique`,
        enonce: r`$X\sim\mathcal{N}(\mu\,;\sigma)$. Énonce la règle empirique : quelle proportion des valeurs se trouve dans $[\mu-\sigma\,;\mu+\sigma]$, dans $[\mu-2\sigma\,;\mu+2\sigma]$ et dans $[\mu-3\sigma\,;\mu+3\sigma]$ ?`,
        corrige: r`Environ $68{,}3\,\%$, $95{,}4\,\%$ et $99{,}7\,\%$ (d'un seul côté hors de l'intervalle : la moitié du reste).`,
      },
      {
        id: r`lire la table de $\Phi$`,
        enonce: r`Comment lit-on $\Phi(z)$ dans la table pour $z = 1{,}23$ ? Et comment lit-on la table « à l'envers », quand on connaît $\Phi(z)$ et qu'on cherche $z$ ?`,
        corrige: r`Ligne $1{,}2$, colonne $0{,}03$ ($z$ arrondi au centième). À l'envers : la case dont la valeur est la plus proche, puis on lit $z$ en marge ; si $\Phi(z) < 0{,}5$, on cherche $1-\Phi(z)$ et on change le signe.`,
      },
    ],
    extensionsbayes: [
      {
        id: r`$P_{totale} = \displaystyle\sum_i q_i \times r_i$`,
        enonce: r`Une population est partagée en catégories $C_1$, $C_2$, $C_3$ ; dans la catégorie $C_i$, un critère $S$ survient avec la probabilité $P(S \mid C_i)$. Donne $P(S)$, puis la probabilité d'appartenir à la catégorie $C_j$ sachant que le critère est survenu.`,
        corrige: r`$P(S) = \displaystyle\sum_i P(C_i)\,P(S\mid C_i)$ et $P(C_j \mid S) = \dfrac{P(C_j)\,P(S\mid C_j)}{P(S)}$ (Bayes).`,
      },
      {
        id: r`$\mu=np \quad \sigma=\sqrt{np(1-p)}$`,
        enonce: r`Par quelle loi normale (donne $\mu$ et $\sigma$) approche-t-on une loi binomiale $\mathcal{B}(n\,;p)$ ? À quelles conditions, dans ce cours ?`,
        corrige: r`$\mu = np$ et $\sigma = \sqrt{np(1-p)}$, si $n > 30$ et $0{,}3 < p < 0{,}7$.`,
      },
      {
        id: r`correction de continuité`,
        enonce: r`$X\sim\mathcal{B}(n\,;p)$ est approchée par la loi normale de paramètres $\mu$ et $\sigma$. Avec la correction de continuité, comment estime-t-on $P(X \le k)$ et $P(X \ge k)$ ?`,
        corrige: r`$P(X \le k) \approx \Phi\!\left(\dfrac{k+0{,}5-\mu}{\sigma}\right)$ et $P(X \ge k) \approx 1-\Phi\!\left(\dfrac{k-0{,}5-\mu}{\sigma}\right)$.`,
      },
    ],
    loipoisson: [
      {
        id: r`$P(X=k) = e^{-\lambda}\dfrac{\lambda^k}{k!} \quad E(X)=V(X)=\lambda$`,
        enonce: r`$X$ suit la loi de Poisson de paramètre $\lambda$. Donne $P(X=k)$, $E(X)$ et $V(X)$.`,
        corrige: r`$P(X=k) = e^{-\lambda}\dfrac{\lambda^k}{k!}$ pour tout entier $k \ge 0$ ; $E(X) = V(X) = \lambda$.`,
      },
      {
        id: r`$\lambda=np$`,
        enonce: r`Par quelle loi de Poisson approche-t-on une loi binomiale $\mathcal{B}(n\,;p)$ ? À quelles conditions, dans ce cours ?`,
        corrige: r`Par la loi de Poisson de paramètre $\lambda = np$, si $n \ge 30$, $p \le 0{,}1$ et $np \le 15$.`,
      },
      {
        id: r`récurrence de Poisson`,
        enonce: r`$X$ suit la loi de Poisson de paramètre $\lambda$. Comment calcule-t-on $P(X=k)$ à partir de $P(X=k-1)$ ? Quelle est la valeur la plus probable de $X$ ?`,
        corrige: r`$P(X=k) = P(X=k-1) \times \dfrac{\lambda}{k}$ ($k \ge 1$) ; la valeur la plus probable est le plus grand entier $k \le \lambda$ (deux valeurs, $\lambda-1$ et $\lambda$, si $\lambda$ est entier).`,
      },
      {
        id: r`$\lambda = -\ln P(X=0)$`,
        enonce: r`$X$ suit une loi de Poisson de paramètre $\lambda$ inconnu, et l'on connaît $P(X=0)$. Comment retrouve-t-on $\lambda$ ?`,
        corrige: r`$P(X=0) = e^{-\lambda}$, donc $\lambda = -\ln P(X=0)$.`,
      },
    ],
  },

  // ── Ch. 9 — Lieux géométriques ─────────────────────────────────────────────────────────────────
  'lieux-geometriques': {
    'points-droites-remarquables': [
      {
        id: r`$m = -a/b$`,
        enonce: r`Quelle est la pente de la droite d'équation $ax+by+c=0$, si $b \neq 0$ ?`,
        corrige: r`$m = -\dfrac{a}{b}$.`,
      },
      {
        id: r`$a_1b_2-a_2b_1=0$`,
        enonce: r`On donne les droites $a_1x+b_1y+c_1=0$ et $a_2x+b_2y+c_2=0$. Quelle condition sur leurs coefficients traduit qu'elles sont parallèles ? Qu'elles sont perpendiculaires ?`,
        corrige: r`Parallèles : $a_1b_2-a_2b_1=0$ (ou $m_1=m_2$). Perpendiculaires : $a_1a_2+b_1b_2=0$ (ou $m_1 \cdot m_2=-1$).`,
      },
      {
        id: 'angle-deux-droites',
        enonce: r`Deux droites sécantes ont pour pentes $m_1$ et $m_2$, avec $1+m_1m_2\neq0$. Donne la tangente de l'angle aigu $\theta$ qu'elles forment. Que se passe-t-il si $1+m_1m_2=0$ ?`,
        corrige: r`$\tan\theta=\left|\dfrac{m_2-m_1}{1+m_1m_2}\right|$ ; si $1+m_1m_2=0$, les droites sont perpendiculaires ($\theta=90^\circ$).`,
      },
      {
        id: r`$dist(P;d) = \dfrac{|ax_P+by_P+c|}{\sqrt{a^2+b^2}}$`,
        enonce: r`Dans un repère orthonormé, donne la distance du point $P(x_P\,;y_P)$ à la droite $d \equiv ax+by+c=0$.`,
        corrige: r`$\mathrm{dist}(P\,;d) = \dfrac{|ax_P+by_P+c|}{\sqrt{a^2+b^2}}$.`,
      },
      {
        id: 'centre-gravite',
        enonce: r`Donne les coordonnées du centre de gravité $G$ d'un triangle $ABC$ en fonction de celles des sommets. Où se trouve $G$ sur chaque médiane ?`,
        corrige: r`$G=\dfrac{A+B+C}{3}$ (moyenne des coordonnées) ; il est aux deux tiers de chaque médiane en partant du sommet.`,
      },
      {
        id: 'hauteur-mediatrice',
        enonce: r`Dans un triangle $ABC$, quelle normale et quel point utilise-t-on pour écrire l'équation de la hauteur issue de $A$ ? Et celle de la médiatrice de $[BC]$ ?`,
        corrige: r`Les deux ont pour normale $\overrightarrow{BC}$ ; la hauteur passe par $A$, la médiatrice par le milieu de $[BC]$.`,
      },
      {
        id: 'droite-euler',
        enonce: r`$O$ est le centre du cercle circonscrit, $G$ le centre de gravité et $H$ l'orthocentre d'un triangle $ABC$. Quelle relation vectorielle lie $\overrightarrow{OH}$ et $\overrightarrow{OG}$ ? Exprime $H$ à l'aide de $A$, $B$, $C$ et $O$.`,
        corrige: r`$\overrightarrow{OH}=3\,\overrightarrow{OG}$ (droite d'Euler), donc $H=A+B+C-2O$.`,
      },
      {
        id: r`$A = B'+C'-A'$`,
        enonce: r`$A'$, $B'$, $C'$ sont les milieux respectifs de $[BC]$, $[CA]$ et $[AB]$. Comment retrouve-t-on le sommet $A$ à partir de ces trois milieux ?`,
        corrige: r`$A = B'+C'-A'$ (coordonnées ; de même $B = A'+C'-B'$ et $C = A'+B'-C'$).`,
      },
      {
        id: r`$\dfrac{AI}{IC} = \dfrac{AB}{BC}$`,
        enonce: r`Dans le triangle $ABC$, la bissectrice issue de $B$ coupe $[AC]$ en $I$. À quel rapport de longueurs est égal $\dfrac{AI}{IC}$ ? Donne les coordonnées de $I$.`,
        corrige: r`$\dfrac{AI}{IC} = \dfrac{AB}{BC}$, et $I=\dfrac{BC\times A+AB\times C}{AB+BC}$.`,
      },
      {
        id: 'aire-triangle',
        enonce: r`Donne l'aire du triangle $ABC$ à l'aide des composantes des vecteurs $\overrightarrow{AB}$ et $\overrightarrow{AC}$.`,
        corrige: r`$\text{aire}(ABC)=\dfrac{1}{2}\,|x_{AB}\,y_{AC}-y_{AB}\,x_{AC}|$.`,
      },
      {
        id: r`$Q = 2H-P$`,
        enonce: r`$H$ est le pied de la perpendiculaire menée du point $P$ à la droite $d$. Exprime le symétrique $Q$ de $P$ par rapport à $d$ à l'aide de $P$ et de $H$.`,
        corrige: r`$Q = 2H-P$ ($H$ est le milieu de $[PQ]$).`,
      },
    ],
    cercles: [
      {
        id: r`$x^2+y^2+Dx+Ey+F=0$`,
        enonce: r`Donne la forme générale de l'équation d'un cercle, puis son centre et son rayon en fonction des coefficients de cette équation.`,
        corrige: r`$x^2+y^2+Dx+Ey+F=0$ ; centre $\left(-\dfrac{D}{2}\,;-\dfrac{E}{2}\right)$, rayon $\sqrt{\dfrac{D^2}{4}+\dfrac{E^2}{4}-F}$.`,
      },
      {
        id: 'cercle-point-vide',
        enonce: r`On met $m(x^2+y^2)+Dx+Ey+F=0$ ($m\neq0$) sous la forme $\left(x+\dfrac{D}{2m}\right)^2+\left(y+\dfrac{E}{2m}\right)^2=\rho$. Que vaut $\rho$ ? Selon le signe de $\rho$, quelle est la nature de l'ensemble ?`,
        corrige: [r`$\rho=\dfrac{D^2+E^2}{4m^2}-\dfrac{F}{m}$.`, r`$\rho>0$ : un cercle de rayon $\sqrt{\rho}$ ; $\rho=0$ : un seul point ; $\rho<0$ : l'ensemble vide.`],
      },
      {
        id: 'deux-points-rayon',
        enonce: r`Combien existe-t-il de cercles de rayon $r$ passant par deux points distincts $A$ et $B$ ? Distingue les cas selon $2r$ et $AB$.`,
        corrige: r`Deux si $2r>AB$ (centres symétriques par rapport à $(AB)$, sur la médiatrice), un si $2r=AB$ (centre au milieu de $[AB]$), aucun si $2r<AB$.`,
      },
      {
        id: 'corde',
        enonce: r`Un cercle de centre $\Omega$ et de rayon $r$ découpe sur une droite $d$ une corde de longueur $L$. Quelle relation lie $r$, $L$ et la distance $\delta$ de $\Omega$ à $d$ ?`,
        corrige: r`$r^2=\delta^2+\left(\dfrac{L}{2}\right)^2$.`,
      },
      {
        id: 'tangent-axe',
        enonce: r`Un cercle est tangent à l'axe des abscisses au point $(b\,;0)$ et passe par $A(x_A\,;y_A)$, avec $y_A>0$. Donne son centre en fonction de son rayon $r$, puis $r$.`,
        corrige: r`Centre $(b\,;r)$ et $r=\dfrac{(b-x_A)^2+y_A^2}{2y_A}$.`,
      },
      {
        id: r`incentre $= \dfrac{aA+bB+cC}{a+b+c}$`,
        enonce: r`Dans le triangle $ABC$, on note $a = BC$, $b = CA$ et $c = AB$. Donne le centre du cercle inscrit (l'incentre) en fonction des sommets et de ces longueurs, ainsi que son rayon.`,
        corrige: r`Incentre $= \dfrac{aA+bB+cC}{a+b+c}$ (chaque sommet pondéré par le côté opposé) ; rayon $=\dfrac{\text{aire}}{\text{demi-périmètre}}$.`,
      },
      {
        id: 'exinscrit',
        enonce: r`Combien de cercles sont tangents aux trois droites qui portent les côtés d'un triangle $ABC$ ? Donne le centre et le rayon du cercle exinscrit opposé à $A$ ($a=BC$, $b=CA$, $c=AB$, $p$ demi-périmètre).`,
        corrige: r`Quatre : le cercle inscrit et trois exinscrits. $J_A=\dfrac{-aA+bB+cC}{-a+b+c}$, rayon $\dfrac{\text{aire}}{p-a}$.`,
      },
      {
        id: 'position-droite-cercle',
        enonce: r`Un cercle a pour centre $\Omega$ et pour rayon $r$ ; $\delta$ est la distance de $\Omega$ à une droite $d$. Combien la droite et le cercle ont-ils de points communs, selon $\delta$ et $r$ ?`,
        corrige: r`Aucun si $\delta>r$, un seul (tangente) si $\delta=r$, deux (sécante) si $\delta<r$.`,
      },
      {
        id: 'tangente-en-T',
        enonce: r`Donne une équation de la tangente au cercle de centre $\Omega(x_\Omega\,;y_\Omega)$ en son point $T(x_T\,;y_T)$.`,
        corrige: r`$(x_T-x_\Omega)(x-x_T)+(y_T-y_\Omega)(y-y_T)=0$ (normale $\overrightarrow{\Omega T}$).`,
      },
      {
        id: r`$PT = \sqrt{OP^2-r^2}$`,
        enonce: r`Depuis un point $P$ extérieur au cercle de centre $O$ et de rayon $r$, on mène une tangente qui touche le cercle en $T$. Donne la longueur $PT$.`,
        corrige: r`$PT = \sqrt{OP^2-r^2}$ (Pythagore dans le triangle $OTP$, rectangle en $T$).`,
      },
    ],
    'lieux-elimination': [
      {
        id: r`$|x-p|+|y-q|=k$`,
        enonce: r`Quel est le lieu des points $(x\,;y)$ tels que $|x-p|+|y-q|=k$, avec $k > 0$ ? Et tels que $|x-p|-|y-q|=k$ ?`,
        corrige: r`$|x-p|+|y-q|=k$ : un losange de sommets $(p\pm k\,;q)$ et $(p\,;q\pm k)$. $|x-p|-|y-q|=k$ : quatre demi-droites (lieu non borné).`,
      },
      {
        id: r`$PA^2+PB^2 = 2\,PM^2+\dfrac{AB^2}{2}$`,
        enonce: r`$M$ est le milieu de $[AB]$. Énonce le théorème de la médiane : pour tout point $P$, $PA^2+PB^2 = \ldots$ Quel est alors le seuil du lieu $PA^2+PB^2=k$ ?`,
        corrige: r`$PA^2+PB^2 = 2\,PM^2+\dfrac{AB^2}{2}$ ; seuil $\dfrac{AB^2}{2}$ (cercle de centre $M$ au-dessus, le point $M$ au seuil, vide en dessous).`,
      },
      {
        id: 'difference-carres',
        enonce: r`Quel est le lieu des points $P$ tels que $PA^2-PB^2=k$ ($A\neq B$, $k$ réel) ?`,
        corrige: r`Une droite perpendiculaire à $(AB)$ ; pour $A(-a\,;0)$ et $B(a\,;0)$, c'est $x=\dfrac{k}{4a}$ (la médiatrice si $k=0$).`,
      },
      {
        id: r`$PA^2 = k\cdot PB^2$`,
        enonce: r`Pour $A(-a\,;0)$ et $B(a\,;0)$, quel est le lieu des points $P$ tels que $PA^2 = k\cdot PB^2$, avec $k > 0$ ? Distingue $k = 1$ et $k \neq 1$, et donne le centre et le rayon dans le second cas.`,
        corrige: [r`Si $k = 1$ : la médiatrice de $[AB]$.`, r`Si $k \neq 1$ : le cercle d'Apollonius, de centre $\left(\dfrac{a(k+1)}{k-1}\,;0\right)$ et de rayon $\dfrac{2a\sqrt{k}}{|k-1|}$.`],
      },
      {
        id: 'bissectrices-lieu',
        enonce: r`Écris l'équation qui caractérise les points équidistants des droites sécantes $a_1x+b_1y+c_1=0$ et $a_2x+b_2y+c_2=0$. Quelle est la nature de ce lieu ?`,
        corrige: r`$\dfrac{a_1x+b_1y+c_1}{\sqrt{a_1^2+b_1^2}}=\pm\dfrac{a_2x+b_2y+c_2}{\sqrt{a_2^2+b_2^2}}$ : deux droites perpendiculaires (les bissectrices).`,
      },
      {
        id: 'angle-droit-lieu',
        enonce: r`Quel est le lieu des points $P$ tels que l'angle $\widehat{APB}$ est droit ($A\neq B$) ?`,
        corrige: r`Le cercle de diamètre $[AB]$, privé de $A$ et de $B$.`,
      },
      {
        id: 'carre-octogone',
        enonce: r`Pour le carré $[-c\,;c]^2$, on cherche le lieu des points dont la somme des distances aux quatre droites qui portent les côtés vaut $k$. Quel est le seuil, et quelle est la nature du lieu selon $k$ ?`,
        corrige: r`Seuil $4c$ : vide si $k<4c$, tout le carré plein si $k=4c$, un octogone si $k>4c$.`,
      },
    ],
    'methode-generatrices': [
      {
        id: 'statuts-morceaux',
        enonce: r`Dans la méthode des génératrices, que signifie qu'un morceau de l'équation factorisée est singulier ? parasite ? propre ?`,
        corrige: r`Singulier : les deux génératrices coïncident pour une valeur précise de $\alpha$. Parasite : aucune valeur de $\alpha$ ne l'atteint. Propre : il fait réellement partie du lieu (à restreindre ensuite).`,
      },
      {
        id: 'tan-angle-double',
        enonce: r`Exprime $\tan 2\alpha$ à l'aide de $t=\tan\alpha$ (formule utilisée quand une génératrice fait un angle $2\alpha$).`,
        corrige: r`$\tan 2\alpha=\dfrac{2t}{1-t^2}$, pour $t^2\neq1$.`,
      },
    ],
    'lieu-parametrique': [
      {
        id: r`$x=f(t), \ y=g(t)$`,
        enonce: r`Un lieu est donné par une représentation paramétrique $x = f(t)$, $y = g(t)$. Comment en obtient-on une équation cartésienne ? Quelles identités utilise-t-on quand $f$ et $g$ font intervenir $\cos t$, $\sin t$ ou $\cos 2t$ ?`,
        corrige: r`On élimine $t$ grâce à une identité entre $f(t)$ et $g(t)$ : $\cos^2 t+\sin^2 t=1$, ou $\cos 2t=2\cos^2t-1$ ; puis on décrit la partie réellement balayée.`,
      },
      {
        id: r`$x^{2/3}+y^{2/3}=1$`,
        enonce: r`Donne une équation cartésienne de l'astroïde définie par $x = \cos^3\lambda$, $y = \sin^3\lambda$, valable dans les quatre quadrants.`,
        corrige: r`$|x|^{2/3}+|y|^{2/3}=1$, ou $\left(\sqrt[3]{x}\right)^2+\left(\sqrt[3]{y}\right)^2=1$ (car $\sqrt[3]{x} = \cos\lambda$ et $\sqrt[3]{y} = \sin\lambda$).`,
      },
    ],
  },

  // ── Ch. 10 — Les coniques ──────────────────────────────────────────────────────────────────────
  coniques: {
    identifier: [
      {
        id: r`$y^2=2px$`,
        enonce: r`Une parabole a pour foyer $F$ et pour directrice $d$. Qu'appelle-t-on son paramètre $p$ ? Donne l'équation réduite de la parabole d'axe focal $Ox$, de sommet l'origine et ouverte vers les $x$ positifs, ainsi que son foyer et sa directrice.`,
        corrige: r`$p = \text{dist}(F\,;d)$ ; $y^2=2px$, de foyer $F\left(\dfrac{p}{2}\,;0\right)$ et de directrice $d \equiv x=-\dfrac{p}{2}$.`,
      },
      {
        id: r`$y^2=\pm2px \qquad x^2=\pm2py$`,
        enonce: r`Donne le foyer et la directrice de la parabole $x^2=-2py$ ($p>0$). Qu'est-ce qui, dans les équations $y^2=\pm2px$ et $x^2=\pm2py$, indique l'axe focal et le sens d'ouverture ?`,
        corrige: r`$x^2=-2py$ : foyer $F\left(0\,;-\dfrac{p}{2}\right)$, directrice $y=\dfrac{p}{2}$. La variable au carré donne l'axe focal ($y^2$ : axe $Ox$ ; $x^2$ : axe $Oy$) ; le signe donne le sens d'ouverture.`,
      },
      {
        id: r`$|PF|+|PF'|=2a$`,
        enonce: r`Donne la définition d'une ellipse de foyers $F$ et $F'$, avec $|FF'| = 2c$. À quelle condition sur $a$ et $c$ existe-t-elle ? Que décrit la même condition si $a=c$ ?`,
        corrige: r`C'est l'ensemble des points $P$ tels que $|PF|+|PF'|=2a$ ; elle existe si et seulement si $a > c$. Si $a=c$, on obtient le segment $[FF']$.`,
      },
      {
        id: r`$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$`,
        enonce: r`Donne l'équation réduite d'une ellipse de foyers $(\pm c\,;0)$, la relation entre $a$, $b$ et $c$, et ses quatre sommets. Que devient l'équation si les foyers sont $(0\,;\pm c)$ ?`,
        corrige: r`$\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ avec $b^2=a^2-c^2$ ; sommets $(\pm a\,;0)$ et $(0\,;\pm b)$. Foyers $(0\,;\pm c)$ : $\dfrac{y^2}{a^2}+\dfrac{x^2}{b^2}=1$ ($a^2$ reste le plus grand dénominateur).`,
      },
      {
        id: r`$\big||PF|-|PF'|\big|=2a$`,
        enonce: r`Donne la définition d'une hyperbole de foyers $F$ et $F'$, avec $|FF'| = 2c$. À quelle condition sur $a$ et $c$ existe-t-elle ?`,
        corrige: r`C'est l'ensemble des points $P$ tels que $\big||PF|-|PF'|\big|=2a$ ; elle existe si et seulement si $c > a$ (deux branches).`,
      },
      {
        id: r`$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$`,
        enonce: r`Donne l'équation réduite d'une hyperbole de foyers $(\pm c\,;0)$, la relation entre $a$, $b$ et $c$, ses sommets et ses asymptotes.`,
        corrige: r`$\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ avec $b^2=c^2-a^2$ ; sommets $(\pm a\,;0)$ ; asymptotes $y=\pm\dfrac{b}{a}x$.`,
      },
      {
        id: r`hyperbole d'axe focal vertical`,
        enonce: r`Donne l'équation réduite, les sommets et les asymptotes d'une hyperbole de foyers $(0\,;\pm c)$.`,
        corrige: r`$\dfrac{y^2}{a^2}-\dfrac{x^2}{b^2}=1$ avec $b^2=c^2-a^2$ ; sommets $(0\,;\pm a)$ ; asymptotes $y=\pm\dfrac{a}{b}x$.`,
      },
      {
        id: r`$c=a\sqrt{2} \implies x^2-y^2=a^2$`,
        enonce: r`Qu'appelle-t-on hyperbole équilatère ? Donne son équation réduite, ses asymptotes, et son équation dans le repère de ses asymptotes.`,
        corrige: r`Une hyperbole à asymptotes perpendiculaires : $c = a\sqrt{2}$ ($b = a$), d'équation $x^2-y^2=a^2$, d'asymptotes $y=\pm x$ ; dans le repère de ses asymptotes : $XY=\dfrac{a^2}{2}$.`,
      },
      {
        id: r`$xy=k$`,
        enonce: r`L'hyperbole $xy=k$ ($k>0$) a pour asymptotes les axes du repère. Donne son demi-axe $a$, ses sommets et ses foyers.`,
        corrige: r`$a^2=2k$, donc $a=\sqrt{2k}$ ; sommets $(\sqrt{k}\,;\sqrt{k})$ et $(-\sqrt{k}\,;-\sqrt{k})$ ; foyers $(\sqrt{2k}\,;\sqrt{2k})$ et $(-\sqrt{2k}\,;-\sqrt{2k})$, à la distance $c=2\sqrt{k}$ du centre.`,
      },
    ],
    excentricite: [
      {
        id: r`$e = c/a$`,
        enonce: r`Donne l'excentricité $e$ d'une ellipse ou d'une hyperbole en fonction de $a$ et $c$, et la propriété foyer–directrice qui la fait apparaître. Comment la valeur de $e$ distingue-t-elle les coniques ?`,
        corrige: r`$e = \dfrac{c}{a}$ ; pour tout point $P$, $\dfrac{\text{dist}(P\,;F)}{\text{dist}(P\,;d)} = e$. $e<1$ : ellipse ; $e=1$ : parabole ; $e>1$ : hyperbole ; cercle : $e = 0$, sans directrice.`,
      },
      {
        id: r`$x=\pm a^2/c$`,
        enonce: r`Donne les équations des directrices d'une ellipse ou d'une hyperbole centrée à l'origine, de foyers $(\pm c\,;0)$. Pour laquelle des deux les directrices passent-elles entre les sommets ?`,
        corrige: r`$x=\pm\dfrac{a^2}{c}$. Pour l'hyperbole ($c>a$, donc $\dfrac{a^2}{c}<a$) ; pour l'ellipse, elles sont à l'extérieur.`,
      },
      {
        id: r`équation depuis foyer, directrice et excentricité`,
        enonce: r`On donne le foyer $F(x_F\,;y_F)$, la directrice $d\equiv ux+vy+w=0$ et l'excentricité $e$ d'une conique. Quelle égalité, sans racine ni valeur absolue, donne son équation ?`,
        corrige: r`$(x-x_F)^2+(y-y_F)^2=e^2\cdot\dfrac{(ux+vy+w)^2}{u^2+v^2}$ (ne pas oublier le carré de $e$).`,
      },
      {
        id: r`$(y-k)^2=2p(x-h)$`,
        enonce: r`Donne le sommet, le foyer et la directrice de la parabole $(y-k)^2=2p(x-h)$, avec $p>0$.`,
        corrige: r`Sommet $(h\,;k)$, foyer $\left(h+\dfrac{p}{2}\,;k\right)$, directrice $x=h-\dfrac{p}{2}$.`,
      },
      {
        id: r`cas dégénérés`,
        enonce: r`Après complétion des carrés, une équation s'écrit $\alpha X^2+\beta Y^2=\gamma$ avec $\alpha>0$ et $\beta>0$. Selon le signe de $\gamma$, que décrit-elle ? Et $\alpha X^2-\beta Y^2=0$ ?`,
        corrige: r`$\gamma>0$ : une ellipse ; $\gamma=0$ : un seul point (le centre) ; $\gamma<0$ : l'ensemble vide. $\alpha X^2-\beta Y^2=0$ : deux droites sécantes $Y=\pm\sqrt{\dfrac{\alpha}{\beta}}\,X$.`,
      },
    ],
    airefocale: [
      {
        id: r`$|PF|=a-ex$`,
        enonce: r`$P(x\,;y)$ est un point de l'ellipse $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$, de foyers $F(c\,;0)$ et $F'(-c\,;0)$. Exprime ses rayons focaux en fonction de $x$, et donne l'intervalle dans lequel varie $|PF|$.`,
        corrige: r`$|PF|=a-ex$ et $|PF'|=a+ex$, avec $e=\dfrac{c}{a}$ ; $a-c\leq|PF|\leq a+c$.`,
      },
      {
        id: r`périhélie et aphélie`,
        enonce: r`Une orbite elliptique a le Soleil pour foyer. Exprime le demi-grand axe $a$ et l'excentricité $e$ en fonction de la distance au périhélie $d_p$ et de la distance à l'aphélie $d_a$.`,
        corrige: r`$d_p=a-c$ et $d_a=a+c$, donc $a=\dfrac{d_p+d_a}{2}$, $c=\dfrac{d_a-d_p}{2}$ et $e=\dfrac{d_a-d_p}{d_a+d_p}$.`,
      },
      {
        id: r`$|PF'| = \dfrac{2a}{k+1} \qquad |PF| = \dfrac{2ak}{k+1}$`,
        enonce: r`$P$ est un point d'une ellipse de foyers $F$ et $F'$, et $k = \dfrac{|PF|}{|PF'|}\geq1$. Exprime les rayons focaux $|PF|$ et $|PF'|$ en fonction de $a$ et de $k$. Jusqu'à quelle valeur de $k$ un tel point existe-t-il ?`,
        corrige: r`$|PF| = \dfrac{2ak}{k+1}$ et $|PF'| = \dfrac{2a}{k+1}$ ; il existe si $|PF|\leq a+c$, c'est-à-dire $k\leq\dfrac{a+c}{a-c}$.`,
      },
      {
        id: r`$\text{aire} = \dfrac{1}{2}|PF||PF'|\sin(\widehat{FPF'})$`,
        enonce: r`Comment calcule-t-on l'aire du triangle focal $FPF'$ à partir des rayons focaux et de l'angle $\widehat{FPF'}$ ? Comment obtient-on le cosinus de cet angle ($|FF'| = 2c$) ?`,
        corrige: [
          r`$\text{aire} = \dfrac{1}{2}|PF|\,|PF'|\sin(\widehat{FPF'})$,`,
          r`avec $\cos(\widehat{FPF'}) = \dfrac{|PF|^2+|PF'|^2-4c^2}{2|PF|\,|PF'|}$ (loi des cosinus).`,
        ],
      },
      {
        id: r`$b^2\tan\dfrac{\theta}{2}$`,
        enonce: r`Exprime l'aire du triangle focal $FPF'$ d'une ellipse de demi-petit axe $b$ en fonction de l'angle $\theta=\widehat{FPF'}$.`,
        corrige: r`$\text{aire}=b^2\tan\dfrac{\theta}{2}$.`,
      },
    ],
    intersection: [
      {
        id: r`substituer la droite dans la conique → équation du 2e degré`,
        enonce: r`Comment détermine-t-on la position d'une droite par rapport à une conique ? Que dit le signe du discriminant $\Delta$ ? Que se passe-t-il si le coefficient de $x^2$ s'annule ?`,
        corrige: r`On substitue l'équation de la droite dans celle de la conique. Équation du second degré : $\Delta > 0$ sécante (deux points), $\Delta = 0$ tangente, $\Delta < 0$ extérieure. Coefficient de $x^2$ nul (droite parallèle à une asymptote ou à l'axe d'une parabole) : un seul point, sans tangence.`,
      },
    ],
    tangentes: [
      {
        id: r`$\dfrac{xx_P}{a^2} \pm \dfrac{yy_P}{b^2} = 1$`,
        enonce: r`Donne l'équation de la tangente au point $P(x_P\,;y_P)$ de l'ellipse $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$, puis au point $P$ de l'hyperbole $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ (forme dédoublée).`,
        corrige: r`Ellipse : $\dfrac{x\,x_P}{a^2} + \dfrac{y\,y_P}{b^2} = 1$ ; hyperbole : $\dfrac{x\,x_P}{a^2} - \dfrac{y\,y_P}{b^2} = 1$.`,
      },
      {
        id: r`$yy_P=p(x+x_P)$`,
        enonce: r`Donne l'équation de la tangente au point $P(x_P\,;y_P)$ de la parabole $y^2=2px$, et le point où elle coupe l'axe focal.`,
        corrige: r`$y\,y_P=p(x+x_P)$ ; elle coupe l'axe en $T(-x_P\,;0)$.`,
      },
      {
        id: r`$f'(x_P) = -\dfrac{b^2x_P}{a^2y_P}$`,
        enonce: r`Donne la pente de la tangente au point $P(x_P\,;y_P)$, avec $y_P \neq 0$, de l'ellipse $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$, puis de l'hyperbole $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$.`,
        corrige: r`Ellipse : $-\dfrac{b^2x_P}{a^2y_P}$ ; hyperbole : $\dfrac{b^2x_P}{a^2y_P}$.`,
      },
      {
        id: r`$k^2=a^2m^2\pm b^2$`,
        enonce: r`À quelle condition la droite $y=mx+k$ est-elle tangente à l'ellipse $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$ ? À l'hyperbole $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$ ? À la parabole $y^2=2px$ ?`,
        corrige: r`Ellipse : $k^2=a^2m^2+b^2$ ; hyperbole : $k^2=a^2m^2-b^2$ (il faut $|m|>\dfrac{b}{a}$) ; parabole : $k=\dfrac{p}{2m}$ ($m\neq0$).`,
      },
    ],
    optique: [
      {
        id: r`$PF$ et $PF'$ font des angles égaux avec la tangente en $P$`,
        enonce: r`Énonce la propriété optique de l'ellipse et de l'hyperbole de foyers $F$ et $F'$ : que peut-on dire des droites $PF$, $PF'$ et de la tangente en un point $P$ ? Que devient un rayon issu d'un foyer, pour chacune des deux ?`,
        corrige: r`$PF$ et $PF'$ font des angles égaux avec la tangente en $P$. Ellipse : un rayon issu d'un foyer est réfléchi vers l'autre foyer ; hyperbole : il repart comme s'il venait de l'autre foyer.`,
      },
      {
        id: r`$\dfrac{D^2}{16h}$`,
        enonce: r`Une antenne parabolique a un diamètre $D$ et une profondeur $h$. À quelle distance de son sommet se trouve son foyer ?`,
        corrige: r`À $\dfrac{D^2}{16h}$ (la coupe est $x^2=2py$ avec $\left(\dfrac{D}{2}\right)^2=2ph$, et le foyer est à $\dfrac{p}{2}$ du sommet).`,
      },
    ],
  },
}
