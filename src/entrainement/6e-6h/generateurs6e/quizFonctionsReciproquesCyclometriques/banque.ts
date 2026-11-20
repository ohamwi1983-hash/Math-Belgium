/**
 * Couche A — banque de contenu pour "Fonctions réciproques et cyclométriques" (quiz vrai/faux),
 * chapitre 1 du chantier 6e (6h) — 6gen64, porté de plateforme-maths (lot F de l'audit du chapitre).
 * 245 affirmations PRÉ-ÉCRITES (35 par thème, 7 thèmes dans l'ordre des sections du cours), jamais
 * générées procéduralement, voir `core6e/quizFonctionsReciproquesCyclometriques.types.ts`.
 *
 * Portage (audit, lot F) : les 175 affirmations d'origine (5 thèmes) réécrites en fragments KaTeX
 * (`q("…$…$…", réponse, "…")`, découpées par `rt`) ; plus aucune majuscule d'insistance ; les
 * « grands calculs » remplacés par des vérifications rapides (résolution complète de
 * arccos(x² − 1) = arccos(1 − x), racines de arctan(x² − 2) = arctan(x), (f⁻¹)′(−5) de deux façons,
 * simplification de (arcsin(2x − 1))′) ; justification homographique complétée (f⁻¹ = f aussi pour
 * l'identité) ; hypothèses complètes du théorème de la dérivée d'une réciproque. Les affirmations
 * arc∘trig dispersées passent dans un thème ajouté, `compositionsArcTrig` (identités trig∘arc,
 * arc∘trig ramené dans l'image, cours § 2) ; `equationsCyclometriques` gagne les équations
 * « arcfonction = angle » et entre arcfonctions différentes (compatibilité des images, solution
 * parasite) ; `graphiquesCyclometriques` les transformées c + k·arc(mx + n) ; thème ajouté
 * `etudeFonctionCyclometrique` (§ 6). Équilibre : 18 ou 19 vraies sur 35 par thème.
 *
 * Banque générée depuis un texte source (une affirmation par ligne) : ne pas réindenter à la main.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizFonctionsReciproquesCyclometriques } from "../../core6e/quizFonctionsReciproquesCyclometriques.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Affirmation écrite en une seule chaîne `$…$` (texte + KaTeX), découpée en fragments (les
 * fragments texte ne contiennent jamais de `$`). */
function rt(source: string): FragmentConsigne[] {
  return source
    .split(/\$([^$]+)\$/g)
    .map((valeur, i): FragmentConsigne => (i % 2 === 1 ? latex(valeur) : texte(valeur)))
    .filter((f) => f.valeur !== "");
}
function q(enonce: string, reponse: boolean, justification: string): QuestionVraiFaux {
  return { enonce: rt(enonce), reponse, justification: rt(justification) };
}

