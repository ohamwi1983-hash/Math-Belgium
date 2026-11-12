/**
 * Couche A — banque de contenu pour "Nombres complexes" (quiz vrai/faux), chapitre 5 du chantier
 * 6e (6h) (6gen68). 180 affirmations PRÉ-ÉCRITES — 20 par thème (10 vraies / 10 fausses), 9 thèmes,
 * un par générateur du chapitre (6gen34 à 6gen42) — jamais générées procéduralement, voir
 * `core6e/quizNombresComplexes.types.ts`.
 *
 * Réécriture complète (audit du chapitre 5, décision L) de l'ancienne banque de 315 affirmations :
 * - plus aucune « paire miroir » (la même affirmation posée une fois vraie, une fois fausse) ;
 * - plus aucune méta-affirmation (sur le générateur, la méthode de travail…) ;
 * - plus aucun « grand calcul » (`.claude/rules/quiz-generators.md`) : chaque affirmation se
 *   vérifie par un fait du cours ou un calcul d'une seule étape ;
 * - rien hors du cours `nombres-complexes.ts` (l'équation du second degré à coefficients complexes
 *   y est enseignée, § 3).
 *
 * Écriture : chaque énoncé/justification est rédigé comme une chaîne où `$…$` délimite le LaTeX
 * (même convention que `RichText` du site), découpée en `FragmentConsigne[]` par `f()` — le format
 * attendu par les composants du quiz (`RenduFragments`) et par `lib/banquesVraiFaux.ts`.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizNombresComplexes } from "../../core6e/quizNombresComplexes.types";

/** Découpe « texte $latex$ texte » en fragments (segments impairs = LaTeX). */
function f(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((valeur, index): FragmentConsigne => (index % 2 === 1 ? { type: "latex", valeur } : { type: "texte", valeur }))
    .filter((fragment) => fragment.valeur !== "");
}

function q(reponse: boolean, enonce: string, justification: string): QuestionVraiFaux {
  return { enonce: f(enonce), reponse, justification: f(justification) };
}

