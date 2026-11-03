/**
 * Couche A — banque de contenu pour "Fonctions logarithmes" (quiz vrai/faux), chapitre 3 du
 * chantier 6e (6h), ajout ultérieur (6gen66). 350 affirmations PRÉ-ÉCRITES (35 par thème, 10
 * thèmes), chacune vérifiée mathématiquement à la rédaction (calculs numériques Node pour sh/ch et
 * les limites, cohérence avec les générateurs déjà établis du chapitre pour les modèles de
 * problèmes) — jamais générées procéduralement, voir `core6e/quizFonctionsLogarithmes.types.ts`.
 *
 * Un thème par générateur déjà établi du chapitre 3 (6gen13 à 6gen22). `enonce`/`justification`
 * sont des `FragmentConsigne[]` (texte/LaTeX mêlés, jamais de `string` brute), même convention que
 * 6gen65. Notation sh/ch : `\operatorname{sh}`/`\operatorname{ch}` — convention déjà établie par
 * `ui6e/formatHyperboliques.ts` (6gen19), KaTeX ne définissant pas `\sinh`/`\cosh` avec cette
 * apparence sur la plateforme ; réutilisée ici à l'identique pour rester cohérent avec 6gen19.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizFonctionsLogarithmes } from "../../core6e/quizFonctionsLogarithmes.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const SH = "\\operatorname{sh}";
const CH = "\\operatorname{ch}";

export const BANQUE_QUIZ_FONCTIONS_LOGARITHMES: Record<VarianteQuizFonctionsLogarithmes, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Propriétés du logarithme, ref 6gen13
  // ==========================================================================
  proprietesLogarithme: [
    {
      enonce: [texte("Pour tous "), latex("a,b>0"), texte(", "), latex("\\ln(ab) = \\ln(a)+\\ln(b)"), texte(".")],
      reponse: true,
      justification: [texte("C'est la propriété fondamentale du logarithme népérien : il transforme un produit en somme, à condition que "), latex("a"), texte(" et "), latex("b"), texte(" soient strictement positifs.")],
    },
    {
      enonce: [texte("Pour tous "), latex("a,b>0"), texte(", "), latex("\\ln(a+b) = \\ln(a)+\\ln(b)"), texte(".")],
      reponse: false,
      justification: [texte("Piège classique : le logarithme d'une somme n'est PAS la somme des logarithmes. Seul le logarithme d'un PRODUIT se décompose ainsi.")],
    },
    {
      enonce: [latex("\\ln(1) = 0"), texte(".")],
      reponse: true,
      justification: [texte("C'est une valeur de référence du logarithme népérien, immédiate car "), latex("e^0=1"), texte(".")],
    },
    {
      enonce: [latex("\\ln(0) = 0"), texte(".")],
      reponse: false,
      justification: [latex("\\ln"), texte(" n'est pas défini en 0 : le domaine de "), latex("\\ln"), texte(" est "), latex("]0;+\\infty["), texte(", qui exclut 0.")],
    },
    {
      enonce: [latex("\\ln(e) = 1"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même du logarithme népérien : "), latex("e"), texte(" est l'unique réel dont le logarithme népérien vaut 1.")],
    },
    {
      enonce: [texte("Le domaine de définition de la fonction "), latex("\\ln"), texte(" est "), latex("\\mathbb{R}"), texte(" tout entier.")],
      reponse: false,
      justification: [texte("Le logarithme népérien n'est défini que pour des arguments strictement positifs : son domaine est "), latex("]0;+\\infty["), texte(", pas "), latex("\\mathbb{R}"), texte(" tout entier.")],
    },
    {
      enonce: [texte("Le domaine de définition de "), latex("x \\mapsto \\ln(x)"), texte(" est "), latex("]0;+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("Un argument de logarithme doit toujours être strictement positif : c'est exactement l'intervalle "), latex("]0;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Pour tout "), latex("a>0"), texte(", "), latex("\\ln\\!\\left(\\dfrac{1}{a}\\right) = -\\ln(a)"), texte(".")],
      reponse: true,
      justification: [texte("C'est un cas particulier de "), latex("\\ln(a^r)=r\\ln(a)"), texte(" avec "), latex("r=-1"), texte(", ou de la propriété du quotient avec numérateur 1.")],
    },
    {
      enonce: [texte("Pour tout "), latex("a>0"), texte(", "), latex("\\ln\\!\\left(\\dfrac{1}{a}\\right) = \\ln(a)"), texte(".")],
      reponse: false,
      justification: [texte("C'est faux sauf pour "), latex("a=1"), texte(" : en général "), latex("\\ln(1/a)=-\\ln(a)"), texte(", pas "), latex("\\ln(a)"), texte(" lui-même.")],
    },
    {
      enonce: [texte("Pour tous "), latex("a,b>0"), texte(", "), latex("\\ln\\!\\left(\\dfrac{a}{b}\\right) = \\ln(a)-\\ln(b)"), texte(".")],
      reponse: true,
      justification: [texte("C'est la propriété du quotient, symétrique de celle du produit : le logarithme d'un quotient est la différence des logarithmes.")],
    },
    {
      enonce: [texte("Pour tout "), latex("a>0"), texte(" et tout réel "), latex("r"), texte(", "), latex("\\ln(a^r) = r\\cdot\\ln(a)"), texte(".")],
      reponse: true,
      justification: [texte("C'est la propriété de la puissance : l'exposant descend en facteur devant le logarithme.")],
    },
    {
      enonce: [texte("Pour tout "), latex("a>0"), texte(", "), latex("\\ln(a^2)"), texte(" est égal à "), latex("(\\ln(a))^2"), texte(".")],
      reponse: false,
      justification: [texte("Confusion classique : "), latex("\\ln(a^2) = 2\\ln(a)"), texte(" (propriété de la puissance), ce qui n'est en général pas égal à "), latex("(\\ln(a))^2"), texte(", le CARRÉ du logarithme.")],
    },
    {
      enonce: [texte("Pour une base "), latex("a>0, a\\neq1"), texte(", "), latex("\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}"), texte(" pour tout "), latex("x>0"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule de changement de base : tout logarithme se ramène au logarithme népérien via ce quotient.")],
    },
    {
      enonce: [texte("Pour une base "), latex("a>0, a\\neq1"), texte(", "), latex("\\log_a(x) = \\ln(x)\\cdot\\ln(a)"), texte(" pour tout "), latex("x>0"), texte(".")],
      reponse: false,
      justification: [texte("Le changement de base utilise une DIVISION par "), latex("\\ln(a)"), texte(", pas une multiplication : "), latex("\\log_a(x)=\\ln(x)/\\ln(a)"), texte(".")],
    },
    {
      enonce: [texte("Pour toute base valide "), latex("a"), texte(" ("), latex("a>0, a\\neq1"), texte("), "), latex("\\log_a(a) = 1"), texte(".")],
      reponse: true,
      justification: [texte("Le logarithme d'un nombre dans sa propre base vaut toujours 1 : c'est une conséquence directe de la définition.")],
    },
    {
      enonce: [texte("Pour toute base valide "), latex("a"), texte(", "), latex("\\log_a(1) = 0"), texte(".")],
      reponse: true,
      justification: [texte("Quelle que soit la base, le logarithme de 1 vaut toujours 0, puisque "), latex("a^0=1"), texte(".")],
    },
    {
      enonce: [texte("La base d'un logarithme peut être égale à 1.")],
      reponse: false,
      justification: [texte("La base d'un logarithme doit toujours vérifier "), latex("a>0"), texte(" ET "), latex("a\\neq1"), texte(" : "), latex("a=1"), texte(" est explicitement exclu (sinon "), latex("a^x"), texte(" resterait toujours égal à 1, sans bijection possible).")],
    },
    {
      enonce: [texte("Pour tout "), latex("a>0"), texte(", "), latex("\\ln(\\sqrt{a}) = \\dfrac{1}{2}\\ln(a)"), texte(".")],
      reponse: true,
      justification: [texte("Une racine carrée est une puissance "), latex("1/2"), texte(" : la propriété de la puissance donne directement "), latex("\\ln(a^{1/2})=\\tfrac{1}{2}\\ln(a)"), texte(".")],
    },
    {
      enonce: [texte("Pour une base "), latex("a>1"), texte(", "), latex("\\log_a(x)"), texte(" est négatif pour tout "), latex("x"), texte(" de "), latex("]0;1["), texte(".")],
      reponse: true,
      justification: [texte("Pour "), latex("a>1"), texte(", "), latex("\\log_a"), texte(" est strictement croissante et vaut 0 en "), latex("x=1"), texte(" : pour "), latex("x<1"), texte(", elle est donc strictement négative.")],
    },
    {
      enonce: [latex("\\ln(2)+\\ln(3) = \\ln(5)"), texte(".")],
      reponse: false,
      justification: [texte("La propriété du produit donne "), latex("\\ln(2)+\\ln(3)=\\ln(2\\times3)=\\ln(6)"), texte(", pas "), latex("\\ln(5)"), texte(" — erreur classique d'additionner les arguments au lieu de les multiplier.")],
    },
    {
      enonce: [texte("Pour "), latex("a>0, a\\neq1"), texte(" et "), latex("x>0"), texte(", "), latex("a^{\\log_a(x)} = x"), texte(".")],
      reponse: true,
      justification: [texte("C'est la propriété (P4) : en posant "), latex("y=\\log_a(x)"), texte(", le principe d'équivalence fondamental donne exactement "), latex("a^y=x"), texte(" — "), latex("\\exp_a"), texte(" défait "), latex("\\log_a"), texte(".")],
    },
    {
      enonce: [texte("Le principe d'équivalence "), latex("\\log_a(x)=y \\iff a^y=x"), texte(" n'est valable que pour la base "), latex("e"), texte(".")],
      reponse: false,
      justification: [texte("C'est la DÉFINITION même de "), latex("\\log_a"), texte(", valable pour toute base "), latex("a>0, a\\neq1"), texte(" — la base "), latex("e"), texte(" n'y joue aucun rôle particulier.")],
    },
    {
      enonce: [texte("La démonstration de "), latex("\\log_a(x^r)=r\\cdot\\log_a(x)"), texte(" repose sur la règle "), latex("a^p\\cdot a^q=a^{p+q}"), texte(".")],
      reponse: false,
      justification: [texte("Elle repose sur la règle de la PUISSANCE D'UNE PUISSANCE, "), latex("(a^p)^r=a^{p\\cdot r}"), texte(" ; c'est "), latex("a^p\\cdot a^q=a^{p+q}"), texte(" qui sert, elle, à démontrer le logarithme d'un PRODUIT.")],
    },
    {
      enonce: [texte("Changement de base pour les exponentielles : pour "), latex("a,b>0"), texte(" tous deux différents de 1 et tout réel "), latex("x"), texte(", "), latex("a^x = b^{\\,x\\cdot\\log_b(a)}"), texte(".")],
      reponse: true,
      justification: [texte("Par (P4) en base "), latex("b"), texte(", "), latex("a=b^{\\log_b(a)}"), texte(" ; en élevant les deux membres à la puissance "), latex("x"), texte(" et en multipliant les exposants, on obtient "), latex("a^x=b^{\\,x\\cdot\\log_b(a)}"), texte(".")],
    },
    {
      enonce: [latex("a^x = b^{\\,x+\\log_b(a)}"), texte(" pour toutes bases valides "), latex("a"), texte(" et "), latex("b"), texte(".")],
      reponse: false,
      justification: [texte("Le changement de base fait apparaître un PRODUIT dans l'exposant, jamais une somme : "), latex("a^x=b^{\\,x\\cdot\\log_b(a)}"), texte(".")],
    },
    {
      enonce: [texte("Pour toute base valide "), latex("a"), texte(", l'image de "), latex("\\log_a"), texte(" est "), latex("\\mathbb{R}"), texte(" tout entier.")],
      reponse: true,
      justification: [latex("\\log_a"), texte(" est la réciproque de "), latex("\\exp_a"), texte(", dont le domaine est "), latex("\\mathbb{R}"), texte(" : domaine et image s'échangent entre une fonction et sa réciproque, donc "), latex("\\log_a"), texte(" atteint bien toutes les valeurs réelles.")],
    },
    {
      enonce: [texte("Le domaine ET l'image de "), latex("\\log_a"), texte(" sont tous deux "), latex("]0;+\\infty["), texte(".")],
      reponse: false,
      justification: [texte("Seul le DOMAINE vaut "), latex("]0;+\\infty["), texte(" ; l'image, elle, est "), latex("\\mathbb{R}"), texte(" tout entier.")],
    },
    {
      enonce: [texte("Deux fonctions logarithmes de bases différentes n'ont aucun point commun.")],
      reponse: false,
      justification: [texte("Elles passent TOUTES par le point "), latex("(1;0)"), texte(", puisque "), latex("\\log_a(1)=0"), texte(" pour toute base valide.")],
    },
    {
      enonce: [latex("\\log_b(a)"), texte(" peut être nul lorsque "), latex("a"), texte(" et "), latex("b"), texte(" sont deux bases valides (toutes deux "), latex(">0"), texte(" et "), latex("\\neq1"), texte(").")],
      reponse: false,
      justification: [latex("\\log_b"), texte(" ne s'annule qu'en 1 (propriété (P1)) et "), latex("a\\neq1"), texte(" par hypothèse : "), latex("\\log_b(a)\\neq0"), texte(" — c'est exactement ce qui autorise à diviser par "), latex("\\log_b(a)"), texte(" dans la démonstration du changement de base.")],
    },
    {
      enonce: [texte("Un multiple non nul "), latex("k\\cdot\\log_b"), texte(" n'est jamais une fonction logarithme.")],
      reponse: false,
      justification: [texte("C'est encore un logarithme, celui de base "), latex("a=b^{1/k}"), texte(" : il suffit de choisir "), latex("a"), texte(" tel que "), latex("\\log_b(a)=1/k"), texte(", un réel bien strictement positif et différent de 1 dès que "), latex("k\\neq0"), texte(".")],
    },
    {
      enonce: [texte("Pour tout "), latex("a>0"), texte(", "), latex("\\ln(a)=\\log_e(a)"), texte(" — ces deux fonctions, pourtant introduites indépendamment l'une de l'autre, sont en fait la même.")],
      reponse: true,
      justification: [texte("On dérive "), latex("a^x"), texte(" de deux façons : via le changement de base, "), latex("(a^x)'=a^x\\cdot\\log_e(a)"), texte(", et via la formule du chapitre 2, "), latex("(a^x)'=a^x\\cdot\\ln(a)"), texte(". En divisant les deux résultats par "), latex("a^x>0"), texte(", il reste "), latex("\\log_e(a)=\\ln(a)"), texte(".")],
    },
    {
      enonce: [texte("Les graphiques de "), latex("\\exp_a"), texte(" et "), latex("\\log_a"), texte(" sont symétriques par rapport à la droite "), latex("y=x"), texte(" : si "), latex("(r;s)"), texte(" appartient au premier, alors "), latex("(s;r)"), texte(" appartient au second.")],
      reponse: true,
      justification: [texte("C'est la traduction graphique de « fonctions réciproques », valable quelle que soit la base — seul le sens de variation des deux courbes change selon que "), latex("a>1"), texte(" ou "), latex("0<a<1"), texte(".")],
    },
    {
      enonce: [latex("\\log_2(10) = \\dfrac{\\ln(10)}{\\ln(2)} \\approx 3{,}32"), texte(".")],
      reponse: true,
      justification: [texte("Changement de base avec "), latex("b=e"), texte(" : "), latex("\\ln(10)/\\ln(2)\\approx2{,}303/0{,}693\\approx3{,}32"), texte(" — c'est ainsi qu'une calculatrice, qui n'a souvent qu'une touche "), latex("\\ln"), texte(", calcule un logarithme de base 2.")],
    },
    {
      enonce: [latex("\\log_2(8)-\\log_2(2) = \\log_2(6)"), texte(".")],
      reponse: false,
      justification: [texte("Soustraire deux logarithmes revient à DIVISER leurs arguments, jamais à les soustraire : "), latex("\\log_2(8)-\\log_2(2)=\\log_2(8/2)=\\log_2(4)=2"), texte(", alors que "), latex("\\log_2(6)\\approx2{,}58"), texte(".")],
    },
    {
      enonce: [latex("\\ln(2)\\cdot\\ln(3) = \\ln(6)"), texte(".")],
      reponse: false,
      justification: [texte("C'est la SOMME des logarithmes qui donne le logarithme du produit : "), latex("\\ln(2)+\\ln(3)=\\ln(6)"), texte(". Le produit "), latex("\\ln(2)\\cdot\\ln(3)\\approx0{,}76"), texte(" n'a rien à voir avec "), latex("\\ln(6)\\approx1{,}79"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 2 — Résoudre une équation exponentielle ou logarithmique, ref 6gen14
  // ==========================================================================
  equationsExpLog: [
    {
      enonce: [texte("Pour résoudre "), latex("\\text{base}^u = \\text{base}^v"), texte(" ("), latex("\\text{base}>0, \\neq1"), texte("), on peut identifier les exposants : "), latex("u=v"), texte(".")],
      reponse: true,
      justification: [texte("L'exponentielle de base fixée étant injective, l'égalité des images équivaut à l'égalité des exposants.")],
    },
    {
      enonce: [texte("Pour "), latex("u,v>0"), texte(", "), latex("\\ln(u)=\\ln(v)"), texte(" équivaut à "), latex("u=v"), texte(".")],
      reponse: true,
      justification: [texte("Le logarithme népérien est une fonction injective sur "), latex("]0;+\\infty["), texte(" : deux images égales viennent forcément du même antécédent.")],
    },
    {
      enonce: [texte("L'équivalence "), latex("\\ln(u)=\\ln(v) \\iff u=v"), texte(" reste valable même sans jamais vérifier que "), latex("u"), texte(" et "), latex("v"), texte(" sont strictement positifs.")],
      reponse: false,
      justification: [texte("Il faut toujours s'assurer que "), latex("u>0"), texte(" et "), latex("v>0"), texte(" (sinon "), latex("\\ln(u)"), texte(" ou "), latex("\\ln(v)"), texte(" ne serait même pas défini) — c'est une condition de domaine, jamais optionnelle.")],
    },
    {
      enonce: [texte("Résoudre "), latex("\\log_a(x)=b"), texte(" (base "), latex("a>0,a\\neq1"), texte(") donne "), latex("x=a^b"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition inverse du logarithme : "), latex("\\log_a(x)=b"), texte(" signifie exactement "), latex("a^b=x"), texte(".")],
    },
    {
      enonce: [texte("Après avoir résolu une équation en prenant le logarithme des deux membres, il est nécessaire de vérifier que la valeur trouvée garde tous les arguments de logarithme de l'équation initiale strictement positifs.")],
      reponse: true,
      justification: [texte("Une solution obtenue algébriquement peut rendre un argument de logarithme négatif ou nul dans l'équation de départ : elle doit alors être rejetée, même si le calcul intermédiaire était correct.")],
    },
    {
      enonce: [texte("Une « solution » trouvée via des logarithmes n'a jamais besoin d'être revérifiée dans le domaine de l'équation de départ.")],
      reponse: false,
      justification: [texte("C'est l'inverse : cette vérification est une étape systématique, car les logarithmes intermédiaires peuvent introduire des restrictions absentes de l'équation transformée.")],
    },
    {
      enonce: [texte("Poser "), latex("t=e^x"), texte(" est une technique valide pour transformer certaines équations exponentielles en équation polynomiale en "), latex("t"), texte(".")],
      reponse: true,
      justification: [texte("C'est la substitution classique quand l'équation ne fait apparaître que "), latex("e^x"), texte(" et ses puissances.")],
    },
    {
      enonce: [texte("Après résolution de l'équation polynomiale en "), latex("t=e^x"), texte(", toute racine réelle "), latex("t"), texte(" trouvée correspond forcément à une solution "), latex("x"), texte(".")],
      reponse: false,
      justification: [texte("Seules les racines "), latex("t"), texte(" strictement positives correspondent à un "), latex("x"), texte(" réel, puisque "), latex("e^x>0"), texte(" toujours : une racine "), latex("t\\leq0"), texte(" doit être rejetée.")],
    },
    {
      enonce: [texte("Si la racine "), latex("t=e^x"), texte(" trouvée est négative ou nulle, elle doit être rejetée car "), latex("e^x"), texte(" est toujours strictement positif.")],
      reponse: true,
      justification: [texte("L'exponentielle ne s'annule jamais et reste toujours positive : une racine "), latex("t\\leq0"), texte(" ne peut correspondre à aucun réel "), latex("x"), texte(".")],
    },
    {
      enonce: [texte("Pour résoudre "), latex("\\ln(x-2)+\\ln(x)=\\ln(3)"), texte(", il faut restreindre le domaine à "), latex("x>2"), texte(".")],
      reponse: true,
      justification: [texte("Les deux arguments de logarithme doivent être strictement positifs : "), latex("x>0"), texte(" ET "), latex("x-2>0"), texte(", ce qui donne "), latex("x>2"), texte(" comme condition la plus restrictive.")],
    },
    {
      enonce: [texte("Pour "), latex("\\ln(x-2)+\\ln(x)=\\ln(3)"), texte(", la restriction de domaine est simplement "), latex("x>0"), texte(".")],
      reponse: false,
      justification: [texte("Il faut aussi "), latex("x-2>0"), texte(", soit "), latex("x>2"), texte(", condition plus restrictive que "), latex("x>0"), texte(" seul.")],
    },
    {
      enonce: [latex("\\ln(x)=0"), texte(" admet pour unique solution "), latex("x=1"), texte(".")],
      reponse: true,
      justification: [texte("Puisque "), latex("\\ln(1)=0"), texte(" et que "), latex("\\ln"), texte(" est injective, "), latex("x=1"), texte(" est la seule solution.")],
    },
    {
      enonce: [latex("\\ln(x)=0"), texte(" admet deux solutions, "), latex("x=1"), texte(" et "), latex("x=-1"), texte(".")],
      reponse: false,
      justification: [latex("x=-1"), texte(" n'est même pas dans le domaine de "), latex("\\ln"), texte(" (qui exige "), latex("x>0"), texte(") : la seule solution est "), latex("x=1"), texte(".")],
    },
    {
      enonce: [latex("e^x=5"), texte(" admet pour unique solution "), latex("x=\\ln(5)"), texte(".")],
      reponse: true,
      justification: [texte("En appliquant "), latex("\\ln"), texte(" aux deux membres (tous deux strictement positifs), on obtient directement "), latex("x=\\ln(5)"), texte(".")],
    },
    {
      enonce: [latex("e^x=-3"), texte(" admet une solution réelle.")],
      reponse: false,
      justification: [latex("e^x"), texte(" est toujours strictement positif : cette équation n'a donc aucune solution réelle.")],
    },
    {
      enonce: [texte("Une équation quadratique en "), latex("\\ln(x)"), texte(", comme "), latex("(\\ln(x))^2-\\ln(x)-2=0"), texte(", peut se résoudre en posant "), latex("t=\\ln(x)"), texte(".")],
      reponse: true,
      justification: [texte("C'est la même technique de substitution : l'équation devient une équation du second degré classique en "), latex("t"), texte(", sans aucune restriction de signe sur "), latex("t"), texte(" puisque "), latex("\\ln(x)"), texte(" peut prendre n'importe quelle valeur réelle.")],
    },
    {
      enonce: [latex("e^{2x}=e^{x+3}"), texte(" équivaut à "), latex("2x=x+3"), texte(".")],
      reponse: true,
      justification: [texte("L'exponentielle est injective : deux exponentielles égales ont des exposants égaux. On obtient "), latex("x=3"), texte(".")],
    },
    {
      enonce: [texte("L'équation "), latex("2^x=5"), texte(" a pour solution "), latex("x=\\dfrac{5}{2}"), texte(".")],
      reponse: false,
      justification: [texte("Il faut appliquer un logarithme aux deux membres : "), latex("x=\\log_2(5)=\\dfrac{\\ln(5)}{\\ln(2)}\\approx2{,}32"), texte(". Diviser 5 par la base n'a aucun sens.")],
    },
    {
      enonce: [texte("Pour tout "), latex("\\text{base}>0, \\neq1"), texte(", "), latex("\\text{base}^x=\\text{base}^y"), texte(" implique "), latex("x=y"), texte(".")],
      reponse: true,
      justification: [texte("C'est l'injectivité de la fonction exponentielle de base fixée : deux images égales viennent nécessairement du même exposant.")],
    },
    {
      enonce: [texte("Deux valeurs différentes de "), latex("x"), texte(" peuvent donner la même valeur de "), latex("\\text{base}^x"), texte(" ("), latex("\\text{base}>0, \\neq1"), texte(").")],
      reponse: false,
      justification: [texte("C'est faux : l'exponentielle de base fixée est injective, elle ne prend jamais deux fois la même valeur pour deux exposants distincts.")],
    },
    {
      enonce: [texte("Pour résoudre "), latex("a^{mx+n}=C"), texte(" ("), latex("a>0, a\\neq1"), texte(", "), latex("C>0"), texte("), on identifie d'abord l'exposant, "), latex("mx+n=\\log_a(C)"), texte(", puis "), latex("x=\\dfrac{\\log_a(C)-n}{m}"), texte(".")],
      reponse: true,
      justification: [texte("Appliquer "), latex("\\log_a"), texte(" aux deux membres fait descendre l'exposant ; il ne reste plus qu'une équation du premier degré en "), latex("x"), texte(".")],
    },
    {
      enonce: [texte("Résoudre "), latex("\\ln(2x-1)=3"), texte(" donne "), latex("2x-1=3e"), texte(", donc "), latex("x=\\dfrac{3e+1}{2}"), texte(".")],
      reponse: false,
      justification: [texte("Appliquer l'exponentielle aux deux membres donne "), latex("2x-1=e^3"), texte(" (et non "), latex("3e"), texte(") : "), latex("x=\\dfrac{e^3+1}{2}\\approx10{,}54"), texte(".")],
    },
    {
      enonce: [texte("Quand les deux membres sont des exponentielles de bases DIFFÉRENTES, comme "), latex("2^{3x+1}=5^{x-2}"), texte(", on applique "), latex("\\ln"), texte(" aux deux membres, ce qui rend l'équation du premier degré en "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Après "), latex("\\ln"), texte(", chaque exposant descend en facteur : "), latex("(3x+1)\\ln(2)=(x-2)\\ln(5)"), texte(" — une équation affine dont les coefficients sont des logarithmes.")],
    },
    {
      enonce: [texte("L'équation "), latex("\\log_5(x)=2"), texte(" a pour unique solution "), latex("x=25"), texte(".")],
      reponse: true,
      justification: [texte("Par définition du logarithme, "), latex("\\log_5(x)=2"), texte(" signifie "), latex("x=5^2=25"), texte(", qui est bien strictement positif.")],
    },
    {
      enonce: [texte("Pour l'équation "), latex("\\log_a(u)=b"), texte(" (un SEUL logarithme, déjà isolé), la solution obtenue en appliquant "), latex("\\exp_a"), texte(" peut violer la condition "), latex("u>0"), texte(" et doit alors être rejetée.")],
      reponse: false,
      justification: [texte("Dans ce cas précis, la solution donne "), latex("u=a^b"), texte(", toujours strictement positif : la condition d'existence est AUTOMATIQUEMENT satisfaite. C'est quand plusieurs logarithmes sont combinés que le rejet devient possible.")],
    },
    {
      enonce: [texte("Pour "), latex("\\log_2(x)+\\log_2(x+2)=3"), texte(", la condition d'existence se réduit à "), latex("x>0"), texte(".")],
      reponse: true,
      justification: [texte("Il faut "), latex("x>0"), texte(" ET "), latex("x+2>0"), texte(", soit "), latex("x>-2"), texte(" : la condition la plus restrictive est "), latex("x>0"), texte(".")],
    },
    {
      enonce: [latex("\\ln(x^2)=2\\ln(x)"), texte(" pour tout réel "), latex("x\\neq0"), texte(".")],
      reponse: false,
      justification: [texte("Le membre de gauche existe pour tout "), latex("x\\neq0"), texte(", celui de droite seulement pour "), latex("x>0"), texte(". L'égalité correcte sur "), latex("\\mathbb{R}\\setminus\\{0\\}"), texte(" est "), latex("\\ln(x^2)=2\\ln|x|"), texte(".")],
    },
    {
      enonce: [texte("L'équation "), latex("3^x=81"), texte(" a pour solution "), latex("x=4"), texte(".")],
      reponse: true,
      justification: [latex("81=3^4"), texte(" : par injectivité de l'exponentielle de base 3, "), latex("x=4"), texte(".")],
    },
    {
      enonce: [texte("L'équation "), latex("\\ln(x)=-2"), texte(" n'a aucune solution, car un logarithme ne peut pas être négatif.")],
      reponse: false,
      justification: [texte("Un logarithme peut être négatif (pour un argument entre 0 et 1) : "), latex("x=e^{-2}\\approx0{,}135"), texte(" est l'unique solution.")],
    },
    {
      enonce: [texte("La substitution "), latex("t=\\log_a(x)"), texte(" impose, comme "), latex("t=a^x"), texte(", de rejeter les racines "), latex("t\\leq0"), texte(".")],
      reponse: false,
      justification: [latex("\\log_a(x)"), texte(" peut prendre n'importe quelle valeur réelle : AUCUNE racine "), latex("t"), texte(" n'est à rejeter ici, et "), latex("x=a^t"), texte(" reste strictement positif quel que soit "), latex("t"), texte(". C'est bien la différence avec la substitution "), latex("t=a^x"), texte(" du chapitre 2.")],
    },
    {
      enonce: [texte("Une équation logarithmique peut n'avoir AUCUNE solution alors que l'équation algébrique obtenue après suppression des logarithmes en a deux.")],
      reponse: true,
      justification: [texte("Les deux racines algébriques peuvent toutes deux violer la condition d'existence : elles sont alors toutes deux rejetées et "), latex("S=\\varnothing"), texte(", bien que le calcul intermédiaire ait été correct.")],
    },
    {
      enonce: [texte("L'équation "), latex("\\log_a(u)+\\log_a(v)=\\log_a(u\\cdot v)"), texte(" (où "), latex("u"), texte(" et "), latex("v"), texte(" sont deux expressions affines en "), latex("x"), texte(") n'a jamais de solution.")],
      reponse: false,
      justification: [texte("C'est une IDENTITÉ : la règle du produit reconstitue exactement le membre de droite. L'égalité est donc vraie pour TOUT "), latex("x"), texte(" du domaine — l'ensemble-solution est le domaine tout entier, jamais "), latex("\\varnothing"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("\\log_a(x^2+b_0)=\\log_a(c_0)"), texte(" avec "), latex("0<c_0<b_0"), texte(", l'ensemble vide provient de la condition d'existence.")],
      reponse: false,
      justification: [texte("La CE est ici "), latex("\\mathbb{R}"), texte(" tout entier ("), latex("x^2+b_0>0"), texte(" toujours, puisque "), latex("b_0>0"), texte("). Le vide vient de "), latex("x^2=c_0-b_0<0"), texte(", impossible sur les réels — un mécanisme totalement différent.")],
    },
    {
      enonce: [texte("Pour "), latex("a^{mx+n}=C"), texte(" où "), latex("C"), texte(" n'est pas une puissance entière de "), latex("a"), texte(", la solution "), latex("x"), texte(" est toujours un nombre rationnel.")],
      reponse: false,
      justification: [latex("\\log_a(C)=\\ln(C)/\\ln(a)"), texte(" est en général IRRATIONNEL dans ce cas (ex. "), latex("\\log_3(20)\\approx2{,}727"), texte(") : la solution ne se simplifie pas en une fraction.")],
    },
    {
      enonce: [texte("Toute équation logarithmique admet au moins une solution réelle.")],
      reponse: false,
      justification: [texte("C'est faux : selon les cas, une équation logarithmique peut avoir 0, 1 ou 2 solutions — le vide survient soit par violation de la condition d'existence, soit par un discriminant négatif.")],
    },
  ],

  // ==========================================================================
  // Thème 3 — Résoudre une inéquation logarithmique, ref 6gen15
  // ==========================================================================
  inequationsLogarithme: [
    {
      enonce: [texte("La fonction "), latex("\\ln"), texte(" est strictement croissante sur "), latex("]0;+\\infty["), texte(", donc elle ne change jamais le sens d'une inégalité.")],
      reponse: true,
      justification: [texte("Contrairement à une exponentielle de base "), latex("<1"), texte(", "), latex("\\ln"), texte(" (base "), latex("e>1"), texte(" implicite) est toujours strictement croissante : le sens de l'inégalité est toujours conservé.")],
    },
    {
      enonce: [texte("La fonction "), latex("\\ln"), texte(" est strictement décroissante sur son domaine.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("\\ln"), texte(" est strictement croissante sur tout son domaine "), latex("]0;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("u,v>0"), texte(", "), latex("\\ln(u)\\leq\\ln(v)"), texte(" équivaut à "), latex("u\\leq v"), texte(".")],
      reponse: true,
      justification: [texte("Comme "), latex("\\ln"), texte(" est strictement croissante, elle conserve le sens de l'inégalité entre deux quantités déjà positives.")],
    },
    {
      enonce: [texte("Pour "), latex("u,v>0"), texte(", "), latex("\\ln(u)\\leq\\ln(v)"), texte(" équivaut à "), latex("u\\geq v"), texte(".")],
      reponse: false,
      justification: [texte("Ce serait le cas pour une fonction décroissante. "), latex("\\ln"), texte(" étant croissante, le sens de l'inégalité reste inchangé : "), latex("u\\leq v"), texte(", pas "), latex("u\\geq v"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("u>0"), texte(", "), latex("\\ln(u)>0"), texte(" équivaut à "), latex("u>1"), texte(".")],
      reponse: true,
      justification: [texte("Puisque "), latex("\\ln(1)=0"), texte(" et que "), latex("\\ln"), texte(" est croissante, "), latex("\\ln(u)"), texte(" est strictement positif exactement pour "), latex("u>1"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("u>0"), texte(", "), latex("\\ln(u)>0"), texte(" équivaut à "), latex("u>0"), texte(".")],
      reponse: false,
      justification: [texte("C'est une confusion entre le domaine de "), latex("\\ln"), texte(" ("), latex("u>0"), texte(") et la condition de positivité de "), latex("\\ln(u)"), texte(" lui-même, qui exige "), latex("u>1"), texte(", pas seulement "), latex("u>0"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("u>0"), texte(", "), latex("\\ln(u)<0"), texte(" équivaut à "), latex("0<u<1"), texte(".")],
      reponse: true,
      justification: [texte("Entre 0 et 1, "), latex("\\ln"), texte(" est strictement négative (elle vaut 0 en "), latex("u=1"), texte(" et tend vers "), latex("-\\infty"), texte(" en "), latex("0^+"), texte(").")],
    },
    {
      enonce: [texte("Résoudre "), latex("\\ln(x)\\leq2"), texte(" donne "), latex("0<x\\leq e^2"), texte(".")],
      reponse: true,
      justification: [texte("Le domaine impose "), latex("x>0"), texte(", et la croissance de "), latex("\\ln"), texte(" transforme "), latex("\\ln(x)\\leq2=\\ln(e^2)"), texte(" en "), latex("x\\leq e^2"), texte(".")],
    },
    {
      enonce: [texte("Résoudre "), latex("\\ln(x)\\leq2"), texte(" donne "), latex("x\\leq e^2"), texte(", sans autre restriction.")],
      reponse: false,
      justification: [texte("Il manque la contrainte de domaine "), latex("x>0"), texte(" : la solution correcte est "), latex("0<x\\leq e^2"), texte(", pas "), latex("x\\leq e^2"), texte(" tout seul (qui inclurait à tort les "), latex("x"), texte(" négatifs).")],
    },
    {
      enonce: [texte("Pour résoudre "), latex("\\ln(x-1)>0"), texte(", il faut à la fois le domaine "), latex("x-1>0"), texte(" et la condition "), latex("x-1>1"), texte(", ce qui donne "), latex("x>2"), texte(".")],
      reponse: true,
      justification: [texte("Le domaine ("), latex("x-1>0"), texte(") est moins restrictif que la condition finale ("), latex("x-1>1"), texte(") : c'est cette dernière qui détermine l'ensemble-solution, "), latex("x>2"), texte(".")],
    },
    {
      enonce: [texte("L'ensemble-solution de "), latex("\\ln(x-1)>0"), texte(" est "), latex("x>1"), texte(".")],
      reponse: false,
      justification: [latex("x>1"), texte(" n'est que la condition de DOMAINE (pour que "), latex("\\ln(x-1)"), texte(" soit défini). La condition "), latex("\\ln(x-1)>0"), texte(" elle-même exige "), latex("x-1>1"), texte(", soit "), latex("x>2"), texte(".")],
    },
    {
      enonce: [texte("Pour un logarithme de base "), latex("a"), texte(" avec "), latex("0<a<1"), texte(", la fonction "), latex("\\log_a"), texte(" est strictement décroissante, donc comparer "), latex("\\log_a(u)"), texte(" et "), latex("\\log_a(v)"), texte(" impose d'inverser le sens de l'inégalité (contrairement à "), latex("\\ln"), texte(", de base "), latex("e>1"), texte(" toujours croissante).")],
      reponse: true,
      justification: [texte("Le sens de variation d'un logarithme dépend du signe de "), latex("a-1"), texte(" : pour "), latex("0<a<1"), texte(" il est décroissant, alors que "), latex("\\ln"), texte(" (base "), latex("e>1"), texte(") est toujours croissant — deux comportements opposés à ne pas confondre.")],
    },
    {
      enonce: [texte("Un logarithme "), latex("\\log_a"), texte(" conserve toujours le même sens d'inégalité, quelle que soit la base "), latex("a"), texte(" (avec "), latex("a>0,a\\neq1"), texte(").")],
      reponse: false,
      justification: [texte("Faux : le sens dépend de la base. Pour "), latex("a>1"), texte(", "), latex("\\log_a"), texte(" est croissante (sens conservé) ; pour "), latex("0<a<1"), texte(", elle est décroissante (sens inversé).")],
    },
    {
      enonce: [texte("Résoudre une inéquation logarithmique nécessite de restreindre d'abord aux valeurs de "), latex("x"), texte(" pour lesquelles chaque argument de logarithme est strictement positif.")],
      reponse: true,
      justification: [texte("Le domaine de validité (chaque argument "), latex(">0"), texte(") doit être déterminé avant toute résolution, sous peine d'obtenir des solutions incohérentes.")],
    },
    {
      enonce: [texte("On peut résoudre une inéquation logarithmique sans déterminer au préalable son domaine de validité.")],
      reponse: false,
      justification: [texte("C'est l'inverse : le domaine de validité doit être posé en premier, sinon l'ensemble-solution final peut être faux ou incohérent.")],
    },
    {
      enonce: [texte("Sur le domaine commun "), latex("x>2"), texte(", l'inéquation "), latex("\\ln(x)>\\ln(x-2)"), texte(" équivaut à "), latex("x>x-2"), texte(", ce qui est vrai pour tout "), latex("x"), texte(" du domaine — l'ensemble-solution est donc "), latex("]2;+\\infty["), texte(" tout entier.")],
      reponse: true,
      justification: [texte("Par croissance de "), latex("\\ln"), texte(", l'inégalité équivaut à "), latex("x>x-2"), texte(", c'est-à-dire "), latex("0>-2"), texte(", toujours vraie : l'inéquation est donc vérifiée partout où elle est définie.")],
    },
    {
      enonce: [latex("\\ln(x)>\\ln(x-2)"), texte(" n'a aucune solution.")],
      reponse: false,
      justification: [texte("Au contraire, cette inéquation est vraie sur tout son domaine de validité "), latex("]2;+\\infty["), texte(", puisque "), latex("x"), texte(" est toujours strictement supérieur à "), latex("x-2"), texte(".")],
    },
    {
      enonce: [texte("L'ensemble-solution d'une inéquation logarithmique peut être strictement inclus dans le domaine de validité (par exemple, domaine "), latex("]0;+\\infty["), texte(" mais solution seulement "), latex("]1;+\\infty["), texte(").")],
      reponse: true,
      justification: [texte("C'est fréquent : le domaine garantit que l'expression est définie, mais la condition de l'inéquation elle-même peut être plus restrictive.")],
    },
    {
      enonce: [texte("L'ensemble-solution d'une inéquation logarithmique coïncide toujours exactement avec son domaine de validité.")],
      reponse: false,
      justification: [texte("C'est faux en général : le domaine de validité n'est qu'une condition nécessaire, la condition de l'inéquation elle-même vient ensuite restreindre (ou non) cet ensemble.")],
    },
    {
      enonce: [latex("\\ln(x)\\geq0"), texte(" équivaut à "), latex("x\\geq1"), texte(" (sur le domaine "), latex("x>0"), texte(").")],
      reponse: true,
      justification: [texte("Puisque "), latex("\\ln(1)=0"), texte(" et que "), latex("\\ln"), texte(" est croissante, "), latex("\\ln(x)\\geq0"), texte(" équivaut exactement à "), latex("x\\geq1"), texte(".")],
    },
    {
      enonce: [texte("La démonstration de "), latex("\\log_a(u)<\\log_a(v) \\iff u<v"), texte(" (pour "), latex("a>1"), texte(") s'appuie sur DEUX fonctions différentes selon le sens : "), latex("\\exp_a"), texte(" pour le sens direct, "), latex("\\log_a"), texte(" elle-même pour la réciproque.")],
      reponse: true,
      justification: [texte("Sens "), latex("\\Rightarrow"), texte(" : on applique "), latex("\\exp_a"), texte(" (croissante pour "), latex("a>1"), texte(") aux deux membres, puis (P4) simplifie "), latex("a^{\\log_a(u)}"), texte(" en "), latex("u"), texte(". Sens "), latex("\\Leftarrow"), texte(" : c'est la croissance de "), latex("\\log_a"), texte(" elle-même qui conclut.")],
    },
    {
      enonce: [texte("Les deux sens de l'équivalence "), latex("\\log_a(u)<\\log_a(v) \\iff u<v"), texte(" se démontrent en appliquant la même fonction "), latex("\\log_a"), texte(".")],
      reponse: false,
      justification: [texte("C'est le point délicat de cette démonstration : le sens direct s'appuie sur "), latex("\\exp_a"), texte(" (et sur (P4)), le sens réciproque sur "), latex("\\log_a"), texte(" — deux fonctions différentes.")],
    },
    {
      enonce: [texte("La comparaison à une constante ("), latex("\\log_a(u)<y"), texte(") se DÉDUIT du cas « deux logarithmes » en réécrivant "), latex("y=\\log_a(a^y)"), texte(" grâce à (P3) : aucune démonstration nouvelle n'est nécessaire.")],
      reponse: true,
      justification: [texte("Une fois "), latex("y"), texte(" réécrit en "), latex("\\log_a(a^y)"), texte(", les deux membres sont des logarithmes de même base et "), latex("a^y>0"), texte(" — c'est exactement la situation déjà traitée.")],
    },
    {
      enonce: [texte("Pour une base "), latex("0<a<1"), texte(", "), latex("\\log_a(u)<y"), texte(" équivaut à "), latex("u<a^y"), texte(".")],
      reponse: false,
      justification: [texte("Pour "), latex("0<a<1"), texte(", "), latex("\\log_a"), texte(" est décroissante : le sens s'INVERSE, l'équivalence correcte est "), latex("u>a^y"), texte(".")],
    },
    {
      enonce: [texte("L'ensemble-solution de "), latex("\\log_{0{,}5}(x)\\leq2"), texte(" est "), latex("[0{,}25\\,;\\,+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("La base "), latex("0{,}5<1"), texte(" rend "), latex("\\log_{0{,}5}"), texte(" décroissante : le sens s'inverse, "), latex("x\\geq0{,}5^2=0{,}25"), texte(" — et cette solution est bien incluse dans le domaine "), latex("]0;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("L'ensemble-solution de "), latex("\\log_{0{,}5}(x)\\leq2"), texte(" est "), latex("]0\\,;\\,0{,}25]"), texte(".")],
      reponse: false,
      justification: [texte("Ce serait la solution pour une base "), latex(">1"), texte(". Ici la base "), latex("0{,}5<1"), texte(" inverse le sens : la solution part de l'autre côté, "), latex("[0{,}25;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Une même inéquation du second degré, obtenue après simplification, peut donner DEUX ensembles-solutions différents selon que la base du logarithme est "), latex("<1"), texte(" ou "), latex(">1"), texte(".")],
      reponse: true,
      justification: [texte("Le sens du comparateur change avec la base : d'un côté on résout "), latex("4w^2+6w-4\\leq0"), texte(", de l'autre "), latex("4w^2+6w-4\\geq0"), texte(" — deux ensembles complémentaires, intersectés ensuite avec la même CE.")],
    },
    {
      enonce: [texte("Pour "), latex("\\log_a(x-p) \\text{ R } \\log_a(r-x)"), texte(" avec "), latex("r<p"), texte(", on peut conclure "), latex("S=\\varnothing"), texte(" SANS jamais résoudre l'inégalité principale.")],
      reponse: true,
      justification: [texte("La CE exige à la fois "), latex("x>p"), texte(" et "), latex("x<r"), texte(" ; avec "), latex("r<p"), texte(", aucun réel ne vérifie les deux : le domaine est déjà vide, l'inégalité elle-même n'a plus lieu d'être examinée.")],
    },
    {
      enonce: [texte("Quand le domaine de validité d'une inéquation logarithmique est vide, son ensemble-solution est indéterminable.")],
      reponse: false,
      justification: [texte("Au contraire, il est parfaitement déterminé : c'est "), latex("\\varnothing"), texte(" — aucune valeur ne peut être solution là où l'expression n'est même pas définie.")],
    },
    {
      enonce: [texte("Pour "), latex("A(\\log_a x)^2+B\\log_a x+C \\text{ R } 0"), texte(", on pose "), latex("y=\\log_a(x)"), texte(", on résout en "), latex("y"), texte(", PUIS on repasse à "), latex("x"), texte(" via "), latex("x=a^y"), texte(" — en inversant le sens si "), latex("a<1"), texte(".")],
      reponse: true,
      justification: [texte("La substitution ramène à une inéquation du second degré classique ; le retour à "), latex("x"), texte(" est un passage par "), latex("\\exp_a"), texte(", dont le sens dépend de la base — piège central de ce type d'exercice.")],
    },
    {
      enonce: [texte("Pour "), latex("A(\\log_a x)^2+B\\log_a x+C \\text{ R } 0"), texte(", la condition d'existence dépend des coefficients "), latex("A"), texte(", "), latex("B"), texte(", "), latex("C"), texte(".")],
      reponse: false,
      justification: [texte("La CE est toujours "), latex("x>0"), texte(" — seul l'argument du logarithme compte, jamais les coefficients qui l'entourent.")],
    },
    {
      enonce: [texte("Dans "), latex("\\log_a(f)-\\log_a(g) \\text{ R } \\log_a(k)"), texte(", la CE garantit "), latex("g>0"), texte(", ce qui permet de multiplier par "), latex("g"), texte(" sans changer le sens : la comparaison "), latex("f/g \\text{ R } k"), texte(" devient une inéquation AFFINE, jamais du second degré.")],
      reponse: true,
      justification: [texte("Multiplier les deux membres par un nombre strictement positif conserve le sens : "), latex("f/g \\text{ R } k"), texte(" devient "), latex("f-k\\cdot g \\text{ R } 0"), texte(", affine puisque "), latex("f"), texte(" et "), latex("g"), texte(" le sont.")],
    },
    {
      enonce: [texte("Pour combiner "), latex("\\log_a(f)+\\log_a(g)"), texte(" en "), latex("\\log_a(f\\cdot g)"), texte(", aucune condition n'est à poser.")],
      reponse: false,
      justification: [texte("Il faut "), latex("f>0"), texte(" ET "), latex("g>0"), texte(" SÉPARÉMENT : le produit "), latex("f\\cdot g"), texte(" peut être positif alors que les deux facteurs sont négatifs, cas où le membre de gauche n'existe même pas.")],
    },
    {
      enonce: [texte("Quand la base "), latex("a"), texte(" d'une inéquation logarithmique n'est PAS précisée (seulement "), latex("a>0, a\\neq1"), texte("), on peut tout de même conclure un ensemble-solution unique.")],
      reponse: false,
      justification: [texte("Il faut traiter séparément les deux cas "), latex("a>1"), texte(" et "), latex("0<a<1"), texte(", qui donnent des conclusions différentes — typiquement "), latex("\\varnothing"), texte(" dans un cas, le domaine privé d'un point dans l'autre.")],
    },
    {
      enonce: [texte("Le tableau des 8 cas (4 comparateurs × 2 types de base) exige 8 démonstrations indépendantes.")],
      reponse: false,
      justification: [texte("Deux démonstrations suffisent (celle du cas "), latex("a>1"), texte(" et celle du cas "), latex("0<a<1"), texte(", pour le comparateur "), latex("<"), texte(") : "), latex("\\leq"), texte(" s'en déduit par l'égalité de deux logarithmes, et "), latex(">"), texte("/"), latex("\\geq"), texte(" par simple échange des rôles de "), latex("u"), texte(" et "), latex("v"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 4 — Domaine, dérivée et dérivation logarithmique, ref 6gen16
  // ==========================================================================
  domaineDeriveeLogarithme: [
    {
      enonce: [latex("(\\ln x)' = \\dfrac{1}{x}"), texte(", pour "), latex("x\\in]0;+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("C'est la dérivée de référence du logarithme népérien, valable sur tout son domaine.")],
    },
    {
      enonce: [latex("(\\ln x)' = x"), texte(", pour "), latex("x\\in]0;+\\infty["), texte(".")],
      reponse: false,
      justification: [texte("Confusion avec l'exponentielle : la dérivée de "), latex("\\ln(x)"), texte(" est "), latex("1/x"), texte(", pas "), latex("x"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("u"), texte(" dérivable avec "), latex("u(x)>0"), texte(", "), latex("(\\ln(u(x)))' = \\dfrac{u'(x)}{u(x)}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la règle de la chaîne appliquée au logarithme népérien : la dérivée de l'intérieur divisée par l'intérieur.")],
    },
    {
      enonce: [texte("Pour "), latex("u"), texte(" dérivable, "), latex("(\\ln(u(x)))' = u'(x)"), texte(", quelle que soit "), latex("u(x)"), texte(".")],
      reponse: false,
      justification: [texte("Il manque la division par "), latex("u(x)"), texte(" : la formule correcte est "), latex("(\\ln(u(x)))'=u'(x)/u(x)"), texte(".")],
    },
    {
      enonce: [texte("Le domaine de définition de "), latex("x\\mapsto\\ln(u(x))"), texte(" est l'ensemble des "), latex("x"), texte(" tels que "), latex("u(x)>0"), texte(".")],
      reponse: true,
      justification: [texte("Un argument de logarithme doit toujours rester strictement positif : c'est cette condition qui définit le domaine de la composée.")],
    },
    {
      enonce: [texte("Le domaine de définition de "), latex("x\\mapsto\\ln(u(x))"), texte(" est le même que celui de "), latex("u"), texte(", sans condition supplémentaire.")],
      reponse: false,
      justification: [texte("Il faut en plus que "), latex("u(x)>0"), texte(" : le domaine de la composée est donc, en général, plus restreint que celui de "), latex("u"), texte(" seul.")],
    },
    {
      enonce: [texte("Pour une base "), latex("a>0,a\\neq1"), texte(", "), latex("(\\log_a(x))' = \\dfrac{1}{x\\ln(a)}"), texte(", pour "), latex("x>0"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule générale de dérivation d'un logarithme de base quelconque, obtenue via "), latex("\\log_a(x)=\\ln(x)/\\ln(a)"), texte(".")],
    },
    {
      enonce: [latex("(\\log_a(x))' = \\dfrac{1}{x}"), texte(", quelle que soit la base "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("Il manque le facteur "), latex("\\ln(a)"), texte(" au dénominateur ; cette formule n'est exacte que pour "), latex("a=e"), texte(", puisque "), latex("\\ln(e)=1"), texte(".")],
    },
    {
      enonce: [latex("\\log_e(x) = \\ln(x)"), texte(".")],
      reponse: true,
      justification: [texte("Le logarithme de base "), latex("e"), texte(" est précisément le logarithme népérien, c'est sa définition.")],
    },
    {
      enonce: [latex("\\log_a(x)"), texte(" et "), latex("\\ln(x)"), texte(" sont égaux pour n'importe quelle base "), latex("a>0,a\\neq1"), texte(".")],
      reponse: false,
      justification: [texte("Ce n'est vrai que pour "), latex("a=e"), texte(". En général, "), latex("\\log_a(x)=\\ln(x)/\\ln(a)"), texte(", différent de "), latex("\\ln(x)"), texte(" sauf si "), latex("\\ln(a)=1"), texte(".")],
    },
    {
      enonce: [texte("La dérivation logarithmique (calculer "), latex("\\ln|f(x)|"), texte(" puis dériver) est une technique valide pour dériver un produit ou un quotient compliqué.")],
      reponse: true,
      justification: [texte("C'est une méthode classique : transformer produits/quotients en sommes/différences via le logarithme simplifie souvent grandement le calcul de la dérivée.")],
    },
    {
      enonce: [texte("La dérivation logarithmique exige que "), latex("f(x)\\neq0"), texte(" sur l'intervalle considéré.")],
      reponse: true,
      justification: [texte("Le logarithme "), latex("\\ln|f(x)|"), texte(" n'est défini que si "), latex("f(x)\\neq0"), texte(" ; là où "), latex("f"), texte(" s'annule, la technique ne s'applique pas directement.")],
    },
    {
      enonce: [texte("La dérivation logarithmique peut s'appliquer même là où "), latex("f(x)=0"), texte(", sans aucune précaution.")],
      reponse: false,
      justification: [texte("C'est faux : "), latex("\\ln|f(x)|"), texte(" n'est pas défini quand "), latex("f(x)=0"), texte(", ce qui rend la technique inapplicable telle quelle en ce point.")],
    },
    {
      enonce: [texte("La fonction "), latex("x\\mapsto\\ln(x^2)"), texte(" est définie pour tout "), latex("x\\neq0"), texte(" (car "), latex("x^2>0"), texte(" dès que "), latex("x\\neq0"), texte(").")],
      reponse: true,
      justification: [texte("Le carré d'un réel non nul est toujours strictement positif : le domaine de "), latex("\\ln(x^2)"), texte(" est donc "), latex("\\mathbb{R}\\setminus\\{0\\}"), texte(", et non pas seulement "), latex("]0;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("La fonction "), latex("x\\mapsto\\ln(x^2)"), texte(" a le même domaine que "), latex("x\\mapsto2\\ln(x)"), texte(", à savoir "), latex("]0;+\\infty["), texte(".")],
      reponse: false,
      justification: [texte("Ces deux expressions ne sont égales QUE sur "), latex("]0;+\\infty["), texte(" (où "), latex("2\\ln(x)"), texte(" est même définie), mais "), latex("\\ln(x^2)"), texte(" a un domaine plus large, "), latex("\\mathbb{R}\\setminus\\{0\\}"), texte(", incluant aussi les "), latex("x"), texte(" négatifs.")],
    },
    {
      enonce: [texte("Le domaine de "), latex("x\\mapsto\\ln(x)+\\ln(x-3)"), texte(" est "), latex("]3;+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("Chaque terme impose sa propre condition ("), latex("x>0"), texte(" et "), latex("x>3"), texte(") ; le domaine de la somme est l'intersection des deux, soit "), latex("]3;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Le domaine de "), latex("x\\mapsto\\ln(x)+\\ln(x-3)"), texte(" est "), latex("]0;+\\infty["), texte(".")],
      reponse: false,
      justification: [texte("Cela oublie la condition supplémentaire "), latex("x-3>0"), texte(" imposée par le second terme : le domaine correct est "), latex("]3;+\\infty["), texte(", pas seulement "), latex("]0;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("u(x)>0"), texte(" dérivable, la dérivée de "), latex("\\ln(u(x))"), texte(" a toujours le même signe que "), latex("u'(x)"), texte(" (car "), latex("u(x)"), texte(" reste positif).")],
      reponse: true,
      justification: [texte("Le quotient "), latex("u'(x)/u(x)"), texte(" a le signe de son numérateur "), latex("u'(x)"), texte(" puisque le dénominateur "), latex("u(x)"), texte(" reste toujours strictement positif.")],
    },
    {
      enonce: [texte("La dérivée de "), latex("\\ln(u(x))"), texte(" peut être négative même quand "), latex("u'(x)"), texte(" est positif, pour "), latex("u(x)>0"), texte(".")],
      reponse: false,
      justification: [texte("C'est impossible : puisque "), latex("u(x)>0"), texte(", le quotient "), latex("u'(x)/u(x)"), texte(" garde exactement le même signe que "), latex("u'(x)"), texte(".")],
    },
    {
      enonce: [texte("La dérivée seconde de "), latex("\\ln(x)"), texte(" est "), latex("(\\ln x)'' = -\\dfrac{1}{x^2}"), texte(", strictement négative sur "), latex("]0;+\\infty["), texte(" — "), latex("\\ln"), texte(" y est donc concave.")],
      reponse: true,
      justification: [texte("En dérivant "), latex("1/x"), texte(" une deuxième fois, on obtient "), latex("-1/x^2"), texte(", toujours strictement négatif sur le domaine : la courbe de "), latex("\\ln"), texte(" est bien concave partout.")],
    },
    {
      enonce: [texte("La formule "), latex("(\\ln x)'=1/x"), texte(" se démontre SANS aucun calcul de limite, en appliquant le théorème de dérivation d'une fonction réciproque à "), latex("\\exp"), texte(".")],
      reponse: true,
      justification: [latex("(f^{-1})'(x)=\\dfrac{1}{f'(f^{-1}(x))}"), texte(" appliqué à "), latex("f=\\exp"), texte(" donne "), latex("\\ln'(x)=\\dfrac{1}{\\exp'(\\ln x)}=\\dfrac{1}{\\exp(\\ln x)}=\\dfrac{1}{x}"), texte(" — trois résultats déjà acquis, aucune limite.")],
    },
    {
      enonce: [texte("La dérivée de "), latex("\\ln"), texte(" ne peut s'obtenir que par le calcul de la limite du taux d'accroissement.")],
      reponse: false,
      justification: [texte("Le théorème de dérivation d'une fonction réciproque, combiné à "), latex("\\exp'=\\exp"), texte(" et à "), latex("e^{\\ln x}=x"), texte(", suffit — c'est même la démonstration retenue dans ce chapitre.")],
    },
    {
      enonce: [texte("Le signe de "), latex("(\\log_a x)'=\\dfrac{1}{x\\ln(a)}"), texte(" est celui de "), latex("\\ln(a)"), texte(" : "), latex("\\log_a"), texte(" est croissante si "), latex("a>1"), texte(", décroissante si "), latex("0<a<1"), texte(".")],
      reponse: true,
      justification: [texte("Comme "), latex("x>0"), texte(" sur tout le domaine, seul le signe de "), latex("\\ln(a)"), texte(" pilote celui de la dérivée — la formule redonne ainsi, sans aucun graphique, le sens de variation lu à la section 1.")],
    },
    {
      enonce: [latex("(\\log_a x)'"), texte(" est strictement positive quelle que soit la base valide "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("Pour "), latex("0<a<1"), texte(", "), latex("\\ln(a)<0"), texte(" et la dérivée "), latex("1/(x\\ln a)"), texte(" est strictement NÉGATIVE : "), latex("\\log_a"), texte(" y est décroissante.")],
    },
    {
      enonce: [latex("(\\log_a x)''=\\dfrac{-1}{x^2\\ln(a)}"), texte(", de signe OPPOSÉ à celui de la dérivée première : la concavité est tournée vers le bas si "), latex("a>1"), texte(", vers le haut si "), latex("0<a<1"), texte(".")],
      reponse: true,
      justification: [texte("Dériver une seconde fois "), latex("\\dfrac{1}{x\\ln a}"), texte(" donne "), latex("\\dfrac{-1}{x^2\\ln a}"), texte(" ; le facteur "), latex("-1/x^2"), texte(" retourne le signe, d'où la concavité opposée au sens de variation.")],
    },
    {
      enonce: [texte("La base "), latex("e"), texte(" est une base comme une autre pour la dérivation : le facteur "), latex("1/\\ln(a)"), texte(" ne disparaît jamais.")],
      reponse: false,
      justification: [texte("Pour "), latex("a=e"), texte(", "), latex("\\ln(e)=1"), texte(" et le facteur disparaît exactement : "), latex("\\log_e'(x)=1/x"), texte(". C'est LA raison de la commodité de la base "), latex("e"), texte(" — elle est la seule dans ce cas.")],
    },
    {
      enonce: [texte("Pour "), latex("g>0"), texte(" et "), latex("h"), texte(" dérivables, "), latex("\\left((g(x))^{h(x)}\\right)' = \\left(h'(x)\\ln(g(x))+\\dfrac{h(x)g'(x)}{g(x)}\\right)\\cdot(g(x))^{h(x)}"), texte(" — formule qui contient la dérivée d'une puissance usuelle et celle d'une exponentielle comme cas particuliers.")],
      reponse: true,
      justification: [texte("Si "), latex("h"), texte(" est constante égale à "), latex("n"), texte(", il reste "), latex("n\\,g^{n-1}g'"), texte(" ; si "), latex("g"), texte(" est constante égale à "), latex("a>0"), texte(", il reste "), latex("h'\\ln(a)\\,a^{h}"), texte(" — les deux règles connues.")],
    },
    {
      enonce: [texte("Pour dériver "), latex("f(x)=x^{\\sin(x)}"), texte(" (avec "), latex("x>0"), texte("), on peut appliquer directement la règle "), latex("(x^n)'=n\\,x^{n-1}"), texte(".")],
      reponse: false,
      justification: [texte("Cette règle suppose un exposant CONSTANT. Ici l'exposant dépend de "), latex("x"), texte(" : il faut passer par "), latex("f(x)=e^{\\sin(x)\\ln(x)}"), texte(" puis dériver la composée.")],
    },
    {
      enonce: [texte("La fonction "), latex("f(x)=\\ln(x^2+1)"), texte(" est définie sur "), latex("\\mathbb{R}"), texte(" tout entier, et "), latex("f'(x)=\\dfrac{2x}{x^2+1}"), texte(".")],
      reponse: true,
      justification: [latex("x^2+1\\geq1>0"), texte(" pour tout réel, donc le domaine est bien "), latex("\\mathbb{R}"), texte(" ; la règle de la chaîne donne "), latex("u'/u"), texte(" avec "), latex("u=x^2+1"), texte(", soit "), latex("2x/(x^2+1)"), texte(".")],
    },
    {
      enonce: [latex("\\ln((e^x-1)^2)"), texte(" se simplifie en "), latex("2\\ln(e^x-1)"), texte(" sur tout son domaine.")],
      reponse: false,
      justification: [latex("e^x-1"), texte(" est NÉGATIF pour "), latex("x<0"), texte(" : la simplification correcte est "), latex("2\\ln|e^x-1|"), texte(", avec valeur absolue. Sans elle, on perdrait toute la moitié gauche du domaine "), latex("\\mathbb{R}\\setminus\\{0\\}"), texte(".")],
    },
    {
      enonce: [texte("Le domaine de "), latex("\\ln((x^2-4)^2)"), texte(" est "), latex("\\mathbb{R}\\setminus\\{-2;2\\}"), texte(", strictement PLUS LARGE que celui de "), latex("\\ln(x^2-4)"), texte(", qui vaut "), latex("]-\\infty;-2[\\,\\cup\\,]2;+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("Le carré rend l'argument positif dès que "), latex("x^2\\neq4"), texte(" : seules les deux valeurs "), latex("\\pm2"), texte(" sont exclues, alors que sans le carré tout l'intervalle "), latex("]-2;2["), texte(" l'est aussi.")],
    },
    {
      enonce: [texte("Le domaine de "), latex("\\log_a(x^2-k^2)"), texte(" (avec "), latex("k>0"), texte(") est "), latex("\\mathbb{R}"), texte(" privé de "), latex("-k"), texte(" et "), latex("k"), texte(".")],
      reponse: false,
      justification: [texte("Il faut "), latex("x^2-k^2>0"), texte(" (strictement), soit "), latex("x<-k"), texte(" ou "), latex("x>k"), texte(" : TOUT l'intervalle "), latex("]-k;k["), texte(" est exclu, pas seulement ses deux bornes.")],
    },
    {
      enonce: [texte("Le domaine de "), latex("f(x)=\\dfrac{2^x+x}{\\ln(x)}"), texte(" est "), latex("]0;+\\infty["), texte(" privé de "), latex("x=1"), texte(".")],
      reponse: true,
      justification: [texte("Le logarithme impose "), latex("x>0"), texte(", et le dénominateur impose "), latex("\\ln(x)\\neq0"), texte(", c'est-à-dire "), latex("x\\neq1"), texte(" — un point exclu facile à oublier car il est caché dans le dénominateur.")],
    },
    {
      enonce: [texte("Le domaine de "), latex("\\sqrt{1-\\log_a(u)}"), texte(" (base "), latex("a>1"), texte(") se réduit à la condition "), latex("u>0"), texte(".")],
      reponse: false,
      justification: [texte("Il faut CROISER deux conditions : "), latex("u>0"), texte(" (existence du logarithme) ET "), latex("1-\\log_a(u)\\geq0"), texte(", soit "), latex("u\\leq a"), texte(" (positivité sous la racine) — le domaine est donc "), latex("0<u\\leq a"), texte(".")],
    },
    {
      enonce: [texte("La dérivation logarithmique consiste à poser "), latex("g=\\ln|f|"), texte(", à dériver "), latex("g"), texte(", puis à conclure "), latex("f'=g'"), texte(".")],
      reponse: false,
      justification: [texte("Dériver "), latex("g=\\ln|f|"), texte(" donne "), latex("g'=f'/f"), texte(", donc "), latex("f'=f\\cdot g'"), texte(" : il ne faut jamais oublier de RE-MULTIPLIER par "), latex("f"), texte(" à la fin.")],
    },
  ],

  // ==========================================================================
  // Thème 5 — Calculer des limites (fonctions logarithmes), ref 6gen17
  // ==========================================================================
  limitesLogarithme: [
    {
      enonce: [latex("\\lim_{x\\to0^+}\\ln(x) = -\\infty"), texte(".")],
      reponse: true,
      justification: [texte("Quand "), latex("x"), texte(" s'approche de 0 par valeurs positives, "), latex("\\ln(x)"), texte(" diverge vers "), latex("-\\infty"), texte(" — c'est l'asymptote verticale caractéristique de "), latex("\\ln"), texte(" en 0.")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+}\\ln(x) = 0"), texte(".")],
      reponse: false,
      justification: [texte("Cette limite vaut "), latex("-\\infty"), texte(", pas 0 : "), latex("\\ln(0{,}0001)"), texte(" est déjà très négatif, et cela empire à mesure que "), latex("x"), texte(" se rapproche de 0.")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\ln(x) = +\\infty"), texte(".")],
      reponse: true,
      justification: [texte("Le logarithme népérien diverge bien vers "), latex("+\\infty"), texte(" en "), latex("+\\infty"), texte(", même si c'est de façon très lente.")],
    },
    {
      enonce: [latex("\\ln(x)"), texte(" possède une limite finie quand "), latex("x\\to+\\infty"), texte(".")],
      reponse: false,
      justification: [texte("Sa limite en "), latex("+\\infty"), texte(" est "), latex("+\\infty"), texte(", pas une valeur finie — "), latex("\\ln"), texte(" n'a aucune asymptote horizontale.")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x} = 0"), texte(".")],
      reponse: true,
      justification: [texte("C'est la propriété de croissance comparée : n'importe quelle puissance de "), latex("x"), texte(" finit toujours par dominer "), latex("\\ln(x)"), texte(" en "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x} = +\\infty"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("x"), texte(" domine "), latex("\\ln(x)"), texte(", donc ce quotient tend vers 0, pas vers "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty} x\\cdot\\ln(x) = +\\infty"), texte(".")],
      reponse: true,
      justification: [texte("Les deux facteurs "), latex("x"), texte(" et "), latex("\\ln(x)"), texte(" tendent tous deux vers "), latex("+\\infty"), texte(" : leur produit diverge donc vers "), latex("+\\infty"), texte(" (ce n'est même pas une forme indéterminée).")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty} x\\cdot\\ln(x) = 0"), texte(".")],
      reponse: false,
      justification: [texte("Les deux facteurs divergent vers "), latex("+\\infty"), texte(" : leur produit diverge aussi vers "), latex("+\\infty"), texte(", pas vers 0.")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+} x\\cdot\\ln(x) = 0"), texte(" (malgré la forme indéterminée "), latex("0\\times(-\\infty)"), texte(" au premier abord).")],
      reponse: true,
      justification: [texte("C'est un résultat classique de croissance comparée : le facteur "), latex("x\\to0"), texte(" « écrase » la divergence de "), latex("\\ln(x)\\to-\\infty"), texte(", et le produit tend bien vers 0.")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+} x\\cdot\\ln(x) = -\\infty"), texte(".")],
      reponse: false,
      justification: [texte("C'est une conclusion trop hâtive à partir de la forme "), latex("0\\times(-\\infty)"), texte(" : le résultat correct de cette limite est 0, pas "), latex("-\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{u\\to0}\\dfrac{\\ln(1+u)}{u} = 1"), texte(".")],
      reponse: true,
      justification: [texte("C'est la limite de référence reliant "), latex("\\ln"), texte(" à sa tangente en 1, indispensable pour lever de nombreuses formes indéterminées de ce chapitre.")],
    },
    {
      enonce: [latex("\\lim_{u\\to0}\\dfrac{\\ln(1+u)}{u} = 0"), texte(".")],
      reponse: false,
      justification: [texte("Cette limite fondamentale vaut 1, pas 0 — confondre les deux fait perdre le résultat central utilisé pour lever les formes "), latex("0/0"), texte(" impliquant "), latex("\\ln"), texte(".")],
    },
    {
      enonce: [texte("Pour tout polynôme "), latex("P"), texte(" non constant à coefficient dominant positif, "), latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{P(x)} = 0"), texte(".")],
      reponse: true,
      justification: [texte("La règle de dominance s'étend à n'importe quel polynôme non constant : le logarithme est toujours dominé, même par un polynôme de très faible degré.")],
    },
    {
      enonce: [texte("Un polynôme est toujours dominé par "), latex("\\ln(x)"), texte(" en "), latex("+\\infty"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : même le polynôme "), latex("x"), texte(" (degré 1) finit par dominer "), latex("\\ln(x)"), texte(" en "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{(\\ln(x))^2}{x} = 0"), texte(".")],
      reponse: true,
      justification: [texte("La croissance comparée s'étend à toute puissance fixe du logarithme : "), latex("(\\ln x)^k"), texte(" reste toujours dominé par "), latex("x"), texte(" en "), latex("+\\infty"), texte(", quel que soit "), latex("k"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{(\\ln(x))^2}{x} = +\\infty"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("x"), texte(" domine "), latex("(\\ln(x))^2"), texte(", donc ce quotient tend vers 0.")],
    },
    {
      enonce: [latex("\\ln"), texte(" n'a pas de limite en "), latex("-\\infty"), texte(", car elle n'est tout simplement pas définie pour "), latex("x<0"), texte(".")],
      reponse: true,
      justification: [texte("Le domaine de "), latex("\\ln"), texte(" étant "), latex("]0;+\\infty["), texte(", parler de sa limite en "), latex("-\\infty"), texte(" n'a pas de sens : elle n'est jamais évaluée sur des réels négatifs.")],
    },
    {
      enonce: [latex("\\lim_{x\\to-\\infty}\\ln(x) = 0"), texte(".")],
      reponse: false,
      justification: [texte("Cette expression n'a pas de sens : "), latex("\\ln"), texte(" n'est pas définie sur les réels négatifs, donc cette limite n'existe tout simplement pas.")],
    },
    {
      enonce: [latex("\\lim_{x\\to1}\\dfrac{\\ln(x)}{x-1} = 1"), texte(".")],
      reponse: true,
      justification: [texte("En posant "), latex("u=x-1\\to0"), texte(", cette limite est exactement la limite fondamentale "), latex("\\lim_{u\\to0}\\ln(1+u)/u=1"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to1}\\dfrac{\\ln(x)}{x-1} = 0"), texte(".")],
      reponse: false,
      justification: [texte("Par le changement de variable "), latex("u=x-1"), texte(", cette limite se ramène à la limite fondamentale, qui vaut 1, pas 0.")],
    },
    {
      enonce: [texte("Pour une base "), latex("0<a<1"), texte(" : "), latex("\\lim_{x\\to0^+}\\log_a(x)=+\\infty"), texte(" et "), latex("\\lim_{x\\to+\\infty}\\log_a(x)=-\\infty"), texte(" — l'inverse exact du cas "), latex("a>1"), texte(".")],
      reponse: true,
      justification: [latex("\\log_a"), texte(" est strictement décroissante pour "), latex("0<a<1"), texte(" : elle part de "), latex("+\\infty"), texte(" au bord gauche du domaine et plonge vers "), latex("-\\infty"), texte(" en "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+}\\log_a(x)=-\\infty"), texte(" pour TOUTE base valide "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("Ce n'est vrai que pour "), latex("a>1"), texte(" (dont "), latex("a=e"), texte("). Pour "), latex("0<a<1"), texte(", cette limite vaut "), latex("+\\infty"), texte(" — le sens des limites suit celui de la monotonie.")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x^{0{,}01}}=+\\infty"), texte(", l'exposant "), latex("0{,}01"), texte(" étant beaucoup trop petit pour dominer un logarithme.")],
      reponse: false,
      justification: [texte("Cette limite vaut 0 : la croissance comparée annonce "), latex("\\log_a(x)/x^k\\to0"), texte(" pour TOUT réel "), latex("k>0"), texte(", aussi petit soit-il — la seule condition est "), latex("k>0"), texte(", jamais une taille minimale.")],
    },
    {
      enonce: [latex("\\sqrt{x}"), texte(" reste au-dessus de "), latex("\\ln(x)"), texte(" pour tout "), latex("x>0"), texte(", tandis que "), latex("\\sqrt[3]{x}"), texte(" se laisse brièvement dépasser par "), latex("\\ln"), texte(" avant de repasser définitivement devant vers "), latex("x\\approx93"), texte(".")],
      reponse: true,
      justification: [texte("Le minimum de "), latex("\\sqrt{x}-\\ln(x)"), texte(" est atteint en "), latex("x=4"), texte(" et vaut "), latex("2-\\ln(4)\\approx0{,}61>0"), texte(" : jamais de croisement. La racine cubique, elle, croise "), latex("\\ln"), texte(" deux fois (vers "), latex("x\\approx6"), texte(" et "), latex("x\\approx93"), texte(") avant de dominer pour toujours.")],
    },
    {
      enonce: [texte("Puisque "), latex("\\sqrt[3]{x}"), texte(" se fait dépasser par "), latex("\\ln(x)"), texte(" sur un intervalle, c'est finalement "), latex("\\sqrt[3]{x}"), texte(" qui est dominée par "), latex("\\ln"), texte(" en "), latex("+\\infty"), texte(".")],
      reponse: false,
      justification: [texte("Le dépassement n'est que TEMPORAIRE (jusqu'à "), latex("x\\approx93"), texte(") : au-delà, "), latex("\\sqrt[3]{x}=x^{1/3}"), texte(" repasse devant et ne redescend plus jamais — c'est bien "), latex("\\ln"), texte(" qui est dominée.")],
    },
    {
      enonce: [texte("Le classement "), latex("a^x \\gg x^n \\gg \\log_b(x)"), texte(" (pour "), latex("a>1"), texte(", "), latex("n>0"), texte(", "), latex("b>1"), texte(") n'est valable qu'« à partir d'un certain rang » : sur une fenêtre bornée, l'ordre observé peut être tout autre — "), latex("e^x"), texte(" est par exemple dépassée par "), latex("x^3"), texte(" entre "), latex("x\\approx1{,}86"), texte(" et "), latex("x\\approx4{,}54"), texte(".")],
      reponse: true,
      justification: [texte("La dominance est une propriété ASYMPTOTIQUE. Sur "), latex("[1{,}86;4{,}54]"), texte(", "), latex("x^3"), texte(" est bel et bien au-dessus de "), latex("e^x"), texte(" ; ce n'est qu'après "), latex("x\\approx4{,}54"), texte(" (où "), latex("e^x\\approx x^3\\approx93"), texte(") que l'exponentielle prend l'avantage définitivement.")],
    },
    {
      enonce: [texte("Pour une base "), latex("a>0, a\\neq1"), texte(" quelconque, "), latex("\\lim_{u\\to0}\\dfrac{\\log_a(1+u)}{u}=\\dfrac{1}{\\ln(a)}"), texte(".")],
      reponse: true,
      justification: [texte("Cette limite est le nombre dérivé de "), latex("\\log_a"), texte(" en 1, c'est-à-dire "), latex("\\log_a'(1)=\\dfrac{1}{1\\cdot\\ln(a)}"), texte(" — elle ne vaut exactement 1 que si "), latex("\\ln(a)=1"), texte(", donc uniquement pour "), latex("a=e"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{u\\to0}\\dfrac{\\log_2(1+u)}{u}=1"), texte(".")],
      reponse: false,
      justification: [texte("Elle vaut "), latex("1/\\ln(2)\\approx1{,}44"), texte(". Seule la base "), latex("e"), texte(" donne exactement 1 — c'est précisément ce qui rend cette base si commode.")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{a x^d+c+\\log_{b_1}(x)}{a x^d+c+\\log_{b_2}(x)}=1"), texte(", quelles que soient les bases "), latex("b_1\\neq b_2"), texte(" (avec "), latex("a\\neq0"), texte(", "), latex("d>0"), texte(").")],
      reponse: true,
      justification: [texte("Le MÊME polynôme domine des deux côtés, et les deux logarithmes lui sont négligeables : le quotient tend vers celui des termes dominants, "), latex("ax^d/(ax^d)=1"), texte(". Les bases n'ont ici aucune importance.")],
    },
    {
      enonce: [latex("\\lim_{x\\to-\\infty}\\dfrac{3^x}{2x^2}=-\\infty"), texte(".")],
      reponse: false,
      justification: [texte("En "), latex("-\\infty"), texte(", "), latex("3^x\\to0^+"), texte(" (base "), latex(">1"), texte(") tandis que "), latex("2x^2\\to+\\infty"), texte(" : le quotient tend vers 0, pas vers "), latex("-\\infty"), texte(". Attention à ne pas transposer aveuglément le comportement observé en "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{x}{\\ln(x)}=+\\infty"), texte(".")],
      reponse: true,
      justification: [texte("C'est l'inverse de "), latex("\\ln(x)/x\\to0^+"), texte(" : "), latex("x"), texte(" domine "), latex("\\ln(x)"), texte(" en "), latex("+\\infty"), texte(", donc le quotient diverge vers "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to0}\\dfrac{2^x-2+\\sin(x)}{\\ln(1+4x^2)}=-\\infty"), texte(" : malgré son apparence, ce n'est PAS une forme indéterminée "), latex("0/0"), texte(".")],
      reponse: true,
      justification: [texte("Le numérateur tend vers "), latex("2^0-2+0=-1"), texte(", non nul, tandis que le dénominateur tend vers "), latex("\\ln(1)=0"), texte(" par valeurs strictement positives : le quotient diverge vers "), latex("-\\infty"), texte(", sans aucune indétermination à lever.")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{p_1 x^2\\ln(x)}{p_2 x^2\\log_5(x)}=1"), texte(" pour tous "), latex("p_1,p_2"), texte(" non nuls.")],
      reponse: false,
      justification: [texte("En réécrivant "), latex("\\log_5(x)=\\ln(x)/\\ln(5)"), texte(", les "), latex("x^2"), texte(" ET les "), latex("\\ln(x)"), texte(" se simplifient exactement : il reste la CONSTANTE "), latex("p_1\\ln(5)/p_2"), texte(", jamais 1 (sauf coïncidence impossible pour des entiers, "), latex("\\ln(5)\\approx1{,}61"), texte(").")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\left(x-\\ln(x)\\right)=+\\infty"), texte(".")],
      reponse: true,
      justification: [texte("Forme "), latex("\\infty-\\infty"), texte(" levée par croissance comparée : "), latex("x-\\ln(x)=x\\left(1-\\dfrac{\\ln(x)}{x}\\right)"), texte(" et la parenthèse tend vers 1.")],
    },
    {
      enonce: [texte("Si le numérateur ET le dénominateur d'un quotient tendent tous deux vers 0, alors la limite du quotient vaut 0.")],
      reponse: false,
      justification: [latex("0/0"), texte(" est une forme INDÉTERMINÉE : elle peut valoir n'importe quoi. Ce chapitre en donne le contre-exemple central, "), latex("\\ln(1+u)/u\\to1"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 6 — Déterminer des paramètres depuis des conditions graphiques, ref 6gen18
  // ==========================================================================
  parametresGraphiques: [
    {
      enonce: [texte("Connaître un point "), latex("(x_0;y_0)"), texte(" du graphique de "), latex("f"), texte(" donne l'équation "), latex("f(x_0)=y_0"), texte(", une relation parmi les paramètres inconnus.")],
      reponse: true,
      justification: [texte("Un point connu du graphique traduit exactement l'égalité entre la valeur de la fonction en "), latex("x_0"), texte(" et l'ordonnée "), latex("y_0"), texte(" — c'est le principe de base pour poser une équation sur les paramètres.")],
    },
    {
      enonce: [texte("Un seul point connu du graphique suffit toujours, à lui seul, à déterminer tous les paramètres inconnus d'une fonction qui en compte plusieurs.")],
      reponse: false,
      justification: [texte("Un seul point ne fournit qu'UNE seule équation : il faut autant de conditions indépendantes que de paramètres inconnus pour tous les déterminer.")],
    },
    {
      enonce: [texte("Une asymptote horizontale connue "), latex("y=c"), texte(" donne une information sur "), latex("\\lim_{x\\to\\pm\\infty}f(x)"), texte(", pas sur une valeur précise "), latex("f(x_0)"), texte(".")],
      reponse: true,
      justification: [texte("Une asymptote horizontale décrit un COMPORTEMENT à l'infini (une limite), fondamentalement différent d'un point précis du graphique.")],
    },
    {
      enonce: [texte("Une asymptote horizontale donne le même type d'information qu'un point du graphique : une valeur exacte en un "), latex("x_0"), texte(" donné.")],
      reponse: false,
      justification: [texte("Ce sont deux types d'information différents : une asymptote décrit une limite (comportement à l'infini), jamais une valeur exacte atteinte en un point précis.")],
    },
    {
      enonce: [texte("Une tangente connue au point d'abscisse "), latex("x_0"), texte(" donne deux conditions simultanées : la valeur "), latex("f(x_0)"), texte(" ET la pente "), latex("f'(x_0)"), texte(".")],
      reponse: true,
      justification: [texte("La tangente en un point est déterminée à la fois par le point de contact (donc "), latex("f(x_0)"), texte(") et par sa pente (donc "), latex("f'(x_0)"), texte(") : connaître la tangente fournit ainsi deux équations, pas une seule.")],
    },
    {
      enonce: [texte("Une tangente connue au point d'abscisse "), latex("x_0"), texte(" ne donne d'information que sur la pente "), latex("f'(x_0)"), texte(", jamais sur la valeur "), latex("f(x_0)"), texte(".")],
      reponse: false,
      justification: [texte("C'est incomplet : la tangente passe aussi par le point "), latex("(x_0;f(x_0))"), texte(", ce qui fixe également la valeur de "), latex("f(x_0)"), texte(", en plus de sa pente.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(" avec "), latex("b\\neq0"), texte(", le graphique possède une asymptote verticale en "), latex("x=0"), texte(", quelles que soient les valeurs de "), latex("a"), texte(" et "), latex("b"), texte(".")],
      reponse: true,
      justification: [texte("Le terme "), latex("b\\ln(x)"), texte(" diverge en "), latex("0^+"), texte(" dès que "), latex("b\\neq0"), texte(", ajouter la constante "), latex("a"), texte(" ne change rien à l'existence de cette asymptote verticale.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", l'existence de l'asymptote verticale en "), latex("x=0"), texte(" dépend de la valeur de "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("L'asymptote verticale en "), latex("x=0"), texte(" vient uniquement du terme "), latex("\\ln(x)"), texte(" (pourvu que "), latex("b\\neq0"), texte(") : la constante additive "), latex("a"), texte(" ne modifie ni sa position, ni son existence.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", puisque "), latex("\\ln(1)=0"), texte(", le point "), latex("(1;a)"), texte(" appartient toujours au graphique, quelle que soit la valeur de "), latex("b"), texte(".")],
      reponse: true,
      justification: [texte("En "), latex("x=1"), texte(", "), latex("\\ln(1)=0"), texte(" annule systématiquement le terme en "), latex("b"), texte(" : il reste "), latex("f(1)=a"), texte(", indépendamment de "), latex("b"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", le graphique ne passe jamais par un point d'abscisse "), latex("x=1"), texte(" et d'ordonnée "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("f(1)=a+b\\ln(1)=a"), texte(" toujours, donc le point "), latex("(1;a)"), texte(" appartient bien systématiquement au graphique.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", "), latex("f'(x)=\\dfrac{b}{x}"), texte(", donc la pente de la tangente en "), latex("x=1"), texte(" vaut directement "), latex("b"), texte(".")],
      reponse: true,
      justification: [texte("En dérivant, "), latex("f'(x)=b/x"), texte(", et "), latex("f'(1)=b/1=b"), texte(" : lire la pente de la tangente en "), latex("x=1"), texte(" donne donc directement le paramètre "), latex("b"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", la pente de la tangente en "), latex("x=1"), texte(" vaut "), latex("a"), texte(", pas "), latex("b"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("f'(1)=b"), texte(" (la pente donne "), latex("b"), texte("), tandis que "), latex("f(1)=a"), texte(" (la valeur donne "), latex("a"), texte(") — les deux paramètres se lisent séparément.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", si le graphique passe par "), latex("(e;k)"), texte(", alors "), latex("a+b=k"), texte(" (car "), latex("\\ln(e)=1"), texte(").")],
      reponse: true,
      justification: [texte("En substituant "), latex("x=e"), texte(" : "), latex("f(e)=a+b\\ln(e)=a+b\\cdot1=a+b"), texte(", qui doit valoir "), latex("k"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", si le graphique passe par "), latex("(e;k)"), texte(", alors "), latex("a=k"), texte(", quelle que soit la valeur de "), latex("b"), texte(".")],
      reponse: false,
      justification: [texte("Cela confond "), latex("x=1"), texte(" (où "), latex("\\ln(1)=0"), texte(" annule le terme en "), latex("b"), texte(") avec "), latex("x=e"), texte(" (où "), latex("\\ln(e)=1"), texte(", donc "), latex("b"), texte(" intervient bel et bien) : ici c'est "), latex("a+b=k"), texte(", pas "), latex("a=k"), texte(".")],
    },
    {
      enonce: [texte("Deux conditions indépendantes (par exemple deux points distincts, ou un point et une pente) suffisent généralement à déterminer deux paramètres inconnus "), latex("a"), texte(" et "), latex("b"), texte(".")],
      reponse: true,
      justification: [texte("Deux paramètres inconnus nécessitent en général deux équations indépendantes pour être entièrement déterminés — c'est le principe d'un système de deux équations à deux inconnues.")],
    },
    {
      enonce: [texte("Une seule condition (un seul point connu du graphique) suffit toujours à déterminer deux paramètres inconnus "), latex("a"), texte(" et "), latex("b"), texte(".")],
      reponse: false,
      justification: [texte("Une seule équation ne peut en général pas fixer deux inconnues indépendantes : il manque une seconde condition (un autre point, une pente, une asymptote...).")],
    },
    {
      enonce: [texte("Pour "), latex("g(x)=\\ln(x-k)"), texte(", l'asymptote verticale se situe en "), latex("x=k"), texte(", ce qui permet de lire "), latex("k"), texte(" directement sur un graphique.")],
      reponse: true,
      justification: [texte("L'argument "), latex("x-k"), texte(" s'annule exactement en "), latex("x=k"), texte(", provoquant la divergence de "), latex("\\ln"), texte(" à cet endroit : c'est la position de l'asymptote verticale.")],
    },
    {
      enonce: [texte("Pour "), latex("g(x)=\\ln(x-k)"), texte(", l'asymptote verticale se situe en "), latex("x=-k"), texte(".")],
      reponse: false,
      justification: [texte("L'argument "), latex("x-k"), texte(" s'annule en "), latex("x=k"), texte(", pas "), latex("x=-k"), texte(" — erreur de signe classique.")],
    },
    {
      enonce: [texte("Déterminer un paramètre depuis une condition graphique doit toujours être vérifié par cohérence interne : reporter la valeur trouvée dans la condition de départ pour s'assurer qu'elle est bien reproduite.")],
      reponse: true,
      justification: [texte("C'est une bonne pratique systématique : une erreur de calcul lors de la résolution du système peut passer inaperçue sans cette vérification finale.")],
    },
    {
      enonce: [texte("Une fois les paramètres calculés à partir de conditions graphiques, aucune vérification par rapport aux données graphiques de départ n'est nécessaire.")],
      reponse: false,
      justification: [texte("C'est l'inverse : reporter les valeurs trouvées dans les conditions initiales permet de détecter une éventuelle erreur de calcul avant de conclure.")],
    },
    {
      enonce: [texte("Si le graphique de "), latex("f(x)=a+b\\ln(x)"), texte(" passe par "), latex("(1;-2)"), texte(", alors "), latex("a=-2"), texte(".")],
      reponse: true,
      justification: [latex("f(1)=a+b\\ln(1)=a"), texte(" : l'ordonnée du point d'abscisse 1 donne directement "), latex("a"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", la pente de la tangente au point d'abscisse "), latex("e"), texte(" vaut "), latex("b"), texte(".")],
      reponse: false,
      justification: [latex("f'(e)=\\dfrac{b}{e}"), texte(", pas "), latex("b"), texte(" : seule la pente en "), latex("x=1"), texte(" donne directement "), latex("b"), texte(".")],
    },
    {
      enonce: [texte("Si la tangente en "), latex("x=1"), texte(" au graphique de "), latex("f(x)=a+b\\ln(x)"), texte(" a pour pente "), latex("-3"), texte(", alors "), latex("b=-3"), texte(".")],
      reponse: true,
      justification: [latex("f'(x)=\\dfrac{b}{x}"), texte(" donc "), latex("f'(1)=b"), texte(" : la pente de la tangente en 1 donne directement "), latex("b"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", la tangente au point d'abscisse 1 a pour équation "), latex("y=a+b(x-1)"), texte(".")],
      reponse: true,
      justification: [texte("Elle passe par "), latex("(1;f(1))=(1;a)"), texte(" et a pour pente "), latex("f'(1)=b"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(" avec "), latex("b>0"), texte(", la fonction "), latex("f"), texte(" est strictement croissante sur "), latex("]0;+\\infty["), texte(".")],
      reponse: true,
      justification: [latex("f'(x)=\\dfrac{b}{x}"), texte(" est strictement positive sur tout le domaine lorsque "), latex("b>0"), texte(".")],
    },
    {
      enonce: [texte("Si le graphique de "), latex("f(x)=a+b\\ln(x)"), texte(" passe par "), latex("(1;3)"), texte(", alors "), latex("b=3"), texte(".")],
      reponse: false,
      justification: [texte("En "), latex("x=1"), texte(", "), latex("\\ln(1)=0"), texte(" annule le terme en "), latex("b"), texte(" : ce point donne "), latex("a=3"), texte(", et "), latex("b"), texte(" reste inconnu.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(" avec "), latex("b<0"), texte(", "), latex("\\lim_{x\\to0^+}f(x)=+\\infty"), texte(".")],
      reponse: true,
      justification: [latex("\\ln(x)\\to-\\infty"), texte(" en "), latex("0^+"), texte(" ; multiplié par "), latex("b<0"), texte(", le terme "), latex("b\\ln(x)"), texte(" tend vers "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(" avec "), latex("b\\neq0"), texte(", le graphique admet l'asymptote horizontale "), latex("y=a"), texte(".")],
      reponse: false,
      justification: [latex("b\\ln(x)"), texte(" tend vers "), latex("\\pm\\infty"), texte(" en "), latex("+\\infty"), texte(" : aucune asymptote horizontale. La seule asymptote est verticale, "), latex("x=0"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(" avec "), latex("b\\neq0"), texte(", le graphique coupe l'axe des abscisses en "), latex("x=e^{-a/b}"), texte(".")],
      reponse: true,
      justification: [latex("a+b\\ln(x)=0"), texte(" donne "), latex("\\ln(x)=-\\dfrac{a}{b}"), texte(", soit "), latex("x=e^{-a/b}"), texte(".")],
    },
    {
      enonce: [texte("Le graphique de "), latex("f(x)=a+b\\ln(x)"), texte(" passe par le point "), latex("(0;a)"), texte(".")],
      reponse: false,
      justification: [latex("0"), texte(" n'appartient pas au domaine "), latex("]0;+\\infty["), texte(". C'est le point "), latex("(1;a)"), texte(" qui appartient toujours au graphique.")],
    },
    {
      enonce: [texte("Si le graphique de "), latex("f(x)=a+b\\ln(x)"), texte(" passe par "), latex("(1;4)"), texte(" et par "), latex("(e;7)"), texte(", alors "), latex("b=3"), texte(".")],
      reponse: true,
      justification: [latex("f(1)=a=4"), texte(" et "), latex("f(e)=a+b=7"), texte(", donc "), latex("b=7-4=3"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", la pente de la tangente au point d'abscisse 2 vaut "), latex("\\dfrac{b}{2}"), texte(".")],
      reponse: true,
      justification: [latex("f'(x)=\\dfrac{b}{x}"), texte(", donc "), latex("f'(2)=\\dfrac{b}{2}"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", "), latex("f(e^2)=a+2"), texte(".")],
      reponse: false,
      justification: [latex("\\ln(e^2)=2"), texte(", donc "), latex("f(e^2)=a+2b"), texte(" : le facteur "), latex("b"), texte(" ne disparaît pas.")],
    },
    {
      enonce: [texte("Un extremum local de "), latex("f(x)=\\ln(u(x))"), texte(" se produit là où "), latex("f'(x)=\\dfrac{u'(x)}{u(x)}"), texte(" s'annule, c'est-à-dire là où "), latex("u(x)=0"), texte(".")],
      reponse: false,
      justification: [texte("Un quotient s'annule quand son NUMÉRATEUR s'annule, donc là où "), latex("u'(x)=0"), texte(". Un point où "), latex("u(x)=0"), texte(" est au contraire EXCLU du domaine (le logarithme n'y est même pas défini) : c'est une asymptote verticale, jamais un extremum.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=a+b\\ln(x)"), texte(", lire l'ordonnée du point d'abscisse "), latex("x=e"), texte(" donne directement "), latex("b"), texte(".")],
      reponse: false,
      justification: [latex("f(e)=a+b\\ln(e)=a+b"), texte(" : cette lecture donne la SOMME "), latex("a+b"), texte(", pas "), latex("b"), texte(" seul. C'est la pente de la tangente en "), latex("x=1"), texte(" qui donne directement "), latex("b"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 7 — Sinus et cosinus hyperboliques (sh, ch), ref 6gen19
  // ==========================================================================
  sinusCosinusHyperboliques: [
    {
      enonce: [latex(`${CH}(x) = \\dfrac{e^x+e^{-x}}{2}`), texte(", pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même du cosinus hyperbolique, à partir des deux exponentielles "), latex("e^x"), texte(" et "), latex("e^{-x}"), texte(".")],
    },
    {
      enonce: [latex(`${SH}(x) = \\dfrac{e^x+e^{-x}}{2}`), texte(", pour tout réel "), latex("x"), texte(".")],
      reponse: false,
      justification: [texte("Cette formule est celle de "), latex(`${CH}(x)`), texte(", pas de "), latex(`${SH}(x)`), texte(" — le sinus hyperbolique utilise une SOUSTRACTION, "), latex(`${SH}(x)=(e^x-e^{-x})/2`), texte(".")],
    },
    {
      enonce: [latex(`${SH}(x) = \\dfrac{e^x-e^{-x}}{2}`), texte(", pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même du sinus hyperbolique, à partir des mêmes deux exponentielles mais avec une différence.")],
    },
    {
      enonce: [latex(`${CH}`), texte(" est une fonction paire : "), latex(`${CH}(-x)=${CH}(x)`), texte(" pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Vérifié numériquement (ex. en "), latex("x=1{,}3"), texte(") : échanger "), latex("e^x"), texte(" et "), latex("e^{-x}"), texte(" dans la somme qui définit "), latex(`${CH}`), texte(" ne change pas le résultat.")],
    },
    {
      enonce: [latex(`${CH}`), texte(" est une fonction impaire.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex(`${CH}`), texte(" est PAIRE ("), latex(`${CH}(-x)=${CH}(x)`), texte("), pas impaire.")],
    },
    {
      enonce: [latex(`${SH}`), texte(" est une fonction impaire : "), latex(`${SH}(-x)=-${SH}(x)`), texte(" pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Vérifié numériquement (ex. en "), latex("x=1{,}3"), texte(") : échanger "), latex("e^x"), texte(" et "), latex("e^{-x}"), texte(" dans la DIFFÉRENCE qui définit "), latex(`${SH}`), texte(" inverse son signe.")],
    },
    {
      enonce: [latex(`${SH}`), texte(" est une fonction paire.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex(`${SH}`), texte(" est IMPAIRE ("), latex(`${SH}(-x)=-${SH}(x)`), texte("), pas paire.")],
    },
    {
      enonce: [latex(`${CH}^2(x) - ${SH}^2(x) = 1`), texte(", pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Vérifié numériquement (ex. en "), latex("x=1{,}3"), texte(", "), latex(`${CH}^2-${SH}^2\\approx1`), texte(") : c'est l'identité hyperbolique fondamentale, analogue à "), latex("\\cos^2+\\sin^2=1"), texte(" en trigonométrie circulaire, mais avec un signe moins.")],
    },
    {
      enonce: [latex(`${CH}^2(x) + ${SH}^2(x) = 1`), texte(", pour tout réel "), latex("x"), texte(".")],
      reponse: false,
      justification: [texte("C'est une confusion avec l'identité trigonométrique circulaire "), latex("\\cos^2+\\sin^2=1"), texte(". L'identité hyperbolique correcte utilise un signe MOINS : "), latex(`${CH}^2-${SH}^2=1`), texte(".")],
    },
    {
      enonce: [latex(`${CH}(x)\\geq1`), texte(" pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Vérifié numériquement (minimum atteint en "), latex("x=0"), texte(", où "), latex(`${CH}(0)=1`), texte(") : "), latex(`${CH}`), texte(" ne descend jamais en dessous de 1, quel que soit "), latex("x"), texte(".")],
    },
    {
      enonce: [latex(`${CH}(x)`), texte(" peut prendre des valeurs négatives pour certains réels "), latex("x"), texte(".")],
      reponse: false,
      justification: [texte("C'est faux : "), latex(`${CH}(x)\\geq1`), texte(" toujours, donc "), latex(`${CH}`), texte(" ne devient jamais négative (ni même inférieure à 1).")],
    },
    {
      enonce: [latex(`${CH}(0) = 1`), texte(".")],
      reponse: true,
      justification: [texte("Calcul direct : "), latex(`${CH}(0)=(e^0+e^0)/2=(1+1)/2=1`), texte(".")],
    },
    {
      enonce: [latex(`${SH}(0) = 1`), texte(".")],
      reponse: false,
      justification: [texte("Calcul direct : "), latex(`${SH}(0)=(e^0-e^0)/2=(1-1)/2=0`), texte(", pas 1 — c'est "), latex(`${CH}(0)`), texte(" qui vaut 1.")],
    },
    {
      enonce: [latex(`${SH}(0) = 0`), texte(".")],
      reponse: true,
      justification: [texte("Calcul direct : "), latex(`${SH}(0)=(e^0-e^0)/2=0`), texte(".")],
    },
    {
      enonce: [texte("La dérivée de "), latex(`${SH}`), texte(" est "), latex(`${CH}`), texte(" : "), latex(`${SH}'(x)=${CH}(x)`), texte(" pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Vérifié numériquement par différences finies (ex. en "), latex("x=1{,}3"), texte(") : dériver terme à terme "), latex("(e^x-e^{-x})/2"), texte(" redonne exactement "), latex(`(e^x+e^{-x})/2=${CH}(x)`), texte(".")],
    },
    {
      enonce: [texte("La dérivée de "), latex(`${SH}`), texte(" est "), latex(`${SH}`), texte(" elle-même : "), latex(`${SH}'(x)=${SH}(x)`), texte(".")],
      reponse: false,
      justification: [texte("C'est faux : "), latex(`${SH}'(x)=${CH}(x)`), texte(", pas "), latex(`${SH}(x)`), texte(" — cette confusion viendrait d'une analogie erronée avec "), latex("(e^x)'=e^x"), texte(".")],
    },
    {
      enonce: [texte("La dérivée de "), latex(`${CH}`), texte(" est "), latex(`${SH}`), texte(" : "), latex(`${CH}'(x)=${SH}(x)`), texte(" pour tout réel "), latex("x"), texte(".")],
      reponse: true,
      justification: [texte("Vérifié numériquement par différences finies (ex. en "), latex("x=1{,}3"), texte(") : dériver terme à terme "), latex("(e^x+e^{-x})/2"), texte(" redonne "), latex(`(e^x-e^{-x})/2=${SH}(x)`), texte(".")],
    },
    {
      enonce: [texte("La dérivée de "), latex(`${CH}`), texte(" est "), latex(`${CH}`), texte(" elle-même : "), latex(`${CH}'(x)=${CH}(x)`), texte(".")],
      reponse: false,
      justification: [texte("C'est faux : "), latex(`${CH}'(x)=${SH}(x)`), texte(", pas "), latex(`${CH}(x)`), texte(" — les rôles de "), latex(`${SH}`), texte(" et "), latex(`${CH}`), texte(" s'échangent par dérivation, ils ne se reproduisent pas chacun eux-mêmes.")],
    },
    {
      enonce: [latex(`${SH}`), texte(" est strictement croissante sur "), latex("\\mathbb{R}"), texte(" tout entier, car "), latex(`${SH}'(x)=${CH}(x)`), texte(" est toujours strictement positive (au moins égale à 1).")],
      reponse: true,
      justification: [texte("Puisque "), latex(`${CH}(x)\\geq1>0`), texte(" pour tout "), latex("x"), texte(", la dérivée de "), latex(`${SH}`), texte(" ne s'annule ni ne change de signe : "), latex(`${SH}`), texte(" est donc strictement croissante sur tout "), latex("\\mathbb{R}"), texte(".")],
    },
    {
      enonce: [latex(`${CH}`), texte(" est strictement croissante sur "), latex("\\mathbb{R}"), texte(" tout entier.")],
      reponse: false,
      justification: [texte("C'est faux : "), latex(`${CH}'(x)=${SH}(x)`), texte(", négative pour "), latex("x<0"), texte(" et positive pour "), latex("x>0"), texte(" — "), latex(`${CH}`), texte(" décroît d'abord, puis croît, avec un minimum en "), latex("x=0"), texte(".")],
    },
    {
      enonce: [latex(`${SH}(x)^2`), texte(" est une fonction PAIRE, bien que "), latex(SH), texte(" soit impaire.")],
      reponse: true,
      justification: [texte("Le carré d'une fonction impaire est toujours pair : "), latex(`${SH}(-x)^2=(-${SH}(x))^2=${SH}(x)^2`), texte(" — piège classique de ce chapitre.")],
    },
    {
      enonce: [latex(`${CH}(x)^2`), texte(" est une fonction impaire.")],
      reponse: false,
      justification: [latex(CH), texte(" étant paire, son carré l'est aussi (paire × paire = paire) : "), latex(`${CH}(-x)^2=${CH}(x)^2`), texte(".")],
    },
    {
      enonce: [latex(`${SH}(x)+${CH}(x) = e^x`), texte(", une fonction qui n'est NI paire NI impaire.")],
      reponse: true,
      justification: [texte("En additionnant les deux définitions, "), latex(`\\dfrac{e^x-e^{-x}}{2}+\\dfrac{e^x+e^{-x}}{2}=\\dfrac{2e^x}{2}=e^x`), texte(" ; l'exponentielle ne possède aucune symétrie, ni paire ni impaire.")],
    },
    {
      enonce: [texte("Le produit "), latex(`${SH}(x)\\cdot${CH}(x)`), texte(" est une fonction impaire.")],
      reponse: true,
      justification: [texte("Impaire × paire = impaire : "), latex(`${SH}(-x)${CH}(-x)=(-${SH}(x))\\cdot${CH}(x)=-${SH}(x)${CH}(x)`), texte(".")],
    },
    {
      enonce: [latex(CH), texte(" et "), latex(SH), texte(", comme "), latex("\\cos"), texte(" et "), latex("\\sin"), texte(", prennent toutes leurs valeurs entre "), latex("-1"), texte(" et "), latex("1"), texte(".")],
      reponse: false,
      justification: [texte("Malgré leur nom, ces fonctions n'ont rien à voir avec des angles : "), latex(`${CH}(x)\\geq1`), texte(" pour tout "), latex("x"), texte(", et "), latex(SH), texte(" parcourt "), latex("\\mathbb{R}"), texte(" tout entier — aucune des deux n'est bornée.")],
    },
    {
      enonce: [texte("Si "), latex(`${SH}(x_0)=-2`), texte(", alors "), latex(`${CH}(x_0)=\\sqrt{5}`), texte(" — une valeur UNIQUE, positive, même si "), latex(`${SH}(x_0)`), texte(" est négatif.")],
      reponse: true,
      justification: [texte("L'identité "), latex(`${CH}^2-${SH}^2=1`), texte(" donne "), latex(`${CH}(x_0)=\\sqrt{1+(-2)^2}=\\sqrt{5}\\approx2{,}236`), texte(" ; le signe "), latex("+"), texte(" s'impose puisque "), latex(CH), texte(" est toujours "), latex("\\geq1"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex(`${SH}(x_0)=k`), texte(", alors "), latex(`${CH}(x_0)=\\pm\\sqrt{1+k^2}`), texte(" : deux valeurs sont possibles.")],
      reponse: false,
      justification: [latex(`${CH}(x)\\geq1>0`), texte(" pour tout réel : une SEULE valeur convient, la racine positive "), latex("\\sqrt{1+k^2}"), texte(" — jamais d'ambiguïté de signe dans ce sens.")],
    },
    {
      enonce: [texte("Si "), latex(`${CH}(x_0)=3`), texte(" sans que le signe de "), latex("x_0"), texte(" soit précisé, alors "), latex(`${SH}(x_0)=\\pm2\\sqrt{2}`), texte(" : DEUX valeurs sont possibles.")],
      reponse: true,
      justification: [latex(`${SH}^2=${CH}^2-1=9-1=8`), texte(", donc "), latex(`${SH}(x_0)=\\pm\\sqrt{8}=\\pm2\\sqrt{2}\\approx\\pm2{,}83`), texte(" ; "), latex(SH), texte(" étant impaire, le signe suit celui de "), latex("x_0"), texte(", inconnu ici — les deux valeurs sont donc à donner.")],
    },
    {
      enonce: [texte("Si "), latex(`${CH}(x_0)=k`), texte(", alors "), latex(`${SH}(x_0)=\\sqrt{1+k^2}`), texte(".")],
      reponse: false,
      justification: [texte("L'identité fondamentale donne "), latex(`${SH}^2=${CH}^2-1`), texte(", donc "), latex(`${SH}(x_0)=\\pm\\sqrt{k^2-1}`), texte(" — le radicande est "), latex("k^2-1"), texte(", jamais "), latex("1+k^2"), texte(" (qui est celui du sens inverse).")],
    },
    {
      enonce: [texte("Pour que "), latex(`${SH}(x_0)=\\pm\\sqrt{k^2-1}`), texte(" ait un sens à partir de "), latex(`${CH}(x_0)=k`), texte(", il suffit que "), latex("k>0"), texte(".")],
      reponse: false,
      justification: [texte("Il faut "), latex("k\\geq1"), texte(", sinon le radicande "), latex("k^2-1"), texte(" serait négatif — ce qui est de toute façon automatique, puisque "), latex(`${CH}(x)\\geq1`), texte(" pour tout réel : aucun "), latex("x_0"), texte(" ne donne "), latex(`${CH}(x_0)<1`), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex(`f(x)=a\\,${SH}(kx)+b\\,${CH}(kx)`), texte(", "), latex(`f'(x)=k\\left(a\\,${CH}(kx)+b\\,${SH}(kx)\\right)`), texte(".")],
      reponse: true,
      justification: [texte("Chaque terme échange son rôle par dérivation ("), latex(`${SH}'=${CH}`), texte(", "), latex(`${CH}'=${SH}`), texte("), et la règle de la chaîne fait sortir le facteur "), latex("k"), texte(" de la composition "), latex("kx"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex(`f(x)=a\\,${SH}(kx)+b\\,${CH}(kx)`), texte(", "), latex(`f'(x)=a\\,${CH}(kx)+b\\,${SH}(kx)`), texte(" — le facteur "), latex("k"), texte(" n'intervient pas.")],
      reponse: false,
      justification: [texte("La règle de la chaîne impose de multiplier par la dérivée de l'argument "), latex("kx"), texte(", c'est-à-dire par "), latex("k"), texte(" : "), latex(`f'(x)=k(a\\,${CH}(kx)+b\\,${SH}(kx))`), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex(`f(x)=a\\,${SH}(kx)+b\\,${CH}(kx)`), texte(", "), latex("f''(x)=k^2 f(x)"), texte(" : la fonction est proportionnelle à sa propre dérivée seconde.")],
      reponse: true,
      justification: [texte("Dériver deux fois ramène chaque terme à lui-même en multipliant par "), latex("k"), texte(" à chaque étape : "), latex(`f''(x)=k^2(a\\,${SH}(kx)+b\\,${CH}(kx))=k^2 f(x)`), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex(`f(x)=a\\,${SH}(x)+b\\,${CH}(x)`), texte(", le signe de la limite en "), latex("+\\infty"), texte(" est celui de "), latex("b-a"), texte(".")],
      reponse: false,
      justification: [texte("En réécrivant "), latex("f(x)=\\dfrac{(a+b)e^x+(b-a)e^{-x}}{2}"), texte(", c'est le terme en "), latex("e^x"), texte(" qui domine en "), latex("+\\infty"), texte(" : le signe est celui de "), latex("a+b"), texte(". C'est en "), latex("-\\infty"), texte(" que "), latex("b-a"), texte(" commande.")],
    },
    {
      enonce: [texte("Pour "), latex(`f(x)=2\\,${SH}(x)+3\\,${CH}(x)`), texte(", "), latex("\\lim_{x\\to-\\infty}f(x)=-\\infty"), texte(".")],
      reponse: false,
      justification: [texte("Ici "), latex("f(x)=\\dfrac{5e^x+e^{-x}}{2}"), texte(" : en "), latex("-\\infty"), texte(", c'est le terme "), latex("e^{-x}"), texte(" qui domine, avec le coefficient "), latex("b-a=1>0"), texte(" — la limite vaut donc "), latex("+\\infty"), texte(", pas "), latex("-\\infty"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 8 — Graphique de la fonction dérivée (fonctions logarithmes), ref 6gen20
  // ==========================================================================
  graphiqueDeriveeLogarithme: [
    {
      enonce: [texte("Si "), latex("f'(x)\\geq0"), texte(" sur un intervalle, alors "), latex("f"), texte(" est croissante sur cet intervalle.")],
      reponse: true,
      justification: [texte("C'est le lien fondamental entre le signe de la dérivée et le sens de variation de la fonction.")],
    },
    {
      enonce: [texte("Si "), latex("f'(x)\\geq0"), texte(" sur un intervalle, alors "), latex("f"), texte(" est décroissante sur cet intervalle.")],
      reponse: false,
      justification: [texte("Une dérivée positive ou nulle signifie que "), latex("f"), texte(" est croissante, pas décroissante.")],
    },
    {
      enonce: [texte("Un changement de signe de "), latex("f'"), texte(" correspond à un extremum de "), latex("f"), texte(".")],
      reponse: true,
      justification: [texte("Quand la dérivée change de signe, la fonction cesse de croître pour décroître (ou l'inverse) : c'est exactement la définition d'un extremum.")],
    },
    {
      enonce: [texte("Un signe constant de "), latex("f'"), texte(" sur tout un intervalle garantit que "), latex("f"), texte(" possède un extremum quelque part sur cet intervalle.")],
      reponse: false,
      justification: [texte("C'est l'inverse : un signe CONSTANT de "), latex("f'"), texte(" signifie que "), latex("f"), texte(" ne change jamais de sens de variation, donc n'a AUCUN extremum sur cet intervalle.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\ln(x)"), texte(" (domaine "), latex("]0;+\\infty["), texte("), "), latex("f'(x)=1/x"), texte(" est strictement positive partout sur le domaine, donc "), latex("f"), texte(" est strictement croissante sur tout son domaine et n'a aucun extremum.")],
      reponse: true,
      justification: [texte("Puisque "), latex("1/x>0"), texte(" pour tout "), latex("x>0"), texte(", le signe de la dérivée est toujours strictement positif : "), latex("\\ln"), texte(" ne change donc jamais de sens de variation.")],
    },
    {
      enonce: [texte("La fonction "), latex("\\ln"), texte(" possède un minimum sur son domaine "), latex("]0;+\\infty["), texte(".")],
      reponse: false,
      justification: [texte("Puisque "), latex("(\\ln x)'=1/x>0"), texte(" partout sur le domaine, "), latex("\\ln"), texte(" est strictement croissante et n'atteint donc jamais de minimum (elle diverge vers "), latex("-\\infty"), texte(" en "), latex("0^+"), texte(").")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x-\\ln(x)"), texte(" (domaine "), latex("]0;+\\infty["), texte("), "), latex("f'(x)=1-\\dfrac{1}{x}"), texte(", qui s'annule exactement en "), latex("x=1"), texte(".")],
      reponse: true,
      justification: [texte("En dérivant, "), latex("f'(x)=1-1/x"), texte(" ; cette expression vaut 0 exactement quand "), latex("1/x=1"), texte(", soit "), latex("x=1"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x-\\ln(x)"), texte(", "), latex("f'(x)=1-1/x"), texte(" s'annule en "), latex("x=0"), texte(".")],
      reponse: false,
      justification: [latex("x=0"), texte(" n'est même pas dans le domaine de "), latex("f"), texte(" (qui exige "), latex("x>0"), texte(") : le point critique se trouve en "), latex("x=1"), texte(", pas en "), latex("x=0"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x-\\ln(x)"), texte(", "), latex("f'(x)<0"), texte(" sur "), latex("]0;1["), texte(" et "), latex("f'(x)>0"), texte(" sur "), latex("]1;+\\infty["), texte(", donc "), latex("f"), texte(" admet un minimum en "), latex("x=1"), texte(".")],
      reponse: true,
      justification: [texte("Sur "), latex("]0;1["), texte(", "), latex("1/x>1"), texte(" donc "), latex("f'(x)<0"), texte(" ; sur "), latex("]1;+\\infty["), texte(", "), latex("1/x<1"), texte(" donc "), latex("f'(x)>0"), texte(" : "), latex("f"), texte(" décroît puis croît, avec un minimum en "), latex("x=1"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x-\\ln(x)"), texte(", "), latex("f"), texte(" admet un MAXIMUM en "), latex("x=1"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("f"), texte(" décroît avant "), latex("x=1"), texte(" puis croît après, ce qui caractérise un MINIMUM, pas un maximum.")],
    },
    {
      enonce: [texte("La valeur minimale de "), latex("f(x)=x-\\ln(x)"), texte(" est "), latex("f(1)=1"), texte(" (car "), latex("\\ln(1)=0"), texte(").")],
      reponse: true,
      justification: [texte("En substituant "), latex("x=1"), texte(" : "), latex("f(1)=1-\\ln(1)=1-0=1"), texte(".")],
    },
    {
      enonce: [texte("La valeur minimale de "), latex("f(x)=x-\\ln(x)"), texte(" est "), latex("0"), texte(".")],
      reponse: false,
      justification: [texte("Le calcul direct donne "), latex("f(1)=1-\\ln(1)=1"), texte(", pas 0.")],
    },
    {
      enonce: [texte("Puisque "), latex("\\ln(x)"), texte(" n'est définie que pour "), latex("x>0"), texte(", le graphique de sa dérivée "), latex("f'(x)=1/x"), texte(" n'est lui non plus défini que pour "), latex("x>0"), texte(".")],
      reponse: true,
      justification: [texte("La dérivée d'une fonction ne peut être définie que là où la fonction elle-même l'est : le domaine de "), latex("f'"), texte(" ne peut jamais dépasser celui de "), latex("f"), texte(".")],
    },
    {
      enonce: [texte("On peut lire la dérivée de "), latex("\\ln"), texte(" sur un graphique pour des valeurs négatives de "), latex("x"), texte(", tout comme pour des valeurs positives.")],
      reponse: false,
      justification: [texte("C'est impossible : "), latex("\\ln"), texte(" (et donc sa dérivée) n'est définie que sur "), latex("]0;+\\infty["), texte(", jamais pour "), latex("x\\leq0"), texte(".")],
    },
    {
      enonce: [texte("Une asymptote verticale de "), latex("f"), texte(" en "), latex("x\\to0^+"), texte(" s'accompagne typiquement d'une dérivée "), latex("f'"), texte(" qui diverge elle aussi (en valeur absolue) au voisinage de ce même point.")],
      reponse: true,
      justification: [texte("Exemple avec "), latex("\\ln"), texte(" : sa dérivée "), latex("1/x"), texte(" diverge elle aussi vers "), latex("+\\infty"), texte(" quand "), latex("x\\to0^+"), texte(", en même temps que "), latex("\\ln(x)\\to-\\infty"), texte(".")],
    },
    {
      enonce: [texte("Une asymptote verticale de "), latex("f"), texte(" n'a jamais aucun effet visible sur le graphique de "), latex("f'"), texte(" au voisinage de ce point.")],
      reponse: false,
      justification: [texte("C'est faux : au voisinage d'une asymptote verticale, la pente de la courbe s'accentue généralement fortement, ce qui se traduit par une dérivée qui diverge elle aussi.")],
    },
    {
      enonce: [texte("La concavité de "), latex("f"), texte(" se lit sur le signe de "), latex("f''"), texte(", c'est-à-dire sur le fait que "), latex("f'"), texte(" elle-même soit croissante (f convexe) ou décroissante (f concave).")],
      reponse: true,
      justification: [texte("La dérivée seconde mesure la variation de la pente : si "), latex("f'"), texte(" croît, la courbe se « redresse » (convexe) ; si "), latex("f'"), texte(" décroît, elle se « creuse » (concave).")],
    },
    {
      enonce: [texte("La concavité de "), latex("f"), texte(" se lit directement sur le signe de "), latex("f'"), texte(" (et non sur le fait que "), latex("f'"), texte(" soit croissante ou décroissante).")],
      reponse: false,
      justification: [texte("C'est une confusion : le signe de "), latex("f'"), texte(" donne le sens de variation de "), latex("f"), texte(", pas sa concavité — la concavité dépend du COMPORTEMENT de "), latex("f'"), texte(" (croissante ou décroissante), soit du signe de "), latex("f''"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\ln(x)"), texte(", "), latex("f''(x)=-1/x^2"), texte(", donc "), latex("f"), texte(" est concave sur tout son domaine (le graphique de "), latex("f'=1/x"), texte(" est décroissant).")],
      reponse: true,
      justification: [texte("La dérivée seconde de "), latex("\\ln"), texte(" est strictement négative partout sur "), latex("]0;+\\infty["), texte(", ce qui signifie que sa courbe est concave, et que sa dérivée "), latex("1/x"), texte(" est bien décroissante.")],
    },
    {
      enonce: [texte("La fonction "), latex("\\ln"), texte(" est convexe sur tout son domaine.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("(\\ln x)''=-1/x^2<0"), texte(" partout sur le domaine, donc "), latex("\\ln"), texte(" est concave, pas convexe.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{k\\ln(x)}{x}"), texte(" ("), latex("x>0"), texte("), "), latex("f'(x)=\\dfrac{k(1-\\ln x)}{x^2}"), texte(", qui s'annule en "), latex("x=e"), texte(" quelle que soit la valeur de "), latex("k"), texte(".")],
      reponse: true,
      justification: [texte("La règle du quotient donne "), latex("\\dfrac{k\\cdot\\tfrac{1}{x}\\cdot x-k\\ln(x)}{x^2}=\\dfrac{k(1-\\ln x)}{x^2}"), texte(" ; "), latex("k"), texte(" étant un simple facteur, il ne déplace jamais le zéro, situé en "), latex("1-\\ln x=0"), texte(", soit "), latex("x=e"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{k\\ln(x)}{x}"), texte(", la dérivée s'obtient en dérivant séparément le numérateur et le dénominateur : "), latex("f'(x)=\\dfrac{k/x}{1}=\\dfrac{k}{x}"), texte(".")],
      reponse: false,
      justification: [texte("Un quotient ne se dérive jamais terme à terme : il faut la règle du quotient, qui donne "), latex("f'(x)=\\dfrac{k(1-\\ln x)}{x^2}"), texte(" — une expression qui, contrairement à "), latex("k/x"), texte(", change bel et bien de signe (en "), latex("x=e"), texte(").")],
    },
    {
      enonce: [texte("Passer de "), latex("f(x)=\\dfrac{k\\ln(x)}{x}"), texte(" à "), latex("f(x)=\\dfrac{k\\log_a(x)}{x}"), texte(" ne fait que multiplier la dérivée par la constante "), latex("\\dfrac{1}{\\ln(a)}"), texte(".")],
      reponse: true,
      justification: [latex("\\log_a(x)=\\ln(x)/\\ln(a)"), texte(" et "), latex("\\ln(a)"), texte(" est une constante : elle sort de la dérivation, donnant "), latex("f'(x)=\\dfrac{k(1-\\ln x)}{x^2\\ln(a)}"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{k\\log_a(x)}{x}"), texte(", le zéro de "), latex("f'"), texte(" se déplace quand on change la base "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("La base n'ajoute qu'un facteur constant "), latex("1/\\ln(a)"), texte(", qui ne peut pas annuler ni déplacer un zéro : celui-ci reste en "), latex("x=e"), texte(" pour toutes les bases.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=k\\,x\\ln(x)"), texte(" ("), latex("x>0"), texte("), "), latex("f'(x)=k(\\ln(x)+1)"), texte(", dont le zéro est toujours en "), latex("x=\\dfrac{1}{e}"), texte(", quel que soit "), latex("k"), texte(".")],
      reponse: true,
      justification: [texte("Par la règle du produit, "), latex("f'(x)=k(1\\cdot\\ln x+x\\cdot\\tfrac{1}{x})=k(\\ln x+1)"), texte(" ; "), latex("\\ln x+1=0"), texte(" donne "), latex("x=e^{-1}=1/e\\approx0{,}368"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=k\\,x\\ln(x)"), texte(", la dérivée "), latex("f'(x)=k(\\ln(x)+1)"), texte(" s'annule en "), latex("x=1"), texte(".")],
      reponse: false,
      justification: [texte("En "), latex("x=1"), texte(", "), latex("f'(1)=k(0+1)=k\\neq0"), texte(". Le zéro est en "), latex("\\ln x=-1"), texte(", soit "), latex("x=1/e"), texte(" — confusion classique avec le zéro de "), latex("\\ln"), texte(" lui-même.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=k\\,x\\ln(x)"), texte(" avec "), latex("k>0"), texte(", le graphique de "), latex("f'"), texte(" est celui d'une fonction strictement CROISSANTE, sans aucun pic.")],
      reponse: true,
      justification: [latex("f'(x)=k(\\ln x+1)"), texte(" est un logarithme translaté et dilaté : pour "), latex("k>0"), texte(", elle croît strictement sur "), latex("]0;+\\infty["), texte(" — c'est exactement la signature qui la distingue d'une dérivée « en pic ».")],
    },
    {
      enonce: [texte("La dérivée de "), latex("f(x)=\\dfrac{k\\ln(x)}{x}"), texte(" est monotone sur "), latex("]0;+\\infty["), texte(".")],
      reponse: false,
      justification: [latex("f'(x)=\\dfrac{k(1-\\ln x)}{x^2}"), texte(" a une forme « en pic » : très grande près de 0, elle décroît, s'annule en "), latex("x=e"), texte(", puis remonte vers 0 par valeurs négatives (pour "), latex("k>0"), texte(") — elle n'est donc pas monotone.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=k\\,e^x\\ln(x)"), texte(" ("), latex("x>0"), texte("), "), latex("f'(x)=k\\,e^x\\left(\\ln(x)+\\dfrac{1}{x}\\right)"), texte(".")],
      reponse: true,
      justification: [texte("Règle du produit avec "), latex("u=e^x"), texte(" ("), latex("u'=e^x"), texte(") et "), latex("v=\\ln x"), texte(" ("), latex("v'=1/x"), texte(") : "), latex("f'=k(e^x\\ln x+e^x/x)=k\\,e^x(\\ln x+1/x)"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=k\\,e^x\\ln(x)"), texte(", la dérivée ne s'annule JAMAIS et garde partout le signe de "), latex("k"), texte(", car "), latex("\\ln(x)+\\dfrac{1}{x}\\geq1>0"), texte(" sur tout "), latex("]0;+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("La fonction "), latex("g(x)=\\ln x+1/x"), texte(" a pour dérivée "), latex("\\dfrac{x-1}{x^2}"), texte(", donc un minimum en "), latex("x=1"), texte(" où "), latex("g(1)=1"), texte(" : elle ne descend jamais sous 1. Avec "), latex("e^x>0"), texte(", le signe de "), latex("f'"), texte(" est donc exactement celui de "), latex("k"), texte(".")],
    },
    {
      enonce: [texte("En dérivant "), latex("f(x)=k\\,e^x\\ln(x)"), texte(", oublier le facteur "), latex("e^x"), texte(" donne "), latex("k\\left(\\ln(x)+\\dfrac{1}{x}\\right)"), texte(", qui a le bon signe ET reproduit correctement le comportement en "), latex("+\\infty"), texte(".")],
      reponse: false,
      justification: [texte("Le signe est bien conservé, mais pas la CROISSANCE : "), latex("k(\\ln x+1/x)"), texte(" ne croît que logarithmiquement, alors que la vraie dérivée "), latex("k\\,e^x(\\ln x+1/x)"), texte(" diverge exponentiellement — sur un graphique, les deux courbes sont vite incomparables.")],
    },
    {
      enonce: [texte("Une courbe de dérivée qui CHANGE de signe en "), latex("x=1"), texte(" ne peut pas être celle de "), latex("f(x)=k\\,e^x\\ln(x)"), texte(".")],
      reponse: true,
      justification: [texte("La vraie dérivée garde partout le signe de "), latex("k"), texte(" et ne s'annule jamais : un changement de signe en "), latex("x=1"), texte(" est la signature d'une erreur de calcul (avoir dérivé "), latex("e^x"), texte(" seul, ce qui redonne "), latex("k\\,e^x\\ln(x)"), texte(", qui s'annule bien en "), latex("x=1"), texte(").")],
    },
    {
      enonce: [texte("Le zéro de "), latex("f'"), texte(" est en "), latex("x=e\\approx2{,}718"), texte(" pour "), latex("f(x)=\\dfrac{k\\ln(x)}{x}"), texte(" et en "), latex("x=\\dfrac{1}{e}\\approx0{,}368"), texte(" pour "), latex("f(x)=k\\,x\\ln(x)"), texte(" : lire la position du zéro suffit à distinguer ces deux familles.")],
      reponse: true,
      justification: [texte("Ces deux positions sont des invariants, indépendants de "), latex("k"), texte(" : elles se situent de part et d'autre de "), latex("x=1"), texte(", ce qui les rend immédiatement discernables sur un graphique.")],
    },
    {
      enonce: [texte("Le graphique de "), latex("f'"), texte(" permet de lire directement les VALEURS de "), latex("f"), texte(", par exemple "), latex("f(1)"), texte(".")],
      reponse: false,
      justification: [texte("Il ne renseigne que sur le sens de variation et la position des extremums. Deux fonctions différant d'une constante ont exactement la même dérivée : une valeur en un point est une information supplémentaire, jamais lisible sur "), latex("f'"), texte(" seule.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{k\\ln(x)}{x}"), texte(" avec "), latex("k>0"), texte(", "), latex("\\lim_{x\\to+\\infty}f'(x)=-\\infty"), texte(".")],
      reponse: false,
      justification: [latex("f'(x)=\\dfrac{k(1-\\ln x)}{x^2}"), texte(" : le "), latex("x^2"), texte(" du dénominateur domine largement le "), latex("\\ln x"), texte(" du numérateur (croissance comparée), donc "), latex("f'(x)\\to0"), texte(" — par valeurs NÉGATIVES, mais vers 0, jamais vers "), latex("-\\infty"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 9 — Étudier une fonction (synthèse, logarithmes), ref 6gen21
  // ==========================================================================
  etudeFonctionLogarithme: [
    {
      enonce: [texte("Une étude complète de "), latex("f(x)=\\ln(x)"), texte(" commence par déterminer son domaine de définition, "), latex("]0;+\\infty["), texte(".")],
      reponse: true,
      justification: [texte("Déterminer le domaine est toujours la première étape d'une étude de fonction — ici, un argument de logarithme doit rester strictement positif.")],
    },
    {
      enonce: [texte("Le domaine de définition de "), latex("f(x)=\\ln(x)"), texte(" est "), latex("\\mathbb{R}"), texte(".")],
      reponse: false,
      justification: [texte("Le domaine de "), latex("\\ln"), texte(" est "), latex("]0;+\\infty["), texte(", pas "), latex("\\mathbb{R}"), texte(" tout entier.")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+}\\ln(x)=-\\infty"), texte(", ce qui donne au graphique de "), latex("\\ln"), texte(" une asymptote verticale "), latex("x=0"), texte(".")],
      reponse: true,
      justification: [texte("La divergence de "), latex("\\ln"), texte(" en "), latex("0^+"), texte(" se traduit graphiquement par une asymptote verticale d'équation "), latex("x=0"), texte(".")],
    },
    {
      enonce: [texte("Le graphique de "), latex("\\ln"), texte(" possède une asymptote horizontale.")],
      reponse: false,
      justification: [texte("Puisque "), latex("\\lim_{x\\to+\\infty}\\ln(x)=+\\infty"), texte(" (pas une valeur finie), "), latex("\\ln"), texte(" ne possède aucune asymptote horizontale.")],
    },
    {
      enonce: [latex("\\ln"), texte(" est strictement croissante sur tout son domaine.")],
      reponse: true,
      justification: [texte("La dérivée de "), latex("\\ln"), texte(" est strictement positive sur tout le domaine : la fonction est donc strictement croissante partout où elle est définie.")],
    },
    {
      enonce: [latex("\\ln"), texte(" possède un extremum local sur son domaine.")],
      reponse: false,
      justification: [texte("Puisque "), latex("\\ln"), texte(" est strictement monotone (toujours croissante) sur tout son domaine, elle ne peut avoir aucun extremum local.")],
    },
    {
      enonce: [latex("\\ln"), texte(" est concave sur tout son domaine.")],
      reponse: true,
      justification: [texte("La dérivée seconde de "), latex("\\ln"), texte(" est strictement négative partout : sa courbe est donc concave sur tout le domaine.")],
    },
    {
      enonce: [latex("\\ln"), texte(" est convexe sur tout son domaine.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("(\\ln x)''=-1/x^2<0"), texte(" partout, donc "), latex("\\ln"), texte(" est concave, pas convexe.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(" (domaine "), latex("x>0"), texte("), "), latex("f'(x)=\\dfrac{1-\\ln(x)}{x^2}"), texte(".")],
      reponse: true,
      justification: [texte("Par la règle du quotient : "), latex("f'(x)=\\dfrac{(1/x)\\cdot x-\\ln(x)\\cdot1}{x^2}=\\dfrac{1-\\ln(x)}{x^2}"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", "), latex("f'(x)=\\dfrac{1}{x^2}-\\ln(x)"), texte(".")],
      reponse: false,
      justification: [texte("La règle du quotient donne "), latex("f'(x)=(1-\\ln(x))/x^2"), texte(", et non pas cette expression obtenue en dérivant les deux termes séparément à tort.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", le point critique (où "), latex("f'=0"), texte(") est "), latex("x=e"), texte(".")],
      reponse: true,
      justification: [texte("Il faut "), latex("1-\\ln(x)=0"), texte(", soit "), latex("\\ln(x)=1"), texte(", soit "), latex("x=e"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", le point critique est "), latex("x=1"), texte(".")],
      reponse: false,
      justification: [texte("Résoudre "), latex("1-\\ln(x)=0"), texte(" donne "), latex("x=e"), texte(", pas "), latex("x=1"), texte(" (qui annulerait plutôt "), latex("\\ln(x)"), texte(" lui-même, pas "), latex("1-\\ln(x)"), texte(").")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", ce point critique "), latex("x=e"), texte(" correspond à un MAXIMUM, avec "), latex("f(e)=1/e"), texte(".")],
      reponse: true,
      justification: [texte("Le signe de "), latex("f'"), texte(" passe de positif ("), latex("x<e"), texte(") à négatif ("), latex("x>e"), texte(") : c'est un maximum, et "), latex("f(e)=\\ln(e)/e=1/e"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", le point critique "), latex("x=e"), texte(" correspond à un MINIMUM.")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("f"), texte(" croît avant "), latex("x=e"), texte(" puis décroît après, ce qui caractérise un maximum, pas un minimum.")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x}=0"), texte(", ce qui donne au graphique de "), latex("f(x)=\\ln(x)/x"), texte(" une asymptote horizontale "), latex("y=0"), texte(" en "), latex("+\\infty"), texte(".")],
      reponse: true,
      justification: [texte("C'est la croissance comparée : "), latex("\\ln(x)"), texte(" est dominé par "), latex("x"), texte(", donc leur quotient tend vers 0, ce qui définit une asymptote horizontale "), latex("y=0"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x}=+\\infty"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : cette limite vaut 0 (croissance comparée), pas "), latex("+\\infty"), texte(".")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+}\\dfrac{\\ln(x)}{x}=-\\infty"), texte(", ce qui donne au graphique de "), latex("f(x)=\\ln(x)/x"), texte(" une asymptote verticale "), latex("x=0"), texte(".")],
      reponse: true,
      justification: [texte("En "), latex("0^+"), texte(", "), latex("\\ln(x)\\to-\\infty"), texte(" tandis que "), latex("x\\to0^+"), texte(" : le quotient diverge vers "), latex("-\\infty"), texte(", d'où l'asymptote verticale.")],
    },
    {
      enonce: [latex("\\lim_{x\\to0^+}\\dfrac{\\ln(x)}{x}"), texte(" est une valeur finie.")],
      reponse: false,
      justification: [texte("Cette limite diverge vers "), latex("-\\infty"), texte(", elle n'est donc pas finie.")],
    },
    {
      enonce: [texte("Une étude complète d'une fonction combinant un logarithme et une expression rationnelle doit déterminer À LA FOIS les restrictions imposées par le logarithme ET celles imposées par un éventuel dénominateur.")],
      reponse: true,
      justification: [texte("Chaque source de restriction (argument de logarithme positif, dénominateur non nul) doit être prise en compte : le domaine final est l'intersection de toutes ces conditions.")],
    },
    {
      enonce: [texte("Une fois la restriction de domaine due au logarithme trouvée, aucune autre restriction (comme un dénominateur) n'a besoin d'être vérifiée.")],
      reponse: false,
      justification: [texte("C'est faux : chaque source de restriction potentielle (logarithme, dénominateur, racine...) doit être examinée séparément, puis toutes combinées par intersection.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{ax}"), texte(" ("), latex("x>0"), texte(", "), latex("a>0"), texte("), "), latex("\\lim_{x\\to0^+}f(x)=1"), texte(" — ce n'est PAS une asymptote, seulement une valeur finie au bord du domaine.")],
      reponse: true,
      justification: [texte("En écrivant "), latex("f(x)=e^{a x\\ln(x)}"), texte(", l'exposant "), latex("a x\\ln(x)\\to0"), texte(" (croissance comparée), donc "), latex("f(x)\\to e^0=1"), texte(". Une asymptote horizontale décrit un comportement à l'INFINI, jamais au bord d'un domaine.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{ax}"), texte(", la limite finie 1 en "), latex("0^+"), texte(" signale une asymptote horizontale.")],
      reponse: false,
      justification: [texte("Une asymptote horizontale est une limite finie en "), latex("+\\infty"), texte(" ou "), latex("-\\infty"), texte(". Ici la limite est prise en "), latex("0^+"), texte(", au bord du domaine : cette fonction ne possède AUCUNE asymptote.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{ax}"), texte(", la position du minimum dépend de la valeur de "), latex("a"), texte(".")],
      reponse: false,
      justification: [texte("L'exposant "), latex("a x\\ln(x)"), texte(" a pour dérivée "), latex("a(\\ln x+1)"), texte(", qui s'annule en "), latex("x=1/e"), texte(" — le facteur "), latex("a>0"), texte(" se simplifie : le minimum est TOUJOURS en "), latex("x=1/e"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{k/x}"), texte(" ("), latex("x>0"), texte("), la droite "), latex("y=1"), texte(" est asymptote horizontale en "), latex("+\\infty"), texte(", quelle que soit la valeur de "), latex("k"), texte(".")],
      reponse: true,
      justification: [latex("f(x)=e^{(k/x)\\ln(x)}"), texte(" et "), latex("\\dfrac{k\\ln(x)}{x}\\to0"), texte(" en "), latex("+\\infty"), texte(" (croissance comparée), quel que soit "), latex("k"), texte(" : "), latex("f(x)\\to e^0=1"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{k/x}"), texte(", l'extremum est toujours en "), latex("x=e"), texte(" : un maximum si "), latex("k>0"), texte(", un minimum si "), latex("k<0"), texte(".")],
      reponse: true,
      justification: [texte("L'exposant "), latex("\\dfrac{k\\ln(x)}{x}"), texte(" a pour dérivée "), latex("\\dfrac{k(1-\\ln x)}{x^2}"), texte(", nulle en "), latex("x=e"), texte(" quel que soit "), latex("k"), texte(" ; c'est le SIGNE de "), latex("k"), texte(" qui décide s'il s'agit d'un maximum ou d'un minimum.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x^{k/x}"), texte(", "), latex("\\lim_{x\\to0^+}f(x)=0"), texte(" quel que soit le signe de "), latex("k"), texte(".")],
      reponse: false,
      justification: [texte("L'exposant "), latex("\\dfrac{k\\ln(x)}{x}"), texte(" tend vers "), latex("-\\infty"), texte(" si "), latex("k>0"), texte(" (d'où "), latex("f\\to0"), texte(") mais vers "), latex("+\\infty"), texte(" si "), latex("k<0"), texte(" (d'où "), latex("f\\to+\\infty"), texte(", et une asymptote verticale "), latex("x=0"), texte(").")],
    },
    {
      enonce: [texte("Le domaine de "), latex("f(x)=\\ln|k^2-x^2|"), texte(" ("), latex("k>0"), texte(") est "), latex("\\mathbb{R}\\setminus\\{-k;k\\}"), texte(" — la valeur absolue ÉLARGIT le domaine par rapport à "), latex("\\ln(k^2-x^2)"), texte(", qui n'existerait que sur "), latex("]-k;k["), texte(".")],
      reponse: true,
      justification: [latex("|k^2-x^2|>0"), texte(" dès que "), latex("x\\neq\\pm k"), texte(" : le domaine compte TROIS branches. Sans la valeur absolue, il faudrait "), latex("k^2-x^2>0"), texte(", soit le seul intervalle "), latex("]-k;k["), texte(".")],
    },
    {
      enonce: [texte("Le domaine de "), latex("f(x)=\\ln|k^2-x^2|"), texte(" ("), latex("k>0"), texte(") est "), latex("]-k;k["), texte(".")],
      reponse: false,
      justification: [texte("C'est le domaine de "), latex("\\ln(k^2-x^2)"), texte(" SANS valeur absolue. Avec la valeur absolue, le domaine s'élargit à "), latex("\\mathbb{R}\\setminus\\{-k;k\\}"), texte(" — piège classique.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=x\\ln(x)"), texte(", "), latex("\\lim_{x\\to0^+}f(x)=0"), texte(" : le graphique ne possède pas d'asymptote verticale en "), latex("x=0"), texte(".")],
      reponse: true,
      justification: [texte("Croissance comparée : le facteur "), latex("x\\to0"), texte(" l'emporte sur "), latex("\\ln(x)\\to-\\infty"), texte(". Une limite finie au bord du domaine n'est pas une asymptote.")],
    },
    {
      enonce: [texte("Le graphique de "), latex("f(x)=\\ln(x-2)"), texte(" admet l'asymptote verticale "), latex("x=0"), texte(".")],
      reponse: false,
      justification: [texte("L'argument "), latex("x-2"), texte(" s'annule en "), latex("x=2"), texte(" : l'asymptote verticale est "), latex("x=2"), texte(", au bord du domaine "), latex("]2;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Le graphique de "), latex("f(x)=\\ln(x^2+1)"), texte(" est symétrique par rapport à l'axe des ordonnées.")],
      reponse: true,
      justification: [latex("f(-x)=\\ln((-x)^2+1)=f(x)"), texte(" : la fonction est paire.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", "), latex("f(x)>0"), texte(" pour tout "), latex("x>0"), texte(".")],
      reponse: false,
      justification: [texte("Sur "), latex("]0;1["), texte(", "), latex("\\ln(x)<0"), texte(" et "), latex("x>0"), texte(" : le quotient est négatif. "), latex("f"), texte(" n'est positive que sur "), latex("]1;+\\infty["), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\dfrac{\\ln(x)}{x}"), texte(", le graphique coupe l'axe des abscisses uniquement en "), latex("x=1"), texte(".")],
      reponse: true,
      justification: [texte("Un quotient est nul quand son numérateur l'est : "), latex("\\ln(x)=0"), texte(" donne "), latex("x=1"), texte(", qui est bien dans le domaine.")],
    },
    {
      enonce: [texte("Pour "), latex("f(x)=\\ln(x)-x"), texte(", le maximum est atteint en "), latex("x=1"), texte(".")],
      reponse: true,
      justification: [latex("f'(x)=\\dfrac{1}{x}-1"), texte(" est positive sur "), latex("]0;1["), texte(" et négative sur "), latex("]1;+\\infty["), texte(" : maximum en "), latex("x=1"), texte(", de valeur "), latex("-1"), texte(".")],
    },
    {
      enonce: [texte("Le graphique de "), latex("f(x)=\\ln(x^2+1)"), texte(" admet une asymptote verticale.")],
      reponse: false,
      justification: [latex("x^2+1\\geq1>0"), texte(" pour tout réel : le domaine est "), latex("\\mathbb{R}"), texte(" tout entier, l'argument ne s'annule jamais, il n'y a aucune asymptote verticale.")],
    },
  ],

  // ==========================================================================
  // Thème 10 — Logarithmes : problèmes, ref 6gen22
  // ==========================================================================
  logarithmesProblemes: [
    {
      enonce: [texte("Une échelle logarithmique de la forme "), latex("L=a\\cdot\\log_{10}(X)+b"), texte(" modélise des phénomènes comme la magnitude de Richter, le niveau sonore en décibels, ou le pH, où "), latex("X"), texte(" désigne la grandeur physique sous-jacente.")],
      reponse: true,
      justification: [texte("C'est le modèle général d'échelle logarithmique utilisé pour ce type de phénomène : une grandeur variant sur plusieurs ordres de grandeur est ainsi ramenée à une échelle plus lisible.")],
    },
    {
      enonce: [texte("Sur une échelle logarithmique "), latex("L=a\\cdot\\log_{10}(X)+b"), texte(", doubler "), latex("X"), texte(" double toujours "), latex("L"), texte(".")],
      reponse: false,
      justification: [texte("C'est une confusion entre échelle linéaire et échelle logarithmique : sur une échelle logarithmique, multiplier "), latex("X"), texte(" par un facteur modifie "), latex("L"), texte(" de façon ADDITIVE, jamais en le multipliant lui-même.")],
    },
    {
      enonce: [texte("Sur une échelle logarithmique, multiplier "), latex("X"), texte(" par un facteur "), latex("k"), texte(" modifie "), latex("L"), texte(" de façon ADDITIVE : "), latex("\\Delta L = a\\cdot\\log_{10}(k)"), texte(", et non de façon multiplicative.")],
      reponse: true,
      justification: [texte("C'est la propriété d'échelle caractéristique d'un modèle logarithmique : un facteur multiplicatif sur "), latex("X"), texte(" se traduit par un ÉCART additif sur "), latex("L"), texte(", jamais par un facteur multiplicatif sur "), latex("L"), texte(" lui-même.")],
    },
    {
      enonce: [texte("Sur une échelle logarithmique, multiplier "), latex("X"), texte(" par un facteur "), latex("k"), texte(" multiplie "), latex("L"), texte(" par ce même facteur "), latex("k"), texte(".")],
      reponse: false,
      justification: [texte("C'est faux : un facteur multiplicatif sur "), latex("X"), texte(" se traduit par un écart ADDITIF sur "), latex("L"), texte(" ("), latex("\\Delta L=a\\log_{10}(k)"), texte("), pas par une multiplication de "), latex("L"), texte(".")],
    },
    {
      enonce: [texte("Deux valeurs "), latex("L_1"), texte(" et "), latex("L_2"), texte(" venant de deux sources séparées, une fois combinées, ne donnent PAS simplement "), latex("L_{total}=L_1+L_2"), texte(" en général.")],
      reponse: true,
      justification: [texte("Une échelle logarithmique n'est pas additive : il faut d'abord reconvertir "), latex("L_1"), texte(" et "), latex("L_2"), texte(" en valeurs physiques "), latex("X_1"), texte(", "), latex("X_2"), texte(", les additionner, PUIS reconvertir le résultat en échelle logarithmique.")],
    },
    {
      enonce: [texte("En combinant deux sources sur une échelle logarithmique, le résultat vaut toujours "), latex("L_1+L_2"), texte(".")],
      reponse: false,
      justification: [texte("C'est le piège classique de ce type de problème : l'échelle logarithmique n'étant pas additive, il faut repasser par les grandeurs physiques "), latex("X_1"), texte(", "), latex("X_2"), texte(" avant de combiner, jamais additionner "), latex("L_1"), texte(" et "), latex("L_2"), texte(" directement.")],
    },
    {
      enonce: [texte("Le pH d'une solution est une échelle logarithmique liée à la concentration en ions "), latex("H^+"), texte(".")],
      reponse: true,
      justification: [texte("Le pH est défini à partir du logarithme (décimal) de la concentration en ions "), latex("H^+"), texte(" — c'est l'exemple canonique d'échelle logarithmique en chimie.")],
    },
    {
      enonce: [texte("Le pH d'une solution est directement proportionnel (de façon linéaire, sans aucun logarithme) à la concentration en ions "), latex("H^+"), texte(".")],
      reponse: false,
      justification: [texte("C'est faux : le pH est justement défini via un LOGARITHME de la concentration, pas une simple proportionnalité linéaire — c'est ce qui permet de représenter des concentrations variant sur plusieurs ordres de grandeur.")],
    },
    {
      enonce: [texte("La magnitude de Richter d'un séisme est une échelle logarithmique liée à l'énergie libérée.")],
      reponse: true,
      justification: [texte("C'est l'exemple canonique en sismologie : chaque unité de magnitude supplémentaire correspond à une énergie libérée multipliée par un facteur fixe, signature d'une échelle logarithmique.")],
    },
    {
      enonce: [texte("La magnitude de Richter est une échelle linéaire de l'énergie libérée.")],
      reponse: false,
      justification: [texte("C'est faux : c'est précisément parce que l'énergie libérée varie énormément d'un séisme à l'autre qu'une échelle LOGARITHMIQUE (et non linéaire) est utilisée.")],
    },
    {
      enonce: [texte("Un modèle de décroissance radioactive peut s'écrire "), latex("N(t)=N_0\\cdot e^{-\\lambda t}"), texte(", où "), latex("\\lambda"), texte(" est la constante de désintégration et "), latex("N_0"), texte(" la quantité initiale.")],
      reponse: true,
      justification: [texte("C'est le modèle standard de décroissance exponentielle radioactive, avec un exposant NÉGATIF puisque la quantité décroît au cours du temps.")],
    },
    {
      enonce: [texte("Un modèle de décroissance radioactive utilise toujours un exposant positif, "), latex("N(t)=N_0\\cdot e^{+\\lambda t}"), texte(" avec "), latex("\\lambda>0"), texte(".")],
      reponse: false,
      justification: [texte("Un exposant positif décrirait une CROISSANCE, pas une décroissance. Le modèle correct pour une décroissance radioactive utilise un exposant négatif, "), latex("N(t)=N_0\\cdot e^{-\\lambda t}"), texte(".")],
    },
    {
      enonce: [texte("Retrouver la demi-vie "), latex("T"), texte(" d'une substance radioactive à partir de sa constante de désintégration "), latex("\\lambda"), texte(" nécessite de résoudre "), latex("N_0\\cdot e^{-\\lambda T}=N_0/2"), texte(", ce qui passe par un logarithme.")],
      reponse: true,
      justification: [texte("En simplifiant par "), latex("N_0"), texte(" puis en prenant le logarithme népérien des deux membres, on obtient "), latex("-\\lambda T=\\ln(1/2)"), texte(", donc "), latex("T=\\dfrac{\\ln(2)}{\\lambda}"), texte(" — un logarithme est indispensable ici.")],
    },
    {
      enonce: [texte("La demi-vie d'une substance radioactive peut se retrouver depuis "), latex("\\lambda"), texte(" sans jamais utiliser de logarithme, par un calcul purement algébrique.")],
      reponse: false,
      justification: [texte("C'est faux : isoler "), latex("T"), texte(" dans "), latex("e^{-\\lambda T}=1/2"), texte(" exige de prendre un logarithme des deux membres — c'est incontournable dans ce modèle exponentiel.")],
    },
    {
      enonce: [texte("Pour une substance de demi-vie "), latex("T"), texte(", il reste un quart de la quantité initiale après une durée "), latex("2T"), texte(".")],
      reponse: true,
      justification: [texte("Après "), latex("T"), texte(", il reste la moitié ; après une seconde demi-vie, la moitié de la moitié : "), latex("\\tfrac{1}{2}\\cdot\\tfrac{1}{2}=\\tfrac{1}{4}"), texte(".")],
    },
    {
      enonce: [texte("La demi-vie d'une substance radioactive dépend de la quantité initiale "), latex("N_0"), texte(".")],
      reponse: false,
      justification: [latex("T=\\dfrac{\\ln(2)}{\\lambda}"), texte(" : "), latex("N_0"), texte(" se simplifie dans "), latex("N_0e^{-\\lambda T}=N_0/2"), texte(". La demi-vie ne dépend que de "), latex("\\lambda"), texte(".")],
    },
    {
      enonce: [texte("Dans un modèle de croissance logistique "), latex("y(t)=\\dfrac{k}{1+a\\cdot e^{-rt}}"), texte(", la croissance la plus rapide (point d'inflexion) se produit exactement quand "), latex("y(t)=k/2"), texte(".")],
      reponse: true,
      justification: [texte("C'est une propriété caractéristique de la courbe logistique : elle est symétrique autour de son point d'inflexion, situé exactement à mi-hauteur de la capacité limite "), latex("k"), texte(".")],
    },
    {
      enonce: [texte("Dans un modèle de croissance logistique, la croissance la plus rapide se produit quand "), latex("y(t)=k"), texte(".")],
      reponse: false,
      justification: [texte("En "), latex("y(t)=k"), texte(", la courbe logistique s'aplatit au contraire (elle approche son asymptote) : la croissance y est minimale, pas maximale. Le point de croissance maximale est à "), latex("y(t)=k/2"), texte(".")],
    },
    {
      enonce: [texte("Dans un modèle de croissance logistique "), latex("y(t)=\\dfrac{k}{1+a\\cdot e^{-rt}}"), texte(" avec "), latex("r>0"), texte(", "), latex("\\lim_{t\\to+\\infty}y(t)=k"), texte(" (capacité limite).")],
      reponse: true,
      justification: [texte("Quand "), latex("t\\to+\\infty"), texte(" avec "), latex("r>0"), texte(", "), latex("e^{-rt}\\to0"), texte(", donc le dénominateur tend vers 1 et "), latex("y(t)\\to k"), texte(".")],
    },
    {
      enonce: [texte("Dans un modèle de croissance logistique, "), latex("y(t)"), texte(" croît indéfiniment sans jamais se stabiliser quand "), latex("t\\to+\\infty"), texte(".")],
      reponse: false,
      justification: [texte("C'est justement la différence entre croissance logistique et croissance exponentielle pure : la croissance logistique se STABILISE vers une capacité limite finie "), latex("k"), texte(", elle ne diverge jamais.")],
    },
    {
      enonce: [texte("Si la concentration en ions "), latex("H^+"), texte(" est multipliée par 10, le pH DIMINUE de 1.")],
      reponse: true,
      justification: [latex("pH=-\\log_{10}([H^+])"), texte(", donc "), latex("-\\log_{10}(10\\cdot[H^+])=-(1+\\log_{10}([H^+]))=pH-1"), texte(" : la solution devient plus acide, d'exactement une unité.")],
    },
    {
      enonce: [texte("Si la concentration en ions "), latex("H^+"), texte(" est multipliée par 10, le pH est lui aussi multiplié par 10.")],
      reponse: false,
      justification: [texte("Sur une échelle logarithmique, un facteur multiplicatif sur la grandeur physique produit un effet ADDITIF sur l'échelle : le pH diminue de 1, il n'est jamais multiplié.")],
    },
    {
      enonce: [texte("Quand l'inconnue est le TAUX (la base) et non le temps (l'exposant) — "), latex("Q_0(1+i)^n=\\text{cible}"), texte(" —, la résolution passe par une racine "), latex("n"), texte("-ième, "), latex("i=\\left(\\dfrac{\\text{cible}}{Q_0}\\right)^{1/n}-1"), texte(", sans aucun logarithme.")],
      reponse: true,
      justification: [texte("Le logarithme sert à faire DESCENDRE une inconnue coincée dans un exposant. Ici l'exposant "), latex("n"), texte(" est connu et l'inconnue est la base : une racine "), latex("n"), texte("-ième suffit, c'est le contraste explicite avec le cas « résoudre pour "), latex("t"), texte(" ».")],
    },
    {
      enonce: [texte("À la question « au bout de combien de PÉRIODES la quantité dépasse-t-elle le seuil ? », la réponse est le nombre entier obtenu en arrondissant AU-DESSUS la solution continue "), latex("t"), texte(".")],
      reponse: true,
      justification: [texte("La solution continue "), latex("t"), texte(" est l'instant exact où le seuil est atteint : la première période ENTIÈRE où il est dépassé est donc l'entier immédiatement supérieur.")],
    },
    {
      enonce: [texte("Le temps obtenu par logarithme dans "), latex("Q_0 r^t=\\text{cible}"), texte(" doit être arrondi vers le BAS pour répondre à « combien de périodes faut-il pour dépasser le seuil ? ».")],
      reponse: false,
      justification: [texte("Arrondir vers le bas donnerait une période où le seuil n'est PAS encore atteint : il faut arrondir au-dessus.")],
    },
    {
      enonce: [texte("Dans "), latex("Q_0\\,e^{-kh}=0{,}75\\,Q_0"), texte(", il faut connaître "), latex("Q_0"), texte(" pour déterminer "), latex("k"), texte(".")],
      reponse: false,
      justification: [latex("Q_0"), texte(" se simplifie des deux côtés : il reste "), latex("e^{-kh}=0{,}75"), texte(", d'où "), latex("k=\\dfrac{-\\ln(0{,}75)}{h}"), texte(" — la quantité initiale n'intervient jamais dans le taux.")],
    },
    {
      enonce: [texte("Connaissant deux points "), latex("(t_1;v_1)"), texte(" et "), latex("(t_2;v_2)"), texte(" d'un modèle "), latex("Q_0 r^t"), texte(", on obtient d'abord "), latex("r=\\left(\\dfrac{v_2}{v_1}\\right)^{1/(t_2-t_1)}"), texte(", puis "), latex("Q_0=\\dfrac{v_1}{r^{t_1}}"), texte(".")],
      reponse: true,
      justification: [texte("Le quotient des deux équations élimine "), latex("Q_0"), texte(" et donne "), latex("v_2/v_1=r^{t_2-t_1}"), texte(" ; une fois "), latex("r"), texte(" connu, n'importe laquelle des deux équations redonne "), latex("Q_0"), texte(".")],
    },
    {
      enonce: [texte("Le temps supplémentaire nécessaire pour qu'une quantité suivant "), latex("Q_0 r^t"), texte(" soit multipliée par "), latex("k"), texte(" vaut "), latex("\\log_r(k)"), texte(", indépendamment de l'instant de départ choisi.")],
      reponse: true,
      justification: [latex("Q_0 r^{t}=k\\cdot Q_0 r^{t_{\\text{ref}}}"), texte(" donne "), latex("r^{t-t_{\\text{ref}}}=k"), texte(", donc "), latex("t=t_{\\text{ref}}+\\log_r(k)"), texte(" : l'ÉCART ne dépend que de "), latex("k"), texte(" et de "), latex("r"), texte(", c'est la signature d'une croissance exponentielle.")],
    },
    {
      enonce: [texte("Pour une décroissance radioactive de demi-vie "), latex("T"), texte(", le temps au bout duquel il reste la fraction "), latex("f"), texte(" vaut "), latex("t=\\dfrac{-T\\ln(f)}{\\ln(2)}"), texte(".")],
      reponse: true,
      justification: [texte("De "), latex("T=\\ln(2)/\\lambda"), texte(" on tire "), latex("\\lambda=\\ln(2)/T"), texte(" ; puis "), latex("e^{-\\lambda t}=f"), texte(" donne "), latex("t=\\dfrac{-\\ln(f)}{\\lambda}=\\dfrac{-T\\ln(f)}{\\ln(2)}"), texte(" (positif, puisque "), latex("0<f<1"), texte(").")],
    },
    {
      enonce: [texte("Si le pH d'une solution passe de 3 à 5, sa concentration en ions "), latex("H^+"), texte(" est divisée par 2.")],
      reponse: false,
      justification: [latex("pH=-\\log_{10}([H^+])"), texte(" : 2 unités de pH en plus correspondent à une concentration divisée par "), latex("10^2=100"), texte(", pas par 2.")],
    },
    {
      enonce: [texte("Pour combiner deux niveaux sonores "), latex("L_1"), texte(" et "), latex("L_2"), texte(" venant de deux sources distinctes, il faut prendre leur moyenne "), latex("\\dfrac{L_1+L_2}{2}"), texte(".")],
      reponse: false,
      justification: [texte("Une échelle logarithmique n'est ni additive ni « moyennable » : il faut reconvertir chaque niveau en grandeur physique ("), latex("X_1"), texte(", "), latex("X_2"), texte("), les ADDITIONNER, puis reconvertir : "), latex("L=a\\log_{10}(X_1+X_2)+b"), texte(".")],
    },
    {
      enonce: [texte("Dans le modèle logistique "), latex("y(t)=\\dfrac{k}{1+a\\,e^{-rt}}"), texte(", l'instant de croissance maximale vaut "), latex("t=\\dfrac{\\ln(a)}{r}"), texte(".")],
      reponse: true,
      justification: [texte("La croissance est maximale en "), latex("y=k/2"), texte(", donc quand "), latex("1+a\\,e^{-rt}=2"), texte(", soit "), latex("a\\,e^{-rt}=1"), texte(", soit "), latex("e^{rt}=a"), texte(" : "), latex("t=\\ln(a)/r"), texte(".")],
    },
    {
      enonce: [texte("Dans le modèle logistique "), latex("y(t)=\\dfrac{k}{1+a\\,e^{-rt}}"), texte(", le paramètre "), latex("a"), texte(" est la valeur initiale "), latex("y(0)"), texte(".")],
      reponse: false,
      justification: [latex("y(0)=\\dfrac{k}{1+a}"), texte(" : le paramètre "), latex("a"), texte(" se retrouve depuis la valeur initiale par "), latex("a=\\dfrac{k}{y(0)}-1"), texte(", jamais directement.")],
    },
    {
      enonce: [texte("Sur l'échelle des décibels "), latex("L=10\\log_{10}\\!\\left(\\dfrac{I}{I_0}\\right)"), texte(", multiplier l'intensité "), latex("I"), texte(" par 100 augmente le niveau de 20 dB.")],
      reponse: true,
      justification: [latex("\\Delta L=10\\log_{10}(100)=10\\times2=20"), texte(" dB : un facteur multiplicatif sur "), latex("I"), texte(" devient un écart additif sur "), latex("L"), texte(".")],
    },
    {
      enonce: [texte("Dans le modèle logistique "), latex("y(t)=\\dfrac{k}{1+a\\,e^{-rt}}"), texte(" ("), latex("a>0"), texte(", "), latex("r>0"), texte("), "), latex("y(t)"), texte(" finit par dépasser "), latex("k"), texte(".")],
      reponse: false,
      justification: [texte("Le dénominateur "), latex("1+a\\,e^{-rt}"), texte(" reste strictement supérieur à 1 : "), latex("y(t)<k"), texte(" pour tout "), latex("t"), texte(". La capacité limite "), latex("k"), texte(" est approchée, jamais dépassée.")],
    },
  ],
};
