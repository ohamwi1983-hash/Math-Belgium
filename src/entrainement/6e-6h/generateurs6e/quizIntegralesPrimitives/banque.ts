/**
 * Couche A — banque de contenu pour "Intégrales et primitives" (quiz vrai/faux), chapitre 4 du
 * chantier 6e (6h), ajout ultérieur (6gen67). 245 affirmations PRÉ-ÉCRITES (35 par thème, 7
 * thèmes), chacune vérifiée mathématiquement à la rédaction (calculs directs, cohérence avec les
 * générateurs déjà établis du chapitre pour les formules/pièges classiques) — jamais générées
 * procéduralement, voir `core6e/quizIntegralesPrimitives.types.ts`.
 *
 * Un thème par générateur déjà établi du chapitre 4 (6gen23 à 6gen29). `enonce`/`justification`
 * sont des `FragmentConsigne[]` (texte/LaTeX mêlés, jamais de `string` brute), même convention que
 * 6gen65/6gen66. Notation intégrale : `\displaystyle\int_{a}^{b} f(x)\,dx` — convention déjà
 * établie par `ui6e/formatIntegralesDefinies.ts` (6gen25), réutilisée ici à l'identique pour rester
 * cohérent avec ce générateur.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizIntegralesPrimitives } from "../../core6e/quizIntegralesPrimitives.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const BANQUE_QUIZ_INTEGRALES_PRIMITIVES: Record<VarianteQuizIntegralesPrimitives, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Calcul de primitives, ref 6gen23
  // ==========================================================================
  calculPrimitives: [
    {
      enonce: [texte("Pour tout "), latex("n\\neq-1"), texte(", "), latex("\\displaystyle\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1}+C"), texte(".")],
      reponse: true,
      justification: [texte("C'est la règle de primitivation d'une puissance : on augmente l'exposant de 1 et on divise par le nouvel exposant, à condition que celui-ci ne soit pas nul.")],
    },
    {
      enonce: [texte("Cette même formule "), latex("\\displaystyle\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1}+C"), texte(" reste valable pour "), latex("n=-1"), texte(".")],
      reponse: false,
      justification: [texte("Pour "), latex("n=-1"), texte(", le dénominateur "), latex("n+1"), texte(" vaudrait 0 : la formule est explicitement exclue dans ce cas. La primitive de "), latex("x^{-1}=1/x"), texte(" est "), latex("\\ln|x|+C"), texte(", pas une puissance de "), latex("x"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{x}\\,dx = \\ln(x)+C"), texte(".")],
      reponse: false,
      justification: [texte("Piège classique : "), latex("\\ln(x)"), texte(" n'est défini que pour "), latex("x>0"), texte(", alors que "), latex("1/x"), texte(" est aussi défini pour "), latex("x<0"), texte(". Il manque la valeur absolue.")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{x}\\,dx = \\ln|x|+C"), texte(", valable pour tout "), latex("x\\neq0"), texte(".")],
      reponse: true,
      justification: [texte("La valeur absolue étend le domaine de la primitive à "), latex("x<0"), texte(" comme à "), latex("x>0"), texte(", contrairement à "), latex("\\ln(x)"), texte(" seul.")],
    },
    {
      enonce: [latex("\\displaystyle\\int e^x\\,dx = e^x+C"), texte(".")],
      reponse: true,
      justification: [texte("La fonction exponentielle est sa propre primitive (à une constante près) — cas particulier immédiat.")],
    },
    {
      enonce: [latex("\\displaystyle\\int e^{3x}\\,dx = e^{3x}+C"), texte(".")],
      reponse: false,
      justification: [texte("Il manque le facteur "), latex("1/3"), texte(" compensant la dérivée interne : dériver "), latex("e^{3x}"), texte(" donne "), latex("3e^{3x}"), texte(", pas "), latex("e^{3x}"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int e^{3x}\\,dx = \\dfrac{1}{3}e^{3x}+C"), texte(".")],
      reponse: true,
      justification: [texte("On vérifie par dérivation : "), latex("\\left(\\tfrac{1}{3}e^{3x}\\right)' = \\tfrac{1}{3}\\cdot3\\cdot e^{3x}=e^{3x}"), texte(", conforme.")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\cos(x)\\,dx = \\sin(x)+C"), texte(".")],
      reponse: true,
      justification: [texte("Dérivée de "), latex("\\sin(x)"), texte(" est "), latex("\\cos(x)"), texte(" : c'est bien une primitive.")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\sin(x)\\,dx = \\cos(x)+C"), texte(".")],
      reponse: false,
      justification: [texte("Dérivée de "), latex("\\cos(x)"), texte(" est "), latex("-\\sin(x)"), texte(", pas "), latex("\\sin(x)"), texte(" : "), latex("\\cos(x)"), texte(" n'est pas une primitive de "), latex("\\sin(x)"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\sin(x)\\,dx = -\\cos(x)+C"), texte(".")],
      reponse: true,
      justification: [texte("On vérifie par dérivation : "), latex("(-\\cos(x))'=\\sin(x)"), texte(", conforme.")],
    },
    {
      enonce: [texte("Une fonction continue sur un intervalle admet une SEULE primitive sur cet intervalle.")],
      reponse: false,
      justification: [texte("Elle en admet une INFINITÉ : toute primitive additionnée d'une constante "), latex("C"), texte(" quelconque en est une autre.")],
    },
    {
      enonce: [texte("Si "), latex("F"), texte(" et "), latex("G"), texte(" sont deux primitives de "), latex("f"), texte(" sur un même intervalle, alors "), latex("F-G"), texte(" est une fonction constante.")],
      reponse: true,
      justification: [texte("C'est le théorème central du chapitre : deux primitives d'une même fonction sur un intervalle ne diffèrent que d'une constante additive.")],
    },
    {
      enonce: [texte("Pour "), latex("a>0"), texte(", "), latex("a\\neq1"), texte(" : "), latex("\\displaystyle\\int a^x\\,dx = \\dfrac{a^x}{\\ln(a)}+C"), texte(".")],
      reponse: true,
      justification: [texte("On vérifie par dérivation : "), latex("\\left(\\tfrac{a^x}{\\ln a}\\right)'=\\tfrac{a^x\\ln a}{\\ln a}=a^x"), texte(", conforme.")],
    },
    {
      enonce: [texte("Pour "), latex("a>0"), texte(", "), latex("a\\neq1"), texte(", "), latex("a\\neq e"), texte(" : "), latex("\\displaystyle\\int a^x\\,dx = a^x+C"), texte(".")],
      reponse: false,
      justification: [texte("Ce n'est vrai QUE pour "), latex("a=e"), texte(" (car "), latex("\\ln(e)=1"), texte("). Pour toute autre base, il faut diviser par "), latex("\\ln(a)"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{1+x^2}\\,dx = \\arctan(x)+C"), texte(".")],
      reponse: true,
      justification: [texte("C'est la primitive usuelle liée à "), latex("\\arctan"), texte(" : sa dérivée vaut exactement "), latex("1/(1+x^2)"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin(x)+C"), texte(", pour "), latex("x\\in\\,]-1;1["), texte(".")],
      reponse: true,
      justification: [texte("C'est la primitive usuelle liée à "), latex("\\arcsin"), texte(" : sa dérivée vaut exactement "), latex("1/\\sqrt{1-x^2}"), texte(" sur cet intervalle.")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{\\sqrt{1-x^2}}\\,dx = \\arccos(x)+C"), texte(".")],
      reponse: false,
      justification: [texte("La dérivée de "), latex("\\arccos(x)"), texte(" vaut "), latex("-1/\\sqrt{1-x^2}"), texte(" (signe opposé) : "), latex("\\arccos(x)"), texte(" est une primitive de "), latex("-1/\\sqrt{1-x^2}"), texte(", pas de "), latex("1/\\sqrt{1-x^2}"), texte(".")],
    },
    {
      enonce: [texte("La technique de substitution repose sur la reconnaissance d'une forme "), latex("u'(x)\\cdot f(u(x))"), texte(" dans l'intégrande.")],
      reponse: true,
      justification: [texte("Reconnaître qu'un facteur est exactement (à une constante près) la dérivée d'une expression composée ailleurs dans l'intégrande est le principe même de cette technique.")],
    },
    {
      enonce: [latex("\\displaystyle\\int 2x\\cdot e^{x^2}\\,dx = e^{x^2}+C"), texte(".")],
      reponse: true,
      justification: [texte("Ici "), latex("u(x)=x^2"), texte(" et "), latex("u'(x)=2x"), texte(" apparaît EXACTEMENT dans l'intégrande : c'est la forme "), latex("u'\\cdot e^u"), texte(", de primitive "), latex("e^u"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int x\\cdot e^{x^2}\\,dx = e^{x^2}+C"), texte(".")],
      reponse: false,
      justification: [texte("Ici "), latex("u'(x)=2x"), texte(" mais l'intégrande ne porte que "), latex("x"), texte(", pas "), latex("2x"), texte(" : il manque le facteur "), latex("1/2"), texte(". La bonne primitive est "), latex("\\tfrac{1}{2}e^{x^2}+C"), texte(".")],
    },
    {
      enonce: [texte("La formule d'intégration par parties s'écrit "), latex("\\displaystyle\\int f(x)\\cdot g'(x)\\,dx = f(x)\\cdot g(x)-\\displaystyle\\int f'(x)\\cdot g(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("Elle s'obtient en primitivant les deux membres de "), latex("(f\\cdot g)'=f\\cdot g'+f'\\cdot g"), texte(" (dérivée d'un produit), puis en isolant "), latex("\\int f\\cdot g'"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int x\\cdot e^x\\,dx = (x-1)e^x+C"), texte(".")],
      reponse: true,
      justification: [texte("Intégration par parties avec "), latex("f(x)=x"), texte(" et "), latex("g'(x)=e^x"), texte(" : "), latex("x e^x-\\int e^x\\,dx=(x-1)e^x+C"), texte(". Vérification par dérivation : "), latex("\\big((x-1)e^x\\big)'=e^x+(x-1)e^x=x e^x"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int x\\cdot e^x\\,dx = (x+1)e^x+C"), texte(".")],
      reponse: false,
      justification: [texte("Dériver donne "), latex("e^x+(x+1)e^x=(x+2)e^x"), texte(", pas "), latex("x e^x"), texte(". Le bon résultat est "), latex("(x-1)e^x+C"), texte(" (signe "), latex("-"), texte(", pas "), latex("+"), texte(").")],
    },
    {
      enonce: [texte("Pour calculer "), latex("\\displaystyle\\int x\\cdot e^x\\,dx"), texte(" par parties, choisir "), latex("f(x)=e^x"), texte(" et "), latex("g'(x)=x"), texte(" est mathématiquement FAUX.")],
      reponse: false,
      justification: [texte("Ce choix n'est pas faux, il est seulement MALADROIT : il mène à "), latex("\\int e^x\\cdot\\tfrac{x^2}{2}\\,dx"), texte(", plus compliquée que l'intégrale de départ. Le bon réflexe est de dériver le facteur qui se simplifie en dérivant ("), latex("x\\to1"), texte(").")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\tan(x)\\,dx = -\\ln|\\cos(x)|+C"), texte(".")],
      reponse: true,
      justification: [texte("On réécrit "), latex("\\tan(x)=\\dfrac{\\sin(x)}{\\cos(x)}"), texte(", forme "), latex("-u'/u"), texte(" avec "), latex("u=\\cos(x)"), texte(". Vérification : "), latex("\\big(-\\ln|\\cos x|\\big)'=-\\dfrac{-\\sin x}{\\cos x}=\\tan x"), texte(".")],
    },
    {
      enonce: [texte("Pour intégrer "), latex("\\cos^2(x)"), texte(", on utilise l'identité "), latex("\\cos^2(x)=\\dfrac{1-\\cos(2x)}{2}"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'identité de "), latex("\\sin^2(x)"), texte(". Pour le cosinus, le signe est "), latex("+"), texte(" : "), latex("\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\cos^2(x)\\,dx = \\dfrac{x}{2}+\\dfrac{\\sin(2x)}{4}+C"), texte(".")],
      reponse: true,
      justification: [texte("Linéarisation "), latex("\\cos^2(x)=\\tfrac{1+\\cos(2x)}{2}"), texte(", puis primitivation terme à terme. Vérification : "), latex("\\left(\\tfrac{x}{2}+\\tfrac{\\sin(2x)}{4}\\right)'=\\tfrac{1}{2}+\\tfrac{\\cos(2x)}{2}=\\cos^2(x)"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{x^2+4}\\,dx = \\arctan\\!\\left(\\dfrac{x}{2}\\right)+C"), texte(".")],
      reponse: false,
      justification: [texte("Dériver "), latex("\\arctan(x/2)"), texte(" donne "), latex("\\dfrac{1/2}{1+x^2/4}=\\dfrac{2}{4+x^2}"), texte(", soit le DOUBLE de l'intégrande. La bonne primitive est "), latex("\\tfrac{1}{2}\\arctan(x/2)+C"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{2x+1}{x^2+x+3}\\,dx = \\ln(x^2+x+3)+C"), texte(".")],
      reponse: true,
      justification: [texte("Forme "), latex("u'/u"), texte(" avec "), latex("u=x^2+x+3"), texte(" et "), latex("u'=2x+1"), texte(" exactement au numérateur. La valeur absolue est superflue ici : le discriminant "), latex("1-12=-11"), texte(" est négatif, donc "), latex("u>0"), texte(" partout.")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{x+1}{x^2+2x+5}\\,dx = \\ln(x^2+2x+5)+C"), texte(".")],
      reponse: false,
      justification: [texte("Ici "), latex("u'=2x+2"), texte(", alors que le numérateur "), latex("x+1"), texte(" n'en est que la MOITIÉ : il manque le facteur "), latex("1/2"), texte(". La bonne primitive est "), latex("\\tfrac{1}{2}\\ln(x^2+2x+5)+C"), texte(".")],
    },
    {
      enonce: [texte("Une fraction rationnelle dont le numérateur est de degré supérieur ou égal à celui du dénominateur se décompose directement en éléments simples, sans division préalable.")],
      reponse: false,
      justification: [texte("Une telle fraction est IMPROPRE : il faut d'abord effectuer la division, ce qui donne un quotient polynomial plus un reste. Seul le RESTE (fraction propre) se décompose ensuite en éléments simples.")],
    },
    {
      enonce: [texte("Pour "), latex("\\displaystyle\\int \\sqrt{a^2-x^2}\\,dx"), texte(", c'est la substitution "), latex("x=a\\tan(\\theta)"), texte(" qui élimine la racine.")],
      reponse: false,
      justification: [texte("Avec "), latex("x=a\\tan(\\theta)"), texte(", "), latex("a^2-a^2\\tan^2(\\theta)"), texte(" ne se simplifie pas. C'est "), latex("x=a\\sin(\\theta)"), texte(" qu'il faut poser : "), latex("a^2-a^2\\sin^2(\\theta)=a^2\\cos^2(\\theta)"), texte(", donc la racine vaut "), latex("a\\cos(\\theta)"), texte(". La substitution "), latex("x=a\\tan(\\theta)"), texte(" est celle adaptée à "), latex("\\sqrt{a^2+x^2}"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\dfrac{1}{x^2-1}\\,dx = \\dfrac{1}{2}\\ln\\left|\\dfrac{x-1}{x+1}\\right|+C"), texte(".")],
      reponse: true,
      justification: [texte("Décomposition en éléments simples : "), latex("\\dfrac{1}{x^2-1}=\\dfrac{1}{2}\\left(\\dfrac{1}{x-1}-\\dfrac{1}{x+1}\\right)"), texte(", dont une primitive est "), latex("\\tfrac{1}{2}\\big(\\ln|x-1|-\\ln|x+1|\\big)"), texte(", soit exactement l'expression donnée.")],
    },
    {
      enonce: [latex("\\displaystyle\\int \\sqrt{x}\\,dx = \\dfrac{3}{2}x^{3/2}+C"), texte(".")],
      reponse: false,
      justification: [latex("\\sqrt{x}=x^{1/2}"), texte(" : le nouvel exposant est "), latex("3/2"), texte(" et il faut DIVISER par "), latex("3/2"), texte(", donc multiplier par "), latex("2/3"), texte(". La bonne primitive est "), latex("\\tfrac{2}{3}x^{3/2}+C"), texte(".")],
    },
    {
      enonce: [texte("La notion de primitive ne peut être définie qu'une fois connue l'intégrale définie "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("La définition d'une primitive ("), latex("F'=f"), texte(" sur un intervalle) ne fait intervenir NI borne, NI aire, NI intégrale définie : c'est une pure inversion de la dérivation. C'est même l'ordre inverse qui est naturel — primitives d'abord, intégrale définie ensuite, le théorème fondamental reliant les deux.")],
    },
  ],

  // ==========================================================================
  // Thème 2 — Quelle primitive ? (condition initiale), ref 6gen24
  // ==========================================================================
  quellePrimitive: [
    {
      enonce: [texte("Une primitive de "), latex("f"), texte(" est déterminée à une constante additive près : si "), latex("F"), texte(" est une primitive de "), latex("f"), texte(", alors "), latex("F(x)+C"), texte(" l'est aussi pour tout réel "), latex("C"), texte(".")],
      reponse: true,
      justification: [texte("Dériver "), latex("F(x)+C"), texte(" redonne "), latex("F'(x)=f(x)"), texte(", quelle que soit la constante "), latex("C"), texte(" : c'est bien toujours une primitive.")],
    },
    {
      enonce: [texte("Sur un intervalle donné, une fonction admet une seule primitive.")],
      reponse: false,
      justification: [texte("Elle en admet une infinité, différant chacune d'une constante — c'est précisément pour cela qu'une condition initiale est nécessaire pour en isoler UNE seule.")],
    },
    {
      enonce: [texte("Pour déterminer la primitive qui vérifie une condition "), latex("F(x_0)=y_0"), texte(", on calcule d'abord une primitive générale "), latex("F(x)+C"), texte(", puis on résout l'équation "), latex("F(x_0)+C=y_0"), texte(" pour trouver "), latex("C"), texte(".")],
      reponse: true,
      justification: [texte("C'est exactement la méthode : calcul de la primitive générale (technique usuelle), puis substitution du point connu pour isoler "), latex("C"), texte(".")],
    },
    {
      enonce: [texte("La condition "), latex("F(x_0)=y_0"), texte(" permet de retrouver "), latex("x_0"), texte(", pas la constante "), latex("C"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("x_0"), texte(" et "), latex("y_0"), texte(" sont des données CONNUES de l'énoncé — c'est bien "), latex("C"), texte(", l'inconnue, que cette équation permet de déterminer.")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=2x"), texte(" et "), latex("F(0)=5"), texte(", alors "), latex("F(x)=x^2+5"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("x^2+C"), texte(". La condition donne "), latex("F(0)=0+C=5"), texte(", donc "), latex("C=5"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=2x"), texte(" et "), latex("F(0)=5"), texte(", alors "), latex("F(x)=x^2+2x+5"), texte(".")],
      reponse: false,
      justification: [texte("Le terme "), latex("2x"), texte(" en trop n'a rien à faire là : la primitive générale de "), latex("2x"), texte(" est "), latex("x^2+C"), texte(", sans terme linéaire additionnel.")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=3x^2"), texte(" et "), latex("F(1)=4"), texte(", alors "), latex("F(x)=x^3+3"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("x^3+C"), texte(". La condition donne "), latex("F(1)=1+C=4"), texte(", donc "), latex("C=3"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=3x^2"), texte(" et "), latex("F(1)=4"), texte(", alors "), latex("C=4"), texte(".")],
      reponse: false,
      justification: [texte("Il faut soustraire "), latex("1^3=1"), texte(" évalué en "), latex("x=1"), texte(" : "), latex("1+C=4"), texte(" donne "), latex("C=3"), texte(", pas "), latex("4"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=1/x"), texte(" (pour "), latex("x>0"), texte(") et "), latex("F(1)=2"), texte(", alors "), latex("F(x)=\\ln(x)+2"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("\\ln(x)+C"), texte(" (pour "), latex("x>0"), texte("). La condition donne "), latex("F(1)=\\ln(1)+C=0+C=2"), texte(", donc "), latex("C=2"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=1/x"), texte(" (pour "), latex("x>0"), texte(") et "), latex("F(1)=2"), texte(", alors "), latex("F(x)=\\ln(x)+1"), texte(".")],
      reponse: false,
      justification: [texte("Puisque "), latex("\\ln(1)=0"), texte(", la condition donne directement "), latex("C=2"), texte(", pas "), latex("1"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\cos(x)"), texte(" et "), latex("F(0)=1"), texte(", alors "), latex("F(x)=\\sin(x)+1"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("\\sin(x)+C"), texte(". La condition donne "), latex("F(0)=\\sin(0)+C=0+C=1"), texte(", donc "), latex("C=1"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\cos(x)"), texte(" et "), latex("F(0)=1"), texte(", alors "), latex("F(x)=-\\sin(x)+1"), texte(".")],
      reponse: false,
      justification: [texte("La primitive de "), latex("\\cos(x)"), texte(" est "), latex("\\sin(x)+C"), texte(", pas "), latex("-\\sin(x)+C"), texte(" (qui serait une primitive de "), latex("-\\cos(x)"), texte(").")],
    },
    {
      enonce: [texte("La constante "), latex("C"), texte(" se détermine en substituant "), latex("x_0"), texte(" dans la primitive générale, puis en résolvant une équation du premier degré en "), latex("C"), texte(" — jamais en la fixant arbitrairement.")],
      reponse: true,
      justification: [texte("C'est bien une équation linéaire en "), latex("C"), texte(" (de la forme "), latex("F(x_0)+C=y_0"), texte("), à résoudre systématiquement — jamais devinée.")],
    },
    {
      enonce: [texte("Quelle que soit la condition initiale donnée, la constante "), latex("C"), texte(" obtenue est toujours un nombre entier.")],
      reponse: false,
      justification: [texte("Rien ne garantit cela : "), latex("C"), texte(" peut très bien être une fraction ou même un nombre irrationnel, selon les valeurs de "), latex("x_0"), texte(" et "), latex("y_0"), texte(" choisies.")],
    },
    {
      enonce: [texte("On appelle « primitive particulière » toute primitive obtenue pour UNE valeur précise de "), latex("C"), texte(" — par opposition à la primitive générale "), latex("F(x)+C"), texte(", qui en regroupe une infinité.")],
      reponse: true,
      justification: [texte("C'est exactement la terminologie du cours : la primitive générale contient toutes les primitives possibles, une primitive particulière en fixe une seule.")],
    },
    {
      enonce: [texte("Le terme « solution », dans ce contexte, désigne la même chose que « racine » d'un polynôme intermédiaire.")],
      reponse: false,
      justification: [texte("Ces deux mots ne sont jamais interchangeables sur cette plateforme : une « racine » est un zéro d'un polynôme intermédiaire, une « solution » résout l'énoncé complet (ici, la valeur de "), latex("C"), texte(" ou l'expression finale de "), latex("F(x)"), texte(").")],
    },
    {
      enonce: [texte("Deux primitives différentes d'une même fonction, sur le même intervalle, ont des courbes représentatives qui se déduisent l'une de l'autre par une translation verticale.")],
      reponse: true,
      justification: [texte("Puisqu'elles diffèrent d'une constante "), latex("C"), texte(", leurs courbes sont identiques à une translation verticale de "), latex("C"), texte(" unités près.")],
    },
    {
      enonce: [texte("Si "), latex("F(x_0)=y_0"), texte(" admet plusieurs valeurs possibles pour "), latex("C"), texte(", il faut toutes les lister, comme pour une équation générale à plusieurs solutions.")],
      reponse: false,
      justification: [texte("L'équation "), latex("F(x_0)+C=y_0"), texte(" est du PREMIER degré en "), latex("C"), texte(" : elle admet toujours EXACTEMENT une solution, jamais plusieurs à lister.")],
    },
    {
      enonce: [texte("Une fois "), latex("C"), texte(" déterminé, la primitive "), latex("F"), texte(" obtenue vérifie "), latex("F'(x)=f(x)"), texte(" pour tout "), latex("x"), texte(" du domaine — la valeur de "), latex("C"), texte(" ne change jamais cette propriété.")],
      reponse: true,
      justification: [texte("Dériver une constante donne toujours 0 : quelle que soit la valeur choisie pour "), latex("C"), texte(", "), latex("F'(x)=f(x)"), texte(" reste vraie.")],
    },
    {
      enonce: [texte("Oublier la constante "), latex("C"), texte(" lors du calcul de la primitive générale n'empêche pas de vérifier correctement une condition initiale "), latex("F(x_0)=y_0"), texte(".")],
      reponse: false,
      justification: [texte("C'est justement le piège central de cet exercice : si "), latex("C"), texte(" est oublié (traité comme toujours nul), l'équation "), latex("F(x_0)=y_0"), texte(" ne peut plus être résolue correctement — "), latex("C"), texte(" doit rester gardé, symbolique, dès le premier calcul.")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=e^x"), texte(" et "), latex("F(0)=3"), texte(", alors "), latex("F(x)=e^x+2"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("e^x+C"), texte(". La condition donne "), latex("F(0)=e^0+C=1+C=3"), texte(", donc "), latex("C=2"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=e^x"), texte(" et "), latex("F(0)=3"), texte(", alors "), latex("F(x)=e^x+3"), texte(".")],
      reponse: false,
      justification: [texte("Cette expression donnerait "), latex("F(0)=1+3=4"), texte(", pas "), latex("3"), texte(" : "), latex("e^0=1"), texte(" (et non "), latex("0"), texte(") doit être retranché, d'où "), latex("C=2"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\sin(x)"), texte(" et "), latex("F\\!\\left(\\tfrac{\\pi}{2}\\right)=0"), texte(", alors "), latex("F(x)=-\\cos(x)"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("-\\cos(x)+C"), texte(". Comme "), latex("\\cos(\\pi/2)=0"), texte(", la condition donne "), latex("0+C=0"), texte(", donc "), latex("C=0"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\sin(x)"), texte(" et "), latex("F(0)=1"), texte(", alors "), latex("F(x)=-\\cos(x)+1"), texte(".")],
      reponse: false,
      justification: [texte("La condition donne "), latex("F(0)=-\\cos(0)+C=-1+C=1"), texte(", donc "), latex("C=2"), texte(" : la bonne primitive est "), latex("-\\cos(x)+2"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=4x^3-2"), texte(" et "), latex("F(1)=0"), texte(", alors "), latex("F(x)=x^4-2x+1"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("x^4-2x+C"), texte(". La condition donne "), latex("F(1)=1-2+C=0"), texte(", donc "), latex("C=1"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=3x^2+2x"), texte(" et "), latex("F(-1)=0"), texte(", alors "), latex("F(x)=x^3+x^2"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("x^3+x^2+C"), texte(". La condition donne "), latex("F(-1)=-1+1+C=C=0"), texte(" : ici la constante vaut bel et bien "), latex("0"), texte(", rien ne l'interdit.")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\cos(x)+2x"), texte(" et "), latex("F(0)=-1"), texte(", alors "), latex("F(x)=\\sin(x)+x^2-1"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale : "), latex("\\sin(x)+x^2+C"), texte(". La condition donne "), latex("F(0)=0+0+C=-1"), texte(", donc "), latex("C=-1"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=x"), texte(" et "), latex("F(2)=0"), texte(", alors "), latex("C=0"), texte(".")],
      reponse: false,
      justification: [texte("Primitive générale : "), latex("\\tfrac{x^2}{2}+C"), texte(". La condition donne "), latex("2+C=0"), texte(", donc "), latex("C=-2"), texte(" : une condition du type "), latex("F(x_0)=0"), texte(" n'entraîne jamais automatiquement "), latex("C=0"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\dfrac{1}{x}"), texte(" sur "), latex("]-\\infty;0["), texte(" et "), latex("F(-1)=0"), texte(", alors "), latex("F(x)=\\ln|x|"), texte(".")],
      reponse: true,
      justification: [texte("Sur cet intervalle, la primitive générale est "), latex("\\ln|x|+C"), texte(". Comme "), latex("\\ln|-1|=\\ln(1)=0"), texte(", la condition donne "), latex("C=0"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("f(x)=\\dfrac{1}{x}"), texte(" sur "), latex("]-\\infty;0["), texte(" et "), latex("F(-1)=0"), texte(", alors "), latex("F(x)=\\ln(x)"), texte(".")],
      reponse: false,
      justification: [latex("\\ln(x)"), texte(" n'est même pas défini pour "), latex("x<0"), texte(" : la condition "), latex("F(-1)=0"), texte(" n'y aurait aucun sens. C'est "), latex("\\ln|x|"), texte(" qu'il faut écrire sur cet intervalle.")],
    },
    {
      enonce: [texte("La condition initiale doit toujours être donnée en "), latex("x_0=0"), texte(" ; une condition en un autre point ne permet pas de déterminer "), latex("C"), texte(".")],
      reponse: false,
      justification: [texte("N'importe quel point "), latex("x_0"), texte(" du domaine convient : l'équation "), latex("F(x_0)+C=y_0"), texte(" reste du premier degré en "), latex("C"), texte(". "), latex("x_0=0"), texte(" simplifie souvent les calculs, sans jamais être obligatoire.")],
    },
    {
      enonce: [texte("Le point "), latex("(x_0;y_0)"), texte(" de la condition initiale appartient nécessairement au graphique de la primitive particulière cherchée.")],
      reponse: true,
      justification: [latex("F(x_0)=y_0"), texte(" signifie exactement que la courbe de "), latex("F"), texte(" passe par le point de coordonnées "), latex("(x_0;y_0)"), texte(".")],
    },
    {
      enonce: [texte("Deux primitives DIFFÉRENTES d'une même fonction, sur un même intervalle, peuvent toutes deux passer par le point "), latex("(x_0;y_0)"), texte(".")],
      reponse: false,
      justification: [texte("Elles diffèrent d'une constante : si elles coïncident en "), latex("x_0"), texte(", cette constante est nulle et elles sont donc égales PARTOUT. La primitive vérifiant une condition initiale donnée est unique.")],
    },
    {
      enonce: [texte("Graphiquement, chercher la primitive vérifiant "), latex("F(x_0)=y_0"), texte(" revient à choisir, dans la famille des courbes translatées verticalement, la seule qui passe par le point "), latex("(x_0;y_0)"), texte(".")],
      reponse: true,
      justification: [texte("Les primitives forment une famille de courbes déduites les unes des autres par translation verticale : une seule d'entre elles passe par un point donné.")],
    },
    {
      enonce: [texte("Une fois la condition initiale posée, on reste libre de choisir la valeur de "), latex("C"), texte(" qui simplifie le plus l'écriture finale.")],
      reponse: false,
      justification: [texte("La liberté de choix disparaît dès que la condition initiale est posée : l'équation "), latex("F(x_0)+C=y_0"), texte(" fixe "), latex("C"), texte(" à UNE valeur, qu'elle simplifie l'écriture ou non.")],
    },
  ],

  // ==========================================================================
  // Thème 3 — Intégrales définies, paramètre et valeur moyenne, ref 6gen25
  // ==========================================================================
  integralesDefinies: [
    {
      enonce: [latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx = F(b)-F(a)"), texte(", où "), latex("F"), texte(" est une primitive quelconque de "), latex("f"), texte(".")],
      reponse: true,
      justification: [texte("C'est le théorème fondamental de l'analyse : l'intégrale définie se calcule comme la différence des valeurs d'une primitive aux deux bornes.")],
    },
    {
      enonce: [texte("Le résultat de "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" dépend du choix de la primitive "), latex("F"), texte(" utilisée pour le calculer.")],
      reponse: false,
      justification: [texte("La constante "), latex("C"), texte(" s'annule toujours dans la soustraction : "), latex("(F(b)+C)-(F(a)+C)=F(b)-F(a)"), texte(", quel que soit "), latex("C"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx = -\\displaystyle\\int_{b}^{a} f(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("Échanger les bornes inverse le signe de l'intégrale : c'est une propriété directe de "), latex("F(b)-F(a)=-(F(a)-F(b))"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("a=b"), texte(", alors "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx = 1"), texte(".")],
      reponse: false,
      justification: [texte("Quand les deux bornes coïncident, l'intégrale vaut toujours "), latex("0"), texte(" (c'est "), latex("F(a)-F(a)"), texte("), jamais "), latex("1"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{a}^{a} f(x)\\,dx = 0"), texte(", pour tout réel "), latex("a"), texte(".")],
      reponse: true,
      justification: [texte("C'est "), latex("F(a)-F(a)=0"), texte(", quelle que soit la fonction "), latex("f"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{a}^{b} \\big(f(x)+g(x)\\big)\\,dx = \\displaystyle\\int_{a}^{b} f(x)\\,dx + \\displaystyle\\int_{a}^{b} g(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est la linéarité de l'intégrale par rapport à l'addition.")],
    },
    {
      enonce: [texte("Pour toute constante "), latex("k"), texte(", "), latex("\\displaystyle\\int_{a}^{b} k\\cdot f(x)\\,dx = k+\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("Une constante multiplicative se sort de l'intégrale en MULTIPLIANT, pas en s'additionnant : la bonne formule est "), latex("k\\cdot\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{a}^{b} k\\cdot f(x)\\,dx = k\\cdot\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est la linéarité de l'intégrale par rapport à la multiplication par une constante.")],
    },
    {
      enonce: [texte("La valeur moyenne de "), latex("f"), texte(" sur "), latex("[a;b]"), texte(" est donnée par "), latex("\\dfrac{1}{b-a}\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même de la valeur moyenne d'une fonction sur un intervalle : l'intégrale, divisée par la longueur de l'intervalle.")],
    },
    {
      enonce: [texte("La valeur moyenne de "), latex("f"), texte(" sur "), latex("[a;b]"), texte(" est donnée par "), latex("(b-a)\\cdot\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'opération inverse qu'il faut faire : DIVISER par "), latex("(b-a)"), texte(", pas multiplier.")],
    },
    {
      enonce: [texte("La valeur moyenne de "), latex("f(x)=x"), texte(" sur "), latex("[0;4]"), texte(" vaut "), latex("2"), texte(".")],
      reponse: true,
      justification: [texte("L'intégrale vaut "), latex("\\left[\\tfrac{x^2}{2}\\right]_0^4=8"), texte(", puis la valeur moyenne "), latex("8/(4-0)=2"), texte(".")],
    },
    {
      enonce: [texte("La valeur moyenne de "), latex("f(x)=x"), texte(" sur "), latex("[0;4]"), texte(" vaut "), latex("8"), texte(".")],
      reponse: false,
      justification: [texte("C'est la valeur de l'INTÉGRALE elle-même ("), latex("8"), texte(") qui est confondue avec la valeur moyenne — il manque la division par "), latex("b-a=4"), texte(", ce qui donne bien "), latex("2"), texte(", pas "), latex("8"), texte(".")],
    },
    {
      enonce: [texte("Si l'une des bornes d'une intégrale définie est un paramètre inconnu "), latex("m"), texte(" et que la valeur de l'intégrale est donnée, on peut poser l'équation "), latex("F(b)-F(m)=\\text{valeur donnée}"), texte(" (ou l'équivalent avec "), latex("a"), texte(") puis la résoudre en "), latex("m"), texte(".")],
      reponse: true,
      justification: [texte("C'est exactement la méthode : le théorème fondamental fournit une expression de l'intégrale en fonction de "), latex("m"), texte(", que l'on égale ensuite à la valeur connue.")],
    },
    {
      enonce: [texte("Une équation en "), latex("m"), texte(" obtenue à partir d'une intégrale définie n'admet jamais plus d'une solution.")],
      reponse: false,
      justification: [texte("Cela dépend de la technique : une intégrale polynomiale peut mener à une équation du second degré en "), latex("m"), texte(", admettant jusqu'à 2 solutions — ce n'est pas systématiquement une équation à solution unique.")],
    },
    {
      enonce: [texte("Si "), latex("\\displaystyle\\int_{0}^{m} 2x\\,dx = 9"), texte(" avec "), latex("m>0"), texte(", alors "), latex("m=3"), texte(".")],
      reponse: true,
      justification: [texte("L'intégrale vaut "), latex("[x^2]_0^m=m^2"), texte(". L'équation "), latex("m^2=9"), texte(" avec "), latex("m>0"), texte(" donne "), latex("m=3"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("\\displaystyle\\int_{0}^{m} 2x\\,dx = 9"), texte(" avec "), latex("m>0"), texte(", alors "), latex("m=9"), texte(".")],
      reponse: false,
      justification: [texte("L'équation obtenue est "), latex("m^2=9"), texte(", pas "), latex("m=9"), texte(" : il faut encore extraire la racine carrée, ce qui donne "), latex("m=3"), texte(".")],
    },
    {
      enonce: [texte("Le signe de "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" peut être négatif, même si "), latex("a<b"), texte(", lorsque "), latex("f"), texte(" prend des valeurs négatives sur "), latex("[a;b]"), texte(".")],
      reponse: true,
      justification: [texte("L'intégrale définie est une somme SIGNÉE : elle est négative si "), latex("f"), texte(" reste négative sur l'intervalle considéré.")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" est toujours positive dès que "), latex("a<b"), texte(", quelle que soit la fonction "), latex("f"), texte(".")],
      reponse: false,
      justification: [texte("Faux dès que "), latex("f"), texte(" prend des valeurs négatives sur "), latex("[a;b]"), texte(" : l'intégrale peut alors être négative, malgré "), latex("a<b"), texte(".")],
    },
    {
      enonce: [texte("Dans "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(", la variable "), latex("x"), texte(" est « muette » — elle peut être remplacée par n'importe quelle autre lettre sans changer la valeur de l'intégrale.")],
      reponse: true,
      justification: [texte("La variable d'intégration n'apparaît pas dans le résultat final (un nombre) : son nom n'a donc aucune influence sur la valeur de l'intégrale.")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" et "), latex("\\displaystyle\\int_{a}^{b} f(t)\\,dt"), texte(" représentent deux intégrales de valeurs potentiellement différentes.")],
      reponse: false,
      justification: [texte("Ce sont exactement la même intégrale : seul le nom de la variable muette change, jamais la valeur du résultat.")],
    },
    {
      enonce: [texte("Relation de Chasles : "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx = \\displaystyle\\int_{a}^{c} f(x)\\,dx + \\displaystyle\\int_{c}^{b} f(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est l'additivité de l'intégrale : avec une primitive "), latex("F"), texte(", le membre de droite vaut "), latex("(F(c)-F(a))+(F(b)-F(c))=F(b)-F(a)"), texte(".")],
    },
    {
      enonce: [texte("Cette relation de Chasles n'est valable que si "), latex("c"), texte(" est situé ENTRE "), latex("a"), texte(" et "), latex("b"), texte(".")],
      reponse: false,
      justification: [texte("Elle reste valable pour un "), latex("c"), texte(" pris HORS de "), latex("[a;b]"), texte(", grâce à la convention "), latex("\\int_{a}^{b}=-\\int_{b}^{a}"), texte(" — le calcul "), latex("(F(c)-F(a))+(F(b)-F(c))=F(b)-F(a)"), texte(" ne suppose aucun ordre entre les trois bornes, seulement que "), latex("f"), texte(" soit continue sur l'intervalle englobant.")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{0}^{1} e^x\\,dx = e-1"), texte(".")],
      reponse: true,
      justification: [latex("[e^x]_0^1=e^1-e^0=e-1"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{0}^{1} e^x\\,dx = e"), texte(".")],
      reponse: false,
      justification: [texte("Il manque la soustraction de la valeur en "), latex("0"), texte(" : "), latex("e^0=1"), texte(", pas "), latex("0"), texte(". Le résultat correct est "), latex("e-1"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{1}^{e} \\dfrac{1}{x}\\,dx = 1"), texte(".")],
      reponse: true,
      justification: [latex("[\\ln|x|]_1^e=\\ln(e)-\\ln(1)=1-0=1"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{0}^{\\pi} \\sin(x)\\,dx = 0"), texte(".")],
      reponse: false,
      justification: [latex("[-\\cos(x)]_0^{\\pi}=-\\cos(\\pi)+\\cos(0)=1+1=2"), texte(", pas "), latex("0"), texte(" : sur "), latex("[0;\\pi]"), texte(", "), latex("\\sin"), texte(" reste positive, donc l'intégrale ne peut pas être nulle.")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{0}^{\\pi} \\sin(x)\\,dx = 2"), texte(".")],
      reponse: true,
      justification: [latex("[-\\cos(x)]_0^{\\pi}=-(-1)-(-1)=2"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{-1}^{1} x^3\\,dx = \\dfrac{1}{2}"), texte(".")],
      reponse: false,
      justification: [latex("\\left[\\tfrac{x^4}{4}\\right]_{-1}^{1}=\\tfrac{1}{4}-\\tfrac{1}{4}=0"), texte(" : "), latex("x^3"), texte(" est impaire et l'intervalle est symétrique, l'intégrale est donc nulle.")],
    },
    {
      enonce: [texte("Si "), latex("f"), texte(" est continue et IMPAIRE, alors "), latex("\\displaystyle\\int_{-a}^{a} f(x)\\,dx = 0"), texte(" pour tout réel "), latex("a"), texte(".")],
      reponse: true,
      justification: [texte("Les contributions sur "), latex("[-a;0]"), texte(" et "), latex("[0;a]"), texte(" sont exactement opposées (symétrie par rapport à l'origine) : leur somme est nulle.")],
    },
    {
      enonce: [texte("Si "), latex("f"), texte(" est continue et PAIRE, alors "), latex("\\displaystyle\\int_{-a}^{a} f(x)\\,dx = 0"), texte(" pour tout réel "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("Pour une fonction paire, les deux moitiés sont ÉGALES, pas opposées : "), latex("\\int_{-a}^{a} f=2\\displaystyle\\int_{0}^{a} f"), texte(", en général non nulle (par exemple "), latex("\\int_{-1}^{1}x^2\\,dx=\\tfrac{2}{3}"), texte(").")],
    },
    {
      enonce: [texte("Le symbole "), latex("\\displaystyle\\int f(x)\\,dx"), texte(", écrit SANS bornes, désigne une famille de fonctions (toutes les primitives de "), latex("f"), texte("), alors que "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" désigne un NOMBRE.")],
      reponse: true,
      justification: [texte("C'est exactement la distinction entre intégrale INDÉFINIE ("), latex("\\int f(x)\\,dx=F(x)+C"), texte(", une famille de fonctions) et intégrale DÉFINIE ("), latex("F(b)-F(a)"), texte(", un nombre).")],
    },
    {
      enonce: [texte("Le symbole "), latex("\\displaystyle\\int f(x)\\,dx"), texte(", écrit sans bornes, désigne un nombre, exactement comme "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("Sans bornes, ce symbole désigne l'intégrale INDÉFINIE, c'est-à-dire l'ensemble "), latex("F(x)+C"), texte(" de toutes les primitives — une famille de FONCTIONS, jamais un nombre.")],
    },
    {
      enonce: [texte("Pour "), latex("f"), texte(" continue sur "), latex("[a;b]"), texte(", la valeur moyenne de "), latex("f"), texte(" sur cet intervalle est comprise entre le minimum et le maximum de "), latex("f"), texte(", et elle est effectivement ATTEINTE par "), latex("f"), texte(" en au moins un point de "), latex("[a;b]"), texte(".")],
      reponse: true,
      justification: [texte("L'encadrement "), latex("p\\leq f(x)\\leq q"), texte(" donne "), latex("p\\leq\\tfrac{1}{b-a}\\int_{a}^{b}f\\leq q"), texte(" ; le théorème des valeurs intermédiaires fournit alors un "), latex("r\\in[a;b]"), texte(" tel que "), latex("f(r)"), texte(" vaille exactement cette moyenne (théorème de la moyenne).")],
    },
    {
      enonce: [texte("La valeur moyenne d'une fonction continue sur "), latex("[a;b]"), texte(" n'est en général atteinte par aucune valeur de cette fonction sur l'intervalle.")],
      reponse: false,
      justification: [texte("C'est le contraire : par le théorème de la moyenne, elle est TOUJOURS atteinte en au moins un point lorsque "), latex("f"), texte(" est continue sur "), latex("[a;b]"), texte(".")],
    },
    {
      enonce: [texte("L'approximation de "), latex("\\displaystyle\\int_{0}^{4} x^2\\,dx"), texte(" par la méthode des trapèzes avec 4 sous-intervalles donne exactement "), latex("\\dfrac{64}{3}"), texte(".")],
      reponse: false,
      justification: [texte("Elle donne "), latex("\\tfrac{1}{2}[0+16+2(1+4+9)]=22"), texte(", alors que la valeur EXACTE est "), latex("64/3\\approx21{,}33"), texte(" : la méthode des trapèzes SURESTIME ici (la parabole est convexe, chaque corde passe au-dessus de la courbe) — c'est une approximation, jamais une égalité.")],
    },
  ],

  // ==========================================================================
  // Thème 4 — Calcul d'aires par intégrale, ref 6gen26
  // ==========================================================================
  calculAires: [
    {
      enonce: [texte("Si "), latex("f(x)\\geq0"), texte(" sur "), latex("[a;b]"), texte(", alors l'aire entre la courbe de "), latex("f"), texte(" et l'axe des abscisses, sur "), latex("[a;b]"), texte(", vaut "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("Quand "), latex("f"), texte(" reste positive, l'intégrale signée coïncide exactement avec l'aire géométrique.")],
    },
    {
      enonce: [texte("Si "), latex("f(x)\\leq0"), texte(" sur "), latex("[a;b]"), texte(", alors l'aire entre la courbe de "), latex("f"), texte(" et l'axe des abscisses vaut "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" (sans aucune valeur absolue ni signe "), latex("-"), texte(").")],
      reponse: false,
      justification: [texte("Cette intégrale serait alors négative, ce qu'une aire ne peut jamais être : il faut soit l'opposé, soit la valeur absolue.")],
    },
    {
      enonce: [texte("Si "), latex("f(x)\\leq0"), texte(" sur "), latex("[a;b]"), texte(", alors l'aire entre la courbe de "), latex("f"), texte(" et l'axe des abscisses vaut "), latex("-\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("L'intégrale étant négative dans ce cas, prendre son opposé donne bien une quantité positive, égale à l'aire.")],
    },
    {
      enonce: [texte("Une aire est toujours une quantité positive ou nulle, jamais négative.")],
      reponse: true,
      justification: [texte("C'est une propriété géométrique de base : une aire mesure une surface, elle ne peut pas être négative.")],
    },
    {
      enonce: [texte("L'intégrale signée "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" et l'aire entre la courbe et l'axe des abscisses désignent TOUJOURS exactement la même quantité.")],
      reponse: false,
      justification: [texte("Elles coïncident seulement quand "), latex("f"), texte(" garde un signe constant sur "), latex("[a;b]"), texte(". Si "), latex("f"), texte(" change de signe, l'intégrale signée additionne des parties positives et négatives qui se compensent, ce qui ne donne pas l'aire réelle.")],
    },
    {
      enonce: [texte("Si "), latex("f"), texte(" change de signe sur "), latex("[a;b]"), texte(", l'aire totale entre la courbe et l'axe s'obtient en découpant l'intervalle aux racines de "), latex("f"), texte(", puis en sommant la VALEUR ABSOLUE de chaque intégrale partielle.")],
      reponse: true,
      justification: [texte("C'est la méthode correcte : chaque morceau où "), latex("f"), texte(" garde un signe constant contribue par sa valeur absolue, jamais telle quelle si elle est négative.")],
    },
    {
      enonce: [texte("Si "), latex("f"), texte(" change de signe sur "), latex("[a;b]"), texte(", l'aire totale entre la courbe et l'axe s'obtient directement en calculant "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" sur l'intervalle entier, sans découper aux racines.")],
      reponse: false,
      justification: [texte("C'est LE piège classique : les parties positives et négatives se compensent dans une intégrale globale, donnant un résultat inférieur à l'aire réelle — il faut impérativement découper aux racines et sommer les valeurs absolues.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x"), texte(" sur "), latex("[-2;3]"), texte(", l'aire totale entre la courbe et l'axe des abscisses vaut "), latex("6{,}5"), texte(".")],
      reponse: true,
      justification: [texte("Sur "), latex("[-2;0]"), texte(", "), latex("f\\leq0"), texte(", aire "), latex("=-\\int_{-2}^{0}x\\,dx=2"), texte(". Sur "), latex("[0;3]"), texte(", "), latex("f\\geq0"), texte(", aire "), latex("=\\int_0^3x\\,dx=4{,}5"), texte(". Total "), latex("2+4{,}5=6{,}5"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x"), texte(" sur "), latex("[-2;3]"), texte(", l'aire totale entre la courbe et l'axe des abscisses vaut "), latex("2{,}5"), texte(".")],
      reponse: false,
      justification: [texte("C'est la valeur de l'intégrale SIGNÉE sur l'intervalle entier ("), latex("\\int_{-2}^{3}x\\,dx=2{,}5"), texte("), pas l'aire réelle : les parties négative et positive s'y compensent au lieu de s'additionner en valeur absolue.")],
    },
    {
      enonce: [texte("L'aire entre deux courbes "), latex("y=f(x)"), texte(" et "), latex("y=g(x)"), texte(", sur un intervalle "), latex("[a;b]"), texte(" où "), latex("f(x)\\geq g(x)"), texte(", vaut "), latex("\\displaystyle\\int_{a}^{b} \\big(f(x)-g(x)\\big)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("On intègre la différence entre la courbe SUPÉRIEURE et la courbe INFÉRIEURE, ce qui donne bien l'aire de la région comprise entre les deux.")],
    },
    {
      enonce: [texte("L'aire entre deux courbes "), latex("y=f(x)"), texte(" et "), latex("y=g(x)"), texte(" vaut toujours "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx-\\displaystyle\\int_{a}^{b} g(x)\\,dx"), texte(", même si l'ordre entre "), latex("f"), texte(" et "), latex("g"), texte(" s'inverse sur "), latex("[a;b]"), texte(" (sans jamais avoir à vérifier lequel est au-dessus).")],
      reponse: false,
      justification: [texte("Si les courbes se croisent, cette formule donne une valeur SIGNÉE où les portions se compensent — comme pour une aire sous une seule courbe, il faut découper aux points d'intersection et sommer les valeurs absolues.")],
    },
    {
      enonce: [texte("Pour calculer l'aire entre deux courbes qui se croisent sur "), latex("[a;b]"), texte(", il faut d'abord trouver leurs points d'intersection (racines de "), latex("f-g"), texte("), qui deviennent les bornes des sous-intervalles à traiter séparément.")],
      reponse: true,
      justification: [texte("C'est la méthode correcte, analogue au découpage aux racines pour une aire sous une seule courbe.")],
    },
    {
      enonce: [texte("Les racines d'un polynôme "), latex("f-g"), texte(" correspondent aux abscisses des points d'intersection des courbes de "), latex("f"), texte(" et de "), latex("g"), texte(".")],
      reponse: true,
      justification: [texte("Un point d'intersection vérifie "), latex("f(x)=g(x)"), texte(", c'est-à-dire "), latex("(f-g)(x)=0"), texte(" : c'est bien une racine de "), latex("f-g"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre les courbes de "), latex("f(x)=x^2"), texte(" et "), latex("g(x)=4"), texte(", entre leurs points d'intersection, vaut "), latex("32/3"), texte(".")],
      reponse: true,
      justification: [texte("Intersections en "), latex("x=\\pm2"), texte(" ("), latex("g\\geq f"), texte(" entre les deux). Aire "), latex("=\\int_{-2}^{2}(4-x^2)\\,dx=\\left[4x-\\tfrac{x^3}{3}\\right]_{-2}^{2}=\\tfrac{16}{3}-\\left(-\\tfrac{16}{3}\\right)=32/3"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre les courbes de "), latex("f(x)=x^2"), texte(" et "), latex("g(x)=4"), texte(", entre leurs points d'intersection, vaut "), latex("16/3"), texte(".")],
      reponse: false,
      justification: [texte("C'est seulement la valeur de la primitive évaluée en une seule borne ("), latex("x=2"), texte(") — la vraie aire, "), latex("32/3"), texte(", nécessite bien de soustraire la valeur en "), latex("x=-2"), texte(" (qui vaut "), latex("-16/3"), texte(", pas "), latex("0"), texte(").")],
    },
    {
      enonce: [texte("Si les bornes d'intégration ne sont pas données explicitement, elles peuvent être les racines d'une fonction — par exemple les points où une courbe recoupe l'axe des abscisses, ou les points d'intersection de deux courbes.")],
      reponse: true,
      justification: [texte("C'est une situation courante de ce type d'exercice : trouver les bornes fait alors partie du travail, avant même de calculer l'aire elle-même.")],
    },
    {
      enonce: [texte("Le signe d'une fonction polynomiale entre deux racines CONSÉCUTIVES (simples, sans autre racine entre elles) peut changer plusieurs fois.")],
      reponse: false,
      justification: [texte("Par continuité, un changement de signe exige un nouveau passage par zéro. S'il n'y a aucune autre racine entre les deux racines considérées, le signe reste nécessairement constant sur tout l'intervalle ouvert entre elles.")],
    },
    {
      enonce: [texte("Entre deux racines consécutives d'un polynôme (racines simples, aucune autre racine entre elles), le signe du polynôme reste constant.")],
      reponse: true,
      justification: [texte("C'est une conséquence directe de la continuité : un changement de signe nécessiterait un passage par zéro, donc une racine supplémentaire entre les deux.")],
    },
    {
      enonce: [texte("Le résultat d'un calcul d'aire, sur cette plateforme, doit toujours être exprimé sous forme exacte (fraction ou entier), jamais sous forme décimale arrondie.")],
      reponse: true,
      justification: [texte("C'est la convention générale de la plateforme : toute valeur générée reste une fraction irréductible ou un entier exact, jamais un décimal arrondi.")],
    },
    {
      enonce: [texte("Il est permis de laisser le résultat final d'un calcul d'aire sous forme décimale arrondie (par exemple "), latex("10{,}67"), texte("), à condition que l'arrondi soit précis à deux décimales.")],
      reponse: false,
      justification: [texte("Aucun arrondi n'est accepté comme réponse générée par la plateforme : la valeur exacte (fraction irréductible ou entier) est toujours exigée, quelle que soit la précision de l'arrondi proposé.")],
    },
    {
      enonce: [texte("L'aire entre la courbe de "), latex("f(x)=x^2"), texte(" et l'axe des abscisses, sur "), latex("[0;3]"), texte(", vaut "), latex("9"), texte(".")],
      reponse: true,
      justification: [latex("f\\geq0"), texte(" sur "), latex("[0;3]"), texte(", donc l'aire vaut "), latex("\\displaystyle\\int_{0}^{3} x^2\\,dx=\\left[\\tfrac{x^3}{3}\\right]_0^3=\\tfrac{27}{3}=9"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre la courbe de "), latex("f(x)=x^2"), texte(" et l'axe des abscisses, sur "), latex("[0;3]"), texte(", vaut "), latex("27"), texte(".")],
      reponse: false,
      justification: [texte("C'est "), latex("3^3"), texte(" sans la division par "), latex("3"), texte(" venant de la primitive "), latex("x^3/3"), texte(" : l'aire correcte est "), latex("9"), texte(".")],
    },
    {
      enonce: [texte("L'aire de la région comprise entre les courbes de "), latex("f(x)=x"), texte(" et "), latex("g(x)=x^2"), texte(", sur "), latex("[0;1]"), texte(", vaut "), latex("\\dfrac{1}{6}"), texte(".")],
      reponse: true,
      justification: [texte("Sur "), latex("[0;1]"), texte(", "), latex("x\\geq x^2"), texte(", donc l'aire vaut "), latex("\\displaystyle\\int_{0}^{1}(x-x^2)\\,dx=\\tfrac{1}{2}-\\tfrac{1}{3}=\\tfrac{1}{6}"), texte(".")],
    },
    {
      enonce: [texte("L'aire de la région comprise entre les courbes de "), latex("f(x)=x"), texte(" et "), latex("g(x)=x^2"), texte(", sur "), latex("[0;1]"), texte(", vaut "), latex("\\dfrac{1}{2}"), texte(".")],
      reponse: false,
      justification: [latex("1/2"), texte(" est l'aire sous "), latex("y=x"), texte(" SEULE : il reste à retirer l'aire sous "), latex("y=x^2"), texte(" ("), latex("1/3"), texte("), ce qui donne "), latex("1/6"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre la courbe de "), latex("f(x)=\\dfrac{1}{x}"), texte(" et l'axe des abscisses, sur "), latex("[1;e]"), texte(", vaut "), latex("1"), texte(".")],
      reponse: true,
      justification: [latex("f>0"), texte(" sur "), latex("[1;e]"), texte(", donc l'aire vaut "), latex("[\\ln|x|]_1^e=\\ln(e)-\\ln(1)=1"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre la courbe de "), latex("f(x)=\\dfrac{1}{x}"), texte(" et l'axe des abscisses, sur "), latex("[1;e]"), texte(", vaut "), latex("e-1"), texte(".")],
      reponse: false,
      justification: [latex("e-1"), texte(" serait l'aire sous "), latex("y=e^x"), texte(" entre "), latex("0"), texte(" et "), latex("1"), texte(". Ici la primitive est "), latex("\\ln|x|"), texte(", et l'aire vaut "), latex("\\ln(e)-\\ln(1)=1"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre la courbe de "), latex("\\cos"), texte(" et l'axe des abscisses, sur "), latex("[0;\\pi]"), texte(", vaut "), latex("0"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'INTÉGRALE signée qui vaut "), latex("0"), texte(" ("), latex("[\\sin x]_0^{\\pi}=0"), texte(") : "), latex("\\cos"), texte(" change de signe en "), latex("\\pi/2"), texte(" et les deux moitiés se compensent. L'AIRE, elle, vaut "), latex("2"), texte(".")],
    },
    {
      enonce: [texte("L'aire entre la courbe de "), latex("\\cos"), texte(" et l'axe des abscisses, sur "), latex("[0;\\pi]"), texte(", vaut "), latex("2"), texte(".")],
      reponse: true,
      justification: [texte("Découpage en "), latex("\\pi/2"), texte(" (racine de "), latex("\\cos"), texte(") : "), latex("\\int_0^{\\pi/2}\\cos=1"), texte(" et "), latex("\\left|\\int_{\\pi/2}^{\\pi}\\cos\\right|=|-1|=1"), texte(", total "), latex("1+1=2"), texte(".")],
    },
    {
      enonce: [texte("Une région bordée par PLUS DE DEUX courbes se calcule toujours par une seule intégrale, sans aucun découpage.")],
      reponse: false,
      justification: [texte("Quand la courbe qui joue le rôle de majorant CHANGE au milieu de l'intervalle, il faut découper au point de bascule et poser une intégrale par morceau, avec la bonne paire majorant/minorant sur chacun.")],
    },
    {
      enonce: [texte("Quand la courbe MAJORANTE change au milieu de l'intervalle, il faut découper au point de bascule, même si aucune des courbes bordantes ne s'annule à cet endroit.")],
      reponse: true,
      justification: [texte("Le découpage est dicté par le changement de majorant, pas seulement par les zéros : découper uniquement aux racines laisserait une paire majorant/minorant fausse sur une partie de l'intervalle.")],
    },
    {
      enonce: [texte("L'aire de la région bordée par les droites "), latex("y=x"), texte(", "), latex("y=6-x"), texte(" et "), latex("y=0"), texte(" vaut "), latex("18"), texte(".")],
      reponse: false,
      justification: [texte("Les deux droites se croisent en "), latex("(3;3)"), texte(" : "), latex("\\int_0^3 x\\,dx+\\int_3^6(6-x)\\,dx=4{,}5+4{,}5=9"), texte(", pas "), latex("18"), texte(".")],
    },
    {
      enonce: [texte("Les deux calculs "), latex("\\displaystyle\\int_{a}^{b}\\big(f(x)-g(x)\\big)\\,dx"), texte(" et "), latex("\\displaystyle\\int_{a}^{b}\\big(g(x)-f(x)\\big)\\,dx"), texte(" donnent deux AIRES différentes.")],
      reponse: false,
      justification: [texte("Ces deux intégrales sont OPPOSÉES, donc de même valeur absolue : l'aire, elle, est identique. La convention est simplement de soustraire le minorant au majorant pour obtenir directement une valeur positive.")],
    },
    {
      enonce: [texte("Puisqu'une aire est positive, prendre "), latex("\\left|\\displaystyle\\int_{a}^{b} f(x)\\,dx\\right|"), texte(" donne l'aire entre la courbe et l'axe, même lorsque "), latex("f"), texte(" change de signe sur "), latex("[a;b]"), texte(".")],
      reponse: false,
      justification: [texte("La valeur absolue est prise TROP TARD : dans "), latex("\\int_{a}^{b}f"), texte(", les parties positives et négatives se sont déjà compensées. Il faut découper aux racines et prendre la valeur absolue de CHAQUE intégrale partielle.")],
    },
    {
      enonce: [texte("Si "), latex("f"), texte(" change réellement de signe sur "), latex("[a;b]"), texte(", alors "), latex("\\left|\\displaystyle\\int_{a}^{b} f(x)\\,dx\\right|"), texte(" est STRICTEMENT inférieure à l'aire totale entre la courbe et l'axe.")],
      reponse: true,
      justification: [texte("Les contributions de signes opposés se compensent partiellement dans l'intégrale globale, jamais dans la somme des valeurs absolues. Exemple : "), latex("f(x)=x"), texte(" sur "), latex("[-2;3]"), texte(" donne "), latex("|2{,}5|=2{,}5"), texte(" contre une aire de "), latex("6{,}5"), texte(".")],
    },
    {
      enonce: [texte("Pour retrouver l'aire d'un disque de rayon "), latex("r"), texte(" par le calcul intégral, "), latex("\\displaystyle\\int_{0}^{r}\\sqrt{r^2-x^2}\\,dx"), texte(" donne directement "), latex("\\pi r^2"), texte(".")],
      reponse: false,
      justification: [texte("Cette intégrale ne donne que le QUART de disque situé dans le premier quadrant, soit "), latex("\\pi r^2/4"), texte(". L'aire complète est "), latex("4\\displaystyle\\int_{0}^{r}\\sqrt{r^2-x^2}\\,dx=\\pi r^2"), texte(" (calcul mené par la substitution "), latex("x=r\\sin(\\theta)"), texte(").")],
    },
  ],

  // ==========================================================================
  // Thème 5 — Volumes de révolution, ref 6gen27
  // ==========================================================================
  volumesRevolution: [
    {
      enonce: [texte("Le volume du solide obtenu en faisant tourner la courbe de "), latex("f"), texte(" autour de l'axe des abscisses, sur "), latex("[a;b]"), texte(", vaut "), latex("V=\\pi\\displaystyle\\int_{a}^{b} [f(x)]^2\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule des disques : chaque tranche verticale, en tournant, engendre un disque de rayon "), latex("f(x)"), texte(" et d'aire "), latex("\\pi[f(x)]^2"), texte(".")],
    },
    {
      enonce: [texte("Le volume du solide obtenu par cette rotation vaut "), latex("V=\\pi\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" (sans élever "), latex("f"), texte(" au carré).")],
      reponse: false,
      justification: [texte("Il manque le carré : sans lui, on calcule une simple aire multipliée par "), latex("\\pi"), texte(", pas un volume de disques empilés.")],
    },
    {
      enonce: [texte("Le volume du solide obtenu par cette rotation vaut "), latex("\\displaystyle\\int_{a}^{b} [f(x)]^2\\,dx"), texte(" (en oubliant le facteur "), latex("\\pi"), texte(").")],
      reponse: false,
      justification: [texte("Chaque tranche est un DISQUE, d'aire "), latex("\\pi r^2"), texte(" : le facteur "), latex("\\pi"), texte(" est indispensable, ce n'est pas une simple intégrale de "), latex("[f(x)]^2"), texte(".")],
    },
    {
      enonce: [texte("La méthode utilisée pour calculer "), latex("V=\\pi\\displaystyle\\int_{a}^{b} [f(x)]^2\\,dx"), texte(" est appelée méthode des disques.")],
      reponse: true,
      justification: [texte("Chaque tranche infinitésimale du solide, une fois tournée, forme un disque plein — d'où le nom de la méthode.")],
    },
    {
      enonce: [texte("Pour le volume engendré par la rotation, autour de l'axe des abscisses, de la région comprise entre deux courbes "), latex("f"), texte(" (extérieure) et "), latex("g"), texte(" (intérieure), avec "), latex("f(x)\\geq g(x)\\geq0"), texte(" sur "), latex("[a;b]"), texte(", on a "), latex("V=\\pi\\displaystyle\\int_{a}^{b} \\big([f(x)]^2-[g(x)]^2\\big)\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est la méthode des rondelles : on soustrait l'aire du disque intérieur (creusé par "), latex("g"), texte(") de celle du disque extérieur (bordé par "), latex("f"), texte(").")],
    },
    {
      enonce: [texte("Pour ce même volume entre deux courbes, on a "), latex("V=\\pi\\displaystyle\\int_{a}^{b} [f(x)-g(x)]^2\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("C'est LE piège classique de la méthode des rondelles : il faut soustraire les CARRÉS ("), latex("[f(x)]^2-[g(x)]^2"), texte("), pas élever la DIFFÉRENCE au carré — les deux expressions ne sont mathématiquement pas égales en général.")],
    },
    {
      enonce: [texte("La méthode utilisée pour calculer "), latex("V=\\pi\\displaystyle\\int_{a}^{b} \\big([f(x)]^2-[g(x)]^2\\big)\\,dx"), texte(" est appelée méthode des rondelles.")],
      reponse: true,
      justification: [texte("Chaque tranche, une fois tournée, forme un anneau (une « rondelle ») plutôt qu'un disque plein — d'où ce nom.")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation de "), latex("f(x)=x"), texte(" sur "), latex("[0;3]"), texte(" autour de l'axe des abscisses vaut "), latex("9\\pi"), texte(".")],
      reponse: true,
      justification: [texte("V="), latex("\\pi\\int_0^3x^2\\,dx=\\pi\\left[\\tfrac{x^3}{3}\\right]_0^3=\\pi\\cdot9=9\\pi"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation de "), latex("f(x)=x"), texte(" sur "), latex("[0;3]"), texte(" autour de l'axe des abscisses vaut "), latex("4{,}5\\pi"), texte(".")],
      reponse: false,
      justification: [texte("Cette valeur correspond à "), latex("\\pi\\int_0^3x\\,dx"), texte(", obtenue en oubliant d'élever "), latex("f"), texte(" au carré. Le bon calcul porte sur "), latex("\\pi\\int_0^3x^2\\,dx=9\\pi"), texte(".")],
    },
    {
      enonce: [texte("Si le volume est calculé par rotation autour de l'axe des abscisses, le résultat s'exprime dans une unité de VOLUME, jamais une unité d'aire.")],
      reponse: true,
      justification: [texte("Un volume de révolution mesure un espace en trois dimensions, il se mesure donc en unités cubiques, jamais en unités carrées.")],
    },
    {
      enonce: [texte("Le volume par rotation autour de l'axe des abscisses peut être négatif si "), latex("f"), texte(" prend des valeurs négatives sur une partie de "), latex("[a;b]"), texte(".")],
      reponse: false,
      justification: [texte("Comme "), latex("[f(x)]^2\\geq0"), texte(" toujours (que "), latex("f(x)"), texte(" soit positif ou négatif), le volume "), latex("V=\\pi\\int[f(x)]^2\\,dx"), texte(" reste toujours positif ou nul, quel que soit le signe de "), latex("f"), texte(".")],
    },
    {
      enonce: [texte("Puisque "), latex("f(x)^2\\geq0"), texte(" pour tout "), latex("x"), texte(", le volume "), latex("V=\\pi\\displaystyle\\int_{a}^{b}[f(x)]^2\\,dx"), texte(" est toujours positif ou nul, même si "), latex("f"), texte(" change de signe sur "), latex("[a;b]"), texte(".")],
      reponse: true,
      justification: [texte("Le carré efface tout signe négatif de "), latex("f"), texte(" avant l'intégration : contrairement à une aire simple, le signe de "), latex("f"), texte(" n'a alors aucune incidence sur le volume.")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation, autour de l'axe des abscisses, de la région comprise entre "), latex("f(x)=3"), texte(" et "), latex("g(x)=x"), texte(" sur "), latex("[0;3]"), texte(" vaut "), latex("18\\pi"), texte(".")],
      reponse: true,
      justification: [texte("V="), latex("\\pi\\int_0^3(9-x^2)\\,dx=\\pi\\left[9x-\\tfrac{x^3}{3}\\right]_0^3=\\pi(27-9)=18\\pi"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation, autour de l'axe des abscisses, de la région comprise entre "), latex("f(x)=3"), texte(" et "), latex("g(x)=x"), texte(" sur "), latex("[0;3]"), texte(" vaut "), latex("\\pi\\displaystyle\\int_{0}^{3} (3-x)^2\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("C'est le piège des rondelles : cette formule élève la DIFFÉRENCE au carré au lieu de soustraire les carrés — le résultat correct est "), latex("\\pi\\int_0^3(3^2-x^2)\\,dx=18\\pi"), texte(", pas cette expression.")],
    },
    {
      enonce: [texte("Le paraboloïde obtenu par rotation de "), latex("f(x)=k\\sqrt{x}"), texte(" sur "), latex("[0;L]"), texte(" autour de l'axe des abscisses a un volume égal à exactement la MOITIÉ du volume du cylindre englobant (rayon "), latex("k\\sqrt{L}"), texte(", hauteur "), latex("L"), texte(").")],
      reponse: true,
      justification: [texte("C'est une propriété invariante, indépendante des valeurs de "), latex("k"), texte(" et "), latex("L"), texte(" : "), latex("V_{parabolo\\ddot{i}de}=\\pi\\int_0^Lk^2x\\,dx=\\tfrac{\\pi k^2L^2}{2}"), texte(", exactement la moitié de "), latex("V_{cylindre}=\\pi k^2L\\cdot L"), texte(".")],
    },
    {
      enonce: [texte("Le volume du cylindre englobant un tel paraboloïde de révolution est toujours strictement inférieur au volume du paraboloïde lui-même.")],
      reponse: false,
      justification: [texte("C'est l'inverse : le paraboloïde vaut la MOITIÉ du cylindre englobant, donc le cylindre est toujours strictement plus grand, jamais plus petit.")],
    },
    {
      enonce: [texte("Pour un solide de révolution, l'intégrande "), latex("[f(x)]^2"), texte(" doit être DÉVELOPPÉ (par exemple "), latex("(ax+b)^2=a^2x^2+2abx+b^2"), texte(") avant de chercher une primitive terme à terme.")],
      reponse: true,
      justification: [texte("Une primitive se calcule terme par terme sur une somme de puissances : il faut donc développer le carré avant d'intégrer, jamais primitiver "), latex("(ax+b)^2"), texte(" tel quel comme s'il s'agissait d'une seule puissance simple.")],
    },
    {
      enonce: [texte("Dans l'identité "), latex("\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}"), texte(", utile pour intégrer "), latex("[f(x)]^2"), texte(" lorsque "), latex("f(x)=a\\cos(x)"), texte(", la fréquence de l'angle double peut être ignorée sans changer le résultat.")],
      reponse: false,
      justification: [texte("La fréquence doublée ("), latex("\\cos(2x)"), texte(", pas "), latex("\\cos(x)"), texte(") est essentielle : la remplacer par "), latex("\\cos(x)"), texte(" changerait complètement l'intégrande, et donc le résultat de l'intégration.")],
    },
    {
      enonce: [texte("Dans la formule "), latex("V=\\pi\\displaystyle\\int_{a}^{b}[f(x)]^2\\,dx"), texte(", on suppose toujours "), latex("a<b"), texte(" pour que le résultat représente directement le volume physique, sans signe à corriger.")],
      reponse: true,
      justification: [texte("Comme "), latex("[f(x)]^2\\geq0"), texte(", l'intégrale avec "), latex("a<b"), texte(" donne directement une quantité positive, interprétable comme un volume — inverser les bornes changerait juste le signe du résultat, sans intérêt physique.")],
    },
    {
      enonce: [texte("Pour calculer un volume de révolution par la méthode des rondelles, il suffit de connaître UNE seule courbe (celle du bord extérieur) — la courbe intérieure ne joue aucun rôle dans le calcul.")],
      reponse: false,
      justification: [texte("Les DEUX courbes interviennent : le rayon extérieur ET le rayon intérieur sont tous deux élevés au carré, puis soustraits, dans la formule "), latex("[f(x)]^2-[g(x)]^2"), texte(".")],
    },
    {
      enonce: [texte("Plus généralement, pour un solide compris entre les plans "), latex("x=a"), texte(" et "), latex("x=b"), texte(", si "), latex("S(x)"), texte(" désigne l'aire de sa section par le plan d'abscisse "), latex("x"), texte(", son volume vaut "), latex("V=\\displaystyle\\int_{a}^{b} S(x)\\,dx"), texte(" — la formule des disques n'en est que le cas particulier "), latex("S(x)=\\pi[f(x)]^2"), texte(".")],
      reponse: true,
      justification: [texte("Le volume est la « somme » (l'intégrale) des aires des tranches infiniment fines qui composent le solide. Pour un solide de révolution, chaque tranche est un disque de rayon "), latex("f(x)"), texte(", d'aire "), latex("\\pi[f(x)]^2"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation de "), latex("f(x)=\\sqrt{x}"), texte(" sur "), latex("[0;4]"), texte(" autour de l'axe des abscisses vaut "), latex("8\\pi"), texte(".")],
      reponse: true,
      justification: [latex("V=\\pi\\displaystyle\\int_{0}^{4}\\left(\\sqrt{x}\\right)^2 dx=\\pi\\displaystyle\\int_{0}^{4}x\\,dx=\\pi\\left[\\tfrac{x^2}{2}\\right]_0^4=8\\pi"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation de "), latex("f(x)=\\sqrt{x}"), texte(" sur "), latex("[0;4]"), texte(" autour de l'axe des abscisses vaut "), latex("16\\pi"), texte(".")],
      reponse: false,
      justification: [latex("16\\pi"), texte(" correspond à "), latex("\\pi[x^2]_0^4"), texte(", où la division par "), latex("2"), texte(" de la primitive de "), latex("x"), texte(" a été oubliée. Le résultat correct est "), latex("8\\pi"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation de la fonction constante "), latex("f(x)=2"), texte(" sur "), latex("[0;5]"), texte(" autour de l'axe des abscisses vaut "), latex("20\\pi"), texte(".")],
      reponse: true,
      justification: [latex("V=\\pi\\displaystyle\\int_{0}^{5}4\\,dx=20\\pi"), texte(" — on retrouve bien le cylindre de rayon "), latex("2"), texte(" et de hauteur "), latex("5"), texte(", de volume "), latex("\\pi r^2h=\\pi\\cdot4\\cdot5"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation de la fonction constante "), latex("f(x)=2"), texte(" sur "), latex("[0;5]"), texte(" autour de l'axe des abscisses vaut "), latex("10\\pi"), texte(".")],
      reponse: false,
      justification: [latex("10\\pi=\\pi\\cdot2\\cdot5"), texte(" oublie d'élever le rayon au CARRÉ. Le volume du cylindre est "), latex("\\pi\\cdot2^2\\cdot5=20\\pi"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f"), texte(" constante, le volume engendré par rotation dépend de la POSITION de l'intervalle "), latex("[a;b]"), texte(" sur l'axe des abscisses, et pas seulement de sa longueur.")],
      reponse: false,
      justification: [texte("Avec "), latex("f(x)=c"), texte(" constante, "), latex("V=\\pi\\int_{a}^{b}c^2\\,dx=\\pi c^2(b-a)"), texte(" : seule la LONGUEUR "), latex("b-a"), texte(" intervient — c'est bien un cylindre, translaté sans changement de volume.")],
    },
    {
      enonce: [texte("La rotation de "), latex("f(x)=\\dfrac{r}{h}x"), texte(" sur "), latex("[0;h]"), texte(" autour de l'axe des abscisses engendre un cône de volume "), latex("\\dfrac{\\pi r^2h}{3}"), texte(".")],
      reponse: true,
      justification: [latex("V=\\pi\\displaystyle\\int_{0}^{h}\\dfrac{r^2}{h^2}x^2\\,dx=\\pi\\dfrac{r^2}{h^2}\\cdot\\dfrac{h^3}{3}=\\dfrac{\\pi r^2h}{3}"), texte(" — la formule connue du cône, retrouvée par intégration.")],
    },
    {
      enonce: [texte("Cette même rotation de "), latex("f(x)=\\dfrac{r}{h}x"), texte(" sur "), latex("[0;h]"), texte(" engendre un solide de volume "), latex("\\pi r^2h"), texte(".")],
      reponse: false,
      justification: [latex("\\pi r^2h"), texte(" est le volume du CYLINDRE de mêmes rayon et hauteur. Le cône n'en occupe que le tiers : "), latex("\\pi r^2h/3"), texte(".")],
    },
    {
      enonce: [texte("La formule du tronc de cône "), latex("V=\\dfrac{\\pi h}{3}(a^2+ab+b^2)"), texte(" se retrouve par la méthode des disques, appliquée à la droite reliant "), latex("(0;a)"), texte(" à "), latex("(h;b)"), texte(".")],
      reponse: true,
      justification: [texte("Cette droite a pour équation "), latex("y=\\tfrac{b-a}{h}x+a"), texte(" ; "), latex("\\pi\\int_0^h\\left(\\tfrac{b-a}{h}x+a\\right)^2 dx"), texte(" vaut, après développement et intégration, exactement "), latex("\\tfrac{\\pi h}{3}(a^2+ab+b^2)"), texte(".")],
    },
    {
      enonce: [texte("Le volume d'une sphère de rayon "), latex("r"), texte(" se retrouve par la méthode des disques appliquée à "), latex("f(x)=\\sqrt{r^2-x^2}"), texte(" sur "), latex("[-r;r]"), texte(", et vaut "), latex("\\dfrac{4\\pi r^3}{3}"), texte(".")],
      reponse: true,
      justification: [latex("V=\\pi\\displaystyle\\int_{-r}^{r}(r^2-x^2)\\,dx=\\pi\\left[r^2x-\\tfrac{x^3}{3}\\right]_{-r}^{r}=\\pi\\cdot\\tfrac{4r^3}{3}"), texte(" — la formule connue de la boule.")],
    },
    {
      enonce: [texte("Cette même rotation de "), latex("f(x)=\\sqrt{r^2-x^2}"), texte(" sur "), latex("[-r;r]"), texte(" donne un volume de "), latex("2\\pi r^3"), texte(".")],
      reponse: false,
      justification: [texte("Le calcul exact donne "), latex("\\pi\\left[r^2x-\\tfrac{x^3}{3}\\right]_{-r}^{r}=\\tfrac{4\\pi r^3}{3}"), texte(", et non "), latex("2\\pi r^3"), texte(" : le terme "), latex("-x^3/3"), texte(" retire un tiers du produit "), latex("r^2\\cdot2r"), texte(".")],
    },
    {
      enonce: [texte("Le volume engendré par la rotation, autour de l'axe des abscisses, de la région comprise entre "), latex("f(x)=x+1"), texte(" et "), latex("g(x)=1"), texte(" sur "), latex("[0;2]"), texte(" vaut "), latex("\\pi\\displaystyle\\int_{0}^{2} x^2\\,dx"), texte(".")],
      reponse: false,
      justification: [texte("C'est le piège des rondelles : "), latex("(f-g)^2=x^2"), texte(" au lieu de "), latex("f^2-g^2=(x+1)^2-1=x^2+2x"), texte(". La bonne intégrale est "), latex("\\pi\\int_0^2(x^2+2x)\\,dx"), texte(".")],
    },
    {
      enonce: [texte("Ce même volume (région entre "), latex("f(x)=x+1"), texte(" et "), latex("g(x)=1"), texte(" sur "), latex("[0;2]"), texte(", rotation autour de l'axe des abscisses) vaut "), latex("\\dfrac{20\\pi}{3}"), texte(".")],
      reponse: true,
      justification: [latex("V=\\pi\\displaystyle\\int_{0}^{2}\\big((x+1)^2-1^2\\big)dx=\\pi\\displaystyle\\int_{0}^{2}(x^2+2x)\\,dx=\\pi\\left[\\tfrac{x^3}{3}+x^2\\right]_0^2=\\pi\\left(\\tfrac{8}{3}+4\\right)=\\tfrac{20\\pi}{3}"), texte(".")],
    },
    {
      enonce: [texte("La méthode des rondelles s'applique telle quelle, sans découpage, même lorsque les deux courbes se CROISENT à l'intérieur de "), latex("[a;b]"), texte(".")],
      reponse: false,
      justification: [texte("Si les courbes se croisent, laquelle est le rayon EXTÉRIEUR change en cours de route : il faut découper au point d'intersection et reprendre, sur chaque morceau, "), latex("[\\text{extérieure}]^2-[\\text{intérieure}]^2"), texte(" avec le bon rôle pour chaque courbe.")],
    },
    {
      enonce: [texte("Faire tourner la région sous la courbe de "), latex("f"), texte(" autour de l'axe des ORDONNÉES engendre toujours le même volume qu'autour de l'axe des abscisses.")],
      reponse: false,
      justification: [texte("Les deux rotations donnent des solides différents : par exemple, la région sous "), latex("y=x"), texte(" sur "), latex("[0;3]"), texte(" engendre un cône de rayon "), latex("3"), texte(" autour de l'axe des abscisses, mais un solide tout autre autour de l'axe des ordonnées. La formule "), latex("\\pi\\int[f(x)]^2dx"), texte(" est spécifique à la rotation autour de l'axe des abscisses.")],
    },
  ],

  // ==========================================================================
  // Thème 6 — Longueur d'un arc de courbe, ref 6gen28
  // ==========================================================================
  longueurArc: [
    {
      enonce: [texte("La longueur d'un arc de courbe "), latex("y=f(x)"), texte(", entre "), latex("x=a"), texte(" et "), latex("x=b"), texte(", est donnée par "), latex("L=\\displaystyle\\int_{a}^{b} \\sqrt{1+[f'(x)]^2}\\,dx"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule usuelle de longueur d'arc, obtenue à partir du théorème de Pythagore appliqué à un petit segment de la courbe.")],
    },
    {
      enonce: [texte("La longueur d'un arc de courbe "), latex("y=f(x)"), texte(" est donnée par "), latex("L=\\displaystyle\\int_{a}^{b} \\sqrt{1+f(x)^2}\\,dx"), texte(" (avec "), latex("f"), texte(" au lieu de sa dérivée "), latex("f'"), texte(").")],
      reponse: false,
      justification: [texte("La formule utilise la DÉRIVÉE de "), latex("f"), texte(" (la pente locale de la courbe), pas "), latex("f"), texte(" elle-même.")],
    },
    {
      enonce: [texte("La longueur d'un arc de courbe "), latex("y=f(x)"), texte(" est donnée par "), latex("L=\\displaystyle\\int_{a}^{b} \\big(1+[f'(x)]^2\\big)\\,dx"), texte(" (en oubliant la racine carrée).")],
      reponse: false,
      justification: [texte("La racine carrée est indispensable : elle provient directement du théorème de Pythagore appliqué à l'hypoténuse d'un petit triangle formé le long de la courbe.")],
    },
    {
      enonce: [texte("La formule de longueur d'arc nécessite de connaître la dérivée "), latex("f'(x)"), texte(" de la fonction AVANT de pouvoir écrire l'intégrale.")],
      reponse: true,
      justification: [texte("La dérivée apparaît directement sous la racine dans la formule : il faut donc la calculer en premier, avant même de poser l'intégrale de longueur.")],
    },
    {
      enonce: [texte("Sous la racine de la formule de longueur d'arc, on trouve TOUJOURS « "), latex("1+"), texte(" » quelque chose, jamais seulement "), latex("[f'(x)]^2"), texte(" seul.")],
      reponse: true,
      justification: [texte("Le « 1 » vient de la distance parcourue horizontalement, "), latex("[f'(x)]^2"), texte(" de la distance parcourue verticalement — les deux s'additionnent avant la racine, conformément au théorème de Pythagore.")],
    },
    {
      enonce: [texte("Sous cette racine, on trouve seulement "), latex("[f'(x)]^2"), texte(", le « 1 » additionnel n'étant utile que dans certains cas particuliers.")],
      reponse: false,
      justification: [texte("Le « 1 » est TOUJOURS présent dans la formule de longueur d'arc, quelle que soit la fonction "), latex("f"), texte(" — ce n'est jamais un terme optionnel.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{3/2}"), texte(", on a "), latex("f'(x)=\\tfrac{3}{2}\\sqrt{x}"), texte(", donc "), latex("[f'(x)]^2=\\tfrac{9}{4}x"), texte(", et "), latex("1+[f'(x)]^2=1+\\tfrac{9}{4}x"), texte(" — une expression seulement AFFINE en "), latex("x"), texte(", pas un carré parfait.")],
      reponse: true,
      justification: [texte("Le calcul est direct : "), latex("\\left(\\tfrac{3}{2}\\sqrt{x}\\right)^2=\\tfrac{9}{4}x"), texte(", ce qui donne bien une expression du premier degré sous la racine, sans simplification possible en carré parfait.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{3/2}"), texte(", l'expression "), latex("1+[f'(x)]^2"), texte(" se simplifie en un carré parfait, comme "), latex("\\left(1+\\tfrac{3}{4}\\sqrt{x}\\right)^2"), texte(".")],
      reponse: false,
      justification: [texte("L'expression "), latex("1+\\tfrac{9}{4}x"), texte(" est seulement AFFINE en "), latex("x"), texte(", elle ne se factorise en aucun carré parfait — c'est justement le contraste central de ce cas par rapport à d'autres où un carré parfait apparaît.")],
    },
    {
      enonce: [texte("Il existe des fonctions "), latex("f"), texte(" pour lesquelles l'expression "), latex("1+[f'(x)]^2"), texte(" se simplifie en un CARRÉ PARFAIT sous la racine, ce qui permet de retirer la racine carrée après simplification.")],
      reponse: true,
      justification: [texte("C'est le cas, par exemple, pour "), latex("f(x)=\\tfrac{1}{2}\\left(\\tfrac{x^{n+1}}{n+1}+\\tfrac{x^{1-n}}{n-1}\\right)"), texte(", construite précisément pour que "), latex("1+[f'(x)]^2"), texte(" soit le carré exact de "), latex("\\tfrac{1}{2}(x^n+x^{-n})"), texte(".")],
    },
    {
      enonce: [texte("Il n'existe aucune fonction pour laquelle l'expression "), latex("1+[f'(x)]^2"), texte(" soit un carré parfait — la racine carrée reste donc toujours irréductible.")],
      reponse: false,
      justification: [texte("C'est faux : certaines fonctions sont spécifiquement construites pour que cette expression soit un carré parfait, permettant de retirer la racine avant d'intégrer.")],
    },
    {
      enonce: [texte("Lorsqu'un carré parfait apparaît sous la racine dans un calcul de longueur d'arc, il faut le simplifier explicitement (retirer la racine) avant de poursuivre — une réponse qui garde la racine, même mathématiquement équivalente, n'est pas acceptée comme réponse finale à cette étape.")],
      reponse: true,
      justification: [texte("C'est une étape où l'exercice teste précisément la reconnaissance du carré parfait : une réponse qui reste sous la forme "), latex("\\sqrt{1+[f'(x)]^2}"), texte(" n'a pas fait le travail de simplification demandé, même si elle est numériquement égale à la forme simplifiée.")],
    },
    {
      enonce: [texte("Une réponse qui reste sous la forme "), latex("\\sqrt{1+[f'(x)]^2}"), texte(" sans la simplifier est toujours acceptée, du moment qu'elle est numériquement égale à la forme simplifiée.")],
      reponse: false,
      justification: [texte("Dans ce cas précis, la simplification STRUCTURELLE (retirer la racine du carré parfait) est explicitement exigée — l'équivalence numérique seule ne suffit pas.")],
    },
    {
      enonce: [texte("Pour calculer "), latex("L=\\displaystyle\\int_{a}^{b}\\sqrt{1+[f'(x)]^2}\\,dx"), texte(" lorsque l'expression sous la racine est affine (par exemple "), latex("1+\\tfrac{9}{4}x"), texte("), on peut intégrer par une substitution "), latex("u=1+\\tfrac{9}{4}x"), texte(" (reconnaissance de la forme "), latex("\\sqrt{u}"), texte(").")],
      reponse: true,
      justification: [texte("C'est la technique adaptée : poser "), latex("u"), texte(" égal à l'expression affine ramène l'intégrale à la forme usuelle "), latex("\\int\\sqrt{u}\\,du"), texte(", de primitive connue.")],
    },
    {
      enonce: [texte("Lorsque l'expression sous la racine est affine, il est impossible d'obtenir une primitive sous forme fermée pour "), latex("L"), texte(" — seule une approximation numérique est envisageable.")],
      reponse: false,
      justification: [texte("Une substitution "), latex("u=1+\\tfrac{9}{4}x"), texte(" donne au contraire une primitive fermée exacte, "), latex("\\tfrac{8}{27}\\left(1+\\tfrac{9}{4}x\\right)^{3/2}"), texte(" — aucune approximation numérique n'est nécessaire.")],
    },
    {
      enonce: [texte("Pour certaines longueurs d'arc faisant intervenir une fonction logarithmique ("), latex("f(x)=k\\ln(x)"), texte("), une substitution du type "), latex("t=\\sqrt{x^2+k^2}"), texte(" permet de réécrire l'intégrale de longueur d'arc en une fraction rationnelle en "), latex("t"), texte(".")],
      reponse: true,
      justification: [texte("Cette substitution transforme "), latex("\\sqrt{1+[f'(x)]^2}"), texte(" en une expression rationnelle en "), latex("t"), texte(" ("), latex("t^2/(t^2-k^2)"), texte("), techniquement décomposable ensuite en éléments simples.")],
    },
    {
      enonce: [texte("Une substitution comme "), latex("t=\\sqrt{x^2+k^2}"), texte(" laisse toujours les bornes d'intégration INCHANGÉES : les nouvelles bornes en "), latex("t"), texte(" sont toujours égales aux anciennes bornes en "), latex("x"), texte(".")],
      reponse: false,
      justification: [texte("Les bornes doivent être recalculées en fonction de "), latex("t"), texte(" : par exemple, si "), latex("x=a"), texte(" correspond à "), latex("t_1=\\sqrt{a^2+k^2}"), texte(", cette nouvelle borne "), latex("t_1"), texte(" n'est en général PAS égale à "), latex("a"), texte(".")],
    },
    {
      enonce: [texte("Une longueur d'arc, comme toute longueur, doit être une quantité strictement positive dès que "), latex("a<b"), texte(".")],
      reponse: true,
      justification: [texte("Une longueur mesure une distance parcourue le long de la courbe : elle est nécessairement strictement positive dès que l'arc a une extension non nulle.")],
    },
    {
      enonce: [texte("Une longueur d'arc peut être négative si la fonction "), latex("f"), texte(" est décroissante sur l'intervalle considéré.")],
      reponse: false,
      justification: [texte("Le signe de "), latex("f'(x)"), texte(" n'a aucune incidence : "), latex("[f'(x)]^2\\geq0"), texte(" toujours, donc "), latex("\\sqrt{1+[f'(x)]^2}\\geq1>0"), texte(", quel que soit le sens de variation de "), latex("f"), texte(".")],
    },
    {
      enonce: [texte("La formule "), latex("L=\\displaystyle\\int_{a}^{b}\\sqrt{1+[f'(x)]^2}\\,dx"), texte(" reste valable même si "), latex("f'(x)"), texte(" est négative sur une partie de "), latex("[a;b]"), texte(" — le carré de "), latex("f'(x)"), texte(" neutralise le signe.")],
      reponse: true,
      justification: [texte("Puisque "), latex("f'(x)"), texte(" apparaît au carré sous la racine, son signe n'a aucune influence sur le résultat : la formule s'applique identiquement, que "), latex("f"), texte(" soit croissante ou décroissante.")],
    },
    {
      enonce: [texte("La formule de longueur d'arc exige que "), latex("f"), texte(" soit une fonction croissante sur tout l'intervalle "), latex("[a;b]"), texte(", sinon elle ne s'applique pas.")],
      reponse: false,
      justification: [texte("Aucune condition de monotonie n'est requise : la formule "), latex("L=\\int_{a}^{b}\\sqrt{1+[f'(x)]^2}\\,dx"), texte(" s'applique à toute fonction dérivable, croissante, décroissante, ou ni l'une ni l'autre.")],
    },
    {
      enonce: [texte("La formule de longueur d'arc vient du théorème de Pythagore appliqué à un élément infinitésimal : "), latex("ds=\\sqrt{dx^2+dy^2}"), texte(", d'où "), latex("ds=\\sqrt{1+(dy/dx)^2}\\,dx"), texte(" après mise en évidence de "), latex("dx"), texte(".")],
      reponse: true,
      justification: [texte("Sur un petit intervalle, la courbe se confond avec l'hypoténuse d'un triangle rectangle de côtés "), latex("dx"), texte(" et "), latex("dy"), texte(" ; sommer (intégrer) ces longueurs "), latex("ds"), texte(" sur "), latex("[a;b]"), texte(" donne exactement "), latex("L"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\operatorname{ch}(x)"), texte(", on a "), latex("f'(x)=\\operatorname{sh}(x)"), texte(" et l'identité "), latex("\\operatorname{ch}^2-\\operatorname{sh}^2=1"), texte(" donne "), latex("1+[f'(x)]^2=\\operatorname{ch}^2(x)"), texte(" — un carré parfait — d'où "), latex("L=\\operatorname{sh}(a)"), texte(" sur "), latex("[0;a]"), texte(".")],
      reponse: true,
      justification: [latex("1+\\operatorname{sh}^2(x)=\\operatorname{ch}^2(x)"), texte(" et "), latex("\\operatorname{ch}(x)>0"), texte(" toujours, donc la racine se simplifie directement : "), latex("L=\\int_0^a\\operatorname{ch}(x)\\,dx=[\\operatorname{sh}(x)]_0^a=\\operatorname{sh}(a)"), texte(" (car "), latex("\\operatorname{sh}(0)=0"), texte(").")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\operatorname{ch}(x)"), texte(", l'expression sous la racine vaut "), latex("1+\\operatorname{ch}^2(x)"), texte(".")],
      reponse: false,
      justification: [texte("C'est la DÉRIVÉE qui entre dans la formule : "), latex("f'(x)=\\operatorname{sh}(x)"), texte(", donc l'expression est "), latex("1+\\operatorname{sh}^2(x)"), texte(", qui vaut "), latex("\\operatorname{ch}^2(x)"), texte(" — et non "), latex("1+\\operatorname{ch}^2(x)"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\tfrac{2}{3}x^{3/2}"), texte(", on a "), latex("f'(x)=\\sqrt{x}"), texte(", donc "), latex("1+[f'(x)]^2=1+x"), texte(".")],
      reponse: true,
      justification: [latex("\\left(\\tfrac{2}{3}x^{3/2}\\right)'=\\tfrac{2}{3}\\cdot\\tfrac{3}{2}x^{1/2}=\\sqrt{x}"), texte(", et "), latex("\\left(\\sqrt{x}\\right)^2=x"), texte(" : l'expression sous la racine est donc bien "), latex("1+x"), texte(".")],
    },
    {
      enonce: [texte("La longueur de l'arc de "), latex("f(x)=\\tfrac{2}{3}x^{3/2}"), texte(" entre "), latex("x=0"), texte(" et "), latex("x=3"), texte(" vaut "), latex("\\dfrac{14}{3}"), texte(".")],
      reponse: true,
      justification: [latex("L=\\displaystyle\\int_{0}^{3}\\sqrt{1+x}\\,dx=\\left[\\tfrac{2}{3}(1+x)^{3/2}\\right]_0^3=\\tfrac{2}{3}(8-1)=\\tfrac{14}{3}"), texte(".")],
    },
    {
      enonce: [texte("Cette même longueur ("), latex("f(x)=\\tfrac{2}{3}x^{3/2}"), texte(" entre "), latex("x=0"), texte(" et "), latex("x=3"), texte(") vaut "), latex("\\dfrac{16}{3}"), texte(".")],
      reponse: false,
      justification: [latex("16/3=\\tfrac{2}{3}\\cdot8"), texte(" est la valeur de la primitive en "), latex("x=3"), texte(" SEULE : il reste à soustraire sa valeur en "), latex("x=0"), texte(", qui vaut "), latex("\\tfrac{2}{3}"), texte(" (et non "), latex("0"), texte("), d'où "), latex("14/3"), texte(".")],
    },
    {
      enonce: [texte("Pour une fonction AFFINE "), latex("f(x)=mx+p"), texte(", la formule donne "), latex("L=\\sqrt{1+m^2}\\,(b-a)"), texte(", c'est-à-dire exactement la distance entre les deux extrémités calculée par Pythagore.")],
      reponse: true,
      justification: [latex("f'(x)=m"), texte(" est constante, donc "), latex("L=\\int_a^b\\sqrt{1+m^2}\\,dx=\\sqrt{1+m^2}(b-a)"), texte(". Or la distance entre "), latex("(a;ma+p)"), texte(" et "), latex("(b;mb+p)"), texte(" vaut "), latex("\\sqrt{(b-a)^2+m^2(b-a)^2}=(b-a)\\sqrt{1+m^2}"), texte(" : les deux coïncident.")],
    },
    {
      enonce: [texte("Pour une fonction affine, la formule de longueur d'arc donne un résultat DIFFÉRENT de la distance entre les extrémités calculée par Pythagore.")],
      reponse: false,
      justification: [texte("Les deux résultats coïncident exactement ("), latex("\\sqrt{1+m^2}(b-a)"), texte(" dans les deux cas) : c'est d'ailleurs un bon contrôle de cohérence de la formule sur un cas déjà connu.")],
    },
    {
      enonce: [texte("Appliquée au demi-cercle supérieur "), latex("f(x)=\\sqrt{r^2-x^2}"), texte(" sur "), latex("[-r;r]"), texte(", la formule donne "), latex("1+[f'(x)]^2=\\dfrac{r^2}{r^2-x^2}"), texte(" et une longueur "), latex("L=\\pi r"), texte(".")],
      reponse: true,
      justification: [latex("f'(x)=\\dfrac{-x}{\\sqrt{r^2-x^2}}"), texte(", donc "), latex("1+\\dfrac{x^2}{r^2-x^2}=\\dfrac{r^2}{r^2-x^2}"), texte(", puis "), latex("L=\\int_{-r}^{r}\\dfrac{r}{\\sqrt{r^2-x^2}}dx=r[\\arcsin(x/r)]_{-r}^{r}=r\\left(\\tfrac{\\pi}{2}+\\tfrac{\\pi}{2}\\right)=\\pi r"), texte(".")],
    },
    {
      enonce: [texte("Appliquée au demi-cercle supérieur de rayon "), latex("r"), texte(", la formule de longueur d'arc donne "), latex("2\\pi r"), texte(".")],
      reponse: false,
      justification: [latex("2\\pi r"), texte(" est la circonférence COMPLÈTE. Le demi-cercle en mesure la moitié, "), latex("\\pi r"), texte(" — c'est bien ce que donne le calcul.")],
    },
    {
      enonce: [texte("La longueur d'un arc de courbe sur "), latex("[a;b]"), texte(" est toujours supérieure ou égale à "), latex("b-a"), texte(", avec égalité seulement si "), latex("f"), texte(" est constante.")],
      reponse: true,
      justification: [latex("\\sqrt{1+[f'(x)]^2}\\geq1"), texte(" pour tout "), latex("x"), texte(", donc "), latex("L\\geq\\int_a^b1\\,dx=b-a"), texte(". L'égalité exige "), latex("f'(x)=0"), texte(" partout, c'est-à-dire "), latex("f"), texte(" constante (arc horizontal).")],
    },
    {
      enonce: [texte("La longueur d'un arc sur "), latex("[a;b]"), texte(" peut être INFÉRIEURE à "), latex("b-a"), texte(" si "), latex("f"), texte(" décroît fortement.")],
      reponse: false,
      justification: [texte("Une décroissance forte donne un "), latex("[f'(x)]^2"), texte(" GRAND, donc un intégrande "), latex("\\geq1"), texte(" et une longueur encore plus grande que "), latex("b-a"), texte(" : jamais plus petite.")],
    },
    {
      enonce: [texte("Translater la courbe verticalement (remplacer "), latex("f"), texte(" par "), latex("f+C"), texte(") ne change pas la longueur de l'arc sur "), latex("[a;b]"), texte(".")],
      reponse: true,
      justification: [texte("La dérivée est inchangée ("), latex("(f+C)'=f'"), texte("), donc l'intégrande "), latex("\\sqrt{1+[f'(x)]^2}"), texte(" et la longueur le sont aussi — cohérent avec l'intuition : une translation ne déforme pas la courbe.")],
    },
    {
      enonce: [texte("Multiplier "), latex("f"), texte(" par "), latex("2"), texte(" multiplie la longueur de l'arc par "), latex("2"), texte(".")],
      reponse: false,
      justification: [texte("L'intégrande devient "), latex("\\sqrt{1+4[f'(x)]^2}"), texte(", qui n'est pas "), latex("2\\sqrt{1+[f'(x)]^2}"), texte(". Exemple : "), latex("f(x)=x"), texte(" sur "), latex("[0;1]"), texte(" donne "), latex("L=\\sqrt{2}"), texte(", tandis que "), latex("2x"), texte(" donne "), latex("\\sqrt{5}\\neq2\\sqrt{2}"), texte(".")],
    },
    {
      enonce: [texte("Pour toute fonction dérivable "), latex("f"), texte(", l'intégrale de longueur d'arc admet toujours une primitive exprimable à l'aide des fonctions usuelles.")],
      reponse: false,
      justification: [texte("C'est faux en général (la longueur d'un arc d'ellipse, par exemple, n'a pas d'expression élémentaire) : c'est précisément pourquoi les exercices reposent sur des fonctions CHOISIES pour que "), latex("1+[f'(x)]^2"), texte(" soit un carré parfait ou une expression affine sous la racine.")],
    },
  ],

  // ==========================================================================
  // Thème 7 — Intégrales et primitives : problèmes, ref 6gen29
  // ==========================================================================
  integralesProblemes: [
    {
      enonce: [texte("Si "), latex("a(t)"), texte(" est l'accélération d'un mobile, alors "), latex("v(t)"), texte(", la vitesse, est une primitive de "), latex("a(t)"), texte(" — déterminée à une constante additive près, fixée grâce à une condition initiale comme "), latex("v(0)"), texte(".")],
      reponse: true,
      justification: [texte("C'est la relation fondamentale de la cinématique : l'accélération est la dérivée de la vitesse, donc la vitesse est une primitive de l'accélération.")],
    },
    {
      enonce: [texte("Si "), latex("a(t)"), texte(" est l'accélération d'un mobile, alors "), latex("v(t)"), texte(" est la DÉRIVÉE de "), latex("a(t)"), texte(", pas une primitive.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("a(t)=v'(t)"), texte(", donc "), latex("v"), texte(" est bien une primitive de "), latex("a"), texte(", pas sa dérivée.")],
    },
    {
      enonce: [texte("De même, la position "), latex("x(t)"), texte(" est une primitive de la vitesse "), latex("v(t)"), texte(", déterminée elle aussi grâce à une condition initiale, comme "), latex("x(0)"), texte(".")],
      reponse: true,
      justification: [texte("De la même façon, "), latex("v(t)=x'(t)"), texte(", donc "), latex("x"), texte(" est une primitive de "), latex("v"), texte(", nécessitant elle-même une condition initiale pour fixer sa propre constante.")],
    },
    {
      enonce: [texte("Une fois "), latex("v(t)"), texte(" déterminée à l'aide de la condition "), latex("v(0)"), texte(", il n'est plus nécessaire d'imposer de nouvelle condition initiale pour déterminer "), latex("x(t)"), texte(" : la même constante convient pour les deux étapes.")],
      reponse: false,
      justification: [texte("C'est un piège classique : chaque intégration introduit sa PROPRE constante — celle utilisée pour "), latex("v(t)"), texte(" (via "), latex("v(0)"), texte(") est indépendante de celle nécessaire pour "), latex("x(t)"), texte(" (via "), latex("x(0)"), texte("), qu'il faut imposer séparément.")],
    },
    {
      enonce: [texte("Si "), latex("a(t)=2"), texte(" (constante) et "), latex("v(0)=3"), texte(", alors "), latex("v(t)=2t+3"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale de "), latex("2"), texte(" : "), latex("2t+C"), texte(". La condition donne "), latex("v(0)=C=3"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("a(t)=2"), texte(" (constante) et "), latex("v(0)=3"), texte(", alors "), latex("v(t)=2t"), texte(".")],
      reponse: false,
      justification: [texte("Il manque la constante "), latex("C=3"), texte(" déterminée par la condition initiale — "), latex("v(t)=2t"), texte(" correspondrait à "), latex("v(0)=0"), texte(", pas "), latex("v(0)=3"), texte(".")],
    },
    {
      enonce: [texte("En poursuivant l'exemple précédent ("), latex("v(t)=2t+3"), texte(") avec "), latex("x(0)=0"), texte(", on obtient "), latex("x(t)=t^2+3t"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale de "), latex("2t+3"), texte(" : "), latex("t^2+3t+C"), texte(". La condition donne "), latex("x(0)=C=0"), texte(".")],
    },
    {
      enonce: [texte("En poursuivant l'exemple précédent ("), latex("v(t)=2t+3"), texte(") avec "), latex("x(0)=5"), texte(", on obtient encore "), latex("x(t)=t^2+3t"), texte(" (la nouvelle condition initiale ne changerait rien au résultat).")],
      reponse: false,
      justification: [texte("Avec "), latex("x(0)=5"), texte(", la constante devient "), latex("C=5"), texte(" : "), latex("x(t)=t^2+3t+5"), texte(", différent du résultat obtenu avec "), latex("x(0)=0"), texte(".")],
    },
    {
      enonce: [texte("La méthode des trapèzes permet d'ESTIMER une intégrale (par exemple une aire ou un volume) lorsque seules des valeurs discrètes (des hauteurs mesurées à intervalles réguliers) sont connues, sans expression algébrique fermée de la fonction.")],
      reponse: true,
      justification: [texte("C'est exactement l'usage de cette méthode : approcher une intégrale à partir de mesures ponctuelles, quand aucune formule "), latex("f(x)"), texte(" explicite n'est disponible.")],
    },
    {
      enonce: [texte("La méthode des trapèzes exige de connaître une expression algébrique explicite "), latex("f(x)"), texte(" de la fonction — elle ne s'applique jamais à des données purement numériques.")],
      reponse: false,
      justification: [texte("C'est l'inverse : la méthode des trapèzes est justement utile lorsque l'on ne dispose QUE de hauteurs mesurées, sans formule explicite pour "), latex("f"), texte(".")],
    },
    {
      enonce: [texte("Dans un problème de surplus (offre/demande), le point d'équilibre "), latex("(Q,P)"), texte(" correspond à l'intersection des courbes d'offre et de demande — pas nécessairement calculable par une formule fermée simple, une résolution numérique peut être nécessaire.")],
      reponse: true,
      justification: [texte("Lorsque la demande est, par exemple, exponentielle et l'offre affine, l'équation "), latex("f(x)=g(x)"), texte(" devient transcendante : une résolution numérique (par balayage ou bissection) est alors nécessaire, faute de forme fermée.")],
    },
    {
      enonce: [texte("Le point d'équilibre offre/demande peut toujours être trouvé par une résolution algébrique exacte, quelles que soient les fonctions d'offre et de demande choisies.")],
      reponse: false,
      justification: [texte("Ce n'est pas toujours le cas : une demande exponentielle contre une offre affine mène à une équation transcendante, sans solution algébrique fermée — une résolution numérique s'impose alors.")],
    },
    {
      enonce: [texte("Le principe d'Archimède permet de relier le volume d'un solide immergé au volume de liquide déplacé — un raisonnement géométrique qui peut éviter un nouveau calcul d'intégrale si le volume déplacé correspond à une forme déjà connue (par exemple une boule).")],
      reponse: true,
      justification: [texte("Si le volume immergé est une forme géométrique standard (une sphère complète, par exemple), sa formule connue ("), latex("\\tfrac{4}{3}\\pi r^3"), texte(") suffit — nul besoin de reposer une nouvelle intégrale.")],
    },
    {
      enonce: [texte("Le volume d'eau déplacée par une sphère totalement immergée doit toujours être recalculé par une NOUVELLE intégrale spécifique, jamais à l'aide d'une formule géométrique déjà connue comme "), latex("\\tfrac{4}{3}\\pi r^3"), texte(".")],
      reponse: false,
      justification: [texte("Une réponse SIMPLE utilisant directement la formule connue du volume d'une boule est correcte et suffisante — recalculer une intégrale supplémentaire ici est une complication inutile, pas une exigence.")],
    },
    {
      enonce: [texte("Pour calculer une AUGMENTATION de coût total entre deux niveaux de production "), latex("q_1"), texte(" et "), latex("q_2"), texte(", à partir d'une fonction de coût marginal "), latex("f(q)"), texte(", on peut soit calculer "), latex("C(q_2)-C(q_1)"), texte(" (où "), latex("C"), texte(" est une primitive de "), latex("f"), texte("), soit calculer directement "), latex("\\displaystyle\\int_{q_1}^{q_2} f(q)\\,dq"), texte(" — les deux méthodes donnent le même résultat.")],
      reponse: true,
      justification: [texte("C'est exactement le théorème fondamental de l'analyse : "), latex("\\int_{q_1}^{q_2}f(q)\\,dq=C(q_2)-C(q_1)"), texte(" pour toute primitive "), latex("C"), texte(" de "), latex("f"), texte(", les deux méthodes coïncident donc toujours.")],
    },
    {
      enonce: [texte("Pour ce même calcul d'augmentation de coût, seule la méthode "), latex("C(q_2)-C(q_1)"), texte(" est correcte ; calculer directement "), latex("\\displaystyle\\int_{q_1}^{q_2} f(q)\\,dq"), texte(" donnerait un résultat différent.")],
      reponse: false,
      justification: [texte("Les deux méthodes sont mathématiquement ÉQUIVALENTES (théorème fondamental de l'analyse) : elles donnent toujours exactement le même résultat, jamais un résultat différent.")],
    },
    {
      enonce: [texte("Pour un volume « par soustraction » (par exemple le volume utile d'un récipient moins celui d'une cavité intérieure), on calcule le volume total, puis on soustrait le volume de la partie retirée — jamais l'inverse.")],
      reponse: true,
      justification: [texte("C'est l'ordre logique : le volume utile est ce qui RESTE une fois la cavité retirée du volume total, donc total moins cavité, jamais l'inverse.")],
    },
    {
      enonce: [texte("Un volume « par soustraction » s'obtient toujours en ADDITIONNANT les deux volumes concernés, jamais en les soustrayant, malgré son nom.")],
      reponse: false,
      justification: [texte("Le nom lui-même l'indique : on SOUSTRAIT le volume retiré du volume total ; les additionner donnerait un résultat sans rapport avec le volume utile réel.")],
    },
    {
      enonce: [texte("Un problème contextualisé de calcul intégral (cinématique, économie, géométrie...) réutilise exactement les mêmes techniques de primitivation que les exercices « abstraits » — seule l'interprétation du résultat change.")],
      reponse: true,
      justification: [texte("La physique ou le contexte économique ne changent rien aux techniques mathématiques employées (primitives usuelles, substitution...) — ils changent seulement le SENS donné au résultat obtenu.")],
    },
    {
      enonce: [texte("Dans un problème contextualisé, les techniques de primitivation utilisées sont spécifiques au contexte (cinématique, économie...) et différentes de celles utilisées dans un exercice de primitives « pur ».")],
      reponse: false,
      justification: [texte("Les techniques de primitivation restent EXACTEMENT les mêmes, quel que soit le contexte — seule l'interprétation du résultat final (vitesse, coût, volume...) est propre au problème.")],
    },
    {
      enonce: [texte("L'aire sous la courbe de la VITESSE "), latex("v(t)"), texte(", entre deux instants "), latex("t_1"), texte(" et "), latex("t_2"), texte(", donne le déplacement "), latex("x(t_2)-x(t_1)"), texte(".")],
      reponse: true,
      justification: [latex("x"), texte(" est une primitive de "), latex("v"), texte(", donc "), latex("\\int_{t_1}^{t_2}v(t)\\,dt=x(t_2)-x(t_1)"), texte(" par le théorème fondamental.")],
    },
    {
      enonce: [texte("L'aire sous la courbe de l'ACCÉLÉRATION "), latex("a(t)"), texte(", entre "), latex("t_1"), texte(" et "), latex("t_2"), texte(", donne la distance parcourue.")],
      reponse: false,
      justification: [texte("Elle donne la variation de VITESSE "), latex("v(t_2)-v(t_1)"), texte(", puisque "), latex("v"), texte(" est une primitive de "), latex("a"), texte(". C'est l'aire sous "), latex("v"), texte(" qui donne le déplacement — il faut deux intégrations successives depuis "), latex("a"), texte(".")],
    },
    {
      enonce: [latex("\\displaystyle\\int_{t_1}^{t_2} a(t)\\,dt = v(t_2)-v(t_1)"), texte(".")],
      reponse: true,
      justification: [latex("v"), texte(" est une primitive de "), latex("a"), texte(" : l'intégrale de l'accélération sur un intervalle de temps mesure exactement la variation de vitesse sur cet intervalle.")],
    },
    {
      enonce: [texte("Si "), latex("a(t)=2t+1"), texte(" et "), latex("v(0)=0"), texte(", alors "), latex("v(t)=t^2+t"), texte(".")],
      reponse: true,
      justification: [texte("Primitive générale de "), latex("2t+1"), texte(" : "), latex("t^2+t+C"), texte(". La condition donne "), latex("v(0)=C=0"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("a(t)=2t+1"), texte(" et "), latex("v(0)=0"), texte(", alors "), latex("v(t)=t^2+t+1"), texte(".")],
      reponse: false,
      justification: [texte("Cette expression donnerait "), latex("v(0)=1"), texte(", pas "), latex("0"), texte(" : la condition initiale impose "), latex("C=0"), texte(", donc "), latex("v(t)=t^2+t"), texte(".")],
    },
    {
      enonce: [texte("Pour une force suivant la loi de Hooke "), latex("F(x)=k\\,x"), texte(", le travail entre "), latex("x=a"), texte(" et "), latex("x=b"), texte(" vaut "), latex("W=\\displaystyle\\int_{a}^{b} k\\,x\\,dx=\\dfrac{k(b^2-a^2)}{2}"), texte(".")],
      reponse: true,
      justification: [texte("Une primitive de "), latex("kx"), texte(" est "), latex("kx^2/2"), texte(", d'où "), latex("W=\\left[\\tfrac{kx^2}{2}\\right]_a^b=\\tfrac{k(b^2-a^2)}{2}"), texte(".")],
    },
    {
      enonce: [texte("Pour cette même force "), latex("F(x)=k\\,x"), texte(", le travail ne dépend que de la LONGUEUR de l'intervalle "), latex("[a;b]"), texte(", pas de sa position sur l'axe.")],
      reponse: false,
      justification: [latex("W=\\tfrac{k(b^2-a^2)}{2}"), texte(" dépend bien de la position : avec "), latex("k=1"), texte(", "), latex("[0;2]"), texte(" donne "), latex("2"), texte(" alors que "), latex("[2;4]"), texte(" donne "), latex("6"), texte(", pour la même longueur. C'est propre aux forces NON constantes.")],
    },
    {
      enonce: [texte("Pour "), latex("F(x)=3x"), texte(", le travail entre "), latex("x=1"), texte(" et "), latex("x=3"), texte(" vaut "), latex("12"), texte(".")],
      reponse: true,
      justification: [latex("W=\\left[\\tfrac{3x^2}{2}\\right]_1^3=\\tfrac{27}{2}-\\tfrac{3}{2}=12"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("F(x)=3x"), texte(", le travail entre "), latex("x=1"), texte(" et "), latex("x=3"), texte(" vaut "), latex("6"), texte(".")],
      reponse: false,
      justification: [latex("6=3\\times2"), texte(" est le travail d'une force CONSTANTE de "), latex("3"), texte(" sur un déplacement de "), latex("2"), texte(". Ici la force varie avec "), latex("x"), texte(" : il faut intégrer, ce qui donne "), latex("12"), texte(".")],
    },
    {
      enonce: [texte("Le coût fixe "), latex("C(0)"), texte(" s'annule dans la différence "), latex("C(q_2)-C(q_1)"), texte(" : l'augmentation de coût entre deux niveaux de production n'en dépend donc pas.")],
      reponse: true,
      justification: [texte("Le coût fixe est la constante d'intégration de la primitive "), latex("C"), texte(" du coût marginal : comme toute constante, elle disparaît dans la soustraction "), latex("C(q_2)-C(q_1)"), texte(".")],
    },
    {
      enonce: [texte("Le surplus du consommateur est l'aire comprise entre la courbe de DEMANDE et la droite horizontale "), latex("y=P"), texte(" (prix d'équilibre), entre "), latex("x=0"), texte(" et "), latex("x=Q"), texte(" (quantité d'équilibre).")],
      reponse: true,
      justification: [texte("Il se calcule par "), latex("\\displaystyle\\int_{0}^{Q}\\big(f(x)-P\\big)\\,dx"), texte(", où "), latex("f"), texte(" est la fonction de demande : c'est bien l'aire entre cette courbe et la droite du prix payé.")],
    },
    {
      enonce: [texte("Le surplus du consommateur s'obtient en AJOUTANT l'aire sous la droite "), latex("y=P"), texte(" à l'aire sous la courbe de demande, sur "), latex("[0;Q]"), texte(".")],
      reponse: false,
      justification: [texte("On la SOUSTRAIT : "), latex("\\int_{0}^{Q}\\big(f(x)-P\\big)dx"), texte(" — l'aire "), latex("P\\cdot Q"), texte(" représente ce que les consommateurs ont réellement payé, à retirer de ce qu'ils étaient prêts à payer.")],
    },
    {
      enonce: [texte("Le volume d'eau contenu dans une cuve sphérique de rayon "), latex("r"), texte(", remplie jusqu'à une hauteur "), latex("h"), texte(", vaut "), latex("\\pi\\displaystyle\\int_{0}^{h}\\big(r^2-(y-r)^2\\big)dy = \\dfrac{\\pi h^2(3r-h)}{3}"), texte(".")],
      reponse: true,
      justification: [texte("L'intégrande développé vaut "), latex("2ry-y^2"), texte(", de primitive "), latex("ry^2-\\tfrac{y^3}{3}"), texte(", d'où "), latex("\\pi\\left(rh^2-\\tfrac{h^3}{3}\\right)=\\tfrac{\\pi h^2(3r-h)}{3}"), texte(" — la formule de la calotte sphérique.")],
    },
    {
      enonce: [texte("Ce même volume d'eau (cuve sphérique de rayon "), latex("r"), texte(", hauteur "), latex("h"), texte(") vaut "), latex("\\dfrac{\\pi h^3}{3}"), texte(".")],
      reponse: false,
      justification: [latex("\\pi h^3/3"), texte(" est le volume d'un CÔNE de rayon "), latex("h"), texte(" et de hauteur "), latex("h"), texte(", sans rapport ici. La calotte sphérique vaut "), latex("\\pi\\left(rh^2-\\tfrac{h^3}{3}\\right)"), texte(", qui dépend aussi du rayon "), latex("r"), texte(" de la sphère.")],
    },
    {
      enonce: [texte("La méthode des trapèzes approche "), latex("\\displaystyle\\int_{a}^{b} f(x)\\,dx"), texte(" par "), latex("\\Delta x\\,(y_0+y_1+\\dots+y_n)"), texte(".")],
      reponse: false,
      justification: [texte("La bonne formule est "), latex("\\dfrac{\\Delta x}{2}\\big[y_0+y_n+2(y_1+\\dots+y_{n-1})\\big]"), texte(" : les hauteurs INTERMÉDIAIRES comptent double, les deux extrêmes une seule fois, et l'ensemble est divisé par 2.")],
    },
  ],
};