export const BANQUE_QUIZ_NOMBRES_COMPLEXES: Record<VarianteQuizNombresComplexes, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Opérations de base et puissances de i (6gen34)
  // ==========================================================================
  operationsBase: [
    q(true, "$(3+2i)+(1-5i)=4-3i$.", "On additionne séparément les parties réelles ($3+1=4$) et les parties imaginaires ($2-5=-3$)."),
    q(true, "$i^3=-i$.", "$i^3=i^2\\cdot i=-1\\cdot i=-i$."),
    q(true, "$i^{2021}=i$.", "$2021=4\\times505+1$ : le reste de la division par 4 vaut 1, donc $i^{2021}=i^1=i$."),
    q(true, "Pour tout complexe $z$, le nombre $z+\\bar z$ est réel.", "Pour $z=a+bi$ : $z+\\bar z=(a+bi)+(a-bi)=2a$, un réel."),
    q(true, "Pour $z=a+bi$, on a $z\\cdot\\bar z=a^2+b^2$.", "$(a+bi)(a-bi)=a^2-(bi)^2=a^2-b^2i^2=a^2+b^2$ : un réel positif ou nul."),
    q(true, "$(1+i)^2=2i$.", "$(1+i)^2=1+2i+i^2=1+2i-1=2i$."),
    q(true, "$\\dfrac{1}{i}=-i$.", "$i\\cdot(-i)=-i^2=1$ : $-i$ est bien l'inverse de $i$."),
    q(true, "Pour calculer $\\dfrac{3+i}{1-i}$, on multiplie numérateur et dénominateur par $1+i$.", "On multiplie par le conjugué du dénominateur : $(1-i)(1+i)=1+1=2$, le dénominateur devient réel."),
    q(true, "Si $a+bi=3-2i$ avec $a$ et $b$ réels, alors $a=3$ et $b=-2$.", "Deux complexes sont égaux si et seulement s'ils ont la même partie réelle et la même partie imaginaire."),
    q(true, "Tout nombre complexe non nul possède un inverse dans $\\mathbb{C}$.", "Pour $z=a+bi\\ne0$ : $\\dfrac{1}{z}=\\dfrac{a-bi}{a^2+b^2}$, bien défini car $a^2+b^2\\ne0$."),
    q(false, "Le conjugué de $5-3i$ est $-5+3i$.", "$-5+3i$ est l'opposé de $5-3i$. Le conjugué ne change que le signe de la partie imaginaire : $\\overline{5-3i}=5+3i$."),
    q(false, "$i^4=-1$.", "$i^4=(i^2)^2=(-1)^2=1$ : c'est la fin d'un cycle de période 4."),
    q(false, "Pour tous réels $a,b,c,d$ : $(a+bi)(c+di)=ac+bdi$.", "On développe les deux binômes : $(a+bi)(c+di)=ac+adi+bci+bdi^2$, puis on remplace $i^2$ par $-1$ : le produit vaut $(ac-bd)+(ad+bc)i$."),
    q(false, "Dans $\\mathbb{C}$, on a $2i>i$, puisque $2>1$.", "Il n'existe aucune relation d'ordre dans $\\mathbb{C}$ compatible avec les opérations : une inégalité entre deux complexes non réels n'a pas de sens."),
    q(false, "$i^{10}=1$.", "$10=4\\times2+2$ : le reste vaut 2, donc $i^{10}=i^2=-1$."),
    q(false, "$\\dfrac{1}{1+i}=1-i$.", "$(1+i)(1-i)=1+1=2\\ne1$. En fait, $\\dfrac{1}{1+i}=\\dfrac{1-i}{2}$."),
    q(false, "$i^2=1$.", "Par définition, $i^2=-1$ : c'est tout l'intérêt de $i$, qui donne une racine carrée à un nombre négatif."),
    q(false, "La partie imaginaire de $4-7i$ est $-7i$.", "La partie imaginaire est le réel qui multiplie $i$ : ici $-7$, pas $-7i$."),
    q(false, "Un nombre complexe dont la partie réelle est nulle est forcément nul.", "Contre-exemple : $3i$ a une partie réelle nulle mais n'est pas nul — c'est un imaginaire pur."),
    q(false, "Pour tout complexe $z$, le nombre $z\\cdot\\bar z$ peut être négatif.", "Pour $z=a+bi$, $z\\cdot\\bar z=a^2+b^2$, une somme de deux carrés de réels : toujours positive ou nulle."),
  ],

  // ==========================================================================
  // Thème 2 — Affixes et racines carrées (6gen35)
  // ==========================================================================
  affixesRacines: [
    q(true, "Le point $M(2;-3)$ a pour affixe $2-3i$.", "L'affixe de $M(a;b)$ est $a+bi$ : ici $2+(-3)i=2-3i$."),
    q(true, "Le vecteur $\\vec{AB}$ a pour affixe $z_B-z_A$.", "Comme en coordonnées : « extrémité moins origine »."),
    q(true, "Pour $z_A=1+2i$ et $z_B=3+6i$, le milieu de $[AB]$ a pour affixe $2+4i$.", "$z_M=\\dfrac{z_A+z_B}{2}=\\dfrac{4+8i}{2}=2+4i$."),
    q(true, "Pour $z_A=2$ et $z_B=2+3i$, la distance $AB$ vaut $3$.", "$AB=|z_B-z_A|=|3i|=3$."),
    q(true, "$ABCD$ est un parallélogramme si et seulement si $z_B-z_A=z_C-z_D$.", "L'égalité des affixes traduit l'égalité des vecteurs $\\vec{AB}=\\vec{DC}$, qui caractérise le parallélogramme $ABCD$."),
    q(true, "Les racines carrées de $3+4i$ sont $2+i$ et $-2-i$.", "$(2+i)^2=4+4i+i^2=3+4i$, et l'opposé $-2-i$ a le même carré."),
    q(true, "Pour trouver $x+iy$ tel que $(x+iy)^2=a+bi$, on identifie $x^2-y^2=a$ et $2xy=b$.", "$(x+iy)^2=(x^2-y^2)+2xyi$ : on égale les parties réelles, puis les parties imaginaires."),
    q(true, "Un nombre complexe non nul a exactement deux racines carrées, opposées l'une de l'autre.", "Si $z_0$ convient, $-z_0$ aussi, car $(-z_0)^2=z_0^2$ — et il n'y en a pas d'autre."),
    q(true, "$i$ est une racine carrée de $-1$.", "$i^2=-1$ par définition (l'autre racine carrée de $-1$ est $-i$)."),
    q(true, "Pour tous points $A$ et $B$, $|z_B-z_A|=|z_A-z_B|$.", "$z_A-z_B$ est l'opposé de $z_B-z_A$, et un complexe et son opposé ont le même module : $AB=BA$."),
    q(false, "Le point d'affixe $-i$ est situé sur l'axe des réels.", "$-i=0-1i$ correspond au point $(0;-1)$ : il est sur l'axe des imaginaires."),
    q(false, "La distance entre $A$ et $B$ vaut $|z_A+z_B|$.", "La distance utilise la DIFFÉRENCE des affixes : $AB=|z_B-z_A|$."),
    q(false, "Le milieu de $[AB]$ a pour affixe $\\dfrac{z_B-z_A}{2}$.", "Le milieu se calcule avec la SOMME : $z_M=\\dfrac{z_A+z_B}{2}$. $\\dfrac{z_B-z_A}{2}$ est l'affixe de la moitié du vecteur $\\vec{AB}$."),
    q(false, "Si $x+iy$ est une racine carrée de $a+bi$, alors $x^2+y^2=a^2+b^2$.", "C'est $(x^2+y^2)^2$ qui vaut $a^2+b^2$ ; la 3e équation est $x^2+y^2=\\sqrt{a^2+b^2}$, avec la racine carrée."),
    q(false, "$3+2i$ est une racine carrée de $5-12i$.", "$(3+2i)^2=9+12i-4=5+12i$, pas $5-12i$. Les racines carrées de $5-12i$ sont $3-2i$ et $-3+2i$."),
    q(false, "Le nombre $-9$ n'a aucune racine carrée dans $\\mathbb{C}$.", "$(3i)^2=9i^2=-9$ : les racines carrées de $-9$ sont $3i$ et $-3i$."),
    q(false, "Pour $z_A=2+i$ et $z_B=5+3i$, le vecteur $\\vec{AB}$ a pour affixe $-3-2i$.", "$z_B-z_A=(5-2)+(3-1)i=3+2i$ ; $-3-2i$ est l'affixe de $\\vec{BA}$."),
    q(false, "Les points d'affixes $3-2i$ et $3+2i$ sont symétriques par rapport à l'axe des imaginaires.", "Même partie réelle, parties imaginaires opposées : ils sont symétriques par rapport à l'axe des RÉELS."),
    q(false, "Pour $z_A=1+i$ et $z_B=4+5i$, la distance $AB$ vaut $7$.", "$z_B-z_A=3+4i$, donc $AB=\\sqrt{3^2+4^2}=5$, pas $3+4=7$."),
    q(false, "Dans le système de la racine carrée, l'équation $2xy=b$ sert à calculer $x^2$ et $y^2$.", "$x^2$ et $y^2$ viennent de $x^2-y^2=a$ et $x^2+y^2=\\sqrt{a^2+b^2}$ ; $2xy=b$ ne sert qu'à fixer le signe relatif de $x$ et $y$."),
  ],

  // ==========================================================================
  // Thème 3 — Équations dans ℂ (6gen36)
  // ==========================================================================
  equationsComplexes: [
    q(true, "Une équation $az^2+bz+c=0$ à coefficients réels avec $\\Delta<0$ a deux solutions complexes conjuguées.", "$z=\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}$ : même partie réelle, parties imaginaires opposées."),
    q(true, "Les solutions de $z^2+2z+5=0$ sont $-1+2i$ et $-1-2i$.", "$\\Delta=4-20=-16$, $\\sqrt{|\\Delta|}=4$, d'où $z=\\dfrac{-2\\pm4i}{2}=-1\\pm2i$."),
    q(true, "Les solutions de $z^2+4=0$ sont $2i$ et $-2i$.", "$z^2=-4=(2i)^2$, d'où $z=\\pm2i$."),
    q(true, "Pour résoudre $z^4-5z^2+4=0$, on pose $u=z^2$.", "Le changement de variable $u=z^2$ ramène l'équation bicarrée au second degré : $u^2-5u+4=0$."),
    q(true, "Dans $\\mathbb{C}$, un polynôme de degré 3 a exactement 3 racines, comptées avec leur multiplicité.", "C'est le théorème fondamental de l'algèbre : degré $n\\ge1$, exactement $n$ racines dans $\\mathbb{C}$."),
    q(true, "Si $2+3i$ est racine d'un polynôme à coefficients réels, alors $2-3i$ l'est aussi.", "Les racines non réelles d'un polynôme à coefficients RÉELS vont par paires conjuguées."),
    q(true, "Les quatre solutions de $z^4+5z^2+4=0$ sont imaginaires pures.", "$u=z^2$ vérifie $u^2+5u+4=0$, donc $u=-1$ ou $u=-4$ : $z=\\pm i$ ou $z=\\pm2i$."),
    q(true, "Si $\\Delta=-16$, on peut écrire $\\Delta=(4i)^2$.", "$(4i)^2=16i^2=-16$ : un discriminant négatif est le carré d'un imaginaire pur."),
    q(true, "Pour $z^2-3z+(3+i)=0$, le discriminant vaut $-3-4i$.", "$\\Delta=b^2-4ac=9-4(3+i)=9-12-4i=-3-4i$."),
    q(true, "Si le discriminant est un complexe non réel, on cherche ses racines carrées par le système $x^2-y^2$, $2xy$, $x^2+y^2$.", "C'est la méthode de la racine carrée d'un complexe (§ 2), appliquée à $\\Delta$ ; on termine ensuite avec $z=\\dfrac{-b\\pm\\delta}{2a}$."),
    q(false, "Si $\\Delta<0$, l'équation $az^2+bz+c=0$ n'a aucune solution dans $\\mathbb{C}$.", "Elle n'a aucune solution RÉELLE, mais deux solutions complexes conjuguées."),
    q(false, "Les solutions de $z^2+9=0$ sont $3$ et $-3$.", "$3^2=9$, pas $-9$. Les solutions sont $3i$ et $-3i$."),
    q(false, "Dans une équation bicarrée, une valeur négative de $u=z^2$ doit être rejetée.", "Dans $\\mathbb{C}$, un nombre négatif a deux racines carrées imaginaires pures : la valeur de $u$ donne deux solutions $z$."),
    q(false, "Une équation bicarrée $az^4+bz^2+c=0$ a au plus deux solutions dans $\\mathbb{C}$.", "Chaque valeur $u\\ne0$ donne 2 valeurs de $z$ : jusqu'à 4 solutions (c'est un polynôme de degré 4)."),
    q(false, "Les deux solutions d'une équation du second degré à coefficients complexes sont toujours conjuguées.", "Contre-exemple : $z^2-3z+(3+i)=0$ a pour solutions $2-i$ et $1+i$, qui ne sont pas conjuguées."),
    q(false, "Si $z_0$ est racine d'un polynôme, $\\bar z_0$ l'est aussi, quels que soient ses coefficients.", "Cette propriété exige des coefficients RÉELS ; avec des coefficients complexes, elle peut être fausse."),
    q(false, "Si $\\Delta=-16$, les solutions sont $z=\\dfrac{-b\\pm16i}{2a}$.", "On prend la racine carrée de $|\\Delta|$ : $\\sqrt{16}=4$, d'où $z=\\dfrac{-b\\pm4i}{2a}$."),
    q(false, "Dans $\\mathbb{C}$, un polynôme de degré 4 peut n'avoir aucune racine.", "Théorème fondamental de l'algèbre : il en a exactement 4, comptées avec leur multiplicité."),
    q(false, "Les deux solutions d'une équation $az^2+bz+c=0$ à coefficients réels et $\\Delta<0$ ont la même partie imaginaire.", "Elles ont la même partie réelle $-\\dfrac{b}{2a}$ et des parties imaginaires OPPOSÉES : elles sont conjuguées."),
    q(false, "Les solutions de $z^2-3z+(3+i)=0$ sont $2+i$ et $1-i$.", "Leur produit $(2+i)(1-i)=3-i$ devrait valoir $c=3+i$. Les solutions sont $2-i$ et $1+i$."),
  ],

  // ==========================================================================
  // Thème 4 — Forme trigonométrique, module et argument (6gen37)
  // ==========================================================================
  formeTrigonometrique: [
    q(true, "$|3+4i|=5$.", "$|3+4i|=\\sqrt{3^2+4^2}=\\sqrt{25}=5$."),
    q(true, "$\\arg(i)=\\dfrac{\\pi}{2}$, à $2\\pi$ près.", "Le point d'affixe $i$ est sur l'axe des imaginaires, au-dessus de l'origine."),
    q(true, "Le nombre $-2$ a pour module $2$ et pour argument $\\pi$, à $2\\pi$ près.", "Le point $(-2;0)$ est à distance 2 de l'origine, sur le demi-axe des réels négatifs : $-2=2e^{i\\pi}$."),
    q(true, "$1+i=\\sqrt2\\,e^{i\\pi/4}$.", "$|1+i|=\\sqrt2$ et, comme $a=b>0$, l'argument vaut $\\dfrac{\\pi}{4}$."),
    q(true, "$e^{i\\pi}=-1$.", "$e^{i\\pi}=\\cos\\pi+i\\sin\\pi=-1+0i$."),
    q(true, "$2e^{i\\pi/3}\\cdot3e^{i\\pi/6}=6e^{i\\pi/2}$.", "On multiplie les modules ($2\\times3=6$) et on additionne les arguments ($\\dfrac{\\pi}{3}+\\dfrac{\\pi}{6}=\\dfrac{\\pi}{2}$)."),
    q(true, "$\\dfrac{4e^{i\\pi/2}}{2e^{i\\pi/6}}=2e^{i\\pi/3}$.", "On divise les modules ($4/2=2$) et on soustrait les arguments ($\\dfrac{\\pi}{2}-\\dfrac{\\pi}{6}=\\dfrac{\\pi}{3}$)."),
    q(true, "Pour tout $z\\ne0$ : $|\\bar z|=|z|$ et $\\arg(\\bar z)=-\\arg(z)$, à $2\\pi$ près.", "Le conjugué est le symétrique par rapport à l'axe réel : même distance à l'origine, angle opposé."),
    q(true, "$\\dfrac{\\pi}{3}$ et $\\dfrac{7\\pi}{3}$ sont deux arguments du même nombre complexe.", "$\\dfrac{7\\pi}{3}-\\dfrac{\\pi}{3}=2\\pi$ : un argument n'est défini qu'à $2\\pi$ près."),
    q(true, "Si $a<0$, un argument de $a+bi$ s'obtient en ajoutant ou en retranchant $\\pi$ à $\\arctan\\dfrac{b}{a}$.", "$\\arctan\\dfrac{b}{a}$ donne un angle de $]-\\dfrac{\\pi}{2};\\dfrac{\\pi}{2}[$, celui du complexe opposé quand $a<0$ : il faut corriger de $\\pi$."),
    q(false, "$|1+i|=2$.", "$|1+i|=\\sqrt{1^2+1^2}=\\sqrt2$, pas $1+1$."),
    q(false, "$-3(\\cos\\theta+i\\sin\\theta)$ est une forme trigonométrique, de module $-3$.", "Un module est toujours positif ou nul. Ici, $-3(\\cos\\theta+i\\sin\\theta)=3(\\cos(\\theta+\\pi)+i\\sin(\\theta+\\pi))$, de module 3."),
    q(false, "Pour tous complexes $z_1$ et $z_2$ : $|z_1z_2|=|z_1|+|z_2|$.", "Dans un produit, les modules se MULTIPLIENT : $|z_1z_2|=|z_1|\\cdot|z_2|$."),
    q(false, "Pour tout $z\\ne0$ : $\\arg(-z)=-\\arg(z)$, à $2\\pi$ près.", "L'opposé est le symétrique par rapport à l'origine : $\\arg(-z)=\\arg(z)+\\pi$. C'est le CONJUGUÉ qui a l'argument opposé."),
    q(false, "$\\arg(-1-i)=\\dfrac{\\pi}{4}$, à $2\\pi$ près.", "Le point $(-1;-1)$ est dans le 3e quadrant : $\\arg(-1-i)=-\\dfrac{3\\pi}{4}$. $\\dfrac{\\pi}{4}$ est l'argument de l'opposé $1+i$."),
    q(false, "$e^{i\\pi/2}=1$.", "$e^{i\\pi/2}=\\cos\\dfrac{\\pi}{2}+i\\sin\\dfrac{\\pi}{2}=i$."),
    q(false, "Le module de $2i$ vaut $2i$.", "Un module est un réel positif (une distance) : $|2i|=2$."),
    q(false, "Pour tout $z\\ne0$ : $\\arg\\left(\\dfrac{1}{z}\\right)=\\arg(z)$, à $2\\pi$ près.", "L'inverse a l'argument opposé : $\\arg\\left(\\dfrac{1}{z}\\right)=-\\arg(z)$."),
    q(false, "Pour tout complexe $z$ : $|z^3|=3|z|$.", "$|z^3|=|z|\\cdot|z|\\cdot|z|=|z|^3$ : le module d'une puissance est la puissance du module."),
    q(false, "$re^{i\\theta}=r(\\cos\\theta-i\\sin\\theta)$.", "La formule d'Euler donne $e^{i\\theta}=\\cos\\theta+i\\sin\\theta$, avec un signe $+$ ; $r(\\cos\\theta-i\\sin\\theta)$ est le conjugué $re^{-i\\theta}$."),
  ],

  // ==========================================================================
  // Thème 5 — Formule de Moivre (6gen38)
  // ==========================================================================
  formuleMoivre: [
    q(true, "Pour tout entier $n$ : $(\\cos\\theta+i\\sin\\theta)^n=\\cos(n\\theta)+i\\sin(n\\theta)$.", "C'est la formule de Moivre : élever à la puissance $n$ un complexe de module 1 multiplie son argument par $n$."),
    q(true, "$\\left(\\cos\\dfrac{\\pi}{6}+i\\sin\\dfrac{\\pi}{6}\\right)^3=i$.", "Moivre : $\\cos\\dfrac{3\\pi}{6}+i\\sin\\dfrac{3\\pi}{6}=\\cos\\dfrac{\\pi}{2}+i\\sin\\dfrac{\\pi}{2}=i$."),
    q(true, "$\\left(e^{i\\pi/4}\\right)^4=-1$.", "$\\left(e^{i\\pi/4}\\right)^4=e^{i\\pi}=-1$."),
    q(true, "$(1+i)^4=-4$.", "$1+i=\\sqrt2\\,e^{i\\pi/4}$, donc $(1+i)^4=(\\sqrt2)^4e^{i\\pi}=4\\times(-1)=-4$."),
    q(true, "On obtient $\\cos(2x)=\\cos^2x-\\sin^2x$ en identifiant les parties réelles dans $(\\cos x+i\\sin x)^2=\\cos(2x)+i\\sin(2x)$.", "$(\\cos x+i\\sin x)^2=\\cos^2x+2i\\sin x\\cos x+i^2\\sin^2x$, de partie réelle $\\cos^2x-\\sin^2x$."),
    q(true, "Pour tout réel $x$ : $\\sin(2x)=2\\sin x\\cos x$.", "C'est la partie imaginaire de $(\\cos x+i\\sin x)^2$, comparée à celle de $\\cos(2x)+i\\sin(2x)$."),
    q(true, "Dans le développement de $(\\cos x+i\\sin x)^n$ par le binôme de Newton, chaque puissance $i^k$ se simplifie grâce au cycle de période 4.", "$i^k$ vaut $1$, $i$, $-1$ ou $-i$ selon le reste de $k$ dans la division par 4."),
    q(true, "Dans le développement de $(\\cos x+i\\sin x)^n$, les coefficients binomiaux $C(n,k)$ ne dépendent pas de $x$.", "Ils sont purement combinatoires : ils ne dépendent que de $n$ et de $k$, comme dans $(a+b)^n$."),
    q(true, "Si $z=2e^{i\\pi/5}$, alors $z^5=-32$.", "$z^5=2^5e^{i\\pi}=32\\times(-1)=-32$."),
    q(true, "La formule de Moivre est l'égalité $\\left(e^{i\\theta}\\right)^n=e^{in\\theta}$, écrite sous forme trigonométrique.", "Avec $e^{i\\theta}=\\cos\\theta+i\\sin\\theta$ (Euler), $\\left(e^{i\\theta}\\right)^n=e^{in\\theta}$ devient $(\\cos\\theta+i\\sin\\theta)^n=\\cos(n\\theta)+i\\sin(n\\theta)$."),
    q(false, "$(\\cos\\theta+i\\sin\\theta)^n=\\cos(\\theta^n)+i\\sin(\\theta^n)$.", "C'est l'ANGLE qui est multiplié par $n$, pas élevé à la puissance $n$ : on obtient $\\cos(n\\theta)+i\\sin(n\\theta)$."),
    q(false, "$(\\cos\\theta+i\\sin\\theta)^n=\\cos^n\\theta+i\\sin^n\\theta$.", "La puissance d'une somme n'est pas la somme des puissances ; la formule de Moivre donne $\\cos(n\\theta)+i\\sin(n\\theta)$."),
    q(false, "$\\left(e^{i\\pi/3}\\right)^3=1$.", "$\\left(e^{i\\pi/3}\\right)^3=e^{i\\pi}=-1$."),
    q(false, "Pour tout réel $x$ : $\\cos(2x)=\\cos^2x+\\sin^2x$.", "$\\cos^2x+\\sin^2x=1$ ; le $i^2=-1$ du développement donne un signe moins : $\\cos(2x)=\\cos^2x-\\sin^2x$."),
    q(false, "Pour tout réel $x$ : $\\sin(3x)=3\\cos^2x\\sin x+\\sin^3x$.", "Le terme $(i\\sin x)^3=i^3\\sin^3x=-i\\sin^3x$ donne un signe moins : $\\sin(3x)=3\\cos^2x\\sin x-\\sin^3x$."),
    q(false, "Dans le développement de $(\\cos x+i\\sin x)^4$, le terme $(i\\sin x)^4$ vaut $-\\sin^4x$.", "$i^4=1$, donc $(i\\sin x)^4=\\sin^4x$, avec un signe plus."),
    q(false, "$(2\\cos\\theta+2i\\sin\\theta)^n=2\\big(\\cos(n\\theta)+i\\sin(n\\theta)\\big)$.", "Le module 2 est lui aussi élevé à la puissance $n$ : $(2e^{i\\theta})^n=2^ne^{in\\theta}$."),
    q(false, "$(1+i)^8=16i$.", "$(1+i)^8=(\\sqrt2)^8e^{i\\cdot8\\pi/4}=16e^{2i\\pi}=16$."),
    q(false, "Si $|z|<1$, alors $|z^n|$ augmente quand $n$ augmente.", "$|z^n|=|z|^n$ et, pour $0\\le|z|<1$, les puissances successives diminuent (vers 0)."),
    q(false, "Dans le développement de $(\\cos x+i\\sin x)^n$, les termes d'indice $k$ pair forment la partie $i\\sin(nx)$.", "Pour $k$ pair, $i^k=\\pm1$ : ces termes sont réels et forment $\\cos(nx)$. Les termes d'indice impair donnent $i\\sin(nx)$."),
  ],

  // ==========================================================================
  // Thème 6 — Racines n-ièmes (6gen39)
  // ==========================================================================
  racinesNiemes: [
    q(true, "Un nombre complexe non nul a exactement $n$ racines $n$-ièmes.", "$z_k=r^{1/n}e^{i(\\theta+2k\\pi)/n}$ pour $k=0,1,\\ldots,n-1$ : $n$ valeurs distinctes."),
    q(true, "Les racines quatrièmes de l'unité sont $1$, $i$, $-1$ et $-i$.", "$e^{2ik\\pi/4}=e^{ik\\pi/2}$ pour $k=0,1,2,3$ : $1$, $i$, $-1$, $-i$."),
    q(true, "Les racines cubiques de $8$ ont toutes pour module $2$.", "Elles ont pour module $8^{1/3}=2$ ; seul leur argument change."),
    q(true, "Deux racines $n$-ièmes consécutives d'un complexe sont séparées d'un angle $\\dfrac{2\\pi}{n}$.", "Passer de $k$ à $k+1$ ajoute $\\dfrac{2\\pi}{n}$ à l'argument $\\dfrac{\\theta+2k\\pi}{n}$."),
    q(true, "Les racines cubiques de l'unité sont les sommets d'un triangle équilatéral.", "Trois points du cercle unité espacés de $\\dfrac{2\\pi}{3}$ : un polygone régulier à 3 côtés."),
    q(true, "Pour $n\\ge2$, la somme des racines $n$-ièmes de l'unité vaut $0$.", "Avec $\\omega=e^{2i\\pi/n}\\ne1$ : $(\\omega-1)(1+\\omega+\\ldots+\\omega^{n-1})=\\omega^n-1=0$."),
    q(true, "$e^{2i\\pi/3}$ est une racine cubique de $1$.", "$\\left(e^{2i\\pi/3}\\right)^3=e^{2i\\pi}=1$."),
    q(true, "$2e^{i\\pi/6}$ est une racine carrée de $4e^{i\\pi/3}$.", "$\\left(2e^{i\\pi/6}\\right)^2=4e^{i\\pi/3}$."),
    q(true, "Pour calculer les racines $n$-ièmes de $a+bi$, on commence par écrire $a+bi$ sous forme exponentielle.", "La formule $z_k=r^{1/n}e^{i(\\theta+2k\\pi)/n}$ demande le module $r$ et un argument $\\theta$."),
    q(true, "$i$ est une racine huitième de l'unité.", "$i^8=(i^4)^2=1$."),
    q(false, "$i$ est une racine cubique de $1$.", "$i^3=-i\\ne1$. $i$ est une racine QUATRIÈME de l'unité."),
    q(false, "Les racines quatrièmes de $16$ ont pour module $4$.", "Leur module est $16^{1/4}=2$ (car $2^4=16$)."),
    q(false, "Les racines $n$-ièmes de $re^{i\\theta}$ sont $z_k=r^{1/n}e^{i(\\theta+k\\pi)/n}$, pour $k=0,\\ldots,n-1$.", "L'espacement vient de $2k\\pi$, pas de $k\\pi$ : avec $k\\pi$, les racines seraient deux fois trop rapprochées."),
    q(false, "En prenant $k=n$ dans la formule des racines $n$-ièmes, on obtient une racine distincte des $n$ premières.", "Pour $k=n$, l'argument augmente de $2\\pi$ par rapport à $k=0$ : on retombe sur $z_0$."),
    q(false, "Les racines sixièmes de l'unité sont les sommets d'un carré.", "Six points espacés de $\\dfrac{2\\pi}{6}$ forment un hexagone régulier."),
    q(false, "Toutes les racines $n$-ièmes de l'unité sont réelles.", "Pour $n\\ge3$, certaines ne le sont pas : par exemple $e^{2i\\pi/3}$, racine cubique de 1."),
    q(false, "$-1$ est une racine cubique de $1$.", "$(-1)^3=-1\\ne1$."),
    q(false, "Les racines $n$-ièmes d'un complexe $z$ sont situées sur un cercle de centre le point d'affixe $z$.", "Elles ont toutes le même module $r^{1/n}$ : elles sont sur un cercle de centre $O$."),
    q(false, "$3e^{i\\pi/2}$ est une racine carrée de $9e^{i\\pi/2}$.", "$\\left(3e^{i\\pi/2}\\right)^2=9e^{i\\pi}=-9$. Il faut diviser l'argument par 2 : $3e^{i\\pi/4}$ convient."),
    q(false, "Le nombre $0$ a $n$ racines $n$-ièmes distinctes.", "$z^n=0$ n'a que la solution $z=0$ : la formule des $n$ racines suppose $z\\ne0$."),
  ],

  // ==========================================================================
  // Thème 7 — Transformations du plan (6gen40)
  // ==========================================================================
  transformationsPlan: [
    q(true, "$z'=z+3-2i$ est la translation de vecteur d'affixe $3-2i$.", "Additionner un complexe fixe $b$, c'est translater du vecteur d'affixe $b$."),
    q(true, "$z'=iz$ est la rotation de centre $O$ et d'angle $\\dfrac{\\pi}{2}$.", "$i=e^{i\\pi/2}$ a pour module 1 : multiplier par $i$ tourne d'un quart de tour autour de $O$."),
    q(true, "$z'=-z$ est la symétrie centrale de centre $O$.", "$-1=e^{i\\pi}$ : c'est la rotation de centre $O$ et d'angle $\\pi$."),
    q(true, "$z'=2z$ est l'homothétie de centre $O$ et de rapport $2$.", "Multiplier par un réel $k$ ($k\\ne0$, $k\\ne1$) donne l'homothétie de centre $O$ et de rapport $k$."),
    q(true, "Pour $z'=az+b$ avec $a\\ne1$, le centre a pour affixe $\\dfrac{b}{1-a}$.", "Le centre est l'unique point fixe : $z_0=az_0+b\\iff z_0(1-a)=b$."),
    q(true, "Le centre de la transformation $z'=2z-3$ a pour affixe $3$.", "$z_0=\\dfrac{b}{1-a}=\\dfrac{-3}{1-2}=3$ ; vérification : $2\\times3-3=3$."),
    q(true, "$z'=(1+i)z$ est la similitude de centre $O$, de rapport $\\sqrt2$ et d'angle $\\dfrac{\\pi}{4}$.", "$1+i=\\sqrt2\\,e^{i\\pi/4}$ : rapport $|a|=\\sqrt2$, angle $\\arg(a)=\\dfrac{\\pi}{4}$, centre $\\dfrac{0}{1-a}=0$."),
    q(true, "Une rotation conserve les distances.", "Son multiplicateur $e^{i\\theta}$ a pour module 1 : $|z'_1-z'_2|=|e^{i\\theta}|\\cdot|z_1-z_2|=|z_1-z_2|$."),
    q(true, "La rotation de centre $\\Omega(z_0)$ et d'angle $\\theta$ s'écrit $z'=e^{i\\theta}(z-z_0)+z_0$.", "On ramène le centre à l'origine ($z-z_0$), on tourne ($\\times e^{i\\theta}$), puis on translate de retour ($+z_0$)."),
    q(true, "$z'=e^{i\\pi/3}z+2$ est une rotation.", "$a=e^{i\\pi/3}$ vérifie $|a|=1$ et $a\\ne1$ : rotation d'angle $\\dfrac{\\pi}{3}$, de centre $\\dfrac{2}{1-e^{i\\pi/3}}$."),
    q(false, "$z'=3iz$ est une rotation.", "$|3i|=3\\ne1$ : c'est une similitude de rapport 3 et d'angle $\\dfrac{\\pi}{2}$, pas une rotation."),
    q(false, "$z'=z+2i$ est la rotation de centre le point d'affixe $2i$.", "Ajouter $2i$, c'est translater du vecteur d'affixe $2i$ ; une translation n'a aucun point fixe."),
    q(false, "Le centre de la transformation $z'=-z+4$ a pour affixe $4$.", "$z_0=\\dfrac{4}{1-(-1)}=2$ ; vérification : $-2+4=2$, alors que $-4+4=0\\ne4$."),
    q(false, "$z'=-2z$ est l'homothétie de centre $O$ et de rapport $2$.", "Le rapport est le réel $-2$ : l'image est de l'autre côté de $O$."),
    q(false, "La transformation $z'=z+b$, avec $b\\ne0$, a un unique point fixe.", "$z=z+b$ est impossible si $b\\ne0$ : une translation non nulle n'a aucun point fixe."),
    q(false, "$z'=iz$ est l'homothétie de centre $O$ et de rapport $i$.", "Le rapport d'une homothétie est RÉEL. Multiplier par $i$ (module 1) est une rotation d'angle $\\dfrac{\\pi}{2}$."),
    q(false, "Dans la formule de rotation, remplacer $(z-z_0)$ par $(z_0-z)$ ne change pas la transformation.", "$(z_0-z)=-(z-z_0)$ : on multiplie par $-1=e^{i\\pi}$, ce qui ajoute $\\pi$ à l'angle."),
    q(false, "L'angle de la similitude $z'=az+b$ est $|a|$.", "$|a|$ est le rapport ; l'angle est $\\arg(a)$."),
    q(false, "Une rotation et une translation commutent toujours.", "En général, l'ordre de composition compte. Seules deux transformations de MÊME centre commutent toujours."),
    q(false, "$z'=\\dfrac12z+1$ est l'homothétie de rapport $\\dfrac12$ et de centre le point d'affixe $1$.", "Le centre vaut $\\dfrac{1}{1-\\frac12}=2$ ; vérification : $\\dfrac12\\times2+1=2$."),
  ],

  // ==========================================================================
  // Thème 8 — Propriétés géométriques de triangles (6gen41)
  // ==========================================================================
  trianglesComplexes: [
    q(true, "Pour $A$, $B$, $C$ distincts : si $\\dfrac{z_C-z_A}{z_B-z_A}$ est réel, alors $A$, $B$ et $C$ sont alignés.", "Un rapport réel signifie que $\\vec{AC}$ et $\\vec{AB}$ sont colinéaires ; ils ont le point $A$ en commun."),
    q(true, "Si $\\dfrac{z_V}{z_U}$ est imaginaire pur, les vecteurs d'affixes $z_U$ et $z_V$ sont orthogonaux.", "L'argument du rapport vaut $\\pm\\dfrac{\\pi}{2}$ : l'angle entre les deux vecteurs est droit."),
    q(true, "$ABC$ est isocèle en $A$ si et seulement si $|z_B-z_A|=|z_C-z_A|$.", "Les deux modules sont les longueurs $AB$ et $AC$."),
    q(true, "Si $\\dfrac{z_C-z_A}{z_B-z_A}=i$, le triangle $ABC$ est isocèle rectangle en $A$.", "Module 1 : $AC=AB$ ; argument $\\dfrac{\\pi}{2}$ : angle droit en $A$. Il en va de même pour un rapport égal à $-i$."),
    q(true, "Les points d'affixes $0$, $1+i$ et $2+2i$ sont alignés.", "$\\dfrac{(2+2i)-0}{(1+i)-0}=2$, un réel."),
    q(true, "Si $F=B\\cdot e^{i\\pi/3}$ avec $B\\ne0$, le triangle $OBF$ est équilatéral.", "$OF=OB$ (module 1) et $BF=|B|\\cdot|e^{i\\pi/3}-1|=|B|$ : les trois côtés sont égaux."),
    q(true, "Le triangle de sommets $A(0)$, $B(1)$ et $C(i)$ est rectangle en $A$.", "$\\dfrac{z_C-z_A}{z_B-z_A}=\\dfrac{i}{1}=i$, imaginaire pur."),
    q(true, "Si $\\dfrac{z_C-z_A}{z_B-z_A}=-2$, les points $A$, $B$ et $C$ sont alignés.", "$-2$ est réel. Le signe moins indique seulement que $B$ et $C$ sont de part et d'autre de $A$."),
    q(true, "Pour $A$, $B$, $C$ distincts, le module de $\\dfrac{z_C-z_A}{z_B-z_A}$ vaut $\\dfrac{AC}{AB}$.", "Le module d'un quotient est le quotient des modules : $\\dfrac{|z_C-z_A|}{|z_B-z_A|}=\\dfrac{AC}{AB}$."),
    q(true, "Si $\\dfrac{z_C-z_A}{z_B-z_A}=e^{i\\pi/3}$, le triangle $ABC$ est équilatéral.", "Module 1 : $AC=AB$ ; argument $\\dfrac{\\pi}{3}$ : angle de $60°$ en $A$. Un triangle isocèle avec un angle de $60°$ au sommet est équilatéral."),
    q(false, "Pour $A$, $B$, $C$ distincts : si $\\dfrac{z_C-z_A}{z_B-z_A}$ est imaginaire pur, alors $A$, $B$ et $C$ sont alignés.", "Un rapport imaginaire pur signale une ORTHOGONALITÉ : le triangle est rectangle en $A$."),
    q(false, "$ABC$ est isocèle en $A$ si et seulement si $z_B-z_A=z_C-z_A$.", "Cette égalité des complexes forcerait $z_B=z_C$, donc $B=C$. Il faut l'égalité des MODULES."),
    q(false, "Si $\\dfrac{z_C-z_A}{z_B-z_A}=1+i$, le triangle $ABC$ est rectangle en $A$.", "$1+i$ n'est pas imaginaire pur : son argument vaut $\\dfrac{\\pi}{4}$, l'angle en $A$ mesure $45°$."),
    q(false, "Les points d'affixes $0$, $1$ et $1+i$ sont alignés.", "$\\dfrac{1+i}{1}=1+i$ n'est pas réel."),
    q(false, "Pour démontrer que $ABC$ est rectangle en $A$, il suffit de vérifier que $\\dfrac{z_B-z_A}{z_C-z_A}$ est réel.", "Un rapport réel prouve l'alignement. Pour un angle droit, il faut un rapport imaginaire pur."),
    q(false, "Si $\\dfrac{z_C-z_A}{z_B-z_A}$ est réel, alors $AB=AC$.", "Un rapport réel signifie l'alignement ; $AB=AC$ correspond à un rapport de MODULE 1."),
    q(false, "Si $F=B\\cdot e^{i\\pi/3}$ avec $B\\ne0$, le triangle $OBF$ est rectangle en $O$.", "L'angle en $O$ vaut $\\dfrac{\\pi}{3}$, soit $60°$ : le triangle est équilatéral."),
    q(false, "Les vecteurs d'affixes $1+2i$ et $2+4i$ sont orthogonaux.", "$\\dfrac{2+4i}{1+2i}=2$, un réel : les vecteurs sont colinéaires."),
    q(false, "Les vecteurs d'affixes $1+i$ et $1-i$ sont colinéaires.", "$\\dfrac{1+i}{1-i}=i$, imaginaire pur : les vecteurs sont orthogonaux."),
    q(false, "Si $|z_B-z_A|=|z_C-z_A|$, le triangle $ABC$ est équilatéral.", "Cette égalité donne seulement $AB=AC$ : le triangle est isocèle en $A$. Il faudrait aussi $BC=AB$."),
  ],

  // ==========================================================================
  // Thème 9 — Problèmes avancés (6gen42)
  // ==========================================================================
  complexesAvances: [
    q(true, "Pour $z=re^{i\\theta}$ avec $r>0$ : $z^n$ est réel si et seulement si $n\\theta\\equiv0\\pmod{\\pi}$.", "$z^n=r^ne^{in\\theta}$ est réel quand son argument $n\\theta$ est un multiple de $\\pi$."),
    q(true, "Pour $z=re^{i\\theta}$ avec $r>0$ : $z^n$ est un réel positif si et seulement si $n\\theta\\equiv0\\pmod{2\\pi}$.", "Le réel est positif quand l'argument est un multiple de $2\\pi$ (et négatif quand $n\\theta\\equiv\\pi\\pmod{2\\pi}$)."),
    q(true, "Pour $z=e^{i\\pi/4}$, le nombre $z^4$ est réel.", "$z^4=e^{i\\pi}=-1$, un réel (négatif)."),
    q(true, "Pour $z=e^{2i\\pi/3}$, on a $z^3=1$.", "$z^3=e^{2i\\pi}=1$ : $3\\theta=2\\pi\\equiv0\\pmod{2\\pi}$."),
    q(true, "L'ensemble des points $M$ d'affixe $z$ tels que $|z-(1+i)|=2$ est le cercle de centre le point d'affixe $1+i$ et de rayon $2$.", "$|z-a|$ est la distance entre $M$ et le point d'affixe $a$ ; elle vaut ici constamment 2."),
    q(true, "L'ensemble des points $M$ tels que $\\arg(z-a)\\equiv\\dfrac{\\pi}{4}\\pmod{2\\pi}$ est une demi-droite d'origine $A$, privée de $A$.", "Le vecteur $\\vec{AM}$ garde la direction ET le sens d'angle $\\dfrac{\\pi}{4}$ : un seul des deux rayons issus de $A$."),
    q(true, "L'ensemble des points $M$ tels que $\\arg(z-a)\\equiv\\theta_0\\pmod{\\pi}$ est une droite passant par $A$, privée de $A$.", "Modulo $\\pi$, on garde les deux sens opposés : les deux demi-droites forment une droite entière."),
    q(true, "Pour tout complexe $u$ : $|u|^2=u\\cdot\\bar u$.", "Pour $u=a+bi$ : $u\\cdot\\bar u=a^2+b^2=|u|^2$."),
    q(true, "Si $|z|=1$, alors $\\bar z=\\dfrac{1}{z}$.", "$z\\cdot\\bar z=|z|^2=1$, d'où $\\bar z=\\dfrac{1}{z}$ ($z\\ne0$)."),
    q(true, "Si $|z|=1$ et $|a|\\ne1$, le point d'affixe $\\dfrac{z-a}{1-\\bar az}$ appartient encore au cercle unité.", "On montre que $|1-\\bar az|=|z|\\cdot|\\bar z-\\bar a|=|z-a|$ : le quotient a pour module 1."),
    q(false, "Pour $z=e^{i\\pi/3}$, le nombre $z^3$ est un réel positif.", "$z^3=e^{i\\pi}=-1$ : il est réel, mais négatif ($3\\theta=\\pi$, pas un multiple de $2\\pi$)."),
    q(false, "Si $z^n$ est réel, il est forcément positif.", "Contre-exemple : $\\left(e^{i\\pi/2}\\right)^2=e^{i\\pi}=-1$. « Réel » se traduit modulo $\\pi$, « réel positif » modulo $2\\pi$."),
    q(false, "L'ensemble des points $M$ tels que $|z+2|=1$ est le cercle de centre le point d'affixe $2$ et de rayon $1$.", "$|z+2|=|z-(-2)|$ : le centre a pour affixe $-2$."),
    q(false, "L'ensemble des points $M$ tels que $|z-a|=k$, avec $k>0$, est un disque.", "Seuls les points situés à distance exactement $k$ de $A$ conviennent : c'est un cercle. Le disque correspond à $|z-a|\\le k$."),
    q(false, "Le point $A$ appartient à l'ensemble des points $M$ tels que $\\arg(z-a)\\equiv\\theta_0\\pmod{2\\pi}$.", "En $M=A$, $z-a=0$ n'a pas d'argument : $A$ est exclu de la demi-droite."),
    q(false, "L'ensemble des points $M$ tels que $|z-a|=-1$ est un cercle de rayon $1$.", "Un module n'est jamais négatif : cet ensemble est vide."),
    q(false, "Si $|z|=1$, alors $\\bar z=z$.", "$\\bar z=z$ caractérise les réels. Si $|z|=1$, on a $\\bar z=\\dfrac{1}{z}$ ; par exemple $\\bar i=-i\\ne i$."),
    q(false, "Pour $z=re^{i\\theta}$ avec $r>0$, la réponse à « $z^n$ est-il réel ? » dépend de $r$.", "$z^n=r^ne^{in\\theta}$ et $r^n>0$ : seul l'argument $n\\theta$ décide."),
    q(false, "Pour $z=e^{i\\theta}$ avec $\\theta\\in[0;2\\pi[$, la seule valeur de $\\theta$ telle que $z^3$ soit un réel positif est $\\theta=0$.", "$3\\theta\\equiv0\\pmod{2\\pi}$ donne $\\theta\\in\\left\\{0;\\dfrac{2\\pi}{3};\\dfrac{4\\pi}{3}\\right\\}$ : trois valeurs."),
    q(false, "Les points $M$ tels que $\\arg(z-i)\\equiv\\dfrac{\\pi}{2}\\pmod{2\\pi}$ sont situés sur l'axe des réels.", "Ils forment la demi-droite d'origine le point d'affixe $i$ (exclu), dirigée vers le haut : elle est sur l'axe des imaginaires."),
  ],
};