export const BANQUE_QUIZ_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES: Record<VarianteQuizFonctionsReciproquesCyclometriques, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Section 1 — Injectivité, surjectivité, bijectivité, réciproque
  // ==========================================================================
  injectiviteSurjectiviteBijectivite: [
    q("Une fonction $f$ est injective si deux réels distincts de son domaine ont toujours des images distinctes.", true, "C'est la définition : $f(x_1)=f(x_2) \\implies x_1=x_2$, autrement dit deux entrées différentes ne partagent jamais la même image."),
    q("Une fonction $f$ est surjective sur $B$ si l'image de $f$ est incluse dans $B$.", false, "La surjectivité exige $\\text{Im}(f)=B$ exactement, pas seulement $\\text{Im}(f) \\subset B$ : sinon n'importe quelle fonction serait surjective sur un ensemble $B$ assez grand."),
    q("$f(x)=x^2$ est bijective de $\\mathbb{R}$ dans $\\mathbb{R}$.", false, "$f(1)=f(-1)=1$ : deux réels distincts ont la même image, $f$ n'est même pas injective sur $\\mathbb{R}$."),
    q("Toute fonction bijective possède une réciproque, notée $f^{-1}$.", true, "Une bijection associe à chaque image un seul antécédent : sa relation réciproque est une fonction, qui « défait » $f$."),
    q("$f^{-1}(x)$ et $\\dfrac{1}{f(x)}$ désignent la même chose.", false, "La réciproque « défait » $f$, alors que $\\dfrac{1}{f(x)}$ est l'inverse d'un nombre pour la multiplication : deux notions sans rapport, malgré la notation."),
    q("Si $f$ est injective, il suffit de restreindre son domaine à $\\text{Im}(f)$ pour la rendre bijective.", false, "C'est l'ensemble d'arrivée qu'on restreint à $\\text{Im}(f)$, jamais le domaine : le domaine de $f$ ne change pas."),
    q("Le domaine de $f^{-1}$ est égal au domaine de $f$.", false, "$\\text{dom}(f^{-1})=\\text{Im}(f)$ et $\\text{Im}(f^{-1})=\\text{dom}(f)$ : domaine et image échangent leurs rôles."),
    q("Les graphes de $f$ et de $f^{-1}$ sont symétriques par rapport à la droite d'équation $y=x$.", true, "$(a\\,;b)$ est sur le graphe de $f$ exactement quand $(b\\,;a)$ est sur celui de $f^{-1}$ : échanger abscisse et ordonnée, c'est la symétrie par rapport à $y=x$."),
    q("Une fonction est injective si et seulement si toute droite verticale coupe son graphe en au plus un point.", false, "Le test de la droite verticale vérifie qu'une courbe est le graphe d'une fonction. L'injectivité se lit avec une droite horizontale."),
    q("$f(x)=\\dfrac{5}{x-1}$ est injective sur son domaine.", true, "Si $\\dfrac{5}{a-1}=\\dfrac{5}{b-1}$, alors $a-1=b-1$, donc $a=b$."),
    q("$(f^{-1})^{-1}=f$ pour toute fonction $f$ injective.", true, "La réciproque de la réciproque a le même domaine et les mêmes valeurs que $f$ : c'est $f$ elle-même."),
    q("Si $f$ et $g$ sont injectives et $g=f^{-1}$, alors $f=g^{-1}$.", true, "La relation « être réciproque l'une de l'autre » est symétrique : $y=g(x) \\iff f(y)=x$ se lit dans les deux sens."),
    q("Restreindre le domaine d'une fonction non injective peut la rendre injective.", true, "$x \\mapsto x^2$ n'est pas injective sur $\\mathbb{R}$, mais sa restriction à $\\mathbb{R}^+$ l'est, de réciproque $x \\mapsto \\sqrt{x}$."),
    q("$f(x)=x^3$ doit être restreinte pour posséder une réciproque.", false, "$x^3$ est déjà injective sur $\\mathbb{R}$ : aucune restriction n'est nécessaire, sa réciproque est $\\sqrt[3]{x}$."),
    q("Si $f'(a)$ n'existe pas, alors $f^{-1}$ n'est pas dérivable en $f(a)$.", false, "Le théorème donne une condition suffisante, pas nécessaire : pour $f(x)=\\sqrt[5]{x}$, $f'(0)$ n'existe pas, mais $f^{-1}(x)=x^5$ est dérivable en $0$."),
    q("La réciproque d'une fonction injective $f$ vérifie $f^{-1}(f(x))=x$ pour tout $x$ du domaine de $f$.", true, "C'est la propriété caractéristique de la réciproque : elle défait exactement ce que $f$ a fait."),
    q("Une fonction peut être surjective sans être injective.", true, "$x \\mapsto x^2$ est surjective de $\\mathbb{R}$ sur $\\mathbb{R}^+$, mais pas injective : $f(1)=f(-1)$."),
    q("Si $f$ est continue et strictement monotone sur un intervalle, dérivable en $f^{-1}(x)$ avec $f'(f^{-1}(x)) \\neq 0$, alors $(f^{-1})'(x)=\\dfrac{1}{f'(f^{-1}(x))}$.", true, "C'est le théorème de la dérivée d'une réciproque, avec ses hypothèses complètes."),
    q("Une fonction bijective est nécessairement strictement croissante.", false, "Une fonction strictement décroissante peut tout aussi bien être bijective, comme $x \\mapsto -x$ : c'est la stricte monotonie, dans un sens ou dans l'autre, qui garantit l'injectivité."),
    q("Une fonction strictement monotone sur un intervalle y est injective.", true, "Deux réels distincts $x_1<x_2$ ont alors des images rangées strictement, donc $f(x_1) \\neq f(x_2)$."),
    q("La relation réciproque d'une fonction existe toujours ; ce qui n'est pas automatique, c'est qu'elle soit une fonction.", true, "Écrire « les $y$ de $\\text{dom}(f)$ tels que $f(y)=x$ » ne demande rien. Pour une fonction, il faut un seul $y$ par $x$ : c'est ce que garantit l'injectivité."),
    q("Dans la démonstration « si $f$ est injective, sa relation réciproque est une fonction », l'injectivité fournit l'existence d'un antécédent.", false, "L'existence vient de ce que $x$ est pris dans $\\text{Im}(f)$. L'injectivité ne sert qu'à l'unicité."),
    q("Pour $f(x)=\\dfrac{5}{x-1}$, on a $f^{-1}(x)=1+\\dfrac{5}{x}$, tandis que $\\dfrac{1}{f(x)}=\\dfrac{x-1}{5}$.", true, "Contrôle rapide : $f(0)=-5$ et $1+\\dfrac{5}{-5}=0$. Et $\\dfrac{1}{f(x)}$ est l'inverse de $\\dfrac{5}{x-1}$ : rien à voir avec $f^{-1}$."),
    q("La méthode de permutation consiste, dans $y=f(x)$, à échanger $x$ et $y$, puis à isoler $y$.", true, "C'est le pendant algébrique de la symétrie par rapport à $y=x$, qui échange elle aussi abscisse et ordonnée."),
    q("Pour une fonction homographique $f(x)=\\dfrac{ax+b}{cx+d}$, on a toujours $f^{-1}=f$.", false, "$f^{-1}(x)=\\dfrac{-dx+b}{cx-a}$ ne coïncide avec $f$ que si $a=-d$, ou si $f$ est l'identité $x \\mapsto x$ — jamais en général."),
    q("La réciproque d'une fonction injective est elle-même injective.", true, "Si $f^{-1}(x_1)=f^{-1}(x_2)=y$, alors $f(y)$ vaut à la fois $x_1$ et $x_2$, donc $x_1=x_2$."),
    q("La restriction de $x \\mapsto x^2$ à $\\mathbb{R}^+$ et la fonction $x \\mapsto x^2$ sur $\\mathbb{R}$ sont la même fonction, puisqu'elles ont la même formule.", false, "Une fonction, c'est une formule et un domaine : sur $\\mathbb{R}$, elle n'est pas injective ; sur $\\mathbb{R}^+$, elle l'est. Deux domaines, deux fonctions."),
    q("Le théorème $(f^{-1})'(x)=\\dfrac{1}{f'(f^{-1}(x))}$ est démontré dans le cours, comme tous les autres résultats du chapitre.", false, "C'est le seul résultat du chapitre admis sans démonstration ; on le vérifie sur des cas où les deux membres se calculent séparément."),
    q("Si $f$ est continue et strictement croissante sur $\\mathbb{R}$, avec $f(1)=2$ et $f'(1)=4$, alors $(f^{-1})'(2)=\\dfrac{1}{4}$.", true, "$f^{-1}(2)=1$, et le théorème donne $(f^{-1})'(2)=\\dfrac{1}{f'(1)}=\\dfrac{1}{4}$ : les pentes en $(1\\,;2)$ et en $(2\\,;1)$ sont inverses."),
    q("Appliqué à $g(x)=x^3$, le théorème de la dérivée d'une réciproque donne $(\\sqrt[3]{x})'=\\dfrac{1}{3(\\sqrt[3]{x})^2}$ pour $x \\neq 0$.", true, "$g'(x)=3x^2$, donc $g'(g^{-1}(x))=3(\\sqrt[3]{x})^2$, et le théorème donne l'inverse de ce nombre."),
    q("L'équivalence $y=f^{-1}(x) \\iff f(y)=x$ est valable pour tout réel $x$.", false, "Elle n'a de sens que pour $x \\in \\text{Im}(f)$ et $y \\in \\text{dom}(f)$ : hors de $\\text{Im}(f)$, $f^{-1}(x)$ n'existe pas."),
    q("Une fonction du type $f(x)=c-\\sqrt{d-x}$ n'est pas injective.", false, "Elle est strictement croissante sur $]-\\infty\\,;d]$ : quand $x$ augmente, $\\sqrt{d-x}$ diminue, donc $-\\sqrt{d-x}$ augmente."),
    q("$f(x)=\\sqrt{x^2-9}$ est injective sur son domaine $]-\\infty\\,;-3] \\cup [3\\,;+\\infty[$.", false, "$f(-3)=f(3)=0$, et plus généralement $f(-x)=f(x)$ : deux réels opposés ont la même image."),
    q("$f(x)=\\sqrt{3x+6}$ est bijective de $[-2\\,;+\\infty[$ vers $\\mathbb{R}^+$.", true, "$3x+6 \\ge 0$ donne $x \\ge -2$ ; la racine y est strictement croissante et atteint toutes les valeurs positives."),
    q("$f(x)=\\dfrac{2x+3}{x-1}$ est bijective de $\\mathbb{R} \\setminus \\{1\\}$ vers $\\mathbb{R} \\setminus \\{2\\}$.", true, "Sa réciproque, $\\dfrac{x+3}{x-2}$ par la formule des homographiques, est définie pour tout $x \\neq 2$ : la valeur $2$, asymptote horizontale de $f$, n'est jamais atteinte."),
  ],
  // ==========================================================================
  // Section 2 — arcsin, arccos, arctan : domaines, images, valeurs
  // ==========================================================================
  fonctionsCyclometriques: [
    q("Le domaine de arcsin est $[-1\\,;1]$.", true, "arcsin est la réciproque de sin restreint à $[-\\pi/2\\,;\\pi/2]$, dont l'image $[-1\\,;1]$ devient le domaine de arcsin."),
    q("L'image de arcsin est $[0\\,;\\pi]$.", false, "L'image de arcsin est $[-\\pi/2\\,;\\pi/2]$ ; $[0\\,;\\pi]$ est celle de arccos."),
    q("$\\arccos(x)$ existe pour tout réel $x$.", false, "Le domaine de arccos est $[-1\\,;1]$ ; c'est arctan qui est définie sur $\\mathbb{R}$."),
    q("arctan est définie sur $\\mathbb{R}$ tout entier.", true, "arctan est la réciproque de tan restreint à $]-\\pi/2\\,;\\pi/2[$, dont l'image est $\\mathbb{R}$."),
    q("arcsin et arctan sont des fonctions impaires.", true, "$\\arcsin(-x)=-\\arcsin(x)$ et $\\arctan(-x)=-\\arctan(x)$."),
    q("arccos est une fonction impaire.", false, "arccos vérifie $\\arccos(-x)=\\pi-\\arccos(x)$, et $\\arccos(0)=\\dfrac{\\pi}{2} \\neq 0$ : elle n'est pas impaire."),
    q("arcsin est strictement décroissante sur son domaine.", false, "arcsin est strictement croissante ; c'est arccos qui est décroissante."),
    q("arccos est strictement décroissante sur son domaine.", true, "Contrairement à arcsin et arctan, arccos décroît : de $\\pi$ en $-1$ à $0$ en $1$."),
    q("$\\arcsin(2)$ existe et vaut un multiple de $\\pi$.", false, "$2 \\notin [-1\\,;1]$ : $\\arcsin(2)$ n'existe pas."),
    q("$\\arcsin(0)=0$.", true, "$\\sin(0)=0$ et $0 \\in [-\\pi/2\\,;\\pi/2]$."),
    q("$\\arcsin\\left(\\dfrac{\\sqrt{2}}{2}\\right)=\\dfrac{\\pi}{4}$.", true, "$\\sin\\dfrac{\\pi}{4}=\\dfrac{\\sqrt{2}}{2}$ et $\\dfrac{\\pi}{4} \\in [-\\pi/2\\,;\\pi/2]$."),
    q("$\\arccos(1)=\\pi$.", false, "$\\cos(0)=1$ et $0 \\in [0\\,;\\pi]$ : $\\arccos(1)=0$. C'est $\\arccos(-1)$ qui vaut $\\pi$."),
    q("Le graphe de arctan a deux asymptotes horizontales, $y=\\dfrac{\\pi}{2}$ et $y=-\\dfrac{\\pi}{2}$.", true, "$\\displaystyle\\lim_{x \\to +\\infty} \\arctan(x)=\\dfrac{\\pi}{2}$ et $\\displaystyle\\lim_{x \\to -\\infty} \\arctan(x)=-\\dfrac{\\pi}{2}$."),
    q("sin restreint à $[-\\pi/2\\,;\\pi/2]$ est bijective de cet intervalle vers $[-1\\,;1]$.", true, "C'est la restriction utilisée pour construire arcsin."),
    q("cos restreint à $[-\\pi/2\\,;\\pi/2]$ est bijective de cet intervalle vers $[-1\\,;1]$.", false, "$\\cos\\left(-\\dfrac{\\pi}{4}\\right)=\\cos\\dfrac{\\pi}{4}$ : cos n'y est pas injective. La restriction utilisée est $[0\\,;\\pi]$."),
    q("tan restreint à $]0\\,;\\pi[$ est bijective de cet intervalle vers $\\mathbb{R}$.", false, "tan n'est pas définie en $\\dfrac{\\pi}{2}$, au milieu de cet intervalle. La restriction utilisée est $]-\\pi/2\\,;\\pi/2[$."),
    q("$\\arcsin(x)$ désigne l'unique angle de $[-\\pi/2\\,;\\pi/2]$ dont le sinus vaut $x$.", true, "Il y a une infinité d'angles de sinus $x$, mais un seul dans cet intervalle."),
    q("Parmi l'infinité d'angles dont le sinus vaut $x$, $\\arcsin(x)$ peut désigner n'importe lequel.", false, "$\\arcsin(x)$ désigne toujours le même angle : celui de $[-\\pi/2\\,;\\pi/2]$."),
    q("Le mot « arc » dans arcsin rappelle la longueur de l'arc de cercle trigonométrique intercepté par l'angle.", true, "Sur le cercle de rayon $1$, la mesure d'un angle en radians est la longueur de l'arc qu'il intercepte."),
    q("$\\arccos(0)=\\dfrac{\\pi}{2}$.", true, "$\\cos\\dfrac{\\pi}{2}=0$ et $\\dfrac{\\pi}{2} \\in [0\\,;\\pi]$."),
    q("$\\arcsin\\left(-\\dfrac{\\sqrt{3}}{2}\\right)=-\\dfrac{\\pi}{3}$.", true, "$\\sin\\left(-\\dfrac{\\pi}{3}\\right)=-\\dfrac{\\sqrt{3}}{2}$ et $-\\dfrac{\\pi}{3} \\in [-\\pi/2\\,;\\pi/2]$."),
    q("$\\arccos\\left(-\\dfrac{1}{2}\\right)=-\\dfrac{\\pi}{3}$.", false, "arccos ne prend jamais de valeur négative : $\\arccos\\left(-\\dfrac{1}{2}\\right)=\\dfrac{2\\pi}{3}$, car $\\cos\\dfrac{2\\pi}{3}=-\\dfrac{1}{2}$."),
    q("$\\arccos\\left(-\\dfrac{\\sqrt{2}}{2}\\right)=\\dfrac{3\\pi}{4}$.", true, "$\\cos\\dfrac{3\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$ et $\\dfrac{3\\pi}{4} \\in [0\\,;\\pi]$."),
    q("$\\arctan(\\sqrt{3})=\\dfrac{\\pi}{3}$.", true, "$\\tan\\dfrac{\\pi}{3}=\\sqrt{3}$ et $\\dfrac{\\pi}{3} \\in \\,]-\\pi/2\\,;\\pi/2[$."),
    q("$\\arctan(1)=\\dfrac{\\pi}{2}$.", false, "$\\arctan(1)=\\dfrac{\\pi}{4}$, car $\\tan\\dfrac{\\pi}{4}=1$. La valeur $\\dfrac{\\pi}{2}$ n'est jamais atteinte par arctan."),
    q("$\\arctan\\left(-\\dfrac{\\sqrt{3}}{3}\\right)=-\\dfrac{\\pi}{6}$.", true, "$\\tan\\left(-\\dfrac{\\pi}{6}\\right)=-\\dfrac{\\sqrt{3}}{3}$ avec $-\\dfrac{\\pi}{6} \\in \\,]-\\pi/2\\,;\\pi/2[$ ; on le retrouve aussi par imparité."),
    q("L'image de arctan est l'intervalle fermé $[-\\pi/2\\,;\\pi/2]$.", false, "C'est l'intervalle ouvert $]-\\pi/2\\,;\\pi/2[$ : $\\pm\\dfrac{\\pi}{2}$ sont des limites, jamais atteintes."),
    q("$\\arcsin(-1)=-\\dfrac{\\pi}{2}$ existe, car $-1$ appartient au domaine de arcsin.", true, "Le domaine $[-1\\,;1]$ est fermé, et $\\sin\\left(-\\dfrac{\\pi}{2}\\right)=-1$."),
    q("$\\arcsin\\left(\\dfrac{\\sqrt{3}}{3}\\right)$ n'existe pas, car $\\dfrac{\\sqrt{3}}{3}$ n'est pas une valeur remarquable du sinus.", false, "$\\dfrac{\\sqrt{3}}{3} \\approx 0{,}58$ est dans $[-1\\,;1]$ : l'expression existe, elle ne vaut simplement aucun angle remarquable."),
    q("Pour $x \\in [-1\\,;1]$ : $y=\\arccos(x) \\iff \\cos(y)=x$ et $y \\in [0\\,;\\pi]$.", true, "Les deux conditions sont nécessaires : $\\cos(2\\pi)=1$, mais $\\arccos(1)=0$ et non $2\\pi$."),
    q("Pour établir que $y=\\arcsin(x)$, il suffit de vérifier que $\\sin(y)=x$.", false, "Il faut aussi $y \\in [-\\pi/2\\,;\\pi/2]$ : $\\sin(\\pi)=0$, mais $\\arcsin(0)=0$ et non $\\pi$."),
    q("La ligne $x=\\dfrac{1}{2}$ du tableau des valeurs remarquables vérifie $\\arcsin(x)+\\arccos(x)=\\dfrac{\\pi}{2}$.", true, "$\\dfrac{\\pi}{6}+\\dfrac{\\pi}{3}=\\dfrac{\\pi}{2}$."),
    q("Le domaine $[-1\\,;1]$ de arcsin n'est pas symétrique, ce qui empêche arcsin d'être impaire.", false, "$[-1\\,;1]$ est symétrique par rapport à $0$, et arcsin est bien impaire."),
    q("Puisque $\\tan\\dfrac{\\pi}{2}$ n'est pas définie, arctan n'est pas définie en $\\dfrac{\\pi}{2}$.", false, "Confusion entre l'argument et l'angle : arctan est définie sur $\\mathbb{R}$, donc en $\\dfrac{\\pi}{2} \\approx 1{,}57$. C'est la valeur $\\dfrac{\\pi}{2}$ en sortie qui n'est jamais atteinte."),
    q("$\\arccos\\left(\\dfrac{\\sqrt{3}}{2}\\right)=\\dfrac{\\pi}{6}$.", true, "$\\cos\\dfrac{\\pi}{6}=\\dfrac{\\sqrt{3}}{2}$ et $\\dfrac{\\pi}{6} \\in [0\\,;\\pi]$."),
  ],
  // ==========================================================================
  // Section 2 — Composer arcfonction et fonction trigonométrique (thème ajouté)
  // ==========================================================================
  compositionsArcTrig: [
    q("$\\sin(\\arcsin x)=x$ pour tout $x \\in [-1\\,;1]$.", true, "$\\arcsin(x)$ est un angle dont le sinus vaut $x$ : reprendre son sinus redonne $x$."),
    q("$\\arcsin(\\sin\\theta)=\\theta$ pour tout réel $\\theta$.", false, "arcsin ne rend que des angles de $[-\\pi/2\\,;\\pi/2]$ : l'égalité n'est vraie que si $\\theta$ y est."),
    q("$\\arcsin\\left(\\sin\\dfrac{5\\pi}{6}\\right)=\\dfrac{\\pi}{6}$.", true, "$\\sin\\dfrac{5\\pi}{6}=\\dfrac{1}{2}$, et l'angle de $[-\\pi/2\\,;\\pi/2]$ de sinus $\\dfrac{1}{2}$ est $\\dfrac{\\pi}{6}$."),
    q("$\\arcsin\\left(\\sin\\dfrac{3\\pi}{4}\\right)=\\dfrac{3\\pi}{4}$.", false, "$\\dfrac{3\\pi}{4} \\notin [-\\pi/2\\,;\\pi/2]$ : le résultat est l'angle de même sinus dans l'image, $\\dfrac{\\pi}{4}$."),
    q("$\\arccos\\left(\\cos\\left(-\\dfrac{\\pi}{3}\\right)\\right)=\\dfrac{\\pi}{3}$.", true, "$\\cos\\left(-\\dfrac{\\pi}{3}\\right)=\\cos\\dfrac{\\pi}{3}=\\dfrac{1}{2}$, et $\\arccos\\dfrac{1}{2}=\\dfrac{\\pi}{3}$."),
    q("$\\arccos(\\cos 2\\pi)=2\\pi$.", false, "$\\cos 2\\pi=1$ et $\\arccos(1)=0$ : $2\\pi$ n'est pas dans $[0\\,;\\pi]$."),
    q("$\\arctan\\left(\\tan\\dfrac{3\\pi}{4}\\right)=-\\dfrac{\\pi}{4}$.", true, "$\\tan\\dfrac{3\\pi}{4}=-1$ et $\\arctan(-1)=-\\dfrac{\\pi}{4}$, c'est-à-dire $\\dfrac{3\\pi}{4}-\\pi$."),
    q("$\\arctan\\left(\\tan\\dfrac{5\\pi}{4}\\right)=\\dfrac{\\pi}{4}$.", true, "tan a pour période $\\pi$ : $\\tan\\dfrac{5\\pi}{4}=\\tan\\dfrac{\\pi}{4}=1$, et $\\arctan(1)=\\dfrac{\\pi}{4}$."),
    q("$\\arcsin\\left(\\tan\\dfrac{2\\pi}{3}\\right)$ existe.", false, "$\\tan\\dfrac{2\\pi}{3}=-\\sqrt{3} \\approx -1{,}73$, hors de $[-1\\,;1]$ : l'expression n'existe pas."),
    q("$\\arccos\\left(\\sin\\dfrac{\\pi}{6}\\right)=\\dfrac{\\pi}{3}$.", true, "$\\sin\\dfrac{\\pi}{6}=\\dfrac{1}{2}$ et $\\arccos\\dfrac{1}{2}=\\dfrac{\\pi}{3}$."),
    q("$\\cos(\\arccos x)=x$ pour tout $x \\in [-1\\,;1]$, alors que $\\arccos(\\cos\\theta)=\\theta$ seulement si $\\theta \\in [0\\,;\\pi]$.", true, "Le premier sens est toujours vrai sur le domaine ; le second échoue dès que $\\theta$ sort de l'image de arccos."),
    q("$\\tan(\\arctan x)=x$ seulement pour $x \\in \\,]-\\pi/2\\,;\\pi/2[$.", false, "$\\tan(\\arctan x)=x$ pour tout réel $x$ : c'est l'autre composition, $\\arctan(\\tan\\theta)$, qui demande $\\theta \\in \\,]-\\pi/2\\,;\\pi/2[$."),
    q("$\\cos(\\arcsin x)=\\sqrt{1-x^2}$ pour tout $x \\in [-1\\,;1]$.", true, "$\\cos^2=1-\\sin^2=1-x^2$, et le cosinus est positif sur $[-\\pi/2\\,;\\pi/2]$, où vit $\\arcsin x$."),
    q("$\\cos(\\arcsin x)=-\\sqrt{1-x^2}$ lorsque $x<0$.", false, "$\\arcsin x$ reste dans $[-\\pi/2\\,;\\pi/2]$, où le cosinus est positif ou nul, quel que soit le signe de $x$."),
    q("$\\sin(\\arccos x)=\\sqrt{1-x^2}$ pour tout $x \\in [-1\\,;1]$.", true, "$\\arccos x \\in [0\\,;\\pi]$, où le sinus est positif ou nul."),
    q("$\\sin(\\arccos x)=x$ pour tout $x \\in [-1\\,;1]$.", false, "Ce ne sont pas des fonctions réciproques : $\\sin(\\arccos x)=\\sqrt{1-x^2}$. Par exemple, $\\sin(\\arccos 0)=\\sin\\dfrac{\\pi}{2}=1 \\neq 0$."),
    q("$\\cos\\left(\\arcsin\\dfrac{3}{5}\\right)=\\dfrac{4}{5}$.", true, "$\\sqrt{1-\\dfrac{9}{25}}=\\sqrt{\\dfrac{16}{25}}=\\dfrac{4}{5}$."),
    q("$\\sin\\left(\\arccos\\left(-\\dfrac{4}{5}\\right)\\right)=-\\dfrac{3}{5}$.", false, "$\\sin(\\arccos x)=\\sqrt{1-x^2}$ n'est jamais négatif : le résultat vaut $\\dfrac{3}{5}$."),
    q("$\\cos(\\arctan x)=\\dfrac{1}{\\sqrt{1+x^2}}$ pour tout réel $x$.", true, "$1+\\tan^2=\\dfrac{1}{\\cos^2}$ donne $\\cos^2=\\dfrac{1}{1+x^2}$, et le cosinus est strictement positif sur $]-\\pi/2\\,;\\pi/2[$."),
    q("$\\cos(\\arctan x)$ peut être négatif.", false, "$\\arctan x \\in \\,]-\\pi/2\\,;\\pi/2[$, où le cosinus est strictement positif."),
    q("$\\sin(\\arctan x)=\\dfrac{x}{\\sqrt{1+x^2}}$ pour tout réel $x$.", true, "$\\sin=\\tan \\cdot \\cos=x \\cdot \\dfrac{1}{\\sqrt{1+x^2}}$."),
    q("$\\sin(\\arctan 1)=1$.", false, "$\\arctan 1=\\dfrac{\\pi}{4}$ et $\\sin\\dfrac{\\pi}{4}=\\dfrac{\\sqrt{2}}{2}$ ; la formule donne bien $\\dfrac{1}{\\sqrt{2}}$."),
    q("$\\tan(\\arcsin x)=\\dfrac{x}{\\sqrt{1-x^2}}$ pour tout $x \\in \\,]-1\\,;1[$.", true, "$\\tan=\\dfrac{\\sin}{\\cos}=\\dfrac{x}{\\sqrt{1-x^2}}$, défini tant que $x \\neq \\pm 1$."),
    q("$\\tan(\\arcsin 1)$ existe.", false, "$\\arcsin 1=\\dfrac{\\pi}{2}$, où la tangente n'est pas définie ; dans $\\dfrac{x}{\\sqrt{1-x^2}}$, le dénominateur est d'ailleurs nul."),
    q("$\\tan(\\arccos x)=\\dfrac{\\sqrt{1-x^2}}{x}$ pour $x \\in [-1\\,;1]$, $x \\neq 0$.", true, "$\\tan=\\dfrac{\\sin}{\\cos}$, avec $\\sin(\\arccos x)=\\sqrt{1-x^2}$ et $\\cos(\\arccos x)=x$."),
    q("$\\tan\\left(\\arccos\\left(-\\dfrac{1}{2}\\right)\\right)=-\\sqrt{3}$.", true, "$\\arccos\\left(-\\dfrac{1}{2}\\right)=\\dfrac{2\\pi}{3}$, et $\\tan\\dfrac{2\\pi}{3}=-\\sqrt{3}$."),
    q("$\\cos(\\arcsin 3x)=\\sqrt{1-3x^2}$.", false, "C'est $3x$ tout entier qui est mis au carré : $\\cos(\\arcsin 3x)=\\sqrt{1-9x^2}$."),
    q("$\\cos(\\arcsin 2x)$ n'est défini que pour $x \\in \\left[-\\dfrac{1}{2}\\,;\\dfrac{1}{2}\\right]$.", true, "arcsin demande $2x \\in [-1\\,;1]$, soit $x \\in \\left[-\\dfrac{1}{2}\\,;\\dfrac{1}{2}\\right]$."),
    q("Pour calculer $\\cos(\\arcsin x)$, il faut d'abord trouver la valeur exacte de l'angle $\\arcsin x$.", false, "L'identité $\\cos(\\arcsin x)=\\sqrt{1-x^2}$ donne le résultat sans connaître l'angle : $\\cos\\left(\\arcsin\\dfrac{1}{3}\\right)=\\dfrac{2\\sqrt{2}}{3}$."),
    q("Dans la démonstration de $\\cos(\\arcsin x)=\\sqrt{1-x^2}$, le signe de la racine se décide grâce à l'image de arcsin.", true, "$\\cos^2=1-x^2$ laisse deux signes possibles ; sur $[-\\pi/2\\,;\\pi/2]$, le cosinus est positif."),
    q("$\\arcsin(\\sin\\theta)$ n'existe pas pour certains réels $\\theta$.", false, "$\\sin\\theta \\in [-1\\,;1]$ pour tout $\\theta$ : $\\arcsin(\\sin\\theta)$ existe toujours, il vaut $\\theta$ ou un autre angle."),
    q("$\\arccos(\\cos\\theta)=\\theta$ pour tout $\\theta \\in [0\\,;\\pi]$.", true, "$\\theta$ est alors dans l'image de arccos et a le bon cosinus : par unicité, c'est lui."),
    q("$\\arctan(\\tan\\theta)=\\theta$ pour tout $\\theta$ où $\\tan\\theta$ est définie.", false, "Il faut $\\theta \\in \\,]-\\pi/2\\,;\\pi/2[$ : $\\arctan(\\tan\\pi)=\\arctan 0=0 \\neq \\pi$."),
    q("$\\arcsin\\left(\\sin\\dfrac{7\\pi}{6}\\right)=-\\dfrac{\\pi}{6}$.", true, "$\\sin\\dfrac{7\\pi}{6}=-\\dfrac{1}{2}$, et l'angle de $[-\\pi/2\\,;\\pi/2]$ de sinus $-\\dfrac{1}{2}$ est $-\\dfrac{\\pi}{6}$."),
    q("$\\arccos\\left(\\cos\\dfrac{4\\pi}{3}\\right)=\\dfrac{4\\pi}{3}$.", false, "$\\dfrac{4\\pi}{3} \\notin [0\\,;\\pi]$ : $\\cos\\dfrac{4\\pi}{3}=-\\dfrac{1}{2}$, d'où $\\arccos\\left(-\\dfrac{1}{2}\\right)=\\dfrac{2\\pi}{3}$."),
  ],
  // ==========================================================================
  // Section 3 — Équations cyclométriques
  // ==========================================================================
  equationsCyclometriques: [
    q("Avant de résoudre une équation contenant $\\arcsin(u)$, il faut poser la condition $u \\in [-1\\,;1]$.", true, "C'est la condition d'existence de arcsin."),
    q("$\\arctan(u)$ impose une condition d'existence sur $u$.", false, "arctan est définie sur $\\mathbb{R}$ : aucune condition d'existence."),
    q("$\\arcsin(A)=\\arcsin(B) \\iff A=B$, si $A$ et $B$ respectent la condition d'existence.", true, "arcsin est injective sur son domaine."),
    q("$\\arcsin(u)+\\arccos(u)=\\pi$ pour tout $u \\in [-1\\,;1]$.", false, "L'identité correcte est $\\arcsin(u)+\\arccos(u)=\\dfrac{\\pi}{2}$."),
    q("$\\arcsin(u)+\\arccos(u)=\\dfrac{\\pi}{2}$ pour tout $u \\in [-1\\,;1]$.", true, "Les angles $\\arcsin(u)$ et $\\arccos(u)$ sont complémentaires."),
    q("Une fois la condition d'existence posée, $\\arcsin(2x-1)=\\arcsin(x)$ équivaut à $2x-1=x$.", true, "C'est l'injectivité de arcsin."),
    q("Pour résoudre une équation cyclométrique, seule compte l'équation simplifiée : la condition d'existence peut être ignorée.", false, "Elle se pose avant de simplifier, et chaque candidat lui est ensuite confronté."),
    q("Une solution de l'équation simplifiée qui ne respecte pas la condition d'existence doit être rejetée.", true, "C'est la troisième étape de la méthode."),
    q("$\\arccos(A)=\\arccos(B)$ équivaut à $A=-B$.", false, "Par injectivité de arccos, c'est $A=B$, sous la condition d'existence."),
    q("L'équation $\\arcsin(x)=5$ a au moins une solution réelle.", false, "L'image de arcsin est $[-\\pi/2\\,;\\pi/2]$, et $5>\\dfrac{\\pi}{2} \\approx 1{,}57$ : aucune solution."),
    q("Résoudre une équation avec arctan demande de vérifier que son argument appartient à $[-1\\,;1]$.", false, "arctan n'a aucune condition d'existence."),
    q("$\\arctan(A)=\\arctan(B) \\iff A=B$, sans aucune condition d'existence.", true, "arctan est injective sur $\\mathbb{R}$."),
    q("L'équation $\\arccos(x)=\\arcsin(x)$ n'a aucune solution.", false, "$x=\\dfrac{\\sqrt{2}}{2}$ convient : $\\arccos\\dfrac{\\sqrt{2}}{2}=\\arcsin\\dfrac{\\sqrt{2}}{2}=\\dfrac{\\pi}{4}$."),
    q("Une équation entre deux arcsin, ou entre deux arccos, peut avoir une solution de l'équation simplifiée rejetée par la condition d'existence.", true, "Dans $\\arccos(x^2-1)=\\arccos(1-x)$, le candidat $-2$ donne $\\arccos(3)$, qui n'existe pas."),
    q("La condition d'existence de $\\arcsin(3x)$ est $x \\in \\left[-\\dfrac{1}{3}\\,;\\dfrac{1}{3}\\right]$.", true, "$-1 \\le 3x \\le 1$, divisé par $3$ (positif, l'ordre est conservé)."),
    q("$\\arcsin(u)$ n'est défini que pour $u \\in \\,]-1\\,;1[$.", false, "Le domaine est fermé : $\\arcsin(1)=\\dfrac{\\pi}{2}$ et $\\arcsin(-1)=-\\dfrac{\\pi}{2}$ existent."),
    q("Pour $\\arccos(x^2)=\\arccos(0{,}25)$, une condition nécessaire est $x^2=0{,}25$.", true, "$0{,}25 \\in [-1\\,;1]$, et arccos est injective."),
    q("Pour $\\arccos(x^2-1)=\\arccos(1-x)$, la condition d'existence est $x \\in [0\\,;\\sqrt{2}]$.", true, "$x^2-1 \\in [-1\\,;1]$ donne $x \\in [-\\sqrt{2}\\,;\\sqrt{2}]$, et $1-x \\in [-1\\,;1]$ donne $x \\in [0\\,;2]$."),
    q("Dans $\\arccos(x^2-1)=\\arccos(1-x)$, le candidat $x=-2$ est rejeté.", true, "En $x=-2$, l'argument de gauche vaut $3$, et $\\arccos(3)$ n'existe pas."),
    q("Une équation cyclométrique dont l'équation simplifiée est du second degré a toujours exactement deux solutions.", false, "Le second degré peut donner $2$, $1$ ou $0$ racine, et la condition d'existence peut encore en rejeter."),
    q("$x=2$ est solution de $\\arctan(x^2-2)=\\arctan(x)$.", true, "Vérification : $2^2-2=2$, les deux arguments sont égaux."),
    q("Une équation $\\arctan(g(x))=\\arctan(h(x))$ a toujours au moins une solution, puisque arctan est définie partout.", false, "L'absence de condition d'existence ne crée pas de solution : $\\arctan(x^2+1)=\\arctan(x)$ mène à $x^2-x+1=0$, sans racine réelle."),
    q("L'équation $\\arcsin(x)=\\dfrac{\\pi}{6}$ a pour unique solution $x=\\dfrac{1}{2}$.", true, "$\\dfrac{\\pi}{6}$ est dans l'image de arcsin, et $x=\\sin\\dfrac{\\pi}{6}$."),
    q("L'équation $\\arccos(x)=-\\dfrac{\\pi}{4}$ a pour solution $x=\\dfrac{\\sqrt{2}}{2}$.", false, "arccos ne prend jamais de valeur négative : aucune solution. D'ailleurs $\\arccos\\dfrac{\\sqrt{2}}{2}=\\dfrac{\\pi}{4}$."),
    q("L'équation $\\arctan(x)=\\dfrac{\\pi}{3}$ a pour unique solution $x=\\sqrt{3}$.", true, "$\\dfrac{\\pi}{3} \\in \\,]-\\pi/2\\,;\\pi/2[$ et $\\tan\\dfrac{\\pi}{3}=\\sqrt{3}$."),
    q("Aucun réel ne vérifie la condition d'existence de $\\arcsin(x^2+2)$.", true, "$x^2+2 \\ge 2>1$ pour tout réel $x$."),
    q("L'équation $\\arctan(3x+1)=\\dfrac{\\pi}{2}$ a une unique solution.", false, "L'image de arctan est l'intervalle ouvert $]-\\pi/2\\,;\\pi/2[$ : $\\dfrac{\\pi}{2}$ n'est jamais atteint, l'ensemble des solutions est vide."),
    q("La condition d'existence de $\\arcsin(1-3x)$ est $x \\in \\left[-\\dfrac{1}{3}\\,;\\dfrac{1}{3}\\right]$.", false, "$-1 \\le 1-3x \\le 1$ donne $-2 \\le -3x \\le 0$, puis, en divisant par $-3$ (le sens s'inverse), $0 \\le x \\le \\dfrac{2}{3}$."),
    q("Pour résoudre $\\arcsin(A)=\\arccos(B)$, on peut simplifier directement en $A=B$.", false, "L'injectivité ne sert que pour la même arcfonction des deux côtés : $\\arcsin\\dfrac{1}{2}=\\arccos\\dfrac{\\sqrt{3}}{2}$, et pourtant $\\dfrac{1}{2} \\neq \\dfrac{\\sqrt{3}}{2}$."),
    q("Si $\\arcsin(A)=\\arccos(B)$, alors $A \\ge 0$ et $B \\ge 0$.", true, "La valeur commune est dans $[-\\pi/2\\,;\\pi/2] \\cap [0\\,;\\pi]=[0\\,;\\pi/2]$, où sinus et cosinus sont positifs."),
    q("Élever au carré les deux membres d'une équation peut faire apparaître des solutions parasites.", true, "Dans $\\arcsin(4x)=\\arccos(3x)$, le candidat $-\\dfrac{1}{5}$ vient de la mise au carré et est rejeté par la compatibilité des images."),
    q("Dans $\\arcsin(4x)=\\arccos(3x)$, $x=-\\dfrac{1}{5}$ est solution, puisqu'il respecte la condition d'existence.", false, "Il respecte la condition d'existence, mais pas la compatibilité : $\\arcsin\\left(-\\dfrac{4}{5}\\right)<0$, alors que $\\arccos\\left(-\\dfrac{3}{5}\\right)>\\dfrac{\\pi}{2}$."),
    q("L'équation $\\arccos(x)=\\dfrac{5\\pi}{6}$ a pour unique solution $x=-\\dfrac{\\sqrt{3}}{2}$.", true, "$\\dfrac{5\\pi}{6} \\in [0\\,;\\pi]$ et $\\cos\\dfrac{5\\pi}{6}=-\\dfrac{\\sqrt{3}}{2}$."),
    q("L'équation $\\arcsin(x^2+1)=\\dfrac{\\pi}{2}$ n'a aucune solution.", false, "La condition d'existence impose $x^2+1 \\le 1$, donc $x=0$ ; et $\\arcsin(1)=\\dfrac{\\pi}{2}$ : $x=0$ est solution."),
    q("Pour résoudre $\\arcsin(u)=\\alpha$ avec $\\alpha \\in [-\\pi/2\\,;\\pi/2]$, il n'y a aucune condition d'existence à vérifier en plus après avoir écrit $u=\\sin\\alpha$.", true, "$\\sin\\alpha$ est automatiquement dans $[-1\\,;1]$."),
  ],
  // ==========================================================================
  // Section 4 — Dérivées des fonctions cyclométriques
  // ==========================================================================
  deriveesCyclometriques: [
    q("$(\\arcsin u)'=\\dfrac{u'}{\\sqrt{1-u^2}}$.", true, "Formule obtenue par le théorème de la dérivée d'une réciproque, appliqué à sin restreint."),
    q("$(\\arccos u)'=\\dfrac{u'}{\\sqrt{1-u^2}}$, comme pour arcsin.", false, "Il y a un signe moins : $(\\arccos u)'=-\\dfrac{u'}{\\sqrt{1-u^2}}$."),
    q("$(\\arctan u)'=\\dfrac{u'}{1+u^2}$.", true, "C'est la formule de la dérivée de arctan, composée par la règle de la chaîne."),
    q("$(\\arctan u)'=\\dfrac{u'}{1-u^2}$.", false, "Le dénominateur est $1+u^2$, une somme qui ne s'annule jamais."),
    q("Des trois dérivées $\\arcsin'$, $\\arccos'$ et $\\arctan'$, seule celle de arccos est négative.", true, "arccos est la seule des trois à décroître."),
    q("Pour dériver $\\arcsin(2x-1)$, il faut multiplier par $(2x-1)'=2$.", true, "Règle de la chaîne : on multiplie par la dérivée de l'argument."),
    q("$(\\arcsin(2x-1))'=\\dfrac{2}{\\sqrt{1-(2x-1)^2}}$.", true, "$u=2x-1$ et $u'=2$, dans $\\dfrac{u'}{\\sqrt{1-u^2}}$."),
    q("arcsin est dérivable sur tout son domaine $[-1\\,;1]$, bornes comprises.", false, "arcsin n'est pas dérivable en $\\pm 1$ : sa dérivée n'existe que sur $]-1\\,;1[$."),
    q("La tangente au graphe de arcsin en $x=0$ a pour pente $1$.", true, "$\\arcsin'(0)=\\dfrac{1}{\\sqrt{1-0}}=1$."),
    q("$\\arctan'(1)=\\dfrac{1}{4}$.", false, "$\\arctan'(1)=\\dfrac{1}{1+1^2}=\\dfrac{1}{2}$."),
    q("Le dénominateur $1+u^2$ de $(\\arctan u)'$ ne s'annule jamais.", true, "$1+u^2 \\ge 1>0$."),
    q("Le dénominateur $\\sqrt{1-u^2}$ de $(\\arcsin u)'$ s'annule en $u=0$.", false, "$\\sqrt{1-0}=1$ : il s'annule en $u=\\pm 1$."),
    q("Si les hypothèses du théorème de la dérivée d'une réciproque ne sont pas vérifiées en un point, $f^{-1}$ n'y est pas dérivable.", false, "Condition suffisante, pas nécessaire : $f(x)=\\sqrt[5]{x}$ a une tangente verticale en $0$, mais $f^{-1}(x)=x^5$ y est dérivable."),
    q("Le théorème de la dérivée d'une réciproque, appliqué à sin restreint à $[-\\pi/2\\,;\\pi/2]$, donne la dérivée de arcsin.", true, "$\\arcsin'(x)=\\dfrac{1}{\\cos(\\arcsin x)}=\\dfrac{1}{\\sqrt{1-x^2}}$."),
    q("En dérivant $\\sin(\\arcsin x)=x$, on obtient $\\cos(\\arcsin x) \\cdot \\arcsin'(x)=1$.", true, "Règle de la chaîne à gauche, et $x'=1$ à droite."),
    q("Les formules de $(\\arcsin u)'$ et de $(\\arccos u)'$ ne diffèrent que par le signe.", true, "Même dénominateur $\\sqrt{1-u^2}$ ; seul le signe moins distingue arccos."),
    q("Les dérivées de $\\arcsin(u)$ et de $\\arctan(u)$ ont le même dénominateur.", false, "$\\sqrt{1-u^2}$ pour arcsin, $1+u^2$ pour arctan."),
    q("La formule de $(\\arcsin(2x-1))'$ n'est valable que pour $x \\in \\,]0\\,;1[$.", true, "Il faut $2x-1 \\in \\,]-1\\,;1[$, soit $0<x<1$."),
    q("Pour dériver $\\arcsin(u(x))$, la règle de la chaîne est inutile.", false, "Elle s'applique comme pour toute composée : on multiplie par $u'(x)$."),
    q("La dérivée de arcsin est valable sur $[-1\\,;1]$, le domaine de arcsin.", false, "Seulement sur l'intervalle ouvert $]-1\\,;1[$."),
    q("Dans la démonstration directe de $\\arccos'$, le signe de la racine se décide par $\\sin(\\arccos x) \\ge 0$, car $\\arccos x \\in [0\\,;\\pi]$.", true, "Sur $[0\\,;\\pi]$, le sinus est positif ou nul ; pour arcsin, c'est $\\cos \\ge 0$ sur $[-\\pi/2\\,;\\pi/2]$ qui tranche."),
    q("Le signe moins de $\\arccos'$ vient du choix du signe négatif de la racine carrée.", false, "La racine est positive dans les deux démonstrations ; le signe moins vient de $\\cos'=-\\sin$."),
    q("La démonstration directe de $\\arccos'$ part de la restriction de cos à $[0\\,;\\pi]$, dont la dérivée est $-\\sin$.", true, "Le théorème donne alors $\\arccos'(x)=\\dfrac{1}{-\\sin(\\arccos x)}$."),
    q("La démonstration de $\\arctan'$ ne demande aucune discussion de signe.", true, "Aucune racine carrée n'y apparaît : $\\tan(\\arctan x)=x$ suffit."),
    q("$(\\arccos x)'=-(\\arcsin x)'$ découle de $\\arccos x=\\dfrac{\\pi}{2}-\\arcsin x$.", true, "La constante $\\dfrac{\\pi}{2}$ se dérive en $0$."),
    q("Comme arcsin et arccos, arctan n'est pas dérivable aux bornes de son domaine.", false, "Le domaine de arctan est $\\mathbb{R}$, sans borne, et $1+x^2$ ne s'annule jamais : arctan est dérivable partout."),
    q("arcsin n'est pas dérivable en $1$ : sinon, en dérivant $\\sin(\\arcsin x)=x$ en $1$, on obtiendrait $0 \\cdot \\arcsin'(1)=1$.", true, "$\\cos(\\arcsin 1)=\\cos\\dfrac{\\pi}{2}=0$ : l'égalité est impossible."),
    q("Que $\\dfrac{1}{\\sqrt{1-x^2}}$ ne soit pas définie en $\\pm 1$ suffit à prouver que arcsin n'y est pas dérivable.", false, "Des hypothèses non vérifiées ne prouvent rien (contre-exemple de $\\sqrt[5]{x}$) : seul le raisonnement par l'absurde l'établit."),
    q("$\\arccos'(x)=-\\dfrac{1}{\\sqrt{1-x^2}}$ et $\\arctan'(x)=\\dfrac{1}{1+x^2}$ sont toutes deux valables sur $]-1\\,;1[$ seulement.", false, "Celle de arctan vaut pour tout réel."),
    q("$(\\arctan 3x)'=\\dfrac{3}{1+3x^2}$.", false, "$u=3x$ tout entier est mis au carré : $\\dfrac{3}{1+9x^2}$."),
    q("$(\\arccos x^2)'=-\\dfrac{2x}{\\sqrt{1-x^4}}$.", true, "$u=x^2$, $u'=2x$ et $u^2=x^4$."),
    q("$\\left(\\arcsin\\dfrac{x}{2}\\right)'=\\dfrac{1}{2\\sqrt{1-x^2}}$.", false, "Le dénominateur doit contenir $u^2=\\dfrac{x^2}{4}$ : $\\dfrac{\\frac{1}{2}}{\\sqrt{1-\\frac{x^2}{4}}}=\\dfrac{1}{\\sqrt{4-x^2}}$."),
    q("La dérivée de $\\arctan(x)+\\arctan\\left(\\dfrac{1}{x}\\right)$ est nulle sur $]0\\,;+\\infty[$.", true, "$\\dfrac{1}{1+x^2}+\\dfrac{-\\frac{1}{x^2}}{1+\\frac{1}{x^2}}=\\dfrac{1}{1+x^2}-\\dfrac{1}{x^2+1}=0$ : la fonction y vaut $\\dfrac{\\pi}{2}$."),
    q("$\\arctan(x)+\\arctan\\left(\\dfrac{1}{x}\\right)=\\dfrac{\\pi}{2}$ pour tout réel $x \\neq 0$.", false, "Pour $x<0$, la somme vaut $-\\dfrac{\\pi}{2}$ : une dérivée nulle ne donne une constante que sur un intervalle, et $\\mathbb{R} \\setminus \\{0\\}$ n'en est pas un."),
    q("Pour $f(x)=k\\arcsin(u(x))+c$, on a $f'(x)=\\dfrac{k\\,u'}{\\sqrt{1-u^2}}$.", true, "La constante $c$ disparaît, le facteur $k$ est conservé."),
  ],
  // ==========================================================================
  // Section 5 — Graphes et fonctions transformées
  // ==========================================================================
  graphiquesCyclometriques: [
    q("Un graphe dont le domaine est $[-1\\,;1]$ peut être celui de arcsin ou de arccos.", true, "Ce sont les deux arcfonctions de domaine $[-1\\,;1]$ ; arctan est définie sur $\\mathbb{R}$."),
    q("Un graphe défini sur $\\mathbb{R}$, sans asymptote, peut être celui de arctan.", false, "arctan a deux asymptotes horizontales, $y=\\pm\\dfrac{\\pi}{2}$."),
    q("arctan est la seule des trois arcfonctions dont le graphe a des asymptotes horizontales.", true, "arcsin et arccos sont définies sur $[-1\\,;1]$ : aucune asymptote possible."),
    q("Un graphe croissant sur tout son domaine peut être celui de arccos.", false, "arccos est strictement décroissante."),
    q("Le graphe de arccos passe par le point $\\left(0\\,;\\dfrac{\\pi}{2}\\right)$.", true, "$\\arccos(0)=\\dfrac{\\pi}{2}$."),
    q("Le graphe de arcsin passe par le point $\\left(0\\,;\\dfrac{\\pi}{2}\\right)$.", false, "$\\arcsin(0)=0$ ; c'est le graphe de arccos qui passe par $\\left(0\\,;\\dfrac{\\pi}{2}\\right)$."),
    q("Le graphe de arcsin est symétrique par rapport à l'origine.", true, "arcsin est impaire."),
    q("Le graphe de arccos est symétrique par rapport à l'origine.", false, "arccos n'est pas impaire ; son graphe est symétrique par rapport au point $\\left(0\\,;\\dfrac{\\pi}{2}\\right)$."),
    q("Pour distinguer arcsin de arccos sur un graphique, on peut regarder le sens de variation.", true, "Sur le même domaine, arcsin croît et arccos décroît."),
    q("Le point le plus haut du graphe de arcsin a pour ordonnée $\\pi$.", false, "C'est $\\dfrac{\\pi}{2}$, atteint en $x=1$."),
    q("Le point le plus haut du graphe de arccos a pour ordonnée $\\pi$.", true, "$\\arccos(-1)=\\pi$."),
    q("arcsin, arccos et arctan ont la même image $[-\\pi/2\\,;\\pi/2]$.", false, "L'image de arccos est $[0\\,;\\pi]$, et celle de arctan est ouverte."),
    q("Le graphe de arctan traverse l'origine avec une tangente horizontale.", false, "$\\arctan'(0)=1$ : la tangente en l'origine a une pente de $1$."),
    q("Les graphes des trois arcfonctions passent tous par l'origine.", false, "$\\arccos(0)=\\dfrac{\\pi}{2}$ : seuls arcsin et arctan passent par $(0\\,;0)$."),
    q("Le graphe de arccos s'arrête aux points $(-1\\,;\\pi)$ et $(1\\,;0)$.", true, "Les bornes se correspondent en ordre inverse, arccos étant décroissante."),
    q("Le graphe de arccos coupe l'axe des abscisses en $x=1$.", true, "$\\arccos(1)=0$, et arccos ne s'annule nulle part ailleurs."),
    q("Le graphe de arctan finit par couper la droite $y=\\dfrac{\\pi}{2}$.", false, "C'est une asymptote : la courbe s'en approche sans jamais l'atteindre."),
    q("Le point $\\left(\\dfrac{\\pi}{2}\\,;1\\right)$ du graphe de sin restreint correspond au point $\\left(1\\,;\\dfrac{\\pi}{2}\\right)$ du graphe de arcsin.", true, "Passer à la réciproque échange abscisse et ordonnée."),
    q("Un graphe défini sur $[-1\\,;1]$ est forcément celui de arcsin.", false, "arccos a le même domaine : il faut une seconde information, comme le sens de variation."),
    q("Le graphe de arctan a des asymptotes verticales, héritées de celles de tan.", false, "La symétrie par rapport à $y=x$ change les asymptotes verticales de tan en asymptotes horizontales de arctan."),
    q("Le graphe de arcsin arrive en $x=\\pm 1$ avec une tangente verticale.", true, "La pente $\\dfrac{1}{\\sqrt{1-x^2}}$ tend vers l'infini quand $x$ tend vers $\\pm 1$."),
    q("Les tangentes aux graphes de arcsin et de arctan en l'origine ont la même pente.", true, "$\\arcsin'(0)=\\arctan'(0)=1$."),
    q("Le domaine de $f(x)=2\\arcsin(x-1)$ est $[0\\,;2]$.", true, "$-1 \\le x-1 \\le 1$ donne $0 \\le x \\le 2$."),
    q("Le domaine de $f(x)=\\arcsin(2x)$ est $[-2\\,;2]$.", false, "$-1 \\le 2x \\le 1$ donne $x \\in \\left[-\\dfrac{1}{2}\\,;\\dfrac{1}{2}\\right]$."),
    q("L'image de $f(x)=\\dfrac{\\pi}{2}+2\\arcsin(x-1)$ est $\\left[-\\dfrac{\\pi}{2}\\,;\\dfrac{3\\pi}{2}\\right]$.", true, "$2 \\cdot [-\\pi/2\\,;\\pi/2]=[-\\pi\\,;\\pi]$, puis on ajoute $\\dfrac{\\pi}{2}$."),
    q("L'image de $f(x)=3\\arctan(x)$ est $\\left[-\\dfrac{3\\pi}{2}\\,;\\dfrac{3\\pi}{2}\\right]$.", false, "L'intervalle reste ouvert, $\\left]-\\dfrac{3\\pi}{2}\\,;\\dfrac{3\\pi}{2}\\right[$ : ses bornes ne sont jamais atteintes."),
    q("$f(x)=1-\\arctan(x)$ a pour asymptotes horizontales $y=1-\\dfrac{\\pi}{2}$ et $y=1+\\dfrac{\\pi}{2}$.", true, "Ce sont les droites $y=c \\pm k\\dfrac{\\pi}{2}$, avec $c=1$ et $k=-1$."),
    q("$f(x)=-2\\arcsin(x)$ est décroissante.", true, "Le facteur négatif retourne le graphe de arcsin, qui est croissant."),
    q("$f(x)=-\\arccos(x)$ est décroissante.", false, "arccos décroît, et le facteur $-1$ retourne son graphe : $-\\arccos$ est croissante."),
    q("$f(x)=c+k\\arctan(mx+n)$, avec $k$ et $m$ non nuls, n'a jamais d'extremum.", true, "Elle est strictement monotone, et son image est un intervalle ouvert dont les bornes ne sont jamais atteintes."),
    q("Une fonction de la forme $c+k\\arcsin(mx+n)$, avec $k$ et $m$ non nuls, peut être paire.", false, "Elle est strictement monotone, donc jamais paire."),
    q("$f(x)=\\arccos(x)-\\dfrac{\\pi}{2}$ est impaire.", true, "$\\arccos(x)-\\dfrac{\\pi}{2}=-\\arcsin(x)$, une fonction impaire."),
    q("Si le graphe de $f(x)=c+k\\arctan(mx+n)$ passe par l'origine, alors $f$ est impaire.", false, "$g(x)=\\dfrac{\\pi}{2}-2\\arctan(x+1)$ passe par l'origine, mais son centre de symétrie est $\\left(-1\\,;\\dfrac{\\pi}{2}\\right)$."),
    q("Le graphe de $f(x)=c+k\\arcsin(mx+n)$ est symétrique par rapport au point $\\left(-\\dfrac{n}{m}\\,;c\\right)$.", true, "En $x=-\\dfrac{n}{m}$, l'argument s'annule et $f$ vaut $c$ ; arcsin étant impaire, le graphe est symétrique autour de ce point."),
    q("Le maximum de $f(x)=1+3\\arcsin(x)$ vaut $1+3\\pi$.", false, "arcsin vaut au plus $\\dfrac{\\pi}{2}$ : le maximum est $1+\\dfrac{3\\pi}{2}$, atteint en $x=1$."),
  ],
  // ==========================================================================
  // Section 6 — Étudier une fonction cyclométrique (thème ajouté)
  // ==========================================================================
  etudeFonctionCyclometrique: [
    q("Pour étudier une fonction, on commence par déterminer son domaine.", true, "Toutes les autres étapes (parité, limites, dérivée) se font sur ce domaine."),
    q("Le domaine de $f(x)=\\arcsin(x)+\\sqrt{1-x^2}$ est $[-1\\,;1]$.", true, "arcsin demande $x \\in [-1\\,;1]$, et la racine $1-x^2 \\ge 0$ : le même intervalle."),
    q("Le domaine de $f(x)=\\arcsin(x-3)$ est $[-1\\,;1]$.", false, "$-1 \\le x-3 \\le 1$ donne $x \\in [2\\,;4]$."),
    q("$g(x)=\\arctan(x)-\\dfrac{x}{2}$ est impaire.", true, "$g(-x)=-\\arctan(x)+\\dfrac{x}{2}=-g(x)$."),
    q("$f(x)=x\\arctan(x)$ est paire.", true, "C'est le produit de deux fonctions impaires : $f(-x)=(-x) \\cdot (-\\arctan x)=f(x)$."),
    q("$f(x)=x+\\arctan(x)$ est paire.", false, "C'est la somme de deux fonctions impaires : elle est impaire."),
    q("Une fonction impaire peut s'étudier sur $[0\\,;+\\infty[$, puis se compléter par symétrie centrale.", true, "Son graphe est symétrique par rapport à l'origine."),
    q("$\\displaystyle\\lim_{x \\to +\\infty} \\arctan(x)=+\\infty$.", false, "arctan est bornée : sa limite en $+\\infty$ vaut $\\dfrac{\\pi}{2}$."),
    q("$\\displaystyle\\lim_{x \\to +\\infty} \\left(\\arctan(x)-\\dfrac{x}{2}\\right)=-\\infty$.", true, "$\\arctan(x)$ tend vers $\\dfrac{\\pi}{2}$, tandis que $-\\dfrac{x}{2}$ tend vers $-\\infty$."),
    q("La droite $y=-\\dfrac{x}{2}+\\dfrac{\\pi}{2}$ est asymptote oblique au graphe de $\\arctan(x)-\\dfrac{x}{2}$ en $+\\infty$.", true, "L'écart à cette droite, $\\arctan(x)-\\dfrac{\\pi}{2}$, tend vers $0$."),
    q("$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{\\arctan(x)}{x}=\\dfrac{\\pi}{2}$.", false, "Le numérateur tend vers $\\dfrac{\\pi}{2}$ et le dénominateur vers $+\\infty$ : le quotient tend vers $0$."),
    q("$f(x)=2x+\\arctan(x)$ a pour asymptote oblique $y=2x+\\dfrac{\\pi}{2}$ en $+\\infty$.", true, "$f(x)-2x=\\arctan(x)$ tend vers $\\dfrac{\\pi}{2}$."),
    q("$f(x)=2x+\\arctan(x)$ a la même asymptote oblique en $+\\infty$ et en $-\\infty$.", false, "En $-\\infty$, $\\arctan(x)$ tend vers $-\\dfrac{\\pi}{2}$ : l'asymptote y est $y=2x-\\dfrac{\\pi}{2}$."),
    q("$f(x)=\\arcsin(x)+x$ a une asymptote verticale en $x=1$.", false, "Elle est définie et continue en $1$, où elle vaut $\\dfrac{\\pi}{2}+1$ : pas d'asymptote."),
    q("$\\left(\\arctan(x)-\\dfrac{x}{2}\\right)'=\\dfrac{1-x^2}{2(1+x^2)}$.", true, "C'est $\\dfrac{1}{1+x^2}-\\dfrac{1}{2}$, réduit au même dénominateur."),
    q("$g(x)=\\arctan(x)-\\dfrac{x}{2}$ est croissante sur $\\mathbb{R}$.", false, "$g'(x)=\\dfrac{1-x^2}{2(1+x^2)}$ est négative pour $x>1$."),
    q("$g(x)=\\arctan(x)-\\dfrac{x}{2}$ a un maximum en $x=1$.", true, "$g'$ passe de positive à négative en $x=1$."),
    q("Le maximum de $g(x)=\\arctan(x)-\\dfrac{x}{2}$ vaut $\\dfrac{\\pi}{4}$.", false, "$g(1)=\\dfrac{\\pi}{4}-\\dfrac{1}{2} \\approx 0{,}29$."),
    q("Pour $f(x)=x\\arctan(x)$, $f'(x)=\\arctan(x)+\\dfrac{x}{1+x^2}$.", true, "Dérivée d'un produit : $1 \\cdot \\arctan(x)+x \\cdot \\dfrac{1}{1+x^2}$."),
    q("$f(x)=x\\arctan(x)$ a un minimum en $0$, de valeur $0$.", true, "$f'$ est du signe de $x$ : négative avant $0$, positive après."),
    q("$f(x)=x\\arctan(x)$ est négative pour $x<0$.", false, "Pour $x<0$, $x$ et $\\arctan(x)$ sont tous deux négatifs : leur produit est positif."),
    q("Si $f'$ s'annule en $a$ en changeant de signe, alors $f$ a un extremum en $a$.", true, "C'est le critère du changement de signe de la dérivée."),
    q("Si $f'(a)=0$, alors $f$ a forcément un extremum en $a$.", false, "Il faut un changement de signe : $x \\mapsto x^3$ a une dérivée nulle en $0$, sans extremum."),
    q("$f(x)=\\arcsin(x)+\\sqrt{1-x^2}$ a pour dérivée $\\dfrac{1-x}{\\sqrt{1-x^2}}$ sur $]-1\\,;1[$.", true, "C'est $\\dfrac{1}{\\sqrt{1-x^2}}+\\dfrac{-x}{\\sqrt{1-x^2}}$."),
    q("$f(x)=\\arcsin(x)+\\sqrt{1-x^2}$ est croissante sur $[-1\\,;1]$.", true, "Sa dérivée $\\dfrac{1-x}{\\sqrt{1-x^2}}$ est positive sur $]-1\\,;1[$."),
    q("Le minimum de $f(x)=\\arcsin(x)+\\sqrt{1-x^2}$ est atteint en $x=0$.", false, "$f$ est croissante : son minimum est en $x=-1$, où il vaut $-\\dfrac{\\pi}{2}$."),
    q("Une fonction strictement croissante sur un intervalle fermé $[a\\,;b]$ atteint son maximum à l'intérieur de cet intervalle.", false, "Elle l'atteint en $b$ : toute autre valeur est inférieure à $f(b)$."),
    q("Pour $f(x)=\\arccos(2x)$, l'étude se fait sur $\\mathbb{R}$.", false, "Le domaine est $\\left[-\\dfrac{1}{2}\\,;\\dfrac{1}{2}\\right]$ : $2x$ doit être dans $[-1\\,;1]$."),
    q("$h(x)=\\arctan(x)-x$ est décroissante sur $\\mathbb{R}$.", true, "$h'(x)=\\dfrac{1}{1+x^2}-1=-\\dfrac{x^2}{1+x^2} \\le 0$, nulle seulement en $0$."),
    q("Le graphe de $f(x)=x\\arctan(x)$ admet l'asymptote horizontale $y=\\dfrac{\\pi}{2}$.", false, "$f(x)$ tend vers $+\\infty$ en $\\pm\\infty$ : pas d'asymptote horizontale, mais deux asymptotes obliques."),
    q("Pour une asymptote oblique $y=ax+b$ en $+\\infty$, on a $a=\\displaystyle\\lim_{x \\to +\\infty} f(x)$.", false, "$a=\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{f(x)}{x}$, puis $b=\\displaystyle\\lim_{x \\to +\\infty} \\big(f(x)-ax\\big)$."),
    q("La dérivée d'une fonction paire est paire.", false, "Elle est impaire : par exemple, $x^2$ a pour dérivée $2x$."),
    q("Le tableau de variations de $g(x)=\\arctan(x)-\\dfrac{x}{2}$ montre deux extremums.", true, "Un minimum en $x=-1$ et un maximum en $x=1$, où $g'$ change de signe."),
    q("$f(x)=\\arctan(x^2)$ est impaire.", false, "$f(-x)=\\arctan\\left((-x)^2\\right)=f(x)$ : elle est paire."),
    q("$f(x)=\\arctan(x^2)$ a pour asymptote horizontale $y=\\dfrac{\\pi}{2}$, en $+\\infty$ comme en $-\\infty$.", true, "$x^2$ tend vers $+\\infty$ des deux côtés, et $\\arctan(u)$ tend vers $\\dfrac{\\pi}{2}$ quand $u$ tend vers $+\\infty$."),
  ],
};
